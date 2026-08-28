import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitCompare,
  Heart,
  Loader2,
  MapPin,
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
import { getRatingMetadata, ratingStars } from "@/lib/rv/ratingSystem";
import { buildBrochureSpecs } from "@/lib/rv/brochureSpecs";
import {
  findPowertrainCorrection,
  sanitizeFeaturesForPin,
  sanitizeNarrativeForPin,
} from "@/lib/rv/powertrainCorrections";
import {
  formatHardHorsepower,
  formatHardTorque,
  resolveHardPowertrain,
  type PowertrainTrust,
} from "@/lib/rv/livePowertrainGuard";
import {
  findLocalSpecOverride,
  removeLocalSpecOverride,
  saveLocalSpecOverride,
} from "@/lib/rv/localSpecOverrides";
import { getMaintenanceSchedule } from "@/lib/rv/rvData";
import { getMockReviews } from "@/lib/rv/rvReviews";
import {
  fetchLiveDossier,
  liveMarketLadder,
  mergeLiveIntoDisplay,
  peekVerifiedDossier,
  refreshCoachDossierCache,
  type LiveDossier,
} from "@/lib/rv/liveDossier";
import { fetchRecallsViaApi } from "@/lib/nhtsa/recalls";
import type { NhtsaComplaint, NhtsaRecall } from "@/lib/nhtsa/recalls";
import { buildReportId, valueFactors } from "@/lib/rv/reportMeta";
import { exportVehicleReport } from "@/lib/rv/exportReport";
import {
  fetchLocalInventory,
  loadInventoryZip,
  saveInventoryZip,
} from "@/lib/marketcheck/client";
import type { McListingCard } from "@/lib/marketcheck/types";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { PullResetHint } from "@/components/shell/PullResetHint";
import { SHARED_PRESTIGE_BACKDROP } from "@/assets/prestige";
import { resolveCardImage } from "@/assets/typeMedia";
import { SuiteBackdrop } from "@/components/shell/SuitePage";
import { cn } from "@/lib/utils";
import { findOemFloorplanSpec } from "@/lib/rv/floorplanSpecs";
import { sanitizeUnverifiedLayout } from "@/lib/rv/promptRules";

/**
 * Vehicle History Report — catalog paints instantly; Live Grok updates soft fields.
 * Phase 1: year-banded powertrain always paints from the selected wizard year.
 * Brochure powertrain pins always win over Live Grok (prevents ISL/V10 hallucinations).
 */
