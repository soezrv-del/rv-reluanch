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
  DEFAULT_PROMPT_LESSONS,
  formatPromptLessons,
  injectStandingLessons,
} from "./promptLessons.ts";
import {
  sessionIntroLine,
  VOICE_RESEARCH_HOLD_PHRASE,
  voiceSessionIntroInstructions,
  visitorPersonalizationBlock,
} from "./speechPolicy.ts";
import {
  SCREEN_GUIDE_PREAMBLE,
  formatScreenContext,
  stripScreenContext,
} from "./screenGuides.ts";
import { DAVID_HANSEN_STORY, PEOPLE_FACTS_RULE } from "./originStory.ts";
import { liveVoiceOutputFor, preferIosLoudspeaker, releaseLiveVoiceOutput } from "./voiceOutput.ts";
import { ensurePcmWorklet } from "./pcmWorklet.ts";
import { PCM_SAMPLE_RATE, RV_VOICE_INSTRUCTIONS, VOICE_LOT_ENERGY, VOICE_MIC_RULES } from "./voice.ts";

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

export const MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    // Off on purpose. On an iPhone loudspeaker these turn on a voice
    // processor that pops while she talks. Headphones do not leak into
    // the mic, so the same call is clean. The mic track is switched off
    // in code while she speaks, which is the echo guard.
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
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
 * Android Chrome/WebView: ask for the larger "playback" output buffer. The
 * default "interactive" hint picks the smallest buffer the device claims,
 * which underruns on budget phones and the emulator. iOS ignores the hint.
 * Never forces sampleRate (see below).
 */
export function createLiveAudioContext(
  AC: typeof AudioContext,
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): AudioContext {
  if (/Android/i.test(ua)) {
    try {
      return new AC({ latencyHint: "playback" });
    } catch {
      /* old WebView: fall through to the default context */
    }
  }
  return new AC();
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

  preferIosLoudspeaker();

  const existing = getRetainedLiveCapture();
  if (existing) {
    if (existing.ctx.state === "suspended") void existing.ctx.resume();
    liveVoiceOutputFor(existing.ctx);
    void ensurePcmWorklet(existing.ctx);
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
      audioCtx = createLiveAudioContext(AC);
      if (audioCtx.state === "suspended") void audioCtx.resume();
      liveVoiceOutputFor(audioCtx);
      // Start loading the worklets now so the first reply does not wait.
      void ensurePcmWorklet(audioCtx);
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
  if (cap?.ctx) {
    releaseLiveVoiceOutput(cap.ctx);
    if (cap.ctx.state !== "closed") void cap.ctx.close();
  }
}

/**
 * Native xAI Realtime tools. Voice docs require web_search on
 * session.update — without it Grok connects but cannot browse, so it
 * hedges EST / low confidence on coach specs. xAI runs web_search.
 * query_lot is ours: the client posts function_call_output.
 * https://docs.x.ai/developers/model-capabilities/audio/voice
 */
/**
 * One rule for a feature the sheet did not answer.
 * Inventory stays on the lot. The brochure runs only when feature_blank is set.
 */
export const LOT_FEATURE_WEB_CLAUSE =
  "A king, queen, or bunkhouse question uses this same lot search, including the listing text. If feature_blank is set, say it is not on our listing, then web_search the brochure for that one coach and that feature only. If the summary says the coach does not have it, say no and do not web search.";
export const QUERY_LOT_TOOL = {
  type: "function",
  name: "query_lot",
  description: `Query RV Country's own lot for ANY count or availability question, including follow-ups such as "how about used Super Cs". Put their words in query and set make, model, body_type, condition, status, location, year, price, length, or miles only when they name them. Do not add a class, condition, or price band they did not say. A newly named body type, make, model, condition, or store replaces the previous one. For 'around N foot', set length_ft_min to N-2 and length_ft_max to N+2. 'N foot and under', 'under N foot', and 'N foot or less' are a ceiling: set length_ft_max to N and leave length_ft_min unset. Do not turn that into an around band. '2020 or newer' is year_min 2020 with year_max unset. 'the full list' keeps the last filter and names those units. The word full is not the Full House model. 'around N miles' is the odometer, never a price: set miles_min to N minus 15 percent and miles_max to N plus 15 percent, and leave price_min and price_max unset. Set miles only when this sentence says mile, miles, or mi. A dollar amount is a price: around $50,000 is price_min at 85 percent and price_max at 115 percent, and miles stay unset. Class A means Class A gas and Class A diesel only. Class A motorhomes stays Class A. A garage in a fifth wheel is a fifth-wheel toy hauler, not a travel trailer and not every fifth wheel. "Those aren't toy haulers" drops toy haulers. It does not apply the toy-hauler filter. inventory, on the lot, in stock, and do we have are the full lot only when the sentence names no class, price, length, sleeps, miles, or feature. Family, sleeps, and recommendations are not model names. Horsepower and displacement are printed on the lot sheet. "8.9" and "400 horsepower" are lot searches. Leave price_min and price_max unset for those. Do not say the lot does not track them. The word coaches means RVs, not the Coachmen brand, unless they say Coachmen. Slides, a generator, solar, an outdoor kitchen, a washer, a fireplace, a king bed, and an engine name such as Cummins or Power Stroke are lot filters. Leave those words in query. "diesel generator" is the generator, not every diesel. Call this tool once per question before you say a count. Never say none before the tool returns. Never answer a count from memory. Speak the summary only. It names the count and at most 3 units, with year, make, model, price, and town. Then offer more. Do not read the units array. Do not read a stock number unless he asked for one. Never say None and then list units. Never repeat the same lot line. Say none only when matched is 0. If did_you_mean or close is set, offer that name instead of a bare zero. Never invent a unit. Never tell the user to change a query, a parameter, or these instructions. Do not use web search or web notes for a lot count, horsepower or displacement on the lot, the cheapest or most expensive coach, availability, or stock. ${LOT_FEATURE_WEB_CLAUSE}`,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The salesman's lot question in their words.",
      },
      body_type: {
        type: "string",
        description:
          "Class A, Class A Gas, Class A Diesel, Class B, Class C, Class Super C, Fifth Wheel, Travel Trailer, motorhome, or toy hauler. Class C includes Class Super C.",
      },
      make: { type: "string" },
      model: { type: "string" },
      condition: {
        type: "string",
        enum: ["new", "used"],
        description: "New or used. Omit when they do not say.",
      },
      status: {
        type: "string",
        description: "Lot status such as Available or Sale Pending.",
      },
      location: { type: "string" },
      year_min: { type: "integer" },
      year_max: { type: "integer" },
      price_min: { type: "number" },
      price_max: { type: "number" },
      length_ft_min: {
        type: "number",
        description: "Inclusive length in feet. Around 30 foot is 28.",
      },
      length_ft_max: {
        type: "number",
        description: "Inclusive length in feet. Around 30 foot is 32.",
      },
      miles_min: {
        type: "number",
        description: "Inclusive odometer floor. Around 50,000 miles is 42,500. Never a price.",
      },
      miles_max: {
        type: "number",
        description: "Inclusive odometer cap. Around 50,000 miles is 57,500. Never a price.",
      },
      sort: {
        type: "string",
        enum: ["price", "length", "year", "type"],
        description:
          "price, length, year, or type. type groups by the class written on the coach (Class A, Class A Diesel, Class C, fifth wheel). Speak the by-type counts. Do not say type cannot be sorted.",
      },
      order: { type: "string", enum: ["asc", "desc"] },
      limit: { type: "integer", description: "Top N. Default 12. Max 24." },
    },
    additionalProperties: false,
  },
} as const;

