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
  looksLikeOwnLotListingPriceQuestion,
  looksLikeOwnLotStockQuestion,
  OWN_LOT_MODEL,
  OWN_LOT_PUBLIC_URL_PATH,
  ownLotHasHit,
  ownLotIsUnavailable,
  ownLotPublicFileCandidates,
  looksLikeGhostOwnLotModel,
  looksLikeOwnLotUnitListQuestion,
  parseOwnLotAsk,
  parseOwnLotBudget,
  parseOwnLotCsv,
  parseOwnLotStockNumber,
  parseOwnLotUnits,
  parseSpelledThousands,
  pickOwnLotPrice,
  queryOwnLotUnits,
  sameOriginOwnLotUrls,
  sanitizeOwnLotParsedModel,
  shouldSkipWebForOwnLot,
  snapshotFromJson,
  stripCoachBrandPluralLeftover,
  floorplanTokensAlign,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  COACH_BRANDS,
  consonantBrandShape,
  extractFloorplanToken,
  looksLikeCoachDesignationAsk,
  parseCoachFromText,
} from "./parseCoach.ts";
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
    price: 389000,
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
    price: 412000,
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
    price: 275000,
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
    price: 189000,
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
    price: 72000,
  },
];

const FRESNO_PRICED_UNITS: OwnLotUnit[] = [
  {
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    trim: "4369",
    body_type: "Class A Diesel",
    location: "Fresno CA",
    stock_number: "F2201",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 98900,
  },
  {
    year: "2021",
    make: "Tiffin",
    model: "Allegro Bus",
    trim: "45 OP",
    body_type: "Class A Diesel",
    location: "Fresno CA",
    stock_number: "F2108",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 104500,
  },
  {
    year: "2024",
    make: "Dynamax",
    model: "Dynaquest",
    trim: "XL",
    body_type: "Class Super C",
    location: "Fresno CA",
    stock_number: "F2502",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 219000,
  },
  {
    year: "2023",
    make: "Grand Design",
    model: "Reflection",
    trim: "337RLS",
    body_type: "Fifth Wheel",
    location: "Fresno CA",
    stock_number: "F2219",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 68900,
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
  const hit: OwnLotSnapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: FIXTURE_UNITS,
  });
  const miss: OwnLotSnapshot = {
    ok: false,
    reason: "missing",
    asOf: "",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
    pathTried: DEFAULT_OWN_LOT_JSON_PATH,
    units: [],
  };
  for (const q of yes) {
    assert.equal(looksLikeOwnLotStockQuestion(q), true, q);
    assert.equal(looksLikeInventoryOrCountQuestion(q), true, q);
    assert.equal(shouldSkipWebForOwnLot(q, hit), true, `${q} skips web on hit`);
    assert.equal(shouldSkipWebForOwnLot(q, miss), false, `${q} browses on miss`);
    assert.equal(shouldSkipWebForOwnLot(q), false, `${q} no snapshot yet → do not skip`);
  }
  assert.equal(ownLotHasHit(hit), true);
  assert.equal(ownLotHasHit(miss), false);
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

  const lotPrices = [
    "and it should show prices too",
    "Fresno inventory — any diesels around 100k?",
    "show prices on the Fresno lot",
  ];
  for (const q of lotPrices) {
    assert.equal(looksLikeOwnLotListingPriceQuestion(q), true, q);
    assert.equal(looksLikeOwnLotStockQuestion(q), true, q);
    assert.equal(looksLikeMarketValueQuestion(q), false, q);
    assert.equal(shouldSkipWebForOwnLot(q, hit), true, `${q} stays on own-lot`);
  }
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

  assert.equal(all.priced, 5);
  assert.ok(all.priceBand);
  assert.equal(all.priceBand!.low, 72000);
  assert.equal(all.priceBand!.high, 412000);
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

  const fresno = parseOwnLotAsk("Fresno inventory — any diesels around 100k?", [
    "Fresno CA",
    "Fife WA",
  ]);
  assert.equal(fresno.location, "Fresno CA");
  assert.equal(fresno.dieselOnly, true);
  assert.equal(fresno.aroundPrice, 100000);
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
  assert.match(block, /Listing prices ARE in this snapshot/);
  assert.match(block, /\$275,000|\$389,000|\$412,000/);

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
  assert.match(missing, /No own-lot hit/);
  assert.match(missing, /WEB RESEARCH should run/i);
  assert.match(missing, /I don't know/i);
  assert.match(missing, /Do not answer a stock count of 0/);
  assert.doesNotMatch(missing, /Lot total:\s*0/);
  assert.doesNotMatch(missing, /Diesel \(Class A Diesel \+ Class Super C\):\s*0/);
  assert.doesNotMatch(missing, /\b0 diesels?\b/i);
  assert.equal(ownLotIsUnavailable({
    ok: false,
    reason: "Own-lot snapshot not loaded (ENOENT).",
    asOf: "",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
    pathTried: DEFAULT_OWN_LOT_JSON_PATH,
    units: [],
  }), true);
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
        price: 389000,
      },
    ],
  });
  assert.equal(fromJson.length, 1);
  assert.equal(fromJson[0]!.body_type, "Class A Diesel");
  assert.equal(fromJson[0]!.stock_number, "N2401");
  assert.equal(fromJson[0]!.price, 389000);

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

