import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SECTION_ROW,
  isSectionId,
  planHomeSwipeDown,
  planSectionAxis,
  sectionIndex,
  sectionStep,
} from "./sectionRow.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

test("the section row is one line: Facts, Inventory, Chat, Cal, Tow, More", () => {
  assert.deepEqual(
    SECTION_ROW.map((page) => page.label),
    ["Facts", "Inventory", "Chat", "Cal", "Tow", "More"],
  );
  assert.equal(sectionIndex("rvcal"), 3);
  assert.equal(sectionIndex("rvtrips"), -1);
  assert.equal(isSectionId("more"), true);
  assert.equal(isSectionId("rvtrips"), false);
});

test("swipe down on Home opens the row; a sideways drag does not", () => {
  assert.equal(planHomeSwipeDown(0, 90), "open");
  assert.equal(planHomeSwipeDown(10, 80), "open");
  assert.equal(planHomeSwipeDown(0, 40), "ignore");
  assert.equal(planHomeSwipeDown(120, 80), "ignore");
  assert.equal(planHomeSwipeDown(0, -90), "ignore");
});

test("a vertical drag inside a section page is not a page change", () => {
  assert.equal(planSectionAxis(4, 4), null);
  assert.equal(planSectionAxis(8, 40), "v");
  assert.equal(planSectionAxis(40, 10), "h");
  assert.equal(planSectionAxis(20, 18), "v");
  assert.equal(sectionStep(-60, 0, 6), 1);
  assert.equal(sectionStep(60, 0, 6), 0);
  assert.equal(sectionStep(60, 2, 6), -1);
  assert.equal(sectionStep(-60, 5, 6), 0);
});

test("Home is the entrance and the bottom tab bar is not mounted", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const bar = read("../../components/shell/RoomAskBar.tsx");
  const home = read("../../components/shell/HomeScreen.tsx");
  const deck = read("../../components/shell/SectionDeck.tsx");
  assert.match(deck, /data-section-row/);
  assert.match(shell, /SECTION_ROW\.map/);
  assert.doesNotMatch(shell, /<BottomTabs/);
  assert.doesNotMatch(shell, /data-bottom-dock/);
  assert.doesNotMatch(bar, /<BottomTabs/);
  assert.doesNotMatch(bar, /<MoreSheet/);
  assert.doesNotMatch(home, /dark-home-nav/);
  assert.match(home, /data-open-sections/);
  assert.match(home, /planHomeSwipeDown/);
  assert.match(deck, /planSectionAxis/);
  assert.match(deck, /prefers-reduced-motion/);
  assert.match(deck, /data-section-home/);
  assert.match(deck, /data-section-dot/);
  assert.match(bar, /pageScope: true, startAssistant: true/);
  assert.match(shell, /<SuiteBrand\s+onHome=\{\(\) => \{[\s\S]*?setHomeOpen\(true\)/);
});
