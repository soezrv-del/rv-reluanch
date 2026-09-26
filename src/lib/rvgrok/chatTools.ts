/**
 * Chat-completion tools for RvGrok. Each handler returns JSON.
 * The research sidecar stays on Gemini / Responses web_search — never a
 * client function named web_search.
 */

import { GENERATE_IMAGE_TOOL } from "./imageGen.ts";
import { lookupGroundedSpecs } from "./grounding.ts";
import { parseCoachFromText } from "./parseCoach.ts";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeMarketValueQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";
import { wantsGeneratedImage } from "./imageGen.ts";
import {
  loadOwnLotSnapshot,
  looksLikeOwnLotStockQuestion,
} from "./ownLotInventory.ts";
import { ownLotToolResult } from "./ownLotChatTool.ts";
import { evaluateTowMatch } from "../tow/towMatch.ts";
import { computeLoan } from "../rv/rvCal.ts";
import { parseCreditBand, type CreditBand } from "../rv/lendersCatalog.ts";
import { resolveLendersResponse } from "../rv/rateApiLenders.ts";
import { givesTradeInTaxCredit, lookupTaxByZip } from "../rv/zipTax.ts";

export const ANSWER_TEMPERATURE = 0.5;

const fn = (
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[] = [],
) => ({
  type: "function" as const,
  function: {
    name,
    description,
    parameters: {
      type: "object",
      properties,
      required,
    },
  },
});

export const RV_GROK_TOOLS = [
  GENERATE_IMAGE_TOOL,
  fn(
    "get_coach_facts",
    "Catalog lock for a year, make, model, and floorplan. Specs and weights. Does not check recalls.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
      floorplan: { type: "string" },
    },
  ),
  fn(
    "check_recalls",
    "NHTSA campaigns for a year, make, and model. A result does not clear chassis or appliance campaigns unless those flags are true.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
      vin: { type: "string" },
      chassis: { type: "string" },
    },
  ),
  fn(
    "search_listings",
    "Live asking prices for a year, make, model, and ZIP. If the range is dated, the JSON says so.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
      zip: { type: "string" },
      radius: { type: "string" },
    },
    ["make", "model", "zip"],
  ),
  fn(
    "estimate_payment",
    "Payment estimate from price, ZIP, term, and credit band. An estimate, not a loan offer.",
    {
      price: { type: "number" },
      zip: { type: "string" },
      term_months: { type: "number" },
      credit: { type: "string" },
      down_payment: { type: "number" },
    },
    ["price"],
  ),
  fn(
    "check_tow",
    "Truck max tow, payload, and hitch against trailer GVWR. Does not invent a missing rating.",
    {
      trailer_gvwr_lb: { type: "number" },
      truck_max_tow_lb: { type: "number" },
      truck_payload_lb: { type: "number" },
      truck_gcwr_lb: { type: "number" },
      hitch_lb: { type: "number" },
      rv_type: { type: "string" },
      bed: { type: "string" },
    },
  ),
  fn(
    "get_own_lot",
    "RV Country lot snapshot. Only for an explicit stock ask or a stock number. A coach name alone is not this tool. Returns every match; matched is the full count. Each unit is year|make|model|trim|stock|price|location|body.",
    {
      query: { type: "string" },
    },
  ),
];

export type TalkMode = "lot" | "coach";

export function parseTalkMode(raw: unknown): TalkMode {
  return raw === "coach" ? "coach" : "lot";
}

