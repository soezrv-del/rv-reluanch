import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { getRating } from "./towVehicles.ts";
import { hitchLoadLbs } from "./towReverse.ts";
import { DEFAULT_TOW_VEHICLE } from "./towYear.ts";
import {
  bedHitchFit,
  combinedExceedsGcwr,
  estimateCombinedLbs,
  evaluateTowMatch,
  hitchKindForRvType,
} from "./towMatch.ts";

const root = dirname(fileURLToPath(import.meta.url));

function defaultFifth(over: Partial<Parameters<typeof evaluateTowMatch>[0]> = {}) {
  const d = DEFAULT_TOW_VEHICLE;
  const r = getRating(d.make, d.model, d.trim);
  return evaluateTowMatch({
    hasVehicle: true,
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: r.maxTow,
    payload: r.payload,
    gcwr: r.gcwr,
    bed: "6.5 ft (Standard Bed)",
    vehicleIsTruck: true,
    ...over,
  });
}

test("hitch kind: pin on 5th, tongue on travel trailer", () => {
  assert.equal(hitchKindForRvType("Fifth Wheel"), "pin");
  assert.equal(hitchKindForRvType("Travel Trailer"), "tongue");
});

test("typed tongue wins; blank TT estimates ~12%", () => {
  assert.equal(hitchLoadLbs({ rvType: "Travel Trailer", gvwrLbs: 7000 }), 840);
  assert.equal(
    hitchLoadLbs({ rvType: "Travel Trailer", gvwrLbs: 7000, tongueLbs: 950 }),
    950,
  );
  assert.equal(
    hitchLoadLbs({ rvType: "Travel Trailer", gvwrLbs: 7000, hitchLbs: 1100 }),
    1100,
  );
});

test("default Super Duty + sample 14k 5th still passes honest match", () => {
  const v = defaultFifth();
  assert.equal(v.overallOk, true);
  assert.equal(v.towOk, true);
  assert.equal(v.hitchOk, true);
  assert.equal(v.gcwrOk, true);
  assert.equal(v.hitchLoad, 2800);
  assert.equal(v.hitchKind, "pin");
  assert.equal(v.hitchEstimated, true);
  assert.equal(v.bed?.key, "standard");
  assert.equal(v.bed?.level, "advisory");
});

test("5th typed pin over payload fails the hitch budget", () => {
  const v = defaultFifth({ hitchLbs: 6000 });
  assert.equal(v.hitchLoad, 6000);
  assert.equal(v.hitchEstimated, false);
  assert.equal(v.hitchOk, false);
  assert.equal(v.overallOk, false);
  assert.equal(v.towOk, true);
  assert.ok(v.checks.some((c) => c.id === "hitch" && c.level === "fail"));
});

test("TT tongue estimate and typed tongue vs payload", () => {
  const d = DEFAULT_TOW_VEHICLE;
  const r = getRating(d.make, d.model, d.trim);
  const estimated = evaluateTowMatch({
    hasVehicle: true,
    rvType: "Travel Trailer",
    gvwrLbs: 7000,
    maxTow: r.maxTow,
    payload: r.payload,
    gcwr: r.gcwr,
  });
  assert.equal(estimated.hitchKind, "tongue");
  assert.equal(estimated.hitchLoad, 840);
  assert.equal(estimated.hitchOk, true);
  assert.equal(estimated.overallOk, true);

  const heavy = evaluateTowMatch({
    hasVehicle: true,
    rvType: "Travel Trailer",
    gvwrLbs: 7000,
    hitchLbs: 6000,
    maxTow: r.maxTow,
    payload: r.payload,
    gcwr: r.gcwr,
  });
  assert.equal(heavy.hitchLoad, 6000);
  assert.equal(heavy.hitchOk, false);
  assert.equal(heavy.overallOk, false);
});

test("GCWR fail: trailer alone over sticker GCWR (tow still under max)", () => {
  const v = evaluateTowMatch({
    hasVehicle: true,
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: 20000,
    payload: 4000,
    gcwr: 12000,
  });
  assert.equal(v.towOk, true);
  assert.equal(v.hitchOk, true);
  assert.equal(v.hitchLoad, 2800);
  assert.equal(v.gcwrSkipped, false);
  assert.equal(v.gcwrOk, false);
  assert.equal(v.overallOk, false);
  assert.ok(v.combined);
  assert.equal(v.combined!.combinedLbs > v.combined!.gcwr, true);
  assert.ok(v.checks.some((c) => c.id === "gcwr" && c.level === "fail"));
});

test("missing GCWR skips combo — we do not invent maxTow+payload+5000", () => {
  const est = estimateCombinedLbs({ gcwr: 0, maxTow: 20000, gvwrLbs: 14000 });
  assert.equal(est, null);

  const v = evaluateTowMatch({
    hasVehicle: true,
    rvType: "Travel Trailer",
    gvwrLbs: 7000,
    maxTow: 20000,
    payload: 4000,
    gcwr: 0,
  });
  assert.equal(v.gcwrSkipped, true);
  assert.equal(v.gcwrOk, true);
  assert.equal(v.overallOk, true);
  assert.equal(v.combined, null);
});

