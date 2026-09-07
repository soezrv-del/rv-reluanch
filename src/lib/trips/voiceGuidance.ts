/**
 * Turn-by-turn voice prompts from the live HERE / OSRM step list.
 * Mapbox is visual-only — this never invents a Directions router.
 *
 * Spoken English for US drivers is feet / miles only. HERE step text may
 * still include metric "Go for 200 m" — that is stripped or converted here,
 * not by changing the truck router.
 */

import { haversineMeters } from "./geoFollow.ts";
import { metersToRoutePolyline } from "./offRouteReroute.ts";
import type { OsrmLngLat, OsrmStep } from "./osrm.ts";

export const VOICE_PREF_KEY = "rvfax_trips_voice";

const FT_PER_M = 3.28084;
const M_PER_MI = 1609.344;
/** Speak feet below this (~0.2 mi). */
export const VOICE_FEET_MAX_M = 0.2 * M_PER_MI;

/** First heads-up (~0.5 mi). Wider than the old 0.25 / 0.5 / 500 ft stack. */
export const VOICE_AHEAD_M = 800;
/** Critical turn (~300 ft). */
export const VOICE_NOW_M = 90;
/** Alias: close enough to treat as the upcoming turn window. */
export const VOICE_NEAR_M = VOICE_NOW_M;
/** Past the maneuver point — advance. */
export const VOICE_PASS_M = 28;
/** Ignore snap-to-line when GPS is this far off (reroute owns that). */
export const VOICE_OFFROUTE_M = 90;
/** Minimum gap between non-critical utterances. */
export const VOICE_MIN_GAP_MS = 28_000;
/** Don't stack "Turn right" on a just-spoken "In 500 feet, turn right". */
export const VOICE_NOW_STACK_MS = 10_000;

export type VoiceBand = "ahead" | "now";

const BAND_RANK: Record<VoiceBand, number> = {
  ahead: 1,
  now: 2,
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
  lastSpokenAt: number;
  lastLine: string;
};

export function emptyVoiceMemory(): VoiceMemory {
  return {
    routeId: "",
    stepId: null,
    band: null,
    rank: 0,
    lastSpokenAt: 0,
    lastLine: "",
  };
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
  return /turn|ramp|merge|fork|exit|roundabout|rotary|end of road|u-?turn|keep (left|right)|slight (left|right)|sharp (left|right)/.test(
    blob,
  );
}

export function pickBand(remainM: number): VoiceBand | null {
  if (!Number.isFinite(remainM) || remainM > VOICE_AHEAD_M) return null;
  if (remainM <= VOICE_NOW_M) return "now";
  return "ahead";
}

function formatMilesSpoken(miles: number): string {
  if (!Number.isFinite(miles) || miles <= 0) return "";
  const tenths = Math.round(miles * 10) / 10;
  if (tenths < 0.15) return "";
  if (tenths === 1) return "1 mile";
  if (Math.abs(tenths - Math.round(tenths)) < 0.05) {
    const n = Math.round(tenths);
    return n === 1 ? "1 mile" : `${n} miles`;
  }
  return `${tenths.toFixed(1)} miles`;
}

export function formatDistanceForVoice(m: number): string {
  if (!Number.isFinite(m) || m < 12) return "";
  if (m < VOICE_FEET_MAX_M) {
    const ft = Math.max(50, Math.round((m * FT_PER_M) / 50) * 50);
    return `${ft} feet`;
  }
  return formatMilesSpoken(m / M_PER_MI);
}

export function formatRemainLabel(m: number): string {
  if (!Number.isFinite(m) || m < 0) return "";
  const miles = m / M_PER_MI;
  if (miles < 0.2) {
    const ft = Math.max(50, Math.round((m * FT_PER_M) / 50) * 50);
    return `${ft} ft`;
  }
  return miles >= 10 ? `${Math.round(miles)} mi` : `${miles.toFixed(1)} mi`;
}

