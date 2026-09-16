import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { DumpFeeLegend } from "@/components/rvtrips/DumpMap";
import {
  resolveMapPoi,
  type MapPoiDetail,
  type MapPoiStop,
} from "@/lib/trips/mapPoi";

export { resolveMapPoi };
export type { MapPoiDetail, MapPoiStop };

export function CampMapLegend({
  tone = "light",
}: {
  tone?: "light" | "on-map";
}) {
  const label = tone === "on-map" ? "text-white" : "text-white/85";
  const head = tone === "on-map" ? "text-white/90" : "text-white/70";
  return (
    <div
      data-camp-legend
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1"
    >
      <span className={cn("text-[9px] font-extrabold tracking-[0.14em]", head)}>
        CAMPS
      </span>
      <span className="inline-flex items-center gap-1">
        <span
          className="rv-map-dot rv-map-dot-camp size-2"
          aria-hidden
        />
        <span className={cn("text-[10px] font-bold", label)}>Camp</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span
          className="rv-map-dot rv-map-dot-park size-2"
          aria-hidden
        />
        <span className={cn("text-[10px] font-bold", label)}>RV park</span>
      </span>
    </div>
  );
}

export function RouteLayerLegend({
  showCamps,
  showDumps,
  tone = "on-map",
  className,
}: {
  showCamps: boolean;
  showDumps: boolean;
  tone?: "light" | "on-map";
  className?: string;
}) {
  if (!showCamps && !showDumps) return null;
  return (
    <div
      data-route-layer-legend
      className={cn("space-y-1", className)}
    >
      {showCamps ? <CampMapLegend tone={tone} /> : null}
      {showDumps ? <DumpFeeLegend tone={tone} /> : null}
    </div>
  );
}

export function MapPoiDetailChip({
  poi,
  onRouteVia,
  viaDisabled,
}: {
  poi: MapPoiDetail;
  onRouteVia?: (stop: MapPoiStop) => void;
  viaDisabled?: boolean;
}) {
  return (
    <div
      data-map-poi-detail
      data-map-poi-layer={poi.layer}
      className="rounded-xl border border-white/18 bg-black/75 px-3 py-2.5 shadow-lg backdrop-blur-sm"
    >
      <p className="text-[10px] font-extrabold tracking-[0.14em] text-white/70">
        {poi.typeLabel.toUpperCase()}
      </p>
      <p className="mt-0.5 text-[13px] font-bold leading-snug text-white">
        {poi.name}
      </p>
      {poi.meta ? (
        <p className="mt-0.5 text-[11px] leading-snug text-white/80">
          {poi.meta}
        </p>
      ) : null}
      {onRouteVia ? (
        <button
          type="button"
          data-map-poi-route-via
          disabled={viaDisabled}
          onClick={() => onRouteVia(poi.stop)}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-blue text-[12px] font-bold text-white disabled:opacity-40"
        >
          <Navigation className="size-3.5" />
          Route via
        </button>
      ) : null}
    </div>
  );
}
