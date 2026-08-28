/**
 * Resolve floorplan-specific dimensions from codes like 29S / 27A / 36A.
 * OEM codes almost always encode length in the leading digits.
 *
 * Also hosts brochure-backed OEM overrides when the leading-digit heuristic
 * fails (e.g. Brinkley 4-digit plans where "35" ≠ 35 ft).
 */

export type OemFloorplanSpec = {
  /** Exterior length display e.g. 40' 2" */
  lengthDisplay: string;
  /** Total exterior length in inches */
  overallLengthIn: number;
  exteriorHeightIn: number;
  exteriorWidthIn: number;
  interiorHeightIn?: number;
  uvwLbs: number;
  gvwrLbs: number;
  hitchLbs: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  propaneLbs?: number;
  garageLengthFt?: number;
  garageWidthFt?: number;
  garageHeightIn?: number;
  /** Garage door / ramp rating (lbs) */
  garageCapacityLbs?: number;
  rampPatioLbs?: number;
  fuelStationGal?: number;
  axles?: string;
  tireSize?: string;
  sleeps?: number;
  slideouts?: number;
  /** One-line layout pitch: baths, bunks, who it's for */
  layoutNote?: string;
  note?: string;
  source?: string;
};

/**
 * Brochure-backed OEM rows keyed by make|model|year|floorplan (lowercased).
 * Year may be a single year or a range covered by yearMin/yearMax in the entry.
 */
