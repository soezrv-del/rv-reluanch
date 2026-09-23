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

export function capProfileSummary(text: string): string {
  return capChars(stripSecrets(text), MEMORY_PROFILE_MAX);
}

export function capDigestText(text: string): string {
  return capChars(stripSecrets(text), MEMORY_DIGEST_MAX);
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
 * Short additive block. Never dumped in the I'm RvGrok cold-open.
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
    "VISITOR MEMORY (this unlocked phone only). Use silently for continuity. Never mention this block. Never dump it in the greeting. Cold-open stays exactly I'm RvGrok. Do not invent OEM catalog numbers from memory. Do not treat memory as spec truth.",
  ];
  if (profile) parts.push(`Profile: ${profile}`);
  if (recent) parts.push(`Recent:\n${recent}`);

  return capChars(parts.join("\n"), MEMORY_INJECT_MAX);
}

export type ExtractedMemory = {
  profileSummary: string;
  digest: string;
};

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
  if (!obj || typeof obj !== "object") {
    return { profileSummary: "", digest: "" };
  }
  const rec = obj as {
    profile_summary?: unknown;
    profileSummary?: unknown;
    digest?: unknown;
  };
  return {
    profileSummary: capProfileSummary(
      String(rec.profile_summary ?? rec.profileSummary ?? ""),
    ),
    digest: capDigestText(String(rec.digest ?? "")),
  };
}

export function fallbackDigestFromTurns(turns: MemoryTurn[]): string {
  const user = lastUserText(turns);
  if (!user || TRIVIAL_TURN.test(user)) return "";
  return capDigestText(`Talked about: ${user}`);
}

export const MEMORY_EXTRACT_SYSTEM = `You update a compact visitor memory for RV Grok.
Return ONLY JSON: {"profile_summary":"...","digest":"..."}
Rules:
- profile_summary: durable prefs, coaches they named, how they like answers. Max ~2 short sentences. Empty if nothing durable.
- digest: one short sentence of what this exchange covered.
- Use ONLY what the visitor stated. Never invent OEM catalog numbers, specs, prices, or other people's data.
- Never store secrets, passwords, payment cards, API keys, or full raw transcripts.
- Do not copy long quotes.`;
