import assert from "node:assert/strict";
import test from "node:test";
import {
  BETA_WHITELIST_SEED,
  findBetaSeed,
  isBetaSeedPhone,
} from "./betaWhitelist.ts";
import { HARD_ADMIN } from "./constants.ts";
import { normalizePhone } from "./phone.ts";

test("beta seed has exactly the 42 CSV contacts, unique NANP + E.164", () => {
  assert.equal(BETA_WHITELIST_SEED.length, 42);
  const digits = BETA_WHITELIST_SEED.map((row) => row.digits);
  const e164 = BETA_WHITELIST_SEED.map((row) => row.e164);
  assert.equal(new Set(digits).size, 42);
  assert.equal(new Set(e164).size, 42);
  for (const row of BETA_WHITELIST_SEED) {
    const n = normalizePhone(row.digits);
    assert.ok(n, row.digits);
    assert.equal(n?.digits, row.digits);
    assert.equal(n?.e164, row.e164);
    assert.equal(row.digits.length, 10);
    assert.match(row.e164, /^\+1\d{10}$/);
  }
});

test("Mark 5412858791 is a seeded tester with CSV name and notes", () => {
  for (const raw of ["5412858791", "541-285-8791", "+15412858791", "15412858791"]) {
    const seed = findBetaSeed(raw);
    assert.ok(seed, raw);
    assert.equal(seed.contactName, "Mark 2");
    assert.equal(seed.notes, "RV Country");
    assert.equal(seed.digits, "5412858791");
    assert.equal(seed.e164, "+15412858791");
    assert.equal(isBetaSeedPhone(raw), true, raw);
  }
});

test("David Hansen 702-266-5915 is seeded; hard-admin 5918 is not", () => {
  const hansen = findBetaSeed("702-266-5915");
  assert.ok(hansen);
  assert.equal(hansen.contactName, "David Hansen");
  assert.equal(hansen.notes, "");
  assert.equal(hansen.digits, "7022665915");
  assert.equal(isBetaSeedPhone("+17022665915"), true);

  assert.equal(findBetaSeed(HARD_ADMIN.digits), null);
  assert.equal(findBetaSeed(HARD_ADMIN.e164), null);
  assert.equal(isBetaSeedPhone("702-266-5918"), false);
  assert.equal(
    BETA_WHITELIST_SEED.some((row) => row.digits === HARD_ADMIN.digits),
    false,
  );
});

test("unknown phone is not in the static seed", () => {
  assert.equal(findBetaSeed("555-000-1111"), null);
  assert.equal(findBetaSeed("5550001111"), null);
  assert.equal(isBetaSeedPhone(""), false);
  assert.equal(isBetaSeedPhone("not-a-phone"), false);
});

test("CSV first names and notes are stored on the seed", () => {
  const charlie = findBetaSeed("2816844257");
  assert.ok(charlie);
  assert.equal(charlie.contactName, "Charlie Power");
  assert.equal(charlie.notes, "Director of Operations - HWH RV");

  const slater = findBetaSeed("7753798838");
  assert.ok(slater);
  assert.equal(slater.contactName, "Don Slater");
  assert.equal(slater.notes, "");

  const samanthaWork = findBetaSeed("5594861000");
  assert.ok(samanthaWork);
  assert.equal(samanthaWork.contactName, "Samantha");
  assert.equal(samanthaWork.notes, "RV Country");
});
