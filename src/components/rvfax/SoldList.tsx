import { useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight, hapticWarn } from "@/lib/haptics";
import {
  formatSoldMoney,
  salesmanNet,
  soldTotals,
  splitLabel,
  type SoldDeal,
} from "@/lib/rv/soldDeals";

const SWIPE_REVEAL = 88;
const SWIPE_COMMIT = 56;

export function SoldList({
  deals,
  onBack,
  onTogglePaid,
  onRemove,
}: {
  deals: SoldDeal[];
  onBack: () => void;
  onTogglePaid: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const totals = soldTotals(deals);

  return (
    <div
      className="relative mx-auto w-full max-w-lg space-y-3.5 px-3 pb-28 pt-2 sm:px-4"
      data-no-swipe
    >
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white"
        >
          <ChevronLeft className="size-3.5" />
          Facts
        </button>
        <p className="text-[10px] font-bold tracking-[0.16em] text-white/80">
          SOLD
        </p>
      </header>

      {deals.length === 0 ? (
        <section className="glass-prestige rounded-[var(--radius-xl)] p-4">
          <p className="text-[15px] font-bold text-white">No deals yet</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/65">
            Open a saved coach and tap Sold. Three steps — name (optional),
            gross, then quarter / half / whole.
          </p>
        </section>
      ) : (
        <section className="space-y-2.5">
          {deals.map((deal) => (
            <SoldDealRow
              key={deal.id}
              deal={deal}
              onTogglePaid={onTogglePaid}
              onRemove={onRemove}
            />
          ))}
        </section>
      )}

      <section className="glass-prestige-gold rounded-[var(--radius-xl)] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-amber">
              TOTAL GROSS
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-white">
              {formatSoldMoney(totals.totalGross)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.16em] text-amber">
              OWED
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-white">
              {formatSoldMoney(totals.owedNet)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/65">
          Swipe left or tap Delete to drop a test or fallen-through deal. It
          leaves Sold only — the coach stays off Saved.
        </p>
      </section>
    </div>
  );
}

function SoldDealRow({
  deal,
  onTogglePaid,
  onRemove,
}: {
  deal: SoldDeal;
  onTogglePaid: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const net = salesmanNet(deal.gross, deal.split);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const start = useRef<{
    x: number;
    y: number;
    base: number;
    axis: "h" | "v" | null;
  } | null>(null);

  const drop = () => {
    void hapticWarn();
    onRemove(deal.id);
  };

  const snap = (n: number) => {
    if (n <= -SWIPE_COMMIT) {
      drop();
      return;
    }
    offsetRef.current = 0;
    setOffset(0);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement | null)?.closest("button")) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* */
    }
    start.current = {
      x: e.clientX,
      y: e.clientY,
      base: offsetRef.current,
      axis: null,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.axis = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
      if (s.axis === "v") {
        start.current = null;
        return;
      }
    }
    if (s.axis !== "h") return;
    e.preventDefault();
    const next = Math.min(0, Math.max(-SWIPE_REVEAL, s.base + dx));
    offsetRef.current = next;
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    snap(offsetRef.current);
  };

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-xl)]"
      data-no-swipe
    >
      <button
        type="button"
        onClick={drop}
        className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-ruby text-[12px] font-bold text-white"
        aria-label={`Delete ${deal.unitLabel} from Sold`}
      >
        Delete
      </button>
      <article
        className={cn(
          "glass-prestige relative rounded-[var(--radius-xl)] px-3.5 py-3",
          deal.paid && "border-green/40",
        )}
        style={{
          transform: `translateX(${offset}px)`,
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-white">
              {deal.customerName || "—"}
            </p>
            <p className="truncate text-[12px] text-white/75">
              {deal.unitLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={`Delete ${deal.unitLabel} from Sold`}
              onClick={drop}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-ruby-border/60 bg-ruby-soft px-3 text-[12px] font-bold text-ruby"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
            <button
              type="button"
              aria-pressed={deal.paid}
              aria-label={
                deal.paid
                  ? `Mark ${deal.unitLabel} unpaid`
                  : `Mark ${deal.unitLabel} paid`
              }
              onClick={() => {
                void hapticLight();
                onTogglePaid(deal.id);
              }}
              className={cn(
                "min-h-[44px] shrink-0 rounded-full border px-3.5 text-[12px] font-bold",
                deal.paid
                  ? "border-green/50 bg-green text-black"
                  : "border-white/20 bg-black/40 text-white",
              )}
            >
              {deal.paid ? "Paid" : "Mark paid"}
            </button>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <p className="font-bold tracking-wide text-white/55">GROSS</p>
            <p className="text-[13px] font-bold text-white">
              {formatSoldMoney(deal.gross)}
            </p>
          </div>
          <div>
            <p className="font-bold tracking-wide text-white/55">SPLIT</p>
            <p className="text-[13px] font-bold text-white">
              {splitLabel(deal.split)}
            </p>
          </div>
          <div>
            <p className="font-bold tracking-wide text-white/55">NET</p>
            <p className="text-[13px] font-bold text-sky-200">
              {formatSoldMoney(net)}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
