import assert from "node:assert/strict";
import test from "node:test";
import {
  collapseSpokenFloorplanDigits,
  extractFloorplanToken,
  isYearBrandFloorplanToken,
  parseCoachFromText,
} from "./parseCoach.ts";

test("spoken 4 0 4 4 collapses; year+brand is not a floorplan", () => {
  assert.equal(collapseSpokenFloorplanDigits("um, 4 0 4 4"), "um, 4044");
  assert.equal(collapseSpokenFloorplanDigits("40 44"), "4044");
  assert.equal(extractFloorplanToken("2016 Thor Ventana LE"), "");
  assert.equal(extractFloorplanToken("2012 Tiffin Phaeton"), "");
  assert.equal(isYearBrandFloorplanToken("2016Thor"), true);
  assert.equal(isYearBrandFloorplanToken("2012Tiffin"), true);
  assert.equal(
    extractFloorplanToken("2016 Thor Ventana LE, um, 4 0 4 4"),
    "4044",
  );
  const parsed = parseCoachFromText("2016 Thor Ventana LE, um, 4 0 4 4");
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
