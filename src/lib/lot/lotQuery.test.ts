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

test("Linage returns the Lineage coaches flagged as a close match", () => {
  const snap = units();
  const hit = searchLot(snap.units, { query: "Linage" });
  assert.equal(hit.matched, 27);
  assert.equal(hit.none, false);
  assert.match(hit.close || "", /lineage/i);
  assert.match(hit.summary, /Close match/i);
  assert.match(hit.summary, /27/);
  assert.equal(hit.did_you_mean, undefined);
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
  assert.equal(searchLotUnits(snap.units, "freightliner").length, 34);
  assert.equal(searchLotUnits(snap.units, "deisel").length, 161);
  const murphy = searchLot(snap.units, { query: "murphy bed" });
  assert.equal(murphy.matched, 9);
  assert.ok(murphy.units.some((unit) => unit.stock_number === "UPB9941"));
  assert.ok(murphy.units.some((unit) => /murphy suite/i.test(unit.trim)));

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
  assert.equal(diesels.matched, 161);
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

  assert.equal(
    searchLot(snap.units, { utterance: "deisel", body_type: "Class A" }).matched,
    161,
  );
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
