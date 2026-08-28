/**
 * RvCal loan math, credit bands, formatting, PDF report.
 * ZIP tax + lenders live in sibling modules (re-exported here for the UI).
 */

import type { Lender } from "./lendersCatalog";

export type CreditBand = "fair" | "good" | "very-good" | "excellent";

export type LoanInput = {
  price: number;
  downPayment: number;
  apr: number;
  termMonths: number;
  taxRate: number;
  tradeValue?: number;
  tradePayoff?: number;
  registrationFees?: number;
  fees?: number;
  /** When false, tax on full price (CA/HI/etc.) */
  applyTradeInTaxCredit?: boolean;
};

export type LoanResult = {
  taxableAmount: number;
  taxAmount: number;
  registrationFees: number;
  fees: number;
  tradeValue: number;
  tradePayoff: number;
  equity: number;
  negativeEquity: number;
  amountFinanced: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  downPayment: number;
  price: number;
  termMonths: number;
  apr: number;
  paymentToIncome: (monthlyIncome: number) => number | null;
};

export type OwnershipInput = {
  price: number;
  years: number;
  annualMiles?: number;
  mpg?: number;
  fuelPerGal?: number;
  insuranceAnnual?: number;
  maintenanceAnnual?: number;
  storageAnnual?: number;
  residualPct?: number;
};

export type OwnershipResult = {
  years: number;
  fuel: number;
  insurance: number;
  maintenance: number;
  storage: number;
  depreciation: number;
  total: number;
  perYear: number;
  residualValue: number;
};

export function clampNumber(n: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function monthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  const P = clampNumber(principal);
  const n = Math.max(1, Math.round(termMonths));
  if (P <= 0) return 0;
  const r = clampNumber(aprPercent) / 100 / 12;
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

export function computeLoan(input: LoanInput): LoanResult {
  const price = clampNumber(input.price);
  const tradeValue = clampNumber(input.tradeValue ?? 0);
  const tradePayoff = clampNumber(input.tradePayoff ?? 0);
  const registrationFees = clampNumber(input.registrationFees ?? 0);
  const fees = clampNumber(input.fees ?? 0);
  const down = clampNumber(input.downPayment, 0, price * 2);
  const taxRate = clampNumber(input.taxRate, 0, 25);
  const termMonths = Math.max(1, Math.round(input.termMonths));
  const apr = clampNumber(input.apr, 0, 40);

  const equity = tradeValue - tradePayoff;
  const negativeEquity = equity < 0 ? Math.abs(equity) : 0;

  const tradeCredit =
    input.applyTradeInTaxCredit === false ? 0 : tradeValue;
  const taxableAmount = Math.max(0, price - tradeCredit);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);

  const gross = price + taxAmount + registrationFees + fees - equity;
  const amountFinanced = Math.max(0, gross - down);

  const payment = monthlyPayment(amountFinanced, apr, termMonths);
  const totalPaid = payment * termMonths;
  const totalInterest = Math.max(0, totalPaid - amountFinanced);

  return {
    taxableAmount,
    taxAmount,
    registrationFees,
    fees,
    tradeValue,
    tradePayoff,
    equity,
    negativeEquity,
    amountFinanced,
    monthlyPayment: payment,
    totalPaid,
    totalInterest,
    downPayment: down,
    price,
    termMonths,
    apr,
    paymentToIncome: (monthlyIncome: number) => {
      const inc = clampNumber(monthlyIncome);
      if (inc <= 0 || payment <= 0) return null;
      return (payment / inc) * 100;
    },
  };
}

export function paymentAtDownPct(
  price: number,
  downPct: number,
  opts: Omit<LoanInput, "price" | "downPayment">,
): { down: number; monthly: number; loan: LoanResult } {
  const down = (clampNumber(price) * clampNumber(downPct, 0, 100)) / 100;
  const loan = computeLoan({ price, downPayment: down, ...opts });
  return { down, monthly: loan.monthlyPayment, loan };
}

/**
 * Invert monthly payment → principal (amount financed).
 */
export function principalFromPayment(
  monthly: number,
  aprPercent: number,
  termMonths: number,
): number {
  const M = clampNumber(monthly);
  const n = Math.max(1, Math.round(termMonths));
  if (M <= 0) return 0;
  const r = clampNumber(aprPercent) / 100 / 12;
  if (r === 0) return M * n;
  const pow = Math.pow(1 + r, n);
  return (M * (pow - 1)) / (r * pow);
}

