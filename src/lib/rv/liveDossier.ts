/**
 * Live Grok vehicle dossier — progressive fill over catalog brochure.
 * Report paints catalog instantly; live soft fields update when ready.
 * Successful live results are saved to the verified catalog cache so the
 * next open of the same coach is accurate immediately.
 *
 * Phase 1–2: year-true hard powertrain locked; Live cannot stomp.
 * Phase 3: catalog candidate injected; two-step research on server.
 * Phase 4: cache only after pin+validation; refresh/clear controls.
 */

import {
  applyPowertrainPin,
  clearAllVerifiedDossiers,
  clearVerifiedDossier,
  countVerifiedDossiers,
  getVerifiedDossier,
  saveVerifiedDossier,
} from "./verifiedCatalogCache";

export type LiveDossier = {
  year: number;
  make: string;
  model: string;
  floorplan: string | null;
  rvType: string | null;
  engine: string | null;
  horsepower: number | null;
  torqueLbFt: number | null;
  transmission: string | null;
  chassis: string | null;
  fuelType: string | null;
  towingCapacityLbs: number | null;
  fuelCapacityGal: number | null;
  overallLength: string | null;
  exteriorWidth: string | null;
  exteriorHeight: string | null;
  interiorHeight: string | null;
  gvwrLbs: number | null;
  uvwLbs: number | null;
  cccLbs: number | null;
  slideouts: number | null;
  sleeps: number | null;
  freshWaterGal: number | null;
  grayWaterGal: number | null;
  blackWaterGal: number | null;
  generator: string | null;
  mpgHighwayEst: number | null;
  warranty: string | null;
  floorplansThisYear: string[];
  overview: string | null;
  keyFeatures: string[];
  reliabilitySummary: string | null;
  commonIssues: string[];
  servicePriorities: string[];
  ownerSentiment: string | null;
  ratingEstimate: number | null;
  marketNotes: string | null;
  tradeInUsd: number | null;
  retailLowUsd: number | null;
  retailHighUsd: number | null;
  msrpLowUsd: number | null;
  msrpHighUsd: number | null;
  confidence: "high" | "medium" | "low";
  sourcesNote: string | null;
  fetchedAt: string;
  cached?: boolean;
  live: boolean;
  /** Phase 3 — model pipeline used for this dossier */
  modelUsed?: string | null;
};

export type CatalogCandidatePayload = {
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

export type LiveDossierResponse =
  | { ok: true; data: LiveDossier }
  | { ok: false; error: string; status?: number; aborted?: boolean };

export function dossierCacheKey(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
) {
  return `${year}|${make}|${model}|${floorplan || ""}`.toLowerCase();
}

/** Client timeout — keep year-band paint; do not blank the report */
export const LIVE_DOSSIER_TIMEOUT_MS = 90_000;

/**
 * Instant paint helper — verified local cache from a prior live search.
 * Use this before awaiting fetchLiveDossier so the UI isn't stuck on catalog guesses.
 */
export function peekVerifiedDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): LiveDossier | null {
  return getVerifiedDossier(year, make, model, floorplan);
}

function pinDossier(
  year: string,
  make: string,
  model: string,
  floorplan: string | undefined,
  d: LiveDossier,
): LiveDossier {
  return applyPowertrainPin(year, make, model, floorplan, {
    ...d,
    live: true,
  });
}

export async function fetchLiveDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
  signal?: AbortSignal,
  catalogCandidate?: CatalogCandidatePayload,
): Promise<LiveDossierResponse> {
  if (!year.trim() || !make.trim() || !model.trim()) {
    return { ok: false, error: "Year, make, and model are required." };
  }

  const ctrl = new AbortController();
  const onParentAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) {
      return { ok: false, error: "Request cancelled.", aborted: true };
    }
    signal.addEventListener("abort", onParentAbort, { once: true });
  }
  const timer = setTimeout(() => ctrl.abort(), LIVE_DOSSIER_TIMEOUT_MS);

  try {
    const resp = await fetch("/api/rvfax/dossier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        year: year.trim(),
        make: make.trim(),
        model: model.trim(),
        floorplan: floorplan?.trim() || undefined,
        catalogCandidate: catalogCandidate || undefined,
      }),
      signal: ctrl.signal,
    });

    let json: {
      data?: LiveDossier;
      error?: string;
      meta?: { model?: string; pipeline?: string; cached?: boolean };
    } = {};
    try {
      json = (await resp.json()) as typeof json;
    } catch {
      return {
        ok: false,
        error: `Live lookup returned invalid JSON (${resp.status}) — catalog year-band stays on screen.`,
        status: resp.status,
      };
    }

    if (json && json.data && typeof json.data === "object") {
      const d = json.data as LiveDossier;
      const data: LiveDossier = pinDossier(year, make, model, floorplan, {
        ...d,
        live: true,
        cached: Boolean(json.meta?.cached || d.cached),
        fetchedAt: d.fetchedAt || new Date().toISOString(),
        modelUsed: json.meta?.model || d.modelUsed || null,
      });
      // Phase 4.1 — save only after pin + validation (handled inside saveVerifiedDossier)
      saveVerifiedDossier(year, make, model, floorplan, data);
      return { ok: true, data };
    }

    return {
      ok: false,
      error:
        json.error ||
        `Live lookup failed (${resp.status}) — catalog year-band remains.`,
      status: resp.status,
    };
  } catch (e) {
    if (
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError")
    ) {
      if (signal?.aborted) {
        return { ok: false, error: "Request cancelled.", aborted: true };
      }
      return {
        ok: false,
        error:
          "Live research timed out — catalog year-band remains on this report.",
        aborted: false,
      };
    }
    return {
      ok: false,
      error:
        e instanceof Error
          ? `${e.message} — catalog year-band remains on this report.`
          : "Network error on live lookup — catalog year-band remains.",
    };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onParentAbort);
  }
}

