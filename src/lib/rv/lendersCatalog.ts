/**
 * Server-side lender catalog for GET /api/lenders.
 * Self-contained (no import cycle with rvCal).
 * Curated estimates — not live offers.
 *
 * Credit-aware: big RV loans need stronger scores at many banks.
 */

export type CreditBand = "fair" | "good" | "very-good" | "excellent";

export const CREDIT_BAND_ORDER: Record<CreditBand, number> = {
  fair: 0,
  good: 1,
  "very-good": 2,
  excellent: 3,
};

export const CREDIT_SCORE_LABEL: Record<CreditBand, string> = {
  fair: "600–650",
  good: "650–700",
  "very-good": "700–750",
  excellent: "800–850",
};

export type Lender = {
  id: string;
  name: string;
  aprLow: number;
  aprHigh: number;
  termMin: number;
  termMax: number;
  minLoan: number;
  /** Minimum credit band this lender will usually consider */
  minBand: CreditBand;
  /**
   * Soft caps by credit band for amount financed.
   * Above the cap → marked ineligible (score too low for that size).
   * Omitted band = no extra cap beyond minBand.
   */
  maxLoanByBand?: Partial<Record<CreditBand, number>>;
  perks: string[];
  badge?: "best" | "high" | "medium";
  url: string;
};

export const LENDERS_CATALOG_AS_OF = "2026-07-29";

export const LENDERS_CATALOG: Lender[] = [
  {
    id: "lightstream",
    name: "LightStream by Truist",
    aprLow: 7.49,
    aprHigh: 10.49,
    termMin: 24,
    termMax: 180,
    minLoan: 5000,
    minBand: "good",
    maxLoanByBand: {
      good: 100_000,
      "very-good": 200_000,
      excellent: 500_000,
    },
    perks: ["No fees", "Rate Beat Program", "Same-day funding"],
    badge: "best",
    url: "https://www.lightstream.com/",
  },
  {
    id: "sefinancial",
    name: "Southeast Financial",
    aprLow: 7.99,
    aprHigh: 11.99,
    termMin: 12,
    termMax: 180,
    minLoan: 10000,
    minBand: "fair",
    maxLoanByBand: {
      fair: 75_000,
      good: 150_000,
      "very-good": 300_000,
      excellent: 750_000,
    },
    perks: ["RV specialist", "180-month terms", "Fast approval"],
    badge: "high",
    url: "https://www.southeastfinancial.com/",
  },
  {
    id: "essex",
    name: "Essex Credit",
    aprLow: 7.79,
    aprHigh: 11.49,
    termMin: 36,
    termMax: 240,
    minLoan: 25000,
    minBand: "good",
    maxLoanByBand: {
      good: 150_000,
      "very-good": 400_000,
      excellent: 1_000_000,
    },
    perks: ["RV & marine specialist", "Long terms", "Nationwide"],
    badge: "medium",
    url: "https://www.essexcredit.com/",
  },
  {
    id: "bofa",
    name: "Bank of America",
    aprLow: 8.24,
    aprHigh: 12.24,
    termMin: 12,
    termMax: 72,
    minLoan: 7500,
    minBand: "good",
    maxLoanByBand: {
      good: 50_000,
      "very-good": 100_000,
      excellent: 150_000,
    },
    perks: ["Relationship discounts", "Wide branch network", "Auto + RV lending"],
    badge: "medium",
    url: "https://www.bankofamerica.com/",
  },
  {
    id: "usbank",
    name: "U.S. Bank RV Loans",
    aprLow: 8.49,
    aprHigh: 13.49,
    termMin: 12,
    termMax: 180,
    minLoan: 10000,
    minBand: "fair",
    maxLoanByBand: {
      fair: 60_000,
      good: 125_000,
      "very-good": 250_000,
      excellent: 500_000,
    },
    perks: ["National RV programs", "Flexible terms", "Dealership network"],
    badge: "medium",
    url: "https://www.usbank.com/",
  },
  {
    id: "alliant",
    name: "Alliant Credit Union",
    aprLow: 7.24,
    aprHigh: 11.74,
    termMin: 12,
    termMax: 144,
    minLoan: 5000,
    minBand: "good",
    maxLoanByBand: {
      good: 80_000,
      "very-good": 175_000,
      excellent: 300_000,
    },
    perks: ["Credit union rates", "No prepay penalty", "RV & auto"],
    badge: "high",
    url: "https://www.alliantcreditunion.org/",
  },
  {
    id: "sheffield",
    name: "Sheffield Financial",
    aprLow: 8.99,
    aprHigh: 14.99,
    termMin: 24,
    termMax: 180,
    minLoan: 5000,
    minBand: "fair",
    maxLoanByBand: {
      fair: 100_000,
      good: 200_000,
      "very-good": 350_000,
      excellent: 500_000,
    },
    perks: ["Powersports & RV", "Dealer network", "Flexible credit review"],
    badge: "medium",
    url: "https://www.sheffieldfinancial.com/",
  },
  {
    id: "lazy-days-finance",
    name: "Lazydays Finance Desk",
    aprLow: 7.99,
    aprHigh: 13.49,
    termMin: 36,
    termMax: 240,
    minLoan: 15000,
    minBand: "fair",
    maxLoanByBand: {
      fair: 120_000,
      good: 300_000,
      "very-good": 600_000,
      excellent: 1_250_000,
    },
    perks: ["Highline coach experience", "Long terms", "Trade-in friendly"],
    badge: "high",
    url: "https://www.lazydays.com/",
  },
];

