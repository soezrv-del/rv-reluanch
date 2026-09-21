import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumMenuButton } from "@/components/shell/PremiumMenuButton";
import { PullRefreshLayer } from "@/components/shell/PullResetHint";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  fetchLotSnapshot,
  filterLotBrowse,
  lotPriceOrGap,
  lotTextOrGap,
  lotTypeChips,
  lotTypeFamily,
  lotUnitKey,
  shortLotTypeLabel,
  type LotSnapshotView,
  type LotTypeFamily,
  type LotUnit,
} from "@/lib/lot/ownLotPage";

const PAGE_SIZE = 48;

export function LotStockApp() {
  const nav = useShellNavOptional();
  const scrollRef = useRef<HTMLDivElement | null>(null);
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

  const pull = usePullToReset(scrollRef, load);

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
  const rail = featured ? filtered.slice(1, Math.max(1, limit)) : filtered.slice(0, limit);
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
    <div
      className="lot-research relative flex h-full min-h-0 flex-col overflow-hidden"
      data-lot-stock
    >
      <div className="lot-research-wash pointer-events-none" aria-hidden />
      <div
        ref={scrollRef}
        data-app-scroll
        data-no-swipe-scroll=""
        className="rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <PullRefreshLayer state={pull} label="Release to refresh lot">
          <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-12 pt-3 sm:px-6">
            <header className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => nav?.setTab("more")}
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-lot-plate px-3 text-[11px] font-bold text-fg"
              >
                <ChevronLeft className="size-3.5" />
                Suite
              </button>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-muted">
                {snap ? `${total.toLocaleString("en-US")} units` : "Lot"}
              </p>
              <PremiumMenuButton size="sm" />
            </header>

            <section className="max-w-xl space-y-2 pt-1">
              <p className="text-[10px] font-bold tracking-[0.2em] text-sapphire-glow">
                RV COUNTRY
              </p>
              <h1 className="text-balance text-[clamp(2rem,8vw,3.15rem)] font-bold leading-[1.05] tracking-tight text-fg">
                On the lot.
              </h1>
              <p className="max-w-md text-[14px] leading-relaxed text-muted">
                In-stock RV Country inventory. Not the brochure catalog.
              </p>
            </section>

            <label className="block">
              <span className="sr-only">Search lot stock</span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-dim"
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
                  className="lot-search min-h-12 w-full rounded-full py-3 pl-11 pr-12 text-[15px] font-medium text-fg placeholder:text-dim"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted"
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

            <p className="text-[12px] text-muted" data-lot-count>
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
              <div className="space-y-6">
                {featured ? (
                  <section className="space-y-2" data-lot-featured>
                    <p className="text-[10px] font-bold tracking-[0.18em] text-dim">
                      Featured on the lot
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
                      <h2 className="text-[1.35rem] font-bold tracking-tight text-fg">
                        On the lot
                      </h2>
                      <p className="text-[12px] text-muted">
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
        </PullRefreshLayer>
      </div>
    </div>
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
        "lot-chip shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition duration-200",
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
      className="lot-card rounded-xl p-4"
      data-lot-empty={empty ? "" : undefined}
    >
      <p className="text-[15px] font-bold text-fg">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 min-h-11 rounded-full bg-fg px-4 text-[13px] font-bold text-lot-void"
        >
          {action}
        </button>
      ) : null}
    </section>
  );
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
  const type = lotTextOrGap(unit.body_type);
  const year = lotTextOrGap(unit.year);
  const trim = lotTextOrGap(unit.trim);
  const condition = lotTextOrGap(unit.condition);

  return (
    <article className={featured ? undefined : undefined}>
      <button
        type="button"
        onClick={onToggle}
        data-lot-card
        data-lot-featured-card={featured ? "" : undefined}
        aria-expanded={open}
        className={cn(
          "lot-card w-full overflow-hidden rounded-xl text-left transition duration-200 ease-out active:scale-[0.995]",
        )}
      >
        <div
          className={cn(
            "lot-well relative flex items-end justify-center px-4 pb-3 pt-12",
            featured ? "is-featured" : "is-rail",
          )}
        >
          <span className="absolute left-3 top-3 rounded-full bg-fg px-2.5 py-1 text-[11px] font-bold text-lot-void">
            {shortLotTypeLabel(unit.body_type)}
          </span>
          <span
            className={cn(
              "absolute right-3 top-3 text-[15px] font-bold tabular-nums",
              featured && "text-[17px]",
              price === "GAP" ? "text-dim" : "text-fg",
            )}
          >
            {price}
          </span>
          <LotTypeMark type={unit.body_type} featured={featured} />
        </div>
        <div className="space-y-2 px-4 py-3.5">
          <p className="text-[12px] font-semibold text-muted">{year}</p>
          <p className="text-[18px] font-bold leading-snug text-fg">{title}</p>
          <p className="text-[13px] text-muted">
            {trim === "GAP" ? "Trim GAP" : trim}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-[12px] sm:grid-cols-4">
            <Field label="Stock" value={stock} />
            <Field label="Location" value={location} />
            <Field label="Type" value={type} />
            <Field label="Condition" value={condition} />
          </dl>
          {open ? (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-[12px]">
              <Field label="Year" value={year} />
              <Field label="Make" value={lotTextOrGap(unit.make)} />
              <Field label="Model" value={lotTextOrGap(unit.model)} />
              <Field label="Trim" value={trim} />
              <Field label="Price" value={price} />
              <Field label="VIN" value={lotTextOrGap(unit.vin)} />
            </dl>
          ) : null}
        </div>
      </button>
    </article>
  );
}

