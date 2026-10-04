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

/** Makeup after the soft clipper. Peaks stay under full scale. */
export const LIVE_VOICE_OUTPUT_GAIN = 2;

/**
 * Far below a phone speaker. Exact silence lets an iPhone stop rendering,
 * in the app and in the phone's browser, and then the mic stops even
 * though the screen still says it is his turn.
 */
export const LIVE_VOICE_KEEP_ALIVE_GAIN = 0.00001;

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

type GraphKeepAlive = {
  osc: OscillatorNode;
  gain: GainNode;
};

function audioSessionOf(nav: Navigator): AudioSessionLike | null {
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
 * iPhone and iPad, in the installed app or in the phone's browser.
 * A quiet stretch stops the mic on both.
 */
export function iosNeedsMicKeepAlive(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
  platform: string = typeof navigator !== "undefined" ? navigator.platform : "",
  maxTouchPoints: number = typeof navigator !== "undefined"
    ? navigator.maxTouchPoints
    : 0,
  cap: NativeShell | null | undefined = typeof window !== "undefined"
    ? (window as { Capacitor?: NativeShell }).Capacitor
    : null,
): boolean {
  if (nativeShellLeavesMicHardwareOn(cap)) return true;
  return playbackNeedsSpeakerElement(ua, platform, maxTouchPoints);
}

/**
 * Safari 17+ Audio Session. `play-and-record` keeps the mic and the
 * loudspeaker, but iOS ducks that route so she sounds far away.
 * `playback` is normal media volume. Use it only while the mic track is off.
 */
export function setSpeakingSession(
  speaking: boolean,
  nav: Navigator | null = typeof navigator !== "undefined" ? navigator : null,
): void {
  const session = audioSessionOf(nav);
  if (!session) return;
  const next = speaking ? "playback" : "play-and-record";
  try {
    if (session.type !== next) session.type = next;
  } catch {
    /* older Safari */
  }
}

export function resumeLiveVoiceSpeaker(ctx: AudioContext | null): void {
  if (!ctx) return;
  void chains.get(ctx)?.speakerEl?.play().catch(() => {});
}

/** Open the session for mic + loudspeaker. Call again when she stops. */
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
  /**
   * The node that is actually playing. Mic capture has to join this or
   * iOS sometimes never pulls samples, so Listening never becomes Hearing.
   */
  pull: AudioNode;
  /** Whisper that keeps the iPhone pulling the mic while she is quiet. */
  keepAlive: GraphKeepAlive | null;
};

const chains = new WeakMap<AudioContext, LiveVoiceOutput>();

/** Gain node the playback sources must connect to. Idempotent per context. */
export function liveVoiceOutputFor(ctx: AudioContext): LiveVoiceOutput {
  const existing = chains.get(ctx);
  if (existing) {
    void existing.speakerEl?.play().catch(() => {});
    keepLiveVoiceGraphAwake(ctx);
    return existing;
  }

  preferIosLoudspeaker();
  const gain = ctx.createGain();
  gain.gain.value = 1;
  const clipper = ctx.createWaveShaper();
  clipper.curve = softClipCurve();
  clipper.oversample = "none";
  gain.connect(clipper);
  const makeup = ctx.createGain();
  makeup.gain.value = LIVE_VOICE_OUTPUT_GAIN;
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
    pull,
    keepAlive: null,
  };
  chains.set(ctx, chain);
  keepLiveVoiceGraphAwake(ctx);
  return chain;
}

/**
 * iPhone app and the phone's browser. Resume the context, keep the
 * speaker element playing, and start the whisper if it has stopped.
 */
export function keepLiveVoiceGraphAwake(ctx: AudioContext | null): void {
  if (!ctx || ctx.state === "closed") return;
  if (!iosNeedsMicKeepAlive()) return;
  if (ctx.state !== "running") void ctx.resume().catch(() => {});
  const chain = chains.get(ctx);
  if (!chain) return;
  void chain.speakerEl?.play().catch(() => {});
  if (chain.keepAlive) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 20;
    gain.gain.value = LIVE_VOICE_KEEP_ALIVE_GAIN;
    osc.connect(gain);
    gain.connect(chain.pull);
    osc.onended = () => {
      if (chain.keepAlive?.osc === osc) chain.keepAlive = null;
    };
    osc.start();
    chain.keepAlive = { osc, gain };
  } catch {
    chain.keepAlive = null;
  }
}

export function releaseLiveVoiceOutput(ctx: AudioContext | null): void {
  if (!ctx) return;
  const chain = chains.get(ctx);
  if (!chain) return;
  chains.delete(ctx);
  const keep = chain.keepAlive;
  chain.keepAlive = null;
  if (keep) {
    try {
      keep.osc.onended = null;
      keep.osc.stop();
    } catch {
      /* already stopped */
    }
    try {
      keep.osc.disconnect();
    } catch {
      /* already disconnected */
    }
    try {
      keep.gain.disconnect();
    } catch {
      /* already disconnected */
    }
  }
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
