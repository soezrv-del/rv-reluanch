import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, Search, Warehouse, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitePage } from "@/components/shell/SuitePage";
import { PremiumMenuButton } from "@/components/shell/PremiumMenuButton";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  fetchLotSnapshot,
  lotPriceOrGap,
  lotTextOrGap,
  lotUnitKey,
  searchLotUnits,
  type LotSnapshotView,
  type LotUnit,
} from "@/lib/lot/ownLotPage";

const PAGE_SIZE = 48;

export function LotStockApp() {
  const nav = useShellNavOptional();
  const [snap, setSnap] = useState<LotSnapshotView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(
    () => searchLotUnits(snap?.units ?? [], query),
    [snap, query],
  );

  useEffect(() => {
    setLimit(PAGE_SIZE);
    setOpenKey(null);
  }, [query]);

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

  const visible = filtered.slice(0, limit);
  const asOf = snap?.asOf
    ? snap.asOf.replace("T", " ").replace(/-\d{2}:\d{2}$/, "")
    : "";

  return (
    <SuitePage
      adaptiveGlass={false}
      noSwipeScroll
      onPullReset={load}
      pullLabel="Release to refresh lot"
    >
      <div
        className="mx-auto w-full max-w-lg space-y-4 px-3 pb-12 pt-3 sm:px-4"
        data-lot-stock
      >
        <header className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => nav?.setTab("more")}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11px] font-bold text-fg"
          >
            <ChevronLeft className="size-3.5" />
            Suite
          </button>
          <PremiumMenuButton size="sm" />
        </header>

        <section className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-[0.16em] text-accent">
            RV COUNTRY
          </p>
          <h1 className="flex items-center gap-2 text-[28px] font-bold leading-snug text-fg">
            <Warehouse className="size-6 text-accent" aria-hidden />
            Lot stock
          </h1>
          <p className="text-[13px] leading-relaxed text-muted">
            In-stock on our lot — not the brochure catalog.
          </p>
        </section>

        <label className="block">
          <span className="sr-only">Search lot stock</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Year, make, model, stock, type, lot…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lot-search
              className="glass-field min-h-11 w-full rounded-2xl py-3 pl-10 pr-11 text-[15px] font-semibold text-fg outline-none placeholder:text-dim"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </span>
        </label>

        <p className="px-0.5 text-[12px] text-muted" data-lot-count>
          {error
            ? error
            : !snap
              ? "Loading lot…"
              : query.trim()
                ? `${filtered.length} of ${snap.units.length} on lot`
                : `${snap.units.length} on lot`}
          {asOf && !error ? ` · as of ${asOf}` : ""}
        </p>

        {error ? (
          <section className="glass-prestige rounded-xl p-4">
            <p className="text-[15px] font-bold text-fg">Snapshot unavailable</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              The own-lot file did not load. Nothing here is invented from the
              catalog.
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-3 min-h-11 rounded-xl bg-accent px-4 text-[13px] font-bold text-tiimo-bg"
            >
              Try again
            </button>
          </section>
        ) : !snap ? (
          <section className="glass-prestige rounded-xl p-4">
            <p className="text-[15px] font-bold text-fg">Loading lot…</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Reading the RV Country own-lot snapshot.
            </p>
          </section>
        ) : filtered.length === 0 ? (
          <section className="glass-prestige rounded-xl p-4" data-lot-empty>
            <p className="text-[15px] font-bold text-fg">No units match</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Nothing on this lot snapshot matches that search. Clear the field
              to see the full lot — we will not pull the brochure catalog.
            </p>
          </section>
        ) : (
          <ul className="space-y-2.5" data-lot-list>
            {visible.map((unit, i) => {
              const key = lotUnitKey(unit, i);
              return (
                <LotUnitCard
                  key={key}
                  unit={unit}
                  open={openKey === key}
                  onToggle={() =>
                    setOpenKey((cur) => (cur === key ? null : key))
                  }
                />
              );
            })}
          </ul>
        )}

        <div ref={sentinelRef} className="h-4" aria-hidden />
      </div>
    </SuitePage>
  );
}

function LotUnitCard({
  unit,
  open,
  onToggle,
}: {
  unit: LotUnit;
  open: boolean;
  onToggle: () => void;
}) {
  const title =
    unit.title.trim() ||
    [unit.year, unit.make, unit.model, unit.trim]
      .filter(Boolean)
      .join(" ") ||
    LOT_PLACEHOLDER;
  const price = lotPriceOrGap(unit.price);
  const stock = lotTextOrGap(unit.stock_number);
  const location = lotTextOrGap(unit.location);
  const type = lotTextOrGap(unit.body_type);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        data-lot-card
        aria-expanded={open}
        className="glass-prestige w-full rounded-xl p-3.5 text-left transition duration-200 ease-out active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-bold leading-snug text-fg">{title}</p>
            <p className="mt-1 text-[12px] text-muted">
              {type}
              {" · "}
              {location}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 text-[16px] font-bold tabular-nums",
              price === "GAP" ? "text-dim" : "text-accent",
            )}
          >
            {price}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-muted">
          <span>
            Stock {stock}
          </span>
          <span className="inline-flex items-center gap-1 text-dim">
            {open ? "Close" : "Open"}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
        </div>
        {open ? (
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-[12px]">
            <Field label="Year" value={lotTextOrGap(unit.year)} />
            <Field label="Make" value={lotTextOrGap(unit.make)} />
            <Field label="Model" value={lotTextOrGap(unit.model)} />
            <Field label="Trim" value={lotTextOrGap(unit.trim)} />
            <Field label="Price" value={price} />
            <Field label="Stock" value={stock} />
            <Field label="Location" value={location} />
            <Field label="Type" value={type} />
          </dl>
        ) : null}
      </button>
    </li>
  );
}

const LOT_PLACEHOLDER = "GAP";

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
