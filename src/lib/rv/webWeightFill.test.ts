import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { BrochureSpecs } from "./brochureSpecs.ts";
import {
  applyFactsWebWeightStep,
  factsWeightGapsAfterLotAndCatalog,
} from "./factsSheet.ts";
import {
  fillWeightGapsFromWebSearch,
  firstCredibleWeight,
  isRecordedAspire44R,
  RECORDED_ASPIRE_44R_HITS,
  type SearchHit,
  type WebWeightFill,
  type WeightPin,
} from "./webWeightFill.ts";
import {
  clearWebWeightSearchCache,
  resolveWebWeightSearch,
  type WebWeightSearchEnv,
} from "./webWeightSearch.server.ts";

const root = dirname(fileURLToPath(import.meta.url));

const ASPIRE = {
  year: "2025",
  make: "Entegra Coach",
  model: "Aspire",
  floorplan: "44R",
  coachType: "motorhome" as const,
  gvwrLbs: 49_000,
};

const OWNER_HIT: SearchHit = {
  title: "2025 Entegra Aspire 44R CAT scale weigh-in",
  snippet:
    "Owner weighed our 2025 Entegra Coach Aspire 44R unloaded at a CAT scale. UVW 38,420 lbs.",
  url: "https://www.irv2.com/forums/f278/2025-entegra-aspire-44r-cat-scale-weigh-in.html",
};

function blankEnv(extra: WebWeightSearchEnv = {}): WebWeightSearchEnv {
  return {
    GOOGLE_CSE_KEY: "",
    GOOGLE_CSE_ID: "",
    SERPER_API_KEY: "",
    WEB_WEIGHT_FIXTURE: "",
    NODE_ENV: "test",
    ...extra,
  };
}

test("accepts an owner CAT-scale weigh-in for the right floorplan", () => {
  const fill = firstCredibleWeight([OWNER_HIT], { ...ASPIRE, field: "uvw" });
  assert.ok(fill);
  assert.equal(fill!.lbs, 38420);
  assert.equal(fill!.origin, "owner-reported");
  assert.equal(fill!.field, "uvw");
  assert.equal(fill!.sourceUrl, OWNER_HIT.url);
});

test("rejects a snippet that names a different floorplan", () => {
  const hit: SearchHit = {
    title: "2025 Entegra Aspire 44B dry weight",
    snippet: "2025 Entegra Coach Aspire 44B dry weight is 36,100 lbs. Owner weighed it.",
    url: "https://www.irv2.com/forums/f278/2025-entegra-aspire-44b-weigh-in.html",
  };
  assert.equal(firstCredibleWeight([hit], { ...ASPIRE, field: "uvw" }), null);
  const firstPasses = firstCredibleWeight([hit, OWNER_HIT], { ...ASPIRE, field: "uvw" });
  assert.equal(firstPasses?.lbs, 38420);
  assert.equal(firstPasses?.sourceUrl, OWNER_HIT.url);
});

test("rejects UVW outside the coach-type range", () => {
  const light: SearchHit = {
    title: "2025 Entegra Aspire 44R",
    snippet: "2025 Entegra Coach Aspire 44R UVW 1,500 lbs.",
    url: "https://example.com/light",
  };
  assert.equal(firstCredibleWeight([light], { ...ASPIRE, field: "uvw" }), null);

  const heavyTrailer: SearchHit = {
    title: "2024 Grand Design Reflection 337RLS",
    snippet: "2024 Grand Design Reflection 337RLS dry weight 25,000 lbs.",
    url: "https://example.com/heavy-tt",
  };
  assert.equal(
    firstCredibleWeight([heavyTrailer], {
      year: "2024",
      make: "Grand Design",
      model: "Reflection",
      floorplan: "337RLS",
      field: "uvw",
      coachType: "towable",
    }),
    null,
  );

  const lightTrailer: SearchHit = {
    title: "2024 Grand Design Reflection 337RLS",
    snippet: "2024 Grand Design Reflection 337RLS UVW 800 lbs.",
    url: "https://example.com/light-tt",
  };
  assert.equal(
    firstCredibleWeight([lightTrailer], {
      year: "2024",
      make: "Grand Design",
      model: "Reflection",
      floorplan: "337RLS",
      field: "uvw",
      coachType: "towable",
    }),
    null,
  );
});

