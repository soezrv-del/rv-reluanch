import type { RVResult } from "./catalog";
import { compareSelectionKey } from "./catalog";
import { buildBrochureSpecs } from "./brochureSpecs";
import { findOemFloorplanSpec } from "./floorplanSpecs";
import { unverifiedLayoutLabel } from "./promptRules";
import { estimateMarket, formatMoney, ratingFor } from "./catalog";
import type { LiveDossier } from "./liveDossier";
import { liveMarketLadder, mergeLiveIntoDisplay } from "./liveDossier";
import {
  formatHardHorsepower,
  formatHardTorque,
  resolveHardPowertrain,
} from "./livePowertrainGuard";

/** Direction for “better” highlighting */
export type BetterDir = "higher" | "lower" | "neutral";

export type CompareCell = {
  value: string;
  raw: number | null;
  /** relative to peers: better | worse | equal | na */
  tone: "better" | "worse" | "equal" | "na";
};

export type CompareRow = {
  id: string;
  label: string;
  direction: BetterDir;
  cells: CompareCell[];
};

export type CompareColumn = {
  key: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  type: string;
  shortTitle: string;
  result: RVResult;
  /** Live Grok filled this column */
  live?: boolean;
  rating: number;
};

export type CompareReport = {
  columns: CompareColumn[];
  rows: CompareRow[];
  generatedAt: string;
  /** Index of highest / lowest RVFAX rating in this set */
  highestRatingIndex: number;
  lowestRatingIndex: number;
  liveCount: number;
};

function keyOf(r: RVResult) {
  return compareSelectionKey(r);
}

export { compareSelectionKey };

function shortTitle(r: RVResult) {
  return `${r.year} ${r.make.split(" ")[0]} ${r.model}${r.floorplan ? ` ${r.floorplan}` : ""}`;
}

function parseNum(s: string | number | null | undefined): number | null {
  if (s == null || s === "" || s === "—") return null;
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  const cleaned = String(s).replace(/[$,]/g, "").replace(/[^\d.-]/g, " ");

  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]!);
  return Number.isFinite(n) ? n : null;
}

function parseRangeMid(s: string): number | null {
  const nums = String(s)
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  const vals = nums.map(Number).filter((n) => Number.isFinite(n));
  if (!vals.length) return null;
  if (vals.length === 1) return vals[0]!;
  return (Math.min(...vals) + Math.max(...vals)) / 2;
}

function tones(
  values: (number | null)[],
  direction: BetterDir,
): CompareCell["tone"][] {
  if (direction === "neutral") {
    return values.map((v) => (v == null ? "na" : "equal"));
  }
  const present = values
    .map((v, i) => (v != null ? { v, i } : null))
    .filter(Boolean) as { v: number; i: number }[];
  if (present.length < 2) {
    return values.map((v) => (v == null ? "na" : "equal"));
  }
  const best =
    direction === "higher"
      ? Math.max(...present.map((p) => p.v))
      : Math.min(...present.map((p) => p.v));
  const worst =
    direction === "higher"
      ? Math.min(...present.map((p) => p.v))
      : Math.max(...present.map((p) => p.v));

  if (Math.abs(best - worst) < Math.max(0.05, Math.abs(best) * 0.005)) {
    return values.map((v) => (v == null ? "na" : "equal"));
  }

  return values.map((v) => {
    if (v == null) return "na";
    if (v === best) return "better";
    if (v === worst) return "worse";
    return "equal";
  });
}

function row(
  id: string,
  label: string,
  direction: BetterDir,
  pairs: { display: string; raw: number | null }[],
): CompareRow {
  const raws = pairs.map((p) => p.raw);
  const t = tones(raws, direction);
  return {
    id,
    label,
    direction,
    cells: pairs.map((p, i) => ({
      value: p.display,
      raw: p.raw,
      tone: t[i]!,
    })),
  };
}

