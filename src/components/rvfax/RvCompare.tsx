import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  GitCompare,
  Loader2,
  Printer,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { RVResult } from "@/lib/rv/catalog";
import { buildCompareReport, compareSelectionKey, type CompareCell, type CompareReport, type LiveMap } from "@/lib/rv/compare";
import { buildBrochureSpecs } from "@/lib/rv/brochureSpecs";
import { fetchLiveDossier, peekVerifiedDossier } from "@/lib/rv/liveDossier";


import { exportVehicleReport } from "@/lib/rv/exportReport";
import { cn } from "@/lib/utils";
import { SuiteBackdrop } from "@/components/shell/SuitePage";
import { RV_CARD_MEDIA } from "@/assets/typeMedia";

function toneClass(tone: CompareCell["tone"], emphasis?: boolean) {
  switch (tone) {
    case "better":
      return emphasis
        ? "bg-emerald-500/35 text-emerald-50 border-emerald-400/70 ring-1 ring-emerald-400/40 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-400"
        : "bg-emerald-500/20 text-emerald-100 border-emerald-400/45 print:bg-emerald-50 print:text-emerald-900 print:border-emerald-300";
    case "worse":
      return emphasis
        ? "bg-ruby/35 text-ruby border-ruby/70 ring-1 ring-ruby/50 print:bg-red-100 print:text-red-900 print:border-red-400"
        : "bg-ruby/20 text-ruby border-ruby/45 print:bg-red-50 print:text-red-800 print:border-red-300";
    case "equal":
      return "bg-black/25 text-white border-white/12 print:bg-slate-50 print:text-slate-800 print:border-slate-200";
    default:
      return "bg-black/15 text-white/70 border-white/10 print:bg-white print:text-slate-600";
  }
}