export const REALTIME_SESSION_TOOLS = [
  { type: "web_search" },
  QUERY_LOT_TOOL,
] as const;

/** xAI runs these. The client must not answer them. */
export function isNativeRealtimeTool(name: string): boolean {
  const n = name.trim().toLowerCase();
  return (
    n === "web_search" ||
    n.startsWith("web_search") ||
    n === "x_search" ||
    n === "file_search" ||
    n === "code_interpreter"
  );
}

export function buildRealtimeSessionUpdate(
  voiceId: string,
  speed = 1,
  catalogContext?: string,
  visitorFirstName?: string,
  visitorMemory?: string,
  standingLessons?: string,
  activeScreen?: string,
): Record<string, unknown> {
  const clamped = Math.min(1.5, Math.max(0.7, speed));
  const extra = stripScreenContext(catalogContext || "");
  const catalogBlock = extra ? `${extra}\n\n` : "";
  const personal = visitorPersonalizationBlock(visitorFirstName);
  const personalBlock = personal ? `${personal}\n\n` : "";
  const memory = (visitorMemory || "").trim();
  const memoryBlock = memory ? `${memory}\n\n` : "";
  const lessons =
    standingLessons === undefined
      ? formatPromptLessons(DEFAULT_PROMPT_LESSONS)
      : standingLessons.trim();
  const core = injectStandingLessons(RV_VOICE_INSTRUCTIONS, lessons);
  const intro = sessionIntroLine(visitorFirstName);
  const screen = (activeScreen || "").trim();
  const screenSection = screen
    ? `${SCREEN_GUIDE_PREAMBLE}\n\n${formatScreenContext(screen)}`
    : SCREEN_GUIDE_PREAMBLE;
  const instructions = `${DAVID_HANSEN_STORY}\n${PEOPLE_FACTS_RULE}\n\n${core}\n\n${personalBlock}${memoryBlock}${catalogBlock}This session has native web_search and query_lot. Call query_lot for ANY count or availability question, including a follow-up that changes type or condition. Call query_lot once per question. Never say none before that tool returns. Never answer a lot count from memory. Never tell the user to change a query, a parameter, or these instructions. Horsepower and displacement are on the lot sheet. Search the lot for 8.9 or 400 horsepower. Do not say the lot does not track them. The word coaches means RVs, not Coachmen, unless they say Coachmen. Answer from the query_lot result only. Do not call web_search and do not mention web notes for a count, the cheapest or most expensive coach, availability, or stock. ${LOT_FEATURE_WEB_CLAUSE} Say none only when that tool returns matched 0. Never say None and then list units. Speak the count and at most 3 units, then offer more. Do not repeat a lot line. Mileage on the sheet is miles, not a price. A dollar amount is a price unless this sentence says mile, miles, or mi. If it returns did_you_mean or close, offer that name. Hold with "${VOICE_RESEARCH_HOLD_PHRASE}" only when research is actually running, then still answer.\n\nSESSION START: You will be cued once to introduce yourself. Say exactly: ${intro} Then listen. Never repeat this intro.\n\n${VOICE_MIC_RULES}\n\n${VOICE_LOT_ENERGY}\n\n${screenSection}`;
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
      tools: REALTIME_SESSION_TOOLS,
    },
  };
}

/** First-turn Live Voice cue — spoken once when the session opens. */
export function buildSessionIntroResponse(
  firstName?: string,
): Record<string, unknown> {
  return {
    type: "response.create",
    response: {
      modalities: ["text", "audio"],
      instructions: voiceSessionIntroInstructions(firstName),
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
