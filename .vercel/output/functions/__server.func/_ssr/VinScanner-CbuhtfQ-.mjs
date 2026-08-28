import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { U as LoaderCircle, _t as Camera, g as SwitchCamera, t as X } from "../_libs/lucide-react.mjs";
import { p as cn } from "./routes-DxgqAedY.mjs";
import { a as normalizeVin$1, i as isValidVinFormat } from "./router-B7uJEg2g.mjs";
import { n as BarcodeFormat_default, r as DecodeHintType_default, t as BrowserMultiFormatReader } from "../_libs/@zxing/browser+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VinScanner-CbuhtfQ-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BarcodeFormat = BarcodeFormat_default;
var DecodeHintType = DecodeHintType_default;
/**
* Full-screen VIN barcode scanner.
* iOS / Capacitor: prefer facingMode environment + decodeFromStream
* (device labels are often empty on iPhone, which broke rear-camera pick).
*/
function sanitizeVinCandidate(raw) {
	return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/O/g, "0").replace(/I/g, "1").replace(/Q/g, "0");
}
/** Pull a 17-char VIN from barcode text (window sticker / door / title). */
function extractVin(raw) {
	if (!raw?.trim()) return null;
	const cleaned = sanitizeVinCandidate(raw);
	if (cleaned.length === 17 && isValidVinFormat(cleaned)) return cleaned;
	const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
	for (let i = 0; i <= upper.length - 17; i++) {
		const slice = upper.slice(i, i + 17);
		if (isValidVinFormat(slice)) return slice;
	}
	for (let i = 0; i <= cleaned.length - 17; i++) {
		const slice = cleaned.slice(i, i + 17);
		if (isValidVinFormat(slice)) return slice;
	}
	const spaced = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/O/g, "0").replace(/I/g, "1").replace(/Q/g, "0");
	if (spaced.length === 17 && isValidVinFormat(spaced)) return spaced;
	const n = normalizeVin$1(raw);
	return isValidVinFormat(n) ? n : null;
}
function buildReader() {
	const hints = /* @__PURE__ */ new Map();
	hints.set(DecodeHintType.POSSIBLE_FORMATS, [
		BarcodeFormat.CODE_39,
		BarcodeFormat.CODE_128,
		BarcodeFormat.CODE_93,
		BarcodeFormat.ITF,
		BarcodeFormat.CODABAR,
		BarcodeFormat.PDF_417,
		BarcodeFormat.QR_CODE,
		BarcodeFormat.DATA_MATRIX,
		BarcodeFormat.AZTEC,
		BarcodeFormat.EAN_13,
		BarcodeFormat.EAN_8,
		BarcodeFormat.UPC_A,
		BarcodeFormat.UPC_E
	]);
	hints.set(DecodeHintType.TRY_HARDER, true);
	hints.set(DecodeHintType.PURE_BARCODE, false);
	return new BrowserMultiFormatReader(hints, {
		delayBetweenScanAttempts: 80,
		delayBetweenScanSuccess: 600
	});
}
async function openCameraStream(preferBack) {
	const tries = preferBack ? [
		{
			audio: false,
			video: {
				facingMode: { ideal: "environment" },
				width: { ideal: 1920 },
				height: { ideal: 1080 }
			}
		},
		{
			audio: false,
			video: {
				facingMode: "environment",
				width: { ideal: 1280 },
				height: { ideal: 720 }
			}
		},
		{
			audio: false,
			video: true
		}
	] : [{
		audio: false,
		video: {
			facingMode: { ideal: "user" },
			width: { ideal: 1280 },
			height: { ideal: 720 }
		}
	}, {
		audio: false,
		video: true
	}];
	let lastErr;
	for (const c of tries) try {
		return await navigator.mediaDevices.getUserMedia(c);
	} catch (e) {
		lastErr = e;
	}
	throw lastErr instanceof Error ? lastErr : /* @__PURE__ */ new Error("Could not open camera");
}
function VinScanner({ open, onClose, onDetected }) {
	const videoRef = (0, import_react.useRef)(null);
	const controlsRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const readerRef = (0, import_react.useRef)(null);
	const handledRef = (0, import_react.useRef)(false);
	const [status, setStatus] = (0, import_react.useState)("starting");
	const [error, setError] = (0, import_react.useState)(null);
	const [hint, setHint] = (0, import_react.useState)(null);
	const [torchOn, setTorchOn] = (0, import_react.useState)(false);
	const [torchAvailable, setTorchAvailable] = (0, import_react.useState)(false);
	const [preferBack, setPreferBack] = (0, import_react.useState)(true);
	const [flipKey, setFlipKey] = (0, import_react.useState)(0);
	const stop = (0, import_react.useCallback)(() => {
		try {
			controlsRef.current?.stop();
		} catch {}
		controlsRef.current = null;
		readerRef.current = null;
		const stream = streamRef.current;
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			streamRef.current = null;
		}
		const v = videoRef.current;
		if (v) v.srcObject = null;
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) {
			stop();
			handledRef.current = false;
			setStatus("starting");
			setError(null);
			setHint(null);
			setTorchOn(false);
			setTorchAvailable(false);
			return;
		}
		let cancelled = false;
		handledRef.current = false;
		const start = async () => {
			setStatus("starting");
			setError(null);
			setHint(null);
			if (!navigator.mediaDevices?.getUserMedia) {
				setStatus("error");
				setError("Camera not available in this browser. Type the VIN manually instead.");
				return;
			}
			try {
				await new Promise((r) => requestAnimationFrame(() => r(null)));
				if (cancelled) return;
				const video = videoRef.current;
				if (!video) {
					setStatus("error");
					setError("Camera view not ready. Close and try Scan again.");
					return;
				}
				const stream = await openCameraStream(preferBack);
				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}
				streamRef.current = stream;
				video.srcObject = stream;
				video.setAttribute("playsinline", "true");
				video.muted = true;
				try {
					await video.play();
				} catch {}
				try {
					const track = stream.getVideoTracks()[0];
					const caps = track?.getCapabilities?.();
					const adv = {};
					if (caps && "focusMode" in caps) {
						if (caps.focusMode?.includes?.("continuous")) adv.focusMode = "continuous";
					}
					if (caps && "exposureMode" in caps) {
						if (caps.exposureMode?.includes?.("continuous")) adv.exposureMode = "continuous";
					}
					if (Object.keys(adv).length) await track.applyConstraints({ advanced: [adv] });
					setTorchAvailable(Boolean(caps?.torch));
				} catch {
					setTorchAvailable(false);
				}
				const reader = buildReader();
				readerRef.current = reader;
				const controls = await reader.decodeFromStream(stream, video, (result, err) => {
					if (cancelled || handledRef.current) return;
					if (result) {
						const text = result.getText();
						const vin = extractVin(text);
						if (vin) {
							handledRef.current = true;
							try {
								if (navigator.vibrate) navigator.vibrate(40);
							} catch {}
							setHint(`VIN locked: ${vin}`);
							stop();
							onDetected(vin);
							onClose();
							return;
						}
						const preview = text.replace(/\s+/g, " ").slice(0, 28);
						setHint(preview ? `Barcode seen (“${preview}${text.length > 28 ? "…" : ""}”) — not a 17-char VIN yet. Try door jamb / window sticker.` : "Barcode seen — hold steady on the VIN line");
						return;
					}
					if (err && !/NotFoundException|No MultiFormat/i.test(String(err))) {}
				});
				if (cancelled) {
					controls.stop();
					return;
				}
				controlsRef.current = controls;
				setStatus("live");
				setHint("Point at Code 39 / Code 128 VIN barcode · hold steady");
			} catch (e) {
				if (cancelled) return;
				setStatus("error");
				const msg = e instanceof Error ? e.message : String(e);
				if (/Permission|NotAllowed|denied/i.test(msg)) setError("Camera permission denied. Enable camera for RVFAX in Settings, then try Scan again.");
				else if (/NotFound|DevicesNotFound/i.test(msg)) setError("No camera found on this device.");
				else setError(`Could not start camera: ${msg}. You can still type the VIN.`);
			}
		};
		start();
		return () => {
			cancelled = true;
			stop();
		};
	}, [
		open,
		onClose,
		onDetected,
		stop,
		preferBack,
		flipKey
	]);
	const toggleTorch = async () => {
		const track = streamRef.current?.getVideoTracks()?.[0];
		if (!track) return;
		try {
			const next = !torchOn;
			await track.applyConstraints({ advanced: [{ torch: next }] });
			setTorchOn(next);
		} catch {
			setTorchAvailable(false);
		}
	};
	const flipCamera = () => {
		stop();
		setPreferBack((v) => !v);
		setFlipKey((k) => k + 1);
	};
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80] flex flex-col bg-black",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-20 flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						stop();
						onClose();
					},
					className: "flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white",
					"aria-label": "Close scanner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[15px] font-bold text-white",
						children: "Scan VIN barcode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-white/65",
						children: "Car or RV · door jamb · window sticker · title"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: flipCamera,
					className: "flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white",
					"aria-label": "Flip camera",
					title: "Flip camera",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-4" })
				}),
				torchAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void toggleTorch(),
					className: cn("rounded-full border px-3 py-2 text-[11px] font-bold", torchOn ? "border-amber-300/50 bg-amber-400/25 text-amber-100" : "border-white/20 bg-black/50 text-white"),
					children: torchOn ? "Light on" : "Light"
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: "absolute inset-0 size-full object-cover",
					playsInline: true,
					muted: true,
					autoPlay: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-[22%] w-[92%] max-w-lg rounded-2xl border-2 border-sky-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-sky-400/90" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-0.5 -top-0.5 size-5 rounded-tl-xl border-l-4 border-t-4 border-white" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-0.5 -top-0.5 size-5 rounded-tr-xl border-r-4 border-t-4 border-white" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-0.5 -left-0.5 size-5 rounded-bl-xl border-b-4 border-l-4 border-white" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-0.5 -right-0.5 size-5 rounded-br-xl border-b-4 border-r-4 border-white" })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 z-10 space-y-2 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10",
					children: [
						status === "starting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center justify-center gap-2 text-[13px] font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-sky-300" }), "Starting camera…"]
						}) : null,
						status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center justify-center gap-2 text-[13px] font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4 text-sky-300" }), "Scanning… fill the blue frame with the barcode"]
						}) : null,
						hint && status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-center text-[11px] leading-snug text-sky-100",
							children: hint
						}) : null,
						status === "error" && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-ruby/40 bg-ruby/20 px-3 py-2.5 text-center text-[12px] text-white",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-[11px] text-white/55",
							children: "Tip: use the long barcode on the window sticker or door label — not the small QR unless it encodes the VIN."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								stop();
								onClose();
							},
							className: "w-full rounded-full border border-white/20 bg-white/10 py-3 text-[13px] font-bold text-white",
							children: "Type VIN instead"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { VinScanner };