/** Drop HERE's trailing "Go for 200 m" — we announce approach ourselves. */
export function stripFollowOnDistance(instruction: string): string {
  return instruction
    .replace(
      /\s*(?:\.|,)?\s*(?:then\s+)?(?:go|continue|drive|walk|proceed)\s+for\s+[\d.,]+\s*(?:kilo\s*meters?|kilometers?|kilometres?|kms?|meters?|metres?|miles?|feet|ft|m)\s*\.?$/i,
      "",
    )
    .replace(
      /^(?:in|after|for)\s+[\d.,]+\s*(?:kilo\s*meters?|kilometers?|kilometres?|kms?|meters?|metres?|miles?|feet|ft|m)\s*[,.]?\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/g, "")
    .trim();
}

function spokenFromMetric(value: number, unit: string): string {
  const u = unit.toLowerCase().replace(/\s+/g, "");
  const isKm = /^(?:km|kms|kilometer|kilometers|kilometre|kilometres|kilo)$/.test(u);
  const meters = isKm ? value * 1000 : value;
  return formatDistanceForVoice(meters) || `${Math.max(50, Math.round(meters * FT_PER_M))} feet`;
}

/**
 * Convert leftover metric phrases so spoken English never says meters/km.
 */
export function sanitizeSpokenEnglish(text: string): string {
  if (!text) return "";
  let s = text;
  s = s.replace(
    /\b(\d+(?:\.\d+)?)\s*(kilo\s*meters?|kilometers?|kilometres?|kms?)\b/gi,
    (_, n: string, unit: string) => spokenFromMetric(Number(n), unit),
  );
  s = s.replace(
    /\b(\d+(?:\.\d+)?)\s*(meters?|metres?)\b/gi,
    (_, n: string, unit: string) => spokenFromMetric(Number(n), unit),
  );
  // Bare "200 m" / "200m" — not "I-80" or "am".
  s = s.replace(
    /\b(\d+(?:\.\d+)?)\s*m\b(?!\s*i)/gi,
    (_, n: string) => spokenFromMetric(Number(n), "m"),
  );
  return s.replace(/\s+/g, " ").trim();
}

export function promptFingerprint(line: string): string {
  return sanitizeSpokenEnglish(line)
    .toLowerCase()
    .replace(/\bin\s+[\d.]+\s+(feet|foot|miles?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isNearDuplicatePrompt(a: string, b: string): boolean {
  if (!a || !b) return false;
  const fa = promptFingerprint(a);
  const fb = promptFingerprint(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

export function formatVoicePrompt(instruction: string, remainM: number): string {
  const inst = sanitizeSpokenEnglish(stripFollowOnDistance(instruction));
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
  spoken?: { at?: number; line?: string },
): VoiceMemory {
  return {
    routeId,
    stepId,
    band,
    rank: BAND_RANK[band],
    lastSpokenAt: spoken?.at ?? 0,
    lastLine: spoken?.line ?? "",
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
  nowMs?: number;
}): { speak: string | null; memory: VoiceMemory } {
  const nowMs = input.nowMs ?? Date.now();
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

  const line = formatVoicePrompt(step.instruction, remainM);
  if (!line) return { speak: null, memory: aligned };

  const elapsed = aligned.lastSpokenAt ? nowMs - aligned.lastSpokenAt : Infinity;
  const sameStepRecent =
    aligned.stepId === step.id &&
    Boolean(aligned.lastLine) &&
    elapsed < VOICE_NOW_STACK_MS;

  if (band === "now" && sameStepRecent) {
    return { speak: null, memory: aligned };
  }

  if (band !== "now") {
    if (elapsed < VOICE_MIN_GAP_MS) {
      return { speak: null, memory: aligned };
    }
    if (isNearDuplicatePrompt(line, aligned.lastLine)) {
      return { speak: null, memory: aligned };
    }
  }

  return {
    speak: line,
    memory: rememberSpoken(input.routeId, step.id, band, { at: nowMs, line }),
  };
}
