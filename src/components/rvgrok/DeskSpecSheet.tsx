import type { DeskSheetPayload } from "@/lib/rvgrok/deskSheet";
import { cn } from "@/lib/utils";

const PILL_LABELS = ["Class", "GVWR", "UVW", "Fuel"];

export function DeskSpecSheet({
  sheet,
  className,
}: {
  sheet: DeskSheetPayload;
  className?: string;
}) {
  const pills = PILL_LABELS.map((label) =>
    sheet.rows.find((r) => r.label === label),
  ).filter(Boolean);
  const identity = [
    { label: "Year", value: sheet.year || "GAP", gap: !sheet.year },
    { label: "Make", value: sheet.make || "GAP", gap: !sheet.make },
    { label: "Model", value: sheet.model || "GAP", gap: !sheet.model },
    {
      label: "Floorplan",
      value: sheet.floorplan || "GAP",
      gap: !sheet.floorplan,
    },
  ];
  const specs = sheet.rows.filter((r) => !PILL_LABELS.includes(r.label));

  return (
    <section
      data-rvgrok-desk-sheet=""
      data-desk-year={sheet.year}
      data-desk-make={sheet.make}
      data-desk-model={sheet.model}
      data-desk-floorplan={sheet.floorplan}
      aria-label={`Spec sheet on the desk: ${sheet.title}`}
      className={cn("grok-report space-y-3", className)}
    >
      <header className="grok-frost grok-report-hero rounded-[var(--radius-2xl)] px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Spec report
        </p>
        <h3 className="grok-display mt-1.5 text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.03em] text-fg sm:text-[1.9rem]">
          {sheet.title}
        </h3>
        {sheet.floorplan ? (
          <p className="mt-1 text-[13px] text-muted">{sheet.floorplan}</p>
        ) : null}

        <div className="grok-report-pills mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pills.map((row) =>
            row ? (
              <div
                key={row.label}
                className="grok-report-pill rounded-[var(--radius-lg)] px-3 py-2.5 text-center"
                data-desk-row={row.label}
                data-desk-gap={row.gap ? "1" : "0"}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {row.label}
                </p>
                <p
                  className={cn(
                    "mt-1 truncate text-[13px] font-semibold",
                    row.gap ? "text-amber" : "text-fg",
                  )}
                >
                  {row.value}
                </p>
              </div>
            ) : null,
          )}
        </div>
      </header>

      {sheet.presenceNote ? (
        <p className="grok-frost grok-report-note rounded-[var(--radius-xl)] px-4 py-3 text-[12px] leading-snug text-amber">
          {sheet.presenceNote}
        </p>
      ) : sheet.gaps.length ? (
        <p className="grok-frost grok-report-note rounded-[var(--radius-xl)] px-4 py-3 text-[12px] leading-snug text-muted">
          GAP fields stay empty — nothing invented.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <dl className="grok-frost grok-report-card rounded-[var(--radius-2xl)] px-4 py-3.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Identity
          </p>
          {identity.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 border-t border-white/10 py-2 first:border-t-0 first:pt-0"
              data-desk-row={row.label}
              data-desk-gap={row.gap ? "1" : "0"}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                {row.label}
              </dt>
              <dd
                className={cn(
                  "text-right text-[13px] font-semibold",
                  row.gap ? "text-amber" : "text-fg",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <dl className="grok-frost grok-report-card rounded-[var(--radius-2xl)] px-4 py-3.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Specs
          </p>
          {specs.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 border-t border-white/10 py-2 first:border-t-0 first:pt-0"
              data-desk-row={row.label}
              data-desk-gap={row.gap ? "1" : "0"}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                {row.label}
              </dt>
              <dd
                className={cn(
                  "text-right text-[13px] font-semibold",
                  row.gap ? "text-amber" : "text-fg",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
