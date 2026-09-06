import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { getRating, getTrims } from "./towVehicles.ts";
import {
  PIN_WEIGHT_FRACTION,
  RECOMMENDED_PAYLOAD_FACTOR,
  RECOMMENDED_TOW_FACTOR,
  REVERSE_SHORTLIST,
  hitchLoadLbs,
  normalizeReverseRvType,
  rankTowVehiclesForTrailer,
  recommendedPayloadLbs,
  recommendedTowLbs,
  trimQualifiesForTrailer,
} from "./towReverse.ts";
import { DEFAULT_TOW_VEHICLE, trimStem } from "./towYear.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("planning factors stay at the vehicle-first 80/85 band", () => {
  assert.equal(RECOMMENDED_TOW_FACTOR, 0.8);
  assert.equal(RECOMMENDED_PAYLOAD_FACTOR, 0.85);
  assert.equal(recommendedTowLbs(20000), 16000);
  assert.equal(recommendedPayloadLbs(4000), 3400);
  assert.equal(recommendedTowLbs(0), 0);
});

test("hitch load: 20% pin on 5th wheel, 12% tongue on travel trailer", () => {
  assert.equal(hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: 14000 }), 2800);
  assert.equal(
    hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: 14000, pinLbs: 3100 }),
    3100,
  );
  assert.equal(hitchLoadLbs({ rvType: "Travel Trailer", gvwrLbs: 7000 }), 840);
  assert.equal(hitchLoadLbs({ rvType: "fifth-wheel", gvwrLbs: 10000 }), 2000);
  assert.equal(PIN_WEIGHT_FRACTION, 0.2);
});

test("qualify: rec tow must cover GVWR; pin/tongue uses rec payload when present", () => {
  const gvwr = 14000;
  const hitch = hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: gvwr });
  assert.equal(
    trimQualifiesForTrailer({ maxTow: 17500, payload: 4000 }, { gvwrLbs: gvwr, hitchLoad: hitch }),
    true,
  );
  // 16000 max → rec 12,800 < 14,000
  assert.equal(
    trimQualifiesForTrailer({ maxTow: 16000, payload: 4000 }, { gvwrLbs: gvwr, hitchLoad: hitch }),
    false,
  );
  // Tow enough, payload too small for ~2,800 lb pin (rec payload 1,700)
  assert.equal(
    trimQualifiesForTrailer({ maxTow: 20000, payload: 2000 }, { gvwrLbs: gvwr, hitchLoad: hitch }),
    false,
  );
  // Missing payload is allowed — we do not invent a rating
  assert.equal(
    trimQualifiesForTrailer({ maxTow: 20000, payload: 0 }, { gvwrLbs: gvwr, hitchLoad: hitch }),
    true,
  );
  assert.equal(
    trimQualifiesForTrailer({ maxTow: 20000, payload: 4000 }, { gvwrLbs: 0, hitchLoad: 0 }),
    false,
  );
});

test("empty GVWR or impossible weight returns no invented rows", () => {
  assert.equal(rankTowVehiclesForTrailer({ gvwrLbs: 0, rvType: "Fifth Wheel", year: "2024" }).total, 0);
  const huge = rankTowVehiclesForTrailer({
    gvwrLbs: 80000,
    rvType: "Fifth Wheel",
    year: "2024",
  });
  assert.equal(huge.total, 0);
  assert.equal(huge.hits.length, 0);
});

test("14k fifth wheel / 2024: ranked shortlist, rec tow ≥ GVWR, trucks only", () => {
  const result = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
  });
  assert.ok(result.total > 0, "catalog should have HD trucks for a 14k 5th wheel");
  assert.ok(result.hits.length > 0);
  assert.ok(result.hits.length <= REVERSE_SHORTLIST);
  assert.ok(result.hits.length <= result.total);
  assert.equal(result.hitchLoad, 2800);

  const models = new Set(result.hits.map((h) => `${h.make}|${h.model}`));
  assert.equal(models.size, result.hits.length, "default shortlist is one trim per model");

  let prev = 0;
  for (const hit of result.hits) {
    assert.equal(hit.kind, "truck");
    assert.ok(hit.maxTow > 0);
    assert.ok(hit.recommendedTow >= 14000);
    assert.equal(hit.recommendedTow, recommendedTowLbs(hit.maxTow));
    assert.equal(hit.towMargin, hit.recommendedTow - 14000);
    if (hit.payloadChecked) {
      assert.ok(hit.hitchLoad <= hit.recommendedPayload);
    }
    assert.ok(hit.recommendedTow >= prev);
    prev = hit.recommendedTow;
    const rating = getRating(hit.make, hit.model, hit.trim);
    assert.equal(rating.maxTow, hit.maxTow);
    assert.equal(rating.label, hit.trim);
    assert.notEqual(rating.label, "Unknown");
  }
});

