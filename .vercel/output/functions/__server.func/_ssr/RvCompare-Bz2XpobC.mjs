import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as ArrowLeft, U as LoaderCircle, Z as GitCompare, k as Printer, l as Trophy, ot as Download, y as Sparkles } from "../_libs/lucide-react.mjs";
import { p as cn } from "./routes-DxgqAedY.mjs";
import { i as SuiteBackdrop } from "./SuitePage-CCsMenKq.mjs";
import { f as findOemFloorplanSpec, s as unverifiedLayoutLabel } from "./router-B7uJEg2g.mjs";
import { c as compareSelectionKey, d as formatMoney, u as estimateMarket, x as ratingFor } from "./catalog-DMGYLcQX.mjs";
import { a as formatHardHorsepower, c as mergeLiveIntoDisplay, f as resolveHardPowertrain, l as peekVerifiedDossier, n as exportVehicleReport, o as formatHardTorque, r as fetchLiveDossier, s as liveMarketLadder, t as buildBrochureSpecs } from "./exportReport-DNLJraDE.mjs";
import { t as RV_CARD_MEDIA } from "./RvFaxApp-BscTAMC_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvCompare-Bz2XpobC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function keyOf(r) {
	return compareSelectionKey(r);
}
function shortTitle(r) {
	return `${r.year} ${r.make.split(" ")[0]} ${r.model}${r.floorplan ? ` ${r.floorplan}` : ""}`;
}
function parseNum(s) {
	if (s == null || s === "" || s === "—") return null;
	if (typeof s === "number") return Number.isFinite(s) ? s : null;
	const m = String(s).replace(/[$,]/g, "").replace(/[^\d.-]/g, " ").match(/-?\d+(?:\.\d+)?/);
	if (!m) return null;
	const n = parseFloat(m[0]);
	return Number.isFinite(n) ? n : null;
}
function parseRangeMid(s) {
	const nums = String(s).replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
	if (!nums?.length) return null;
	const vals = nums.map(Number).filter((n) => Number.isFinite(n));
	if (!vals.length) return null;
	if (vals.length === 1) return vals[0];
	return (Math.min(...vals) + Math.max(...vals)) / 2;
}
function tones(values, direction) {
	if (direction === "neutral") return values.map((v) => v == null ? "na" : "equal");
	const present = values.map((v, i) => v != null ? {
		v,
		i
	} : null).filter(Boolean);
	if (present.length < 2) return values.map((v) => v == null ? "na" : "equal");
	const best = direction === "higher" ? Math.max(...present.map((p) => p.v)) : Math.min(...present.map((p) => p.v));
	const worst = direction === "higher" ? Math.min(...present.map((p) => p.v)) : Math.max(...present.map((p) => p.v));
	if (Math.abs(best - worst) < Math.max(.05, Math.abs(best) * .005)) return values.map((v) => v == null ? "na" : "equal");
	return values.map((v) => {
		if (v == null) return "na";
		if (v === best) return "better";
		if (v === worst) return "worse";
		return "equal";
	});
}
function row(id, label, direction, pairs) {
	const t = tones(pairs.map((p) => p.raw), direction);
	return {
		id,
		label,
		direction,
		cells: pairs.map((p, i) => ({
			value: p.display,
			raw: p.raw,
			tone: t[i]
		}))
	};
}
/** Brand / model prestige for compare when live ratings collapse to one number */
function prestigeScore(make, model) {
	const s = `${make} ${model}`.toLowerCase();
	if (/prevost|newell|marathon|liberty coach|foretravel|american dream|allegro bus|anthem|cornerstone|london aire|mountain aire|dutch star|ventana limited|encante/.test(s)) {
		if (/allegro bus|american dream|anthem|cornerstone|prevost|newell/.test(s)) return 96;
		if (/dutch star|london aire|mountain aire|ventana limited/.test(s)) return 93;
		return 90;
	}
	if (/tiffin|newmar|entegra|american coach|fleetwood discovery lxe|monaco|holiday rambler|renegade|brinkley|jayco|winnebago/.test(s)) {
		if (/tiffin|newmar|entegra|american coach/.test(s)) return 86;
		return 78;
	}
	if (/class a|diesel|pusher|powerglide|spartan/.test(s)) return 72;
	return 65;
}
/**
* High-line diesel pushers often list L9 450 standard with X15 605 optional.
* Show base + option when the brochure/live line doesn't already spell it out.
*/
function hpDisplayAndRank(engine, hpStr, make, model, year) {
	const baseHp = parseNum(hpStr);
	const blob = `${engine} ${hpStr}`.toLowerCase();
	const y = parseInt(year, 10) || 0;
	const mm = `${make} ${model}`.toLowerCase();
	const alreadyDual = /\bopt(?:ion(?:al)?)?\b|\bstd\b|\bstandard\b|\/\s*605|605\s*\/|450\s*[–—-]\s*605|450\s*or\s*605/.test(blob);
	const highLineDiesel = y >= 2018 && y <= 2027 && (/allegro bus|american dream|american eagle|dutch star|anthem|cornerstone|ventana|london aire|mountain aire|discovery lxe|embassy|aspire|phoebe|phoebe|allegro red|phaeton/.test(mm) || /cummins\s*(l9|isl|isx|x12|x15)/i.test(engine));
	const mentions605 = /\b605\b/.test(blob) || /x15/i.test(blob);
	const mentions450 = /\b450\b/.test(blob) || /l9|isl\b/i.test(blob) || baseHp === 450;
	let display = hpStr && hpStr !== "—" ? hpStr : "—";
	let engineDisplay = engine && engine !== "—" ? engine : "—";
	let raw = baseHp;
	if (highLineDiesel && !alreadyDual) {
		if (mentions450 && !mentions605 && baseHp != null && baseHp <= 500) {
			display = `${baseHp} HP std · 605 HP opt`;
			if (!/x15|605/i.test(engineDisplay)) engineDisplay = /l9|isl/i.test(engineDisplay) ? `${engineDisplay.replace(/\s*$/, "")} (X15 605 opt)` : `${engineDisplay} · X15 605 opt`;
			raw = baseHp;
		} else if (mentions605 && baseHp != null && baseHp >= 550) {
			if (!/std|opt|450/.test(blob)) display = `${baseHp} HP (often 450 std · 605 opt on series)`;
			raw = baseHp;
		} else if (baseHp != null && baseHp >= 400 && baseHp <= 500 && highLineDiesel) {
			display = `${baseHp} HP std · 605 HP opt`;
			raw = baseHp;
		}
	}
	if (display !== "—" && !/hp/i.test(display) && baseHp != null) display = `${display} HP`;
	return {
		display,
		raw,
		engineDisplay
	};
}
/**
* Live Grok often returns the same 4.6 for every luxury diesel.
* Force a spread using prestige + power + residual signals so green/red mean something.
*/
function finalizeRatings(bases, signals) {
	const n = bases.length;
	if (n < 2) return bases.map((r) => Math.round(r * 10) / 10);
	const ranked = bases.map((base, i) => {
		const s = signals[i];
		const hpN = s.hp ?? 400;
		return base * 10 + s.prestige * .04 + hpN / 200 + s.tradeIn / 5e5 + s.retailHigh / 6e5 + (s.live ? .05 : 0);
	}).map((score, i) => ({
		score,
		i,
		base: bases[i]
	})).sort((a, b) => b.score - a.score);
	const maxB = Math.max(...bases);
	const minB = Math.min(...bases);
	const collapsed = maxB - minB < .15;
	const out = bases.map((b) => Math.round(b * 10) / 10);
	if (collapsed) {
		const center = Math.round((maxB + minB) / 2 * 10) / 10 || 4.5;
		const spreads = n === 3 ? [
			.3,
			0,
			-.3
		] : n === 2 ? [.2, -.2] : [0];
		ranked.forEach((r, rank) => {
			const delta = spreads[rank] ?? 0;
			out[r.i] = Math.min(5, Math.max(3.6, Math.round((center + delta) * 10) / 10));
		});
	} else {
		const seen = /* @__PURE__ */ new Map();
		ranked.forEach((r) => {
			let v = out[r.i];
			let key = v.toFixed(1);
			while (seen.has(key)) {
				v = Math.min(5, Math.round((v + .1) * 10) / 10);
				key = v.toFixed(1);
			}
			seen.set(key, r.i);
			out[r.i] = v;
		});
	}
	if (n >= 2) {
		const mx = Math.max(...out);
		const mn = Math.min(...out);
		if (mx === mn) {
			out[ranked[0].i] = Math.min(5, mx + .2);
			out[ranked[ranked.length - 1].i] = Math.max(3.6, mn - .2);
		}
	}
	return out.map((v) => Math.round(v * 10) / 10);
}
/** Build structured side-by-side compare matrix (2–3 coaches). Live Grok overlays when present. */
function buildCompareReport(items, liveMap) {
	const cols = items.slice(0, 3).map((r) => {
		const key = keyOf(r);
		const live = liveMap?.[key] ?? null;
		const baseBrochure = buildBrochureSpecs(r.data, r.year, r.make, r.model, r.floorplan);
		const guard = resolveHardPowertrain({
			year: r.year,
			make: r.make,
			model: r.model,
			floorplan: r.floorplan,
			catalog: {
				engine: baseBrochure.engine,
				horsepower: baseBrochure.horsepower,
				torque: baseBrochure.torque,
				chassis: baseBrochure.chassis,
				transmission: baseBrochure.transmission,
				fuelType: r.data.fuelType,
				type: r.data.type
			},
			live: live?.live ? live : null
		});
		const brochure = mergeLiveIntoDisplay({
			engine: baseBrochure.engine,
			horsepower: baseBrochure.horsepower,
			torque: baseBrochure.torque,
			transmission: baseBrochure.transmission,
			chassis: baseBrochure.chassis,
			hitchOrPin: baseBrochure.hitchOrPin,
			fuelCapacity: baseBrochure.fuelCapacity,
			lengthFt: baseBrochure.lengthFt,
			exteriorWidth: baseBrochure.exteriorWidth,
			exteriorHeight: baseBrochure.exteriorHeight,
			interiorHeight: baseBrochure.interiorHeight,
			gvwr: baseBrochure.gvwr,
			uvw: baseBrochure.uvw,
			ccc: baseBrochure.ccc,
			slideouts: baseBrochure.slideouts,
			sleeps: baseBrochure.sleeps,
			freshWater: baseBrochure.freshWater,
			grayWater: baseBrochure.grayWater,
			blackWater: baseBrochure.blackWater,
			generator: baseBrochure.generator,
			mpgHighway: baseBrochure.mpgHighway,
			warranty: baseBrochure.warranty
		}, live?.live ? live : null, {
			lockPowertrainFromCatalog: true,
			hardOverride: {
				engine: guard.hard.engine || baseBrochure.engine,
				horsepower: formatHardHorsepower(guard.hard.horsepower) || baseBrochure.horsepower,
				torque: formatHardTorque(guard.hard.torqueLbFt) || baseBrochure.torque,
				chassis: guard.hard.chassis || baseBrochure.chassis,
				transmission: guard.hard.transmission || baseBrochure.transmission
			}
		});
		const oem = findOemFloorplanSpec(r.year, r.make, r.model, r.floorplan);
		const catalogMarket = estimateMarket(r.data, r.year, r.floorplan);
		const ladder = liveMarketLadder(live?.live ? live : null);
		const market = ladder ? {
			tradeIn: ladder.tradeIn,
			retailLow: ladder.retailLow,
			retailHigh: ladder.retailHigh,
			msrpLo: ladder.msrpLo ?? catalogMarket.msrpLo,
			msrpHi: ladder.msrpHi ?? catalogMarket.msrpHi
		} : {
			tradeIn: catalogMarket.tradeIn,
			retailLow: catalogMarket.retailLow,
			retailHigh: catalogMarket.retailHigh,
			msrpLo: catalogMarket.msrpLo,
			msrpHi: catalogMarket.msrpHi
		};
		const rawRating = live?.ratingEstimate && live.ratingEstimate > 0 ? live.ratingEstimate : ratingFor(r.make, r.model, r.year);
		const typeLabel = live?.rvType || r.data.type;
		const fuelLabel = live?.fuelType || r.data.fuelType;
		const hpMeta = hpDisplayAndRank(brochure.engine, brochure.horsepower, r.make, r.model, r.year);
		return {
			r,
			brochure: {
				...brochure,
				engine: hpMeta.engineDisplay,
				horsepower: hpMeta.display
			},
			hpRaw: hpMeta.raw,
			market,
			rawRating,
			typeLabel,
			fuelLabel,
			live: Boolean(live?.live),
			key,
			prestige: prestigeScore(r.make, r.model),
			layoutNote: oem?.layoutNote || "",
			oemSleeps: oem?.sleeps ?? null,
			oemSlides: oem?.slideouts ?? null
		};
	});
	const finalRatings = finalizeRatings(cols.map((c) => c.rawRating), cols.map((c) => ({
		prestige: c.prestige,
		hp: c.hpRaw,
		tradeIn: c.market.tradeIn,
		retailHigh: c.market.retailHigh,
		live: c.live
	})));
	const colsWithRating = cols.map((c, i) => ({
		...c,
		rating: finalRatings[i]
	}));
	const ratings = colsWithRating.map((c) => c.rating);
	let highestRatingIndex = 0;
	let lowestRatingIndex = 0;
	ratings.forEach((v, i) => {
		if (v > ratings[highestRatingIndex]) highestRatingIndex = i;
		if (v < ratings[lowestRatingIndex]) lowestRatingIndex = i;
	});
	return {
		columns: colsWithRating.map(({ r, rating, live, typeLabel, key }) => ({
			key,
			year: r.year,
			make: r.make,
			model: r.model,
			floorplan: r.floorplan,
			type: typeLabel,
			shortTitle: shortTitle(r),
			result: r,
			live,
			rating
		})),
		rows: [
			row("rating", "RVFAX Rating", "higher", colsWithRating.map((c) => ({
				display: `${c.rating.toFixed(1)} / 5.0`,
				raw: c.rating
			}))),
			row("type", "Class / Type", "neutral", colsWithRating.map((c) => ({
				display: c.typeLabel,
				raw: null
			}))),
			row("fuel", "Fuel", "neutral", colsWithRating.map((c) => ({
				display: c.fuelLabel,
				raw: null
			}))),
			row("engine", "Engine", "neutral", colsWithRating.map((c) => ({
				display: c.brochure.engine,
				raw: c.hpRaw
			}))),
			row("hp", "Horsepower", "higher", colsWithRating.map((c) => ({
				display: c.brochure.horsepower,
				raw: c.hpRaw
			}))),
			row("chassis", "Chassis", "neutral", colsWithRating.map((c) => ({
				display: c.brochure.chassis,
				raw: null
			}))),
			row("length", "Length", "neutral", colsWithRating.map((c) => ({
				display: c.brochure.lengthFt,
				raw: parseRangeMid(c.brochure.lengthFt) ?? parseNum(c.brochure.lengthFt)
			}))),
			row("gvwr", "GVWR", "neutral", colsWithRating.map((c) => ({
				display: c.brochure.gvwr,
				raw: parseRangeMid(c.brochure.gvwr)
			}))),
			row("ccc", "Cargo Carrying (CCC)", "higher", colsWithRating.map((c) => ({
				display: c.brochure.ccc,
				raw: parseNum(c.brochure.ccc)
			}))),
			row("slides", "Slideouts", "higher", colsWithRating.map((c) => ({
				display: c.oemSlides != null ? String(c.oemSlides) : c.brochure.slideouts,
				raw: c.oemSlides ?? parseNum(c.brochure.slideouts)
			}))),
			row("sleeps", "Sleeps", "higher", colsWithRating.map((c) => ({
				display: c.oemSleeps != null ? String(c.oemSleeps) : c.brochure.sleeps,
				raw: c.oemSleeps ?? parseNum(c.brochure.sleeps)
			}))),
			row("layout", "Layout", "neutral", colsWithRating.map((c) => ({
				display: unverifiedLayoutLabel(c.layoutNote),
				raw: null
			}))),
			row("fresh", "Fresh Water", "higher", colsWithRating.map((c) => ({
				display: c.brochure.freshWater,
				raw: parseNum(c.brochure.freshWater)
			}))),
			row("mpg", "Highway MPG (est.)", "higher", colsWithRating.map((c) => ({
				display: c.brochure.mpgHighway,
				raw: parseNum(c.brochure.mpgHighway)
			}))),
			row("tow", "Tow / Hitch", "higher", colsWithRating.map((c) => ({
				display: c.brochure.hitchOrPin,
				raw: parseNum(c.brochure.hitchOrPin)
			}))),
			row("gen", "Generator", "neutral", colsWithRating.map((c) => ({
				display: c.brochure.generator,
				raw: parseNum(c.brochure.generator)
			}))),
			row("warranty", "Warranty", "higher", colsWithRating.map((c) => ({
				display: c.brochure.warranty,
				raw: c.r.data.warrantyYears || parseNum(c.brochure.warranty)
			}))),
			row("trade", "Trade-in (est.)", "higher", colsWithRating.map((c) => ({
				display: formatMoney(c.market.tradeIn),
				raw: c.market.tradeIn
			}))),
			row("retailLo", "Retail Low (est.)", "lower", colsWithRating.map((c) => ({
				display: formatMoney(c.market.retailLow),
				raw: c.market.retailLow
			}))),
			row("retailHi", "Retail High (est.)", "lower", colsWithRating.map((c) => ({
				display: formatMoney(c.market.retailHigh),
				raw: c.market.retailHigh
			}))),
			row("msrp", "When-new MSRP ref.", "neutral", colsWithRating.map((c) => ({
				display: `${formatMoney(c.r.data.msrpRange[0])}–${formatMoney(c.r.data.msrpRange[1])}`,
				raw: (c.r.data.msrpRange[0] + c.r.data.msrpRange[1]) / 2
			})))
		],
		generatedAt: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
			dateStyle: "medium",
			timeStyle: "short"
		}),
		highestRatingIndex,
		lowestRatingIndex,
		liveCount: colsWithRating.filter((c) => c.live).length
	};
}
function toneClass(tone, emphasis) {
	switch (tone) {
		case "better": return emphasis ? "bg-emerald-500/35 text-emerald-50 border-emerald-400/70 ring-1 ring-emerald-400/40 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-400" : "bg-emerald-500/20 text-emerald-100 border-emerald-400/45 print:bg-emerald-50 print:text-emerald-900 print:border-emerald-300";
		case "worse": return emphasis ? "bg-ruby/35 text-ruby border-ruby/70 ring-1 ring-ruby/50 print:bg-red-100 print:text-red-900 print:border-red-400" : "bg-ruby/20 text-ruby border-ruby/45 print:bg-red-50 print:text-red-800 print:border-red-300";
		case "equal": return "bg-black/25 text-white border-white/12 print:bg-slate-50 print:text-slate-800 print:border-slate-200";
		default: return "bg-black/15 text-white/70 border-white/10 print:bg-white print:text-slate-600";
	}
}
function RvCompare({ items, onBack, onOpen }) {
	const [liveMap, setLiveMap] = (0, import_react.useState)({});
	const [liveLoading, setLiveLoading] = (0, import_react.useState)(true);
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [summaryLive, setSummaryLive] = (0, import_react.useState)(false);
	const [loadingSummary, setLoadingSummary] = (0, import_react.useState)(true);
	const [summaryError, setSummaryError] = (0, import_react.useState)(null);
	const [exportBusy, setExportBusy] = (0, import_react.useState)(false);
	const [exportMsg, setExportMsg] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const ctrl = new AbortController();
		setLiveLoading(true);
		const seed = {};
		for (const r of items.slice(0, 3)) {
			const peek = peekVerifiedDossier(r.year, r.make, r.model, r.floorplan);
			if (peek) seed[compareSelectionKey(r)] = peek;
		}
		if (Object.keys(seed).length) setLiveMap(seed);
		Promise.all(items.slice(0, 3).map(async (r) => {
			const br = buildBrochureSpecs(r.data, r.year, r.make, r.model, r.floorplan);
			const res = await fetchLiveDossier(r.year, r.make, r.model, r.floorplan, ctrl.signal, {
				engine: br.engine,
				horsepower: br.horsepower,
				torque: br.torque,
				chassis: br.chassis,
				transmission: br.transmission,
				fuelType: r.data.fuelType,
				type: r.data.type,
				dataSource: br.dataSource,
				accuracyNote: br.accuracyNote
			});
			if (ctrl.signal.aborted) return {
				key: compareSelectionKey(r),
				data: null
			};
			return {
				key: compareSelectionKey(r),
				data: res.ok ? res.data : null
			};
		})).then((rows) => {
			if (ctrl.signal.aborted) return;
			const map = { ...seed };
			for (const row of rows) if (row.data) map[row.key] = row.data;
			setLiveMap(map);
			setLiveLoading(false);
		});
		return () => ctrl.abort();
	}, [items]);
	const report = (0, import_react.useMemo)(() => buildCompareReport(items, liveMap), [items, liveMap]);
	const titleLine = (0, import_react.useMemo)(() => report.columns.map((c) => `${c.year} ${c.make} ${c.model}${c.floorplan ? ` ${c.floorplan}` : ""}`).join(" vs "), [report.columns]);
	const exportPdf = async () => {
		if (exportBusy) return;
		setExportBusy(true);
		setExportMsg("Preparing PDF…");
		try {
			await new Promise((r) => requestAnimationFrame(() => r(null)));
			const res = await exportVehicleReport({
				reportElementId: "rvfax-compare-report",
				title: `RvFOX Pro Compare · ${titleLine}`,
				subtitle: `Comparison Report · ${report.generatedAt} · ${report.columns.length} coaches${report.liveCount ? ` · ${report.liveCount} live` : ""}`,
				filenameBase: `RvFOX-Pro-Compare-${report.columns.map((c) => c.model).join("-")}`
			});
			if (!res.ok) setExportMsg(res.error);
			else if (res.method === "share") setExportMsg("Shared — pick Print or Save to Files for PDF");
			else if (res.method === "print") setExportMsg("Print dialog opened — choose Save as PDF");
			else if (res.method === "preview") setExportMsg("Preview open — tap Save as PDF / Print");
			else setExportMsg("Report downloaded — open it and Print → PDF");
		} catch (e) {
			setExportMsg(e instanceof Error ? e.message : "Export failed");
		} finally {
			setExportBusy(false);
			window.setTimeout(() => setExportMsg(null), 5e3);
		}
	};
	(0, import_react.useEffect)(() => {
		if (liveLoading) return;
		const ctrl = new AbortController();
		setLoadingSummary(true);
		setSummaryError(null);
		const coaches = report.columns.map((c, idx) => {
			const cell = (id) => report.rows.find((r) => r.id === id)?.cells[idx]?.value;
			return {
				year: c.year,
				make: c.make,
				model: c.model,
				floorplan: c.floorplan || void 0,
				type: c.type,
				rating: c.rating,
				engine: cell("engine"),
				chassis: cell("chassis"),
				length: cell("length"),
				sleeps: cell("sleeps"),
				slides: cell("slides"),
				layout: cell("layout"),
				retailHigh: report.rows.find((r) => r.id === "retailHi")?.cells[idx]?.raw,
				tradeIn: report.rows.find((r) => r.id === "trade")?.cells[idx]?.raw,
				live: c.live
			};
		});
		fetch("/api/rvfax/compare", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ coaches }),
			signal: ctrl.signal
		}).then(async (resp) => {
			if (ctrl.signal.aborted) return;
			const json = await resp.json();
			if (!resp.ok) {
				setSummaryError(json.error || "Compare summary failed");
				setLoadingSummary(false);
				return;
			}
			setSummary(json.summary || null);
			setSummaryLive(Boolean(json.live));
			setLoadingSummary(false);
		}).catch((e) => {
			if (ctrl.signal.aborted) return;
			if (e instanceof Error && e.name === "AbortError") return;
			setSummaryError(e instanceof Error ? e.message : "Network error on AI summary");
			setLoadingSummary(false);
		});
		return () => ctrl.abort();
	}, [liveLoading, report]);
	const n = report.columns.length;
	/** Sticky label col + equal coach cols — labels never scroll off */
	const gridCols = n === 2 ? "grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";
	const hi = report.highestRatingIndex;
	const lo = report.lowestRatingIndex;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-col overflow-hidden bg-bg text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteBackdrop, { src: RV_CARD_MEDIA }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-app-scroll": true,
			className: "rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "rvfax-compare-report",
				className: "mx-auto w-full max-w-2xl space-y-3 px-3 pb-20 pt-3 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 print:hidden",
						"data-no-export": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onBack,
								className: "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Back"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] font-bold tracking-[0.14em] text-white/70",
								children: [
									"COMPARE · ",
									n,
									" COACHES"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void exportPdf(),
								disabled: exportBusy,
								className: cn("inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3 py-2 text-[12px] font-bold text-white active:scale-[0.97]", exportBusy && "opacity-70"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), exportBusy ? "…" : "PDF"]
							})
						]
					}),
					exportMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "status",
						"data-no-export": true,
						className: "print:hidden rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-[12px] font-semibold text-white",
						children: exportMsg
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "overflow-hidden rounded-[1.25rem] border border-white/15 bg-black/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 border-b border-white/10 bg-black/55 px-3.5 py-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-900",
									children: "RVFAX"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-bold text-white",
									children: "Comparison Report"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitCompare, { className: "ml-auto size-4 text-sky-300" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-white/55",
									children: report.generatedAt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[13px] font-semibold text-white",
									children: titleLine
								}),
								liveLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 flex items-center gap-2 text-[12px] text-white/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Refreshing figures…"]
								}) : null
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("grid gap-1.5", gridCols),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center pr-1 text-[10px] font-bold tracking-wide text-white",
							children: "Rating"
						}), report.columns.map((c, i) => {
							const isHi = i === hi && hi !== lo;
							const isLo = i === lo && hi !== lo;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("rounded-xl border px-2 py-2 text-center", isHi && "border-emerald-400/60 bg-emerald-500/25 text-emerald-50", isLo && "border-ruby/60 bg-ruby/25 text-ruby", !isHi && !isLo && "border-white/12 bg-black/35 text-white"),
								children: [
									isHi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mb-0.5 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-emerald-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-3" }), " Highest"]
									}) : null,
									isLo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-0.5 text-[9px] font-bold uppercase tracking-wide text-ruby",
										children: "Lowest"
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[22px] font-black leading-none",
										children: c.rating.toFixed(1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[10px] opacity-80",
										children: "/ 5.0"
									})
								]
							}, `rate-${c.key}`);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("grid gap-1.5", gridCols),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end pb-1 pr-1 text-[10px] font-bold tracking-wide text-white",
							children: "Coach"
						}), report.columns.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onOpen?.(c.result),
							className: cn("min-w-0 rounded-xl border p-2 text-left transition active:scale-[0.99]", i === hi && hi !== lo ? "border-emerald-400/50 bg-emerald-500/15" : i === lo && hi !== lo ? "border-ruby/40 bg-ruby/10" : "border-white/15 bg-black/40"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[9px] font-bold tracking-wide text-sky-300",
									children: [
										"COACH ",
										i + 1,
										c.live ? " · LIVE" : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[12px] font-bold leading-snug text-white",
									children: [
										c.year,
										" ",
										c.make
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[12px] font-semibold text-white/90",
									children: [c.model, c.floorplan ? ` · ${c.floorplan}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] text-white/50",
									children: c.type
								})
							]
						}, c.key))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "overflow-hidden rounded-[1.15rem] border border-white/12 bg-black/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-white/10 bg-black/55 px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-bold tracking-wide text-white",
								children: "Specs & ratings"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-white/10",
							children: report.rows.map((r) => {
								const isRating = r.id === "rating";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("grid gap-1.5 px-2 py-2.5 sm:px-3", gridCols, isRating && "bg-white/[0.03]"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center pr-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "w-full whitespace-normal break-words text-[10px] font-bold leading-snug tracking-wide text-white/80 print:text-slate-700",
											children: r.label
										})
									}), r.cells.map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("min-w-0 rounded-lg border px-1.5 py-1.5 text-[10px] font-semibold leading-snug sm:px-2 sm:text-[11px]", toneClass(cell.tone, isRating), isRating && "text-[13px] font-black sm:text-[14px]"),
										children: [
											cell.tone === "better" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mb-0.5 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide opacity-90 sm:text-[9px]",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-2.5 shrink-0" }),
													" ",
													isRating ? "Highest" : "Best"
												]
											}) : null,
											cell.tone === "worse" && isRating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mb-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-90 sm:text-[9px]",
												children: "Lowest"
											}) : cell.tone === "worse" && !isRating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mb-0.5 block text-[8px] font-bold uppercase tracking-wide opacity-80 sm:text-[9px]",
												children: "Lower"
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "break-words",
												children: cell.value || "—"
											})
										]
									}, `${r.id}-${i}`))]
								}, r.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "overflow-hidden rounded-[1.15rem] border border-white/12 bg-black/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 border-b border-white/10 bg-black/55 px-3.5 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-ruby" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold tracking-wide text-white",
									children: "AI difference summary"
								}),
								summaryLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/50",
									children: "Compared"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3.5",
							children: liveLoading || loadingSummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-[13px] text-white/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-sky-300" }), "Grok is comparing these coaches…"]
							}) : summaryError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-amber",
								children: summaryError
							}) : summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "whitespace-pre-wrap text-[13px] leading-relaxed text-white/90",
								children: summary
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] text-white/60",
								children: "No summary yet."
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "print:hidden flex flex-col gap-2 pt-1",
						"data-no-export": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void exportPdf(),
							disabled: exportBusy,
							className: "flex w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-70",
							children: [exportBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), exportBusy ? "Preparing PDF…" : "Save / Print PDF"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pb-4 text-center text-[12px] text-white",
						children: "Confirm brochure and door sticker before you buy."
					})
				]
			})
		})]
	});
}
//#endregion
export { RvCompare };
