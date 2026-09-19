import assert from "node:assert/strict";
import test from "node:test";
import {
  ENGINE_TORQUE_BY_VARIANT,
  applyPublishedEngineTorque,
  engineVariantKey,
  lookupPublishedEngineTorque,
} from "./engineTorqueByVariant.ts";
import {
  extractOptionHpClasses,
  engineOmitsLoneTorque,
} from "./catalogHonesty.ts";
import {
  findPowertrainCorrection,
  POWERTRAIN_CORRECTIONS,
} from "./powertrainCorrections.ts";

test("published variants: L9 450 → 1250, X15 605 → 1950, Ford 7.3 350 → 468", () => {
  assert.equal(lookupPublishedEngineTorque("Cummins L9 450HP", 450)?.torqueLbFt, 1250);
  assert.equal(lookupPublishedEngineTorque("Cummins ISL9 450HP", 450)?.torqueLbFt, 1250);
  assert.equal(lookupPublishedEngineTorque("Cummins X15 605HP", 605)?.torqueLbFt, 1950);
  assert.equal(lookupPublishedEngineTorque("Cummins ISX15 605HP", 605)?.torqueLbFt, 1950);
  assert.equal(lookupPublishedEngineTorque("Ford 7.3L V8 350HP", 350)?.torqueLbFt, 468);
  assert.equal(lookupPublishedEngineTorque("Ford 7.3L V8 Godzilla 350HP", 350)?.torqueLbFt, 468);
});

test("option-band L9 450 / X15 605 never stamps one torque", () => {
  const band = "Cummins L9 450 std / X15 605 opt";
  assert.ok(extractOptionHpClasses(band).length >= 2);
  assert.equal(engineOmitsLoneTorque(band), true);
  assert.equal(engineVariantKey(band, 450), null);
  assert.equal(lookupPublishedEngineTorque(band, 450), null);
  assert.equal(lookupPublishedEngineTorque(band, 605), null);
  assert.equal(
    applyPublishedEngineTorque({
      engine: band,
      horsepower: 0,
      note: "option band",
    }).torqueLbFt,
    undefined,
  );
});

test("conflicting published ratings stay GAP — no invent", () => {
  assert.equal(lookupPublishedEngineTorque("Cummins ISB 6.7L 340HP", 340), null);
  assert.equal(lookupPublishedEngineTorque("Cummins B6.7 (ISB) 340HP", 340), null);
  assert.equal(lookupPublishedEngineTorque("Cummins ISB 6.7L 360HP", 360), null);
  assert.equal(lookupPublishedEngineTorque("Cummins ISL 380HP", 380), null);
  assert.equal(lookupPublishedEngineTorque("Ford 6.7L Power Stroke 330HP", 330), null);
  assert.equal(
    lookupPublishedEngineTorque("Mercedes-Benz 3.0L V6 turbodiesel 188HP", 188),
    null,
  );
  assert.equal(
    lookupPublishedEngineTorque("Mercedes-Benz OM642 3.0L V6 turbodiesel 188HP", 188),
    null,
  );
});

test("unnamed / mixed Cummins strings do not guess a family", () => {
  assert.equal(engineVariantKey("Cummins 500HP", 500), null);
  assert.equal(engineVariantKey("Cummins diesel 425HP", 425), null);
  assert.equal(engineVariantKey("Cummins 340HP (XCS)", 340), null);
  assert.equal(engineVariantKey("Cummins ISL / ISB diesel (era)", 380), null);
});

test("Midwest Passage mixed Mercedes / Ford EcoBoost stays GAP", () => {
  const mixed = "Mercedes turbodiesel (Sprinter) or Ford EcoBoost (MD2F)";
  assert.equal(lookupPublishedEngineTorque(mixed, 188), null);
  assert.equal(
    findPowertrainCorrection("2024", "Midwest Automotive Designs", "Passage", "MD2"),
    null,
  );
  assert.equal(
    findPowertrainCorrection("2024", "Midwest Automotive Designs", "Passage", "MD2F"),
    null,
  );
  assert.equal(
    findPowertrainCorrection("2027", "Midwest Automotive Designs", "Passage", "FD2"),
    null,
  );
});

test("applyPublishedEngineTorque fills missing torque and keeps an existing pin", () => {
  const filled = applyPublishedEngineTorque({
    engine: "Cummins X15 605HP",
    horsepower: 605,
    note: "RVUSA 2020 Dream PDF: 45A — 605HP. Torque unprinted.",
  });
  assert.equal(filled.torqueLbFt, 1950);
  assert.match(filled.note || "", /published cummins-x15\|605/);
  assert.match(filled.note || "", /1,950|1950/);

  const kept = applyPublishedEngineTorque({
    engine: "Cummins L9 450HP",
    horsepower: 450,
    torqueLbFt: 1250,
    note: "already pinned",
  });
  assert.equal(kept.torqueLbFt, 1250);
  assert.equal(kept.note, "already pinned");
});

