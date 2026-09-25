import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RAIDHO_R_MARK } from "@/assets/prestige";
import { SuitePage } from "@/components/shell/SuitePage";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  fetchLotSnapshot,
  filterLotBrowse,
  lotPriceOrGap,
  lotPropaneOrGap,
  lotLengthOrGap,
  lotLbsOrGap,
  lotGalOrGap,
  lotCountOrGap,
  lotTextOrGap,
  lotTypeChips,
  lotUnitKey,
  lotUnitPhoto,
  pillLotTypeLabel,
  shortLotTypeLabel,
  type LotSnapshotView,
  type LotUnit,
} from "@/lib/lot/ownLotPage";

const PAGE_SIZE = 48;

export function LotStockApp() {
  const nav = useShellNavOptional();
  const [snap, setSnap] = useState<LotSnapshotView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  const chips = useMemo(() => lotTypeChips(snap?.units ?? []), [snap]);
  const filtered = useMemo(
    () => filterLotBrowse(snap?.units ?? [], { query, type }),
    [snap, query, type],
  );

  useEffect(() => {
    setLimit(PAGE_SIZE);
    setOpenKey(null);
  }, [query, type]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((n) => Math.min(filtered.length, n + PAGE_SIZE));
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const featured = filtered[0] ?? null;
  const featuredKey = featured ? lotUnitKey(featured, 0) : "";
  const rail = featured
    ? filtered.slice(1, Math.max(1, limit))
    : filtered.slice(0, limit);
  const asOf = snap?.asOf
    ? snap.asOf.replace("T", " ").replace(/-\d{2}:\d{2}$/, "")
    : "";
  const shown = filtered.length;
  const total = snap?.units.length ?? 0;
  const countLine = error
    ? error
    : !snap
      ? "Loading lot…"
      : query.trim() || type
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
              placeholder="Impression, Entegra, 45282, Fife…"
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

        {chips.length ? (
          <div className="lot-chip-rail" data-lot-chips>
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
          {asOf && !error ? ` · as of ${asOf}` : ""}
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
                      <li key={key}>
                        <LotUnitCard
                          unit={unit}
                          open={openKey === key}
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
        "lot-chip glass-chip shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition duration-200",
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

function printedLotSpecs(unit: LotUnit): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const add = (label: string, value: string) => {
    if (value && value !== "GAP") rows.push({ label, value });
  };
  add("Length", lotLengthOrGap(unit.length_ft));
  add("Height", lotLengthOrGap(unit.height_ft));
  add("Width", lotLengthOrGap(unit.width_ft));
  add("Sleeps", lotCountOrGap(unit.sleeps));
  add("Slides", lotCountOrGap(unit.slides));
  add("GVWR", lotLbsOrGap(unit.gvwr));
  add("Dry weight", lotLbsOrGap(unit.dry_weight));
  add("Hitch", lotLbsOrGap(unit.hitch_weight));
  add("Payload", lotLbsOrGap(unit.payload));
  add("Fresh", lotGalOrGap(unit.fresh_gal));
  add("Gray", lotGalOrGap(unit.gray_gal));
  add("Black", lotGalOrGap(unit.black_gal));
  add("Propane", lotPropaneOrGap(unit));
  return rows;
}

function LotUnitCard({
  unit,
  featured,
  open,
  onToggle,
}: {
  unit: LotUnit;
  featured?: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const title =
    [unit.make, unit.model].filter(Boolean).join(" ") ||
    unit.title.trim() ||
    "GAP";
  const price = lotPriceOrGap(unit.price);
  const stock = lotTextOrGap(unit.stock_number);
  const location = lotTextOrGap(unit.location);
  const year = lotTextOrGap(unit.year);
  const trim = lotTextOrGap(unit.trim);
  const condition = lotTextOrGap(unit.condition);
  const photo = lotUnitPhoto(unit);

  return (
    <article>
      <button
        type="button"
        onClick={onToggle}
        data-lot-card
        data-lot-featured-card={featured ? "" : undefined}
        aria-expanded={open}
        className="lot-card glass-prestige w-full overflow-hidden rounded-[var(--radius-2xl)] text-left transition duration-200 ease-out active:scale-[0.995]"
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
            />
          ) : (
            <img
              src={RAIDHO_R_MARK}
              alt=""
              className="lot-well-mark"
              data-lot-photo="raidho"
            />
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
          <div className="lot-well-id">
            <p className="text-[12px] font-semibold text-sapphire-glow">
              {year}
            </p>
            <p
              className={cn(
                "font-bold leading-snug text-white",
                featured ? "text-[18px]" : "text-[16px]",
              )}
              data-lot-unit
            >
              {title}
            </p>
          </div>
        </div>
        <div className="space-y-2.5 px-4 py-3">
          <p className="truncate text-[13px] text-white/75">
            {trim === "GAP" ? "Trim GAP" : trim}
            {stock !== "GAP" ? ` · #${stock}` : ""}
          </p>
          <dl className="lot-pills">
            <Pill label="Stock" value={stock} />
            <Pill label="Location" value={location} />
            <Pill label="Type" value={pillLotTypeLabel(unit.body_type)} />
            <Pill label="Condition" value={condition} />
          </dl>
          {open ? (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/15 pt-3 text-[12px]">
              <Field label="Year" value={year} />
              <Field label="Make" value={lotTextOrGap(unit.make)} />
              <Field label="Model" value={lotTextOrGap(unit.model)} />
              <Field label="Trim" value={trim} />
              <Field label="Price" value={price} />
              <Field label="VIN" value={lotTextOrGap(unit.vin)} />
              {printedLotSpecs(unit).map((row) => (
                <Field key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          ) : null}
        </div>
      </button>
    </article>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="lot-pill" data-lot-pill={label}>
      <dt className="sr-only">{label}</dt>
      <dd className={cn("lot-pill-value", value === "GAP" && "is-gap")}>
        {value}
      </dd>
      <p className="lot-pill-label">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold tracking-[0.14em] text-white/50">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 font-semibold text-white",
          value === "GAP" && "text-white/45",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
