/**
 * Live Voice / chat desk spec sheet — CarFax-style card for the locked coach.
 *
 * Speech may say the sheet is on the desk only when we actually mount it.
 * When the live catalog is loaded, paint the same `buildBrochureSpecs`
 * snapshot Facts (RvFAX) shows — not a stricter pin-only GAP path.
 */

import { CONFIRM_BROCHURE, type BrochureSpecs } from "../rv/brochureSpecs.ts";
import {
  findOemFloorplanSpec,
  findOemGvwrLbs,
  findOemHoldingTanks,
  findOemUvwLbs,
} from "../rv/floorplanSpecs.ts";
import { isTowableForTorqueRating } from "../rv/torqueToWeight.ts";
import {
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  resolveCatalogMake,
  resolveCatalogModel,
  resolveCoachIdentity,
  type CoachIdentity,
} from "./coachIdentity.ts";
import { CATALOG_INDEX } from "../rv/rvCatalogIndex.ts";
import { resolveFactsBrochure } from "./factsBrochure.ts";
import {
  claimsDeskSpecSheet,
  DESK_SHEET_FORBIDDEN_LINE,
  formatDeskSheetMountedLine,
  looksLikeLineupOverviewAsk,
  queryNamesYearMakeModel,
  shouldMountDeskSheet,
} from "./deskSheetPolicy.ts";
import {
  formatLockedWeightsBlock,
  NO_DUPLICATE_MARKDOWN_SHEET,
} from "./lockedWeights.ts";
import {
  chatSpecCoversPaintedFields,
  chatSpecHasNumber,
  extractChatSpecFigures,
  paintChatSpecOntoRows,
} from "./chatSpecBlock.ts";

export {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  claimsDeskSpecSheet,
  formatDeskSheetMountedLine,
  looksLikeDeskSheetAsk,
  looksLikeLineupOverviewAsk,
  queryNamesYearMakeModel,
  shouldMountDeskSheet,
} from "./deskSheetPolicy.ts";
export {
  formatLockedWeightsBlock,
  LOCKED_WEIGHTS_SPEECH_RULE,
  NO_DUPLICATE_MARKDOWN_SHEET,
  resolveLockedOemWeights,
  stripDuplicateMarkdownSpecSheet,
} from "./lockedWeights.ts";

/** Mounted desk + OEM pin lock — prefer this over the catalog-free policy helper. */
export function withDeskSheetSpeechRule(
  block: string,
  query: string,
  identity: CoachIdentity | null | undefined,
): string {
  const extra =
    shouldMountDeskSheet(query, identity) &&
    identity?.make?.trim() &&
    identity.model?.trim()
      ? [
          formatDeskSheetMountedLine(identity),
          formatLockedWeightsBlock(identity),
          NO_DUPLICATE_MARKDOWN_SHEET,
        ].join("\n\n")
      : DESK_SHEET_FORBIDDEN_LINE;
  const body = (block || "").trim();
  return body ? `${body}\n\n${extra}` : extra;
}

export type DeskSheetRow = {
  label: string;
  value: string;
  gap: boolean;
};

export type DeskSheetPayload = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  title: string;
  rows: DeskSheetRow[];
  gaps: string[];
  presenceNote: string;
};

type SheetField = {
  value: string | null;
  trust?: string;
};

type SheetSpecs = {
  engine?: SheetField | null;
  horsepower?: SheetField | null;
  torque?: SheetField | null;
  chassis?: SheetField | null;
  transmission?: SheetField | null;
  fuelType?: SheetField | null;
  rvType?: SheetField | null;
} | null;

function rowFromField(label: string, field?: SheetField | null): DeskSheetRow {
  const value = (field?.value || "").trim();
  if (!value || field?.trust === "empty") {
    return { label, value: "GAP", gap: true };
  }
  if (field?.trust === "est") {
    return { label, value: `${value} · EST`, gap: false };
  }
  return { label, value, gap: false };
}

/** Fifth wheel / TT / toy hauler — motor rows are N/A, not GAP. */
export function deskSheetIsTowable(
  identity: CoachIdentity,
  specs: SheetSpecs,
): boolean {
  if (isTowableForTorqueRating(specs?.rvType?.value, specs?.fuelType?.value)) {
    return true;
  }
  const make = resolveCatalogMake(identity.make || "");
  const model = identity.model
    ? resolveCatalogModel(make, identity.model, identity.floorplan)
    : "";
  const index = make && model ? CATALOG_INDEX[make]?.[model] : null;
  return isTowableForTorqueRating(index?.type, index?.fuelType);
}

