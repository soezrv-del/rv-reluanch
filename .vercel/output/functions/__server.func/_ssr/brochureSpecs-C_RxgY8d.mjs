import { _ as weightForFloorplan, c as findPowertrainCorrection, f as findOemFloorplanSpec, g as overallInchesFromFloorplan, h as lengthFtFromFloorplan, m as formatInchesAsFtIn, p as formatFloorplanLength } from "./router-Bq88JwJI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brochureSpecs-C_RxgY8d.js
var STORAGE_KEY = "rvfax.localSpecOverrides.v1";
var MAX = 300;
function canUseStorage() {
	try {
		return typeof localStorage !== "undefined";
	} catch {
		return false;
	}
}
function emptyStore() {
	return {
		version: 1,
		overrides: []
	};
}
function readStore() {
	if (!canUseStorage()) return emptyStore();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyStore();
		const p = JSON.parse(raw);
		if (!p || p.version !== 1 || !Array.isArray(p.overrides)) return emptyStore();
		return p;
	} catch {
		return emptyStore();
	}
}
function writeStore(store) {
	if (!canUseStorage()) return;
	try {
		store.overrides = store.overrides.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)).slice(0, MAX);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch {}
}
function norm(s) {
	return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function matchKey(o, year, make, model, floorplan) {
	if (String(o.year) !== String(year).trim()) return false;
	if (norm(o.make) !== norm(make)) return false;
	if (norm(o.model) !== norm(model)) return false;
	const fp = norm(floorplan || "");
	const ofp = norm(o.floorplan || "");
	if (!ofp) return true;
	return ofp === fp;
}
function findLocalSpecOverride(year, make, model, floorplan) {
	const y = String(year).trim();
	const hits = readStore().overrides.filter((o) => matchKey(o, y, make, model, floorplan));
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
	const store = readStore();
	const id = input.id || `${input.year}|${norm(input.make)}|${norm(input.model)}|${norm(input.floorplan || "")}`;
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
	writeStore(store);
	return entry;
}
function removeLocalSpecOverride(id) {
	const store = readStore();
	const before = store.overrides.length;
	store.overrides = store.overrides.filter((o) => o.id !== id);
	writeStore(store);
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
	const classAGasNoTag = /class\s*a/i.test(spec.type) && !/diesel/i.test(spec.type) && (/gas/i.test(spec.type) || /gas/i.test(spec.fuelType));
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
		axles: classAGasNoTag ? "Steer + dual rear (no tag)" : oem?.axles ? oem.axles : isTowable ? gvwrMid > 1e4 ? "Triple axle" : "Tandem axle" : /class b/i.test(spec.type) ? "Single rear" : /class c/i.test(spec.type) && !/super/i.test(spec.type) ? "Steer + dual rear (no tag)" : "Tag axle (when equipped)",
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
//#endregion
export { removeLocalSpecOverride as a, localOverrideAsPin as i, engineConflictsWithChassis as n, saveLocalSpecOverride as o, findLocalSpecOverride as r, buildBrochureSpecs as t };
