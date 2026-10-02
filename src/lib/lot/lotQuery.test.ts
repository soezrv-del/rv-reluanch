import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "../rvgrok/lotMemory.ts";
import { QUERY_LOT_TOOL } from "../rvgrok/liveVoice.ts";
import { decideVoiceWebResearch } from "../rvgrok/voiceWeb.ts";
import { spokenLotPayload } from "../rvgrok/voiceTurnGate.ts";
import { searchLot } from "./lotQuery.ts";
import { searchLotUnits, singularizeLotToken } from "./lotSearch.ts";

function units() {
  const snap = snapshotFromJson(
    JSON.parse(
      readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8"),
    ),
  );
  return snap;
}

test("singularize shares the lot tokenizer: lineages and super cs", () => {
  assert.equal(singularizeLotToken("lineages"), "lineage");
  assert.equal(singularizeLotToken("cs"), "c");
  assert.equal(singularizeLotToken("class"), "class");
  assert.equal(singularizeLotToken("series"), "series");
  assert.equal(singularizeLotToken("5s"), "5");
});

test("Grand Design Lineages and Lineage are the same 27 new coaches", () => {
  const snap = units();
  for (const query of [
    "Grand Design Lineages",
    "Lineage",
    "How many Grand Design Lineages do we have in stock?",
  ]) {
    const hit = searchLot(snap.units, { query });
    assert.equal(hit.matched, 27, query);
    assert.equal(hit.counts.condition.New, 27, query);
    const byModel = Object.entries(hit.counts.model);
    assert.ok(byModel.length > 0, query);
    assert.ok(
      byModel.every(([model]) => /lineage/i.test(model)),
      query,
    );
    assert.equal(
      byModel.reduce((sum, [, count]) => sum + count, 0),
      27,
      query,
    );
    assert.match(hit.summary, /Lineage/, query);
    assert.equal(hit.none, false, query);
  }
});

test("used Super Cs are 14 and Super Cs are 31 with the chassis overrides", () => {
  const snap = units();
  const used = searchLot(snap.units, { query: "used Super Cs" });
  assert.equal(used.matched, 14);
  assert.equal(used.counts.body_type["Class Super C"], 12);
  assert.equal(used.counts.condition.Used, 14);

  const typed = searchLot(snap.units, {
    body_type: "Class Super C",
    condition: "used",
  });
  assert.equal(typed.matched, 14);

  const all = searchLot(snap.units, { query: "Super Cs" });
  assert.equal(all.matched, 31);
  assert.equal(all.counts.body_type["Class Super C"], 27);
  assert.equal(all.counts.condition.New, 17);
  assert.equal(all.counts.condition.Used, 14);
  assert.match(all.summary, /Seneca/);
  assert.match(all.summary, /fourteen thousand five hundred/);
});

test("Class C reports 180 as 153 Class C plus 27 Class Super C", () => {
  const hit = searchLot(units().units, { query: "Class C" });
  assert.equal(hit.matched, 180);
  assert.equal(hit.counts.body_type["Class C"], 153);
  assert.equal(hit.counts.body_type["Class Super C"], 27);
  assert.match(hit.summary, /180/);
  assert.match(hit.summary, /153 Class C/);
  assert.match(hit.summary, /27 Class Super C/);
});

test("Odyssey 29V is stock 46573 and sale pending", () => {
  const hit = searchLot(units().units, { query: "Odyssey 29V" });
  assert.equal(hit.matched, 1);
  assert.equal(hit.units[0]?.stock_number, "46573");
  assert.match(hit.units[0]?.lot_status || "", /sale pending/i);
  assert.match(hit.summary, /46573/);
  assert.match(hit.summary, /Sale Pending/);
});

test("31Z matches the six Lineage F 31ZW and 31ZW5 units, including stock 47559", () => {
  const snap = units();
  const hit = searchLot(snap.units, { query: "31Z" });
  const page = searchLotUnits(snap.units, "31Z");
  assert.equal(hit.matched, 6);
  assert.equal(page.length, 6);
  assert.ok(hit.units.some((unit) => unit.stock_number === "47559") || page.some((unit) => unit.stock_number === "47559"));
  const stocks = page.map((unit) => unit.stock_number).sort();
  assert.ok(stocks.includes("47559"));
  assert.ok(
    page.every(
      (unit) =>
        unit.model === "Lineage Series F" &&
        (unit.trim === "31ZW" || unit.trim === "31ZW5"),
    ),
  );
  assert.deepEqual(
    hit.units.map((unit) => unit.stock_number).sort(),
    stocks,
  );
});

test("Linea prefix matches the same 27 Lineage coaches as Lineage", () => {
  const snap = units();
  const linea = searchLot(snap.units, { query: "Linea" });
  const lineage = searchLot(snap.units, { query: "Lineage" });
  const page = searchLotUnits(snap.units, "Linea");
  assert.equal(linea.matched, 27);
  assert.equal(lineage.matched, 27);
  assert.equal(page.length, 27);
  assert.equal(searchLotUnits(snap.units, "lineages").length, 27);
  assert.deepEqual(
    page.map((unit) => unit.stock_number).sort(),
    snap.units
      .filter((unit) => /lineage/i.test(unit.model || ""))
      .map((unit) => unit.stock_number)
      .sort(),
  );
});

test("structured zero falls back to the plain type-ahead match", () => {
  const snap = units();
  const hit = searchLot(snap.units, { query: "class a lineage" });
  assert.equal(hit.matched, 27);
  assert.equal(hit.none, false);
  assert.ok(hit.units.every((unit) => /lineage/i.test(unit.model)));
});

test("Linage returns the Lineage coaches and names the sheet model", () => {
  const hit = searchLot(units().units, { query: "Linage" });
  assert.equal(hit.matched, 27);
  assert.equal(hit.did_you_mean, "Lineage");
  assert.match(hit.summary, /Sheet says Lineage, not Linage/);
  assert.ok(hit.units.every((unit) => /lineage/i.test(unit.model)));
});

