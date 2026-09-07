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
} from "./repairMode.ts";
import {
  buildChatGrounding,
  buildVoiceGrounding,
  needsWebFallback,
} from "./grounding.ts";
import { looksLikeLiveResearchQuestion } from "./webIntent.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const CLASS_A_FACTS = {
  year: "2019",
  make: "Newmar",
  model: "Dutch Star",
  floorplan: "4369",
  rvType: "Class A",
  updatedAt: "2026-09-07T00:00:00.000Z",
};

const TRAVEL_TRAILER_FACTS = {
  year: "2018",
  make: "Keystone",
  model: "Passport",
  floorplan: "3350BH",
  rvType: "Travel Trailer",
  updatedAt: "2026-09-07T00:00:00.000Z",
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
  const grounded = buildChatGrounding({
    query: "furnace clicks but no heat",
    facts: CLASS_A_FACTS,
  });
  assert.equal(grounded.repairMode, true);
  assert.equal(grounded.needsWeb, true);
  assert.match(grounded.block, /REPAIR PLAYBOOK/);
  assert.match(grounded.block, /Dutch Star/);
  assert.match(grounded.block, /2019/);
  assert.match(grounded.block, /MOTORHOME|Class A/i);
  assert.match(grounded.block, /torque spec/i);
  assert.match(grounded.block, /not a certified RV technician/i);
  assert.doesNotMatch(grounded.block, /do not give Class A diesel/i);
});

test("locked travel trailer leak grounds to towable — not Class A AquaHot", () => {
  const grounded = buildChatGrounding({
    query: "fresh tank leak",
    facts: TRAVEL_TRAILER_FACTS,
  });
  assert.equal(grounded.repairMode, true);
  assert.match(grounded.block, /REPAIR PLAYBOOK/);
  assert.match(grounded.block, /Passport/);
  assert.match(grounded.block, /TOWABLE|Travel Trailer/i);
  assert.match(grounded.block, /Do not give Class A diesel/i);
  assert.match(grounded.block, /AquaHot/i);
});

test("non-repair spec question does not switch into the playbook", () => {
  const grounded = buildChatGrounding({
    query: "What engine and HP does a 2023 Entegra Vision have?",
    facts: CLASS_A_FACTS,
  });
  assert.equal(grounded.repairMode, false);
  assert.doesNotMatch(grounded.block, /REPAIR PLAYBOOK/);
  assert.doesNotMatch(grounded.block, /Clarify symptoms/i);
  assert.match(grounded.block, /VERIFIED CATALOG/);
});

test("Lineage M spec lock is unchanged — no repair playbook, no browse", () => {
  const q = "What engine and HP does a 2026 Grand Design Lineage M have?";
  const grounded = buildChatGrounding({ query: q });
  assert.equal(grounded.repairMode, false);
  assert.doesNotMatch(grounded.block, /REPAIR PLAYBOOK/);
  assert.equal(grounded.needsWeb, false);
  assert.equal(grounded.identity?.model, "Lineage Series M");
});

test("repair without a locked coach still injects rails and asks class", () => {
  const grounded = buildChatGrounding({
    query: "furnace clicks but no heat",
  });
  assert.equal(grounded.repairMode, true);
  assert.equal(grounded.needsWeb, true);
  assert.match(grounded.block, /REPAIR PLAYBOOK/);
  assert.match(grounded.block, /LOCKED COACH: none/i);
  assert.match(grounded.block, /Do not assume a Class A/i);
});

test("voice grounding keeps standing repair rails and coach class", () => {
  const standing = buildVoiceGrounding({ facts: TRAVEL_TRAILER_FACTS });
  assert.match(standing, /REPAIR RAILS|If they ask to repair/i);
  assert.match(standing, /Passport|Travel Trailer|TOWABLE/i);
  assert.doesNotMatch(standing, /REPAIR PLAYBOOK \(this turn/);

  const active = buildVoiceGrounding({
    query: "fresh tank leak",
    facts: TRAVEL_TRAILER_FACTS,
  });
  assert.match(active, /REPAIR this turn|REPAIR PLAYBOOK/i);
  assert.match(active, /torque spec/i);
});

test("coach lock helper names class-specific don'ts", () => {
  const mh = formatRepairCoachLock({
    year: "2019",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
    rvType: "Class A",
    chassis: "Spartan K3",
    fuelType: "Diesel",
    source: "facts",
  });
  assert.match(mh, /Dutch Star/);
  assert.match(mh, /MOTORHOME/);
  assert.match(mh, /Spartan K3/);
  assert.doesNotMatch(mh, /do not give Class A diesel/i);

  const tt = formatRepairCoachLock({
    year: "2018",
    make: "Keystone",
    model: "Passport",
    rvType: "Travel Trailer",
    source: "facts",
  });
  assert.match(tt, /TOWABLE/);
  assert.match(tt, /Do not give Class A diesel/i);

  const none = formatRepairGroundingBlock({ active: true, lock: null });
  assert.match(none, /LOCKED COACH: none/i);
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
