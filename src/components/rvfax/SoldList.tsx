import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  formatSoldMoney,
  salesmanNet,
  soldTotals,
  splitLabel,
  type SoldDeal,
} from "@/lib/rv/soldDeals";

export function SoldList({
  deals,
  onBack,
  onTogglePaid,
}: {
  deals: SoldDeal[];
  onBack: () => void;
  onTogglePaid: (id: string) => void;
}) {
  const totals = soldTotals(deals);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3.5 px-3 pb-28 pt-2 sm:px-4">
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
          {deals.map((deal) => {
            const net = salesmanNet(deal.gross, deal.split);
            return (
              <article
                key={deal.id}
                className={cn(
                  "glass-prestige rounded-[var(--radius-xl)] px-3.5 py-3",
                  deal.paid && "border-green/40",
                )}
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
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <p className="font-bold tracking-wide text-white/55">
                      GROSS
                    </p>
                    <p className="text-[13px] font-bold text-white">
                      {formatSoldMoney(deal.gross)}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold tracking-wide text-white/55">
                      SPLIT
                    </p>
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
            );
          })}
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
          Paid deals drop out of owed. Tap Paid again to put them back.
        </p>
      </section>
    </div>
  );
}