/**
 * Phase 4.3 — bust local verified cache for this coach.
 * Next fetchLiveDossier will hit the network (server also keys by CACHE_VER).
 */
export function refreshCoachDossierCache(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): void {
  clearVerifiedDossier(year, make, model, floorplan);
}

export {
  clearVerifiedDossier,
  clearAllVerifiedDossiers,
  countVerifiedDossiers,
};

export type SpecDisplay = {
  engine: string;
  horsepower: string;
  torque: string;
  transmission: string;
  chassis: string;
  hitchOrPin: string;
  fuelCapacity: string;
  lengthFt: string;
  exteriorWidth: string;
  exteriorHeight: string;
  interiorHeight: string;
  gvwr: string;
  uvw: string;
  ccc: string;
  slideouts: string;
  sleeps: string;
  freshWater: string;
  grayWater: string;
  blackWater: string;
  generator: string;
  mpgHighway: string;
  warranty: string;
  isToyHauler?: boolean;
  garageLength?: string;
  garageWidth?: string;
  garageHeight?: string;
  garageCapacity?: string;
  rampWidth?: string;
  fuelStation?: string;
  garageFits?: string;
};

function emptySpecDisplay(_pending: boolean): SpecDisplay {
  const dash = "—";
  return {
    engine: dash,
    horsepower: dash,
    torque: dash,
    transmission: dash,
    chassis: dash,
    hitchOrPin: dash,
    fuelCapacity: dash,
    lengthFt: dash,
    exteriorWidth: dash,
    exteriorHeight: dash,
    interiorHeight: dash,
    gvwr: dash,
    uvw: dash,
    ccc: dash,
    slideouts: dash,
    sleeps: dash,
    freshWater: dash,
    grayWater: dash,
    blackWater: dash,
    generator: dash,
    mpgHighway: dash,
    warranty: dash,
    isToyHauler: false,
    garageLength: dash,
    garageWidth: dash,
    garageHeight: dash,
    garageCapacity: dash,
    rampWidth: dash,
    fuelStation: dash,
    garageFits: dash,
  };
}

/**
 * Progressive: catalog base paints instantly; live fields overwrite when set.
 *
 * Phase 2 hard facts: engine / HP / torque / chassis / transmission are locked
 * from catalog by default (`lockPowertrainFromCatalog: true`). Soft fields
 * (dimensions, tanks, generator, MPG, warranty) still accept Live.
 *
 * Use `resolveHardPowertrain` from livePowertrainGuard for pin + validation
 * when deciding whether Live may fill *empty* hard fields.
 */
