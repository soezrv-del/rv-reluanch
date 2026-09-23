/**
 * Shared spec fetch + paint — Facts and Grok both import this.
 *
 * Catalog / brochure / OEM pins first. Empty capacity / weight fields
 * take the field-only fallback (RVUSA → RV Guide → dealer → OEM PDF).
 * Same paint path on both surfaces. Do not invent.
 */

import {
  CONFIRM_BROCHURE,
  type BrochureSpecs,
} from "./brochureSpecs.ts";
import { resolveFactsBrochure } from "../rvgrok/factsBrochure.ts";
import {
  SPEC_ENGINE_OWNED_FIELDS,
  SPEC_ENGINE_OWNED_LABELS,
  type SpecCoachIdentity,
  type SpecFallbackSource,
  type SpecFieldFill,
  type SpecFieldKey,
} from "./specFieldFallback.ts";

export {
  SPEC_ENGINE_OWNED_FIELDS,
  SPEC_ENGINE_OWNED_LABELS,
  type SpecCoachIdentity,
  type SpecFieldFill,
  type SpecFieldKey,
} from "./specFieldFallback.ts";

export type SpecFieldSource = "catalog" | "oem-pin" | SpecFallbackSource;

export type PaintedSpecField = {
  field: SpecFieldKey;
  display: string;
  lbs: number | null;
  gal: number | null;
  gap: boolean;
  asterisk: boolean;
  source?: SpecFieldSource;
  sourceUrl?: string;
  sourceLabel?: string;
};

export type CatalogSpecSnapshot = {
  identity: SpecCoachIdentity;
  uvwLbs: number | null;
  gvwrLbs: number | null;
  cccLbs: number | null;
  fuelCapacityGal: number | null;
  freshWater: number | null;
  grayWater: number | null;
  blackWater: number | null;
  /** True when brochure UVW is a tiered estimate — treat as empty. */
  uvwEstimated: boolean;
};

export type SharedSpecPaint = Record<SpecFieldKey, PaintedSpecField>;

const ENGINE_LABEL: Record<SpecFieldKey, string> = {
  uvw: "UVW",
  gvwr: "GVWR",
  ccc: "CCC",
  fuelCapacity: "Fuel capacity",
  freshWater: "Fresh",
  grayWater: "Gray",
  blackWater: "Black",
};

const SOURCE_LABEL: Record<SpecFallbackSource, string> = {
  rvusa: "RVUSA",
  rvguide: "RV Guide",
  dealer: "Dealer listing",
  "oem-brochure": "OEM brochure",
};

function positiveLbs(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function positiveGal(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 10) / 10;
}

function parseGalString(raw?: string | null): number | null {
  const s = String(raw || "").trim();
  if (!s || /confirm brochure|gap|^—$|^-$/i.test(s)) return null;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return positiveGal(Number(m[1]));
}

export function formatSpecLbs(n: number, asterisk = false): string {
  return `${Math.round(n).toLocaleString("en-US")} lbs${asterisk ? "*" : ""}`;
}

export function formatSpecGal(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  if (Number.isInteger(rounded)) return `${rounded} gal`;
  return `${rounded} gal`;
}

export function isSpecGapDisplay(value?: string | null): boolean {
  const s = String(value || "").trim();
  return (
    !s ||
    s === "GAP" ||
    s === "—" ||
    s === "–" ||
    s === CONFIRM_BROCHURE ||
    /confirm brochure/i.test(s)
  );
}

/** Published UVW only — estimated / typical-class is empty. */
export function publishedUvwLbs(
  brochure: Pick<BrochureSpecs, "uvwLbs" | "uvwEstimated"> | null | undefined,
): number | null {
  if (!brochure || brochure.uvwEstimated) return null;
  return positiveLbs(brochure.uvwLbs);
}

export function catalogSnapshotFromBrochure(
  identity: SpecCoachIdentity,
  brochure: BrochureSpecs | null,
): CatalogSpecSnapshot {
  return {
    identity,
    uvwLbs: publishedUvwLbs(brochure),
    gvwrLbs: positiveLbs(brochure?.gvwrLbs),
    cccLbs: positiveLbs(brochure?.cccLbs),
    fuelCapacityGal: parseGalString(brochure?.fuelCapacity),
    freshWater: parseGalString(brochure?.freshWater),
    grayWater: parseGalString(brochure?.grayWater),
    blackWater: parseGalString(brochure?.blackWater),
    uvwEstimated: brochure?.uvwEstimated === true,
  };
}

export function resolveCatalogSpecSnapshot(
  identity: SpecCoachIdentity,
): CatalogSpecSnapshot {
  const brochure = resolveFactsBrochure(identity);
  return catalogSnapshotFromBrochure(identity, brochure);
}

