import assert from "node:assert/strict";
import test from "node:test";
import {
  LENDERS_CATALOG,
  SIMULATE_SOURCE_LINE,
  buildLendersResponse,
  buildSimulateLendersResponse,
  lendersSourceLine,
  parseCreditBand,
  parseLenderRateSource,
  sortLenderQuotes,
  sortLendersForCompare,
  type LenderQuote,
} from "./lendersCatalog.ts";

test("parseCreditBand normalizes and defaults to excellent", () => {
  assert.equal(parseCreditBand("good"), "good");
  assert.equal(parseCreditBand("very_good"), "very-good");
  assert.equal(parseCreditBand(null), "excellent");
  assert.equal(parseCreditBand("nope"), "excellent");
});

test("curated fallback derives state from ZIP and never claims live rates", () => {
  const body = buildLendersResponse({
    amount: 80_000,
    termMonths: 180,
    credit: "excellent",
    zip: "78701",
  });
  assert.equal(body.source, "curated");
  assert.equal(body.query.state, "TX");
  assert.equal(body.query.zip, "78701");
  assert.match(body.disclaimer, /not live/i);
  assert.match(body.disclaimer, /TX/);
});

test("parseLenderRateSource only treats rateapi as live", () => {
  assert.equal(parseLenderRateSource("rateapi"), "rateapi");
  assert.equal(parseLenderRateSource("simulate"), "simulate");
  assert.equal(parseLenderRateSource("curated"), "curated");
  assert.equal(parseLenderRateSource("live"), "curated");
  assert.equal(parseLenderRateSource(undefined), "curated");
});

test("lendersSourceLine never claims live CU rates unless source is rateapi", () => {
  assert.match(
    lendersSourceLine({
      source: "rateapi",
      asOf: "2026-09-04T12:00:00Z",
      state: "TX",
    }),
    /Live credit-union RV rates in TX as of/,
  );
  assert.equal(
    lendersSourceLine({
      source: "simulate",
      asOf: "2026-07-29",
      state: "TX",
    }),
    SIMULATE_SOURCE_LINE,
  );
  assert.doesNotMatch(
    lendersSourceLine({
      source: "simulate",
      asOf: "2026-07-29",
      state: "TX",
    }),
    /live CU|Live credit-union/i,
  );
  assert.match(
    lendersSourceLine({
      source: "curated",
      asOf: "2026-07-29",
      state: "NY",
    }),
    /Curated estimates/,
  );
  assert.doesNotMatch(
    lendersSourceLine({
      source: "curated",
      asOf: "2026-07-29",
      state: "NY",
    }),
    /Live credit-union/,
  );
});

test("simulate response keeps catalog quotes and ZIP/state, labeled preview", () => {
  const body = buildSimulateLendersResponse({
    amount: 80_000,
    termMonths: 180,
    credit: "excellent",
    zip: "78701",
  });
  assert.equal(body.source, "simulate");
  assert.equal(body.query.state, "TX");
  assert.equal(body.query.zip, "78701");
  assert.equal(body.query.amount, 80_000);
  assert.match(body.disclaimer, /not live RateAPI/i);
  assert.doesNotMatch(body.disclaimer, /Live credit-union/);
  const curated = buildLendersResponse({
    amount: 80_000,
    termMonths: 180,
    credit: "excellent",
    zip: "78701",
  });
  assert.equal(body.lenders.length, curated.lenders.length);
  const firstApr = body.lenders[0]?.estimatedApr;
  const secondApr = body.lenders[1]?.estimatedApr;
  assert.ok(firstApr != null && secondApr != null && firstApr <= secondApr);
});

test("curated quotes sort eligible then lowest APR first", () => {
  const body = buildLendersResponse({
    amount: 40_000,
    termMonths: 120,
    credit: "excellent",
    zip: "10001",
  });
  assert.equal(body.query.state, "NY");
  const eligible = body.lenders.filter((l) => l.eligible);
  assert.ok(eligible.length >= 2);
  assert.equal(eligible[0]?.id, "alliant");
  assert.ok(eligible[0]!.estimatedApr < LENDERS_CATALOG[0]!.aprLow);
  for (let i = 1; i < eligible.length; i++) {
    const prev = eligible[i - 1]!;
    const next = eligible[i]!;
    if (next.estimatedApr !== prev.estimatedApr) {
      assert.ok(
        next.estimatedApr > prev.estimatedApr,
        `${next.name} APR should be > ${prev.name}`,
      );
      continue;
    }
    const prevMo = prev.estimatedMonthly ?? 1e12;
    const nextMo = next.estimatedMonthly ?? 1e12;
    if (nextMo !== prevMo) {
      assert.ok(nextMo > prevMo, `${next.name} monthly should be >= ${prev.name}`);
    }
  }
  const firstIneligible = body.lenders.findIndex((l) => !l.eligible);
  if (firstIneligible >= 0) {
    assert.ok(body.lenders.slice(0, firstIneligible).every((l) => l.eligible));
  }
});

function quoteStub(partial: Partial<LenderQuote> & Pick<LenderQuote, "id" | "estimatedApr" | "eligible">): LenderQuote {
  return {
    name: partial.id,
    aprLow: partial.estimatedApr,
    aprHigh: partial.estimatedApr,
    termMin: 12,
    termMax: 120,
    minLoan: 0,
    minBand: "fair",
    perks: [],
    url: "",
    estimatedMonthly: null,
    termUsed: 120,
    ...partial,
  };
}

test("sortLenderQuotes ranks APR then lower monthly then longer term", () => {
  const sorted = sortLenderQuotes([
    quoteStub({ id: "a", estimatedApr: 8, estimatedMonthly: 400, termUsed: 120, termMax: 120, eligible: true }),
    quoteStub({ id: "b", estimatedApr: 8, estimatedMonthly: 400, termUsed: 180, termMax: 180, eligible: true }),
    quoteStub({ id: "c", estimatedApr: 8, estimatedMonthly: 350, termUsed: 84, termMax: 84, eligible: true }),
    quoteStub({ id: "d", estimatedApr: 7, estimatedMonthly: 500, termUsed: 60, termMax: 60, eligible: true }),
    quoteStub({ id: "e", estimatedApr: 7, estimatedMonthly: 500, termUsed: 60, termMax: 60, eligible: false }),
  ]);
  assert.deepEqual(
    sorted.map((l) => l.id),
    ["d", "c", "b", "a", "e"],
  );
});

test("sortLendersForCompare never leaves raw catalog insertion order", () => {
  assert.equal(LENDERS_CATALOG[0]?.id, "lightstream");
  const ui = sortLendersForCompare(LENDERS_CATALOG, {
    credit: "excellent",
    amount: 40_000,
    termMonths: 120,
  });
  const fromApi = sortLendersForCompare(
    [...ui].reverse(),
    { credit: "excellent", amount: 40_000, termMonths: 120 },
  );
  assert.equal(ui[0]?.id, "alliant");
  assert.equal(fromApi[0]?.id, "alliant");
  const eligible = ui.filter((l) => l.eligible);
  for (let i = 1; i < eligible.length; i++) {
    assert.ok(eligible[i]!.estimatedApr >= eligible[i - 1]!.estimatedApr);
  }
});
