/**
 * Catalog inventory for per-type torque-to-weight scores.
 *
 * Only published numeric torque + published numeric GVWR (series, year-band,
 * or OEM floorplan pin). Never invent from weightRange mid / UVW / HP.
 * Towables are N/A. Motorized missing either field is GAP.
 */

import { findOemGvwrLbs } from "./floorplanSpecs.ts";
import {
  computeTorqueToWeight,
  isTowableForTorqueRating,
  type TorqueScoreFormula,
  type TorqueToWeightResult,
} from "./torqueToWeight.ts";
import type { PowertrainYearBand, RVSpec } from "./rvTypes.ts";

export type CatalogTorqueScoreRow = {
  make: string;
  model: string;
  rvType: string;
  fuelType: string;
  formula: TorqueScoreFormula;
  torqueLbFt: number;
  gvwrLbs: number;
  ratio: number;
  score: number;
  color: NonNullable<TorqueToWeightResult["color"]>;
  source: string;
  yearFrom?: number;
  yearTo?: number;
  floorplan?: string;
};

export type CatalogTorqueGapRow = {
  make: string;
  model: string;
  rvType: string;
  missingTorque: boolean;
  missingGvwr: boolean;
};

export type CatalogTorqueScoreReport = {
  scored: CatalogTorqueScoreRow[];
  gaps: CatalogTorqueGapRow[];
  naTowable: number;
  motorized: number;
  countsByFormula: Record<TorqueScoreFormula, number>;
  gapMissingTorque: number;
  gapMissingGvwr: number;
  gapMissingBoth: number;
};

