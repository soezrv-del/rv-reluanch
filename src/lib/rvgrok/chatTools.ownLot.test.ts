/**
 * Chat get_own_lot lists every match. `matched` is that count, not an 8-row page.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { OWN_LOT_TOOL_ROW, ownLotToolResult } from "./ownLotChatTool.ts";
import { snapshotFromJson, type OwnLotSnapshot, type OwnLotUnit } from "./ownLotInventory.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function unit(stock: string, body: string, price: number | null): OwnLotUnit {
  return {
    year: "2024",
    make: "Grand Design",
    model: "Reflection",
    trim: "367BHS",
    body_type: body,
    location: "Fresno CA",
    stock_number: stock,
    vin: "",
    source: "own",
    dealer: "RV Country",
    price,
    lengthFt: 34,
  };
}

function snapshot(units: OwnLotUnit[]): OwnLotSnapshot {
  return {
    ok: true,
    asOf: "test",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
    pathTried: "test",
    units,
  };
}

test("chat own-lot tool returns every match, not an 8-row page", () => {
  const units = Array.from({ length: 9 }, (_, i) => unit(`FW${i + 1}`, "Fifth Wheel", 40000 + i));
  units.push(unit("CA1", "Class A", 90000));
  const result = ownLotToolResult(snapshot(units), "fifth wheels");
  const listed = result.units as string[];
  assert.equal(result.ok, true);
  assert.equal(result.matched, 9);
  assert.equal(listed.length, 9);
  assert.equal(result.matched, listed.length);
  assert.equal(result.row, OWN_LOT_TOOL_ROW);
  assert.ok(listed.some((row) => row.includes("|FW9|")));
  assert.ok(listed.every((row) => row.endsWith("|Fifth Wheel")));
  assert.ok(!listed.some((row) => row.includes("|CA1|")));
  assert.equal(result.lot_total, 10);
});

test("unpriced rows stay in the list with an empty price cell", () => {
  const result = ownLotToolResult(
    snapshot([unit("FW1", "Fifth Wheel", null), unit("FW2", "Fifth Wheel", 0)]),
    "fifth wheel",
  );
  const listed = result.units as string[];
  assert.equal(result.matched, 2);
  assert.match(
    listed.find((row) => row.includes("|FW1|")) || "",
    /\|FW1\|\|Fresno CA\|Fifth Wheel/,
  );
  assert.match(
    listed.find((row) => row.includes("|FW2|")) || "",
    /\|FW2\|\|Fresno CA\|Fifth Wheel/,
  );
});

test("unavailable snapshot does not pretend the match count is zero", () => {
  const result = ownLotToolResult(
    { ...snapshot([]), ok: false, reason: "missing file" },
    "fifth wheel",
  );
  assert.equal(result.ok, false);
  assert.equal(result.unavailable, true);
  assert.equal(result.error, "missing file");
  assert.equal(result.units, undefined);
});

test("bundled snapshot: fifth wheel and 30-footers are the full match, compact", () => {
  const snap = snapshotFromJson(
    JSON.parse(readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8")),
  );
  const sizes: string[] = [];
  for (const query of ["fifth wheel", "30-footers"]) {
    const result = ownLotToolResult(snap, query);
    const listed = result.units as string[];
    const matched = result.matched as number;
    assert.equal(listed.length, matched, query);
    assert.ok(matched > 8, `${query} still capped: ${matched}`);
    const bytes = JSON.stringify(result).length;
    const perRow = bytes / matched;
    assert.ok(
      perRow < 120,
      `${query} payload ${bytes} bytes (${perRow.toFixed(1)}/row) is not compact`,
    );
    assert.equal(listed[0]!.split("|").length, 8, query);
    sizes.push(`${query}: matched=${matched} bytes=${bytes} perRow=${perRow.toFixed(1)}`);
  }
  console.log(`[own-lot chat tool] ${sizes.join(" | ")}`);
});

test("chat route and chatTools share one uncapped get_own_lot handler", () => {
  const api = src("../../routes/api/rvgrok.ts");
  const tools = src("chatTools.ts");
  const impl = src("ownLotChatTool.ts");
  assert.match(
    api,
    /if \(name === "get_own_lot"\) \{\s*return executeRvGrokTool\(name, args, ctx\);/,
  );
  assert.doesNotMatch(api, /queryOwnLotUnits\(/);
  assert.match(tools, /return ownLotToolResult\(snapshot, query\)/);
  assert.doesNotMatch(tools, /queryOwnLotUnits\(/);
  assert.doesNotMatch(impl, /queryOwnLotUnits\([\s\S]*?,\s*8\s*\)/);
  assert.match(impl, /queryOwnLotUnits\(snapshot\.units, filter, snapshot\.units\.length\)/);
});
