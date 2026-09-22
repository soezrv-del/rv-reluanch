/**
 * Catalog grounding for RvGROK chat + Live Voice.
 *
 * When the user names a year/make/model (or has a Facts report open),
 * inject verified catalog / brochure-pin fields and REQUIRE the model
 * to use those numbers. Missing fields → WEB RESEARCH, then a labeled
 * EST / typical class range — never silent-invent as an OEM pin.
 *
 * Chat answers must never be merged into the Facts verified cache.
 */

import { CATALOG_INDEX } from "../rv/rvCatalogIndex.ts";
import { peekCatalog } from "../rv/catalogLoad.ts";
import { resolveYearSnapshot } from "../rv/brochureSpecs.ts";
import {
  findPowertrainCorrection,
  type PowertrainCorrection,
} from "../rv/powertrainCorrections.ts";
import {
  findLocalSpecOverride,
  type LocalSpecOverride,
} from "../rv/localSpecOverrides.ts";
import type { ActiveCoach } from "../rv/activeCoach.ts";
import {
  engineOmitsLoneTorque,
  extractOptionHpClasses,
  honestEngineLabel,
  honestHorsepowerLabel,
  honestTorqueLabel,
  isAmbiguousCatalogValue,
} from "../rv/catalogHonesty.ts";
import { catalogYearIsListed, parseCoachFromText } from "./parseCoach.ts";
import type { RVSpec } from "../rv/rvTypes.ts";
import {
  formatCarfaxGroundingBlock,
  looksLikeCarfaxQuestion,
} from "./carfaxPositioning.ts";
import {
  formatOriginGroundingBlock,
  looksLikeOriginQuestion,
} from "./originStory.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeInventoryOrCountQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeSpecQuestion,
  needsWebFallback,
} from "./webIntent.ts";
import {
  findComparableCatalogCoaches,
  looksLikeCoachCompareQuestion,
  type ComparableCatalogCoach,
} from "./coachCompare.ts";
import {
  formatRepairGroundingBlock,
  looksLikeRepairQuestion,
  repairCoachLockFromGrounded,
} from "./repairMode.ts";
import {
  askNamesCoachIdentity,
  type CoachIdentity,
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  resolveCatalogMake,
  resolveCatalogModel,
  resolveCoachIdentity,
} from "./coachIdentity.ts";
import {
  formatLockedWeightsBlock,
  resolveLockedOemWeights,
} from "./lockedWeights.ts";

function withDeskSheetSpeechRule(
  block: string,
  query: string,
  identity: CoachIdentity | null | undefined,
): string {
  const extra =
    identity && shouldMountDeskSheetLocal(query, identity)
      ? `DESK SPEC SHEET MOUNTED for ${[identity.year, identity.make, identity.model, identity.floorplan].filter(Boolean).join(" ")}. You may say exactly: "Spec sheet is on the desk." Speak THIS coach — never a prior series. Incomplete fields show as GAP on the sheet — do not write EST onto the desk or re-GAP a Facts number. Conversational answers may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. If a field is non-GAP on the sheet or VERIFIED in LOCKED WEIGHTS, speak that number — never claim you lack it.\n\n${formatLockedWeightsBlock(identity)}\n\nWRITTEN SPEC SHEET: the structured CARFAX-style desk sheet already mounted is the written reply. Do not dump a prose spec report in chat. Do not output a second markdown Spec Sheet, Weight ratings table, or GVWR/GCWR/UVW/NCC: GAP block that re-GAPs a VERIFIED field.`
      : `DESK SPEC SHEET NOT MOUNTED. Never say the spec sheet / report is on the desk, or that a sheet is visible. Speak the answer only.`;
  const body = (block || "").trim();
  return body ? `${body}\n\n${extra}` : extra;
}

function queryNamesYearMakeModel(query: string): boolean {
  const parsed = parseCoachFromText(query || "");
  return Boolean(
    parsed.year?.trim() && parsed.make?.trim() && parsed.model?.trim(),
  );
}

