import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  BedDouble,
  Bookmark,
  Check,
  ChevronDown,
  Filter,
  Fuel,
  GitCompare,
  Heart,
  Loader2,
  Ruler,
  ScanLine,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { CascadeField, RVResult } from "@/lib/rv/catalog";
import {
  applyCascadeChange,
  buildCascadeOptions,
  compareSelectionKey,
  countModelsForClass,
  ensureCatalogLoaded,
  formatYearRanges,
  modelPickerMeta,
  ratingFor,
  RV_CLASS_TABS,
  rvClassLabel,
  isCatalogLoaded,
  searchCatalog,
  useCatalogReady,
  yearsForFloorplanCode,
  YEARS,
} from "@/lib/rv/catalog";
import {
  cascadeFromResult,
  pickerCoachWrite,
  shouldOpenSingleHitReport,
} from "@/lib/rv/factsOpen";
import { didYouMean, type SuggestHit } from "@/lib/rv/suggest";
import { cn } from "@/lib/utils";
import { SHARED_PRESTIGE_BACKDROP } from "@/assets/prestige";
import { resolveCardImage } from "@/assets/typeMedia";
import { ScrollSuiteHeader } from "@/components/shell/ScrollChrome";
import { SuiteBackdrop } from "@/components/shell/SuitePage";
import { useAdaptiveGlass } from "@/lib/hooks/useAdaptiveGlass";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { PullResetHint } from "@/components/shell/PullResetHint";
import { ActiveCoachChip } from "@/components/shell/ActiveCoachChip";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { SelectSheet } from "./SelectSheet";
import { writeActiveCoach } from "@/lib/rv/activeCoach";
import {
  autoSaveFactsUnit,
  isSavedUnit,
  SAVED_UNITS_KEY,
  toggleSavedUnit,
} from "@/lib/rv/savedUnits";
import {
  hydrateShareCoachResult,
  loadSavedUnits,
} from "@/lib/rv/shareKit";

const RvDetail = lazy(() =>
  import("./RvDetail").then((m) => ({ default: m.RvDetail })),
);
const RvCompare = lazy(() =>
  import("./RvCompare").then((m) => ({ default: m.RvCompare })),
);
const VinDecoder = lazy(() =>
  import("./VinDecoder").then((m) => ({ default: m.VinDecoder })),
);

function PanelFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-bg">
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

const PRESTIGE_BACKDROP = SHARED_PRESTIGE_BACKDROP;

type YearEra = "all" | "classic" | "recent" | "modern" | "newer17";

const YEAR_ERAS: {
  id: YearEra;
  label: string;
  sub: string;
  min: number;
  max: number;
}[] = [
  { id: "all", label: "All Years", sub: "2002–2027", min: 2002, max: 2027 },
  { id: "classic", label: "Classic Era", sub: "2002–2005", min: 2002, max: 2005 },
  { id: "recent", label: "Recent Era", sub: "2006–2010", min: 2006, max: 2010 },
  { id: "modern", label: "Modern Era", sub: "2011+", min: 2011, max: 2027 },
  { id: "newer17", label: "17+", sub: "2017–2027", min: 2017, max: 2027 },
];

type Sheet = CascadeField | "era" | null;

type SearchSel = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType?: string;
};

