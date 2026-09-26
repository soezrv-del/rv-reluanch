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
  /** Brochure / sticker UVW only. Omit when the table prints GVWR and not UVW. */
  uvwLbs?: number;
  gvwrLbs: number;
  hitchLbs: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  propaneLbs?: number;
  /** Published gallons only. Never convert from pounds. */
  propaneGal?: number;
  /** Brochure water-heater gallons. Omit when the table does not print it. */
  waterHeaterGal?: number;
  garageLengthFt?: number;
  garageWidthFt?: number;
  garageHeightIn?: number;
  /** Garage door / ramp rating (lbs) */
  garageCapacityLbs?: number;
  rampPatioLbs?: number;
  fuelStationGal?: number;
  /** Brochure fuel gallons. 0 means the sheet conflicts (dual chassis) — do not inherit the series tank. */
  fuelCapacityGal?: number;
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
  // Model G / Model T catalog stamps (gvwrLbs/uvwLbs) were cleared so these
  // dated floorplan rows are SoT — do not restamp 23000 onto 22k plans.
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
    yearMax: 2027,
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
      note: "17' garage/flex — largest Model G garage class. MY2027 flyer matches these weights and tanks.",
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
  // Brochure / dealer capacities print GVWR 33,400 — not UVW. Do not invent
  // UVW (the old 24,500 / 25,500 / 25,200 / 25,800 figures were ~GVWR×0.835
  // kitchen math). TTW falls through to the tiered UVW_EST / GVWR path.
  {
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    yearMin: 2020,
    yearMax: 2023,
    floorplan: "36Q",
    spec: {
      lengthDisplay: `37' 3"`,
      overallLengthIn: 37 * 12 + 3,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
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
    yearMax: 2023,
    floorplan: "38K",
    spec: {
      lengthDisplay: `40' 0"`,
      overallLengthIn: 40 * 12,
      exteriorHeightIn: 12 * 12 + 10,
      exteriorWidthIn: 102,
      interiorHeightIn: 84,
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
      lengthDisplay: `32' 10"`,
      overallLengthIn: 32 * 12 + 10,
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
      source:
        "Grand Design Reflection 2026 brochure fifth-wheel table: 303RLS hitch-to-rear (LENGTH) 32' 10\"",
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
      lengthDisplay: `31' 9"`,
      overallLengthIn: 31 * 12 + 9,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 6120,
      gvwrLbs: 7600,
      hitchLbs: 720,
      freshWater: 40,
      grayWater: 38,
      blackWater: 28,
      propaneLbs: 40,
      source:
        "2025 Forest River Cherokee Grey Wolf brochure: 26DBH Exterior Length 31' 9\"; Exterior Height w/A/C 10' 6\"",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "cherokee",
    yearMin: 2020,
    yearMax: 2026,
    floorplan: "26DBH",
    spec: {
      lengthDisplay: `31' 9"`,
      overallLengthIn: 31 * 12 + 9,
      exteriorHeightIn: 10 * 12 + 6,
      exteriorWidthIn: 96,
      interiorHeightIn: 80,
      uvwLbs: 6120,
      gvwrLbs: 7600,
      hitchLbs: 720,
      freshWater: 40,
      grayWater: 38,
      blackWater: 28,
      propaneLbs: 40,
      source:
        "2025 Forest River Cherokee Grey Wolf brochure: 26DBH Exterior Length 31' 9\"; Exterior Height w/A/C 10' 6\"",
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
    yearMax: 2027,
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
    yearMax: 2024,
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
  // 33J is MY27-new (do not copy backward). 2027 Jayco Seneca brochure
  // (Printed 8/26 ©2026 Jayco 2033094) prints GVWR/GCWR — not UVW.
  {
    makeIncludes: "jayco",
    modelIncludes: "seneca",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "33J",
    spec: {
      lengthDisplay: `34' 2"`,
      overallLengthIn: 34 * 12 + 2,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      gvwrLbs: 31000,
      hitchLbs: 12000,
      freshWater: 72,
      note: "Seneca Super C 33J · WB 238\" · GCWR 43,000 · 2027 Jayco Seneca brochure (Printed 8/26). UVW not printed — do not invent. Not Seneca XT / not Seneca Prestige.",
      source: "2027 Jayco Seneca brochure (Printed 8/26 ©2026 Jayco 2033094)",
    },
  },
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
  // MY19–23: L9 380 std on 37BH. MY24+ brochure: L9 450 std on all plans.
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2023,
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
      note: "WB 234 · GAWR-F 14,320 · GAWR-R 24,000 · GCWR 48,320 · L9 380 only through MY23",
      source: "Tiffin Phaeton OEM brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2024,
    yearMax: 2027,
    floorplan: "37BH",
    spec: {
      lengthDisplay: `38' 2"`,
      overallLengthIn: 38 * 12 + 2,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 32000,
      gvwrLbs: 39660,
      hitchLbs: 10000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      note: "OEM MY24 Phaeton 37 BH: 38' 2\" · 13' 3\" XSH · GVWR 39,660 · L9 450 / 1,250 std",
      source: "Tiffin MY24 Phaeton Product Update Brochure weights & measures",
    },
  },
  {
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    yearMin: 2019,
    yearMax: 2022,
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
    yearMax: 2022,
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
    yearMax: 2022,
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
      lengthDisplay: `45' 0"`,
      overallLengthIn: 45 * 12,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 101,
      interiorHeightIn: 83,
      uvwLbs: 38000,
      gvwrLbs: 45600,
      hitchLbs: 10000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      note: "Tag axle · WB 310 · GAWR-tag 10,000 · MY25/MY26 Overall Length 45' · 450 HP option common — confirm build",
      source:
        "Tiffin MY25/MY26 Phaeton brochure weights & measures: 44 OH Overall Length 45' (WB 310\")",
    },
  },

  // Forest River Impression — spec pages that print length, height, width, tanks, and GVWR.
  // 2026 dealer-stock pages. Do not apply to 2025 or 2027 (2027 is a separate version link).
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "318RL",
    spec: {
      lengthDisplay: `38' 11"`,
      overallLengthIn: 38 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 96,
      uvwLbs: 11153,
      gvwrLbs: 14120,
      hitchLbs: 2120,
      freshWater: 57,
      grayWater: 60,
      blackWater: 30,
      note: "Awning 13' and 14'.",
      source: "forestriverinc.com/rvs/print/impression/318RL/11885",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "315MB",
    spec: {
      lengthDisplay: `38' 0"`,
      overallLengthIn: 38 * 12,
      exteriorHeightIn: 13 * 12 + 2,
      exteriorWidthIn: 96,
      uvwLbs: 10338,
      gvwrLbs: 13213,
      hitchLbs: 1935,
      freshWater: 57,
      grayWater: 62,
      blackWater: 30,
      note: "Awning 18'.",
      source: "forestriverinc.com/rvs/print/impression/315MB/11884",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "36BR3",
    spec: {
      lengthDisplay: `41' 10"`,
      overallLengthIn: 41 * 12 + 10,
      exteriorHeightIn: 13 * 12 + 1,
      exteriorWidthIn: 96,
      uvwLbs: 11788,
      gvwrLbs: 14155,
      hitchLbs: 2155,
      freshWater: 57,
      grayWater: 60,
      blackWater: 30,
      note: "Awning 14' and 20'.",
      source: "forestriverinc.com/rvs/print/impression/36BR3/13145",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19BHLE",
    spec: {
      lengthDisplay: `23' 7"`,
      overallLengthIn: 23 * 12 + 7,
      exteriorHeightIn: 10 * 12 + 9,
      exteriorWidthIn: 88,
      uvwLbs: 3777,
      gvwrLbs: 5608,
      hitchLbs: 408,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      sleeps: 6,
      note: "Awning 15'. 2026 dealer stock page.",
      source: "forestriverinc.com/rvs/surveyor-legend/19BHLE/12175",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "NB19.6",
    spec: {
      lengthDisplay: `25' 2"`,
      overallLengthIn: 25 * 12 + 2,
      exteriorHeightIn: 10 * 12 + 9,
      exteriorWidthIn: 88,
      uvwLbs: 4645,
      gvwrLbs: 6145,
      hitchLbs: 610,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "Standard NB19.6, not Beast Mode (Beast Mode UVW 5,098 / GVWR 6,598). Awning 16'. 2026 page and 2027 page print the same standard weights.",
      source: "forestriverinc.com/rvs/no-boundaries/NB19.6/11769 and /15953",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "serenova",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "150HL",
    spec: {
      lengthDisplay: `19' 2"`,
      overallLengthIn: 19 * 12 + 2,
      exteriorHeightIn: 8 * 12 + 10,
      exteriorWidthIn: 84,
      interiorHeightIn: 6 * 12 + 5,
      uvwLbs: 4650,
      gvwrLbs: 5400,
      hitchLbs: 865,
      freshWater: 39,
      grayWater: 30,
      blackWater: 30,
      sleeps: 2,
      slideouts: 1,
      axles: "1",
      tireSize: "ST225/75R15LRE",
      note: "MSRP $65,239. Propane tank count printed as 2 — pounds not pinned.",
      source: "granddesignrv.com/travel-trailers/serenova/150hl (copyright 2026)",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "serenova",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "160LG",
    spec: {
      lengthDisplay: `20' 2"`,
      overallLengthIn: 20 * 12 + 2,
      exteriorHeightIn: 10 * 12,
      exteriorWidthIn: 101,
      interiorHeightIn: 6 * 12 + 6,
      uvwLbs: 4436,
      gvwrLbs: 5400,
      hitchLbs: 589,
      freshWater: 39,
      grayWater: 30,
      blackWater: 30,
      propaneLbs: 40,
      sleeps: 4,
      slideouts: 0,
      axles: "1",
      tireSize: "ST225/75R15LRE",
      note: "MSRP $64,008. Awning 11'. 200W solar on this plan page. Slides N/A.",
      source: "granddesignrv.com/travel-trailers/serenova/160lg (page dated 2026-09-21)",
    },
  },

  // Carson RV Show — dated Brinkley flyers. Gray is the printed total
  // (true tank + extra) when the flyer gives both.
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "3100",
    spec: {
      lengthDisplay: `34' 11"`,
      overallLengthIn: 34 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 12276,
      gvwrLbs: 15495,
      hitchLbs: 2298,
      freshWater: 75,
      grayWater: 90,
      blackWater: 45,
      note: "Gray 90 gal true. Not the 50/50 series seed.",
      source: "2026 Brinkley Model Z 3100 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "3200",
    spec: {
      lengthDisplay: `34' 11"`,
      overallLengthIn: 34 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 3,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 12676,
      gvwrLbs: 15995,
      hitchLbs: 2267,
      freshWater: 75,
      grayWater: 120,
      blackWater: 45,
      note: "Gray 90 true + 30.",
      source: "2026 Brinkley Model Z 3200 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "3420",
    spec: {
      lengthDisplay: `39' 11"`,
      overallLengthIn: 39 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 14794,
      gvwrLbs: 17695,
      hitchLbs: 2612,
      freshWater: 75,
      grayWater: 130,
      blackWater: 45,
      note: "Gray 90 true + 40.",
      source: "2026 Brinkley Model Z 3420 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "3600",
    spec: {
      lengthDisplay: `38' 11"`,
      overallLengthIn: 38 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 13998,
      gvwrLbs: 17495,
      hitchLbs: 2388,
      freshWater: 150,
      grayWater: 128,
      blackWater: 45,
      note: "Gray 128 gal true. Fresh is 150 on this plan, not 75.",
      source: "2026 Brinkley Model Z 3600 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "3515",
    spec: {
      lengthDisplay: `39' 11"`,
      overallLengthIn: 39 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 14231,
      gvwrLbs: 17495,
      hitchLbs: 2591,
      freshWater: 75,
      grayWater: 118,
      blackWater: 44,
      note: "Gray 88 true + 30.",
      source: "2027 Brinkley Model Z 3515 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model z",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "3610",
    spec: {
      lengthDisplay: `41' 9"`,
      overallLengthIn: 41 * 12 + 9,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 96,
      interiorHeightIn: 79.5,
      uvwLbs: 14997,
      gvwrLbs: 17695,
      hitchLbs: 2601,
      freshWater: 75,
      grayWater: 88,
      blackWater: 44,
      note: "Gray 88 gal true.",
      source: "2027 Brinkley Model Z 3610 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model g",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "4150",
    spec: {
      lengthDisplay: `46' 5"`,
      overallLengthIn: 46 * 12 + 5,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 19200,
      gvwrLbs: 23500,
      hitchLbs: 3600,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 11,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      note: "Gray 104 true + 52. GVWR 23,500 on the triple-axle standard.",
      source: "2026 Brinkley Model G 4150 floorplan flyer",
    },
  },
  {
    makeIncludes: "brinkley",
    modelIncludes: "model g",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "4170",
    spec: {
      lengthDisplay: `46' 11"`,
      overallLengthIn: 46 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 79.5,
      uvwLbs: 19100,
      gvwrLbs: 23000,
      hitchLbs: 3300,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      propaneLbs: 60,
      garageLengthFt: 10.5,
      garageCapacityLbs: 3000,
      rampPatioLbs: 1500,
      fuelStationGal: 60,
      note: "Gray 104 true + 52. Garage 10' 6\".",
      source: "2026 Brinkley Model G 4170 floorplan flyer",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "hideout mini",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "166RB",
    spec: {
      lengthDisplay: `20' 6"`,
      overallLengthIn: 20 * 12 + 6,
      exteriorHeightIn: 118,
      exteriorWidthIn: 96,
      uvwLbs: 3090,
      gvwrLbs: 4385,
      hitchLbs: 385,
      freshWater: 21,
      grayWater: 34,
      blackWater: 34,
      sleeps: 3,
      note: "Length is the dealer card; Keystone's compare table left 166RB length blank. Weights and tanks are the OEM table (shipping 3,090 + carrying 1,295).",
      source: "Keystone Hideout Mini specs table + 2026 RV Guide 166RB",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "hideout mini",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "186SS",
    spec: {
      lengthDisplay: `22' 10"`,
      overallLengthIn: 274,
      exteriorHeightIn: 124,
      exteriorWidthIn: 96,
      uvwLbs: 4029,
      gvwrLbs: 5100,
      hitchLbs: 565,
      freshWater: 21,
      grayWater: 30,
      blackWater: 30,
      sleeps: 6,
      note: "Not on the six-plan OEM compare table. 274 in is 22' 10\".",
      source: "2026 RV Guide Hideout Mini 186SS",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "hideout mini",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "195RBS",
    spec: {
      lengthDisplay: `23' 4"`,
      overallLengthIn: 23 * 12 + 4,
      exteriorHeightIn: 120,
      exteriorWidthIn: 96,
      uvwLbs: 4020,
      gvwrLbs: 5620,
      hitchLbs: 520,
      freshWater: 45,
      grayWater: 34,
      blackWater: 34,
      sleeps: 3,
      slideouts: 1,
      note: "GVWR is OEM shipping 4,020 + carrying capacity 1,600.",
      source: "Keystone Hideout Mini specs table",
    },
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "anthem",
    yearMin: 2016,
    yearMax: 2017,
    floorplan: "44DLQ",
    spec: {
      lengthDisplay: `44' 11"`,
      overallLengthIn: 44 * 12 + 11,
      exteriorHeightIn: 153,
      exteriorWidthIn: 101,
      gvwrLbs: 49000,
      hitchLbs: 15000,
      freshWater: 100,
      grayWater: 62,
      blackWater: 41,
      note: "2016 brochure spec table for 44DLQ. Hitch figure is the 15,000 lb tow rating, not a pin weight. UVW is not on that table.",
      source: "2016 Entegra Anthem brochure spec table",
    },
  },
  // Forest River Sunseeker LE 2550DSLE — 2023 OEM brochure spec table
  // (forestriverinc.com/brochures/2023/2023sunseekerbrochure.pdf) column
  // 2550DSLE: Fresh/Grey/Black 44/33/32, LP 41 lb, water heater 6 gal,
  // length 29' 4", height 11' 4", width 101", GVWR 14,500, hitch 7,500.
  // Same 44/33/32 on the 2022 Sunseeker brochure column and on RVUSA /
  // 2026 dealer reprints. Not the LE series average 44/32/32, and not
  // full-feature Sunseeker 44/39/39. UVW 11,443 is the 2023 print only —
  // omitted here so a later year is not stamped with that dry weight.
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2022,
    yearMax: 2027,
    floorplan: "2550DSLE",
    spec: {
      lengthDisplay: `29' 4"`,
      overallLengthIn: 29 * 12 + 4,
      exteriorHeightIn: 11 * 12 + 4,
      exteriorWidthIn: 101,
      interiorHeightIn: 84,
      gvwrLbs: 14500,
      hitchLbs: 7500,
      freshWater: 44,
      grayWater: 33,
      blackWater: 32,
      propaneLbs: 41,
      waterHeaterGal: 6,
      slideouts: 2,
      note: "E-450 double-slide. Tanks 44/33/32 are this floorplan, not the LE series average.",
      source: "2023 Forest River Sunseeker brochure + RVUSA 2550DSLE listings",
    },
  },
  {
    makeIncludes: "gulf stream",
    modelIncludes: "conquest le",
    yearMin: 2024,
    yearMax: 2024,
    floorplan: "6280LE",
    spec: {
      lengthDisplay: `30' 0"`,
      overallLengthIn: 360,
      exteriorHeightIn: 135,
      exteriorWidthIn: 100,
      interiorHeightIn: 83,
      gvwrLbs: 0,
      hitchLbs: 0,
      freshWater: 31,
      grayWater: 38,
      blackWater: 31,
      propaneLbs: 42,
      sleeps: 8,
      slideouts: 1,
      note: "Class C. Ford GVWR 12,500 / Chevy 12,300 — no single GVWR. Fuel 55 vs 57 not pinned. Factory dry 12,500 equals the Ford GVWR and is not UVW. Family RVing Chevy card said fresh 37 and a 6-gal heater; OEM + JD Ford are 31/38/31 and tankless.",
      source: "gulfstreamcoach.com 6280LE + 2024 JD Power Ford E-350",
    },
  },
  {
    makeIncludes: "genesis supreme",
    modelIncludes: "genesis supreme",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "28IKS",
    spec: {
      lengthDisplay: `34' 9"`,
      overallLengthIn: 417,
      exteriorHeightIn: 0,
      exteriorWidthIn: 102,
      uvwLbs: 10820,
      gvwrLbs: 14000,
      hitchLbs: 2610,
      freshWater: 160,
      grayWater: 50,
      blackWater: 50,
      propaneLbs: 60,
      note: "Fifth-wheel toy hauler. Sheet REV 1.18.23. 40-gal fuel station is an option, not standard.",
      source: "Genesis Supreme 28IKS spec sheet REV 1.18.23",
    },
  },
  {
    makeIncludes: "genesis supreme",
    modelIncludes: "genesis supreme",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "2215SSXL",
    spec: {
      lengthDisplay: `27' 0"`,
      overallLengthIn: 324,
      exteriorHeightIn: 0,
      exteriorWidthIn: 0,
      uvwLbs: 6522,
      gvwrLbs: 9900,
      hitchLbs: 512,
      freshWater: 100,
      grayWater: 40,
      blackWater: 40,
      note: "OEM sheet. 2025 RV Guide M2215SSXL disagrees (dry 6,228, hitch 868, length 27.75) and is not used.",
      source: "Genesis Supreme V2215SSXL REV 1.1.24",
    },
  },
  {
    makeIncludes: "genesis supreme",
    modelIncludes: "genesis supreme",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "2415CRXL",
    spec: {
      lengthDisplay: `30' 11"`,
      overallLengthIn: 371,
      exteriorHeightIn: 0,
      exteriorWidthIn: 0,
      uvwLbs: 7710,
      gvwrLbs: 11000,
      hitchLbs: 1010,
      freshWater: 100,
      grayWater: 40,
      blackWater: 40,
      propaneLbs: 60,
      note: "Dual 30 lb LP. A Camping World card printed 100/50/50 and a broken length — not used.",
      source: "Genesis Supreme R2415CRXL REV 1.1.24",
    },
  },
  {
    makeIncludes: "genesis supreme",
    modelIncludes: "genesis supreme",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "2715FSXL",
    spec: {
      lengthDisplay: `32' 9"`,
      overallLengthIn: 393,
      exteriorHeightIn: 0,
      exteriorWidthIn: 0,
      uvwLbs: 7460,
      gvwrLbs: 11500,
      hitchLbs: 1320,
      freshWater: 100,
      grayWater: 40,
      blackWater: 40,
      note: "OEM 2715FS sheet. 2026 2715FSXL dealer card matched length, GVWR, dry, fresh 100, gray 40.",
      source: "Genesis Supreme 2715FS sheet + 2026 2715FSXL dealer card",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "jay flight g2",
    yearMin: 2011,
    yearMax: 2011,
    floorplan: "29RLS",
    spec: {
      lengthDisplay: `33' 7"`,
      overallLengthIn: 403,
      exteriorHeightIn: 134,
      exteriorWidthIn: 0,
      interiorHeightIn: 81,
      uvwLbs: 6885,
      gvwrLbs: 9000,
      hitchLbs: 900,
      freshWater: 86,
      grayWater: 33,
      blackWater: 33,
      propaneLbs: 60,
      waterHeaterGal: 6,
      sleeps: 6,
      slideouts: 1,
      note: "Gray and black print 32.5 gal — stored as 33. Width is not on the 2011 G2 table.",
      source: "2011 Jay Flight G2 brochure table + JD Power / RV Guide 29RLS",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "jay flight g2",
    yearMin: 2011,
    yearMax: 2011,
    floorplan: "25RKS",
    spec: {
      lengthDisplay: `28' 4"`,
      overallLengthIn: 340,
      exteriorHeightIn: 134,
      exteriorWidthIn: 0,
      interiorHeightIn: 81,
      uvwLbs: 6300,
      gvwrLbs: 8180,
      hitchLbs: 945,
      freshWater: 86,
      grayWater: 65,
      blackWater: 33,
      propaneLbs: 60,
      note: "Black prints 32.5 gal — stored as 33. A dealer gray-32 line is a generic copy and is not used.",
      source: "2011 Jay Flight G2 brochure table + JD Power / RV Guide 25RKS",
    },
  },
  {
    makeIncludes: "heartland",
    modelIncludes: "big country",
    yearMin: 2011,
    yearMax: 2011,
    floorplan: "3250TS",
    spec: {
      lengthDisplay: `33' 2"`,
      overallLengthIn: 398,
      exteriorHeightIn: 155,
      exteriorWidthIn: 96,
      uvwLbs: 10590,
      gvwrLbs: 14000,
      hitchLbs: 1920,
      freshWater: 73,
      grayWater: 90,
      blackWater: 45,
      propaneLbs: 60,
      waterHeaterGal: 12,
      sleeps: 6,
      slideouts: 3,
      note: "Not the Big Country series 60/70/40 seed.",
      source: "2011 JD Power + RV Guide Big Country 3250TS",
    },
  },
  {
    makeIncludes: "newmar",
    modelIncludes: "dutch star",
    yearMin: 2011,
    yearMax: 2011,
    floorplan: "4020T",
    spec: {
      lengthDisplay: `40' 9"`,
      overallLengthIn: 489,
      exteriorHeightIn: 149,
      exteriorWidthIn: 101.5,
      interiorHeightIn: 84,
      uvwLbs: 31200,
      gvwrLbs: 44600,
      hitchLbs: 0,
      freshWater: 105,
      grayWater: 65,
      blackWater: 45,
      note: "2011 brochure code 4020T. LP is 32 gal on that table — not converted to pounds. ISL 400, tag axle.",
      source: "2011 Dutch Star diesel brochure 4020T",
    },
  },
  {
    makeIncludes: "newmar",
    modelIncludes: "dutch star",
    yearMin: 2011,
    yearMax: 2011,
    floorplan: "4020",
    spec: {
      lengthDisplay: `40' 9"`,
      overallLengthIn: 489,
      exteriorHeightIn: 149,
      exteriorWidthIn: 101.5,
      interiorHeightIn: 84,
      uvwLbs: 31200,
      gvwrLbs: 44600,
      hitchLbs: 0,
      freshWater: 105,
      grayWater: 65,
      blackWater: 45,
      note: "Dealer alias for the 2011 4020T. Do not use on the 2012 4020 (ISL 450).",
      source: "2011 Dutch Star diesel brochure 4020T",
    },
  },
  {
    makeIncludes: "northwood",
    modelIncludes: "nash",
    yearMin: 2022,
    yearMax: 2022,
    floorplan: "24M",
    spec: {
      lengthDisplay: `27' 3"`,
      overallLengthIn: 327,
      exteriorHeightIn: 138,
      exteriorWidthIn: 96,
      uvwLbs: 6023,
      gvwrLbs: 9200,
      hitchLbs: 595,
      freshWater: 50,
      grayWater: 42,
      blackWater: 35,
      propaneLbs: 60,
      waterHeaterGal: 10,
      sleeps: 6,
      note: "Gross dry is axle 5,428 + hitch 595. RV Guide lists 5,428 as dry weight; that is the dry axle, not UVW. 2020 card GVWR 7,000 is not this year.",
      source: "Northwood Nash 24M sheet (Nov 2021) + 2022 RV Guide",
    },
  },
  {
    makeIncludes: "lance",
    modelIncludes: "2285",
    yearMin: 2016,
    yearMax: 2016,
    floorplan: "2285",
    spec: {
      lengthDisplay: `27' 0"`,
      overallLengthIn: 324,
      exteriorHeightIn: 0,
      exteriorWidthIn: 96,
      interiorHeightIn: 78,
      uvwLbs: 4585,
      gvwrLbs: 6000,
      hitchLbs: 615,
      freshWater: 45,
      grayWater: 90,
      blackWater: 45,
      propaneLbs: 42,
      note: "Height with optional AC is not pinned. Undated RV Life GVWR 6,400 / dry 4,930 is not used.",
      source: "2016 JD Power + RV Guide Lance 2285",
    },
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "white hawk",
    yearMin: 2020,
    yearMax: 2020,
    floorplan: "23MRB",
    spec: {
      lengthDisplay: `28' 2"`,
      overallLengthIn: 338,
      exteriorHeightIn: 131,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      gvwrLbs: 7250,
      hitchLbs: 475,
      freshWater: 42,
      grayWater: 31,
      blackWater: 31,
      propaneLbs: 60,
      waterHeaterGal: 6,
      sleeps: 4,
      slideouts: 1,
      note: "Gray and black print 30.5 gal — stored as 31. JD/RV Guide dry 8,412 is above GVWR 7,250, so UVW is not pinned. A dealer card printed dry 5,385.",
      source: "2020 JD Power + RV Guide White Hawk 23MRB",
    },
  },
  {
    makeIncludes: "sunset park",
    modelIncludes: "sun lite",
    yearMin: 2024,
    yearMax: 2024,
    floorplan: "21TH",
    spec: {
      lengthDisplay: `21' 10"`,
      overallLengthIn: 262,
      exteriorHeightIn: 123,
      exteriorWidthIn: 96,
      interiorHeightIn: 78,
      uvwLbs: 3525,
      gvwrLbs: 0,
      hitchLbs: 485,
      freshWater: 36,
      grayWater: 28,
      blackWater: 28,
      propaneLbs: 40,
      note: "CCC 3,920 is printed. GVWR is not derived from dry+CCC. Propane is 2×20 lb; a '20 gal' dealer line is a unit error.",
      source: "sunsettrailers.com Sun Lite table + General RV 21TH",
    },
  },
  {
    makeIncludes: "coachmen",
    modelIncludes: "freedom express ultra lite",
    yearMin: 2021,
    yearMax: 2021,
    floorplan: "238BHS",
    spec: {
      lengthDisplay: `25' 10"`,
      overallLengthIn: 310,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      interiorHeightIn: 81,
      uvwLbs: 5314,
      gvwrLbs: 7600,
      hitchLbs: 694,
      freshWater: 50,
      grayWater: 35,
      blackWater: 35,
      propaneLbs: 40,
      note: "2021 RV Guide. The 2020 JD row is 49/33/33 and is not this year.",
      source: "2021 RV Guide Freedom Express Ultra Lite 238BHS",
    },
  },
  {
    makeIncludes: "thor",
    modelIncludes: "freedom traveler",
    yearMin: 2025,
    yearMax: 2025,
    floorplan: "A24",
    spec: {
      lengthDisplay: `25' 8"`,
      overallLengthIn: 308,
      exteriorHeightIn: 0,
      exteriorWidthIn: 0,
      gvwrLbs: 12500,
      hitchLbs: 8000,
      freshWater: 42,
      grayWater: 40,
      blackWater: 30,
      sleeps: 3,
      slideouts: 1,
      note: "Two unit cards agree 42/40/30 and 25' 8\". Brand page fresh 41 is not used. GVWR 12,500 and tow 8,000 are the brand page. Fuel cap is not printed. Tankless heater.",
      source: "Camping World Freedom Traveler A24 unit cards + Thor brand page",
    },
  },
  {
    makeIncludes: "heartland",
    modelIncludes: "bighorn",
    yearMin: 2019,
    yearMax: 2019,
    floorplan: "3160ELITE",
    spec: {
      lengthDisplay: `28' 11"`,
      overallLengthIn: 347,
      exteriorHeightIn: 159,
      exteriorWidthIn: 96,
      uvwLbs: 12185,
      gvwrLbs: 15500,
      hitchLbs: 2095,
      freshWater: 65,
      grayWater: 90,
      blackWater: 45,
      propaneLbs: 60,
      waterHeaterGal: 12,
      sleeps: 4,
      slideouts: 3,
      note: "Not the Bighorn series 64/80/40 seed.",
      source: "2019 JD Power + RV Guide Bighorn 3160 ELITE",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "wildwood heritage glen elite",
    yearMin: 2022,
    yearMax: 2022,
    floorplan: "36FL",
    spec: {
      lengthDisplay: `43' 9"`,
      overallLengthIn: 525,
      exteriorHeightIn: 160,
      exteriorWidthIn: 96,
      uvwLbs: 12624,
      gvwrLbs: 0,
      hitchLbs: 2120,
      freshWater: 57,
      grayWater: 104,
      blackWater: 70,
      propaneLbs: 60,
      slideouts: 4,
      note: "Payload 2,876 is printed. GVWR is not derived from UVW+payload.",
      source: "2022 RV Guide Heritage Glen Elite 36FL",
    },
  },
  {
    makeIncludes: "alliance",
    modelIncludes: "avenue travel trailer",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "298RL",
    spec: {
      lengthDisplay: `34' 0"`,
      overallLengthIn: 408,
      exteriorHeightIn: 141,
      exteriorWidthIn: 101,
      uvwLbs: 8990,
      gvwrLbs: 10950,
      hitchLbs: 925,
      freshWater: 71,
      grayWater: 106,
      blackWater: 53,
      sleeps: 4,
      slideouts: 2,
      note: "Travel trailer. Not the Avenue fifth wheel 74/74/46 seed.",
      source: "alliancerv.com Avenue 298RL (2026 and 2027)",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "rockwood signature",
    yearMin: 2022,
    yearMax: 2022,
    floorplan: "8291RK",
    spec: {
      lengthDisplay: `37' 0"`,
      overallLengthIn: 444,
      exteriorHeightIn: 158,
      exteriorWidthIn: 96,
      uvwLbs: 10519,
      gvwrLbs: 0,
      hitchLbs: 1820,
      freshWater: 54,
      grayWater: 90,
      blackWater: 50,
      note: "Fifth wheel. CCC 1,701 is printed. GVWR is not derived.",
      source: "2022 Rockwood fifth-wheel brochure + JD / RV Guide 8291RK",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "rockwood signature travel trailer",
    yearMin: 2025,
    yearMax: 2025,
    floorplan: "8339FK",
    spec: {
      lengthDisplay: `36' 10"`,
      overallLengthIn: 442,
      exteriorHeightIn: 139,
      exteriorWidthIn: 96,
      interiorHeightIn: 86,
      uvwLbs: 9474,
      gvwrLbs: 11295,
      hitchLbs: 1295,
      freshWater: 54,
      grayWater: 131,
      blackWater: 53,
      propaneLbs: 60,
      slideouts: 3,
      note: "Travel trailer. Not the Signature fifth wheel.",
      source: "2025 RV Guide + RV Wholesalers Rockwood Signature 8339FK",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "forester mbs",
    yearMin: 2018,
    yearMax: 2018,
    floorplan: "2401R",
    spec: {
      lengthDisplay: `24' 11"`,
      overallLengthIn: 299,
      exteriorHeightIn: 135,
      exteriorWidthIn: 94.5,
      interiorHeightIn: 81,
      uvwLbs: 9852,
      gvwrLbs: 11030,
      hitchLbs: 4200,
      freshWater: 35,
      grayWater: 30,
      blackWater: 30,
      sleeps: 6,
      slideouts: 1,
      note: "Sprinter diesel. Fuel prints 26.4 gal. Not the gas Forester 2401W.",
      source: "2018 JD Power + RV Guide Forester 2401R MBS",
    },
  },
  {
    makeIncludes: "keystone",
    modelIncludes: "hideout",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "210RL",
    spec: {
      lengthDisplay: `25' 5"`,
      overallLengthIn: 305,
      exteriorHeightIn: 125,
      exteriorWidthIn: 96,
      gvwrLbs: 0,
      hitchLbs: 0,
      freshWater: 45,
      grayWater: 39,
      blackWater: 39,
      propaneLbs: 40,
      sleeps: 4,
      note: "Not the Hideout 40/30/30 seed. Two 210RL unit cards agree 45/39/39. OEM '41 gal' and '82 gal' are select-model lines (210RLWE prints 82/34/34). GVWR/UVW/hitch disagree across dealers (7,500/4,700 vs 7,550/4,580) and stay blank. Height 10' 5\" is the General RV card.",
      source: "2027 General RV 210RL + 2026 Camping World 210RL + 2026 RV Guide propane",
    },
  },
  // 2026 Grand Design Transcend brochure capacity table (fresh / gray / black).
  // The series seed 56/78/39 is only some plans. Do not copy 2026 UVW onto 2025 or 2027.
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "20MKX",
    spec: {
      lengthDisplay: `24' 11"`,
      overallLengthIn: 299,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      interiorHeightIn: 78,
      uvwLbs: 5397,
      gvwrLbs: 6995,
      hitchLbs: 517,
      freshWater: 56,
      grayWater: 39,
      blackWater: 39,
      waterHeaterGal: 6,
      note: "Not the 56/78/39 seed. 2027 dry weight is a different card (5,250 / hitch 490) and is not used here.",
      source: "2026 Grand Design Transcend brochure + RV Guide / dealer 20MKX",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "20MKX",
    spec: {
      lengthDisplay: `24' 11"`,
      overallLengthIn: 299,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      gvwrLbs: 0,
      hitchLbs: 0,
      freshWater: 56,
      grayWater: 39,
      blackWater: 39,
      waterHeaterGal: 6,
      note: "Tanks match the 2026 sheet. 2027 card prints GVWR 6,995 but dry weight 5,250 vs the 2026 brochure 5,397, so weights stay blank.",
      source: "2027 Blue Compass Transcend Xplor 20MKX",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "23BHX",
    spec: {
      lengthDisplay: `26' 11"`,
      overallLengthIn: 323,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      interiorHeightIn: 78,
      uvwLbs: 5580,
      gvwrLbs: 6995,
      hitchLbs: 550,
      freshWater: 56,
      grayWater: 78,
      blackWater: 57,
      waterHeaterGal: 6,
      note: "Black is 57, not the series 39. 2026 brochure UVW 5,580. A weighed 2027 unit at 5,792 is not the brochure dry weight.",
      source: "2026 Transcend brochure + 2026 RV Guide 23BHX",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "23BHX",
    spec: {
      lengthDisplay: `26' 11"`,
      overallLengthIn: 323,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      gvwrLbs: 0,
      hitchLbs: 550,
      freshWater: 56,
      grayWater: 78,
      blackWater: 57,
      waterHeaterGal: 6,
      note: "Tanks and hitch match the 2026 brochure. GVWR 6,995 is on the card, but dry weight 5,792 vs brochure 5,580, so both weights stay blank rather than estimating UVW.",
      source: "2027 Ansley Transcend Xplor 23BHX",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "25MLX",
    spec: {
      lengthDisplay: `29' 9"`,
      overallLengthIn: 357,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 6335,
      gvwrLbs: 0,
      hitchLbs: 630,
      freshWater: 56,
      grayWater: 57,
      blackWater: 39,
      note: "Gray is 57, not the series 78. GVWR is not on the brochure row.",
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "22RBX",
    spec: {
      lengthDisplay: `26' 10"`,
      overallLengthIn: 322,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 5749,
      gvwrLbs: 0,
      hitchLbs: 573,
      freshWater: 56,
      grayWater: 68,
      blackWater: 39,
      note: "Gray is 68, not the series 78.",
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "21RLX",
    spec: {
      lengthDisplay: `25' 10"`,
      overallLengthIn: 310,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 4978,
      gvwrLbs: 0,
      hitchLbs: 700,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19BHX",
    spec: {
      lengthDisplay: `26' 3"`,
      overallLengthIn: 315,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 4894,
      gvwrLbs: 0,
      hitchLbs: 782,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "26RBX",
    spec: {
      lengthDisplay: `31' 6"`,
      overallLengthIn: 378,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 6147,
      gvwrLbs: 0,
      hitchLbs: 627,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "27DBX",
    spec: {
      lengthDisplay: `31' 9"`,
      overallLengthIn: 381,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 6820,
      gvwrLbs: 0,
      hitchLbs: 714,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "24BHX",
    spec: {
      lengthDisplay: `29' 11"`,
      overallLengthIn: 359,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 5756,
      gvwrLbs: 0,
      hitchLbs: 583,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "transcend xplor",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "26BHX",
    spec: {
      lengthDisplay: `30' 11"`,
      overallLengthIn: 371,
      exteriorHeightIn: 132,
      exteriorWidthIn: 96,
      uvwLbs: 6505,
      gvwrLbs: 0,
      hitchLbs: 635,
      freshWater: 56,
      grayWater: 78,
      blackWater: 39,
      source: "2026 Grand Design Transcend brochure",
    },
  },
  // Sunseeker LE floorplan pages. Series 44/32/32 is not these plans.
  // Dual Chevy/Ford rows leave GVWR, fuel, and length blank when the two columns disagree.
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "2250SLE",
    spec: {
      lengthDisplay: `23' 10"–24' 4"`,
      overallLengthIn: 0,
      exteriorHeightIn: 135,
      exteriorWidthIn: 101,
      gvwrLbs: 0,
      hitchLbs: 0,
      freshWater: 35,
      grayWater: 32,
      blackWater: 27,
      propaneLbs: 41,
      waterHeaterGal: 6,
      fuelCapacityGal: 0,
      slideouts: 1,
      note: "Chevy 12,300 / 57 gal / 24' 4\" vs Ford 12,500 / 55 gal / 23' 10\". Tanks and LP match on both.",
      source: "forestriverinc.com Sunseeker 2250SLE 2026 and 2027",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "2350LE",
    spec: {
      lengthDisplay: `24' 6"–25' 0"`,
      overallLengthIn: 0,
      exteriorHeightIn: 135,
      exteriorWidthIn: 101,
      gvwrLbs: 0,
      hitchLbs: 0,
      freshWater: 44,
      grayWater: 39,
      blackWater: 39,
      propaneLbs: 41,
      waterHeaterGal: 6,
      fuelCapacityGal: 0,
      note: "Not the 44/32/32 seed. Chevy 12,300 / 57 gal / 25' 0\" vs Ford 12,500 / 55 gal / 24' 6\".",
      source: "forestriverinc.com 2026 Sunseeker 2350LE",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "2950LE",
    spec: {
      lengthDisplay: `29' 11"`,
      overallLengthIn: 359,
      exteriorHeightIn: 135,
      exteriorWidthIn: 101,
      gvwrLbs: 14500,
      hitchLbs: 7500,
      freshWater: 44,
      grayWater: 39,
      blackWater: 39,
      waterHeaterGal: 6,
      fuelCapacityGal: 0,
      note: "E-450. Fuel and LP print TBD on the floorplan page, so they stay blank. Not the 44/32/32 seed. 2024 is not this sheet.",
      source: "forestriverinc.com Sunseeker 2950LE 2026 and 2027",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "3250DSLE",
    spec: {
      lengthDisplay: `32' 3"`,
      overallLengthIn: 387,
      exteriorHeightIn: 135,
      exteriorWidthIn: 101,
      gvwrLbs: 14500,
      hitchLbs: 7500,
      freshWater: 44,
      grayWater: 39,
      blackWater: 39,
      propaneLbs: 41,
      waterHeaterGal: 6,
      fuelCapacityGal: 55,
      note: "Ford E-450. Not the 44/32/32 seed.",
      source: "forestriverinc.com 2027 3250DSLE + 2026 RV Guide",
    },
  },
  // 2026 r-pod brochure table. Body width is the printed width (often under 8 ft), not a 96 in default.
  // GVWR only where the floorplan page prints it. CCC is not turned into a GVWR.
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-171",
    spec: {
      lengthDisplay: `19' 0"`,
      overallLengthIn: 228,
      exteriorHeightIn: 118,
      exteriorWidthIn: 77,
      uvwLbs: 2529,
      gvwrLbs: 4029,
      hitchLbs: 360,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "2026 brochure. Width 6' 5\" is the body, not 96 in. CCC 1,500 is printed. GVWR is the floorplan page.",
      source: "2026 r-pod brochure + RV Guide RP-171",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-190",
    spec: {
      lengthDisplay: `20' 4"`,
      overallLengthIn: 244,
      exteriorHeightIn: 118,
      exteriorWidthIn: 77,
      uvwLbs: 3049,
      gvwrLbs: 4770,
      hitchLbs: 370,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "Width 6' 5\". CCC 1,721 printed. GVWR is the OEM floorplan page.",
      source: "2026 r-pod brochure + forestriverinc.com RP-190",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-180",
    spec: {
      lengthDisplay: `20' 0"`,
      overallLengthIn: 240,
      exteriorHeightIn: 118,
      exteriorWidthIn: 77,
      uvwLbs: 2974,
      gvwrLbs: 0,
      hitchLbs: 385,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "CCC 1,811 is printed. GVWR is not on the brochure row.",
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-185",
    spec: {
      lengthDisplay: `23' 1"`,
      overallLengthIn: 277,
      exteriorHeightIn: 124,
      exteriorWidthIn: 96,
      uvwLbs: 4089,
      gvwrLbs: 0,
      hitchLbs: 430,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-192",
    spec: {
      lengthDisplay: `22' 2"`,
      overallLengthIn: 266,
      exteriorHeightIn: 124,
      exteriorWidthIn: 88,
      uvwLbs: 3649,
      gvwrLbs: 0,
      hitchLbs: 385,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "Width 7' 4\".",
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-194",
    spec: {
      lengthDisplay: `20' 6"`,
      overallLengthIn: 246,
      exteriorHeightIn: 124,
      exteriorWidthIn: 88,
      uvwLbs: 3404,
      gvwrLbs: 4760,
      hitchLbs: 360,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "Brochure width is 7' 4\". The floorplan page's 96 in is not used.",
      source: "2026 r-pod brochure + forestriverinc.com RP-194",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-198",
    spec: {
      lengthDisplay: `25' 6"`,
      overallLengthIn: 306,
      exteriorHeightIn: 127,
      exteriorWidthIn: 88,
      uvwLbs: 4594,
      gvwrLbs: 0,
      hitchLbs: 475,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "RP-197",
    spec: {
      lengthDisplay: `23' 0"`,
      overallLengthIn: 276,
      exteriorHeightIn: 129,
      exteriorWidthIn: 96,
      uvwLbs: 4054,
      gvwrLbs: 5554,
      hitchLbs: 470,
      freshWater: 40,
      grayWater: 40,
      blackWater: 30,
      note: "Not the r-pod 30/30/30 seed. 2027 floorplan page repeats the same weights and tanks.",
      source: "2026 r-pod brochure + forestriverinc.com RP-197 2026 and 2027",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-200",
    spec: {
      lengthDisplay: `25' 0"`,
      overallLengthIn: 300,
      exteriorHeightIn: 126,
      exteriorWidthIn: 88,
      uvwLbs: 4544,
      gvwrLbs: 0,
      hitchLbs: 585,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-203",
    spec: {
      lengthDisplay: `25' 0"`,
      overallLengthIn: 300,
      exteriorHeightIn: 126,
      exteriorWidthIn: 88,
      uvwLbs: 4584,
      gvwrLbs: 0,
      hitchLbs: 635,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "2026 sheet only. Do not use on the 2023 RP-203.",
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-204",
    spec: {
      lengthDisplay: `25' 6"`,
      overallLengthIn: 306,
      exteriorHeightIn: 127,
      exteriorWidthIn: 88,
      uvwLbs: 4507,
      gvwrLbs: 0,
      hitchLbs: 575,
      freshWater: 30,
      grayWater: 60,
      blackWater: 30,
      note: "Gray is 60 on this plan only. Not the 30/30/30 seed.",
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "RP-153",
    spec: {
      lengthDisplay: `17' 6"`,
      overallLengthIn: 210,
      exteriorHeightIn: 118,
      exteriorWidthIn: 88,
      uvwLbs: 3024,
      gvwrLbs: 0,
      hitchLbs: 290,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      note: "2026 sheet. The 2022 RP-153 is not this dry weight.",
      source: "2026 r-pod brochure",
    },
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "r-pod",
    yearMin: 2027,
    yearMax: 2027,
    floorplan: "RP-205",
    spec: {
      lengthDisplay: `25' 0"`,
      overallLengthIn: 300,
      exteriorHeightIn: 126,
      exteriorWidthIn: 96,
      uvwLbs: 4643,
      gvwrLbs: 6143,
      hitchLbs: 455,
      freshWater: 40,
      grayWater: 40,
      blackWater: 30,
      note: "Not the 30/30/30 seed. CCC 1,500 is printed on the OEM weight card.",
      source: "forestriverinc.com RP-205 weight card + 2027 RV Wholesalers spec",
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
  const fp = floorplan.trim().toUpperCase().replace(/[\s-]+/g, "");

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
      (row.modelIncludes === "altitude" || row.modelIncludes === "incline") &&
      (md.includes("fs550") || md.includes("fs600")) &&
      !row.modelIncludes.includes("fs")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "frontier" &&
      md.includes("gtx") &&
      !row.modelIncludes.includes("gtx")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "model z" &&
      (md.includes("air") || md.includes("expand"))
    ) {
      continue;
    }
    if (
      row.modelIncludes === "hideout" &&
      (md.includes("mini") || md.includes("max"))
    ) {
      continue;
    }
    if (
      row.modelIncludes === "rockwood signature" &&
      md.includes("travel trailer")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "avenue" &&
      md.includes("travel trailer")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "conquest" &&
      md.includes("le") &&
      !row.modelIncludes.includes("le")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "forester" &&
      md.includes("mbs") &&
      !row.modelIncludes.includes("mbs")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "wildwood" &&
      md.includes("heritage") &&
      !row.modelIncludes.includes("heritage")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "freedom express" &&
      (md.includes("ultra") || md.includes("select")) &&
      !row.modelIncludes.includes("ultra") &&
      !row.modelIncludes.includes("select")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "vision" &&
      (md.includes("xl") || md.includes("se")) &&
      !row.modelIncludes.includes("xl") &&
      !row.modelIncludes.includes("se")
    ) {
      continue;
    }
    if (
      row.modelIncludes === "precept" &&
      md.includes("prestige") &&
      !row.modelIncludes.includes("prestige")
    ) {
      continue;
    }
    // Bare "seneca" Super C rows must not fill Seneca XT or Seneca Prestige.
    // Prestige shares 37K/37L/37M but must not inherit Super C UVW / full spec.
    // Prestige GVWR comes only from the exact "seneca prestige" 2027 pin.
    if (
      row.modelIncludes === "seneca" &&
      (md.includes("xt") || md.includes("prestige")) &&
      !row.modelIncludes.includes("xt") &&
      !row.modelIncludes.includes("prestige")
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
    const rowFp = row.floorplan.toUpperCase().replace(/[\s-]+/g, "");
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

type OemGvwrPin = {
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  gvwrLbs: number;
};

/** Expand one brochure GVWR across the floorplans that table lists at that number. */
function gvwrPins(
  makeIncludes: string,
  modelIncludes: string,
  yearMin: number,
  yearMax: number,
  floorplans: readonly string[],
  gvwrLbs: number,
): OemGvwrPin[] {
  return floorplans.map((floorplan) => ({
    makeIncludes,
    modelIncludes,
    yearMin,
    yearMax,
    floorplan,
    gvwrLbs,
  }));
}

/**
 * Published OEM GVWR pins for listing / torque-to-weight scoring.
 * GVWR only — never copy these onto UVW display fields.
 * Missing GVWR stays GAP; do not invent from UVW or mid×0.82.
 * Only pin when a dated brochure / OEM table prints a single floorplan GVWR.
 */
const OEM_GVWR_PINS: OemGvwrPin[] = [
  // Entegra Vision XL — F53 24k on 36A/36C; 22k on 31UL/34B/34G
  // RVUSA 2023–2025 Vision XL brochures + 2026 Vision XL flyer table.
  {
    makeIncludes: "entegra",
    modelIncludes: "vision xl",
    yearMin: 2020,
    yearMax: 2027,
    floorplan: "36A",
    gvwrLbs: 24000,
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "vision xl",
    yearMin: 2022,
    yearMax: 2027,
    floorplan: "36C",
    gvwrLbs: 24000,
  },
  {
    makeIncludes: "entegra",
    modelIncludes: "vision xl",
    yearMin: 2024,
    yearMax: 2027,
    floorplan: "31UL",
    gvwrLbs: 22000,
  },
  ...gvwrPins("entegra", "vision xl", 2023, 2027, ["34B", "34G"], 22000),
  // Entegra Vision (not XL / SE) — 2025–2026 OEM Vision brochure table.
  ...gvwrPins("entegra", "vision", 2024, 2027, ["27A", "29F", "29S"], 18000),
  // Entegra Aspire — 2024–2025 Aspire brochure weights table (same split on 2023 card).
  ...gvwrPins("entegra", "aspire", 2023, 2025, ["40P"], 41000),
  ...gvwrPins("entegra", "aspire", 2023, 2025, ["44B", "44D", "44R", "44W", "44Z"], 49000),
  // Entegra Anthem — dated RVUSA Anthem brochures. Not Aspire (49k) / Cornerstone / Accolade.
  // MY23 ALL-row 52,000 (44B/D/R/W/Z). MY24–25: 37K 44,000; 44' 52,000. MY26: 37K 41,000 + 44V.
  ...gvwrPins("entegra", "anthem", 2023, 2026, ["44B", "44D", "44R", "44W", "44Z"], 52000),
  ...gvwrPins("entegra", "anthem", 2026, 2026, ["44V"], 52000),
  ...gvwrPins("entegra", "anthem", 2024, 2025, ["37K"], 44000),
  ...gvwrPins("entegra", "anthem", 2026, 2026, ["37K"], 41000),
  // Entegra Odyssey — 2026 Odyssey brochure weights table (all listed E-450 14,500). Not Odyssey SE / Esteem.
  ...gvwrPins(
    "entegra",
    "odyssey",
    2025,
    2026,
    ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
    14500,
  ),
  // Entegra Emblem — 2025–2026 RVUSA Emblem cards + 2027 OEM Emblem page: F53 24,000.
  ...gvwrPins("entegra", "emblem", 2025, 2027, ["36B", "36H", "36U"], 24000),
  // Jayco Precept — F53 22k on 31UL/34B/34G; 24k on 36A/36C. Not Precept Prestige.
  // 22k pin starts MY18 (first card that prints 22,000). MY14–16 OEM brochure is
  // 18,000 — catalog powertrain already holds that; do not stamp 22k backward.
  // Jayco 2026–2027 Precept flyer + 2024 Precept brochure chassis line (22k era).
  {
    makeIncludes: "jayco",
    modelIncludes: "precept",
    yearMin: 2018,
    yearMax: 2027,
    floorplan: "31UL",
    gvwrLbs: 22000,
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "precept",
    yearMin: 2019,
    yearMax: 2027,
    floorplan: "36A",
    gvwrLbs: 24000,
  },
  {
    makeIncludes: "jayco",
    modelIncludes: "precept",
    yearMin: 2022,
    yearMax: 2027,
    floorplan: "36C",
    gvwrLbs: 24000,
  },
  ...gvwrPins("jayco", "precept", 2022, 2027, ["34B", "34G"], 22000),
  // Jayco Greyhawk — 2026 Greyhawk brochure / floorplan pages: E-450 14,500 all current plans.
  ...gvwrPins("jayco", "greyhawk", 2025, 2027, ["27U", "29MV", "30Z", "31F"], 14500),
  // Jayco Alante — 2025 + 2026 Alante brochures: 27A / 29F / 29S all F53 18,000. Not Alante SE.
  ...gvwrPins("jayco", "alante", 2025, 2026, ["27A", "29F", "29S"], 18000),
  // Jayco Alante SE — 2025 Alante SE brochure + 2026 Alante SE brochure: 27ASE F53 18,000.
  ...gvwrPins("jayco", "alante se", 2025, 2026, ["27ASE"], 18000),
  // Jayco Redhawk — 2026 Redhawk brochure / floorplan pages: E-450 14,500. Not Redhawk SE. MY27 27G unprinted.
  ...gvwrPins("jayco", "redhawk", 2025, 2026, ["24B", "26M", "29XK", "31F"], 14500),
  // Jayco Melbourne — 2025 + 2026 Melbourne brochures: 24L / 24R both Sprinter 11,030. Not Melbourne Prestige.
  ...gvwrPins("jayco", "melbourne", 2025, 2026, ["24L", "24R"], 11030),
  // Jayco Granite Ridge — 2026 Granite Ridge brochure: 22T Transit 11,000; 23S Sprinter 11,030.
  ...gvwrPins("jayco", "granite ridge", 2026, 2026, ["22T"], 11000),
  ...gvwrPins("jayco", "granite ridge", 2026, 2026, ["23S"], 11030),
  // Jayco Seneca Super C — 2027 Jayco Seneca brochure (Printed 8/26 ©2026 Jayco 2033094).
  // 33J / 37K / 37L / 37M all print GVWR 31,000. UVW not printed — do not invent.
  // "seneca super c" is the 2027 catalog key; "seneca" covers the Super C alias.
  // modelPinBlocked keeps both off Seneca XT and Seneca Prestige. Prestige
  // 37K/37L/37M use the exact "seneca prestige" 2027 pin below; 33J stays GAP.
  ...gvwrPins("jayco", "seneca super c", 2027, 2027, ["33J", "37K", "37L", "37M"], 31000),
  ...gvwrPins("jayco", "seneca", 2027, 2027, ["33J", "37K", "37L", "37M"], 31000),
  // Jayco Seneca Prestige — 2027 Jayco Seneca Prestige brochure
  // (Printed 8/26 ©2026 Jayco 2033095). Table prints 33J + K/L/M at GVWR 31,000.
  // Catalog Prestige is 37K/37L/37M only — do not pin 33J. UVW not printed —
  // do not invent or inherit bare-Seneca UVW.
  ...gvwrPins("jayco", "seneca prestige", 2027, 2027, ["37K", "37L", "37M"], 31000),
  // Jayco Solstice — 2027 Jayco Solstice brochure (Printed 7/26 ©2025 Jayco 2033084).
  // Table 21L / 21T GVWR 11,000. Photo caption says 20L — 20L is not an allowed
  // pin. 21B dropped MY27. UVW not printed.
  ...gvwrPins("jayco", "solstice", 2027, 2027, ["21L", "21T"], 11000),
  // Jayco Swift — 2027 Jayco Swift brochure (Printed 8/26 ©2025 Jayco 2033083).
  // Table includes 20E / 20T / 20L at GVWR 9,350. Catalog MY27 is 20E / 20T
  // only — do not add 20L. UVW not printed.
  ...gvwrPins("jayco", "swift", 2027, 2027, ["20E", "20T"], 9350),
  // Jayco Terrain — 2027 Jayco Terrain brochure (Printed 7/26 ©2025 Jayco 2033085).
  // Grouped rows 19A/19AG and 19Y/19YG, all GVWR 9,050. Catalog matches — no
  // source mismatch. UVW not printed.
  ...gvwrPins("jayco", "terrain", 2027, 2027, ["19A", "19AG", "19Y", "19YG"], 9050),
  // American Coach American Tradition — 2021 Tradition brochure + later reprint table.
  // 42Q/42V = 47,000; 37S = 41,000. Catalog weightRange mid for 42' is ~39.5–44k — wrong.
  ...gvwrPins("american coach", "american tradition", 2021, 2026, ["42Q", "42V"], 47000),
  ...gvwrPins("american coach", "american tradition", 2021, 2023, ["37S"], 41000),
  // American Dream — 2019 RVUSA Dream table + later brochure + 2025 Fleetwood dealer spec table.
  // 42Q / 42V print 47,000. 45A 51,000 was American Eagle bleed — GAP 2019–2022
  // rather than invent 47,000. Dated 2025 dealer table still pins 45A/45D/45P 54,000.
  ...gvwrPins("american coach", "american dream", 2019, 2025, ["42Q"], 47000),
  ...gvwrPins("american coach", "american dream", 2020, 2022, ["42V"], 47000),
  ...gvwrPins("american coach", "american dream", 2025, 2025, ["45A", "45D", "45P"], 54000),
  // American Eagle — 2015 American Eagle brochure weights & measures (51k all four 45' plans).
  ...gvwrPins("american coach", "american eagle", 2015, 2015, ["45A", "45B", "45N", "45T"], 51000),
  // Thor ACE — 2026 ACE brochure spec table (same 29D/29G/30C/32B codes MY23–27).
  ...gvwrPins("thor", "ace", 2023, 2027, ["29D", "29G", "30C"], 18000),
  ...gvwrPins("thor", "ace", 2023, 2027, ["32B"], 22000),
  // Thor Hurricane — 2026 Hurricane brochure table. 36H prints on that card.
  // 35A MY27: 2027 Thor Motor Coach Hurricane brochure (RVUSA) 29L/35A/35J/36H GVWR 18k/22k/22k/24k.
  ...gvwrPins("thor", "hurricane", 2025, 2027, ["29L"], 18000),
  ...gvwrPins("thor", "hurricane", 2025, 2026, ["35G", "35R"], 22000),
  ...gvwrPins("thor", "hurricane", 2025, 2027, ["35J"], 22000),
  ...gvwrPins("thor", "hurricane", 2026, 2027, ["36H"], 24000),
  ...gvwrPins("thor", "hurricane", 2027, 2027, ["35A"], 22000),
  // Thor Windsport — 2026 Windsport brochure table (no 36H on that card).
  // 35A / 36H MY27: 2027 Thor Motor Coach Windsport brochure (RVUSA) 29L/35A/35J/36H GVWR 18k/22k/22k/24k.
  ...gvwrPins("thor", "windsport", 2025, 2027, ["29L"], 18000),
  ...gvwrPins("thor", "windsport", 2025, 2026, ["35G", "35R"], 22000),
  ...gvwrPins("thor", "windsport", 2025, 2027, ["35J"], 22000),
  ...gvwrPins("thor", "windsport", 2027, 2027, ["35A"], 22000),
  ...gvwrPins("thor", "windsport", 2027, 2027, ["36H"], 24000),
  // Thor Aria — 2027 Thor Motor Coach Aria brochure (RVUSA) 3702/3901/4000 GVWR 35,320.
  ...gvwrPins("thor", "aria", 2027, 2027, ["3702", "3901", "4000"], 35320),
  // Thor Four Winds — 2026 Four Winds brochure Ford E-450 block only (skip Ford/Chevy dual-GVWR E-specs).
  ...gvwrPins("thor", "four winds", 2026, 2027, ["28Z", "29K", "31E", "31H"], 14500),
  // Thor Four Winds Sprinter — OEM thormotorcoach.com/four-winds-sprinter MY27 24LT/24LV 12,125. Not gas Four Winds.
  ...gvwrPins("thor", "four winds sprinter", 2027, 2027, ["24LT", "24LV"], 12125),
  // Thor Palazzo GT — 2026 Palazzo GT brochure spec table. Not bare Palazzo.
  ...gvwrPins("thor", "palazzo gt", 2024, 2026, ["33.5", "33.6"], 26000),
  ...gvwrPins("thor", "palazzo gt", 2024, 2026, ["37.4", "37.5"], 32350),
  // Thor Palazzo (not GT) — 2027 Thor Motor Coach Palazzo brochure (RVUSA) 33.5/33.6 26,000; 37.4/37.5 32,350.
  ...gvwrPins("thor", "palazzo", 2027, 2027, ["33.5", "33.6"], 26000),
  ...gvwrPins("thor", "palazzo", 2027, 2027, ["37.4", "37.5"], 32350),
  // Thor Vegas — 2026 Vegas brochure spec table (OH 09/10/2025). 24.1 is E-350 12,500; others E-450 14,500.
  ...gvwrPins("thor", "vegas", 2026, 2027, ["24.1"], 12500),
  ...gvwrPins("thor", "vegas", 2026, 2027, ["26.1", "26.2", "28.1"], 14500),
  // Thor Axis — 2026 Axis brochure spec table (twin of Vegas; own card).
  ...gvwrPins("thor", "axis", 2026, 2027, ["24.1"], 12500),
  ...gvwrPins("thor", "axis", 2026, 2027, ["26.1", "26.2", "28.1"], 14500),
  // Thor Quantum — 2026 Quantum brochure Ford-only rows. Dual Ford/Chevy LC21/LZ22/LZ25/LZ28 stay GAP.
  ...gvwrPins("thor", "quantum", 2026, 2027, ["LC19"], 11500),
  ...gvwrPins("thor", "quantum", 2026, 2027, ["LC28", "KW29", "LF31", "HS31"], 14500),
  // Thor Chateau Sprinter — 2026 Chateau Sprinter brochure: 24LT / 24LV US 12,125. Not gas Chateau.
  ...gvwrPins("thor", "chateau sprinter", 2026, 2027, ["24LT", "24LV"], 12125),
  // Thor Chateau (gas) MY27 — 2027 Chateau brochure single-print Ford E-450 only (28Z/29K/31E/31H 14,500). Dual Ford/Chevy rows stay GAP.
  ...gvwrPins("thor", "chateau", 2027, 2027, ["28Z", "29K", "31E", "31H"], 14500),
  // Thor Compass AWD / Compass GO — 2027 Compass AWD brochure 23TW/24JG/24KB 11,000; OEM page 22MT is Compass GO.
  ...gvwrPins("thor", "compass awd", 2027, 2027, ["23TW", "24JG", "24KB"], 11000),
  ...gvwrPins("thor", "compass go", 2027, 2027, ["22MT"], 11000),
  // Thor Echelon — OEM thormotorcoach.com/echelon MY27 Ford-only table. Not Echelon Sprinter.
  ...gvwrPins("thor", "echelon", 2027, 2027, ["LC19", "LX19"], 11500),
  ...gvwrPins("thor", "echelon", 2027, 2027, ["LC21", "LZ22", "LZ25", "LZ28"], 12500),
  ...gvwrPins("thor", "echelon", 2027, 2027, ["LC28", "KW29", "LF31", "HS31"], 14500),
  // Thor Gemini / Gemini TRIP — 2027 Gemini AWD brochure 23TW/24JG/24KB 11,000; OEM page 22MT is Gemini TRIP.
  ...gvwrPins("thor", "gemini", 2027, 2027, ["23TW", "24JG", "24KB"], 11000),
  ...gvwrPins("thor", "gemini trip", 2027, 2027, ["22MT"], 11000),
  // Thor Inception / Inception HD — 2027 Inception brochure + OEM Inception HD page: 34XG/38DX/38FX/38XL 32,700.
  ...gvwrPins("thor", "inception", 2027, 2027, ["34XG", "38DX", "38FX", "38XL"], 32700),
  ...gvwrPins("thor", "inception hd", 2027, 2027, ["34XG", "38DX", "38FX", "38XL"], 32700),
  // Thor Indigo / Luminate — 2027 Indigo + Luminate brochures MM30/AA35 22,000; HH36 24,000.
  ...gvwrPins("thor", "indigo", 2027, 2027, ["MM30", "AA35"], 22000),
  ...gvwrPins("thor", "indigo", 2027, 2027, ["HH36"], 24000),
  ...gvwrPins("thor", "luminate", 2027, 2027, ["MM30", "AA35"], 22000),
  ...gvwrPins("thor", "luminate", 2027, 2027, ["HH36"], 24000),
  // Thor Magnitude / Omni — 2027 Magnitude + Omni brochures Z30/X32 19,500; L35/R36 22,000. Not Magnitude Grand / Omni Trail.
  ...gvwrPins("thor", "magnitude", 2027, 2027, ["Z30", "X32"], 19500),
  ...gvwrPins("thor", "magnitude", 2027, 2027, ["L35", "R36"], 22000),
  ...gvwrPins("thor", "omni", 2027, 2027, ["Z30", "X32"], 19500),
  ...gvwrPins("thor", "omni", 2027, 2027, ["L35", "R36"], 22000),
  // Thor Outlaw Class A / Class C — OEM outlaw-class-a 38K/38M 26,000; outlaw-class-c 29J/29T 14,500.
  ...gvwrPins("thor", "outlaw class a", 2027, 2027, ["38K", "38M"], 26000),
  ...gvwrPins("thor", "outlaw class c", 2027, 2027, ["29J", "29T"], 14500),
  // Thor Palladium / Talavera — 2027 Palladium brochure + OEM Talavera 1920/1930 9,500.
  ...gvwrPins("thor", "palladium", 2027, 2027, ["1920", "1930"], 9500),
  ...gvwrPins("thor", "talavera", 2027, 2027, ["1920", "1930"], 9500),
  // Thor Pasadena / Pasadena SV — 2027 Pasadena brochure + OEM Pasadena SV: 34XG/38DX/38FX/38XL 32,700.
  ...gvwrPins("thor", "pasadena", 2027, 2027, ["34XG", "38DX", "38FX", "38XL"], 32700),
  ...gvwrPins("thor", "pasadena sv", 2027, 2027, ["34XG", "38DX", "38FX", "38XL"], 32700),
  // Thor Resonate — 2027 Resonate brochure 29D/29G/30C 18,000; 32B 22,000. Twin of ACE.
  ...gvwrPins("thor", "resonate", 2027, 2027, ["29D", "29G", "30C"], 18000),
  ...gvwrPins("thor", "resonate", 2027, 2027, ["32B"], 22000),
  // Thor Riviera — OEM thormotorcoach.com/riviera MY27 34SD 29,800; 38RB/39BH 32,350.
  ...gvwrPins("thor", "riviera", 2027, 2027, ["34SD"], 29800),
  ...gvwrPins("thor", "riviera", 2027, 2027, ["38RB", "39BH"], 32350),
  // Thor Rize / Scope — OEM rize + scope MY27 18M/18Z 8,550. Not Rize Plus / Rize Sport / Scope Sport.
  ...gvwrPins("thor", "rize", 2027, 2027, ["18M", "18Z"], 8550),
  ...gvwrPins("thor", "scope", 2027, 2027, ["18M", "18Z"], 8550),
  // Thor Sanctuary / Tranquility — 2027 Sanctuary + Tranquility brochures 19A/19M/19P 9,050; 24A 11,030.
  ...gvwrPins("thor", "sanctuary", 2027, 2027, ["19A", "19M", "19P"], 9050),
  ...gvwrPins("thor", "sanctuary", 2027, 2027, ["24A"], 11030),
  ...gvwrPins("thor", "tranquility", 2027, 2027, ["19A", "19M", "19P"], 9050),
  ...gvwrPins("thor", "tranquility", 2027, 2027, ["24A"], 11030),
  // Thor Sequence / Tellaro — 2027 Sequence + Tellaro brochures 20L/20U/20Y 9,350. Not Sequence Sport / Tellaro Sport.
  ...gvwrPins("thor", "sequence", 2027, 2027, ["20L", "20U", "20Y"], 9350),
  ...gvwrPins("thor", "tellaro", 2027, 2027, ["20L", "20U", "20Y"], 9350),
  // Winnebago Vista — OEM 2025 Vista spec table.
  ...gvwrPins("winnebago", "vista", 2025, 2025, ["29V"], 18000),
  ...gvwrPins("winnebago", "vista", 2025, 2025, ["31B", "33K", "34R"], 22000),
  // Winnebago Sunstar — 2025 Vista//Sunstar twin brochure + Sunstar spec PDF.
  // 29V / 33K / 34R agree at 18k / 22k / 22k. 31B prints 20,500 vs 22,000 — leave GAP.
  ...gvwrPins("winnebago", "sunstar", 2025, 2025, ["29V"], 18000),
  ...gvwrPins("winnebago", "sunstar", 2025, 2025, ["33K", "34R"], 22000),
  // Winnebago Adventurer — 2024–2025 Adventurer brochure weights & measures.
  ...gvwrPins("winnebago", "adventurer", 2024, 2025, ["34W", "35F"], 22000),
  ...gvwrPins("winnebago", "adventurer", 2024, 2025, ["36Z"], 24000),
  // Winnebago Forza — 2025 Forza brochure weights & measures.
  ...gvwrPins("winnebago", "forza", 2025, 2025, ["34T"], 26000),
  ...gvwrPins("winnebago", "forza", 2025, 2025, ["36H"], 27910),
  ...gvwrPins("winnebago", "forza", 2025, 2025, ["38W"], 29410),
  // Winnebago Minnie Winnie — Feb 2025 Minnie Winnie brochure. 22M/22R print 14,500 A / 12,500 B — leave GAP.
  ...gvwrPins("winnebago", "minnie winnie", 2025, 2025, ["25B", "26T", "31H", "31K"], 14500),
  // Winnebago View — 2025 View//Navion brochure: 24D / 24J / 24V = 11,030. MY26 24R/24T print 11,030 vs 12,125 — leave GAP.
  ...gvwrPins("winnebago", "view", 2025, 2025, ["24D", "24J", "24V"], 11030),
  // Winnebago View / Navion MY27 — View-Navion-27-Brochure.pdf weights & measures
  // 24R / 24T / 24D GVWR 12,125. Prior 2025 View 24D is 11,030 — do NOT extend yearMax.
  ...gvwrPins("winnebago", "view", 2027, 2027, ["24D", "24R", "24T"], 12125),
  ...gvwrPins("winnebago", "navion", 2027, 2027, ["24D", "24R", "24T"], 12125),
  // Winnebago EKKO MY27 — Operator 2027 27Ekko622A.pdf Specifications and Capacities 22A GVWR 11,000.
  ...gvwrPins("winnebago", "ekko", 2027, 2027, ["22A"], 11000),
  // Winnebago Elora MY27 — Operator 2027 27Elora.pdf Specifications and Capacities 19DC GVWR 9,350.
  ...gvwrPins("winnebago", "elora", 2027, 2027, ["19DC"], 9350),
  // Winnebago Resa MY27 — Operator 2027 27Resa.pdf Specifications and Capacities 19DC GVWR 9,350.
  ...gvwrPins("winnebago", "resa", 2027, 2027, ["19DC"], 9350),
  // Winnebago ARKA MY27 — Operator 2027 27Arka-2702260514.pdf Specifications and Capacities 20Z
  // GVWR 19,500 (RAM 5500 diesel). No 2026 fill.
  ...gvwrPins("winnebago", "arka", 2027, 2027, ["20Z"], 19500),
  // Forest River FR3 — 2026 FR3 OEM floorplan pages (31DS is the 18k F53; others 22k).
  ...gvwrPins("forest river", "fr3", 2025, 2026, ["31DS"], 18000),
  ...gvwrPins("forest river", "fr3", 2025, 2026, ["30DS", "34DS", "35DS"], 22000),
  // Forest River Georgetown 5 Series — 2026 GT5 OEM floorplan cards + Aug 2024 Georgetown combo table.
  // Catalog 36B5 / 36D5 / 36F5 key mismatch — leave GAP. Not bare Georgetown / Georgetown XL.
  ...gvwrPins("forest river", "georgetown 5 series", 2025, 2026, ["31L5"], 22000),
  ...gvwrPins("forest river", "georgetown 5 series", 2026, 2026, ["34H5"], 22000),
  // Forest River Sunseeker — 2026 Sunseeker brochure Full Feature Ford block. Not LE / Classic / 4X4 / MBS.
  ...gvwrPins(
    "forest river",
    "sunseeker",
    2025,
    2026,
    ["2440DS", "2500TS", "2860DS", "3010DS", "3050S"],
    14500,
  ),
  // Forest River Cardinal — RVUSA 2027 Forest River Cardinal brochure.
  // Printed FPs only (yearMin=2027 yearMax=2027). 41DUB prints TBD — leave GAP.
  // Not Sunseeker / FR3 / Cedar Creek / other FR lines.
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["32CHILL"], 12188),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["33CHEF"], 13885),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["35CRIB"], 14305),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["36FL"], 14115),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["36FUN"], 14095),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["37GALLEY"], 14080),
  ...gvwrPins("forest river", "cardinal", 2027, 2027, ["38DEN"], 14235),
  // Coachmen Leprechaun — 2025 Leprechaun brochure Ford-only rows (skip Ford/Chevy dual GVWR).
  ...gvwrPins("coachmen", "leprechaun", 2025, 2025, ["260DS", "298KB", "319MB"], 14500),
  // Coachmen Freelander — 2025 Freelander flyer Ford-only 26DS = 14,500 (skip dual Ford/Chevy 22XG / 27QB).
  ...gvwrPins("coachmen", "freelander", 2025, 2026, ["26DS"], 14500),
  // Coachmen Pursuit — OEM site Pursuit 29SS = 18,000 (31BH / 33BH unprinted on that table).
  ...gvwrPins("coachmen", "pursuit", 2024, 2026, ["29SS"], 18000),
  // Coachmen Mirada — 2024 Mirada brochure: 29FW = 18,000.
  ...gvwrPins("coachmen", "mirada", 2024, 2026, ["29FW"], 18000),
  // Mirada 35OS 22,000 is PIN_ONLY / undated — no dated OEM table in-repo.
  // Leave the pin; do not invent a brochure year or rewrite the floorplan code.
  ...gvwrPins("coachmen", "mirada", 2012, 2022, ["35OS"], 22000),
  // Newmar Bay Star — 2026 Bay Star brochure chassis table (all listed plans 26,000).
  // 2027 RVUSA brochure reprints those codes at 26,000; 3639/3640 are MY27-only.
  ...gvwrPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3114", "3225", "3609", "3626", "3629", "3811"],
    26000,
  ),
  ...gvwrPins("newmar", "bay star", 2026, 2026, ["3826"], 26000),
  ...gvwrPins("newmar", "bay star", 2027, 2027, ["3639", "3640"], 26000),
  // Newmar Canyon Star — 2026 Canyon Star brochure: 3947 = 32,000. 2027 card reprints 32,000.
  ...gvwrPins("newmar", "canyon star", 2025, 2027, ["3947"], 32000),
  // Newmar Bay Star Sport — 2026 Bay Star Sport DigiBrochure chassis table. Not Bay Star.
  // 2027 brochure reprints 2813 20,500; 3014/3225 22,000.
  ...gvwrPins("newmar", "bay star sport", 2026, 2027, ["2813"], 20500),
  ...gvwrPins("newmar", "bay star sport", 2026, 2027, ["3014", "3225"], 22000),
  // Newmar Dutch Star — 2025–2026 brochure. Pin only plans whose Spartan + Freightliner GVWR match.
  // 2027 reprints 3836 41,000 and 4081 49,000. 4071 is not on the 2027 card.
  // 43' tag plans differ 51k vs 52k by chassis (Freightliner/Spartan) — leave GAP.
  ...gvwrPins("newmar", "dutch star", 2025, 2027, ["3836"], 41000),
  ...gvwrPins("newmar", "dutch star", 2025, 2026, ["4071"], 49000),
  ...gvwrPins("newmar", "dutch star", 2025, 2027, ["4081"], 49000),
  // Newmar MY2027 OEM / RVUSA brochure singles (Catalog Audit F). Dual-chassis
  // Dutch Star tag plans + Ventana stay GAP — do not invent a single GVWR.
  ...gvwrPins("newmar", "essex", 2027, 2027, ["4545", "4551", "4569", "4595"], 54000),
  ...gvwrPins("newmar", "grand star", 2027, 2027, ["3444", "3940", "3948"], 35200),
  ...gvwrPins("newmar", "king aire", 2027, 2027, ["4531", "4596"], 54000),
  ...gvwrPins(
    "newmar",
    "london aire",
    2027,
    2027,
    ["4540", "4545", "4551", "4569", "4595"],
    54000,
  ),
  ...gvwrPins("newmar", "mountain aire", 2027, 2027, ["3823", "3825", "4118", "4551"], 54000),
  ...gvwrPins("newmar", "new aire", 2027, 2027, ["3543", "3545", "3547"], 38600),
  ...gvwrPins("newmar", "northern star", 2027, 2027, ["3418"], 36500),
  ...gvwrPins("newmar", "northern star", 2027, 2027, ["3709"], 38000),
  ...gvwrPins("newmar", "northern star", 2027, 2027, ["4011", "4037"], 39000),
  ...gvwrPins("newmar", "super star", 2027, 2027, ["3731"], 40000),
  ...gvwrPins("newmar", "super star", 2027, 2027, ["4040", "4059"], 41200),
  ...gvwrPins("newmar", "super star", 2027, 2027, ["4140", "4159"], 43000),
  ...gvwrPins("newmar", "supreme aire", 2027, 2027, ["3827", "4129", "4141"], 41000),
  // Tiffin Open Road — MY25 Open Road Product Update brochure weights & measures.
  ...gvwrPins("tiffin", "open road", 2025, 2025, ["32FA", "32SA"], 24000),
  ...gvwrPins("tiffin", "open road", 2025, 2025, ["34PA", "36LA", "36UA"], 26000),
  // Tiffin Open Road MY27 — MY27-OPEN-ROAD-Specifications-8.19.pdf WEIGHTS AND MEASURES
  // 29 NA GVWR 22,000; 34 PA GVWR 26,000. 2025 34PA pin stays 2025-only (no 2026 evidence).
  ...gvwrPins("tiffin", "open road", 2027, 2027, ["29NA"], 22000),
  ...gvwrPins("tiffin", "open road", 2027, 2027, ["34PA"], 26000),
  // Tiffin Allegro RED — MY25 RED brochure / 2025 OEM spec page (not Red 340 / 360).
  // MATCH: yearMax already 2027 — do not change.
  ...gvwrPins("tiffin", "allegro red", 2025, 2027, ["33AA", "37BA", "38KA"], 38320),
  // Tiffin Phaeton — 2025 OEM Phaeton spec page vs MY26 Phaeton Product Update brochure (2.10.26).
  // 2025 and 2026 print different GVWR — do not merge those year bands.
  // MY27-Phaeton-Specifications.pdf reprints MY26: 35 CH/37 BH/40 IH GVWR 40,000; 44 OH 46,000.
  ...gvwrPins("tiffin", "phaeton", 2025, 2025, ["35CH", "37BH", "40IH"], 39660),
  ...gvwrPins("tiffin", "phaeton", 2025, 2025, ["44OH"], 45660),
  ...gvwrPins("tiffin", "phaeton", 2026, 2027, ["35CH", "37BH", "40IH"], 40000),
  ...gvwrPins("tiffin", "phaeton", 2026, 2027, ["44OH"], 46000),
  // Tiffin Allegro Bay — MY27-Allegro-Bay-Specifications-8.13.pdf WEIGHTS AND MEASURES
  // 38 AB/38 BB/38 EB/34 DB GVWR 33,000 each.
  ...gvwrPins("tiffin", "allegro bay", 2027, 2027, ["34DB", "38AB", "38BB", "38EB"], 33000),
  // Tiffin Wayfarer — MY27-Wayfarer-Specifications-8.21.pdf WEIGHTS AND MEASURES
  // 25 RW/25 XLW/25 PW GVWR 12,125 each.
  ...gvwrPins("tiffin", "wayfarer", 2027, 2027, ["25RW", "25XLW", "25PW"], 12125),
  // Tiffin Zephyr — MY27-Zephyr-Specifications-3.30.pdf WEIGHTS AND MEASURES
  // 45 FZ/45 PZ GVWR 54,000 each.
  ...gvwrPins("tiffin", "zephyr", 2027, 2027, ["45FZ", "45PZ"], 54000),
  // Tiffin Bus Allegro Bus — MY27-BUS-Specifications-5.15.26.pdf WEIGHTS AND MEASURES
  // 36 AP/40 IP GVWR 42,000; 45 BP/45 OPP GVWR 52,000 (450HP and 605HP columns same).
  // Do not copy older ~50,800 brochure-class into OEM_GVWR_PINS.
  ...gvwrPins("tiffin bus", "allegro bus", 2027, 2027, ["36AP", "40IP"], 42000),
  ...gvwrPins("tiffin bus", "allegro bus", 2027, 2027, ["45BP", "45OPP"], 52000),
  // Grand Design Lineage Class C / Super C — OEM Class C brochure + year-band cards.
  ...gvwrPins("grand design", "lineage series e", 2027, 2027, ["30DC"], 14500),
  ...gvwrPins("grand design", "lineage series m", 2025, 2027, ["25FW"], 12125),
  ...gvwrPins("grand design", "lineage series m", 2025, 2026, ["25TK"], 12125),
  ...gvwrPins("grand design", "lineage series m", 2027, 2027, ["25MD"], 12125),
  ...gvwrPins("grand design", "lineage series f", 2025, 2027, ["31ZW"], 22000),
  ...gvwrPins("grand design", "lineage series f", 2025, 2027, ["31ZW5"], 19500),
  // Fleetwood Altitude — 2027 Altitude sales sheet (Altitude27F1, 3/25): E-450 14,500 all four. Not FS550 / FS600D.
  ...gvwrPins("fleetwood", "altitude", 2027, 2027, ["27U", "29F", "29H", "31W"], 14500),
  // Holiday Rambler Incline — 2027 Incline sales sheet (ALTITUDE27F1 / Incline, 3/26): E-450 14,500. Not FS550.
  ...gvwrPins("holiday rambler", "incline", 2027, 2027, ["27U", "29H", "31W"], 14500),
  // Holiday Rambler Incline FS550 — 2027 Incline FS550 sales sheet (INCLINE FS550 27F1, 3/26): F-550 22,000.
  ...gvwrPins("holiday rambler", "incline fs550", 2027, 2027, ["30SB", "30WM", "32AW"], 22000),
  // Airstream Trade Wind — 2027 RVUSA Trade Wind brochure compare + spec table
  // (library.rvusa.com/brochure/2027-Airstream-Trade-Wind). 23FB 6,500; 25FB
  // 7,600; 27FB 8,300. 27FB is on the Trade Wind floorplans list. Do not map
  // catalog 28RB / Twin / Dublin Slate — no exact brochure code.
  ...gvwrPins("airstream", "trade wind", 2027, 2027, ["23FB"], 6500),
  ...gvwrPins("airstream", "trade wind", 2027, 2027, ["25FB"], 7600),
  ...gvwrPins("airstream", "trade wind", 2027, 2027, ["27FB"], 8300),
  // Airstream World Traveler — 2027 RVUSA World Traveler brochure compare +
  // spec table. 17RB 3,500; 22RB 4,500. Table prints 22RB (ignore marketing 22FB).
  ...gvwrPins("airstream", "world traveler", 2027, 2027, ["17RB"], 3500),
  ...gvwrPins("airstream", "world traveler", 2027, 2027, ["22RB"], 4500),
  // Airstream Classic — 2027 RVUSA Classic brochure compare + spec table.
  // 28RB 8,800; 30RB 10,000; 33FB 10,000. Twin suffix is a separate catalog
  // code; findOemGvwrLbs is exact-match and does not strip Twin — leave GAP.
  ...gvwrPins("airstream", "classic", 2027, 2027, ["28RB"], 8800),
  ...gvwrPins("airstream", "classic", 2027, 2027, ["30RB", "33FB"], 10000),
  // Airstream Bambi — 2027 RVUSA Bambi brochure compare + spec table
  // (library.rvusa.com/brochure/2027-Airstream-Bambi). 16RB 3,500; 20FB 5,000;
  // 22FB 5,000. Dublin Slate is décor, not a printed GVWR code — leave GAP.
  ...gvwrPins("airstream", "bambi", 2027, 2027, ["16RB"], 3500),
  ...gvwrPins("airstream", "bambi", 2027, 2027, ["20FB", "22FB"], 5000),
  // Airstream Basecamp — 2027 RVUSA Basecamp brochure compare + spec table.
  // Only 20X is printed (4,300). Brochure notes 16X discontinued MY2027; do
  // not invent 16 / 16X / 20. Not Basecamp Xe.
  ...gvwrPins("airstream", "basecamp", 2027, 2027, ["20X"], 4300),
  // Airstream Flying Cloud — 2027 RVUSA Flying Cloud brochure compare + spec
  // table. 23FB 6,000; 25FB 7,300; 27FB 7,600; 28RB 7,600; 30FB Bunk 8,800
  // (catalog code exact). Twin / Dublin Slate stay GAP. Not 30FB / 30FB Office.
  ...gvwrPins("airstream", "flying cloud", 2027, 2027, ["23FB"], 6000),
  ...gvwrPins("airstream", "flying cloud", 2027, 2027, ["25FB"], 7300),
  ...gvwrPins("airstream", "flying cloud", 2027, 2027, ["27FB", "28RB"], 7600),
  ...gvwrPins("airstream", "flying cloud", 2027, 2027, ["30FB Bunk"], 8800),
  // Airstream International — 2027 RVUSA International brochure compare + spec
  // table. 23FB 6,000; 25FB 7,300; 27FB 7,600; 28RB 7,600; 30RB 8,800.
  // Coastal Cove décor codes are not printed separately — leave GAP.
  ...gvwrPins("airstream", "international", 2027, 2027, ["23FB"], 6000),
  ...gvwrPins("airstream", "international", 2027, 2027, ["25FB"], 7300),
  ...gvwrPins("airstream", "international", 2027, 2027, ["27FB", "28RB"], 7600),
  ...gvwrPins("airstream", "international", 2027, 2027, ["30RB"], 8800),
  // Airstream Globetrotter — 2027 RVUSA Globetrotter brochure compare + spec
  // table. 25FB 7,300; 27FB 7,600; 30RB 8,800. Dublin Slate / Copenhagen
  // Cream / London Grey / Barcelona Blue are décor — leave GAP.
  ...gvwrPins("airstream", "globetrotter", 2027, 2027, ["25FB"], 7300),
  ...gvwrPins("airstream", "globetrotter", 2027, 2027, ["27FB"], 7600),
  ...gvwrPins("airstream", "globetrotter", 2027, 2027, ["30RB"], 8800),
  // Airstream Caravel — 2027 Airstream Caravel travel-trailer brochure
  // (compare + spec table; © Airstream 2027). Printed GVWR only:
  // 16RB 4,300; 20FB 5,000; 22FB 5,000. Exact codes — not Bambi (16RB
  // is 3,500 on that card) and not Dublin Slate décor variants.
  // Brochure "Unit Base Weight with LP and Batteries" is not pinned as
  // UVW: Airstream Audit E waves 1–2 left OEM_UVW_PINS unused.
  ...gvwrPins("airstream", "caravel", 2027, 2027, ["16RB"], 4300),
  ...gvwrPins("airstream", "caravel", 2027, 2027, ["20FB", "22FB"], 5000),
  // Renegade RV MY2027 OEM / RVUSA brochure singles (Catalog Audit F).
  // Printed single GVWR only. Dual-chassis Explorer / Verona LE / XL,
  // Classic "See sales", Vienna/Villagio unprinted, Ikon/Villager no 2027 — leave GAP.
  // Not Verona LE (modelPinBlocked). Explorer TS is exact "explorer ts".
  ...gvwrPins("renegade", "verona", 2027, 2027, ["36VSB", "40VTS", "40VTB", "40VTR"], 37600),
  ...gvwrPins("renegade", "valencia", 2027, 2027, ["36SB"], 33000),
  ...gvwrPins("renegade", "valencia", 2027, 2027, ["39BB", "39FW", "39RB"], 35000),
  ...gvwrPins("renegade", "veracruz", 2027, 2027, ["30VRM", "33VDS", "33VRS"], 22000),
  ...gvwrPins("renegade", "explorer ts", 2027, 2027, ["42RB"], 58000),
  // In-stock 2026 towables. See FR_SRC comment on the UVW pins.
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "235RW",
    gvwrLbs: 11570,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "242RD",
    gvwrLbs: 9995,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "301ML",
    gvwrLbs: 13995,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "315MB",
    gvwrLbs: 13213,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "318RL",
    gvwrLbs: 14120,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "360MYR",
    gvwrLbs: 15885,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "36BR3",
    gvwrLbs: 14155,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "372DUO",
    gvwrLbs: 15500,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "37MB2B",
    gvwrLbs: 15500,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "impression",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "44STAY",
    gvwrLbs: 17370,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB18.0",
    gvwrLbs: 5200,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB18.2",
    gvwrLbs: 5478,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB18.3",
    gvwrLbs: 5603,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB18.7",
    gvwrLbs: 5488,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB19.0",
    gvwrLbs: 6543,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB19.2",
    gvwrLbs: 4910,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB19.3",
    gvwrLbs: 6008,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB19.4",
    gvwrLbs: 5630,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2027,
    floorplan: "NB19.6",
    gvwrLbs: 6145,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.2",
    gvwrLbs: 6503,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.3",
    gvwrLbs: 6693,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.4",
    gvwrLbs: 6438,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.5",
    gvwrLbs: 7103,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.6",
    gvwrLbs: 8063,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.7",
    gvwrLbs: 7123,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.8",
    gvwrLbs: 8253,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "no boundaries",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "NB20.9",
    gvwrLbs: 7853,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19MDBLE",
    gvwrLbs: 5698,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19BHLE",
    gvwrLbs: 5608,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19RBLE",
    gvwrLbs: 5649,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "19RKLE",
    gvwrLbs: 5615,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "202RBLE",
    gvwrLbs: 6753,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "204MKLE",
    gvwrLbs: 6993,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "205RKLE",
    gvwrLbs: 7343,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "230MDLE",
    gvwrLbs: 7588,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "242RDLE",
    gvwrLbs: 7663,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "252RBLE",
    gvwrLbs: 7533,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "260BHLE",
    gvwrLbs: 7278,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "261RKLE",
    gvwrLbs: 7578,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "296QBLE",
    gvwrLbs: 8573,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "surveyor legend",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "303BHLE",
    gvwrLbs: 9578,
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "serenova",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "150HL",
    gvwrLbs: 5400,
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "serenova",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "160LG",
    gvwrLbs: 5400,
  },
  {
    makeIncludes: "modern buggy",
    modelIncludes: "hopper",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "4",
    gvwrLbs: 4400,
  },
  {
    makeIncludes: "east to west",
    modelIncludes: "ahara",
    yearMin: 2026,
    yearMax: 2026,
    floorplan: "325RL",
    gvwrLbs: 15500,
  },
];

/** Pin count for coverage reports / tests. */
export function oemGvwrPinCount(): number {
  return OEM_GVWR_PINS.length;
}

export type OemGvwrPinRow = {
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  gvwrLbs: number;
};

/** Brochure GVWR pins used by Facts / TTW. Read-only snapshot for coverage. */
export function listOemGvwrPins(): readonly OemGvwrPinRow[] {
  return OEM_GVWR_PINS;
}

type OemUvwPin = {
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  uvwLbs: number;
  /** Brochure / OEM / dealer URL or note — required, never invented. */
  source: string;
};

function uvwPins(
  makeIncludes: string,
  modelIncludes: string,
  yearMin: number,
  yearMax: number,
  floorplans: readonly string[],
  uvwLbs: number,
  source: string,
): OemUvwPin[] {
  return floorplans.map((floorplan) => ({
    makeIncludes,
    modelIncludes,
    yearMin,
    yearMax,
    floorplan,
    uvwLbs,
    source,
  }));
}

/**
 * Published OEM UVW pins for torque-to-weight (UVW-preferred scoring).
 * Mirror GVWR pin shape. Only pin a single floorplan UVW printed by a
 * dated brochure / OEM table. Missing UVW stays unpinned → GVWR fallback.
 * Never invent from mid×0.82 or CCC math.
 */
const OEM_UVW_PINS: OemUvwPin[] = [
  // Newmar Dutch Star — 2025 + 2026 OEM brochure APP. UVW tables.
  // 3836 is Freightliner-only (no Spartan row). 2027 RVUSA brochure reprints 34,700.
  // 4071/4081 print both chassis; pin the HEAVIER Spartan APP. UVW (conservative TTW).
  // https://www.newmarcorp.com/content/dam/newmar/page-assets/model-page-assets/2025-model-year-page-assets/dutch-star/10-brochure__ds25/2025-dutch-star-brochure-final2-combo.pdf
  // https://www.newmarcorp.com/content/dam/newmar/brochure/2026-newmar-digital-brochures/2026-dutch-star-brochure-final-combo.pdf.coredownload.inline.pdf
  ...uvwPins(
    "newmar",
    "dutch star",
    2025,
    2027,
    ["3836"],
    34700,
    "Newmar 2025–2027 Dutch Star brochure Freightliner APP. UVW (34,700). 2026 OEM floorplan page prints 35,000 — brochure table used. 2027 Newmar Dutch Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "dutch star",
    2025,
    2026,
    ["4071"],
    37550,
    "Newmar 2025–2026 Dutch Star brochure Spartan APP. UVW 37,550 (Freightliner 37,500). Heavier chassis used.",
  ),
  ...uvwPins(
    "newmar",
    "dutch star",
    2025,
    2026,
    ["4081"],
    37700,
    "Newmar 2025–2026 Dutch Star brochure Spartan APP. UVW 37,700 (Freightliner 37,650). Heavier chassis used.",
  ),

  // Newmar Bay Star — 2025 brochure APP. UVW (Ford F-53).
  // https://www.newmarcorp.com/content/dam/newmar/page-assets/model-page-assets/2025-model-year-page-assets/bay-star/10-brochure__bs25/2025-bay-star-brochure-final-combo.pdf
  ...uvwPins(
    "newmar",
    "bay star",
    2025,
    2025,
    ["3225"],
    21450,
    "Newmar 2025 Bay Star brochure APP. UVW 21,450 (GVWR 24,000 on that card).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2025,
    2025,
    ["3626"],
    22600,
    "Newmar 2025 Bay Star brochure APP. UVW 22,600.",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2025,
    2025,
    ["3629"],
    22700,
    "Newmar 2025 Bay Star brochure APP. UVW 22,700.",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2025,
    2025,
    ["3811", "3826"],
    22850,
    "Newmar 2025 Bay Star brochure APP. UVW 22,850.",
  ),

  // Newmar Bay Star — 2026 brochure APP. UVW (all listed plans 26,000 GVWR).
  // https://www.newmarcorp.com/content/dam/newmar/brochure/2026-newmar-digital-brochures/2026-bay-star-brochure-final-combo.pdf.coredownload.inline.pdf
  // https://www.newmarcorp.com/models/bay-star/2026-bay-star/floor-plans/3114
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3114"],
    20050,
    "Newmar 2026–2027 Bay Star brochure / OEM 3114 page APP. UVW 20,050. 2027 Newmar Bay Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3225"],
    21450,
    "Newmar 2026–2027 Bay Star brochure APP. UVW 21,450. 2027 Newmar Bay Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3609"],
    22700,
    "Newmar 2026–2027 Bay Star brochure APP. UVW 22,700. 2027 Newmar Bay Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2026,
    ["3629"],
    22700,
    "Newmar 2026 Bay Star brochure APP. UVW 22,700.",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3626"],
    22600,
    "Newmar 2026–2027 Bay Star brochure / OEM 3626 page APP. UVW 22,600. 2027 Newmar Bay Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2027,
    ["3811"],
    22850,
    "Newmar 2026–2027 Bay Star brochure APP. UVW 22,850. 2027 Newmar Bay Star brochure chassis UVW (RVUSA library).",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2026,
    2026,
    ["3826"],
    22850,
    "Newmar 2026 Bay Star brochure APP. UVW 22,850.",
  ),
  ...uvwPins(
    "newmar",
    "bay star",
    2027,
    2027,
    ["3639", "3640"],
    22700,
    "2027 Newmar Bay Star brochure chassis UVW (RVUSA library)",
  ),

  // Newmar Canyon Star — 2025 brochure + OEM 3947 chassis table.
  // https://www.newmarcorp.com/content/dam/newmar/page-assets/model-page-assets/2025-model-year-page-assets/canyon-star/10-brochure-25/2025-canyon-star-brochure-final-combo.pdf
  // https://www.newmarcorp.com/models/canyon-star/2025-canyon-star/floor-plans/3947
  // 2026 UVW unprinted — leave GAP. 2027 RVUSA brochure reprints 25,950.
  ...uvwPins(
    "newmar",
    "canyon star",
    2025,
    2025,
    ["3947"],
    25950,
    "Newmar 2025 Canyon Star brochure / OEM 3947 page APP. UVW 25,950.",
  ),
  ...uvwPins(
    "newmar",
    "canyon star",
    2027,
    2027,
    ["3947"],
    25950,
    "2027 Newmar Canyon Star brochure chassis UVW (RVUSA library)",
  ),

  // Newmar MY2027 UVW singles from dated RVUSA brochures (Catalog Audit F).
  // Dual-chassis Dutch Star tag / Ventana UVW stay GAP. Essex / London Aire
  // brochures print GVWR only — no invented UVW.
  ...uvwPins(
    "newmar",
    "bay star sport",
    2027,
    2027,
    ["2813"],
    17650,
    "2027 Newmar Bay Star Sport brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "bay star sport",
    2027,
    2027,
    ["3014"],
    18800,
    "2027 Newmar Bay Star Sport brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "bay star sport",
    2027,
    2027,
    ["3225"],
    20050,
    "2027 Newmar Bay Star Sport brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "grand star",
    2027,
    2027,
    ["3444"],
    25500,
    "2027 Newmar Grand Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "grand star",
    2027,
    2027,
    ["3940", "3948"],
    28000,
    "2027 Newmar Grand Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "king aire",
    2027,
    2027,
    ["4531"],
    49900,
    "2027 Newmar King Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "king aire",
    2027,
    2027,
    ["4596"],
    50000,
    "2027 Newmar King Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "mountain aire",
    2027,
    2027,
    ["3823", "3825"],
    41000,
    "2027 Newmar Mountain Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "mountain aire",
    2027,
    2027,
    ["4118"],
    42700,
    "2027 Newmar Mountain Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "mountain aire",
    2027,
    2027,
    ["4551"],
    44200,
    "2027 Newmar Mountain Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "new aire",
    2027,
    2027,
    ["3543"],
    33800,
    "2027 Newmar New Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "new aire",
    2027,
    2027,
    ["3547"],
    33400,
    "2027 Newmar New Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "northern star",
    2027,
    2027,
    ["3418"],
    28800,
    "2027 Newmar Northern Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "northern star",
    2027,
    2027,
    ["3709"],
    30200,
    "2027 Newmar Northern Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "northern star",
    2027,
    2027,
    ["4011"],
    30400,
    "2027 Newmar Northern Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "northern star",
    2027,
    2027,
    ["4037"],
    31600,
    "2027 Newmar Northern Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "super star",
    2027,
    2027,
    ["3731"],
    33500,
    "2027 Newmar Super Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "super star",
    2027,
    2027,
    ["4040", "4059", "4140", "4159"],
    34500,
    "2027 Newmar Super Star brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "supreme aire",
    2027,
    2027,
    ["3827"],
    35500,
    "2027 Newmar Supreme Aire brochure chassis UVW (RVUSA library)",
  ),
  ...uvwPins(
    "newmar",
    "supreme aire",
    2027,
    2027,
    ["4129", "4141"],
    37000,
    "2027 Newmar Supreme Aire brochure chassis UVW (RVUSA library)",
  ),

  // 2025 Seneca 37K only. Jayco publishes no UVW for MY2025 (page confirms
  // GVWR 31,000 / GCWR 43,000). Owner-reported weigh-in stands in for TTW.
  // Equal pin scores keep the first match, so this year row must stay ahead
  // of the 2021–2027 26,000 pin. Other years, 37L/37M, and Accolade stay put.
  // https://www.sporttruckrv.com/Pre-Owned-Inventory-2021-Jayco-Motorhome-Seneca-37K-Seneca-Chandler-18286144
  // https://www.jayco.com/rvs/class-c-motorhomes/2025-seneca/37k/
  ...uvwPins(
    "jayco",
    "seneca",
    2025,
    2025,
    ["37K"],
    24820,
    "owner-reported weigh-in ~24,820 lb (web); Jayco publishes no UVW for MY2025. https://www.sporttruckrv.com/Pre-Owned-Inventory-2021-Jayco-Motorhome-Seneca-37K-Seneca-Chandler-18286144 https://www.jayco.com/rvs/class-c-motorhomes/2025-seneca/37k/",
  ),

  // Jayco Seneca Super C — restates in-repo OEM floorplan UVW so the TTW
  // pin table owns the number. 2025–2026 Jayco Seneca brochure prints
  // GVWR 31,000 only (no UVW column). Do not invent a new figure.
  // 2025 37K is the year-specific pin above; this row still covers 2021–2024 and 2026–2027.
  ...uvwPins(
    "jayco",
    "seneca",
    2021,
    2027,
    ["37K"],
    26000,
    "In-repo OEM floorplan spec (Jayco Seneca OEM Super C specs). Current Jayco 2025–2026 brochure does not reprint UVW.",
  ),
  ...uvwPins(
    "jayco",
    "seneca",
    2021,
    2027,
    ["37L"],
    26200,
    "In-repo OEM floorplan spec (Jayco Seneca OEM Super C specs). Current Jayco 2025–2026 brochure does not reprint UVW.",
  ),
  ...uvwPins(
    "jayco",
    "seneca",
    2021,
    2027,
    ["37M"],
    26500,
    "In-repo OEM floorplan spec (Jayco Seneca OEM Super C specs). Current Jayco 2025–2026 brochure does not reprint UVW.",
  ),

  // 2022 American Dream 39RK — representative UVW for the 39RK line
  // (all units that year, not one VIN). Do not bleed to 42Q / 42V / 45A
  // or other model years.
  // Family RVing road-test door placard: 39,237 UVW / 7,763 OCCC.
  ...uvwPins(
    "american coach",
    "american dream",
    2022,
    2022,
    ["39RK"],
    39237,
    "Family RVing road-test door placard for 2022 American Coach American Dream 39RK (39,237 UVW / 7,763 OCCC). Representative UVW for the 39RK line that year — not a single VIN.",
  ),

  // Forest River Cardinal — RVUSA 2027 Forest River Cardinal brochure.
  // Printed UVW only. 41DUB prints TBD — leave GAP.
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["32CHILL"],
    9688,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["33CHEF"],
    10558,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["35CRIB"],
    11953,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["36FL"],
    10708,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["36FUN"],
    12033,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["37GALLEY"],
    11123,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),
  ...uvwPins(
    "forest river",
    "cardinal",
    2027,
    2027,
    ["38DEN"],
    11638,
    "RVUSA 2027 Forest River Cardinal brochure.",
  ),

  // Grand Design Lineage Series F 31ZW — OEM brochure omits UVW (GCWR/GVWR/tanks
  // only). Pin the 2026 dry-weight / UVW dealer + spec consensus (18,186).
  // Not 31ZW5 (F-550, GVWR 19,500). Not Series M / E. Not 18,148 (Clear Creek outlier).
  ...uvwPins(
    "grand design",
    "lineage series f",
    2026,
    2026,
    ["31ZW"],
    18186,
    "2026 Grand Design Lineage Series F 31ZW dry weight / UVW 18,186 — dealer + spec consensus. RVGuide 2026 Class C card: Dry Weight 18,186 / Payload 3,814 / Fuel 66.5 / Fresh 79 / Gray 66 / Black 45 / GVWR 22,000 (https://www.rvguide.com/specs/grand-design/class-c/2026/lineage-series-f/31zw.html). JD Power 2026 listing corroborates 18,186 (https://www.jdpower.com/rvs-for-sale/inventory/2026/grand-design/lineage-series-f/grand-bay-al/a7c5da6f-80ea-4a36-8198-884e07f0d529). OEM Lineage Series F brochure prints GCWR/GVWR/tanks and omits UVW (https://www.granddesignrv.com/motorized/lineage-series-f · http://library.rvusa.com/brochure/2026-Grand-Design-Lineage-Series-F.pdf). Clear Creek 18,148 is an outlier — do not pin. Not 31ZW5.",
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["235RW"],
    8073,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["242RD"],
    7568,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["301ML"],
    10443,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["315MB"],
    10338,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["318RL"],
    11153,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["360MYR"],
    12338,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["36BR3"],
    11788,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["372DUO"],
    12528,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["37MB2B"],
    13023,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "impression",
    2026,
    2026,
    ["44STAY"],
    13824,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB18.0"],
    3848,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB18.2"],
    3978,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB18.3"],
    4103,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB18.7"],
    3988,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB19.0"],
    5043,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB19.2"],
    3798,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB19.3"],
    4508,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB19.4"],
    4253,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2027,
    ["NB19.6"],
    4645,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.2"],
    5003,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.3"],
    5193,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.4"],
    4938,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.5"],
    5603,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.6"],
    6563,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.7"],
    5623,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.8"],
    6753,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "no boundaries",
    2026,
    2026,
    ["NB20.9"],
    6353,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["19MDBLE"],
    4100,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["19BHLE"],
    3777,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["19RBLE"],
    3917,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["19RKLE"],
    4399,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["202RBLE"],
    5253,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["204MKLE"],
    5493,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["205RKLE"],
    5843,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["230MDLE"],
    6088,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["242RDLE"],
    6163,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["252RBLE"],
    6033,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["260BHLE"],
    5778,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["261RKLE"],
    6078,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["296QBLE"],
    7073,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "forest river",
    "surveyor legend",
    2026,
    2026,
    ["303BHLE"],
    8078,
    'Forest River floorplans table fetched 2026-09-24. GVWR is the printed spec-page figure where opened (Impression 315MB 13,213 / 318RL 14,120 / 36BR3 14,155; Surveyor Legend 19BHLE 5,608; No Boundaries NB19.6 6,145). Other plans on that same table print UVW and CCC only; GVWR = UVW+CCC, which matched those printed pages exactly. 2026 only — do not apply to 2025 or earlier. NB19.6 standard (not Beast Mode) also reprints on the 2027 page.',
  ),
  ...uvwPins(
    "grand design",
    "serenova",
    2026,
    2026,
    ["150HL"],
    4650,
    "OEM granddesignrv.com/travel-trailers/serenova/150hl copyright 2026. UVW 4,650 / GVWR 5,400.",
  ),
  ...uvwPins(
    "grand design",
    "serenova",
    2026,
    2026,
    ["160LG"],
    4436,
    "OEM granddesignrv.com/travel-trailers/serenova/160lg (2026-09-21). UVW 4,436 / GVWR 5,400.",
  ),
  ...uvwPins(
    "modern buggy",
    "hopper",
    2026,
    2026,
    ["4"],
    3925,
    "modernbuggyrv.com/hopper-4 WEIGHT 3,925 (May 2026) and 2026 General RV HOP4 sticker dry weight 3,925 / GVWR 4,400 (VIN 72WBT2211T1001417). Tanks not pinned — editorial 77/35/35 conflicts with that sticker 16/22/14.",
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["1600MRB-LE"],
    3998,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["1800MBH-LE"],
    4284,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["1900MMK"],
    5463,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2375KRK"],
    6328,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2400KTH"],
    7343,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2410KML"],
    6363,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2475KBH"],
    6603,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2600KRB"],
    6213,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2650KRD"],
    6733,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2775KFK"],
    7818,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2800KBH"],
    6864,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2850KRL"],
    6851,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["2870KTH"],
    8633,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["3010KBH"],
    7823,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["3150KBH"],
    9163,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["3175RK"],
    9133,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "alta",
    2026,
    2026,
    ["3250KXT"],
    10334,
    'East to West 2026 Alta floorplans table (easttowestrv.com/print/floorplans/alta). UVW printed. GVWR is not printed and is not derived.',
  ),
  ...uvwPins(
    "east to west",
    "tandara",
    2026,
    2026,
    ["235ML"],
    7324,
    "East to West Tandara floorplans table (easttowestrv.com/print/floorplans/tandara). 390FL detail page is titled 2026. UVW printed. GVWR not printed — not derived.",
  ),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["275BH"], 8579, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["295RL"], 10864, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["381FK"], 12769, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["387BH"], 13019, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["388LR"], 12619, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["389DS"], 13439, "East to West 2026 Tandara floorplans table. UVW printed. GVWR not derived."),
  ...uvwPins("east to west", "tandara", 2026, 2026, ["390FL"], 12444, "East to West 2026 Tandara floorplans table and 390FL detail page. UVW 12,444. GVWR not printed."),
  ...uvwPins(
    "east to west",
    "ahara",
    2026,
    2026,
    ["325RL"],
    11759,
    "Riverside Camping Center 2026 Ahara floorplan table (published 2025-09-28): 325RL UVW 11,759 / GVWR 15,500 / pin 2,185 / length 34' 9\". In-stock plan only.",
  ),
];

/** Pin count for coverage reports / tests. */
export function oemUvwPinCount(): number {
  return OEM_UVW_PINS.length;
}

export type OemUvwPinRow = {
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  uvwLbs: number;
  source: string;
};

/** Brochure / sticker UVW pins. Never overwrite these with the tiered GVWR estimate. */
export function listOemUvwPins(): readonly OemUvwPinRow[] {
  return OEM_UVW_PINS;
}

function modelPinBlocked(modelIncludes: string, modelNorm: string): boolean {
  if (
    modelIncludes === "vision" &&
    (modelNorm.includes("xl") || modelNorm.includes("se")) &&
    !modelIncludes.includes("xl") &&
    !modelIncludes.includes("se")
  ) {
    return true;
  }
  if (
    modelIncludes === "precept" &&
    modelNorm.includes("prestige") &&
    !modelIncludes.includes("prestige")
  ) {
    return true;
  }
  // Bare "seneca" / "seneca super c" pins must not stamp Seneca XT or Prestige.
  // Prestige 37K/37L/37M use exact "seneca prestige" 2027 pins; 33J stays GAP.
  if (
    (modelIncludes === "seneca" || modelIncludes === "seneca super c") &&
    (modelNorm.includes("xt") || modelNorm.includes("prestige")) &&
    !modelIncludes.includes("xt") &&
    !modelIncludes.includes("prestige")
  ) {
    return true;
  }
  if (modelIncludes === "alante" && modelNorm.includes("se") && !modelIncludes.includes("se")) {
    return true;
  }
  if (modelIncludes === "redhawk" && modelNorm.includes("se") && !modelIncludes.includes("se")) {
    return true;
  }
  if (
    modelIncludes === "melbourne" &&
    modelNorm.includes("prestige") &&
    !modelIncludes.includes("prestige")
  ) {
    return true;
  }
  if (
    modelIncludes === "quantum" &&
    modelNorm.includes("sprinter") &&
    !modelIncludes.includes("sprinter")
  ) {
    return true;
  }
  if (
    modelIncludes === "chateau" &&
    modelNorm.includes("sprinter") &&
    !modelIncludes.includes("sprinter")
  ) {
    return true;
  }
  if (
    modelIncludes === "sunseeker" &&
    (modelNorm.includes("sunseeker le") ||
      modelNorm.includes("classic") ||
      modelNorm.includes("4x4") ||
      modelNorm.includes("mbs") ||
      modelNorm.includes("sunseeker pm") ||
      modelNorm.includes("sunseeker ts"))
  ) {
    return true;
  }
  if (
    modelIncludes === "georgetown" &&
    (modelNorm.includes("5 series") || modelNorm.includes("xl")) &&
    !modelIncludes.includes("5 series") &&
    !modelIncludes.includes("xl")
  ) {
    return true;
  }
  if (
    modelIncludes === "odyssey" &&
    (modelNorm.includes("odyssey se") || modelNorm.includes("esteem"))
  ) {
    return true;
  }
  if (
    modelIncludes === "four winds" &&
    (modelNorm.includes("majestic") ||
      modelNorm.includes("siesta") ||
      modelNorm.includes("sprinter"))
  ) {
    return true;
  }
  if (modelIncludes === "palazzo" && modelNorm.includes("gt") && !modelIncludes.includes("gt")) {
    return true;
  }
  if (modelIncludes === "inception" && modelNorm.includes("hd") && !modelIncludes.includes("hd")) {
    return true;
  }
  if (modelIncludes === "pasadena" && modelNorm.includes("sv") && !modelIncludes.includes("sv")) {
    return true;
  }
  if (modelIncludes === "gemini" && modelNorm.includes("trip") && !modelIncludes.includes("trip")) {
    return true;
  }
  if (
    modelIncludes === "rize" &&
    (modelNorm.includes("plus") || modelNorm.includes("sport")) &&
    !modelIncludes.includes("plus") &&
    !modelIncludes.includes("sport")
  ) {
    return true;
  }
  if (modelIncludes === "scope" && modelNorm.includes("sport") && !modelIncludes.includes("sport")) {
    return true;
  }
  if (modelIncludes === "sequence" && modelNorm.includes("sport") && !modelIncludes.includes("sport")) {
    return true;
  }
  if (modelIncludes === "tellaro" && modelNorm.includes("sport") && !modelIncludes.includes("sport")) {
    return true;
  }
  if (
    modelIncludes === "magnitude" &&
    (modelNorm.includes("grand") || modelNorm.includes("xg")) &&
    !modelIncludes.includes("grand") &&
    !modelIncludes.includes("xg")
  ) {
    return true;
  }
  if (modelIncludes === "omni" && modelNorm.includes("trail") && !modelIncludes.includes("trail")) {
    return true;
  }
  if (
    modelIncludes === "echelon" &&
    modelNorm.includes("sprinter") &&
    !modelIncludes.includes("sprinter")
  ) {
    return true;
  }
  if (modelIncludes === "bay star" && modelNorm.includes("sport") && !modelIncludes.includes("sport")) {
    return true;
  }
  if (
    modelIncludes === "leprechaun" &&
    modelNorm.includes("premier") &&
    !modelIncludes.includes("premier")
  ) {
    return true;
  }
  if (
    modelIncludes === "greyhawk" &&
    (modelNorm.includes("prestige") || modelNorm.includes("xl")) &&
    !modelIncludes.includes("prestige") &&
    !modelIncludes.includes("xl")
  ) {
    return true;
  }
  if (
    modelIncludes === "allegro red" &&
    (modelNorm.includes("340") || modelNorm.includes("360")) &&
    !modelIncludes.includes("340") &&
    !modelIncludes.includes("360")
  ) {
    return true;
  }
  if (
    modelIncludes === "open road" &&
    (modelNorm.includes("allegro red") || modelNorm.includes("allegro breeze"))
  ) {
    return true;
  }
  if (
    modelIncludes.startsWith("lineage series") &&
    !modelNorm.includes(modelIncludes)
  ) {
    return true;
  }
  if (
    (modelIncludes === "altitude" || modelIncludes === "incline") &&
    (modelNorm.includes("fs550") || modelNorm.includes("fs600")) &&
    !modelIncludes.includes("fs")
  ) {
    return true;
  }
  // Cardinal is a single FR fifth-wheel line — do not match Cardinal Luxury / siblings.
  if (modelIncludes === "cardinal" && modelNorm.trim() !== "cardinal") {
    return true;
  }
  // Basecamp 20X pin is the gas/off-road trailer — do not match Basecamp Xe.
  if (modelIncludes === "basecamp" && modelNorm.includes("xe") && !modelIncludes.includes("xe")) {
    return true;
  }
  // Renegade Verona is not Verona LE (dual Freightliner/Peterbilt 37.6K/ — GAP).
  if (modelIncludes === "verona" && modelNorm.includes("le") && !modelIncludes.includes("le")) {
    return true;
  }
  // In-stock 2026 pins are exact series names. Do not let "hopper" fill Hopper 1 / Hopper 2.
  if (modelIncludes === "hopper" && modelNorm !== "hopper") return true;
  if (modelIncludes === "impression" && modelNorm !== "impression") return true;
  if (modelIncludes === "alta" && modelNorm !== "alta") return true;
  if (modelIncludes === "serenova" && modelNorm !== "serenova") return true;
  if (modelIncludes === "no boundaries" && modelNorm !== "no boundaries") return true;
  if (modelIncludes === "surveyor legend" && !modelNorm.startsWith("surveyor legend")) return true;
  if (
    modelIncludes === "hideout" &&
    (modelNorm.includes("mini") || modelNorm.includes("max"))
  ) {
    return true;
  }
  if (
    modelIncludes === "rockwood signature" &&
    modelNorm.includes("travel trailer")
  ) {
    return true;
  }
  if (modelIncludes === "avenue" && modelNorm.includes("travel trailer")) return true;
  if (
    modelIncludes === "conquest" &&
    modelNorm.includes("le") &&
    !modelIncludes.includes("le")
  ) {
    return true;
  }
  if (
    modelIncludes === "forester" &&
    modelNorm.includes("mbs") &&
    !modelIncludes.includes("mbs")
  ) {
    return true;
  }
  if (
    modelIncludes === "wildwood" &&
    modelNorm.includes("heritage") &&
    !modelIncludes.includes("heritage")
  ) {
    return true;
  }
  if (
    modelIncludes === "freedom express" &&
    (modelNorm.includes("ultra") || modelNorm.includes("select")) &&
    !modelIncludes.includes("ultra") &&
    !modelIncludes.includes("select")
  ) {
    return true;
  }
  return false;
}

type OemTankPin = {
  makeIncludes: string;
  modelIncludes: string;
  yearMin: number;
  yearMax: number;
  floorplan: string;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  fuelCapacityGal?: number;
};

/**
 * Sourced holding-tank / fuel-cap pins. Catalog series + year-band SoT —
 * never invent gallons. UVW lives in OEM_UVW_PINS (2026 31ZW dry-weight consensus).
 */
const OEM_TANK_PINS: OemTankPin[] = [
  {
    makeIncludes: "grand design",
    modelIncludes: "lineage series f",
    yearMin: 2025,
    yearMax: 2027,
    floorplan: "31ZW",
    freshWater: 79,
    grayWater: 66,
    blackWater: 45,
    fuelCapacityGal: 66.5,
  },
  {
    makeIncludes: "grand design",
    modelIncludes: "lineage series f",
    yearMin: 2025,
    yearMax: 2027,
    floorplan: "31ZW5",
    freshWater: 79,
    grayWater: 66,
    blackWater: 45,
    fuelCapacityGal: 66.5,
  },
  {
    makeIncludes: "forest river",
    modelIncludes: "sunseeker le",
    yearMin: 2022,
    yearMax: 2027,
    floorplan: "2550DSLE",
    freshWater: 44,
    grayWater: 33,
    blackWater: 32,
    fuelCapacityGal: 55,
  },
  { makeIncludes: "gulf stream", modelIncludes: "conquest le", yearMin: 2024, yearMax: 2024, floorplan: "6280LE", freshWater: 31, grayWater: 38, blackWater: 31 },
  { makeIncludes: "genesis supreme", modelIncludes: "genesis supreme", yearMin: 2026, yearMax: 2027, floorplan: "28IKS", freshWater: 160, grayWater: 50, blackWater: 50 },
  { makeIncludes: "genesis supreme", modelIncludes: "genesis supreme", yearMin: 2026, yearMax: 2027, floorplan: "2215SSXL", freshWater: 100, grayWater: 40, blackWater: 40 },
  { makeIncludes: "genesis supreme", modelIncludes: "genesis supreme", yearMin: 2026, yearMax: 2027, floorplan: "2415CRXL", freshWater: 100, grayWater: 40, blackWater: 40 },
  { makeIncludes: "genesis supreme", modelIncludes: "genesis supreme", yearMin: 2026, yearMax: 2027, floorplan: "2715FSXL", freshWater: 100, grayWater: 40, blackWater: 40 },
  { makeIncludes: "jayco", modelIncludes: "jay flight g2", yearMin: 2011, yearMax: 2011, floorplan: "29RLS", freshWater: 86, grayWater: 33, blackWater: 33 },
  { makeIncludes: "jayco", modelIncludes: "jay flight g2", yearMin: 2011, yearMax: 2011, floorplan: "25RKS", freshWater: 86, grayWater: 65, blackWater: 33 },
  { makeIncludes: "heartland", modelIncludes: "big country", yearMin: 2011, yearMax: 2011, floorplan: "3250TS", freshWater: 73, grayWater: 90, blackWater: 45 },
  { makeIncludes: "newmar", modelIncludes: "dutch star", yearMin: 2011, yearMax: 2011, floorplan: "4020T", freshWater: 105, grayWater: 65, blackWater: 45, fuelCapacityGal: 100 },
  { makeIncludes: "newmar", modelIncludes: "dutch star", yearMin: 2011, yearMax: 2011, floorplan: "4020", freshWater: 105, grayWater: 65, blackWater: 45, fuelCapacityGal: 100 },
  { makeIncludes: "northwood", modelIncludes: "nash", yearMin: 2022, yearMax: 2022, floorplan: "24M", freshWater: 50, grayWater: 42, blackWater: 35 },
  { makeIncludes: "lance", modelIncludes: "2285", yearMin: 2016, yearMax: 2016, floorplan: "2285", freshWater: 45, grayWater: 90, blackWater: 45 },
  { makeIncludes: "jayco", modelIncludes: "white hawk", yearMin: 2020, yearMax: 2020, floorplan: "23MRB", freshWater: 42, grayWater: 31, blackWater: 31 },
  { makeIncludes: "sunset park", modelIncludes: "sun lite", yearMin: 2024, yearMax: 2024, floorplan: "21TH", freshWater: 36, grayWater: 28, blackWater: 28 },
  { makeIncludes: "coachmen", modelIncludes: "freedom express ultra lite", yearMin: 2021, yearMax: 2021, floorplan: "238BHS", freshWater: 50, grayWater: 35, blackWater: 35 },
  { makeIncludes: "thor", modelIncludes: "freedom traveler", yearMin: 2025, yearMax: 2025, floorplan: "A24", freshWater: 42, grayWater: 40, blackWater: 30 },
  { makeIncludes: "heartland", modelIncludes: "bighorn", yearMin: 2019, yearMax: 2019, floorplan: "3160ELITE", freshWater: 65, grayWater: 90, blackWater: 45 },
  { makeIncludes: "forest river", modelIncludes: "wildwood heritage glen elite", yearMin: 2022, yearMax: 2022, floorplan: "36FL", freshWater: 57, grayWater: 104, blackWater: 70 },
  { makeIncludes: "alliance", modelIncludes: "avenue travel trailer", yearMin: 2026, yearMax: 2027, floorplan: "298RL", freshWater: 71, grayWater: 106, blackWater: 53 },
  { makeIncludes: "forest river", modelIncludes: "rockwood signature", yearMin: 2022, yearMax: 2022, floorplan: "8291RK", freshWater: 54, grayWater: 90, blackWater: 50 },
  { makeIncludes: "forest river", modelIncludes: "rockwood signature travel trailer", yearMin: 2025, yearMax: 2025, floorplan: "8339FK", freshWater: 54, grayWater: 131, blackWater: 53 },
  { makeIncludes: "forest river", modelIncludes: "forester mbs", yearMin: 2018, yearMax: 2018, floorplan: "2401R", freshWater: 35, grayWater: 30, blackWater: 30, fuelCapacityGal: 26 },
  { makeIncludes: "keystone", modelIncludes: "hideout", yearMin: 2026, yearMax: 2027, floorplan: "210RL", freshWater: 45, grayWater: 39, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2027, floorplan: "20MKX", freshWater: 56, grayWater: 39, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2027, floorplan: "23BHX", freshWater: 56, grayWater: 78, blackWater: 57 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "25MLX", freshWater: 56, grayWater: 57, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "22RBX", freshWater: 56, grayWater: 68, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "21RLX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "19BHX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "26RBX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "27DBX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "24BHX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "grand design", modelIncludes: "transcend xplor", yearMin: 2026, yearMax: 2026, floorplan: "26BHX", freshWater: 56, grayWater: 78, blackWater: 39 },
  { makeIncludes: "forest river", modelIncludes: "sunseeker le", yearMin: 2026, yearMax: 2027, floorplan: "2250SLE", freshWater: 35, grayWater: 32, blackWater: 27 },
  { makeIncludes: "forest river", modelIncludes: "sunseeker le", yearMin: 2026, yearMax: 2026, floorplan: "2350LE", freshWater: 44, grayWater: 39, blackWater: 39 },
  { makeIncludes: "forest river", modelIncludes: "sunseeker le", yearMin: 2026, yearMax: 2027, floorplan: "2950LE", freshWater: 44, grayWater: 39, blackWater: 39 },
  { makeIncludes: "forest river", modelIncludes: "sunseeker le", yearMin: 2026, yearMax: 2027, floorplan: "3250DSLE", freshWater: 44, grayWater: 39, blackWater: 39, fuelCapacityGal: 55 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-171", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-190", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-180", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-185", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-192", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-194", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-198", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2027, floorplan: "RP-197", freshWater: 40, grayWater: 40, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-200", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-203", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-204", freshWater: 30, grayWater: 60, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2026, yearMax: 2026, floorplan: "RP-153", freshWater: 30, grayWater: 30, blackWater: 30 },
  { makeIncludes: "forest river", modelIncludes: "r-pod", yearMin: 2027, yearMax: 2027, floorplan: "RP-205", freshWater: 40, grayWater: 40, blackWater: 30 },
];

export type OemHoldingTanks = {
  freshWater: number | null;
  grayWater: number | null;
  blackWater: number | null;
  fuelCapacityGal: number | null;
};

function emptyHoldingTanks(): OemHoldingTanks {
  return {
    freshWater: null,
    grayWater: null,
    blackWater: null,
    fuelCapacityGal: null,
  };
}

/** Sourced tanks / fuel cap. Null fields stay GAP — do not invent. */
export function findOemHoldingTanks(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): OemHoldingTanks {
  if (!floorplan?.trim()) return emptyHoldingTanks();
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return emptyHoldingTanks();
  const mk = make.toLowerCase();
  const md = model.toLowerCase();
  const fp = floorplan.trim().toUpperCase().replace(/[\s-]+/g, "");

  let best: OemTankPin | null = null;
  let bestScore = -1;
  for (const row of OEM_TANK_PINS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    if (modelPinBlocked(row.modelIncludes, md)) continue;
    const rowFp = row.floorplan.toUpperCase().replace(/[\s-]+/g, "");
    if (rowFp !== fp) continue;
    const score = row.modelIncludes.length * 10 + row.makeIncludes.length;
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }
  if (!best) return emptyHoldingTanks();
  return {
    freshWater: best.freshWater ?? null,
    grayWater: best.grayWater ?? null,
    blackWater: best.blackWater ?? null,
    fuelCapacityGal: best.fuelCapacityGal ?? null,
  };
}

/** Published OEM GVWR for a year/make/model/floorplan. Null → GAP (do not invent). */
export function findOemGvwrLbs(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): number | null {
  if (!floorplan?.trim()) return null;
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return null;
  const mk = make.toLowerCase();
  const md = model.toLowerCase();
  const fp = floorplan.trim().toUpperCase().replace(/[\s-]+/g, "");

  let best: number | null = null;
  let bestScore = -1;
  for (const row of OEM_GVWR_PINS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    if (modelPinBlocked(row.modelIncludes, md)) continue;
    const rowFp = row.floorplan.toUpperCase().replace(/[\s-]+/g, "");
    if (rowFp !== fp) continue;
    const score = row.modelIncludes.length * 10 + row.makeIncludes.length;
    if (score > bestScore) {
      bestScore = score;
      best = row.gvwrLbs;
    }
  }
  return best;
}

/** Published OEM UVW for a year/make/model/floorplan. Null → runtime tiered GVWR estimate when GVWR is known (do not invent mid×0.82). */
export function findOemUvwLbs(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): number | null {
  if (!floorplan?.trim()) return null;
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return null;
  const mk = make.toLowerCase();
  const md = model.toLowerCase();
  const fp = floorplan.trim().toUpperCase().replace(/[\s-]+/g, "");

  let best: number | null = null;
  let bestScore = -1;
  for (const row of OEM_UVW_PINS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    if (modelPinBlocked(row.modelIncludes, md)) continue;
    const rowFp = row.floorplan.toUpperCase().replace(/[\s-]+/g, "");
    if (rowFp !== fp) continue;
    const score = row.modelIncludes.length * 10 + row.makeIncludes.length;
    if (score > bestScore) {
      bestScore = score;
      best = row.uvwLbs;
    }
  }
  return best;
}

/** Weight estimate narrowed by floorplan length position in range.
 *  `uvwEst` (mid×0.82) is a CCC heuristic only — never the TTW / listing basis.
 */
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
