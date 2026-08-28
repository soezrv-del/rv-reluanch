import { createFileRoute } from "@tanstack/react-router";
import type {
  NhtsaComplaint,
  NhtsaRecall,
  NhtsaRecallsResult,
} from "@/lib/nhtsa/recalls";

/**
 * GET /api/nhtsa/recalls?year=2022&make=Tiffin&model=Allegro%20Bus
 *
 * Lookup order (never say “nothing found” until exhausted):
 *  1. Exact year + make + model (normalized variants)
 *  2. Official NHTSA product model list for make/year → match model
 *  3. Broader parent manufacturers (e.g. Entegra → Jayco)
 *  4. Chassis/equipment-adjacent makes when relevant (Spartan)
 */

const RECALLS_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle";
const COMPLAINTS_URL =
  "https://api.nhtsa.gov/complaints/complaintsByVehicle";
const MODELS_URL = "https://api.nhtsa.gov/products/vehicle/models";

const cache = new Map<string, { at: number; data: NhtsaRecallsResult }>();
const TTL_MS = 12 * 60 * 60 * 1000; // shorter so fixed logic isn't stuck on empty

function nhtsaHeaders(): HeadersInit {
  const key = process.env.NHTSA_API_KEY?.trim();
  const base: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "RVFAX/1.0 (nhtsa-lookup)",
  };
  if (key) base["X-Api-Key"] = key;
  return base;
}

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => {
      if (!w) return w;
      if (w.length <= 3 && w === w.toUpperCase()) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Parent / alternate NHTSA makes when brand marketing name fails */
function parentMakes(make: string): string[] {
  const m = make.toLowerCase();
  if (m.includes("entegra")) return ["Entegra", "Jayco"];
  if (m.includes("holiday rambler")) return ["Holiday Rambler", "Monaco"];
  if (m.includes("american coach")) return ["American Coach", "Fleetwood"];
  if (m.includes("fleetwood")) return ["Fleetwood"];
  if (m.includes("thor")) return ["Thor Motor Coach", "Thor"];
  if (m.includes("coachmen")) return ["Coachmen", "Forest River"];
  if (m.includes("jayco")) return ["Jayco"];
  if (m.includes("newmar")) return ["Newmar"];
  if (m.includes("tiffin")) return ["Tiffin"];
  if (m.includes("winnebago")) return ["Winnebago"];
  if (m.includes("renegade")) return ["Renegade"];
  return [];
}

function makeVariants(make: string): string[] {
  const raw = titleCase(make);
  const out: string[] = [];
  const push = (v: string) => {
    const t = v.trim();
    if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  };

  // Prefer short official NHTSA makes first (ENTEGRA not "Entegra Coach")
  const stripped = raw
    .replace(
      /\b(Coach|Motor\s*Coach|Motorhomes?|Inc\.?|Llc|Corp\.?|Corporation|Company)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
  if (stripped) push(stripped);
  push(raw);
  const first = raw.split(" ")[0];
  if (first) push(first);
  for (const p of parentMakes(make)) push(p);
  // Chassis maker last-resort for equipment campaigns tied to chassis brands
  if (/entegra|newmar|tiffin|fleetwood|american|holiday/i.test(make)) {
    push("Spartan");
  }
  return out;
}

/** Model strings NHTSA accepts — strip floorplans like 39BH */
function modelVariants(model: string): string[] {
  const raw = titleCase(model);
  const out: string[] = [];
  const push = (v: string) => {
    const t = v.trim().replace(/\s+/g, " ");
    if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  };

  push(raw);
  // Drop trailing floorplan codes: 39BH, 45OPP, 44H, XL suffix keep as separate
  const noFp = raw
    .replace(/\b\d{2,3}[A-Z]{1,4}\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (noFp) push(noFp);
  // "Allegro Bus 45OPP" → "Allegro Bus"
  const words = raw.split(" ");
  if (words.length > 1) {
    // drop last token if it looks like a floorplan
    const last = words[words.length - 1] ?? "";
    if (/^\d/.test(last) || /^[A-Z0-9]{2,6}$/i.test(last)) {
      push(words.slice(0, -1).join(" "));
    }
  }
  // First significant word (Reatta, Vision, Dutch)
  if (words[0]) push(words[0]);
  // Dual-word core (Allegro Bus, Dutch Star)
  if (words.length >= 2) push(`${words[0]} ${words[1]}`);
  // Uppercase form some DB rows use
  push(raw.toUpperCase());
  return out;
}

function extractList(json: Record<string, unknown>): Record<string, unknown>[] {
  const list = (json.results ?? json.Results ?? []) as unknown;
  return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
}

function isEmptySuccess(resp: Response, json: Record<string, unknown>): boolean {
  const list = extractList(json);
  if (list.length > 0) return false;
  const msg = String(json.Message || json.message || "").toLowerCase();
  if (msg.includes("results returned successfully")) return true;
  if (msg.includes("no results")) return true;
  if (resp.status === 400 || resp.status === 404) return true;
  const count = json.Count ?? json.count;
  if (count === 0) return true;
  return false;
}

function mapRecall(
  item: Record<string, unknown>,
  fallbackMake: string,
): NhtsaRecall {
  return {
    campaignNumber: String(
      item.NHTSACampaignNumber || item.CampaignNumber || "",
    ),
    component: String(item.Component || item.component || "EQUIPMENT"),
    summary: String(item.Summary || item.summary || "").trim(),
    consequence: String(item.Consequence || item.consequence || "").trim(),
    remedy: String(item.Remedy || item.remedy || "").trim(),
    reportDate: String(
      item.ReportReceivedDate || item.ReportDate || item.date || "",
    ),
    manufacturer: String(
      item.Manufacturer || item.manufacturer || fallbackMake,
    ),
  };
}

function mapComplaint(item: Record<string, unknown>): NhtsaComplaint {
  const crash = item.crash;
  const fire = item.fire;
  return {
    component: String(item.components || item.Component || item.component || ""),
    summary: String(
      item.summary || item.cdescr || item.Summary || "",
    ).trim(),
    date: String(
      item.dateComplaintFiled ||
        item.dateOfIncident ||
        item.datea ||
        item.date ||
        "",
    ),
    crashFlag:
      crash === true || crash === "Yes" || crash === "Y" || crash === 1,
    fireFlag: fire === true || fire === "Yes" || fire === "Y" || fire === 1,
    odiNumber: item.odiNumber != null ? String(item.odiNumber) : undefined,
  };
}

async function fetchJson(
  url: string,
): Promise<{ resp: Response; json: Record<string, unknown> }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  try {
    const resp = await fetch(url, {
      headers: nhtsaHeaders(),
      signal: ctrl.signal,
    });
    const text = await resp.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      json = {};
    }
    return { resp, json };
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve official NHTSA vehicleModel strings for make+year */
async function resolveOfficialModels(
  year: string,
  make: string,
  modelHint: string,
): Promise<string[]> {
  const makes = makeVariants(make).slice(0, 4);
  const hint = modelHint.toLowerCase();
  const matched: string[] = [];
  for (const mk of makes) {
    if (mk.toLowerCase() === "spartan") continue; // chassis, not RV product list
    try {
      const url = `${MODELS_URL}?modelYear=${encodeURIComponent(year)}&make=${encodeURIComponent(mk)}`;
      const { resp, json } = await fetchJson(url);
      if (!resp.ok) continue;
      const list = extractList(json);
      for (const row of list) {
        const vm = String(
          row.vehicleModel || row.Model || row.model || "",
        ).trim();
        if (!vm) continue;
        const vml = vm.toLowerCase();
        if (
          hint.includes(vml) ||
          vml.includes(hint.split(" ")[0] || "") ||
          hint.split(" ").some((w) => w.length > 3 && vml.includes(w))
        ) {
          if (!matched.some((m) => m.toLowerCase() === vml)) matched.push(vm);
        }
      }
      if (matched.length) break;
    } catch {
      /* */
    }
  }
  return matched;
}

async function queryPair(
  year: string,
  make: string,
  model: string,
): Promise<{
  recalls: NhtsaRecall[];
  defects: NhtsaComplaint[];
  ok: boolean;
}> {
  const yearEnc = encodeURIComponent(year);
  const makeEnc = encodeURIComponent(make);
  const modelEnc = encodeURIComponent(model);
  const recallUrl = `${RECALLS_URL}?make=${makeEnc}&model=${modelEnc}&modelYear=${yearEnc}`;
  const complaintUrl = `${COMPLAINTS_URL}?make=${makeEnc}&model=${modelEnc}&modelYear=${yearEnc}`;

  const [recallSettled, defectSettled] = await Promise.allSettled([
    fetchJson(recallUrl),
    fetchJson(complaintUrl),
  ]);

  let recalls: NhtsaRecall[] = [];
  let defects: NhtsaComplaint[] = [];
  let ok = false;

  if (recallSettled.status === "fulfilled") {
    const { resp, json } = recallSettled.value;
    const list = extractList(json);
    if (list.length > 0) {
      recalls = list.slice(0, 80).map((r) => mapRecall(r, make));
      ok = true;
    } else if (isEmptySuccess(resp, json)) {
      ok = true; // valid empty for this pair
    }
  }

  if (defectSettled.status === "fulfilled") {
    const { resp, json } = defectSettled.value;
    const list = extractList(json);
    if (list.length > 0) {
      defects = list.slice(0, 40).map(mapComplaint);
    } else if (!isEmptySuccess(resp, json) && !resp.ok) {
      /* ignore complaint failures */
    }
  }

  return { recalls, defects, ok };
}

async function fetchNhtsaBundle(
  year: string,
  make: string,
  model: string,
): Promise<NhtsaRecallsResult> {
  const cacheKey = `v2|${year}|${make}|${model}`.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return { ...hit.data, cached: true };
  }

  const tried: string[] = [];
  const makes = makeVariants(make);
  let models = modelVariants(model);

  // Official NHTSA product names (e.g. REATTA) first when available
  try {
    const official = await resolveOfficialModels(year, make, model);
    if (official.length) {
      models = [
        ...official,
        ...models.filter(
          (m) => !official.some((o) => o.toLowerCase() === m.toLowerCase()),
        ),
      ];
    }
  } catch {
    /* */
  }

  let bestRecalls: NhtsaRecall[] = [];
  let bestDefects: NhtsaComplaint[] = [];
  let usedMake = titleCase(make);
  let usedModel = titleCase(model);
  let searchNote = "";

  // Exact-ish combinations first (all make × model variants until hits)
  outer: for (const mk of makes) {
    for (const md of models) {
      const label = `${mk} / ${md} / ${year}`;
      tried.push(label);
      try {
        const { recalls, defects, ok } = await queryPair(year, mk, md);
        if (!ok) continue;
        if (recalls.length > 0) {
          bestRecalls = recalls;
          bestDefects = defects;
          usedMake = mk;
          usedModel = md;
          searchNote = `NHTSA vehicle query: ${label} (${recalls.length} campaign${recalls.length === 1 ? "" : "s"}).`;
          break outer;
        }
        // keep empty success but keep searching broader pairs
        if (!bestDefects.length && defects.length) {
          bestDefects = defects;
          usedMake = mk;
          usedModel = md;
        }
      } catch {
        continue;
      }
    }
  }

  // Broader: parent make + core model only (already in makes list, but force Jayco etc. with short model)
  if (!bestRecalls.length) {
    const core = modelVariants(model)[0] || titleCase(model);
    for (const parent of parentMakes(make)) {
      const label = `${parent} / ${core} / ${year} (parent broaden)`;
      if (tried.includes(`${parent} / ${core} / ${year}`)) continue;
      tried.push(label);
      try {
        const { recalls, defects } = await queryPair(year, parent, core);
        if (recalls.length > 0) {
          bestRecalls = recalls;
          bestDefects = defects.length ? defects : bestDefects;
          usedMake = parent;
          usedModel = core;
          searchNote = `Broadened to parent make: ${label} (${recalls.length} campaign${recalls.length === 1 ? "" : "s"}).`;
          break;
        }
      } catch {
        /* */
      }
    }
  }

  if (!bestRecalls.length) {
    searchNote = [
      `No NHTSA campaigns matched after broader search for ${year} ${make} ${model}.`,
      `Tried: ${tried.slice(0, 12).join(" · ")}${tried.length > 12 ? "…" : ""}.`,
      "Confirm at nhtsa.gov/recalls (and Jayco/Spartan equipment campaigns if applicable).",
    ].join(" ");
  }

  // Dedupe campaigns
  const seen = new Set<string>();
  const recalls = bestRecalls.filter((r) => {
    const k = r.campaignNumber || r.summary.slice(0, 40);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const data: NhtsaRecallsResult = {
    year,
    make: usedMake,
    model: usedModel,
    recalls,
    recallCount: recalls.length,
    defects: bestDefects,
    defectCount: bestDefects.length,
    source: "nhtsa",
    fetchedAt: new Date().toISOString(),
    cached: false,
    searchNote,
    triedQueries: tried.slice(0, 20),
  };
  cache.set(cacheKey, { at: Date.now(), data });
  return data;
}

function emptyPayload(
  year: string,
  make: string,
  model: string,
  note?: string,
): NhtsaRecallsResult {
  return {
    year,
    make,
    model,
    recalls: [],
    recallCount: 0,
    defects: [],
    defectCount: 0,
    source: "nhtsa",
    fetchedAt: new Date().toISOString(),
    cached: false,
    searchNote: note,
  };
}

export const Route = createFileRoute("/api/nhtsa/recalls")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const year = (url.searchParams.get("year") || "").trim();
        const make = (url.searchParams.get("make") || "").trim();
        const model = (url.searchParams.get("model") || "").trim();

        if (!year || !make || !model) {
          return Response.json(
            { error: "make, model, and year are required" },
            { status: 400 },
          );
        }
        if (!/^\d{4}$/.test(year)) {
          return Response.json(
            { error: "year must be a 4-digit model year." },
            { status: 400 },
          );
        }

        try {
          const data = await fetchNhtsaBundle(year, make, model);
          return Response.json(
            { data },
            { headers: { "Cache-Control": "public, max-age=1800" } },
          );
        } catch (err) {
          console.error("nhtsa-lookup error:", err);
          return Response.json(
            {
              data: emptyPayload(
                year,
                make,
                model,
                "NHTSA request failed — retry or check nhtsa.gov/recalls.",
              ),
            },
            { status: 200 },
          );
        }
      },
    },
  },
});
