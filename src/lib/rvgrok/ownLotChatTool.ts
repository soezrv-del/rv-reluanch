/**
 * Chat `get_own_lot` payload. Voice and the lot page do not use this.
 * Every matching unit is listed. `matched` is that full count.
 */

import {
  ownLotIsUnavailable,
  parseOwnLotAsk,
  queryOwnLotUnits,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";

/** Fixed columns. One legend, then pipes, so a few hundred matches stay small. */
export const OWN_LOT_TOOL_ROW = "year|make|model|trim|stock|price|location|body";

function ownLotCell(value: string): string {
  return value.replace(/\|/g, "/").trim();
}

function compactOwnLotUnit(unit: OwnLotUnit): string {
  const price = unit.price != null && unit.price > 0 ? String(unit.price) : "";
  return [
    ownLotCell(unit.year),
    ownLotCell(unit.make),
    ownLotCell(unit.model),
    ownLotCell(unit.trim),
    ownLotCell(unit.stock_number),
    price,
    ownLotCell(unit.location),
    ownLotCell(unit.body_type),
  ].join("|");
}

export function ownLotToolResult(snapshot: OwnLotSnapshot, query: string): Record<string, unknown> {
  if (!snapshot.ok || ownLotIsUnavailable(snapshot)) {
    const reason = snapshot.reason || "lot snapshot unavailable";
    return { ok: false, unavailable: true, error: reason, reason };
  }
  const filter = parseOwnLotAsk(
    query,
    snapshot.units.map((u) => u.location),
    snapshot.units,
  );
  const rows = queryOwnLotUnits(snapshot.units, filter, snapshot.units.length);
  return {
    ok: true,
    source: "own",
    dealer: snapshot.dealer || "RV Country",
    lot_total: snapshot.units.length,
    matched: rows.length,
    row: OWN_LOT_TOOL_ROW,
    units: rows.map(compactOwnLotUnit),
  };
}
