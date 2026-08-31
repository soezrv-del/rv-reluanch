import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("kit header is SpaceX AI-Powered RvFOX Report", () => {
  assert.match(src, /SpaceX AI-Powered RvFOX Report/);
  assert.equal(src.includes("SpaceX AI Powered RvFOX Report"), false);
});

test("payment block includes the interest rate", () => {
  assert.match(src, /Rate \$\{formatPct\(payment\.apr\)\}/);
});

test("kit accepts an editable rating override", () => {
  assert.match(src, /rating\?: number/);
  assert.match(src, /coachSnapshot\(r, opts\.rating\)/);
});

test("kit footer includes David Hansen contact", () => {
  assert.match(src, /SHARE_KIT_CONTACT/);
  const contact = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "reportContact.ts"),
    "utf8",
  );
  assert.match(contact, /David Hansen/);
  assert.match(contact, /702-266-5918/);
});