/** Which tool this ask must run. Null = answer with no forced call. */
export function requiredToolForAsk(text: string): string | null {
  const t = normalizeAskText(text);
  if (!t.trim()) return null;
  if (wantsGeneratedImage(t)) return "generate_image";
  if (
    looksLikeOwnLotStockQuestion(t) ||
    looksLikeInventoryOrCountQuestion(t)
  ) {
    return "get_own_lot";
  }
  if (/\b(recalls?|nhtsa|campaign)\b/i.test(t)) return "check_recalls";
  if (
    /\b(monthly\s+payment|loan\s+payment|\bapr\b|interest\s+rate|financing|finance this|payment\s+on|estimate(?:\s+a)?\s+payment|what(?:'s| is) the payment)\b/i.test(
      t,
    )
  ) {
    return "estimate_payment";
  }
  if (
    /\b(my truck|this truck|payload|gcwr|hitch weight|tongue weight|pin weight|can (?:it|this|my|the) truck)\b/i.test(
      t,
    ) &&
    /\b(tow|pull|trailer|fifth|gvwr)\b/i.test(t)
  ) {
    return "check_tow";
  }
  if (looksLikeMarketValueQuestion(t)) return "search_listings";
  if (looksLikeSpecQuestion(t) || looksLikeNamedCoachProductQuestion(t)) {
    return "get_coach_facts";
  }
  return null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function coachFrom(args: Record<string, unknown>, userText: string) {
  const hinted = [str(args.year), str(args.make), str(args.model), str(args.floorplan)]
    .filter(Boolean)
    .join(" ");
  const parsed = parseCoachFromText(`${hinted} ${userText}`.trim());
  return {
    year: str(args.year) || parsed.year,
    make: str(args.make) || parsed.make,
    model: str(args.model) || parsed.model,
    floorplan: str(args.floorplan) || parsed.floorplan,
  };
}

async function getCoachFacts(args: Record<string, unknown>, userText: string) {
  const id = coachFrom(args, userText);
  if (!id.make && !id.model) {
    return {
      ok: false,
      unverified: ["make", "model"],
      equipment_recalls_checked: false,
    };
  }
  const specs = lookupGroundedSpecs({ ...id, source: "message" });
  const gvwr = specs.oemGvwrLbs;
  return {
    ok: true,
    year: id.year || null,
    make: id.make || null,
    model: id.model || null,
    floorplan: id.floorplan || null,
    gvwr_lb: gvwr,
    uvw_lb: specs.oemUvwLbs,
    engine: specs.engine.value,
    engine_source: specs.engine.trust,
    horsepower: specs.horsepower.value,
    torque: specs.torque.value,
    chassis: specs.chassis.value,
    fuel: specs.fuelType.value,
    class: specs.rvType.value,
    source: gvwr != null ? "catalog_pin" : specs.hasHardLock ? "catalog_lock" : "unverified",
    equipment_recalls_checked: false,
  };
}

type NhtsaBundle = {
  year: string;
  make: string;
  model: string;
  recallCount: number;
  recalls: Array<{ campaignNumber: string; component: string; summary: string }>;
  defectCount?: number;
  searchNote?: string;
};

/** This repo keeps NHTSA lookup inside the recalls route. Call that route. */
async function fetchNhtsaBundle(
  year: string,
  make: string,
  model: string,
  origin?: string,
): Promise<NhtsaBundle> {
  const base = (origin || "").replace(/\/$/, "");
  const empty: NhtsaBundle = {
    year,
    make,
    model,
    recallCount: 0,
    recalls: [],
    defectCount: 0,
    searchNote: "NHTSA lookup needs the app origin.",
  };
  if (!base) return empty;
  const url = new URL("/api/nhtsa/recalls", base);
  url.searchParams.set("year", year);
  url.searchParams.set("make", make);
  url.searchParams.set("model", model);
  const resp = await fetch(url);
  const json = (await resp.json()) as { data?: NhtsaBundle };
  return json.data ?? empty;
}

type ListingSearch = {
  ok: boolean;
  numFound?: number;
  medianPrice?: number | null;
  cached?: boolean;
  zip?: string;
  listings?: Array<{
    year?: string | number;
    make?: string;
    model?: string;
    trim?: string;
    price?: number | null;
    miles?: number | null;
    city?: string;
    state?: string;
    dealerName?: string;
  }>;
  error?: string;
};

/** This repo keeps MarketCheck search inside its route. Call that route. */
async function searchMarketcheckRv(
  args: {
    year: string | null;
    make: string;
    model: string;
    zip: string;
    radius: string | null;
  },
  origin?: string,
): Promise<ListingSearch> {
  const base = (origin || "").replace(/\/$/, "");
  if (!base) return { ok: false, error: "listings lookup needs the app origin" };
  const url = new URL("/api/marketcheck/search", base);
  if (args.year) url.searchParams.set("year", args.year);
  if (args.make) url.searchParams.set("make", args.make);
  if (args.model) url.searchParams.set("model", args.model);
  if (args.zip) url.searchParams.set("zip", args.zip);
  if (args.radius) url.searchParams.set("radius", args.radius);
  const resp = await fetch(url);
  const json = (await resp.json()) as ListingSearch;
  return json;
}

async function checkRecalls(
  args: Record<string, unknown>,
  userText: string,
  origin?: string,
) {
  const id = coachFrom(args, userText);
  const vin = str(args.vin);
  if (!/^\d{4}$/.test(id.year) || !id.make || !id.model) {
    return {
      ok: false,
      unverified: ["year", "make", "model"].filter((k) => !id[k as "year" | "make" | "model"]),
      vin_supplied: Boolean(vin),
      equipment_recalls_checked: false,
      chassis_recalls_checked: false,
    };
  }
  const data = await fetchNhtsaBundle(id.year, id.make, id.model, origin);
  const chassis = str(args.chassis);
  let chassisRecallCount: number | null = null;
  if (chassis && chassis.toLowerCase() !== id.make.toLowerCase()) {
    const chassisBundle = await fetchNhtsaBundle(id.year, chassis, id.model, origin);
    chassisRecallCount = chassisBundle.recallCount;
  }
  return {
    ok: true,
    source: "nhtsa",
    year: data.year,
    make: data.make,
    model: data.model,
    recall_count: data.recallCount,
    campaigns: data.recalls.slice(0, 8).map((r) => ({
      campaign: r.campaignNumber,
      component: r.component,
      summary: r.summary.slice(0, 280),
    })),
    complaint_count: data.defectCount ?? 0,
    search_note: data.searchNote || null,
    vin_supplied: Boolean(vin),
    vin_clears_equipment: false,
    equipment_recalls_checked: false,
    chassis_recalls_checked: chassisRecallCount != null,
    chassis_recall_count: chassisRecallCount,
  };
}

async function searchListings(
  args: Record<string, unknown>,
  userText: string,
  origin?: string,
) {
  const id = coachFrom(args, userText);
  const zip = str(args.zip).replace(/\D/g, "").slice(0, 5);
  const result = await searchMarketcheckRv(
    {
      year: id.year || null,
      make: id.make,
      model: id.model,
      zip,
      radius: str(args.radius) || null,
    },
    origin,
  );
  if (!result.ok) return result;
  return {
    ok: true,
    source: "marketcheck",
    num_found: result.numFound,
    median_asking: result.medianPrice,
    cached: result.cached,
    dated: result.cached,
    zip: result.zip,
    listings: (result.listings ?? []).slice(0, 6).map((row) => ({
      year: row.year,
      make: row.make,
      model: row.model,
      trim: row.trim,
      price: row.price,
      miles: row.miles,
      city: row.city,
      state: row.state,
      dealer: row.dealerName,
    })),
  };
}

async function estimatePayment(args: Record<string, unknown>) {
  const price = num(args.price);
  if (price == null || price <= 0) {
    return { ok: false, estimate: false, unverified: ["price"] };
  }
  const term = num(args.term_months) ?? 240;
  const down = num(args.down_payment) ?? 0;
  const credit = parseCreditBand(str(args.credit) || null) as CreditBand;
  const zip = str(args.zip);
  const tax = zip ? lookupTaxByZip(zip) : null;
  const lenders = await resolveLendersResponse({
    amount: price,
    termMonths: term,
    credit,
    zip: zip || undefined,
  });
  const quote =
    lenders.lenders.find((row) => row.eligible) ?? lenders.lenders[0] ?? null;
  const apr = quote?.estimatedApr ?? 0;
  const loan = computeLoan({
    price,
    downPayment: down,
    apr,
    termMonths: term,
    taxRate: tax?.taxRate ?? 0,
    registrationFees: tax?.registrationFees ?? 0,
    applyTradeInTaxCredit: tax ? givesTradeInTaxCredit(tax.abbr) : true,
  });
  return {
    ok: true,
    estimate: true,
    not_a_loan_offer: true,
    price,
    down_payment: down,
    term_months: term,
    term_assumed: num(args.term_months) == null,
    credit,
    monthly_usd: Math.round(loan.monthlyPayment),
    amount_financed: Math.round(loan.amountFinanced),
    tax_amount: loan.taxAmount,
    tax_rate: tax?.taxRate ?? null,
    tax_state: tax?.abbr ?? null,
    tax_unverified: !tax,
    apr,
    apr_source: lenders.source,
    lender: quote?.name ?? null,
  };
}

function checkTow(args: Record<string, unknown>) {
  const gvwr = num(args.trailer_gvwr_lb);
  const maxTow = num(args.truck_max_tow_lb);
  const payload = num(args.truck_payload_lb);
  const gcwr = num(args.truck_gcwr_lb);
  const missing = [
    gvwr == null ? "trailer_gvwr_lb" : "",
    maxTow == null ? "truck_max_tow_lb" : "",
  ].filter(Boolean);
  if (missing.length) {
    return { ok: false, unverified: missing };
  }
  const verdict = evaluateTowMatch({
    hasVehicle: true,
    rvType: str(args.rv_type) || "Travel Trailer",
    gvwrLbs: gvwr!,
    hitchLbs: num(args.hitch_lb) ?? undefined,
    maxTow: maxTow!,
    payload: payload ?? 0,
    gcwr: gcwr ?? 0,
    bed: str(args.bed) || undefined,
  });
  return {
    ok: true,
    tow_ok: verdict.towOk,
    hitch_ok: verdict.hitchOk,
    hitch_skipped: verdict.hitchSkipped,
    gcwr_ok: verdict.gcwrOk,
    gcwr_skipped: verdict.gcwrSkipped,
    overall_ok: verdict.overallOk,
    hitch_lb: verdict.hitchLoad,
    hitch_kind: verdict.hitchKind,
    hitch_estimated: verdict.hitchEstimated,
    checks: verdict.checks.map((c) => ({
      id: c.id,
      level: c.level,
      title: c.title,
    })),
  };
}

async function getOwnLot(
  args: Record<string, unknown>,
  userText: string,
  requestOrigin?: string,
) {
  const snapshot = await loadOwnLotSnapshot({ requestOrigin });
  const query = str(args.query) || userText;
  return ownLotToolResult(snapshot, query);
}

export async function executeRvGrokTool(
  name: string,
  args: Record<string, unknown>,
  ctx: { userText: string; requestOrigin?: string },
): Promise<Record<string, unknown>> {
  if (name === "get_coach_facts") return getCoachFacts(args, ctx.userText);
  if (name === "check_recalls") return checkRecalls(args, ctx.userText, ctx.requestOrigin);
  if (name === "search_listings")
    return searchListings(args, ctx.userText, ctx.requestOrigin);
  if (name === "estimate_payment") return estimatePayment(args);
  if (name === "check_tow") return checkTow(args);
  if (name === "get_own_lot") return getOwnLot(args, ctx.userText, ctx.requestOrigin);
  return { ok: false, error: `unknown tool ${name}` };
}
