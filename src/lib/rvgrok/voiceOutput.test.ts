import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVE_VOICE_OUTPUT_GAIN,
  LIVE_VOICE_DEBUG_KEY,
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
import {
  LIVE_VOICE_EC_KEY,
  liveVoiceEchoCancelEnabled,
  liveVoiceMicConstraints,
  logLiveVoiceMic,
} from "./liveVoice.ts";

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
  // realtime.ts fallback uses the shared helper; its default is MIC_CONSTRAINTS.
  assert.match(realtime, /getUserMedia\(micConstraints\)/);
  assert.match(realtime, /const micConstraints = liveVoiceMicConstraints\(\)/);
  assert.doesNotMatch(realtime, /autoGainControl: (true|false)/);
  assert.match(live, /getUserMedia\(constraints\)/);
  assert.match(live, /const constraints = liveVoiceMicConstraints\(\)/);
  assert.doesNotMatch(live, /new AC\(\{[^}]*sampleRate/);
  assert.match(output, /makeup\.gain\.value = LIVE_VOICE_OUTPUT_GAIN/);
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


// Exactly what main sent from both getUserMedia sites before ?lvec existed.
const MAIN_MIC_CONSTRAINTS = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  },
  video: false,
};

test("default mic constraints are exactly main's (lvec off)", () => {
  const c = liveVoiceMicConstraints(false);
  assert.deepEqual(c, MAIN_MIC_CONSTRAINTS);
  assert.equal(JSON.stringify(c), JSON.stringify(MAIN_MIC_CONSTRAINTS), "same keys, same order");
  // Default argument with no location/localStorage (node) is also off.
  assert.deepEqual(liveVoiceMicConstraints(), MAIN_MIC_CONSTRAINTS);
  assert.equal(liveVoiceMicConstraints(false), liveVoiceMicConstraints(false), "the same object every call");
});

test("lvec=1 turns all three iOS voice processors on, nothing else", () => {
  const c = liveVoiceMicConstraints(true);
  assert.deepEqual(c, {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
    video: false,
  });
  // Turning it on never mutates the default object.
  assert.deepEqual(liveVoiceMicConstraints(false), MAIN_MIC_CONSTRAINTS);
});

test("lvec parses, persists and clears", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  assert.equal(liveVoiceEchoCancelEnabled("", storage), false);
  assert.equal(liveVoiceEchoCancelEnabled("?lvec=1", storage), true);
  assert.equal(store.get(LIVE_VOICE_EC_KEY), "1");
  assert.equal(liveVoiceEchoCancelEnabled("", storage), true, "persists");
  assert.equal(liveVoiceEchoCancelEnabled("?lvec=yes", storage), true, "junk keeps stored");
  assert.equal(liveVoiceEchoCancelEnabled("?lvec=0", storage), false);
  assert.equal(store.has(LIVE_VOICE_EC_KEY), false);
  assert.equal(liveVoiceEchoCancelEnabled("?a=b&lvec=1", storage), true);
  assert.equal(liveVoiceEchoCancelEnabled("?lvec=auto", storage), false);
  assert.equal(store.has(LIVE_VOICE_EC_KEY), false);
  store.set(LIVE_VOICE_EC_KEY, "true");
  assert.equal(liveVoiceEchoCancelEnabled("", storage), false, "only '1' counts");
  assert.equal(liveVoiceEchoCancelEnabled("?lvec=1", null), true);
  assert.deepEqual(
    liveVoiceMicConstraints(liveVoiceEchoCancelEnabled("?lvec=0", storage)),
    MAIN_MIC_CONSTRAINTS,
  );
});

test("lvdebug logs mic constraints and track settings", () => {
  const logs: string[] = [];
  const orig = console.log;
  console.log = (...a: unknown[]) => void logs.push(a.join(" "));
  try {
    const stream = {
      getAudioTracks: () => [
        { getSettings: () => ({ echoCancellation: true, autoGainControl: true }) },
      ],
    } as unknown as MediaStream;
    logLiveVoiceMic("fallback", liveVoiceMicConstraints(true), stream, false);
    assert.equal(logs.length, 0, "silent when lvdebug is off");
    logLiveVoiceMic("fallback", liveVoiceMicConstraints(true), stream, true);
    logLiveVoiceMic("retained", null, null, true);
    assert.equal(logs.length, 2, "two log lines");
    assert.match(logs[0]!, /\[lvdebug\] mic fallback constraints=\{"echoCancellation":true/);
    assert.match(logs[0]!, /settings=\{"echoCancellation":true,"autoGainControl":true\}/);
    assert.match(logs[1]!, /mic retained constraints=null settings=null/);
  } finally {
    console.log = orig;
  }
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  assert.match(realtime, /logLiveVoiceMic\("retained", null, kept\.stream\)/);
});
