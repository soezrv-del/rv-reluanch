/**
 * Server-side report lookup for Open Graph tags and the OG image.
 * Not imported by client screens.
 */

import { getSpec } from "./catalog.ts";
import { ensureCatalogLoaded } from "./catalogLoad.ts";
import {
  LOT_SNAPSHOT_URL,
  parseLotSnapshotJson,
  type LotSnapshotView,
} from "../lot/ownLotPage.ts";
import {
  buildFactsShareReport,
  buildUnitShareReport,
  findLotUnit,
  plainQueryText,
  reportDescription,
  type ShareReport,
} from "./shareReport.ts";

export type ReportOgMeta = {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
};

let lotCache: LotSnapshotView | null = null;

async function loadLot(origin: string): Promise<LotSnapshotView> {
  if (lotCache) return lotCache;
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const raw = await readFile(
      join(process.cwd(), "public/inventory/own-lot-latest.json"),
      "utf8",
    );
    lotCache = parseLotSnapshotJson(JSON.parse(raw));
    return lotCache;
  } catch {
    const res = await fetch(new URL(LOT_SNAPSHOT_URL, origin), {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error("lot snapshot");
    lotCache = parseLotSnapshotJson(await res.json());
    return lotCache;
  }
}

export async function loadReportForUrl(url: URL): Promise<ShareReport | null> {
  const kind = url.searchParams.get("kind");
  if (url.pathname === "/report/facts" || kind === "facts") {
    const year = plainQueryText(url.searchParams.get("year"));
    const make = plainQueryText(url.searchParams.get("make"));
    const series = plainQueryText(url.searchParams.get("series"));
    const floorplan = plainQueryText(url.searchParams.get("floorplan"));
    if (!year || !make || !series) return null;
    await ensureCatalogLoaded();
    const spec = getSpec(make, series);
    if (!spec) return null;
    return buildFactsShareReport({ year, make, series, floorplan, spec });
  }
  const unitMatch = url.pathname.match(/^\/report\/unit\/([^/]+)\/?$/);
  const id =
    unitMatch?.[1] ?? (kind === "unit" ? url.searchParams.get("id") ?? "" : "");
  if (!id) return null;
  const snap = await loadLot(url.origin);
  const unit = findLotUnit(snap.units, id);
  if (!unit) return null;
  return buildUnitShareReport(unit);
}

export function ogImagePath(report: ShareReport): string {
  if (report.kind === "facts") {
    const params = new URLSearchParams();
    params.set("kind", "facts");
    const page = new URL(report.path, "https://rvmax.app");
    for (const key of ["year", "make", "series", "floorplan"]) {
      const value = page.searchParams.get(key);
      if (value) params.set(key, value);
    }
    return `/api/og/report?${params.toString()}`;
  }
  const id = report.path.split("/").pop() ?? "";
  return `/api/og/report?kind=unit&id=${encodeURIComponent(id)}`;
}

export async function metaForReportUrl(url: URL): Promise<ReportOgMeta | null> {
  if (!url.pathname.startsWith("/report")) return null;
  const report = await loadReportForUrl(url);
  if (!report) return null;
  return {
    title: report.title,
    description: reportDescription(report),
    image: new URL(ogImagePath(report), url.origin).href,
    url: new URL(report.path, url.origin).href,
    siteName: "RvFAX",
  };
}
