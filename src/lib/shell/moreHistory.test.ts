import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  makeNavMarker,
  planTabHistory,
  popTarget,
  readNavMarker,
} from "./moreHistory.ts";

const root = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const facts = { tab: "rvfax", home: false };
const tow = { tab: "rvtow", home: false };
const cal = { tab: "rvcal", home: false };

test("opening a tool pushes; a sheet pick replaces the sheet entry", () => {
  assert.equal(
    planTabHistory({ prev: facts, next: tow, nextUnderMore: true, depth: 0, pickedFromSheet: false }),
    "push",
  );
  assert.equal(
    planTabHistory({ prev: facts, next: tow, nextUnderMore: true, depth: 1, pickedFromSheet: true }),
    "replace",
  );
  assert.equal(
    planTabHistory({ prev: tow, next: cal, nextUnderMore: true, depth: 1, pickedFromSheet: false }),
    "push",
  );
});

test("main tabs never push and unwind what tools pushed", () => {
  const lot = { tab: "rvlot", home: false };
  assert.equal(
    planTabHistory({ prev: facts, next: lot, nextUnderMore: false, depth: 0, pickedFromSheet: false }),
    "none",
  );
  assert.equal(
    planTabHistory({ prev: tow, next: lot, nextUnderMore: false, depth: 2, pickedFromSheet: false }),
    "unwind",
  );
  assert.equal(
    planTabHistory({ prev: tow, next: { tab: "rvgrok", home: true }, nextUnderMore: false, depth: 1, pickedFromSheet: false }),
    "unwind",
  );
  assert.equal(
    planTabHistory({ prev: tow, next: tow, nextUnderMore: true, depth: 1, pickedFromSheet: false }),
    "none",
  );
});

const home = { tab: "rvgrok", home: true };
const lot = { tab: "rvlot", home: false };
const more = { tab: "more", home: false };

test("leaving Home pushes one entry so Back returns Home", () => {
  assert.equal(
    planTabHistory({ prev: home, next: facts, nextUnderMore: false, depth: 0, pickedFromSheet: false }),
    "push",
  );
  // The Ask pill and Open coach leave Home the same way.
  assert.equal(
    planTabHistory({ prev: { tab: "rvfax", home: true }, next: lot, nextUnderMore: false, depth: 0, pickedFromSheet: false }),
    "push",
  );
  // Back from that entry lands on the base, which is Home: one press.
  assert.deepEqual(popTarget(null, 1, home), { view: home, depth: 0 });
});

test("section-row swipes never push, including onto Cal, Tow, and More", () => {
  for (const next of [cal, tow, more, lot, facts]) {
    const prev = next === facts ? lot : facts;
    // Entered from Home: replace the entry, so Back still goes Home.
    assert.equal(
      planTabHistory({ prev, next, base: home, nextUnderMore: true, depth: 1, pickedFromSheet: false, viaRow: true }),
      "replace",
      `row → ${next.tab}`,
    );
    // No entry of ours (app opened on a page): nothing to push.
    assert.equal(
      planTabHistory({ prev, next, nextUnderMore: true, depth: 0, pickedFromSheet: false, viaRow: true }),
      "none",
      `row → ${next.tab} at depth 0`,
    );
  }
  // Facts → Tow by handoff pushed over Facts; swiping back to Facts unwinds it.
  assert.equal(
    planTabHistory({ prev: tow, next: facts, base: facts, nextUnderMore: false, depth: 1, pickedFromSheet: false, viaRow: true }),
    "unwind",
  );
});

