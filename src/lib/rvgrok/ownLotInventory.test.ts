import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeMarketValueQuestion,
} from "./webIntent.ts";
import {
  aggregateOwnLot,
  clearOwnLotCache,
  DEFAULT_OWN_LOT_JSON_PATH,
  DIESEL_BODY_TYPES,
  formatOwnLotBlock,
  formatOwnLotInjection,
  isDieselBodyType,
  isGasBodyType,
  loadOwnLotSnapshot,
  looksLikeOwnLotStockQuestion,
  OWN_LOT_MODEL,
  parseOwnLotAsk,
  parseOwnLotCsv,
  parseOwnLotUnits,
  shouldSkipWebForOwnLot,
  snapshotFromJson,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import { executeWebResearch } from "./webResearchTelemetry.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string, name: string): string {
  return readFileSync(join(root, rel, name), "utf8");
}

const FIXTURE_UNITS: OwnLotUnit[] = [
  {
    year: "2024",
    make: "Newmar",
    model: "Dutch Star",
    trim: "4369",
    body_type: "Class A Diesel",
    location: "Wilsonville",
    stock_number: "N2401",
    vin: "",
    source: "own",
    dealer: "RV Country",
  },
  {
    year: "2023",
    make: "Tiffin",
    model: "Allegro Bus",
    trim: "45 OP",
    body_type: "Class A Diesel",
    location: "Harrisburg",
    stock_number: "T2308",
    vin: "",
    source: "own",
    dealer: "RV Country",
  },
  {
    year: "2025",
    make: "Dynamax",
    model: "Dynaquest",
    trim: "XL",
    body_type: "Class Super C",
    location: "Wilsonville",
    stock_number: "D2502",
    vin: "",
    source: "own",
    dealer: "RV Country",
  },
  {
    year: "2024",
    make: "Entegra Coach",
    model: "Vision",
    trim: "29S",
    body_type: "Class A Gas",
    location: "Harrisburg",
    stock_number: "E2411",
    vin: "",
    source: "own",
    dealer: "RV Country",
  },
  {
    year: "2022",
    make: "Grand Design",
    model: "Reflection",
    trim: "337RLS",
    body_type: "Fifth Wheel",
    location: "Wilsonville",
    stock_number: "G2219",
    vin: "",
    source: "own",
    dealer: "RV Country",
  },
];

test("David's own-lot stock asks hit intent; specs and nights do not", () => {
  const yes = [
    "how many diesels do we have in stock?",
    "How many diesel Newmar Dutch Stars are in inventory?",
    "What's the diesel count for 2024 Tiffin Allegro?",
    "Any Entegra inventory near Dallas?",
    "what do we have on the lot",
    "units available at Wilsonville",
    "how many Super C are on our lot",
    "our inventory of Class A",
  ];
  for (const q of yes) {
    assert.equal(looksLikeOwnLotStockQuestion(q), true, q);
    assert.equal(looksLikeInventoryOrCountQuestion(q), true, q);
    assert.equal(shouldSkipWebForOwnLot(q), true, q);
  }
  assert.equal(
    looksLikeOwnLotStockQuestion("How many slides does a 2023 Dream have?"),
    false,
  );
  assert.equal(
    looksLikeOwnLotStockQuestion("How many nights should we plan?"),
    false,
  );
  assert.equal(
    looksLikeOwnLotStockQuestion("What engine and HP does a 2023 Entegra Vision have?"),
    false,
  );
  const priced = "How many diesels do we have in stock and what's a 2021 Dutch Star worth?";
  assert.equal(looksLikeOwnLotStockQuestion(priced), true);
  assert.equal(looksLikeMarketValueQuestion(priced), true);
  assert.equal(shouldSkipWebForOwnLot(priced), false, "pricing still browses");
});

test("diesel proxy is Class A Diesel + Class Super C only — no invented fuel", () => {
  assert.deepEqual([...DIESEL_BODY_TYPES], ["Class A Diesel", "Class Super C"]);
  assert.equal(isDieselBodyType("Class A Diesel"), true);
  assert.equal(isDieselBodyType("Class Super C"), true);
  assert.equal(isDieselBodyType("class a diesel pusher"), true);
  assert.equal(isDieselBodyType("Class A Gas"), false);
  assert.equal(isDieselBodyType("Class A"), false);
  assert.equal(isDieselBodyType("Fifth Wheel"), false);
  assert.equal(isGasBodyType("Class A Gas"), true);
  assert.equal(isGasBodyType("Class A Diesel"), false);
});

test("count aggregation by body_type / make / location", () => {
  const all = aggregateOwnLot(FIXTURE_UNITS, {});
  assert.equal(all.total, 5);
  assert.equal(all.matched, 5);
  assert.equal(all.diesel, 3, "2 Class A Diesel + 1 Super C");
  assert.equal(all.dieselByBodyType["Class A Diesel"], 2);
  assert.equal(all.dieselByBodyType["Class Super C"], 1);
  assert.equal(all.byMake.Newmar, 1);
  assert.equal(all.byLocation.Wilsonville, 3);
  assert.equal(all.byLocation.Harrisburg, 2);

  const diesels = aggregateOwnLot(FIXTURE_UNITS, { dieselOnly: true });
  assert.equal(diesels.matched, 3);
  assert.equal(diesels.diesel, 3);

  const newmar = aggregateOwnLot(FIXTURE_UNITS, {
    make: "Newmar",
    dieselOnly: true,
  });
  assert.equal(newmar.matched, 1);
  assert.equal(newmar.byMake.Newmar, 1);

  const wilsonville = aggregateOwnLot(FIXTURE_UNITS, { location: "Wilsonville" });
  assert.equal(wilsonville.matched, 3);

  const gas = aggregateOwnLot(FIXTURE_UNITS, { gasOnly: true });
  assert.equal(gas.matched, 1);
  assert.equal(gas.byMake["Entegra Coach"], 1);
});

