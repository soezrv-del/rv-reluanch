/**
 * Live Grok Voice — iOS WKWebView / Capacitor capture helpers.
 *
 * Confirmed iPhone TestFlight failure: getUserMedia + AudioContext.resume()
 * must start in the mic TAP, before any token/WebSocket await. After those
 * awaits, WKWebView treats the gesture as spent → NotAllowedError or a
 * suspended AudioContext (silent mic / silent Grok).
 *
 * Native Grok.app uses a dedicated iOS audio session. The WebView shell
 * cannot match that 1:1; this is the closest path the web + xAI Realtime
 * API allow. AVAudioSession playAndRecord lives in AppDelegate (TestFlight).
 */

import {
  HONESTY_STANDING_POLICY,
  RV_GROK_SESSION_INTRO,
  SALES_MISSION_POLICY,
  VOICE_SESSION_INTRO_INSTRUCTIONS,
} from "./speechPolicy.ts";
import { PCM_SAMPLE_RATE, RV_VOICE_INSTRUCTIONS } from "./voice.ts";

export type LiveVoicePrewarm = {
  audioCtx: AudioContext | null;
  streamPromise: Promise<MediaStream> | null;
  gestureAt: number;
  error: Error | null;
};

export type LiveVoiceErrorKind =
  | "permission"
  | "token"
  | "network"
  | "account"
  | "unknown";

export type ClassifiedLiveVoiceError = {
  kind: LiveVoiceErrorKind;
  message: string;
};

export type RetainedLiveCapture = {
  stream: MediaStream;
  ctx: AudioContext;
};

let retained: RetainedLiveCapture | null = null;

const MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
  },
  video: false,
};

export function getAudioContextCtor(): (typeof AudioContext) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext || w.webkitAudioContext || null;
}

/**
 * Call this synchronously from the mic / Live Voice tap — no awaits above it.
 * Does NOT force sampleRate: 24000 (iOS often rejects or silently ignores that).
 */
export function beginLiveVoiceFromUserGesture(): LiveVoicePrewarm {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      audioCtx: null,
      streamPromise: null,
      gestureAt: 0,
      error: new Error("Microphone is not available here."),
    };
  }

  let audioCtx: AudioContext | null = null;
  let streamPromise: Promise<MediaStream> | null = null;
  let error: Error | null = null;

  const existing = getRetainedLiveCapture();
  if (existing) {
    if (existing.ctx.state === "suspended") void existing.ctx.resume();
    return {
      audioCtx: existing.ctx,
      streamPromise: Promise.resolve(existing.stream),
      gestureAt: Date.now(),
      error: null,
    };
  }

  try {
    const AC = getAudioContextCtor();
    if (AC) {
      audioCtx = new AC();
      if (audioCtx.state === "suspended") void audioCtx.resume();
    }
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
  }

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "This iPhone shell cannot reach the microphone. Update RVFAX from TestFlight, then Settings → RVFAX → Microphone → On.",
      );
    }
    streamPromise = navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
  }

  return {
    audioCtx,
    streamPromise,
    gestureAt: Date.now(),
    error,
  };
}

export function retainLiveCapture(stream: MediaStream, ctx: AudioContext) {
  retained = { stream, ctx };
}

export function getRetainedLiveCapture(): RetainedLiveCapture | null {
  if (!retained) return null;
  const live = retained.stream
    .getAudioTracks()
    .some((t) => t.readyState === "live");
  if (!live || retained.ctx.state === "closed") {
    retained = null;
    return null;
  }
  return retained;
}

export function releaseLiveCapture() {
  const cap = retained;
  retained = null;
  cap?.stream.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* */
    }
  });
  if (cap?.ctx && cap.ctx.state !== "closed") {
    void cap.ctx.close();
  }
}

/**
 * Native xAI Realtime tools. Voice docs require this on session.update —
 * without it Grok connects but cannot browse, so it hedges EST / low
 * confidence on coach specs. Server-side: xAI runs the search; the
 * client does not submit tool outputs.
 * https://docs.x.ai/developers/model-capabilities/audio/voice
 */
export const REALTIME_SESSION_TOOLS = [{ type: "web_search" }] as const;

