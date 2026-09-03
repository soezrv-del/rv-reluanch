/**
 * Catalog grounding for RvGROK chat + Live Voice.
 *
 * When the user names a year/make/model (or has a Facts report open),
 * inject verified catalog / brochure-pin fields and REQUIRE the model
 * to use those numbers. Missing fields → unknown / EST — never invent
 * HP, engine, chassis, or fuel.
 *
 * Chat answers must never be merged into the Facts verified cache.
 */

import { CATALOG_INDEX, MAKES } from "../rv/rvCatalogIndex";
import { peekCatalog } from "../rv/catalogLoad";
import { resolveYearSnapshot } from "../rv/brochureSpecs";
import {
  findPowertrainCorrection,
  type PowertrainCorrection,
} from "../rv/powertrainCorrections";
import {
  findLocalSpecOverride,
  type LocalSpecOverride,
} from "../rv/localSpecOverrides";
import type { ActiveCoach } from "../rv/activeCoach";
import {
  honestEngineLabel,
  honestHorsepowerLabel,
  honestTorqueLabel,
  isAmbiguousCatalogValue,
} from "../rv/catalogHonesty";
import { parseCoachFromText } from "./parseCoach";
import type { RVSpec } from "../rv/rvTypes";
import { needsWebFallback } from "./webIntent";

export {
  looksLikeCasualNonResearch,
  looksLikeLiveResearchQuestion,
  looksLikePureLifestyleOrPayment,
  looksLikeSpecQuestion,
  needsWebFallback,
  normalizeAskText,
} from "./webIntent";
export type { WebFallbackOpts, WebFallbackSpecs } from "./webIntent";

export type CoachIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  /** How we picked this coach */
  source: "message" | "facts" | "mixed";
};

export type GroundedField = {
  value: string | null;
  /** est = catalog named an option band (not a single locked number) */
  trust: "local" | "pin" | "catalog" | "index" | "est" | "empty";
};

export type GroundedSpecs = {
  identity: CoachIdentity;
  engine: GroundedField;
  horsepower: GroundedField;
  torque: GroundedField;
  chassis: GroundedField;
  transmission: GroundedField;
  fuelType: GroundedField;
  rvType: GroundedField;
  note: string | null;
  /** Year-band weight span from catalog — EST, not a floorplan GVWR. */
  weightBand: string | null;
  /** True when any hard powertrain field is locked (local/pin/catalog). */
  hasHardLock: boolean;
  /** True when HP / engine / chassis / fuel is still unknown or EST-only. */
  missingHard: boolean;
};

export const HARD_POWERTRAIN_FIELDS = [
  "engine",
  "horsepower",
  "chassis",
  "fuelType",
] as const;

/** Chat / thumbs-up answers are never a Facts cache source. */
export const CHAT_MAY_WRITE_FACTS_CACHE = false;

export const GROUNDING_RULES = `VERIFIED CATALOG LOCK (non-negotiable):
- The CATALOG / BROCHURE block in this request is source-of-truth for engine, horsepower, chassis, transmission, and fuel.
- If a field has a number or name, USE THAT EXACT VALUE. Do not substitute a sibling model, a later year, or a "typical" HP (never invent 450).
- If a field is marked UNKNOWN, say unknown or EST. and tell the user what to verify (door sticker / OEM brochure / build sheet). Never invent HP, engine, chassis, or fuel.
- Floorplan letters (BH, K, L, FS, …) are labels only — never decode bunks or a half-bath from the code.
- Entegra Vision = gas Ford F-53 / 7.3 Godzilla — not diesel.
- Newmar Ventana / Dutch Star of this era already have Comfort Drive, residential fridge, hydraulic auto-level, and OEM camera — do not "upgrade" those.
- Chat is not the Facts report. Do not write these answers into Facts cache.`;

export const UNKNOWN_POWERTRAIN_LINE =
  "UNKNOWN — do not invent. Say unknown / EST. and what to verify (door sticker or OEM brochure).";

