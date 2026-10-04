import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { DumpFeeLegend } from "@/components/rvtrips/DumpMap";
import { DUMP_FEE_LEGEND } from "@/lib/trips/dumpStations";
import {
  resolveMapPoi,
  type MapPoiDetail,
  type MapPoiStop,
} from "@/lib/trips/mapPoi";

export { resolveMapPoi, DumpFeeLegend };
export type { MapPoiDetail, MapPoiStop };

export function CampMapLegend() {
  return (
    <span data-camp-legend className="rv-map-key-group">
      <span className="rv-map-key-item">
        <span className="rv-map-dot rv-map-dot-camp rv-map-key-dot" aria-hidden />
        Camp
      </span>
      <span className="rv-map-key-item">
        <span className="rv-map-dot rv-map-dot-park rv-map-key-dot" aria-hidden />
        RV park
      </span>
    </span>
  );
}

function DumpMapKey() {
  const dotClass = {
    free: "rv-map-dot-dump-free",
    paid: "rv-map-dot-dump-paid",
    unknown: "rv-map-dot-dump-unknown",
  } as const;
  return (
    <span data-dump-legend className="rv-map-key-group">
      {DUMP_FEE_LEGEND.map((row) => (
        <span
          key={row.fee}
          className="rv-map-key-item"
          data-dump-legend-fee={row.fee}
        >
          <span
            className={cn("rv-map-dot rv-map-key-dot", dotClass[row.fee])}
            aria-hidden
          />
          {row.fee === "free"
            ? "Free dump"
            : row.fee === "paid"
              ? "Paid dump"
              : row.label}
        </span>
      ))}
    </span>
  );
}

/**
 * Quiet map key under the map — never a dark box over the route.
 * `overview` adds a short hint that camp/dump dots appear on zoom-in.
 */
export function RouteLayerLegend({
  showCamps,
  showDumps,
  overview = false,
  className,
}: {
  showCamps: boolean;
  showDumps: boolean;
  overview?: boolean;
  /** @deprecated kept for older call sites; the key is always below the map. */
  tone?: "light" | "on-map";
  className?: string;
}) {
  if (!showCamps && !showDumps) return null;
  return (
    <div
      data-route-layer-legend
      data-map-key-overview={overview ? "1" : "0"}
      className={cn("rv-map-key", className)}
    >
      {showCamps ? <CampMapLegend /> : null}
      {showDumps ? <DumpMapKey /> : null}
      {overview ? (
        <span className="rv-map-key-hint">Zoom in to see stops</span>
      ) : null}
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
      className="rv-map-card px-3.5 py-3"
    >
      <p className="rv-map-card-kicker">{poi.typeLabel}</p>
      <p className="rv-map-card-title mt-0.5">{poi.name}</p>
      {poi.meta ? <p className="rv-map-card-meta mt-0.5">{poi.meta}</p> : null}
      {onRouteVia ? (
        <button
          type="button"
          data-map-poi-route-via
          data-trip-btn="primary"
          disabled={viaDisabled}
          onClick={() => onRouteVia(poi.stop)}
          className="rv-trip-primary mt-2.5 flex min-h-10 w-full items-center justify-center gap-1.5 text-[13px]"
        >
          <Navigation className="size-3.5" />
          Route via
        </button>
      ) : null}
    </div>
  );
}