export function RvFaxApp({
  onOpenGrok,
}: {
  onOpenGrok?: (prompt?: string) => void;
}) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [floorplan, setFloorplan] = useState("");
  const [rvType, setRvType] = useState("");
  const [era, setEra] = useState<YearEra>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RVResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [saved, setSaved] = useState<RVResult[]>([]);
  const [detail, setDetail] = useState<RVResult | null>(null);
  const [vinOpen, setVinOpen] = useState(false);
  const [comparePick, setComparePick] = useState<RVResult[]>([]);
  const { ready: catalogReady, gen: catalogGen } = useCatalogReady();
  const [compareOpen, setCompareOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestHit[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const adaptiveGlass = useAdaptiveGlass(PRESTIGE_BACKDROP, scrollRef);
  const kb = useKeyboardInset();
  const nav = useShellNavOptional();

  const resetFax = useCallback(() => {
    setYear("");
    setMake("");
    setModel("");
    setFloorplan("");
    setRvType("");
    setEra("all");
    setFiltersOpen(false);
    setSheet(null);
    setSearching(false);
    setResults([]);
    setHasSearched(false);
    setDetail(null);
    setVinOpen(false);
    setComparePick([]);
    setCompareOpen(false);
    setSuggestions([]);
    try {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      /* */
    }
  }, []);
  // Pull-to-reset was wiping search when users dragged a picker at
  // scrollTop≈0. Disable on the search surface — use the Reset control.
  const pullHint = usePullToReset(scrollRef, resetFax, {
    enabled: false,
  });


  const savedRef = useRef(saved);
  savedRef.current = saved;

  useEffect(() => {
    setSaved(loadSavedUnits());
    setDetail((prev) => (prev ? hydrateShareCoachResult(prev) : prev));
  }, [catalogReady]);

  const persistSaved = (next: RVResult[]) => {
    savedRef.current = next;
    setSaved(next);
    try {
      localStorage.setItem(SAVED_UNITS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("rvfax-saved-changed"));
    } catch {
      /* */
    }
  };

  useEffect(() => {
    if (!detail) return;
    const { next, added } = autoSaveFactsUnit(savedRef.current, detail);
    if (added) persistSaved(next);
  }, [detail]);

  const cascade = useMemo(
    () =>
      buildCascadeOptions({
        year,
        make,
        model,
        floorplan,
        rvType,
      }),
    [year, make, model, floorplan, rvType, catalogGen],
  );

  // Warm the report chunk before Open report so Suspense doesn't flash
  // the empty picker splash on a single-hit open.
  useEffect(() => {
    if (!cascade.canSearch) return;
    void import("./RvDetail");
  }, [cascade.canSearch]);

  const applySel = useCallback((next: SearchSel) => {
    setYear(next.year);
    setMake(next.make);
    setModel(next.model);
    setFloorplan(next.floorplan);
    if (next.rvType !== undefined) setRvType(next.rvType);
  }, []);

  const openFactsUnit = useCallback(
    (r: RVResult) => {
      applySel(cascadeFromResult(r));
      setDetail(hydrateShareCoachResult(r));
    },
    [applySel],
  );

  const setActiveCoach = nav?.setActiveCoach;
  const factsPickerToken = nav?.factsPickerToken ?? 0;

  useEffect(() => {
    const write = pickerCoachWrite(
      { year, make, model, floorplan, rvType },
      { reportOpen: Boolean(detail) },
    );
    if (write === undefined) return;
    if (setActiveCoach) setActiveCoach(write);
    else writeActiveCoach(write);
  }, [year, make, model, floorplan, rvType, setActiveCoach, detail]);

  useEffect(() => {
    if (!factsPickerToken) return;
    setDetail(null);
    setCompareOpen(false);
    setVinOpen(false);
  }, [factsPickerToken]);

  const yearsForEra = useMemo(() => {
    const e = YEAR_ERAS.find((x) => x.id === era) ?? YEAR_ERAS[0]!;
    return YEARS.filter((y) => {
      const n = parseInt(y, 10);
      return n >= e.min && n <= e.max;
    });
  }, [era]);

  const onEraSelect = useCallback(
    (id: string) => {
      const next = (YEAR_ERAS.find((e) => e.id === id)?.id ?? "all") as YearEra;
      setEra(next);
      const band = YEAR_ERAS.find((e) => e.id === next) ?? YEAR_ERAS[0]!;
      if (year) {
        const n = parseInt(year, 10);
        if (n < band.min || n > band.max) {
          applySel({ year: "", make: "", model: "", floorplan: "", rvType });
          setHasSearched(false);
          setResults([]);
        }
      }
    },
    [year, rvType, applySel],
  );

  const makeItems = useMemo(
    () =>
      cascade.makes.map((m) => ({
        value: m,
        label: m,
        meta: [year || null, rvType ? rvClassLabel(rvType) : null]
          .filter(Boolean)
          .join(" · ") || undefined,
      })),
    [cascade.makes, year, rvType],
  );

  const modelItems = useMemo(
    () =>
      cascade.models.map((m) => ({
        value: m,
        label: m,
        meta: modelPickerMeta(make || cascade.make, m, year || cascade.year),
      })),
    [cascade.models, cascade.make, cascade.year, make, year],
  );

  const floorplanItems = useMemo(() => {
    const fps = cascade.floorplans.map((fp) => {
      const span = year
        ? ""
        : formatYearRanges(yearsForFloorplanCode(make, model, fp));
      return {
        value: fp,
        label: fp,
        meta:
          year && make && model
            ? `${year} ${make} ${model}`
            : span
              ? span
              : "All years",
      };
    });
    // Always allow “any / all” so user can finish without a specific layout
    const anyMeta = year
      ? fps.length
        ? `Optional · ${year}`
        : `No verified layouts for ${year}`
      : "Optional";
    return [
      {
        value: "",
        label: "Any floorplan",
        meta: anyMeta,
      },
      ...fps,
    ];
  }, [cascade.floorplans, year, make, model]);

  const typeItems = useMemo(() => {
    const tabs = RV_CLASS_TABS.filter((t) => t.id !== "").map((t) => {
      const n = countModelsForClass(year, t.id);
      return { ...t, n };
    }).filter((t) => t.n > 0);
    return [
      {
        value: "",
        label: "All types",
        meta: year ? year : undefined,
      },
      ...tabs.map((t) => ({
        value: t.id,
        label: t.label,
      })),
    ];
  }, [year, catalogGen]);

  const catalogModelTotal = useMemo(
    () =>
      buildCascadeOptions({
        year,
        make: "",
        model: "",
        floorplan: "",
        rvType,
      }).counts.models,
    [year, rvType, catalogGen],
  );

  const eraItems = useMemo(
    () =>
      YEAR_ERAS.map((e) => ({
        value: e.id,
        label: e.label,
        meta: e.sub,
      })),
    [],
  );

  const runSearchNow = useCallback(
    (sel: SearchSel) => {
      if (!sel.year?.trim() || !sel.make?.trim()) return;
      setSearching(true);
      setHasSearched(true);
      setSuggestions([]);
      void (async () => {
        await ensureCatalogLoaded();
        await new Promise((r) => window.setTimeout(r, 40));
        const found = searchCatalog({
          year: sel.year,
          make: sel.make,
          model: sel.model,
          floorplan: sel.floorplan,
          rvType: sel.rvType || undefined,
        }).map((r) => ({
          ...r,
          saved: isSavedUnit(saved, r),
        }));
        setResults(found);
        setSearching(false);

        const opts = buildCascadeOptions({
          year: sel.year,
          make: sel.make,
          model: sel.model,
          floorplan: sel.floorplan,
          rvType: sel.rvType,
        });
        const needSuggest =
          opts.custom.make ||
          opts.custom.model ||
          found.length === 0 ||
          found.some((f) => f.custom);
        if (needSuggest) {
          setSuggestions(
            didYouMean({
              year: sel.year,
              make: sel.make,
              model: sel.model,
            }),
          );
        }

        // Exact single hit → open Vehicle History Report immediately
        if (shouldOpenSingleHitReport(found)) {
          openFactsUnit(found[0]!);
        }
      })();
    },
    [saved, openFactsUnit],
  );

  const runSearch = useCallback(() => {
    runSearchNow({ year, make, model, floorplan, rvType });
  }, [year, make, model, floorplan, rvType, runSearchNow]);

  const onCascadeSelect = useCallback(
    (field: CascadeField, value: string) => {
      setSuggestions([]);
      const next = applyCascadeChange(
        { year, make, model, floorplan, rvType },
        field,
        value,
      );
      applySel(next);
      setSheet(null);
      setHasSearched(false);
      setResults([]);
      if (field === "floorplan" && next.year && next.make && next.model) {
        runSearchNow({
          year: next.year,
          make: next.make,
          model: next.model,
          floorplan: next.floorplan,
          rvType: next.rvType,
        });
      }
    },
    [year, make, model, floorplan, rvType, applySel, runSearchNow],
  );

  useEffect(() => {
    if (!hasSearched || !cascade.canSearch || searching) return;
    if (!isCatalogLoaded()) return;
    const found = searchCatalog({
      year: cascade.year,
      make: cascade.make,
      model: cascade.model,
      floorplan: cascade.floorplan,
      rvType: cascade.rvType || undefined,
    }).map((r) => ({
      ...r,
      saved: isSavedUnit(saved, r),
    }));
    setResults(found);
  }, [
    year,
    make,
    model,
    cascade.floorplan,
    cascade.rvType,
    cascade.canSearch,
    hasSearched,
    searching,
    saved,
    catalogGen,
  ]);

  const applySuggestion = useCallback(
    (hit: SuggestHit) => {
      const base = { year, make, model, floorplan, rvType };
      let next = applyCascadeChange(base, "make", hit.make);
      if (hit.model) next = applyCascadeChange(next, "model", hit.model);
      applySel(next);
      setSuggestions([]);
      setHasSearched(false);
      setResults([]);
    },
    [year, make, model, floorplan, rvType, applySel],
  );

  const toggleSave = (r: RVResult) => {
    persistSaved(toggleSavedUnit(saved, r));
  };

  const toggleCompare = (r: RVResult) => {
    const key = compareSelectionKey(r);
    const idx = comparePick.findIndex((c) => compareSelectionKey(c) === key);
    if (idx >= 0) {
      setComparePick(comparePick.filter((_, i) => i !== idx));
      return;
    }
    if (comparePick.length >= 3) return;
    setComparePick([...comparePick, r]);
  };

  const eraLabel =
    YEAR_ERAS.find((e) => e.id === era)?.label ?? "All Years";
  const eraSub = YEAR_ERAS.find((e) => e.id === era)?.sub ?? "";

  if (compareOpen && comparePick.length >= 2) {
    return (
      <Suspense fallback={<PanelFallback />}>
        <RvCompare
          items={comparePick}
          onBack={() => setCompareOpen(false)}
          onOpen={(r) => {
            setCompareOpen(false);
            openFactsUnit(r);
          }}
        />
      </Suspense>
    );
  }

  if (detail) {
    return (
      <Suspense fallback={<PanelFallback />}>
        <RvDetail
          result={detail}
          onBack={() => setDetail(null)}
          onToggleSave={() => toggleSave(detail)}
          saved={isSavedUnit(saved, detail)}
          comparing={comparePick.some(
            (c) => compareSelectionKey(c) === compareSelectionKey(detail),
          )}
          compareCount={comparePick.length}
          compareFull={comparePick.length >= 3}
          onToggleCompare={() => toggleCompare(detail)}
          onOpenCompare={() => {
            if (comparePick.length >= 2) setCompareOpen(true);
          }}
          onAskGrok={() =>
            onOpenGrok?.(
              `Tell me about the ${detail.year} ${detail.make} ${detail.model}${detail.floorplan ? ` floorplan ${detail.floorplan}` : ""} — factory specs, used market, reliability, recalls, and service issues.`,
            )
          }
        />
      </Suspense>
    );
  }

  return (
    <div
      className="rvfax-screen adaptive-glass relative flex h-full min-h-0 flex-col overflow-hidden text-white"
      style={adaptiveGlass.style}
      data-glass-l={adaptiveGlass.luminance.toFixed(3)}
      data-readable-cards=""
    >
      <SuiteBackdrop src={PRESTIGE_BACKDROP} />

      <div
        ref={scrollRef}
        data-app-scroll
        className="rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{
          paddingBottom: kb.open
            ? `max(7rem, ${kb.inset + 112}px)`
            : undefined,
        }}
      >
        <ScrollSuiteHeader tab="rvfax" />
        <ActiveCoachChip />
        <PullResetHint
          show={pullHint}
          label="Release to reset search · pull down"
        />

        <div className="mx-auto w-full max-w-lg space-y-3.5 px-3 pb-28 pt-0 sm:px-4">
          {/* Cascading dropdown search */}
          <section className="glass-prestige space-y-3 rounded-[var(--radius-xl)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[16px] font-extrabold tracking-tight text-white">
                  Catalog search
                </p>
                <p className="mt-1 text-[12px] leading-snug text-white/65">
                  {year
                    ? [
                        year,
                        rvType ? rvClassLabel(rvType) : null,
                        make,
                        model,
                        floorplan || (model ? "Any floorplan" : null),
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Year, type, make, model, floorplan"}
                </p>
                {catalogReady ? (
                  <p className="mt-1 text-[11px] text-white/45">
                    {catalogModelTotal.toLocaleString()} models
                    {year ? ` · ${year}` : ""}
                    {rvType ? ` · ${rvClassLabel(rvType)}` : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/45">Loading…</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3 py-1.5 text-left transition active:scale-[0.98]",
                  filtersOpen || era !== "all"
                    ? "border-sapphire/50 bg-sapphire/20"
                    : "border-white/20 bg-black/30",
                )}
                aria-expanded={filtersOpen}
                aria-controls="rvfax-optional-filters"
              >
                <Filter
                  className={cn(
                    "size-3.5 shrink-0",
                    filtersOpen || era !== "all"
                      ? "text-blue"
                      : "text-white/80",
                  )}
                />
                <span className="text-[10px] font-bold tracking-wide text-white">
                  Year range
                </span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 text-white/80 transition-transform",
                    filtersOpen && "rotate-180",
                  )}
                />
              </button>
            </div>

            {filtersOpen ? (
              <div
                id="rvfax-optional-filters"
                className="space-y-2.5 rounded-[var(--radius-md)] border border-white/10 bg-black/25 p-2.5"
              >
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <p className="rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]">
                    YEAR RANGE
                  </p>
                  <div className="flex items-center gap-1">
                    {era !== "all" ? (
                      <button
                        type="button"
                        onClick={() => setEra("all")}
                        className="rounded-full px-2 py-1 text-[10px] font-bold text-white/80 underline-offset-2 hover:text-white hover:underline"
                      >
                        Clear
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white"
                      aria-label="Close filters"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
                <FieldButton
                  label="Year range"
                  value={`${eraLabel} · ${eraSub}`}
                  placeholder="All years"
                  onClick={() => setSheet("era")}
                  sapphire
                />
              </div>
            ) : null}

            <div className="space-y-2.5 border-t border-white/10 pt-3">
              <p className="rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]">
                YEAR · TYPE · MAKE · MODEL · FLOORPLAN
              </p>
              <FieldButton
                label="Year"
                value={year}
                placeholder="Required"
                required
                onClick={() => setSheet("year")}
                sapphire
              />
              <FieldButton
                label="RV Type"
                value={rvType ? rvClassLabel(rvType) : ""}
                placeholder={year ? "All types" : "Pick a year first"}
                disabled={!year}
                onClick={() => year && setSheet("rvType")}
                sapphire
              />
              <FieldButton
                label="Make"
                value={make}
                placeholder={
                  cascade.locks.make || (year ? "Required" : "Pick a year first")
                }
                required
                disabled={!year || Boolean(cascade.locks.make)}
                custom={cascade.custom.make}
                onClick={() => year && !cascade.locks.make && setSheet("make")}
                sapphire
              />
              <FieldButton
                label="Model"
                value={model}
                placeholder={cascade.locks.model || "Required"}
                required
                disabled={!make || Boolean(cascade.locks.model)}
                custom={cascade.custom.model}
                onClick={() => make && !cascade.locks.model && setSheet("model")}
                sapphire
              />
              <FieldButton
                label="Floorplan"
                value={
                  floorplan || (model && !cascade.locks.floorplan ? "Any floorplan" : "")
                }
                placeholder={cascade.locks.floorplan || "Optional"}
                disabled={!model || Boolean(cascade.locks.floorplan)}
                custom={cascade.custom.floorplan}
                onClick={() =>
                  model && !cascade.locks.floorplan && setSheet("floorplan")
                }
                sapphire
              />
            </div>

            {searching ? (
              <p className="flex items-center justify-center gap-2 text-[12px] font-semibold text-sky-200">
                <Loader2 className="size-3.5 animate-spin" />
                Opening report…
              </p>
            ) : cascade.canSearch ? (
              <button
                type="button"
                onClick={runSearch}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-gold-border/50 bg-gold-dim/25 py-2.5 text-[13px] font-bold text-gold-bright active:scale-[0.99]"
              >
                <Search className="size-3.5" />
                Open report
              </button>
            ) : (
              <p className="text-center text-[11px] leading-snug text-white/55">
                Choose year, make, and model.
              </p>
            )}
          </section>

          {/* Did you mean */}
          {suggestions.length > 0 ? (
            <section className="glass-prestige space-y-2 rounded-[var(--radius-xl)] border border-sky-400/30 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-sky-300">
                <Sparkles className="size-3.5" />
                DID YOU MEAN?
              </p>
              <p className="text-[12px] text-white/80">
                No exact match. Try a suggestion.
              </p>
              <ul className="space-y-1.5">
                {suggestions.map((hit) => (
                  <li key={`${hit.make}-${hit.model || ""}`}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(hit)}
                      className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-left transition active:scale-[0.99]"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-white">
                          {hit.label}
                        </p>
                        {hit.reason ? (
                          <p className="text-[11px] text-white">
                            {hit.reason}
                          </p>
                        ) : null}
                      </div>
                      <ChevronDown className="size-4 -rotate-90 shrink-0 text-white" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Results (multi-hit or after back from report) */}
          {hasSearched && !searching ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-0.5">
                <p className="text-[11px] font-bold tracking-[0.12em] text-white">
                  {results.length} RESULT{results.length === 1 ? "" : "S"}
                </p>
                {comparePick.length >= 2 ? (
                  <button
                    type="button"
                    onClick={() => setCompareOpen(true)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-sky-400/45 bg-sky-500/20 px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    <GitCompare className="size-3.5" />
                    Compare {comparePick.length}
                  </button>
                ) : null}
              </div>
              {results.length === 0 ? (
                <div className="glass-prestige rounded-[var(--radius-xl)] p-5 text-center">
                  <AlertTriangle className="mx-auto size-6 text-amber" />
                  <p className="mt-2 text-[14px] font-bold text-white">
                    No match
                  </p>
                  <p className="mt-1 text-[12px] text-white/70">
                    Try a suggestion or Ask Grok.
                  </p>
                  {onOpenGrok ? (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenGrok(
                          `Research the ${year} ${make} ${model}${floorplan ? ` ${floorplan}` : ""} — factory specs, used market, reliability, and recalls.`,
                        )
                      }
                      className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ruby-border bg-ruby-soft px-4 py-2 text-[12px] font-bold text-ruby"
                    >
                      <Sparkles className="size-3.5" />
                      Ask RvGrok
                    </button>
                  ) : null}
                </div>
              ) : (
                results.map((r) => {
                  const key = compareSelectionKey(r);
                  const comparing = comparePick.some(
                    (c) => compareSelectionKey(c) === key,
                  );
                  return (
                    <ResultCard
                      key={key}
                      result={r}
                      saved={isSavedUnit(saved, r)}
                      comparing={comparing}
                      compareFull={comparePick.length >= 3}
                      onOpen={() => openFactsUnit(r)}
                      onToggleSave={() => toggleSave(r)}
                      onToggleCompare={() => toggleCompare(r)}
                      onGrok={() =>
                        onOpenGrok?.(
                          `Tell me about the ${r.year} ${r.make} ${r.model}${r.floorplan ? ` floorplan ${r.floorplan}` : ""} — factory specs, used market, reliability, recalls, and service issues.`,
                        )
                      }
                    />
                  );
                })
              )}
            </section>
          ) : null}

          {/* Saved */}
          {saved.length > 0 ? (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white">
                  <Bookmark className="size-3.5" />
                  SAVED UNITS
                </p>
                <button
                  type="button"
                  onClick={() => persistSaved([])}
                  className="inline-flex min-h-[36px] items-center gap-1 text-[11px] font-semibold text-white"
                >
                  <Trash2 className="size-3" />
                  Clear
                </button>
              </div>
              {saved.map((r) => (
                <div
                  key={`saved-${compareSelectionKey(r)}`}
                  className="glass-prestige flex min-h-[52px] w-full items-center gap-1 rounded-xl pr-1"
                >
                  <button
                    type="button"
                    onClick={() => openFactsUnit(r)}
                    className="flex min-h-[52px] min-w-0 flex-1 items-center justify-between gap-2 px-3.5 py-3 text-left active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-white">
                        {r.year} {r.make} {r.model}
                      </p>
                      <p className="text-[11px] text-white">
                        {r.floorplan || r.data.type}
                      </p>
                    </div>
                    <ChevronDown className="size-4 -rotate-90 shrink-0 text-white" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${r.year} ${r.make} ${r.model} from saved`}
                    onClick={() => toggleSave(r)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </section>
          ) : null}

          {/* VIN last */}
          <button
            type="button"
            onClick={() => setVinOpen(true)}
            className="glass-prestige-gold flex w-full min-h-[52px] items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3 text-left transition hover:border-gold/70 active:scale-[0.99]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-blue text-white shadow-[0_0_18px_rgba(77,166,255,0.35)]">
              <ScanLine className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-white">VIN Decoder</p>
              <p className="text-[11px] text-white">
                Scan or type a VIN · NHTSA decode
              </p>
            </div>
            <ChevronDown className="size-4 -rotate-90 text-white" />
          </button>

          <SuiteDisclaimer className="pb-2" />
        </div>
      </div>

      <SelectSheet
        open={sheet === "year"}
        title="Select year"
        subtitle={eraLabel}
        items={yearsForEra}
        selected={year}
        onSelect={(v) => onCascadeSelect("year", v)}
        onClose={() => setSheet(null)}
        allowCustom
        customLabel="Use this year"
        customPlaceholder="Type year…"
      />
      <SelectSheet
        open={sheet === "rvType"}
        title="RV Type"
        subtitle={year ? year : undefined}
        items={typeItems}
        selected={rvType}
        onSelect={(v) => onCascadeSelect("rvType", v)}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        open={sheet === "make"}
        title={year ? `Manufacturers · ${year}` : "Manufacturers"}
        subtitle="Or type any make"
        items={makeItems}
        selected={make}
        onSelect={(v) => onCascadeSelect("make", v)}
        onClose={() => setSheet(null)}
        emptyHint="No catalog brands for this filter"
        allowCustom
        customLabel="Use this manufacturer"
        customPlaceholder="Type manufacturer name…"
      />
      <SelectSheet
        open={sheet === "model"}
        title={make ? `Models · ${make}` : "Models"}
        subtitle="Or type any model"
        items={modelItems}
        selected={model}
        onSelect={(v) => onCascadeSelect("model", v)}
        onClose={() => setSheet(null)}
        emptyHint="No catalog models — type yours"
        allowCustom
        customLabel="Use this model"
        customPlaceholder="Type model name…"
      />
      <SelectSheet
        open={sheet === "floorplan"}
        title={
          model
            ? year
              ? `Floorplans · ${year} ${model}`
              : `Floorplans · ${model} · all years`
            : "Floorplans"
        }
        subtitle={year ? "Optional · or Any" : "Optional"}
        items={floorplanItems}
        selected={floorplan}
        onSelect={(v) => onCascadeSelect("floorplan", v)}
        onClose={() => setSheet(null)}
        emptyHint="Type a floorplan code or pick Any"
        allowCustom
        customLabel="Use this floorplan"
        customPlaceholder="Type floorplan code…"
      />
      <SelectSheet
        open={sheet === "era"}
        title="Year range"
        subtitle="Optional · filters the year list"
        items={eraItems}
        selected={era}
        onSelect={onEraSelect}
        onClose={() => setSheet(null)}
      />

      {vinOpen ? (
        <Suspense fallback={null}>
          <VinDecoder open={vinOpen} onClose={() => setVinOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}

function FieldButton({
  label,
  value,
  placeholder,
  onClick,
  disabled,
  required,
  custom,
  sapphire,
  hint,
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
  disabled?: boolean;
  required?: boolean;
  custom?: boolean;
  sapphire?: boolean;
  hint?: string;
}) {
  return (
    <div className="w-full">
      <p
        className={cn(
          "mb-1 text-[10px] font-bold tracking-wide",
          sapphire ? "rvfax-sapphire-label" : "text-white",
        )}
      >
        {label}
        {required ? " *" : ""}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        data-catalog-field={label}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3.5 py-3 text-left text-[14px] font-semibold text-white touch-manipulation active:scale-[0.99] disabled:opacity-100",
          value && !custom && "border-gold-border/60 bg-gold-dim/25",
          value && custom && "border-blue/50 bg-blue/10",
          !value && "border-white/35 bg-white/[0.04]",
          disabled && "border-white/25 bg-white/[0.03]",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-white">
          {value || placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-white" />
      </button>
      {custom && value ? (
        <span className="mt-1 inline-block rounded-full border border-blue/40 bg-blue/20 px-1.5 py-0.5 text-[9px] font-bold text-blue">
          Custom
        </span>
      ) : hint ? (
        <p className="mt-1 text-[10px] text-white/60">{hint}</p>
      ) : null}
    </div>
  );
}

function ResultCard({
  result,
  saved,
  comparing = false,
  compareFull = false,
  onOpen,
  onToggleSave,
  onToggleCompare,
  onGrok,
}: {
  result: RVResult;
  saved: boolean;
  comparing?: boolean;
  compareFull?: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
  onToggleCompare?: () => void;
  onGrok: () => void;
}) {
  const rating = ratingFor(result.make, result.model, result.year);
  const [lo, hi] = result.data.lengthRange;
  const isDiesel = /diesel/i.test(result.data.fuelType);
  return (
    <article className="glass-prestige overflow-hidden rounded-[var(--radius-2xl)]">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={resolveCardImage(result.data)}
            alt={`${result.data.type} — ${result.make} ${result.model}`}
            className="size-full object-cover object-[center_40%]"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
              {result.data.type}
            </span>
            {result.custom ? (
              <span className="rounded-full border border-white/40 bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white">
                Live research
              </span>
            ) : null}
          </div>
        </div>
      </button>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-blue">{result.year}</p>
            <h3 className="text-[20px] font-bold leading-tight text-white">
              {result.make} {result.model}
            </h3>
            {result.floorplan ? (
              <p className="text-[12px] text-white">
                Floorplan: {result.floorplan}
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-amber">★ {rating.toFixed(1)}</span>
              <span className="font-bold text-sky-200">
                Live specs & market on open
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleSave}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border touch-manipulation",
              saved
                ? "border-ruby bg-ruby text-white"
                : "border-white/20 bg-white/5 text-white",
            )}
          >
            <Heart className={cn("size-4", saved && "fill-current")} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip
            icon={<Ruler className="size-3" />}
            label={lo === hi ? `${lo} ft` : `${lo}–${hi} ft`}
          />
          <Chip
            icon={<BedDouble className="size-3" />}
            label={`Sleeps ${result.data.sleeps}`}
          />
          <Chip
            icon={<Fuel className="size-3" />}
            label={isDiesel ? "Diesel" : result.data.fuelType}
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            type="button"
            onClick={onOpen}
            className="min-h-[44px] rounded-full bg-blue px-4 py-2.5 text-[12px] font-bold text-white"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onToggleCompare}
            disabled={!comparing && compareFull}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1 rounded-full border px-4 py-2.5 text-[12px] font-bold disabled:opacity-40",
              comparing
                ? "border-sky-400/50 bg-sky-500/25 text-white"
                : "border-white/20 bg-black/40 text-white",
            )}
          >
            {comparing ? (
              <>
                <Check className="size-3.5" /> Comparing
              </>
            ) : (
              <>
                <GitCompare className="size-3.5" /> Compare
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onGrok}
            className="min-h-[44px] rounded-full border border-ruby-border bg-ruby-soft px-4 py-2.5 text-[12px] font-bold text-ruby"
          >
            RvGrok
          </button>
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white">
      {icon}
      {label}
    </span>
  );
}