/** Brand / model prestige for compare when live ratings collapse to one number */
function prestigeScore(make: string, model: string): number {
  const s = `${make} ${model}`.toLowerCase();
  if (
    /prevost|newell|marathon|liberty coach|foretravel|american dream|allegro bus|anthem|cornerstone|london aire|mountain aire|dutch star|ventana limited|encante/.test(
      s,
    )
  ) {
    if (/allegro bus|american dream|anthem|cornerstone|prevost|newell/.test(s))
      return 96;
    if (/dutch star|london aire|mountain aire|ventana limited/.test(s))
      return 93;
    return 90;
  }
  if (
    /tiffin|newmar|entegra|american coach|fleetwood discovery lxe|monaco|holiday rambler|renegade|brinkley|jayco|winnebago/.test(
      s,
    )
  ) {
    if (/tiffin|newmar|entegra|american coach/.test(s)) return 86;
    return 78;
  }
  if (/class a|diesel|pusher|powerglide|spartan/.test(s)) return 72;
  return 65;
}

/**
 * High-line diesel pushers often list L9 450 standard with X15 605 optional.
 * Show base + option when the brochure/live line doesn't already spell it out.
 */
function hpDisplayAndRank(
  engine: string,
  hpStr: string,
  make: string,
  model: string,
  year: string,
): { display: string; raw: number | null; engineDisplay: string } {
  const baseHp = parseNum(hpStr);
  const blob = `${engine} ${hpStr}`.toLowerCase();
  const y = parseInt(year, 10) || 0;
  const mm = `${make} ${model}`.toLowerCase();

  const alreadyDual =
    /\bopt(?:ion(?:al)?)?\b|\bstd\b|\bstandard\b|\/\s*605|605\s*\/|450\s*[–—-]\s*605|450\s*or\s*605/.test(
      blob,
    );

  const highLineDiesel =
    y >= 2018 &&
    y <= 2027 &&
    (/allegro bus|american dream|american eagle|dutch star|anthem|cornerstone|ventana|london aire|mountain aire|discovery lxe|embassy|aspire|phoebe|phoebe|allegro red|phaeton/.test(
      mm,
    ) ||
      /cummins\s*(l9|isl|isx|x12|x15)/i.test(engine));

  const mentions605 = /\b605\b/.test(blob) || /x15/i.test(blob);
  const mentions450 =
    /\b450\b/.test(blob) || /l9|isl\b/i.test(blob) || baseHp === 450;

  let display = hpStr && hpStr !== "—" ? hpStr : "—";
  let engineDisplay = engine && engine !== "—" ? engine : "—";
  let raw = baseHp;

  if (highLineDiesel && !alreadyDual) {
    if (mentions450 && !mentions605 && baseHp != null && baseHp <= 500) {
      display = `${baseHp} HP std · 605 HP opt`;
      if (!/x15|605/i.test(engineDisplay)) {
        engineDisplay = /l9|isl/i.test(engineDisplay)
          ? `${engineDisplay.replace(/\s*$/, "")} (X15 605 opt)`
          : `${engineDisplay} · X15 605 opt`;
      }
      // Rank on standard HP so optional 605 doesn't falsely equalize the set
      raw = baseHp;
    } else if (mentions605 && baseHp != null && baseHp >= 550) {
      // Configured / standard as 605 — note 450 base exists on many peers
      if (!/std|opt|450/.test(blob)) {
        display = `${baseHp} HP (often 450 std · 605 opt on series)`;
      }
      raw = baseHp;
    } else if (baseHp != null && baseHp >= 400 && baseHp <= 500 && highLineDiesel) {
      display = `${baseHp} HP std · 605 HP opt`;
      raw = baseHp;
    }
  }

  // Normalize bare numbers
  if (display !== "—" && !/hp/i.test(display) && baseHp != null) {
    display = `${display} HP`;
  }

  return { display, raw, engineDisplay };
}

/**
 * Live Grok often returns the same 4.6 for every luxury diesel.
 * Force a spread using prestige + power + residual signals so green/red mean something.
 */
