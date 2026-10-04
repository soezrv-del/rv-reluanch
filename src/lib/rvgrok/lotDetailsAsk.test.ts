import test from "node:test";
import assert from "node:assert/strict";
import { lotLineWithDetailsAsk } from "./voiceTurnGate";

test("spoken lot line asks if they want more details", () => {
  assert.equal(
    lotLineWithDetailsAsk("Matching units: 2 Winnebago View, all used. Top: 2012 Winnebago View Profile,"),
    "Matching units: 2 Winnebago View, all used. Top: 2012 Winnebago View Profile. Want more details?",
  );
  assert.equal(lotLineWithDetailsAsk("Matching units: 45."), "Matching units: 45. Want more details?");
});

test("a miss or a line already asking stays as is", () => {
  assert.equal(lotLineWithDetailsAsk("None."), "None.");
  assert.equal(lotLineWithDetailsAsk("Want the list?"), "Want the list?");
  assert.equal(lotLineWithDetailsAsk(""), "");
});
