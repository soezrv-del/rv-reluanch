import { ExternalLink, Navigation, Tent } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  campMapsUrl,
  type CampSearchResult,
  type CampStop,
} from "@/lib/trips/corridorCamps";

export function CampsAlongRoute({
  status,
  result,
  selectedId,
  onSelect,
  onRouteVia,
  viaDisabled,
  limit = 10,
  heading = "CAMPS ALONG ROUTE",
}: {
  status: "idle" | "loading" | "live" | "error";
  result: CampSearchResult | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRouteVia: (camp: CampStop) => void;
  viaDisabled?: boolean;
  limit?: number;
  heading?: string;
}) {
  if (status === "idle") return null;

  const camps = result?.camps ?? [];
  const source = result?.sourceLabel ?? "";

  return (
    <section
      className="space-y-2"
      data-camps-along-route
      data-camps-source={result?.source || ""}
    >
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-[12px] font-bold tracking-[0.12em] text-white">
          {heading}
        </h3>
        {status === "live" ? (
          <span className="text-[11px] font-semibold text-white/70">
            {camps.length} site{camps.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {status === "loading" ? (
        <p className="text-[13px] text-white/80">
          Finding campgrounds on this corridor…
        </p>
      ) : null}

      {status === "error" || (status === "live" && camps.length === 0) ? (
        <p className="text-[13px] leading-snug text-white/80">
          {result?.error
            ? result.error
            : `No ${source || "live"} campgrounds on this corridor.`}
        </p>
      ) : null}

      {status === "live" && camps.length > 0 ? (
        <div className="space-y-2">
          {camps.slice(0, limit).map((c) => {
            const on = c.id === selectedId;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border bg-black/30 px-3 py-2.5",
                  on ? "border-emerald-400/50" : "border-white/12",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(on ? "" : c.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <Tent
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      c.kind === "rv-park" ? "text-emerald-300" : "text-white/80",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-snug text-white">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/75">
                      {c.kind === "rv-park" ? "RV park" : "Campground"}
                      {c.nearDest ? " · near dest" : ""}
                      {c.city
                        ? ` · ${c.city}${c.state ? `, ${c.state}` : ""}`
                        : ""}
                      {` · ${c.milesOff < 10 ? c.milesOff.toFixed(1) : Math.round(c.milesOff)} mi off`}
                      {c.amenityHint ? ` · ${c.amenityHint}` : ""}
                    </span>
                  </span>
                </button>
                {on ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={viaDisabled}
                      onClick={() => onRouteVia(c)}
                      className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue text-[12px] font-bold text-white disabled:opacity-40"
                    >
                      <Navigation className="size-3.5" />
                      Route via
                    </button>
                    <a
                      href={campMapsUrl(c)}
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
