/**
 * Curated North-American RV destinations for Trips “Where to?”.
 * Labels are geocodable place names (city/park + state/province).
 * Coords are town/park hubs — Mapbox/Nominatim still run for typed search.
 */

export type RvDestinationKind = "city" | "park" | "rv";

export type RvDestination = {
  label: string;
  lat: number;
  lng: number;
  kind: RvDestinationKind;
};

/** Featured first — same five the planner used to show as pills. */
export const RV_DESTINATIONS: readonly RvDestination[] = [
  { label: "Seattle, WA", lat: 47.6062, lng: -122.3321, kind: "city" },
  { label: "Portland, OR", lat: 45.5152, lng: -122.6784, kind: "city" },
  { label: "Glacier National Park, MT", lat: 48.7596, lng: -113.787, kind: "park" },
  { label: "Yellowstone National Park, WY", lat: 44.428, lng: -110.5885, kind: "park" },
  { label: "Quartzsite, AZ", lat: 33.6639, lng: -114.2297, kind: "rv" },

  { label: "Grand Canyon Village, AZ", lat: 36.0544, lng: -112.1401, kind: "park" },
  { label: "Zion National Park, UT", lat: 37.2982, lng: -113.0263, kind: "park" },
  { label: "Yosemite Valley, CA", lat: 37.7456, lng: -119.5969, kind: "park" },
  { label: "Grand Teton National Park, WY", lat: 43.7904, lng: -110.6818, kind: "park" },
  { label: "Rocky Mountain National Park, CO", lat: 40.3428, lng: -105.6836, kind: "park" },
  { label: "Arches National Park, UT", lat: 38.7331, lng: -109.5925, kind: "park" },
  { label: "Bryce Canyon National Park, UT", lat: 37.593, lng: -112.1871, kind: "park" },
  { label: "Canyonlands National Park, UT", lat: 38.3269, lng: -109.8783, kind: "park" },
  { label: "Capitol Reef National Park, UT", lat: 38.367, lng: -111.2615, kind: "park" },
  { label: "Mesa Verde National Park, CO", lat: 37.2309, lng: -108.4618, kind: "park" },
  { label: "Olympic National Park, WA", lat: 47.8021, lng: -123.6044, kind: "park" },
  { label: "Mount Rainier National Park, WA", lat: 46.8523, lng: -121.7603, kind: "park" },
  { label: "Crater Lake National Park, OR", lat: 42.8684, lng: -122.1685, kind: "park" },
  { label: "Joshua Tree National Park, CA", lat: 33.8734, lng: -115.901, kind: "park" },
  { label: "Death Valley National Park, CA", lat: 36.5054, lng: -117.0794, kind: "park" },
  { label: "Big Bend National Park, TX", lat: 29.2498, lng: -103.2502, kind: "park" },
  { label: "White Sands National Park, NM", lat: 32.7872, lng: -106.3257, kind: "park" },
  { label: "Great Sand Dunes National Park, CO", lat: 37.7916, lng: -105.5943, kind: "park" },
  { label: "Badlands National Park, SD", lat: 43.8554, lng: -102.3397, kind: "park" },
  { label: "Custer State Park, SD", lat: 43.766, lng: -103.365, kind: "park" },
  { label: "Mount Rushmore, SD", lat: 43.8791, lng: -103.4591, kind: "park" },
  { label: "Monument Valley, UT", lat: 37.0042, lng: -110.1735, kind: "park" },
  { label: "Lake Powell, AZ", lat: 36.9982, lng: -111.4837, kind: "park" },
  { label: "Boulder City, NV", lat: 35.9786, lng: -114.8325, kind: "rv" },
  { label: "Great Basin National Park, NV", lat: 38.9833, lng: -114.3, kind: "park" },

  { label: "Yuma, AZ", lat: 32.6927, lng: -114.6277, kind: "rv" },
  { label: "Tucson, AZ", lat: 32.2226, lng: -110.9747, kind: "rv" },
  { label: "Phoenix, AZ", lat: 33.4484, lng: -112.074, kind: "city" },
  { label: "Apache Junction, AZ", lat: 33.415, lng: -111.5496, kind: "rv" },
  { label: "Lake Havasu City, AZ", lat: 34.4839, lng: -114.3227, kind: "rv" },
  { label: "Palm Springs, CA", lat: 33.8303, lng: -116.5453, kind: "rv" },
  { label: "Indio, CA", lat: 33.7206, lng: -116.2156, kind: "rv" },
  { label: "Blythe, CA", lat: 33.6103, lng: -114.5963, kind: "rv" },
  { label: "Borrego Springs, CA", lat: 33.2559, lng: -116.375, kind: "rv" },
  { label: "Pismo Beach, CA", lat: 35.1428, lng: -120.6413, kind: "rv" },
  { label: "Laughlin, NV", lat: 35.1678, lng: -114.573, kind: "rv" },
  { label: "Pahrump, NV", lat: 36.2083, lng: -115.9839, kind: "rv" },
  { label: "Las Vegas, NV", lat: 36.1699, lng: -115.1398, kind: "city" },
  { label: "Reno, NV", lat: 39.5296, lng: -119.8138, kind: "city" },
  { label: "South Lake Tahoe, CA", lat: 38.9399, lng: -119.9772, kind: "city" },

  { label: "Moab, UT", lat: 38.5733, lng: -109.5498, kind: "city" },
  { label: "St. George, UT", lat: 37.0965, lng: -113.5684, kind: "rv" },
  { label: "Page, AZ", lat: 36.9147, lng: -111.4558, kind: "city" },
  { label: "Sedona, AZ", lat: 34.8697, lng: -111.761, kind: "city" },
  { label: "Flagstaff, AZ", lat: 35.1983, lng: -111.6513, kind: "city" },
  { label: "Kanab, UT", lat: 37.0475, lng: -112.5263, kind: "city" },
  { label: "Salt Lake City, UT", lat: 40.7608, lng: -111.891, kind: "city" },
  { label: "Denver, CO", lat: 39.7392, lng: -104.9903, kind: "city" },
  { label: "Estes Park, CO", lat: 40.3772, lng: -105.5217, kind: "city" },
  { label: "Durango, CO", lat: 37.2753, lng: -107.8801, kind: "city" },
  { label: "Jackson, WY", lat: 43.4799, lng: -110.7624, kind: "city" },
  { label: "West Yellowstone, MT", lat: 44.6622, lng: -111.1041, kind: "rv" },
  { label: "Whitefish, MT", lat: 48.4111, lng: -114.3376, kind: "city" },
  { label: "Kalispell, MT", lat: 48.1917, lng: -114.3168, kind: "city" },
  { label: "Bozeman, MT", lat: 45.677, lng: -111.0429, kind: "city" },
  { label: "Missoula, MT", lat: 46.8721, lng: -113.994, kind: "city" },
  { label: "Cody, WY", lat: 44.5263, lng: -109.0565, kind: "city" },
  { label: "Rapid City, SD", lat: 44.0805, lng: -103.231, kind: "city" },
  { label: "Sturgis, SD", lat: 44.4097, lng: -103.509, kind: "city" },

  { label: "Bend, OR", lat: 44.0582, lng: -121.3153, kind: "city" },
  { label: "Spokane, WA", lat: 47.6588, lng: -117.426, kind: "city" },
  { label: "Leavenworth, WA", lat: 47.5962, lng: -120.6615, kind: "city" },
  { label: "Puyallup, WA", lat: 47.1854, lng: -122.2929, kind: "rv" },
  { label: "Boise, ID", lat: 43.615, lng: -116.2023, kind: "city" },
  { label: "Coeur d'Alene, ID", lat: 47.6777, lng: -116.7805, kind: "city" },
  { label: "Monterey, CA", lat: 36.6002, lng: -121.8947, kind: "city" },
  { label: "San Diego, CA", lat: 32.7157, lng: -117.1611, kind: "city" },
  { label: "Morro Bay, CA", lat: 35.3658, lng: -120.8499, kind: "rv" },

  { label: "Mission, TX", lat: 26.2159, lng: -98.3253, kind: "rv" },
  { label: "South Padre Island, TX", lat: 26.1118, lng: -97.1681, kind: "rv" },
  { label: "San Antonio, TX", lat: 29.4241, lng: -98.4936, kind: "city" },
  { label: "Fredericksburg, TX", lat: 30.2752, lng: -98.872, kind: "city" },
  { label: "Albuquerque, NM", lat: 35.0844, lng: -106.6504, kind: "city" },
  { label: "Santa Fe, NM", lat: 35.687, lng: -105.9378, kind: "city" },
  { label: "Gulf Shores, AL", lat: 30.246, lng: -87.7008, kind: "rv" },
  { label: "New Orleans, LA", lat: 29.9511, lng: -90.0715, kind: "city" },
  { label: "Key West, FL", lat: 24.5551, lng: -81.78, kind: "city" },
  { label: "Fort Myers, FL", lat: 26.6406, lng: -81.8723, kind: "rv" },

  { label: "Tampa, FL", lat: 27.9506, lng: -82.4572, kind: "rv" },
  { label: "Orlando, FL", lat: 28.5383, lng: -81.3792, kind: "city" },
  { label: "Great Smoky Mountains National Park, TN", lat: 35.6118, lng: -83.4895, kind: "park" },
  { label: "Gatlinburg, TN", lat: 35.7143, lng: -83.5102, kind: "city" },
  { label: "Asheville, NC", lat: 35.5951, lng: -82.5515, kind: "city" },
  { label: "Branson, MO", lat: 36.6437, lng: -93.2185, kind: "city" },
  { label: "Charleston, SC", lat: 32.7765, lng: -79.9311, kind: "city" },
  { label: "Savannah, GA", lat: 32.0809, lng: -81.0912, kind: "city" },
  { label: "Nags Head, NC", lat: 35.9574, lng: -75.6241, kind: "city" },
  { label: "Shenandoah National Park, VA", lat: 38.2928, lng: -78.6796, kind: "park" },
  { label: "Acadia National Park, ME", lat: 44.3386, lng: -68.2733, kind: "park" },
  { label: "Bar Harbor, ME", lat: 44.3876, lng: -68.2039, kind: "city" },
  { label: "Niagara Falls, NY", lat: 43.0962, lng: -79.0377, kind: "city" },
  { label: "Hershey, PA", lat: 40.2859, lng: -76.6502, kind: "rv" },
  { label: "Elkhart, IN", lat: 41.682, lng: -85.9767, kind: "rv" },
  { label: "Perry, GA", lat: 32.4582, lng: -83.7316, kind: "rv" },

  { label: "Banff, AB", lat: 51.1784, lng: -115.5708, kind: "park" },
  { label: "Jasper, AB", lat: 52.8737, lng: -118.0814, kind: "park" },
  { label: "Vancouver, BC", lat: 49.2827, lng: -123.1207, kind: "city" },
  { label: "Victoria, BC", lat: 48.4284, lng: -123.3656, kind: "city" },
];

