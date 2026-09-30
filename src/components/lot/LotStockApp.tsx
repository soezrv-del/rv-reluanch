import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Check, ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RAIDHO_R_MARK } from "@/assets/prestige";
import { SuitePage } from "@/components/shell/SuitePage";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  fetchLotSnapshot,
  filterLotBrowse,
  formatLotUpdated,
  lotLengthOrGap,
  lotCardMiles,
  lotListingHref,
  lotLbsOrGap,
  lotPriceOrGap,
  lotTextOrGap,
  lotTypeChips,
  lotUnitKey,
  lotUnitPhoto,
  shortLotTypeLabel,
  LOT_GAP,
  type LotSnapshotView,
  type LotUnit,
} from "@/lib/lot/ownLotPage";
import { lotSearchSnippets } from "@/lib/lot/lotSearch";
import { lotOpenSections } from "@/lib/lot/lotDetail";
import {
  LOT_UNIT_OPEN_EVENT,
  lotArrivalQuery,
  showroomUnitLabel,
  takePendingLotQuery,
} from "@/lib/home/homeCoach";
import { useCenterSelectedTab } from "@/lib/hooks/useCenterSelectedTab";
import { LotArrivals } from "@/components/lot/LotArrivals";
import { ReportShareButton } from "@/components/report/ReportShareButton";
import { buildUnitShareReport } from "@/lib/rv/shareReport";

const PAGE_SIZE = 40;

const SALES_FILTERS = [
  { id: "mi30", label: "Under 30k mi", query: "under 30000 miles" },
  { id: "mi50", label: "Around 50k mi", query: "around 50000 miles" },
  { id: "gen", label: "Generator", query: "generator" },
  { id: "solar", label: "Solar", query: "solar" },
  { id: "kitchen", label: "Outdoor kitchen", query: "outdoor kitchen" },
  { id: "slides", label: "2+ slides", query: "at least 2 slides" },
  { id: "king", label: "King bed", query: "king bed" },
] as const;

