import assert from "node:assert/strict";
import test from "node:test";
import {
  extractHereNotices,
  normalizeHereRoute,
  coachToTruckVehicle,
} from "./hereRouting.ts";

const ORIGIN = { lng: -119.8, lat: 39.5 };
const DEST = { lng: -122.3, lat: 47.6 };
const VEHICLE = coachToTruckVehicle({
  heightFt: 13.5,
  widthFt: 8.5,
  lengthFt: 45,
  weightLbs: 44000,
});

const HERE_BODY: Record<string, unknown> = {
  routes: [
    {
      notices: [
        {
          title: "Violated vehicle restriction.",
          code: "violatedVehicleRestriction",
          severity: "critical",
          details: [
            {
              type: "restriction",
              cause: "Route violates vehicle restriction: height limit",
              maxHeight: 380,
            },
          ],
        },
        {
          title: "Simple polyline",
          code: "simplePolyline",
          severity: "info",
        },
      ],
      sections: [
        {
          summary: { length: 1609, duration: 90 },
          actions: [
            {
              action: "depart",
              instruction: "Head through the tunnel on I-80",
              name: "I-80",
              length: 800,
              duration: 45,
            },
            {
              action: "arrive",
              instruction: "Arrive at destination",
              name: "",
              length: 0,
              duration: 0,
            },
          ],
          notices: [
            {
              title: "Seasonal closure.",
              code: "seasonalClosure",
              severity: "info",
              details: [{ type: "restriction", cause: "Seasonal closure ahead" }],
            },
          ],
          spans: [{ offset: 0, notices: [0] }, { offset: 12 }],
        },
      ],
    },
  ],
};

test("extractHereNotices: route + section notices, skip noise and span indexes", () => {
  const notices = extractHereNotices(HERE_BODY);
  assert.equal(notices.length, 2);
  assert.equal(notices[0]!.code, "violatedVehicleRestriction");
  assert.equal(notices[0]!.severity, "critical");
  assert.match(notices[0]!.cause || "", /height limit/);
  assert.match(notices[0]!.cause || "", /380 cm/);
  assert.equal(notices[1]!.code, "seasonalClosure");
  assert.ok(!notices.some((n) => n.code === "simplePolyline"));
});

test("extractHereNotices: empty body is empty — no invented alerts", () => {
  assert.deepEqual(extractHereNotices({}), []);
  assert.deepEqual(extractHereNotices({ routes: [{ sections: [{}] }] }), []);
});

test("normalizeHereRoute attaches extracted notices", () => {
  const route = normalizeHereRoute(HERE_BODY, {
    origin: ORIGIN,
    destination: DEST,
    vehicle: VEHICLE,
  });
  assert.equal(route.source, "here");
  assert.equal(route.notices?.length, 2);
  assert.equal(route.notices?.[0]?.source, "here");
  assert.equal(route.steps.length > 0, true);
});
