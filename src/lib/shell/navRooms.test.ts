import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dockActiveTab } from "../../components/shell/dockActiveTab.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

test("dockActiveTab returns home on Home and inventory on coach detail", () => {
  assert.equal(dockActiveTab("rvgrok", true), "home");
  assert.equal(dockActiveTab("rvfax", true), "home");
  assert.equal(dockActiveTab("rvlot", true), "home");
  assert.equal(dockActiveTab("rvlot", false), "rvlot");
  assert.equal(dockActiveTab("rvfax", false), "rvfax");
  assert.equal(dockActiveTab("rvgrok", false), "rvgrok");
  assert.equal(dockActiveTab("rvtow", false), null);
  assert.equal(dockActiveTab("rvcal", false), null);
  assert.equal(dockActiveTab("more", false), null);
});

test("dock has exactly 4 rooms in order Home Facts Inventory Ask; no More tab", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  assert.match(
    tabs,
    /short: "Home"[\s\S]*short: "Facts"[\s\S]*short: "Inventory"[\s\S]*short: "Ask"/,
  );
  assert.doesNotMatch(tabs, /short: "More"/);
  assert.doesNotMatch(tabs, /id: "more"/);
  assert.doesNotMatch(tabs, /short: "Live Chat"|short: "Chat"|short: "Lot"/);
  assert.match(
    constants,
    /DOCK_TABS = \[\s*"home",\s*"rvfax",\s*"rvlot",\s*"rvgrok",\s*\]/,
  );
  const ids = [...tabs.matchAll(/\{ id: "([^"]+)", label: "([^"]+)", short: "([^"]+)" \}/g)];
  assert.equal(ids.length, 4);
  assert.deepEqual(
    ids.map((m) => [m[1], m[2], m[3]]),
    [
      ["home", "Home", "Home"],
      ["rvfax", "Facts", "Facts"],
      ["rvlot", "Inventory", "Inventory"],
      ["rvgrok", "Ask", "Ask"],
    ],
  );
});

test("swipe-between-tabs handler is removed from AppShell", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  assert.doesNotMatch(shell, /useSwipeTabs/);
  assert.doesNotMatch(shell, /SWIPE_ORDER/);
  assert.doesNotMatch(shell, /swipeArmed/);
  assert.doesNotMatch(shell, /onPeek/);
  assert.match(constants, /SWIPE_ORDER = \[\] as const/);
  assert.match(constants, /export function isSwipeTab[\s\S]*return false/);
});

test("Tow and Cal top-right tool buttons render on every room via SuiteBrand", () => {
  const brand = read("../../components/shell/SuiteBrand.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const rail = read("../../components/shell/tool-rail.css");
  assert.match(brand, /data-tool-rail="tow"/);
  assert.match(brand, /data-tool-rail="cal"/);
  assert.match(brand, /aria-label="Tow"/);
  assert.match(brand, /aria-label="Cal"/);
  assert.match(brand, /aria-label="Settings"/);
  assert.doesNotMatch(brand, /ThemeSwitch/);
  assert.doesNotMatch(brand, /showMenu/);
  assert.match(shell, /onOpenTow=\{openTowTool\}/);
  assert.match(shell, /onOpenCal=\{openCalTool\}/);
  assert.match(shell, /onOpenSettings=/);
  assert.match(rail, /\.tool-rail-btn/);
  assert.match(rail, /width:\s*36px/);
  assert.match(rail, /height:\s*36px/);
});

test("Open coach stays on Inventory; coach Back pops to Inventory list", () => {
  const home = read("../../components/shell/HomeScreen.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  assert.match(home, /onOpen\("rvlot"\)/);
  assert.match(home, /Open coach/);
  assert.match(lot, /data-lot-back/);
  assert.match(lot, /aria-label="Back"/);
  assert.match(lot, /setOpenKey\(null\)/);
  assert.doesNotMatch(lot, /Premium/);
  assert.doesNotMatch(lot, /setTab\("more"\)/);
});

test("room names are Home Facts Inventory Ask across dock and headers", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const header = read("../../components/shell/SapphireHeader.tsx");
  assert.match(constants, /title: "Ask"/);
  assert.match(constants, /title: "Inventory"/);
  assert.match(constants, /title: "Facts"/);
  assert.doesNotMatch(constants, /title: "RvGROK"|title: "LOT"|title: "RvFACTS"/);
  assert.match(bar, /placeholder="Ask"/);
  assert.match(bar, /aria-label="Ask"/);
  assert.doesNotMatch(bar, /Ask RV Grok/);
  assert.doesNotMatch(header, /ThemeSwitch/);
  assert.doesNotMatch(tabs, /Live Chat|Ask RV Grok/);
});
