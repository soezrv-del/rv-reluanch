import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";
import type { LiveDossier } from "@/lib/rv/liveDossier";
import {
  findPowertrainCorrection,
  sanitizeFeaturesForPin,
  sanitizeNarrativeForPin,
  powertrainConflictsWithPin,
} from "@/lib/rv/powertrainCorrections";
import {
  FINDINGS_NOT_GUESSES_RULE,
  FLOORPLAN_CODE_RULE,
  sanitizeUnverifiedLayout,
} from "@/lib/rv/promptRules";
import { findOemFloorplanSpec } from "@/lib/rv/floorplanSpecs";

/**
 * POST /api/rvfax/dossier
 * Phase 3: two-step Live (research notes → JSON), year-band candidate truth
 * injected, latest Grok models, soft fail keeps catalog paint on client.
 */

const cache = new Map<string, { at: number; data: LiveDossier; model?: string }>();
const TTL_MS = 6 * 60 * 60 * 1000;
/** Bump when OEM ground-truth / prompt pipeline / pins change (Phase 4.4) */
const CACHE_VER = "v22-catalog-hard-lock";

/** Prefer current Grok; fall through if a slug is unavailable */
const DOSSIER_MODELS = [
  "grok-4-latest",
  "grok-4",
  "grok-3",
  "grok-2-1212",
] as const;

export type CatalogCandidate = {
  engine?: string | null;
  horsepower?: string | number | null;
  torque?: string | null;
  chassis?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  type?: string | null;
  dataSource?: string | null;
  accuracyNote?: string | null;
  bandFrom?: number | null;
  bandTo?: number | null;
  floorplan?: string | null;
  lengthFt?: string | null;
  gvwr?: string | null;
};

const RESEARCH_SYSTEM = `You are Grok researching one RV for RVFAX Pro.

Task: produce concise RESEARCH NOTES (not JSON) for the EXACT coach identity:
  YEAR + MAKE + MODEL + FLOORPLAN (floorplan is mandatory when provided).

Rules:
1. FLOORPLAN IS PART OF THE IDENTITY. If a floorplan code is given (e.g. 4037, 37BH, 24.1), every hard fact (engine, HP, torque, chassis, length, GVWR, tanks) must be for THAT plan — not the model line average.
2. When floorplan is provided, do NOT answer with model-wide ranges like "34–44 ft" or "B6.7 or L9 360–450" unless the brochure truly lists both as options on that same plan. Prefer the single OEM package for that plan.
3. Powertrain often splits by plan length/tag (e.g. Ventana 34–37 = B6.7 360; 40–43 = L9 400). Never paste a sibling floorplan's option.
4. Prefer OEM brochure / chassis sheet / door-sticker style facts for that MY + plan.
5. Never steal powertrain from a sibling model (Kountry Star ≠ Bay Star; Allegro RED ≠ Bus; Phaeton 37BH ≠ 44OH; Vegas ≠ ACE F53).
6. If floorplan is MISSING, say so and keep powertrain as year-band model default with UNCERTAIN for plan-specific options — do not invent a floorplan.
7. If unsure, say UNCERTAIN — do not invent horsepower (never invent 450).
8. Include a SOURCES line with OEM-style cites.
9. Keep under 400 words.
10. ${FLOORPLAN_CODE_RULE}
11. ${FINDINGS_NOT_GUESSES_RULE}
12. Hard powertrain in these notes is never stored. Catalog year-band and brochure pins are cache truth.
Never call a floorplan a bunkhouse, bath-and-a-half, front-kitchen, or bunks unless the brochure/listing TEXT you found says that. Codes like 37BH, 38K, 37L mean nothing by themselves.
Sections: IDENTITY (year/make/model/floorplan), POWERTRAIN (this floorplan), DIMENSIONS/WEIGHTS (this floorplan), TANKS, MARKET, RELIABILITY, SOURCES.`;

