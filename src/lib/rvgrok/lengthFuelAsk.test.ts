import assert from "node:assert/strict";
import test from "node:test";
import { extractFloorplanToken, stripLengthMeasures } from "./parseCoach.ts";
import { parseLengthAsk } from "./lengthAsk.ts";
import { parseAskedClassAndFuel, unitIsDiesel, unitIsGas } from "./fuelClass.ts";
import { parseOwnLotAsk, queryOwnLotUnits, type OwnLotUnit } from "./ownLotInventory.ts";

function unit(partial: Partial<OwnLotUnit> & Pick<OwnLotUnit, "stock_number">): OwnLotUnit {
  return {
    year: "2024",
    make: "Entegra Coach",
    model: "Vision",
    trim: "29S",
    body_type: "Class A",
    location: "Fresno CA",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 120000,
    lengthFt: 30,
    ...partial,
  };
}

const LOT: OwnLotUnit[] = [
  unit({ stock_number: "GAS-A", body_type: "Class A", model: "Vision", lengthFt: 30.2 }),
  unit({
    stock_number: "DIESEL-A",
    body_type: "Class A Diesel",
    model: "Dutch Star",
    trim: "4369",
    lengthFt: 43,
  }),
  unit({
    stock_number: "MISLABEL",
    body_type: "Class A",
    make: "Newmar",
    model: "Mountain Aire",
    trim: "4551",
    lengthFt: 44.83,
  }),
  unit({
    stock_number: "BUS",
    body_type: "Class A",
    make: "Tiffin",
    model: "Allegro Bus",
    trim: "45 OP",
    lengthFt: 45,
  }),
  unit({
    stock_number: "VENTANA",
    body_type: "Class A",
    make: "Newmar",
    model: "Ventana",
    trim: "4369",
    lengthFt: 43.83,
  }),
  unit({
    stock_number: "DISC",
    body_type: "Class A",
    make: "Fleetwood",
    model: "Discovery",
    trim: "38K",
    lengthFt: 38.67,
  }),
  unit({
    stock_number: "ALLEGRO",
    body_type: "Class A",
    make: "Tiffin",
    model: "Allegro",
    trim: "32 FA",
    lengthFt: 33,
  }),
  unit({ stock_number: "CLASS-C", body_type: "Class C", model: "Chateau", lengthFt: 31 }),
  unit({ stock_number: "CLASS-B", body_type: "Class B", model: "Solis", lengthFt: 22 }),
  unit({
    stock_number: "SUPER",
    body_type: "Class Super C",
    model: "Dynaquest",
    lengthFt: 32,
  }),
  unit({
    stock_number: "FW",
    body_type: "Fifth Wheel",
    make: "Grand Design",
    model: "Reflection",
    trim: "337RLS",
    lengthFt: 37,
  }),
  unit({
    stock_number: "BLANK32",
    body_type: "Class A",
    make: "Fleetwood",
    model: "Southwind",
    trim: "32V",
    lengthFt: null,
  }),
  unit({
    stock_number: "BLANK28",
    body_type: "Class A",
    model: "Admiral",
    trim: "28A",
    lengthFt: null,
  }),
];

function ids(ask: string): string[] {
  return queryOwnLotUnits(LOT, parseOwnLotAsk(ask, [], LOT), 40)
    .map((u) => u.stock_number)
    .sort();
}

test("length phrases parse as min, range, around, or feet-plus-inches", () => {
  const cases: Array<{ ask: string; expect: ReturnType<typeof parseLengthAsk> }> = [
    { ask: "at least 30 ft Class A", expect: { kind: "min", feet: 30, inclusive: true } },
    { ask: "30 ft or longer Class A", expect: { kind: "min", feet: 30, inclusive: true } },
    { ask: "30 feet or more", expect: { kind: "min", feet: 30, inclusive: true } },
    { ask: "30+ ft Class A", expect: { kind: "min", feet: 30, inclusive: true } },
    { ask: "30 + feet", expect: { kind: "min", feet: 30, inclusive: true } },
    { ask: "between 28 and 32 feet class a", expect: { kind: "between", min: 28, max: 32 } },
    { ask: "30 to 32 foot class a", expect: { kind: "between", min: 30, max: 32 } },
    { ask: "29-31 ft Class A gas", expect: { kind: "between", min: 29, max: 31 } },
    { ask: "30' Class A", expect: { kind: "around", feet: 30 } },
    { ask: "30′ Class A", expect: { kind: "around", feet: 30 } },
    { ask: "thirty foot Class A", expect: { kind: "around", feet: 30 } },
    { ask: '29\'11" Class A', expect: { kind: "around", feet: 29.92 } },
    { ask: "29 foot 11 inch Class A", expect: { kind: "around", feet: 29.92 } },
    { ask: "under 40 feet", expect: { kind: "max", feet: 40, inclusive: false } },
    { ask: "over 40 feet", expect: { kind: "min", feet: 40, inclusive: false } },
    { ask: "around 30 foot class a gas", expect: { kind: "around", feet: 30 } },
  ];
  for (const row of cases) {
    assert.deepEqual(parseLengthAsk(row.ask), row.expect, row.ask);
    const stripped = stripLengthMeasures(row.ask).replace(/\s+/g, " ").trim();
    assert.equal(/\d/.test(stripped), false, `${row.ask} still has a digit: ${stripped}`);
  }
});

