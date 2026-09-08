import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Eraser,
  MapPin,
  RefreshCw,
  Search,
  Truck,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSheet } from "@/components/rvfax/SelectSheet";
import {
  getModels,
  getRating,
  makesForKind,
  type VehicleKind,
} from "@/lib/tow/towVehicles";
import {
  DEFAULT_TOW_VEHICLE,
  formatTrimYearRange,
  getTrimsForYear,
  isCatalogTrimForYear,
  pickSuccessorTrim,
  trimStem,
} from "@/lib/tow/towYear";
import {
  REVERSE_LIST_CAP,
  REVERSE_SHORTLIST,
  rankTowVehiclesForTrailer,
  type ReverseHit,
} from "@/lib/tow/towReverse";
import {
  evaluateTowMatch,
  type TowCheck,
  type TowMatchVerdict,
} from "@/lib/tow/towMatch";
import { SuitePage } from "@/components/shell/SuitePage";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  activeCoachKey,
  formatActiveCoachChip,
  towPrefillFromCoach,
} from "@/lib/rv/activeCoach";
import {
  clearLastTowVehicle,
  formatSavedTowVehicle,
  loadLastTowVehicle,
  saveLastTowVehicle,
  type SavedTowVehicle,
} from "@/lib/tow/savedTowVehicle";
import { offerFromCoach } from "@/lib/trips/towHandoff";


const YEARS = Array.from({ length: 22 }, (_, i) => String(2026 - i)); // 2026 → 2005


/** Towable RVs only — motorhomes are not towed by the selected vehicle. */
const RV_TYPES_TRUCK = ["Fifth Wheel", "Travel Trailer"] as const;
const RV_TYPES_NON_TRUCK = ["Travel Trailer"] as const;

const BEDS = ["5.5 ft (Short Bed)", "6.5 ft (Standard Bed)", "8 ft (Long Bed)"];

type KindFilter = "all" | VehicleKind;
type ShopMode = "match" | "reverse";

const EMPTY = {
  year: "",
  make: "",
  model: "",
  trim: "",
};

function bootTowVehicle(): SavedTowVehicle | null {
  try {
    return loadLastTowVehicle();
  } catch {
    return null;
  }
}

