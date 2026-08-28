import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";
import {
  finalizePatch,
  type CatalogPowertrainPatch,
  type PatchConfidence,
} from "@/lib/rv/catalogPatch";

/**
 * POST /api/rvfax/catalog-research
 * AI homework: research powertrain for year(+range) + make + model + optional floorplans.
 * Returns validated CatalogPowertrainPatch[] — never auto-writes rvData (ops reviews / accept).
 */

const DOSSIER_MODELS = [
  "grok-4-latest",
  "grok-4",
  "grok-3",
  "grok-2-1212",
] as const;

const RESEARCH_SYSTEM = `You are Grok building an accurate RV OEM powertrain catalog for RVFAX Pro.

OUTPUT: ONE JSON object only. First char { last char }. No markdown.

Shape:
{
  "patches": [
    {
      "yearFrom": 2019,
      "yearTo": 2024,
      "floorplan": "37BH" or null for model-wide default,
      "engine": "exact OEM string",
      "horsepower": 380,
      "torqueLbFt": 1150,
      "chassis": "...",
      "transmission": "...",
      "fuelType": "Diesel" or "Gas",
      "generator": "optional",
      "towingCapacity": 10000,
      "confidence": "high" | "medium" | "low",
      "sources": ["OEM brochure name or URL style cite", "..."],
      "notes": "short note; call out floorplan-only options"
    }
  ]
}

RULES (accuracy > completeness):
1. Research THIS make/model only. Never steal sibling model powertrains.
2. Floorplan options differ (e.g. Phaeton 37BH ≠ 44OH tag 450 option). If a floorplan is listed, facts must be for THAT floorplan.
3. Prefer year bands when OEM changed engines (V10→Godzilla, ISL→L9, etc.).
4. If HP is optional by floorplan, emit SEPARATE patches per floorplan — do not invent a model-wide 450.
5. Unknown → omit or confidence "low". Never invent 450 HP as a default.
6. confidence "high" only with OEM/chassis/brochure-style sources.
7. Max 12 patches per response. Cover the requested years and floorplans.
8. Floorplan codes (BH, K, L, J, N…) are labels only. Do not infer bunks, baths, or layout from letters.`;

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

function extractJsonObject(raw: string): string | null {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  if (s.startsWith("{") && s.endsWith("}")) return s;
  const start = s.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i]!;
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

async function callGrok(
  system: string,
  user: string,
): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (apiKey) {
    for (const model of DOSSIER_MODELS) {
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
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            temperature: 0.1,
            max_tokens: 4000,
            stream: false,
            response_format: { type: "json_object" },
          }),
        });
        if (!resp.ok) continue;
        const data = await resp.json();
        const text = extractText(data).trim();
        if (text)
          return {
            text,
            model: String((data as { model?: string }).model || model),
          };
      } catch {
        /* next */
      }
    }
  }

  // Worker fallback
  const base = workerBase();
  for (const url of [`${base}/chat`, `${base}/rvgrok-chat`, `${base}/`]) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          agentMode: false,
          stream: false,
          model: DOSSIER_MODELS[0],
        }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      const text = extractText(data).trim();
      if (text)
        return {
          text,
          model:
            resp.headers.get("X-Model-Used") ||
            DOSSIER_MODELS[0],
        };
    } catch {
      /* */
    }
  }
  return null;
}

