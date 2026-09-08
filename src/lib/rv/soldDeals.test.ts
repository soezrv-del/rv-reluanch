import assert from "node:assert/strict";
import test from "node:test";
import {
  formatSoldDockMoney,
  formatSoldMoney,
  formatUnitLabel,
  loadSoldDeals,
  normalizeCustomerName,
  parseGrossAmount,
  persistSoldDeals,
  removeSoldDeal,
  salesmanNet,
  sellSavedCoach,
  SOLD_DEALS_KEY,
  soldFactsSummary,
  soldTotals,
  toggleDealPaid,
  type SoldDeal,
} from "./soldDeals.ts";
import {
  isSavedUnit,
  removeSavedUnit,
  type SavedUnitLike,
} from "./savedUnits.ts";

function unit(
  year: string,
  make: string,
  model: string,
  type: string,
  floorplan = "",
): SavedUnitLike {
  return { year, make, model, floorplan, data: { type } };
}

const dream = unit(
  "2023",
  "American Coach",
  "American Dream",
  "Class A Diesel",
  "45A",
);
const montana = unit(
  "2022",
  "Keystone",
  "Montana",
  "Fifth Wheel",
  "3855BR",
);

test("dock owed label stays compact so the balance fits a pro tab", () => {
  assert.equal(formatSoldDockMoney(0), "$0");
  assert.equal(formatSoldDockMoney(250), "$250");
  assert.equal(formatSoldDockMoney(1250), "$1,250");
  assert.equal(formatSoldDockMoney(10000), "$10k");
  assert.equal(formatSoldDockMoney(12500), "$12.5k");
  assert.equal(formatSoldDockMoney(25000), "$25k");
  assert.equal(formatSoldDockMoney(100000), "$100k");
  assert.equal(formatSoldDockMoney(2_000_000), "$2M");
});

test("salesman net is 25% of gross for a whole deal, then × share", () => {
  assert.equal(salesmanNet(100000, "whole"), 25000);
  assert.equal(salesmanNet(100000, "half"), 12500);
  assert.equal(salesmanNet(100000, "quarter"), 6250);
  assert.equal(salesmanNet(10000, "whole"), 2500);
  assert.equal(salesmanNet(10000, "half"), 1250);
  assert.equal(salesmanNet(10000, "quarter"), 625);
  assert.equal(salesmanNet(39999, "quarter"), 2500);
  assert.equal(salesmanNet(0, "whole"), 0);
  assert.equal(salesmanNet(-100, "half"), 0);
});

test("optional customer name never blocks a sell", () => {
  assert.equal(normalizeCustomerName(""), "");
  assert.equal(normalizeCustomerName("  Jane Doe  "), "Jane Doe");
  assert.equal(normalizeCustomerName(null), "");
  assert.equal(normalizeCustomerName(undefined), "");

  const skipped = sellSavedCoach([dream], [], {
    unit: dream,
    customerName: "",
    gross: 40000,
    split: "half",
  });
  assert.equal(skipped.ok, true);
  if (!skipped.ok) return;
  assert.equal(skipped.deal.customerName, "");
  assert.equal(skipped.deal.gross, 40000);
  assert.equal(salesmanNet(skipped.deal.gross, skipped.deal.split), 5000);

  const named = sellSavedCoach([dream], [], {
    unit: dream,
    customerName: "  Pat  ",
    gross: 40000,
    split: "quarter",
  });
  assert.equal(named.ok, true);
  if (!named.ok) return;
  assert.equal(named.deal.customerName, "Pat");
});

