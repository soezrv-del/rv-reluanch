import { RV_GROK_LEAN_CORE, SAVED_PIN_ANSWER, sessionIntroLine } from "./speechPolicy.ts";
import { DEFAULT_WORKER_URL } from "./types.ts";
import { MEMORY_HEADER } from "./phoneMemory.ts";
import { LESSONS_HEADER } from "./promptLessons.ts";

export const VOICE_STORAGE_KEY = "rvgrok_selected_voice";
export const VOICE_MODE_KEY = "rvgrok_voice_mode";
export const VOICE_SPEED_KEY = "rvgrok_voice_speed";
export const LIVE_VOICE_KEY = "rvgrok_live_voice";

export const XAI_REALTIME_URL =
  "wss://api.x.ai/v1/realtime?model=grok-voice-latest";

export const PCM_SAMPLE_RATE = 24000;

/** Branded Grok Voice Agent voices (xAI) */
export interface GrokVoice {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female" | "neutral";
}

export const GROK_AVATAR_FEMALE = "/assets/brand/icon-rvgrok-female.png";
export const GROK_AVATAR_MALE = "/assets/brand/icon-rvgrok-male.png";
export const GROK_AVATAR_DEFAULT = "/assets/brand/icon-rvgrok.png";

/** Female voices share one face. Male voices, including Altair, share the other. */
export function avatarForVoice(
  voice: string | { id?: string; gender?: GrokVoice["gender"] } | null | undefined,
): string {
  const gender =
    voice && typeof voice === "object"
      ? voice.gender
      : GROK_VOICES.find((v) => v.id === voice)?.gender;
  if (gender === "female") return GROK_AVATAR_FEMALE;
  if (gender === "male") return GROK_AVATAR_MALE;
  return GROK_AVATAR_DEFAULT;
}

export const GROK_VOICES: GrokVoice[] = [
  {
    id: "ara",
    name: "Ara",
    description: "Warm, expressive — great for consultative RV guidance",
    gender: "female",
  },
  {
    id: "eve",
    name: "Eve",
    description: "Clear default voice — crisp and professional",
    gender: "female",
  },
  {
    id: "leo",
    name: "Leo",
    description: "Confident male voice — strong on technical specs",
    gender: "male",
  },
  {
    id: "rex",
    name: "Rex",
    description: "Deep, steady — reassuring full-time advice",
    gender: "male",
  },
  {
    id: "sal",
    name: "Sal",
    description: "Balanced, neutral — versatile for any RV topic",
    gender: "male",
  },
  {
    id: "helix",
    name: "Helix",
    description: "Bright, modern — sharp on brochure specs & MPG",
    gender: "male",
  },
  {
    id: "altair",
    name: "Altair",
    description: "Calm, assured male voice — steady on specs and walkthroughs",
    gender: "male",
  },
];

export const DEFAULT_VOICE = "eve";

export const SPEED_OPTIONS = [
  { label: "Slow", value: 0.85 },
  { label: "Normal", value: 1 },
  { label: "Fast", value: 1.25 },
] as const;

export const RV_VOICE_INSTRUCTIONS = `${RV_GROK_LEAN_CORE}

CAMERA: say what is actually in frame.`;

/** Live Voice only. Kept out of the lean core so chat does not inherit it. */
export const VOICE_MIC_RULES = `The mic is the salesman, even when he talks like the buyer ("we're looking", "our family", "our truck"). Brief him. Do not interview the buyer. Ask "what's their truck?", or hand him the line. Then stop.
Never repeat his words back as your reply. A pause is not the end of the thought. If you only caught a fragment, say "say that last part again" and wait. Do not apologize and stop.
A brand or floorplan is the coach, not the lot. Do not open with stock unless he asked inventory, "do we have," or "on the lot."
${SAVED_PIN_ANSWER}`;

/**
 * Live Voice session prompt only. Chat keeps RV_GROK_LEAN_CORE.
 * {{NAME_BLOCK}} and {{SESSION_START}} are filled by liveVoicePrompt.
 */
