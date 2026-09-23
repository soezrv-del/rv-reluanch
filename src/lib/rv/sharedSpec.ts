/**
 * Shared spec fetch + paint for RV Facts and RV Grok.
 *
 * Catalog / OEM pin first. On a miss for UVW, tanks, fuel, or GVWR only,
 * scrape RVUSA → RV Guide → dealer listings → OEM brochure PDF.
 * Dry weight may paint as UVW with an honesty flag. No Gemini.
 */

import { buildBrochureSpecs, CONFIRM_BROCHURE, type BrochureSpecs } from "./brochureSpecs.ts";
import { peekCatalog } from "./catalogLoad.ts";
import {
  findOemFloorplanSpec,
  findOemGvwrLbs,
  findOemHoldingTanks,
  findOemUvwPin,
} from "./floorplanSpecs.ts";
import {
  scrapeEmptySpecFields,
  specFieldScrapeNote,
  type SpecFieldName,
  type SpecFieldScrapeFetch,
  type SpecFieldScrapeHit,
} from "./specFieldScrape.ts";

export type SharedSpecIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
};

export type SharedSpecSnapshot = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  brochure: BrochureSpecs | null;
  gvwrLbs: number | null;
  uvwLbs: number | null;
  uvwEstimated: boolean;
  uvwIsDryWeight: boolean;
  uvwSourceUrl: string | null;
  cccLbs: number | null;
  fuelCapacityGal: number | null;
  freshWaterGal: number | null;
  grayWaterGal: number | null;
  blackWaterGal: number | null;
  source: "catalog" | "oem-pin" | "spec-scrape";
  sourcesNote: string | null;
};

const GAP_DISPLAY =
  /^(?:—|-|–|n\/?a|null|none|unknown|tbd|gap|confirm brochure)$/i;

export function catalogDisplayIsEmpty(value: string | null | undefined): boolean {
  const s = String(value || "").trim();
  return !s || GAP_DISPLAY.test(s) || s === CONFIRM_BROCHURE;
}

function firstUrl(note?: string | null): string | null {
  if (!note) return null;
  return note.match(/https?:\/\/[^\s)]+/i)?.[0] ?? null;
}

function emptySnapshot(id: SharedSpecIdentity): SharedSpecSnapshot {
  return {
    year: id.year,
    make: id.make,
    model: id.model,
    floorplan: id.floorplan || "",
    brochure: null,
    gvwrLbs: null,
    uvwLbs: null,
    uvwEstimated: false,
    uvwIsDryWeight: false,
    uvwSourceUrl: null,
    cccLbs: null,
    fuelCapacityGal: null,
    freshWaterGal: null,
    grayWaterGal: null,
    blackWaterGal: null,
    source: "oem-pin",
    sourcesNote: null,
  };
}

/** Catalog + OEM pins only. Used by Facts brochure and Grok desk. */
export function resolveSharedSpecSync(
  identity: SharedSpecIdentity,
): SharedSpecSnapshot {
  const year = (identity.year || "").trim();
  const make = (identity.make || "").trim();
  const model = (identity.model || "").trim();
  const floorplan = (identity.floorplan || "").trim();
  const id = { year, make, model, floorplan };
  if (!make || !model) return emptySnapshot(id);

  const spec = peekCatalog()?.RV_DATA?.[make]?.[model] ?? null;
  const brochure = spec
    ? buildBrochureSpecs(spec, year, make, model, floorplan)
    : null;
  const oem = findOemFloorplanSpec(year, make, model, floorplan);
  const oemUvw = findOemUvwPin(year, make, model, floorplan);
  const oemGvwr = findOemGvwrLbs(year, make, model, floorplan);
  const tanks = findOemHoldingTanks(year, make, model, floorplan);

  const pinUvw = oemUvw?.uvwLbs ?? oem?.uvwLbs ?? null;
  const brochureUvw =
    brochure && !brochure.uvwEstimated ? brochure.uvwLbs ?? null : null;
  const uvwLbs = pinUvw ?? brochureUvw;
  const uvwIsDryWeight = Boolean(
    uvwLbs &&
      oemUvw?.uvwLbs === uvwLbs &&
      /dry weight/i.test(oemUvw.source || ""),
  );

  const gvwrLbs =
    oem?.gvwrLbs ?? oemGvwr ?? brochure?.gvwrLbs ?? null;
  const cccLbs =
    brochure?.cccLbs ??
    (gvwrLbs != null && uvwLbs != null ? Math.max(0, gvwrLbs - uvwLbs) : null);

  const fresh =
    tanks.freshWater ?? oem?.freshWater ?? null;
  const gray = tanks.grayWater ?? oem?.grayWater ?? null;
  const black = tanks.blackWater ?? oem?.blackWater ?? null;
  const fuel = tanks.fuelCapacityGal ?? null;

  const notes = [
    oemUvw?.source,
    oem?.source || oem?.note,
    brochure?.accuracyNote,
  ].filter(Boolean);

  return {
    year,
    make,
    model,
    floorplan,
    brochure,
    gvwrLbs,
    uvwLbs,
    uvwEstimated: uvwLbs == null && Boolean(brochure?.uvwEstimated),
    uvwIsDryWeight,
    uvwSourceUrl: firstUrl(oemUvw?.source),
    cccLbs,
    fuelCapacityGal: fuel,
    freshWaterGal: fresh,
    grayWaterGal: gray,
    blackWaterGal: black,
    source: pinUvw != null || oemGvwr != null ? "oem-pin" : "catalog",
    sourcesNote: notes.length ? notes.join(" · ") : null,
  };
}

