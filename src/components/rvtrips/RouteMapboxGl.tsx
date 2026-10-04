import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { OsrmLineString } from "@/lib/trips/osrm";
import type { FuelStop } from "@/lib/trips/corridorFuel";
import type { CampStop } from "@/lib/trips/corridorCamps";
import { dumpPinKind, type DumpStop } from "@/lib/trips/corridorDumps";
import {
  MapPoiDetailChip,
  RouteLayerLegend,
  resolveMapPoi,
  type MapPoiStop,
} from "@/components/rvtrips/RoutePoiChrome";
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
  isStandardStyle,
  mapboxStandardConfig,
  mapboxStyleUrl,
  standardLightPreset,
  type MapboxStyleId,
} from "@/lib/trips/mapbox";
import {
  readTheme,
  serverTheme,
  subscribeTheme,
  type SuiteTheme,
} from "@/lib/theme";
import {
  shouldRecenterFollow,
  type FollowStatus,
  type GeoFix,
} from "@/lib/trips/geoFollow";
import {
  cameraChanged,
  navCameraFor,
  splitRouteAtFix,
  type NavCamera,
} from "@/lib/trips/navMode";

const MAX_FUEL_PINS = 12;
const MAX_CAMP_PINS = 10;
const MAX_DUMP_PINS = 12;
const ROUTE_SRC = "rv-route";
const ROUTE_CASING = "rv-route-casing";
const ROUTE_LINE = "rv-route-line";
/** Nav mode only: the part already driven, drawn under the remaining line. */
const ROUTE_TRAVELED_SRC = "rv-route-traveled";
const ROUTE_TRAVELED = "rv-route-traveled-line";

/** Plain (non-nav) route paint — restored when nav mode ends. */
const PLAIN_ROUTE = {
  casing: { color: "#0b1a28", width: 8, opacity: 0.55 },
  line: { color: "#4a86f0", width: 4.5 },
};
/** Nav route paint. Light: soft blue. Dark: sapphire. No gold / aqua. */
function navRoutePaint(theme: SuiteTheme) {
  return {
    casing: { color: "#ffffff", width: 13, opacity: 0.92 },
    line: { color: theme === "dark" ? "#1648c8" : "#3e6ae1", width: 8.5 },
    traveled: theme === "dark" ? "#5b6577" : "#a3acb9",
  };
}

/** What RvTripsApp hands the map while Turn-by-Turn is armed. */
export type RouteNavView = {
  /** Distance to the next maneuver along the route (m). */
  remainToManeuverM: number | null;
  speedMps: number | null;
  /** Banner / speed / ETA chrome drawn over the full-screen map. */
  overlay: ReactNode;
};

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
  if (kind === "dump-free") {
    return cn("rv-map-dot rv-map-dot-dump-free", on && "rv-map-dot-on");
  }
  if (kind === "dump-paid") {
    return cn("rv-map-dot rv-map-dot-dump-paid", on && "rv-map-dot-on");
  }
  if (kind === "dump-unknown") {
    return cn("rv-map-dot rv-map-dot-dump-unknown", on && "rv-map-dot-on");
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

/** Push the app theme + restrained look into Standard's `basemap` import. */
function applyStandardConfig(map: MapboxMap, theme: SuiteTheme) {
  for (const [key, value] of Object.entries(mapboxStandardConfig(theme))) {
    try {
      map.setConfigProperty("basemap", key, value);
    } catch {
      /* style may be swapping */
    }
  }
}

/**
 * Route casing + line. On Standard they go in the `top` slot (above 3D
 * buildings and basemap labels) with full emissive strength so night
 * lighting doesn't dim them. Classic satellite has no slots — plain add.
 */
function paintRoute(
  map: MapboxMap,
  coords: [number, number][],
  standard: boolean,
) {
  if (map.getLayer(ROUTE_TRAVELED)) map.removeLayer(ROUTE_TRAVELED);
  if (map.getSource(ROUTE_TRAVELED_SRC)) map.removeSource(ROUTE_TRAVELED_SRC);
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
  const slot = standard ? { slot: "top" } : {};
  const glow = standard ? { "line-emissive-strength": 1 } : {};
  map.addLayer({
    id: ROUTE_CASING,
    type: "line",
    source: ROUTE_SRC,
    ...slot,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": PLAIN_ROUTE.casing.color,
      "line-width": PLAIN_ROUTE.casing.width,
      "line-opacity": PLAIN_ROUTE.casing.opacity,
      ...glow,
    },
  });
  map.addLayer({
    id: ROUTE_LINE,
    type: "line",
    source: ROUTE_SRC,
    ...slot,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": PLAIN_ROUTE.line.color,
      "line-width": PLAIN_ROUTE.line.width,
      "line-opacity": 1,
      ...glow,
    },
  });
}