function positive(n: number | null | undefined): number | null {
  return n != null && Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function yearsForSpec(spec: RVSpec): number[] {
  const years = new Set<number>();
  if (spec.floorplansByYear) {
    for (const key of Object.keys(spec.floorplansByYear)) {
      const y = Number(key);
      if (Number.isFinite(y)) years.add(y);
    }
  }
  const start = spec.yearStart ?? (years.size ? Math.min(...years) : undefined);
  const end = spec.yearEnd ?? (years.size ? Math.max(...years) : undefined);
  if (start != null && end != null) {
    for (let y = start; y <= end; y++) years.add(y);
  }
  return [...years].sort((a, b) => a - b);
}

function bandCoversYear(band: PowertrainYearBand, year: number): boolean {
  return year >= band.from && year <= band.to;
}

function matchingBands(
  spec: RVSpec,
  year: number,
  floorplan?: string,
): PowertrainYearBand[] {
  const fp = floorplan?.trim().toUpperCase();
  return (spec.powertrainByYear ?? []).filter((b) => {
    if (!bandCoversYear(b, year)) return false;
    if (b.floorplans?.length) {
      if (!fp) return false;
      return b.floorplans.some((p) => p.toUpperCase() === fp);
    }
    if (b.excludeFloorplans?.length && fp) {
      if (b.excludeFloorplans.some((p) => p.toUpperCase() === fp)) return false;
    }
    return true;
  });
}

/**
 * Year-true torque only. If a band covers the year and torque is
 * unprinted, return null — do not copy a later series default backward.
 */
function torqueForYear(spec: RVSpec, year: number, floorplan?: string): number | null {
  const matching = matchingBands(spec, year, floorplan);
  if (matching.length) {
    for (const b of matching) {
      const t = positive(b.torqueLbFt);
      if (t != null) return t;
    }
    return null;
  }
  return positive(spec.torqueLbFt);
}

function rowKey(row: Pick<CatalogTorqueScoreRow, "make" | "model" | "torqueLbFt" | "gvwrLbs" | "formula">): string {
  return [row.make, row.model, row.formula, row.torqueLbFt, row.gvwrLbs].join("|");
}

function scoreRow(
  make: string,
  model: string,
  spec: RVSpec,
  torqueLbFt: number,
  gvwrLbs: number,
  source: string,
  extras?: { yearFrom?: number; yearTo?: number; floorplan?: string; type?: string; fuel?: string; chassis?: string; engine?: string },
): CatalogTorqueScoreRow | null {
  const result = computeTorqueToWeight({
    torqueLbFt,
    gvwrLbs,
    rvType: extras?.type ?? spec.type,
    fuelType: extras?.fuel ?? spec.fuelType,
    chassis: extras?.chassis ?? spec.chassis,
    engine: extras?.engine ?? spec.engine,
  });
  if (result.na || result.score == null || result.ratio == null || result.color == null || result.formula == null) {
    return null;
  }
  return {
    make,
    model,
    rvType: extras?.type ?? spec.type,
    fuelType: extras?.fuel ?? spec.fuelType,
    formula: result.formula,
    torqueLbFt,
    gvwrLbs,
    ratio: result.ratio,
    score: result.score,
    color: result.color,
    source,
    yearFrom: extras?.yearFrom,
    yearTo: extras?.yearTo,
    floorplan: extras?.floorplan,
  };
}

/**
 * Every catalog coach that has published torque + published GVWR, scored
 * with the live per-type formula. GAP rows are motorized models missing
 * one or both fields (no invented weightRange / UVW).
 */
export function listCatalogTorqueToWeightScores(
  data: Record<string, Record<string, RVSpec>>,
): CatalogTorqueScoreReport {
  const scored: CatalogTorqueScoreRow[] = [];
  const seen = new Set<string>();
  const gaps: CatalogTorqueGapRow[] = [];
  let naTowable = 0;
  let motorized = 0;

  const push = (row: CatalogTorqueScoreRow | null) => {
    if (!row) return;
    const key = rowKey(row);
    if (seen.has(key)) return;
    seen.add(key);
    scored.push(row);
  };

  for (const [make, models] of Object.entries(data)) {
    for (const [model, spec] of Object.entries(models)) {
      if (isTowableForTorqueRating(spec.type, spec.fuelType)) {
        naTowable += 1;
        continue;
      }
      motorized += 1;

      const seriesTorque = positive(spec.torqueLbFt);
      const seriesGvwr = positive(spec.gvwrLbs);
      let publishedTorque = seriesTorque != null;
      let publishedGvwr = seriesGvwr != null;

      if (seriesTorque != null && seriesGvwr != null) {
        push(
          scoreRow(make, model, spec, seriesTorque, seriesGvwr, "series"),
        );
      }

      for (const band of spec.powertrainByYear ?? []) {
        const t = positive(band.torqueLbFt);
        const g = positive(band.gvwrLbs);
        if (t != null) publishedTorque = true;
        if (g != null) publishedGvwr = true;
        // Same-band pair only. Do not backfill series torque onto an
        // older GVWR (or the reverse) — that invents a year-true combo.
        if (t == null || g == null) continue;
        const fps = band.floorplans?.length ? band.floorplans : [undefined];
        for (const fp of fps) {
          push(
            scoreRow(make, model, spec, t, g, `year-band ${band.from}–${band.to}`, {
              yearFrom: band.from,
              yearTo: band.to,
              floorplan: fp,
              type: band.type ?? spec.type,
              fuel: band.fuelType ?? spec.fuelType,
              chassis: band.chassis ?? spec.chassis,
              engine: band.engine ?? spec.engine,
            }),
          );
        }
      }

      const years = yearsForSpec(spec);
      const floorplans = new Set<string>(spec.floorplans ?? []);
      if (spec.floorplansByYear) {
        for (const list of Object.values(spec.floorplansByYear)) {
          for (const fp of list) floorplans.add(fp);
        }
      }
      for (const year of years) {
        for (const fp of floorplans) {
          const oem = findOemGvwrLbs(year, make, model, fp);
          if (oem == null) continue;
          publishedGvwr = true;
          const torque = torqueForYear(spec, year, fp);
          if (torque == null) continue;
          push(
            scoreRow(make, model, spec, torque, oem, `oem-pin ${year} ${fp}`, {
              yearFrom: year,
              yearTo: year,
              floorplan: fp,
            }),
          );
        }
      }

      const anyScored = scored.some((r) => r.make === make && r.model === model);
      if (!anyScored) {
        const missingTorque = !publishedTorque;
        const missingGvwr = !publishedGvwr;
        gaps.push({
          make,
          model,
          rvType: spec.type,
          missingTorque,
          missingGvwr,
        });
      }
    }
  }

  scored.sort((a, b) => {
    const f = a.formula.localeCompare(b.formula);
    if (f) return f;
    const m = a.make.localeCompare(b.make);
    if (m) return m;
    const md = a.model.localeCompare(b.model);
    if (md) return md;
    return b.score - a.score;
  });

  const countsByFormula: Record<TorqueScoreFormula, number> = {
    "class-a-diesel": 0,
    "class-a-gas": 0,
    "super-c": 0,
    "class-c": 0,
    global: 0,
  };
  const modelsByFormula = new Set<string>();
  for (const row of scored) {
    const key = `${row.formula}|${row.make}|${row.model}`;
    if (modelsByFormula.has(key)) continue;
    modelsByFormula.add(key);
    countsByFormula[row.formula] += 1;
  }

  return {
    scored,
    gaps,
    naTowable,
    motorized,
    countsByFormula,
    gapMissingTorque: gaps.filter((g) => g.missingTorque && !g.missingGvwr).length,
    gapMissingGvwr: gaps.filter((g) => g.missingGvwr && !g.missingTorque).length,
    gapMissingBoth: gaps.filter((g) => g.missingTorque && g.missingGvwr).length,
  };
}

export function formatCatalogTorqueScoreMarkdown(
  report: CatalogTorqueScoreReport,
): string {
  const groups: TorqueScoreFormula[] = [
    "class-a-diesel",
    "class-a-gas",
    "super-c",
    "class-c",
    "global",
  ];
  const labels: Record<TorqueScoreFormula, string> = {
    "class-a-diesel": "Class A Diesel (R* 38.2)",
    "class-a-gas": "Class A Gas (R* 26.0)",
    "super-c": "Super C (R* 43.2)",
    "class-c": "Class C (R* 38.6)",
    global: "Global fallback (Class B / unknown)",
  };

  const lines: string[] = [
    "# Per-type torque-to-weight catalog scores",
    "",
    "Published torque + published GVWR only. Missing either field is GAP. Towables are N/A.",
    "",
    `| Formula | Models with both fields |`,
    `|---------|-------------------------|`,
    ...groups.map(
      (f) => `| ${labels[f]} | ${report.countsByFormula[f]} |`,
    ),
    `| GAP missing torque only | ${report.gapMissingTorque} |`,
    `| GAP missing GVWR only | ${report.gapMissingGvwr} |`,
    `| GAP missing both | ${report.gapMissingBoth} |`,
    `| Towable N/A | ${report.naTowable} |`,
    `| Motorized models | ${report.motorized} |`,
    "",
  ];

  for (const formula of groups) {
    const rows = report.scored.filter((r) => r.formula === formula);
    if (!rows.length) continue;
    lines.push(`## ${labels[formula]}`, "");
    lines.push(
      "| Make | Model | Plan / source | Torque | GVWR | r | Score | Color |",
    );
    lines.push("|---|---|---|---:|---:|---:|---:|---|");
    for (const r of rows) {
      const plan = [r.floorplan, r.source].filter(Boolean).join(" · ");
      lines.push(
        `| ${r.make} | ${r.model} | ${plan} | ${r.torqueLbFt} | ${r.gvwrLbs.toLocaleString()} | ${r.ratio.toFixed(1)} | ${r.score.toFixed(1)} | ${r.color} |`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}
