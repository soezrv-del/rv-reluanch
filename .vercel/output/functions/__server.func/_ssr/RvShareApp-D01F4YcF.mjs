import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Plus, I as MessageCircle, K as Landmark, St as Bookmark, _t as Check, gt as ChevronDown, lt as Copy, nt as FileText, t as X, v as Sparkles, x as Share2 } from "../_libs/lucide-react.mjs";
import { d as cn, l as hapticSuccess, s as hapticLight, u as useShellNavOptional } from "./routes-Pmuw5ThC.mjs";
import { a as SuitePage } from "./SuitePage-BuhYUyxz.mjs";
import { d as formatMoney, i as TERM_PRESETS, r as DOWN_PRESETS, s as computeLoan, u as defaultAprForTerm } from "./rvCal-CgEdg_DQ.mjs";
import { _ as getSpec, c as compareSelectionKey, g as getRatingMetadata, u as estimateMarket, x as ratingFor } from "./catalog-cr78mWmG.mjs";
import { t as buildBrochureSpecs } from "./brochureSpecs-Bt84cf8m.mjs";
import { n as mediaForRvType } from "./typeMedia-CmX7-SFY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvShareApp-D01F4YcF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Hostname suitable for absolute og:image / x:game:image URLs. */
function publicAppHost(hostHeader) {
	const host = String(hostHeader ?? "").split(",")[0].trim().split(":")[0].toLowerCase();
	if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
	if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
	return host;
}
function resolveShareHost() {
	if (typeof window !== "undefined") return publicAppHost(window.location.host);
	return publicAppHost(void 0);
}
var SAVED_UNITS_KEY = "rvfax_saved_v1";
var SAVED_UNITS_EVENT = "rvfax-saved-changed";
var DEFAULT_SHARE_INCLUDE = {
	coach: true,
	market: true,
	payment: true,
	lifestyle: true,
	specs: true,
	strengths: true
};
function loadSavedUnits() {
	try {
		const raw = localStorage.getItem(SAVED_UNITS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function coachTitle(r) {
	const base = [
		r.year,
		r.make,
		r.model
	].filter(Boolean).join(" ");
	return r.floorplan ? `${base} ${r.floorplan}` : base;
}
function lifestyleImageFor(type, fuelType, chassis) {
	return mediaForRvType(type, fuelType, chassis);
}
function defaultPaymentFor(r) {
	const market = estimateMarket(r.data, r.year, r.floorplan);
	const price = market.retailHigh || market.msrpHi || 15e4;
	const termMonths = 144;
	return {
		price,
		downPct: 10,
		termMonths,
		apr: defaultAprForTerm(termMonths)
	};
}
function defaultMarketFor(r) {
	const market = estimateMarket(r.data, r.year, r.floorplan);
	return {
		tradeIn: market.tradeIn || 0,
		retailLow: market.retailLow || 0,
		retailHigh: market.retailHigh || 0,
		msrpLo: market.msrpLo || 0,
		msrpHi: market.msrpHi || 0
	};
}
function hasVal(v) {
	if (!v) return false;
	const t = v.trim();
	if (!t || t === "—" || t === "-" || t === "–") return false;
	if (/^n\/a\b/i.test(t)) return false;
	return true;
}
function group(title, pairs) {
	return {
		title,
		rows: pairs.filter(([, v]) => hasVal(v)).map(([label, value]) => ({
			label,
			value: String(value).trim()
		}))
	};
}
function coachBrochure(r) {
	return buildBrochureSpecs(r.data, r.year, r.make, r.model, r.floorplan || "");
}
function brochureSpecGroups(r) {
	const b = coachBrochure(r);
	const economy = hasVal(b.mpgHighway) && b.mpgHighway !== "—" ? `${b.mpgHighway} hwy${b.mpgCity && b.mpgCity !== "—" ? ` · ${b.mpgCity} city` : ""}` : void 0;
	return [
		group("NOTES", [["Catalog", r.data.description ? r.data.description.slice(0, 280) : void 0]]),
		group("POWERTRAIN", [
			["Engine", b.engine],
			["Horsepower", b.horsepower],
			["Torque", b.torque],
			["Transmission", b.transmission],
			["Chassis", b.chassis],
			["Fuel", b.fuelType],
			["Fuel capacity", b.fuelCapacity],
			["Economy", economy],
			["Range", b.rangeMiles]
		]),
		group("WEIGHTS", [
			["GVWR", b.gvwr],
			["UVW", b.uvw],
			["CCC", b.ccc],
			["GCWR", b.gcwr],
			[b.hitchLabel || "Hitch / tow", b.hitchOrPin]
		]),
		group("DIMENSIONS", [
			["Length", b.lengthFt],
			["Exterior width", b.exteriorWidth],
			["Exterior height", b.exteriorHeight],
			["Interior height", b.interiorHeight],
			["Wheelbase", b.wheelbase]
		]),
		group("LIVING", [
			["Sleeps", b.sleeps],
			["Slideouts", b.slideouts],
			["Seat belts", b.seatBelts],
			["Awning", b.awning],
			["Construction", b.construction],
			["Warranty", b.warranty]
		]),
		group("TANKS", [
			["Fresh", b.freshWater],
			["Gray", b.grayWater],
			["Black", b.blackWater],
			["Propane", b.propane],
			["Water heater", b.waterHeater]
		]),
		group("POWER", [
			["Generator", b.generator],
			["Electrical", b.electricalService],
			["A/C", b.acUnits],
			["Furnace", b.furnaceBtu],
			["Converter", b.converter]
		]),
		group("CHASSIS GEAR", [["Axles", b.axles], ["Tires", b.tireSize]]),
		group("GARAGE", [
			["Length", b.garageLength],
			["Width", b.garageWidth],
			["Height", b.garageHeight],
			["Capacity", b.garageCapacity],
			["Ramp", b.rampWidth],
			["Fuel station", b.fuelStation],
			["Fits", b.garageFits]
		])
	].filter((g) => g.rows.length);
}
function kitStrengths(r, payment) {
	const b = coachBrochure(r);
	const meta = getRatingMetadata(r.make, r.model, r.year);
	const out = [];
	out.push(`${meta.tierLabel} · ${meta.score.toFixed(1)} / 5.0 · ${meta.confidence} confidence`);
	if (meta.yearNote) out.push(meta.yearNote);
	if (/diesel/i.test(b.fuelType) || /diesel|cummins|isl|l9|x15/i.test(b.engine)) out.push("Diesel powertrain — torque for grades and towing");
	const slides = parseInt(b.slideouts, 10);
	if (Number.isFinite(slides) && slides >= 4) out.push(`${slides} slideouts — residential living area`);
	else if (Number.isFinite(slides) && slides >= 1) out.push(`${slides} slide${slides === 1 ? "" : "s"} for extra living space`);
	const sleeps = parseInt(b.sleeps, 10);
	if (Number.isFinite(sleeps) && sleeps >= 6) out.push(`Sleeps ${sleeps} — family and guest ready`);
	else if (Number.isFinite(sleeps) && sleeps >= 4) out.push(`Sleeps ${sleeps}`);
	if (hasVal(b.generator) && !/optional|see options|prep/i.test(b.generator)) out.push(`Onboard generator: ${b.generator}`);
	if (hasVal(b.electricalService) && /50/.test(b.electricalService)) out.push("50-amp service — full residential loads");
	if (b.isToyHauler && hasVal(b.garageLength)) out.push(`Toy garage ${b.garageLength}`);
	if (b.hitchLabel === "Tow Capacity" && hasVal(b.hitchOrPin) && !/^—/.test(b.hitchOrPin)) out.push(`Tow rating ${b.hitchOrPin}`);
	if (r.data.warrantyYears && r.data.warrantyYears >= 2) out.push(`${r.data.warrantyYears}-year structural warranty`);
	const fresh = parseInt(b.freshWater, 10);
	if (Number.isFinite(fresh) && fresh >= 80) out.push(`${fresh} gal fresh — longer dry camping`);
	if (payment && payment.price > 0) {
		const p = paymentBreakdown(payment);
		out.push(`Est. ${formatMoney(p.monthly)} / mo at ${payment.downPct}% down, ${p.years} yr`);
		out.push(`Financed ${formatMoney(p.financed)}`);
		if (payment.downPct >= 20) out.push("Strong down payment — lower monthly and less interest");
		else if (payment.downPct >= 10) out.push("10%+ down keeps the note in a typical RV term");
	}
	return out;
}
function coachSnapshot(r) {
	const b = coachBrochure(r);
	const rating = ratingFor(r.make, r.model, r.year);
	return {
		type: r.data.type || "",
		rating: Number.isFinite(rating) ? `★ ${rating.toFixed(1)}` : "",
		sleeps: b.sleeps || (r.data.sleeps ? String(r.data.sleeps) : ""),
		length: b.lengthFt || ""
	};
}
function paymentBreakdown(payment) {
	const down = Math.round(payment.price * payment.downPct / 100);
	const loan = computeLoan({
		price: payment.price,
		downPayment: down,
		apr: payment.apr,
		termMonths: payment.termMonths,
		taxRate: 0
	});
	return {
		down,
		years: payment.termMonths / 12,
		monthly: Math.round(loan.monthlyPayment),
		financed: Math.round(loan.amountFinanced),
		interest: Math.round(loan.totalInterest),
		totalPaid: Math.round(loan.totalPaid),
		loan
	};
}
function buildCoachKit(opts) {
	const { result: r, include, payment } = opts;
	const lines = [];
	const title = coachTitle(r);
	const market = opts.market ?? defaultMarketFor(r);
	const snap = coachSnapshot(r);
	lines.push("SpaceX AI Powered RvFOX Report");
	lines.push("Know before you buy.");
	lines.push("");
	lines.push(title);
	if (snap.type) lines.push(`Type: ${snap.type}`);
	if (snap.rating) lines.push(`Rating: ${snap.rating}`);
	if (snap.sleeps) lines.push(`Sleeps: ${snap.sleeps}`);
	if (snap.length) lines.push(`Length: ${snap.length}`);
	if (include.market) {
		lines.push("");
		lines.push("MARKET");
		lines.push(`Trade-in est. ${formatMoney(market.tradeIn)} · Retail ${formatMoney(market.retailLow)} – ${formatMoney(market.retailHigh)}`);
	}
	if (include.payment && payment && payment.price > 0) {
		const p = paymentBreakdown(payment);
		lines.push("");
		lines.push("PAYMENT (estimate)");
		lines.push(`Price ${formatMoney(payment.price)}`);
		lines.push(`≈ ${formatMoney(p.monthly)} / mo`);
		lines.push("Not a lender quote — confirm in RvCAL with ZIP tax.");
	}
	if (include.lifestyle) {
		lines.push("");
		lines.push("LIFESTYLE");
	}
	if (include.strengths) {
		const clean = (opts.strengths ?? kitStrengths(r, include.payment ? payment : void 0)).map((s) => s.trim()).filter(Boolean);
		if (clean.length) {
			lines.push("");
			lines.push("STRENGTHS");
			for (const item of clean) lines.push(`• ${item}`);
		}
	}
	if (include.specs) {
		const groups = brochureSpecGroups(r);
		if (groups.length) for (const g of groups) {
			lines.push("");
			lines.push(g.title);
			for (const row of g.rows) lines.push(`${row.label}: ${row.value}`);
		}
	}
	lines.push("");
	lines.push("—");
	lines.push("Prepared in RvFOX Powered By SpaceX. Confirm door sticker, PPI, and lender.");
	return lines.join("\n");
}
function buildSuitePitch() {
	const host = resolveShareHost();
	const lines = [
		"RvFOX Pro — Know before you buy.",
		"",
		"Specs, market, NHTSA, payments, tow match, trips, and Grok — in one suite.",
		"Send a coach kit from RvSHARE: full brochure specs, payment strengths, lifestyle, and the report."
	];
	if (host) lines.push("", `https://${host}`);
	return lines.join("\n");
}
async function fetchShareImage(url, filename) {
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const blob = await res.blob();
		return new File([blob], filename, { type: blob.type || "image/jpeg" });
	} catch {
		return null;
	}
}
async function shareOrCopy(opts) {
	const nav = navigator;
	try {
		if (typeof nav.share === "function") {
			const data = {
				title: opts.title,
				text: opts.text
			};
			if (opts.files?.length) data.files = opts.files;
			if (!nav.canShare || nav.canShare(data)) {
				await nav.share(data);
				return "shared";
			}
			if (opts.files?.length) {
				const textOnly = {
					title: opts.title,
					text: opts.text
				};
				if (!nav.canShare || nav.canShare(textOnly)) {
					await nav.share(textOnly);
					return "shared";
				}
			}
		}
	} catch (e) {
		if (e instanceof Error && /Abort|cancel/i.test(e.message)) return "cancelled";
	}
	return copyKit(opts.text);
}
async function copyKit(text) {
	try {
		await navigator.clipboard.writeText(text);
		return "copied";
	} catch {
		try {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.setAttribute("readonly", "");
			ta.style.position = "fixed";
			ta.style.left = "-9999px";
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand("copy");
			ta.remove();
			return ok ? "copied" : "failed";
		} catch {
			return "failed";
		}
	}
}
function sampleCoach() {
	const spec = getSpec("Newmar", "Essex");
	if (!spec) return null;
	return {
		year: "2024",
		make: "Newmar",
		model: "Essex",
		floorplan: "4551",
		data: spec
	};
}
function parseMoney(raw) {
	const n = Number(String(raw).replace(/[^\d.]/g, ""));
	if (!Number.isFinite(n) || n < 0) return 0;
	return Math.round(n);
}
function MoneyField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-[9px] font-bold tracking-wide text-white/70",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			"aria-label": label,
			inputMode: "numeric",
			value: value ? value.toLocaleString("en-US") : "",
			onChange: (e) => onChange(parseMoney(e.target.value)),
			className: "glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2.5 py-2.5 text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]"
		})]
	});
}
function NativeSelect({ "aria-label": ariaLabel, value, options, onChange, parse }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			"aria-label": ariaLabel,
			value: String(value),
			onChange: (e) => onChange(parse(e.target.value)),
			className: "glass-field min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] px-2 py-2.5 pr-7 text-center text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]",
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: String(o.value),
				children: o.label
			}, String(o.value)))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			className: "pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-sky-200",
			"aria-hidden": true
		})]
	});
}
var INCLUDE_CHIPS = [
	{
		id: "market",
		label: "Market"
	},
	{
		id: "payment",
		label: "Payment"
	},
	{
		id: "lifestyle",
		label: "Lifestyle"
	},
	{
		id: "strengths",
		label: "Strengths"
	},
	{
		id: "specs",
		label: "Specs"
	}
];
function RvShareApp({ active = true, onNavigate, onOpenGrok }) {
	const nav = useShellNavOptional();
	const [saved, setSaved] = (0, import_react.useState)([]);
	const [selectedKey, setSelectedKey] = (0, import_react.useState)(null);
	const [usingSample, setUsingSample] = (0, import_react.useState)(false);
	const [include, setInclude] = (0, import_react.useState)(DEFAULT_SHARE_INCLUDE);
	const [payment, setPayment] = (0, import_react.useState)({
		price: 15e4,
		downPct: 10,
		termMonths: 144,
		apr: defaultAprForTerm(144)
	});
	const [marketEdit, setMarketEdit] = (0, import_react.useState)({
		tradeIn: 0,
		retailLow: 0,
		retailHigh: 0,
		msrpLo: 0,
		msrpHi: 0
	});
	const [status, setStatus] = (0, import_react.useState)(null);
	const [strengthDraft, setStrengthDraft] = (0, import_react.useState)([]);
	const [strengthsLocked, setStrengthsLocked] = (0, import_react.useState)(false);
	const reloadSaved = (0, import_react.useCallback)(() => {
		setSaved(loadSavedUnits());
	}, []);
	(0, import_react.useEffect)(() => {
		reloadSaved();
		const onChange = () => reloadSaved();
		window.addEventListener(SAVED_UNITS_EVENT, onChange);
		window.addEventListener("storage", onChange);
		window.addEventListener("focus", onChange);
		return () => {
			window.removeEventListener(SAVED_UNITS_EVENT, onChange);
			window.removeEventListener("storage", onChange);
			window.removeEventListener("focus", onChange);
		};
	}, [reloadSaved]);
	(0, import_react.useEffect)(() => {
		if (active) reloadSaved();
	}, [active, reloadSaved]);
	const sample = (0, import_react.useMemo)(() => sampleCoach(), []);
	(0, import_react.useEffect)(() => {
		if (usingSample) return;
		if (saved.length === 0) {
			setSelectedKey(null);
			return;
		}
		setSelectedKey((prev) => {
			if (prev && saved.some((r) => compareSelectionKey(r) === prev)) return prev;
			return compareSelectionKey(saved[0]);
		});
	}, [saved, usingSample]);
	const selected = (0, import_react.useMemo)(() => {
		if (usingSample) return sample;
		if (!selectedKey) return saved[0] ?? null;
		return saved.find((r) => compareSelectionKey(r) === selectedKey) ?? saved[0] ?? null;
	}, [
		saved,
		selectedKey,
		usingSample,
		sample
	]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		setPayment(defaultPaymentFor(selected));
		setMarketEdit(defaultMarketFor(selected));
		setStrengthsLocked(false);
	}, [selected]);
	(0, import_react.useEffect)(() => {
		if (!selected || strengthsLocked) return;
		setStrengthDraft(kitStrengths(selected, include.payment ? payment : void 0));
	}, [
		selected,
		include.payment,
		payment,
		strengthsLocked
	]);
	const priceOptions = (0, import_react.useMemo)(() => {
		const mid = Math.round((marketEdit.retailLow + marketEdit.retailHigh) / 2);
		const uniq = /* @__PURE__ */ new Map();
		if (marketEdit.tradeIn) uniq.set(marketEdit.tradeIn, `Trade ${formatMoney(marketEdit.tradeIn)}`);
		if (marketEdit.retailLow) uniq.set(marketEdit.retailLow, `Low ${formatMoney(marketEdit.retailLow)}`);
		if (mid) uniq.set(mid, `Mid ${formatMoney(mid)}`);
		if (marketEdit.retailHigh) uniq.set(marketEdit.retailHigh, `Ask ${formatMoney(marketEdit.retailHigh)}`);
		if (marketEdit.msrpHi) uniq.set(marketEdit.msrpHi, `MSRP ${formatMoney(marketEdit.msrpHi)}`);
		return [...uniq.entries()].map(([value, label]) => ({
			value,
			label
		}));
	}, [marketEdit]);
	const kitText = (0, import_react.useMemo)(() => {
		if (!selected) return "";
		return buildCoachKit({
			result: selected,
			include,
			payment,
			market: marketEdit,
			strengths: strengthDraft
		});
	}, [
		selected,
		include,
		payment,
		marketEdit,
		strengthDraft
	]);
	const loan = (0, import_react.useMemo)(() => paymentBreakdown(payment), [payment]);
	const specGroups = (0, import_react.useMemo)(() => selected ? brochureSpecGroups(selected) : [], [selected]);
	const flash = (msg) => {
		setStatus(msg);
		window.setTimeout(() => setStatus(null), 2200);
	};
	const sendKit = async () => {
		if (!selected || !kitText) return;
		hapticLight();
		const files = [];
		if (include.lifestyle) {
			const img = await fetchShareImage(lifestyleImageFor(selected.data.type, selected.data.fuelType, selected.data.chassis), `${coachTitle(selected).replace(/[^\w.-]+/g, "_")}-lifestyle.jpg`);
			if (img) files.push(img);
		}
		const out = await shareOrCopy({
			title: coachTitle(selected),
			text: kitText,
			files: files.length ? files : void 0
		});
		if (out === "shared") {
			hapticSuccess();
			flash("Sent");
		} else if (out === "copied") {
			hapticSuccess();
			flash("Copied");
		} else if (out === "cancelled") flash("Cancelled");
		else flash("Couldn’t share");
	};
	const copyOnly = async () => {
		if (!kitText) return;
		hapticLight();
		if (await copyKit(kitText) === "copied") {
			hapticSuccess();
			flash("Copied");
		} else flash("Couldn’t copy");
	};
	const sendSuite = async () => {
		hapticLight();
		const out = await shareOrCopy({
			title: "RvFOX Pro",
			text: buildSuitePitch()
		});
		if (out === "shared") {
			hapticSuccess();
			flash("Suite sent");
		} else if (out === "copied") {
			hapticSuccess();
			flash("Suite copied");
		} else if (out !== "cancelled") flash("Couldn’t share");
	};
	const pickUnit = (r, samplePick = false) => {
		hapticLight();
		setUsingSample(samplePick);
		setSelectedKey(compareSelectionKey(r));
	};
	const goFacts = () => onNavigate?.("rvfax") ?? nav?.setTab("rvfax");
	const goCal = () => {
		if (selected && payment.price) nav?.openCalWithPrice(payment.price, coachTitle(selected));
		else onNavigate?.("rvcal") ?? nav?.setTab("rvcal");
	};
	const goGrok = () => {
		if (!selected) {
			onNavigate?.("rvgrok") ?? nav?.setTab("rvgrok");
			return;
		}
		onOpenGrok?.(`Write a buyer-facing lifestyle pitch and talking points for the ${coachTitle(selected)} — who it fits, weekend vs full-time, and why this floorplan.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitePage, {
		tab: "rvshare",
		onPullReset: reloadSaved,
		pullLabel: "Release to refresh saved units",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-lg space-y-4 px-3 pb-12 pt-3 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige-gold relative overflow-hidden rounded-[1.25rem] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold tracking-[0.16em] text-amber",
							children: "SEND KIT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-[17px] font-bold leading-snug text-white",
							children: "Full brochure specs, then the calculator for strengths"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] leading-relaxed text-white/90",
							children: "Year-true powertrain, weights, tanks, and living data from Facts — plus a payment calculator that writes talking-point strengths into the kit."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-amber/40 bg-amber/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4 text-amber" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between px-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-3.5" }), "SAVED UNITS"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold text-white/70",
						children: saved.length > 0 ? `${saved.length}` : "None yet"
					})]
				}), saved.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-prestige space-y-3 rounded-[1.25rem] p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] leading-relaxed text-white",
						children: "Heart a coach in Facts, then it lands here for the desk or the buyer."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: goFacts,
							className: "min-h-[44px] rounded-full bg-blue px-4 py-2.5 text-[12px] font-bold text-white",
							children: "Open Facts"
						}), sample ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => pickUnit(sample, true),
							className: "min-h-[44px] rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[12px] font-bold text-white",
							children: "Try a sample kit"
						}) : null]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: saved.map((r) => {
						const key = compareSelectionKey(r);
						const on = !usingSample && selectedKey === key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => pickUnit(r),
							className: cn("glass-prestige flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left active:scale-[0.99]", on && "border-sky-300/50 ring-1 ring-sky-300/30"),
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
									className: "text-[11px] text-white/80",
									children: r.floorplan || r.data.type
								})]
							}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-sky-200" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4 shrink-0 text-white/50" })]
						}, key);
					})
				})] }),
				selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
						children: usingSample ? "SAMPLE KIT" : "THIS KIT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "glass-prestige overflow-hidden rounded-[var(--radius-2xl)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-[16/9] overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: lifestyleImageFor(selected.data.type, selected.data.fuelType, selected.data.chassis),
									alt: `${selected.data.type} lifestyle`,
									className: "size-full object-cover object-center",
									crossOrigin: "anonymous"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" }),
								include.lifestyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-sky-100",
									children: "LIFESTYLE"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute bottom-3 left-3 right-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[12px] font-semibold text-sky-200",
											children: [
												selected.year,
												" · ",
												selected.data.type
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
											className: "text-[20px] font-bold leading-tight text-white",
											children: [
												selected.make,
												" ",
												selected.model
											]
										}),
										selected.floorplan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[12px] text-white/85",
											children: ["Floorplan ", selected.floorplan]
										}) : null
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: INCLUDE_CHIPS.map((chip) => {
										const on = include[chip.id];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setInclude((prev) => ({
													...prev,
													[chip.id]: !prev[chip.id]
												}));
											},
											className: cn("min-h-[36px] rounded-full border px-3 text-[11px] font-bold tracking-wide", on ? "border-sky-300/40 bg-sky-400/15 text-sky-50" : "border-white/20 bg-white/5 text-white/55"),
											children: chip.label
										}, chip.id);
									})
								}),
								include.market ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-bold tracking-[0.16em] text-white/70",
										children: "MARKET — EDITABLE"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
												label: "TRADE-IN EST.",
												value: marketEdit.tradeIn,
												onChange: (tradeIn) => setMarketEdit((m) => ({
													...m,
													tradeIn
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
												label: "RETAIL LOW",
												value: marketEdit.retailLow,
												onChange: (retailLow) => setMarketEdit((m) => ({
													...m,
													retailLow
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
												label: "RETAIL HIGH",
												value: marketEdit.retailHigh,
												onChange: (retailHigh) => setMarketEdit((m) => ({
													...m,
													retailHigh
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
												label: "MSRP LOW",
												value: marketEdit.msrpLo,
												onChange: (msrpLo) => setMarketEdit((m) => ({
													...m,
													msrpLo
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
												label: "MSRP HIGH",
												value: marketEdit.msrpHi,
												onChange: (msrpHi) => setMarketEdit((m) => ({
													...m,
													msrpHi
												}))
											})
										]
									})]
								}) : null,
								include.payment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] font-bold tracking-[0.16em] text-white/70",
											children: "PAYMENT — PRICE IS EDITABLE"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
											label: "PRICE",
											value: payment.price,
											onChange: (price) => setPayment((p) => ({
												...p,
												price
											}))
										}),
										priceOptions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1.5",
											children: priceOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setPayment((p) => ({
													...p,
													price: o.value
												})),
												className: cn("min-h-[32px] rounded-full border px-2.5 text-[10px] font-bold", payment.price === o.value ? "border-sky-300/40 bg-sky-400/15 text-sky-50" : "border-white/20 bg-white/5 text-white/70"),
												children: o.label
											}, o.value))
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mb-1 block text-[9px] font-bold tracking-wide text-white/70",
														children: "DOWN"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
														"aria-label": "Down payment percent",
														value: payment.downPct,
														options: DOWN_PRESETS.map((n) => ({
															value: n,
															label: `${n}%`
														})),
														parse: (raw) => Number(raw),
														onChange: (downPct) => setPayment((p) => ({
															...p,
															downPct
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mb-1 block text-[9px] font-bold tracking-wide text-white/70",
														children: "TERM"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
														"aria-label": "Loan term",
														value: payment.termMonths,
														options: TERM_PRESETS.map((t) => ({
															value: t.months,
															label: t.label
														})),
														parse: (raw) => Number(raw),
														onChange: (termMonths) => setPayment((p) => ({
															...p,
															termMonths,
															apr: defaultAprForTerm(termMonths)
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col justify-end rounded-[var(--radius-md)] border border-white/15 bg-white/5 px-2 py-2 text-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[9px] font-bold tracking-wide text-white/70",
														children: "EST. / MO"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[15px] font-black tabular-nums text-sky-100",
														children: formatMoney(loan.monthly)
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-2 gap-2",
											children: [["Down $", formatMoney(loan.down)], ["Financed", formatMoney(loan.financed)]].map(([label, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-2.5 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[9px] font-bold tracking-wide text-white/55",
													children: label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-0.5 text-[13px] font-bold tabular-nums text-white",
													children: val
												})]
											}, label))
										})
									]
								}) : null,
								include.strengths ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] font-bold tracking-[0.16em] text-white/70",
											children: "STRENGTHS — EDITABLE"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [strengthsLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setStrengthsLocked(false),
												className: "text-[10px] font-bold tracking-wide text-sky-200",
												children: "Reset"
											}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													setStrengthsLocked(true);
													setStrengthDraft((prev) => [...prev, ""]);
												},
												className: "inline-flex min-h-[32px] items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 text-[10px] font-bold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), "Add"]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-1.5",
										children: strengthDraft.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"aria-label": `Strength ${i + 1}`,
												value: s,
												onChange: (e) => {
													const v = e.target.value;
													setStrengthsLocked(true);
													setStrengthDraft((prev) => prev.map((row, idx) => idx === i ? v : row));
												},
												className: "glass-field min-h-11 flex-1 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] font-semibold leading-snug text-white outline-none"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": `Remove strength ${i + 1}`,
												onClick: () => {
													setStrengthsLocked(true);
													setStrengthDraft((prev) => prev.filter((_, idx) => idx !== i));
												},
												className: "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
											})]
										}, `str-${i}`))
									})]
								}) : null,
								include.specs && specGroups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-bold tracking-[0.16em] text-white/70",
										children: "BROCHURE SPECS"
									}), specGroups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1 text-[10px] font-bold tracking-[0.14em] text-sky-200/90",
										children: g.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
										className: "grid grid-cols-2 gap-x-3 gap-y-1.5",
										children: g.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-[9px] font-bold tracking-wide text-white/50",
												children: row.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "truncate text-[12px] font-semibold text-white",
												children: row.value
											})]
										}, `${g.title}-${row.label}`))
									})] }, g.title))]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/85",
									children: kitText
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => void sendKit(),
										className: "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-blue px-4 py-2.5 text-[13px] font-bold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share kit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => void copyOnly(),
										className: "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: goFacts,
											className: "inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), "Facts"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: goCal,
											className: "inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-3.5" }), "Finance"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: goGrok,
											className: "inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), "Ask Grok"]
										})
									]
								})
							]
						})]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige overflow-hidden rounded-[1.25rem] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-white/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-sky-200" }), "SHARE THE SUITE"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-[15px] font-bold text-white",
							children: "Send RvFOX Pro itself"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] leading-relaxed text-white/85",
							children: "A short pitch for a spouse, a buyer, or the next person on the lot."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void sendSuite(),
							className: "mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-sky-300/35 bg-sky-400/15 px-4 py-2.5 text-[12px] font-bold text-sky-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share suite"]
						})
					]
				}),
				status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pb-1 text-center text-[12px] font-bold tracking-[0.14em] text-sky-100",
					role: "status",
					children: status
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pb-1 text-center text-[12px] tracking-[0.14em] text-white/55",
					children: "NATIVE SHARE · COPY · SAVED COACHES"
				})
			]
		})
	});
}
//#endregion
export { RvShareApp };
