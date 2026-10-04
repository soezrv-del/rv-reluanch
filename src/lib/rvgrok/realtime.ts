import {
  DEFAULT_VOICE,
  PCM_SAMPLE_RATE,
  XAI_REALTIME_URL,
  base64ToArrayBuffer,
  fetchEphemeralToken,
  takeTokenStandingLessons,
  takeTokenVisitorMemory,
  floatTo16BitPCM,
  resampleFloat32,
} from "./voice";
import {
  beginLiveVoiceFromUserGesture,
  buildRealtimeSessionUpdate,
  createLiveAudioContext,
  buildSessionIntroResponse,
  getRetainedLiveCapture,
  isNativeRealtimeTool,
  LOT_FEATURE_WEB_CLAUSE,
  releaseLiveCapture,
  retainLiveCapture,
  type LiveVoicePrewarm,
} from "./liveVoice";
import type { ActiveCoach } from "../rv/activeCoach";
import { parseCoachFromText } from "./parseCoach";
import { ensureCatalogLoaded } from "../rv/catalogLoad";
import {
  looksLikeDeskSheetAsk,
  markDeskGapsSearching,
  resolveDeskSheet,
  resolveDeskSheetThenFallback,
  type DeskSheetPayload,
} from "./deskSheet";
import { buildChatGrounding, namedCoachConflictsLock } from "./grounding";
import {
  isRoutedChatScreen,
  onActiveScreenChange,
  routeScreenChatNote,
} from "./screenContext";
import {
  SCREEN_CALLOUT_DEBOUNCE_MS,
  initialScreenCalloutState,
  planCalloutDelivery,
  reduceScreenCallout,
  screenCalloutSpeechInstructions,
  type ScreenCalloutEvent,
  type ScreenCalloutState,
} from "./screenGuides";
import { liveVoiceOutputFor, nativeShellLeavesMicHardwareOn, resumeLiveVoiceSpeaker, setSpeakingSession } from "./voiceOutput";
import {
  PCM_CAPTURE_PROCESSOR,
  createBufferSourcePlayer,
  createWorkletPlayer,
  ensurePcmWorklet,
  pcm16ToFloat32,
  type LivePcmPlayer,
} from "./pcmWorklet";
import { looksLikeCompanyOrPlantAsk } from "./webIntent";
import { looksLikeCoachReportAsk } from "./coachReport";
import { looksLikeRepairQuestion, REPAIR_VOICE_PLAYBOOK } from "./repairMode";
import {
  decideVoiceWebResearch,
  fetchVoiceWebResearchNotes,
  formatVoiceWebSearchInjection,
  VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
} from "./voiceWeb";
import {
  classifyVoiceCoachDepth,
  classifyVoiceExtraPick,
  formatVoiceQuickOverview,
  formatVoiceSpecEngineSpeech,
  looksLikeExplicitVoiceReportAsk,
  looksLikeVoiceCoachOrSpecAsk,
  looksLikeVoiceTellMeAboutAsk,
  catalogQueryForFollowUp,
  looksLikeFloorplanOnlyPick,
  looksLikeVoiceFieldOrMetaAsk,
  shouldSpeakVoiceCoachChoice,
  VOICE_COACH_CHOICE_INSTRUCTIONS,
  VOICE_SPEC_ENGINE_INSTRUCTIONS,
  voiceDepthAlreadyChosen,
  withVoiceSpecExtras,
} from "./voiceSpecTurn";
import {
  looksLikeOwnLotFollowUp,
  looksLikeOwnLotStockQuestion,
  ownLotVoiceCoachLock,
} from "./ownLotAsk";
import type { LotMemory } from "./lotMemory";
import {
  isIgnorableVoiceTranscript,
  isSameLotLine,
  lotSummaryForSpeech,
  NAME_ROSTER_SPEAK,
  lotLineWithDetailsAsk,
  reduceToolSpeak,
  repeatsLotLine,
  initialToolSpeakGate,
  type ToolSpeakGate,
} from "./voiceTurnGate";
import { researchAccessHeaders } from "../access/researchUnlock";
import { GROK_EXTRA_PROMPTS, type GrokExtraKind } from "./grokExtras";
import {
  coachKnowledgeKeyEquals,
  normalizeCoachKnowledgeKey,
  type CoachKnowledgeKey,
} from "./coachKnowledgeKey";
import type { CoachIdentity } from "./coachIdentity";
import { missingIdentityFloorplans, askNamesCoachIdentity } from "./coachIdentity";
import { getCoachFacts, formatChatSpecMissReply, isUnpinnedWeightReply, isWeightSpecAsk } from "./chatSpecBlock";
import { appendStandingLessonLine, lessonFromVoiceTurn } from "./voiceLesson";

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type RealtimeHandlers = {
  onStatus: (s: RealtimeStatus, detail?: string) => void;
  onUserTranscript: (text: string) => void;
  /** Final user utterance only. Partials stay on onUserTranscript. */
  onUserTurnDone?: (text: string) => void;
  onAssistantDelta: (text: string) => void;
  onAssistantDone: (text: string) => void;
  onError: (message: string) => void;
  /** Fired when the socket drops unexpectedly (not after intentional stop) */
  onDisconnected?: (reason: string) => void;
  /** CarFax-style desk sheet for the coach this turn — or null to hide. */
  onDeskSheet?: (sheet: DeskSheetPayload | null) => void;
  /** Floorplan codes to show on screen. Spoken line stays "Which floorplan?" */
  onFloorplanChoices?: (codes: string[]) => void;
};

/**
 * Browser / Capacitor WKWebView client for xAI Grok Voice Agent (Realtime).
 *
 * Auth: ephemeral token → subprotocol `xai-client-secret.<token>`
 * Hands-free: server VAD + mic muted while Grok is speaking (echo guard).
 *
 * iOS: pass a LiveVoicePrewarm from the tap so getUserMedia + AudioContext
 * start before the token/socket awaits. One shared AudioContext for capture
 * and playback (two contexts often stay silent on WKWebView).
 */
function isUnknownToolBubble(text: string): boolean {
  return /^none\.\s*unknown tool\.?$/i.test(text.trim());
}

export class GrokRealtimeSession {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  /** Mic tap: AudioWorkletNode, or ScriptProcessorNode where no worklet. */
  private processor: AudioWorkletNode | ScriptProcessorNode | null = null;
  private micGraphPending = false;
  private source: MediaStreamAudioSourceNode | null = null;
  private mute: GainNode | null = null;
  /** Jitter-buffered PCM player (worklet ring buffer or fallback). */
  private player: LivePcmPlayer | null = null;
  private playerPromise: Promise<LivePcmPlayer | null> | null = null;
  private playerCtx: AudioContext | null = null;
  /** Bumped on barge-in so chunks still in flight are dropped. */
  private playGeneration = 0;
  private assistantText = "";
  private closed = false;
  private intentionalStop = false;
  private suppressMic = false;
  private finishedAssistantOnce = false;
  private handlers: RealtimeHandlers;
  private voiceId: string;
  private speed: number;
  private catalogContext: string;
  /** Screen captured at mic press. A later room chip replaces it. */
  private screenAtAsk: string;
  /** Screen note waiting for the socket, so it lands before the next reply. */
  private pendingRouteNote = "";
  private unsubScreen: (() => void) | null = null;
  private callout: ScreenCalloutState = initialScreenCalloutState();
  private calloutTimer: ReturnType<typeof setTimeout> | null = null;
  /** Callout that waited for the intro, a closed socket, or the current reply. */
  private unsentCallout: string | null = null;
  private introFinished = false;
  private facts: ActiveCoach | null;
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;
  /** Wall clock when this reply's drain wait started. Caps a stuck queue. */
  private rearmSince = 0;
  private earlyPcm: ArrayBuffer[] = [];
  private readonly maxEarlyChunks = 48;
  private researchAbort: AbortController | null = null;
  private researchPhase: "idle" | "holding" | "searching" | "answering" =
    "idle";
  private pendingResearchInjection: string | null = null;
  private lastResearchTranscript = "";
  /** Lot snapshot from the last voice answer, so a correction can see the row. */
  private lastLessonLotNotes = "";
  /** Last own-lot filter. Follow-ups that name no new filter keep it. */
  private lotMemory: LotMemory | null = null;
  /** Last finished reply, kept so "those in stock" can name the coach she just described. */
  private priorAssistantForLot = "";
  /** Last thing the salesman said. query_lot runs only for a lot question. */
  private lastUserTranscript = "";
  /**
   * He stopped talking and his words are not transcribed yet. The model can
   * call query_lot first; that call must wait for these words, or it reads
   * the turn before ("any Winnebago Views" once none, then 2).
   */
  private userTranscriptPending = false;
  private userTranscriptWaiters: Array<() => void> = [];
  /** Last lot line spoken, so a noise echo does not say it again. */
  private lastSpokenLotLine = "";
  /** The hold is one response. The lot answer waits until that response ends. */
  private toolSpeak: ToolSpeakGate = initialToolSpeakGate();
  private handledToolCallIds = new Set<string>();
  private introSpoken = false;
  private lastDeskQuery = "";
  private lastDeskIdentity: import("./coachIdentity").CoachIdentity | null =
    null;
  private lastDeskSpecs: Parameters<typeof resolveDeskSheet>[0]["specs"] = null;
  private deskFallbackSeq = 0;
  /** Bumps on each voice turn and on interrupt so a stale spec speech dies. */
  private specTurnSeq = 0;
  private pendingSpec: {
    transcript: string;
    grounded: ReturnType<typeof buildChatGrounding>;
  } | null = null;
  private pendingSpecSheet: Promise<DeskSheetPayload | null> | null = null;
  private specEngineSpoken = false;
  /** Engine already painted this turn — do not remount a memory snippet over it. */
  private engineSheetPainted = false;
  /**
   * Sheet from the last successful voice desk resolve, keyed by coach.
   * Full report reuses it so a second fallback cannot drop overview fills.
   */
  private voiceCachedSheet: {
    key: CoachKnowledgeKey;
    sheet: DeskSheetPayload;
    query: string;
  } | null = null;
  /** Coach/spec ask waiting for full vs quick. */
  private voiceChoiceTranscript: string | null = null;
  /**
   * Live Voice talks in the bubble. It does not mount the spec report.
   * That card was opening on lot questions ("under 40 foot") and staying
   * quiet when a real report was asked. Leave it off.
   */
  private readonly voiceSpecReport = false;
  private voiceDeliver: "full" | "quick" | null = null;
  /** Completed user lines, so "full specs" can find the coach already named. */
  private recentUserTurns: string[] = [];
  /** Coach she already spoke, when he never repeated the year/make/model. */
  private recentCoachMentions: string[] = [];
  /** Extras were offered for the current coach. A named pick opens one card. */
  private voiceExtrasOffered = false;
  private voiceExtraSheet: DeskSheetPayload | null = null;
  private voiceExtraQuery = "";
  private accessPhone: string;
  private visitorFirstName: string;
  private visitorMemory: string;
  private standingLessons: string | undefined;

