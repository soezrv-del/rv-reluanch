import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  EMPTY_COACH_PROFILE,
  type CoachProfile,
  type SuggestCoachFn,
} from "./coachProfile.ts";
import {
  decideTowHandoff,
  normalizeTowHandoffOffer,
  offerFromCoach,
} from "./towHandoff.ts";

const root = dirname(fileURLToPath(import.meta.url));

const stubSuggest: SuggestCoachFn = (opts) => ({
  ...EMPTY_COACH_PROFILE,
  year: opts.year,
  make: opts.make,
  model: opts.model,
  floorplan: opts.floorplan,
  type: opts.rvType || "",
  heightFt: 13.2,
  lengthFt: 40,
  widthFt: 8.5,
  weightLbs: opts.gvwrLbs || 0,
  dimSources: {
    height: "estimate",
    length: "estimate",
    width: "estimate",
    weight: opts.gvwrLbs ? "facts" : "estimate",
  },
});

const montana = {
  year: "2022",
  make: "Keystone",
  model: "Montana",
  floorplan: "3855BR",
  rvType: "Fifth Wheel",
  gvwrLbs: 16500,
};

const dream: CoachProfile = {
  ...EMPTY_COACH_PROFILE,
  year: "2023",
  make: "American Coach",
  model: "American Dream",
  floorplan: "45A",
  heightFt: 13.5,
  lengthFt: 45,
  weightLbs: 52000,
  locked: true,
  seedSource: "locked",
};

test("offerFromCoach refuses a truck-only row — no invented coach", () => {
  assert.equal(offerFromCoach({ make: "Ford", model: "F-350 Super Duty" }), null);
  assert.equal(offerFromCoach({ year: "2024", make: "Ford" }), null);
  const offer = offerFromCoach(montana);
  assert.ok(offer);
  assert.equal(offer.make, "Keystone");
  assert.equal(offer.gvwrLbs, 16500);
  assert.equal("heightFt" in offer, false);
  assert.equal("lengthFt" in offer, false);
});

test("normalizeTowHandoffOffer drops junk weights instead of inventing", () => {
  const offer = normalizeTowHandoffOffer({
    year: "2022",
    make: "Keystone",
    model: "Montana",
    gvwrLbs: -12,
    uvwLbs: Number.NaN,
  });
  assert.ok(offer);
  assert.equal(offer.gvwrLbs, undefined);
  assert.equal(offer.uvwLbs, undefined);
});

test("decideTowHandoff: unlocked → apply via suggest, not invented dims", () => {
  const d = decideTowHandoff({ offer: montana }, stubSuggest);
  assert.equal(d.action, "apply");
  if (d.action !== "apply") return;
  assert.equal(d.profile.make, "Keystone");
  assert.equal(d.profile.floorplan, "3855BR");
  assert.equal(d.profile.weightLbs, 16500);
  assert.equal(d.profile.seedSource, "tow");
  assert.equal(d.profile.locked, false);
  assert.equal(d.profile.dimSources?.weight, "facts");
});

test("decideTowHandoff: same locked coach is not rewritten", () => {
  const locked = {
    ...dream,
    year: "2022",
    make: "Keystone",
    model: "Montana",
    floorplan: "3855BR",
  };
  const d = decideTowHandoff({ locked, offer: montana }, stubSuggest);
  assert.equal(d.action, "same-locked");
  if (d.action !== "same-locked") return;
  assert.equal(d.profile.locked, true);
  assert.equal(d.profile.seedSource, "locked");
  assert.equal(d.profile.lengthFt, 45);
});

test("decideTowHandoff: different locked coach requires confirm — no overwrite", () => {
  const d = decideTowHandoff({ locked: dream, offer: montana }, stubSuggest);
  assert.equal(d.action, "confirm-replace");
  if (d.action !== "confirm-replace") return;
  assert.equal(d.locked.make, "American Coach");
  assert.equal(d.incoming.make, "Keystone");
  assert.equal(d.incoming.locked, false);
});

test("decideTowHandoff: no coach identity → open profile only", () => {
  const d = decideTowHandoff({ offer: { make: "Ford", model: "F-350" } }, stubSuggest);
  assert.equal(d.action, "open-only");
});

test("Trips Profile consumes Tow handoff without auto-locking", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /decideTowHandoff/);
  assert.match(ui, /tripsHandoff/);
  assert.match(ui, /confirm-replace/);
  assert.match(ui, /FROM TOW/);
  assert.match(ui, /Unlock to replace/);
  assert.doesNotMatch(ui, /saveLockedProfile\(incoming\)/);
});
