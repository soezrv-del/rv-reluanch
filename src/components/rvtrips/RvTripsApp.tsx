import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  ChevronRight,
  Droplets,
  ExternalLink,
  ListChecks,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Navigation,
  Plus,
  Tent,
  Unlock,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RVTRIPS_AMERICA_BACKDROP } from "@/assets/tripMedia";
import {
  DEMO_PACK,
  SAMPLE_CAMPS,
  formatDrive,
  formatMiles,
  type TripAlert,
  type TripRoute,
} from "@/lib/trips/tripData";
import {
  fetchOsrmRoute,
  type OsrmLngLat,
  type OsrmRouteResult,
} from "@/lib/trips/osrm";
import {
  fetchNavigateRoute,
  mergeLiveLegs,
  routeEngineLabel,
} from "@/lib/trips/navigateRoute";
import {
  liveProviderNote,
  liveRouteStats,
  tripRouteFromLive,
} from "@/lib/trips/routeResults";
import {
  anyDimEstimated,
  clearLockedProfile,
  coachIdentityKey,
  coachIsReady,
  EMPTY_COACH_PROFILE,
  loadLockedProfile,
  profileIsComplete,
  resolveTripsProfileSeed,
  saveLockedProfile,
  suggestCoachFromSelection,
  TRIP_YEARS,
  type CoachProfile,
  type CoachSeedSource,
} from "@/lib/trips/coachFromCatalog";
import { readActiveCoach } from "@/lib/rv/activeCoach";
import { loadLatestSavedUnit } from "@/lib/rv/savedUnits";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  analyzeRouteRestrictions,
  saferAppliedNote,
  saferBusyLabel,
  saferCtaLabel,
  saferOsrmParams,
  saferRouteIntent,
} from "@/lib/trips/routeRestrictions";
import {
  getFloorplansForYear,
  getMakesForYear,
  getModelsForYearMake,
  useCatalogReady,
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
import { FuelAlongRoute } from "@/components/rvtrips/FuelAlongRoute";
import { CampsAlongRoute } from "@/components/rvtrips/CampsAlongRoute";
import { RouteBasemap } from "@/components/rvtrips/RouteBasemap";
import {
  buildFuelQuery,
  downsampleByDistance,
  sortAlongCorridor,
  type FuelSearchResult,
  type FuelStop,
} from "@/lib/trips/corridorFuel";
import {
  buildCampsQuery,
  type CampSearchResult,
  type CampStop,
} from "@/lib/trips/corridorCamps";
import {
  canSubmitPlan,
  defaultTripName,
  GEOCODE_DEBOUNCE_MS,
  loadLastKnownOrigin,
  MAX_VIAS,
  newViaId,
  originIsDevice,
  PLAN_DEST_CHIPS,
  PLAN_VIA_CHIPS,
  saveLastKnownOrigin,
  shouldTypeahead,
  type PlanPlace,
} from "@/lib/trips/planTrip";
import {
  deleteSavedTrip,
  loadSavedTrips,
  sameCorridor,
  saveTrip,
  type SavedTrip,
} from "@/lib/trips/savedTrip";

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
  { id: "campgrounds", label: "Camps", icon: Tent },
  { id: "dumps", label: "Dumps", icon: Droplets },
  { id: "pack", label: "Pack List", icon: ListChecks },
  { id: "profile", label: "Profile", icon: User },
];

