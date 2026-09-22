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
    // Bare "seneca" Super C rows must not fill Seneca XT (32U/35L).
    if (
      row.modelIncludes === "seneca" &&
      md.includes("xt") &&
      !row.modelIncludes.includes("xt")
    ) {
      continue;
    }
    // 33J is Seneca Super C MY27 only — Prestige catalog has no 33J.
    if (
      row.modelIncludes === "seneca" &&
      row.floorplan.toUpperCase() === "33J" &&
      md.includes("prestige")
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
  // modelPinBlocked keeps both off Seneca XT (32U/35L) and Seneca Prestige
  // (this card is Seneca Super C; Prestige has no 33J and no matching Prestige table).
  ...gvwrPins("jayco", "seneca super c", 2027, 2027, ["33J", "37K", "37L", "37M"], 31000),
  ...gvwrPins("jayco", "seneca", 2027, 2027, ["33J", "37K", "37L", "37M"], 31000),
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

  // Jayco Seneca Super C — restates in-repo OEM floorplan UVW so the TTW
  // pin table owns the number. 2025–2026 Jayco Seneca brochure prints
  // GVWR 31,000 only (no UVW column). Do not invent a new figure.
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
  // Prestige shares 37K/37L/37M but this 2027 card is Seneca Super C (no Prestige table).
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
  return false;
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
  const fp = floorplan.trim().toUpperCase().replace(/\s+/g, "");

  let best: number | null = null;
  let bestScore = -1;
  for (const row of OEM_GVWR_PINS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    if (modelPinBlocked(row.modelIncludes, md)) continue;
    const rowFp = row.floorplan.toUpperCase().replace(/\s+/g, "");
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
  const fp = floorplan.trim().toUpperCase().replace(/\s+/g, "");

  let best: number | null = null;
  let bestScore = -1;
  for (const row of OEM_UVW_PINS) {
    if (y < row.yearMin || y > row.yearMax) continue;
    if (!mk.includes(row.makeIncludes)) continue;
    if (!md.includes(row.modelIncludes)) continue;
    if (modelPinBlocked(row.modelIncludes, md)) continue;
    const rowFp = row.floorplan.toUpperCase().replace(/\s+/g, "");
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
