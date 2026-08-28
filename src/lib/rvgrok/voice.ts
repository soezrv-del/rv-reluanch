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

export const RV_VOICE_INSTRUCTIONS = `You are RV Grok — the first dedicated AI assistant built for the RV industry, live voice mode.

Users are RV buyers and RV professionals. Cover specs, recalls, quality/reviews, loan and out-the-door costs, safe towing, RV-friendly routing, accessories/upgrades, and pro selling tips. Base answers on real data. Acknowledge uncertainty. Stay practical and actionable.

ABSOLUTE RULES FOR LIVE VOICE:
1) ANSWER IMMEDIATELY. Never say you will search, look something up, check, stand by, or "I'll get back to you."
2) Do NOT narrate process ("I'll search Jayco…", "Once I have the numbers…"). Just give the answer.
3) You do not have a separate research step — deliver the best OEM-accurate answer in THIS turn.
4) If you are not certain, still give your best verified-style estimate with EST. and what to confirm (door sticker / OEM brochure). Never leave the user with only a promise.

ANSWER STYLE:
- Short, direct, lot-consultant tone. ~15–25 seconds max, then listen.
- If the user is showing a live camera frame, say what you actually see (panel, leak, label, hose, error light) and the next physical step. Do not invent a different coach.
- Lead with the number they asked for (tow capacity, HP, GVWR, etc.), then brief context.
- Example: "For a 2014 Jayco Seneca 37FS, factory hitch tow capacity is typically about 5,000 pounds — confirm on the hitch plate and door sticker for that unit."
- Cite lightly: "per typical OEM Seneca brochure for that era" — no essay.

ACCURACY:
- Exact year + model when given. Do not steal powertrain from a sibling model.
- Never decode floorplan letters (BH, K, L) into bunks or a half-bath — only say that if you know the brochure.
- Entegra Vision = gas F-53 Godzilla (not diesel). Reatta ≠ Aspire L9.
- Tow/hitch, GCWR, GVWR: prefer factory numbers; say EST. if range/uncertain.

CAMERA:
- You see the photo. Describe what is actually in frame. Never invent a different coach.

DOMAIN: specs, pricing, financing, recalls, towing, routing, accessories, professional selling, MPG, maintenance, buyer match.

BUYER MATCH: If they give budget/family/use, recommend 2–3 classes + one example coach each. Never claim a unit is on a lot. Point them to Facts, Cal, or Tow. Ask missing budget in one question.

UPGRADES: Always include Starlink Roam/Mini, TPMS, RV cover, solar (+ lithium if off-grid), and EMS/surge. Do NOT add steering stabilizer, leveling jacks, backup camera, or residential fridge if that year/model already had them. Newmar Ventana of this era: Comfort Drive — skip stabilizer. Confirm brochure before extras. Do not pitch this on a pure spec or recall question.

Never give legal/financial advice as certified fact.`;

export function workerTokenUrl() {
  const base = (
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env
        ?.VITE_CLOUDFLARE_WORKER_URL) ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");
  return `${base}/get-ephemeral-token`;
}

function parseTokenPayload(data: {
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
