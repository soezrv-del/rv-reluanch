import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Calculator, Check, ChevronLeft, MapPin, Search, X } from "lucide-react";
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
  lotDetailPhoto,
  LOT_GAP,
  type LotSnapshotView,
  type LotUnit,
} from "@/lib/lot/ownLotPage";
import { lotSearchSnippets } from "@/lib/lot/lotSearch";
import { lotOpenSections } from "@/lib/lot/lotDetail";
import {
  garagePinConfirmed,
  isToyHaulerBody,
  type GaragePinBook,
} from "@/lib/lot/garagePins";
import {
  LOT_UNIT_OPEN_EVENT,
  homeStudioPlate,
  lotArrivalQuery,
  showroomUnitLabel,
  studioCardName,
  studioLength,
  takePendingLotQuery,
} from "@/lib/home/homeCoach";
import {
  readGarageStocks,
  subscribeGarage,
  toggleGarageStock,
} from "@/lib/lot/studioGarage";
import { StudioGarage } from "@/components/lot/StudioGarage";
import { useCenterSelectedTab } from "@/lib/hooks/useCenterSelectedTab";
import { LotArrivals } from "@/components/lot/LotArrivals";
import { ReportShareButton } from "@/components/report/ReportShareButton";
import { buildUnitShareReport } from "@/lib/rv/shareReport";

const PAGE_SIZE = 40;

