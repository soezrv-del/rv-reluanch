import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { answerQueryLotFromSnapshot } from "../rvgrok/lotMemory.ts";
import { QUERY_LOT_TOOL } from "../rvgrok/liveVoice.ts";
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