export function LotStockApp({
  onAsk,
}: {
  onAsk?: (prompt: string) => void;
}) {
  const nav = useShellNavOptional();
  const [snap, setSnap] = useState<LotSnapshotView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [type, setType] = useState("");
  const [condition, setCondition] = useState<"" | "New" | "Used">("");
  const [sales, setSales] = useState<string[]>([]);
  const chipRailRef = useRef<HTMLDivElement>(null);
  useCenterSelectedTab(chipRailRef, type);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const wantOpen = useRef("");

  const load = () => {
    setError(null);
    void fetchLotSnapshot()
      .then((next) => {
        setSnap(next);
        setLimit(PAGE_SIZE);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Lot snapshot unavailable";
        setError(message);
        setSnap(null);
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const pull = () => {
      const query = takePendingLotQuery();
      if (!query) return;
      wantOpen.current = query;
      setType("");
      setCondition("");
      setQuery(query);
    };
    pull();
    window.addEventListener(LOT_UNIT_OPEN_EVENT, pull);
    return () => window.removeEventListener(LOT_UNIT_OPEN_EVENT, pull);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setAppliedQuery(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const chips = useMemo(() => lotTypeChips(snap?.units ?? []), [snap]);
  const salesQuery = SALES_FILTERS.filter((chip) => sales.includes(chip.id))
    .map((chip) => chip.query)
    .join(" ");
  const browseQuery = [appliedQuery, salesQuery].filter(Boolean).join(" ");
  const filtered = useMemo(
    () => filterLotBrowse(snap?.units ?? [], { query: browseQuery, type, condition }),
    [snap, browseQuery, type, condition],
  );

  useEffect(() => {
    setLimit(PAGE_SIZE);
    if (!wantOpen.current) setOpenKey(null);
    const scroller = sentinelRef.current?.closest("[data-app-scroll]");
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0;
  }, [appliedQuery, type, condition, salesQuery]);

  useEffect(() => {
    const wanted = wantOpen.current;
    if (!wanted || !snap) return;
    const hit = filterLotBrowse(snap.units, { query: wanted })[0];
    setOpenKey(hit ? lotUnitKey(hit, 0) : null);
    wantOpen.current = "";
  }, [query, type, snap]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= filtered.length) return;
    const root = el.closest("[data-app-scroll]");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLimit((n) => Math.min(filtered.length, n + PAGE_SIZE));
        }
      },
      { root: root instanceof Element ? root : null, rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, limit]);

  const featured = filtered[0] ?? null;
  const featuredKey = featured ? lotUnitKey(featured, 0) : "";
  const rail = featured
    ? filtered.slice(1, Math.max(1, limit))
    : filtered.slice(0, limit);
  const updated = snap?.asOf ? formatLotUpdated(snap.asOf) : "";
  const shown = filtered.length;
  const total = snap?.units.length ?? 0;
  const countLine = error
    ? error
    : !snap
      ? "Loading lot…"
      : query.trim() || type || condition || sales.length
        ? `${shown} of ${total} shown`
        : `${total} shown`;

  return (
    <SuitePage
      tab="rvlot"
      className="lot-stock-screen"
      raidhoOnly
      onPullReset={load}
      pullLabel="Release to refresh lot"
      noSwipeScroll
    >
      <div
        className="mx-auto w-full max-w-3xl space-y-3 px-4 pb-12 pt-2 sm:px-6"
        data-lot-stock
        data-lot-rendered={snap ? rail.length + (featured ? 1 : 0) : 0}
      >
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => nav?.setTab("more")}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/20 bg-black/30 px-3 text-[11px] font-bold text-white"
          >
            <ChevronLeft className="size-3.5" />
            Premium
          </button>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/70">
            {snap ? `${total.toLocaleString("en-US")} units` : "Lot"}
          </p>
        </header>

        <label className="block">
          <span className="sr-only">Search lot stock</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/55"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Impression, 50k miles, generator, Fife…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lot-search
              className="lot-search glass-field min-h-12 w-full rounded-full py-3 pl-11 pr-12 text-[15px] font-medium text-white placeholder:text-white/50"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white/70"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </span>
        </label>

        {!query.trim() && !type && !condition ? (
          <LotArrivals
            units={snap?.units ?? []}
            onOpenUnit={(unit) => {
              const next = lotArrivalQuery(unit);
              wantOpen.current = next;
              setType("");
              setCondition("");
              setQuery(next);
            }}
          />
        ) : null}

        <div className="lot-condition" role="group" aria-label="New or used">
          {(["New", "Used"] as const).map((label) => (
            <button
              key={label}
              type="button"
              data-lot-condition={label}
              aria-pressed={condition === label}
              onClick={() =>
                setCondition((cur) => (cur === label ? "" : label))
              }
              className={cn(
                "lot-chip lot-condition-tab shrink-0 rounded-full px-3 text-[12px] font-semibold",
                condition === label && "is-on",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {chips.length ? (
          <div className="lot-chip-rail" data-lot-chips ref={chipRailRef}>
            <Chip
              label="All"
              on={type === ""}
              onClick={() => setType("")}
            />
            {chips.map((chip) => (
              <Chip
                key={chip.type}
                label={chip.label}
                on={type === chip.type}
                onClick={() =>
                  setType((cur) => (cur === chip.type ? "" : chip.type))
                }
              />
            ))}
          </div>
        ) : null}

        <div className="lot-chip-rail" data-lot-sales aria-label="Sales filters">
          {SALES_FILTERS.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              on={sales.includes(chip.id)}
              onClick={() =>
                setSales((cur) => {
                  const on = cur.includes(chip.id);
                  if (on) return cur.filter((id) => id !== chip.id);
                  const miles = chip.id === "mi30" || chip.id === "mi50";
                  const next = miles
                    ? cur.filter((id) => id !== "mi30" && id !== "mi50")
                    : cur;
                  return [...next, chip.id];
                })
              }
            />
          ))}
        </div>

        <p
          className="text-[12px] text-white/70"
          data-lot-count
        >
          {countLine}
          {updated && !error ? ` · ${updated}` : ""}
        </p>

        {error ? (
          <StatusCard
            title="Snapshot unavailable"
            body="The own-lot file did not load. Nothing here is invented from the catalog."
            action="Try again"
            onAction={load}
          />
        ) : !snap ? (
          <StatusCard
            title="Loading lot…"
            body="Reading the RV Country own-lot snapshot."
          />
        ) : filtered.length === 0 ? (
          <StatusCard
            title="No units match"
            body="Nothing on this lot snapshot matches that search. Clear the field to see the full lot — we will not pull the brochure catalog."
            empty
          />
        ) : (
          <div className="space-y-4">
            {featured ? (
              <section className="space-y-2" data-lot-featured>
                <p className="text-[10px] font-bold tracking-[0.18em] text-sapphire-glow">
                  FEATURED REPORT
                </p>
                <LotUnitCard
                  unit={featured}
                  featured
                  open={openKey === featuredKey}
                  onAsk={onAsk}
                  onToggle={() =>
                    setOpenKey((cur) =>
                      cur === featuredKey ? null : featuredKey,
                    )
                  }
                />
              </section>
            ) : null}

            {rail.length ? (
              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-[1.65rem] font-bold tracking-tight text-white">
                    On the lot
                  </h2>
                  <p className="text-[13px] text-white/70">
                    {shown.toLocaleString("en-US")} shown
                  </p>
                </div>
                <ul
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  data-lot-list
                  data-lot-rail
                >
                  {rail.map((unit, i) => {
                    const key = lotUnitKey(unit, i + 1);
                    return (
                      <li key={key} className="min-w-0">
                        <LotUnitCard
                          unit={unit}
                          open={openKey === key}
                          onAsk={onAsk}
                          onToggle={() =>
                            setOpenKey((cur) =>
                              cur === key ? null : key,
                            )
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        )}

        <div ref={sentinelRef} className="h-4" aria-hidden />
      </div>
    </SuitePage>
  );
}

function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-lot-chip={label}
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "lot-chip glass-chip shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold",
        "min-h-11",
        on && "is-on",
      )}
    >
      {label}
    </button>
  );
}

function StatusCard({
  title,
  body,
  action,
  onAction,
  empty,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  empty?: boolean;
}) {
  return (
    <section
      className="glass-prestige rounded-[var(--radius-xl)] p-4"
      data-lot-empty={empty ? "" : undefined}
    >
      <p className="text-[15px] font-bold text-white">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-white/80">{body}</p>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 min-h-11 rounded-full bg-sapphire px-4 text-[13px] font-bold text-white"
        >
          {action}
        </button>
      ) : null}
    </section>
  );
}

function lotGlance(unit: LotUnit): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];
  const length = lotLengthOrGap(unit.length_ft);
  if (length !== LOT_GAP) stats.push({ label: "Length", value: length });
  const gvwr = lotLbsOrGap(unit.gvwr);
  if (gvwr !== LOT_GAP) stats.push({ label: "GVWR", value: gvwr });
  if (unit.sleeps != null && unit.sleeps >= 0) {
    stats.push({ label: "Sleeps", value: String(unit.sleeps) });
  } else if (unit.slides != null && unit.slides >= 0) {
    stats.push({ label: "Slides", value: String(unit.slides) });
  }
  return stats.slice(0, 3);
}

function lotAskPrompt(unit: LotUnit): string {
  const name = [unit.year, unit.make, unit.model, unit.trim]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const stock = unit.stock_number.trim();
  return stock
    ? `Tell me about stock ${stock}${name ? `, the ${name}` : ""}.`
    : `Tell me about the ${name}.`;
}

function LotUnitCard({
  unit,
  featured,
  open,
  onToggle,
  onAsk,
}: {
  unit: LotUnit;
  featured?: boolean;
  open: boolean;
  onToggle: () => void;
  onAsk?: (prompt: string) => void;
}) {
  const headline = showroomUnitLabel(unit).trim() || "GAP";
  const price = lotPriceOrGap(unit.price);
  const miles = lotCardMiles(unit);
  const snippet = lotSearchSnippets(unit).find((row) => row.field === "horsepower" || row.field === "displacement")
    || lotSearchSnippets(unit)[0];
  const meta = [
    lotTextOrGap(unit.stock_number),
    lotTextOrGap(unit.location),
    lotTextOrGap(unit.condition),
    ...(miles ? [miles] : []),
  ].join(" · ");
  const photoUrl = lotUnitPhoto(unit);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = photoUrl && failedSrc !== photoUrl ? photoUrl : null;

  return (
    <article
      className="lot-card glass-prestige w-full overflow-hidden rounded-[var(--radius-2xl)]"
      data-lot-open={open ? "" : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        data-lot-card
        data-lot-featured-card={featured ? "" : undefined}
        aria-expanded={open}
        className="lot-card-hit w-full text-left transition duration-200 ease-out active:scale-[0.995]"
      >
        <div
          className={cn(
            "lot-well relative overflow-hidden",
            featured ? "is-featured" : "is-rail",
          )}
          data-lot-scene={photo ? "photo" : "empty"}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              className="lot-photo"
              data-lot-photo="unit"
              loading={featured ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailedSrc(photo)}
            />
          ) : (
            <span className="lot-mark" data-lot-photo="raidho">
              <img
                src={RAIDHO_R_MARK}
                alt=""
                className="lot-mark-art"
              />
            </span>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-sapphire px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            {shortLotTypeLabel(unit.body_type)}
          </span>
          <span
            className={cn(
              "absolute right-3 top-3 text-[15px] font-bold tabular-nums text-prestige",
              featured && "text-[17px]",
              price === "GAP" && "text-white/55",
            )}
          >
            {price}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5 px-4 py-3">
          <p
            className={cn(
              "lot-unit-title",
              featured ? "is-featured" : "is-rail",
            )}
            data-lot-unit
          >
            {headline}
          </p>
          {snippet ? (
            <p className="text-[12px] font-semibold text-white" data-lot-snippet>
              {snippet.text}
            </p>
          ) : null}
          <p className="lot-unit-meta" data-lot-meta>
            {meta}
          </p>
        </div>
      </button>
      {open ? (
        <LotDetail unit={unit} onAsk={onAsk} />
      ) : null}
    </article>
  );
}

function LotDetail({
  unit,
  onAsk,
}: {
  unit: LotUnit;
  onAsk?: (prompt: string) => void;
}) {
  const stats = lotGlance(unit);
  const sections = lotOpenSections(unit);
  const nav = useShellNavOptional();
  const listing = lotListingHref(unit.url);
  const price = unit.price != null && unit.price > 0 ? unit.price : 0;
  return (
    <div className="lot-detail" data-lot-detail>
      <div className="lot-share-dock">
        <button
          type="button"
          className="lot-cal-tab"
          data-lot-facts
          aria-label="RV facts"
          onClick={() => nav?.setTab("rvfax")}
        >
          <Check className="size-4" aria-hidden />
        </button>
        {price > 0 ? (
          <button
            type="button"
            className="lot-cal-tab"
            data-lot-cal
            aria-label="Calculate payment"
            onClick={() =>
              nav?.openCalWithPrice(price, showroomUnitLabel(unit))
            }
          >
            <Calculator className="size-4" aria-hidden />
          </button>
        ) : null}
        {listing ? (
          <a
            className="lot-detail-tab"
            href={listing}
            target="_blank"
            rel="noopener noreferrer"
            data-lot-listing
          >
            More info
          </a>
        ) : null}
        <ReportShareButton report={buildUnitShareReport(unit)} />
      </div>
      {stats.length ? (
        <div className="lot-detail-stats">
          {stats.map((stat) => (
            <p key={stat.label} className="lot-detail-stat">
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </p>
          ))}
        </div>
      ) : null}
      {onAsk ? (
        <button
          type="button"
          className="lot-detail-ask"
          onClick={() => onAsk(lotAskPrompt(unit))}
        >
          Ask about this coach
        </button>
      ) : null}
      {sections.map((part) => (
        <section key={part.title} className="lot-detail-section">
          <h3>{part.title}</h3>
          <dl>
            {part.rows.map((row) => (
              <DetailRow key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function detailParts(label: string, value: string): string[] {
  const parts = value
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return [];
  return label === "Options" ? parts.slice(0, 8) : parts;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const parts = detailParts(label, value);
  if (parts.length) {
    return (
      <div className="lot-detail-row is-list">
        <dt>{label}</dt>
        <dd>
          <ul className="lot-detail-list">
            {parts.map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ul>
        </dd>
      </div>
    );
  }
  return (
    <div className="lot-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
