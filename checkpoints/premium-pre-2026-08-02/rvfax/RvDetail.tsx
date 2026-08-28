import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Heart,
  Info,
  Loader2,
  Printer,
  Sparkles,
} from "lucide-react";
import type { RVResult } from "@/lib/rv/catalog";
import {
  estimateMarket,
  formatMoney,
  getFloorplansForYear,
  ratingFor,
} from "@/lib/rv/catalog";
import { buildBrochureSpecs } from "@/lib/rv/brochureSpecs";
import { getMaintenanceSchedule } from "@/lib/rv/rvData";
import {
  fetchLiveDossier,
  liveMarketLadder,
  mergeLiveIntoDisplay,
  type LiveDossier,
} from "@/lib/rv/liveDossier";
import { fetchRecallsViaApi } from "@/lib/nhtsa/recalls";
import type { NhtsaComplaint, NhtsaRecall } from "@/lib/nhtsa/recalls";
import { buildReportId, valueFactors } from "@/lib/rv/reportMeta";
import { exportVehicleReport } from "@/lib/rv/exportReport";
import { SHARED_PRESTIGE_BACKDROP, RV_CARD_MEDIA } from "@/assets/backdrops";
import { cn } from "@/lib/utils";

/**
 * Vehicle History Report — catalog paints instantly; Live Grok updates in place.
 */