/**
 * Reverse solve: desired monthly payment → purchase price, given
 * down %, APR, term, tax, trade, fees (same stack as computeLoan).
 */
export function priceForTargetPayment(
  targetMonthly: number,
  downPct: number,
  opts: Omit<LoanInput, "price" | "downPayment">,
): number {
  const target = clampNumber(targetMonthly);
  if (target <= 0) return 0;

  const AF = principalFromPayment(target, opts.apr, opts.termMonths);
  const t = clampNumber(opts.taxRate, 0, 25) / 100;
  const d = clampNumber(downPct, 0, 100) / 100;
  const tradeValue = clampNumber(opts.tradeValue ?? 0);
  const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
  const registrationFees = clampNumber(opts.registrationFees ?? 0);
  const fees = clampNumber(opts.fees ?? 0);
  const equity = tradeValue - tradePayoff;
  const tradeCredit =
    opts.applyTradeInTaxCredit === false ? 0 : tradeValue;

  // AF = price*(1 + t - d) - tradeCredit*t + reg + fees - equity
  // price = (AF + tradeCredit*t - reg - fees + equity) / (1 + t - d)
  const denom = 1 + t - d;
  if (denom <= 0.01) return 0;

  const price =
    (AF + tradeCredit * t - registrationFees - fees + equity) / denom;

  if (!Number.isFinite(price) || price < 0) return 0;
  return Math.round(Math.min(5_000_000, Math.max(0, price)));
}

export function amortize(
  principal: number,
  aprPercent: number,
  termMonths: number,
  maxRows = 24,
): { month: number; payment: number; principal: number; interest: number; balance: number }[] {
  const n = Math.max(1, Math.round(termMonths));
  const pay = monthlyPayment(principal, aprPercent, n);
  const r = clampNumber(aprPercent) / 100 / 12;
  let bal = clampNumber(principal);
  const rows: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[] = [];
  for (let m = 1; m <= n && rows.length < maxRows; m++) {
    const interest = bal * r;
    const prin = Math.min(bal, pay - interest);
    bal = Math.max(0, bal - prin);
    rows.push({
      month: m,
      payment: pay,
      principal: prin,
      interest,
      balance: bal,
    });
  }
  return rows;
}

/**
 * Reverse solve: desired amount financed → purchase price, given
 * down %, tax, trade, fees (same stack as computeLoan).
 */
export function priceForTargetAmountFinanced(
  targetAmountFinanced: number,
  downPct: number,
  opts: Omit<LoanInput, "price" | "downPayment">,
): number {
  const AF = clampNumber(targetAmountFinanced);
  if (AF <= 0) return 0;

  const t = clampNumber(opts.taxRate, 0, 25) / 100;
  const d = clampNumber(downPct, 0, 100) / 100;
  const tradeValue = clampNumber(opts.tradeValue ?? 0);
  const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
  const registrationFees = clampNumber(opts.registrationFees ?? 0);
  const fees = clampNumber(opts.fees ?? 0);
  const equity = tradeValue - tradePayoff;
  const tradeCredit =
    opts.applyTradeInTaxCredit === false ? 0 : tradeValue;

  // AF = price*(1 + t - d) - tradeCredit*t + reg + fees - equity
  // price = (AF + tradeCredit*t - reg - fees + equity) / (1 + t - d)
  const denom = 1 + t - d;
  if (denom <= 0.01) return 0;

  const price =
    (AF + tradeCredit * t - registrationFees - fees + equity) / denom;

  if (!Number.isFinite(price) || price < 0) return 0;
  return Math.round(Math.min(5_000_000, Math.max(0, price)));
}

export function residualCurve(price: number, years: number, residualPct = 45): number {
  const p = clampNumber(price);
  const y = Math.max(0, years);
  // Straight-line-ish residual toward residualPct of MSRP over 10 years
  const target = p * (clampNumber(residualPct, 0, 100) / 100);
  const t = Math.min(1, y / 10);
  return Math.round(p + (target - p) * t);
}

