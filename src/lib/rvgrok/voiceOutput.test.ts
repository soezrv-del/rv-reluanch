import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVE_VOICE_OUTPUT_GAIN,
  LIVE_VOICE_DEBUG_KEY,
  LIVE_VOICE_GAIN_KEY,
  LIVE_VOICE_GAIN_PRESETS,
  LIVE_VOICE_IOS_GAIN_LEVEL,
  LIVE_VOICE_PEAK_LIMIT,
  clampGainProfile,
  liveVoiceGainLevel,
  liveVoiceGainOverride,
  liveVoiceGainProfile,
  logLiveVoiceGain,
  LIVE_VOICE_ROUTE_KEY,
  LIVE_VOICE_SOFT_CLIP,
  liveVoiceDebugEnabled,
  liveVoiceOutputFor,
  liveVoiceRouteOverride,
  logLiveVoiceSession,
  nativeShellLeavesMicHardwareOn,
  playbackNeedsSpeakerElement,
  preferIosLoudspeaker,
  setSpeakingSession,
  shouldUseSpeakerElement,
  softClipCurve,
} from "./voiceOutput.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("output gain is a small boost with a soft clipper, not 2.5x into a hard limiter", () => {
  assert.ok(LIVE_VOICE_OUTPUT_GAIN > 1 && LIVE_VOICE_OUTPUT_GAIN <= 2);
  assert.ok(LIVE_VOICE_SOFT_CLIP.ceiling * LIVE_VOICE_OUTPUT_GAIN < 1);
  const curve = softClipCurve();
  assert.equal(curve.length, LIVE_VOICE_SOFT_CLIP.points);
  const at = (x: number) => curve[Math.round(((x + 1) / 2) * (curve.length - 1))]!;
  // Linear (unity) below the knee.
  assert.ok(Math.abs(at(0.2) - 0.2) < 0.002);
  assert.ok(Math.abs(at(-0.2) + 0.2) < 0.002);
  // Never reaches full scale, even at the boosted peak.
  assert.ok(curve[curve.length - 1]! < LIVE_VOICE_SOFT_CLIP.ceiling);
  assert.ok(curve[0]! > -LIVE_VOICE_SOFT_CLIP.ceiling);
  // Monotonic and smooth: no step bigger than a linear slope would make.
  const step = 2 / (curve.length - 1);
  for (let i = 1; i < curve.length; i++) {
    const d = curve[i]! - curve[i - 1]!;
    assert.ok(d >= 0 && d <= step + 1e-6, `curve step ${i}`);
  }
});

test("lvroute override persists and defaults to the device rule", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  assert.equal(liveVoiceRouteOverride("", storage), "auto");
  assert.equal(liveVoiceRouteOverride("?lvroute=destination", storage), "destination");
  assert.equal(store.get(LIVE_VOICE_ROUTE_KEY), "destination");
  assert.equal(liveVoiceRouteOverride("", storage), "destination");
  assert.equal(liveVoiceRouteOverride("?lvroute=bogus", storage), "destination");
  assert.equal(liveVoiceRouteOverride("?lvroute=auto", storage), "auto");
  assert.equal(store.has(LIVE_VOICE_ROUTE_KEY), false);
  assert.equal(shouldUseSpeakerElement("auto", true), true);
  assert.equal(shouldUseSpeakerElement("auto", false), false);
  assert.equal(shouldUseSpeakerElement("destination", true), false);
  assert.equal(shouldUseSpeakerElement("element", false), true);
});

test("iOS uses the speaker element; play-and-record is set when the session exists", () => {
  assert.equal(
    playbackNeedsSpeakerElement(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      "iPhone",
      5,
    ),
    true,
  );
  assert.equal(
    playbackNeedsSpeakerElement("Mozilla/5.0 (Macintosh)", "MacIntel", 5),
    true,
  );
  assert.equal(
    playbackNeedsSpeakerElement(
      "Mozilla/5.0 (Windows NT 10.0; Win64)",
      "Win32",
      0,
    ),
    false,
  );
  const session = { type: "auto" };
  assert.equal(
    preferIosLoudspeaker({ audioSession: session } as unknown as Navigator),
    true,
  );
  assert.equal(session.type, "play-and-record");
  assert.equal(preferIosLoudspeaker({} as Navigator), false);
});

