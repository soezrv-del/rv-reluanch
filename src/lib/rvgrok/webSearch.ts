/**
 * Optional xAI web search sidecar for chat when the turn needs live notes
 * (troubleshooting / OEM / forum / manual, or a missing hard spec).
 *
 * Confirmed: Live Search `search_parameters` on chat completions is retired
 * (410 Gone). The working path is POST /v1/responses with { type: "web_search" }.
 * If the key is missing or the call fails, callers must say so honestly —
 * never pretend a brochure or bulletin was fetched.
 */

import { looksLikeLiveResearchQuestion, looksLikeSpecQuestion } from "./grounding";

export const WEB_SEARCH_TOOL = { type: "web_search" } as const;

export type WebSearchNotes =
  | { ok: true; notes: string; model: string }
  | { ok: false; reason: string };

function researchSystemPrompt(catalog: string, query: string): string {
  const wantsHelp = looksLikeLiveResearchQuestion(query);
  const wantsSpec = looksLikeSpecQuestion(query);
  const lines = [
    "You research one RV question for RVFAX. Return short RESEARCH NOTES only — no JSON.",
    "Never invent horsepower (no silent 450) or a diagnosis you cannot support. Cite uncertainty.",
    "Never steal powertrain from a sibling model. Entegra Vision is gas F-53 Godzilla, not diesel.",
    "Floorplan letters are labels only — do not decode bunks or a half-bath from the code.",
  ];
  if (wantsSpec || !wantsHelp) {
    lines.push(
      "If this is a spec/powertrain ask: prefer OEM brochure / chassis sheet / door-sticker facts for THAT year + make + model + floorplan. If not found, write UNKNOWN and what to verify.",
    );
  }
  if (wantsHelp) {
    lines.push(
      "If this is troubleshooting / how-to / error code / TSB / recall / install: note likely symptoms, OEM bulletins or common forum/manual fixes, and safety caveats. Keep it short. Do not invent a campaign number or HP.",
    );
  }
  if (catalog) {
    lines.push(`Catalog lock (do not contradict these numbers):\n${catalog}`);
  } else {
    lines.push(
      "No catalog row was available. If the web does not confirm a number, say UNKNOWN.",
    );
  }
  return lines.join("\n");
}

function researchUserPrompt(query: string): string {
  if (looksLikeLiveResearchQuestion(query) && !looksLikeSpecQuestion(query)) {
    return `Find current OEM / TSB / manual / forum RESEARCH NOTES (symptoms, common fixes, safety caveats) for: ${query}`;
  }
  if (looksLikeLiveResearchQuestion(query)) {
    return `Find OEM-accurate powertrain if asked, plus troubleshooting / bulletin RESEARCH NOTES for: ${query}`;
  }
  return `Find OEM-accurate powertrain (engine, HP, chassis, fuel) for: ${query}`;
}

export function buildWebSearchRequest(opts: {
  model: string;
  query: string;
  catalogBlock?: string;
}): Record<string, unknown> {
  const catalog = (opts.catalogBlock || "").trim();

  return {
    model: opts.model,
    input: [
      { role: "system", content: researchSystemPrompt(catalog, opts.query) },
      {
        role: "user",
        content: researchUserPrompt(opts.query),
      },
    ],
    tools: [WEB_SEARCH_TOOL],
    temperature: 0.1,
    max_output_tokens: 900,
  };
}

export function extractResponsesText(data: unknown): string {
  const d = data as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
      text?: string;
    }>;
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (typeof d?.output_text === "string" && d.output_text.trim()) {
    return d.output_text.trim();
  }
  if (Array.isArray(d?.output)) {
    const parts: string[] = [];
    for (const item of d.output) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c?.text) parts.push(c.text);
        }
      } else if (item?.text) {
        parts.push(item.text);
      }
    }
    if (parts.length) return parts.join("\n").trim();
  }
  const chat = d?.choices?.[0]?.message?.content;
  return chat ? String(chat).trim() : "";
}

export function formatWebSearchInjection(result: WebSearchNotes): string {
  if (result.ok) {
    return [
      "WEB RESEARCH NOTES (xAI web_search — may be incomplete):",
      result.notes.slice(0, 3500),
      "You have live web research this turn — do not claim you have no internet or cannot get online.",
      "Catalog lock still wins if it names a number. Use notes for troubleshooting / OEM / forum context. If notes do not confirm a fact, say unknown / EST.",
    ].join("\n");
  }
  return `WEB SEARCH NOT AVAILABLE this turn (${result.reason}). Be honest that you could not browse. Give your best EST. and what to verify — do not invent HP, engine, chassis, fuel, a bulletin, or a campaign number.`;
}

export async function fetchWebSearchNotes(opts: {
  apiKey: string | undefined;
  query: string;
  catalogBlock?: string;
}): Promise<WebSearchNotes> {
  if (!opts.apiKey) {
    return { ok: false, reason: "no XAI_API_KEY on the server" };
  }
  const models = ["grok-4.5", "grok-4-latest", "grok-4"];
  let last = "web search request failed";
  for (const model of models) {
    try {
      const resp = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.apiKey}`,
        },
        body: JSON.stringify(
          buildWebSearchRequest({
            model,
            query: opts.query,
            catalogBlock: opts.catalogBlock,
          }),
        ),
        signal: AbortSignal.timeout(18_000),
      });
      if (!resp.ok) {
        last = `web search HTTP ${resp.status}`;
        continue;
      }
      const data = await resp.json();
      const notes = extractResponsesText(data);
      if (notes) return { ok: true, notes, model };
      last = "web search returned empty notes";
    } catch (e) {
      last = e instanceof Error ? e.message : "web search error";
    }
  }
  return { ok: false, reason: last };
}
