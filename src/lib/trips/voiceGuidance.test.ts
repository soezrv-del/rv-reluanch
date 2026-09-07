import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { OsrmLngLat, OsrmStep } from "./osrm.ts";
import {
  considerVoiceCue,
  emptyVoiceMemory,
  formatDistanceForVoice,
  formatRemainLabel,
  formatVoicePrompt,
  guidanceSteps,
  isSpeakableManeuver,
  pickBand,
  rememberSpoken,
  resolveUpcomingGuidance,
  VOICE_NEAR_M,
  VOICE_NOW_M,
} from "./voiceGuidance.ts";

const root = dirname(fileURLToPath(import.meta.url));

const ORIGIN: OsrmLngLat = { lng: -119.8138, lat: 39.5296 };

/** 1° lat ≈ 111_195 m. */
function shiftMeters(p: OsrmLngLat, northM: number, eastM = 0): OsrmLngLat {
  const latRad = (p.lat * Math.PI) / 180;
  return {
    lat: p.lat + northM / 111_195,
    lng: p.lng + eastM / (111_195 * Math.cos(latRad)),
  };
}

function step(
  partial: Partial<OsrmStep> & Pick<OsrmStep, "instruction" | "maneuver">,
): OsrmStep {
  return {
    name: "",
    distanceM: 0,
    durationS: 0,
    location: null,
    ...partial,
  };
}

test("formatVoicePrompt: upcoming turn uses feet / street name", () => {
  const spoken = formatVoicePrompt("Turn right onto Main Street", 152);
  assert.match(spoken, /in 500 feet/i);
  assert.match(spoken, /turn right onto Main Street/i);
  assert.equal(formatVoicePrompt("Turn right onto Main Street", 20), "Turn right onto Main Street");
});

test("formatDistanceForVoice bands stay spoken-English", () => {
  assert.equal(formatDistanceForVoice(8), "");
  assert.match(formatDistanceForVoice(160), /feet/);
  assert.equal(formatDistanceForVoice(400), "a quarter mile");
  assert.equal(formatDistanceForVoice(800), "half a mile");
  assert.equal(formatDistanceForVoice(1609), "1 mile");
  assert.match(formatRemainLabel(70), /ft/);
  assert.match(formatRemainLabel(500), /mi|ft/);
});

test("isSpeakableManeuver skips depart / bare continue", () => {
  assert.equal(isSpeakableManeuver("depart", "Head out on I-80"), false);
  assert.equal(isSpeakableManeuver("continue", "Continue"), false);
  assert.equal(isSpeakableManeuver("turn", "Turn right onto US-395"), true);
  assert.equal(isSpeakableManeuver("arrive", "Arrive at destination"), true);
  assert.equal(isSpeakableManeuver("keep", "Keep left onto I-5"), true);
});

test("resolveUpcomingGuidance uses step distances along the polyline", () => {
  const turnAt = 600;
  const dest = shiftMeters(ORIGIN, 1000);
  const turn = shiftMeters(ORIGIN, turnAt);
  const line: [number, number][] = [
    [ORIGIN.lng, ORIGIN.lat],
    [turn.lng, turn.lat],
    [dest.lng, dest.lat],
  ];
  const steps: OsrmStep[] = [
    step({
      instruction: "Head out on Virginia",
      maneuver: "depart",
      distanceM: 600,
      location: ORIGIN,
    }),
    step({
      instruction: "Turn right onto Main Street",
      maneuver: "turn",
      distanceM: 400,
      location: turn,
    }),
    step({
      instruction: "Arrive at destination",
      maneuver: "arrive",
      distanceM: 0,
      location: dest,
    }),
  ];

  const approaching = resolveUpcomingGuidance({
    steps,
    fix: shiftMeters(ORIGIN, 500),
    polyline: line,
    routeDistanceM: 1000,
  });
  assert.ok(approaching);
  assert.equal(approaching.step.instruction, "Turn right onto Main Street");
  assert.ok(
    approaching.remainM > 50 && approaching.remainM < 180,
    `remain ${approaching.remainM}`,
  );

  const atTurn = resolveUpcomingGuidance({
    steps,
    fix: shiftMeters(ORIGIN, 590),
    polyline: line,
    routeDistanceM: 1000,
  });
  assert.ok(atTurn);
  assert.equal(atTurn.step.maneuver, "turn");
  assert.ok(atTurn.remainM < VOICE_NEAR_M);

  const after = resolveUpcomingGuidance({
    steps,
    fix: shiftMeters(ORIGIN, 980),
    polyline: line,
    routeDistanceM: 1000,
  });
  assert.ok(after);
  assert.equal(after.step.maneuver, "arrive");
});

