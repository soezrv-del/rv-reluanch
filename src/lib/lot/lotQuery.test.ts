import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "../rvgrok/lotMemory.ts";
import { QUERY_LOT_TOOL } from "../rvgrok/liveVoice.ts";
import { decideVoiceWebResearch } from "../rvgrok/voiceWeb.ts";
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

test("used Super Cs are 12 and Super Cs are 27 Class Super C", () => {
  const snap = units();
  const used = searchLot(snap.units, { query: "used Super Cs" });
  assert.equal(used.matched, 12);
  assert.equal(used.counts.body_type["Class Super C"], 12);
  assert.equal(used.counts.condition.Used, 12);

  const typed = searchLot(snap.units, {
    body_type: "Class Super C",
    condition: "used",
  });
  assert.equal(typed.matched, 12);

  const all = searchLot(snap.units, { query: "Super Cs" });
  assert.equal(all.matched, 27);
  assert.equal(all.counts.body_type["Class Super C"], 27);
  assert.equal(all.counts.condition.New, 15);
  assert.equal(all.counts.condition.Used, 12);
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

test("Linage suggests Lineage instead of a bare zero", () => {
  const hit = searchLot(units().units, { query: "Linage" });
  assert.equal(hit.matched, 0);
  assert.equal(hit.did_you_mean, "Lineage");
  assert.match(hit.summary, /Did you mean Lineage/);
  assert.doesNotMatch(hit.summary, /stk /);
});

test("how about used Super Cs after a Lineage question still calls the tool and returns 12", () => {
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
  assert.equal(follow.matched, 12);
  assert.equal(follow.none, false);
  assert.equal(follow.counts?.body_type["Class Super C"], 12);
  assert.equal(follow.counts?.condition.Used, 12);
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

  assert.equal(searchLot(snap.units, { query: "diesels" }).matched, 161);
  const typo = searchLot(snap.units, { query: "deisel" });
  assert.equal(typo.matched, 161);
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
  assert.equal(follow.matched, 12);

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
  assert.equal(looking.matched, 48);
  assert.equal(looking.counts.body_type["Class A Diesel"], 48);
  assert.equal(looking.did_you_mean, undefined);

  const said = searchLot(snap.units, {
    utterance:
      "you're probably right about a hundred Class As. I'm just looking at Class A diesels",
    body_type: "Class A",
  });
  assert.equal(said.matched, 48);
  assert.equal(said.did_you_mean, undefined);
  assert.doesNotMatch(said.summary, /Light/);

  const again = searchLot(snap.units, {
    utterance: "No, try it one more time. The used Class A diesels.",
    body_type: "Class A Diesel",
    condition: "used",
  });
  assert.equal(again.matched, 44);
  assert.equal(again.counts.condition.Used, 44);
  assert.equal(again.did_you_mean, undefined);
  assert.match(again.summary, /Matching units: 44/);

  const hundred = searchLot(snap.units, {
    query: "you're probably right about a hundred Class As",
  });
  assert.equal(hundred.matched, 108);
  assert.equal(hundred.did_you_mean, undefined);

  const byType = searchLot(snap.units, { query: "diesels sort by type" });
  assert.equal(byType.matched, 161);
  assert.match(byType.summary, /By type:/);
  assert.match(byType.summary, /48 Class A Diesel/);
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
  assert.equal(trailers.matched, 1053);
  assert.equal(trailers.lot_total, total);
  assert.match(
    trailers.summary,
    /Matching units: 1053\. 582 travel trailers, 256 fifth wheels, 94 travel trailer toy haulers, 88 fifth wheel toy haulers, plus 33 others\./,
  );
  assert.match(trailers.summary, /Top: \d{4} .+ stk \S+, \$[\d,]+/);
  assert.equal(trailers.did_you_mean, undefined);
  assert.equal(searchLot(snap.units, { query: "towables" }).matched, 1053);
  assert.equal(searchLot(snap.units, { query: "pull behinds" }).matched, 1053);

  const fivers = searchLot(snap.units, { query: "fivers" });
  assert.equal(fivers.matched, 256);
  assert.equal(fivers.counts.body_type["Fifth Wheel"], 256);
  assert.equal(fivers.did_you_mean, undefined);
  assert.doesNotMatch(fivers.summary, /River/i);
  assert.equal(searchLot(snap.units, { query: "fifth wheels" }).matched, 256);
  assert.equal(searchLot(snap.units, { query: "5th wheels" }).matched, 256);

  const popups = searchLot(snap.units, { query: "pop ups" });
  assert.equal(popups.matched, 3);
  assert.equal(popups.did_you_mean, undefined);
  assert.equal(searchLot(snap.units, { query: "popups" }).matched, 3);

  const toys = searchLot(snap.units, { query: "toy haulers" });
  assert.equal(toys.matched, 182);
  assert.equal(toys.counts.body_type["Travel Trailer Toy Hauler"], 94);
  assert.equal(toys.counts.body_type["Fifth Wheel Toy Hauler"], 88);

  const gas = searchLot(snap.units, { query: "Class A gas" });
  assert.equal(gas.matched, 60);
  assert.equal(gas.counts.body_type["Class A"], 60);
  assert.equal(gas.counts.body_type["Class A Diesel"], undefined);

  const pushers = searchLot(snap.units, { query: "diesel pushers" });
  assert.equal(pushers.matched, 48);
  assert.equal(pushers.counts.body_type["Class A Diesel"], 48);
  assert.equal(searchLot(snap.units, { query: "Class A diesel" }).matched, 48);

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
  assert.equal(fife.matched, 20);
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
  assert.equal(diesels.matched, 161);
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
