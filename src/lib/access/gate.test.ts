import assert from "node:assert/strict";
import test from "node:test";
import { HARD_ADMIN } from "./constants.ts";
import {
  canRemoveWhitelistRow,
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

test("CSV David number +17022665915 is not the admin seed", () => {
  assert.equal(isHardAdminPhone("+17022665915"), false);
  assert.equal(isHardAdminPhone("7022665915"), false);
  const d = resolveAccess("+17022665915", null);
  assert.equal(d.allowed, false);
  assert.equal(d.isAdmin, false);
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
