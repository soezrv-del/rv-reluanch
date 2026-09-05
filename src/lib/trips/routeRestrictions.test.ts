import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  analyzeRouteRestrictions,
  isHereTruckRoute,
  saferAppliedNote,
  saferCtaLabel,
  saferRouteIntent,
} from "./routeRestrictions.ts";
import { EMPTY_COACH_PROFILE, type CoachProfile } from "./coachProfile.ts";
import type { OsrmRouteResult, OsrmStep } from "./osrm.ts";

const root = dirname(fileURLToPath(import.meta.url));

const COACH: CoachProfile = {
  ...EMPTY_COACH_PROFILE,
  make: "Tiffin",
  model: "Phaeton",
  year: "2022",
  lengthFt: 40,
  heightFt: 13.2,
  widthFt: 8.5,
  weightLbs: 32000,
  locked: true,
};

const FROM = { lng: -119.8, lat: 39.5 };
const TO = { lng: -122.3, lat: 47.6 };

function step(instruction: string, name = ""): OsrmStep {
  return {
    instruction,
    name,
    distanceM: 400,
    durationS: 30,
    maneuver: "continue",
    location: null,
  };
}

function stubRoute(partial: Partial<OsrmRouteResult> = {}): OsrmRouteResult {
  return {
    source: "osrm",
    engine: "REAL ROUTE · OSRM",
    baseUrl: "https://router.project-osrm.org",
    profile: "driving",
    code: "Ok",
    distanceM: 1_126_000,
    durationS: 42_000,
    miles: 699.7,
    driveHours: 11,
    driveMinutes: 40,
    geometry: { type: "LineString", coordinates: [[FROM.lng, FROM.lat], [TO.lng, TO.lat]] },
    steps: [step("Head west on I-80")],
    waypoints: [],
    origin: FROM,
    destination: TO,
    fetchedAt: "2026-09-05T00:00:00.000Z",
    ...partial,
  };
}

test("HERE Truck surfaces API notices, not instruction word-match", () => {
  const route = stubRoute({
    source: "here",
    engine: "RV-SAFE · HERE Truck",
    routingMode: "rv_safe",
    steps: [step("Head through the tunnel on I-80", "I-80")],
    notices: [
      {
        code: "violatedVehicleRestriction",
        title: "Violated vehicle restriction.",
        severity: "critical",
        cause: "Route violates vehicle restriction: max height 380 cm (12.5 ft)",
        source: "here",
      },
    ],
  });
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Seattle",
    originLabel: "Reno",
  });
  assert.equal(out.source, "here");
  assert.equal(out.canSuggestSafer, false);
  assert.equal(out.alerts.length, 1);
  assert.equal(out.alerts[0]!.kind, "HEIGHT CLEARANCE");
  assert.match(out.alerts[0]!.body, /380 cm/);
  assert.match(out.banner, /HERE Truck/);
  assert.ok(!out.alerts.some((a) => /propane/i.test(a.title)));
});

test("HERE Truck with no notices does not invent tunnel/grade alerts", () => {
  const route = stubRoute({
    source: "here",
    routingMode: "rv_safe",
    steps: [
      step("Continue through the tunnel"),
      step("Climb the Sierra grade toward the summit"),
    ],
    notices: [],
  });
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Glacier NP · Going-to-the-Sun",
    originLabel: "Zion",
  });
  assert.equal(out.alerts.length, 0);
  assert.equal(out.canSuggestSafer, false);
  assert.equal(out.source, "none");
  assert.match(out.summary, /no restriction notices/i);
});

test("OSRM drops tunnel/grade word-match clearance alerts", () => {
  const route = stubRoute({
    source: "osrm",
    steps: [
      step("Enter the tunnel"),
      step("Continue over the mountain pass"),
      step("Cross the bridge"),
    ],
  });
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Glacier NP",
    originLabel: "Zion National Park",
  });
  assert.equal(out.alerts.length, 0);
  assert.ok(!out.alerts.some((a) => /clearance|grade|propane|height/i.test(a.kind)));
});

