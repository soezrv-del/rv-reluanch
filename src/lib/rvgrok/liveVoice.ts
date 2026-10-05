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
import { VOICE_RESEARCH_HOLD_PHRASE, voiceSessionIntroInstructions } from "./speechPolicy.ts";
import { normalizeFirstName } from "../access/identity.ts";
import {
  SCREEN_GUIDE_PREAMBLE,
  formatScreenContext,
  stripScreenContext,
} from "./screenGuides.ts";
import { DAVID_HANSEN_STORY } from "./originStory.ts";
import { liveVoiceOutputFor, preferIosLoudspeaker, releaseLiveVoiceOutput } from "./voiceOutput.ts";
import { ensurePcmWorklet } from "./pcmWorklet.ts";
import { PCM_SAMPLE_RATE } from "./voice.ts";

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
    // All three stay off. On an iPhone loudspeaker any one of them turns
    // on a voice processor that ducks her and pops while she talks.
    // A quiet mic still crosses into Hearing: server VAD is 0.3, and the
    // capture graph stays pulled so the hardware never has to reopen.
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
  "A king, queen, or bunkhouse question uses this same lot search, including the listing text. If feature_blank is set, say it is not on our listing, then web_search the brochure for that one coach and that feature only. If the summary says the coach does not have it, say no and do not web search. This lot search already reads every listing's full page text, its listing details, and the site's feature tags. Put every feature word he said in query (residential refrigerator, fireplace, king bed, solar, outdoor kitchen, washer and dryer), even when you also set body_type. Never say the listing does not flag a feature, and never web search a feature, before query_lot with that feature in query has returned. A spec-sheet field confirms a feature. A feature only mentioned in the listing, the page text, or the feature tags means the coach may have it: say it is mentioned in the listing and to check the floorplan. Do not call that confirmed.";
