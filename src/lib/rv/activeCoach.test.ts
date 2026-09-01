import assert from "node:assert/strict";
import test from "node:test";
import {
  activeCoachKey,
  bestCalPrice,
  coachTowRole,
  formatActiveCoachChip,
  formatActiveCoachShort,
  normalizeActiveCoach,
  parseWeightLbs,
  snapshotActiveCoach,
  towPrefillFromCoach,
  towableRvType,
  writeActiveCoach,
} from "./activeCoach.ts";
import { clampTradeToRetailLow } from "./marketClamp.ts";

test("bestCalPrice prefers retail low, then high, then MSRP mid", () => {
  assert.equal(bestCalPrice({ retailLow: 379000, retailHigh: 706000 }), 379000);
  assert.equal(bestCalPrice({ retailLow: 0, retailHigh: 706000 }), 706000);
  assert.equal(bestCalPrice({ msrpLo: 549000, msrpHi: 899000 }), 724000);
  assert.equal(bestCalPrice({ price: 412000, retailLow: 379000 }), 412000);
  assert.equal(bestCalPrice({ retailLow: 0, retailHigh: 0, msrpLo: 0 }), 0);
  assert.equal(bestCalPrice(null), 0);
});

test("coachTowRole: Class A Dream is a motorhome, not a fifth wheel", () => {
  assert.equal(coachTowRole("Class A Diesel"), "motorhome");
  assert.equal(coachTowRole("Class B"), "motorhome");
  assert.equal(coachTowRole("Class C"), "motorhome");
  assert.equal(coachTowRole("Super C"), "motorhome");
  assert.equal(coachTowRole("Fifth Wheel"), "towable");
  assert.equal(coachTowRole("Travel Trailer"), "towable");
  assert.equal(coachTowRole("Toy Hauler"), "towable");
  assert.equal(coachTowRole(""), "unknown");
});

test("towPrefillFromCoach: motorhome never becomes Fifth Wheel + 0 lbs", () => {
  const dream = normalizeActiveCoach({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    rvType: "Class A Diesel",
    price: 379000,
    gvwrLbs: 52000,
    updatedAt: "2026-09-01",
  });
  assert.ok(dream);
  const prefill = towPrefillFromCoach(dream);
  assert.equal(prefill.kind, "motorhome");
  if (prefill.kind === "motorhome") {
    assert.equal(prefill.coach.model, "American Dream");
  }
});

test("towPrefillFromCoach: towable prefills RV type + GVWR", () => {
  const fw = normalizeActiveCoach({
    year: "2022",
    make: "Keystone",
    model: "Montana",
    floorplan: "3855BR",
    rvType: "Fifth Wheel",
    gvwrLbs: 16500,
    updatedAt: "2026-09-01",
  });
  const prefill = towPrefillFromCoach(fw);
  assert.equal(prefill.kind, "towable");
  if (prefill.kind === "towable") {
    assert.equal(prefill.rvType, "Fifth Wheel");
    assert.equal(prefill.gvwrLbs, 16500);
  }
  assert.equal(towableRvType("Travel Trailer"), "Travel Trailer");
});

test("labels: short bar + chip match David’s Dream example", () => {
  const c = {
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
  };
  assert.equal(formatActiveCoachShort(c), "American Dream · 45A");
  assert.equal(
    formatActiveCoachChip(c),
    "2023 American Coach American Dream · 45A",
  );
});

test("parseWeightLbs reads brochure strings and ranges", () => {
  assert.equal(parseWeightLbs("52,000 lbs"), 52000);
  assert.equal(parseWeightLbs("48000–58000 lbs"), 53000);
  assert.equal(parseWeightLbs(49900), 49900);
  assert.equal(parseWeightLbs("—"), undefined);
});

test("snapshotActiveCoach packs report retail + GVWR for Cal/Tow", () => {
  const snap = snapshotActiveCoach({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    rvType: "Class A Diesel",
    price: 379000,
    gvwr: "52,000 lbs",
    uvw: "44,000 lbs",
    towingCapacityLbs: 15000,
  });
  assert.equal(snap.price, 379000);
  assert.equal(snap.gvwrLbs, 52000);
  assert.equal(snap.rvType, "Class A Diesel");
  assert.equal(snap.towingCapacityLbs, 15000);
});

test("clampTradeToRetailLow: trade cannot sit above retail low", () => {
  assert.deepEqual(clampTradeToRetailLow(443000, 379000), {
    tradeIn: 379000,
    capped: true,
  });
  assert.deepEqual(clampTradeToRetailLow(200000, 379000), {
    tradeIn: 200000,
    capped: false,
  });
  assert.deepEqual(clampTradeToRetailLow(100000, 0), {
    tradeIn: 100000,
    capped: false,
  });
});

test("writeActiveCoach merges numbers when wizard re-saves the same coach", () => {
  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  // node:test has no jsdom — stub only if global localStorage exists
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    writeActiveCoach({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
      rvType: "Class A Diesel",
      price: 379000,
      gvwrLbs: 52000,
    });
    const again = writeActiveCoach({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
      rvType: "Class A Diesel",
    });
    assert.ok(again);
    assert.equal(again!.price, 379000);
    assert.equal(again!.gvwrLbs, 52000);
    const other = writeActiveCoach({
      year: "2022",
      make: "Keystone",
      model: "Montana",
      floorplan: "3855BR",
      rvType: "Fifth Wheel",
    });
    assert.ok(other);
    assert.equal(other!.price, undefined);
    assert.equal(activeCoachKey(again), activeCoachKey(again));
  } finally {
    if (prev) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prev,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  }
});