test("best-fit ranks closest rec tow first, not the heaviest HD", () => {
  const result = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    limit: 8,
  });
  assert.ok(result.hits.length >= 2);
  const first = result.hits[0]!;
  const last = result.hits[result.hits.length - 1]!;
  assert.ok(first.recommendedTow <= last.recommendedTow);
  // First pick should be a working-class fit, not a 30k+ chassis max.
  assert.ok(first.recommendedTow < 30000, "closest fit should not open on a chassis-cab ceiling");
  assert.equal(
    result.hits.some((h) => /chassis\s*cab/i.test(`${h.model} ${h.stem}`)),
    false,
    "shortlist prefers pickups; chassis cabs still count in total",
  );
});

test("SUV filter + fifth wheel stays empty (needs a truck bed hitch)", () => {
  const result = rankTowVehiclesForTrailer({
    gvwrLbs: 7000,
    rvType: "Fifth Wheel",
    year: "2024",
    kind: "suv",
  });
  assert.equal(result.total, 0);
  assert.equal(result.hits.length, 0);
});

test("light travel trailer can surface SUVs", () => {
  const result = rankTowVehiclesForTrailer({
    gvwrLbs: 3500,
    rvType: "Travel Trailer",
    year: "2024",
    kind: "suv",
  });
  assert.ok(result.total > 0);
  assert.ok(result.hits.some((h) => h.kind === "suv"));
  assert.ok(result.hits.every((h) => h.recommendedTow >= 3500));
  assert.equal(result.hitchLoad, Math.round(3500 * 0.12));
});

test("Facts-sized 16,500 lb Montana still finds catalog trucks", () => {
  const result = rankTowVehiclesForTrailer({
    gvwrLbs: 16500,
    rvType: "Fifth Wheel",
    year: "2024",
  });
  assert.ok(result.total > 0);
  assert.ok(result.hits.every((h) => h.recommendedTow >= 16500));
  assert.equal(result.hitchLoad, 3300);
});

test("year filter changes the reverse list; no year invents rows", () => {
  const y2024 = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    limit: 24,
  });
  const y2016 = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2016",
    limit: 24,
  });
  const avalanche = rankTowVehiclesForTrailer({
    gvwrLbs: 5000,
    rvType: "Travel Trailer",
    year: "2024",
    kind: "truck",
  });

  assert.ok(y2024.total > 0);
  assert.ok(y2016.total > 0);
  const labels2024 = new Set(y2024.hits.filter((h) => h.yearRange).map((h) => h.trim));
  const labels2016 = new Set(y2016.hits.filter((h) => h.yearRange).map((h) => h.trim));
  const overlap = [...labels2024].filter((l) => labels2016.has(l));
  assert.equal(overlap.length, 0, "year-banded HD rows should not overlap 2016 vs 2024");

  assert.equal(
    avalanche.hits.some((h) => h.model === "Avalanche"),
    false,
    "Avalanche has no 2024 row — do not invent it",
  );
});

test("show-more raises the cap and can add a second trim per model", () => {
  const short = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    limit: 8,
  });
  const more = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    limit: 16,
  });
  assert.ok(more.hits.length >= short.hits.length);
  assert.equal(more.total, short.total);
  if (more.total > 8) {
    assert.ok(more.hits.length > short.hits.length || more.hits.length === 16);
  }
});

test("user pin that exceeds rec payload drops that trim", () => {
  const easy = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    pinLbs: 2000,
    limit: 24,
  });
  const heavyPin = rankTowVehiclesForTrailer({
    gvwrLbs: 14000,
    rvType: "Fifth Wheel",
    year: "2024",
    pinLbs: 9000,
    limit: 24,
  });
  assert.ok(easy.total > heavyPin.total);
  assert.ok(heavyPin.hits.every((h) => !h.payloadChecked || h.recommendedPayload >= 9000));
});

test("normalizeReverseRvType maps Facts type strings", () => {
  assert.equal(normalizeReverseRvType("Fifth Wheel"), "Fifth Wheel");
  assert.equal(normalizeReverseRvType("Toy Hauler"), "Travel Trailer");
  assert.equal(normalizeReverseRvType("Travel Trailer"), "Travel Trailer");
});

test("default first-paint Super Duty still qualifies for the sample 14k 5th wheel", () => {
  const d = DEFAULT_TOW_VEHICLE;
  const trim = getTrims(d.make, d.model).find((t) => t.label === d.trim);
  assert.ok(trim);
  const hitch = hitchLoadLbs({ rvType: "Fifth Wheel", gvwrLbs: 14000 });
  assert.equal(trimQualifiesForTrailer(trim!, { gvwrLbs: 14000, hitchLoad: hitch }), true);
  assert.equal(trimStem(d.trim).includes("Lariat SRW"), true);
});

test("RvTowApp wires reverse mode without restoring the fake XL diesel", () => {
  const src = readFileSync(join(root, "../../components/rvtow/RvTowApp.tsx"), "utf8");
  assert.equal(src.includes("XL — 6.7L Power Stroke Diesel (SRW)"), false);
  assert.equal(src.includes("DEFAULT_TOW_VEHICLE"), true);
  assert.equal(src.includes("rankTowVehiclesForTrailer"), true);
  assert.equal(src.includes("Can I tow this"), true);
});
