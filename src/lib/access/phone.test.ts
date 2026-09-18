import assert from "node:assert/strict";
import test from "node:test";
import { HARD_ADMIN } from "./constants.ts";
import { formatPhoneDisplay, normalizePhone } from "./phone.ts";

test("normalizes US forms to digits + E.164", () => {
  const samples = [
    "702-266-5918",
    "(702) 266-5918",
    "7022665918",
    "17022665918",
    "+17022665918",
    "702.266.5918",
  ];
  for (const raw of samples) {
    const n = normalizePhone(raw);
    assert.ok(n, raw);
    assert.equal(n?.digits, "7022665918", raw);
    assert.equal(n?.e164, "+17022665918", raw);
  }
});

test("hard admin seed stores both normalized forms", () => {
  const n = normalizePhone(HARD_ADMIN.displayPhone);
  assert.deepEqual(n, { digits: HARD_ADMIN.digits, e164: HARD_ADMIN.e164 });
  assert.equal(formatPhoneDisplay(HARD_ADMIN.digits), "702-266-5918");
});

test("rejects junk and empty", () => {
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone("abc"), null);
  assert.equal(normalizePhone("123"), null);
});