function missingCapacity(snap: SharedSpecSnapshot): SpecFieldName[] {
  const missing: SpecFieldName[] = [];
  if (!(snap.uvwLbs != null && snap.uvwLbs > 0) || snap.uvwEstimated) {
    missing.push("uvw");
  }
  if (!(snap.gvwrLbs != null && snap.gvwrLbs > 0)) missing.push("gvwr");
  if (
    !(snap.freshWaterGal != null && snap.freshWaterGal > 0) &&
    !(snap.grayWaterGal != null && snap.grayWaterGal > 0) &&
    !(snap.blackWaterGal != null && snap.blackWaterGal > 0)
  ) {
    missing.push("tanks");
  }
  if (!(snap.fuelCapacityGal != null && snap.fuelCapacityGal > 0)) {
    missing.push("fuel");
  }
  return missing;
}

function mergeScrape(
  snap: SharedSpecSnapshot,
  hit: SpecFieldScrapeHit,
): SharedSpecSnapshot {
  const uvwLbs = snap.uvwLbs && !snap.uvwEstimated ? snap.uvwLbs : hit.uvwLbs ?? snap.uvwLbs;
  const uvwIsDryWeight =
    snap.uvwLbs && !snap.uvwEstimated
      ? snap.uvwIsDryWeight
      : Boolean(hit.uvwLbs && hit.uvwIsDryWeight);
  const gvwrLbs = snap.gvwrLbs ?? hit.gvwrLbs ?? null;
  const cccLbs =
    snap.cccLbs ??
    hit.payloadLbs ??
    (gvwrLbs != null && uvwLbs != null ? Math.max(0, gvwrLbs - uvwLbs) : null);
  return {
    ...snap,
    gvwrLbs,
    uvwLbs: uvwLbs ?? null,
    uvwEstimated: false,
    uvwIsDryWeight,
    uvwSourceUrl: snap.uvwSourceUrl ?? (hit.uvwLbs != null ? hit.sourceUrl : null),
    cccLbs,
    fuelCapacityGal: snap.fuelCapacityGal ?? hit.fuelCapacityGal ?? null,
    freshWaterGal: snap.freshWaterGal ?? hit.freshWaterGal ?? null,
    grayWaterGal: snap.grayWaterGal ?? hit.grayWaterGal ?? null,
    blackWaterGal: snap.blackWaterGal ?? hit.blackWaterGal ?? null,
    source: "spec-scrape",
    sourcesNote: [snap.sourcesNote, specFieldScrapeNote(hit)]
      .filter(Boolean)
      .join(" · "),
  };
}

/** Catalog first; scrape only the empty capacity / weight fields. */
export async function resolveSharedSpec(
  identity: SharedSpecIdentity,
  opts?: {
    fetch?: SpecFieldScrapeFetch;
    rvType?: string | null;
  },
): Promise<SharedSpecSnapshot> {
  const snap = resolveSharedSpecSync(identity);
  const missing = missingCapacity(snap);
  if (!missing.length) return snap;
  const hit = await scrapeEmptySpecFields({
    year: identity.year,
    make: identity.make,
    model: identity.model,
    floorplan: identity.floorplan,
    rvType: opts?.rvType ?? snap.brochure?.type ?? null,
    missing,
    fetch: opts?.fetch,
  });
  if (!hit) return snap;
  return mergeScrape(snap, hit);
}