export function RvDetail({
  result,
  onBack,
  saved,
  onToggleSave,
  comparing = false,
  compareCount = 0,
  compareFull = false,
  onToggleCompare,
  onOpenCompare,
  onAskGrok,
}: {
  result: RVResult;
  onBack: () => void;
  saved: boolean;
  onToggleSave: () => void;
  comparing?: boolean;
  compareCount?: number;
  compareFull?: boolean;
  onToggleCompare?: () => void;
  onOpenCompare?: () => void;
  onAskGrok: () => void;
}) {
  const { data, year, make, model, floorplan } = result;
  const catalogMarket = estimateMarket(data, year, floorplan);
  const rating = ratingFor(make, model, year);
  const ratingMeta = useMemo(
    () => getRatingMetadata(make, model, year),
    [make, model, year],
  );
  const [correctBump, setCorrectBump] = useState(0);
  const brochure = useMemo(
    () => buildBrochureSpecs(data, year, make, model, floorplan || ""),
    // correctBump forces re-read of local overrides
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, year, make, model, floorplan, correctBump],
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
  const [correctOpen, setCorrectOpen] = useState(false);
  const [correctEngine, setCorrectEngine] = useState("");
  const [correctHp, setCorrectHp] = useState("");
  const [correctTorque, setCorrectTorque] = useState("");
  const [correctChassis, setCorrectChassis] = useState("");
  const [correctTrans, setCorrectTrans] = useState("");
  const [correctFuel, setCorrectFuel] = useState("");
  const [correctNote, setCorrectNote] = useState("");
  const [correctMsg, setCorrectMsg] = useState<string | null>(null);
  const shellNav = useShellNavOptional();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [invZip, setInvZip] = useState(() => loadInventoryZip() || "98402");
  const [invRadius, setInvRadius] = useState(100);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [invListings, setInvListings] = useState<McListingCard[]>([]);
  const [invSearched, setInvSearched] = useState(false);

  const pullHint = usePullToReset(scrollRef, onBack);

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

    // Instant accurate paint if we've verified this coach before
    const peek = peekVerifiedDossier(year, make, model, floorplan);
    if (peek) {
      setLive(peek);
    } else {
      // Phase 3.4: do NOT clear year-band catalog paint — leave live null
      // so hard specs stay from brochure until Live succeeds
      setLive(null);
    }

    // Phase 3.2 — inject year+floorplan brochure as candidate truth for dossier
    const catalogCandidate = {
      engine: brochure.engine,
      horsepower: brochure.horsepower,
      torque: brochure.torque,
      chassis: brochure.chassis,
      transmission: brochure.transmission,
      fuelType: data.fuelType,
      type: data.type,
      dataSource: brochure.dataSource,
      accuracyNote: brochure.accuracyNote,
      floorplan: floorplan || null,
      lengthFt: brochure.lengthFt,
      gvwr: brochure.gvwr,
    };

    fetchLiveDossier(
      year,
      make,
      model,
      floorplan,
      ctrl.signal,
      catalogCandidate,
    )
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          if (res.aborted) return;
          // Keep peek if any; otherwise leave live null (catalog year-band stays)
          setLiveError(res.error);
          if (!peek) {
            /* live stays null — year-true catalog remains on screen */
          }
          return;
        }
        setLive(res.data);
        setLiveError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLiveError(e instanceof Error ? e.message : "Live lookup failed");
        // Phase 3.4 — never blank hard facts; catalog brochure remains
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [year, make, model, floorplan, liveRetry, brochure, data.fuelType, data.type]);

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
      isToyHauler: brochure.isToyHauler,
      garageLength: brochure.garageLength,
      garageWidth: brochure.garageWidth,
      garageHeight: brochure.garageHeight,
      garageCapacity: brochure.garageCapacity,
      rampWidth: brochure.rampWidth,
      fuelStation: brochure.fuelStation,
      garageFits: brochure.garageFits,
    }),
    [brochure],
  );

  const brochurePinned = brochure.dataSource === "oem-year";
  const powertrainPin = useMemo(
    () => findPowertrainCorrection(year, make, model, floorplan || ""),
    [year, make, model, floorplan],
  );

  /** Phase 2 guard: pin / catalog hard facts; Live only fills empties if validated */
  const powertrainGuard = useMemo(
    () =>
      resolveHardPowertrain({
        year,
        make,
        model,
        floorplan: floorplan || "",
        catalog: {
          engine: brochure.engine,
          horsepower: brochure.horsepower,
          torque: brochure.torque,
          chassis: brochure.chassis,
          transmission: brochure.transmission,
          fuelType: data.fuelType,
          type: data.type,
        },
        live: live?.live ? live : null,
      }),
    // correctBump refreshes local override pin
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, make, model, floorplan, brochure, data.fuelType, data.type, live, correctBump],
  );

  const powertrainTrust: PowertrainTrust = powertrainGuard.trust;

  const specs = useMemo(() => {
    const hardHp =
      formatHardHorsepower(powertrainGuard.hard.horsepower) ||
      catalogSpecs.horsepower;
    const hardTq =
      formatHardTorque(powertrainGuard.hard.torqueLbFt) || catalogSpecs.torque;

    const hardOverride = {
      engine: powertrainGuard.hard.engine || catalogSpecs.engine,
      horsepower: hardHp,
      torque: hardTq,
      chassis: powertrainGuard.hard.chassis || catalogSpecs.chassis,
      transmission:
        powertrainGuard.hard.transmission || catalogSpecs.transmission,
    };

    // Soft fields from Live; hard fields from guard (never stomped)
    const merged = mergeLiveIntoDisplay(
      catalogSpecs,
      live?.live ? live : null,
      {
        lockPowertrainFromCatalog: true,
        hardOverride,
      },
    );

    if (brochurePinned) {
      return {
        ...merged,
        lengthFt: catalogSpecs.lengthFt || merged.lengthFt,
        exteriorWidth: catalogSpecs.exteriorWidth || merged.exteriorWidth,
        exteriorHeight: catalogSpecs.exteriorHeight || merged.exteriorHeight,
        interiorHeight: catalogSpecs.interiorHeight || merged.interiorHeight,
        gvwr: catalogSpecs.gvwr || merged.gvwr,
        uvw: catalogSpecs.uvw || merged.uvw,
        ccc: catalogSpecs.ccc || merged.ccc,
        freshWater: catalogSpecs.freshWater || merged.freshWater,
        grayWater: catalogSpecs.grayWater || merged.grayWater,
        blackWater: catalogSpecs.blackWater || merged.blackWater,
        garageLength: catalogSpecs.garageLength || merged.garageLength,
        garageWidth: catalogSpecs.garageWidth || merged.garageWidth,
        garageHeight: catalogSpecs.garageHeight || merged.garageHeight,
        garageCapacity: catalogSpecs.garageCapacity || merged.garageCapacity,
        rampWidth: catalogSpecs.rampWidth || merged.rampWidth,
        fuelStation: catalogSpecs.fuelStation || merged.fuelStation,
        garageFits: catalogSpecs.garageFits || merged.garageFits,
        isToyHauler: catalogSpecs.isToyHauler || merged.isToyHauler,
      };
    }
    return merged;
  }, [catalogSpecs, live, brochurePinned, powertrainGuard]);

  const displayRating = rating;

  const ownerReviews = useMemo(
    () => getMockReviews(make, model, displayRating),
    [make, model, displayRating],
  );

  const liveLadder = liveMarketLadder(live?.live ? live : null);
  const market = useMemo(
    () =>
      liveLadder
        ? {
            tradeIn: liveLadder.tradeIn,
            retailLow: liveLadder.retailLow,
            retailHigh: liveLadder.retailHigh,
            msrpLo: liveLadder.msrpLo ?? catalogMarket.msrpLo,
            msrpHi: liveLadder.msrpHi ?? catalogMarket.msrpHi,
            segment: catalogMarket.segment,
            ageYears: catalogMarket.ageYears,
          }
        : catalogMarket,
    [liveLadder, catalogMarket],
  );

  const displayType =
    (powertrainGuard.hard.fuelType === "Diesel"
      ? data.type?.replace(/gas/i, "Diesel") || "Class A Diesel"
      : powertrainGuard.hard.fuelType === "Gas"
        ? data.type?.replace(/diesel/i, "Gas") || "Class A Gas"
        : null) ||
    // Live rvType is soft — ok to use when no pin/catalog fuel conflict
    (live?.live && live.rvType && powertrainTrust !== "pinned"
      ? live.rvType
      : null) ||
    data.type;

  const displayFuel =
    powertrainGuard.hard.fuelType ||
    data.fuelType;

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

  const overviewText = useMemo(() => {
    const raw =
      (live?.live && live.overview) || data.description || null;
    if (!raw) return null;
    const pinned = powertrainPin
      ? sanitizeNarrativeForPin(powertrainPin, raw) || raw
      : raw;
    const oem = findOemFloorplanSpec(year, make, model, floorplan || "");
    return sanitizeUnverifiedLayout(pinned, [oem?.layoutNote, oem?.note]) || pinned;
  }, [live, data.description, powertrainPin, year, make, model, floorplan]);

  const featureChips = useMemo(() => {
    if (!live?.live || !live.keyFeatures?.length) return [];
    const oem = findOemFloorplanSpec(year, make, model, floorplan || "");
    const verified = [oem?.layoutNote, oem?.note];
    const base = powertrainPin
      ? sanitizeFeaturesForPin(powertrainPin, live.keyFeatures)
      : live.keyFeatures;
    return base
      .map((f) => sanitizeUnverifiedLayout(f, verified))
      .filter((f) => f && !/^layout details unconfirmed/i.test(f))
      .slice(0, 6);
  }, [live, powertrainPin, year, make, model, floorplan]);

  const runInventorySearch = async () => {
    const zip = invZip.trim();
    if (!/^\d{5}$/.test(zip)) {
      setInvError("Enter a 5-digit ZIP");
      return;
    }
    saveInventoryZip(zip);
    setInvLoading(true);
    setInvError(null);
    setInvSearched(true);
    const res = await fetchLocalInventory({
      year,
      make,
      model,
      zip,
      radius: invRadius,
    });
    setInvLoading(false);
    if (!res.ok) {
      setInvListings([]);
      setInvError(res.error || "Inventory search unavailable");
      return;
    }
    setInvListings(res.listings || []);
    if (!res.listings?.length) {
      setInvError("No local listings found");
    }
  };

  const invMedian = useMemo(() => {
    const prices = invListings
      .map((l) => l.price)
      .filter((n): n is number => typeof n === "number" && n > 0)
      .sort((a, b) => a - b);
    if (!prices.length) return null;
    return prices[Math.floor(prices.length / 2)]!;
  }, [invListings]);

  const exportPdf = async () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg("Preparing PDF…");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const res = await exportVehicleReport({
        reportElementId: "rvfax-vehicle-report",
        title: `RvFOX Pro · ${year} ${make} ${model}${floorplan ? ` ${floorplan}` : ""}`,
        subtitle: `Vehicle History Report · ${reportId} · ${generatedAt}`,
        filenameBase: `RvFOX-Pro-${year}-${make}-${model}`.replace(/\s+/g, "-"),
        meta: {
          year,
          make,
          model,
          floorplan: floorplan || undefined,
          tradeIn: formatMoney(market.tradeIn),
          retailLow: formatMoney(market.retailLow),
          retailHigh: formatMoney(market.retailHigh),
          rating: displayRating.toFixed(1),
          type: displayType,
          recallCount: recallLoading ? 0 : recallCount,
          reportId,
          preparedFor: "Client",
          factors: factors.map((f) => ({
            label: f.label,
            positive: f.positive,
          })),
          length: specs.lengthFt,
          slideouts: specs.slideouts,
          sleeps: specs.sleeps,
        },
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

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg text-white">
      <SuiteBackdrop src={SHARED_PRESTIGE_BACKDROP} />

      <div
        ref={scrollRef}
        data-app-scroll
        data-rvfax-scroll
        className="rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        <PullResetHint show={pullHint} label="Release to go back" />
        <div
          id="rvfax-vehicle-report"
          className="mx-auto w-full max-w-lg space-y-5 px-4 pb-32 pt-4 sm:px-5"
        >
          {/* Top actions */}
          <div
            className="flex flex-wrap items-center justify-between gap-2"
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
              {onToggleCompare ? (
                <button
                  type="button"
                  onClick={onToggleCompare}
                  disabled={!comparing && compareFull}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-40",
                    comparing
                      ? "border-sky-400/50 bg-sky-500/20 text-sky-100"
                      : "border-white/20 bg-black/40 text-white",
                  )}
                >
                  <GitCompare className="size-3.5" />
                  {comparing
                    ? `In compare${compareCount ? ` · ${compareCount}` : ""}`
                    : compareFull
                      ? "Compare full"
                      : "Compare"}
                </button>
              ) : null}
              {onOpenCompare && compareCount >= 2 ? (
                <button
                  type="button"
                  onClick={onOpenCompare}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1.5 text-[12px] font-bold text-gold-bright"
                >
                  Open compare
                </button>
              ) : null}
              {shellNav ? (
                <button
                  type="button"
                  onClick={() =>
                    shellNav.openCalWithPrice(
                      market.retailLow,
                      `${year} ${make} ${model}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-[12px] font-bold text-gold-bright"
                >
                  <Calculator className="size-3.5" />
                  Finance
                </button>
              ) : null}
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
                  <span className="rounded-md bg-blue px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white">
                    RvFOX
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-white">
                      Vehicle History Report
                    </p>
                    <p className="text-[9px] font-semibold tracking-[0.14em] text-white">
                      KNOW BEFORE YOU BUY
                    </p>
                  </div>
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
              <StatTile label="Class" value={displayType} />
              <StatTile
                label="Used market"
                value={
                  liveLoading
                    ? "Updating…"
                    : "Trade · retail range"
                }
                accent
              />
            </div>
          </section>

          {/* Overview */}
          <section className="glass-prestige overflow-hidden rounded-[1.15rem]">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={resolveCardImage(data)}
                alt={`${displayType} — ${year} ${make} ${model}`}
                className="size-full object-cover object-[center_42%]"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
                <span className="rounded-full bg-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                  {displayType}
                </span>
              </div>
            </div>
            <div className="px-5 pb-6 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Vehicle Overview
            </p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-sky-200/90">{year}</p>
                <h1 className="mt-0.5 text-[26px] font-semibold leading-[1.12] tracking-tight text-white">
                  {make} {model}
                </h1>
                {floorplan ? (
                  <p className="mt-1.5 text-[14px] text-white">
                    Floorplan {floorplan}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip>{displayType}</Chip>
                  {recallLoading ? (
                    <Chip>Checking recalls…</Chip>
                  ) : recallCount > 0 ? (
                    <Chip tone="ruby">
                      <AlertTriangle className="size-3" /> {recallCount}{" "}
                      {recallCount === 1 ? "recall" : "recalls"}
                    </Chip>
                  ) : (
                    <Chip tone="green">No open recalls</Chip>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[32px] font-light tabular-nums leading-none tracking-tight text-sky-200">
                  {displayRating.toFixed(1)}
                </p>
                <p className="mt-1.5 text-[11px] tracking-wide text-amber-200/90">
                  {ratingStars(displayRating)}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                  RvFOX rating
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <MiniStat label="LENGTH" value={specs.lengthFt || "—"} />
              {specs.isToyHauler ? (
                <MiniStat
                  label="GARAGE"
                  value={
                    specs.garageLength && !/varies/i.test(specs.garageLength)
                      ? specs.garageLength.replace(/\s*deep$/i, "")
                      : "See specs"
                  }
                />
              ) : (
                <MiniStat label="SLIDEOUTS" value={specs.slideouts || "—"} />
              )}
              <MiniStat label="SLEEPS" value={specs.sleeps || "—"} />
              <MiniStat
                label="RECALLS"
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

            {overviewText ? (
              <p className="mt-6 text-[15px] font-normal leading-[1.65] text-white">
                {overviewText}
              </p>
            ) : null}

            {featureChips.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {featureChips.map((f) => (
                  <Chip key={f}>{f}</Chip>
                ))}
              </div>
            ) : null}

            {liveError && !liveLoading ? (
              <div className="mt-5 rounded-xl border border-amber-400/35 bg-amber-500/12 px-3.5 py-3">
                <p className="text-[13px] leading-snug text-amber-100">
                  Live research failed. Engine, HP, chassis, and fuel on this
                  report are the catalog year-band for this coach.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLiveError(null);
                    setLiveRetry((n) => n + 1);
                  }}
                  className="mt-2 text-[12px] font-bold text-amber-50 underline underline-offset-2"
                >
                  Retry live
                </button>
              </div>
            ) : null}
            </div>
          </section>


          {/* Market */}
          <section className="glass-prestige rounded-[1.25rem] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/90">
                Market value
              </p>
              {liveLoading ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-white">
                  <Loader2 className="size-3 animate-spin" />
                  Updating
                </span>
              ) : null}
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

          {/* Local inventory */}
          <section className="glass-prestige rounded-[1.15rem] p-3.5" data-no-export>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.14em] text-white">
                LOCAL INVENTORY
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-[7rem] flex-1 items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5">
                <MapPin className="size-3.5 text-blue" />
                <input
                  value={invZip}
                  onChange={(e) => setInvZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  inputMode="numeric"
                  placeholder="ZIP"
                  className="w-full bg-transparent text-[13px] font-semibold text-white outline-none placeholder:text-white/40"
                />
              </label>
              <select
                value={invRadius}
                onChange={(e) => setInvRadius(Number(e.target.value))}
                className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[12px] font-semibold text-white"
              >
                <option value={50}>50 mi</option>
                <option value={100}>100 mi</option>
                <option value={250}>250 mi</option>
              </select>
              <button
                type="button"
                onClick={() => void runInventorySearch()}
                disabled={invLoading}
                className="rounded-full border border-blue/40 bg-blue/20 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {invLoading ? "…" : "Search"}
              </button>
            </div>
            {invError ? (
              <p className="mt-2 text-[11px] text-amber">{invError}</p>
            ) : null}
            {invListings.length ? (
              <ul className="mt-2 space-y-1.5">
                {invListings.slice(0, 5).map((l, i) => (
                  <li
                    key={l.id || i}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-white">
                          {l.heading ||
                            `${l.year || year} ${l.make || make} ${l.model || model}`}
                        </p>
                        <p className="text-[11px] text-white/60">
                          {[l.dealerName, l.city, l.state]
                            .filter(Boolean)
                            .join(" · ") || "Dealer listing"}
                        </p>
                      </div>
                      <p className="shrink-0 text-[13px] font-bold tabular-nums text-gold-bright">
                        {l.price ? formatMoney(l.price) : "—"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : invSearched && !invLoading && !invError ? (
              <p className="mt-2 text-[11px] text-white/55">No listings nearby.</p>
            ) : null}
            {invMedian && shellNav ? (
              <button
                type="button"
                onClick={() =>
                  shellNav.openCalWithPrice(
                    invMedian,
                    `${year} ${make} ${model} · local median`,
                  )
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/15 py-2.5 text-[12px] font-bold text-gold-bright"
              >
                <Calculator className="size-3.5" />
                Finance at local median · {formatMoney(invMedian)}
              </button>
            ) : null}
          </section>

          {/* Specs */}
          <Section title="Vehicle Specifications">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
              Identity & dimensions
            </p>
            <SpecRow label="TYPE" value={displayType} />
            <SpecRow label="YEAR" value={year} />
            <SpecRow label="LENGTH" value={specs.lengthFt} accent />
            <SpecRow label="WIDTH" value={specs.exteriorWidth} />
            <SpecRow label="HEIGHT" value={specs.exteriorHeight} />
            <SpecRow label="CEILING" value={specs.interiorHeight} />
            <SpecRow label="SLIDEOUTS" value={specs.slideouts} />
            <SpecRow label="SLEEPS" value={specs.sleeps} />

            {specs.isToyHauler ? (
              <>
                <p className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
                  Toy hauler garage
                </p>
                <SpecRow label="GARAGE DEPTH" value={specs.garageLength} accent />
                <SpecRow label="GARAGE WIDTH" value={specs.garageWidth} />
                <SpecRow label="GARAGE HEIGHT" value={specs.garageHeight} />
                <SpecRow label="RAMP DOOR" value={specs.rampWidth} />
                <SpecRow label="CARGO RATING" value={specs.garageCapacity} />
                <SpecRow label="FITS" value={specs.garageFits} />
                <SpecRow label="FUEL STATION" value={specs.fuelStation} />
              </>
            ) : null}

            <p className="mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
              Powertrain & chassis
            </p>
            {liveError && !liveLoading ? (
              <p className="mb-2 text-[11px] leading-snug text-amber-200/85">
                Live failed — year-band catalog shown.
              </p>
            ) : null}
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

            <p className="mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
              Weights
            </p>
            <SpecRow label="GVWR" value={specs.gvwr} accent />
            <SpecRow label="UVW" value={specs.uvw} />
            <SpecRow label="CCC" value={specs.ccc} />
            <SpecRow label="WARRANTY" value={specs.warranty} />

            <p className="mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
              Tanks
            </p>
            <SpecRow label="FRESH WATER" value={specs.freshWater} />
            <SpecRow label="GRAY WATER" value={specs.grayWater} />
            <SpecRow label="BLACK WATER" value={specs.blackWater} />

            <details className="mt-5 border-t border-white/10 pt-3" data-no-export>
              <summary className="cursor-pointer list-none text-[11px] font-medium text-white/35">
                Something look off? Tap to correct
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCorrectEngine(specs.engine || "");
                  setCorrectHp(
                    String(specs.horsepower || "").replace(/[^\d].*$/, "") || "",
                  );
                  setCorrectTorque(
                    String(specs.torque || "").replace(/[^\d].*$/, "") || "",
                  );
                  setCorrectChassis(specs.chassis || "");
                  setCorrectTrans(specs.transmission || "");
                  setCorrectFuel(displayFuel || data.fuelType || "");
                  setCorrectNote("");
                  setCorrectMsg(null);
                  setCorrectOpen(true);
                }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70"
              >
                Correct this spec
              </button>
              {powertrainTrust === "local" ? (
                <button
                  type="button"
                  onClick={() => {
                    const cur = findLocalSpecOverride(
                      year,
                      make,
                      model,
                      floorplan,
                    );
                    if (cur) removeLocalSpecOverride(cur.id);
                    setCorrectBump((n) => n + 1);
                    setCorrectMsg("Local correction removed.");
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70"
                >
                  Clear correction
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  refreshCoachDossierCache(year, make, model, floorplan);
                  setLive(null);
                  setLiveError(null);
                  setLiveRetry((n) => n + 1);
                }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70"
              >
                Refresh report
              </button>
              </div>
              {correctMsg ? (
                <p className="mt-2 text-[11px] text-white/50">{correctMsg}</p>
              ) : null}
            </details>
          </Section>

          <Section title="Rating">
            <p className="mb-4 text-[14px] leading-relaxed text-white">
              {displayRating.toFixed(1)} out of 5 · {ratingMeta.tierLabel}
            </p>
            <SpecRow
              label="BRAND"
              value={ratingMeta.base.toFixed(1)}
            />
            <SpecRow
              label="MODEL"
              value={`${ratingMeta.tierAdj >= 0 ? "+" : ""}${ratingMeta.tierAdj.toFixed(1)}`}
            />
            <SpecRow
              label="YEAR"
              value={`${ratingMeta.yearAdj >= 0 ? "+" : ""}${ratingMeta.yearAdj.toFixed(1)}`}
            />
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

          {live?.live &&
          (live.reliabilitySummary ||
            live.commonIssues?.length ||
            live.servicePriorities?.length) ? (
            <Section title="Reliability & ownership">
              {live.reliabilitySummary ? (
                <p className="text-[13px] leading-relaxed text-white/90">
                  {powertrainPin
                    ? sanitizeNarrativeForPin(
                        powertrainPin,
                        live.reliabilitySummary,
                      ) || live.reliabilitySummary
                    : live.reliabilitySummary}
                </p>
              ) : null}
              {live.commonIssues?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {live.commonIssues.map((x) => (
                    <li
                      key={x}
                      className="flex gap-2 text-[14px] text-white"
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
                      className="flex gap-2 text-[14px] text-white"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                      {x}
                    </li>
                  ))}
                </ul>
              ) : null}
              {live.ownerSentiment ? (
                <p className="mt-2 text-[14px] italic text-white">
                  {live.ownerSentiment}
                </p>
              ) : null}
            </Section>
          ) : null}

          {ownerReviews.length ? (
            <Section title="Owner reviews">
              <div className="space-y-3">
                {ownerReviews.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[16px] font-bold leading-snug text-white">
                          {r.title}
                        </p>
                        <p className="mt-1 text-[13px] text-white">
                          {r.author}
                          {r.location ? ` · ${r.location}` : ""}
                          {r.date ? ` · ${r.date}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[18px] font-bold tabular-nums text-gold-bright">
                          {r.rating.toFixed(1)}
                        </p>
                        {r.verified ? (
                          <Chip tone="green">Verified</Chip>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-white">
                      {r.body}
                    </p>
                    {r.miles || r.years ? (
                      <p className="mt-2 text-[13px] font-medium text-white">
                        {[r.miles, r.years].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="NHTSA safety">
            {recallLoading ? (
              <p className="flex items-center gap-2 text-[14px] text-white">
                <Loader2 className="size-4 animate-spin" /> Loading recalls
                from NHTSA…
              </p>
            ) : recallError ? (
              <p className="text-[12px] text-amber">{recallError}</p>
            ) : liveRecalls.length === 0 ? (
              <div className="space-y-2">
                <p className="text-[13px] text-white">
                  None found for this year / make / model.
                </p>
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
                <p className="text-[15px] font-bold text-ruby">
                  {liveRecalls.length} NHTSA campaign
                  {liveRecalls.length === 1 ? "" : "s"} on record
                </p>
                <ul className="space-y-2">
                  {liveRecalls.map((r, i) => (
                    <li
                      key={`${r.campaignNumber || i}-${i}`}
                      className="rounded-xl border border-ruby/30 bg-ruby/10 px-3 py-2"
                    >
                      <p className="text-[15px] font-bold text-white">
                        {r.component || "Recall"}
                      </p>
                      {r.campaignNumber ? (
                        <p className="mt-0.5 font-mono text-[13px] text-white">
                          {r.campaignNumber}
                        </p>
                      ) : null}
                      <details className="mt-1.5">
                        <summary className="cursor-pointer list-none text-[13px] font-semibold text-white">
                          Details
                        </summary>
                        <p className="mt-2 text-[14px] leading-relaxed text-white">
                          {r.summary ||
                            r.consequence ||
                            "See NHTSA for details."}
                        </p>
                        {r.remedy ? (
                          <p className="mt-2 text-[14px] leading-relaxed text-white">
                            {r.remedy}
                          </p>
                        ) : null}
                      </details>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.nhtsa.gov/recalls"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue"
                >
                  nhtsa.gov <ExternalLink className="size-3" />
                </a>
              </div>
            )}

            {liveDefects.length > 0 ? (
              <details className="mt-3">
                <summary className="cursor-pointer list-none text-[15px] font-bold text-white">
                  Owner complaints
                </summary>
                <ul className="mt-2 space-y-1.5">
                  {liveDefects.slice(0, 8).map((d, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-[14px] text-white"
                    >
                      <span className="font-semibold text-white">
                        {d.component || "Complaint"}
                      </span>
                      {d.summary ? ` — ${d.summary}` : null}
                    </li>
                  ))}
                </ul>
              </details>
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

          <p className="px-1 pb-6 text-[12px] text-white">
            Confirm brochure, door sticker, and NHTSA before you buy.
          </p>
        </div>
      </div>

      {correctOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Correct powertrain specs"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#0c1220] p-4 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-gold">
                  CORRECT THIS SPEC
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-white">
                  {year} {make} {model}
                  {floorplan ? ` · ${floorplan}` : ""}
                </p>
                <p className="mt-1 text-[11px] text-white/55">
                  Saves a local override on this device. Export pins to share
                  with ops or pin into the catalog later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCorrectOpen(false)}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70"
              >
                Close
              </button>
            </div>
            <div className="space-y-2.5">
              {(
                [
                  ["Engine", correctEngine, setCorrectEngine],
                  ["Horsepower", correctHp, setCorrectHp],
                  ["Torque (lb-ft)", correctTorque, setCorrectTorque],
                  ["Chassis", correctChassis, setCorrectChassis],
                  ["Transmission", correctTrans, setCorrectTrans],
                  ["Fuel", correctFuel, setCorrectFuel],
                  ["Note", correctNote, setCorrectNote],
                ] as const
              ).map(([label, val, setVal]) => (
                <label key={label} className="block">
                  <span className="text-[10px] font-bold tracking-wide text-white/50">
                    {label}
                  </span>
                  <input
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-gold/50"
                    inputMode={
                      label === "Horsepower" || label.startsWith("Torque")
                        ? "numeric"
                        : "text"
                    }
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const hp = parseInt(correctHp.replace(/[^\d]/g, ""), 10);
                  const tq = parseInt(correctTorque.replace(/[^\d]/g, ""), 10);
                  saveLocalSpecOverride({
                    year,
                    make,
                    model,
                    floorplan: floorplan || "",
                    engine: correctEngine || undefined,
                    horsepower: Number.isFinite(hp) && hp > 0 ? hp : undefined,
                    torqueLbFt: Number.isFinite(tq) && tq > 0 ? tq : undefined,
                    chassis: correctChassis || undefined,
                    transmission: correctTrans || undefined,
                    fuelType: correctFuel || undefined,
                    note: correctNote || "User correction from report",
                  });
                  setCorrectBump((n) => n + 1);
                  setCorrectOpen(false);
                  setCorrectMsg("Local correction saved · exportable pin.");
                }}
                className="flex-1 rounded-full border border-gold/45 bg-gold/20 py-2.5 text-[13px] font-bold text-gold-bright"
              >
                Save correction
              </button>
              <button
                type="button"
                onClick={() => setCorrectOpen(false)}
                className="rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
    <section className="glass-prestige rounded-[1.25rem] px-5 py-5">
      <h2 className="mb-4 text-[18px] font-bold tracking-tight text-white">
        {title}
      </h2>
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
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-2.5 last:border-0">
      <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-white">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[60%] text-right text-[14px] font-medium tabular-nums leading-snug text-white",
          accent && "font-semibold",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
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
    <div className="rounded-2xl border border-white/10 bg-black/25 px-2.5 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold tabular-nums text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-white">{sub}</p>
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
      <p className="text-[11px] font-semibold tracking-wide text-white">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-white">{value}</p>
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
    <div className="rounded-2xl border border-white/10 bg-black/25 px-2 py-3 text-center">
      <p
        className={cn(
          "text-[13px] font-semibold tabular-nums",
          warn ? "text-amber" : "text-white",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        {label}
      </p>
    </div>
  );
}
