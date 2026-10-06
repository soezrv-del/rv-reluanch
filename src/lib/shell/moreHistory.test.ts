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

test("Android back closes the sheet, then returns to the tab a tool came from", () => {
  // Facts → sheet → Tow: the Tow entry replaced the sheet entry.
  const towEntry = makeNavMarker("tool", tow, 1);
  assert.deepEqual(readNavMarker(towEntry), towEntry);
  // Back from Tow lands on the base entry (state null) → Facts.
  assert.deepEqual(popTarget(null, 1, facts), { view: facts, depth: 0 });
  // Sheet opened over Tow, back lands on the Tow entry → stay on Tow, sheet shut.
  assert.deepEqual(popTarget(towEntry, 2, facts), { view: tow, depth: 1 });
  // Sheet over Home remembers Home.
  const home = { tab: "rvgrok", home: true };
  assert.deepEqual(popTarget(makeNavMarker("sheet", home, 1), 2, facts)?.view, home);
  // Foreign markers (Sold prompt, whitelist sheet) at depth 0 are not ours.
  assert.equal(popTarget({ soldPrompt: 1 }, 0, facts), null);
  assert.equal(popTarget(null, 0, facts), null);
});

test("shell wires the four-room dock, sheet history, and no swipe", () => {
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
  assert.match(ask, /<MoreSheet/);
});
