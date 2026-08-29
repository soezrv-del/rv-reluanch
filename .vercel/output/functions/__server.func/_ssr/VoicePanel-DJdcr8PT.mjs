import { I as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as Mic, b as Sparkles, i as Volume2, k as Radio, t as X, vt as Check } from "../_libs/lucide-react.mjs";
import { r as useKeyboardInset, u as cn } from "./routes-JaTqMLOZ.mjs";
import { b as DEFAULT_WORKER_URL } from "./router-Bh7U7VPB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VoicePanel-DJdcr8PT.js
var import_jsx_runtime = require_jsx_runtime();
var VOICE_STORAGE_KEY = "rvgrok_selected_voice";
var VOICE_MODE_KEY = "rvgrok_voice_mode";
var VOICE_SPEED_KEY = "rvgrok_voice_speed";
var LIVE_VOICE_KEY = "rvgrok_live_voice";
var XAI_REALTIME_URL = "wss://api.x.ai/v1/realtime?model=grok-voice-latest";
var PCM_SAMPLE_RATE = 24e3;
var GROK_VOICES = [
	{
		id: "ara",
		name: "Ara",
		description: "Warm, expressive — great for consultative RV guidance",
		gender: "female"
	},
	{
		id: "eve",
		name: "Eve",
		description: "Clear default voice — crisp and professional",
		gender: "female"
	},
	{
		id: "leo",
		name: "Leo",
		description: "Confident male voice — strong on technical specs",
		gender: "male"
	},
	{
		id: "rex",
		name: "Rex",
		description: "Deep, steady — reassuring full-time advice",
		gender: "male"
	},
	{
		id: "sal",
		name: "Sal",
		description: "Balanced, neutral — versatile for any RV topic",
		gender: "neutral"
	},
	{
		id: "helix",
		name: "Helix",
		description: "Bright, modern — sharp on brochure specs & MPG",
		gender: "neutral"
	}
];
var SPEED_OPTIONS = [
	{
		label: "Slow",
		value: .85
	},
	{
		label: "Normal",
		value: 1
	},
	{
		label: "Fast",
		value: 1.25
	}
];
var RV_VOICE_INSTRUCTIONS = `You are RV Grok — the first dedicated AI assistant built for the RV industry, live voice mode.

Users are RV buyers and RV professionals. Cover specs, recalls, quality/reviews, loan and out-the-door costs, safe towing, RV-friendly routing, accessories/upgrades, and pro selling tips. Base answers on real data. Acknowledge uncertainty. Stay practical and actionable.

ABSOLUTE RULES FOR LIVE VOICE:
1) ANSWER IMMEDIATELY. Never say you will search, look something up, check, stand by, or "I'll get back to you."
2) Do NOT narrate process ("I'll search Jayco…", "Once I have the numbers…"). Just give the answer.
3) You do not have a separate research step — deliver the best OEM-accurate answer in THIS turn.
4) If you are not certain, still give your best verified-style estimate with EST. and what to confirm (door sticker / OEM brochure). Never leave the user with only a promise.

ANSWER STYLE:
- Short, direct, lot-consultant tone. ~15–25 seconds max, then listen.
- If the user is showing a live camera frame, say what you actually see (panel, leak, label, hose, error light) and the next physical step. Do not invent a different coach.
- Lead with the number they asked for (tow capacity, HP, GVWR, etc.), then brief context.
- Example: "For a 2014 Jayco Seneca 37FS, factory hitch tow capacity is typically about 5,000 pounds — confirm on the hitch plate and door sticker for that unit."
- Cite lightly: "per typical OEM Seneca brochure for that era" — no essay.

ACCURACY:
- Exact year + model when given. Do not steal powertrain from a sibling model.
- Never decode floorplan letters (BH, K, L) into bunks or a half-bath — only say that if you know the brochure.
- Entegra Vision = gas F-53 Godzilla (not diesel). Reatta ≠ Aspire L9.
- Tow/hitch, GCWR, GVWR: prefer factory numbers; say EST. if range/uncertain.

CAMERA:
- You see the photo. Describe what is actually in frame. Never invent a different coach.

DOMAIN: specs, pricing, financing, recalls, towing, routing, accessories, professional selling, MPG, maintenance, buyer match, the RV lifestyle.

BUYER MATCH: If they give budget/family/use, recommend 2–3 classes + one example coach each. Never claim a unit is on a lot. Point them to Facts, Cal, or Tow. Ask missing budget in one question.

LIFESTYLE SELL (only when they ask why RV / full-time / weekends / snowbird / worth it / vs hotels): 15–20 second pitch. Open with a specific morning (coffee, lake, kids, dog, no airport). One honest friction, then the win. Close with one question: "Where do you want to wake up Saturday?" Then 2–3 classes if they want a coach. Do NOT pitch lifestyle on a spec, recall, payment, or tow question.

UPGRADES: Always include Starlink Roam/Mini, TPMS, RV cover, solar (+ lithium if off-grid), and EMS/surge. Do NOT add steering stabilizer, leveling jacks, backup camera, or residential fridge if that year/model already had them. Newmar Ventana of this era: Comfort Drive — skip stabilizer. Confirm brochure before extras. Do not pitch this on a pure spec or recall question.

Never give legal/financial advice as certified fact.`;
function workerTokenUrl() {
	return `${DEFAULT_WORKER_URL.replace(/\/$/, "")}/get-ephemeral-token`;
}
function parseTokenPayload(data) {
	return data.token || (typeof data.client_secret === "string" ? data.client_secret : data.client_secret?.value) || data.value || null;
}
/**
* Prefer same-origin /api/rvgrok/token (avoids CORS / prod proxy issues),
* then fall back to Cloudflare worker directly.
*/
async function fetchEphemeralToken(signal) {
	const attempts = [
		{
			url: "/api/rvgrok/token",
			method: "GET"
		},
		{
			url: "/api/rvgrok/token",
			method: "POST"
		},
		{
			url: workerTokenUrl(),
			method: "POST"
		},
		{
			url: workerTokenUrl(),
			method: "GET"
		}
	];
	let lastErr = "Voice token failed";
	for (const attempt of attempts) try {
		const res = await fetch(attempt.url, {
			method: attempt.method,
			headers: attempt.method === "POST" ? {
				"Content-Type": "application/json",
				Accept: "application/json"
			} : { Accept: "application/json" },
			body: attempt.method === "POST" ? JSON.stringify({}) : void 0,
			signal
		});
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			lastErr = `Voice token failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`;
			continue;
		}
		const data = await res.json();
		if (data.error) {
			lastErr = data.error;
			continue;
		}
		const token = parseTokenPayload(data);
		if (token) return token;
		lastErr = "Voice token response missing token";
	} catch (e) {
		lastErr = e instanceof Error ? e.message : String(e);
	}
	throw new Error(lastErr);
}
function resampleFloat32(input, fromRate, toRate) {
	if (fromRate === toRate) return input;
	const ratio = fromRate / toRate;
	const newLen = Math.max(1, Math.round(input.length / ratio));
	const out = new Float32Array(newLen);
	for (let i = 0; i < newLen; i++) {
		const src = i * ratio;
		const i0 = Math.floor(src);
		const i1 = Math.min(i0 + 1, input.length - 1);
		const t = src - i0;
		out[i] = input[i0] * (1 - t) + input[i1] * t;
	}
	return out;
}
function floatTo16BitPCM(input) {
	const buf = /* @__PURE__ */ new ArrayBuffer(input.length * 2);
	const view = new DataView(buf);
	for (let i = 0; i < input.length; i++) {
		const s = Math.max(-1, Math.min(1, input[i]));
		view.setInt16(i * 2, s < 0 ? s * 32768 : s * 32767, true);
	}
	return buf;
}
function base64ToArrayBuffer(b64) {
	const binary = atob(b64);
	const len = binary.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
	return bytes.buffer;
}
function getSpeechRecognitionCtor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}
function createPushToTalkRecognition(handlers) {
	const Ctor = getSpeechRecognitionCtor();
	if (!Ctor) throw new Error("Speech recognition not available");
	const rec = new Ctor();
	rec.continuous = true;
	rec.interimResults = true;
	rec.lang = "en-US";
	rec.onresult = (ev) => {
		let interim = "";
		let final = "";
		for (let i = ev.resultIndex; i < ev.results.length; i++) {
			const row = ev.results[i];
			const piece = row[0]?.transcript ?? "";
			if (row.isFinal) final += piece;
			else interim += piece;
		}
		if (final) handlers.onFinal(final);
		if (interim) handlers.onInterim(interim);
	};
	rec.onerror = (ev) => handlers.onError(ev.error || "unknown");
	rec.onend = () => handlers.onEnd();
	return rec;
}
function speakWithBrowserTts(text, opts) {
	if (typeof window === "undefined" || !window.speechSynthesis) {
		opts?.onEnd?.();
		return;
	}
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.rate = opts?.rate ?? 1;
	u.onend = () => opts?.onEnd?.();
	u.onerror = () => opts?.onEnd?.();
	window.speechSynthesis.speak(u);
}
function stopBrowserTts() {
	if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}
