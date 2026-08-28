import {
  DEFAULT_VOICE,
  PCM_SAMPLE_RATE,
  RV_VOICE_INSTRUCTIONS,
  XAI_REALTIME_URL,
  base64ToArrayBuffer,
  fetchEphemeralToken,
  floatTo16BitPCM,
  resampleFloat32,
} from "./voice";

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type RealtimeHandlers = {
  onStatus: (s: RealtimeStatus, detail?: string) => void;
  onUserTranscript: (text: string) => void;
  onAssistantDelta: (text: string) => void;
  onAssistantDone: (text: string) => void;
  onError: (message: string) => void;
  /** Fired when the socket drops unexpectedly (not after intentional stop) */
  onDisconnected?: (reason: string) => void;
};

/**
 * Browser client for xAI Grok Voice Agent (Realtime WebSocket).
 * Auth: ephemeral token from Cloudflare worker → subprotocol xai-client-secret.<token>
 *
 * Continuous hands-free: server VAD + mic muted while Grok is speaking (echo guard).
 */
export class GrokRealtimeSession {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private playCtx: AudioContext | null = null;
  private nextPlayTime = 0;
  private playSources: AudioBufferSourceNode[] = [];
  private assistantText = "";
  private closed = false;
  private intentionalStop = false;
  private suppressMic = false;
  private finishedAssistantOnce = false;
  private handlers: RealtimeHandlers;
  private voiceId: string;
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(handlers: RealtimeHandlers, voiceId = DEFAULT_VOICE) {
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

    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error("WebSocket connect timeout")),
        15000,
      );
      ws.onopen = () => {
        clearTimeout(t);
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(t);
        reject(new Error("WebSocket failed to open"));
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
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
        },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: PCM_SAMPLE_RATE },
          },
          output: {
            format: { type: "audio/pcm", rate: PCM_SAMPLE_RATE },
          },
        },
        modalities: ["text", "audio"],
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
      },
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
      if (!this.closed && !this.intentionalStop) {
        this.handlers.onError("Realtime connection error");
      }
    };

    await this.startMic();
    this.handlers.onStatus(
      "listening",
      "Listening continuously — speak anytime",
    );
  }

  private async startMic() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
      video: false,
    });
    this.mediaStream = stream;

    const ctx = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
    this.audioCtx = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    this.source = source;

    const bufferSize = 4096;
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
    this.processor = processor;

    processor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      if (this.suppressMic) return;

      const input = e.inputBuffer.getChannelData(0);
      const resampled = resampleFloat32(
        input,
        ctx.sampleRate,
        PCM_SAMPLE_RATE,
      );
      const pcm = floatTo16BitPCM(resampled);

      try {
        const b64 = arrayBufferToBase64Safe(pcm);
        this.ws.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: b64,
          }),
        );
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

  private handleMessage(evt: MessageEvent) {
    if (evt.data instanceof ArrayBuffer) {
      this.beginSpeaking();
      void this.enqueuePcmPlayback(evt.data);
      return;
    }
    if (typeof evt.data !== "string") return;

    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(evt.data) as Record<string, unknown>;
    } catch {
      return;
    }

    const type = String(msg.type || "");

    switch (type) {
      case "session.created":
      case "session.updated":
        break;

      case "input_audio_buffer.speech_started":
        this.handlers.onStatus("listening", "Hearing you…");
        break;

      case "input_audio_buffer.speech_stopped":
        this.handlers.onStatus("thinking", "Processing…");
        break;

      case "conversation.item.input_audio_transcription.completed":
      case "conversation.item.input_audio_transcription.updated": {
        const transcript = String(
          (msg as { transcript?: string }).transcript || "",
        );
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
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
          this.handlers.onAssistantDelta(this.assistantText);
        }
        break;
      }

      case "response.audio_transcript.done":
      case "response.output_audio_transcript.done": {
        const t = String(
          (msg as { transcript?: string }).transcript || this.assistantText,
        );
        this.assistantText = t;
        this.emitAssistantDone(t);
        break;
      }

      case "response.text.delta": {
        const delta = String((msg as { delta?: string }).delta || "");
        if (delta) {
          this.assistantText += delta;
          this.handlers.onAssistantDelta(this.assistantText);
        }
        break;
      }

      case "response.text.done": {
        const t = String(
          (msg as { text?: string }).text || this.assistantText,
        );
        this.assistantText = t;
        this.emitAssistantDone(t);
        break;
      }

      case "response.audio.delta":
      case "response.output_audio.delta": {
        this.beginSpeaking();
        const delta = (msg as { delta?: string }).delta;
        if (typeof delta === "string" && delta) {
          void this.enqueuePcmPlayback(base64ToArrayBuffer(delta));
        }
        break;
      }

      case "response.done":
        if (this.assistantText) {
          this.emitAssistantDone(this.assistantText);
        }
        this.scheduleRearm();
        this.assistantText = "";
        this.finishedAssistantOnce = false;
        break;

      case "response.cancelled":
      case "response.cancel":
        // Barge-in acknowledged — stay live, listening
        this.interruptPlayback();
        this.suppressMic = false;
        this.handlers.onStatus(
          "listening",
          "Interrupted — listening… speak or 📷",
        );
        break;

      case "error": {
        const err = msg.error as { message?: string } | string | undefined;
        const message =
          typeof err === "string"
            ? err
            : err?.message || JSON.stringify(msg).slice(0, 200);
        // Cancel/interrupt often surfaces as soft errors — don't kill the session
        if (/cancel|interrupt|no active response/i.test(message)) {
          this.suppressMic = false;
          this.handlers.onStatus(
            "listening",
            "Interrupted — listening… speak or 📷",
          );
          break;
        }
        this.handlers.onError(message);
        this.handlers.onStatus("error", message);
        break;
      }

      default:
        break;
    }
  }

  private emitAssistantDone(text: string) {
    if (this.finishedAssistantOnce) return;
    this.finishedAssistantOnce = true;
    if (text) this.handlers.onAssistantDone(text);
  }

  private beginSpeaking() {
    this.suppressMic = true;
    this.handlers.onStatus("speaking", "RvGrok speaking…");
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
  }

  /** After Grok finishes, wait for audio queue to drain, then open mic again */
  private scheduleRearm() {
    if (this.rearmTimer) clearTimeout(this.rearmTimer);

    const waitMs = (() => {
      if (!this.playCtx || this.playCtx.state === "closed") return 450;
      const remaining = Math.max(
        0,
        (this.nextPlayTime - this.playCtx.currentTime) * 1000,
      );
      return Math.min(Math.max(remaining + 350, 450), 12000);
    })();

    this.handlers.onStatus("speaking", "Finishing reply…");
    this.rearmTimer = setTimeout(() => {
      this.rearmTimer = null;
      if (this.closed || this.intentionalStop) return;
      this.suppressMic = false;
      this.handlers.onStatus(
        "listening",
        "Listening continuously — your turn",
      );
    }, waitMs);
  }

  private async enqueuePcmPlayback(pcm: ArrayBuffer) {
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
      for (let i = 0; i < int16.length; i++) {
        float32[i] = (int16[i] ?? 0) / 0x8000;
      }

      const buffer = ctx.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
      buffer.copyToChannel(float32, 0);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now + 0.02, this.nextPlayTime);
      src.start(startAt);
      this.nextPlayTime = startAt + buffer.duration;
      this.playSources.push(src);
      src.onended = () => {
        this.playSources = this.playSources.filter((s) => s !== src);
      };
    } catch {
      /* ignore playback glitches */
    }
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
    } catch {
      /* ignore */
    }
    this.ws = null;
    this.cleanupMedia(true);
    this.handlers.onStatus("idle");
  }

  /**
   * Clear partial speech + cancel in-flight response so a photo turn
   * is not mixed with leftover audio context.
   */
  prepareForSnapshot(): void {
    const ws = this.ws;
    this.interruptPlayback();
    this.suppressMic = true;
    this.handlers.onStatus("thinking", "Looking at your photo…");
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type: "response.cancel" }));
    } catch {
      /* */
    }
    try {
      ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
    } catch {
      /* */
    }
  }

  /**
   * Path B — native Realtime image (optional). Prefer vision-first inject
   * when accuracy matters — many realtime endpoints ignore image parts.
   */
  sendSnapshot(
    imageDataUrl: string,
    prompt =
      "Look ONLY at the image I just attached. Describe exactly what is in the frame. Do not invent a different RV, floorplan, or exterior scene. If it is a control panel, screen, label, or close-up, say that first.",
  ): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    if (!imageDataUrl.startsWith("data:image/")) return false;

    this.prepareForSnapshot();

    const item = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageDataUrl },
        ],
      },
    };

    try {
      ws.send(JSON.stringify(item));
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions:
              "CRITICAL: Ground your answer ONLY in the attached image. Open with what object/screen/panel/vehicle part is actually visible. Never describe a different coach or exterior if the photo is a close-up panel, label, or interior detail. Short, accurate, under ~25 seconds.",
          },
        }),
      );
      return true;
    } catch {
      this.suppressMic = false;
      return false;
    }
  }

  /**
   * Inject plain text into the live session (vision-first live photo path).
   */
  injectUserNote(
    text: string,
    requestResponse = true,
    responseInstructions?: string,
  ): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    const t = text.trim();
    if (!t) return false;

    this.prepareForSnapshot();

    try {
      ws.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: t }],
          },
        }),
      );
      if (requestResponse) {
        this.suppressMic = true;
        this.handlers.onStatus("thinking", "Photo ready — responding…");
        try {
          ws.send(JSON.stringify({ type: "response.cancel" }));
        } catch {
          /* */
        }
        ws.send(
          JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
              instructions:
                responseInstructions ||
                "Speak only about the camera photo described in the latest user message. Do not invent a different RV or scene.",
            },
          }),
        );
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
  interrupt(): boolean {
    const ws = this.ws;
    const wasLive = Boolean(ws && ws.readyState === WebSocket.OPEN);

    try {
      if (wasLive && ws) {
        ws.send(JSON.stringify({ type: "response.cancel" }));
        ws.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
      }
    } catch {
      /* cancel may error if nothing active — fine */
    }

    // Stop audio WITHOUT closing AudioContext (iOS can't easily resume a new one)
    this.interruptPlayback();
    this.suppressMic = false;
    this.finishedAssistantOnce = false;
    this.assistantText = "";

    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }

    this.handlers.onStatus(
      "listening",
      "Interrupted — listening… speak or 📷",
    );
    return wasLive;
  }

  /**
   * Stop queued PCM. Keep AudioContext alive so later replies still play on iOS.
   */
  private interruptPlayback() {
    if (this.rearmTimer) {
      clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
    }
    for (const src of this.playSources) {
      try {
        src.stop(0);
      } catch {
        /* already stopped */
      }
      try {
        src.disconnect();
      } catch {
        /* */
      }
    }
    this.playSources = [];
    if (this.playCtx && this.playCtx.state !== "closed") {
      this.nextPlayTime = this.playCtx.currentTime;
    } else {
      this.nextPlayTime = 0;
    }
  }

  private cleanupMedia(closePlay: boolean) {
    try {
      this.processor?.disconnect();
    } catch {
      /* ignore */
    }
    try {
      this.source?.disconnect();
    } catch {
      /* ignore */
    }
    this.processor = null;
    this.source = null;

    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.mediaStream = null;

    void this.audioCtx?.close();
    this.audioCtx = null;

    for (const src of this.playSources) {
      try {
        src.stop(0);
      } catch {
        /* */
      }
    }
    this.playSources = [];

    if (closePlay) {
      void this.playCtx?.close();
      this.playCtx = null;
      this.nextPlayTime = 0;
    }
  }
}

function arrayBufferToBase64Safe(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
