import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseRvfoxTier,
  resolveRvfoxTier,
} from "./proEntitlement.ts";
import { dockTabOrder } from "../../components/shell/shellConstants.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("unset entitlement is consumer — Sold stays hidden", () => {
  assert.equal(resolveRvfoxTier({}), "consumer");
  assert.equal(
    resolveRvfoxTier({ stored: null, envTier: null, envPro: null }),
    "consumer",
  );
});

test("VITE_RVFOX_TIER professional / pro unlocks; consumer / free lock", () => {
  assert.equal(parseRvfoxTier("professional"), "professional");
  assert.equal(parseRvfoxTier("PRO"), "professional");
  assert.equal(parseRvfoxTier("consumer"), "consumer");
  assert.equal(parseRvfoxTier("free"), "consumer");
  assert.equal(parseRvfoxTier("nope"), null);
  assert.equal(
    resolveRvfoxTier({ envTier: "professional" }),
    "professional",
  );
  assert.equal(resolveRvfoxTier({ envTier: "consumer" }), "consumer");
});

test("device localStorage entitlement wins over env (no parallel auth)", () => {
  assert.equal(
    resolveRvfoxTier({
      stored: "consumer",
      envTier: "professional",
    }),
    "consumer",
  );
  assert.equal(
    resolveRvfoxTier({
      stored: "professional",
      envTier: "consumer",
    }),
    "professional",
  );
});

test("VITE_RVFOX_PRO true/false maps to a tier when TIER is unset", () => {
  assert.equal(resolveRvfoxTier({ envPro: "true" }), "professional");
  assert.equal(resolveRvfoxTier({ envPro: "1" }), "professional");
  assert.equal(resolveRvfoxTier({ envPro: "false" }), "consumer");
});

test("consumer dock is five tabs; pro dock appends Sold", () => {
  assert.deepEqual(dockTabOrder(false), [
    "rvfax",
    "rvcal",
    "rvgrok",
    "rvtow",
    "rvtrips",
  ]);
  assert.deepEqual(dockTabOrder(true), [
    "rvfax",
    "rvcal",
    "rvgrok",
    "rvtow",
    "rvtrips",
    "rvsold",
  ]);
});

test("Facts / More / dock gate Sold to isProfessionalTier — pro dock shows owed", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const more = readFileSync(
    join(root, "../../components/more/MoreApp.tsx"),
    "utf8",
  );
  const dock = readFileSync(
    join(root, "../../components/shell/BottomTabs.tsx"),
    "utf8",
  );
  const list = readFileSync(
    join(root, "../../components/rvfax/SoldList.tsx"),
    "utf8",
  );
  const shell = readFileSync(
    join(root, "../../components/shell/AppShell.tsx"),
    "utf8",
  );
  const constants = readFileSync(
    join(root, "../../components/shell/shellConstants.ts"),
    "utf8",
  );
  assert.match(fax, /isProfessionalTier/);
  assert.match(fax, /SoldPrompt/);
  assert.match(fax, /OPEN_SOLD_EVENT/);
  assert.match(fax, /SoldTotalsChip/);
  assert.match(more, /isProfessionalTier/);
  assert.match(more, /soldFactsSummary/);
  assert.match(more, /onNavigate\?\.\("rvsold"\)/);
  assert.match(dock, /isProfessionalTier/);
  assert.match(dock, /rvsold/);
  assert.match(dock, /formatSoldDockMoney/);
  assert.match(dock, /grid-cols-5/);
  assert.match(dock, /grid-cols-6/);
  assert.match(shell, /SoldBookApp/);
  assert.match(shell, /dockTabOrder/);
  assert.match(constants, /dockTabOrder/);
  assert.match(list, /soldFactsSummary/);
  assert.match(list, /Delete/);
  assert.match(list, /onRemove/);
  assert.doesNotMatch(list, /Remove this deal\?/);
  assert.doesNotMatch(list, /unwind|put the coach back|restore.*[Ss]aved/);
});