function lineFeature(coords: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: coords },
  };
}

/**
 * Nav mode: remaining line in nav blue over a grey traveled line, both in
 * the same slot as the plain route. `split` null = whole route remaining.
 */
function paintNavRoute(
  map: MapboxMap,
  coords: [number, number][],
  split: { traveled: [number, number][]; remaining: [number, number][] } | null,
  standard: boolean,
  theme: SuiteTheme,
) {
  if (!map.getSource(ROUTE_SRC) || !map.getLayer(ROUTE_LINE)) return;
  const paint = navRoutePaint(theme);
  const remaining = split?.remaining ?? coords;
  const traveled = split?.traveled ?? [];
  (map.getSource(ROUTE_SRC) as { setData?: (d: unknown) => void }).setData?.(
    lineFeature(remaining),
  );
  map.setPaintProperty(ROUTE_CASING, "line-color", paint.casing.color);
  map.setPaintProperty(ROUTE_CASING, "line-width", paint.casing.width);
  map.setPaintProperty(ROUTE_CASING, "line-opacity", paint.casing.opacity);
  map.setPaintProperty(ROUTE_LINE, "line-color", paint.line.color);
  map.setPaintProperty(ROUTE_LINE, "line-width", paint.line.width);
  const src = map.getSource(ROUTE_TRAVELED_SRC) as
    | { setData?: (d: unknown) => void }
    | undefined;
  if (src?.setData) {
    src.setData(lineFeature(traveled));
  } else {
    map.addSource(ROUTE_TRAVELED_SRC, { type: "geojson", data: lineFeature(traveled) });
    map.addLayer(
      {
        id: ROUTE_TRAVELED,
        type: "line",
        source: ROUTE_TRAVELED_SRC,
        ...(standard ? { slot: "top" } : {}),
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": paint.traveled,
          "line-width": 7,
          "line-opacity": 0.9,
          ...(standard ? { "line-emissive-strength": 1 } : {}),
        },
      },
      ROUTE_CASING,
    );
  }
  map.setPaintProperty(ROUTE_TRAVELED, "line-color", paint.traveled);
}