test("how about used Super Cs after a Lineage question still calls the tool and returns 14", () => {
  const realtime = readFileSync(
    join(process.cwd(), "src/lib/rvgrok/realtime.ts"),
    "utf8",
  );
  assert.doesNotMatch(realtime, /Not a lot question/);
  assert.doesNotMatch(realtime, /looksLikeLotQuestion\(this\.lastUserTranscript/);
  const tool = QUERY_LOT_TOOL as {
    description: string;
    parameters: { properties: Record<string, unknown> };
  };
  assert.match(tool.description, /ANY count or availability/);
  assert.match(tool.description, /matched is 0/);
  assert.ok(tool.parameters.properties.condition);
  assert.ok(tool.parameters.properties.status);
  assert.ok(tool.parameters.properties.query);

  const snap = units();
  const lineage = searchLot(snap.units, { query: "Grand Design Lineages" });
  assert.equal(lineage.matched, 27);
  const follow = answerQueryLotFromSnapshot(
    snap,
    { query: "how about used Super Cs, how many?" },
    { filter: { make: "Grand Design", model: "Lineage" } },
  );
  assert.equal(follow.matched, 14);
  assert.equal(follow.none, false);
  assert.equal(follow.counts?.body_type["Class Super C"], 12);
  assert.equal(follow.counts?.condition.Used, 14);
});

test("fuel, spoken price, sort, and chassis match the lot sheet", () => {
  const snap = units();
  const around = searchLot(snap.units, { query: "diesel around a hundred thousand" });
  assert.equal(around.matched, 11);
  assert.ok(
    around.units.every((unit) => (unit.price ?? 0) >= 85_000 && (unit.price ?? 0) <= 115_000),
  );
  assert.equal(
    snap.units.filter((unit) => {
      const fuel = `${unit.printed?.fuel_type || ""} ${unit.printed?.engine || ""}`.toLowerCase();
      return (
        /\bdiesel\b/.test(fuel) &&
        unit.price != null &&
        unit.price >= 85_000 &&
        unit.price <= 115_000
      );
    }).length,
    11,
  );

  const cheap = searchLot(snap.units, { query: "cheapest diesel" });
  assert.equal(cheap.units[0]?.price, 29995);
  assert.equal(cheap.units[1]?.price, 29995);
  assert.deepEqual(
    cheap.units.slice(0, 2).map((unit) => unit.stock_number).sort(),
    ["28960E", "UPD9457A"],
  );
  const cheapNames = cheap.units.map((unit) => `${unit.year} ${unit.make} ${unit.model}`).join(" | ");
  assert.match(cheapNames, /2003 Fleetwood Expedition/);
  assert.match(cheapNames, /2001 Winnebago ULTIMATE ADVANTAGE/i);

  assert.equal(searchLot(snap.units, { query: "diesels" }).matched, 160);
  const typo = searchLot(snap.units, { query: "deisel" });
  assert.equal(typo.matched, 160);
  assert.equal(typo.close, "diesel");
  assert.equal(searchLot(snap.units, { query: "freightliner" }).matched, 34);

  const junk = searchLot(snap.units, { query: "diesel around a hundred thousand zzznomatch" });
  assert.equal(junk.matched, 11);

  const dollars = searchLot(snap.units, { query: "used diesel around $100,000" });
  assert.ok(dollars.matched > 0);
  assert.ok(dollars.matched <= 11);
  assert.equal(dollars.counts.condition.Used, dollars.matched);
  assert.ok(
    dollars.units.every((unit) => (unit.price ?? 0) >= 85_000 && (unit.price ?? 0) <= 115_000),
  );
  assert.equal(
    searchLot(snap.units, { query: "diesel around $100,000" }).matched,
    11,
  );

  const voice = readFileSync(join(process.cwd(), "src/lib/rvgrok/liveVoice.ts"), "utf8");
  assert.match(voice, /Never say none before the tool returns/);
  assert.match(voice, /Never answer a lot count from memory/);
  assert.match(voice, /Call query_lot once/);
});

test("the salesman's words beat a bad model filter on the first ask", () => {
  const snap = units();
  const diesels = answerQueryLotFromSnapshot(
    snap,
    { bodyType: "Class A" },
    null,
    "how many diesels do we have",
  );
  // The model body stays. Spoken diesel adds fuel; it does not clear Class A.
  assert.ok(diesels.matched > 0 && diesels.matched < 161);
  assert.match(diesels.filter_label, /diesel/i);
  assert.doesNotMatch(diesels.filter_label, /^all units$/);
  assert.doesNotMatch(diesels.summary || "", /web notes/i);
  assert.doesNotMatch(diesels.speech, /web notes/i);

  const cheap = answerQueryLotFromSnapshot(
    snap,
    {},
    null,
    "cheapest diesel we have in inventory",
  );
  assert.equal(cheap.units[0]?.price, 29995);
  assert.ok(
    cheap.units[0]?.stock_number === "UPD9457A" ||
      cheap.units[0]?.stock_number === "28960E",
  );
  assert.doesNotMatch(cheap.speech, /web notes/i);

  const around = answerQueryLotFromSnapshot(
    snap,
    { minPrice: 90000, maxPrice: 110000 },
    null,
    "diesel around a hundred thousand",
  );
  assert.equal(around.matched, 11);
  assert.doesNotMatch(around.speech, /web notes/i);

  const keptClass = searchLot(snap.units, { utterance: "deisel", body_type: "Class A" });
  assert.ok(keptClass.matched > 0 && keptClass.matched < 161);
  assert.equal(keptClass.close, "diesel");
  assert.equal(searchLot(snap.units, { utterance: "freightliner" }).matched, 34);

  const follow = answerQueryLotFromSnapshot(
    snap,
    { bodyType: "Class A" },
    { filter: { make: "Grand Design", model: "Lineage" } },
    "how about used Super Cs, how many?",
  );
  assert.equal(follow.matched, 14);

  for (const said of [
    "how many diesels do we have",
    "cheapest diesel we have in inventory",
    "diesel around a hundred thousand",
  ]) {
    assert.equal(decideVoiceWebResearch({ transcript: said }).action, "pass", said);
  }

  const voice = readFileSync(join(process.cwd(), "src/lib/rvgrok/liveVoice.ts"), "utf8");
  const realtime = readFileSync(join(process.cwd(), "src/lib/rvgrok/realtime.ts"), "utf8");
  const api = readFileSync(join(process.cwd(), "src/routes/api/rvgrok.ts"), "utf8");
  assert.match(voice, /Never tell the user to change/);
  assert.match(realtime, /Never tell the user to change/);
  assert.match(api, /utterance: ctx\.userText/);
  assert.match(api, /looksLikeOwnLotCountOrRankAsk/);
});

test("8.9 displacement and 400 horsepower are on the lot sheet", () => {
  const snap = units();
  const displacement = searchLot(snap.units, {
    query: "anything in our lot that has an 8.9 in it",
  });
  assert.equal(displacement.matched, 10);
  assert.match(displacement.summary, /displacement 8\.9/);
  assert.ok(displacement.units.some((unit) => unit.stock_number === "46539A"));
  assert.doesNotMatch(displacement.summary, /does not track|doesn't track/i);

  const horsepower = searchLot(snap.units, {
    query: "any RVs in our inventory that had a 400 horsepower",
  });
  assert.equal(horsepower.matched, 2);
  assert.match(horsepower.summary, /400 horsepower/);
  assert.deepEqual(
    horsepower.units.map((unit) => unit.stock_number).sort(),
    ["46539A", "UCO9965"],
  );

  const heard = answerQueryLotFromSnapshot(
    snap,
    { make: "Coachmen" },
    null,
    "any RVs in our inventory that had a 400 horsepower",
  );
  assert.equal(heard.matched, 2);
  assert.doesNotMatch(heard.speech, /Coachmen/i);

  for (const said of [
    "anything in our lot that has an 8.9 in it",
    "any RVs in our inventory that had a 400 horsepower",
  ]) {
    assert.equal(decideVoiceWebResearch({ transcript: said }).action, "pass", said);
  }
});

test("a sentence is read off the lot sheet, not turned into another coach", () => {
  const snap = units();
  const looking = searchLot(snap.units, {
    query: "I'm just looking at Class A diesels",
  });
  assert.equal(looking.matched, 49);
  assert.equal(looking.counts.body_type["Class A Diesel"], 49);
  assert.equal(looking.did_you_mean, undefined);

  const said = searchLot(snap.units, {
    utterance:
      "you're probably right about a hundred Class As. I'm just looking at Class A diesels",
    body_type: "Class A",
  });
  assert.equal(said.matched, 49);
  assert.equal(said.did_you_mean, undefined);
  assert.doesNotMatch(said.summary, /Light/);

  const again = searchLot(snap.units, {
    utterance: "No, try it one more time. The used Class A diesels.",
    body_type: "Class A Diesel",
    condition: "used",
  });
  assert.equal(again.matched, 45);
  assert.equal(again.counts.condition.Used, 45);
  assert.equal(again.did_you_mean, undefined);
  assert.match(again.summary, /Matching units: 45/);

  const hundred = searchLot(snap.units, {
    query: "you're probably right about a hundred Class As",
  });
  assert.equal(hundred.matched, 106);
  assert.equal(hundred.did_you_mean, undefined);

  const byType = searchLot(snap.units, { query: "diesels sort by type" });
  assert.equal(byType.matched, 160);
  assert.match(byType.summary, /By type:/);
  assert.match(byType.summary, /49 Class A Diesel/);
  assert.equal(byType.units[0]?.body_type, "Class A Diesel");
});

test("a broad count is the whole lot, not a name search (#556 regression)", () => {
  const snap = units();
  const total = snap.units.length;
  assert.ok(total > 0);
  const asks = [
    "how many RVs do we have on the lot right now",
    "how many RVs on the lot",
    "how many RVs total",
    "how many units",
    "how many coaches",
  ];
  for (const ask of asks) {
    assert.equal(searchLot(snap.units, { query: ask }).matched, total, `searchLot ${ask}`);
    for (const args of [{}, { query: "RVs" }, { query: ask }]) {
      const answer = answerQueryLotFromSnapshot(snap, { ...args }, null, ask);
      assert.equal(answer.matched, total, `${JSON.stringify(args)} + ${ask}`);
      assert.equal(answer.none, false, ask);
      assert.doesNotMatch(answer.speech, /No own-lot hit/, ask);
    }
  }
});

test("a broad count after a Lineage question drops the Lineage filter", () => {
  const snap = units();
  const lineage = answerQueryLotFromSnapshot(
    snap,
    { make: "Grand Design", model: "Lineage" },
    null,
    "how many Grand Design Lineages do we have",
  );
  assert.equal(lineage.matched, 27);
  assert.equal(lineage.lotMemory?.filter.model, "Lineage");
  for (const args of [{}, { query: "RVs" }]) {
    const total = answerQueryLotFromSnapshot(
      snap,
      { ...args },
      lineage.lotMemory,
      "how many RVs do we have on the lot right now",
    );
    assert.equal(total.matched, snap.units.length, JSON.stringify(args));
  }
});

test("a follow-up after a Lineage question keeps Lineage", () => {
  const snap = units();
  const lineage = answerQueryLotFromSnapshot(
    snap,
    { make: "Grand Design", model: "Lineage" },
    null,
    "how many Grand Design Lineages do we have",
  );
  assert.equal(lineage.matched, 27);
  const follow = answerQueryLotFromSnapshot(
    snap,
    {},
    lineage.lotMemory,
    "how many of those are new",
  );
  assert.equal(follow.matched, 27);
  assert.ok(follow.units.every((unit) => /lineage/i.test(unit.model)));
  const fresno = answerQueryLotFromSnapshot(
    snap,
    {},
    lineage.lotMemory,
    "how many of them are at Fresno",
  );
  assert.ok(fresno.matched > 0 && fresno.matched < 27);
  assert.ok(fresno.units.every((unit) => /lineage/i.test(unit.model)));
});

test("Grand Design Lineage stays 27 and Cruiser RV still finds Cruiser units", () => {
  const snap = units();
  assert.equal(searchLot(snap.units, { query: "Grand Design Lineage" }).matched, 27);
  const cruiser = snap.units.filter((unit) => /^cruiser rv$/i.test(unit.make || ""));
  assert.ok(cruiser.length > 0);
  for (const args of [
    { query: "Cruiser RV" },
    { query: "how many Cruiser RVs do we have" },
    { make: "Cruiser RV" },
  ]) {
    const hit = searchLot(snap.units, { ...args, limit: 24 });
    assert.ok(hit.matched >= cruiser.length && hit.matched < 50, JSON.stringify(args));
    const stocks = new Set(hit.units.map((unit) => unit.stock_number));
    for (const unit of cruiser) assert.ok(stocks.has(unit.stock_number), JSON.stringify(args));
  }
});

test("a make that is not on the lot still says none", () => {
  const snap = units();
  const miss = searchLot(snap.units, { query: "how many Newells do we have" });
  assert.equal(miss.matched, 0);
});

test("400 hp still reads the horsepower figure off the sheet", () => {
  const snap = units();
  const phrased = searchLot(snap.units, {
    query: "any RVs in our inventory that had a 400 horsepower",
  });
  const short = searchLot(snap.units, { query: "400 hp" });
  assert.equal(short.matched, phrased.matched);
  assert.ok(short.matched > 0 && short.matched < snap.units.length);
});

test("category words are body filters, not a fuzzy name", () => {
  const snap = units();
  const total = snap.units.length;
  const trailers = searchLot(snap.units, { query: "how many trailers" });
  assert.equal(trailers.matched, 1034);
  assert.equal(trailers.lot_total, total);
  assert.match(
    trailers.summary,
    /Matching units: 1034\. 569 travel trailers, 251 fifth wheels, 94 travel trailer toy haulers, 87 fifth wheel toy haulers, plus 33 others\./,
  );
  assert.match(trailers.summary, /Top: \d{4} .+ stk \S+, \$[\d,]+/);
  assert.equal(trailers.did_you_mean, undefined);
  assert.equal(searchLot(snap.units, { query: "towables" }).matched, 1034);
  assert.equal(searchLot(snap.units, { query: "pull behinds" }).matched, 1034);

  const fivers = searchLot(snap.units, { query: "fivers" });
  assert.equal(fivers.matched, 251);
  assert.equal(fivers.counts.body_type["Fifth Wheel"], 251);
  assert.equal(fivers.did_you_mean, undefined);
  assert.doesNotMatch(fivers.summary, /River/i);
  assert.equal(searchLot(snap.units, { query: "fifth wheels" }).matched, 251);
  assert.equal(searchLot(snap.units, { query: "5th wheels" }).matched, 251);

  const popups = searchLot(snap.units, { query: "pop ups" });
  assert.equal(popups.matched, 3);
  assert.equal(popups.did_you_mean, undefined);
  assert.equal(searchLot(snap.units, { query: "popups" }).matched, 3);

  const toys = searchLot(snap.units, { query: "toy haulers" });
  assert.equal(toys.matched, 181);
  assert.equal(toys.counts.body_type["Travel Trailer Toy Hauler"], 94);
  assert.equal(toys.counts.body_type["Fifth Wheel Toy Hauler"], 87);

  const gas = searchLot(snap.units, { query: "Class A gas" });
  assert.equal(gas.matched, 57);
  assert.equal(gas.counts.body_type["Class A"], 57);
  assert.equal(gas.counts.body_type["Class A Diesel"], undefined);

  const pushers = searchLot(snap.units, { query: "diesel pushers" });
  assert.equal(pushers.matched, 49);
  assert.equal(pushers.counts.body_type["Class A Diesel"], 49);
  assert.equal(searchLot(snap.units, { query: "Class A diesel" }).matched, 49);

  for (const ask of ["units", "coaches", "how many units", "how many coaches"]) {
    const hit = searchLot(snap.units, { query: ask });
    assert.equal(hit.matched, total, ask);
    assert.equal(hit.did_you_mean, undefined, ask);
  }
  assert.equal(searchLot(snap.units, { query: "how many RVs on the lot" }).matched, total);
  assert.equal(searchLot(snap.units, { query: "Lineage" }).matched, 27);
  assert.ok(searchLot(snap.units, { query: "Cruiser RV" }).matched >= 9);
  assert.equal(searchLot(snap.units, { query: "how many Newells" }).matched, 0);
});

test("follow-ups keep fuel, store, and the coach already named", () => {
  const snap = units();
  const usedAll = searchLot(snap.units, { query: "used" }).matched;
  const fife = answerQueryLotFromSnapshot(snap, { query: "diesels in Fife" }, null);
  assert.equal(fife.matched, 14);
  assert.equal(fife.lot_total, snap.units.length);
  assert.match(fife.filter_label, /diesel/i);
  assert.match(fife.filter_label, /fife/i);
  assert.doesNotMatch(fife.filter_label, /^all units$/);
  assert.match(fife.summary || "", /Top: /);
  const usedFife = answerQueryLotFromSnapshot(snap, {}, fife.lotMemory, "used ones");
  assert.ok(usedFife.matched > 0 && usedFife.matched < usedAll);
  assert.notEqual(usedFife.matched, usedAll);
  assert.ok(usedFife.units.every((unit) => /fife/i.test(unit.location)));
  assert.equal(usedFife.counts?.condition.Used, usedFife.matched);
  assert.match(usedFife.filter_label, /diesel/i);
  assert.match(usedFife.filter_label, /fife/i);
  assert.match(usedFife.filter_label, /used/i);

  const diesels = answerQueryLotFromSnapshot(snap, { query: "diesels" }, null);
  assert.equal(diesels.matched, 160);
  const cheap = answerQueryLotFromSnapshot(snap, {}, diesels.lotMemory, "the cheapest one");
  assert.equal(cheap.units[0]?.price, 29995);
  assert.ok(
    cheap.units[0]?.stock_number === "28960E" || cheap.units[0]?.stock_number === "UPD9457A",
  );
  assert.match(cheap.summary || "", new RegExp(`stk ${cheap.units[0]?.stock_number}`));
  assert.match(cheap.summary || "", /\$29,995/);
  assert.doesNotMatch(cheap.summary || "", /Travel Trailer/);
  const top = snap.units.find((unit) => unit.stock_number === cheap.units[0]?.stock_number);
  const fuel = `${top?.printed?.fuel_type || ""} ${top?.printed?.fuel || ""} ${top?.printed?.engine || ""} ${top?.body_type || ""}`.toLowerCase();
  assert.match(fuel, /\bdiesel\b/);

  const lineage = answerQueryLotFromSnapshot(snap, { query: "Lineage" }, null);
  assert.equal(lineage.matched, 27);
  assert.match(lineage.lotMemory?.filter.model || "", /lineage/i);
  const usedLineage = answerQueryLotFromSnapshot(
    snap,
    {},
    lineage.lotMemory,
    "how many of those are used",
  );
  assert.match(usedLineage.filter_label, /lineage/i);
  assert.match(usedLineage.filter_label, /used/i);
  assert.notEqual(usedLineage.matched, usedAll);
  assert.ok(usedLineage.matched < 27);
  const cheapestLineage = answerQueryLotFromSnapshot(
    snap,
    {},
    lineage.lotMemory,
    "the cheapest one",
  );
  assert.equal(cheapestLineage.matched, 27);
  assert.ok(cheapestLineage.units.every((unit) => /lineage/i.test(unit.model)));
  assert.match(cheapestLineage.summary || "", /Top: /);
  assert.match(cheapestLineage.summary || "", /\$/);
  assert.doesNotMatch(cheapestLineage.filter_label, /^all units$/);

  for (const said of ["how many trailers", "fivers", "the cheapest one", "used ones"]) {
    assert.equal(decideVoiceWebResearch({ transcript: said, lotFollowUp: true }).action, "pass", said);
  }
});

test("12-foot garage in a fifth wheel is fifth-wheel toy haulers, not a travel trailer", () => {
  const snap = units();
  const hit = searchLot(snap.units, { query: "a 12-foot garage in a fifth wheel" });
  assert.equal(hit.applied.body_type, "Fifth Wheel Toy Hauler");
  assert.equal(hit.matched, 22);
  assert.ok(hit.matched < 88);
  assert.notEqual(hit.matched, 256);
  assert.ok(hit.units.every((unit) => unit.body_type === "Fifth Wheel Toy Hauler"));
  assert.ok(!hit.units.some((unit) => unit.stock_number === "43377A"));
  assert.match(hit.summary, /Skipped 37 with no garage length on the sheet/);
  assert.doesNotMatch(hit.summary, /^None\./);
  const follow = answerQueryLotFromSnapshot(
    snap,
    { query: "those aren't toy haulers" },
    hit.applied
      ? answerQueryLotFromSnapshot(snap, { query: "a 12-foot garage in a fifth wheel" }, null).lotMemory
      : null,
    "those aren't toy haulers",
  );
  assert.equal(follow.lotMemory?.filter.bodyType, "Fifth Wheel");
  assert.ok(follow.matched > 0);
  assert.ok(follow.units.every((unit) => unit.body_type === "Fifth Wheel"));
  assert.ok(!follow.units.some((unit) => /toy hauler/i.test(unit.body_type)));
  assert.ok(!follow.units.some((unit) => unit.body_type === "Travel Trailer"));
});

test("those aren't toy haulers drops toy haulers", () => {
  const snap = units();
  const fifth = answerQueryLotFromSnapshot(snap, { query: "fifth wheels" }, null, "fifth wheels");
  assert.equal(fifth.matched, 251);
  const kept = answerQueryLotFromSnapshot(
    snap,
    { body_type: "Fifth Wheel" },
    fifth.lotMemory,
    "those aren't toy haulers",
  );
  assert.equal(kept.matched, 251);
  assert.equal(kept.lotMemory?.filter.bodyType, "Fifth Wheel");
  assert.ok(kept.units.every((unit) => unit.body_type === "Fifth Wheel"));
  assert.ok(!kept.units.some((unit) => /toy hauler/i.test(unit.body_type)));
});

test("Class A around 50,000 miles is the odometer, not a price, and skips a blank sheet", () => {
  const snap = units();
  const hit = searchLot(snap.units, {
    query: "Class A around 50,000 miles",
    utterance: "Class A around 50,000 miles",
    price_min: 42500,
    price_max: 57500,
    body_type: "Class C",
  });
  assert.equal(hit.matched, 11);
  assert.equal(hit.applied.miles_min, 42500);
  assert.equal(hit.applied.miles_max, 57500);
  assert.equal(hit.applied.price_min, undefined);
  assert.equal(hit.applied.price_max, undefined);
  assert.equal(hit.applied.miles_skipped, 27);
  assert.equal(hit.applied.body_type, "Class A");
  assert.ok(hit.units.some((unit) => unit.stock_number === "46343A"));
  assert.ok(
    hit.units.every(
      (unit) => unit.body_type === "Class A" || unit.body_type === "Class A Diesel",
    ),
  );
  assert.match(hit.summary, /42,500 to 57,500 miles on the sheet/);
  assert.match(hit.summary, /Skipped 27 with no mileage on the sheet/);
  assert.doesNotMatch(hit.summary, /price band/i);
  assert.doesNotMatch(hit.summary, /^None\./);
});

test("inventory, in stock, on the lot, and do we have are the same full count", () => {
  const snap = units();
  const total = snap.units.length;
  const phrases = [
    "How many RVs we have in inventory",
    "how many RVs in stock",
    "how many RVs on the lot",
    "do we have",
  ];
  for (const phrase of phrases) {
    const hit = answerQueryLotFromSnapshot(
      snap,
      { query: phrase, model: "RV", price_min: 10000, body_type: "Class B" },
      null,
      phrase,
    );
    assert.equal(hit.matched, total, phrase);
    assert.equal(hit.none, false, phrase);
    assert.doesNotMatch(hit.summary || "", /^None\./, phrase);
  }
});

test("spoken lot line names at most 3 units and does not open a hit with None", () => {
  const snap = units();
  const fifth = answerQueryLotFromSnapshot(snap, { query: "fifth wheels" }, null);
  const spoken = spokenLotPayload(fifth);
  assert.equal(spoken.matched, 251);
  assert.equal(spoken.units.length, 3);
  assert.match(spoken.speech, /I can name more/);
  assert.doesNotMatch(spoken.speech, /^None\./);
  const glued = spokenLotPayload({
    ...fifth,
    summary: "None. Matching units: 8 Keystone Montana High Country.",
    speech: "None. Matching units: 8 Keystone Montana High Country.",
  });
  assert.doesNotMatch(glued.speech, /^None\./);
  assert.match(glued.speech, /Matching units: 8/);
  assert.doesNotMatch(spoken.speech, /\bstk\b/i);
});

test("family of five around 30 foot and $50,000 names a coach, not None", () => {
  const snap = units();
  const ask =
    "Hi, I'm trying to find a family of five a 30-foot motorhome, around 30-foot motorhome, around $50,000 that sleeps five. Do you have any recommendations in our inventory?";
  const hit = searchLot(snap.units, {
    query: ask,
    utterance: ask,
    miles_min: 0,
    miles_max: 100000,
    price_min: 0,
    price_max: 100000,
    body_type: "Class C",
  });
  assert.ok(hit.matched > 0, hit.summary);
  assert.equal(hit.none, false);
  assert.equal(hit.applied.miles_min, undefined);
  assert.equal(hit.applied.miles_max, undefined);
  assert.equal(hit.applied.price_min, 42500);
  assert.equal(hit.applied.price_max, 57500);
  assert.equal(hit.applied.length_ft_min, 28);
  assert.equal(hit.applied.length_ft_max, 32);
  assert.equal(hit.applied.body_type, "motorhome");
  assert.ok(hit.units.every((unit) => /class [abc]/i.test(unit.body_type)));
  assert.ok(!hit.units.some((unit) => unit.stock_number === "43377A"));
  assert.doesNotMatch(hit.summary, /^None\./);
  assert.doesNotMatch(hit.summary, /miles on the sheet/i);
  const top = hit.units[0]!;
  assert.ok(top.year && top.make && top.model);
  assert.ok((top.price ?? 0) >= 42500 && (top.price ?? 0) <= 57500);
  assert.ok(top.location);
  const spoken = spokenLotPayload(hit);
  assert.match(spoken.speech, new RegExp(top.year));
  assert.match(spoken.speech, new RegExp(top.make.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(spoken.speech, /\$[\d,]+/);
  assert.match(spoken.speech, new RegExp(top.location.split(/\s+/)[0]!));
  assert.doesNotMatch(spoken.speech, /^None\./);
  assert.doesNotMatch(spoken.speech, /\bmiles\b/i);
  assert.doesNotMatch(spoken.speech, /\bstk\b/i);
  assert.doesNotMatch(spoken.speech, /No length on file/i);

  const pricedAsk = "do we have a 30 foot motorhome around $50,000";
  const priced = answerQueryLotFromSnapshot(
    snap,
    { query: pricedAsk, model: "RV", body_type: "Travel Trailer" },
    null,
    pricedAsk,
  );
  assert.notEqual(priced.matched, snap.units.length);
  assert.ok(priced.matched > 0);
  assert.equal(priced.lotMemory?.filter.minPrice, 42500);
  assert.equal(priced.lotMemory?.filter.maxPrice, 57500);
});

test("Class A motorhomes around 50,000 miles stays Class A and ±15 percent", () => {
  const snap = units();
  const ask = "Do we have any Class A motorhomes with around 50,000 miles on them?";
  const hit = searchLot(snap.units, {
    query: ask,
    utterance: ask,
    price_min: 42500,
    price_max: 57500,
    limit: 24,
  });
  assert.equal(hit.matched, 11, hit.summary);
  assert.equal(hit.applied.body_type, "Class A");
  assert.equal(hit.applied.miles_min, 42500);
  assert.equal(hit.applied.miles_max, 57500);
  assert.equal(hit.applied.price_min, undefined);
  assert.equal(hit.applied.price_max, undefined);
  const forza = hit.units.find((unit) => unit.stock_number === "46343A");
  assert.ok(forza, hit.units.map((unit) => unit.stock_number).join(","));
  assert.equal(forza.mileage, 55892);
  assert.ok((forza.price ?? 0) > 100000);
  assert.ok(
    hit.units.every(
      (unit) => unit.body_type === "Class A" || unit.body_type === "Class A Diesel",
    ),
  );
  assert.doesNotMatch(hit.summary, /^None\./);
});

test("slides, generator, solar, kitchen, and engine filter the sheet", () => {
  const snap = units();
  const slideOf = (unit: (typeof snap.units)[number]) =>
    unit.slides ??
    (unit.printed?.number_of_slideouts
      ? Number(String(unit.printed.number_of_slideouts).replace(/[^\d]/g, ""))
      : null);
  const two = snap.units.filter((unit) => slideOf(unit) === 2).length;
  const none = snap.units.filter((unit) => slideOf(unit) === 0).length;
  assert.ok(two > 0 && none > 0);
  assert.equal(searchLot(snap.units, { query: "2 slides" }).matched, two);
  assert.equal(searchLot(snap.units, { query: "no slides" }).matched, none);
  assert.equal(
    searchLot(snap.units, { query: "at least 2 slides" }).matched,
    snap.units.filter((unit) => (slideOf(unit) ?? -1) >= 2).length,
  );

  const generatorText = (unit: (typeof snap.units)[number]) =>
    `${unit.generator || ""} ${unit.printed?.generator || ""} ${unit.printed?.generator_type || ""}`;
  const gens = snap.units.filter((unit) => generatorText(unit).trim()).length;
  assert.ok(gens > 0);
  assert.equal(searchLot(snap.units, { query: "with a generator" }).matched, gens);
  const dieselGens = snap.units.filter((unit) => /diesel/i.test(generatorText(unit))).length;
  assert.ok(dieselGens > 0 && dieselGens < gens);
  assert.equal(searchLot(snap.units, { query: "diesel generator" }).matched, dieselGens);
  const dieselFuel = searchLot(snap.units, { query: "diesel" }).matched;
  assert.ok(dieselGens < dieselFuel);

  const featureText = (unit: (typeof snap.units)[number]) =>
    `${unit.printed?.floorplan_feature || ""} ${unit.printed?.flags || ""}`;
  const solar = snap.units.filter((unit) => /\bsolar\b/i.test(featureText(unit))).length;
  assert.ok(solar > 0);
  assert.equal(searchLot(snap.units, { query: "solar" }).matched, solar);
  const kitchen = snap.units.filter((unit) => /outdoor kitchen/i.test(featureText(unit))).length;
  assert.ok(kitchen > 0);
  assert.equal(searchLot(snap.units, { query: "outdoor kitchen" }).matched, kitchen);

  const cummins = snap.units.filter((unit) => /cummins/i.test(unit.printed?.engine || "")).length;
  assert.ok(cummins > 0);
  assert.equal(searchLot(snap.units, { query: "Cummins" }).matched, cummins);
  const stroke = snap.units.filter((unit) => /power stroke/i.test(unit.printed?.engine || "")).length;
  assert.ok(stroke > 0);
  assert.equal(searchLot(snap.units, { query: "Power Stroke" }).matched, stroke);

  const king = searchLot(snap.units, { query: "king bed" });
  assert.ok(king.matched > 0 && king.matched < snap.units.length);
});

test("40 foot and under is a ceiling, and the full list is not a Full House", () => {
  const snap = units();
  const ask =
    "What about an older couple looking for a 2020 or newer diesel pusher that sleeps two, that's 40 foot and under?";
  const hit = answerQueryLotFromSnapshot(
    snap,
    {
      query: ask,
      length_ft_min: 38,
      length_ft_max: 42,
      body_type: "Fifth Wheel",
      model: "Full House",
      year_min: 2000,
      year_max: 2000,
    },
    null,
    ask,
  );
  assert.equal(hit.lotMemory?.filter.bodyType, "Class A Diesel");
  assert.equal(hit.lotMemory?.filter.lengthFtMax, 40);
  assert.equal(hit.lotMemory?.filter.lengthFtMin, undefined);
  assert.equal(hit.lotMemory?.filter.yearMin, 2020);
  assert.equal(hit.lotMemory?.filter.yearMax, undefined);
  assert.ok(hit.matched > 0, hit.summary);
  assert.equal(hit.none, false);
  assert.doesNotMatch(hit.summary || "", /^None\./);
  assert.match(hit.summary || "", /40 foot and under/);
  assert.doesNotMatch(hit.summary || "", /38 to 42/);
  assert.ok(
    hit.units.every((unit) => unit.length_ft == null || unit.length_ft <= 40),
    hit.units.map((unit) => `${unit.stock_number}:${unit.length_ft}`).join(","),
  );
  assert.ok(hit.units.every((unit) => Number(unit.year) >= 2020));
  assert.ok(hit.units.every((unit) => unit.body_type === "Class A Diesel"));
  assert.ok(!hit.units.some((unit) => /full house/i.test(unit.model)));

  const corrected =
    "2000 and newer, I mean 2020 or newer diesel pusher, 40 foot and under";
  const meant = searchLot(snap.units, { query: corrected, utterance: corrected });
  assert.equal(meant.applied.year_min, 2020);
  assert.equal(meant.applied.year_max, undefined);
  assert.equal(meant.applied.length_ft_max, 40);
  assert.equal(meant.applied.length_ft_min, undefined);

  const around = searchLot(snap.units, {
    query: "diesel pusher around 40 foot",
    utterance: "diesel pusher around 40 foot",
  });
  assert.equal(around.applied.length_ft_min, 38);
  assert.equal(around.applied.length_ft_max, 42);

  const under = searchLot(snap.units, {
    query: "diesel pusher under 40 feet",
    utterance: "diesel pusher under 40 feet",
  });
  assert.equal(under.applied.length_ft_max, 40);
  assert.equal(under.applied.length_ft_min, undefined);

  const list = answerQueryLotFromSnapshot(
    snap,
    {
      query: "Full House",
      model: "Full House",
      body_type: "Fifth Wheel Toy Hauler",
      length_ft_min: 38,
      length_ft_max: 42,
    },
    hit.lotMemory,
    "Yeah, give me, give, give me the full list.",
  );
  assert.equal(list.matched, hit.matched, list.summary);
  assert.equal(list.lotMemory?.filter.bodyType, "Class A Diesel");
  assert.equal(list.lotMemory?.filter.lengthFtMax, 40);
  assert.equal(list.lotMemory?.filter.lengthFtMin, undefined);
  assert.ok(!list.units.some((unit) => /full house/i.test(unit.model)));
  assert.doesNotMatch(list.summary || "", /^None\./);
  if (hit.matched >= 2) {
    assert.match(list.summary || "", /Named:/);
    const second = hit.units[1];
    if (second?.make) assert.match(list.summary || "", new RegExp(second.make));
  }
});

test("a misspoken model stays on the sheet coach and does not open the new book", () => {
  const snap = units();
  const sparks = "UPS9882";
  const asada = searchLot(snap.units, { query: "Asada 5" });
  assert.equal(asada.matched, 1);
  assert.equal(asada.units[0]?.stock_number, sparks);
  assert.equal(asada.did_you_mean, "Isata");
  assert.match(
    asada.summary,
    /One close match\. 2018 Dynamax Isata 5 30FW, \$129,995, Sparks, available\. Sheet says Isata, not Asada\./,
  );

  const ascenta = searchLot(snap.units, { query: "Dynamax Ascenta" });
  assert.equal(ascenta.matched, 1);
  assert.equal(ascenta.units[0]?.stock_number, sparks);
  assert.equal(ascenta.did_you_mean, "Isata");
  assert.match(
    ascenta.summary,
    /One close match\. 2018 Dynamax Isata 5 30FW, \$129,995, Sparks, available\. Sheet says Isata, not Ascenta\./,
  );

  for (const query of ["Isada", "Esada"]) {
    const hit = searchLot(snap.units, { query });
    assert.equal(hit.did_you_mean, "Isata", query);
    assert.ok(hit.units.some((unit) => unit.stock_number === sparks), query);
    assert.ok(hit.units.every((unit) => /isata/i.test(unit.model)), query);
    assert.notEqual(hit.matched, 752, query);
  }

  const exact = searchLot(snap.units, { query: "Dynamax Isata 5" });
  assert.equal(exact.matched, 1);
  assert.equal(exact.units[0]?.stock_number, sparks);
  assert.equal(exact.did_you_mean, undefined);

  const seriesWord = searchLot(snap.units, { query: "Isata 5 series" });
  assert.equal(seriesWord.matched, 1);
  assert.equal(seriesWord.units[0]?.stock_number, sparks);
  assert.equal(seriesWord.did_you_mean, undefined);

  const bareSeries = searchLot(snap.units, { query: "5 series" });
  assert.notEqual(bareSeries.did_you_mean, "Terry");
  assert.notEqual(bareSeries.did_you_mean, "Wolf");
  assert.notEqual(bareSeries.did_you_mean, "Series");
  assert.ok(
    bareSeries.units.some((unit) => unit.stock_number === sparks),
    bareSeries.summary,
  );

  const inSparks = searchLot(snap.units, { query: "Asada 5 in Sparks" });
  assert.equal(inSparks.matched, 1);
  assert.equal(inSparks.units[0]?.stock_number, sparks);
  assert.equal(inSparks.did_you_mean, "Isata");

  const voiced = searchLot(snap.units, { query: "Do we have an Asada 5 in stock?" });
  assert.equal(voiced.matched, 1);
  assert.equal(voiced.units[0]?.stock_number, sparks);

  const stuffed = searchLot(snap.units, {
    query: "Asada 5",
    condition: "new",
    status: "available",
    location: "Mesa",
  });
  assert.equal(stuffed.matched, 1);
  assert.equal(stuffed.units[0]?.stock_number, sparks);
  assert.notEqual(stuffed.matched, 752);

  const unknown = searchLot(snap.units, {
    query: "Zzqxplinth",
    condition: "new",
    status: "available",
  });
  assert.equal(unknown.matched, 0);
  assert.equal(unknown.none, true);
  assert.equal(unknown.did_you_mean, undefined);

  const saidNew = searchLot(snap.units, { query: "new Qwertyplugh" });
  assert.equal(saidNew.matched, 0);
  assert.equal(saidNew.none, true);
  assert.notEqual(saidNew.matched, 752);

  const newAscenta = searchLot(snap.units, { query: "new Ascenta" });
  assert.equal(newAscenta.matched, 0);
  assert.equal(newAscenta.none, true);

  const junkMake = searchLot(snap.units, { query: "Dynamax Zzqxplinth" });
  assert.equal(junkMake.matched, 0);
  assert.equal(junkMake.none, true);

  const fresh = searchLot(snap.units, { query: "How many new units" });
  const newCount = snap.units.filter((unit) => /^new$/i.test(unit.condition || "")).length;
  assert.equal(fresh.matched, newCount);
  assert.equal(searchLot(snap.units, { query: "new available" }).matched, 752);
});

test("a 5 series follow-up stays on Isata, and yes does not open the lot", () => {
  const snap = units();
  const sparks = "UPS9882";
  const first = answerQueryLotFromSnapshot(
    snap,
    { query: "Isatas" },
    null,
    "Do we have any Isatas in stock?",
  );
  assert.equal(first.matched, 3);
  const next = answerQueryLotFromSnapshot(
    snap,
    { query: "5 series" },
    first.lotMemory,
    "Are any of those a 5 or 5 series?",
  );
  assert.equal(next.matched, 1, next.summary);
  assert.equal(next.units[0]?.stock_number, sparks);
  assert.equal(next.did_you_mean, undefined);

  const yes = answerQueryLotFromSnapshot(
    snap,
    { query: "Yes." },
    { filter: {}, limit: 12 },
    "Yes.",
  );
  assert.equal(yes.matched, 0);
  assert.match(yes.speech, /does not open the whole lot/);
  assert.notEqual(yes.matched, snap.units.length);

  const plural = searchLot(snap.units, { query: "Dynamax Isata 5s" });
  assert.equal(plural.matched, 1, plural.summary);
  assert.equal(plural.units[0]?.stock_number, sparks);
  assert.equal(plural.did_you_mean, undefined);

  const told = answerQueryLotFromSnapshot(
    snap,
    {},
    next.lotMemory,
    "You just told me we had one.",
  );
  assert.equal(told.matched, 1, told.summary);
  assert.equal(told.units[0]?.stock_number, sparks);
  assert.equal(told.did_you_mean, undefined);

  const roadtrek = answerQueryLotFromSnapshot(snap, { query: "Roadtrek" }, null, "Roadtrek");
  assert.ok((roadtrek.matched ?? 0) > 0);
  const stockOfThose = answerQueryLotFromSnapshot(
    snap,
    { query: "those" },
    roadtrek.lotMemory,
    "Can you tell me if we have any of those in stock?",
    "I'll pull the details on that 2018 Dynamax Isata 5. It's a Super C on the Ram 5500.",
  );
  assert.equal(stockOfThose.matched, 1, stockOfThose.summary);
  assert.equal(stockOfThose.units[0]?.stock_number, sparks);
  assert.doesNotMatch(stockOfThose.summary || "", /Roadtrek/);
});
