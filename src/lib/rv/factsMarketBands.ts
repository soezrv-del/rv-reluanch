/**
 * Facts Market value field contract — display only.
 *
 * On-demand paint: fetch on user open/ask. No nightly book, no cached
 * bands, no pre-warmed catalog dollars. Does not invent prices and does
 * not use a bare J.D. Power title.
 *
 *   retailLow     → Low
 *   marketValue   → Average (else midpoint of retailLow / retailHigh)
 *   retailHigh    → High, omitted when hideRetailHigh
 *   confidence    → thin-sample when "low" (or public sample < 2)
 *   sourceLabel   → blend cue when source is jd_power_blend; Catalog estimate on GAP
 */

import {
  JD_POWER_BLEND_LABEL,
  JD_POWER_PUBLIC_LABEL,
  jdPowerSourceLabel,
  type JdPowerPublicEstimate,
} from "./jdPowerPublic.ts";
import {
  CATALOG_ESTIMATE_LABEL,
  PUBLIC_COMPS_MIN_SAMPLE,
  SOLD_COMPS_LABEL,
  type PublicListingComps,
} from "./publicListingComps.ts";
import type { MarketValueSource } from "./marketEstimate.ts";

export const MARKET_BAND_LOW_LABEL = "Low";
export const MARKET_BAND_AVERAGE_LABEL = "Average";
export const MARKET_BAND_HIGH_LABEL = "High";
/** Visible when sold comps are Low / thin — never a guessed High dollar. */
export const THIN_SAMPLE_FLAG_LABEL = "Thin sample";
export const FACTS_MARKET_LOADING_MESSAGE = "Loading";
export const FACTS_MARKET_ERROR_MESSAGE = "Live market lookup failed";
export const FACTS_MARKET_IDLE_HEADLINE = "Tap to check";
export type FactsMarketLiveStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "gap";

export type FactsMarketBandSlot = {
  label:
    | typeof MARKET_BAND_LOW_LABEL
    | typeof MARKET_BAND_AVERAGE_LABEL
    | typeof MARKET_BAND_HIGH_LABEL;
  value: string;
};

export type FactsThinSampleFlag = {
  label: typeof THIN_SAMPLE_FLAG_LABEL;
  message: string;
};

/**
 * Average dollar: `marketValue` when Facts already has one.
 * If absent, midpoint of the existing retailLow / retailHigh pair.
 * GAP (0) beats inventing a third number.
 */
export function factsMarketAverageUsd(est: {
  marketValue?: number;
  retailLow: number;
  retailHigh: number;
}): number {
  if (typeof est.marketValue === "number" && est.marketValue > 0) {
    return est.marketValue;
  }
  const lo = est.retailLow > 0 ? est.retailLow : 0;
  const hi = est.retailHigh > 0 ? est.retailHigh : 0;
  if (lo > 0 && hi > 0) return (lo + hi) / 2;
  return lo || hi || 0;
}

/** Bare paid-book title — never the Market value heading or caption. */
export function factsMarketIsBareJdPower(label?: string): boolean {
  return /^j\.?\s*d\.?\s*power$/i.test(String(label || "").trim());
}

/**
 * Average caption: blend cue when the JD × live-asks ladder is active;
 * Catalog estimate on JD GAP / thin catalog. Never a bare J.D. Power title.
 *
 * `source` wins over a leftover Catalog estimate `sourceLabel` — that is
 * why the Average tile still read Catalog estimate after #283 blended.
 */
export function factsMarketAverageCaption(input: {
  confidence?: "high" | "medium" | "low";
  source?: MarketValueSource | string | null;
  sourceLabel?: string;
  thin?: boolean;
}): string | undefined {
  const thin = input.thin || input.confidence === "low";
  const fromSource = jdPowerSourceLabel(input.source);
  const label = (fromSource || input.sourceLabel)?.trim();
  if (input.source === "jd_power_blend" || label === JD_POWER_BLEND_LABEL) {
    return JD_POWER_BLEND_LABEL;
  }
  if (input.source === "jd_power_public" || label === JD_POWER_PUBLIC_LABEL) {
    return JD_POWER_PUBLIC_LABEL;
  }
  if (label && factsMarketIsBareJdPower(label)) {
    return thin ? CATALOG_ESTIMATE_LABEL : undefined;
  }
  // Thin / catalog GAP must still paint under Average — never hide the cue.
  if (thin || input.source === "catalog") {
    return input.sourceLabel?.trim() || CATALOG_ESTIMATE_LABEL;
  }
  if (
    label &&
    label !== SOLD_COMPS_LABEL &&
    label !== MARKET_BAND_AVERAGE_LABEL
  ) {
    return label;
  }
  return undefined;
}