test("parseOwnLotAsk pulls make / diesel / location from the question", () => {
  const diesel = parseOwnLotAsk("how many diesels do we have in stock?");
  assert.equal(diesel.dieselOnly, true);
  assert.equal(diesel.make, undefined);

  const newmar = parseOwnLotAsk(
    "How many diesel Newmar Dutch Stars are in inventory?",
  );
  assert.equal(newmar.dieselOnly, true);
  assert.equal(newmar.make, "Newmar");
  assert.match(newmar.model || "", /Dutch Star/i);

  const loc = parseOwnLotAsk("what is on the lot in Wilsonville", [
    "Wilsonville",
    "Harrisburg",
  ]);
  assert.equal(loc.location, "Wilsonville");
});

test("formatOwnLotBlock is honest about the missing fuel field and never invents VINs", () => {
  const snapshot = snapshotFromJson(
    { source: "own", dealer: "RV Country", units: FIXTURE_UNITS },
    { asOf: "2026-09-18T00:00:00.000Z" },
  );
  const block = formatOwnLotBlock(
    snapshot,
    "how many diesels do we have in stock?",
  );
  assert.match(block, /No fuel field/i);
  assert.match(block, /Class A Diesel/);
  assert.match(block, /Class Super C/);
  assert.match(block, /Diesel \(Class A Diesel \+ Class Super C\): 3/);
  assert.match(block, /Lot total: 5/);
  assert.match(block, /Matched: 3/);
  assert.match(block, /source=own/);
  assert.doesNotMatch(block, /\bVIN\b.*[A-HJ-NPR-Z0-9]{11,}/i);
  assert.doesNotMatch(block, /invented/i);

  const missing = formatOwnLotBlock(
    {
      ok: false,
      reason: "Own-lot snapshot not loaded (ENOENT).",
      asOf: "",
      source: "own",
      dealer: "RV Country",
      fuelFieldPresent: false,
      pathTried: DEFAULT_OWN_LOT_JSON_PATH,
      units: [],
    },
    "how many diesels do we have in stock?",
  );
  assert.match(missing, /UNAVAILABLE/);
  assert.match(missing, /Do not invent/);
  assert.match(missing, /own-lot snapshot is not loaded/i);
});

test("JSON + CSV parsers accept the scrape field names", () => {
  const fromJson = parseOwnLotUnits({
    source: "own",
    dealer: "RV Country",
    units: [
      {
        year: 2024,
        make: "Newmar",
        model: "Dutch Star",
        trim: "4369",
        body_type: "Class A Diesel",
        location: "Wilsonville",
        stock_number: "N2401",
      },
    ],
  });
  assert.equal(fromJson.length, 1);
  assert.equal(fromJson[0]!.body_type, "Class A Diesel");
  assert.equal(fromJson[0]!.stock_number, "N2401");

  const csv = parseOwnLotCsv(
    [
      "year,make,model,trim,body_type,location,stock_number",
      "2025,Dynamax,Dynaquest,XL,Class Super C,Wilsonville,D2502",
    ].join("\n"),
  );
  assert.equal(csv.length, 1);
  assert.equal(isDieselBodyType(csv[0]!.body_type), true);
});

test("loadOwnLotSnapshot reads a local json path and caches", async () => {
  clearOwnLotCache();
  const dir = join(tmpdir(), `own-lot-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "own-lot-latest.json");
  writeFileSync(
    path,
    JSON.stringify({
      source: "own",
      dealer: "RV Country",
      generated_at: "2026-09-18T05:00:00.000Z",
      units: FIXTURE_UNITS,
    }),
  );
  const snap = await loadOwnLotSnapshot({ path });
  assert.equal(snap.ok, true);
  assert.equal(snap.units.length, 5);
  assert.equal(snap.source, "own");
  const again = await loadOwnLotSnapshot({ path });
  assert.equal(again.units.length, 5);
  clearOwnLotCache();
});

test("formatOwnLotInjection + voice/chat research short-circuit to own-lot, not web", async () => {
  const notes = await formatOwnLotInjection(
    "how many diesels do we have in stock?",
    {
      json: { source: "own", dealer: "RV Country", units: FIXTURE_UNITS },
    },
  );
  assert.match(notes, /Diesel \(Class A Diesel \+ Class Super C\): 3/);

  const researched = await executeWebResearch({
    query: "how many diesels do we have in stock?",
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
  });
  assert.equal(researched.ok, true);
  if (researched.ok) {
    assert.equal(researched.model, OWN_LOT_MODEL);
    assert.match(researched.notes, /own-lot|Class A Diesel/i);
    assert.doesNotMatch(researched.notes, /WEB SEARCH NOT AVAILABLE/);
  }
});

test("in-app chat and voice research are wired; DialaBot stays out", () => {
  const api = src("../../routes/api", "rvgrok.ts");
  const telemetry = src(".", "webResearchTelemetry.ts");
  const prompts = src(".", "prompts.ts");
  assert.match(api, /formatOwnLotInjection/);
  assert.match(api, /shouldSkipWebForOwnLot/);
  assert.match(api, /OWN-LOT INVENTORY \(RV Country\)/);
  assert.match(telemetry, /shouldSkipWebForOwnLot/);
  assert.match(telemetry, /OWN_LOT_MODEL/);
  assert.match(prompts, /OWN-LOT STOCK/);
  assert.match(src(".", "ownLotInventory.ts"), /DEFAULT_OWN_LOT_JSON_PATH/);
  assert.doesNotMatch(api, /[Dd]ialaBot/);
  assert.doesNotMatch(telemetry, /[Dd]ialaBot/);
});
