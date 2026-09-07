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
  isNearDuplicatePrompt,
  isSpeakableManeuver,
  pickBand,
  rememberSpoken,
  resolveUpcomingGuidance,
  sanitizeSpokenEnglish,
  stripFollowOnDistance,
  VOICE_AHEAD_M,
  VOICE_MIN_GAP_MS,
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

function assertNoMetric(spoken: string) {
  assert.doesNotMatch(spoken, /meter/i);
  assert.doesNotMatch(spoken, /metre/i);
  assert.doesNotMatch(spoken, /kilometer/i);
  assert.doesNotMatch(spoken, /kilometre/i);
  assert.doesNotMatch(spoken, /\bkms?\b/i);
  assert.doesNotMatch(spoken, /\b\d+(?:\.\d+)?\s*m\b/i);
}

test("formatVoicePrompt: upcoming turn uses feet / street name", () => {
  const spoken = formatVoicePrompt("Turn right onto Main Street", 152);
  assert.match(spoken, /in 500 feet/i);
  assert.match(spoken, /turn right onto Main Street/i);
  assertNoMetric(spoken);
  assert.equal(formatVoicePrompt("Turn right onto Main Street", 20), "Turn right onto Main Street");
});

test("formatVoicePrompt: miles above ~0.2 mi, never meters", () => {
  assert.equal(formatDistanceForVoice(1931), "1.2 miles");
  const spoken = formatVoicePrompt("Turn right onto Main Street", 700);
  assert.match(spoken, /in 0\.4 miles/i);
  assert.match(spoken, /turn right onto Main Street/i);
  assertNoMetric(spoken);
});

test("formatDistanceForVoice is US customary only", () => {
  assert.equal(formatDistanceForVoice(8), "");
  assert.equal(formatDistanceForVoice(160), "500 feet");
  assert.equal(formatDistanceForVoice(300), "1000 feet");
  assert.match(formatDistanceForVoice(400), /miles/);
  assert.equal(formatDistanceForVoice(800), "0.5 miles");
  assert.equal(formatDistanceForVoice(1609), "1 mile");
  assert.equal(formatDistanceForVoice(1931), "1.2 miles");
  for (const m of [80, 160, 300, 400, 800, 1609, 1931, 5000]) {
    assertNoMetric(formatDistanceForVoice(m));
  }
  assert.match(formatRemainLabel(70), /ft/);
  assert.match(formatRemainLabel(500), /mi|ft/);
  assert.doesNotMatch(formatRemainLabel(70), /m\b|meter/i);
});

test("HERE metric instruction copy is stripped / converted before speech", () => {
  assert.equal(
    stripFollowOnDistance("Turn right onto Main St. Go for 200 m."),
    "Turn right onto Main St",
  );
  const leftover = sanitizeSpokenEnglish("Continue for 1.5 kilometers toward Reno");
  assert.match(leftover, /miles/i);
  assertNoMetric(leftover);
  const prompt = formatVoicePrompt("Turn right onto Main St. Go for 200 m.", 152);
  assert.match(prompt, /in 500 feet/i);
  assert.match(prompt, /turn right onto Main St/i);
  assert.doesNotMatch(prompt, /go for/i);
  assertNoMetric(prompt);
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
  assert.ok(atTurn.remainM < VOICE_AHEAD_M);

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
  const t0 = 1_000_000;

  const muted = considerVoiceCue({
    enabled: false,
    routeId: "r1",
    guidance,
    memory: emptyVoiceMemory(),
    nowMs: t0,
  });
  assert.equal(muted.speak, null);

  const first = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance,
    memory: emptyVoiceMemory(),
    nowMs: t0,
  });
  assert.ok(first.speak);
  assert.match(first.speak, /500 feet/i);
  assert.match(first.speak, /turn right onto Main Street/i);
  assertNoMetric(first.speak);

  const again = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance,
    memory: first.memory,
    nowMs: t0 + 1_000,
  });
  assert.equal(again.speak, null);

  const nowTooSoon = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { ...guidance, remainM: VOICE_NOW_M - 5 },
    memory: first.memory,
    nowMs: t0 + 4_000,
  });
  assert.equal(nowTooSoon.speak, null);

  const now = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { ...guidance, remainM: VOICE_NOW_M - 5 },
    memory: first.memory,
    nowMs: t0 + 12_000,
  });
  assert.equal(now.speak, "Turn right onto Main Street");

  const jitterFar = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { ...guidance, remainM: 400 },
    memory: now.memory,
    nowMs: t0 + 20_000,
  });
  assert.equal(jitterFar.speak, null);
});

