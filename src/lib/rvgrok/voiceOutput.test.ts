import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVE_VOICE_LIMITER,
  LIVE_VOICE_OUTPUT_GAIN,
  LIVE_VOICE_SPEAKER_GAIN,
  configureLiveVoiceLimiter,
  playbackNeedsSpeakerElement,
  preferIosLoudspeaker,
} from "./voiceOutput.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("output gain and limiter constants are the playback chain", () => {
  assert.equal(LIVE_VOICE_OUTPUT_GAIN, 2.5);
  assert.equal(LIVE_VOICE_SPEAKER_GAIN, 1);
  assert.ok(LIVE_VOICE_SPEAKER_GAIN <= 1);
  assert.equal(LIVE_VOICE_LIMITER.thresholdDb, -3);
  assert.equal(LIVE_VOICE_LIMITER.kneeDb, 0);
  assert.ok(LIVE_VOICE_LIMITER.ratio >= 12);
  assert.ok(LIVE_VOICE_LIMITER.attackSec > 0 && LIVE_VOICE_LIMITER.attackSec <= 0.01);
  const node = {
    threshold: { value: 0 },
    knee: { value: 30 },
    ratio: { value: 1 },
    attack: { value: 1 },
    release: { value: 1 },
  };
  configureLiveVoiceLimiter(node);
  assert.equal(node.threshold.value, LIVE_VOICE_LIMITER.thresholdDb);
  assert.equal(node.knee.value, LIVE_VOICE_LIMITER.kneeDb);
  assert.equal(node.ratio.value, LIVE_VOICE_LIMITER.ratio);
  assert.equal(node.attack.value, LIVE_VOICE_LIMITER.attackSec);
  assert.equal(node.release.value, LIVE_VOICE_LIMITER.releaseSec);
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

test("playback connects through the gain and the mic mute stays silent", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  const output = readFileSync(join(root, "voiceOutput.ts"), "utf8");
  assert.match(realtime, /const output = liveVoiceOutputFor\(ctx\)/);
  assert.match(realtime, /src\.connect\(output\.gain\)/);
  assert.doesNotMatch(realtime, /src\.connect\(ctx\.destination\)/);
  assert.match(realtime, /mute\.gain\.value = 0/);
  assert.match(realtime, /mute\.connect\(ctx\.destination\)/);
  assert.doesNotMatch(realtime, /mute\.connect\(output/);
  assert.match(live, /preferIosLoudspeaker\(\)/);
  assert.match(live, /liveVoiceOutputFor\(/);
  assert.match(live, /if \(audioCtx\.state === "suspended"\) void audioCtx\.resume\(\)/);
  assert.match(live, /echoCancellation: true/);
  assert.match(live, /noiseSuppression: true/);
  assert.match(live, /autoGainControl: true/);
  assert.match(
    output,
    /gain\.gain\.value = useSpeaker \? LIVE_VOICE_SPEAKER_GAIN : LIVE_VOICE_OUTPUT_GAIN/,
  );
  assert.match(output, /configureLiveVoiceLimiter\(limiter\)/);
  assert.match(output, /gain\.connect\(limiter\)/);
  assert.match(output, /gain\.connect\(dest\)/);
  assert.match(output, /createMediaStreamDestination/);
  assert.match(output, /playsInline = true/);
  assert.match(output, /audio\.volume = LIVE_VOICE_SPEAKER_GAIN/);
  assert.match(output, /audioSession\.type = "play-and-record"|session\.type = "play-and-record"/);
});