const EXTRACT_SYSTEM = `You are Grok converting RV research notes into an RVFAX Pro OEM dossier JSON.

OUTPUT RULE (absolute):
Your entire reply must be ONE JSON object. No markdown fences. No preamble. First character = { last character = }.

FLOORPLAN RULE:
- The floorplan field in the JSON MUST equal the requested floorplan (or null only if none was requested).
- overallLength, gvwrLbs, engine, horsepower, torqueLbFt, chassis must reflect THAT floorplan when one was requested.
- Do not output model-line ranges as if they were a single plan (e.g. do not set overallLength to a "34-44" style value).
- ${FLOORPLAN_CODE_RULE}
- overview/keyFeatures must not invent bunks or a half-bath from the floorplan code. Only include those if the research notes explicitly found them.

CATALOG CANDIDATE TRUTH:
The user message includes a year+floorplan catalog candidate for powertrain/dims.
- Use catalog candidate engine/HP/chassis/fuel as the default hard facts for this year+floorplan.
- Do NOT override catalog candidate hard powertrain. Catalog year-band and brochure pins are the stored truth. If research disagrees, note it in overview/sourcesNote — never replace engine / HP / chassis / fuel.
- If research is uncertain, keep catalog candidate values (or null) — never invent 450 HP or sibling engines / sibling floorplans.
- Hard powertrain you output is never written to cache. Only pin/year-band is persisted.

SOFT FIELDS (overview, issues, sentiment, market): fill freely from research notes; mention the floorplan in overview when known.

tradeInUsd < retailLowUsd < retailHighUsd for USED USD.
confidence "high" only if powertrain + major dimensions are OEM-certain for this floorplan; else "medium" or "low".

ANTI-SIBLING:
- Never copy powertrain from a different model in the brand.
- Entegra Vision = gas F-53 only. Discovery (not LXE) = ISB/B6.7 class not ISL 8.9. Allegro RED = ISB/B6.7 not V10 and not Bus ISL/L9. Kountry Star = Cummins diesel pusher not Ford 7.3 gas. Thor Vegas/Axis = Ford cutaway RUV not F53 ACE.

Required keys:
year,make,model,floorplan,rvType,engine,horsepower,torqueLbFt,transmission,chassis,fuelType,towingCapacityLbs,fuelCapacityGal,overallLength,exteriorWidth,exteriorHeight,interiorHeight,gvwrLbs,uvwLbs,cccLbs,slideouts,sleeps,freshWaterGal,grayWaterGal,blackWaterGal,generator,mpgHighwayEst,warranty,floorplansThisYear,overview,keyFeatures,reliabilitySummary,commonIssues,servicePriorities,ownerSentiment,ratingEstimate,marketNotes,tradeInUsd,retailLowUsd,retailHighUsd,msrpLowUsd,msrpHighUsd,confidence,sourcesNote

Types: numbers for numeric fields; string[] for arrays; confidence "high"|"medium"|"low".
overview ≤ 2 sentences. keyFeatures/commonIssues/servicePriorities ≤ 5 each.
sourcesNote must name OEM/chassis/listing-style cites from the research notes (not empty fluff).`;

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
    model?: string;
  };
  return String(
    d?.choices?.[0]?.message?.content ||
      d?.choices?.[0]?.text ||
      d?.content ||
      d?.message ||
      "",
  );
}

