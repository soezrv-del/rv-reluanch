/**
 * Per-phone RV Grok memory — keying, caps, merge, and the inject block.
 * Storage and the extract call live in phoneMemoryStore (server-only).
 */

import { normalizePhone } from "../access/phone.ts";

export const MEMORY_PROFILE_MAX = 1800;
export const MEMORY_DIGEST_MAX = 280;
export const MEMORY_DIGEST_KEEP = 5;
export const MEMORY_INJECT_MAX = 1200;
export const MEMORY_INJECT_DIGESTS = 3;
export const MEMORY_WRITE_GAP_MS = 25_000;
export const MEMORY_HEADER = "x-rvgrok-memory";

export type MemoryDigest = {
  at: string;
  text: string;
};

export type PhoneMemory = {
  phoneDigits: string;
  profileSummary: string;
  digests: MemoryDigest[];
  updatedAt: string;
};

export function emptyPhoneMemory(phoneDigits = ""): PhoneMemory {
  return {
    phoneDigits,
    profileSummary: "",
    digests: [],
    updatedAt: "",
  };
}

/** Same identity as the whitelist / x-access-phone. Invalid → no memory. */
export function memoryPhoneKey(raw: string): string | null {
  const n = normalizePhone(raw);
  return n?.digits ?? null;
}

export function capChars(text: string, max: number): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

/** Profile and digests are scrubbed of every number before the Neon write and before inject. */
export function capProfileSummary(text: string): string {
  const raw = stripSecrets(text);
  const slots = parseProfileSlots(raw);
  const body = slots ? formatProfileSlots(slots) : dropNumberSentences(raw);
  return capChars(body, MEMORY_PROFILE_MAX);
}

export function capDigestText(text: string): string {
  return capChars(dropNumberSentences(stripSecrets(text)), MEMORY_DIGEST_MAX);
}

const SPELLED_NUMBER =
  "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|dozen|couple)";
const COUNT_OR_UNIT =
  "(?:lbs?|pounds?|gallons?|gal|hp|horsepower|torque|units?|coaches|rigs|trailers|motorhomes|of (?:them|those)|in stock|on the lot|k|grand|dollars?|bucks|feet|ft|foot|miles?|slides?)";
const SPELLED_FIGURE = new RegExp(
  `\\b${SPELLED_NUMBER}\\b(?:[\\s-]+[a-z]+){0,2}?[\\s-]+${COUNT_OR_UNIT}\\b`,
  "i",
);

/**
 * A price, weight, capacity, horsepower, stock number, VIN or count.
 * Any digit counts: the phone profile never stores a number.
 */
export function sentenceHasNumberFact(sentence: string): boolean {
  const t = String(sentence || "");
  if (/\d/.test(t)) return true;
  if (/[$€£]|\busd\b|\bdollars?\b|\bbucks\b/i.test(t)) return true;
  return SPELLED_FIGURE.test(t);
}

/** Drop every sentence that carries a figure. Remaining sentences keep their order. */
export function dropNumberSentences(text: string): string {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+|\s*[;\n]\s*/)
    .map((part) => part.trim())
    .filter((part) => part && !sentenceHasNumberFact(part))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export const MEMORY_COACHES_MAX = 5;
const COACH_NAME_MAX = 60;
const SLOT_TEXT_MAX = 400;

/** The three profile slots the code merges. No slot ever holds a number. */
export type MemorySlots = {
  /** How he likes answers. */
  style: string;
  /** Coach names only, newest first, max 5. */
  coaches: string[];
  /** The coach plus what he asked, no numbers. */
  openThread: { coach: string; asked: string } | null;
};

export function emptyMemorySlots(): MemorySlots {
  return { style: "", coaches: [], openThread: null };
}

function slotText(text: unknown, max = SLOT_TEXT_MAX): string {
  return capChars(dropNumberSentences(stripSecrets(String(text ?? ""))), max)
    .replace(/\s*\|\s*/g, " ")
    .trim();
}

