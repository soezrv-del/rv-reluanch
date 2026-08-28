/** Curated public / no-fee RV sewer dumps for RvTrips.
 *  Hours and access change — confirm locally before you pull in. */

export type DumpKind =
  | "rest-area"
  | "city"
  | "sanitation"
  | "visitor"
  | "park";

export type DumpStation = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  kind: DumpKind;
  hours: string;
  water: "none" | "rinse" | "potable";
  address: string;
  notes: string;
};

export const DUMP_KIND_LABEL: Record<DumpKind, string> = {
  "rest-area": "Rest area",
  city: "City",
  sanitation: "Sanitation district",
  visitor: "Visitor center",
  park: "Park",
};

export const DUMP_STATES = [
  "AZ",
  "CA",
  "CO",
  "ID",
  "MT",
  "NM",
  "NV",
  "OR",
  "TX",
  "UT",
  "WA",
  "WY",
] as const;

export const FREE_DUMP_STATIONS: DumpStation[] = [
  {
    id: "ca-centralsan",
    name: "Central San RV Waste Disposal",
    city: "Martinez",
    state: "CA",
    lat: 37.9938,
    lng: -122.1132,
    kind: "sanitation",
    hours: "24 / 7",
    water: "rinse",
    address: "5019 Imhoff Pl, Martinez, CA",
    notes: "No-cost self-serve dump. Follow posted hose and rinse rules.",
  },
  {
    id: "ca-i8-elcentro-eb",
    name: "I-8 El Centro Rest Area · Eastbound",
    city: "El Centro",
    state: "CA",
    lat: 32.7734,
    lng: -115.5628,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-8 eastbound rest area, El Centro, CA",
    notes: "Dump at the far end near the on-ramp. Confirm seasonal closures.",
  },
  {
    id: "ca-i8-elcentro-wb",
    name: "I-8 El Centro Rest Area · Westbound",
    city: "El Centro",
    state: "CA",
    lat: 32.7748,
    lng: -115.5681,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-8 westbound rest area, El Centro, CA",
    notes: "Paired with the eastbound dump. Easy I-8 pull-through.",
  },
  {
    id: "ca-needles-ra",
    name: "Needles Rest Area · I-40",
    city: "Needles",
    state: "CA",
    lat: 34.8506,
    lng: -114.6147,
    kind: "rest-area",
    hours: "Daylight typical",
    water: "rinse",
    address: "I-40 rest area west of Needles, CA",
    notes: "Desert corridor dump. Carry extra rinse water in summer.",
  },
  {
    id: "or-charles-reynolds",
    name: "Charles Reynolds Rest Area · I-84 EB",
    city: "La Grande",
    state: "OR",
    lat: 45.3237,
    lng: -117.9814,
    kind: "rest-area",
    hours: "24 / 7",
    water: "potable",
    address: "I-84 EB mm 269, 9 mi east of La Grande, OR",
    notes: "Oregon DOT sanitary dump. No charge at rest areas.",
  },
  {
    id: "or-sage-hen",
    name: "Sage Hen Rest Area · US-20",
    city: "Burns",
    state: "OR",
    lat: 43.5862,
    lng: -119.3518,
    kind: "rest-area",
    hours: "24 / 7",
    water: "potable",
    address: "US-20 mm 114, 18 mi west of Burns, OR",
    notes: "Bidirectional high-desert rest area with sanitary dump.",
  },
  {
    id: "or-clyde-holiday",
    name: "Clyde Holiday State Park Rest Area",
    city: "Mount Vernon",
    state: "OR",
    lat: 44.4164,
    lng: -119.1168,
    kind: "park",
    hours: "Day use",
    water: "potable",
    address: "US-26, Mount Vernon, OR",
    notes: "State park rest-area dump. Confirm seasonal hours.",
  },
  {
    id: "or-tugman",
    name: "William Tugman State Park",
    city: "Reedsport",
    state: "OR",
    lat: 43.6051,
    lng: -124.1762,
    kind: "park",
    hours: "Day use",
    water: "potable",
    address: "US-101 mm 220.7, 8 mi south of Reedsport, OR",
    notes: "Coastal dump with NB/SB access. Restrooms and drinking water.",
  },
  {
    id: "or-sutton",
    name: "Sutton Creek Rest Area · US-101",
    city: "Florence",
    state: "OR",
    lat: 44.0658,
    lng: -124.1242,
    kind: "rest-area",
    hours: "Day use",
    water: "potable",
    address: "US-101 mm 176, 14 mi north of Florence, OR",
    notes: "Oregon coast dump. Tight turnaround — scout first if 40 ft+.",
  },
  {
    id: "ut-orem",
    name: "City of Orem RV Dump",
    city: "Orem",
    state: "UT",
    lat: 40.3118,
    lng: -111.7196,
    kind: "city",
    hours: "24 / 7",
    water: "rinse",
    address: "Orem, UT (city wastewater campus)",
    notes: "Long-reported free and open 24/7. Rinse water only — no potable.",
  },
  {
    id: "az-ehrenberg-ra",
    name: "Ehrenberg Rest Area · I-10",
    city: "Ehrenberg",
    state: "AZ",
    lat: 33.6058,
    lng: -114.5168,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-10 rest area, Ehrenberg, AZ",
    notes: "Colorado River crossing dump. Confirm lane is open.",
  },
  {
    id: "az-sacaton",
    name: "Sacaton Rest Area · I-10",
    city: "Sacaton",
    state: "AZ",
    lat: 33.0769,
    lng: -111.7493,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-10 rest area south of Phoenix, AZ",
    notes: "Useful southbound Phoenix dump. Watch summer heat on hoses.",
  },
  {
    id: "nv-valley-of-fire",
    name: "Valley of Fire Visitor Dump",
    city: "Overton",
    state: "NV",
    lat: 36.4304,
    lng: -114.5136,
    kind: "park",
    hours: "Park hours",
    water: "rinse",
    address: "Valley of Fire State Park, NV",
    notes: "Park dump when posted free or included with entry. Confirm at gate.",
  },
  {
    id: "id-blacks-creek",
    name: "Blacks Creek Rest Area · I-84",
    city: "Boise",
    state: "ID",
    lat: 43.4731,
    lng: -116.0647,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-84 SE of Boise, ID",
    notes: "Treasure Valley dump. Idaho rest-area dumps are typically no fee.",
  },
  {
    id: "wa-scatter-creek",
    name: "Scatter Creek Rest Area · I-5",
    city: "Grand Mound",
    state: "WA",
    lat: 46.8012,
    lng: -122.9816,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-5, Grand Mound, WA",
    notes: "South of Olympia. Confirm the sanitary lane is posted open.",
  },
  {
    id: "mt-anaconda",
    name: "Anaconda Rest Area · I-90",
    city: "Anaconda",
    state: "MT",
    lat: 46.1274,
    lng: -112.9421,
    kind: "rest-area",
    hours: "Seasonal",
    water: "rinse",
    address: "I-90 near Anaconda, MT",
    notes: "Glacier / Yellowstone corridor. Winter closures possible.",
  },
  {
    id: "wy-evanston",
    name: "Evanston Rest Area · I-80",
    city: "Evanston",
    state: "WY",
    lat: 41.2633,
    lng: -110.9632,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-80, Evanston, WY",
    notes: "Utah–Wyoming line dump. Wind can make hose work messy.",
  },
  {
    id: "co-vail-pass",
    name: "Vail Pass Rest Area · I-70",
    city: "Vail",
    state: "CO",
    lat: 39.5306,
    lng: -106.2174,
    kind: "rest-area",
    hours: "Seasonal",
    water: "none",
    address: "I-70 Vail Pass, CO",
    notes: "High-elevation stop. Confirm dump is open — winter work common.",
  },
  {
    id: "nm-gallup-tic",
    name: "Gallup Visitor Information Center",
    city: "Gallup",
    state: "NM",
    lat: 35.5281,
    lng: -108.7426,
    kind: "visitor",
    hours: "Daytime",
    water: "rinse",
    address: "I-40 / US-66, Gallup, NM",
    notes: "I-40 traveler dump when posted. Call the visitor center first.",
  },
  {
    id: "tx-amarillo-tic",
    name: "Amarillo Travel Information Center",
    city: "Amarillo",
    state: "TX",
    lat: 35.2211,
    lng: -101.8313,
    kind: "visitor",
    hours: "Daytime",
    water: "rinse",
    address: "I-40, Amarillo, TX",
    notes: "TxDOT traveler centers often have a no-fee dump. Confirm hours.",
  },
  {
    id: "tx-gainesville-tic",
    name: "Gainesville Travel Information Center",
    city: "Gainesville",
    state: "TX",
    lat: 33.6259,
    lng: -97.1417,
    kind: "visitor",
    hours: "Daytime",
    water: "rinse",
    address: "I-35, Gainesville, TX",
    notes: "North Texas I-35 dump at the state welcome center.",
  },
  {
    id: "az-flagstaff-ra",
    name: "Parks Rest Area · I-40",
    city: "Parks",
    state: "AZ",
    lat: 35.2606,
    lng: -111.9488,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-40 west of Flagstaff, AZ",
    notes: "High-country dump west of Flagstaff. Cold nights in shoulder season.",
  },
  {
    id: "ca-buttonwillow",
    name: "Buttonwillow Rest Area · I-5",
    city: "Buttonwillow",
    state: "CA",
    lat: 35.4005,
    lng: -119.4696,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-5, Buttonwillow, CA",
    notes: "Central Valley I-5 stop. Confirm the sanitary stall is open.",
  },
  {
    id: "ca-westley",
    name: "Westley Rest Area · I-5",
    city: "Westley",
    state: "CA",
    lat: 37.5496,
    lng: -121.2014,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-5, Westley, CA",
    notes: "Between Tracy and Patterson. Handy for Bay–Valley runs.",
  },
  {
    id: "nv-winnemucca",
    name: "Winnemucca Rest Area · I-80",
    city: "Winnemucca",
    state: "NV",
    lat: 40.973,
    lng: -117.7357,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-80, Winnemucca, NV",
    notes: "I-80 basin dump. Bring gloves — desert grit on fittings.",
  },
  {
    id: "ut-green-river",
    name: "Green River Rest Area · I-70",
    city: "Green River",
    state: "UT",
    lat: 38.9952,
    lng: -110.1618,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-70, Green River, UT",
    notes: "Moab / I-70 connector. Good before desert stretches.",
  },
  {
    id: "id-twin-falls",
    name: "Twin Falls Visitor Center Dump",
    city: "Twin Falls",
    state: "ID",
    lat: 42.5558,
    lng: -114.4701,
    kind: "visitor",
    hours: "Daytime",
    water: "rinse",
    address: "US-93 / I-84 area, Twin Falls, ID",
    notes: "Snake River corridor. Confirm posted public hours.",
  },
  {
    id: "wa-ryegrass",
    name: "Ryegrass Rest Area · I-90",
    city: "Vantage",
    state: "WA",
    lat: 46.9456,
    lng: -119.9864,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-90 near Vantage, WA",
    notes: "Columbia Basin dump. Wind advisory on the gorge approach.",
  },
  {
    id: "mt-bozeman",
    name: "Bozeman Rest Area · I-90",
    city: "Bozeman",
    state: "MT",
    lat: 45.6797,
    lng: -111.0378,
    kind: "rest-area",
    hours: "Seasonal",
    water: "rinse",
    address: "I-90, Bozeman, MT",
    notes: "Yellowstone staging dump. Winter freeze-ups happen.",
  },
  {
    id: "wy-rock-springs",
    name: "Rock Springs Rest Area · I-80",
    city: "Rock Springs",
    state: "WY",
    lat: 41.5875,
    lng: -109.2029,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-80, Rock Springs, WY",
    notes: "Southwest Wyoming corridor dump.",
  },
  {
    id: "co-limon",
    name: "Limon Rest Area · I-70",
    city: "Limon",
    state: "CO",
    lat: 39.2639,
    lng: -103.6922,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-70, Limon, CO",
    notes: "Eastern plains dump between Denver and Kansas.",
  },
  {
    id: "nm-lordsburg",
    name: "Lordsburg Rest Area · I-10",
    city: "Lordsburg",
    state: "NM",
    lat: 32.3504,
    lng: -108.7087,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-10, Lordsburg, NM",
    notes: "Southwest I-10 dump. Hot-weather hose caution.",
  },
  {
    id: "tx-van-horn",
    name: "Van Horn Rest Area · I-10",
    city: "Van Horn",
    state: "TX",
    lat: 31.0399,
    lng: -104.8308,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-10, Van Horn, TX",
    notes: "West Texas long-haul dump. Confirm stall is not closed for repair.",
  },
  {
    id: "az-kingman",
    name: "Kingman Rest Area · I-40",
    city: "Kingman",
    state: "AZ",
    lat: 35.1894,
    lng: -114.053,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-40, Kingman, AZ",
    notes: "Route 66 / I-40 dump west of Flagstaff.",
  },
  {
    id: "nv-elko",
    name: "Elko Rest Area · I-80",
    city: "Elko",
    state: "NV",
    lat: 40.8324,
    lng: -115.7631,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-80, Elko, NV",
    notes: "Northeast Nevada basin dump.",
  },
  {
    id: "ca-wheeler-ridge",
    name: "Wheeler Ridge Rest Area · I-5",
    city: "Lebec",
    state: "CA",
    lat: 34.9916,
    lng: -118.9498,
    kind: "rest-area",
    hours: "24 / 7",
    water: "rinse",
    address: "I-5 Grapevine, CA",
    notes: "South of the Grapevine. Good before LA basin traffic.",
  },
];

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function mapsUrl(d: DumpStation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${d.lat},${d.lng}`,
  )}`;
}

export function filterDumpStations(
  stations: DumpStation[],
  opts: {
    query?: string;
    state?: string | null;
    near?: { lat: number; lng: number } | null;
  },
): (DumpStation & { miles?: number })[] {
  const q = (opts.query || "").trim().toLowerCase();
  const state = opts.state || null;
  let list = stations.filter((s) => {
    if (state && s.state !== state) return false;
    if (!q) return true;
    const hay = `${s.name} ${s.city} ${s.state} ${s.address} ${s.kind}`.toLowerCase();
    return hay.includes(q);
  });
  if (opts.near) {
    const near = opts.near;
    list = list
      .map((s) => ({ ...s, miles: haversineMiles(near, s) }))
      .sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0));
  } else {
    list = [...list].sort((a, b) =>
      a.state === b.state
        ? a.city.localeCompare(b.city)
        : a.state.localeCompare(b.state),
    );
  }
  return list;
}