export function computeOwnership(input: OwnershipInput): OwnershipResult {
  const years = Math.max(1, input.years);
  const price = clampNumber(input.price);
  const annualMiles = input.annualMiles ?? 8000;
  const mpg = Math.max(1, input.mpg ?? 8);
  const fuelPerGal = input.fuelPerGal ?? 4.25;
  const insuranceAnnual = input.insuranceAnnual ?? 1800;
  const maintenanceAnnual = input.maintenanceAnnual ?? 1200;
  const storageAnnual = input.storageAnnual ?? 0;
  const residualPct = input.residualPct ?? 45;

  const fuel = (annualMiles / mpg) * fuelPerGal * years;
  const insurance = insuranceAnnual * years;
  const maintenance = maintenanceAnnual * years;
  const storage = storageAnnual * years;
  const residualValue = residualCurve(price, years, residualPct);
  const depreciation = Math.max(0, price - residualValue);
  const total = fuel + insurance + maintenance + storage + depreciation;
  return {
    years,
    fuel,
    insurance,
    maintenance,
    storage,
    depreciation,
    total,
    perYear: total / years,
    residualValue,
  };
}

export function aprForCredit(band: CreditBand, termMonths: number): number {
  const base: Record<CreditBand, number> = {
    fair: 12.99, // 600–650
    good: 10.49, // 650–700
    "very-good": 8.49, // 700–750
    excellent: 6.99, // 800–850
  };
  let apr = base[band];
  if (termMonths > 180) apr += 0.5;
  else if (termMonths > 120) apr += 0.25;
  else if (termMonths <= 84) apr -= 0.15;
  return Math.round(apr * 100) / 100;
}

export function creditLabel(band: CreditBand): string {
  switch (band) {
    case "fair":
      return "600–650";
    case "good":
      return "650–700";
    case "very-good":
      return "700–750";
    case "excellent":
      return "800–850";
  }
}

export function creditHint(band: CreditBand): string {
  switch (band) {
    case "fair":
      return "600–650 · Highest rates · many RV lenders limited; large coaches often need more down or a co-buyer";
    case "good":
      return "650–700 · Higher rates · mid-size loans possible; 15–20%+ down helps big tickets";
    case "very-good":
      return "700–750 · Competitive rates · most specialty RV lenders will work the deal";
    case "excellent":
      return "800–850 · Best rates · strongest approval odds on six-figure motorhomes";
  }
}

/** Score ranges for the credit roll picker (FICO-style RV financing bands) */
export const CREDIT_BANDS: { id: CreditBand; range: string; label: string }[] =
  [
    { id: "fair", range: "600–650", label: "600–650" },
    { id: "good", range: "650–700", label: "650–700" },
    { id: "very-good", range: "700–750", label: "700–750" },
    { id: "excellent", range: "800–850", label: "800–850" },
  ];

export const TERM_PRESETS = [
  { label: "7 yr", months: 84, years: 7 },
  { label: "10 yr", months: 120, years: 10 },
  { label: "12 yr", months: 144, years: 12 },
  { label: "15 yr", months: 180, years: 15 },
  { label: "20 yr", months: 240, years: 20 },
] as const;

/** Down payment % — 0 first, then 10 / 15 / 20 / 30 */
export const DOWN_PRESETS = [0, 10, 15, 20, 30] as const;

/** APR roll steps for the drum picker (manual override) */
export const APR_PRESETS: number[] = (() => {
  const out: number[] = [];
  for (let a = 5; a <= 13.01; a += 0.25) {
    out.push(Math.round(a * 100) / 100);
  }
  return out;
})();

export const PRICE_CHIPS = [
  10000, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000,
] as const;

export {
  lookupTaxByZip,
  formatZipTaxLabel,
  formatZipInput,
  validateUsZip,
  givesTradeInTaxCredit,
  TRADE_IN_TAX_CREDIT_STATES,
  NO_TRADE_IN_TAX_CREDIT_STATES,
  type ZipTaxInfo,
  type ZipValidation,
  type ZipValidationStatus,
} from "./zipTax";

export type StateTaxInfo = {
  state: string;
  abbr: string;
  taxRate: number;
  registrationFees: number;
};

/** @deprecated Prefer GET /api/lenders — offline fallback */
export { LENDERS_CATALOG as LENDERS } from "./lendersCatalog";

