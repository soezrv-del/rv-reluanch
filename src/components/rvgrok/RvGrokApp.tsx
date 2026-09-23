import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  History,
  Plus,
  Radio,
  Sparkles,
  Square,
  SwitchCamera,
  Volume2,
} from "lucide-react";
import type { AgentStep, ChatSession, Message } from "@/lib/rvgrok/types";
import { AGENT_MODE_KEY } from "@/lib/rvgrok/types";
import {
  deleteSession,
  loadSessions,
  upsertSession,
} from "@/lib/rvgrok/history";
import { streamChat } from "@/lib/rvgrok/stream";
import { GrokRealtimeSession } from "@/lib/rvgrok/realtime";
import { buildChatGrounding, buildVoiceGrounding } from "@/lib/rvgrok/grounding";
import { parseCoachFromText } from "@/lib/rvgrok/parseCoach";
import {
  resolveDeskSheet,
  resolveDeskSheetThenFallback,
  type DeskSheetPayload,
} from "@/lib/rvgrok/deskSheet";
import {
  deskRevealAfterIndex,
  shouldShowPendingLiveDesk,
} from "@/lib/rvgrok/deskSheetLayout";
import { DeskSpecSheet } from "./DeskSpecSheet";
import { GrokExtrasRail } from "./GrokExtrasRail";
import { formatFeedbackContext } from "@/lib/rvgrok/answerFeedback";
import { readActiveCoach } from "@/lib/rv/activeCoach";
import { ensureCatalogLoaded } from "@/lib/rv/catalogLoad";
import type { RealtimeStatus } from "@/lib/rvgrok/realtime";
import type { GrokVoice } from "@/lib/rvgrok/voice";
import {
  beginLiveVoiceFromUserGesture,
  classifyLiveVoiceError,
  type LiveVoicePrewarm,
} from "@/lib/rvgrok/liveVoice";
import {
  DEFAULT_VOICE,
  LIVE_VOICE_KEY,
  VOICE_MODE_KEY,
  VOICE_SPEED_KEY,
  VOICE_STORAGE_KEY,
  createPushToTalkRecognition,
  getSpeechRecognitionCtor,
  speakWithBrowserTts,
  stopBrowserTts,
} from "@/lib/rvgrok/voice";
import {
  buildUserContent,
  captureVideoFrame,
  compressImageToDataUrl,
  startVideoFramePump,
} from "@/lib/rvgrok/vision";
import { planGrokTabEntry } from "@/lib/rvgrok/tabEntry";
import { useAccessOptional } from "@/components/access/AccessProvider";
import { takeSessionWelcome, welcomeBackLine } from "@/lib/access/identity";
import {
  RV_GROK_SESSION_INTRO,
  sessionIntroLine,
} from "@/lib/rvgrok/speechPolicy";
import { cn, uid } from "@/lib/utils";
import { followUpChipsForThread } from "@/lib/rvgrok/followUpChips";
import { MessageBubble } from "./MessageBubble";
import { HistoryPanel } from "./HistoryPanel";
import { VoicePanel } from "./VoicePanel";
import { GrokComposer } from "./GrokComposer";
import {
  GrokLanding,
  GrokToolbarButton,
  grokStatusLabel,
  type GrokStarter,
} from "./GrokLanding";
import {
  scrollFieldIntoVisibleArea,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";
import {
  grokComposerKeyboardLift,
  grokScrollKeyboardPad,
} from "@/lib/rvgrok/keyboardSafe";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { PullRefreshLayer } from "@/components/shell/PullResetHint";
import { SuiteRaidhoBackdrop } from "@/components/shell/SuitePage";
import { PremiumMenuButton } from "@/components/shell/PremiumMenuButton";

const GROK_STARTERS: GrokStarter[] = [
  {
    title: "Match me to a coach",
    line: "Budget, who travels, nights out",
    prompt:
      "Match me to an RV. Ask only what you still need: budget, who travels (kids/pets), ZIP, nights vs full-time, and whether I already have a truck. Then recommend 2–3 coach CLASSES with one example year/make/model each I can look up in RvFACTS. Do not invent a dealer listing or say a unit is for sale. EST. payment if I gave a price. If I have a truck, say what to check in RvTow.",
  },
  {
    title: "Troubleshoot my RV",
    line: "Symptom first — then a safe next step",
    prompt:
      "Help me troubleshoot my RV. Ask what is going wrong (symptom, when it started, year/make/model if I know it). If a photo would help, tell me to use the camera. Give a short, safe diagnosis path: likely cause, what to check first, and when to stop and call a tech. Do not guess a recall or invent a parts number. Keep steps I can do at a campsite without specialty tools.",
  },
];

export type RvGrokVariant = "page" | "embedded";

export function RvGrokApp({
  seedPrompt,
  onSeedConsumed,
  active = true,
  entryToken = 0,
  variant = "page",
}: {
  seedPrompt?: string;
  onSeedConsumed?: () => void;
  active?: boolean;
  /** Bumps on every Grok tab entry (dock tap included) so a remounted pane resets. */
  entryToken?: number;
  /**
   * `page` (default) — Grok tab: suite backdrop, gold-trim chrome, pull-to-reset.
   * `embedded` — Ask Grok overlay mount: same chat stack, no suite-page chrome
   * and no History/Agent/Voice toolbar (overlay owns the one header).
   */
  variant?: RvGrokVariant;
} = {}) {
  const embedded = variant === "embedded";
  const access = useAccessOptional();
  const [welcomeBack, setWelcomeBack] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [voiceMode, setVoiceMode] = useState(false);
  const [liveVoice, setLiveVoice] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("idle");
  const [realtimeDetail, setRealtimeDetail] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [liveCam, setLiveCam] = useState(false);
  const [camFacing, setCamFacing] = useState<"environment" | "user">(
    "environment",
  );
  const [keepShowing, setKeepShowing] = useState(false);
  const [liveDeskSheet, setLiveDeskSheet] = useState<DeskSheetPayload | null>(
    null,
  );
  const [frameBusy, setFrameBusy] = useState(false);
  const [lastSentFrame, setLastSentFrame] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const pumpCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopPumpRef = useRef<(() => void) | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const lastLiveFrameAt = useRef(0);
  const kb = useKeyboardInset();
  const composerLift = grokComposerKeyboardLift({
    open: kb.open,
    inset: kb.inset,
    vvHeight: kb.vvHeight,
    vvOffsetTop: kb.vvOffsetTop,
    layoutHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const scrollKbPad = grokScrollKeyboardPad(kb.open);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<ReturnType<
    typeof createPushToTalkRecognition
  > | null>(null);
  const finalTranscriptRef = useRef("");
  const realtimeRef = useRef<GrokRealtimeSession | null>(null);
  const liveUserMsgId = useRef<string | null>(null);
  const liveAsstMsgId = useRef<string | null>(null);
  const liveDeskSheetRef = useRef<DeskSheetPayload | null>(null);
  const voiceModeRef = useRef(voiceMode);
  const liveVoiceRef = useRef(liveVoice);
  const liveCamRef = useRef(false);
  const isLoadingRef = useRef(false);
  const sendGenRef = useRef(0);
  const sessionsRef = useRef(sessions);
  const messagesRef = useRef(messages);
  const sessionIdRef = useRef(sessionId);
  const startingLiveRef = useRef(false);
  const continuousLoopRef = useRef(false);
  const skipNextAutoRecordRef = useRef(false);
  const sendMessageRef = useRef<
    (
      text?: string,
      opts?: { fromVoice?: boolean; image?: string; liveFrame?: boolean },
    ) => Promise<void>
  >(async () => {});
  const startLiveSessionRef = useRef<
    (prewarm?: LiveVoicePrewarm | null) => Promise<void>
  >(async () => {});
  const startPushToTalkRef = useRef<() => void>(() => {});

  useEffect(() => {
    return () => {
      stopBrowserTts();
      recognitionRef.current?.abort();
      realtimeRef.current?.stop();
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!kb.open && composerLift <= 0) return;
    const root = listRef.current?.closest("[data-rvgrok-wingman]");
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !root?.contains(active)) return;
    const tag = active.tagName;
    if (tag !== "TEXTAREA" && tag !== "INPUT") return;
    const timers = [50, 220, 420].map((ms) =>
      window.setTimeout(
        () => scrollFieldIntoVisibleArea(active, kb.inset || composerLift),
        ms,
      ),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [kb.open, kb.inset, kb.vvHeight, composerLift]);

  useEffect(() => {
    try {
      if (localStorage.getItem(AGENT_MODE_KEY) === "true") setAgentMode(true);
      const v = localStorage.getItem(VOICE_STORAGE_KEY);
      if (v) setSelectedVoice(v);
      const sp = localStorage.getItem(VOICE_SPEED_KEY);
      if (sp) {
        const n = Number(sp);
        if (Number.isFinite(n) && n > 0) setPlaybackSpeed(n);
      }
      if (localStorage.getItem(VOICE_MODE_KEY) === "true") setVoiceMode(true);
      if (localStorage.getItem(LIVE_VOICE_KEY) === "true") {
        setLiveVoice(true);
        liveVoiceRef.current = true;
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const toggleAgentMode = () => {
    setAgentMode((v) => {
      const next = !v;
      try {
        localStorage.setItem(AGENT_MODE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const persistVoice = (id: string) => {
    setSelectedVoice(id);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const persistSpeed = (s: number) => {
    setPlaybackSpeed(s);
    try {
      localStorage.setItem(VOICE_SPEED_KEY, String(s));
    } catch {
      /* ignore */
    }
  };

  const stopLiveSession = useCallback((opts?: { disarm?: boolean }) => {
    startingLiveRef.current = false;
    realtimeRef.current?.stop();
    realtimeRef.current = null;
    setRealtimeStatus("idle");
    setRealtimeDetail(null);
    liveUserMsgId.current = null;
    liveAsstMsgId.current = null;
    if (opts?.disarm) {
      liveVoiceRef.current = false;
      setLiveVoice(false);
      try {
        localStorage.setItem(LIVE_VOICE_KEY, "false");
      } catch {
        /* ignore */
      }
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
      setLiveCam(false);
    liveCamRef.current = false;
      liveCamRef.current = false;
    }
  }, []);

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    recognitionRef.current?.abort();
    realtimeRef.current?.stop();
    realtimeRef.current = null;
    startingLiveRef.current = false;
    stopBrowserTts();
    setMessages([]);
    messagesRef.current = [];
    setSessionId(null);
    sessionIdRef.current = null;
    setInput("");
    setPendingImage(null);
    setIsLoading(false);
    isLoadingRef.current = false;
    setIsRecording(false);
    setSpeakingId(null);
    setActiveModel(null);
    setRealtimeStatus("idle");
    setRealtimeDetail(null);
    setInterimTranscript("");
    setVoiceError(null);
    setHistoryOpen(false);
    setVoicePanelOpen(false);
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    setLiveCam(false);
    liveCamRef.current = false;
    setLiveDeskSheet(null);
    liveDeskSheetRef.current = null;
  }, []);

  const pull = usePullToReset(listRef, startNewChat, { enabled: !embedded });

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    continuousLoopRef.current = false;
    skipNextAutoRecordRef.current = true;
    stopLiveSession({ disarm: true });
    stopBrowserTts();
    setIsLoading(false);
    setIsRecording(false);
    setSpeakingId(null);
    setInterimTranscript("");
    setVoiceMode(false);
    voiceModeRef.current = false;
    try {
      localStorage.setItem(VOICE_MODE_KEY, "false");
    } catch {
      /* ignore */
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.streaming
          ? { ...m, streaming: false, content: m.content || "Cancelled." }
          : m,
      ),
    );
  };

  const handleSpeak = useCallback(
    (msgId: string, text: string) => {
      if (speakingId === msgId) {
        stopBrowserTts();
        setSpeakingId(null);
        return;
      }
      stopBrowserTts();
      setSpeakingId(msgId);
      speakWithBrowserTts(text, {
        rate: playbackSpeed,
        onEnd: () => setSpeakingId(null),
      });
    },
    [speakingId, playbackSpeed],
  );

  const handlePreviewVoice = useCallback(
    (voice: GrokVoice) => {
      if (previewingId === voice.id) {
        stopBrowserTts();
        setPreviewingId(null);
        return;
      }
      stopBrowserTts();
      setPreviewingId(voice.id);
      speakWithBrowserTts(
        `Hi, I am ${voice.name}. Your RvGrok voice for RV intelligence.`,
        {
          rate: playbackSpeed,
          onEnd: () => setPreviewingId(null),
        },
      );
    },
    [previewingId, playbackSpeed],
  );

  const onPickImage = useCallback(async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setVoiceError("Please choose a photo (JPEG or PNG).");
      return;
    }
    setImageBusy(true);
    setVoiceError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPendingImage(dataUrl);
    } catch (e) {
      setVoiceError(
        e instanceof Error ? e.message : "Could not process that photo",
      );
    } finally {
      setImageBusy(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (libraryInputRef.current) libraryInputRef.current.value = "";
    }
  }, []);

  const sendMessage = useCallback(
    async (text?: string, opts?: { fromVoice?: boolean; image?: string; liveFrame?: boolean }) => {
      if (
        access &&
        !access.guard(undefined, "Ask Grok is limited to the approved list.")
      ) {
        return;
      }
      const messageText = (text ?? input).trim();
      const image = opts?.image ?? (opts?.liveFrame ? null : pendingImage);
      if ((!messageText && !image) || (isLoadingRef.current && !opts?.liveFrame))
        return;
      if (opts?.liveFrame && abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
        isLoadingRef.current = false;
      }
      const gen = ++sendGenRef.current;
      setInput("");
      setPendingImage(null);
      setInterimTranscript("");
      setVoiceError(null);

      const userMsg: Message = {
        id: uid("u"),
        role: "user",
        content: messageText || (image ? "Analyze this RV photo" : ""),
        timestamp: new Date(),
        imageDataUrl: image || undefined,
      };
      const assistantMsgId = uid("a");
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        streaming: true,
        timestamp: new Date(),
        isAgentMode: agentMode,
        agentSteps: [],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);
      isLoadingRef.current = true;
      scrollToBottom();

      const controller = new AbortController();
      abortRef.current = controller;

      let fullContent = "";
      const liveSteps: AgentStep[] = [];
      const liveImages: string[] = [];
      let unverified = false;

      const stampUnverified = () => {
        unverified = true;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, unverified: true } : m,
          ),
        );
      };

      try {
        const prior = messagesRef.current;
        const history = (
          opts?.liveFrame && image
            ? [
                ...prior
                  .filter((m) => !m.imageDataUrl)
                  .slice(-4)
                  .map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                {
                  role: "user" as const,
                  content: buildUserContent(messageText, image),
                },
              ]
            : [...prior, userMsg].slice(-10).map((m) => ({
                role: m.role,
                content:
                  m.role === "user" && m.imageDataUrl
                    ? buildUserContent(m.content, m.imageDataUrl)
                    : m.content,
              }))
        );

        const facts = readActiveCoach();
        // User turns only — assistant "catalog locked to Lineage" must not
        // refill extraText and steal a newly named Integra / Entegra ask.
        const extraText = history
          .filter((m) => m.role === "user")
          .map((m) => (typeof m.content === "string" ? m.content : ""))
          .join("\n");
        const preview = buildChatGrounding({
          query: messageText,
          facts,
          extraText,
          agentMode,
        });
        if (preview.identity) {
          try {
            await ensureCatalogLoaded();
          } catch {
            /* pin + thin index still ground */
          }
        }
        const grounded = buildChatGrounding({
          query: messageText,
          facts,
          extraText,
          agentMode,
        });
        const deskOpts = {
          query: messageText,
          identity: grounded.identity,
          specs: grounded.specs,
        };
        const deskSheet = resolveDeskSheet(deskOpts);
        if (deskSheet) {
          setLiveDeskSheet(deskSheet);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, deskSheet } : m,
            ),
          );
          void resolveDeskSheetThenFallback(deskOpts, controller.signal).then(
            (next) => {
              if (!next || controller.signal.aborted) return;
              setLiveDeskSheet(next);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, deskSheet: next } : m,
                ),
              );
            },
          );
        } else {
          setLiveDeskSheet(null);
        }

        await streamChat({
          messages: history,
          agentMode,
          signal: controller.signal,
          feedbackContext: formatFeedbackContext(messageText) || undefined,
          catalogContext: grounded.block || undefined,
          wantsWebFallback: grounded.needsWeb,
          accessPhone: access?.phone,
          visitorFirstName:
            access?.allowed && access.name ? access.name : undefined,
          handlers: {
            onModel: (m) => {
              setActiveModel(m);
              if (/demo/i.test(m)) stampUnverified();
            },
            onUpstream: (u) => {
              if (u === "demo" || /demo/i.test(u)) stampUnverified();
            },
            onStep: (step) => {
              const idx = liveSteps.findIndex((s) => s.step === step.step);
              if (idx >= 0) liveSteps[idx] = step;
              else liveSteps.push(step);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        agentSteps: [...liveSteps],
                        generatedImages: [...liveImages],
                        streaming: true,
                        unverified: unverified || m.unverified,
                      }
                    : m,
                ),
              );
              scrollToBottom();
            },
            onImage: (url) => {
              if (!url || liveImages.includes(url)) return;
              liveImages.push(url);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        generatedImages: [...liveImages],
                        agentSteps: [...liveSteps],
                        streaming: true,
                        unverified: unverified || m.unverified,
                      }
                    : m,
                ),
              );
              scrollToBottom();
            },
            onDelta: (delta) => {
              fullContent += delta;
              if (
                !unverified &&
                /\bunverified demo\b|\*\*RvGrok · unverified/i.test(fullContent)
              ) {
                unverified = true;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: fullContent,
                        agentSteps: [...liveSteps],
                        generatedImages: [...liveImages],
                        streaming: true,
                        unverified: unverified || m.unverified,
                      }
                    : m,
                ),
              );
              scrollToBottom();
            },
            onError: (msg) => {
              fullContent = fullContent || `Error: ${msg}`;
            },
          },
        });

        if (agentMode) setActiveModel((m) => m || "grok-4.7 · Agent");

        const finalContent =
          fullContent ||
          (agentMode
            ? "Agent completed research. No summary generated."
            : "Unable to generate a response. Please try again.");

        // Shared engine remount — catalog first, then empty-field fallback.
        const paintedOpts = {
          query: messageText,
          identity: grounded.identity,
          specs: grounded.specs,
          spokenText: finalContent,
          chatSpecBlock: finalContent,
        };
        const paintedDesk = resolveDeskSheet(paintedOpts);
        if (paintedDesk) {
          setLiveDeskSheet(paintedDesk);
        } else {
          setLiveDeskSheet(null);
        }
        void resolveDeskSheetThenFallback(
          paintedOpts,
          controller.signal,
        ).then((next) => {
          if (!next || controller.signal.aborted) return;
          setLiveDeskSheet(next);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, deskSheet: next } : m,
            ),
          );
        });

        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: finalContent,
                  streaming: false,
                  isAgentMode: agentMode,
                  agentSteps: [...liveSteps],
                  generatedImages: [...liveImages],
                  unverified,
                  deskSheet: paintedDesk || undefined,
                }
              : m,
          );
          const { sessions: next, id } = upsertSession(
            sessionsRef.current,
            updated,
            sessionIdRef.current,
          );
          sessionsRef.current = next;
          setSessions(next);
          if (id !== sessionIdRef.current) {
            sessionIdRef.current = id;
            setSessionId(id);
          }
          return updated;
        });

        const shouldSpeak =
          (voiceModeRef.current ||
            opts?.fromVoice ||
            liveCamRef.current) &&
          !liveVoiceRef.current &&
          finalContent &&
          !controller.signal.aborted;

        if (
          opts?.liveFrame &&
          realtimeRef.current?.isActive &&
          finalContent &&
          !controller.signal.aborted
        ) {
          realtimeRef.current.injectUserNote(
            `VISION of the user's live camera JPEG (you can treat this as what you saw): ${finalContent.slice(0, 900)}. Speak to that. Never say you cannot see an image.`,
            true,
            "The user showed a live camera photo. Read the vision description as ground truth and coach them in under 20 seconds. Do not say you lack a camera.",
          );
        } else if (shouldSpeak) {
          setSpeakingId(assistantMsgId);
          speakWithBrowserTts(finalContent, {
            rate: playbackSpeed,
            onEnd: () => {
              setSpeakingId(null);
              if (
                continuousLoopRef.current &&
                !skipNextAutoRecordRef.current &&
                !liveVoiceRef.current
              ) {
                window.setTimeout(() => startPushToTalkRef.current(), 280);
              }
              skipNextAutoRecordRef.current = false;
            },
          });
        } else if (
          continuousLoopRef.current &&
          opts?.fromVoice &&
          !liveVoiceRef.current &&
          !controller.signal.aborted
        ) {
          window.setTimeout(() => startPushToTalkRef.current(), 400);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
        const msg =
          err instanceof Error ? err.message : "Failed to connect";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `Error: ${msg}. Please try again.`,
                  streaming: false,
                }
              : m,
          ),
        );
      } finally {
        if (gen === sendGenRef.current) {
          abortRef.current = null;
          setIsLoading(false);
          isLoadingRef.current = false;
        }
        scrollToBottom();
      }
    },
    [
      access,
      input,
      pendingImage,
      agentMode,
      scrollToBottom,
      playbackSpeed,
    ],
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const startPushToTalk = useCallback(() => {
    if (liveVoiceRef.current) return;
    if (!getSpeechRecognitionCtor()) {
      setVoiceError(
        "Speech recognition not supported here. Tap the mic for Live Grok Voice instead.",
      );
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }

    stopBrowserTts();
    setSpeakingId(null);
    setVoiceError(null);
    finalTranscriptRef.current = "";
    setInterimTranscript("");
    skipNextAutoRecordRef.current = false;

    const rec = createPushToTalkRecognition({
      onInterim: (t) => setInterimTranscript(t),
      onFinal: (t) => {
        finalTranscriptRef.current = (
          finalTranscriptRef.current +
          " " +
          t
        ).trim();
        setInterimTranscript("");
        setInput(finalTranscriptRef.current);
      },
      onError: (err) => {
        if (err !== "aborted" && err !== "no-speech") {
          setVoiceError(`Mic: ${err}`);
        }
        setIsRecording(false);
        if (
          continuousLoopRef.current &&
          (err === "no-speech" || err === "aborted")
        ) {
          window.setTimeout(() => {
            if (continuousLoopRef.current && !liveVoiceRef.current) {
              startPushToTalkRef.current();
            }
          }, 500);
        }
      },
      onEnd: () => {
        setIsRecording(false);
        const spoken = finalTranscriptRef.current.trim();
        finalTranscriptRef.current = "";
        setInterimTranscript("");
        if (spoken) {
          void sendMessageRef.current(spoken, { fromVoice: true });
        } else if (continuousLoopRef.current && !liveVoiceRef.current) {
          window.setTimeout(() => {
            if (continuousLoopRef.current && !liveVoiceRef.current) {
              startPushToTalkRef.current();
            }
          }, 450);
        }
      },
    });
    if (!rec) return;
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
    } catch (e) {
      setVoiceError(
        e instanceof Error ? e.message : "Could not start microphone",
      );
    }
  }, []);

  useEffect(() => {
    startPushToTalkRef.current = startPushToTalk;
  }, [startPushToTalk]);

  const stopPushToTalk = useCallback((opts?: { send?: boolean }) => {
    const shouldSend = opts?.send !== false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsRecording(false);
    const spoken = finalTranscriptRef.current.trim();
    finalTranscriptRef.current = "";
    setInterimTranscript("");
    if (shouldSend && spoken) {
      void sendMessageRef.current(spoken, { fromVoice: true });
    }
  }, []);

  const startLiveSession = useCallback(async (prewarm?: LiveVoicePrewarm | null) => {
    if (startingLiveRef.current) return;
    if (realtimeRef.current?.isActive) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsRecording(false);

    startingLiveRef.current = true;
    stopBrowserTts();
    setSpeakingId(null);
    setVoiceError(null);
    setRealtimeStatus("connecting");
    setRealtimeDetail("Starting Live Voice…");

    const capture = prewarm ?? beginLiveVoiceFromUserGesture();

    const facts = readActiveCoach();
    try {
      await ensureCatalogLoaded();
    } catch {
      /* pins still ground Dream / Vision */
    }
    const catalogContext = buildVoiceGrounding({ facts });

    // Keep the just-opened mic; a full stop() would kill iOS capture.
    realtimeRef.current?.stop({ keepCapture: true });
    realtimeRef.current = null;

    const session = new GrokRealtimeSession(
      {
        onStatus: (s, detail) => {
          setRealtimeStatus(s);
          setRealtimeDetail(detail ?? null);
        },
        onDeskSheet: (sheet) => {
          liveDeskSheetRef.current = sheet;
          setLiveDeskSheet(sheet);
          const asstId = liveAsstMsgId.current;
          if (asstId && sheet) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === asstId ? { ...m, deskSheet: sheet } : m,
              ),
            );
          }
        },
        onUserTranscript: (text) => {
          const uidMsg = liveUserMsgId.current;
          if (uidMsg) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === uidMsg ? { ...m, content: text } : m,
              ),
            );
          } else {
            const id = uid("u-live");
            liveUserMsgId.current = id;
            setMessages((prev) => [
              ...prev,
              {
                id,
                role: "user",
                content: text,
                timestamp: new Date(),
              },
            ]);
          }
          scrollToBottom();
        },
        onAssistantDelta: (text) => {
          let asstId = liveAsstMsgId.current;
          if (!asstId) {
            asstId = uid("a-live");
            liveAsstMsgId.current = asstId;
            if (!liveUserMsgId.current) {
              const uId = uid("u-live");
              liveUserMsgId.current = uId;
              setMessages((prev) => [
                ...prev,
                {
                  id: uId,
                  role: "user",
                  content: "🎤 Listening…",
                  timestamp: new Date(),
                },
                {
                  id: asstId!,
                  role: "assistant",
                  content: text,
                  streaming: true,
                  timestamp: new Date(),
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  id: asstId!,
                  role: "assistant",
                  content: text,
                  streaming: true,
                  timestamp: new Date(),
                },
              ]);
            }
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === asstId
                  ? { ...m, content: text, streaming: true }
                  : m,
              ),
            );
          }
          scrollToBottom();
        },
        onAssistantDone: (text) => {
          const asstId = liveAsstMsgId.current;
          if (asstId) {
            setMessages((prev) => {
              const sheet = liveDeskSheetRef.current;
              const updated = prev.map((m) =>
                m.id === asstId
                  ? {
                      ...m,
                      content: text,
                      streaming: false,
                      deskSheet: sheet || undefined,
                    }
                  : m,
              );
              const { sessions: next, id } = upsertSession(
                sessionsRef.current,
                updated,
                sessionIdRef.current,
              );
              sessionsRef.current = next;
              setSessions(next);
              if (id !== sessionIdRef.current) {
                sessionIdRef.current = id;
                setSessionId(id);
              }
              return updated;
            });
          }
          liveUserMsgId.current = null;
          liveAsstMsgId.current = null;
          scrollToBottom();
        },
        onError: (message) => {
          setVoiceError(message);
          setRealtimeDetail(message);
        },
        onDisconnected: (reason) => {
          realtimeRef.current = null;
          startingLiveRef.current = false;
          if (liveVoiceRef.current) {
            setRealtimeDetail("Reconnecting…");
            setReconnectAttempt((n) => n + 1);
            window.setTimeout(() => {
              if (liveVoiceRef.current) {
                void startLiveSessionRef.current();
              }
            }, 900);
          } else {
            setRealtimeStatus("idle");
            setVoiceError(`Disconnected: ${reason}`);
          }
        },
      },
      selectedVoice,
      {
        speed: playbackSpeed,
        catalogContext,
        facts,
        accessPhone: access?.phone,
        visitorFirstName:
          access?.allowed && access.name ? access.name : undefined,
      },
    );

    realtimeRef.current = session;
    try {
      await session.start(capture);
      setReconnectAttempt(0);
    } catch (e) {
      const classified = classifyLiveVoiceError(e);
      setVoiceError(classified.message);
      setRealtimeStatus("error");
      setRealtimeDetail(classified.message);
      realtimeRef.current = null;
      if (classified.kind === "permission" || classified.kind === "account") {
        liveVoiceRef.current = false;
        setLiveVoice(false);
      } else if (liveVoiceRef.current && reconnectAttempt < 2) {
        window.setTimeout(() => {
          if (liveVoiceRef.current) void startLiveSessionRef.current();
        }, 1200);
      }
    } finally {
      startingLiveRef.current = false;
    }
  }, [
    selectedVoice,
    scrollToBottom,
    reconnectAttempt,
    playbackSpeed,
    access?.phone,
    access?.allowed,
    access?.name,
  ]);

  useEffect(() => {
    startLiveSessionRef.current = startLiveSession;
  }, [startLiveSession]);

  useEffect(() => {
    realtimeRef.current?.setAccessPhone(access?.phone);
    realtimeRef.current?.setVisitorFirstName(
      access?.allowed && access.name ? access.name : "",
    );
  }, [access?.phone, access?.allowed, access?.name]);

  useEffect(() => {
    if (!access?.allowed || !access.name) return;
    if (takeSessionWelcome(access.name)) {
      setWelcomeBack(welcomeBackLine(access.name));
    }
  }, [access?.allowed, access?.name]);

  const setLiveVoiceArmed = useCallback(
    (on: boolean) => {
      liveVoiceRef.current = on;
      setLiveVoice(on);
      try {
        localStorage.setItem(LIVE_VOICE_KEY, String(on));
      } catch {
        /* ignore */
      }

      if (on) {
        continuousLoopRef.current = false;
        try {
          recognitionRef.current?.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
        setIsRecording(false);
        setVoicePanelOpen(false);
        const prewarm = beginLiveVoiceFromUserGesture();
        void startLiveSessionRef.current(prewarm);
      } else {
        stopLiveSession();
        if (voiceModeRef.current) {
          continuousLoopRef.current = true;
          window.setTimeout(() => startPushToTalkRef.current(), 300);
        }
      }
    },
    [stopLiveSession],
  );

  const setVoiceModeArmed = useCallback((on: boolean) => {
    voiceModeRef.current = on;
    setVoiceMode(on);
    try {
      localStorage.setItem(VOICE_MODE_KEY, String(on));
    } catch {
      /* ignore */
    }

    continuousLoopRef.current = on && !liveVoiceRef.current;

    if (on && !liveVoiceRef.current) {
      setVoicePanelOpen(false);
      window.setTimeout(() => startPushToTalkRef.current(), 200);
    } else if (!on && !liveVoiceRef.current) {
      skipNextAutoRecordRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setIsRecording(false);
      stopBrowserTts();
      setSpeakingId(null);
    }
  }, []);

  const stopLiveCamera = useCallback(() => {
    stopPumpRef.current?.();
    stopPumpRef.current = null;
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    setLiveCam(false);
    liveCamRef.current = false;
    setLastSentFrame(null);
  }, []);

  const sendLiveFrame = useCallback(async (force = false) => {
    const video = liveVideoRef.current;
    if (!video) return;
    if (!force && (frameBusy || isLoadingRef.current)) return;
    setFrameBusy(true);
    try {
      const dataUrl = await captureVideoFrame(video, {
        pumpCanvas: pumpCanvasRef.current ?? undefined,
        track: camStreamRef.current?.getVideoTracks()[0] ?? null,
      });
      if (!dataUrl) return;
      lastLiveFrameAt.current = Date.now();
      setLastSentFrame(dataUrl);
      const stamp = new Date().toLocaleTimeString();
      const prompt = `LIVE CAMERA FRAME captured ${stamp}. A JPEG is attached. You CAN see it. Describe ONLY this attached image and the next troubleshooting step. Short. Never say you cannot see an image.`;
      const live = realtimeRef.current;
      if (live?.isActive) {
        try {
          live.prepareForSnapshot();
        } catch {
          /* */
        }
      }
      await sendMessageRef.current(prompt, {
        image: dataUrl,
        fromVoice: true,
        liveFrame: true,
      });
    } finally {
      setFrameBusy(false);
    }
  }, [frameBusy]);

  const startLiveCamera = useCallback(
    async (facing: "environment" | "user" = camFacing) => {
      try {
        camStreamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        camStreamRef.current = stream;
        setCamFacing(facing);
        setLiveCam(true);
        liveCamRef.current = true;
        setPendingImage(null);
        setLastSentFrame(null);
        setVoiceError(null);
      } catch (e) {
        setVoiceError(
          e instanceof Error
            ? e.message
            : "Camera permission denied. Enable Camera for RV Grok in Settings.",
        );
        setLiveCam(false);
        liveCamRef.current = false;
      }
    },
    [camFacing, sendLiveFrame],
  );

  /**
   * Mic button = Live Grok Voice.
   * Tap → start continuous live session; tap again → stop.
   * (Push-to-talk "Voice Mode" stays available from Settings.)
   */
  const handleMicPress = () => {
    const isLive =
      realtimeStatus === "connecting" ||
      realtimeStatus === "listening" ||
      realtimeStatus === "thinking" ||
      realtimeStatus === "speaking";

    if (isLive || realtimeRef.current) {
      stopLiveSession({ disarm: true });
      return;
    }

    if (isRecording) {
      stopPushToTalk({ send: false });
    }

    // Always activate Live Voice from the mic — capture starts in this tap.
    setLiveVoiceArmed(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const entryHandledRef = useRef<{ token: number; seed: string | null } | null>(
    null,
  );

  useEffect(() => {
    if (!active) {
      startNewChat();
      return;
    }

    let handled = entryHandledRef.current;
    if (!handled || handled.token !== entryToken) {
      const plan = planGrokTabEntry(seedPrompt);
      handled = { token: entryToken, seed: plan.seed };
      entryHandledRef.current = handled;
      if (plan.seed) onSeedConsumed?.();
    }

    startNewChat();
    if (!handled.seed) return;

    const seed = handled.seed;
    const t = window.setTimeout(() => {
      void sendMessageRef.current(seed);
    }, 0);
    return () => window.clearTimeout(t);
    // seedPrompt / onSeedConsumed are captured per entryToken. Listing
    // seedPrompt would re-fire after onSeedConsumed clears the parent seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entry-scoped
  }, [active, entryToken, startNewChat]);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);
  useEffect(() => {
    liveVoiceRef.current = liveVoice;
  }, [liveVoice]);

  useEffect(() => {
    const el = liveVideoRef.current;
    const stream = camStreamRef.current;
    if (!liveCam || !el || !stream) return;
    el.srcObject = stream;
    el.muted = true;
    el.playsInline = true;
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    void el.play().catch(() => {});
    if (!pumpCanvasRef.current) {
      pumpCanvasRef.current = document.createElement("canvas");
    }
    stopPumpRef.current?.();
    stopPumpRef.current = startVideoFramePump(el, pumpCanvasRef.current);
    return () => {
      stopPumpRef.current?.();
      stopPumpRef.current = null;
    };
  }, [liveCam]);

  useEffect(() => {
    if (!liveCam || !keepShowing) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastLiveFrameAt.current < 6000) return;
      if (realtimeStatus === "speaking" || realtimeStatus === "thinking")
        return;
      void sendLiveFrame(true);
    }, 7000);
    return () => window.clearInterval(id);
  }, [liveCam, keepShowing, realtimeStatus, sendLiveFrame]);

  const modelLabel = activeModel
    ? activeModel.replace(/grok-/gi, "Grok ").replace(/grok /gi, "Grok ")
    : "Grok 4.5";

  const liveActive =
    realtimeStatus === "connecting" ||
    realtimeStatus === "listening" ||
    realtimeStatus === "thinking" ||
    realtimeStatus === "speaking";

  const continuousArmed = liveActive || (voiceMode && isRecording);
  const waitingToResumeLive =
    liveVoice && !liveActive && !isRecording && !startingLiveRef.current;
  const displayInput = isRecording
    ? interimTranscript || input || "Listening…"
    : input;
  const canSend =
    (Boolean(input.trim()) || Boolean(pendingImage)) &&
    !isLoading &&
    !liveActive;

  const followUps = liveActive
    ? { index: -1, chips: [] as const }
    : followUpChipsForThread(messages);
  const deskAfterIdx = deskRevealAfterIndex(messages);
  const pendingLiveSheet = shouldShowPendingLiveDesk(messages, liveDeskSheet)
    ? liveDeskSheet
    : null;
  const reportSheet =
    (deskAfterIdx >= 0 ? messages[deskAfterIdx].deskSheet : null) ||
    pendingLiveSheet ||
    null;

  const wingmanStatus = grokStatusLabel({
    liveActive,
    realtimeStatus,
    isRecording,
    isLoading,
    speaking: Boolean(speakingId),
  });
  const isLanding = messages.length === 0;
  const composerPlaceholder = isRecording
    ? "Listening… keep talking"
    : liveActive
      ? "Live continuous — just speak"
      : pendingImage
        ? "Ask about this photo…"
        : "Ask RV Grok";
  const nextUnit = GROK_STARTERS.find(
    (s) => s.title !== reportSheet?.title,
  ) ?? GROK_STARTERS[0];

  const composer = (
    <GrokComposer
      displayInput={displayInput}
      onChange={setInput}
      onKeyDown={onKeyDown}
      onSend={() => void sendMessage()}
      onMic={handleMicPress}
      canSend={canSend}
      isLoading={isLoading}
      isRecording={isRecording}
      liveActive={liveActive}
      waitingToResumeLive={waitingToResumeLive}
      pendingImage={pendingImage}
      onClearImage={() => setPendingImage(null)}
      placeholder={composerPlaceholder}
      density={isLanding ? "landing" : "thread"}
      cameraInputRef={cameraInputRef}
      libraryInputRef={libraryInputRef}
      onPickImage={(file) => void onPickImage(file)}
      imageBusy={imageBusy}
      liveCam={liveCam}
      onToggleLiveCam={() =>
        liveCam ? stopLiveCamera() : void startLiveCamera()
      }
    />
  );

  const wingmanToolbar = !embedded ? (
    <>
      <GrokToolbarButton
        label="Chat history"
        onClick={() => setHistoryOpen(true)}
        badge={
          sessions.length > 0
            ? sessions.length > 9
              ? "9+"
              : String(sessions.length)
            : undefined
        }
      >
        <History className="size-4" />
      </GrokToolbarButton>
      <GrokToolbarButton
        label="Agent"
        onClick={toggleAgentMode}
        active={agentMode}
      >
        <Sparkles className="size-3.5" />
      </GrokToolbarButton>
      <GrokToolbarButton
        label="Voice settings"
        onClick={() => setVoicePanelOpen(true)}
        active={liveVoice || voiceMode}
      >
        <Volume2 className="size-4" />
      </GrokToolbarButton>
      {!isLanding ? (
        <GrokToolbarButton label="New chat" onClick={startNewChat}>
          <Plus className="size-4" />
        </GrokToolbarButton>
      ) : null}
      <PremiumMenuButton />
    </>
  ) : null;

  const priorUserAt = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") return messages[i].content || "";
    }
    return "";
  };

  const deskAfterReply = (sheet: DeskSheetPayload, query: string) => (
    <div
      data-rvgrok-report=""
      data-rvgrok-desk-after-reply=""
      className="w-full"
    >
      <DeskSpecSheet sheet={sheet} />
      <GrokExtrasRail
        query={query}
        offerVoiceExtras={sheet.offerVoiceExtras}
        voiceExtraStep={sheet.voiceExtraStep}
        voiceExtraPick={sheet.voiceExtraPick}
        coach={{
          year: sheet.year,
          make: sheet.make,
          model: sheet.model,
          floorplan: sheet.floorplan,
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleStop}
          className="grok-chip inline-flex min-h-11 items-center rounded-full px-4 text-[13px] font-semibold"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={() => {
            const prompt = nextUnit.prompt;
            startNewChat();
            window.setTimeout(() => {
              void sendMessageRef.current(prompt);
            }, 0);
          }}
          className="grok-chip inline-flex min-h-11 items-center rounded-full px-4 text-[13px] font-semibold"
        >
          Next unit
        </button>
      </div>
    </div>
  );

  const thread = (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-3 pb-4 pt-3",
        reportSheet ? "max-w-6xl" : "max-w-2xl",
      )}
    >
      {messages.map((m, i) => (
        <Fragment key={m.id}>
          <MessageBubble
            message={{
              ...m,
              deskSheet: undefined,
            }}
            onSpeak={handleSpeak}
            speakingId={speakingId}
            priorQuery={priorUserAt(i)}
            suggestions={i === followUps.index ? followUps.chips : undefined}
            onSuggestion={(prompt) => void sendMessage(prompt)}
          />
          {i === deskAfterIdx && m.deskSheet
            ? deskAfterReply(m.deskSheet, priorUserAt(i))
            : m.role === "assistant" && !m.streaming
              ? (
                  <GrokExtrasRail
                    query={priorUserAt(i)}
                    coach={parseCoachFromText(
                      `${priorUserAt(i)} ${m.content || ""}`,
                    )}
                  />
                )
              : null}
        </Fragment>
      ))}
      {pendingLiveSheet
        ? deskAfterReply(pendingLiveSheet, priorUserAt(messages.length))
        : null}
    </div>
  );

  const visitorName = access?.allowed && access.name ? access.name : "";
  const sessionGreeting = sessionIntroLine(visitorName);

  const startersOrThread = isLanding ? (
    <GrokLanding
      status={wingmanStatus}
      speaking={realtimeStatus === "speaking" || Boolean(speakingId)}
      lotChip={null}
      starters={GROK_STARTERS}
      onChip={(prompt) => void sendMessage(prompt)}
      toolbar={wingmanToolbar}
      composer={composer}
      hint={
        liveActive
          ? realtimeDetail || "Hands-free · tap mic to end"
          : waitingToResumeLive
            ? "Live Voice armed · tap mic"
            : undefined
      }
      greeting={sessionGreeting}
      welcomeBack={
        sessionGreeting === RV_GROK_SESSION_INTRO
          ? welcomeBack || undefined
          : undefined
      }
    />
  ) : (
    thread
  );

  return (
    <div
      className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden text-fg"
      data-rvgrok-variant={variant}
      data-rvgrok-wingman=""
      data-page-accent={embedded ? undefined : "gold"}
      data-readable-cards=""
      data-raidho-only=""
    >
      {!embedded && (
        <SuiteRaidhoBackdrop bleed className="grok-raidho-field" />
      )}

      {!embedded && !isLanding ? (
        <header
          data-grok-thread-chrome
          className="relative z-10 flex shrink-0 items-center gap-2 px-3 pb-1.5 sm:px-4"
        >
          <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-muted">
            {liveActive
              ? "Live Voice"
              : isRecording
                ? "Listening…"
                : agentMode
                  ? "Agent"
                  : activeModel
                    ? modelLabel
                    : "Ready"}
          </p>
          <div className="flex shrink-0 items-center gap-1">{wingmanToolbar}</div>
        </header>
      ) : null}

      <div
        ref={listRef}
        data-app-scroll
        className="rv-scroll relative z-10 flex-1 overflow-y-auto px-3 sm:px-4"
        style={{
          paddingBottom: scrollKbPad || undefined,
        }}
      >
        {embedded ? (
          startersOrThread
        ) : (
          <PullRefreshLayer
            state={pull}
            label="Release to refresh Grok · new chat"
          >
            {startersOrThread}
          </PullRefreshLayer>
        )}
      </div>

      <div
        data-rvgrok-composer-dock=""
        className={cn(
          "relative z-20 shrink-0 px-3 py-2 sm:px-4",
          isLanding ? "hidden" : "border-t border-white/10",
        )}
        style={{
          paddingBottom: composerLift > 0 ? composerLift : undefined,
        }}
      >
        {(isLoading ||
          messages.some((m) => m.streaming) ||
          isRecording ||
          liveActive ||
          speakingId ||
          continuousArmed) && (
          <button
            type="button"
            onClick={handleStop}
            className="mb-2 flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-sky-300/40 bg-sky-500/25 px-3 py-2.5 text-left transition hover:bg-sky-500/30"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-sky-500 text-white">
              <Square className="size-3.5 fill-current" />
            </span>
            <span className="flex-1 text-[13px] font-medium text-fg">
              {liveActive
                ? `Live continuous · ${realtimeDetail || realtimeStatus} — tap to end`
                : isRecording
                  ? voiceMode
                    ? "Auto-listening — tap to stop hands-free"
                    : "Recording — tap to stop & send"
                  : isLoading
                    ? "Processing — tap to cancel"
                    : "Speaking — tap to stop"}
            </span>
            <span className="text-[11px] font-bold tracking-wide text-sky-100">
              STOP
            </span>
          </button>
        )}

        {liveCam ? (
          <div className="mx-auto mb-2 max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-black">
            <div className="relative aspect-[4/3] w-full bg-black">
              <video
                ref={liveVideoRef}
                className="size-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-ruby/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
              {lastSentFrame ? (
                <span className="absolute right-2.5 top-2.5 overflow-hidden rounded-md border border-white/50 shadow-lg">
                  <img
                    src={lastSentFrame}
                    alt="What Grok just received"
                    className="h-14 w-20 object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center text-[8px] font-bold text-white">
                    SENT
                  </span>
                </span>
              ) : null}
              <div className="absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={frameBusy}
                  onClick={() => void sendLiveFrame(true)}
                  className="rounded-full bg-sky-500 px-3 py-1.5 text-[12px] font-bold text-white"
                >
                  {frameBusy ? "Sending…" : "Show this"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void startLiveCamera(
                      camFacing === "environment" ? "user" : "environment",
                    )
                  }
                  className="rounded-full border border-white/30 bg-black/50 px-2.5 py-1.5 text-white"
                  aria-label="Flip camera"
                >
                  <SwitchCamera className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setKeepShowing((v) => !v)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold text-white",
                    keepShowing
                      ? "border-gold/50 bg-gold/25"
                      : "border-white/30 bg-black/50",
                  )}
                >
                  {keepShowing ? "Keep showing" : "Tap only"}
                </button>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="ml-auto rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white"
                >
                  Close cam
                </button>
              </div>
            </div>
            <p className="px-3 py-1.5 text-[12px] text-white">
              Frame what you want her to see, then tap Show this. The SENT thumbnail is exactly what Grok got.
            </p>
          </div>
        ) : null}

        {liveActive && (
          <div className="mx-auto mb-2 flex max-w-2xl items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/15 px-3 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-sky-500" />
            <Radio className="size-3 text-sky-100" />
            <span className="flex-1 text-[11px] font-medium text-sky-100">
              {realtimeDetail || `Live Grok Voice · ${realtimeStatus}`}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted">
              {selectedVoice}
            </span>
          </div>
        )}

        {waitingToResumeLive && (
          <button
            type="button"
            onClick={() => void startLiveSession()}
            className="mx-auto mb-2 flex w-full max-w-2xl items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/15 px-3 py-2 text-left transition hover:bg-sky-500/25"
          >
            <Radio className="size-3.5 text-sky-100" />
            <span className="flex-1 text-[12px] font-semibold text-sky-100">
              Live Voice armed — tap mic to resume
            </span>
            <span className="text-[10px] font-bold text-muted">RESUME</span>
          </button>
        )}

        {voiceError && (
          <p className="mx-auto mb-2 max-w-2xl rounded-md border border-sky-300/40 bg-sky-500/15 px-3 py-1.5 text-center text-[11px] text-sky-100">
            {voiceError}
          </p>
        )}

        {isLanding ? null : <div className="mx-auto max-w-2xl">{composer}</div>}

        {liveActive || waitingToResumeLive || pendingImage ? (
          <p className="mx-auto mt-1.5 max-w-2xl text-center text-[11px] text-muted">
            {liveActive
              ? "Hands-free · tap mic to end"
              : waitingToResumeLive
                ? "Live Voice armed · tap mic"
                : "Photo attached · send or add a question"}
          </p>
        ) : null}
      </div>

      <HistoryPanel
        open={historyOpen}
        sessions={sessions}
        onClose={() => setHistoryOpen(false)}
        onLoad={(s) => {
          setSessionId(s.id);
          setLiveDeskSheet(null);
          liveDeskSheetRef.current = null;
          setMessages(
            (s.messages ?? []).map((m) => ({
              ...m,
              timestamp:
                m.timestamp instanceof Date
                  ? m.timestamp
                  : new Date(m.timestamp),
            })),
          );
        }}
        onDelete={(id) => {
          const next = deleteSession(sessions, id);
          setSessions(next);
          if (sessionId === id) startNewChat();
        }}
        onNewChat={startNewChat}
      />

      <VoicePanel
        open={voicePanelOpen}
        onClose={() => {
          setVoicePanelOpen(false);
          stopBrowserTts();
          setPreviewingId(null);
        }}
        selectedId={selectedVoice}
        onSelect={persistVoice}
        voiceMode={voiceMode}
        onVoiceModeChange={setVoiceModeArmed}
        liveVoice={liveVoice}
        onLiveVoiceChange={setLiveVoiceArmed}
        playbackSpeed={playbackSpeed}
        onSpeedChange={persistSpeed}
        onPreview={handlePreviewVoice}
        previewingId={previewingId}
      />
    </div>
  );
}