function stripFences(s: string) {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

/** Pull first JSON object from model text (handles preamble / fences). */
function extractJsonObject(raw: string): string | null {
  const s = stripFences(raw);
  if (!s) return null;
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

function hasRealSources(note: string | null | undefined): boolean {
  if (!note || note.trim().length < 12) return false;
  return /oem|brochure|chassis|freightliner|spartan|cummins|ford\.com|newmar|tiffin|winnebago|forestriver|forest\s*river|nhtsa|rvusa|rv\.com|\.pdf|http|https|listing|door\s*sticker|build\s*sheet|torqshift|allison/i.test(
    note,
  );
}

function parseHpCandidate(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v);
  const m = String(v).replace(/,/g, "").match(/(\d{2,4})/);
  if (!m) return null;
  // ignore "varies" ranges as single override HP
  if (/varies|confirm/i.test(String(v)) && !/^\s*\d{2,4}\s*HP\s*$/i.test(String(v)))
    return null;
  const n = parseInt(m[1]!, 10);
  return n > 0 && n < 900 ? n : null;
}

function formatCandidateBlock(c: CatalogCandidate | undefined, year: string): string {
  if (!c) {
    return `CATALOG CANDIDATE: (none provided — use research carefully; do not invent HP)`;
  }
  const band =
    c.bandFrom && c.bandTo
      ? `year-band ${c.bandFrom}–${c.bandTo}`
      : c.dataSource === "oem-year"
        ? "year-banded OEM"
        : c.dataSource || "catalog";
  const fpLine = c.floorplan
    ? `- floorplan (REQUIRED identity): ${c.floorplan}`
    : `- floorplan: (not selected — do not invent a plan; keep model-year defaults)`;
  return `CATALOG CANDIDATE TRUTH for model year ${year} (${band}):
${fpLine}
- length (catalog): ${c.lengthFt || "null"}
- gvwr (catalog): ${c.gvwr || "null"}
- engine: ${c.engine || "null"}
- horsepower: ${c.horsepower ?? "null"}
- torque: ${c.torque || "null"}
- chassis: ${c.chassis || "null"}
- transmission: ${c.transmission || "null"}
- fuelType: ${c.fuelType || "null"}
- type: ${c.type || "null"}
- note: ${c.accuracyNote || "none"}

CRITICAL: Powertrain + dimensions are YEAR + MAKE + MODEL + FLOORPLAN specific.
Do not apply a sibling floorplan's HP option (e.g. Phaeton 44OH 450 option ≠ 37BH; Ventana 4037 L9 ≠ Ventana 3436 B6.7).
If the floorplan only had 380 HP, never invent 450.
Hard powertrain defaults to this candidate. Override only with high confidence + OEM-style sources for THIS year AND floorplan.`;
}

type GrokCallResult = { text: string; model: string; upstream: string };

async function callXaiChat(
  system: string,
  user: string,
  opts?: { temperature?: number; jsonMode?: boolean },
): Promise<GrokCallResult | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  for (const model of DOSSIER_MODELS) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: opts?.temperature ?? 0.1,
        max_tokens: 4000,
        stream: false,
      };
      // Some models accept response_format; ignore if rejected via next model
      if (opts?.jsonMode) {
        body.response_format = { type: "json_object" };
      }
      const resp = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      const text = extractText(data).trim();
      if (!text) continue;
      const used =
        (data as { model?: string })?.model || model;
      return { text, model: String(used), upstream: "xai-direct" };
    } catch {
      /* try next model */
    }
  }
  return null;
}