function shouldMountDeskSheetLocal(
  query: string,
  identity: CoachIdentity,
): boolean {
  const q = query || "";
  // Naming year + make + model (optional floorplan) always opens the CARFAX desk.
  if (queryNamesYearMakeModel(q)) return true;
  if (!identity.make?.trim() || !identity.model?.trim()) return false;
  if (looksLikeCasualNonResearch(q) && !askNamesCoachIdentity(identity)) {
    return false;
  }
  if (askNamesCoachIdentity(identity)) return true;
  if (looksLikeSpecQuestion(q) || looksLikeNamedCoachProductQuestion(q)) {
    return true;
  }
  if (/\blook(?:ing)?\s+up\b|\breport\b|\bspec(?:s| sheet)?\b/i.test(q)) {
    return true;
  }
  return identity.source === "facts" && Boolean(q.trim());
}

export {
  looksLikeCasualNonResearch,
  looksLikeImageOnlyAsk,
  looksLikeInventoryOrCountQuestion,
  looksLikeLiveResearchQuestion,
  looksLikeMarketValueQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeOffCatalogQuestion,
  looksLikePureLifestyleOrPayment,
  looksLikeRepairQuestion,
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeSpecQuestion,
  catalogGapNeedsWeb,
  needsWebFallback,
  normalizeAskText,
} from "./webIntent.ts";
export { looksLikeCoachCompareQuestion } from "./parseCoach.ts";
export {
  looksLikeCarfaxQuestion,
  formatCarfaxGroundingBlock,
} from "./carfaxPositioning.ts";
export {
  looksLikeOriginQuestion,
  formatOriginGroundingBlock,
} from "./originStory.ts";
export {
  findComparableCatalogCoaches,
  looksLikeForumOrManualCompare,
} from "./coachCompare.ts";
export type { WebFallbackOpts, WebFallbackSpecs } from "./webIntent.ts";
export type { CoachIdentity } from "./coachIdentity.ts";
export {
  askNamesCoachIdentity,
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  namedCoachConflictsLock,
  resolveCatalogMake,
  resolveCatalogModel,
  resolveCoachIdentity,
  yearFromSameSeriesHistory,
} from "./coachIdentity.ts";

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
  /** Floorplan OEM GVWR pin only — never a catalog year-band span. */
  weightBand: string | null;
  /** Published Facts / OEM GVWR. Null = desk GAP; conversation may labeled-EST. */
  oemGvwrLbs: number | null;
  /** Published Facts / OEM UVW. Null = desk GAP; conversation may labeled-EST. */
  oemUvwLbs: number | null;
  /** True when any hard powertrain field is locked (local/pin/catalog). */
  hasHardLock: boolean;
  /** True when HP / engine / chassis / fuel is still unknown or EST-only. */
  missingHard: boolean;
  /** True when GVWR or UVW has no Facts / OEM published number. */
  missingOemWeightPin: boolean;
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
- The CATALOG / BROCHURE block in this request is THIS turn's lock. If the user named a different year / make / model / floorplan, this block is that coach — never keep narrating a prior session coach as still locked.
- Series change clears the prior lock. Dutch Star is not Ventana because both use 4369. Prefer exact year + make + model + floorplan. If a field is missing, say which field (year vs series) — never substitute a sibling series.
- DEFAULT COACH REPORT: year / make / model / floorplan, specs, power, payload, spoken rundown, and desk sheet ground on this CATALOG / BROCHURE lock ONLY (the big motorhome catalog toward 2000+). If the coach exists here — e.g. 2022 Newmar Dutch Star 4369 — report THAT coach. Do not use RV Country own-lot as grounding. Never say "not in listings" because the lot has no unit or only a sibling series (Ventana 4369 ≠ Dutch Star 4369). Own-lot is only for an explicit "do we have / on the lot" ask, and even then never substitute a different series.
- The CATALOG / BROCHURE block in this request is source-of-truth for engine, horsepower, chassis, transmission, and fuel.
- LOCKED WEIGHTS / VERIFIED GVWR (OEM pin / Facts brochure) is source-of-truth for that floorplan's GVWR. Speak the number. Never say you don't have GVWR, never GAP a VERIFIED field. Desk / SPEC REPORT stays on the Facts snapshot — do not write EST onto the desk. If UVW (or another field) is GAP, conversational answers may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin.
- If a field has a number or name, USE THAT EXACT VALUE. Do not substitute a sibling model, a later year, or a silent typical HP (never invent 450 as fact).
- If a field is marked UNKNOWN, you MUST use WEB RESEARCH notes this turn, then YOU answer with a labeled EST if still unpinned. Never send them to a brochure, door sticker, dealer, or website. Never say "check the website", "look it up yourself", or "go check the OEM site".
- Do not invent a "no catalog data — check the OEM site" dead-end. If this block names locked numbers, the coach IS in the catalog — never say it is missing, not in catalogs, or to wait for a brochure. Answer from locked numbers and/or WEB RESEARCH notes. Never invent HP, engine, chassis, or fuel. Never send the user to the OEM site, a website, or a dealer as the answer.
- Inventory / in-stock / "do we have" / "look in my inventory" asks: OWN-LOT INVENTORY is source-of-truth this turn even when this catalog block is a GAP. If that block matched units, list counts and Matching units (year/make/model/trim/stock/price/location). If Matched is 0, say none of that coach is on our lot snapshot — briefly. Never say catalog gap. Never say check your own lot listing. Never ask them to share a year for inventory. Do not send them to the manufacturer because the brochure row is missing. Never substitute a sibling series (Dutch Star 4369 ≠ Ventana 4369). Never say a catalog-known coach is not in listings.
- WEB RESEARCH notes must not override a locked catalog row or invent a fifth-wheel / towable class when this block names a motorized class.
- Floorplan letters (BH, K, L, FS, …) are labels only — never decode bunks or a half-bath from the code.
- Entegra Vision = gas Ford F-53 / 7.3 Godzilla — not diesel.
- Newmar Ventana / Dutch Star of this era already have Comfort Drive, residential fridge, hydraulic auto-level, and OEM camera — do not "upgrade" those.
- Chat is not the Facts report. Do not write these answers into Facts cache.`;

export const UNKNOWN_POWERTRAIN_LINE =
  "UNKNOWN / CATALOG GAP — WEB RESEARCH is required this turn, then YOU answer with a labeled EST / typical class range if still unpinned. Never present that number as an OEM pin. Do not stop at I don't know. Never send the user to a brochure, door sticker, dealer, or the OEM site as the answer.";

/** Inventory / in-stock ask — own-lot wins even when the brochure row is a GAP. */
export const INVENTORY_WINS_OVER_GAP =
  "INVENTORY / IN-STOCK ASK — answer from the OWN-LOT INVENTORY block this turn (counts + Matching units). Catalog GAP does not apply. If that block matched units, list year/make/model/trim/stock/price/location. If Matched is 0, say none of that coach is on our lot snapshot — briefly. Never say catalog gap. Never say check your own lot listing. Never ask them to share a year for inventory. Do not send them to the manufacturer for inventory. Never substitute a sibling series (Dutch Star 4369 ≠ Ventana 4369). Never say a catalog-known coach is not in listings.";

/** @deprecated use INVENTORY_WINS_OVER_GAP — kept so older tests/imports resolve. */
export const INVENTORY_CATALOG_GAP = INVENTORY_WINS_OVER_GAP;

function isInventoryStockAsk(query: string): boolean {
  return looksLikeInventoryOrCountQuestion(query);
}

export const COMPARE_GROUNDING_RULES = `COMPARE THIS TURN (catalog-answerable):
- Answer both coaches from the VERIFIED CATALOG locks below in THIS turn.
- Lead with class and powertrain. Answer now — no stall, no "give me one second," no "Let me check that."
- Do not silent-invent HP, engine, chassis, or fuel as OEM fact. UNKNOWN / CATALOG GAP: WEB RESEARCH this turn, then a labeled EST / typical class range.
- NEVER send the user to a website, OEM site, or dealer as the answer.`;

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

  // Empty year row: do not leak another year's top-level engine/HP as locked.
  const hasYearRow = Boolean(
    local ||
      pin ||
      snap?.yearTruePowertrain ||
      catalogYearIsListed(year, index?.years),
  );
  const oemWeights = resolveLockedOemWeights(identity);
  const weightBand =
    oemWeights.gvwrLbs && oemWeights.gvwrLbs > 0
      ? `${oemWeights.gvwrLbs.toLocaleString("en-US")} lbs GVWR`
      : null;

  if (!hasYearRow) {
    const empty = field(null, "empty");
    const noYear = !year;
    return {
      identity,
      engine: empty,
      horsepower: empty,
      torque: empty,
      chassis: empty,
      transmission: empty,
      fuelType: noYear
        ? pickField({ value: index?.fuelType, trust: "index" })
        : empty,
      rvType: pickField({ value: index?.type, trust: "index" }),
      note: (() => {
        const presence = formatCatalogPresenceNote(
          inspectCatalogPresence(identity),
        );
        if (presence) return presence;
        return noYear
          ? "No model year in the ask — class and fuel are from the catalog index. Do not invent HP, engine, chassis, or a year as OEM fact. After WEB RESEARCH, a labeled EST is allowed. Never send the user to the OEM site, a website, or a dealer as the answer."
          : "CATALOG GAP — no locked row for this model year. WEB RESEARCH is required this turn, then answer with a labeled EST / typical class range if still unpinned. Never present that as an OEM pin. Do not stop at I don't know. Never send the user to the OEM site, a website, or a dealer as the answer.";
      })(),
      weightBand,
      oemGvwrLbs: oemWeights.gvwrLbs,
      oemUvwLbs: oemWeights.uvwLbs,
      hasHardLock: false,
      missingHard: true,
      missingOemWeightPin:
        oemWeights.gvwrLbs == null || oemWeights.uvwLbs == null,
    };
  }

  const rawEngine =
    local?.engine ||
    pin?.engine ||
    snap?.engine ||
    spec?.engine ||
    null;
  const engineLabel = honestEngineLabel(rawEngine);
  const sotHp =
    pin && pin.horsepower > 0
      ? pin.horsepower
      : snap?.horsepower ?? spec?.horsepower ?? null;
  const hpLabel = local?.horsepower
    ? `${Math.round(local.horsepower)} HP`
    : honestHorsepowerLabel({
        engine: rawEngine,
        horsepower: sotHp,
      });
  const dualRating = extractOptionHpClasses(rawEngine).length >= 2;
  const engineAmbiguous = dualRating || isAmbiguousCatalogValue(rawEngine);

  const engine = pickField(
    { value: local?.engine, trust: "local" },
    {
      value: engineLabel.text,
      trust: engineLabel.locked
        ? pin?.engine
          ? "pin"
          : "catalog"
        : engineAmbiguous || engineLabel.text
          ? "est"
          : "empty",
    },
  );
  // Dual-rating engines (Dream L9/X15) are EST. A catalog number on a
  // "by year" engine label is still catalog SoT — do not demote it.
  const horsepower = local?.horsepower
    ? field(`${Math.round(local.horsepower)} HP`, "local")
    : dualRating || (hpLabel && /varies|opt|EST/i.test(hpLabel))
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
    : engineOmitsLoneTorque(rawEngine) ||
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

  const note = local?.note || pin?.note || (snap?.yearTruePowertrain ? snap?.notes : null) || null;

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
    oemGvwrLbs: oemWeights.gvwrLbs,
    oemUvwLbs: oemWeights.uvwLbs,
    hasHardLock,
    missingHard,
    missingOemWeightPin:
      oemWeights.gvwrLbs == null || oemWeights.uvwLbs == null,
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
export function formatCatalogGroundingBlock(
  specs: GroundedSpecs,
  opts?: { inventoryAsk?: boolean },
): string {
  const id = specs.identity;
  const coach = [id.year, id.make, id.model, id.floorplan]
    .filter(Boolean)
    .join(" ");
  const inventoryAsk = Boolean(opts?.inventoryAsk);
  const presenceNote = formatCatalogPresenceNote(
    inspectCatalogPresence(id),
  );
  const lockLine = presenceNote
    ? presenceNote
    : specs.hasHardLock
      ? "This coach IS in the verified catalog. Use the locked numbers above. Do not say it is missing, not in catalogs, or to wait for a brochure. If a line is UNKNOWN / CATALOG GAP, WEB RESEARCH is required this turn — then a labeled EST / typical class range if still unpinned. Never present that as an OEM pin. Never stop at I don't know."
      : "CATALOG GAP — no locked numbers for this identity. WEB RESEARCH is required this turn, then answer with a labeled EST / typical class range if still unpinned. Never present that as an OEM pin. Do not stop at I don't know. Never send the user to the OEM site, a website, or a dealer as the answer.";
  return [
    `VERIFIED CATALOG / BROCHURE for ${coach} (source: ${id.source}):`,
    line("engine", specs.engine),
    line("horsepower", specs.horsepower),
    line("torque", specs.torque),
    line("chassis", specs.chassis),
    line("transmission", specs.transmission),
    line("fuel", specs.fuelType),
    line("class / type", specs.rvType),
    inventoryAsk ? null : presenceNote ? `- note: ${presenceNote}` : specs.note ? `- note: ${specs.note}` : null,
    specs.weightBand ? `- weights: ${specs.weightBand}` : null,
    formatLockedWeightsBlock(id),
    inventoryAsk ? INVENTORY_WINS_OVER_GAP : lockLine,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatVoiceCatalogAddendum(
  specs: GroundedSpecs,
  opts?: { inventoryAsk?: boolean },
): string {
  const inventoryAsk = Boolean(opts?.inventoryAsk);
  const speak = inventoryAsk
    ? "If an OWN-LOT INVENTORY block matched units, speak those units. Do not say catalog gap or check your own lot listing. Never substitute a sibling series. Never say a catalog-known coach is not in listings."
    : "Speak those locked numbers and every VERIFIED LOCKED WEIGHTS field. If a field is UNKNOWN / CATALOG GAP and not VERIFIED, use WEB RESEARCH notes then speak a labeled EST / typical class range — never as an OEM pin. Never say you don't have a VERIFIED GVWR.";
  return `\n\n${formatCatalogGroundingBlock(specs, { inventoryAsk })}\n${speak}`;
}

function identityFromCompareHit(hit: ComparableCatalogCoach): CoachIdentity {
  return {
    year: hit.year,
    make: hit.make,
    model: hit.model,
    floorplan: hit.floorplan,
    source: "message",
  };
}

function compareCatalogBlock(hits: ComparableCatalogCoach[]): {
  identity: CoachIdentity;
  specs: GroundedSpecs;
  catalog: string;
} | null {
  if (hits.length < 2) return null;
  const specsList = hits.slice(0, 3).map((hit) =>
    lookupGroundedSpecs(identityFromCompareHit(hit)),
  );
  const primary = specsList[0];
  if (!primary) return null;
  const catalog = [
    COMPARE_GROUNDING_RULES,
    ...specsList.map((specs) => formatCatalogGroundingBlock(specs)),
    GROUNDING_RULES,
  ].join("\n\n");
  return { identity: primary.identity, specs: primary, catalog };
}

function standingKnowledgeBlocks(query: string): string {
  const parts: string[] = [];
  if (looksLikeOriginQuestion(query)) parts.push(formatOriginGroundingBlock());
  if (looksLikeCarfaxQuestion(query)) parts.push(formatCarfaxGroundingBlock());
  return parts.join("\n\n");
}

function withOriginBlock(
  query: string,
  block: string,
  needsWeb: boolean,
): { block: string; needsWeb: boolean } {
  const standing = standingKnowledgeBlocks(query);
  if (!standing) return { block, needsWeb };
  return {
    block: block ? `${standing}\n\n${block}` : standing,
    needsWeb: false,
  };
}

function repairBlockFor(
  query: string,
  identity: CoachIdentity | null,
  specs: GroundedSpecs | null,
  voice = false,
  facts?: ActiveCoach | null,
): string {
  const active = looksLikeRepairQuestion(query);
  if (!active && !voice) return "";
  return formatRepairGroundingBlock({
    lock: repairCoachLockFromGrounded({ identity, specs, facts }),
    active,
    voice,
  });
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
  repairMode: boolean;
} {
  const webOpts = { agentMode: opts.agentMode };
  const repairMode = looksLikeRepairQuestion(opts.query);
  const compareHits = looksLikeCoachCompareQuestion(opts.query)
    ? findComparableCatalogCoaches(opts.query)
    : [];
  const compare = compareCatalogBlock(compareHits);
  if (compare) {
    const repair = repairBlockFor(
      opts.query,
      compare.identity,
      compare.specs,
      false,
      opts.facts,
    );
    const merged = withOriginBlock(
      opts.query,
      repair ? `${compare.catalog}\n\n${repair}` : compare.catalog,
      needsWebFallback(compare.specs, opts.query, webOpts),
    );
    return {
      identity: compare.identity,
      specs: compare.specs,
      block: withDeskSheetSpeechRule(
        merged.block,
        opts.query,
        compare.identity,
      ),
      needsWeb: merged.needsWeb,
      repairMode,
    };
  }
  const identity = resolveCoachIdentity(
    opts.query,
    opts.facts,
    opts.extraText || "",
  );
  const inventoryAsk = isInventoryStockAsk(opts.query);
  if (!identity) {
    const repair = repairBlockFor(opts.query, null, null, false, opts.facts);
    const inventoryGap = inventoryAsk ? INVENTORY_WINS_OVER_GAP : "";
    const body = [inventoryGap, repair].filter(Boolean).join("\n\n");
    const merged = withOriginBlock(
      opts.query,
      body,
      needsWebFallback(null, opts.query, webOpts),
    );
    return {
      identity: null,
      specs: null,
      block: withDeskSheetSpeechRule(merged.block, opts.query, null),
      needsWeb: merged.needsWeb,
      repairMode,
    };
  }
  const specs = lookupGroundedSpecs(identity);
  const catalog = `${formatCatalogGroundingBlock(specs, { inventoryAsk })}\n\n${GROUNDING_RULES}`;
  const repair = repairBlockFor(opts.query, identity, specs, false, opts.facts);
  const merged = withOriginBlock(
    opts.query,
    repair ? `${catalog}\n\n${repair}` : catalog,
    needsWebFallback(specs, opts.query, webOpts),
  );
  return {
    identity,
    specs,
    block: withDeskSheetSpeechRule(merged.block, opts.query, identity),
    needsWeb: merged.needsWeb,
    repairMode,
  };
}

/** Voice: shorter lock text. Prefer catalog when present; never fabricate. */
export function buildVoiceGrounding(opts: {
  query?: string;
  facts?: ActiveCoach | null;
}): string {
  const query = opts.query || "";
  const compareHits = looksLikeCoachCompareQuestion(query)
    ? findComparableCatalogCoaches(query)
    : [];
  const compare = compareCatalogBlock(compareHits);
  if (compare) {
    const repair = repairBlockFor(
      query,
      compare.identity,
      compare.specs,
      true,
      opts.facts,
    );
    const body = `${compare.catalog}\nSpeak those locked numbers and every VERIFIED LOCKED WEIGHTS field. If a field is UNKNOWN / CATALOG GAP and not VERIFIED, use WEB RESEARCH notes then speak a labeled EST / typical class range — never as an OEM pin. Never say you don't have a VERIFIED GVWR.\n\n${repair}`;
    const standing = standingKnowledgeBlocks(query);
    const merged = standing ? `${standing}\n\n${body}` : body;
    return withDeskSheetSpeechRule(merged, query, compare.identity);
  }
  const identity = resolveCoachIdentity(query, opts.facts, "");
  const specs = identity ? lookupGroundedSpecs(identity) : null;
  const repair = repairBlockFor(query, identity, specs, true, opts.facts);
  const standing = standingKnowledgeBlocks(query);
  const inventoryAsk = isInventoryStockAsk(query);
  if (standing) {
    return repair ? `${standing}\n\n${repair}` : standing;
  }
  if (!identity) {
    const base = inventoryAsk
      ? INVENTORY_WINS_OVER_GAP
      : "CATALOG GAP — no verified row is loaded. WEB RESEARCH is required this turn, then answer with a labeled EST / typical class range if still unpinned. Never present that as an OEM pin. Do not stop at I don't know.";
    const body = repair ? `${base}\n\n${repair}` : base;
    return withDeskSheetSpeechRule(body, query, null);
  }
  return withDeskSheetSpeechRule(
    `${formatVoiceCatalogAddendum(specs!, { inventoryAsk })}\n\n${repair}`,
    query,
    identity,
  );
}

export function appendGrounding(system: string, catalogContext?: string): string {
  const t = (catalogContext || "").trim();
  if (!t) return system;
  return `${system}\n\n═══════════════════════════════════════\nVERIFIED CATALOG (ground truth)\n═══════════════════════════════════════\n${t}`;
}
