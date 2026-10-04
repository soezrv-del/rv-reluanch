import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "../rvgrok/lotMemory.ts";
import { claimsLotMiss } from "../rvgrok/voiceTurnGate.ts";
import {
  isLotGoAhead,
  offeredCoachNames,
  reconcileLotArgs,
  searchLot,
  type LotQueryUnit,
} from "./lotQuery.ts";

function lot() {
  return snapshotFromJson(
    JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
  );
}

function coach(stock: string, make: string, model: string, extra: Partial<LotQueryUnit> = {}): LotQueryUnit {
  return {
    year: "2022",
    make,
    model,
    trim: "24D",
    stock_number: stock,
    body_type: "Class C",
    condition: "Used",
    location: "Fife WA",
    price: 99995,
    ...extra,
  } as LotQueryUnit;
}

function small(): LotQueryUnit[] {
  return [
    coach("V1", "Winnebago", "View"),
    coach("V2", "Winnebago", "View Profile", { trim: "24G" }),
    coach("N1", "Itasca", "Navion", { trim: "24J" }),
    coach("N2", "Itasca", "Navion iQ", { trim: "24DL" }),
    coach("F1", "Thor Motor Coach", "Four Winds", { trim: "28A" }),
    coach("J1", "Jayco", "Redhawk", { trim: "31F" }),
  ];
}

const OFFER =
  "Yes! Winnebago also builds the Navion and the EKKO 23B. Both are compact Class C coaches on a Mercedes Sprinter or Ford Transit. Want me to check the lot for those?";

// The #642 preview thread, Oct 4 2026, 7:38 to 7:40 AM PT.
test("the Navion is found after a View thread: yes, are you looking, are you sure", () => {
  const snap = lot();
  const navions = snap.units.filter((unit) => /navion/i.test(unit.model)).length;
  assert.ok(navions > 0, "the snapshot carries Navions");

  const q1 = "Do we have any Winnebago Views on the lot?";
  const first = answerQueryLotFromSnapshot(snap, { query: q1, make: "Winnebago", model: "View" }, null, q1);
  assert.equal(first.matched, 2, first.speech);
  assert.match(first.speech, /Winnebago View/);

  const q2 = "Does Winnebago make anything else like the View?";
  const second = answerQueryLotFromSnapshot(snap, { query: q2, make: "Winnebago" }, first.lotMemory, q2);
  assert.doesNotMatch(second.speech, /Matching units: 2 Winnebago View/);

  // "Yes." with the old View filter still in the tool call and in memory.
  for (const args of [
    { query: "Yes." },
    { query: "Winnebago View", make: "Winnebago", model: "View" },
    {},
  ]) {
    const yes = answerQueryLotFromSnapshot(snap, { ...args }, first.lotMemory, "Yes.", OFFER);
    assert.equal(yes.matched, navions, `${JSON.stringify(args)}\n${yes.speech}`);
    assert.match(yes.speech, /Itasca Navion/);
    assert.match(yes.speech, /Navion: \d+ on the lot/);
    assert.match(yes.speech, /EKKO 23B: not on the lot/i);
    assert.doesNotMatch(yes.speech, /Winnebago View/);
    assert.doesNotMatch(yes.speech, /^None/);
  }

  const looking = answerQueryLotFromSnapshot(
    snap,
    { query: "Navion or EKKO", make: "Winnebago" },
    first.lotMemory,
    "Are you looking for it?",
    "",
  );
  assert.equal(looking.matched, navions, looking.speech);
  assert.match(looking.speech, /Itasca Navion/);

  const sure = "Are you sure there's no Navions on the lot?";
  const fourth = answerQueryLotFromSnapshot(snap, { query: sure, make: "Winnebago" }, first.lotMemory, sure);
  assert.equal(fourth.matched, navions, fourth.speech);
  assert.match(fourth.speech, /Itasca Navion/);
});

test("a make filter does not hide a sister-brand model: Winnebago Navion is the Itasca Navion", () => {
  const units = small();
  for (const args of [
    { query: "Winnebago Navion" },
    { query: "Navion", make: "Winnebago" },
    { query: "Navion", make: "Winnebago", model: "Navion" },
    { query: "Do we have any Winnebago Navions on the lot?" },
  ]) {
    const hit = searchLot(units, args);
    assert.equal(hit.matched, 2, `${JSON.stringify(args)}\n${hit.summary}`);
    assert.ok(hit.units.every((unit) => unit.make === "Itasca"), hit.summary);
    assert.match(hit.summary, /under Itasca, a Winnebago family brand/);
  }
  const thor = searchLot(units, { query: "Thor Four Winds" });
  assert.equal(thor.matched, 1, thor.summary);
  // A make with no model still means that make.
  const winnebago = searchLot(units, { query: "Winnebago" });
  assert.deepEqual(winnebago.units.map((unit) => unit.stock_number).sort(), ["V1", "V2"]);
  // A make that is not the same family still drops to the model name.
  const wrong = searchLot(units, { query: "Jayco Navion" });
  assert.equal(wrong.matched, 2, wrong.summary);
  assert.doesNotMatch(wrong.summary, /^None/);
});

test("Navion or EKKO searches both names and says which one is on the lot", () => {
  const units = small();
  for (const query of ["Navion or EKKO", "the Navion or the EKKO 23B", "Winnebago Navion and EKKO"]) {
    const hit = searchLot(units, { query });
    assert.equal(hit.matched, 2, `${query}\n${hit.summary}`);
    assert.match(hit.summary, /Navion: 2 on the lot/);
    assert.match(hit.summary, /EKKO( 23B)?: not on the lot/i);
    assert.doesNotMatch(hit.summary, /^None/);
  }
  const both = searchLot(units, { query: "View or Navion" });
  assert.equal(both.matched, 4, both.summary);
  assert.match(both.summary, /View: 2 on the lot\. Navion: 2 on the lot\./);
  // One coach plus features is not a list of names.
  const one = searchLot(units, { query: "Redhawk and 31F" });
  assert.equal(one.matched, 1, one.summary);
});