async function callWorkerChat(
  system: string,
  user: string,
  preferModel: string,
): Promise<GrokCallResult | null> {
  const base = workerBase();
  const urls = [`${base}/chat`, `${base}/rvgrok-chat`, `${base}/`];
  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          // Keep false so worker returns content not agent "I need to research" loops
          agentMode: false,
          stream: false,
          model: preferModel,
          preferredModel: preferModel,
        }),
      });
      if (resp.status === 404 || resp.status === 405) continue;
      if (!resp.ok) continue;
      const modelHdr =
        resp.headers.get("X-Model-Used") ||
        resp.headers.get("x-model-used") ||
        preferModel;
      const ctype = resp.headers.get("content-type") || "";
      if (ctype.includes("text/event-stream")) {
        const text = await resp.text();
        let acc = "";
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const p = JSON.parse(raw) as {
              choices?: Array<{ delta?: { content?: string } }>;
              content?: string;
            };
            acc += p?.choices?.[0]?.delta?.content || p?.content || "";
          } catch {
            /* */
          }
        }
        if (acc.trim())
          return {
            text: acc.trim(),
            model: modelHdr,
            upstream: "cloudflare-worker",
          };
        continue;
      }
      const data = await resp.json();
      const text = extractText(data).trim();
      if (text) {
        return {
          text,
          model:
            (data as { model?: string })?.model || modelHdr,
          upstream: "cloudflare-worker",
        };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function callGrok(
  system: string,
  user: string,
  opts?: { temperature?: number; jsonMode?: boolean },
): Promise<GrokCallResult | null> {
  // Prefer direct xAI with latest models when key present; else worker
  const direct = await callXaiChat(system, user, opts);
  if (direct) return direct;
  return callWorkerChat(system, user, DOSSIER_MODELS[0]);
}

/**
 * Phase 3.1 — research notes, then JSON extract.
 */
async function runTwoStepDossier(opts: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  candidate?: CatalogCandidate;
}): Promise<{ rawJson: string; model: string; research: string } | null> {
  const coach = `${opts.year} ${opts.make} ${opts.model}${opts.floorplan ? ` floorplan ${opts.floorplan}` : " (NO FLOORPLAN SELECTED)"}`;
  const candidateBlock = formatCandidateBlock(opts.candidate, opts.year);
  const fpRule = opts.floorplan
    ? `FLOORPLAN LOCK: Research ONLY floorplan "${opts.floorplan}". Length, GVWR, engine, and HP must match this plan. Do not average the whole model line.`
    : `NO FLOORPLAN: State that plan-specific options are unknown. Do not invent a floorplan or a single definitive length/HP package.`;

  const researchUser = `Research this exact coach for RVFAX:
${coach}

${fpRule}

${candidateBlock}

Write RESEARCH NOTES with IDENTITY, POWERTRAIN (this floorplan), DIMENSIONS/WEIGHTS (this floorplan), TANKS, MARKET, RELIABILITY, and SOURCES.
POWERTRAIN must match this model year AND floorplan (not a sibling plan or model). If candidate and research disagree, explain.
${FLOORPLAN_CODE_RULE}
Do not call it a bunkhouse or bath-and-a-half unless the OEM/listing text you found uses those words.`;

  const research = await callGrok(RESEARCH_SYSTEM, researchUser, {
    temperature: 0.1,
  });
  if (!research?.text) return null;

  const extractUser = `Coach: ${coach}
${fpRule}

${candidateBlock}

RESEARCH NOTES:
${research.text.slice(0, 6000)}

Convert to the required RVFAX dossier JSON only.
JSON floorplan field must be ${opts.floorplan ? JSON.stringify(opts.floorplan) : "null"}.
Keep catalog candidate hard powertrain unless research + sources justify a high-confidence override for THIS floorplan.
sourcesNote must include real OEM/chassis/listing-style cites from the notes.`;

  const extracted = await callGrok(EXTRACT_SYSTEM, extractUser, {
    temperature: 0.1,
    jsonMode: true,
  });
  if (!extracted?.text) {
    // Fallback: single-shot JSON from research text alone
    const fallback = await callGrok(
      EXTRACT_SYSTEM,
      extractUser,
      { temperature: 0.1, jsonMode: false },
    );
    if (!fallback?.text) return null;
    return {
      rawJson: fallback.text,
      model: `${research.model}→${fallback.model}`,
      research: research.text,
    };
  }

  return {
    rawJson: extracted.text,
    model: `${research.model}→${extracted.model}`,
    research: research.text,
  };
}

function applyBrochurePin(d: LiveDossier): LiveDossier {
  const pin = findPowertrainCorrection(
    d.year,
    d.make,
    d.model,
    d.floorplan || undefined,
  );
  if (!pin) return d;
  const needsFix =
    !d.engine ||
    powertrainConflictsWithPin(pin, d.engine, d.horsepower) ||
    (pin.horsepower > 0 &&
      d.horsepower != null &&
      Math.abs(d.horsepower - pin.horsepower) >= 40);
  if (!needsFix && d.engine) {
    // still normalize narrative
    return {
      ...d,
      engine: pin.engine,
      horsepower: pin.horsepower,
      torqueLbFt: pin.torqueLbFt ?? d.torqueLbFt,
      chassis: pin.chassis ?? d.chassis,
      transmission: pin.transmission ?? d.transmission,
      fuelType: pin.fuelType ?? d.fuelType,
      overview: sanitizeNarrativeForPin(pin, d.overview),
      keyFeatures: sanitizeFeaturesForPin(pin, d.keyFeatures),
      reliabilitySummary: sanitizeNarrativeForPin(pin, d.reliabilitySummary),
      marketNotes: sanitizeNarrativeForPin(pin, d.marketNotes),
    };
  }
  return {
    ...d,
    engine: pin.engine,
    horsepower: pin.horsepower,
    torqueLbFt: pin.torqueLbFt ?? d.torqueLbFt,
    chassis: pin.chassis ?? d.chassis,
    transmission: pin.transmission ?? d.transmission,
    fuelType: pin.fuelType ?? d.fuelType,
    overview: sanitizeNarrativeForPin(pin, d.overview),
    keyFeatures: sanitizeFeaturesForPin(pin, d.keyFeatures),
    reliabilitySummary: sanitizeNarrativeForPin(pin, d.reliabilitySummary),
    marketNotes: sanitizeNarrativeForPin(pin, d.marketNotes),
    sourcesNote: [d.sourcesNote, pin.note].filter(Boolean).join(" · "),
  };
}

