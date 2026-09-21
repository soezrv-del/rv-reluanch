/**
 * Live Voice / chat desk spec sheet — CarFax-style card for the locked coach.
 *
 * Speech may say the sheet is on the desk only when we actually mount it.
 * Missing UVW / GVWR / torque stay GAP — never invent.
 * When findOem* has a number, speech and any written sheet must use it.
 */

import { findOemGvwrLbs, findOemUvwLbs } from "../rv/floorplanSpecs.ts";
import { isTowableForTorqueRating } from "../rv/torqueToWeight.ts";
import {
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  resolveCatalogMake,
  resolveCatalogModel,
  type CoachIdentity,
} from "./coachIdentity.ts";
import { CATALOG_INDEX } from "../rv/rvCatalogIndex.ts";
import {
  claimsDeskSpecSheet,
  DESK_SHEET_FORBIDDEN_LINE,
  formatDeskSheetMountedLine,
  shouldMountDeskSheet,
} from "./deskSheetPolicy.ts";
import {
  formatLockedWeightsBlock,
  NO_DUPLICATE_MARKDOWN_SHEET,
} from "./lockedWeights.ts";

export {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  claimsDeskSpecSheet,
  formatDeskSheetMountedLine,
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
  const extra = shouldMountDeskSheet(query, identity)
    ? [
        formatDeskSheetMountedLine(identity!),
        formatLockedWeightsBlock(identity!),
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
    ? resolveCatalogModel(make, identity.model)
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

export function buildDeskSheetPayload(
  identity: CoachIdentity,
  specs: SheetSpecs,
): DeskSheetPayload {
  const presence = inspectCatalogPresence(identity);
  const presenceNote = formatCatalogPresenceNote(presence);
  const title = [identity.year, identity.make, identity.model, identity.floorplan]
    .filter(Boolean)
    .join(" ");

  const gvwr = lbsLabel(
    findOemGvwrLbs(identity.year, identity.make, identity.model, identity.floorplan),
  );
  const uvw = lbsLabel(
    findOemUvwLbs(identity.year, identity.make, identity.model, identity.floorplan),
  );

  const towable = deskSheetIsTowable(identity, specs);
  const rows: DeskSheetRow[] = [
    rowFromField("Class", specs?.rvType),
    motorRow("Engine", specs?.engine, towable),
    motorRow("Horsepower", specs?.horsepower, towable),
    motorRow("Torque", specs?.torque, towable),
    rowFromField("Chassis", specs?.chassis),
    motorRow("Transmission", specs?.transmission, towable),
    rowFromField("Fuel", specs?.fuelType),
    { label: "GVWR", value: gvwr.value, gap: gvwr.gap },
    { label: "UVW", value: uvw.value, gap: uvw.gap },
  ];

  const gaps = [
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
}): DeskSheetPayload | null {
  const { query, identity, specs, spokenText } = opts;
  if (!identity) return null;
  if (
    shouldMountDeskSheet(query, identity) ||
    claimsDeskSpecSheet(spokenText || "")
  ) {
    return buildDeskSheetPayload(identity, specs);
  }
  return null;
}
