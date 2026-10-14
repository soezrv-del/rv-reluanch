/**
 * Live Voice playback chain.
 *
 * Capture already opens one shared AudioContext. Playback used to connect
 * straight to destination at unity gain, so the phone stayed quiet, and
 * iOS play-and-record sends that destination to the earpiece.
 *
 * The chain is: player → output gain → soft clipper → speaker.
 * On iPhone/iPad the clipper feeds a MediaStream into an <audio playsinline>
 * element, which is the WebKit workaround that keeps the loudspeaker (PR
 * #536). There is no API that reports earpiece vs speaker, so iOS takes that
 * path by default. Other browsers use AudioContext.destination.
 *
 * Crackle fix: the old chain boosted 2.5x (+8 dB) into a hard-knee 20:1
 * DynamicsCompressor with a 3 ms attack. Server speech already peaks near
 * full scale, so the compressor clamped every loud syllable (fast-attack
 * distortion, pumping) and its lookahead overshoot still clipped. Now the
 * boost is small and a stateless WaveShaper rounds peaks off instead.
 *
 * A/B switch for the iOS route (no redeploy): open the app once with
 * `?lvroute=destination` or `?lvroute=element` (stored in localStorage),
 * `?lvroute=auto` to reset.
 */

/**
 * Makeup after the soft clipper for the `off` preset (non-iOS default).
 * iPhone/iPad use LIVE_VOICE_GAIN_PRESETS[LIVE_VOICE_IOS_GAIN_LEVEL].
 */
export const LIVE_VOICE_OUTPUT_GAIN = 2;

/**
 * Soft clipper runs at unity, then the makeup gain above lifts the
 * quiet parts. Ceiling times the makeup stays under 1, so the speaker
 * is not slammed the way the old 2.5x boost was.
 */
export const LIVE_VOICE_SOFT_CLIP = {
  kneeStart: 0.4,
  ceiling: 0.49,
  points: 2048,
} as const;

/** Output peaks (ceiling x makeup) must stay at or under this. */
export const LIVE_VOICE_PEAK_LIMIT = 0.98;

export type LiveVoiceGainProfile = {
  /** Makeup gain after the clipper (also the gain below the knee). */
  makeup: number;
  /** Input level where the soft knee starts (linear below). */
  kneeStart: number;
  /** Asymptote of the tanh knee (clipper output never reaches it). */
  ceiling: number;
};

export type LiveVoiceGainLevel = "off" | "1" | "2" | "3";

/**
 * Loudness presets. `off` is the pre-boost chain. Each step raises the
 * makeup (gain on everything below the knee, i.e. the body of the
 * speech) and lowers the knee/ceiling so peaks are rounded off by the
 * tanh knee instead of clipping. ceiling x makeup stays under full
 * scale, and knee/ceiling stays ~0.8 like `off`, so the knee is as
 * smooth as today's (slope-continuous, no hard corner).
 *
 * Linear gain below the knee vs `off`, and measured RMS rise on
 * speech-like test audio at -24 / -20 / -16 dBFS RMS input:
 *   off: x2 (pre-boost), knee 0.40,  ceiling 0.49,  peak 0.980
 *   1:   x4 (+6.0 dB),   knee 0.195, ceiling 0.244, peak 0.976  ~ +5.6 / +4.8 / +3.8 dB
 *   2:   x6 (+9.5 dB),   knee 0.13,  ceiling 0.163, peak 0.978  ~ +8.3 / +6.9 / +5.3 dB
 *   3:   x8 (+12.0 dB),  knee 0.098, ceiling 0.122, peak 0.976  ~ +9.9 / +8.1 / +6.2 dB
 * iOS default is 2: about +7-8 dB on normal speech, so she carries at
 * arm's length on the built-in speaker. Loud syllables are rounded off by
 * the tanh knee (slope-continuous), never hard-clipped.
 */
