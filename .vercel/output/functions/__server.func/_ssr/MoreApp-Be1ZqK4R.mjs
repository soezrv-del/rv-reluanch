import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Search, D as RefreshCw, E as Route, K as Landmark, L as Map, P as MessageSquare, U as LoaderCircle, X as Heart, _ as Star, ct as CircleHelp, ft as ChevronRight, i as Volume2, lt as CircleCheck, nt as ExternalLink, pt as ChevronLeft, t as X, tt as FileText, u as TriangleAlert, x as Shield, y as Sparkles, z as Mail } from "../_libs/lucide-react.mjs";
import { u as cn } from "./routes-BIdx5g1s.mjs";
import { a as SuitePage } from "./SuitePage-CeCp5hH3.mjs";
import { t as fetchRecallsViaApi } from "./recalls-4yfzANbY.mjs";
import { a as VOICE_SPEED_KEY, g as stopBrowserTts, h as speakWithBrowserTts, i as VOICE_MODE_KEY, o as VOICE_STORAGE_KEY, s as VoicePanel, t as LIVE_VOICE_KEY } from "./VoicePanel-Ymq3mvEH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MoreApp-Be1ZqK4R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NhtsaRecallsPanel({ year, make, model, compact, className }) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const load = (bypass = false) => {
		if (!year || !make || !model) return;
		const ctrl = new AbortController();
		setLoading(true);
		setError(null);
		if (bypass) setData(null);
		fetchRecallsViaApi(year, make, model, ctrl.signal).then((res) => {
			if (!res.ok) {
				setError(res.error);
				setData(null);
				return;
			}
			setData(res.data);
		}).finally(() => setLoading(false));
		return () => ctrl.abort();
	};
	(0, import_react.useEffect)(() => {
		return load();
	}, [
		year,
		make,
		model
	]);
	const count = data?.recallCount ?? 0;
	const hasAlert = count > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-[var(--radius-lg)] border px-4 py-3", hasAlert ? "border-ruby-border/50 bg-ruby-soft/40" : "border-emerald-400/30 bg-emerald-500/10", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("text-[10px] font-bold tracking-[0.14em]", hasAlert ? "text-ruby" : "text-emerald-300"),
					children: "NHTSA LIVE RECALLS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-[12px] text-white",
					children: [
						year,
						" ",
						make,
						" ",
						model
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => load(true),
					disabled: loading,
					className: "rounded-full border border-white/20 p-1.5 text-white hover:bg-white/10 disabled:opacity-50",
					"aria-label": "Refresh recalls",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
				})]
			}),
			loading && !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 flex items-center gap-2 text-[13px] text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Checking NHTSA…"]
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-amber",
				children: error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 flex items-center gap-1.5 text-[15px] font-bold", hasAlert ? "text-ruby" : "text-emerald-300"),
					children: [hasAlert ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), hasAlert ? `${count} NHTSA campaign${count === 1 ? "" : "s"} on record` : "No NHTSA recalls found for this vehicle"]
				}),
				!compact && data && data.recalls.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 max-h-64 space-y-2 overflow-y-auto",
					children: data.recalls.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecallCard, { r }, r.campaignNumber || r.summary.slice(0, 40)))
				}) : null,
				compact && hasAlert && data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-1.5",
					children: [data.recalls.slice(0, 2).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-[11px] leading-snug text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-ruby",
								children: r.campaignNumber || "Campaign"
							}),
							" · ",
							r.component
						]
					}, r.campaignNumber)), count > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-[11px] text-white",
						children: [
							"+",
							count - 2,
							" more"
						]
					}) : null]
				}) : null,
				!compact && data && (data.defectCount ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 border-t border-white/10 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] font-bold tracking-[0.12em] text-amber",
						children: ["OWNER COMPLAINTS · ", data.defectCount]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 max-h-40 space-y-1.5 overflow-y-auto",
						children: (data.defects ?? []).slice(0, 5).map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[11px] leading-snug text-white",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-amber",
									children: d.component || "Complaint"
								}),
								d.crashFlag || d.fireFlag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-1 text-ruby",
									children: [d.crashFlag ? " · crash" : "", d.fireFlag ? " · fire" : ""]
								}) : null,
								d.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 line-clamp-3 text-white/85",
									children: d.summary
								}) : null
							]
						}, d.odiNumber || `${d.date}-${i}`))
					})]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.nhtsa.gov/recalls",
				target: "_blank",
				rel: "noreferrer",
				className: cn("mt-2 inline-flex items-center gap-1 text-[12px] font-semibold", hasAlert ? "text-ruby" : "text-emerald-300"),
				children: ["Verify at NHTSA.gov ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
			})
		]
	});
}
function RecallCard({ r }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-xl border border-white/12 bg-black/35 px-3 py-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-ruby/90 px-2 py-0.5 text-[10px] font-bold text-white",
						children: r.campaignNumber || "N/A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold text-white",
						children: r.component
					}),
					r.reportDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-white",
						children: r.reportDate
					}) : null
				]
			}),
			r.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-[12px] leading-relaxed text-white",
				children: r.summary
			}) : null,
			r.consequence ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[11px] leading-relaxed text-amber",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold",
					children: "Risk: "
				}), r.consequence]
			}) : null,
			r.remedy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[11px] leading-relaxed text-emerald-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold",
					children: "Remedy: "
				}), r.remedy]
			}) : null
		]
	});
}
var SAVED_KEY = "rvfax_saved_v1";
var GROK_HIST_KEY = "rvfax_grok_history_v1";
function countSaved() {
	try {
		const raw = localStorage.getItem(SAVED_KEY);
		if (!raw) return 0;
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? arr.length : 0;
	} catch {
		return 0;
	}
}
function countGrokChats() {
	try {
		const raw = localStorage.getItem(GROK_HIST_KEY);
		if (!raw) return 0;
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? arr.length : 0;
	} catch {
		return 0;
	}
}
function MoreApp({ onNavigate }) {
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [recallYear, setRecallYear] = (0, import_react.useState)("2024");
	const [recallMake, setRecallMake] = (0, import_react.useState)("Tiffin");
	const [recallModel, setRecallModel] = (0, import_react.useState)("Allegro Bus");
	const [recallArmed, setRecallArmed] = (0, import_react.useState)(false);
	const [voiceOpen, setVoiceOpen] = (0, import_react.useState)(false);
	const [selectedVoice, setSelectedVoice] = (0, import_react.useState)("ara");
	const [voiceMode, setVoiceMode] = (0, import_react.useState)(false);
	const [liveVoice, setLiveVoice] = (0, import_react.useState)(false);
	const [playbackSpeed, setPlaybackSpeed] = (0, import_react.useState)(1);
	const [previewingId, setPreviewingId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			const v = localStorage.getItem(VOICE_STORAGE_KEY);
			if (v) setSelectedVoice(v);
			setVoiceMode(localStorage.getItem(VOICE_MODE_KEY) === "true");
			setLiveVoice(localStorage.getItem(LIVE_VOICE_KEY) === "true");
			const sp = Number(localStorage.getItem(VOICE_SPEED_KEY));
			if (sp && !Number.isNaN(sp)) setPlaybackSpeed(sp);
		} catch {}
	}, []);
	const persistVoice = (id) => {
		setSelectedVoice(id);
		try {
			localStorage.setItem(VOICE_STORAGE_KEY, id);
		} catch {}
	};
	const persistSpeed = (sp) => {
		setPlaybackSpeed(sp);
		try {
			localStorage.setItem(VOICE_SPEED_KEY, String(sp));
		} catch {}
	};
	const setVoiceModeArmed = (on) => {
		setVoiceMode(on);
		try {
			localStorage.setItem(VOICE_MODE_KEY, String(on));
		} catch {}
	};
	const setLiveVoiceArmed = (on) => {
		setLiveVoice(on);
		try {
			localStorage.setItem(LIVE_VOICE_KEY, String(on));
		} catch {}
	};
	const handlePreview = (voice) => {
		setPreviewingId(voice.id);
		speakWithBrowserTts(`Hi, I'm ${voice.name}. I'll be your RV Grok voice.`, {
			rate: playbackSpeed,
			onEnd: () => setPreviewingId(null)
		});
		window.setTimeout(() => setPreviewingId(null), 3500);
	};
	const stats = (0, import_react.useMemo)(() => ({
		saved: countSaved(),
		chats: countGrokChats()
	}), [sheet]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitePage, {
			tab: "more",
			adaptiveGlass: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-lg space-y-4 px-3 pb-12 pt-3 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center justify-between gap-3",
						children: [onNavigate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onNavigate("rvfax"),
							className: "inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" }), "Back"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full border border-blue/45 bg-blue/15 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), "v2.0 Beta"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: "YOUR ACTIVITY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTile, {
								label: "Searches",
								sub: "RvFax",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5 text-blue" }),
								accent: "blue",
								onClick: () => onNavigate?.("rvfax")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTile, {
								label: "Saved RVs",
								sub: stats.saved > 0 ? `${stats.saved} saved` : "Favorites",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 text-ruby" }),
								accent: "ruby",
								onClick: () => onNavigate?.("rvfax")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTile, {
								label: "Trips",
								sub: "RvTrips",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-5 text-emerald-400" }),
								accent: "green",
								onClick: () => onNavigate?.("rvtrips")
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: "TOOLS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-prestige overflow-hidden rounded-[1.25rem]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4 text-ruby" }),
								title: "RvGrok Voice Settings",
								sub: "Live voice · hands-free · speaker · Helix & more",
								onClick: () => setVoiceOpen(true)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4 text-blue" }),
								title: "Ask RvGrok",
								sub: "Voice · chat · coach intel",
								onClick: () => onNavigate?.("rvgrok")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-green" }),
								title: "RvCal financing",
								sub: "Payment · ZIP tax · lenders",
								onClick: () => onNavigate?.("rvcal")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4 text-amber" }),
								title: "RvTow match",
								sub: "Truck · SUV · VIN decode",
								onClick: () => onNavigate?.("rvtow"),
								last: true
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass-prestige-gold relative overflow-hidden rounded-[1.25rem] p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-[0.16em] text-amber",
								children: "THIS BUILD"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-[17px] font-bold leading-snug text-white",
								children: "Full suite is open"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[12px] leading-relaxed text-white",
								children: "Facts, Cal, Tow, Trips, and Grok are unlocked for evaluation. No in-app purchases in this version."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-amber/40 bg-amber/15",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-amber" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: "SUPPORT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-prestige overflow-hidden rounded-[1.25rem]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4 text-blue" }),
								title: "Help & FAQ",
								sub: "Common questions answered",
								onClick: () => setSheet("help")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4 text-ruby" }),
								title: "Send Feedback",
								sub: "Report issues or suggest features",
								onClick: () => setSheet("feedback")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://www.nhtsa.gov/recalls",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-blue" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[15px] font-bold text-white",
											children: "NHTSA.gov — Official Recalls"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11px] text-white",
											children: "Verify recalls directly with government"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 shrink-0 text-white" })
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: "NHTSA RECALL LOOKUP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-prestige space-y-2.5 rounded-[1.25rem] p-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] leading-relaxed text-white",
								children: "Live government data by year, make, and model — same feed as the VIN decoder."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block text-[9px] font-bold tracking-wide text-white",
											children: "YEAR"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: recallYear,
											onChange: (e) => {
												setRecallYear(e.target.value);
												setRecallArmed(false);
											},
											className: "glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none",
											inputMode: "numeric",
											maxLength: 4
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block text-[9px] font-bold tracking-wide text-white",
											children: "MAKE"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: recallMake,
											onChange: (e) => {
												setRecallMake(e.target.value);
												setRecallArmed(false);
											},
											className: "glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block text-[9px] font-bold tracking-wide text-white",
											children: "MODEL"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: recallModel,
											onChange: (e) => {
												setRecallModel(e.target.value);
												setRecallArmed(false);
											},
											className: "glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setRecallArmed(true),
								className: "flex w-full items-center justify-center gap-2 rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white",
								children: "Check NHTSA recalls"
							}),
							recallArmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NhtsaRecallsPanel, {
								year: recallYear,
								make: recallMake,
								model: recallModel
							}) : null
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: "LEGAL & PRIVACY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-prestige overflow-hidden rounded-[1.25rem]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://rvfox.app/privacy.html",
								target: "_blank",
								rel: "noreferrer",
								className: "flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-blue" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[15px] font-bold text-white",
											children: "Privacy Policy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11px] text-white",
											children: "rvfox.app/privacy.html"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 shrink-0 text-white" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://rvfox.app/support.html",
								target: "_blank",
								rel: "noreferrer",
								className: "flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4 text-blue" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[15px] font-bold text-white",
											children: "Support"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11px] text-white",
											children: "rvfox.app/support.html"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 shrink-0 text-white" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowLink, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-white" }),
								title: "Terms & Copyright",
								sub: "© 2026 RVFAX. All rights reserved.",
								onClick: () => setSheet("terms")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "mailto:contact@rvfox.app",
								className: "flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4 text-blue" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[15px] font-bold text-white",
											children: "Contact"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11px] text-white",
											children: "contact@rvfox.app"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-white" })
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "space-y-1.5 px-1 pb-2 text-center text-[10px] leading-relaxed text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 RVFAX · All Rights Reserved" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Recall data sourced from NHTSA.gov (U.S. Government)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "AI specs are estimates — always verify before purchase" })
						]
					})
				]
			})
		}),
		sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoSheet, {
			id: sheet,
			onClose: () => setSheet(null)
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoicePanel, {
			open: voiceOpen,
			onClose: () => {
				setVoiceOpen(false);
				stopBrowserTts();
				setPreviewingId(null);
			},
			selectedId: selectedVoice,
			onSelect: persistVoice,
			voiceMode,
			onVoiceModeChange: setVoiceModeArmed,
			liveVoice,
			onLiveVoiceChange: setLiveVoiceArmed,
			playbackSpeed,
			onSpeedChange: persistSpeed,
			onPreview: handlePreview,
			previewingId
		})
	] });
}
function ActivityTile({ label, sub, icon, accent, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "glass-prestige flex flex-col items-center rounded-[1.15rem] px-2 py-3.5 text-center transition active:scale-[0.98]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-2",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mb-1.5 h-0.5 w-6 rounded-full", accent === "blue" ? "bg-blue" : accent === "ruby" ? "bg-ruby" : "bg-emerald-400") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px] font-bold text-white",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 text-[9px] text-white",
				children: sub
			})
		]
	});
}
function RowLink({ icon, title, sub, onClick, last }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/5", !last && "border-b border-white/10"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[15px] font-bold text-white",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] text-white",
					children: sub
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-white" })
		]
	});
}
function InfoSheet({ id, onClose }) {
	if (!id) return null;
	const copy = SHEETS[id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-white/10 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[16px] font-bold text-white",
				children: copy.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "rounded-full p-2 text-white hover:bg-white/10",
				"aria-label": "Close",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-app-scroll": true,
			className: "rv-scroll flex-1 overflow-y-auto px-4 py-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-lg space-y-3 text-[13px] leading-relaxed text-white",
				children: copy.body.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p }, i))
			})
		})]
	});
}
var SHEETS = {
	help: {
		title: "Help & FAQ",
		body: [
			"RvGrok — AI chat and live voice. Open Premium → RvGrok Voice Settings for speaker, Live Voice, and hands-free.",
			"RvFax — Year → make → model → floorplan search with brochure-style specs and class filters.",
			"RvCal — Purchase price slider, ZIP tax, credit bands (650–800+), and credit-aware lenders.",
			"RvTow — Truck/SUV catalog + NHTSA VIN decode for tow capacity checks.",
			"RvTrips — Lock your coach profile, enter addresses, route with OSRM, find free sewer dumps, and only see restrictions that match the path.",
			"Swipe left/right between tabs. Scroll up to hide header & footer chrome on iPhone."
		]
	},
	feedback: {
		title: "Send Feedback",
		body: [
			"Email contact@rvfox.app with bugs, coach data gaps, or feature ideas.",
			"Include: device, iOS/Android version, which tab, and what you expected.",
			"Toy hauler garage specs, Super C models, and highline diesel data improve fastest with real brochure notes from you."
		]
	},
	privacy: {
		title: "Privacy Policy",
		body: [
			"RVFAX stores preferences and saved RVs on your device (local storage). Chat history stays in-browser unless you clear it.",
			"Routing uses OSRM/geocode proxies; addresses are sent only to compute routes.",
			"Recall lookups use NHTSA. We do not sell personal data. Contact privacy@rvfox.app for CCPA requests.",
			"AI answers and specs are estimates — always verify with the manufacturer or a dealer before purchase."
		]
	},
	terms: {
		title: "Terms & Copyright",
		body: [
			"© 2026 RVFAX. All rights reserved.",
			"This app provides decision-support tools, not legal, financing, or safety guarantees.",
			"Lender rates and eligibility are curated estimates, not offers of credit.",
			"OSRM/OpenStreetMap data © contributors. NHTSA recall data © U.S. Government."
		]
	}
};
//#endregion
export { MoreApp };
