import assert from "node:assert/strict";
import test from "node:test";
import { extractFloorplanToken, parseCoachFromText } from "./parseCoach.ts";

test("year plus brand is not a floorplan", () => {
  assert.equal(extractFloorplanToken("2016 Thor Ventana LE"), "");
  assert.equal(extractFloorplanToken("2012 Tiffin Phaeton"), "");
  const parsed = parseCoachFromText("2016 Thor Ventana LE, 4044");
  assert.equal(parsed.year, "2016");
  assert.equal(parsed.make, "Newmar");
  assert.match(parsed.model, /ventana le/i);
  assert.equal(parsed.floorplan, "4044");
});

test("existing compact codes still lock", () => {
  assert.equal(extractFloorplanToken("2022 Dutch Star 4369"), "4369");
  assert.equal(extractFloorplanToken("2550DS LE"), "2550DSLE");
  assert.equal(extractFloorplanToken("2012 Tiffin Phaeton 40IH"), "40IH");
  assert.equal(
    extractFloorplanToken("2021 American Coach American Dream 42Q"),
    "42Q",
  );
});