/**
 * Phase 3.2 — candidate truth wins unless Live is high-confidence + real sources
 * and does not conflict with fuel/engine family.
 */
function applyCatalogCandidateTruth(
  d: LiveDossier,
  candidate: CatalogCandidate | undefined,
): LiveDossier {
  if (!candidate) return d;
  const pin = findPowertrainCorrection(
    d.year,
    d.make,
    d.model,
    d.floorplan || undefined,
  );
  // Pin applied separately; still use candidate when no pin
  if (pin) return d;

  const canOverride = false;

  const catEngine = candidate.engine?.trim() || null;
  const catHp = parseHpCandidate(candidate.horsepower);
  const catChassis = candidate.chassis?.trim() || null;
  const catTrans = candidate.transmission?.trim() || null;
  const catFuel = candidate.fuelType?.trim() || null;

  let engine = d.engine;
  let horsepower = d.horsepower;
  let chassis = d.chassis;
  let transmission = d.transmission;
  let fuelType = d.fuelType;
  let notes = d.sourcesNote;

  const liveConflictsCandidate =
    catEngine &&
    engine &&
    ((/diesel|cummins|isb|b6/i.test(catEngine) &&
      /godzilla|triton|v10|f-?53/i.test(engine) &&
      !/cummins|diesel|isb|b6/i.test(engine)) ||
      (/godzilla|triton|v10|f-?53|gas/i.test(catEngine) &&
        /cummins|l9|isl|diesel/i.test(engine) &&
        !/godzilla|triton|v10|gas/i.test(engine)));

  if (catEngine) {
    if (!engine || liveConflictsCandidate || !canOverride) {
      // Keep candidate when live empty, conflicts, or not allowed to override
      if (!canOverride || !engine || liveConflictsCandidate) {
        engine = catEngine;
        if (catHp != null) horsepower = catHp;
        if (catChassis) chassis = catChassis;
        if (catTrans) transmission = catTrans;
        if (catFuel) fuelType = catFuel;
        if (liveConflictsCandidate || !canOverride) {
          notes = [
            notes,
            "Hard powertrain held to year-band catalog candidate (Live override not allowed without high confidence + OEM sources).",
          ]
            .filter(Boolean)
            .join(" ");
        }
      }
    }
  } else if (catHp != null && (horsepower == null || horsepower <= 0)) {
    horsepower = catHp;
  }

  // Always fill empties from candidate
  if ((!engine || engine === "—") && catEngine) engine = catEngine;
  if ((horsepower == null || horsepower <= 0) && catHp != null)
    horsepower = catHp;
  if ((!chassis || chassis === "—") && catChassis) chassis = catChassis;
  if ((!transmission || transmission === "—") && catTrans)
    transmission = catTrans;
  if (!fuelType && catFuel) fuelType = catFuel;

  return {
    ...d,
    engine,
    horsepower,
    chassis,
    transmission,
    fuelType,
    sourcesNote: notes,
  };
}

