/**
 * A lot miss is never a terminal bare "None." She re-searches once without the
 * spoken words, then says one friendly line (same question, same line, once)
 * and offers the closest real units or says honestly she can't find one.
 * Counts still come only from the sheet: matched stays 0 on a real miss.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "./ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "./lotMemory.ts";
import {
  LOT_MISS_EMPTY_LINE,
  LOT_MISS_LINES,
  lotMissLine,
  lotSummaryForSpeech,
  startsWithLotMissLine,
} from "./voiceTurnGate.ts";

const snapshot = snapshotFromJson(
  JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
);

function ask(said: string, args: Record<string, unknown> = { query: said }) {
  const answer = answerQueryLotFromSnapshot(snapshot, { ...args }, null, said);
  return { answer, spoken: lotSummaryForSpeech(answer.speech, answer.matched) };
}

function missLineCount(text: string): number {
  return LOT_MISS_LINES.reduce((n, line) => n + text.split(line).length - 1, 0);
}

test("miss lines are casual, few, and picked from the question", () => {
  assert.ok(LOT_MISS_LINES.length >= 2 && LOT_MISS_LINES.length <= 3, "2-3 lines");
  assert.ok(LOT_MISS_LINES.includes("Hang on bud, it's not in our sheet, so I'm looking a little harder."));
  const q = "do we have a Qwertyplugh";
  assert.equal(lotMissLine(q), lotMissLine(q), "deterministic");
  assert.equal(lotMissLine("Do we have a QWERTYPLUGH?"), lotMissLine(q), "case and punctuation do not change it");
  const picked = new Set(["a", "b", "c", "do we have a Zorbatron", q, "any Blorp", "Class A Frobnitz"].map(lotMissLine));
  assert.ok(picked.size >= 2, "different questions can get different lines");
});

test("a made-up model is an honest can't-find, never a bare None", () => {
  for (const said of ["do we have a Qwertyplugh", "new Qwertyplugh", "any Zorbatron on the lot"]) {
    const { answer, spoken } = ask(said);
    assert.equal(answer.matched, 0, said);
    assert.equal(answer.none, true, said);
    assert.deepEqual(answer.units, [], said);
    assert.ok(startsWithLotMissLine(spoken), `${said}: ${spoken}`);
    assert.equal(missLineCount(spoken), 1, `one friendly line: ${spoken}`);
    assert.match(spoken, /can't find/, said);
    assert.doesNotMatch(spoken, /^None\b/, said);
    assert.doesNotMatch(spoken, /stk /, said);
  }
  // The model's own model arg for that miss is the same.
  const { spoken } = ask("do we have a Zorbatron", { model: "Zorbatron" });
  assert.ok(startsWithLotMissLine(spoken), spoken);
});

test("a named make with a model that is not on the sheet offers the closest real units", () => {
  const { answer, spoken } = ask("do we have a Winnebago Zorbatron");
  assert.equal(answer.matched, 0, "the count stays the sheet count");
  assert.ok(startsWithLotMissLine(spoken), spoken);
  assert.match(spoken, /Closest on our lot: /);
  assert.ok(answer.closest_units && answer.closest_units.length > 0 && answer.closest_units.length <= 3, "1-3 closest");
  for (const line of answer.closest_units!) assert.match(line, /Winnebago/, line);
  assert.equal(missLineCount(spoken), 1, spoken);
});

test("filters he named with no match say so honestly", () => {
  const { answer, spoken } = ask("Class A under 5000 dollars");
  assert.equal(answer.matched, 0);
  assert.ok(startsWithLotMissLine(spoken), spoken);
  assert.match(spoken, /can't find one on our sheet with those filters/);
  assert.doesNotMatch(spoken, /Did you mean/, "dollars is not a coach name");
});

test("a one-letter-off name still offers that name, with the friendly line", () => {
  const { answer, spoken } = ask("1999 Winnebago Vew");
  if (answer.matched === 0 && answer.did_you_mean) {
    assert.ok(startsWithLotMissLine(spoken), spoken);
    assert.match(spoken, /Did you mean/);
  } else {
    assert.doesNotMatch(spoken, /^None\b/, spoken);
  }
});

test("spare words that zeroed a search give way to the re-search", () => {
  for (const said of ["okay used ones", "testing class c", "so how many coaches are sitting on the lot"]) {
    const { answer, spoken } = ask(said);
    assert.ok(answer.matched > 0, `${said} -> ${spoken}`);
    assert.ok(!startsWithLotMissLine(spoken), `${said} is a hit: ${spoken}`);
  }
});

test("the speech gate never returns a bare None", () => {
  assert.equal(lotSummaryForSpeech("", 0), LOT_MISS_EMPTY_LINE);
  assert.equal(lotSummaryForSpeech("None.", 0), LOT_MISS_EMPTY_LINE);
  const line = `${LOT_MISS_LINES[0]} I can't find that one on our sheet.`;
  assert.equal(lotSummaryForSpeech(line, 0), line, "a miss line is not prefixed with None");
});
