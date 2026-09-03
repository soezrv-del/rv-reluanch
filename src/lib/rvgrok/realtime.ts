import {
  DEFAULT_VOICE,
  PCM_SAMPLE_RATE,
  XAI_REALTIME_URL,
  base64ToArrayBuffer,
  fetchEphemeralToken,
  floatTo16BitPCM,
  resampleFloat32,
} from "./voice";
import {
  beginLiveVoiceFromUserGesture,
  buildRealtimeSessionUpdate,
  getRetainedLiveCapture,
  releaseLiveCapture,
  retainLiveCapture,
  type LiveVoicePrewarm,
} from "./liveVoice";
import type { ActiveCoach } from "../rv/activeCoach";
import { buildChatGrounding } from "./grounding";
import {
  decideVoiceWebResearch,
  fetchVoiceWebResearchNotes,
  formatVoiceWebSearchInjection,
  VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
} from "./voiceWeb";

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
  onAssistantDelta: (text: string) => void;
  onAssistantDone: (text: string) => void;
  onError: (message: string) => void;
  /** Fired when the socket drops unexpectedly (not after intentional stop) */
  onDisconnected?: (reason: string) => void;
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
export class GrokRealtimeSession {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private mute: GainNode | null = null;
  private nextPlayTime = 0;
  private playSources: AudioBufferSourceNode[] = [];
  private assistantText = "";
  private closed = false;
  private intentionalStop = false;
  private suppressMic = false;
  private finishedAssistantOnce = false;
  private handlers: RealtimeHandlers;
  private voiceId: string;
  private speed: number;
  private catalogContext: string;
  private facts: ActiveCoach | null;
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;
  private earlyPcm: ArrayBuffer[] = [];
  private readonly maxEarlyChunks = 48;
  private researchAbort: AbortController | null = null;
  private researchPhase: "idle" | "holding" | "searching" | "answering" =
    "idle";
  private pendingResearchInjection: string | null = null;
  private lastResearchTranscript = "";

  constructor(
    handlers: RealtimeHandlers,
    voiceId = DEFAULT_VOICE,
    opts?: {
      speed?: number;
      catalogContext?: string;
      facts?: ActiveCoach | null;
    },
  ) {
    this.handlers = handlers;
    this.voiceId = voiceId;
    this.speed = opts?.speed ?? 1;
    this.catalogContext = (opts?.catalogContext || "").trim();
    this.facts = opts?.facts ?? null;
  }

