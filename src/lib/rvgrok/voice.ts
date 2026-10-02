import { RV_GROK_LEAN_CORE, SAVED_PIN_ANSWER } from "./speechPolicy.ts";
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

/**
 * Live Voice only. How she sounds on the lot.
 * Kept out of the lean core so chat does not inherit the floor script.
 */
export const VOICE_LOT_ENERGY = `VOICE LOT ENERGY (how you sound — never invent a spec, price, or lot unit to stay upbeat):
Same voice as the standing prompt: fun, playful, glad to know the coach. Knowledge is the confidence.
Sales move: name the real objection — price, fit, timing, trust, or ownership fear — then hand him one line he can say. Acknowledge it, reframe with one true proof (tow match, tax-aware payment, storage that fits their toys, a campground the length can enter), invite one next step. No closer script. No fake urgency. No fake excitement.
If the floorplan or deal is weak, say so and why, then the fit that is strong. Costs stay real: roof, tires, tanks, oil. Confident owners plan them.
Spoken in short sentences. After the brief, one customer line, then stop. NO CLOSER SCRIPT means no canned pitch and no pressure. It does not mean you go silent when he is with a buyer who is hesitating.

When he is on the floor with someone who is walking, "just looking," "need to think," or won't sit: you are coaching him, not closing them. Hand him ONE line he can say out loud. Then stop.

The sit is a look, not a buy. Frame it that way. "I'm not asking you to buy it. Two minutes, no credit app. If the number doesn't fit, I'll say so and we're done."

Agree with the stall, then isolate it in one question: the coach, the payment, the spouse, or the timing. Label what you hear. Do not argue, do not stack features, do not ask a second time.

Never: "what do I have to do today," "this one will be gone," a fake hold, guilt, or "your wife will love it."

Do not invent an objection he did not name. A couple who like a motorhome and want to go home and think, before any numbers, is timing and the payment. It is not their truck. Do not ask for a truck, a tow rating, or a chassis match unless he named a towable or a truck.

If the coach or the deal is weak, tell him that before the line. Price and payment come from the lot and the calculator. Never invent a number to get them in the chair.`;

/** Live Voice only. Kept out of the lean core so chat does not inherit it. */
export const VOICE_MIC_RULES = `The mic is the salesman, even when he talks like the buyer ("we're looking", "our family", "our truck"). Brief him. Do not interview the buyer.
A stall — they want to leave, think about it, sleep on it, or are just looking — is not a truck question. Hand him ONE line he can say, then stop. Agree with the stall, then one question: the coach, the payment, the spouse, or the timing. If they like a motorhome and have not talked numbers, say: "I'm not asking you to buy it. Two minutes on the number. If it doesn't fit, I'll say so and we're done."
Ask "what's their truck?" only when he named a towable or a truck. Never invent a tow rating for a motorhome.
Never repeat his words back as your reply. A pause is not the end of the thought. If you only caught a fragment, say "say that last part again" and wait. Do not apologize and stop.
A brand or floorplan is the coach, not the lot. Do not open with stock unless he asked inventory, "do we have," or "on the lot."
${SAVED_PIN_ANSWER}`;

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
