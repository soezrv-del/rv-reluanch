import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  estimateCombinedLbs,
  hitchKindForRvType,
  summarizeTruckFit,
} from "./towMatch.ts";
import {
  hitchLoadLbs,
  recommendedPayloadLbs,
  recommendedTowLbs,
} from "./towReverse.ts";
import { buildTowObjections } from "./towObjections.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

test("GAP when GVWR or truck max tow is missing — no invented rating", () => {
  const noGvwr = buildTowObjections({ rvType: "Fifth Wheel", maxTow: 20000 });
  assert.equal(noGvwr.length >= 2 && noGvwr.length <= 4, true);
  const towGap = noGvwr.find((l) => l.id === "tow");
  assert.ok(towGap);
  assert.equal(towGap.gap, true);
  assert.match(towGap.a, /GAP/);
  assert.match(towGap.a, /GVWR/);

  const noTruck = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 16500,
  });
  const heavy = noTruck.find((l) => l.id === "tow");
  assert.ok(heavy);
  assert.equal(heavy.gap, true);
  assert.match(heavy.a, /GAP/);
  assert.match(heavy.a, /max tow/);
  assert.equal(
    noTruck.some((l) => l.id === "combo"),
    false,
    "payload / GCWR skipped when truck numbers are absent",
  );
});

test("pin/tongue: estimate from hitch fraction, typed wins, GAP without GVWR", () => {
  const est = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
  });
  const pin = est.find((l) => l.id === "hitch");
  assert.ok(pin);
  assert.equal(pin.gap, false);
  assert.equal(hitchKindForRvType("Fifth Wheel"), "pin");
  assert.equal(hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: 14000 }), 2800);
  assert.match(pin.q, /pin/i);
  assert.match(pin.a, /Est\./);
  assert.match(pin.a, /2,800/);
  assert.match(pin.a, /20%/);

  const typed = buildTowObjections({
    rvType: "Travel Trailer",
    gvwrLbs: 7000,
    hitchLbs: 950,
  });
  const tongue = typed.find((l) => l.id === "hitch");
  assert.ok(tongue);
  assert.equal(tongue.gap, false);
  assert.match(tongue.q, /tongue/i);
  assert.match(tongue.a, /Typed/);
  assert.match(tongue.a, /950/);
  assert.doesNotMatch(tongue.a, /Est\./);

  const gap = buildTowObjections({ rvType: "Travel Trailer" });
  const hitchGap = gap.find((l) => l.id === "hitch");
  assert.ok(hitchGap);
  assert.equal(hitchGap.gap, true);
  assert.match(hitchGap.a, /GAP/);
});

test("too-heavy uses real GVWR vs max / rec tow — not fluff", () => {
  const under = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: 20000,
  });
  const tow = under.find((l) => l.id === "tow");
  assert.ok(tow);
  assert.equal(tow.gap, false);
  assert.equal(recommendedTowLbs(20000), 16000);
  assert.match(tow.a, /14,000/);
  assert.match(tow.a, /20,000/);
  assert.match(tow.a, /16,000/);
  assert.match(tow.a, /under max/);

  const thin = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 17000,
    maxTow: 20000,
  });
  assert.match(thin.find((l) => l.id === "tow")!.a, /over .* rec \(80%\)/);

  const over = buildTowObjections({
    rvType: "Travel Trailer",
    gvwrLbs: 9000,
    maxTow: 7000,
  });
  assert.match(over.find((l) => l.id === "tow")!.a, /exceeds/);
});

test("payload / GCWR only when truck numbers exist; reuse match math", () => {
  const both = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: 23200,
    payload: 4000,
    gcwr: 31000,
  });
  assert.equal(both.length <= 4, true);
  const combo = both.find((l) => l.id === "combo");
  assert.ok(combo);
  assert.equal(combo.gap, false);
  assert.match(combo.q, /Payload \/ GCWR/);
  assert.equal(hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: 14000 }), 2800);
  assert.equal(recommendedPayloadLbs(4000), 3400);
  const est = estimateCombinedLbs({
    gcwr: 31000,
    maxTow: 23200,
    gvwrLbs: 14000,
  });
  assert.ok(est);
  assert.equal(est.combinedLbs, 21800);
  assert.match(combo.a, /2,800/);
  assert.match(combo.a, /4,000/);
  assert.match(combo.a, /21,800/);
  assert.match(combo.a, /31,000/);

  const payloadOnly = buildTowObjections({
    rvType: "Travel Trailer",
    gvwrLbs: 7000,
    payload: 2000,
  });
  const pay = payloadOnly.find((l) => l.id === "combo");
  assert.ok(pay);
  assert.match(pay.a, /payload/i);
  assert.doesNotMatch(pay.a, /GCWR/);

  const noTruck = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
  });
  assert.equal(
    noTruck.some((l) => l.id === "combo"),
    false,
  );
});

test("insurance is out of Tow scope — omit, never invent coverage", () => {
  const lines = buildTowObjections({
    rvType: "Fifth Wheel",
    gvwrLbs: 14000,
    maxTow: 20000,
    payload: 4000,
    gcwr: 31000,
    hitchLbs: 2800,
  });
  const blob = JSON.stringify(lines);
  assert.doesNotMatch(blob, /insur/i);
  assert.doesNotMatch(blob, /coverage/i);
  assert.doesNotMatch(blob, /policy/i);
});

test("RvTowApp: lot-desk strip + Fit glance on default view when Facts towable", () => {
  const ui = src("../../components/rvtow/RvTowApp.tsx");
  const helper = src("towObjections.ts");
  assert.match(ui, /buildTowObjections/);
  assert.match(ui, /data-tow-lot-desk/);
  assert.match(ui, /Lot desk · weight/);
  assert.match(ui, /data-tow-fit-glance/);
  assert.match(ui, /data-tow-bed-note/);
  assert.match(ui, /prefill\.kind === "towable"/);
  assert.doesNotMatch(helper, /from "\.\.\/rvfax/);
  assert.doesNotMatch(helper, /from "\.\.\/trips/);
  assert.doesNotMatch(ui, /family size/i);

  const details = ui.indexOf(">More details<");
  const answer = ui.indexOf("<AnswerHero");
  const lotDesk = ui.indexOf("<LotDeskWeight");
  const fit = ui.indexOf("data-tow-fit-glance");
  const trim = ui.indexOf("TRIM / ENGINE / CONFIGURATION");
  assert.ok(answer >= 0 && answer < details, "AnswerHero stays on default view");
  assert.ok(lotDesk >= 0 && lotDesk < details, "lot desk is not under Details");
  assert.ok(fit >= 0 && fit < details, "Fit glance is not under Details");
  assert.ok(trim >= 0 && trim < details, "trim stays on default view");
  assert.ok(
    ui.lastIndexOf("<GlanceChecks") > details,
    "standalone GlanceChecks remain in More details",
  );
});

test("summarizeTruckFit is a thin verdict export — match math stays put", () => {
  const match = src("towMatch.ts");
  assert.match(match, /export function summarizeTruckFit/);
  assert.equal(typeof summarizeTruckFit, "function");
});
