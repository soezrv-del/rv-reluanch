/**
 * Live Voice audio worklets: a jitter-buffered PCM player and a mic capture
 * tap. Both replace main-thread audio work (ScriptProcessorNode, and one
 * AudioBufferSourceNode per server chunk) that underran on phones.
 *
 * Player ("rv-pcm-player"): the main thread posts Float32 samples at the
 * server rate (24 kHz). The audio thread keeps one ring buffer and reads it
 * with a running fractional playhead, so chunk edges are seamless. It
 * resamples to the context rate with cubic (Catmull-Rom) interpolation that
 * carries state across chunks. Playback starts once `prebufferMs` is queued,
 * or once that long has passed with anything queued (short tails still play).
 * On underrun it outputs silence and re-buffers, so a late packet is a clean
 * pause and not a click. A drain only counts as an underrun when more audio
 * arrives within 500 ms (otherwise it was just the end of the reply).
 *
 * Capture ("rv-pcm-capture"): downsamples the mic to 24 kHz on the audio
 * thread (box-filter decimation, stateful) and posts fixed-size chunks.
 *
 * The module loads from a Blob URL: no extra static file, no route or service
 * worker in the way. Without AudioWorklet the callers fall back to the old
 * paths.
 */

export const PCM_PLAYER_PROCESSOR = "rv-pcm-player";
export const PCM_CAPTURE_PROCESSOR = "rv-pcm-capture";

/** Jitter buffer before playback starts / restarts after an underrun. */
export const LIVE_VOICE_PREBUFFER_MS = 150;

/** Plain JS: runs in AudioWorkletGlobalScope (sampleRate, registerProcessor). */
export const PCM_WORKLET_SOURCE = String.raw`
class RvPcmPlayer extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const o = (options && options.processorOptions) || {};
    this.srcRate = o.srcRate || 24000;
    this.step = this.srcRate / sampleRate;
    this.prebuffer = Math.max(1, Math.round(((o.prebufferMs || 150) * this.srcRate) / 1000));
    this.cap = 1 << 18;
    this.buf = new Float32Array(this.cap);
    this.writePos = 0;
    this.readPos = 0;
    this.playing = false;
    this.waited = 0;
    this.underruns = 0;
    this.frames = 0;
    this.drainedAt = -1;
    this.statsEvery = Math.round(sampleRate / 10);
    this.sinceStats = 0;
    this.port.onmessage = (e) => {
      const m = e.data;
      if (!m) return;
      if (m.type === "push" && m.samples) this.push(m.samples);
      else if (m.type === "clear") this.clear();
    };
  }
  push(s) {
    if (this.drainedAt >= 0) {
      if (this.frames - this.drainedAt < sampleRate / 2) {
        this.underruns++;
        this.port.postMessage({ type: "underrun", count: this.underruns });
      }
      this.drainedAt = -1;
    }
    const keepFrom = Math.max(0, Math.floor(this.readPos) - 2);
    const need = this.writePos + s.length - keepFrom;
    if (need > this.cap) {
      let cap = this.cap;
      while (cap < need) cap *= 2;
      const next = new Float32Array(cap);
      for (let i = keepFrom; i < this.writePos; i++) next[i % cap] = this.buf[i % this.cap];
      this.buf = next;
      this.cap = cap;
    }
    for (let i = 0; i < s.length; i++) this.buf[(this.writePos + i) % this.cap] = s[i];
    this.writePos += s.length;
  }
  clear() {
    this.readPos = this.writePos;
    this.playing = false;
    this.waited = 0;
    this.drainedAt = -1;
    this.sendStats();
  }
  available() {
    return this.writePos - this.readPos;
  }
  at(i) {
    if (i < 0) i = 0;
    if (i >= this.writePos) i = this.writePos - 1;
    return this.buf[i % this.cap];
  }
  sendStats() {
    this.sinceStats = 0;
    this.port.postMessage({
      type: "stats",
      bufferedMs: (Math.max(0, this.available()) * 1000) / this.srcRate,
      playing: this.playing,
      underruns: this.underruns,
    });
  }
  process(_inputs, outputs) {
    const out = outputs[0] && outputs[0][0];
    if (!out) return true;
    const n = out.length;
    let i = 0;
    if (!this.playing) {
      const avail = this.available();
      if (avail > 0) this.waited += n * this.step;
      if (avail >= this.prebuffer || (avail > 0 && this.waited >= this.prebuffer)) {
        this.playing = true;
        this.waited = 0;
      }
    }
    if (this.playing) {
      for (; i < n; i++) {
        const idx = Math.floor(this.readPos);
        if (idx >= this.writePos) {
          // Ran dry: stop at a sample edge and re-buffer.
          this.playing = false;
          this.waited = 0;
          this.readPos = this.writePos;
          this.drainedAt = this.frames + i;
          break;
        }
        const t = this.readPos - idx;
        const y0 = this.at(idx - 1);
        const y1 = this.buf[idx % this.cap];
        const y2 = idx + 1 < this.writePos ? this.buf[(idx + 1) % this.cap] : y1;
        const y3 = idx + 2 < this.writePos ? this.buf[(idx + 2) % this.cap] : y2;
        const a = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
        const b = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
        const c = -0.5 * y0 + 0.5 * y2;
        out[i] = ((a * t + b) * t + c) * t + y1;
        this.readPos += this.step;
      }
      if (this.readPos > this.writePos) this.readPos = this.writePos;
    }
    for (; i < n; i++) out[i] = 0;
    for (let ch = 1; ch < outputs[0].length; ch++) outputs[0][ch].set(out);
    this.frames += n;
    this.sinceStats += n;
    if (this.sinceStats >= this.statsEvery) this.sendStats();
    return true;
  }
}

class RvPcmCapture extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const o = (options && options.processorOptions) || {};
    this.dstRate = o.dstRate || 24000;
    this.ratio = sampleRate / this.dstRate;
    this.chunk = Math.max(128, Math.round(((o.chunkMs || 80) * this.dstRate) / 1000));
    this.out = new Float32Array(this.chunk);
    this.fill = 0;
    this.acc = 0;
    this.count = 0;
    this.phase = 0;
    this.prev = 0;
  }
  emit(v) {
    this.out[this.fill++] = v;
    if (this.fill === this.chunk) {
      const ready = this.out;
      this.port.postMessage(ready, [ready.buffer]);
      this.out = new Float32Array(this.chunk);
      this.fill = 0;
    }
  }
  process(inputs, outputs) {
    const input = inputs[0] && inputs[0][0];
    const o = outputs[0] && outputs[0][0];
    if (o) o.fill(0);
    if (!input) return true;
    if (this.ratio >= 1) {
      // Decimate: average the input samples that fall in each output slot.
      for (let i = 0; i < input.length; i++) {
        this.acc += input[i];
        this.count++;
        this.phase += 1;
        if (this.phase >= this.ratio) {
          this.phase -= this.ratio;
          this.emit(this.acc / this.count);
          this.acc = 0;
          this.count = 0;
        }
      }
    } else {
      // Upsample (context slower than 24 kHz): stateful linear interpolation.
      for (let i = 0; i < input.length; i++) {
        const x = input[i];
        while (this.phase < 1) {
          this.emit(this.prev + (x - this.prev) * this.phase);
          this.phase += this.ratio;
        }
        this.phase -= 1;
        this.prev = x;
      }
    }
    return true;
  }
}

registerProcessor("${PCM_PLAYER_PROCESSOR}", RvPcmPlayer);
registerProcessor("${PCM_CAPTURE_PROCESSOR}", RvPcmCapture);
`;

