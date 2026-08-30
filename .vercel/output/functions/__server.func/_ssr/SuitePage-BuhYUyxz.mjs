import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { at as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as PAGE_COPY, d as cn, i as PAGE_ACCENT, o as MetalVerifiedTrue, r as useKeyboardInset, u as useShellNavOptional } from "./routes-Pmuw5ThC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SuitePage-BuhYUyxz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Suite default backdrop — Fax, Cal, Tow, Premium, Grok chrome */
var SHARED_PRESTIGE_BACKDROP = "/assets/shared-prestige-62nfh53S.jpg";
/**
* Top-right ⋯ control — opens Premium / suite tools on every page.
*/
function PremiumMenuButton({ className, size = "md" }) {
	const nav = useShellNavOptional();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => nav?.setTab("more"),
		className: cn("premium-menu-btn flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-[0_0_16px_rgba(80,140,255,0.25)] backdrop-blur-md transition active:scale-95", "hover:border-white/50 hover:bg-black/60", size === "sm" ? "size-9" : "size-10", className),
		"aria-label": "Premium and suite tools",
		title: "Premium",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: size === "sm" ? "size-5" : "size-5.5 size-5" })
	});
}
/** Suite tools that share sapphire shell + forged mark */
var VERIFIED_TABS = /* @__PURE__ */ new Set([
	"rvfax",
	"rvcal",
	"rvtow",
	"rvtrips",
	"rvshare",
	"rvgrok"
]);
function SapphireHeader({ tab }) {
	const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
	const showVerified = VERIFIED_TABS.has(tab);
	const accent = showVerified ? "sapphire" : PAGE_ACCENT[tab] ?? "sapphire";
	const shellGlow = accent === "gold" ? {
		background: "linear-gradient(165deg, rgba(18,14,8,0.88) 0%, rgba(28,22,12,0.82) 40%, rgba(10,8,4,0.92) 100%)",
		boxShadow: "0 16px 48px rgba(20,12,0,0.5), inset 0 1px 0 rgba(232,220,192,0.26), inset 0 -1px 0 rgba(100,80,40,0.22)"
	} : {
		background: "linear-gradient(165deg, rgba(4,10,28,0.82) 0%, rgba(8,18,48,0.78) 40%, rgba(2,6,20,0.88) 100%)",
		boxShadow: "0 16px 48px rgba(0,10,40,0.55), inset 0 1px 0 rgba(160,210,255,0.28), inset 0 -1px 0 rgba(40,80,160,0.25)"
	};
	const badgeTone = accent === "gold" ? "border-gold/40 bg-gold-dim text-gold-bright" : "border-sky-300/35 bg-white/8 text-sky-100";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sapphire-header relative z-30 shrink-0 px-3 pb-1.5 pt-[max(0.35rem,env(safe-area-inset-top))] sm:px-4",
		"data-page-accent": accent,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("sapphire-header-inner relative overflow-hidden rounded-[1.35rem] border border-white/20 px-3 py-3.5 sm:px-6 sm:py-4"),
			style: {
				...shellGlow,
				backdropFilter: "blur(24px) saturate(1.45)",
				WebkitBackdropFilter: "blur(24px) saturate(1.45)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-80",
					style: { background: accent === "gold" ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,184,150,0.18) 0%, transparent 55%)" : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(60,120,255,0.22) 0%, transparent 55%)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "sapphire-banner-ambient pointer-events-none absolute inset-0 z-[1]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "sapphire-banner-edge pointer-events-none absolute inset-x-0 top-0 z-[1] h-px"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "sapphire-banner-shine sapphire-banner-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[1] w-[45%]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-[1px] rounded-[1.3rem] border border-white/10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute right-2.5 top-2.5 z-[4] sm:right-3 sm:top-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumMenuButton, { size: "sm" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-[2] flex flex-col items-center text-center",
					children: [
						copy.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("sapphire-header-badge mb-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-bold tracking-[0.22em]", badgeTone),
							children: copy.badge
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sapphire-title-stage relative inline-flex max-w-full items-center justify-center overflow-visible px-2 py-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: "sapphire-title-ambient pointer-events-none absolute -inset-x-8 -inset-y-3 z-0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: "sapphire-title-shine sapphire-title-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[1] w-[55%]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: cn("sapphire-header-title sapphire-title-3d relative z-[2] max-w-[20ch] font-bold leading-[0.9] tracking-tight sm:max-w-none", "ice-text-sapphire ice-text-live", copy.title.length <= 8 ? "text-[clamp(3rem,13vw,4.1rem)]" : "text-[clamp(2.35rem,10.5vw,3.35rem)]"),
										"data-text": copy.title,
										children: copy.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: cn("sapphire-title-sheen pointer-events-none absolute inset-0 z-[3] flex items-center justify-center font-bold leading-[0.9] tracking-tight", copy.title.length <= 8 ? "text-[clamp(3rem,13vw,4.1rem)]" : "text-[clamp(2.35rem,10.5vw,3.35rem)]"),
										children: copy.title
									})
								]
							}), showVerified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "-mt-0.5 w-full px-2 leading-none",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetalVerifiedTrue, { size: "sm" })
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("sapphire-header-line mt-2.5 max-w-md text-[11px] font-medium leading-relaxed sm:text-[12.5px]", accent === "gold" ? "text-gold-bright/90" : "text-sky-50/90"),
							children: copy.line
						})
					]
				})
			]
		})
	});
}
/**
* Suite sapphire header in document flow — scrolls with page content.
*/
function ScrollSuiteHeader({ tab, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative z-20 shrink-0", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SapphireHeader, { tab })
	});
}
/** Sticky banner shown while pull-to-reset is armed. */
function PullResetHint({ show, label = "Release to reset · pull down to refresh" }) {
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sticky top-0 z-30 border-b border-sky-400/30 bg-black/75 px-3 py-2 text-center text-[11px] font-semibold text-sky-100 backdrop-blur-md",
		children: label
	});
}
/** sRGB channel → linear */
function toLinear(c) {
	const s = c / 255;
	return s <= .04045 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4);
}
/** Relative luminance (WCAG) 0..1 */
function relativeLuminance(r, g, b) {
	return .2126 * toLinear(r) + .7152 * toLinear(g) + .0722 * toLinear(b);
}
/**
* Level-3 glass α from backdrop luminance.
* Darker backdrop → clearer glass; bright backdrop → slightly denser fill
* so white/sapphire type stays punchy.
*/
function glassAlphaFromLuminance(L) {
	return .01 + .07500000000000001 * Math.pow(Math.min(1, Math.max(0, L)), 1.15);
}
function glassBlurFromLuminance(L) {
	return Math.round(5 + L * 5);
}
var cache = /* @__PURE__ */ new Map();
var waiters = /* @__PURE__ */ new Map();
function loadSample(url) {
	const hit = cache.get(url);
	if (hit && hit !== "loading" && hit !== "error") return Promise.resolve(hit);
	if (hit === "error") return Promise.resolve(null);
	return new Promise((resolve) => {
		const list = waiters.get(url) ?? [];
		list.push(resolve);
		waiters.set(url, list);
		if (hit === "loading") return;
		cache.set(url, "loading");
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			try {
				const scale = Math.min(1, 64 / img.naturalWidth);
				const w = Math.max(8, Math.round(img.naturalWidth * scale));
				const h = Math.max(8, Math.round(img.naturalHeight * scale));
				const canvas = document.createElement("canvas");
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (!ctx) {
					cache.set(url, "error");
					for (const fn of waiters.get(url) ?? []) fn(null);
					waiters.delete(url);
					return;
				}
				ctx.drawImage(img, 0, 0, w, h);
				const entry = {
					url,
					canvas,
					ctx,
					w,
					h
				};
				cache.set(url, entry);
				for (const fn of waiters.get(url) ?? []) fn(entry);
				waiters.delete(url);
			} catch {
				cache.set(url, "error");
				for (const fn of waiters.get(url) ?? []) fn(null);
				waiters.delete(url);
			}
		};
		img.onerror = () => {
			cache.set(url, "error");
			for (const fn of waiters.get(url) ?? []) fn(null);
			waiters.delete(url);
		};
		img.src = url;
	});
}
/** Average luminance of a vertical band (y0..y1 as 0..1 of image height). */
function bandLuminance(sample, y0, y1) {
	const top = Math.max(0, Math.floor(sample.h * y0));
	const bot = Math.min(sample.h, Math.ceil(sample.h * y1));
	const height = Math.max(1, bot - top);
	let data;
	try {
		data = sample.ctx.getImageData(0, top, sample.w, height);
	} catch {
		return .25;
	}
	const px = data.data;
	let sum = 0;
	let n = 0;
	for (let i = 0; i < px.length; i += 16) {
		sum += relativeLuminance(px[i], px[i + 1], px[i + 2]);
		n++;
	}
	return n ? sum / n : .25;
}
var DEFAULT = {
	alpha: .02,
	alphaDeep: .05,
	alphaSpec: .05,
	alphaDepth: .03,
	blurPx: 6,
	luminance: .22,
	style: {
		["--rv-glass-a"]: "0.02",
		["--rv-glass-a-deep"]: "0.05",
		["--rv-glass-a-spec"]: "0.05",
		["--rv-glass-a-depth"]: "0.03",
		["--rv-glass-blur"]: "6px",
		["--rv-glass-L"]: "0.22"
	}
};
function buildVars(L) {
	const alpha = glassAlphaFromLuminance(L);
	const alphaDeep = Math.min(.14, alpha * 2.2);
	const alphaSpec = Math.min(.12, alpha * 2.4 + .02);
	const alphaDepth = Math.min(.1, alpha * 1.6 + .01);
	const blurPx = glassBlurFromLuminance(L);
	return {
		alpha,
		alphaDeep,
		alphaSpec,
		alphaDepth,
		blurPx,
		luminance: L,
		style: {
			["--rv-glass-a"]: alpha.toFixed(4),
			["--rv-glass-a-deep"]: alphaDeep.toFixed(4),
			["--rv-glass-a-spec"]: alphaSpec.toFixed(4),
			["--rv-glass-a-depth"]: alphaDepth.toFixed(4),
			["--rv-glass-blur"]: `${blurPx}px`,
			["--rv-glass-L"]: L.toFixed(3)
		}
	};
}
/**
* Level-3 adaptive glass: samples backdrop luminance (scroll-aware band)
* and exposes CSS variables for multi-layer transparent cards.
*/
function useAdaptiveGlass(backdropUrl, scrollRef) {
	const [vars, setVars] = (0, import_react.useState)(DEFAULT);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let raf = 0;
		const recompute = async () => {
			const sample = await loadSample(backdropUrl);
			if (cancelled || !sample) {
				if (!cancelled) setVars(DEFAULT);
				return;
			}
			const el = scrollRef?.current;
			const maxScroll = el ? Math.max(1, el.scrollHeight - el.clientHeight) : 1;
			const bandCenter = .28 + (el ? Math.min(1, Math.max(0, el.scrollTop / maxScroll)) : 0) * .45;
			const half = .18;
			const L = bandLuminance(sample, Math.max(0, bandCenter - half), Math.min(1, bandCenter + half));
			if (!cancelled) setVars(buildVars(L));
		};
		const onScroll = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				recompute();
			});
		};
		recompute();
		const el = scrollRef?.current;
		el?.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			el?.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [backdropUrl, scrollRef]);
	return vars;
}
/**
* Pull down at scrollTop≈0 → call onReset (iOS-style refresh).
* Returns pullHint for sticky banner — pair with `@/components/shell/PullResetHint`.
*
* Touches that start inside `[data-no-pull-reset]` (e.g. wizard wheels) are ignored
* so nested scrollers don't wipe the page.
*/
function usePullToReset(scrollRef, onReset, opts) {
	const threshold = opts?.threshold ?? 72;
	const hintAt = opts?.hintAt ?? 54;
	const enabled = opts?.enabled ?? true;
	const [pullHint, setPullHint] = (0, import_react.useState)(false);
	const pullStartY = (0, import_react.useRef)(0);
	const pulling = (0, import_react.useRef)(false);
	const onResetRef = (0, import_react.useRef)(onReset);
	onResetRef.current = onReset;
	(0, import_react.useEffect)(() => {
		const el = scrollRef.current;
		if (!el || !enabled) return;
		const isBlockedTarget = (t) => {
			if (!(t instanceof Element)) return false;
			return Boolean(t.closest("[data-no-pull-reset], [data-wizard-wheel], .select-sheet-root, input, textarea"));
		};
		const onStart = (e) => {
			if (el.scrollTop > 2) return;
			if (e.touches.length !== 1) return;
			if (isBlockedTarget(e.target)) {
				pulling.current = false;
				return;
			}
			pullStartY.current = e.touches[0].clientY;
			pulling.current = true;
		};
		const onMove = (e) => {
			if (!pulling.current) return;
			const dy = e.touches[0].clientY - pullStartY.current;
			if (el.scrollTop <= 0 && dy > hintAt) setPullHint(true);
			else setPullHint(false);
		};
		const onEnd = (e) => {
			if (!pulling.current) return;
			pulling.current = false;
			const dy = (e.changedTouches[0]?.clientY ?? 0) - pullStartY.current;
			if (el.scrollTop <= 0 && dy > threshold) onResetRef.current();
			setPullHint(false);
		};
		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: true });
		el.addEventListener("touchend", onEnd, { passive: true });
		el.addEventListener("touchcancel", () => {
			pulling.current = false;
			setPullHint(false);
		});
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
		};
	}, [
		scrollRef,
		enabled,
		threshold,
		hintAt
	]);
	return pullHint;
}
/** Soft-scrim prestige backdrop — single stack (image + scrim only). */
function SuiteBackdrop({ src = SHARED_PRESTIGE_BACKDROP, objectPosition = "center", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-none absolute inset-0 overflow-hidden", className),
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			className: "page-backdrop-bright absolute inset-0 size-full object-cover",
			style: { objectPosition }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "page-scrim-soft" })]
	});
}
var KB_PAD_DEFAULT = 96;
/**
* Shared suite screen shell.
* Backdrop + soft scrim + optional sapphire header + pull hint + keyboard pad.
* Feature apps only own their content — chrome changes land here once.
*/
function SuitePage({ tab, backdrop = SHARED_PRESTIGE_BACKDROP, objectPosition = "center", adaptiveGlass = true, onPullReset, pullLabel, kbPad = KB_PAD_DEFAULT, noSwipeScroll, className, scrollClassName, topSlot, children, overlays, scrollRef: scrollRefProp, style }) {
	const localRef = (0, import_react.useRef)(null);
	const scrollRef = scrollRefProp ?? localRef;
	const kb = useKeyboardInset();
	const glass = useAdaptiveGlass(backdrop, scrollRef);
	const pullHint = usePullToReset(scrollRef, onPullReset ?? (() => void 0), { enabled: Boolean(onPullReset) });
	const rootStyle = {
		...adaptiveGlass ? glass.style : null,
		...style
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex h-full min-h-0 flex-col overflow-hidden bg-bg text-white", adaptiveGlass && "adaptive-glass", className),
		style: rootStyle,
		"data-glass-l": adaptiveGlass ? glass.luminance.toFixed(3) : void 0,
		"data-no-swipe-scroll": noSwipeScroll ? "" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteBackdrop, {
				src: backdrop,
				objectPosition
			}),
			topSlot,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				"data-app-scroll": true,
				className: cn("rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain", scrollClassName),
				style: { paddingBottom: kb.open ? `max(6rem, ${kb.inset + kbPad}px)` : void 0 },
				children: [
					tab ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollSuiteHeader, { tab }) : null,
					onPullReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullResetHint, {
						show: pullHint,
						label: pullLabel
					}) : null,
					children
				]
			}),
			overlays
		]
	});
}
//#endregion
export { SuitePage as a, SuiteBackdrop as i, SHARED_PRESTIGE_BACKDROP as n, useAdaptiveGlass as o, ScrollSuiteHeader as r, usePullToReset as s, PullResetHint as t };
