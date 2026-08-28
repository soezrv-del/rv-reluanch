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
  ChevronLeft,
  Filter,
  Fuel,
  GitCompare,
  Heart,
  Loader2,
  Pencil,
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
  modelPickerMeta,
  modelYearWindow,
  ratingFor,
  RV_CLASS_TABS,
  RV_DATA,
  rvClassLabel,
  searchCatalog,
  countModelsForClass,
  YEARS,
  compareSelectionKey,
} from "@/lib/rv/catalog";
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
import { SelectSheet } from "./SelectSheet";
import { WizardWheel } from "./WizardWheel";
import { SearchManual } from "./SearchManual";

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

const SAVED_KEY = "rvfax_saved_v1";
const PRESTIGE_BACKDROP = SHARED_PRESTIGE_BACKDROP;

type YearEra = "all" | "classic" | "recent" | "modern" | "newer17";
type WizardStep = "year" | "type" | "make" | "model" | "floorplan";

const WIZARD_STEP_ORDER: WizardStep[] = [
  "year",
  "type",
  "make",
  "model",
  "floorplan",
];
const WIZARD_STEP_LABELS = ["Year", "Type", "Make", "Model", "Floorplan"];

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

type Sheet = "era" | "rvType" | null;

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
  const [wizardStep, setWizardStep] = useState<WizardStep>("year");
  const [searchMode, setSearchMode] = useState<"wizard" | "manual">("wizard");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RVResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [saved, setSaved] = useState<RVResult[]>([]);
  const [detail, setDetail] = useState<RVResult | null>(null);
  const [vinOpen, setVinOpen] = useState(false);
  const [comparePick, setComparePick] = useState<RVResult[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestHit[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const adaptiveGlass = useAdaptiveGlass(PRESTIGE_BACKDROP, scrollRef);
  const kb = useKeyboardInset();

  const resetFax = useCallback(() => {
    setYear("");
    setMake("");
    setModel("");
    setFloorplan("");
    setRvType("");
    setEra("all");
    setFiltersOpen(false);
    setWizardStep("year");
    setSearchMode("wizard");
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
  // Pull-to-reset was wiping the wizard when users dragged the picker at
  // scrollTop≈0. Disable entirely on the search surface — use the Reset control.
  const pullHint = usePullToReset(scrollRef, resetFax, {
    enabled: false,
  });


  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw) as RVResult[]);
    } catch {
      /* */
    }
  }, []);

  const persistSaved = (next: RVResult[]) => {
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* */
    }
  };

  const cascade = useMemo(
    () =>
      buildCascadeOptions({
        year,
        make,
        model,
        floorplan,
        rvType,
      }),
    [year, make, model, floorplan, rvType],
  );

  const applySel = useCallback((next: SearchSel) => {
    setYear(next.year);
    setMake(next.make);
    setModel(next.model);
    setFloorplan(next.floorplan);
    if (next.rvType !== undefined) setRvType(next.rvType);
  }, []);

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
          setWizardStep("year");
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
        meta: year
          ? `${year} · brand in catalog`
          : "All years · full brand list",
      })),
    [cascade.makes, year],
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
    const fps = cascade.floorplans.map((fp) => ({
      value: fp,
      label: fp,
      meta: year && make && model
        ? `${year} ${make} ${model}`
        : "Available for this coach",
    }));
    // Always allow “any / all” so user can finish without a specific layout
    return [
      {
        value: "",
        label: "Any floorplan",
        meta: fps.length
          ? `Skip · ${fps.length} layout${fps.length === 1 ? "" : "s"} for this year`
          : "No year-specific layouts · open report",
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
        meta: year
          ? `${year} · every class in the catalog`
          : "Do not filter by class",
      },
      ...tabs.map((t) => ({
        value: t.id,
        label: t.label,
        meta: `${t.n} model${t.n === 1 ? "" : "s"} in ${year || "catalog"}`,
      })),
    ];
  }, [year]);

  const rvTypeItems = typeItems;

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
      window.setTimeout(() => {
        const found = searchCatalog({
          year: sel.year,
          make: sel.make,
          model: sel.model,
          floorplan: sel.floorplan,
          rvType: sel.rvType || undefined,
        }).map((r) => ({
          ...r,
          saved: saved.some(
            (s) =>
              s.make === r.make && s.model === r.model && s.year === r.year,
          ),
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
        if (found.length === 1 && !found[0]!.custom) {
          setDetail(found[0]!);
        }
      }, 200);
    },
    [saved],
  );

  const runSearch = useCallback(() => {
    runSearchNow({ year, make, model, floorplan, rvType });
  }, [year, make, model, floorplan, rvType, runSearchNow]);

  const handleManualSearch = useCallback(
    (sel: { year: string; make: string; model: string; floorplan: string }) => {
      let y = sel.year.trim();
      const mk = sel.make.trim();
      const mdl = sel.model.trim();
      if (!mk && !mdl) return;
      if (!y && mk && mdl) {
        const spec = RV_DATA[mk]?.[mdl];
        if (spec) y = String(modelYearWindow(spec).end);
      }
      if (!y) y = YEARS[0] ?? "2026";
      const next = {
        year: y,
        make: mk,
        model: mdl,
        floorplan: sel.floorplan.trim(),
        rvType,
      };
      applySel(next);
      runSearchNow(next);
    },
    [rvType, applySel, runSearchNow],
  );

  useEffect(() => {
    if (!hasSearched || !cascade.canSearch || searching) return;
    const found = searchCatalog({
      year: cascade.year,
      make: cascade.make,
      model: cascade.model,
      floorplan: cascade.floorplan,
      rvType: cascade.rvType || undefined,
    }).map((r) => ({
      ...r,
      saved: saved.some(
        (s) => s.make === r.make && s.model === r.model && s.year === r.year,
      ),
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
  ]);

  const onWizardPick = useCallback(
    (field: CascadeField, value: string) => {
      setSuggestions([]);
      const next = applyCascadeChange(
        { year, make, model, floorplan, rvType },
        field,
        value,
      );
      applySel(next);
      setHasSearched(false);
      setResults([]);

      if (field === "year") {
        setWizardStep("type");
        return;
      }
      if (field === "rvType") {
        setWizardStep("make");
        return;
      }
      if (field === "make") {
        setWizardStep("model");
        return;
      }
      if (field === "model") {
        // Floorplan is always the last step (includes “Any floorplan”)
        setWizardStep("floorplan");
        return;
      }
      if (field === "floorplan") {
        // Auto-run search + open report
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

  const goToWizardStep = useCallback(
    (step: WizardStep) => {
      const idx = WIZARD_STEP_ORDER.indexOf(step);
      if (idx <= 0) {
        applySel({ year: "", make: "", model: "", floorplan: "", rvType: "" });
        setWizardStep("year");
      } else if (step === "type") {
        applySel({ year, make: "", model: "", floorplan: "", rvType: "" });
        setWizardStep("type");
      } else if (step === "make") {
        applySel({ year, make: "", model: "", floorplan: "", rvType });
        setWizardStep("make");
      } else if (step === "model") {
        applySel({ year, make, model: "", floorplan: "", rvType });
        setWizardStep("model");
      } else {
        setWizardStep("floorplan");
      }
      setHasSearched(false);
      setResults([]);
      setSuggestions([]);
    },
    [year, make, rvType, applySel],
  );

  const wizardBack = useCallback(() => {
    const idx = WIZARD_STEP_ORDER.indexOf(wizardStep);
    if (idx <= 0) return;
    goToWizardStep(WIZARD_STEP_ORDER[idx - 1]!);
  }, [wizardStep, goToWizardStep]);

  const applySuggestion = useCallback(
    (hit: SuggestHit) => {
      const base = { year, make, model, floorplan, rvType };
      let next = applyCascadeChange(base, "make", hit.make);
      if (hit.model) next = applyCascadeChange(next, "model", hit.model);
      applySel(next);
      setSuggestions([]);
      setHasSearched(false);
      setResults([]);
      setWizardStep(hit.model ? "floorplan" : "model");
    },
    [year, make, model, floorplan, rvType, applySel],
  );

  const toggleSave = (r: RVResult) => {
    const exists = saved.some(
      (s) =>
        s.year === r.year &&
        s.make === r.make &&
        s.model === r.model &&
        s.floorplan === r.floorplan,
    );
    if (exists) {
      persistSaved(
        saved.filter(
          (s) =>
            !(
              s.year === r.year &&
              s.make === r.make &&
              s.model === r.model &&
              s.floorplan === r.floorplan
            ),
        ),
      );
    } else {
      persistSaved([{ ...r, saved: true }, ...saved].slice(0, 40));
    }
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
  const classLabel = rvType ? rvClassLabel(rvType) : "All classes";
  const stepIndex = WIZARD_STEP_ORDER.indexOf(wizardStep);

  const pathChips = useMemo(() => {
    const chips: { step: WizardStep; label: string; value: string }[] = [];
    if (year)
      chips.push({ step: "year", label: "Year", value: year });
    if (wizardStep !== "year" && wizardStep !== "type")
      chips.push({
        step: "type",
        label: "Type",
        value: rvType ? rvClassLabel(rvType) : "All",
      });
    if (make)
      chips.push({ step: "make", label: "Make", value: make });
    if (model)
      chips.push({ step: "model", label: "Model", value: model });
    if (floorplan)
      chips.push({ step: "floorplan", label: "Floorplan", value: floorplan });
    return chips;
  }, [year, rvType, make, model, floorplan, wizardStep]);

  if (compareOpen && comparePick.length >= 2) {
    return (
      <Suspense fallback={<PanelFallback />}>
        <RvCompare
          items={comparePick}
          onBack={() => setCompareOpen(false)}
          onOpen={(r) => {
            setCompareOpen(false);
            setDetail(r);
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
          saved={saved.some(
            (s) =>
              s.year === detail.year &&
              s.make === detail.make &&
              s.model === detail.model &&
              s.floorplan === detail.floorplan,
          )}
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
        <PullResetHint
          show={pullHint}
          label="Release to reset search · pull down"
        />

        <div className="mx-auto w-full max-w-lg space-y-2.5 px-3 pb-28 pt-0 sm:px-4">
          {/* Step-by-step search wizard — first so the year wheel is on-screen */}
          <section className="glass-prestige space-y-2 rounded-[var(--radius-xl)] p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[16px] font-extrabold tracking-tight text-white">
                Search Wizard
              </p>
              <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-left transition active:scale-[0.98]",
                  filtersOpen || rvType || era !== "all"
                    ? "border-sapphire/50 bg-sapphire/20"
                    : "border-white/20 bg-black/30",
                )}
                aria-expanded={filtersOpen}
                aria-controls="rvfax-optional-filters"
              >
                <Filter
                  className={cn(
                    "size-3.5 shrink-0",
                    filtersOpen || rvType || era !== "all"
                      ? "text-blue"
                      : "text-white/80",
                  )}
                />
                <span className="hidden min-[360px]:inline text-[10px] font-bold tracking-wide text-white">
                  Filters
                </span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 text-white/80 transition-transform",
                    filtersOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-0.5"
                role="tablist"
                aria-label="Search mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchMode === "wizard"}
                  onClick={() => setSearchMode("wizard")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold",
                    searchMode === "wizard"
                      ? "border border-blue/45 bg-blue/20 text-blue"
                      : "text-white/55",
                  )}
                >
                  <Sparkles className="size-3" />
                  Wizard
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchMode === "manual"}
                  onClick={() => setSearchMode("manual")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold",
                    searchMode === "manual"
                      ? "border border-[#FF6B35]/50 bg-[#FF6B35]/20 text-[#FF6B35]"
                      : "text-white/55",
                  )}
                >
                  <Pencil className="size-3" />
                  Manual
                </button>
              </div>
              </div>
            </div>

            {filtersOpen ? (
              <div
                id="rvfax-optional-filters"
                className="space-y-2.5 rounded-[var(--radius-md)] border border-white/10 bg-black/25 p-2.5"
              >
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <p className="rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]">
                    OPTIONAL FILTERS
                  </p>
                  <div className="flex items-center gap-1">
                    {rvType || era !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRvType("");
                          setEra("all");
                        }}
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
                  label="RV Type"
                  value={rvType ? rvClassLabel(rvType) : "All classes"}
                  placeholder="All classes (optional)"
                  onClick={() => setSheet("rvType")}
                  sapphire
                />
                <FieldButton
                  label="Year range"
                  value={`${eraLabel} · ${eraSub}`}
                  placeholder="All years"
                  onClick={() => setSheet("era")}
                  sapphire
                />
              </div>
            ) : null}

            {searchMode === "manual" ? (
              <SearchManual
                searching={searching}
                onSearch={handleManualSearch}
              />
            ) : (
              <>
            {/* Path chips — tap earlier step to go back (clears downstream) */}
            {pathChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3">
                {wizardStep !== "year" ? (
                  <button
                    type="button"
                    onClick={wizardBack}
                    className="inline-flex min-h-[36px] items-center gap-0.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white active:scale-[0.98]"
                    aria-label="Back one step"
                  >
                    <ChevronLeft className="size-3.5" />
                    Back
                  </button>
                ) : null}
                {pathChips.map((c) => (
                  <button
                    key={c.step}
                    type="button"
                    onClick={() => goToWizardStep(c.step)}
                    className={cn(
                      "inline-flex max-w-[46%] items-center gap-1 rounded-full border px-2.5 py-1.5 text-left active:scale-[0.98]",
                      wizardStep === c.step
                        ? "border-gold-border bg-gold-dim/30"
                        : "border-white/15 bg-white/5",
                    )}
                  >
                    <span className="text-[9px] font-bold tracking-wide text-white/55">
                      {c.label}
                    </span>
                    <span className="truncate text-[11px] font-bold text-white">
                      {c.value}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Single active wheel — isolated from parent scroll gestures */}
            <div
              className="border-t border-white/10 pt-2"
              data-no-pull-reset
              data-wizard-wheel
              onTouchMove={(e) => {
                // Extra belt: if touch is on the drum track, never let it bubble
                const t = e.target as Element | null;
                if (t?.closest?.("[data-wheel-track]")) {
                  e.stopPropagation();
                }
              }}
            >

              {wizardStep === "year" ? (
                <WizardWheel
                  key={`year-${era}`}
                  title="Select year"
                  subtitle={`${yearsForEra.length} years · ${eraLabel}`}
                  items={yearsForEra}
                  selected={year}
                  onSelect={(v) => onWizardPick("year", v)}
                  hideModeTabs
                  mode="wheel"
                  allowCustom
                  customLabel="Use this year"
                  customPlaceholder="Type year…"
                  stepIndex={stepIndex}
                  stepCount={5}
                  stepLabels={WIZARD_STEP_LABELS}
                />
              ) : null}

              {wizardStep === "type" ? (
                <WizardWheel
                  key={`type-${year || "all"}`}
                  title="Select RV type"
                  subtitle={
                    year
                      ? `${typeItems.length - 1} classes in ${year} · pick one to narrow brands`
                      : "Class A, B, C, Super C, fifth wheel, trailer, toy hauler"
                  }
                  items={typeItems}
                  selected={rvType}
                  onSelect={(v) => onWizardPick("rvType", v)}
                  hideModeTabs
                  mode="wheel"
                  emptyHint="No classes for this year — pick All types"
                  stepIndex={stepIndex}
                  stepCount={5}
                  stepLabels={WIZARD_STEP_LABELS}
                />
              ) : null}

              {wizardStep === "make" ? (
                <WizardWheel
                  key={`make-${year}-${rvType || "all"}`}
                  title="Select make"
                  subtitle={
                    year && rvType
                      ? `${cascade.counts.makes} brand${cascade.counts.makes === 1 ? "" : "s"} · ${year} ${rvClassLabel(rvType)}`
                      : year
                        ? `${cascade.counts.makes} brand${cascade.counts.makes === 1 ? "" : "s"} available in ${year}`
                        : `${cascade.counts.makes} brands · all years`
                  }
                  items={makeItems}
                  selected={make}
                  onSelect={(v) => onWizardPick("make", v)}
                  hideModeTabs
                  mode="wheel"
                  emptyHint={
                    year
                      ? `No brands in catalog for ${year} · try filters or type a make`
                      : "No brands · type a manufacturer"
                  }
                  allowCustom
                  customLabel="Use this manufacturer"
                  customPlaceholder="Type manufacturer…"
                  stepIndex={stepIndex}
                  stepCount={5}
                  stepLabels={WIZARD_STEP_LABELS}
                />
              ) : null}

              {wizardStep === "model" ? (
                <WizardWheel
                  key={`model-${year}-${make}-${rvType || "all"}`}
                  title="Select model"
                  subtitle={
                    year && make
                      ? `${cascade.counts.models} model${cascade.counts.models === 1 ? "" : "s"} · ${year} ${make}`
                      : make
                        ? `${cascade.counts.models} models · ${make} (all years)`
                        : `${cascade.counts.models} models`
                  }
                  items={modelItems}
                  selected={model}
                  onSelect={(v) => onWizardPick("model", v)}
                  hideModeTabs
                  mode="wheel"
                  emptyHint={
                    year && make
                      ? `No ${make} models for ${year} — type yours`
                      : "No catalog models — type yours"
                  }
                  allowCustom
                  customLabel="Use this model"
                  customPlaceholder="Type model name…"
                  stepIndex={stepIndex}
                  stepCount={5}
                  stepLabels={WIZARD_STEP_LABELS}
                />
              ) : null}

              {wizardStep === "floorplan" ? (
                <WizardWheel
                  key={`fp-${year}-${make}-${model}`}
                  title="Select floorplan"
                  subtitle={
                    year && make && model
                      ? cascade.counts.floorplans
                        ? `${cascade.counts.floorplans} layout${cascade.counts.floorplans === 1 ? "" : "s"} · ${year} ${make} ${model}`
                        : `No ${year} layouts listed · pick Any to open report`
                      : "Pick a layout or Any"
                  }
                  items={floorplanItems}
                  selected={floorplan}
                  onSelect={(v) => onWizardPick("floorplan", v)}
                  hideModeTabs
                  mode="wheel"
                  emptyHint="Type a floorplan code or pick Any"
                  allowCustom
                  customLabel="Use this floorplan"
                  customPlaceholder="Type floorplan code…"
                  stepIndex={stepIndex}
                  stepCount={5}
                  stepLabels={WIZARD_STEP_LABELS}
                />
              ) : null}
            </div>

            {searching ? (
              <p className="flex items-center justify-center gap-2 text-[12px] font-semibold text-sky-200">
                <Loader2 className="size-3.5 animate-spin" />
                Opening report…
              </p>
            ) : cascade.canSearch && wizardStep === "floorplan" ? (
              <button
                type="button"
                onClick={runSearch}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-gold-border/50 bg-gold-dim/25 py-2.5 text-[12px] font-bold text-gold-bright active:scale-[0.99]"
              >
                <Search className="size-3.5" />
                Open report without floorplan
              </button>
            ) : (
              <p className="text-center text-[11px] leading-snug text-white/65">
                One step at a time — year, make, model, then floorplan. Report
                opens automatically.
              </p>
            )}
              </>
            )}
          </section>

          {/* Did you mean */}
          {suggestions.length > 0 ? (
            <section className="glass-prestige space-y-2 rounded-[var(--radius-xl)] border border-sky-400/30 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-sky-300">
                <Sparkles className="size-3.5" />
                DID YOU MEAN?
              </p>
              <p className="text-[12px] text-white">
                We couldn’t match that exactly. Tap a suggestion, or open the
                custom result and live Grok will research it.
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
                    No catalog match
                  </p>
                  <p className="mt-1 text-[12px] text-white">
                    Use a suggestion above or Ask Grok for live research.
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
                      saved={saved.some(
                        (s) =>
                          s.year === r.year &&
                          s.make === r.make &&
                          s.model === r.model &&
                          s.floorplan === r.floorplan,
                      )}
                      comparing={comparing}
                      compareFull={comparePick.length >= 3}
                      onOpen={() => setDetail(r)}
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
                <button
                  key={`saved-${compareSelectionKey(r)}`}
                  type="button"
                  onClick={() => setDetail(r)}
                  className="glass-prestige flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left active:scale-[0.99]"
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
              ))}
            </section>
          ) : null}

          {/* VIN last — keeps the year wheel above the fold on first open */}
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

          <p className="pb-2 text-center text-[12px] tracking-[0.14em] text-white">
            SPECS · MARKET · RECALLS
          </p>
        </div>
      </div>

      {/* Optional filters only — cascade uses inline wizard */}
      <SelectSheet
        open={sheet === "rvType"}
        title="RV Type"
        subtitle="Optional filter · narrows catalog"
        items={rvTypeItems}
        selected={rvType}
        onSelect={(v) => {
          setRvType(v);
          setHasSearched(false);
          setResults([]);
          // Keep wizard position; options re-filter for current year
        }}
        onClose={() => setSheet(null)}
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
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
  disabled?: boolean;
  required?: boolean;
  custom?: boolean;
  sapphire?: boolean;
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
          Custom · live Grok
        </span>
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