function applyOemGroundTruth(d: LiveDossier): LiveDossier {
  // Keep existing specialized rules from prior versions by re-importing logic
  // via brochure pin + light Discovery/RED/Vision guards already in corrections.
  let out = { ...d };

  // Vision gas guard
  if (/vision/i.test(out.model || "") && !/xl|diesel/i.test(out.model || "")) {
    const blob = `${out.engine || ""} ${out.chassis || ""} ${out.fuelType || ""}`;
    if (/cummins|l9|isl|diesel/i.test(blob) && !/godzilla|f-?53|gas/i.test(blob)) {
      out = {
        ...out,
        engine: "Ford 7.3L V8 Godzilla",
        horsepower: 350,
        chassis: out.chassis || "Ford F53",
        fuelType: "Gas",
        sourcesNote: [out.sourcesNote, "Vision gas F53 guard"].filter(Boolean).join(" · "),
      };
    }
  }

  out = applyBrochurePin(out);
  const oem = findOemFloorplanSpec(
    out.year,
    out.make,
    out.model,
    out.floorplan || "",
  );
  const verified = [oem?.layoutNote, oem?.note];
  out = {
    ...out,
    overview: sanitizeUnverifiedLayout(out.overview, verified) || out.overview,
    reliabilitySummary:
      sanitizeUnverifiedLayout(out.reliabilitySummary, verified) ||
      out.reliabilitySummary,
    marketNotes:
      sanitizeUnverifiedLayout(out.marketNotes, verified) || out.marketNotes,
    keyFeatures: (out.keyFeatures || []).map((f) =>
      sanitizeUnverifiedLayout(f, verified),
    ),
  };
  return out;
}