export function RvCompare({
  items,
  onBack,
  onOpen,
}: {
  items: RVResult[];
  onBack: () => void;
  onOpen?: (r: RVResult) => void;
}) {
  const [liveMap, setLiveMap] = useState<LiveMap>({});
  const [liveLoading, setLiveLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLive, setSummaryLive] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Parallel live Grok for every coach in the set
  useEffect(() => {
    const ctrl = new AbortController();
    setLiveLoading(true);

    // Seed from verified cache so columns aren't wrong while live runs
    const seed: LiveMap = {};
    for (const r of items.slice(0, 3)) {
      const peek = peekVerifiedDossier(r.year, r.make, r.model, r.floorplan);
      if (peek) seed[compareSelectionKey(r)] = peek;
    }
    if (Object.keys(seed).length) setLiveMap(seed);

    Promise.all(
      items.slice(0, 3).map(async (r) => {
        const br = buildBrochureSpecs(
          r.data,
          r.year,
          r.make,
          r.model,
          r.floorplan,
        );
        const res = await fetchLiveDossier(
          r.year,
          r.make,
          r.model,
          r.floorplan,
          ctrl.signal,
          {
            engine: br.engine,
            horsepower: br.horsepower,
            torque: br.torque,
            chassis: br.chassis,
            transmission: br.transmission,
            fuelType: r.data.fuelType,
            type: r.data.type,
            dataSource: br.dataSource,
            accuracyNote: br.accuracyNote,
          },
        );
        if (ctrl.signal.aborted)
          return { key: compareSelectionKey(r), data: null };
        return {
          key: compareSelectionKey(r),
          data: res.ok ? res.data : null,
        };
      }),
    ).then((rows) => {
      if (ctrl.signal.aborted) return;
      const map: LiveMap = { ...seed };
      for (const row of rows) {
        if (row.data) map[row.key] = row.data;
      }
      setLiveMap(map);
      setLiveLoading(false);
    });

    return () => ctrl.abort();
  }, [items]);


  const report: CompareReport = useMemo(
    () => buildCompareReport(items, liveMap),
    [items, liveMap],
  );

  const titleLine = useMemo(
    () =>
      report.columns
        .map(
          (c) =>
            `${c.year} ${c.make} ${c.model}${c.floorplan ? ` ${c.floorplan}` : ""}`,
        )
        .join(" vs "),
    [report.columns],
  );

  const exportPdf = async () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg("Preparing PDF…");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const res = await exportVehicleReport({
        reportElementId: "rvfax-compare-report",
        title: `RvFOX Pro Compare · ${titleLine}`,
        subtitle: `Comparison Report · ${report.generatedAt} · ${report.columns.length} coaches${report.liveCount ? ` · ${report.liveCount} live` : ""}`,
        filenameBase: `RvFOX-Pro-Compare-${report.columns.map((c) => c.model).join("-")}`,

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
      window.setTimeout(() => setExportMsg(null), 5000);
    }
  };

  // AI summary after live specs settle (or fail)
  useEffect(() => {
    if (liveLoading) return;
    const ctrl = new AbortController();
    setLoadingSummary(true);
    setSummaryError(null);
    const coaches = report.columns.map((c, idx) => {
      const cell = (id: string) =>
        report.rows.find((r) => r.id === id)?.cells[idx]?.value;
      return {
        year: c.year,
        make: c.make,
        model: c.model,
        floorplan: c.floorplan || undefined,
        type: c.type,
        rating: c.rating,
        engine: cell("engine"),
        chassis: cell("chassis"),
        length: cell("length"),
        sleeps: cell("sleeps"),
        slides: cell("slides"),
        layout: cell("layout"),
        retailHigh: report.rows.find((r) => r.id === "retailHi")?.cells[idx]
          ?.raw,
        tradeIn: report.rows.find((r) => r.id === "trade")?.cells[idx]?.raw,
        live: c.live,
      };
    });

    fetch("/api/rvfax/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coaches }),
      signal: ctrl.signal,
    })
      .then(async (resp) => {
        if (ctrl.signal.aborted) return;
        const json = (await resp.json()) as {
          summary?: string;
          live?: boolean;
          error?: string;
        };
        if (!resp.ok) {
          setSummaryError(json.error || "Compare summary failed");
          setLoadingSummary(false);
          return;
        }
        setSummary(json.summary || null);
        setSummaryLive(Boolean(json.live));
        setLoadingSummary(false);
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setSummaryError(
          e instanceof Error ? e.message : "Network error on AI summary",
        );
        setLoadingSummary(false);
      });

    return () => ctrl.abort();
  }, [liveLoading, report]);

  const n = report.columns.length;
  /** Sticky label col + equal coach cols — labels never scroll off */
  const gridCols =
    n === 2
      ? "grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1fr)]"
      : "grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

  const hi = report.highestRatingIndex;
  const lo = report.lowestRatingIndex;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg text-white">
      <SuiteBackdrop src={RV_CARD_MEDIA} />

      <div
        data-app-scroll
        className="rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        <div
          id="rvfax-compare-report"
          className="mx-auto w-full max-w-2xl space-y-3 px-3 pb-20 pt-3 sm:px-4"
        >
          <div
            className="flex items-center justify-between gap-2 print:hidden"
            data-no-export
          >
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
            <p className="text-[11px] font-bold tracking-[0.14em] text-white/70">
              COMPARE · {n} COACHES
            </p>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={exportBusy}
              className={cn(
                "inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3 py-2 text-[12px] font-bold text-white active:scale-[0.97]",
                exportBusy && "opacity-70",
              )}
            >
              <Printer className="size-3.5" />
              {exportBusy ? "…" : "PDF"}
            </button>
          </div>

          {exportMsg ? (
            <div
              role="status"
              data-no-export
              className="print:hidden rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-[12px] font-semibold text-white"
            >
              {exportMsg}
            </div>
          ) : null}

          <header className="overflow-hidden rounded-[1.25rem] border border-white/15 bg-black/50">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/55 px-3.5 py-2.5">
              <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-900">
                RVFAX
              </span>
              <p className="text-[13px] font-bold text-white">
                Comparison Report
              </p>
              <GitCompare className="ml-auto size-4 text-sky-300" />
            </div>
            <div className="p-3.5">
              <p className="text-[11px] text-white/55">{report.generatedAt}</p>
              <p className="mt-1 text-[13px] font-semibold text-white">
                {titleLine}
              </p>
              {liveLoading ? (
                <p className="mt-2 flex items-center gap-2 text-[12px] text-white/50">
                  <Loader2 className="size-3.5 animate-spin" />
                  Refreshing figures…
                </p>
              ) : null}
            </div>
          </header>

          {/* Rating callout strip */}
          <div className={cn("grid gap-1.5", gridCols)}>
            <div className="flex items-center pr-1 text-[10px] font-bold tracking-wide text-white">
              Rating
            </div>
            {report.columns.map((c, i) => {
              const isHi = i === hi && hi !== lo;
              const isLo = i === lo && hi !== lo;
              return (
                <div
                  key={`rate-${c.key}`}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-center",
                    isHi &&
                      "border-emerald-400/60 bg-emerald-500/25 text-emerald-50",
                    isLo && "border-ruby/60 bg-ruby/25 text-ruby",
                    !isHi &&
                      !isLo &&
                      "border-white/12 bg-black/35 text-white",
                  )}
                >
                  {isHi ? (
                    <p className="mb-0.5 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-emerald-200">
                      <Trophy className="size-3" /> Highest
                    </p>
                  ) : null}
                  {isLo ? (
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-ruby">
                      Lowest
                    </p>
                  ) : null}
                  <p className="text-[22px] font-black leading-none">
                    {c.rating.toFixed(1)}
                  </p>
                  <p className="mt-0.5 text-[10px] opacity-80">/ 5.0</p>
                </div>
              );
            })}
          </div>

          <div className={cn("grid gap-1.5", gridCols)}>
            <div className="flex items-end pb-1 pr-1 text-[10px] font-bold tracking-wide text-white">
              Coach
            </div>
            {report.columns.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => onOpen?.(c.result)}
                className={cn(
                  "min-w-0 rounded-xl border p-2 text-left transition active:scale-[0.99]",
                  i === hi && hi !== lo
                    ? "border-emerald-400/50 bg-emerald-500/15"
                    : i === lo && hi !== lo
                      ? "border-ruby/40 bg-ruby/10"
                      : "border-white/15 bg-black/40",
                )}
              >
                <p className="text-[9px] font-bold tracking-wide text-sky-300">
                  COACH {i + 1}
                  {c.live ? " · LIVE" : ""}
                </p>
                <p className="mt-0.5 text-[12px] font-bold leading-snug text-white">
                  {c.year} {c.make}
                </p>
                <p className="text-[12px] font-semibold text-white/90">
                  {c.model}
                  {c.floorplan ? ` · ${c.floorplan}` : ""}
                </p>
                <p className="mt-1 text-[10px] text-white/50">{c.type}</p>
              </button>
            ))}
          </div>

          <section className="overflow-hidden rounded-[1.15rem] border border-white/12 bg-black/40">
            <div className="border-b border-white/10 bg-black/55 px-3 py-2">
              <p className="text-[11px] font-bold tracking-wide text-white">
                Specs & ratings
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {report.rows.map((r) => {
                const isRating = r.id === "rating";
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "grid gap-1.5 px-2 py-2.5 sm:px-3",
                      gridCols,
                      isRating && "bg-white/[0.03]",
                    )}
                  >
                    {/* Label column — plain text, no sticky overlay */}
                    <div className="flex items-center pr-1">
                      <p className="w-full whitespace-normal break-words text-[10px] font-bold leading-snug tracking-wide text-white/80 print:text-slate-700">
                        {r.label}
                      </p>
                    </div>
                    {r.cells.map((cell, i) => (
                      <div
                        key={`${r.id}-${i}`}
                        className={cn(
                          "min-w-0 rounded-lg border px-1.5 py-1.5 text-[10px] font-semibold leading-snug sm:px-2 sm:text-[11px]",
                          toneClass(cell.tone, isRating),
                          isRating && "text-[13px] font-black sm:text-[14px]",
                        )}
                      >
                        {cell.tone === "better" ? (
                          <span className="mb-0.5 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide opacity-90 sm:text-[9px]">
                            <Trophy className="size-2.5 shrink-0" />{" "}
                            {isRating ? "Highest" : "Best"}
                          </span>
                        ) : null}
                        {cell.tone === "worse" && isRating ? (
                          <span className="mb-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-90 sm:text-[9px]">
                            Lowest
                          </span>
                        ) : cell.tone === "worse" && !isRating ? (
                          <span className="mb-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-80 sm:text-[9px]">
                            Lower
                          </span>
                        ) : null}
                        <span className="break-words">{cell.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.15rem] border border-white/12 bg-black/40">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/55 px-3.5 py-2">
              <Sparkles className="size-3.5 text-ruby" />
              <p className="text-[11px] font-bold tracking-wide text-white">
                AI difference summary
              </p>
              {summaryLive ? (
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/50">
                  Compared
                </span>
              ) : null}
            </div>
            <div className="p-3.5">
              {liveLoading || loadingSummary ? (
                <p className="flex items-center gap-2 text-[13px] text-white/70">
                  <Loader2 className="size-4 animate-spin text-sky-300" />
                  Grok is comparing these coaches…
                </p>
              ) : summaryError ? (
                <p className="text-[13px] text-amber">{summaryError}</p>
              ) : summary ? (
                <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/90">
                  {summary}
                </div>
              ) : (
                <p className="text-[13px] text-white/60">No summary yet.</p>
              )}
            </div>
          </section>

          <div className="print:hidden flex flex-col gap-2 pt-1" data-no-export>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={exportBusy}
              className="flex w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-70"
            >
              {exportBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {exportBusy ? "Preparing PDF…" : "Save / Print PDF"}
            </button>
          </div>

          <p className="pb-4 text-center text-[12px] text-white">
            Confirm brochure and door sticker before you buy.
          </p>
        </div>
      </div>
    </div>
  );
}
