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

test("consumer and pro dock stay six tabs — Sold is Premium-only", () => {
  const six = [
    "rvfax",
    "rvcal",
    "rvgrok",
    "rvtow",
    "rvtrips",
    "rvlot",
  ];
  assert.deepEqual(dockTabOrder(false), six);
  assert.deepEqual(dockTabOrder(true), six);
});

test("Facts / More gate Sold to isProfessionalTier — dock has no Sold square", () => {
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
  assert.doesNotMatch(fax, /SoldTotalsChip/);
  assert.doesNotMatch(fax, /Sold book/);
  assert.match(more, /isProfessionalTier/);
  assert.match(more, /soldFactsSummary/);
  assert.match(more, /onNavigate\?\.\("rvsold"\)/);
  assert.doesNotMatch(dock, /id: "rvsold"/);
  assert.doesNotMatch(dock, /short: "Sold"/);
  assert.doesNotMatch(dock, /formatSoldDockMoney/);
  assert.doesNotMatch(dock, /formatSoldDockAria/);
  assert.doesNotMatch(dock, /formatSoldMoney/);
  assert.match(dock, /grid-cols-6/);
  assert.doesNotMatch(dock, /grid-cols-5/);
  assert.match(shell, /SoldBookApp/);
  assert.match(shell, /show\("rvsold"\)/);
  assert.match(shell, /dockTabOrder/);
  assert.match(constants, /dockTabOrder/);
  assert.match(constants, /Sold lives in Premium/);
  assert.doesNotMatch(list, /SoldTotalsChip/);
  assert.doesNotMatch(list, /soldFactsSummary/);
  assert.match(list, /Delete/);
  assert.match(list, /onRemove/);
  assert.doesNotMatch(list, /Remove this deal\?/);
  assert.doesNotMatch(list, /unwind|put the coach back|restore.*[Ss]aved/);
});

test("Facts saved-unit sold trigger is a Sold label, flashes ruby then drops", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(fax, /aria-label=\{`Sold \$\{r\.year\}/);
  assert.match(fax, /border-green\/40 bg-green\/15 text-green/);
  assert.match(fax, /border-ruby-border bg-ruby text-white/);
  assert.match(fax, /soldFlash/);
  assert.match(fax, /beginSell/);
  assert.match(fax, /sellSavedCoach/);
  assert.match(fax, /SoldPrompt/);
  assert.match(fax, />\s*Sold\s*</);
  assert.match(fax, /onSell=\{isPro \? \(\) => beginSell\(detail\) : undefined\}/);
  assert.match(detail, /data-facts-sold=""/);
  assert.match(detail, /Log as Sold/);
});
