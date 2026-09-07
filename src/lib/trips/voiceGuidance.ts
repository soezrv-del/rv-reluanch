/**
 * Turn-by-turn voice prompts from the live HERE / OSRM step list.
 * Mapbox is visual-only — this never invents a Directions router.
 */

import { haversineMeters } from "./geoFollow.ts";
import { metersToRoutePolyline } from "./offRouteReroute.ts";
import type { OsrmLngLat, OsrmStep } from "./osrm.ts";

export const VOICE_PREF_KEY = "rvfax_trips_voice";

/** ~0.5 mi — first heads-up. */
export const VOICE_MILE_M = 900;
/** ~0.25 mi / 1,000 ft. */
export const VOICE_FAR_M = 450;
/** ~500 ft. */
export const VOICE_NEAR_M = 180;
/** Speak the maneuver itself. */
export const VOICE_NOW_M = 45;
/** Past the maneuver point — advance. */
export const VOICE_PASS_M = 28;
/** Ignore snap-to-line when GPS is this far off (reroute owns that). */
export const VOICE_OFFROUTE_M = 90;

export type VoiceBand = "mile" | "far" | "near" | "now";

const BAND_RANK: Record<VoiceBand, number> = {
  mile: 1,
  far: 2,
  near: 3,
  now: 4,
};

export type GuidanceStep = {
  id: string;
  instruction: string;
  maneuver: string;
  distanceM: number;
  location: OsrmLngLat | null;
};

export type UpcomingGuidance = {
  step: GuidanceStep;
  remainM: number;
  index: number;
};

export type VoiceMemory = {
  routeId: string;
  stepId: string | null;
  band: VoiceBand | null;
  rank: number;
};

export function emptyVoiceMemory(): VoiceMemory {
  return { routeId: "", stepId: null, band: null, rank: 0 };
}

export function loadVoicePref(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(VOICE_PREF_KEY) === "on";
  } catch {
    return false;
  }
}

export function saveVoicePref(on: boolean): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(VOICE_PREF_KEY, on ? "on" : "off");
  } catch {
    /* private mode */
  }
}

export function guidanceSteps(raw: OsrmStep[] | null | undefined): GuidanceStep[] {
  if (!raw?.length) return [];
  return raw.map((s, i) => ({
    id: `s-${i}`,
    instruction: (s.instruction || (s.name ? `Continue on ${s.name}` : "Continue")).trim(),
    maneuver: String(s.maneuver || ""),
    distanceM: Number.isFinite(s.distanceM) ? Math.max(0, s.distanceM) : 0,
    location: s.location,
  }));
}

export function isSpeakableManeuver(maneuver: string, instruction: string): boolean {
  const blob = `${maneuver} ${instruction}`.toLowerCase();
  if (/\bdepart\b/.test(blob)) return false;
  if (/\barrive\b/.test(blob)) return true;
  return /turn|ramp|merge|fork|exit|roundabout|rotary|end of road|u-?turn|keep (left|right)|slight (left|right)|sharp (left|right)|left|right/.test(
    blob,
  );
}

export function pickBand(remainM: number): VoiceBand | null {
  if (!Number.isFinite(remainM) || remainM > VOICE_MILE_M) return null;
  if (remainM <= VOICE_NOW_M) return "now";
  if (remainM <= VOICE_NEAR_M) return "near";
  if (remainM <= VOICE_FAR_M) return "far";
  return "mile";
}

export function formatDistanceForVoice(m: number): string {
  if (!Number.isFinite(m) || m < 12) return "";
  if (m < 280) {
    const ft = Math.max(50, Math.round((m * 3.28084) / 50) * 50);
    return `${ft} feet`;
  }
  const miles = m / 1609.344;
  if (miles < 0.4) return "a quarter mile";
  if (miles < 0.7) return "half a mile";
  if (miles < 1.15) return "1 mile";
  const n = Math.round(miles);
  return n === 1 ? "1 mile" : `${n} miles`;
}

