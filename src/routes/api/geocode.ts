import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/geocode?q=address
 * GET /api/geocode?lat=47.6&lng=-122.3  (reverse — current location)
 * Proxies OpenStreetMap Nominatim (free) for origin/destination lookup.
 */

type GeoHit = {
  label: string;
  lat: number;
  lng: number;
  kind: string;
};

const cache = new Map<string, { at: number; hits: GeoHit[] }>();
const TTL = 30 * 60 * 1000;

/** Curated US RV destinations when network fails or for instant pick */
const PRESETS: GeoHit[] = [
  {
    label: "Glacier National Park, MT",
    lat: 48.7596,
    lng: -113.787,
    kind: "park",
  },
  {
    label: "Yellowstone National Park, WY",
    lat: 44.428,
    lng: -110.5885,
    kind: "park",
  },
  {
    label: "Grand Canyon Village, AZ",
    lat: 36.0544,
    lng: -112.1401,
    kind: "park",
  },
  {
    label: "Zion National Park, UT",
    lat: 37.2982,
    lng: -113.0263,
    kind: "park",
  },
  {
    label: "Las Vegas, NV",
    lat: 36.1699,
    lng: -115.1398,
    kind: "city",
  },
  {
    label: "Salt Lake City, UT",
    lat: 40.7608,
    lng: -111.891,
    kind: "city",
  },
  {
    label: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    kind: "city",
  },
  {
    label: "Denver, CO",
    lat: 39.7392,
    lng: -104.9903,
    kind: "city",
  },
  {
    label: "Quartzsite, AZ",
    lat: 33.6639,
    lng: -114.2297,
    kind: "rv",
  },
  {
    label: "Puyallup, WA",
    lat: 47.1854,
    lng: -122.2929,
    kind: "city",
  },
];

function matchPresets(q: string): GeoHit[] {
  const n = q.toLowerCase().trim();
  if (!n) return PRESETS.slice(0, 6);
  return PRESETS.filter((p) => p.label.toLowerCase().includes(n)).slice(0, 8);
}

function nearestPreset(lat: number, lng: number): GeoHit {
  let best = PRESETS[0]!;
  let bestD = Infinity;
  for (const p of PRESETS) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return {
    label: `Near ${best.label}`,
    lat,
    lng,
    kind: "current",
  };
}

function formatReverseLabel(raw: {
  display_name?: string;
  address?: Record<string, string>;
  lat?: string;
  lon?: string;
}): string {
  const a = raw.address || {};
  const road =
    a.road || a.pedestrian || a.highway || a.residential || a.neighbourhood;
  const city =
    a.city || a.town || a.village || a.hamlet || a.municipality || a.county;
  const state = a.state || a.region;
  const parts = [road, city, state].filter(Boolean);
  if (parts.length >= 2) return parts.join(", ");
  if (parts.length === 1 && raw.display_name) {
    // Prefer a shorter slice of display_name when we only got one part
    const bits = String(raw.display_name).split(",").map((s) => s.trim());
    return bits.slice(0, 3).join(", ");
  }
  if (raw.display_name) {
    const bits = String(raw.display_name).split(",").map((s) => s.trim());
    return bits.slice(0, 4).join(", ");
  }
  return "Current location";
}

