import assert from "node:assert/strict";
import test from "node:test";
import { classifyCoach, GVWR_SUPER_C_SENTENCE } from "./coachType.ts";

test("an F-350 the sheet calls a Super C is a Class C", () => {
  const call = classifyCoach({
    body_type: "Class Super C",
    chassis_brand: "Ford",
    chassis: "F-350",
    printed: { gvwr: "12500" },
  });
  assert.equal(call.resolved, "Class C");
  assert.equal(call.override, "chassis");
  assert.match(call.sentence, /sheet lists this as a Class Super C/);
  assert.match(call.sentence, /F-350/);
});

test("a Freightliner M2 the sheet calls a Class C is a Super C", () => {
  const call = classifyCoach({
    body_type: "Class C",
    chassis_brand: "Freightliner",
    chassis: "M2",
    printed: { chassis_brand: "Freightliner", chassis_model: "M2", gvwr: "26000" },
  });
  assert.equal(call.resolved, "Class Super C");
  assert.equal(call.override, "chassis");
  assert.match(call.sentence, /sheet lists this as a Class C/);
  assert.match(call.sentence, /Freightliner/);
});

test("GVWR over 14500 labeled Class C is a Super C", () => {
  const call = classifyCoach({
    body_type: "Class C",
    printed: { gvwr: "22,000 lbs" },
  });
  assert.equal(call.resolved, "Class Super C");
  assert.equal(call.override, "gvwr");
  assert.equal(call.sentence, GVWR_SUPER_C_SENTENCE);
});

test("a blank chassis line does not get a guessed type", () => {
  const call = classifyCoach({
    body_type: "Class C",
    make: "Jayco",
    model: "Seneca",
    printed: {},
  } as { body_type: string; printed: Record<string, string> });
  assert.equal(call.resolved, "Class C");
  assert.equal(call.override, null);
  assert.equal(call.sentence, "");
});

test("14500 even is still the sheet Class C", () => {
  const call = classifyCoach({
    body_type: "Class C",
    chassis_brand: "Ford",
    chassis: "E450",
    printed: { chassis_brand: "Ford", chassis_model: "E450", gvwr: "14500 lbs" },
  });
  assert.equal(call.resolved, "Class C");
  assert.equal(call.override, null);
});
