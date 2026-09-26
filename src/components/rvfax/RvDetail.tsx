import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  GitCompare,
  Heart,
  Loader2,
  MapPin,
  MoreHorizontal,
  Store,
  Printer,
  Sparkles,
  Truck,
} from "lucide-react";
import type { RVResult } from "@/lib/rv/catalog";
import {
  estimateMarket,
  floorplansForSelectedYear,
  formatMoney,
  getFloorplansForYear,
  relatedModelsWithFloorplansInYear,
  sourcedFloorplansByYear,
  yearsWithSourcedFloorplans,
  useCatalogReady,
} from "@/lib/rv/catalog";
import {
  bestCalPrice,
  formatActiveCoachChip,
  formatActiveCoachShort,
  snapshotActiveCoach,
} from "@/lib/rv/activeCoach";
import { offerFromFactsReport } from "@/lib/tow/factsTowHandoff";
import {
  getRatingMetadata,
  ratingStars,
} from "@/lib/rv/ratingSystem";
import {
  computeTorqueToWeight,
} from "@/lib/rv/torqueToWeight";
import {
  OWNER_REVIEW_FOOTER,
  formatOwnerReviewScore,
  mapReportRatings,
} from "@/lib/rv/reportRatings";
import { hasConcreteFloorplan } from "@/lib/rv/factsOpen";
import { buildFactsBrochureSpecs } from "@/lib/rv/factsSheet";
import { motorhomeOmits } from "@/lib/rv/brochureSpecs";
import { fetchLotSnapshot } from "@/lib/lot/ownLotPage";
import { registerLotCatalogUnits } from "@/lib/rv/lotCatalogUnits";
import {
  catalogSnapshotFromBrochure,
  displayFromPainted,
  emptySpecFields,
  fetchSpecFieldFallback,
  resolveSharedSpecPaint,
  type SpecFieldFill,
} from "@/lib/rv/specEngine";
import {
  clearWeightField,
  findWeightOverride,
  saveWeightOverride,
} from "@/lib/rv/weightOverrides";
import {
  findPowertrainCorrection,
  sanitizeNarrativeForPin,
} from "@/lib/rv/powertrainCorrections";
import {
  resolveHardPowertrain,
  type PowertrainTrust,
} from "@/lib/rv/livePowertrainGuard";
import {
  formatFactsHorsepower,
  formatFactsTorque,
  omitInventPolicyProse,
} from "@/lib/rv/catalogHonesty";
import {
  findLocalSpecOverride,
  removeLocalSpecOverride,
  saveLocalSpecOverride,
} from "@/lib/rv/localSpecOverrides";
import { getMaintenanceSchedule } from "@/lib/rv/rvTypes";
import { getMockReviews } from "@/lib/rv/rvReviews";
import {
  fetchLiveDossier,
  liveMarketLadder,
  mergeLiveIntoDisplay,
  peekVerifiedDossier,
  refreshCoachDossierCache,
  type LiveDossier,
} from "@/lib/rv/liveDossier";
import { planFactsDossierResearch } from "@/lib/rv/factsDossierGapPlan";
import {
  factsDetailFieldSearching,
  factsDetailSearchingFields,
} from "@/lib/rv/factsDetailGapSpinners";
import {
  CATALOG_ESTIMATE_LABEL,
  LOW_CONFIDENCE_LISTINGS_MESSAGE,
  PUBLIC_SOLD_DISCLAIMER,
  SOLD_COMPS_LABEL,
  compsConfidenceLabel,
  prefersPublicComps,
  resolvePrimaryMarket,
  thinSoldAskUsd,
  type PublicListingComps,
} from "@/lib/rv/publicListingComps";
import {
  isJdPowerMarketSource,
  type JdPowerPublicEstimate,
} from "@/lib/rv/jdPowerPublic";
import { hideRetailHighForDesk } from "@/lib/rv/marketClamp";
import { paintFactsLowDeskMarket } from "@/lib/rv/marketEstimate";
import {
  CATALOG_GAP_LABEL,
  FACTS_MARKET_ERROR_MESSAGE,
  FACTS_MARKET_IDLE_HEADLINE,
  FACTS_MARKET_LOADING_MESSAGE,
  factsMarketAverageCaption,
  factsMarketAverageUsd,
  factsMarketIsThinSample,
  fetchFactsMarketLive,
  type FactsMarketLiveStatus,
} from "@/lib/rv/factsMarketBands";
import { fetchRecallsViaApi } from "@/lib/nhtsa/recalls";
import type { NhtsaComplaint, NhtsaRecall } from "@/lib/nhtsa/recalls";
import { buildReportId, valueFactors } from "@/lib/rv/reportMeta";
import { exportVehicleReport } from "@/lib/rv/exportReport";
import { hydrateShareCoachResult, kitStrengths, lifestylePitch } from "@/lib/rv/shareKit";
import { RvShareKit } from "@/components/rvshare/RvShareKit";
import {
  fetchAutocomplete,
  fetchListingDetail,
  fetchLocalInventory,
  fetchNearbyDealers,
  loadInventoryZip,
  saveInventoryZip,
} from "@/lib/marketcheck/client";
import type {
  McAutocompleteTerm,
  McDealerCard,
  McListingCard,
  McListingDetail,
  McYearRange,
} from "@/lib/marketcheck/types";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchAutocomplete,
} from "@/lib/marketcheck/guards";
import {
  DEFAULT_YEAR_PAD,
  medianListingPrice,
  yearRangeFromCenter,
} from "@/lib/marketcheck/yearRange";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { PullRefreshLayer } from "@/components/shell/PullResetHint";
import { SuiteRaidhoBackdrop } from "@/components/shell/SuitePage";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import { cn } from "@/lib/utils";
import { findOemFloorplanSpec } from "@/lib/rv/floorplanSpecs";
import { standoutFeatureChips } from "@/lib/rv/catalogFeatureChips";
import { shouldShowRvVideoPrompt } from "@/lib/rv/rvVideos";
import { RvVideoLibraryCard } from "./RvVideoLibraryCard";
import { FactsCollapse } from "./FactsCollapse";
import { FactsMarketBands } from "./FactsMarketBands";
import {
  factsInventoryHeadline,
  factsMoneyHeadline,
  factsOwnerHeadline,
  factsRecallHeadline,
  factsSpecsHeadline,
} from "@/lib/rv/factsCollapse";

/**
 * Vehicle History Report — catalog paints instantly; Live Grok updates soft fields.
 * Phase 1: year-banded powertrain always paints from the selected wizard year.
 * Brochure powertrain pins always win over Live Grok (prevents ISL/V10 hallucinations).
 */
