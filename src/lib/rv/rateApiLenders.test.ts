import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLendersResponse } from "./lendersCatalog.ts";
import {
  CU_PUBLISHED_RATE_NOTE,
  buildRateApiResponse,
  clearRateApiCache,
  mapRateApiRowsToQuotes,
  parseRateApiPayload,
  pickPreferredRow,
  rateApiCacheKey,
  resolveLendersResponse,
  rowApr,
  snapPreferredTerm,
  type RateApiFetch,
  type RateApiPayload,
} from "./rateApiLenders.ts";
import { stateFromZip } from "./zipTax.ts";

const root = dirname(fileURLToPath(import.meta.url));

function mockPayload(): RateApiPayload {
  return {
    as_of: "2026-09-04T12:00:00Z",
    rates: [
      {
        lender: "Navy Federal Credit Union",
        state: "TX",
        apr: 6.49,
        rate: 6.24,
        term_months: 180,
        as_of: "2026-09-03T00:00:00Z",
      },
      {
        lender: "Alliant Credit Union",
        state: "TX",
        apr: 7.24,
        term_months: 180,
        as_of: "2026-09-02T00:00:00Z",
      },
      {
        lender: "Navy Federal Credit Union",
        state: "TX",
        apr: 5.99,
        term_months: 120,
        as_of: "2026-09-03T00:00:00Z",
      },
    ],
  };
}

function jsonFetch(payload: unknown, status = 200): RateApiFetch {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  });
}

test("stateFromZip reuses zipTax — 78701 is TX", () => {
  assert.deepEqual(stateFromZip("78701"), { state: "Texas", abbr: "TX" });
  assert.equal(stateFromZip("12"), null);
});

test("snapPreferredTerm lands on RvCal buckets", () => {
  assert.equal(snapPreferredTerm(240), 240);
  assert.equal(snapPreferredTerm(200), 180);
  assert.equal(snapPreferredTerm(null), 180);
  assert.equal(rateApiCacheKey("tx", 180), "rv:TX:180");
});

test("rowApr prefers apr then rate", () => {
  assert.equal(rowApr({ apr: 6.49, rate: 6.1 }), 6.49);
  assert.equal(rowApr({ rate: 6.1 }), 6.1);
  assert.equal(rowApr({ apr: "nope" }), null);
});

test("pickPreferredRow uses closest term then lowest APR", () => {
  const row = pickPreferredRow(mockPayload().rates, 180);
  assert.equal(row?.lender, "Navy Federal Credit Union");
  assert.equal(row?.apr, 6.49);
});

test("mapRateApiRowsToQuotes sorts lowest APR first and labels CU honesty", () => {
  const quotes = mapRateApiRowsToQuotes(mockPayload(), {
    amount: 80_000,
    termMonths: 180,
    credit: "excellent",
    state: "TX",
  });
  assert.ok(quotes.length >= 2);
  assert.equal(quotes[0].name, "Navy Federal Credit Union");
  assert.equal(quotes[0].estimatedApr, 6.49);
  assert.equal(quotes[0].termUsed, 180);
  assert.equal(quotes[0].eligible, true);
  assert.equal(quotes[0].rateNote, CU_PUBLISHED_RATE_NOTE);
  assert.ok((quotes[0].estimatedMonthly ?? 0) > 0);
  assert.ok(quotes[0].estimatedApr <= quotes[1].estimatedApr);
});

test("buildRateApiResponse sets source rateapi and asOf", () => {
  const body = buildRateApiResponse(
    { amount: 50_000, termMonths: 180, credit: "good", zip: "78704" },
    mockPayload(),
    { cached: true },
  );
  assert.ok(body);
  assert.equal(body.source, "rateapi");
  assert.equal(body.cached, true);
  assert.equal(body.query.state, "TX");
  assert.equal(body.asOf, "2026-09-04T12:00:00Z");
  assert.match(body.disclaimer, /RateAPI/);
});

