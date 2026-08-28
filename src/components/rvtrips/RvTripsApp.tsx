import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Droplets,
  ExternalLink,
  ListChecks,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Navigation,
  Search,
  Tent,
  Unlock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RVTRIPS_AMERICA_BACKDROP,
  RVTRIPS_MAP_PANEL,
} from "@/assets/tripMedia";
import {
  DEMO_CAMPS,
  DEMO_PACK,
  DEMO_ROUTE,
  formatDrive,
  formatMiles,
  type TripAlert,
} from "@/lib/trips/tripData";
import {
  fetchOsrmRoute,
  type OsrmLngLat,
  type OsrmRouteResult,
} from "@/lib/trips/osrm";
import {
  clearLockedProfile,
  EMPTY_COACH_PROFILE,
  loadLockedProfile,
  profileIsComplete,
  saveLockedProfile,
  suggestCoachFromSelection,
  TRIP_YEARS,
  type CoachProfile,
} from "@/lib/trips/coachFromCatalog";
import {
  analyzeRouteRestrictions,
  saferOsrmParams,
} from "@/lib/trips/routeRestrictions";
import {
  getFloorplansForYear,
  getMakesForYear,
  getModelsForYearMake,
} from "@/lib/rv/catalog";
import { SelectSheet } from "@/components/rvfax/SelectSheet";
import {
  DUMP_KIND_LABEL,
  DUMP_STATES,
  FREE_DUMP_STATIONS,
  filterDumpStations,
  mapsUrl,
} from "@/lib/trips/dumpStations";
import { DumpMap } from "@/components/rvtrips/DumpMap";

type SubTab =
  | "navigate"
  | "directions"
  | "campgrounds"
  | "dumps"
  | "pack"
  | "profile";
type SheetId = "year" | "make" | "model" | "floorplan" | null;

const SUB_TABS: { id: SubTab; label: string; icon: typeof Navigation }[] = [
  { id: "navigate", label: "Navigate", icon: Navigation },
  { id: "directions", label: "Directions", icon: ListChecks },
  { id: "campgrounds", label: "Campgrounds", icon: Tent },
  { id: "dumps", label: "Dumps", icon: Droplets },
  { id: "pack", label: "Pack List", icon: ListChecks },
  { id: "profile", label: "Profile", icon: User },
];

type PlaceHit = { label: string; lat: number; lng: number; kind: string };

type NavStep = {
  id: string;
  instruction: string;
  mi: string;
  maneuver: string;
};


function readDevicePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is not available on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 60_000,
    });
  });
}

function geoErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = Number((err as GeolocationPositionError).code);
    if (code === 1) {
      return "Location permission denied — allow location, or type your address.";
    }
    if (code === 2) {
      return "Location unavailable — check GPS/signal, or type your address.";
    }
    if (code === 3) {
      return "Location timed out — try again, or type your address.";
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Could not get current location — type your address instead.";
}