function LotTypeMark({
  type,
  featured,
}: {
  type: string;
  featured?: boolean;
}) {
  const family = lotTypeFamily(type);
  return (
    <svg
      viewBox="0 0 240 88"
      className="lot-mark"
      aria-hidden
      data-lot-mark={family}
    >
      <LotTypePaths family={family} featured={Boolean(featured)} />
    </svg>
  );
}

function LotTypePaths({
  family,
  featured,
}: {
  family: LotTypeFamily;
  featured: boolean;
}) {
  const stroke = featured ? 1.6 : 1.4;
  switch (family) {
    case "a":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M18 62h204l-6 12H24z" />
          <path d="M22 36h188c8 0 14 6 14 14v12H18V44c0-5 2-8 4-8z" />
          <rect x="36" y="40" width="28" height="14" rx="2" fillOpacity="0.08" />
          <rect x="72" y="40" width="36" height="14" rx="2" fillOpacity="0.08" />
          <rect x="116" y="40" width="36" height="14" rx="2" fillOpacity="0.08" />
          <circle cx="52" cy="70" r="8" fill="none" />
          <circle cx="188" cy="70" r="8" fill="none" />
        </g>
      );
    case "b":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M48 58h144l-4 12H52z" />
          <path d="M56 34h112c10 0 22 8 26 16v8H48V48c0-8 4-14 8-14z" />
          <path d="M164 38c8 2 16 8 20 14h-28V40z" fillOpacity="0.08" />
          <circle cx="78" cy="68" r="8" fill="none" />
          <circle cx="168" cy="68" r="8" fill="none" />
        </g>
      );
    case "c":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M22 60h196l-6 12H28z" />
          <path d="M70 32h130c8 0 16 8 16 16v12H54V48c4-10 10-16 16-16z" />
          <path d="M28 44h32l10 16H22z" />
          <rect x="86" y="38" width="30" height="12" rx="2" fillOpacity="0.08" />
          <circle cx="58" cy="70" r="8" fill="none" />
          <circle cx="186" cy="70" r="8" fill="none" />
        </g>
      );
    case "fw":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M58 58h164l-6 12H64z" />
          <path d="M78 28h130c8 0 14 6 14 14v16H70V42c0-8 4-14 8-14z" />
          <path d="M34 48h36v10H40c-6 0-10-4-10-8 0-2 2-2 4-2z" />
          <rect x="96" y="34" width="28" height="12" rx="2" fillOpacity="0.08" />
          <rect x="132" y="34" width="28" height="12" rx="2" fillOpacity="0.08" />
          <circle cx="108" cy="68" r="8" fill="none" />
          <circle cx="188" cy="68" r="8" fill="none" />
        </g>
      );
    case "toy":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M28 58h188l-6 12H34z" />
          <path d="M40 32h150c8 0 14 6 14 14v12H34V42c0-6 2-10 6-10z" />
          <path d="M196 36l16 22H188V44c0-4 2-8 8-8z" />
          <rect x="56" y="38" width="26" height="12" rx="2" fillOpacity="0.08" />
          <circle cx="72" cy="68" r="8" fill="none" />
          <circle cx="176" cy="68" r="8" fill="none" />
        </g>
      );
    case "camper":
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M36 56h168l-6 12H42z" />
          <path d="M86 30h86c6 0 10 4 10 10v16H78V40c0-6 4-10 8-10z" />
          <path d="M38 44h40v12H38z" />
          <circle cx="64" cy="66" r="8" fill="none" />
          <circle cx="176" cy="66" r="8" fill="none" />
        </g>
      );
    default:
      return (
        <g
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={stroke}
        >
          <path d="M34 58h188l-6 12H40z" />
          <path d="M52 32h154c8 0 12 6 12 12v14H40V44c0-7 5-12 12-12z" />
          <path d="M22 50h22v8H26z" />
          <rect x="68" y="38" width="28" height="12" rx="2" fillOpacity="0.08" />
          <rect x="104" y="38" width="28" height="12" rx="2" fillOpacity="0.08" />
          <circle cx="86" cy="68" r="8" fill="none" />
          <circle cx="186" cy="68" r="8" fill="none" />
        </g>
      );
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold tracking-[0.14em] text-dim">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-semibold text-fg",
          value === "GAP" && "text-dim",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
