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
    setError(null);
    setDenied(false);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const next = fixFromCoords(pos.coords, pos.timestamp);
        if (!shouldAcceptFix(last, next)) return;
        last = next;
        setFix(next);
        setError(null);
        setDenied(false);
      },
      (err) => {
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
