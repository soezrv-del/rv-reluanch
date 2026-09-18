import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PROBE_BASE,
  DEFAULT_PROBE_QUERY,
  eligibleLendersAreAprSorted,
  formatProbeLog,
  probeUrl,
  refreshLenderCatalog,
} from "./refresh-lender-catalog.mjs";

test("weekly probe targets production /api/lenders with the Boss Ops query", () => {
  assert.equal(DEFAULT_PROBE_BASE, "https://www.rvmax.app");
  assert.equal(
    DEFAULT_PROBE_QUERY,
    "zip=98001&credit=excellent&amount=150000&termMonths=180",
  );
  assert.equal(
    probeUrl(),
    "https://www.rvmax.app/api/lenders?zip=98001&credit=excellent&amount=150000&termMonths=180",
  );
});

test("eligibleLendersAreAprSorted requires non-decreasing APR among eligible", () => {
  assert.equal(eligibleLendersAreAprSorted([]), false);
  assert.equal(
    eligibleLendersAreAprSorted([
      { eligible: true, estimatedApr: 6.2 },
      { eligible: true, estimatedApr: 7.1 },
      { eligible: false, estimatedApr: 5.0 },
    ]),
    true,
  );
  assert.equal(
    eligibleLendersAreAprSorted([
      { eligible: true, estimatedApr: 8.1 },
      { eligible: true, estimatedApr: 6.2 },
    ]),
    false,
  );
});

test("refreshLenderCatalog logs source/asOf/top-3 and fails unsorted eligible", async () => {
  const sorted = {
    source: "curated",
    asOf: "2026-07-29",
    lenders: [
      { name: "Alliant", eligible: true, estimatedApr: 7.24, estimatedMonthly: 900 },
      { name: "LightStream", eligible: true, estimatedApr: 7.49, estimatedMonthly: 920 },
      { name: "Essex", eligible: true, estimatedApr: 7.79, estimatedMonthly: 940 },
    ],
  };
  const okRun = await refreshLenderCatalog({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => sorted,
    }),
  });
  assert.equal(okRun.ok, true);
  const log = formatProbeLog(sorted, probeUrl());
  assert.equal(log.source, "curated");
  assert.equal(log.asOf, "2026-07-29");
  assert.equal(log.top3Aprs[0].estimatedApr, 7.24);
  assert.equal(log.top3Aprs.length, 3);

  const bad = await refreshLenderCatalog({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        source: "rateapi",
        asOf: "2026-09-04",
        lenders: [
          { name: "High", eligible: true, estimatedApr: 9.9 },
          { name: "Low", eligible: true, estimatedApr: 6.1 },
        ],
      }),
    }),
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.log.source, "rateapi");
});
