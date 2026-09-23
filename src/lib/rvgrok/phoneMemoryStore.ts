/**
 * Server-only load / save / extract for per-phone RV Grok memory.
 * Never import from client components.
 */

import { getSql } from "@/lib/db";
import { phoneFromRequest } from "../access/httpGate.ts";
import {
  type ExtractedMemory,
  type MemoryDigest,
  type MemoryTurn,
  type PhoneMemory,
  MEMORY_EXTRACT_SYSTEM,
  capProfileSummary,
  emptyPhoneMemory,
  fallbackDigestFromTurns,
  formatVisitorMemoryBlock,
  memoryPhoneKey,
  mergeDigests,
  mergeProfileSummary,
  parseDigests,
  parseExtractedMemory,
  shouldWriteMemory,
} from "./phoneMemory.ts";

type MemoryRow = {
  phone_digits: string;
  profile_summary: string;
  digests: unknown;
  updated_at: string;
};

const lastWriteAt = new Map<string, number>();

function mapRow(row: MemoryRow): PhoneMemory {
  return {
    phoneDigits: row.phone_digits,
    profileSummary: capProfileSummary(row.profile_summary || ""),
    digests: parseDigests(row.digests),
    updatedAt: String(row.updated_at || ""),
  };
}

export async function loadPhoneMemory(
  phoneDigits: string,
): Promise<PhoneMemory> {
  const key = memoryPhoneKey(phoneDigits);
  if (!key) return emptyPhoneMemory();
  const sql = await getSql();
  const rows = await sql<MemoryRow>`
    select phone_digits, profile_summary, digests, updated_at
    from rvgrok_phone_memory
    where phone_digits = ${key}
    limit 1
  `;
  return rows[0] ? mapRow(rows[0]) : emptyPhoneMemory(key);
}

export async function savePhoneMemory(input: {
  phoneDigits: string;
  profileSummary: string;
  digests: MemoryDigest[];
}): Promise<PhoneMemory> {
  const key = memoryPhoneKey(input.phoneDigits);
  if (!key) return emptyPhoneMemory();
  const profile = capProfileSummary(input.profileSummary);
  const digests = mergeDigests(input.digests, null);
  const sql = await getSql();
  const rows = await sql.query<MemoryRow>(
    `insert into rvgrok_phone_memory (
       phone_digits, profile_summary, digests, updated_at
     ) values ($1, $2, $3::jsonb, now())
     on conflict (phone_digits) do update set
       profile_summary = excluded.profile_summary,
       digests = excluded.digests,
       updated_at = now()
     returning phone_digits, profile_summary, digests, updated_at`,
    [key, profile, JSON.stringify(digests)],
  );
  lastWriteAt.set(key, Date.now());
  return rows[0] ? mapRow(rows[0]) : emptyPhoneMemory(key);
}

export async function clearPhoneMemory(
  phoneDigits: string,
): Promise<{ ok: true; cleared: true; phoneDigits: string } | { ok: false; error: string }> {
  const key = memoryPhoneKey(phoneDigits);
  if (!key) return { ok: false, error: "Enter a valid phone number." };
  const sql = await getSql();
  await sql`delete from rvgrok_phone_memory where phone_digits = ${key}`;
  lastWriteAt.delete(key);
  return { ok: true, cleared: true, phoneDigits: key };
}

export async function loadVisitorMemoryBlock(
  rawPhone: string,
): Promise<string> {
  const key = memoryPhoneKey(rawPhone);
  if (!key) return "";
  try {
    return formatVisitorMemoryBlock(await loadPhoneMemory(key));
  } catch {
    return "";
  }
}

export async function loadVisitorMemoryBlockFromRequest(
  request: Request,
): Promise<string> {
  return loadVisitorMemoryBlock(phoneFromRequest(request));
}

export function memoryKeyFromRequest(request: Request): string | null {
  return memoryPhoneKey(phoneFromRequest(request));
}

const EXTRACT_MODELS = ["grok-3", "grok-4.5"];

