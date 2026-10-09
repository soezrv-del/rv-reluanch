import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SECTION_ROW,
  BACK_EDGE_PX,
  isSectionId,
  nearestSection,
  planHomeReveal,
  planHomeSwipeDown,
  planSectionAxis,
  planSectionSettle,
  sectionIndex,
  sectionKeyTarget,
  sectionStep,
  startsAtBackEdge,
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

test("light Home only opens the row from the top, and not after a scroll", () => {
  const down = { dx: 0, dy: 120 };
  assert.equal(planHomeReveal({ ...down, startScrollTop: 0, scrolled: false }), "open");
  // iOS rubber-band at the top reads as a negative scrollTop; still the top.
  assert.equal(planHomeReveal({ ...down, startScrollTop: -12, scrolled: false }), "open");
  // Scrolled down, then dragging down to scroll back up: never a reveal.
  assert.equal(planHomeReveal({ ...down, startScrollTop: 240, scrolled: false }), "ignore");
  assert.equal(planHomeReveal({ ...down, startScrollTop: 240, scrolled: true }), "ignore");
  // Started at the top but the page scrolled during the gesture.
  assert.equal(planHomeReveal({ ...down, startScrollTop: 0, scrolled: true }), "ignore");
  // Same distance and angle rules as before.
  assert.equal(planHomeReveal({ dx: 0, dy: 40, startScrollTop: 0, scrolled: false }), "ignore");
  assert.equal(planHomeReveal({ dx: 120, dy: 80, startScrollTop: 0, scrolled: false }), "ignore");
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

test("a released drag always settles on a page", () => {
  // Flick moves one page; a short drag snaps back; vertical keeps the page.
  assert.equal(planSectionSettle("h", -60, 2, 6), 3);
  assert.equal(planSectionSettle("h", -20, 2, 6), 2);
  assert.equal(planSectionSettle("h", 60, 0, 6), 0);
  assert.equal(planSectionSettle("v", -200, 2, 6), 2);
  assert.equal(planSectionSettle(null, -200, 2, 6), 2);
  // A cancelled drag rests on the nearest page, clamped to the row.
  assert.equal(nearestSection(0, 390, 6), 0);
  assert.equal(nearestSection(390 * 2 + 150, 390, 6), 2);
  assert.equal(nearestSection(390 * 2 + 250, 390, 6), 3);
  assert.equal(nearestSection(390 * 9, 390, 6), 5);
  assert.equal(nearestSection(-40, 390, 6), 0);
  assert.equal(nearestSection(500, 0, 6), 0);
});

test("drags from the left edge are left to the iOS back swipe", () => {
  assert.equal(BACK_EDGE_PX, 20);
  assert.equal(startsAtBackEdge(0), true);
  assert.equal(startsAtBackEdge(19), true);
  assert.equal(startsAtBackEdge(20), false);
  assert.equal(startsAtBackEdge(200), false);
});

test("the row captures the pointer and settles on up, cancel, and lost capture", () => {
  const deck = read("../../components/shell/SectionDeck.tsx");
  assert.match(deck, /setPointerCapture\(/);
  assert.match(deck, /releasePointerCapture\(/);
  assert.match(deck, /"lostpointercapture"/);
  assert.match(deck, /"pointercancel"/);
  assert.match(deck, /startsAtBackEdge\(event\.clientX\)/);
  assert.match(deck, /planSectionSettle\(/);
});

test("section dots: arrow keys, Home, and End; 24px+ tap targets", () => {
  assert.equal(sectionKeyTarget("ArrowRight", 2, 6), 3);
  assert.equal(sectionKeyTarget("ArrowRight", 5, 6), 5);
  assert.equal(sectionKeyTarget("ArrowLeft", 2, 6), 1);
  assert.equal(sectionKeyTarget("ArrowLeft", 0, 6), 0);
  assert.equal(sectionKeyTarget("Home", 4, 6), 0);
  assert.equal(sectionKeyTarget("End", 1, 6), 5);
  assert.equal(sectionKeyTarget("Enter", 1, 6), null);
  const deck = read("../../components/shell/SectionDeck.tsx");
  assert.match(deck, /onKeyDown=/);
  assert.match(deck, /tabIndex=\{page\.id === current\?\.id \? 0 : -1\}/);
  const css = read("../../components/shell/section-deck.css");
  const dot = css.match(/\n\.section-dot \{([^}]*)\}/)?.[1] ?? "";
  const size = Number(dot.match(/width: (\d+)px/)?.[1]);
  const pad = Number(dot.match(/padding: (\d+)px/)?.[1]);
  assert.equal(size, 7);
  assert.ok(size + 2 * pad >= 24, `dot hit target ${size + 2 * pad}px`);
  assert.match(dot, /background-clip: content-box/);
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
  assert.match(home, /planHomeReveal\(/);
  assert.match(home, /scrollTop/);
  assert.match(deck, /planSectionAxis/);
  assert.match(deck, /prefers-reduced-motion/);
  assert.match(deck, /data-section-home/);
  assert.match(deck, /data-section-dot/);
  assert.match(bar, /pageScope: true, startAssistant: true/);
  // One header on Home in either theme: Home's own bar keeps the theme button.
  const css = read("../../styles.css");
  assert.match(css, /(^|\n)\[data-home-open\] \.showroom-header \{\s*display: none !important;/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \[data-home-open\] \.showroom-header/);
  assert.match(home, /className="home-glass-bar"[\s\S]*?data-tool-rail="theme"/);
  assert.match(shell, /<SuiteBrand\s+onHome=\{\(\) => \{[\s\S]*?setHomeOpen\(true\)/);
});
