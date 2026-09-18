import { ArrowLeft, Check, GitCompare, X } from "lucide-react";
import type { RVResult } from "@/lib/rv/catalog";
import {
  SAVED_COMPARE_GAP,
  buildSavedCompareReport,
  capSavedCompareItems,
} from "@/lib/rv/savedCompare";
import { cn } from "@/lib/utils";
import { SuiteBackdrop } from "@/components/shell/SuitePage";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import { FACTS_LANDING_BACKDROP } from "@/assets/prestige";

export function SavedCompare({
  items,
  onBack,
  onClear,
  onRemove,
  onOpen,
}: {
  items: RVResult[];
  onBack: () => void;
  onClear: () => void;
  onRemove: (r: RVResult) => void;
  onOpen?: (r: RVResult) => void;
}) {
  const report = buildSavedCompareReport(capSavedCompareItems(items));
  const n = report.columns.length;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-bg text-white"
      data-saved-compare=""
      data-readable-cards=""
    >
      <SuiteBackdrop src={FACTS_LANDING_BACKDROP} objectPosition="center 42%" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="rvfax-report-chrome shrink-0 border-b border-white/10 bg-[#070b14]/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 px-3 pb-2 sm:px-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-white/20 bg-black/50 px-3 text-[12px] font-bold text-white"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold tracking-[0.14em] text-white/55">
                COMPARE · {n} SAVED
              </p>
              <p className="truncate text-[13px] font-bold text-white">
                Side-by-side from saved data
              </p>
            </div>
            <button
              type="button"
              data-saved-compare-clear=""
              onClick={onClear}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-white/20 bg-black/50 px-3 text-[12px] font-bold text-white"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-3xl space-y-3 px-3 py-3 sm:px-5">
            <div className="grid gap-2" style={{ gridTemplateColumns: `7rem repeat(${n}, minmax(0, 1fr))` }}>
              <div />
              {report.columns.map((col) => (
                <div
                  key={col.key}
                  className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-2.5 py-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onOpen?.(col.result)}
                      className="min-w-0 text-left"
                    >
                      <p className="text-[11px] font-semibold text-sky-100">
                        {col.year}
                      </p>
                      <p className="truncate text-[12px] font-bold text-white">
                        {col.make.split(" ")[0]} {col.model}
                      </p>
                      {col.floorplan ? (
                        <p className="truncate text-[10px] text-white/70">
                          {col.floorplan}
                        </p>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${col.year} ${col.make} ${col.model} from compare`}
                      onClick={() => onRemove(col.result)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-sky-100">
                    <Check className="size-3" /> In set
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/35">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Saved motorhome comparison
                </caption>
                <tbody>
                  {report.rows.map((row) => (
                    <tr
                      key={row.id}
                      data-saved-compare-row={row.id}
                      className="border-t border-white/8 first:border-t-0"
                    >
                      <th
                        scope="row"
                        className="w-[7rem] px-3 py-2.5 align-top text-[11px] font-bold tracking-wide text-white/60"
                      >
                        {row.label}
                      </th>
                      {row.cells.map((c, i) => (
                        <td
                          key={`${row.id}-${report.columns[i]?.key ?? i}`}
                          className={cn(
                            "px-2.5 py-2.5 align-top text-[12px] font-semibold",
                            c.present ? "text-white" : "text-white/40",
                          )}
                        >
                          {c.present ? c.value : SAVED_COMPARE_GAP}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-white/55">
              <GitCompare className="size-3.5" />
              Empty cells are GAP — nothing is invented.
            </p>
            <SuiteDisclaimer className="pb-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
