import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPAIR_NO_INVENT_PATTERNS,
  REPAIR_PLAYBOOK,
  REPAIR_VOICE_PLAYBOOK,
  formatRepairCoachLock,
  formatRepairGroundingBlock,
  looksLikeRepairQuestion,
  repairCoachLockFromGrounded,
} from "./repairMode.ts";
import {
  looksLikeLiveResearchQuestion,
  needsWebFallback,
} from "./webIntent.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const CLASS_A_LOCK = {
  year: "2019",
  make: "Newmar",
  model: "Dutch Star",
  floorplan: "4369",
  rvType: "Class A",
  chassis: "Spartan K3",
  fuelType: "Diesel",
  source: "facts",
};

const TRAVEL_TRAILER_LOCK = {
  year: "2018",
  make: "Keystone",
  model: "Passport",
  floorplan: "3350BH",
  rvType: "Travel Trailer",
  source: "facts",
};

test("repair intent fires on diagnose / leak / no-start / code / named systems", () => {
  const yes = [
    "furnace clicks but no heat",
    "Furnace clicks but no heat",
    "fresh tank leak",
    "There's a leak at the fresh tank",
    "won't start this morning",
    "Coach will not start",
    "error code E3 on the slide",
    "propane smell near the bottles",
    "My AquaHot isn't heating",
    "aquahot not heating",
    "slide won't retract",
    "diagnose the inverter",
    "how do I fix the water pump",
    "what should I check on the furnace",
  ];
  for (const q of yes) {
    assert.equal(looksLikeRepairQuestion(q), true, q);
    assert.equal(looksLikeLiveResearchQuestion(q), true, q);
    assert.equal(needsWebFallback({ missingHard: false }, q), true, q);
  }
});

test("repair intent stays off for specs, lifestyle, and system-name-only asks", () => {
  const no = [
    "What engine and HP does a 2023 Entegra Vision have?",
    "I'd like to know about the 2027 Grand Design Lineage M series.",
    "What engine and HP does a 2026 Grand Design Lineage M have?",
    "Does this have AquaHot?",
    "How many slides does this floorplan have?",
    "What is the propane tank size?",
    "Is full-timing worth it?",
    "What's the monthly payment on $80000 at 7% for 15 years?",
    "hi",
    "Draw a Class A at sunset",
  ];
  for (const q of no) {
    assert.equal(looksLikeRepairQuestion(q), false, q);
  }
  assert.equal(
    needsWebFallback({ missingHard: false }, no[2]!),
    false,
    "Lineage M spec lock must not browse",
  );
});

test("playbook rails discourage invented torque / part numbers / wiring / bypass", () => {
  for (const needle of REPAIR_NO_INVENT_PATTERNS) {
    assert.match(REPAIR_PLAYBOOK, new RegExp(needle, "i"), needle);
    assert.match(REPAIR_VOICE_PLAYBOOK, new RegExp(needle, "i"), needle);
  }
  assert.match(REPAIR_PLAYBOOK, /not a certified RV technician/i);
  assert.match(REPAIR_PLAYBOOK, /Clarify symptoms/i);
  assert.match(REPAIR_PLAYBOOK, /Likely causes/i);
  assert.match(REPAIR_PLAYBOOK, /Safety stops/i);
  assert.match(REPAIR_PLAYBOOK, /DIY-safe vs dealer/i);
  assert.match(REPAIR_PLAYBOOK, /NHTSA/i);
  assert.match(REPAIR_PLAYBOOK, /OEM procedure/i);
  assert.doesNotMatch(REPAIR_PLAYBOOK, /just bypass the sensor and drive/i);
});

test("locked Class A repair grounds to motorhome — not generic trailer tips", () => {
  const q = "furnace clicks but no heat";
  assert.equal(looksLikeRepairQuestion(q), true);
  const block = formatRepairGroundingBlock({
    active: true,
    lock: CLASS_A_LOCK,
  });
  assert.match(block, /REPAIR PLAYBOOK/);
  assert.match(block, /Dutch Star/);
  assert.match(block, /2019/);
  assert.match(block, /MOTORHOME|Class A/i);
  assert.match(block, /Spartan K3/);
  assert.match(block, /torque spec/i);
  assert.match(block, /not a certified RV technician/i);
  assert.doesNotMatch(block, /do not give Class A diesel/i);
});

