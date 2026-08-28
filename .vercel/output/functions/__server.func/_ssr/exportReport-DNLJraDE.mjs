import { _ as weightForFloorplan, c as findPowertrainCorrection, d as sanitizeNarrativeForPin, f as findOemFloorplanSpec, g as overallInchesFromFloorplan, h as lengthFtFromFloorplan, l as powertrainConflictsWithPin, m as formatInchesAsFtIn, p as formatFloorplanLength, u as sanitizeFeaturesForPin } from "./router-B7uJEg2g.mjs";
import { t as Capacitor } from "../_libs/capacitor__core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exportReport-DNLJraDE.js
var STORAGE_KEY$1 = "rvfax.localSpecOverrides.v1";
var MAX = 300;
function canUseStorage$1() {
	try {
		return typeof localStorage !== "undefined";
	} catch {
		return false;
	}
}
function emptyStore$1() {
	return {
		version: 1,
		overrides: []
	};
}
function readStore$1() {
	if (!canUseStorage$1()) return emptyStore$1();
	try {
		const raw = localStorage.getItem(STORAGE_KEY$1);
		if (!raw) return emptyStore$1();
		const p = JSON.parse(raw);
		if (!p || p.version !== 1 || !Array.isArray(p.overrides)) return emptyStore$1();
		return p;
	} catch {
		return emptyStore$1();
	}
}
function writeStore$1(store) {
	if (!canUseStorage$1()) return;
	try {
		store.overrides = store.overrides.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)).slice(0, MAX);
		localStorage.setItem(STORAGE_KEY$1, JSON.stringify(store));
	} catch {}
}
function norm$1(s) {
	return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function matchKey(o, year, make, model, floorplan) {
	if (String(o.year) !== String(year).trim()) return false;
	if (norm$1(o.make) !== norm$1(make)) return false;
	if (norm$1(o.model) !== norm$1(model)) return false;
	const fp = norm$1(floorplan || "");
	const ofp = norm$1(o.floorplan || "");
	if (!ofp) return true;
	return ofp === fp;
}
function findLocalSpecOverride(year, make, model, floorplan) {
	const y = String(year).trim();
	const hits = readStore$1().overrides.filter((o) => matchKey(o, y, make, model, floorplan));
	if (!hits.length) return null;
	hits.sort((a, b) => {
		const af = (a.floorplan || "").length;
		const bf = (b.floorplan || "").length;
		if (bf !== af) return bf - af;
		return Date.parse(b.savedAt) - Date.parse(a.savedAt);
	});
	return hits[0] ?? null;
}
function saveLocalSpecOverride(input) {
	const store = readStore$1();
	const id = input.id || `${input.year}|${norm$1(input.make)}|${norm$1(input.model)}|${norm$1(input.floorplan || "")}`;
	const entry = {
		id,
		year: String(input.year).trim(),
		make: input.make.trim(),
		model: input.model.trim(),
		floorplan: (input.floorplan || "").trim(),
		engine: input.engine?.trim() || void 0,
		horsepower: input.horsepower != null && input.horsepower > 0 ? Math.round(input.horsepower) : void 0,
		torqueLbFt: input.torqueLbFt != null && input.torqueLbFt > 0 ? Math.round(input.torqueLbFt) : void 0,
		chassis: input.chassis?.trim() || void 0,
		transmission: input.transmission?.trim() || void 0,
		fuelType: input.fuelType?.trim() || void 0,
		note: input.note?.trim() || void 0,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		source: "user"
	};
	store.overrides = store.overrides.filter((o) => o.id !== id);
	store.overrides.unshift(entry);
	writeStore$1(store);
	return entry;
}
function removeLocalSpecOverride(id) {
	const store = readStore$1();
	const before = store.overrides.length;
	store.overrides = store.overrides.filter((o) => o.id !== id);
	writeStore$1(store);
	return store.overrides.length < before;
}
/** Map to PowertrainCorrection-shaped pin for existing pin pipelines */
function localOverrideAsPin(o) {
	if (!o.engine && o.horsepower == null) return null;
	const y = parseInt(o.year, 10) || 2020;
	return {
		yearMin: y,
		yearEnd: y,
		makeIncludes: o.make.toLowerCase(),
		modelIncludes: o.model.toLowerCase(),
		floorplanIncludes: o.floorplan || void 0,
		engine: o.engine || "Corrected engine",
		horsepower: o.horsepower && o.horsepower > 0 ? o.horsepower : 0,
		torqueLbFt: o.torqueLbFt,
		chassis: o.chassis,
		transmission: o.transmission,
		fuelType: o.fuelType === "Diesel" || o.fuelType === "Gas" || o.fuelType === "Propane" ? o.fuelType : void 0,
		note: o.note || "Local user correction"
	};
}
/**
* Engine-family vs chassis rules used by catalog bands AND Live merge.
* Stops a Cummins pusher year-band (or Live guess) from painting on a
* Sprinter / F53 / Transit coach — the Via 25T 2018 report failure mode.
*/
var CUMMINS_PUSHER = /\b(cummins|isl|l9|x15|x12|isx|powerglide)\b/i;
var CUMMINS_MID = /\b(isb|b6\.7)\b/i;
var MERCEDES_ENG = /\b(mercedes|om\d+|sprinter|3\.0l\s*v6|2\.0l\s*(i4|turbo)?)\b/i;
var F53_GAS = /\b(f-?53|godzilla|triton\s*v10|6\.8\s*l\s*v10)\b/i;
var PUSHER_CHASSIS = /\b(freightliner\s*xc|spartan|powerglide|tag\s*axle)\b/i;
function chassisLooksSprinter(chassis, engine) {
	const blob = `${chassis || ""} ${engine || ""}`;
	if (!/\b(sprinter|mercedes)\b/i.test(blob)) return false;
	if (PUSHER_CHASSIS.test(blob) || /\bf-?53\b/i.test(blob)) return false;
	return true;
}
function engineLooksCumminsHeavy(engine) {
	const e = engine || "";
	if (MERCEDES_ENG.test(e) && !CUMMINS_PUSHER.test(e)) return false;
	if (CUMMINS_PUSHER.test(e)) return true;
	if (CUMMINS_MID.test(e) && !MERCEDES_ENG.test(e)) return true;
	return false;
}
/**
* Returns a reason string if this engine cannot live on this chassis/coach.
* Null means compatible (or not enough signal to reject).
*/
function engineConflictsWithChassis(engine, chassis, extras) {
	const e = engine || "";
	if (!e.trim()) return null;
	const chassisBlob = `${chassis || ""} ${extras?.modelEngine || ""}`;
	const fuel = extras?.fuelType || "";
	const type = extras?.type || "";
	const sprinter = chassisLooksSprinter(chassis, extras?.modelEngine);
	const heavyCummins = engineLooksCumminsHeavy(e);
	const mercedesEng = MERCEDES_ENG.test(e);
	const f53Chassis = /\bf-?53\b/i.test(chassisBlob);
	const gasCoach = /^gas/i.test(fuel) || /class a gas/i.test(type) || F53_GAS.test(chassisBlob) && !/diesel/i.test(fuel);
	if (sprinter && heavyCummins && !mercedesEng) return "Cummins/ISL/ISB pusher engine cannot sit on a Mercedes Sprinter chassis";
	if (f53Chassis && heavyCummins) return "Cummins diesel cannot sit on a Ford F53 chassis";
	if (gasCoach && heavyCummins) return "Cummins diesel cannot sit on a gas Class A";
	if (PUSHER_CHASSIS.test(chassisBlob) && F53_GAS.test(e) && !/diesel/i.test(e)) return "Gas F53/Godzilla/V10 cannot sit on a diesel pusher chassis";
	return null;
}
function bandFitsCoach(spec, band) {
	if (engineConflictsWithChassis(band.engine, spec.chassis, {
		fuelType: spec.fuelType,
		type: spec.type,
		modelEngine: spec.engine
	})) return false;
	if (spec.engine && engineConflictsWithChassis(band.engine, spec.engine, {
		fuelType: spec.fuelType,
		type: spec.type
	})) return false;
	return true;
}
function mid([a, b]) {
	return (a + b) / 2;
}
function hashSeed(s) {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
	return Math.abs(h);
}
function pick(seed, arr) {
	return arr[seed % arr.length];
}
function fmtLbs(n) {
	return `${Math.round(n).toLocaleString()} lbs`;
}
function fmtGal(n) {
	return `${Math.round(n)} gal`;
}
function fmtFtIn(ft) {
	const whole = Math.floor(ft);
	const inches = Math.round((ft - whole) * 12);
	if (inches === 0) return `${whole}' 0"`;
	if (inches === 12) return `${whole + 1}' 0"`;
	return `${whole}' ${inches}"`;
}
function fmtInchesAsFtIn(totalIn) {
	const whole = Math.floor(totalIn / 12);
	const inches = Math.round(totalIn - whole * 12);
	if (inches === 0) return `${whole}' 0"`;
	if (inches === 12) return `${whole + 1}' 0"`;
	return `${whole}' ${inches}"`;
}
function normFp(fp) {
	return (fp || "").toLowerCase().replace(/[\s\-_/]/g, "");
}
function bandMatchesFloorplan(b, floorplan) {
	const fp = normFp(floorplan);
	if (b.excludeFloorplans?.length && fp) {
		if (b.excludeFloorplans.some((x) => fp.includes(normFp(x)) || normFp(x).includes(fp))) return false;
	}
	if (!b.floorplans?.length) return true;
	if (!fp) return false;
	return b.floorplans.some((x) => {
		const n = normFp(x);
		if (!n) return false;
		if (fp === n) return true;
		if (n.length >= 3 && (fp.includes(n) || n.includes(fp))) return true;
		if (n.length === 2 && /^\d{2}$/.test(n) && /^\d{2}/.test(fp)) return fp.startsWith(n);
		if (/[a-z]/i.test(n) && (fp.includes(n) || n.includes(fp))) return true;
		return false;
	});
}
/**
* Pick the powertrain year band for a model year (+ optional floorplan).
* 1) Floorplan-specific exact year match (preferred)
* 2) Model-wide exact year match
* 3) Nearest band within 3 years (floorplan-specific first)
* Never silently invents a modern top-level engine as "this year".
*/
function pickPowertrainBand(spec, year, floorplan) {
	const bands = spec.powertrainByYear;
	if (!bands?.length) return null;
	const y = typeof year === "number" ? year : parseInt(String(year), 10);
	if (!Number.isFinite(y)) return null;
	const usable = bands.filter((b) => bandFitsCoach(spec, b));
	if (!usable.length) return null;
	const inYear = usable.filter((b) => y >= b.from && y <= b.to);
	if (inYear.length) {
		const fpHits = inYear.filter((b) => b.floorplans?.length && bandMatchesFloorplan(b, floorplan || ""));
		if (fpHits.length) {
			const scored = fpHits.map((b) => {
				const fp = normFp(floorplan || "");
				let best = 0;
				for (const x of b.floorplans || []) {
					const n = normFp(x);
					if (!n) continue;
					if (fp === n) best = Math.max(best, 100 + n.length);
					else if (fp.startsWith(n) && n.length === 2) best = Math.max(best, 50);
					else if (n.length >= 3 && fp.includes(n)) best = Math.max(best, 80 + n.length);
				}
				return {
					b,
					best
				};
			});
			scored.sort((a, c) => c.best - a.best);
			return scored[0].b;
		}
		const wide = inYear.filter((b) => !b.floorplans?.length && bandMatchesFloorplan(b, floorplan || ""));
		if (wide.length) return wide[0];
	}
	let best = null;
	let bestDist = Infinity;
	let bestScore = -1;
	for (const b of usable) {
		if (!bandMatchesFloorplan(b, floorplan || "")) continue;
		const dist = y < b.from ? b.from - y : y > b.to ? y - b.to : 0;
		const score = b.floorplans?.length ? 2 : 1;
		if (dist < bestDist || dist === bestDist && score > bestScore) {
			bestDist = dist;
			bestScore = score;
			best = b;
		}
	}
	if (best && bestDist <= 3 && bandFitsCoach(spec, best)) return best;
	return null;
}
/** Merge year-banded OEM facts onto a resolved snapshot */
function resolveYearSnapshot(spec, year, floorplan) {
	const y = parseInt(year, 10);
	const resolvedYear = Number.isFinite(y) && y >= 1980 && y <= 2100 ? y : 2020;
	const band = pickPowertrainBand(spec, resolvedYear, floorplan);
	const yearTruePowertrain = !!band;
	return {
		engine: band?.engine ?? spec.engine,
		chassis: band?.chassis ?? spec.chassis,
		horsepower: band?.horsepower != null && band.horsepower > 0 ? band.horsepower : spec.horsepower,
		torqueLbFt: band?.torqueLbFt != null && band.torqueLbFt > 0 ? band.torqueLbFt : spec.torqueLbFt,
		transmission: band?.transmission ?? spec.transmission,
		towingCapacity: band?.towingCapacity ?? spec.towingCapacity,
		fuelCapacityGal: band?.fuelCapacityGal ?? spec.fuelCapacityGal,
		generator: band?.generator ?? spec.generator,
		gvwrLbs: band?.gvwrLbs ?? spec.gvwrLbs,
		exteriorHeightIn: band?.exteriorHeightIn ?? spec.exteriorHeightIn,
		exteriorWidthIn: band?.exteriorWidthIn ?? spec.exteriorWidthIn,
		overallLengthIn: band?.overallLengthIn ?? spec.overallLengthIn,
		freshWater: band?.freshWater ?? spec.freshWater,
		grayWater: band?.grayWater ?? spec.grayWater,
		blackWater: band?.blackWater ?? spec.blackWater,
		ceilingHeight: band?.ceilingHeight ?? spec.ceilingHeight,
		slideouts: band?.slideouts ?? spec.slideouts,
		sleeps: band?.sleeps ?? spec.sleeps,
		mpgHighwayEst: spec.mpgHighwayEst,
		uvwLbs: spec.uvwLbs,
		cccLbs: spec.cccLbs,
		notes: band?.notes,
		band,
		yearTruePowertrain,
		resolvedYear
	};
}
function economy(spec, seed, gvwr, mpgOverride) {
	const t = spec.type.toLowerCase();
	const diesel = /diesel/i.test(spec.fuelType) || /diesel/i.test(spec.engine ?? "");
	if (t.includes("travel trailer") || t.includes("fifth") || t.includes("toy hauler") || t.includes("truck camper") || /towable/i.test(spec.fuelType)) return {
		city: 0,
		hwy: 0,
		combined: 0,
		note: "Tow vehicle dependent — MPG set by tow vehicle + load",
		fuelGal: 0
	};
	let city = 8;
	let hwy = 10;
	let fuelGal = 80;
	if (t.includes("class b")) {
		city = diesel ? 16 + seed % 3 : 14 + seed % 3;
		hwy = diesel ? 20 + seed % 3 : 17 + seed % 3;
		fuelGal = diesel ? 24 + seed % 6 : 25 + seed % 5;
	} else if (t.includes("class c") && !t.includes("super")) {
		city = diesel ? 12 + seed % 2 : 9 + seed % 2;
		hwy = diesel ? 16 + seed % 2 : 12 + seed % 2;
		fuelGal = diesel ? 26 + seed % 4 : 55 + seed % 10;
	} else if (t.includes("super c")) {
		if (diesel) {
			if (gvwr > 36e3) {
				city = 7 + seed % 2;
				hwy = 9 + seed % 2;
				fuelGal = 90 + seed % 20;
			} else {
				city = 8 + seed % 2;
				hwy = 11 + seed % 2;
				fuelGal = 70 + seed % 15;
			}
		} else {
			city = 7;
			hwy = 9;
			fuelGal = 68 + seed % 12;
		}
	} else if (t.includes("class a")) {
		if (diesel) {
			if (gvwr > 52e3) {
				city = 5 + seed % 2;
				hwy = 7 + seed % 2;
				fuelGal = 140 + seed % 20;
			} else if (gvwr > 4e4) {
				city = 6 + seed % 2;
				hwy = 8 + seed % 2;
				fuelGal = 120 + seed % 20;
			} else {
				city = 7 + seed % 2;
				hwy = 9 + seed % 2;
				fuelGal = 100 + seed % 20;
			}
		} else {
			city = 6 + seed % 2;
			hwy = 8 + seed % 2;
			fuelGal = 80 + seed % 20;
		}
	} else {
		city = diesel ? 10 : 8;
		hwy = diesel ? 13 : 10;
		fuelGal = 60;
	}
	if (mpgOverride && mpgOverride > 0) {
		hwy = Math.round(mpgOverride);
		city = Math.max(4, Math.round(mpgOverride * .85));
	}
	const combined = Math.round((city + hwy) / 2 * 10) / 10;
	return {
		city,
		hwy,
		combined,
		note: diesel ? "Est. loaded highway MPG — diesel; terrain & load vary" : "Est. loaded highway MPG — gas; terrain & load vary",
		fuelGal
	};
}
function parseHp(engine, hp) {
	if (hp != null && Number.isFinite(hp) && hp > 0) return `${Math.round(hp)} HP`;
	if (!engine || !engine.trim()) return "Varies by option / year — confirm brochure";
	const eng = engine.trim();
	const hpMentions = [...eng.matchAll(/(\d{2,4})\s*HP/gi)].map((m) => m[1]);
	const looksMulti = /[·|]/.test(eng) || /\bor\b/i.test(eng) || /by (year|option|chassis|floorplan)/i.test(eng) || hpMentions.length >= 2;
	if (looksMulti && hpMentions.length >= 2) return `Varies (${[...new Set(hpMentions)].join("–")} HP by option)`;
	if (looksMulti && hpMentions.length === 0) return "Varies by option / year — confirm brochure";
	const range = eng.match(/(\d{2,4})\s*[–—\-to]+\s*(\d{2,4})\s*HP/i);
	if (range) return `${range[1]}–${range[2]} HP (by option)`;
	const m = eng.match(/(\d{2,4})\s*HP/i);
	if (m) return `${m[1]} HP`;
	if (/V10|Triton/i.test(eng)) return "305–362 HP (by year) — confirm brochure";
	if (/7\.3L|Godzilla/i.test(eng)) return "335–350 HP (by application) — confirm brochure";
	if (/EcoBoost/i.test(eng)) return "Varies by option / year — confirm brochure";
	if (/Cummins|Power Stroke|Duramax|ISB|B6\.7|L9|ISL|X15|X12|Cat /i.test(eng)) return "Varies by option / year — confirm brochure";
	return "Varies by option / year — confirm brochure";
}
function torqueFor(engine, diesel, torqueLbFt, hpNum) {
	if (torqueLbFt && torqueLbFt > 0) return `${torqueLbFt.toLocaleString()} lb-ft`;
	if (!engine) return "—";
	if (/x15/i.test(engine)) return "1,850–1,950 lb-ft (X15 class)";
	if (/x12/i.test(engine)) return "1,700 lb-ft (typ. X12)";
	if (/l9/i.test(engine) && /450/i.test(engine)) return "1,250 lb-ft (L9 450)";
	if (/l9/i.test(engine) && /380/i.test(engine)) return "1,150 lb-ft (L9 380)";
	if (/l9/i.test(engine)) return "1,150–1,250 lb-ft (L9 class — confirm option)";
	if (/isl\s*8|isl\b/i.test(engine) && !/isb/i.test(engine)) return "1,050–1,250 lb-ft (ISL class — confirm year)";
	if (/b6\.7|isb/i.test(engine)) return "800 lb-ft (B6.7 / ISB class)";
	if (/godzilla|7\.3/i.test(engine)) return "468 lb-ft (typ. 7.3 Godzilla)";
	if (/v10|triton/i.test(engine)) return "460 lb-ft (typ. V10)";
	if (/power\s*stroke|6\.7/i.test(engine) && /ford/i.test(engine)) return "750–1,050 lb-ft (Power Stroke — confirm)";
	if (/sprinter|mercedes|2\.0l/i.test(engine)) return "332–350 lb-ft (Sprinter class)";
	if (/[·|]/.test(engine) || /\bor\b/i.test(engine) || /by (year|option)/i.test(engine) || /\d+\s*[–—\-]\s*\d+\s*HP/i.test(engine)) return "Varies by option / year — confirm brochure";
	const m = engine.match(/(\d{3,4})\s*HP/i);
	const hp = hpNum != null && hpNum > 0 ? hpNum : m ? parseInt(m[1], 10) : null;
	if (hp == null) return "Varies by option / year — confirm brochure";
	if (diesel) {
		if (hp >= 580) return "1,950 lb-ft (typ. X15 class)";
		if (hp >= 480) return "1,700 lb-ft (typ. X12 class)";
		if (hp >= 400) return "1,250 lb-ft (typ. L9 class)";
		if (hp >= 340 && hp <= 380) return "800 lb-ft (typ. B6.7 / ISB)";
		return "Varies by option / year — confirm brochure";
	}
	if (/7\.3L|Godzilla/i.test(engine)) return "468 lb-ft (typ.)";
	if (/V10|Triton/i.test(engine)) return "460 lb-ft (typ. V10)";
	return "Varies by option / year — confirm brochure";
}
function transmissionFor(spec, diesel, override) {
	if (override) return override;
	const t = spec.type.toLowerCase();
	if (t.includes("travel") || t.includes("fifth") || t.includes("toy")) return "N/A (towable)";
	if (/Sprinter|Mercedes/i.test(spec.chassis ?? "") || /Mercedes/i.test(spec.engine ?? "")) return "9G-Tronic Auto";
	if (/Ford F53|F-53/i.test(spec.chassis ?? "")) return "TorqShift 6-spd Auto";
	if (diesel && t.includes("class a")) return "Allison 3000/4000 6-spd";
	if (/F-550|F-600|Super C/i.test(spec.chassis ?? "") || t.includes("super c")) return "TorqShift 10-spd Auto";
	return diesel ? "Allison Automatic" : "6-spd Automatic";
}
function buildBrochureSpecs(spec, year, make = "", model = "", floorplan = "") {
	const seed = hashSeed(`${make}|${model}|${year}|${floorplan}|${spec.type}`);
	const snapBase = resolveYearSnapshot(spec, year, floorplan);
	const local = findLocalSpecOverride(year, make, model, floorplan);
	const correction = (local ? localOverrideAsPin(local) : null) || findPowertrainCorrection(year, make, model, floorplan);
	const snap = correction ? {
		...snapBase,
		engine: correction.engine ?? snapBase.engine,
		horsepower: correction.horsepower > 0 ? correction.horsepower : snapBase.horsepower,
		torqueLbFt: correction.torqueLbFt ?? snapBase.torqueLbFt,
		chassis: correction.chassis ?? snapBase.chassis,
		transmission: correction.transmission ?? snapBase.transmission,
		yearTruePowertrain: true,
		notes: correction.note ? [snapBase.notes, correction.note].filter(Boolean).join(" · ") : snapBase.notes
	} : snapBase;
	const diesel = /diesel/i.test(spec.fuelType) || /diesel/i.test(snap.engine ?? "");
	const oem = findOemFloorplanSpec(year, make, model, floorplan);
	const fpLen = oem ? Math.round(oem.overallLengthIn / 12) : lengthFtFromFloorplan(floorplan, spec.lengthRange, {
		make,
		model
	});
	const fpInches = oem ? oem.overallLengthIn : overallInchesFromFloorplan(floorplan, spec.lengthRange, {
		make,
		model,
		type: spec.type
	});
	const w = weightForFloorplan(floorplan, spec.weightRange, spec.lengthRange, {
		make,
		model
	});
	const gvwrMid = oem?.gvwrLbs ?? snap.gvwrLbs ?? w.mid;
	const uvw = oem?.uvwLbs ?? snap.uvwLbs ?? w.uvwEst;
	const ccc = oem != null ? Math.max(800, oem.gvwrLbs - oem.uvwLbs) : snap.cccLbs ?? w.cccEst;
	const lenMid = fpInches != null ? fpInches / 12 : fpLen ?? (floorplan ? mid(spec.lengthRange) : mid(spec.lengthRange));
	const sprinterCoach = chassisLooksSprinter(spec.chassis, spec.engine);
	const widthIn = oem?.exteriorWidthIn ?? snap.exteriorWidthIn ?? (sprinterCoach || /class b/i.test(spec.type) ? 90.5 : 101.5);
	const heightIn = oem?.exteriorHeightIn ?? snap.exteriorHeightIn ?? Math.round((/class b/i.test(spec.type) ? 9.6 : sprinterCoach ? 11 : /class a|super c/i.test(spec.type) ? 12.75 : 11.5) * 12);
	const intH = oem?.interiorHeightIn ?? snap.ceilingHeight ?? spec.ceilingHeight ?? 80;
	const isTowable = /travel trailer|fifth|toy hauler|truck camper/i.test(spec.type) || /towable/i.test(spec.fuelType);
	const hasGarageData = Boolean(oem?.garageLengthFt || spec.garageLengthFt || spec.garageWidthFt || spec.garageHeightIn || spec.garageFits);
	const isToyHauler = /toy hauler/i.test(spec.type) || hasGarageData;
	const hitchPct = /fifth/i.test(spec.type) || isToyHauler ? .2 : .12;
	const towCap = snap.towingCapacity ?? 0;
	const hitch = oem?.hitchLbs ? oem.hitchLbs : isTowable ? gvwrMid * hitchPct : towCap;
	const propane = oem?.propaneLbs ? oem.propaneLbs : isTowable ? 40 + seed % 40 : /class b/i.test(spec.type) ? 16 + seed % 10 : 40 + seed % 40;
	const eco = economy(spec, seed, gvwrMid, snap.mpgHighwayEst);
	const fuelGal = isTowable ? 0 : snap.fuelCapacityGal && snap.fuelCapacityGal > 0 ? snap.fuelCapacityGal : eco.fuelGal || (diesel ? 100 : 80);
	const range = eco.combined > 0 && fuelGal > 0 ? Math.round(eco.combined * fuelGal) : 0;
	const wb = lenMid > 40 ? 266 + seed % 20 : lenMid > 32 ? 228 + seed % 16 : lenMid > 24 ? 178 + seed % 14 : 144 + seed % 12;
	const electrical = /class a|super c|fifth|toy/i.test(spec.type) ? "50 amp" : /class b/i.test(spec.type) ? "30 amp" : pick(seed, ["30 amp", "50 amp"]);
	const gLen = oem?.garageLengthFt ?? spec.garageLengthFt ?? 0;
	const gWidth = oem?.garageWidthFt ?? spec.garageWidthFt ?? 0;
	const gHeight = oem?.garageHeightIn ?? spec.garageHeightIn ?? 0;
	const gCap = oem?.garageCapacityLbs ?? spec.garageCapacityLbs ?? 0;
	const ramp = spec.rampWidthFt ?? 0;
	const fuelStation = oem?.fuelStationGal ?? spec.fuelStationGal ?? 0;
	const genFuel = spec.generatorFuelGal ?? 0;
	const lengthDisplay = oem?.lengthDisplay ? oem.lengthDisplay : fpInches != null ? formatInchesAsFtIn(fpInches) : snap.overallLengthIn ? fmtInchesAsFtIn(snap.overallLengthIn) : floorplan ? formatFloorplanLength(floorplan, spec.lengthRange, {
		make,
		model,
		type: spec.type
	}) : spec.lengthRange[0] === spec.lengthRange[1] ? fmtInchesAsFtIn(spec.lengthRange[0] * 12) : `${spec.lengthRange[0]}–${spec.lengthRange[1]} ft`;
	const gvwrDisplay = oem?.gvwrLbs ? fmtLbs(oem.gvwrLbs) : snap.gvwrLbs ? fmtLbs(snap.gvwrLbs) : floorplan ? w.gvwr : `${spec.weightRange[0].toLocaleString()}–${spec.weightRange[1].toLocaleString()} lbs`;
	let engineLabel = snap.engine ?? (isTowable ? "N/A (towable)" : "See chassis");
	if (engineLabel.includes("(or prior") && parseInt(year, 10) >= 2021) engineLabel = engineLabel.replace(/\s*\(or prior[^)]*\)/i, "").trim();
	const hpDisplay = isTowable ? "N/A" : parseHp(snap.engine, snap.horsepower);
	const safeHpDisplay = !isTowable && /^450\s*HP$/i.test(hpDisplay.trim()) && !(snap.horsepower === 450) && !/450\s*HP/i.test(snap.engine || "") ? "Varies by option / year — confirm brochure" : hpDisplay;
	const dataSource = oem ? "oem-year" : local ? "oem-year" : correction ? "oem-year" : snap.band ? "oem-year" : snap.engine || snap.fuelCapacityGal || snap.gvwrLbs ? "catalog" : "estimated";
	const yearLabel = String(snap.resolvedYear || year);
	const hpMissingNote = !isTowable && (snap.horsepower == null || !Number.isFinite(snap.horsepower) || snap.horsepower <= 0) && /varies|confirm brochure/i.test(safeHpDisplay) ? `Horsepower not fixed for ${yearLabel} — engine shown; HP varies by option or year. Confirm OEM brochure / door sticker.` : null;
	const noBandNote = !isTowable && !snap.band && !correction && snap.engine ? `No year-band powertrain for ${yearLabel} — showing catalog default; confirm brochure for this model year.` : null;
	const accuracyNote = oem?.note || snap.notes || (local ? `Local correction for ${yearLabel}${local.note ? ` · ${local.note}` : ""} · exportable pin.` : null) || hpMissingNote || noBandNote || (dataSource === "estimated" ? "Some fields estimated from class averages — verify against OEM brochure / VIN." : dataSource === "oem-year" ? `Year-true OEM facts for ${yearLabel}${floorplan ? ` · floorplan ${floorplan}` : ""}${correction ? " · verified powertrain patch" : ""}${snap.band ? ` · band ${snap.band.from}–${snap.band.to}` : ""}${oem?.source ? ` · ${oem.source}` : ""}.` : `Catalog brochure fields for ${yearLabel}.`);
	return {
		lengthFt: lengthDisplay,
		lengthIn: lengthDisplay,
		exteriorWidth: fmtInchesAsFtIn(widthIn),
		exteriorHeight: fmtInchesAsFtIn(heightIn),
		interiorHeight: `${intH}" (${fmtFtIn(intH / 12)})`,
		wheelbase: isTowable ? "N/A (towable)" : `${wb}"`,
		gvwr: gvwrDisplay,
		uvw: fmtLbs(uvw),
		ccc: fmtLbs(ccc),
		gcwr: isTowable ? "Set by tow vehicle" : fmtLbs(gvwrMid + (towCap || (diesel ? 1e4 : 5e3))),
		hitchOrPin: isTowable ? fmtLbs(hitch) : towCap ? fmtLbs(towCap) : "—",
		hitchLabel: isTowable ? /fifth/i.test(spec.type) || isToyHauler ? oem?.hitchLbs ? "Pin Weight (brochure)" : "Pin Weight (est.)" : oem?.hitchLbs ? "Tongue Weight (brochure)" : "Tongue Weight (est.)" : "Tow Capacity",
		fuelType: spec.fuelType,
		engine: engineLabel,
		horsepower: safeHpDisplay,
		torque: isTowable ? "N/A" : torqueFor(snap.engine, diesel, snap.torqueLbFt, snap.horsepower),
		transmission: transmissionFor(spec, diesel, snap.transmission),
		chassis: snap.chassis ?? (isTowable ? "Towable frame" : "Manufacturer chassis"),
		mpgCity: eco.city ? `${eco.city}` : "—",
		mpgHighway: eco.hwy ? `${eco.hwy}` : "—",
		mpgCombined: eco.combined ? `${eco.combined}` : "Tow vehicle",
		mpgNote: eco.note,
		fuelCapacity: fuelGal ? fmtGal(fuelGal) : "N/A (towable)",
		rangeMiles: range ? `~${range.toLocaleString()} mi` : "Tow vehicle",
		sleeps: String(oem?.sleeps ?? snap.sleeps ?? spec.sleeps),
		slideouts: String(oem?.slideouts ?? snap.slideouts ?? spec.slideouts),
		seatBelts: String(Math.min((snap.sleeps ?? spec.sleeps) + 1, /class b/i.test(spec.type) ? 4 : (snap.sleeps ?? spec.sleeps) + 2)),
		awning: spec.awningLength ? `${spec.awningLength} ft power awning` : `${Math.max(12, Math.round(lenMid * .45))} ft (typ.)`,
		freshWater: fmtGal(oem?.freshWater ?? snap.freshWater ?? 40 + seed % 40),
		grayWater: fmtGal(oem?.grayWater ?? snap.grayWater ?? 30 + seed % 30),
		blackWater: fmtGal(oem?.blackWater ?? snap.blackWater ?? 28 + seed % 28),
		propane: `${propane} lb`,
		waterHeater: pick(seed, [
			"6 gal gas/electric",
			"10 gal gas/electric",
			"Tankless on-demand",
			"16 gal gas/electric"
		]),
		generator: snap.generator ?? (isToyHauler ? "Generator prep / optional Onan 4–5.5kW" : isTowable ? "Optional" : "See options"),
		electricalService: electrical,
		acUnits: pick(seed, [
			"1 × 13,500 BTU",
			"1 × 15,000 BTU",
			"2 × 15,000 BTU",
			"3 × 15,000 BTU"
		]),
		furnaceBtu: pick(seed, [
			"20,000 BTU",
			"30,000 BTU",
			"35,000 BTU",
			"40,000 BTU"
		]),
		converter: electrical.includes("50") ? "60–80 amp" : "45–55 amp",
		axles: oem?.axles ? oem.axles : isTowable ? gvwrMid > 1e4 ? "Triple axle" : "Tandem axle" : /class b/i.test(spec.type) ? "Single rear" : "Tag axle (when equipped)",
		tireSize: oem?.tireSize ? oem.tireSize : pick(seed, [
			"225/75R16",
			"235/80R22.5",
			"255/70R22.5",
			"275/70R22.5",
			"ST235/80R16"
		]),
		type: spec.type,
		warranty: spec.warrantyYears ? `${spec.warrantyYears}-yr limited / structural varies` : "1-yr limited · structural per OEM",
		construction: pick(seed, [
			"Aluminum frame · laminated walls",
			"Vacuum-bonded walls · aluminum framing",
			"Steel cage · composite walls",
			"Welded aluminum superstructure"
		]),
		accuracyNote,
		dataSource,
		isToyHauler,
		garageLength: gLen ? `${fmtFtIn(gLen)} deep` : isToyHauler ? "Varies by floorplan — confirm brochure" : "—",
		garageWidth: gWidth ? `${fmtFtIn(gWidth)} clear` : isToyHauler ? "Varies — confirm brochure" : "—",
		garageHeight: gHeight ? `${gHeight}" clear` : isToyHauler ? "Varies — confirm brochure" : "—",
		garageCapacity: gCap ? fmtLbs(gCap) : isToyHauler ? "Varies by floorplan — confirm brochure" : "—",
		rampWidth: ramp ? `${fmtFtIn(ramp)} ramp door` : isToyHauler ? "Ramp door — confirm brochure" : "—",
		fuelStation: isToyHauler ? fuelStation ? `${fuelStation} gal fuel station` : "Confirm fuel-station option" : "—",
		generatorFuel: isToyHauler ? genFuel ? `${genFuel} gal (gen / station shared often)` : "See generator package" : "—",
		garageFits: spec.garageFits ?? (isToyHauler ? "See floorplan — typically 1 UTV or dual bikes" : "—")
	};
}
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
      <span><strong>RvFOX Pro</strong> · Know Before You Buy</span>
      <span>Motorcoach intelligence</span>
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
export { formatHardHorsepower as a, mergeLiveIntoDisplay as c, removeLocalSpecOverride as d, resolveHardPowertrain as f, findLocalSpecOverride as i, peekVerifiedDossier as l, exportVehicleReport as n, formatHardTorque as o, saveLocalSpecOverride as p, fetchLiveDossier as r, liveMarketLadder as s, buildBrochureSpecs as t, refreshCoachDossierCache as u };