export function lenderApr(lender: Lender, band: CreditBand): number {
  const t =
    band === "excellent"
      ? 0
      : band === "very-good"
        ? 0.28
        : band === "good"
          ? 0.55
          : 0.85;
  return (
    Math.round((lender.aprLow + (lender.aprHigh - lender.aprLow) * t) * 100) /
    100
  );
}

export function lenderMonthly(
  lender: Lender,
  amountFinanced: number,
  termMonths: number,
  band: CreditBand,
): number | null {
  if (amountFinanced < lender.minLoan) return null;
  const term = Math.min(lender.termMax, Math.max(lender.termMin, termMonths));
  return monthlyPayment(amountFinanced, lenderApr(lender, band), term);
}

export function formatMoney(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function defaultAprForTerm(termMonths: number): number {
  if (termMonths <= 60) return 6.99;
  if (termMonths <= 120) return 7.49;
  if (termMonths <= 180) return 7.99;
  return 8.49;
}

export type ScenarioSnapshot = {
  id: string;
  name: string;
  price: number;
  downPct: number;
  apr: number;
  termMonths: number;
  monthly: number;
  createdAt: number;
};

export function buildPdfReportHtml(opts: {
  price: number;
  loan: LoanResult;
  downPct: number;
  stateLabel: string;
  credit: string;
}): string {
  const { price, loan, downPct, stateLabel, credit } = opts;
  const eqParts = [
    formatMoney(price, 0),
    `+ ${formatMoney(loan.taxAmount, 0)} tax`,
    `+ ${formatMoney(loan.registrationFees, 0)} fees`,
  ];
  if (loan.negativeEquity > 0) {
    eqParts.push(`+ ${formatMoney(loan.negativeEquity, 0)} neg. equity`);
  }
  if (loan.equity > 0) {
    eqParts.push(`− ${formatMoney(loan.equity, 0)} trade equity`);
  }
  eqParts.push(`− ${formatMoney(loan.downPayment, 0)} down`);
  const equation = `${eqParts.join(" ")} = ${formatMoney(loan.amountFinanced, 0)} financed`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>RvCal Report</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;padding:32px;max-width:720px;margin:0 auto}
    h1{color:#c9a227} .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333}
    .muted{color:#aaa;font-size:13px} .big{font-size:42px;font-weight:700}
    .eq{margin-top:16px;padding:12px;border:1px solid #444;border-radius:10px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;color:#ddd}
    .warn{color:#f5a623}
  </style></head><body>
  <h1>RvCal Payment Report</h1>
  <p class="muted">${stateLabel} · Credit: ${credit} · Generated ${new Date().toLocaleString()}</p>
  <p class="big">${formatMoney(loan.monthlyPayment)}<span class="muted"> /mo</span></p>
  <p class="muted">${loan.termMonths} months · ${formatPct(loan.apr)} APR · ${downPct}% down</p>
  <div class="row"><span>Vehicle Price</span><span>${formatMoney(price)}</span></div>
  <div class="row"><span>Sales Tax</span><span>${formatMoney(loan.taxAmount)}</span></div>
  <div class="row"><span>Registration</span><span>${formatMoney(loan.registrationFees)}</span></div>
  <div class="row"><span>Negative Equity</span><span class="${loan.negativeEquity > 0 ? "warn" : ""}">${formatMoney(loan.negativeEquity)}</span></div>
  <div class="row"><span>Trade Equity Applied</span><span>${loan.equity > 0 ? "−" + formatMoney(loan.equity) : formatMoney(0)}</span></div>
  <div class="row"><span>Down Payment</span><span>−${formatMoney(loan.downPayment)}</span></div>
  <div class="row"><span><strong>Amount Financed</strong></span><span><strong>${formatMoney(loan.amountFinanced)}</strong></span></div>
  <div class="row"><span><strong>Est. Monthly</strong></span><span><strong>${formatMoney(loan.monthlyPayment)}</strong></span></div>
  <div class="eq">${equation}</div>
  ${loan.negativeEquity > 0 ? `<p class="muted" style="margin-top:12px">Negative equity: trade payoff exceeds trade value. That balance is rolled into the amount financed.</p>` : ""}
  <p class="muted" style="margin-top:24px">Estimates only — not a credit offer. Confirm rates and fees with a dealer or lender.</p>
  </body></html>`;
}