test("fuel asks use real labels, negation, and chassis cues", () => {
  const gasA = parseAskedClassAndFuel("around 30 foot class a gas");
  assert.equal(gasA.bodyType, "Class A");
  assert.equal(gasA.gasOnly, true);
  assert.equal(gasA.dieselOnly, undefined);

  const classC = parseAskedClassAndFuel("gas class c");
  assert.equal(classC.bodyType, "Class C");
  assert.equal(classC.gasOnly, true);
  assert.deepEqual(ids("gas class c"), ["CLASS-C"]);
  assert.deepEqual(ids("class c gas"), ["CLASS-C"]);

  const negated = parseAskedClassAndFuel("not a diesel Class A");
  assert.equal(negated.dieselOnly, undefined);
  assert.equal(negated.gasOnly, true);
  assert.equal(negated.bodyType, "Class A");
  const non = parseAskedClassAndFuel("non-diesel Class A around 30 foot");
  assert.equal(non.dieselOnly, undefined);
  assert.equal(non.gasOnly, true);

  assert.equal(parseAskedClassAndFuel("ford f53").gasOnly, true);
  assert.equal(extractFloorplanToken("ford f53"), "");
  assert.equal(extractFloorplanToken("The 35K"), "35K");
  assert.equal(extractFloorplanToken("Entegra under 150k"), "");
  assert.equal(parseOwnLotAsk("ford f53").trim, undefined);
  assert.equal(parseOwnLotAsk("ford f53").model, undefined);
  assert.equal(parseAskedClassAndFuel("gasser").gasOnly, true);

  const diesel = parseAskedClassAndFuel("diesels under 40 feet");
  assert.equal(diesel.dieselOnly, true);
  assert.equal(diesel.gasOnly, undefined);
  assert.equal(diesel.bodyType, undefined);

  const classADiesel = parseAskedClassAndFuel("class a diesel");
  assert.equal(classADiesel.bodyType, "Class A");
  assert.equal(classADiesel.dieselOnly, true);
  assert.deepEqual(ids("class a diesel").includes("SUPER"), false);
  assert.equal(ids("class a diesel").includes("DIESEL-A"), true);
  assert.equal(ids("class a diesel").includes("MISLABEL"), true);
});

test("known diesel series labeled Class A are not gas", () => {
  for (const stock of ["MISLABEL", "BUS", "VENTANA", "DISC"]) {
    const row = LOT.find((u) => u.stock_number === stock)!;
    assert.equal(unitIsDiesel(row), true, stock);
    assert.equal(unitIsGas(row), false, stock);
  }
  assert.equal(unitIsGas(LOT.find((u) => u.stock_number === "GAS-A")!), true);
  assert.equal(unitIsGas(LOT.find((u) => u.stock_number === "ALLEGRO")!), true);
  assert.equal(unitIsDiesel(LOT.find((u) => u.stock_number === "ALLEGRO")!), false);
  assert.equal(unitIsGas(LOT.find((u) => u.stock_number === "FW")!), false);
  assert.equal(unitIsGas(LOT.find((u) => u.stock_number === "CLASS-C")!), true);
  assert.equal(unitIsDiesel(LOT.find((u) => u.stock_number === "SUPER")!), true);

  const gas = ids("gas");
  assert.ok(gas.includes("GAS-A"));
  assert.ok(gas.includes("CLASS-C"));
  assert.ok(gas.includes("CLASS-B"));
  assert.ok(gas.includes("ALLEGRO"));
  assert.equal(gas.includes("MISLABEL"), false);
  assert.equal(gas.includes("FW"), false);
  assert.equal(gas.includes("SUPER"), false);
  assert.equal(gas.includes("DIESEL-A"), false);
});

test("price words are a budget, and under/over ignore a blank floorplan", () => {
  const under = parseOwnLotAsk("Entegra under 150k", [], LOT);
  assert.match(under.make || "", /^Entegra/);
  assert.equal(under.model, undefined);
  assert.equal(under.trim, undefined);
  assert.equal(under.maxPrice, 150000);

  const over = parseOwnLotAsk("Newmar over 50k", [], LOT);
  assert.equal(over.make, "Newmar");
  assert.equal(over.model, undefined);
  assert.equal(over.trim, undefined);
  assert.equal(over.minPrice, 50000);

  const inches = parseOwnLotAsk('29\'11" Class A', [], LOT);
  assert.equal(inches.trim, undefined);
  assert.equal(inches.model, undefined);
  assert.equal(inches.aroundLengthFt, 29.92);

  const spelled = parseOwnLotAsk("29 foot 11 inch Class A", [], LOT);
  assert.equal(spelled.trim, undefined);
  assert.equal(spelled.model, undefined);

  const between = parseOwnLotAsk("between 28 and 32 feet class a", [], LOT);
  assert.equal(between.model, undefined);
  assert.equal(between.trim, undefined);
  assert.equal(between.minLengthFt, 28);
  assert.equal(between.maxLengthFt, 32);
  assert.deepEqual(ids("between 28 and 32 feet class a"), ["BLANK28", "BLANK32", "GAS-A"]);

  const orLonger = ids("30 ft or longer Class A");
  assert.equal(orLonger.includes("BLANK32"), false);
  assert.equal(orLonger.includes("BLANK28"), false);
  assert.equal(orLonger.includes("GAS-A"), true);
  assert.equal(parseOwnLotAsk("30 ft or longer Class A").aroundLengthFt, undefined);
  assert.equal(parseOwnLotAsk("30+ ft Class A").minLengthInclusive, true);

  const around = ids("around 30 foot class a gas");
  assert.ok(around.includes("BLANK32"));
  assert.ok(around.includes("BLANK28"));
  assert.equal(around.includes("MISLABEL"), false);
});