function motorRow(
  label: string,
  field: SheetField | null | undefined,
  towable: boolean,
): DeskSheetRow {
  if (towable) {
    const value = (field?.value || "").trim();
    if (!value || field?.trust === "empty" || /towable/i.test(value)) {
      return { label, value: "N/A", gap: false };
    }
  }
  return rowFromField(label, field);
}

function lbsLabel(n: number | null): DeskSheetRow {
  if (n == null || !Number.isFinite(n) || n <= 0) {
    return { label: "", value: "GAP", gap: true };
  }
  return {
    label: "",
    value: `${Math.round(n).toLocaleString("en-US")} lb`,
    gap: false,
  };
}

function galLabel(n: number | null | undefined): DeskSheetRow {
  if (n == null || !Number.isFinite(n) || n <= 0) {
    return { label: "", value: "GAP", gap: true };
  }
  return { label: "", value: `${Math.round(n)} gal`, gap: false };
}

function isFactsEmpty(value: string): boolean {
  return (
    !value ||
    value === "GAP" ||
    value === "—" ||
    value === "–" ||
    value === CONFIRM_BROCHURE
  );
}

/** Keep Facts' string (including "Confirm brochure") so both screens match. */
function brochureRow(
  label: string,
  value: string | null | undefined,
): DeskSheetRow {
  const v = (value || "").trim();
  if (!v || v === "GAP") {
    return { label, value: "GAP", gap: true };
  }
  if (isFactsEmpty(v)) {
    return { label, value: v, gap: true };
  }
  return { label, value: v, gap: false };
}

function motorBrochureRow(
  label: string,
  value: string | null | undefined,
  towable: boolean,
): DeskSheetRow {
  const v = (value || "").trim();
  if (towable && (isFactsEmpty(v) || /towable/i.test(v))) {
    return { label, value: "N/A", gap: false };
  }
  return brochureRow(label, value);
}

function payloadFromFactsBrochure(
  identity: CoachIdentity,
  brochure: BrochureSpecs,
  specs: SheetSpecs,
): DeskSheetRow[] {
  const towable = deskSheetIsTowable(identity, {
    rvType: { value: brochure.type },
    fuelType: { value: brochure.fuelType },
  });
  return [
    brochureRow("Class", brochure.type || specs?.rvType?.value),
    motorBrochureRow("Engine", brochure.engine, towable),
    motorBrochureRow("Horsepower", brochure.horsepower, towable),
    motorBrochureRow("Torque", brochure.torque, towable),
    brochureRow("Chassis", brochure.chassis),
    motorBrochureRow("Transmission", brochure.transmission, towable),
    brochureRow("Fuel", brochure.fuelType),
    brochureRow("Tow capacity", brochure.hitchOrPin),
    brochureRow("Generator", brochure.generator),
    brochureRow("A/C", brochure.acUnits),
    brochureRow("Fuel capacity", brochure.fuelCapacity),
    brochureRow("GVWR", brochure.gvwr),
    // Published UVW only. GVWR-tier estimates stay off the desk — never invent.
    brochureRow(
      "UVW",
      brochure.uvwLbs != null && !brochure.uvwEstimated ? brochure.uvw : null,
    ),
    brochureRow("CCC", brochure.ccc),
    brochureRow("Fresh", brochure.freshWater),
    brochureRow("Gray", brochure.grayWater),
    brochureRow("Black", brochure.blackWater),
  ];
}

function publishedWeightLbs(
  identity: CoachIdentity,
  kind: "gvwr" | "uvw",
): number | null {
  const oem = findOemFloorplanSpec(
    identity.year,
    identity.make,
    identity.model,
    identity.floorplan,
  );
  if (kind === "gvwr") {
    return (
      oem?.gvwrLbs ??
      findOemGvwrLbs(
        identity.year,
        identity.make,
        identity.model,
        identity.floorplan,
      )
    );
  }
  return (
    findOemUvwLbs(
      identity.year,
      identity.make,
      identity.model,
      identity.floorplan,
    )     ?? oem?.uvwLbs ?? null
  );
}

/** Catalog / OEM pin fills GAP rows chat did not name. Never invent. */
function fillGapRowsFromOemTanks(
  rows: DeskSheetRow[],
  identity: CoachIdentity,
): DeskSheetRow[] {
  const tanks = findOemHoldingTanks(
    identity.year,
    identity.make,
    identity.model,
    identity.floorplan,
  );
  const oem = findOemFloorplanSpec(
    identity.year,
    identity.make,
    identity.model,
    identity.floorplan,
  );
  const byLabel: Record<string, DeskSheetRow> = {
    "Fuel capacity": galLabel(tanks.fuelCapacityGal),
    Fresh: galLabel(oem?.freshWater ?? tanks.freshWater),
    Gray: galLabel(oem?.grayWater ?? tanks.grayWater),
    Black: galLabel(oem?.blackWater ?? tanks.blackWater),
    UVW: lbsLabel(publishedWeightLbs(identity, "uvw")),
  };
  return rows.map((row) => {
    if (!row.gap) return row;
    const pinned = byLabel[row.label];
    if (!pinned || pinned.gap) return row;
    return { ...row, value: pinned.value, gap: false };
  });
}

