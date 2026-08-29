import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as GitCompare, C as Send, I as MessageSquarePlus, P as Mic, W as LoaderCircle, X as Image, Y as Info, Z as History, _ as Sunrise, _t as ChevronDown, a as Video, b as Sparkles, bt as Camera, c as Truck, d as TrendingUp, f as Trash2, ft as CircleCheck, g as SwitchCamera, i as Volume2, j as Plus, k as Radio, m as ThumbsDown, mt as ChevronUp, n as Wrench, nt as Fish, o as Users, p as ThumbsUp, r as Wallet, rt as FileText, st as Droplets, t as X, u as TriangleAlert, ut as Compass, vt as Check, w as Search, y as Square } from "../_libs/lucide-react.mjs";
import { d as formatRelativeTime, f as formatTime, p as uid, r as useKeyboardInset, u as cn } from "./routes-JaTqMLOZ.mjs";
import { i as SuiteBackdrop, r as ScrollSuiteHeader, s as usePullToReset, t as PullResetHint } from "./SuitePage-zyyPjbxm.mjs";
import { S as TOOL_META, x as HISTORY_KEY, y as AGENT_MODE_KEY } from "./router-Bh7U7VPB.mjs";
import { a as VOICE_SPEED_KEY, c as XAI_REALTIME_URL, d as fetchEphemeralToken, f as floatTo16BitPCM, g as stopBrowserTts, h as speakWithBrowserTts, i as VOICE_MODE_KEY, l as base64ToArrayBuffer, m as resampleFloat32, n as PCM_SAMPLE_RATE, o as VOICE_STORAGE_KEY, p as getSpeechRecognitionCtor, r as RV_VOICE_INSTRUCTIONS, s as VoicePanel, t as LIVE_VOICE_KEY, u as createPushToTalkRecognition } from "./VoicePanel-DJdcr8PT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvGrokApp-DlEapj6U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Drop heavy base64 so localStorage stays under quota */
function slimMessages(messages) {
	return messages.map((m) => {
		const generatedImages = (m.generatedImages ?? []).filter((u) => /^https?:\/\//i.test(u));
		const { imageDataUrl, generatedImages: _drop, ...rest } = m;
		const next = {
			...rest,
			...generatedImages.length ? { generatedImages } : {}
		};
		if (imageDataUrl) next.content = m.content?.includes("[Photo]") ? m.content : m.content ? `${m.content}\n[Photo was attached]` : "[Photo was attached]";
		return next;
	});
}
function reviveMessages(messages) {
	return messages.map((m) => ({
		...m,
		timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)
	}));
}
function loadSessions() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		return JSON.parse(raw).map((s) => ({
			...s,
			messages: reviveMessages(s.messages ?? [])
		}));
	} catch {
		return [];
	}
}
function saveSessions(sessions) {
	if (typeof window === "undefined") return;
	try {
		const slim = sessions.slice(0, 40).map((s) => ({
			...s,
			messages: slimMessages(s.messages ?? [])
		}));
		localStorage.setItem(HISTORY_KEY, JSON.stringify(slim));
	} catch {
		try {
			localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 10).map((s) => ({
				...s,
				messages: slimMessages(s.messages ?? []).slice(-12)
			}))));
		} catch {}
	}
}
function upsertSession(sessions, messages, sessionId) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const firstUser = messages.find((m) => m.role === "user");
	const title = firstUser?.content?.slice(0, 60) || (firstUser?.imageDataUrl ? "Photo question" : "New chat");
	if (sessionId) {
		const next = sessions.map((s) => s.id === sessionId ? {
			...s,
			title,
			updated_at: now,
			messages: slimMessages(messages)
		} : s);
		saveSessions(next);
		return {
			sessions: next,
			id: sessionId
		};
	}
	const id = `s-${Date.now()}`;
	const next = [{
		id,
		title,
		created_at: now,
		updated_at: now,
		messages: slimMessages(messages)
	}, ...sessions];
	saveSessions(next);
	return {
		sessions: next,
		id
	};
}
function deleteSession(sessions, id) {
	const next = sessions.filter((s) => s.id !== id);
	saveSessions(next);
	return next;
}
/**
* Parse SSE-style lines from either:
* - OpenAI/xAI chat completions stream: { choices: [{ delta: { content } }] }
* - Agent mode: { type: 'step' | 'delta' | 'agent_start' | 'agent_error', ... }
*/
function processSseLine(line, agentMode, handlers) {
	if (!line.startsWith("data: ")) return;
	const raw = line.slice(6).trim();
	if (!raw || raw === "[DONE]") return;
	try {
		const parsed = JSON.parse(raw);
		if (parsed.type === "step") {
			handlers.onStep({
				step: parsed.step,
				tool: parsed.tool,
				input: parsed.input ?? {},
				result: parsed.result,
				status: parsed.status
			});
			return;
		}
		if (parsed.type === "delta") {
			const delta = parsed.content ?? "";
			if (delta) handlers.onDelta(delta);
			return;
		}
		if (parsed.type === "agent_start" && parsed.model) {
			handlers.onModel?.(parsed.model);
			return;
		}
		if (parsed.type === "agent_error") {
			handlers.onError?.(parsed.message ?? "Agent error");
			return;
		}
		if (parsed.type === "image") {
			const url = typeof parsed.url === "string" ? parsed.url : typeof parsed.b64 === "string" ? `data:${parsed.mime || "image/jpeg"};base64,${String(parsed.b64).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "")}` : "";
			if (url) handlers.onImage?.(url);
			return;
		}
		const delta = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? parsed.content ?? "";
		if (delta) handlers.onDelta(String(delta));
	} catch {}
}
async function consumeSseStream(response, agentMode, handlers, signal) {
	const modelUsed = response.headers.get("X-Model-Used");
	if (modelUsed) handlers.onModel?.(modelUsed);
	const upstream = response.headers.get("X-Upstream");
	if (upstream) handlers.onUpstream?.(upstream);
	const reader = response.body?.getReader();
	if (!reader) {
		const text = await response.text();
		for (const line of text.split("\n")) processSseLine(line, agentMode, handlers);
		return;
	}
	const decoder = new TextDecoder();
	let buffer = "";
	while (true) {
		if (signal?.aborted) {
			reader.cancel().catch(() => {});
			break;
		}
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) processSseLine(line, agentMode, handlers);
	}
	if (buffer) processSseLine(buffer, agentMode, handlers);
}
/**
* Call the app's API proxy (which talks to Cloudflare Worker / xAI / demo).
* Messages may include vision parts (text + image_url).
*/
async function streamChat(opts) {
	const response = await fetch("/api/rvgrok", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			messages: opts.messages,
			agentMode: opts.agentMode,
			feedbackContext: opts.feedbackContext || void 0
		}),
		signal: opts.signal
	});
	if (!response.ok) {
		let detail = `HTTP ${response.status}`;
		try {
			detail = (await response.json()).error || detail;
		} catch {}
		throw new Error(detail);
	}
	await consumeSseStream(response, opts.agentMode, opts.handlers, opts.signal);
}
/**
* Browser client for xAI Grok Voice Agent (Realtime WebSocket).
* Auth: ephemeral token from Cloudflare worker → subprotocol xai-client-secret.<token>
*
* Continuous hands-free: server VAD + mic muted while Grok is speaking (echo guard).
*/
var GrokRealtimeSession = class {
	ws = null;
	mediaStream = null;
	audioCtx = null;
	processor = null;
	source = null;
	playCtx = null;
	nextPlayTime = 0;
	playSources = [];
	assistantText = "";
	closed = false;
	intentionalStop = false;
	suppressMic = false;
	finishedAssistantOnce = false;
	handlers;
	voiceId;
	rearmTimer = null;
	constructor(handlers, voiceId = "ara") {
		this.handlers = handlers;
		this.voiceId = voiceId;
	}
	get isActive() {
		return Boolean(this.ws && this.ws.readyState === WebSocket.OPEN);
	}
	async start() {
		this.closed = false;
		this.intentionalStop = false;
		this.suppressMic = false;
		this.finishedAssistantOnce = false;
		this.handlers.onStatus("connecting", "Fetching voice token…");
		const token = await fetchEphemeralToken();
		this.handlers.onStatus("connecting", "Opening Grok Voice…");
		const subprotocol = `xai-client-secret.${token}`;
		const ws = new WebSocket(XAI_REALTIME_URL, [subprotocol]);
		this.ws = ws;
		await new Promise((resolve, reject) => {
			const t = setTimeout(() => reject(/* @__PURE__ */ new Error("WebSocket connect timeout")), 15e3);
			ws.onopen = () => {
				clearTimeout(t);
				resolve();
			};
			ws.onerror = () => {
				clearTimeout(t);
				reject(/* @__PURE__ */ new Error("WebSocket failed to open"));
			};
		});
		ws.binaryType = "arraybuffer";
		const sessionUpdate = {
			type: "session.update",
			session: {
				instructions: RV_VOICE_INSTRUCTIONS,
				voice: this.voiceId,
				turn_detection: {
					type: "server_vad",
					threshold: .5,
					prefix_padding_ms: 300,
					silence_duration_ms: 700
				},
				audio: {
					input: { format: {
						type: "audio/pcm",
						rate: PCM_SAMPLE_RATE
					} },
					output: { format: {
						type: "audio/pcm",
						rate: PCM_SAMPLE_RATE
					} }
				},
				modalities: ["text", "audio"],
				input_audio_format: "pcm16",
				output_audio_format: "pcm16",
				input_audio_transcription: { model: "whisper-1" }
			}
		};
		ws.send(JSON.stringify(sessionUpdate));
		ws.onmessage = (evt) => this.handleMessage(evt);
		ws.onclose = (evt) => {
			this.cleanupMedia(false);
			if (this.intentionalStop || this.closed) {
				this.handlers.onStatus("idle");
				return;
			}
			const reason = evt.reason || `code ${evt.code}`;
			this.handlers.onStatus("idle");
			this.handlers.onDisconnected?.(reason);
		};
		ws.onerror = () => {
			if (!this.closed && !this.intentionalStop) this.handlers.onError("Realtime connection error");
		};
		await this.startMic();
		this.handlers.onStatus("listening", "Listening continuously — speak anytime");
	}
	async startMic() {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
				channelCount: 1
			},
			video: false
		});
		this.mediaStream = stream;
		const ctx = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
		this.audioCtx = ctx;
		if (ctx.state === "suspended") await ctx.resume();
		const source = ctx.createMediaStreamSource(stream);
		this.source = source;
		const processor = ctx.createScriptProcessor(4096, 1, 1);
		this.processor = processor;
		processor.onaudioprocess = (e) => {
			if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
			if (this.suppressMic) return;
			const input = e.inputBuffer.getChannelData(0);
			const resampled = resampleFloat32(input, ctx.sampleRate, PCM_SAMPLE_RATE);
			const pcm = floatTo16BitPCM(resampled);
			try {
				const b64 = arrayBufferToBase64Safe(pcm);
				this.ws.send(JSON.stringify({
					type: "input_audio_buffer.append",
					audio: b64
				}));
			} catch {
				this.ws.send(pcm);
			}
		};
		source.connect(processor);
		const mute = ctx.createGain();
		mute.gain.value = 0;
		processor.connect(mute);
		mute.connect(ctx.destination);
	}
	handleMessage(evt) {
		if (evt.data instanceof ArrayBuffer) {
			this.beginSpeaking();
			this.enqueuePcmPlayback(evt.data);
			return;
		}
		if (typeof evt.data !== "string") return;
		let msg;
		try {
			msg = JSON.parse(evt.data);
		} catch {
			return;
		}
		switch (String(msg.type || "")) {
			case "session.created":
			case "session.updated": break;
			case "input_audio_buffer.speech_started":
				this.handlers.onStatus("listening", "Hearing you…");
				break;
			case "input_audio_buffer.speech_stopped":
				this.handlers.onStatus("thinking", "Processing…");
				break;
			case "conversation.item.input_audio_transcription.completed":
			case "conversation.item.input_audio_transcription.updated": {
				const transcript = String(msg.transcript || "");
				if (transcript) this.handlers.onUserTranscript(transcript);
				break;
			}
			case "response.created":
				this.assistantText = "";
				this.finishedAssistantOnce = false;
				this.handlers.onStatus("thinking", "Grok is responding…");
				break;
			case "response.audio_transcript.delta":
			case "response.output_audio_transcript.delta": {
				const delta = String(msg.delta || "");
				if (delta) {
					this.assistantText += delta;
					this.handlers.onAssistantDelta(this.assistantText);
				}
				break;
			}
			case "response.audio_transcript.done":
			case "response.output_audio_transcript.done": {
				const t = String(msg.transcript || this.assistantText);
				this.assistantText = t;
				this.emitAssistantDone(t);
				break;
			}
			case "response.text.delta": {
				const delta = String(msg.delta || "");
				if (delta) {
					this.assistantText += delta;
					this.handlers.onAssistantDelta(this.assistantText);
				}
				break;
			}
			case "response.text.done": {
				const t = String(msg.text || this.assistantText);
				this.assistantText = t;
				this.emitAssistantDone(t);
				break;
			}
			case "response.audio.delta":
			case "response.output_audio.delta": {
				this.beginSpeaking();
				const delta = msg.delta;
				if (typeof delta === "string" && delta) this.enqueuePcmPlayback(base64ToArrayBuffer(delta));
				break;
			}
			case "response.done":
				if (this.assistantText) this.emitAssistantDone(this.assistantText);
				this.scheduleRearm();
				this.assistantText = "";
				this.finishedAssistantOnce = false;
				break;
			case "response.cancelled":
			case "response.cancel":
				this.interruptPlayback();
				this.suppressMic = false;
				this.handlers.onStatus("listening", "Interrupted — listening… speak or 📷");
				break;
			case "error": {
				const err = msg.error;
				const message = typeof err === "string" ? err : err?.message || JSON.stringify(msg).slice(0, 200);
				if (/cancel|interrupt|no active response/i.test(message)) {
					this.suppressMic = false;
					this.handlers.onStatus("listening", "Interrupted — listening… speak or 📷");
					break;
				}
				this.handlers.onError(message);
				this.handlers.onStatus("error", message);
				break;
			}
		}
	}
	emitAssistantDone(text) {
		if (this.finishedAssistantOnce) return;
		this.finishedAssistantOnce = true;
		if (text) this.handlers.onAssistantDone(text);
	}
	beginSpeaking() {
		this.suppressMic = true;
		this.handlers.onStatus("speaking", "RvGrok speaking…");
		if (this.rearmTimer) {
			clearTimeout(this.rearmTimer);
			this.rearmTimer = null;
		}
	}
	/** After Grok finishes, wait for audio queue to drain, then open mic again */
	scheduleRearm() {
		if (this.rearmTimer) clearTimeout(this.rearmTimer);
		const waitMs = (() => {
			if (!this.playCtx || this.playCtx.state === "closed") return 450;
			const remaining = Math.max(0, (this.nextPlayTime - this.playCtx.currentTime) * 1e3);
			return Math.min(Math.max(remaining + 350, 450), 12e3);
		})();
		this.handlers.onStatus("speaking", "Finishing reply…");
		this.rearmTimer = setTimeout(() => {
			this.rearmTimer = null;
			if (this.closed || this.intentionalStop) return;
			this.suppressMic = false;
			this.handlers.onStatus("listening", "Listening continuously — your turn");
		}, waitMs);
	}
	async enqueuePcmPlayback(pcm) {
		try {
			if (!this.playCtx || this.playCtx.state === "closed") {
				this.playCtx = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
				this.nextPlayTime = 0;
			}
			const ctx = this.playCtx;
			if (ctx.state === "suspended") await ctx.resume();
			const int16 = new Int16Array(pcm);
			if (int16.length === 0) return;
			const float32 = new Float32Array(int16.length);
			for (let i = 0; i < int16.length; i++) float32[i] = (int16[i] ?? 0) / 32768;
			const buffer = ctx.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
			buffer.copyToChannel(float32, 0);
			const src = ctx.createBufferSource();
			src.buffer = buffer;
			src.connect(ctx.destination);
			const now = ctx.currentTime;
			const startAt = Math.max(now + .02, this.nextPlayTime);
			src.start(startAt);
			this.nextPlayTime = startAt + buffer.duration;
			this.playSources.push(src);
			src.onended = () => {
				this.playSources = this.playSources.filter((s) => s !== src);
			};
		} catch {}
	}
	stop() {
		this.intentionalStop = true;
		this.closed = true;
		if (this.rearmTimer) {
			clearTimeout(this.rearmTimer);
			this.rearmTimer = null;
		}
		try {
			this.ws?.close();
		} catch {}
		this.ws = null;
		this.cleanupMedia(true);
		this.handlers.onStatus("idle");
	}
	/**
	* Clear partial speech + cancel in-flight response so a photo turn
	* is not mixed with leftover audio context.
	*/
	prepareForSnapshot() {
		const ws = this.ws;
		this.interruptPlayback();
		this.suppressMic = true;
		this.handlers.onStatus("thinking", "Looking at your photo…");
		if (!ws || ws.readyState !== WebSocket.OPEN) return;
		try {
			ws.send(JSON.stringify({ type: "response.cancel" }));
		} catch {}
		try {
			ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
		} catch {}
	}
	/**
	* Path B — native Realtime image (optional). Prefer vision-first inject
	* when accuracy matters — many realtime endpoints ignore image parts.
	*/
	sendSnapshot(imageDataUrl, prompt = "Look ONLY at the image I just attached. Describe exactly what is in the frame. Do not invent a different RV, floorplan, or exterior scene. If it is a control panel, screen, label, or close-up, say that first.") {
		const ws = this.ws;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		if (!imageDataUrl.startsWith("data:image/")) return false;
		this.prepareForSnapshot();
		const item = {
			type: "conversation.item.create",
			item: {
				type: "message",
				role: "user",
				content: [{
					type: "input_text",
					text: prompt
				}, {
					type: "input_image",
					image_url: imageDataUrl
				}]
			}
		};
		try {
			ws.send(JSON.stringify(item));
			ws.send(JSON.stringify({
				type: "response.create",
				response: {
					modalities: ["text", "audio"],
					instructions: "CRITICAL: Ground your answer ONLY in the attached image. Open with what object/screen/panel/vehicle part is actually visible. Never describe a different coach or exterior if the photo is a close-up panel, label, or interior detail. Short, accurate, under ~25 seconds."
				}
			}));
			return true;
		} catch {
			this.suppressMic = false;
			return false;
		}
	}
	/**
	* Inject plain text into the live session (vision-first live photo path).
	*/
	injectUserNote(text, requestResponse = true, responseInstructions) {
		const ws = this.ws;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		const t = text.trim();
		if (!t) return false;
		this.prepareForSnapshot();
		try {
			ws.send(JSON.stringify({
				type: "conversation.item.create",
				item: {
					type: "message",
					role: "user",
					content: [{
						type: "input_text",
						text: t
					}]
				}
			}));
			if (requestResponse) {
				this.suppressMic = true;
				this.handlers.onStatus("thinking", "Photo ready — responding…");
				try {
					ws.send(JSON.stringify({ type: "response.cancel" }));
				} catch {}
				ws.send(JSON.stringify({
					type: "response.create",
					response: {
						modalities: ["text", "audio"],
						instructions: responseInstructions || "Speak only about the camera photo described in the latest user message. Do not invent a different RV or scene."
					}
				}));
			}
			return true;
		} catch {
			return false;
		}
	}
	/**
	* Barge-in: stop Grok mid-sentence, clear audio queue, open mic again.
	* Does NOT end the Live Voice session. Safe to call repeatedly.
	*/
	interrupt() {
		const ws = this.ws;
		const wasLive = Boolean(ws && ws.readyState === WebSocket.OPEN);
		try {
			if (wasLive && ws) {
				ws.send(JSON.stringify({ type: "response.cancel" }));
				ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
			}
		} catch {}
		this.interruptPlayback();
		this.suppressMic = false;
		this.finishedAssistantOnce = false;
		this.assistantText = "";
		if (this.rearmTimer) {
			clearTimeout(this.rearmTimer);
			this.rearmTimer = null;
		}
		this.handlers.onStatus("listening", "Interrupted — listening… speak or 📷");
		return wasLive;
	}
	/**
	* Stop queued PCM. Keep AudioContext alive so later replies still play on iOS.
	*/
	interruptPlayback() {
		if (this.rearmTimer) {
			clearTimeout(this.rearmTimer);
			this.rearmTimer = null;
		}
		for (const src of this.playSources) {
			try {
				src.stop(0);
			} catch {}
			try {
				src.disconnect();
			} catch {}
		}
		this.playSources = [];
		if (this.playCtx && this.playCtx.state !== "closed") this.nextPlayTime = this.playCtx.currentTime;
		else this.nextPlayTime = 0;
	}
	cleanupMedia(closePlay) {
		try {
			this.processor?.disconnect();
		} catch {}
		try {
			this.source?.disconnect();
		} catch {}
		this.processor = null;
		this.source = null;
		this.mediaStream?.getTracks().forEach((t) => t.stop());
		this.mediaStream = null;
		this.audioCtx?.close();
		this.audioCtx = null;
		for (const src of this.playSources) try {
			src.stop(0);
		} catch {}
		this.playSources = [];
		if (closePlay) {
			this.playCtx?.close();
			this.playCtx = null;
			this.nextPlayTime = 0;
		}
	}
};
function arrayBufferToBase64Safe(buf) {
	const bytes = new Uint8Array(buf);
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(binary);
}
var MAX_EDGE = 1280;
var JPEG_QUALITY = .78;
/** Soft cap so chat payloads stay reasonable (~1–1.5MB data URL) */
var MAX_DATA_URL_CHARS = 16e5;
/** Resize + JPEG-compress a File/Blob into a data URL. */
async function compressImageToDataUrl(file, opts) {
	const maxEdge = opts?.maxEdge ?? MAX_EDGE;
	const quality = opts?.quality ?? JPEG_QUALITY;
	const bitmap = await createImageBitmap(file);
	try {
		let { width, height } = bitmap;
		const scale = Math.min(1, maxEdge / Math.max(width, height));
		width = Math.max(1, Math.round(width * scale));
		height = Math.max(1, Math.round(height * scale));
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas not available");
		ctx.drawImage(bitmap, 0, 0, width, height);
		let q = quality;
		let dataUrl = canvas.toDataURL("image/jpeg", q);
		while (dataUrl.length > MAX_DATA_URL_CHARS && q > .4) {
			q -= .08;
			dataUrl = canvas.toDataURL("image/jpeg", q);
		}
		if (dataUrl.length > MAX_DATA_URL_CHARS) {
			const scale2 = .7;
			canvas.width = Math.max(1, Math.round(width * scale2));
			canvas.height = Math.max(1, Math.round(height * scale2));
			ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			dataUrl = canvas.toDataURL("image/jpeg", .65);
		}
		return dataUrl;
	} finally {
		bitmap.close();
	}
}
/**
* Build OpenAI/xAI multimodal user content from text + optional image data URL.
*/
function buildUserContent(text, imageDataUrl) {
	const t = text.trim();
	if (!imageDataUrl) return t;
	const parts = [];
	if (t) parts.push({
		type: "text",
		text: t
	});
	else parts.push({
		type: "text",
		text: "Please analyze this RV photo. Identify make/model if possible, note visible condition, damage, options, and anything a buyer or owner should know."
	});
	parts.push({
		type: "image_url",
		image_url: {
			url: imageDataUrl,
			detail: "high"
		}
	});
	return parts;
}
/**
* iOS Safari often freezes ctx.drawImage(video) on the FIRST frame even
* while the <video> preview keeps playing. Paint every animation frame
* into a canvas, then JPEG that canvas when sending to Grok.
*/
function startVideoFramePump(video, canvas) {
	const ctx = canvas.getContext("2d", {
		alpha: false,
		willReadFrequently: true,
		desynchronized: true
	});
	let raf = 0;
	let live = true;
	const tick = () => {
		if (!live) return;
		const w = video.videoWidth;
		const h = video.videoHeight;
		if (ctx && w > 0 && h > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
			if (canvas.width !== w) canvas.width = w;
			if (canvas.height !== h) canvas.height = h;
			try {
				ctx.drawImage(video, 0, 0, w, h);
			} catch {}
		}
		raf = requestAnimationFrame(tick);
	};
	raf = requestAnimationFrame(tick);
	return () => {
		live = false;
		cancelAnimationFrame(raf);
	};
}
function snapshotCanvas(canvas, opts) {
	if (!canvas.width || !canvas.height) return null;
	const maxEdge = opts?.maxEdge ?? 960;
	const quality = opts?.quality ?? .72;
	const scale = Math.min(1, maxEdge / Math.max(canvas.width, canvas.height));
	const width = Math.max(1, Math.round(canvas.width * scale));
	const height = Math.max(1, Math.round(canvas.height * scale));
	const out = document.createElement("canvas");
	out.width = width;
	out.height = height;
	const ctx = out.getContext("2d");
	if (!ctx) return null;
	ctx.drawImage(canvas, 0, 0, width, height);
	return out.toDataURL("image/jpeg", quality);
}
async function grabTrackBitmap(track) {
	const IC = window.ImageCapture;
	if (!IC) return null;
	try {
		return await new IC(track).grabFrame();
	} catch {
		return null;
	}
}
/** Grab a JPEG from live camera. Prefers ImageCapture, then the rAF canvas. */
async function captureVideoFrame(video, opts) {
	const maxEdge = opts?.maxEdge ?? 960;
	const quality = opts?.quality ?? .72;
	if (opts?.track) {
		const bmp = await grabTrackBitmap(opts.track);
		if (bmp) {
			const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
			const width = Math.max(1, Math.round(bmp.width * scale));
			const height = Math.max(1, Math.round(bmp.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(bmp, 0, 0, width, height);
				bmp.close();
				return canvas.toDataURL("image/jpeg", quality);
			}
			bmp.close();
		}
	}
	if (opts?.pumpCanvas && opts.pumpCanvas.width > 0) return snapshotCanvas(opts.pumpCanvas, {
		maxEdge,
		quality
	});
	const w0 = video.videoWidth;
	const h0 = video.videoHeight;
	if (!w0 || !h0) return null;
	const scale = Math.min(1, maxEdge / Math.max(w0, h0));
	const width = Math.max(1, Math.round(w0 * scale));
	const height = Math.max(1, Math.round(h0 * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	ctx.drawImage(video, 0, 0, width, height);
	return canvas.toDataURL("image/jpeg", quality);
}
var BRANDS = [
	"Leisure Travel Vans",
	"American Coach",
	"Entegra Coach",
	"Forest River",
	"Grand Design",
	"Newmar",
	"Tiffin",
	"Winnebago",
	"Airstream",
	"Fleetwood",
	"Jayco",
	"Thor",
	"Coachmen",
	"Holiday Rambler",
	"Heartland",
	"Keystone",
	"Lance",
	"Renegade",
	"Pleasure-Way",
	"Roadtrek",
	"Enova",
	"Brinkley",
	"Alliance",
	"Outdoors RV",
	"Northwood",
	"Oliver",
	"Nexus",
	"Dynamax",
	"Entegra",
	"Newmar"
].sort((a, b) => b.length - a.length);
function parseCoachFromText(text) {
	const raw = text || "";
	const year = raw.match(/\b(19[89]\d|20[0-2]\d)\b/)?.[1] ?? "";
	const lower = raw.toLowerCase();
	let make = "";
	for (const b of BRANDS) if (lower.includes(b.toLowerCase())) {
		make = b;
		break;
	}
	let model = "";
	let floorplan = "";
	if (make) {
		const after = raw.slice(lower.indexOf(make.toLowerCase()) + make.length);
		const fp = after.match(/\b(\d{2,3}\s?[A-Z]{1,4}|[A-Z]{1,3}\d{2,3}[A-Z]?)\b/);
		if (fp) floorplan = fp[1].replace(/\s+/g, "");
		const chunk = after.replace(/[.,;:!?]/g, " ").split(/\s+/).filter(Boolean).slice(0, 4);
		const skip = /* @__PURE__ */ new Set([
			"the",
			"a",
			"an",
			"rv",
			"class",
			"diesel",
			"gas",
			"motorhome",
			"coach"
		]);
		const words = [];
		for (const w of chunk) {
			if (fp && w.replace(/\s+/g, "") === floorplan) break;
			if (/^\d{4}$/.test(w)) continue;
			if (skip.has(w.toLowerCase())) continue;
			if (w.length < 2) continue;
			words.push(w);
			if (words.join(" ").length > 28) break;
		}
		model = words.join(" ").trim();
	}
	return {
		year,
		make,
		model,
		floorplan
	};
}
var ICONS = {
	analyze_requirements: Search,
	search_rv_models: Search,
	get_model_details: Info,
	check_market_availability: TrendingUp,
	generate_image: Image
};
function AgentStepsCard({ steps }) {
	const [expanded, setExpanded] = (0, import_react.useState)(true);
	if (!steps?.length) return null;
	const doneCount = steps.filter((s) => s.status === "done").length;
	const total = steps.length;
	const allDone = doneCount === total && total > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 overflow-hidden rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setExpanded((p) => !p),
			className: "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-opacity hover:opacity-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full border border-ruby-border bg-ruby-mid px-2 py-0.5 text-[10px] font-bold tracking-wide text-ruby",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-2.5" }), "AGENT"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-xs font-medium text-white",
					children: allDone ? `Research complete · ${total} step${total !== 1 ? "s" : ""}` : `Running · ${doneCount}/${total} steps`
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-white",
				children: [!allDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin text-ruby" }), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })]
			})]
		}), expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5 border-t border-ruby-border/50 px-2.5 py-2",
			children: steps.map((step) => {
				const meta = TOOL_META[step.tool] ?? {
					label: step.tool,
					color: "#888"
				};
				const Icon = ICONS[step.tool] ?? Wrench;
				let resultPreview = "";
				if (step.result) try {
					const parsed = JSON.parse(step.result);
					resultPreview = Object.keys(parsed).slice(0, 2).map((k) => {
						const v = parsed[k];
						return `${k}: ${typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v).slice(0, 40)}`;
					}).join(" · ");
				} catch {
					resultPreview = String(step.result).slice(0, 80);
				}
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 rounded-[var(--radius-sm)] bg-black/25 px-2 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
							style: { backgroundColor: `${meta.color}18` },
							children: step.status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-3.5 animate-spin",
								style: { color: meta.color }
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-3.5",
								style: { color: meta.color }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-semibold",
									style: { color: meta.color },
									children: meta.label
								}), step.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3 text-green" })]
							}), resultPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 truncate text-[10px] leading-snug text-white",
								children: resultPreview
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-[10px] tabular-nums text-white",
							children: ["#", step.step]
						})
					]
				}, step.step);
			})
		})]
	});
}
function AgentBadge({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full border border-ruby-border bg-ruby-mid px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ruby", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-2.5" }), "Agent"]
	});
}
function renderContent(text) {
	return text.split("\n").map((line, i) => {
		if (line.startsWith("|") && line.includes("|")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "my-1 overflow-x-auto font-mono text-[11px] text-white",
			children: line
		}, i);
		const parts = line.split(/(\*\*[^*]+\*\*)/g);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("min-h-[0.4em] leading-relaxed", i > 0 && "mt-1"),
			children: parts.map((part, j) => {
				if (part.startsWith("**") && part.endsWith("**")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "font-semibold text-white",
					children: part.slice(2, -2)
				}, j);
				if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
					className: "text-white not-italic",
					children: part.slice(1, -1)
				}, j);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, j);
			})
		}, i);
	});
}
function MessageBubble({ message, onSpeak, speakingId, priorQuery, onFeedback }) {
	const isUser = message.role === "user";
	const hasAgentSteps = !isUser && (message.agentSteps?.length ?? 0) > 0;
	const isSpeaking = speakingId === message.id;
	const showFeedback = !isUser && !!message.content && !message.streaming && !!onFeedback && !message.content.startsWith("Error:");
	const parsed = parseCoachFromText(`${priorQuery || ""} ${message.content || ""}`);
	const [downOpen, setDownOpen] = (0, import_react.useState)(false);
	const [year, setYear] = (0, import_react.useState)(parsed.year);
	const [make, setMake] = (0, import_react.useState)(parsed.make);
	const [model, setModel] = (0, import_react.useState)(parsed.model);
	const [floorplan, setFloorplan] = (0, import_react.useState)(parsed.floorplan);
	const [correction, setCorrection] = (0, import_react.useState)("");
	const [savedNote, setSavedNote] = (0, import_react.useState)(false);
	const voted = message.feedback;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex w-full gap-2.5", isUser ? "justify-end" : "justify-start"),
		children: [!isUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative mt-1 size-9 shrink-0 overflow-hidden rounded-full border border-ruby-border bg-black shadow-[0_0_16px_rgba(212,37,53,0.35)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/assets/brand/icon-rvgrok.png",
				alt: "",
				className: "size-full object-contain"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-w-[min(100%,28rem)] rounded-[var(--radius-lg)] px-3.5 py-3 text-sm", isUser ? "rounded-br-sm bg-ruby text-white shadow-[0_4px_20px_rgba(212,37,53,0.35)]" : "rounded-bl-sm border border-border-strong bg-surface/90 text-white shadow-[var(--shadow-panel)]"),
			children: [
				hasAgentSteps ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2",
					children: [message.isAgentMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentBadge, {}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentStepsCard, { steps: message.agentSteps })]
				}) : null,
				message.imageDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 overflow-hidden rounded-lg border border-white/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: message.imageDataUrl,
						alt: "Attached photo",
						className: "max-h-52 w-full object-cover"
					})
				}) : null,
				message.generatedImages?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 space-y-2",
					children: message.generatedImages.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-lg border border-gold/35 bg-black/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: "Generated image",
							className: "max-h-72 w-full object-contain"
						})
					}, `${src.slice(0, 48)}-${i}`))
				}) : null,
				message.unverified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 rounded-md border border-amber-400/35 bg-amber-500/15 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100",
					children: "Unverified reply — not catalog truth. Engine, HP, chassis, and fuel stay on the Facts report. This chat never writes those numbers into Facts."
				}) : null,
				message.streaming && !message.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-white/80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Thinking…"]
				}) : renderContent(message.content || ""),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] opacity-60",
						children: formatTime(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp))
					}), !isUser && message.content && onSpeak ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSpeak(message.id, message.content),
						className: "inline-flex items-center gap-1 text-[10px] font-semibold opacity-80 hover:opacity-100",
						children: [isSpeaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3" }), isSpeaking ? "Stop" : "Speak"]
					}) : null]
				}),
				showFeedback ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2.5 border-t border-white/10 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-1 text-[10px] text-white/45",
								children: "Helpful?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Thumbs up",
								"aria-pressed": voted === "up",
								disabled: voted === "up",
								onClick: () => {
									onFeedback?.(message.id, { rating: "up" });
									setDownOpen(false);
								},
								className: cn("inline-flex size-8 items-center justify-center rounded-full border transition", voted === "up" ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300" : "border-white/15 bg-white/5 text-white/70 hover:border-emerald-400/40 hover:text-emerald-200"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Thumbs down",
								"aria-pressed": voted === "down",
								onClick: () => {
									if (voted === "down" && savedNote) return;
									setYear((v) => v || parsed.year);
									setMake((v) => v || parsed.make);
									setModel((v) => v || parsed.model);
									setFloorplan((v) => v || parsed.floorplan);
									setDownOpen(true);
								},
								className: cn("inline-flex size-8 items-center justify-center rounded-full border transition", voted === "down" ? "border-ruby/50 bg-ruby/20 text-rose-300" : "border-white/15 bg-white/5 text-white/70 hover:border-rose-400/40 hover:text-rose-200"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "size-3.5" })
							}),
							voted === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-emerald-300",
								children: "Thanks"
							}) : voted === "down" && !downOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-white/55",
								children: "Saved"
							}) : null
						]
					}), downOpen && voted !== "down" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-2 space-y-2",
						onSubmit: (e) => {
							e.preventDefault();
							const note = correction.trim();
							if (!note) return;
							onFeedback?.(message.id, {
								rating: "down",
								correction: note,
								year: year.trim(),
								make: make.trim(),
								model: model.trim(),
								floorplan: floorplan.trim()
							});
							setSavedNote(true);
							setDownOpen(false);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] leading-snug text-white/70",
								children: "What should it have said? We’ll use this the next time this year / make / model comes up."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: year,
										onChange: (e) => setYear(e.target.value),
										placeholder: "Year",
										inputMode: "numeric",
										className: "rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: make,
										onChange: (e) => setMake(e.target.value),
										placeholder: "Make",
										className: "rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: model,
										onChange: (e) => setModel(e.target.value),
										placeholder: "Model",
										className: "rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: floorplan,
										onChange: (e) => setFloorplan(e.target.value),
										placeholder: "Floorplan",
										className: "rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: correction,
								onChange: (e) => setCorrection(e.target.value),
								rows: 3,
								required: true,
								placeholder: "e.g. 2021 Kountry Star 37BH is Cummins L9 380 HP, not Ford 7.3",
								className: "w-full rounded-md border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] text-white outline-none placeholder:text-white/35"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !correction.trim(),
									className: "inline-flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-full bg-ruby px-3 text-[12px] font-bold text-white disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Save correction"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDownOpen(false),
									className: "rounded-full border border-white/15 px-3 text-[12px] font-bold text-white/70",
									children: "Cancel"
								})]
							})
						]
					}) : null]
				}) : null
			]
		})]
	});
}
function HistoryPanel({ open, sessions, onClose, onLoad, onDelete, onNewChat }) {
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
			"aria-label": "Close history",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex w-full max-w-md flex-col rounded-t-[var(--radius-2xl)] border border-border-strong bg-bg-elevated shadow-[var(--shadow-panel)] sm:rounded-[var(--radius-2xl)]",
			style: { maxHeight: kb.open ? `min(85dvh, calc(var(--vv-height, 100dvh) - ${kb.inset + 32}px))` : "min(85dvh, var(--vv-height, 85dvh))" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-ruby" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "flex-1 text-sm font-semibold",
							children: "Chat History"
						}),
						sessions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-ruby-soft px-2 py-0.5 text-[10px] font-bold text-ruby",
							children: sessions.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-full p-1.5 text-white transition hover:bg-white/5 hover:text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onNewChat();
							onClose();
						},
						className: "flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft px-3 py-2.5 text-sm font-semibold text-ruby transition hover:bg-ruby-mid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "size-4" }), "New chat"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rv-scroll flex-1 overflow-y-auto px-3 py-2",
					children: sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-8 text-center text-sm text-white",
						children: "No saved conversations yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("group flex items-start gap-2 rounded-[var(--radius-md)] border border-transparent bg-surface/60 px-3 py-2.5 transition hover:border-ruby-border/40 hover:bg-surface"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-w-0 flex-1 text-left",
								onClick: () => {
									onLoad(s);
									onClose();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium text-white",
									children: s.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[11px] text-white",
									children: [
										formatRelativeTime(s.updated_at),
										" ·",
										" ",
										s.messages?.length ?? 0,
										" messages"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Delete chat",
								onClick: () => onDelete(s.id),
								className: "rounded-md p-1.5 text-white opacity-70 transition hover:bg-ruby-soft hover:text-ruby group-hover:opacity-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							})]
						}) }, s.id))
					})
				})
			]
		})]
	});
}
var GROK_STARTERS = [
	{
		group: "The shopper",
		title: "Match me to a coach",
		line: "Budget, family, ZIP — what should I buy?",
		Icon: Users,
		prompt: "Match me to an RV. Ask only what you still need: budget, who travels (kids/pets), ZIP, nights vs full-time, and whether I already have a truck. Then recommend 2–3 coach CLASSES with one example year/make/model each I can look up in RvFACTS. Do not invent a dealer listing or say a unit is for sale. EST. payment if I gave a price. If I have a truck, say what to check in RvTow."
	},
	{
		group: "The life",
		title: "Sell me this life",
		line: "Why RV — weekends, mornings, vs hotels",
		Icon: Sunrise,
		prompt: "Sell me the RV lifestyle. I am curious, not shopping a specific coach yet. Paint the weekends, the 6am coffee, the kids/pets, the freedom versus hotels and a second house. Be vivid and honest — one real friction, then the win. Then ask ONE question so you can match me to 2–3 coach classes with one example year/make/model each for RvFACTS. Do not invent a listing."
	},
	{
		group: "The life",
		title: "Full-time or weekends",
		line: "Retire on the road vs keep the house",
		Icon: Compass,
		prompt: "I am considering full-time RV living versus keeping a house and doing weekends or snowbird trips. Sell both lives. Who each path is for, what a Saturday looks like, and the honest tradeoffs. Then recommend which coach CLASSES fit each path with one example year/make/model each I can open in RvFACTS. Point me to RvCal for payment and RvTow if a truck matters. Do not invent inventory."
	},
	{
		group: "The water",
		title: "Hot fishing spots",
		line: "Locator based on my ZIP code",
		Icon: Fish,
		prompt: "Hot fishing spot locator based on my ZIP code. Ask me for the ZIP if I have not given it. Rank nearby lakes, rivers, and piers for an RV traveler — access, coach parking if known, and what is typically biting this time of year."
	},
	{
		group: "The water",
		title: "Free dump locator",
		line: "No-fee RV sewer dumps near my ZIP",
		Icon: Droplets,
		prompt: "Free dump locator based on my ZIP code. Ask me for the ZIP if I have not given it. Find no-fee / public RV sewer dumps in that ZIP area and nearby (city sanitation, rest areas, visitor centers, parks). Name, city, hours if known, and whether rinse or potable water is on site. Skip paid campground dumps unless no free option exists. Confirm locally before pulling in."
	},
	{
		group: "The lot",
		title: "Walk this coach",
		line: "2025 Phaeton 37BH — what to show, OEM only",
		Icon: Sparkles,
		prompt: "Lot walkthrough for a 2025 Tiffin Phaeton 37BH. Use OEM brochure language only. Do not guess layout from the letters BH. What should I show a first-time diesel buyer, and what three objections will I hear?"
	},
	{
		group: "The lot",
		title: "Two-coach compare",
		line: "Phaeton 37BH vs Discovery 38K — no letter guessing",
		Icon: GitCompare,
		prompt: "Compare a 2025 Tiffin Phaeton 37BH to a 2025 Fleetwood Discovery 38K. Powertrain and weights from OEM. Do not decode floorplan letters. If layout is not in the brochure, say Layout details unconfirmed."
	},
	{
		group: "The desk",
		title: "Trade range",
		line: "2018 Winnebago Via 25P diesel — trade vs retail",
		Icon: Wallet,
		prompt: "Fair trade and retail range for a 2018 Winnebago Via 25P diesel with average miles. Separate trade-in vs private vs asking. Do not invent horsepower."
	},
	{
		group: "The desk",
		title: "Structure the deal",
		line: "$189k · trade · ZIP 89101 · 20 years",
		Icon: Wallet,
		prompt: "Payment on a $189,000 coach, $22,000 trade, $6,500 payoff, 20 years, 720 credit, ZIP 89101. Show tax from ZIP, amount financed, and a clean monthly."
	},
	{
		group: "The road",
		title: "Open recalls",
		line: "2024 Fleetwood Bounder — campaigns that apply",
		Icon: TriangleAlert,
		prompt: "NHTSA recalls that actually apply to a 2024 Fleetwood Bounder. Campaign number, component, and whether a hitch or exhaust campaign is on this model. No sister-model dump."
	},
	{
		group: "The road",
		title: "Tow match",
		line: "F-350 vs a 38-foot fifth wheel",
		Icon: Truck,
		prompt: "Can a 2022 Ford F-350 with a 15,000 lb tow rating pull a 38-foot fifth wheel around 14,000 lb GVWR? Hitch, payload, and what I should still verify on the door sticker."
	}
];
var HUB_CHIPS = [
	{
		label: "Match me",
		Icon: Users,
		prompt: "Match me to an RV. Ask only what you still need: budget, who travels (kids/pets), ZIP, nights vs full-time, and whether I already have a truck. Then recommend 2–3 coach CLASSES with one example year/make/model each I can look up in RvFACTS. Do not invent a dealer listing or say a unit is for sale. EST. payment if I gave a price. If I have a truck, say what to check in RvTow."
	},
	{
		label: "The life",
		Icon: Sunrise,
		prompt: "Sell me the RV lifestyle. I am curious, not shopping a specific coach yet. Paint the weekends, the 6am coffee, the kids/pets, the freedom versus hotels and a second house. Be vivid and honest — one real friction, then the win. Then ask ONE question so you can match me to 2–3 coach classes with one example year/make/model each for RvFACTS. Do not invent a listing."
	},
	{
		label: "Specs",
		Icon: FileText,
		tab: "rvfax"
	},
	{
		label: "Recalls",
		Icon: TriangleAlert,
		prompt: "NHTSA recalls. Ask me year, make, and model if I have not given them. Give campaign numbers and what to do. No sister-model dump."
	},
	{
		label: "Towing",
		Icon: Truck,
		tab: "rvtow"
	},
	{
		label: "Financing",
		Icon: Wallet,
		tab: "rvcal"
	},
	{
		label: "Accessories",
		Icon: Wrench,
		prompt: "Help me pick RV accessories and upgrades. Ask year, make, and model if needed. Practical lot advice — not a shopping dump."
	}
];
function RvGrokApp({ seedPrompt, onSeedConsumed, active: _active = true, onNavigate, onSplashPlayingChange: _onSplashPlayingChange } = {}) {
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [agentMode, setAgentMode] = (0, import_react.useState)(false);
	const [sessions, setSessions] = (0, import_react.useState)([]);
	const [sessionId, setSessionId] = (0, import_react.useState)(null);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [voicePanelOpen, setVoicePanelOpen] = (0, import_react.useState)(false);
	const [activeModel, setActiveModel] = (0, import_react.useState)(null);
	const [selectedVoice, setSelectedVoice] = (0, import_react.useState)("ara");
	const [voiceMode, setVoiceMode] = (0, import_react.useState)(false);
	const [liveVoice, setLiveVoice] = (0, import_react.useState)(false);
	const [playbackSpeed, setPlaybackSpeed] = (0, import_react.useState)(1);
	const [isRecording, setIsRecording] = (0, import_react.useState)(false);
	const [speakingId, setSpeakingId] = (0, import_react.useState)(null);
	const [previewingId, setPreviewingId] = (0, import_react.useState)(null);
	const [realtimeStatus, setRealtimeStatus] = (0, import_react.useState)("idle");
	const [realtimeDetail, setRealtimeDetail] = (0, import_react.useState)(null);
	const [interimTranscript, setInterimTranscript] = (0, import_react.useState)("");
	const [voiceError, setVoiceError] = (0, import_react.useState)(null);
	const [reconnectAttempt, setReconnectAttempt] = (0, import_react.useState)(0);
	const [pendingImage, setPendingImage] = (0, import_react.useState)(null);
	const [imageBusy, setImageBusy] = (0, import_react.useState)(false);
	const [liveCam, setLiveCam] = (0, import_react.useState)(false);
	const [camFacing, setCamFacing] = (0, import_react.useState)("environment");
	const [keepShowing, setKeepShowing] = (0, import_react.useState)(false);
	const [frameBusy, setFrameBusy] = (0, import_react.useState)(false);
	const [lastSentFrame, setLastSentFrame] = (0, import_react.useState)(null);
	const listRef = (0, import_react.useRef)(null);
	const cameraInputRef = (0, import_react.useRef)(null);
	const libraryInputRef = (0, import_react.useRef)(null);
	const liveVideoRef = (0, import_react.useRef)(null);
	const pumpCanvasRef = (0, import_react.useRef)(null);
	const stopPumpRef = (0, import_react.useRef)(null);
	const camStreamRef = (0, import_react.useRef)(null);
	const lastLiveFrameAt = (0, import_react.useRef)(0);
	const kb = useKeyboardInset();
	const abortRef = (0, import_react.useRef)(null);
	const recognitionRef = (0, import_react.useRef)(null);
	const finalTranscriptRef = (0, import_react.useRef)("");
	const realtimeRef = (0, import_react.useRef)(null);
	const liveUserMsgId = (0, import_react.useRef)(null);
	const liveAsstMsgId = (0, import_react.useRef)(null);
	const voiceModeRef = (0, import_react.useRef)(voiceMode);
	const liveVoiceRef = (0, import_react.useRef)(liveVoice);
	const liveCamRef = (0, import_react.useRef)(false);
	const isLoadingRef = (0, import_react.useRef)(false);
	const sendGenRef = (0, import_react.useRef)(0);
	const sessionsRef = (0, import_react.useRef)(sessions);
	const messagesRef = (0, import_react.useRef)(messages);
	const sessionIdRef = (0, import_react.useRef)(sessionId);
	const startingLiveRef = (0, import_react.useRef)(false);
	const continuousLoopRef = (0, import_react.useRef)(false);
	const skipNextAutoRecordRef = (0, import_react.useRef)(false);
	const sendMessageRef = (0, import_react.useRef)(async () => {});
	const startLiveSessionRef = (0, import_react.useRef)(async () => {});
	const startPushToTalkRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		return () => {
			stopBrowserTts();
			recognitionRef.current?.abort();
			realtimeRef.current?.stop();
			camStreamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			if (localStorage.getItem("rvgrok_agent_mode") === "true") setAgentMode(true);
			const v = localStorage.getItem(VOICE_STORAGE_KEY);
			if (v) setSelectedVoice(v);
			const sp = localStorage.getItem(VOICE_SPEED_KEY);
			if (sp) {
				const n = Number(sp);
				if (Number.isFinite(n) && n > 0) setPlaybackSpeed(n);
			}
			if (localStorage.getItem("rvgrok_voice_mode") === "true") setVoiceMode(true);
			if (localStorage.getItem("rvgrok_live_voice") === "true") {
				setLiveVoice(true);
				liveVoiceRef.current = true;
			}
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		setSessions(loadSessions());
	}, []);
	const scrollToBottom = (0, import_react.useCallback)(() => {
		requestAnimationFrame(() => {
			const el = listRef.current;
			if (el) el.scrollTop = el.scrollHeight;
		});
	}, []);
	const toggleAgentMode = () => {
		setAgentMode((v) => {
			const next = !v;
			try {
				localStorage.setItem(AGENT_MODE_KEY, String(next));
			} catch {}
			return next;
		});
	};
	const persistVoice = (id) => {
		setSelectedVoice(id);
		try {
			localStorage.setItem(VOICE_STORAGE_KEY, id);
		} catch {}
	};
	const persistSpeed = (s) => {
		setPlaybackSpeed(s);
		try {
			localStorage.setItem(VOICE_SPEED_KEY, String(s));
		} catch {}
	};
	const stopLiveSession = (0, import_react.useCallback)((opts) => {
		startingLiveRef.current = false;
		realtimeRef.current?.stop();
		realtimeRef.current = null;
		setRealtimeStatus("idle");
		setRealtimeDetail(null);
		liveUserMsgId.current = null;
		liveAsstMsgId.current = null;
		if (opts?.disarm) {
			liveVoiceRef.current = false;
			setLiveVoice(false);
			try {
				localStorage.setItem(LIVE_VOICE_KEY, "false");
			} catch {}
			camStreamRef.current?.getTracks().forEach((t) => t.stop());
			camStreamRef.current = null;
			if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
			setLiveCam(false);
			liveCamRef.current = false;
			liveCamRef.current = false;
		}
	}, []);
	const startNewChat = (0, import_react.useCallback)(() => {
		abortRef.current?.abort();
		recognitionRef.current?.abort();
		realtimeRef.current?.stop();
		realtimeRef.current = null;
		startingLiveRef.current = false;
		stopBrowserTts();
		setMessages([]);
		setSessionId(null);
		setInput("");
		setPendingImage(null);
		setIsLoading(false);
		setIsRecording(false);
		setSpeakingId(null);
		setActiveModel(null);
		setRealtimeStatus("idle");
		setRealtimeDetail(null);
		setInterimTranscript("");
		setVoiceError(null);
		camStreamRef.current?.getTracks().forEach((t) => t.stop());
		camStreamRef.current = null;
		if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
		setLiveCam(false);
		liveCamRef.current = false;
	}, []);
	const pullHint = usePullToReset(listRef, startNewChat);
	const handleStop = () => {
		abortRef.current?.abort();
		abortRef.current = null;
		recognitionRef.current?.abort();
		recognitionRef.current = null;
		continuousLoopRef.current = false;
		skipNextAutoRecordRef.current = true;
		stopLiveSession({ disarm: true });
		stopBrowserTts();
		setIsLoading(false);
		setIsRecording(false);
		setSpeakingId(null);
		setInterimTranscript("");
		setVoiceMode(false);
		voiceModeRef.current = false;
		try {
			localStorage.setItem(VOICE_MODE_KEY, "false");
		} catch {}
		setMessages((prev) => prev.map((m) => m.streaming ? {
			...m,
			streaming: false,
			content: m.content || "Cancelled."
		} : m));
	};
	const handleSpeak = (0, import_react.useCallback)((msgId, text) => {
		if (speakingId === msgId) {
			stopBrowserTts();
			setSpeakingId(null);
			return;
		}
		stopBrowserTts();
		setSpeakingId(msgId);
		speakWithBrowserTts(text, {
			rate: playbackSpeed,
			onEnd: () => setSpeakingId(null)
		});
	}, [speakingId, playbackSpeed]);
	const handlePreviewVoice = (0, import_react.useCallback)((voice) => {
		if (previewingId === voice.id) {
			stopBrowserTts();
			setPreviewingId(null);
			return;
		}
		stopBrowserTts();
		setPreviewingId(voice.id);
		speakWithBrowserTts(`Hi, I am ${voice.name}. Your RvGrok voice for RV intelligence.`, {
			rate: playbackSpeed,
			onEnd: () => setPreviewingId(null)
		});
	}, [previewingId, playbackSpeed]);
	const onPickImage = (0, import_react.useCallback)(async (file) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setVoiceError("Please choose a photo (JPEG or PNG).");
			return;
		}
		setImageBusy(true);
		setVoiceError(null);
		try {
			const dataUrl = await compressImageToDataUrl(file);
			setPendingImage(dataUrl);
		} catch (e) {
			setVoiceError(e instanceof Error ? e.message : "Could not process that photo");
		} finally {
			setImageBusy(false);
			if (cameraInputRef.current) cameraInputRef.current.value = "";
			if (libraryInputRef.current) libraryInputRef.current.value = "";
		}
	}, []);
	const sendMessage = (0, import_react.useCallback)(async (text, opts) => {
		const messageText = (text ?? input).trim();
		const image = opts?.image ?? (opts?.liveFrame ? null : pendingImage);
		if (!messageText && !image || isLoadingRef.current && !opts?.liveFrame) return;
		if (opts?.liveFrame && abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
			isLoadingRef.current = false;
		}
		const gen = ++sendGenRef.current;
		setInput("");
		setPendingImage(null);
		setInterimTranscript("");
		setVoiceError(null);
		const userMsg = {
			id: uid("u"),
			role: "user",
			content: messageText || (image ? "Analyze this RV photo" : ""),
			timestamp: /* @__PURE__ */ new Date(),
			imageDataUrl: image || void 0
		};
		const assistantMsgId = uid("a");
		const assistantMsg = {
			id: assistantMsgId,
			role: "assistant",
			content: "",
			streaming: true,
			timestamp: /* @__PURE__ */ new Date(),
			isAgentMode: agentMode,
			agentSteps: []
		};
		setMessages((prev) => [
			...prev,
			userMsg,
			assistantMsg
		]);
		setIsLoading(true);
		isLoadingRef.current = true;
		scrollToBottom();
		const controller = new AbortController();
		abortRef.current = controller;
		let fullContent = "";
		const liveSteps = [];
		const liveImages = [];
		let unverified = false;
		const stampUnverified = () => {
			unverified = true;
			setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? {
				...m,
				unverified: true
			} : m));
		};
		try {
			const prior = messagesRef.current;
			await streamChat({
				messages: opts?.liveFrame && image ? [...prior.filter((m) => !m.imageDataUrl).slice(-4).map((m) => ({
					role: m.role,
					content: m.content
				})), {
					role: "user",
					content: buildUserContent(messageText, image)
				}] : [...prior, userMsg].slice(-10).map((m) => ({
					role: m.role,
					content: m.role === "user" && m.imageDataUrl ? buildUserContent(m.content, m.imageDataUrl) : m.content
				})),
				agentMode,
				signal: controller.signal,
				handlers: {
					onModel: (m) => {
						setActiveModel(m);
						if (/demo/i.test(m)) stampUnverified();
					},
					onUpstream: (u) => {
						if (u === "demo" || /demo/i.test(u)) stampUnverified();
					},
					onStep: (step) => {
						const idx = liveSteps.findIndex((s) => s.step === step.step);
						if (idx >= 0) liveSteps[idx] = step;
						else liveSteps.push(step);
						setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? {
							...m,
							agentSteps: [...liveSteps],
							generatedImages: [...liveImages],
							streaming: true,
							unverified: unverified || m.unverified
						} : m));
						scrollToBottom();
					},
					onImage: (url) => {
						if (!url || liveImages.includes(url)) return;
						liveImages.push(url);
						setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? {
							...m,
							generatedImages: [...liveImages],
							agentSteps: [...liveSteps],
							streaming: true,
							unverified: unverified || m.unverified
						} : m));
						scrollToBottom();
					},
					onDelta: (delta) => {
						fullContent += delta;
						if (!unverified && /\bunverified demo\b|\*\*RvGrok · unverified/i.test(fullContent)) unverified = true;
						setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? {
							...m,
							content: fullContent,
							agentSteps: [...liveSteps],
							generatedImages: [...liveImages],
							streaming: true,
							unverified: unverified || m.unverified
						} : m));
						scrollToBottom();
					},
					onError: (msg) => {
						fullContent = fullContent || `Error: ${msg}`;
					}
				}
			});
			if (agentMode) setActiveModel((m) => m || "grok-4.5 · Agent");
			const finalContent = fullContent || (agentMode ? "Agent completed research. No summary generated." : "Unable to generate a response. Please try again.");
			setMessages((prev) => {
				const updated = prev.map((m) => m.id === assistantMsgId ? {
					...m,
					content: finalContent,
					streaming: false,
					isAgentMode: agentMode,
					agentSteps: [...liveSteps],
					generatedImages: [...liveImages],
					unverified
				} : m);
				const { sessions: next, id } = upsertSession(sessionsRef.current, updated, sessionIdRef.current);
				sessionsRef.current = next;
				setSessions(next);
				if (id !== sessionIdRef.current) {
					sessionIdRef.current = id;
					setSessionId(id);
				}
				return updated;
			});
			const shouldSpeak = (voiceModeRef.current || opts?.fromVoice || liveCamRef.current) && !liveVoiceRef.current && finalContent && !controller.signal.aborted;
			if (opts?.liveFrame && realtimeRef.current?.isActive && finalContent && !controller.signal.aborted) realtimeRef.current.injectUserNote(`VISION of the user's live camera JPEG (you can treat this as what you saw): ${finalContent.slice(0, 900)}. Speak to that. Never say you cannot see an image.`, true, "The user showed a live camera photo. Read the vision description as ground truth and coach them in under 20 seconds. Do not say you lack a camera.");
			else if (shouldSpeak) {
				setSpeakingId(assistantMsgId);
				speakWithBrowserTts(finalContent, {
					rate: playbackSpeed,
					onEnd: () => {
						setSpeakingId(null);
						if (continuousLoopRef.current && !skipNextAutoRecordRef.current && !liveVoiceRef.current) window.setTimeout(() => startPushToTalkRef.current(), 280);
						skipNextAutoRecordRef.current = false;
					}
				});
			} else if (continuousLoopRef.current && opts?.fromVoice && !liveVoiceRef.current && !controller.signal.aborted) window.setTimeout(() => startPushToTalkRef.current(), 400);
		} catch (err) {
			if (err?.name === "AbortError") return;
			const msg = err instanceof Error ? err.message : "Failed to connect";
			setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? {
				...m,
				content: `Error: ${msg}. Please try again.`,
				streaming: false
			} : m));
		} finally {
			if (gen === sendGenRef.current) {
				abortRef.current = null;
				setIsLoading(false);
				isLoadingRef.current = false;
			}
			scrollToBottom();
		}
	}, [
		input,
		pendingImage,
		agentMode,
		scrollToBottom,
		playbackSpeed
	]);
	(0, import_react.useEffect)(() => {
		sendMessageRef.current = sendMessage;
	}, [sendMessage]);
	const startPushToTalk = (0, import_react.useCallback)(() => {
		if (liveVoiceRef.current) return;
		if (!getSpeechRecognitionCtor()) {
			setVoiceError("Speech recognition not supported here. Tap the mic for Live Grok Voice instead.");
			return;
		}
		if (recognitionRef.current) {
			try {
				recognitionRef.current.abort();
			} catch {}
			recognitionRef.current = null;
		}
		stopBrowserTts();
		setSpeakingId(null);
		setVoiceError(null);
		finalTranscriptRef.current = "";
		setInterimTranscript("");
		skipNextAutoRecordRef.current = false;
		const rec = createPushToTalkRecognition({
			onInterim: (t) => setInterimTranscript(t),
			onFinal: (t) => {
				finalTranscriptRef.current = (finalTranscriptRef.current + " " + t).trim();
				setInterimTranscript("");
				setInput(finalTranscriptRef.current);
			},
			onError: (err) => {
				if (err !== "aborted" && err !== "no-speech") setVoiceError(`Mic: ${err}`);
				setIsRecording(false);
				if (continuousLoopRef.current && (err === "no-speech" || err === "aborted")) window.setTimeout(() => {
					if (continuousLoopRef.current && !liveVoiceRef.current) startPushToTalkRef.current();
				}, 500);
			},
			onEnd: () => {
				setIsRecording(false);
				const spoken = finalTranscriptRef.current.trim();
				finalTranscriptRef.current = "";
				setInterimTranscript("");
				if (spoken) sendMessageRef.current(spoken, { fromVoice: true });
				else if (continuousLoopRef.current && !liveVoiceRef.current) window.setTimeout(() => {
					if (continuousLoopRef.current && !liveVoiceRef.current) startPushToTalkRef.current();
				}, 450);
			}
		});
		if (!rec) return;
		recognitionRef.current = rec;
		try {
			rec.start();
			setIsRecording(true);
		} catch (e) {
			setVoiceError(e instanceof Error ? e.message : "Could not start microphone");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		startPushToTalkRef.current = startPushToTalk;
	}, [startPushToTalk]);
	const stopPushToTalk = (0, import_react.useCallback)((opts) => {
		const shouldSend = opts?.send !== false;
		try {
			recognitionRef.current?.stop();
		} catch {}
		recognitionRef.current = null;
		setIsRecording(false);
		const spoken = finalTranscriptRef.current.trim();
		finalTranscriptRef.current = "";
		setInterimTranscript("");
		if (shouldSend && spoken) sendMessageRef.current(spoken, { fromVoice: true });
	}, []);
	const startLiveSession = (0, import_react.useCallback)(async () => {
		if (startingLiveRef.current) return;
		if (realtimeRef.current?.isActive) return;
		try {
			recognitionRef.current?.abort();
		} catch {}
		recognitionRef.current = null;
		setIsRecording(false);
		startingLiveRef.current = true;
		stopBrowserTts();
		setSpeakingId(null);
		setVoiceError(null);
		setRealtimeStatus("connecting");
		setRealtimeDetail("Starting Live Voice…");
		realtimeRef.current?.stop();
		realtimeRef.current = null;
		const session = new GrokRealtimeSession({
			onStatus: (s, detail) => {
				setRealtimeStatus(s);
				setRealtimeDetail(detail ?? null);
			},
			onUserTranscript: (text) => {
				const uidMsg = liveUserMsgId.current;
				if (uidMsg) setMessages((prev) => prev.map((m) => m.id === uidMsg ? {
					...m,
					content: text
				} : m));
				else {
					const id = uid("u-live");
					liveUserMsgId.current = id;
					setMessages((prev) => [...prev, {
						id,
						role: "user",
						content: text,
						timestamp: /* @__PURE__ */ new Date()
					}]);
				}
				scrollToBottom();
			},
			onAssistantDelta: (text) => {
				let asstId = liveAsstMsgId.current;
				if (!asstId) {
					asstId = uid("a-live");
					liveAsstMsgId.current = asstId;
					if (!liveUserMsgId.current) {
						const uId = uid("u-live");
						liveUserMsgId.current = uId;
						setMessages((prev) => [
							...prev,
							{
								id: uId,
								role: "user",
								content: "🎤 Listening…",
								timestamp: /* @__PURE__ */ new Date()
							},
							{
								id: asstId,
								role: "assistant",
								content: text,
								streaming: true,
								timestamp: /* @__PURE__ */ new Date()
							}
						]);
					} else setMessages((prev) => [...prev, {
						id: asstId,
						role: "assistant",
						content: text,
						streaming: true,
						timestamp: /* @__PURE__ */ new Date()
					}]);
				} else setMessages((prev) => prev.map((m) => m.id === asstId ? {
					...m,
					content: text,
					streaming: true
				} : m));
				scrollToBottom();
			},
			onAssistantDone: (text) => {
				const asstId = liveAsstMsgId.current;
				if (asstId) setMessages((prev) => {
					const updated = prev.map((m) => m.id === asstId ? {
						...m,
						content: text,
						streaming: false
					} : m);
					const { sessions: next, id } = upsertSession(sessionsRef.current, updated, sessionIdRef.current);
					sessionsRef.current = next;
					setSessions(next);
					if (id !== sessionIdRef.current) {
						sessionIdRef.current = id;
						setSessionId(id);
					}
					return updated;
				});
				liveUserMsgId.current = null;
				liveAsstMsgId.current = null;
				scrollToBottom();
			},
			onError: (message) => {
				setVoiceError(message);
				setRealtimeDetail(message);
			},
			onDisconnected: (reason) => {
				realtimeRef.current = null;
				startingLiveRef.current = false;
				if (liveVoiceRef.current) {
					setRealtimeDetail("Reconnecting…");
					setReconnectAttempt((n) => n + 1);
					window.setTimeout(() => {
						if (liveVoiceRef.current) startLiveSessionRef.current();
					}, 900);
				} else {
					setRealtimeStatus("idle");
					setVoiceError(`Disconnected: ${reason}`);
				}
			}
		}, selectedVoice);
		realtimeRef.current = session;
		try {
			await session.start();
			setReconnectAttempt(0);
		} catch (e) {
			const raw = e instanceof Error ? e.message : "Could not start Live Voice";
			const permission = /403|permission|does not have permission/i.test(raw);
			const msg = permission ? "Live Voice isn’t enabled on this xAI account. Camera still works — tap Show this and Grok will see the frame over chat." : raw;
			setVoiceError(msg);
			setRealtimeStatus("error");
			setRealtimeDetail(msg);
			realtimeRef.current = null;
			liveVoiceRef.current = false;
			setLiveVoice(false);
			if (!permission && liveVoiceRef.current && reconnectAttempt < 2) window.setTimeout(() => {
				if (liveVoiceRef.current) startLiveSessionRef.current();
			}, 1200);
		} finally {
			startingLiveRef.current = false;
		}
	}, [
		selectedVoice,
		scrollToBottom,
		reconnectAttempt
	]);
	(0, import_react.useEffect)(() => {
		startLiveSessionRef.current = startLiveSession;
	}, [startLiveSession]);
	const setLiveVoiceArmed = (0, import_react.useCallback)((on) => {
		liveVoiceRef.current = on;
		setLiveVoice(on);
		try {
			localStorage.setItem(LIVE_VOICE_KEY, String(on));
		} catch {}
		if (on) {
			continuousLoopRef.current = false;
			try {
				recognitionRef.current?.abort();
			} catch {}
			recognitionRef.current = null;
			setIsRecording(false);
			setVoicePanelOpen(false);
			startLiveSessionRef.current();
		} else {
			stopLiveSession();
			if (voiceModeRef.current) {
				continuousLoopRef.current = true;
				window.setTimeout(() => startPushToTalkRef.current(), 300);
			}
		}
	}, [stopLiveSession]);
	const setVoiceModeArmed = (0, import_react.useCallback)((on) => {
		voiceModeRef.current = on;
		setVoiceMode(on);
		try {
			localStorage.setItem(VOICE_MODE_KEY, String(on));
		} catch {}
		continuousLoopRef.current = on && !liveVoiceRef.current;
		if (on && !liveVoiceRef.current) {
			setVoicePanelOpen(false);
			window.setTimeout(() => startPushToTalkRef.current(), 200);
		} else if (!on && !liveVoiceRef.current) {
			skipNextAutoRecordRef.current = true;
			try {
				recognitionRef.current?.abort();
			} catch {}
			recognitionRef.current = null;
			setIsRecording(false);
			stopBrowserTts();
			setSpeakingId(null);
		}
	}, []);
	const stopLiveCamera = (0, import_react.useCallback)(() => {
		stopPumpRef.current?.();
		stopPumpRef.current = null;
		camStreamRef.current?.getTracks().forEach((t) => t.stop());
		camStreamRef.current = null;
		if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
		setLiveCam(false);
		liveCamRef.current = false;
		setLastSentFrame(null);
	}, []);
	const sendLiveFrame = (0, import_react.useCallback)(async (force = false) => {
		const video = liveVideoRef.current;
		if (!video) return;
		if (!force && (frameBusy || isLoadingRef.current)) return;
		setFrameBusy(true);
		try {
			const dataUrl = await captureVideoFrame(video, {
				pumpCanvas: pumpCanvasRef.current ?? void 0,
				track: camStreamRef.current?.getVideoTracks()[0] ?? null
			});
			if (!dataUrl) return;
			lastLiveFrameAt.current = Date.now();
			setLastSentFrame(dataUrl);
			const prompt = `LIVE CAMERA FRAME captured ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}. A JPEG is attached. You CAN see it. Describe ONLY this attached image and the next troubleshooting step. Short. Never say you cannot see an image.`;
			const live = realtimeRef.current;
			if (live?.isActive) try {
				live.prepareForSnapshot();
			} catch {}
			await sendMessageRef.current(prompt, {
				image: dataUrl,
				fromVoice: true,
				liveFrame: true
			});
		} finally {
			setFrameBusy(false);
		}
	}, [frameBusy]);
	const startLiveCamera = (0, import_react.useCallback)(async (facing = camFacing) => {
		try {
			camStreamRef.current?.getTracks().forEach((t) => t.stop());
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: facing },
					width: { ideal: 1280 },
					height: { ideal: 720 }
				},
				audio: false
			});
			camStreamRef.current = stream;
			setCamFacing(facing);
			setLiveCam(true);
			liveCamRef.current = true;
			setPendingImage(null);
			setLastSentFrame(null);
			setVoiceError(null);
		} catch (e) {
			setVoiceError(e instanceof Error ? e.message : "Camera permission denied. Enable Camera for RV Grok in Settings.");
			setLiveCam(false);
			liveCamRef.current = false;
		}
	}, [camFacing, sendLiveFrame]);
	/**
	* Mic button = Live Grok Voice.
	* Tap → start continuous live session; tap again → stop.
	* (Push-to-talk "Voice Mode" stays available from Settings.)
	*/
	const handleMicPress = () => {
		if (realtimeStatus === "connecting" || realtimeStatus === "listening" || realtimeStatus === "thinking" || realtimeStatus === "speaking" || realtimeRef.current) {
			stopLiveSession({ disarm: true });
			return;
		}
		if (isRecording) stopPushToTalk({ send: false });
		setLiveVoiceArmed(true);
	};
	const onKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};
	(0, import_react.useEffect)(() => {
		if (!seedPrompt?.trim()) return;
		const t = seedPrompt.trim();
		onSeedConsumed?.();
		sendMessageRef.current(t);
	}, [seedPrompt, onSeedConsumed]);
	(0, import_react.useEffect)(() => {
		sessionsRef.current = sessions;
	}, [sessions]);
	(0, import_react.useEffect)(() => {
		messagesRef.current = messages;
	}, [messages]);
	(0, import_react.useEffect)(() => {
		sessionIdRef.current = sessionId;
	}, [sessionId]);
	(0, import_react.useEffect)(() => {
		voiceModeRef.current = voiceMode;
	}, [voiceMode]);
	(0, import_react.useEffect)(() => {
		liveVoiceRef.current = liveVoice;
	}, [liveVoice]);
	(0, import_react.useEffect)(() => {
		const el = liveVideoRef.current;
		const stream = camStreamRef.current;
		if (!liveCam || !el || !stream) return;
		el.srcObject = stream;
		el.muted = true;
		el.playsInline = true;
		el.setAttribute("playsinline", "true");
		el.setAttribute("webkit-playsinline", "true");
		el.play().catch(() => {});
		if (!pumpCanvasRef.current) pumpCanvasRef.current = document.createElement("canvas");
		stopPumpRef.current?.();
		stopPumpRef.current = startVideoFramePump(el, pumpCanvasRef.current);
		return () => {
			stopPumpRef.current?.();
			stopPumpRef.current = null;
		};
	}, [liveCam]);
	(0, import_react.useEffect)(() => {
		if (!liveCam || !keepShowing) return;
		const id = window.setInterval(() => {
			if (Date.now() - lastLiveFrameAt.current < 6e3) return;
			if (realtimeStatus === "speaking" || realtimeStatus === "thinking") return;
			sendLiveFrame(true);
		}, 7e3);
		return () => window.clearInterval(id);
	}, [
		liveCam,
		keepShowing,
		realtimeStatus,
		sendLiveFrame
	]);
	const runHub = (chip) => {
		if (chip.tab && onNavigate) {
			onNavigate(chip.tab);
			return;
		}
		if (chip.prompt) sendMessageRef.current(chip.prompt);
	};
	const hubBar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center justify-center gap-1.5",
		children: HUB_CHIPS.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => runHub(chip),
			className: "inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:border-gold/50 hover:bg-gold/15",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(chip.Icon, { className: "size-3.5 text-gold-bright" }), chip.label]
		}, chip.label))
	});
	const modelLabel = activeModel ? activeModel.replace(/grok-/gi, "Grok ").replace(/grok /gi, "Grok ") : "Grok 4.5";
	const liveActive = realtimeStatus === "connecting" || realtimeStatus === "listening" || realtimeStatus === "thinking" || realtimeStatus === "speaking";
	const continuousArmed = liveActive || voiceMode && isRecording;
	const waitingToResumeLive = liveVoice && !liveActive && !isRecording && !startingLiveRef.current;
	const displayInput = isRecording ? interimTranscript || input || "Listening…" : input;
	const canSend = (Boolean(input.trim()) || Boolean(pendingImage)) && !isLoading && !liveActive;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full min-h-0 flex-col overflow-hidden text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteBackdrop, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollSuiteHeader, {
				tab: "rvgrok",
				className: "relative z-10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center gap-2 border-b border-white/10 bg-black/25 px-3 py-2 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setHistoryOpen(true),
						className: "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sky-100 transition hover:bg-white/10 sm:size-10",
						"aria-label": "Chat history",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-5" }), sessions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white",
							children: sessions.length > 9 ? "9+" : sessions.length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 flex-1 items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[10px] font-medium text-sky-100/90 sm:text-[11px]",
								children: liveActive ? "Live Voice · hands-free" : isRecording ? "Listening…" : activeModel ? modelLabel : "AI RV Expert · live"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1 sm:gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: toggleAgentMode,
								className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-bold transition sm:px-2.5 sm:text-[11px]", agentMode ? "border-sky-300/45 bg-sky-500/25 text-sky-50 shadow-[0_0_14px_rgba(80,160,255,0.35)]" : "border-white/20 bg-black/40 text-white"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), "Agent"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setVoicePanelOpen(true),
								className: cn("flex size-9 items-center justify-center rounded-full border transition", liveVoice || voiceMode ? "border-sky-300/45 bg-sky-500/20 text-sky-100" : "border-white/20 bg-black/40 text-white hover:bg-white/10"),
								"aria-label": "Voice settings",
								title: "Voice settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: startNewChat,
								className: "flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-white/10",
								"aria-label": "New chat",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleMicPress,
								className: cn("flex size-9 items-center justify-center rounded-full border transition", liveActive ? "border-sky-300 bg-sky-500 text-white shadow-[0_0_16px_rgba(80,160,255,0.55)]" : waitingToResumeLive ? "border-sky-300/45 bg-sky-500/20 text-sky-100 animate-pulse" : "border-white/20 bg-black/40 text-white hover:bg-white/10"),
								"aria-label": liveActive ? "Stop live voice" : "Start live voice",
								title: liveActive ? "Stop Live Voice" : "Start Live Voice",
								children: liveActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
							})
						]
					})
				]
			}),
			sessionId && messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-3 mt-2 flex items-center gap-2 rounded-full border border-border bg-black/45 px-3 py-1.5 text-[11px] text-muted sm:mx-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-sky-500" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate",
						children: messages.find((m) => m.role === "user")?.content.slice(0, 50) ?? "Current session"
					}),
					agentMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-sky-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-2.5" }), "Agent"]
					})
				]
			}),
			messages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 mx-3 mt-2 sm:mx-4",
				children: hubBar
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: listRef,
				"data-app-scroll": true,
				className: "rv-scroll relative z-10 flex-1 overflow-y-auto px-3 sm:px-4",
				style: { paddingBottom: kb.open ? 12 : void 0 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullResetHint, {
					show: pullHint,
					label: "Release to reset Live Voice & chat · pull down"
				}), messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-xl flex-col px-1 pb-8 pt-5 sm:pt-7",
					children: [
						agentMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 self-center inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/25 px-3.5 py-1.5 text-[12px] font-semibold text-sky-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "Agent"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-bright",
									children: "RvGrok"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1.5 text-[26px] font-semibold tracking-tight text-white",
									children: "Ask like you’re on the lot"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-white",
									children: "Specs, lifestyle, trade, payment, recalls, tow — tap a prompt or type your own."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: hubBar
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setLiveVoiceArmed(true),
									className: "inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500 px-3.5 py-2 text-[12px] font-bold text-white shadow-[0_0_18px_rgba(80,160,255,0.35)] transition hover:bg-sky-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), "Live Voice"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: imageBusy,
									onClick: () => void startLiveCamera(),
									className: "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-gold/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-3.5" }), "Live camera"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: imageBusy,
									onClick: () => cameraInputRef.current?.click(),
									className: "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-3.5" }), "Show Grok"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: imageBusy,
									onClick: () => libraryInputRef.current?.click(),
									className: "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10",
									children: "Photo library"
								})
							]
						}),
						waitingToResumeLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-[13px] text-white",
							children: "Live Voice is armed — tap mic to resume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-7 space-y-5",
							children: [
								"The shopper",
								"The life",
								"The water",
								"The lot",
								"The desk",
								"The road"
							].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-bright",
								children: group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
								children: GROK_STARTERS.filter((s) => s.group === group).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void sendMessage(s.prompt),
									className: "glass-prestige flex items-start gap-3 rounded-2xl px-3.5 py-3.5 text-left transition hover:border-white/25",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-gold-bright",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.Icon, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[15px] font-semibold text-white",
										children: s.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-[13px] leading-snug text-white",
										children: s.line
									})] })]
								}, s.title))
							})] }, group))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-2xl flex-col gap-4 pb-4",
					children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
						message: m,
						onSpeak: handleSpeak,
						speakingId
					}, m.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 border-t border-border/60 bg-gradient-to-t from-bg via-bg/95 to-bg/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4",
				children: [
					(isLoading || messages.some((m) => m.streaming) || isRecording || liveActive || speakingId || continuousArmed) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleStop,
						className: "mb-2 flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-sky-300/40 bg-sky-500/25 px-3 py-2.5 text-left transition hover:bg-sky-500/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-7 items-center justify-center rounded-md bg-sky-500 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-[13px] font-medium text-fg",
								children: liveActive ? `Live continuous · ${realtimeDetail || realtimeStatus} — tap to end` : isRecording ? voiceMode ? "Auto-listening — tap to stop hands-free" : "Recording — tap to stop & send" : isLoading ? "Processing — tap to cancel" : "Speaking — tap to stop"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-bold tracking-wide text-sky-100",
								children: "STOP"
							})
						]
					}),
					liveCam ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto mb-2 max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-black",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-[4/3] w-full bg-black",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									ref: liveVideoRef,
									className: "size-full object-cover",
									playsInline: true,
									muted: true,
									autoPlay: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-ruby/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 animate-pulse rounded-full bg-white" }), "LIVE"]
								}),
								lastSentFrame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute right-2.5 top-2.5 overflow-hidden rounded-md border border-white/50 shadow-lg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: lastSentFrame,
										alt: "What Grok just received",
										className: "h-14 w-20 object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center text-[8px] font-bold text-white",
										children: "SENT"
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: frameBusy,
											onClick: () => void sendLiveFrame(true),
											className: "rounded-full bg-sky-500 px-3 py-1.5 text-[12px] font-bold text-white",
											children: frameBusy ? "Sending…" : "Show this"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void startLiveCamera(camFacing === "environment" ? "user" : "environment"),
											className: "rounded-full border border-white/30 bg-black/50 px-2.5 py-1.5 text-white",
											"aria-label": "Flip camera",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setKeepShowing((v) => !v),
											className: cn("rounded-full border px-3 py-1.5 text-[11px] font-semibold text-white", keepShowing ? "border-gold/50 bg-gold/25" : "border-white/30 bg-black/50"),
											children: keepShowing ? "Keep showing" : "Tap only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: stopLiveCamera,
											className: "ml-auto rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white",
											children: "Close cam"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-1.5 text-[12px] text-white",
							children: "Frame what you want her to see, then tap Show this. The SENT thumbnail is exactly what Grok got."
						})]
					}) : null,
					liveActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto mb-2 flex max-w-2xl items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/15 px-3 py-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 animate-pulse rounded-full bg-sky-500" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3 text-sky-100" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-[11px] font-medium text-sky-100",
								children: realtimeDetail || `Live Grok Voice · ${realtimeStatus}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-wide text-muted",
								children: selectedVoice
							})
						]
					}),
					waitingToResumeLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void startLiveSession(),
						className: "mx-auto mb-2 flex w-full max-w-2xl items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/15 px-3 py-2 text-left transition hover:bg-sky-500/25",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5 text-sky-100" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-[12px] font-semibold text-sky-100",
								children: "Live Voice armed — tap mic to resume"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-muted",
								children: "RESUME"
							})
						]
					}),
					voiceError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mb-2 max-w-2xl rounded-md border border-sky-300/40 bg-sky-500/15 px-3 py-1.5 text-center text-[11px] text-sky-100",
						children: voiceError
					}),
					pendingImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto mb-2 flex max-w-2xl items-center gap-2 rounded-[var(--radius-md)] border border-sky-300/35 bg-black/40 px-2 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: pendingImage,
								alt: "Ready to send",
								className: "size-14 shrink-0 rounded-md object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] font-semibold text-sky-100",
									children: "Photo ready"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-white/65",
									children: "Add a question or send to analyze"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPendingImage(null),
								className: "flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-white/10",
								"aria-label": "Remove photo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mx-auto flex max-w-2xl items-end gap-1.5 rounded-[var(--radius-xl)] border bg-surface/90 px-2 py-2 shadow-[var(--shadow-panel)] focus-within:border-sky-300/40 sm:gap-2 sm:px-2.5", isRecording || liveActive ? "border-sky-300/40" : "border-border-strong"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: cameraInputRef,
								type: "file",
								accept: "image/*",
								capture: "environment",
								className: "pointer-events-none absolute size-px overflow-hidden opacity-0",
								tabIndex: -1,
								"aria-hidden": true,
								onChange: (e) => {
									const f = e.target.files?.[0] ?? null;
									onPickImage(f);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: libraryInputRef,
								type: "file",
								accept: "image/*",
								className: "pointer-events-none absolute size-px overflow-hidden opacity-0",
								tabIndex: -1,
								"aria-hidden": true,
								onChange: (e) => {
									const f = e.target.files?.[0] ?? null;
									onPickImage(f);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: liveActive || imageBusy,
								onClick: () => cameraInputRef.current?.click(),
								className: cn("mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full transition", pendingImage ? "bg-sky-500/25 text-sky-100" : "text-white hover:bg-white/5", (liveActive || imageBusy) && "opacity-40"),
								"aria-label": "Take a photo for Grok",
								title: "Take photo",
								children: imageBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: imageBusy,
								onClick: () => liveCam ? stopLiveCamera() : void startLiveCamera(),
								className: cn("mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full transition", liveCam ? "bg-ruby/80 text-white" : "text-white hover:bg-white/5"),
								"aria-label": liveCam ? "Close live camera" : "Live camera with Grok",
								title: "Live camera",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: displayInput,
								onChange: (e) => {
									if (!isRecording) setInput(e.target.value);
								},
								onKeyDown,
								rows: 1,
								maxLength: 2e3,
								placeholder: isRecording ? "Listening… keep talking" : liveActive ? "Live continuous — just speak" : pendingImage ? "Ask about this photo…" : agentMode ? "Ask Agent to research anything..." : "Ask RV Grok",
								className: "max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-2 text-[14px] text-white outline-none placeholder:text-white/55 sm:px-2",
								readOnly: isRecording || liveActive
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleMicPress,
								className: cn("mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full transition", liveActive ? "bg-sky-500 text-white shadow-[0_0_14px_rgba(80,160,255,0.55)]" : "text-muted hover:bg-white/5 hover:text-fg"),
								"aria-label": liveActive ? "Stop live voice" : "Start live voice",
								title: liveActive ? "Stop Live Voice" : "Start Live Voice",
								children: liveActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5 animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !canSend,
								onClick: () => void sendMessage(),
								className: cn("mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border transition", canSend ? "border-sky-300/40 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25" : "border-border text-dim"),
								"aria-label": "Send",
								children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-sky-100" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
							})
						]
					}),
					agentMode && !liveActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto mt-2 flex max-w-2xl items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/15 px-3 py-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-sky-100" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-[11px] font-medium text-sky-100/90",
								children: "Agent Mode · Multi-step RV research with Grok 4.5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggleAgentMode,
								className: "text-[11px] font-bold text-muted transition hover:text-fg",
								children: "Off"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-dim",
						children: liveActive ? "Hands-free Live Voice · mic tap ends session" : waitingToResumeLive ? "Live Voice on · tap mic to listen continuously" : pendingImage ? "Photo attached · send or add a question" : "Mic = Live Voice · Camera = photo analysis"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {
				open: historyOpen,
				sessions,
				onClose: () => setHistoryOpen(false),
				onLoad: (s) => {
					setSessionId(s.id);
					setMessages((s.messages ?? []).map((m) => ({
						...m,
						timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)
					})));
				},
				onDelete: (id) => {
					const next = deleteSession(sessions, id);
					setSessions(next);
					if (sessionId === id) startNewChat();
				},
				onNewChat: startNewChat
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoicePanel, {
				open: voicePanelOpen,
				onClose: () => {
					setVoicePanelOpen(false);
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
				onPreview: handlePreviewVoice,
				previewingId
			})
		]
	});
}
//#endregion
export { RvGrokApp };