export function RvDetail({
  result,
  onBack,
  saved,
  onToggleSave,
  onAskGrok,
}: {
  result: RVResult;
  onBack: () => void;
  saved: boolean;
  onToggleSave: () => void;
  onAskGrok: () => void;
}) {
  const { data, year, make, model, floorplan } = result;
  const catalogMarket = estimateMarket(data, year, floorplan);
  const rating = ratingFor(make, model, year);
  const brochure = useMemo(
    () => buildBrochureSpecs(data, year, make, model, floorplan || ""),
    [data, year, make, model, floorplan],
  );
  const yearFloorplans = useMemo(
    () => getFloorplansForYear(year, make, model),
    [year, make, model],
  );
  const maintenance = useMemo(() => getMaintenanceSchedule(data), [data]);

  const reportId = useMemo(
    () => buildReportId(year, make, model),
    [year, make, model],
  );
  const generatedAt = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  const [liveRecalls, setLiveRecalls] = useState<NhtsaRecall[]>([]);
  const [liveDefects, setLiveDefects] = useState<NhtsaComplaint[]>([]);
  const [recallSearchNote, setRecallSearchNote] = useState<string | null>(null);
  const [recallLoading, setRecallLoading] = useState(true);
  const [recallError, setRecallError] = useState<string | null>(null);

  const [live, setLive] = useState<LiveDossier | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveRetry, setLiveRetry] = useState(0);

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [openMaint, setOpenMaint] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setRecallLoading(true);
    setRecallError(null);
    setRecallSearchNote(null);
    fetchRecallsViaApi(year, make, model, ctrl.signal).then((res) => {
      if (ctrl.signal.aborted) return;
      if (!res.ok) {
        if (res.aborted) return;
        setRecallError(res.error);
        setLiveRecalls([]);
        setLiveDefects([]);
        setRecallLoading(false);
        return;
      }
      setLiveRecalls(res.data.recalls);
      setLiveDefects(res.data.defects ?? []);
      setRecallSearchNote(res.data.searchNote ?? null);
      setRecallLoading(false);
    });
    return () => ctrl.abort();
  }, [year, make, model]);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    setLiveLoading(true);
    setLiveError(null);
    setLive(null);

    fetchLiveDossier(year, make, model, floorplan, ctrl.signal)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          if (res.aborted) return;
          setLiveError(res.error);
          setLive(null);
          return;
        }
        setLive(res.data);
        setLiveError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLiveError(e instanceof Error ? e.message : "Live lookup failed");
        setLive(null);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [year, make, model, floorplan, liveRetry]);

  // Instant catalog brochure → live Grok overwrites fields when ready
  const catalogSpecs = useMemo(
    () => ({
      engine: brochure.engine,
      horsepower: brochure.horsepower,
      torque: brochure.torque,
      transmission: brochure.transmission,
      chassis: brochure.chassis,
      hitchOrPin: brochure.hitchOrPin,
      fuelCapacity: brochure.fuelCapacity,
      lengthFt: brochure.lengthFt,
      exteriorWidth: brochure.exteriorWidth,
      exteriorHeight: brochure.exteriorHeight,
      interiorHeight: brochure.interiorHeight,
      gvwr: brochure.gvwr,
      uvw: brochure.uvw,
      ccc: brochure.ccc,
      slideouts: brochure.slideouts,
      sleeps: brochure.sleeps,
      freshWater: brochure.freshWater,
      grayWater: brochure.grayWater,
      blackWater: brochure.blackWater,
      generator: brochure.generator,
      mpgHighway: brochure.mpgHighway,
      warranty: brochure.warranty,
    }),
    [brochure],
  );

  const specs = useMemo(
    () => mergeLiveIntoDisplay(catalogSpecs, live?.live ? live : null),
    [catalogSpecs, live],
  );

  const isEstimate = !live?.live;

  const displayRating =
    live?.live && live.ratingEstimate && live.ratingEstimate > 0
      ? live.ratingEstimate
      : rating;

  const liveLadder = liveMarketLadder(live?.live ? live : null);
  // Catalog market instantly; live ladder replaces when ready
  const market = liveLadder
    ? {
        tradeIn: liveLadder.tradeIn,
        retailLow: liveLadder.retailLow,
        retailHigh: liveLadder.retailHigh,
        msrpLo: liveLadder.msrpLo ?? catalogMarket.msrpLo,
        msrpHi: liveLadder.msrpHi ?? catalogMarket.msrpHi,
        segment: catalogMarket.segment,
        ageYears: catalogMarket.ageYears,
      }
    : catalogMarket;
  const marketIsLive = Boolean(liveLadder);

  const displayType = (live?.live && live.rvType) || data.type;
  const displayFuel = (live?.live && live.fuelType) || data.fuelType;

  const recallCount = recallLoading
    ? data.recalls
    : liveRecalls.length || data.recalls;

  const factors = useMemo(
    () =>
      valueFactors(
        market,
        displayRating,
        recallLoading ? 0 : liveRecalls.length,
        data.warrantyYears,
      ),
    [market, displayRating, recallLoading, liveRecalls.length, data.warrantyYears],
  );

  const floorplansShown = useMemo(() => {
    if (live?.live && live.floorplansThisYear?.length)
      return live.floorplansThisYear;
    if (yearFloorplans.length) return yearFloorplans;
    return data.floorplans || [];
  }, [live, yearFloorplans, data.floorplans]);

  const overviewText =
    (live?.live && live.overview) || data.description || null;

  const exportPdf = async () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg("Preparing PDF…");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const res = await exportVehicleReport({
        reportElementId: "rvfax-vehicle-report",
        title: `RVFAX · ${year} ${make} ${model}${floorplan ? ` ${floorplan}` : ""}`,
        subtitle: `Vehicle History Report · ${reportId} · ${generatedAt}`,
        filenameBase: `RVFAX-${year}-${make}-${model}`.replace(/\s+/g, "-"),
      });
      if (!res.ok) setExportMsg(res.error);
      else if (res.method === "share")
        setExportMsg("Shared — pick Print or Save to Files for PDF");
      else if (res.method === "print")
        setExportMsg("Print dialog opened — choose Save as PDF");
      else if (res.method === "preview")
        setExportMsg("Preview open — tap Save as PDF / Print");
      else setExportMsg("Report downloaded — open it and Print → PDF");
    } catch (e) {
      setExportMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExportBusy(false);
    }
  };

  const confNote =
    live?.live && live.sourcesNote
      ? live.sourcesNote
      : liveLoading
        ? "Showing catalog now — Live Grok is refining specs & market in the background."
        : liveError
          ? `Live update failed (${liveError}). Catalog estimates remain — tap Retry.`
          : "Catalog estimates on screen. Tap Retry to refresh with Live Grok.";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg text-white">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={SHARED_PRESTIGE_BACKDROP}
          alt=""
          className="absolute inset-0 size-full object-cover object-center brightness-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/88" />
      </div>

      <div
        data-app-scroll
        data-rvfax-scroll
        className="rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        <div
          id="rvfax-vehicle-report"
          className="mx-auto w-full max-w-lg space-y-3 px-3 pb-28 pt-3 sm:px-4"
        >
          {/* Top actions */}
          <div className="flex flex-wrap items-center justify-between gap-2" data-no-export>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleSave}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold",
                  saved
                    ? "border-ruby/50 bg-ruby/25 text-white"
                    : "border-white/20 bg-black/40 text-white",
                )}
              >
                <Heart className={cn("size-3.5", saved && "fill-current")} />
                Save
              </button>
              <button
                type="button"
                onClick={() => void exportPdf()}
                disabled={exportBusy}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {exportBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Printer className="size-3.5" />
                )}
                PDF
              </button>
              <button
                type="button"
                onClick={onAskGrok}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/25 px-3 py-1.5 text-[12px] font-bold text-white"
              >
                <Sparkles className="size-3.5 text-blue" />
                Ask Grok
              </button>
            </div>
          </div>
          {exportMsg ? (
            <p className="text-center text-[11px] text-blue" data-no-export>
              {exportMsg}
            </p>
          ) : null}

          {/* Report header */}
          <section className="glass-prestige rounded-[1.15rem] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-black tracking-wide text-black">
                    RVFAX
                  </span>
                  <p className="text-[13px] font-bold text-white">
                    Vehicle History Report
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-white/70">{generatedAt}</p>
              </div>
              <p className="font-mono text-[10px] text-white/55">{reportId}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatTile
                label="NHTSA recalls"
                value={
                  recallLoading
                    ? "Checking…"
                    : recallCount > 0
                      ? `${recallCount} on record`
                      : "None found"
                }
                warn={!recallLoading && recallCount > 0}
                ok={!recallLoading && recallCount === 0}
              />
              <StatTile
                label="Service schedule"
                value={`${maintenance.length} tasks`}
              />
              <StatTile label="Use / Class" value={displayType} />
              <StatTile
                label="Data source"
                value={
                  liveLoading
                    ? "Catalog · updating…"
                    : live?.live
                      ? `Live Grok · ${live.confidence}`
                      : "Catalog estimate"
                }
                accent={!!live?.live}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/75">
              Instant catalog report first, then Live Grok refreshes powertrain,
              tanks, and market when ready. Always confirm door sticker and a
              PPI.
            </p>
          </section>

          {/* Overview */}
          <section className="glass-prestige rounded-[1.15rem] p-3.5">
            <p className="text-[11px] font-bold tracking-wide text-white/70">
              Vehicle Overview
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-blue">{year}</p>
                <h1 className="text-[22px] font-bold leading-tight text-white">
                  {make} {model}
                </h1>
                {floorplan ? (
                  <p className="mt-0.5 text-[13px] text-white/80">
                    Floorplan: {floorplan}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip>{displayType}</Chip>
                  {recallLoading ? (
                    <Chip>Checking recalls…</Chip>
                  ) : recallCount > 0 ? (
                    <Chip tone="ruby">
                      <AlertTriangle className="size-3" /> {recallCount}{" "}
                      Recalls
                    </Chip>
                  ) : (
                    <Chip tone="green">No open recalls</Chip>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[28px] font-bold tabular-nums leading-none text-blue">
                  {displayRating.toFixed(1)}
                </p>
                <p className="mt-1 text-[9px] font-bold tracking-wide text-amber">
                  ★★★★☆
                </p>
                <p className="text-[9px] font-bold tracking-wide text-white/60">
                  RVFAX RATING
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <MiniStat label="LENGTH" value={specs.lengthFt || "—"} />
              <MiniStat label="SLIDEOUTS" value={specs.slideouts || "—"} />
              <MiniStat label="SLEEPS" value={specs.sleeps || "—"} />
              <MiniStat
                label="NHTSA"
                value={
                  recallLoading
                    ? "…"
                    : recallCount > 0
                      ? String(recallCount)
                      : "0"
                }
                warn={recallCount > 0}
              />
            </div>

            {liveLoading ? (
              <p className="mt-3 flex items-center gap-2 text-[12px] text-sky-200/95">
                <Loader2 className="size-3.5 animate-spin" />
                Catalog on screen — Live Grok updating specs & market…
              </p>
            ) : null}
            {!liveLoading && isEstimate ? (
              <p className="mt-3 text-[12px] text-amber">
                Showing catalog estimates
                {liveError ? ` · live failed: ${liveError}` : ""}. Tap Retry live
                to refresh.
              </p>
            ) : null}
            {live?.live ? (
              <p className="mt-3 text-[12px] font-semibold text-emerald-300">
                Live Grok applied · confidence {live.confidence}
              </p>
            ) : null}

            {overviewText ? (
              <p className="mt-2 border-l-2 border-blue/50 pl-3 text-[13.5px] leading-relaxed text-white">
                {overviewText}
              </p>
            ) : null}

            {live?.live && live.keyFeatures?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {live.keyFeatures.slice(0, 6).map((f) => (
                  <Chip key={f}>{f}</Chip>
                ))}
              </div>
            ) : null}
          </section>

          {/* Confidence banner */}
          <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/40 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-emerald-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="font-bold tracking-wide text-emerald-200">
                  {liveLoading
                    ? "LIVE GROK · UPDATING"
                    : live?.live
                      ? `LIVE GROK · ${(live.confidence || "—").toUpperCase()}`
                      : "CATALOG · LIVE OPTIONAL"}
                </span>
                {" · "}
                {confNote}
              </span>
              {!liveLoading && !live?.live ? (
                <button
                  type="button"
                  onClick={() => setLiveRetry((n) => n + 1)}
                  className="shrink-0 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-50"
                >
                  Retry live
                </button>
              ) : null}
            </div>
          </div>

          {/* Market — catalog now, live when ready */}
          <section className="glass-prestige rounded-[1.15rem] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.14em] text-gold">
                ↗ MARKET VALUE
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  marketIsLive
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                    : "border-gold/35 bg-gold/10 text-gold-bright",
                )}
              >
                {liveLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Catalog · updating
                  </>
                ) : marketIsLive ? (
                  "Live Grok · Market"
                ) : (
                  "Catalog estimate"
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MarketTile
                label="TRADE-IN"
                value={formatMoney(market.tradeIn)}
                sub="Dealer trade"
              />
              <MarketTile
                label="RETAIL LOW"
                value={formatMoney(market.retailLow)}
                sub="Private party"
              />
              <MarketTile
                label="RETAIL HIGH"
                value={formatMoney(market.retailHigh)}
                sub="Dealer asking"
              />
            </div>
            {factors.length ? (
              <ul className="mt-2 space-y-1">
                {factors.map((f) => (
                  <li
                    key={f.label}
                    className={cn(
                      "text-[11px]",
                      f.positive ? "text-emerald-200" : "text-amber",
                    )}
                  >
                    {f.positive ? "↑" : "↓"} {f.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {/* Specs */}
          <Section title="Vehicle Specifications">
            <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-white/55">
              IDENTITY & DIMENSIONS
            </p>
            <SpecRow label="TYPE" value={displayType} />
            <SpecRow label="YEAR" value={year} />
            <SpecRow label="LENGTH" value={specs.lengthFt} accent />
            <SpecRow label="WIDTH" value={specs.exteriorWidth} />
            <SpecRow label="HEIGHT" value={specs.exteriorHeight} />
            <SpecRow label="CEILING" value={specs.interiorHeight} />
            <SpecRow label="SLIDEOUTS" value={specs.slideouts} />
            <SpecRow label="SLEEPS" value={specs.sleeps} />

            <p className="mb-2 mt-4 text-[10px] font-bold tracking-[0.12em] text-white/55">
              POWERTRAIN & CHASSIS
            </p>
            <SpecRow label="FUEL" value={displayFuel} />
            <SpecRow label="ENGINE" value={specs.engine} accent />
            <SpecRow label="HORSEPOWER" value={specs.horsepower} accent />
            <SpecRow label="TORQUE" value={specs.torque} />
            <SpecRow label="TRANSMISSION" value={specs.transmission} />
            <SpecRow label="CHASSIS" value={specs.chassis} accent />
            <SpecRow label="TOW CAPACITY" value={specs.hitchOrPin} />
            <SpecRow label="GENERATOR" value={specs.generator} />
            <SpecRow
              label="HIGHWAY MPG"
              value={
                specs.mpgHighway
                  ? `${specs.mpgHighway}${/est/i.test(specs.mpgHighway) ? "" : " EST."}`
                  : "—"
              }
            />
            <SpecRow label="FUEL CAPACITY" value={specs.fuelCapacity} />

            <p className="mb-2 mt-4 text-[10px] font-bold tracking-[0.12em] text-white/55">
              WEIGHTS & RATING
            </p>
            <SpecRow label="GVWR" value={specs.gvwr} accent />
            <SpecRow label="UVW" value={specs.uvw} />
            <SpecRow label="CCC" value={specs.ccc} />
            <SpecRow label="WARRANTY" value={specs.warranty} />

            <p className="mb-2 mt-4 text-[10px] font-bold tracking-[0.12em] text-white/55">
              TANKS
            </p>
            <SpecRow label="FRESH WATER" value={specs.freshWater} />
            <SpecRow label="GRAY WATER" value={specs.grayWater} />
            <SpecRow label="BLACK WATER" value={specs.blackWater} />
          </Section>

          {floorplansShown.length ? (
            <Section title="Floorplans this year">
              <div className="flex flex-wrap gap-1.5">
                {floorplansShown.map((fp) => (
                  <Chip
                    key={fp}
                    tone={
                      floorplan &&
                      fp.toLowerCase() === floorplan.toLowerCase()
                        ? "blue"
                        : undefined
                    }
                  >
                    {fp}
                  </Chip>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Reliability from live */}
          {live?.live &&
          (live.reliabilitySummary ||
            live.commonIssues?.length ||
            live.servicePriorities?.length) ? (
            <Section title="Reliability & ownership">
              {live.reliabilitySummary ? (
                <p className="text-[13px] leading-relaxed text-white/90">
                  {live.reliabilitySummary}
                </p>
              ) : null}
              {live.commonIssues?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {live.commonIssues.map((x) => (
                    <li
                      key={x}
                      className="flex gap-2 text-[12px] text-white/85"
                    >
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber" />
                      {x}
                    </li>
                  ))}
                </ul>
              ) : null}
              {live.servicePriorities?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {live.servicePriorities.map((x) => (
                    <li
                      key={x}
                      className="flex gap-2 text-[12px] text-white/85"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                      {x}
                    </li>
                  ))}
                </ul>
              ) : null}
              {live.ownerSentiment ? (
                <p className="mt-2 text-[12px] italic text-white/70">
                  {live.ownerSentiment}
                </p>
              ) : null}
            </Section>
          ) : null}

          {/* NHTSA */}
          <Section title="NHTSA safety">
            {recallLoading ? (
              <p className="flex items-center gap-2 text-[13px] text-white/70">
                <Loader2 className="size-4 animate-spin" /> Loading recalls
                from NHTSA…
              </p>
            ) : recallError ? (
              <p className="text-[12px] text-amber">{recallError}</p>
            ) : liveRecalls.length === 0 ? (
              <div className="space-y-2">
                <p className="text-[13px] text-emerald-200">
                  No campaigns matched after exact + broader manufacturer
                  search for this year/make/model.
                </p>
                {recallSearchNote ? (
                  <p className="text-[11px] leading-relaxed text-white/60">
                    {recallSearchNote}
                  </p>
                ) : null}
                <a
                  href="https://www.nhtsa.gov/recalls"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue"
                >
                  Search nhtsa.gov <ExternalLink className="size-3" />
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-ruby">
                  {liveRecalls.length} NHTSA campaign
                  {liveRecalls.length === 1 ? "" : "s"} on record
                </p>
                {recallSearchNote ? (
                  <p className="text-[11px] text-white/55">{recallSearchNote}</p>
                ) : null}
                <ul className="space-y-2">
                  {liveRecalls.map((r, i) => (
                    <li
                      key={`${r.campaignNumber || i}-${i}`}
                      className="rounded-xl border border-ruby/30 bg-ruby/10 px-3 py-2"
                    >
                      <p className="text-[12px] font-bold text-white">
                        {r.component || "Recall"}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-white/80">
                        {r.summary ||
                          r.consequence ||
                          "See NHTSA for details."}
                      </p>
                      {r.campaignNumber ? (
                        <p className="mt-1 font-mono text-[10px] text-white/55">
                          Campaign {r.campaignNumber}
                        </p>
                      ) : null}
                      {r.remedy ? (
                        <p className="mt-1 text-[10px] text-emerald-200/90">
                          Remedy: {r.remedy}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.nhtsa.gov/recalls"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue"
                >
                  Verify on nhtsa.gov <ExternalLink className="size-3" />
                </a>
              </div>
            )}

            {liveDefects.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-bold tracking-wide text-white/55">
                  OWNER COMPLAINTS (sample)
                </p>
                <ul className="space-y-1.5">
                  {liveDefects.slice(0, 8).map((d, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[11px] text-white/80"
                    >
                      <span className="font-semibold text-white">
                        {d.component || "Complaint"}
                      </span>
                      {d.summary ? ` — ${d.summary}` : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          {maintenance.length ? (
            <section className="glass-prestige rounded-[1.15rem] p-3.5">
              <button
                type="button"
                onClick={() => setOpenMaint((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white">
                  <FileText className="size-3.5 text-amber" />
                  MAINTENANCE SCHEDULE ({maintenance.length})
                </span>
                <span className="text-[11px] text-white/60">
                  {openMaint ? "Hide" : "Show"}
                </span>
              </button>
              {openMaint ? (
                <ul className="mt-2 space-y-2">
                  {maintenance.map((m, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                    >
                      <p className="text-[13px] font-bold text-white">
                        {m.task}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/75">
                        {m.interval} · {m.category} · {m.priority}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          <p className="flex gap-1.5 px-1 pb-4 text-[10px] leading-relaxed text-white/65">
            <Info className="mt-0.5 size-3 shrink-0" />
            Specs from Live Grok when connected; NHTSA via official API with
            broader make/model fallback. Always verify brochure, door sticker,
            and nhtsa.gov before purchase.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-prestige rounded-[1.15rem] p-3.5">
      <h2 className="mb-3 text-[15px] font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function SpecRow({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string | null;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/8 py-1.5 last:border-0">
      <span className="text-[11px] font-bold tracking-wide text-blue/90">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[58%] text-right text-[13px] font-semibold tabular-nums",
          accent ? "text-white" : "text-white",
        )}
      >
        {value && String(value).trim() ? value : "—"}
      </span>
    </div>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "ruby" | "green" | "blue";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        tone === "ruby"
          ? "border-ruby/40 bg-ruby/20 text-white"
          : tone === "green"
            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
            : tone === "blue"
              ? "border-blue/40 bg-blue/20 text-white"
              : "border-white/20 bg-black/40 text-white",
      )}
    >
      {children}
    </span>
  );
}

function MarketTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-black/30 px-2 py-2 text-center">
      <p className="text-[9px] font-bold tracking-wide text-white/70">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold tabular-nums text-white">
        {value}
      </p>
      <p className="text-[9px] text-white/55">{sub}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  warn,
  ok,
  accent,
}: {
  label: string;
  value: string;
  warn?: boolean;
  ok?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-2.5 py-2",
        warn
          ? "border-amber/40 bg-amber/10"
          : ok
            ? "border-emerald-400/30 bg-emerald-500/10"
            : accent
              ? "border-blue/35 bg-blue/10"
              : "border-white/12 bg-black/25",
      )}
    >
      <p className="text-[9px] font-bold tracking-wide text-white/60">{label}</p>
      <p className="mt-0.5 text-[12px] font-bold text-white">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-black/30 px-1.5 py-2 text-center">
      <p
        className={cn(
          "text-[12px] font-bold tabular-nums",
          warn ? "text-amber" : "text-white",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[8px] font-bold tracking-wide text-white/55">
        {label}
      </p>
    </div>
  );
}