test("sell removes the coach from saved and keeps other units", () => {
  const saved = [dream, montana];
  const result = sellSavedCoach(saved, [], {
    unit: dream,
    customerName: "Kim",
    gross: 12000,
    split: "whole",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.saved.length, 1);
  assert.equal(isSavedUnit(result.saved, dream), false);
  assert.equal(isSavedUnit(result.saved, montana), true);
  assert.equal(result.deals.length, 1);
  assert.equal(result.deal.unitLabel, "2023 American Coach American Dream 45A");
  assert.equal(result.deal.paid, false);
  assert.equal(salesmanNet(result.deal.gross, result.deal.split), 3000);
});

test("removeSavedUnit is a no-op when the coach is not saved", () => {
  assert.equal(removeSavedUnit([montana], dream).length, 1);
  assert.equal(removeSavedUnit([], dream).length, 0);
});

test("paid toggle drops net out of owed and tap-again restores", () => {
  const first = sellSavedCoach([dream], [], {
    unit: dream,
    gross: 8000,
    split: "half",
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = sellSavedCoach([montana], first.deals, {
    unit: montana,
    customerName: "Lee",
    gross: 4000,
    split: "quarter",
  });
  assert.equal(second.ok, true);
  if (!second.ok) return;

  const open = soldTotals(second.deals);
  assert.equal(open.totalGross, 12000);
  // 8000 half = 1000; 4000 quarter = 250
  assert.equal(open.owedNet, 1000 + 250);
  assert.equal(open.paidNet, 0);

  const paidFirst = toggleDealPaid(second.deals, first.deal.id);
  const afterPay = soldTotals(paidFirst);
  assert.equal(afterPay.totalGross, 12000);
  assert.equal(afterPay.owedNet, 250);
  assert.equal(afterPay.paidNet, 1000);
  assert.equal(paidFirst.find((d) => d.id === first.deal.id)?.paid, true);

  const reverted = toggleDealPaid(paidFirst, first.deal.id);
  const afterRevert = soldTotals(reverted);
  assert.equal(afterRevert.owedNet, 1250);
  assert.equal(afterRevert.paidNet, 0);
  assert.equal(reverted.find((d) => d.id === first.deal.id)?.paid, false);
});

test("removeSoldDeal drops the row and persist stays gone after reload", () => {
  const first = sellSavedCoach([dream], [], {
    unit: dream,
    customerName: "Kim",
    gross: 8000,
    split: "half",
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = sellSavedCoach([montana], first.deals, {
    unit: montana,
    customerName: "Lee",
    gross: 4000,
    split: "quarter",
  });
  assert.equal(second.ok, true);
  if (!second.ok) return;

  assert.equal(removeSoldDeal(second.deals, "").length, 2);
  assert.equal(removeSoldDeal(second.deals, "missing").length, 2);

  const after = removeSoldDeal(second.deals, first.deal.id);
  assert.equal(after.length, 1);
  assert.equal(after[0]!.id, second.deal.id);
  // Remove is Sold-only — does not unwind the sale back onto Saved.
  assert.equal(isSavedUnit(second.saved, dream), false);
  assert.equal(isSavedUnit(second.saved, montana), false);
  const totals = soldTotals(after);
  assert.equal(totals.totalGross, 4000);
  assert.equal(totals.owedNet, 250);
  assert.equal(
    soldFactsSummary(totals),
    "$4,000 gross · $250 owed",
  );

  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    persistSoldDeals(after);
    assert.equal(loadSoldDeals().length, 1);
    persistSoldDeals(removeSoldDeal(loadSoldDeals(), second.deal.id));
    assert.deepEqual(loadSoldDeals(), []);
    assert.equal(soldFactsSummary(soldTotals([])), "$0 gross · $0 owed");
  } finally {
    if (prev) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prev,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  }
});

test("gross parse requires a positive amount — no free-text split", () => {
  assert.equal(parseGrossAmount(""), null);
  assert.equal(parseGrossAmount("0"), null);
  assert.equal(parseGrossAmount("abc"), null);
  assert.equal(parseGrossAmount("$12,500"), 12500);
  const blocked = sellSavedCoach([dream], [], {
    unit: dream,
    gross: 0,
    split: "whole",
  });
  assert.equal(blocked.ok, false);
});

test("sold deals persist on the same device localStorage as saved units", () => {
  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    assert.deepEqual(loadSoldDeals(), []);
    const sold: SoldDeal = {
      id: "d1",
      customerName: "",
      unit: {
        year: dream.year,
        make: dream.make,
        model: dream.model,
        floorplan: dream.floorplan,
      },
      unitLabel: formatUnitLabel(dream),
      gross: 9000,
      split: "quarter",
      paid: false,
      soldAt: "2026-09-08T00:00:00.000Z",
    };
    persistSoldDeals([sold]);
    assert.ok(mem.get(SOLD_DEALS_KEY));
    const loaded = loadSoldDeals();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]!.gross, 9000);
    assert.equal(salesmanNet(loaded[0]!.gross, loaded[0]!.split), 563);
    assert.equal(formatSoldMoney(563), "$563");
  } finally {
    if (prev) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prev,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  }
});
