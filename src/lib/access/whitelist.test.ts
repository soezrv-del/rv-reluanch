import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isPhoneWhitelisted } from "./whitelist.ts";
import { normalizePhoneE164 } from "./phone.ts";
import { ACCESS_POLICY } from "./policy.ts";

const listed = [
  "+17022665915",
  "+15412858791",
  "7753798838",
  "+1 (702) 420-0793",
];

test("isPhoneWhitelisted: David Hansen +17022665915 matches every common form", () => {
  assert.equal(isPhoneWhitelisted("+17022665915", listed), true);
  assert.equal(isPhoneWhitelisted("7022665915", listed), true);
  assert.equal(isPhoneWhitelisted("(702) 266-5915", listed), true);
  assert.equal(isPhoneWhitelisted("1-702-266-5915", listed), true);
});

test("isPhoneWhitelisted: unknown number is denied; empty is denied", () => {
  assert.equal(isPhoneWhitelisted("+15551234567", listed), false);
  assert.equal(isPhoneWhitelisted("5551234567", listed), false);
  assert.equal(isPhoneWhitelisted("", listed), false);
  assert.equal(isPhoneWhitelisted("not-a-phone", listed), false);
});

test("isPhoneWhitelisted: 10-digit CSV row matches +1 form", () => {
  assert.equal(isPhoneWhitelisted("+17753798838", listed), true);
  assert.equal(isPhoneWhitelisted("7753798838", listed), true);
  assert.equal(isPhoneWhitelisted("7024200793", listed), true);
});

test("seed CSV + migration normalize every row to unique E.164", () => {
  const root = dirname(fileURLToPath(import.meta.url));
  const csv = readFileSync(
    join(root, "../../../data/phone-whitelist-seed.csv"),
    "utf8",
  );
  const lines = csv.trim().split(/\r?\n/).slice(1);
  const phones = lines.map((line) => {
    const phone = line.split(",")[1];
    const n = normalizePhoneE164(phone);
    assert.ok(n, `seed phone should normalize: ${phone}`);
    return n;
  });
  assert.equal(phones.length, 42);
  assert.equal(new Set(phones).size, 42);
  assert.ok(phones.includes("+17022665915"));
  assert.match(
    readFileSync(join(root, "../../../migrations/0002_access_whitelist.sql"), "utf8"),
    /\+17022665915/,
  );
});

test("ACCESS_POLICY documents browse vs functional", () => {
  assert.ok(ACCESS_POLICY.browse.length >= 4);
  assert.ok(ACCESS_POLICY.functional.some((s) => /Grok send/i.test(s)));
  assert.ok(ACCESS_POLICY.functional.some((s) => /Sold/i.test(s)));
  assert.ok(ACCESS_POLICY.functional.some((s) => /Save/i.test(s)));
});