type PlaceHit = PlanPlace;
type GeoTarget = "origin" | "dest" | `via:${string}`;
type ViaDraft = { id: string; text: string; place: PlaceHit | null };

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
  const shellNav = useShellNavOptional();

  const bootSeed = useMemo(() => {
    try {
      const savedUnit = loadLatestSavedUnit();
      return resolveTripsProfileSeed({
        locked: loadLockedProfile(),
        activeCoach: readActiveCoach(),
        savedCoach: savedUnit
          ? {
              year: savedUnit.year,
              make: savedUnit.make,
              model: savedUnit.model,
              floorplan: savedUnit.floorplan,
              rvType: savedUnit.data?.type ?? undefined,
            }
          : null,
      });
    } catch {
      return null;
    }
  }, []);

  const [year, setYear] = useState(bootSeed?.profile.year ?? "");
  const [make, setMake] = useState(bootSeed?.profile.make ?? "");
  const [model, setModel] = useState(bootSeed?.profile.model ?? "");
  const [floorplan, setFloorplan] = useState(bootSeed?.profile.floorplan ?? "");
  const [sheet, setSheet] = useState<SheetId>(null);
  const { gen: catalogGen } = useCatalogReady();

  const [draft, setDraft] = useState<CoachProfile>(
    bootSeed?.profile ?? EMPTY_COACH_PROFILE,
  );
  const [locked, setLocked] = useState<CoachProfile | null>(
    bootSeed?.source === "locked" ? bootSeed.profile : null,
  );
  const [seedSource, setSeedSource] = useState<CoachSeedSource | null>(
    bootSeed?.source ?? null,
  );
  const lastAutoKeyRef = useRef(
    bootSeed ? coachIdentityKey(bootSeed.profile) : "",
  );

  const bootOrigin = useMemo(() => {
    try {
      return loadLastKnownOrigin();
    } catch {
      return null;
    }
  }, []);
  const [originText, setOriginText] = useState(bootOrigin?.label ?? "");
  const [destText, setDestText] = useState("");
  const [originPlace, setOriginPlace] = useState<PlaceHit | null>(bootOrigin);
  const [destPlace, setDestPlace] = useState<PlaceHit | null>(null);
  const [vias, setVias] = useState<ViaDraft[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => {
    try {
      return loadSavedTrips();
    } catch {
      return [];
    }
  });
  const [originOpen, setOriginOpen] = useState(!bootOrigin);
  const [geoHits, setGeoHits] = useState<PlaceHit[]>([]);
  const [geoFor, setGeoFor] = useState<GeoTarget | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const geoAbortRef = useRef<AbortController | null>(null);
  const didAutoLocate = useRef(false);

  const [route, setRoute] = useState<TripRoute | null>(null);
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
  const [fuel, setFuel] = useState<FuelSearchResult | null>(null);
  const [fuelStatus, setFuelStatus] = useState<
    "idle" | "loading" | "live" | "error"
  >("idle");
  const [fuelFocusId, setFuelFocusId] = useState<string | null>(null);
  const [camps, setCamps] = useState<CampSearchResult | null>(null);
  const [campsStatus, setCampsStatus] = useState<
    "idle" | "loading" | "live" | "error"
  >("idle");
  const [campFocusId, setCampFocusId] = useState<string | null>(null);
  const [showSampleCamps, setShowSampleCamps] = useState(false);

  const applySeedIdentity = useCallback((p: CoachProfile, source: CoachSeedSource) => {
    lastAutoKeyRef.current = coachIdentityKey(p);
    setYear(p.year);
    setMake(p.make);
    setModel(p.model);
    setFloorplan(p.floorplan);
    setDraft(p);
    setSeedSource(source);
  }, []);

  useEffect(() => {
    const facts = readActiveCoach();
    const savedUnit = loadLatestSavedUnit();
    const resolved = resolveTripsProfileSeed({
      locked: loadLockedProfile(),
      activeCoach: facts,
      savedCoach: savedUnit
        ? {
            year: savedUnit.year,
            make: savedUnit.make,
            model: savedUnit.model,
            floorplan: savedUnit.floorplan,
            rvType: savedUnit.data?.type ?? undefined,
          }
        : null,
    });
    if (!resolved) return;
    applySeedIdentity(resolved.profile, resolved.source);
    if (resolved.source === "locked") setLocked(resolved.profile);
  }, [applySeedIdentity]);

  useEffect(() => {
    if (locked || loadLockedProfile()) return;
    const coach = shellNav?.activeCoach;
    if (!coach?.year || !coach.make || !coach.model) return;
    const key = coachIdentityKey(coach);
    if (key === lastAutoKeyRef.current) return;
    const suggested = suggestCoachFromSelection({
      year: coach.year,
      make: coach.make,
      model: coach.model,
      floorplan: coach.floorplan || "",
      gvwrLbs: coach.gvwrLbs,
      uvwLbs: coach.uvwLbs,
      rvType: coach.rvType,
    });
    applySeedIdentity({ ...suggested, seedSource: "facts" }, "facts");
  }, [shellNav?.activeCoach, locked, applySeedIdentity]);

  const makes = useMemo(() => getMakesForYear(year), [year, catalogGen]);
  const models = useMemo(
    () => (year && make ? getModelsForYearMake(year, make) : []),
    [year, make, catalogGen],
  );
  const floorplans = useMemo(
    () =>
      year && make && model ? getFloorplansForYear(year, make, model) : [],
    [year, make, model, catalogGen],
  );

  const factsWeights = useMemo(
    () => ({
      gvwrLbs: shellNav?.activeCoach?.gvwrLbs,
      uvwLbs: shellNav?.activeCoach?.uvwLbs,
      rvType: shellNav?.activeCoach?.rvType,
    }),
    [shellNav?.activeCoach],
  );

  useEffect(() => {
    if (!year || !make || !model) {
      return;
    }
    const suggested = suggestCoachFromSelection({
      year,
      make,
      model,
      floorplan,
      gvwrLbs: factsWeights.gvwrLbs,
      uvwLbs: factsWeights.uvwLbs,
      rvType: factsWeights.rvType,
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
          dimSources: prev.dimSources ?? suggested.dimSources,
        };
      }
      return {
        ...suggested,
        locked: false,
        seedSource: seedSource ?? suggested.seedSource ?? "manual",
      };
    });
  }, [year, make, model, floorplan, catalogGen, factsWeights, seedSource]);

  const displayCoach = locked ?? (coachIsReady(draft) ? draft : null);

  const viaPlaces = useMemo(
    () => vias.map((v) => v.place).filter((p): p is PlaceHit => p != null),
    [vias],
  );
  const viaSig = viaPlaces.map((p) => `${p.lng.toFixed(4)},${p.lat.toFixed(4)}`).join("|");

  const restriction = useMemo(
    () =>
      analyzeRouteRestrictions({
        coach: displayCoach,
        route: osrm,
        hasRoute: Boolean(originPlace && destPlace && osrm),
        destLabel:
          [viaPlaces.map((p) => p.label).join(" "), destPlace?.label || route?.destination.label || ""]
            .filter(Boolean)
            .join(" ") || "",
        originLabel: originPlace?.label || route?.origin.label || "",
      }),
    [displayCoach, osrm, originPlace, destPlace, viaPlaces, route?.destination.label, route?.origin.label],
  );
  const alerts = restriction.alerts;
  const saferIntent = saferRouteIntent({
    coach: displayCoach,
    route: osrm,
    canSuggestSafer: restriction.canSuggestSafer,
  });

  const coachLine = useMemo(() => {
    if (!displayCoach) return "Route without a profile — or add your coach";
    const y = displayCoach.year ? `${displayCoach.year} ` : "";
    const fp = displayCoach.floorplan ? ` · ${displayCoach.floorplan}` : "";
    return `${y}${displayCoach.make} ${displayCoach.model}${fp} · ${displayCoach.heightFt}′H · ${displayCoach.lengthFt}′L`;
  }, [displayCoach]);

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
      viaPts: PlaceHit[] = [],
    ) => {
      const ctrl = new AbortController();
      setRouteStatus("loading");
      setRouteError(null);
      setNavArmed(false);
      setNavStepIdx(0);
      fetchNavigateRoute({
        from,
        to,
        via: viaPts.map((p) => ({ lng: p.lng, lat: p.lat })),
        coach: locked,
        signal: ctrl.signal,
      })
        .then((data) => {
          const next = tripRouteFromLive(data, originLabel, destLabel, {
            viaLabels: viaPts.map((p) => p.label),
          });
          if (!next) {
            setOsrm(null);
            setRoute(null);
            setRouteStatus("offline");
            setRouteError("Route returned no miles or time");
            return;
          }
          setOsrm(data);
          setRoute(next);
          setRouteStatus("live");
        })
        .catch((e) => {
          if (ctrl.signal.aborted) return;
          setOsrm(null);
          setRoute(null);
          setRouteStatus("offline");
          setRouteError(
            e instanceof Error ? e.message : "Routing unavailable",
          );
        });
      return () => ctrl.abort();
    },
    [locked],
  );

  useEffect(() => {
    if (!originPlace || !destPlace) return;
    return runRoute(
      { lng: originPlace.lng, lat: originPlace.lat },
      { lng: destPlace.lng, lat: destPlace.lat },
      destPlace.label,
      originPlace.label,
      viaPlaces,
    );
    // viaSig tracks filled stops; empty via rows do not retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originPlace, destPlace, viaSig, routeKey, runRoute]);

  useEffect(() => {
    if (routeStatus !== "live" || !originPlace || !destPlace) {
      setFuel(null);
      setFuelStatus("idle");
      setFuelFocusId(null);
      return;
    }
    const ctrl = new AbortController();
    setFuelStatus("loading");
    setFuelFocusId(null);
    const path = osrm?.geometry?.coordinates?.length
      ? osrm.geometry.coordinates.map(([lng, lat]) => ({ lng, lat }))
      : [originPlace, ...viaPlaces, destPlace];
    const qs = buildFuelQuery({
      from: { lng: originPlace.lng, lat: originPlace.lat },
      to: { lng: destPlace.lng, lat: destPlace.lat },
      via: viaPlaces.map((p) => ({ lng: p.lng, lat: p.lat })),
      path: downsampleByDistance(path, 24),
    });
    fetch(`/api/fuel?${qs}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const json = (await res.json()) as FuelSearchResult & { error?: string };
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          setFuel(null);
          setFuelStatus("error");
          return;
        }
        setFuel(json);
        setFuelStatus("live");
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setFuel(null);
        setFuelStatus("error");
      });
    return () => ctrl.abort();
    // viaSig covers filled overnight stops; geometry comes from the live route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStatus, osrm, originPlace, destPlace, viaSig]);

  useEffect(() => {
    if (routeStatus !== "live" || !originPlace || !destPlace) {
      setCamps(null);
      setCampsStatus("idle");
      setCampFocusId(null);
      return;
    }
    const ctrl = new AbortController();
    setCampsStatus("loading");
    setCampFocusId(null);
    const path = osrm?.geometry?.coordinates?.length
      ? osrm.geometry.coordinates.map(([lng, lat]) => ({ lng, lat }))
      : [originPlace, ...viaPlaces, destPlace];
    const qs = buildCampsQuery({
      from: { lng: originPlace.lng, lat: originPlace.lat },
      to: { lng: destPlace.lng, lat: destPlace.lat },
      via: viaPlaces.map((p) => ({ lng: p.lng, lat: p.lat })),
      path: downsampleByDistance(path, 24),
      widthMi: 15,
    });
    fetch(`/api/camps?${qs}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const json = (await res.json()) as CampSearchResult & { error?: string };
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          setCamps(null);
          setCampsStatus("error");
          return;
        }
        setCamps(json);
        setCampsStatus("live");
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setCamps(null);
        setCampsStatus("error");
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStatus, osrm, originPlace, destPlace, viaSig]);

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

  const commitOrigin = useCallback((hit: PlaceHit) => {
    setOriginPlace(hit);
    setOriginText(hit.label);
    setOriginOpen(false);
    saveLastKnownOrigin(hit);
    setNavArmed(false);
    setNavStepIdx(0);
  }, []);

  const searchPlace = async (q: string, which: GeoTarget) => {
    geoAbortRef.current?.abort();
    const ctrl = new AbortController();
    geoAbortRef.current = ctrl;
    setGeoFor(which);
    setGeoLoading(true);
    if (which === "origin") setLocateError(null);
    try {
      const res = await fetch(
        `/api/geocode?q=${encodeURIComponent(q.trim() || " ")}`,
        { signal: ctrl.signal },
      );
      const json = (await res.json()) as { hits?: PlaceHit[] };
      if (ctrl.signal.aborted) return;
      setGeoHits(json.hits || []);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setGeoHits([]);
    } finally {
      if (!ctrl.signal.aborted) setGeoLoading(false);
    }
  };

  const pickPlace = (hit: PlaceHit) => {
    const which = geoFor;
    setGeoHits([]);
    setGeoFor(null);
    setLocateError(null);
    setNavArmed(false);
    setNavStepIdx(0);
    if (which === "origin") {
      commitOrigin(hit);
      return;
    }
    if (which && which.startsWith("via:")) {
      const id = which.slice(4);
      setVias((rows) =>
        rows.map((v) => (v.id === id ? { ...v, text: hit.label, place: hit } : v)),
      );
      return;
    }
    setDestPlace(hit);
    setDestText(hit.label);
    if (originPlace) setRouteKey((k) => k + 1);
  };

  const useCurrentLocation = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const quiet = Boolean(opts?.quiet);
      if (!quiet) setLocateError(null);
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

        commitOrigin({ label, lat, lng, kind: "current" });
      } catch (err) {
        if (!quiet) setLocateError(geoErrorMessage(err));
      } finally {
        setLocating(false);
      }
    },
    [commitOrigin],
  );

  useEffect(() => {
    if (didAutoLocate.current) return;
    didAutoLocate.current = true;
    void useCurrentLocation({ quiet: Boolean(bootOrigin) });
  }, [bootOrigin, useCurrentLocation]);

  useEffect(() => {
    if (!shouldTypeahead(destText, destPlace)) return;
    const t = window.setTimeout(() => {
      void searchPlace(destText, "dest");
    }, GEOCODE_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [destText, destPlace]);

  useEffect(() => {
    if (!originOpen) return;
    if (!shouldTypeahead(originText, originPlace)) return;
    const t = window.setTimeout(() => {
      void searchPlace(originText, "origin");
    }, GEOCODE_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [originOpen, originText, originPlace]);

  useEffect(() => {
    const drafts = vias.filter((v) => shouldTypeahead(v.text, v.place));
    const draft = drafts[drafts.length - 1];
    if (!draft) return;
    const t = window.setTimeout(() => {
      void searchPlace(draft.text, `via:${draft.id}`);
    }, GEOCODE_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [vias]);

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
      if (o) commitOrigin(o);
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
    const nextVias: ViaDraft[] = [];
    for (const row of vias) {
      if (row.place) {
        nextVias.push(row);
        continue;
      }
      if (!row.text.trim()) {
        nextVias.push(row);
        continue;
      }
      const r = await fetch(
        `/api/geocode?q=${encodeURIComponent(row.text.trim())}`,
      );
      const j = (await r.json()) as { hits?: PlaceHit[] };
      const hit = j.hits?.[0] || null;
      if (!hit) {
        setRouteError("Could not find that stop — try a city name");
        return;
      }
      nextVias.push({ ...row, text: hit.label, place: hit });
    }
    if (nextVias.some((v, i) => v.place !== vias[i]?.place)) {
      setVias(nextVias);
    }
    if (o && d) setRouteKey((k) => k + 1);
    else
      setRouteError(
        "Could not find that address — try a city name (e.g. Seattle, WA)",
      );
  };

  const lockProfile = () => {
    if (!profileIsComplete(draft)) return;
    const next = { ...draft, locked: true as const, seedSource: "locked" as const };
    setLocked(next);
    setSeedSource("locked");
    lastAutoKeyRef.current = coachIdentityKey(next);
    saveLockedProfile(next);
  };

  const unlockProfile = () => {
    setLocked(null);
    clearLockedProfile();
    setSeedSource(seedSource === "locked" ? "manual" : seedSource);
  };

  const applySaferRoute = async () => {
    if (!originPlace || !destPlace || !displayCoach) return;
    const intent = saferRouteIntent({
      coach: displayCoach,
      route: osrm,
      canSuggestSafer: true,
    });
    if (intent === "none") return;
    setSaferBusy(true);
    setSaferNote(null);
    try {
      const from = { lng: originPlace.lng, lat: originPlace.lat };
      const to = { lng: destPlace.lng, lat: destPlace.lat };
      const via = viaPlaces.map((p) => ({ lng: p.lng, lat: p.lat }));
      let data: OsrmRouteResult | null = null;

      if (intent === "here_truck") {
        data = await fetchNavigateRoute({
          from,
          to,
          via: via.length ? via : undefined,
          coach: displayCoach,
        });
      } else {
        const safer = saferOsrmParams(displayCoach);
        const points: OsrmLngLat[] = [from, ...via, to];
        const legs = [];
        for (let i = 0; i < points.length - 1; i++) {
          legs.push(
            await fetchOsrmRoute({
              from: points[i]!,
              to: points[i + 1]!,
              weight: safer.weight,
              exclude: safer.exclude,
              bypassCache: true,
            }),
          );
        }
        data = mergeLiveLegs(legs);
      }

      if (!data) {
        setSaferNote("Safer route returned no miles or time");
        return;
      }
      const next = tripRouteFromLive(data, originPlace.label, destPlace.label, {
        id: `safer-${data.fetchedAt || "live"}`,
        engineExtra: intent === "here_truck" ? "HERE Truck" : "OSRM re-rank",
        viaLabels: viaPlaces.map((p) => p.label),
      });
      if (!next) {
        setSaferNote("Safer route returned no miles or time");
        return;
      }
      setOsrm(data);
      setRoute(next);
      setRouteStatus("live");
      setSaferNote(saferAppliedNote(intent, data));
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

  const pickDest = (hit: PlaceHit) => {
    setDestPlace(hit);
    setDestText(hit.label);
    setGeoHits([]);
    setGeoFor(null);
    setNavArmed(false);
    setNavStepIdx(0);
    if (originPlace) setRouteKey((k) => k + 1);
  };

  const emptyVia = vias.find((v) => !v.place);

  const pickChip = (hit: PlaceHit) => {
    if (destPlace && emptyVia) {
      setVias((rows) =>
        rows.map((v) =>
          v.id === emptyVia.id ? { ...v, text: hit.label, place: hit } : v,
        ),
      );
      setGeoHits([]);
      setGeoFor(null);
      setNavArmed(false);
      setNavStepIdx(0);
      return;
    }
    pickDest(hit);
  };

  const addVia = () => {
    if (vias.length >= MAX_VIAS) return;
    setVias((rows) => [...rows, { id: newViaId(), text: "", place: null }]);
    setGeoHits([]);
    setGeoFor(null);
  };

  const removeVia = (id: string) => {
    setVias((rows) => rows.filter((v) => v.id !== id));
    setGeoHits([]);
    setGeoFor(null);
    setNavArmed(false);
    setNavStepIdx(0);
  };

  const openSavedTrip = (trip: SavedTrip) => {
    setOriginPlace(trip.origin);
    setOriginText(trip.origin.label);
    setOriginOpen(false);
    saveLastKnownOrigin(trip.origin);
    setVias(
      trip.vias.map((p) => ({ id: newViaId(), text: p.label, place: p })),
    );
    setDestPlace(trip.dest);
    setDestText(trip.dest.label);
    setGeoHits([]);
    setGeoFor(null);
    setNavArmed(false);
    setNavStepIdx(0);
    setRouteKey((k) => k + 1);
  };

  const persistTrip = () => {
    if (!originPlace || !destPlace) return;
    const saved = saveTrip({
      origin: originPlace,
      dest: destPlace,
      vias: viaPlaces,
    });
    if (saved) setSavedTrips(loadSavedTrips());
  };

  const forgetTrip = (id: string) => {
    setSavedTrips(deleteSavedTrip(id));
  };

  const corridor =
    originPlace && destPlace
      ? defaultTripName(originPlace, destPlace, viaPlaces)
      : "";
  const alreadySaved = Boolean(
    originPlace &&
      destPlace &&
      savedTrips.some((t) =>
        sameCorridor(t, {
          origin: originPlace,
          dest: destPlace,
          vias: viaPlaces,
        }),
      ),
  );

  const routeToDump = (d: (typeof dumpList)[number]) => {
    pickDest({
      label: `${d.name} · ${d.city}, ${d.state}`,
      lat: d.lat,
      lng: d.lng,
      kind: "dump",
    });
    setSub("navigate");
  };

  const routeViaPoi = (
    stop: Pick<FuelStop | CampStop, "name" | "city" | "state" | "lat" | "lng" | "kind">,
  ) => {
    const hit: PlaceHit = {
      label: stop.city
        ? `${stop.name} · ${stop.city}${stop.state ? `, ${stop.state}` : ""}`
        : stop.name,
      lat: stop.lat,
      lng: stop.lng,
      kind: stop.kind,
    };
    const corridor =
      osrm?.geometry?.coordinates?.map(([lng, lat]) => ({ lng, lat })) ??
      (originPlace && destPlace
        ? [originPlace, ...viaPlaces, destPlace]
        : []);
    setVias((rows) => {
      const filled = rows
        .filter((v) => v.place)
        .map((v) => ({ ...v, text: v.place!.label }));
      const empty = rows.find((v) => !v.place);
      let next: ViaDraft[];
      if (empty) {
        next = rows.map((v) =>
          v.id === empty.id ? { ...v, text: hit.label, place: hit } : v,
        );
      } else if (filled.length >= MAX_VIAS) {
        return rows;
      } else {
        next = [...rows, { id: newViaId(), text: hit.label, place: hit }];
      }
      if (corridor.length >= 2) {
        const withPlace = next.filter((v) => v.place);
        const ordered = sortAlongCorridor(
          withPlace.map((v) => v.place!),
          corridor,
        );
        const used = new Set<string>();
        next = ordered.map((p) => {
          const match = withPlace.find(
            (v) =>
              v.place &&
              !used.has(v.id) &&
              v.place.lat === p.lat &&
              v.place.lng === p.lng,
          );
          if (match) used.add(match.id);
          return match ?? { id: newViaId(), text: p.label, place: p };
        });
      }
      return next;
    });
    setFuelFocusId(null);
    setCampFocusId(null);
    setNavArmed(false);
    setNavStepIdx(0);
    setSub("navigate");
  };

  const viaSlotsFull =
    viaPlaces.length >= MAX_VIAS && !vias.some((v) => !v.place);

  const liveStats = liveRouteStats(osrm);
  const engineChip = routeStatus === "live" ? routeEngineLabel(osrm) : "";
  const providerNote = liveProviderNote(osrm);

  const canRoute = canSubmitPlan({
    originPlace,
    originText,
    destPlace,
    destText,
  });
  const hasRoutePoints = Boolean(originPlace && destPlace);
  const canLock = profileIsComplete(draft) && !locked;
  const dimsReady = Boolean((year && make && model) || draft.lengthFt > 0);
  const dimsEstimated = anyDimEstimated(draft.dimSources);
  const profileBadge = locked
    ? "PROFILE LOCKED"
    : displayCoach
      ? seedSource === "facts"
        ? "FROM FACTS"
        : seedSource === "saved"
          ? "FROM SAVED"
          : "COACH READY"
      : "ADD PROFILE";

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
                    : displayCoach
                      ? "border-sky-400/40 bg-sky-500/15 text-sky-200"
                      : "border-white/25 bg-white/10 text-white/85",
                )}
              >
                {locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                {profileBadge}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-blue">
                {routeStatus === "live"
                  ? routeEngineLabel(osrm)
                  : routeStatus === "loading"
                    ? "Routing…"
                    : routeStatus === "offline"
                      ? "Route offline"
                      : hasRoutePoints
                        ? "Ready"
                        : "Where to?"}
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
                {seedSource === "facts"
                  ? "Filled from your Facts coach. Edit dims if your door sticker differs, then lock for map alerts."
                  : seedSource === "saved"
                    ? "Filled from a saved coach. Edit dims if needed, then lock for map alerts."
                    : seedSource === "locked"
                      ? "Locked for this device. Unlock to change coach or override dims."
                      : "Optional. Pick a coach or leave blank — routing still works."}
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
                      ["heightFt", "Height (ft)", "height"],
                      ["lengthFt", "Length (ft)", "length"],
                      ["widthFt", "Width (ft)", "width"],
                      ["weightLbs", "Weight (lbs)", "weight"],
                    ] as const
                  ).map(([key, label, dim]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-[10px] font-bold text-white">
                        {label}
                        {draft.dimSources?.[dim] === "estimate" ? (
                          <span className="ml-1 font-semibold text-amber">
                            · estimate
                          </span>
                        ) : draft.dimSources?.[dim] === "brochure" ? (
                          <span className="ml-1 font-semibold text-emerald-300">
                            · brochure
                          </span>
                        ) : draft.dimSources?.[dim] === "facts" ? (
                          <span className="ml-1 font-semibold text-sky-200">
                            · facts
                          </span>
                        ) : null}
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
                  Year, make, and model unlock dimension fields. Floorplan is
                  optional when catalog dims are already known.
                </p>
              )}
              {dimsReady && dimsEstimated ? (
                <p className="text-[11px] leading-snug text-amber">
                  Estimate = class or floorplan heuristic — confirm door sticker.
                  Brochure / Facts numbers stay labeled as such.
                </p>
              ) : null}
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
              <section className="glass-prestige space-y-2.5 rounded-[1.25rem] p-3.5">
                {originPlace && !originOpen ? (
                  <button
                    type="button"
                    onClick={() => setOriginOpen(true)}
                    className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-left"
                    aria-label="Change starting point"
                  >
                    {locating ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-sky-200" />
                    ) : (
                      <LocateFixed
                        className={cn(
                          "size-4 shrink-0",
                          originIsDevice(originPlace)
                            ? "text-emerald-300"
                            : "text-blue",
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
                      {originPlace.label}
                    </span>
                    <span className="text-[11px] font-bold text-blue">Change</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-[0.12em] text-white">
                        FROM
                      </span>
                      <button
                        type="button"
                        onClick={() => void useCurrentLocation()}
                        disabled={locating}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1 rounded-full border px-3 py-2 text-[11px] font-bold transition",
                          locating
                            ? "border-sky-300/40 bg-sky-500/20 text-sky-100"
                            : originIsDevice(originPlace)
                              ? "border-emerald-400/45 bg-emerald-500/20 text-emerald-100"
                              : "border-white/20 bg-black/35 text-white/90 hover:border-sky-300/40 hover:bg-sky-500/15",
                        )}
                        aria-label="Use my location as starting point"
                      >
                        {locating ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <LocateFixed className="size-3" />
                        )}
                        {locating ? "Locating…" : "Use my location"}
                      </button>
                    </div>
                    <input
                      value={originText}
                      onChange={(e) => {
                        setOriginText(e.target.value);
                        setOriginPlace(null);
                        setLocateError(null);
                      }}
                      placeholder="City or address"
                      className="glass-field min-h-11 w-full rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/70"
                      autoComplete="street-address"
                      aria-label="Starting from"
                    />
                  </div>
                )}
                {locateError ? (
                  <p className="text-[11px] leading-snug text-amber">
                    {locateError}
                  </p>
                ) : null}

                {vias.map((via) => (
                  <div key={via.id} className="flex items-center gap-1.5">
                    <input
                      value={via.text}
                      onChange={(e) => {
                        const text = e.target.value;
                        setVias((rows) =>
                          rows.map((v) =>
                            v.id === via.id ? { ...v, text, place: null } : v,
                          ),
                        );
                      }}
                      placeholder="Overnight"
                      className="glass-field min-h-11 min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/65"
                      aria-label="Overnight stop"
                    />
                    <button
                      type="button"
                      onClick={() => removeVia(via.id)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-white"
                      aria-label="Remove stop"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                {vias.length < MAX_VIAS ? (
                  <button
                    type="button"
                    onClick={addVia}
                    className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-white/18 bg-black/30 px-3 py-2 text-[12px] font-bold text-white"
                  >
                    <Plus className="size-3.5" />
                    Stop
                  </button>
                ) : null}

                <input
                  value={destText}
                  onChange={(e) => {
                    setDestText(e.target.value);
                    setDestPlace(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canRoute) {
                      e.preventDefault();
                      void geocodeAndRoute();
                    }
                  }}
                  placeholder="Where to?"
                  className="glass-field min-h-11 w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none placeholder:text-white/65"
                  aria-label="Destination"
                />

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
                          className="flex min-h-11 w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
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
                  {(destPlace && emptyVia ? PLAN_VIA_CHIPS : PLAN_DEST_CHIPS).map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => pickChip(chip)}
                      className="min-h-11 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-[11px] font-semibold text-white"
                    >
                      {chip.label.split(",")[0]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!canRoute}
                  onClick={() => void geocodeAndRoute()}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue px-3 py-3 text-[15px] font-bold text-white disabled:opacity-40"
                >
                  <Navigation className="size-4" />
                  Route
                </button>
                {routeError ? (
                  <p className="text-[12px] text-amber">{routeError}</p>
                ) : null}

                {savedTrips.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5" data-saved-trips>
                    {savedTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="flex min-h-11 items-center rounded-full border border-white/18 bg-black/35"
                      >
                        <button
                          type="button"
                          onClick={() => openSavedTrip(trip)}
                          className="max-w-[14rem] truncate px-3 py-2 text-[11px] font-semibold text-white"
                        >
                          {trip.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => forgetTrip(trip.id)}
                          className="pr-2.5 text-white/70"
                          aria-label={`Remove ${trip.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              {routeStatus === "loading" ? (
                <section className="glass-prestige rounded-[1.25rem] px-4 py-6">
                  <p className="text-[15px] font-semibold text-white">
                    Calculating…
                  </p>
                </section>
              ) : routeStatus === "live" && liveStats && osrm ? (
                <section
                  className="glass-prestige space-y-5 rounded-[1.25rem] p-4"
                  data-route-results
                  data-route-miles={String(liveStats.miles)}
                  data-route-drive={`${liveStats.driveHours}h ${String(liveStats.driveMinutes).padStart(2, "0")}m`}
                  data-route-engine={engineChip}
                >
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wide text-white/65">
                        Miles
                      </p>
                      <p className="mt-1 text-[34px] font-bold tabular-nums leading-none text-white">
                        {formatMiles(liveStats.miles)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold tracking-wide text-white/65">
                        Time
                      </p>
                      <p className="mt-1 text-[34px] font-bold tabular-nums leading-none text-white">
                        {formatDrive(
                          liveStats.driveHours,
                          liveStats.driveMinutes,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[12px] font-bold text-white">
                      {engineChip}
                    </span>
                    {alerts.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber">
                        <AlertTriangle className="size-3.5" />
                        {alerts.length}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={persistTrip}
                      className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[12px] font-bold text-white"
                      data-save-trip
                    >
                      <Bookmark className="size-3.5" />
                      {alreadySaved ? "Saved" : "Save"}
                    </button>
                  </div>

                  {corridor ? (
                    <p className="text-[14px] font-semibold leading-snug text-white">
                      {corridor}
                    </p>
                  ) : originPlace || destPlace ? (
                    <p className="text-[14px] font-semibold leading-snug text-white">
                      {originPlace?.label || route?.origin.label}
                      <span className="mx-1.5 text-white/50">→</span>
                      {destPlace?.label || route?.destination.label}
                    </p>
                  ) : null}

                  {providerNote ? (
                    <p className="text-[12px] leading-snug text-white/75">
                      {providerNote}
                    </p>
                  ) : null}

                  <RouteBasemap
                    geometry={osrm.geometry}
                    origin={originPlace}
                    destination={destPlace}
                    vias={viaPlaces}
                    fuelStops={fuel?.stops}
                    selectedFuelId={fuelFocusId}
                    onSelectFuel={(id) => setFuelFocusId(id || null)}
                    campStops={camps?.camps}
                    selectedCampId={campFocusId}
                    onSelectCamp={(id) => setCampFocusId(id || null)}
                  />

                  <FuelAlongRoute
                    status={fuelStatus}
                    result={fuel}
                    selectedId={fuelFocusId}
                    onSelect={(id) => setFuelFocusId(id || null)}
                    onRouteVia={routeViaPoi}
                    viaDisabled={viaSlotsFull}
                  />

                  <CampsAlongRoute
                    status={campsStatus}
                    result={camps}
                    selectedId={campFocusId}
                    onSelect={(id) => setCampFocusId(id || null)}
                    onRouteVia={routeViaPoi}
                    viaDisabled={viaSlotsFull}
                    limit={6}
                  />
                </section>
              ) : !hasRoutePoints ? (
                <p className="px-1 py-2 text-[13px] text-white/80">
                  Type a destination — or tap a city — then{" "}
                  <span className="font-bold text-white">Route</span>.
                </p>
              ) : null}

              {(routeStatus === "live" || routeStatus === "loading") && (
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
                      : "Calculating…"}
                </button>
              )}

              {routeStatus === "live" && !displayCoach ? (
                <button
                  type="button"
                  onClick={() => setSub("profile")}
                  className="glass-prestige flex w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-3 text-left"
                >
                  <User className="size-5 text-white/80" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-white">
                      Add an RV profile?
                    </p>
                    <p className="text-[11px] text-white">
                      Optional — height and length alerts. Routing already works.
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-white" />
                </button>
              ) : null}

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

              {displayCoach &&
              originPlace &&
              destPlace &&
              osrm &&
              (alerts.length > 0 || saferIntent !== "none") ? (
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    <>
                      <p className="px-0.5 text-[11px] font-bold tracking-wide text-white/65">
                        {restriction.banner ||
                          (restriction.source === "here"
                            ? "HERE Truck notices"
                            : "Text hints — not a clearance database")}
                      </p>
                      <AlertsBlock alerts={alerts} />
                    </>
                  ) : null}
                  {saferIntent !== "none" ? (
                    <button
                      type="button"
                      disabled={saferBusy}
                      onClick={() => void applySaferRoute()}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 py-3 text-[13px] font-bold text-white disabled:opacity-50"
                    >
                      <Navigation className="size-4" />
                      {saferBusy
                        ? saferBusyLabel(saferIntent)
                        : saferCtaLabel(saferIntent)}
                    </button>
                  ) : null}
                  {saferNote ? (
                    <p className="text-[12px] text-white/80">{saferNote}</p>
                  ) : null}
                </div>
              ) : saferNote ? (
                <p className="text-[12px] text-white/80">{saferNote}</p>
              ) : null}
            </>
          ) : null}

          {sub === "directions" ? (
            <section className="glass-prestige space-y-3 rounded-[1.25rem] p-4">
              <h2 className="text-[13px] font-bold tracking-[0.12em] text-white">
                DIRECTIONS
              </h2>
              {routeStatus === "live" && liveStats && osrm ? (
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <p className="text-[20px] font-bold tabular-nums text-white">
                    {formatMiles(liveStats.miles)}
                    <span className="ml-1 text-[12px] font-semibold text-white/70">
                      mi
                    </span>
                    <span className="mx-2 text-white/40">·</span>
                    {formatDrive(liveStats.driveHours, liveStats.driveMinutes)}
                  </p>
                  <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
                    {routeEngineLabel(osrm)}
                  </span>
                </div>
              ) : null}
              {routeStatus !== "live" || !liveDirections?.length ? (
                <p className="text-[13px] text-white/80">
                  Route on Navigate to fill this list.
                </p>
              ) : (
                <div className="space-y-2">
                  {liveDirections.map((d, i) => (
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
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {sub === "campgrounds" ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-white">
                  <Tent className="size-3.5 text-emerald-300" />
                  CAMPGROUNDS
                </h2>
                {campsStatus === "live" && camps?.sourceLabel ? (
                  <span className="rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/80">
                    {camps.sourceLabel}
                  </span>
                ) : null}
              </div>

              {campsStatus === "idle" ? (
                <p className="text-[13px] leading-snug text-white/80">
                  Route a trip on Navigate to load campgrounds along the corridor
                  and near the destination. Not a reservation inventory.
                </p>
              ) : (
                <CampsAlongRoute
                  status={campsStatus}
                  result={camps}
                  selectedId={campFocusId}
                  onSelect={(id) => setCampFocusId(id || null)}
                  onRouteVia={routeViaPoi}
                  viaDisabled={viaSlotsFull}
                  limit={16}
                  heading="ALONG THIS ROUTE"
                />
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSampleCamps((v) => !v)}
                  className="text-[11px] font-semibold text-white/55 underline-offset-2 hover:text-white/80 hover:underline"
                >
                  {showSampleCamps
                    ? "Hide sample pads"
                    : "Sample pads — not live"}
                </button>
                {showSampleCamps ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-[11px] leading-snug text-white/60">
                      Sample only — invented Glacier-route names, not this
                      corridor. Use the live list above.
                    </p>
                    {SAMPLE_CAMPS.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5"
                      >
                        <Tent className="mt-0.5 size-4 text-white/45" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-bold text-white/80">
                              {c.name}
                            </p>
                            <span className="rounded-full border border-white/20 px-1.5 py-px text-[9px] font-bold text-white/55">
                              SAMPLE
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-white/60">
                            Sample · max {c.maxLengthFt} ft
                            {c.hasHookups ? " · hookups" : " · dry"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
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
              setSeedSource("manual");
              setDraft({ ...EMPTY_COACH_PROFILE, year: v, seedSource: "manual" });
            } else if (sheet === "make") {
              setMake(v);
              setModel("");
              setFloorplan("");
              setSeedSource("manual");
            } else if (sheet === "model") {
              setModel(v);
              setFloorplan("");
              setSeedSource("manual");
            } else {
              setFloorplan(v);
              setSeedSource((s) => s ?? "manual");
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
