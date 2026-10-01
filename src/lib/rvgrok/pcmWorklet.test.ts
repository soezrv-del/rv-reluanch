import assert from "node:assert/strict";
import test from "node:test";
import {
  PCM_CAPTURE_PROCESSOR,
  PCM_PLAYER_PROCESSOR,
  PCM_WORKLET_SOURCE,
  pcm16ToFloat32,
  workletSafeForUa,
} from "./pcmWorklet.ts";

type Port = { posted: unknown[]; postMessage(m: unknown): void; onmessage: ((e: { data: unknown }) => void) | null };
type Proc = { port: Port; process(i: Float32Array[][], o: Float32Array[][]): boolean };

/** Load the worklet source in a fake AudioWorkletGlobalScope. */
function loadWorklet(rate: number) {
  const registry = new Map<string, new (o: unknown) => Proc>();
  class FakeProcessor {
    port: Port = {
      posted: [],
      postMessage(m: unknown) {
        this.posted.push(m);
      },
      onmessage: null,
    };
  }
  new Function("AudioWorkletProcessor", "registerProcessor", "sampleRate", PCM_WORKLET_SOURCE)(
    FakeProcessor,
    (name: string, cls: new (o: unknown) => Proc) => registry.set(name, cls),
    rate,
  );
  return registry;
}

function player(rate: number, prebufferMs = 150) {
  const Cls = loadWorklet(rate).get(PCM_PLAYER_PROCESSOR)!;
  const p = new Cls({ processorOptions: { srcRate: 24000, prebufferMs } });
  const push = (samples: Float32Array) => p.port.onmessage!({ data: { type: "push", samples } });
  const render = (frames: number) => {
    const out: number[] = [];
    for (let done = 0; done < frames; done += 128) {
      const o = [[new Float32Array(128)]];
      p.process([], o);
      out.push(...o[0]![0]!);
    }
    return Float32Array.from(out);
  };
  return { p, push, render };
}

const sine = (n: number, hz: number, rate: number, from = 0) =>
  Float32Array.from({ length: n }, (_, i) => 0.5 * Math.sin((2 * Math.PI * hz * (i + from)) / rate));

test("registers both processors", () => {
  const r = loadWorklet(48000);
  assert.ok(r.has(PCM_PLAYER_PROCESSOR));
  assert.ok(r.has(PCM_CAPTURE_PROCESSOR));
});

test("player waits for the jitter buffer, then plays 20 ms chunks seamlessly at 48 kHz", () => {
  const { push, render } = player(48000, 150);
  const chunk = 480; // 20 ms at 24 kHz
  for (let k = 0; k < 5; k++) push(sine(chunk, 440, 24000, k * chunk)); // 100 ms
  const early = render(1280);
  assert.ok(early.every((v) => v === 0), "silent until 150 ms are queued");
  for (let k = 5; k < 50; k++) push(sine(chunk, 440, 24000, k * chunk)); // 1 s total
  const out = render(48000);
  const start = out.findIndex((v) => v !== 0);
  assert.ok(start >= 0 && start < 256, `starts right away once buffered (${start})`);
  // Continuous across all 20 ms chunk edges: no jump beyond the sine slope.
  const maxSlope = (0.5 * 2 * Math.PI * 440) / 48000;
  let worst = 0;
  for (let i = start + 4; i < start + 40000; i++) worst = Math.max(worst, Math.abs(out[i]! - out[i - 1]!));
  assert.ok(worst <= maxSlope * 1.02, `worst step ${worst} vs ${maxSlope}`);
  // Correct pitch: matches the 48 kHz rendering of the same tone.
  let err = 0;
  for (let i = 2; i < 40000; i++) {
    const want = 0.5 * Math.sin((2 * Math.PI * 440 * (i / 2)) / 24000);
    err = Math.max(err, Math.abs(out[start - 1 + i]! - want)); // start-1 = src sample 0 (a zero)
  }
  assert.ok(err < 0.01, `pitch/phase error ${err}`);
});

test("player resamples to 44.1 kHz with the right duration", () => {
  const { push, render } = player(44100, 100);
  push(sine(24000, 300, 24000));
  const out = render(44100 + 4410 + 2048);
  let last = out.length - 1;
  while (last > 0 && out[last] === 0) last--;
  const first = out.findIndex((v) => v !== 0);
  const played = last - first;
  assert.ok(Math.abs(played - 44100) < 64, `played ${played} frames`);
});

test("underrun goes silent, reports, and re-buffers instead of clicking", () => {
  const { p, push, render } = player(48000, 100);
  push(sine(4800, 200, 24000)); // 200 ms
  render(48000 * 0.3);
  const msgs = p.port.posted as { type: string }[];
  assert.ok(msgs.some((m) => m.type === "underrun"));
  push(sine(480, 200, 24000)); // 20 ms < prebuffer
  const wait = render(48000 * 0.05);
  assert.ok(wait.every((v) => v === 0), "re-buffers before resuming");
  const after = render(48000 * 0.2);
  assert.ok(after.some((v) => v !== 0), "short tail still plays after the wait");
});

test("clear drops queued audio (barge-in)", () => {
  const { p, push, render } = player(48000, 50);
  push(sine(24000, 200, 24000));
  render(4800);
  p.port.onmessage!({ data: { type: "clear" } });
  const out = render(9600);
  assert.ok(out.every((v) => v === 0));
});

function capture(rate: number, seconds: number) {
  const Cls = loadWorklet(rate).get(PCM_CAPTURE_PROCESSOR)!;
  const c = new Cls({ processorOptions: { dstRate: 24000, chunkMs: 80 } });
  const total = Math.round(rate * seconds);
  const src = sine(total, 1000, rate);
  for (let i = 0; i + 128 <= total; i += 128) c.process([[src.subarray(i, i + 128)]], [[new Float32Array(128)]]);
  return c.port.posted as Float32Array[];
}

test("capture downsamples 48 kHz and 44.1 kHz mic to 24 kHz in 80 ms chunks", () => {
  for (const rate of [48000, 44100, 16000]) {
    const chunks = capture(rate, 1);
    assert.ok(chunks.every((c) => c instanceof Float32Array && c.length === 1920));
    const n = chunks.length * 1920;
    assert.ok(n >= 24000 - 1920 - 2 && n <= 24000, `${rate}: ${n} samples`);
    const peak = Math.max(...chunks.flatMap((c) => Array.from(c)).map(Math.abs));
    assert.ok(peak > 0.45 && peak <= 0.5001, `${rate}: peak ${peak}`);
  }
});

test("pcm16ToFloat32 scales to [-1, 1)", () => {
  const pcm = new Int16Array([0, 16384, -32768, 32767]).buffer;
  const f = pcm16ToFloat32(pcm);
  assert.deepEqual(Array.from(f).map((v) => +v.toFixed(4)), [0, 0.5, -1, 1]);
});

test("old iOS (before 16.4) keeps the fallback player", () => {
  assert.equal(workletSafeForUa("Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X)"), false);
  assert.equal(workletSafeForUa("Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X)"), true);
  assert.equal(workletSafeForUa("Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X)"), true);
  assert.equal(workletSafeForUa("Mozilla/5.0 (Linux; Android 15; sdk_gphone64_x86_64)"), true);
});