test("yes after the offer to check the lot searches the offered models", () => {
  assert.deepEqual(offeredCoachNames(OFFER, small()), ["Navion", "EKKO 23B"]);
  for (const said of ["Yes.", "yes please", "Go ahead", "Are you looking for it?", "Did you check?"]) {
    assert.equal(isLotGoAhead(said), true, said);
  }
  for (const said of ["Are you sure there's no Navions on the lot?", "Do we have any Views?", "How many RVs"]) {
    assert.equal(isLotGoAhead(said), false, said);
  }
  // The chat get_own_lot path: the model's query names the coach, the user said yes.
  const units = small();
  const reconciled = reconcileLotArgs({ query: "Navion or EKKO", utterance: "Yes." });
  assert.match(String(reconciled.query), /navion or ekko/);
  const hit = searchLot(units, { query: "Navion or EKKO", utterance: "Yes." });
  assert.equal(hit.matched, 2, hit.summary);
  const bare = searchLot(units, { query: "Winnebago Navion", utterance: "Are you looking for it?" });
  assert.equal(bare.matched, 2, bare.summary);
  // No offer and no new coach: "yes" keeps the coach in hand.
  const snap = lot();
  const views = "Do we have any Winnebago Views on the lot?";
  const first = answerQueryLotFromSnapshot(snap, { query: views }, null, views);
  const again = answerQueryLotFromSnapshot(snap, { query: "Yes" }, first.lotMemory, "Yes.", "Sounds good.");
  assert.equal(again.matched, first.matched, again.speech);
});

test("a substring hit on the model name is never a bare none", () => {
  const units = small();
  // A class or store he did not say does not empty the name set.
  const wrongBody = searchLot(units, { query: "Winnebago View", body_type: "Class B" });
  assert.equal(wrongBody.matched, 2, wrongBody.summary);
  assert.doesNotMatch(wrongBody.summary, /^None/);
  const unsaidPrice = searchLot(units, { query: "Navion", price_max: 20000 });
  assert.equal(unsaidPrice.matched, 2, unsaidPrice.summary);
  assert.match(unsaidPrice.summary, /^Not with every filter named\. By name on the lot: 2 Itasca Navion/);
  // A filter he said stays an honest zero, and still names what is on the lot.
  const saidPrice = searchLot(units, { query: "Navion under $20,000" });
  assert.equal(saidPrice.matched, 0, saidPrice.summary);
  assert.match(saidPrice.summary, /^None with those filters\. By name, the lot has 2 Itasca Navion, all used\./);
  const used = searchLot(units, { query: "used Navion" });
  assert.equal(used.matched, 2, used.summary);
  const miss = searchLot(units, { query: "EKKO" });
  assert.equal(miss.matched, 0, miss.summary);
});

test("Views and View are the same 2, and the same question twice is the same answer", () => {
  const snap = lot();
  let memory = null;
  const counts: number[] = [];
  for (const said of [
    "Do we have any Winnebago Views on the lot?",
    "Do we have any Winnebago Views on the lot?",
    "any Winnebago View on the lot",
    "Do we have any Winnebago Views on the lot?",
  ]) {
    for (const args of [{ query: said }, { query: said, make: "Winnebago", model: "Views" }, { query: "Winnebago View" }]) {
      const hit = answerQueryLotFromSnapshot(snap, { ...args }, memory, said);
      counts.push(hit.matched);
      assert.match(hit.speech, /Matching units: 2 Winnebago View/, `${said} ${JSON.stringify(args)}`);
      memory = hit.lotMemory;
    }
  }
  assert.ok(counts.every((n) => n === 2), counts.join(","));
  const plain = searchLot(snap.units, { query: "Winnebago Views" });
  const single = searchLot(snap.units, { query: "Winnebago View" });
  assert.equal(plain.matched, single.matched);
});

test("live voice waits for this turn's words before query_lot, and checks a lot miss she said without it", () => {
  const realtime = readFileSync(join(process.cwd(), "src/lib/rvgrok/realtime.ts"), "utf8");
  const handler = realtime.slice(realtime.indexOf("private async handleQueryLotCall"));
  const wait = handler.indexOf("await this.waitForUserTranscript()");
  const post = handler.indexOf('fetch("/api/rvgrok/query-lot"');
  assert.ok(wait > 0 && post > wait, "query_lot waits for the transcript before it posts");
  assert.match(realtime, /input_audio_buffer\.speech_stopped":\s*\n\s*this\.userTranscriptPending = true/);
  assert.match(realtime, /claimsLotMiss\(this\.assistantText\)/);
  assert.match(realtime, /verifyLotMissClaim/);

  assert.equal(
    claimsLotMiss("The lot search came back with just the two Views we already talked about — no Navion or EKKO in stock."),
    true,
  );
  assert.equal(claimsLotMiss("We don't have any Navions on the lot right now."), true);
  assert.equal(claimsLotMiss("Matching units: 2 Itasca Navion, all used."), false);
  assert.equal(claimsLotMiss("The Navion rides on a Mercedes Sprinter."), false);

  const chat = readFileSync(join(process.cwd(), "src/routes/api/rvgrok.ts"), "utf8");
  assert.match(chat, /goAheadLotQuery\(lastPlain, prior, snapshot\.units\)/);
  assert.match(chat, /goAheadLotQuery\(ctx\.userText/);
});