export const LIVE_VOICE_PROMPT = `You are RV Grok, the assistant in an experienced RV salesman's pocket. You know factories, owners, plants, campgrounds, routes, regs, and how a coach actually lives. RVs, camping, and the lot are your home turf, but he can ask you anything (a headline, the weather, a drive) and you won't drag it back to inventory.

VOICE
- The first sentence is the answer. Keep it to a few sentences unless he wants a comparison, walkthrough, or deep cut.
- Candid: if a floorplan, brand, or deal is weak, say so and why. Dry, not cute. No hype, brochure adjectives, or "great question."
- You're his partner, not a menu. Offer one follow-up only if he's still on that thread; skip it once he's asked for a line or said that's enough. Follow him if he changes the subject.

THE MIC
- The mic is the salesman, even when he talks like the buyer. Brief him; don't interview the buyer. Ask "what's their truck?" or hand him the line. Then stop.
- Never repeat his words back. A pause isn't the end of the thought. If you caught only a fragment, say "say that last part again" and wait. Do not apologize.
- Camera: describe only what's in frame.

SPECS AND FACTS
- For GVWR and other spec numbers, a number in the SPEC ENGINE SCRIPT wins. Otherwise use the closest saved pin only if it matches this coach; if not, say the number isn't verified yet and search. Never give a near match's number as this coach's.
- Name the source ("According to the Newmar brochure…").
- Never invent GVWR, UVW, payload, hitch weight, price, tank sizes, or a recall. Every number you speak comes from the script, a saved pin, or a search result, never from memory.
- Don't turn a factory, brand, or campground question into a year-make-model demand. Ask for the floorplan only when you can't pin a number without it.
- Use research notes when a turn includes them; don't pretend you looked something up. If the notes don't cover a fact that goes stale, say so.
- Say "give me one second" only while research is running.

OUR LOT
- A brand or floorplan means the coach, not our stock. Bring up the lot only when he asks about inventory, "do we have," or "on the lot."
- Lot answers are exact: only from query_lot or an injected lot snapshot, never memory or web search. Name only units it returned.
- Call query_lot once per count question, speak its summary, say none only when matched is 0, and if it offers a close match, offer that.
- Web search is fine for a spec or fact about a specific lot coach. Stock, price, and whether it's still on the lot stay on query_lot.

{{NAME_BLOCK}}SESSION START
{{SESSION_START}}

APP SCREEN
You're built into the rvmax app. ACTIVE SCREEN (live as he moves) and SCREEN GUIDE are your view of his screen; never say you can't see it, don't know the screen, or lack a manual. Don't describe the screen unless he asks. For "what screen am I on," "what is this," "how do I use this," or "where is X," answer right away and briefly from SCREEN GUIDE: name the screen, give two or three specifics (search, filters, what updates live), and offer a walkthrough. Use button and field names exactly; if one isn't listed, give the closest listed step and say you're not sure. Never invent a button, hold, or web-search how rvmax works.`;

/** Named visitors get NAME + "Hello, {name}." Unnamed visitors omit NAME and say "I'm RvGrok." */
export function liveVoicePrompt(firstName?: string): string {
  const spoken = sessionIntroLine(firstName);
  const name = spoken.startsWith("Hello, ") ? spoken.slice("Hello, ".length) : "";
  const greeting = spoken.endsWith(".") ? spoken : `${spoken}.`;
  const nameBlock = name
    ? `NAME\nThe person you are talking to is ${name}. Use his name now and then, never back-to-back or to open every answer.\n\n`
    : "";
  const sessionStart = `When cued, say exactly "${greeting}" once, then listen. That is the only greeting.`;
  return LIVE_VOICE_PROMPT.replace("{{NAME_BLOCK}}", nameBlock).replace(
    "{{SESSION_START}}",
    sessionStart,
  );
}

export function workerTokenUrl() {
  const base = (
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env
        ?.VITE_CLOUDFLARE_WORKER_URL) ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");
  return `${base}/get-ephemeral-token`;
}

export function parseTokenPayload(data: {
  token?: string;
  client_secret?: string | { value?: string };
  value?: string;
}): string | null {
  return (
    data.token ||
    (typeof data.client_secret === "string"
      ? data.client_secret
      : data.client_secret?.value) ||
    data.value ||
    null
  );
}

/**
 * Prefer same-origin /api/rvgrok/token (avoids CORS / prod proxy issues),
 * then fall back to Cloudflare worker directly.
 */