function finalizeRatings(
  bases: number[],
  signals: {
    prestige: number;
    hp: number | null;
    tradeIn: number;
    retailHigh: number;
    live: boolean;
  }[],
): number[] {
  const n = bases.length;
  if (n < 2) return bases.map((r) => Math.round(r * 10) / 10);

  const composites = bases.map((base, i) => {
    const s = signals[i]!;
    const hpN = s.hp ?? 400;
    return (
      base * 10 +
      s.prestige * 0.04 +
      hpN / 200 +
      s.tradeIn / 500_000 +
      s.retailHigh / 600_000 +
      (s.live ? 0.05 : 0)
    );
  });

  const ranked = composites
    .map((score, i) => ({ score, i, base: bases[i]! }))
    .sort((a, b) => b.score - a.score);

  const maxB = Math.max(...bases);
  const minB = Math.min(...bases);
  const collapsed = maxB - minB < 0.15;

  const out = bases.map((b) => Math.round(b * 10) / 10);

  if (collapsed) {
    // Distinct tiers centered near the original cluster
    const center = Math.round(((maxB + minB) / 2) * 10) / 10 || 4.5;
    const spreads =
      n === 3 ? [0.3, 0, -0.3] : n === 2 ? [0.2, -0.2] : [0];
    ranked.forEach((r, rank) => {
      const delta = spreads[rank] ?? 0;
      out[r.i] = Math.min(
        5,
        Math.max(3.6, Math.round((center + delta) * 10) / 10),
      );
    });
  } else {
    // Already spread — still break exact ties
    const seen = new Map<string, number>();
    ranked.forEach((r) => {
      let v = out[r.i]!;
      let key = v.toFixed(1);
      while (seen.has(key)) {
        v = Math.min(5, Math.round((v + 0.1) * 10) / 10);
        key = v.toFixed(1);
      }
      seen.set(key, r.i);
      out[r.i] = v;
    });
  }

  // Guarantee highest ≠ lowest when n≥2
  if (n >= 2) {
    const mx = Math.max(...out);
    const mn = Math.min(...out);
    if (mx === mn) {
      out[ranked[0]!.i] = Math.min(5, mx + 0.2);
      out[ranked[ranked.length - 1]!.i] = Math.max(3.6, mn - 0.2);
    }
  }

  return out.map((v) => Math.round(v * 10) / 10);
}

export type LiveMap = Record<string, LiveDossier | null | undefined>;

