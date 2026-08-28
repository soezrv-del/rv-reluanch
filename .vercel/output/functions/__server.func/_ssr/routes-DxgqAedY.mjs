import { i as __toESM } from "../_runtime.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as MessageCircle, R as MapPin, c as Truck, mt as ChevronDown, tt as FileText, vt as Calculator, x as Shield } from "../_libs/lucide-react.mjs";
import { C as __exportAll } from "./router-B7uJEg2g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-OGIVz_8o.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function formatTime(date) {
	return (date instanceof Date ? date : new Date(date)).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatRelativeTime(dateStr) {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diff = Math.floor((now - then) / 1e3);
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DxgqAedY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ShellNavContext = (0, import_react.createContext)(null);
function useShellNavOptional() {
	return (0, import_react.useContext)(ShellNavContext);
}
var MIN_GAP = {
	tick: 28,
	detent: 36,
	light: 40,
	medium: 48,
	heavy: 70,
	success: 120,
	warn: 120,
	start: 80,
	end: 80
};
var cached;
var impactStyles = null;
var loadPromise = null;
var enabled = true;
var audioCtx = null;
var lastAt = {};
var armed = false;
function canVibrate() {
	return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}
function prefersReducedMotion() {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function vibrateTick(ms = 8) {
	try {
		if (canVibrate()) navigator.vibrate(ms);
	} catch {}
}
function vibratePattern(pattern) {
	try {
		if (canVibrate()) navigator.vibrate(pattern);
	} catch {}
}
function getAudio() {
	if (typeof window === "undefined") return null;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	if (!audioCtx) try {
		audioCtx = new AC();
	} catch {
		return null;
	}
	return audioCtx;
}
/** Resume audio on a real gesture so iOS will play the click. */
function armHaptics() {
	if (armed) return;
	armed = true;
	const ctx = getAudio();
	if (ctx && ctx.state === "suspended") ctx.resume();
	loadHaptics();
}
function playClick(kind) {
	const ctx = getAudio();
	if (!ctx) return;
	if (ctx.state === "suspended") ctx.resume();
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	const filter = ctx.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = 180;
	osc.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);
	const spec = kind === "heavy" ? {
		freq: 140,
		peak: .07,
		dur: .045
	} : kind === "medium" || kind === "detent" ? {
		freq: 190,
		peak: .055,
		dur: .032
	} : kind === "success" ? {
		freq: 420,
		peak: .045,
		dur: .05
	} : kind === "warn" ? {
		freq: 110,
		peak: .06,
		dur: .06
	} : {
		freq: 240,
		peak: .04,
		dur: .022
	};
	osc.type = "triangle";
	osc.frequency.setValueAtTime(spec.freq, t);
	osc.frequency.exponentialRampToValueAtTime(spec.freq * .7, t + spec.dur);
	gain.gain.setValueAtTime(spec.peak, t);
	gain.gain.exponentialRampToValueAtTime(8e-4, t + spec.dur);
	osc.start(t);
	osc.stop(t + spec.dur + .01);
	osc.onended = () => {
		try {
			osc.disconnect();
			filter.disconnect();
			gain.disconnect();
		} catch {}
	};
}
async function loadHaptics() {
	if (cached !== void 0) return cached;
	if (loadPromise) return loadPromise;
	loadPromise = (async () => {
		if (typeof window === "undefined") {
			cached = null;
			return null;
		}
		try {
			const mod = await Function("return import(\"@capacitor/haptics\")")().catch(() => null);
			if (mod?.Haptics) {
				impactStyles = mod.ImpactStyle ?? null;
				cached = mod.Haptics;
				return cached;
			}
		} catch {}
		cached = null;
		return null;
	})();
	return loadPromise;
}
function gated(kind) {
	if (!enabled || prefersReducedMotion()) return false;
	const now = performance.now();
	const gap = MIN_GAP[kind] ?? 40;
	if (now - (lastAt[kind] ?? 0) < gap) return false;
	lastAt[kind] = now;
	return true;
}
async function fire(kind) {
	if (!gated(kind)) return;
	armHaptics();
	const H = await loadHaptics();
	try {
		if (kind === "start" && H?.selectionStart) {
			await H.selectionStart();
			return;
		}
		if (kind === "end" && H?.selectionEnd) {
			await H.selectionEnd();
			return;
		}
		if ((kind === "tick" || kind === "detent") && H?.selectionChanged) {
			await H.selectionChanged();
			playClick(kind);
			return;
		}
		if (kind === "success" && H?.notification) {
			await H.notification({ type: "SUCCESS" });
			playClick(kind);
			return;
		}
		if (kind === "warn" && H?.notification) {
			await H.notification({ type: "WARNING" });
			playClick(kind);
			return;
		}
		if (H?.impact) {
			const style = kind === "heavy" ? impactStyles?.Heavy ?? "HEAVY" : kind === "medium" || kind === "detent" ? impactStyles?.Medium ?? "MEDIUM" : impactStyles?.Light ?? "LIGHT";
			await H.impact({ style });
			playClick(kind);
			return;
		}
	} catch {}
	if (kind === "heavy") vibratePattern([
		16,
		12,
		10
	]);
	else if (kind === "medium" || kind === "detent") vibrateTick(14);
	else if (kind === "success") vibratePattern([
		10,
		30,
		14
	]);
	else if (kind === "warn") vibratePattern([
		20,
		20,
		20
	]);
	else vibrateTick(8);
	playClick(kind);
}
/** Warm native + audio so the first click isn’t late. */
function preloadHaptics() {
	loadHaptics();
	if (typeof window !== "undefined" && !armed) {
		const kick = () => {
			armHaptics();
			window.removeEventListener("pointerdown", kick);
			window.removeEventListener("touchstart", kick);
			window.removeEventListener("keydown", kick);
		};
		window.addEventListener("pointerdown", kick, {
			once: true,
			passive: true
		});
		window.addEventListener("touchstart", kick, {
			once: true,
			passive: true
		});
		window.addEventListener("keydown", kick, { once: true });
	}
}
function hapticLight() {
	return fire("light");
}
function hapticMedium() {
	return fire("medium");
}
/** Dial / picker snap — one mechanical click per number. */
function hapticSnap() {
	return fire("tick");
}
function hapticSnapStart() {
	return fire("start");
}
function hapticSnapEnd() {
	return fire("end");
}
/** Launch film URLs only — keep this file free of image imports. */
var RVFOX_LAUNCH_SEAL = "/assets/splash/rvfox-launch-seal.mp4";
var RVFOX_LAUNCH_SEAL_LITE = "/assets/splash/rvfox-launch-seal-lite.mp4";
var RVFOX_LAUNCH_SEAL_ULTRA = "/assets/splash/rvfox-launch-seal-ultra.mp4";
var TOOLS = [
	{
		id: "rvfax",
		title: "RvFACTS",
		blurb: "Get specs, market value, ratings, NHTSA recalls, and more",
		Icon: FileText
	},
	{
		id: "rvcal",
		title: "RvCal",
		blurb: "ZIP-based calculator with lender comparisons",
		Icon: Calculator
	},
	{
		id: "rvtow",
		title: "RvTow",
		blurb: "Tow match",
		Icon: Truck
	},
	{
		id: "rvtrips",
		title: "RvTrips",
		blurb: "RV GPS with campgrounds, dump stations, and more",
		Icon: MapPin
	},
	{
		id: "rvgrok",
		title: "RvGrok",
		blurb: "Your RV expert — from the best fishing spots to troubleshooting your RV",
		Icon: MessageCircle
	},
	{
		id: "more",
		title: "Premium",
		blurb: "Settings",
		Icon: Shield
	}
];
var LAUNCH_SEAL = RVFOX_LAUNCH_SEAL;
var LAUNCH_SEAL_LITE = RVFOX_LAUNCH_SEAL_LITE;
var LAUNCH_SEAL_ULTRA = RVFOX_LAUNCH_SEAL_ULTRA;
function isNativeOrIOS() {
	if (typeof window === "undefined") return false;
	try {
		if (window.Capacitor?.isNativePlatform?.()) return true;
	} catch {}
	return /iPhone|iPad|iPod|Capacitor/i.test(navigator.userAgent || "");
}
function pickLaunchVideo() {
	if (isNativeOrIOS()) return LAUNCH_SEAL_ULTRA;
	try {
		const conn = navigator.connection;
		if (conn?.saveData) return LAUNCH_SEAL_ULTRA;
		const t = conn?.effectiveType;
		if (t === "slow-2g" || t === "2g") return LAUNCH_SEAL_ULTRA;
		if (t === "3g") return LAUNCH_SEAL_LITE;
	} catch {}
	return LAUNCH_SEAL;
}
function hideNativeSplash() {
	(async () => {
		try {
			await (await import("../_libs/capacitor__splash-screen.mjs").then((n) => n.t)).SplashScreen.hide({ fadeOutDuration: 200 });
		} catch {}
	})();
}
/**
* Forged steel wordmark — hammered / embossed into the plate.
* Dual-layer: deep strike shadow + hard metal face.
*/
function MetalVerifiedTrue({ className, size = "md" }) {
	const sizeCls = size === "lg" ? "text-[clamp(1.4rem,5.6vw,1.85rem)] tracking-[0.26em]" : size === "sm" ? "text-[0.82rem] tracking-[0.2em]" : "text-[clamp(1.2rem,4.6vw,1.48rem)] tracking-[0.24em]";
	const label = "Verified and True";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("metal-hammered relative inline-block select-none text-center font-black uppercase leading-none", sizeCls, className),
		"aria-label": label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute inset-0 translate-x-[1.5px] translate-y-[2px] blur-[0.4px]",
			style: {
				color: "rgba(4, 6, 10, 0.78)",
				textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.35)"
			},
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "relative",
			style: {
				backgroundImage: "linear-gradient(162deg,#f7f9fc 0%,#b8c0cc 9%,#6a7384 18%,#e8edf4 28%,#4a5260 38%,#d0d7e2 47%,#8b94a4 56%,#f2f5f9 66%,#5c6574 76%,#c5cdd8 86%,#9aa3b2 93%,#eef2f7 100%)",
				WebkitBackgroundClip: "text",
				backgroundClip: "text",
				color: "transparent",
				WebkitTextStroke: "0.45px rgba(12, 14, 20, 0.4)",
				filter: "drop-shadow(0 -0.5px 0 rgba(255,255,255,0.45)) drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(0 3px 8px rgba(0,0,0,0.55))"
			},
			children: label
		})]
	});
}
/**
* Splash launch — full-bleed seal ray film + transparent tool menu.
* Any tool button or Enter suite stops the video immediately.
*/
function Launchpad({ onSelect, onSkip, menuImageSrc, videoSrc }) {
	const [hi, setHi] = (0, import_react.useState)(0);
	const [videoPlaying, setVideoPlaying] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const [resolvedSrc, setResolvedSrc] = (0, import_react.useState)(() => videoSrc);
	const poster = menuImageSrc ?? "/assets/rvfox-launch-seal-poster-C1rHX2Pi.jpg";
	(0, import_react.useEffect)(() => {
		hideNativeSplash();
	}, []);
	(0, import_react.useEffect)(() => {
		setResolvedSrc(videoSrc ?? pickLaunchVideo());
	}, [videoSrc]);
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => {
			setHi((i) => (i + 1) % TOOLS.length);
		}, 2400);
		return () => window.clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		const v = videoRef.current;
		if (!v || !resolvedSrc) return;
		let cancelled = false;
		v.muted = true;
		v.defaultMuted = true;
		v.playsInline = true;
		v.loop = true;
		v.setAttribute("playsinline", "true");
		v.setAttribute("webkit-playsinline", "true");
		const onPlaying = () => {
			if (!cancelled) setVideoPlaying(true);
		};
		const onError = () => {
			if (!cancelled) setVideoPlaying(false);
		};
		v.addEventListener("playing", onPlaying);
		v.addEventListener("error", onError);
		v.play().catch(() => {
			if (!cancelled) setVideoPlaying(false);
		});
		return () => {
			cancelled = true;
			v.removeEventListener("playing", onPlaying);
			v.removeEventListener("error", onError);
			try {
				v.pause();
			} catch {}
		};
	}, [resolvedSrc]);
	/** Stop seal film immediately — call from every exit control. */
	const stopVideo = () => {
		const v = videoRef.current;
		if (!v) return;
		try {
			v.pause();
			v.currentTime = 0;
			v.loop = false;
			v.removeAttribute("src");
			v.load();
		} catch {}
		setVideoPlaying(false);
	};
	const pickTool = (id) => {
		stopVideo();
		hapticMedium();
		onSelect(id);
	};
	const enterSuite = () => {
		stopVideo();
		hapticMedium();
		onSkip();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#050508] text-white",
		"data-no-swipe": true,
		onTouchMove: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: poster,
					alt: "",
					className: cn("absolute inset-0 size-full object-cover object-center transition-opacity duration-500", videoPlaying ? "opacity-0" : "opacity-100"),
					draggable: false,
					decoding: "async",
					fetchPriority: "high"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: cn("absolute inset-0 size-full object-cover object-center transition-opacity duration-500", videoPlaying ? "opacity-100" : "opacity-0"),
					src: resolvedSrc,
					poster: typeof poster === "string" ? poster : void 0,
					muted: true,
					playsInline: true,
					loop: true,
					preload: "metadata",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col items-center pt-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-extrabold tracking-[0.28em] text-sky-100/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]",
							children: "RVFOX PRO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-1 text-[clamp(2.35rem,11vw,3.1rem)] font-black leading-none tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white",
								children: "Rv"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-gradient-to-b from-sky-100 via-sky-300 to-blue-400 bg-clip-text text-transparent",
								children: "FOX"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetalVerifiedTrue, { size: "lg" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[13px] font-medium text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]",
							children: "Know before you buy."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-3 flex w-full max-w-sm min-h-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 flex-col items-center gap-0.5 py-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold tracking-[0.28em] text-white/45",
							children: "FEATURES"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: "size-3.5 text-white/35",
							strokeWidth: 2
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-h-0 flex-1 flex-col justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-[1.5rem] border border-white/22 bg-white/[0.03] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-[1.5px]",
							children: TOOLS.map((item, index) => {
								const active = index === hi;
								const Icon = item.Icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => pickTool(item.id),
									className: cn("flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-2.5 text-left transition-all duration-300 ease-out touch-manipulation", active ? "scale-[1.01] bg-gradient-to-r from-sky-500/90 via-blue-500/85 to-blue-600/90 shadow-[0_0_28px_rgba(56,140,255,0.45)]" : "bg-transparent hover:bg-white/[0.07]"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("flex size-9 shrink-0 items-center justify-center rounded-full border", active ? "border-white/25 bg-white/15 text-white" : "border-white/18 bg-white/[0.06] text-sky-300"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "size-4",
											strokeWidth: 2.1
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[15px] font-bold leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]",
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("mt-0.5 block text-[11.5px] leading-snug drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]", active ? "text-white/90" : "text-white/72"),
											children: item.blurb
										})]
									})]
								}, item.id);
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-auto flex shrink-0 flex-col items-center gap-2 pb-1 pt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": true,
							className: "pointer-events-none absolute inset-x-[-30%] -bottom-4 top-0 -z-0",
							style: { background: "radial-gradient(ellipse 75% 90% at 50% 75%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.22) 32%, rgba(255,255,255,0.06) 55%, transparent 75%)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: enterSuite,
							className: "relative z-10 w-full max-w-sm rounded-full border border-white/60 bg-white/18 py-3.5 text-[14px] font-semibold tracking-wide text-white shadow-[0_0_28px_rgba(255,255,255,0.55),0_0_56px_rgba(255,255,255,0.28),0_0_90px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md active:scale-[0.99]",
							children: "Enter suite"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "relative z-10 text-[10px] text-white/60",
							children: "Or tap any tool above"
						})
					]
				})
			]
		})]
	});
}
/** Dock order — Facts home, Grok on the right */
var TAB_ORDER = [
	"rvfax",
	"rvcal",
	"rvtow",
	"rvtrips",
	"rvgrok"
];
/** One hero accent per page — premium color discipline */
var PAGE_ACCENT = {
	rvfax: "sapphire",
	rvcal: "sapphire",
	rvtow: "sapphire",
	rvtrips: "sapphire",
	rvgrok: "sapphire",
	more: "gold"
};
var PAGE_COPY = {
	rvgrok: {
		title: "RvGROK",
		line: "Your RV expert — from the best fishing spots to troubleshooting your RV.",
		badge: "HOME"
	},
	rvfax: {
		title: "RvFACTS",
		line: "Get specs, market value, ratings, NHTSA recalls, and more.",
		badge: "LIVE"
	},
	rvcal: {
		title: "RvCAL",
		line: "ZIP-based calculator with lender comparisons.",
		badge: "LIVE"
	},
	rvtow: {
		title: "RvTOW",
		line: "Truck · SUV · VIN decode for safe tow math.",
		badge: "LIVE"
	},
	rvtrips: {
		title: "RvTRIPS",
		line: "RV GPS with campgrounds, dump stations, and more.",
		badge: "LIVE"
	},
	more: {
		title: "PREMIUM",
		line: "Voice settings · NHTSA · suite tools.",
		badge: "SUITE"
	}
};
var THRESHOLD = 40;
/** Extra breathing room above keyboard for focused fields */
var FOCUS_GAP = 28;
function measure() {
	if (typeof window === "undefined") return {
		inset: 0,
		open: false,
		vvHeight: 0,
		vvOffsetTop: 0
	};
	const vv = window.visualViewport;
	const layoutH = window.innerHeight;
	if (!vv) return {
		inset: 0,
		open: false,
		vvHeight: layoutH,
		vvOffsetTop: 0
	};
	const covered = Math.max(0, layoutH - vv.height - vv.offsetTop);
	const inset = covered > THRESHOLD ? Math.round(covered) : 0;
	return {
		inset,
		open: inset > 0,
		vvHeight: vv.height,
		vvOffsetTop: vv.offsetTop
	};
}
function applyCssVars(k) {
	const root = document.documentElement;
	root.style.setProperty("--kb-inset", `${k.inset}px`);
	root.style.setProperty("--vv-height", `${k.vvHeight || window.innerHeight}px`);
	root.style.setProperty("--vv-offset-top", `${k.vvOffsetTop}px`);
	root.classList.toggle("kb-open", k.open);
	root.dataset.kbOpen = k.open ? "1" : "0";
}
function isTextField(el) {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	if (tag === "INPUT") {
		const type = (el.type || "text").toLowerCase();
		if (type === "button" || type === "checkbox" || type === "radio" || type === "file" || type === "submit" || type === "reset" || type === "image" || type === "hidden" || type === "range" || type === "color") return false;
		return true;
	}
	return tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
function findScrollParent(el) {
	let node = el.parentElement;
	while (node && node !== document.body && node !== document.documentElement) {
		const oy = window.getComputedStyle(node).overflowY;
		if ((oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight + 4 || node.hasAttribute("data-app-scroll") || node.classList.contains("rv-scroll")) return node;
		node = node.parentElement;
	}
	return null;
}
/**
* Scroll a focused field so it sits in the visible visual viewport,
* above the keyboard and any bottom chrome. Works for nested sheets.
*/
function scrollFieldIntoVisibleArea(el, keyboardInset = 0) {
	if (typeof window === "undefined") return;
	const vv = window.visualViewport;
	const vvTop = vv?.offsetTop ?? 0;
	const vvHeight = vv?.height ?? window.innerHeight;
	const kb = keyboardInset > 0 ? keyboardInset : Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kb-inset") || "0") || 0;
	const visibleTop = vvTop + 12;
	const visibleBottom = vvTop + vvHeight - Math.max(kb, 0) - FOCUS_GAP;
	const rect = el.getBoundingClientRect();
	const scroller = findScrollParent(el);
	if (scroller) {
		const sRect = scroller.getBoundingClientRect();
		const current = scroller.scrollTop;
		let delta = rect.top + rect.height / 2 - (visibleTop + visibleBottom) / 2;
		if (rect.bottom > visibleBottom - 8) delta = Math.max(delta, rect.bottom - visibleBottom + 16);
		if (rect.top < visibleTop + 8) delta = Math.min(delta, rect.top - visibleTop - 16);
		if (rect.bottom > visibleBottom - 4 || rect.top < Math.max(sRect.top, visibleTop) + 4 || Math.abs(delta) > 8) {
			const next = Math.max(0, current + delta);
			try {
				scroller.scrollTo({
					top: next,
					behavior: "smooth"
				});
			} catch {
				scroller.scrollTop = next;
			}
		}
		return;
	}
	try {
		el.scrollIntoView({
			block: "center",
			inline: "nearest",
			behavior: "smooth"
		});
	} catch {
		try {
			el.scrollIntoView(true);
		} catch {}
	}
}
/**
* Global keyboard inset for iOS Capacitor + Safari.
* Sets CSS vars: --kb-inset, --vv-height, --vv-offset-top
* Adds html.kb-open when keyboard is up.
*/
function useKeyboardInset() {
	const [state, setState] = (0, import_react.useState)({
		inset: 0,
		open: false,
		vvHeight: 0,
		vvOffsetTop: 0
	});
	(0, import_react.useEffect)(() => {
		let raf = 0;
		const publish = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				const next = measure();
				setState((prev) => prev.inset === next.inset && prev.open === next.open && Math.abs(prev.vvHeight - next.vvHeight) < 1 && Math.abs(prev.vvOffsetTop - next.vvOffsetTop) < 1 ? prev : next);
				applyCssVars(next);
			});
		};
		publish();
		const vv = window.visualViewport;
		vv?.addEventListener("resize", publish);
		vv?.addEventListener("scroll", publish);
		window.addEventListener("resize", publish);
		window.addEventListener("orientationchange", publish);
		window.addEventListener("focusin", publish);
		window.addEventListener("focusout", publish);
		let removeCap;
		(async () => {
			try {
				const { Keyboard } = await import("../_libs/capacitor__keyboard.mjs").then((n) => n.t);
				const applyNative = (h) => {
					const next = {
						inset: h > THRESHOLD ? h : 0,
						open: h > THRESHOLD,
						vvHeight: window.visualViewport?.height ?? window.innerHeight,
						vvOffsetTop: window.visualViewport?.offsetTop ?? 0
					};
					setState(next);
					applyCssVars(next);
				};
				const show = await Keyboard.addListener("keyboardWillShow", (info) => {
					applyNative(Math.round(info.keyboardHeight || 0));
				});
				const shown = await Keyboard.addListener("keyboardDidShow", (info) => {
					applyNative(Math.round(info.keyboardHeight || 0));
				});
				const hide = await Keyboard.addListener("keyboardWillHide", () => {
					const closed = {
						...measure(),
						inset: 0,
						open: false
					};
					setState(closed);
					applyCssVars(closed);
				});
				const hidden = await Keyboard.addListener("keyboardDidHide", () => {
					const closed = {
						...measure(),
						inset: 0,
						open: false
					};
					setState(closed);
					applyCssVars(closed);
				});
				removeCap = () => {
					show.remove();
					shown.remove();
					hide.remove();
					hidden.remove();
				};
			} catch {}
		})();
		return () => {
			cancelAnimationFrame(raf);
			vv?.removeEventListener("resize", publish);
			vv?.removeEventListener("scroll", publish);
			window.removeEventListener("resize", publish);
			window.removeEventListener("orientationchange", publish);
			window.removeEventListener("focusin", publish);
			window.removeEventListener("focusout", publish);
			removeCap?.();
			document.documentElement.classList.remove("kb-open");
			document.documentElement.style.removeProperty("--kb-inset");
		};
	}, []);
	return state;
}
/**
* When an input/textarea gains focus, keep it visible above the keyboard.
* Retries across the keyboard animation window (iOS is slow ~250–400ms).
*/
function useFocusScrollIntoView(enabled = true) {
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		let timers = [];
		const clearTimers = () => {
			for (const t of timers) window.clearTimeout(t);
			timers = [];
		};
		const runScroll = (t) => {
			scrollFieldIntoVisibleArea(t, Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kb-inset") || "0") || 0);
		};
		const onFocusIn = (e) => {
			const t = e.target;
			if (!isTextField(t)) return;
			clearTimers();
			runScroll(t);
			for (const delay of [
				80,
				180,
				320,
				480,
				700
			]) timers.push(window.setTimeout(() => {
				if (document.activeElement === t) runScroll(t);
			}, delay));
		};
		const onFocusOut = () => {
			window.setTimeout(() => {
				if (!isTextField(document.activeElement)) clearTimers();
			}, 50);
		};
		const onVv = () => {
			const t = document.activeElement;
			if (isTextField(t)) runScroll(t);
		};
		window.visualViewport?.addEventListener("resize", onVv);
		window.visualViewport?.addEventListener("scroll", onVv);
		document.addEventListener("focusin", onFocusIn, true);
		document.addEventListener("focusout", onFocusOut, true);
		return () => {
			clearTimers();
			document.removeEventListener("focusin", onFocusIn, true);
			document.removeEventListener("focusout", onFocusOut, true);
			window.visualViewport?.removeEventListener("resize", onVv);
			window.visualViewport?.removeEventListener("scroll", onVv);
		};
	}, [enabled]);
}
/** Dock tabs only — Premium lives in the top-right ⋯ menu */
var TABS = [
	{
		id: "rvfax",
		label: "RvFACTS",
		short: "Facts",
		iconSrc: "/assets/brand/icon-rvfax.png"
	},
	{
		id: "rvcal",
		label: "RvCAL",
		short: "Cal",
		iconSrc: "/assets/brand/icon-rvcal.png"
	},
	{
		id: "rvtow",
		label: "RvTOW",
		short: "Tow",
		iconSrc: "/assets/brand/icon-rvtow.png"
	},
	{
		id: "rvtrips",
		label: "RvTRIPS",
		short: "Trips",
		iconSrc: "/assets/brand/icon-rvtrips.png"
	},
	{
		id: "rvgrok",
		label: "RvGROK",
		short: "Grok",
		iconSrc: "/assets/brand/icon-rvgrok.png"
	}
];
/** Floating platinum-glass dock — icons + short labels, sliding active capsule */
function BottomTabs({ tab, onChange }) {
	const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === tab));
	const grokActive = tab === "rvgrok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "bottom-tabs-nav pointer-events-none relative z-50 w-full px-3 pt-1 sm:px-4",
		"data-bottom-dock": true,
		"data-active-tab": tab,
		style: { paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("bottom-tabs-dock pointer-events-auto relative mx-auto grid w-full max-w-md grid-cols-5 items-stretch gap-0 overflow-hidden rounded-[1.7rem] p-1 sm:max-w-lg", grokActive && "bottom-tabs-dock-ruby"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-[1px] z-0 rounded-[1.55rem] border border-white/[0.08]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "bottom-tabs-ambient pointer-events-none absolute inset-0 z-[1]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "bottom-tabs-edge-light pointer-events-none absolute inset-x-4 top-0 z-[1] h-px"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "bottom-tabs-shine bottom-tabs-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[2] w-[38%]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: cn("bottom-tab-indicator pointer-events-none absolute top-1 bottom-1 z-[1] rounded-[1.25rem]", grokActive ? "bottom-tab-indicator-ruby" : "bottom-tab-indicator-sapphire"),
					style: {
						width: "calc((100% - 0.5rem) / 5)",
						left: "0.25rem",
						transform: `translateX(${activeIndex * 100}%)`
					}
				}),
				TABS.map(({ id, label, short, iconSrc }) => {
					const active = tab === id;
					const isGrok = id === "rvgrok";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							hapticLight();
							onChange(id);
						},
						"aria-current": active ? "page" : void 0,
						"aria-label": label,
						title: label,
						className: cn("bottom-tab-btn group relative z-[3] flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 rounded-[1.25rem] px-0.5 py-1.5", "transition-[transform,opacity] duration-200 ease-out", "active:scale-[0.94] touch-manipulation select-none"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("relative flex size-7 items-center justify-center sm:size-8", active ? "opacity-100" : "opacity-[0.62] group-hover:opacity-90"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: iconSrc,
									alt: "",
									className: cn("bottom-tab-icon size-[22px] object-contain sm:size-6", active && "drop-shadow-[0_0_10px_rgba(160,210,255,0.55)]", isGrok && active && "drop-shadow-[0_0_10px_rgba(255,90,110,0.55)]"),
									draggable: false
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("bottom-tab-label text-center text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] sm:text-[10px]", isGrok ? active ? "text-[#ffd0d6]" : "text-white/45" : active ? "text-sky-50" : "text-white/45"),
								children: short
							}),
							active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: cn("absolute bottom-1 h-[2px] w-3.5 rounded-full", isGrok ? "bg-[#ff8a96] shadow-[0_0_8px_rgba(255,90,110,0.8)]" : "bg-sky-200 shadow-[0_0_8px_rgba(140,200,255,0.75)]")
							}) : null
						]
					}, id);
				})
			]
		})
	});
}
/** Provider only — hooks live in `ShellNavContext.ts` for Fast Refresh. */
function ShellNavProvider({ value, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellNavContext.Provider, {
		value,
		children
	});
}
/**
* Easy left/right swipe to change tabs.
* Attaches to shell; ignores form fields and vertical scrolls.
*/
function useSwipeTabs({ order, active, onChange, targetRef, threshold = 28, edgeOnly = false, enabled = true }) {
	(0, import_react.useEffect)(() => {
		const el = targetRef.current;
		if (!el || !enabled) return;
		let startX = 0;
		let startY = 0;
		let startT = 0;
		let tracking = false;
		let locked = null;
		const isBlocked = (t) => {
			if (!(t instanceof Element)) return false;
			return Boolean(t.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [data-no-swipe], [data-no-swipe-scroll], .price-slider-wrap, .price-slider, video"));
		};
		const onStart = (e) => {
			if (e.touches.length !== 1) return;
			const touch = e.touches[0];
			if (isBlocked(e.target)) {
				tracking = false;
				return;
			}
			if (edgeOnly) {
				const w = window.innerWidth;
				if (touch.clientX > 40 && touch.clientX < w - 40) {
					tracking = false;
					return;
				}
			}
			startX = touch.clientX;
			startY = touch.clientY;
			startT = Date.now();
			tracking = true;
			locked = null;
		};
		const onMove = (e) => {
			if (!tracking || e.touches.length !== 1) return;
			const touch = e.touches[0];
			const dx = touch.clientX - startX;
			const dy = touch.clientY - startY;
			if (!locked) {
				if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
				locked = Math.abs(dx) > Math.abs(dy) * .55 ? "h" : "v";
			}
			if (locked === "v") tracking = false;
		};
		const onEnd = (e) => {
			if (!tracking) return;
			tracking = false;
			const touch = e.changedTouches[0];
			if (!touch) return;
			const dx = touch.clientX - startX;
			const dy = touch.clientY - startY;
			const dt = Date.now() - startT;
			const absX = Math.abs(dx);
			const absY = Math.abs(dy);
			const clearlyHorizontal = absX > absY * 1.15 && absX >= 18;
			if (locked === "v" && !clearlyHorizontal) return;
			if (locked !== "h" && !clearlyHorizontal) return;
			const velocity = absX / Math.max(dt, 1);
			if (absX < (velocity > .3 ? Math.max(16, threshold * .45) : velocity > .18 ? Math.max(20, threshold * .7) : threshold)) return;
			if (absX < absY * .95 && !clearlyHorizontal) return;
			if (dt > 1400) return;
			const idx = order.indexOf(active);
			if (idx < 0) return;
			if (dx < 0 && idx < order.length - 1) onChange(order[idx + 1]);
			else if (dx > 0 && idx > 0) onChange(order[idx - 1]);
		};
		el.addEventListener("touchstart", onStart, {
			passive: true,
			capture: true
		});
		el.addEventListener("touchmove", onMove, {
			passive: true,
			capture: true
		});
		el.addEventListener("touchend", onEnd, {
			passive: true,
			capture: true
		});
		el.addEventListener("touchcancel", () => {
			tracking = false;
		}, { capture: true });
		return () => {
			el.removeEventListener("touchstart", onStart, true);
			el.removeEventListener("touchmove", onMove, true);
			el.removeEventListener("touchend", onEnd, true);
		};
	}, [
		active,
		edgeOnly,
		enabled,
		onChange,
		order,
		targetRef,
		threshold
	]);
}
/**
* Code-split suite tools — iOS cold start was parsing all 6 apps under splash.
* Launchpad stays eager; tools load only when visited.
*/
var RvFaxApp = (0, import_react.lazy)(() => import("./RvFaxApp-BscTAMC_.mjs").then((m) => ({ default: m.RvFaxApp })));
var RvGrokApp = (0, import_react.lazy)(() => import("./RvGrokApp-ChS9tovZ.mjs").then((m) => ({ default: m.RvGrokApp })));
var RvTowApp = (0, import_react.lazy)(() => import("./RvTowApp-DJOQP623.mjs").then((m) => ({ default: m.RvTowApp })));
var RvCalApp = (0, import_react.lazy)(() => import("./RvCalApp-B7gkuQnT.mjs").then((m) => ({ default: m.RvCalApp })));
var RvTripsApp = (0, import_react.lazy)(() => import("./RvTripsApp-DNLz0EH9.mjs").then((m) => ({ default: m.RvTripsApp })));
var MoreApp = (0, import_react.lazy)(() => import("./MoreApp-Z4UUT93C.mjs").then((m) => ({ default: m.MoreApp })));
var FLOAT_TAB_PAD = "pb-[calc(5.15rem+env(safe-area-inset-bottom,0px))]";
function SuiteFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-white/10" })
	});
}
var SuiteErrorBoundary = class extends import_react.Component {
	state = { err: null };
	static getDerivedStateFromError(err) {
		return { err };
	}
	componentDidCatch(err, info) {
		console.error(`[RvFOX] ${this.props.name} crashed`, err, info.componentStack);
	}
	render() {
		if (this.state.err) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[15px] font-bold text-white",
					children: [this.props.name, " hit a snag"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-[12px] text-white/70",
					children: this.state.err.message || "Something went wrong loading this tab."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold text-white",
					onClick: () => this.setState({ err: null }),
					children: "Try again"
				})
			]
		});
		return this.props.children;
	}
};
function AppShell() {
	const [tab, setTab] = (0, import_react.useState)("rvfax");
	const [grokSeed, setGrokSeed] = (0, import_react.useState)();
	const [calSeed, setCalSeed] = (0, import_react.useState)(null);
	const [launchOpen, setLaunchOpen] = (0, import_react.useState)(true);
	const [launchFading, setLaunchFading] = (0, import_react.useState)(false);
	const [suiteReady, setSuiteReady] = (0, import_react.useState)(false);
	const [grokSplashPlaying, setGrokSplashPlaying] = (0, import_react.useState)(false);
	const [visited, setVisited] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const mainRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const launchDoneRef = (0, import_react.useRef)(false);
	const calTokenRef = (0, import_react.useRef)(0);
	const kb = useKeyboardInset();
	useFocusScrollIntoView(true);
	const markVisited = (0, import_react.useCallback)((id) => {
		setVisited((prev) => {
			if (prev.has(id)) return prev;
			const n = new Set(prev);
			n.add(id);
			return n;
		});
	}, []);
	const finishLaunch = (0, import_react.useCallback)((nextTab) => {
		if (launchDoneRef.current) return;
		launchDoneRef.current = true;
		const dest = nextTab ?? "rvfax";
		setTab(dest);
		markVisited(dest);
		setSuiteReady(true);
		setLaunchFading(true);
		window.setTimeout(() => {
			setLaunchOpen(false);
			setLaunchFading(false);
		}, 280);
	}, [markVisited]);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			import("../_libs/capacitor__splash-screen.mjs").then((n) => n.t).then((m) => m.SplashScreen.hide({ fadeOutDuration: 150 })).catch(() => void 0);
		}, 4e3);
		return () => window.clearTimeout(t);
	}, []);
	const openGrok = (prompt) => {
		setGrokSeed(prompt);
		setTab("rvgrok");
		markVisited("rvgrok");
	};
	const openCalWithPrice = (0, import_react.useCallback)((price, label) => {
		calTokenRef.current += 1;
		setCalSeed({
			price: Math.max(0, Math.round(price)),
			label,
			token: calTokenRef.current
		});
		setTab("rvcal");
		markVisited("rvcal");
	}, [markVisited]);
	const clearCalSeed = (0, import_react.useCallback)(() => setCalSeed(null), []);
	const onTabChange = (0, import_react.useCallback)((next) => {
		setTab(next);
		markVisited(next);
		if (next !== "rvgrok") setGrokSplashPlaying(false);
	}, [markVisited]);
	useSwipeTabs({
		order: TAB_ORDER,
		active: tab,
		onChange: onTabChange,
		targetRef: shellRef,
		threshold: 24,
		enabled: !launchOpen
	});
	const hideDock = launchOpen || grokSplashPlaying || kb.open;
	const nav = (0, import_react.useMemo)(() => ({
		tab,
		setTab: onTabChange,
		splashPlaying: launchOpen || grokSplashPlaying,
		setSplashPlaying: setGrokSplashPlaying,
		calSeed,
		openCalWithPrice,
		clearCalSeed
	}), [
		tab,
		onTabChange,
		launchOpen,
		grokSplashPlaying,
		calSeed,
		openCalWithPrice,
		clearCalSeed
	]);
	const show = (id) => suiteReady && visited.has(id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellNavProvider, {
		value: nav,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: shellRef,
			className: "app-shell relative flex h-full min-h-0 w-full flex-col overflow-hidden overscroll-none bg-bg text-fg",
			"data-page-accent": PAGE_ACCENT[tab] ?? "sapphire",
			style: {
				overscrollBehavior: "none",
				height: kb.open && kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100%",
				maxHeight: kb.open && kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100%",
				transform: kb.open && kb.vvOffsetTop > 0 ? `translateY(${kb.vvOffsetTop}px)` : void 0
			},
			children: [
				launchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `fixed inset-0 z-[100] transition-opacity duration-300 ${launchFading ? "pointer-events-none opacity-0" : "opacity-100"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Launchpad, {
						onSelect: (t) => finishLaunch(t),
						onSkip: () => finishLaunch()
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					ref: mainRef,
					className: `relative min-h-0 flex-1 overflow-hidden touch-pan-y ${hideDock ? "pb-2" : FLOAT_TAB_PAD}`,
					"aria-hidden": launchOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteFallback, {}),
						children: [
							show("rvgrok") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "rvgrok" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "RvGROK",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvGrokApp, {
										active: tab === "rvgrok" && !launchOpen,
										seedPrompt: grokSeed,
										onSeedConsumed: () => setGrokSeed(void 0),
										onNavigate: onTabChange,
										onSplashPlayingChange: setGrokSplashPlaying
									})
								})
							}) : null,
							show("rvfax") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "rvfax" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "RvFACTS",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvFaxApp, { onOpenGrok: openGrok })
								})
							}) : null,
							show("rvcal") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "rvcal" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "RvCAL",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvCalApp, {})
								})
							}) : null,
							show("rvtow") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "rvtow" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "RvTOW",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvTowApp, {})
								})
							}) : null,
							show("rvtrips") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "rvtrips" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "RvTRIPS",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RvTripsApp, {})
								})
							}) : null,
							show("more") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "more" ? "h-full" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteErrorBoundary, {
									name: "More",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreApp, { onNavigate: onTabChange })
								})
							}) : null
						]
					})
				}),
				!hideDock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-x-0 bottom-0 z-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomTabs, {
						tab,
						onChange: onTabChange
					})
				}) : null
			]
		})
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => HomePage });
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { PAGE_COPY as a, hapticSnap as c, preloadHaptics as d, useShellNavOptional as f, uid as g, formatTime as h, PAGE_ACCENT as i, hapticSnapEnd as l, formatRelativeTime as m, scrollFieldIntoVisibleArea as n, MetalVerifiedTrue as o, cn as p, useKeyboardInset as r, hapticLight as s, routes_exports as t, hapticSnapStart as u };
