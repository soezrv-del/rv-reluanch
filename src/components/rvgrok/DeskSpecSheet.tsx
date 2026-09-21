import { FileSpreadsheet } from "lucide-react";
import type { DeskSheetPayload } from "@/lib/rvgrok/deskSheet";
import { cn } from "@/lib/utils";

export function DeskSpecSheet({
  sheet,
  className,
}: {
  sheet: DeskSheetPayload;
  className?: string;
}) {
  return (
    <section
      data-rvgrok-desk-sheet=""
      data-desk-year={sheet.year}
      data-desk-make={sheet.make}
      data-desk-model={sheet.model}
      data-desk-floorplan={sheet.floorplan}
      aria-label={`Spec sheet on the desk: ${sheet.title}`}
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border-strong bg-surface-2 shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      <header className="flex items-start gap-3 border-b border-border bg-bg-elevated px-3.5 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-sapphire/35 bg-[var(--page-accent-soft)] text-sapphire">
          <FileSpreadsheet className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
            On the desk · spec sheet
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-fg">
            {sheet.title}
          </h3>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px bg-border">
        {sheet.rows.map((row) => (
          <div
            key={row.label}
            className="bg-surface px-3 py-2.5"
            data-desk-row={row.label}
            data-desk-gap={row.gap ? "1" : "0"}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-dim">
              {row.label}
            </dt>
            <dd
              className={cn(
                "mt-0.5 text-[13px] font-semibold leading-snug",
                row.gap ? "text-amber" : "text-fg",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {sheet.presenceNote ? (
        <p className="border-t border-border px-3.5 py-2.5 text-[11px] leading-snug text-amber">
          {sheet.presenceNote}
        </p>
      ) : sheet.gaps.length ? (
        <p className="border-t border-border px-3.5 py-2 text-[11px] leading-snug text-dim">
          GAP fields stay empty — nothing invented.
        </p>
      ) : null}
    </section>
  );
}