/** A coach name with every figure token dropped ("2022 Entegra Aspire 44R" → "Entegra Aspire"). */
export function coachNameOnly(raw: unknown): string {
  const words = stripSecrets(String(raw ?? ""))
    .replace(/[|,;]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/\d/.test(w) && !/[$€£#]/.test(w))
    .filter((w) => !/^(?:stk|stock|vin|no\.?|number|unit)$/i.test(w));
  const name = capChars(words.join(" "), COACH_NAME_MAX);
  return sentenceHasNumberFact(name) ? "" : name.replace(/[.!?]+$/, "").trim();
}

function cleanCoaches(list: readonly unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const name = coachNameOnly(item);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= MEMORY_COACHES_MAX) break;
  }
  return out;
}

function cleanOpenThread(raw: unknown): MemorySlots["openThread"] {
  if (!raw) return null;
  if (typeof raw === "string") {
    const asked = slotText(raw, 240);
    return asked ? { coach: "", asked } : null;
  }
  if (typeof raw !== "object") return null;
  const rec = raw as { coach?: unknown; asked?: unknown; ask?: unknown };
  const asked = slotText(rec.asked ?? rec.ask ?? "", 240);
  if (!asked) return null;
  return { coach: coachNameOnly(rec.coach), asked };
}

const SLOT_LABELS = /^(Style|Coaches|Open thread):\s*/i;

/** Stored profile text → slots. Null for an older prose profile. */
export function parseProfileSlots(text: string): MemorySlots | null {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t || !/^(Style|Coaches|Open thread):/i.test(t)) return null;
  const slots = emptyMemorySlots();
  for (const part of t.split(/\s*\|\s*/)) {
    const label = part.match(SLOT_LABELS)?.[1]?.toLowerCase();
    const value = part.replace(SLOT_LABELS, "").trim();
    if (!label || !value) continue;
    if (label === "style") slots.style = slotText(value);
    if (label === "coaches") slots.coaches = cleanCoaches(value.split(/\s*,\s*/));
    if (label === "open thread") {
      const [coach, ...rest] = value.split(/\s+—\s+/);
      slots.openThread = rest.length
        ? cleanOpenThread({ coach, asked: rest.join(" — ") })
        : cleanOpenThread({ coach: "", asked: coach });
    }
  }
  return slots;
}