async function extractMemoryWithXai(
  turns: MemoryTurn[],
  existing: PhoneMemory,
): Promise<ExtractedMemory | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const snippet = turns
    .slice(-8)
    .map((t) => `${t.role === "assistant" ? "RvGrok" : "Visitor"}: ${t.text.slice(0, 400)}`)
    .join("\n");
  const user = `Existing profile:\n${existing.profileSummary || "(none)"}\n\nExchange:\n${snippet}`;

  for (const model of EXTRACT_MODELS) {
    try {
      const resp = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: MEMORY_EXTRACT_SYSTEM },
            { role: "user", content: user },
          ],
          temperature: 0.1,
          max_tokens: 280,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!resp.ok) continue;
      const data = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;
      const parsed = parseExtractedMemory(content);
      if (parsed.profileSummary || parsed.digest) return parsed;
    } catch {
      /* next model */
    }
  }
  return null;
}

export async function applyMemoryUpdate(opts: {
  phoneDigits: string;
  turns: MemoryTurn[];
  assistantText?: string;
}): Promise<PhoneMemory | null> {
  const key = memoryPhoneKey(opts.phoneDigits);
  const turns = [...opts.turns];
  const assistant = (opts.assistantText || "").trim();
  if (assistant) {
    turns.push({
      role: "assistant",
      text: assistant.slice(0, 800),
    });
  }
  if (
    !shouldWriteMemory({
      phoneKey: key,
      turns,
      lastWriteAt: key ? lastWriteAt.get(key) : undefined,
    })
  ) {
    return null;
  }
  if (!key) return null;

  let existing: PhoneMemory;
  try {
    existing = await loadPhoneMemory(key);
  } catch {
    return null;
  }

  const extracted =
    (await extractMemoryWithXai(turns, existing)) || {
      profileSummary: "",
      digest: fallbackDigestFromTurns(turns),
    };
  if (!extracted.profileSummary && !extracted.digest) return null;

  try {
    return await savePhoneMemory({
      phoneDigits: key,
      profileSummary: mergeProfileSummary(
        existing.profileSummary,
        extracted.profileSummary,
      ),
      digests: mergeDigests(
        existing.digests,
        extracted.digest
          ? { at: new Date().toISOString(), text: extracted.digest }
          : null,
      ),
    });
  } catch {
    return null;
  }
}

/** Fire-and-forget after the visitor already has their stream. */
export function schedulePhoneMemoryUpdate(opts: {
  phoneDigits: string | null;
  turns: MemoryTurn[];
  assistantText?: string;
}): void {
  if (!opts.phoneDigits) return;
  void applyMemoryUpdate({
    phoneDigits: opts.phoneDigits,
    turns: opts.turns,
    assistantText: opts.assistantText,
  }).catch(() => undefined);
}

export async function collectSseAssistantText(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() || "";
      for (const part of parts) {
        const line = part
          .split("\n")
          .find((l) => l.startsWith("data: "));
        if (!line) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const obj = JSON.parse(payload) as {
            type?: string;
            content?: string;
            choices?: Array<{ delta?: { content?: string } }>;
          };
          if (typeof obj.choices?.[0]?.delta?.content === "string") {
            text += obj.choices[0].delta.content;
          } else if (obj.type === "delta" && typeof obj.content === "string") {
            text += obj.content;
          }
        } catch {
          /* ignore keep-alives */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return text;
}

/** Tee the SSE so memory writes after the client already started reading. */
export function rememberAfterSseResponse(
  response: Response,
  opts: { phoneDigits: string | null; turns: MemoryTurn[] },
): Response {
  if (!opts.phoneDigits || !response.body) return response;
  const [client, tap] = response.body.tee();
  void collectSseAssistantText(tap)
    .then((assistantText) => {
      schedulePhoneMemoryUpdate({
        phoneDigits: opts.phoneDigits,
        turns: opts.turns,
        assistantText,
      });
    })
    .catch(() => undefined);
  return new Response(client, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
