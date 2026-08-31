import { c as findPowertrainCorrection, d as sanitizeNarrativeForPin, l as powertrainConflictsWithPin, u as sanitizeFeaturesForPin } from "./router-Bq88JwJI.mjs";
import { i as localOverrideAsPin, n as engineConflictsWithChassis, r as findLocalSpecOverride } from "./brochureSpecs-C_RxgY8d.mjs";
import { t as Capacitor } from "../_libs/capacitor__core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exportReport-Bq4nf4G-.js
var GAS_ENGINE_RE = /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline|gas\s*v8)\b/i;
var DIESEL_ENGINE_RE = /\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter|om\d+)\b/i;
var FLAGSHIP_DIESEL_RE = /\b(isl\s*8\.?9|l9\s*450|x15|x12\s*500|1[,.]?250\s*lb|450\s*hp)\b/i;
var MID_DIESEL_RE = /\b(isb|b6\.7|340\s*hp|360\s*hp)\b/i;
/** Sibling / model-family theft patterns (live claims wrong line's engine). */
var SIBLING_RULES = [
	{
		modelIncludes: "kountry star",
		reject: GAS_ENGINE_RE,
		reason: "Kountry Star is diesel pusher — rejected gas F53/Godzilla/V10"
	},
	{
		modelIncludes: "bay star",
		reject: /\b(cummins\s*l9|isl\s*8|x15)\b/i,
		reason: "Bay Star is gas Class A — rejected flagship diesel"
	},
	{
		modelIncludes: "allegro red",
		reject: /\b(triton|v10|f-?53|godzilla|isl\s*8|l9\s*450)\b/i,
		reason: "Allegro RED is mid-diesel ISB/B6.7 — rejected V10 or ISL/L9 flagship"
	},
	{
		modelIncludes: "vision",
		reject: /\b(cummins|l9|isl|diesel\s*pusher)\b/i,
		reason: "Entegra Vision is gas F53 — rejected diesel"
	},
	{
		modelIncludes: "fr3",
		reject: /\b(cummins|diesel\s*pusher|l9|isl)\b/i,
		reason: "FR3 is gas F53 — rejected diesel"
	},
	{
		modelIncludes: "via",
		reject: /\b(cummins|isl|l9|x15|freightliner\s*xc|spartan)\b/i,
		reason: "Via is Sprinter OM642 — rejected Cummins pusher"
	},
	{
		modelIncludes: "villagio",
		reject: /\b(cummins|isl|l9|x15|freightliner\s*xc)\b/i,
		reason: "Villagio is Sprinter cowl — rejected Cummins pusher"
	}
];
function norm(s) {
	return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}
