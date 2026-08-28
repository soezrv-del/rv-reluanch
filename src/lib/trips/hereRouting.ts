/**
 * HERE Truck Routing helpers — vehicle dims from coach profile.
 * Dimensions: HERE expects cm (height/width/length) and kg (weight).
 */

import type { OsrmLngLat, OsrmRouteResult, OsrmStep } from "./osrm";
import { compactSteps, metersToMiles, splitDuration } from "./osrm";

export type TruckVehicle = {
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  grossWeightKg: number;
  /** Ship/trailer category hint */
  trailerCount?: number;
  shippedHazardousGoods?: string[];
};

export type CoachDims = {
  heightFt?: number;
  widthFt?: number;
  lengthFt?: number;
  weightLbs?: number;
  /** diesel / gas / propane habit — enables tunnel-sensitive hazmat when true */
  propaneRestricted?: boolean;
  type?: string;
};

const FT_TO_CM = 30.48;
const LB_TO_KG = 0.453592;

export function coachToTruckVehicle(c: CoachDims): TruckVehicle {
  const heightFt = c.heightFt && c.heightFt > 0 ? c.heightFt : 12.5;
  const widthFt = c.widthFt && c.widthFt > 0 ? c.widthFt : 8.5;
  const lengthFt = c.lengthFt && c.lengthFt > 0 ? c.lengthFt : 35;
  const weightLbs = c.weightLbs && c.weightLbs > 0 ? c.weightLbs : 20_000;

  // Small safety buffer for air conditioners / antennas (6")
  const heightCm = Math.round((heightFt + 0.5) * FT_TO_CM);
  const widthCm = Math.round(widthFt * FT_TO_CM);
  const lengthCm = Math.round(lengthFt * FT_TO_CM);
  const grossWeightKg = Math.round(weightLbs * LB_TO_KG);

  const t = (c.type || "").toLowerCase();
  const trailerCount =
    t.includes("5th") ||
    t.includes("fifth") ||
    t.includes("trailer") ||
    t.includes("toy")
      ? 1
      : 0;

  const shippedHazardousGoods =
    c.propaneRestricted === true ? (["explosive"] as string[]) : undefined;
  // HERE uses specific hazmat enums; propane tunnels often map to tunnel restrictions
  // via shippedHazardousGoods — keep optional and conservative.

  return {
    heightCm: Math.min(Math.max(heightCm, 200), 450),
    widthCm: Math.min(Math.max(widthCm, 200), 300),
    lengthCm: Math.min(Math.max(lengthCm, 400), 2500),
    grossWeightKg: Math.min(Math.max(grossWeightKg, 1500), 60000),
    trailerCount,
    shippedHazardousGoods,
  };
}

/**
 * Minimal HERE flexible-polyline decoder (2D).
 * @see https://github.com/heremaps/flexible-polyline
 */
export function decodeFlexiblePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const decodingTable: Record<string, number> = {};
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < chars.length; i++) decodingTable[chars[i]!] = i;

  let index = 0;
  const decodeUnsigned = (): number => {
    let result = 0;
    let shift = 0;
    while (index < encoded.length) {
      const c = encoded[index++]!;
      const value = decodingTable[c];
      if (value === undefined) break;
      result |= (value & 0x1f) << shift;
      if ((value & 0x20) === 0) break;
      shift += 5;
    }
    return result;
  };

  const decodeSigned = (): number => {
    const u = decodeUnsigned();
    return (u & 1) !== 0 ? ~(u >> 1) : u >> 1;
  };

  // header
  decodeUnsigned(); // version / header
  const header = decodeUnsigned();
  const precision = header & 15;
  const thirdDim = (header >> 4) & 7;
  // const thirdDimPrecision = (header >> 7) & 15; // unused for 2D path

  const factor = 10 ** precision;
  const coords: [number, number][] = [];
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    lat += decodeSigned();
    lng += decodeSigned();
    if (thirdDim) decodeSigned(); // skip altitude/etc
    coords.push([lng / factor, lat / factor]); // GeoJSON order lng,lat
  }
  return coords;
}

function downsample(
  coords: [number, number][],
  maxPoints: number,
): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const out: [number, number][] = [];
  const last = coords.length - 1;
  for (let i = 0; i < maxPoints; i++) {
    const idx =
      i === maxPoints - 1 ? last : Math.round((i * last) / (maxPoints - 1));
    out.push(coords[idx]!);
  }
  return out;
}

