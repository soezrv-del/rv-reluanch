import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLendersResponse,
  parseCreditBand,
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
