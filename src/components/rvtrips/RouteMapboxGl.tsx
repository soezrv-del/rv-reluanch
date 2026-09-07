import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { OsrmLineString } from "@/lib/trips/osrm";
import type { FuelStop } from "@/lib/trips/corridorFuel";
import type { CampStop } from "@/lib/trips/corridorCamps";
import {
  bboxFromGeometry,
  bboxFromPoints,
  finiteLngLat,
  MAP_PANEL_H,
  mergeBboxes,
  type BasemapLngLat,
  type BasemapPin,
} from "@/lib/trips/basemap";
import {
  mapboxStyleUrl,
  type MapboxStyleId,
} from "@/lib/trips/mapbox";
import {
  shouldRecenterFollow,
  type FollowStatus,
  type GeoFix,
} from "@/lib/trips/geoFollow";

const MAX_FUEL_PINS = 12;
const MAX_CAMP_PINS = 10;
const ROUTE_SRC = "rv-route";
const ROUTE_CASING = "rv-route-casing";
const ROUTE_LINE = "rv-route-line";

type MapboxNS = typeof import("mapbox-gl");
type MapboxMap = import("mapbox-gl").Map;
type MapboxMarker = import("mapbox-gl").Marker;

function asPlace(
  p: { lat: number; lng: number; label?: string } | null | undefined,
): BasemapLngLat & { label?: string } | null {
  if (!p || !finiteLngLat(p)) return null;
  return { lat: p.lat, lng: p.lng, label: p.label };
}

function pinMark(pin: BasemapPin): string {
  if (pin.kind === "origin") return "A";
  if (pin.kind === "dest") return "B";
  if (pin.kind === "via") {
    const n = Number(pin.id.replace("via-", ""));
    return String(Number.isFinite(n) ? n + 1 : 1);
  }
  return "";
}

function pinClass(kind: BasemapPin["kind"], on: boolean): string {
  if (kind === "origin") return "rv-map-pin rv-map-pin-origin";
  if (kind === "dest") return "rv-map-pin rv-map-pin-dest";
  if (kind === "via") return "rv-map-pin rv-map-pin-via";
  if (kind === "truck-stop") {
    return cn("rv-map-dot rv-map-dot-truck", on && "rv-map-dot-on");
  }
  if (kind === "fuel") {
    return cn("rv-map-dot rv-map-dot-fuel", on && "rv-map-dot-on");
  }
  if (kind === "rv-park") {
    return cn("rv-map-dot rv-map-dot-park", on && "rv-map-dot-on");
  }
  return cn("rv-map-dot rv-map-dot-camp", on && "rv-map-dot-on");
}

function geometryCoords(
  geometry: OsrmLineString | null | undefined,
): [number, number][] {
  const raw = geometry?.coordinates;
  if (!raw?.length) return [];
  return raw.filter(
    (c): c is [number, number] =>
      Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]),
  );
}

function paintRoute(map: MapboxMap, coords: [number, number][]) {
  const data = {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: coords },
  };
  const src = map.getSource(ROUTE_SRC) as
    | { setData?: (d: unknown) => void }
    | undefined;
  if (src?.setData) {
    src.setData(data);
    return;
  }
  if (map.getLayer(ROUTE_LINE)) map.removeLayer(ROUTE_LINE);
  if (map.getLayer(ROUTE_CASING)) map.removeLayer(ROUTE_CASING);
  if (map.getSource(ROUTE_SRC)) map.removeSource(ROUTE_SRC);
  if (coords.length < 2) return;
  map.addSource(ROUTE_SRC, { type: "geojson", data });
  map.addLayer({
    id: ROUTE_CASING,
    type: "line",
    source: ROUTE_SRC,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#0b1a28",
      "line-width": 8,
      "line-opacity": 0.55,
    },
  });
  map.addLayer({
    id: ROUTE_LINE,
    type: "line",
    source: ROUTE_SRC,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#4a86f0",
      "line-width": 4.5,
      "line-opacity": 1,
    },
  });
}

