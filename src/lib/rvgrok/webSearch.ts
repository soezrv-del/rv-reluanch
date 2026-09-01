/**
 * Optional xAI web search sidecar for chat when catalog misses a hard field.
 *
 * Confirmed: Live Search `search_parameters` on chat completions is retired
 * (410 Gone). The working path is POST /v1/responses with { type: "web_search" }.
 * If the key is missing or the call fails, callers must say so honestly —
 * never pretend a brochure was fetched.
 */

export const WEB_SEARCH_TOOL = { type: "web_search" } as const;

export type WebSearchNotes =
  | { ok: true; notes: string; model: string }
  | { ok: false; reason: string };

export function buildWebSearchRequest(opts: {
  model: string;
  query: string;
  catalogBlock?: string;
}): Record<string, unknown> {
  const catalog = (opts.catalogBlock || "").trim();
  const system = [
    "You research one RV for RVFAX. Return short RESEARCH NOTES only — no JSON.",
    "Prefer OEM brochure / chassis sheet / door-sticker facts for THAT year + make + model + floorplan.",
    "Never invent horsepower (no silent 450). If not found, write UNKNOWN and what to verify.",
    "Never steal powertrain from a sibling model. Entegra Vision is gas F-53 Godzilla, not diesel.",
    "Floorplan letters are labels only — do not decode bunks or a half-bath from the code.",
    catalog
      ? `Catalog lock (do not contradict these numbers):\n${catalog}`
      : "No catalog row was available. If the web does not confirm a number, say UNKNOWN.",
  ].join("\n");

  return {
    model: opts.model,
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Find OEM-accurate powertrain (engine, HP, chassis, fuel) for: ${opts.query}`,
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
      "Catalog lock still wins if it names a number. If notes do not confirm a missing field, say unknown / EST.",
    ].join("\n");
  }
  return `WEB SEARCH NOT AVAILABLE this turn (${result.reason}). If the catalog line is UNKNOWN, say unknown / EST. and what to verify — do not invent HP, engine, chassis, or fuel.`;
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