const MAKE_ALIASES: Record<string, string> = {
  entegra: "Entegra Coach",
  "entegra coach": "Entegra Coach",
  "american coach": "American Coach",
  "forest river": "Forest River",
  fr: "Forest River",
  jayco: "Jayco",
  newmar: "Newmar",
  tiffin: "Tiffin",
  winnebago: "Winnebago",
  thor: "Thor",
  fleetwood: "Fleetwood",
  "holiday rambler": "Holiday Rambler",
  coachmen: "Coachmen",
  airstream: "Airstream",
  dynamax: "Dynamax",
  "grand design": "Grand Design",
};

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function field(
  value: string | number | null | undefined,
  trust: GroundedField["trust"],
): GroundedField {
  if (value == null || value === "") {
    return { value: null, trust: "empty" };
  }
  const v = String(value).trim();
  if (!v || v === "—" || /^n\/a$/i.test(v) || /^see chassis/i.test(v)) {
    return { value: null, trust: "empty" };
  }
  if (trust === "empty") return { value: null, trust: "empty" };
  return { value: v, trust };
}

function pickField(
  ...candidates: Array<{ value: string | number | null | undefined; trust: GroundedField["trust"] }>
): GroundedField {
  for (const c of candidates) {
    const f = field(c.value, c.trust);
    if (f.value) return f;
  }
  return { value: null, trust: "empty" };
}

/** Map a spoken/typed make onto a catalog make key. */
export function resolveCatalogMake(raw: string): string {
  const n = norm(raw);
  if (!n) return raw.trim();
  if (MAKE_ALIASES[n]) return MAKE_ALIASES[n]!;
  const exact = MAKES.find((m) => norm(m) === n);
  if (exact) return exact;
  const contains = MAKES.find(
    (m) => norm(m).includes(n) || n.includes(norm(m)),
  );
  return contains || raw.trim();
}

/** Best catalog model name under a make. */
export function resolveCatalogModel(make: string, rawModel: string): string {
  const n = norm(rawModel);
  if (!n) return rawModel.trim();
  const catalogMake = resolveCatalogMake(make);
  const live = peekCatalog()?.RV_DATA?.[catalogMake];
  const index = CATALOG_INDEX[catalogMake];
  const names = new Set<string>([
    ...Object.keys(live || {}),
    ...Object.keys(index || {}),
  ]);
  let best = rawModel.trim();
  let bestLen = -1;
  for (const name of names) {
    const nn = norm(name);
    if (nn === n) return name;
    if (nn.includes(n) || n.includes(nn)) {
      if (nn.length > bestLen) {
        best = name;
        bestLen = nn.length;
      }
    }
  }
  return best;
}

/**
 * Prefer an explicit year/make/model in the user's words.
 * Fall back to the open Facts selection when the question is "this coach."
 */
export function resolveCoachIdentity(
  query: string,
  facts?: ActiveCoach | null,
  extraText = "",
): CoachIdentity | null {
  const parsed = parseCoachFromText(`${query}\n${extraText}`);
  const factsOk = Boolean(
    facts?.year?.trim() && facts.make?.trim() && facts.model?.trim(),
  );

  if (parsed.year && parsed.make && parsed.model) {
    const sameFamily =
      factsOk &&
      parsed.year === facts!.year &&
      norm(resolveCatalogMake(parsed.make)) ===
        norm(resolveCatalogMake(facts!.make));
    return {
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: resolveCatalogModel(parsed.make, parsed.model),
      floorplan:
        parsed.floorplan ||
        (sameFamily ? facts!.floorplan || "" : ""),
      source: sameFamily && !parsed.floorplan && facts!.floorplan ? "mixed" : "message",
    };
  }

  if (parsed.year && parsed.make && factsOk && parsed.year === facts!.year) {
    const sameMake =
      norm(resolveCatalogMake(parsed.make)) ===
      norm(resolveCatalogMake(facts!.make));
    if (sameMake) {
      return {
        year: facts!.year,
        make: resolveCatalogMake(facts!.make),
        model: facts!.model,
        floorplan: parsed.floorplan || facts!.floorplan || "",
        source: "mixed",
      };
    }
  }

  if (factsOk) {
    return {
      year: facts!.year,
      make: resolveCatalogMake(facts!.make),
      model: facts!.model,
      floorplan: facts!.floorplan || "",
      source: "facts",
    };
  }

  if (parsed.year && parsed.make) {
    return {
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: parsed.model,
      floorplan: parsed.floorplan,
      source: "message",
    };
  }

  return null;
}

