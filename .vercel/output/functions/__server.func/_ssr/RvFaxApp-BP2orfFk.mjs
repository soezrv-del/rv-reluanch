import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Search, H as LoaderCircle, Q as Fuel, T as Ruler, X as GitCompare, Y as Heart, Z as Funnel, bt as Bookmark, d as Trash2, ht as Check, l as TriangleAlert, mt as ChevronDown, t as X, v as Sparkles, w as ScanLine, xt as BedDouble } from "../_libs/lucide-react.mjs";
import { r as useKeyboardInset, u as cn } from "./routes-DqDGUVQW.mjs";
import { i as SuiteBackdrop, n as SHARED_PRESTIGE_BACKDROP, o as useAdaptiveGlass, r as ScrollSuiteHeader, s as usePullToReset, t as PullResetHint } from "./SuitePage-CG5Hg0RX.mjs";
import { C as searchCatalog, S as rvClassLabel, a as applyCascadeChange, b as ratingFor, c as compareSelectionKey, h as getModelsForYearMake, i as YEARS, l as countModelsForClass, m as getMakesForYear, n as RV_CLASS_TABS, o as buildCascadeOptions, r as RV_DATA, t as MAKES, v as modelAvailableInYear, y as modelPickerMeta } from "./catalog-Dt-eFo6s.mjs";
import { r as resolveCardImage } from "./typeMedia-Cfrpq4yI.mjs";
import { t as SelectSheet } from "./SelectSheet-aKbu9anf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvFaxApp-BP2orfFk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function norm(s) {
	return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
