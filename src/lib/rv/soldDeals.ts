/**
 * Professional Sold book — device-local deals from Facts saved coaches.
 * Lot-desk net: 25% of gross for a whole deal, then × share
 * (whole 1 / half 0.5 / quarter 0.25). Never typed.
 * Swipe/Delete drops the row from `rvfax_sold_v1` only — does not put the
 * coach back on Saved. For test deals and fallen-through / went-backwards.
 */

import {
  removeSavedUnit,
  type SavedUnitIdentity,
} from "./savedUnits.ts";

export const SOLD_DEALS_KEY = "rvfax_sold_v1";
export const SOLD_CHANGED_EVENT = "rvfax-sold-changed";
export const OPEN_SOLD_EVENT = "rvfax-open-sold";

/** Whole-deal desk commission — always 25% of gross. */
export const WHOLE_DEAL_COMMISSION = 0.25;

export const DEAL_SPLITS = {
  quarter: { id: "quarter", label: "Quarter deal", share: 0.25 },
  half: { id: "half", label: "Half deal", share: 0.5 },
  whole: { id: "whole", label: "Whole deal", share: 1 },
} as const;

export type DealSplitId = keyof typeof DEAL_SPLITS;

export const DEAL_SPLIT_IDS = Object.keys(DEAL_SPLITS) as DealSplitId[];

export type SoldUnit = SavedUnitIdentity & {
  type?: string;
};

export type SoldDeal = {
  id: string;
  customerName: string;
  unit: SoldUnit;
  unitLabel: string;
  gross: number;
  split: DealSplitId;
  paid: boolean;
  soldAt: string;
};

export type SoldTotals = {
  totalGross: number;
  owedNet: number;
  paidNet: number;
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function isDealSplitId(v: unknown): v is DealSplitId {
  return typeof v === "string" && v in DEAL_SPLITS;
}

/** Effective share of the 25% whole-deal commission. */
export function splitShare(split: DealSplitId): number {
  return DEAL_SPLITS[split].share;
}

/** Gross multiplier: 0.25 × share (whole 25% / half 12.5% / quarter 6.25%). */
export function splitRate(split: DealSplitId): number {
  return WHOLE_DEAL_COMMISSION * splitShare(split);
}

export function splitLabel(split: DealSplitId): string {
  return DEAL_SPLITS[split].label;
}

export function splitPercentLabel(split: DealSplitId): string {
  return `${splitRate(split) * 100}%`;
}

/**
 * Salesman net — always auto-calculated, never a typed field.
 * `round(gross × 0.25 × share)` — whole / half / quarter share is 1 / 0.5 / 0.25.
 */
export function salesmanNet(gross: number, split: DealSplitId): number {
  if (!Number.isFinite(gross) || gross <= 0) return 0;
  return Math.round(gross * WHOLE_DEAL_COMMISSION * splitShare(split));
}

export function formatSoldMoney(n: number): string {
  const abs = Math.abs(Math.round(n));
  const formatted = abs.toLocaleString("en-US");
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
}

/** Compact owed figure for the pro dock tab — always the unpaid net. */
export function formatSoldDockMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    const s = m >= 10 ? String(Math.round(m)) : trimDockDecimal(m);
    return `${sign}$${s}M`;
  }
  if (abs >= 10_000) {
    const k = abs / 1000;
    const s = Number.isInteger(k) ? String(k) : trimDockDecimal(k);
    return `${sign}$${s}k`;
  }
  return formatSoldMoney(n);
}