  constructor(
    handlers: RealtimeHandlers,
    voiceId = DEFAULT_VOICE,
    opts?: {
      speed?: number;
      catalogContext?: string;
      screenAtAsk?: string;
      facts?: ActiveCoach | null;
      accessPhone?: string;
      visitorFirstName?: string;
    },
  ) {
    this.handlers = handlers;
    this.voiceId = voiceId;
    this.speed = opts?.speed ?? 1;
    this.catalogContext = (opts?.catalogContext || "").trim();
    this.screenAtAsk = (opts?.screenAtAsk || "").trim();
    this.unsubScreen = onActiveScreenChange((name) => {
      if (!name || name === this.screenAtAsk) return;
      this.screenAtAsk = name;
      if (isRoutedChatScreen(name)) this.sendRouteScreenItem(name);
      else this.pendingRouteNote = "";
      this.sendSessionUpdate();
      this.pushCallout({ type: "navigate", screen: name, now: Date.now() });
    });
    this.facts = opts?.facts ?? null;
    this.accessPhone = (opts?.accessPhone || "").trim();
    this.visitorFirstName = (opts?.visitorFirstName || "").trim();
    this.visitorMemory = "";
    this.standingLessons = undefined;
  }

  /** AccessProvider may hydrate after Live Voice is already connected. */
  setAccessPhone(phone?: string) {
    this.accessPhone = (phone || "").trim();
  }

  setVisitorFirstName(firstName?: string) {
    this.visitorFirstName = (firstName || "").trim();
  }