function parseHpNum(v) {
	if (v == null || v === "") return null;
	if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v);
	const m = String(v).replace(/,/g, "").match(/(\d{2,4})/);
	if (!m) return null;
	const n = parseInt(m[1], 10);
	return n > 0 ? n : null;
}
function isEmptyEngine(engine) {
	if (!engine) return true;
	const e = engine.trim();
	if (!e || e === "—" || e === "N/A") return true;
	if (/^see chassis/i.test(e)) return true;
	if (/^updating/i.test(e)) return true;
	return e.length < 3;
}
function fuelLooksDiesel(fuel, type) {
	const blob = `${fuel || ""} ${type || ""}`;
	if (/diesel/i.test(blob) && !/gas\s*\/\s*diesel|or diesel|by plan/i.test(blob)) return true;
	if (/class a diesel|diesel pusher/i.test(blob)) return true;
	return false;
}
function fuelLooksGas(fuel, type) {
	const blob = `${fuel || ""} ${type || ""}`;
	if (fuelLooksDiesel(fuel, type)) return false;
	return /\bgas\b|gasoline|class a gas/i.test(blob);
}
/**
* Validate Live hard powertrain against catalog fuel + model + pin + HP family.
* Returns rejection reasons (empty = acceptable).
*/
function validateLivePowertrain(opts) {
	const reasons = [];
	const { make, model, catalogFuelType, catalogType, catalogEngine, catalogHp, live, pin } = opts;
	const liveEngine = live.engine?.trim() || "";
	const liveHp = live.horsepower;
	const liveFuel = live.fuelType;
	if (!liveEngine && (liveHp == null || liveHp <= 0)) return reasons;
	if (pin && liveEngine && powertrainConflictsWithPin(pin, liveEngine, liveHp)) reasons.push(`Conflicts with brochure pin (${pin.engine})`);
	if (pin?.fuelType === "Diesel" && liveEngine && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) reasons.push("Pin is diesel — Live offered gas-only engine");
	if (pin?.fuelType === "Gas" && liveEngine && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) reasons.push("Pin is gas — Live offered diesel-only engine");
	if (pin && liveHp != null && liveHp > 0 && pin.horsepower > 0 && Math.abs(liveHp - pin.horsepower) >= 40) reasons.push(`HP ${liveHp} too far from pin ${pin.horsepower}`);
	const catDiesel = fuelLooksDiesel(catalogFuelType, catalogType || void 0);
	const catGas = fuelLooksGas(catalogFuelType, catalogType || void 0);
	if (catDiesel && liveEngine && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) reasons.push("Catalog fuel is diesel — rejected gas engine from Live");
	if (catGas && liveEngine && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) reasons.push("Catalog fuel is gas — rejected diesel engine from Live");
	if (liveFuel) {
		if (catDiesel && /^gas/i.test(liveFuel) && !/diesel/i.test(liveFuel)) reasons.push("Live fuelType gas conflicts with catalog diesel");
		if (catGas && /diesel/i.test(liveFuel) && !/gas/i.test(liveFuel)) reasons.push("Live fuelType diesel conflicts with catalog gas");
	}
	const md = norm(model);
	for (const rule of SIBLING_RULES) {
		if (!md.includes(rule.modelIncludes)) continue;
		if (rule.modelIncludes === "discovery" && md.includes("lxe")) continue;
		if (rule.modelIncludes === "vision" && (md.includes("xl") || md.includes("diesel"))) continue;
		if (liveEngine && rule.reject.test(liveEngine)) reasons.push(rule.reason);
	}
	const catEng = catalogEngine || "";
	if (catEng && liveEngine) {
		const catIsMid = MID_DIESEL_RE.test(catEng) && !FLAGSHIP_DIESEL_RE.test(catEng);
		const liveIsFlag = FLAGSHIP_DIESEL_RE.test(liveEngine) || liveHp != null && liveHp >= 450;
		if (catIsMid && liveIsFlag) reasons.push("Live flagship diesel conflicts with catalog mid-diesel");
		if (GAS_ENGINE_RE.test(catEng) && DIESEL_ENGINE_RE.test(liveEngine) && !GAS_ENGINE_RE.test(liveEngine)) reasons.push("Live diesel conflicts with catalog gas engine family");
		if (DIESEL_ENGINE_RE.test(catEng) && GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) reasons.push("Live gas conflicts with catalog diesel engine family");
	}
	if (liveHp != null && liveHp > 0 && liveEngine) {
		if (GAS_ENGINE_RE.test(liveEngine) && !DIESEL_ENGINE_RE.test(liveEngine)) {
			if (liveHp < 200 || liveHp > 420) reasons.push(`Gas engine HP ${liveHp} outside 200–420 range`);
		}
		if (/isb|b6\.7/i.test(liveEngine) && !/isl|l9|x15/i.test(liveEngine)) {
			if (liveHp < 250 || liveHp > 400) reasons.push(`ISB/B6.7 HP ${liveHp} outside 250–400 range`);
		}
		if (/l9|isl/i.test(liveEngine) && !/isb|b6\.7/i.test(liveEngine)) {
			if (liveHp < 350 || liveHp > 520) reasons.push(`ISL/L9 HP ${liveHp} outside 350–520 range`);
		}
		if (liveHp === 450 && (GAS_ENGINE_RE.test(liveEngine) || MID_DIESEL_RE.test(liveEngine) && !FLAGSHIP_DIESEL_RE.test(liveEngine))) reasons.push("Suspicious default 450 HP on non-flagship engine");
	}
	const catHp = parseHpNum(catalogHp);
	if (catHp != null && liveHp != null && Math.abs(liveHp - catHp) >= 80 && !pin) reasons.push(`Live HP ${liveHp} differs from catalog ${catHp} by ≥80`);
	return [...new Set(reasons)];
}
/**
* Resolve hard powertrain: pin > catalog (if present) > Live only if empty or validated.
*/
function resolveHardPowertrain(opts) {
	const local = findLocalSpecOverride(opts.year, opts.make, opts.model, opts.floorplan);
	const localPin = local ? localOverrideAsPin(local) : null;
	if (localPin && local) return {
		hard: {
			engine: local.engine || localPin.engine,
			horsepower: local.horsepower != null && local.horsepower > 0 ? local.horsepower : localPin.horsepower > 0 ? localPin.horsepower : null,
			torqueLbFt: local.torqueLbFt ?? localPin.torqueLbFt ?? null,
			chassis: local.chassis ?? localPin.chassis ?? null,
			transmission: local.transmission ?? localPin.transmission ?? null,
			fuelType: local.fuelType ?? localPin.fuelType ?? null
		},
		trust: "local",
		liveRejectedReasons: [],
		liveAccepted: false,
		pin: localPin
	};
	const pin = findPowertrainCorrection(opts.year, opts.make, opts.model, opts.floorplan);
	const catEngineRaw = opts.catalog.engine?.trim() || null;
	const catChassis = opts.catalog.chassis?.trim() || null;
	const catalogFamilyBroken = Boolean(engineConflictsWithChassis(catEngineRaw, catChassis, {
		fuelType: opts.catalog.fuelType,
		type: opts.catalog.type,
		modelEngine: catEngineRaw
	}));
	const catEngine = catalogFamilyBroken ? null : catEngineRaw;
	const catHpNum = catalogFamilyBroken ? null : parseHpNum(opts.catalog.horsepower);
	const catTrans = opts.catalog.transmission?.trim() || null;
	const catFuel = opts.catalog.fuelType?.trim() || null;
	const base = {
		engine: !isEmptyEngine(catEngine) ? catEngine : null,
		horsepower: catHpNum,
		torqueLbFt: catalogFamilyBroken ? null : (() => {
			const t = opts.catalog.torque;
			if (!t || t === "—") return null;
			const m = String(t).replace(/,/g, "").match(/(\d{2,5})/);
			return m ? parseInt(m[1], 10) : null;
		})(),
		chassis: catChassis && catChassis !== "—" ? catChassis : null,
		transmission: catTrans && catTrans !== "—" ? catTrans : null,
		fuelType: catFuel
	};
	if (pin) return {
		hard: {
			engine: pin.engine,
			horsepower: pin.horsepower > 0 ? pin.horsepower : base.horsepower,
			torqueLbFt: pin.torqueLbFt ?? base.torqueLbFt,
			chassis: pin.chassis ?? base.chassis,
			transmission: pin.transmission ?? base.transmission,
			fuelType: pin.fuelType ?? base.fuelType
		},
		trust: "pinned",
		liveRejectedReasons: [],
		liveAccepted: false,
		pin
	};
	const live = opts.live?.live ? opts.live : null;
	if (!live) return {
		hard: base,
		trust: base.engine ? "catalog" : "empty",
		liveRejectedReasons: [],
		liveAccepted: false,
		pin: null
	};
	const reject = validateLivePowertrain({
		year: opts.year,
		make: opts.make,
		model: opts.model,
		floorplan: opts.floorplan,
		catalogFuelType: catFuel,
		catalogType: opts.catalog.type,
		catalogEngine: catEngine,
		catalogHp: catalogFamilyBroken ? null : opts.catalog.horsepower,
		live,
		pin: null
	});
	const liveEngine = live.engine?.trim() || null;
	const liveHp = live.horsepower != null && live.horsepower > 0 ? live.horsepower : null;
	const liveOk = reject.length === 0 && (live.confidence === "high" || live.confidence === "medium");
	const hard = { ...base };
	let usedLive = false;
	if (liveOk && (isEmptyEngine(hard.engine) || catalogFamilyBroken) && liveEngine) {
		hard.engine = liveEngine;
		usedLive = true;
	}
	if (liveOk && liveHp != null && (hard.horsepower == null || hard.horsepower <= 0 || catalogFamilyBroken)) {
		hard.horsepower = liveHp;
		usedLive = true;
	}
	if (!hard.chassis || hard.chassis === "—") {
		if (liveOk && live.chassis?.trim()) {
			hard.chassis = live.chassis.trim();
			usedLive = true;
		}
	}
	if (!hard.transmission || hard.transmission === "—") {
		if (liveOk && live.transmission?.trim()) {
			hard.transmission = live.transmission.trim();
			usedLive = true;
		}
	}
	if (!hard.fuelType) {
		if (liveOk && live.fuelType?.trim()) {
			hard.fuelType = live.fuelType.trim();
			usedLive = true;
		}
	} else if (!liveOk && live.fuelType) {}
	if (live.torqueLbFt != null && live.torqueLbFt > 0) {
		if (hard.torqueLbFt == null || hard.torqueLbFt <= 0 || catalogFamilyBroken) {
			if (liveOk) {
				hard.torqueLbFt = live.torqueLbFt;
				usedLive = true;
			}
		}
	}
	let trust;
	if (usedLive && liveOk) {
		trust = live.confidence === "high" || live.confidence === "medium" ? "live-validated" : "live-unverified";
		if (live.confidence === "low") trust = "live-unverified";
	} else if (base.engine) trust = "catalog";
	else if (liveEngine && !liveOk) trust = "empty";
	else trust = base.engine ? "catalog" : "empty";
	if (!liveOk && base.engine) trust = "catalog";
	return {
		hard,
		trust,
		liveRejectedReasons: reject,
		liveAccepted: usedLive && liveOk,
		pin: null
	};
}
function formatHardHorsepower(hp) {
	if (hp == null || hp <= 0) return null;
	return `${Math.round(hp)} HP`;
}
function formatHardTorque(tq) {
	if (tq == null || tq <= 0) return null;
	return `${tq.toLocaleString()} lb-ft`;
}
var STORAGE_KEY = `rvfax.verifiedCatalog.v9`;
/** Legacy keys to wipe on load so old bad dossiers cannot resurface */
var LEGACY_STORAGE_KEYS = [
	"rvfax.verifiedCatalog.v1",
	"rvfax.verifiedCatalog.v2",
	"rvfax.verifiedCatalog.v3",
	"rvfax.verifiedCatalog.v4",
	"rvfax.verifiedCatalog.v5",
	"rvfax.verifiedCatalog.v6",
	"rvfax.verifiedCatalog.v7",
	"rvfax.verifiedCatalog.v8"
];
var MAX_ENTRIES = 200;
/** 14 days — re-verify sooner after rule changes */
var TTL_MS = 12096e5;
function canUseStorage() {
	try {
		return typeof localStorage !== "undefined";
	} catch {
		return false;
	}
}
function purgeLegacyKeys() {
	if (!canUseStorage()) return;
	for (const k of LEGACY_STORAGE_KEYS) try {
		localStorage.removeItem(k);
	} catch {}
}
function emptyStore() {
	return {
		version: 9,
		entries: {}
	};
}
function readStore() {
	if (!canUseStorage()) return emptyStore();
	purgeLegacyKeys();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyStore();
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.version !== 9 || !parsed.entries) return emptyStore();
		return parsed;
	} catch {
		return emptyStore();
	}
}
function writeStore(store) {
	if (!canUseStorage()) return;
	try {
		store.version = 9;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch {}
}
function isFresh(entry) {
	if (entry.schema !== 9) return false;
	const t = Date.parse(entry.savedAt);
	if (!Number.isFinite(t)) return false;
	return Date.now() - t < TTL_MS;
}
function applyPinFields(pin, dossier) {
	const engine = pin.engine;
	const overview = sanitizeNarrativeForPin(pin, dossier.overview);
	const keyFeatures = sanitizeFeaturesForPin(pin, dossier.keyFeatures);
	const reliabilitySummary = sanitizeNarrativeForPin(pin, dossier.reliabilitySummary);
	const marketNotes = sanitizeNarrativeForPin(pin, dossier.marketNotes);
	return {
		...dossier,
		engine,
		horsepower: pin.horsepower,
		torqueLbFt: pin.torqueLbFt ?? dossier.torqueLbFt,
		chassis: pin.chassis ?? dossier.chassis,
		transmission: pin.transmission ?? dossier.transmission,
		fuelType: pin.fuelType ?? (/diesel|cummins|isb|b6\.7|l9|isl|power stroke/i.test(engine) ? "Diesel" : dossier.fuelType),
		rvType: pin.fuelType === "Diesel" ? dossier.rvType?.toLowerCase().includes("gas") ? "Class A Diesel" : dossier.rvType || "Class A Diesel" : pin.fuelType === "Gas" ? dossier.rvType?.toLowerCase().includes("diesel") ? "Class A Gas" : dossier.rvType || "Class A Gas" : dossier.rvType,
		overview,
		keyFeatures,
		reliabilitySummary,
		marketNotes,
		sourcesNote: [dossier.sourcesNote, pin.note ? `Brochure pin: ${pin.note}` : null].filter(Boolean).join(" · ")
	};
}
/** Apply brochure powertrain pin onto a live dossier (always on read/save). */
function applyPowertrainPin(year, make, model, floorplan, dossier) {
	const pin = findPowertrainCorrection(year, make, model, floorplan);
	if (!pin) return dossier;
	return applyPinFields(pin, dossier);
}
function conflictsWithPin(year, make, model, floorplan, d) {
	const pin = findPowertrainCorrection(year, make, model, floorplan);
	if (!pin || !d.engine) return false;
	return powertrainConflictsWithPin(pin, d.engine, d.horsepower);
}
/**
* Soft-only slice: market + narrative. Used when hard powertrain is rejected
* so we can still cache useful Live text without poisoning engine/HP.
*/
function softFieldsOnly(d, hard) {
	return {
		...d,
		engine: hard.engine,
		horsepower: hard.horsepower,
		torqueLbFt: hard.torqueLbFt,
		chassis: hard.chassis,
		transmission: hard.transmission,
		fuelType: hard.fuelType
	};
}
/** True if dossier has enough signal to cache (soft and/or hard). */
function isDossierWorthCaching(d) {
	if (!d?.live) return false;
	const hasEngine = Boolean(d.engine && d.engine.trim().length > 3);
	const hasHp = d.horsepower != null && d.horsepower > 0;
	const hasChassis = Boolean(d.chassis && d.chassis.trim().length > 2);
	return Boolean(d.overview?.trim()) || Boolean(d.reliabilitySummary?.trim()) || (d.commonIssues?.length ?? 0) > 0 || d.tradeInUsd != null && d.tradeInUsd > 0 || d.retailHighUsd != null && d.retailHighUsd > 0 || hasEngine && (hasHp || hasChassis);
}
/**
* Phase 4.1 — build a cache-safe dossier: pin wins; invalid Live powertrain stripped.
*/
function sanitizeDossierForCache(year, make, model, floorplan, dossier) {
	if (!isDossierWorthCaching(dossier)) return null;
	const pin = findPowertrainCorrection(year, make, model, floorplan);
	const reject = validateLivePowertrain({
		year,
		make,
		model,
		floorplan,
		catalogFuelType: dossier.fuelType,
		catalogType: dossier.rvType,
		catalogEngine: pin?.engine ?? null,
		catalogHp: pin?.horsepower ?? null,
		live: dossier,
		pin
	});
	let out = { ...dossier };
	let powertrainPinned = false;
	let powertrainValidated = false;
	if (pin) {
		out = applyPinFields(pin, out);
		powertrainPinned = true;
		powertrainValidated = true;
	} else {
		out = softFieldsOnly(out, {
			engine: null,
			horsepower: null,
			torqueLbFt: null,
			chassis: null,
			transmission: null,
			fuelType: null
		});
		powertrainValidated = false;
		if (!isDossierWorthCaching(out)) return null;
	}
	if (out.horsepower === 450 && !pin && out.engine && /godzilla|v10|triton|isb|b6\.7/i.test(out.engine)) out = {
		...out,
		horsepower: null
	};
	return {
		dossier: {
			...out,
			live: true
		},
		powertrainPinned,
		powertrainValidated,
		rejectedReasons: reject
	};
}
function getVerifiedDossier(year, make, model, floorplan) {
	const key = dossierCacheKey(year, make, model, floorplan);
	const store = readStore();
	const entry = store.entries[key];
	if (!entry || !isFresh(entry)) {
		if (entry && !isFresh(entry)) {
			delete store.entries[key];
			writeStore(store);
		}
		return null;
	}
	if (conflictsWithPin(year, make, model, floorplan, entry.dossier)) {
		const pin = findPowertrainCorrection(year, make, model, floorplan);
		if (pin) {
			entry.dossier = applyPinFields(pin, entry.dossier);
			entry.powertrainPinned = true;
			entry.powertrainValidated = true;
			entry.savedAt = (/* @__PURE__ */ new Date()).toISOString();
			store.entries[key] = entry;
			writeStore(store);
		} else {
			delete store.entries[key];
			writeStore(store);
			return null;
		}
	}
	let dossier = applyPowertrainPin(year, make, model, floorplan, entry.dossier);
	if (!findPowertrainCorrection(year, make, model, floorplan)) dossier = softFieldsOnly(dossier, {
		engine: null,
		horsepower: null,
		torqueLbFt: null,
		chassis: null,
		transmission: null,
		fuelType: null
	});
	entry.hits = (entry.hits || 0) + 1;
	store.entries[key] = entry;
	writeStore(store);
	return {
		...dossier,
		live: true,
		cached: true,
		fetchedAt: entry.dossier.fetchedAt || entry.savedAt
	};
}
function saveVerifiedDossier(year, make, model, floorplan, dossier) {
	const safe = sanitizeDossierForCache(year, make, model, floorplan, dossier);
	if (!safe) return;
	if (conflictsWithPin(year, make, model, floorplan, safe.dossier) && !safe.powertrainPinned) return;
	const key = dossierCacheKey(year, make, model, floorplan);
	const store = readStore();
	store.entries[key] = {
		key,
		year: year.trim(),
		make: make.trim(),
		model: model.trim(),
		floorplan: (floorplan || "").trim(),
		dossier: safe.dossier,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		hits: (store.entries[key]?.hits || 0) + 1,
		schema: 9,
		powertrainPinned: safe.powertrainPinned,
		powertrainValidated: safe.powertrainValidated
	};
	const keys = Object.keys(store.entries);
	if (keys.length > MAX_ENTRIES) {
		const sorted = keys.map((k) => store.entries[k]).sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt));
		for (let i = 0; i < sorted.length - MAX_ENTRIES; i++) delete store.entries[sorted[i].key];
	}
	writeStore(store);
}
/** Phase 4.3 — remove one coach from local verified cache */
function clearVerifiedDossier(year, make, model, floorplan) {
	const key = dossierCacheKey(year, make, model, floorplan);
	const store = readStore();
	if (!store.entries[key]) return false;
	delete store.entries[key];
	writeStore(store);
	return true;
}
/**
* Live Grok vehicle dossier — progressive fill over catalog brochure.
* Report paints catalog instantly; live soft fields update when ready.
* Successful live results are saved to the verified catalog cache so the
* next open of the same coach is accurate immediately.
*
* Phase 1–2: year-true hard powertrain locked; Live cannot stomp.
* Phase 3: catalog candidate injected; two-step research on server.
* Phase 4: cache only after pin+validation; refresh/clear controls.
*/
function dossierCacheKey(year, make, model, floorplan) {
	return `${year}|${make}|${model}|${floorplan || ""}`.toLowerCase();
}
/** Client timeout — keep year-band paint; do not blank the report */
var LIVE_DOSSIER_TIMEOUT_MS = 9e4;
/**
* Instant paint helper — verified local cache from a prior live search.
* Use this before awaiting fetchLiveDossier so the UI isn't stuck on catalog guesses.
*/
function peekVerifiedDossier(year, make, model, floorplan) {
	return getVerifiedDossier(year, make, model, floorplan);
}
function pinDossier(year, make, model, floorplan, d) {
	return applyPowertrainPin(year, make, model, floorplan, {
		...d,
		live: true
	});
}
async function fetchLiveDossier(year, make, model, floorplan, signal, catalogCandidate) {
	if (!year.trim() || !make.trim() || !model.trim()) return {
		ok: false,
		error: "Year, make, and model are required."
	};
	const ctrl = new AbortController();
	const onParentAbort = () => ctrl.abort();
	if (signal) {
		if (signal.aborted) return {
			ok: false,
			error: "Request cancelled.",
			aborted: true
		};
		signal.addEventListener("abort", onParentAbort, { once: true });
	}
	const timer = setTimeout(() => ctrl.abort(), LIVE_DOSSIER_TIMEOUT_MS);
	try {
		const resp = await fetch("/api/rvfax/dossier", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				year: year.trim(),
				make: make.trim(),
				model: model.trim(),
				floorplan: floorplan?.trim() || void 0,
				catalogCandidate: catalogCandidate || void 0
			}),
			signal: ctrl.signal
		});
		let json = {};
		try {
			json = await resp.json();
		} catch {
			return {
				ok: false,
				error: `Live lookup returned invalid JSON (${resp.status}) — catalog year-band stays on screen.`,
				status: resp.status
			};
		}
		if (json && json.data && typeof json.data === "object") {
			const d = json.data;
			const data = pinDossier(year, make, model, floorplan, {
				...d,
				live: true,
				cached: Boolean(json.meta?.cached || d.cached),
				fetchedAt: d.fetchedAt || (/* @__PURE__ */ new Date()).toISOString(),
				modelUsed: json.meta?.model || d.modelUsed || null
			});
			saveVerifiedDossier(year, make, model, floorplan, data);
			return {
				ok: true,
				data
			};
		}
		return {
			ok: false,
			error: json.error || `Live lookup failed (${resp.status}) — catalog year-band remains.`,
			status: resp.status
		};
	} catch (e) {
		if (e instanceof DOMException && e.name === "AbortError" || e instanceof Error && e.name === "AbortError") {
			if (signal?.aborted) return {
				ok: false,
				error: "Request cancelled.",
				aborted: true
			};
			return {
				ok: false,
				error: "Live research timed out — catalog year-band remains on this report.",
				aborted: false
			};
		}
		return {
			ok: false,
			error: e instanceof Error ? `${e.message} — catalog year-band remains on this report.` : "Network error on live lookup — catalog year-band remains."
		};
	} finally {
		clearTimeout(timer);
		if (signal) signal.removeEventListener("abort", onParentAbort);
	}
}
/**
* Phase 4.3 — bust local verified cache for this coach.
* Next fetchLiveDossier will hit the network (server also keys by CACHE_VER).
*/
function refreshCoachDossierCache(year, make, model, floorplan) {
	clearVerifiedDossier(year, make, model, floorplan);
}
function emptySpecDisplay(_pending) {
	const dash = "—";
	return {
		engine: dash,
		horsepower: dash,
		torque: dash,
		transmission: dash,
		chassis: dash,
		hitchOrPin: dash,
		fuelCapacity: dash,
		lengthFt: dash,
		exteriorWidth: dash,
		exteriorHeight: dash,
		interiorHeight: dash,
		gvwr: dash,
		uvw: dash,
		ccc: dash,
		slideouts: dash,
		sleeps: dash,
		freshWater: dash,
		grayWater: dash,
		blackWater: dash,
		generator: dash,
		mpgHighway: dash,
		warranty: dash,
		isToyHauler: false,
		garageLength: dash,
		garageWidth: dash,
		garageHeight: dash,
		garageCapacity: dash,
		rampWidth: dash,
		fuelStation: dash,
		garageFits: dash
	};
}
/**
* Progressive: catalog base paints instantly; live fields overwrite when set.
*
* Phase 2 hard facts: engine / HP / torque / chassis / transmission are locked
* from catalog by default (`lockPowertrainFromCatalog: true`). Soft fields
* (dimensions, tanks, generator, MPG, warranty) still accept Live.
*
* Use `resolveHardPowertrain` from livePowertrainGuard for pin + validation
* when deciding whether Live may fill *empty* hard fields.
*/
function mergeLiveIntoDisplay(base, live, opts) {
	const seed = base ?? emptySpecDisplay(false);
	if (!live?.live) {
		if (opts?.hardOverride) return {
			...seed,
			engine: opts.hardOverride.engine || seed.engine,
			horsepower: opts.hardOverride.horsepower || seed.horsepower,
			torque: opts.hardOverride.torque || seed.torque,
			chassis: opts.hardOverride.chassis || seed.chassis,
			transmission: opts.hardOverride.transmission || seed.transmission
		};
		return seed;
	}
	const lockPt = opts?.lockPowertrainFromCatalog !== false;
	const lbs = (n) => n != null && n > 0 ? `${n.toLocaleString()} lbs` : null;
	const gal = (n) => n != null && n > 0 ? `${n} gal` : null;
	const s = (v) => v && String(v).trim() ? String(v).trim() : null;
	const looksLikeLengthRange = (v) => {
		if (!v) return false;
		return /\d\s*[-–—]\s*\d/.test(v) || /\bto\b/i.test(v) || /\b(span|range|varies)\b/i.test(v);
	};
	const seedLengthIsSpecific = !!seed.lengthFt && seed.lengthFt !== "—" && !looksLikeLengthRange(seed.lengthFt);
	const liveLength = s(live.overallLength);
	const lengthFt = liveLength && looksLikeLengthRange(liveLength) && seedLengthIsSpecific ? seed.lengthFt : liveLength && !looksLikeLengthRange(liveLength) ? liveLength : seed.lengthFt;
	const soft = {
		engine: seed.engine,
		horsepower: seed.horsepower,
		torque: seed.torque,
		transmission: seed.transmission,
		chassis: seed.chassis,
		hitchOrPin: lbs(live.towingCapacityLbs) ?? seed.hitchOrPin,
		fuelCapacity: gal(live.fuelCapacityGal) ?? seed.fuelCapacity,
		lengthFt,
		exteriorWidth: s(live.exteriorWidth) ?? seed.exteriorWidth,
		exteriorHeight: s(live.exteriorHeight) ?? seed.exteriorHeight,
		interiorHeight: s(live.interiorHeight) ?? seed.interiorHeight,
		gvwr: lbs(live.gvwrLbs) ?? seed.gvwr,
		uvw: lbs(live.uvwLbs) ?? seed.uvw,
		ccc: lbs(live.cccLbs) ?? seed.ccc,
		slideouts: live.slideouts != null && live.slideouts >= 0 ? String(live.slideouts) : seed.slideouts,
		sleeps: live.sleeps != null && live.sleeps > 0 ? String(live.sleeps) : seed.sleeps,
		freshWater: gal(live.freshWaterGal) ?? seed.freshWater,
		grayWater: gal(live.grayWaterGal) ?? seed.grayWater,
		blackWater: gal(live.blackWaterGal) ?? seed.blackWater,
		generator: s(live.generator) ?? seed.generator,
		mpgHighway: live.mpgHighwayEst != null && live.mpgHighwayEst > 0 ? String(live.mpgHighwayEst) : seed.mpgHighway,
		warranty: s(live.warranty) ?? seed.warranty,
		isToyHauler: seed.isToyHauler,
		garageLength: seed.garageLength,
		garageWidth: seed.garageWidth,
		garageHeight: seed.garageHeight,
		garageCapacity: seed.garageCapacity,
		rampWidth: seed.rampWidth,
		fuelStation: seed.fuelStation,
		garageFits: seed.garageFits
	};
	if (opts?.hardOverride) return {
		...soft,
		engine: opts.hardOverride.engine || soft.engine,
		horsepower: opts.hardOverride.horsepower || soft.horsepower,
		torque: opts.hardOverride.torque || soft.torque,
		chassis: opts.hardOverride.chassis || soft.chassis,
		transmission: opts.hardOverride.transmission || soft.transmission
	};
	if (lockPt) return {
		...soft,
		engine: seed.engine,
		horsepower: seed.horsepower,
		torque: seed.torque,
		transmission: seed.transmission,
		chassis: seed.chassis
	};
	return {
		...soft,
		engine: s(live.engine) ?? seed.engine,
		horsepower: live.horsepower != null && Number.isFinite(live.horsepower) && live.horsepower > 0 ? `${Math.round(live.horsepower)} HP` : seed.horsepower,
		torque: live.torqueLbFt != null && live.torqueLbFt > 0 ? `${live.torqueLbFt.toLocaleString()} lb-ft` : seed.torque,
		transmission: s(live.transmission) ?? seed.transmission,
		chassis: s(live.chassis) ?? seed.chassis
	};
}
function liveMarketLadder(live) {
	if (!live?.live) return null;
	const tradeIn = live.tradeInUsd ?? 0;
	const retailLow = live.retailLowUsd ?? 0;
	const retailHigh = live.retailHighUsd ?? 0;
	if (tradeIn <= 0 && retailLow <= 0 && retailHigh <= 0) return null;
	return {
		tradeIn,
		retailLow,
		retailHigh,
		msrpLo: live.msrpLowUsd ?? void 0,
		msrpHi: live.msrpHighUsd ?? void 0,
		note: live.marketNotes || "Live Grok market ladder"
	};
}
/**
* Export / PDF for Vehicle History + Compare.
*
* Hybrid design: RvFOX Pro clean paper + CARFAX-style value summary.
* Bold typography, formal snapshot, blue section system.
* Brand: RvFOX Pro only — never Carfax trademarks.
*/
function isNative() {
	try {
		return Capacitor.isNativePlatform();
	} catch {
		return false;
	}
}
function isIOS() {
	if (typeof navigator === "undefined") return false;
	return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function sanitizeClone(root) {
	const clone = root.cloneNode(true);
	clone.querySelectorAll("script, iframe, video, audio, [data-no-export], .print\\:hidden").forEach((n) => n.remove());
	clone.querySelectorAll("*").forEach((node) => {
		const el = node;
		if (!el.className || typeof el.className !== "string") return;
		el.className = el.className.replace(/\bflex-col-reverse\b/g, "flex-col").replace(/\bflex-row-reverse\b/g, "flex-row");
	});
	clone.querySelectorAll("img").forEach((img) => {
		const el = img;
		const cls = el.className || "";
		if (cls.includes("absolute") && (cls.includes("inset-0") || cls.includes("object-cover"))) el.remove();
	});
	clone.querySelectorAll("button, input, select, textarea, a[href='#']").forEach((n) => {
		const t = (n.textContent || "").trim();
		if (t && t.length < 80 && !/retry|search|finance|pdf|save|back|compare|ask/i.test(t)) {
			const span = clone.ownerDocument.createElement("span");
			span.className = "chip-export";
			span.textContent = t;
			n.replaceWith(span);
		} else n.remove();
	});
	return clone;
}
function buildStandaloneHtml(opts) {
	const { title, subtitle, bodyHtml, meta = {} } = opts;
	const issued = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
	const issuedTime = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
	const vehicleLine = [
		meta.year,
		meta.make,
		meta.model
	].filter(Boolean).join(" ");
	const tradeIn = meta.tradeIn || "—";
	const retailLow = meta.retailLow || "—";
	const retailHigh = meta.retailHigh || "—";
	const rating = meta.rating || "—";
	const reportId = meta.reportId || "RVF-REPORT";
	const preparedFor = meta.preparedFor || "Client";
	const type = meta.type || "Motorhome";
	const recallCount = meta.recallCount ?? 0;
	const floorplan = meta.floorplan || "";
	const defaultFactors = [
		{
			label: "Service history when documented",
			positive: true
		},
		{
			label: "Personal / private ownership pattern",
			positive: true
		},
		{
			label: recallCount > 0 ? `${recallCount} active NHTSA recall${recallCount === 1 ? "" : "s"}` : "No open NHTSA recalls found",
			positive: recallCount === 0
		},
		{
			label: "Age, roof seals, tires, chassis service gaps",
			positive: false
		}
	];
	const factorRows = (meta.factors && meta.factors.length ? meta.factors : defaultFactors).map((f) => {
		return `<div class="factor ${f.positive ? "up" : "down"}"><span class="factor-ico">${f.positive ? "↑" : "↓"}</span><span class="factor-label">${escapeHtml(f.label)}</span></div>`;
	}).join("");
	const snapRecalls = recallCount > 0 ? `<div class="snap-row warn"><span class="snap-ico">!</span><strong>${recallCount} open recall${recallCount === 1 ? "" : "s"}</strong> on year/make/model</div>` : `<div class="snap-row ok"><span class="snap-ico">✓</span><strong>No open recalls</strong> found for this lineup</div>`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --ink: #0b1220;
    --muted: #4b5568;
    --line: #d7e3f2;
    --line-strong: #b8cce3;
    --paper: #ffffff;
    --soft: #f4f8fc;
    --blue: #1d6fbf;
    --blue-deep: #0e4f8f;
    --blue-soft: #e8f2fc;
    --red: #c81e1e;
    --green: #0f7a4a;
    --amber: #b45309;
    --navy: #0b1b33;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--ink);
    background: #e6eef7;
    font-weight: 600;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  strong, b, h1, h2, h3, th, .bold { font-weight: 800 !important; }

  .bar {
    position: sticky; top: 0; z-index: 50;
    display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
    padding: 12px 16px; padding-top: max(12px, env(safe-area-inset-top));
    background: var(--navy); color: #fff; font-weight: 700;
  }
  .bar button {
    appearance: none; border: 0; border-radius: 999px;
    padding: 11px 16px; font-weight: 800; font-size: 13px; cursor: pointer;
  }
  .bar .primary { background: #3b9eff; color: #041018; }
  .bar .secondary { background: rgba(255,255,255,.14); color: #fff; }

  .sheet {
    max-width: 860px; margin: 0 auto;
    background: var(--paper);
    box-shadow: 0 10px 40px rgba(11, 27, 51, 0.14);
    min-height: 100vh;
  }
  .pad { padding: 0 22px 28px; }

  /* ── Brand header (RvFOX Pro) ── */
  .tophead {
    display: grid; grid-template-columns: 1.2fr 1fr;
    gap: 12px; padding: 22px 22px 14px;
    border-bottom: 2px solid var(--line);
  }
  @media (max-width: 640px) { .tophead { grid-template-columns: 1fr; } }
  .brand-word {
    font-size: 28px; font-weight: 900; letter-spacing: -0.02em;
    color: var(--ink); line-height: 1;
  }
  .brand-word span { color: var(--blue); }
  .tagline {
    margin-top: 4px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; color: var(--red); text-transform: uppercase;
  }
  .doc-label {
    margin-top: 8px; font-size: 10px; font-weight: 800;
    letter-spacing: 0.18em; color: #6b7c90; text-transform: uppercase;
  }
  .meta-right { text-align: right; }
  @media (max-width: 640px) { .meta-right { text-align: left; } }
  .meta-right .rid {
    font-size: 11px; font-weight: 800; color: #5b6b7c; letter-spacing: 0.04em;
  }
  .meta-right .date {
    margin-top: 2px; font-size: 12px; font-weight: 700; color: var(--ink);
  }
  .verified {
    display: inline-block; margin-top: 8px;
    font-size: 10px; font-weight: 800; color: var(--green);
    letter-spacing: 0.04em;
  }

  /* Prepared strip */
  .prepared {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 12px 22px 16px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(180deg, #fbfcfe, #f3f7fb);
  }
  @media (max-width: 640px) { .prepared { grid-template-columns: 1fr; } }
  .prep-label {
    font-size: 9px; font-weight: 900; letter-spacing: 0.16em;
    color: #6b7c90; text-transform: uppercase;
  }
  .prep-value {
    margin-top: 2px; font-size: 16px; font-weight: 900; color: var(--ink);
  }
  .prep-sub {
    margin-top: 2px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }

  /* ── CARFAX-style value band ── */
  .value-band {
    display: grid; grid-template-columns: 0.95fr 1.25fr;
    margin: 0 22px 16px;
    border: 2px solid var(--ink);
    background: #fff;
  }
  @media (max-width: 640px) { .value-band { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .value-left {
    padding: 16px 18px;
    border-right: 2px solid var(--ink);
    background: #fafbfc;
  }
  @media (max-width: 640px) { .value-left { border-right: 0; border-bottom: 2px solid var(--ink); } }
  .value-kicker {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: #5b6b7c;
  }
  .value-amount {
    margin-top: 6px; font-size: 30px; font-weight: 900;
    color: var(--ink); letter-spacing: -0.02em; line-height: 1;
  }
  .value-range {
    margin-top: 8px; font-size: 12px; font-weight: 800; color: var(--blue-deep);
  }
  .value-note {
    margin-top: 6px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }
  .value-right { padding: 14px 16px; }
  .value-right h2 {
    margin: 0 0 10px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink);
  }
  .factor {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 0; font-size: 12px; font-weight: 800;
  }
  .factor-ico {
    width: 20px; height: 20px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; flex-shrink: 0;
  }
  .factor.up .factor-ico { background: #e8f8ef; color: var(--green); }
  .factor.down .factor-ico { background: #fdecec; color: var(--red); }
  .factor.up .factor-label { color: var(--ink); }
  .factor.down .factor-label { color: var(--ink); }

  /* Snapshot panel (CARFAX list style) */
  .snapshot {
    margin: 0 22px 18px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .snapshot-head {
    display: flex; justify-content: space-between; align-items: center;
    gap: 10px; flex-wrap: wrap;
    padding: 12px 14px;
    background: var(--navy); color: #fff;
  }
  .snapshot-head .sh-title {
    font-size: 14px; font-weight: 900; letter-spacing: 0.02em;
  }
  .snapshot-head .sh-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.08em;
    padding: 4px 8px; border-radius: 999px;
    background: #3b9eff; color: #041018;
  }
  .snap-vehicle {
    padding: 12px 14px; border-bottom: 1px solid var(--line);
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;
  }
  @media (max-width: 640px) { .snap-vehicle { grid-template-columns: 1fr; } }
  .snap-name {
    font-size: 18px; font-weight: 900; color: var(--ink); line-height: 1.15;
  }
  .snap-sub {
    margin-top: 3px; font-size: 12px; font-weight: 700; color: #4b5568;
  }
  .snap-rating {
    text-align: right;
  }
  @media (max-width: 640px) { .snap-rating { text-align: left; } }
  .snap-rating .num {
    font-size: 28px; font-weight: 900; color: var(--blue); line-height: 1;
  }
  .snap-rating .lbl {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    color: #6b7c90; text-transform: uppercase;
  }
  .snap-list { padding: 4px 0; }
  .snap-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-top: 1px solid var(--line);
    font-size: 12.5px; font-weight: 700;
  }
  .snap-row strong { font-weight: 900; }
  .snap-ico {
    width: 22px; height: 22px; border-radius: 6px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; flex-shrink: 0;
    background: var(--soft); color: var(--blue-deep);
  }
  .snap-row.warn .snap-ico { background: #fdecec; color: var(--red); }
  .snap-row.ok .snap-ico { background: #e8f8ef; color: var(--green); }

  /* Market triple */
  .market-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
    margin: 0 22px 18px;
  }
  @media (max-width: 640px) { .market-grid { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .m-card {
    border: 1.5px solid var(--line-strong); border-radius: 10px;
    padding: 12px 12px 14px; background: #fff; text-align: center;
  }
  .m-card .m-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .m-card.trade .m-label { color: var(--red); }
  .m-card.low .m-label { color: var(--blue); }
  .m-card.high .m-label { color: var(--blue-deep); }
  .m-card .m-val {
    margin-top: 6px; font-size: 22px; font-weight: 900; color: var(--ink);
    letter-spacing: -0.02em;
  }
  .m-card .m-sub {
    margin-top: 4px; font-size: 11px; font-weight: 700; color: #6b7c90;
  }

  /* Body / cloned report */
  .body { padding: 0 22px 8px; }
  #report-root {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root, #report-root * {
    box-shadow: none !important;
    text-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  #report-root [class*="pointer-events-none"][class*="absolute"],
  #report-root [class*="absolute"][class*="inset-0"] {
    display: none !important;
  }
  #report-root img {
    max-width: 120px; height: auto; border-radius: 6px;
    border: 1px solid var(--line);
  }
  #report-root section,
  #report-root [class*="glass"],
  #report-root [class*="rounded-"][class*="border"],
  #report-root [class*="rounded-2xl"],
  #report-root [class*="rounded-\\["] {
    background: #fff !important;
    border: 1.5px solid var(--line) !important;
    border-radius: 12px !important;
    color: var(--ink) !important;
    margin: 0 0 14px !important;
    padding: 14px 16px !important;
    overflow: visible !important;
    page-break-inside: avoid;
    font-weight: 700 !important;
  }
  #report-root section > p:first-child,
  #report-root [class*="tracking"][class*="font-bold"]:first-child,
  #report-root h2, #report-root h3 {
    font-size: 12px !important; font-weight: 900 !important;
    letter-spacing: 0.12em !important; text-transform: uppercase !important;
    color: var(--blue-deep) !important;
    border-bottom: 2px solid var(--blue) !important;
    padding-bottom: 6px !important; margin: 0 0 12px !important;
    background: transparent !important;
  }
  #report-root h1 {
    font-size: 22px !important; font-weight: 900 !important;
    color: var(--ink) !important; margin: 0 !important;
  }
  #report-root, #report-root p, #report-root span, #report-root li, #report-root div {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root [class*="text-white"],
  #report-root [class*="text-white\\/"] { color: var(--ink) !important; }
  #report-root [class*="text-sky"],
  #report-root [class*="text-blue"] { color: var(--blue-deep) !important; font-weight: 800 !important; }
  #report-root [class*="text-ruby"],
  #report-root [class*="text-red"] { color: var(--red) !important; font-weight: 800 !important; }
  #report-root [class*="text-emerald"],
  #report-root [class*="text-green"] { color: var(--green) !important; font-weight: 800 !important; }
  #report-root [class*="text-amber"],
  #report-root [class*="text-gold"],
  #report-root [class*="text-gold-bright"] { color: var(--amber) !important; font-weight: 800 !important; }
  #report-root [class*="text-white\\/70"],
  #report-root [class*="text-white\\/60"],
  #report-root [class*="text-white\\/55"],
  #report-root [class*="text-white\\/80"],
  #report-root [class*="text-white\\/75"],
  #report-root [class*="text-white\\/65"],
  #report-root [class*="text-white\\/45"] { color: #4b5568 !important; font-weight: 700 !important; }

  #report-root [class*="bg-black"],
  #report-root [class*="bg-white\\/"],
  #report-root [class*="bg-emerald"],
  #report-root [class*="bg-ruby"],
  #report-root [class*="bg-sky"],
  #report-root [class*="bg-gold"],
  #report-root [class*="bg-blue"],
  #report-root [class*="bg-green"],
  #report-root [class*="bg-amber"] {
    background: transparent !important;
    border-color: var(--line) !important;
  }
  #report-root [class*="grid"] { display: grid !important; gap: 8px !important; }
  #report-root [class*="grid-cols-2"] { grid-template-columns: 1fr 1fr !important; }
  #report-root [class*="grid-cols-3"] { grid-template-columns: 1fr 1fr 1fr !important; }
  #report-root [class*="grid-cols-4"] { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
  #report-root .chip-export,
  #report-root [class*="rounded-full"] {
    display: inline-flex !important;
    font-size: 10px !important; font-weight: 900 !important;
    letter-spacing: 0.04em !important;
    padding: 4px 9px !important; border-radius: 999px !important;
    border: 1.5px solid var(--line-strong) !important;
    background: var(--blue-soft) !important; color: var(--blue-deep) !important;
    margin: 2px !important;
  }
  #report-root .hidden,
  #report-root .print\\:hidden,
  #report-root [class~="hidden"] { display: none !important; }
  #report-root [class*="space-y"] > * + * { margin-top: 8px !important; }
  #report-root [class*="flex"] {
    display: flex !important; flex-wrap: wrap; gap: 6px; font-weight: 700 !important;
  }
  #report-root [class*="flex-col"] { flex-direction: column !important; }
  #report-root [class*="items-center"] { align-items: center !important; }
  #report-root [class*="justify-between"] { justify-content: space-between !important; }
  #report-root [class*="border-emerald"],
  #report-root [class*="bg-emerald"] {
    background: #e8f8ef !important;
    border: 1px solid #b6e4cf !important;
    color: var(--green) !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  #report-root svg { width: 12px !important; height: 12px !important; }

  /* Legal */
  .legal {
    margin: 10px 22px 0;
    padding: 14px 16px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    background: var(--soft);
  }
  .legal h3 {
    margin: 0 0 8px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--navy);
  }
  .legal p {
    margin: 0 0 6px; font-size: 11px; line-height: 1.5;
    color: #4b5568; font-weight: 700;
  }
  .legal p:last-child { margin-bottom: 0; }
  .footer-bar {
    margin-top: 16px; padding: 14px 22px 18px;
    background: var(--navy); color: rgba(255,255,255,0.88);
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .footer-bar strong { color: #7ec4ff; font-weight: 900; }

  @media print {
    body { background: #fff; }
    .bar { display: none !important; }
    .sheet { max-width: none; box-shadow: none; min-height: 0; }
    @page { size: letter; margin: 0.42in 0.48in; }
    .value-band, .snapshot, .market-grid, .legal, section { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="bar">
    <button type="button" class="primary" onclick="window.scrollTo(0,0);setTimeout(function(){window.print()},100)">Save as PDF / Print</button>
    <button type="button" class="secondary" onclick="try{window.parent.postMessage({type:'rvfax-export-close'},'*')}catch(e){};try{window.close()}catch(e){}">Close</button>
  </div>
  <div class="sheet">
    <header class="tophead">
      <div>
        <div class="brand-word">Rv<span>FOX</span> Pro</div>
        <div class="tagline">Know Before You Buy</div>
        <div class="doc-label">Vehicle History Report</div>
      </div>
      <div class="meta-right">
        <div class="rid">REPORT: ${escapeHtml(reportId)}</div>
        <div class="date">${escapeHtml(issued)}</div>
        <div class="verified">Verified & True · RvFOX Pro</div>
      </div>
    </header>

    <div class="prepared">
      <div>
        <div class="prep-label">Prepared for</div>
        <div class="prep-value">${escapeHtml(preparedFor)}</div>
      </div>
      <div>
        <div class="prep-label">Subject vehicle</div>
        <div class="prep-value">${escapeHtml(vehicleLine || title)}</div>
        <div class="prep-sub">Generated ${escapeHtml(issuedTime)}${floorplan ? " · Floorplan " + escapeHtml(floorplan) : ""}</div>
      </div>
    </div>

    <!-- CARFAX-style value + factors -->
    <div class="value-band">
      <div class="value-left">
        <div class="value-kicker">RvFOX Retail Perspective</div>
        <div class="value-amount">${escapeHtml(retailHigh !== "—" ? retailHigh : retailLow)}</div>
        <div class="value-range">Range ${escapeHtml(retailLow)} – ${escapeHtml(retailHigh)}</div>
        <div class="value-note">Trade-in est. ${escapeHtml(tradeIn)} · Confirm with PPI & door sticker</div>
      </div>
      <div class="value-right">
        <h2>History events affecting this coach's value</h2>
        ${factorRows}
      </div>
    </div>

    <!-- CARFAX-style snapshot -->
    <div class="snapshot">
      <div class="snapshot-head">
        <div class="sh-title">Vehicle History Snapshot</div>
        <div class="sh-badge">RvFOX PRO</div>
      </div>
      <div class="snap-vehicle">
        <div>
          <div class="snap-name">${escapeHtml(vehicleLine || title)}</div>
          <div class="snap-sub">${escapeHtml(type)}${floorplan ? " · Floorplan " + escapeHtml(floorplan) : ""}</div>
        </div>
        <div class="snap-rating">
          <div class="num">${escapeHtml(rating)}</div>
          <div class="lbl">RvFOX Rating</div>
        </div>
      </div>
      <div class="snap-list">
        ${snapRecalls}
        <div class="snap-row"><span class="snap-ico">⚙</span><strong>Service schedule</strong>&nbsp;included in this report</div>
        <div class="snap-row"><span class="snap-ico">▣</span><strong>Use / class</strong>&nbsp;${escapeHtml(type)}</div>
        <div class="snap-row"><span class="snap-ico">◆</span><strong>Market band</strong>&nbsp;${escapeHtml(retailLow)} – ${escapeHtml(retailHigh)}</div>
        <div class="snap-row"><span class="snap-ico">◎</span><strong>Data</strong>&nbsp;Catalog + Live Grok + NHTSA when available</div>
      </div>
    </div>

    <!-- Market triple (from your preferred report) -->
    <div class="market-grid">
      <div class="m-card trade">
        <div class="m-label">Trade-In</div>
        <div class="m-val">${escapeHtml(tradeIn)}</div>
        <div class="m-sub">Dealer offer estimate</div>
      </div>
      <div class="m-card low">
        <div class="m-label">Retail Low</div>
        <div class="m-val">${escapeHtml(retailLow)}</div>
        <div class="m-sub">Private party / auction</div>
      </div>
      <div class="m-card high">
        <div class="m-label">Retail High</div>
        <div class="m-val">${escapeHtml(retailHigh)}</div>
        <div class="m-sub">Dealer asking price</div>
      </div>
    </div>

    <div class="body">
      <div id="report-root">${bodyHtml}</div>
    </div>

    <div class="legal">
      <h3>Disclaimer · Limited purpose</h3>
      <p>
        This <strong>RvFOX Pro Vehicle History Report</strong> is a professional decision-support
        dossier for recreational vehicles and motorhomes. It compiles catalog specifications,
        optional Live Grok enrichment, NHTSA recall queries, and market estimates. It is
        <strong>not</strong> a guarantee of condition, title accuracy, or future value.
      </p>
      <p>
        Always confirm chassis VIN, door sticker (GVWR / UVW / lengths), service records, and a
        qualified pre-purchase inspection (PPI) before purchase. Estimates may differ from dealer
        quotes or private-party offers.
      </p>
      <p>© ${(/* @__PURE__ */ new Date()).getFullYear()} RvFOX Pro · Know Before You Buy · All rights reserved.</p>
    </div>

    <div class="footer-bar">
      <span><strong>David Hansen</strong> · 702-266-5918</span>
      <span><strong>RvFOX Pro</strong> · Know Before You Buy</span>
      <span>Confirm door sticker & PPI</span>
    </div>
  </div>
  <script>
    (function(){
      try {
        window.scrollTo(0,0);
        var r=document.getElementById('report-root');
        if(r){
          r.querySelectorAll('*').forEach(function(el){
            if(!el.style) return;
            el.style.height='auto'; el.style.maxHeight='none'; el.style.overflow='visible';
            el.style.fontWeight = el.style.fontWeight || '';
          });
        }
      } catch(e){}
    })();
  <\/script>
</body>
</html>`;
}
async function shareFile(filename, html, title) {
	try {
		const file = new File([html], filename, { type: "text/html" });
		const nav = navigator;
		if (nav.share && nav.canShare?.({ files: [file] })) {
			await nav.share({
				files: [file],
				title,
				text: title
			});
			return true;
		}
		if (nav.share) {
			await nav.share({
				title,
				text: title
			});
			return true;
		}
	} catch (e) {
		if (e instanceof Error && /Abort|cancel/i.test(e.message)) return true;
	}
	return false;
}
function downloadBlob(filename, html) {
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	window.setTimeout(() => {
		URL.revokeObjectURL(url);
		a.remove();
	}, 1500);
}
function openHtmlPreview(html) {
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	try {
		const iframe = document.createElement("iframe");
		iframe.setAttribute("title", "RvFOX Pro Vehicle History Report");
		iframe.style.cssText = "position:fixed;inset:0;z-index:99999;width:100%;height:100%;border:0;background:#e6eef7;";
		iframe.src = url;
		const closeBar = document.createElement("div");
		closeBar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:100000;display:flex;gap:8px;padding:12px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:#0b1b33;";
		const mk = (label, primary) => {
			const b = document.createElement("button");
			b.type = "button";
			b.textContent = label;
			b.style.cssText = primary ? "flex:1;padding:14px;border:0;border-radius:999px;font-weight:800;background:#3b9eff;color:#041018;font-size:14px;" : "padding:14px 16px;border:0;border-radius:999px;font-weight:800;background:rgba(255,255,255,.14);color:#fff;font-size:14px;";
			return b;
		};
		const printBtn = mk("Save as PDF / Print", true);
		const doneBtn = mk("Done");
		const cleanup = () => {
			iframe.remove();
			closeBar.remove();
			URL.revokeObjectURL(url);
		};
		printBtn.onclick = () => {
			try {
				const w = iframe.contentWindow;
				w?.scrollTo(0, 0);
				window.setTimeout(() => {
					w?.focus();
					w?.print();
				}, 120);
			} catch {}
		};
		doneBtn.onclick = cleanup;
		closeBar.append(printBtn, doneBtn);
		document.body.append(iframe, closeBar);
		return true;
	} catch {
		if (window.open(url, "_blank")) {
			window.setTimeout(() => URL.revokeObjectURL(url), 6e4);
			return true;
		}
		URL.revokeObjectURL(url);
		return false;
	}
}
/**
* Export report — hybrid RvFOX Pro + CARFAX-structure dossier.
*/
async function exportVehicleReport(opts) {
	const id = opts.reportElementId ?? "rvfax-vehicle-report";
	const root = document.getElementById(id);
	if (!root) return {
		ok: false,
		error: "Report not found on screen."
	};
	const clone = sanitizeClone(root);
	clone.querySelectorAll("[data-no-export]").forEach((n) => n.remove());
	const filename = `${(opts.filenameBase || "RvFOX-Pro-Report").replace(/[^\w.-]+/g, "_")}.html`;
	const html = buildStandaloneHtml({
		title: opts.title,
		subtitle: opts.subtitle,
		bodyHtml: clone.innerHTML,
		meta: opts.meta
	});
	const native = isNative();
	const ios = isIOS();
	if (native || ios) {
		if (openHtmlPreview(html)) return {
			ok: true,
			method: "preview"
		};
		if (await shareFile(filename, html, opts.title)) return {
			ok: true,
			method: "share"
		};
		try {
			downloadBlob(filename, html);
			return {
				ok: true,
				method: "download"
			};
		} catch {
			return {
				ok: false,
				error: "Could not open the report."
			};
		}
	}
	try {
		if (openHtmlPreview(html)) return {
			ok: true,
			method: "preview"
		};
		document.body.classList.add("printing-rv-report");
		const scroller = document.getElementById("rvfax-report-scroll");
		const prev = [];
		const expand = (el) => {
			if (!el) return;
			prev.push({
				el,
				css: el.style.cssText
			});
			el.style.height = "auto";
			el.style.maxHeight = "none";
			el.style.overflow = "visible";
		};
		expand(scroller);
		expand(root);
		const after = () => {
			document.body.classList.remove("printing-rv-report");
			prev.forEach(({ el, css }) => {
				el.style.cssText = css;
			});
			window.removeEventListener("afterprint", after);
		};
		window.addEventListener("afterprint", after);
		window.scrollTo(0, 0);
		window.print();
		window.setTimeout(after, 3e3);
		return {
			ok: true,
			method: "print"
		};
	} catch {
		downloadBlob(filename, html);
		return {
			ok: true,
			method: "download"
		};
	}
}
//#endregion
export { liveMarketLadder as a, refreshCoachDossierCache as c, formatHardTorque as i, resolveHardPowertrain as l, fetchLiveDossier as n, mergeLiveIntoDisplay as o, formatHardHorsepower as r, peekVerifiedDossier as s, exportVehicleReport as t };
