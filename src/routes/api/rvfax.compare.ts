import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import {
  createDeadline,
  createInflightDeduper,
  createTtlCache,
  stableStringify,
  type Deadline,
} from "@/lib/rv/dossierGuards";
import {
  COMPARE_SYSTEM_PROMPT,
  FINDINGS_NOT_GUESSES_RULE,
  FLOORPLAN_CODE_RULE,
  sanitizeUnverifiedLayout,
} from "@/lib/rv/promptRules";

/**
 * POST /api/rvfax/compare
 * { coaches: [{ year, make, model, floorplan?, type?, highlights? }] }
 * → AI narrative comparing 2–3 RVs for a buyer.
 */

function workerBase() {
  return (
    process.env.CLOUDFLARE_WORKER_URL ||
    process.env.VITE_CLOUDFLARE_WORKER_URL ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");
}

function extractText(data: unknown): string {
  const d = data as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
    content?: string;
    message?: string;
  };
  return String(
    d?.choices?.[0]?.message?.content ||
      d?.choices?.[0]?.text ||
      d?.content ||
      d?.message ||
      "",
  );
}

type CoachIn = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  type?: string;
  rating?: number;
  engine?: string;
  chassis?: string;
  length?: string;
  sleeps?: string;
  slides?: string;
  layout?: string;
  retailHigh?: number;
  tradeIn?: number;
};

const COMPARE_MODELS = ["grok-4-latest", "grok-4", "grok-3"] as const;

/** Each model / worker call gets at most 30s; the whole walk at most 75s. */
export const COMPARE_CALL_TIMEOUT_MS = 30_000;
export const COMPARE_TOTAL_BUDGET_MS = 75_000;
export const COMPARE_CACHE_TTL_MS = 60 * 60 * 1000;

type CompareBody = {
  summary: string;
  live: boolean;
  generatedAt: string;
};
const compareCache = createTtlCache<CompareBody>({
  ttlMs: COMPARE_CACHE_TTL_MS,
  max: 300,
});
const compareInflight = createInflightDeduper<CompareBody>();

export function compareCacheKey(coaches: unknown[]): string {
  return stableStringify(coaches).toLowerCase();
}

async function callGrok(
  prompt: string,
  deadline: Deadline = createDeadline(COMPARE_TOTAL_BUDGET_MS),
): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (apiKey) {
    for (const model of COMPARE_MODELS) {
      const budget = deadline.stageMs(COMPARE_CALL_TIMEOUT_MS);
      if (budget <= 0) return null;
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
              { role: "system", content: COMPARE_SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            temperature: 0.15,
            max_tokens: 4000,
            stream: false,
          }),
          signal: AbortSignal.timeout(budget),
        });
        if (!resp.ok) continue;
        const text = extractText(await resp.json()).trim();
        if (text) return text;
      } catch {
        /* next model */
      }
    }
  }

  const base = workerBase();
  const urls = [`${base}/chat`, `${base}/rvgrok-chat`, `${base}/`];
  for (const url of urls) {
    const budget = deadline.stageMs(COMPARE_CALL_TIMEOUT_MS);
    if (budget <= 0) return null;
    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(budget),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: COMPARE_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          agentMode: false,
          stream: false,
          model: "grok-4-latest",
          preferredModel: "grok-4-latest",
        }),
      });
      if (resp.status === 404 || resp.status === 405) continue;
      if (!resp.ok) continue;
      const ctype = resp.headers.get("content-type") || "";
      if (ctype.includes("text/event-stream")) {
        const text = await resp.text();
        let acc = "";
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const p = JSON.parse(raw);
            acc +=
              p?.choices?.[0]?.delta?.content ||
              p?.choices?.[0]?.message?.content ||
              p?.content ||
              "";
          } catch {
            /* */
          }
        }
        if (acc.trim()) return acc.trim();
        continue;
      }
      const data = await resp.json();
      const text = extractText(data).trim();
      if (text) return text;
    } catch {
      /* */
    }
  }
  return null;
}

function localSummary(coaches: CoachIn[]): string {
  const names = coaches.map(
    (c) =>
      `${c.year} ${c.make} ${c.model}${c.floorplan ? ` ${c.floorplan}` : ""}`,
  );
  const lines = [
    `Side-by-side of ${names.join(" · ")}.`,
    ``,
    `• Use the green cells for clear advantages (higher rating, more CCC, better MPG, lower used ask where priced).`,
    `• Red cells flag relative weak spots among this set — not absolute deal-breakers.`,
    `• Do not decode floorplan letters (BH, K, L, etc.) — they are OEM labels, not bunkhouse/bath codes.`,
    `• Match class & fuel first (gas Class A vs diesel pusher is a lifestyle choice, not a pure score).`,
    `• Always confirm floorplan living layout, UVW on the unit sticker, and a PPI before you buy.`,
    ``,
    `Live Grok summary was not available — this is a structured RV Fox checklist. Connect the chat worker for a full narrative.`,
  ];
  return lines.join("\n");
}

export const Route = createFileRoute("/api/rvfax/compare")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;
        let body: { coaches?: CoachIn[] } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const coaches = (body.coaches || []).slice(0, 3);
        if (coaches.length < 2) {
          return Response.json(
            { error: "Select 2 or 3 coaches to compare." },
            { status: 400 },
          );
        }

        const prompt = [
          `Compare these ${coaches.length} RVs for a dealer talking to a buyer.`,
          FLOORPLAN_CODE_RULE,
          FINDINGS_NOT_GUESSES_RULE,
          `If they share year/make/model and only the floorplan code differs, do not invent layout from the code. Only contrast baths/bunks/slides if the catalog layout line or OEM language for that plan is in the payload. Otherwise say layout is unconfirmed.`,
          `Do not pretend engines differ when they are the same chassis/engine.`,
          `Be specific: who each coach is for ONLY when layout or class is actually known.`,
          `Cover: verified living layout if known, sleeps/slides if provided, powertrain only if they actually differ, used-market value, deal-breakers.`,
          `Coaches:`,
          JSON.stringify(coaches, null, 2),
          ``,
          `Structure:`,
          `1) One-line overview`,
          `2) Best for… (each coach, 1 line — do not invent bunks/families from a code)`,
          `3) Key differences (bullets). If layout is unconfirmed, say that instead of guessing BH/K/L.`,
          `4) Bottom line (2–3 sentences a salesperson can say out loud)`,
        ].join("\n");

        const key = compareCacheKey(coaches);
        const hit = compareCache.get(key);
        if (hit) return Response.json({ ...hit, cached: true });

        const out = await compareInflight.run(key, async () => {
          const live = await callGrok(prompt);
          const text = live || localSummary(coaches);
          const verified = coaches.map((c) => c.layout || "");
          const result: CompareBody = {
            summary: sanitizeUnverifiedLayout(text, verified),
            live: Boolean(live),
            generatedAt: new Date().toISOString(),
          };
          // Only cache real model answers; a fallback checklist may retry later.
          if (live) compareCache.set(key, result);
          return result;
        });
        return Response.json(out);
      },
    },
  },
});