const loaded = new WeakMap<BaseAudioContext, Promise<boolean>>();

/**
 * iOS before 16.4 distorts every Web Audio node once an AudioWorklet runs
 * during getUserMedia (WebKit bug 251091, fixed by WebKit PR #9711). Those
 * devices keep the buffer-source fallback.
 */
export function workletSafeForUa(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  const m = /(?:iPhone|iPad|iPod|CPU) OS (\d+)_(\d+)/.exec(ua);
  if (!m) return true;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return major > 16 || (major === 16 && minor >= 4);
}

/** True when this browser can host the worklets at all. */
export function hasAudioWorklet(ctx: BaseAudioContext | null): boolean {
  return (
    !!ctx &&
    typeof (ctx as { audioWorklet?: unknown }).audioWorklet === "object" &&
    typeof AudioWorkletNode !== "undefined"
  );
}

/**
 * Load the Live Voice worklets once per context. Resolves false (never
 * throws) when AudioWorklet is missing or the module is refused, so callers
 * can use the fallback path.
 */
export function ensurePcmWorklet(ctx: BaseAudioContext | null): Promise<boolean> {
  if (!ctx || !hasAudioWorklet(ctx) || !workletSafeForUa()) {
    return Promise.resolve(false);
  }
  const existing = loaded.get(ctx);
  if (existing) return existing;
  const p = (async () => {
    let url = "";
    try {
      url = URL.createObjectURL(
        new Blob([PCM_WORKLET_SOURCE], { type: "application/javascript" }),
      );
      await ctx.audioWorklet.addModule(url);
      return true;
    } catch (e) {
      console.warn("[LiveVoice] AudioWorklet unavailable, using fallback", e);
      return false;
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  })();
  loaded.set(ctx, p);
  return p;
}

/** PCM16 little-endian → Float32 in [-1, 1). */
export function pcm16ToFloat32(pcm: ArrayBuffer): Float32Array {
  const int16 = new Int16Array(pcm, 0, Math.floor(pcm.byteLength / 2));
  const out = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) out[i] = (int16[i] ?? 0) / 0x8000;
  return out;
}

