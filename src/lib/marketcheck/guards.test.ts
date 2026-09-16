import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_CHARS,
  MC_PAGE_MAX,
  MC_RADIUS_MAX,
  autocompleteCacheKey,
  clampRadius,
  clampRows,
  clampStart,
  createTtlCache,
  debounce,
  isZip5,
  normalizeAutocompleteInput,
  parseAutocompleteField,
  parseZip5,
  sanitizeMcId,
  shouldFetchAutocomplete,
} from "./guards.ts";

test("clampRadius never exceeds free-tier 100 mi", () => {
  assert.equal(clampRadius(250), MC_RADIUS_MAX);
  assert.equal(clampRadius(100), 100);
  assert.equal(clampRadius(5), 10);
  assert.equal(clampRadius("50"), 50);
  assert.equal(clampRadius("nope"), 100);
});

test("clampRows and clampStart honor 500-row pagination ceiling", () => {
  assert.equal(clampRows(99), 20);
  assert.equal(clampRows(3), 3);
  assert.equal(clampStart(-4), 0);
  assert.equal(clampStart(900), MC_PAGE_MAX);
  assert.equal(MC_PAGE_MAX, 500);
});

test("ZIP and MarketCheck ids reject junk", () => {
  assert.equal(parseZip5("98374-1234"), "98374");
  assert.equal(isZip5("98374"), true);
  assert.equal(isZip5("9837"), false);
  assert.equal(sanitizeMcId("291c8378b92a72b18b54c738ec447564-8a0698b8-0df8"), "291c8378b92a72b18b54c738ec447564-8a0698b8-0df8");
  assert.equal(sanitizeMcId("../etc/passwd"), "");
  assert.equal(sanitizeMcId("id with spaces"), "");
  assert.equal(sanitizeMcId(""), "");
});

test("autocomplete gate: min chars, field whitelist, cache key", () => {
  assert.equal(AUTOCOMPLETE_MIN_CHARS, 2);
  assert.equal(shouldFetchAutocomplete("F"), false);
  assert.equal(shouldFetchAutocomplete("Fo"), true);
  assert.equal(parseAutocompleteField("MAKE"), "make");
  assert.equal(parseAutocompleteField("vin"), null);
  assert.equal(normalizeAutocompleteInput("  Forest   River  "), "Forest River");
  assert.equal(
    autocompleteCacheKey({ field: "model", input: "Di", make: "Fleetwood" }),
    "model|di|fleetwood",
  );
});

test("TTL cache expires and debounce waits", async () => {
  const cache = createTtlCache<string>(20);
  cache.set("k", "v");
  assert.equal(cache.get("k"), "v");
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(cache.get("k"), undefined);

  let n = 0;
  const d = debounce(() => {
    n += 1;
  }, 25);
  d();
  d();
  d();
  assert.equal(n, 0);
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(n, 1);
  assert.ok(AUTOCOMPLETE_DEBOUNCE_MS >= 300);
});