test("rejects UVW greater than the coach GVWR", () => {
  const hit: SearchHit = {
    title: "2025 Entegra Aspire 44R",
    snippet: "2025 Entegra Coach Aspire 44R UVW 42,000 lbs.",
    url: "https://example.com/over-gvwr",
  };
  assert.equal(
    firstCredibleWeight([hit], { ...ASPIRE, field: "uvw", gvwrLbs: 40_000 }),
    null,
  );
  const under = firstCredibleWeight([hit], { ...ASPIRE, field: "uvw", gvwrLbs: 49_000 });
  assert.equal(under?.lbs, 42000);
  assert.equal(under?.origin, "web search");

  const both = firstCredibleWeight([RECORDED_ASPIRE_44R_HITS[1]!], {
    ...ASPIRE,
    field: "gvwr",
  });
  assert.equal(both?.lbs, 49000);
});

test("web fill never beats a lot or catalog pin and only fills empty cells", () => {
  const pins: WeightPin[] = [
    { field: "gvwr", lbs: 49_000, pinned: true },
    { field: "uvw", lbs: null, pinned: false },
    { field: "ccc", lbs: 4_200, pinned: true },
    { field: "hitch", lbs: null, pinned: false },
    { field: "gcwr", lbs: null, pinned: false },
  ];
  const fills: WebWeightFill[] = [
    {
      field: "gvwr",
      lbs: 52_000,
      origin: "web search",
      sourceUrl: "https://example.com/gvwr",
    },
    {
      field: "uvw",
      lbs: 38_420,
      origin: "owner-reported",
      sourceUrl: OWNER_HIT.url,
    },
    {
      field: "ccc",
      lbs: 9_000,
      origin: "web search",
      sourceUrl: "https://example.com/ccc",
    },
  ];
  const applied = fillWeightGapsFromWebSearch(pins, fills);
  assert.deepEqual(
    applied.map((row) => row.field),
    ["uvw"],
  );
  assert.equal(pins[0]!.lbs, 49_000);
  assert.equal(fills.length, 3);

  const brochure = {
    gvwrLbs: 49_000,
    gvwr: "49,000 lbs",
    uvwLbs: null,
    uvwEstimated: true,
    uvw: "Confirm brochure",
    cccLbs: 4_200,
    ccc: "4,200 lbs",
    hitchOrPin: "Confirm brochure",
    hitchLabel: "Pin Weight (est.)",
    gcwr: "59,000 lbs",
  } as BrochureSpecs;
  const gaps = factsWeightGapsAfterLotAndCatalog(brochure);
  assert.equal(gaps.includes("gvwr"), false);
  assert.equal(gaps.includes("ccc"), false);
  assert.equal(gaps.includes("uvw"), true);
  assert.equal(gaps.includes("hitch"), true);
  assert.equal(gaps.includes("gcwr"), true);
  const stepped = applyFactsWebWeightStep(brochure, fills);
  assert.deepEqual(
    stepped.map((row) => row.field),
    ["uvw"],
  );
});

test("no search key is a no-op and does not touch the network", async () => {
  clearWebWeightSearchCache();
  let called = false;
  const result = await resolveWebWeightSearch(
    { ...ASPIRE, fields: ["uvw"] },
    {
      env: blankEnv(),
      cache: new Map(),
      fetch: async () => {
        called = true;
        throw new Error("network");
      },
    },
  );
  assert.equal(called, false);
  assert.equal(result.skipped, "no-key");
  assert.deepEqual(result.fills, []);
});

