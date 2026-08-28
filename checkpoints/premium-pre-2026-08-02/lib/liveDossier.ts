/**
 * Live Grok vehicle dossier — progressive fill over catalog brochure.
 * Report paints catalog instantly; live overwrites when ready.
 */

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

export const LIVE_DOSSIER_TIMEOUT_MS = 75_000;

export async function fetchLiveDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
  signal?: AbortSignal,
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
      }),
      signal: ctrl.signal,
    });

    let json: { data?: LiveDossier; error?: string } = {};
    try {
      json = (await resp.json()) as typeof json;
    } catch {
      return {
        ok: false,
        error: `Live lookup returned invalid JSON (${resp.status})`,
        status: resp.status,
      };
    }

    if (json && json.data && typeof json.data === "object") {
      const d = json.data as LiveDossier;
      return {
        ok: true,
        data: {
          ...d,
          live: true,
          fetchedAt: d.fetchedAt || new Date().toISOString(),
        },
      };
    }

    return {
      ok: false,
      error: json.error || `Live lookup failed (${resp.status})`,
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
        error: "Live Grok timed out — catalog estimates remain on screen.",
        aborted: false,
      };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error on live lookup.",
    };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onParentAbort);
  }
}

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
};

export function emptySpecDisplay(pending: boolean): SpecDisplay {
  const dash = pending ? "Updating…" : "—";
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
  };
}

/**
 * Progressive: catalog base paints instantly; live fields overwrite when set.
 */
export function mergeLiveIntoDisplay(
  base: SpecDisplay | null,
  live: LiveDossier | null,
  _opts?: { pending?: boolean },
): SpecDisplay {
  const seed = base ?? emptySpecDisplay(false);
  if (!live?.live) return seed;

  const lbs = (n: number | null | undefined) =>
    n != null && n > 0 ? `${n.toLocaleString()} lbs` : null;
  const gal = (n: number | null | undefined) =>
    n != null && n > 0 ? `${n} gal` : null;
  const s = (v: string | null | undefined) =>
    v && String(v).trim() ? String(v).trim() : null;

  return {
    engine: s(live.engine) ?? seed.engine,
    horsepower:
      live.horsepower != null && live.horsepower > 0
        ? `${live.horsepower} HP`
        : seed.horsepower,
    torque:
      live.torqueLbFt != null && live.torqueLbFt > 0
        ? `${live.torqueLbFt.toLocaleString()} lb-ft`
        : seed.torque,
    transmission: s(live.transmission) ?? seed.transmission,
    chassis: s(live.chassis) ?? seed.chassis,
    hitchOrPin: lbs(live.towingCapacityLbs) ?? seed.hitchOrPin,
    fuelCapacity: gal(live.fuelCapacityGal) ?? seed.fuelCapacity,
    lengthFt: s(live.overallLength) ?? seed.lengthFt,
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
  const t = live.tradeInUsd;
  const lo = live.retailLowUsd;
  const hi = live.retailHighUsd;
  if (t == null || lo == null || hi == null) return null;
  if (t <= 0 || lo <= 0 || hi <= 0) return null;
  let tradeIn = t;
  let retailLow = lo;
  let retailHigh = hi;
  if (retailLow > retailHigh) [retailLow, retailHigh] = [retailHigh, retailLow];
  if (tradeIn > retailLow) tradeIn = Math.round(retailLow * 0.88);
  return {
    tradeIn,
    retailLow,
    retailHigh,
    msrpLo: live.msrpLowUsd ?? undefined,
    msrpHi: live.msrpHighUsd ?? undefined,
    note: live.marketNotes || "Live Grok used-market estimate",
  };
}