test("HERE-style steps with null locations still resolve from polyline progress", () => {
  const dest = shiftMeters(ORIGIN, 800);
  const line: [number, number][] = [
    [ORIGIN.lng, ORIGIN.lat],
    [dest.lng, dest.lat],
  ];
  const steps: OsrmStep[] = [
    step({ instruction: "Depart", maneuver: "depart", distanceM: 350 }),
    step({
      instruction: "Turn left onto Fourth",
      maneuver: "turn",
      distanceM: 450,
    }),
    step({ instruction: "Arrive at destination", maneuver: "arrive", distanceM: 0 }),
  ];
  const g = resolveUpcomingGuidance({
    steps,
    fix: shiftMeters(ORIGIN, 250),
    polyline: line,
    routeDistanceM: 800,
  });
  assert.ok(g);
  assert.match(g.step.instruction, /Turn left onto Fourth/);
  assert.ok(g.remainM > 40 && g.remainM < 200, `remain ${g.remainM}`);
});

test("considerVoiceCue speaks once per band; mute is silent", () => {
  const steps = guidanceSteps([
    step({
      instruction: "Turn right onto Main Street",
      maneuver: "turn",
      distanceM: 400,
    }),
  ]);
  const guidance = {
    step: steps[0]!,
    remainM: 150,
    index: 0,
  };

  const muted = considerVoiceCue({
    enabled: false,
    routeId: "r1",
    guidance,
    memory: emptyVoiceMemory(),
  });
  assert.equal(muted.speak, null);

  const first = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance,
    memory: emptyVoiceMemory(),
  });
  assert.ok(first.speak);
  assert.match(first.speak, /500 feet/i);
  assert.match(first.speak, /turn right onto Main Street/i);

  const again = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance,
    memory: first.memory,
  });
  assert.equal(again.speak, null);

  const now = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { ...guidance, remainM: VOICE_NOW_M - 5 },
    memory: first.memory,
  });
  assert.equal(now.speak, "Turn right onto Main Street");

  const jitterFar = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { ...guidance, remainM: 400 },
    memory: now.memory,
  });
  assert.equal(jitterFar.speak, null);
});

test("rememberSpoken + new routeId resets cues after reroute", () => {
  const mem = rememberSpoken("old", "s-1", "near");
  const steps = guidanceSteps([
    step({
      instruction: "Keep left onto I-80",
      maneuver: "fork",
      distanceM: 200,
    }),
  ]);
  const next = considerVoiceCue({
    enabled: true,
    routeId: "new",
    guidance: { step: steps[0]!, remainM: 140, index: 0 },
    memory: mem,
  });
  assert.ok(next.speak);
  assert.match(next.speak, /keep left onto I-80/i);
});

test("pickBand: too far is silent until the approach window", () => {
  assert.equal(pickBand(2000), null);
  assert.equal(pickBand(800), "mile");
  assert.equal(pickBand(400), "far");
  assert.equal(pickBand(150), "near");
  assert.equal(pickBand(20), "now");
});

test("Trips nav UI has a speaker toggle and uses Web Speech Synthesis — no mic", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const speech = readFileSync(join(root, "navSpeech.ts"), "utf8");
  const hook = readFileSync(join(root, "useNavVoice.ts"), "utf8");
  const chrome = readFileSync(join(root, "../../styles.css"), "utf8");

  assert.match(ui, /data-voice-toggle/);
  assert.match(ui, /data-nav-voice/);
  assert.match(ui, /useNavVoice/);
  assert.match(ui, /data-trips-chrome/);
  assert.match(ui, /useOffRouteReroute/);
  assert.match(ui, /glass-prestige/);
  assert.match(ui, /rounded-full/);
  assert.match(ui, /border-white\/20 bg-black\/30/);
  assert.ok(
    ui.indexOf("Start Turn-by-Turn") < ui.indexOf("data-nav-voice"),
    "speaker lives on armed TBT chrome, after Start Turn-by-Turn",
  );
  const plan = ui.slice(
    ui.indexOf('placeholder="Where to?"'),
    ui.indexOf("Start Turn-by-Turn"),
  );
  assert.doesNotMatch(plan, /data-voice-toggle|data-nav-voice/);
  assert.doesNotMatch(ui, /getUserMedia/);
  assert.doesNotMatch(ui, /mediaDevices/);
  assert.doesNotMatch(ui, /GUIDANCE · STEP/);
  assert.doesNotMatch(ui, /navStepIdx/);
  assert.doesNotMatch(ui, /["'`]\/api\/route/);
  assert.doesNotMatch(ui, /api\.mapbox\.com\/directions/);

  assert.match(speech, /speechSynthesis/);
  assert.match(speech, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(speech, /getUserMedia\s*\(/);
  assert.doesNotMatch(speech, /SpeechRecognition/);
  assert.doesNotMatch(speech, /mediaDevices/);

  assert.match(hook, /unlockNavSpeech/);
  assert.match(hook, /speakNavPrompt/);
  assert.doesNotMatch(hook, /getUserMedia/);

  assert.match(chrome, /\[data-trips-chrome\]/);
  assert.match(chrome, /z-index:\s*40/);
});