test("own-lot hit short-circuits research; miss falls through to web", async () => {
  const notes = await formatOwnLotInjection(
    "how many diesels do we have in stock?",
    {
      json: { source: "own", dealer: "RV Country", units: FIXTURE_UNITS },
    },
  );
  assert.match(notes, /Diesel \(Class A Diesel \+ Class Super C\): 3/);

  const hit = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: FIXTURE_UNITS,
  });
  const researched = await executeWebResearch({
    query: "how many diesels do we have in stock?",
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
    ownLotSnapshot: hit,
  });
  assert.equal(researched.ok, true);
  if (researched.ok) {
    assert.equal(researched.model, OWN_LOT_MODEL);
    assert.match(researched.notes, /Class A Diesel/);
    assert.doesNotMatch(researched.notes, /WEB SEARCH NOT AVAILABLE/);
  }

  const miss = await executeWebResearch({
    query: "how many diesels do we have in stock?",
    apiKey: undefined,
    timeoutMs: 50,
    profile: "chat",
    ownLotSnapshot: {
      ok: false,
      reason: "missing",
      asOf: "",
      source: "own",
      dealer: "RV Country",
      fuelFieldPresent: false,
      pathTried: DEFAULT_OWN_LOT_JSON_PATH,
      units: [],
    },
  });
  assert.equal(miss.ok, false);
  assert.equal(miss.kind, "missing_key");
  assert.match(miss.reason!, /no XAI_API_KEY/);
});

test("in-app chat and voice research are wired; DialaBot stays out", () => {
  const api = src("../../routes/api", "rvgrok.ts");
  const telemetry = src(".", "webResearchTelemetry.ts");
  const prompts = src(".", "prompts.ts");
  assert.match(api, /loadOwnLotSnapshot/);
  assert.match(api, /formatOwnLotBlock/);
  assert.match(api, /shouldSkipWebForOwnLot/);
  assert.match(api, /OWN-LOT INVENTORY \(RV Country\)/);
  assert.match(telemetry, /shouldSkipWebForOwnLot/);
  assert.match(telemetry, /OWN_LOT_MODEL/);
  assert.match(prompts, /OWN-LOT STOCK/);
  assert.match(prompts, /Never say the snapshot has no price data/);
  assert.match(src(".", "ownLotInventory.ts"), /DEFAULT_OWN_LOT_JSON_PATH/);
  assert.match(src(".", "ownLotInventory.ts"), /OWN_LOT_PUBLIC_URL_PATH/);
  assert.match(src(".", "ownLotInventory.ts"), /sameOriginOwnLotUrls/);
  assert.match(api, /requestOrigin/);
  assert.doesNotMatch(api, /[Dd]ialaBot/);
  assert.doesNotMatch(telemetry, /[Dd]ialaBot/);
});