export function RvDetail({
  result,
  shareFocusToken = 0,
  marketFocusToken = 0,
  onBack,
  saved,
  onToggleSave,
  comparing = false,
  compareCount = 0,
  compareFull = false,
  onToggleCompare,
  onOpenCompare,
  onStartCompare,
  onSell,
  onAskGrok,
}: {
  result: RVResult;
  shareFocusToken?: number;
  marketFocusToken?: number;
  onBack: () => void;
  saved: boolean;
  onToggleSave: () => void;
  comparing?: boolean;
  compareCount?: number;
  compareFull?: boolean;
  onToggleCompare?: () => void;
  onOpenCompare?: () => void;
  onStartCompare?: () => void;
  onSell?: () => void;
  onAskGrok: () => void;
}) {
  const { ready: catalogReady } = useCatalogReady();
  const coach = useMemo(
    () => hydrateShareCoachResult(result),
    [result, catalogReady],
  );
  const { data, year, make, model } = coach;
  const floorplan = hasConcreteFloorplan(coach.floorplan)
    ? String(coach.floorplan).trim()
    : "";
  const catalogMarket = estimateMarket(data, year, floorplan, { make, model });
  const specIdentity = useMemo(
    () => ({ year, make, model, floorplan }),
    [year, make, model, floorplan],
  );
  const [correctBump, setCorrectBump] = useState(0);
  const [lotBump, setLotBump] = useState(0);
  const brochure = useMemo(
    () => buildFactsBrochureSpecs(data, year, make, model, floorplan || ""),
    // correctBump / lotBump re-read local overrides and lot snapshot fills
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, year, make, model, floorplan, correctBump, lotBump],
  );
  const maintenance = useMemo(() => getMaintenanceSchedule(data), [data]);

  useEffect(() => {
    let cancelled = false;
    fetchLotSnapshot()
      .then((snap) => {
        if (cancelled) return;
        registerLotCatalogUnits(snap.units);
        setLotBump((n) => n + 1);
      })
      .catch(() => {
        /* seed still fills printed Coast rows */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  const liveRecallCount = recallLoading ? null : liveRecalls.length;
  const ratingMeta = useMemo(
    () =>
      getRatingMetadata(make, model, year, {
        recallCount: liveRecallCount,
      }),
    [make, model, year, liveRecallCount],
  );

  const [live, setLive] = useState<LiveDossier | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveRetry, setLiveRetry] = useState(0);
  const [publicComps, setPublicComps] = useState<PublicListingComps | null>(
    null,
  );
  const [jdPower, setJdPower] = useState<JdPowerPublicEstimate | null>(null);
  const [compsLoading, setCompsLoading] = useState(false);
  const [marketLive, setMarketLive] = useState<FactsMarketLiveStatus>("idle");
  const [compsError, setCompsError] = useState<string | null>(null);
  const [marketRetry, setMarketRetry] = useState(0);

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
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
  const [invYearPad, setInvYearPad] = useState(DEFAULT_YEAR_PAD);
  const [invMake, setInvMake] = useState(make);
  const [invModel, setInvModel] = useState(model);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [invListings, setInvListings] = useState<McListingCard[]>([]);
  const [invSearched, setInvSearched] = useState(false);
  const [invQueryRange, setInvQueryRange] = useState<McYearRange | null>(null);
  const [acFocus, setAcFocus] = useState<"make" | "model" | null>(null);
  const [acTerms, setAcTerms] = useState<McAutocompleteTerm[]>([]);
  const [dealers, setDealers] = useState<McDealerCard[]>([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<McDealerCard | null>(
    null,
  );
  const [lotWide, setLotWide] = useState(false);
  const [openListingId, setOpenListingId] = useState<string | null>(null);
  const [listingDetail, setListingDetail] = useState<McListingDetail | null>(
    null,
  );
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const wasSavedRef = useRef(saved);
  const [specFills, setSpecFills] = useState<SpecFieldFill[]>([]);
  const [specFallbackLoading, setSpecFallbackLoading] = useState(false);

  const pull = usePullToReset(scrollRef, onBack);

  useEffect(() => {
    if (!shareFocusToken) return;
    const root = scrollRef.current;
    if (!root) return;
    setShareOpen(true);
    const t = window.setTimeout(() => {
      const el = root.querySelector("[data-share-kit]");
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [shareFocusToken]);

  useEffect(() => {
    if (!marketFocusToken) return;
    const root = scrollRef.current;
    if (!root) return;
    setMarketOpen(true);
    const t = window.setTimeout(() => {
      const el = root.querySelector("[data-facts-market-value]");
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [marketFocusToken]);

  useEffect(() => {
    setInvMake(make);
    setInvModel(model);
    setSelectedDealer(null);
    setLotWide(false);
    setOpenListingId(null);
    setListingDetail(null);
    setAcFocus(null);
    setAcTerms([]);
  }, [year, make, model]);

  useEffect(() => {
    if (!acFocus) {
      setAcTerms([]);
      return;
    }
    const input = acFocus === "make" ? invMake : invModel;
    if (!shouldFetchAutocomplete(input)) {
      setAcTerms([]);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      void fetchAutocomplete({
        field: acFocus,
        input,
        make: acFocus === "model" ? invMake : undefined,
        signal: ctrl.signal,
      }).then((res) => {
        if (ctrl.signal.aborted || !res.ok) return;
        setAcTerms(res.terms);
      });
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [acFocus, invMake, invModel]);

  useEffect(() => {
    if (saved && !wasSavedRef.current) {
      setSaveFlash("Saved");
      const t = window.setTimeout(() => setSaveFlash(null), 1800);
      wasSavedRef.current = saved;
      return () => window.clearTimeout(t);
    }
    wasSavedRef.current = saved;
  }, [saved]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent | PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [moreOpen]);

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

  // Same candidate the dossier POST sends — gap planner must match browse.
  const catalogCandidate = useMemo(
    () => ({
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
      gvwrLbs: brochure.gvwrLbs ?? null,
      uvw: brochure.uvwEstimated ? null : brochure.uvw,
      uvwLbs: brochure.uvwEstimated ? null : (brochure.uvwLbs ?? null),
      uvwEstimated: brochure.uvwEstimated,
      freshWater: brochure.freshWater,
      grayWater: brochure.grayWater,
      blackWater: brochure.blackWater,
      ccc: brochure.ccc,
      propane: brochure.propane,
      mpgHighway: brochure.mpgHighway,
    }),
    [brochure, floorplan, data.fuelType, data.type],
  );

  const dossierGapPlan = useMemo(
    () =>
      planFactsDossierResearch({
        year,
        make,
        model,
        floorplan,
        candidate: catalogCandidate,
      }),
    [year, make, model, floorplan, catalogCandidate],
  );

  const gapSearching = useMemo(
    () =>
      factsDetailSearchingFields({
        liveLoading,
        skipLive: dossierGapPlan.skipLive,
        gaps: dossierGapPlan.gaps,
      }),
    [liveLoading, dossierGapPlan],
  );

  useEffect(() => {
    if (!floorplan) {
      setSpecFills([]);
      setSpecFallbackLoading(false);
      return;
    }
    const snap = catalogSnapshotFromBrochure(specIdentity, brochure);
    const empty = emptySpecFields(snap);
    if (!empty.length) {
      setSpecFills([]);
      setSpecFallbackLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setSpecFallbackLoading(true);
    fetchSpecFieldFallback(
      {
        year,
        make,
        model,
        floorplan,
        empty,
        rvClass: data.type,
      },
      ctrl.signal,
    ).then((fills) => {
      if (ctrl.signal.aborted) return;
      setSpecFills(fills);
      setSpecFallbackLoading(false);
    });
    return () => {
      ctrl.abort();
    };
  }, [year, make, model, floorplan, brochure, data.type, specIdentity]);

  const sharedPaint = useMemo(
    () => resolveSharedSpecPaint(specIdentity, specFills),
    [specIdentity, specFills],
  );

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
  }, [year, make, model, floorplan, liveRetry, catalogCandidate]);

  // Market value is on-demand — user open / ask only. Do not prefetch.
  useEffect(() => {
    if (!marketOpen) return;
    const ctrl = new AbortController();
    let cancelled = false;
    setCompsLoading(true);
    setMarketLive("loading");
    setCompsError(null);
    setPublicComps(null);
    setJdPower(null);
    fetchFactsMarketLive({ year, make, model, floorplan }, ctrl.signal)
      .then((res) => {
        if (cancelled) return;
        if (res.status === "error") {
          setPublicComps(null);
          setJdPower(null);
          setCompsError(res.error);
          setMarketLive("error");
          return;
        }
        setPublicComps(res.comps);
        setJdPower(res.jdPower);
        setCompsError(null);
        setMarketLive(res.status);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setPublicComps(null);
        setJdPower(null);
        setCompsError(
          e instanceof Error && e.message.trim()
            ? e.message
            : FACTS_MARKET_ERROR_MESSAGE,
        );
        setMarketLive("error");
      })
      .finally(() => {
        if (!cancelled) setCompsLoading(false);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [marketOpen, year, make, model, floorplan, marketRetry]);

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
      propane: brochure.propane,
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
    const hardHp = formatFactsHorsepower({
      engine: powertrainGuard.hard.engine || catalogSpecs.engine,
      horsepower:
        powertrainGuard.hard.horsepower ??
        omitInventPolicyProse(catalogSpecs.horsepower),
    });
    const hardTq = formatFactsTorque({
      engine: powertrainGuard.hard.engine || catalogSpecs.engine,
      torqueLbFt:
        powertrainGuard.hard.torqueLbFt ??
        omitInventPolicyProse(catalogSpecs.torque),
    });

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

    const keepReal = (
      catalog: string | null | undefined,
      searched: string | null | undefined,
    ) => {
      const gap =
        /^(?:confirm brochure|gap|n\/?a|tbd|unknown|null|—|-|–)?$/i;
      const c = (catalog ?? "").trim();
      const s = (searched ?? "").trim();
      if (s && (!c || gap.test(c))) return s;
      return c || s;
    };
    if (brochurePinned) {
      return {
        ...merged,
        lengthFt: keepReal(catalogSpecs.lengthFt, merged.lengthFt),
        exteriorWidth: keepReal(catalogSpecs.exteriorWidth, merged.exteriorWidth),
        exteriorHeight: keepReal(catalogSpecs.exteriorHeight, merged.exteriorHeight),
        interiorHeight: keepReal(catalogSpecs.interiorHeight, merged.interiorHeight),
        gvwr: keepReal(catalogSpecs.gvwr, merged.gvwr),
        uvw: keepReal(catalogSpecs.uvw, merged.uvw),
        ccc: keepReal(catalogSpecs.ccc, merged.ccc),
        freshWater: keepReal(catalogSpecs.freshWater, merged.freshWater),
        grayWater: keepReal(catalogSpecs.grayWater, merged.grayWater),
        blackWater: keepReal(catalogSpecs.blackWater, merged.blackWater),
        propane: keepReal(catalogSpecs.propane, merged.propane),
        generator: keepReal(catalogSpecs.generator, merged.generator),
        mpgHighway: keepReal(catalogSpecs.mpgHighway, merged.mpgHighway),
        warranty: keepReal(catalogSpecs.warranty, merged.warranty),
        garageLength: keepReal(catalogSpecs.garageLength, merged.garageLength),
        garageWidth: keepReal(catalogSpecs.garageWidth, merged.garageWidth),
        garageHeight: keepReal(catalogSpecs.garageHeight, merged.garageHeight),
        garageCapacity: keepReal(catalogSpecs.garageCapacity, merged.garageCapacity),
        rampWidth: keepReal(catalogSpecs.rampWidth, merged.rampWidth),
        fuelStation: keepReal(catalogSpecs.fuelStation, merged.fuelStation),
        garageFits: keepReal(catalogSpecs.garageFits, merged.garageFits),
        isToyHauler: catalogSpecs.isToyHauler || merged.isToyHauler,
      };
    }
    return {
      ...merged,
      propane: keepReal(catalogSpecs.propane, merged.propane),
    };
  }, [catalogSpecs, live, brochurePinned, powertrainGuard]);

  const sheetOmits = motorhomeOmits({
    type: data.type || specs.type,
    fuelType: specs.fuelType || data.fuelType,
  });

  const displayRating = ratingMeta.score;

  const weightOverride = useMemo(
    () =>
      floorplan
        ? findWeightOverride(year, make, model, floorplan)
        : null,
    // correctBump refreshes local UVW / GVWR overrides
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, make, model, floorplan, correctBump],
  );

  const torqueToWeight = useMemo(
    () =>
      computeTorqueToWeight({
        torqueLbFt: powertrainGuard.hard.torqueLbFt,
        torqueRaw: specs.torque,
        uvwLbs:
          weightOverride?.uvwLbs ??
          (sharedPaint.uvw.gap ? null : sharedPaint.uvw.lbs) ??
          (brochure.uvwEstimated ? null : brochure.uvwLbs) ??
          live?.uvwLbs ??
          null,
        uvwRaw:
          sharedPaint.uvw.gap || brochure.uvwEstimated ? null : specs.uvw,
        overrideUvwLbs: weightOverride?.uvwLbs ?? null,
        gvwrLbs: sharedPaint.gvwr.lbs ?? brochure.gvwrLbs ?? live?.gvwrLbs ?? null,
        gvwrRaw: specs.gvwr,
        overrideGvwrLbs: weightOverride?.gvwrLbs ?? null,
        rvType: data.type,
        fuelType: data.fuelType,
        chassis:
          powertrainGuard.hard.chassis ||
          brochure.chassis ||
          specs.chassis ||
          data.chassis,
        engine: powertrainGuard.hard.engine || specs.engine,
        cccLbs: sharedPaint.ccc.lbs ?? brochure.cccLbs ?? live?.cccLbs ?? null,
        cccRaw: specs.ccc,
      }),
    [
      powertrainGuard.hard.torqueLbFt,
      powertrainGuard.hard.chassis,
      powertrainGuard.hard.engine,
      specs.torque,
      specs.uvw,
      specs.gvwr,
      specs.ccc,
      specs.chassis,
      specs.engine,
      sharedPaint.uvw.lbs,
      sharedPaint.uvw.gap,
      sharedPaint.uvw.display,
      sharedPaint.gvwr.lbs,
      sharedPaint.ccc.lbs,
      brochure.uvwLbs,
      brochure.uvwEstimated,
      brochure.gvwrLbs,
      brochure.cccLbs,
      brochure.chassis,
      live?.uvwLbs,
      live?.gvwrLbs,
      live?.cccLbs,
      weightOverride?.uvwLbs,
      weightOverride?.gvwrLbs,
      data.type,
      data.fuelType,
      data.chassis,
    ],
  );

  const reportRatings = useMemo(
    () => mapReportRatings({ make, model, year }),
    [make, model, year],
  );

  // Q = overallQuality or GAP. R = RvFOX reputation (GAP if make unknown). S = combined once.
  const ratingsRows: Array<{
    key: string;
    label: string;
    score: number | null;
    caption: string | null;
  }> = [
    {
      key: "quality",
      label: "Quality",
      score: reportRatings.quality.score,
      caption: reportRatings.quality.caption,
    },
    {
      key: "reliability",
      label: "Reliability",
      score: reportRatings.reliability.score,
      caption: reportRatings.reliability.caption,
    },
    {
      key: "satisfaction",
      label: "Customer satisfaction",
      score: reportRatings.customerSatisfaction.score,
      caption: reportRatings.customerSatisfaction.caption,
    },
  ];

  const torqueBarPct =
    torqueToWeight.score == null
      ? 0
      : Math.min(100, Math.max(0, (torqueToWeight.score / 10) * 100));
  const torqueBarColor =
    torqueToWeight.color === "red"
      ? "var(--color-ruby)"
      : torqueToWeight.color === "yellow"
        ? "var(--color-amber)"
        : "var(--color-green)";
  const torqueRatioLabel = torqueToWeight.na
    ? "N/A"
    : torqueToWeight.gap || torqueToWeight.ratio == null
      ? "GAP"
      : torqueToWeight.ratio.toFixed(1);

  const ownerReviews = useMemo(
    () => getMockReviews(make, model, displayRating),
    [make, model, displayRating],
  );

  const liveLadder = liveMarketLadder(live?.live ? live : null);
  const market = useMemo(
    () =>
      resolvePrimaryMarket({
        catalog: catalogMarket,
        liveLadder,
        comps: publicComps,
        jdPower,
      }),
    [catalogMarket, liveLadder, publicComps, jdPower],
  );
  const marketUpdating = compsLoading || marketLive === "loading";
  const marketPainted = marketLive === "ready" || marketLive === "gap";
  const showSoldRange = prefersPublicComps(publicComps);
  const soldConfidence = publicComps?.confidence ?? "low";
  const hideRetailHigh =
    soldConfidence === "low" ||
    hideRetailHighForDesk({
      soldConfidence,
      showSoldRange,
      hideRetailHigh: market.hideRetailHigh,
    });
  const soldConfidenceLabel = compsConfidenceLabel(soldConfidence);

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

  const productStrengths = useMemo(
    () => kitStrengths(result, undefined, displayRating),
    [result, displayRating],
  );
  const lifestyleLine = useMemo(
    () => lifestylePitch(displayType),
    [displayType],
  );

  const paintedLowDesk = useMemo(
    () =>
      paintFactsLowDeskMarket(catalogMarket, {
        thinSoldUsd: thinSoldAskUsd(publicComps),
        live: liveLadder,
      }),
    [catalogMarket, publicComps, liveLadder],
  );
  /** Low tiles use catalog haircut unless an on-demand public JD parse won. */
  const deskMarket =
    showSoldRange || isJdPowerMarketSource(market.source)
      ? market
      : paintedLowDesk;
  const financePrice = bestCalPrice(deskMarket);
  /** Average tile: marketValue, else midpoint of retailLow / retailHigh. */
  const bandAverage = factsMarketAverageUsd(deskMarket);
  const compsSoldSample =
    publicComps?.source === "public_listings"
      ? publicComps.soldSampleSize
      : undefined;
  const compsSample =
    publicComps?.source === "public_listings"
      ? publicComps.sampleSize
      : undefined;
  const marketConfidence = deskMarket.confidence ?? soldConfidence;
  const thinSample = factsMarketIsThinSample({
    confidence: marketConfidence,
    soldSampleSize: compsSoldSample,
    sampleSize: compsSample,
  });
  const averageCaption = factsMarketAverageCaption({
    confidence: marketConfidence,
    source: deskMarket.source,
    sourceLabel: deskMarket.sourceLabel,
    thin: thinSample,
  });
  /** Gold Low heading stays Catalog estimate on GAP; Average cue is Catalog GAP. */
  const marketSourceLabel =
    averageCaption === CATALOG_GAP_LABEL
      ? CATALOG_ESTIMATE_LABEL
      : (averageCaption ??
        (showSoldRange ? SOLD_COMPS_LABEL : CATALOG_ESTIMATE_LABEL));
  const coachChip = formatActiveCoachChip({
    year,
    make,
    model,
    floorplan: floorplan || "",
  });
  const coachShort = formatActiveCoachShort({
    year,
    make,
    model,
    floorplan: floorplan || "",
  });

  const factsTowOffer = () =>
    offerFromFactsReport({
      year,
      make,
      model,
      floorplan,
      rvType: displayType,
      gvwr: specs.gvwr,
      towingCapacityLbs: data.towingCapacity,
    });

  const openCheckTow = () => {
    shellNav?.openTowWithCoach(factsTowOffer());
  };

  const openCheckPayment = (price = financePrice, label = coachChip) => {
    shellNav?.openCalWithPrice(price, label);
  };

  const setActiveCoach = shellNav?.setActiveCoach;
  useEffect(() => {
    setActiveCoach?.(
      snapshotActiveCoach({
        year,
        make,
        model,
        floorplan,
        rvType: displayType,
        price: financePrice,
        gvwr: specs.gvwr,
        uvw: specs.uvw,
        towingCapacityLbs: data.towingCapacity,
      }),
    );
  }, [
    year,
    make,
    model,
    floorplan,
    displayType,
    financePrice,
    specs.gvwr,
    specs.uvw,
    data.towingCapacity,
    setActiveCoach,
  ]);

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

  const floorplansShown = useMemo(
    () => floorplansForSelectedYear(year, make, model, live),
    [year, make, model, live],
  );

  const sourcedYears = useMemo(
    () => yearsWithSourcedFloorplans(make, model),
    [make, model],
  );

  const historicalFloorplans = useMemo(() => {
    const y = parseInt(year, 10);
    return sourcedFloorplansByYear(make, model).filter(
      (row) => !Number.isFinite(y) || row.year !== y,
    );
  }, [make, model, year]);

  const relatedModels = useMemo(
    () => relatedModelsWithFloorplansInYear(make, model, year),
    [make, model, year],
  );

  const emptyYearFloorplans = useMemo(() => {
    const y = parseInt(year, 10);
    if (!Number.isFinite(y)) return false;
    return getFloorplansForYear(year, make, model).length === 0;
  }, [year, make, model]);

  const noYearFloorplanBrowse = useMemo(() => {
    const y = parseInt(year, 10);
    return !year || !Number.isFinite(y);
  }, [year]);

  const featureChips = useMemo(() => {
    const oem = findOemFloorplanSpec(year, make, model, floorplan || "");
    return standoutFeatureChips({
      liveFeatures: live?.live ? live.keyFeatures : [],
      spec: data,
      pin: powertrainPin,
      verifiedNotes: [oem?.layoutNote, oem?.note],
    });
  }, [live, powertrainPin, data, year, make, model, floorplan]);

  const mcError = (res: { code?: string; error?: string }) =>
    res.code === "missing_key"
      ? "MarketCheck not configured on server"
      : res.error || "Inventory search unavailable";

  const runInventorySearch = async (opts?: {
    dealerId?: string;
    allDealerInventory?: boolean;
  }) => {
    const zip = invZip.trim();
    if (!/^\d{5}$/.test(zip)) {
      setInvError("Enter a 5-digit ZIP");
      return;
    }
    saveInventoryZip(zip);
    const dealerId = opts?.dealerId ?? selectedDealer?.id;
    const allDealer = opts?.allDealerInventory ?? lotWide;
    setLotWide(allDealer);
    setInvLoading(true);
    setInvError(null);
    setInvSearched(true);
    setOpenListingId(null);
    setListingDetail(null);
    const res = await fetchLocalInventory({
      year,
      make: invMake.trim() || make,
      model: invModel.trim() || model,
      zip,
      radius: invRadius,
      yearPad: invYearPad,
      dealerId,
      allDealerInventory: Boolean(dealerId && allDealer),
    });
    setInvLoading(false);
    if (!res.ok) {
      setInvListings([]);
      setInvQueryRange(null);
      setInvError(mcError(res));
      return;
    }
    setInvListings(res.listings || []);
    setInvQueryRange(res.query?.yearRange ?? yearRangeFromCenter(Number(year), invYearPad));
    if (!res.listings?.length) {
      setInvError(
        dealerId
          ? allDealer
            ? "No listings at this lot"
            : "No matching units at this lot"
          : "No local listings found",
      );
    }
  };

  const runDealerSearch = async () => {
    const zip = invZip.trim();
    if (!/^\d{5}$/.test(zip)) {
      setInvError("Enter a 5-digit ZIP");
      return;
    }
    saveInventoryZip(zip);
    setDealersLoading(true);
    setInvError(null);
    const res = await fetchNearbyDealers({
      zip,
      radius: invRadius,
    });
    setDealersLoading(false);
    if (!res.ok) {
      setDealers([]);
      setInvError(mcError(res));
      return;
    }
    setDealers(res.dealers || []);
    if (!res.dealers?.length) setInvError("No RV dealers nearby");
  };

  const pickDealer = (dealer: McDealerCard) => {
    setSelectedDealer(dealer);
    setLotWide(false);
    void runInventorySearch({ dealerId: dealer.id, allDealerInventory: false });
  };

  const openShortlistCard = (card: McListingCard) => {
    if (openListingId === card.id) {
      setOpenListingId(null);
      setListingError(null);
      return;
    }
    setOpenListingId(card.id);
    setListingError(null);
    setListingLoading(true);
    setListingDetail(null);
    void fetchListingDetail({ listingId: card.id }).then((res) => {
      setListingLoading(false);
      if (!res.ok) {
        setListingDetail(null);
        setListingError(mcError(res));
        return;
      }
      setListingDetail(res.listing);
    });
  };

  const invYearWindow = useMemo(
    () => invQueryRange ?? yearRangeFromCenter(Number(year), invYearPad),
    [invQueryRange, year, invYearPad],
  );
  const invRadiusShown = Math.min(100, invRadius);

  const invMedian = useMemo(
    () => medianListingPrice(invListings.map((l) => l.price)),
    [invListings],
  );

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
          tradeIn: formatMoney(deskMarket.tradeIn),
          retailLow: formatMoney(deskMarket.retailLow),
          retailHigh: formatMoney(deskMarket.retailHigh),
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
          tradeCappedAtRetailLow: Boolean(deskMarket.tradeCappedAtRetailLow),
          strengths: productStrengths,
          lifestyle: lifestyleLine,
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
    <div
      className="rvfax-screen relative flex h-full flex-col overflow-hidden bg-bg text-white"
      data-readable-cards=""
      data-coach-detail=""
      data-raidho-only=""
    >
      <SuiteRaidhoBackdrop bleed />

      <div
        ref={scrollRef}
        data-app-scroll
        data-rvfax-scroll
        className="rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        <PullRefreshLayer state={pull} label="Release to go back">
        {/* Sticky under the iPhone clock / Dynamic Island */}
        <div
          className="rvfax-report-chrome sticky top-0 z-30 border-b border-white/15"
          data-no-export
        >
          <div className="mx-auto flex w-full max-w-lg items-center gap-1.5 px-3 pb-2 sm:px-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-white/20 bg-black/50 px-3 text-[12px] font-bold text-white"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
            <p
              className="min-w-0 flex-1 truncate text-[12px] font-bold text-white"
              title={coachChip}
            >
              {coachShort}
            </p>
            <button
              type="button"
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save this report"}
              onClick={onToggleSave}
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center rounded-full border",
                saved
                  ? "border-ruby/70 bg-ruby/90 text-white"
                  : "border-white/20 bg-black/50 text-white",
              )}
            >
              <Heart className={cn("size-4", saved && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={onAskGrok}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-blue/50 bg-blue/30 px-3 text-[12px] font-bold text-white shadow-[0_0_16px_rgba(80,160,255,0.28)]"
            >
              <Sparkles className="size-3.5 text-blue" />
              Ask Grok
            </button>
            <div className="relative shrink-0" ref={moreRef}>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                aria-label="More report actions"
                onClick={() => setMoreOpen((o) => !o)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white"
              >
                <MoreHorizontal className="size-5" />
              </button>
              {moreOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 w-52 overflow-hidden rounded-xl border border-white/15 bg-[#0a1220] py-1 shadow-lg"
                >
                  <OverflowItem
                    icon={<Heart className={cn("size-3.5", saved && "fill-current")} />}
                    label={saved ? "Remove from Saved" : "Save to list"}
                    onClick={() => {
                      onToggleSave();
                      setMoreOpen(false);
                    }}
                  />
                  {onToggleCompare ? (
                    <OverflowItem
                      icon={<GitCompare className="size-3.5" />}
                      label={
                        comparing
                          ? `In compare${compareCount ? ` · ${compareCount}` : ""}`
                          : compareFull
                            ? "Compare full"
                            : "Compare"
                      }
                      disabled={!comparing && compareFull}
                      onClick={() => {
                        onToggleCompare();
                        setMoreOpen(false);
                      }}
                    />
                  ) : null}
                  {onSell ? (
                    <OverflowItem
                      icon={<CircleDollarSign className="size-3.5 text-green" />}
                      label="Log as Sold"
                      onClick={() => {
                        onSell();
                        setMoreOpen(false);
                      }}
                    />
                  ) : null}
                  {onStartCompare ? (
                    <OverflowItem
                      icon={<GitCompare className="size-3.5" />}
                      label={
                        compareCount >= 2
                          ? `Compare ${compareCount} units`
                          : "Compare with peers"
                      }
                      onClick={() => {
                        onStartCompare();
                        setMoreOpen(false);
                      }}
                    />
                  ) : onOpenCompare && compareCount >= 2 ? (
                    <OverflowItem
                      icon={<GitCompare className="size-3.5" />}
                      label="Open compare"
                      onClick={() => {
                        onOpenCompare();
                        setMoreOpen(false);
                      }}
                    />
                  ) : null}
                  {shellNav ? (
                    <OverflowItem
                      icon={<Calculator className="size-3.5" />}
                      label="Check payment"
                      onClick={() => {
                        openCheckPayment();
                        setMoreOpen(false);
                      }}
                    />
                  ) : null}
                  {shellNav ? (
                    <OverflowItem
                      icon={<Truck className="size-3.5" />}
                      label="Check tow"
                      onClick={() => {
                        openCheckTow();
                        setMoreOpen(false);
                      }}
                    />
                  ) : null}
                  <OverflowItem
                    icon={
                      exportBusy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Printer className="size-3.5" />
                      )
                    }
                    label="PDF"
                    disabled={exportBusy}
                    onClick={() => {
                      void exportPdf();
                      setMoreOpen(false);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          {onSell || onStartCompare ? (
            <div
              className="mx-auto flex w-full max-w-lg gap-2 px-3 pb-2 sm:px-5"
              data-facts-compare-entry=""
            >
              {onSell ? (
                <button
                  type="button"
                  data-facts-sold=""
                  onClick={onSell}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-full border border-green/40 bg-green/15 px-4 text-[13px] font-bold text-green",
                    onStartCompare ? "flex-1" : "w-full",
                  )}
                >
                  Sold
                </button>
              ) : null}
              {onStartCompare ? (
                <button
                  type="button"
                  data-facts-compare=""
                  onClick={onStartCompare}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-500/25 px-4 text-[13px] font-bold text-white",
                    onSell ? "flex-1" : "w-full",
                  )}
                >
                  <GitCompare className="size-3.5" />
                  {compareCount >= 2
                    ? `Compare ${compareCount} units`
                    : "Compare with another unit"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          id="rvfax-vehicle-report"
          className="mx-auto w-full max-w-lg space-y-5 px-4 pb-32 pt-3 sm:px-5"
        >
          {saveFlash ? (
            <p
              className="text-center text-[11px] font-semibold text-white/70"
              data-no-export
              role="status"
            >
              {saveFlash}
            </p>
          ) : null}
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
                  marketUpdating
                    ? FACTS_MARKET_LOADING_MESSAGE
                    : marketPainted
                      ? factsMoneyHeadline(bandAverage)
                      : "—"
                }
                accent
              />
            </div>
          </section>

          {/* Overview — frost on Raidho. No family / camping plate. */}
          <section
            className="glass-prestige overflow-hidden rounded-[1.15rem]"
            data-coach-overview=""
          >
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

            <div className="mt-5 grid grid-cols-3 gap-2">
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
            </div>

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
                  Live research failed. Catalog specs are shown.
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

          {/* #383: specs under the hero start expanded. Keep across theme rebases. */}
          {hasConcreteFloorplan(floorplan) ? (
          <FactsCollapse
            title="Vehicle specifications"
            defaultOpen={true}
            data-testid="facts-specs"
            headline={factsSpecsHeadline({
              length: specs.lengthFt,
              engine: specs.engine,
            })}
          >
            <SpecRow label="LENGTH" value={specs.lengthFt} accent />
            <SpecRow label="WIDTH" value={specs.exteriorWidth} />
            <SpecRow label="HEIGHT" value={specs.exteriorHeight} />
            <SpecRow label="CEILING" value={specs.interiorHeight} />
            <SpecRow label="SLIDEOUTS" value={specs.slideouts} />
            <SpecRow label="SLEEPS" value={specs.sleeps} />

            {specs.isToyHauler ? (
              <>
                <SpecRow label="GARAGE DEPTH" value={specs.garageLength} accent />
                <SpecRow label="GARAGE WIDTH" value={specs.garageWidth} />
                <SpecRow label="GARAGE HEIGHT" value={specs.garageHeight} />
                <SpecRow label="RAMP DOOR" value={specs.rampWidth} />
                <SpecRow label="CARGO RATING" value={specs.garageCapacity} />
                <SpecRow label="FITS" value={specs.garageFits} />
                <SpecRow label="FUEL STATION" value={specs.fuelStation} />
              </>
            ) : null}

            <SpecRow label="FUEL" value={displayFuel} />
            <SpecRow label="ENGINE" value={specs.engine} accent />
            <SpecRow
              label="HORSEPOWER"
              value={specs.horsepower}
              accent
              searching={factsDetailFieldSearching(
                "horsepower",
                gapSearching,
                specs.horsepower,
              )}
            />
            <SpecRow
              label="TORQUE"
              value={specs.torque}
              searching={factsDetailFieldSearching(
                "torque",
                gapSearching,
                specs.torque,
              )}
            />
            <SpecRow label="TRANSMISSION" value={specs.transmission} />
            <SpecRow label="CHASSIS" value={specs.chassis} accent />
            <SpecRow label="TOW CAPACITY" value={specs.hitchOrPin} />
            <SpecRow label="GENERATOR" value={brochure.generator} />
            {quietSheet(brochure.acUnits) ? (
              <SpecRow label="A/C" value={quietSheet(brochure.acUnits)} />
            ) : null}
            {quietSheet(brochure.tireSize) ? (
              <SpecRow label="TIRES" value={quietSheet(brochure.tireSize)} />
            ) : null}
            {!sheetOmits.mpg && quietSheet(specs.mpgHighway) ? (
              <SpecRow label="HIGHWAY MPG" value={quietSheet(specs.mpgHighway)} />
            ) : null}
            <SpecRow
              label="FUEL CAPACITY"
              value={displayFromPainted(
                specs.fuelCapacity,
                sharedPaint.fuelCapacity,
              )}
              sourceUrl={
                !sharedPaint.fuelCapacity.gap &&
                sharedPaint.fuelCapacity.sourceUrl &&
                sharedPaint.fuelCapacity.source !== "catalog"
                  ? sharedPaint.fuelCapacity.sourceUrl
                  : undefined
              }
            />
            <WeightOverrideRow
              label="GVWR"
              catalogValue={displayFromPainted(specs.gvwr, sharedPaint.gvwr)}
              catalogLbs={
                sharedPaint.gvwr.lbs ?? brochure.gvwrLbs ?? live?.gvwrLbs ?? null
              }
              sourceUrl={
                !sharedPaint.gvwr.gap &&
                sharedPaint.gvwr.sourceUrl &&
                sharedPaint.gvwr.source !== "catalog"
                  ? sharedPaint.gvwr.sourceUrl
                  : undefined
              }
              overrideLbs={weightOverride?.gvwrLbs ?? null}
              accent
              searching={factsDetailFieldSearching(
                "gvwr",
                gapSearching,
                weightOverride?.gvwrLbs ??
                  brochure.gvwrLbs ??
                  live?.gvwrLbs ??
                  specs.gvwr,
              )}
              disabled={!floorplan}
              onSave={(lbs) => {
                saveWeightOverride({
                  year,
                  make,
                  model,
                  floorplan,
                  gvwrLbs: lbs,
                });
                setCorrectBump((n) => n + 1);
              }}
              onReset={() => {
                clearWeightField(year, make, model, floorplan, "gvwrLbs");
                setCorrectBump((n) => n + 1);
              }}
            />
            <WeightOverrideRow
              label="UVW"
              catalogValue={quietSheet(
                displayFromPainted(
                  brochure.uvwEstimated ? "" : specs.uvw,
                  sharedPaint.uvw,
                ),
              )}
              catalogLbs={
                sharedPaint.uvw.lbs ?? brochure.uvwLbs ?? live?.uvwLbs ?? null
              }
              estimatedLbs={null}
              sourceUrl={
                !sharedPaint.uvw.gap &&
                sharedPaint.uvw.sourceUrl &&
                sharedPaint.uvw.source !== "catalog"
                  ? sharedPaint.uvw.sourceUrl
                  : undefined
              }
              searching={liveLoading && dossierGapPlan.gaps.includes("uvw")}
              overrideLbs={weightOverride?.uvwLbs ?? null}
              disabled={!floorplan}
              onSave={(lbs) => {
                saveWeightOverride({
                  year,
                  make,
                  model,
                  floorplan,
                  uvwLbs: lbs,
                });
                setCorrectBump((n) => n + 1);
              }}
              onReset={() => {
                clearWeightField(year, make, model, floorplan, "uvwLbs");
                setCorrectBump((n) => n + 1);
              }}
            />
            <SpecRow
              label="CCC"
              searching={
                liveLoading &&
                !quietSheet(displayFromPainted(specs.ccc, sharedPaint.ccc))
              }
              value={quietSheet(displayFromPainted(specs.ccc, sharedPaint.ccc))}
              sourceUrl={
                !sharedPaint.ccc.gap &&
                sharedPaint.ccc.sourceUrl &&
                sharedPaint.ccc.source !== "catalog"
                  ? sharedPaint.ccc.sourceUrl
                  : undefined
              }
            />
            <SpecRow label="WARRANTY" value={specs.warranty} />
            {shellNav ? (
              <button
                type="button"
                data-facts-check-tow
                onClick={openCheckTow}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/20 py-2.5 text-[12px] font-bold text-white"
              >
                <Truck className="size-3.5" />
                Check tow
              </button>
            ) : null}

            <SpecRow
              label="FRESH WATER"
              value={displayFromPainted(specs.freshWater, sharedPaint.freshWater)}
              sourceUrl={
                !sharedPaint.freshWater.gap &&
                sharedPaint.freshWater.sourceUrl &&
                sharedPaint.freshWater.source !== "catalog"
                  ? sharedPaint.freshWater.sourceUrl
                  : undefined
              }
            />
            <SpecRow
              label="GRAY WATER"
              value={displayFromPainted(specs.grayWater, sharedPaint.grayWater)}
              sourceUrl={
                !sharedPaint.grayWater.gap &&
                sharedPaint.grayWater.sourceUrl &&
                sharedPaint.grayWater.source !== "catalog"
                  ? sharedPaint.grayWater.sourceUrl
                  : undefined
              }
            />
            <SpecRow
              label="BLACK WATER"
              value={displayFromPainted(specs.blackWater, sharedPaint.blackWater)}
              sourceUrl={
                !sharedPaint.blackWater.gap &&
                sharedPaint.blackWater.sourceUrl &&
                sharedPaint.blackWater.source !== "catalog"
                  ? sharedPaint.blackWater.sourceUrl
                  : undefined
              }
            />
            {!sheetOmits.propane && quietSheet(specs.propane) ? (
              <SpecRow label="PROPANE" value={specs.propane} />
            ) : null}

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
          </FactsCollapse>
          ) : null}

          <section
            className="glass-prestige overflow-hidden rounded-[1.15rem] px-5 py-5"
            data-testid="facts-ratings"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Ratings
            </p>
            <ul className="mt-3 divide-y divide-white/10">
              {ratingsRows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-0"
                  data-testid={`facts-ratings-${row.key}`}
                >
                  <div className="min-w-0">
                    <span className="text-[14px] font-medium text-white">
                      {row.label}
                    </span>
                    {row.caption ? (
                      <p
                        className="mt-0.5 text-[11px] leading-snug text-white/45"
                        data-testid={`facts-ratings-${row.key}-caption`}
                      >
                        {row.caption}
                      </p>
                    ) : null}
                  </div>
                  {row.score == null ? (
                    <span className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      GAP
                    </span>
                  ) : (
                    <span
                      className="flex shrink-0 items-baseline gap-2 text-amber-200/90"
                      aria-label={`${row.label} ${formatOwnerReviewScore(row.score)}`}
                    >
                      <span className="text-[13px] font-semibold tabular-nums text-white">
                        {formatOwnerReviewScore(row.score)}
                      </span>
                      <span className="text-[13px] tracking-wide">
                        {ratingStars(row.score)}
                      </span>
                    </span>
                  )}
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 py-3 last:pb-0">
                <span className="min-w-0 shrink-0 text-[14px] font-medium text-white">
                  Torque / GVWR
                </span>
                {torqueToWeight.gap || torqueToWeight.na ? (
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    {torqueRatioLabel}
                  </span>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
                    <div
                      className="h-2 w-[7.5rem] overflow-hidden rounded-full bg-white/12 sm:w-[9.5rem]"
                      data-testid="facts-tqwt-bar"
                      data-fill="left-to-right"
                      role="meter"
                      aria-label={`Torque per 1,000 lb GVWR ${torqueRatioLabel}`}
                      aria-valuemin={0}
                      aria-valuemax={34}
                      aria-valuenow={torqueToWeight.ratio ?? 0}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${torqueBarPct}%`,
                          backgroundColor: torqueBarColor,
                        }}
                      />
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-white">
                      {torqueRatioLabel}
                    </span>
                  </div>
                )}
              </li>
            </ul>
          </section>

          <div data-facts-market-value>
          <FactsCollapse
            title="Market value"
            open={marketOpen}
            onOpenChange={setMarketOpen}
            headline={
              marketUpdating
                ? FACTS_MARKET_LOADING_MESSAGE
                : marketLive === "error"
                  ? FACTS_MARKET_ERROR_MESSAGE
                  : marketPainted
                    ? showSoldRange
                      ? factsMoneyHeadline(bandAverage)
                      : LOW_CONFIDENCE_LISTINGS_MESSAGE
                    : FACTS_MARKET_IDLE_HEADLINE
            }
          >
            {marketLive === "loading" ? (
              <p
                data-facts-market-loading
                className="text-[13px] font-semibold text-white"
              >
                {FACTS_MARKET_LOADING_MESSAGE}
              </p>
            ) : marketLive === "error" ? (
              <div data-facts-market-error>
                <p className="text-[13px] font-semibold leading-snug text-white">
                  {compsError || FACTS_MARKET_ERROR_MESSAGE}
                </p>
                <button
                  type="button"
                  onClick={() => setMarketRetry((n) => n + 1)}
                  className="mt-2 text-[12px] font-bold text-white underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            ) : marketPainted ? (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p
                    className={
                      showSoldRange
                        ? "text-[12px] font-semibold text-white"
                        : "text-[12px] font-semibold text-white/55"
                    }
                  >
                    {SOLD_COMPS_LABEL}
                  </p>
                  <Chip
                    tone={
                      soldConfidence === "high"
                        ? "green"
                        : soldConfidence === "medium"
                          ? "blue"
                          : "ruby"
                    }
                  >
                    {soldConfidenceLabel}
                  </Chip>
                </div>
                {thinSample ? (
                  <div className="mb-2">
                    <p className="text-[13px] font-semibold leading-snug text-white">
                      {LOW_CONFIDENCE_LISTINGS_MESSAGE}
                    </p>
                    <p className="mt-4 text-[15px] font-extrabold uppercase tracking-[0.16em] text-gold-bright">
                      {marketSourceLabel}
                    </p>
                  </div>
                ) : null}
                <FactsMarketBands
                  retailLow={formatMoney(deskMarket.retailLow)}
                  average={factsMoneyHeadline(bandAverage)}
                  retailHigh={formatMoney(deskMarket.retailHigh)}
                  hideRetailHigh={hideRetailHigh}
                  confidence={marketConfidence}
                  soldSampleSize={compsSoldSample}
                  sampleSize={compsSample}
                  thinSampleMessage={LOW_CONFIDENCE_LISTINGS_MESSAGE}
                  averageCaption={averageCaption}
                  tradeIn={formatMoney(deskMarket.tradeIn)}
                />
                {shellNav ? (
                  <button
                    type="button"
                    data-facts-check-payment
                    onClick={() => openCheckPayment()}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/15 py-2.5 text-[12px] font-bold text-gold-bright"
                  >
                    <Calculator className="size-3.5" />
                    Check payment
                    {financePrice > 0 ? ` · ${formatMoney(financePrice)}` : ""}
                  </button>
                ) : null}
              </>
            ) : (
              <p
                data-facts-market-gap
                className="text-[13px] font-semibold text-white"
              >
                {FACTS_MARKET_IDLE_HEADLINE}
              </p>
            )}
          </FactsCollapse>
          </div>

          {shouldShowRvVideoPrompt({
            year,
            make,
            model,
            floorplan,
            type: data.type,
          }) ? (
            <RvVideoLibraryCard
              year={year}
              make={make}
              model={model}
              floorplan={floorplan}
            />
          ) : null}

          <FactsCollapse
            title="Local inventory"
            headline={factsInventoryHeadline({
              searched: invSearched,
              count: invListings.length,
            })}
          >
            <div data-no-export>
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
                value={invYearPad}
                onChange={(e) => {
                  setInvYearPad(Number(e.target.value));
                  setInvQueryRange(null);
                }}
                className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[12px] font-semibold text-white"
                aria-label="Year window"
              >
                <option value={1}>±1 yr</option>
                <option value={2}>±2 yr</option>
                <option value={3}>±3 yr</option>
              </select>
              <select
                value={invRadius}
                onChange={(e) => setInvRadius(Number(e.target.value))}
                className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[12px] font-semibold text-white"
              >
                <option value={25}>25 mi</option>
                <option value={50}>50 mi</option>
                <option value={100}>100 mi</option>
              </select>
              <button
                type="button"
                onClick={() => void runInventorySearch()}
                disabled={invLoading}
                className="rounded-full border border-blue/40 bg-blue/20 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {invLoading ? "…" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => void runDealerSearch()}
                disabled={dealersLoading}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {dealersLoading ? "…" : "Lots"}
              </button>
            </div>
            <div className="relative mt-2 grid grid-cols-2 gap-2">
              <label className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5">
                <span className="sr-only">Make</span>
                <input
                  value={invMake}
                  onChange={(e) => setInvMake(e.target.value)}
                  onFocus={() => setAcFocus("make")}
                  onBlur={() => window.setTimeout(() => setAcFocus((f) => (f === "make" ? null : f)), 180)}
                  placeholder="Make"
                  autoComplete="off"
                  className="w-full bg-transparent text-[12px] font-semibold text-white outline-none placeholder:text-white/40"
                />
              </label>
              <label className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5">
                <span className="sr-only">Model</span>
                <input
                  value={invModel}
                  onChange={(e) => setInvModel(e.target.value)}
                  onFocus={() => setAcFocus("model")}
                  onBlur={() => window.setTimeout(() => setAcFocus((f) => (f === "model" ? null : f)), 180)}
                  placeholder="Model"
                  autoComplete="off"
                  className="w-full bg-transparent text-[12px] font-semibold text-white outline-none placeholder:text-white/40"
                />
              </label>
              {acFocus && acTerms.length ? (
                <ul className="absolute top-full z-20 mt-1 max-h-40 w-full overflow-auto rounded-xl border border-white/15 bg-black py-1 shadow-lg">
                  {acTerms.map((t) => (
                    <li key={t.term}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-semibold text-white hover:bg-white/10"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (acFocus === "make") setInvMake(t.term);
                          else setInvModel(t.term);
                          setAcTerms([]);
                          setAcFocus(null);
                        }}
                      >
                        <span>{t.term}</span>
                        {t.count != null ? (
                          <span className="text-[11px] text-white/45">{t.count}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <p className="mt-2 text-[11px] text-white/55">
              Years {invYearWindow.min}–{invYearWindow.max} · {invRadiusShown} mi
              {selectedDealer ? ` · ${selectedDealer.name}` : ""}
            </p>
            {selectedDealer ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                  <Store className="size-3" />
                  {selectedDealer.name}
                  <button
                    type="button"
                    className="ml-1 text-white/50"
                    onClick={() => {
                      setSelectedDealer(null);
                      setLotWide(false);
                    }}
                    aria-label="Clear dealer"
                  >
                    ×
                  </button>
                </span>
                {!lotWide ? (
                  <button
                    type="button"
                    onClick={() =>
                      void runInventorySearch({
                        dealerId: selectedDealer.id,
                        allDealerInventory: true,
                      })
                    }
                    className="text-[11px] font-semibold text-blue"
                  >
                    Show all units at this lot
                  </button>
                ) : null}
              </div>
            ) : null}
            {dealers.length ? (
              <ul className="mt-2 space-y-1.5">
                {dealers.slice(0, 6).map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => pickDealer(d)}
                      className={cn(
                        "flex w-full items-start justify-between gap-2 rounded-xl border px-3 py-2 text-left",
                        selectedDealer?.id === d.id
                          ? "border-blue/40 bg-blue/15"
                          : "border-white/10 bg-black/25",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-bold text-white">
                          {d.name}
                        </span>
                        <span className="block text-[11px] text-white/60">
                          {[d.city, d.state, d.listingCount != null ? `${d.listingCount} listed` : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold text-white/55">
                        {d.distanceMi != null ? `${Math.round(d.distanceMi)} mi` : "Lot"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {invError ? (
              <p className="mt-2 text-[11px] text-amber">{invError}</p>
            ) : null}
            {invListings.length ? (
              <ul className="mt-2 space-y-1.5">
                {invListings.slice(0, 5).map((l, i) => {
                  const open = openListingId === l.id;
                  const detail = open ? listingDetail : null;
                  return (
                    <li
                      key={l.id || i}
                      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => openShortlistCard(l)}
                        className="flex w-full items-start justify-between gap-2 text-left"
                      >
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
                      </button>
                      {open ? (
                        <div className="mt-2 border-t border-white/10 pt-2">
                          {listingLoading ? (
                            <p className="flex items-center gap-1.5 text-[11px] text-white/55">
                              <Loader2 className="size-3 animate-spin" />
                              Loading listing…
                            </p>
                          ) : null}
                          {listingError ? (
                            <p className="text-[11px] text-amber">{listingError}</p>
                          ) : null}
                          {detail ? (
                            <div className="space-y-1.5">
                              {detail.photoUrls[0] ? (
                                <img
                                  src={detail.photoUrls[0]}
                                  alt=""
                                  className="h-28 w-full rounded-lg object-cover"
                                />
                              ) : null}
                              <p className="text-[11px] text-white/70">
                                {[
                                  detail.miles != null
                                    ? `${detail.miles.toLocaleString()} mi`
                                    : null,
                                  detail.inventoryType,
                                  detail.exteriorColor,
                                  detail.vin ? `VIN ${detail.vin}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                              {detail.dealerStreet || detail.dealerPhone ? (
                                <p className="text-[11px] text-white/60">
                                  {[
                                    detail.dealerStreet,
                                    detail.city,
                                    detail.state,
                                    detail.dealerPhone,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              ) : null}
                              {detail.vdpUrl ? (
                                <a
                                  href={detail.vdpUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue"
                                >
                                  Dealer page
                                  <ExternalLink className="size-3" />
                                </a>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : invSearched && !invLoading && !invError ? (
              <p className="mt-2 text-[11px] text-white/55">No listings nearby.</p>
            ) : null}
            {invMedian && shellNav ? (
              <button
                type="button"
                onClick={() =>
                  openCheckPayment(
                    invMedian,
                    `${year} ${make} ${model} · local median`,
                  )
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/15 py-2.5 text-[12px] font-bold text-gold-bright"
              >
                <Calculator className="size-3.5" />
                Check payment · local median · {formatMoney(invMedian)}
              </button>
            ) : null}
            </div>
          </FactsCollapse>

          {live?.live &&
          (live.ratingEstimate || live.ownerSentiment) ? (
            <FactsCollapse
              title="Rating"
              headline={
                live.ratingEstimate && live.ratingEstimate > 0
                  ? live.ratingEstimate.toFixed(1)
                  : "Notes"
              }
            >
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                {live.ratingEstimate && live.ratingEstimate > 0 ? (
                  <p className="text-[15px] font-semibold text-white">
                    {live.ratingEstimate.toFixed(1)}
                  </p>
                ) : null}
                {live.ownerSentiment ? (
                  <p className="mt-1.5 text-[14px] italic text-white/85">
                    {live.ownerSentiment}
                  </p>
                ) : null}
              </div>
            </FactsCollapse>
          ) : null}

          {floorplansShown.length ? (
            <FactsCollapse
              title="Floorplans this year"
              headline={
                floorplan ||
                `${floorplansShown.length} ${floorplansShown.length === 1 ? "plan" : "plans"}`
              }
            >
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
            </FactsCollapse>
          ) : emptyYearFloorplans ? (
            <FactsCollapse title="Floorplans this year" headline="None on file">
              <p className="text-[14px] leading-relaxed text-white/80">
                No verified floorplans for {year} {make} {model}.
              </p>
              {sourcedYears.length ? (
                <p className="mt-3 text-[13px] leading-relaxed text-white/60">
                  On file: {sourcedYears.join(", ")}
                </p>
              ) : null}
              {relatedModels.length ? (
                <div className="mt-4">
                  <p className="text-[13px] font-medium text-white/70">
                    Related {make} series in {year}:
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {relatedModels.map((md) => (
                      <li
                        key={md}
                        className="text-[14px] text-white/90"
                      >
                        {make} {md}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </FactsCollapse>
          ) : noYearFloorplanBrowse && historicalFloorplans.length ? (
            <FactsCollapse
              title="Floorplans across model years"
              headline={`${historicalFloorplans.length} years`}
            >
              <div className="space-y-4">
                {historicalFloorplans.map((row) => (
                  <div key={row.year}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">
                      {row.year}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.floorplans.map((fp) => (
                        <Chip key={`${row.year}-${fp}`}>{fp}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FactsCollapse>
          ) : null}

          {emptyYearFloorplans && historicalFloorplans.length ? (
            <FactsCollapse
              title="Floorplans from other years"
              headline={`${historicalFloorplans.length} years`}
            >
              <div className="space-y-4">
                {historicalFloorplans.map((row) => (
                  <div key={row.year}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">
                      {row.year}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.floorplans.map((fp) => (
                        <Chip key={`${row.year}-${fp}`}>{fp}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FactsCollapse>
          ) : null}

          {live?.live &&
          (live.reliabilitySummary ||
            live.commonIssues?.length ||
            live.servicePriorities?.length) ? (
            <FactsCollapse
              title="Reliability & ownership"
              headline={
                live.commonIssues?.length
                  ? `${live.commonIssues.length} issues`
                  : "Notes"
              }
            >
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
            </FactsCollapse>
          ) : null}

          {ownerReviews.length ? (
          <FactsCollapse
            title="Sample owner notes"
            headline={factsOwnerHeadline(ownerReviews[0] ?? null)}
          >
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
                      <p className="shrink-0 text-[18px] font-bold tabular-nums text-gold-bright">
                        {r.rating.toFixed(1)}
                      </p>
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
          </FactsCollapse>
          ) : null}

          <FactsCollapse
            title="NHTSA safety"
            headline={factsRecallHeadline({
              loading: recallLoading,
              count: liveRecalls.length,
            })}
          >
            {recallLoading ? (
              <p className="flex items-center gap-2 text-[14px] text-white">
                <Loader2 className="size-4 animate-spin" /> Loading recalls
              </p>
            ) : recallError ? (
              <p className="text-[12px] text-amber">{recallError}</p>
            ) : liveRecalls.length === 0 ? (
              <a
                href="https://www.nhtsa.gov/recalls"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue"
              >
                nhtsa.gov <ExternalLink className="size-3" />
              </a>
            ) : (
              <div className="space-y-2">
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
          </FactsCollapse>

          {maintenance.length ? (
            <FactsCollapse
              title="Maintenance"
              headline={`${maintenance.length} tasks`}
            >
              <ul className="space-y-2">
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
            </FactsCollapse>
          ) : null}

          <div data-share-kit>
            <FactsCollapse
              title="Share kit"
              headline="Send this report"
              open={shareOpen}
              onOpenChange={setShareOpen}
            >
              <RvShareKit result={coach} onAskGrok={onAskGrok} />
            </FactsCollapse>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-white/45">
            {OWNER_REVIEW_FOOTER}
          </p>
          <p className="px-1 text-[11px] italic leading-snug text-white/55">
            {PUBLIC_SOLD_DISCLAIMER}
          </p>
          <SuiteDisclaimer className="pb-6" />
        </div>
        </PullRefreshLayer>
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
                  Saves on this device.
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

function OverflowItem({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-[13px] font-semibold text-white disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

function formatOverrideLbs(n: number): string {
  return `${n.toLocaleString()} lbs`;
}

function WeightOverrideRow({
  label,
  catalogValue,
  catalogLbs,
  estimatedLbs,
  overrideLbs,
  accent,
  searching,
  sourceUrl,
  disabled,
  onSave,
  onReset,
}: {
  label: string;
  catalogValue?: string | null;
  catalogLbs?: number | null;
  estimatedLbs?: number | null;
  overrideLbs?: number | null;
  accent?: boolean;
  searching?: boolean;
  sourceUrl?: string;
  disabled?: boolean;
  onSave: (lbs: number) => void;
  onReset: () => void;
}) {
  const displayLbs = overrideLbs ?? catalogLbs ?? estimatedLbs ?? null;
  const published =
    overrideLbs != null
      ? formatOverrideLbs(overrideLbs)
      : catalogValue && String(catalogValue).trim()
        ? catalogValue
        : estimatedLbs != null
          ? formatOverrideLbs(estimatedLbs)
          : "—";
  const [draft, setDraft] = useState(
    displayLbs != null ? String(displayLbs) : "",
  );
  useEffect(() => {
    setDraft(displayLbs != null ? String(displayLbs) : "");
  }, [displayLbs]);

  const commit = () => {
    const n = Number(String(draft).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) {
      setDraft(displayLbs != null ? String(displayLbs) : "");
      return;
    }
    if (overrideLbs != null && Math.round(n) === overrideLbs) return;
    if (overrideLbs == null && catalogLbs != null && Math.round(n) === catalogLbs) {
      return;
    }
    if (
      overrideLbs == null &&
      catalogLbs == null &&
      estimatedLbs != null &&
      Math.round(n) === estimatedLbs
    ) {
      return;
    }
    onSave(Math.round(n));
  };

  return (
    <div
      className="flex items-center justify-between gap-3 border-b border-white/[0.07] py-2.5 last:border-0"
      data-testid={`facts-weight-${label.toLowerCase()}`}
    >
      <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-white">
        {label}
        {overrideLbs != null ? (
          <span
            className="rounded-full border border-amber-300/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-100"
            data-testid={`facts-weight-${label.toLowerCase()}-override`}
          >
            Override
          </span>
        ) : null}
      </span>
      <div className="flex min-w-0 items-center justify-end gap-2">
        {searching ? <FactsGapSpinner field={label} /> : null}
        <input
          type="text"
          inputMode="numeric"
          aria-label={`${label} pounds${overrideLbs != null ? " (override)" : ""}`}
          aria-busy={searching || undefined}
          disabled={disabled}
          value={draft}
          placeholder={published}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className={cn(
            "w-[7.5rem] rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-right text-[14px] font-medium tabular-nums leading-snug text-white outline-none placeholder:text-white/40 focus:border-white/35 disabled:opacity-50",
            accent && "font-semibold",
          )}
        />
        {overrideLbs != null ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70"
          >
            Reset
          </button>
        ) : null}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-semibold text-white/55 underline"
          >
            Source
          </a>
        ) : null}
      </div>
    </div>
  );
}

function FactsGapSpinner({ field }: { field: string }) {
  return (
    <span
      role="status"
      aria-label={`Searching ${field}`}
      data-testid="facts-gap-spinner"
      data-facts-gap-field={field.toLowerCase()}
      className="facts-gap-spinner"
    />
  );
}

function quietSheet(value?: string | null): string {
  const t = (value || "").trim();
  if (!t || t === "—" || t === "-" || t === "–") return "";
  if (/confirm brochure/i.test(t)) return "";
  if (/confirm (?:door|floor) sticker/i.test(t)) return "";
  if (/typ\.\s*[—–-]\s*confirm/i.test(t)) return "";
  return t;
}

function SpecRow({
  label,
  value,
  accent,
  searching,
  sourceUrl,
}: {
  label: string;
  value?: string | null;
  accent?: boolean;
  searching?: boolean;
  sourceUrl?: string;
}) {
  const powertrain =
    label === "HORSEPOWER" || label === "TORQUE" || label === "ENGINE";
  const shown = powertrain
    ? omitInventPolicyProse(value) || "—"
    : value && String(value).trim()
      ? value
      : "—";
  return (
    <div
      className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-2.5 last:border-0"
      aria-busy={searching || undefined}
    >
      <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-white">
        {label}
      </span>
      <span
        className={cn(
          "inline-flex max-w-[60%] items-center justify-end gap-2 text-right text-[14px] font-medium tabular-nums leading-snug text-white",
          accent && "font-semibold",
        )}
      >
        {shown}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-semibold text-white/55 underline"
          >
            Source
          </a>
        ) : null}
        {searching ? <FactsGapSpinner field={label} /> : null}
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