test("swipe Home → Facts → Cal → Tow, then one Back is Home", () => {
  // Simulate the shell: entries above the base, the base view, and the screen.
  let depth = 0;
  let base = home;
  let view = home;
  let top: ReturnType<typeof makeNavMarker> | null = null;
  const go = (next: typeof facts, viaRow: boolean, nextUnderMore: boolean) => {
    const step = planTabHistory({ prev: view, next, base, nextUnderMore, depth, pickedFromSheet: false, viaRow });
    if (step === "push") {
      if (depth === 0) base = view;
      depth += 1;
      top = makeNavMarker("tool", next, depth);
    } else if (step === "replace") {
      top = makeNavMarker("tool", next, depth);
    } else if (step === "unwind") {
      depth = 0;
      top = null;
    }
    view = next;
    return step;
  };
  assert.equal(go(facts, false, false), "push"); // revealed from Home
  assert.equal(go(cal, true, true), "replace");
  assert.equal(go(tow, true, true), "replace");
  assert.equal(depth, 1);
  assert.deepEqual(readNavMarker(top), makeNavMarker("tool", tow, 1));
  // Back pops our single entry and lands on the base: Home.
  const hit = popTarget(null, depth, base);
  assert.deepEqual(hit, { view: home, depth: 0 });
});

test("a handoff to a main tab keeps the way back to Home", () => {
  // Home → Facts (d1), Facts → Tow by handoff (d2), Tow → Facts by handoff.
  assert.equal(
    planTabHistory({ prev: tow, next: lot, base: home, nextUnderMore: false, depth: 2, pickedFromSheet: false }),
    "unwind-replace",
  );
  assert.equal(
    planTabHistory({ prev: facts, next: lot, base: home, nextUnderMore: false, depth: 1, pickedFromSheet: false }),
    "replace",
  );
  // Back at the view under our entries: unwind, never a no-op entry.
  assert.equal(
    planTabHistory({ prev: tow, next: facts, base: facts, nextUnderMore: false, depth: 1, pickedFromSheet: false }),
    "unwind",
  );
});

test("the shell snapshots the view Back returns to before it moves", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  // pushNav takes the previous view; the history effect passes it.
  assert.match(shell, /navBase\.current = from \?\? navView\.current/);
  assert.match(shell, /pushNav\("tool", next, prev\)/);
  assert.match(shell, /rowMove\.current = true;\s*onTabChange\(id\)/);
  assert.match(shell, /viaRow,/);
});

test("Android back closes the sheet, then returns to the tab a tool came from", () => {
  // Facts → sheet → Tow: the Tow entry replaced the sheet entry.
  const towEntry = makeNavMarker("tool", tow, 1);
  assert.deepEqual(readNavMarker(towEntry), towEntry);
  // Back from Tow lands on the base entry (state null) → Facts.
  assert.deepEqual(popTarget(null, 1, facts), { view: facts, depth: 0 });
  // Sheet opened over Tow, back lands on the Tow entry → stay on Tow, sheet shut.
  assert.deepEqual(popTarget(towEntry, 2, facts), { view: tow, depth: 1 });
  // Sheet over Home remembers Home.
  assert.deepEqual(popTarget(makeNavMarker("sheet", home, 1), 2, facts)?.view, home);
  // Foreign markers (Sold prompt, whitelist sheet) at depth 0 are not ours.
  assert.equal(popTarget({ soldPrompt: 1 }, 0, facts), null);
  assert.equal(popTarget(null, 0, facts), null);
});

test("shell wires the Facts/Inventory/Chat/More dock, sheet history, and no swipe", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const ask = read("../../components/shell/RoomAskBar.tsx");
  assert.match(constants, /DOCK_TABS = DOCK_ROOM_IDS/);
  assert.match(constants, /SWIPE_ORDER = \[\] as const/);
  assert.match(shell, /TAB_ORDER\.map\(/);
  assert.doesNotMatch(shell, /order: SWIPE_ORDER,/);
  assert.doesNotMatch(shell, /useSwipeTabs/);
  assert.doesNotMatch(shell, /\bDockTab\b/);
  assert.match(shell, /history\.pushState\(/);
  assert.match(shell, /history\.replaceState\(/);
  assert.match(shell, /addEventListener\("popstate"/);
  assert.match(shell, /SECTION_ROW\.map/);
  assert.doesNotMatch(ask, /<MoreSheet/);
  assert.doesNotMatch(ask, /<BottomTabs/);
  // More in the dock toggles the sheet, as before #668.
  assert.match(
    shell,
    /if \(next === "more"\) \{\s*if \(moreOpenRef\.current\) closeMore\(\);\s*else openMore\(\);/,
  );
});