export function RvTripsApp() {
  const [sub, setSub] = useState<SubTab>("navigate");
  const [pack, setPack] = useState(DEMO_PACK);
  const [navArmed, setNavArmed] = useState(false);
  const [navStepIdx, setNavStepIdx] = useState(0);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [floorplan, setFloorplan] = useState("");
  const [sheet, setSheet] = useState<SheetId>(null);

  const [draft, setDraft] = useState<CoachProfile>(EMPTY_COACH_PROFILE);
  const [locked, setLocked] = useState<CoachProfile | null>(null);

  const [originText, setOriginText] = useState("");
  const [destText, setDestText] = useState("");
  const [originPlace, setOriginPlace] = useState<PlaceHit | null>(null);
  const [destPlace, setDestPlace] = useState<PlaceHit | null>(null);
  const [geoHits, setGeoHits] = useState<PlaceHit[]>([]);
  const [geoFor, setGeoFor] = useState<"origin" | "dest" | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const [route, setRoute] = useState(DEMO_ROUTE);
  const [osrm, setOsrm] = useState<OsrmRouteResult | null>(null);
  const [routeStatus, setRouteStatus] = useState<
    "idle" | "loading" | "live" | "offline"
  >("idle");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeKey, setRouteKey] = useState(0);
  const [saferBusy, setSaferBusy] = useState(false);
  const [saferNote, setSaferNote] = useState<string | null>(null);
  const [dumpQuery, setDumpQuery] = useState("");
  const [dumpState, setDumpState] = useState<string | null>(null);
  const [dumpFocusId, setDumpFocusId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadLockedProfile();
    if (saved) {
      setLocked(saved);
      setYear(saved.year);
      setMake(saved.make);
      setModel(saved.model);
      setFloorplan(saved.floorplan);
      setDraft(saved);
    }
  }, []);

  const makes = useMemo(() => getMakesForYear(year), [year]);
  const models = useMemo(
    () => (year && make ? getModelsForYearMake(year, make) : []),
    [year, make],
  );
  const floorplans = useMemo(
    () =>
      year && make && model ? getFloorplansForYear(year, make, model) : [],
    [year, make, model],
  );

  useEffect(() => {
    if (!year || !make || !model || !floorplan) {
      setDraft((prev) => ({
        ...EMPTY_COACH_PROFILE,
        year,
        make,
        model,
        floorplan,
        heightFt: floorplan ? prev.heightFt : 0,
        lengthFt: floorplan ? prev.lengthFt : 0,
        widthFt: floorplan ? prev.widthFt : 0,
        weightLbs: floorplan ? prev.weightLbs : 0,
      }));
      return;
    }
    const suggested = suggestCoachFromSelection({
      year,
      make,
      model,
      floorplan,
    });
    setDraft((prev) => {
      if (
        prev.year === year &&
        prev.make === make &&
        prev.model === model &&
        prev.floorplan === floorplan &&
        prev.lengthFt > 0
      ) {
        return {
          ...prev,
          type: suggested.type,
          engine: suggested.engine,
          fuelType: suggested.fuelType,
        };
      }
      return { ...suggested, locked: false };
    });
  }, [year, make, model, floorplan]);

  const restriction = useMemo(
    () =>
      analyzeRouteRestrictions({
        coach: locked,
        route: osrm,
        hasRoute: Boolean(originPlace && destPlace && osrm),
        destLabel: destPlace?.label || route.destination.label,
        originLabel: originPlace?.label || route.origin.label,
      }),
    [locked, osrm, originPlace, destPlace, route.destination.label, route.origin.label],
  );
  const alerts = restriction.alerts;

  const coachLine = useMemo(() => {
    if (!locked) return "Profile tab · year · make · model · floorplan";
    const y = locked.year ? `${locked.year} ` : "";
    const fp = locked.floorplan ? ` · ${locked.floorplan}` : "";
    return `${y}${locked.make} ${locked.model}${fp} · ${locked.heightFt}′H · ${locked.lengthFt}′L`;
  }, [locked]);

  const speakNav = useCallback((text: string) => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch {
      /* no TTS */
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* */
      }
    };
  }, []);

  const runRoute = useCallback(
    (
      from: OsrmLngLat,
      to: OsrmLngLat,
      destLabel: string,
      originLabel: string,
    ) => {
      const ctrl = new AbortController();
      setRouteStatus("loading");
      setRouteError(null);
      setNavArmed(false);
      setNavStepIdx(0);
      fetchOsrmRoute({ from, to, signal: ctrl.signal })
        .then((data) => {
          setOsrm(data);
          setRoute({
            ...DEMO_ROUTE,
            id: `route-${Date.now()}`,
            origin: { id: "origin", label: originLabel },
            destination: {
              id: "dest",
              label: destLabel,
              subtitle: data.engine,
            },
            miles: data.miles,
            driveHours: data.driveHours,
            driveMinutes: data.driveMinutes,
            engine: data.engine,
            alertCount: 0,
          });
          setRouteStatus("live");
        })
        .catch((e) => {
          if (ctrl.signal.aborted) return;
          setOsrm(null);
          setRouteStatus("offline");
          setRouteError(
            e instanceof Error ? e.message : "Routing unavailable",
          );
        });
      return () => ctrl.abort();
    },
    [],
  );

  useEffect(() => {
    if (!originPlace || !destPlace) return;
    return runRoute(
      { lng: originPlace.lng, lat: originPlace.lat },
      { lng: destPlace.lng, lat: destPlace.lat },
      destPlace.label,
      originPlace.label,
    );
  }, [originPlace, destPlace, routeKey, runRoute]);

  const liveDirections: NavStep[] | null = useMemo(() => {
    if (!osrm?.steps?.length) return null;
    const steps = osrm.steps
      .filter((s) => {
        if (s.maneuver === "depart" || s.maneuver === "arrive") return true;
        if (s.distanceM >= 250) return true;
        if (
          /turn|ramp|merge|fork|exit|roundabout|end of road|new name/i.test(
            `${s.maneuver} ${s.instruction}`,
          )
        )
          return true;
        return Boolean(s.name && s.distanceM >= 80);
      })
      .map((s, i) => ({
        id: `osrm-${i}`,
        instruction:
          s.instruction || (s.name ? `Continue on ${s.name}` : "Continue"),
        mi: (Math.round((s.distanceM / 1609.344) * 10) / 10).toFixed(
          s.distanceM >= 1609 ? 0 : 1,
        ),
        maneuver: s.maneuver,
      }));
    return steps.length ? steps : null;
  }, [osrm]);

  useEffect(() => {
    if (!navArmed || !liveDirections?.length) return;
    const step =
      liveDirections[Math.min(navStepIdx, liveDirections.length - 1)];
    if (!step) return;
    const line =
      navStepIdx === 0
        ? `Navigation started. ${step.instruction}. ${step.mi} miles.`
        : `${step.instruction}. ${step.mi} miles.`;
    speakNav(line);
  }, [navArmed, navStepIdx, liveDirections, speakNav]);

  const searchPlace = async (q: string, which: "origin" | "dest") => {
    setGeoFor(which);
    setGeoLoading(true);
    setLocateError(null);
    try {
      const res = await fetch(
        `/api/geocode?q=${encodeURIComponent(q.trim() || " ")}`,
      );
      const json = (await res.json()) as { hits?: PlaceHit[] };
      setGeoHits(json.hits || []);
    } catch {
      setGeoHits([]);
    } finally {
      setGeoLoading(false);
    }
  };

  const pickPlace = (hit: PlaceHit) => {
    if (geoFor === "origin") {
      setOriginPlace(hit);
      setOriginText(hit.label);
    } else if (geoFor === "dest") {
      setDestPlace(hit);
      setDestText(hit.label);
    }
    setGeoHits([]);
    setGeoFor(null);
    setLocateError(null);
    setNavArmed(false);
    setNavStepIdx(0);
  };

  const useCurrentLocation = useCallback(async () => {
    setLocateError(null);
    setLocating(true);
    setGeoHits([]);
    setGeoFor(null);
    try {
      const pos = await readDevicePosition();
      const { latitude: lat, longitude: lng } = pos.coords;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid coordinates from device.");
      }

      let label = "Current location";
      try {
        const res = await fetch(
          `/api/geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
        );
        const json = (await res.json()) as { hits?: PlaceHit[] };
        if (json.hits?.[0]?.label) label = json.hits[0].label;
      } catch {
        /* coords still route even if reverse geocode fails */
      }

      const hit: PlaceHit = { label, lat, lng, kind: "current" };
      setOriginPlace(hit);
      setOriginText(label);
      setNavArmed(false);
      setNavStepIdx(0);
    } catch (err) {
      setLocateError(geoErrorMessage(err));
    } finally {
      setLocating(false);
    }
  }, []);

  const geocodeAndRoute = async () => {
    setRouteError(null);
    setLocateError(null);
    let o = originPlace;
    let d = destPlace;
    if (!o && originText.trim()) {
      const r = await fetch(
        `/api/geocode?q=${encodeURIComponent(originText.trim())}`,
      );
      const j = (await r.json()) as { hits?: PlaceHit[] };
      o = j.hits?.[0] || null;
      if (o) {
        setOriginPlace(o);
        setOriginText(o.label);
      }
    }
    if (!d && destText.trim()) {
      const r = await fetch(
        `/api/geocode?q=${encodeURIComponent(destText.trim())}`,
      );
      const j = (await r.json()) as { hits?: PlaceHit[] };
      d = j.hits?.[0] || null;
      if (d) {
        setDestPlace(d);
        setDestText(d.label);
      }
    }
    if (o && d) setRouteKey((k) => k + 1);
    else
      setRouteError(
        "Could not find that address — try a city name (e.g. Seattle, WA)",
      );
  };

  const lockProfile = () => {
    if (!profileIsComplete(draft)) return;
    const next = { ...draft, locked: true as const };
    setLocked(next);
    saveLockedProfile(next);
  };

  const unlockProfile = () => {
    setLocked(null);
    clearLockedProfile();
  };

  const applySaferRoute = async () => {
    if (!originPlace || !destPlace || !locked) return;
    setSaferBusy(true);
    setSaferNote(null);
    try {
      const safer = saferOsrmParams(locked);
      const data = await fetchOsrmRoute({
        from: { lng: originPlace.lng, lat: originPlace.lat },
        to: { lng: destPlace.lng, lat: destPlace.lat },
        weight: safer.weight,
        exclude: safer.exclude,
        bypassCache: true,
      });
      setOsrm(data);
      setRoute({
        ...DEMO_ROUTE,
        id: `safer-${Date.now()}`,
        origin: { id: "origin", label: originPlace.label },
        destination: {
          id: "dest",
          label: destPlace.label,
          subtitle: "Safer RV route",
        },
        miles: data.miles,
        driveHours: data.driveHours,
        driveMinutes: data.driveMinutes,
        engine: `${data.engine} · safer`,
        alertCount: 0,
      });
      setRouteStatus("live");
      setSaferNote(
        "Applied highway-preferring RV route. Re-check warnings below.",
      );
      setNavStepIdx(0);
    } catch (e) {
      setSaferNote(
        e instanceof Error ? e.message : "Could not compute safer route",
      );
    } finally {
      setSaferBusy(false);
    }
  };

  const packDone = pack.filter((p) => p.done).length;
  const dumpNearLat = originPlace?.lat ?? destPlace?.lat ?? null;
  const dumpNearLng = originPlace?.lng ?? destPlace?.lng ?? null;

  const dumpList = useMemo(
    () =>
      filterDumpStations(FREE_DUMP_STATIONS, {
        query: dumpQuery,
        state: dumpState,
        near:
          dumpNearLat != null && dumpNearLng != null
            ? { lat: dumpNearLat, lng: dumpNearLng }
            : null,
      }),
    [dumpQuery, dumpState, dumpNearLat, dumpNearLng],
  );

  const routeToDump = (d: (typeof dumpList)[number]) => {
    const hit: PlaceHit = {
      label: `${d.name} · ${d.city}, ${d.state}`,
      lat: d.lat,
      lng: d.lng,
      kind: "dump",
    };
    setDestPlace(hit);
    setDestText(hit.label);
    setGeoHits([]);
    setGeoFor(null);
    setNavArmed(false);
    setNavStepIdx(0);
    setSub("navigate");
    if (originPlace) setRouteKey((k) => k + 1);
  };
  const hasRoutePoints = Boolean(originPlace && destPlace);
  const canLock = profileIsComplete(draft) && !locked;
  const dimsReady = Boolean(floorplan && draft.lengthFt > 0);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-bg text-white"
      data-no-swipe-scroll
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={RVTRIPS_AMERICA_BACKDROP}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover object-[center_42%] brightness-110 contrast-105 saturate-115"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,10,28,0.72) 0%, rgba(4,14,36,0.45) 28%, rgba(6,18,40,0.35) 55%, rgba(2,8,22,0.78) 100%)",
          }}
        />
      </div>

      <div
        data-app-scroll
        className="rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        <header className="px-3 pb-2 pt-2 sm:px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/brand/icon-rvtrips.png"
                alt=""
                className="size-10 object-contain drop-shadow-md"
              />
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-white">
                  RvTrips
                </h1>
                <p className="text-[11px] font-medium text-white">{coachLine}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                  locked
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-amber/40 bg-amber/15 text-amber",
                )}
              >
                {locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                {locked ? "PROFILE LOCKED" : "SET PROFILE"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-blue">
                {routeStatus === "live"
                  ? "OSRM live"
                  : routeStatus === "loading"
                    ? "Routing…"
                    : routeStatus === "offline"
                      ? "Route offline"
                      : hasRoutePoints
                        ? "Ready"
                        : "Enter route"}
              </span>
            </div>
          </div>

          <div
            className="mt-3 flex gap-1 overflow-x-auto rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-xl"
            style={{ scrollbarWidth: "none" }}
            role="tablist"
          >
            {SUB_TABS.map((t) => {
              const Icon = t.icon;
              const active = sub === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSub(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition",
                    active
                      ? "bg-blue text-white shadow-[0_0_16px_rgba(80,160,255,0.4)]"
                      : "text-white hover:bg-white/10",
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="mx-auto w-full max-w-lg space-y-3 px-3 pb-16 pt-2 sm:px-4">
          {/* ── PROFILE ── */}
          {sub === "profile" ? (
            <section className="glass-prestige space-y-3 rounded-[1.25rem] p-3.5">
              <h2 className="text-[12px] font-bold tracking-[0.14em] text-white">
                RV PROFILE
              </h2>
              <p className="text-[12px] text-white">
                Year → make → model → floorplan, then adjust length/weight and
                lock for map alerts.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <FieldBtn
                  label="Year"
                  value={year || "Select"}
                  onClick={() => setSheet("year")}
                />
                <FieldBtn
                  label="Make"
                  value={make || "Select"}
                  disabled={!year}
                  onClick={() => setSheet("make")}
                />
                <FieldBtn
                  label="Model"
                  value={model || "Select"}
                  disabled={!make}
                  onClick={() => setSheet("model")}
                />
                <FieldBtn
                  label="Floorplan"
                  value={floorplan || "Select"}
                  disabled={!model}
                  onClick={() => setSheet("floorplan")}
                />
              </div>
              {dimsReady ? (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["heightFt", "Height (ft)"],
                      ["lengthFt", "Length (ft)"],
                      ["widthFt", "Width (ft)"],
                      ["weightLbs", "Weight (lbs)"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-[10px] font-bold text-white">
                        {label}
                      </span>
                      <input
                        type="number"
                        value={draft[key] || ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [key]: Number(e.target.value) || 0,
                          }))
                        }
                        className="glass-field w-full rounded-xl px-3 py-2 text-[14px] font-semibold text-white outline-none"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-white">
                  Pick floorplan to unlock dimension fields.
                </p>
              )}
              {locked ? (
                <button
                  type="button"
                  onClick={unlockProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-[14px] font-bold text-white"
                >
                  <Unlock className="size-4" />
                  Unlock to edit
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canLock}
                  onClick={lockProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-[14px] font-bold text-black disabled:opacity-40"
                >
                  <Lock className="size-4" />
                  Lock profile for map
                </button>
              )}
            </section>
          ) : null}

          {/* ── NAVIGATE ── */}
          {sub === "navigate" ? (
            <>
              {!locked ? (
                <button
                  type="button"
                  onClick={() => setSub("profile")}
                  className="glass-prestige flex w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-3 text-left"
                >
                  <User className="size-5 text-amber" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-white">
                      Set your RV profile first
                    </p>
                    <p className="text-[11px] text-white">
                      Optional for routing — required for height/length alerts
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-white" />
                </button>
              ) : (
                <div className="glass-prestige flex items-center gap-3 rounded-[1.15rem] px-3.5 py-3">
                  <Lock className="size-4 text-emerald-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-white">
                      {locked.year} {locked.make} {locked.model}
                      {locked.floorplan ? ` · ${locked.floorplan}` : ""}
                    </p>
                    <p className="text-[11px] text-white">
                      {locked.heightFt}′ H · {locked.lengthFt}′ L ·{" "}
                      {locked.widthFt}′ W ·{" "}
                      {locked.weightLbs.toLocaleString()} lbs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSub("profile")}
                    className="text-[11px] font-bold text-blue"
                  >
                    Edit
                  </button>
                </div>
              )}

              <section className="glass-prestige space-y-2.5 rounded-[1.25rem] p-3.5">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-blue" />
                  <h2 className="text-[12px] font-bold tracking-[0.14em] text-white">
                    ROUTE
                  </h2>
                </div>

                <div className="block">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] text-white">
                      STARTING FROM
                    </span>
                    <button
                      type="button"
                      onClick={() => void useCurrentLocation()}
                      disabled={locating}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
                        locating
                          ? "border-sky-300/40 bg-sky-500/20 text-sky-100"
                          : originPlace?.kind === "current"
                            ? "border-emerald-400/45 bg-emerald-500/20 text-emerald-100"
                            : "border-white/20 bg-black/35 text-white/90 hover:border-sky-300/40 hover:bg-sky-500/15",
                      )}
                      aria-label="Use current location as starting point"
                    >
                      {locating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <LocateFixed className="size-3" />
                      )}
                      {locating ? "Locating…" : "Current location"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={originText}
                      onChange={(e) => {
                        setOriginText(e.target.value);
                        setOriginPlace(null);
                        setLocateError(null);
                      }}
                      placeholder="City, address, or use current location"
                      className="glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/70"
                      autoComplete="street-address"
                    />
                    <button
                      type="button"
                      onClick={() => void searchPlace(originText, "origin")}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue text-white"
                      aria-label="Search origin"
                    >
                      <Search className="size-4" />
                    </button>
                  </div>
                  {locateError ? (
                    <p className="mt-1.5 text-[11px] leading-snug text-amber">
                      {locateError}
                    </p>
                  ) : originPlace?.kind === "current" ? (
                    <p className="mt-1.5 text-[11px] leading-snug text-emerald-200/90">
                      Using your current location for the start of the route.
                    </p>
                  ) : null}
                </div>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-white">
                    DESTINATION
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={destText}
                      onChange={(e) => {
                        setDestText(e.target.value);
                        setDestPlace(null);
                      }}
                      placeholder="City, park, or address"
                      className="glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/70"
                    />
                    <button
                      type="button"
                      onClick={() => void searchPlace(destText, "dest")}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue text-white"
                      aria-label="Search destination"
                    >
                      <Search className="size-4" />
                    </button>
                  </div>
                </label>

                {geoFor && (geoLoading || geoHits.length > 0) ? (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/15 bg-black/50 p-1.5">
                    {geoLoading ? (
                      <p className="px-2 py-2 text-[12px] text-white">
                        Searching…
                      </p>
                    ) : (
                      geoHits.map((h) => (
                        <button
                          key={`${h.lat},${h.lng},${h.label}`}
                          type="button"
                          onClick={() => pickPlace(h)}
                          className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
                        >
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-blue" />
                          <span className="text-[13px] font-medium leading-snug text-white">
                            {h.label}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Seattle, WA",
                    "Portland, OR",
                    "Glacier National Park, MT",
                    "Yellowstone National Park, WY",
                    "Quartzsite, AZ",
                  ].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setDestText(label);
                        void searchPlace(label, "dest");
                      }}
                      className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white"
                    >
                      {label.split(",")[0]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!originText.trim() || !destText.trim()}
                  onClick={() => void geocodeAndRoute()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-3 py-3 text-[14px] font-bold text-white disabled:opacity-40"
                >
                  <Navigation className="size-4" />
                  Calculate RV Route
                </button>
                {routeError ? (
                  <p className="text-[12px] text-amber">{routeError}</p>
                ) : null}
              </section>

              {(hasRoutePoints || routeStatus === "live") && (
                <section className="relative aspect-[4/3.2] overflow-hidden rounded-[1.35rem] border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
                  <img
                    src={RVTRIPS_MAP_PANEL}
                    alt="RV route map"
                    className="absolute inset-0 size-full object-cover object-[center_35%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
                  <div className="absolute left-2.5 right-2.5 top-2.5 flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 backdrop-blur-md">
                    {routeStatus === "loading" ? (
                      <span className="text-[14px] font-bold text-white">
                        Calculating…
                      </span>
                    ) : (
                      <>
                        <span className="text-[17px] font-bold tabular-nums text-white">
                          {formatMiles(route.miles)}
                          <span className="ml-1 text-[11px] font-semibold text-white">
                            mi
                          </span>
                        </span>
                        <span className="text-white">|</span>
                        <span className="text-[17px] font-bold tabular-nums text-white">
                          {formatDrive(route.driveHours, route.driveMinutes)}
                          <span className="ml-1 text-[11px] font-semibold text-white">
                            drive
                          </span>
                        </span>
                      </>
                    )}
                    {alerts.length > 0 ? (
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-amber">
                        <AlertTriangle className="size-3.5" />
                        {alerts.length} RV alerts
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <div className="rounded-lg border border-white/15 bg-black/55 px-2.5 py-1.5 backdrop-blur-md">
                      <p className="text-[10px] font-semibold tracking-wide text-white">
                        DESTINATION
                      </p>
                      <p className="flex items-center gap-1 text-[13px] font-bold text-white">
                        <MapPin className="size-3.5 text-blue" />
                        {destPlace?.label || route.destination.label}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <button
                type="button"
                disabled={routeStatus !== "live" || !liveDirections?.length}
                onClick={() => {
                  if (navArmed) {
                    setNavArmed(false);
                    setNavStepIdx(0);
                    try {
                      window.speechSynthesis?.cancel();
                    } catch {
                      /* */
                    }
                    return;
                  }
                  setNavStepIdx(0);
                  setNavArmed(true);
                }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[16px] font-bold transition disabled:opacity-40",
                  navArmed
                    ? "border border-ruby/80 bg-ruby text-white shadow-[0_0_28px_rgba(212,37,53,0.55)]"
                    : "bg-blue text-white shadow-[0_0_28px_rgba(80,160,255,0.4)]",
                )}
              >
                <Navigation className="size-5" />
                {navArmed
                  ? "Stop navigation"
                  : routeStatus === "live" && liveDirections?.length
                    ? "Start Turn-by-Turn"
                    : routeStatus === "loading"
                      ? "Calculating…"
                      : "Calculate a route first"}
              </button>

              {navArmed && liveDirections && liveDirections.length > 0 ? (
                <section className="glass-prestige space-y-3 rounded-[1.25rem] border border-emerald-400/35 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-300">
                      GUIDANCE · STEP {navStepIdx + 1} / {liveDirections.length}
                    </p>
                    <span className="text-[11px] font-bold text-white">
                      {liveDirections[navStepIdx]?.mi} mi
                    </span>
                  </div>
                  <p className="text-[18px] font-bold leading-snug text-white">
                    {liveDirections[navStepIdx]?.instruction}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={navStepIdx <= 0}
                      onClick={() => setNavStepIdx((i) => Math.max(0, i - 1))}
                      className="flex-1 rounded-xl border border-white/20 bg-black/40 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        speakNav(
                          liveDirections[navStepIdx]?.instruction || "Continue",
                        )
                      }
                      className="flex-1 rounded-xl border border-blue/40 bg-blue/25 py-2.5 text-[13px] font-bold text-white"
                    >
                      Repeat
                    </button>
                    <button
                      type="button"
                      disabled={navStepIdx >= liveDirections.length - 1}
                      onClick={() =>
                        setNavStepIdx((i) =>
                          Math.min(liveDirections.length - 1, i + 1),
                        )
                      }
                      className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-[13px] font-bold text-black disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                  <p className="text-[11px] text-white">
                    Speaks each step on your phone. Use Next as you drive.
                  </p>
                </section>
              ) : null}

              {routeStatus === "live" && liveDirections && liveDirections.length > 0 ? (
                <section className="glass-prestige space-y-2 rounded-[1.25rem] p-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[12px] font-bold tracking-[0.12em] text-white">
                      TURN-BY-TURN
                    </h2>
                    <span className="text-[11px] font-semibold text-blue">
                      {liveDirections.length} steps · {formatMiles(route.miles)}{" "}
                      mi
                    </span>
                  </div>
                  <div className="max-h-72 space-y-1.5 overflow-y-auto">
                    {liveDirections.map((d, i) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setNavStepIdx(i);
                          if (navArmed) speakNav(d.instruction);
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left",
                          navArmed && i === navStepIdx
                            ? "border-emerald-400/50 bg-emerald-500/15"
                            : "border-white/12 bg-black/30",
                        )}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue/25 text-[12px] font-bold text-blue">
                          {i + 1}
                        </span>
                        <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white">
                          {d.instruction}
                        </p>
                        <span className="shrink-0 text-[12px] font-bold tabular-nums text-white">
                          {d.mi} mi
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : routeStatus === "loading" ? (
                <p className="rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white">
                  Building RV-aware route…
                </p>
              ) : !hasRoutePoints ? (
                <p className="rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white">
                  Enter start + destination, then{" "}
                  <span className="font-bold">Calculate RV Route</span> for
                  miles, time, and spoken turn-by-turn.
                </p>
              ) : null}

              {locked && originPlace && destPlace && osrm ? (
                <div className="space-y-2">
                  {alerts.length === 0 ? (
                    <p className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-white">
                      {restriction.summary ||
                        "No route-specific restrictions for this locked profile."}
                    </p>
                  ) : (
                    <AlertsBlock alerts={alerts} />
                  )}
                  {restriction.canSuggestSafer || alerts.length > 0 ? (
                    <button
                      type="button"
                      disabled={saferBusy}
                      onClick={() => void applySaferRoute()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue/40 bg-blue/20 py-3 text-[13px] font-bold text-white disabled:opacity-50"
                    >
                      <Navigation className="size-4" />
                      {saferBusy
                        ? "Finding safer RV route…"
                        : "Reroute to safer RV path"}
                    </button>
                  ) : null}
                  {saferNote ? (
                    <p className="text-[11px] text-white">{saferNote}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {sub === "directions" ? (
            <section className="glass-prestige space-y-2 rounded-[1.25rem] p-3.5">
              <h2 className="text-[13px] font-bold tracking-[0.12em] text-white">
                RV-AWARE DIRECTIONS
              </h2>
              {routeStatus !== "live" || !liveDirections?.length ? (
                <p className="text-[13px] text-white">
                  Calculate a route on Navigate to fill this list with live
                  OSRM steps.
                </p>
              ) : (
                liveDirections.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-start gap-3 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue/25 text-[12px] font-bold text-blue">
                      {i + 1}
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white">
                      {d.instruction}
                    </p>
                    <span className="shrink-0 text-[12px] font-bold tabular-nums text-white">
                      {d.mi} mi
                    </span>
                  </div>
                ))
              )}
            </section>
          ) : null}

          {sub === "campgrounds" ? (
            <section className="space-y-2.5">
              <h2 className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-white">
                <Tent className="size-3.5 text-emerald-400" />
                CAMPGROUNDS
              </h2>
              <p className="text-[12px] text-white">
                Sample pads near popular corridors — filter by your locked
                length when set.
              </p>
              {DEMO_CAMPS.filter(
                (c) => !locked || c.maxLengthFt >= locked.lengthFt,
              ).map((c) => (
                <div
                  key={c.id}
                  className="glass-prestige flex items-start gap-3 rounded-[1.15rem] p-3.5"
                >
                  <Tent className="mt-0.5 size-5 text-emerald-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-white">
                      ~{c.miFromMidpoint} mi · max {c.maxLengthFt} ft
                      {c.hasHookups ? " · hookups" : " · dry"}
                    </p>
                  </div>
                  <a
                    href={c.campspotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              ))}
            </section>
          ) : null}

          {sub === "dumps" ? (
            <section className="space-y-2.5">
              <h2 className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-white">
                <Droplets className="size-3.5 text-sky-300" />
                FREE SEWER DUMPS
              </h2>
              <p className="text-[12px] leading-relaxed text-white/90">
                Public and no-fee sanitary dumps on major western corridors.
                Hours change — confirm before you pull in.
                {dumpNearLat != null
                  ? " Sorted by distance from your start or destination."
                  : " Set a start location on Navigate to sort by distance."}
              </p>

              <div className="flex gap-2">
                <input
                  value={dumpQuery}
                  onChange={(e) => setDumpQuery(e.target.value)}
                  placeholder="Search city, highway, or name"
                  className="glass-field min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/60"
                  aria-label="Search dump stations"
                />
                <button
                  type="button"
                  onClick={() => void useCurrentLocation()}
                  disabled={locating}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/35 text-white"
                  aria-label="Use current location to sort dumps"
                >
                  {locating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LocateFixed className="size-4" />
                  )}
                </button>
              </div>

              <div
                className="flex gap-1.5 overflow-x-auto pb-0.5"
                style={{ scrollbarWidth: "none" }}
              >
                <button
                  type="button"
                  onClick={() => setDumpState(null)}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold",
                    !dumpState
                      ? "border-sky-300/50 bg-sky-500/25 text-white"
                      : "border-white/20 bg-black/30 text-white/85",
                  )}
                >
                  All
                </button>
                {DUMP_STATES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDumpState((cur) => (cur === st ? null : st))}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold",
                      dumpState === st
                        ? "border-sky-300/50 bg-sky-500/25 text-white"
                        : "border-white/20 bg-black/30 text-white/85",
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-semibold text-white">
                {dumpList.length} station{dumpList.length === 1 ? "" : "s"}
              </p>

              <DumpMap
                stations={dumpList}
                selectedId={dumpFocusId}
                onSelect={(id) => {
                  setDumpFocusId(id);
                  const el = document.getElementById(`dump-${id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }}
                youAreHere={
                  dumpNearLat != null && dumpNearLng != null
                    ? { lat: dumpNearLat, lng: dumpNearLng }
                    : null
                }
              />

              {dumpList.length === 0 ? (
                <p className="rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[13px] text-white">
                  No dumps match that search. Try another state or city.
                </p>
              ) : (
                dumpList.map((d) => (
                  <div
                    key={d.id}
                    id={`dump-${d.id}`}
                    className={cn(
                      "glass-prestige space-y-2 rounded-[1.15rem] p-3.5",
                      dumpFocusId === d.id && "ring-1 ring-sky-400/70",
                    )}
                    onClick={() => setDumpFocusId(d.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Droplets className="mt-0.5 size-5 shrink-0 text-sky-300" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold leading-snug text-white">
                          {d.name}
                        </p>
                        <p className="text-[11px] text-white/85">
                          {d.city}, {d.state}
                          {typeof d.miles === "number"
                            ? ` · ${d.miles < 10 ? d.miles.toFixed(1) : Math.round(d.miles)} mi`
                            : ""}
                        </p>
                        <p className="mt-1 text-[11px] text-white/80">
                          {DUMP_KIND_LABEL[d.kind]} · {d.hours} ·{" "}
                          {d.water === "potable"
                            ? "potable water"
                            : d.water === "rinse"
                              ? "rinse water"
                              : "no water"}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-white/85">
                          {d.notes}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => routeToDump(d)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue py-2.5 text-[12px] font-bold text-white"
                      >
                        <Navigation className="size-3.5" />
                        Route here
                      </button>
                      <a
                        href={mapsUrl(d)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-black/35 py-2.5 text-[12px] font-bold text-white"
                      >
                        <ExternalLink className="size-3.5" />
                        Maps
                      </a>
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : null}

          {sub === "pack" ? (
            <section className="glass-prestige space-y-2 rounded-[1.25rem] p-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold tracking-[0.12em] text-white">
                  PACK LIST
                </h2>
                <span className="text-[11px] text-white">
                  {packDone}/{pack.length}
                </span>
              </div>
              {pack.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setPack((list) =>
                      list.map((x) =>
                        x.id === p.id ? { ...x, done: !x.done } : x,
                      ),
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded border text-[10px] font-bold",
                      p.done
                        ? "border-emerald-400 bg-emerald-500 text-black"
                        : "border-white/30 text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span
                    className={cn(
                      "text-[13px] font-semibold text-white",
                      p.done && "line-through opacity-60",
                    )}
                  >
                    {p.item}
                  </span>
                </button>
              ))}
            </section>
          ) : null}
        </div>
      </div>

      {sheet ? (
        <SelectSheet
          open
          title={
            sheet === "year"
              ? "Year"
              : sheet === "make"
                ? "Make"
                : sheet === "model"
                  ? "Model"
                  : "Floorplan"
          }
          items={(
            sheet === "year"
              ? TRIP_YEARS
              : sheet === "make"
                ? makes
                : sheet === "model"
                  ? models
                  : floorplans
          ).map((v) => ({ value: v, label: v }))}
          selected={
            sheet === "year"
              ? year
              : sheet === "make"
                ? make
                : sheet === "model"
                  ? model
                  : floorplan
          }
          onSelect={(v) => {
            if (sheet === "year") {
              setYear(v);
              setMake("");
              setModel("");
              setFloorplan("");
            } else if (sheet === "make") {
              setMake(v);
              setModel("");
              setFloorplan("");
            } else if (sheet === "model") {
              setModel(v);
              setFloorplan("");
            } else {
              setFloorplan(v);
            }
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
          allowCustom
          customLabel="Type your own"
        />
      ) : null}
    </div>
  );
}

function FieldBtn({
  label,
  value,
  onClick,
  disabled,
}: {
  label: string;
  value: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-left disabled:opacity-40"
    >
      <span className="block text-[9px] font-bold tracking-wide text-white">
        {label}
      </span>
      <span className="mt-0.5 block truncate text-[13px] font-bold text-white">
        {value}
      </span>
    </button>
  );
}

function AlertsBlock({ alerts }: { alerts: TripAlert[] }) {
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={cn(
            "rounded-xl border px-3 py-2.5",
            a.severity === "critical"
              ? "border-ruby/40 bg-ruby/15"
              : a.severity === "caution"
                ? "border-amber/40 bg-amber/10"
                : "border-white/15 bg-black/30",
          )}
        >
          <p className="text-[10px] font-bold tracking-wide text-white">
            {a.kind}
          </p>
          <p className="mt-0.5 text-[13px] font-bold text-white">{a.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white">{a.body}</p>
        </div>
      ))}
    </div>
  );
}