test("mocked Google CSE result fills UVW through the real parser", async () => {
  let url = "";
  const result = await resolveWebWeightSearch(
    { ...ASPIRE, fields: ["uvw", "gvwr"] },
    {
      env: blankEnv({ GOOGLE_CSE_KEY: "test-key", GOOGLE_CSE_ID: "test-cx" }),
      cache: new Map(),
      fetch: async (input) => {
        url = String(input);
        return new Response(
          JSON.stringify({
            items: [
              {
                title: OWNER_HIT.title,
                snippet: OWNER_HIT.snippet,
                link: OWNER_HIT.url,
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  );
  assert.match(url, /customsearch\/v1/);
  assert.equal(result.skipped, undefined);
  const uvw = result.fills.find((row) => row.field === "uvw");
  assert.equal(uvw?.lbs, 38420);
  assert.equal(uvw?.origin, "owner-reported");
});

test("Serper is used when Google keys are unset", async () => {
  let host = "";
  const result = await resolveWebWeightSearch(
    { ...ASPIRE, fields: ["uvw"] },
    {
      env: blankEnv({ SERPER_API_KEY: "serper-test" }),
      cache: new Map(),
      fetch: async (input) => {
        host = String(input);
        return new Response(
          JSON.stringify({
            organic: [
              {
                title: OWNER_HIT.title,
                snippet: OWNER_HIT.snippet,
                link: OWNER_HIT.url,
              },
            ],
          }),
          { status: 200 },
        );
      },
    },
  );
  assert.match(host, /google\.serper\.dev/);
  assert.equal(result.fills[0]?.lbs, 38420);
});

test("dev fixture replays the recorded Aspire 44R search without a key", async () => {
  assert.equal(isRecordedAspire44R(ASPIRE), true);
  let called = false;
  const result = await resolveWebWeightSearch(
    { ...ASPIRE, fields: ["uvw"] },
    {
      env: blankEnv({ WEB_WEIGHT_FIXTURE: "1", NODE_ENV: "development" }),
      cache: new Map(),
      fetch: async () => {
        called = true;
        throw new Error("network");
      },
    },
  );
  assert.equal(called, false);
  assert.equal(result.fills.length, 1);
  assert.equal(result.fills[0]?.lbs, 38420);
  assert.equal(result.fills[0]?.origin, "owner-reported");
  assert.equal(result.fills[0]?.sourceUrl, RECORDED_ASPIRE_44R_HITS[1]!.url);
  assert.notEqual(result.fills[0]?.lbs, 36100);

  const other = await resolveWebWeightSearch(
    {
      ...ASPIRE,
      floorplan: "44B",
      fields: ["uvw"],
    },
    {
      env: blankEnv({ WEB_WEIGHT_FIXTURE: "1", NODE_ENV: "development" }),
      cache: new Map(),
      fetch: async () => {
        throw new Error("network");
      },
    },
  );
  assert.equal(other.skipped, "no-key");
  assert.deepEqual(other.fills, []);

  const production = await resolveWebWeightSearch(
    { ...ASPIRE, fields: ["uvw"] },
    {
      env: blankEnv({ WEB_WEIGHT_FIXTURE: "1", NODE_ENV: "production" }),
      cache: new Map(),
      fetch: async () => {
        throw new Error("network");
      },
    },
  );
  assert.equal(production.skipped, "no-key");
});

test("successful searches are cached per coach and field", async () => {
  const cache = new Map();
  let calls = 0;
  const deps = {
    env: blankEnv({ SERPER_API_KEY: "serper-test" }),
    cache,
    now: 1_000,
    fetch: async () => {
      calls += 1;
      return new Response(
        JSON.stringify({
          organic: [
            { title: OWNER_HIT.title, snippet: OWNER_HIT.snippet, link: OWNER_HIT.url },
          ],
        }),
        { status: 200 },
      );
    },
  };
  const first = await resolveWebWeightSearch({ ...ASPIRE, fields: ["uvw"] }, deps);
  const second = await resolveWebWeightSearch({ ...ASPIRE, fields: ["uvw"] }, deps);
  assert.equal(first.fills[0]?.lbs, 38420);
  assert.equal(second.fills[0]?.lbs, 38420);
  assert.equal(calls, 1);
});

test("weight route stays off the voice, DialaBot, and catalog write path", () => {
  const route = readFileSync(join(root, "../../routes/api/rvfax.web-weight.ts"), "utf8");
  const sheet = readFileSync(join(root, "factsSheet.ts"), "utf8");
  const search = readFileSync(join(root, "webWeightSearch.server.ts"), "utf8");
  for (const text of [route, search]) {
    assert.doesNotMatch(text, /liveVoice|prompts\.ts|DialaBot|dialabot|rvData|floorplanSpecs/i);
  }
  assert.match(sheet, /applyFactsWebWeightStep/);
  assert.match(sheet, /fillBrochureHolesFromLot/);
  assert.match(route, /resolveWebWeightSearch/);
});