export function formatRemainLabel(m: number): string {
  if (!Number.isFinite(m) || m < 0) return "";
  if (m < 80) {
    const ft = Math.max(50, Math.round((m * 3.28084) / 10) * 10);
    return `${ft} ft`;
  }
  if (m < 1609) {
    const miles = Math.round((m / 1609.344) * 10) / 10;
    if (miles < 0.1) {
      return `${Math.round((m * 3.28084) / 50) * 50} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  const miles = m / 1609.344;
  return miles >= 10 ? `${Math.round(miles)} mi` : `${miles.toFixed(1)} mi`;
}

export function formatVoicePrompt(instruction: string, remainM: number): string {
  const inst = instruction.replace(/\.+$/, "").trim();
  if (!inst) return "";
  const band = pickBand(remainM);
  if (!band || band === "now") return inst;
  const dist = formatDistanceForVoice(remainM);
  if (!dist) return inst;
  const rest = inst.charAt(0).toLowerCase() + inst.slice(1);
  return `In ${dist}, ${rest}`;
}

export function rememberSpoken(
  routeId: string,
  stepId: string,
  band: VoiceBand,
): VoiceMemory {
  return {
    routeId,
    stepId,
    band,
    rank: BAND_RANK[band],
  };
}

export function maneuverStartsAlongM(steps: GuidanceStep[]): number[] {
  const starts: number[] = [];
  let along = 0;
  for (const s of steps) {
    starts.push(along);
    along += s.distanceM;
  }
  return starts;
}

export function alongRouteMeters(
  fix: OsrmLngLat,
  polyline: Array<OsrmLngLat | [number, number]> | null | undefined,
  routeDistanceM?: number,
): { alongM: number; metersOff: number } | null {
  if (!polyline?.length) return null;
  const hit = metersToRoutePolyline(fix, polyline);
  if (!Number.isFinite(hit.progress)) return null;
  let total = 0;
  if (typeof routeDistanceM === "number" && Number.isFinite(routeDistanceM) && routeDistanceM > 0) {
    total = routeDistanceM;
  } else {
    const pts = polyline.map((p) =>
      Array.isArray(p) ? { lng: p[0], lat: p[1] } : p,
    );
    for (let i = 1; i < pts.length; i++) {
      total += haversineMeters(pts[i - 1]!, pts[i]!);
    }
  }
  if (!(total > 0)) return null;
  return { alongM: hit.progress * total, metersOff: hit.metersOff };
}

function remainByLocation(
  fix: OsrmLngLat,
  step: GuidanceStep,
): number | null {
  if (!step.location) return null;
  const d = haversineMeters(fix, step.location);
  return Number.isFinite(d) ? d : null;
}

export function resolveUpcomingGuidance(input: {
  steps: OsrmStep[] | GuidanceStep[];
  fix: OsrmLngLat | null;
  polyline?: Array<OsrmLngLat | [number, number]> | null;
  routeDistanceM?: number;
}): UpcomingGuidance | null {
  const steps = input.steps.length && "id" in input.steps[0]!
    ? (input.steps as GuidanceStep[])
    : guidanceSteps(input.steps as OsrmStep[]);
  if (!steps.length) return null;

  const starts = maneuverStartsAlongM(steps);
  const snap =
    input.fix && input.polyline?.length
      ? alongRouteMeters(input.fix, input.polyline, input.routeDistanceM)
      : null;
  const alongM =
    snap && snap.metersOff <= VOICE_OFFROUTE_M ? snap.alongM : null;

  const pick = (index: number, remainM: number): UpcomingGuidance => ({
    step: steps[index]!,
    remainM: Math.max(0, remainM),
    index,
  });

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (!isSpeakableManeuver(step.maneuver, step.instruction)) continue;

    let remain: number | null = null;
    if (alongM != null) {
      remain = (starts[i] ?? 0) - alongM;
    } else if (input.fix) {
      remain = remainByLocation(input.fix, step);
    } else {
      remain = starts[i] ?? 0;
    }

    if (remain == null) continue;
    if (remain > -VOICE_PASS_M) return pick(i, remain);
  }

  const last = steps.length - 1;
  const tail = steps[last]!;
  if (!tail) return null;
  if (alongM != null) return pick(last, (starts[last] ?? 0) - alongM);
  if (input.fix) {
    const d = remainByLocation(input.fix, tail);
    if (d != null) return pick(last, d);
  }
  return pick(last, starts[last] ?? 0);
}

export function considerVoiceCue(input: {
  enabled: boolean;
  routeId: string;
  guidance: UpcomingGuidance | null;
  memory: VoiceMemory;
}): { speak: string | null; memory: VoiceMemory } {
  const memory =
    input.memory.routeId === input.routeId
      ? input.memory
      : emptyVoiceMemory();
  const aligned: VoiceMemory = { ...memory, routeId: input.routeId };

  if (!input.enabled || !input.guidance) {
    return { speak: null, memory: aligned };
  }

  const { step, remainM } = input.guidance;
  if (!isSpeakableManeuver(step.maneuver, step.instruction)) {
    return { speak: null, memory: aligned };
  }

  const band = pickBand(remainM);
  if (!band) return { speak: null, memory: aligned };

  const rank = BAND_RANK[band];
  if (aligned.stepId === step.id && aligned.rank >= rank) {
    return { speak: null, memory: aligned };
  }

  return {
    speak: formatVoicePrompt(step.instruction, remainM),
    memory: rememberSpoken(input.routeId, step.id, band),
  };
}