export function formatSharedLbs(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  return `${Math.round(n).toLocaleString("en-US")} lbs`;
}

export function paintSharedUvw(snap: SharedSpecSnapshot): {
  value: string;
  gap: boolean;
  label: string;
  note: string | null;
} {
  if (snap.uvwLbs != null && snap.uvwLbs > 0 && !snap.uvwEstimated) {
    const lbs = formatSharedLbs(snap.uvwLbs) || "";
    return {
      value: snap.uvwIsDryWeight ? `${lbs}*` : lbs,
      gap: false,
      label: "UVW",
      note: snap.uvwIsDryWeight
        ? `Dry weight (OEM brochure omits UVW)${snap.uvwSourceUrl ? ` · ${snap.uvwSourceUrl}` : ""}`
        : snap.uvwSourceUrl,
    };
  }
  return { value: "GAP", gap: true, label: "UVW", note: null };
}

export function applySharedSpecToBrochure(
  brochure: BrochureSpecs,
  snap: SharedSpecSnapshot,
): BrochureSpecs {
  const uvwPaint = paintSharedUvw(snap);
  const uvwLocked = snap.uvwLbs != null && snap.uvwLbs > 0 && !snap.uvwEstimated;
  return {
    ...brochure,
    uvw: uvwLocked
      ? uvwPaint.value
      : catalogDisplayIsEmpty(brochure.uvw)
        ? uvwPaint.gap
          ? brochure.uvw
          : uvwPaint.value
        : brochure.uvw,
    uvwLbs: uvwLocked ? snap.uvwLbs : brochure.uvwLbs,
    uvwEstimated: uvwLocked ? false : brochure.uvwEstimated,
    cccLbs: snap.cccLbs ?? brochure.cccLbs,
    ccc:
      snap.cccLbs != null
        ? formatSharedLbs(snap.cccLbs) || brochure.ccc
        : brochure.ccc,
    fuelCapacity:
      catalogDisplayIsEmpty(brochure.fuelCapacity) && snap.fuelCapacityGal != null
        ? `${Math.round(snap.fuelCapacityGal)} gal`
        : brochure.fuelCapacity,
    freshWater:
      catalogDisplayIsEmpty(brochure.freshWater) && snap.freshWaterGal != null
        ? `${Math.round(snap.freshWaterGal)} gal`
        : brochure.freshWater,
    grayWater:
      catalogDisplayIsEmpty(brochure.grayWater) && snap.grayWaterGal != null
        ? `${Math.round(snap.grayWaterGal)} gal`
        : brochure.grayWater,
    blackWater:
      catalogDisplayIsEmpty(brochure.blackWater) && snap.blackWaterGal != null
        ? `${Math.round(snap.blackWaterGal)} gal`
        : brochure.blackWater,
  };
}

/** Fill empty capacity pins from the shared snapshot. Never overwrite a pin. */
export function mergeSharedCapacity<
  T extends {
    gvwrLbs?: number | null;
    uvwLbs?: number | null;
    cccLbs?: number | null;
    fuelCapacityGal?: number | null;
    freshWaterGal?: number | null;
    grayWaterGal?: number | null;
    blackWaterGal?: number | null;
    sourcesNote?: string | null;
  },
>(pins: T, snap: SharedSpecSnapshot): T {
  return {
    ...pins,
    gvwrLbs: pins.gvwrLbs ?? snap.gvwrLbs,
    uvwLbs: pins.uvwLbs ?? (snap.uvwEstimated ? null : snap.uvwLbs),
    cccLbs:
      pins.cccLbs ??
      snap.cccLbs ??
      (snap.gvwrLbs != null && snap.uvwLbs != null
        ? Math.max(0, snap.gvwrLbs - snap.uvwLbs)
        : null),
    fuelCapacityGal: pins.fuelCapacityGal ?? snap.fuelCapacityGal,
    freshWaterGal: pins.freshWaterGal ?? snap.freshWaterGal,
    grayWaterGal: pins.grayWaterGal ?? snap.grayWaterGal,
    blackWaterGal: pins.blackWaterGal ?? snap.blackWaterGal,
    sourcesNote: [pins.sourcesNote, snap.sourcesNote].filter(Boolean).join(" · ") ||
      pins.sourcesNote,
  };
}
