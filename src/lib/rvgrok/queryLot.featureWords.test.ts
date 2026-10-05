/**
 * Oct 4, 6:30 PM PT: "Are you able to look through our inventory and see if we
 * have any Super Cs that have residential refrigerators?" got all 27 Super Cs.
 * The spare words "through" and "if" ANDed the feature words to zero, and the
 * class fallback then opened every Super C. The search reads the full page
 * text: the answer is the 6 whose listings mention a residential refrigerator,
 * spoken as "mentioned in the listing", not confirmed.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyOwnLotFulltext, fulltextIndexFromJson, snapshotFromJson } from "./ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "./lotMemory.ts";
import { searchLot } from "../lot/lotQuery.ts";
import { lotSheetConfirms } from "../lot/lotSearch.ts";
import { LOT_FEATURE_WEB_CLAUSE, QUERY_LOT_TOOL } from "./liveVoice.ts";
import { startsWithLotMissLine } from "./voiceTurnGate.ts";

function snapshotWithFulltext() {
  const snapshot = snapshotFromJson(
    JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
  );
  const index = fulltextIndexFromJson(
    JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-fulltext.json"), "utf8")),
  );
  applyOwnLotFulltext(snapshot.units, index);
  return snapshot;
}

const snapshot = snapshotWithFulltext();
const SAID =
  "Are you able to look through our inventory and see if we have any Super Cs that have residential refrigerators?";

test("the Oct 4 sheet has fulltext attached", () => {
  const withText = snapshot.units.filter((unit) => (unit as { fulltext?: string }).fulltext).length;
  assert.ok(withText > 500, `fulltext on ${withText} units`);
});

test("Super Cs with residential refrigerators: the 6, not all 27, when the model only sent the class", () => {
  const allSuperC = searchLot(snapshot.units, { query: "Super C" }).matched;
  assert.equal(allSuperC, 27, "Oct 4 sheet has 27 Super Cs");
  for (const args of [
    { class: "Super C" },
    { body_type: "Super C" },
    { query: "Super C" },
    { query: "Super Cs", body_type: "Class Super C" },
    { query: SAID },
  ]) {
    const answer = answerQueryLotFromSnapshot(snapshot, { ...args }, null, SAID);
    assert.equal(answer.matched, 6, `${JSON.stringify(args)} -> ${answer.speech}`);
    assert.match(answer.speech, /mentioned in these listings, not confirmed on the spec sheet/, answer.speech);
    assert.match(answer.speech, /Check the floorplan/, answer.speech);
    assert.ok(!answer.name_roster?.length, "no 368-coach roster for a feature ask");
    assert.deepEqual(answer.feature_words, ["residential", "refrigerator"]);
    assert.equal(answer.feature_confirmed, 0, "no spec-sheet field says residential");
  }
  const direct = searchLot(snapshot.units, { query: "Super Cs that have residential refrigerators" });
  assert.equal(direct.matched, 6);
});

test("class A with a fireplace is about 16, phrased as mentioned in the listing", () => {
  for (const [args, said] of [
    [{ query: "class A with a fireplace" }, "class A with a fireplace"],
    [{ body_type: "Class A" }, "Do we have any class A with a fireplace?"],
  ] as const) {
    const answer = answerQueryLotFromSnapshot(snapshot, { ...args }, null, said);
    assert.ok(answer.matched >= 14 && answer.matched <= 18, `${said} -> ${answer.matched}`);
    assert.match(answer.speech, /fireplace is mentioned in these listings/, answer.speech);
  }
});

test("spare search talk never ANDs a feature down to the whole class", () => {
  for (const lead of ["look through our inventory and see if", "can you check if", "search for", "testing, see if"]) {
    const found = searchLot(snapshot.units, { query: `${lead} we have any Super Cs with a residential refrigerator` });
    assert.equal(found.matched, 6, `${lead} -> ${found.summary}`);
  }
});

test("a feature on no coach in the class is a friendly miss with the closest units", () => {
  const said = "do we have any class B with a residential refrigerator";
  const answer = answerQueryLotFromSnapshot(snapshot, { body_type: "Class B" }, null, said);
  assert.equal(answer.matched, 0, answer.speech);
  assert.equal(answer.none, true);
  assert.deepEqual(answer.units, []);
  assert.ok(startsWithLotMissLine(answer.speech), answer.speech);
  assert.match(answer.speech, /None of our Class B listings mention residential refrigerator/);
  assert.match(answer.speech, /Closest on our lot: /);
  assert.deepEqual(answer.dropped_words, ["residential", "refrigerator"]);
});

test("a spec-sheet field confirms; a feature tag or page text does not", () => {
  const unit = {
    stock_number: "T1",
    make: "Test",
    model: "Coach",
    printed: { refrigerator_size: "Residential", floorplan_feature: "Fireplace | King Bed" },
    fulltext: "solar panels on the roof",
  } as never;
  assert.equal(lotSheetConfirms(unit, "residential"), true);
  assert.equal(lotSheetConfirms(unit, "fireplace"), false, "floorplan_feature is a site tag");
  assert.equal(lotSheetConfirms(unit, "solar"), false, "page text is not the spec sheet");
});

test("voice instructions keep feature words in query and read the page text first", () => {
  assert.match(LOT_FEATURE_WEB_CLAUSE, /full page text/);
  assert.match(LOT_FEATURE_WEB_CLAUSE, /residential refrigerator, fireplace, king bed, solar/);
  assert.match(LOT_FEATURE_WEB_CLAUSE, /Never say the listing does not flag a feature/);
  assert.match(LOT_FEATURE_WEB_CLAUSE, /check the floorplan/);
  const query = (QUERY_LOT_TOOL.parameters as { properties: { query: { description: string } } }).properties.query;
  assert.match(query.description, /every feature word/);
});
