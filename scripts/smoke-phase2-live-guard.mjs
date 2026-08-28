#!/usr/bin/env node
/**
 * Phase 2 smoke — Live powertrain validators (no app import).
 * Mirrors livePowertrainGuard rules in plain JS.
 */

const GAS_ENGINE_RE =
  /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline|gas\s*v8)\b/i;
const DIESEL_ENGINE_RE =
  /\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter)\b/i;

function fuelLooksDiesel(fuel, type) {
  const blob = `${fuel || ""} ${type || ""}`;
  return /diesel/i.test(blob) && !/gas\s*\/\s*diesel|by plan/i.test(blob);
}

function validate({ model, catalogFuel, catalogType, catalogEngine, liveEngine, liveHp }) {
  const reasons = [];
  const md = model.toLowerCase();
  if (fuelLooksDiesel(catalogFuel, catalogType) && liveEngine && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
    reasons.push("gas on diesel catalog");
  }
  if (!fuelLooksDiesel(catalogFuel, catalogType) && /gas/i.test(catalogFuel || catalogType || "") && liveEngine && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("diesel on gas catalog");
  }
  if (md.includes("kountry star") && liveEngine && GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("kountry gas");
  }
  if (md.includes("fr3") && liveEngine && /cummins|diesel pusher|l9/i.test(liveEngine)) {
    reasons.push("fr3 diesel");
  }
  if (liveHp === 450 && liveEngine && GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("450 on gas");
  }
  if (catalogEngine && /isb|b6\.7/i.test(catalogEngine) && liveHp >= 450) {
    reasons.push("flagship hp on mid");
  }
  return reasons;
}

function canLiveSetEngine(catalogEngine, reject) {
  const empty = !catalogEngine || catalogEngine === "—" || catalogEngine.length < 3;
  if (!empty) return false; // catalog present — Live cannot stomp
  return reject.length === 0;
}

const cases = [
  {
    name: "reject Godzilla on Kountry Star diesel",
    model: "Kountry Star",
    catalogFuel: "Diesel",
    catalogType: "Class A Diesel",
    catalogEngine: "Cummins B6.7 360HP",
    liveEngine: "Ford 7.3L V8 Godzilla",
    liveHp: 350,
    expectReject: true,
    expectStomp: false,
  },
  {
    name: "reject Cummins on FR3 gas",
    model: "FR3",
    catalogFuel: "Gas",
    catalogType: "Class A Gas",
    catalogEngine: "Ford 7.3L V8 Godzilla",
    liveEngine: "Cummins L9 450HP",
    liveHp: 450,
    expectReject: true,
    expectStomp: false,
  },
  {
    name: "catalog present — Live cannot stomp even if similar",
    model: "Bay Star",
    catalogFuel: "Gas",
    catalogType: "Class A Gas",
    catalogEngine: "Ford Triton V10 6.8L",
    liveEngine: "Ford 7.3L V8 Godzilla",
    liveHp: 350,
    expectReject: false, // may be ok family-wise for modern
    expectStomp: false, // still cannot replace non-empty catalog
  },
  {
    name: "empty catalog — validated Live fills",
    model: "Unknown Coach",
    catalogFuel: "Diesel",
    catalogType: "Class A Diesel",
    catalogEngine: "",
    liveEngine: "Cummins B6.7 360HP",
    liveHp: 360,
    expectReject: false,
    expectStomp: true, // fill empty
  },
  {
    name: "empty catalog — invalid Live rejected",
    model: "Kountry Star",
    catalogFuel: "Diesel",
    catalogType: "Class A Diesel",
    catalogEngine: "",
    liveEngine: "Ford Triton V10",
    liveHp: 320,
    expectReject: true,
    expectStomp: false,
  },
];

let fail = 0;
for (const c of cases) {
  const reject = validate(c);
  const rejected = reject.length > 0;
  const maySet = canLiveSetEngine(c.catalogEngine, reject);
  const ok =
    rejected === c.expectReject &&
    maySet === c.expectStomp;
  if (!ok) fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${c.name}`,
    `| reject=${rejected} (${reject.join("; ") || "none"})`,
    `| liveMayFillEmpty=${maySet}`,
  );
}

console.log(fail === 0 ? "\nPhase 2 smoke: ALL PASS" : `\nPhase 2 smoke: ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
