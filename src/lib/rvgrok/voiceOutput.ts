/**
 * Live Voice playback chain.
 *
 * Capture already opens one shared AudioContext. Playback used to connect
 * straight to destination at unity gain, so the phone stayed quiet, and
 * iOS play-and-record sends that destination to the earpiece.
 *
 * The chain is: source → output gain → limiter → speaker.
 * On iPhone/iPad the limiter feeds a MediaStream into an <audio playsinline>
 * element, which is the WebKit workaround that keeps the loudspeaker.
 * There is no API that reports earpiece vs speaker, so iOS always takes
 * that path. Other browsers use AudioContext.destination.
 */

/** Boost applied before the limiter. One knob for how loud Live Voice is. */
export const LIVE_VOICE_OUTPUT_GAIN = 2.5;

/**
 * DynamicsCompressor used as a limiter so the boost cannot clip.
 * Threshold near -3 dB, hard knee, high ratio, fast attack.
 */
export const LIVE_VOICE_LIMITER = {
  thresholdDb: -3,
  kneeDb: 0,
  ratio: 20,
  attackSec: 0.003,
  releaseSec: 0.05,
} as const;

export type LimiterAudioParams = {
  threshold: { value: number };
  knee: { value: number };
  ratio: { value: number };
  attack: { value: number };
  release: { value: number };
};

export function configureLiveVoiceLimiter(node: LimiterAudioParams): void {
  node.threshold.value = LIVE_VOICE_LIMITER.thresholdDb;
  node.knee.value = LIVE_VOICE_LIMITER.kneeDb;
  node.ratio.value = LIVE_VOICE_LIMITER.ratio;
  node.attack.value = LIVE_VOICE_LIMITER.attackSec;
  node.release.value = LIVE_VOICE_LIMITER.releaseSec;
}

type AudioSessionLike = { type: string };

function audioSessionOf(nav: Navigator): AudioSessionLike | null {
  const session = (nav as Navigator & { audioSession?: AudioSessionLike })
    .audioSession;
  if (!session || !("type" in session)) return null;
  return session;
}

/**
 * Safari 17+ Audio Session. `play-and-record` is the web equivalent of
 * AVAudioSessionCategoryPlayAndRecord. Returns false when the API is missing.
 */
export function preferIosLoudspeaker(
  nav: Navigator | null = typeof navigator !== "undefined" ? navigator : null,
): boolean {
  if (!nav) return false;
  const session = audioSessionOf(nav);
  if (!session) return false;
  try {
    session.type = "play-and-record";
    return session.type === "play-and-record";
  } catch {
    return false;
  }
}

/**
 * True when Web Audio destination is expected to stay on the earpiece
 * while the mic is open. iOS does not expose the current route.
 */
export function playbackNeedsSpeakerElement(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
  platform: string = typeof navigator !== "undefined" ? navigator.platform : "",
  maxTouchPoints: number = typeof navigator !== "undefined"
    ? navigator.maxTouchPoints
    : 0,
): boolean {
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  return platform === "MacIntel" && maxTouchPoints > 1;
}

export type LiveVoiceOutput = {
  gain: GainNode;
  limiter: DynamicsCompressorNode;
  /** Set only on the iOS loudspeaker workaround. */
  speakerEl: HTMLAudioElement | null;
};

const chains = new WeakMap<AudioContext, LiveVoiceOutput>();

/** Gain node the playback sources must connect to. Idempotent per context. */
export function liveVoiceOutputFor(ctx: AudioContext): LiveVoiceOutput {
  const existing = chains.get(ctx);
  if (existing) {
    void existing.speakerEl?.play().catch(() => {});
    return existing;
  }

  preferIosLoudspeaker();
  const gain = ctx.createGain();
  gain.gain.value = LIVE_VOICE_OUTPUT_GAIN;
  const limiter = ctx.createDynamicsCompressor();
  configureLiveVoiceLimiter(limiter);
  gain.connect(limiter);

  let speakerEl: HTMLAudioElement | null = null;
  if (playbackNeedsSpeakerElement() && typeof document !== "undefined") {
    const dest = ctx.createMediaStreamDestination();
    limiter.connect(dest);
    const audio = document.createElement("audio");
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.playsInline = true;
    audio.autoplay = true;
    audio.setAttribute("data-live-voice-speaker", "");
    audio.style.cssText =
      "position:fixed;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none;";
    audio.srcObject = dest.stream;
    document.body.appendChild(audio);
    void audio.play().catch(() => {});
    speakerEl = audio;
  } else {
    limiter.connect(ctx.destination);
  }

  const chain: LiveVoiceOutput = { gain, limiter, speakerEl };
  chains.set(ctx, chain);
  return chain;
}

export function releaseLiveVoiceOutput(ctx: AudioContext | null): void {
  if (!ctx) return;
  const chain = chains.get(ctx);
  if (!chain) return;
  chains.delete(ctx);
  try {
    chain.gain.disconnect();
  } catch {
    /* already disconnected */
  }
  try {
    chain.limiter.disconnect();
  } catch {
    /* already disconnected */
  }
  if (chain.speakerEl) {
    chain.speakerEl.srcObject = null;
    chain.speakerEl.remove();
  }
}
