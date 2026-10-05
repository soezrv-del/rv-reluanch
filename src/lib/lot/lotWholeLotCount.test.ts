/**
 * Oct 4 live test: "How many coaches do we have on the lot right now?" came
 * back "None. Did you mean Winds?" / "Did you mean Destiny?". The whole-lot
 * count (1,424 on the Oct 4 sheet) must never be zero, spare words around the
 * question are not a model filter, and "coaches" is RVs, never Coachmen.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "../rvgrok/lotMemory.ts";
import { lotQueryIsWholeLotAsk, searchLot } from "./lotQuery.ts";

const snapshot = snapshotFromJson(
  JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
);
const units = snapshot.units;
const TOTAL = units.length;

const WHOLE_LOT = [
  "How many coaches do we have on the lot right now?",
  "What's a good question... how many coaches we have on the lot right now",
  "Testing, how many coaches do we have on the lot right now?",
  "Okay so how many coaches are sitting on the lot right now",
  "Let me ask you, how many coaches do we have on the lot right now",
  "So how many coaches do we have on the lot right now",
  "Well, how many coaches do we have on the lot",
  "Alright, how many coaches do we have in inventory",
  "What kinds of coaches do we have on the lot right now, how many",
  "I'm curious, how many RVs are in stock",
  "how many units do we have total",
  "Hey, how many coaches do we have on the lot right now? Let's see.",
];

test("the Oct 4 sheet is the full lot", () => {
  assert.ok(TOTAL > 1000, `expected the full own-lot sheet, got ${TOTAL}`);
});

test("whole-lot phrasings count the whole lot in Live Voice (query_lot)", () => {
  for (const said of WHOLE_LOT) {
    for (const args of [{ query: said }, {}, { query: "coaches on the lot" }]) {
      const answer = answerQueryLotFromSnapshot(snapshot, { ...args }, null, said);
      assert.equal(answer.matched, TOTAL, `${said} ${JSON.stringify(args)} -> ${answer.speech}`);
      assert.ok(!answer.none, `${said} said none: ${answer.speech}`);
      assert.ok(!/\bNone\b/.test(answer.speech), `${said} spoke None: ${answer.speech}`);
      assert.ok(!answer.did_you_mean, `${said} offered ${answer.did_you_mean}`);
      assert.equal(answer.filter_label, "all units", `${said} label ${answer.filter_label}`);
    }
  }
});

test("whole-lot phrasings ignore a stale coach in lot memory", () => {
  const prior = { filter: { make: "Winnebago", model: "View" }, limit: 12 };
  const lastLine = "We have one 2022 Winnebago View 24D, $129,995, in Laughlin. Want more details?";
  for (const said of WHOLE_LOT) {
    const answer = answerQueryLotFromSnapshot(snapshot, { query: said }, prior, said, lastLine);
    assert.equal(answer.matched, TOTAL, `${said} -> ${answer.speech}`);
  }
});

test("whole-lot phrasings count the whole lot in typed chat (searchLot)", () => {
  for (const said of WHOLE_LOT) {
    const found = searchLot(units, { query: said, utterance: said });
    assert.equal(found.matched, TOTAL, `${said} -> ${found.summary}`);
    assert.ok(!found.did_you_mean, `${said} offered ${found.did_you_mean}`);
    assert.ok(lotQueryIsWholeLotAsk(said, units), `${said} is a whole-lot ask`);
  }
});

test("coaches is never a model or make filter", () => {
  const said = "How many coaches do we have on the lot right now?";
  for (const args of [
    { query: said, make: "Coachmen" },
    { query: said, model: "coaches" },
    { query: said, model: "Coach" },
    { query: "coaches" },
    { query: "all coaches" },
  ]) {
    assert.equal(searchLot(units, args).matched, TOTAL, `searchLot ${JSON.stringify(args)}`);
    const answer = answerQueryLotFromSnapshot(snapshot, { ...args }, null, said);
    assert.equal(answer.matched, TOTAL, `query_lot ${JSON.stringify(args)} -> ${answer.speech}`);
  }
  // Coachmen said out loud is still the Coachmen make.
  const coachmen = searchLot(units, { make: "Coachmen" }).matched;
  assert.ok(coachmen > 0 && coachmen < 100, `Coachmen make ${coachmen}`);
  assert.equal(searchLot(units, { query: "how many Coachmen do we have" }).matched, coachmen);
});

test("spare words never zero out an otherwise unfiltered or class-only query", () => {
  const used = searchLot(units, { query: "used" }).matched;
  const classC = searchLot(units, { query: "class c" }).matched;
  assert.ok(used > 0 && classC > 0, "used and Class C are on the sheet");
  for (const spare of ["okay", "so", "testing", "sitting", "let's see", "actually", "really", "quick question"]) {
    assert.equal(searchLot(units, { query: `${spare} used ones` }).matched, used, `${spare} used`);
    assert.equal(searchLot(units, { query: `${spare} class c` }).matched, classC, `${spare} class c`);
    const all = searchLot(units, { query: `${spare} how many coaches are on the lot` });
    assert.equal(all.matched, TOTAL, `${spare} whole lot -> ${all.summary}`);
  }
});

test("a real coach name in a count question still filters", () => {
  const navion = searchLot(units, { query: "how many Navions do we have on the lot" });
  assert.ok(navion.matched > 0 && navion.matched < 10, `Navion count ${navion.matched}`);
  assert.ok(!lotQueryIsWholeLotAsk("how many Navions do we have on the lot", units), "Navion is a name");
  const typo = searchLot(units, { query: "how many Navoins do we have on the lot" });
  assert.equal(typo.matched, navion.matched, "one-letter typo still finds the Navion");
  const classA = searchLot(units, { query: "how many class A coaches do we have" });
  assert.ok(classA.matched > 0 && classA.matched < TOTAL, `class A ${classA.matched}`);
  const cheap = searchLot(units, { query: "how many coaches under 50k" });
  assert.ok(cheap.matched > 0 && cheap.matched < TOTAL, `under 50k ${cheap.matched}`);
  assert.equal(searchLot(units, { query: "new Qwertyplugh" }).matched, 0, "a made-up model is still none");
});