const OEM_FLOORPLAN_ROWS: Array<{
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  spec: OemFloorplanSpec;
}> = [
  // ── Brinkley Model T / Model G (luxury 5th-wheel toy haulers) ───────────
  // Official OEM site markets the TH line as Model G; catalog also indexes Model T.
  // Specs from Brinkley RV Model G product pages (current brochure numbers).
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "3250",
    spec: {
      lengthDisplay: `37' 11"`,
      overallLengthIn: 37 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 17500,
      gvwrLbs: 22000,
      hitchLbs: 3150,
      freshWater: 150,
      grayWater: 156,
      blackWater: 52,
      propaneLbs: 60,
      garageLengthFt: 6.5,
      garageWidthFt: 8.0,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 30,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "Garage/flex 6' 6\" (48×96 usable) — entertainer layout",
      source: "Brinkley Model G 3250 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "3500",
    spec: {
      lengthDisplay: `40' 2"`,
      overallLengthIn: 40 * 12 + 2,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 16967,
      gvwrLbs: 22000,
      hitchLbs: 3320,
      freshWater: 150,
      grayWater: 104,
      blackWater: 104,
      propaneLbs: 60,
      garageLengthFt: 11,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "11' garage/flex · premium residential kitchen",
      source: "Brinkley Model G 3500 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "3520",
    spec: {
      lengthDisplay: `40' 3"`,
      overallLengthIn: 40 * 12 + 3,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 17700,
      gvwrLbs: 22000,
      hitchLbs: 3150,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 11,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "11' garage with fold-away ½ baths",
      source: "Brinkley Model G 3520 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "3950",
    spec: {
      lengthDisplay: `45' 5"`,
      overallLengthIn: 45 * 12 + 5,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 18900,
      gvwrLbs: 23000,
      hitchLbs: 3450,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 14,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "14' garage/flex with fold-away bath walls",
      source: "Brinkley Model G 3950 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "3970",
    spec: {
      lengthDisplay: `45' 5"`,
      overallLengthIn: 45 * 12 + 5,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 18900,
      gvwrLbs: 23000,
      hitchLbs: 3450,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 11,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "11' garage/flex · 2nd full bath",
      source: "Brinkley Model G 3970 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2023,
    yearMax: 2026,
    floorplan: "4000",
    spec: {
      lengthDisplay: `45' 2"`,
      overallLengthIn: 45 * 12 + 2,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 17674,
      gvwrLbs: 23000,
      hitchLbs: 3530,
      freshWater: 150,
      grayWater: 104,
      blackWater: 104,
      propaneLbs: 60,
      garageLengthFt: 16,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "16' garage/flex · premium residential kitchen",
      source: "Brinkley Model G 4000 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2024,
    yearMax: 2026,
    floorplan: "4100",
    spec: {
      lengthDisplay: `45' 11"`,
      overallLengthIn: 45 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 18800,
      gvwrLbs: 23000,
      hitchLbs: 3450,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 12.5,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "12' 6\" garage/flex w/ fold-away ½ bath",
      source: "Brinkley Model G 4100 brochure",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model t",
    yearMin: 2024,
    yearMax: 2026,
    floorplan: "4120",
    spec: {
      lengthDisplay: `46' 3"`,
      overallLengthIn: 46 * 12 + 3,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 18700,
      gvwrLbs: 23000,
      hitchLbs: 3500,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 17,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      axles: "Triple 7k",
      tireSize: "215/75R17.5 H (16-ply)",
      note: "17' garage/flex — largest Model G garage class",
      source: "Brinkley Model G 4120 brochure",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Sprint post-F: brochure-spec depth — top volume search units
  // Fields: length · GVWR · UVW · hitch/pin · fresh/gray/black (when brochure-known)
  // Live Grok still enriches engine/MSRP/amenities; these stop range-guessing on dims.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1) Fleetwood Discovery (2020–2024 brochure sheet: 36Q / 38K / 38N / 38W) ──
  // User-verified 2022 brochure table (overall length, height, tanks, hitch, fuel).
  {
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    yearMin: 2020,
    yearMax: 2024,
    floorplan: "36Q",
    spec: {
      lengthDisplay: `37' 3"`,
      overallLengthIn: 37 * 12 + 3,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
      uvwLbs: 24500,
      gvwrLbs: 33400,
      hitchLbs: 1000,
      freshWater: 105,
      grayWater: 75,
      blackWater: 50,
      note: "B6.7 360HP Freightliner XC — not 8.9L ISL. Hitch rating 10,000 lbs / fuel 100 gal (series)",
      source: "Fleetwood Discovery 2022 brochure capacities table",
    },
  },
  {
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    yearMin: 2020,
    yearMax: 2024,
    floorplan: "38K",
    spec: {
      lengthDisplay: `40' 0"`,
      overallLengthIn: 40 * 12,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
      uvwLbs: 25500,
      gvwrLbs: 33400,
      hitchLbs: 1000,
      freshWater: 105,
      grayWater: 75,
      blackWater: 50,
      note: "2022 Discovery 38K — Cummins B6.7 360HP / Freightliner XC. Series hitch 10k · fuel 100 gal",
      source: "Fleetwood Discovery 2022 brochure capacities table",
    },
  },
  {
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    yearMin: 2020,
    yearMax: 2024,
    floorplan: "38N",
    spec: {
      lengthDisplay: `40' 0"`,
      overallLengthIn: 40 * 12,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
      uvwLbs: 25200,
      gvwrLbs: 33400,
      hitchLbs: 1000,
      freshWater: 105,
      grayWater: 75,
      blackWater: 50,
      source: "Fleetwood Discovery 2022 brochure capacities table",
    },
  },
  {
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    yearMin: 2020,
    yearMax: 2024,
    floorplan: "38W",
    spec: {
      lengthDisplay: `40' 11"`,
      overallLengthIn: 40 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
      uvwLbs: 25800,
      gvwrLbs: 33400,
      hitchLbs: 1000,
      freshWater: 105,
      grayWater: 75,
      blackWater: 50,
      source: "Fleetwood Discovery 2022 brochure capacities table",
    },
  },

  // ── 2) Grand Design Imagine 2800BH (OEM product page) ─────────────────────
  {
    makeIncludes: "grand design",
    modelIncludes: "imagine",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "2800BH",
    spec: {
      lengthDisplay: `32' 0"`,
      overallLengthIn: 32 * 12,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 7185,
      gvwrLbs: 10195,
      hitchLbs: 746,
      freshWater: 45,
      grayWater: 82,
      blackWater: 45,
      propaneLbs: 40,
      source: "Grand Design Imagine 2800BH product page",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "imagine",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "2500RL",
    spec: {
      lengthDisplay: `29' 8"`,
      overallLengthIn: 29 * 12 + 8,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 6495,
      gvwrLbs: 7995,
      hitchLbs: 680,
      freshWater: 45,
      grayWater: 82,
      blackWater: 45,
      propaneLbs: 40,
      source: "Grand Design Imagine series brochure (2500RL class)",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "imagine",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "2670MK",
    spec: {
      lengthDisplay: `32' 0"`,
      overallLengthIn: 32 * 12,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 6895,
      gvwrLbs: 8995,
      hitchLbs: 720,
      freshWater: 45,
      grayWater: 82,
      blackWater: 45,
      propaneLbs: 40,
      source: "Grand Design Imagine series brochure (2670MK class)",
    },
  },

  // ── 3) Grand Design Reflection 150 Series (half-ton FW volume) ────────────
  {
    makeIncludes: "grand design",
    modelIncludes: "reflection",
    yearMin: 2021,
    yearMax: 2026,
    floorplan: "260RD",
    spec: {
      lengthDisplay: `29' 11"`,
      overallLengthIn: 29 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 0,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 7850,
      gvwrLbs: 9995,
      hitchLbs: 1420,
      freshWater: 52,
      grayWater: 71,
      blackWater: 39,
      propaneLbs: 60,
      source: "Grand Design Reflection 150 Series brochure class",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "reflection",
    yearMin: 2021,
    yearMax: 2026,
    floorplan: "303RLS",
    spec: {
      lengthDisplay: `34' 2"`,
      overallLengthIn: 34 * 12 + 2,
      exteriorHeightIn: 12 * 12 + 3,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 8920,
      gvwrLbs: 11995,
      hitchLbs: 1680,
      freshWater: 52,
      grayWater: 78,
      blackWater: 43,
      propaneLbs: 60,
      source: "Grand Design Reflection 150 Series brochure class",
    },
  },

  // ── 4) Keystone Cougar Half-Ton (high-volume 5th) ─────────────────────────
  {
    makeIncludes: "keystone",
    modelIncludes: "cougar half",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "25BHSWE",
    spec: {
      lengthDisplay: `29' 11"`,
      overallLengthIn: 29 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 7825,
      gvwrLbs: 9995,
      hitchLbs: 1450,
      freshWater: 60,
      grayWater: 76,
      blackWater: 38,
      propaneLbs: 60,
      source: "Keystone Cougar Half-Ton brochure class (25BHSWE)",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "cougar half",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "29BHS",
    spec: {
      lengthDisplay: `33' 8"`,
      overallLengthIn: 33 * 12 + 8,
      exteriorHeightIn: 12 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 8850,
      gvwrLbs: 11995,
      hitchLbs: 1680,
      freshWater: 60,
      grayWater: 76,
      blackWater: 38,
      propaneLbs: 60,
      source: "Keystone Cougar Half-Ton brochure class (29BHS)",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "cougar half",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "30BHS",
    spec: {
      lengthDisplay: `34' 11"`,
      overallLengthIn: 34 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 9120,
      gvwrLbs: 11995,
      hitchLbs: 1750,
      freshWater: 60,
      grayWater: 76,
      blackWater: 38,
      propaneLbs: 60,
      source: "Keystone Cougar Half-Ton brochure class (30BHS)",
    },
  },
  // Also match plain "Cougar" when half-ton codes are used
  {
    makeIncludes: "keystone",
    modelIncludes: "cougar",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "25BHSWE",
    spec: {
      lengthDisplay: `29' 11"`,
      overallLengthIn: 29 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 7825,
      gvwrLbs: 9995,
      hitchLbs: 1450,
      freshWater: 60,
      grayWater: 76,
      blackWater: 38,
      propaneLbs: 60,
      source: "Keystone Cougar Half-Ton brochure class (25BHSWE)",
    },
  },

  // ── 5) Thor Four Winds / Chateau Class C volume ───────────────────────────
  {
    makeIncludes: "thor",
    modelIncludes: "four winds",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "28A",
    spec: {
      lengthDisplay: `29' 9"`,
      overallLengthIn: 29 * 12 + 9,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 12500,
      gvwrLbs: 14500,
      hitchLbs: 500,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Ford E-450 · 7.3L Godzilla recent years",
      source: "Thor Four Winds product / JD Power class (28A)",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "four winds",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "28Z",
    spec: {
      lengthDisplay: `30' 0"`,
      overallLengthIn: 30 * 12,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 12800,
      gvwrLbs: 14500,
      hitchLbs: 500,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      source: "Thor Four Winds product page (28Z)",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "four winds",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "25Z",
    spec: {
      lengthDisplay: `26' 3"`,
      overallLengthIn: 26 * 12 + 3,
      exteriorHeightIn: 11 * 12 + 0,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 11200,
      gvwrLbs: 12500,
      hitchLbs: 500,
      freshWater: 35,
      grayWater: 28,
      blackWater: 28,
      source: "Thor Four Winds product class (25Z small Class C)",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "chateau",
    yearMin: 2022,
    yearMax: 2026,
    floorplan: "28A",
    spec: {
      lengthDisplay: `29' 9"`,
      overallLengthIn: 29 * 12 + 9,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 12500,
      gvwrLbs: 14500,
      hitchLbs: 500,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Chateau shares Four Winds cutaway platform",
      source: "Thor Chateau / Four Winds family brochure class",
    },
  },

  // ── 6) Coachmen Leprechaun Class C ───────────────────────────────────────
  {
    makeIncludes: "coachmen",
    modelIncludes: "leprechaun",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "260FS",
    spec: {
      lengthDisplay: `28' 6"`,
      overallLengthIn: 28 * 12 + 6,
      exteriorHeightIn: 11 * 12 + 1,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 11800,
      gvwrLbs: 14500,
      hitchLbs: 500,
      freshWater: 50,
      grayWater: 32,
      blackWater: 26,
      source: "Coachmen Leprechaun brochure class (260FS)",
    },
  },
  {
    makeIncludes: "coachmen",
    modelIncludes: "leprechaun",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "319MB",
    spec: {
      lengthDisplay: `32' 9"`,
      overallLengthIn: 32 * 12 + 9,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 13200,
      gvwrLbs: 14500,
      hitchLbs: 500,
      freshWater: 50,
      grayWater: 32,
      blackWater: 26,
      source: "Coachmen Leprechaun brochure class (319MB)",
    },
  },

  // ── 7) Forest River Cherokee Grey Wolf / Salem volume TTs ────────────────
  {
    makeIncludes: "forest river",
    modelIncludes: "grey wolf",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26DBH",
    spec: {
      lengthDisplay: `31' 4"`,
      overallLengthIn: 31 * 12 + 4,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 6120,
      gvwrLbs: 7600,
      hitchLbs: 720,
      freshWater: 40,
      grayWater: 38,
      blackWater: 28,
      propaneLbs: 40,
      source: "Forest River Cherokee Grey Wolf brochure class (26DBH)",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "cherokee",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26DBH",
    spec: {
      lengthDisplay: `31' 4"`,
      overallLengthIn: 31 * 12 + 4,
      exteriorHeightIn: 11 * 12 + 2,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 6120,
      gvwrLbs: 7600,
      hitchLbs: 720,
      freshWater: 40,
      grayWater: 38,
      blackWater: 28,
      propaneLbs: 40,
      source: "Forest River Cherokee Grey Wolf brochure class (26DBH)",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "salem",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26DBUD",
    spec: {
      lengthDisplay: `30' 9"`,
      overallLengthIn: 30 * 12 + 9,
      exteriorHeightIn: 11 * 12 + 1,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 5980,
      gvwrLbs: 7595,
      hitchLbs: 690,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      propaneLbs: 40,
      source: "Forest River Salem brochure class (26DBUD)",
    },
  },

  // ── 8) Airstream Flying Cloud / Bambi ────────────────────────────────────
  {
    makeIncludes: "airstream",
    modelIncludes: "flying cloud",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "25FB",
    spec: {
      lengthDisplay: `25' 11"`,
      overallLengthIn: 25 * 12 + 11,
      exteriorHeightIn: 9 * 12 + 9,
      exteriorWidthIn: 8 * 12 + 5.5,
      interiorHeightIn: 78,
      uvwLbs: 5800,
      gvwrLbs: 7300,
      hitchLbs: 725,
      freshWater: 37,
      grayWater: 37,
      blackWater: 39,
      propaneLbs: 40,
      source: "Airstream Flying Cloud brochure class (25FB)",
    },
  },
  {
    makeIncludes: "airstream",
    modelIncludes: "bambi",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "16RB",
    spec: {
      lengthDisplay: `16' 3"`,
      overallLengthIn: 16 * 12 + 3,
      exteriorHeightIn: 9 * 12 + 3,
      exteriorWidthIn: 8 * 12,
      interiorHeightIn: 74,
      uvwLbs: 3050,
      gvwrLbs: 3500,
      hitchLbs: 430,
      freshWater: 23,
      grayWater: 21,
      blackWater: 18,
      propaneLbs: 30,
      source: "Airstream Bambi 16RB product / walkthrough class",
    },
  },
  {
    makeIncludes: "airstream",
    modelIncludes: "bambi",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "22FB",
    spec: {
      lengthDisplay: `21' 11"`,
      overallLengthIn: 21 * 12 + 11,
      exteriorHeightIn: 9 * 12 + 3,
      exteriorWidthIn: 8 * 12,
      interiorHeightIn: 74,
      uvwLbs: 4100,
      gvwrLbs: 5000,
      hitchLbs: 525,
      freshWater: 23,
      grayWater: 21,
      blackWater: 18,
      propaneLbs: 30,
      source: "Airstream Bambi brochure class (22FB)",
    },
  },

  // ── 9) Alliance Paradigm / Avenue ────────────────────────────────────────
  {
    makeIncludes: "alliance",
    modelIncludes: "paradigm",
    yearMin: 2021,
    yearMax: 2026,
    floorplan: "310RL",
    spec: {
      lengthDisplay: `34' 11"`,
      overallLengthIn: 34 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 2,
      exteriorWidthIn: 101,
      interiorHeightIn: 102,
      uvwLbs: 13525,
      gvwrLbs: 16995,
      hitchLbs: 2674,
      freshWater: 98,
      grayWater: 98,
      blackWater: 49,
      propaneLbs: 60,
      source: "Alliance Paradigm 310RL product page",
    },
  },
  {
    makeIncludes: "alliance",
    modelIncludes: "paradigm",
    yearMin: 2021,
    yearMax: 2026,
    floorplan: "340RL",
    spec: {
      lengthDisplay: `37' 10"`,
      overallLengthIn: 37 * 12 + 10,
      exteriorHeightIn: 13 * 12 + 2,
      exteriorWidthIn: 101,
      interiorHeightIn: 102,
      uvwLbs: 14200,
      gvwrLbs: 17995,
      hitchLbs: 2850,
      freshWater: 98,
      grayWater: 98,
      blackWater: 49,
      propaneLbs: 60,
      source: "Alliance Paradigm 340RL product page class",
    },
  },
  {
    makeIncludes: "alliance",
    modelIncludes: "avenue",
    yearMin: 2021,
    yearMax: 2026,
    floorplan: "32RLS",
    spec: {
      lengthDisplay: `35' 11"`,
      overallLengthIn: 35 * 12 + 11,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 101,
      interiorHeightIn: 102,
      uvwLbs: 11850,
      gvwrLbs: 14995,
      hitchLbs: 2250,
      freshWater: 74,
      grayWater: 74,
      blackWater: 46,
      propaneLbs: 60,
      source: "Alliance Avenue 32RLS product class",
    },
  },

  // ── 10) Winnebago Travato / View Class B/B+ ──────────────────────────────
  {
    makeIncludes: "winnebago",
    modelIncludes: "travato",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "59K",
    spec: {
      lengthDisplay: `21' 0"`,
      overallLengthIn: 21 * 12,
      exteriorHeightIn: 9 * 12 + 4,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 8600,
      gvwrLbs: 9350,
      hitchLbs: 350,
      freshWater: 21,
      grayWater: 13,
      blackWater: 11,
      note: "Ram ProMaster 3500 · 3.6L V6 gas — not Sprinter",
      source: "Winnebago Travato brochure class (59K)",
    },
  },
  {
    makeIncludes: "winnebago",
    modelIncludes: "travato",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "59G",
    spec: {
      lengthDisplay: `21' 0"`,
      overallLengthIn: 21 * 12,
      exteriorHeightIn: 9 * 12 + 4,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 8550,
      gvwrLbs: 9350,
      hitchLbs: 350,
      freshWater: 21,
      grayWater: 13,
      blackWater: 11,
      note: "Ram ProMaster 3500 · 3.6L V6 gas",
      source: "Winnebago Travato brochure class (59G)",
    },
  },

  // ── 11) Tiffin Allegro Bus 45OPP (highline diesel) ───────────────────────
  {
    makeIncludes: "tiffin",
    modelIncludes: "allegro bus",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "45OPP",
    spec: {
      lengthDisplay: `45' 0"`,
      overallLengthIn: 45 * 12,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 38500,
      gvwrLbs: 50800,
      hitchLbs: 1500,
      freshWater: 100,
      grayWater: 70,
      blackWater: 50,
      note: "PowerGlide · Cummins L9 class ~450HP (verify year options)",
      source: "Tiffin Allegro Bus brochure class (45OPP)",
    },
  },

  // ── 12) Newmar Dutch Star volume diesel ──────────────────────────────────
  {
    makeIncludes: "newmar",
    modelIncludes: "dutch star",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "4081",
    spec: {
      lengthDisplay: `40' 10"`,
      overallLengthIn: 40 * 12 + 10,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 101.5,
      interiorHeightIn: 84,
      uvwLbs: 33500,
      gvwrLbs: 44460,
      hitchLbs: 1000,
      freshWater: 105,
      grayWater: 65,
      blackWater: 45,
      note: "Cummins L9 450HP Freightliner XC (Spartan optional some years)",
      source: "Newmar Dutch Star brochure class (4081)",
    },
  },

  // ── 13) Heartland Bighorn ────────────────────────────────────────────────
  {
    makeIncludes: "heartland",
    modelIncludes: "bighorn",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "3375SS",
    spec: {
      lengthDisplay: `37' 6"`,
      overallLengthIn: 37 * 12 + 6,
      exteriorHeightIn: 13 * 12 + 2,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 12850,
      gvwrLbs: 15995,
      hitchLbs: 2450,
      freshWater: 64,
      grayWater: 80,
      blackWater: 40,
      propaneLbs: 60,
      source: "Heartland Bighorn brochure class (3375SS)",
    },
  },

  // ── 14) Dutchmen Kodiak / Palomino Puma volume TTs ───────────────────────
  {
    makeIncludes: "dutchmen",
    modelIncludes: "kodiak",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "263BHSL",
    spec: {
      lengthDisplay: `30' 8"`,
      overallLengthIn: 30 * 12 + 8,
      exteriorHeightIn: 11 * 12 + 1,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 5820,
      gvwrLbs: 7595,
      hitchLbs: 680,
      freshWater: 44,
      grayWater: 32,
      blackWater: 32,
      propaneLbs: 40,
      source: "Dutchmen Kodiak Ultimate brochure class (263BHSL)",
    },
  },
  {
    makeIncludes: "palomino",
    modelIncludes: "puma",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "32BHQS",
    spec: {
      lengthDisplay: `36' 4"`,
      overallLengthIn: 36 * 12 + 4,
      exteriorHeightIn: 11 * 12 + 3,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 7450,
      gvwrLbs: 9995,
      hitchLbs: 920,
      freshWater: 43,
      grayWater: 35,
      blackWater: 30,
      propaneLbs: 40,
      source: "Palomino Puma brochure class (32BHQS)",
    },
  },

  // ── 15) LTV Unity / Pleasure-Way Plateau Class B+ ────────────────────────
  {
    makeIncludes: "leisure travel",
    modelIncludes: "unity",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "24FX",
    spec: {
      lengthDisplay: `25' 1"`,
      overallLengthIn: 25 * 12 + 1,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 95,
      interiorHeightIn: 78,
      uvwLbs: 11200,
      gvwrLbs: 12200,
      hitchLbs: 500,
      freshWater: 40,
      grayWater: 30,
      blackWater: 25,
      note: "Mercedes Sprinter · Murphy FX layout",
      source: "Leisure Travel Vans Unity brochure class (24FX / U24FX)",
    },
  },
  {
    makeIncludes: "leisure travel",
    modelIncludes: "unity",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "U24FX",
    spec: {
      lengthDisplay: `25' 1"`,
      overallLengthIn: 25 * 12 + 1,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 95,
      interiorHeightIn: 78,
      uvwLbs: 11200,
      gvwrLbs: 12200,
      hitchLbs: 500,
      freshWater: 40,
      grayWater: 30,
      blackWater: 25,
      source: "Leisure Travel Vans Unity brochure class (U24FX)",
    },
  },
  {
    makeIncludes: "pleasure-way",
    modelIncludes: "plateau",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "TS",
    spec: {
      lengthDisplay: `22' 9"`,
      overallLengthIn: 22 * 12 + 9,
      exteriorHeightIn: 9 * 12 + 10,
      exteriorWidthIn: 90,
      interiorHeightIn: 74,
      uvwLbs: 9800,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 30,
      grayWater: 22,
      blackWater: 18,
      note: "Mercedes Sprinter Class B",
      source: "Pleasure-Way Plateau TS product class",
    },
  },

  // ── 16) Jayco Eagle HT / Jay Feather volume ──────────────────────────────
  {
    makeIncludes: "jayco",
    modelIncludes: "eagle",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "29.5BHDS",
    spec: {
      lengthDisplay: `34' 6"`,
      overallLengthIn: 34 * 12 + 6,
      exteriorHeightIn: 11 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 7650,
      gvwrLbs: 9995,
      hitchLbs: 890,
      freshWater: 48,
      grayWater: 32.5,
      blackWater: 32.5,
      propaneLbs: 60,
      source: "Jayco Eagle HT brochure class (29.5BHDS)",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "jay feather",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "22RB",
    spec: {
      lengthDisplay: `26' 8"`,
      overallLengthIn: 26 * 12 + 8,
      exteriorHeightIn: 10 * 12 + 10,
      exteriorWidthIn: 96,
      interiorHeightIn: 78,
      uvwLbs: 4980,
      gvwrLbs: 6500,
      hitchLbs: 520,
      freshWater: 42,
      grayWater: 30.5,
      blackWater: 30.5,
      propaneLbs: 40,
      source: "Jayco Jay Feather brochure class (22RB)",
    },
  },

  // ── 17) Entegra Vision (gas Class A volume) ──────────────────────────────
  {
    makeIncludes: "entegra",
    modelIncludes: "vision",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "29S",
    spec: {
      lengthDisplay: `30' 7"`,
      overallLengthIn: 30 * 12 + 7,
      exteriorHeightIn: 12 * 12 + 0,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 16200,
      gvwrLbs: 18000,
      hitchLbs: 500,
      freshWater: 50,
      grayWater: 41,
      blackWater: 27,
      note: "Ford F53 · 7.3L Godzilla recent years",
      source: "Entegra Vision brochure class (29S)",
    },
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "vision",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "27A",
    spec: {
      lengthDisplay: `29' 0"`,
      overallLengthIn: 29 * 12,
      exteriorHeightIn: 12 * 12 + 0,
      exteriorWidthIn: 100,
      interiorHeightIn: 84,
      uvwLbs: 15800,
      gvwrLbs: 18000,
      hitchLbs: 500,
      freshWater: 50,
      grayWater: 41,
      blackWater: 27,
      source: "Entegra Vision brochure class (27A)",
    },
  },

  // ── 18) Roadtrek Zion (ProMaster Class B volume) ─────────────────────────
  {
    makeIncludes: "roadtrek",
    modelIncludes: "zion",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "SLUMBER",
    spec: {
      lengthDisplay: `19' 9"`,
      overallLengthIn: 19 * 12 + 9,
      exteriorHeightIn: 9 * 12 + 2,
      exteriorWidthIn: 83,
      interiorHeightIn: 71,
      uvwLbs: 7600,
      gvwrLbs: 9350,
      hitchLbs: 350,
      freshWater: 16,
      grayWater: 12,
      blackWater: 0,
      note: "Ram ProMaster · cassette/composting black often 0 gal tank",
      source: "Roadtrek Zion Slumber brochure class",
    },
  },

  // ── Storyteller / Coach House / Midwest / Galleria (Class B specialists) ──
  {
    makeIncludes: "storyteller",
    modelIncludes: "mode",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "170",
    spec: {
      lengthDisplay: `24' 0"`,
      overallLengthIn: 24 * 12,
      exteriorHeightIn: 9 * 12 + 8,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 9800,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 30,
      grayWater: 22,
      blackWater: 0,
      note: "Sprinter 170 EXT · cassette black common",
      source: "Storyteller MODE brochure class (170)",
    },
  },
  {
    makeIncludes: "storyteller",
    modelIncludes: "mode",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "144",
    spec: {
      lengthDisplay: `19' 6"`,
      overallLengthIn: 19 * 12 + 6,
      exteriorHeightIn: 9 * 12 + 8,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 9000,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 28,
      grayWater: 20,
      blackWater: 0,
      source: "Storyteller MODE brochure class (144)",
    },
  },
  {
    makeIncludes: "coach house",
    modelIncludes: "platinum ii",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "240SQ",
    spec: {
      lengthDisplay: `24' 6"`,
      overallLengthIn: 24 * 12 + 6,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 95,
      interiorHeightIn: 76,
      uvwLbs: 10500,
      gvwrLbs: 12200,
      hitchLbs: 500,
      freshWater: 35,
      grayWater: 28,
      blackWater: 25,
      note: "Mercedes Sprinter 3500 · SQ layout",
      source: "Coach House Platinum II 240 SQ product class",
    },
  },
  {
    makeIncludes: "coach house",
    modelIncludes: "platinum ii",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "241XL SQ",
    spec: {
      lengthDisplay: `25' 0"`,
      overallLengthIn: 25 * 12,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 95,
      interiorHeightIn: 76,
      uvwLbs: 11000,
      gvwrLbs: 12200,
      hitchLbs: 500,
      freshWater: 35,
      grayWater: 28,
      blackWater: 25,
      note: "XL = slideout",
      source: "Coach House Platinum II 241XL class",
    },
  },
  {
    makeIncludes: "midwest",
    modelIncludes: "passage",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "MD2",
    spec: {
      lengthDisplay: `24' 2"`,
      overallLengthIn: 24 * 12 + 2,
      exteriorHeightIn: 9 * 12 + 10,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 10200,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 28,
      grayWater: 20,
      blackWater: 0,
      note: "Sprinter 170 EXT · two-seat flagship",
      source: "Midwest Passage MD2 product class",
    },
  },
  {
    makeIncludes: "midwest",
    modelIncludes: "passage",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "FD2",
    spec: {
      lengthDisplay: `19' 6"`,
      overallLengthIn: 19 * 12 + 6,
      exteriorHeightIn: 9 * 12 + 10,
      exteriorWidthIn: 83,
      interiorHeightIn: 74,
      uvwLbs: 9200,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 24,
      grayWater: 16,
      blackWater: 0,
      note: "Sprinter 144 · compact FD2",
      source: "Midwest Passage FD2 product class",
    },
  },
  {
    makeIncludes: "coachmen",
    modelIncludes: "galleria",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "24A",
    spec: {
      lengthDisplay: `24' 6"`,
      overallLengthIn: 24 * 12 + 6,
      exteriorHeightIn: 10 * 12 + 4,
      exteriorWidthIn: 90,
      interiorHeightIn: 74,
      uvwLbs: 9800,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 28,
      grayWater: 22,
      blackWater: 15,
      note: "Mercedes Sprinter Class B",
      source: "Coachmen Galleria brochure class (24A)",
    },
  },
  {
    makeIncludes: "coachmen",
    modelIncludes: "galleria",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "24T",
    spec: {
      lengthDisplay: `24' 6"`,
      overallLengthIn: 24 * 12 + 6,
      exteriorHeightIn: 10 * 12 + 4,
      exteriorWidthIn: 90,
      interiorHeightIn: 74,
      uvwLbs: 9900,
      gvwrLbs: 11030,
      hitchLbs: 500,
      freshWater: 28,
      grayWater: 22,
      blackWater: 15,
      source: "Coachmen Galleria brochure class (24T)",
    },
  },
  // ── Thor Vegas / Axis (compact Class A RUV — Ford cutaway) ─────────────
  // OEM: 7.3L 325 HP / 450 lb-ft; 55 gal; hitch 8,000; GVWR 12,500–14,500
  {
    makeIncludes: "thor",
    modelIncludes: "vegas",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "24.1",
    spec: {
      lengthDisplay: `25' 8"`,
      overallLengthIn: 25 * 12 + 8,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 10500,
      gvwrLbs: 12500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Vegas 24.1 · Ford 7.3L 325/450 · cutaway Class A body · sister Axis 24.1",
      source: "Thor Motor Coach Vegas OEM floorplan specs",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "vegas",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26.1",
    spec: {
      lengthDisplay: `27' 2"`,
      overallLengthIn: 27 * 12 + 2,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 11800,
      gvwrLbs: 14500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Vegas 26.1 · GVWR 14,500",
      source: "Thor Motor Coach Vegas OEM floorplan specs",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "vegas",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26.2",
    spec: {
      lengthDisplay: `27' 2"`,
      overallLengthIn: 27 * 12 + 2,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 11800,
      gvwrLbs: 14500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Vegas 26.2 · GVWR 14,500",
      source: "Thor Motor Coach Vegas OEM floorplan specs",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "vegas",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "28.1",
    spec: {
      lengthDisplay: `30' 6"`,
      overallLengthIn: 30 * 12 + 6,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 12200,
      gvwrLbs: 14500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Vegas 28.1 · ~30' 6\" · GVWR 14,500",
      source: "Thor Motor Coach Vegas OEM floorplan specs",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "axis",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "24.1",
    spec: {
      lengthDisplay: `25' 8"`,
      overallLengthIn: 25 * 12 + 8,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 10500,
      gvwrLbs: 12500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Axis 24.1 · same platform as Vegas 24.1 · Ford 7.3L 325/450",
      source: "Thor Motor Coach Axis OEM floorplan specs",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "axis",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "28.1",
    spec: {
      lengthDisplay: `30' 6"`,
      overallLengthIn: 30 * 12 + 6,
      exteriorHeightIn: 11 * 12,
      exteriorWidthIn: 94,
      interiorHeightIn: 80,
      uvwLbs: 12200,
      gvwrLbs: 14500,
      hitchLbs: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      note: "Axis 28.1 · sister to Vegas 28.1",
      source: "Thor Motor Coach Axis OEM floorplan specs",
    },
  },
  // ── Jayco Seneca Super C ───────────────────────────────────────────────
  {
    makeIncludes: "jayco",
    modelIncludes: "seneca",
    yearMin: 2021,
    yearMax: 2027,
    floorplan: "37K",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26000,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 50,
      blackWater: 50,
      sleeps: 6,
      slideouts: 2,
      layoutNote: "Bath-and-a-half · king · 93\" sofa / fireplace · couples + guests",
      note: "Seneca 37K bath-and-a-half · sleeps 6 · S2RV Plus · ISB 6.7 360/800 · GCWR 43,000",
      source: "Jayco Seneca OEM Super C specs",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "seneca",
    yearMin: 2021,
    yearMax: 2027,
    floorplan: "37L",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26200,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 50,
      blackWater: 50,
      sleeps: 9,
      slideouts: 3,
      layoutNote: "Bunkhouse · king + cabover + two 300-lb bunks · theater seats · families",
      note: "Seneca 37L bunkhouse · sleeps 9 · same S2RV Plus 360/800 package",
      source: "Jayco Seneca OEM Super C specs",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "seneca",
    yearMin: 2021,
    yearMax: 2027,
    floorplan: "37M",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26500,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 50,
      blackWater: 50,
      sleeps: 8,
      slideouts: 3,
      layoutNote: "Opposing slides · king · open living · no dedicated bunks",
      note: "Seneca 37M opposing slides · sleeps 8 · ISB 6.7 360/800 · hitch 12k",
      source: "Jayco Seneca OEM Super C specs",
    },
  },
  // ── Entegra Accolade / Accolade XL (Seneca sibling) ────────────────────
  {
    makeIncludes: "entegra",
    modelIncludes: "accolade",
    yearMin: 2024,
    yearMax: 2026,
    floorplan: "37K",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26000,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 91,
      blackWater: 63,
      note: "Accolade 37K · same Super C as Jayco Seneca · S2RV Plus · ISB 6.7 360/800 · GCWR 43,000",
      source: "Entegra Accolade OEM Super C specs",
    },
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "accolade",
    yearMin: 2024,
    yearMax: 2026,
    floorplan: "37L",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26200,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 81,
      blackWater: 50,
      note: "Accolade 37L bunks · Seneca sibling · hitch 12k",
      source: "Entegra Accolade OEM Super C specs",
    },
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "accolade",
    yearMin: 2024,
    yearMax: 2026,
    floorplan: "37M",
    spec: {
      lengthDisplay: `39' 4"`,
      overallLengthIn: 39 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      uvwLbs: 26500,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      grayWater: 80,
      blackWater: 50,
      note: "Accolade 37M theater · Seneca sibling · ISB 6.7 360/800",
      source: "Entegra Accolade OEM Super C specs",
    },
  },
  // ── Tiffin Phaeton (OEM brochure weights & measures) ───────────────────
  // Cummins L9; 380 HP / 1,150 lb-ft std; 450 / 1,250 optional.
  // Chassis: Freightliner S / PowerGlide O. Hitch 10,000 lb. Fuel 100 gal.
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "37BH",
    spec: {
      lengthDisplay: `38' 7"`,
      overallLengthIn: 38 * 12 + 7,
      exteriorHeightIn: 12 * 12 + 7,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 32000,
      gvwrLbs: 38320,
      hitchLbs: 10000,
      freshWater: 90,
      grayWater: 66,
      blackWater: 50,
      note: "WB 234 · GAWR-F 14,320 · GAWR-R 24,000 · GCWR 48,320 · L9 380 only (450 NOT offered on 37BH)",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "40AH",
    spec: {
      lengthDisplay: `41' 5"`,
      overallLengthIn: 41 * 12 + 5,
      exteriorHeightIn: 12 * 12 + 7,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 33000,
      gvwrLbs: 38320,
      hitchLbs: 10000,
      freshWater: 90,
      grayWater: 66,
      blackWater: 50,
      note: "WB 266 · L9 380 std / 450 optional",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "40IH",
    spec: {
      lengthDisplay: `41' 4"`,
      overallLengthIn: 41 * 12 + 4,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 33500,
      gvwrLbs: 39600,
      hitchLbs: 10000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      note: "WB 266 · GAWR-F 15,600 · L9 380 std",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "40QBH",
    spec: {
      lengthDisplay: `40' 0"`,
      overallLengthIn: 40 * 12,
      exteriorHeightIn: 12 * 12 + 7,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 32800,
      gvwrLbs: 38320,
      hitchLbs: 10000,
      freshWater: 90,
      grayWater: 66,
      blackWater: 50,
      note: "Brochure 40 QBH · WB 266 · L9 380 std",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "40QKH",
    spec: {
      lengthDisplay: `40' 0"`,
      overallLengthIn: 40 * 12,
      exteriorHeightIn: 12 * 12 + 7,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 32800,
      gvwrLbs: 38320,
      hitchLbs: 10000,
      freshWater: 90,
      grayWater: 66,
      blackWater: 50,
      note: "Brochure 40 QKH · WB 266 · L9 380 std",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2026,
    floorplan: "44OH",
    spec: {
      lengthDisplay: `44' 0"`,
      overallLengthIn: 44 * 12,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 38000,
      gvwrLbs: 45600,
      hitchLbs: 10000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      note: "Tag axle · WB 310 · GAWR-tag 10,000 · 450 HP option common — confirm build",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
];

// Duplicate Model T OEM rows for Model G (official OEM name)
for (const row of [...OEM_FLOORPLAN_ROWS]) {
  if (row.modelIncludes === "model t") {
    OEM_FLOORPLAN_ROWS.push({
      ...row,
      modelIncludes: "model g",
      spec: { ...row.spec },
    });
  }
}

/** Look up brochure-backed floorplan specs when available. */
export function findOemFloorplanSpec(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): OemFloorplanSpec | null {
  if (!floorplan?.trim()) return null;
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return null;
  const mk = make.toLowerCase();
  const md = model.toLowerCase();
  const fp = floorplan.trim().toUpperCase().replace(/\s+/g, "");

  // Prefer the most specific modelIncludes match (longest string) so
  // "Discovery LXE" does not inherit base "Discovery" rows, etc.
  let best: OemFloorplanSpec | null = null;
  let bestScore = -1;
  for (const row of OEM_FLOORPLAN_ROWS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    // Avoid base-line rows stealing sub-line models (e.g. Discovery vs Discovery LXE)
    if (
      row.modelIncludes === "discovery" &&
      md.includes("lxe") &&
      !row.modelIncludes.includes("lxe")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "cougar" &&
      (md.includes("half") || md.includes("5th") || md.includes("fifth")) &&
      row.modelIncludes === "cougar"
    ) {
      // allow half-ton / 5th specific rows (longer modelIncludes) to win via score
    }
    const rowFp = row.floorplan.toUpperCase().replace(/\s+/g, "");
    if (rowFp !== fp) continue;
    const score = row.modelIncludes.length * 10 + row.makeIncludes.length;
    if (score > bestScore) {
      bestScore = score;
      best = row.spec;
    }
  }
  return best;
}

/** Leading 2-digit length from floorplan code, if present and sane. */
export function lengthFtFromFloorplan(
  floorplan: string | undefined,
  lengthRange: [number, number],
  opts?: { make?: string; model?: string },
): number | null {
  if (!floorplan) return null;
  const raw = floorplan.trim();
  const [lo, hi] = lengthRange;
  const make = (opts?.make || "").toLowerCase();
  const model = (opts?.model || "").toLowerCase();

  // Brinkley 4-digit (3250, 3950): NOT overall length in feet — never use leading digits
  if (
    /^\d{4}$/.test(raw) &&
    (make.includes("brinkley") ||
      model.includes("model t") ||
      model.includes("model g") ||
      /5\d$/.test(raw)) // 3250/3950 class ending *50
  ) {
    // Only treat *50 as Brinkley-style when make/model known OR range doesn't contain leading 2 digits
    if (make.includes("brinkley") || model.includes("model t") || model.includes("model g")) {
      return null;
    }
    const lead = parseInt(raw.slice(0, 2), 10);
    // If leading two digits are nowhere near catalog length, it's a plan code not length
    if (Number.isFinite(lead) && (lead < lo - 3 || lead > hi + 3)) return null;
  }

  // Newmar / Tiffin / most Class A: 3436, 4037, 37BH → leading length digits
  // Prefer 2-digit start (34, 37, 40) then 3-digit if needed
  let n: number | null = null;
  const m2 = raw.match(/^(\d{2})/);
  if (m2) {
    n = parseInt(m2[1]!, 10);
  }
  if (n == null || !Number.isFinite(n)) return null;
  // allow slight brochure drift outside catalog range
  if (n < lo - 3 || n > hi + 3) return null;
  return n;
}

/** Typical bumper/cap extra beyond floorplan class length (OEM: 37BH → 38' 7"). */
function overallOffsetInches(type?: string): number {
  const t = (type || "").toLowerCase();
  if (t.includes("class a") && t.includes("diesel")) return 19;
  if (t.includes("class a")) return 14;
  if (t.includes("super c")) return 12;
  if (t.includes("class c")) return 10;
  if (t.includes("class b")) return 4;
  if (t.includes("fifth")) return 6;
  if (t.includes("toy hauler")) return 8;
  if (t.includes("travel trailer")) return 6;
  return 8;
}

/**
 * Actual overall length in inches for a selected floorplan.
 * Uses leading class digits + typical OEM cap/bumper, clamped to the model span.
 */
export function overallInchesFromFloorplan(
  floorplan: string | undefined,
  lengthRange: [number, number],
  opts?: { make?: string; model?: string; type?: string },
): number | null {
  const n = lengthFtFromFloorplan(floorplan, lengthRange, opts);
  if (n == null) return null;
  const extra = overallOffsetInches(opts?.type);
  const inches = n * 12 + extra;
  const lo = Math.max(12, lengthRange[0] * 12);
  const hi = lengthRange[1] * 12 + 24;
  return Math.min(hi, Math.max(lo, inches));
}

export function formatInchesAsFtIn(totalIn: number): string {
  const whole = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn - whole * 12);
  if (inches === 12) return `${whole + 1}' 0"`;
  if (inches === 0) return `${whole}' 0"`;
  return `${whole}' ${inches}"`;
}

export function formatFloorplanLength(
  floorplan: string | undefined,
  lengthRange: [number, number],
  opts?: { make?: string; model?: string; type?: string },
): string {
  const inches = overallInchesFromFloorplan(floorplan, lengthRange, opts);
  if (inches != null) return formatInchesAsFtIn(inches);
  if (lengthRange[0] === lengthRange[1]) {
    return formatInchesAsFtIn(lengthRange[0] * 12);
  }
  // Floorplan selected but not a length code — still one number (mid of span), not 34–44
  if (floorplan?.trim()) {
    const mid = (lengthRange[0] + lengthRange[1]) / 2;
    return formatInchesAsFtIn(Math.round(mid * 12));
  }
  return `${lengthRange[0]}–${lengthRange[1]} ft`;
}

/** Weight estimate narrowed by floorplan length position in range. */
export function weightForFloorplan(
  floorplan: string | undefined,
  weightRange: [number, number],
  lengthRange: [number, number],
  opts?: { make?: string; model?: string },
): { gvwr: string; uvwEst: number; cccEst: number; mid: number } {
  const [wLo, wHi] = weightRange;
  const midDefault = (wLo + wHi) / 2;
  const len = lengthFtFromFloorplan(floorplan, lengthRange, opts);
  let mid = midDefault;
  if (len != null && lengthRange[1] > lengthRange[0]) {
    const t = Math.min(
      1,
      Math.max(0, (len - lengthRange[0]) / (lengthRange[1] - lengthRange[0])),
    );
    mid = wLo + t * (wHi - wLo);
  }
  // When floorplan pinned, show a tight band around mid (±6%) not full model span
  if (len != null) {
    const lo = Math.round((mid * 0.94) / 100) * 100;
    const hi = Math.round((mid * 1.06) / 100) * 100;
    const uvw = Math.round(mid * 0.82);
    const ccc = Math.max(800, Math.round(mid - uvw));
    return {
      gvwr: `${lo.toLocaleString()}–${hi.toLocaleString()} lbs`,
      uvwEst: uvw,
      cccEst: ccc,
      mid,
    };
  }
  const uvw = Math.round(midDefault * 0.82);
  const ccc = Math.max(800, Math.round(midDefault - uvw));
  return {
    gvwr: `${wLo.toLocaleString()}–${wHi.toLocaleString()} lbs`,
    uvwEst: uvw,
    cccEst: ccc,
    mid: midDefault,
  };
}