const FEATURED_DEST_LABELS = [
  "Seattle, WA",
  "Portland, OR",
  "Glacier National Park, MT",
  "Yellowstone National Park, WY",
  "Quartzsite, AZ",
] as const;

export function rvDestinationKindLabel(kind: string): string {
  if (kind === "park") return "Park";
  if (kind === "rv") return "RV hub";
  return "Town";
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function destinationMatches(dest: RvDestination, q: string): boolean {
  const label = dest.label.toLowerCase();
  const city = label.split(",")[0]?.trim() ?? label;
  return label.includes(q) || city.startsWith(q);
}

/** Empty query returns the full rolling list; otherwise label / city match. */
export function filterRvDestinations(query: string): RvDestination[] {
  const q = normalizeQuery(query);
  if (!q) return RV_DESTINATIONS.slice();
  return RV_DESTINATIONS.filter((dest) => destinationMatches(dest, q));
}

export function featuredRvDestinations(): RvDestination[] {
  return FEATURED_DEST_LABELS.map((label) => {
    const hit = RV_DESTINATIONS.find((d) => d.label === label);
    if (!hit) {
      throw new Error(`Missing featured RV destination: ${label}`);
    }
    return hit;
  });
}

export type DestSuggestHit = {
  label: string;
  lat: number;
  lng: number;
  kind: string;
};

/**
 * Browse (empty query) = curated list.
 * Typeahead = live geocode hits first, then matching curated rows (no dup labels).
 */
export function mergeDestSuggestions(
  query: string,
  geoHits: readonly DestSuggestHit[] = [],
): DestSuggestHit[] {
  const curated = filterRvDestinations(query);
  const q = query.trim();
  if (!q) return curated;
  const seen = new Set(curated.map((d) => d.label.toLowerCase()));
  const extra = geoHits.filter((h) => {
    const label = h.label.trim();
    if (!label) return false;
    const key = label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...extra, ...curated];
}
