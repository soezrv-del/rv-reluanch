import assert from "node:assert/strict";
import test from "node:test";
import { HARD_ADMIN } from "./constants.ts";
import {
  betaSeedAccessResult,
  canRemoveWhitelistRow,
  hardAdminAccessResult,
  hardAdminRequestResult,
  isHardAdminPhone,
  requestGrantsAccess,
  resolveAccess,
} from "./gate.ts";

test("hard admin number is always admin + full access", () => {
  for (const raw of [
    "702-266-5918",
    "7022665918",
    "+17022665918",
    HARD_ADMIN.e164,
  ]) {
    assert.equal(isHardAdminPhone(raw), true, raw);
    const d = resolveAccess(raw, null);
    assert.equal(d.allowed, true, raw);
    assert.equal(d.isAdmin, true, raw);
  }
});

test("hard-admin check result is offline — no store or SQL", () => {
  for (const raw of ["702-266-5918", "7022665918", "+17022665918"]) {
    const result = hardAdminAccessResult(raw);
    assert.ok(result, raw);
    assert.equal(result.ok, true);
    assert.equal(result.allowed, true);
    assert.equal(result.isAdmin, true);
    assert.equal(result.name, HARD_ADMIN.name);
    assert.equal(result.phoneDigits, HARD_ADMIN.digits);
    assert.equal(result.phoneE164, HARD_ADMIN.e164);
  }
  assert.equal(hardAdminAccessResult("555-123-4567"), null);
  assert.equal(hardAdminAccessResult("+17022665915"), null);
  assert.equal(hardAdminAccessResult(""), null);
});

test("hard-admin request result is already approved without a DB insert", () => {
  const result = hardAdminRequestResult("702-266-5918");
  assert.ok(result);
  assert.equal(result.ok, true);
  assert.equal(result.requested, false);
  assert.equal(result.granted, true);
  assert.equal(result.alreadyAdmin, true);
  assert.equal(result.phoneE164, HARD_ADMIN.e164);
  assert.equal(hardAdminRequestResult("555-000-1111"), null);
});

test("CSV David Hansen 702-266-5915 is allowed and not admin", () => {
  assert.equal(isHardAdminPhone("+17022665915"), false);
  assert.equal(isHardAdminPhone("7022665915"), false);
  const d = resolveAccess("+17022665915", null);
  assert.equal(d.allowed, true);
  assert.equal(d.isAdmin, false);
  assert.equal(d.matched, true);
  const seed = betaSeedAccessResult("702-266-5915");
  assert.ok(seed);
  assert.equal(seed.allowed, true);
  assert.equal(seed.isAdmin, false);
  assert.equal(seed.name, "David Hansen");
  assert.equal(seed.phoneDigits, "7022665915");
  assert.equal(seed.phoneE164, "+17022665915");
});

test("CSV seed phone is allowed without Neon and is never admin", () => {
  for (const raw of ["5412858791", "541-285-8791", "+15412858791"]) {
    const d = resolveAccess(raw, null);
    assert.equal(d.allowed, true, raw);
    assert.equal(d.isAdmin, false, raw);
    assert.equal(d.matched, true, raw);
    const seed = betaSeedAccessResult(raw);
    assert.ok(seed, raw);
    assert.equal(seed.allowed, true, raw);
    assert.equal(seed.isAdmin, false, raw);
    assert.equal(seed.name, "Mark 2", raw);
    assert.equal(seed.phoneDigits, "5412858791", raw);
    assert.equal(seed.phoneE164, "+15412858791", raw);
  }
  assert.equal(betaSeedAccessResult(HARD_ADMIN.e164), null);
  assert.equal(betaSeedAccessResult("555-000-1111"), null);
});

test("listed non-admin gets full access without admin flag", () => {
  const d = resolveAccess("555-123-4567", {
    phoneDigits: "5551234567",
    phoneE164: "+15551234567",
    isAdmin: false,
  });
  assert.equal(d.allowed, true);
  assert.equal(d.isAdmin, false);
});

test("unknown number is browse-only", () => {
  const d = resolveAccess("555-000-1111", null);
  assert.equal(d.allowed, false);
  assert.equal(d.isAdmin, false);
  assert.equal(d.matched, false);
});

test("self-service request never grants access", () => {
  assert.equal(requestGrantsAccess(), false);
});

test("hard admin row cannot be removed", () => {
  assert.equal(canRemoveWhitelistRow(HARD_ADMIN.digits), false);
  assert.equal(canRemoveWhitelistRow("5551234567"), true);
});