test("resolveLendersResponse stays curated when key is absent", async () => {
  clearRateApiCache();
  let calls = 0;
  const body = await resolveLendersResponse(
    { amount: 40_000, termMonths: 120, zip: "78701" },
    {
      apiKey: null,
      fetchImpl: async () => {
        calls += 1;
        throw new Error("should not fetch");
      },
    },
  );
  assert.equal(body.source, "curated");
  assert.equal(calls, 0);
  assert.equal(body.query.state, "TX");
});

test("resolveLendersResponse stays curated without a ZIP/state", async () => {
  clearRateApiCache();
  let calls = 0;
  const body = await resolveLendersResponse(
    { amount: 40_000, termMonths: 120 },
    {
      apiKey: "test-key",
      fetchImpl: async () => {
        calls += 1;
        return { ok: true, status: 200, json: async () => mockPayload() };
      },
    },
  );
  assert.equal(body.source, "curated");
  assert.equal(calls, 0);
});

test("resolveLendersResponse maps a live RateAPI payload", async () => {
  clearRateApiCache();
  const body = await resolveLendersResponse(
    { amount: 80_000, termMonths: 180, credit: "excellent", zip: "78701" },
    { apiKey: "test-key", fetchImpl: jsonFetch(mockPayload()) },
  );
  assert.equal(body.source, "rateapi");
  assert.equal(body.lenders[0]?.estimatedApr, 6.49);
  assert.equal(body.query.state, "TX");
});

test("resolveLendersResponse caches RateAPI and does not refetch", async () => {
  clearRateApiCache();
  let calls = 0;
  const fetchImpl: RateApiFetch = async (url) => {
    calls += 1;
    assert.match(url, /product_type=rv/);
    assert.match(url, /state=TX/);
    assert.match(url, /term_months=180/);
    assert.match(url, /sort=apr_asc/);
    return {
      ok: true,
      status: 200,
      json: async () => mockPayload(),
    };
  };
  const first = await resolveLendersResponse(
    { amount: 80_000, termMonths: 180, zip: "78701" },
    { apiKey: "test-key", fetchImpl },
  );
  const second = await resolveLendersResponse(
    { amount: 120_000, termMonths: 175, credit: "fair", zip: "78704" },
    { apiKey: "test-key", fetchImpl, now: Date.now() + 60_000 },
  );
  assert.equal(first.source, "rateapi");
  assert.equal(second.source, "rateapi");
  assert.equal(second.cached, true);
  assert.equal(calls, 1);
});

test("resolveLendersResponse falls back to curated on RateAPI failure", async () => {
  clearRateApiCache();
  const body = await resolveLendersResponse(
    { amount: 40_000, termMonths: 120, zip: "10001" },
    { apiKey: "test-key", fetchImpl: jsonFetch({ error: "nope" }, 429) },
  );
  assert.equal(body.source, "curated");
  assert.equal(body.query.state, "NY");
  const curated = buildLendersResponse({
    amount: 40_000,
    termMonths: 120,
    zip: "10001",
  });
  assert.equal(body.lenders.length, curated.lenders.length);
});

test("resolveLendersResponse falls back when RateAPI returns no rows", async () => {
  clearRateApiCache();
  const body = await resolveLendersResponse(
    { amount: 40_000, termMonths: 120, zip: "90210" },
    { apiKey: "test-key", fetchImpl: jsonFetch({ rates: [], as_of: null }) },
  );
  assert.equal(body.source, "curated");
  assert.equal(body.query.state, "CA");
});

test("parseRateApiPayload rejects junk", () => {
  assert.equal(parseRateApiPayload(null), null);
  assert.equal(parseRateApiPayload({ nope: true }), null);
  assert.ok(parseRateApiPayload({ rates: [] }));
});

test("source files never hardcode a RateAPI key", () => {
  const files = [
    join(root, "rateApiLenders.ts"),
    join(root, "lendersCatalog.ts"),
    join(root, "../../routes/api/lenders.ts"),
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /RATEAPI_API_KEY\s*=\s*["'][^"']+["']/);
    assert.doesNotMatch(src, /Bearer\s+[A-Za-z0-9_\-]{20,}/);
  }
});
