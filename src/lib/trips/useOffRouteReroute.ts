/**
 * Live off-route recalc while Turn-by-Turn is armed.
 * Uses fetchNavigateRoute (HERE Truck when locked; OSRM fallback).
 * Does not touch Trips header chrome or Mapbox Directions.
 */

import { useEffect, useRef, useState } from "react";
import {
  createOffRouteGate,
  navigateParamsForReroute,
} from "./offRouteReroute.ts";
import { fetchNavigateRoute, type RvSafeCoachInput } from "./navigateRoute.ts";
import { tripRouteFromLive } from "./routeResults.ts";
import type { OsrmLineString, OsrmLngLat, OsrmRouteResult } from "./osrm.ts";
import type { TripRoute } from "./tripData.ts";

export type OffRouteStop = OsrmLngLat & { label?: string };

export function useOffRouteReroute(opts: {
  armed: boolean;
  liveRoute: boolean;
  fix: OsrmLngLat | null;
  dest: OffRouteStop | null;
  vias: OffRouteStop[];
  polyline: OsrmLineString["coordinates"] | null | undefined;
  coach: RvSafeCoachInput | null;
  originLabel: string;
  onApplied: (data: OsrmRouteResult, trip: TripRoute) => void;
}): { rerouting: boolean } {
  const [rerouting, setRerouting] = useState(false);
  const gateRef = useRef(createOffRouteGate());
  const abortRef = useRef<AbortController | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const viaKey = opts.vias
    .map((p) => `${p.lng.toFixed(4)},${p.lat.toFixed(4)}`)
    .join("|");
  const destKey = opts.dest
    ? `${opts.dest.lng.toFixed(4)},${opts.dest.lat.toFixed(4)}`
    : "";
  const fixKey = opts.fix
    ? `${opts.fix.lng.toFixed(5)},${opts.fix.lat.toFixed(5)}`
    : "";
  const lineKey = opts.polyline?.length ? String(opts.polyline.length) : "";
  const coachKey = opts.coach?.locked
    ? `${opts.coach.heightFt}|${opts.coach.lengthFt}|${opts.coach.weightLbs}`
    : "";

  useEffect(() => {
    const o = optsRef.current;
    if (!o.armed) {
      abortRef.current?.abort();
      abortRef.current = null;
      gateRef.current.reset();
      setRerouting(false);
      return;
    }
    if (!o.liveRoute || !o.dest || !o.fix || !o.polyline?.length) {
      return;
    }

    const decision = gateRef.current.consider({
      armed: true,
      liveRoute: true,
      here: o.fix,
      dest: o.dest,
      vias: o.vias,
      polyline: o.polyline,
      now: Date.now(),
    });
    if (decision.action !== "reroute") return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRerouting(true);

    const viaKept = o.vias.filter((p) =>
      decision.via.some(
        (v) =>
          Math.abs(v.lat - p.lat) < 1e-5 && Math.abs(v.lng - p.lng) < 1e-5,
      ),
    );

    fetchNavigateRoute({
      ...navigateParamsForReroute(decision, o.coach),
      signal: ctrl.signal,
    })
      .then((data) => {
        if (ctrl.signal.aborted) return;
        const next = tripRouteFromLive(
          data,
          o.originLabel || "Current location",
          o.dest?.label || "Destination",
          { viaLabels: viaKept.map((p) => p.label || "") },
        );
        if (!next) return;
        o.onApplied(data, next);
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        /* Keep the existing blue line — do not blank the map. */
      })
      .finally(() => {
        if (ctrl.signal.aborted) return;
        gateRef.current.finish();
        setRerouting(false);
      });
  }, [opts.armed, opts.liveRoute, destKey, viaKey, fixKey, lineKey, coachKey]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { rerouting };
}
