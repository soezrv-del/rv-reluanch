import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { OsrmLineString } from "@/lib/trips/osrm";
import type { FuelStop } from "@/lib/trips/corridorFuel";
import {
  attributionFor,
  bboxFromGeometry,
  bboxFromPoints,
  enumerateTiles,
  fillTileTemplate,
  finiteLngLat,
  fitTileView,
  geometryToOverlayPath,
  MAP_PROBE_PATH,
  mergeBboxes,
  nextProviderAfterTileFail,
  osmCatalog,
  OSM_TILE_TEMPLATE,
  pointToPixel,
  type BasemapLngLat,
  type BasemapPin,
  type TileCatalog,
  type TileProvider,
} from "@/lib/trips/basemap";

const MAP_H = 300;
const MAX_FUEL_PINS = 12;

function asPlace(
  p: { lat: number; lng: number; label?: string } | null | undefined,
): BasemapLngLat & { label?: string } | null {
  if (!p || !finiteLngLat(p)) return null;
  return { lat: p.lat, lng: p.lng, label: p.label };
}

export function RouteBasemap({
  geometry,
  origin,
  destination,
  vias,
  fuelStops,
  selectedFuelId,
  onSelectFuel,
}: {
  geometry: OsrmLineString | null | undefined;
  origin?: { lat: number; lng: number; label?: string } | null;
  destination?: { lat: number; lng: number; label?: string } | null;
  vias?: Array<{ lat: number; lng: number; label?: string } | null>;
  fuelStops?: FuelStop[];
  selectedFuelId?: string | null;
  onSelectFuel?: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  const [catalog, setCatalog] = useState<TileCatalog | null>(null);
  const [provider, setProvider] = useState<TileProvider>("svg");
  const failRef = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setW(Math.max(240, el.clientWidth));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(MAP_PROBE_PATH, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const json = (await res.json()) as TileCatalog;
        if (cancelled) return;
        if (json?.tileTemplate && (json.provider === "here" || json.provider === "osm")) {
          setCatalog(json);
          setProvider(json.provider);
          failRef.current = 0;
          return;
        }
        const osm = osmCatalog();
        setCatalog(osm);
        setProvider("osm");
      })
      .catch(() => {
        if (cancelled) return;
        const osm = osmCatalog();
        setCatalog(osm);
        setProvider("osm");
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  const originPt = useMemo(() => asPlace(origin), [origin]);
  const destPt = useMemo(() => asPlace(destination), [destination]);
  const viaPts = useMemo(
    () => (vias ?? []).map(asPlace).filter((p): p is NonNullable<typeof p> => !!p),
    [vias],
  );

  const box = useMemo(() => {
    return mergeBboxes(
      bboxFromGeometry(geometry),
      bboxFromPoints(
        [originPt, destPt, ...viaPts].filter((p): p is NonNullable<typeof p> => !!p),
      ),
    );
  }, [geometry, originPt, destPt, viaPts]);

  const view = useMemo(() => {
    if (!box) return null;
    return fitTileView(box, w, MAP_H);
  }, [box, w]);

  const tiles = useMemo(() => {
    if (!view || provider === "svg") return [];
    const template =
      provider === "here"
        ? catalog?.tileTemplate || "/api/map-tiles?z={z}&x={x}&y={y}"
        : catalog?.provider === "osm"
          ? catalog.tileTemplate
          : OSM_TILE_TEMPLATE;
    return enumerateTiles(view).map((t) => ({
      ...t,
      src: fillTileTemplate(template, t.z, t.x, t.y),
    }));
  }, [view, provider, catalog]);

  const overlay = useMemo(
    () => (view ? geometryToOverlayPath(geometry, view) : null),
    [geometry, view],
  );

  const pins = useMemo(() => {
    if (!view) return [];
    const rows: Array<BasemapPin & { left: number; top: number }> = [];
    const push = (pin: BasemapPin) => {
      const px = pointToPixel(pin.lat, pin.lng, view);
      rows.push({ ...pin, ...px });
    };
    if (originPt) {
      push({
        id: "origin",
        kind: "origin",
        lat: originPt.lat,
        lng: originPt.lng,
        label: originPt.label || "Start",
      });
    }
    viaPts.forEach((v, i) => {
      push({
        id: `via-${i}`,
        kind: "via",
        lat: v.lat,
        lng: v.lng,
        label: v.label || `Stop ${i + 1}`,
      });
    });
    if (destPt) {
      push({
        id: "dest",
        kind: "dest",
        lat: destPt.lat,
        lng: destPt.lng,
        label: destPt.label || "End",
      });
    }
    for (const s of (fuelStops ?? []).slice(0, MAX_FUEL_PINS)) {
      if (!finiteLngLat(s)) continue;
      push({
        id: s.id,
        kind: s.kind === "truck-stop" ? "truck-stop" : "fuel",
        lat: s.lat,
        lng: s.lng,
        label: s.name,
      });
    }
    return rows;
  }, [view, originPt, destPt, viaPts, fuelStops]);

  const onTileError = () => {
    failRef.current += 1;
    if (failRef.current < 3) return;
    const next = nextProviderAfterTileFail(provider);
    if (next === provider) return;
    if (next === "osm") setCatalog(osmCatalog("OpenStreetMap — HERE tiles failed to load"));
    setProvider(next);
    failRef.current = 0;
  };

  const sourceLabel = !catalog
    ? "Loading map…"
    : provider === "here"
      ? catalog.attribution || attributionFor("here")
      : provider === "osm"
        ? catalog.attribution || attributionFor("osm")
        : attributionFor("svg");

  if (!overlay && !geometry?.coordinates?.length) return null;

  return (
    <div
      ref={wrapRef}
      data-route-basemap
      data-tile-source={catalog ? provider : "pending"}
      className="relative overflow-hidden rounded-xl border border-white/12 bg-[#0b1410]"
      style={{ height: MAP_H }}
    >
      {tiles.length > 0 ? (
        <div className="absolute inset-0">
          {tiles.map((t) => (
            <img
              key={t.key}
              src={t.src}
              alt=""
              draggable={false}
              onError={onTileError}
              className="pointer-events-none absolute size-[256px] max-w-none"
              style={{ left: t.left, top: t.top }}
            />
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

      {view && overlay ? (
        <svg
          width={w}
          height={MAP_H}
          viewBox={`0 0 ${w} ${MAP_H}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          role="img"
          aria-label="Live route line"
        >
          <path
            d={overlay}
            fill="none"
            stroke="rgba(8,16,20,0.55)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={overlay}
            fill="none"
            className="stroke-blue"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}

      {pins.map((p) => {
        const fuel = p.kind === "fuel" || p.kind === "truck-stop";
        const on = fuel && p.id === selectedFuelId;
        if (fuel) {
          return (
            <button
              key={p.id}
              type="button"
              title={p.label}
              onClick={() => onSelectFuel?.(on ? "" : p.id)}
              className={cn(
                "absolute z-[3] flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
                on ? "z-[4]" : "",
              )}
              style={{ left: p.left, top: p.top }}
            >
              <span
                className={cn(
                  "size-2.5 rounded-full border border-white/90 shadow",
                  p.kind === "truck-stop" ? "bg-amber" : "bg-white/85",
                  on && "size-3.5 bg-amber",
                )}
              />
            </button>
          );
        }
        const viaNum = p.kind === "via" ? p.id.replace("via-", "") : "";
        const mark =
          p.kind === "origin" ? "A" : p.kind === "dest" ? "B" : String(Number(viaNum) + 1);
        return (
          <span
            key={p.id}
            title={p.label}
            className={cn(
              "pointer-events-none absolute z-[4] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white text-[10px] font-bold text-white shadow-lg",
              p.kind === "origin" && "bg-emerald-600",
              p.kind === "dest" && "bg-ruby",
              p.kind === "via" && "bg-amber text-black",
            )}
            style={{ left: p.left, top: p.top }}
          >
            {mark}
          </span>
        );
      })}

      <p
        data-tile-note
        className="absolute bottom-1 right-2 z-[5] rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/85"
      >
        {sourceLabel}
      </p>
    </div>
  );
}
