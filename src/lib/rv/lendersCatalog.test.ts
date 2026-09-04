import assert from "node:assert/strict";
import test from "node:test";
import {
  SIMULATE_SOURCE_LINE,
  buildLendersResponse,
  buildSimulateLendersResponse,
  lendersSourceLine,
  parseCreditBand,
  parseLenderRateSource,
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
  for (let i = 1; i < eligible.length; i++) {
    assert.ok(
      eligible[i].estimatedApr >= eligible[i - 1].estimatedApr,
      `${eligible[i].name} APR should be >= ${eligible[i - 1].name}`,
    );
  }
  const firstIneligible = body.lenders.findIndex((l) => !l.eligible);
  if (firstIneligible >= 0) {
    assert.ok(body.lenders.slice(0, firstIneligible).every((l) => l.eligible));
  }
});
