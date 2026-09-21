/**
 * Live Voice / chat desk spec sheet — CarFax-style card for the locked coach.
 *
 * Speech may say the sheet is on the desk only when we actually mount it.
 * Missing UVW / GVWR / torque stay GAP — never invent.
 */

import { findOemGvwrLbs, findOemUvwLbs } from "../rv/floorplanSpecs.ts";
import {
  formatCatalogPresenceNote,
  inspectCatalogPresence,
  type CoachIdentity,
} from "./coachIdentity.ts";
import {
  claimsDeskSpecSheet,
  shouldMountDeskSheet,
} from "./deskSheetPolicy.ts";

export {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  claimsDeskSpecSheet,
  formatDeskSheetMountedLine,
  shouldMountDeskSheet,
  withDeskSheetSpeechRule,
} from "./deskSheetPolicy.ts";

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

  const rows: DeskSheetRow[] = [
    rowFromField("Class", specs?.rvType),
    rowFromField("Engine", specs?.engine),
    rowFromField("Horsepower", specs?.horsepower),
    rowFromField("Torque", specs?.torque),
    rowFromField("Chassis", specs?.chassis),
    rowFromField("Transmission", specs?.transmission),
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