function withOwnLotEnv(
  patch: Record<string, string | undefined>,
  fn: () => Promise<void>,
): Promise<void> {
  const keys = [
    "OWN_LOT_INVENTORY_URL",
    "OWN_LOT_INVENTORY_PATH",
    "VERCEL",
    "VERCEL_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ];
  const prev: Record<string, string | undefined> = {};
  for (const k of keys) prev[k] = process.env[k];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return fn().finally(() => {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
    clearOwnLotCache();
  });
}

test("unset URL falls back to deploy-bundled public/inventory snapshot", async () => {
  await withOwnLotEnv(
    {
      OWN_LOT_INVENTORY_URL: undefined,
      OWN_LOT_INVENTORY_PATH: undefined,
    },
    async () => {
      clearOwnLotCache();
      const candidates = ownLotPublicFileCandidates();
      assert.ok(
        candidates.some((p) => p.endsWith("public/inventory/own-lot-latest.json")),
        candidates.join(", "),
      );
      const snap = await loadOwnLotSnapshot();
      assert.equal(snap.ok, true, snap.reason);
      assert.ok(snap.units.length >= 1000, `units ${snap.units.length}`);
      assert.match(snap.pathTried, /inventory\/own-lot-latest/);
      const diesel = snap.units.filter((u) =>
        /class a diesel|class super c/i.test(u.body_type),
      ).length;
      assert.ok(diesel > 0, "bundled snapshot has diesel body_types");
      const block = formatOwnLotBlock(
        snap,
        "how many diesels do we have in stock?",
      );
      assert.doesNotMatch(block, /UNAVAILABLE/);
      assert.match(block, /Diesel \(Class A Diesel \+ Class Super C\): [1-9]/);
      const pricedUnits = snap.units.filter((u) => u.price != null && u.price > 0);
      assert.ok(pricedUnits.length > 0, "bundled snapshot has listing prices");
      assert.match(block, /Listing prices ARE in this snapshot/);
      assert.match(block, /\$[0-9]/);
      assert.doesNotMatch(block, /doesn't include price data/i);
      assert.doesNotMatch(block, /hasn't come through/i);
    },
  );
});

test("Vercel same-origin public URL is tried when files are skipped", async () => {
  await withOwnLotEnv(
    {
      OWN_LOT_INVENTORY_URL: undefined,
      OWN_LOT_INVENTORY_PATH: "/tmp/own-lot-missing-box-only.json",
      VERCEL: "1",
      VERCEL_URL: "rv-reluanch.vercel.app",
    },
    async () => {
      const urls = sameOriginOwnLotUrls({
        requestOrigin: "https://www.rvmax.app",
      });
      assert.deepEqual(urls, [
        "https://www.rvmax.app/inventory/own-lot-latest.json",
        "https://rv-reluanch.vercel.app/inventory/own-lot-latest.json",
      ]);
      assert.equal(OWN_LOT_PUBLIC_URL_PATH, "/inventory/own-lot-latest.json");

      const originalFetch = globalThis.fetch;
      const calls: string[] = [];
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        const href = String(input);
        calls.push(href);
        return new Response(
          JSON.stringify({
            source: "own",
            dealer: "RV Country",
            units: FIXTURE_UNITS,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }) as typeof fetch;
      try {
        clearOwnLotCache();
        const snap = await loadOwnLotSnapshot({
          requestOrigin: "https://www.rvmax.app",
          skipFiles: true,
        });
        assert.equal(snap.ok, true, snap.reason);
        assert.equal(snap.units.length, 5);
        assert.equal(calls[0], "https://www.rvmax.app/inventory/own-lot-latest.json");
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );
});

test("OWN_LOT_INVENTORY_URL stays an exclusive override", async () => {
  await withOwnLotEnv(
    {
      OWN_LOT_INVENTORY_URL: "https://override.example/lot.json",
      VERCEL_URL: "rv-reluanch.vercel.app",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      const calls: string[] = [];
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls.push(String(input));
        return new Response("nope", { status: 503 });
      }) as typeof fetch;
      try {
        clearOwnLotCache();
        const snap = await loadOwnLotSnapshot({ skipFiles: true });
        assert.equal(snap.ok, false);
        assert.equal(ownLotIsUnavailable(snap), true);
        assert.deepEqual(calls, ["https://override.example/lot.json"]);
        const block = formatOwnLotBlock(
          snap,
          "how many diesels do we have in stock?",
        );
        assert.match(block, /UNAVAILABLE/);
        assert.doesNotMatch(block, /Lot total:\s*0/);
        assert.doesNotMatch(block, /Diesel \(Class A Diesel \+ Class Super C\):\s*0/);
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );
});

test("failed or empty snapshot never answers a fake stock count of 0", () => {
  const emptyOk: OwnLotSnapshot = {
    ok: true,
    asOf: "",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
    pathTried: DEFAULT_OWN_LOT_JSON_PATH,
    units: [],
  };
  assert.equal(ownLotHasHit(emptyOk), false);
  assert.equal(ownLotIsUnavailable(emptyOk), true);
  const block = formatOwnLotBlock(
    emptyOk,
    "how many diesels do we have in stock?",
  );
  assert.match(block, /UNAVAILABLE/);
  assert.match(block, /never a fake zero/i);
  assert.doesNotMatch(block, /Lot total:\s*0/);
  assert.doesNotMatch(block, /Matched:\s*0/);
  assert.doesNotMatch(block, /Diesel \(Class A Diesel \+ Class Super C\):\s*0/);
  assert.doesNotMatch(block, /:\s*0\b/);
});

test("pickOwnLotPrice uses price then scraper fallbacks — never invents", () => {
  assert.equal(pickOwnLotPrice({ price: 110111.3, price_msrp: 999 }), 110111.3);
  assert.equal(
    pickOwnLotPrice({
      price: null,
      price_current: null,
      price_hidden: null,
      price_lowest: null,
      price_msrp: 86924,
    }),
    86924,
  );
  assert.equal(pickOwnLotPrice({ price_current: "104,500" }), 104500);
  assert.equal(pickOwnLotPrice({ price: 0, price_hidden: 72000 }), 72000);
  assert.equal(pickOwnLotPrice({ price: 0, price_msrp: 0 }), null);
  assert.equal(pickOwnLotPrice({ make: "Newmar" }), null);
});

test("summarizer and query helper return listing prices when present", () => {
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [...FIXTURE_UNITS, ...FRESNO_PRICED_UNITS],
  });
  const ask = "Fresno inventory — any diesels around 100k?";
  const filter = parseOwnLotAsk(ask, ["Fresno CA", "Wilsonville", "Harrisburg"]);
  assert.equal(filter.location, "Fresno CA");
  assert.equal(filter.dieselOnly, true);
  assert.equal(filter.aroundPrice, 100000);
  assert.deepEqual(parseOwnLotBudget(ask), { aroundPrice: 100000 });
  assert.deepEqual(parseOwnLotBudget("units under $80k"), { maxPrice: 80000 });

  const counts = aggregateOwnLot(snapshot.units, filter);
  assert.equal(counts.matched, 2, "two Fresno diesels near 100k");
  assert.equal(counts.priced, 2);
  assert.ok(counts.priceBand);
  assert.equal(counts.priceBand!.low, 98900);
  assert.equal(counts.priceBand!.high, 104500);

  const rows = queryOwnLotUnits(snapshot.units, filter, 12);
  assert.equal(rows.length, 2);
  assert.ok(rows.every((u) => u.price != null && u.price > 0));
  assert.ok(rows.some((u) => u.price === 98900));
  assert.ok(rows.some((u) => u.stock_number === "F2201"));

  const block = formatOwnLotBlock(snapshot, ask);
  assert.match(block, /Listing prices ARE in this snapshot/);
  assert.match(block, /\$98,900/);
  assert.match(block, /\$104,500/);
  assert.match(block, /stk F2201/);
  assert.match(block, /Fresno CA/);
  assert.doesNotMatch(block, /doesn't include price data/i);
  assert.doesNotMatch(block, /haven't come through/i);
  assert.doesNotMatch(block, /has not come through/i);
  assert.doesNotMatch(block, /hasn't come through/i);

  const showPrices = formatOwnLotBlock(snapshot, "and it should show prices too");
  assert.match(showPrices, /Listing prices ARE in this snapshot/);
  assert.match(showPrices, /Low \$/);
  assert.doesNotMatch(showPrices, /doesn't include price data/i);
  assert.doesNotMatch(showPrices, /hasn't come through/i);
});

test("own-lot and prompt text cannot claim no price data when prices exist", () => {
  const impl = src(".", "ownLotInventory.ts");
  const prompts = src(".", "prompts.ts");
  const voice = src(".", "voice.ts");
  assert.match(impl, /Listing prices ARE in this snapshot/);
  assert.match(impl, /Never say it has no price data/);
  assert.match(impl, /price_current \/ price_hidden \/ price_lowest \/ price_msrp/);
  assert.match(prompts, /Never say the snapshot has no price data/);
  assert.match(prompts, /can't pull specific units/);
  assert.match(prompts, /doesn't break out a list/);
  assert.match(voice, /Never say the snapshot has no price data/);
  assert.match(voice, /can't pull specific units/);
  assert.match(voice, /doesn't break out a list/);
  assert.match(src(".", "voiceWeb.ts"), /can't pull specific units/);
  assert.doesNotMatch(impl, /doesn't include price data/);
  assert.doesNotMatch(impl, /hasn't come through/);

  const unpriced: OwnLotUnit[] = FIXTURE_UNITS.map((u) => ({ ...u, price: null }));
  const emptyPrices = formatOwnLotBlock(
    snapshotFromJson({ source: "own", dealer: "RV Country", units: unpriced }),
    "how many diesels do we have in stock?",
  );
  assert.match(emptyPrices, /No priced units in this matched set/);
  assert.doesNotMatch(emptyPrices, /Listing prices ARE in this snapshot/);
});

function pricedUnit(partial: Partial<OwnLotUnit> & Pick<OwnLotUnit, "stock_number">): OwnLotUnit {
  return {
    year: "2026",
    make: "Entegra Coach",
    model: "Vision",
    trim: "29S",
    body_type: "Class A Gas",
    location: "Fresno CA",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 189000,
    ...partial,
  };
}

const ENTEGRA_FRESNO_UNITS: OwnLotUnit[] = [
  pricedUnit({
    year: "2026",
    make: "Entegra Coach",
    model: "Cornerstone",
    trim: "45D",
    body_type: "Class A Diesel",
    location: "Fresno CA",
    stock_number: "45282",
    price: 729995,
  }),
  pricedUnit({ stock_number: "47592", model: "Vision", body_type: "Class A" }),
  pricedUnit({ stock_number: "47648", model: "Odyssey SE", body_type: "Class C" }),
  pricedUnit({ stock_number: "47621", model: "Odyssey SE", body_type: "Class C" }),
  pricedUnit({ stock_number: "47588", model: "Odyssey", body_type: "Class C" }),
  pricedUnit({ stock_number: "47001", model: "Aspire", body_type: "Class A Diesel" }),
  pricedUnit({ stock_number: "47002", model: "Anthem", body_type: "Class A Diesel" }),
  pricedUnit({ stock_number: "47003", model: "Reatta", body_type: "Class A" }),
  pricedUnit({ stock_number: "47004", model: "Esteem", body_type: "Class C" }),
  pricedUnit({ stock_number: "47005", model: "Expanse", body_type: "Class C" }),
  pricedUnit({ stock_number: "47006", model: "Launch", body_type: "Class B" }),
  pricedUnit({ stock_number: "47007", model: "Qwest", body_type: "Class Super C" }),
];

const TOY_HAULER_UNITS: OwnLotUnit[] = [
  pricedUnit({
    year: "2022",
    make: "Grand Design",
    model: "Momentum",
    trim: "351TH",
    body_type: "Fifth Wheel Toy Hauler",
    location: "Wilsonville",
    stock_number: "TH501",
    price: 49995,
  }),
  pricedUnit({
    year: "2021",
    make: "Heartland",
    model: "Cyclone",
    trim: "4007",
    body_type: "Fifth Wheel Toy Hauler",
    location: "Fresno CA",
    stock_number: "TH502",
    price: 52900,
  }),
  pricedUnit({
    year: "2020",
    make: "Keystone",
    model: "Fuzion",
    trim: "419",
    body_type: "Fifth Wheel",
    location: "Harrisburg",
    stock_number: "FW601",
    price: 48900,
  }),
  pricedUnit({
    year: "2024",
    make: "Forest River",
    model: "XLR Nitro",
    trim: "41G14",
    body_type: "Fifth Wheel Toy Hauler",
    location: "Fresno CA",
    stock_number: "TH900",
    price: 124995,
  }),
  pricedUnit({
    year: "2023",
    make: "Forest River",
    model: "Work and Play",
    trim: "18TH",
    body_type: "Travel Trailer Toy Hauler",
    location: "Fresno CA",
    stock_number: "TT501",
    price: 47995,
  }),
];

test("stock-number ask matches that unit and injects a priced listing", () => {
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [...ENTEGRA_FRESNO_UNITS, ...TOY_HAULER_UNITS, ...FIXTURE_UNITS],
  });
  for (const ask of [
    "45282",
    "stk 45282",
    "stock number 45282",
    "stock #45282",
    "do we have stock 45282",
    "is stock number 45282 on the lot",
  ]) {
    assert.equal(parseOwnLotStockNumber(ask), "45282", ask);
    assert.equal(looksLikeOwnLotStockQuestion(ask), true, ask);
    const filter = parseOwnLotAsk(ask, ["Fresno CA", "Wilsonville"]);
    assert.equal(filter.stockNumber, "45282", ask);
    assert.equal(filter.model, undefined, `${ask} must not invent a model`);
    const counts = aggregateOwnLot(snapshot.units, filter);
    assert.equal(counts.matched, 1, ask);
    const rows = queryOwnLotUnits(snapshot.units, filter, 12);
    assert.equal(rows[0]?.stock_number, "45282", ask);
    assert.equal(rows[0]?.make, "Entegra Coach", ask);
    assert.equal(rows[0]?.model, "Cornerstone", ask);
    assert.equal(rows[0]?.trim, "45D", ask);
    assert.equal(rows[0]?.location, "Fresno CA", ask);
    assert.equal(rows[0]?.price, 729995, ask);
    const block = formatOwnLotBlock(snapshot, ask);
    assert.match(block, /stk 45282/);
    assert.match(block, /\$729,995/);
    assert.match(block, /Cornerstone/);
    assert.match(block, /Matching units/);
    assert.match(block, /Specific units ARE listed/);
    assert.doesNotMatch(block, /can't pull specific units/);
    assert.doesNotMatch(block, /doesn't break out/);
  }
});

test("Entegra + Fresno make+location is 12 matches with listings, not a ghost model zero", () => {
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [
      ...ENTEGRA_FRESNO_UNITS,
      pricedUnit({
        stock_number: "99901",
        make: "Entegra Coach",
        location: "Harrisburg",
        model: "Vision",
      }),
      pricedUnit({
        stock_number: "99902",
        make: "Newmar",
        location: "Fresno CA",
        model: "Dutch Star",
      }),
    ],
  });
  const coachGhost = parseCoachFromText(
    "How many Entegra coaches do we have in Fresno?",
  );
  assert.equal(coachGhost.make, "Entegra Coach");
  assert.equal(
    coachGhost.model,
    "es",
    "parseCoach leftover after Entegra Coach ⊂ Entegra coaches",
  );
  assert.equal(looksLikeGhostOwnLotModel("es"), true);
  assert.equal(looksLikeGhostOwnLotModel("s"), true);
  assert.equal(looksLikeGhostOwnLotModel("m"), false);
  assert.equal(
    stripCoachBrandPluralLeftover("Entegra Coach", "es do we have in Fresno"),
    "do we have in fresno",
  );
  assert.equal(
    sanitizeOwnLotParsedModel("es", ["Fresno CA"], { make: "Entegra Coach" }),
    undefined,
  );
  assert.equal(
    sanitizeOwnLotParsedModel("es in Fresno", ["Fresno CA", "Harrisburg"], {
      make: "Entegra Coach",
    }),
    undefined,
  );
  assert.equal(sanitizeOwnLotParsedModel("Dutch Star", ["Fresno CA"]), "dutch star");

  for (const ask of [
    "How many Entegra coaches in Fresno?",
    "How many Entegra coaches do we have in Fresno?",
  ]) {
    const filter = parseOwnLotAsk(ask, ["Fresno CA", "Harrisburg"], snapshot.units);
    assert.equal(filter.make, "Entegra Coach", ask);
    assert.equal(filter.location, "Fresno CA", ask);
    assert.equal(filter.model, undefined, `${ask} ghost model was ${filter.model}`);
    const counts = aggregateOwnLot(snapshot.units, filter);
    assert.equal(counts.matched, 12, ask);
    assert.ok(counts.matched > 0, ask);
    const block = formatOwnLotBlock(snapshot, ask);
    assert.match(block, /Matched: 12/);
    assert.match(block, /stk 45282/);
    assert.match(block, /Matching units/);
    assert.match(block, /Specific units ARE listed/);
    assert.doesNotMatch(block, /Matched: 0/);
  }
});

test("fifth-wheel toy hauler around / fifty thousand dollar injects priced listing lines", () => {
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [...TOY_HAULER_UNITS, ...FIXTURE_UNITS],
  });
  assert.equal(parseSpelledThousands("fifty thousand dollar"), 50000);
  assert.deepEqual(parseOwnLotBudget("fifty thousand dollar fifth-wheel"), {
    aroundPrice: 50000,
  });
  assert.deepEqual(parseOwnLotBudget("around fifty thousand"), {
    aroundPrice: 50000,
  });
  assert.equal(
    looksLikeOwnLotUnitListQuestion(
      "deep dive into the inventory and get me a list of fifty thousand dollar fifth-wheel toy haulers",
    ),
    true,
  );

  for (const ask of [
    "list of fifty thousand dollar fifth-wheel toy haulers",
    "Yeah, I want you to deep dive into the inventory and see if you can get me a list of fifty thousand dollar fifth-wheel toy haulers.",
    "fifth-wheel toy haulers around $50k",
  ]) {
    const filter = parseOwnLotAsk(ask, ["Fresno CA", "Wilsonville"]);
    assert.equal(filter.bodyType, "Fifth Wheel Toy Hauler", ask);
    assert.equal(filter.toyHauler, undefined, ask);
    assert.equal(filter.aroundPrice, 50000, ask);
    const counts = aggregateOwnLot(snapshot.units, filter);
    assert.equal(counts.matched, 2, ask);
    const rows = queryOwnLotUnits(snapshot.units, filter, 12);
    assert.ok(rows.every((u) => u.body_type === "Fifth Wheel Toy Hauler"), ask);
    const block = formatOwnLotBlock(snapshot, ask);
    assert.match(block, /Filter: Fifth Wheel Toy Hauler/);
    assert.match(block, /Matching units/);
    assert.match(block, /Fifth Wheel Toy Hauler/);
    assert.match(block, /\$49,995|\$52,900/);
    assert.match(block, /stk TH501|stk TH502/);
    assert.match(block, /Specific units ARE listed/);
    assert.doesNotMatch(block, /Too many matched units to list/);
    assert.doesNotMatch(block, /can't pull specific units/);
    assert.doesNotMatch(block, /doesn't break out a list/);
    assert.doesNotMatch(block, /stk TH900/, `${ask} must not list the $124k toy hauler`);
    assert.doesNotMatch(block, /stk FW601/, `${ask} plain Fifth Wheel must not match`);
    assert.doesNotMatch(block, /stk TT501/, `${ask} TT toy hauler is a different body_type`);
  }

  const ttAsk = "travel trailer toy haulers around $50k";
  const ttFilter = parseOwnLotAsk(ttAsk, ["Fresno CA"]);
  assert.equal(ttFilter.bodyType, "Travel Trailer Toy Hauler");
  assert.equal(ttFilter.aroundPrice, 50000);
  const ttCounts = aggregateOwnLot(snapshot.units, ttFilter);
  assert.equal(ttCounts.matched, 1);
  const ttBlock = formatOwnLotBlock(snapshot, ttAsk);
  assert.match(ttBlock, /Filter: Travel Trailer Toy Hauler/);
  assert.match(ttBlock, /stk TT501/);
  assert.match(ttBlock, /\$47,995/);
  assert.doesNotMatch(ttBlock, /stk TH501/);

  const plainFw = parseOwnLotAsk("fifth wheels around $50k", ["Fresno CA"]);
  assert.equal(plainFw.bodyType, "Fifth Wheel");
  assert.equal(plainFw.toyHauler, undefined);
  const plainRows = queryOwnLotUnits(snapshot.units, plainFw, 12);
  assert.ok(plainRows.every((u) => u.body_type === "Fifth Wheel"));
  assert.ok(plainRows.some((u) => u.stock_number === "FW601"));
  assert.ok(!plainRows.some((u) => u.body_type.includes("Toy Hauler")));
});

test("bundled snapshot: stock 45282, Entegra Fresno, and $50k fifth-wheel toy haulers list rows", () => {
  const snap = snapshotFromJson(
    JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
  );
  assert.ok(snap.units.length >= 1000);

  const stock = formatOwnLotBlock(snap, "stock number 45282");
  assert.match(stock, /Matched: 1/);
  assert.match(stock, /stk 45282/);
  assert.match(stock, /Entegra Coach/);
  assert.match(stock, /Cornerstone/);
  assert.match(stock, /45D/);
  assert.match(stock, /Fresno CA/);
  assert.match(stock, /\$729,995/);
  assert.match(stock, /Matching units/);

  const loc = formatOwnLotBlock(snap, "How many Entegra coaches do we have in Fresno?");
  assert.match(loc, /Filter: Entegra Coach · Fresno CA/);
  assert.doesNotMatch(loc, /es in Fresno/);
  assert.match(loc, /Matched: 1[0-9]/);
  assert.match(loc, /Matching units/);
  assert.match(loc, /stk 45282/);

  const listAsk =
    "deep dive into the inventory and get me a list of fifty thousand dollar fifth-wheel toy haulers";
  const listFilter = parseOwnLotAsk(listAsk, [
    ...new Set(snap.units.map((u) => u.location).filter(Boolean)),
  ]);
  assert.equal(listFilter.bodyType, "Fifth Wheel Toy Hauler");
  assert.equal(listFilter.aroundPrice, 50000);
  const listCounts = aggregateOwnLot(snap.units, listFilter);
  assert.ok(listCounts.matched > 0, "FW toy haulers around $50k exist on the lot");
  assert.ok(listCounts.matched <= 15, `window too wide: ${listCounts.matched}`);
  const listRows = queryOwnLotUnits(snap.units, listFilter, 12);
  assert.ok(listRows.every((u) => u.body_type === "Fifth Wheel Toy Hauler"));
  assert.ok(listRows.every((u) => u.price != null && Math.abs(u.price - 50000) <= 15000));

  const list = formatOwnLotBlock(snap, listAsk);
  assert.match(list, /Filter: Fifth Wheel Toy Hauler/);
  assert.match(list, /around \$50,000/);
  assert.match(list, /Matching units/);
  assert.match(list, /Fifth Wheel Toy Hauler/);
  assert.match(list, /\$[0-9]/);
  assert.match(list, /Specific units ARE listed/);
  assert.doesNotMatch(list, /Matched: 0/);
  assert.doesNotMatch(list, /Reflection 100 Series/);

  const locations = [
    ...new Set(snap.units.map((u) => u.location).filter(Boolean)),
  ];
  const lineage25 = snap.units.filter(
    (u) =>
      /lineage series m/i.test(u.model) && /25fw/i.test(u.trim || ""),
  );
  assert.ok(lineage25.length >= 3, "bundled lot has Lineage Series M 25FW rows");
  const lineageStocks = lineage25.map((u) => u.stock_number).sort();
  for (const ask of [
    "M series 25FW",
    "Lineage M 25FW",
    "Lineage Series M 25FW",
  ]) {
    const filter = parseOwnLotAsk(ask, locations, snap.units);
    const rows = queryOwnLotUnits(snap.units, filter, 12);
    assert.ok(
      rows.every((u) => u.model === "Lineage Series M" && u.trim === "25FW"),
      ask,
    );
    assert.deepEqual(
      rows.map((r) => r.stock_number).sort(),
      lineageStocks,
      ask,
    );
    const block = formatOwnLotBlock(snap, ask);
    assert.match(block, new RegExp(`Matched: ${lineage25.length}`), ask);
    assert.doesNotMatch(block, /Matched: 0/, ask);
  }

  const integraStocks = ["46222", "47033", "47034"];
  for (const ask of [
    "27A Integra Vision",
    "Integra Vision 27A",
    "Entegra Vision 27ASE",
    "Entegra Vision SE 27A",
  ]) {
    const filter = parseOwnLotAsk(ask, locations, snap.units);
    const rows = queryOwnLotUnits(snap.units, filter, 12);
    assert.deepEqual(
      rows.map((r) => r.stock_number).sort(),
      integraStocks,
      ask,
    );
    const block = formatOwnLotBlock(snap, ask);
    assert.match(block, /Matched: 3/, ask);
    assert.match(block, /stk 47034/, ask);
    assert.match(block, /stk 47033/, ask);
    assert.match(block, /stk 46222/, ask);
  }
});

const VISION_27ASE_UNITS: OwnLotUnit[] = [
  pricedUnit({
    year: "2026",
    make: "Entegra Coach",
    model: "Vision SE",
    trim: "27ASE",
    body_type: "Class A Gas",
    location: "Fife WA",
    stock_number: "47034",
    price: 109995,
  }),
  pricedUnit({
    year: "2026",
    make: "Entegra Coach",
    model: "Vision SE",
    trim: "27ASE",
    body_type: "Class A Gas",
    location: "Sparks NV",
    stock_number: "47033",
    price: 118190,
  }),
  pricedUnit({
    year: "2026",
    make: "Entegra Coach",
    model: "Vision SE",
    trim: "27ASE",
    body_type: "Class A Gas",
    location: "Sparks NV",
    stock_number: "46222",
    price: 180436,
  }),
];

const VISION_FAMILY_DECOYS: OwnLotUnit[] = [
  pricedUnit({
    year: "2024",
    make: "Entegra Coach",
    model: "Vision",
    trim: "29S",
    body_type: "Class A Gas",
    location: "Harrisburg",
    stock_number: "E2411",
    price: 189000,
  }),
  pricedUnit({
    year: "2026",
    make: "Entegra Coach",
    model: "Vision XL",
    trim: "36C",
    body_type: "Class A Gas",
    location: "Fife WA",
    stock_number: "XL360",
    price: 199000,
  }),
];

test("Integra alias + 27A trim match the three Vision SE 27ASE units", () => {
  assert.ok(!COACH_BRANDS.includes("Integra"), "Integra is an alias, not a brand");
  assert.ok(!COACH_BRANDS.includes("Integra Coach"));
  assert.equal(extractFloorplanToken("27A Integra Vision"), "27A");
  assert.equal(extractFloorplanToken("around $50k Newmar"), "");
  assert.equal(floorplanTokensAlign("27A", "27ASE"), true);
  assert.equal(floorplanTokensAlign("27ASE", "27ASE"), true);
  assert.equal(floorplanTokensAlign("27A", "29S"), false);
  assert.equal(floorplanTokensAlign("27ASE", "36C"), false);

  const before = parseCoachFromText("27A Integra Vision");
  assert.equal(before.make, "Entegra Coach");
  assert.match(before.model, /vision/i);
  assert.equal(before.floorplan, "27A");

  const after = parseCoachFromText("Integra Vision 27A");
  assert.equal(after.make, "Entegra Coach");
  assert.match(after.model, /vision/i);
  assert.equal(after.floorplan, "27A");

  const coachAlias = parseCoachFromText("Integra Coach Vision 27ASE");
  assert.equal(coachAlias.make, "Entegra Coach");
  assert.match(coachAlias.model, /vision/i);
  assert.equal(coachAlias.floorplan, "27ASE");

  const units = [
    ...VISION_27ASE_UNITS,
    ...VISION_FAMILY_DECOYS,
    ...ENTEGRA_FRESNO_UNITS,
  ];
  const locations = [
    ...new Set(units.map((u) => u.location).filter(Boolean)),
  ];
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units,
  });
  const expected = ["46222", "47033", "47034"];

  for (const ask of [
    "27A Integra Vision",
    "Integra Vision 27A",
    "Entegra Vision 27ASE",
    "Entegra Vision SE 27A",
  ]) {
    const parsed = parseCoachFromText(ask);
    assert.match(parsed.make, /Entegra/i, ask);
    assert.notEqual(parsed.make, "Integra", ask);
    assert.match(parsed.model, /vision/i, ask);
    assert.match(parsed.floorplan, /27A/i, ask);

    const filter = parseOwnLotAsk(ask, locations, units);
    assert.match(filter.make || "", /Entegra/i, ask);
    assert.match(filter.model || "", /vision/i, ask);
    assert.match(filter.trim || "", /27A/i, ask);

    const counts = aggregateOwnLot(units, filter);
    assert.equal(counts.matched, 3, ask);
    const rows = queryOwnLotUnits(units, filter, 12);
    assert.deepEqual(
      rows.map((r) => r.stock_number).sort(),
      expected,
      ask,
    );
    assert.ok(rows.every((u) => u.model === "Vision SE" && u.trim === "27ASE"), ask);
    assert.ok(!rows.some((u) => u.stock_number === "E2411" || u.stock_number === "XL360"), ask);

    const block = formatOwnLotBlock(snapshot, ask);
    assert.match(block, /Matched: 3/, ask);
    assert.match(block, /stk 47034/, ask);
    assert.match(block, /stk 47033/, ask);
    assert.match(block, /stk 46222/, ask);
    assert.doesNotMatch(block, /stk E2411/, ask);
    assert.doesNotMatch(block, /stk XL360/, ask);
  }
});

const LINEAGE_M_25FW_UNITS: OwnLotUnit[] = [
  pricedUnit({
    year: "2027",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25FW",
    body_type: "Class C",
    location: "Mt. Vernon WA",
    stock_number: "47556",
    price: 241995,
  }),
  pricedUnit({
    year: "2027",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25FW",
    body_type: "Class C",
    location: "Mt. Vernon WA",
    stock_number: "47532",
    price: 235479,
  }),
  pricedUnit({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25FW",
    body_type: "Class C",
    location: "Wilsonville OR",
    stock_number: "47499",
    price: 229995,
  }),
  pricedUnit({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25FW",
    body_type: "Class C",
    location: "Sparks NV",
    stock_number: "46233",
    price: 219995,
  }),
  pricedUnit({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25FW",
    body_type: "Class C",
    location: "Fresno CA",
    stock_number: "46060",
    price: 214995,
  }),
];

const LINEAGE_FAMILY_DECOYS: OwnLotUnit[] = [
  pricedUnit({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series M",
    trim: "25TK",
    body_type: "Class C",
    location: "Fife WA",
    stock_number: "M25TK",
    price: 209995,
  }),
  pricedUnit({
    year: "2027",
    make: "Grand Design",
    model: "Lineage Series E",
    trim: "30DC",
    body_type: "Class C",
    location: "Harrisburg",
    stock_number: "E30DC",
    price: 189995,
  }),
  pricedUnit({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series F",
    trim: "31ZW",
    body_type: "Class Super C",
    location: "Wilsonville OR",
    stock_number: "F31ZW",
    price: 289995,
  }),
];

const TIFFIN_PHAETON_UNITS: OwnLotUnit[] = [
  pricedUnit({
    year: "2024",
    make: "Tiffin",
    model: "Phaeton",
    trim: "36LSE",
    body_type: "Class A Diesel",
    location: "Harrisburg",
    stock_number: "TF36L",
    price: 389000,
  }),
  pricedUnit({
    year: "2023",
    make: "Tiffin",
    model: "Phaeton",
    trim: "40IH",
    body_type: "Class A Diesel",
    location: "Fresno CA",
    stock_number: "TF40Q",
    price: 412000,
  }),
];

test("Lineage M series 25FW spoken asks hit the five own-lot 25FW units", () => {
  const m = parseCoachFromText("Uh, the M series 25FW");
  assert.equal(m.make, "");
  assert.match(m.model, /\bm\b/i);
  assert.equal(m.floorplan, "25FW");
  const lineageM = parseCoachFromText("Lineage M 25FW");
  assert.match(lineageM.model, /lineage/i);
  assert.match(lineageM.model, /\bm\b/i);
  assert.equal(lineageM.floorplan, "25FW");
  const catalog = parseCoachFromText("Lineage Series M 25FW");
  assert.match(catalog.model, /lineage/i);
  assert.equal(catalog.floorplan, "25FW");
  const branded = parseCoachFromText("Grand Design Lineage M 25FW");
  assert.equal(branded.make, "Grand Design");
  assert.match(branded.model, /lineage/i);
  assert.equal(branded.floorplan, "25FW");

  for (const ask of [
    "M series 25FW",
    "Uh, the M series 25FW",
    "Lineage M 25FW",
    "Lineage Series M 25FW",
    "Grand Design Lineage M 25FW",
    "do we have any M series 25FW",
  ]) {
    assert.equal(looksLikeCoachDesignationAsk(ask), true, ask);
    assert.equal(looksLikeOwnLotStockQuestion(ask), true, ask);
    assert.equal(
      looksLikeOwnLotStockQuestion(`What engine does a ${ask} have?`),
      false,
      `spec still wins over ${ask}`,
    );
  }

  const units = [
    ...LINEAGE_M_25FW_UNITS,
    ...LINEAGE_FAMILY_DECOYS,
    ...VISION_27ASE_UNITS,
    ...FIXTURE_UNITS,
  ];
  const locations = [
    ...new Set(units.map((u) => u.location).filter(Boolean)),
  ];
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units,
  });
  const expected = ["46060", "46233", "47499", "47532", "47556"];

  for (const ask of [
    "M series 25FW",
    "Uh, the M series 25FW",
    "Lineage M 25FW",
    "Lineage Series M 25FW",
    "Grand Design Lineage M 25FW",
  ]) {
    const filter = parseOwnLotAsk(ask, locations, units);
    assert.match(filter.model || "", /m/i, ask);
    assert.match(filter.trim || "", /25fw/i, ask);

    const counts = aggregateOwnLot(units, filter);
    assert.equal(counts.matched, 5, ask);
    const rows = queryOwnLotUnits(units, filter, 12);
    assert.deepEqual(
      rows.map((r) => r.stock_number).sort(),
      expected,
      ask,
    );
    assert.ok(
      rows.every((u) => u.model === "Lineage Series M" && u.trim === "25FW"),
      ask,
    );
    assert.ok(
      !rows.some((u) =>
        ["M25TK", "E30DC", "F31ZW"].includes(u.stock_number),
      ),
      ask,
    );

    const block = formatOwnLotBlock(snapshot, ask);
    assert.match(block, /Matched: 5/, ask);
    for (const stk of expected) {
      assert.match(block, new RegExp(`stk ${stk}`), ask);
    }
    assert.doesNotMatch(block, /stk M25TK/, ask);
    assert.doesNotMatch(block, /stk E30DC/, ask);
    assert.equal(shouldSkipWebForOwnLot(ask, snapshot), true, ask);
  }
});

test("Tifin fuzzy brand (not Integra) matches Tiffin Phaeton 36L", () => {
  assert.equal(consonantBrandShape("Tifin"), consonantBrandShape("Tiffin"));
  assert.notEqual(consonantBrandShape("integrity"), consonantBrandShape("Entegra"));
  const parsed = parseCoachFromText("36L Tifin Phaeton");
  assert.equal(parsed.make, "Tiffin");
  assert.match(parsed.model, /phaeton/i);
  assert.equal(parsed.floorplan, "36L");
  assert.equal(parseCoachFromText("integrity check on the propane").make, "");

  const newmar = parseCoachFromText("Newmr Dutch Star 45OPP");
  assert.equal(newmar.make, "Newmar");
  assert.match(newmar.model, /dutch star/i);
  assert.equal(newmar.floorplan, "45OPP");

  const units = [...TIFFIN_PHAETON_UNITS, ...FIXTURE_UNITS, ...LINEAGE_M_25FW_UNITS];
  const locations = [
    ...new Set(units.map((u) => u.location).filter(Boolean)),
  ];
  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units,
  });
  const ask = "36L Tifin Phaeton";
  const filter = parseOwnLotAsk(ask, locations, units);
  assert.equal(filter.make, "Tiffin");
  assert.match(filter.model || "", /phaeton/i);
  assert.match(filter.trim || "", /36l/i);
  const rows = queryOwnLotUnits(units, filter, 12);
  assert.deepEqual(rows.map((r) => r.stock_number), ["TF36L"]);
  assert.equal(rows[0]?.trim, "36LSE");
  assert.ok(!rows.some((u) => u.stock_number === "TF40Q"));
  const block = formatOwnLotBlock(snapshot, ask);
  assert.match(block, /Matched: 1/);
  assert.match(block, /stk TF36L/);
  assert.doesNotMatch(block, /stk TF40Q/);
});