  get isActive() {
    return Boolean(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  async start(prewarm?: LiveVoicePrewarm | null) {
    this.closed = false;
    this.intentionalStop = false;
    this.suppressMic = false;
    this.finishedAssistantOnce = false;
    this.earlyPcm = [];
    this.resetResearchTurn();

    this.handlers.onStatus("connecting", "Allow microphone if the phone asks…");

    // 1) Capture FIRST (same tap). Token + socket in parallel after.
    await this.ensureCapture(prewarm ?? beginLiveVoiceFromUserGesture());
    this.handlers.onStatus("connecting", "Opening Grok Voice…");

    const token = await fetchEphemeralToken();
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
    ws.send(
      JSON.stringify(
        buildRealtimeSessionUpdate(
          this.voiceId,
          this.speed,
          this.catalogContext,
        ),
      ),
    );
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
      this.connectMicGraph();
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
      ctx = new AC();
    }
    if (ctx.state === "suspended") await ctx.resume();
    this.audioCtx = ctx;

    const stream = prewarm.streamPromise
      ? await prewarm.streamPromise
      : await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
          video: false,
        });
    this.mediaStream = stream;
    retainLiveCapture(stream, ctx);
    this.connectMicGraph();
  }

  private connectMicGraph() {
    const ctx = this.audioCtx;
    const stream = this.mediaStream;
    if (!ctx || !stream) return;
    if (this.processor) return;

    const source = ctx.createMediaStreamSource(stream);
    this.source = source;

    const bufferSize = 4096;
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
    this.processor = processor;

    processor.onaudioprocess = (e) => {
      if (this.closed || this.intentionalStop) return;
      if (this.suppressMic) return;

      const input = e.inputBuffer.getChannelData(0);
      const resampled = resampleFloat32(input, ctx.sampleRate, PCM_SAMPLE_RATE);
      const pcm = floatTo16BitPCM(resampled);

      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.earlyPcm.push(pcm);
        if (this.earlyPcm.length > this.maxEarlyChunks) this.earlyPcm.shift();
        return;
      }

      this.sendPcm(pcm);
    };

    source.connect(processor);
    // ScriptProcessor only fires if it reaches destination.
    const mute = ctx.createGain();
    mute.gain.value = 0;
    this.mute = mute;
    processor.connect(mute);
    mute.connect(ctx.destination);
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
        break;

      case "input_audio_buffer.speech_started":
        this.handlers.onStatus("listening", "Hearing you…");
        break;

      case "input_audio_buffer.speech_stopped":
        this.handlers.onStatus("thinking", "Processing…");
        break;

      case "conversation.item.input_audio_transcription.updated": {
        const transcript = String(
          (msg as { transcript?: string }).transcript || "",
        );
        if (transcript) this.handlers.onUserTranscript(transcript);
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const transcript = String(
          (msg as { transcript?: string }).transcript || "",
        );
        if (transcript) {
          this.handlers.onUserTranscript(transcript);
          void this.maybeEnrichWithWebResearch(transcript);
        }
        break;
      }

      case "response.created":
        this.assistantText = "";
        this.finishedAssistantOnce = false;
        this.handlers.onStatus("thinking", "Grok is responding…");
        break;

      case "response.audio_transcript.delta":
      case "response.output_audio_transcript.delta": {
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
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
        this.emitAssistantDone(t);
        break;
      }

      case "response.text.delta": {
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
          this.handlers.onAssistantDelta(this.assistantText);
        }
        break;
      }

      case "response.text.done": {
        const t = String(
          (msg as { text?: string }).text || this.assistantText,
        );
        this.assistantText = t;
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

      case "response.done":
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
        this.scheduleRearm();
        this.assistantText = "";
        this.finishedAssistantOnce = false;
        break;

      case "response.cancelled":
      case "response.cancel":
        if (this.researchPhase !== "idle") {
          // Expected: we cancelled the VAD auto-reply to run web research.
          break;
        }
        this.interruptPlayback();
        this.suppressMic = false;
        this.handlers.onStatus(
          "listening",
          "Interrupted — listening… speak or 📷",
        );
        break;

      case "error": {
        const err = msg.error as { message?: string } | string | undefined;
        const message =
          typeof err === "string"
            ? err
            : err?.message || JSON.stringify(msg).slice(0, 200);
        if (/cancel|interrupt|no active response/i.test(message)) {
          if (this.researchPhase !== "idle") break;
          this.suppressMic = false;
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

  private emitAssistantDone(text: string) {
    if (this.researchPhase === "holding" || this.researchPhase === "searching") {
      return;
    }
    if (this.finishedAssistantOnce) return;
    this.finishedAssistantOnce = true;
    if (text) this.handlers.onAssistantDone(text);
  }

  private beginSpeaking() {
    this.suppressMic = true;
    this.handlers.onStatus("speaking", "RvGrok speaking…");
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
  }

  /** After Grok finishes, wait for audio queue to drain, then open mic again */
  private scheduleRearm() {
    if (this.rearmTimer) clearTimeout(this.rearmTimer);

    const waitMs = (() => {
      if (!this.audioCtx || this.audioCtx.state === "closed") return 450;
      const remaining = Math.max(
        0,
        (this.nextPlayTime - this.audioCtx.currentTime) * 1000,
      );
      return Math.min(Math.max(remaining + 350, 450), 12000);
    })();

    this.handlers.onStatus("speaking", "Finishing reply…");
    this.rearmTimer = setTimeout(() => {
      this.rearmTimer = null;
      if (this.closed || this.intentionalStop) return;
      this.suppressMic = false;
      this.handlers.onStatus(
        "listening",
        "Listening continuously — your turn",
      );
    }, waitMs);
  }

  private async enqueuePcmPlayback(pcm: ArrayBuffer) {
    try {
      const ctx = this.audioCtx;
      if (!ctx || ctx.state === "closed") return;
      if (ctx.state === "suspended") await ctx.resume();

      const int16 = new Int16Array(pcm);
      if (int16.length === 0) return;
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = (int16[i] ?? 0) / 0x8000;
      }

      const play = resampleFloat32(float32, PCM_SAMPLE_RATE, ctx.sampleRate);
      const buffer = ctx.createBuffer(1, play.length, ctx.sampleRate);
      buffer.getChannelData(0).set(play);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now + 0.02, this.nextPlayTime);
      src.start(startAt);
      this.nextPlayTime = startAt + buffer.duration;
      this.playSources.push(src);
      src.onended = () => {
        this.playSources = this.playSources.filter((s) => s !== src);
      };
    } catch {
      /* ignore playback glitches */
    }
  }

  stop(opts?: { keepCapture?: boolean }) {
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
    this.suppressMic = true;
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
      this.suppressMic = false;
      return false;
    }
  }

  /**
   * Inject plain text into the live session (vision-first live photo path).
   */
  injectUserNote(
    text: string,
    requestResponse = true,
    responseInstructions?: string,
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
        this.suppressMic = true;
        this.handlers.onStatus("thinking", "Photo ready — responding…");
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

  /**
   * Pre-turn enrichment: `buildChatGrounding` + shared `needsWebFallback`
   * (same detector as text chat). Cancel the VAD auto-reply, speak a short hold,
   * fetch web notes with a 7s bound, then answer from the notes (or
   * honestly fall back if the lookup is slow or fails).
   */
  private async maybeEnrichWithWebResearch(transcript: string) {
    const grounded = buildChatGrounding({
      query: transcript,
      facts: this.facts,
    });
    const decision = decideVoiceWebResearch({
      transcript,
      specs: grounded.specs,
      catalogBlock: grounded.block || this.catalogContext,
    });
    if (decision.action !== "research") return;
    if (this.closed || this.intentionalStop) return;

    const key = transcript.trim();
    if (this.lastResearchTranscript === key && this.researchPhase !== "idle") {
      return;
    }
    this.lastResearchTranscript = key;

    this.researchAbort?.abort();
    this.researchAbort = new AbortController();
    this.pendingResearchInjection = null;
    this.researchPhase = "holding";

    this.cancelAutoResponseForResearch();
    this.handlers.onStatus("thinking", "Looking that up…");
    this.speakResearchHold();

    const result = await fetchVoiceWebResearchNotes({
      query: decision.query,
      catalogContext: decision.catalogBlock || this.catalogContext,
      signal: this.researchAbort.signal,
    });

    if (this.closed || this.intentionalStop) return;
    if (this.researchAbort.signal.aborted) return;

    const injection = formatVoiceWebSearchInjection(result);
    if (this.researchPhase === "holding") {
      this.pendingResearchInjection = injection;
      return;
    }
    this.researchPhase = "answering";
    this.flushResearchAnswer(injection);
  }

  private cancelAutoResponseForResearch() {
    this.interruptPlayback();
    this.suppressMic = true;
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

  private flushResearchAnswer(injection: string) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.researchPhase = "idle";
      return;
    }
    this.suppressMic = true;
    this.handlers.onStatus("thinking", "Answering…");
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
            instructions: VOICE_RESEARCH_ANSWER_INSTRUCTIONS,
          },
        }),
      );
    } catch {
      this.researchPhase = "idle";
      this.suppressMic = false;
    }
  }

  private resetResearchTurn() {
    this.researchAbort?.abort();
    this.researchAbort = null;
    this.researchPhase = "idle";
    this.pendingResearchInjection = null;
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
    this.suppressMic = false;
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
    for (const src of this.playSources) {
      try {
        src.stop(0);
      } catch {
        /* already stopped */
      }
      try {
        src.disconnect();
      } catch {
        /* */
      }
    }
    this.playSources = [];
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.nextPlayTime = this.audioCtx.currentTime;
    } else {
      this.nextPlayTime = 0;
    }
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

    for (const src of this.playSources) {
      try {
        src.stop(0);
      } catch {
        /* */
      }
    }
    this.playSources = [];
    this.nextPlayTime = 0;

    if (release) {
      this.mediaStream = null;
      this.audioCtx = null;
      releaseLiveCapture();
    }
  }
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