function lenderApr(lender: Lender, band: CreditBand): number {
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

function monthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  const P = Math.max(0, principal);
  const n = Math.max(1, Math.round(termMonths));
  if (P <= 0) return 0;
  const r = Math.max(0, aprPercent) / 100 / 12;
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

export function evaluateLenderEligibility(
  lender: Lender,
  credit: CreditBand,
  amount: number | null,
): { eligible: boolean; reason?: string } {
  if (CREDIT_BAND_ORDER[credit] < CREDIT_BAND_ORDER[lender.minBand]) {
    return {
      eligible: false,
      reason: `Needs ${lender.minBand.replace("-", " ")} credit (${CREDIT_SCORE_LABEL[lender.minBand]})+`,
    };
  }
  if (amount != null && amount < lender.minLoan) {
    return {
      eligible: false,
      reason: `Min loan $${lender.minLoan.toLocaleString("en-US")}`,
    };
  }
  if (amount != null && lender.maxLoanByBand) {
    // Use the highest cap available for this band or better
    const cap =
      lender.maxLoanByBand[credit] ??
      (credit === "excellent"
        ? lender.maxLoanByBand["very-good"]
        : credit === "very-good"
          ? lender.maxLoanByBand.good
          : credit === "good"
            ? lender.maxLoanByBand.fair
            : lender.maxLoanByBand.fair);
    if (cap != null && amount > cap) {
      return {
        eligible: false,
        reason: `Score ${CREDIT_SCORE_LABEL[credit]} usually caps near $${cap.toLocaleString("en-US")} here — raise score or down payment`,
      };
    }
  }
  return { eligible: true };
}

export type LenderQuote = Lender & {
  estimatedApr: number;
  estimatedMonthly: number | null;
  termUsed: number;
  eligible: boolean;
  ineligibilityReason?: string;
};

export type LendersLookupQuery = {
  amount?: number;
  termMonths?: number;
  credit?: CreditBand;
  zip?: string;
};

export type LendersLookupResponse = {
  source: "curated";
  asOf: string;
  disclaimer: string;
  query: {
    amount: number | null;
    termMonths: number | null;
    credit: CreditBand;
    zip: string | null;
  };
  lenders: LenderQuote[];
};

const CREDIT_BANDS: CreditBand[] = [
  "fair",
  "good",
  "very-good",
  "excellent",
];

export function parseCreditBand(raw: string | null): CreditBand {
  if (!raw) return "excellent";
  const v = raw.trim().toLowerCase().replace(/_/g, "-");
  if ((CREDIT_BANDS as string[]).includes(v)) return v as CreditBand;
  return "excellent";
}

export function buildLendersResponse(
  query: LendersLookupQuery,
): LendersLookupResponse {
  const amount =
    query.amount != null && Number.isFinite(query.amount) && query.amount > 0
      ? query.amount
      : null;
  const termMonths =
    query.termMonths != null &&
    Number.isFinite(query.termMonths) &&
    query.termMonths > 0
      ? Math.round(query.termMonths)
      : null;
  const credit = query.credit ?? "excellent";
  const zip = query.zip?.replace(/\D/g, "").slice(0, 5) || null;

  const lenders: LenderQuote[] = LENDERS_CATALOG.map((lender) => {
    const termUsed = termMonths
      ? Math.min(lender.termMax, Math.max(lender.termMin, termMonths))
      : lender.termMax;
    const estimatedApr = lenderApr(lender, credit);
    const gate = evaluateLenderEligibility(lender, credit, amount);

    let estimatedMonthly: number | null = null;
    if (gate.eligible && amount != null) {
      estimatedMonthly = monthlyPayment(amount, estimatedApr, termUsed);
    }

    return {
      ...lender,
      estimatedApr,
      estimatedMonthly,
      termUsed,
      eligible: gate.eligible,
      ineligibilityReason: gate.reason,
    };
  }).sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    const am = a.estimatedMonthly ?? 1e12;
    const bm = b.estimatedMonthly ?? 1e12;
    if (am !== bm) return am - bm;
    return a.estimatedApr - b.estimatedApr;
  });

  const firstOk = lenders.find((l) => l.eligible);
  const withBadges = lenders.map((l) => ({
    ...l,
    badge:
      firstOk && l.id === firstOk.id
        ? ("best" as const)
        : l.badge === "best"
          ? ("high" as const)
          : l.badge,
  }));

  return {
    source: "curated",
    asOf: LENDERS_CATALOG_AS_OF,
    disclaimer:
      "Estimated rates from a curated catalog — not live offers or prequalification. Lender eligibility reflects typical credit-score floors and loan-size caps for large RVs. Always confirm with the lender.",
    query: {
      amount,
      termMonths,
      credit,
      zip,
    },
    lenders: withBadges,
  };
}