function parseDossier(
  raw: string,
  year: number,
  make: string,
  model: string,
  floorplan?: string,
  researchNotes?: string,
): LiveDossier | null {
  try {
    const jsonText = extractJsonObject(raw) ?? stripFences(raw);
    const j = JSON.parse(jsonText) as Record<string, unknown>;
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        if (j[k] != null && j[k] !== "") return j[k];
      }
      return null;
    };
    const num = (...keys: string[]) => {
      const v = pick(...keys);
      if (v == null || v === "") return null;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      const m = String(v).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
      if (!m) return null;
      const n = Number(m[0]);
      return Number.isFinite(n) ? n : null;
    };
    const str = (...keys: string[]) => {
      const v = pick(...keys);
      if (v == null) return null;
      const s = String(v).trim();
      return s || null;
    };
    const arr = (k: string) => {
      const v = j[k];
      if (!Array.isArray(v)) return [] as string[];
      return v.map((x) => String(x)).filter(Boolean).slice(0, 8);
    };
    const conf = String(j.confidence || "medium").toLowerCase();
    const confidence =
      conf === "high" || conf === "low" ? conf : ("medium" as const);

    let sourcesNote = str("sourcesNote");
    if (!hasRealSources(sourcesNote) && researchNotes) {
      const srcLine = researchNotes
        .split(/\n/)
        .find((l) => /source/i.test(l));
      if (srcLine) {
        sourcesNote = [sourcesNote, srcLine.trim()].filter(Boolean).join(" · ");
      } else if (!sourcesNote) {
        sourcesNote =
          "Research notes synthesis — verify against OEM brochure / chassis sheet";
      }
    }

    let d: LiveDossier = {
      year: num("year") ?? year,
      make: str("make") || make,
      model: str("model") || model,
      floorplan: str("floorplan") || floorplan || null,
      rvType: str("rvType", "type", "class"),
      engine: str("engine", "powerplant"),
      horsepower: num("horsepower", "hp"),
      torqueLbFt: num("torqueLbFt", "torque", "torque_lb_ft"),
      transmission: str("transmission"),
      chassis: str("chassis"),
      fuelType: str("fuelType", "fuel"),
      towingCapacityLbs: num("towingCapacityLbs", "towCapacity", "tow_capacity"),
      fuelCapacityGal: num("fuelCapacityGal", "fuel_capacity", "fuelCapacity"),
      overallLength: str("overallLength", "length", "length_ft"),
      exteriorWidth: str("exteriorWidth", "width"),
      exteriorHeight: str("exteriorHeight", "height"),
      interiorHeight: str("interiorHeight", "ceiling"),
      gvwrLbs: num("gvwrLbs", "gvwr"),
      uvwLbs: num("uvwLbs", "uvw"),
      cccLbs: num("cccLbs", "ccc"),
      slideouts: num("slideouts", "slides", "slideoutsCount"),
      sleeps: num("sleeps"),
      freshWaterGal: num("freshWaterGal", "fresh_water", "freshWater"),
      grayWaterGal: num("grayWaterGal", "gray_water", "grayWater"),
      blackWaterGal: num("blackWaterGal", "black_water", "blackWater"),
      generator: str("generator"),
      mpgHighwayEst: num("mpgHighwayEst", "mpg", "highwayMpg"),
      warranty: str("warranty"),
      floorplansThisYear: arr("floorplansThisYear"),
      overview: str("overview"),
      keyFeatures: (() => {
        const a = arr("keyFeatures");
        return a.length ? a : arr("features");
      })(),
      reliabilitySummary: str("reliabilitySummary"),
      commonIssues: arr("commonIssues"),
      servicePriorities: arr("servicePriorities"),
      ownerSentiment: str("ownerSentiment"),
      ratingEstimate: num("ratingEstimate"),
      marketNotes: str("marketNotes"),
      tradeInUsd: num("tradeInUsd", "tradeIn"),
      retailLowUsd: num("retailLowUsd", "retailLow"),
      retailHighUsd: num("retailHighUsd", "retailHigh"),
      msrpLowUsd: num("msrpLowUsd", "msrpLow"),
      msrpHighUsd: num("msrpHighUsd", "msrpHigh"),
      confidence,
      sourcesNote,
      fetchedAt: new Date().toISOString(),
      live: true,
    };

    d = applyOemGroundTruth(d);
    return d;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/rvfax/dossier")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            year?: string | number;
            make?: string;
            model?: string;
            floorplan?: string;
            catalogCandidate?: CatalogCandidate;
          };
          const year = String(body.year ?? "").trim();
          const make = String(body.make ?? "").trim();
          const model = String(body.model ?? "").trim();
          const floorplan = String(body.floorplan ?? "").trim();
          const catalogCandidate = body.catalogCandidate;

          if (!year || !make || !model) {
            return Response.json(
              { error: "year, make, and model are required" },
              { status: 400 },
            );
          }

          const yNum = parseInt(year, 10) || 0;
          const key =
            `${CACHE_VER}|${year}|${make}|${model}|${floorplan}`.toLowerCase();
          const hit = cache.get(key);
          if (hit && Date.now() - hit.at < TTL_MS) {
            let data = applyOemGroundTruth({ ...hit.data, cached: true });
            data = applyCatalogCandidateTruth(data, catalogCandidate);
            data = applyBrochurePin(data);
            return Response.json({
              data,
              meta: {
                model: hit.model || "cache",
                cached: true,
                pipeline: "phase3-two-step",
              },
            });
          }

          const twoStep = await runTwoStepDossier({
            year,
            make,
            model,
            floorplan,
            candidate: catalogCandidate,
          });

          if (!twoStep) {
            return Response.json(
              {
                error:
                  "Live dossier unavailable — catalog year-band remains on screen.",
                meta: { pipeline: "phase3-two-step", model: null },
              },
              { status: 502 },
            );
          }

          let parsed = parseDossier(
            twoStep.rawJson,
            yNum,
            make,
            model,
            floorplan,
            twoStep.research,
          );
          if (!parsed) {
            return Response.json(
              {
                error:
                  "Live dossier returned unreadable data — catalog year-band remains.",
                meta: { model: twoStep.model, pipeline: "phase3-two-step" },
              },
              { status: 502 },
            );
          }

          parsed = applyCatalogCandidateTruth(parsed, catalogCandidate);
          parsed = applyBrochurePin(parsed);
          if (!hasRealSources(parsed.sourcesNote)) {
            parsed = {
              ...parsed,
              sourcesNote: [
                parsed.sourcesNote,
                "Phase-3 research synthesis — confirm OEM brochure / chassis sheet for transactions",
              ]
                .filter(Boolean)
                .join(" · "),
              confidence:
                parsed.confidence === "high" ? "medium" : parsed.confidence,
            };
          }

          cache.set(key, {
            at: Date.now(),
            data: {
              ...parsed,
              engine: null,
              horsepower: null,
              torqueLbFt: null,
              chassis: null,
              transmission: null,
              fuelType: null,
            },
            model: twoStep.model,
          });

          return Response.json({
            data: parsed,
            meta: {
              model: twoStep.model,
              cached: false,
              pipeline: "phase3-two-step",
              preferredModels: DOSSIER_MODELS,
            },
          });
        } catch (e) {
          return Response.json(
            {
              error:
                e instanceof Error
                  ? e.message
                  : "Live dossier request failed — catalog remains.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
