import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Eraser,
  Info,
  RefreshCw,
  Truck,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSheet } from "@/components/rvfax/SelectSheet";
import {
  getModels,
  getRating,
  getTrims,
  makesForKind,
  type VehicleKind,
} from "@/lib/tow/towVehicles";
import { SuitePage } from "@/components/shell/SuitePage";


const YEARS = Array.from({ length: 22 }, (_, i) => String(2026 - i)); // 2026 → 2005


/** Towable RVs only — motorhomes are not towed by the selected vehicle. */
const RV_TYPES_TRUCK = ["Fifth Wheel", "Travel Trailer"] as const;
const RV_TYPES_NON_TRUCK = ["Travel Trailer"] as const;

/** Comfort / safety planning load (industry “80% rule”) vs OEM maximum. */
const RECOMMENDED_TOW_FACTOR = 0.8;
const RECOMMENDED_PAYLOAD_FACTOR = 0.85;

const BEDS = ["5.5 ft (Short Bed)", "6.5 ft (Standard Bed)", "8 ft (Long Bed)"];

type KindFilter = "all" | VehicleKind;

const EMPTY = {
  year: "",
  make: "",
  model: "",
  trim: "",
};

export function RvTowApp() {
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [year, setYear] = useState("2024");
  const [make, setMake] = useState("Ford");
  const [model, setModel] = useState("F-350 Super Duty");
  const [trim, setTrim] = useState(
    "XL — 6.7L Power Stroke Diesel (SRW)",
  );
  const [rvType, setRvType] = useState("Fifth Wheel");
  const [gvwr, setGvwr] = useState("14000");
  const [bed, setBed] = useState("6.5 ft (Standard Bed)");
  const [pin, setPin] = useState("");
  const [sheet, setSheet] = useState<
    "year" | "make" | "model" | "trim" | "rvType" | "bed" | null
  >(null);
  // Manual OEM ratings when vehicle is not in the catalog
  const [manualMaxTow, setManualMaxTow] = useState("");
  const [manualPayload, setManualPayload] = useState("");
  const [manualGcwr, setManualGcwr] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const makeList = useMemo(() => makesForKind(kindFilter), [kindFilter]);

  const models = useMemo(() => {
    if (!make) return [];
    return getModels(make, kindFilter === "all" ? "all" : kindFilter);
  }, [make, kindFilter]);

  const modelNames = useMemo(() => models.map((m) => m.name), [models]);

  const trims = useMemo(() => {
    if (!make || !model) return [];
    return getTrims(make, model);
  }, [make, model]);

  const trimLabels = useMemo(() => trims.map((t) => t.label), [trims]);

  const inCatalog = useMemo(() => {
    if (!make || !model) return false;
    const mods = getModels(make, "all");
    if (!mods.some((m) => m.name === model)) return false;
    const trims = getTrims(make, model);
    if (!trim) return mods.length > 0;
    return trims.some((t) => t.label === trim) || trims.length === 0;
  }, [make, model, trim]);

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
    // Custom / not-in-list vehicle — use manual door-sticker numbers
    const maxTow = parseInt(manualMaxTow, 10) || 0;
    const payload = parseInt(manualPayload, 10) || 0;
    const gcwr = parseInt(manualGcwr, 10) || (maxTow && payload ? maxTow + payload + 5000 : 0);
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
  const pinEst = pin ? parseInt(pin, 10) : Math.round(gvwrN * 0.2);
  const canTow = hasVehicle && rating.maxTow >= gvwrN;
  const pinOk =
    !hasVehicle || rvType !== "Fifth Wheel" || pinEst <= rating.payload;
  const margin = hasVehicle ? rating.maxTow - gvwrN : 0;

  /** Effective vehicle kind for RV-type rules */
  const vehicleIsTruck =
    !hasVehicle
      ? kindFilter !== "suv"
      : rating.kind === "truck" && kindFilter !== "suv";

  const rvTypeOptions = vehicleIsTruck
    ? [...RV_TYPES_TRUCK]
    : [...RV_TYPES_NON_TRUCK];

  /** Recommended continuous tow / payload (below OEM max). */
  const recommendedTow = hasVehicle
    ? Math.round(rating.maxTow * RECOMMENDED_TOW_FACTOR)
    : 0;
  const recommendedPayload = hasVehicle
    ? Math.round(rating.payload * RECOMMENDED_PAYLOAD_FACTOR)
    : 0;
  const withinRecommended =
    hasVehicle && gvwrN > 0 && gvwrN <= recommendedTow;
  const overRecommendedUnderMax =
    hasVehicle && gvwrN > recommendedTow && gvwrN <= rating.maxTow;

  // Non-truck vehicles (SUV / car-class) → travel trailer only
  useEffect(() => {
    if (kindFilter === "suv" || (hasVehicle && rating.kind === "suv")) {
      if (rvType !== "Travel Trailer") setRvType("Travel Trailer");
    }
  }, [kindFilter, hasVehicle, rating.kind, rvType]);

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
        const onlyTrims = only.trims;
        setTrim(onlyTrims.length === 1 ? onlyTrims[0]!.label : "");
      } else {
        setModel("");
        setTrim("");
      }
    },
    [kindFilter],
  );

  const pickModel = useCallback(
    (m: string) => {
      setModel(m);
      setManualMaxTow("");
      setManualPayload("");
      setManualGcwr("");
      const nextTrims = getTrims(make, m);
      if (nextTrims.length === 1) setTrim(nextTrims[0]!.label);
      else setTrim("");
    },
    [make],
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
  };

  const resetDefaults = () => {
    setKindFilter("all");
    setYear("2024");
    setMake("Ford");
    setModel("F-350 Super Duty");
    setTrim("XL — 6.7L Power Stroke Diesel (SRW)");
    setRvType("Fifth Wheel");
    setGvwr("14000");
    setBed("6.5 ft (Standard Bed)");
    setPin("");
    setManualMaxTow("");
    setManualPayload("");
    setManualGcwr("");
  };

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
        items={YEARS}
        selected={year}
        onSelect={setYear}
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
        items={trimLabels}
        selected={trim}
        onSelect={setTrim}
        onClose={() => setSheet(null)}
        emptyHint={
          model
            ? "No catalog trims — type yours or skip"
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

        <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-blue">
            <img
              src="/assets/brand/icon-rvtow.png"
              alt=""
              className="size-4 object-contain"
            />
            Tow Vehicle
          </p>
          <p className="mb-3 text-[11px] text-white">
            Tap any field · type your own if it's not listed · pull down to
            clear
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
                Custom vehicle — enter door-sticker ratings
              </p>
              <p className="text-[11px] leading-relaxed text-white">
                {year || "—"} {make} {model}
                {trim ? ` · ${trim}` : ""} is not in our OEM table. Type the max
                tow / payload from the sticker or owner's manual.
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
                <p className="flex items-start gap-1.5 text-[12px] font-semibold text-white">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-blue" />
                  {year || "—"} {make} {model}
                </p>
                <p className="mt-0.5 pl-5 text-[11px] text-white">{trim}</p>
                <p className="mt-1 pl-5 text-[10px] font-semibold uppercase tracking-wide text-blue/90">
                  {rating.kind === "suv" ? "SUV" : "Truck"} · {rating.hitch}{" "}
                  hitch
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
                  sub={`GCWR\n${rating.gcwr.toLocaleString()} lbs`}
                />
              </div>

              {/* Recommended (comfort) ratings — industry ~80% of OEM max */}
              <div className="mt-2 rounded-[var(--radius-md)] border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5">
                <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-300">
                  RECOMMENDED TOW (PLANNING)
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[18px] font-black tabular-nums text-white">
                      {fmtK(recommendedTow)}
                    </p>
                    <p className="text-[10px] font-semibold leading-snug text-white">
                      Rec. trailer ≤{" "}
                      <span className="font-bold text-white">
                        {recommendedTow.toLocaleString()} lbs
                      </span>
                      <br />
                      <span className="font-medium text-white">
                        (80% of {rating.maxTow.toLocaleString()} max)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[18px] font-black tabular-nums text-white">
                      {fmtK(recommendedPayload)}
                    </p>
                    <p className="text-[10px] font-semibold leading-snug text-white">
                      Rec. payload ≤{" "}
                      <span className="font-bold text-white">
                        {recommendedPayload.toLocaleString()} lbs
                      </span>
                      <br />
                      <span className="font-medium text-white">
                        (85% of {rating.payload.toLocaleString()} payload)
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] font-medium leading-relaxed text-white">
                  OEM max is the tested ceiling (e.g. SAE J2807 when equipped).
                  Most guides plan trailers around ~80% of max tow so hills,
                  wind, passengers, and gear stay inside a comfort margin.
                </p>
              </div>

              <p className="mt-2 text-[12px] font-semibold text-white">
                OEM Hitch:{" "}
                <span className="font-bold text-blue">{rating.hitch}</span>
                <span className="font-semibold text-white">
                  {" "}
                  · ratings when properly equipped
                </span>
              </p>
            </>
          ) : (
            <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-white/20 bg-black/25 px-3 py-4 text-center">
              <p className="text-[13px] font-semibold text-white">
                No vehicle selected
              </p>
              <p className="mt-1 text-[11px] text-white">
                Choose year · make · model · trim to see OEM tow ratings
              </p>
            </div>
          )}
        </section>

        <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-blue">
            RV DETAILS
          </p>
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
          {!vehicleIsTruck ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-sky-200/90">
              SUVs and non-truck vehicles are set to{" "}
              <span className="font-semibold text-white">Travel Trailer</span>
              — 5th wheels need a truck bed hitch.
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-white">
              Truck: choose{" "}
              <span className="font-semibold text-white">5th Wheel</span> or{" "}
              <span className="font-semibold text-white">Travel Trailer</span>
            </p>
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
            <span className="mt-1 block text-[10px] text-white">
              Gross Vehicle Weight Rating — from RV door sticker or spec sheet
            </span>
          </label>

          {rvType === "Fifth Wheel" && vehicleIsTruck && (
            <>
              <div className="mt-2.5">
                <Field
                  label="TRUCK BED LENGTH"
                  value={bed}
                  onClick={() => setSheet("bed")}
                />
              </div>
              <label className="mt-2.5 block">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-white">
                    PIN WEIGHT (lbs){" "}
                    <span className="text-white">OPTIONAL</span>
                  </span>
                  {pin ? (
                    <button
                      type="button"
                      onClick={() => setPin("")}
                      className="text-[10px] font-semibold text-blue"
                    >
                      Clear pin
                    </button>
                  ) : null}
                </div>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 3,000  (est. 20% of GVWR)"
                  className="w-full rounded-[var(--radius-md)] border border-border bg-black/40 px-3 py-3 text-sm text-white outline-none placeholder:text-white focus:border-blue/50"
                  inputMode="numeric"
                />
              </label>
              <p className="mt-2 text-[11px] text-blue">
                Auto-estimating pin weight at {pinEst.toLocaleString()} lbs (20%
                of GVWR) · keep pin under ~{recommendedPayload.toLocaleString()}{" "}
                lbs recommended payload
              </p>
            </>
          )}

          {hasVehicle ? (
            <div className="mt-3 space-y-2">
              <div
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-3 text-sm font-semibold",
                  canTow && pinOk
                    ? "border-green/40 bg-green/10 text-green"
                    : "border-ruby-border bg-ruby-soft text-ruby",
                )}
              >
                {canTow && pinOk
                  ? `✓ Within OEM max — ${margin.toLocaleString()} lb tow margin (${rating.maxTow.toLocaleString()} max vs ${gvwrN.toLocaleString()} GVWR)`
                  : `⚠ Over OEM max — max tow ${rating.maxTow.toLocaleString()} lbs / payload ${rating.payload.toLocaleString()} lbs`}
              </div>
              {canTow && withinRecommended ? (
                <div className="rounded-[var(--radius-md)] border border-emerald-400/35 bg-emerald-500/10 px-3 py-2.5 text-[12px] font-semibold text-emerald-100">
                  ✓ Within recommended planning weight (≤{" "}
                  {recommendedTow.toLocaleString()} lbs / 80% of max)
                </div>
              ) : null}
              {canTow && overRecommendedUnderMax ? (
                <div className="rounded-[var(--radius-md)] border border-amber/40 bg-amber/10 px-3 py-2.5 text-[12px] font-semibold leading-relaxed text-amber">
                  ⚠ Above recommended {recommendedTow.toLocaleString()} lbs but
                  under OEM max {rating.maxTow.toLocaleString()} lbs — legal when
                  equipped, but little margin for hills, wind, or gear. Prefer a
                  lighter trailer or higher-rated truck.
                </div>
              ) : null}
            </div>
          ) : null}

          {hasVehicle && rating.kind === "suv" && gvwrN > 8000 ? (
            <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-amber">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Heavy trailers on SUVs need careful weight distribution, brake
              controller, and payload check (passengers + gear count against
              payload).
            </p>
          ) : null}
        </section>

        {rvType === "Fifth Wheel" && vehicleIsTruck && (
          <section className="glass-surface rounded-[var(--radius-xl)] p-3.5">
            <p className="mb-3 text-[13px] font-bold text-blue">
              5th Wheel: Pin Weight & Hitch Guide
            </p>
            <div className="grid grid-cols-2 gap-2">
              <GuideCard
                title="5th Wheel"
                sub="Pin Weight"
                pct="18–25%"
                pros={[
                  "More stable at speed",
                  "Higher weight limits",
                  "Lower center of gravity",
                ]}
                cons={["Bed hitch required", "Bed access reduced"]}
                active
              />
              <GuideCard
                title="Travel Trailer"
                sub="Tongue Weight"
                pct="10–15%"
                pros={[
                  "No bed modification",
                  "Ball hitch (universal)",
                  "Full bed access kept",
                ]}
                cons={["Lower weight limit", "More sway risk"]}
              />
            </div>
          </section>
        )}

        <p className="px-1 text-center text-[10px] leading-relaxed text-white">
          Max = OEM ceiling when properly equipped. Recommended ≈ 80% of max for
          real-world margin. SUV → Travel Trailer only. Verify door sticker.
        </p>

      </div>
    </SuitePage>
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
}: {
  label: string;
  value: string;
  onClick: () => void;
  empty?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2.5 first:mt-0">
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

function GuideCard({
  title,
  sub,
  pct,
  pros,
  cons,
  active,
}: {
  title: string;
  sub: string;
  pct: string;
  pros: string[];
  cons: string[];
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border px-2.5 py-3",
        active ? "border-blue/40 bg-blue/10" : "border-border bg-black/30",
      )}
    >
      <p className="text-center text-[12px] font-bold text-blue">{title}</p>
      <p className="text-center text-[10px] text-white">{sub}</p>
      <p className="mt-1 text-center text-xl font-bold text-blue">{pct}</p>
      <p className="text-center text-[9px] text-white">of trailer GVWR</p>
      <ul className="mt-2 space-y-1">
        {pros.map((p) => (
          <li key={p} className="text-[10px] text-green">
            ✓ {p}
          </li>
        ))}
        {cons.map((c) => (
          <li key={c} className="text-[10px] text-amber">
            ⚠ {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
