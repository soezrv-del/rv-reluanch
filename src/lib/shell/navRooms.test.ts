import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dockActiveTab } from "../../components/shell/dockActiveTab.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

test("dockActiveTab: Home lights Facts (like dark Home's row); tools under More light More", () => {
  assert.equal(dockActiveTab("rvgrok", true), "rvfax");
  assert.equal(dockActiveTab("rvfax", true), "rvfax");
  assert.equal(dockActiveTab("rvlot", false), "rvlot");
  assert.equal(dockActiveTab("rvgrok", false), "rvgrok");
  assert.equal(dockActiveTab("more", false), "more");
  assert.equal(dockActiveTab("rvtow", false), "more");
  assert.equal(dockActiveTab("rvfax", false, true), "more");
  assert.equal(dockActiveTab("rvgrok", true, true), "more");
});

test("dock is the original Facts Inventory Chat More; no Home or Ask tab; no DockTab export", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const home = read("../../components/shell/HomeScreen.tsx");
  assert.match(
    tabs,
    /short: "Facts"[\s\S]*short: "Inventory"[\s\S]*short: "Chat"[\s\S]*short: "More"/,
  );
  assert.doesNotMatch(tabs, /short: "Home"|short: "Ask"/);
  // Same icons as dark Home's row.
  for (const icon of ["tab-facts", "tab-inventory", "tab-chat", "tab-more"]) {
    assert.match(tabs, new RegExp(`/assets/showroom/${icon}\\.png`));
    assert.match(home, new RegExp(`/assets/showroom/${icon}\\.png`));
  }
  assert.doesNotMatch(tabs, /^export type DockTab\b/m);
  assert.doesNotMatch(tabs, /import type \{[^}]*\bDockTab\b/);
  assert.doesNotMatch(tabs, /import \{[^}]*\bDockTab\b/);
  assert.doesNotMatch(shell, /\bDockTab\b/);
  assert.match(tabs, /export type DockRoomId/);
  assert.match(tabs, /export const DOCK_ROOM_IDS/);
});

test("Ask RV Grok on both Homes opens the Grok room; logo goes Home", () => {
  const home = read("../../components/shell/HomeScreen.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const brand = read("../../components/shell/SuiteBrand.tsx");
  assert.match(home, /className="dark-home-ask"[\s\S]*?onOpen\("rvgrok"\)[\s\S]*?Ask RV Grok/);
  assert.match(home, /className="light-home-ask"[\s\S]*?onOpen\("rvgrok"\)[\s\S]*?Ask RV Grok/);
  assert.match(brand, /className="showroom-brand"/);
  assert.match(brand, /onClick=\{onHome\}/);
  assert.match(shell, /<SuiteBrand\s+onHome=\{\(\) => \{[\s\S]*?setHomeOpen\(true\)/);
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