/** Build structured side-by-side compare matrix (2–3 coaches). Live Grok overlays when present. */
export function buildCompareReport(
  items: RVResult[],
  liveMap?: LiveMap,
): CompareReport {
  const cols = items.slice(0, 3).map((r) => {
    const key = keyOf(r);
    const live = liveMap?.[key] ?? null;
    const baseBrochure = buildBrochureSpecs(
      r.data,
      r.year,
      r.make,
      r.model,
      r.floorplan,
    );
    const guard = resolveHardPowertrain({
      year: r.year,
      make: r.make,
      model: r.model,
      floorplan: r.floorplan,
      catalog: {
        engine: baseBrochure.engine,
        horsepower: baseBrochure.horsepower,
        torque: baseBrochure.torque,
        chassis: baseBrochure.chassis,
        transmission: baseBrochure.transmission,
        fuelType: r.data.fuelType,
        type: r.data.type,
      },
      live: live?.live ? live : null,
    });
    const brochure = mergeLiveIntoDisplay(
      {
        engine: baseBrochure.engine,
        horsepower: baseBrochure.horsepower,
        torque: baseBrochure.torque,
        transmission: baseBrochure.transmission,
        chassis: baseBrochure.chassis,
        hitchOrPin: baseBrochure.hitchOrPin,
        fuelCapacity: baseBrochure.fuelCapacity,
        lengthFt: baseBrochure.lengthFt,
        exteriorWidth: baseBrochure.exteriorWidth,
        exteriorHeight: baseBrochure.exteriorHeight,
        interiorHeight: baseBrochure.interiorHeight,
        gvwr: baseBrochure.gvwr,
        uvw: baseBrochure.uvw,
        ccc: baseBrochure.ccc,
        slideouts: baseBrochure.slideouts,
        sleeps: baseBrochure.sleeps,
        freshWater: baseBrochure.freshWater,
        grayWater: baseBrochure.grayWater,
        blackWater: baseBrochure.blackWater,
        generator: baseBrochure.generator,
        mpgHighway: baseBrochure.mpgHighway,
        warranty: baseBrochure.warranty,
      },
      live?.live ? live : null,
      {
        lockPowertrainFromCatalog: true,
        hardOverride: {
          engine: guard.hard.engine || baseBrochure.engine,
          horsepower:
            formatHardHorsepower(guard.hard.horsepower) ||
            baseBrochure.horsepower,
          torque:
            formatHardTorque(guard.hard.torqueLbFt) || baseBrochure.torque,
          chassis: guard.hard.chassis || baseBrochure.chassis,
          transmission: guard.hard.transmission || baseBrochure.transmission,
        },
      },
    );
    const oem = findOemFloorplanSpec(r.year, r.make, r.model, r.floorplan);
    const catalogMarket = estimateMarket(r.data, r.year, r.floorplan);
    const ladder = liveMarketLadder(live?.live ? live : null);
    const market = ladder
      ? {
          tradeIn: ladder.tradeIn,
          retailLow: ladder.retailLow,
          retailHigh: ladder.retailHigh,
          msrpLo: ladder.msrpLo ?? catalogMarket.msrpLo,
          msrpHi: ladder.msrpHi ?? catalogMarket.msrpHi,
        }
      : {
          tradeIn: catalogMarket.tradeIn,
          retailLow: catalogMarket.retailLow,
          retailHigh: catalogMarket.retailHigh,
          msrpLo: catalogMarket.msrpLo,
          msrpHi: catalogMarket.msrpHi,
        };

    const rawRating =
      live?.ratingEstimate && live.ratingEstimate > 0
        ? live.ratingEstimate
        : ratingFor(r.make, r.model, r.year);

    const typeLabel = live?.rvType || r.data.type;
    const fuelLabel = live?.fuelType || r.data.fuelType;

    const hpMeta = hpDisplayAndRank(
      brochure.engine,
      brochure.horsepower,
      r.make,
      r.model,
      r.year,
    );

    return {
      r,
      brochure: {
        ...brochure,
        engine: hpMeta.engineDisplay,
        horsepower: hpMeta.display,
      },
      hpRaw: hpMeta.raw,
      market,
      rawRating,
      typeLabel,
      fuelLabel,
      live: Boolean(live?.live),
      key,
      prestige: prestigeScore(r.make, r.model),
      layoutNote: oem?.layoutNote || "",
      oemSleeps: oem?.sleeps ?? null,
      oemSlides: oem?.slideouts ?? null,
    };
  });

  const finalRatings = finalizeRatings(
    cols.map((c) => c.rawRating),
    cols.map((c) => ({
      prestige: c.prestige,
      hp: c.hpRaw,
      tradeIn: c.market.tradeIn,
      retailHigh: c.market.retailHigh,
      live: c.live,
    })),
  );

  const colsWithRating = cols.map((c, i) => ({
    ...c,
    rating: finalRatings[i]!,
  }));

  const ratings = colsWithRating.map((c) => c.rating);
  let highestRatingIndex = 0;
  let lowestRatingIndex = 0;
  ratings.forEach((v, i) => {
    if (v > ratings[highestRatingIndex]!) highestRatingIndex = i;
    if (v < ratings[lowestRatingIndex]!) lowestRatingIndex = i;
  });

  const columns: CompareColumn[] = colsWithRating.map(
    ({ r, rating, live, typeLabel, key }) => ({
      key,
      year: r.year,
      make: r.make,
      model: r.model,
      floorplan: r.floorplan,
      type: typeLabel,
      shortTitle: shortTitle(r),
      result: r,
      live,
      rating,
    }),
  );

  const rows: CompareRow[] = [
    row(
      "rating",
      "RVFAX Rating",
      "higher",
      colsWithRating.map((c) => ({
        display: `${c.rating.toFixed(1)} / 5.0`,
        raw: c.rating,
      })),
    ),
    row(
      "type",
      "Class / Type",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.typeLabel,
        raw: null,
      })),
    ),
    row(
      "fuel",
      "Fuel",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.fuelLabel,
        raw: null,
      })),
    ),
    row(
      "engine",
      "Engine",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.engine,
        raw: c.hpRaw,
      })),
    ),
    row(
      "hp",
      "Horsepower",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.horsepower,
        // Rank on standard HP (opt noted in display) so optional 605 doesn't fake a tie
        raw: c.hpRaw,
      })),
    ),
    row(
      "chassis",
      "Chassis",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.chassis,
        raw: null,
      })),
    ),
    row(
      "length",
      "Length",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.lengthFt,
        raw:
          parseRangeMid(c.brochure.lengthFt) ??
          parseNum(c.brochure.lengthFt),
      })),
    ),
    row(
      "gvwr",
      "GVWR",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.gvwr,
        raw: parseRangeMid(c.brochure.gvwr),
      })),
    ),
    row(
      "ccc",
      "Cargo Carrying (CCC)",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.ccc,
        raw: parseNum(c.brochure.ccc),
      })),
    ),
    row(
      "slides",
      "Slideouts",
      "higher",
      colsWithRating.map((c) => ({
        display:
          c.oemSlides != null ? String(c.oemSlides) : c.brochure.slideouts,
        raw: c.oemSlides ?? parseNum(c.brochure.slideouts),
      })),
    ),
    row(
      "sleeps",
      "Sleeps",
      "higher",
      colsWithRating.map((c) => ({
        display: c.oemSleeps != null ? String(c.oemSleeps) : c.brochure.sleeps,
        raw: c.oemSleeps ?? parseNum(c.brochure.sleeps),
      })),
    ),
    row(
      "layout",
      "Layout",
      "neutral",
      colsWithRating.map((c) => ({
        display: unverifiedLayoutLabel(c.layoutNote),
        raw: null,
      })),
    ),
    row(
      "fresh",
      "Fresh Water",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.freshWater,
        raw: parseNum(c.brochure.freshWater),
      })),
    ),
    row(
      "mpg",
      "Highway MPG (est.)",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.mpgHighway,
        raw: parseNum(c.brochure.mpgHighway),
      })),
    ),
    row(
      "tow",
      "Tow / Hitch",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.hitchOrPin,
        raw: parseNum(c.brochure.hitchOrPin),
      })),
    ),
    row(
      "gen",
      "Generator",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.generator,
        raw: parseNum(c.brochure.generator),
      })),
    ),
    row(
      "warranty",
      "Warranty",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.warranty,
        raw: c.r.data.warrantyYears || parseNum(c.brochure.warranty),
      })),
    ),
    row(
      "trade",
      "Trade-in (est.)",
      "higher",
      colsWithRating.map((c) => ({
        display: formatMoney(c.market.tradeIn),
        raw: c.market.tradeIn,
      })),
    ),
    row(
      "retailLo",
      "Retail Low (est.)",
      "lower",
      colsWithRating.map((c) => ({
        display: formatMoney(c.market.retailLow),
        raw: c.market.retailLow,
      })),
    ),
    row(
      "retailHi",
      "Retail High (est.)",
      "lower",
      colsWithRating.map((c) => ({
        display: formatMoney(c.market.retailHigh),
        raw: c.market.retailHigh,
      })),
    ),
    row(
      "msrp",
      "When-new MSRP ref.",
      "neutral",
      colsWithRating.map((c) => ({
        display: `${formatMoney(c.r.data.msrpRange[0])}–${formatMoney(c.r.data.msrpRange[1])}`,
        raw: (c.r.data.msrpRange[0] + c.r.data.msrpRange[1]) / 2,
      })),
    ),
  ];

  return {
    columns,
    rows,
    generatedAt: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    highestRatingIndex,
    lowestRatingIndex,
    liveCount: colsWithRating.filter((c) => c.live).length,
  };
}