export function mergeLiveIntoDisplay(
  base: SpecDisplay | null,
  live: LiveDossier | null,
  opts?: {
    pending?: boolean;
    /** Default true — year-true catalog powertrain cannot be stomped */
    lockPowertrainFromCatalog?: boolean;
    /** Optional pre-resolved hard fields (from resolveHardPowertrain) */
    hardOverride?: {
      engine?: string | null;
      horsepower?: string | null;
      torque?: string | null;
      chassis?: string | null;
      transmission?: string | null;
    };
  },
): SpecDisplay {
  const seed = base ?? emptySpecDisplay(false);
  if (!live?.live) {
    if (opts?.hardOverride) {
      return {
        ...seed,
        engine: opts.hardOverride.engine || seed.engine,
        horsepower: opts.hardOverride.horsepower || seed.horsepower,
        torque: opts.hardOverride.torque || seed.torque,
        chassis: opts.hardOverride.chassis || seed.chassis,
        transmission: opts.hardOverride.transmission || seed.transmission,
      };
    }
    return seed;
  }

  const lockPt = opts?.lockPowertrainFromCatalog !== false;

  const lbs = (n: number | null | undefined) =>
    n != null && n > 0 ? `${n.toLocaleString()} lbs` : null;
  const gal = (n: number | null | undefined) =>
    n != null && n > 0 ? `${n} gal` : null;
  const s = (v: string | null | undefined) =>
    v && String(v).trim() ? String(v).trim() : null;

  const looksLikeLengthRange = (v: string | null | undefined) => {
    if (!v) return false;
    return (
      /\d\s*[-–—]\s*\d/.test(v) ||
      /\bto\b/i.test(v) ||
      /\b(span|range|varies)\b/i.test(v)
    );
  };
  const seedLengthIsSpecific =
    !!seed.lengthFt &&
    seed.lengthFt !== "—" &&
    !looksLikeLengthRange(seed.lengthFt);
  const liveLength = s(live.overallLength);
  const lengthFt =
    liveLength && looksLikeLengthRange(liveLength) && seedLengthIsSpecific
      ? seed.lengthFt
      : liveLength && !looksLikeLengthRange(liveLength)
        ? liveLength
        : seed.lengthFt;

  const soft: SpecDisplay = {
    engine: seed.engine,
    horsepower: seed.horsepower,
    torque: seed.torque,
    transmission: seed.transmission,
    chassis: seed.chassis,
    hitchOrPin: lbs(live.towingCapacityLbs) ?? seed.hitchOrPin,
    fuelCapacity: gal(live.fuelCapacityGal) ?? seed.fuelCapacity,
    lengthFt,
    exteriorWidth: s(live.exteriorWidth) ?? seed.exteriorWidth,
    exteriorHeight: s(live.exteriorHeight) ?? seed.exteriorHeight,
    interiorHeight: s(live.interiorHeight) ?? seed.interiorHeight,
    gvwr: lbs(live.gvwrLbs) ?? seed.gvwr,
    uvw: lbs(live.uvwLbs) ?? seed.uvw,
    ccc: lbs(live.cccLbs) ?? seed.ccc,
    slideouts:
      live.slideouts != null && live.slideouts >= 0
        ? String(live.slideouts)
        : seed.slideouts,
    sleeps:
      live.sleeps != null && live.sleeps > 0
        ? String(live.sleeps)
        : seed.sleeps,
    freshWater: gal(live.freshWaterGal) ?? seed.freshWater,
    grayWater: gal(live.grayWaterGal) ?? seed.grayWater,
    blackWater: gal(live.blackWaterGal) ?? seed.blackWater,
    generator: s(live.generator) ?? seed.generator,
    mpgHighway:
      live.mpgHighwayEst != null && live.mpgHighwayEst > 0
        ? String(live.mpgHighwayEst)
        : seed.mpgHighway,
    warranty: s(live.warranty) ?? seed.warranty,
    isToyHauler: seed.isToyHauler,
    garageLength: seed.garageLength,
    garageWidth: seed.garageWidth,
    garageHeight: seed.garageHeight,
    garageCapacity: seed.garageCapacity,
    rampWidth: seed.rampWidth,
    fuelStation: seed.fuelStation,
    garageFits: seed.garageFits,
  };

  if (opts?.hardOverride) {
    return {
      ...soft,
      engine: opts.hardOverride.engine || soft.engine,
      horsepower: opts.hardOverride.horsepower || soft.horsepower,
      torque: opts.hardOverride.torque || soft.torque,
      chassis: opts.hardOverride.chassis || soft.chassis,
      transmission: opts.hardOverride.transmission || soft.transmission,
    };
  }

  if (lockPt) {
    // Year-band / catalog seed cannot be replaced by Live Grok.
    // Empty hard fields are filled only via hardOverride (guard).
    return {
      ...soft,
      engine: seed.engine,
      horsepower: seed.horsepower,
      torque: seed.torque,
      transmission: seed.transmission,
      chassis: seed.chassis,
    };
  }

  return {
    ...soft,
    engine: s(live.engine) ?? seed.engine,
    horsepower:
      live.horsepower != null &&
      Number.isFinite(live.horsepower) &&
      live.horsepower > 0
        ? `${Math.round(live.horsepower)} HP`
        : seed.horsepower,
    torque:
      live.torqueLbFt != null && live.torqueLbFt > 0
        ? `${live.torqueLbFt.toLocaleString()} lb-ft`
        : seed.torque,
    transmission: s(live.transmission) ?? seed.transmission,
    chassis: s(live.chassis) ?? seed.chassis,
  };
}

export function liveMarketLadder(live: LiveDossier | null): {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo?: number;
  msrpHi?: number;
  note: string;
} | null {
  if (!live?.live) return null;
  const tradeIn = live.tradeInUsd ?? 0;
  const retailLow = live.retailLowUsd ?? 0;
  const retailHigh = live.retailHighUsd ?? 0;
  if (tradeIn <= 0 && retailLow <= 0 && retailHigh <= 0) return null;
  return {
    tradeIn,
    retailLow,
    retailHigh,
    msrpLo: live.msrpLowUsd ?? undefined,
    msrpHi: live.msrpHighUsd ?? undefined,
    note: live.marketNotes || "Live Grok market ladder",
  };
}