test("findPowertrainCorrection backfills top published variants", () => {
  const dream20 = findPowertrainCorrection(
    "2020",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.equal(dream20!.engine, "Cummins X15 605HP");
  assert.equal(dream20!.torqueLbFt, 1950);

  const horizon18 = findPowertrainCorrection("2018", "Winnebago", "Horizon", "42Q");
  assert.equal(horizon18!.horsepower, 450);
  assert.equal(horizon18!.torqueLbFt, 1250);

  const spirit25 = findPowertrainCorrection("2025", "Winnebago", "Spirit", "22M");
  assert.equal(spirit25!.horsepower, 350);
  assert.equal(spirit25!.torqueLbFt, 468);

  const greyhawk10 = findPowertrainCorrection("2010", "Jayco", "Greyhawk", "29KS");
  assert.equal(greyhawk10!.horsepower, 305);
  assert.equal(greyhawk10!.torqueLbFt, 420);

  const bus10 = findPowertrainCorrection("2010", "Tiffin", "Allegro Bus", "36QSP");
  assert.equal(bus10!.horsepower, 425);
  assert.equal(bus10!.torqueLbFt, 1200);

  const dutch11 = findPowertrainCorrection("2011", "Newmar", "Dutch Star");
  assert.equal(dutch11!.horsepower, 400);
  assert.equal(dutch11!.torqueLbFt, 1250);
});

test("conflict / unnamed pins stay omitted after the read-path apply", () => {
  const forza22 = findPowertrainCorrection("2022", "Winnebago", "Forza", "38W");
  assert.equal(forza22!.horsepower, 340);
  assert.equal(forza22!.torqueLbFt, undefined);

  const via17 = findPowertrainCorrection("2017", "Winnebago", "Via", "25P");
  assert.equal(via17!.horsepower, 188);
  assert.equal(via17!.torqueLbFt, undefined);

  const sen13 = findPowertrainCorrection("2013", "Jayco", "Seneca", "36FK");
  assert.equal(sen13!.horsepower, 340);
  assert.equal(sen13!.torqueLbFt, undefined);

  const cs12 = findPowertrainCorrection("2012", "Entegra Coach", "Cornerstone", "45DLQ");
  assert.equal(cs12!.horsepower, 500);
  assert.equal(cs12!.torqueLbFt, undefined);
});

test("every map entry is a discrete key with a source note", () => {
  for (const [key, pin] of Object.entries(ENGINE_TORQUE_BY_VARIANT)) {
    assert.match(key, /^[a-z0-9.-]+\|\d+$/, key);
    assert.ok(pin.torqueLbFt > 0, key);
    assert.ok(pin.source.length > 12, key);
    assert.doesNotMatch(pin.source, /estimat|formula|typical/i, key);
  }
});

test("Boss Ops missing-torque singles: fill count vs still GAP", () => {
  let fillable = 0;
  let stillGap = 0;
  const byKey = new Map<string, { tq: number; n: number }>();
  for (const c of POWERTRAIN_CORRECTIONS) {
    if (
      c.horsepower <= 0 ||
      engineOmitsLoneTorque(c.engine) ||
      extractOptionHpClasses(c.engine).length >= 2
    ) {
      continue;
    }
    if (c.torqueLbFt != null && c.torqueLbFt > 0) continue;
    const applied = applyPublishedEngineTorque(c);
    if (applied.torqueLbFt) {
      fillable += 1;
      const key = engineVariantKey(c.engine, c.horsepower) || "?";
      const slot = byKey.get(key) || { tq: applied.torqueLbFt, n: 0 };
      slot.n += 1;
      byKey.set(key, slot);
    } else {
      stillGap += 1;
    }
  }
  assert.equal(fillable, 76);
  assert.equal(stillGap, 67);
  assert.equal(byKey.get("ford-6.8|362")?.tq, 457);
  assert.equal(byKey.get("ford-6.8|362")?.n, 20);
  assert.equal(byKey.get("ford-6.8|305")?.tq, 420);
  assert.equal(byKey.get("ford-6.8|305")?.n, 12);
  assert.equal(byKey.get("cummins-x15|605")?.tq, 1950);
  assert.equal(byKey.get("ford-7.3|350")?.tq, 468);
});