test("speaking uses playback volume, then play-and-record when the mic opens", () => {
  const session = { type: "play-and-record" };
  const nav = { audioSession: session } as unknown as Navigator;
  setSpeakingSession(true, nav);
  assert.equal(session.type, "playback");
  setSpeakingSession(true, nav);
  assert.equal(session.type, "playback");
  setSpeakingSession(false, nav);
  assert.equal(session.type, "play-and-record");
  setSpeakingSession(true, {} as Navigator);
  assert.equal(session.type, "play-and-record");
});

test("the native shell does not flip the mic hardware", () => {
  assert.equal(nativeShellLeavesMicHardwareOn(null), false);
  assert.equal(nativeShellLeavesMicHardwareOn({}), false);
  assert.equal(
    nativeShellLeavesMicHardwareOn({ isNativePlatform: () => false }),
    false,
  );
  assert.equal(
    nativeShellLeavesMicHardwareOn({ isNativePlatform: () => true }),
    true,
  );
  assert.equal(
    nativeShellLeavesMicHardwareOn({
      isNativePlatform: () => {
        throw new Error("bridge down");
      },
    }),
    false,
  );
});

test("playback goes through the jitter-buffered player and the output gain", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  const output = readFileSync(join(root, "voiceOutput.ts"), "utf8");
  assert.match(realtime, /const output = liveVoiceOutputFor\(ctx\)/);
  assert.match(realtime, /createWorkletPlayer\(ctx, output\.gain, PCM_SAMPLE_RATE\)/);
  assert.match(realtime, /createBufferSourcePlayer\(ctx, output\.gain, PCM_SAMPLE_RATE\)/);
  assert.doesNotMatch(realtime, /resampleFloat32\(float32, PCM_SAMPLE_RATE, ctx\.sampleRate\)/);
  // Capture: worklet first, ScriptProcessor only as the fallback.
  assert.match(realtime, /new AudioWorkletNode\(ctx, PCM_CAPTURE_PROCESSOR/);
  assert.match(realtime, /if \(useWorklet\)/);
  assert.match(realtime, /mute\.gain\.value = 0/);
  assert.match(realtime, /mute\.connect\(output\.pull\)/);
  assert.doesNotMatch(realtime, /mute\.connect\(ctx\.destination\)/);
  assert.match(realtime, /setMicGate\(true\)/);
  assert.match(realtime, /nativeShellLeavesMicHardwareOn\(\)/);
  assert.match(realtime, /track\.enabled = !closed/);
  assert.doesNotMatch(realtime, /mute\.connect\(sink\)/);
  assert.match(realtime, /this\.player\?\.clear\(\)/);
  assert.match(live, /preferIosLoudspeaker\(\)/);
  assert.match(live, /liveVoiceOutputFor\(/);
  assert.match(live, /void ensurePcmWorklet\(audioCtx\)/);
  assert.match(live, /if \(audioCtx\.state === "suspended"\) void audioCtx\.resume\(\)/);
  assert.match(live, /echoCancellation: false/);
  assert.match(live, /noiseSuppression: false/);
  assert.match(live, /autoGainControl: false/);
  assert.doesNotMatch(live, /autoGainControl: true/);
  assert.match(realtime, /autoGainControl: false/);
  assert.doesNotMatch(realtime, /autoGainControl: true/);
  assert.doesNotMatch(live, /new AC\(\{[^}]*sampleRate/);
  assert.match(output, /makeup\.gain\.value = profile\.makeup/);
  assert.match(output, /liveVoiceGainProfile\(gainLevel\)/);
  assert.equal(LIVE_VOICE_OUTPUT_GAIN, 2);
  assert.match(output, /gain\.connect\(clipper\)/);
  assert.match(output, /clipper\.connect\(makeup\)/);
  assert.match(output, /setSpeakingSession/);
  assert.match(realtime, /setSpeakingSession\(closed\)/);
  assert.doesNotMatch(output, /createDynamicsCompressor/);
  // The gate still calls setSpeakingSession before the native return
  // (it no-ops inside for the shell). Only the hardware track flip stays
  // behind the native return. Mic logic is unchanged.
  const gateStart = realtime.indexOf("private setMicGate");
  const gateEnd = realtime.indexOf("private beginSpeaking");
  const gate = realtime.slice(gateStart, gateEnd);
  const leave = gate.indexOf("if (nativeShellLeavesMicHardwareOn()) return;");
  const flipTrack = gate.indexOf("track.enabled = !closed");
  const flipSession = gate.indexOf("setSpeakingSession(closed)");
  assert.ok(flipSession !== -1 && flipSession < leave && leave < flipTrack);
  assert.match(output, /createMediaStreamDestination/);
  assert.match(output, /playsInline = true/);
  assert.match(output, /audioSession\.type = "play-and-record"|session\.type = "play-and-record"/);
});

test("native shell: no web audio-session writes (AppDelegate owns the session)", () => {
  const session = { type: "play-and-record" };
  const nav = { audioSession: session } as unknown as Navigator;
  setSpeakingSession(true, nav, true);
  assert.equal(session.type, "play-and-record");
  setSpeakingSession(false, nav, true);
  assert.equal(session.type, "play-and-record");
  session.type = "auto";
  assert.equal(preferIosLoudspeaker(nav, true), false);
  assert.equal(session.type, "auto");
  // Safari (not native) still flips.
  session.type = "play-and-record";
  setSpeakingSession(true, nav, false);
  assert.equal(session.type, "playback");
  setSpeakingSession(false, nav, false);
  assert.equal(session.type, "play-and-record");
  session.type = "auto";
  assert.equal(preferIosLoudspeaker(nav, false), true);
  assert.equal(session.type, "play-and-record");
});

test("native shell detection is the default for the session writers", () => {
  const g = globalThis as { window?: unknown };
  const hadWindow = "window" in g;
  const prev = g.window;
  const session = { type: "play-and-record" };
  const nav = { audioSession: session } as unknown as Navigator;
  try {
    g.window = { Capacitor: { isNativePlatform: () => true } };
    setSpeakingSession(true, nav);
    assert.equal(session.type, "play-and-record");
    session.type = "auto";
    assert.equal(preferIosLoudspeaker(nav), false);
    assert.equal(session.type, "auto");
    g.window = { Capacitor: { isNativePlatform: () => false } };
    session.type = "play-and-record";
    setSpeakingSession(true, nav);
    assert.equal(session.type, "playback");
  } finally {
    if (hadWindow) g.window = prev;
    else delete g.window;
  }
});

function fakeAudioContext() {
  const node = () => ({ connect: () => {}, disconnect: () => {} });
  return {
    destination: node(),
    createGain: () => ({ ...node(), gain: { value: 1 } }),
    createWaveShaper: () => ({ ...node(), curve: null, oversample: "none" }),
    createMediaStreamDestination: () => ({ ...node(), stream: {} }),
  } as unknown as AudioContext;
}

test("building the output chain mid-reply does not force play-and-record", () => {
  const g = globalThis as { navigator?: unknown };
  const desc = Object.getOwnPropertyDescriptor(g, "navigator");
  const session = { type: "playback" };
  try {
    Object.defineProperty(g, "navigator", {
      value: { audioSession: session, userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5 },
      configurable: true,
      writable: true,
    });
    const chain = liveVoiceOutputFor(fakeAudioContext());
    assert.ok(chain.gain);
    assert.equal(session.type, "playback");
  } finally {
    if (desc) Object.defineProperty(g, "navigator", desc);
    else delete g.navigator;
  }
  const output = readFileSync(join(root, "voiceOutput.ts"), "utf8");
  const start = output.indexOf("export function liveVoiceOutputFor");
  const end = output.indexOf("export function releaseLiveVoiceOutput");
  assert.doesNotMatch(output.slice(start, end), /preferIosLoudspeaker\(|setSpeakingSession\(|\.type =/);
});

test("lvdebug flag persists and only logs when on", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  assert.equal(liveVoiceDebugEnabled("", storage), false);
  assert.equal(liveVoiceDebugEnabled("?lvdebug=1", storage), true);
  assert.equal(store.get(LIVE_VOICE_DEBUG_KEY), "1");
  assert.equal(liveVoiceDebugEnabled("", storage), true);
  assert.equal(liveVoiceDebugEnabled("?lvdebug=0", storage), false);
  assert.equal(liveVoiceDebugEnabled("", storage), false);

  const logs: string[] = [];
  const orig = console.log;
  console.log = (...a: unknown[]) => void logs.push(a.join(" "));
  try {
    const nav = { audioSession: { type: "playback" } } as unknown as Navigator;
    logLiveVoiceSession("beginSpeaking", nav, false);
    assert.equal(logs.length, 0);
    logLiveVoiceSession("beginSpeaking", nav, true);
    assert.equal(logs.length, 1);
    assert.match(logs[0]!, /\[lvdebug\] beginSpeaking audioSession\.type=playback/);
  } finally {
    console.log = orig;
  }
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  assert.match(realtime, /logLiveVoiceSession\("beginSpeaking"\)/);
  assert.match(realtime, /logLiveVoiceSession\("rearm"\)/);
});


function memStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

test("loudness preset: iOS gets the louder default, everyone else unchanged", () => {
  assert.equal(LIVE_VOICE_IOS_GAIN_LEVEL, "2");
  assert.equal(liveVoiceGainLevel("auto", true), "2");
  assert.equal(liveVoiceGainLevel("auto", false), "off");
  assert.equal(liveVoiceGainLevel("3", false), "3");
  assert.equal(liveVoiceGainLevel("off", true), "off");
  // Platform detection feeds the default (iPhone, iPadOS desktop UA, Windows).
  const iphone = playbackNeedsSpeakerElement("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "iPhone", 5);
  const ipad = playbackNeedsSpeakerElement("Mozilla/5.0 (Macintosh)", "MacIntel", 5);
  const win = playbackNeedsSpeakerElement("Mozilla/5.0 (Windows NT 10.0)", "Win32", 0);
  assert.equal(liveVoiceGainLevel("auto", iphone), "2");
  assert.equal(liveVoiceGainLevel("auto", ipad), "2");
  assert.equal(liveVoiceGainLevel("auto", win), "off");
  // Non-iOS profile is exactly the pre-boost chain.
  const off = liveVoiceGainProfile(liveVoiceGainLevel("auto", false));
  assert.deepEqual(off, {
    makeup: LIVE_VOICE_OUTPUT_GAIN,
    kneeStart: LIVE_VOICE_SOFT_CLIP.kneeStart,
    ceiling: LIVE_VOICE_SOFT_CLIP.ceiling,
  });
  assert.equal(off.makeup, 2);
  assert.equal(off.ceiling, 0.49);
  assert.equal(off.kneeStart, 0.4);
  // iOS default is actually louder below the knee.
  const ios = liveVoiceGainProfile("2");
  assert.ok(ios.makeup >= off.makeup * 2.8, "about +9 dB of linear gain below the knee");
  assert.ok(ios.makeup * ios.ceiling < 1);
});

test("lvgain override parses, persists and resets", () => {
  const s = memStorage();
  assert.equal(liveVoiceGainOverride("", s), "auto");
  assert.equal(liveVoiceGainOverride("?lvgain=3", s), "3");
  assert.equal(s.store.get(LIVE_VOICE_GAIN_KEY), "3");
  assert.equal(liveVoiceGainOverride("", s), "3");
  assert.equal(liveVoiceGainOverride("?lvgain=bogus", s), "3");
  assert.equal(liveVoiceGainOverride("?lvgain=9", s), "3");
  assert.equal(liveVoiceGainOverride("?lvgain=off", s), "off");
  assert.equal(liveVoiceGainOverride("?x=1&lvgain=1", s), "1");
  assert.equal(liveVoiceGainOverride("?lvgain=auto", s), "auto");
  assert.equal(s.store.has(LIVE_VOICE_GAIN_KEY), false);
  s.store.set(LIVE_VOICE_GAIN_KEY, "junk");
  assert.equal(liveVoiceGainOverride("", s), "auto");
  assert.equal(liveVoiceGainOverride("?lvgain=2", null), "2");
});

test("every loudness preset is peak-safe and smooth", () => {
  const levels = ["off", "1", "2", "3"] as const;
  let prev = 0;
  for (const level of levels) {
    const raw = LIVE_VOICE_GAIN_PRESETS[level];
    const p = liveVoiceGainProfile(level);
    assert.deepEqual(p, raw, `${level} needs no clamping`);
    assert.ok(p.ceiling * p.makeup < 1, `${level} ceiling x makeup < 1`);
    assert.ok(p.ceiling * p.makeup <= LIVE_VOICE_PEAK_LIMIT + 1e-9, `${level} peak`);
    assert.ok(p.kneeStart > 0 && p.kneeStart < p.ceiling, `${level} knee`);
    assert.ok(p.makeup > prev, `${level} louder than the one before`);
    prev = p.makeup;
    const curve = softClipCurve(LIVE_VOICE_SOFT_CLIP.points, p.kneeStart, p.ceiling);
    const step = 2 / (curve.length - 1);
    let maxOut = 0;
    for (let i = 1; i < curve.length; i++) {
      const d = curve[i]! - curve[i - 1]!;
      assert.ok(d >= 0 && d <= step + 1e-6, `${level} step ${i}`);
      maxOut = Math.max(maxOut, Math.abs(curve[i]! * p.makeup));
    }
    assert.ok(maxOut < LIVE_VOICE_PEAK_LIMIT, `${level} full-scale input stays under the limit`);
  }
});

test("clampGainProfile keeps any profile under full scale", () => {
  const hot = clampGainProfile({ makeup: 10, kneeStart: 0.5, ceiling: 0.3 });
  assert.ok(hot.makeup * hot.ceiling <= LIVE_VOICE_PEAK_LIMIT + 1e-9);
  assert.ok(hot.kneeStart < hot.ceiling);
  const big = clampGainProfile({ makeup: 1, kneeStart: 0.9, ceiling: 3 });
  assert.ok(big.ceiling <= 1 && big.makeup * big.ceiling <= LIVE_VOICE_PEAK_LIMIT + 1e-9);
  assert.deepEqual(clampGainProfile({ makeup: NaN, kneeStart: 0.1, ceiling: 0.2 }), LIVE_VOICE_GAIN_PRESETS.off);
  assert.deepEqual(clampGainProfile({ makeup: 2, kneeStart: 0, ceiling: 0.2 }), LIVE_VOICE_GAIN_PRESETS.off);
});

test("lvdebug logs the active loudness preset", () => {
  const logs: string[] = [];
  const orig = console.log;
  console.log = (...a: unknown[]) => void logs.push(a.join(" "));
  try {
    logLiveVoiceGain("2", liveVoiceGainProfile("2"), false);
    assert.equal(logs.length, 0);
    logLiveVoiceGain("2", liveVoiceGainProfile("2"), true);
    assert.equal(logs.length, 1);
    assert.match(logs[0]!, /\[lvdebug\] lvgain=2 makeup=6 knee=0\.13 ceiling=0\.163 peak=0\.978/);
  } finally {
    console.log = orig;
  }
});

test("the output chain is built with the selected preset", () => {
  const g = globalThis as { navigator?: unknown };
  const desc = Object.getOwnPropertyDescriptor(g, "navigator");
  const made: { gain: { value: number } }[] = [];
  let curve: Float32Array | null = null;
  const node = () => ({ connect: () => {}, disconnect: () => {} });
  const ctx = {
    destination: node(),
    createGain: () => {
      const n = { ...node(), gain: { value: 1 } };
      made.push(n);
      return n;
    },
    createWaveShaper: () => {
      const n = { ...node(), oversample: "none" } as unknown as { curve: Float32Array | null };
      Object.defineProperty(n, "curve", { set: (c) => void (curve = c), get: () => curve });
      return n;
    },
  } as unknown as AudioContext;
  try {
    Object.defineProperty(g, "navigator", {
      value: { userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5 },
      configurable: true,
      writable: true,
    });
    const chain = liveVoiceOutputFor(ctx);
    assert.equal(chain.gainLevel, "2");
    const p = liveVoiceGainProfile("2");
    assert.equal(made[1]!.gain.value, p.makeup);
    assert.ok(curve, "curve set");
    const c = curve as unknown as Float32Array;
    const top = c[c.length - 1]!;
    assert.ok(top <= p.ceiling + 1e-6 && top > p.kneeStart, `curve top ${top}`);
    assert.ok(top * p.makeup < 1, "peak under full scale");
  } finally {
    if (desc) Object.defineProperty(g, "navigator", desc);
    else delete g.navigator;
  }
});