function specFor(make: string, model: string): RVSpec | null {
  const catalogMake = resolveCatalogMake(make);
  const catalogModel = resolveCatalogModel(catalogMake, model);
  return peekCatalog()?.RV_DATA?.[catalogMake]?.[catalogModel] ?? null;
}

export function lookupGroundedSpecs(identity: CoachIdentity): GroundedSpecs {
  const { year, make, model, floorplan } = identity;
  const local: LocalSpecOverride | null = findLocalSpecOverride(
    year,
    make,
    model,
    floorplan,
  );
  const pin: PowertrainCorrection | null = findPowertrainCorrection(
    year,
    make,
    model,
    floorplan,
  );
  const spec = specFor(make, model);
  const snap = spec ? resolveYearSnapshot(spec, year, floorplan) : null;
  const index =
    CATALOG_INDEX[resolveCatalogMake(make)]?.[
      resolveCatalogModel(make, model)
    ] ?? null;

  const rawEngine =
    local?.engine ||
    pin?.engine ||
    snap?.engine ||
    spec?.engine ||
    null;
  const engineLabel = honestEngineLabel(rawEngine);
  const hpLabel = local?.horsepower
    ? `${Math.round(local.horsepower)} HP`
    : honestHorsepowerLabel({
        engine: rawEngine,
        horsepower:
          pin && pin.horsepower > 0
            ? pin.horsepower
            : snap?.horsepower ?? spec?.horsepower ?? null,
      });
  const engineAmbiguous = isAmbiguousCatalogValue(rawEngine);

  const engine = pickField(
    { value: local?.engine, trust: "local" },
    {
      value: engineLabel.text,
      trust: engineLabel.locked
        ? pin?.engine
          ? "pin"
          : "catalog"
        : engineLabel.text
          ? "est"
          : "empty",
    },
  );
  // Option-band HP (Dream L9/X15) is EST, not a locked single number.
  const horsepower = local?.horsepower
    ? field(`${Math.round(local.horsepower)} HP`, "local")
    : engineAmbiguous || (hpLabel && /varies|opt|EST/i.test(hpLabel))
      ? field(hpLabel, "est")
      : pickField(
          {
            value: pin && pin.horsepower > 0 ? hpLabel : null,
            trust: "pin",
          },
          {
            value:
              snap?.horsepower != null && snap.horsepower > 0 ? hpLabel : null,
            trust: snap?.yearTruePowertrain ? "catalog" : "empty",
          },
        );
  const tqLabel = local?.torqueLbFt
    ? `${local.torqueLbFt} lb-ft`
    : honestTorqueLabel({
        engine: rawEngine,
        torqueLbFt:
          pin?.torqueLbFt != null && pin.torqueLbFt > 0
            ? pin.torqueLbFt
            : snap?.torqueLbFt ?? spec?.torqueLbFt ?? null,
      });
  const torque = local?.torqueLbFt
    ? field(`${local.torqueLbFt} lb-ft`, "local")
    : engineAmbiguous ||
        (tqLabel && /std|opt|varies|EST|confirm/i.test(tqLabel))
      ? field(tqLabel, "est")
      : pickField(
          {
            value:
              pin?.torqueLbFt != null && pin.torqueLbFt > 0 ? tqLabel : null,
            trust: "pin",
          },
          {
            value:
              snap?.torqueLbFt != null && snap.torqueLbFt > 0 ? tqLabel : null,
            trust: "catalog",
          },
        );
  const chassis = pickField(
    { value: local?.chassis, trust: "local" },
    { value: pin?.chassis, trust: "pin" },
    { value: snap?.chassis, trust: "catalog" },
    { value: spec?.chassis, trust: "catalog" },
  );
  const transmission = pickField(
    { value: local?.transmission, trust: "local" },
    { value: pin?.transmission, trust: "pin" },
    { value: snap?.transmission, trust: "catalog" },
    { value: spec?.transmission, trust: "catalog" },
  );
  const fuelType = pickField(
    { value: local?.fuelType, trust: "local" },
    { value: pin?.fuelType, trust: "pin" },
    { value: spec?.fuelType, trust: "catalog" },
    { value: index?.fuelType, trust: "index" },
  );
  const rvType = pickField(
    { value: spec?.type, trust: "catalog" },
    { value: index?.type, trust: "index" },
  );

  const note = local?.note || pin?.note || snap?.notes || null;
  const weightBand =
    spec?.weightRange && spec.weightRange.length === 2
      ? `${spec.weightRange[0].toLocaleString()}–${spec.weightRange[1].toLocaleString()} lbs EST (year-band, not a floorplan GVWR)`
      : null;

  const hardTrusts = [engine, horsepower, chassis, fuelType].map((f) => f.trust);
  const hasHardLock = hardTrusts.some(
    (t) => t === "local" || t === "pin" || t === "catalog",
  );
  const missingHard = [engine, horsepower, chassis, fuelType].some(
    (f) => !f.value || f.trust === "est",
  );

  return {
    identity,
    engine,
    horsepower,
    torque,
    chassis,
    transmission,
    fuelType,
    rvType,
    note,
    weightBand,
    hasHardLock,
    missingHard,
  };
}

