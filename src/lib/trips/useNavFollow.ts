import { useEffect, useState } from "react";
import {
  FOLLOW_WATCH_OPTIONS,
  fixFromCoords,
  followErrorMessage,
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

    // Prime the first puck from a real fix — watch can be slow in WKWebView.
    // Origin / Plan trip still owns its own one-shot; this is guidance-only.
    navigator.geolocation.getCurrentPosition(applyFix, () => {
      /* watchPosition owns denied / unavailable */
    }, FOLLOW_WATCH_OPTIONS);

    const id = navigator.geolocation.watchPosition(
      applyFix,
      (err) => {
        if (cancelled) return;
        const msg = followErrorMessage(err);
        if (err.code === 1) {
          last = null;
          setFix(null);
          setDenied(true);
          setError(msg);
          return;
        }
        setError(msg);
      },
      FOLLOW_WATCH_OPTIONS,
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(id);
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