export const Route = createFileRoute("/api/geocode")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const latRaw = url.searchParams.get("lat");
        const lngRaw = url.searchParams.get("lng") ?? url.searchParams.get("lon");
        const q = (url.searchParams.get("q") || "").trim();

        // ── Reverse geocode (current location) ──────────────────────────
        if (latRaw != null && lngRaw != null) {
          const lat = Number(latRaw);
          const lng = Number(lngRaw);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return Response.json(
              { error: "Invalid lat/lng", hits: [] },
              { status: 400 },
            );
          }
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return Response.json(
              { error: "lat/lng out of range", hits: [] },
              { status: 400 },
            );
          }

          const key = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
          const cached = cache.get(key);
          if (cached && Date.now() - cached.at < TTL) {
            return Response.json(
              { source: "cache", hits: cached.hits },
              {
                headers: {
                  "Cache-Control": "public, max-age=600",
                  "X-Geocode-Cache": "HIT",
                },
              },
            );
          }

          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 8000);
          try {
            const nom = new URL("https://nominatim.openstreetmap.org/reverse");
            nom.searchParams.set("lat", String(lat));
            nom.searchParams.set("lon", String(lng));
            nom.searchParams.set("format", "json");
            nom.searchParams.set("addressdetails", "1");
            nom.searchParams.set("zoom", "16");
            const resp = await fetch(nom.toString(), {
              signal: ctrl.signal,
              headers: {
                Accept: "application/json",
                "User-Agent": "RVFAX-RvTrips/1.0 (geocode; +https://rvfax.app)",
              },
            });
            if (!resp.ok) throw new Error(`Nominatim reverse ${resp.status}`);
            const row = (await resp.json()) as {
              display_name?: string;
              address?: Record<string, string>;
              lat?: string;
              lon?: string;
              error?: string;
            };
            if (row.error) throw new Error(row.error);

            const hit: GeoHit = {
              label: formatReverseLabel(row),
              lat: Number(row.lat) || lat,
              lng: Number(row.lon) || lng,
              kind: "current",
            };
            const hits = [hit];
            cache.set(key, { at: Date.now(), hits });
            return Response.json(
              { source: "nominatim-reverse", hits },
              {
                headers: {
                  "Cache-Control": "public, max-age=600",
                  "X-Geocode-Cache": "MISS",
                },
              },
            );
          } catch {
            const hit = nearestPreset(lat, lng);
            const hits = [hit];
            cache.set(key, { at: Date.now(), hits });
            return Response.json(
              { source: "presets", hits, offline: true },
              { headers: { "X-Geocode-Cache": "FALLBACK" } },
            );
          } finally {
            clearTimeout(timer);
          }
        }

        // ── Forward geocode ─────────────────────────────────────────────
        if (q.length < 2) {
          return Response.json({
            source: "presets",
            hits: PRESETS.slice(0, 8),
          });
        }

        const key = q.toLowerCase();
        const hit = cache.get(key);
        if (hit && Date.now() - hit.at < TTL) {
          return Response.json(
            { source: "cache", hits: hit.hits },
            {
              headers: {
                "Cache-Control": "public, max-age=600",
                "X-Geocode-Cache": "HIT",
              },
            },
          );
        }

        const presets = matchPresets(q);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        try {
          const nom = new URL("https://nominatim.openstreetmap.org/search");
          nom.searchParams.set("q", q);
          nom.searchParams.set("format", "json");
          nom.searchParams.set("addressdetails", "0");
          nom.searchParams.set("limit", "6");
          nom.searchParams.set("countrycodes", "us,ca");
          const resp = await fetch(nom.toString(), {
            signal: ctrl.signal,
            headers: {
              Accept: "application/json",
              "User-Agent": "RVFAX-RvTrips/1.0 (geocode; +https://rvfax.app)",
            },
          });
          if (!resp.ok) throw new Error(`Nominatim ${resp.status}`);
          const rows = (await resp.json()) as Array<{
            display_name?: string;
            lat?: string;
            lon?: string;
            type?: string;
            class?: string;
          }>;
          const hits: GeoHit[] = rows
            .map((r) => ({
              label: String(r.display_name || q),
              lat: Number(r.lat),
              lng: Number(r.lon),
              kind: String(r.type || r.class || "place"),
            }))
            .filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));

          // Prefer live results; fold matching presets first
          const merged = [
            ...presets.filter((p) => !hits.some((h) => h.label === p.label)),
            ...hits,
          ].slice(0, 8);
          cache.set(key, { at: Date.now(), hits: merged });
          return Response.json(
            { source: "nominatim", hits: merged },
            {
              headers: {
                "Cache-Control": "public, max-age=600",
                "X-Geocode-Cache": "MISS",
              },
            },
          );
        } catch {
          const fallback = presets.length ? presets : matchPresets("");
          return Response.json(
            { source: "presets", hits: fallback, offline: true },
            { headers: { "X-Geocode-Cache": "FALLBACK" } },
          );
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