export const LIVE_VOICE_GAIN_PRESETS: Record<LiveVoiceGainLevel, LiveVoiceGainProfile> = {
  off: {
    makeup: LIVE_VOICE_OUTPUT_GAIN,
    kneeStart: LIVE_VOICE_SOFT_CLIP.kneeStart,
    ceiling: LIVE_VOICE_SOFT_CLIP.ceiling,
  },
  "1": { makeup: 4, kneeStart: 0.195, ceiling: 0.244 },
  "2": { makeup: 6, kneeStart: 0.13, ceiling: 0.163 },
  "3": { makeup: 8, kneeStart: 0.098, ceiling: 0.122 },
};

/** iPhone/iPad (Safari and the native shell) get this preset by default. */
export const LIVE_VOICE_IOS_GAIN_LEVEL: LiveVoiceGainLevel = "2";
export const LIVE_VOICE_GAIN_KEY = "rvgrok.liveVoiceGain";

function isGainLevel(v: string | null): v is LiveVoiceGainLevel {
  return v === "off" || v === "1" || v === "2" || v === "3";
}

/**
 * `?lvgain=off|1|2|3` (persisted in localStorage), `?lvgain=auto` resets
 * to the platform default. No redeploy needed for an A/B on the phone.
 */
export function liveVoiceGainOverride(
  search: string = typeof location !== "undefined" ? location.search : "",
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null =
    typeof localStorage !== "undefined" ? localStorage : null,
): LiveVoiceGainLevel | "auto" {
  try {
    const fromUrl = new URLSearchParams(search).get("lvgain");
    if (fromUrl === "auto") {
      storage?.removeItem(LIVE_VOICE_GAIN_KEY);
      return "auto";
    }
    if (isGainLevel(fromUrl)) {
      storage?.setItem(LIVE_VOICE_GAIN_KEY, fromUrl);
      return fromUrl;
    }
    const stored = storage?.getItem(LIVE_VOICE_GAIN_KEY) ?? null;
    return isGainLevel(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

/** Override wins; otherwise iOS gets the louder preset, everyone else `off`. */
export function liveVoiceGainLevel(
  override: LiveVoiceGainLevel | "auto" = liveVoiceGainOverride(),
  ios: boolean = playbackNeedsSpeakerElement(),
): LiveVoiceGainLevel {
  if (override !== "auto") return override;
  return ios ? LIVE_VOICE_IOS_GAIN_LEVEL : "off";
}

/** Keep any profile peak-safe: knee under ceiling, ceiling x makeup <= limit. */
export function clampGainProfile(p: LiveVoiceGainProfile): LiveVoiceGainProfile {
  const fallback = LIVE_VOICE_GAIN_PRESETS.off;
  const ok = (n: number) => Number.isFinite(n) && n > 0;
  if (!ok(p.makeup) || !ok(p.ceiling) || !ok(p.kneeStart)) return { ...fallback };
  const ceiling = Math.min(p.ceiling, 1);
  const kneeStart = Math.min(p.kneeStart, ceiling * 0.9);
  const makeup = Math.min(p.makeup, LIVE_VOICE_PEAK_LIMIT / ceiling);
  return { makeup, kneeStart, ceiling };
}

export function liveVoiceGainProfile(
  level: LiveVoiceGainLevel = liveVoiceGainLevel(),
): LiveVoiceGainProfile {
  return clampGainProfile(LIVE_VOICE_GAIN_PRESETS[level] ?? LIVE_VOICE_GAIN_PRESETS.off);
}

/** Transfer curve for the WaveShaperNode (input -1..1 → output). */
export function softClipCurve(
  points: number = LIVE_VOICE_SOFT_CLIP.points,
  kneeStart: number = LIVE_VOICE_SOFT_CLIP.kneeStart,
  ceiling: number = LIVE_VOICE_SOFT_CLIP.ceiling,
) {
  const curve = new Float32Array(points);
  const range = ceiling - kneeStart;
  for (let i = 0; i < points; i++) {
    const x = (i / (points - 1)) * 2 - 1;
    const ax = Math.abs(x);
    const y =
      ax <= kneeStart ? ax : kneeStart + range * Math.tanh((ax - kneeStart) / range);
    curve[i] = Math.sign(x) * y;
  }
  return curve;
}

type AudioSessionLike = { type: string };

function audioSessionOf(nav: Navigator | null): AudioSessionLike | null {
  if (!nav) return null;
  const session = (nav as Navigator & { audioSession?: AudioSessionLike })
    .audioSession;
  if (!session || !("type" in session)) return null;
  return session;
}

type NativeShell = { isNativePlatform?: () => boolean };

/**
 * The installed app and the simulator. Safari on rvmax.app is not this.
 * WKWebView takes a long time to hear again after the mic track or the
 * audio session is flipped, so the shell leaves both alone.
 */
export function nativeShellLeavesMicHardwareOn(
  cap: NativeShell | null | undefined =
    typeof window !== "undefined"
      ? (window as { Capacitor?: NativeShell }).Capacitor
      : null,
): boolean {
  try {
    return Boolean(cap?.isNativePlatform?.());
  } catch {
    return false;
  }
}

/**
 * Safari 17+ Audio Session. `play-and-record` keeps the mic and the
 * loudspeaker, but iOS ducks that route so she sounds far away.
 * `playback` is normal media volume. Use it only while the mic track is off.
 *
 * The native shell skips this. AppDelegate owns AVAudioSession there
 * (playAndRecord + defaultToSpeaker), and the mic track never turns off,
 * so iOS cannot leave play-and-record anyway. A web write in WKWebView
 * only overrides the native options and can drop the speaker route.
 */
export function setSpeakingSession(
  speaking: boolean,
  nav: Navigator | null = typeof navigator !== "undefined" ? navigator : null,
  nativeShell: boolean = nativeShellLeavesMicHardwareOn(),
): void {
  if (nativeShell) return;
  const session = audioSessionOf(nav);
  if (!session) return;
  const next = speaking ? "playback" : "play-and-record";
  try {
    if (session.type !== next) session.type = next;
  } catch {
    /* older Safari */
  }
}

export const LIVE_VOICE_DEBUG_KEY = "rvgrok.liveVoiceDebug";

/**
 * `?lvdebug=1` turns on console logging of the audio session (persisted),
 * `?lvdebug=0` turns it off. Diagnostics only; nothing on screen changes.
 */
export function liveVoiceDebugEnabled(
  search: string = typeof location !== "undefined" ? location.search : "",
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null =
    typeof localStorage !== "undefined" ? localStorage : null,
): boolean {
  try {
    const fromUrl = new URLSearchParams(search).get("lvdebug");
    if (fromUrl === "1") {
      storage?.setItem(LIVE_VOICE_DEBUG_KEY, "1");
      return true;
    }
    if (fromUrl === "0") {
      storage?.removeItem(LIVE_VOICE_DEBUG_KEY);
      return false;
    }
    return storage?.getItem(LIVE_VOICE_DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

/** Log navigator.audioSession.type when `?lvdebug=1` is on. Read-only. */
export function logLiveVoiceSession(
  label: string,
  nav: Navigator | null = typeof navigator !== "undefined" ? navigator : null,
  enabled: boolean = liveVoiceDebugEnabled(),
): void {
  if (!enabled) return;
  try {
    const session = audioSessionOf(nav);
    console.log(
      `[lvdebug] ${label} audioSession.type=${session ? session.type : "(none)"} native=${nativeShellLeavesMicHardwareOn()}`,
    );
  } catch {
    /* diagnostics only */
  }
}

/** Log the active loudness preset when `?lvdebug=1` is on. */
export function logLiveVoiceGain(
  level: LiveVoiceGainLevel,
  profile: LiveVoiceGainProfile,
  enabled: boolean = liveVoiceDebugEnabled(),
): void {
  if (!enabled) return;
  try {
    console.log(
      `[lvdebug] lvgain=${level} makeup=${profile.makeup} knee=${profile.kneeStart} ceiling=${profile.ceiling} peak=${(profile.makeup * profile.ceiling).toFixed(3)}`,
    );
  } catch {
    /* diagnostics only */
  }
}

export function resumeLiveVoiceSpeaker(ctx: AudioContext | null): void {
  if (!ctx) return;
  void chains.get(ctx)?.speakerEl?.play().catch(() => {});
}

/**
 * Open the session for mic + loudspeaker before getUserMedia (Safari).
 * Only the mic tap calls this. The native shell skips it: AppDelegate
 * already set playAndRecord with defaultToSpeaker.
 */
export function preferIosLoudspeaker(
  nav: Navigator | null = typeof navigator !== "undefined" ? navigator : null,
  nativeShell: boolean = nativeShellLeavesMicHardwareOn(),
): boolean {
  if (nativeShell) return false;
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

export type LiveVoiceRoute = "auto" | "element" | "destination";
export const LIVE_VOICE_ROUTE_KEY = "rvgrok.liveVoiceRoute";

/** Route override from `?lvroute=` (persisted) or localStorage. */
export function liveVoiceRouteOverride(
  search: string = typeof location !== "undefined" ? location.search : "",
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null =
    typeof localStorage !== "undefined" ? localStorage : null,
): LiveVoiceRoute {
  const valid = (v: string | null): v is LiveVoiceRoute =>
    v === "auto" || v === "element" || v === "destination";
  try {
    const fromUrl = new URLSearchParams(search).get("lvroute");
    if (valid(fromUrl)) {
      if (fromUrl === "auto") storage?.removeItem(LIVE_VOICE_ROUTE_KEY);
      else storage?.setItem(LIVE_VOICE_ROUTE_KEY, fromUrl);
      return fromUrl;
    }
    const stored = storage?.getItem(LIVE_VOICE_ROUTE_KEY) ?? null;
    return valid(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

/** Whether to use the <audio> speaker element for this device + override. */
export function shouldUseSpeakerElement(
  route: LiveVoiceRoute = liveVoiceRouteOverride(),
  needsElement: boolean = playbackNeedsSpeakerElement(),
): boolean {
  if (route === "element") return true;
  if (route === "destination") return false;
  return needsElement;
}

export type LiveVoiceOutput = {
  gain: GainNode;
  clipper: WaveShaperNode;
  /** Set only on the iOS loudspeaker workaround. */
  speakerEl: HTMLAudioElement | null;
  route: "element" | "destination";
  /** Loudness preset this chain was built with. */
  gainLevel: LiveVoiceGainLevel;
  /**
   * The node that is actually playing. Mic capture has to join this or
   * iOS sometimes never pulls samples, so Listening never becomes Hearing.
   */
  pull: AudioNode;
};

const chains = new WeakMap<AudioContext, LiveVoiceOutput>();

/** Gain node the playback sources must connect to. Idempotent per context. */
export function liveVoiceOutputFor(ctx: AudioContext): LiveVoiceOutput {
  const existing = chains.get(ctx);
  if (existing) {
    void existing.speakerEl?.play().catch(() => {});
    return existing;
  }

  // No session write here. The chain can be built after beginSpeaking
  // set `playback`; forcing play-and-record here put her back on the
  // quiet call volume for the rest of that reply.
  const gainLevel = liveVoiceGainLevel();
  const profile = liveVoiceGainProfile(gainLevel);
  logLiveVoiceGain(gainLevel, profile);
  const gain = ctx.createGain();
  gain.gain.value = 1;
  const clipper = ctx.createWaveShaper();
  clipper.curve = softClipCurve(
    LIVE_VOICE_SOFT_CLIP.points,
    profile.kneeStart,
    profile.ceiling,
  );
  clipper.oversample = "none";
  gain.connect(clipper);
  const makeup = ctx.createGain();
  makeup.gain.value = profile.makeup;
  clipper.connect(makeup);

  let speakerEl: HTMLAudioElement | null = null;
  let pull: AudioNode;
  if (shouldUseSpeakerElement() && typeof document !== "undefined") {
    const dest = ctx.createMediaStreamDestination();
    makeup.connect(dest);
    pull = dest;
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
    makeup.connect(ctx.destination);
    pull = ctx.destination;
  }

  const chain: LiveVoiceOutput = {
    gain,
    clipper,
    speakerEl,
    route: speakerEl ? "element" : "destination",
    gainLevel,
    pull,
  };
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
    chain.clipper.disconnect();
  } catch {
    /* already disconnected */
  }
  if (chain.speakerEl) {
    chain.speakerEl.srcObject = null;
    chain.speakerEl.remove();
  }
}