function trimDockDecimal(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

export function readOwedNet(): number {
  return soldTotals(loadSoldDeals()).owedNet;
}

/** Optional name — empty is valid and must never block a deal. */
export function normalizeCustomerName(raw: unknown): string {
  return clean(raw);
}

export function parseGrossAmount(raw: unknown): number | null {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    return Math.round(raw);
  }
  const t = clean(raw).replace(/[$,]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function formatUnitLabel(unit: SavedUnitIdentity): string {
  const base = [unit.year, unit.make, unit.model].filter(Boolean).join(" ");
  return unit.floorplan ? `${base} ${unit.floorplan}` : base;
}

export function soldTotals(deals: SoldDeal[]): SoldTotals {
  let totalGross = 0;
  let owedNet = 0;
  let paidNet = 0;
  for (const d of deals) {
    const net = salesmanNet(d.gross, d.split);
    totalGross += d.gross;
    if (d.paid) paidNet += net;
    else owedNet += net;
  }
  return { totalGross, owedNet, paidNet };
}

/** More-row / book subtitle — gross + unpaid net. */
export function soldFactsSummary(totals: SoldTotals): string {
  return `${formatSoldMoney(totals.totalGross)} gross · ${formatSoldMoney(totals.owedNet)} owed`;
}

export function normalizeSoldDeal(raw: unknown): SoldDeal | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const unitRaw = row.unit;
  if (!unitRaw || typeof unitRaw !== "object") return null;
  const unitIn = unitRaw as Record<string, unknown>;
  const year = clean(unitIn.year);
  const make = clean(unitIn.make);
  const model = clean(unitIn.model);
  if (!year || !make || !model) return null;
  if (!isDealSplitId(row.split)) return null;
  const gross = parseGrossAmount(row.gross);
  if (gross == null) return null;
  const id = clean(row.id) || `sold-${year}-${make}-${model}-${Date.now()}`;
  const unit: SoldUnit = {
    year,
    make,
    model,
    floorplan: clean(unitIn.floorplan) || undefined,
    type: clean(unitIn.type) || undefined,
  };
  return {
    id,
    customerName: normalizeCustomerName(row.customerName),
    unit,
    unitLabel: clean(row.unitLabel) || formatUnitLabel(unit),
    gross,
    split: row.split,
    paid: row.paid === true,
    soldAt:
      typeof row.soldAt === "string" && row.soldAt
        ? row.soldAt
        : new Date().toISOString(),
  };
}

export function loadSoldDeals(): SoldDeal[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SOLD_DEALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSoldDeal)
      .filter((d): d is SoldDeal => d != null);
  } catch {
    return [];
  }
}

export function persistSoldDeals(deals: SoldDeal[]): SoldDeal[] {
  if (canUseStorage()) {
    try {
      localStorage.setItem(SOLD_DEALS_KEY, JSON.stringify(deals));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SOLD_CHANGED_EVENT));
      }
    } catch {
      /* quota */
    }
  }
  return deals;
}

export function toggleDealPaid(deals: SoldDeal[], id: string): SoldDeal[] {
  return deals.map((d) => (d.id === id ? { ...d, paid: !d.paid } : d));
}

/**
 * Drop one deal from Sold only. Does not touch Saved — no unwind / restore.
 * Empty id is a no-op.
 */
export function removeSoldDeal(deals: SoldDeal[], id: string): SoldDeal[] {
  const want = typeof id === "string" ? id.trim() : "";
  if (!want) return deals;
  return deals.filter((d) => d.id !== want);
}

function newDealId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* */
  }
  return `sold-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type SellCoachInput = {
  unit: SavedUnitIdentity & { data?: { type?: string | null } };
  customerName?: string | null;
  gross: number;
  split: DealSplitId;
};

export type SellCoachResult<T extends SavedUnitIdentity> =
  | { ok: true; saved: T[]; deals: SoldDeal[]; deal: SoldDeal }
  | { ok: false; error: string };

/**
 * Log a deal, auto-calc net, move the unit out of Saved into Sold.
 * Customer name is optional — empty never blocks.
 */
export function sellSavedCoach<T extends SavedUnitIdentity>(
  saved: T[],
  deals: SoldDeal[],
  input: SellCoachInput,
): SellCoachResult<T> {
  const gross = parseGrossAmount(input.gross);
  if (gross == null) {
    return { ok: false, error: "Gross amount is required." };
  }
  if (!isDealSplitId(input.split)) {
    return { ok: false, error: "Pick quarter, half, or whole deal." };
  }
  const year = clean(input.unit.year);
  const make = clean(input.unit.make);
  const model = clean(input.unit.model);
  if (!year || !make || !model) {
    return { ok: false, error: "Need a saved coach to sell." };
  }
  const unit: SoldUnit = {
    year,
    make,
    model,
    floorplan: clean(input.unit.floorplan) || undefined,
    type: clean(input.unit.data?.type) || undefined,
  };
  const deal: SoldDeal = {
    id: newDealId(),
    customerName: normalizeCustomerName(input.customerName),
    unit,
    unitLabel: formatUnitLabel(unit),
    gross,
    split: input.split,
    paid: false,
    soldAt: new Date().toISOString(),
  };
  return {
    ok: true,
    saved: removeSavedUnit(saved, unit),
    deals: [deal, ...deals],
    deal,
  };
}
