import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Plus, C as Search, G as Keyboard, ht as Check, t as X } from "../_libs/lucide-react.mjs";
import { n as scrollFieldIntoVisibleArea, r as useKeyboardInset, s as hapticLight, u as cn } from "./routes-DqDGUVQW.mjs";
import { t as Capacitor } from "../_libs/capacitor__core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SelectSheet-aKbu9anf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* iPhone WKWebView (Capacitor) reports touch clientY in a different space
* than position:fixed / overlay layout when the native webview uses
* contentInsetAdjustmentBehavior = automatic.
*
* Symptom: tapping a list row selects the row below it. Preview (Chrome)
* is fine. Offset ≈ status-bar / safe-area (~47–59px) ≈ one 52px row.
*
* When CSS env(safe-area-inset-top) is live, UIKit is NOT eating the inset
* (contentInset never) and clientY already matches layout → bias 0.
* When env() is 0 on a notched native iPhone, UIKit already inset the
* scroll view and touches are still in screen space → apply typical inset.
*/
function isIosNativeWebView() {
	if (typeof window === "undefined") return false;
	try {
		if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") return true;
	} catch {}
	try {
		const C = window.Capacitor;
		if (C?.isNativePlatform?.() && C.getPlatform?.() === "ios") return true;
	} catch {}
	const ua = navigator.userAgent || "";
	if (!(/iPhone|iPad|iPod/.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return false;
	const safari = window.safari;
	const hasSafari = typeof safari === "object" && safari !== null;
	const handlers = window.webkit?.messageHandlers;
	return !hasSafari && Boolean(handlers && Object.keys(handlers).length);
}
function readSafeTopPx() {
	if (typeof window === "undefined") return 0;
	const raw = getComputedStyle(document.documentElement).getPropertyValue("--safe-top").trim();
	const n = Number.parseFloat(raw);
	return Number.isFinite(n) && n > 0 ? n : 0;
}
function iosSheetTapBiasFrom(opts) {
	if (!opts.nativeIos) return 0;
	if (opts.sat >= 20) return 0;
	if (opts.screenLong >= 812) return 54;
	return 20;
}
/** Pixels to subtract from clientY so the probe lands on the painted row. */
function iosSheetTapBias() {
	if (typeof window === "undefined") return 0;
	const long = Math.max(window.screen?.height ?? 0, window.screen?.width ?? 0);
	return iosSheetTapBiasFrom({
		nativeIos: isIosNativeWebView(),
		sat: readSafeTopPx(),
		screenLong: long
	});
}
/**
* Pure hit-test used by the sheet and by the offset regression test.
* `y` must already be in the same space as the boxes (bias applied).
*/
function hitSheetItemAt(x, y, boxes, slack = {}) {
	if (!boxes.length) return null;
	for (const b of boxes) if (y >= b.top && y < b.bottom && x >= b.left - 4 && x <= b.right + 4) return b.value;
	const first = boxes[0];
	const last = boxes[boxes.length - 1];
	const firstSlack = slack.first ?? 0;
	const lastSlack = slack.last ?? 12;
	if (y < first.top && y >= first.top - firstSlack - 8) return first.value;
	if (y >= last.bottom && y <= last.bottom + lastSlack) return last.value;
	return null;
}
function resolveSheetItemValue(clientX, clientY, list) {
	if (!list) return null;
	const vv = typeof window !== "undefined" ? window.visualViewport : null;
	const bias = iosSheetTapBias();
	const x = clientX + (vv?.offsetLeft ?? 0);
	const y = clientY + (vv?.offsetTop ?? 0) - bias;
	const items = list.querySelectorAll("[data-sheet-item]:not(:disabled)");
	const boxes = [];
	for (const el of items) {
		const r = el.getBoundingClientRect();
		boxes.push({
			value: el.getAttribute("data-value") ?? "",
			top: r.top,
			bottom: r.bottom,
			left: r.left,
			right: r.right
		});
	}
	return hitSheetItemAt(x, y, boxes, {
		first: Math.max(bias, 12),
		last: 12
	});
}
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
/**
* Floating mobile picker.
* - Drag handle (top) to dismiss
* - List scrolls freely — item taps always select (no drag-to-dismiss race)
* - Keyboard OFF by default; tap Type for search / custom entry
*/
function SelectSheet({ open, title, subtitle, items, selected, onSelect, onClose, emptyHint = "No options for this selection", allowCustom = false, customLabel = "Use custom entry", customPlaceholder = "Type make, model, or floorplan…" }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [keyboardOn, setKeyboardOn] = (0, import_react.useState)(false);
	const [dragY, setDragY] = (0, import_react.useState)(0);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [exiting, setExiting] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const dragYRef = (0, import_react.useRef)(0);
	const selectedGuard = (0, import_react.useRef)(false);
	const itemTouchRef = (0, import_react.useRef)(null);
	const kb = useKeyboardInset();
	const dragRef = (0, import_react.useRef)({
		active: false,
		startY: 0,
		origin: 0,
		lastY: 0,
		lastT: 0,
		velocity: 0
	});
	const setDragYBoth = (0, import_react.useCallback)((y) => {
		setDragY((prev) => {
			const next = typeof y === "function" ? y(prev) : y;
			dragYRef.current = next;
			return next;
		});
	}, []);
	const dismiss = (0, import_react.useCallback)(() => {
		if (exiting) return;
		setExiting(true);
		inputRef.current?.blur();
		const y = Math.max(dragYRef.current, 280);
		dragYRef.current = y;
		setDragY(y);
		window.setTimeout(() => {
			setExiting(false);
			dragYRef.current = 0;
			setDragY(0);
			selectedGuard.current = false;
			onClose();
		}, 200);
	}, [exiting, onClose]);
	const pick = (0, import_react.useCallback)((value) => {
		if (selectedGuard.current || exiting) return;
		selectedGuard.current = true;
		hapticLight();
		onSelect(value);
		dismiss();
	}, [
		dismiss,
		exiting,
		onSelect
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setQ("");
		setKeyboardOn(false);
		dragYRef.current = 0;
		setDragY(0);
		setDragging(false);
		setExiting(false);
		selectedGuard.current = false;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open, title]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				dismiss();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, dismiss]);
	(0, import_react.useEffect)(() => {
		if (!open || !selected) return;
		const t = window.setTimeout(() => {
			try {
				(listRef.current?.querySelector(`[data-value="${CSS.escape(selected)}"]`))?.scrollIntoView({ block: "center" });
			} catch {}
		}, 80);
		return () => window.clearTimeout(t);
	}, [
		open,
		selected,
		title
	]);
	(0, import_react.useEffect)(() => {
		if (!open || !keyboardOn) return;
		const t = window.setTimeout(() => {
			inputRef.current?.focus({ preventScroll: true });
			const el = inputRef.current;
			if (!el) return;
			for (const delay of [
				60,
				200,
				360,
				520
			]) window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), delay);
		}, 50);
		return () => window.clearTimeout(t);
	}, [
		open,
		keyboardOn,
		kb.inset
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const list = listRef.current;
		if (!list) return;
		const onTouchEnd = (e) => {
			if (!isIosNativeWebView()) return;
			const t = e.changedTouches.item(0);
			if (!t) return;
			const start = itemTouchRef.current;
			if (start) {
				const moved = Math.abs(t.clientX - start.x) > 12 || Math.abs(t.clientY - start.y) > 12;
				itemTouchRef.current = null;
				if (moved) return;
			}
			const value = resolveSheetItemValue(t.clientX, t.clientY, list);
			if (value == null) return;
			e.preventDefault();
			pick(value);
		};
		list.addEventListener("touchend", onTouchEnd, { passive: false });
		return () => list.removeEventListener("touchend", onTouchEnd);
	}, [open, pick]);
	/** Drag only from the handle / header — never from the scroll list */
	const beginHandleDrag = (0, import_react.useCallback)((e) => {
		if (exiting || keyboardOn) return;
		if (e.target.closest("button, input, a")) return;
		dragRef.current = {
			active: true,
			startY: e.clientY,
			origin: dragY,
			lastY: e.clientY,
			lastT: performance.now(),
			velocity: 0
		};
		setDragging(true);
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	}, [
		dragY,
		exiting,
		keyboardOn
	]);
	const moveHandleDrag = (0, import_react.useCallback)((e) => {
		const d = dragRef.current;
		if (!d.active || exiting) return;
		const now = performance.now();
		const dt = Math.max(1, now - d.lastT);
		d.velocity = (e.clientY - d.lastY) / dt * 1e3;
		d.lastY = e.clientY;
		d.lastT = now;
		let next = d.origin + (e.clientY - d.startY);
		if (next < 0) next = next * .25;
		next = Math.min(420, Math.max(-40, next));
		setDragYBoth(next);
	}, [exiting, setDragYBoth]);
	const endHandleDrag = (0, import_react.useCallback)((e) => {
		const d = dragRef.current;
		if (!d.active) return;
		d.active = false;
		setDragging(false);
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {}
		const y = dragYRef.current;
		if (d.velocity > 900 && y > 24 || y > 90) {
			dismiss();
			return;
		}
		setDragYBoth(0);
	}, [dismiss, setDragYBoth]);
	const normalized = (0, import_react.useMemo)(() => normalize(items), [items]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		if (!needle) return normalized;
		return normalized.filter((i) => i.label.toLowerCase().includes(needle) || i.value.toLowerCase().includes(needle) || (i.meta?.toLowerCase().includes(needle) ?? false));
	}, [normalized, q]);
	const exactMatch = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		if (!needle) return false;
		return normalized.some((i) => i.value.toLowerCase() === needle || i.label.toLowerCase() === needle);
	}, [normalized, q]);
	const canUseCustom = allowCustom && q.trim().length > 0 && !exactMatch;
	const submitCustom = () => {
		const v = q.trim();
		if (!v) return;
		pick(v);
	};
	if (!open) return null;
	const showSearch = allowCustom || normalized.length > 6;
	const enableKeyboard = () => setKeyboardOn(true);
	const disableKeyboard = () => {
		setKeyboardOn(false);
		inputRef.current?.blur();
	};
	const dismissProgress = Math.min(1, Math.max(0, dragY / 160));
	const backdropOpacity = .55 * (1 - dismissProgress * .65);
	const kbPad = kb.open || keyboardOn ? Math.max(kb.inset, keyboardOn ? 12 : 0) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "select-sheet-root fixed inset-x-0 top-0 z-[80] flex items-end justify-center px-3 sm:items-center sm:px-4",
		style: {
			height: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
			top: kb.vvOffsetTop > 0 ? kb.vvOffsetTop : 0,
			paddingTop: "max(0.75rem, env(safe-area-inset-top))",
			paddingBottom: kbPad > 0 ? `max(0.75rem, ${kbPad + 12}px)` : "calc(5.75rem + env(safe-area-inset-bottom, 0px))"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black backdrop-blur-[3px] transition-opacity",
			style: { opacity: backdropOpacity },
			"aria-label": "Dismiss",
			onClick: dismiss
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "select-sheet-panel sheet-rise glass-prestige-deep relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-[1.35rem] border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:rounded-[1.5rem]",
			style: {
				maxHeight: kbPad > 0 ? `min(72dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 48}px))` : "min(70dvh, calc(100dvh - 8rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)))",
				minHeight: kbPad > 0 ? "min(40dvh, 320px)" : "min(48dvh, 420px)",
				transform: `translate3d(0, ${dragY}px, 0)`,
				opacity: exiting ? Math.max(.15, 1 - dismissProgress) : 1,
				transition: dragging || exiting ? exiting ? "transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease" : "none" : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease, max-height 0.2s ease"
			},
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "select-sheet-handle shrink-0 touch-none select-none",
					onPointerDown: beginHandleDrag,
					onPointerMove: moveHandleDrag,
					onPointerUp: endHandleDrag,
					onPointerCancel: endHandleDrag,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-white/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 pb-1.5 pt-1.5 text-center text-[10px] font-semibold tracking-wide text-white/80",
						children: "Drag handle down to close · scroll list to pick"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2 border-b border-white/10 px-4 pb-3",
					onPointerDown: beginHandleDrag,
					onPointerMove: moveHandleDrag,
					onPointerUp: endHandleDrag,
					onPointerCancel: endHandleDrag,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-bold text-white",
								children: title
							}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11px] text-white/80",
								children: subtitle
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-white/80",
								children: [
									normalized.length,
									" option",
									normalized.length === 1 ? "" : "s",
									allowCustom ? " · or type your own" : ""
								]
							})]
						}),
						showSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => keyboardOn ? disableKeyboard() : enableKeyboard(),
							className: cn("inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition", keyboardOn ? "border-ruby-border bg-ruby-soft text-ruby" : "border-white/25 bg-white/10 text-white"),
							"aria-label": keyboardOn ? "Hide keyboard" : "Show keyboard",
							"aria-pressed": keyboardOn,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-3.5" }), keyboardOn ? "Hide" : "Type"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: dismiss,
							className: "flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white",
							"aria-label": "Close",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}),
				showSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 border-b border-white/10 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-field flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5",
						onClick: () => {
							if (!keyboardOn) enableKeyboard();
						},
						children: [
							allowCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4 shrink-0 text-blue" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-white" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								value: q,
								onChange: (e) => setQ(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && canUseCustom) {
										e.preventDefault();
										submitCustom();
									}
								},
								autoFocus: false,
								readOnly: !keyboardOn,
								inputMode: keyboardOn ? "text" : "none",
								enterKeyHint: canUseCustom ? "done" : "search",
								placeholder: keyboardOn ? allowCustom ? customPlaceholder : "Search…" : allowCustom ? "Tap Type to search or enter custom…" : "Tap Type to search…",
								className: "w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/60"
							}),
							q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setQ(""),
								className: "text-white",
								"aria-label": "Clear",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							}) : null
						]
					}), canUseCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: submitCustom,
						className: "mt-2 flex w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-3 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-bold text-white",
								children: customLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-[12px] text-white",
								children: [
									"“",
									q.trim(),
									"”"
								]
							})]
						})]
					}) : null]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: listRef,
					className: "rv-scroll select-sheet-list min-h-0 flex-1 overflow-y-auto overscroll-contain p-2",
					"data-sheet-list": "",
					style: {
						WebkitOverflowScrolling: "touch",
						touchAction: "pan-y"
					},
					onPointerDown: (e) => {
						if (e.pointerType === "mouse") return;
						if (!e.target?.closest?.("[data-sheet-item]")) return;
						itemTouchRef.current = {
							id: e.pointerId,
							x: e.clientX,
							y: e.clientY
						};
					},
					onPointerUp: (e) => {
						if (e.pointerType === "mouse") return;
						const start = itemTouchRef.current;
						itemTouchRef.current = null;
						if (!start || start.id !== e.pointerId) return;
						if (Math.abs(e.clientX - start.x) > 12 || Math.abs(e.clientY - start.y) > 12) return;
						const value = resolveSheetItemValue(e.clientX, e.clientY, listRef.current);
						if (value == null) return;
						e.preventDefault();
						pick(value);
					},
					onPointerCancel: () => {
						itemTouchRef.current = null;
					},
					children: [filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 py-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-white",
							children: emptyHint
						}), allowCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[12px] text-white",
							children: "Tap Type above to add a custom entry."
						}) : null]
					}) : filtered.map((item) => {
						const active = selected === item.value;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-value": item.value,
							"data-sheet-item": "",
							disabled: item.disabled,
							onClick: (e) => {
								e.preventDefault();
								e.stopPropagation();
								if (item.disabled) return;
								if (selectedGuard.current) return;
								if (isIosNativeWebView()) {
									const value = resolveSheetItemValue(e.clientX, e.clientY, listRef.current);
									if (value != null) pick(value);
									return;
								}
								pick(item.value);
							},
							className: cn("mb-1 flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition active:scale-[0.99]", active ? "border border-gold-border bg-gold-dim" : "border border-transparent bg-white/[0.03] hover:bg-white/8", item.disabled && "opacity-40"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[15px] font-semibold text-white",
									children: item.label
								}), item.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-[11px] text-white/75",
									children: item.meta
								}) : null]
							}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-gold" }) : null]
						}, item.value === "" ? "__empty__" : item.value);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0",
						style: { height: kbPad > 0 ? 28 : 20 },
						"aria-hidden": true
					})]
				})
			]
		})]
	});
}
//#endregion
export { SelectSheet as t };