export function LotStockApp({
  onAsk,
}: {
  onAsk?: (prompt: string) => void;
}) {
  const nav = useShellNavOptional();
  const [snap, setSnap] = useState<LotSnapshotView | null>(null);
  const [garagePins, setGaragePins] = useState<GaragePinBook>({});
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [type, setType] = useState("");
  const [condition, setCondition] = useState<"" | "New" | "Used">("");
  const chipRailRef = useRef<HTMLDivElement>(null);
  useCenterSelectedTab(chipRailRef, type);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showGarage, setShowGarage] = useState(false);
  const [comparing, setComparing] = useState(false);
  const garageStocks = useSyncExternalStore(
    subscribeGarage,
    readGarageStocks,
    readGarageStocks,
  );
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
    void fetch("/inventory/garage-pins.json")
      .then((res) => (res.ok ? res.json() : {}))
      .then((book: GaragePinBook) => setGaragePins(book && typeof book === "object" ? book : {}))
      .catch(() => setGaragePins({}));
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
  const browseQuery = appliedQuery;
  const filtered = useMemo(
    () => filterLotBrowse(snap?.units ?? [], { query: browseQuery, type, condition }),
    [snap, browseQuery, type, condition],
  );

  useEffect(() => {
    setLimit(PAGE_SIZE);
    if (!wantOpen.current) setOpenKey(null);
    const scroller = sentinelRef.current?.closest("[data-app-scroll]");
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0;
  }, [appliedQuery, type, condition]);

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

  const garageUnits = useMemo(() => {
    const byStock = new Map(
      (snap?.units ?? []).map((unit) => [unit.stock_number.trim(), unit]),
    );
    return garageStocks
      .map((stock) => byStock.get(stock))
      .filter((unit): unit is LotUnit => Boolean(unit));
  }, [snap, garageStocks]);
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
      : query.trim() || type || condition
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
        <div className="studio-search-head">
          <p className="studio-kicker">RV MAX</p>
          <h1 className="studio-title">{showGarage ? "Your garage" : "Search"}</h1>
          {showGarage ? <div className="studio-rule" /> : null}
          {showGarage ? (
            <p className="studio-saved-count">{garageUnits.length} saved</p>
          ) : null}
          <button
            type="button"
            className="studio-garage-link"
            onClick={() => {
              setShowGarage((open) => !open);
              setComparing(false);
            }}
          >
            {showGarage ? "Search" : "Your garage"}
          </button>
        </div>
        <header className="lot-premium-back flex items-center justify-between gap-3">
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

        {showGarage ? (
          <StudioGarage
            units={garageUnits}
            comparing={comparing}
            onOpen={(unit) => {
              const next = lotArrivalQuery(unit);
              wantOpen.current = next;
              setShowGarage(false);
              setComparing(false);
              setType("");
              setCondition("");
              setQuery(next);
            }}
            onRemove={(stock) => toggleGarageStock(stock)}
            onToggleCompare={() => setComparing((on) => !on)}
          />
        ) : null}

        {showGarage ? null : (<>
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
              className="lot-search glass-field min-h-12 w-full rounded-lg py-3 pl-11 pr-12 text-[16px] font-medium text-white placeholder:text-white/50"
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
                  pins={garagePins}
                  saved={garageStocks.includes(featured.stock_number.trim())}
                  open={openKey === featuredKey}
                  onAsk={onAsk}
                  onToggleSave={() => toggleGarageStock(featured.stock_number)}
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
                <div className="studio-lot-heading flex items-end justify-between gap-3">
                  <h2 className="text-[17px] font-semibold tracking-tight text-white">
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
                          pins={garagePins}
                          saved={garageStocks.includes(unit.stock_number.trim())}
                          open={openKey === key}
                          onAsk={onAsk}
                          onToggleSave={() => toggleGarageStock(unit.stock_number)}
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
        </>)}

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
  pins,
  saved,
  onToggle,
  onToggleSave,
  onAsk,
}: {
  unit: LotUnit;
  featured?: boolean;
  open: boolean;
  pins: GaragePinBook;
  saved: boolean;
  onToggle: () => void;
  onToggleSave: () => void;
  onAsk?: (prompt: string) => void;
}) {
  const headline = studioCardName(unit).trim() || "GAP";
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
  const photoUrl = open ? lotDetailPhoto(unit) : lotUnitPhoto(unit);
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
        className="lot-card-hit lot-row w-full text-left transition duration-200 ease-out active:scale-[0.995]"
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
        </div>
        <div className="lot-row-copy">
          <p
            className={cn(
              "lot-unit-title",
              featured ? "is-featured" : "is-rail",
            )}
            data-lot-unit
          >
            {headline}
          </p>
          <p className={cn("lot-row-price", price === "GAP" && "is-gap")}>{price}</p>
          {lotTextOrGap(unit.location) !== "GAP" ? (
            <p className="lot-row-where">
              <MapPin aria-hidden />
              {lotTextOrGap(unit.location)}
            </p>
          ) : null}
          {studioLength(unit.length_ft) ? (
            <p className="lot-row-sub">
              {[unit.year.trim(), studioLength(unit.length_ft)].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {snippet ? <p data-lot-snippet>{snippet.text}</p> : null}
          <p className="lot-unit-meta" data-lot-meta>
            {meta}
          </p>
        </div>
      </button>
      {unit.stock_number.trim() ? (
        <button
          type="button"
          className={cn("studio-save", saved && "is-on")}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${headline} from your garage`
              : `Save ${headline} to your garage`
          }
          onClick={onToggleSave}
        >
          {saved ? "Saved" : "Save"}
        </button>
      ) : null}
      {open ? (
        <LotDetail unit={unit} pins={pins} onAsk={onAsk} onClose={onToggle} />
      ) : null}
    </article>
  );
}

function LotDetail({
  unit,
  pins,
  onAsk,
  onClose,
}: {
  unit: LotUnit;
  pins: GaragePinBook;
  onAsk?: (prompt: string) => void;
  onClose: () => void;
}) {
  const stats = lotGlance(unit);
  const plate = homeStudioPlate(unit);
  const sections = lotOpenSections(unit);
  const hero = lotUnitPhoto(unit);
  const nav = useShellNavOptional();
  const listing = lotListingHref(unit.url);
  const price = unit.price != null && unit.price > 0 ? unit.price : 0;
  return (
    <div className="lot-detail" data-lot-detail>
      <div className="studio-open" data-studio-open>
        <button type="button" className="studio-open-back" onClick={onClose}>
          Search
        </button>
        {hero ? (
          <img src={hero} alt="" className="studio-open-photo" />
        ) : null}
        <p className="studio-open-name">{studioCardName(unit)}</p>
        {plate.length ? (
          <div className="showroom-plate">
            {plate.map((cell) => (
              <div className="showroom-plate-cell" key={cell.label}>
                <p className="showroom-plate-label">{cell.label}</p>
                <p className="showroom-plate-value">{cell.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {isToyHaulerBody(unit.body_type) && !garagePinConfirmed(pins, unit) ? (
        <p className="lot-garage-note" data-ask-missing-spec>
          garage length not confirmed
        </p>
      ) : null}
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
