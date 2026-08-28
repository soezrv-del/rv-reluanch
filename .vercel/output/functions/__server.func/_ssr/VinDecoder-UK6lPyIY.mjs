import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Search, U as LoaderCircle, lt as CircleCheck, mt as ChevronDown, nt as ExternalLink, t as X, u as TriangleAlert, w as ScanLine, x as Shield } from "../_libs/lucide-react.mjs";
import { n as scrollFieldIntoVisibleArea, r as useKeyboardInset, u as cn } from "./routes-BIdx5g1s.mjs";
import { a as normalizeVin$1, i as isValidVinFormat, r as decodeVinViaApi } from "./router-Bi9lHNSY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VinDecoder-UK6lPyIY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VinScanner = (0, import_react.lazy)(() => import("./VinScanner-CxkHEYei.mjs").then((m) => ({ default: m.VinScanner })));
function DetailTile({ label, value, accent, full }) {
	if (!value || value === "—") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("glass-field rounded-[var(--radius-md)] px-3 py-2.5", full && "col-span-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-semibold tracking-wide text-white/70",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-0.5 text-[13px] font-semibold leading-snug text-white", accent && "text-sky-200"),
			children: value
		})]
	});
}
function SectionTitle({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[10px] font-bold tracking-[0.14em] text-white/80",
		children
	});
}
function VinDecoder({ open, onClose }) {
	const kb = useKeyboardInset();
	const [vin, setVin] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [expandedRecall, setExpandedRecall] = (0, import_react.useState)(null);
	const [showPositions, setShowPositions] = (0, import_react.useState)(false);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const abortRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) {
			abortRef.current?.abort();
			abortRef.current = null;
			setLoading(false);
			setScanning(false);
		}
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open || !kb.open) return;
		const el = inputRef.current;
		if (el && document.activeElement === el) scrollFieldIntoVisibleArea(el, kb.inset);
	}, [
		open,
		kb.open,
		kb.inset,
		kb.vvHeight
	]);
	const runDecode = async (override) => {
		const cleaned = normalizeVin$1(override ?? vin);
		setVin(cleaned);
		setError(null);
		setResult(null);
		setExpandedRecall(null);
		setShowPositions(false);
		if (!isValidVinFormat(cleaned)) {
			setError("VIN must be 17 characters (letters I, O, Q are not used).");
			return;
		}
		abortRef.current?.abort();
		const ctrl = new AbortController();
		abortRef.current = ctrl;
		setLoading(true);
		inputRef.current?.blur();
		const res = await decodeVinViaApi(cleaned, ctrl.signal);
		if (ctrl.signal.aborted) return;
		setLoading(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		setResult(res.data);
		window.setTimeout(() => {
			scrollRef.current?.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		}, 50);
	};
	const onScanned = (v) => {
		setVin(v);
		setScanning(false);
		runDecode(v);
	};
	if (!open) return null;
	const kbPad = kb.open ? Math.max(kb.inset, 12) : 0;
	const frameH = kb.vvHeight > 0 ? kb.vvHeight : void 0;
	const s = result?.structure;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-0 top-0 z-[70] flex items-end justify-center sm:items-center",
		style: {
			height: frameH ? `${frameH}px` : "100dvh",
			top: kb.vvOffsetTop || 0,
			paddingTop: "max(0.5rem, env(safe-area-inset-top))",
			paddingBottom: kbPad ? `max(0.75rem, ${kbPad + 8}px)` : "max(0.75rem, env(safe-area-inset-bottom))"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute inset-0 bg-black/65 backdrop-blur-sm",
				"aria-label": "Dismiss",
				onClick: onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-prestige-deep relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]",
				style: {
					maxHeight: kbPad ? `min(92dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 24}px))` : "min(88dvh, calc(var(--vv-height, 100dvh) - 1.5rem))",
					height: kbPad ? `min(92dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 24}px))` : void 0
				},
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "VIN Decoder",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/25 sm:hidden" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								className: "flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white",
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex flex-1 items-center justify-center gap-2 text-[16px] font-bold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4 text-blue" }), "VIN Decoder"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: scrollRef,
						"data-app-scroll": true,
						className: "rv-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4",
						style: {
							WebkitOverflowScrolling: "touch",
							paddingBottom: kb.open ? 24 : 16
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1.5 block text-[10px] font-bold tracking-[0.14em] text-white",
										children: "17-CHAR VIN"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: inputRef,
										value: vin,
										onChange: (e) => {
											setVin(e.target.value.toUpperCase());
											setError(null);
										},
										onFocus: (e) => {
											const el = e.currentTarget;
											window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 50);
											window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 300);
											window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 500);
										},
										onKeyDown: (e) => {
											if (e.key === "Enter") runDecode();
										},
										maxLength: 17,
										spellCheck: false,
										autoCapitalize: "characters",
										autoCorrect: "off",
										autoComplete: "off",
										enterKeyHint: "search",
										inputMode: "text",
										className: "glass-field w-full rounded-[var(--radius-md)] px-3 py-3.5 font-mono text-[15px] tracking-wide text-white outline-none placeholder:text-white/50 focus:border-blue/50",
										placeholder: "Enter 17-character VIN",
										"aria-label": "Vehicle identification number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block text-[10px] text-white/80",
										children: [normalizeVin$1(vin).length, "/17 · NHTSA vPIC + ISO check digit"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void runDecode(),
									disabled: loading,
									className: "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-blue py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(77,166,255,0.35)] disabled:opacity-70",
									children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), loading ? "Decoding…" : "Decode VIN"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setError(null);
										inputRef.current?.blur();
										setScanning(true);
									},
									disabled: loading,
									className: "flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-4 py-3.5 text-sm font-bold text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4" }), "Scan"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] leading-relaxed text-white/85",
								children: "Full NHTSA vPIC decode: structure, powertrain, plant, safety equipment, and recalls. Use the chassis VIN on motorhomes (door jamb / title)."
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft px-3 py-2 text-[13px] text-ruby",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "rounded-[var(--radius-md)] border border-white/15 bg-black/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer text-[12px] font-bold text-sky-200",
									children: "Test barcode (scanner practice)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] leading-relaxed text-white/80",
											children: [
												"Sample VIN",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-white",
													children: "1FTFW1ET5DFC10312"
												}),
												". Open full-screen on another device, then Scan."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: "/assets/sample-vin-barcode.png",
											alt: "Sample VIN barcodes CODE 128 CODE 39 and QR",
											className: "w-full rounded-lg border border-white/15 bg-white"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													setVin("1FTFW1ET5DFC10312");
													setError(null);
													inputRef.current?.focus();
												},
												className: "rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white",
												children: "Fill sample VIN"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "/sample/vin-barcode.html",
												target: "_blank",
												rel: "noreferrer",
												className: "rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold text-sky-100",
												children: "Open full-screen poster"
											})]
										})
									]
								})]
							}),
							result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "glass-prestige rounded-[var(--radius-xl)] p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
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
													result.trim !== "—" || result.series !== "—" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-0.5 text-[12px] text-white/90",
														children: [result.series, result.trim].filter((x) => x && x !== "—").join(" · ")
													}) : null
												] }), result.recallCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-ruby px-2.5 py-1 text-[11px] font-bold text-white",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }),
														result.recallCount,
														" Recalls"
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex shrink-0 items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "No recalls"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2.5 flex flex-wrap gap-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "glass-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
														children: result.bodyClass
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "glass-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
														children: result.vehicleType
													}),
													result.verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "NHTSA Verified"]
													}) : null,
													s?.checkDigitValid === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3" }), "Check digit OK"]
													}) : s?.checkDigitValid === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 rounded-full border border-amber/50 bg-amber/15 px-2.5 py-1 text-[11px] font-bold text-amber",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), "Check digit fail"]
													}) : null
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-3 rounded-[var(--radius-md)] border border-white/10 bg-black/25 px-3 py-2 font-mono text-[12px] tracking-wide text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mr-2 font-bold text-blue",
													children: "VIN"
												}), result.vin]
											}),
											result.errorText && result.errorCode && result.errorCode !== "0" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-[11px] leading-relaxed text-amber",
												children: ["NHTSA note: ", result.errorText]
											}) : null,
											result.additionalErrorText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] leading-relaxed text-white/70",
												children: result.additionalErrorText
											}) : null
										]
									}),
									s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "VIN STRUCTURE · ISO 3779" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "WMI (1–3)",
														value: s.wmi,
														accent: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "VDS (4–8)",
														value: s.vds,
														accent: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "Check digit (9)",
														value: s.checkDigitValid === true ? `${s.checkDigit} · valid` : s.checkDigitValid === false ? `${s.checkDigit} · invalid` : s.checkDigit,
														accent: s.checkDigitValid === true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "Model year code (10)",
														value: s.modelYearHint ? `${s.modelYearCode} · ~${s.modelYearHint}` : s.modelYearCode
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "Plant code (11)",
														value: s.plantCode
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "Serial (12–17)",
														value: s.serial
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "VIS (10–17)",
														value: s.vis,
														full: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
														label: "Vehicle descriptor",
														value: result.vehicleDescriptor || s.vehicleDescriptor,
														full: true,
														accent: true
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-[var(--radius-md)] border border-white/12 bg-black/30 p-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mb-2 text-[10px] font-bold tracking-wide text-white/70",
														children: "POSITION MAP"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex flex-wrap gap-1",
														children: s.positions.map((p) => {
															const zone = p.pos <= 3 ? "wmi" : p.pos <= 8 ? "vds" : p.pos === 9 ? "chk" : p.pos === 10 ? "yr" : p.pos === 11 ? "plt" : "ser";
															const tone = zone === "wmi" ? "border-sky-400/50 bg-sky-500/20 text-sky-100" : zone === "vds" ? "border-blue/40 bg-blue/15 text-white" : zone === "chk" ? s.checkDigitValid === false ? "border-amber/50 bg-amber/20 text-amber" : "border-emerald-400/45 bg-emerald-500/15 text-emerald-100" : zone === "yr" ? "border-gold/45 bg-gold/15 text-gold-bright" : zone === "plt" ? "border-white/25 bg-white/10 text-white" : "border-white/15 bg-black/30 text-white/90";
															return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																title: `Pos ${p.pos}: ${p.role}`,
																className: cn("flex w-7 flex-col items-center rounded border py-1 font-mono", tone),
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[8px] opacity-70",
																	children: p.pos
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[13px] font-bold leading-none",
																	children: p.char
																})]
															}, p.pos);
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-2 flex flex-wrap gap-2 text-[9px] font-semibold text-white/60",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-sky-200",
																children: "WMI"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VDS" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-emerald-200",
																children: "Check"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-gold-bright",
																children: "Year"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Plant" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Serial" })
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => setShowPositions((v) => !v),
														className: "mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-200",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-3.5 transition", showPositions && "rotate-180") }),
															showPositions ? "Hide" : "Show",
															" position legend"
														]
													}),
													showPositions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "mt-2 max-h-48 space-y-1 overflow-y-auto text-[11px] text-white/80",
														children: s.positions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "w-10 shrink-0 font-mono font-bold text-sky-200",
																children: [
																	p.pos,
																	". ",
																	p.char
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.role })]
														}, p.pos))
													}) : null
												]
											})
										]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "IDENTITY & MANUFACTURER" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Manufacturer",
													value: result.manufacturer,
													full: true,
													accent: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Make",
													value: result.make
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Model",
													value: result.model
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Model year",
													value: result.year
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Series",
													value: result.series
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Trim",
													value: result.trim
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Body class",
													value: result.bodyClass
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Cab / body type",
													value: result.bodyCabType
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Vehicle type",
													value: result.vehicleType
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Doors",
													value: result.doors
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "GVWR",
													value: result.gvwr,
													accent: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Assembly plant",
													value: result.assembly,
													full: true
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "POWERTRAIN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Engine summary",
													value: result.engine,
													full: true,
													accent: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Engine model",
													value: result.engineModel
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Engine mfr",
													value: result.engineManufacturer
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Configuration",
													value: result.engineConfiguration
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Displacement (L)",
													value: result.displacementL
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Displacement (ci)",
													value: result.displacementCi
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Cylinders",
													value: result.cylinders
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Horsepower",
													value: result.horsepower,
													accent: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Fuel primary",
													value: result.fuel,
													accent: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Fuel secondary",
													value: result.fuelSecondary
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Injection",
													value: result.fuelInjection,
													full: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Drive type",
													value: result.driveType
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Transmission",
													value: result.transmission
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Electrification",
													value: result.electrification
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Battery type",
													value: result.batteryType
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "SAFETY & EQUIPMENT" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Airbags (front)",
													value: result.airBagFront
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Airbags (side)",
													value: result.airBagSide
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Airbags (curtain)",
													value: result.airBagCurtain
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Seat belts",
													value: result.seatBelts
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "TPMS",
													value: result.tpms
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "Brake system",
													value: result.brakeSystem
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
													label: "ABS",
													value: result.abs
												})
											]
										})]
									}),
									result.extra?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "ADDITIONAL NHTSA FIELDS" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-2 gap-2",
											children: result.extra.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailTile, {
												label: row.label,
												value: row.value,
												full: row.value.length > 28
											}, row.label))
										})]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-[var(--radius-lg)] border border-white/10 bg-black/25 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] font-bold tracking-[0.08em] text-white",
												children: "NHTSA RECALLS"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: "https://www.nhtsa.gov/recalls",
												target: "_blank",
												rel: "noreferrer",
												className: "inline-flex items-center gap-1 text-[11px] font-semibold text-blue",
												children: ["nhtsa.gov ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
											})]
										}), result.recallCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[13px] text-green",
											children: "No open recalls found for this year / make / model."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[12px] font-semibold text-amber",
												children: [
													"⚠ ",
													result.recallCount,
													" campaign",
													result.recallCount === 1 ? "" : "s",
													" on record"
												]
											}), result.recalls.map((r) => {
												const openRow = expandedRecall === r.campaignNumber;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setExpandedRecall(openRow ? null : r.campaignNumber),
													className: "glass-field flex w-full flex-col rounded-[var(--radius-md)] px-3 py-2.5 text-left",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "truncate text-[12px] font-bold text-white",
																children: r.component || "EQUIPMENT"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-[11px] text-white/80",
																children: [r.campaignNumber, r.reportDate ? ` · ${r.reportDate}` : ""]
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-white",
															children: openRow ? "▾" : "›"
														})]
													}), openRow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-2 space-y-1.5 border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/90",
														children: [
															r.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.summary }) : null,
															r.consequence ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-semibold text-amber",
																children: ["Risk:", " "]
															}), r.consequence] }) : null,
															r.remedy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-semibold text-green",
																children: ["Remedy:", " "]
															}), r.remedy] }) : null
														]
													}) : null]
												}, r.campaignNumber || r.component + r.reportDate);
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-[10px] leading-relaxed text-white/75",
										children: "Data from NHTSA vPIC DecodeVinValuesExtended & Recalls APIs. Motorhomes: decode the chassis VIN; coach floorplan is not encoded in the VIN. Confirm door sticker & PPI."
									})
								]
							}) : null
						]
					})
				]
			}),
			scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinScanner, {
					open: scanning,
					onClose: () => setScanning(false),
					onDetected: onScanned
				})
			}) : null
		]
	});
}
//#endregion
export { VinDecoder };
