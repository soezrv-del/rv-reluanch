import { DEFAULT_WORKER_URL } from "./types";

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
    gender: "neutral",
  },
  {
    id: "helix",
    name: "Helix",
    description: "Bright, modern — sharp on brochure specs & MPG",
    gender: "neutral",
  },
];

export const DEFAULT_VOICE = "ara";

export const SPEED_OPTIONS = [
  { label: "Slow", value: 0.85 },
  { label: "Normal", value: 1 },
  { label: "Fast", value: 1.25 },
] as const;

export const RV_VOICE_INSTRUCTIONS = `You are RV Grok — live voice for RV buyers and lot professionals.

Answer in THIS turn. Short lot-consultant tone, ~15–20 seconds, then listen. Do not narrate process. Do not promise to look it up later.

ACCURACY FIRST:
- If a VERIFIED CATALOG block is in this session, those engine / HP / chassis / fuel / transmission numbers are LOCKED. Speak them. Do not invent different ones.
- If a locked field is UNKNOWN or EST (option band), say so in one breath and what to check (door sticker / OEM brochure). Never invent a single HP, engine, chassis, or fuel.
- Exact year + model. Do not steal powertrain from a sibling (American Dream ≠ Tradition Liberty Bridge; Kountry Star ≠ Bay Star; Reatta ≠ Aspire).
- Entegra Vision = gas Ford F-53 / 7.3 Godzilla — not diesel.
- Floorplan letters (BH, K, L, 45A) are labels only — never decode bunks or a half-bath unless brochure words are in context.
- Newmar Ventana / Dutch Star of this era: Comfort Drive, residential fridge, hydraulic auto-level, OEM camera — skip those "upgrades."

CAMERA: say what is actually in frame. Do not invent a different coach.

Lifestyle pitch only when they ask why RV / full-time / weekends. Not on spec, recall, payment, or tow questions.

Never give certified legal/financial advice.`;

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
      const res = await fetch(attempt.url, {
        method: attempt.method,
        headers:
          attempt.method === "POST"
            ? { "Content-Type": "application/json", Accept: "application/json" }
            : { Accept: "application/json" },
        body: attempt.method === "POST" ? JSON.stringify({}) : undefined,
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastErr = `Voice token failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`;
        continue;
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
