import assert from "node:assert/strict";
import test from "node:test";
import {
  formatOwnLotBlock,
  looksLikeOwnLotSearchAsk,
  parseOwnLotAsk,
  snapshotFromJson,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  extractFloorplanToken,
  parseCoachFromText,
} from "./parseCoach.ts";
import { isForbiddenResearchHold } from "./speechPolicy.ts";

function unit(partial: Partial<OwnLotUnit> & Pick<OwnLotUnit, "year" | "make" | "model" | "trim" | "location" | "stock_number">): OwnLotUnit {
  return {
    body_type: "Class A Diesel",
    vin: "",
    source: "own",
    dealer: "RV Country",
    price: 129995,
    ...partial,
  };
}

const SHOW_MISS_UNITS: OwnLotUnit[] = [
  unit({
    year: "2016",
    make: "Newmar",
    model: "Ventana LE",
    trim: "4044",
    location: "Sparks NV",
    stock_number: "UCBGN9287A",
    price: 129995,
  }),
  unit({
    year: "2015",
    make: "Newmar",
    model: "Ventana LE",
    trim: "3849",
    location: "Sparks NV",
    stock_number: "UPI9379",
    price: 139995,
  }),
  unit({
    year: "2021",
    make: "Newmar",
    model: "Bay Star",
    trim: "3401",
    location: "Carson RV Show",
    stock_number: "46049B",
    price: 189995,
  }),
  unit({
    year: "2011",
    make: "Newmar",
    model: "Dutchstar",
    trim: "4020",
    location: "Carson RV Show",
    stock_number: "UPB9680",
    price: 99995,
  }),
];

test("2016 Ventana at Carson is a show miss, not a zero-lot lie", () => {
  assert.equal(extractFloorplanToken("2016 Thor Ventana LE"), "");
  const parsed = parseCoachFromText(
    "Hello, are you able to check uh the Carson show for a 2016 Ventana?",
  );
  assert.equal(parsed.year, "2016");
  assert.equal(parsed.make, "Newmar");
  assert.match(parsed.model, /ventana/i);
  assert.equal(parsed.floorplan, "");

  const locations = ["Sparks NV", "Carson RV Show", "Fresno CA"];
  const filter = parseOwnLotAsk(
    "check the Carson show for a 2016 Ventana",
    locations,
    SHOW_MISS_UNITS,
  );
  assert.equal(filter.location, "Carson RV Show");
  assert.ok(!filter.trim || filter.trim === "4044");

  const snapshot = snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: SHOW_MISS_UNITS,
  });
  const block = formatOwnLotBlock(
    snapshot,
    "Hello, are you able to check uh the Carson show for a 2016 Ventana?",
  );
  assert.match(block, /No own-lot hit for this exact series/);
  assert.match(block, /Matched: 0/);
  assert.doesNotMatch(block, /Lot total:\s*0/);

  const follow = formatOwnLotBlock(
    snapshot,
    "Do, does any of 'em match a Ventana period?",
  );
  assert.match(follow, /UCBGN9287A/);
  assert.match(follow, /UPI9379/);
  assert.doesNotMatch(follow, /LOCATION MISS/);
  assert.doesNotMatch(follow, /multiple dealers/);
});

test("a Ventana follow-up without a lot cue is not a lot search", () => {
  assert.equal(
    looksLikeOwnLotSearchAsk("Do, does any of 'em match a Ventana period?"),
    false,
  );
  assert.equal(
    looksLikeOwnLotSearchAsk("No, I'm looking on our lot. What do we have on our lot?"),
    false,
  );
});

test("standing stall phrases are forbidden; a look-into is not a hold", () => {
  assert.equal(isForbiddenResearchHold("Let me check that."), true);
  assert.equal(isForbiddenResearchHold("I'll look that up."), true);
  assert.equal(isForbiddenResearchHold("I can look into that for you."), false);
  assert.equal(isForbiddenResearchHold("give me one second"), false);
});
