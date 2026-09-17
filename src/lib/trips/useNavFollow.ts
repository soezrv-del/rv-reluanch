import { useEffect, useState } from "react";
import {
  FOLLOW_PRIME_OPTIONS,
  FOLLOW_WATCH_FALLBACK,
  FOLLOW_WATCH_OPTIONS,
  fixFromCoords,
  followErrorMessage,
  geoErrorCode,
  shouldAcceptFix,
  type FollowStatus,
  type GeoFix,
} from "./geoFollow.ts";

/** watchPosition only while guidance is armed. Origin stays one-shot. */
export function useNavFollow(armed: boolean): {
  fix: GeoFix | null;
  error: string | null;
  status: FollowStatus;
} {
  const [fix, setFix] = useState<GeoFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!armed) {
      setFix(null);
      setError(null);
      setDenied(false);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setFix(null);
      setDenied(false);
      setError("Location is not available on this device.");
      return;
    }

    let last: GeoFix | null = null;
    let cancelled = false;
    let watchId: number | null = null;
    setError(null);
    setDenied(false);

    const applyFix = (pos: GeolocationPosition) => {
      if (cancelled) return;
      const next = fixFromCoords(pos.coords, pos.timestamp);
      if (!shouldAcceptFix(last, next)) return;
      last = next;
      setFix(next);
      setError(null);
      setDenied(false);
    };

    const onWatchError = (err: GeolocationPositionError) => {
      if (cancelled) return;
      if (err.code === 1) {
        last = null;
        setFix(null);
        setDenied(true);
        setError(followErrorMessage(err));
        return;
      }
      // Timeout / unavailable: keep any puck we have and retry without
      // high-accuracy so Capacitor WebView is not stuck on “Finding GPS…”.
      if (last) {
        setError(null);
        return;
      }
      if (geoErrorCode(err) === 3) {
        setError(null);
        return;
      }
      setError(followErrorMessage(err));
    };

    const startWatch = (opts: PositionOptions) => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
      watchId = navigator.geolocation.watchPosition(
        applyFix,
        onWatchError,
        opts,
      );
    };

    // Prime from a cached/network fix — watch + high-accuracy can be slow
    // in WKWebView. Origin / Plan trip still owns its own one-shot.
    navigator.geolocation.getCurrentPosition(
      applyFix,
      () => {
        /* watchPosition owns denied / unavailable */
      },
      FOLLOW_PRIME_OPTIONS,
    );

    startWatch(FOLLOW_WATCH_OPTIONS);

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || last) return;
      startWatch(FOLLOW_WATCH_FALLBACK);
    }, 8_000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      last = null;
      setFix(null);
      setError(null);
      setDenied(false);
    };
  }, [armed]);

  const status: FollowStatus = !armed
    ? "off"
    : denied
      ? "denied"
      : fix
        ? "live"
        : "waiting";

  return { fix, error, status };
}