export function RvTowApp() {
  const savedBoot = useMemo(() => bootTowVehicle(), []);
  const [kindFilter, setKindFilter] = useState<KindFilter>(
    savedBoot?.kindFilter ?? "all",
  );
  const [year, setYear] = useState(savedBoot?.year ?? DEFAULT_TOW_VEHICLE.year);
  const [make, setMake] = useState(savedBoot?.make ?? DEFAULT_TOW_VEHICLE.make);
  const [model, setModel] = useState(
    savedBoot?.model ?? DEFAULT_TOW_VEHICLE.model,
  );
  const [trim, setTrim] = useState(savedBoot?.trim ?? DEFAULT_TOW_VEHICLE.trim);
  const [rvType, setRvType] = useState(savedBoot?.rvType ?? "Fifth Wheel");
  const [gvwr, setGvwr] = useState(savedBoot?.gvwr || "14000");
  const [bed, setBed] = useState(savedBoot?.bed || "6.5 ft (Standard Bed)");
  const [pin, setPin] = useState(savedBoot?.pin ?? "");
  const [sheet, setSheet] = useState<
    "year" | "make" | "model" | "trim" | "rvType" | "bed" | null
  >(null);
  // Manual OEM ratings when vehicle is not in the catalog
  const [manualMaxTow, setManualMaxTow] = useState(
    savedBoot?.manualMaxTow ?? "",
  );
  const [manualPayload, setManualPayload] = useState(
    savedBoot?.manualPayload ?? "",
  );
  const [manualGcwr, setManualGcwr] = useState(savedBoot?.manualGcwr ?? "");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nav = useShellNavOptional();
  const lastPrefillKey = useRef("");
  const [matchTrailer, setMatchTrailer] = useState(false);
  const [shopMode, setShopMode] = useState<ShopMode>("match");
  const [reverseLimit, setReverseLimit] = useState(REVERSE_SHORTLIST);
  const [deviceSaved, setDeviceSaved] = useState<SavedTowVehicle | null>(
    savedBoot,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  const prefill = useMemo(
    () => towPrefillFromCoach(nav?.activeCoach ?? null),
    [nav?.activeCoach],
  );

  useEffect(() => {
    const coach = nav?.activeCoach;
    if (!coach) {
      if (lastPrefillKey.current && !make && !model) {
        const saved = loadLastTowVehicle();
        if (saved) {
          setKindFilter(saved.kindFilter);
          setYear(saved.year);
          setMake(saved.make);
          setModel(saved.model);
          setTrim(saved.trim);
          setBed(saved.bed);
          setRvType(saved.rvType);
          setGvwr(saved.gvwr || "14000");
          setPin(saved.pin);
          setManualMaxTow(saved.manualMaxTow);
          setManualPayload(saved.manualPayload);
          setManualGcwr(saved.manualGcwr);
          setDeviceSaved(saved);
          setShopMode("match");
        }
      }
      lastPrefillKey.current = "";
      return;
    }
    const key = activeCoachKey(coach);
    if (lastPrefillKey.current === key) return;
    lastPrefillKey.current = key;
    setMatchTrailer(false);
    setReverseLimit(REVERSE_SHORTLIST);
    if (prefill.kind === "motorhome") {
      setShopMode("match");
      setYear("");
      setMake("");
      setModel("");
      setTrim("");
      setRvType("Travel Trailer");
      setGvwr("");
      setPin("");
    } else if (prefill.kind === "towable") {
      setRvType(prefill.rvType);
      if (prefill.gvwrLbs > 0) setGvwr(String(prefill.gvwrLbs));
      setShopMode("reverse");
    }
  }, [nav?.activeCoach, prefill, make, model]);

  const persistVehicle = useCallback(() => {
    if (!make || !model) return null;
    return saveLastTowVehicle({
      year,
      make,
      model,
      trim,
      kindFilter,
      bed,
      rvType,
      gvwr,
      pin,
      manualMaxTow,
      manualPayload,
      manualGcwr,
    });
  }, [
    year,
    make,
    model,
    trim,
    kindFilter,
    bed,
    rvType,
    gvwr,
    pin,
    manualMaxTow,
    manualPayload,
    manualGcwr,
  ]);

  useEffect(() => {
    // Toad mode empties the truck on purpose — do not wipe a saved last truck.
    if (prefill.kind === "motorhome" && !matchTrailer) return;
    const next = persistVehicle();
    if (next) setDeviceSaved(next);
  }, [persistVehicle, prefill.kind, matchTrailer]);

  const tripsOffer = useMemo(
    () => offerFromCoach(nav?.activeCoach ?? null),
    [nav?.activeCoach],
  );

  const openTripsProfile = useCallback(() => {
    nav?.openTripsProfile(tripsOffer);
  }, [nav, tripsOffer]);

  const toadMode = prefill.kind === "motorhome" && !matchTrailer;

  const makeList = useMemo(() => makesForKind(kindFilter), [kindFilter]);

  const models = useMemo(() => {
    if (!make) return [];
    return getModels(make, kindFilter === "all" ? "all" : kindFilter);
  }, [make, kindFilter]);

  const modelNames = useMemo(() => models.map((m) => m.name), [models]);

  const trims = useMemo(() => {
    if (!make || !model) return [];
    return getTrimsForYear(make, model, year);
  }, [make, model, year]);

  const trimItems = useMemo(
    () =>
      trims.map((t) => {
        const years = formatTrimYearRange(t.label);
        return {
          value: t.label,
          label: trimStem(t.label),
          meta: years || undefined,
        };
      }),
    [trims],
  );

  const inCatalog = useMemo(() => {
    if (!make || !model) return false;
    const mods = getModels(make, "all");
    if (!mods.some((m) => m.name === model)) return false;
    if (!trim) return mods.length > 0;
    return isCatalogTrimForYear(make, model, trim, year);
  }, [make, model, trim, year]);

  const hasVehicle = Boolean(make && model && (trim || !inCatalog));

  const rating = useMemo(() => {
    if (!hasVehicle) {
      return {
        maxTow: 0,
        payload: 0,
        gcwr: 0,
        hitch: "—",
        kind: "truck" as const,
        label: "",
        custom: false,
      };
    }
    if (inCatalog && trim) {
      const r = getRating(make, model, trim);
      return { ...r, custom: false };
    }
    // Custom / not-in-list vehicle — door-sticker numbers only. No invented GCWR.
    const maxTow = parseInt(manualMaxTow, 10) || 0;
    const payload = parseInt(manualPayload, 10) || 0;
    const gcwr = parseInt(manualGcwr, 10) || 0;
    return {
      maxTow,
      payload,
      gcwr,
      hitch: "Owner-entered",
      kind: kindFilter === "suv" ? ("suv" as const) : ("truck" as const),
      label: "Custom entry",
      custom: true,
    };
  }, [
    hasVehicle,
    inCatalog,
    make,
    model,
    trim,
    manualMaxTow,
    manualPayload,
    manualGcwr,
    kindFilter,
  ]);

  const gvwrN = parseInt(gvwr, 10) || 0;
  const pinN = pin ? parseInt(pin, 10) : 0;

  /** Effective vehicle kind for RV-type rules */
  const vehicleIsTruck =
    !hasVehicle
      ? kindFilter !== "suv"
      : rating.kind === "truck" && kindFilter !== "suv";

  const rvTypeOptions = vehicleIsTruck
    ? [...RV_TYPES_TRUCK]
    : [...RV_TYPES_NON_TRUCK];

  const verdict = useMemo(
    () =>
      evaluateTowMatch({
        hasVehicle,
        rvType,
        gvwrLbs: gvwrN,
        hitchLbs: pinN > 0 ? pinN : undefined,
        maxTow: rating.maxTow,
        payload: rating.payload,
        gcwr: rating.gcwr,
        bed,
        vehicleIsTruck,
      }),
    [
      hasVehicle,
      rvType,
      gvwrN,
      pinN,
      rating.maxTow,
      rating.payload,
      rating.gcwr,
      bed,
      vehicleIsTruck,
    ],
  );

  const recommendedTow = verdict.recommendedTow;
  const recommendedPayload = verdict.recommendedPayload;
  const pinEst = verdict.hitchLoad;

  // Non-truck vehicles (SUV / car-class) → travel trailer only
  useEffect(() => {
    if (kindFilter === "suv" || (hasVehicle && rating.kind === "suv")) {
      if (rvType !== "Travel Trailer") setRvType("Travel Trailer");
    }
  }, [kindFilter, hasVehicle, rating.kind, rvType]);

  useEffect(() => {
    setReverseLimit(REVERSE_SHORTLIST);
  }, [gvwrN, rvType, year, kindFilter, pinN]);

  const reverseResult = useMemo(
    () =>
      rankTowVehiclesForTrailer({
        gvwrLbs: gvwrN,
        rvType,
        year,
        kind: kindFilter,
        pinLbs: pinN > 0 ? pinN : undefined,
        limit: reverseLimit,
      }),
    [gvwrN, rvType, year, kindFilter, pinN, reverseLimit],
  );

  const truckCount = useMemo(
    () =>
      makesForKind("truck").reduce(
        (n, m) => n + getModels(m, "truck").length,
        0,
      ),
    [],
  );
  const suvCount = useMemo(
    () =>
      makesForKind("suv").reduce((n, m) => n + getModels(m, "suv").length, 0),
    [],
  );

  /** Change kind filter without fighting the user — keep selection if still valid */
  const applyKindFilter = useCallback(
    (next: KindFilter) => {
      setKindFilter(next);
      if (next === "suv") setRvType("Travel Trailer");
      if (!make) return;
      const stillValid = getModels(
        make,
        next === "all" ? "all" : next,
      ).some((m) => m.name === model);
      if (stillValid) return;
      setModel("");
      setTrim("");
    },
    [make, model],
  );

  const pickYear = useCallback(
    (nextYear: string) => {
      setYear(nextYear);
      if (!make || !model) return;
      const nextTrims = getTrimsForYear(make, model, nextYear);
      if (trim && nextTrims.some((t) => t.label === trim)) return;
      const successor = pickSuccessorTrim(trim, nextTrims);
      if (successor) {
        setTrim(successor.label);
        return;
      }
      const inFullTable = getTrimsForYear(make, model, "").some(
        (t) => t.label === trim,
      );
      if (trim && !inFullTable) return;
      setTrim("");
    },
    [make, model, trim],
  );

  const pickMake = useCallback(
    (m: string) => {
      setMake(m);
      setManualMaxTow("");
      setManualPayload("");
      setManualGcwr("");
      const nextModels = getModels(m, kindFilter === "all" ? "all" : kindFilter);
      if (nextModels.length === 1) {
        const only = nextModels[0]!;
        setModel(only.name);
        const onlyTrims = getTrimsForYear(m, only.name, year);
        setTrim(onlyTrims.length === 1 ? onlyTrims[0]!.label : "");
      } else {
        setModel("");
        setTrim("");
      }
    },
    [kindFilter, year],
  );

  const pickModel = useCallback(
    (m: string) => {
      setModel(m);
      setManualMaxTow("");
      setManualPayload("");
      setManualGcwr("");
      const nextTrims = getTrimsForYear(make, m, year);
      if (nextTrims.length === 1) setTrim(nextTrims[0]!.label);
      else setTrim("");
    },
    [make, year],
  );

  const clearVehicle = () => {
    setYear(EMPTY.year);
    setMake(EMPTY.make);
    setModel(EMPTY.model);
    setTrim(EMPTY.trim);
    setPin("");
    setManualMaxTow("");
    setManualPayload("");
    setManualGcwr("");
    clearLastTowVehicle();
    setDeviceSaved(null);
  };

  const openReverse = useCallback(() => {
    setShopMode("reverse");
    setReverseLimit(REVERSE_SHORTLIST);
    setMatchTrailer(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const applyReversePick = useCallback((hit: ReverseHit) => {
    setKindFilter(hit.kind === "suv" ? "suv" : kindFilter === "suv" ? "truck" : kindFilter);
    setMake(hit.make);
    setModel(hit.model);
    setTrim(hit.trim);
    setManualMaxTow("");
    setManualPayload("");
    setManualGcwr("");
    setShopMode("match");
    setMatchTrailer(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [kindFilter]);

  const resetDefaults = () => {
    lastPrefillKey.current = "";
    setKindFilter("all");
    setYear(DEFAULT_TOW_VEHICLE.year);
    setMake(DEFAULT_TOW_VEHICLE.make);
    setModel(DEFAULT_TOW_VEHICLE.model);
    setTrim(DEFAULT_TOW_VEHICLE.trim);
    setRvType("Fifth Wheel");
    setGvwr("14000");
    setBed("6.5 ft (Standard Bed)");
    setPin("");
    setManualMaxTow("");
    setManualPayload("");
    setManualGcwr("");
    setMatchTrailer(prefill.kind === "motorhome");
    setShopMode("match");
    setReverseLimit(REVERSE_SHORTLIST);
    const next = saveLastTowVehicle({
      year: DEFAULT_TOW_VEHICLE.year,
      make: DEFAULT_TOW_VEHICLE.make,
      model: DEFAULT_TOW_VEHICLE.model,
      trim: DEFAULT_TOW_VEHICLE.trim,
      kindFilter: "all",
      bed: "6.5 ft (Standard Bed)",
      rvType: "Fifth Wheel",
      gvwr: "14000",
      pin: "",
      manualMaxTow: "",
      manualPayload: "",
      manualGcwr: "",
    });
    setDeviceSaved(next);
  };

  const reverseMode = shopMode === "reverse" && !toadMode;
  const pinHeroActive = /fifth/i.test(rvType);

  const detailLines = useMemo(() => {
    const lines: string[] = [];
    lines.push(
      "5th wheel pin is 18–25% of GVWR — bed hitch required, bed access reduced.",
    );
    lines.push(
      "Travel trailer hitch is 10–15% of GVWR — lower weight limit, more sway risk.",
    );
    if (hasVehicle) {
      lines.push(
        "OEM max is the tested ceiling (SAE J2807 when equipped). Planning uses ~80% of max tow and ~85% of payload.",
      );
      lines.push("Ratings when properly equipped.");
    }
    if (hasVehicle && rating.custom) {
      const who = [year || "—", make, model, trim].filter(Boolean).join(" ");
      lines.push(
        `${who} is not in the OEM table. Type max tow / payload from the sticker. Leave GCWR blank if it is not printed — we do not invent max tow + payload + 5,000.`,
      );
    }
    if (toadMode && prefill.kind === "motorhome") {
      lines.push(
        `This coach is a ${prefill.coach.rvType || "motorhome"} — it tows a toad (car), it is not a fifth wheel.`,
      );
    }
    if (prefill.kind === "towable") {
      lines.push(
        "Type and GVWR filled from the open Facts coach. Edit GVWR if the sticker differs.",
      );
    }
    if (!vehicleIsTruck) {
      lines.push(
        "SUVs and non-truck vehicles are set to Travel Trailer — 5th wheels need a truck bed hitch.",
      );
    }
    if (hasVehicle && rating.kind === "suv" && gvwrN > 8000) {
      lines.push(
        "Heavy trailers on SUVs need weight distribution, a brake controller, and a payload check (passengers + gear count against payload).",
      );
    }
    if (verdict.bed) {
      lines.push(`${verdict.bed.title}: ${verdict.bed.detail}`);
    }
    for (const check of verdict.checks) {
      if (check.id === "bed") continue;
      if (check.detail) lines.push(`${check.title}: ${check.detail}`);
    }
    if (verdict.overRecommendedUnderMax) {
      lines.push(
        `Above recommended ${recommendedTow.toLocaleString()} lbs but under OEM max ${rating.maxTow.toLocaleString()} lbs — legal when equipped, little margin for hills, wind, or gear.`,
      );
    }
    if (reverseMode) {
      const hitchLbs = reverseResult.hitchLoad.toLocaleString();
      lines.push(
        /fifth/i.test(rvType)
          ? `Ranking uses ${hitchLbs} lbs pin (typed or 20% of GVWR) against each truck’s rec. payload when that number exists.`
          : `Ranking uses ${hitchLbs} lbs tongue (typed or 12% of GVWR) against each truck’s rec. payload when that number exists.`,
      );
    }
    if (tripsOffer && nav?.activeCoach) {
      lines.push(`Coach from Facts: ${formatActiveCoachChip(nav.activeCoach)}.`);
    } else {
      lines.push(
        "Open a coach in Facts to send it to Trips Profile. We do not invent height or length from this truck.",
      );
    }
    lines.push(
      "Opens Trips Profile. A locked coach stays locked until you unlock.",
    );
    return lines;
  }, [
    hasVehicle,
    rating.custom,
    rating.kind,
    rating.maxTow,
    year,
    make,
    model,
    trim,
    toadMode,
    prefill,
    vehicleIsTruck,
    gvwrN,
    verdict,
    recommendedTow,
    reverseMode,
    reverseResult.hitchLoad,
    rvType,
    tripsOffer,
    nav?.activeCoach,
  ]);

  return (
    <SuitePage
      tab="rvtow"
      className="rvtow-screen"
      noSwipeScroll
      scrollRef={scrollRef}
      onPullReset={clearVehicle}
      pullLabel="Release to clear vehicle · pull down"
      overlays={
        <>
      <SelectSheet
        open={sheet === "year"}
        title="Year"
        subtitle="Year filters which trims and ratings apply"
        items={YEARS}
        selected={year}
        onSelect={pickYear}
        onClose={() => setSheet(null)}
        allowCustom
        customLabel="Use this year"
        customPlaceholder="Type year…"
      />
      <SelectSheet
        open={sheet === "make"}
        title="Make"
        items={makeList}
        selected={make}
        onSelect={pickMake}
        onClose={() => setSheet(null)}
        allowCustom
        customLabel="Use custom make"
        customPlaceholder="Type manufacturer (e.g. Rivian)…"
      />
      <SelectSheet
        open={sheet === "model"}
        title={kindFilter === "suv" ? "SUV Model" : "Model"}
        items={modelNames}
        selected={model}
        onSelect={pickModel}
        onClose={() => setSheet(null)}
        emptyHint={
          make
            ? "No catalog models — type yours below"
            : "Pick a make first"
        }
        allowCustom
        customLabel="Use custom model"
        customPlaceholder="Type model name…"
      />
      <SelectSheet
        open={sheet === "trim"}
        title="Trim / Engine"
        subtitle={
          year
            ? `Rows that cover ${year}`
            : "All years in the table — pick a year to filter"
        }
        items={trimItems}
        selected={trim}
        onSelect={setTrim}
        onClose={() => setSheet(null)}
        emptyHint={
          model
            ? year
              ? `No catalog row for ${year} ${make} ${model} — type yours or skip`
              : "No catalog trims — type yours or skip"
            : "Pick a model first"
        }
        allowCustom
        customLabel="Use custom trim"
        customPlaceholder="Type trim / engine…"
      />
      <SelectSheet
        open={sheet === "rvType"}
        title="RV Type"
        subtitle={
          vehicleIsTruck
            ? "5th wheel or travel trailer"
            : "Travel trailer only for non-trucks"
        }
        items={rvTypeOptions}
        selected={rvType}
        onSelect={(v) => {
          if (!vehicleIsTruck) {
            setRvType("Travel Trailer");
          } else {
            setRvType(v);
          }
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        open={sheet === "bed"}
        title="Truck Bed Length"
        items={BEDS}
        selected={bed}
        onSelect={setBed}
        onClose={() => setSheet(null)}
      />
        </>
      }
    >
      <div className="flex items-center justify-end gap-1.5 px-3 pb-1 pt-1 sm:px-4">
        <button
          type="button"
          onClick={clearVehicle}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white"
          aria-label="Clear vehicle selection"
        >
          <Eraser className="size-3" />
          Clear
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-1 rounded-full border border-blue/30 bg-blue/10 px-2.5 py-1 text-[10px] font-semibold text-blue"
          aria-label="Reset to defaults"
        >
          <RefreshCw className="size-3" />
          Reset
        </button>
      </div>

      <div className="landscape-content mx-auto w-full max-w-lg space-y-3 px-3 pb-8 sm:px-4">
        <section
          className="rvtow-hero grid grid-cols-2 gap-2"
          aria-label="Pin weight and hitch guide"
        >
          <GuideHero
            kicker="PIN WEIGHT"
            title="5th Wheel"
            pct="18–25%"
            checks={[
              "More stable at speed",
              "Higher weight limits",
              "Lower center of gravity",
            ]}
            active={pinHeroActive}
          />
          <GuideHero
            kicker="HITCH GUIDE"
            title="Travel Trailer"
            pct="10–15%"
            checks={[
              "No bed modification",
              "Ball hitch (universal)",
              "Full bed access kept",
            ]}
            active={!pinHeroActive}
          />
        </section>

        {toadMode && prefill.kind === "motorhome" ? (
          <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
            <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-sky-200">
              TOAD MODE
            </p>
            <p className="text-[14px] font-bold text-white">
              {formatActiveCoachChip(prefill.coach)}
            </p>
            {prefill.coach.towingCapacityLbs ? (
              <p className="mt-2 text-[18px] font-black tabular-nums text-sky-100">
                {prefill.coach.towingCapacityLbs.toLocaleString()}
                <span className="ml-1 text-[11px] font-semibold">lbs</span>
              </p>
            ) : null}
            <button
              type="button"
              onClick={openReverse}
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-white/20 bg-black/40 px-3.5 text-[12px] font-bold text-white"
            >
              Match a different trailer instead
            </button>
          </section>
        ) : null}
        <div className="flex gap-1 rounded-full border border-white/15 bg-black/30 p-1">
          {(
            [
              ["all", "All", truckCount + suvCount],
              ["truck", "Trucks", truckCount],
              ["suv", "SUVs", suvCount],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyKindFilter(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[12px] font-bold transition",
                kindFilter === id
                  ? "bg-blue text-white shadow-[0_0_14px_rgba(77,166,255,0.35)]"
                  : "text-white hover:text-white",
              )}
            >
              {id === "truck" ? (
                <Truck className="size-3.5" />
              ) : id === "suv" ? (
                <Car className="size-3.5" />
              ) : null}
              {label}
              <span className="text-[10px] opacity-80">({count})</span>
            </button>
          ))}
        </div>

        {toadMode ? null : (
          <div className="flex gap-1 rounded-full border border-white/15 bg-black/30 p-1">
            {(
              [
                ["match", "Match a truck"],
                ["reverse", "Can I tow this?"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id === "reverse") openReverse();
                  else setShopMode("match");
                }}
                className={cn(
                  "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full px-2 text-[12px] font-bold transition",
                  shopMode === id
                    ? "bg-blue text-white shadow-[0_0_14px_rgba(77,166,255,0.35)]"
                    : "text-white hover:text-white",
                )}
              >
                {id === "reverse" ? (
                  <Search className="size-3.5" />
                ) : (
                  <Truck className="size-3.5" />
                )}
                {label}
              </button>
            ))}
          </div>
        )}

        {reverseMode ? null : (
        <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-blue">
            <img
              src="/assets/brand/icon-rvtow.png"
              alt=""
              className="size-4 object-contain"
            />
            Tow Vehicle
          </p>
          <Field
            label="YEAR"
            value={year || "Select year"}
            empty={!year}
            onClick={() => setSheet("year")}
          />
          <Field
            label="MAKE"
            value={make || "Select make"}
            empty={!make}
            onClick={() => setSheet("make")}
          />
          <Field
            label="MODEL"
            value={model || (make ? "Select or type model" : "Make first")}
            empty={!model}
            disabled={!make}
            onClick={() => make && setSheet("model")}
          />
          <Field
            label="TRIM / ENGINE / CONFIGURATION"
            value={
              trim ||
              (model
                ? inCatalog
                  ? "Select or type trim"
                  : "Type trim (optional)"
                : "Model first")
            }
            empty={!trim}
            disabled={!model}
            onClick={() => model && setSheet("trim")}
          />

          {hasVehicle && rating.custom ? (
            <div className="mt-3 space-y-2 rounded-[var(--radius-md)] border border-amber/35 bg-amber/10 px-3 py-3">
              <p className="text-[12px] font-bold text-amber">
                Custom vehicle
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-blue">
                    MAX TOW
                  </span>
                  <input
                    value={manualMaxTow}
                    onChange={(e) =>
                      setManualMaxTow(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="lbs"
                    inputMode="numeric"
                    className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-2 py-2 text-sm text-white outline-none focus:border-blue/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-blue">
                    PAYLOAD
                  </span>
                  <input
                    value={manualPayload}
                    onChange={(e) =>
                      setManualPayload(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="lbs"
                    inputMode="numeric"
                    className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-2 py-2 text-sm text-white outline-none focus:border-blue/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-blue">
                    GCWR
                  </span>
                  <input
                    value={manualGcwr}
                    onChange={(e) =>
                      setManualGcwr(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="lbs"
                    inputMode="numeric"
                    className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-2 py-2 text-sm text-white outline-none focus:border-blue/50"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {hasVehicle ? (
            <>
              <div className="mt-3 rounded-[var(--radius-md)] border border-blue/25 bg-blue/10 px-3 py-2.5">
                <p className="text-[12px] font-semibold text-white">
                  {year || "—"} {make} {model}
                </p>
                <p className="mt-0.5 text-[11px] text-white">
                  {rating.custom ? trim : trimStem(trim)}
                </p>
                {formatTrimYearRange(trim) ? (
                  <p className="mt-1">
                    <span className="inline-flex rounded-full border border-blue/35 bg-blue/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue">
                      {formatTrimYearRange(trim)}
                    </span>
                  </p>
                ) : null}
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue/90">
                  {rating.kind === "suv" ? "SUV" : "Truck"} · {rating.hitch}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat
                  value={fmtK(rating.maxTow)}
                  sub={`MAX TOW\n${rating.maxTow.toLocaleString()} lbs`}
                />
                <Stat
                  value={fmtK(rating.payload)}
                  sub={`PAYLOAD\n${rating.payload.toLocaleString()} lbs`}
                />
                <Stat
                  value={fmtK(rating.gcwr)}
                  sub={
                    rating.gcwr
                      ? `GCWR\n${rating.gcwr.toLocaleString()} lbs`
                      : rating.custom
                        ? "GCWR\nenter sticker"
                        : "GCWR\n—"
                  }
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Stat
                  value={fmtK(recommendedTow)}
                  sub={`REC. TOW\n${recommendedTow.toLocaleString()} lbs`}
                />
                <Stat
                  value={fmtK(recommendedPayload)}
                  sub={`REC. PAYLOAD\n${recommendedPayload.toLocaleString()} lbs`}
                />
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-white/20 bg-black/25 px-3 py-4 text-center">
              <p className="text-[13px] font-semibold text-white">
                No vehicle selected
              </p>
            </div>
          )}
        </section>
        )}

        {toadMode ? null : (
        <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-blue">
            {reverseMode ? "THIS TRAILER" : "RV DETAILS"}
          </p>
          {prefill.kind === "towable" ? (
            <div className="mb-3 rounded-[var(--radius-md)] border border-sky-400/30 bg-sky-500/10 px-3 py-2.5">
              <p className="text-[10px] font-bold tracking-[0.12em] text-sky-200">
                TRAILER FROM FACTS
              </p>
              <p className="mt-1 text-[13px] font-bold text-white">
                {formatActiveCoachChip(prefill.coach)}
              </p>
              {reverseMode ? null : (
                <button
                  type="button"
                  onClick={openReverse}
                  className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-full border border-sky-300/40 bg-sky-500/20 px-3.5 text-[12px] font-bold text-white"
                >
                  <Search className="size-3.5" />
                  Can I tow this coach?
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          ) : null}
          {reverseMode ? (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="YEAR"
                value={year || "Year"}
                empty={!year}
                onClick={() => setSheet("year")}
                flush
              />
              <Field
                label="RV TYPE"
                value={
                  vehicleIsTruck ? rvType : "Travel Trailer"
                }
                onClick={() => {
                  if (vehicleIsTruck) setSheet("rvType");
                }}
                disabled={!vehicleIsTruck}
                flush
              />
            </div>
          ) : (
          <Field
            label="RV TYPE"
            value={
              vehicleIsTruck
                ? rvType
                : "Travel Trailer (auto · non-truck)"
            }
            onClick={() => {
              if (vehicleIsTruck) setSheet("rvType");
            }}
            disabled={!vehicleIsTruck}
          />
          )}
          <label className="mt-2.5 block">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-blue">
              RV GVWR (lbs) *
            </span>
            <input
              value={gvwr}
              onChange={(e) => setGvwr(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-blue/50"
              inputMode="numeric"
            />
          </label>

          {rvType === "Fifth Wheel" && vehicleIsTruck && !reverseMode && (
            <>
              <div className="mt-2.5">
                <Field
                  label="TRUCK BED LENGTH"
                  value={bed}
                  onClick={() => setSheet("bed")}
                />
              </div>
              <HitchWeightField
                kind="pin"
                value={pin}
                estimatedLbs={pinEst}
                recommendedPayload={recommendedPayload}
                onChange={setPin}
              />
            </>
          )}

          {rvType !== "Fifth Wheel" && !reverseMode && (
            <HitchWeightField
              kind="tongue"
              value={pin}
              estimatedLbs={pinEst}
              recommendedPayload={recommendedPayload}
              onChange={setPin}
            />
          )}

          {hasVehicle && !reverseMode ? (
            <GlanceChecks verdict={verdict} gvwrN={gvwrN} maxTow={rating.maxTow} />
          ) : null}
        </section>
        )}

        {reverseMode ? (
          <>
          <ReverseResults
            gvwrN={gvwrN}
            rvType={rvType}
            year={year}
            hitchLoad={reverseResult.hitchLoad}
            hits={reverseResult.hits}
            total={reverseResult.total}
            limit={reverseLimit}
            onShowMore={() =>
              setReverseLimit((n) => Math.min(n + REVERSE_SHORTLIST, REVERSE_LIST_CAP))
            }
            onPick={applyReversePick}
          />
          <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
            <HitchWeightField
              kind={/fifth/i.test(rvType) ? "pin" : "tongue"}
              value={pin}
              estimatedLbs={reverseResult.hitchLoad}
              recommendedPayload={0}
              onChange={setPin}
              flush
            />
          </section>
          </>
        ) : null}

        <SuiteHandoffCard
          saved={deviceSaved}
          hasVehicle={hasVehicle}
          tripsOffer={tripsOffer}
          coachChip={
            nav?.activeCoach ? formatActiveCoachChip(nav.activeCoach) : null
          }
          onOpenTrips={openTripsProfile}
        />

        <section className="glass-surface rounded-[var(--radius-xl)] p-1.5">
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            className="flex min-h-11 w-full items-center justify-between rounded-[var(--radius-lg)] px-3 text-left"
          >
            <span className="text-[13px] font-bold text-white">Details</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-white/80 transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
          </button>
          {detailsOpen ? (
            <ul className="space-y-2 px-3 pb-3">
              {detailLines.map((line) => (
                <li
                  key={line}
                  className="text-[12px] leading-relaxed text-white/80"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <SuiteDisclaimer />

      </div>
    </SuitePage>
  );
}

function SuiteHandoffCard({
  saved,
  hasVehicle,
  tripsOffer,
  coachChip,
  onOpenTrips,
}: {
  saved: SavedTowVehicle | null;
  hasVehicle: boolean;
  tripsOffer: ReturnType<typeof offerFromCoach>;
  coachChip: string | null;
  onOpenTrips: () => void;
}) {
  const truckLine = saved
    ? formatSavedTowVehicle(saved)
    : hasVehicle
      ? "Current truck is not saved yet"
      : "No truck saved on this device";
  return (
    <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
      <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-blue">
        SUITE
      </p>
      <p className="flex items-start gap-1.5 text-[13px] font-bold text-white">
        <Bookmark className="mt-0.5 size-3.5 shrink-0 text-blue" />
        {saved ? "Saved on this device" : "Last truck"}
      </p>
      <p className="mt-1 pl-5 text-[12px] leading-snug text-white/85">
        {truckLine}
      </p>
      {tripsOffer && coachChip ? (
        <p className="mt-2 pl-5 text-[12px] font-semibold text-white">
          {coachChip}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onOpenTrips}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/20 px-3.5 text-[12px] font-bold text-white"
      >
        <MapPin className="size-3.5" />
        Use for trip alerts
        <ChevronRight className="size-3.5" />
      </button>
    </section>
  );
}

function ReverseResults({
  gvwrN,
  year,
  hits,
  total,
  limit,
  onShowMore,
  onPick,
}: {
  gvwrN: number;
  rvType: string;
  year: string;
  hitchLoad: number;
  hits: ReverseHit[];
  total: number;
  limit: number;
  onShowMore: () => void;
  onPick: (hit: ReverseHit) => void;
}) {
  return (
    <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
      <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-blue">
        TRUCKS THAT FIT
        {gvwrN > 0 ? ` · ${gvwrN.toLocaleString()}` : ""}
        {year ? ` · ${year}` : ""}
      </p>

      {gvwrN <= 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-white/20 bg-black/25 px-3 py-4 text-center">
          <p className="text-[13px] font-semibold text-white">
            Need a trailer weight
          </p>
        </div>
      ) : hits.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-white/20 bg-black/25 px-3 py-4 text-center">
          <p className="text-[13px] font-semibold text-white">No catalog row</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {hits.map((hit) => (
            <li key={`${hit.make}|${hit.model}|${hit.trim}`}>
              <ReverseHitCard hit={hit} onPick={onPick} />
            </li>
          ))}
        </ul>
      )}

      {gvwrN > 0 && total > 0 ? (
        <p className="mt-3 text-[13px] font-bold tabular-nums text-white">
          {hits.length}/{total}
        </p>
      ) : null}

      {total > hits.length && limit < REVERSE_LIST_CAP ? (
        <button
          type="button"
          onClick={onShowMore}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 bg-black/40 text-[12px] font-bold text-white"
        >
          Show more fits
        </button>
      ) : null}
    </section>
  );
}

function ReverseHitCard({
  hit,
  onPick,
}: {
  hit: ReverseHit;
  onPick: (hit: ReverseHit) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(hit)}
      className="flex w-full min-h-11 items-center justify-between gap-3 rounded-[var(--radius-md)] border border-blue/25 bg-blue/10 px-3 py-3 text-left active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-white">
          {hit.make} {hit.model}
        </p>
        <p className="text-[10px] font-semibold tracking-wide text-white/70">
          REC. TOW
        </p>
      </div>
      <p className="shrink-0 text-[18px] font-black tabular-nums text-white">
        {hit.recommendedTow.toLocaleString()}
      </p>
    </button>
  );
}

function HitchWeightField({
  kind,
  value,
  estimatedLbs,
  recommendedPayload: _recommendedPayload,
  onChange,
  flush,
}: {
  kind: "pin" | "tongue";
  value: string;
  estimatedLbs: number;
  recommendedPayload: number;
  onChange: (next: string) => void;
  flush?: boolean;
}) {
  const label = kind === "pin" ? "PIN WEIGHT (lbs)" : "TONGUE WEIGHT (lbs)";
  const noun = kind === "pin" ? "pin" : "tongue";
  return (
    <label className={flush ? "block" : "mt-2.5 block"}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.12em] text-white">
          {label}
        </span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] font-semibold text-blue"
          >
            Clear {noun}
          </button>
        ) : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={estimatedLbs ? estimatedLbs.toLocaleString() : "lbs"}
        className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-3 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-blue/50"
        inputMode="numeric"
      />
      <p className="mt-1.5 text-[16px] font-black tabular-nums text-white">
        {estimatedLbs > 0 ? estimatedLbs.toLocaleString() : "—"}
      </p>
    </label>
  );
}

function glanceForCheck(
  check: TowCheck,
  verdict: TowMatchVerdict,
  gvwrN: number,
  maxTow: number,
): { title: string; number: string } {
  if (check.id === "tow") {
    if (gvwrN <= 0 || maxTow <= 0) return { title: "Tow", number: "—" };
    const margin = maxTow - gvwrN;
    return {
      title: "Tow",
      number: `${margin >= 0 ? "+" : "−"}${Math.abs(margin).toLocaleString()}`,
    };
  }
  if (check.id === "hitch") {
    return {
      title: verdict.hitchKind === "pin" ? "Pin" : "Tongue",
      number: verdict.hitchLoad > 0 ? verdict.hitchLoad.toLocaleString() : "—",
    };
  }
  if (check.id === "gcwr") {
    return {
      title: "GCWR",
      number: verdict.combined
        ? verdict.combined.combinedLbs.toLocaleString()
        : "—",
    };
  }
  return { title: check.title, number: "—" };
}

function glanceMark(level: TowCheck["level"]): string {
  if (level === "fail" || level === "warn") return "⚠";
  if (level === "skip") return "·";
  return "✓";
}

function GlanceChecks({
  verdict,
  gvwrN,
  maxTow,
}: {
  verdict: TowMatchVerdict;
  gvwrN: number;
  maxTow: number;
}) {
  const cards = verdict.checks.filter((c) => c.id !== "bed");
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {cards.map((check) => {
        const glance = glanceForCheck(check, verdict, gvwrN, maxTow);
        const tone =
          check.level === "fail"
            ? "border-ruby-border bg-ruby-soft/60 text-ruby"
            : check.level === "warn"
              ? "border-amber/40 bg-amber/10 text-amber"
              : check.level === "skip"
                ? "border-white/15 bg-black/25 text-white/80"
                : "border-green/40 bg-green/10 text-green";
        return (
          <div
            key={check.id}
            className={cn(
              "rounded-[var(--radius-md)] border px-2 py-2.5 text-center",
              tone,
            )}
          >
            <p className="text-[10px] font-bold tracking-wide">
              {glanceMark(check.level)} {glance.title}
            </p>
            <p className="mt-1 text-[16px] font-black tabular-nums text-white">
              {glance.number}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function fmtK(n: number) {
  if (!n) return "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
}

function Field({
  label,
  value,
  onClick,
  empty,
  disabled,
  flush,
}: {
  label: string;
  value: string;
  onClick: () => void;
  empty?: boolean;
  disabled?: boolean;
  flush?: boolean;
}) {
  return (
    <div className={flush ? "mt-2.5" : "mt-2.5 first:mt-0"}>
      <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-blue">
        {label}
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 rounded-[var(--radius-md)] border bg-black/40 px-3 py-3 text-left transition",
          disabled
            ? "cursor-not-allowed border-border/50 opacity-50"
            : "border-border active:scale-[0.99] active:border-blue/50",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            empty ? "text-white" : "text-white",
          )}
        >
          {value}
        </span>
        <ChevronDown className="size-4 shrink-0 text-white" />
      </button>
    </div>
  );
}

function Stat({ value, sub }: { value: string; sub: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-blue/30 bg-blue/10 px-2 py-2.5 text-center">
      <p className="text-[20px] font-bold tabular-nums text-blue">{value}</p>
      <p className="mt-0.5 whitespace-pre-line text-[9px] leading-tight text-white">
        {sub}
      </p>
    </div>
  );
}

function GuideHero({
  kicker,
  title,
  pct,
  checks,
  active,
}: {
  kicker: string;
  title: string;
  pct: string;
  checks: string[];
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-surface flex min-h-44 flex-col rounded-[var(--radius-xl)] px-3 py-3.5",
        active ? "border-blue/55" : "border-white/20",
      )}
    >
      <p className="text-[10px] font-bold tracking-[0.16em] text-blue">
        {kicker}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-white/85">{title}</p>
      <p className="rvtow-hero-pct mt-1 font-black tabular-nums text-blue">
        {pct}
      </p>
      <ul className="mt-auto space-y-1 pt-3">
        {checks.map((item) => (
          <li
            key={item}
            className="text-[10px] font-semibold leading-tight text-green"
          >
            ✓ {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