test("OSRM ferry is a labeled text hint only", () => {
  const route = stubRoute({
    source: "osrm",
    steps: [step("Take the ferry across the sound", "Mukilteo Ferry")],
  });
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Seattle",
    originLabel: "Reno",
  });
  assert.equal(out.source, "heuristic");
  assert.equal(out.alerts.length, 1);
  assert.equal(out.alerts[0]!.kind, "TEXT HINT");
  assert.match(out.alerts[0]!.body, /not a clearance database/i);
  assert.match(out.banner, /not a clearance database/i);
  assert.equal(out.canSuggestSafer, true);
});

test("OSRM car fallback is not treated as HERE Truck", () => {
  const route = stubRoute({
    source: "osrm",
    routingMode: "rv_safe",
    fallbackFrom: "here",
    steps: [step("Enter the tunnel under the parkway")],
  });
  assert.equal(isHereTruckRoute(route), false);
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Seattle",
    originLabel: "Reno",
  });
  assert.equal(out.alerts.length, 0);
  assert.equal(
    saferRouteIntent({
      coach: COACH,
      route,
      canSuggestSafer: out.canSuggestSafer,
    }),
    "none",
  );
});

test("OSRM low highway share can offer re-rank without fake clearance alerts", () => {
  const route = stubRoute({
    source: "osrm",
    scoreBreakdown: {
      turns: 12,
      minorRoadM: 800,
      highwayM: 200,
      parts: {},
    },
    distanceM: 1000,
    steps: [
      step("Turn onto Farm Road"),
      step("Continue on Forest Lane"),
      step("Turn onto Court Drive"),
      step("Continue on Service Alley"),
    ],
  });
  const out = analyzeRouteRestrictions({
    coach: COACH,
    route,
    hasRoute: true,
    destLabel: "Seattle",
    originLabel: "Reno",
  });
  assert.equal(out.alerts.length, 0);
  assert.equal(out.canSuggestSafer, true);
  assert.equal(
    saferRouteIntent({ coach: { ...COACH, locked: false }, route, canSuggestSafer: true }),
    "osrm_rerank",
  );
});

test("saferRouteIntent: truck when locked on plain OSRM, else honest re-rank", () => {
  const osrm = stubRoute({ source: "osrm" });
  assert.equal(
    saferRouteIntent({ coach: COACH, route: osrm, canSuggestSafer: false }),
    "here_truck",
  );
  assert.equal(saferCtaLabel("here_truck"), "Safer RV · HERE Truck");

  const fallback = stubRoute({
    source: "osrm",
    routingMode: "rv_safe",
    fallbackFrom: "here",
  });
  assert.equal(
    saferRouteIntent({ coach: COACH, route: fallback, canSuggestSafer: true }),
    "osrm_rerank",
  );
  assert.equal(saferCtaLabel("osrm_rerank"), "OSRM highway re-rank");

  const here = stubRoute({ source: "here", routingMode: "rv_safe" });
  assert.equal(
    saferRouteIntent({ coach: COACH, route: here, canSuggestSafer: true }),
    "none",
  );

  const unlocked = { ...COACH, locked: false };
  assert.equal(
    saferRouteIntent({
      coach: unlocked,
      route: osrm,
      canSuggestSafer: true,
    }),
    "osrm_rerank",
  );

  assert.match(saferAppliedNote("osrm_rerank", osrm), /not truck routing/);
  assert.match(saferAppliedNote("here_truck", here), /HERE Truck path/);
  assert.match(saferAppliedNote("here_truck", fallback), /Not truck routing/);
});

test("Navigate copy stays honest and never calls /api/route", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const helpers = readFileSync(join(root, "routeRestrictions.ts"), "utf8");
  assert.match(ui, /saferCtaLabel/);
  assert.match(ui, /HERE Truck notices/);
  assert.match(ui, /not a clearance database/);
  assert.match(ui, /fetchNavigateRoute/);
  assert.match(helpers, /OSRM highway re-rank/);
  assert.match(helpers, /Safer RV · HERE Truck/);
  assert.doesNotMatch(ui, /["']Safer path["']/);
  assert.doesNotMatch(ui, /\/api\/route/);
  assert.doesNotMatch(helpers, /\/api\/route/);
});