export function buildRealtimeSessionUpdate(
  voiceId: string,
  speed = 1,
  catalogContext?: string,
): Record<string, unknown> {
  const clamped = Math.min(1.5, Math.max(0.7, speed));
  const extra = (catalogContext || "").trim();
  const gap = extra
    ? extra
    : "CATALOG GAP — no verified row is loaded. WEB RESEARCH is required this turn — not last resort. Then answer with a labeled EST / typical class range if still unpinned — never as an OEM pin. Never silent-invent HP, engine, chassis, or fuel as OEM fact. Year / make / model reports use the big brochure catalog when a lock is present — never own-lot. Inventory / in-stock / look-in-my-inventory / do-we-have asks: if an OWN-LOT INVENTORY block is injected, answer from that block briefly — never say catalog gap, check your own lot listing, not in listings for a catalog-known coach, or swap a sibling series.";
  const instructions = `${RV_VOICE_INSTRUCTIONS}\n\n${gap}\n\nPERSONA: You are RV Grok — sales-floor wingman on Live Voice. Every question matters. Answer WHATEVER they ask at 100% — spec report when they name a coach, and anything else they fire. Never refuse, deflect, or narrow with "I only focus on this coach", "I only focus on RVs", or "That's outside my scope." A new question always wins over a prior coach lock. When they name year, make, and model, speak one 30–60 second report on that exact unit — identity, class, dimensions, garage, beds, baths, slides, GVWR/GCWR/UVW/NCC/hitch, holding tanks (fresh/gray/black gallons when known — never invent), engine/hp/torque/transmission/fuel, power-to-weight, payload reality, tow capacity, safety flags, features, price. Short specific sentences. No bullets or markdown. This session has native web_search — use it for every spec / GVWR / engine / pricing ask. Never EST / low confidence when a live source exists. If search returns nothing, say so and retry once. Never silent-invent specs as OEM fact. If live notes confirm a fact, speak it. Catalog option-band fields may still be a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. Desk stays on the Facts snapshot. If LOCKED WEIGHTS or the desk sheet lists VERIFIED / non-GAP GVWR, speak that number — never say you don't have GVWR. Dual output: spoken report plus the on-screen structured desk sheet — do not emit a second markdown Spec Sheet. Attached images are mood only, never a spec source. If the ask needs research, say a standing hold then STILL answer.\n\n${SALES_MISSION_POLICY}\n${HONESTY_STANDING_POLICY}\n\nSESSION START: You will be cued once to introduce yourself. Say exactly: ${RV_GROK_SESSION_INTRO} Then listen. Never repeat this intro.`;
  return {
    type: "session.update",
    session: {
      instructions,
      voice: voiceId,
      turn_detection: {
        type: "server_vad",
        threshold: 0.45,
        prefix_padding_ms: 280,
        silence_duration_ms: 650,
      },
      audio: {
        input: {
          format: { type: "audio/pcm", rate: PCM_SAMPLE_RATE },
        },
        output: {
          format: { type: "audio/pcm", rate: PCM_SAMPLE_RATE },
          speed: clamped,
        },
      },
      tools: [{ type: "web_search" }],
    },
  };
}

/** First-turn Live Voice cue — spoken once when the session opens. */
export function buildSessionIntroResponse(): Record<string, unknown> {
  return {
    type: "response.create",
    response: {
      modalities: ["text", "audio"],
      instructions: VOICE_SESSION_INTRO_INSTRUCTIONS,
    },
  };
}

/** Server mint order: xAI client_secrets when the key is present, else worker. */
export function tokenMintPlan(hasXaiKey: boolean): Array<"xai" | "worker"> {
  return hasXaiKey ? ["xai", "worker"] : ["worker"];
}

const PERMISSION_MSG =
  "Microphone is blocked. On iPhone: Settings → RVFAX → Microphone → On, then tap the mic again.";

const TOKEN_MSG =
  "Could not start Live Voice (connection token). Stay on this screen and tap the mic again in a few seconds.";

const NETWORK_MSG =
  "Live Voice could not reach Grok. Check the phone’s internet, then tap the mic again.";

const ACCOUNT_MSG =
  "Live Voice isn’t enabled on this xAI account. Chat still works — tap the mic again after the account is enabled.";

export function classifyLiveVoiceError(raw: unknown): ClassifiedLiveVoiceError {
  const text = raw instanceof Error ? raw.message : String(raw ?? "");
  const t = text.toLowerCase();

  if (
    /notallowederror|permission denied|notallowed|getusermedia|microphone is blocked|microphone is not available/i.test(
      text,
    )
  ) {
    return { kind: "permission", message: PERMISSION_MSG };
  }
  if (/securityerror|the request is not allowed/i.test(text)) {
    return { kind: "permission", message: PERMISSION_MSG };
  }

  if (
    /voice token|client_secret|ephemeral|missing token/i.test(text) &&
    !/403/.test(text)
  ) {
    return { kind: "token", message: TOKEN_MSG };
  }

  // xAI realtime 403 on the socket/token — not the iPhone mic prompt
  if (
    /403/.test(text) &&
    /xai|realtime|voice|does not have permission/i.test(text)
  ) {
    return { kind: "account", message: ACCOUNT_MSG };
  }

  if (
    /websocket|failed to open|connect timeout|failed to fetch|502|network|load failed/i.test(
      t,
    )
  ) {
    return { kind: "network", message: NETWORK_MSG };
  }

  if (!text.trim()) {
    return { kind: "unknown", message: "Could not start Live Voice. Tap the mic again." };
  }
  return { kind: "unknown", message: text };
}

/** Invariant for tests: capture starts before token/socket work. */
export function liveVoiceStartOrder(): readonly ["gesture-capture", "token", "websocket"] {
  return ["gesture-capture", "token", "websocket"];
}