test("locked travel trailer leak grounds to towable — not Class A AquaHot", () => {
  const q = "fresh tank leak";
  assert.equal(looksLikeRepairQuestion(q), true);
  const block = formatRepairGroundingBlock({
    active: true,
    lock: TRAVEL_TRAILER_LOCK,
  });
  assert.match(block, /REPAIR PLAYBOOK/);
  assert.match(block, /Passport/);
  assert.match(block, /TOWABLE|Travel Trailer/i);
  assert.match(block, /Do not give Class A diesel/i);
  assert.match(block, /AquaHot/i);
});

test("non-repair spec question does not switch into the playbook", () => {
  assert.equal(
    looksLikeRepairQuestion(
      "What engine and HP does a 2023 Entegra Vision have?",
    ),
    false,
  );
  assert.equal(formatRepairGroundingBlock({ active: false }), "");
  assert.doesNotMatch(
    formatRepairGroundingBlock({ active: false, lock: CLASS_A_LOCK }),
    /REPAIR PLAYBOOK/,
  );
});

test("repair without a locked coach still injects rails and asks class", () => {
  const block = formatRepairGroundingBlock({ active: true, lock: null });
  assert.match(block, /REPAIR PLAYBOOK/);
  assert.match(block, /LOCKED COACH: none/i);
  assert.match(block, /Do not assume a Class A/i);
});

test("voice standing rails stay off until a repair ask; Facts class still grounds", () => {
  const standing = formatRepairGroundingBlock({
    active: false,
    voice: true,
    lock: TRAVEL_TRAILER_LOCK,
  });
  assert.match(standing, /REPAIR RAILS|If they ask to repair/i);
  assert.match(standing, /Passport|Travel Trailer|TOWABLE/i);
  assert.doesNotMatch(standing, /REPAIR PLAYBOOK \(this turn/);

  const active = formatRepairGroundingBlock({
    active: true,
    voice: true,
    lock: TRAVEL_TRAILER_LOCK,
  });
  assert.match(active, /REPAIR this turn|REPAIR PLAYBOOK/i);
  assert.match(active, /torque spec/i);
});

test("Facts rvType fills class when catalog type is empty", () => {
  const lock = repairCoachLockFromGrounded({
    identity: {
      year: "2019",
      make: "Newmar",
      model: "Dutch Star",
      floorplan: "4369",
      source: "facts",
    },
    specs: { rvType: { value: null }, chassis: { value: null } },
    facts: CLASS_A_LOCK,
  });
  assert.equal(lock?.rvType, "Class A");
  assert.match(formatRepairCoachLock(lock), /MOTORHOME/);
});

test("coach lock helper names class-specific don'ts", () => {
  const mh = formatRepairCoachLock(CLASS_A_LOCK);
  assert.match(mh, /Dutch Star/);
  assert.match(mh, /MOTORHOME/);
  assert.match(mh, /Spartan K3/);
  assert.doesNotMatch(mh, /do not give Class A diesel/i);

  const tt = formatRepairCoachLock(TRAVEL_TRAILER_LOCK);
  assert.match(tt, /TOWABLE/);
  assert.match(tt, /Do not give Class A diesel/i);
});

test("wiring: chat, voice, browse, and Live share the same repair rails", () => {
  const grounding = src("grounding.ts");
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const webIntent = src("webIntent.ts");
  const webSearch = src("webSearch.ts");
  const voiceWeb = src("voiceWeb.ts");
  const realtime = src("realtime.ts");

  assert.match(grounding, /repairMode/);
  assert.match(grounding, /formatRepairGroundingBlock/);
  assert.match(grounding, /repairBlockFor/);
  assert.match(webIntent, /looksLikeRepairQuestion/);
  assert.match(prompts, /REPAIR \/ DIAGNOSE/);
  assert.match(prompts, /not a certified RV technician/i);
  assert.match(prompts, /torque spec/);
  assert.match(voice, /REPAIR PLAYBOOK|Not a certified RV tech/);
  assert.match(voice, /torque spec/);
  assert.match(webSearch, /torque spec, part number, wiring color/);
  assert.match(webSearch, /no OEM procedure/);
  assert.match(voiceWeb, /REPAIR PLAYBOOK|Not a certified RV tech/);
  assert.match(realtime, /REPAIR_VOICE_PLAYBOOK/);
  assert.match(realtime, /looksLikeRepairQuestion/);
  assert.doesNotMatch(realtime, /LIVE_RESEARCH_RE/);
});