let lastTokenVisitorMemory = "";
let lastTokenStandingLessons: { value: string } | null = null;

/** Memory attached to the last same-origin token mint. Empty after take. */
export function takeTokenVisitorMemory(): string {
  const value = lastTokenVisitorMemory;
  lastTokenVisitorMemory = "";
  return value;
}

/**
 * Keep a lessons header already seen. A missing header (Cloudflare worker
 * fallback has none) must not wipe a same-origin block — that wipe made
 * Live Voice treat lessons as undefined and skip Neon admin lessons.
 */
export function absorbStandingLessonsHeader(
  current: { value: string } | null,
  header: string | null,
): { value: string } | null {
  if (header == null) return current;
  try {
    return { value: decodeURIComponent(header) };
  } catch {
    return { value: "" };
  }
}

/**
 * Standing lessons from the last token attempt that sent the header.
 * `undefined` after take / when no attempt sent the header (use code defaults).
 * Empty string means the desk saved an empty block.
 */
export function takeTokenStandingLessons(): string | undefined {
  if (!lastTokenStandingLessons) return undefined;
  const value = lastTokenStandingLessons.value;
  lastTokenStandingLessons = null;
  return value;
}

export async function fetchEphemeralToken(
  signal?: AbortSignal,
): Promise<string> {
  const attempts: Array<{ url: string; method: "GET" | "POST" }> = [
    { url: "/api/rvgrok/token", method: "GET" },
    { url: "/api/rvgrok/token", method: "POST" },
    { url: workerTokenUrl(), method: "POST" },
    { url: workerTokenUrl(), method: "GET" },
  ];

  let lastErr = "Voice token failed";
  for (const attempt of attempts) {
    try {
      const { accessHeaders } = await import("@/lib/access/client");
      const res = await fetch(attempt.url, {
        method: attempt.method,
        headers: accessHeaders(
          attempt.method === "POST"
            ? { "Content-Type": "application/json", Accept: "application/json" }
            : { Accept: "application/json" },
        ),
        body: attempt.method === "POST" ? JSON.stringify({}) : undefined,
        signal,
      });
      // Read before the ok check. A 502 from /api/rvgrok/token still
      // carries x-rvgrok-lessons; the worker fallback that wins next does not.
      lastTokenStandingLessons = absorbStandingLessonsHeader(
        lastTokenStandingLessons,
        res.headers.get(LESSONS_HEADER),
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastErr = `Voice token failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`;
        continue;
      }
      const encodedMemory = res.headers.get(MEMORY_HEADER) || "";
      if (encodedMemory) {
        try {
          lastTokenVisitorMemory = decodeURIComponent(encodedMemory);
        } catch {
          lastTokenVisitorMemory = "";
        }
      }
      const data = (await res.json()) as {
        token?: string;
        client_secret?: string | { value?: string };
        value?: string;
        error?: string;
      };
      if (data.error) {
        lastErr = data.error;
        continue;
      }
      const token = parseTokenPayload(data);
      if (token) return token;
      lastErr = "Voice token response missing token";
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(lastErr);
}


// ─── PCM helpers (realtime uplink / playback) ────────────────────────────────

export function resampleFloat32(
  input: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLen = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const t = src - i0;
    out[i] = input[i0]! * (1 - t) + input[i1]! * t;
  }
  return out;
}

export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// ─── Browser SpeechRecognition / TTS ─────────────────────────────────────────

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal?: boolean }
  >;
};

export function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function createPushToTalkRecognition(handlers: {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}): SpeechRecognitionLike {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) throw new Error("Speech recognition not available");
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  rec.onresult = (ev) => {
    let interim = "";
    let final = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const row = ev.results[i]!;
      const piece = row[0]?.transcript ?? "";
      if (row.isFinal) final += piece;
      else interim += piece;
    }
    if (final) handlers.onFinal(final);
    if (interim) handlers.onInterim(interim);
  };
  rec.onerror = (ev) => handlers.onError(ev.error || "unknown");
  rec.onend = () => handlers.onEnd();
  return rec;
}

export function speakWithBrowserTts(
  text: string,
  opts?: { rate?: number; onEnd?: () => void },
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts?.rate ?? 1;
  u.onend = () => opts?.onEnd?.();
  u.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopBrowserTts() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