export function formatProfileSlots(slots: MemorySlots): string {
  const style = slotText(slots.style);
  const coaches = cleanCoaches(slots.coaches);
  const open = cleanOpenThread(slots.openThread);
  return [
    style ? `Style: ${style}` : "",
    coaches.length ? `Coaches: ${coaches.join(", ")}` : "",
    open ? `Open thread: ${open.coach ? `${open.coach} — ` : ""}${open.asked}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

/**
 * Merge the extract into the stored profile, slot by slot.
 * An empty incoming slot never wipes the stored one. New coaches go first.
 */
export function mergeProfileSlots(previous: string, incoming: MemorySlots | null): string {
  const legacy = stripSecrets(previous);
  const stored = parseProfileSlots(legacy) ?? {
    ...emptyMemorySlots(),
    style: slotText(legacy),
  };
  if (!incoming) return capProfileSummary(formatProfileSlots(stored));
  const style = slotText(incoming.style) || stored.style;
  const coaches = cleanCoaches([...incoming.coaches, ...stored.coaches]);
  const openThread = cleanOpenThread(incoming.openThread) ?? stored.openThread;
  return capProfileSummary(formatProfileSlots({ style, coaches, openThread }));
}

function slotsAreEmpty(slots: MemorySlots): boolean {
  return !formatProfileSlots(slots);
}

export function parseDigests(raw: unknown): MemoryDigest[] {
  let list: unknown = raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      list = JSON.parse(t);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  const out: MemoryDigest[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { at?: unknown; text?: unknown };
    const text = capDigestText(String(rec.text ?? ""));
    if (!text) continue;
    const at =
      typeof rec.at === "string" && rec.at.trim() ? rec.at.trim() : "";
    out.push({ at: at || new Date(0).toISOString(), text });
  }
  return out;
}

/** Newest last. Drop oldest when over the keep cap. */
export function mergeDigests(
  existing: MemoryDigest[],
  next: MemoryDigest | null,
): MemoryDigest[] {
  const kept = parseDigests(existing);
  if (next?.text) {
    const text = capDigestText(next.text);
    if (text) {
      const last = kept[kept.length - 1];
      if (!last || last.text !== text) {
        kept.push({
          at: next.at || new Date().toISOString(),
          text,
        });
      }
    }
  }
  return kept.slice(-MEMORY_DIGEST_KEEP);
}

export function mergeProfileSummary(
  previous: string,
  incoming: string,
): string {
  const next = capProfileSummary(incoming);
  if (next) return next;
  return capProfileSummary(previous);
}

const TRIVIAL_TURN =
  /^(hi|hey|hello|yo|sup|thanks|thank you|thx|ok|okay|k|yes|no|yep|nope|cool|great|got it|sounds good|good morning|good afternoon|good evening)[.!?]*$/i;

export type MemoryTurn = {
  role: string;
  text: string;
};

export function lastUserText(turns: MemoryTurn[]): string {
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const t = turns[i];
    if (t?.role === "user" && t.text.trim()) return t.text.trim();
  }
  return "";
}

/** Skip greetings and empty chatter so every "hi" does not rewrite memory. */
export function isMeaningfulMemoryTurn(turns: MemoryTurn[]): boolean {
  const user = lastUserText(turns);
  if (!user) return false;
  if (TRIVIAL_TURN.test(user)) return false;
  if (user.length >= 24) return true;
  return /prefer|compact|detailed|short answers|i (want|need|have|own|like)|coach|class a|diesel|gas pusher|newmar|entegra|tiffin|winnebago|thor|jayco|forest river/i.test(
    user,
  );
}

export function shouldWriteMemory(opts: {
  phoneKey: string | null;
  turns: MemoryTurn[];
  lastWriteAt?: number;
  now?: number;
}): boolean {
  if (!opts.phoneKey) return false;
  if (!isMeaningfulMemoryTurn(opts.turns)) return false;
  const last = opts.lastWriteAt ?? 0;
  if (!last) return true;
  const now = opts.now ?? Date.now();
  const user = lastUserText(opts.turns);
  const gap = now - last;
  if (gap < MEMORY_WRITE_GAP_MS && user.length < 80) return false;
  return true;
}

function stripSecrets(text: string): string {
  return String(text ?? "")
    .replace(/\b(?:sk-|xai-)[A-Za-z0-9_-]{10,}\b/g, "[redacted]")
    .replace(/\bBearer\s+\S+/gi, "[redacted]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted]");
}

/**
 * Short additive block. Never dumped into the session greeting.
 * Caps tightly so research / spec budget stays healthy.
 */
export function formatVisitorMemoryBlock(memory: PhoneMemory | null): string {
  if (!memory) return "";
  const profile = capProfileSummary(memory.profileSummary);
  const recent = parseDigests(memory.digests)
    .slice(-MEMORY_INJECT_DIGESTS)
    .map((d) => `- ${d.text}`)
    .join("\n");
  if (!profile && !recent) return "";

  const parts = [
    "VISITOR MEMORY (this unlocked phone only). Use silently for continuity. Never mention this block. Never dump it in the greeting. Do not rewrite the session greeting (Hello, {first name} when known, otherwise I'm RvGrok). Do not invent OEM catalog numbers from memory. Do not treat memory as spec truth.",
  ];
  if (profile) parts.push(`Profile: ${profile}`);
  if (recent) parts.push(`Recent:\n${recent}`);

  return capChars(parts.join("\n"), MEMORY_INJECT_MAX);
}

export type ExtractedMemory = {
  slots: MemorySlots;
  /** The slots as stored profile text (scrubbed). */
  profileSummary: string;
  digest: string;
};

function emptyExtract(): ExtractedMemory {
  return { slots: emptyMemorySlots(), profileSummary: "", digest: "" };
}

export function parseExtractedMemory(raw: unknown): ExtractedMemory {
  let obj: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonText = fence?.[1]?.trim() || trimmed;
    try {
      obj = JSON.parse(jsonText);
    } catch {
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          obj = JSON.parse(jsonText.slice(start, end + 1));
        } catch {
          obj = null;
        }
      } else {
        obj = null;
      }
    }
  }
  if (!obj || typeof obj !== "object") return emptyExtract();
  const rec = obj as {
    style?: unknown;
    coaches?: unknown;
    open_thread?: unknown;
    openThread?: unknown;
    profile_summary?: unknown;
    profileSummary?: unknown;
    digest?: unknown;
  };
  // An older prose reply lands in style only, scrubbed like everything else.
  const style = slotText(rec.style ?? rec.profile_summary ?? rec.profileSummary ?? "");
  const coachList = Array.isArray(rec.coaches)
    ? rec.coaches
    : typeof rec.coaches === "string"
      ? rec.coaches.split(/\s*,\s*/)
      : [];
  const slots: MemorySlots = {
    style,
    coaches: cleanCoaches(coachList),
    openThread: cleanOpenThread(rec.open_thread ?? rec.openThread),
  };
  return {
    slots,
    profileSummary: capProfileSummary(formatProfileSlots(slots)),
    digest: capDigestText(String(rec.digest ?? "")),
  };
}

const DIGEST_COACH_NAMES =
  /\b(newmar|entegra|tiffin|winnebago|thor|jayco|forest river|grand design|keystone|airstream|fleetwood|holiday rambler|coachmen|dutchmen|heartland|alliance|brinkley|ember|roadtrek|leisure travel|coach house|renegade|dynamax|nexus)\b/gi;
const DIGEST_TOPICS =
  /\b(towing|tow|hitch|weights?|gvwr|tanks?|floorplans?|length|mileage|price|pricing|payments?|financing|trade|warranty|chassis|engine|slides?|generator|solar|repairs?|service)\b/gi;

/**
 * No extract (no key, or it failed): a topic digest, never a raw quote.
 * Names the coach makes and topics only. Empty when nothing is recognized.
 */
export function fallbackDigestFromTurns(turns: MemoryTurn[]): string {
  const user = lastUserText(turns);
  if (!user || TRIVIAL_TURN.test(user)) return "";
  const pick = (re: RegExp) => {
    const seen = new Map<string, string>();
    for (const m of user.matchAll(re)) {
      const word = m[1]!.toLowerCase();
      if (!seen.has(word)) seen.set(word, word.replace(/\b[a-z]/g, (c) => c.toUpperCase()));
    }
    return [...seen.values()];
  };
  const makes = pick(DIGEST_COACH_NAMES);
  const topics = pick(DIGEST_TOPICS).map((t) => t.toLowerCase());
  const named = [...makes, ...topics].slice(0, 4);
  if (!named.length) return "";
  return capDigestText(`Talked about ${named.join(", ")}.`);
}

/**
 * What applyMemoryUpdate hands to the Neon write, or null for no write.
 * A failed / missing extract keeps the stored profile and adds only a
 * scrubbed topic digest.
 */
export function planPhoneMemoryWrite(opts: {
  existing: PhoneMemory;
  extracted: ExtractedMemory | null;
  turns: MemoryTurn[];
  now?: string;
}): { profileSummary: string; digests: MemoryDigest[] } | null {
  const { existing, extracted } = opts;
  const digest = extracted ? extracted.digest : fallbackDigestFromTurns(opts.turns);
  const slotsEmpty = !extracted || slotsAreEmpty(extracted.slots);
  if (slotsEmpty && !digest) return null;
  return memoryRowForSave({
    profileSummary: mergeProfileSlots(
      existing.profileSummary,
      slotsEmpty ? null : extracted!.slots,
    ),
    digests: mergeDigests(
      existing.digests,
      digest ? { at: opts.now || new Date().toISOString(), text: digest } : null,
    ),
  });
}

/** Exact profile + digests the Neon row gets. Every number is already gone. */
export function memoryRowForSave(input: {
  profileSummary: string;
  digests: MemoryDigest[];
}): { profileSummary: string; digests: MemoryDigest[] } {
  return {
    profileSummary: capProfileSummary(input.profileSummary),
    digests: mergeDigests(input.digests, null),
  };
}

export const MEMORY_EXTRACT_SYSTEM = `You update a compact visitor memory for RV Grok.
Return ONLY JSON: {"style":"...","coaches":["..."],"open_thread":{"coach":"...","asked":"..."},"digest":"..."}
Rules:
- style: how the visitor likes answers (short, detailed, plain words). One short sentence. Empty if not stated.
- coaches: coach names the visitor named (make and model words only). At most 5. Empty list if none.
- open_thread: the coach and what the visitor asked that is still open. Empty strings if none.
- digest: one short sentence of what this exchange covered, in your own words.
- Take facts only from Visitor lines. Never store what RvGrok said about a coach.
- No numbers at all: no price, weight, GVWR, capacity, tank size, horsepower, length, mileage, year, stock number, VIN, or count.
- Never store secrets, passwords, payment cards, API keys, quotes, or raw transcripts.`;