export type FactsMarketLiveResult =
  | {
      status: "ready";
      comps: PublicListingComps;
      jdPower: JdPowerPublicEstimate | null;
    }
  | {
      status: "gap";
      comps: null;
      jdPower: JdPowerPublicEstimate | null;
    }
  | { status: "error"; comps: null; jdPower: null; error: string };

/**
 * Live comps + free public path — user open/ask only.
 * `fresh: true` so this open is not a nightly/cached band.
 */
export async function fetchFactsMarketLive(
  input: {
    year: string;
    make: string;
    model: string;
    floorplan?: string;
  },
  signal?: AbortSignal,
): Promise<FactsMarketLiveResult> {
  if (!input.year.trim() || !input.make.trim() || !input.model.trim()) {
    return { status: "gap", comps: null, jdPower: null };
  }
  try {
    const resp = await fetch("/api/rvfax/public-comps", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        year: input.year.trim(),
        make: input.make.trim(),
        model: input.model.trim(),
        floorplan: input.floorplan?.trim() || undefined,
        fresh: true,
      }),
      signal,
    });
    if (!resp.ok) {
      let error = FACTS_MARKET_ERROR_MESSAGE;
      try {
        const json = (await resp.json()) as { error?: string };
        if (json?.error?.trim()) error = json.error.trim();
      } catch {
        /* keep default */
      }
      return { status: "error", comps: null, jdPower: null, error };
    }
    const json = (await resp.json()) as {
      data?: PublicListingComps;
      jdPower?: JdPowerPublicEstimate | null;
      ok?: boolean;
    };
    const jd = json?.jdPower;
    const jdPower =
      jd &&
      jd.source === "jd_power_public" &&
      jd.lowRetail > 0 &&
      jd.averageRetail > 0
        ? jd
        : null;
    if (json?.data?.source === "public_listings" && json.data.medianAsk > 0) {
      return { status: "ready", comps: json.data, jdPower };
    }
    return { status: "gap", comps: null, jdPower };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw e;
    return {
      status: "error",
      comps: null,
      jdPower: null,
      error:
        e instanceof Error && e.message.trim()
          ? e.message
          : FACTS_MARKET_ERROR_MESSAGE,
    };
  }
}

export function factsMarketIsThinSample(input: {
  confidence?: "high" | "medium" | "low";
  soldSampleSize?: number;
  sampleSize?: number;
}): boolean {
  if (input.confidence === "low") return true;
  const n =
    typeof input.soldSampleSize === "number"
      ? input.soldSampleSize
      : input.sampleSize;
  return typeof n === "number" && n < PUBLIC_COMPS_MIN_SAMPLE;
}

/**
 * Map already-formatted desk fields onto Low / Average / High.
 * High is omitted only when `hideRetailHigh` is set — do not invent High.
 * Thin-sample flag is separate (confidence low / sample < 2).
 */
export function factsMarketBandSlots(input: {
  retailLow: string;
  average: string;
  retailHigh: string;
  hideRetailHigh: boolean;
  confidence?: "high" | "medium" | "low";
  soldSampleSize?: number;
  sampleSize?: number;
  thinSampleMessage: string;
}): {
  low: FactsMarketBandSlot;
  average: FactsMarketBandSlot;
  high: FactsMarketBandSlot | null;
  thinSample: FactsThinSampleFlag | null;
} {
  const thinSample = factsMarketIsThinSample({
    confidence: input.confidence,
    soldSampleSize: input.soldSampleSize,
    sampleSize: input.sampleSize,
  });
  return {
    low: { label: MARKET_BAND_LOW_LABEL, value: input.retailLow },
    average: { label: MARKET_BAND_AVERAGE_LABEL, value: input.average },
    high: input.hideRetailHigh
      ? null
      : { label: MARKET_BAND_HIGH_LABEL, value: input.retailHigh },
    thinSample: thinSample
      ? {
          label: THIN_SAMPLE_FLAG_LABEL,
          message: input.thinSampleMessage,
        }
      : null,
  };
}
