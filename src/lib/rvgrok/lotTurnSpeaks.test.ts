import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { answerQueryLotFromSnapshot } from "./lotMemory.ts";
import {
  looksLikeLotCorrection,
  looksLikeOwnLotFollowUp,
  looksLikeOwnLotStockQuestion,
} from "./ownLotAsk.ts";
import {
  formatOwnLotMissLine,
  snapshotFromJson,
} from "./ownLotInventory.ts";

test("cheapest and least expensive Class A asks are own-lot asks", () => {
  for (const ask of [
    "What's the cheapest Class A we have in inventory?",
    "cheapest Class A in inventory",
    "least expensive Class A on our lot",
    "the cheapest Class A we have",
  ]) {
    assert.equal(looksLikeOwnLotStockQuestion(ask), true, ask);
  }
  assert.equal(looksLikeOwnLotStockQuestion("top 10 cheapest"), false);
});

test("a correction is a new own-lot ask, not the previous coaches", () => {
  const correction = "No, on our lot";
  assert.equal(looksLikeLotCorrection(correction), true);
  assert.equal(looksLikeOwnLotStockQuestion(correction), true);
  assert.equal(looksLikeOwnLotFollowUp(correction), false);
  assert.equal(looksLikeOwnLotStockQuestion("our inventory"), true);
});

test("a matched-zero miss is None and does not say own-lot hit", () => {
  const line = formatOwnLotMissLine();
  assert.equal(line, "None.");
  assert.doesNotMatch(line, /own-lot hit/);
});

test("query_lot tells the voice to speak only the units this tool returned", () => {
  const src = readFileSync(new URL("./realtime.ts", import.meta.url), "utf8");
  assert.match(src, /only the units this tool returned/);
  assert.match(
    src,
    /Do not add a coach, a price, or a store from web notes, a market list, or the previous turn/,
  );
  assert.match(src, /If units came back, those are the answer/);
  assert.match(src, /Say none only when matched is 0/);
  assert.match(src, /Do not mention web notes/);
});

test("a fixture cheapest Class A speaks the Mirada, not a market Bounder", () => {
  const snap = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: [
      {
        year: 2015,
        make: "Thor",
        model: "Mirada",
        trim: "34B",
        stock_number: "UCF9440A",
        price: 54995,
        location: "Fife",
        body_type: "Class A",
        lot_status: "Available",
        condition: "Used",
      },
      {
        year: 2022,
        make: "Newmar",
        model: "Ventana",
        trim: "4369",
        stock_number: "46539A",
        price: 310995,
        location: "Mesa AZ",
        body_type: "Class A",
        lot_status: "Available",
        condition: "Used",
      },
    ],
  });
  const answer = answerQueryLotFromSnapshot(
    snap,
    { query: "What's the cheapest Class A we have in inventory?" },
    null,
    "What's the cheapest Class A we have in inventory?",
  );
  assert.equal(answer.none, false);
  assert.equal(answer.units[0]?.stock_number, "UCF9440A");
  assert.equal(answer.units[0]?.price, 54995);
  assert.match(answer.units[0]?.location || "", /Fife/);
  const spoken = [
    answer.speech,
    ...answer.units.map((unit) =>
      [unit.year, unit.make, unit.model, unit.trim, unit.stock_number, unit.price, unit.location].join(" "),
    ),
  ].join("\n");
  assert.match(spoken, /UCF9440A/);
  assert.match(spoken, /Mirada/);
  assert.doesNotMatch(spoken, /Bounder/i);
  assert.doesNotMatch(spoken, /14,?995/);
  assert.doesNotMatch(spoken, /Central Auto/);
});