export interface LivePcmPlayer {
  readonly kind: "worklet" | "buffer-source";
  /** Queue Float32 samples at the server PCM rate. */
  push(samples: Float32Array): void;
  /** Drop everything queued (barge-in). */
  clear(): void;
  /** Seconds of queued audio not yet heard (estimate). */
  remainingSec(): number;
  /** Underruns since creation. */
  underruns(): number;
  dispose(): void;
}

/** AudioWorklet ring-buffer player. Call only after ensurePcmWorklet → true. */
export function createWorkletPlayer(
  ctx: AudioContext,
  dest: AudioNode,
  srcRate: number,
  prebufferMs = LIVE_VOICE_PREBUFFER_MS,
): LivePcmPlayer {
  const node = new AudioWorkletNode(ctx, PCM_PLAYER_PROCESSOR, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    processorOptions: { srcRate, prebufferMs },
  });
  node.connect(dest);
  let endAt = 0;
  let underruns = 0;
  node.port.onmessage = (e: MessageEvent) => {
    const m = e.data as {
      type?: string;
      bufferedMs?: number;
      playing?: boolean;
      count?: number;
    };
    if (m?.type === "stats" && typeof m.bufferedMs === "number") {
      const wait = m.playing || m.bufferedMs === 0 ? 0 : prebufferMs / 1000;
      const fromStats = ctx.currentTime + m.bufferedMs / 1000 + wait;
      // A late stats note must not shorten the queue. That was opening the
      // mic, dropping the loudspeaker, and leaving the rest of a long
      // answer quiet.
      if (fromStats > endAt) endAt = fromStats;
    } else if (m?.type === "underrun") {
      underruns = m.count ?? underruns + 1;
      console.warn(`[LiveVoice] playback underrun #${underruns} (re-buffering)`);
    }
  };
  return {
    kind: "worklet",
    push(samples) {
      if (!samples.length) return;
      const now = ctx.currentTime;
      endAt = Math.max(endAt, now + prebufferMs / 1000) + samples.length / srcRate;
      node.port.postMessage({ type: "push", samples }, [samples.buffer]);
    },
    clear() {
      endAt = 0;
      node.port.postMessage({ type: "clear" });
    },
    remainingSec() {
      return Math.max(0, endAt - ctx.currentTime);
    },
    underruns: () => underruns,
    dispose() {
      node.port.onmessage = null;
      try {
        node.port.postMessage({ type: "clear" });
        node.disconnect();
      } catch {
        /* already gone */
      }
    },
  };
}

/**
 * Fallback without AudioWorklet: one AudioBufferSourceNode per chunk, but
 * buffers are created at the server rate (the browser's resampler, not a
 * per-chunk linear one) and scheduled on a running playhead that starts
 * `prebufferMs` ahead whenever the queue had drained.
 */
export function createBufferSourcePlayer(
  ctx: AudioContext,
  dest: AudioNode,
  srcRate: number,
  prebufferMs = LIVE_VOICE_PREBUFFER_MS,
): LivePcmPlayer {
  let playhead = 0;
  let underruns = 0;
  let started = false;
  let sources: AudioBufferSourceNode[] = [];
  return {
    kind: "buffer-source",
    push(samples) {
      if (!samples.length) return;
      let buffer: AudioBuffer;
      try {
        buffer = ctx.createBuffer(1, samples.length, srcRate);
      } catch {
        return;
      }
      buffer.getChannelData(0).set(samples);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      const now = ctx.currentTime;
      if (playhead < now + 0.005) {
        // Ran dry less than 500 ms ago = a mid-reply re-buffer.
        if (started && playhead > 0 && now - playhead < 0.5) underruns++;
        playhead = now + prebufferMs / 1000;
      }
      started = true;
      src.start(playhead);
      playhead += samples.length / srcRate;
      sources.push(src);
      src.onended = () => {
        sources = sources.filter((s) => s !== src);
      };
    },
    clear() {
      for (const s of sources) {
        try {
          s.stop(0);
          s.disconnect();
        } catch {
          /* already stopped */
        }
      }
      sources = [];
      playhead = 0;
    },
    remainingSec() {
      return Math.max(0, playhead - ctx.currentTime);
    },
    underruns: () => underruns,
    dispose() {
      this.clear();
    },
  };
}