test("combined residual + trailer; trailer > GCWR is always a fail", () => {
  const ok = estimateCombinedLbs({ gcwr: 31000, maxTow: 23200, gvwrLbs: 14000 });
  assert.ok(ok);
  assert.equal(ok.truckResidual, 7800);
  assert.equal(ok.combinedLbs, 21800);
  assert.equal(combinedExceedsGcwr(ok), false);

  const over = estimateCombinedLbs({ gcwr: 12000, maxTow: 20000, gvwrLbs: 14000 });
  assert.ok(over);
  assert.equal(over.truckResidual, 0);
  assert.equal(over.combinedLbs, 14000);
  assert.equal(combinedExceedsGcwr(over), true);
});

test("missing payload skips hitch check — we do not invent payload", () => {
  const v = evaluateTowMatch({
    hasVehicle: true,
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: 20000,
    payload: 0,
    gcwr: 30000,
  });
  assert.equal(v.hitchSkipped, true);
  assert.equal(v.hitchOk, true);
  assert.equal(v.towOk, true);
  assert.equal(v.overallOk, true);
});

test("bed rule: short needs slider, standard advisory, long ok, TT none", () => {
  assert.equal(bedHitchFit("5.5 ft (Short Bed)", "Fifth Wheel")?.level, "needed");
  assert.equal(bedHitchFit("6.5 ft (Standard Bed)", "Fifth Wheel")?.level, "advisory");
  assert.equal(bedHitchFit("8 ft (Long Bed)", "Fifth Wheel")?.level, "ok");
  assert.equal(bedHitchFit("6.5 ft (Standard Bed)", "Travel Trailer"), null);
  assert.equal(bedHitchFit("5.5 ft (Short Bed)", "Fifth Wheel", false), null);

  const short = defaultFifth({ bed: "5.5 ft (Short Bed)" });
  assert.equal(short.bed?.level, "needed");
  assert.equal(short.overallOk, true, "bed is advisory — does not flip OEM pass/fail");
  assert.ok(short.checks.some((c) => c.id === "bed"));
});

test("RvTowApp wires honest match and no longer invents custom GCWR", () => {
  const src = readFileSync(join(root, "../../components/rvtow/RvTowApp.tsx"), "utf8");
  assert.equal(src.includes("evaluateTowMatch"), true);
  assert.equal(src.includes("bedHitchFit") || src.includes("verdict.bed"), true);
  assert.equal(src.includes("TONGUE") || src.includes("Tongue"), true);
  assert.equal(src.includes("maxTow + payload + 5000"), false);
  assert.equal(src.includes("maxTow+payload+5000"), false);
  assert.equal(/payload \+ 5000/.test(src), false);
});

test("RvTowApp salesman default: truck + coach + two numbers, More details collapsed", () => {
  const src = readFileSync(join(root, "../../components/rvtow/RvTowApp.tsx"), "utf8");
  const truck = src.indexOf("data-tow-truck");
  const coach = src.indexOf("data-tow-coach");
  const answer = src.indexOf("<AnswerHero");
  const details = src.indexOf(">More details<");
  const disclaimer = src.indexOf("<SuiteDisclaimer");
  const gvwr = src.indexOf("RV GVWR (lbs)");
  const trim = src.indexOf("TRIM / ENGINE / CONFIGURATION");
  const bed = src.indexOf("TRUCK BED LENGTH");
  assert.ok(truck >= 0 && truck < details, "truck picker sits above More details");
  assert.ok(coach >= 0 && coach < details, "coach picker sits above More details");
  assert.ok(answer >= 0 && answer < details, "max tow + pin sit above More details");
  assert.ok(disclaimer > details, "one SuiteDisclaimer after More details");
  assert.equal(src.split("<SuiteDisclaimer").length - 1, 1);
  assert.match(src, /const \[detailsOpen, setDetailsOpen\] = useState\(false\)/);
  assert.match(src, /function AnswerHero/);
  assert.match(src, /function GlanceChecks/);
  assert.match(src, /function GuideHero/);
  assert.equal(src.includes("function GuideCard"), false);
  assert.equal(src.includes(">Details<"), false);
  assert.ok(gvwr > details, "GVWR lives in More details");
  assert.ok(
    trim >= 0 && trim < details,
    "trim / engine stays on the default view — required for max tow + pin",
  );
  assert.ok(
    src.lastIndexOf("TRIM / ENGINE / CONFIGURATION") < details,
    "More details must not bury the trim picker the math needs",
  );
  assert.ok(bed > details, "bed length lives in More details");
  assert.ok(
    src.indexOf("<HitchWeightField") > details,
    "typed pin/tongue field lives in More details",
  );
  assert.ok(
    src.indexOf("<GlanceChecks") > details,
    "GlanceChecks stay behind More details",
  );
  assert.ok(
    src.indexOf("<GuideHero") > details,
    "percentage hitch guides stay behind More details",
  );
  assert.equal(
    src.includes("checks={"),
    false,
    "GuideHero face is kicker/title/% only — no checks list",
  );
  assert.equal(src.includes("✓ {item}"), false);
  assert.match(
    src,
    /more stable at speed, higher weight limits, lower center of gravity/,
  );
  assert.match(
    src,
    /no bed modification, ball hitch \(universal\), full bed access kept/,
  );
  assert.equal(src.includes("More info if saved"), false);
  assert.equal(src.includes("Lower weight only"), false);
  assert.equal(src.includes("Full weight only"), false);
  assert.equal(src.includes("Approx when properly equipped"), false);
  assert.equal(src.includes("confirm the door sticker"), false);
});
