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
  OWN_LOT_PUBLIC_URL_PATH,
  ownLotHasHit,
  ownLotIsUnavailable,
  ownLotPublicFileCandidates,
  parseOwnLotAsk,
  parseOwnLotCsv,
  parseOwnLotUnits,
  sameOriginOwnLotUrls,
  shouldSkipWebForOwnLot,
  snapshotFromJson,
  type OwnLotSnapshot,
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
