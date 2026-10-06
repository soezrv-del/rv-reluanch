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
  assert.equal(dockActiveTab("rvlot", false), "rvlot");
  assert.equal(dockActiveTab("rvtow", false), null);
});

test("dock has exactly 4 rooms Home Facts Inventory Ask; no More; no DockTab export", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(
    tabs,
    /short: "Home"[\s\S]*short: "Facts"[\s\S]*short: "Inventory"[\s\S]*short: "Ask"/,
  );
  assert.doesNotMatch(tabs, /short: "More"/);
  assert.doesNotMatch(tabs, /^export type DockTab\b/m);
  assert.doesNotMatch(tabs, /import type \{[^}]*\bDockTab\b/);
  assert.doesNotMatch(tabs, /import \{[^}]*\bDockTab\b/);
  assert.doesNotMatch(shell, /\bDockTab\b/);
  assert.match(tabs, /export type DockRoomId/);
  assert.match(tabs, /export const DOCK_ROOM_IDS/);
});

test("swipe handler removed; Tow/Cal rail on SuiteBrand", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const brand = read("../../components/shell/SuiteBrand.tsx");
  assert.doesNotMatch(shell, /useSwipeTabs|SWIPE_ORDER|swipeArmed/);
  assert.match(brand, /data-tool-rail="tow"/);
  assert.match(brand, /data-tool-rail="cal"/);
  assert.match(brand, /aria-label="Settings"/);
  assert.doesNotMatch(brand, /ThemeSwitch|showMenu/);
  assert.match(shell, /onOpenTow=\{openTowTool\}/);
});

test("Open coach stays on Inventory; coach Back pops to list", () => {
  const home = read("../../components/shell/HomeScreen.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  assert.match(home, /onOpen\("rvlot"\)/);
  assert.match(lot, /data-lot-back/);
  assert.doesNotMatch(lot, /Premium/);
});
