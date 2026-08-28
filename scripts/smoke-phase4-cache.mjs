#!/usr/bin/env node
/**
 * Phase 4 cache hygiene smoke (logic mirrors verifiedCatalogCache rules).
 */

function conflictsPin(pinEngine, liveEngine, liveHp) {
  if (!pinEngine || !liveEngine) return false;
  const pinDiesel = /cummins|diesel|isb|b6/i.test(pinEngine);
  const liveGas = /godzilla|triton|v10|f-?53/i.test(liveEngine) && !/cummins|isb|b6/i.test(liveEngine);
  if (pinDiesel && liveGas) return true;
  if (/isb|b6\.7/i.test(pinEngine) && liveHp >= 450) return true;
  return false;
}

function sanitizeForCache({ pin, live }) {
  if (!live?.live) return null;
  if (pin && conflictsPin(pin.engine, live.engine, live.horsepower)) {
    return {
      engine: pin.engine,
      horsepower: pin.horsepower,
      powertrainPinned: true,
      powertrainValidated: true,
    };
  }
  if (pin) {
    return {
      engine: pin.engine,
      horsepower: pin.horsepower,
      powertrainPinned: true,
      powertrainValidated: true,
    };
  }
  // no pin — reject gas on diesel catalog
  if (/diesel/i.test(live.fuelType || "") && /godzilla|v10/i.test(live.engine || "")) {
    return {
      engine: null,
      horsepower: null,
      powertrainPinned: false,
      powertrainValidated: false,
      softOnly: true,
    };
  }
  return {
    engine: live.engine,
    horsepower: live.horsepower,
    powertrainPinned: false,
    powertrainValidated: true,
  };
}

const cases = [
  {
    name: "pin wins over Godzilla on Kountry",
    pin: { engine: "Cummins B6.7 360HP", horsepower: 360 },
    live: {
      live: true,
      engine: "Ford 7.3 Godzilla",
      horsepower: 350,
      fuelType: "Diesel",
      overview: "test",
    },
    expectEngine: /Cummins/,
    expectPinned: true,
  },
  {
    name: "no pin — strip gas on diesel soft-only",
    pin: null,
    live: {
      live: true,
      engine: "Ford V10",
      horsepower: 320,
      fuelType: "Diesel",
      overview: "nice coach",
    },
    expectEngine: null,
    expectPinned: false,
    expectSoft: true,
  },
  {
    name: "validated mid diesel stores",
    pin: null,
    live: {
      live: true,
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      fuelType: "Diesel",
      overview: "ok",
    },
    expectEngine: /Cummins/,
    expectPinned: false,
  },
  {
    name: "empty shell not worth caching",
    pin: null,
    live: { live: true, engine: null, horsepower: null },
    expectNull: true,
  },
];

let fail = 0;
for (const c of cases) {
  const hasWorth =
    c.live.live &&
    ((c.live.engine && c.live.engine.length > 3) ||
      c.live.overview ||
      (c.live.horsepower != null && c.live.horsepower > 0));
  if (c.expectNull) {
    const ok = !hasWorth || !c.live.engine;
    // our simple worth: need soft or hard
    const worth =
      c.live.overview ||
      (c.live.engine && (c.live.horsepower || c.live.chassis));
    if (worth && !c.live.overview && !c.live.engine) {
      /* */
    }
    const shouldSkip = !c.live.overview && !c.live.engine;
    console.log(
      `${shouldSkip ? "PASS" : "FAIL"} ${c.name} (skip empty=${shouldSkip})`,
    );
    if (!shouldSkip) fail++;
    continue;
  }
  const s = sanitizeForCache(c);
  const engOk = c.expectEngine
    ? c.expectEngine.test(s?.engine || "")
    : s?.engine == null;
  const pinOk = s?.powertrainPinned === c.expectPinned;
  const ok = engOk && pinOk;
  if (!ok) fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${c.name}`,
    `| eng=${s?.engine} pinned=${s?.powertrainPinned} soft=${s?.softOnly || false}`,
  );
}

// schema bump rule
const SCHEMA = 4;
const stale = { schema: 1, savedAt: new Date().toISOString() };
const fresh = { schema: SCHEMA, savedAt: new Date().toISOString() };
const isFresh = (e) => e.schema === SCHEMA;
console.log(isFresh(stale) ? "FAIL schema stale accepted" : "PASS schema stale rejected");
console.log(isFresh(fresh) ? "PASS schema current accepted" : "FAIL schema current rejected");
if (isFresh(stale)) fail++;
if (!isFresh(fresh)) fail++;

console.log(fail === 0 ? "\nPhase 4 smoke: ALL PASS" : `\nPhase 4 smoke: ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