  get isActive() {
    return Boolean(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  async start(prewarm?: LiveVoicePrewarm | null) {
    this.closed = false;
    this.intentionalStop = false;
    this.setMicGate(false);
    this.finishedAssistantOnce = false;
    this.earlyPcm = [];
    this.voiceCachedSheet = null;
    this.resetResearchTurn();
    this.introSpoken = false;

    this.handlers.onStatus("connecting", "Allow microphone if the phone asks…");

    // 1) Capture FIRST (same tap). Token + socket in parallel after.
    await this.ensureCapture(prewarm ?? beginLiveVoiceFromUserGesture());
    this.handlers.onStatus("connecting", "Opening Grok Voice…");

    const token = await fetchEphemeralToken();
    this.visitorMemory = takeTokenVisitorMemory();
    this.standingLessons = takeTokenStandingLessons();
    if (this.closed || this.intentionalStop) return;

    const subprotocol = `xai-client-secret.${token}`;
    const ws = new WebSocket(XAI_REALTIME_URL, [subprotocol]);
    this.ws = ws;

    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error("WebSocket connect timeout")),
        15000,
      );
      ws.onopen = () => {
        clearTimeout(t);
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(t);
        reject(new Error("WebSocket failed to open"));
      };
    });

    ws.binaryType = "arraybuffer";
    this.sendRouteScreenItem(this.pendingRouteNote || this.screenAtAsk);
    this.sendSessionUpdate(this.catalogContext);
    if (this.catalogContext) {
      try {
        ws.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `VERIFIED CATALOG for this voice session (do not invent against it):\n${this.catalogContext}`,
                },
              ],
            },
          }),
        );
      } catch {
        /* session can still run without the extra item */
      }
    }
    this.flushEarlyAudio();

    ws.onmessage = (evt) => this.handleMessage(evt);
    ws.onclose = (evt) => {
      this.ws = null;
      if (this.intentionalStop || this.closed) {
        // stop() already tore down (and may have kept the mic for reconnect)
        this.handlers.onStatus("idle");
        return;
      }
      // Drop the audio graph so a new session can reconnect. Keep the
      // MediaStream + AudioContext (retained) so iOS does not need a new tap.
      this.disconnectGraph();
      const reason = evt.reason || `code ${evt.code}`;
      this.handlers.onStatus("idle");
      this.handlers.onDisconnected?.(reason);
    };
    ws.onerror = () => {
      if (!this.closed && !this.intentionalStop) {
        this.handlers.onError("Realtime connection error");
      }
    };

    this.handlers.onStatus(
      "listening",
      "Listening — speak anytime, like Grok Voice",
    );
  }

  private async ensureCapture(prewarm: LiveVoicePrewarm) {
    if (prewarm.error && !prewarm.streamPromise) {
      throw prewarm.error;
    }

    const kept = getRetainedLiveCapture();
    if (kept) {
      this.audioCtx = kept.ctx;
      this.mediaStream = kept.stream;
      if (kept.ctx.state === "suspended") await kept.ctx.resume();
      await this.connectMicGraph();
      return;
    }

    let ctx = prewarm.audioCtx;
    if (!ctx || ctx.state === "closed") {
      const AC =
        typeof window !== "undefined"
          ? window.AudioContext ||
            (
              window as unknown as {
                webkitAudioContext?: typeof AudioContext;
              }
            ).webkitAudioContext
          : undefined;
      if (!AC) throw new Error("Audio is not available in this WebView.");
      ctx = createLiveAudioContext(AC);
    }
    if (ctx.state === "suspended") await ctx.resume();
    this.audioCtx = ctx;

    const stream = prewarm.streamPromise
      ? await prewarm.streamPromise
      : await navigator.mediaDevices.getUserMedia({
          audio: {
            // Same as MIC_CONSTRAINTS. Gain control would turn on the
            // iPhone voice processor, which ducks the speaker and pops.
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 1,
          },
          video: false,
        });
    this.mediaStream = stream;
    retainLiveCapture(stream, ctx);
    await this.connectMicGraph();
  }

  /** 24 kHz mic samples from either capture path → PCM16 → socket. */
  private onMicSamples(samples24k: Float32Array) {
    if (this.closed || this.intentionalStop) return;
    if (this.suppressMic) return;
    const pcm = floatTo16BitPCM(samples24k);

    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.earlyPcm.push(pcm);
      if (this.earlyPcm.length > this.maxEarlyChunks) this.earlyPcm.shift();
      return;
    }

    this.sendPcm(pcm);
  }

  private async connectMicGraph() {
    const ctx = this.audioCtx;
    const stream = this.mediaStream;
    if (!ctx || !stream) return;
    if (this.processor || this.micGraphPending) return;
    this.micGraphPending = true;
    let useWorklet = false;
    try {
      useWorklet = await ensurePcmWorklet(ctx);
    } finally {
      this.micGraphPending = false;
    }
    if (this.processor || this.audioCtx !== ctx || this.mediaStream !== stream) {
      return;
    }

    const source = ctx.createMediaStreamSource(stream);
    this.source = source;

    let processor: AudioWorkletNode | ScriptProcessorNode;
    if (useWorklet) {
      // Audio-thread capture: no main-thread audio callback to underrun.
      const node = new AudioWorkletNode(ctx, PCM_CAPTURE_PROCESSOR, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: { dstRate: PCM_SAMPLE_RATE, chunkMs: 80 },
      });
      node.port.onmessage = (e: MessageEvent) => {
        if (e.data instanceof Float32Array) this.onMicSamples(e.data);
      };
      processor = node;
    } else {
      // Fallback for browsers without AudioWorklet (deprecated API).
      const bufferSize = 4096;
      const sp = ctx.createScriptProcessor(bufferSize, 1, 1);
      sp.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        this.onMicSamples(
          resampleFloat32(input, ctx.sampleRate, PCM_SAMPLE_RATE),
        );
      };
      processor = sp;
    }
    this.processor = processor;
    logLiveVoiceAudio(ctx, useWorklet ? "worklet" : "script-processor");

    source.connect(processor);
    // The capture node only runs if something is playing it. A private
    // silent stream is not played, so iOS sometimes never sends samples
    // and Listening never turns into Hearing. Zero gain into the same
    // output that already plays her voice keeps one speaker route.
    const output = liveVoiceOutputFor(ctx);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    this.mute = mute;
    processor.connect(mute);
    mute.connect(output.pull);
  }

  private sendPcm(pcm: ArrayBuffer) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      const b64 = arrayBufferToBase64Safe(pcm);
      ws.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: b64,
        }),
      );
    } catch {
      try {
        ws.send(pcm);
      } catch {
        /* */
      }
    }
  }

  private flushEarlyAudio() {
    const queued = this.earlyPcm;
    this.earlyPcm = [];
    for (const pcm of queued) this.sendPcm(pcm);
  }

  private handleMessage(evt: MessageEvent) {
    if (evt.data instanceof ArrayBuffer) {
      this.beginSpeaking();
      void this.enqueuePcmPlayback(evt.data);
      return;
    }
    if (typeof evt.data !== "string") return;

    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(evt.data) as Record<string, unknown>;
    } catch {
      return;
    }

    const type = String(msg.type || "");

    switch (type) {
      case "session.created":
      case "session.updated":
        this.maybeSpeakSessionIntro();
        break;

      case "input_audio_buffer.speech_started":
        this.handlers.onStatus("listening", "Hearing you…");
        this.pushCallout({ type: "user-start" });
        break;

      case "input_audio_buffer.speech_stopped":
        this.userTranscriptPending = true;
        this.handlers.onStatus("thinking", "Processing…");
        this.pushCallout({ type: "user-stop" });
        break;

      case "conversation.item.input_audio_transcription.updated": {
        const transcript = String(
          (msg as { transcript?: string }).transcript || "",
        );
        if (transcript) this.handlers.onUserTranscript(transcript);
        break;
      }

      case "conversation.item.input_audio_transcription.failed":
        this.settleUserTranscript();
        break;

      case "conversation.item.input_audio_transcription.completed": {
        const transcript = String(
          (msg as { transcript?: string }).transcript || "",
        );
        // Set lastUserTranscript (below) before waking a waiting query_lot.
        queueMicrotask(() => this.settleUserTranscript());
        if (
          isIgnorableVoiceTranscript(transcript) ||
          isSameLotLine(this.lastSpokenLotLine, transcript)
        ) {
          this.cancelAutoReply();
          break;
        }
        if (transcript) {
          this.lastUserTranscript = transcript;
          this.handlers.onUserTranscript(transcript);
          this.handlers.onUserTurnDone?.(transcript);
          void this.maybeEnrichWithWebResearch(transcript);
        }
        break;
      }

      case "response.created":
        this.toolSpeak = reduceToolSpeak(this.toolSpeak, {
          type: "response-start",
        }).state;
        if (this.assistantText.trim()) this.priorAssistantForLot = this.assistantText;
        this.assistantText = "";
        this.finishedAssistantOnce = false;
        this.handlers.onStatus("thinking", "Grok is responding…");
        break;

      case "response.audio_transcript.delta":
      case "response.output_audio_transcript.delta": {
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
          if (isUnknownToolBubble(this.assistantText)) {
            this.assistantText = "";
            break;
          }
          if (repeatsLotLine(this.assistantText)) {
            this.cancelAutoReply();
            break;
          }
          this.handlers.onAssistantDelta(this.assistantText);
        }
        break;
      }

      case "response.audio_transcript.done":
      case "response.output_audio_transcript.done": {
        const t = String(
          (msg as { transcript?: string }).transcript || this.assistantText,
        );
        this.assistantText = t;
        if (isUnknownToolBubble(t)) {
          this.assistantText = "";
          break;
        }
        this.emitAssistantDone(t);
        break;
      }

      case "response.text.delta": {
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
          if (isUnknownToolBubble(this.assistantText)) {
            this.assistantText = "";
            break;
          }
          this.handlers.onAssistantDelta(this.assistantText);
        }
        break;
      }

      case "response.text.done": {
        const t = String(
          (msg as { text?: string }).text || this.assistantText,
        );
        this.assistantText = t;
        if (isUnknownToolBubble(t)) {
          this.assistantText = "";
          break;
        }
        this.emitAssistantDone(t);
        break;
      }

      case "response.audio.delta":
      case "response.output_audio.delta": {
        this.beginSpeaking();
        const delta = (msg as { delta?: string }).delta;
        if (typeof delta === "string" && delta) {
          void this.enqueuePcmPlayback(base64ToArrayBuffer(delta));
        }
        break;
      }

      case "response.function_call_arguments.done":
        void this.handleQueryLotCall(msg);
        break;

      case "response.output_item.done": {
        const item = (msg as { item?: { type?: string } }).item;
        if (item?.type === "function_call") void this.handleQueryLotCall(msg);
        break;
      }

      case "response.done": {
        const output = (msg as { response?: { output?: unknown[] } }).response
          ?.output;
        if (Array.isArray(output)) {
          for (const item of output) {
            if (
              item &&
              typeof item === "object" &&
              (item as { type?: string }).type === "function_call"
            ) {
              void this.handleQueryLotCall(item as Record<string, unknown>);
            }
          }
        }
        const answeringLot = this.flushToolSpeak();
        if (this.finishResearchHoldIfNeeded()) break;
        if (this.assistantText) {
          this.emitAssistantDone(this.assistantText);
        }
        if (this.researchPhase === "answering") {
          this.researchPhase = "idle";
        }
        if (this.researchPhase === "searching") {
          // Hold finished; web lookup still running — keep mic muted.
          this.assistantText = "";
          this.finishedAssistantOnce = false;
          break;
        }
        if (this.introSpoken) this.introFinished = true;
        if (answeringLot) {
          this.assistantText = "";
          this.finishedAssistantOnce = false;
          break;
        }
        this.scheduleRearm();
        this.assistantText = "";
        this.finishedAssistantOnce = false;
        break;
      }

      case "response.cancelled":
      case "response.cancel": {
        const answeringLot = this.toolSpeak.queued;
        if (answeringLot) this.interruptPlayback();
        if (this.flushToolSpeak()) break;
        if (this.researchPhase !== "idle") {
          // Expected: we cancelled the VAD auto-reply to run web research.
          break;
        }
        if (this.introSpoken) this.introFinished = true;
        this.interruptPlayback();
        this.setMicGate(false);
        this.flushQueuedCallout();
        this.pushCallout({ type: "reply-done", now: Date.now() });
        this.handlers.onStatus(
          "listening",
          "Interrupted — listening… speak or 📷",
        );
        break;
      }

      case "error": {
        const err = msg.error as { message?: string } | string | undefined;
        const message =
          typeof err === "string"
            ? err
            : err?.message || JSON.stringify(msg).slice(0, 200);
        if (/already has an active response/i.test(message)) {
          const rejected = reduceToolSpeak(this.toolSpeak, {
            type: "create-rejected",
          });
          this.toolSpeak = rejected.state;
          break;
        }
        if (/cancel|interrupt|no active response/i.test(message)) {
          if (this.researchPhase !== "idle") break;
          this.setMicGate(false);
          this.handlers.onStatus(
            "listening",
            "Interrupted — listening… speak or 📷",
          );
          break;
        }
        this.handlers.onError(message);
        this.handlers.onStatus("error", message);
        break;
      }

      default:
        break;
    }
  }

  private settleUserTranscript() {
    this.userTranscriptPending = false;
    const waiters = this.userTranscriptWaiters;
    this.userTranscriptWaiters = [];
    for (const wake of waiters) wake();
  }

  /** Wait (bounded) for the words of the turn the model is answering. */
  private waitForUserTranscript(maxMs = 2000): Promise<void> {
    if (!this.userTranscriptPending) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.userTranscriptWaiters = this.userTranscriptWaiters.filter((w) => w !== wake);
        resolve();
      }, maxMs);
      const wake = () => {
        clearTimeout(timer);
        resolve();
      };
      this.userTranscriptWaiters.push(wake);
    });
  }

  /** query_lot. The model fills filters from the conversation; the server keeps the last lot filter. */
  private async handleQueryLotCall(msg: Record<string, unknown>) {
    const nested =
      msg.item && typeof msg.item === "object"
        ? (msg.item as Record<string, unknown>)
        : msg;
    const name = String(nested.name || msg.name || "");
    const callId = String(nested.call_id || msg.call_id || "");
    if (!callId || this.handledToolCallIds.has(callId)) return;
    if (!name) return;
    this.handledToolCallIds.add(callId);
    if (isNativeRealtimeTool(name)) return;
    if (name !== "query_lot") {
      const payload = nested.arguments ?? msg.arguments ?? "";
      console.warn("[rvgrok] unrecognized tool", { name, payload });
      this.sendToolOutput(
        callId,
        { ok: false, error: "unrecognized tool" },
        undefined,
        false,
      );
      return;
    }
    let args: Record<string, unknown> = {};
    const raw = nested.arguments ?? msg.arguments ?? "{}";
    try {
      const parsed = JSON.parse(String(raw));
      if (parsed && typeof parsed === "object") {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      args = {};
    }
    // The tool call can beat the transcript of this turn. Read his words for
    // this question, not the last one.
    await this.waitForUserTranscript();
    if (this.closed) return;
    try {
      const res = await fetch("/api/rvgrok/query-lot", {
        method: "POST",
        headers: researchAccessHeaders(
          { "Content-Type": "application/json", Accept: "application/json" },
          this.accessPhone,
        ),
        body: JSON.stringify({
          args,
          lotMemory: this.lotMemory,
          utterance: this.lastUserTranscript,
          priorAssistant: this.priorAssistantForLot,
        }),
      });
      const data = (await res.json()) as { lotMemory?: LotMemory | null } | null;
      if (data == null || (typeof data === "object" && Object.keys(data).length === 0)) {
        console.warn("[rvgrok] empty tool result", { name, payload: data });
        this.sendToolOutput(callId, { ok: false, error: "empty result" }, undefined, false);
        return;
      }
      if (data?.lotMemory) this.lotMemory = data.lotMemory;
      const matched = Number((data as { matched?: number }).matched ?? 0);
      const roster = (data as { name_roster?: unknown }).name_roster;
      const hasRoster = Array.isArray(roster) && roster.length > 0;
      const summary = lotSummaryForSpeech(
        String((data as { summary?: string; speech?: string }).speech || (data as { summary?: string }).summary || ""),
        Number.isFinite(matched) ? matched : 0,
      );
      if (summary && isSameLotLine(this.lastSpokenLotLine, summary)) {
        this.sendToolOutput(callId, data, undefined, false);
        return;
      }
      if (summary) this.lastSpokenLotLine = summary;
      this.sendToolOutput(
        callId,
        data,
        hasRoster ? NAME_ROSTER_SPEAK : summary ? `Speak only these words, then stop: ${lotLineWithDetailsAsk(summary)}` : undefined,
      );
    } catch (err) {
      console.warn("[rvgrok] query_lot failed", { name, payload: err });
      this.sendToolOutput(
        callId,
        { ok: false, error: "lookup failed" },
        undefined,
        false,
      );
    }
  }

  /** Drop a VAD reply to silence, noise, or an echo of the lot line. */
  private cancelAutoReply() {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type: "response.cancel" }));
    } catch {
      /* nothing in flight */
    }
    try {
      ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
    } catch {
      /* buffer already clear */
    }
  }

  private sendToolOutput(
    callId: string,
    data: unknown,
    instructions?: string,
    speak = true,
  ) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(data),
        },
      }),
    );
    if (!speak) return;
    const planned = reduceToolSpeak(this.toolSpeak, {
      type: "tool-ready",
      instructions:
        instructions ||
        "Speak the query_lot summary and only the units this tool returned. Do not add a coach, a price, or a store from web notes, a market list, or the previous turn. If units came back, those are the answer. Say none only when matched is 0. Do not mention web notes. If did_you_mean or close is set, offer that name. The sheet body type is how the dealer filed the coach. The name and the chassis are the coach. When they disagree, say both. If the result includes a NAME ROSTER, count from those names. Do not stop at the sheet count. Never tell the user to change a query, a parameter, or these instructions. " +
          LOT_FEATURE_WEB_CLAUSE,
    });
    this.toolSpeak = planned.state;
    if (planned.speak) this.emitToolSpeak(planned.speak);
  }

  /** Speak a lot answer that was waiting out the hold line. */
  private flushToolSpeak(): boolean {
    const planned = reduceToolSpeak(this.toolSpeak, { type: "response-end" });
    this.toolSpeak = planned.state;
    if (!planned.speak) return false;
    this.emitToolSpeak(planned.speak);
    return true;
  }

  private emitToolSpeak(instructions: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions,
          },
        }),
      );
    } catch {
      const rejected = reduceToolSpeak(this.toolSpeak, {
        type: "create-rejected",
      });
      this.toolSpeak = rejected.state;
    }
  }

  private emitAssistantDone(text: string) {
    if (isUnknownToolBubble(text)) return;
    if (text) this.noteCoachMention(text);
    if (this.researchPhase === "holding" || this.researchPhase === "searching") {
      return;
    }
    if (this.finishedAssistantOnce) return;
    this.finishedAssistantOnce = true;
    if (text && this.lastDeskQuery && !this.engineSheetPainted) {
      const cached = this.matchingVoiceCachedSheet(this.lastDeskIdentity);
      if (cached) {
        this.deskFallbackSeq += 1;
        this.engineSheetPainted = true;
        this.publishDeskSheet(
          withVoiceSpecExtras(cached, this.lastDeskQuery),
          this.lastDeskQuery,
        );
      } else {
        this.emitDeskSheet({
          query: this.lastDeskQuery,
          identity: this.lastDeskIdentity,
          specs: this.lastDeskSpecs,
          spokenText: text,
          chatSpecBlock: text,
        });
      }
    }
    if (text) this.handlers.onAssistantDone(text);
    if (text) this.noteVoiceLesson(text);
  }

  /** Write a standing rule after she answers, then put it on the next turn. */
  private noteVoiceLesson(assistantText: string) {
    const userText = this.recentUserTurns[this.recentUserTurns.length - 1] || "";
    const lotNotes = this.lastLessonLotNotes;
    const lesson = lessonFromVoiceTurn({ userText, assistantText, lotNotes });
    if (!lesson) return;
    const next = appendStandingLessonLine(this.standingLessons || "", lesson.text);
    if (next !== (this.standingLessons || "")) {
      this.standingLessons = next;
      this.sendSessionUpdate();
    }
    const phone = this.accessPhone;
    void import("../access/researchUnlock.ts")
      .then(({ researchAccessHeaders }) =>
        fetch("/api/rvgrok/memory", {
          method: "POST",
          headers: researchAccessHeaders(
            { "Content-Type": "application/json" },
            phone,
          ),
          keepalive: true,
          body: JSON.stringify({
            source: "voice",
            lotNotes: lotNotes.slice(0, 12000),
            messages: [
              { role: "user", content: userText.slice(0, 800) },
              { role: "assistant", content: assistantText.slice(0, 800) },
            ],
          }),
        }),
      )
      .then(async (res) => {
        if (!res?.ok) return;
        const data = (await res.json().catch(() => null)) as {
          lessons?: unknown;
        } | null;
        if (!data || typeof data.lessons !== "string" || !data.lessons.trim()) return;
        if (this.closed) return;
        this.standingLessons = data.lessons;
        this.sendSessionUpdate();
      })
      .catch(() => undefined);
  }

  private publishDeskSheet(
    sheet: DeskSheetPayload | null,
    query: string,
  ) {
    const visual =
      Boolean(sheet) &&
      this.voiceDeliver !== "quick" &&
      (looksLikeDeskSheetAsk(query) || this.voiceDeliver === "full");
    this.handlers.onDeskSheet?.(visual ? sheet : null);
  }

  private emitDeskSheet(opts: Parameters<typeof resolveDeskSheet>[0]) {
    const sheet = markDeskGapsSearching(
      withVoiceSpecExtras(resolveDeskSheet(opts), opts.query),
    );
    this.publishDeskSheet(sheet, opts.query);
    const seq = ++this.deskFallbackSeq;
    if (!sheet) return;
    void resolveDeskSheetThenFallback(opts).then((next) => {
      if (seq !== this.deskFallbackSeq) return;
      if (!next) return;
      const visual = withVoiceSpecExtras(next, opts.query);
      if (
        this.voiceDeliver !== "quick" &&
        (looksLikeDeskSheetAsk(opts.query) || this.voiceDeliver === "full")
      ) {
        this.handlers.onDeskSheet?.(visual);
      }
    });
  }

  /**
   * Close or open the mic. The flag stops samples from reaching her.
   * The hardware track has to close too: on the loudspeaker, iOS echo
   * cancel hears her voice in the mic and chops the speaker into static.
   * Headphones do not leak, so the same call is clean with the track left on.
   */
  private setMicGate(closed: boolean) {
    this.suppressMic = closed;
    // play-and-record ducks the loudspeaker. playback is full volume
    // while she talks, then play-and-record again when it is his turn.
    // The app shell still leaves the hardware track on. Flipping that
    // track is what left WKWebView deaf after hello.
    setSpeakingSession(closed);
    resumeLiveVoiceSpeaker(this.audioCtx);
    if (nativeShellLeavesMicHardwareOn()) return;
    const tracks = this.mediaStream?.getAudioTracks() ?? [];
    for (const track of tracks) {
      if (track.enabled === closed) track.enabled = !closed;
    }
  }

  private beginSpeaking() {
    this.setMicGate(true);
    this.rearmSince = 0;
    this.handlers.onStatus("speaking", "RvGrok speaking…");
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
  }

  /** After Grok finishes, wait for the audio queue to drain, then open the mic.
   * Do not cap a long answer: opening early switches the phone back to the
   * quiet call volume while she is still talking. */
  private scheduleRearm() {
    if (this.rearmTimer) clearTimeout(this.rearmTimer);
    if (!this.rearmSince) this.rearmSince = Date.now();

    const remainingMs = Math.max(0, (this.player?.remainingSec() ?? 0) * 1000);
    const stuck = Date.now() - this.rearmSince > 180000;
    if (remainingMs > 250 && !stuck) {
      this.handlers.onStatus("speaking", "Finishing reply…");
      const waitMs = Math.min(Math.max(remainingMs, 300), 1000);
      this.rearmTimer = setTimeout(() => {
        this.rearmTimer = null;
        if (this.closed || this.intentionalStop) return;
        this.scheduleRearm();
      }, waitMs);
      return;
    }

    this.rearmTimer = null;
    this.rearmSince = 0;
    if (this.closed || this.intentionalStop) return;
    this.setMicGate(false);
    if (this.introSpoken) this.introFinished = true;
    this.flushQueuedCallout();
    this.pushCallout({ type: "reply-done", now: Date.now() });
    this.handlers.onStatus(
      "listening",
      "Listening continuously — your turn",
    );
  }

  /** One player per session + context; worklet when available. */
  private playerFor(ctx: AudioContext): Promise<LivePcmPlayer | null> {
    if (this.playerPromise && this.playerCtx === ctx) return this.playerPromise;
    this.player?.dispose();
    this.player = null;
    this.playerCtx = ctx;
    this.playerPromise = ensurePcmWorklet(ctx).then((ok) => {
      if (this.playerCtx !== ctx || ctx.state === "closed") return null;
      const output = liveVoiceOutputFor(ctx);
      let player: LivePcmPlayer;
      try {
        player = ok
          ? createWorkletPlayer(ctx, output.gain, PCM_SAMPLE_RATE)
          : createBufferSourcePlayer(ctx, output.gain, PCM_SAMPLE_RATE);
      } catch {
        player = createBufferSourcePlayer(ctx, output.gain, PCM_SAMPLE_RATE);
      }
      console.info(
        `[LiveVoice] player=${player.kind} route=${output.route} ctxRate=${ctx.sampleRate} pcmRate=${PCM_SAMPLE_RATE}`,
      );
      this.player = player;
      return player;
    });
    return this.playerPromise;
  }

  private enqueuePcmPlayback(pcm: ArrayBuffer) {
    const ctx = this.audioCtx;
    if (!ctx || ctx.state === "closed") return;
    if (ctx.state !== "running") void ctx.resume().catch(() => {});
    const samples = pcm16ToFloat32(pcm);
    if (samples.length === 0) return;
    // Promise callbacks run in order, so chunks stay in order while the
    // worklet module is still loading.
    const generation = this.playGeneration;
    void this.playerFor(ctx)
      .then((player) => {
        if (generation === this.playGeneration) player?.push(samples);
      })
      .catch(() => {
        /* ignore playback glitches */
      });
  }

  stop(opts?: { keepCapture?: boolean }) {
    this.unsubScreen?.();
    this.unsubScreen = null;
    if (this.calloutTimer) {
      clearTimeout(this.calloutTimer);
      this.calloutTimer = null;
    }
    this.unsentCallout = null;
    this.voiceCachedSheet = null;
    this.resetResearchTurn();
    this.intentionalStop = true;
    this.closed = true;
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
    this.teardownCapture(!opts?.keepCapture);
    this.handlers.onStatus("idle");
  }

  /**
   * Clear partial speech + cancel in-flight response so a photo turn
   * is not mixed with leftover audio context.
   */
  prepareForSnapshot(): void {
    const ws = this.ws;
    this.interruptPlayback();
    this.setMicGate(true);
    this.handlers.onStatus("thinking", "Looking at your photo…");
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type: "response.cancel" }));
    } catch {
      /* */
    }
    try {
      ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
    } catch {
      /* */
    }
  }

  /**
   * Path B — native Realtime image (optional). Prefer vision-first inject
   * when accuracy matters — many realtime endpoints ignore image parts.
   */
  sendSnapshot(
    imageDataUrl: string,
    prompt =
      "Look ONLY at the image I just attached. Describe exactly what is in the frame. Do not invent a different RV, floorplan, or exterior scene. If it is a control panel, screen, label, or close-up, say that first.",
  ): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    if (!imageDataUrl.startsWith("data:image/")) return false;

    this.prepareForSnapshot();

    const item = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageDataUrl },
        ],
      },
    };

    try {
      ws.send(JSON.stringify(item));
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions:
              "CRITICAL: Ground your answer ONLY in the attached image. Open with what object/screen/panel/vehicle part is actually visible. Never describe a different coach or exterior if the photo is a close-up panel, label, or interior detail. Short, accurate, under ~25 seconds.",
          },
        }),
      );
      return true;
    } catch {
      this.setMicGate(false);
      return false;
    }
  }

  /**
   * Salesman tapped a floorplan chip. Lock it and answer from the catalog.
   * Do not let the model invent a weight before get_coach_facts.
   */
  chooseFloorplan(code: string): boolean {
    const fp = code.trim();
    if (!fp) return false;
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    if (!this.facts?.make?.trim() || !this.facts.model?.trim()) return false;
    this.facts = {
      ...this.facts,
      floorplan: fp,
      updatedAt: new Date().toISOString(),
    };
    this.handlers.onFloorplanChoices?.([]);
    const prior = (this.lastDeskQuery || "").trim();
    const transcript = prior ? `${prior} ${fp}` : fp;
    const specSeq = ++this.specTurnSeq;
    this.pendingSpec = null;
    this.pendingSpecSheet = null;
    this.specEngineSpoken = false;
    this.engineSheetPainted = false;
    void this.answerFloorplanPick(specSeq, transcript);
    return true;
  }

  /**
   * Inject plain text into the live session (vision-first live photo path).
   */
  injectUserNote(
    text: string,
    requestResponse = true,
    responseInstructions?: string,
    statusDetail = "Photo ready — responding…",
  ): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    const t = text.trim();
    if (!t) return false;

    this.prepareForSnapshot();

    try {
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: t }],
          },
        }),
      );
      if (requestResponse) {
        this.setMicGate(true);
        this.handlers.onStatus("thinking", statusDetail);
        try {
          ws.send(JSON.stringify({ type: "response.cancel" }));
        } catch {
          /* */
        }
        ws.send(
          JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
              instructions:
                responseInstructions ||
                "Speak only about the camera photo described in the latest user message. Do not invent a different RV or scene.",
            },
          }),
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  private factsFromIdentity(
    id: {
      year: string;
      make: string;
      model: string;
      floorplan: string;
    } | null,
  ): ActiveCoach | null {
    if (!id?.make?.trim() || !id.model?.trim()) return null;
    return {
      year: id.year || "",
      make: id.make,
      model: id.model,
      floorplan: id.floorplan || "",
      updatedAt: new Date().toISOString(),
    };
  }

  /** Push THIS turn's catalog lock into the live session so VAD cannot keep Ventana. */
  private pushCatalogLockToSession(block: string) {
    const ws = this.ws;
    const text = (block || "").trim();
    if (!ws || ws.readyState !== WebSocket.OPEN || !text) return;
    try {
      this.sendSessionUpdate(text);
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `THIS turn's lock — prior series is dead. Speak only this coach:\n${text}`,
              },
            ],
          },
        }),
      );
    } catch {
      /* session can still run */
    }
  }

  private flushLockBreakAnswer(block: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    this.setMicGate(true);
    this.handlers.onStatus("thinking", "Updating coach…");
    const lock = (block || "").trim().slice(0, 1800);
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions: `${VOICE_RESEARCH_ANSWER_INSTRUCTIONS}\n\nTHIS turn named a different series than the prior lock. Speak the new year / make / model / floorplan only. Never reuse the previous series because a floorplan code matches.\n${lock}`,
          },
        }),
      );
    } catch {
      this.setMicGate(false);
    }
  }

  /**
   * Pre-turn enrichment: `buildChatGrounding` + shared `needsWebFallback`
   * (same detector as text chat). Cancel the VAD auto-reply, speak a short hold,
   * fetch web notes with a 24s bound on the fast research model, then answer
   * from the notes (or honestly fall back if the lookup is slow or fails).
   * Do not stretch the hold toward 60s — a spoken miss is better than dead air.
   * True research speaks "give me one second"; everything else answers now.
   * Spec / desk asks do not use that web snippet. After the catalog loads they
   * speak resolveDeskSheetThenFallback (catalog, then empty-field fallback).
   * A series change (Ventana → Dutch Star) always cancels the stale lock reply.
   *
   * Search decision + VAD cancel + hold MUST run before `ensureCatalogLoaded`.
   * First-session YMM/spec asks used to await the catalog import first; VAD
   * then answered "search empty" without the sidecar (no hold phrase). Catalog
   * pin may still paint the desk while search runs.
   */
  private applyVoiceGrounding(
    transcript: string,
    grounded: ReturnType<typeof buildChatGrounding>,
    opts?: { paintDesk?: boolean },
  ) {
    const parsed = parseCoachFromText(transcript);
    const lockBroke = Boolean(
      grounded.identity && namedCoachConflictsLock(parsed, this.facts),
    );
    if (grounded.identity && (lockBroke || !this.facts?.model)) {
      this.catalogContext = grounded.block || this.catalogContext;
      this.facts = this.factsFromIdentity(grounded.identity);
    } else if (grounded.identity && grounded.block) {
      this.catalogContext = grounded.block;
      if (
        this.facts &&
        grounded.identity.floorplan &&
        grounded.identity.floorplan !== this.facts.floorplan
      ) {
        this.facts = {
          ...this.facts,
          floorplan: grounded.identity.floorplan,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    this.lastDeskQuery = transcript;
    this.lastDeskIdentity = grounded.identity;
    this.lastDeskSpecs = grounded.specs;
    if (opts?.paintDesk !== false) {
      this.emitDeskSheet({
        query: transcript,
        identity: grounded.identity,
        specs: grounded.specs,
      });
    }
    if (lockBroke && grounded.block) {
      this.pushCatalogLockToSession(grounded.block);
    }
    return lockBroke;
  }

  /** Keep a line that already names a coach so the next "full specs" can lock it. */
  private noteCoachMention(text: string) {
    if (!askNamesCoachIdentity(parseCoachFromText(text || ""))) return;
    const clip = text.replace(/\s+/g, " ").trim().slice(0, 500);
    if (!clip) return;
    if (this.recentCoachMentions[this.recentCoachMentions.length - 1] === clip) {
      return;
    }
    this.recentCoachMentions.push(clip);
    if (this.recentCoachMentions.length > 6) this.recentCoachMentions.shift();
  }

  private async maybeEnrichWithWebResearch(transcript: string) {
    const spoken = transcript;
    // Real user speech sets lastUserTranscript in the transcription handler.
    // Replay paths call this with an older coach query and must not replace
    // the utterance the lot tool will read.
    this.recentUserTurns.push(spoken);
    if (this.recentUserTurns.length > 12) this.recentUserTurns.shift();
    const priorTurns = this.recentUserTurns.slice(0, -1);
    transcript = catalogQueryForFollowUp(
      spoken,
      priorTurns,
      this.facts,
      this.recentCoachMentions,
    );
    this.noteCoachMention(spoken);
    const searchFollow =
      /\b(search(?:\s+for)?\s+it|look\s+(?:it|that)\s+up|you need to search)\b/i.test(
        spoken,
      );
    const reportFollow =
      this.voiceSpecReport &&
      (looksLikeCoachReportAsk(spoken) ||
        looksLikeExplicitVoiceReportAsk(spoken));
    if (searchFollow && transcript !== spoken) {
      this.voiceDeliver = "full";
    } else if (reportFollow && transcript !== spoken) {
      this.voiceDeliver = this.voiceDeliver || "full";
    } else if (
      reportFollow &&
      askNamesCoachIdentity(parseCoachFromText(spoken))
    ) {
      this.voiceDeliver = this.voiceDeliver || "full";
    }
    this.handlers.onFloorplanChoices?.([]);
    if (
      this.voiceSpecReport &&
      !this.voiceDeliver &&
      this.routeVoiceOpening(transcript)
    ) {
      return;
    }
    if (this.voiceSpecReport && this.voiceDeliver === "quick") {
      const specSeq = ++this.specTurnSeq;
      this.pendingSpec = null;
      this.pendingSpecSheet = null;
      this.specEngineSpoken = false;
      this.engineSheetPainted = false;
      await this.deliverVoiceQuick(specSeq, transcript, {
        offerSpokenExtras: true,
      });
      return;
    }
    if (this.voiceSpecReport && this.voiceDeliver === "full") {
      const specSeq = ++this.specTurnSeq;
      this.pendingSpec = null;
      this.pendingSpecSheet = null;
      this.specEngineSpoken = false;
      this.cancelAutoResponseForResearch();
      await ensureCatalogLoaded().catch(() => null);
      if (this.closed || this.intentionalStop) return;
      if (specSeq !== this.specTurnSeq) return;
      const grounded = buildChatGrounding({
        query: transcript,
        facts: this.facts,
      });
      const cached = this.matchingVoiceCachedSheet(grounded.identity);
      if (!cached) this.engineSheetPainted = false;
      this.applyVoiceGrounding(transcript, grounded, { paintDesk: !cached });
      if (cached) {
        this.pendingSpec = { transcript, grounded };
        this.pendingSpecSheet = Promise.resolve(cached);
      } else {
        this.armSpecEngineTurn(transcript, grounded);
      }
      await this.speakFromSpecEngine(specSeq);
      return;
    }
    const specSeq = ++this.specTurnSeq;
    this.pendingSpec = null;
    this.pendingSpecSheet = null;
    this.specEngineSpoken = false;
    this.engineSheetPainted = false;
    if (
      this.voiceSpecReport &&
      !looksLikeOwnLotStockQuestion(transcript) &&
      (looksLikeVoiceCoachOrSpecAsk(transcript) ||
        looksLikeVoiceTellMeAboutAsk(transcript) ||
        (looksLikeFloorplanOnlyPick(transcript) &&
          Boolean(this.facts?.model?.trim()))) &&
      !looksLikeExplicitVoiceReportAsk(transcript)
    ) {
      await ensureCatalogLoaded().catch(() => null);
      if (this.closed || this.intentionalStop || specSeq !== this.specTurnSeq) {
        return;
      }
      const grounded = buildChatGrounding({
        query: transcript,
        facts: this.facts,
      });
      this.applyVoiceGrounding(transcript, grounded);
      this.cancelAutoResponseForResearch();
      if (
        isWeightSpecAsk(transcript) ||
        looksLikeVoiceFieldOrMetaAsk(transcript) ||
        looksLikeDeskSheetAsk(transcript)
      ) {
        this.armSpecEngineTurn(transcript, grounded);
        await this.speakFromSpecEngine(specSeq);
      } else {
        await this.deliverVoiceQuick(specSeq, transcript);
      }
      return;
    }
    let grounded = buildChatGrounding({
      query: transcript,
      facts: this.facts,
    });
    // Decide from the thin index / current lock — do not wait on the live
    // catalog. A catalog row must not skip search, and the first-session
    // import must not let VAD claim "search empty" first.
    const decision = decideVoiceWebResearch({
      transcript,
      specs: grounded.specs,
      catalogBlock: grounded.block || this.catalogContext,
      screen: this.screenAtAsk,
      lotFollowUp: Boolean(this.lotMemory && looksLikeOwnLotFollowUp(spoken)),
    });
    const catalogReady =
      grounded.identity || decision.action === "research"
        ? ensureCatalogLoaded().catch(() => null)
        : null;
    let lockBroke = this.applyVoiceGrounding(transcript, grounded);
    if (decision.action !== "research") {
      if (catalogReady) {
        await catalogReady;
        grounded = buildChatGrounding({
          query: transcript,
          facts: this.facts,
        });
        lockBroke = this.applyVoiceGrounding(transcript, grounded);
      }
      if (this.voiceSpecReport && looksLikeDeskSheetAsk(transcript)) {
        this.cancelAutoResponseForResearch();
        this.armSpecEngineTurn(transcript, grounded);
        await this.speakFromSpecEngine(specSeq);
        return;
      }
      if (lockBroke && !looksLikeCompanyOrPlantAsk(transcript)) {
        this.cancelAutoResponseForResearch();
        this.flushLockBreakAnswer(grounded.block);
      }
      return;
    }
    if (this.closed || this.intentionalStop) return;

    const key = transcript.trim();
    if (this.lastResearchTranscript === key && this.researchPhase !== "idle") {
      return;
    }
    this.lastResearchTranscript = key;

    this.researchAbort?.abort();
    this.researchAbort = new AbortController();
    this.pendingResearchInjection = null;

    this.cancelAutoResponseForResearch();
    if (decision.speakHold) {
      this.researchPhase = "holding";
      this.handlers.onStatus("thinking", "Researching…");
      this.speakResearchHold();
    } else {
      this.researchPhase = "searching";
      this.handlers.onStatus("thinking", "Answering…");
    }

    const searchReady = fetchVoiceWebResearchNotes({
      query: decision.query,
      catalogContext: decision.catalogBlock || this.catalogContext,
      signal: this.researchAbort.signal,
      accessPhone: this.accessPhone,
      screen: this.screenAtAsk,
      lotMemory: this.lotMemory,
    });

    if (catalogReady) {
      await catalogReady;
      if (!this.closed && !this.intentionalStop) {
        grounded = buildChatGrounding({
          query: transcript,
          facts: this.facts,
        });
        this.applyVoiceGrounding(transcript, grounded);
      }
    }

    if (this.voiceSpecReport && looksLikeDeskSheetAsk(transcript)) {
      // Catalog is loaded. Speak the shared engine — not the web snippet.
      this.armSpecEngineTurn(transcript, grounded);
      this.researchAbort?.abort();
      if (this.researchPhase !== "holding") {
        await this.speakFromSpecEngine(specSeq);
      }
      return;
    }

    const result = await searchReady;
    if (result.lotMemory) this.lotMemory = result.lotMemory;

    if (this.closed || this.intentionalStop) return;
    if (this.researchAbort.signal.aborted) return;
    this.rememberOwnLotVoiceLock(result.ok ? result.notes : "");

    const injection = formatVoiceWebSearchInjection(result, {
      catalogBlock: grounded.block || decision.catalogBlock || this.catalogContext,
    });
    if (this.researchPhase === "holding") {
      this.pendingResearchInjection = injection;
      return;
    }
    this.researchPhase = "answering";
    this.flushResearchAnswer(injection);
  }

  /** Once per Live Voice connect — not every user turn. */
  private maybeSpeakSessionIntro() {
    if (this.introSpoken || this.closed || this.intentionalStop) return;
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    this.introSpoken = true;
    try {
      ws.send(JSON.stringify(buildSessionIntroResponse(this.visitorFirstName)));
    } catch {
      this.introSpoken = false;
    }
  }

  private cancelAutoResponseForResearch() {
    this.interruptPlayback();
    this.setMicGate(true);
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type: "response.cancel" }));
    } catch {
      /* nothing active */
    }
    try {
      ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
    } catch {
      /* */
    }
  }

  private speakResearchHold() {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.researchPhase = "searching";
      return;
    }
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions: VOICE_RESEARCH_HOLD_INSTRUCTIONS,
          },
        }),
      );
    } catch {
      this.researchPhase = "searching";
    }
  }

  private finishResearchHoldIfNeeded(): boolean {
    if (this.pendingSpec) {
      const seq = this.specTurnSeq;
      this.researchPhase = "answering";
      void this.speakFromSpecEngine(seq);
      this.assistantText = "";
      this.finishedAssistantOnce = false;
      return true;
    }
    if (this.researchPhase !== "holding") return false;
    if (this.pendingResearchInjection) {
      this.researchPhase = "answering";
      const injection = this.pendingResearchInjection;
      this.pendingResearchInjection = null;
      this.flushResearchAnswer(injection);
    } else {
      this.researchPhase = "searching";
    }
    this.assistantText = "";
    this.finishedAssistantOnce = false;
    return true;
  }

  /**
   * A stock hit that names exactly one unit is the coach for the next
   * "report on that coach". The report ask has no year/make/model of its own.
   */
  private rememberOwnLotVoiceLock(notes: string) {
    const lock = ownLotVoiceCoachLock(notes);
    if (!lock) return;
    const facts = this.factsFromIdentity(lock);
    if (!facts) return;
    this.facts = facts;
    this.lastDeskIdentity = { ...lock, source: "facts" };
  }

  private flushResearchAnswer(injection: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.researchPhase = "idle";
      return;
    }
    this.setMicGate(true);
    this.handlers.onStatus("thinking", "Answering…");
    const inventoryTurn = /OWN-LOT inventory/.test(injection);
    if (inventoryTurn) this.lastLessonLotNotes = injection;
    const plantTurn = looksLikeCompanyOrPlantAsk(this.lastResearchTranscript);
    try {
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: injection }],
          },
        }),
      );
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions: inventoryTurn
              ? `This turn is a lot question. Speak the listed unit in plain words. If the block says none, say none. Do not invent a coach, price, or store. If a floorplan breakdown is printed, say it once and do not recount. Do not keep a store from an earlier turn unless that store is on a unit line. Do not mention web notes or read raw tool fields.`
              : plantTurn
                ? `${VOICE_RESEARCH_ANSWER_INSTRUCTIONS}\n\nThis is a factory or company question, not a coach. Answer it in full. Do not stop after the factory's name. Do not ask for a year, make, model, or floorplan.`
                : looksLikeRepairQuestion(this.lastResearchTranscript)
                  ? `${VOICE_RESEARCH_ANSWER_INSTRUCTIONS}\n\n${REPAIR_VOICE_PLAYBOOK}`
                  : VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
          },
        }),
      );
    } catch {
      this.researchPhase = "idle";
      this.setMicGate(false);
    }
  }

  private resetResearchTurn() {
    this.specTurnSeq += 1;
    this.pendingSpec = null;
    this.pendingSpecSheet = null;
    this.researchAbort?.abort();
    this.researchAbort = null;
    this.researchPhase = "idle";
    this.pendingResearchInjection = null;
    this.voiceChoiceTranscript = null;
    this.voiceDeliver = null;
    this.voiceExtrasOffered = false;
    this.voiceExtraSheet = null;
    this.voiceExtraQuery = "";
  }

  private rememberVoiceCachedSheet(
    identity: CoachIdentity | null | undefined,
    sheet: DeskSheetPayload,
    query: string,
  ) {
    const key = normalizeCoachKnowledgeKey(
      identity?.make && identity.model
        ? identity
        : {
            year: sheet.year,
            make: sheet.make,
            model: sheet.model,
            floorplan: sheet.floorplan,
          },
    );
    if (!key) return;
    this.voiceCachedSheet = { key, sheet, query };
  }

  private matchingVoiceCachedSheet(
    identity: CoachIdentity | null | undefined,
  ): DeskSheetPayload | null {
    if (!this.voiceCachedSheet || !identity) return null;
    const key = normalizeCoachKnowledgeKey(identity);
    if (!coachKnowledgeKeyEquals(key, this.voiceCachedSheet.key)) return null;
    return this.voiceCachedSheet.sheet;
  }

  /**
   * Coach or spec ask: choice line first. A later pick replays the ask.
   * Returns true when this utterance must not speak a report yet.
   */
  private routeVoiceOpening(transcript: string): boolean {
    if (!this.voiceSpecReport) return false;
    if (this.voiceChoiceTranscript) {
      const depth = classifyVoiceCoachDepth(transcript);
      if (depth) {
        const original = this.voiceChoiceTranscript;
        this.voiceChoiceTranscript = null;
        this.voiceDeliver = depth;
        void this.maybeEnrichWithWebResearch(original).finally(() => {
          this.voiceDeliver = null;
        });
        return true;
      }
    }
    if (
      this.voiceExtrasOffered &&
      !looksLikeVoiceCoachOrSpecAsk(transcript)
    ) {
      const pick = classifyVoiceExtraPick(transcript);
      if (pick) {
        this.openPickedExtra(pick);
        return true;
      }
    }
    if (this.voiceCachedSheet?.query && !this.voiceChoiceTranscript) {
      const depth = classifyVoiceCoachDepth(transcript);
      if (depth) {
        const original = this.voiceCachedSheet.query;
        this.voiceDeliver = depth;
        void this.maybeEnrichWithWebResearch(original).finally(() => {
          this.voiceDeliver = null;
        });
        return true;
      }
    }
    if (looksLikeVoiceCoachOrSpecAsk(transcript)) {
      const chosen = voiceDepthAlreadyChosen(transcript);
      this.voiceExtrasOffered = false;
      this.voiceExtraSheet = null;
      this.voiceExtraQuery = "";
      const coachLocked = Boolean(
        this.facts?.make?.trim() && this.facts?.model?.trim(),
      );
      if (looksLikeExplicitVoiceReportAsk(transcript) && chosen) {
        this.voiceChoiceTranscript = null;
        this.voiceDeliver = chosen;
        void this.maybeEnrichWithWebResearch(transcript).finally(() => {
          this.voiceDeliver = null;
        });
        return true;
      }
      if (!shouldSpeakVoiceCoachChoice({ transcript, coachLocked })) {
        this.voiceChoiceTranscript = null;
        return false;
      }
      this.specTurnSeq += 1;
      this.voiceChoiceTranscript = transcript;
      this.cancelAutoResponseForResearch();
      this.researchPhase = "answering";
      this.flushExactSpeech(VOICE_COACH_CHOICE_INSTRUCTIONS);
      return true;
    }
    if (this.voiceChoiceTranscript) this.voiceChoiceTranscript = null;
    return false;
  }

  /**
   * Speak the catalog sheet now. Empty-field scrape runs beside speech
   * and remounts the desk when fills arrive — same as typed chat's
   * `void resolveDeskSheetThenFallback`.
   * Extras ride that remount only after an explicit report delivery.
   */
  private speakCatalogThenFallback(
    seq: number,
    transcript: string,
    painted: DeskSheetPayload | null,
    opts: Parameters<typeof resolveDeskSheetThenFallback>[0],
    pending?: Promise<DeskSheetPayload | null> | null,
    offerExtras = true,
  ): DeskSheetPayload | null {
    const later = pending ?? resolveDeskSheetThenFallback(opts);
    void later
      .then((next) => {
        if (!next || next === painted || seq !== this.specTurnSeq || this.closed) {
          return;
        }
        this.publishDeskSheet(
          offerExtras
            ? withVoiceSpecExtras(next, transcript, { force: true })
            : next,
          transcript,
        );
      })
      .catch(() => undefined);
    return painted;
  }

  private publishFloorplanChoices(
    identity: {
      year?: string;
      make?: string;
      model?: string;
      floorplan?: string;
    } | null,
  ) {
    if (!identity) {
      this.handlers.onFloorplanChoices?.([]);
      return;
    }
    const codes = missingIdentityFloorplans(identity);
    this.handlers.onFloorplanChoices?.(codes);
  }

  private async deliverVoiceQuick(
    seq: number,
    transcript: string,
    opts?: { reportDelivery?: boolean; offerSpokenExtras?: boolean },
  ) {
    this.cancelAutoResponseForResearch();
    await ensureCatalogLoaded().catch(() => null);
    if (seq !== this.specTurnSeq || this.closed || this.intentionalStop) return;
    const grounded = buildChatGrounding({
      query: transcript,
      facts: this.facts,
    });
    this.applyVoiceGrounding(transcript, grounded, { paintDesk: false });
    const sheetOpts = {
      query: transcript,
      identity: grounded.identity,
      specs: grounded.specs,
      mountForVoiceReport: true,
      pinCoachKnowledge: true,
      knowledgeQuery: transcript,
    };
    const painted = resolveDeskSheet(sheetOpts);
    const reportDelivery = opts?.reportDelivery === true;
    const sheet = this.speakCatalogThenFallback(
      seq,
      transcript,
      painted,
      sheetOpts,
      undefined,
      reportDelivery,
    );
    if (seq !== this.specTurnSeq || this.closed || this.intentionalStop) return;
    if (sheet) {
      this.rememberVoiceCachedSheet(grounded.identity, sheet, transcript);
      this.deskFallbackSeq += 1;
      this.engineSheetPainted = true;
      this.publishDeskSheet(
        markDeskGapsSearching(
          reportDelivery
            ? withVoiceSpecExtras(sheet, transcript, { force: true })
            : sheet,
        ),
        transcript,
      );
    }
    this.researchPhase = "answering";
    if (reportDelivery) this.offerVoiceExtras(sheet, transcript);
    this.publishFloorplanChoices(grounded.identity);
    this.flushSpecEngineAnswer(
      formatVoiceQuickOverview(sheet, {
        offerExtras: reportDelivery || opts?.offerSpokenExtras === true,
      }),
    );
  }

  /** All five prompt cards. Nothing loads until they name one. */
  private offerVoiceExtras(sheet: DeskSheetPayload | null, query: string) {
    if (!sheet) {
      this.voiceExtrasOffered = false;
      this.voiceExtraSheet = null;
      return;
    }
    this.voiceExtraSheet = sheet;
    this.voiceExtraQuery = query;
    this.voiceExtrasOffered = true;
    this.publishDeskSheet(
      markDeskGapsSearching(
        withVoiceSpecExtras(sheet, query, { force: true }),
      ),
      query,
    );
  }

  /** Open the named card only. The other four stay closed. */
  private openPickedExtra(kind: GrokExtraKind) {
    const sheet = this.voiceExtraSheet;
    if (!sheet) return;
    this.cancelAutoResponseForResearch();
    this.researchPhase = "answering";
    this.publishDeskSheet(
      withVoiceSpecExtras(sheet, this.voiceExtraQuery, {
        force: true,
        pick: kind,
      }),
      this.voiceExtraQuery,
    );
    const title = GROK_EXTRA_PROMPTS[kind].title.replace(/\?$/, "");
    this.flushExactSpeech(
      `Say exactly this, then stop: ${title}. Opening only that card.`,
    );
  }

  private flushExactSpeech(instructions: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.researchPhase = "idle";
      return;
    }
    this.setMicGate(true);
    this.handlers.onStatus("thinking", "Answering…");
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions,
          },
        }),
      );
    } catch {
      this.researchPhase = "idle";
      this.setMicGate(false);
    }
  }

  /**
   * Spec turns speak the shared engine (catalog, then fallback).
   * The web-research snippet is not the answer.
   */
  private armSpecEngineTurn(
    transcript: string,
    grounded: ReturnType<typeof buildChatGrounding>,
  ) {
    this.pendingSpec = { transcript, grounded };
    this.pendingSpecSheet = resolveDeskSheetThenFallback({
      query: transcript,
      identity: grounded.identity,
      specs: grounded.specs,
      mountForVoiceReport:
        this.voiceDeliver === "full" ||
        looksLikeDeskSheetAsk(transcript) ||
        looksLikeVoiceFieldOrMetaAsk(transcript),
      pinCoachKnowledge: true,
      knowledgeQuery: transcript,
    });
  }

  private async speakFromSpecEngine(seq: number) {
    if (seq !== this.specTurnSeq || this.specEngineSpoken) return;
    this.specEngineSpoken = true;
    const pending = this.pendingSpec;
    const sheetPromise = this.pendingSpecSheet;
    this.pendingSpec = null;
    this.pendingSpecSheet = null;
    if (!pending) return;
    const sheetOpts = {
      query: pending.transcript,
      identity: pending.grounded.identity,
      specs: pending.grounded.specs,
      mountForVoiceReport:
        this.voiceDeliver === "full" ||
        looksLikeDeskSheetAsk(pending.transcript) ||
        looksLikeVoiceFieldOrMetaAsk(pending.transcript),
      pinCoachKnowledge: true,
      knowledgeQuery: pending.transcript,
    };
    const painted = resolveDeskSheet(sheetOpts);
    const sheet = this.speakCatalogThenFallback(
      seq,
      pending.transcript,
      painted,
      sheetOpts,
      sheetPromise,
    );
    if (seq !== this.specTurnSeq || this.closed || this.intentionalStop) return;
    const weightLine = isWeightSpecAsk(pending.transcript)
      ? formatChatSpecMissReply({
          query: pending.transcript,
          year: pending.grounded.identity?.year || this.facts?.year,
          make: pending.grounded.identity?.make || this.facts?.make,
          model: pending.grounded.identity?.model || this.facts?.model,
          floorplan:
            pending.grounded.identity?.floorplan || this.facts?.floorplan,
        })
      : null;
    if (weightLine && !isUnpinnedWeightReply(weightLine)) {
      this.voiceExtrasOffered = false;
      this.voiceExtraSheet = null;
      const identity = pending.grounded.identity;
      if (identity?.floorplan) this.handlers.onFloorplanChoices?.([]);
      else this.publishFloorplanChoices(identity);
      this.researchPhase = "answering";
      this.flushSpecEngineAnswer(weightLine);
      return;
    }
    if (weightLine && isUnpinnedWeightReply(weightLine)) {
      const identity = pending.grounded.identity;
      this.handlers.onStatus("thinking", "Researching…");
      const result = await fetchVoiceWebResearchNotes({
        query: pending.transcript,
        catalogContext: pending.grounded.block,
        signal: this.researchAbort?.signal,
        accessPhone: this.accessPhone,
        screen: this.screenAtAsk,
      }).catch(() => null);
      if (seq !== this.specTurnSeq || this.closed || this.intentionalStop) return;
      const researched = formatChatSpecMissReply({
        query: pending.transcript,
        year: identity?.year || this.facts?.year,
        make: identity?.make || this.facts?.make,
        model: identity?.model || this.facts?.model,
        floorplan: identity?.floorplan || this.facts?.floorplan,
        researchNotes: result?.ok ? result.notes : "",
      });
      this.voiceExtrasOffered = false;
      this.voiceExtraSheet = null;
      if (identity?.floorplan) this.handlers.onFloorplanChoices?.([]);
      this.researchPhase = "answering";
      this.flushSpecEngineAnswer(researched || weightLine);
      return;
    }
    if (sheet) {
      this.rememberVoiceCachedSheet(
        pending.grounded.identity,
        sheet,
        pending.transcript,
      );
    }
    this.deskFallbackSeq += 1;
    const showDesk =
      this.voiceDeliver === "full" ||
      looksLikeDeskSheetAsk(pending.transcript);
    const tagged = withVoiceSpecExtras(sheet, pending.transcript, {
      force: showDesk,
    });
    const script = formatVoiceSpecEngineSpeech(
      tagged,
      pending.transcript,
      showDesk ? "all" : "asked",
    );
    if (tagged && showDesk) {
      this.voiceExtraSheet = tagged;
      this.voiceExtraQuery = pending.transcript;
      this.voiceExtrasOffered = true;
    } else {
      this.voiceExtrasOffered = false;
      this.voiceExtraSheet = null;
    }
    this.publishDeskSheet(markDeskGapsSearching(tagged), pending.transcript);
    if (tagged) {
      this.engineSheetPainted = true;
      this.lastDeskQuery = pending.transcript;
      this.lastDeskIdentity = pending.grounded.identity;
      this.lastDeskSpecs = pending.grounded.specs;
    }
    this.researchPhase = "answering";
    this.publishFloorplanChoices(pending.grounded.identity);
    this.flushSpecEngineAnswer(script);
  }

  private async answerFloorplanPick(seq: number, transcript: string) {
    this.cancelAutoResponseForResearch();
    await ensureCatalogLoaded().catch(() => null);
    if (this.closed || this.intentionalStop || seq !== this.specTurnSeq) return;
    const fp = (this.facts?.floorplan || "").trim();
    const grounded = buildChatGrounding({
      query: transcript,
      facts: this.facts,
    });
    const base = grounded.identity;
    const identity = {
      year: this.facts?.year || base?.year || "",
      make: this.facts?.make || base?.make || "",
      model: this.facts?.model || base?.model || "",
      floorplan: fp || base?.floorplan || "",
      source: "facts" as const,
    };
    if (identity.make && identity.model) {
      this.facts = {
        year: identity.year,
        make: identity.make,
        model: identity.model,
        floorplan: identity.floorplan,
        updatedAt: new Date().toISOString(),
      };
    }
    this.applyVoiceGrounding(transcript, {
      ...grounded,
      identity,
    });
    const tool = getCoachFacts(identity);
    const uvw = /\b(uvw|dry\s+weight|unloaded)\b/i.test(transcript);
    const label = uvw ? "UVW" : "GVWR";
    const lbs = uvw ? tool.uvw_lb : tool.gvwr_lb;
    const name = [identity.year, identity.model, identity.floorplan]
      .filter(Boolean)
      .join(" ");
    let script =
      lbs != null && lbs > 0
        ? `${name}. ${label} is ${Math.round(lbs).toLocaleString("en-US")} pounds.`
        : "";
    if (!script) {
      this.handlers.onStatus("thinking", "Researching…");
      const result = await fetchVoiceWebResearchNotes({
        query: [identity.year, identity.make, identity.model, identity.floorplan, label]
          .filter(Boolean)
          .join(" "),
        catalogContext: grounded.block,
        accessPhone: this.accessPhone,
        screen: this.screenAtAsk,
      }).catch(() => null);
      if (this.closed || this.intentionalStop || seq !== this.specTurnSeq) return;
      script =
        formatChatSpecMissReply({
          query: label,
          year: identity.year,
          make: identity.make,
          model: identity.model,
          floorplan: identity.floorplan,
          researchNotes: result?.ok ? result.notes : "",
        }) || `${name} has no ${label} pin.`;
    }
    this.specEngineSpoken = true;
    this.pendingSpec = null;
    this.pendingSpecSheet = null;
    this.handlers.onFloorplanChoices?.([]);
    this.researchPhase = "answering";
    this.flushSpecEngineAnswer(script);
  }

  private flushSpecEngineAnswer(script: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.researchPhase = "idle";
      return;
    }
    this.setMicGate(true);
    this.handlers.onStatus("thinking", "Answering…");
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions: `${VOICE_SPEC_ENGINE_INSTRUCTIONS}\n\nSPEC ENGINE SCRIPT:\n${script}`,
          },
        }),
      );
    } catch {
      this.researchPhase = "idle";
      this.setMicGate(false);
    }
  }

  /**
   * Push Facts, CAL, TOW, or LOT into the Live Voice thread before the next
   * reply. Does not request a response. The shell's onRouteChange is what
   * fires this, via onActiveScreenChange.
   */
  private sendRouteScreenItem(name: string) {
    const screen = name.trim();
    if (!isRoutedChatScreen(screen)) return;
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.pendingRouteNote = screen;
      return;
    }
    this.pendingRouteNote = "";
    try {
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: routeScreenChatNote(screen) }],
          },
        }),
      );
    } catch {
      this.pendingRouteNote = screen;
    }
  }

  /**
   * Route-change hook from the shell. Updates instructions immediately and
   * schedules one spoken line after the debounce.
   */
  private pushCallout(event: ScreenCalloutEvent) {
    const result = reduceScreenCallout(this.callout, event);
    this.callout = result.state;
    if (event.type === "navigate") this.armCalloutTimer();
    if (result.speak) this.speakScreenCallout(result.speak);
  }

  private armCalloutTimer() {
    if (this.calloutTimer) clearTimeout(this.calloutTimer);
    this.calloutTimer = null;
    if (!this.callout.pending) return;
    const wait = Math.max(
      0,
      SCREEN_CALLOUT_DEBOUNCE_MS - (Date.now() - this.callout.pendingAt),
    );
    this.calloutTimer = setTimeout(() => {
      this.calloutTimer = null;
      if (this.closed || this.intentionalStop) return;
      this.pushCallout({ type: "tick", now: Date.now() });
    }, wait);
  }

  private speakScreenCallout(line: string) {
    if (this.callout.userSpeaking || this.closed || this.intentionalStop) {
      this.unsentCallout = line;
      return;
    }
    if (!this.introFinished) {
      this.unsentCallout = line;
      return;
    }
    // Never cut off a reply already in progress. Flush speaks it on reply-done.
    const plan = planCalloutDelivery(line, this.suppressMic);
    if (!plan.speakNow) {
      this.unsentCallout = plan.queued;
      return;
    }
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.unsentCallout = plan.speakNow;
      return;
    }
    this.unsentCallout = null;
    try {
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions: screenCalloutSpeechInstructions(plan.speakNow),
          },
        }),
      );
    } catch {
      this.unsentCallout = plan.speakNow;
    }
  }

  private flushQueuedCallout() {
    if (!this.unsentCallout || !this.introFinished) return;
    if (this.callout.userSpeaking) return;
    const line = this.unsentCallout;
    this.unsentCallout = null;
    this.speakScreenCallout(line);
  }

  /** Push the current session instructions (catalog lock, visitor, lessons, screen). */
  private sendSessionUpdate(catalogContext?: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(
        JSON.stringify(
          buildRealtimeSessionUpdate(
            this.voiceId,
            this.speed,
            catalogContext ?? this.catalogContext,
            this.visitorFirstName,
            this.visitorMemory,
            this.standingLessons,
            this.screenAtAsk || undefined,
          ),
        ),
      );
    } catch {
      /* session can still run */
    }
  }

  /**
   * Barge-in: stop Grok mid-sentence, clear audio queue, open mic again.
   * Does NOT end the Live Voice session. Safe to call repeatedly.
   */
  interrupt(): boolean {
    this.resetResearchTurn();
    const ws = this.ws;
    const wasLive = Boolean(ws && ws.readyState === WebSocket.OPEN);

    try {
      if (wasLive && ws) {
        ws.send(JSON.stringify({ type: "response.cancel" }));
        ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
      }
    } catch {
      /* cancel may error if nothing active — fine */
    }

    this.interruptPlayback();
    this.setMicGate(false);
    this.finishedAssistantOnce = false;
    this.assistantText = "";

    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }

    this.handlers.onStatus(
      "listening",
      "Interrupted — listening… speak or 📷",
    );
    return wasLive;
  }

  /**
   * Stop queued PCM. Keep AudioContext alive so later replies still play on iOS.
   */
  private interruptPlayback() {
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
    this.playGeneration++;
    this.player?.clear();
  }

  private disconnectGraph() {
    try {
      this.processor?.disconnect();
    } catch {
      /* ignore */
    }
    try {
      this.source?.disconnect();
    } catch {
      /* ignore */
    }
    try {
      this.mute?.disconnect();
    } catch {
      /* ignore */
    }
    this.processor = null;
    this.source = null;
    this.mute = null;
    this.earlyPcm = [];
  }

  private teardownCapture(release: boolean) {
    this.disconnectGraph();

    this.player?.dispose();
    this.player = null;
    this.playerPromise = null;
    this.playerCtx = null;

    if (release) {
      this.mediaStream = null;
      this.audioCtx = null;
      releaseLiveCapture();
    }
  }
}

/** One console line per capture start: objective signal for device tests. */
function logLiveVoiceAudio(ctx: AudioContext, capture: string) {
  const c = ctx as AudioContext & { outputLatency?: number };
  console.info(
    `[LiveVoice] capture=${capture} ctxRate=${ctx.sampleRate} baseLatency=${
      typeof ctx.baseLatency === "number" ? ctx.baseLatency.toFixed(4) : "n/a"
    } outputLatency=${
      typeof c.outputLatency === "number" ? c.outputLatency.toFixed(4) : "n/a"
    }`,
  );
}

function arrayBufferToBase64Safe(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