export function buildDeskSheetPayload(
  identity: CoachIdentity,
  specs: SheetSpecs,
  chatSpecBlock = "",
): DeskSheetPayload {
  const presence = inspectCatalogPresence(identity);
  let presenceNote = formatCatalogPresenceNote(presence);
  const title = [identity.year, identity.make, identity.model, identity.floorplan]
    .filter(Boolean)
    .join(" ");

  const figures = extractChatSpecFigures(chatSpecBlock);
  const brochure = resolveFactsBrochure(identity);
  const catalogRows: DeskSheetRow[] = brochure
    ? payloadFromFactsBrochure(identity, brochure, specs)
    : (() => {
        const gvwr = lbsLabel(publishedWeightLbs(identity, "gvwr"));
        const uvw = lbsLabel(publishedWeightLbs(identity, "uvw"));
        const tanks = findOemHoldingTanks(
          identity.year,
          identity.make,
          identity.model,
          identity.floorplan,
        );
        const oem = findOemFloorplanSpec(
          identity.year,
          identity.make,
          identity.model,
          identity.floorplan,
        );
        const fuel = galLabel(tanks.fuelCapacityGal);
        const fresh = galLabel(oem?.freshWater ?? tanks.freshWater);
        const gray = galLabel(oem?.grayWater ?? tanks.grayWater);
        const black = galLabel(oem?.blackWater ?? tanks.blackWater);
        const towable = deskSheetIsTowable(identity, specs);
        return [
          rowFromField("Class", specs?.rvType),
          motorRow("Engine", specs?.engine, towable),
          motorRow("Horsepower", specs?.horsepower, towable),
          motorRow("Torque", specs?.torque, towable),
          rowFromField("Chassis", specs?.chassis),
          motorRow("Transmission", specs?.transmission, towable),
          rowFromField("Fuel", specs?.fuelType),
          { label: "Fuel capacity", value: fuel.value, gap: fuel.gap },
          { label: "GVWR", value: gvwr.value, gap: gvwr.gap },
          { label: "UVW", value: uvw.value, gap: uvw.gap },
          { label: "Fresh", value: fresh.value, gap: fresh.gap },
          { label: "Gray", value: gray.value, gap: gray.gap },
          { label: "Black", value: black.value, gap: black.gap },
        ];
      })();

  // Chat reply is source of truth. Catalog is cache. Empty only if both miss.
  const rows = paintChatSpecOntoRows(
    fillGapRowsFromOemTanks(catalogRows, identity),
    figures,
  );
  const chatNamed = chatSpecHasNumber(figures);
  const chatCovered = chatSpecCoversPaintedFields(figures);
  // Chat named a number → no SERIES MISSING / Confirm brochure / GAP lecture.
  if (chatNamed || chatCovered) {
    presenceNote = "";
  }

  // Lecture banner only when chat did not already name a number.
  const gaps =
    chatNamed || chatCovered
      ? []
      : [
          ...rows.filter((r) => r.gap).map((r) => r.label),
          ...(!identity.year ? ["Year"] : []),
          ...(presenceNote ? ["Presence"] : []),
        ];

  return {
    year: identity.year,
    make: identity.make,
    model: identity.model,
    floorplan: identity.floorplan,
    title: title || "Coach spec sheet",
    rows,
    gaps,
    presenceNote,
  };
}

export function resolveDeskSheet(opts: {
  query: string;
  identity: CoachIdentity | null | undefined;
  specs: SheetSpecs;
  spokenText?: string;
  /** Last assistant spec block — desk paints numbers from this reply only. */
  chatSpecBlock?: string;
}): DeskSheetPayload | null {
  const { query, specs, spokenText } = opts;
  const specBlock = opts.chatSpecBlock || spokenText || "";
  const identity =
    opts.identity ||
    (queryNamesYearMakeModel(query)
      ? resolveCoachIdentity(query, null, "")
      : null);
  if (!identity) return null;
  // Lineup / series-in-lineup stays chat-only. Chat SoT + "on the desk"
  // speech must not remount a YEAR/FLOORPLAN GAP card.
  if (
    looksLikeLineupOverviewAsk(query) &&
    !shouldMountDeskSheet(query, identity)
  ) {
    return null;
  }
  if (
    shouldMountDeskSheet(query, identity) ||
    claimsDeskSpecSheet(spokenText || "")
  ) {
    return buildDeskSheetPayload(identity, specs, specBlock);
  }
  return null;
}
