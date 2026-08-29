import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as GitCompare, Ct as Bookmark, E as Ruler, G as List, J as Keyboard, M as Pencil, Q as Heart, T as ScanLine, Tt as ArrowUpLeft, W as LoaderCircle, _t as ChevronDown, b as Sparkles, et as Funnel, f as Trash2, gt as ChevronLeft, j as Plus, mt as ChevronUp, t as X, tt as Fuel, u as TriangleAlert, vt as Check, w as Search, wt as BedDouble } from "../_libs/lucide-react.mjs";
import { c as hapticSnap, r as useKeyboardInset, u as cn } from "./routes-JaTqMLOZ.mjs";
import { i as SuiteBackdrop, n as SHARED_PRESTIGE_BACKDROP, o as useAdaptiveGlass, r as ScrollSuiteHeader, s as usePullToReset, t as PullResetHint } from "./SuitePage-zyyPjbxm.mjs";
import { C as rvClassLabel, a as applyCascadeChange, b as modelYearWindow, c as compareSelectionKey, h as getModelsForYearMake, i as YEARS, l as countModelsForClass, m as getMakesForYear, n as RV_CLASS_TABS, o as buildCascadeOptions, r as RV_DATA, t as MAKES, v as modelAvailableInYear, w as searchCatalog, x as ratingFor, y as modelPickerMeta } from "./catalog-DMGYLcQX.mjs";
import { t as SelectSheet } from "./SelectSheet-D1fIgspx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvFaxApp-BsRVNJ1I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var rv_type_fifth_wheel_default = "/assets/rv-type-fifth-wheel-DBir8eUK.jpg";
var rv_type_travel_trailer_default = "/assets/rv-type-travel-trailer-Dpk4vMOH.jpg";
var rv_type_class_c_default = "/assets/rv-type-class-c-JdOuPH7n.jpg";
var rv_type_class_b_default = "/assets/rv-type-class-b-Bc6ZSAd5.jpg";
var rv_type_class_a_default = "/assets/rv-type-class-a-CKVnvj6H.jpg";
/** Fallback card media when type unknown */
var RV_CARD_MEDIA = rv_type_class_a_default;
var RV_TYPE_MEDIA = {
	fifthWheel: rv_type_fifth_wheel_default,
	travelTrailer: rv_type_travel_trailer_default,
	classC: rv_type_class_c_default,
	classB: rv_type_class_b_default,
	classA: rv_type_class_a_default
};
function mediaForRvType(type) {
	const t = (type || "").toLowerCase();
	if (!t) return RV_CARD_MEDIA;
	if (/fifth\s*wheel|5th\s*wheel|fiver/.test(t)) return RV_TYPE_MEDIA.fifthWheel;
	if (/toy\s*hauler/.test(t)) return RV_TYPE_MEDIA.fifthWheel;
	if (/travel\s*trailer|trailer|towable/.test(t) && !/motor/.test(t)) return RV_TYPE_MEDIA.travelTrailer;
	if (/class\s*b\+?|class b|van\b|sprinter\s*van|camper\s*van/.test(t)) return RV_TYPE_MEDIA.classB;
	if (/super\s*c|class\s*c/.test(t)) return RV_TYPE_MEDIA.classC;
	if (/class\s*a|diesel\s*pusher|motor\s*home|motorhome/.test(t)) return RV_TYPE_MEDIA.classA;
	if (/diesel|gas/.test(t) && /class/.test(t)) return RV_TYPE_MEDIA.classA;
	return RV_CARD_MEDIA;
}
function resolveCardImage(spec) {
	return mediaForRvType(spec.type) || spec.image || "/assets/rv-type-class-a-CKVnvj6H.jpg";
}
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
/** Tall iOS drum — ~3 rows above, selected, ~3 below */
var ROW_H = 42;
var CENTER = Math.floor(7 / 2);
var DRUM_H = 294;
/** Top spacer so index 0 centers in the selection band */
var PAD = 126;
/** px/ms — below this, settle to nearest row */
var SNAP_V = .05;
/** Cap release velocity (px/ms) */
var MAX_V = 4;
/** Rubber-band factor past ends while dragging */
var RUBBER = .28;
/** Snap ease duration */
var SNAP_MS = 220;
/** Movement before we treat gesture as a drag (not a tap) */
var DRAG_SLOP = 6;
function normalize(items) {
	return items.map((item) => typeof item === "string" ? {
		value: item,
		label: item,
		meta: void 0,
		disabled: false
	} : {
		value: item.value,
		label: item.label ?? item.value,
		meta: item.meta,
		disabled: item.disabled ?? false
	});
}
function clampIndex(i, len) {
	if (len <= 0) return 0;
	return Math.max(0, Math.min(len - 1, i));
}
function indexFromY(y, len) {
	if (len <= 0) return 0;
	return clampIndex(Math.round(y / ROW_H), len);
}
function yFromIndex(i) {
	return i * ROW_H;
}
function maxY(len) {
	return Math.max(0, (len - 1) * ROW_H);
}
function applyRubber(y, max) {
	if (y < 0) return y * RUBBER;
	if (y > max) return max + (y - max) * RUBBER;
	return y;
}
/**
* iOS-style picker wheel with real touch + inertia.
* Seven visible rows (~3 above / selected / ~3 below). Tap a row to lock it in.
* “Type / list” switches to the classic manual list + text entry.
*/
function WizardWheel({ title, subtitle, items, selected, onSelect, emptyHint = "No options for this step", allowCustom = false, customLabel = "Use custom entry", customPlaceholder = "Type your own…", stepIndex = 0, stepCount = 4, stepLabels, mode, onModeChange, hideModeTabs = false }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [keyboardOn, setKeyboardOn] = (0, import_react.useState)(false);
	const [internalMode, setInternalMode] = (0, import_react.useState)("wheel");
	const entryMode = mode ?? internalMode;
	const setEntryMode = (0, import_react.useCallback)((next) => {
		if (mode == null) setInternalMode(next);
		onModeChange?.(next);
	}, [mode, onModeChange]);
	const inputRef = (0, import_react.useRef)(null);
	const pickGuard = (0, import_react.useRef)(false);
	const [focusIdx, setFocusIdx] = (0, import_react.useState)(0);
	const focusIdxRef = (0, import_react.useRef)(0);
	/** Scroll position (px). Item i is centered when y ≈ i * ROW_H */
	const yRef = (0, import_react.useRef)(0);
	const trackRef = (0, import_react.useRef)(null);
	const contentRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(0);
	const draggingRef = (0, import_react.useRef)(false);
	const pointerIdRef = (0, import_react.useRef)(null);
	const activeTouchId = (0, import_react.useRef)(null);
	const dragStartClientY = (0, import_react.useRef)(0);
	const dragStartScrollY = (0, import_react.useRef)(0);
	const movedRef = (0, import_react.useRef)(false);
	const samplesRef = (0, import_react.useRef)([]);
	/** 'pointer' | 'touch' — avoid double-driving when both fire */
	const inputModeRef = (0, import_react.useRef)("none");
	const normalized = (0, import_react.useMemo)(() => normalize(items), [items]);
	const itemsSig = (0, import_react.useMemo)(() => `${normalized.length}:${normalized[0]?.value ?? ""}:${normalized[normalized.length - 1]?.value ?? ""}`, [normalized]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		if (!needle) return normalized;
		return normalized.filter((i) => i.label.toLowerCase().includes(needle) || i.value.toLowerCase().includes(needle) || (i.meta?.toLowerCase().includes(needle) ?? false));
	}, [normalized, q]);
	const filteredRef = (0, import_react.useRef)(filtered);
	filteredRef.current = filtered;
	const exactMatch = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		if (!needle) return false;
		return normalized.some((i) => i.value.toLowerCase() === needle || i.label.toLowerCase() === needle);
	}, [normalized, q]);
	const canUseCustom = allowCustom && q.trim().length > 0 && !exactMatch;
	const stopRaf = (0, import_react.useCallback)(() => {
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = 0;
		}
	}, []);
	/** Apply scroll Y to DOM immediately; React only when center index changes */
	const applyY = (0, import_react.useCallback)((y, len, haptic = true) => {
		yRef.current = y;
		const node = contentRef.current;
		if (node) node.style.transform = `translate3d(0, ${PAD - y}px, 0)`;
		const idx = indexFromY(y, len);
		if (idx !== focusIdxRef.current) {
			focusIdxRef.current = idx;
			setFocusIdx(idx);
			if (haptic) hapticSnap();
		}
	}, []);
	const snapTo = (0, import_react.useCallback)((index, animate) => {
		const len = filteredRef.current.length;
		const target = yFromIndex(clampIndex(index, len));
		stopRaf();
		if (!animate || !contentRef.current) {
			applyY(target, len, false);
			return;
		}
		const from = yRef.current;
		const dist = target - from;
		if (Math.abs(dist) < .5) {
			applyY(target, len, false);
			return;
		}
		const t0 = performance.now();
		const tick = (now) => {
			const t = Math.min(1, (now - t0) / SNAP_MS);
			const e = 1 - (1 - t) ** 3;
			applyY(from + dist * e, len, t < 1);
			if (t < 1) rafRef.current = requestAnimationFrame(tick);
			else {
				rafRef.current = 0;
				applyY(target, len, false);
			}
		};
		rafRef.current = requestAnimationFrame(tick);
	}, [applyY, stopRaf]);
	const startInertia = (0, import_react.useCallback)((v0) => {
		const len = filteredRef.current.length;
		const max = maxY(len);
		let v = Math.max(-4, Math.min(MAX_V, v0));
		stopRaf();
		if (Math.abs(v) < SNAP_V) {
			snapTo(indexFromY(yRef.current, len), true);
			return;
		}
		let last = performance.now();
		const loop = (now) => {
			const dtMs = Math.min(34, Math.max(0, now - last));
			last = now;
			const dt = dtMs / 1e3;
			let y = yRef.current + v * dtMs;
			v *= Math.exp(-5.2 * dt);
			if (y < 0 || y > max) {
				v *= .78;
				const bound = y < 0 ? 0 : max;
				y += (bound - y) * Math.min(1, 16 * dt);
				if (Math.abs(y - bound) < 1 && Math.abs(v) < SNAP_V * 2) {
					snapTo(bound <= 0 ? 0 : len - 1, true);
					return;
				}
			} else if (Math.abs(v) < SNAP_V) {
				snapTo(indexFromY(y, len), true);
				return;
			}
			applyY(y, len);
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
	}, [
		applyY,
		snapTo,
		stopRaf
	]);
	(0, import_react.useEffect)(() => {
		setQ("");
		setKeyboardOn(entryMode === "manual");
		pickGuard.current = false;
		stopRaf();
		draggingRef.current = false;
		inputModeRef.current = "none";
		const idx = filteredRef.current.findIndex((i) => i.value === selected);
		const i = idx >= 0 ? idx : 0;
		focusIdxRef.current = i;
		setFocusIdx(i);
		yRef.current = yFromIndex(i);
		if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
	}, [
		itemsSig,
		selected,
		title,
		stopRaf
	]);
	const qPrev = (0, import_react.useRef)(q);
	(0, import_react.useEffect)(() => {
		if (q === qPrev.current) return;
		qPrev.current = q;
		stopRaf();
		focusIdxRef.current = 0;
		setFocusIdx(0);
		yRef.current = 0;
		if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${PAD}px, 0)`;
	}, [q, stopRaf]);
	(0, import_react.useEffect)(() => {
		if (!keyboardOn && entryMode !== "manual") return;
		const t = window.setTimeout(() => {
			inputRef.current?.focus({ preventScroll: true });
		}, 40);
		return () => window.clearTimeout(t);
	}, [keyboardOn, entryMode]);
	(0, import_react.useEffect)(() => () => stopRaf(), [stopRaf]);
	const commit = (0, import_react.useCallback)((value) => {
		if (pickGuard.current) return;
		pickGuard.current = true;
		stopRaf();
		hapticSnap();
		onSelect(value);
		window.setTimeout(() => {
			pickGuard.current = false;
		}, 450);
	}, [onSelect, stopRaf]);
	const commitRef = (0, import_react.useRef)(commit);
	commitRef.current = commit;
	const stepBy = (0, import_react.useCallback)((delta) => {
		const len = filteredRef.current.length;
		if (!len) return;
		stopRaf();
		snapTo(clampIndex(focusIdxRef.current + delta, len), true);
	}, [snapTo, stopRaf]);
	const stepByRef = (0, import_react.useRef)(stepBy);
	stepByRef.current = stepBy;
	(0, import_react.useEffect)(() => {
		if (entryMode !== "wheel") return;
		const el = trackRef.current;
		if (!el) return;
		const begin = (clientY, mode) => {
			stopRaf();
			draggingRef.current = true;
			movedRef.current = false;
			inputModeRef.current = mode;
			dragStartClientY.current = clientY;
			dragStartScrollY.current = yRef.current;
			samplesRef.current = [{
				y: clientY,
				t: performance.now()
			}];
		};
		const move = (clientY) => {
			if (!draggingRef.current) return;
			const dy = clientY - dragStartClientY.current;
			if (Math.abs(dy) > DRAG_SLOP) movedRef.current = true;
			const len = filteredRef.current.length;
			const max = maxY(len);
			const raw = dragStartScrollY.current - dy;
			applyY(applyRubber(raw, max), len);
			const now = performance.now();
			samplesRef.current.push({
				y: clientY,
				t: now
			});
			while (samplesRef.current.length > 2 && now - samplesRef.current[0].t > 90) samplesRef.current.shift();
		};
		const end = (clientY) => {
			if (!draggingRef.current) return;
			draggingRef.current = false;
			inputModeRef.current = "none";
			pointerIdRef.current = null;
			activeTouchId.current = null;
			const len = filteredRef.current.length;
			if (!len) return;
			const samples = samplesRef.current;
			let v = 0;
			if (samples.length >= 2) {
				const a = samples[0];
				const b = samples[samples.length - 1];
				const dt = b.t - a.t;
				if (dt > 4) v = -(b.y - a.y) / dt;
			}
			samplesRef.current = [];
			if (!movedRef.current) {
				const rel = clientY - el.getBoundingClientRect().top;
				const tappedRow = Math.max(0, Math.min(6, Math.floor(rel / ROW_H)));
				const idx = clampIndex(focusIdxRef.current + (tappedRow - CENTER), len);
				const item = filteredRef.current[idx];
				if (item && !item.disabled) {
					focusIdxRef.current = idx;
					setFocusIdx(idx);
					yRef.current = yFromIndex(idx);
					if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
					commitRef.current(item.value);
					return;
				}
				snapTo(focusIdxRef.current, true);
				return;
			}
			startInertia(v);
		};
		const onTouchStart = (e) => {
			if (e.touches.length !== 1) return;
			if (inputModeRef.current === "pointer") return;
			const t = e.touches[0];
			activeTouchId.current = t.identifier;
			begin(t.clientY, "touch");
		};
		const onTouchMove = (e) => {
			if (inputModeRef.current !== "touch" || !draggingRef.current) return;
			const t = [...e.touches].find((x) => x.identifier === activeTouchId.current);
			if (!t) return;
			e.preventDefault();
			e.stopPropagation();
			move(t.clientY);
		};
		const onTouchEnd = (e) => {
			if (inputModeRef.current !== "touch") return;
			const t = [...e.changedTouches].find((x) => x.identifier === activeTouchId.current);
			if (!t) return;
			e.preventDefault();
			e.stopPropagation();
			end(t.clientY);
		};
		const onTouchCancel = () => {
			if (inputModeRef.current !== "touch") return;
			draggingRef.current = false;
			inputModeRef.current = "none";
			activeTouchId.current = null;
			snapTo(indexFromY(yRef.current, filteredRef.current.length), true);
		};
		const onPointerDown = (e) => {
			if (e.pointerType === "touch") return;
			if (e.button !== 0) return;
			pointerIdRef.current = e.pointerId;
			begin(e.clientY, "pointer");
			try {
				el.setPointerCapture(e.pointerId);
			} catch {}
		};
		const onPointerMove = (e) => {
			if (inputModeRef.current !== "pointer") return;
			if (pointerIdRef.current !== e.pointerId) return;
			e.preventDefault();
			move(e.clientY);
		};
		const onPointerUp = (e) => {
			if (inputModeRef.current !== "pointer") return;
			if (pointerIdRef.current !== e.pointerId) return;
			try {
				el.releasePointerCapture(e.pointerId);
			} catch {}
			end(e.clientY);
		};
		const onPointerCancel = (e) => {
			if (inputModeRef.current !== "pointer") return;
			if (pointerIdRef.current !== e.pointerId) return;
			draggingRef.current = false;
			inputModeRef.current = "none";
			pointerIdRef.current = null;
			snapTo(indexFromY(yRef.current, filteredRef.current.length), true);
		};
		const onWheel = (e) => {
			e.preventDefault();
			e.stopPropagation();
			stopRaf();
			const len = filteredRef.current.length;
			if (!len) return;
			const max = maxY(len);
			const next = Math.max(0, Math.min(max, yRef.current + e.deltaY));
			applyY(next, len);
			window.clearTimeout(onWheel._t);
			onWheel._t = window.setTimeout(() => {
				snapTo(indexFromY(yRef.current, len), true);
			}, 80);
		};
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		el.addEventListener("touchend", onTouchEnd, { passive: false });
		el.addEventListener("touchcancel", onTouchCancel, { passive: true });
		el.addEventListener("pointerdown", onPointerDown);
		el.addEventListener("pointermove", onPointerMove);
		el.addEventListener("pointerup", onPointerUp);
		el.addEventListener("pointercancel", onPointerCancel);
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchend", onTouchEnd);
			el.removeEventListener("touchcancel", onTouchCancel);
			el.removeEventListener("pointerdown", onPointerDown);
			el.removeEventListener("pointermove", onPointerMove);
			el.removeEventListener("pointerup", onPointerUp);
			el.removeEventListener("pointercancel", onPointerCancel);
			el.removeEventListener("wheel", onWheel);
			stopRaf();
		};
	}, [
		applyY,
		snapTo,
		startInertia,
		stopRaf,
		itemsSig,
		title,
		entryMode
	]);
	const focused = filtered[focusIdx] ?? null;
	const prevItem = focusIdx > 0 ? filtered[focusIdx - 1] : null;
	const nextItem = focusIdx < filtered.length - 1 ? filtered[focusIdx + 1] : null;
	const submitCustom = () => {
		const v = q.trim();
		if (!v) return;
		commit(v);
	};
	const openManual = () => {
		stopRaf();
		setEntryMode("manual");
		setKeyboardOn(true);
		setQ("");
	};
	const openWheel = () => {
		setEntryMode("wheel");
		setKeyboardOn(false);
		setQ("");
		const list = filteredRef.current;
		const idx = list.findIndex((i) => i.value === selected);
		const i = idx >= 0 ? idx : focusIdxRef.current;
		focusIdxRef.current = clampIndex(i, list.length);
		setFocusIdx(focusIdxRef.current);
		yRef.current = yFromIndex(focusIdxRef.current);
		requestAnimationFrame(() => {
			if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col",
		"data-wizard-wheel": true,
		"data-picker": true,
		"data-no-pull-reset": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1.5 flex items-center justify-center gap-1.5 px-1",
				children: Array.from({ length: stepCount }).map((_, i) => {
					const label = stepLabels?.[i];
					const done = i < stepIndex;
					const active = i === stepIndex;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-1 w-full max-w-[4.5rem] rounded-full transition-colors", active ? "bg-gold" : done ? "bg-blue/70" : "bg-white/15") }), label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-[9px] font-bold tracking-wide", active ? "text-gold-bright" : done ? "text-blue" : "text-white/45"),
							children: label
						}) : null]
					}, i);
				})
			}),
			!hideModeTabs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 grid grid-cols-2 rounded-full border border-white/15 bg-black/40 p-1",
				role: "tablist",
				"aria-label": "Search entry",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": entryMode === "wheel",
					onClick: openWheel,
					className: cn("inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition active:scale-[0.98]", entryMode === "wheel" ? "bg-gold-dim/45 text-gold-bright shadow-[inset_0_0_0_1px_rgba(212,168,72,0.45)]" : "text-white/70"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" }), "Wheel"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": entryMode === "manual",
					onClick: openManual,
					className: cn("inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition active:scale-[0.98]", entryMode === "manual" ? "bg-gold-dim/45 text-gold-bright shadow-[inset_0_0_0_1px_rgba(212,168,72,0.45)]" : "text-white/70"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-3.5" }), "Manual"]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1.5 text-center sm:text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[17px] font-bold tracking-tight text-white",
					children: title
				}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[12px] text-white/70",
					children: subtitle
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[12px] text-white/70",
					children: entryMode === "wheel" ? "Tap an option to lock it in" : "Type a value or tap a row"
				})]
			}),
			entryMode === "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				"data-no-pull-reset": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-field flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5",
						children: [
							allowCustom && keyboardOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4 shrink-0 text-blue" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-white/70" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								value: q,
								onChange: (e) => setQ(e.target.value),
								onFocus: () => setKeyboardOn(true),
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										if (canUseCustom) submitCustom();
										else if (filtered[0]) commit(filtered[0].value);
									}
								},
								inputMode: "search",
								enterKeyHint: canUseCustom ? "done" : "search",
								placeholder: allowCustom ? customPlaceholder : "Filter or search…",
								className: "w-full min-w-0 bg-transparent text-[14px] text-white outline-none placeholder:text-white/50"
							}),
							q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setQ(""),
								className: "flex size-8 shrink-0 items-center justify-center text-white/70",
								"aria-label": "Clear",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							}) : null
						]
					}),
					canUseCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: submitCustom,
						className: "flex min-h-[48px] w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-3 py-2.5 text-left active:scale-[0.99]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-bold text-white",
								children: customLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-[12px] text-white/85",
								children: [
									"“",
									q.trim(),
									"”"
								]
							})]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rv-scroll max-h-[min(42dvh,320px)] min-h-[180px] overflow-y-auto overscroll-contain rounded-[1.1rem] border border-white/15 bg-black/35 p-1.5",
						style: {
							WebkitOverflowScrolling: "touch",
							touchAction: "pan-y"
						},
						role: "listbox",
						"aria-label": title,
						children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-white/90",
								children: emptyHint
							}), allowCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] text-white/65",
								children: "Type above to enter a custom value."
							}) : null]
						}) : filtered.map((item) => {
							const active = selected === item.value;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "option",
								"aria-selected": active,
								disabled: item.disabled,
								onClick: () => {
									if (item.disabled) return;
									commit(item.value);
								},
								className: cn("mb-1 flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition active:scale-[0.99] touch-manipulation", active ? "border border-gold-border bg-gold-dim/40" : "border border-transparent bg-white/[0.03] hover:bg-white/[0.07]", item.disabled && "opacity-40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("text-[15px] font-semibold tabular-nums leading-tight", active ? "text-gold-bright" : "text-white"),
										children: item.label
									}), item.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 truncate text-[11px] text-white/65",
										children: item.meta
									}) : null]
								}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-gold" }) : null]
							}, item.value || "__empty__");
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-[10px] font-semibold tracking-wide text-white/45",
						children: [
							filtered.length,
							" option",
							filtered.length === 1 ? "" : "s",
							" · tap a row",
							allowCustom ? " · or type your own" : ""
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[1.1rem] border border-white/12 bg-black/35 px-3 py-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-white/90",
					children: emptyHint
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: openManual,
					className: "mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-blue/40 bg-blue/20 px-4 py-2 text-[12px] font-bold text-white active:scale-[0.98]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-3.5" }), "Type a value instead"]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-stretch gap-2",
				"data-no-pull-reset": true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col justify-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Previous option",
						disabled: !prevItem,
						onClick: () => stepBy(-1),
						className: "flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white disabled:opacity-25 active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next option",
						disabled: !nextItem,
						onClick: () => stepBy(1),
						className: "flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white disabled:opacity-25 active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: trackRef,
					className: "relative min-w-0 flex-1 select-none overflow-hidden rounded-[1.15rem] border border-white/18 bg-black/45",
					style: {
						height: DRUM_H,
						touchAction: "none",
						WebkitUserSelect: "none",
						userSelect: "none"
					},
					role: "listbox",
					"aria-label": title,
					"aria-activedescendant": focused ? `wheel-opt-${focusIdx}` : void 0,
					"data-no-pull-reset": true,
					"data-wheel-track": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-2 top-1/2 z-[2] -translate-y-1/2 rounded-xl border border-gold-border/55 bg-gold-dim/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
							style: { height: ROW_H },
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 top-0 z-[3] bg-gradient-to-b from-black/80 via-black/35 to-transparent",
							style: { height: ROW_H },
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/80 via-black/35 to-transparent",
							style: { height: ROW_H },
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: contentRef,
							className: "relative z-[1] will-change-transform",
							style: { transform: `translate3d(0, ${PAD - yRef.current}px, 0)` },
							children: filtered.map((item, i) => {
								const dist = Math.abs(focusIdx - i);
								const active = i === focusIdx;
								const opacity = dist === 0 ? 1 : dist === 1 ? .78 : dist === 2 ? .52 : dist === 3 ? .34 : .14;
								const scale = active ? 1 : dist === 1 ? .97 : dist === 2 ? .93 : .9;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									id: active ? `wheel-opt-${i}` : void 0,
									role: "option",
									"aria-selected": active,
									"data-wheel-value": item.value,
									className: "flex flex-col items-center justify-center px-3 text-center",
									style: {
										height: ROW_H,
										opacity,
										transform: `scale(${scale})`
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("flex max-w-full items-center gap-1.5", active ? "text-[18px] font-bold text-gold-bright" : "text-[15px] font-medium text-white/80"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate tabular-nums leading-none",
											children: item.label
										}), active && selected === item.value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 shrink-0 text-gold" }) : null]
									}), active && item.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 max-w-full truncate text-[10px] font-medium text-white/55",
										children: item.meta
									}) : null]
								}, `${item.value}__${i}`);
							})
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-center text-[10px] font-semibold tracking-wide text-white/45",
				children: filtered.length > 0 ? `${focusIdx + 1} of ${filtered.length} · tap to choose · swipe to spin` : "No options"
			})] })
		]
	});
}
function Highlight({ text, query }) {
	const q = query.trim();
	if (!q) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: text });
	const i = text.toLowerCase().indexOf(q.toLowerCase());
	if (i < 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: text });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		text.slice(0, i),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-bold text-inherit",
			children: text.slice(i, i + q.length)
		}),
		text.slice(i + q.length)
	] });
}
function SearchManual({ onSearch, searching }) {
	const [manYear, setManYear] = (0, import_react.useState)("");
	const [manMake, setManMake] = (0, import_react.useState)("");
	const [manModel, setManModel] = (0, import_react.useState)("");
	const [manFloorplan, setManFloorplan] = (0, import_react.useState)("");
	const [showMake, setShowMake] = (0, import_react.useState)(false);
	const [showModel, setShowModel] = (0, import_react.useState)(false);
	const [showFp, setShowFp] = (0, import_react.useState)(false);
	const makeSuggestions = (0, import_react.useMemo)(() => {
		const q = manMake.trim().toLowerCase();
		if (!q) return MAKES.slice(0, 8);
		return MAKES.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
	}, [manMake]);
	const modelSuggestions = (0, import_react.useMemo)(() => {
		const mkQuery = manMake.trim().toLowerCase();
		const matchingMakes = mkQuery ? MAKES.filter((m) => m.toLowerCase().includes(mkQuery)) : MAKES;
		const allModels = [];
		const seen = /* @__PURE__ */ new Set();
		for (const mk of matchingMakes) for (const mdl of Object.keys(RV_DATA[mk] ?? {})) {
			if (seen.has(mdl)) continue;
			seen.add(mdl);
			allModels.push(mdl);
		}
		allModels.sort((a, b) => a.localeCompare(b));
		const mq = manModel.trim().toLowerCase();
		if (!mq) return allModels.slice(0, 8);
		return allModels.filter((m) => m.toLowerCase().includes(mq)).slice(0, 8);
	}, [manMake, manModel]);
	const floorplanSuggestions = (0, import_react.useMemo)(() => {
		const mkQuery = manMake.trim().toLowerCase();
		const mdlQuery = manModel.trim().toLowerCase();
		if (!mkQuery && !mdlQuery) return [];
		const matchingMake = MAKES.find((m) => m.toLowerCase() === mkQuery) ?? MAKES.find((m) => mkQuery && m.toLowerCase().includes(mkQuery));
		if (!matchingMake) return [];
		const models = Object.keys(RV_DATA[matchingMake] ?? {});
		const matchingModel = models.find((m) => m.toLowerCase() === mdlQuery) ?? models.find((m) => mdlQuery && m.toLowerCase().includes(mdlQuery));
		if (!matchingModel) return [];
		const fps = RV_DATA[matchingMake]?.[matchingModel]?.floorplans ?? [];
		const fq = manFloorplan.trim().toLowerCase();
		if (!fq) return fps.slice(0, 12);
		return fps.filter((fp) => fp.toLowerCase().includes(fq)).slice(0, 12);
	}, [
		manMake,
		manModel,
		manFloorplan
	]);
	const ownerMakeFor = (mdl) => {
		const mkQuery = manMake.trim().toLowerCase();
		return MAKES.find((m) => m.toLowerCase().includes(mkQuery) && RV_DATA[m]?.[mdl]) ?? MAKES.find((m) => RV_DATA[m]?.[mdl]);
	};
	const modelType = (mdl) => {
		const mk = ownerMakeFor(mdl);
		return mk ? RV_DATA[mk]?.[mdl]?.type ?? "" : "";
	};
	const ready = manMake.trim().length > 0 || manModel.trim().length > 0;
	const submit = () => {
		if (!ready) return;
		let make = manMake.trim();
		const model = manModel.trim();
		if (!make && model) make = ownerMakeFor(model) ?? "";
		onSearch({
			year: manYear.trim(),
			make,
			model,
			floorplan: manFloorplan.trim()
		});
	};
	const clear = () => {
		setManYear("");
		setManMake("");
		setManModel("");
		setManFloorplan("");
		setShowMake(false);
		setShowModel(false);
		setShowFp(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2.5",
		"data-no-pull-reset": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] leading-snug text-white",
				children: "Type any year, make, model, or floorplan — works for any RV brand"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex-[0.85] space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[11px] font-bold tracking-[0.12em] text-white",
						children: "YEAR"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: manYear,
						onChange: (e) => setManYear(e.target.value.replace(/\D/g, "").slice(0, 4)),
						onFocus: () => {
							setShowMake(false);
							setShowModel(false);
							setShowFp(false);
						},
						inputMode: "numeric",
						maxLength: 4,
						placeholder: "e.g. 2024",
						className: "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-[1.6] space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[11px] font-bold tracking-[0.12em] text-white",
							children: "MAKE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: manMake,
							onChange: (e) => {
								const t = e.target.value;
								if (t !== manMake) {
									setManModel("");
									setManFloorplan("");
								}
								setManMake(t);
								setShowMake(true);
								setShowModel(false);
								setShowFp(false);
							},
							onFocus: () => {
								setShowMake(true);
								setShowModel(false);
								setShowFp(false);
							},
							onBlur: () => window.setTimeout(() => setShowMake(false), 180),
							autoCorrect: "off",
							autoCapitalize: "words",
							placeholder: "e.g. Entegra Coach",
							className: cn("glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40", showMake && makeSuggestions.length > 0 && "rounded-b-none border-blue/50")
						}),
						showMake && makeSuggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "absolute left-0 right-0 top-full z-30 overflow-hidden rounded-b-[var(--radius-md)] border border-t-0 border-blue/40 bg-[#0D1F3C] shadow-xl",
							children: makeSuggestions.map((brand, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cn("flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-blue/20", idx < makeSuggestions.length - 1 && "border-b border-blue/15"),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => {
									if (brand !== manMake) {
										setManModel("");
										setManFloorplan("");
									}
									setManMake(brand);
									setShowMake(false);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 truncate",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
										text: brand,
										query: manMake
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpLeft, { className: "size-3 shrink-0 text-white/40" })]
							}) }, brand))
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[10px] font-bold tracking-[0.12em] text-white/50",
						children: "MODEL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: manModel,
						onChange: (e) => {
							setManModel(e.target.value);
							setShowModel(true);
							setShowMake(false);
							setShowFp(false);
						},
						onFocus: () => {
							setShowModel(true);
							setShowMake(false);
							setShowFp(false);
						},
						onBlur: () => window.setTimeout(() => setShowModel(false), 180),
						autoCorrect: "off",
						autoCapitalize: "words",
						placeholder: "e.g. Anthem, Accolade, Dutch Star…",
						className: cn("glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40", showModel && modelSuggestions.length > 0 && "rounded-b-none border-gold-border/60")
					}),
					showModel && modelSuggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "absolute left-0 right-0 top-full z-30 max-h-56 overflow-y-auto rounded-b-[var(--radius-md)] border border-t-0 border-gold-border/40 bg-[#1A1500] shadow-xl",
						children: modelSuggestions.map((mdl, idx) => {
							const rvType = modelType(mdl);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-gold-dim/20", idx < modelSuggestions.length - 1 && "border-b border-white/10"),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => {
									setManModel(mdl);
									const owner = ownerMakeFor(mdl);
									if (owner && owner !== manMake) setManMake(owner);
									setShowModel(false);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
											text: mdl,
											query: manModel
										})
									}),
									rvType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-[90px] shrink-0 truncate text-[9px] font-medium text-gold/70",
										children: rvType
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpLeft, { className: "size-3 shrink-0 text-white/40" })
								]
							}) }, `${mdl}-${idx}`);
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-[10px] font-bold tracking-[0.12em] text-white/50",
						children: [
							"FLOORPLAN",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal tracking-wide text-white/40",
								children: "OPTIONAL"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: manFloorplan,
						onChange: (e) => {
							setManFloorplan(e.target.value);
							setShowFp(true);
							setShowMake(false);
							setShowModel(false);
						},
						onFocus: () => {
							setShowFp(true);
							setShowMake(false);
							setShowModel(false);
						},
						onBlur: () => window.setTimeout(() => setShowFp(false), 180),
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								submit();
							}
						},
						autoCorrect: "off",
						autoCapitalize: "characters",
						placeholder: "e.g. 44B, 37TS, 45OPP…",
						className: cn("glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40", showFp && floorplanSuggestions.length > 0 && "rounded-b-none border-emerald-400/50")
					}),
					showFp && floorplanSuggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "absolute left-0 right-0 top-full z-30 max-h-52 overflow-y-auto rounded-b-[var(--radius-md)] border border-t-0 border-emerald-500/40 bg-[#001A0D] shadow-xl",
						children: floorplanSuggestions.map((fp, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: cn("flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-emerald-500/15", idx < floorplanSuggestions.length - 1 && "border-b border-emerald-500/15"),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => {
								setManFloorplan(fp);
								setShowFp(false);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
									text: fp,
									query: manFloorplan
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpLeft, { className: "size-3 shrink-0 text-white/40" })]
						}) }, `${fp}-${idx}`))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: !ready || searching,
				onClick: submit,
				className: cn("flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-[15px] font-bold active:scale-[0.98]", ready ? "bg-[#FF6B35] text-white shadow-[0_6px_18px_rgba(255,107,53,0.4)]" : "border border-white/10 bg-white/5 text-white/40"),
				children: searching ? "Searching…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "Search"] })
			}),
			manYear || manMake || manModel || manFloorplan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: clear,
				className: "mx-auto flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white/45",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }), "Clear all"]
			}) : null
		]
	});
}
var RvDetail = (0, import_react.lazy)(() => import("./RvDetail-DROwd0Gk.mjs").then((m) => ({ default: m.RvDetail })));
var RvCompare = (0, import_react.lazy)(() => import("./RvCompare-C_2AYRtF.mjs").then((m) => ({ default: m.RvCompare })));
var VinDecoder = (0, import_react.lazy)(() => import("./VinDecoder-EoMXwudG.mjs").then((m) => ({ default: m.VinDecoder })));
function PanelFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-white/10" })
	});
}
var SAVED_KEY = "rvfax_saved_v1";
var PRESTIGE_BACKDROP = SHARED_PRESTIGE_BACKDROP;
var WIZARD_STEP_ORDER = [
	"year",
	"type",
	"make",
	"model",
	"floorplan"
];
var WIZARD_STEP_LABELS = [
	"Year",
	"Type",
	"Make",
	"Model",
	"Floorplan"
];
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
	const [wizardStep, setWizardStep] = (0, import_react.useState)("year");
	const [searchMode, setSearchMode] = (0, import_react.useState)("wizard");
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
		setWizardStep("year");
		setSearchMode("wizard");
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
				setWizardStep("year");
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
		meta: year ? `${year} · brand in catalog` : "All years · full brand list"
	})), [cascade.makes, year]);
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
	const rvTypeItems = typeItems;
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
	const handleManualSearch = (0, import_react.useCallback)((sel) => {
		let y = sel.year.trim();
		const mk = sel.make.trim();
		const mdl = sel.model.trim();
		if (!mk && !mdl) return;
		if (!y && mk && mdl) {
			const spec = RV_DATA[mk]?.[mdl];
			if (spec) y = String(modelYearWindow(spec).end);
		}
		if (!y) y = YEARS[0] ?? "2026";
		const next = {
			year: y,
			make: mk,
			model: mdl,
			floorplan: sel.floorplan.trim(),
			rvType
		};
		applySel(next);
		runSearchNow(next);
	}, [
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
	const onWizardPick = (0, import_react.useCallback)((field, value) => {
		setSuggestions([]);
		const next = applyCascadeChange({
			year,
			make,
			model,
			floorplan,
			rvType
		}, field, value);
		applySel(next);
		setHasSearched(false);
		setResults([]);
		if (field === "year") {
			setWizardStep("type");
			return;
		}
		if (field === "rvType") {
			setWizardStep("make");
			return;
		}
		if (field === "make") {
			setWizardStep("model");
			return;
		}
		if (field === "model") {
			setWizardStep("floorplan");
			return;
		}
		if (field === "floorplan") runSearchNow({
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
	const goToWizardStep = (0, import_react.useCallback)((step) => {
		if (WIZARD_STEP_ORDER.indexOf(step) <= 0) {
			applySel({
				year: "",
				make: "",
				model: "",
				floorplan: "",
				rvType: ""
			});
			setWizardStep("year");
		} else if (step === "type") {
			applySel({
				year,
				make: "",
				model: "",
				floorplan: "",
				rvType: ""
			});
			setWizardStep("type");
		} else if (step === "make") {
			applySel({
				year,
				make: "",
				model: "",
				floorplan: "",
				rvType
			});
			setWizardStep("make");
		} else if (step === "model") {
			applySel({
				year,
				make,
				model: "",
				floorplan: "",
				rvType
			});
			setWizardStep("model");
		} else setWizardStep("floorplan");
		setHasSearched(false);
		setResults([]);
		setSuggestions([]);
	}, [
		year,
		make,
		rvType,
		applySel
	]);
	const wizardBack = (0, import_react.useCallback)(() => {
		const idx = WIZARD_STEP_ORDER.indexOf(wizardStep);
		if (idx <= 0) return;
		goToWizardStep(WIZARD_STEP_ORDER[idx - 1]);
	}, [wizardStep, goToWizardStep]);
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
		setWizardStep(hit.model ? "floorplan" : "model");
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
	rvType && rvClassLabel(rvType);
	const stepIndex = WIZARD_STEP_ORDER.indexOf(wizardStep);
	const pathChips = (0, import_react.useMemo)(() => {
		const chips = [];
		if (year) chips.push({
			step: "year",
			label: "Year",
			value: year
		});
		if (wizardStep !== "year" && wizardStep !== "type") chips.push({
			step: "type",
			label: "Type",
			value: rvType ? rvClassLabel(rvType) : "All"
		});
		if (make) chips.push({
			step: "make",
			label: "Make",
			value: make
		});
		if (model) chips.push({
			step: "model",
			label: "Model",
			value: model
		});
		if (floorplan) chips.push({
			step: "floorplan",
			label: "Floorplan",
			value: floorplan
		});
		return chips;
	}, [
		year,
		rvType,
		make,
		model,
		floorplan,
		wizardStep
	]);
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[16px] font-extrabold tracking-tight text-white",
											children: "Search Wizard"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setFiltersOpen((v) => !v),
												className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-left transition active:scale-[0.98]", filtersOpen || rvType || era !== "all" ? "border-sapphire/50 bg-sapphire/20" : "border-white/20 bg-black/30"),
												"aria-expanded": filtersOpen,
												"aria-controls": "rvfax-optional-filters",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: cn("size-3.5 shrink-0", filtersOpen || rvType || era !== "all" ? "text-blue" : "text-white/80") }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "hidden min-[360px]:inline text-[10px] font-bold tracking-wide text-white",
														children: "Filters"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-3.5 shrink-0 text-white/80 transition-transform", filtersOpen && "rotate-180") })
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-1 rounded-full border border-white/10 bg-black/30 p-0.5",
												role: "tablist",
												"aria-label": "Search mode",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													role: "tab",
													"aria-selected": searchMode === "wizard",
													onClick: () => setSearchMode("wizard"),
													className: cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold", searchMode === "wizard" ? "border border-blue/45 bg-blue/20 text-blue" : "text-white/55"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), "Wizard"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													role: "tab",
													"aria-selected": searchMode === "manual",
													onClick: () => setSearchMode("manual"),
													className: cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold", searchMode === "manual" ? "border border-[#FF6B35]/50 bg-[#FF6B35]/20 text-[#FF6B35]" : "text-white/55"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" }), "Manual"]
												})]
											})]
										})]
									}),
									filtersOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										id: "rvfax-optional-filters",
										className: "space-y-2.5 rounded-[var(--radius-md)] border border-white/10 bg-black/25 p-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2 px-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "rvfax-sapphire-label text-[10px] font-bold tracking-[0.12em]",
													children: "OPTIONAL FILTERS"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [rvType || era !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => {
															setRvType("");
															setEra("all");
														},
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
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "RV Type",
												value: rvType ? rvClassLabel(rvType) : "All classes",
												placeholder: "All classes (optional)",
												onClick: () => setSheet("rvType"),
												sapphire: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldButton, {
												label: "Year range",
												value: `${eraLabel} · ${eraSub}`,
												placeholder: "All years",
												onClick: () => setSheet("era"),
												sapphire: true
											})
										]
									}) : null,
									searchMode === "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchManual, {
										searching,
										onSearch: handleManualSearch
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										pathChips.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3",
											children: [wizardStep !== "year" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: wizardBack,
												className: "inline-flex min-h-[36px] items-center gap-0.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white active:scale-[0.98]",
												"aria-label": "Back one step",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" }), "Back"]
											}) : null, pathChips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => goToWizardStep(c.step),
												className: cn("inline-flex max-w-[46%] items-center gap-1 rounded-full border px-2.5 py-1.5 text-left active:scale-[0.98]", wizardStep === c.step ? "border-gold-border bg-gold-dim/30" : "border-white/15 bg-white/5"),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[9px] font-bold tracking-wide text-white/55",
													children: c.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate text-[11px] font-bold text-white",
													children: c.value
												})]
											}, c.step))]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-white/10 pt-2",
											"data-no-pull-reset": true,
											"data-wizard-wheel": true,
											onTouchMove: (e) => {
												if (e.target?.closest?.("[data-wheel-track]")) e.stopPropagation();
											},
											children: [
												wizardStep === "year" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardWheel, {
													title: "Select year",
													subtitle: `${yearsForEra.length} years · ${eraLabel}`,
													items: yearsForEra,
													selected: year,
													onSelect: (v) => onWizardPick("year", v),
													hideModeTabs: true,
													mode: "wheel",
													allowCustom: true,
													customLabel: "Use this year",
													customPlaceholder: "Type year…",
													stepIndex,
													stepCount: 5,
													stepLabels: WIZARD_STEP_LABELS
												}, `year-${era}`) : null,
												wizardStep === "type" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardWheel, {
													title: "Select RV type",
													subtitle: year ? `${typeItems.length - 1} classes in ${year} · pick one to narrow brands` : "Class A, B, C, Super C, fifth wheel, trailer, toy hauler",
													items: typeItems,
													selected: rvType,
													onSelect: (v) => onWizardPick("rvType", v),
													hideModeTabs: true,
													mode: "wheel",
													emptyHint: "No classes for this year — pick All types",
													stepIndex,
													stepCount: 5,
													stepLabels: WIZARD_STEP_LABELS
												}, `type-${year || "all"}`) : null,
												wizardStep === "make" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardWheel, {
													title: "Select make",
													subtitle: year && rvType ? `${cascade.counts.makes} brand${cascade.counts.makes === 1 ? "" : "s"} · ${year} ${rvClassLabel(rvType)}` : year ? `${cascade.counts.makes} brand${cascade.counts.makes === 1 ? "" : "s"} available in ${year}` : `${cascade.counts.makes} brands · all years`,
													items: makeItems,
													selected: make,
													onSelect: (v) => onWizardPick("make", v),
													hideModeTabs: true,
													mode: "wheel",
													emptyHint: year ? `No brands in catalog for ${year} · try filters or type a make` : "No brands · type a manufacturer",
													allowCustom: true,
													customLabel: "Use this manufacturer",
													customPlaceholder: "Type manufacturer…",
													stepIndex,
													stepCount: 5,
													stepLabels: WIZARD_STEP_LABELS
												}, `make-${year}-${rvType || "all"}`) : null,
												wizardStep === "model" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardWheel, {
													title: "Select model",
													subtitle: year && make ? `${cascade.counts.models} model${cascade.counts.models === 1 ? "" : "s"} · ${year} ${make}` : make ? `${cascade.counts.models} models · ${make} (all years)` : `${cascade.counts.models} models`,
													items: modelItems,
													selected: model,
													onSelect: (v) => onWizardPick("model", v),
													hideModeTabs: true,
													mode: "wheel",
													emptyHint: year && make ? `No ${make} models for ${year} — type yours` : "No catalog models — type yours",
													allowCustom: true,
													customLabel: "Use this model",
													customPlaceholder: "Type model name…",
													stepIndex,
													stepCount: 5,
													stepLabels: WIZARD_STEP_LABELS
												}, `model-${year}-${make}-${rvType || "all"}`) : null,
												wizardStep === "floorplan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardWheel, {
													title: "Select floorplan",
													subtitle: year && make && model ? cascade.counts.floorplans ? `${cascade.counts.floorplans} layout${cascade.counts.floorplans === 1 ? "" : "s"} · ${year} ${make} ${model}` : `No ${year} layouts listed · pick Any to open report` : "Pick a layout or Any",
													items: floorplanItems,
													selected: floorplan,
													onSelect: (v) => onWizardPick("floorplan", v),
													hideModeTabs: true,
													mode: "wheel",
													emptyHint: "Type a floorplan code or pick Any",
													allowCustom: true,
													customLabel: "Use this floorplan",
													customPlaceholder: "Type floorplan code…",
													stepIndex,
													stepCount: 5,
													stepLabels: WIZARD_STEP_LABELS
												}, `fp-${year}-${make}-${model}`) : null
											]
										}),
										searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center justify-center gap-2 text-[12px] font-semibold text-sky-200",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Opening report…"]
										}) : cascade.canSearch && wizardStep === "floorplan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: runSearch,
											className: "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-gold-border/50 bg-gold-dim/25 py-2.5 text-[12px] font-bold text-gold-bright active:scale-[0.99]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" }), "Open report without floorplan"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-center text-[11px] leading-snug text-white/65",
											children: "One step at a time — year, make, model, then floorplan. Report opens automatically."
										})
									] })
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
				open: sheet === "rvType",
				title: "RV Type",
				subtitle: "Optional filter · narrows catalog",
				items: rvTypeItems,
				selected: rvType,
				onSelect: (v) => {
					setRvType(v);
					setHasSearched(false);
					setResults([]);
				},
				onClose: () => setSheet(null)
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
function FieldButton({ label, value, placeholder, onClick, disabled, required, custom, sapphire }) {
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
				className: cn("flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3.5 py-3 text-left text-[14px] font-semibold text-white touch-manipulation active:scale-[0.99] disabled:opacity-100", value && !custom && "border-gold-border/60 bg-gold-dim/25", value && custom && "border-blue/50 bg-blue/10", !value && "border-white/35 bg-white/[0.04]", disabled && "border-white/25 bg-white/[0.03]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-white",
					children: value || placeholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-white" })]
			}),
			custom && value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 inline-block rounded-full border border-blue/40 bg-blue/20 px-1.5 py-0.5 text-[9px] font-bold text-blue",
				children: "Custom · live Grok"
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
export { RvFaxApp, resolveCardImage as n, RV_CARD_MEDIA as t };
