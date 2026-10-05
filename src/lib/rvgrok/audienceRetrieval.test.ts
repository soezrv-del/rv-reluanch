import assert from "node:assert/strict";
import test from "node:test";
import {
  countSoftFollowUps,
  isExitSpendingAsk,
  keepTalkingCue,
  parseAudience,
  rvGrokCoreFor,
} from "./speechPolicy.ts";
import { needsWebFallback } from "./webIntent.ts";
import { formatLockedWeightsBlock, savedPinCoversAskedField } from "./lockedWeights.ts";
import { buildRealtimeSessionUpdate } from "./liveVoice.ts";

const GVWR = "What's the GVWR on the 40IH";
const PAYMENT = "What's the monthly payment on $80000 at 7% for 15 years?";
const HP = "What HP does the 40IH have?";
const locked = { missingHard: false, missingOemWeightPin: false };

test("the core is built by the tag", () => {
  const shopper = rvGrokCoreFor("shopper");
  const owner = rvGrokCoreFor("owner");
  assert.match(shopper, /SHOPPER RETRIEVAL is search-always/);
  assert.doesNotMatch(shopper, /pin-first on this unit/);
  assert.match(owner, /OWNER RETRIEVAL is pin-first on this unit/);
  assert.doesNotMatch(owner, /SHOPPER RETRIEVAL is search-always/);
  assert.doesNotMatch(shopper, /SPEC_ASK_MUST_SEARCH/);
  assert.doesNotMatch(owner, /SPEC_ASK_MUST_SEARCH/);
  assert.doesNotMatch(shopper, /CATALOG_PIN_WINS/);
  assert.doesNotMatch(owner, /CATALOG_PIN_WINS/);
  assert.doesNotMatch(shopper, /Then still answer/);
  assert.doesNotMatch(owner, /Then still answer/);
  assert.doesNotMatch(shopper, /one natural follow-up/);
  assert.doesNotMatch(owner, /one natural follow-up/);
  assert.doesNotMatch(shopper, /experienced RV salesman's pocket/);
});

test("a missing tag is shopper, and our truck does not flip it", () => {
  assert.equal(parseAudience(undefined), "shopper");
  assert.equal(parseAudience(null), "shopper");
  assert.equal(parseAudience(""), "shopper");
  assert.equal(parseAudience("our truck"), "shopper");
  assert.equal(parseAudience("owner"), "owner");
  assert.equal(parseAudience("Owner"), "shopper");
});

test("payment is the first shopper search, and a greeting is not", () => {
  assert.equal(needsWebFallback(null, PAYMENT), true);
  assert.equal(needsWebFallback(locked, PAYMENT, { audience: "shopper" }), true);
  assert.equal(needsWebFallback(null, "hi"), false);
  assert.equal(needsWebFallback(null, "Is full-timing worth it?"), false);
  assert.equal(needsWebFallback(locked, GVWR, { audience: "shopper", pinCoversAskedField: true }), true);
  assert.equal(needsWebFallback(locked, GVWR), true);
  assert.equal(
    needsWebFallback(locked, GVWR, { audience: "owner", pinCoversAskedField: true }),
    false,
  );
  assert.equal(
    needsWebFallback(locked, GVWR, { audience: "owner", pinCoversAskedField: false }),
    true,
  );
  assert.equal(
    needsWebFallback(locked, GVWR, { audience: "owner" }),
    true,
  );
  assert.equal(
    needsWebFallback(locked, HP, { audience: "owner", pinCoversAskedField: false }),
    true,
    "a weight pin is not an HP pin, so the caller leaves the flag false",
  );
  assert.equal(
    needsWebFallback(locked, HP, { audience: "shopper", pinCoversAskedField: true }),
    true,
  );
});

test("the exit cue is counted, and the choice line is not a follow-up", () => {
  assert.match(keepTalkingCue(0), /^EXIT OPEN/);
  assert.match(keepTalkingCue(1), /^EXIT SPENT/);
  assert.match(keepTalkingCue(2), /^EXIT SPENT/);
  assert.equal(isExitSpendingAsk("Hello, David."), false);
  assert.equal(isExitSpendingAsk("Would you like a full report or a quick overview?"), false);
  assert.equal(isExitSpendingAsk("Which floorplan?"), true);
  assert.equal(isExitSpendingAsk("What truck are you towing with?"), true);
  assert.equal(isExitSpendingAsk("Which system is throwing that code?"), true);
  assert.equal(
    countSoftFollowUps(["Hello.", "Which floorplan is it?", "The pin is 22,000."]),
    1,
  );
});

test("the pin flag is this floorplan and this field, and the locked block says so", () => {
  const identity = {
    year: "2020",
    make: "Tiffin",
    model: "Phaeton",
    floorplan: "40IH",
  };
  assert.equal(savedPinCoversAskedField(null, GVWR), false);
  assert.equal(savedPinCoversAskedField({ ...identity, floorplan: "" }, GVWR), false);
  assert.equal(savedPinCoversAskedField(identity, HP), false);
  assert.match(formatLockedWeightsBlock(identity), /^SAVED PIN MATCH:/);
  const session = buildRealtimeSessionUpdate("ara").session as { instructions: string };
  assert.ok(session.instructions.endsWith(keepTalkingCue(0)));
  assert.match(session.instructions, /SHOPPER RETRIEVAL is search-always/);
});