function line(label: string, f: GroundedField): string {
  if (!f.value) return `- ${label}: ${UNKNOWN_POWERTRAIN_LINE}`;
  if (f.trust === "est") {
    return `- ${label}: ${f.value}  [EST — not a single locked number]`;
  }
  return `- ${label}: ${f.value}  [${f.trust}]`;
}

/** Block injected into chat / voice instructions. */
export function formatCatalogGroundingBlock(specs: GroundedSpecs): string {
  const id = specs.identity;
  const coach = [id.year, id.make, id.model, id.floorplan]
    .filter(Boolean)
    .join(" ");
  return [
    `VERIFIED CATALOG / BROCHURE for ${coach} (source: ${id.source}):`,
    line("engine", specs.engine),
    line("horsepower", specs.horsepower),
    line("torque", specs.torque),
    line("chassis", specs.chassis),
    line("transmission", specs.transmission),
    line("fuel", specs.fuelType),
    line("class / type", specs.rvType),
    specs.note ? `- note: ${specs.note}` : null,
    specs.weightBand ? `- weights: ${specs.weightBand}` : null,
    "Use the locked numbers above. If a line is UNKNOWN, say unknown / EST. — never invent HP, engine, chassis, or fuel.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatVoiceCatalogAddendum(specs: GroundedSpecs): string {
  return `\n\n${formatCatalogGroundingBlock(specs)}\nSpeak those locked numbers. If UNKNOWN, say so in one breath — do not guess.`;
}

export function buildChatGrounding(opts: {
  query: string;
  facts?: ActiveCoach | null;
  extraText?: string;
  agentMode?: boolean;
}): {
  identity: CoachIdentity | null;
  specs: GroundedSpecs | null;
  block: string;
  needsWeb: boolean;
} {
  const webOpts = { agentMode: opts.agentMode };
  const identity = resolveCoachIdentity(
    opts.query,
    opts.facts,
    opts.extraText || "",
  );
  if (!identity) {
    return {
      identity: null,
      specs: null,
      block: "",
      needsWeb: needsWebFallback(null, opts.query, webOpts),
    };
  }
  const specs = lookupGroundedSpecs(identity);
  return {
    identity,
    specs,
    block: `${formatCatalogGroundingBlock(specs)}\n\n${GROUNDING_RULES}`,
    needsWeb: needsWebFallback(specs, opts.query, webOpts),
  };
}

/** Voice: shorter lock text. Prefer catalog when present; never fabricate. */
export function buildVoiceGrounding(opts: {
  query?: string;
  facts?: ActiveCoach | null;
}): string {
  const identity = resolveCoachIdentity(
    opts.query || "",
    opts.facts,
    "",
  );
  if (!identity) {
    return "No verified catalog row is loaded. If they name a year/make/model and you do not have locked numbers, say unknown / EST. — never invent HP, engine, chassis, or fuel.";
  }
  const specs = lookupGroundedSpecs(identity);
  return formatVoiceCatalogAddendum(specs);
}

export function appendGrounding(system: string, catalogContext?: string): string {
  const t = (catalogContext || "").trim();
  if (!t) return system;
  return `${system}\n\n═══════════════════════════════════════\nVERIFIED CATALOG (ground truth)\n═══════════════════════════════════════\n${t}`;
}
