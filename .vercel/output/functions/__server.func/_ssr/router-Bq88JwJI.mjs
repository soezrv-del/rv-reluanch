import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react, _ as useRouter, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
//#region node_modules/.nitro/vite/services/ssr/assets/rolldown-runtime-D7D4PA-g.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-Bq88JwJI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Agent tool chip labels/colors (AgentStepsCard). */
var TOOL_META = {
	analyze_requirements: {
		label: "Analyzing Requirements",
		color: "#4DA6FF"
	},
	search_rv_models: {
		label: "Searching RV Models",
		color: "#9B59F5"
	},
	get_model_details: {
		label: "Fetching Model Details",
		color: "#00E676"
	},
	check_market_availability: {
		label: "Checking Market Data",
		color: "#FFD700"
	},
	search_rv_specs: {
		label: "Searching RV Specs",
		color: "#00D4FF"
	},
	search_recalls: {
		label: "Checking Recalls",
		color: "#FF6B6B"
	},
	calculate_loan: {
		label: "Running Loan Math",
		color: "#51CF66"
	},
	compare_models: {
		label: "Comparing Models",
		color: "#CC5DE8"
	},
	analyze_photo: {
		label: "Analyzing Photo",
		color: "#FF6B9D"
	},
	generate_image: {
		label: "Generating Image",
		color: "#C9A227"
	}
};
/** Cloudflare Worker base — xAI bridge */
var DEFAULT_WORKER_URL = "https://rv-assistant.soezrv.workers.dev";
var HISTORY_KEY = "rvgrok_sessions_v1";
var AGENT_MODE_KEY = "rvgrok_agent_mode";
var CREDIT_BAND_ORDER = {
	fair: 0,
	good: 1,
	"very-good": 2,
	excellent: 3
};
var CREDIT_SCORE_LABEL = {
	fair: "600–650",
	good: "650–700",
	"very-good": "700–750",
	excellent: "800–850"
};
var LENDERS_CATALOG_AS_OF = "2026-07-29";
var LENDERS_CATALOG = [
	{
		id: "lightstream",
		name: "LightStream by Truist",
		aprLow: 7.49,
		aprHigh: 10.49,
		termMin: 24,
		termMax: 180,
		minLoan: 5e3,
		minBand: "good",
		maxLoanByBand: {
			good: 1e5,
			"very-good": 2e5,
			excellent: 5e5
		},
		perks: [
			"No fees",
			"Rate Beat Program",
			"Same-day funding"
		],
		badge: "best",
		url: "https://www.lightstream.com/"
	},
	{
		id: "sefinancial",
		name: "Southeast Financial",
		aprLow: 7.99,
		aprHigh: 11.99,
		termMin: 12,
		termMax: 180,
		minLoan: 1e4,
		minBand: "fair",
		maxLoanByBand: {
			fair: 75e3,
			good: 15e4,
			"very-good": 3e5,
			excellent: 75e4
		},
		perks: [
			"RV specialist",
			"180-month terms",
			"Fast approval"
		],
		badge: "high",
		url: "https://www.southeastfinancial.com/"
	},
	{
		id: "essex",
		name: "Essex Credit",
		aprLow: 7.79,
		aprHigh: 11.49,
		termMin: 36,
		termMax: 240,
		minLoan: 25e3,
		minBand: "good",
		maxLoanByBand: {
			good: 15e4,
			"very-good": 4e5,
			excellent: 1e6
		},
		perks: [
			"RV & marine specialist",
			"Long terms",
			"Nationwide"
		],
		badge: "medium",
		url: "https://www.essexcredit.com/"
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
			good: 5e4,
			"very-good": 1e5,
			excellent: 15e4
		},
		perks: [
			"Relationship discounts",
			"Wide branch network",
			"Auto + RV lending"
		],
		badge: "medium",
		url: "https://www.bankofamerica.com/"
	},
	{
		id: "usbank",
		name: "U.S. Bank RV Loans",
		aprLow: 8.49,
		aprHigh: 13.49,
		termMin: 12,
		termMax: 180,
		minLoan: 1e4,
		minBand: "fair",
		maxLoanByBand: {
			fair: 6e4,
			good: 125e3,
			"very-good": 25e4,
			excellent: 5e5
		},
		perks: [
			"National RV programs",
			"Flexible terms",
			"Dealership network"
		],
		badge: "medium",
		url: "https://www.usbank.com/"
	},
	{
		id: "alliant",
		name: "Alliant Credit Union",
		aprLow: 7.24,
		aprHigh: 11.74,
		termMin: 12,
		termMax: 144,
		minLoan: 5e3,
		minBand: "good",
		maxLoanByBand: {
			good: 8e4,
			"very-good": 175e3,
			excellent: 3e5
		},
		perks: [
			"Credit union rates",
			"No prepay penalty",
			"RV & auto"
		],
		badge: "high",
		url: "https://www.alliantcreditunion.org/"
	},
	{
		id: "sheffield",
		name: "Sheffield Financial",
		aprLow: 8.99,
		aprHigh: 14.99,
		termMin: 24,
		termMax: 180,
		minLoan: 5e3,
		minBand: "fair",
		maxLoanByBand: {
			fair: 1e5,
			good: 2e5,
			"very-good": 35e4,
			excellent: 5e5
		},
		perks: [
			"Powersports & RV",
			"Dealer network",
			"Flexible credit review"
		],
		badge: "medium",
		url: "https://www.sheffieldfinancial.com/"
	},
	{
		id: "lazy-days-finance",
		name: "Lazydays Finance Desk",
		aprLow: 7.99,
		aprHigh: 13.49,
		termMin: 36,
		termMax: 240,
		minLoan: 15e3,
		minBand: "fair",
		maxLoanByBand: {
			fair: 12e4,
			good: 3e5,
			"very-good": 6e5,
			excellent: 125e4
		},
		perks: [
			"Highline coach experience",
			"Long terms",
			"Trade-in friendly"
		],
		badge: "high",
		url: "https://www.lazydays.com/"
	}
];
function lenderApr(lender, band) {
	const t = band === "excellent" ? 0 : band === "very-good" ? .28 : band === "good" ? .55 : .85;
	return Math.round((lender.aprLow + (lender.aprHigh - lender.aprLow) * t) * 100) / 100;
}
function monthlyPayment(principal, aprPercent, termMonths) {
	const P = Math.max(0, principal);
	const n = Math.max(1, Math.round(termMonths));
	if (P <= 0) return 0;
	const r = Math.max(0, aprPercent) / 100 / 12;
	if (r === 0) return P / n;
	const pow = Math.pow(1 + r, n);
	return P * r * pow / (pow - 1);
}
function evaluateLenderEligibility(lender, credit, amount) {
	if (CREDIT_BAND_ORDER[credit] < CREDIT_BAND_ORDER[lender.minBand]) return {
		eligible: false,
		reason: `Needs ${lender.minBand.replace("-", " ")} credit (${CREDIT_SCORE_LABEL[lender.minBand]})+`
	};
	if (amount != null && amount < lender.minLoan) return {
		eligible: false,
		reason: `Min loan $${lender.minLoan.toLocaleString("en-US")}`
	};
	if (amount != null && lender.maxLoanByBand) {
		const cap = lender.maxLoanByBand[credit] ?? (credit === "excellent" ? lender.maxLoanByBand["very-good"] : credit === "very-good" ? lender.maxLoanByBand.good : credit === "good" ? lender.maxLoanByBand.fair : lender.maxLoanByBand.fair);
		if (cap != null && amount > cap) return {
			eligible: false,
			reason: `Score ${CREDIT_SCORE_LABEL[credit]} usually caps near $${cap.toLocaleString("en-US")} here — raise score or down payment`
		};
	}
	return { eligible: true };
}
var CREDIT_BANDS = [
	"fair",
	"good",
	"very-good",
	"excellent"
];
function parseCreditBand(raw) {
	if (!raw) return "excellent";
	const v = raw.trim().toLowerCase().replace(/_/g, "-");
	if (CREDIT_BANDS.includes(v)) return v;
	return "excellent";
}
function buildLendersResponse(query) {
	const amount = query.amount != null && Number.isFinite(query.amount) && query.amount > 0 ? query.amount : null;
	const termMonths = query.termMonths != null && Number.isFinite(query.termMonths) && query.termMonths > 0 ? Math.round(query.termMonths) : null;
	const credit = query.credit ?? "excellent";
	const zip = query.zip?.replace(/\D/g, "").slice(0, 5) || null;
	const lenders = LENDERS_CATALOG.map((lender) => {
		const termUsed = termMonths ? Math.min(lender.termMax, Math.max(lender.termMin, termMonths)) : lender.termMax;
		const estimatedApr = lenderApr(lender, credit);
		const gate = evaluateLenderEligibility(lender, credit, amount);
		let estimatedMonthly = null;
		if (gate.eligible && amount != null) estimatedMonthly = monthlyPayment(amount, estimatedApr, termUsed);
		return {
			...lender,
			estimatedApr,
			estimatedMonthly,
			termUsed,
			eligible: gate.eligible,
			ineligibilityReason: gate.reason
		};
	}).sort((a, b) => {
		if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
		const am = a.estimatedMonthly ?? 0xe8d4a51000;
		const bm = b.estimatedMonthly ?? 0xe8d4a51000;
		if (am !== bm) return am - bm;
		return a.estimatedApr - b.estimatedApr;
	});
	const firstOk = lenders.find((l) => l.eligible);
	const withBadges = lenders.map((l) => ({
		...l,
		badge: firstOk && l.id === firstOk.id ? "best" : l.badge === "best" ? "high" : l.badge
	}));
	return {
		source: "curated",
		asOf: LENDERS_CATALOG_AS_OF,
		disclaimer: "Estimated rates from a curated catalog — not live offers or prequalification. Lender eligibility reflects typical credit-score floors and loan-size caps for large RVs. Always confirm with the lender.",
		query: {
			amount,
			termMonths,
			credit,
			zip
		},
		lenders: withBadges
	};
}
/**
* Brochure-backed OEM rows keyed by make|model|year|floorplan (lowercased).
* Year may be a single year or a range covered by yearMin/yearMax in the entry.
*/
var OEM_FLOORPLAN_ROWS = [
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "3250",
		spec: {
			lengthDisplay: `37' 11"`,
			overallLengthIn: 455,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 17500,
			gvwrLbs: 22e3,
			hitchLbs: 3150,
			freshWater: 150,
			grayWater: 156,
			blackWater: 52,
			propaneLbs: 60,
			garageLengthFt: 6.5,
			garageWidthFt: 8,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 30,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "Garage/flex 6' 6\" (48×96 usable) — entertainer layout",
			source: "Brinkley Model G 3250 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "3500",
		spec: {
			lengthDisplay: `40' 2"`,
			overallLengthIn: 482,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 16967,
			gvwrLbs: 22e3,
			hitchLbs: 3320,
			freshWater: 150,
			grayWater: 104,
			blackWater: 104,
			propaneLbs: 60,
			garageLengthFt: 11,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "11' garage/flex · premium residential kitchen",
			source: "Brinkley Model G 3500 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "3520",
		spec: {
			lengthDisplay: `40' 3"`,
			overallLengthIn: 483,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 17700,
			gvwrLbs: 22e3,
			hitchLbs: 3150,
			freshWater: 150,
			grayWater: 156,
			blackWater: 85,
			propaneLbs: 60,
			garageLengthFt: 11,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "11' garage with fold-away ½ baths",
			source: "Brinkley Model G 3520 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "3950",
		spec: {
			lengthDisplay: `45' 5"`,
			overallLengthIn: 545,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 18900,
			gvwrLbs: 23e3,
			hitchLbs: 3450,
			freshWater: 150,
			grayWater: 156,
			blackWater: 85,
			propaneLbs: 60,
			garageLengthFt: 14,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "14' garage/flex with fold-away bath walls",
			source: "Brinkley Model G 3950 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "3970",
		spec: {
			lengthDisplay: `45' 5"`,
			overallLengthIn: 545,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 18900,
			gvwrLbs: 23e3,
			hitchLbs: 3450,
			freshWater: 150,
			grayWater: 156,
			blackWater: 85,
			propaneLbs: 60,
			garageLengthFt: 11,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "11' garage/flex · 2nd full bath",
			source: "Brinkley Model G 3970 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2023,
		yearMax: 2026,
		floorplan: "4000",
		spec: {
			lengthDisplay: `45' 2"`,
			overallLengthIn: 542,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 17674,
			gvwrLbs: 23e3,
			hitchLbs: 3530,
			freshWater: 150,
			grayWater: 104,
			blackWater: 104,
			propaneLbs: 60,
			garageLengthFt: 16,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "16' garage/flex · premium residential kitchen",
			source: "Brinkley Model G 4000 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2024,
		yearMax: 2026,
		floorplan: "4100",
		spec: {
			lengthDisplay: `45' 11"`,
			overallLengthIn: 551,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 18800,
			gvwrLbs: 23e3,
			hitchLbs: 3450,
			freshWater: 150,
			grayWater: 156,
			blackWater: 85,
			propaneLbs: 60,
			garageLengthFt: 12.5,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "12' 6\" garage/flex w/ fold-away ½ bath",
			source: "Brinkley Model G 4100 brochure"
		}
	},
	{
		makeIncludes: "brinkley",
		modelIncludes: "model t",
		yearMin: 2024,
		yearMax: 2026,
		floorplan: "4120",
		spec: {
			lengthDisplay: `46' 3"`,
			overallLengthIn: 555,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 79.5,
			uvwLbs: 18700,
			gvwrLbs: 23e3,
			hitchLbs: 3500,
			freshWater: 150,
			grayWater: 156,
			blackWater: 85,
			propaneLbs: 60,
			garageLengthFt: 17,
			garageWidthFt: 8.5,
			garageHeightIn: 84,
			garageCapacityLbs: 3e3,
			rampPatioLbs: 1500,
			fuelStationGal: 60,
			axles: "Triple 7k",
			tireSize: "215/75R17.5 H (16-ply)",
			note: "17' garage/flex — largest Model G garage class",
			source: "Brinkley Model G 4120 brochure"
		}
	},
	{
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		yearMin: 2020,
		yearMax: 2024,
		floorplan: "36Q",
		spec: {
			lengthDisplay: `37' 3"`,
			overallLengthIn: 447,
			exteriorHeightIn: 154,
			exteriorWidthIn: 102,
			interiorHeightIn: 84,
			uvwLbs: 24500,
			gvwrLbs: 33400,
			hitchLbs: 1e3,
			freshWater: 105,
			grayWater: 75,
			blackWater: 50,
			note: "B6.7 360HP Freightliner XC — not 8.9L ISL. Hitch rating 10,000 lbs / fuel 100 gal (series)",
			source: "Fleetwood Discovery 2022 brochure capacities table"
		}
	},
	{
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		yearMin: 2020,
		yearMax: 2024,
		floorplan: "38K",
		spec: {
			lengthDisplay: `40' 0"`,
			overallLengthIn: 480,
			exteriorHeightIn: 154,
			exteriorWidthIn: 102,
			interiorHeightIn: 84,
			uvwLbs: 25500,
			gvwrLbs: 33400,
			hitchLbs: 1e3,
			freshWater: 105,
			grayWater: 75,
			blackWater: 50,
			note: "2022 Discovery 38K — Cummins B6.7 360HP / Freightliner XC. Series hitch 10k · fuel 100 gal",
			source: "Fleetwood Discovery 2022 brochure capacities table"
		}
	},
	{
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		yearMin: 2020,
		yearMax: 2024,
		floorplan: "38N",
		spec: {
			lengthDisplay: `40' 0"`,
			overallLengthIn: 480,
			exteriorHeightIn: 154,
			exteriorWidthIn: 102,
			interiorHeightIn: 84,
			uvwLbs: 25200,
			gvwrLbs: 33400,
			hitchLbs: 1e3,
			freshWater: 105,
			grayWater: 75,
			blackWater: 50,
			source: "Fleetwood Discovery 2022 brochure capacities table"
		}
	},
	{
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		yearMin: 2020,
		yearMax: 2024,
		floorplan: "38W",
		spec: {
			lengthDisplay: `40' 11"`,
			overallLengthIn: 491,
			exteriorHeightIn: 154,
			exteriorWidthIn: 102,
			interiorHeightIn: 84,
			uvwLbs: 25800,
			gvwrLbs: 33400,
			hitchLbs: 1e3,
			freshWater: 105,
			grayWater: 75,
			blackWater: 50,
			source: "Fleetwood Discovery 2022 brochure capacities table"
		}
	},
	{
		makeIncludes: "grand design",
		modelIncludes: "imagine",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "2800BH",
		spec: {
			lengthDisplay: `32' 0"`,
			overallLengthIn: 384,
			exteriorHeightIn: 134,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 7185,
			gvwrLbs: 10195,
			hitchLbs: 746,
			freshWater: 45,
			grayWater: 82,
			blackWater: 45,
			propaneLbs: 40,
			source: "Grand Design Imagine 2800BH product page"
		}
	},
	{
		makeIncludes: "grand design",
		modelIncludes: "imagine",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "2500RL",
		spec: {
			lengthDisplay: `29' 8"`,
			overallLengthIn: 356,
			exteriorHeightIn: 134,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 6495,
			gvwrLbs: 7995,
			hitchLbs: 680,
			freshWater: 45,
			grayWater: 82,
			blackWater: 45,
			propaneLbs: 40,
			source: "Grand Design Imagine series brochure (2500RL class)"
		}
	},
	{
		makeIncludes: "grand design",
		modelIncludes: "imagine",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "2670MK",
		spec: {
			lengthDisplay: `32' 0"`,
			overallLengthIn: 384,
			exteriorHeightIn: 134,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 6895,
			gvwrLbs: 8995,
			hitchLbs: 720,
			freshWater: 45,
			grayWater: 82,
			blackWater: 45,
			propaneLbs: 40,
			source: "Grand Design Imagine series brochure (2670MK class)"
		}
	},
	{
		makeIncludes: "grand design",
		modelIncludes: "reflection",
		yearMin: 2021,
		yearMax: 2026,
		floorplan: "260RD",
		spec: {
			lengthDisplay: `29' 11"`,
			overallLengthIn: 359,
			exteriorHeightIn: 144,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 7850,
			gvwrLbs: 9995,
			hitchLbs: 1420,
			freshWater: 52,
			grayWater: 71,
			blackWater: 39,
			propaneLbs: 60,
			source: "Grand Design Reflection 150 Series brochure class"
		}
	},
	{
		makeIncludes: "grand design",
		modelIncludes: "reflection",
		yearMin: 2021,
		yearMax: 2026,
		floorplan: "303RLS",
		spec: {
			lengthDisplay: `34' 2"`,
			overallLengthIn: 410,
			exteriorHeightIn: 147,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 8920,
			gvwrLbs: 11995,
			hitchLbs: 1680,
			freshWater: 52,
			grayWater: 78,
			blackWater: 43,
			propaneLbs: 60,
			source: "Grand Design Reflection 150 Series brochure class"
		}
	},
	{
		makeIncludes: "keystone",
		modelIncludes: "cougar half",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "25BHSWE",
		spec: {
			lengthDisplay: `29' 11"`,
			overallLengthIn: 359,
			exteriorHeightIn: 146,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 7825,
			gvwrLbs: 9995,
			hitchLbs: 1450,
			freshWater: 60,
			grayWater: 76,
			blackWater: 38,
			propaneLbs: 60,
			source: "Keystone Cougar Half-Ton brochure class (25BHSWE)"
		}
	},
	{
		makeIncludes: "keystone",
		modelIncludes: "cougar half",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "29BHS",
		spec: {
			lengthDisplay: `33' 8"`,
			overallLengthIn: 404,
			exteriorHeightIn: 148,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 8850,
			gvwrLbs: 11995,
			hitchLbs: 1680,
			freshWater: 60,
			grayWater: 76,
			blackWater: 38,
			propaneLbs: 60,
			source: "Keystone Cougar Half-Ton brochure class (29BHS)"
		}
	},
	{
		makeIncludes: "keystone",
		modelIncludes: "cougar half",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "30BHS",
		spec: {
			lengthDisplay: `34' 11"`,
			overallLengthIn: 419,
			exteriorHeightIn: 148,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 9120,
			gvwrLbs: 11995,
			hitchLbs: 1750,
			freshWater: 60,
			grayWater: 76,
			blackWater: 38,
			propaneLbs: 60,
			source: "Keystone Cougar Half-Ton brochure class (30BHS)"
		}
	},
	{
		makeIncludes: "keystone",
		modelIncludes: "cougar",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "25BHSWE",
		spec: {
			lengthDisplay: `29' 11"`,
			overallLengthIn: 359,
			exteriorHeightIn: 146,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 7825,
			gvwrLbs: 9995,
			hitchLbs: 1450,
			freshWater: 60,
			grayWater: 76,
			blackWater: 38,
			propaneLbs: 60,
			source: "Keystone Cougar Half-Ton brochure class (25BHSWE)"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "four winds",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "28A",
		spec: {
			lengthDisplay: `29' 9"`,
			overallLengthIn: 357,
			exteriorHeightIn: 134,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 12500,
			gvwrLbs: 14500,
			hitchLbs: 500,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Ford E-450 · 7.3L Godzilla recent years",
			source: "Thor Four Winds product / JD Power class (28A)"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "four winds",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "28Z",
		spec: {
			lengthDisplay: `30' 0"`,
			overallLengthIn: 360,
			exteriorHeightIn: 134,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 12800,
			gvwrLbs: 14500,
			hitchLbs: 500,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			source: "Thor Four Winds product page (28Z)"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "four winds",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "25Z",
		spec: {
			lengthDisplay: `26' 3"`,
			overallLengthIn: 315,
			exteriorHeightIn: 132,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 11200,
			gvwrLbs: 12500,
			hitchLbs: 500,
			freshWater: 35,
			grayWater: 28,
			blackWater: 28,
			source: "Thor Four Winds product class (25Z small Class C)"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "chateau",
		yearMin: 2022,
		yearMax: 2026,
		floorplan: "28A",
		spec: {
			lengthDisplay: `29' 9"`,
			overallLengthIn: 357,
			exteriorHeightIn: 134,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 12500,
			gvwrLbs: 14500,
			hitchLbs: 500,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Chateau shares Four Winds cutaway platform",
			source: "Thor Chateau / Four Winds family brochure class"
		}
	},
	{
		makeIncludes: "coachmen",
		modelIncludes: "leprechaun",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "260FS",
		spec: {
			lengthDisplay: `28' 6"`,
			overallLengthIn: 342,
			exteriorHeightIn: 133,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 11800,
			gvwrLbs: 14500,
			hitchLbs: 500,
			freshWater: 50,
			grayWater: 32,
			blackWater: 26,
			source: "Coachmen Leprechaun brochure class (260FS)"
		}
	},
	{
		makeIncludes: "coachmen",
		modelIncludes: "leprechaun",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "319MB",
		spec: {
			lengthDisplay: `32' 9"`,
			overallLengthIn: 393,
			exteriorHeightIn: 134,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 13200,
			gvwrLbs: 14500,
			hitchLbs: 500,
			freshWater: 50,
			grayWater: 32,
			blackWater: 26,
			source: "Coachmen Leprechaun brochure class (319MB)"
		}
	},
	{
		makeIncludes: "forest river",
		modelIncludes: "grey wolf",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "26DBH",
		spec: {
			lengthDisplay: `31' 4"`,
			overallLengthIn: 376,
			exteriorHeightIn: 134,
			exteriorWidthIn: 96,
			interiorHeightIn: 80,
			uvwLbs: 6120,
			gvwrLbs: 7600,
			hitchLbs: 720,
			freshWater: 40,
			grayWater: 38,
			blackWater: 28,
			propaneLbs: 40,
			source: "Forest River Cherokee Grey Wolf brochure class (26DBH)"
		}
	},
	{
		makeIncludes: "forest river",
		modelIncludes: "cherokee",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "26DBH",
		spec: {
			lengthDisplay: `31' 4"`,
			overallLengthIn: 376,
			exteriorHeightIn: 134,
			exteriorWidthIn: 96,
			interiorHeightIn: 80,
			uvwLbs: 6120,
			gvwrLbs: 7600,
			hitchLbs: 720,
			freshWater: 40,
			grayWater: 38,
			blackWater: 28,
			propaneLbs: 40,
			source: "Forest River Cherokee Grey Wolf brochure class (26DBH)"
		}
	},
	{
		makeIncludes: "forest river",
		modelIncludes: "salem",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "26DBUD",
		spec: {
			lengthDisplay: `30' 9"`,
			overallLengthIn: 369,
			exteriorHeightIn: 133,
			exteriorWidthIn: 96,
			interiorHeightIn: 80,
			uvwLbs: 5980,
			gvwrLbs: 7595,
			hitchLbs: 690,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			propaneLbs: 40,
			source: "Forest River Salem brochure class (26DBUD)"
		}
	},
	{
		makeIncludes: "airstream",
		modelIncludes: "flying cloud",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "25FB",
		spec: {
			lengthDisplay: `25' 11"`,
			overallLengthIn: 311,
			exteriorHeightIn: 117,
			exteriorWidthIn: 101.5,
			interiorHeightIn: 78,
			uvwLbs: 5800,
			gvwrLbs: 7300,
			hitchLbs: 725,
			freshWater: 37,
			grayWater: 37,
			blackWater: 39,
			propaneLbs: 40,
			source: "Airstream Flying Cloud brochure class (25FB)"
		}
	},
	{
		makeIncludes: "airstream",
		modelIncludes: "bambi",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "16RB",
		spec: {
			lengthDisplay: `16' 3"`,
			overallLengthIn: 195,
			exteriorHeightIn: 111,
			exteriorWidthIn: 96,
			interiorHeightIn: 74,
			uvwLbs: 3050,
			gvwrLbs: 3500,
			hitchLbs: 430,
			freshWater: 23,
			grayWater: 21,
			blackWater: 18,
			propaneLbs: 30,
			source: "Airstream Bambi 16RB product / walkthrough class"
		}
	},
	{
		makeIncludes: "airstream",
		modelIncludes: "bambi",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "22FB",
		spec: {
			lengthDisplay: `21' 11"`,
			overallLengthIn: 263,
			exteriorHeightIn: 111,
			exteriorWidthIn: 96,
			interiorHeightIn: 74,
			uvwLbs: 4100,
			gvwrLbs: 5e3,
			hitchLbs: 525,
			freshWater: 23,
			grayWater: 21,
			blackWater: 18,
			propaneLbs: 30,
			source: "Airstream Bambi brochure class (22FB)"
		}
	},
	{
		makeIncludes: "alliance",
		modelIncludes: "paradigm",
		yearMin: 2021,
		yearMax: 2026,
		floorplan: "310RL",
		spec: {
			lengthDisplay: `34' 11"`,
			overallLengthIn: 419,
			exteriorHeightIn: 158,
			exteriorWidthIn: 101,
			interiorHeightIn: 102,
			uvwLbs: 13525,
			gvwrLbs: 16995,
			hitchLbs: 2674,
			freshWater: 98,
			grayWater: 98,
			blackWater: 49,
			propaneLbs: 60,
			source: "Alliance Paradigm 310RL product page"
		}
	},
	{
		makeIncludes: "alliance",
		modelIncludes: "paradigm",
		yearMin: 2021,
		yearMax: 2026,
		floorplan: "340RL",
		spec: {
			lengthDisplay: `37' 10"`,
			overallLengthIn: 454,
			exteriorHeightIn: 158,
			exteriorWidthIn: 101,
			interiorHeightIn: 102,
			uvwLbs: 14200,
			gvwrLbs: 17995,
			hitchLbs: 2850,
			freshWater: 98,
			grayWater: 98,
			blackWater: 49,
			propaneLbs: 60,
			source: "Alliance Paradigm 340RL product page class"
		}
	},
	{
		makeIncludes: "alliance",
		modelIncludes: "avenue",
		yearMin: 2021,
		yearMax: 2026,
		floorplan: "32RLS",
		spec: {
			lengthDisplay: `35' 11"`,
			overallLengthIn: 431,
			exteriorHeightIn: 154,
			exteriorWidthIn: 101,
			interiorHeightIn: 102,
			uvwLbs: 11850,
			gvwrLbs: 14995,
			hitchLbs: 2250,
			freshWater: 74,
			grayWater: 74,
			blackWater: 46,
			propaneLbs: 60,
			source: "Alliance Avenue 32RLS product class"
		}
	},
	{
		makeIncludes: "winnebago",
		modelIncludes: "travato",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "59K",
		spec: {
			lengthDisplay: `21' 0"`,
			overallLengthIn: 252,
			exteriorHeightIn: 112,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 8600,
			gvwrLbs: 9350,
			hitchLbs: 350,
			freshWater: 21,
			grayWater: 13,
			blackWater: 11,
			note: "Ram ProMaster 3500 · 3.6L V6 gas — not Sprinter",
			source: "Winnebago Travato brochure class (59K)"
		}
	},
	{
		makeIncludes: "winnebago",
		modelIncludes: "travato",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "59G",
		spec: {
			lengthDisplay: `21' 0"`,
			overallLengthIn: 252,
			exteriorHeightIn: 112,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 8550,
			gvwrLbs: 9350,
			hitchLbs: 350,
			freshWater: 21,
			grayWater: 13,
			blackWater: 11,
			note: "Ram ProMaster 3500 · 3.6L V6 gas",
			source: "Winnebago Travato brochure class (59G)"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "allegro bus",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "45OPP",
		spec: {
			lengthDisplay: `45' 0"`,
			overallLengthIn: 540,
			exteriorHeightIn: 154,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 38500,
			gvwrLbs: 50800,
			hitchLbs: 1500,
			freshWater: 100,
			grayWater: 70,
			blackWater: 50,
			note: "PowerGlide · Cummins L9 class ~450HP (verify year options)",
			source: "Tiffin Allegro Bus brochure class (45OPP)"
		}
	},
	{
		makeIncludes: "newmar",
		modelIncludes: "dutch star",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "4081",
		spec: {
			lengthDisplay: `40' 10"`,
			overallLengthIn: 490,
			exteriorHeightIn: 154,
			exteriorWidthIn: 101.5,
			interiorHeightIn: 84,
			uvwLbs: 33500,
			gvwrLbs: 44460,
			hitchLbs: 1e3,
			freshWater: 105,
			grayWater: 65,
			blackWater: 45,
			note: "Cummins L9 450HP Freightliner XC (Spartan optional some years)",
			source: "Newmar Dutch Star brochure class (4081)"
		}
	},
	{
		makeIncludes: "heartland",
		modelIncludes: "bighorn",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "3375SS",
		spec: {
			lengthDisplay: `37' 6"`,
			overallLengthIn: 450,
			exteriorHeightIn: 158,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 12850,
			gvwrLbs: 15995,
			hitchLbs: 2450,
			freshWater: 64,
			grayWater: 80,
			blackWater: 40,
			propaneLbs: 60,
			source: "Heartland Bighorn brochure class (3375SS)"
		}
	},
	{
		makeIncludes: "dutchmen",
		modelIncludes: "kodiak",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "263BHSL",
		spec: {
			lengthDisplay: `30' 8"`,
			overallLengthIn: 368,
			exteriorHeightIn: 133,
			exteriorWidthIn: 96,
			interiorHeightIn: 80,
			uvwLbs: 5820,
			gvwrLbs: 7595,
			hitchLbs: 680,
			freshWater: 44,
			grayWater: 32,
			blackWater: 32,
			propaneLbs: 40,
			source: "Dutchmen Kodiak Ultimate brochure class (263BHSL)"
		}
	},
	{
		makeIncludes: "palomino",
		modelIncludes: "puma",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "32BHQS",
		spec: {
			lengthDisplay: `36' 4"`,
			overallLengthIn: 436,
			exteriorHeightIn: 135,
			exteriorWidthIn: 96,
			interiorHeightIn: 80,
			uvwLbs: 7450,
			gvwrLbs: 9995,
			hitchLbs: 920,
			freshWater: 43,
			grayWater: 35,
			blackWater: 30,
			propaneLbs: 40,
			source: "Palomino Puma brochure class (32BHQS)"
		}
	},
	{
		makeIncludes: "leisure travel",
		modelIncludes: "unity",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "24FX",
		spec: {
			lengthDisplay: `25' 1"`,
			overallLengthIn: 301,
			exteriorHeightIn: 126,
			exteriorWidthIn: 95,
			interiorHeightIn: 78,
			uvwLbs: 11200,
			gvwrLbs: 12200,
			hitchLbs: 500,
			freshWater: 40,
			grayWater: 30,
			blackWater: 25,
			note: "Mercedes Sprinter · Murphy FX layout",
			source: "Leisure Travel Vans Unity brochure class (24FX / U24FX)"
		}
	},
	{
		makeIncludes: "leisure travel",
		modelIncludes: "unity",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "U24FX",
		spec: {
			lengthDisplay: `25' 1"`,
			overallLengthIn: 301,
			exteriorHeightIn: 126,
			exteriorWidthIn: 95,
			interiorHeightIn: 78,
			uvwLbs: 11200,
			gvwrLbs: 12200,
			hitchLbs: 500,
			freshWater: 40,
			grayWater: 30,
			blackWater: 25,
			source: "Leisure Travel Vans Unity brochure class (U24FX)"
		}
	},
	{
		makeIncludes: "pleasure-way",
		modelIncludes: "plateau",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "TS",
		spec: {
			lengthDisplay: `22' 9"`,
			overallLengthIn: 273,
			exteriorHeightIn: 118,
			exteriorWidthIn: 90,
			interiorHeightIn: 74,
			uvwLbs: 9800,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 30,
			grayWater: 22,
			blackWater: 18,
			note: "Mercedes Sprinter Class B",
			source: "Pleasure-Way Plateau TS product class"
		}
	},
	{
		makeIncludes: "jayco",
		modelIncludes: "eagle",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "29.5BHDS",
		spec: {
			lengthDisplay: `34' 6"`,
			overallLengthIn: 414,
			exteriorHeightIn: 136,
			exteriorWidthIn: 96,
			interiorHeightIn: 81,
			uvwLbs: 7650,
			gvwrLbs: 9995,
			hitchLbs: 890,
			freshWater: 48,
			grayWater: 32.5,
			blackWater: 32.5,
			propaneLbs: 60,
			source: "Jayco Eagle HT brochure class (29.5BHDS)"
		}
	},
	{
		makeIncludes: "jayco",
		modelIncludes: "jay feather",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "22RB",
		spec: {
			lengthDisplay: `26' 8"`,
			overallLengthIn: 320,
			exteriorHeightIn: 130,
			exteriorWidthIn: 96,
			interiorHeightIn: 78,
			uvwLbs: 4980,
			gvwrLbs: 6500,
			hitchLbs: 520,
			freshWater: 42,
			grayWater: 30.5,
			blackWater: 30.5,
			propaneLbs: 40,
			source: "Jayco Jay Feather brochure class (22RB)"
		}
	},
	{
		makeIncludes: "entegra",
		modelIncludes: "vision",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "29S",
		spec: {
			lengthDisplay: `30' 7"`,
			overallLengthIn: 367,
			exteriorHeightIn: 144,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 16200,
			gvwrLbs: 18e3,
			hitchLbs: 500,
			freshWater: 50,
			grayWater: 41,
			blackWater: 27,
			note: "Ford F53 · 7.3L Godzilla recent years",
			source: "Entegra Vision brochure class (29S)"
		}
	},
	{
		makeIncludes: "entegra",
		modelIncludes: "vision",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "27A",
		spec: {
			lengthDisplay: `29' 0"`,
			overallLengthIn: 348,
			exteriorHeightIn: 144,
			exteriorWidthIn: 100,
			interiorHeightIn: 84,
			uvwLbs: 15800,
			gvwrLbs: 18e3,
			hitchLbs: 500,
			freshWater: 50,
			grayWater: 41,
			blackWater: 27,
			source: "Entegra Vision brochure class (27A)"
		}
	},
	{
		makeIncludes: "roadtrek",
		modelIncludes: "zion",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "SLUMBER",
		spec: {
			lengthDisplay: `19' 9"`,
			overallLengthIn: 237,
			exteriorHeightIn: 110,
			exteriorWidthIn: 83,
			interiorHeightIn: 71,
			uvwLbs: 7600,
			gvwrLbs: 9350,
			hitchLbs: 350,
			freshWater: 16,
			grayWater: 12,
			blackWater: 0,
			note: "Ram ProMaster · cassette/composting black often 0 gal tank",
			source: "Roadtrek Zion Slumber brochure class"
		}
	},
	{
		makeIncludes: "storyteller",
		modelIncludes: "mode",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "170",
		spec: {
			lengthDisplay: `24' 0"`,
			overallLengthIn: 288,
			exteriorHeightIn: 116,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 9800,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 30,
			grayWater: 22,
			blackWater: 0,
			note: "Sprinter 170 EXT · cassette black common",
			source: "Storyteller MODE brochure class (170)"
		}
	},
	{
		makeIncludes: "storyteller",
		modelIncludes: "mode",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "144",
		spec: {
			lengthDisplay: `19' 6"`,
			overallLengthIn: 234,
			exteriorHeightIn: 116,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 9e3,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 28,
			grayWater: 20,
			blackWater: 0,
			source: "Storyteller MODE brochure class (144)"
		}
	},
	{
		makeIncludes: "coach house",
		modelIncludes: "platinum ii",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "240SQ",
		spec: {
			lengthDisplay: `24' 6"`,
			overallLengthIn: 294,
			exteriorHeightIn: 126,
			exteriorWidthIn: 95,
			interiorHeightIn: 76,
			uvwLbs: 10500,
			gvwrLbs: 12200,
			hitchLbs: 500,
			freshWater: 35,
			grayWater: 28,
			blackWater: 25,
			note: "Mercedes Sprinter 3500 · SQ layout",
			source: "Coach House Platinum II 240 SQ product class"
		}
	},
	{
		makeIncludes: "coach house",
		modelIncludes: "platinum ii",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "241XL SQ",
		spec: {
			lengthDisplay: `25' 0"`,
			overallLengthIn: 300,
			exteriorHeightIn: 126,
			exteriorWidthIn: 95,
			interiorHeightIn: 76,
			uvwLbs: 11e3,
			gvwrLbs: 12200,
			hitchLbs: 500,
			freshWater: 35,
			grayWater: 28,
			blackWater: 25,
			note: "XL = slideout",
			source: "Coach House Platinum II 241XL class"
		}
	},
	{
		makeIncludes: "midwest",
		modelIncludes: "passage",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "MD2",
		spec: {
			lengthDisplay: `24' 2"`,
			overallLengthIn: 290,
			exteriorHeightIn: 118,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 10200,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 28,
			grayWater: 20,
			blackWater: 0,
			note: "Sprinter 170 EXT · two-seat flagship",
			source: "Midwest Passage MD2 product class"
		}
	},
	{
		makeIncludes: "midwest",
		modelIncludes: "passage",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "FD2",
		spec: {
			lengthDisplay: `19' 6"`,
			overallLengthIn: 234,
			exteriorHeightIn: 118,
			exteriorWidthIn: 83,
			interiorHeightIn: 74,
			uvwLbs: 9200,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 24,
			grayWater: 16,
			blackWater: 0,
			note: "Sprinter 144 · compact FD2",
			source: "Midwest Passage FD2 product class"
		}
	},
	{
		makeIncludes: "coachmen",
		modelIncludes: "galleria",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "24A",
		spec: {
			lengthDisplay: `24' 6"`,
			overallLengthIn: 294,
			exteriorHeightIn: 124,
			exteriorWidthIn: 90,
			interiorHeightIn: 74,
			uvwLbs: 9800,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 28,
			grayWater: 22,
			blackWater: 15,
			note: "Mercedes Sprinter Class B",
			source: "Coachmen Galleria brochure class (24A)"
		}
	},
	{
		makeIncludes: "coachmen",
		modelIncludes: "galleria",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "24T",
		spec: {
			lengthDisplay: `24' 6"`,
			overallLengthIn: 294,
			exteriorHeightIn: 124,
			exteriorWidthIn: 90,
			interiorHeightIn: 74,
			uvwLbs: 9900,
			gvwrLbs: 11030,
			hitchLbs: 500,
			freshWater: 28,
			grayWater: 22,
			blackWater: 15,
			source: "Coachmen Galleria brochure class (24T)"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "vegas",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "24.1",
		spec: {
			lengthDisplay: `25' 8"`,
			overallLengthIn: 308,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 10500,
			gvwrLbs: 12500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Vegas 24.1 · Ford 7.3L 325/450 · cutaway Class A body · sister Axis 24.1",
			source: "Thor Motor Coach Vegas OEM floorplan specs"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "vegas",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "26.1",
		spec: {
			lengthDisplay: `27' 2"`,
			overallLengthIn: 326,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 11800,
			gvwrLbs: 14500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Vegas 26.1 · GVWR 14,500",
			source: "Thor Motor Coach Vegas OEM floorplan specs"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "vegas",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "26.2",
		spec: {
			lengthDisplay: `27' 2"`,
			overallLengthIn: 326,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 11800,
			gvwrLbs: 14500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Vegas 26.2 · GVWR 14,500",
			source: "Thor Motor Coach Vegas OEM floorplan specs"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "vegas",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "28.1",
		spec: {
			lengthDisplay: `30' 6"`,
			overallLengthIn: 366,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 12200,
			gvwrLbs: 14500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Vegas 28.1 · ~30' 6\" · GVWR 14,500",
			source: "Thor Motor Coach Vegas OEM floorplan specs"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "axis",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "24.1",
		spec: {
			lengthDisplay: `25' 8"`,
			overallLengthIn: 308,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 10500,
			gvwrLbs: 12500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Axis 24.1 · same platform as Vegas 24.1 · Ford 7.3L 325/450",
			source: "Thor Motor Coach Axis OEM floorplan specs"
		}
	},
	{
		makeIncludes: "thor",
		modelIncludes: "axis",
		yearMin: 2020,
		yearMax: 2026,
		floorplan: "28.1",
		spec: {
			lengthDisplay: `30' 6"`,
			overallLengthIn: 366,
			exteriorHeightIn: 132,
			exteriorWidthIn: 94,
			interiorHeightIn: 80,
			uvwLbs: 12200,
			gvwrLbs: 14500,
			hitchLbs: 8e3,
			freshWater: 40,
			grayWater: 30,
			blackWater: 30,
			note: "Axis 28.1 · sister to Vegas 28.1",
			source: "Thor Motor Coach Axis OEM floorplan specs"
		}
	},
	{
		makeIncludes: "jayco",
		modelIncludes: "seneca",
		yearMin: 2021,
		yearMax: 2027,
		floorplan: "37K",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26e3,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 50,
			blackWater: 50,
			sleeps: 6,
			slideouts: 2,
			layoutNote: "Bath-and-a-half · king · 93\" sofa / fireplace · couples + guests",
			note: "Seneca 37K bath-and-a-half · sleeps 6 · S2RV Plus · ISB 6.7 360/800 · GCWR 43,000",
			source: "Jayco Seneca OEM Super C specs"
		}
	},
	{
		makeIncludes: "jayco",
		modelIncludes: "seneca",
		yearMin: 2021,
		yearMax: 2027,
		floorplan: "37L",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26200,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 50,
			blackWater: 50,
			sleeps: 9,
			slideouts: 3,
			layoutNote: "Bunkhouse · king + cabover + two 300-lb bunks · theater seats · families",
			note: "Seneca 37L bunkhouse · sleeps 9 · same S2RV Plus 360/800 package",
			source: "Jayco Seneca OEM Super C specs"
		}
	},
	{
		makeIncludes: "jayco",
		modelIncludes: "seneca",
		yearMin: 2021,
		yearMax: 2027,
		floorplan: "37M",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26500,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 50,
			blackWater: 50,
			sleeps: 8,
			slideouts: 3,
			layoutNote: "Opposing slides · king · open living · no dedicated bunks",
			note: "Seneca 37M opposing slides · sleeps 8 · ISB 6.7 360/800 · hitch 12k",
			source: "Jayco Seneca OEM Super C specs"
		}
	},
	{
		makeIncludes: "entegra",
		modelIncludes: "accolade",
		yearMin: 2024,
		yearMax: 2026,
		floorplan: "37K",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26e3,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 91,
			blackWater: 63,
			note: "Accolade 37K · same Super C as Jayco Seneca · S2RV Plus · ISB 6.7 360/800 · GCWR 43,000",
			source: "Entegra Accolade OEM Super C specs"
		}
	},
	{
		makeIncludes: "entegra",
		modelIncludes: "accolade",
		yearMin: 2024,
		yearMax: 2026,
		floorplan: "37L",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26200,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 81,
			blackWater: 50,
			note: "Accolade 37L bunks · Seneca sibling · hitch 12k",
			source: "Entegra Accolade OEM Super C specs"
		}
	},
	{
		makeIncludes: "entegra",
		modelIncludes: "accolade",
		yearMin: 2024,
		yearMax: 2026,
		floorplan: "37M",
		spec: {
			lengthDisplay: `39' 4"`,
			overallLengthIn: 472,
			exteriorHeightIn: 160,
			exteriorWidthIn: 101,
			interiorHeightIn: 84,
			uvwLbs: 26500,
			gvwrLbs: 31e3,
			hitchLbs: 12e3,
			freshWater: 72,
			grayWater: 80,
			blackWater: 50,
			note: "Accolade 37M theater · Seneca sibling · ISB 6.7 360/800",
			source: "Entegra Accolade OEM Super C specs"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "37BH",
		spec: {
			lengthDisplay: `38' 7"`,
			overallLengthIn: 463,
			exteriorHeightIn: 151,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 32e3,
			gvwrLbs: 38320,
			hitchLbs: 1e4,
			freshWater: 90,
			grayWater: 66,
			blackWater: 50,
			note: "WB 234 · GAWR-F 14,320 · GAWR-R 24,000 · GCWR 48,320 · L9 380 only (450 NOT offered on 37BH)",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "40AH",
		spec: {
			lengthDisplay: `41' 5"`,
			overallLengthIn: 497,
			exteriorHeightIn: 151,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 33e3,
			gvwrLbs: 38320,
			hitchLbs: 1e4,
			freshWater: 90,
			grayWater: 66,
			blackWater: 50,
			note: "WB 266 · L9 380 std / 450 optional",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "40IH",
		spec: {
			lengthDisplay: `41' 4"`,
			overallLengthIn: 496,
			exteriorHeightIn: 159,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 33500,
			gvwrLbs: 39600,
			hitchLbs: 1e4,
			freshWater: 100,
			grayWater: 100,
			blackWater: 55,
			note: "WB 266 · GAWR-F 15,600 · L9 380 std",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "40QBH",
		spec: {
			lengthDisplay: `40' 0"`,
			overallLengthIn: 480,
			exteriorHeightIn: 151,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 32800,
			gvwrLbs: 38320,
			hitchLbs: 1e4,
			freshWater: 90,
			grayWater: 66,
			blackWater: 50,
			note: "Brochure 40 QBH · WB 266 · L9 380 std",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "40QKH",
		spec: {
			lengthDisplay: `40' 0"`,
			overallLengthIn: 480,
			exteriorHeightIn: 151,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 32800,
			gvwrLbs: 38320,
			hitchLbs: 1e4,
			freshWater: 90,
			grayWater: 66,
			blackWater: 50,
			note: "Brochure 40 QKH · WB 266 · L9 380 std",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	},
	{
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		yearMin: 2019,
		yearMax: 2026,
		floorplan: "44OH",
		spec: {
			lengthDisplay: `44' 0"`,
			overallLengthIn: 528,
			exteriorHeightIn: 159,
			exteriorWidthIn: 101,
			interiorHeightIn: 83,
			uvwLbs: 38e3,
			gvwrLbs: 45600,
			hitchLbs: 1e4,
			freshWater: 100,
			grayWater: 100,
			blackWater: 55,
			note: "Tag axle · WB 310 · GAWR-tag 10,000 · 450 HP option common — confirm build",
			source: "Tiffin Phaeton OEM brochure weights & measures"
		}
	}
];
for (const row of [...OEM_FLOORPLAN_ROWS]) if (row.modelIncludes === "model t") OEM_FLOORPLAN_ROWS.push({
	...row,
	modelIncludes: "model g",
	spec: { ...row.spec }
});
/** Look up brochure-backed floorplan specs when available. */
function findOemFloorplanSpec(year, make, model, floorplan) {
	if (!floorplan?.trim()) return null;
	const y = typeof year === "number" ? year : parseInt(String(year), 10);
	if (!Number.isFinite(y)) return null;
	const mk = make.toLowerCase();
	const md = model.toLowerCase();
	const fp = floorplan.trim().toUpperCase().replace(/\s+/g, "");
	let best = null;
	let bestScore = -1;
	for (const row of OEM_FLOORPLAN_ROWS) {
		if (y < row.yearMin || y > row.yearMax) continue;
		if (!mk.includes(row.makeIncludes)) continue;
		if (!md.includes(row.modelIncludes)) continue;
		if (row.modelIncludes === "discovery" && md.includes("lxe") && !row.modelIncludes.includes("lxe")) continue;
		if (row.modelIncludes === "cougar" && (md.includes("half") || md.includes("5th") || md.includes("fifth")) && row.modelIncludes === "cougar") {}
		if (row.floorplan.toUpperCase().replace(/\s+/g, "") !== fp) continue;
		const score = row.modelIncludes.length * 10 + row.makeIncludes.length;
		if (score > bestScore) {
			bestScore = score;
			best = row.spec;
		}
	}
	return best;
}
/** Leading 2-digit length from floorplan code, if present and sane. */
function lengthFtFromFloorplan(floorplan, lengthRange, opts) {
	if (!floorplan) return null;
	const raw = floorplan.trim();
	const [lo, hi] = lengthRange;
	const make = (opts?.make || "").toLowerCase();
	const model = (opts?.model || "").toLowerCase();
	if (/^\d{4}$/.test(raw) && (make.includes("brinkley") || model.includes("model t") || model.includes("model g") || /5\d$/.test(raw))) {
		if (make.includes("brinkley") || model.includes("model t") || model.includes("model g")) return null;
		const lead = parseInt(raw.slice(0, 2), 10);
		if (Number.isFinite(lead) && (lead < lo - 3 || lead > hi + 3)) return null;
	}
	let n = null;
	const m2 = raw.match(/^(\d{2})/);
	if (m2) n = parseInt(m2[1], 10);
	if (n == null || !Number.isFinite(n)) return null;
	if (n < lo - 3 || n > hi + 3) return null;
	return n;
}
/** Typical bumper/cap extra beyond floorplan class length (OEM: 37BH → 38' 7"). */
function overallOffsetInches(type) {
	const t = (type || "").toLowerCase();
	if (t.includes("class a") && t.includes("diesel")) return 19;
	if (t.includes("class a")) return 14;
	if (t.includes("super c")) return 12;
	if (t.includes("class c")) return 10;
	if (t.includes("class b")) return 4;
	if (t.includes("fifth")) return 6;
	if (t.includes("toy hauler")) return 8;
	if (t.includes("travel trailer")) return 6;
	return 8;
}
/**
* Actual overall length in inches for a selected floorplan.
* Uses leading class digits + typical OEM cap/bumper, clamped to the model span.
*/
function overallInchesFromFloorplan(floorplan, lengthRange, opts) {
	const n = lengthFtFromFloorplan(floorplan, lengthRange, opts);
	if (n == null) return null;
	const extra = overallOffsetInches(opts?.type);
	const inches = n * 12 + extra;
	const lo = Math.max(12, lengthRange[0] * 12);
	const hi = lengthRange[1] * 12 + 24;
	return Math.min(hi, Math.max(lo, inches));
}
function formatInchesAsFtIn(totalIn) {
	const whole = Math.floor(totalIn / 12);
	let inches = Math.round(totalIn - whole * 12);
	if (inches === 12) return `${whole + 1}' 0"`;
	if (inches === 0) return `${whole}' 0"`;
	return `${whole}' ${inches}"`;
}
function formatFloorplanLength(floorplan, lengthRange, opts) {
	const inches = overallInchesFromFloorplan(floorplan, lengthRange, opts);
	if (inches != null) return formatInchesAsFtIn(inches);
	if (lengthRange[0] === lengthRange[1]) return formatInchesAsFtIn(lengthRange[0] * 12);
	if (floorplan?.trim()) {
		const mid = (lengthRange[0] + lengthRange[1]) / 2;
		return formatInchesAsFtIn(Math.round(mid * 12));
	}
	return `${lengthRange[0]}–${lengthRange[1]} ft`;
}
/** Weight estimate narrowed by floorplan length position in range. */
function weightForFloorplan(floorplan, weightRange, lengthRange, opts) {
	const [wLo, wHi] = weightRange;
	const midDefault = (wLo + wHi) / 2;
	const len = lengthFtFromFloorplan(floorplan, lengthRange, opts);
	let mid = midDefault;
	if (len != null && lengthRange[1] > lengthRange[0]) mid = wLo + Math.min(1, Math.max(0, (len - lengthRange[0]) / (lengthRange[1] - lengthRange[0]))) * (wHi - wLo);
	if (len != null) {
		const lo = Math.round(mid * .94 / 100) * 100;
		const hi = Math.round(mid * 1.06 / 100) * 100;
		const uvw = Math.round(mid * .82);
		const ccc = Math.max(800, Math.round(mid - uvw));
		return {
			gvwr: `${lo.toLocaleString()}–${hi.toLocaleString()} lbs`,
			uvwEst: uvw,
			cccEst: ccc,
			mid
		};
	}
	const uvw = Math.round(midDefault * .82);
	const ccc = Math.max(800, Math.round(midDefault - uvw));
	return {
		gvwr: `${wLo.toLocaleString()}–${wHi.toLocaleString()} lbs`,
		uvwEst: uvw,
		cccEst: ccc,
		mid: midDefault
	};
}
/**
* Verified / brochure-backed patches. Prefer official MY brochures.
* Display + cache layers pin these over Live Grok so sibling-model steals
* (e.g. Allegro Bus ISL on a RED, gas F53 Allegro Open Road on a RED) never stick.
*/
var POWERTRAIN_CORRECTIONS = [
	{
		yearMin: 2018,
		yearEnd: 2027,
		makeIncludes: "jayco",
		modelIncludes: "seneca",
		engine: "Cummins ISB 6.7L 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner S2RV Plus",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Jayco Seneca Super C OEM: ISB 6.7 360/800 · S2RV Plus · Allison 3000 MH · 100 gal · hitch 12k — not Power Stroke F-550 default"
	},
	{
		yearMin: 2018,
		yearEnd: 2026,
		makeIncludes: "entegra",
		modelIncludes: "accolade",
		engine: "Cummins ISB 6.7L 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner S2RV Plus",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Entegra Accolade / Accolade XL is the Seneca sibling: same S2RV Plus · ISB 6.7 360/800 · Allison 3000 MH · 100 gal · hitch 12k"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "entegra",
		modelIncludes: "centurion",
		floorplanIncludes: "39N",
		engine: "Detroit DD13 GEN 5 12.8L 525HP",
		horsepower: 525,
		torqueLbFt: 1850,
		chassis: "Freightliner Cascadia 116 Day Cab",
		transmission: "12-speed overdrive automated manual",
		fuelType: "Diesel",
		note: "Centurion 39N — Cascadia 116 · DD13 525/1850 · hitch 20k. Not Accolade ISB."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "entegra",
		modelIncludes: "centurion",
		floorplanIncludes: "39K",
		engine: "Detroit DD13 GEN 5 12.8L 525HP",
		horsepower: 525,
		torqueLbFt: 1850,
		chassis: "Freightliner Cascadia 116 Day Cab",
		transmission: "12-speed overdrive automated manual",
		fuelType: "Diesel",
		note: "Centurion 39K — Cascadia 116 · DD13 525/1850 · hitch 20k. Not Accolade ISB."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "entegra",
		modelIncludes: "centurion",
		floorplanIncludes: "45D",
		engine: "Detroit DD16 15.6L 600HP",
		horsepower: 600,
		torqueLbFt: 1850,
		chassis: "Freightliner Cascadia 126",
		transmission: "12-speed overdrive automated manual",
		fuelType: "Diesel",
		note: "Centurion 45D — Cascadia 126 · DD16 600/1850 · hitch 30k."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "entegra",
		modelIncludes: "centurion",
		engine: "Detroit DD13 GEN 5 12.8L 525HP",
		horsepower: 525,
		torqueLbFt: 1850,
		chassis: "Freightliner Cascadia 116 Day Cab",
		transmission: "12-speed overdrive automated manual",
		fuelType: "Diesel",
		note: "Centurion default 39-class DD13 525 — pick 45D for DD16 600"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "grand star",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner S2RV",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Grand Star Super C — S2RV B 360/800 hitch 12k. Not Cascadia."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "northern star",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner Custom Chassis",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Northern Star diesel pusher 360/800 — not Super C."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "summit aire",
		engine: "Detroit DD16 600HP",
		horsepower: 600,
		torqueLbFt: 1850,
		chassis: "Freightliner Cascadia 126 tandem axle",
		fuelType: "Diesel",
		note: "Summit Aire flagship Super C DD16 600 / 30k hitch"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "freedom aire",
		engine: "Mercedes-Benz 2.0L turbo diesel 208HP",
		horsepower: 208,
		torqueLbFt: 332,
		chassis: "Mercedes-Benz Sprinter 4500",
		fuelType: "Diesel",
		note: "Freedom Aire Sprinter 208/332 — not a pusher"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "super star",
		floorplanIncludes: "4140",
		engine: "Cummins 450HP (Freightliner M2-112)",
		horsepower: 450,
		torqueLbFt: 1250,
		chassis: "Freightliner M2-112",
		fuelType: "Diesel",
		note: "Super Star 41 ft M2-112 450"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "newmar",
		modelIncludes: "super star",
		engine: "Cummins 360HP (Freightliner M2-106)",
		horsepower: 360,
		torqueLbFt: 1150,
		chassis: "Freightliner M2-106",
		fuelType: "Diesel",
		note: "Super Star 37–40 default M2-106 360"
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "grand design",
		modelIncludes: "lineage series e",
		engine: "Ford 7.3L V8 gas 325HP",
		horsepower: 325,
		torqueLbFt: 450,
		chassis: "Ford Econoline E-450 DRW",
		transmission: "6-speed TorqShift",
		fuelType: "Gas",
		note: "Lineage Series E — E-450 7.3 gas 325/450 · hitch 7,500. Not Sprinter."
	},
	{
		yearMin: 2025,
		yearEnd: 2027,
		makeIncludes: "grand design",
		modelIncludes: "lineage series m",
		engine: "Mercedes-Benz 2.0L twin-turbo diesel 208HP",
		horsepower: 208,
		torqueLbFt: 332,
		chassis: "Mercedes-Benz Sprinter 4500",
		transmission: "9G-Tronic automatic",
		fuelType: "Diesel",
		note: "Lineage Series M — Sprinter 4500 208/332. Not E-450 gas."
	},
	{
		yearMin: 2025,
		yearEnd: 2027,
		makeIncludes: "grand design",
		modelIncludes: "lineage series f",
		engine: "Ford 6.7L Power Stroke 330HP",
		horsepower: 330,
		torqueLbFt: 950,
		chassis: "Ford Super Duty 4x4",
		transmission: "10-speed automatic",
		fuelType: "Diesel",
		note: "Lineage Series F — Power Stroke 6.7 Super C 4x4. 31ZW F-600 15k hitch."
	},
	{
		yearMin: 2026,
		yearEnd: 2027,
		makeIncludes: "grand design",
		modelIncludes: "lineage series vt",
		engine: "Ford 3.5L EcoBoost V6 310HP",
		horsepower: 310,
		torqueLbFt: 400,
		chassis: "Ford Transit 350 AWD",
		transmission: "10-speed automatic",
		fuelType: "Gas",
		note: "Lineage Series VT LVT1 — Transit AWD EcoBoost 310/400."
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "jayco",
		modelIncludes: "precept",
		engine: "Ford 7.3L V8 Godzilla 335HP",
		horsepower: 335,
		torqueLbFt: 468,
		chassis: "Ford F53",
		transmission: "TorqShift 6-speed automatic",
		fuelType: "Gas",
		note: "Precept is gas F53 335/468 — not diesel X15"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "jayco",
		modelIncludes: "alante",
		engine: "Ford 7.3L V8 Godzilla 335HP",
		horsepower: 335,
		torqueLbFt: 468,
		chassis: "Ford F53",
		transmission: "TorqShift 6-speed automatic",
		fuelType: "Gas",
		note: "Alante gas F53 — not diesel"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "thor",
		modelIncludes: "vegas",
		engine: "Ford 7.3L V8 (Godzilla) 325HP",
		horsepower: 325,
		torqueLbFt: 450,
		chassis: "Ford E-Series cutaway (Class A body)",
		transmission: "TorqShift automatic",
		fuelType: "Gas",
		note: "Vegas compact RUV — cutaway chassis NOT F53; Thor OEM 325/450, 55 gal, hitch 8k"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "thor",
		modelIncludes: "axis",
		engine: "Ford 7.3L V8 (Godzilla) 325HP",
		horsepower: 325,
		torqueLbFt: 450,
		chassis: "Ford E-Series cutaway (Class A body)",
		transmission: "TorqShift automatic",
		fuelType: "Gas",
		note: "Axis sister to Vegas — same cutaway 7.3L package, not F53 ACE/Windsport"
	},
	{
		yearMin: 2014,
		yearEnd: 2019,
		makeIncludes: "thor",
		modelIncludes: "vegas",
		engine: "Ford Triton V10 6.8L",
		horsepower: 305,
		torqueLbFt: 420,
		chassis: "Ford E-350 / E-450 cutaway",
		fuelType: "Gas",
		note: "Early Vegas V10 cutaway"
	},
	{
		yearMin: 2014,
		yearEnd: 2019,
		makeIncludes: "thor",
		modelIncludes: "axis",
		engine: "Ford Triton V10 6.8L",
		horsepower: 305,
		torqueLbFt: 420,
		chassis: "Ford E-350 / E-450 cutaway",
		fuelType: "Gas",
		note: "Early Axis V10 cutaway"
	},
	{
		yearMin: 2018,
		yearEnd: 2024,
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		engine: "Cummins B6.7 (ISB)",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XC-Series",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Regular Discovery — not LXE / not ISL 8.9"
	},
	{
		yearMin: 2018,
		yearEnd: 2024,
		makeIncludes: "fleetwood",
		modelIncludes: "discovery lxe",
		engine: "Cummins L9",
		horsepower: 450,
		torqueLbFt: 1250,
		chassis: "Freightliner / Spartan (by option)",
		fuelType: "Diesel",
		note: "Discovery LXE high-line"
	},
	{
		yearMin: 2018,
		yearEnd: 2026,
		makeIncludes: "entegra",
		modelIncludes: "reatta",
		engine: "Cummins B6.7 turbo diesel",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Spartan K1 raised-rail",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Reatta diesel — not Aspire/Anthem L9"
	},
	{
		yearMin: 2019,
		yearEnd: 2026,
		makeIncludes: "entegra",
		modelIncludes: "vision",
		engine: "Ford 7.3L V8 Godzilla",
		horsepower: 350,
		torqueLbFt: 468,
		chassis: "Ford F-53",
		transmission: "TorqShift 6-speed automatic",
		fuelType: "Gas",
		note: "Vision gas F-53 only — never diesel"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "bay star",
		engine: "Ford 7.3L V8 Godzilla",
		horsepower: 350,
		torqueLbFt: 468,
		chassis: "Ford F53",
		transmission: "TorqShift 6-speed automatic",
		fuelType: "Gas",
		note: "Bay Star gas F-53 Godzilla — never diesel L9 450; not Kountry Star"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "forest river",
		modelIncludes: "fr3",
		engine: "Ford 7.3L V8 Godzilla",
		horsepower: 335,
		torqueLbFt: 468,
		chassis: "Ford F53",
		transmission: "TorqShift 6-speed automatic",
		fuelType: "Gas",
		note: "FR3 gas Class A — Ford 7.3 Godzilla 335/468 on F53; not diesel"
	},
	{
		yearMin: 2015,
		yearEnd: 2019,
		makeIncludes: "forest river",
		modelIncludes: "fr3",
		engine: "Ford Triton V10 6.8L",
		horsepower: 320,
		chassis: "Ford F53",
		transmission: "TorqShift automatic",
		fuelType: "Gas",
		note: "FR3 pre-Godzilla Triton V10 era"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "kountry star",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Kountry Star diesel pusher — Cummins B6.7 360/800 on Freightliner XCR (OEM). Not Bay Star 7.3 gas, not Dutch Star L9 450"
	},
	{
		yearMin: 2012,
		yearEnd: 2019,
		makeIncludes: "newmar",
		modelIncludes: "kountry star",
		engine: "Cummins ISB / B6.7 diesel",
		horsepower: 340,
		torqueLbFt: 700,
		chassis: "Freightliner XC / XCR",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Kountry Star mid-diesel — not Ford F53 gas, not L9 450"
	},
	{
		yearMin: 2018,
		yearEnd: 2026,
		makeIncludes: "thor",
		modelIncludes: "palazzo",
		engine: "Cummins B6.7 (ISB) 340HP",
		horsepower: 340,
		torqueLbFt: 700,
		chassis: "Freightliner XC-S",
		transmission: "Allison 2100 / 2500 MH",
		fuelType: "Diesel",
		note: "Palazzo mid-diesel — not ISL 8.9"
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "winnebago",
		modelIncludes: "forza",
		engine: "Cummins B6.7 (ISB) 340HP",
		horsepower: 340,
		torqueLbFt: 700,
		chassis: "Freightliner XC",
		fuelType: "Diesel",
		note: "Forza mid-diesel — not ISL 8.9"
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "winnebago",
		modelIncludes: "journey",
		engine: "Cummins B6.7 / ISB 340HP",
		horsepower: 340,
		torqueLbFt: 700,
		chassis: "Freightliner XC",
		fuelType: "Diesel",
		note: "Journey diesel — B6.7 class not ISL"
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "winnebago",
		modelIncludes: "adventurer",
		engine: "Ford 6.8L V10 / 7.3L Godzilla (by year)",
		horsepower: 320,
		chassis: "Ford F53",
		fuelType: "Gas",
		note: "Post-V10 F53 gas Class A"
	},
	{
		yearMin: 2010,
		yearEnd: 2013,
		makeIncludes: "tiffin",
		modelIncludes: "allegro red",
		engine: "Cummins ISB 6.7L 340HP",
		horsepower: 340,
		torqueLbFt: 700,
		chassis: "Freightliner XC raised-rail",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Allegro RED diesel pusher — not Ford F53 V10 gas"
	},
	{
		yearMin: 2014,
		yearEnd: 2017,
		makeIncludes: "tiffin",
		modelIncludes: "allegro red",
		engine: "Cummins ISB / B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XC / XCR raised-rail",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "2014–2017 Allegro RED mid-diesel — not ISL 8.9 / not L9 flagship"
	},
	{
		yearMin: 2014,
		yearEnd: 2017,
		makeIncludes: "tiffin",
		modelIncludes: "allegro red 340",
		engine: "Cummins ISB / B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XC / XCR raised-rail",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "RED 340 2014–2017 — mid-diesel only"
	},
	{
		yearMin: 2018,
		yearEnd: 2026,
		makeIncludes: "tiffin",
		modelIncludes: "allegro red 340",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XC-Series",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "RED 340 mid-diesel — not L9/ISL bus class"
	},
	{
		yearMin: 2019,
		yearEnd: 2026,
		makeIncludes: "tiffin",
		modelIncludes: "allegro bus",
		engine: "Cummins L9 450HP (X12 optional)",
		horsepower: 450,
		torqueLbFt: 1250,
		chassis: "Tiffin PowerGlide",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel"
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		floorplanIncludes: "37bh",
		engine: "Cummins L9 380HP",
		horsepower: 380,
		torqueLbFt: 1150,
		chassis: "Freightliner / Tiffin PowerGlide (by option)",
		transmission: "Allison 3000 MH 6-speed",
		fuelType: "Diesel",
		note: "37BH Phaeton OEM: L9 380 / 1,150 only — 450 was NOT offered on 37BH."
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		floorplanIncludes: "44oh",
		engine: "Cummins L9 380HP (450 optional on tag axle)",
		horsepower: 380,
		torqueLbFt: 1150,
		chassis: "Freightliner / Tiffin PowerGlide (by option)",
		transmission: "Allison 3000 MH 6-speed",
		fuelType: "Diesel",
		note: "44OH — 380 standard; 450 may be available. Confirm build."
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		engine: "Cummins L9 380HP",
		horsepower: 380,
		torqueLbFt: 1150,
		chassis: "Freightliner / Tiffin PowerGlide (by option)",
		transmission: "Allison 3000 MH 6-speed",
		fuelType: "Diesel",
		note: "Phaeton brochure default L9 380/1150. 450 only on select floorplans (not 37BH)."
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4037",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 40-ft class — OEM L9 400/1250 (not B6.7 360)"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4041",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 40-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4369",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 43-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4310",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 43-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "3436",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR / Spartan K2",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 34-ft class — OEM B6.7 360/800 (not L9)"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "3717",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR / Spartan K2",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 37-ft class — OEM B6.7 360/800"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "3407",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR / Spartan K2",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 34-ft class — OEM B6.7 360/800"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "3412",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR / Spartan K2",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 34-ft class — OEM B6.7 360/800"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "3709",
		engine: "Cummins B6.7 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCR / Spartan K2",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 37-ft class — OEM B6.7 360/800"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4068",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 40-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4326",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 43-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4328",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 43-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2020,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "ventana",
		floorplanIncludes: "4334",
		engine: "Cummins L9 400HP",
		horsepower: 400,
		torqueLbFt: 1250,
		chassis: "Freightliner XCR Tag / Spartan K2 Tag",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana 43-ft class — OEM L9 400/1250"
	},
	{
		yearMin: 2012,
		yearEnd: 2019,
		makeIncludes: "newmar",
		modelIncludes: "ventana le",
		engine: "Cummins ISB 6.7L 340HP",
		horsepower: 340,
		torqueLbFt: 800,
		chassis: "Freightliner XCR",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana LE default — ISB 340/800, not L9 400 and not Ford 7.3"
	},
	{
		yearMin: 2012,
		yearEnd: 2019,
		makeIncludes: "newmar",
		modelIncludes: "ventana le",
		floorplanIncludes: "4037",
		engine: "Cummins ISB 6.7L 360HP",
		horsepower: 360,
		torqueLbFt: 1e3,
		chassis: "Freightliner XCR",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana LE 40-ft — ISB 360"
	},
	{
		yearMin: 2012,
		yearEnd: 2019,
		makeIncludes: "newmar",
		modelIncludes: "ventana le",
		floorplanIncludes: "4002",
		engine: "Cummins ISB 6.7L 360HP",
		horsepower: 360,
		torqueLbFt: 1e3,
		chassis: "Freightliner XCR",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Ventana LE 40-ft — ISB 360"
	},
	{
		yearMin: 2022,
		yearEnd: 2026,
		makeIncludes: "newmar",
		modelIncludes: "new aire",
		engine: "Cummins L9 450HP",
		horsepower: 450,
		torqueLbFt: 1250,
		chassis: "Freightliner / Spartan K2 (by option)",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Recent New Aire — L9 ~450/1250 (not B6.7 360)"
	},
	{
		yearMin: 2014,
		yearEnd: 2018,
		makeIncludes: "newmar",
		modelIncludes: "new aire",
		engine: "Cummins B6.7 / ISB 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XCS",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Early New Aire — B6.7/ISB 360/800"
	},
	{
		yearMin: 2005,
		yearEnd: 2015,
		makeIncludes: "fleetwood",
		modelIncludes: "bounder",
		engine: "Ford Triton V10 6.8L",
		horsepower: 320,
		chassis: "Ford F53",
		fuelType: "Gas",
		note: "2005–2015 Bounder — V10 era (not 7.3 Godzilla)"
	},
	{
		yearMin: 2005,
		yearEnd: 2015,
		makeIncludes: "fleetwood",
		modelIncludes: "southwind",
		engine: "Ford Triton V10 6.8L",
		horsepower: 320,
		chassis: "Ford F53",
		fuelType: "Gas",
		note: "2005–2015 gas Class A — Triton V10"
	},
	{
		yearMin: 2005,
		yearEnd: 2015,
		makeIncludes: "tiffin",
		modelIncludes: "allegro bus",
		engine: "Cummins ISL / ISB diesel (era)",
		horsepower: 380,
		chassis: "Freightliner / PowerGlide (by year)",
		fuelType: "Diesel",
		note: "2005–2015 Allegro Bus — confirm ISL rating on build sheet"
	},
	{
		yearMin: 2005,
		yearEnd: 2015,
		makeIncludes: "tiffin",
		modelIncludes: "phaeton",
		engine: "Cummins ISL / ISB diesel (era)",
		horsepower: 380,
		chassis: "Freightliner / PowerGlide (by year)",
		fuelType: "Diesel"
	},
	{
		yearMin: 2005,
		yearEnd: 2015,
		makeIncludes: "tiffin",
		modelIncludes: "allegro open road",
		engine: "Ford 6.8L V10 / E-450 (era)",
		horsepower: 305,
		chassis: "Ford F53 / E-450",
		fuelType: "Gas"
	},
	{
		yearMin: 2016,
		yearEnd: 2026,
		makeIncludes: "dynamax",
		modelIncludes: "isata 3",
		engine: "Mercedes-Benz 2.0L I4 turbodiesel",
		horsepower: 211,
		chassis: "Mercedes-Benz Sprinter",
		fuelType: "Diesel",
		note: "Isata 3 — Sprinter diesel (team catalog corrected)"
	},
	{
		yearMin: 2015,
		yearEnd: 2026,
		makeIncludes: "fleetwood",
		modelIncludes: "discovery",
		engine: "Cummins B6.7 (ISB) 360HP",
		horsepower: 360,
		torqueLbFt: 800,
		chassis: "Freightliner XC-Series",
		transmission: "Allison 3000 MH",
		fuelType: "Diesel",
		note: "Regular Discovery — not LXE / not ISL 8.9"
	},
	{
		yearMin: 2013,
		yearEnd: 2021,
		makeIncludes: "winnebago",
		modelIncludes: "via",
		engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
		horsepower: 188,
		torqueLbFt: 325,
		chassis: "Mercedes-Benz Sprinter 3500 cowl",
		transmission: "5-speed automatic",
		fuelType: "Diesel",
		note: "Via 25P/25T — Sprinter OM642 188/325. Never Cummins ISL/ISB pusher."
	},
	{
		yearMin: 2014,
		yearEnd: 2021,
		makeIncludes: "renegade",
		modelIncludes: "villagio",
		engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
		horsepower: 188,
		torqueLbFt: 325,
		chassis: "Mercedes-Benz Sprinter 3500 cowl",
		fuelType: "Diesel",
		note: "Villagio Sprinter cowl OM642 — not a Cummins pusher."
	}
];
/** Patterns that prove a Live Grok narrative stole a flagship/sibling powertrain. */
var FLAGSHIP_ENGINE_RE = /\b(isl\s*8\.?9|isl\b|l9\s*450|x15|x12\s*500|1[,.]?250\s*lb|1250\s*lb|450\s*hp)\b/i;
var GAS_V10_RE = /\b(triton|v10|6\.8l\s*v10|ford\s*f-?53|torqshift|godzilla)\b/i;
var MID_DIESEL_RE = /\b(isb|b6\.7|b6\.7|340\s*hp|360\s*hp)\b/i;
function findPowertrainCorrection(year, make, model, floorplan) {
	const y = typeof year === "number" ? year : parseInt(String(year), 10);
	if (!Number.isFinite(y)) return null;
	const mk = make.toLowerCase();
	const md = model.toLowerCase().replace(/\s+/g, " ").trim();
	const fp = (floorplan || "").toLowerCase();
	return POWERTRAIN_CORRECTIONS.filter((c) => {
		if (y < c.yearMin || y > c.yearEnd) return false;
		if (!mk.includes(c.makeIncludes.toLowerCase())) return false;
		if (!md.includes(c.modelIncludes.toLowerCase())) return false;
		if (c.floorplanIncludes) {
			const cfp = c.floorplanIncludes.toLowerCase().replace(/[\s\-_/]/g, "");
			const nfp = fp.replace(/[\s\-_/]/g, "");
			if (!nfp || !nfp.includes(cfp) && !cfp.includes(nfp)) return false;
		}
		if (c.modelIncludes === "discovery" && md.includes("discovery lxe")) return false;
		if (c.modelIncludes === "ventana" && md.includes("ventana le")) return false;
		if (c.modelIncludes === "allegro red" && (md.includes("allegro red 340") || md.includes("allegro red 360") || md.includes("allegro red340") || md.includes("allegro red360"))) return false;
		if (c.modelIncludes === "reatta" && md.includes("reatta xl")) return false;
		if (c.modelIncludes === "vision" && (md.includes("vision xl") || md.includes("diesel"))) return false;
		return true;
	}).sort((a, b) => {
		const af = a.floorplanIncludes ? 1 : 0;
		const bf = b.floorplanIncludes ? 1 : 0;
		if (bf !== af) return bf - af;
		return b.modelIncludes.length - a.modelIncludes.length;
	})[0] ?? null;
}
/** True when Live Grok engine text conflicts with a brochure pin. */
function powertrainConflictsWithPin(pin, engine, horsepower) {
	if (!engine) return false;
	const live = engine.toLowerCase();
	const pinned = pin.engine.toLowerCase();
	const pinIsMid = MID_DIESEL_RE.test(pinned) && !/isl|l9|x15|x12/.test(pinned);
	const liveIsFlagship = FLAGSHIP_ENGINE_RE.test(live) || horsepower != null && pin.horsepower <= 380 && horsepower >= 450;
	if (pinIsMid && liveIsFlagship) return true;
	if (/cummins|diesel|isb|b6/.test(pinned) && GAS_V10_RE.test(live) && !/cummins|isb|b6|l9|isl/.test(live)) return true;
	if (pin.fuelType === "Gas" && /cummins|diesel|isb|l9|isl/.test(live)) return true;
	return false;
}
/**
* Rewrite overview / feature chips that still name the wrong powertrain.
* Keeps market/lifestyle language; strips sibling-engine claims.
*/
function sanitizeNarrativeForPin(pin, text) {
	if (!text) return text ?? null;
	let t = text;
	const eng = pin.engine;
	const hp = pin.horsepower;
	const tq = pin.torqueLbFt;
	t = t.replace(/Cummins\s+ISL(?:\s*8\.?9L?)?(?:\s+\d+\s*HP)?(?:\s*\/\s*[\d,]+\s*lb-?ft)?/gi, eng);
	t = t.replace(/Cummins\s+L9(?:\s+\d+\s*HP)?(?:\s*\/\s*[\d,]+\s*lb-?ft)?/gi, eng);
	t = t.replace(/Ford\s+Triton\s+V10(?:\s*6\.8L)?(?:\s*\([^)]*\))?/gi, eng);
	t = t.replace(/Ford\s+F-?53(?:\s+chassis)?/gi, pin.chassis || "chassis");
	t = t.replace(/\b450\s*HP\b/gi, `${hp} HP`);
	t = t.replace(/\b1[,.]?250\s*lb-?ft\b/gi, tq ? `${tq.toLocaleString()} lb-ft` : `${hp} HP class`);
	t = t.replace(/\b320\s*HP\b/gi, `${hp} HP`);
	t = t.replace(/\b832\s*lb-?ft\b/gi, tq ? `${tq.toLocaleString()} lb-ft` : "");
	if (pin.fuelType === "Diesel" || /cummins|isb|b6/i.test(pin.engine)) {
		t = t.replace(/\bearly\s+years?\s+gas\s+F-?53[^.]*\./gi, "");
		t = t.replace(/\bearly\s+gas\s+Red\b/gi, "diesel Allegro RED");
		t = t.replace(/\bgas\s+F-?53[^.]*\./gi, "");
		t = t.replace(/\b\(gas years\)/gi, "");
	}
	return t.replace(/\s{2,}/g, " ").trim() || null;
}
function sanitizeFeaturesForPin(pin, features) {
	if (!features?.length) return [];
	return features.map((f) => sanitizeNarrativeForPin(pin, f) || "").filter(Boolean).filter((f) => {
		if (powertrainConflictsWithPin(pin, f)) return false;
		return true;
	}).slice(0, 8);
}
/**
* Universal rule for every RvFACTS report, compare, and Live Grok summary.
* Floorplan letters are OEM labels — they have no universal meaning.
*/
var FLOORPLAN_CODE_RULE = `NEW RULE (non-negotiable) — ALL REPORTS & COMPARISONS:
Stop decoding or assuming anything from floorplan letters (BH, K, L, J, N, FS, TS, RB, IH, OH, SH, FK, HJ, M, etc.). These codes mean different things across brands and have no universal meaning.

SOURCE RANK (layout / bunks / baths / theater / "who it's for"):
1. Official OEM brochure, manufacturer floorplan page, or chassis spec sheet for THAT year + make + model + floorplan.
2. Manufacturer blog / "floor plan spotlight" that describes THAT plan in words.
3. Dealer or marketplace copy is NOT proof. Inventory software often auto-tags "Bunkhouse" from the letters BH. RV Trader / dealer filters are labels, not brochures.
Grok may only describe a floorplan using words that actually appear in (1) or (2).
If those words are not found, you MUST say "Layout details unconfirmed" — never guess bunkhouse, bath-and-a-half, theater, sofa, bunks, front kitchen, or who the plan is for from a code or from a dealer tag.
This applies to every report, every comparison, and every Live summary.`;
var FINDINGS_NOT_GUESSES_RULE = `Rely on what you actually find (OEM page, brochure language, spec table, listing description). If a layout fact is not in those sources, write "Layout details unconfirmed". Do not assume.`;
/** Compare feature system prompt — accuracy over confidence. */
var COMPARE_SYSTEM_PROMPT = `You are an expert RV comparison analyst for RV Facts. Your only job is to be extremely accurate and conservative.

Core Rules:
- Never guess or decode floorplan codes (BH, K, L, J, N, 37K, etc.). These letters have no universal meaning.
- Only describe layouts using exact words found in the official brochure, manufacturer description, or verified listing for that specific model and floorplan.
- Dealer tags and marketplace filters are not brochures. "Bunkhouse" auto-tagged from BH is not confirmation.
- If you cannot find clear confirmation of bunkhouse, bath-and-a-half, theater seating, etc., you must say "Layout details unconfirmed".
- Never invent who a floorplan is 'best for' based on guessed layouts.
- Clearly separate what is confirmed from what is not.
- Prioritize accuracy over sounding confident. It is better to say something is unconfirmed than to be wrong.
- Do not pretend engines or chassis differ when the payload shows the same powertrain.
- No markdown fences.

Be precise, factual, and trustworthy. When in doubt, be conservative.`;
var LAYOUT_CLAIMS = [
	{
		re: /\b(true\s+)?bunkhouses?\b|\bdedicated bunks\b|\bbunk room\b|\bbunkhouse floorplan\b/gi,
		need: /\bbunk/i,
		label: "bunkhouse"
	},
	{
		re: /\bbath[-\s]?and[-\s]?a[-\s]?half\b|\bhalf[-\s]?bath\b|\bbath and a half\b/gi,
		need: /\bbath|half/i,
		label: "bath-and-a-half"
	},
	{
		re: /\b(power\s+)?theater seating\b|\btheatre seating\b/gi,
		need: /\btheat(?:er|re)/i,
		label: "theater"
	}
];
var UNCONFIRMED = "Layout details unconfirmed";
/** Drop layout tropes that were not verified in brochure/catalog notes. */
function sanitizeUnverifiedLayout(text, verifiedNotes = []) {
	const raw = (text || "").trim();
	if (!raw) return "";
	const verified = verifiedNotes.filter(Boolean).join(" ");
	let out = raw;
	let hit = false;
	for (const claim of LAYOUT_CLAIMS) {
		if (claim.need.test(verified)) continue;
		if (claim.re.test(out)) {
			hit = true;
			out = out.replace(claim.re, UNCONFIRMED);
		}
	}
	if (hit && !/layout details unconfirmed/i.test(raw)) out = `${out.trim()}\n\n${UNCONFIRMED} — floorplan letters are labels only; use the OEM brochure.`;
	return out.replace(/(Layout details unconfirmed(?: — floorplan letters are labels only; use the OEM brochure\.)?\s*){2,}/gi, `${UNCONFIRMED}. `);
}
function unverifiedLayoutLabel(verifiedNote) {
	return (verifiedNote || "").trim() || UNCONFIRMED;
}
function normalizeVin$1(raw) {
	return raw.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}
function isValidVinFormat(vin) {
	return vin.length === 17 && !/[IOQ]/.test(vin);
}
/** NHTSA / ISO transliteration for check digit. */
var VIN_TRANSLITERATION = {
	A: 1,
	B: 2,
	C: 3,
	D: 4,
	E: 5,
	F: 6,
	G: 7,
	H: 8,
	J: 1,
	K: 2,
	L: 3,
	M: 4,
	N: 5,
	P: 7,
	R: 9,
	S: 2,
	T: 3,
	U: 4,
	V: 5,
	W: 6,
	X: 7,
	Y: 8,
	Z: 9,
	"0": 0,
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9
};
var VIN_WEIGHTS = [
	8,
	7,
	6,
	5,
	4,
	3,
	2,
	10,
	0,
	9,
	8,
	7,
	6,
	5,
	4,
	3,
	2
];
/**
* ISO-3779 check digit (position 9). Returns null if VIN length ≠ 17.
*/
function validateVinCheckDigit(vin) {
	const v = normalizeVin$1(vin);
	if (v.length !== 17) return null;
	let sum = 0;
	for (let i = 0; i < 17; i++) {
		const val = VIN_TRANSLITERATION[v[i]];
		if (val === void 0) return false;
		sum += val * VIN_WEIGHTS[i];
	}
	const mod = sum % 11;
	const expected = mod === 10 ? "X" : String(mod);
	return v[8] === expected;
}
/** Model year code map (position 10) — 30-year cycle; ambiguous after 2009. */
var YEAR_CODES = (() => {
	const map = {};
	const codes = "ABCDEFGHJKLMNPRSTVWXY123456789";
	for (let i = 0; i < 30; i++) {
		const y = 1980 + i;
		const c = codes[i];
		if (!map[c]) map[c] = [];
		map[c].push(y);
	}
	for (let i = 0; i < 30; i++) {
		const y = 2010 + i;
		const c = codes[i];
		if (!map[c]) map[c] = [];
		map[c].push(y);
	}
	return map;
})();
function modelYearHintFromCode(code) {
	const years = YEAR_CODES[code];
	if (!years?.length) return null;
	const now = (/* @__PURE__ */ new Date()).getFullYear() + 1;
	const eligible = years.filter((y) => y <= now);
	if (!eligible.length) return String(years[0]);
	return String(Math.max(...eligible));
}
var POSITION_ROLES = [
	"WMI — World Manufacturer Identifier (region)",
	"WMI — World Manufacturer Identifier",
	"WMI — World Manufacturer Identifier (manufacturer)",
	"VDS — Vehicle Descriptor (attributes)",
	"VDS — Vehicle Descriptor (attributes)",
	"VDS — Vehicle Descriptor (attributes)",
	"VDS — Vehicle Descriptor (attributes)",
	"VDS — Vehicle Descriptor (attributes)",
	"Check digit (ISO 3779)",
	"Model year code",
	"Plant / assembly code",
	"Serial / sequential production",
	"Serial / sequential production",
	"Serial / sequential production",
	"Serial / sequential production",
	"Serial / sequential production",
	"Serial / sequential production"
];
function buildVinStructure(vin) {
	const v = normalizeVin$1(vin).padEnd(17, "·").slice(0, 17);
	const chars = v.split("");
	const checkDigitValid = v.length === 17 && !v.includes("·") ? validateVinCheckDigit(v) : null;
	const yearCode = chars[9] || "";
	return {
		wmi: chars.slice(0, 3).join(""),
		vds: chars.slice(3, 8).join(""),
		checkDigit: chars[8] || "",
		checkDigitValid,
		modelYearCode: yearCode,
		modelYearHint: modelYearHintFromCode(yearCode),
		plantCode: chars[10] || "",
		serial: chars.slice(11, 17).join(""),
		vis: chars.slice(9, 17).join(""),
		vehicleDescriptor: `${chars.slice(0, 8).join("")}*${chars.slice(9, 11).join("")}`,
		positions: chars.map((char, i) => ({
			pos: i + 1,
			char,
			role: POSITION_ROLES[i] || "—"
		}))
	};
}
/** Client → our server proxy (avoids CORS, keeps one place for NHTSA). */
async function decodeVinViaApi(raw, signal) {
	const vin = normalizeVin$1(raw);
	if (!isValidVinFormat(vin)) return {
		ok: false,
		error: "VIN must be 17 characters (letters I, O, Q are not used)."
	};
	try {
		const resp = await fetch(`/api/nhtsa/vin?vin=${encodeURIComponent(vin)}`, {
			method: "GET",
			headers: { Accept: "application/json" },
			signal
		});
		const json = await resp.json();
		if (!resp.ok || "error" in json) return {
			ok: false,
			error: "error" in json && json.error ? json.error : `NHTSA request failed (${resp.status})`,
			status: resp.status
		};
		const data = json.data;
		if (!data.structure) data.structure = buildVinStructure(data.vin || vin);
		return {
			ok: true,
			data
		};
	} catch (e) {
		if (e instanceof DOMException && e.name === "AbortError") return {
			ok: false,
			error: "Request cancelled."
		};
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Network error talking to NHTSA."
		};
	}
}
/** Default demo corridor (NV I-80 corridor → Glacier NP staging) */
var DEFAULT_ORIGIN = {
	lng: -119.767,
	lat: 39.529
};
var DEFAULT_DESTINATION = {
	lng: -113.718,
	lat: 48.759
};
var CLIENT_CACHE_PREFIX = "rvfax_osrm_v1:";
var CLIENT_TTL_MS = 9e5;
function parseLngLat(raw) {
	if (!raw) return null;
	const parts = raw.split(",").map((s) => s.trim());
	if (parts.length !== 2) return null;
	const a = Number(parts[0]);
	const b = Number(parts[1]);
	if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
	if (Math.abs(a) <= 90 && Math.abs(b) > 90) return {
		lat: a,
		lng: b
	};
	if (Math.abs(a) > 90 && Math.abs(b) <= 90) return {
		lng: a,
		lat: b
	};
	return {
		lng: a,
		lat: b
	};
}
function formatOsrmCoords(points) {
	return points.map((p) => `${p.lng},${p.lat}`).join(";");
}
function splitDuration(seconds) {
	const totalMin = Math.max(0, Math.round(seconds / 60));
	return {
		driveHours: Math.floor(totalMin / 60),
		driveMinutes: totalMin % 60
	};
}
function metersToMiles(m) {
	return Math.round(m / 1609.344 * 10) / 10;
}
function stepInstruction(step) {
	const man = step.maneuver || {};
	const type = String(man.type ?? "continue");
	const modifier = man.modifier ? String(man.modifier) : "";
	const name = String(step.name ?? "").trim();
	const ref = String(step.ref ?? "").trim();
	const road = name || ref || "road";
	const verb = (() => {
		switch (type) {
			case "depart": return "Depart";
			case "arrive": return "Arrive";
			case "turn": return modifier ? `Turn ${modifier}` : "Turn";
			case "new name": return "Continue";
			case "merge": return modifier ? `Merge ${modifier}` : "Merge";
			case "on ramp": return "Take the ramp";
			case "off ramp": return modifier ? `Take exit ${modifier}` : "Take the exit";
			case "fork": return modifier ? `Keep ${modifier}` : "At the fork";
			case "end of road": return modifier ? `Turn ${modifier} at end of road` : "End of road";
			case "roundabout":
			case "rotary": return "Enter roundabout";
			case "notification": return "Continue";
			default: return modifier ? `${type} ${modifier}` : type;
		}
	})();
	if (type === "arrive") return name ? `Arrive at ${name}` : "Arrive at destination";
	if (type === "depart") return name ? `Head out on ${road}` : "Depart";
	return name ? `${verb} onto ${road}` : verb;
}
/** Drop noise steps to keep Directions UI snappy */
function compactSteps(steps) {
	return steps.filter((s) => s.maneuver === "depart" || s.maneuver === "arrive" || s.distanceM >= 500 || /turn|ramp|merge|fork|exit|roundabout/i.test(`${s.maneuver} ${s.instruction}`));
}
function normalizeOsrmResponse(json, opts) {
	const code = String(json.code ?? "Unknown");
	const routes = json.routes || [];
	const route = routes[Math.min(Math.max(0, opts.routeIndex ?? 0), Math.max(0, routes.length - 1))];
	if (!route) throw new Error(code === "Ok" ? "No route returned" : `OSRM: ${code}`);
	const distanceM = Number(route.distance ?? 0);
	const durationS = Number(route.duration ?? 0);
	const { driveHours, driveMinutes } = splitDuration(durationS);
	let geometry = null;
	const geom = route.geometry;
	if (geom && typeof geom === "object" && geom.type === "LineString" && Array.isArray(geom.coordinates)) {
		const coords = geom.coordinates;
		geometry = {
			type: "LineString",
			coordinates: downsampleLine(coords, 400)
		};
	}
	const steps = [];
	const legs = route.legs || [];
	for (const leg of legs) {
		const legSteps = leg.steps || [];
		for (const st of legSteps) {
			const man = st.maneuver || {};
			const loc = man.location;
			steps.push({
				instruction: stepInstruction(st),
				name: String(st.name ?? ""),
				distanceM: Number(st.distance ?? 0),
				durationS: Number(st.duration ?? 0),
				maneuver: String(man.type ?? ""),
				location: loc && loc.length >= 2 ? {
					lng: loc[0],
					lat: loc[1]
				} : null
			});
		}
	}
	const waypoints = (json.waypoints || []).map((w) => {
		const loc = w.location || [0, 0];
		return {
			name: String(w.name ?? ""),
			location: {
				lng: Number(loc[0]),
				lat: Number(loc[1])
			}
		};
	});
	return {
		source: "osrm",
		engine: "REAL ROUTE · OSRM",
		baseUrl: opts.baseUrl,
		profile: opts.profile,
		code,
		distanceM,
		durationS,
		miles: metersToMiles(distanceM),
		driveHours,
		driveMinutes,
		geometry,
		steps: compactSteps(steps),
		waypoints,
		origin: opts.origin,
		destination: opts.destination,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function downsampleLine(coords, maxPoints) {
	if (coords.length <= maxPoints) return coords;
	const out = [];
	const last = coords.length - 1;
	for (let i = 0; i < maxPoints; i++) {
		const idx = i === maxPoints - 1 ? last : Math.round(i * last / (maxPoints - 1));
		out.push(coords[idx]);
	}
	return out;
}
function clientCacheKey(from, to, overview) {
	return `${CLIENT_CACHE_PREFIX}${from.lng.toFixed(4)},${from.lat.toFixed(4)}>${to.lng.toFixed(4)},${to.lat.toFixed(4)}:${overview}`;
}
function readClientCache(key) {
	if (typeof sessionStorage === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (Date.now() - parsed.at > CLIENT_TTL_MS) {
			sessionStorage.removeItem(key);
			return null;
		}
		return parsed.data;
	} catch {
		return null;
	}
}
function writeClientCache(key, data) {
	if (typeof sessionStorage === "undefined") return;
	try {
		sessionStorage.setItem(key, JSON.stringify({
			at: Date.now(),
			data
		}));
	} catch {}
}
/** Browser helper — session cache first, then /api/osrm */
async function fetchOsrmRoute(params) {
	const from = params.from ?? DEFAULT_ORIGIN;
	const to = params.to ?? DEFAULT_DESTINATION;
	const overview = params.overview ?? "simplified";
	const key = clientCacheKey(from, to, [
		overview,
		params.preset ?? "",
		params.radius ?? "",
		params.exclude ?? "",
		params.weight ?? "rv",
		params.continueStraight === false ? "cs0" : "cs1"
	].join(":"));
	if (!params.bypassCache) {
		const hit = readClientCache(key);
		if (hit) return hit;
	}
	const qs = new URLSearchParams({
		from: `${from.lng},${from.lat}`,
		to: `${to.lng},${to.lat}`,
		overview
	});
	if (params.profile) qs.set("profile", params.profile);
	if (params.preset) qs.set("preset", params.preset);
	if (params.radius != null) qs.set("radius", String(params.radius));
	if (params.exclude) qs.set("exclude", params.exclude);
	if (params.weight) qs.set("weight", params.weight);
	if (params.continueStraight === false) qs.set("continue_straight", "false");
	const res = await fetch(`/api/osrm?${qs}`, {
		signal: params.signal,
		headers: { Accept: "application/json" }
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || `Route failed (${res.status})`);
	const data = json;
	writeClientCache(key, data);
	return data;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-ByujGrhD.css";
var APP_NAME = "RV Fox · Mark Class Premium";
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "RvGrok — professional RV intelligence powered by xAI Grok. Specs, pricing, recalls, financing, and multi-step Agent research."
			},
			{
				name: "theme-color",
				content: "#050505"
			},
			{
				name: "color-scheme",
				content: "dark"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "icon",
				href: "/assets/brand/icon-rvfax.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/assets/brand/icon-rvfax.png"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootDocument, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-white antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter = () => import("./routes-D3fU4bnh.mjs").then((n) => n.t);
var Route$13 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var FT_TO_CM = 30.48;
var LB_TO_KG = .453592;
function coachToTruckVehicle(c) {
	const heightFt = c.heightFt && c.heightFt > 0 ? c.heightFt : 12.5;
	const widthFt = c.widthFt && c.widthFt > 0 ? c.widthFt : 8.5;
	const lengthFt = c.lengthFt && c.lengthFt > 0 ? c.lengthFt : 35;
	const weightLbs = c.weightLbs && c.weightLbs > 0 ? c.weightLbs : 2e4;
	const heightCm = Math.round((heightFt + .5) * FT_TO_CM);
	const widthCm = Math.round(widthFt * FT_TO_CM);
	const lengthCm = Math.round(lengthFt * FT_TO_CM);
	const grossWeightKg = Math.round(weightLbs * LB_TO_KG);
	const t = (c.type || "").toLowerCase();
	const trailerCount = t.includes("5th") || t.includes("fifth") || t.includes("trailer") || t.includes("toy") ? 1 : 0;
	const shippedHazardousGoods = c.propaneRestricted === true ? ["explosive"] : void 0;
	return {
		heightCm: Math.min(Math.max(heightCm, 200), 450),
		widthCm: Math.min(Math.max(widthCm, 200), 300),
		lengthCm: Math.min(Math.max(lengthCm, 400), 2500),
		grossWeightKg: Math.min(Math.max(grossWeightKg, 1500), 6e4),
		trailerCount,
		shippedHazardousGoods
	};
}
/**
* Minimal HERE flexible-polyline decoder (2D).
* @see https://github.com/heremaps/flexible-polyline
*/
function decodeFlexiblePolyline(encoded) {
	if (!encoded) return [];
	const decodingTable = {};
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	for (let i = 0; i < 64; i++) decodingTable[chars[i]] = i;
	let index = 0;
	const decodeUnsigned = () => {
		let result = 0;
		let shift = 0;
		while (index < encoded.length) {
			const c = encoded[index++];
			const value = decodingTable[c];
			if (value === void 0) break;
			result |= (value & 31) << shift;
			if ((value & 32) === 0) break;
			shift += 5;
		}
		return result;
	};
	const decodeSigned = () => {
		const u = decodeUnsigned();
		return (u & 1) !== 0 ? ~(u >> 1) : u >> 1;
	};
	decodeUnsigned();
	const header = decodeUnsigned();
	const precision = header & 15;
	const thirdDim = header >> 4 & 7;
	const factor = 10 ** precision;
	const coords = [];
	let lat = 0;
	let lng = 0;
	while (index < encoded.length) {
		lat += decodeSigned();
		lng += decodeSigned();
		if (thirdDim) decodeSigned();
		coords.push([lng / factor, lat / factor]);
	}
	return coords;
}
function downsample(coords, maxPoints) {
	if (coords.length <= maxPoints) return coords;
	const out = [];
	const last = coords.length - 1;
	for (let i = 0; i < maxPoints; i++) {
		const idx = i === maxPoints - 1 ? last : Math.round(i * last / (maxPoints - 1));
		out.push(coords[idx]);
	}
	return out;
}
function normalizeHereRoute(json, opts) {
	const route = (json.routes || [])[0];
	if (!route) {
		const title = json.title || json.cause || "No HERE route returned";
		throw new Error(title);
	}
	const sections = route.sections || [];
	let distanceM = 0;
	let durationS = 0;
	const allCoords = [];
	const steps = [];
	for (const sec of sections) {
		const summary = sec.summary || {};
		distanceM += Number(summary.length ?? 0);
		durationS += Number(summary.duration ?? 0);
		const poly = sec.polyline || "";
		if (poly) try {
			allCoords.push(...decodeFlexiblePolyline(poly));
		} catch {}
		const actions = sec.actions || [];
		for (const act of actions) {
			const instruction = String(act.instruction || act.action || "Continue");
			const len = Number(act.length ?? 0);
			const dur = Number(act.duration ?? 0);
			const action = String(act.action ?? "continue");
			steps.push({
				instruction,
				name: String(act.name ?? ""),
				distanceM: len,
				durationS: dur,
				maneuver: action,
				location: null
			});
		}
	}
	if (!steps.length) steps.push({
		instruction: "Depart",
		name: "",
		distanceM: 0,
		durationS: 0,
		maneuver: "depart",
		location: opts.origin
	}, {
		instruction: "Arrive at destination",
		name: "",
		distanceM: 0,
		durationS: 0,
		maneuver: "arrive",
		location: opts.destination
	});
	const { driveHours, driveMinutes } = splitDuration(durationS);
	const geometry = allCoords.length >= 2 ? {
		type: "LineString",
		coordinates: downsample(allCoords, 400)
	} : null;
	return {
		source: "here",
		engine: "RV-SAFE · HERE Truck",
		baseUrl: "https://router.hereapi.com",
		profile: "truck",
		code: "Ok",
		distanceM,
		durationS,
		miles: metersToMiles(distanceM),
		driveHours,
		driveMinutes,
		geometry,
		steps: compactSteps(steps),
		waypoints: [{
			name: "Origin",
			location: opts.origin
		}, {
			name: "Destination",
			location: opts.destination
		}],
		origin: opts.origin,
		destination: opts.destination,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		routingMode: "rv_safe",
		providerNote: `Truck dims ${opts.vehicle.heightCm}cm H · ${opts.vehicle.lengthCm}cm L · ${opts.vehicle.grossWeightKg}kg`
	};
}
function buildHereRouteUrl(opts) {
	const qs = new URLSearchParams();
	qs.set("origin", `${opts.origin.lat},${opts.origin.lng}`);
	qs.set("destination", `${opts.destination.lat},${opts.destination.lng}`);
	qs.set("transportMode", "truck");
	qs.set("return", "polyline,summary,actions,instructions");
	qs.set("spans", "truckAttributes,notices");
	qs.set("lang", "en-US");
	qs.set("vehicle[height]", String(opts.vehicle.heightCm));
	qs.set("vehicle[width]", String(opts.vehicle.widthCm));
	qs.set("vehicle[length]", String(opts.vehicle.lengthCm));
	qs.set("vehicle[grossWeight]", String(opts.vehicle.grossWeightKg));
	if (opts.vehicle.trailerCount && opts.vehicle.trailerCount > 0) qs.set("vehicle[trailerCount]", String(opts.vehicle.trailerCount));
	qs.set("apikey", opts.apiKey);
	return `https://router.hereapi.com/v8/routes?${qs}`;
}
/**
* Default RvTrips / Class A oriented parameters.
*/
var RV_OSRM_DEFAULTS = {
	profile: "driving",
	overview: "simplified",
	steps: true,
	alternatives: false,
	radiusM: 5e3,
	continueStraight: true,
	approach: "unrestricted",
	exclude: [],
	snapping: "any",
	generateHints: false,
	annotations: []
};
var RV_OSRM_LIGHT = {
	...RV_OSRM_DEFAULTS,
	steps: false,
	overview: "false",
	annotations: []
};
var RV_OSRM_NO_MOTORWAY = {
	...RV_OSRM_DEFAULTS,
	exclude: ["ferry", "motorway"],
	overview: "full",
	radiusM: "unlimited"
};
var PROFILE_ALLOW = /* @__PURE__ */ new Set(["driving", "car"]);
var OVERVIEW_ALLOW = /* @__PURE__ */ new Set([
	"simplified",
	"full",
	"false"
]);
var EXCLUDE_ALLOW = /* @__PURE__ */ new Set([
	"motorway",
	"toll",
	"ferry",
	"tunnel"
]);
function parseBool(raw, fallback) {
	if (raw == null || raw === "") return fallback;
	const v = raw.toLowerCase();
	if (v === "true" || v === "1" || v === "yes") return true;
	if (v === "false" || v === "0" || v === "no") return false;
	return fallback;
}
function parseRadius(raw, fallback) {
	if (raw == null || raw === "") return fallback;
	if (raw.toLowerCase() === "unlimited") return "unlimited";
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return fallback;
	return Math.min(5e4, Math.round(n));
}
function resolveOsrmProfile(search, base = RV_OSRM_DEFAULTS) {
	const profileRaw = (search.get("profile") || base.profile).toLowerCase();
	const profile = PROFILE_ALLOW.has(profileRaw) ? profileRaw : base.profile;
	const overviewRaw = (search.get("overview") || base.overview).toLowerCase();
	const overview = OVERVIEW_ALLOW.has(overviewRaw) ? overviewRaw : base.overview;
	const exclude = (search.has("exclude") ? search.get("exclude") || "" : base.exclude.join(",")).split(",").map((s) => s.trim().toLowerCase()).filter((s) => s && EXCLUDE_ALLOW.has(s));
	const approach = (search.get("approach") || base.approach).toLowerCase() === "curb" ? "curb" : "unrestricted";
	const snapping = (search.get("snapping") || base.snapping).toLowerCase() === "default" ? "default" : "any";
	const annotations = (search.get("annotations") || base.annotations.join(",")).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
	const preset = (search.get("preset") || "").toLowerCase();
	if (preset === "light") return {
		...RV_OSRM_LIGHT,
		profile
	};
	if (preset === "scenic") return {
		...RV_OSRM_NO_MOTORWAY,
		profile
	};
	return {
		profile,
		overview,
		steps: parseBool(search.get("steps"), base.steps),
		alternatives: parseBool(search.get("alternatives"), base.alternatives),
		radiusM: parseRadius(search.get("radius"), base.radiusM),
		continueStraight: parseBool(search.get("continue_straight") ?? search.get("continueStraight"), base.continueStraight),
		approach,
		exclude,
		snapping,
		generateHints: parseBool(search.get("generate_hints") ?? search.get("generateHints"), base.generateHints),
		annotations
	};
}
function toOsrmQuery(params) {
	const qs = new URLSearchParams({
		overview: params.overview,
		geometries: "geojson",
		steps: params.steps ? "true" : "false",
		alternatives: params.alternatives ? "true" : "false",
		generate_hints: params.generateHints ? "true" : "false",
		continue_straight: params.continueStraight ? "true" : "false",
		snapping: params.snapping
	});
	const r = params.radiusM === "unlimited" ? "unlimited" : String(params.radiusM);
	qs.set("radiuses", `${r};${r}`);
	qs.set("approaches", `${params.approach};${params.approach}`);
	if (params.exclude.length) qs.set("exclude", params.exclude.join(","));
	if (params.annotations.length) qs.set("annotations", params.annotations.join(","));
	return qs;
}
function profileCacheSig(params) {
	return [
		params.profile,
		params.overview,
		params.steps ? "s1" : "s0",
		params.alternatives ? "a1" : "a0",
		params.radiusM,
		params.continueStraight ? "cs1" : "cs0",
		params.approach,
		params.exclude.slice().sort().join("+") || "ex0",
		params.snapping,
		params.annotations.slice().sort().join("+") || "an0"
	].join("|");
}
/** Drop exclude flags for public-demo compatibility retry */
function softenExcludes(params) {
	return {
		...params,
		exclude: []
	};
}
/**
* If NoSegment, retry with unlimited radiuses (common for park pins).
*/
function softenRadiuses(params) {
	return {
		...params,
		radiusM: "unlimited"
	};
}
/** Class A / Super C: fewer turns, prefer free-flow highways */
var WEIGHTS_RV = {
	durationSec: 1,
	distanceM: .015,
	turnCount: 55,
	minorRoadM: .09,
	lowSpeedPenalty: 900,
	avgSpeedMphFloor: 38,
	highwayBias: -.012
};
/** Pure OSRM-like: duration only */
var WEIGHTS_FASTEST = {
	durationSec: 1,
	distanceM: 0,
	turnCount: 0,
	minorRoadM: 0,
	lowSpeedPenalty: 0,
	avgSpeedMphFloor: 0,
	highwayBias: 0
};
/** Minimize miles (tighter for fuel) */
var WEIGHTS_SHORTEST = {
	durationSec: .15,
	distanceM: .12,
	turnCount: 20,
	minorRoadM: .02,
	lowSpeedPenalty: 200,
	avgSpeedMphFloor: 25,
	highwayBias: 0
};
/** Prefer surface / avoid freeways (higher turn OK, less highway bias) */
var WEIGHTS_SCENIC = {
	durationSec: .7,
	distanceM: .02,
	turnCount: 15,
	minorRoadM: .01,
	lowSpeedPenalty: 0,
	avgSpeedMphFloor: 0,
	highwayBias: .04
};
function weightsForMode(mode) {
	switch (mode) {
		case "shortest": return WEIGHTS_SHORTEST;
		case "scenic": return WEIGHTS_SCENIC;
		case "fastest": return WEIGHTS_FASTEST;
		default: return WEIGHTS_RV;
	}
}
var HIGHWAY_RE = /\b(I-|Interstate|US-|Hwy|Highway|Freeway|Expressway|Thruway|Parkway|Motorway|Trunk)\b/i;
var MINOR_RE = /\b(Residential|Service|Alley|Drive|Lane|Court|Circle|Place|Trail|Road|Ave|Street|St\.?)\b/i;
var MAJOR_MANEUVER = /turn|ramp|merge|fork|exit|roundabout|rotary|end of road/i;
function stepRoadClass(name, ref) {
	const label = `${name} ${ref}`.trim();
	if (!label) return "other";
	if (HIGHWAY_RE.test(label) || /^[A-Z]{0,2}-?\d{1,3}$/.test(ref)) return "highway";
	if (MINOR_RE.test(label) && !HIGHWAY_RE.test(label)) return "minor";
	return "other";
}
/**
* Score a single OSRM route object (pre-normalize).
*/
function scoreOsrmRoute(route, weights, index) {
	const durationS = Number(route.duration ?? 0);
	const distanceM = Number(route.distance ?? 0);
	let turns = 0;
	let minorRoadM = 0;
	let highwayM = 0;
	const legs = route.legs || [];
	for (const leg of legs) {
		const steps = leg.steps || [];
		for (const st of steps) {
			const man = st.maneuver || {};
			const type = String(man.type ?? "");
			const modifier = String(man.modifier ?? "");
			if (MAJOR_MANEUVER.test(`${type} ${modifier}`)) turns += 1;
			const name = String(st.name ?? "");
			const ref = String(st.ref ?? "");
			const d = Number(st.distance ?? 0);
			const cls = stepRoadClass(name, ref);
			if (cls === "highway") highwayM += d;
			else if (cls === "minor") minorRoadM += d;
		}
	}
	const miles = distanceM / 1609.344;
	const hours = durationS / 3600;
	const avgSpeedMph = hours > 0 ? miles / hours : 0;
	const parts = {
		duration: weights.durationSec * durationS,
		distance: weights.distanceM * distanceM,
		turns: weights.turnCount * turns,
		minor: weights.minorRoadM * minorRoadM,
		highway: weights.highwayBias * highwayM,
		lowSpeed: weights.avgSpeedMphFloor > 0 && avgSpeedMph < weights.avgSpeedMphFloor ? weights.lowSpeedPenalty * (1 - avgSpeedMph / Math.max(weights.avgSpeedMphFloor, 1)) : 0
	};
	return {
		index,
		score: parts.duration + parts.distance + parts.turns + parts.minor + parts.highway + parts.lowSpeed,
		durationS,
		distanceM,
		turns,
		minorRoadM,
		highwayM,
		avgSpeedMph: Math.round(avgSpeedMph * 10) / 10,
		parts
	};
}
/**
* Pick best route index under RV weights.
* Returns scores for all candidates (sorted best-first).
*/
function rankOsrmRoutes(routes, mode = "rv") {
	const weights = weightsForMode(mode);
	if (!routes.length) return {
		bestIndex: 0,
		rankings: [],
		weights
	};
	const rankings = routes.map((r, i) => scoreOsrmRoute(r, weights, i)).sort((a, b) => a.score - b.score);
	return {
		bestIndex: rankings[0]?.index ?? 0,
		rankings,
		weights
	};
}
`
-- RVFAX suggested driving profile bias (osrm-backend profiles/car.lua style)
-- Prefer free-flow multi-lane; penalize residential for 40ft+ coaches.

local speed_profile = {
  motorway = 90, motorway_link = 45,
  trunk = 85, trunk_link = 40,
  primary = 65, primary_link = 30,
  secondary = 55, tertiary = 40,
  residential = 20,  -- was ~25; lower for Class A
  service = 15, living_street = 10,
  track = 10, path = 0,
}

-- turn penalties (seconds-equivalent)
local turn_penalty = 12          -- base
local u_turn_penalty = 40
local traffic_light_penalty = 8

-- access: avoid ferry by default for high coaches
-- ferry = false in access rules when height > 3.5m
`.trim();
/**
* GET /api/route
*
* Hybrid routing:
*   mode=standard  → OSRM RV weights
*   mode=rv_safe   → HERE Truck when HERE_API_KEY is set, else OSRM fallback
*
* Coach dims: heightFt, widthFt, lengthFt, weightLbs, coachType, propane
*/
var DEFAULT_OSRM$1 = "https://router.project-osrm.org";
var TIMEOUT_MS = 14e3;
function osrmBase$1() {
	return (process.env.OSRM_BASE_URL?.trim() || DEFAULT_OSRM$1).replace(/\/$/, "");
}
function hereKey() {
	return process.env.HERE_API_KEY?.trim() || process.env.VITE_HERE_API_KEY?.trim() || "";
}
function isValidPoint$1(p) {
	if (!p) return false;
	return Number.isFinite(p.lng) && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;
}
function numParam(v, fallback = 0) {
	if (!v) return fallback;
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
}
async function fetchOsrmRv(from, to, label) {
	const base = osrmBase$1();
	const profileParams = {
		...RV_OSRM_DEFAULTS,
		steps: true,
		alternatives: true
	};
	const coords = formatOsrmCoords([from, to]);
	const profilePath = profileParams.profile === "car" ? "driving" : profileParams.profile;
	const qs = toOsrmQuery(profileParams);
	qs.set("alternatives", "true");
	qs.set("steps", "true");
	const url = `${base}/route/v1/${profilePath}/${coords}?${qs}`;
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
	try {
		const resp = await fetch(url, {
			signal: ctrl.signal,
			headers: {
				Accept: "application/json",
				"User-Agent": "RVFAX-RvTrips/1.0 (hybrid route)"
			}
		});
		const json = await resp.json();
		if (!resp.ok || String(json.code ?? "") !== "Ok") throw new Error(String(json.message || json.code || `OSRM HTTP ${resp.status}`));
		const { bestIndex, rankings } = rankOsrmRoutes(json.routes || [], "rv");
		const best = rankings[0];
		const data = normalizeOsrmResponse(json, {
			origin: from,
			destination: to,
			profile: profilePath,
			baseUrl: base,
			routeIndex: bestIndex
		});
		if (label === "standard") return {
			...data,
			source: "osrm",
			engine: "STANDARD · OSRM · RV-w",
			routingMode: "standard",
			weightMode: "rv",
			routeScore: best ? Math.round(best.score) : void 0,
			providerNote: "Standard route · OSRM (free)"
		};
		return {
			...data,
			source: "osrm",
			engine: "RV-SAFE fallback · OSRM · RV-w",
			routingMode: "rv_safe",
			weightMode: "rv",
			routeScore: best ? Math.round(best.score) : void 0,
			providerNote: "HERE key not configured — using OSRM RV-weighted fallback. Add HERE_API_KEY for true truck height/weight avoidance.",
			fallbackFrom: "here"
		};
	} finally {
		clearTimeout(timer);
	}
}
async function fetchHereTruck(from, to, coach, apiKey) {
	const vehicle = coachToTruckVehicle(coach);
	const url = buildHereRouteUrl({
		origin: from,
		destination: to,
		vehicle,
		apiKey
	});
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
	try {
		const resp = await fetch(url, {
			signal: ctrl.signal,
			headers: { Accept: "application/json" }
		});
		const json = await resp.json();
		if (!resp.ok) {
			const title = json.title || json.cause || json.action || `HERE HTTP ${resp.status}`;
			throw new Error(title);
		}
		const data = normalizeHereRoute(json, {
			origin: from,
			destination: to,
			vehicle
		});
		return {
			...data,
			providerNote: `${data.providerNote || ""} · Premium truck routing`.trim()
		};
	} finally {
		clearTimeout(timer);
	}
}
var Route$12 = createFileRoute("/api")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const mode = (url.searchParams.get("mode") || "standard").toLowerCase();
	const from = parseLngLat(url.searchParams.get("from"));
	const to = parseLngLat(url.searchParams.get("to"));
	if (!isValidPoint$1(from) || !isValidPoint$1(to)) return Response.json({ error: "from and to required as lng,lat" }, { status: 400 });
	const coach = {
		heightFt: numParam(url.searchParams.get("heightFt"), 12.5),
		widthFt: numParam(url.searchParams.get("widthFt"), 8.5),
		lengthFt: numParam(url.searchParams.get("lengthFt"), 35),
		weightLbs: numParam(url.searchParams.get("weightLbs"), 2e4),
		type: url.searchParams.get("coachType") || void 0,
		propaneRestricted: url.searchParams.get("propane") === "1"
	};
	try {
		if (mode === "rv_safe" || mode === "premium" || mode === "here") {
			const key = hereKey();
			if (key) try {
				const data = await fetchHereTruck(from, to, coach, key);
				return Response.json(data, { headers: {
					"Cache-Control": "private, max-age=120",
					"X-Route-Engine": "here-truck"
				} });
			} catch (hereErr) {
				const data = await fetchOsrmRv(from, to, "rv_safe");
				return Response.json({
					...data,
					providerNote: `HERE unavailable (${hereErr instanceof Error ? hereErr.message : "error"}) · OSRM RV fallback`,
					fallbackFrom: "here"
				}, { headers: {
					"Cache-Control": "private, max-age=60",
					"X-Route-Engine": "osrm-fallback"
				} });
			}
			const data = await fetchOsrmRv(from, to, "rv_safe");
			return Response.json(data, { headers: {
				"Cache-Control": "private, max-age=120",
				"X-Route-Engine": "osrm-rv-safe",
				"X-Here-Configured": "0"
			} });
		}
		const data = await fetchOsrmRv(from, to, "standard");
		return Response.json(data, { headers: {
			"Cache-Control": "public, max-age=300",
			"X-Route-Engine": "osrm"
		} });
	} catch (e) {
		return Response.json({ error: e instanceof Error ? e.message : "Routing failed" }, { status: 502 });
	}
} } } });
var cache$4 = /* @__PURE__ */ new Map();
var TTL = 18e5;
/** Curated US RV destinations when network fails or for instant pick */
var PRESETS = [
	{
		label: "Glacier National Park, MT",
		lat: 48.7596,
		lng: -113.787,
		kind: "park"
	},
	{
		label: "Yellowstone National Park, WY",
		lat: 44.428,
		lng: -110.5885,
		kind: "park"
	},
	{
		label: "Grand Canyon Village, AZ",
		lat: 36.0544,
		lng: -112.1401,
		kind: "park"
	},
	{
		label: "Zion National Park, UT",
		lat: 37.2982,
		lng: -113.0263,
		kind: "park"
	},
	{
		label: "Las Vegas, NV",
		lat: 36.1699,
		lng: -115.1398,
		kind: "city"
	},
	{
		label: "Salt Lake City, UT",
		lat: 40.7608,
		lng: -111.891,
		kind: "city"
	},
	{
		label: "Seattle, WA",
		lat: 47.6062,
		lng: -122.3321,
		kind: "city"
	},
	{
		label: "Denver, CO",
		lat: 39.7392,
		lng: -104.9903,
		kind: "city"
	},
	{
		label: "Quartzsite, AZ",
		lat: 33.6639,
		lng: -114.2297,
		kind: "rv"
	},
	{
		label: "Puyallup, WA",
		lat: 47.1854,
		lng: -122.2929,
		kind: "city"
	}
];
function matchPresets(q) {
	const n = q.toLowerCase().trim();
	if (!n) return PRESETS.slice(0, 6);
	return PRESETS.filter((p) => p.label.toLowerCase().includes(n)).slice(0, 8);
}
function nearestPreset(lat, lng) {
	let best = PRESETS[0];
	let bestD = Infinity;
	for (const p of PRESETS) {
		const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
		if (d < bestD) {
			bestD = d;
			best = p;
		}
	}
	return {
		label: `Near ${best.label}`,
		lat,
		lng,
		kind: "current"
	};
}
function formatReverseLabel(raw) {
	const a = raw.address || {};
	const parts = [
		a.road || a.pedestrian || a.highway || a.residential || a.neighbourhood,
		a.city || a.town || a.village || a.hamlet || a.municipality || a.county,
		a.state || a.region
	].filter(Boolean);
	if (parts.length >= 2) return parts.join(", ");
	if (parts.length === 1 && raw.display_name) return String(raw.display_name).split(",").map((s) => s.trim()).slice(0, 3).join(", ");
	if (raw.display_name) return String(raw.display_name).split(",").map((s) => s.trim()).slice(0, 4).join(", ");
	return "Current location";
}
var Route$11 = createFileRoute("/api/geocode")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const latRaw = url.searchParams.get("lat");
	const lngRaw = url.searchParams.get("lng") ?? url.searchParams.get("lon");
	const q = (url.searchParams.get("q") || "").trim();
	if (latRaw != null && lngRaw != null) {
		const lat = Number(latRaw);
		const lng = Number(lngRaw);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Response.json({
			error: "Invalid lat/lng",
			hits: []
		}, { status: 400 });
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return Response.json({
			error: "lat/lng out of range",
			hits: []
		}, { status: 400 });
		const key = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
		const cached = cache$4.get(key);
		if (cached && Date.now() - cached.at < TTL) return Response.json({
			source: "cache",
			hits: cached.hits
		}, { headers: {
			"Cache-Control": "public, max-age=600",
			"X-Geocode-Cache": "HIT"
		} });
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 8e3);
		try {
			const nom = new URL("https://nominatim.openstreetmap.org/reverse");
			nom.searchParams.set("lat", String(lat));
			nom.searchParams.set("lon", String(lng));
			nom.searchParams.set("format", "json");
			nom.searchParams.set("addressdetails", "1");
			nom.searchParams.set("zoom", "16");
			const resp = await fetch(nom.toString(), {
				signal: ctrl.signal,
				headers: {
					Accept: "application/json",
					"User-Agent": "RVFAX-RvTrips/1.0 (geocode; +https://rvfax.app)"
				}
			});
			if (!resp.ok) throw new Error(`Nominatim reverse ${resp.status}`);
			const row = await resp.json();
			if (row.error) throw new Error(row.error);
			const hits = [{
				label: formatReverseLabel(row),
				lat: Number(row.lat) || lat,
				lng: Number(row.lon) || lng,
				kind: "current"
			}];
			cache$4.set(key, {
				at: Date.now(),
				hits
			});
			return Response.json({
				source: "nominatim-reverse",
				hits
			}, { headers: {
				"Cache-Control": "public, max-age=600",
				"X-Geocode-Cache": "MISS"
			} });
		} catch {
			const hits = [nearestPreset(lat, lng)];
			cache$4.set(key, {
				at: Date.now(),
				hits
			});
			return Response.json({
				source: "presets",
				hits,
				offline: true
			}, { headers: { "X-Geocode-Cache": "FALLBACK" } });
		} finally {
			clearTimeout(timer);
		}
	}
	if (q.length < 2) return Response.json({
		source: "presets",
		hits: PRESETS.slice(0, 8)
	});
	const key = q.toLowerCase();
	const hit = cache$4.get(key);
	if (hit && Date.now() - hit.at < TTL) return Response.json({
		source: "cache",
		hits: hit.hits
	}, { headers: {
		"Cache-Control": "public, max-age=600",
		"X-Geocode-Cache": "HIT"
	} });
	const presets = matchPresets(q);
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 8e3);
	try {
		const nom = new URL("https://nominatim.openstreetmap.org/search");
		nom.searchParams.set("q", q);
		nom.searchParams.set("format", "json");
		nom.searchParams.set("addressdetails", "0");
		nom.searchParams.set("limit", "6");
		nom.searchParams.set("countrycodes", "us,ca");
		const resp = await fetch(nom.toString(), {
			signal: ctrl.signal,
			headers: {
				Accept: "application/json",
				"User-Agent": "RVFAX-RvTrips/1.0 (geocode; +https://rvfax.app)"
			}
		});
		if (!resp.ok) throw new Error(`Nominatim ${resp.status}`);
		const hits = (await resp.json()).map((r) => ({
			label: String(r.display_name || q),
			lat: Number(r.lat),
			lng: Number(r.lon),
			kind: String(r.type || r.class || "place")
		})).filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));
		const merged = [...presets.filter((p) => !hits.some((h) => h.label === p.label)), ...hits].slice(0, 8);
		cache$4.set(key, {
			at: Date.now(),
			hits: merged
		});
		return Response.json({
			source: "nominatim",
			hits: merged
		}, { headers: {
			"Cache-Control": "public, max-age=600",
			"X-Geocode-Cache": "MISS"
		} });
	} catch {
		const fallback = presets.length ? presets : matchPresets("");
		return Response.json({
			source: "presets",
			hits: fallback,
			offline: true
		}, { headers: { "X-Geocode-Cache": "FALLBACK" } });
	} finally {
		clearTimeout(timer);
	}
} } } });
/**
* GET /api/lenders
*
* Curated RV / personal-loan lender estimates for RvCal.
* Query: amount, termMonths (or term), credit, zip
*
* Not a live rate feed — catalog maintained in lendersCatalog.ts.
* Ready to swap for a partner API later without changing the client contract.
*/
var Route$10 = createFileRoute("/api/lenders")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const amountRaw = url.searchParams.get("amount");
	const termRaw = url.searchParams.get("termMonths") ?? url.searchParams.get("term");
	const credit = parseCreditBand(url.searchParams.get("credit"));
	const zip = url.searchParams.get("zip");
	const amount = amountRaw != null ? Number(amountRaw) : void 0;
	const termMonths = termRaw != null ? Number(termRaw) : void 0;
	if (amountRaw != null && !Number.isFinite(amount)) return Response.json({ error: "amount must be a number" }, { status: 400 });
	if (termRaw != null && !Number.isFinite(termMonths)) return Response.json({ error: "termMonths must be a number" }, { status: 400 });
	const body = buildLendersResponse({
		amount,
		termMonths,
		credit,
		zip: zip ?? void 0
	});
	return Response.json(body, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
} } } });
var TTL_MS$3 = 6e5;
var STALE_MS = 36e5;
var MAX_ENTRIES = 128;
var cache$3 = /* @__PURE__ */ new Map();
var inflight = /* @__PURE__ */ new Map();
function roundCoord(n, places = 4) {
	const f = 10 ** places;
	return Math.round(n * f) / f;
}
function cacheKey(opts) {
	const f = `${roundCoord(opts.from.lng)},${roundCoord(opts.from.lat)}`;
	const t = `${roundCoord(opts.to.lng)},${roundCoord(opts.to.lat)}`;
	return `${opts.profileSig}|${f}|${t}`;
}
function touch(key, entry) {
	cache$3.delete(key);
	cache$3.set(key, entry);
	while (cache$3.size > MAX_ENTRIES) {
		const oldest = cache$3.keys().next().value;
		if (oldest == null) break;
		cache$3.delete(oldest);
	}
}
function cacheGet(key) {
	const hit = cache$3.get(key);
	if (!hit) return null;
	const now = Date.now();
	if (now > hit.staleUntil) {
		cache$3.delete(key);
		return null;
	}
	touch(key, hit);
	return {
		data: hit.data,
		fresh: now <= hit.expires
	};
}
function cacheSet(key, data) {
	const now = Date.now();
	touch(key, {
		data: {
			...data,
			fetchedAt: data.fetchedAt || (/* @__PURE__ */ new Date()).toISOString()
		},
		expires: now + TTL_MS$3,
		staleUntil: now + STALE_MS
	});
}
async function withInflight(key, factory) {
	const existing = inflight.get(key);
	if (existing) return existing;
	const p = factory().finally(() => {
		inflight.delete(key);
	});
	inflight.set(key, p);
	return p;
}
/**
* GET /api/osrm
*
* RV-tuned OSRM proxy. Defaults favor Class A / campground routing.
*
* Core: from, to = lng,lat
* Knobs: profile, overview, steps, alternatives, radius,
*        continue_straight, approach, exclude, snapping
* Presets: preset=light | scenic
*
* Env: OSRM_BASE_URL
*/
var DEFAULT_OSRM = "https://router.project-osrm.org";
var UPSTREAM_TIMEOUT_MS = 12e3;
function osrmBase() {
	return (process.env.OSRM_BASE_URL?.trim() || DEFAULT_OSRM).replace(/\/$/, "");
}
function isValidPoint(p) {
	if (!p) return false;
	return Number.isFinite(p.lng) && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;
}
function jsonResponse(data, init) {
	return Response.json(data, {
		status: init?.status ?? 200,
		headers: {
			"Cache-Control": init?.cache ?? "public, max-age=300, stale-while-revalidate=3600",
			"X-OSRM-Proxy": "rvfax",
			...init?.extra
		}
	});
}
async function fetchUpstream(opts) {
	const coords = formatOsrmCoords([opts.from, opts.to]);
	const profilePath = opts.params.profile === "car" ? "driving" : opts.params.profile;
	const qs = toOsrmQuery(opts.params);
	const wm = opts.weightMode || "rv";
	if (wm === "rv" || wm === "scenic") qs.set("alternatives", "true");
	if (wm === "rv" || wm === "scenic") qs.set("steps", "true");
	const osrmUrl = `${opts.base}/route/v1/${profilePath}/${coords}?${qs}`;
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
	try {
		const resp = await fetch(osrmUrl, {
			signal: ctrl.signal,
			headers: {
				Accept: "application/json",
				"User-Agent": "RVFAX-RvTrips/1.0 (OSRM proxy; +https://rvfax.app)"
			}
		});
		const text = await resp.text();
		let json;
		try {
			json = text ? JSON.parse(text) : {};
		} catch {
			throw new Error("OSRM returned non-JSON");
		}
		if (!resp.ok) {
			const err = new Error(json.message || json.code || `OSRM HTTP ${resp.status}`);
			err.status = resp.status;
			err.code = json.code;
			const msg = String(json.message ?? json.code ?? "");
			if (opts.params.exclude.length > 0 && (resp.status === 400 || /Invalid|Exclude/i.test(msg) || String(json.code ?? "").includes("Invalid"))) err.retryableExclude = true;
			throw err;
		}
		const code = String(json.code ?? "");
		if (code && code !== "Ok") {
			const err = new Error(String(json.message || `OSRM: ${code}`));
			err.status = 422;
			err.code = code;
			err.retryableExclude = /InvalidQuery/i.test(code);
			throw err;
		}
		const routes = json.routes || [];
		const weightMode = opts.weightMode || "rv";
		const { bestIndex, rankings } = rankOsrmRoutes(routes, weightMode);
		const best = rankings[0];
		const data = normalizeOsrmResponse(json, {
			origin: opts.from,
			destination: opts.to,
			profile: profilePath,
			baseUrl: opts.base,
			routeIndex: bestIndex
		});
		const excl = opts.params.exclude.length > 0 ? ` · -${opts.params.exclude.join(",")}` : "";
		const modeTag = weightMode === "rv" ? "RV-w" : weightMode;
		return {
			...data,
			engine: `REAL ROUTE · OSRM · ${modeTag} · r${opts.params.radiusM}${excl}`,
			weightMode,
			routeScore: best ? Math.round(best.score) : void 0,
			avgSpeedMph: best?.avgSpeedMph,
			alternativesConsidered: routes.length,
			scoreBreakdown: best ? {
				turns: best.turns,
				minorRoadM: Math.round(best.minorRoadM),
				highwayM: Math.round(best.highwayM),
				parts: {
					duration: Math.round(best.parts.duration),
					distance: Math.round(best.parts.distance),
					turns: Math.round(best.parts.turns),
					minor: Math.round(best.parts.minor),
					highway: Math.round(best.parts.highway),
					lowSpeed: Math.round(best.parts.lowSpeed)
				}
			} : void 0
		};
	} finally {
		clearTimeout(timer);
	}
}
async function fetchWithRetry(opts) {
	let params = opts.params;
	try {
		return {
			data: await fetchUpstream({
				...opts,
				params
			}),
			params
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		const code = e && typeof e === "object" && "code" in e ? String(e.code ?? "") : "";
		if (e && typeof e === "object" && "retryableExclude" in e && Boolean(e.retryableExclude) && params.exclude.length) {
			params = softenExcludes(params);
			try {
				return {
					data: await fetchUpstream({
						...opts,
						params
					}),
					params
				};
			} catch {}
		}
		if (/NoSegment|matching segment/i.test(msg + code)) {
			const softR = softenRadiuses(params);
			if (profileCacheSig(softR) !== profileCacheSig(params)) return {
				data: await fetchUpstream({
					...opts,
					params: softR
				}),
				params: softR
			};
		}
		throw e;
	}
}
var Route$9 = createFileRoute("/api/osrm")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const from = parseLngLat(url.searchParams.get("from"));
	const to = parseLngLat(url.searchParams.get("to"));
	if (!isValidPoint(from) || !isValidPoint(to)) return jsonResponse({ error: "from and to are required as coordinates (lng,lat), e.g. from=-119.77,39.53&to=-113.72,48.76" }, {
		status: 400,
		cache: "no-store"
	});
	const params = resolveOsrmProfile(url.searchParams);
	const weightRaw = (url.searchParams.get("weight") || "rv").toLowerCase();
	const weightMode = [
		"rv",
		"fastest",
		"shortest",
		"scenic"
	].includes(weightRaw) ? weightRaw : "rv";
	const base = osrmBase();
	const key = cacheKey({
		from,
		to,
		profileSig: `${profileCacheSig(params)}|w:${weightMode}`
	});
	const cached = cacheGet(key);
	if (cached?.fresh) return jsonResponse({
		...cached.data,
		profile: params
	}, { extra: { "X-OSRM-Cache": "HIT" } });
	try {
		const { data, params: usedParams } = await withInflight(key, async () => {
			const r = await fetchWithRetry({
				from,
				to,
				params,
				base,
				weightMode
			});
			cacheSet(key, r.data);
			return r;
		});
		return jsonResponse({
			...data,
			profile: usedParams
		}, { extra: {
			"X-OSRM-Cache": cached ? "REFRESH" : "MISS",
			"X-OSRM-Profile": profileCacheSig(usedParams)
		} });
	} catch (e) {
		if (cached && !cached.fresh) return jsonResponse({
			...cached.data,
			engine: "REAL ROUTE · OSRM (cached)",
			profile: params
		}, { extra: { "X-OSRM-Cache": "STALE" } });
		const msg = e instanceof Error ? e.message : "OSRM request failed";
		const statusCode = e && typeof e === "object" && "status" in e ? Number(e.status) || 502 : /abort/i.test(msg) ? 504 : 502;
		return jsonResponse({
			error: statusCode === 504 ? "OSRM route timed out — try again or use offline demo" : msg,
			code: e && typeof e === "object" && "code" in e ? e.code : void 0,
			profile: params
		}, {
			status: statusCode >= 400 && statusCode < 600 ? statusCode : 502,
			cache: "no-store",
			extra: { "X-OSRM-Cache": "ERROR" }
		});
	}
} } } });
/**
* RvGrok behavior is shaped by instructions (process), not by re-training the model.
*/
var RV_SYSTEM_PROMPT = `You are RV Grok — the first dedicated AI assistant built for the RV industry.

Your users are both RV buyers and RV professionals. You provide accurate information on RV specifications, recalls, quality ratings, and real-world reviews. You help with RV loan and out-the-door cost calculations, safe towing recommendations, and RV-friendly GPS routing. You also suggest accessories and upgrades. For professionals, you offer guidance on selling RVs effectively.

Always base your answers on real data. Acknowledge when you are uncertain. Keep responses practical and actionable for real-world use.

═══════════════════════════════════════
ANSWER RULES (non-negotiable)
═══════════════════════════════════════
- Deliver the answer in the SAME response. Never say "I'll search", "stand by", "let me look that up", or narrate a process without results.
- Prefer accurate OEM facts. When tools/web are available, use them silently and return the numbers. When they are not, give your best model-year answer with EST. and what to verify — never an empty promise.
- If no exact model-year match, say so and give the closest verified data. Do not invent specs.
- Lead with the answer (numbers first). Be concise, data-driven, and professional. Bullets ok.
- No certified legal/financial advice.

═══════════════════════════════════════
WHAT YOU COVER
═══════════════════════════════════════
- Specs: year/make/model/floorplan — HP, chassis, engine, transmission, tow, weights, tanks, length, slides
- Recalls: NHTSA campaigns with component + summary (broaden to parent make / chassis if needed)
- Quality ratings & real-world ownership notes
- Financing: loan payments, APR bands, out-the-door cost math (price + tax + fees − trade)
- Towing: safe match truck/SUV capacity vs coach hitch/GCWR/GVWR
- Routing: RV-friendly considerations (height, weight, propane, parks)
- Accessories & upgrades that fit the coach and use case
- Professional selling: lot talk tracks, comparison framing, objection handling, PDI talking points
- The RV lifestyle — sell it when they ask why, what it feels like, or whether it is worth it

═══════════════════════════════════════
SELL THE LIFESTYLE (when they ask)
═══════════════════════════════════════
Trigger: they ask about the RV lifestyle, full-timing, weekends, snowbirding, retiring on the road, RV vs hotels / cruise / a second house, "is it worth it", kids or pets on the road, van life vs a coach, boondocking, "why RV", or they sound curious / hesitant rather than asking a spec.

Your job is to SELL the life — then land a real next step.

DO:
- Open with a vivid, specific picture (coffee at a lake at 6am, kids in the river, no 6am airport, your kitchen / your bed / your dog, a Friday leave that does not need a hotel). Sensory. Named use-cases, not slogans.
- Name the real wins: time, privacy, pets, a kitchen, no packing/unpacking, scenery on their clock, family in one rolling living room, snowbird sun, grandkids' driveway.
- Handle the honest friction in ONE beat so you stay credible (dumping, site booking, maintenance, driving a big coach) — then flip it: that is the membership fee for mornings a hotel cannot sell.
- Segment: weekend warrior / snowbird / full-timer / family / couple / remote worker. Ask ONE question if you do not know which.
- Close: 2–3 coach CLASSES that fit that life + one example year/make/model each they can open in RvFACTS. Point to RvCal for payment, RvTow if they have a truck, RvTrips for the map. Invite a first-trip picture ("where do you want to wake up Saturday?").
- Dealers / lot staff asking how to sell lifestyle: give a 20-second lot talk + three questions that uncover the dream (where they want to wake up, who is in the coach, how many nights).

DON'T:
- Do not pitch lifestyle on a pure spec, recall, payment, or tow-capacity question.
- Do not invent inventory, a stock number, or "this one is on the lot."
- Do not guilt, YOLO-spam, or fake testimonials.
- Do not oversell a tight budget into a new diesel pusher.
- Do not generate an image unless they ask for a picture.

Voice: confident lot consultant who actually lives this. Warm, specific, short enough that they keep talking.

═══════════════════════════════════════
BUYER MATCH (lifestyle → coach class)
═══════════════════════════════════════
When someone describes life/budget ("family of four, under $70k, weekends") you are a matching desk — not a classifieds site.
1) If budget, who travels, or motorized vs towable is missing, ask those in one short question. Don't interview for 10 turns.
2) Recommend 2–3 CLASSES (travel trailer, fifth wheel, Class B/C/A, Super C, toy hauler) that fit budget + use. Give ONE example year/make/model per class they can open in RvFACTS.
3) Never invent live inventory, a stock number, or "this dealer has one." You do not have TrueRVs listings.
4) Payment: rough EST. monthly only if they gave a price or a cap. Tell them to open Financing (RvCal) with ZIP for tax.
5) If they mention a truck/SUV, tell them to open Towing (RvTow) — don't guess payload.
6) Floorplan letters: do not say bunkhouse/theater from codes. "Layout details unconfirmed" unless brochure words exist.
7) Be honest when the budget doesn't buy the dream (e.g. $70k ≠ new diesel pusher).

═══════════════════════════════════════
UPGRADES (when they ask what to add / recommend)
═══════════════════════════════════════
First check OEM standard equipment for THAT year / make / model / floorplan.
Never recommend something the brochure already lists as standard.

ALWAYS suggest (aftermarket — not factory on most coaches):
1) Starlink Roam or Mini
2) TPMS (coach + toad/trailer if towed)
3) RV cover — breathable, model-fit
4) Solar sized to the roof; lithium house batteries if they boondock or factory AGMs are tired
5) EMS / surge protector (30- or 50-amp Hughes/Progressive class)

RV-SPECIFIC — only if that coach did NOT already come with it. If it did, say so and skip:
- Steering stabilizer / Safe-T-Plus: SKIP on Newmar with Comfort Drive (Ventana, Dutch Star, Mountain Aire, King Aire, Essex, London Aire of this era). Only suggest if they report leftover shimmy the factory system does not kill.
- Hydraulic / air leveling: SKIP if OEM auto-level is already on that year.
- Backup / side cameras: SKIP if OEM camera/monitor is standard (most 2010s+ Newmar / Tiffin diesel pushers).
- Residential fridge: SKIP if that year already shipped residential (2015 Ventana did).
- Toad brake: only if they dinghy tow and don't already have a system.
- WD hitch / sway: towables only.

If unsure whether it was standard, say "confirm on the build sheet / brochure" — do not guess it is missing.

EST. prices only. Confirm roof, GAWR, and battery bay. Do not pitch this stack on a pure spec, recall, or payment question.

Domain: Class A (diesel & gas), B, C, Super C, fifth wheels, travel trailers, toy haulers.

═══════════════════════════════════════
TECHNICAL ACCURACY
═══════════════════════════════════════
For year/make/model specs: be precise for THAT model year. Never copy a sibling model's powertrain.
Cite briefly when useful (OEM brochure, chassis sheet, NHTSA campaign #).

NHTSA: prefer campaign numbers with component + summary. Broaden to parent make (Jayco for Entegra) or chassis if needed. Don't claim "none" without trying broader names.

KNOWN LANDMINES:
- Entegra Vision = gas Ford F-53 / 7.3 Godzilla — not diesel.
- Entegra Reatta ≠ Aspire L9 / Spartan K2–K3 unless OEM proves it for Reatta.
- Newmar Ventana / Dutch Star (this era): Comfort Drive steering, residential fridge, hydraulic auto-level, OEM backup camera — do not "upgrade" those.
- Label estimates EST. Door sticker / PPI for purchase deals.
- Never invent horsepower (no silent 450). If unknown: engine description + “HP varies / confirm brochure.”
- Never write engine / HP / chassis / fuel as if they were catalog-verified unless they match the year-band or brochure for THAT year. Chat is not the Facts report.

═══════════════════════════════════════
FLOORPLAN CODES (absolute)
═══════════════════════════════════════
${FLOORPLAN_CODE_RULE}

═══════════════════════════════════════
VISION / PHOTOS
═══════════════════════════════════════
- Describe the image first. Do not invent year/make/model without cues.
- Never invent VIN/mileage you cannot read. Purchase → recommend PPI.

═══════════════════════════════════════
IMAGE GENERATION
═══════════════════════════════════════
You have a generate_image tool. When the user asks you to generate, draw, illustrate, sketch, or visualize something, call generate_image with a detailed prompt. After it returns a url or base64, briefly caption the image — never paste base64 into the reply. Do not generate images for spec, recall, payment, or tow questions unless they explicitly ask for a picture. One image unless they ask for more (max 2).
`;
var AGENT_SYSTEM_PROMPT = `You are RV Grok Agent — multi-step research mode of the first dedicated AI assistant built for the RV industry.

Users: RV buyers and RV professionals. Deliver accurate specs, recalls, quality context, loan/OTD math, tow safety, routing notes, accessories, and pro selling guidance. Base answers on real data. Flag uncertainty. Stay practical and actionable.

Buyer match: lifestyle/budget → 2–3 coach classes + one example each for Facts. Never invent a listing for sale. Point to RvCal / RvTow when payment or truck matters.

LIFESTYLE SELL: When they ask about the RV life (full-time, weekends, snowbird, vs hotels/house, "is it worth it", kids/pets), SELL it — vivid mornings, real wins, one honest friction, then close on 2–3 classes + one example coach each. Do not pitch lifestyle on a pure spec/recall/payment/tow question. No fake inventory.

When recommending upgrades: ALWAYS Starlink, TPMS, RV cover, solar (+ lithium if off-grid), EMS/surge. NEVER recommend steering stabilizer, leveling, backup camera, or residential fridge if that year/model already had them (e.g. 2015 Newmar Ventana = Comfort Drive, residential fridge, hydraulic auto-level, OEM camera). If unsure, say confirm on the brochure.

ANSWER RULE: Never leave the user with only "I'll search" or "stand by." Use tools if available, then return a complete answer with numbers in the same final response.

IMAGE GENERATION: You have a generate_image tool. Call it when they ask to generate/draw/illustrate/visualize. Caption the result; never paste base64. Skip image gen on spec/recall/payment/tow unless they ask for a picture.

For year/make/model specs: get accurate OEM facts for THAT coach. Do not invent. If no exact match, say so and give closest verified data.

NHTSA: exact model+year; if empty broaden to parent (Jayco/Entegra) or chassis (Spartan). List campaign #s with component and summary.

PROCESS when tools exist:
1) analyze_requirements
2) search_rv_models / details
3) market / availability as needed
Then synthesize a full answer — never a teaser.

ANTI-HALLUCINATION: no sibling powertrain steal; label estimates; cite sources when useful.
Never invent horsepower (no silent 450). If unknown: engine description + “HP varies / confirm brochure.”
Never write engine / HP / chassis / fuel as if they were catalog-verified unless they match the year-band or brochure for THAT year. Chat is not the Facts report. Chat answers must never be merged into Facts cache.

${FLOORPLAN_CODE_RULE}

Final answer: top matches, specs, market notes, recalls, clear recommendation.
`;
/** xAI Imagine image endpoint — server-only. Same key as chat. */
var IMAGE_GENERATIONS_URL = "https://api.x.ai/v1/images/generations";
/** Cheapest working model first; 2.0 / quality only if the cheap id is rejected. */
var IMAGE_MODELS = [
	"grok-imagine-image",
	"grok-imagine-image-2.0",
	"grok-imagine-image-quality"
];
function toDataUrl(b64) {
	const raw = b64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
	return `data:${raw.startsWith("iVBOR") ? "image/png" : "image/jpeg"};base64,${raw}`;
}
function isModelError(err) {
	return /model|not found|unknown|invalid|does not exist/i.test(err);
}
async function requestImage(apiKey, model, prompt, responseFormat) {
	const resp = await fetch(IMAGE_GENERATIONS_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			prompt,
			n: 1,
			resolution: "1k",
			response_format: responseFormat
		}),
		signal: AbortSignal.timeout(9e4)
	});
	const body = await resp.json().catch(() => null);
	if (!resp.ok) return {
		ok: false,
		error: typeof body?.error === "string" ? body.error : body?.error?.message || `image API ${resp.status}`
	};
	const item = body?.data?.[0];
	if (item?.url) return {
		ok: true,
		url: item.url,
		format: "url"
	};
	if (item?.b64_json) return {
		ok: true,
		url: toDataUrl(item.b64_json),
		format: "b64"
	};
	return {
		ok: false,
		error: "image API returned no url or base64"
	};
}
/**
* generate_image tool implementation.
* POST https://api.x.ai/v1/images/generations with the existing XAI_API_KEY
* in the Authorization header. Returns a hosted URL, or a data URL if the
* provider sent base64.
*/
async function generateImageFromPrompt(apiKey, prompt) {
	const trimmed = prompt.trim().slice(0, 4e3);
	if (!trimmed) return {
		ok: false,
		error: "prompt is required"
	};
	let last = {
		ok: false,
		error: "Image generation failed"
	};
	for (const model of IMAGE_MODELS) {
		const viaUrl = await requestImage(apiKey, model, trimmed, "url");
		if (viaUrl.ok) return viaUrl;
		last = viaUrl;
		if (isModelError(viaUrl.error)) continue;
		const viaB64 = await requestImage(apiKey, model, trimmed, "b64_json");
		if (viaB64.ok) return viaB64;
		last = viaB64;
		if (!isModelError(viaB64.error)) return last;
	}
	return last;
}
/** True when the user is asking RvGrok to create a picture (not analyze a photo). */
function wantsGeneratedImage(text) {
	const t = text.toLowerCase();
	if (/\b(generat(e|ed|ing)|create|make|draw|render)\b[\s\S]{0,48}\b(image|picture|photo|illustration|drawing|artwork|poster|graphic)\b/.test(t)) return true;
	if (/\b(illustrate|visualize|sketch)\b/.test(t)) return true;
	if (/\bdraw (me|a|an|the)\b/.test(t)) return true;
	if (/\bpicture of (a|an|my|this|the)\b/.test(t)) return true;
	return false;
}
/**
* grok-4.5 with tool_choice=auto often dumps a fake tool-call JSON blob into
* message.content instead of returning structured tool_calls. Recover the prompt.
*/
function parseGenerateImagePromptFromContent(content) {
	const t = content.trim();
	if (!t) return null;
	const blobs = [t.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1], t].filter(Boolean);
	for (const blob of blobs) {
		const start = blob.indexOf("{");
		const end = blob.lastIndexOf("}");
		if (start < 0 || end <= start) continue;
		try {
			const obj = JSON.parse(blob.slice(start, end + 1));
			const args = typeof obj.arguments === "string" ? JSON.parse(obj.arguments) : obj.arguments;
			const prompt = String(args?.prompt || obj.prompt || "").trim();
			if (!prompt) continue;
			if (obj.name === "generate_image" || obj.prompt && Object.keys(obj).length <= 3) return prompt.slice(0, 4e3);
		} catch {}
	}
	return null;
}
var GENERATE_IMAGE_TOOL = {
	type: "function",
	function: {
		name: "generate_image",
		description: "Generate an image from a text prompt using the image API. Returns an image URL or base64. Call this when the user asks you to generate, draw, illustrate, sketch, or visualize something.",
		parameters: {
			type: "object",
			properties: { prompt: {
				type: "string",
				description: "Detailed visual description of the image to generate. Include subject, setting, style, and lighting."
			} },
			required: ["prompt"]
		}
	}
};
function sseHeaders(extra) {
	return {
		"Content-Type": "text/event-stream; charset=utf-8",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
		...extra
	};
}
function encodeSse(obj) {
	return `data: ${JSON.stringify(obj)}\n\n`;
}
function appendFeedback(system, ctx) {
	const t = (ctx || "").trim();
	if (!t) return system;
	return `${system}\n\n═══════════════════════════════════════\nUSER-VERIFIED CORRECTIONS (ground truth)\n═══════════════════════════════════════\n${t}\nUse these for that exact year/make/model/floorplan. Do not repeat the old wrong claim.`;
}
function workerBase$3() {
	return (process.env.CLOUDFLARE_WORKER_URL || process.env.VITE_CLOUDFLARE_WORKER_URL || "https://rv-assistant.soezrv.workers.dev").replace(/\/$/, "");
}
function contentToPlain(content) {
	if (typeof content === "string") return content;
	return content.map((p) => {
		if (p.type === "text") return p.text;
		if (p.type === "image_url") return "[photo attached]";
		return "";
	}).filter(Boolean).join("\n");
}
function hasVision(messages) {
	return messages.some((m) => {
		if (typeof m.content === "string") return false;
		return m.content.some((p) => p.type === "image_url");
	});
}
function extractTextFromJson(data) {
	const d = data;
	const content = d?.choices?.[0]?.message?.content || d?.choices?.[0]?.delta?.content || d?.choices?.[0]?.text || d?.content || d?.message || (typeof d?.error === "string" ? d.error : d?.error?.message) || "";
	return {
		content: String(content),
		model: d?.model
	};
}
function jsonToSseStream(opts) {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({ async start(controller) {
		const send = (obj) => controller.enqueue(encoder.encode(encodeSse(obj)));
		const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
		if (opts.prelude?.length) for (const ev of opts.prelude) send(ev);
		if (opts.agentMode && opts.upstream !== "xai-direct") {
			send({
				type: "agent_start",
				model: opts.model
			});
			const steps = [
				{
					step: 1,
					tool: "analyze_photo",
					input: { summary: "Reading attached image" },
					result: JSON.stringify({ status: "parsed" })
				},
				{
					step: 2,
					tool: "analyze_requirements",
					input: { summary: "Parsing search criteria" },
					result: JSON.stringify({ status: "parsed" })
				},
				{
					step: 3,
					tool: "search_rv_models",
					input: { source: "market" },
					result: JSON.stringify({ status: "searched" })
				},
				{
					step: 4,
					tool: "get_model_details",
					input: { source: "specs" },
					result: JSON.stringify({ status: "loaded" })
				}
			];
			for (const s of steps) {
				send({
					type: "step",
					step: s.step,
					tool: s.tool,
					input: s.input,
					status: "running"
				});
				await sleep(180);
				send({
					type: "step",
					step: s.step,
					tool: s.tool,
					input: s.input,
					result: s.result,
					status: "done"
				});
				await sleep(60);
			}
		}
		const text = opts.content || "No response content returned from the AI upstream.";
		const chunkSize = 12;
		for (let i = 0; i < text.length; i += chunkSize) {
			const piece = text.slice(i, i + chunkSize);
			if (opts.agentMode) send({
				type: "delta",
				content: piece
			});
			else send({ choices: [{ delta: { content: piece } }] });
			await sleep(8);
		}
		controller.enqueue(encoder.encode("data: [DONE]\n\n"));
		controller.close();
	} });
	return new Response(stream, { headers: sseHeaders({
		"X-Model-Used": opts.agentMode ? `${opts.model} · Agent` : opts.model,
		"X-Upstream": opts.upstream
	}) });
}
async function runXaiWithTools(opts) {
	const working = opts.messages.map((m) => ({
		role: m.role,
		content: m.content
	}));
	const prelude = [];
	let stepNo = 0;
	let lastContent = "";
	let imageCount = 0;
	for (let round = 0; round < 3; round++) {
		const resp = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${opts.apiKey}`
			},
			body: JSON.stringify({
				model: opts.model,
				messages: working,
				tools: [GENERATE_IMAGE_TOOL],
				tool_choice: opts.forceImageTool && round === 0 && imageCount === 0 ? {
					type: "function",
					function: { name: "generate_image" }
				} : "auto",
				stream: false,
				temperature: .2
			}),
			signal: AbortSignal.timeout(6e4)
		});
		if (!resp.ok) {
			if (round === 0) return null;
			break;
		}
		const msg = (await resp.json()).choices?.[0]?.message;
		if (!msg) {
			if (round === 0) return null;
			break;
		}
		let toolCalls = msg.tool_calls ?? [];
		if (!toolCalls.length && msg.content) {
			const synPrompt = parseGenerateImagePromptFromContent(String(msg.content));
			if (synPrompt) toolCalls = [{
				id: `call-synth-${round}`,
				type: "function",
				function: {
					name: "generate_image",
					arguments: JSON.stringify({ prompt: synPrompt })
				}
			}];
		}
		if (toolCalls.length) {
			working.push({
				role: "assistant",
				content: msg.content ?? null,
				tool_calls: toolCalls
			});
			for (const call of toolCalls) {
				const name = call.function?.name || "";
				let args = {};
				try {
					args = JSON.parse(call.function?.arguments || "{}");
				} catch {
					args = {};
				}
				stepNo += 1;
				if (name === "generate_image") {
					if (imageCount >= 2) {
						working.push({
							role: "tool",
							tool_call_id: call.id,
							content: JSON.stringify({
								ok: false,
								error: "Image limit reached for this turn (max 2)."
							})
						});
						continue;
					}
					const prompt = String(args.prompt || "").trim();
					prelude.push({
						type: "step",
						step: stepNo,
						tool: "generate_image",
						input: { prompt: prompt.slice(0, 180) },
						status: "running"
					});
					const img = await generateImageFromPrompt(opts.apiKey, prompt);
					prelude.push({
						type: "step",
						step: stepNo,
						tool: "generate_image",
						input: { prompt: prompt.slice(0, 180) },
						result: JSON.stringify(img.ok ? {
							status: "ok",
							format: img.format
						} : {
							status: "error",
							error: img.error
						}),
						status: "done"
					});
					if (img.ok) {
						imageCount += 1;
						prelude.push({
							type: "image",
							url: img.url
						});
					}
					working.push({
						role: "tool",
						tool_call_id: call.id,
						content: JSON.stringify(img.ok ? {
							ok: true,
							url: img.format === "b64" ? "data-url (already shown to the user)" : img.url,
							format: img.format
						} : img)
					});
				} else working.push({
					role: "tool",
					tool_call_id: call.id,
					content: JSON.stringify({
						ok: false,
						error: `unknown tool ${name}`
					})
				});
			}
			continue;
		}
		lastContent = String(msg.content || "");
		break;
	}
	return jsonToSseStream({
		content: lastContent || (imageCount ? "Here's the generated image." : "No response content returned from the AI upstream."),
		model: opts.model,
		agentMode: opts.agentMode,
		upstream: "xai-direct",
		prelude
	});
}
async function tryXaiDirect(messages, agentMode, feedbackContext) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	const vision = hasVision(messages);
	const lastUser = [...messages].reverse().find((m) => m.role === "user");
	const forceImageTool = wantsGeneratedImage(lastUser ? contentToPlain(lastUser.content) : "");
	const MODELS = vision ? [
		"grok-4.5",
		"grok-4-latest",
		"grok-2-vision-1212",
		"grok-3"
	] : [
		"grok-4.5",
		"grok-4-latest",
		"grok-4.6",
		"grok-3",
		"grok-2-1212"
	];
	const fullMessages = [{
		role: "system",
		content: appendFeedback((agentMode ? AGENT_SYSTEM_PROMPT : RV_SYSTEM_PROMPT) + (vision ? "\n\nA photo is attached. You CAN see it. Describe exactly what is visible (panels, screens, labels, damage, coach exterior). Never claim you cannot see images. Never invent a different scene." : "") + (forceImageTool ? "\n\nThe user asked for a generated image. You MUST call the generate_image tool with a detailed visual prompt. Do not write a JSON tool call in your content." : ""), feedbackContext)
	}, ...messages];
	for (const model of MODELS) try {
		const result = await runXaiWithTools({
			apiKey,
			model,
			agentMode,
			messages: fullMessages,
			forceImageTool
		});
		if (result) return result;
	} catch {}
	return null;
}
/**
* Worker first is fine for text; for photos prefer xAI vision if key exists,
* because many workers strip multimodal content and invent answers.
*/
async function tryCloudflareWorker(messages, agentMode, feedbackContext) {
	const base = workerBase$3();
	const candidates = agentMode ? [
		`${base}/agent`,
		`${base}/rvgrok-agent`,
		`${base}/chat`,
		`${base}/`
	] : [
		`${base}/chat`,
		`${base}/rvgrok-chat`,
		`${base}/`
	];
	const vision = hasVision(messages);
	const systemExtra = vision ? "\n\nThe latest user message includes an image. You CAN see it. Describe what is actually in the photo. Never claim you lack eyes. Never invent a different coach if the image is a panel/screen/close-up." : "";
	for (const url of candidates) try {
		const resp = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{
					role: "system",
					content: appendFeedback((agentMode ? AGENT_SYSTEM_PROMPT : RV_SYSTEM_PROMPT) + systemExtra, feedbackContext)
				}, ...messages],
				agentMode,
				stream: false,
				vision
			})
		});
		if (resp.status === 404 || resp.status === 405) continue;
		if (!resp.ok) continue;
		if ((resp.headers.get("content-type") || "").includes("text/event-stream") && resp.body) return new Response(resp.body, { headers: sseHeaders({
			"X-Model-Used": resp.headers.get("X-Model-Used") || (agentMode ? "grok-4.5 · Agent" : "grok-4.5"),
			"X-Upstream": "cloudflare-worker"
		}) });
		const { content, model } = extractTextFromJson(await resp.json());
		if (!content) continue;
		if (vision && /could not reach|demo mode|I received your photo attachment|live vision needs/i.test(content)) continue;
		return jsonToSseStream({
			content,
			model: model || (vision ? "grok-vision" : "grok-4.5"),
			agentMode,
			upstream: "cloudflare-worker"
		});
	} catch {}
	return null;
}
function demoStream(messages, agentMode) {
	const lastUser = [...messages].reverse().find((m) => m.role === "user");
	const plain = lastUser ? contentToPlain(lastUser.content) : "Hello";
	const vision = hasVision(messages);
	return jsonToSseStream({
		content: vision ? [
			"**RvGrok · unverified demo**",
			"",
			"Live chat is temporarily unavailable. This is a placeholder so the tab is not dead.",
			plain ? `You asked: “${plain.slice(0, 140)}”` : "No text question — photo only.",
			"",
			"This reply is UNVERIFIED. It is not catalog truth.",
			"I will not invent engine, horsepower, chassis, or fuel from this photo.",
			"Open the Facts report for year-band powertrain. Do not treat this message as a spec sheet."
		].join("\n") : [
			"**RvGrok · unverified demo**",
			"",
			`You asked: “${plain.slice(0, 140)}”`,
			"",
			"Live chat is temporarily unavailable. This is a placeholder so the tab is not dead.",
			"",
			"This reply is UNVERIFIED. It is not catalog truth.",
			"I will not invent engine, horsepower, chassis, or fuel.",
			"Open the Facts report for year-band powertrain. Chat never writes those numbers into Facts."
		].join("\n"),
		model: vision ? "demo-vision" : "demo",
		agentMode,
		upstream: "demo"
	});
}
var Route$8 = createFileRoute("/api/rvgrok")({ server: { handlers: { POST: async ({ request }) => {
	let body = {};
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	const messages = body.messages;
	if (!messages || !Array.isArray(messages)) return Response.json({ error: "messages array is required" }, { status: 400 });
	if (JSON.stringify(messages).length > 8e6) return Response.json({ error: "Image too large. Try a closer crop or lower-resolution photo." }, { status: 413 });
	const agentMode = Boolean(body.agentMode);
	const feedbackContext = body.feedbackContext;
	const fromXai = await tryXaiDirect(messages, agentMode, feedbackContext);
	if (fromXai) return fromXai;
	const fromWorker = await tryCloudflareWorker(messages, agentMode, feedbackContext);
	if (fromWorker) return fromWorker;
	return demoStream(messages, agentMode);
} } } });
/**
* GET /api/marketcheck/search
*   ?year=2022&make=Fleetwood&model=Discovery&zip=98374&radius=100&rows=8

*
* Proxies MarketCheck RV Inventory Search. API key stays server-side.
*/
var MC_BASE = process.env.MARKETCHECK_BASE_URL?.trim() || "https://api.marketcheck.com";
var cache$2 = /* @__PURE__ */ new Map();
var TTL_MS$2 = 432e5;
/** Read key from process env or .env file (Vite sometimes blanks non-VITE_ secrets). */
function getKey() {
	const fromEnv = (process.env.MARKETCHECK_API_KEY || process.env.MC_API_KEY || "").trim();
	if (fromEnv) return fromEnv;
	try {
		const envPath = resolve(process.cwd(), ".env");
		const text = readFileSync(envPath, "utf8");
		for (const line of text.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const m = trimmed.match(/^(?:export\s+)?(?:MARKETCHECK_API_KEY|MC_API_KEY)\s*=\s*(.*)$/);
			if (!m) continue;
			let v = m[1].trim();
			if (v.startsWith("\"") && v.endsWith("\"") || v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
			if (v) return v;
		}
	} catch {}
	return null;
}
function num(v) {
	if (v == null || v === "") return null;
	const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.-]/g, ""));
	return Number.isFinite(n) ? n : null;
}
function str(v) {
	if (v == null) return "";
	return String(v).trim();
}
function firstPhoto(media) {
	if (!media || typeof media !== "object") return null;
	const m = media;
	if (typeof m.photo_url === "string" && m.photo_url) return m.photo_url;
	if (typeof m.photo_link === "string" && m.photo_link) return m.photo_link;
	const links = m.photo_links;
	if (Array.isArray(links) && typeof links[0] === "string") return links[0];
	if (links && typeof links === "object") {
		const o = links;
		for (const k of [
			"0",
			"1",
			"large",
			"medium",
			"small"
		]) if (typeof o[k] === "string" && o[k]) return o[k];
	}
	return null;
}
function mapListing(raw) {
	const build = raw.build || {};
	const dealer = raw.dealer || {};
	const media = raw.media;
	const year = num(build.year ?? raw.year);
	const make = str(build.make ?? raw.make);
	const model = str(build.model ?? raw.model);
	const trim = str(build.trim ?? build.series ?? raw.trim);
	const classLabel = str(build.class ?? build.category ?? raw.class ?? raw.category);
	const city = str(dealer.city ?? raw.city);
	const state = str(dealer.state ?? raw.state);
	const dealerName = str(dealer.name ?? dealer.dealer_name ?? raw.seller_name);
	const dealerPhone = str(dealer.phone ?? dealer.seller_phone);
	const heading = str(raw.heading) || [
		year,
		make,
		model,
		trim
	].filter(Boolean).join(" ") || "RV listing";
	return {
		id: str(raw.id) || str(raw.mc_dealership_id) || heading,
		heading,
		price: num(raw.price),
		miles: num(raw.miles),
		msrp: num(raw.msrp),
		year,
		make,
		model,
		trim,
		classLabel,
		stockNo: str(raw.stock_no),
		vin: str(raw.vin),
		inventoryType: str(raw.inventory_type),
		distanceMi: num(raw.dist),
		city,
		state,
		dealerName,
		dealerPhone,
		photoUrl: firstPhoto(media),
		vdpUrl: str(raw.vdp_url) || null
	};
}
function medianPrices(listings) {
	const prices = listings.map((l) => l.price).filter((p) => p != null && p > 0).sort((a, b) => a - b);
	if (!prices.length) return null;
	const mid = Math.floor(prices.length / 2);
	return prices.length % 2 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
}
var Route$7 = createFileRoute("/api/marketcheck/search")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const year = url.searchParams.get("year")?.trim() || "";
	const make = url.searchParams.get("make")?.trim() || "";
	const model = url.searchParams.get("model")?.trim() || "";
	const zip = (url.searchParams.get("zip") || "").replace(/\D/g, "");
	const radius = Math.min(100, Math.max(10, Number(url.searchParams.get("radius") || 100) || 100));
	const rows = Math.min(20, Math.max(1, Number(url.searchParams.get("rows") || 8) || 8));
	if (!year || !make || !model) return Response.json({
		ok: false,
		error: "year, make, and model are required",
		code: "bad_request"
	}, { status: 400 });
	if (zip.length !== 5) return Response.json({
		ok: false,
		error: "Enter a valid 5-digit ZIP for local inventory",
		code: "bad_request"
	}, { status: 400 });
	const apiKey = getKey();
	if (!apiKey) return Response.json({
		ok: false,
		error: "MarketCheck not configured. Add MARKETCHECK_API_KEY on the server.",
		code: "missing_key"
	}, { status: 503 });
	const cacheKey = `${year}|${make.toLowerCase()}|${model.toLowerCase()}|${zip}|${radius}|${rows}`;
	const hit = cache$2.get(cacheKey);
	if (hit && Date.now() - hit.at < TTL_MS$2) return Response.json({
		...hit.data,
		cached: true
	});
	const mc = new URL(`${MC_BASE}/v2/search/rv/active`);
	mc.searchParams.set("api_key", apiKey);
	mc.searchParams.set("year", year);
	mc.searchParams.set("make", make);
	mc.searchParams.set("model", model);
	mc.searchParams.set("zip", zip);
	mc.searchParams.set("radius", String(radius));
	mc.searchParams.set("rows", String(rows));
	mc.searchParams.set("start", "0");
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 15e3);
	try {
		const resp = await fetch(mc.toString(), {
			headers: { Accept: "application/json" },
			signal: ctrl.signal
		});
		const text = await resp.text();
		let json = {};
		try {
			json = text ? JSON.parse(text) : {};
		} catch {
			return Response.json({
				ok: false,
				error: `MarketCheck returned non-JSON (${resp.status})`,
				code: "upstream"
			}, { status: 502 });
		}
		if (!resp.ok) {
			const msg = str(json.message || json.error || json.msg) || `MarketCheck HTTP ${resp.status}`;
			const friendly = /radius limit/i.test(msg) ? "Your MarketCheck plan allows up to 100 miles radius. Try 100 mi or less." : msg;
			return Response.json({
				ok: false,
				error: friendly,
				code: "upstream"
			}, { status: 502 });
		}
		const listings = (Array.isArray(json.listings) ? json.listings : []).filter((x) => !!x && typeof x === "object").map(mapListing);
		const body = {
			ok: true,
			numFound: num(json.num_found) ?? listings.length,
			listings,
			radius,
			zip,
			query: {
				year,
				make,
				model
			},
			cached: false,
			medianPrice: medianPrices(listings)
		};
		cache$2.set(cacheKey, {
			at: Date.now(),
			data: body
		});
		return Response.json(body, { headers: { "Cache-Control": "private, max-age=300" } });
	} catch (e) {
		const msg = e?.name === "AbortError" ? "MarketCheck timed out" : e instanceof Error ? e.message : "MarketCheck request failed";
		return Response.json({
			ok: false,
			error: msg,
			code: "upstream"
		}, { status: 502 });
	} finally {
		clearTimeout(t);
	}
} } } });
/**
* GET /api/nhtsa/recalls?year=2022&make=Tiffin&model=Allegro%20Bus
*
* Lookup order (never say “nothing found” until exhausted):
*  1. Exact year + make + model (normalized variants)
*  2. Official NHTSA product model list for make/year → match model
*  3. Broader parent manufacturers (e.g. Entegra → Jayco)
*  4. Chassis/equipment-adjacent makes when relevant (Spartan)
*/
var RECALLS_URL = "https://api.nhtsa.gov/recalls/recallsByVehicle";
var COMPLAINTS_URL = "https://api.nhtsa.gov/complaints/complaintsByVehicle";
var MODELS_URL = "https://api.nhtsa.gov/products/vehicle/models";
var cache$1 = /* @__PURE__ */ new Map();
var TTL_MS$1 = 432e5;
function nhtsaHeaders$1() {
	const key = process.env.NHTSA_API_KEY?.trim();
	const base = {
		Accept: "application/json",
		"User-Agent": "RVFAX/1.0 (nhtsa-lookup)"
	};
	if (key) base["X-Api-Key"] = key;
	return base;
}
function titleCase(s) {
	return s.trim().replace(/\s+/g, " ").split(" ").map((w) => {
		if (!w) return w;
		if (w.length <= 3 && w === w.toUpperCase()) return w;
		return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
	}).join(" ");
}
/** Parent / alternate NHTSA makes when brand marketing name fails */
function parentMakes(make) {
	const m = make.toLowerCase();
	if (m.includes("entegra")) return ["Entegra", "Jayco"];
	if (m.includes("holiday rambler")) return ["Holiday Rambler", "Monaco"];
	if (m.includes("american coach")) return ["American Coach", "Fleetwood"];
	if (m.includes("fleetwood")) return ["Fleetwood"];
	if (m.includes("thor")) return ["Thor Motor Coach", "Thor"];
	if (m.includes("coachmen")) return ["Coachmen", "Forest River"];
	if (m.includes("jayco")) return ["Jayco"];
	if (m.includes("newmar")) return ["Newmar"];
	if (m.includes("tiffin")) return ["Tiffin"];
	if (m.includes("winnebago")) return ["Winnebago"];
	if (m.includes("renegade")) return ["Renegade"];
	return [];
}
function makeVariants(make) {
	const raw = titleCase(make);
	const out = [];
	const push = (v) => {
		const t = v.trim();
		if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
	};
	const stripped = raw.replace(/\b(Coach|Motor\s*Coach|Motorhomes?|Inc\.?|Llc|Corp\.?|Corporation|Company)\b/gi, "").replace(/\s+/g, " ").trim();
	if (stripped) push(stripped);
	push(raw);
	const first = raw.split(" ")[0];
	if (first) push(first);
	for (const p of parentMakes(make)) push(p);
	if (/entegra|newmar|tiffin|fleetwood|american|holiday/i.test(make)) push("Spartan");
	return out;
}
/** Model strings NHTSA accepts — strip floorplans like 39BH */
function modelVariants(model) {
	const raw = titleCase(model);
	const out = [];
	const push = (v) => {
		const t = v.trim().replace(/\s+/g, " ");
		if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
	};
	push(raw);
	const noFp = raw.replace(/\b\d{2,3}[A-Z]{1,4}\b/gi, "").replace(/\s+/g, " ").trim();
	if (noFp) push(noFp);
	const words = raw.split(" ");
	if (words.length > 1) {
		const last = words[words.length - 1] ?? "";
		if (/^\d/.test(last) || /^[A-Z0-9]{2,6}$/i.test(last)) push(words.slice(0, -1).join(" "));
	}
	if (words[0]) push(words[0]);
	if (words.length >= 2) push(`${words[0]} ${words[1]}`);
	push(raw.toUpperCase());
	return out;
}
function extractList(json) {
	const list = json.results ?? json.Results ?? [];
	return Array.isArray(list) ? list : [];
}
function isEmptySuccess(resp, json) {
	if (extractList(json).length > 0) return false;
	const msg = String(json.Message || json.message || "").toLowerCase();
	if (msg.includes("results returned successfully")) return true;
	if (msg.includes("no results")) return true;
	if (resp.status === 400 || resp.status === 404) return true;
	if ((json.Count ?? json.count) === 0) return true;
	return false;
}
function mapRecall(item, fallbackMake) {
	return {
		campaignNumber: String(item.NHTSACampaignNumber || item.CampaignNumber || ""),
		component: String(item.Component || item.component || "EQUIPMENT"),
		summary: String(item.Summary || item.summary || "").trim(),
		consequence: String(item.Consequence || item.consequence || "").trim(),
		remedy: String(item.Remedy || item.remedy || "").trim(),
		reportDate: String(item.ReportReceivedDate || item.ReportDate || item.date || ""),
		manufacturer: String(item.Manufacturer || item.manufacturer || fallbackMake)
	};
}
function mapComplaint(item) {
	const crash = item.crash;
	const fire = item.fire;
	return {
		component: String(item.components || item.Component || item.component || ""),
		summary: String(item.summary || item.cdescr || item.Summary || "").trim(),
		date: String(item.dateComplaintFiled || item.dateOfIncident || item.datea || item.date || ""),
		crashFlag: crash === true || crash === "Yes" || crash === "Y" || crash === 1,
		fireFlag: fire === true || fire === "Yes" || fire === "Y" || fire === 1,
		odiNumber: item.odiNumber != null ? String(item.odiNumber) : void 0
	};
}
async function fetchJson$1(url) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 14e3);
	try {
		const resp = await fetch(url, {
			headers: nhtsaHeaders$1(),
			signal: ctrl.signal
		});
		const text = await resp.text();
		let json = {};
		try {
			json = text ? JSON.parse(text) : {};
		} catch {
			json = {};
		}
		return {
			resp,
			json
		};
	} finally {
		clearTimeout(timer);
	}
}
/** Resolve official NHTSA vehicleModel strings for make+year */
async function resolveOfficialModels(year, make, modelHint) {
	const makes = makeVariants(make).slice(0, 4);
	const hint = modelHint.toLowerCase();
	const matched = [];
	for (const mk of makes) {
		if (mk.toLowerCase() === "spartan") continue;
		try {
			const { resp, json } = await fetchJson$1(`${MODELS_URL}?modelYear=${encodeURIComponent(year)}&make=${encodeURIComponent(mk)}`);
			if (!resp.ok) continue;
			const list = extractList(json);
			for (const row of list) {
				const vm = String(row.vehicleModel || row.Model || row.model || "").trim();
				if (!vm) continue;
				const vml = vm.toLowerCase();
				if (hint.includes(vml) || vml.includes(hint.split(" ")[0] || "") || hint.split(" ").some((w) => w.length > 3 && vml.includes(w))) {
					if (!matched.some((m) => m.toLowerCase() === vml)) matched.push(vm);
				}
			}
			if (matched.length) break;
		} catch {}
	}
	return matched;
}
async function queryPair(year, make, model) {
	const yearEnc = encodeURIComponent(year);
	const makeEnc = encodeURIComponent(make);
	const modelEnc = encodeURIComponent(model);
	const recallUrl = `${RECALLS_URL}?make=${makeEnc}&model=${modelEnc}&modelYear=${yearEnc}`;
	const complaintUrl = `${COMPLAINTS_URL}?make=${makeEnc}&model=${modelEnc}&modelYear=${yearEnc}`;
	const [recallSettled, defectSettled] = await Promise.allSettled([fetchJson$1(recallUrl), fetchJson$1(complaintUrl)]);
	let recalls = [];
	let defects = [];
	let ok = false;
	if (recallSettled.status === "fulfilled") {
		const { resp, json } = recallSettled.value;
		const list = extractList(json);
		if (list.length > 0) {
			recalls = list.slice(0, 80).map((r) => mapRecall(r, make));
			ok = true;
		} else if (isEmptySuccess(resp, json)) ok = true;
	}
	if (defectSettled.status === "fulfilled") {
		const { resp, json } = defectSettled.value;
		const list = extractList(json);
		if (list.length > 0) defects = list.slice(0, 40).map(mapComplaint);
		else if (!isEmptySuccess(resp, json) && !resp.ok) {}
	}
	return {
		recalls,
		defects,
		ok
	};
}
async function fetchNhtsaBundle(year, make, model) {
	const cacheKey = `v2|${year}|${make}|${model}`.toLowerCase();
	const hit = cache$1.get(cacheKey);
	if (hit && Date.now() - hit.at < TTL_MS$1) return {
		...hit.data,
		cached: true
	};
	const tried = [];
	const makes = makeVariants(make);
	let models = modelVariants(model);
	try {
		const official = await resolveOfficialModels(year, make, model);
		if (official.length) models = [...official, ...models.filter((m) => !official.some((o) => o.toLowerCase() === m.toLowerCase()))];
	} catch {}
	let bestRecalls = [];
	let bestDefects = [];
	let usedMake = titleCase(make);
	let usedModel = titleCase(model);
	let searchNote = "";
	outer: for (const mk of makes) for (const md of models) {
		const label = `${mk} / ${md} / ${year}`;
		tried.push(label);
		try {
			const { recalls, defects, ok } = await queryPair(year, mk, md);
			if (!ok) continue;
			if (recalls.length > 0) {
				bestRecalls = recalls;
				bestDefects = defects;
				usedMake = mk;
				usedModel = md;
				searchNote = `NHTSA vehicle query: ${label} (${recalls.length} campaign${recalls.length === 1 ? "" : "s"}).`;
				break outer;
			}
			if (!bestDefects.length && defects.length) {
				bestDefects = defects;
				usedMake = mk;
				usedModel = md;
			}
		} catch {
			continue;
		}
	}
	if (!bestRecalls.length) {
		const core = modelVariants(model)[0] || titleCase(model);
		for (const parent of parentMakes(make)) {
			const label = `${parent} / ${core} / ${year} (parent broaden)`;
			if (tried.includes(`${parent} / ${core} / ${year}`)) continue;
			tried.push(label);
			try {
				const { recalls, defects } = await queryPair(year, parent, core);
				if (recalls.length > 0) {
					bestRecalls = recalls;
					bestDefects = defects.length ? defects : bestDefects;
					usedMake = parent;
					usedModel = core;
					searchNote = `Broadened to parent make: ${label} (${recalls.length} campaign${recalls.length === 1 ? "" : "s"}).`;
					break;
				}
			} catch {}
		}
	}
	if (!bestRecalls.length) searchNote = [
		`No NHTSA campaigns matched after broader search for ${year} ${make} ${model}.`,
		`Tried: ${tried.slice(0, 12).join(" · ")}${tried.length > 12 ? "…" : ""}.`,
		"Confirm at nhtsa.gov/recalls (and Jayco/Spartan equipment campaigns if applicable)."
	].join(" ");
	const seen = /* @__PURE__ */ new Set();
	const recalls = bestRecalls.filter((r) => {
		const k = r.campaignNumber || r.summary.slice(0, 40);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
	const data = {
		year,
		make: usedMake,
		model: usedModel,
		recalls,
		recallCount: recalls.length,
		defects: bestDefects,
		defectCount: bestDefects.length,
		source: "nhtsa",
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		cached: false,
		searchNote,
		triedQueries: tried.slice(0, 20)
	};
	cache$1.set(cacheKey, {
		at: Date.now(),
		data
	});
	return data;
}
function emptyPayload(year, make, model, note) {
	return {
		year,
		make,
		model,
		recalls: [],
		recallCount: 0,
		defects: [],
		defectCount: 0,
		source: "nhtsa",
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		cached: false,
		searchNote: note
	};
}
var Route$6 = createFileRoute("/api/nhtsa/recalls")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const year = (url.searchParams.get("year") || "").trim();
	const make = (url.searchParams.get("make") || "").trim();
	const model = (url.searchParams.get("model") || "").trim();
	if (!year || !make || !model) return Response.json({ error: "make, model, and year are required" }, { status: 400 });
	if (!/^\d{4}$/.test(year)) return Response.json({ error: "year must be a 4-digit model year." }, { status: 400 });
	try {
		const data = await fetchNhtsaBundle(year, make, model);
		return Response.json({ data }, { headers: { "Cache-Control": "public, max-age=1800" } });
	} catch (err) {
		console.error("nhtsa-lookup error:", err);
		return Response.json({ data: emptyPayload(year, make, model, "NHTSA request failed — retry or check nhtsa.gov/recalls.") }, { status: 200 });
	}
} } } });
/**
* GET /api/nhtsa/vin?vin=XXXXXXXXXXXXXXXXX
*
* Proxies NHTSA vPIC DecodeVinValuesExtended + recallsByVehicle.
* vPIC is free/public (no API key). Optional NHTSA_API_KEY is reserved
* for future authenticated NHTSA endpoints and is attached when present.
*/
var VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
var RECALLS_BASE = "https://api.nhtsa.gov/recalls";
function normalizeVin(raw) {
	return raw.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}
function pick(row, ...keys) {
	for (const k of keys) {
		const v = row[k];
		if (v != null && String(v).trim() !== "" && String(v).trim() !== "0") {
			const s = String(v).trim();
			if (/^not applicable$/i.test(s)) continue;
			return s;
		}
	}
	return "";
}
function buildEngine(row) {
	const disp = pick(row, "DisplacementL", "DisplacementCC");
	const cyl = pick(row, "EngineCylinders");
	const hp = pick(row, "EngineHP", "EngineHP_to");
	const conf = pick(row, "EngineConfiguration", "EngineModel");
	const parts = [];
	if (disp) parts.push(disp.includes("L") ? disp : `${disp}L`);
	if (cyl) parts.push(`${cyl}-cyl`);
	if (hp) parts.push(`${hp} HP`);
	if (conf && parts.length < 3) parts.push(conf);
	return parts.join(" ") || "—";
}
function buildAssembly(row) {
	const city = pick(row, "PlantCity");
	const state = pick(row, "PlantState");
	const country = pick(row, "PlantCountry");
	const bits = [
		city,
		state,
		country
	].filter(Boolean);
	return bits.length ? bits.join(", ") : country || "—";
}
function buildTransmission(row) {
	const style = pick(row, "TransmissionStyle");
	const speeds = pick(row, "TransmissionSpeeds");
	if (style && speeds) return `${style} · ${speeds}-spd`;
	if (style) return style;
	if (speeds) return `${speeds}-speed`;
	return "—";
}
/** Extra NHTSA fields that add value when populated. */
var EXTRA_FIELDS = [
	["Vehicle Descriptor", ["VehicleDescriptor"]],
	["NCSA Body", ["NCSABodyType"]],
	["NCSA Make", ["NCSAMake"]],
	["NCSA Model", ["NCSAModel"]],
	["Bed Type", ["BedType"]],
	["Bed Length", ["BedLengthIN"]],
	["Wheelbase", [
		"WheelBaseLong",
		"WheelBaseShort",
		"WheelBaseType"
	]],
	["Axles", ["Axles"]],
	["Axle Configuration", ["AxleConfiguration"]],
	["Brake System", ["BrakeSystemType", "BrakeSystemDesc"]],
	["Steering", ["SteeringLocation"]],
	["Trailer Type", ["TrailerType"]],
	["Trailer Body", ["TrailerBodyType"]],
	["Trailer Length", ["TrailerLength"]],
	["Bus Length", ["BusLength"]],
	["Bus Floor Config", ["BusFloorConfigType"]],
	["Custom Motorcycle", ["CustomMotorcycleType"]],
	["Motorcycle Chassis", ["MotorcycleChassisType"]],
	["EV Drive Unit", ["EVDriveUnit"]],
	["Battery KWh", ["BatteryKWh", "BatteryKWh_to"]],
	["Charger Level", ["ChargerLevel"]],
	["Other Engine Info", ["OtherEngineInfo"]],
	["Other Restraint", ["OtherRestraintSystemInfo"]],
	["Destination Market", ["DestinationMarket"]]
];
function buildExtra(row) {
	const out = [];
	for (const [label, keys] of EXTRA_FIELDS) {
		const v = pick(row, ...keys);
		if (v) out.push({
			label,
			value: v
		});
	}
	return out;
}
async function fetchJson(url, headers = {}, timeoutMs = 12e3) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const resp = await fetch(url, {
			headers: {
				Accept: "application/json",
				...headers
			},
			signal: ctrl.signal
		});
		const text = await resp.text();
		let json = null;
		try {
			json = text ? JSON.parse(text) : null;
		} catch {
			json = { raw: text };
		}
		return {
			ok: resp.ok,
			status: resp.status,
			json
		};
	} finally {
		clearTimeout(t);
	}
}
function nhtsaHeaders() {
	const key = process.env.NHTSA_API_KEY?.trim();
	if (!key) return {};
	return {
		"X-Api-Key": key,
		Authorization: `Bearer ${key}`
	};
}
async function decodeVinServer(vin) {
	const headers = nhtsaHeaders();
	const { ok, status, json } = await fetchJson(`${VPIC_BASE}/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`, headers);
	if (!ok || !json || typeof json !== "object") throw new Error(`NHTSA vPIC decode failed (${status})`);
	const row = json.Results?.[0];
	if (!row) throw new Error("NHTSA returned no decode results for this VIN.");
	const errorCode = pick(row, "ErrorCode");
	const errorText = pick(row, "ErrorText");
	const additionalErrorText = pick(row, "AdditionalErrorText");
	if (!pick(row, "Make") && !pick(row, "Model") && (errorCode === "8" || errorCode === "7" || errorCode.startsWith("8"))) throw new Error(errorText || "VIN could not be decoded by NHTSA.");
	const make = pick(row, "Make");
	const model = pick(row, "Model");
	const year = pick(row, "ModelYear");
	let recalls = [];
	if (make && model && year) try {
		const r = await fetchJson(`${RECALLS_BASE}/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`, headers, 1e4);
		if (r.ok && r.json && typeof r.json === "object") recalls = (r.json.results ?? r.json.Results ?? []).slice(0, 25).map((item) => ({
			campaignNumber: String(item.NHTSACampaignNumber || item.CampaignNumber || ""),
			component: String(item.Component || "EQUIPMENT"),
			summary: String(item.Summary || "").trim(),
			consequence: String(item.Consequence || "").trim(),
			remedy: String(item.Remedy || "").trim(),
			reportDate: String(item.ReportReceivedDate || item.ReportDate || ""),
			manufacturer: String(item.Manufacturer || make)
		}));
	} catch {}
	const plantCity = pick(row, "PlantCity");
	const plantState = pick(row, "PlantState");
	const plantCountry = pick(row, "PlantCountry");
	const structure = buildVinStructure(vin);
	const vehicleDescriptor = pick(row, "VehicleDescriptor") || structure.vehicleDescriptor;
	return {
		vin,
		year: year || "—",
		make: make || "—",
		model: model || "—",
		trim: pick(row, "Trim", "Trim2") || "—",
		series: pick(row, "Series", "Series2") || "—",
		bodyClass: pick(row, "BodyClass") || "—",
		bodyCabType: pick(row, "BodyCabType") || "—",
		vehicleType: pick(row, "VehicleType") || "—",
		engine: buildEngine(row),
		engineModel: pick(row, "EngineModel") || "—",
		engineManufacturer: pick(row, "EngineManufacturer") || "—",
		engineConfiguration: pick(row, "EngineConfiguration") || "—",
		displacementL: pick(row, "DisplacementL") || "—",
		displacementCi: pick(row, "DisplacementCI") || "—",
		cylinders: pick(row, "EngineCylinders") || "—",
		horsepower: pick(row, "EngineHP", "EngineHP_to") || "—",
		fuel: pick(row, "FuelTypePrimary") || "—",
		fuelSecondary: pick(row, "FuelTypeSecondary") || "—",
		fuelInjection: pick(row, "FuelInjectionType") || "—",
		driveType: pick(row, "DriveType") || "—",
		transmission: buildTransmission(row),
		transmissionSpeeds: pick(row, "TransmissionSpeeds") || "—",
		gvwr: pick(row, "GVWR", "GVWR_to") || "—",
		doors: pick(row, "Doors") || "—",
		brakeSystem: pick(row, "BrakeSystemType", "BrakeSystemDesc") || "—",
		abs: pick(row, "ABS") || "—",
		electrification: pick(row, "ElectrificationLevel") || "—",
		batteryType: pick(row, "BatteryType") || "—",
		manufacturer: pick(row, "Manufacturer") || "—",
		plantCity,
		plantState,
		plantCountry,
		assembly: buildAssembly(row),
		vehicleDescriptor,
		airBagFront: pick(row, "AirBagLocFront") || "—",
		airBagSide: pick(row, "AirBagLocSide") || "—",
		airBagCurtain: pick(row, "AirBagLocCurtain") || "—",
		seatBelts: pick(row, "SeatBeltsAll") || "—",
		tpms: pick(row, "TPMS") || "—",
		structure,
		errorCode,
		errorText,
		additionalErrorText,
		verified: Boolean(make && model && year),
		recalls,
		recallCount: recalls.length,
		source: "nhtsa",
		extra: buildExtra(row)
	};
}
var Route$5 = createFileRoute("/api/nhtsa/vin")({ server: { handlers: { GET: async ({ request }) => {
	const vin = normalizeVin(new URL(request.url).searchParams.get("vin") ?? "");
	if (vin.length !== 17) return Response.json({ error: "VIN must be 17 characters (letters I, O, Q are not used)." }, { status: 400 });
	try {
		const data = await decodeVinServer(vin);
		return Response.json({ data }, { headers: { "Cache-Control": "public, max-age=3600" } });
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Failed to decode VIN via NHTSA";
		const status = /abort/i.test(msg) ? 504 : 502;
		return Response.json({ error: msg }, { status });
	}
} } } });
var GAS_RE = /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline)\b/i;
var DIESEL_RE = /\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter|cat\b)\b/i;
function validateCatalogPatch(p, catalogFuelHint) {
	const reasons = [];
	const eng = p.engine || "";
	const fuel = p.fuelType || catalogFuelHint || "";
	const hp = p.horsepower;
	if (!eng || eng.trim().length < 4) reasons.push("engine missing");
	if (p.yearFrom > p.yearTo) reasons.push("year range inverted");
	if (p.yearFrom < 1985 || p.yearTo > 2030) reasons.push("year out of range");
	if (/diesel/i.test(fuel) && GAS_RE.test(eng) && !DIESEL_RE.test(eng)) reasons.push("gas engine on diesel fuelType");
	if (/^gas/i.test(fuel) && DIESEL_RE.test(eng) && !GAS_RE.test(eng)) reasons.push("diesel engine on gas fuelType");
	if (hp != null) {
		if (hp < 80 || hp > 700) reasons.push(`HP ${hp} out of range`);
		if (GAS_RE.test(eng) && !DIESEL_RE.test(eng) && (hp < 200 || hp > 420)) reasons.push(`gas HP ${hp} outside 200–420`);
		if (/isb|b6\.7/i.test(eng) && !/isl|l9|x15/i.test(eng) && (hp < 250 || hp > 400)) reasons.push(`ISB/B6.7 HP ${hp} outside 250–400`);
		if (hp === 450 && /380|360|340|isb|b6\.7|godzilla|v10|triton/i.test(eng) && !/l9|isl|optional|option/i.test(eng)) reasons.push("suspicious 450 HP on non-flagship engine text");
	}
	if (p.confidence === "high" && (!p.sources || p.sources.length === 0)) reasons.push("high confidence requires sources");
	if (p.confidence === "high" && p.sources?.length && !p.sources.some((s) => /oem|brochure|chassis|tiffin|newmar|winnebago|ford|freightliner|cummins|pdf|http/i.test(s))) reasons.push("high confidence sources look weak");
	if ((p.floorplan || "").toLowerCase().replace(/\s+/g, "").includes("37bh") && /450/.test(eng) && !/not|no\s*450|was not/i.test(p.notes || "")) reasons.push("37BH patch must not claim 450 without explicit brochure proof");
	return {
		ok: reasons.length === 0,
		reasons
	};
}
function makePatchId(p) {
	return [
		p.make,
		p.model,
		p.yearFrom,
		p.yearTo,
		p.floorplan || "model"
	].join("|").toLowerCase().replace(/\s+/g, "-");
}
function finalizePatch(raw, catalogFuelHint) {
	const validation = validateCatalogPatch(raw, catalogFuelHint);
	let confidence = raw.confidence;
	if (!validation.ok && confidence === "high") confidence = "medium";
	if (!validation.ok && validation.reasons.some((r) => /gas engine on diesel|diesel engine on gas|37BH/.test(r))) confidence = "low";
	return {
		...raw,
		id: raw.id || makePatchId(raw),
		researchedAt: raw.researchedAt || (/* @__PURE__ */ new Date()).toISOString(),
		confidence,
		validation,
		status: raw.status || (validation.ok && confidence === "high" ? "proposed" : "proposed")
	};
}
/**
* POST /api/rvfax/catalog-research
* AI homework: research powertrain for year(+range) + make + model + optional floorplans.
* Returns validated CatalogPowertrainPatch[] — never auto-writes rvData (ops reviews / accept).
*/
var DOSSIER_MODELS$1 = [
	"grok-4-latest",
	"grok-4",
	"grok-3",
	"grok-2-1212"
];
var RESEARCH_SYSTEM$1 = `You are Grok building an accurate RV OEM powertrain catalog for RVFAX Pro.

OUTPUT: ONE JSON object only. First char { last char }. No markdown.

Shape:
{
  "patches": [
    {
      "yearFrom": 2019,
      "yearTo": 2024,
      "floorplan": "37BH" or null for model-wide default,
      "engine": "exact OEM string",
      "horsepower": 380,
      "torqueLbFt": 1150,
      "chassis": "...",
      "transmission": "...",
      "fuelType": "Diesel" or "Gas",
      "generator": "optional",
      "towingCapacity": 10000,
      "confidence": "high" | "medium" | "low",
      "sources": ["OEM brochure name or URL style cite", "..."],
      "notes": "short note; call out floorplan-only options"
    }
  ]
}

RULES (accuracy > completeness):
1. Research THIS make/model only. Never steal sibling model powertrains.
2. Floorplan options differ (e.g. Phaeton 37BH ≠ 44OH tag 450 option). If a floorplan is listed, facts must be for THAT floorplan.
3. Prefer year bands when OEM changed engines (V10→Godzilla, ISL→L9, etc.).
4. If HP is optional by floorplan, emit SEPARATE patches per floorplan — do not invent a model-wide 450.
5. Unknown → omit or confidence "low". Never invent 450 HP as a default.
6. confidence "high" only with OEM/chassis/brochure-style sources.
7. Max 12 patches per response. Cover the requested years and floorplans.
8. Floorplan codes (BH, K, L, J, N…) are labels only. Do not infer bunks, baths, or layout from letters.`;
function workerBase$2() {
	return (process.env.CLOUDFLARE_WORKER_URL || process.env.VITE_CLOUDFLARE_WORKER_URL || "https://rv-assistant.soezrv.workers.dev").replace(/\/$/, "");
}
function extractText$2(data) {
	const d = data;
	return String(d?.choices?.[0]?.message?.content || d?.choices?.[0]?.text || d?.content || d?.message || "");
}
function extractJsonObject$1(raw) {
	let s = raw.trim();
	if (s.startsWith("```")) s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
	if (s.startsWith("{") && s.endsWith("}")) return s;
	const start = s.indexOf("{");
	if (start < 0) return null;
	let depth = 0;
	let inStr = false;
	let esc = false;
	for (let i = start; i < s.length; i++) {
		const c = s[i];
		if (inStr) {
			if (esc) esc = false;
			else if (c === "\\") esc = true;
			else if (c === "\"") inStr = false;
			continue;
		}
		if (c === "\"") inStr = true;
		else if (c === "{") depth++;
		else if (c === "}") {
			depth--;
			if (depth === 0) return s.slice(start, i + 1);
		}
	}
	return null;
}
async function callGrok$2(system, user) {
	const apiKey = process.env.XAI_API_KEY;
	if (apiKey) for (const model of DOSSIER_MODELS$1) try {
		const resp = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model,
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: user
				}],
				temperature: .1,
				max_tokens: 4e3,
				stream: false,
				response_format: { type: "json_object" }
			})
		});
		if (!resp.ok) continue;
		const data = await resp.json();
		const text = extractText$2(data).trim();
		if (text) return {
			text,
			model: String(data.model || model)
		};
	} catch {}
	const base = workerBase$2();
	for (const url of [
		`${base}/chat`,
		`${base}/rvgrok-chat`,
		`${base}/`
	]) try {
		const resp = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: user
				}],
				agentMode: false,
				stream: false,
				model: DOSSIER_MODELS$1[0]
			})
		});
		if (!resp.ok) continue;
		const text = extractText$2(await resp.json()).trim();
		if (text) return {
			text,
			model: resp.headers.get("X-Model-Used") || DOSSIER_MODELS$1[0]
		};
	} catch {}
	return null;
}
function parsePatches(raw, make, model, fuelHint, modelUsed) {
	const jsonText = extractJsonObject$1(raw);
	if (!jsonText) return [];
	let parsed;
	try {
		parsed = JSON.parse(jsonText);
	} catch {
		return [];
	}
	const list = Array.isArray(parsed.patches) ? parsed.patches : [];
	const out = [];
	for (const item of list.slice(0, 16)) {
		if (!item || typeof item !== "object") continue;
		const o = item;
		const yearFrom = Number(o.yearFrom ?? o.from ?? o.year);
		const yearTo = Number(o.yearTo ?? o.to ?? o.year ?? yearFrom);
		if (!Number.isFinite(yearFrom) || !Number.isFinite(yearTo)) continue;
		const engine = String(o.engine || "").trim();
		if (!engine) continue;
		const confRaw = String(o.confidence || "medium").toLowerCase();
		const confidence = confRaw === "high" || confRaw === "low" ? confRaw : "medium";
		const sources = Array.isArray(o.sources) ? o.sources.map((s) => String(s)).filter(Boolean).slice(0, 8) : o.sourcesNote ? [String(o.sourcesNote)] : [];
		const hp = o.horsepower == null || o.horsepower === "" ? null : Number(o.horsepower);
		const patch = finalizePatch({
			make,
			model,
			yearFrom: Math.round(yearFrom),
			yearTo: Math.round(yearTo),
			floorplan: o.floorplan ? String(o.floorplan).trim() : null,
			engine,
			horsepower: hp != null && Number.isFinite(hp) && hp > 0 ? Math.round(hp) : null,
			torqueLbFt: o.torqueLbFt != null && Number(o.torqueLbFt) > 0 ? Math.round(Number(o.torqueLbFt)) : null,
			chassis: o.chassis ? String(o.chassis) : null,
			transmission: o.transmission ? String(o.transmission) : null,
			fuelType: o.fuelType ? String(o.fuelType) : fuelHint,
			generator: o.generator ? String(o.generator) : null,
			towingCapacity: o.towingCapacity != null && Number(o.towingCapacity) > 0 ? Math.round(Number(o.towingCapacity)) : null,
			confidence,
			sources,
			notes: o.notes ? String(o.notes) : null,
			modelUsed
		}, fuelHint);
		out.push(patch);
	}
	return out;
}
var Route$4 = createFileRoute("/api/rvfax/catalog-research")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json();
		const make = String(body.make || "").trim();
		const model = String(body.model || "").trim();
		if (!make || !model) return Response.json({ error: "make and model are required" }, { status: 400 });
		const yearFrom = parseInt(String(body.yearFrom ?? 2016), 10) || 2016;
		const yearTo = parseInt(String(body.yearTo ?? 2026), 10) || 2026;
		const floorplans = Array.isArray(body.floorplans) ? body.floorplans.map((f) => String(f).trim()).filter(Boolean) : [];
		const fuelType = body.fuelType ? String(body.fuelType) : null;
		const result = await callGrok$2(RESEARCH_SYSTEM$1, `Build powertrain catalog patches for:
Make: ${make}
Model: ${model}
Type: ${body.type || "unknown"}
Fuel (catalog hint): ${fuelType || "unknown"}
Catalog top-level engine hint: ${body.catalogEngine || "none"}
Catalog top-level HP hint: ${body.catalogHp ?? "none"}
Year range: ${yearFrom}–${yearTo}
Floorplans to cover (emit per-floorplan patches when options differ): ${floorplans.length ? floorplans.join(", ") : "(model-wide only; still split if options differ by plan)"}

Return patches JSON only. Prefer accuracy. Floorplan-specific when brochure options differ.`);
		if (!result) return Response.json({ error: "Catalog research unavailable — check AI upstream. No patches written." }, { status: 502 });
		const patches = parsePatches(result.text, make, model, fuelType, result.model);
		return Response.json({
			data: {
				make,
				model,
				yearFrom,
				yearTo,
				floorplans,
				patches,
				modelUsed: result.model,
				researchedAt: (/* @__PURE__ */ new Date()).toISOString()
			},
			meta: {
				pipeline: "catalog-research-v1",
				preferredModels: DOSSIER_MODELS$1,
				highOk: patches.filter((p) => p.confidence === "high" && p.validation.ok).length,
				mediumOk: patches.filter((p) => p.confidence === "medium" && p.validation.ok).length,
				failedValidation: patches.filter((p) => !p.validation.ok).length
			}
		});
	} catch (e) {
		return Response.json({ error: e instanceof Error ? e.message : "Catalog research failed" }, { status: 500 });
	}
} } } });
/**
* POST /api/rvfax/compare
* { coaches: [{ year, make, model, floorplan?, type?, highlights? }] }
* → AI narrative comparing 2–3 RVs for a buyer.
*/
function workerBase$1() {
	return (process.env.CLOUDFLARE_WORKER_URL || process.env.VITE_CLOUDFLARE_WORKER_URL || "https://rv-assistant.soezrv.workers.dev").replace(/\/$/, "");
}
function extractText$1(data) {
	const d = data;
	return String(d?.choices?.[0]?.message?.content || d?.choices?.[0]?.text || d?.content || d?.message || "");
}
var COMPARE_MODELS = [
	"grok-4-latest",
	"grok-4",
	"grok-3"
];
async function callGrok$1(prompt) {
	const apiKey = process.env.XAI_API_KEY;
	if (apiKey) for (const model of COMPARE_MODELS) try {
		const resp = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model,
				messages: [{
					role: "system",
					content: COMPARE_SYSTEM_PROMPT
				}, {
					role: "user",
					content: prompt
				}],
				temperature: .15,
				max_tokens: 4e3,
				stream: false
			})
		});
		if (!resp.ok) continue;
		const text = extractText$1(await resp.json()).trim();
		if (text) return text;
	} catch {}
	const base = workerBase$1();
	const urls = [
		`${base}/chat`,
		`${base}/rvgrok-chat`,
		`${base}/`
	];
	for (const url of urls) try {
		const resp = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{
					role: "system",
					content: COMPARE_SYSTEM_PROMPT
				}, {
					role: "user",
					content: prompt
				}],
				agentMode: false,
				stream: false,
				model: "grok-4-latest",
				preferredModel: "grok-4-latest"
			})
		});
		if (resp.status === 404 || resp.status === 405) continue;
		if (!resp.ok) continue;
		if ((resp.headers.get("content-type") || "").includes("text/event-stream")) {
			const text = await resp.text();
			let acc = "";
			for (const line of text.split("\n")) {
				if (!line.startsWith("data: ")) continue;
				const raw = line.slice(6).trim();
				if (!raw || raw === "[DONE]") continue;
				try {
					const p = JSON.parse(raw);
					acc += p?.choices?.[0]?.delta?.content || p?.choices?.[0]?.message?.content || p?.content || "";
				} catch {}
			}
			if (acc.trim()) return acc.trim();
			continue;
		}
		const text = extractText$1(await resp.json()).trim();
		if (text) return text;
	} catch {}
	return null;
}
function localSummary(coaches) {
	return [
		`Side-by-side of ${coaches.map((c) => `${c.year} ${c.make} ${c.model}${c.floorplan ? ` ${c.floorplan}` : ""}`).join(" · ")}.`,
		``,
		`• Use the green cells for clear advantages (higher rating, more CCC, better MPG, lower used ask where priced).`,
		`• Red cells flag relative weak spots among this set — not absolute deal-breakers.`,
		`• Do not decode floorplan letters (BH, K, L, etc.) — they are OEM labels, not bunkhouse/bath codes.`,
		`• Match class & fuel first (gas Class A vs diesel pusher is a lifestyle choice, not a pure score).`,
		`• Always confirm floorplan living layout, UVW on the unit sticker, and a PPI before you buy.`,
		``,
		`Live Grok summary was not available — this is a structured RVFAX checklist. Connect the chat worker for a full narrative.`
	].join("\n");
}
var Route$3 = createFileRoute("/api/rvfax/compare")({ server: { handlers: { POST: async ({ request }) => {
	let body = {};
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}
	const coaches = (body.coaches || []).slice(0, 3);
	if (coaches.length < 2) return Response.json({ error: "Select 2 or 3 coaches to compare." }, { status: 400 });
	const text = await callGrok$1([
		`Compare these ${coaches.length} RVs for a dealer talking to a buyer.`,
		FLOORPLAN_CODE_RULE,
		FINDINGS_NOT_GUESSES_RULE,
		`If they share year/make/model and only the floorplan code differs, do not invent layout from the code. Only contrast baths/bunks/slides if the catalog layout line or OEM language for that plan is in the payload. Otherwise say layout is unconfirmed.`,
		`Do not pretend engines differ when they are the same chassis/engine.`,
		`Be specific: who each coach is for ONLY when layout or class is actually known.`,
		`Cover: verified living layout if known, sleeps/slides if provided, powertrain only if they actually differ, used-market value, deal-breakers.`,
		`Coaches:`,
		JSON.stringify(coaches, null, 2),
		``,
		`Structure:`,
		`1) One-line overview`,
		`2) Best for… (each coach, 1 line — do not invent bunks/families from a code)`,
		`3) Key differences (bullets). If layout is unconfirmed, say that instead of guessing BH/K/L.`,
		`4) Bottom line (2–3 sentences a salesperson can say out loud)`
	].join("\n")) || localSummary(coaches);
	const verified = coaches.map((c) => c.layout || "");
	return Response.json({
		summary: sanitizeUnverifiedLayout(text, verified),
		live: Boolean(text && !text.includes("Live Grok summary was not")),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
} } } });
/**
* POST /api/rvfax/dossier
* Phase 3: two-step Live (research notes → JSON), year-band candidate truth
* injected, latest Grok models, soft fail keeps catalog paint on client.
*/
var cache = /* @__PURE__ */ new Map();
var TTL_MS = 216e5;
/** Bump when OEM ground-truth / prompt pipeline / pins change (Phase 4.4) */
var CACHE_VER = "v22-catalog-hard-lock";
/** Prefer current Grok; fall through if a slug is unavailable */
var DOSSIER_MODELS = [
	"grok-4-latest",
	"grok-4",
	"grok-3",
	"grok-2-1212"
];
var RESEARCH_SYSTEM = `You are Grok researching one RV for RVFAX Pro.

Task: produce concise RESEARCH NOTES (not JSON) for the EXACT coach identity:
  YEAR + MAKE + MODEL + FLOORPLAN (floorplan is mandatory when provided).

Rules:
1. FLOORPLAN IS PART OF THE IDENTITY. If a floorplan code is given (e.g. 4037, 37BH, 24.1), every hard fact (engine, HP, torque, chassis, length, GVWR, tanks) must be for THAT plan — not the model line average.
2. When floorplan is provided, do NOT answer with model-wide ranges like "34–44 ft" or "B6.7 or L9 360–450" unless the brochure truly lists both as options on that same plan. Prefer the single OEM package for that plan.
3. Powertrain often splits by plan length/tag (e.g. Ventana 34–37 = B6.7 360; 40–43 = L9 400). Never paste a sibling floorplan's option.
4. Prefer OEM brochure / chassis sheet / door-sticker style facts for that MY + plan.
5. Never steal powertrain from a sibling model (Kountry Star ≠ Bay Star; Allegro RED ≠ Bus; Phaeton 37BH ≠ 44OH; Vegas ≠ ACE F53).
6. If floorplan is MISSING, say so and keep powertrain as year-band model default with UNCERTAIN for plan-specific options — do not invent a floorplan.
7. If unsure, say UNCERTAIN — do not invent horsepower (never invent 450).
8. Include a SOURCES line with OEM-style cites.
9. Keep under 400 words.
10. ${FLOORPLAN_CODE_RULE}
11. ${FINDINGS_NOT_GUESSES_RULE}
12. Hard powertrain in these notes is never stored. Catalog year-band and brochure pins are cache truth.
Never call a floorplan a bunkhouse, bath-and-a-half, front-kitchen, or bunks unless the brochure/listing TEXT you found says that. Codes like 37BH, 38K, 37L mean nothing by themselves.
Sections: IDENTITY (year/make/model/floorplan), POWERTRAIN (this floorplan), DIMENSIONS/WEIGHTS (this floorplan), TANKS, MARKET, RELIABILITY, SOURCES.`;
var EXTRACT_SYSTEM = `You are Grok converting RV research notes into an RVFAX Pro OEM dossier JSON.

OUTPUT RULE (absolute):
Your entire reply must be ONE JSON object. No markdown fences. No preamble. First character = { last character = }.

FLOORPLAN RULE:
- The floorplan field in the JSON MUST equal the requested floorplan (or null only if none was requested).
- overallLength, gvwrLbs, engine, horsepower, torqueLbFt, chassis must reflect THAT floorplan when one was requested.
- Do not output model-line ranges as if they were a single plan (e.g. do not set overallLength to a "34-44" style value).
- ${FLOORPLAN_CODE_RULE}
- overview/keyFeatures must not invent bunks or a half-bath from the floorplan code. Only include those if the research notes explicitly found them.

CATALOG CANDIDATE TRUTH:
The user message includes a year+floorplan catalog candidate for powertrain/dims.
- Use catalog candidate engine/HP/chassis/fuel as the default hard facts for this year+floorplan.
- Do NOT override catalog candidate hard powertrain. Catalog year-band and brochure pins are the stored truth. If research disagrees, note it in overview/sourcesNote — never replace engine / HP / chassis / fuel.
- If research is uncertain, keep catalog candidate values (or null) — never invent 450 HP or sibling engines / sibling floorplans.
- Hard powertrain you output is never written to cache. Only pin/year-band is persisted.

SOFT FIELDS (overview, issues, sentiment, market): fill freely from research notes; mention the floorplan in overview when known.

tradeInUsd < retailLowUsd < retailHighUsd for USED USD.
confidence "high" only if powertrain + major dimensions are OEM-certain for this floorplan; else "medium" or "low".

ANTI-SIBLING:
- Never copy powertrain from a different model in the brand.
- Entegra Vision = gas F-53 only. Discovery (not LXE) = ISB/B6.7 class not ISL 8.9. Allegro RED = ISB/B6.7 not V10 and not Bus ISL/L9. Kountry Star = Cummins diesel pusher not Ford 7.3 gas. Thor Vegas/Axis = Ford cutaway RUV not F53 ACE.

Required keys:
year,make,model,floorplan,rvType,engine,horsepower,torqueLbFt,transmission,chassis,fuelType,towingCapacityLbs,fuelCapacityGal,overallLength,exteriorWidth,exteriorHeight,interiorHeight,gvwrLbs,uvwLbs,cccLbs,slideouts,sleeps,freshWaterGal,grayWaterGal,blackWaterGal,generator,mpgHighwayEst,warranty,floorplansThisYear,overview,keyFeatures,reliabilitySummary,commonIssues,servicePriorities,ownerSentiment,ratingEstimate,marketNotes,tradeInUsd,retailLowUsd,retailHighUsd,msrpLowUsd,msrpHighUsd,confidence,sourcesNote

Types: numbers for numeric fields; string[] for arrays; confidence "high"|"medium"|"low".
overview ≤ 2 sentences. keyFeatures/commonIssues/servicePriorities ≤ 5 each.
sourcesNote must name OEM/chassis/listing-style cites from the research notes (not empty fluff).`;
function workerBase() {
	return (process.env.CLOUDFLARE_WORKER_URL || process.env.VITE_CLOUDFLARE_WORKER_URL || "https://rv-assistant.soezrv.workers.dev").replace(/\/$/, "");
}
function extractText(data) {
	const d = data;
	return String(d?.choices?.[0]?.message?.content || d?.choices?.[0]?.text || d?.content || d?.message || "");
}
function stripFences(s) {
	let t = s.trim();
	if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
	return t.trim();
}
/** Pull first JSON object from model text (handles preamble / fences). */
function extractJsonObject(raw) {
	const s = stripFences(raw);
	if (!s) return null;
	if (s.startsWith("{") && s.endsWith("}")) return s;
	const start = s.indexOf("{");
	if (start < 0) return null;
	let depth = 0;
	let inStr = false;
	let esc = false;
	for (let i = start; i < s.length; i++) {
		const c = s[i];
		if (inStr) {
			if (esc) esc = false;
			else if (c === "\\") esc = true;
			else if (c === "\"") inStr = false;
			continue;
		}
		if (c === "\"") inStr = true;
		else if (c === "{") depth++;
		else if (c === "}") {
			depth--;
			if (depth === 0) return s.slice(start, i + 1);
		}
	}
	return null;
}
function hasRealSources(note) {
	if (!note || note.trim().length < 12) return false;
	return /oem|brochure|chassis|freightliner|spartan|cummins|ford\.com|newmar|tiffin|winnebago|forestriver|forest\s*river|nhtsa|rvusa|rv\.com|\.pdf|http|https|listing|door\s*sticker|build\s*sheet|torqshift|allison/i.test(note);
}
function parseHpCandidate(v) {
	if (v == null || v === "") return null;
	if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v);
	const m = String(v).replace(/,/g, "").match(/(\d{2,4})/);
	if (!m) return null;
	if (/varies|confirm/i.test(String(v)) && !/^\s*\d{2,4}\s*HP\s*$/i.test(String(v))) return null;
	const n = parseInt(m[1], 10);
	return n > 0 && n < 900 ? n : null;
}
function formatCandidateBlock(c, year) {
	if (!c) return `CATALOG CANDIDATE: (none provided — use research carefully; do not invent HP)`;
	return `CATALOG CANDIDATE TRUTH for model year ${year} (${c.bandFrom && c.bandTo ? `year-band ${c.bandFrom}–${c.bandTo}` : c.dataSource === "oem-year" ? "year-banded OEM" : c.dataSource || "catalog"}):
${c.floorplan ? `- floorplan (REQUIRED identity): ${c.floorplan}` : `- floorplan: (not selected — do not invent a plan; keep model-year defaults)`}
- length (catalog): ${c.lengthFt || "null"}
- gvwr (catalog): ${c.gvwr || "null"}
- engine: ${c.engine || "null"}
- horsepower: ${c.horsepower ?? "null"}
- torque: ${c.torque || "null"}
- chassis: ${c.chassis || "null"}
- transmission: ${c.transmission || "null"}
- fuelType: ${c.fuelType || "null"}
- type: ${c.type || "null"}
- note: ${c.accuracyNote || "none"}

CRITICAL: Powertrain + dimensions are YEAR + MAKE + MODEL + FLOORPLAN specific.
Do not apply a sibling floorplan's HP option (e.g. Phaeton 44OH 450 option ≠ 37BH; Ventana 4037 L9 ≠ Ventana 3436 B6.7).
If the floorplan only had 380 HP, never invent 450.
Hard powertrain defaults to this candidate. Override only with high confidence + OEM-style sources for THIS year AND floorplan.`;
}
async function callXaiChat(system, user, opts) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	for (const model of DOSSIER_MODELS) try {
		const body = {
			model,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}],
			temperature: opts?.temperature ?? .1,
			max_tokens: 4e3,
			stream: false
		};
		if (opts?.jsonMode) body.response_format = { type: "json_object" };
		const resp = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(body)
		});
		if (!resp.ok) continue;
		const data = await resp.json();
		const text = extractText(data).trim();
		if (!text) continue;
		const used = data?.model || model;
		return {
			text,
			model: String(used),
			upstream: "xai-direct"
		};
	} catch {}
	return null;
}
async function callWorkerChat(system, user, preferModel) {
	const base = workerBase();
	const urls = [
		`${base}/chat`,
		`${base}/rvgrok-chat`,
		`${base}/`
	];
	for (const url of urls) try {
		const resp = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: user
				}],
				agentMode: false,
				stream: false,
				model: preferModel,
				preferredModel: preferModel
			})
		});
		if (resp.status === 404 || resp.status === 405) continue;
		if (!resp.ok) continue;
		const modelHdr = resp.headers.get("X-Model-Used") || resp.headers.get("x-model-used") || preferModel;
		if ((resp.headers.get("content-type") || "").includes("text/event-stream")) {
			const text = await resp.text();
			let acc = "";
			for (const line of text.split("\n")) {
				if (!line.startsWith("data: ")) continue;
				const raw = line.slice(6).trim();
				if (!raw || raw === "[DONE]") continue;
				try {
					const p = JSON.parse(raw);
					acc += p?.choices?.[0]?.delta?.content || p?.content || "";
				} catch {}
			}
			if (acc.trim()) return {
				text: acc.trim(),
				model: modelHdr,
				upstream: "cloudflare-worker"
			};
			continue;
		}
		const data = await resp.json();
		const text = extractText(data).trim();
		if (text) return {
			text,
			model: data?.model || modelHdr,
			upstream: "cloudflare-worker"
		};
	} catch {}
	return null;
}
async function callGrok(system, user, opts) {
	const direct = await callXaiChat(system, user, opts);
	if (direct) return direct;
	return callWorkerChat(system, user, DOSSIER_MODELS[0]);
}
/**
* Phase 3.1 — research notes, then JSON extract.
*/
async function runTwoStepDossier(opts) {
	const coach = `${opts.year} ${opts.make} ${opts.model}${opts.floorplan ? ` floorplan ${opts.floorplan}` : " (NO FLOORPLAN SELECTED)"}`;
	const candidateBlock = formatCandidateBlock(opts.candidate, opts.year);
	const fpRule = opts.floorplan ? `FLOORPLAN LOCK: Research ONLY floorplan "${opts.floorplan}". Length, GVWR, engine, and HP must match this plan. Do not average the whole model line.` : `NO FLOORPLAN: State that plan-specific options are unknown. Do not invent a floorplan or a single definitive length/HP package.`;
	const research = await callGrok(RESEARCH_SYSTEM, `Research this exact coach for RVFAX:
${coach}

${fpRule}

${candidateBlock}

Write RESEARCH NOTES with IDENTITY, POWERTRAIN (this floorplan), DIMENSIONS/WEIGHTS (this floorplan), TANKS, MARKET, RELIABILITY, and SOURCES.
POWERTRAIN must match this model year AND floorplan (not a sibling plan or model). If candidate and research disagree, explain.
${FLOORPLAN_CODE_RULE}
Do not call it a bunkhouse or bath-and-a-half unless the OEM/listing text you found uses those words.`, { temperature: .1 });
	if (!research?.text) return null;
	const extractUser = `Coach: ${coach}
${fpRule}

${candidateBlock}

RESEARCH NOTES:
${research.text.slice(0, 6e3)}

Convert to the required RVFAX dossier JSON only.
JSON floorplan field must be ${opts.floorplan ? JSON.stringify(opts.floorplan) : "null"}.
Keep catalog candidate hard powertrain unless research + sources justify a high-confidence override for THIS floorplan.
sourcesNote must include real OEM/chassis/listing-style cites from the notes.`;
	const extracted = await callGrok(EXTRACT_SYSTEM, extractUser, {
		temperature: .1,
		jsonMode: true
	});
	if (!extracted?.text) {
		const fallback = await callGrok(EXTRACT_SYSTEM, extractUser, {
			temperature: .1,
			jsonMode: false
		});
		if (!fallback?.text) return null;
		return {
			rawJson: fallback.text,
			model: `${research.model}→${fallback.model}`,
			research: research.text
		};
	}
	return {
		rawJson: extracted.text,
		model: `${research.model}→${extracted.model}`,
		research: research.text
	};
}
function applyBrochurePin(d) {
	const pin = findPowertrainCorrection(d.year, d.make, d.model, d.floorplan || void 0);
	if (!pin) return d;
	if (!(!d.engine || powertrainConflictsWithPin(pin, d.engine, d.horsepower) || pin.horsepower > 0 && d.horsepower != null && Math.abs(d.horsepower - pin.horsepower) >= 40) && d.engine) return {
		...d,
		engine: pin.engine,
		horsepower: pin.horsepower,
		torqueLbFt: pin.torqueLbFt ?? d.torqueLbFt,
		chassis: pin.chassis ?? d.chassis,
		transmission: pin.transmission ?? d.transmission,
		fuelType: pin.fuelType ?? d.fuelType,
		overview: sanitizeNarrativeForPin(pin, d.overview),
		keyFeatures: sanitizeFeaturesForPin(pin, d.keyFeatures),
		reliabilitySummary: sanitizeNarrativeForPin(pin, d.reliabilitySummary),
		marketNotes: sanitizeNarrativeForPin(pin, d.marketNotes)
	};
	return {
		...d,
		engine: pin.engine,
		horsepower: pin.horsepower,
		torqueLbFt: pin.torqueLbFt ?? d.torqueLbFt,
		chassis: pin.chassis ?? d.chassis,
		transmission: pin.transmission ?? d.transmission,
		fuelType: pin.fuelType ?? d.fuelType,
		overview: sanitizeNarrativeForPin(pin, d.overview),
		keyFeatures: sanitizeFeaturesForPin(pin, d.keyFeatures),
		reliabilitySummary: sanitizeNarrativeForPin(pin, d.reliabilitySummary),
		marketNotes: sanitizeNarrativeForPin(pin, d.marketNotes),
		sourcesNote: [d.sourcesNote, pin.note].filter(Boolean).join(" · ")
	};
}
/**
* Phase 3.2 — candidate truth wins unless Live is high-confidence + real sources
* and does not conflict with fuel/engine family.
*/
function applyCatalogCandidateTruth(d, candidate) {
	if (!candidate) return d;
	if (findPowertrainCorrection(d.year, d.make, d.model, d.floorplan || void 0)) return d;
	const catEngine = candidate.engine?.trim() || null;
	const catHp = parseHpCandidate(candidate.horsepower);
	const catChassis = candidate.chassis?.trim() || null;
	const catTrans = candidate.transmission?.trim() || null;
	const catFuel = candidate.fuelType?.trim() || null;
	let engine = d.engine;
	let horsepower = d.horsepower;
	let chassis = d.chassis;
	let transmission = d.transmission;
	let fuelType = d.fuelType;
	let notes = d.sourcesNote;
	catEngine && engine && (/diesel|cummins|isb|b6/i.test(catEngine) && /godzilla|triton|v10|f-?53/i.test(engine) && !/cummins|diesel|isb|b6/i.test(engine) || /godzilla|triton|v10|f-?53|gas/i.test(catEngine) && /cummins|l9|isl|diesel/i.test(engine) && /godzilla|triton|v10|gas/i.test(engine));
	if (catEngine) {
		engine = catEngine;
		if (catHp != null) horsepower = catHp;
		if (catChassis) chassis = catChassis;
		if (catTrans) transmission = catTrans;
		if (catFuel) fuelType = catFuel;
		notes = [notes, "Hard powertrain held to year-band catalog candidate (Live override not allowed without high confidence + OEM sources)."].filter(Boolean).join(" ");
	} else if (catHp != null && (horsepower == null || horsepower <= 0)) horsepower = catHp;
	if ((!engine || engine === "—") && catEngine) engine = catEngine;
	if ((horsepower == null || horsepower <= 0) && catHp != null) horsepower = catHp;
	if ((!chassis || chassis === "—") && catChassis) chassis = catChassis;
	if ((!transmission || transmission === "—") && catTrans) transmission = catTrans;
	if (!fuelType && catFuel) fuelType = catFuel;
	return {
		...d,
		engine,
		horsepower,
		chassis,
		transmission,
		fuelType,
		sourcesNote: notes
	};
}
function applyOemGroundTruth(d) {
	let out = { ...d };
	if (/vision/i.test(out.model || "") && !/xl|diesel/i.test(out.model || "")) {
		const blob = `${out.engine || ""} ${out.chassis || ""} ${out.fuelType || ""}`;
		if (/cummins|l9|isl|diesel/i.test(blob) && !/godzilla|f-?53|gas/i.test(blob)) out = {
			...out,
			engine: "Ford 7.3L V8 Godzilla",
			horsepower: 350,
			chassis: out.chassis || "Ford F53",
			fuelType: "Gas",
			sourcesNote: [out.sourcesNote, "Vision gas F53 guard"].filter(Boolean).join(" · ")
		};
	}
	out = applyBrochurePin(out);
	const oem = findOemFloorplanSpec(out.year, out.make, out.model, out.floorplan || "");
	const verified = [oem?.layoutNote, oem?.note];
	out = {
		...out,
		overview: sanitizeUnverifiedLayout(out.overview, verified) || out.overview,
		reliabilitySummary: sanitizeUnverifiedLayout(out.reliabilitySummary, verified) || out.reliabilitySummary,
		marketNotes: sanitizeUnverifiedLayout(out.marketNotes, verified) || out.marketNotes,
		keyFeatures: (out.keyFeatures || []).map((f) => sanitizeUnverifiedLayout(f, verified))
	};
	return out;
}
function parseDossier(raw, year, make, model, floorplan, researchNotes) {
	try {
		const jsonText = extractJsonObject(raw) ?? stripFences(raw);
		const j = JSON.parse(jsonText);
		const pick = (...keys) => {
			for (const k of keys) if (j[k] != null && j[k] !== "") return j[k];
			return null;
		};
		const num = (...keys) => {
			const v = pick(...keys);
			if (v == null || v === "") return null;
			if (typeof v === "number" && Number.isFinite(v)) return v;
			const m = String(v).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
			if (!m) return null;
			const n = Number(m[0]);
			return Number.isFinite(n) ? n : null;
		};
		const str = (...keys) => {
			const v = pick(...keys);
			if (v == null) return null;
			return String(v).trim() || null;
		};
		const arr = (k) => {
			const v = j[k];
			if (!Array.isArray(v)) return [];
			return v.map((x) => String(x)).filter(Boolean).slice(0, 8);
		};
		const conf = String(j.confidence || "medium").toLowerCase();
		const confidence = conf === "high" || conf === "low" ? conf : "medium";
		let sourcesNote = str("sourcesNote");
		if (!hasRealSources(sourcesNote) && researchNotes) {
			const srcLine = researchNotes.split(/\n/).find((l) => /source/i.test(l));
			if (srcLine) sourcesNote = [sourcesNote, srcLine.trim()].filter(Boolean).join(" · ");
			else if (!sourcesNote) sourcesNote = "Research notes synthesis — verify against OEM brochure / chassis sheet";
		}
		let d = {
			year: num("year") ?? year,
			make: str("make") || make,
			model: str("model") || model,
			floorplan: str("floorplan") || floorplan || null,
			rvType: str("rvType", "type", "class"),
			engine: str("engine", "powerplant"),
			horsepower: num("horsepower", "hp"),
			torqueLbFt: num("torqueLbFt", "torque", "torque_lb_ft"),
			transmission: str("transmission"),
			chassis: str("chassis"),
			fuelType: str("fuelType", "fuel"),
			towingCapacityLbs: num("towingCapacityLbs", "towCapacity", "tow_capacity"),
			fuelCapacityGal: num("fuelCapacityGal", "fuel_capacity", "fuelCapacity"),
			overallLength: str("overallLength", "length", "length_ft"),
			exteriorWidth: str("exteriorWidth", "width"),
			exteriorHeight: str("exteriorHeight", "height"),
			interiorHeight: str("interiorHeight", "ceiling"),
			gvwrLbs: num("gvwrLbs", "gvwr"),
			uvwLbs: num("uvwLbs", "uvw"),
			cccLbs: num("cccLbs", "ccc"),
			slideouts: num("slideouts", "slides", "slideoutsCount"),
			sleeps: num("sleeps"),
			freshWaterGal: num("freshWaterGal", "fresh_water", "freshWater"),
			grayWaterGal: num("grayWaterGal", "gray_water", "grayWater"),
			blackWaterGal: num("blackWaterGal", "black_water", "blackWater"),
			generator: str("generator"),
			mpgHighwayEst: num("mpgHighwayEst", "mpg", "highwayMpg"),
			warranty: str("warranty"),
			floorplansThisYear: arr("floorplansThisYear"),
			overview: str("overview"),
			keyFeatures: (() => {
				const a = arr("keyFeatures");
				return a.length ? a : arr("features");
			})(),
			reliabilitySummary: str("reliabilitySummary"),
			commonIssues: arr("commonIssues"),
			servicePriorities: arr("servicePriorities"),
			ownerSentiment: str("ownerSentiment"),
			ratingEstimate: num("ratingEstimate"),
			marketNotes: str("marketNotes"),
			tradeInUsd: num("tradeInUsd", "tradeIn"),
			retailLowUsd: num("retailLowUsd", "retailLow"),
			retailHighUsd: num("retailHighUsd", "retailHigh"),
			msrpLowUsd: num("msrpLowUsd", "msrpLow"),
			msrpHighUsd: num("msrpHighUsd", "msrpHigh"),
			confidence,
			sourcesNote,
			fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
			live: true
		};
		d = applyOemGroundTruth(d);
		return d;
	} catch {
		return null;
	}
}
var Route$2 = createFileRoute("/api/rvfax/dossier")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json();
		const year = String(body.year ?? "").trim();
		const make = String(body.make ?? "").trim();
		const model = String(body.model ?? "").trim();
		const floorplan = String(body.floorplan ?? "").trim();
		const catalogCandidate = body.catalogCandidate;
		if (!year || !make || !model) return Response.json({ error: "year, make, and model are required" }, { status: 400 });
		const yNum = parseInt(year, 10) || 0;
		const key = `${CACHE_VER}|${year}|${make}|${model}|${floorplan}`.toLowerCase();
		const hit = cache.get(key);
		if (hit && Date.now() - hit.at < TTL_MS) {
			let data = applyOemGroundTruth({
				...hit.data,
				cached: true
			});
			data = applyCatalogCandidateTruth(data, catalogCandidate);
			data = applyBrochurePin(data);
			return Response.json({
				data,
				meta: {
					model: hit.model || "cache",
					cached: true,
					pipeline: "phase3-two-step"
				}
			});
		}
		const twoStep = await runTwoStepDossier({
			year,
			make,
			model,
			floorplan,
			candidate: catalogCandidate
		});
		if (!twoStep) return Response.json({
			error: "Live dossier unavailable — catalog year-band remains on screen.",
			meta: {
				pipeline: "phase3-two-step",
				model: null
			}
		}, { status: 502 });
		let parsed = parseDossier(twoStep.rawJson, yNum, make, model, floorplan, twoStep.research);
		if (!parsed) return Response.json({
			error: "Live dossier returned unreadable data — catalog year-band remains.",
			meta: {
				model: twoStep.model,
				pipeline: "phase3-two-step"
			}
		}, { status: 502 });
		parsed = applyCatalogCandidateTruth(parsed, catalogCandidate);
		parsed = applyBrochurePin(parsed);
		if (!hasRealSources(parsed.sourcesNote)) parsed = {
			...parsed,
			sourcesNote: [parsed.sourcesNote, "Phase-3 research synthesis — confirm OEM brochure / chassis sheet for transactions"].filter(Boolean).join(" · "),
			confidence: parsed.confidence === "high" ? "medium" : parsed.confidence
		};
		cache.set(key, {
			at: Date.now(),
			data: {
				...parsed,
				engine: null,
				horsepower: null,
				torqueLbFt: null,
				chassis: null,
				transmission: null,
				fuelType: null
			},
			model: twoStep.model
		});
		return Response.json({
			data: parsed,
			meta: {
				model: twoStep.model,
				cached: false,
				pipeline: "phase3-two-step",
				preferredModels: DOSSIER_MODELS
			}
		});
	} catch (e) {
		return Response.json({ error: e instanceof Error ? e.message : "Live dossier request failed — catalog remains." }, { status: 500 });
	}
} } } });
/**
* GET /api/rvgrok/token
* Proxies Cloudflare Worker ephemeral token for xAI Grok Voice realtime.
*/
async function proxyEphemeralToken(method) {
	const base = (process.env.CLOUDFLARE_WORKER_URL || process.env.VITE_CLOUDFLARE_WORKER_URL || "https://rv-assistant.soezrv.workers.dev").replace(/\/$/, "");
	try {
		const resp = await fetch(`${base}/get-ephemeral-token`, {
			method,
			headers: method === "POST" ? {
				Accept: "application/json",
				"Content-Type": "application/json"
			} : { Accept: "application/json" },
			body: method === "POST" ? "{}" : void 0
		});
		const text = await resp.text();
		return new Response(text, {
			status: resp.status,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	} catch (e) {
		return Response.json({ error: e instanceof Error ? e.message : "Failed to reach Cloudflare worker" }, { status: 502 });
	}
}
var Route$1 = createFileRoute("/api/rvgrok/token")({ server: { handlers: {
	GET: async () => proxyEphemeralToken("GET"),
	POST: async () => proxyEphemeralToken("POST")
} } });
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var ApiRouteRoute = Route$12.update({
	id: "/api",
	path: "/api",
	getParentRoute: () => Route$14
});
var ApiGeocodeRoute = Route$11.update({
	id: "/geocode",
	path: "/geocode",
	getParentRoute: () => ApiRouteRoute
});
var ApiLendersRoute = Route$10.update({
	id: "/lenders",
	path: "/lenders",
	getParentRoute: () => ApiRouteRoute
});
var ApiOsrmRoute = Route$9.update({
	id: "/osrm",
	path: "/osrm",
	getParentRoute: () => ApiRouteRoute
});
var ApiRvgrokRoute = Route$8.update({
	id: "/rvgrok",
	path: "/rvgrok",
	getParentRoute: () => ApiRouteRoute
});
var ApiMarketcheckSearchRoute = Route$7.update({
	id: "/marketcheck/search",
	path: "/marketcheck/search",
	getParentRoute: () => ApiRouteRoute
});
var ApiNhtsaRecallsRoute = Route$6.update({
	id: "/nhtsa/recalls",
	path: "/nhtsa/recalls",
	getParentRoute: () => ApiRouteRoute
});
var ApiNhtsaVinRoute = Route$5.update({
	id: "/nhtsa/vin",
	path: "/nhtsa/vin",
	getParentRoute: () => ApiRouteRoute
});
var ApiRvfaxCatalogResearchRoute = Route$4.update({
	id: "/rvfax/catalog-research",
	path: "/rvfax/catalog-research",
	getParentRoute: () => ApiRouteRoute
});
var ApiRvfaxCompareRoute = Route$3.update({
	id: "/rvfax/compare",
	path: "/rvfax/compare",
	getParentRoute: () => ApiRouteRoute
});
var ApiRvfaxDossierRoute = Route$2.update({
	id: "/rvfax/dossier",
	path: "/rvfax/dossier",
	getParentRoute: () => ApiRouteRoute
});
var ApiRvgrokRouteChildren = { ApiRvgrokTokenRoute: Route$1.update({
	id: "/token",
	path: "/token",
	getParentRoute: () => ApiRvgrokRoute
}) };
var ApiRouteRouteChildren = {
	ApiGeocodeRoute,
	ApiLendersRoute,
	ApiOsrmRoute,
	ApiRvgrokRoute: ApiRvgrokRoute._addFileChildren(ApiRvgrokRouteChildren),
	ApiMarketcheckSearchRoute,
	ApiNhtsaRecallsRoute,
	ApiNhtsaVinRoute,
	ApiRvfaxCatalogResearchRoute,
	ApiRvfaxCompareRoute,
	ApiRvfaxDossierRoute
};
var rootRouteChildren = {
	IndexRoute,
	ApiRouteRoute: ApiRouteRoute._addFileChildren(ApiRouteRouteChildren)
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { __exportAll as C, TOOL_META as S, weightForFloorplan as _, normalizeVin$1 as a, DEFAULT_WORKER_URL as b, findPowertrainCorrection as c, sanitizeNarrativeForPin as d, findOemFloorplanSpec as f, overallInchesFromFloorplan as g, lengthFtFromFloorplan as h, isValidVinFormat as i, powertrainConflictsWithPin as l, formatInchesAsFtIn as m, fetchOsrmRoute as n, sanitizeUnverifiedLayout as o, formatFloorplanLength as p, decodeVinViaApi as r, unverifiedLayoutLabel as s, router_exports as t, sanitizeFeaturesForPin as u, LENDERS_CATALOG as v, HISTORY_KEY as x, AGENT_MODE_KEY as y };