/** Back to the plain preview line (full route, original colors). */
function clearNavRoute(map: MapboxMap, coords: [number, number][], standard: boolean) {
  if (map.getLayer(ROUTE_TRAVELED)) map.removeLayer(ROUTE_TRAVELED);
  if (map.getSource(ROUTE_TRAVELED_SRC)) map.removeSource(ROUTE_TRAVELED_SRC);
  if (!map.getLayer(ROUTE_LINE)) {
    paintRoute(map, coords, standard);
    return;
  }
  (map.getSource(ROUTE_SRC) as { setData?: (d: unknown) => void }).setData?.(
    lineFeature(coords),
  );
  map.setPaintProperty(ROUTE_CASING, "line-color", PLAIN_ROUTE.casing.color);
  map.setPaintProperty(ROUTE_CASING, "line-width", PLAIN_ROUTE.casing.width);
  map.setPaintProperty(ROUTE_CASING, "line-opacity", PLAIN_ROUTE.casing.opacity);
  map.setPaintProperty(ROUTE_LINE, "line-color", PLAIN_ROUTE.line.color);
  map.setPaintProperty(ROUTE_LINE, "line-width", PLAIN_ROUTE.line.width);
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
  dumpStops,
  selectedDumpId,
  onSelectDump,
  onRouteVia,
  viaDisabled,
  follow,
  followActive,
  followStatus = "off",
  nav,
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
  dumpStops?: DumpStop[];
  selectedDumpId?: string | null;
  onSelectDump?: (id: string) => void;
  onRouteVia?: (stop: MapPoiStop) => void;
  viaDisabled?: boolean;
  follow?: Pick<GeoFix, "lat" | "lng" | "heading"> | null;
  followActive?: boolean;
  followStatus?: FollowStatus;
  /** Turn-by-Turn armed: full-screen pitched follow camera + nav chrome. */
  nav?: RouteNavView | null;
  onUnavailable: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  /** Full-screen nav slot (portal). The map host div is moved, not re-made. */
  const navSlotRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mbRef = useRef<MapboxNS | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const puckRef = useRef<MapboxMarker | null>(null);
  const lastRecenterRef = useRef(0);
  const followCenterRef = useRef<BasemapLngLat | null>(null);
  const [ready, setReady] = useState(false);
  const [styleId, setStyleId] = useState<MapboxStyleId>("streets");
  const styleIdRef = useRef<MapboxStyleId>("streets");
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const themeRef = useRef<SuiteTheme>(theme);
  themeRef.current = theme;
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  const originPt = useMemo(() => asPlace(origin), [origin]);
  const destPt = useMemo(() => asPlace(destination), [destination]);
  const viaPts = useMemo(
    () => (vias ?? []).map(asPlace).filter((p): p is NonNullable<typeof p> => !!p),
    [vias],
  );
  const coords = useMemo(() => geometryCoords(geometry), [geometry]);
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

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
    for (const s of (dumpStops ?? []).slice(0, MAX_DUMP_PINS)) {
      if (!finiteLngLat(s)) continue;
      rows.push({
        id: s.id,
        kind: dumpPinKind(s.fee),
        lat: s.lat,
        lng: s.lng,
        label: `${s.name} · ${s.feeLabel}`,
      });
    }
    return rows;
  }, [originPt, destPt, viaPts, fuelStops, campStops, dumpStops]);

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
    const slot = mapElRef.current;
    if (!slot || !token.startsWith("pk.")) {
      onUnavailableRef.current();
      return;
    }
    // The GL container is created here, not by React, so nav mode can move
    // it into the full-screen slot without a second map load.
    const el = document.createElement("div");
    el.className = "absolute inset-0 overflow-hidden";
    // Inline so mapbox-gl.css `.mapboxgl-map { position: relative }` can't
    // collapse the host to 0px tall once it's reparented.
    el.style.cssText = "position:absolute;inset:0;";
    el.setAttribute("data-mapbox-canvas-host", "");
    slot.appendChild(el);
    hostRef.current = el;
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
        const startStandard = isStandardStyle(styleIdRef.current);
        map = new mapboxgl.Map({
          container: el,
          style: mapboxStyleUrl(styleIdRef.current),
          ...(startStandard
            ? { config: { basemap: mapboxStandardConfig(themeRef.current) } }
            : {}),
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
        // Fires on first load and after every setStyle (Streets ⇄ Satellite):
        // re-apply Standard config and re-add the route layers each time.
        const onStyleLoad = () => {
          if (cancelled || !map) return;
          const standard = isStandardStyle(styleIdRef.current);
          if (standard) applyStandardConfig(map, themeRef.current);
          try {
            paintRoute(map, coordsRef.current, standard);
          } catch {
            /* style may be swapping */
          }
        };
        map.on("style.load", onStyleLoad);
        const onLoad = () => {
          if (cancelled) return;
          onStyleLoad();
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
      el.remove();
      hostRef.current = null;
      setReady(false);
    };
    // Token / container lifetime only — style + data sync below.
  }, [token]);

  const lastStyleRef = useRef<MapboxStyleId>("streets");
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (lastStyleRef.current === styleId) return;
    lastStyleRef.current = styleId;
    styleIdRef.current = styleId;
    // Route layers + Standard config are re-applied by the style.load handler.
    try {
      map.setStyle(mapboxStyleUrl(styleId));
    } catch {
      onUnavailableRef.current();
    }
  }, [styleId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !isStandardStyle(styleId)) return;
    try {
      map.setConfigProperty("basemap", "lightPreset", standardLightPreset(theme));
    } catch {
      /* style may be swapping */
    }
  }, [theme, styleId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    try {
      paintRoute(map, coords, isStandardStyle(styleIdRef.current));
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
      const dump =
        pin.kind === "dump-free" ||
        pin.kind === "dump-paid" ||
        pin.kind === "dump-unknown";
      const on =
        (fuel && pin.id === selectedFuelId) ||
        (camp && pin.id === selectedCampId) ||
        (dump && pin.id === selectedDumpId);
      const node = document.createElement(fuel || camp || dump ? "button" : "span");
      if (node instanceof HTMLButtonElement) node.type = "button";
      node.className = pinClass(pin.kind, on);
      node.title = pin.label || pin.kind;
      node.textContent = pinMark(pin);
      node.setAttribute("data-map-pin", pin.kind);
      if (camp) node.setAttribute("data-camp-pin", pin.kind);
      if (dump) {
        node.setAttribute(
          "data-dump-pin-fee",
          pin.kind === "dump-free"
            ? "free"
            : pin.kind === "dump-paid"
              ? "paid"
              : "unknown",
        );
      }
      if (fuel || camp || dump) {
        node.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (fuel) onSelectFuel?.(on ? "" : pin.id);
          else if (camp) onSelectCamp?.(on ? "" : pin.id);
          else onSelectDump?.(on ? "" : pin.id);
        });
      }
      const marker = new mapboxgl.Marker({ element: node, anchor: "bottom" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [pins, ready, selectedFuelId, selectedCampId, selectedDumpId, onSelectFuel, onSelectCamp, onSelectDump]);

  const navOn = Boolean(nav && followActive && ready);
  const navRef = useRef(nav);
  navRef.current = nav;
  const navCamRef = useRef<NavCamera | null>(null);
  const navEnteredRef = useRef(false);
  /** Nav changed camera / route paint, so leaving nav must restore them. */
  const navTouchedRef = useRef(false);

  // Move the one GL container between the inline card and the full-screen
  // nav slot. Same Map object, same map load.
  useLayoutEffect(() => {
    const host = hostRef.current;
    const target = navOn ? navSlotRef.current : mapElRef.current;
    if (!host || !target || host.parentElement === target) return;
    target.appendChild(host);
    mapRef.current?.resize();
  }, [navOn, ready]);

  // Leaving nav: flatten the camera and restore the plain preview line.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || navOn || !navTouchedRef.current) return;
    navTouchedRef.current = false;
    navEnteredRef.current = false;
    navCamRef.current = null;
    try {
      clearNavRoute(map, coordsRef.current, isStandardStyle(styleIdRef.current));
      map.easeTo({
        pitch: 0,
        bearing: 0,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 0,
      });
    } catch {
      /* style may be swapping */
    }
  }, [navOn, ready]);

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
    if (navRef.current && followActive) {
      navFollow(map, followPt);
      return;
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
  }, [followPt, ready, followActive]);

  /**
   * Nav camera: heading-up, puck low on screen, zoom + pitch from the
   * distance to the next maneuver (navCameraFor). Eases on every accepted
   * fix — fixes are already 15 m-filtered in useNavFollow.
   */
  function navFollow(
    map: MapboxMap,
    pt: Pick<GeoFix, "lat" | "lng" | "heading">,
  ) {
    navTouchedRef.current = true;
    const v = navRef.current;
    const split = splitRouteAtFix(coordsRef.current, pt);
    const onRoute = split && split.metersOff <= 90 ? split : null;
    try {
      paintNavRoute(
        map,
        coordsRef.current,
        onRoute,
        isStandardStyle(styleIdRef.current),
        themeRef.current,
      );
    } catch {
      /* style may be swapping */
    }
    const cam = navCameraFor(v?.remainToManeuverM ?? null, v?.speedMps ?? null);
    const bearing = pt.heading ?? onRoute?.bearing ?? map.getBearing();
    const h = map.getContainer().clientHeight || 640;
    const first = !navEnteredRef.current;
    navEnteredRef.current = true;
    const moveCam = first || cameraChanged(navCamRef.current, cam);
    navCamRef.current = cam;
    const el = puckRef.current?.getElement();
    if (el) {
      // Map rotates to the heading, so the arrow points straight up.
      el.style.setProperty("--puck-heading", `${(pt.heading ?? bearing) - bearing}deg`);
      el.setAttribute("data-nav-puck", "");
    }
    const opts = {
      center: [pt.lng, pt.lat] as [number, number],
      bearing,
      padding: { top: Math.round(h * 0.42), bottom: 150, left: 0, right: 0 },
      essential: true,
      ...(moveCam ? { zoom: cam.zoom, pitch: cam.pitch } : {}),
    };
    if (first) {
      map.flyTo({ ...opts, duration: 1800, curve: 1.3 });
    } else {
      map.easeTo({ ...opts, duration: 900, easing: (t: number) => t });
    }
  }

  // Nav armed with no fix yet: fly to the route start with the nav camera
  // so the driver sees the pitched view immediately.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !navOn || followPt || navEnteredRef.current) return;
    const start = coordsRef.current[0];
    if (!start) return;
    const next = coordsRef.current[1];
    navFollow(map, {
      lng: start[0],
      lat: start[1],
      heading: next
        ? (Math.atan2(next[0] - start[0], next[1] - start[1]) * 180) / Math.PI
        : null,
    });
    // Count the real first fix as the entry fly.
    navEnteredRef.current = false;
  }, [navOn, followPt]);

  const selectedPoi = useMemo(
    () =>
      resolveMapPoi({
        fuelStops,
        campStops,
        dumpStops,
        selectedFuelId,
        selectedCampId,
        selectedDumpId,
      }),
    [
      fuelStops,
      campStops,
      dumpStops,
      selectedFuelId,
      selectedCampId,
      selectedDumpId,
    ],
  );

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
      data-no-swipe=""
      data-tile-source="mapbox"
      data-map-engine="mapbox-gl"
      data-follow-status={status}
      className="relative z-0 isolate overflow-hidden rounded-xl border border-white/12 bg-[#0b1410]"
      style={{ height: MAP_PANEL_H }}
    >
      <div
        ref={mapElRef}
        data-map-inline-slot
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

      {selectedPoi ? (
        <div className="pointer-events-auto absolute bottom-16 left-2 right-14 z-[7] max-w-[280px]">
          <MapPoiDetailChip
            poi={selectedPoi}
            onRouteVia={onRouteVia}
            viaDisabled={viaDisabled}
          />
        </div>
      ) : null}

      {(campStops ?? []).length > 0 || (dumpStops ?? []).length > 0 ? (
        <RouteLayerLegend
          showCamps={(campStops ?? []).length > 0}
          showDumps={(dumpStops ?? []).length > 0}
          tone="on-map"
          className="pointer-events-none absolute bottom-10 left-2 z-[6] rounded-md bg-black/55 px-2 py-1"
        />
      ) : null}

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
        © Mapbox · {styleId === "satellite" ? "satellite" : "standard"}
      </p>
      {navOn && typeof document !== "undefined"
        ? createPortal(
            <div
              data-nav-mode
              data-no-swipe=""
              data-map-engine="mapbox-gl"
              data-theme-tone={theme}
              data-follow-status={status}
              className="rv-nav-screen"
              role="application"
              aria-label="Turn-by-turn navigation"
            >
              <div ref={navSlotRef} className="absolute inset-0" />
              {nav?.overlay}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
