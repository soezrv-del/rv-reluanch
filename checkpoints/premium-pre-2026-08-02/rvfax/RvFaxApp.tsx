import {
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
  formatMoney,
  modelPickerMeta,
  ratingFor,
  RV_CLASS_TABS,
  rvClassLabel,
  searchCatalog,
  YEARS,
} from "@/lib/rv/catalog";
import { compareSelectionKey } from "@/lib/rv/compare";
import { didYouMean, type SuggestHit } from "@/lib/rv/suggest";
import { cn } from "@/lib/utils";
import { SelectSheet } from "./SelectSheet";
import { RvDetail } from "./RvDetail";
import { RvCompare } from "./RvCompare";
import { VinDecoder } from "./VinDecoder";
import { SHARED_PRESTIGE_BACKDROP, RV_CARD_MEDIA } from "@/assets/backdrops";
import { ScrollSuiteHeader } from "@/components/shell/ScrollChrome";
import { useAdaptiveGlass } from "@/lib/hooks/useAdaptiveGlass";

const SAVED_KEY = "rvfax_saved_v1";
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

type Sheet = CascadeField | "era" | "rvType" | null;

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
  const [compareOpen, setCompareOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestHit[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const adaptiveGlass = useAdaptiveGlass(PRESTIGE_BACKDROP, scrollRef);


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

  const onCascadeSelect = useCallback((field: CascadeField, value: string) => {
    setSuggestions([]);
    const next = applyCascadeChange(
      { year, make, model, floorplan, rvType },
      field,
      value,
    );
    setYear(next.year);
    setMake(next.make);
    setModel(next.model);
    setFloorplan(next.floorplan);
    if (next.rvType !== undefined) setRvType(next.rvType);
  }, [year, make, model, floorplan, rvType]);

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
          onCascadeSelect("year", "");
        }
      }
    },
    [year, onCascadeSelect],
  );

  const makeItems = useMemo(
    () =>
      cascade.makes.map((m) => ({
        value: m,
        label: m,
        meta: year ? `Available ${year}` : undefined,
      })),
    [cascade.makes, year],
  );

  const modelItems = useMemo(
    () =>
      cascade.models.map((m) => ({
        value: m,
        label: m,
        meta: modelPickerMeta(cascade.make, m, cascade.year),
      })),
    [cascade.models, cascade.make, cascade.year],
  );

  const rvTypeItems = useMemo(
    () =>
      RV_CLASS_TABS.map((t) => ({
        value: t.id,
        label: t.label,
        meta:
          t.id === ""
            ? "All classes"
            : t.id === "class-a"
              ? "Diesel & gas motorhomes"
              : t.id === "class-b"
                ? "Van-based campers"
                : t.id === "class-c"
                  ? "Cab-over motorhomes"
                  : t.id === "super-c"
                    ? "Truck chassis Class C"
                    : t.id === "fifth-wheel"
                      ? "Gooseneck trailers"
                      : t.id === "travel-trailer"
                        ? "Conventional trailers"
                        : t.id === "toy-hauler"
                          ? "Garage / cargo trailers"
                          : undefined,
      })),
    [],
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

  const runSearch = useCallback(() => {
    if (!cascade.canSearch) return;
    setSearching(true);
    setHasSearched(true);
    setSuggestions([]);
    window.setTimeout(() => {
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
      setSearching(false);

      const needSuggest =
        cascade.custom.make ||
        cascade.custom.model ||
        found.length === 0 ||
        found.some((f) => f.custom);
      if (needSuggest) {
        setSuggestions(
          didYouMean({
            year: cascade.year,
            make: cascade.make,
            model: cascade.model,
          }),
        );
      }

      // Open detail for exact catalog single hit — live Grok runs inside detail
      if (found.length === 1 && !found[0]!.custom) setDetail(found[0]!);
    }, 260);
  }, [cascade, saved]);

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

  const applySuggestion = useCallback((hit: SuggestHit) => {
    const base = { year, make, model, floorplan, rvType };
    let next = applyCascadeChange(base, "make", hit.make);
    if (hit.model) next = applyCascadeChange(next, "model", hit.model);
    setYear(next.year);
    setMake(next.make);
    setModel(next.model);
    setFloorplan(next.floorplan);
    setSuggestions([]);
    setHasSearched(false);
    setResults([]);
  }, [year, make, model, floorplan, rvType]);

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

  if (detail) {
    return (
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
        onAskGrok={() =>
          onOpenGrok?.(
            `Tell me about the ${detail.year} ${detail.make} ${detail.model}${detail.floorplan ? ` floorplan ${detail.floorplan}` : ""} — factory specs, used market, reliability, recalls, and service issues.`,
          )
        }
      />
    );
  }

  if (compareOpen && comparePick.length >= 2) {
    return (
      <RvCompare
        items={comparePick}
        onBack={() => setCompareOpen(false)}
        onOpen={(r) => {
          setCompareOpen(false);
          setDetail(r);
        }}
      />
    );
  }

  return (
    <div
      className="rvfax-screen adaptive-glass relative flex h-full min-h-0 flex-col overflow-hidden text-white"
      style={adaptiveGlass.style}
      data-glass-l={adaptiveGlass.luminance.toFixed(3)}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PRESTIGE_BACKDROP})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />

      <div
        ref={scrollRef}
        className="rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <ScrollSuiteHeader tab="rvfax" />

        <div className="mx-auto w-full max-w-lg space-y-3.5 px-3 pb-28 pt-2 sm:px-4">
          {/* VIN */}
          <button
            type="button"
            onClick={() => setVinOpen(true)}
            className="glass-prestige-gold flex w-full min-h-[56px] items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3.5 text-left transition hover:border-gold/70 active:scale-[0.99]"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-blue text-white shadow-[0_0_18px_rgba(77,166,255,0.35)]">
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

          {/* Search card — mobile-first stacked dropdowns */}
          <section className="glass-prestige space-y-3 rounded-[var(--radius-xl)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="rvfax-sapphire-label text-[11px] font-bold tracking-[0.14em]">
                SEARCH IN RV
              </p>

              {/* Compact optional filters — collapsed by default */}
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  "inline-flex max-w-[58%] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left transition active:scale-[0.98]",
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
                <span className="rvfax-sapphire-text min-w-0 truncate text-[10px] font-bold tracking-wide">
                  {filtersOpen
                    ? "Filters"
                    : rvType || era !== "all"
                      ? `${rvType ? classLabel : "All types"}${era !== "all" ? ` · ${eraLabel}` : ""}`
                      : "Filters"}
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

            {/* Required cascade — stacked full width for phone */}
            <div className="space-y-2.5 border-t border-white/10 pt-3">
              <p className="rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]">
                YEAR · MAKE · MODEL · FLOORPLAN
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
                label="Make"
                value={make}
                placeholder={cascade.locks.make || "Required"}
                required
                disabled={Boolean(cascade.locks.make)}
                custom={cascade.custom.make}
                onClick={() => !cascade.locks.make && setSheet("make")}
                sapphire
              />
              <FieldButton
                label="Model"
                value={model}
                placeholder={cascade.locks.model || "Required"}
                required
                disabled={Boolean(cascade.locks.model)}
                custom={cascade.custom.model}
                onClick={() => !cascade.locks.model && setSheet("model")}
                sapphire
              />
              <FieldButton
                label="Floorplan"
                value={floorplan}
                placeholder={cascade.locks.floorplan || "Optional"}
                disabled={Boolean(cascade.locks.floorplan)}
                custom={cascade.custom.floorplan}
                onClick={() => !cascade.locks.floorplan && setSheet("floorplan")}
                sapphire
              />
            </div>

            {cascade.canSearch ? (
              <p className="rvfax-sapphire-text text-[11px] font-semibold leading-snug">
                {cascade.counts.makes} makes · {cascade.counts.models} models ·{" "}
                {cascade.counts.floorplans} floorplans
                {cascade.custom.make || cascade.custom.model
                  ? " · custom entry — live Grok will fill specs"
                  : ""}
              </p>
            ) : (
              <p className="rounded-[var(--radius-md)] border border-white/10 bg-black/25 px-3 py-2.5 text-[11px] leading-snug text-white">
                Select <span className="font-semibold text-white">year</span>,{" "}
                <span className="font-semibold text-white">make</span>, and{" "}
                <span className="font-semibold text-white">model</span>. Live
                Grok fills factory specs on the detail report.
              </p>
            )}

            <button
              type="button"
              disabled={!cascade.canSearch || searching}
              onClick={runSearch}
              className={cn(
                "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition active:scale-[0.99]",
                cascade.canSearch && !searching
                  ? "bg-gradient-to-r from-[#c9a24d] via-[#f0d78c] to-[#c9a24d] text-[#1a1206] shadow-[0_0_28px_rgba(212,175,106,0.35)]"
                  : "bg-white/10 text-white",
              )}
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {searching
                ? "Looking up…"
                : cascade.canSearch
                  ? "Lookup RV Specs"
                  : "Select year, make & model"}
            </button>
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

          {/* Results */}
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
              {saved.length === 0 ? (
                <p className="text-center text-[11px] text-white">
                  Search and tap the heart
                </p>
              ) : null}
            </section>
          ) : null}

          <p className="pb-2 text-center text-[10px] tracking-[0.12em] text-white">
            LIVE GROK · USED-MARKET · NHTSA
          </p>
        </div>
      </div>

      <SelectSheet
        open={sheet === "year"}
        title="Select Year"
        subtitle={`${yearsForEra.length} years · ${YEAR_ERAS.find((e) => e.id === era)?.label}`}
        items={yearsForEra}
        selected={year}
        onSelect={(v) => onCascadeSelect("year", v)}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        open={sheet === "make"}
        title={`Manufacturers · ${year || "—"}`}
        subtitle={`${cascade.counts.makes} brands · or type any make`}
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
        title={`Models · ${make || "—"}`}
        subtitle={`${cascade.counts.models} models · or type any model`}
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
        title={`Floorplans · ${model || "—"}`}
        subtitle={`${cascade.counts.floorplans} layouts · or type any floorplan`}
        items={cascade.floorplans}
        selected={floorplan}
        onSelect={(v) => onCascadeSelect("floorplan", v)}
        onClose={() => setSheet(null)}
        emptyHint="No catalog floorplans — type yours"
        allowCustom
        customLabel="Use this floorplan"
        customPlaceholder="Type floorplan code…"
      />
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

      <VinDecoder open={vinOpen} onClose={() => setVinOpen(false)} />
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
  /** Sapphire-blue field labels (RvFACTS search card) */
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
        <span className="min-w-0 flex-1 truncate text-white">{value || placeholder}</span>
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
            src={result.data.image || RV_CARD_MEDIA}
            alt=""
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