export function emptySpecFields(
  snap: CatalogSpecSnapshot,
): SpecFieldKey[] {
  const empty: SpecFieldKey[] = [];
  if (snap.uvwLbs == null) empty.push("uvw");
  if (snap.gvwrLbs == null) empty.push("gvwr");
  if (snap.cccLbs == null) empty.push("ccc");
  if (snap.fuelCapacityGal == null) empty.push("fuelCapacity");
  if (snap.freshWater == null) empty.push("freshWater");
  if (snap.grayWater == null) empty.push("grayWater");
  if (snap.blackWater == null) empty.push("blackWater");
  return empty;
}

function emptyPainted(field: SpecFieldKey): PaintedSpecField {
  return {
    field,
    display: "GAP",
    lbs: null,
    gal: null,
    gap: true,
    asterisk: false,
  };
}

function paintLbs(
  field: SpecFieldKey,
  lbs: number,
  opts?: {
    asterisk?: boolean;
    source?: SpecFieldSource;
    sourceUrl?: string;
    sourceLabel?: string;
  },
): PaintedSpecField {
  return {
    field,
    display: formatSpecLbs(lbs, opts?.asterisk === true),
    lbs,
    gal: null,
    gap: false,
    asterisk: opts?.asterisk === true,
    source: opts?.source,
    sourceUrl: opts?.sourceUrl,
    sourceLabel: opts?.sourceLabel,
  };
}

function paintGal(
  field: SpecFieldKey,
  gal: number,
  opts?: {
    source?: SpecFieldSource;
    sourceUrl?: string;
    sourceLabel?: string;
  },
): PaintedSpecField {
  return {
    field,
    display: formatSpecGal(gal),
    lbs: null,
    gal,
    gap: false,
    asterisk: false,
    source: opts?.source,
    sourceUrl: opts?.sourceUrl,
    sourceLabel: opts?.sourceLabel,
  };
}

function fillByField(
  fills: readonly SpecFieldFill[],
): Partial<Record<SpecFieldKey, SpecFieldFill>> {
  const map: Partial<Record<SpecFieldKey, SpecFieldFill>> = {};
  for (const fill of fills) {
    if (!map[fill.field]) map[fill.field] = fill;
  }
  return map;
}

/**
 * Catalog wins. Fallback fills empty fields only.
 * Dry-weight UVW keeps the asterisk + source URL.
 */
export function applySpecFallback(
  snap: CatalogSpecSnapshot,
  fills: readonly SpecFieldFill[] = [],
): SharedSpecPaint {
  const byField = fillByField(fills);

  const pickLbs = (
    field: Extract<SpecFieldKey, "uvw" | "gvwr" | "ccc">,
    catalog: number | null,
  ): PaintedSpecField => {
    if (catalog != null) {
      return paintLbs(field, catalog, { source: "catalog" });
    }
    const fill = byField[field];
    if (fill && fill.unit === "lbs") {
      return paintLbs(field, fill.value, {
        asterisk: field === "uvw" && fill.asDryWeight === true,
        source: fill.source,
        sourceUrl: fill.sourceUrl,
        sourceLabel: SOURCE_LABEL[fill.source],
      });
    }
    return emptyPainted(field);
  };

  const pickGal = (
    field: Extract<
      SpecFieldKey,
      "fuelCapacity" | "freshWater" | "grayWater" | "blackWater"
    >,
    catalog: number | null,
  ): PaintedSpecField => {
    if (catalog != null) {
      return paintGal(field, catalog, { source: "catalog" });
    }
    const fill = byField[field];
    if (fill && fill.unit === "gal") {
      return paintGal(field, fill.value, {
        source: fill.source,
        sourceUrl: fill.sourceUrl,
        sourceLabel: SOURCE_LABEL[fill.source],
      });
    }
    return emptyPainted(field);
  };

  const gvwr = pickLbs("gvwr", snap.gvwrLbs);
  const uvw = pickLbs("uvw", snap.uvwLbs);
  let ccc = pickLbs("ccc", snap.cccLbs);
  if (ccc.gap && gvwr.lbs != null && uvw.lbs != null) {
    const derived = Math.max(0, gvwr.lbs - uvw.lbs);
    if (derived > 0) {
      ccc = paintLbs("ccc", derived, {
        source: uvw.source === "catalog" ? "catalog" : uvw.source,
        sourceUrl: uvw.sourceUrl,
        sourceLabel: uvw.sourceLabel,
      });
    }
  }

  return {
    uvw,
    gvwr,
    ccc,
    fuelCapacity: pickGal("fuelCapacity", snap.fuelCapacityGal),
    freshWater: pickGal("freshWater", snap.freshWater),
    grayWater: pickGal("grayWater", snap.grayWater),
    blackWater: pickGal("blackWater", snap.blackWater),
  };
}