export function RouteMapboxGl({
  token,
  geometry,
  origin,
  destination,
  vias,
  fuelStops,
  selectedFuelId,
  onSelectFuel,
  campStops,
  selectedCampId,
  onSelectCamp,
  follow,
  followActive,
  followStatus = "off",
  onUnavailable,
}: {
  token: string;
  geometry: OsrmLineString | null | undefined;
  origin?: { lat: number; lng: number; label?: string } | null;
  destination?: { lat: number; lng: number; label?: string } | null;
  vias?: Array<{ lat: number; lng: number; label?: string } | null>;
  fuelStops?: FuelStop[];
  selectedFuelId?: string | null;
  onSelectFuel?: (id: string) => void;
  campStops?: CampStop[];
  selectedCampId?: string | null;
  onSelectCamp?: (id: string) => void;
  follow?: Pick<GeoFix, "lat" | "lng" | "heading"> | null;
  followActive?: boolean;
  followStatus?: FollowStatus;
  onUnavailable: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mbRef = useRef<MapboxNS | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const puckRef = useRef<MapboxMarker | null>(null);
  const lastRecenterRef = useRef(0);
  const followCenterRef = useRef<BasemapLngLat | null>(null);
  const [ready, setReady] = useState(false);
  const [styleId, setStyleId] = useState<MapboxStyleId>("streets");
  const styleIdRef = useRef<MapboxStyleId>("streets");
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  const originPt = useMemo(() => asPlace(origin), [origin]);
  const destPt = useMemo(() => asPlace(destination), [destination]);
  const viaPts = useMemo(
    () => (vias ?? []).map(asPlace).filter((p): p is NonNullable<typeof p> => !!p),
    [vias],
  );
  const coords = useMemo(() => geometryCoords(geometry), [geometry]);

  const pins = useMemo(() => {
    const rows: BasemapPin[] = [];
    if (originPt) {
      rows.push({
        id: "origin",
        kind: "origin",
        lat: originPt.lat,
        lng: originPt.lng,
        label: originPt.label || "Start",
      });
    }
    viaPts.forEach((v, i) => {
      rows.push({
        id: `via-${i}`,
        kind: "via",
        lat: v.lat,
        lng: v.lng,
        label: v.label || `Stop ${i + 1}`,
      });
    });
    if (destPt) {
      rows.push({
        id: "dest",
        kind: "dest",
        lat: destPt.lat,
        lng: destPt.lng,
        label: destPt.label || "End",
      });
    }
    for (const s of (fuelStops ?? []).slice(0, MAX_FUEL_PINS)) {
      if (!finiteLngLat(s)) continue;
      rows.push({
        id: s.id,
        kind: s.kind === "truck-stop" ? "truck-stop" : "fuel",
        lat: s.lat,
        lng: s.lng,
        label: s.name,
      });
    }
    for (const s of (campStops ?? []).slice(0, MAX_CAMP_PINS)) {
      if (!finiteLngLat(s)) continue;
      rows.push({
        id: s.id,
        kind: s.kind === "rv-park" ? "rv-park" : "campground",
        lat: s.lat,
        lng: s.lng,
        label: s.name,
      });
    }
    return rows;
  }, [originPt, destPt, viaPts, fuelStops, campStops]);

  const followPt = useMemo(() => {
    if (!followActive || !follow || !finiteLngLat(follow)) return null;
    return follow;
  }, [followActive, follow]);

  const box = useMemo(
    () =>
      mergeBboxes(
        bboxFromGeometry(geometry),
        bboxFromPoints(
          [originPt, destPt, ...viaPts].filter(
            (p): p is NonNullable<typeof p> => !!p,
          ),
        ),
      ),
    [geometry, originPt, destPt, viaPts],
  );

  useEffect(() => {
    styleIdRef.current = styleId;
  }, [styleId]);

  useEffect(() => {
    const el = mapElRef.current;
    if (!el || !token.startsWith("pk.")) {
      onUnavailableRef.current();
      return;
    }
    let cancelled = false;
    let map: MapboxMap | null = null;
    let removeResize: (() => void) | undefined;

    void (async () => {
      try {
        const mb = await import("mapbox-gl");
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled) return;
        const mapboxgl = mb.default;
        if (!mapboxgl.supported?.()) {
          onUnavailableRef.current();
          return;
        }
        mapboxgl.accessToken = token;
        mbRef.current = mb;
        const coarse =
          typeof window !== "undefined" &&
          window.matchMedia?.("(pointer: coarse)")?.matches;
        map = new mapboxgl.Map({
          container: el,
          style: mapboxStyleUrl(styleIdRef.current),
          attributionControl: true,
          logoPosition: "bottom-left",
          cooperativeGestures: !coarse,
          fadeDuration: 0,
          pitchWithRotate: false,
        });
        mapRef.current = map;
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }),
          "top-right",
        );
        const onLoad = () => {
          if (cancelled) return;
          paintRoute(map!, geometryCoords(geometry));
          setReady(true);
        };
        map.on("load", onLoad);
        map.on("error", (ev) => {
          const err = ev?.error as { status?: number; message?: string } | undefined;
          if (err?.status === 401 || err?.status === 403) {
            onUnavailableRef.current();
          }
        });
        const wrap = wrapRef.current;
        if (wrap && typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(() => map?.resize());
          ro.observe(wrap);
          removeResize = () => ro.disconnect();
        }
      } catch {
        if (!cancelled) onUnavailableRef.current();
      }
    })();

    return () => {
      cancelled = true;
      removeResize?.();
      puckRef.current?.remove();
      puckRef.current = null;
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // Token / container lifetime only — style + data sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const lastStyleRef = useRef<MapboxStyleId>("streets");
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (lastStyleRef.current === styleId) return;
    lastStyleRef.current = styleId;
    const apply = () => paintRoute(map, coords);
    map.once("style.load", apply);
    try {
      map.setStyle(mapboxStyleUrl(styleId));
    } catch {
      onUnavailableRef.current();
    }
  }, [styleId, ready, coords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    try {
      paintRoute(map, coords);
    } catch {
      /* style may be swapping */
    }
  }, [coords, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const mb = mbRef.current;
    if (!map || !ready || !mb) return;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];
    const mapboxgl = mb.default;
    for (const pin of pins) {
      const fuel = pin.kind === "fuel" || pin.kind === "truck-stop";
      const camp = pin.kind === "campground" || pin.kind === "rv-park";
      const on =
        (fuel && pin.id === selectedFuelId) ||
        (camp && pin.id === selectedCampId);
      const node = document.createElement(fuel || camp ? "button" : "span");
      if (node instanceof HTMLButtonElement) node.type = "button";
      node.className = pinClass(pin.kind, on);
      node.title = pin.label || pin.kind;
      node.textContent = pinMark(pin);
      if (fuel || camp) {
        node.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (fuel) onSelectFuel?.(on ? "" : pin.id);
          else onSelectCamp?.(on ? "" : pin.id);
        });
      }
      const marker = new mapboxgl.Marker({ element: node, anchor: "bottom" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [pins, ready, selectedFuelId, selectedCampId, onSelectFuel, onSelectCamp]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || followActive) return;
    if (!box || !Number.isFinite(box.minLng)) return;
    try {
      map.fitBounds(
        [
          [box.minLng, box.minLat],
          [box.maxLng, box.maxLat],
        ],
        { padding: 56, maxZoom: 12, duration: 700, essential: true },
      );
    } catch {
      /* empty bounds */
    }
  }, [box, ready, followActive, coords.length]);

  useEffect(() => {
    const map = mapRef.current;
    const mb = mbRef.current;
    if (!map || !ready || !mb) return;
    if (!followPt) {
      puckRef.current?.remove();
      puckRef.current = null;
      followCenterRef.current = null;
      lastRecenterRef.current = 0;
      return;
    }
    const mapboxgl = mb.default;
    if (!puckRef.current) {
      const node = document.createElement("div");
      node.setAttribute("data-follow-puck", "");
      node.className = "rv-map-puck";
      node.title = "Your location";
      puckRef.current = new mapboxgl.Marker({ element: node, anchor: "center" })
        .setLngLat([followPt.lng, followPt.lat])
        .addTo(map);
    } else {
      puckRef.current.setLngLat([followPt.lng, followPt.lat]);
    }
    const el = puckRef.current.getElement();
    if (followPt.heading != null) {
      el.style.setProperty("--puck-heading", `${followPt.heading}deg`);
      el.setAttribute("data-follow-heading", "");
    } else {
      el.style.removeProperty("--puck-heading");
      el.removeAttribute("data-follow-heading");
    }
    const now = Date.now();
    if (
      shouldRecenterFollow(
        followCenterRef.current,
        followPt,
        lastRecenterRef.current,
        now,
      )
    ) {
      lastRecenterRef.current = now;
      followCenterRef.current = { lat: followPt.lat, lng: followPt.lng };
      map.easeTo({
        center: [followPt.lng, followPt.lat],
        zoom: Math.max(map.getZoom(), 13),
        bearing: followPt.heading ?? map.getBearing(),
        duration: 650,
        essential: true,
      });
    }
  }, [followPt, ready]);

  const status: FollowStatus =
    followStatus !== "off"
      ? followStatus
      : !followActive
        ? "off"
        : followPt
          ? "live"
          : "waiting";

  return (
    <div
      ref={wrapRef}
      data-route-basemap
      data-tile-source="mapbox"
      data-map-engine="mapbox-gl"
      data-follow-status={status}
      className="relative z-0 isolate overflow-hidden rounded-xl border border-white/12 bg-[#0b1410]"
      style={{ height: MAP_PANEL_H }}
    >
      <div
        ref={mapElRef}
        data-mapbox-canvas-host
        className="absolute inset-0 overflow-hidden"
      />

      <div className="absolute right-2 top-12 z-[6] flex gap-1">
        <button
          type="button"
          data-map-style="streets"
          onClick={() => setStyleId("streets")}
          className={cn(
            "min-h-9 rounded-full px-2.5 text-[10px] font-bold",
            styleId === "streets"
              ? "bg-white text-black"
              : "bg-black/55 text-white/90",
          )}
        >
          Streets
        </button>
        <button
          type="button"
          data-map-style="satellite"
          onClick={() => setStyleId("satellite")}
          className={cn(
            "min-h-9 rounded-full px-2.5 text-[10px] font-bold",
            styleId === "satellite"
              ? "bg-white text-black"
              : "bg-black/55 text-white/90",
          )}
        >
          Satellite
        </button>
      </div>

      {followActive ? (
        <p
          data-follow-chip
          className={cn(
            "absolute left-2 top-2 z-[6] rounded-full px-2 py-1 text-[10px] font-bold",
            status === "live" && "bg-blue/90 text-black",
            status === "denied" && "bg-amber text-black",
            (status === "waiting" || status === "off") &&
              "bg-black/55 text-white/85",
          )}
        >
          {status === "live"
            ? "GPS follow"
            : status === "denied"
              ? "Location denied"
              : "Finding GPS…"}
        </p>
      ) : null}

      <p
        data-tile-note
        className="pointer-events-none absolute bottom-6 right-2 z-[5] rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/85"
      >
        © Mapbox · streets
      </p>
    </div>
  );
}
