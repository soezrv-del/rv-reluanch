import assert from "node:assert/strict";
import test from "node:test";
import {
  formatOwnLotBlock,
  parseOwnLotAsk,
  snapshotFromJson,
  type OwnLotSnapshot,
} from "./ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "./lotMemory.ts";
import {
  looksLikeLotQuestion,
  looksLikeOwnLotFollowUp,
  looksLikeOwnLotStockQuestion,
} from "./ownLotAsk.ts";

function fixture(): OwnLotSnapshot {
  return snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [
      {
        year: 2026,
        make: "Entegra Coach",
        model: "Odyssey",
        trim: "29V",
        stock_number: "46573",
        price: 201281,
        location: "Mt. Vernon WA",
        lot_status: "Sale Pending",
        body_type: "Class C",
      },
      {
        year: 2027,
        make: "Entegra Coach",
        model: "Odyssey SE",
        trim: "22C",
        stock_number: "47664",
        price: 137611,
        location: "Carson RV Show",
        lot_status: "Available",
        body_type: "Class C",
      },
      {
        year: 2026,
        make: "Entegra Coach",
        model: "Cornerstone",
        trim: "45D",
        stock_number: "45282",
        price: 729995,
        location: "Fresno CA",
        lot_status: "Available",
        body_type: "Class A Diesel",
      },
      {
        year: 2026,
        make: "Entegra Coach",
        model: "Odyssey",
        trim: "24B",
        stock_number: "47597",
        price: 204355,
        location: "Mt. Vernon WA",
        lot_status: "Sale Pending",
        body_type: "Class C",
      },
    ],
  });
}

function stocksFor(args: Record<string, unknown>): string[] {
  const answer = answerQueryLotFromSnapshot(fixture(), args, null);
  return answer.units.map((unit) => unit.stock_number);
}

test("bare model and floorplan tokens match the 2026 Odyssey 29V without the make", () => {
  for (const model of ["Odyssey 29V", "29V", "odyssey 29 v", "29-V", "29 V"]) {
    const answer = answerQueryLotFromSnapshot(fixture(), { model }, null);
    assert.equal(answer.none, false, model);
    assert.deepEqual(
      answer.units.map((unit) => unit.stock_number),
      ["46573"],
      model,
    );
    assert.equal(answer.units[0]?.price, 201281);
    assert.match(answer.units[0]?.location || "", /Mt\. Vernon/);
    assert.match(answer.speech, /stk 46573/);
    assert.doesNotMatch(answer.speech, /stk 47664/);
    assert.doesNotMatch(answer.speech, /stk 45282/);
    assert.doesNotMatch(answer.speech, /stk 47597/);
    assert.doesNotMatch(answer.speech, /SCRAPE ROW WINS/);
  }
});

test("make and model fields still match when the tool splits Odyssey and 29V", () => {
  assert.deepEqual(stocksFor({ make: "Odyssey", model: "29V" }), ["46573"]);
  assert.deepEqual(stocksFor({ make: "Odyssey 29V" }), ["46573"]);
  assert.deepEqual(stocksFor({ model: "Cornerstone 45D" }), ["45282"]);
  assert.deepEqual(stocksFor({ model: "45D" }), ["45282"]);
});

test("Odyssey 29V does not swallow Odyssey SE, and a real miss is plain none", () => {
  const se = answerQueryLotFromSnapshot(fixture(), { model: "Odyssey SE" }, null);
  assert.equal(se.none, false);
  assert.ok(se.units.some((unit) => unit.stock_number === "47664"));
  assert.ok(!se.units.some((unit) => unit.stock_number === "46573"));

  for (const model of ["Allegro Bus", "1999 Winnebago View"]) {
    const miss = answerQueryLotFromSnapshot(fixture(), { model }, null);
    assert.equal(miss.none, true, model);
    assert.equal(miss.matched, 0, model);
    assert.equal(miss.units.length, 0, model);
    assert.match(miss.speech, /None\. No own-lot hit/);
    assert.doesNotMatch(miss.speech, /stk /);
  }
});

test("spoken do-we-have Odyssey 29V lists the scrape row", () => {
  const snap = fixture();
  const filter = parseOwnLotAsk("do we have an Odyssey 29V", [], snap.units);
  const block = formatOwnLotBlock(snap, "do we have an Odyssey 29V");
  assert.match(filter.model || filter.trim || "", /odyssey|29v/i);
  assert.match(block, /Matched: 1/);
  assert.match(block, /stk 46573/);
  assert.match(block, /\$201,281|201281/);
  assert.match(block, /Mt\. Vernon/);
  assert.doesNotMatch(block, /stk 47664/);
  assert.doesNotMatch(block, /SCRAPE ROW WINS/);
});

test("lot mode is the inventory phrase list, plus a follow-up on an active filter", () => {
  assert.equal(looksLikeOwnLotStockQuestion("do we have an Odyssey 29V"), true);
  assert.equal(looksLikeOwnLotStockQuestion("tell me about the Odyssey 29V"), false);
  assert.equal(
    looksLikeOwnLotStockQuestion("Are you sure we don't have a Odyssey 29V?"),
    false,
  );
  assert.equal(looksLikeOwnLotStockQuestion("cheapest 10 Class C on the lot"), true);
  assert.equal(looksLikeOwnLotStockQuestion("top 10 cheapest"), false);
  assert.equal(looksLikeOwnLotFollowUp("now the shortest"), true);
  assert.equal(looksLikeLotQuestion("now the shortest", null), false);
  assert.equal(
    looksLikeLotQuestion("now the shortest", { filter: { bodyType: "Class C" } }),
    true,
  );
  assert.equal(
    looksLikeLotQuestion("tell me about the Odyssey 29V", {
      filter: { bodyType: "Class C" },
    }),
    false,
  );
});
