import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as LockOpen, C as Search, H as LoaderCircle, L as MapPin, U as ListChecks, V as LocateFixed, ft as ChevronRight, it as Droplets, j as Navigation, l as TriangleAlert, m as Tent, o as User, tt as ExternalLink, z as Lock } from "../_libs/lucide-react.mjs";
import { u as cn } from "./routes-DqDGUVQW.mjs";
import { n as fetchOsrmRoute } from "./router-C-sy555R.mjs";
import { _ as getSpec, f as getFloorplansForYear, h as getModelsForYearMake, m as getMakesForYear, s as buildCustomSpec } from "./catalog-Dt-eFo6s.mjs";
import { t as SelectSheet } from "./SelectSheet-aKbu9anf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvTripsApp-BEP2P9VJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var rvtrips_america_default = "/assets/rvtrips-america-DYPoR4Bg.jpg";
var rvtrips_map_panel_default = "/assets/rvtrips-map-panel-CRPCf-Yy.jpg";
var RVTRIPS_AMERICA_BACKDROP = rvtrips_america_default;
var RVTRIPS_MAP_PANEL = rvtrips_map_panel_default;
var DEMO_ROUTE = {
	id: "west-to-glacier",
	origin: {
		id: "nv-mid",
		label: "Current location",
		subtitle: "I-80 corridor · NV"
	},
	destination: {
		id: "glacier",
		label: "Glacier NP, MT",
		subtitle: "Going-to-the-Sun · RV-aware staging"
	},
	miles: 1035.8,
	driveHours: 21,
	driveMinutes: 27,
	alertCount: 5,
	engine: "REAL ROUTE · OSRM"
};
var DEMO_CAMPS = [
	{
		id: "shorts-bar",
		name: "Shorts Bar",
		miFromMidpoint: 3.3,
		maxLengthFt: 50,
		hasHookups: true,
		campspotUrl: "https://www.campspot.com/"
	},
	{
		id: "iron-phone",
		name: "Iron Phone Junction Campground",
		miFromMidpoint: 10.9,
		maxLengthFt: 60,
		hasHookups: true,
		campspotUrl: "https://www.campspot.com/"
	},
	{
		id: "glacier-staging",
		name: "West Glacier RV Staging",
		miFromMidpoint: 18.2,
		maxLengthFt: 45,
		hasHookups: false,
		campspotUrl: "https://www.campspot.com/"
	}
];
var DEMO_PACK = [
	{
		id: "p1",
		item: "Propane tank valves + leak soap",
		done: true
	},
	{
		id: "p2",
		item: "Engine brake check · jake brake test",
		done: true
	},
	{
		id: "p3",
		item: "Height stickers / clearance card",
		done: false
	},
	{
		id: "p4",
		item: "Leveling blocks · 45 ft pad kit",
		done: false
	},
	{
		id: "p5",
		item: "National Parks annual pass",
		done: true
	},
	{
		id: "p6",
		item: "Tire pressure for mountain grades",
		done: false
	}
];
function formatDrive(hours, minutes) {
	return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
function formatMiles(n) {
	return n.toLocaleString("en-US", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
}
var EMPTY_COACH_PROFILE = {
	year: "",
	make: "",
	model: "",
	floorplan: "",
	type: "",
	heightFt: 0,
	lengthFt: 0,
	widthFt: 0,
	weightLbs: 0,
	fuelType: "",
	locked: false
};
var PROFILE_STORAGE_KEY = "rvfax_trips_profile_v1";
function loadLockedProfile() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
		if (!raw) return null;
		const p = JSON.parse(raw);
		if (!p?.make || !p?.model || !p?.floorplan) return null;
		return {
			...p,
			locked: true
		};
	} catch {
		return null;
	}
}
function saveLockedProfile(p) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
			...p,
			locked: true
		}));
	} catch {}
}
function clearLockedProfile() {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(PROFILE_STORAGE_KEY);
	} catch {}
}
function heightForType(type) {
	const t = type.toLowerCase();
	if (t.includes("super c")) return 13;
	if (t.includes("class a") || t.includes("diesel pusher") || t.includes("diesel") && t.includes("class")) return 13.5;
	if (t.includes("class c")) return 11.5;
	if (t.includes("class b")) return 9.8;
	if (t.includes("5th") || t.includes("fifth")) return 13.2;
	if (t.includes("toy")) return 13;
	if (t.includes("trailer") || t.includes("travel")) return 11.2;
	return 12.5;
}
function widthForType(type) {
	if (type.toLowerCase().includes("class b")) return 7.5;
	return 8.5;
}
/**
* Parse floorplan codes that embed length (e.g. 4551 → ~45 ft, 37BA → 37 ft).
* Falls back to catalog length range midpoint.
*/
function lengthFromFloorplan(floorplan, lengthRange) {
	const mid = Math.round(((lengthRange?.[0] ?? 30) + (lengthRange?.[1] ?? 40)) / 2);
	const fp = floorplan.trim();
	if (!fp) return 0;
	const m = fp.match(/^(\d{2})/);
	if (m) {
		const n = parseInt(m[1], 10);
		if (n >= 16 && n <= 55) return n;
	}
	return mid;
}
function weightFromFloorplan(floorplan, weightRange, lengthFt) {
	const lo = weightRange?.[0] ?? 8e3;
	const hi = weightRange?.[1] ?? 4e4;
	const mid = Math.round((lo + hi) / 2);
	if (!floorplan || !lengthFt) return 0;
	const span = Math.max(1, hi - lo);
	const t = Math.min(1, Math.max(0, (lengthFt - 20) / 30));
	return Math.round(lo + span * t * .5 + mid * .5);
}
/**
* Suggested dimensions — only after year + make + model + floorplan.
* User can then manually edit before locking.
*/
function suggestCoachFromSelection(opts) {
	const make = opts.make.trim();
	const model = opts.model.trim();
	const floorplan = opts.floorplan.trim();
	if (!make || !model || !floorplan) return {
		...EMPTY_COACH_PROFILE,
		year: opts.year,
		make,
		model,
		floorplan
	};
	const spec = getSpec(make, model) || buildCustomSpec(make, model, floorplan, void 0);
	const lengthFt = lengthFromFloorplan(floorplan, spec.lengthRange);
	const weightLbs = weightFromFloorplan(floorplan, spec.weightRange, lengthFt);
	return {
		year: opts.year,
		make,
		model,
		floorplan,
		type: spec.type,
		heightFt: heightForType(spec.type),
		lengthFt,
		widthFt: widthForType(spec.type),
		weightLbs,
		engine: spec.engine,
		fuelType: spec.fuelType,
		locked: false
	};
}
var TRIP_YEARS = Array.from({ length: 25 }, (_, i) => String(2026 - i));
function profileIsComplete(p) {
	return Boolean(p.year && p.make && p.model && p.floorplan && p.lengthFt > 0 && p.heightFt > 0 && p.weightLbs > 0);
}
var TUNNEL_RE = /\b(tunnel|underpass|tube|bore|subway|zion|carmel|newfound)\b/i;
var GRADE_RE = /\b(pass|summit|canyon|mountain|grade|sierra|cascade|rockies|glacier|yellowstone|banff|steep)\b/i;
var FERRY_RE = /\b(ferry|boat)\b/i;
var PARK_RE = /\b(national park|state park|\bnp\b|going-to-the-sun|scenic|parkway)\b/i;
var LOCAL_RE = /\b(residential|service|alley|drive|lane|court|circle|trail|farm|forest)\b/i;
var BRIDGE_RE = /\b(bridge|viaduct|overpass|causeway)\b/i;
function corpusFromRoute(route, destLabel, originLabel) {
	const steps = route.steps || [];
	return {
		text: [
			destLabel,
			originLabel,
			route.engine,
			...steps.map((s) => `${s.instruction} ${s.name} ${s.maneuver}`)
		].join(" · "),
		steps
	};
}
function stepMatches(steps, re) {
	return steps.some((s) => re.test(`${s.instruction} ${s.name}`));
}
/**
* Analyze live OSRM route against locked coach dimensions.
* Returns empty if no locked profile or no route.
*/
function analyzeRouteRestrictions(opts) {
	const empty = {
		alerts: [],
		canSuggestSafer: false,
		summary: ""
	};
	const coach = opts.coach;
	if (!coach?.locked) return empty;
	if (!coach.make || !coach.lengthFt || !coach.heightFt) return empty;
	if (!opts.hasRoute || !opts.route) return empty;
	const route = opts.route;
	if ((!route.steps || route.steps.length === 0) && route.miles <= 0) return empty;
	const { text, steps } = corpusFromRoute(route, opts.destLabel || "", opts.originLabel || "");
	const hasTunnel = TUNNEL_RE.test(text) || stepMatches(steps, TUNNEL_RE);
	const hasGrade = GRADE_RE.test(text) || stepMatches(steps, GRADE_RE) || route.miles > 200 && (route.avgSpeedMph ?? 55) < 48;
	const hasFerry = FERRY_RE.test(text) || stepMatches(steps, FERRY_RE);
	const hasPark = PARK_RE.test(text);
	const hasBridge = BRIDGE_RE.test(text) || stepMatches(steps, BRIDGE_RE);
	const localHeavy = steps.filter((s) => LOCAL_RE.test(`${s.name} ${s.instruction}`)).length >= 4;
	const highwayShare = (route.scoreBreakdown?.highwayM ?? 0) / Math.max(1, route.distanceM || 1);
	const alerts = [];
	const h = coach.heightFt;
	const L = coach.lengthFt;
	const w = coach.widthFt;
	if (hasTunnel || hasPark && /zion|carmel|newfound|glacier/i.test(text)) alerts.push({
		id: "propane",
		severity: "critical",
		kind: "PROPANE RESTRICTION",
		title: "Propane tanks OFF in tunnels",
		body: `Route includes tunnel / park corridor language. Shut propane OFF before entry. Your ${coach.year} ${coach.make} ${coach.model} still needs local rules verified.`
	});
	if (h >= 12.5 && (hasTunnel || hasBridge || localHeavy || highwayShare < .45)) alerts.push({
		id: "bridge",
		severity: h >= 13.2 ? "caution" : "info",
		kind: "HEIGHT CLEARANCE",
		title: "Verify overpass / tunnel clearance",
		body: `Coach height ${h} ft — route has ${hasTunnel ? "tunnels" : hasBridge ? "bridges/overpasses" : "more local roads"}. Prefer freeways; check posted clearances before committing.`
	});
	else if (h >= 13.5 && route.miles > 50 && localHeavy) alerts.push({
		id: "bridge-soft",
		severity: "info",
		kind: "HEIGHT ADVISORY",
		title: "High coach · local roads on path",
		body: `${h} ft overall height — avoid GPS shortcuts onto farm roads.`
	});
	if (hasGrade && L >= 28) alerts.push({
		id: "grade",
		severity: "caution",
		kind: "GRADE RESTRICTION",
		title: "Mountain grades ahead",
		body: `Your ${L} ft coach may hit steep grades on this corridor. Use engine braking, watch runaway ramps, and verify campsite length before arrival.`
	});
	if (w >= 8 && (localHeavy || hasPark && L >= 35)) alerts.push({
		id: "width",
		severity: "caution",
		kind: "WIDTH RESTRICTION",
		title: "Narrow corridors",
		body: `Width ${w} ft — park roads / local approaches on this route may feel tight. Take wide turns; avoid sub-9 ft bridges.`
	});
	if (hasFerry) alerts.push({
		id: "ferry",
		severity: "critical",
		kind: "FERRY ON ROUTE",
		title: "Ferry segment detected",
		body: "This path includes ferry language. Many high coaches prefer a land detour — try Safer RV route."
	});
	if (L >= 35 && (hasPark || route.miles > 80 && hasGrade)) alerts.push({
		id: "length",
		severity: "info",
		kind: "LENGTH ADVISORY",
		title: "Campsite length",
		body: `${L} ft overall — filter pads for ${Math.ceil(L + 5)} ft+. Short sites near park gates may not fit.`
	});
	return {
		alerts,
		canSuggestSafer: alerts.some((a) => a.severity === "critical" || a.severity === "caution") || localHeavy || hasFerry || highwayShare < .4,
		summary: alerts.length === 0 ? "No route-specific restrictions found for this coach and path." : `${alerts.length} restriction${alerts.length === 1 ? "" : "s"} matched this route + profile.`
	};
}
function saferOsrmParams(coach) {
	if (coach && coach.heightFt >= 12) return {
		weight: "rv",
		exclude: "ferry"
	};
	return { weight: "rv" };
}
var DUMP_KIND_LABEL = {
	"rest-area": "Rest area",
	city: "City",
	sanitation: "Sanitation district",
	visitor: "Visitor center",
	park: "Park"
};
var DUMP_STATES = [
	"AZ",
	"CA",
	"CO",
	"ID",
	"MT",
	"NM",
	"NV",
	"OR",
	"TX",
	"UT",
	"WA",
	"WY"
];
var FREE_DUMP_STATIONS = [
	{
		id: "ca-centralsan",
		name: "Central San RV Waste Disposal",
		city: "Martinez",
		state: "CA",
		lat: 37.9938,
		lng: -122.1132,
		kind: "sanitation",
		hours: "24 / 7",
		water: "rinse",
		address: "5019 Imhoff Pl, Martinez, CA",
		notes: "No-cost self-serve dump. Follow posted hose and rinse rules."
	},
	{
		id: "ca-i8-elcentro-eb",
		name: "I-8 El Centro Rest Area · Eastbound",
		city: "El Centro",
		state: "CA",
		lat: 32.7734,
		lng: -115.5628,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-8 eastbound rest area, El Centro, CA",
		notes: "Dump at the far end near the on-ramp. Confirm seasonal closures."
	},
	{
		id: "ca-i8-elcentro-wb",
		name: "I-8 El Centro Rest Area · Westbound",
		city: "El Centro",
		state: "CA",
		lat: 32.7748,
		lng: -115.5681,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-8 westbound rest area, El Centro, CA",
		notes: "Paired with the eastbound dump. Easy I-8 pull-through."
	},
	{
		id: "ca-needles-ra",
		name: "Needles Rest Area · I-40",
		city: "Needles",
		state: "CA",
		lat: 34.8506,
		lng: -114.6147,
		kind: "rest-area",
		hours: "Daylight typical",
		water: "rinse",
		address: "I-40 rest area west of Needles, CA",
		notes: "Desert corridor dump. Carry extra rinse water in summer."
	},
	{
		id: "or-charles-reynolds",
		name: "Charles Reynolds Rest Area · I-84 EB",
		city: "La Grande",
		state: "OR",
		lat: 45.3237,
		lng: -117.9814,
		kind: "rest-area",
		hours: "24 / 7",
		water: "potable",
		address: "I-84 EB mm 269, 9 mi east of La Grande, OR",
		notes: "Oregon DOT sanitary dump. No charge at rest areas."
	},
	{
		id: "or-sage-hen",
		name: "Sage Hen Rest Area · US-20",
		city: "Burns",
		state: "OR",
		lat: 43.5862,
		lng: -119.3518,
		kind: "rest-area",
		hours: "24 / 7",
		water: "potable",
		address: "US-20 mm 114, 18 mi west of Burns, OR",
		notes: "Bidirectional high-desert rest area with sanitary dump."
	},
	{
		id: "or-clyde-holiday",
		name: "Clyde Holiday State Park Rest Area",
		city: "Mount Vernon",
		state: "OR",
		lat: 44.4164,
		lng: -119.1168,
		kind: "park",
		hours: "Day use",
		water: "potable",
		address: "US-26, Mount Vernon, OR",
		notes: "State park rest-area dump. Confirm seasonal hours."
	},
	{
		id: "or-tugman",
		name: "William Tugman State Park",
		city: "Reedsport",
		state: "OR",
		lat: 43.6051,
		lng: -124.1762,
		kind: "park",
		hours: "Day use",
		water: "potable",
		address: "US-101 mm 220.7, 8 mi south of Reedsport, OR",
		notes: "Coastal dump with NB/SB access. Restrooms and drinking water."
	},
	{
		id: "or-sutton",
		name: "Sutton Creek Rest Area · US-101",
		city: "Florence",
		state: "OR",
		lat: 44.0658,
		lng: -124.1242,
		kind: "rest-area",
		hours: "Day use",
		water: "potable",
		address: "US-101 mm 176, 14 mi north of Florence, OR",
		notes: "Oregon coast dump. Tight turnaround — scout first if 40 ft+."
	},
	{
		id: "ut-orem",
		name: "City of Orem RV Dump",
		city: "Orem",
		state: "UT",
		lat: 40.3118,
		lng: -111.7196,
		kind: "city",
		hours: "24 / 7",
		water: "rinse",
		address: "Orem, UT (city wastewater campus)",
		notes: "Long-reported free and open 24/7. Rinse water only — no potable."
	},
	{
		id: "az-ehrenberg-ra",
		name: "Ehrenberg Rest Area · I-10",
		city: "Ehrenberg",
		state: "AZ",
		lat: 33.6058,
		lng: -114.5168,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-10 rest area, Ehrenberg, AZ",
		notes: "Colorado River crossing dump. Confirm lane is open."
	},
	{
		id: "az-sacaton",
		name: "Sacaton Rest Area · I-10",
		city: "Sacaton",
		state: "AZ",
		lat: 33.0769,
		lng: -111.7493,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-10 rest area south of Phoenix, AZ",
		notes: "Useful southbound Phoenix dump. Watch summer heat on hoses."
	},
	{
		id: "nv-valley-of-fire",
		name: "Valley of Fire Visitor Dump",
		city: "Overton",
		state: "NV",
		lat: 36.4304,
		lng: -114.5136,
		kind: "park",
		hours: "Park hours",
		water: "rinse",
		address: "Valley of Fire State Park, NV",
		notes: "Park dump when posted free or included with entry. Confirm at gate."
	},
	{
		id: "id-blacks-creek",
		name: "Blacks Creek Rest Area · I-84",
		city: "Boise",
		state: "ID",
		lat: 43.4731,
		lng: -116.0647,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-84 SE of Boise, ID",
		notes: "Treasure Valley dump. Idaho rest-area dumps are typically no fee."
	},
	{
		id: "wa-scatter-creek",
		name: "Scatter Creek Rest Area · I-5",
		city: "Grand Mound",
		state: "WA",
		lat: 46.8012,
		lng: -122.9816,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-5, Grand Mound, WA",
		notes: "South of Olympia. Confirm the sanitary lane is posted open."
	},
	{
		id: "mt-anaconda",
		name: "Anaconda Rest Area · I-90",
		city: "Anaconda",
		state: "MT",
		lat: 46.1274,
		lng: -112.9421,
		kind: "rest-area",
		hours: "Seasonal",
		water: "rinse",
		address: "I-90 near Anaconda, MT",
		notes: "Glacier / Yellowstone corridor. Winter closures possible."
	},
	{
		id: "wy-evanston",
		name: "Evanston Rest Area · I-80",
		city: "Evanston",
		state: "WY",
		lat: 41.2633,
		lng: -110.9632,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-80, Evanston, WY",
		notes: "Utah–Wyoming line dump. Wind can make hose work messy."
	},
	{
		id: "co-vail-pass",
		name: "Vail Pass Rest Area · I-70",
		city: "Vail",
		state: "CO",
		lat: 39.5306,
		lng: -106.2174,
		kind: "rest-area",
		hours: "Seasonal",
		water: "none",
		address: "I-70 Vail Pass, CO",
		notes: "High-elevation stop. Confirm dump is open — winter work common."
	},
	{
		id: "nm-gallup-tic",
		name: "Gallup Visitor Information Center",
		city: "Gallup",
		state: "NM",
		lat: 35.5281,
		lng: -108.7426,
		kind: "visitor",
		hours: "Daytime",
		water: "rinse",
		address: "I-40 / US-66, Gallup, NM",
		notes: "I-40 traveler dump when posted. Call the visitor center first."
	},
	{
		id: "tx-amarillo-tic",
		name: "Amarillo Travel Information Center",
		city: "Amarillo",
		state: "TX",
		lat: 35.2211,
		lng: -101.8313,
		kind: "visitor",
		hours: "Daytime",
		water: "rinse",
		address: "I-40, Amarillo, TX",
		notes: "TxDOT traveler centers often have a no-fee dump. Confirm hours."
	},
	{
		id: "tx-gainesville-tic",
		name: "Gainesville Travel Information Center",
		city: "Gainesville",
		state: "TX",
		lat: 33.6259,
		lng: -97.1417,
		kind: "visitor",
		hours: "Daytime",
		water: "rinse",
		address: "I-35, Gainesville, TX",
		notes: "North Texas I-35 dump at the state welcome center."
	},
	{
		id: "az-flagstaff-ra",
		name: "Parks Rest Area · I-40",
		city: "Parks",
		state: "AZ",
		lat: 35.2606,
		lng: -111.9488,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-40 west of Flagstaff, AZ",
		notes: "High-country dump west of Flagstaff. Cold nights in shoulder season."
	},
	{
		id: "ca-buttonwillow",
		name: "Buttonwillow Rest Area · I-5",
		city: "Buttonwillow",
		state: "CA",
		lat: 35.4005,
		lng: -119.4696,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-5, Buttonwillow, CA",
		notes: "Central Valley I-5 stop. Confirm the sanitary stall is open."
	},
	{
		id: "ca-westley",
		name: "Westley Rest Area · I-5",
		city: "Westley",
		state: "CA",
		lat: 37.5496,
		lng: -121.2014,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-5, Westley, CA",
		notes: "Between Tracy and Patterson. Handy for Bay–Valley runs."
	},
	{
		id: "nv-winnemucca",
		name: "Winnemucca Rest Area · I-80",
		city: "Winnemucca",
		state: "NV",
		lat: 40.973,
		lng: -117.7357,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-80, Winnemucca, NV",
		notes: "I-80 basin dump. Bring gloves — desert grit on fittings."
	},
	{
		id: "ut-green-river",
		name: "Green River Rest Area · I-70",
		city: "Green River",
		state: "UT",
		lat: 38.9952,
		lng: -110.1618,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-70, Green River, UT",
		notes: "Moab / I-70 connector. Good before desert stretches."
	},
	{
		id: "id-twin-falls",
		name: "Twin Falls Visitor Center Dump",
		city: "Twin Falls",
		state: "ID",
		lat: 42.5558,
		lng: -114.4701,
		kind: "visitor",
		hours: "Daytime",
		water: "rinse",
		address: "US-93 / I-84 area, Twin Falls, ID",
		notes: "Snake River corridor. Confirm posted public hours."
	},
	{
		id: "wa-ryegrass",
		name: "Ryegrass Rest Area · I-90",
		city: "Vantage",
		state: "WA",
		lat: 46.9456,
		lng: -119.9864,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-90 near Vantage, WA",
		notes: "Columbia Basin dump. Wind advisory on the gorge approach."
	},
	{
		id: "mt-bozeman",
		name: "Bozeman Rest Area · I-90",
		city: "Bozeman",
		state: "MT",
		lat: 45.6797,
		lng: -111.0378,
		kind: "rest-area",
		hours: "Seasonal",
		water: "rinse",
		address: "I-90, Bozeman, MT",
		notes: "Yellowstone staging dump. Winter freeze-ups happen."
	},
	{
		id: "wy-rock-springs",
		name: "Rock Springs Rest Area · I-80",
		city: "Rock Springs",
		state: "WY",
		lat: 41.5875,
		lng: -109.2029,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-80, Rock Springs, WY",
		notes: "Southwest Wyoming corridor dump."
	},
	{
		id: "co-limon",
		name: "Limon Rest Area · I-70",
		city: "Limon",
		state: "CO",
		lat: 39.2639,
		lng: -103.6922,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-70, Limon, CO",
		notes: "Eastern plains dump between Denver and Kansas."
	},
	{
		id: "nm-lordsburg",
		name: "Lordsburg Rest Area · I-10",
		city: "Lordsburg",
		state: "NM",
		lat: 32.3504,
		lng: -108.7087,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-10, Lordsburg, NM",
		notes: "Southwest I-10 dump. Hot-weather hose caution."
	},
	{
		id: "tx-van-horn",
		name: "Van Horn Rest Area · I-10",
		city: "Van Horn",
		state: "TX",
		lat: 31.0399,
		lng: -104.8308,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-10, Van Horn, TX",
		notes: "West Texas long-haul dump. Confirm stall is not closed for repair."
	},
	{
		id: "az-kingman",
		name: "Kingman Rest Area · I-40",
		city: "Kingman",
		state: "AZ",
		lat: 35.1894,
		lng: -114.053,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-40, Kingman, AZ",
		notes: "Route 66 / I-40 dump west of Flagstaff."
	},
	{
		id: "nv-elko",
		name: "Elko Rest Area · I-80",
		city: "Elko",
		state: "NV",
		lat: 40.8324,
		lng: -115.7631,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-80, Elko, NV",
		notes: "Northeast Nevada basin dump."
	},
	{
		id: "ca-wheeler-ridge",
		name: "Wheeler Ridge Rest Area · I-5",
		city: "Lebec",
		state: "CA",
		lat: 34.9916,
		lng: -118.9498,
		kind: "rest-area",
		hours: "24 / 7",
		water: "rinse",
		address: "I-5 Grapevine, CA",
		notes: "South of the Grapevine. Good before LA basin traffic."
	}
];
function haversineMiles(a, b) {
	const R = 3958.8;
	const dLat = (b.lat - a.lat) * Math.PI / 180;
	const dLng = (b.lng - a.lng) * Math.PI / 180;
	const lat1 = a.lat * Math.PI / 180;
	const lat2 = b.lat * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function mapsUrl(d) {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.lat},${d.lng}`)}`;
}
function filterDumpStations(stations, opts) {
	const q = (opts.query || "").trim().toLowerCase();
	const state = opts.state || null;
	let list = stations.filter((s) => {
		if (state && s.state !== state) return false;
		if (!q) return true;
		return `${s.name} ${s.city} ${s.state} ${s.address} ${s.kind}`.toLowerCase().includes(q);
	});
	if (opts.near) {
		const near = opts.near;
		list = list.map((s) => ({
			...s,
			miles: haversineMiles(near, s)
		})).sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0));
	} else list = [...list].sort((a, b) => a.state === b.state ? a.city.localeCompare(b.city) : a.state.localeCompare(b.state));
	return list;
}
function project(lat, lng, z) {
	const n = 2 ** z;
	const x = (lng + 180) / 360 * n;
	const s = Math.sin(lat * Math.PI / 180);
	return {
		x,
		y: (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n
	};
}
function fitZoom(pts, w, h) {
	for (let z = 10; z >= 3; z--) {
		const xs = pts.map((p) => project(p.lat, p.lng, z).x);
		const ys = pts.map((p) => project(p.lat, p.lng, z).y);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		const spanX = Math.max(.08, maxX - minX) * 1.24;
		const spanY = Math.max(.08, maxY - minY) * 1.24;
		if (spanX * 256 <= w && spanY * 256 <= h) {
			const cx = (minX + maxX) / 2;
			const cy = (minY + maxY) / 2;
			return {
				z,
				minX: cx - w / 2 / 256,
				minY: cy - h / 2 / 256
			};
		}
	}
	const z = 3;
	const xs = pts.map((p) => project(p.lat, p.lng, z).x);
	const ys = pts.map((p) => project(p.lat, p.lng, z).y);
	const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
	const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
	return {
		z,
		minX: cx - w / 2 / 256,
		minY: cy - h / 2 / 256
	};
}
function DumpMap({ stations, selectedId, onSelect, youAreHere }) {
	const wrapRef = (0, import_react.useRef)(null);
	const [w, setW] = (0, import_react.useState)(320);
	const h = 220;
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const apply = () => setW(Math.max(240, el.clientWidth));
		apply();
		const ro = new ResizeObserver(apply);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	const view = (0, import_react.useMemo)(() => {
		if (!stations.length) return null;
		return fitZoom(stations, w, h);
	}, [stations, w]);
	const tiles = (0, import_react.useMemo)(() => {
		if (!view) return [];
		const { z, minX, minY } = view;
		const maxX = minX + w / 256;
		const maxY = minY + h / 256;
		const x0 = Math.floor(minX);
		const y0 = Math.floor(minY);
		const x1 = Math.floor(maxX);
		const y1 = Math.floor(maxY);
		const n = 2 ** z;
		const out = [];
		for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
			const tx = (x % n + n) % n;
			if (y < 0 || y >= n) continue;
			out.push({
				key: `${z}-${tx}-${y}`,
				left: (x - minX) * 256,
				top: (y - minY) * 256,
				src: `https://tile.openstreetmap.org/${z}/${tx}/${y}.png`
			});
		}
		return out;
	}, [view, w]);
	const pins = (0, import_react.useMemo)(() => {
		if (!view) return [];
		const { z, minX, minY } = view;
		return stations.map((s) => {
			const p = project(s.lat, s.lng, z);
			return {
				...s,
				left: (p.x - minX) * 256,
				top: (p.y - minY) * 256
			};
		});
	}, [stations, view]);
	const here = (0, import_react.useMemo)(() => {
		if (!youAreHere || !view) return null;
		const p = project(youAreHere.lat, youAreHere.lng, view.z);
		return {
			left: (p.x - view.minX) * 256,
			top: (p.y - view.minY) * 256
		};
	}, [youAreHere, view]);
	if (!stations.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[220px] items-center justify-center rounded-2xl border border-white/15 bg-black/40 text-[13px] text-white",
		children: "No dumps to plot"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative overflow-hidden rounded-2xl border border-white/15 bg-[#0b1a12]",
		style: { height: h },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				children: tiles.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: t.src,
					alt: "",
					draggable: false,
					className: "pointer-events-none absolute size-[256px] max-w-none",
					style: {
						left: t.left,
						top: t.top
					}
				}, t.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" }),
			here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute z-[2] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_12px_rgba(80,160,255,0.9)]",
				style: {
					left: here.left,
					top: here.top
				},
				title: "You"
			}) : null,
			pins.map((p) => {
				const on = p.id === selectedId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `${p.name}${p.city ? ` · ${p.city}, ${p.state}` : ""}`,
					onClick: () => onSelect?.(p.id),
					className: cn("absolute z-[3] -translate-x-1/2 -translate-y-full rounded-full border text-[10px] font-bold shadow-lg", on ? "border-white bg-sky-500 px-1.5 py-1 text-white" : "size-3.5 border-white/90 bg-sky-300 hover:scale-125"),
					style: {
						left: p.left,
						top: p.top
					},
					children: on ? "●" : null
				}, p.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-1 right-2 z-[4] text-[9px] font-medium text-white/80",
				children: "© OpenStreetMap"
			})
		]
	});
}
var SUB_TABS = [
	{
		id: "navigate",
		label: "Navigate",
		icon: Navigation
	},
	{
		id: "directions",
		label: "Directions",
		icon: ListChecks
	},
	{
		id: "campgrounds",
		label: "Campgrounds",
		icon: Tent
	},
	{
		id: "dumps",
		label: "Dumps",
		icon: Droplets
	},
	{
		id: "pack",
		label: "Pack List",
		icon: ListChecks
	},
	{
		id: "profile",
		label: "Profile",
		icon: User
	}
];
function readDevicePosition() {
	return new Promise((resolve, reject) => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			reject(/* @__PURE__ */ new Error("Location is not available on this device."));
			return;
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: true,
			timeout: 15e3,
			maximumAge: 6e4
		});
	});
}
function geoErrorMessage(err) {
	if (err && typeof err === "object" && "code" in err) {
		const code = Number(err.code);
		if (code === 1) return "Location permission denied — allow location, or type your address.";
		if (code === 2) return "Location unavailable — check GPS/signal, or type your address.";
		if (code === 3) return "Location timed out — try again, or type your address.";
	}
	if (err instanceof Error && err.message) return err.message;
	return "Could not get current location — type your address instead.";
}
function RvTripsApp() {
	const [sub, setSub] = (0, import_react.useState)("navigate");
	const [pack, setPack] = (0, import_react.useState)(DEMO_PACK);
	const [navArmed, setNavArmed] = (0, import_react.useState)(false);
	const [navStepIdx, setNavStepIdx] = (0, import_react.useState)(0);
	const [year, setYear] = (0, import_react.useState)("");
	const [make, setMake] = (0, import_react.useState)("");
	const [model, setModel] = (0, import_react.useState)("");
	const [floorplan, setFloorplan] = (0, import_react.useState)("");
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(EMPTY_COACH_PROFILE);
	const [locked, setLocked] = (0, import_react.useState)(null);
	const [originText, setOriginText] = (0, import_react.useState)("");
	const [destText, setDestText] = (0, import_react.useState)("");
	const [originPlace, setOriginPlace] = (0, import_react.useState)(null);
	const [destPlace, setDestPlace] = (0, import_react.useState)(null);
	const [geoHits, setGeoHits] = (0, import_react.useState)([]);
	const [geoFor, setGeoFor] = (0, import_react.useState)(null);
	const [geoLoading, setGeoLoading] = (0, import_react.useState)(false);
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [locateError, setLocateError] = (0, import_react.useState)(null);
	const [route, setRoute] = (0, import_react.useState)(DEMO_ROUTE);
	const [osrm, setOsrm] = (0, import_react.useState)(null);
	const [routeStatus, setRouteStatus] = (0, import_react.useState)("idle");
	const [routeError, setRouteError] = (0, import_react.useState)(null);
	const [routeKey, setRouteKey] = (0, import_react.useState)(0);
	const [saferBusy, setSaferBusy] = (0, import_react.useState)(false);
	const [saferNote, setSaferNote] = (0, import_react.useState)(null);
	const [dumpQuery, setDumpQuery] = (0, import_react.useState)("");
	const [dumpState, setDumpState] = (0, import_react.useState)(null);
	const [dumpFocusId, setDumpFocusId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const saved = loadLockedProfile();
		if (saved) {
			setLocked(saved);
			setYear(saved.year);
			setMake(saved.make);
			setModel(saved.model);
			setFloorplan(saved.floorplan);
			setDraft(saved);
		}
	}, []);
	const makes = (0, import_react.useMemo)(() => getMakesForYear(year), [year]);
	const models = (0, import_react.useMemo)(() => year && make ? getModelsForYearMake(year, make) : [], [year, make]);
	const floorplans = (0, import_react.useMemo)(() => year && make && model ? getFloorplansForYear(year, make, model) : [], [
		year,
		make,
		model
	]);
	(0, import_react.useEffect)(() => {
		if (!year || !make || !model || !floorplan) {
			setDraft((prev) => ({
				...EMPTY_COACH_PROFILE,
				year,
				make,
				model,
				floorplan,
				heightFt: floorplan ? prev.heightFt : 0,
				lengthFt: floorplan ? prev.lengthFt : 0,
				widthFt: floorplan ? prev.widthFt : 0,
				weightLbs: floorplan ? prev.weightLbs : 0
			}));
			return;
		}
		const suggested = suggestCoachFromSelection({
			year,
			make,
			model,
			floorplan
		});
		setDraft((prev) => {
			if (prev.year === year && prev.make === make && prev.model === model && prev.floorplan === floorplan && prev.lengthFt > 0) return {
				...prev,
				type: suggested.type,
				engine: suggested.engine,
				fuelType: suggested.fuelType
			};
			return {
				...suggested,
				locked: false
			};
		});
	}, [
		year,
		make,
		model,
		floorplan
	]);
	const restriction = (0, import_react.useMemo)(() => analyzeRouteRestrictions({
		coach: locked,
		route: osrm,
		hasRoute: Boolean(originPlace && destPlace && osrm),
		destLabel: destPlace?.label || route.destination.label,
		originLabel: originPlace?.label || route.origin.label
	}), [
		locked,
		osrm,
		originPlace,
		destPlace,
		route.destination.label,
		route.origin.label
	]);
	const alerts = restriction.alerts;
	const coachLine = (0, import_react.useMemo)(() => {
		if (!locked) return "Profile tab · year · make · model · floorplan";
		const y = locked.year ? `${locked.year} ` : "";
		const fp = locked.floorplan ? ` · ${locked.floorplan}` : "";
		return `${y}${locked.make} ${locked.model}${fp} · ${locked.heightFt}′H · ${locked.lengthFt}′L`;
	}, [locked]);
	const speakNav = (0, import_react.useCallback)((text) => {
		try {
			if (typeof window === "undefined" || !window.speechSynthesis) return;
			window.speechSynthesis.cancel();
			const u = new SpeechSynthesisUtterance(text);
			u.rate = 1;
			window.speechSynthesis.speak(u);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			try {
				window.speechSynthesis?.cancel();
			} catch {}
		};
	}, []);
	const runRoute = (0, import_react.useCallback)((from, to, destLabel, originLabel) => {
		const ctrl = new AbortController();
		setRouteStatus("loading");
		setRouteError(null);
		setNavArmed(false);
		setNavStepIdx(0);
		fetchOsrmRoute({
			from,
			to,
			signal: ctrl.signal
		}).then((data) => {
			setOsrm(data);
			setRoute({
				...DEMO_ROUTE,
				id: `route-${Date.now()}`,
				origin: {
					id: "origin",
					label: originLabel
				},
				destination: {
					id: "dest",
					label: destLabel,
					subtitle: data.engine
				},
				miles: data.miles,
				driveHours: data.driveHours,
				driveMinutes: data.driveMinutes,
				engine: data.engine,
				alertCount: 0
			});
			setRouteStatus("live");
		}).catch((e) => {
			if (ctrl.signal.aborted) return;
			setOsrm(null);
			setRouteStatus("offline");
			setRouteError(e instanceof Error ? e.message : "Routing unavailable");
		});
		return () => ctrl.abort();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!originPlace || !destPlace) return;
		return runRoute({
			lng: originPlace.lng,
			lat: originPlace.lat
		}, {
			lng: destPlace.lng,
			lat: destPlace.lat
		}, destPlace.label, originPlace.label);
	}, [
		originPlace,
		destPlace,
		routeKey,
		runRoute
	]);
	const liveDirections = (0, import_react.useMemo)(() => {
		if (!osrm?.steps?.length) return null;
		const steps = osrm.steps.filter((s) => {
			if (s.maneuver === "depart" || s.maneuver === "arrive") return true;
			if (s.distanceM >= 250) return true;
			if (/turn|ramp|merge|fork|exit|roundabout|end of road|new name/i.test(`${s.maneuver} ${s.instruction}`)) return true;
			return Boolean(s.name && s.distanceM >= 80);
		}).map((s, i) => ({
			id: `osrm-${i}`,
			instruction: s.instruction || (s.name ? `Continue on ${s.name}` : "Continue"),
			mi: (Math.round(s.distanceM / 1609.344 * 10) / 10).toFixed(s.distanceM >= 1609 ? 0 : 1),
			maneuver: s.maneuver
		}));
		return steps.length ? steps : null;
	}, [osrm]);
	(0, import_react.useEffect)(() => {
		if (!navArmed || !liveDirections?.length) return;
		const step = liveDirections[Math.min(navStepIdx, liveDirections.length - 1)];
		if (!step) return;
		const line = navStepIdx === 0 ? `Navigation started. ${step.instruction}. ${step.mi} miles.` : `${step.instruction}. ${step.mi} miles.`;
		speakNav(line);
	}, [
		navArmed,
		navStepIdx,
		liveDirections,
		speakNav
	]);
	const searchPlace = async (q, which) => {
		setGeoFor(which);
		setGeoLoading(true);
		setLocateError(null);
		try {
			const json = await (await fetch(`/api/geocode?q=${encodeURIComponent(q.trim() || " ")}`)).json();
			setGeoHits(json.hits || []);
		} catch {
			setGeoHits([]);
		} finally {
			setGeoLoading(false);
		}
	};
	const pickPlace = (hit) => {
		if (geoFor === "origin") {
			setOriginPlace(hit);
			setOriginText(hit.label);
		} else if (geoFor === "dest") {
			setDestPlace(hit);
			setDestText(hit.label);
		}
		setGeoHits([]);
		setGeoFor(null);
		setLocateError(null);
		setNavArmed(false);
		setNavStepIdx(0);
	};
	const useCurrentLocation = (0, import_react.useCallback)(async () => {
		setLocateError(null);
		setLocating(true);
		setGeoHits([]);
		setGeoFor(null);
		try {
			const { latitude: lat, longitude: lng } = (await readDevicePosition()).coords;
			if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Invalid coordinates from device.");
			let label = "Current location";
			try {
				const json = await (await fetch(`/api/geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`)).json();
				if (json.hits?.[0]?.label) label = json.hits[0].label;
			} catch {}
			setOriginPlace({
				label,
				lat,
				lng,
				kind: "current"
			});
			setOriginText(label);
			setNavArmed(false);
			setNavStepIdx(0);
		} catch (err) {
			setLocateError(geoErrorMessage(err));
		} finally {
			setLocating(false);
		}
	}, []);
	const geocodeAndRoute = async () => {
		setRouteError(null);
		setLocateError(null);
		let o = originPlace;
		let d = destPlace;
		if (!o && originText.trim()) {
			o = (await (await fetch(`/api/geocode?q=${encodeURIComponent(originText.trim())}`)).json()).hits?.[0] || null;
			if (o) {
				setOriginPlace(o);
				setOriginText(o.label);
			}
		}
		if (!d && destText.trim()) {
			d = (await (await fetch(`/api/geocode?q=${encodeURIComponent(destText.trim())}`)).json()).hits?.[0] || null;
			if (d) {
				setDestPlace(d);
				setDestText(d.label);
			}
		}
		if (o && d) setRouteKey((k) => k + 1);
		else setRouteError("Could not find that address — try a city name (e.g. Seattle, WA)");
	};
	const lockProfile = () => {
		if (!profileIsComplete(draft)) return;
		const next = {
			...draft,
			locked: true
		};
		setLocked(next);
		saveLockedProfile(next);
	};
	const unlockProfile = () => {
		setLocked(null);
		clearLockedProfile();
	};
	const applySaferRoute = async () => {
		if (!originPlace || !destPlace || !locked) return;
		setSaferBusy(true);
		setSaferNote(null);
		try {
			const safer = saferOsrmParams(locked);
			const data = await fetchOsrmRoute({
				from: {
					lng: originPlace.lng,
					lat: originPlace.lat
				},
				to: {
					lng: destPlace.lng,
					lat: destPlace.lat
				},
				weight: safer.weight,
				exclude: safer.exclude,
				bypassCache: true
			});
			setOsrm(data);
			setRoute({
				...DEMO_ROUTE,
				id: `safer-${Date.now()}`,
				origin: {
					id: "origin",
					label: originPlace.label
				},
				destination: {
					id: "dest",
					label: destPlace.label,
					subtitle: "Safer RV route"
				},
				miles: data.miles,
				driveHours: data.driveHours,
				driveMinutes: data.driveMinutes,
				engine: `${data.engine} · safer`,
				alertCount: 0
			});
			setRouteStatus("live");
			setSaferNote("Applied highway-preferring RV route. Re-check warnings below.");
			setNavStepIdx(0);
		} catch (e) {
			setSaferNote(e instanceof Error ? e.message : "Could not compute safer route");
		} finally {
			setSaferBusy(false);
		}
	};
	const packDone = pack.filter((p) => p.done).length;
	const dumpNearLat = originPlace?.lat ?? destPlace?.lat ?? null;
	const dumpNearLng = originPlace?.lng ?? destPlace?.lng ?? null;
	const dumpList = (0, import_react.useMemo)(() => filterDumpStations(FREE_DUMP_STATIONS, {
		query: dumpQuery,
		state: dumpState,
		near: dumpNearLat != null && dumpNearLng != null ? {
			lat: dumpNearLat,
			lng: dumpNearLng
		} : null
	}), [
		dumpQuery,
		dumpState,
		dumpNearLat,
		dumpNearLng
	]);
	const routeToDump = (d) => {
		const hit = {
			label: `${d.name} · ${d.city}, ${d.state}`,
			lat: d.lat,
			lng: d.lng,
			kind: "dump"
		};
		setDestPlace(hit);
		setDestText(hit.label);
		setGeoHits([]);
		setGeoFor(null);
		setNavArmed(false);
		setNavStepIdx(0);
		setSub("navigate");
		if (originPlace) setRouteKey((k) => k + 1);
	};
	const hasRoutePoints = Boolean(originPlace && destPlace);
	const canLock = profileIsComplete(draft) && !locked;
	const dimsReady = Boolean(floorplan && draft.lengthFt > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-col overflow-hidden bg-bg text-white",
		"data-no-swipe-scroll": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: RVTRIPS_AMERICA_BACKDROP,
					alt: "",
					className: "absolute inset-0 size-full scale-110 object-cover object-[center_42%] brightness-110 contrast-105 saturate-115"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { background: "linear-gradient(180deg, rgba(2,10,28,0.72) 0%, rgba(4,14,36,0.45) 28%, rgba(6,18,40,0.35) 55%, rgba(2,8,22,0.78) 100%)" }
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-app-scroll": true,
				className: "rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "px-3 pb-2 pt-2 sm:px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/assets/brand/icon-rvtrips.png",
								alt: "",
								className: "size-10 object-contain drop-shadow-md"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-[22px] font-bold tracking-tight text-white",
								children: "RvTrips"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-white",
								children: coachLine
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide", locked ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" : "border-amber/40 bg-amber/15 text-amber"),
								children: [locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-3" }), locked ? "PROFILE LOCKED" : "SET PROFILE"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[9px] font-bold uppercase tracking-wide text-blue",
								children: routeStatus === "live" ? "OSRM live" : routeStatus === "loading" ? "Routing…" : routeStatus === "offline" ? "Route offline" : hasRoutePoints ? "Ready" : "Enter route"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-1 overflow-x-auto rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-xl",
						style: { scrollbarWidth: "none" },
						role: "tablist",
						children: SUB_TABS.map((t) => {
							const Icon = t.icon;
							const active = sub === t.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": active,
								onClick: () => setSub(t.id),
								className: cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition", active ? "bg-blue text-white shadow-[0_0_16px_rgba(80,160,255,0.4)]" : "text-white hover:bg-white/10"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), t.label]
							}, t.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto w-full max-w-lg space-y-3 px-3 pb-16 pt-2 sm:px-4",
					children: [
						sub === "profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige space-y-3 rounded-[1.25rem] p-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[12px] font-bold tracking-[0.14em] text-white",
									children: "RV PROFILE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] text-white",
									children: "Year → make → model → floorplan, then adjust length/weight and lock for map alerts."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBtn, {
											label: "Year",
											value: year || "Select",
											onClick: () => setSheet("year")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBtn, {
											label: "Make",
											value: make || "Select",
											disabled: !year,
											onClick: () => setSheet("make")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBtn, {
											label: "Model",
											value: model || "Select",
											disabled: !make,
											onClick: () => setSheet("model")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBtn, {
											label: "Floorplan",
											value: floorplan || "Select",
											disabled: !model,
											onClick: () => setSheet("floorplan")
										})
									]
								}),
								dimsReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [
										["heightFt", "Height (ft)"],
										["lengthFt", "Length (ft)"],
										["widthFt", "Width (ft)"],
										["weightLbs", "Weight (lbs)"]
									].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block text-[10px] font-bold text-white",
											children: label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: draft[key] || "",
											onChange: (e) => setDraft((d) => ({
												...d,
												[key]: Number(e.target.value) || 0
											})),
											className: "glass-field w-full rounded-xl px-3 py-2 text-[14px] font-semibold text-white outline-none"
										})]
									}, key))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] text-white",
									children: "Pick floorplan to unlock dimension fields."
								}),
								locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: unlockProfile,
									className: "flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-[14px] font-bold text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4" }), "Unlock to edit"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !canLock,
									onClick: lockProfile,
									className: "flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-[14px] font-bold text-black disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Lock profile for map"]
								})
							]
						}) : null,
						sub === "navigate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							!locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSub("profile"),
								className: "glass-prestige flex w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-3 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-5 text-amber" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[13px] font-bold text-white",
											children: "Set your RV profile first"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-white",
											children: "Optional for routing — required for height/length alerts"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5 text-white" })
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass-prestige flex items-center gap-3 rounded-[1.15rem] px-3.5 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-emerald-300" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[13px] font-bold text-white",
											children: [
												locked.year,
												" ",
												locked.make,
												" ",
												locked.model,
												locked.floorplan ? ` · ${locked.floorplan}` : ""
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-white",
											children: [
												locked.heightFt,
												"′ H · ",
												locked.lengthFt,
												"′ L ·",
												" ",
												locked.widthFt,
												"′ W ·",
												" ",
												locked.weightLbs.toLocaleString(),
												" lbs"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSub("profile"),
										className: "text-[11px] font-bold text-blue",
										children: "Edit"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-prestige space-y-2.5 rounded-[1.25rem] p-3.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-blue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-[12px] font-bold tracking-[0.14em] text-white",
											children: "ROUTE"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "block",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-1 flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-bold tracking-[0.12em] text-white",
													children: "STARTING FROM"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => void useCurrentLocation(),
													disabled: locating,
													className: cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition", locating ? "border-sky-300/40 bg-sky-500/20 text-sky-100" : originPlace?.kind === "current" ? "border-emerald-400/45 bg-emerald-500/20 text-emerald-100" : "border-white/20 bg-black/35 text-white/90 hover:border-sky-300/40 hover:bg-sky-500/15"),
													"aria-label": "Use current location as starting point",
													children: [locating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-3" }), locating ? "Locating…" : "Current location"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: originText,
													onChange: (e) => {
														setOriginText(e.target.value);
														setOriginPlace(null);
														setLocateError(null);
													},
													placeholder: "City, address, or use current location",
													className: "glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/70",
													autoComplete: "street-address"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => void searchPlace(originText, "origin"),
													className: "flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue text-white",
													"aria-label": "Search origin",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" })
												})]
											}),
											locateError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1.5 text-[11px] leading-snug text-amber",
												children: locateError
											}) : originPlace?.kind === "current" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1.5 text-[11px] leading-snug text-emerald-200/90",
												children: "Using your current location for the start of the route."
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block text-[10px] font-bold tracking-[0.12em] text-white",
											children: "DESTINATION"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: destText,
												onChange: (e) => {
													setDestText(e.target.value);
													setDestPlace(null);
												},
												placeholder: "City, park, or address",
												className: "glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/70"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => void searchPlace(destText, "dest"),
												className: "flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue text-white",
												"aria-label": "Search destination",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" })
											})]
										})]
									}),
									geoFor && (geoLoading || geoHits.length > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/15 bg-black/50 p-1.5",
										children: geoLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "px-2 py-2 text-[12px] text-white",
											children: "Searching…"
										}) : geoHits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => pickPlace(h),
											className: "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-3.5 shrink-0 text-blue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13px] font-medium leading-snug text-white",
												children: h.label
											})]
										}, `${h.lat},${h.lng},${h.label}`))
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [
											"Seattle, WA",
											"Portland, OR",
											"Glacier National Park, MT",
											"Yellowstone National Park, WY",
											"Quartzsite, AZ"
										].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setDestText(label);
												searchPlace(label, "dest");
											},
											className: "rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white",
											children: label.split(",")[0]
										}, label))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: !originText.trim() || !destText.trim(),
										onClick: () => void geocodeAndRoute(),
										className: "flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-3 py-3 text-[14px] font-bold text-white disabled:opacity-40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4" }), "Calculate RV Route"]
									}),
									routeError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[12px] text-amber",
										children: routeError
									}) : null
								]
							}),
							(hasRoutePoints || routeStatus === "live") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "relative aspect-[4/3.2] overflow-hidden rounded-[1.35rem] border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: RVTRIPS_MAP_PANEL,
										alt: "RV route map",
										className: "absolute inset-0 size-full object-cover object-[center_35%]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute left-2.5 right-2.5 top-2.5 flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 backdrop-blur-md",
										children: [routeStatus === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[14px] font-bold text-white",
											children: "Calculating…"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[17px] font-bold tabular-nums text-white",
												children: [formatMiles(route.miles), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-1 text-[11px] font-semibold text-white",
													children: "mi"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-white",
												children: "|"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[17px] font-bold tabular-nums text-white",
												children: [formatDrive(route.driveHours, route.driveMinutes), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-1 text-[11px] font-semibold text-white",
													children: "drive"
												})]
											})
										] }), alerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-amber",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }),
												alerts.length,
												" RV alerts"
											]
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute bottom-2.5 left-2.5 right-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-white/15 bg-black/55 px-2.5 py-1.5 backdrop-blur-md",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] font-semibold tracking-wide text-white",
												children: "DESTINATION"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "flex items-center gap-1 text-[13px] font-bold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-blue" }), destPlace?.label || route.destination.label]
											})]
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: routeStatus !== "live" || !liveDirections?.length,
								onClick: () => {
									if (navArmed) {
										setNavArmed(false);
										setNavStepIdx(0);
										try {
											window.speechSynthesis?.cancel();
										} catch {}
										return;
									}
									setNavStepIdx(0);
									setNavArmed(true);
								},
								className: cn("flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[16px] font-bold transition disabled:opacity-40", navArmed ? "border border-ruby/80 bg-ruby text-white shadow-[0_0_28px_rgba(212,37,53,0.55)]" : "bg-blue text-white shadow-[0_0_28px_rgba(80,160,255,0.4)]"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-5" }), navArmed ? "Stop navigation" : routeStatus === "live" && liveDirections?.length ? "Start Turn-by-Turn" : routeStatus === "loading" ? "Calculating…" : "Calculate a route first"]
							}),
							navArmed && liveDirections && liveDirections.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-prestige space-y-3 rounded-[1.25rem] border border-emerald-400/35 p-3.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[10px] font-bold tracking-[0.16em] text-emerald-300",
											children: [
												"GUIDANCE · STEP ",
												navStepIdx + 1,
												" / ",
												liveDirections.length
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold text-white",
											children: [liveDirections[navStepIdx]?.mi, " mi"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[18px] font-bold leading-snug text-white",
										children: liveDirections[navStepIdx]?.instruction
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: navStepIdx <= 0,
												onClick: () => setNavStepIdx((i) => Math.max(0, i - 1)),
												className: "flex-1 rounded-xl border border-white/20 bg-black/40 py-2.5 text-[13px] font-bold text-white disabled:opacity-40",
												children: "Prev"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => speakNav(liveDirections[navStepIdx]?.instruction || "Continue"),
												className: "flex-1 rounded-xl border border-blue/40 bg-blue/25 py-2.5 text-[13px] font-bold text-white",
												children: "Repeat"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: navStepIdx >= liveDirections.length - 1,
												onClick: () => setNavStepIdx((i) => Math.min(liveDirections.length - 1, i + 1)),
												className: "flex-1 rounded-xl bg-emerald-500 py-2.5 text-[13px] font-bold text-black disabled:opacity-40",
												children: "Next"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-white",
										children: "Speaks each step on your phone. Use Next as you drive."
									})
								]
							}) : null,
							routeStatus === "live" && liveDirections && liveDirections.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-prestige space-y-2 rounded-[1.25rem] p-3.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-[12px] font-bold tracking-[0.12em] text-white",
										children: "TURN-BY-TURN"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-semibold text-blue",
										children: [
											liveDirections.length,
											" steps · ",
											formatMiles(route.miles),
											" ",
											"mi"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-h-72 space-y-1.5 overflow-y-auto",
									children: liveDirections.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setNavStepIdx(i);
											if (navArmed) speakNav(d.instruction);
										},
										className: cn("flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left", navArmed && i === navStepIdx ? "border-emerald-400/50 bg-emerald-500/15" : "border-white/12 bg-black/30"),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-blue/25 text-[12px] font-bold text-blue",
												children: i + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white",
												children: d.instruction
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0 text-[12px] font-bold tabular-nums text-white",
												children: [d.mi, " mi"]
											})
										]
									}, d.id))
								})]
							}) : routeStatus === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white",
								children: "Building RV-aware route…"
							}) : !hasRoutePoints ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white",
								children: [
									"Enter start + destination, then",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold",
										children: "Calculate RV Route"
									}),
									" for miles, time, and spoken turn-by-turn."
								]
							}) : null,
							locked && originPlace && destPlace && osrm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-white",
										children: restriction.summary || "No route-specific restrictions for this locked profile."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertsBlock, { alerts }),
									restriction.canSuggestSafer || alerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: saferBusy,
										onClick: () => void applySaferRoute(),
										className: "flex w-full items-center justify-center gap-2 rounded-xl border border-blue/40 bg-blue/20 py-3 text-[13px] font-bold text-white disabled:opacity-50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4" }), saferBusy ? "Finding safer RV route…" : "Reroute to safer RV path"]
									}) : null,
									saferNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-white",
										children: saferNote
									}) : null
								]
							}) : null
						] }) : null,
						sub === "directions" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige space-y-2 rounded-[1.25rem] p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[13px] font-bold tracking-[0.12em] text-white",
								children: "RV-AWARE DIRECTIONS"
							}), routeStatus !== "live" || !liveDirections?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-white",
								children: "Calculate a route on Navigate to fill this list with live OSRM steps."
							}) : liveDirections.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-blue/25 text-[12px] font-bold text-blue",
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white",
										children: d.instruction
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "shrink-0 text-[12px] font-bold tabular-nums text-white",
										children: [d.mi, " mi"]
									})
								]
							}, d.id))]
						}) : null,
						sub === "campgrounds" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, { className: "size-3.5 text-emerald-400" }), "CAMPGROUNDS"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] text-white",
									children: "Sample pads near popular corridors — filter by your locked length when set."
								}),
								DEMO_CAMPS.filter((c) => !locked || c.maxLengthFt >= locked.lengthFt).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "glass-prestige flex items-start gap-3 rounded-[1.15rem] p-3.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, { className: "mt-0.5 size-5 text-emerald-400" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[14px] font-bold text-white",
												children: c.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-white",
												children: [
													"~",
													c.miFromMidpoint,
													" mi · max ",
													c.maxLengthFt,
													" ft",
													c.hasHookups ? " · hookups" : " · dry"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: c.campspotUrl,
											target: "_blank",
											rel: "noreferrer",
											className: "text-blue",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
										})
									]
								}, c.id))
							]
						}) : null,
						sub === "dumps" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-3.5 text-sky-300" }), "FREE SEWER DUMPS"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[12px] leading-relaxed text-white/90",
									children: ["Public and no-fee sanitary dumps on major western corridors. Hours change — confirm before you pull in.", dumpNearLat != null ? " Sorted by distance from your start or destination." : " Set a start location on Navigate to sort by distance."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: dumpQuery,
										onChange: (e) => setDumpQuery(e.target.value),
										placeholder: "Search city, highway, or name",
										className: "glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/60",
										"aria-label": "Search dump stations"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void useCurrentLocation(),
										disabled: locating,
										className: "flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/35 text-white",
										"aria-label": "Use current location to sort dumps",
										children: locating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1.5 overflow-x-auto pb-0.5",
									style: { scrollbarWidth: "none" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDumpState(null),
										className: cn("shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold", !dumpState ? "border-sky-300/50 bg-sky-500/25 text-white" : "border-white/20 bg-black/30 text-white/85"),
										children: "All"
									}), DUMP_STATES.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDumpState((cur) => cur === st ? null : st),
										className: cn("shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold", dumpState === st ? "border-sky-300/50 bg-sky-500/25 text-white" : "border-white/20 bg-black/30 text-white/85"),
										children: st
									}, st))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] font-semibold text-white",
									children: [
										dumpList.length,
										" station",
										dumpList.length === 1 ? "" : "s"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DumpMap, {
									stations: dumpList,
									selectedId: dumpFocusId,
									onSelect: (id) => {
										setDumpFocusId(id);
										document.getElementById(`dump-${id}`)?.scrollIntoView({
											behavior: "smooth",
											block: "nearest"
										});
									},
									youAreHere: dumpNearLat != null && dumpNearLng != null ? {
										lat: dumpNearLat,
										lng: dumpNearLng
									} : null
								}),
								dumpList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white",
									children: "No dumps match that search. Try another state or city."
								}) : dumpList.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									id: `dump-${d.id}`,
									className: cn("glass-prestige space-y-2 rounded-[1.15rem] p-3.5", dumpFocusId === d.id && "ring-1 ring-sky-400/70"),
									onClick: () => setDumpFocusId(d.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "mt-0.5 size-5 shrink-0 text-sky-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[14px] font-bold leading-snug text-white",
													children: d.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-white/85",
													children: [
														d.city,
														", ",
														d.state,
														typeof d.miles === "number" ? ` · ${d.miles < 10 ? d.miles.toFixed(1) : Math.round(d.miles)} mi` : ""
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-[11px] text-white/80",
													children: [
														DUMP_KIND_LABEL[d.kind],
														" · ",
														d.hours,
														" ·",
														" ",
														d.water === "potable" ? "potable water" : d.water === "rinse" ? "rinse water" : "no water"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-[12px] leading-relaxed text-white/85",
													children: d.notes
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => routeToDump(d),
											className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue py-2.5 text-[12px] font-bold text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-3.5" }), "Route here"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: mapsUrl(d),
											target: "_blank",
											rel: "noreferrer",
											className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-black/35 py-2.5 text-[12px] font-bold text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" }), "Maps"]
										})]
									})]
								}, d.id))
							]
						}) : null,
						sub === "pack" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige space-y-2 rounded-[1.25rem] p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[13px] font-bold tracking-[0.12em] text-white",
									children: "PACK LIST"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] text-white",
									children: [
										packDone,
										"/",
										pack.length
									]
								})]
							}), pack.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPack((list) => list.map((x) => x.id === p.id ? {
									...x,
									done: !x.done
								} : x)),
								className: "flex w-full items-center gap-3 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-5 items-center justify-center rounded border text-[10px] font-bold", p.done ? "border-emerald-400 bg-emerald-500 text-black" : "border-white/30 text-transparent"),
									children: "✓"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-[13px] font-semibold text-white", p.done && "line-through opacity-60"),
									children: p.item
								})]
							}, p.id))]
						}) : null
					]
				})]
			}),
			sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: true,
				title: sheet === "year" ? "Year" : sheet === "make" ? "Make" : sheet === "model" ? "Model" : "Floorplan",
				items: (sheet === "year" ? TRIP_YEARS : sheet === "make" ? makes : sheet === "model" ? models : floorplans).map((v) => ({
					value: v,
					label: v
				})),
				selected: sheet === "year" ? year : sheet === "make" ? make : sheet === "model" ? model : floorplan,
				onSelect: (v) => {
					if (sheet === "year") {
						setYear(v);
						setMake("");
						setModel("");
						setFloorplan("");
					} else if (sheet === "make") {
						setMake(v);
						setModel("");
						setFloorplan("");
					} else if (sheet === "model") {
						setModel(v);
						setFloorplan("");
					} else setFloorplan(v);
					setSheet(null);
				},
				onClose: () => setSheet(null),
				allowCustom: true,
				customLabel: "Type your own"
			}) : null
		]
	});
}
function FieldBtn({ label, value, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled,
		onClick,
		className: "rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-left disabled:opacity-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[9px] font-bold tracking-wide text-white",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block truncate text-[13px] font-bold text-white",
			children: value
		})]
	});
}
function AlertsBlock({ alerts }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("rounded-xl border px-3 py-2.5", a.severity === "critical" ? "border-ruby/40 bg-ruby/15" : a.severity === "caution" ? "border-amber/40 bg-amber/10" : "border-white/15 bg-black/30"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold tracking-wide text-white",
					children: a.kind
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[13px] font-bold text-white",
					children: a.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12px] leading-relaxed text-white",
					children: a.body
				})
			]
		}, a.id))
	});
}
//#endregion
export { RvTripsApp };