function parsePatches(
  raw: string,
  make: string,
  model: string,
  fuelHint: string | null,
  modelUsed: string,
): CatalogPowertrainPatch[] {
  const jsonText = extractJsonObject(raw);
  if (!jsonText) return [];
  let parsed: { patches?: unknown[] };
  try {
    parsed = JSON.parse(jsonText) as { patches?: unknown[] };
  } catch {
    return [];
  }
  const list = Array.isArray(parsed.patches) ? parsed.patches : [];
  const out: CatalogPowertrainPatch[] = [];
  for (const item of list.slice(0, 16)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const yearFrom = Number(o.yearFrom ?? o.from ?? o.year);
    const yearTo = Number(o.yearTo ?? o.to ?? o.year ?? yearFrom);
    if (!Number.isFinite(yearFrom) || !Number.isFinite(yearTo)) continue;
    const engine = String(o.engine || "").trim();
    if (!engine) continue;
    const confRaw = String(o.confidence || "medium").toLowerCase();
    const confidence: PatchConfidence =
      confRaw === "high" || confRaw === "low" ? confRaw : "medium";
    const sources = Array.isArray(o.sources)
      ? o.sources.map((s) => String(s)).filter(Boolean).slice(0, 8)
      : o.sourcesNote
        ? [String(o.sourcesNote)]
        : [];
    const hp =
      o.horsepower == null || o.horsepower === ""
        ? null
        : Number(o.horsepower);
    const patch = finalizePatch(
      {
        make,
        model,
        yearFrom: Math.round(yearFrom),
        yearTo: Math.round(yearTo),
        floorplan: o.floorplan
          ? String(o.floorplan).trim()
          : null,
        engine,
        horsepower:
          hp != null && Number.isFinite(hp) && hp > 0 ? Math.round(hp) : null,
        torqueLbFt:
          o.torqueLbFt != null && Number(o.torqueLbFt) > 0
            ? Math.round(Number(o.torqueLbFt))
            : null,
        chassis: o.chassis ? String(o.chassis) : null,
        transmission: o.transmission ? String(o.transmission) : null,
        fuelType: o.fuelType ? String(o.fuelType) : fuelHint,
        generator: o.generator ? String(o.generator) : null,
        towingCapacity:
          o.towingCapacity != null && Number(o.towingCapacity) > 0
            ? Math.round(Number(o.towingCapacity))
            : null,
        confidence,
        sources,
        notes: o.notes ? String(o.notes) : null,
        modelUsed,
      },
      fuelHint,
    );
    out.push(patch);
  }
  return out;
}

export const Route = createFileRoute("/api/rvfax/catalog-research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            make?: string;
            model?: string;
            yearFrom?: number | string;
            yearTo?: number | string;
            floorplans?: string[];
            fuelType?: string;
            type?: string;
            catalogEngine?: string;
            catalogHp?: number | string;
          };

          const make = String(body.make || "").trim();
          const model = String(body.model || "").trim();
          if (!make || !model) {
            return Response.json(
              { error: "make and model are required" },
              { status: 400 },
            );
          }

          const yearFrom = parseInt(String(body.yearFrom ?? 2016), 10) || 2016;
          const yearTo = parseInt(String(body.yearTo ?? 2026), 10) || 2026;
          const floorplans = Array.isArray(body.floorplans)
            ? body.floorplans.map((f) => String(f).trim()).filter(Boolean)
            : [];
          const fuelType = body.fuelType ? String(body.fuelType) : null;

          const user = `Build powertrain catalog patches for:
Make: ${make}
Model: ${model}
Type: ${body.type || "unknown"}
Fuel (catalog hint): ${fuelType || "unknown"}
Catalog top-level engine hint: ${body.catalogEngine || "none"}
Catalog top-level HP hint: ${body.catalogHp ?? "none"}
Year range: ${yearFrom}–${yearTo}
Floorplans to cover (emit per-floorplan patches when options differ): ${
            floorplans.length ? floorplans.join(", ") : "(model-wide only; still split if options differ by plan)"
          }

Return patches JSON only. Prefer accuracy. Floorplan-specific when brochure options differ.`;

          const result = await callGrok(RESEARCH_SYSTEM, user);
          if (!result) {
            return Response.json(
              {
                error:
                  "Catalog research unavailable — check AI upstream. No patches written.",
              },
              { status: 502 },
            );
          }

          const patches = parsePatches(
            result.text,
            make,
            model,
            fuelType,
            result.model,
          );

          return Response.json({
            data: {
              make,
              model,
              yearFrom,
              yearTo,
              floorplans,
              patches,
              modelUsed: result.model,
              researchedAt: new Date().toISOString(),
            },
            meta: {
              pipeline: "catalog-research-v1",
              preferredModels: DOSSIER_MODELS,
              highOk: patches.filter(
                (p) => p.confidence === "high" && p.validation.ok,
              ).length,
              mediumOk: patches.filter(
                (p) => p.confidence === "medium" && p.validation.ok,
              ).length,
              failedValidation: patches.filter((p) => !p.validation.ok).length,
            },
          });
        } catch (e) {
          return Response.json(
            {
              error:
                e instanceof Error
                  ? e.message
                  : "Catalog research failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