test("cooldown + near-duplicate skip extra chatter; now still fires after a gap", () => {
  const turn = guidanceSteps([
    step({
      instruction: "Turn right onto Main Street",
      maneuver: "turn",
      distanceM: 400,
    }),
  ])[0]!;
  const keep = guidanceSteps([
    step({
      instruction: "Keep right onto I-80",
      maneuver: "keep",
      distanceM: 800,
    }),
  ])[0]!;
  const t0 = 5_000_000;

  const first = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { step: turn, remainM: 600, index: 0 },
    memory: emptyVoiceMemory(),
    nowMs: t0,
  });
  assert.ok(first.speak);
  assert.match(first.speak!, /miles/i);
  assertNoMetric(first.speak!);

  const midCorridor = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { step: turn, remainM: 400, index: 0 },
    memory: first.memory,
    nowMs: t0 + 8_000,
  });
  assert.equal(midCorridor.speak, null);

  const otherStepTooSoon = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { step: { ...keep, id: "s-9" }, remainM: 500, index: 1 },
    memory: first.memory,
    nowMs: t0 + 10_000,
  });
  assert.equal(otherStepTooSoon.speak, null);

  const afterGap = considerVoiceCue({
    enabled: true,
    routeId: "r1",
    guidance: { step: { ...keep, id: "s-9" }, remainM: 500, index: 1 },
    memory: first.memory,
    nowMs: t0 + VOICE_MIN_GAP_MS + 500,
  });
  assert.ok(afterGap.speak);
  assert.match(afterGap.speak!, /keep right onto I-80/i);

  assert.equal(
    isNearDuplicatePrompt(
      "In 500 feet, turn right onto Main Street",
      "Turn right onto Main Street",
    ),
    true,
  );
});

test("corridor GPS ticks speak far fewer times than the old 4-band stack", () => {
  const steps = guidanceSteps([
    step({
      instruction: "Turn right onto Main Street. Go for 400 m.",
      maneuver: "turn",
      distanceM: 400,
    }),
  ]);
  const remainTicks = [2000, 900, 800, 600, 450, 400, 180, 150, 90, 40, 20];
  let memory = emptyVoiceMemory();
  const spoken: string[] = [];
  let t = 10_000_000;
  for (const remainM of remainTicks) {
    const cue = considerVoiceCue({
      enabled: true,
      routeId: "corridor",
      guidance: { step: steps[0]!, remainM, index: 0 },
      memory,
      nowMs: t,
    });
    memory = cue.memory;
    if (cue.speak) spoken.push(cue.speak);
    t += 4_000;
  }
  assert.ok(spoken.length >= 1 && spoken.length <= 2, `utterances ${spoken.length}: ${spoken.join(" | ")}`);
  assert.ok(spoken.some((s) => /turn right onto Main Street/i.test(s)));
  for (const s of spoken) assertNoMetric(s);
});

test("rememberSpoken + new routeId resets cues after reroute", () => {
  const mem = rememberSpoken("old", "s-1", "ahead", { at: 1, line: "old" });
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
    nowMs: 50_000,
  });
  assert.ok(next.speak);
  assert.match(next.speak, /keep left onto I-80/i);
  assertNoMetric(next.speak);
});

test("pickBand: two wide windows — silent until ~0.5 mi, now at the turn", () => {
  assert.equal(pickBand(2000), null);
  assert.equal(pickBand(800), "ahead");
  assert.equal(pickBand(400), "ahead");
  assert.equal(pickBand(150), "ahead");
  assert.equal(pickBand(20), "now");
  assert.ok(VOICE_NEAR_M <= VOICE_AHEAD_M);
});

test("Trips nav UI has a speaker toggle and uses Web Speech Synthesis — no mic", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const speech = readFileSync(join(root, "navSpeech.ts"), "utf8");
  const hook = readFileSync(join(root, "useNavVoice.ts"), "utf8");
  const chrome = readFileSync(join(root, "../../styles.css"), "utf8");
  const voice = readFileSync(join(root, "voiceGuidance.ts"), "utf8");

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
  assert.match(speech, /sanitizeSpokenEnglish/);
  assert.doesNotMatch(speech, /getUserMedia\s*\(/);
  assert.doesNotMatch(speech, /SpeechRecognition/);
  assert.doesNotMatch(speech, /mediaDevices/);

  assert.match(hook, /unlockNavSpeech/);
  assert.match(hook, /speakNavPrompt/);
  assert.doesNotMatch(hook, /getUserMedia/);

  assert.match(voice, /VOICE_MIN_GAP_MS/);
  assert.match(voice, /sanitizeSpokenEnglish/);
  assert.doesNotMatch(voice, /api\.mapbox\.com\/directions/);

  assert.match(chrome, /\[data-trips-chrome\]/);
  assert.match(chrome, /z-index:\s*40/);
});