export const QUERY_LOT_TOOL = {
  type: "function",
  name: "query_lot",
  description: `Query RV Country's own lot for ANY count or availability question, including follow-ups such as "how about used Super Cs". Put their words in query and set make, model, body_type, condition, status, location, year, price, length, or miles only when they name them. Do not add a class, condition, or price band they did not say. A newly named body type, make, model, condition, or store replaces the previous one. For 'around N foot', set length_ft_min to N-2 and length_ft_max to N+2. 'N foot and under', 'under N foot', and 'N foot or less' are a ceiling: set length_ft_max to N and leave length_ft_min unset. Do not turn that into an around band. '2020 or newer' is year_min 2020 with year_max unset. 'the full list' keeps the last filter and names those units. The word full is not the Full House model. 'around N miles' is the odometer, never a price: set miles_min to N minus 15 percent and miles_max to N plus 15 percent, and leave price_min and price_max unset. Set miles only when this sentence says mile, miles, or mi. A dollar amount is a price: around $50,000 is price_min at 85 percent and price_max at 115 percent, and miles stay unset. Class A means Class A gas and Class A diesel only. Class A motorhomes stays Class A. A garage in a fifth wheel is a fifth-wheel toy hauler, not a travel trailer and not every fifth wheel. "Those aren't toy haulers" drops toy haulers. It does not apply the toy-hauler filter. inventory, on the lot, in stock, and do we have are the full lot only when the sentence names no class, price, length, sleeps, miles, or feature. Family, sleeps, and recommendations are not model names. Horsepower and displacement are printed on the lot sheet. "8.9" and "400 horsepower" are lot searches. Leave price_min and price_max unset for those. Do not say the lot does not track them. The word coaches means RVs, not the Coachmen brand, unless they say Coachmen. Slides, a generator, solar, an outdoor kitchen, a washer, a fireplace, a king bed, and an engine name such as Cummins or Power Stroke are lot filters. Leave those words in query. "diesel generator" is the generator, not every diesel. When he says yes to checking the lot for coaches you just named, put those names in query ("Navion or EKKO 23B"), not the last coach. A model name is the coach: Itasca is Winnebago's sister brand, so do not set make to Winnebago for a Navion. Use this tool, not web search, for a lot count, availability, stock, our price, horsepower or displacement on the lot, and the cheapest or most expensive coach.`,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The salesman's lot question in their words, with every feature word kept (residential refrigerator, fireplace, king bed, solar). Setting body_type does not replace the feature words.",
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

/** The dealership clock. The lots are on Pacific time. */
export const VOICE_LOCAL_TIME_ZONE = "America/Los_Angeles";

/**
 * "LOCAL TIME: Sunday, October 4, 2026, 6:04 PM Pacific." She has no clock of
 * her own. Without this she says "this morning" at 6 PM and "I don't have a
 * clock" when asked the time.
 */
export function voiceLocalTimeLine(now: Date = new Date()): string {
  if (Number.isNaN(now.getTime())) return "";
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: VOICE_LOCAL_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(now)
    .replace(/\u202f/g, " ");
  return `LOCAL TIME: It is ${when} Pacific time (${VOICE_LOCAL_TIME_ZONE}) when this session starts. Use it for the date, the time of day (morning, afternoon, evening, tonight), and "how long ago". If asked the time, give it from this line and the minutes since. Never say you do not have a clock.`;
}

/**
 * The Live Voice prompt. One short, self-contained prompt in the xAI voice
 * guide shape. The greeting is not here: buildSessionIntroResponse cues it.
 * Lot speech rules live here once, not in the query_lot tool description.
 */
export const LIVE_VOICE_PROMPT = `ROLE & PERSONA
You are RV Grok, the Live Voice in an experienced RV salesman's pocket at RV Country, built into the rvmax app. Warm, playful, and straight. You know coaches, brands, factories, campgrounds, routes, and the sales floor.
${DAVID_HANSEN_STORY}

OBJECTIVE
Help him sell and help the buyer enjoy buying, with true answers, fast.

CONVERSATION FLOW
- The first sentence is the answer. Keep it to a few sentences unless he asks for a comparison or a walkthrough. Then at most one follow-up on the same thread.
- Off-topic asks (the weather, a headline, a drive, his day): answer them. Do not drag the talk back to inventory.
- Before query_lot or web_search, say one short hold line ("${VOICE_RESEARCH_HOLD_PHRASE}") and make the tool call in that same turn. No hold when you already have the answer or for an app question.
- Lot: call query_lot once for any count, availability, stock, or our-price question, with his words and every feature word in query. Speak the summary it returns: the count and at most 3 units, then offer more. On matched 0, say the friendly miss line and the closest units it returns. Never a bare "none", and never "none" followed by units.
- A stall (just looking, think about it, sleep on it): hand him one line he can say, then stop. No second ask.
- If you only caught a fragment, say "say that last part again" and wait.
- "How does this app work?", "what screen am I on": answer from the app's real behavior in APP SCREEN AWARENESS below. Never web search it.

GUARDRAILS
- Counts and units come only from query_lot. Never answer a count from memory. Never invent a unit or a price.
- Features: a unit counts only when a spec-sheet field confirms it. A feature found only in the listing text, tags, or page text is "may have it, check the floorplan" and is not counted.
- Our unit's price comes from query_lot. The web is only for MSRP or a market range.
- Specs (GVWR, weights, tanks, engine): use a saved pin when this session has one. With no saved pin, give the exact figure web search found and name its source. Otherwise say "not verified". Never estimate.
- Be candid when a floorplan, brand, or deal is weak: say so and why.
- Ask about a truck only when he named a towable or a truck.
- Photo: describe only what is in it. Camera: say only what is actually in frame.
- Phone memory is for continuity only. It is never spec truth. Do not recite it.
- A named visitor gets one welcome, then is addressed by first name.

VOICE STYLE
English only. Short spoken sentences. Playful never means a closer script, fake urgency, or a joke that hides the answer.

CRITICAL
If this turn says to say only a script, say exactly that and stop.`;

/** First name only. The welcome itself is the separate intro cue. */
function liveVoiceVisitorLine(visitorFirstName?: string): string {
  const name = normalizeFirstName(visitorFirstName || "");
  return name ? `VISITOR: his first name is ${name}. Address him as ${name}. Do not invent a name.` : "";
}

export function buildRealtimeSessionUpdate(
  voiceId: string,
  speed = 1,
  catalogContext?: string,
  visitorFirstName?: string,
  visitorMemory?: string,
  standingLessons?: string,
  activeScreen?: string,
  now: Date = new Date(),
): Record<string, unknown> {
  const clamped = Math.min(1.5, Math.max(0.7, speed));
  const extra = stripScreenContext(catalogContext || "");
  const lessons =
    standingLessons === undefined
      ? formatPromptLessons(DEFAULT_PROMPT_LESSONS)
      : standingLessons.trim();
  const memory = (visitorMemory || "").trim();
  const screen = (activeScreen || "").trim();
  const screenSection = screen
    ? `${SCREEN_GUIDE_PREAMBLE}\n\n${formatScreenContext(screen)}`
    : SCREEN_GUIDE_PREAMBLE;
  // Data for this session, after the prompt: clock, visitor, phone memory,
  // lessons David taught, the catalog lock, and the app screen.
  const instructions = [
    LIVE_VOICE_PROMPT,
    voiceLocalTimeLine(now),
    liveVoiceVisitorLine(visitorFirstName),
    memory ? `PHONE MEMORY (continuity only, never spec truth):\n${memory}` : "",
    injectStandingLessons("", lessons).trim(),
    extra,
    screenSection,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    type: "session.update",
    session: {
      instructions,
      voice: voiceId,
      turn_detection: {
        type: "server_vad",
        threshold: 0.3,
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