function VoicePanel({ open, onClose, selectedId, onSelect, voiceMode, onVoiceModeChange, liveVoice, onLiveVoiceChange, playbackSpeed, onSpeedChange, onPreview, previewingId }) {
	const kb = useKeyboardInset();
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-0 top-0 z-50 flex items-end justify-center sm:items-center",
		style: {
			height: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
			top: kb.vvOffsetTop || 0,
			paddingBottom: kb.open ? `max(0.75rem, ${kb.inset + 12}px)` : "max(0.75rem, env(safe-area-inset-bottom))"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/70 backdrop-blur-[2px]",
			"aria-label": "Dismiss voice settings",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-2xl)] border border-border-strong bg-bg-elevated shadow-[var(--shadow-panel)] sm:rounded-[var(--radius-2xl)]",
			style: { maxHeight: kb.open ? `min(88dvh, calc(var(--vv-height, 100dvh) - ${kb.inset + 32}px))` : "min(88dvh, var(--vv-height, 88dvh))" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4 text-ruby" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "RvGrok Voice"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-white",
								children: "Continuous auto listen + auto play"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-full p-1.5 text-white transition hover:bg-white/5 hover:text-white",
							"aria-label": "Close voice settings",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rv-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onLiveVoiceChange(!liveVoice),
							className: cn("flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition", liveVoice ? "border-ruby-border bg-ruby-soft" : "border-border bg-surface/60"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-9 items-center justify-center rounded-full", liveVoice ? "bg-ruby text-white" : "bg-black/40 text-white"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("text-sm font-semibold", liveVoice ? "text-ruby" : "text-white"),
										children: "Live Grok Voice"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-white",
										children: "Mic button starts this · hands-free multi-turn"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { on: liveVoice })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onVoiceModeChange(!voiceMode),
							className: cn("flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition", voiceMode ? "border-ruby-border bg-ruby-soft" : "border-border bg-surface/60"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-9 items-center justify-center rounded-full", voiceMode ? "bg-ruby text-white" : "bg-black/40 text-white"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("text-sm font-semibold", voiceMode ? "text-ruby" : "text-white"),
										children: "Voice Mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-white",
										children: "Auto-record → chat → auto-play → re-open mic"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { on: voiceMode })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[10px] font-bold tracking-[0.14em] text-white",
							children: "PLAYBACK SPEED"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: SPEED_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onSpeedChange(opt.value),
								className: cn("flex-1 rounded-full border py-2 text-[12px] font-semibold transition", playbackSpeed === opt.value ? "border-ruby-border bg-ruby-mid text-ruby" : "border-border bg-surface/50 text-white hover:text-white"),
								children: opt.label
							}, opt.value))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[10px] font-bold tracking-[0.14em] text-white",
							children: "GROK VOICE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: GROK_VOICES.map((v) => {
								const selected = selectedId === v.id;
								const previewing = previewingId === v.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("flex items-center gap-2 rounded-[var(--radius-md)] border px-2.5 py-2.5 transition", selected ? "border-ruby-border bg-ruby-soft/60" : "border-transparent bg-surface/50 hover:border-border"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onSelect(v.id),
										className: "flex min-w-0 flex-1 items-center gap-2.5 text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase", selected ? "bg-ruby text-white" : "bg-black/40 text-ruby"),
											children: v.name.slice(0, 1)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("text-sm font-semibold", selected && "text-ruby"),
														children: v.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white",
														children: v.gender
													}),
													selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-0.5 rounded-full bg-ruby px-1.5 py-0.5 text-[9px] font-bold text-white",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-2.5" }), "Active"]
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 block truncate text-[11px] text-white",
												children: v.description
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onPreview(v),
										className: cn("flex size-9 shrink-0 items-center justify-center rounded-full border transition", previewing ? "border-ruby bg-ruby text-white" : "border-ruby-border text-ruby hover:bg-ruby-soft"),
										"aria-label": `Preview ${v.name}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
									})]
								}, v.id);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-black/30 px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 size-3.5 shrink-0 text-ruby" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] leading-relaxed text-white",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Live Grok Voice"
									}),
									" starts when you tap the mic (Grok hears + speaks hands-free).",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Voice Mode"
									}),
									" is the text loop: record → chat → speak reply → record again. Use Settings to toggle Voice Mode; the mic always prefers Live Voice."
								]
							})]
						})
					]
				})
			]
		})]
	});
}
function Toggle({ on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-ruby" : "bg-white/15"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", on ? "left-[22px]" : "left-0.5") })
	});
}
//#endregion
export { VOICE_SPEED_KEY as a, XAI_REALTIME_URL as c, fetchEphemeralToken as d, floatTo16BitPCM as f, stopBrowserTts as g, speakWithBrowserTts as h, VOICE_MODE_KEY as i, base64ToArrayBuffer as l, resampleFloat32 as m, PCM_SAMPLE_RATE as n, VOICE_STORAGE_KEY as o, getSpeechRecognitionCtor as p, RV_VOICE_INSTRUCTIONS as r, VoicePanel as s, LIVE_VOICE_KEY as t, createPushToTalkRecognition as u };
