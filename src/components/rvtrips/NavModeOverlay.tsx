import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  Merge,
  RotateCw,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatArrivalClock,
  formatManeuverDistance,
  formatRemainingMiles,
  formatRemainingTime,
  formatSpeedMph,
  maneuverArrow,
  pickSpeedMps,
  type ManeuverArrow,
  type SpeedFix,
  type TripRemaining,
} from "@/lib/trips/navMode";
import type { FollowStatus } from "@/lib/trips/geoFollow";

const ARROW_ICON: Record<ManeuverArrow, typeof ArrowUp> = {
  straight: ArrowUp,
  left: CornerUpLeft,
  right: CornerUpRight,
  "slight-left": ArrowUpLeft,
  "slight-right": ArrowUpRight,
  "sharp-left": CornerDownLeft,
  "sharp-right": CornerDownRight,
  uturn: Undo2,
  merge: Merge,
  "ramp-left": ArrowUpLeft,
  "ramp-right": ArrowUpRight,
  roundabout: RotateCw,
  arrive: MapPin,
};

/** Device speed, or speed derived from the last two accepted fixes. */
export function useFixSpeed(fix: SpeedFix | null): number | null {
  const prevRef = useRef<SpeedFix | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  useEffect(() => {
    if (!fix) {
      prevRef.current = null;
      setSpeed(null);
      return;
    }
    setSpeed(pickSpeedMps(fix, prevRef.current));
    prevRef.current = fix;
  }, [fix]);
  return speed;
}

/** Re-render the arrival clock once a minute without a GPS tick. */
function useMinuteClock(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/**
 * Full-screen nav chrome over the GL map: turn banner (top), speed sign,
 * ETA / remaining strip (bottom). Built on GL JS — no Navigation SDK.
 * No lane row: neither HERE Truck nor OSRM steps carry lane data here.
 */
export function NavModeOverlay({
  instruction,
  maneuver,
  remainToManeuverM,
  speedMps,
  speedLimitMph,
  remaining,
  status,
  rerouting,
  voiceOn,
  onToggleVoice,
  onStop,
}: {
  instruction: string | null;
  maneuver: string | null;
  remainToManeuverM: number | null;
  speedMps: number | null;
  /** Only when route data has a posted limit. Our HERE/OSRM data does not today. */
  speedLimitMph?: number | null;
  remaining: TripRemaining | null;
  status: FollowStatus;
  rerouting: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onStop: () => void;
}) {
  const now = useMinuteClock();
  const arrow = useMemo(
    () => maneuverArrow(maneuver || "", instruction || ""),
    [maneuver, instruction],
  );
  const Icon = ARROW_ICON[arrow];
  const dist = formatManeuverDistance(remainToManeuverM);
  const arrival = remaining ? formatArrivalClock(now, remaining.remainS) : "";
  const left = remaining
    ? [formatRemainingTime(remaining.remainS), formatRemainingMiles(remaining.remainM)]
        .filter(Boolean)
        .join(" · ")
    : "";
  const hasLimit =
    speedLimitMph != null && Number.isFinite(speedLimitMph) && speedLimitMph > 0;

  return (
    <div className="rv-nav-chrome pointer-events-none absolute inset-0 z-[5]">
      <div data-nav-banner className="rv-nav-banner pointer-events-auto">
        <div className="rv-nav-banner-turn">
          <Icon className="size-9" strokeWidth={2.6} aria-hidden />
          <span data-nav-banner-distance className="rv-nav-banner-dist tabular-nums">
            {dist || "—"}
          </span>
        </div>
        <p data-nav-banner-text className="rv-nav-banner-text">
          {instruction ||
            (status === "live" ? "Follow the route" : "Finding GPS…")}
        </p>
      </div>

      {rerouting || status !== "live" ? (
        <p data-nav-status className="rv-nav-status">
          {rerouting
            ? "Off route — recalculating with the same truck profile…"
            : status === "denied"
              ? "Location denied — allow location to follow"
              : "Finding GPS…"}
        </p>
      ) : null}

      <div
        data-nav-speed
        data-nav-speed-kind={hasLimit ? "limit" : "gps"}
        className="rv-nav-speed"
        aria-label={hasLimit ? "Speed limit" : "Current speed"}
      >
        <span className="rv-nav-speed-cap">{hasLimit ? "LIMIT" : "SPEED"}</span>
        <span className="rv-nav-speed-val tabular-nums">
          {hasLimit ? String(Math.round(speedLimitMph)) : formatSpeedMph(speedMps)}
        </span>
        <span className="rv-nav-speed-unit">mph</span>
      </div>

      <div data-nav-strip className="rv-nav-strip pointer-events-auto">
        <div className="min-w-0 flex-1">
          <p data-nav-arrival className="rv-nav-strip-eta tabular-nums">
            {arrival || "—"}
          </p>
          <p data-nav-remaining className="rv-nav-strip-left tabular-nums">
            {left ? `arrival · ${left}` : "arrival"}
          </p>
        </div>
        <button
          type="button"
          data-voice-toggle
          data-voice-on={voiceOn ? "1" : "0"}
          aria-pressed={voiceOn}
          aria-label={voiceOn ? "Mute voice guidance" : "Turn on voice guidance"}
          onClick={onToggleVoice}
          className={cn("rv-nav-round", voiceOn && "rv-nav-round-on")}
        >
          {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
        <button type="button" data-nav-stop onClick={onStop} className="rv-nav-end">
          End
        </button>
      </div>
    </div>
  );
}
