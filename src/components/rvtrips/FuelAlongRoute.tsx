import { ExternalLink, Fuel, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fuelMapsUrl,
  type FuelSearchResult,
  type FuelStop,
} from "@/lib/trips/corridorFuel";

export function FuelAlongRoute({
  status,
  result,
  selectedId,
  onSelect,
  onRouteVia,
  viaDisabled,
}: {
  status: "idle" | "loading" | "live" | "error";
  result: FuelSearchResult | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRouteVia: (stop: FuelStop) => void;
  viaDisabled?: boolean;
}) {
  if (status === "idle") return null;

  const stops = result?.stops ?? [];
  const source = result?.sourceLabel ?? "";

  return (
    <section className="space-y-2" data-fuel-along-route data-fuel-source={result?.source || ""}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-[12px] font-bold tracking-[0.12em] text-white">
          FUEL ALONG ROUTE
        </h3>
        {status === "live" ? (
          <span className="text-[11px] font-semibold text-white/70">
            {stops.length} stop{stops.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {status === "loading" ? (
        <p className="text-[13px] text-white/80">Finding fuel on this corridor…</p>
      ) : null}

      {status === "error" || (status === "live" && stops.length === 0) ? (
        <p className="text-[13px] leading-snug text-white/80">
          {result?.error
            ? result.error
            : `No ${source || "live"} fuel or truck stops on this corridor.`}
        </p>
      ) : null}

      {status === "live" && stops.length > 0 ? (
        <div className="space-y-2">
          {stops.slice(0, 10).map((s) => {
            const on = s.id === selectedId;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border bg-black/30 px-3 py-2.5",
                  on ? "border-amber/50" : "border-white/12",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(on ? "" : s.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <Fuel
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      s.kind === "truck-stop" ? "text-amber" : "text-white/80",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-snug text-white">
                      {s.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/75">
                      {s.kind === "truck-stop" ? "Truck stop" : "Fuel"}
                      {s.city
                        ? ` · ${s.city}${s.state ? `, ${s.state}` : ""}`
                        : ""}
                      {` · ${s.milesOff < 10 ? s.milesOff.toFixed(1) : Math.round(s.milesOff)} mi off`}
                    </span>
                  </span>
                </button>
                {on ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={viaDisabled}
                      onClick={() => onRouteVia(s)}
                      className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue text-[12px] font-bold text-white disabled:opacity-40"
                    >
                      <Navigation className="size-3.5" />
                      Route via
                    </button>
                    <a
                      href={fuelMapsUrl(s)}
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
        <p className="text-[11px] leading-snug text-white/65">{result.sourceNote}</p>
      ) : null}
    </section>
  );
}
