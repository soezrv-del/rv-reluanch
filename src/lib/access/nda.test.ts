import assert from "node:assert/strict";
import test from "node:test";
import { NDA_STORAGE_KEY } from "./constants.ts";
import { resolveAccess } from "./gate.ts";
import {
  acceptNda,
  hasAcceptedNda,
  ndaAcceptanceGrantsAccess,
  readNdaAcceptance,
  type NdaStorage,
} from "./nda.ts";
import { NDA_TEXT, NDA_VERSION } from "./ndaText.ts";

function memoryStorage(seed: Record<string, string> = {}): NdaStorage {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

test("first launch shows NDA — empty device is not accepted", () => {
  const storage = memoryStorage();
  assert.equal(hasAcceptedNda(storage), false);
  assert.equal(readNdaAcceptance(storage), null);
  assert.match(NDA_TEXT, /PLACEHOLDER/);
});

test("after accept, no re-prompt on the same NDA version", () => {
  const storage = memoryStorage();
  const rec = acceptNda("702-555-0100", storage);
  assert.equal(rec.v, NDA_VERSION);
  assert.equal(rec.phone, "7025550100");
  assert.equal(hasAcceptedNda(storage), true);
  const stored = storage.getItem(NDA_STORAGE_KEY);
  assert.ok(stored);
  assert.match(stored, /"v":\s*1/);
});

test("older NDA version is treated as not accepted", () => {
  const storage = memoryStorage({
    [NDA_STORAGE_KEY]: JSON.stringify({ v: NDA_VERSION - 1, at: "2020-01-01T00:00:00.000Z" }),
  });
  assert.equal(hasAcceptedNda(storage), false);
});

test("accept alone does not unlock the functional gate", () => {
  const storage = memoryStorage();
  acceptNda("555-000-1111", storage);
  assert.equal(hasAcceptedNda(storage), true);
  assert.equal(ndaAcceptanceGrantsAccess(), false);
  const d = resolveAccess("555-000-1111", null);
  assert.equal(d.allowed, false);
  assert.equal(d.matched, false);
});