export function normalizeHereRoute(
  json: Record<string, unknown>,
  opts: {
    origin: OsrmLngLat;
    destination: OsrmLngLat;
    vehicle: TruckVehicle;
  },
): OsrmRouteResult {
  const routes = (json.routes as Record<string, unknown>[]) || [];
  const route = routes[0];
  if (!route) {
    const title =
      (json.title as string) ||
      (json.cause as string) ||
      "No HERE route returned";
    throw new Error(title);
  }

  const sections = (route.sections as Record<string, unknown>[]) || [];
  let distanceM = 0;
  let durationS = 0;
  const allCoords: [number, number][] = [];
  const steps: OsrmStep[] = [];

  for (const sec of sections) {
    const summary = (sec.summary as Record<string, unknown>) || {};
    distanceM += Number(summary.length ?? 0);
    durationS += Number(summary.duration ?? 0);

    const poly = (sec.polyline as string) || "";
    if (poly) {
      try {
        allCoords.push(...decodeFlexiblePolyline(poly));
      } catch {
        /* skip bad poly */
      }
    }

    const actions = (sec.actions as Record<string, unknown>[]) || [];
    for (const act of actions) {
      const instruction = String(
        act.instruction || act.action || "Continue",
      );
      const len = Number(act.length ?? 0);
      const dur = Number(act.duration ?? 0);
      const action = String(act.action ?? "continue");
      steps.push({
        instruction,
        name: String(act.name ?? ""),
        distanceM: len,
        durationS: dur,
        maneuver: action,
        location: null,
      });
    }
  }

  if (!steps.length) {
    steps.push(
      {
        instruction: "Depart",
        name: "",
        distanceM: 0,
        durationS: 0,
        maneuver: "depart",
        location: opts.origin,
      },
      {
        instruction: "Arrive at destination",
        name: "",
        distanceM: 0,
        durationS: 0,
        maneuver: "arrive",
        location: opts.destination,
      },
    );
  }

  const { driveHours, driveMinutes } = splitDuration(durationS);
  const geometry =
    allCoords.length >= 2
      ? {
          type: "LineString" as const,
          coordinates: downsample(allCoords, 400),
        }
      : null;

  return {
    source: "here",
    engine: "RV-SAFE · HERE Truck",
    baseUrl: "https://router.hereapi.com",
    profile: "truck",
    code: "Ok",
    distanceM,
    durationS,
    miles: metersToMiles(distanceM),
    driveHours,
    driveMinutes,
    geometry,
    steps: compactSteps(steps),
    waypoints: [
      { name: "Origin", location: opts.origin },
      { name: "Destination", location: opts.destination },
    ],
    origin: opts.origin,
    destination: opts.destination,
    fetchedAt: new Date().toISOString(),
    routingMode: "rv_safe",
    providerNote: `Truck dims ${opts.vehicle.heightCm}cm H · ${opts.vehicle.lengthCm}cm L · ${opts.vehicle.grossWeightKg}kg`,
  };
}

export function buildHereRouteUrl(opts: {
  origin: OsrmLngLat;
  destination: OsrmLngLat;
  vehicle: TruckVehicle;
  apiKey: string;
}): string {
  const qs = new URLSearchParams();
  // HERE uses lat,lng order
  qs.set("origin", `${opts.origin.lat},${opts.origin.lng}`);
  qs.set("destination", `${opts.destination.lat},${opts.destination.lng}`);
  qs.set("transportMode", "truck");
  qs.set("return", "polyline,summary,actions,instructions");
  qs.set("spans", "truckAttributes,notices");
  qs.set("lang", "en-US");
  qs.set("vehicle[height]", String(opts.vehicle.heightCm));
  qs.set("vehicle[width]", String(opts.vehicle.widthCm));
  qs.set("vehicle[length]", String(opts.vehicle.lengthCm));
  qs.set("vehicle[grossWeight]", String(opts.vehicle.grossWeightKg));
  if (opts.vehicle.trailerCount && opts.vehicle.trailerCount > 0) {
    qs.set("vehicle[trailerCount]", String(opts.vehicle.trailerCount));
  }
  qs.set("apikey", opts.apiKey);
  return `https://router.hereapi.com/v8/routes?${qs}`;
}
