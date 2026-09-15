import { useEffect, useState } from "react";
import { ChevronDown, Droplets, ExternalLink, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { DumpFeeLegend } from "@/components/rvtrips/DumpMap";
import {
  dumpMapsUrl,
  type DumpSearchResult,
  type DumpStop,
} from "@/lib/trips/corridorDumps";
import type { DumpFee } from "@/lib/trips/dumpStations";

function feeChipClass(fee: DumpFee): string {
  if (fee === "free") return "border-emerald-400/50 bg-emerald-500/20 text-emerald-200";
  if (fee === "paid") return "border-amber/50 bg-amber/20 text-amber";
  return "border-white/20 bg-white/10 text-white/75";
}

export function DumpsAlongRoute({
  status,
  result,
  selectedId,
  onSelect,
  onRouteVia,
  viaDisabled,
  limit = 10,
}: {
  status: "idle" | "loading" | "live" | "error";
  result: DumpSearchResult | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRouteVia: (dump: DumpStop) => void;
  viaDisabled?: boolean;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedId) setOpen(true);
  }, [selectedId]);

  if (status === "idle") return null;

  const dumps = result?.dumps ?? [];
  const source = result?.sourceLabel ?? "";
  const count =
    status === "live"
      ? `${dumps.length} dump${dumps.length === 1 ? "" : "s"}`
      : status === "loading"
        ? "…"
        : "";

  return (
    <section
      className="space-y-2"
      data-dumps-along-route
      data-dumps-source={result?.source || ""}
      data-along-open={open ? "1" : "0"}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center gap-2 text-left"
      >
        <h3 className="min-w-0 flex-1 text-[12px] font-bold tracking-[0.12em] text-white">
          DUMPS ALONG ROUTE
        </h3>
        {count ? (
          <span className="shrink-0 text-[11px] font-semibold text-white/70">
            {count}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/55 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          {status === "live" && dumps.length > 0 ? (
            <DumpFeeLegend className="rounded-lg border border-white/12 bg-black/30 px-2.5 py-1.5" />
          ) : null}

          {status === "loading" ? (
            <p className="text-[13px] text-white/80">
              Finding sewer dumps on this corridor…
            </p>
          ) : null}

          {status === "error" || (status === "live" && dumps.length === 0) ? (
            <p className="text-[13px] leading-snug text-white/80">
              {result?.error
                ? result.error
                : `No ${source || "live"} dump stations on this corridor.`}
            </p>
          ) : null}

          {status === "live" && dumps.length > 0 ? (
            <div className="space-y-2">
              {dumps.slice(0, limit).map((d) => {
                const on = d.id === selectedId;
                return (
                  <div
                    key={d.id}
                    data-dump-fee={d.fee}
                    className={cn(
                      "rounded-xl border bg-black/30 px-3 py-2.5",
                      on ? "border-emerald-400/50" : "border-white/12",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(on ? "" : d.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <Droplets
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          d.fee === "free" && "text-emerald-300",
                          d.fee === "paid" && "text-amber",
                          d.fee === "unknown" && "text-white/55",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-bold leading-snug text-white">
                            {d.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-1.5 py-px text-[9px] font-bold",
                              feeChipClass(d.fee),
                            )}
                          >
                            {d.feeLabel}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-white/75">
                          {d.nearDest ? "near dest · " : ""}
                          {d.city
                            ? `${d.city}${d.state ? `, ${d.state}` : ""} · `
                            : ""}
                          {`${d.milesOff < 10 ? d.milesOff.toFixed(1) : Math.round(d.milesOff)} mi off`}
                        </span>
                      </span>
                    </button>
                    {on ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          disabled={viaDisabled}
                          onClick={() => onRouteVia(d)}
                          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue text-[12px] font-bold text-white disabled:opacity-40"
                        >
                          <Navigation className="size-3.5" />
                          Route via
                        </button>
                        <a
                          href={dumpMapsUrl(d)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-black/35 text-[12px] font-bold text-white"
                        >
                          <ExternalLink className="size-3.5" />
                          Maps
                        </a>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {result?.sourceNote ? (
            <p className="text-[11px] leading-snug text-white/65">
              {result.sourceNote}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
