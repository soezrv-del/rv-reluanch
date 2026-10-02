import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVE_VOICE_OUTPUT_GAIN,
  LIVE_VOICE_ROUTE_KEY,
  LIVE_VOICE_SOFT_CLIP,
  liveVoiceRouteOverride,
  nativeShellLeavesMicHardwareOn,
  playbackNeedsSpeakerElement,
  preferIosLoudspeaker,
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
  assert.match(live, /autoGainControl: true/);
  assert.doesNotMatch(live, /new AC\(\{[^}]*sampleRate/);
  assert.match(output, /makeup\.gain\.value = LIVE_VOICE_OUTPUT_GAIN/);
  assert.match(output, /gain\.connect\(clipper\)/);
  assert.match(output, /clipper\.connect\(makeup\)/);
  assert.match(output, /setSpeakingSession/);
  assert.match(realtime, /setSpeakingSession\(closed\)/);
  assert.doesNotMatch(output, /createDynamicsCompressor/);
  assert.match(output, /createMediaStreamDestination/);
  assert.match(output, /playsInline = true/);
  assert.match(output, /audioSession\.type = "play-and-record"|session\.type = "play-and-record"/);
});
