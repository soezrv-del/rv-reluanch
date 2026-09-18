import assert from "node:assert/strict";
import test from "node:test";
import { formatPhoneDisplay, normalizePhoneE164 } from "./phone.ts";
import { passwordsMatch } from "./passwordMatch.ts";

test("normalizePhoneE164: US 10-digit, 11-digit, and +1 become E.164", () => {
  assert.equal(normalizePhoneE164("7022665915"), "+17022665915");
  assert.equal(normalizePhoneE164("17022665915"), "+17022665915");
  assert.equal(normalizePhoneE164("+17022665915"), "+17022665915");
  assert.equal(normalizePhoneE164("(702) 266-5915"), "+17022665915");
  assert.equal(normalizePhoneE164("702-266-5915"), "+17022665915");
  assert.equal(normalizePhoneE164("  +1 702 266 5915  "), "+17022665915");
});

test("normalizePhoneE164: CSV 10-digit staff numbers match seed", () => {
  assert.equal(normalizePhoneE164("7753798838"), "+17753798838");
  assert.equal(normalizePhoneE164("9516604949"), "+19516604949");
  assert.equal(normalizePhoneE164("8557319249"), "+18557319249");
});

test("normalizePhoneE164: rejects empty / short / junk", () => {
  assert.equal(normalizePhoneE164(""), null);
  assert.equal(normalizePhoneE164("   "), null);
  assert.equal(normalizePhoneE164("123"), null);
  assert.equal(normalizePhoneE164(null), null);
  assert.equal(normalizePhoneE164(undefined), null);
  assert.equal(normalizePhoneE164(7022665915), null);
});

test("formatPhoneDisplay: US grouping", () => {
  assert.equal(formatPhoneDisplay("+17022665915"), "+1 (702) 266-5915");
});

test("passwordsMatch is length-safe and exact", () => {
  assert.equal(passwordsMatch("secret", "secret"), true);
  assert.equal(passwordsMatch("secret", "Secret"), false);
  assert.equal(passwordsMatch("short", "longer-than"), false);
});