/** Lightweight edit distance (capped). */
function levenshtein(a, b) {
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;
	const m = a.length;
	const n = b.length;
	if (Math.abs(m - n) > 8) return 99;
	const row = new Array(n + 1);
	for (let j = 0; j <= n; j++) row[j] = j;
	for (let i = 1; i <= m; i++) {
		let prev = i - 1;
		row[0] = i;
		for (let j = 1; j <= n; j++) {
			const tmp = row[j];
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
			prev = tmp;
		}
	}
	return row[n];
}
function scoreName(query, candidate) {
	const q = norm(query);
	const c = norm(candidate);
	if (!q || !c) return 0;
	if (q === c) return 100;
	if (c.startsWith(q) || q.startsWith(c)) return 90;
	if (c.includes(q) || q.includes(c)) return 75;
	const qt = new Set(q.split(" "));
	const ct = c.split(" ");
	let hit = 0;
	for (const t of ct) if (qt.has(t)) hit++;
	const overlap = hit / Math.max(qt.size, 1);
	if (overlap >= .5) return 55 + overlap * 30;
	const d = levenshtein(q, c);
	if (d <= 1) return 85;
	if (d <= 2) return 70;
	if (d <= 3) return 55;
	const q0 = q.split(" ")[0] || "";
	const c0 = c.split(" ")[0] || "";
	if (q0 && c0 && levenshtein(q0, c0) <= 2) return 50;
	return 0;
}
/** “Did you mean?” makes for a year (or all years if empty). */
function suggestMakes(query, year, limit = 5) {
	if (!query.trim()) return [];
	return (year ? getMakesForYear(year) : [...MAKES]).map((make) => ({
		kind: "make",
		make,
		label: make,
		score: scoreName(query, make),
		reason: year ? `Sold in ${year}` : "Catalog brand"
	})).filter((h) => h.score >= 45).sort((a, b) => b.score - a.score).slice(0, limit);
}
/** “Did you mean?” models for year + make. */
function suggestModels(query, year, make, limit = 6) {
	if (!query.trim() || !make) return [];
	let names = year ? getModelsForYearMake(year, make) : [];
	if (!names.length && RV_DATA[make]) names = Object.keys(RV_DATA[make]).filter((m) => {
		const sp = RV_DATA[make][m];
		if (!year) return true;
		return modelAvailableInYear(sp, parseInt(year, 10));
	});
	const cross = [];
	if (names.length < 2) {
		const y = parseInt(year, 10);
		for (const mk of MAKES) {
			const map = RV_DATA[mk];
			if (!map) continue;
			for (const [md, sp] of Object.entries(map)) {
				if (year && Number.isFinite(y) && !modelAvailableInYear(sp, y)) continue;
				const sc = scoreName(query, md) * .9 + scoreName(query, `${mk} ${md}`) * .1;
				if (sc < 50) continue;
				cross.push({
					kind: "combo",
					make: mk,
					model: md,
					label: `${mk} ${md}`,
					score: sc,
					reason: year ? `Available around ${year}` : "Catalog match"
				});
			}
		}
	}
	return [...names.map((model) => ({
		kind: "model",
		make,
		model,
		label: `${make} ${model}`,
		score: scoreName(query, model),
		reason: year ? `${year} · ${make}` : make
	})).filter((h) => h.score >= 40), ...cross].sort((a, b) => b.score - a.score).filter((h, i, arr) => arr.findIndex((x) => x.make === h.make && x.model === h.model) === i).slice(0, limit);
}
/** Combined suggestions when search misses or custom entry looks off. */
function didYouMean(opts) {
	const { year, make, model } = opts;
	const out = [];
	const makeInCatalog = Boolean(RV_DATA[make]);
	if (make && !makeInCatalog) out.push(...suggestMakes(make, year, 4));
	if (model) {
		if (makeInCatalog) {
			if (!(year ? getModelsForYearMake(year, make) : Object.keys(RV_DATA[make] || {})).some((m) => norm(m) === norm(model))) out.push(...suggestModels(model, year, make, 5));
		} else out.push(...suggestModels(model, year, make || "Tiffin", 5));
	}
	const seen = /* @__PURE__ */ new Set();
	return out.filter((h) => {
		const k = `${h.make}|${h.model || ""}`;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	}).slice(0, 6);
}
var RvDetail = (0, import_react.lazy)(() => import("./RvDetail-CcMKCP3X.mjs").then((m) => ({ default: m.RvDetail })));
var RvCompare = (0, import_react.lazy)(() => import("./RvCompare-DP6A2Ru7.mjs").then((m) => ({ default: m.RvCompare })));
var VinDecoder = (0, import_react.lazy)(() => import("./VinDecoder-DVhfKliP.mjs").then((m) => ({ default: m.VinDecoder })));
function PanelFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-white/10" })
	});
}
var SAVED_KEY = "rvfax_saved_v1";
var PRESTIGE_BACKDROP = SHARED_PRESTIGE_BACKDROP;
var YEAR_ERAS = [
	{
		id: "all",
		label: "All Years",
		sub: "2002–2027",
		min: 2002,
		max: 2027
	},
	{
		id: "classic",
		label: "Classic Era",
		sub: "2002–2005",
		min: 2002,
		max: 2005
	},
	{
		id: "recent",
		label: "Recent Era",
		sub: "2006–2010",
		min: 2006,
		max: 2010
	},
	{
		id: "modern",
		label: "Modern Era",
		sub: "2011+",
		min: 2011,
		max: 2027
	},
	{
		id: "newer17",
		label: "17+",
		sub: "2017–2027",
		min: 2017,
		max: 2027
	}
];
function RvFaxApp({ onOpenGrok }) {
	const [year, setYear] = (0, import_react.useState)("");
	const [make, setMake] = (0, import_react.useState)("");
	const [model, setModel] = (0, import_react.useState)("");
	const [floorplan, setFloorplan] = (0, import_react.useState)("");
	const [rvType, setRvType] = (0, import_react.useState)("");
	const [era, setEra] = (0, import_react.useState)("all");
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [results, setResults] = (0, import_react.useState)([]);
	const [hasSearched, setHasSearched] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)([]);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [vinOpen, setVinOpen] = (0, import_react.useState)(false);
	const [comparePick, setComparePick] = (0, import_react.useState)([]);
	const [compareOpen, setCompareOpen] = (0, import_react.useState)(false);
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const scrollRef = (0, import_react.useRef)(null);
	const adaptiveGlass = useAdaptiveGlass(PRESTIGE_BACKDROP, scrollRef);
	const kb = useKeyboardInset();
	const resetFax = (0, import_react.useCallback)(() => {
		setYear("");
		setMake("");
		setModel("");
		setFloorplan("");
		setRvType("");
		setEra("all");
		setFiltersOpen(false);
		setSheet(null);
		setSearching(false);
		setResults([]);
		setHasSearched(false);
		setDetail(null);
		setVinOpen(false);
		setComparePick([]);
		setCompareOpen(false);
		setSuggestions([]);
		try {
			scrollRef.current?.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		} catch {}
	}, []);
	const pullHint = usePullToReset(scrollRef, resetFax, { enabled: false });
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(SAVED_KEY);
			if (raw) setSaved(JSON.parse(raw));
		} catch {}
	}, []);
	const persistSaved = (next) => {
		setSaved(next);
		try {
			localStorage.setItem(SAVED_KEY, JSON.stringify(next));
			window.dispatchEvent(new Event("rvfax-saved-changed"));
		} catch {}
	};
	const cascade = (0, import_react.useMemo)(() => buildCascadeOptions({
		year,
		make,
		model,
		floorplan,
		rvType
	}), [
		year,
		make,
		model,
		floorplan,
		rvType
	]);
	const applySel = (0, import_react.useCallback)((next) => {
		setYear(next.year);
		setMake(next.make);
		setModel(next.model);
		setFloorplan(next.floorplan);
		if (next.rvType !== void 0) setRvType(next.rvType);
	}, []);
	const yearsForEra = (0, import_react.useMemo)(() => {
		const e = YEAR_ERAS.find((x) => x.id === era) ?? YEAR_ERAS[0];
		return YEARS.filter((y) => {
			const n = parseInt(y, 10);
			return n >= e.min && n <= e.max;
		});
	}, [era]);
	const onEraSelect = (0, import_react.useCallback)((id) => {
		const next = YEAR_ERAS.find((e) => e.id === id)?.id ?? "all";
		setEra(next);
		const band = YEAR_ERAS.find((e) => e.id === next) ?? YEAR_ERAS[0];
		if (year) {
			const n = parseInt(year, 10);
			if (n < band.min || n > band.max) {
				applySel({
					year: "",
					make: "",
					model: "",
					floorplan: "",
					rvType
				});
				setHasSearched(false);
				setResults([]);
			}
		}
	}, [
		year,
		rvType,
		applySel
	]);
	const makeItems = (0, import_react.useMemo)(() => cascade.makes.map((m) => ({
		value: m,
		label: m,
		meta: [
			year || "All years",
			rvType ? rvClassLabel(rvType) : null,
			"brand in catalog"
		].filter(Boolean).join(" · ")
	})), [
		cascade.makes,
		year,
		rvType
	]);
	const modelItems = (0, import_react.useMemo)(() => cascade.models.map((m) => ({
		value: m,
		label: m,
		meta: modelPickerMeta(make || cascade.make, m, year || cascade.year)
	})), [
		cascade.models,
		cascade.make,
		cascade.year,
		make,
		year
	]);
	const floorplanItems = (0, import_react.useMemo)(() => {
		const fps = cascade.floorplans.map((fp) => ({
			value: fp,
			label: fp,
			meta: year && make && model ? `${year} ${make} ${model}` : "Available for this coach"
		}));
		return [{
			value: "",
			label: "Any floorplan",
			meta: fps.length ? `Skip · ${fps.length} layout${fps.length === 1 ? "" : "s"} for this year` : "No year-specific layouts · open report"
		}, ...fps];
	}, [
		cascade.floorplans,
		year,
		make,
		model
	]);
	const typeItems = (0, import_react.useMemo)(() => {
		const tabs = RV_CLASS_TABS.filter((t) => t.id !== "").map((t) => {
			const n = countModelsForClass(year, t.id);
			return {
				...t,
				n
			};
		}).filter((t) => t.n > 0);
		return [{
			value: "",
			label: "All types",
			meta: year ? `${year} · every class in the catalog` : "Do not filter by class"
		}, ...tabs.map((t) => ({
			value: t.id,
			label: t.label,
			meta: `${t.n} model${t.n === 1 ? "" : "s"} in ${year || "catalog"}`
		}))];
	}, [year]);
	const eraItems = (0, import_react.useMemo)(() => YEAR_ERAS.map((e) => ({
		value: e.id,
		label: e.label,
		meta: e.sub
	})), []);
	const runSearchNow = (0, import_react.useCallback)((sel) => {
		if (!sel.year?.trim() || !sel.make?.trim()) return;
		setSearching(true);
		setHasSearched(true);
		setSuggestions([]);
		window.setTimeout(() => {
			const found = searchCatalog({
				year: sel.year,
				make: sel.make,
				model: sel.model,
				floorplan: sel.floorplan,
				rvType: sel.rvType || void 0
			}).map((r) => ({
				...r,
				saved: saved.some((s) => s.make === r.make && s.model === r.model && s.year === r.year)
			}));
			setResults(found);
			setSearching(false);
			const opts = buildCascadeOptions({
				year: sel.year,
				make: sel.make,
				model: sel.model,
				floorplan: sel.floorplan,
				rvType: sel.rvType
			});
			if (opts.custom.make || opts.custom.model || found.length === 0 || found.some((f) => f.custom)) setSuggestions(didYouMean({
				year: sel.year,
				make: sel.make,
				model: sel.model
			}));
			if (found.length === 1 && !found[0].custom) setDetail(found[0]);
		}, 200);
	}, [saved]);
	const runSearch = (0, import_react.useCallback)(() => {
		runSearchNow({
			year,
			make,
			model,
			floorplan,
			rvType
		});
	}, [
		year,
		make,
		model,
		floorplan,
		rvType,
		runSearchNow
	]);
	const onCascadeSelect = (0, import_react.useCallback)((field, value) => {
		setSuggestions([]);
		const next = applyCascadeChange({
			year,
			make,
			model,
			floorplan,
			rvType
		}, field, value);
		applySel(next);
		setSheet(null);
		setHasSearched(false);
		setResults([]);
		if (field === "floorplan" && next.year && next.make && next.model) runSearchNow({
			year: next.year,
			make: next.make,
			model: next.model,
			floorplan: next.floorplan,
			rvType: next.rvType
		});
	}, [
		year,
		make,
		model,
		floorplan,
		rvType,
		applySel,
		runSearchNow
	]);
	(0, import_react.useEffect)(() => {
		if (!hasSearched || !cascade.canSearch || searching) return;
		const found = searchCatalog({
			year: cascade.year,
			make: cascade.make,
			model: cascade.model,
			floorplan: cascade.floorplan,
			rvType: cascade.rvType || void 0
		}).map((r) => ({
			...r,
			saved: saved.some((s) => s.make === r.make && s.model === r.model && s.year === r.year)
		}));
		setResults(found);
	}, [
		year,
		make,
		model,
		cascade.floorplan,
		cascade.rvType,
		cascade.canSearch,
		hasSearched,
		searching,
		saved
	]);
	const applySuggestion = (0, import_react.useCallback)((hit) => {
		let next = applyCascadeChange({
			year,
			make,
			model,
			floorplan,
			rvType
		}, "make", hit.make);
		if (hit.model) next = applyCascadeChange(next, "model", hit.model);
		applySel(next);
		setSuggestions([]);
		setHasSearched(false);
		setResults([]);
	}, [
		year,
		make,
		model,
		floorplan,
		rvType,
		applySel
	]);
	const toggleSave = (r) => {
		if (saved.some((s) => s.year === r.year && s.make === r.make && s.model === r.model && s.floorplan === r.floorplan)) persistSaved(saved.filter((s) => !(s.year === r.year && s.make === r.make && s.model === r.model && s.floorplan === r.floorplan)));
		else persistSaved([{
			...r,
			saved: true
		}, ...saved].slice(0, 40));
	};
	const toggleCompare = (r) => {
		const key = compareSelectionKey(r);
		const idx = comparePick.findIndex((c) => compareSelectionKey(c) === key);
		if (idx >= 0) {
			setComparePick(comparePick.filter((_, i) => i !== idx));
			return;
		}
		if (comparePick.length >= 3) return;
		setComparePick([...comparePick, r]);
	};
	const eraLabel = YEAR_ERAS.find((e) => e.id === era)?.label ?? "All Years";
	const eraSub = YEAR_ERAS.find((e) => e.id === era)?.sub ?? "";
	if (compareOpen && comparePick.length >= 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelFallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvCompare, {
			items: comparePick,
			onBack: () => setCompareOpen(false),
			onOpen: (r) => {
				setCompareOpen(false);
				setDetail(r);
			}
		})
	});
	if (detail) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelFallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvDetail, {
			result: detail,
			onBack: () => setDetail(null),
			onToggleSave: () => toggleSave(detail),
			saved: saved.some((s) => s.year === detail.year && s.make === detail.make && s.model === detail.model && s.floorplan === detail.floorplan),
			comparing: comparePick.some((c) => compareSelectionKey(c) === compareSelectionKey(detail)),
			compareCount: comparePick.length,
			compareFull: comparePick.length >= 3,
			onToggleCompare: () => toggleCompare(detail),
			onOpenCompare: () => {
				if (comparePick.length >= 2) setCompareOpen(true);
			},
			onAskGrok: () => onOpenGrok?.(`Tell me about the ${detail.year} ${detail.make} ${detail.model}${detail.floorplan ? ` floorplan ${detail.floorplan}` : ""} — factory specs, used market, reliability, recalls, and service issues.`)
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rvfax-screen adaptive-glass relative flex h-full min-h-0 flex-col overflow-hidden text-white",
		style: adaptiveGlass.style,
		"data-glass-l": adaptiveGlass.luminance.toFixed(3),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteBackdrop, { src: PRESTIGE_BACKDROP }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				"data-app-scroll": true,
				className: "rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain",
				style: { paddingBottom: kb.open ? `max(7rem, ${kb.inset + 112}px)` : void 0 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollSuiteHeader, { tab: "rvfax" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullResetHint, {
						show: pullHint,
						label: "Release to reset search · pull down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-lg space-y-2.5 px-3 pb-28 pt-0 sm:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-prestige space-y-2 rounded-[var(--radius-xl)] p-3 sm:p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[16px] font-extrabold tracking-tight text-white",
												children: "Catalog search"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-[11px] leading-snug text-white/70",
												children: year ? [
													year,
													rvType ? rvClassLabel(rvType) : "All types",
													make || `${cascade.counts.makes} makes`,
													model || (make ? `${cascade.counts.models} models` : null),
													floorplan || (model ? "Any floorplan" : null)
												].filter(Boolean).join(" → ") : "Year → type → make → model → floorplan"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setFiltersOpen((v) => !v),
											className: cn("inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3 py-1.5 text-left transition active:scale-[0.98]", filtersOpen || era !== "all" ? "border-sapphire/50 bg-sapphire/20" : "border-white/20 bg-black/30"),
											"aria-expanded": filtersOpen,
											"aria-controls": "rvfax-optional-filters",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: cn("size-3.5 shrink-0", filtersOpen || era !== "all" ? "text-blue" : "text-white/80") }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-bold tracking-wide text-white",
													children: "Year range"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-3.5 shrink-0 text-white/80 transition-transform", filtersOpen && "rotate-180") })
											]
										})]
									}),
									filtersOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										id: "rvfax-optional-filters",
										className: "space-y-2.5 rounded-[var(--radius-md)] border border-white/10 bg-black/25 p-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2 px-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]",
												children: "YEAR RANGE"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [era !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setEra("all"),
													className: "rounded-full px-2 py-1 text-[10px] font-bold text-white/80 underline-offset-2 hover:text-white hover:underline",
													children: "Clear"
												}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setFiltersOpen(false),
													className: "flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white",
													"aria-label": "Close filters",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
											label: "Year range",
											value: `${eraLabel} · ${eraSub}`,
											placeholder: "All years",
											onClick: () => setSheet("era"),
											sapphire: true
										})]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2.5 border-t border-white/10 pt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]",
												children: "YEAR · TYPE · MAKE · MODEL · FLOORPLAN"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "Year",
												value: year,
												placeholder: "Required",
												required: true,
												onClick: () => setSheet("year"),
												sapphire: true,
												hint: `${yearsForEra.length} years`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "RV Type",
												value: rvType ? rvClassLabel(rvType) : "",
												placeholder: year ? "All types · tap to narrow" : "Pick a year first",
												disabled: !year,
												onClick: () => year && setSheet("rvType"),
												sapphire: true,
												hint: year ? `${Math.max(0, typeItems.length - 1)} classes in ${year}` : void 0
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "Make",
												value: make,
												placeholder: cascade.locks.make || (year ? "Required" : "Pick a year first"),
												required: true,
												disabled: !year || Boolean(cascade.locks.make),
												custom: cascade.custom.make,
												onClick: () => year && !cascade.locks.make && setSheet("make"),
												sapphire: true,
												hint: year ? `${cascade.counts.makes} brand${cascade.counts.makes === 1 ? "" : "s"}${rvType ? ` · ${rvClassLabel(rvType)}` : ""}` : void 0
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "Model",
												value: model,
												placeholder: cascade.locks.model || "Required",
												required: true,
												disabled: !make || Boolean(cascade.locks.model),
												custom: cascade.custom.model,
												onClick: () => make && !cascade.locks.model && setSheet("model"),
												sapphire: true,
												hint: make ? `${cascade.counts.models} model${cascade.counts.models === 1 ? "" : "s"}` : void 0
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "Floorplan",
												value: floorplan || (model && !cascade.locks.floorplan ? "Any floorplan" : ""),
												placeholder: cascade.locks.floorplan || "Optional",
												disabled: !model || Boolean(cascade.locks.floorplan),
												custom: cascade.custom.floorplan,
												onClick: () => model && !cascade.locks.floorplan && setSheet("floorplan"),
												sapphire: true,
												hint: model ? cascade.counts.floorplans ? `${cascade.counts.floorplans} layout${cascade.counts.floorplans === 1 ? "" : "s"}` : "Any · no year-specific layouts listed" : void 0
											})
										]
									}),
									searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center justify-center gap-2 text-[12px] font-semibold text-sky-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Opening report…"]
									}) : cascade.canSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: runSearch,
										className: "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-gold-border/50 bg-gold-dim/25 py-2.5 text-[13px] font-bold text-gold-bright active:scale-[0.99]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" }), "Open report"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-[11px] leading-snug text-white/65",
										children: "Pick year, type, make, and model. Each dropdown narrows the next. Report opens on floorplan — or tap Open report."
									})
								]
							}),
							suggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "glass-prestige space-y-2 rounded-[var(--radius-xl)] border border-sky-400/30 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-sky-300",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "DID YOU MEAN?"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[12px] text-white",
										children: "We couldn’t match that exactly. Tap a suggestion, or open the custom result and live Grok will research it."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-1.5",
										children: suggestions.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => applySuggestion(hit),
											className: "flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-left transition active:scale-[0.99]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[13px] font-bold text-white",
												children: hit.label
											}), hit.reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-white",
												children: hit.reason
											}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 -rotate-90 shrink-0 text-white" })]
										}) }, `${hit.make}-${hit.model || ""}`))
									})
								]
							}) : null,
							hasSearched && !searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2 px-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] font-bold tracking-[0.12em] text-white",
										children: [
											results.length,
											" RESULT",
											results.length === 1 ? "" : "S"
										]
									}), comparePick.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setCompareOpen(true),
										className: "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-sky-400/45 bg-sky-500/20 px-3 py-1.5 text-[11px] font-bold text-white",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitCompare, { className: "size-3.5" }),
											"Compare ",
											comparePick.length
										]
									}) : null]
								}), results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "glass-prestige rounded-[var(--radius-xl)] p-5 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto size-6 text-amber" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[14px] font-bold text-white",
											children: "No catalog match"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[12px] text-white",
											children: "Use a suggestion above or Ask Grok for live research."
										}),
										onOpenGrok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onOpenGrok(`Research the ${year} ${make} ${model}${floorplan ? ` ${floorplan}` : ""} — factory specs, used market, reliability, and recalls.`),
											className: "mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ruby-border bg-ruby-soft px-4 py-2 text-[12px] font-bold text-ruby",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "Ask RvGrok"]
										}) : null
									]
								}) : results.map((r) => {
									const key = compareSelectionKey(r);
									const comparing = comparePick.some((c) => compareSelectionKey(c) === key);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCard, {
										result: r,
										saved: saved.some((s) => s.year === r.year && s.make === r.make && s.model === r.model && s.floorplan === r.floorplan),
										comparing,
										compareFull: comparePick.length >= 3,
										onOpen: () => setDetail(r),
										onToggleSave: () => toggleSave(r),
										onToggleCompare: () => toggleCompare(r),
										onGrok: () => onOpenGrok?.(`Tell me about the ${r.year} ${r.make} ${r.model}${r.floorplan ? ` floorplan ${r.floorplan}` : ""} — factory specs, used market, reliability, recalls, and service issues.`)
									}, key);
								})]
							}) : null,
							saved.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "space-y-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-3.5" }), "SAVED UNITS"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => persistSaved([]),
										className: "inline-flex min-h-[36px] items-center gap-1 text-[11px] font-semibold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), "Clear"]
									})]
								}), saved.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setDetail(r),
									className: "glass-prestige flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left active:scale-[0.99]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[13px] font-bold text-white",
											children: [
												r.year,
												" ",
												r.make,
												" ",
												r.model
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-white",
											children: r.floorplan || r.data.type
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 -rotate-90 shrink-0 text-white" })]
								}, `saved-${compareSelectionKey(r)}`))]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setVinOpen(true),
								className: "glass-prestige-gold flex w-full min-h-[52px] items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3 text-left transition hover:border-gold/70 active:scale-[0.99]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-blue text-white shadow-[0_0_18px_rgba(77,166,255,0.35)]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[14px] font-bold text-white",
											children: "VIN Decoder"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-white",
											children: "Scan or type a VIN · NHTSA decode"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 -rotate-90 text-white" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pb-2 text-center text-[12px] tracking-[0.14em] text-white",
								children: "SPECS · MARKET · RECALLS"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "year",
				title: "Select year",
				subtitle: `${yearsForEra.length} years · ${eraLabel}`,
				items: yearsForEra,
				selected: year,
				onSelect: (v) => onCascadeSelect("year", v),
				onClose: () => setSheet(null),
				allowCustom: true,
				customLabel: "Use this year",
				customPlaceholder: "Type year…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "rvType",
				title: "RV Type",
				subtitle: year ? `${typeItems.length - 1} classes in ${year} · tap All types to skip` : "Narrows makes and models",
				items: typeItems,
				selected: rvType,
				onSelect: (v) => onCascadeSelect("rvType", v),
				onClose: () => setSheet(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "make",
				title: year ? `Manufacturers · ${year}` : "Manufacturers",
				subtitle: `${cascade.counts.makes} brands · or type any make`,
				items: makeItems,
				selected: make,
				onSelect: (v) => onCascadeSelect("make", v),
				onClose: () => setSheet(null),
				emptyHint: "No catalog brands for this filter",
				allowCustom: true,
				customLabel: "Use this manufacturer",
				customPlaceholder: "Type manufacturer name…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "model",
				title: make ? `Models · ${make}` : "Models",
				subtitle: `${cascade.counts.models} models · or type any model`,
				items: modelItems,
				selected: model,
				onSelect: (v) => onCascadeSelect("model", v),
				onClose: () => setSheet(null),
				emptyHint: "No catalog models — type yours",
				allowCustom: true,
				customLabel: "Use this model",
				customPlaceholder: "Type model name…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "floorplan",
				title: model ? `Floorplans · ${model}` : "Floorplans",
				subtitle: `${cascade.counts.floorplans} layouts · or Any`,
				items: floorplanItems,
				selected: floorplan,
				onSelect: (v) => onCascadeSelect("floorplan", v),
				onClose: () => setSheet(null),
				emptyHint: "Type a floorplan code or pick Any",
				allowCustom: true,
				customLabel: "Use this floorplan",
				customPlaceholder: "Type floorplan code…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSheet, {
				open: sheet === "era",
				title: "Year range",
				subtitle: "Optional · filters the year list",
				items: eraItems,
				selected: era,
				onSelect: onEraSelect,
				onClose: () => setSheet(null)
			}),
			vinOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinDecoder, {
					open: vinOpen,
					onClose: () => setVinOpen(false)
				})
			}) : null
		]
	});
}
function FieldButton({ label, value, placeholder, onClick, disabled, required, custom, sapphire, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mb-1 text-[10px] font-bold tracking-wide", sapphire ? "rvfax-sapphire-label" : "text-white"),
				children: [label, required ? " *" : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				onClick,
				"data-catalog-field": label,
				className: cn("flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3.5 py-3 text-left text-[14px] font-semibold text-white touch-manipulation active:scale-[0.99] disabled:opacity-100", value && !custom && "border-gold-border/60 bg-gold-dim/25", value && custom && "border-blue/50 bg-blue/10", !value && "border-white/35 bg-white/[0.04]", disabled && "border-white/25 bg-white/[0.03]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-white",
					children: value || placeholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-white" })]
			}),
			custom && value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 inline-block rounded-full border border-blue/40 bg-blue/20 px-1.5 py-0.5 text-[9px] font-bold text-blue",
				children: "Custom · live Grok"
			}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[10px] text-white/60",
				children: hint
			}) : null
		]
	});
}
function ResultCard({ result, saved, comparing = false, compareFull = false, onOpen, onToggleSave, onToggleCompare, onGrok }) {
	const rating = ratingFor(result.make, result.model, result.year);
	const [lo, hi] = result.data.lengthRange;
	const isDiesel = /diesel/i.test(result.data.fuelType);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "glass-prestige overflow-hidden rounded-[var(--radius-2xl)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onOpen,
			className: "block w-full text-left",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[16/10] overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: resolveCardImage(result.data),
						alt: `${result.data.type} — ${result.make} ${result.model}`,
						className: "size-full object-cover object-[center_40%]",
						crossOrigin: "anonymous"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute left-2.5 top-2.5 flex flex-wrap gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-lg",
							children: result.data.type
						}), result.custom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full border border-white/40 bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white",
							children: "Live research"
						}) : null]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-semibold text-blue",
								children: result.year
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-[20px] font-bold leading-tight text-white",
								children: [
									result.make,
									" ",
									result.model
								]
							}),
							result.floorplan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[12px] text-white",
								children: ["Floorplan: ", result.floorplan]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 flex flex-wrap items-center gap-2 text-[13px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-amber",
									children: ["★ ", rating.toFixed(1)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-sky-200",
									children: "Live specs & market on open"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onToggleSave,
						className: cn("flex size-11 shrink-0 items-center justify-center rounded-full border touch-manipulation", saved ? "border-ruby bg-ruby text-white" : "border-white/20 bg-white/5 text-white"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", saved && "fill-current") })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, { className: "size-3" }),
							label: lo === hi ? `${lo} ft` : `${lo}–${hi} ft`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, { className: "size-3" }),
							label: `Sleeps ${result.data.sleeps}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fuel, { className: "size-3" }),
							label: isDiesel ? "Diesel" : result.data.fuelType
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 pt-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpen,
							className: "min-h-[44px] rounded-full bg-blue px-4 py-2.5 text-[12px] font-bold text-white",
							children: "Details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onToggleCompare,
							disabled: !comparing && compareFull,
							className: cn("inline-flex min-h-[44px] items-center gap-1 rounded-full border px-4 py-2.5 text-[12px] font-bold disabled:opacity-40", comparing ? "border-sky-400/50 bg-sky-500/25 text-white" : "border-white/20 bg-black/40 text-white"),
							children: comparing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Comparing"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitCompare, { className: "size-3.5" }), " Compare"] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onGrok,
							className: "min-h-[44px] rounded-full border border-ruby-border bg-ruby-soft px-4 py-2.5 text-[12px] font-bold text-ruby",
							children: "RvGrok"
						})
					]
				})
			]
		})]
	});
}
function Chip({ icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white",
		children: [icon, label]
	});
}
//#endregion
export { RvFaxApp };