export function resolveSharedSpecPaint(
  identity: SpecCoachIdentity,
  fills: readonly SpecFieldFill[] = [],
): SharedSpecPaint {
  return applySpecFallback(resolveCatalogSpecSnapshot(identity), fills);
}

export function paintHasFallbackNumber(paint: SharedSpecPaint): boolean {
  return SPEC_ENGINE_OWNED_FIELDS.some((key) => {
    const row = paint[key];
    return !row.gap && row.source != null && row.source !== "catalog" && row.source !== "oem-pin";
  });
}

export type SharedPaintRow = {
  label: string;
  value: string;
  gap: boolean;
  asterisk?: boolean;
  sourceUrl?: string;
};

/**
 * Overlay engine-owned rows. Chat must not win these labels.
 * Catalog strings stay when the row is already painted; fallback fills gaps.
 */
export function applySharedPaintToRows<T extends SharedPaintRow>(
  rows: T[],
  paint: SharedSpecPaint,
): T[] {
  const byLabel = new Map<string, PaintedSpecField>();
  for (const key of SPEC_ENGINE_OWNED_FIELDS) {
    byLabel.set(ENGINE_LABEL[key], paint[key]);
  }
  return rows.map((row) => {
    const next = byLabel.get(row.label);
    if (!next || next.gap) return row;
    if (
      !row.gap &&
      (next.source === "catalog" || next.source === "oem-pin")
    ) {
      return row;
    }
    return {
      ...row,
      value: next.display,
      gap: false,
      asterisk: next.asterisk || undefined,
      sourceUrl: next.sourceUrl,
    };
  });
}

/** Facts / desk display: keep catalog text; overlay fallback on empty. */
export function displayFromPainted(
  current: string | null | undefined,
  painted: PaintedSpecField,
): string {
  const cur = String(current || "").trim();
  if (painted.gap) return cur;
  if (
    cur &&
    !isSpecGapDisplay(cur) &&
    (painted.source === "catalog" || painted.source === "oem-pin")
  ) {
    return cur;
  }
  return painted.display;
}

export function stripEngineOwnedChatFigures<T extends Record<string, unknown>>(
  figures: T,
): T {
  const out = { ...figures };
  delete (out as { gvwr?: unknown }).gvwr;
  delete (out as { uvw?: unknown }).uvw;
  delete (out as { fuelCapacity?: unknown }).fuelCapacity;
  delete (out as { freshWater?: unknown }).freshWater;
  delete (out as { grayWater?: unknown }).grayWater;
  delete (out as { blackWater?: unknown }).blackWater;
  return out;
}

export function isEngineOwnedDeskLabel(label: string): boolean {
  return SPEC_ENGINE_OWNED_LABELS.includes(label);
}

const LABEL_TO_FIELD: Record<string, SpecFieldKey> = {
  UVW: "uvw",
  GVWR: "gvwr",
  CCC: "ccc",
  "Fuel capacity": "fuelCapacity",
  Fresh: "freshWater",
  Gray: "grayWater",
  Black: "blackWater",
};

export function emptyFieldsFromPaintedRows(
  rows: readonly { label: string; gap: boolean }[],
): SpecFieldKey[] {
  const out: SpecFieldKey[] = [];
  for (const row of rows) {
    const field = LABEL_TO_FIELD[row.label];
    if (field && row.gap) out.push(field);
  }
  return out;
}

export async function fetchSpecFieldFallback(
  opts: {
    year: string;
    make: string;
    model: string;
    floorplan: string;
    empty: readonly SpecFieldKey[];
    rvClass?: string;
    /** Voice desk: server pins fills via planCoachKnowledgeWrite. */
    pinCoachKnowledge?: boolean;
    knowledgeQuery?: string;
  },
  signal?: AbortSignal,
): Promise<SpecFieldFill[]> {
  if (!opts.empty.length) return [];
  try {
    const resp = await fetch("/api/rvfax/spec-fallback", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        year: opts.year,
        make: opts.make,
        model: opts.model,
        floorplan: opts.floorplan,
        empty: opts.empty,
        rvClass: opts.rvClass,
        ...(opts.pinCoachKnowledge
          ? {
              pinCoachKnowledge: true,
              knowledgeQuery: opts.knowledgeQuery || "",
            }
          : {}),
      }),
      signal,
    });
    if (!resp.ok) return [];
    const json = (await resp.json()) as { fills?: SpecFieldFill[] };
    return Array.isArray(json.fills) ? json.fills : [];
  } catch {
    return [];
  }
}
