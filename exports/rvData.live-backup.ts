import { RV_CARD_MEDIA } from "@/assets/backdrops";
// ─── SHARED RV DATABASE ───────────────────────────────────────────────────────

/** Unified card/detail media — seal / coach placeholder */
export const RV_CARD_IMAGE = RV_CARD_MEDIA;

export interface PowertrainYearBand {
  from: number;
  to: number;
  engine: string;
  horsepower?: number;
  torqueLbFt?: number;
  chassis?: string;
  transmission?: string;
  fuelCapacityGal?: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  ceilingHeight?: number;
  slideouts?: number;
  sleeps?: number;
  towingCapacity?: number;
  generator?: string;
  gvwrLbs?: number;
  exteriorHeightIn?: number;
  overallLengthIn?: number;
  notes?: string;
  /**
   * Optional floorplan codes this band applies to (e.g. ["37BH"]).
   * When set, band is only used if selected floorplan matches (case/space-insensitive).
   * Bands without floorplans are model-wide defaults.
   */
  floorplans?: string[];
  /** Floorplans this band must NOT apply to */
  excludeFloorplans?: string[];
}

export interface RVSpec {
  type: string;
  floorplans: string[];
  floorplansByYear?: Record<string, string[]>;
  lengthRange: [number, number];
  weightRange: [number, number];
  slideouts: number;
  sleeps: number;
  msrpRange: [number, number];
  engine?: string;
  horsepower?: number;
  torqueLbFt?: number;
  chassis?: string;
  transmission?: string;
  fuelType: string;
  recalls: number;
  rating: number;
  image: string;
  towingCapacity?: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  fuelCapacityGal?: number;
  generator?: string;
  awningLength?: number;
  ceilingHeight?: number;
  founded?: number;
  warrantyYears?: number;
  description?: string;
  yearStart?: number;
  yearEnd?: number;
  powertrainByYear?: PowertrainYearBand[];
  garageLengthFt?: number;
  garageWidthFt?: number;
  garageHeightIn?: number;
  garageCapacityLbs?: number;
  rampWidthFt?: number;
  fuelStationGal?: number;
  generatorFuelGal?: number;
  garageFits?: string;
  gvwrLbs?: number;
  uvwLbs?: number;
  cccLbs?: number;
  exteriorHeightIn?: number;
  exteriorWidthIn?: number;
  overallLengthIn?: number;
  mpgHighwayEst?: number;
}

export const RV_DATA: Record<string, Record<string, RVSpec>> = {
  Newmar: {
    Essex: {
      type: "Class A Diesel",
      floorplans: ["4551", "4544", "4534", "4519", "4561"],
      floorplansByYear: {
        "2012": ["4551", "4544", "4534"],
        "2013": ["4551", "4544", "4534"],
        "2014": ["4551", "4544", "4534"],
        "2015": ["4551", "4544", "4534"],
        "2016": ["4551", "4544", "4534"],
        "2017": ["4551", "4544", "4534", "4519"],
        "2018": ["4551", "4544", "4534", "4519"],
        "2019": ["4551", "4544", "4534", "4519"],
        "2020": ["4551", "4544", "4534", "4519"],
        "2021": ["4551", "4544", "4534", "4519"],
        "2022": ["4551", "4544", "4534", "4519", "4561"],
        "2023": ["4551", "4544", "4534", "4519", "4561"],
        "2024": ["4551", "4544", "4534", "4519", "4561"],
        "2025": ["4551", "4544", "4534", "4561"],
        "2026": ["4551", "4544", "4534", "4561"],
        "2027": ["4551", "4544", "4534", "4561"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        54000,
        62000
      ],
      slideouts: 5,
      sleeps: 4,
      msrpRange: [
        899000,
        1350000
      ],
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 110,
      grayWater: 62,
      blackWater: 58,
      fuelCapacityGal: 150,
      generator: "Onan 12.5kW Quiet Diesel",
      awningLength: 24,
      ceilingHeight: 86,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Newmar Essex — limited-production flagship diesel on Spartan K3 with Cummins X15 605. Hand-built residential interiors; the coach other high-line units are judged against.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2018,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Spartan K3"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3",
          transmission: "Allison 4000 MH"
        }
      ]
    },
    "King Aire": {
      type: "Class A Diesel",
      floorplans: ["45AHQ", "45IQH", "4531", "45RBQ", "4553", "42AQHP"],
      floorplansByYear: {
        "2005": ["45AHQ", "45IQH", "4531"],
        "2006": ["45AHQ", "45IQH", "4531"],
        "2007": ["45AHQ", "45IQH", "4531"],
        "2008": ["45AHQ", "45IQH", "4531"],
        "2009": ["45AHQ", "45IQH", "4531"],
        "2010": ["45AHQ", "45IQH", "4531"],
        "2011": ["45AHQ", "45IQH", "4531"],
        "2012": ["45AHQ", "45IQH", "4531"],
        "2013": ["45AHQ", "45IQH", "4531"],
        "2014": ["45AHQ", "45IQH", "4531"],
        "2015": ["45AHQ", "45IQH", "4531"],
        "2016": ["45AHQ", "45IQH", "4531"],
        "2017": ["45AHQ", "45IQH", "45RBQ", "4531"],
        "2018": ["45AHQ", "45IQH", "45RBQ", "4531", "4553"],
        "2019": ["45AHQ", "45IQH", "45RBQ", "42AQHP", "4531"],
        "2020": ["45AHQ", "45IQH", "45RBQ", "42AQHP", "4553"],
        "2021": ["45AHQ", "45IQH", "45RBQ", "4531", "4553"],
        "2022": ["45AHQ", "45IQH", "45RBQ", "4531", "4553"],
        "2023": ["45AHQ", "45IQH", "45RBQ", "4553"],
        "2024": ["45AHQ", "45IQH", "45RBQ", "4553"],
        "2025": ["45AHQ", "45IQH", "45RBQ"],
        "2026": ["45AHQ", "45IQH", "45RBQ"],
        "2027": ["45AHQ", "45IQH", "45RBQ"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        50000,
        58000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        699000,
        1100000
      ],
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 105,
      grayWater: 55,
      blackWater: 52,
      fuelCapacityGal: 150,
      generator: "Onan 10–12.5kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Newmar King Aire — ultra-luxury diesel under Essex. Spartan K3 + Cummins X15 605 class power on recent years.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan K3",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Spartan K3"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          chassis: "Spartan K3"
        },
        
      ]
    },
    "Mountain Aire": {
      type: "Class A Diesel",
      floorplans: ["4536", "4553", "4304", "4526", "4118", "4546", "4574", "4536PBD"],
      floorplansByYear: {
        "2008": ["4536", "4553", "4304"],
        "2009": ["4536", "4553", "4304"],
        "2010": ["4536", "4553", "4304"],
        "2011": ["4536", "4553", "4304"],
        "2012": ["4536", "4553", "4304"],
        "2013": ["4536", "4553", "4304"],
        "2014": ["4536", "4553", "4304"],
        "2015": ["4536", "4553", "4304"],
        "2016": ["4536", "4553", "4304"],
        "2017": ["4526", "4553", "4304", "4118"],
        "2018": ["4526", "4553", "4546", "4304"],
        "2019": ["4526", "4553", "4546", "4574"],
        "2020": ["4526", "4553", "4546", "4574", "4536PBD"],
        "2021": ["4526", "4553", "4546", "4574"],
        "2022": ["4526", "4553", "4546", "4574", "4118"],
        "2023": ["4526", "4553", "4546", "4574"],
        "2024": ["4526", "4553", "4546", "4574"],
        "2025": ["4526", "4553", "4574"],
        "2026": ["4526", "4553", "4574"],
        "2027": ["4526", "4553", "4574"]
      },
      lengthRange: [
        41,
        45
      ],
      weightRange: [
        42000,
        52000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        449000,
        699000
      ],
      engine: "Cummins L9 450HP / X12 500HP (by year/option)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan K3 / Freightliner (by year)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2008,
      description: "Newmar Mountain Aire — high-line diesel between Dutch Star and King Aire. L9 450 standard; higher options on select years.",
      powertrainByYear: [
        {
          from: 2008,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan K3 / Freightliner (by year)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3 / Freightliner (by year)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 450HP / X12 500HP option",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        
      ]
    },
    "Dutch Star": {
      type: "Class A Diesel",
      floorplans: ["4018", "4081", "4369", "4311", "4052", "3717", "4326", "4543"],
      floorplansByYear: {
        "2005": ["4018", "4081", "4369"],
        "2006": ["4018", "4081", "4369"],
        "2007": ["4018", "4081", "4369"],
        "2008": ["4018", "4081", "4369"],
        "2009": ["4018", "4081", "4369", "4311"],
        "2010": ["4018", "4081", "4369", "4311"],
        "2011": ["4018", "4081", "4369", "4311"],
        "2012": ["4018", "4081", "4369", "4311"],
        "2013": ["4018", "4081", "4369", "4311"],
        "2014": ["4018", "4081", "4369", "4311"],
        "2015": ["4018", "4081", "4369", "4311"],
        "2016": ["4018", "4081", "4369", "4311"],
        "2017": ["4018", "4081", "4369", "4311", "4052"],
        "2018": ["4081", "4369", "4311", "4052", "3717"],
        "2019": ["4081", "4369", "4311", "4052", "4326"],
        "2020": ["4081", "4369", "4311", "4052", "4326", "4543"],
        "2021": ["4081", "4369", "4311", "4052", "4326"],
        "2022": ["4081", "4369", "4311", "4052", "4543"],
        "2023": ["4081", "4369", "4311", "4052"],
        "2024": ["4081", "4369", "4311", "4052"],
        "2025": ["4081", "4369", "4311"],
        "2026": ["3836", "4081", "4311", "4325", "4340", "4369"],
        "2027": ["3836", "4081", "4311", "4325", "4340", "4345", "4369"]
      },
      lengthRange: [
        37,
        45
      ],
      weightRange: [
        36000,
        48000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        349000,
        549000
      ],
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner XC-Series (Spartan optional some years)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 8–10kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Newmar Dutch Star — volume high-line diesel. Typical late-model power is Cummins L9 450 on Freightliner XC; confirm Spartan option on unit.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC-Series (Spartan optional some years)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series (Spartan optional some years)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISL / L9 450HP",
          horsepower: 450,
          chassis: "Freightliner XC"
        },
        {
          from: 2019,
          to: 2027,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner XCR (38') / Freightliner or Spartan K2 tag (40'+)",
          transmission: "Allison 3000 MH",
          notes: "OEM 2027 Dutch Star: 450 HP / 1,250. Floorplans include 3836, 4081, 4311, 4325, 4340, 4345, 4369.",
        },
        
      ]
    },
    "New Aire": {
      type: "Class A Diesel",
      floorplans: ["3543", "3545", "3831", "3836", "3843", "3943"],
      floorplansByYear: {
        "2014": ["3543", "3545", "3831"],
        "2015": ["3543", "3545", "3831"],
        "2016": ["3543", "3545", "3831"],
        "2017": ["3543", "3545", "3831", "3836"],
        "2018": ["3543", "3545", "3831", "3836", "3843"],
        "2019": ["3543", "3831", "3836", "3843", "3943"],
        "2020": ["3543", "3831", "3836", "3843", "3943"],
        "2021": ["3543", "3831", "3843", "3943"],
        "2022": ["3543", "3831", "3843", "3943"],
        "2023": ["3543", "3831", "3843", "3943"],
        "2024": ["3543", "3831", "3843", "3943"],
        "2025": ["3543", "3843", "3943"],
        "2026": ["3543", "3843", "3943"],
        "2027": ["3543"]
      },
      lengthRange: [
        35,
        40
      ],
      weightRange: [
        30000,
        40000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        289000,
        449000
      ],
      engine: "Cummins L9 450HP (early years B6.7 360)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner / Spartan K2 (by option)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description:
        "Newmar New Aire — compact luxury diesel. Early years: Cummins B6.7 / ISB 360 HP / 800 lb-ft. Later years moved to Cummins L-series ~450 HP / 1,250 on Freightliner or Spartan. Year-band required — never force B6.7 on a modern L9 coach.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2018,
          engine: "Cummins B6.7 / ISB 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCS (side radiator era)",
          transmission: "Allison 3000 MH",
          notes: "Launch New Aire — ISB/B6.7 360/800",
        },
        {
          from: 2019,
          to: 2021,
          engine: "Cummins B6.7 360HP or L9 (by build)",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner / Spartan (by option)",
          transmission: "Allison 3000 MH",
          notes: "Transition years — confirm build sheet (B6.7 vs L9)",
        },
        {
          from: 2022,
          to: 2027,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner / Spartan K2 (by option)",
          transmission: "Allison 3000 MH",
          notes:
            "Recent New Aire OEM marketing: L diesel ~450 HP / 1,250 — not B6.7 360",
        },
      ],
    },
    Ventana: {
      type: "Class A Diesel",
      floorplans: ["3407","3412","3436","3709","3717","3512","3809","4037","4041","4068","4310","4326","4328","4334","4340","4345","4369"],
      floorplansByYear: {
        "2006": ["3436","3717","4037"],"2007": ["3436","3717","4037"],"2008": ["3436","3717","4037"],
        "2009": ["3436","3717","4037"],"2010": ["3436","3717","4037"],"2011": ["3436","3717","4037"],
        "2012": ["3436","3717","4037"],"2013": ["3436","3717","4037"],"2014": ["3436","3717","4037"],
        "2015": ["3436","3717","4037"],"2016": ["3436","3717","4037"],"2017": ["3436","3717","4037","4041"],
        "2018": ["3436","3717","4037","4041","4369"],"2019": ["3717","4037","4041","4369","4310"],
        "2020": ["3717","4037","4041","4369","4310"],
        "2021": ["3407","3412","3709","3717","4037","4041","4068","4310","4369"],
        "2022": ["3407","3412","3709","3717","4037","4041","4068","4310","4326","4328","4334","4369"],
        "2023": ["3407","3412","3709","3717","4037","4068","4310","4326","4328","4334","4369"],
        "2024": ["3717","4037","4041"],"2025": ["3717","4037"],"2026": ["3717","4037"],
        "2027": ["3512","3809","4037","4340","4345","4369"]
      },
      lengthRange: [34, 44], weightRange: [30000, 45600], slideouts: 3, sleeps: 6,
      msrpRange: [279000, 489000],
      engine: "Cummins B6.7 360HP or L9 400HP (by floorplan length)",
      horsepower: 360, torqueLbFt: 800,
      chassis: "Freightliner XCR / Spartan K2 (by option)",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.5,
      image: RV_CARD_IMAGE, towingCapacity: 10000, freshWater: 90, grayWater: 50, blackWater: 45,
      fuelCapacityGal: 100, generator: "Onan 8kW Diesel QD", awningLength: 18, ceilingHeight: 84,
      founded: 1968, warrantyYears: 2, yearStart: 2006,
      description: "Newmar Ventana — 34–37 ft B6.7 360/800; 40–43 (4369) L9 400/1250 tag. 2027 short L9 380; 40+ L9 400. 4331 is not a real code.",
      powertrainByYear: [
        { from: 2006, to: 2009, engine: "Cummins ISL / ISB diesel (era)", horsepower: 350, torqueLbFt: 1000, chassis: "Freightliner XC-Series", transmission: "Allison 3000 MH" },
        { from: 2010, to: 2015, engine: "Cummins ISB / ISL diesel (era)", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XC-Series", transmission: "Allison 3000 MH" },
        { from: 2016, to: 2019, engine: "Cummins B6.7 360HP (longer plans may differ)", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XC / Spartan (by option)", transmission: "Allison 3000 MH" },
        { from: 2020, to: 2026, floorplans: ["3407","3412","3436","3709","3717","34","35","36","37"], engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR / Spartan K2", transmission: "Allison 3000 MH", notes: "34–37 B6.7 360/800" },
        { from: 2020, to: 2026, floorplans: ["4037","4041","4068","4310","4326","4328","4334","4369","40","41","42","43"], engine: "Cummins L9 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag / Spartan K2 Tag", transmission: "Allison 3000 MH", fuelCapacityGal: 100, towingCapacity: 15000, notes: "40–43 L9 400/1250 including 4369" },
        { from: 2020, to: 2026, engine: "Cummins B6.7 360HP or L9 400HP (by floorplan length)", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR / Spartan K2", transmission: "Allison 3000 MH" },
        { from: 2027, to: 2027, floorplans: ["3512","3809","35","38"], engine: "Cummins L9 380HP", horsepower: 380, torqueLbFt: 1150, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2027, to: 2027, floorplans: ["4037","4340","4345","4369","40","43"], engine: "Cummins L9 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner Custom / Spartan K2 Tag", transmission: "Allison 3000 MH" },
      ],
    },
    "Ventana LE": {
      type: "Class A Diesel",
      floorplans: ["3412","3436","3709","3850","4002","4037"],
      floorplansByYear: {
        "2012": ["3436","3709","3850"],"2013": ["3436","3709","3850","4037"],
        "2014": ["3436","3709","3850","4037"],"2015": ["3436","3709","3850","4002","4037"],
        "2016": ["3436","3709","4002","4037"],"2017": ["3436","3709","4002","4037"],
        "2018": ["3436","3709","4002","4037"],"2019": ["3436","3709","4037"]
      },
      lengthRange: [34, 40], weightRange: [26000, 34000], slideouts: 3, sleeps: 6,
      msrpRange: [189000, 289000],
      engine: "Cummins ISB 6.7L 340–360HP (by length)",
      horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR (no tag on most LE)",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.35,
      image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 80, grayWater: 50, blackWater: 40,
      fuelCapacityGal: 90, generator: "Onan 8kW Diesel QD", awningLength: 16, ceilingHeight: 84,
      founded: 1968, warrantyYears: 2, yearStart: 2012, yearEnd: 2019,
      description: "Newmar Ventana LE (2012–2019). ISB 340 short / 360 on 40'. Not L9 400.",
      powertrainByYear: [
        { from: 2012, to: 2019, floorplans: ["3412","3436","3709","3850","34","35","36","37","38"], engine: "Cummins ISB 6.7L 340HP", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000 },
        { from: 2012, to: 2019, floorplans: ["4002","4037","40"], engine: "Cummins ISB 6.7L 360HP", horsepower: 360, torqueLbFt: 1000, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000 },
        { from: 2012, to: 2019, engine: "Cummins ISB 6.7L 340–360HP (by length)", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
      ],
    },
    "Northern Star": {
      type: "Class A Diesel", floorplans: ["3418","3709","4011","4037"],
      floorplansByYear: { "2026": ["3418","3709","4011","4037"], "2027": ["3418","3709","4011","4037"] },
      lengthRange: [34, 40], weightRange: [28000, 36000], slideouts: 3, sleeps: 6, msrpRange: [399000, 489000],
      engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner Custom Chassis",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.45, image: RV_CARD_IMAGE,
      towingCapacity: 10000, freshWater: 80, grayWater: 50, blackWater: 40, fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD", awningLength: 16, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Northern Star — 2026+ diesel pusher, 360/800, 34–40 ft.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner Custom Chassis", transmission: "Allison 3000 MH" }],
    },
    "Grand Star": {
      type: "Super C", floorplans: ["3444","3940","3948"],
      floorplansByYear: { "2026": ["3444","3940","3948"], "2027": ["3444","3940","3948"] },
      lengthRange: [34, 39], weightRange: [26000, 32000], slideouts: 3, sleeps: 8, msrpRange: [365000, 430000],
      engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner S2RV",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.5, image: RV_CARD_IMAGE,
      towingCapacity: 12000, freshWater: 72, grayWater: 51, blackWater: 50, fuelCapacityGal: 100,
      generator: "Onan 8,000W Quiet Diesel", awningLength: 16, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Grand Star — S2RV Super C, Cummins B 360/800, hitch 12k. 3444/3940/3948.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner S2RV", transmission: "Allison 3000 MH", towingCapacity: 12000 }],
    },
    "Super Star": {
      type: "Super C", floorplans: ["3731","4040","4059","4140","4159"],
      floorplansByYear: { "2026": ["3731","4040","4059","4140","4159"], "2027": ["3731","4040","4059","4140","4159"] },
      lengthRange: [37, 41], weightRange: [30000, 38000], slideouts: 3, sleeps: 8, msrpRange: [499000, 620000],
      engine: "Cummins 360HP (M2-106) or 450HP (M2-112)", horsepower: 360, torqueLbFt: 1150,
      chassis: "Freightliner M2-106 / M2-112 (by length)", transmission: "Allison automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.55, image: RV_CARD_IMAGE, towingCapacity: 20000, freshWater: 80, grayWater: 55, blackWater: 45,
      fuelCapacityGal: 100, generator: "Onan 8,000W diesel", awningLength: 18, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Super Star — M2 Super C. 37–40 ft 360 HP; 41 ft 450 HP.",
      powertrainByYear: [
        { from: 2026, to: 2027, floorplans: ["3731","4040","4059","37","40"], engine: "Cummins 360HP (Freightliner M2-106)", horsepower: 360, torqueLbFt: 1150, chassis: "Freightliner M2-106", towingCapacity: 20000 },
        { from: 2026, to: 2027, floorplans: ["4140","4159","41"], engine: "Cummins 450HP (Freightliner M2-112)", horsepower: 450, torqueLbFt: 1250, chassis: "Freightliner M2-112", towingCapacity: 20000 },
        { from: 2026, to: 2027, engine: "Cummins 360HP (M2-106) or 450HP (M2-112)", horsepower: 360, torqueLbFt: 1150, chassis: "Freightliner M2" },
      ],
    },
    "Supreme Aire": {
      type: "Super C", floorplans: ["3827","4129","4341","4505","4540"],
      floorplansByYear: { "2026": ["3827","4129","4341","4505","4540"], "2027": ["3827","4129","4341","4505","4540"] },
      lengthRange: [38, 45], weightRange: [36000, 52000], slideouts: 4, sleeps: 6, msrpRange: [660000, 890000],
      engine: "Detroit DD13 525HP or DD16 600HP (by length)", horsepower: 525, torqueLbFt: 1850,
      chassis: "Freightliner Cascadia (single or tandem)", transmission: "12-speed automated manual", fuelType: "Diesel",
      recalls: 0, rating: 4.7, image: RV_CARD_IMAGE, towingCapacity: 20000, freshWater: 100, grayWater: 70, blackWater: 40,
      fuelCapacityGal: 120, generator: "Onan diesel", awningLength: 20, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Supreme Aire — Cascadia Super C. 38–41 525 HP; 43–45 600 HP.",
      powertrainByYear: [
        { from: 2026, to: 2027, floorplans: ["3827","4129","38","41"], engine: "Detroit DD13 525HP", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia single axle", towingCapacity: 20000 },
        { from: 2026, to: 2027, floorplans: ["4341","4505","4540","43","45"], engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia tandem axle", towingCapacity: 30000 },
        { from: 2026, to: 2027, engine: "Detroit DD13 525HP or DD16 600HP (by length)", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia" },
      ],
    },
    "Summit Aire": {
      type: "Super C", floorplans: ["4505"],
      floorplansByYear: { "2026": ["4505"], "2027": ["4505"] },
      lengthRange: [45, 45], weightRange: [45000, 54000], slideouts: 4, sleeps: 5, msrpRange: [850000, 1100000],
      engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126 tandem axle",
      transmission: "12-speed automated manual", fuelType: "Diesel", recalls: 0, rating: 4.75, image: RV_CARD_IMAGE,
      towingCapacity: 30000, freshWater: 100, grayWater: 70, blackWater: 40, fuelCapacityGal: 120,
      generator: "Onan diesel", awningLength: 20, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Summit Aire — flagship Super C, Cascadia 126, DD16 600/1850, hitch 30k.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126 tandem axle", towingCapacity: 30000 }],
    },
    "Freedom Aire": {
      type: "Class C", floorplans: ["2515"],
      floorplansByYear: { "2026": ["2515"], "2027": ["2515"] },
      lengthRange: [25, 25], weightRange: [11000, 12500], slideouts: 1, sleeps: 4, msrpRange: [289000, 360000],
      engine: "Mercedes-Benz 2.0L turbo diesel 208HP", horsepower: 208, torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 4500", transmission: "9-speed automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.4, image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 31, grayWater: 28, blackWater: 16,
      fuelCapacityGal: 24, generator: "Onan / chassis-dependent", awningLength: 14, ceilingHeight: 80, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Freedom Aire — Sprinter 4500 Class C, 208/332, floorplan 2515.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Mercedes-Benz 2.0L turbo diesel 208HP", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500" }],
    },
    "Canyon Star": {
      type: "Super C",
      floorplans: ["3710", "3927", "3947", "3713", "3921"],
      floorplansByYear: {
        "2010": ["3710", "3927"],
        "2011": ["3710", "3927"],
        "2012": ["3710", "3927"],
        "2013": ["3710", "3927"],
        "2014": ["3710", "3927"],
        "2015": ["3710", "3927"],
        "2016": ["3710", "3927"],
        "2017": ["3710", "3927", "3947"],
        "2018": ["3710", "3713", "3927", "3947"],
        "2019": ["3713", "3927", "3947", "3921"],
        "2020": ["3713", "3927", "3947", "3921"],
        "2021": ["3713", "3927", "3947", "3921"],
        "2022": ["3713", "3927", "3947", "3921"],
        "2023": ["3713", "3927", "3947"],
        "2024": ["3713", "3927", "3947"],
        "2025": ["3713", "3927"],
        "2026": ["3713", "3927"]
      },
      lengthRange: [
        37,
        40
      ],
      weightRange: [
        26000,
        34000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        399000
      ],
      engine: "Ford Power Stroke 6.7L / Cummins (by chassis year)",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Freightliner / Ford Super Duty Super C platform",
      transmission: "Allison / TorqShift",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 80,
      grayWater: 50,
      blackWater: 40,
      fuelCapacityGal: 80,
      generator: "Onan 8kW",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Newmar Canyon Star — Super C / raised-rail diesel. Strong tow ratings; verify exact chassis/engine on the build sheet.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2020,
          engine: "Cummins ISB-class / Super C diesel",
          horsepower: 340,
          chassis: "Freightliner Super C"
        },
        {
          from: 2021,
          to: 2026,
          engine: "Ford Power Stroke 6.7L or Cummins Super C diesel",
          horsepower: 330,
          chassis: "Super C platform"
        }
      ]
    },
    "London Aire": {
      type: "Class A Diesel",
      floorplans: ["4551", "4533", "4561"],
      floorplansByYear: {
        "2005": ["4551", "4533", "4561"],
        "2006": ["4551", "4533", "4561"],
        "2007": ["4551", "4533", "4561"],
        "2008": ["4551", "4533", "4561"],
        "2009": ["4551", "4533", "4561"],
        "2010": ["4551", "4533", "4561"],
        "2011": ["4551", "4533", "4561"],
        "2012": ["4551", "4533", "4561"],
        "2013": ["4551", "4533", "4561"],
        "2014": ["4551", "4533", "4561"],
        "2015": ["4551", "4533", "4561"],
        "2016": ["4551", "4533", "4561"],
        "2017": ["4551", "4533", "4561"],
        "2018": ["4551", "4533"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        52000,
        60000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        650000,
        950000
      ],
      engine: "Cummins ISX 600HP",
      horsepower: 600,
      chassis: "Spartan K3",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 105,
      grayWater: 55,
      blackWater: 50,
      generator: "Onan 12.5kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2000,
      yearEnd: 2018,
      description: "Newmar London Aire — discontinued ultra-luxury line (succeeded in market position by King Aire/Essex).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan K3",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Spartan K3"
        },
        
      ]
    },
    "Kountry Star": {
      type: "Class A Diesel",
      floorplans: ["3712", "3910", "4005", "3709PK", "3221", "3412", "4011", "4037"],
      floorplansByYear: {
        "2005": ["3712", "3910", "4005"],
        "2006": ["3712", "3910", "4005"],
        "2007": ["3712", "3910", "4005"],
        "2008": ["3712", "3910", "4005"],
        "2009": ["3712", "3910", "4005"],
        "2010": ["3712", "3910", "4005"],
        "2011": ["3712", "3910", "4005"],
        "2012": ["3712", "3910", "4005"],
        "2013": ["3712", "3910", "4005"],
        "2014": ["3712", "3910", "4005"],
        "2015": ["3712", "3910", "4005"],
        "2016": ["3712", "3910", "4005"],
        "2017": ["3712", "3910", "4005", "3709PK"],
        "2018": ["3712", "3910", "4005", "3221"],
        "2019": ["3712", "3910", "4005", "3709PK"],
        "2020": ["3712", "3910", "4005", "3412", "4011", "4037"],
        "2021": ["3712", "3910", "4005", "3412", "4011", "4037"],
        "2022": ["3712", "3910", "4005", "3412", "4011", "4037"],
        "2023": ["3712", "3910", "3412", "4011", "4037"],
        "2024": ["3712", "3910", "3412", "4011", "4037"],
        "2025": ["3712", "3910", "3412", "4011", "4037"],
        "2026": ["3712", "3910", "3412", "4011", "4037"]
      },
      lengthRange: [
        32,
        40
      ],
      weightRange: [
        18000,
        26000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        289000,
        449000
      ],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner XCR",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 105,
      grayWater: 65,
      blackWater: 45,
      fuelCapacityGal: 100,
      generator: "Cummins Onan 8kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2000,
      description:
        "Newmar Kountry Star — entry diesel pusher Class A (not gas). Modern coaches use Freightliner XCR + Cummins B6.7 360 HP / 800 lb-ft. Bay Star is Newmar’s gas F-53 line; do not confuse the two.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2011,
          engine: "Cummins ISB / Cat turbodiesel (by build)",
          horsepower: 300,
          chassis: "Freightliner / Spartan (by option)",
          transmission: "Allison 3000 MH",
          notes:
            "Earlier KS diesel pushers; rare gas F53 builds existed in the early 2000s — verify VIN/build sheet"
        },
        {
          from: 2012,
          to: 2019,
          engine: "Cummins ISB / B6.7 diesel ~300–360HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC / XCR",
          transmission: "Allison 3000 MH",
          notes: "Mid-diesel pusher era — not L9 450 flagship, not Ford F53 gas"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCR",
          transmission: "Allison 3000 MH",
          notes:
            "OEM brochure: Freightliner XCR + Cummins B6.7 360 HP @ 2600 rpm / 800 lb-ft — not 7.3 Godzilla (Bay Star) and not L9 450 (Dutch Star class)"
        }
      ]
    },
    "Bay Star": {
      type: "Class A Gas",
      floorplans: ["3124", "3401", "3626", "3629", "3014", "3811"],
      floorplansByYear: {
        "2005": ["3124", "3401", "3626"],
        "2006": ["3124", "3401", "3626"],
        "2007": ["3124", "3401", "3626"],
        "2008": ["3124", "3401", "3626"],
        "2009": ["3124", "3401", "3626"],
        "2010": ["3124", "3401", "3626"],
        "2011": ["3124", "3401", "3626"],
        "2012": ["3124", "3401", "3626"],
        "2013": ["3124", "3401", "3626"],
        "2014": ["3124", "3401", "3626"],
        "2015": ["3124", "3401", "3626"],
        "2016": ["3124", "3401", "3626"],
        "2017": ["3124", "3401", "3626", "3629"],
        "2018": ["3124", "3401", "3626", "3629", "3014"],
        "2019": ["3124", "3401", "3626", "3629", "3811"],
        "2020": ["3124", "3401", "3626", "3629", "3811"],
        "2021": ["3124", "3626", "3629", "3811"],
        "2022": ["3124", "3626", "3629", "3811"],
        "2023": ["3124", "3626", "3629"],
        "2024": ["3124", "3626", "3629"],
        "2025": ["3124", "3626"],
        "2026": ["3124", "3626"]
      },
      lengthRange: [
        30,
        38
      ],
      weightRange: [
        16000,
        24000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        169000,
        269000
      ],
      engine: "Ford 7.3L Godzilla / V10 6.8L (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      fuelCapacityGal: 80,
      generator: "Onan 5500W Gas",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Newmar Bay Star — mainstream gas Class A. Newer years Ford 7.3L F53.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "OEM Bay Star: F53 7.3 335/468"
        }
      ]
    },
    "Bay Star Sport": {
      type: "Class A Gas",
      floorplans: ["2702", "2903", "3014", "3307"],
      floorplansByYear: {
        "2010": ["2702", "2903", "3014"],
        "2011": ["2702", "2903", "3014"],
        "2012": ["2702", "2903", "3014"],
        "2013": ["2702", "2903", "3014"],
        "2014": ["2702", "2903", "3014"],
        "2015": ["2702", "2903", "3014"],
        "2016": ["2702", "2903", "3014"],
        "2017": ["2702", "2903", "3014", "3307"],
        "2018": ["2702", "2903", "3014", "3307"],
        "2019": ["2702", "2903", "3307"],
        "2020": ["2702", "2903", "3307"],
        "2021": ["2702", "2903", "3307"],
        "2022": ["2702", "2903", "3307"],
        "2023": ["2702", "2903"],
        "2024": ["2702", "2903"],
        "2025": ["2702", "2903"],
        "2026": ["2702", "2903"]
      },
      lengthRange: [
        27,
        33
      ],
      weightRange: [
        14000,
        20000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149000,
        229000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 35,
      blackWater: 35,
      generator: "Onan 4000–5500W Gas",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Newmar Bay Star Sport — shorter gas Class A entry line.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    }
  },
  Tiffin: {
    Zephyr: {
      type: "Class A Diesel",
      floorplans: ["45NZ", "45FZ", "45PZ", "45QZ", "45AZ"],
      floorplansByYear: {
        "2005": ["45NZ", "45FZ"],
        "2006": ["45NZ", "45FZ"],
        "2007": ["45NZ", "45FZ"],
        "2008": ["45NZ", "45FZ"],
        "2009": ["45NZ", "45FZ"],
        "2010": ["45NZ", "45FZ"],
        "2011": ["45NZ", "45FZ"],
        "2012": ["45NZ", "45FZ"],
        "2013": ["45NZ", "45FZ"],
        "2014": ["45NZ", "45FZ"],
        "2015": ["45NZ", "45FZ"],
        "2016": ["45NZ", "45FZ"],
        "2017": ["45NZ", "45FZ", "45PZ"],
        "2018": ["45NZ", "45FZ", "45PZ", "45QZ"],
        "2019": ["45NZ", "45FZ", "45PZ", "45QZ"],
        "2020": ["45NZ", "45FZ", "45PZ", "45AZ"],
        "2021": ["45NZ", "45FZ", "45PZ", "45AZ"],
        "2022": ["45NZ", "45FZ", "45PZ", "45AZ"],
        "2023": ["45NZ", "45FZ", "45PZ"],
        "2024": ["45NZ", "45FZ", "45PZ"],
        "2025": ["45NZ", "45FZ"],
        "2026": ["45NZ", "45FZ"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        50000,
        58000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        699000,
        1100000
      ],
      engine: "Cummins X12 / X15 500–605HP",
      horsepower: 500,
      torqueLbFt: 1700,
      chassis: "Tiffin PowerGlide",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      fuelCapacityGal: 150,
      generator: "Onan 10–12.5kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Tiffin Zephyr — flagship diesel on PowerGlide. Top powertrain options X12/X15 class; verify exact engine on build sheet.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Tiffin PowerGlide",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Tiffin PowerGlide",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISX / X15 600HP class",
          horsepower: 600,
          chassis: "Tiffin PowerGlide"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins X12 / X15 500–605HP",
          horsepower: 500,
          chassis: "Tiffin PowerGlide"
        },
        
      ]
    },
    "Allegro Bus": {
      type: "Class A Diesel",
      floorplans: ["37AP", "40AP", "45LP", "45OPP", "45CP", "37TS", "40IP", "45BQ"],
      floorplansByYear: {
        "2005": ["37AP", "40AP", "45LP"],
        "2006": ["37AP", "40AP", "45LP"],
        "2007": ["37AP", "40AP", "45LP"],
        "2008": ["37AP", "40AP", "45LP"],
        "2009": ["37AP", "40AP", "45LP", "45OPP"],
        "2010": ["37AP", "40AP", "45LP", "45OPP"],
        "2011": ["37AP", "40AP", "45LP", "45OPP"],
        "2012": ["37AP", "40AP", "45LP", "45OPP"],
        "2013": ["37AP", "40AP", "45LP", "45OPP"],
        "2014": ["37AP", "40AP", "45LP", "45OPP"],
        "2015": ["37AP", "40AP", "45LP", "45OPP"],
        "2016": ["37AP", "40AP", "45LP", "45OPP"],
        "2017": ["37AP", "40AP", "45LP", "45OPP", "45CP"],
        "2018": ["37TS", "40AP", "40IP", "45LP", "45OPP"],
        "2019": ["37TS", "40AP", "40IP", "45LP", "45OPP", "45CP"],
        "2020": ["37TS", "40AP", "40IP", "45LP", "45OPP", "45BQ"],
        "2021": ["37TS", "40AP", "40IP", "45LP", "45OPP", "45CP", "45BQ"],
        "2022": ["37TS", "40AP", "40IP", "45LP", "45OPP", "45CP"],
        "2023": ["37TS", "40AP", "45LP", "45OPP", "45CP"],
        "2024": ["37TS", "40AP", "45LP", "45OPP"],
        "2025": ["37TS", "40AP", "45LP", "45OPP"],
        "2026": ["37TS", "40AP", "45LP", "45OPP"]
      },
      lengthRange: [
        37,
        45
      ],
      weightRange: [
        40000,
        52000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        449000,
        699000
      ],
      engine: "Cummins L9 450HP (X12/X15 options by year)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Tiffin PowerGlide",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Tiffin Allegro Bus — PowerGlide high-line diesel. Standard L9 450 on many recent years; higher HP optional. 45OPP is a floorplan of Allegro Bus, not a separate brand.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Tiffin PowerGlide",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Tiffin PowerGlide",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISL / L9 450HP",
          horsepower: 450,
          chassis: "Tiffin PowerGlide"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins L9 450HP (X12 optional)",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH"
        },
        
      ]
    },
    "Allegro Bus 45OPP": {
      type: "Class A Diesel",
      floorplans: ["45OPP"],
      floorplansByYear: {
        "2012": ["45OPP"],
        "2013": ["45OPP"],
        "2014": ["45OPP"],
        "2015": ["45OPP"],
        "2016": ["45OPP"],
        "2017": ["45OPP"],
        "2018": ["45OPP"],
        "2019": ["45OPP"],
        "2020": ["45OPP"],
        "2021": ["45OPP"],
        "2022": ["45OPP"],
        "2023": ["45OPP"],
        "2024": ["45OPP"],
        "2025": ["45OPP"],
        "2026": ["45OPP"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        48000,
        56000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        480000,
        720000
      ],
      engine: "Cummins L9 450HP (X12 optional)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Tiffin PowerGlide",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Allegro Bus 45OPP floorplan entry — same PowerGlide L9 platform as Allegro Bus. Prefer searching Allegro Bus + floorplan 45OPP.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Tiffin PowerGlide",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Tiffin PowerGlide"
        },
        
      ]
    },
    Phaeton: {
      type: "Class A Diesel",
      floorplans: [
        "36GH",
        "37BH",
        "40AH",
        "40IH",
        "40QBH",
        "40QKH",
        "44OH",
        "45OH",
      ],
      floorplansByYear: {
        "2005": ["36GH", "40AH", "40IH"],
        "2006": ["36GH", "40AH", "40IH"],
        "2007": ["36GH", "40AH", "40IH"],
        "2008": ["36GH", "40AH", "40IH"],
        "2009": ["36GH", "40AH", "40IH", "44OH"],
        "2010": ["36GH", "40AH", "40IH", "44OH"],
        "2011": ["36GH", "40AH", "40IH", "44OH"],
        "2012": ["36GH", "40AH", "40IH", "44OH"],
        "2013": ["36GH", "40AH", "40IH", "44OH"],
        "2014": ["36GH", "40AH", "40IH", "44OH"],
        "2015": ["36GH", "40AH", "40IH", "44OH"],
        "2016": ["36GH", "40AH", "40IH", "44OH"],
        "2017": ["36GH", "37BH", "40AH", "40IH", "44OH"],
        "2018": ["36GH", "37BH", "40AH", "40IH", "44OH"],
        "2019": ["36GH", "37BH", "40AH", "40IH", "44OH", "45OH"],
        "2020": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH", "45OH"],
        "2021": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH", "45OH"],
        "2022": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        "2023": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        "2024": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        "2025": ["37BH", "40AH", "40IH", "40QBH", "40QKH"],
        "2026": ["37BH", "40AH", "40IH", "40QBH", "40QKH"]
      },
      lengthRange: [
        36,
        45
      ],
      weightRange: [
        36000,
        48000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        349000,
        549000
      ],
      // OEM brochure: Cummins L9; 380 HP / 1,150 standard. 450 only on SELECT floorplans (not 37BH).
      engine: "Cummins L9 380HP",
      horsepower: 380,
      torqueLbFt: 1150,
      chassis: "Freightliner / Tiffin PowerGlide (by option)",
      transmission: "Allison 3000 MH 6-speed",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 66,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10.0 kW diesel (slide-out)",
      awningLength: 18,
      ceilingHeight: 83,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description:
        "Tiffin Phaeton — Class A diesel. OEM: Cummins L9 380 HP / 1,150 lb-ft standard. 450 HP / 1,250 was NOT on every floorplan (e.g. not 37BH). Powertrain is floorplan-specific — use selected plan. Freightliner S / PowerGlide O. Allison 3000 MH.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          torqueLbFt: 1000,
          chassis: "Freightliner / PowerGlide (by option)",
          transmission: "Allison 3000 MH",
          notes: "2005–2009 — confirm ISL/ISB rating on build sheet",
        },
        {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL diesel (era)",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner / PowerGlide (by option)",
          transmission: "Allison 3000 MH",
          notes: "2010–2015 mid/high diesel — confirm HP on build sheet",
        },
        // Floorplan-specific L9 bands (must appear before model-wide for same years)
        {
          from: 2016,
          to: 2026,
          floorplans: ["37BH", "37 BH"],
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes:
            "37BH only — brochure 380/1150. 450 HP was NOT an option on 37BH.",
        },
        {
          from: 2016,
          to: 2026,
          floorplans: ["44OH", "44 OH"],
          engine: "Cummins L9 380HP (450 optional on tag axle)",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes:
            "44OH tag axle — 380 standard; 450/1250 may be available. Confirm build sheet.",
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          generator: "Onan 10.0 kW diesel",
          notes:
            "Default L9 380/1150. 450 only on select floorplans (not 37BH) — requires floorplan match.",
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          freshWater: 90,
          grayWater: 66,
          blackWater: 50,
          ceilingHeight: 83,
          notes:
            "Default L9 380/1150 by floorplan. 450 only where brochure offered it (e.g. some tag-axle) — never invent 450 for 37BH.",
        },
      ],
    },
    "Allegro Red 340": {
      type: "Class A Diesel",
      floorplans: ["33AA", "37BA", "33AL", "37PA", "38KA", "36QSA", "38QBA", "38QRA"],
      floorplansByYear: {
        "2014": ["33AA", "37BA", "33AL"],
        "2015": ["33AA", "37BA", "33AL", "36QSA", "37PA", "38QBA", "38QRA"],
        "2016": ["33AA", "37BA", "33AL"],
        "2017": ["33AA", "37BA", "37PA", "33AL"],
        "2018": ["33AA", "37BA", "37PA", "38KA"],
        "2019": ["33AA", "37BA", "37PA", "38KA"],
        "2020": ["33AA", "37BA", "37PA", "38KA"],
        "2021": ["33AA", "37BA", "38KA"],
        "2022": ["33AA", "37BA", "38KA"],
        "2023": ["33AA", "37BA", "38KA"],
        "2024": ["33AA", "37BA", "38KA"],
        "2025": ["33AA", "37BA"],
        "2026": ["33AA", "37BA"]
      },
      lengthRange: [
        33,
        38
      ],
      weightRange: [
        28000,
        36000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        369000
      ],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner XC-Series",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Tiffin Allegro Red 340 — mid-diesel on Freightliner XC with Cummins B6.7 360 (not PowerGlide / not ISL 8.9 flagship).",
      powertrainByYear: [
        {
          from: 2014,
          to: 2017,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XC / XCR raised-rail",
          transmission: "Allison 3000 MH",
          notes: "2014–2017 RED 340 — mid-diesel only"
        },
        {
          from: 2018,
          to: 2026,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XC-Series",
          transmission: "Allison 3000 MH",
          notes: "RED 340 mid-diesel — not L9/ISL bus class"
        }
      ]
    },
    "Allegro Red 360": {
      type: "Class A Diesel",
      floorplans: ["33AA", "36UA", "37BA", "38KA"],
      floorplansByYear: {
        "2018": ["33AA", "36UA", "37BA"],
        "2019": ["33AA", "36UA", "37BA", "38KA"],
        "2020": ["33AA", "36UA", "37BA", "38KA"],
        "2021": ["33AA", "36UA", "37BA", "38KA"],
        "2022": ["33AA", "36UA", "37BA", "38KA"],
        "2023": ["33AA", "36UA", "37BA"],
        "2024": ["33AA", "36UA", "37BA"],
        "2025": ["33AA", "37BA"],
        "2026": ["33AA", "37BA"]
      },
      lengthRange: [
        33,
        38
      ],
      weightRange: [
        30000,
        38000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        289000,
        429000
      ],
      engine: "Cummins L9 380–450HP",
      horsepower: 380,
      torqueLbFt: 1150,
      chassis: "Freightliner XC / PowerGlide (by year)",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 85,
      grayWater: 50,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Tiffin Allegro Red 360 — stepped-up Red series diesel vs 340. L9-class power.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Cummins L9 380–450HP",
          horsepower: 380,
          chassis: "Freightliner XC / PowerGlide"
        }
      ]
    },
    "Allegro Red": {
      type: "Class A Diesel",
      floorplans: ["33AA", "37BA", "38QBA"],
      floorplansByYear: {
        "2005": ["33AA", "37BA", "38QBA"],
        "2006": ["33AA", "37BA", "38QBA"],
        "2007": ["33AA", "37BA", "38QBA"],
        "2008": ["33AA", "37BA", "38QBA"],
        "2009": ["33AA", "37BA", "38QBA"],
        "2010": ["33AA", "37BA", "38QBA"],
        "2011": ["33AA", "37BA", "38QBA"],
        "2012": ["33AA", "37BA", "38QBA"],
        "2013": ["33AA", "37BA", "38QBA"],
        "2014": ["33AA", "37BA", "38QBA"],
        "2015": ["33AA", "37BA", "38QBA"],
        "2016": ["33AA", "37BA", "38QBA"],
        "2017": ["33AA", "37BA", "38QBA"]
      },
      lengthRange: [
        33,
        38
      ],
      weightRange: [
        26000,
        34000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        199000,
        329000
      ],
      engine: "Cummins ISB 6.7L 360HP",
      horsepower: 360,
      chassis: "Freightliner XC raised-rail",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan 8.0 kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2005,
      yearEnd: 2017,
      description: "Tiffin Allegro RED — diesel Class A pusher (not the gas Allegro Open Road). Nameplate-era RED coaches use Cummins ISB/B6.7 on Freightliner XC; do not apply Ford F53 V10. 2014+ RED 340 continues the same mid-diesel family. Prefer Allegro Red 340/360 for 2018+.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2013,
          engine: "Cummins ISB 6.7L 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC raised-rail",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "Allegro RED diesel pusher — not Ford F53 gas. Confirm exact HP on door sticker."
        },
        {
          from: 2014,
          to: 2017,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XC / XCR raised-rail",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "2014–2017 Allegro RED / RED 340 mid-diesel — not ISL 8.9 / not L9 flagship."
        }
      ],
      torqueLbFt: 800,
      transmission: "Allison 3000 MH",
      fuelCapacityGal: 100
    },
    "Allegro Breeze": {
      type: "Class A Diesel",
      floorplans: ["28BR", "31BR", "32BR"],
      floorplansByYear: {
        "2008": ["28BR", "31BR", "32BR"],
        "2009": ["28BR", "31BR", "32BR"],
        "2010": ["28BR", "31BR", "32BR"],
        "2011": ["28BR", "31BR", "32BR"],
        "2012": ["28BR", "31BR", "32BR"],
        "2013": ["28BR", "31BR", "32BR"],
        "2014": ["28BR", "31BR", "32BR"],
        "2015": ["28BR", "31BR", "32BR"],
        "2016": ["28BR", "31BR", "32BR"],
        "2017": ["28BR", "31BR", "32BR"],
        "2018": ["28BR", "31BR", "32BR"],
        "2019": ["28BR", "31BR", "32BR"],
        "2020": ["28BR", "31BR", "32BR"]
      },
      lengthRange: [
        28,
        33
      ],
      weightRange: [
        24000,
        30000
      ],
      slideouts: 2,
      sleeps: 4,
      msrpRange: [
        219000,
        329000
      ],
      engine: "Cummins ISB / B6.7 340HP",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner XC",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 6–8kW Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2008,
      yearEnd: 2020,
      description: "Tiffin Allegro Breeze — compact diesel Class A. Discontinued; great couples coach in used market.",
      powertrainByYear: [
        {
          from: 2008,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2020,
          engine: "Cummins ISB / B6.7 340HP",
          horsepower: 340,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    "Open Road": {
      type: "Class A Gas",
      floorplans: ["32SA", "34PA", "36LA", "34PR"],
      floorplansByYear: {
        "2010": ["32SA", "34PA", "36LA"],
        "2011": ["32SA", "34PA", "36LA"],
        "2012": ["32SA", "34PA", "36LA"],
        "2013": ["32SA", "34PA", "36LA"],
        "2014": ["32SA", "34PA", "36LA"],
        "2015": ["32SA", "34PA", "36LA"],
        "2016": ["32SA", "34PA", "36LA"],
        "2017": ["32SA", "34PA", "34PR", "36LA"],
        "2018": ["32SA", "34PA", "34PR", "36LA"],
        "2019": ["32SA", "34PA", "34PR", "36LA"],
        "2020": ["32SA", "34PA", "34PR", "36LA"],
        "2021": ["32SA", "34PA", "34PR", "36LA"],
        "2022": ["32SA", "34PA", "34PR", "36LA"],
        "2023": ["32SA", "34PA", "36LA"],
        "2024": ["32SA", "34PA", "36LA"],
        "2025": ["32SA", "34PA"],
        "2026": ["32SA", "34PA"]
      },
      lengthRange: [
        32,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        159000,
        249000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      fuelCapacityGal: 80,
      generator: "Onan 5500W Gas",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Tiffin Open Road (Allegro Open Road) — gas Class A on Ford F53. 7.3L on recent years.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Wayfarer: {
      type: "Class C",
      floorplans: ["24BW", "25RW", "25JW", "25TW", "25PW"],
      floorplansByYear: {
        "2016": ["24BW", "25RW"],
        "2017": ["24BW", "25RW", "25JW"],
        "2018": ["24BW", "25RW", "25JW", "25TW"],
        "2019": ["24BW", "25RW", "25JW", "25TW", "25PW"],
        "2020": ["25RW", "25JW", "25TW", "25PW"],
        "2021": ["25RW", "25JW", "25TW", "25PW"],
        "2022": ["25RW", "25JW", "25TW", "25PW"],
        "2023": ["25RW", "25JW", "25TW"],
        "2024": ["25RW", "25JW", "25TW"],
        "2025": ["25RW", "25JW"],
        "2026": ["25RW", "25JW"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        149000,
        219000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 35,
      grayWater: 28,
      blackWater: 25,
      generator: "Optional Onan / LP",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Tiffin Wayfarer — Sprinter diesel Class C. Engine updates with Sprinter generations (3.0 V6 → later I4 options).",
      powertrainByYear: [
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Wayfarer 25": {
      type: "Class C",
      floorplans: ["25JW", "25RW", "25TW", "25PW"],
      floorplansByYear: {
        "2018": ["25JW", "25RW"],
        "2019": ["25JW", "25RW", "25TW", "25PW"],
        "2020": ["25JW", "25RW", "25TW", "25PW"],
        "2021": ["25JW", "25RW", "25TW", "25PW"],
        "2022": ["25JW", "25RW", "25TW"],
        "2023": ["25JW", "25RW"],
        "2024": ["25JW", "25RW"],
        "2025": ["25JW", "25RW"],
        "2026": ["25JW", "25RW"]
      },
      lengthRange: [
        25,
        26
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        159000,
        229000
      ],
      engine: "Mercedes-Benz turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Wayfarer 25 series floorplan family — use Wayfarer + specific 25xx plan when possible.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Mercedes-Benz Sprinter turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Cahaba: {
      type: "Class C",
      floorplans: ["19 SC", "21 SC"],
      floorplansByYear: {
        "2023": ["19 SC", "21 SC"],
        "2024": ["19 SC", "21 SC"],
        "2025": ["19 SC", "21 SC"],
        "2026": ["19 SC", "21 SC"]
      },
      lengthRange: [
        19,
        22
      ],
      weightRange: [
        9000,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        169000,
        229000
      ],
      engine: "Mercedes-Benz 2.0L turbodiesel",
      horsepower: 208,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Tiffin Cahaba — compact Sprinter Class C/adventure coach.",
      powertrainByYear: [
        {
          from: 2023,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Allegro: {
      type: "Class A Gas",
      floorplans: ["32SA", "34PA", "36LA"],
      floorplansByYear: {
        "2005": ["32SA", "34PA", "36LA"],
        "2006": ["32SA", "34PA", "36LA"],
        "2007": ["32SA", "34PA", "36LA"],
        "2008": ["32SA", "34PA", "36LA"],
        "2009": ["32SA", "34PA", "36LA"],
        "2010": ["32SA", "34PA", "36LA"],
        "2011": ["32SA", "34PA", "36LA"],
        "2012": ["32SA", "34PA", "36LA"],
        "2013": ["32SA", "34PA", "36LA"],
        "2014": ["32SA", "34PA", "36LA"],
        "2015": ["32SA", "34PA", "36LA"],
        "2016": ["32SA", "34PA", "36LA"],
        "2017": ["32SA", "34PA", "36LA"],
        "2018": ["32SA", "34PA", "36LA"],
        "2019": ["32SA", "34PA", "36LA"],
        "2020": ["32SA", "34PA", "36LA"],
        "2021": ["32SA", "34PA"],
        "2022": ["32SA", "34PA"]
      },
      lengthRange: [
        32,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149000,
        239000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      yearEnd: 2022,
      description: "Tiffin Allegro gas Class A family name — many units sold as Open Road / Allegro. Use Open Road for current gas line.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2022,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    }
  },
  Thor: {
    Tuscany: {
      type: "Class A Diesel",
      floorplans: ["40IX", "42RQ", "45AT", "45NX"],
      floorplansByYear: {
        "2005": ["40IX", "42RQ", "45AT"],
        "2006": ["40IX", "42RQ", "45AT"],
        "2007": ["40IX", "42RQ", "45AT"],
        "2008": ["40IX", "42RQ", "45AT"],
        "2009": ["40IX", "42RQ", "45AT"],
        "2010": ["40IX", "42RQ", "45AT"],
        "2011": ["40IX", "42RQ", "45AT"],
        "2012": ["40IX", "42RQ", "45AT"],
        "2013": ["40IX", "42RQ", "45AT"],
        "2014": ["40IX", "42RQ", "45AT"],
        "2015": ["40IX", "42RQ", "45AT"],
        "2016": ["40IX", "42RQ", "45AT"],
        "2017": ["40IX", "42RQ", "45AT"],
        "2018": ["40IX", "42RQ", "45AT"],
        "2019": ["40IX", "42RQ", "45AT", "45NX"],
        "2020": ["40IX", "42RQ", "45AT", "45NX"],
        "2021": ["40IX", "42RQ", "45AT", "45NX"],
        "2022": ["40IX", "42RQ", "45AT"],
        "2023": ["40IX", "42RQ", "45AT"],
        "2024": ["40IX", "42RQ", "45AT"],
        "2025": ["40IX", "42RQ"],
        "2026": ["40IX", "42RQ"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        36000,
        48000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        349000,
        549000
      ],
      engine: "Cummins L9 / ISX (by year)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner XC / Spartan (by year)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 8–10kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Thor Tuscany — diesel Class A flagship under Thor Motor Coach. Later years often L9-class; verify ISX vs L9 on the unit.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC / Spartan (by year)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC / Spartan (by year)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISL / ISX class",
          horsepower: 450,
          chassis: "Freightliner / Spartan"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 450HP class",
          horsepower: 450,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    Palazzo: {
      type: "Class A Diesel",
      floorplans: ["33.2", "33.3", "33.5", "33.6", "36.1", "36.3", "37.4"],
      floorplansByYear: {
        "2012": ["33.2", "33.3", "36.1"],
        "2013": ["33.2", "33.3", "36.1"],
        "2014": ["33.2", "33.3", "36.1"],
        "2015": ["33.2", "33.3", "36.1"],
        "2016": ["33.2", "33.3", "36.1"],
        "2017": ["33.2", "33.3", "36.1"],
        "2018": ["33.2", "33.3", "36.1"],
        "2019": ["33.2", "33.3", "36.1", "37.4"],
        "2020": ["33.2", "33.3", "36.1", "37.4"],
        "2021": ["33.2", "33.3", "36.1", "37.4"],
        "2022": ["33.2", "33.5", "36.3", "37.4"],
        "2023": ["33.2", "33.5", "36.3", "37.4"],
        "2024": ["33.2", "33.5", "33.6", "36.3", "37.4"],
        "2025": ["33.5", "33.6", "36.3", "37.4"],
        "2026": ["33.5", "33.6", "36.3", "37.4"]
      },
      lengthRange: [
        33,
        38
      ],
      weightRange: [
        28000,
        36000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        389000
      ],
      engine: "Cummins B6.7 / L9 340–450HP",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner XC-Series",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Thor Palazzo — mid-diesel Class A on Freightliner XC. B6.7/L9 class — not a 600 hp Spartan coach.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISB / B6.7 340HP",
          horsepower: 340,
          chassis: "Freightliner XC"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins B6.7 / L9 340–450HP",
          horsepower: 340,
          chassis: "Freightliner XC-Series"
        },
        
      ]
    },
    Aria: {
      type: "Class A Diesel",
      floorplans: ["3401", "3601", "3901", "4000"],
      floorplansByYear: {
        "2014": ["3401", "3601", "3901"],
        "2015": ["3401", "3601", "3901"],
        "2016": ["3401", "3601", "3901"],
        "2017": ["3401", "3601", "3901"],
        "2018": ["3401", "3601", "3901"],
        "2019": ["3401", "3601", "3901", "4000"],
        "2020": ["3401", "3601", "3901", "4000"],
        "2021": ["3401", "3601", "3901", "4000"],
        "2022": ["3401", "3901", "4000"],
        "2023": ["3401", "3901", "4000"],
        "2024": ["3401", "3901", "4000"],
        "2025": ["3901", "4000"],
        "2026": ["3901", "4000"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        28000,
        36000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        239000,
        369000
      ],
      engine: "Cummins B6.7 / L9 340–450HP",
      horsepower: 340,
      chassis: "Freightliner XC-Series",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Thor Aria — diesel Class A companion to Palazzo. Mid-diesel XC platform.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins B6.7 / L9 class",
          horsepower: 340,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    ACE: {
      type: "Class A Gas",
      floorplans: ["27.1", "29.2", "30.1", "32.1", "29.3", "30.2", "32.3", "33.1"],
      floorplansByYear: {
        "2010": ["27.1", "29.2", "30.1", "32.1"],
        "2011": ["27.1", "29.2", "30.1", "32.1"],
        "2012": ["27.1", "29.2", "30.1", "32.1"],
        "2013": ["27.1", "29.2", "30.1", "32.1"],
        "2014": ["27.1", "29.2", "30.1", "32.1"],
        "2015": ["27.1", "29.2", "30.1", "32.1"],
        "2016": ["27.1", "29.2", "30.1", "32.1"],
        "2017": ["27.1", "29.2", "30.1", "32.1"],
        "2018": ["27.1", "29.3", "30.2", "32.3"],
        "2019": ["27.1", "29.3", "30.2", "32.3"],
        "2020": ["27.1", "29.3", "30.2", "32.3", "33.1"],
        "2021": ["27.1", "29.3", "30.2", "32.3", "33.1"],
        "2022": ["27.1", "29.3", "30.2", "32.3", "33.1"],
        "2023": ["27.1", "29.3", "30.2", "32.3", "33.1"],
        "2024": ["27.1", "29.3", "30.2", "32.3"],
        "2025": ["27.1", "29.3", "30.2", "32.3"],
        "2026": ["27.1", "29.3", "30.2", "32.3"]
      },
      lengthRange: [
        27,
        33
      ],
      weightRange: [
        14000,
        20000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        129000,
        199000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 40,
      blackWater: 30,
      fuelCapacityGal: 80,
      generator: "Onan 4000–5500W Gas",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Thor ACE — high-volume gas Class A on Ford F53. Newer years 7.3L ~350 hp.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Vegas: {
      type: "Class A Gas",
      floorplans: ["24.1", "25.2", "25.6", "26.1", "26.2", "27.7", "28.1"],
      floorplansByYear: {
        "2014": ["24.1", "25.2", "25.6"],
        "2015": ["24.1", "25.2", "25.6"],
        "2016": ["24.1", "25.2", "25.6", "27.7"],
        "2017": ["24.1", "25.2", "25.6", "27.7"],
        "2018": ["24.1", "25.2", "25.6", "27.7"],
        "2019": ["24.1", "25.2", "25.6", "27.7"],
        "2020": ["24.1", "25.2", "25.6", "27.7"],
        "2021": ["24.1", "25.2", "26.1", "26.2", "28.1"],
        "2022": ["24.1", "26.1", "26.2", "28.1"],
        "2023": ["24.1", "26.1", "26.2", "28.1"],
        "2024": ["24.1", "26.1", "26.2", "28.1"],
        "2025": ["24.1", "26.1", "26.2", "28.1"],
        "2026": ["24.1", "26.1", "26.2", "28.1"]
      },
      lengthRange: [25, 31],
      weightRange: [12500, 14500],
      slideouts: 1,
      sleeps: 5,
      msrpRange: [149000, 189000],
      // Thor OEM Vegas 24.1: Ford 7.3L V8 325 HP / 450 lb-ft; fuel 55 gal; hitch 8,000
      engine: "Ford 7.3L V8 (Godzilla) 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-Series cutaway (Class A body)",
      transmission: "TorqShift automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      fuelCapacityGal: 55,
      generator: "Onan / Generac gas (by year)",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      description:
        "Thor Vegas — compact Class A RUV (European-style Class A body on Ford cutaway chassis, not F53). Sister to Axis. OEM recent: Ford 7.3L V8 ~325 HP / 450 lb-ft, 55 gal fuel, hitch 8,000 lb. Floorplans 24.1 (~25' 8\"), 26.1/26.2 (~27' 2\"), 28.1 (~30' 6\"). GVWR ~12,500–14,500. Confirm year: early units Triton V10.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-350 / E-450 cutaway",
          transmission: "TorqShift automatic",
          fuelCapacityGal: 55,
          towingCapacity: 8000,
          notes: "Launch–pre-Godzilla Vegas — V10 cutaway era",
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 (Godzilla) 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-Series cutaway (Class A body)",
          transmission: "TorqShift automatic",
          fuelCapacityGal: 55,
          towingCapacity: 8000,
          notes:
            "Thor OEM: 7.3L V8 325 HP / 450 lb-ft · gas · hitch 8,000 · not F53 Class A chassis",
        },
      ],
    },
    Axis: {
      type: "Class A Gas",
      floorplans: ["24.1", "25.2", "25.6", "26.1", "26.2", "27.7", "28.1"],
      floorplansByYear: {
        "2014": ["24.1", "25.2", "25.6"],
        "2015": ["24.1", "25.2", "25.6"],
        "2016": ["24.1", "25.2", "25.6", "27.7"],
        "2017": ["24.1", "25.2", "25.6", "27.7"],
        "2018": ["24.1", "25.2", "25.6", "27.7"],
        "2019": ["24.1", "25.2", "25.6", "27.7"],
        "2020": ["24.1", "25.2", "25.6", "27.7"],
        "2021": ["24.1", "25.2", "26.1", "26.2", "28.1"],
        "2022": ["24.1", "26.1", "26.2", "28.1"],
        "2023": ["24.1", "26.1", "26.2", "28.1"],
        "2024": ["24.1", "26.1", "26.2", "28.1"],
        "2025": ["24.1", "26.1", "26.2", "28.1"],
        "2026": ["24.1", "26.1", "26.2", "28.1"]
      },
      lengthRange: [25, 31],
      weightRange: [12500, 14500],
      slideouts: 1,
      sleeps: 5,
      msrpRange: [149000, 189000],
      engine: "Ford 7.3L V8 (Godzilla) 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-Series cutaway (Class A body)",
      transmission: "TorqShift automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      fuelCapacityGal: 55,
      generator: "Onan / Generac gas (by year)",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      description:
        "Thor Axis — compact Class A RUV sister to Vegas (same Ford cutaway platform / floorplan family; trim & décor differ). Not traditional F53 Class A. Recent OEM: Ford 7.3L V8 ~325 HP / 450 lb-ft, 55 gal, hitch 8,000 lb. Plans 24.1 / 26.1 / 26.2 / 28.1.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-350 / E-450 cutaway",
          transmission: "TorqShift automatic",
          fuelCapacityGal: 55,
          towingCapacity: 8000,
          notes: "Launch–pre-Godzilla Axis — V10 cutaway era",
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 (Godzilla) 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-Series cutaway (Class A body)",
          transmission: "TorqShift automatic",
          fuelCapacityGal: 55,
          towingCapacity: 8000,
          notes:
            "Sister to Vegas — same 7.3L 325/450 package; confirm décor/options vs Vegas",
        },
      ],
    },
    Windsport: {
      type: "Class A Gas",
      floorplans: ["27R", "29M", "31S", "34J", "35M"],
      floorplansByYear: {
        "2008": ["27R", "29M", "31S"],
        "2009": ["27R", "29M", "31S", "34J"],
        "2010": ["27R", "29M", "31S", "34J"],
        "2011": ["27R", "29M", "31S", "34J"],
        "2012": ["27R", "29M", "31S", "34J"],
        "2013": ["27R", "29M", "31S", "34J"],
        "2014": ["27R", "29M", "31S", "34J"],
        "2015": ["27R", "29M", "31S", "34J"],
        "2016": ["27R", "29M", "31S", "34J"],
        "2017": ["27R", "29M", "31S", "34J"],
        "2018": ["27R", "29M", "31S", "34J"],
        "2019": ["27R", "29M", "31S", "34J", "35M"],
        "2020": ["27R", "29M", "31S", "34J", "35M"],
        "2021": ["27R", "29M", "31S", "34J", "35M"],
        "2022": ["29M", "31S", "34J", "35M"],
        "2023": ["29M", "31S", "34J", "35M"],
        "2024": ["29M", "31S", "34J", "35M"],
        "2025": ["29M", "34J", "35M"],
        "2026": ["29M", "34J", "35M"]
      },
      lengthRange: [
        27,
        35
      ],
      weightRange: [
        15000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        139000,
        209000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Thor Windsport — gas Class A family coach on F53.",
      powertrainByYear: [
        {
          from: 2008,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Challenger: {
      type: "Class A Gas",
      floorplans: ["35KT", "37FH", "37TB"],
      floorplansByYear: {
        "2005": ["35KT", "37FH", "37TB"],
        "2006": ["35KT", "37FH", "37TB"],
        "2007": ["35KT", "37FH", "37TB"],
        "2008": ["35KT", "37FH", "37TB"],
        "2009": ["35KT", "37FH", "37TB"],
        "2010": ["35KT", "37FH", "37TB"],
        "2011": ["35KT", "37FH", "37TB"],
        "2012": ["35KT", "37FH", "37TB"],
        "2013": ["35KT", "37FH", "37TB"],
        "2014": ["35KT", "37FH", "37TB"],
        "2015": ["35KT", "37FH", "37TB"],
        "2016": ["35KT", "37FH", "37TB"],
        "2017": ["35KT", "37FH", "37TB"],
        "2018": ["35KT", "37FH", "37TB"],
        "2019": ["35KT", "37FH", "37TB"],
        "2020": ["35KT", "37FH", "37TB"],
        "2021": ["35KT", "37FH", "37TB"],
        "2022": ["35KT", "37FH"],
        "2023": ["35KT", "37FH"],
        "2024": ["35KT", "37FH"],
        "2025": ["35KT", "37FH"],
        "2026": ["35KT", "37FH"]
      },
      lengthRange: [
        35,
        37
      ],
      weightRange: [
        18000,
        24000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        149000,
        229000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Thor Challenger — larger gas Class A floorplans on F53.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Magnitude: {
      type: "Super C",
      floorplans: ["SV34", "SV38", "SV40"],
      floorplansByYear: {
        "2014": ["SV34", "SV38"],
        "2015": ["SV34", "SV38"],
        "2016": ["SV34", "SV38"],
        "2017": ["SV34", "SV38"],
        "2018": ["SV34", "SV38"],
        "2019": ["SV34", "SV38", "SV40"],
        "2020": ["SV34", "SV38", "SV40"],
        "2021": ["SV34", "SV38", "SV40"],
        "2022": ["SV34", "SV38", "SV40"],
        "2023": ["SV34", "SV38", "SV40"],
        "2024": ["SV34", "SV38", "SV40"],
        "2025": ["SV38", "SV40"],
        "2026": ["SV38", "SV40"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        22000,
        30000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        219000,
        329000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-550 Super Duty",
      transmission: "TorqShift",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 20000,
      freshWater: 70,
      grayWater: 45,
      blackWater: 45,
      fuelCapacityGal: 68,
      generator: "Onan 6000–8000W",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Thor Magnitude — Super C on Ford F-550 Power Stroke. Strong tow ratings vs Class C gas.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Ford Power Stroke 6.7L Diesel",
          horsepower: 330,
          torqueLbFt: 950,
          chassis: "Ford F-550"
        }
      ]
    },
    "Magnitude XG": {
      type: "Super C",
      floorplans: ["XG32", "XG36", "XG40"],
      floorplansByYear: {
        "2020": ["XG32", "XG36"],
        "2021": ["XG32", "XG36"],
        "2022": ["XG32", "XG36", "XG40"],
        "2023": ["XG32", "XG36", "XG40"],
        "2024": ["XG32", "XG36", "XG40"],
        "2025": ["XG32", "XG36"],
        "2026": ["XG32", "XG36"]
      },
      lengthRange: [
        32,
        40
      ],
      weightRange: [
        22000,
        30000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        239000,
        349000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-550 Super Duty",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2020,
      description: "Thor Magnitude XG — upgraded Super C packages on F-550 Power Stroke.",
      powertrainByYear: [
        {
          from: 2020,
          to: 2026,
          engine: "Ford Power Stroke 6.7L Diesel",
          horsepower: 330,
          chassis: "Ford F-550"
        }
      ]
    },
    Seneca: {
      type: "Super C",
      floorplans: ["37SS", "37HJ", "38DB"],
      floorplansByYear: {
        "2012": ["37SS", "37HJ"],
        "2013": ["37SS", "37HJ"],
        "2014": ["37SS", "37HJ"],
        "2015": ["37SS", "37HJ"],
        "2016": ["37SS", "37HJ"],
        "2017": ["37SS", "37HJ"],
        "2018": ["37SS", "37HJ"],
        "2019": ["37SS", "37HJ", "38DB"],
        "2020": ["37SS", "37HJ", "38DB"],
        "2021": ["37SS", "37HJ", "38DB"],
        "2022": ["37SS", "37HJ", "38DB"],
        "2023": ["37SS", "37HJ", "38DB"],
        "2024": ["37SS", "37HJ", "38DB"],
        "2025": ["37SS", "37HJ"],
        "2026": ["37SS", "37HJ"]
      },
      lengthRange: [
        37,
        38
      ],
      weightRange: [
        24000,
        32000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        229000,
        349000
      ],
      engine: "Ford Power Stroke 6.7L / Cummins Super C (by year)",
      horsepower: 330,
      chassis: "Freightliner / Ford Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Thor Seneca — Super C diesel. Verify chassis maker on the build sheet.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Super C diesel (Ford 6.7 / Cummins by chassis)",
          horsepower: 330,
          chassis: "Super C platform"
        }
      ]
    },
    "Four Winds": {
      type: "Class C",
      floorplans: [
        "19Z",
        "21Z",
        "22E",
        "23U",
        "24F",
        "25M",
        "25V",
        "25Z",
        "27A",
        "28A",
        "28Z",
        "30D",
        "31E",
        "31W",
        "32A"
      ],
      floorplansByYear: {
        "2010": ["22E", "24F", "28A", "31E"],
        "2011": ["22E", "24F", "28A", "31E"],
        "2012": ["22E", "24F", "28A", "31E", "31W"],
        "2013": ["22E", "24F", "28A", "31E", "31W"],
        "2014": ["22E", "24F", "28A", "31E", "31W"],
        "2015": ["22E", "24F", "28A", "31E", "31W"],
        "2016": ["22E", "24F", "28A", "31E", "31W", "32A"],
        "2017": ["22E", "24F", "28A", "31E", "31W", "32A"],
        "2018": ["22E", "24F", "25M", "28A", "28Z", "31E", "31W"],
        "2019": ["22E", "24F", "25M", "28A", "28Z", "31E", "31W"],
        "2020": ["19Z", "22E", "24F", "25M", "28A", "28Z", "31E", "31W"],
        "2021": [
          "19Z",
          "21Z",
          "22E",
          "24F",
          "25M",
          "25V",
          "28A",
          "28Z",
          "31E",
          "31W"
        ],
        "2022": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "28A",
          "28Z",
          "30D",
          "31E",
          "31W"
        ],
        "2023": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "28Z",
          "30D",
          "31E",
          "31W"
        ],
        "2024": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "28Z",
          "30D",
          "31E",
          "31W",
          "32A"
        ],
        "2025": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31E",
          "31W",
          "32A"
        ],
        "2026": [
          "19Z",
          "21Z",
          "22E",
          "24F",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31E",
          "31W"
        ]
      },
      lengthRange: [
        20,
        33
      ],
      weightRange: [
        10000,
        15500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        89000,
        165000
      ],
      engine: "Ford 7.3L V8 Godzilla / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-350 / E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Thor Four Winds — highest-volume Ford cutaway Class C. Common lot units 22E/24F/25Z/28A/31E. Recent years often 7.3L Godzilla on E-450.",
      powertrainByYear: [
                {
          from: 2000,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / 6.8L V10 (by year)",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Chateau: {
      type: "Class C",
      floorplans: [
        "19Z",
        "21Z",
        "22E",
        "23U",
        "24F",
        "25M",
        "25V",
        "25Z",
        "27A",
        "28A",
        "28Z",
        "30D",
        "31E",
        "31W",
        "32A"
      ],
      floorplansByYear: {
        "2010": ["22E", "24F", "28A", "31W"],
        "2011": ["22E", "24F", "28A", "31W"],
        "2012": ["22E", "24F", "28A", "31W"],
        "2013": ["22E", "24F", "28A", "31W"],
        "2014": ["22E", "24F", "28A", "31W"],
        "2015": ["22E", "24F", "28A", "31W"],
        "2016": ["22E", "24F", "28A", "31W", "32A"],
        "2017": ["22E", "24F", "28A", "31W", "32A"],
        "2018": ["22E", "24F", "25M", "28A", "31W"],
        "2019": ["22E", "24F", "25M", "28A", "31W", "31E"],
        "2020": ["19Z", "22E", "24F", "25M", "28A", "31W", "31E"],
        "2021": [
          "19Z",
          "21Z",
          "22E",
          "24F",
          "25M",
          "25V",
          "28A",
          "31W",
          "31E"
        ],
        "2022": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "28A",
          "30D",
          "31W",
          "31E"
        ],
        "2023": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31W",
          "31E"
        ],
        "2024": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31W",
          "31E",
          "32A"
        ],
        "2025": [
          "19Z",
          "21Z",
          "22E",
          "23U",
          "24F",
          "25M",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31W",
          "32A"
        ],
        "2026": [
          "19Z",
          "21Z",
          "22E",
          "24F",
          "25V",
          "25Z",
          "27A",
          "28A",
          "30D",
          "31W"
        ]
      },
      lengthRange: [
        20,
        33
      ],
      weightRange: [
        10000,
        15500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        95000,
        169000
      ],
      engine: "Ford 7.3L V8 Godzilla / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-350 / E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Thor Chateau — Four Winds family Class C with Chateau branding/trim. Same Ford cutaway platform; popular 22E/24F/25Z/28A/31W lot units.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Quantum: {
      type: "Class C",
      floorplans: ["KW29", "WS31", "LF31", "KM24", "PD31", "RC25"],
      floorplansByYear: {
        "2014": ["KW29", "WS31"],
        "2015": ["KW29", "WS31"],
        "2016": ["KW29", "WS31"],
        "2017": ["KW29", "WS31"],
        "2018": ["KW29", "WS31", "LF31"],
        "2019": ["KW29", "WS31", "LF31"],
        "2020": ["KW29", "WS31", "LF31", "KM24"],
        "2021": ["KW29", "WS31", "LF31", "KM24", "PD31"],
        "2022": ["KW29", "WS31", "LF31", "KM24", "PD31", "RC25"],
        "2023": ["KW29", "WS31", "LF31", "KM24", "PD31", "RC25"],
        "2024": ["KW29", "WS31", "LF31", "KM24", "PD31", "RC25"],
        "2025": ["KW29", "WS31", "LF31", "PD31"],
        "2026": ["KW29", "WS31", "PD31"]
      },
      lengthRange: [
        24,
        32
      ],
      weightRange: [
        11000,
        15500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        99000,
        175000
      ],
      engine: "Ford 7.3L V8 Godzilla / Mercedes Sprinter (select)",
      horsepower: 350,
      chassis: "Ford E-450 / Mercedes Sprinter (by plan)",
      fuelType: "Gas / Diesel (by plan)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Triton V10 6.8L / Mercedes Sprinter diesel (by plan)",
          horsepower: 320,
          chassis: "Ford E-450 / Mercedes Sprinter (by plan)",
          notes: "2006–2015 dual-chassis Class C — no 7.3 Godzilla yet"
        }
      ],
      description: "Thor Quantum — Class C family spanning Ford cutaway and select European chassis plans (KW29, WS31, LF31). Verify chassis on door sticker."
    },
    "Four Winds Siesta": {
      type: "Class C",
      floorplans: ["24SR", "25G", "25M"],
      floorplansByYear: {
        "2016": ["24SR", "25G"],
        "2017": ["24SR", "25G"],
        "2018": ["24SR", "25G"],
        "2019": ["24SR", "25G", "25M"],
        "2020": ["24SR", "25G", "25M"],
        "2021": ["24SR", "25G", "25M"],
        "2022": ["24SR", "25G"],
        "2023": ["24SR", "25G"],
        "2024": ["24SR", "25G"],
        "2025": ["24SR", "25G"],
        "2026": ["24SR", "25G"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        119000,
        179000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2016,
      description: "Thor Four Winds Siesta — Sprinter diesel Class C.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Geneva: {
      type: "Class C",
      floorplans: ["25VT", "28VT", "30VT"],
      floorplansByYear: {
        "2018": ["25VT", "28VT"],
        "2019": ["25VT", "28VT"],
        "2020": ["25VT", "28VT", "30VT"],
        "2021": ["25VT", "28VT", "30VT"],
        "2022": ["25VT", "28VT", "30VT"],
        "2023": ["25VT", "28VT"],
        "2024": ["25VT", "28VT"],
        "2025": ["25VT", "28VT"],
        "2026": ["25VT", "28VT"]
      },
      lengthRange: [
        25,
        30
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        99000,
        159000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Thor Geneva — Class C on Ford cutaway.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Outlaw: {
      type: "Class C",
      floorplans: ["29H", "38MB", "38KB"],
      floorplansByYear: {
        "2012": ["29H", "38MB"],
        "2013": ["29H", "38MB"],
        "2014": ["29H", "38MB"],
        "2015": ["29H", "38MB"],
        "2016": ["29H", "38MB"],
        "2017": ["29H", "38MB"],
        "2018": ["29H", "38MB"],
        "2019": ["29H", "38MB", "38KB"],
        "2020": ["29H", "38MB", "38KB"],
        "2021": ["29H", "38MB", "38KB"],
        "2022": ["29H", "38MB", "38KB"],
        "2023": ["29H", "38MB", "38KB"],
        "2024": ["29H", "38MB", "38KB"],
        "2025": ["29H", "38MB"],
        "2026": ["29H", "38MB"]
      },
      lengthRange: [
        29,
        38
      ],
      weightRange: [
        12000,
        18000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        109000,
        189000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450 / Super C variants by year",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Thor Outlaw — toy-hauler style Class C / garage models. Verify chassis and garage dimensions on unit.",
      powertrainByYear: [
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Sequence: {
      type: "Class B",
      floorplans: ["20A", "20K", "20L", "20U"],
      floorplansByYear: {
        "2021": ["20A", "20K", "20L"],
        "2022": ["20A", "20K", "20L", "20U"],
        "2023": ["20A", "20K", "20L", "20U"],
        "2024": ["20A", "20K", "20L", "20U"],
        "2025": ["20A", "20K", "20L", "20U"],
        "2026": ["20A", "20L", "20U"]
      },
      lengthRange: [
        20,
        23
      ],
      weightRange: [
        8500,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        145000,
        195000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbo diesel",
      horsepower: 208,
      powertrainByYear: [
        { from: 2021, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbo diesel", horsepower: 208, chassis: "Mercedes-Benz Sprinter 2500" },
      ],
      chassis: "Mercedes-Benz Sprinter 2500",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 25,
      grayWater: 20,
      blackWater: 15,
      generator: "None (lithium / dual alternator packages common)",
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2021,
      mpgHighwayEst: 16,
      description: "Thor Sequence — Sprinter Class B under 23 ft. Floorplans 20A/20K/20L/20U. Wet bath + dual expanding sofas on select plans. Verify GVWR vs payload with options."
    },
    Sanctuary: {
      type: "Class B",
      floorplans: ["19P", "24G", "33C"],
      floorplansByYear: {
        "2015": ["19P", "24G"],
        "2016": ["19P", "24G"],
        "2017": ["19P", "24G"],
        "2018": ["19P", "24G"],
        "2019": ["19P", "24G", "33C"],
        "2020": ["19P", "24G", "33C"],
        "2021": ["19P", "24G", "33C"],
        "2022": ["19P", "24G", "33C"],
        "2023": ["19P", "24G", "33C"],
        "2024": ["19P", "24G", "33C"],
        "2025": ["19P", "24G"],
        "2026": ["19P", "24G"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        9000,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        139000,
        199000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2015,
      description: "Thor Sanctuary — Sprinter Class B.",
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Mercedes-Benz Sprinter turbodiesel",
          horsepower: 180,
          chassis: "Mercedes-Benz Sprinter",
          notes: "2005–2015 Class B — chassis varies by package"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Gemini: {
      type: "Class B+",
      floorplans: ["22TF", "23TR", "24KB"],
      floorplansByYear: {
        "2014": ["22TF", "23TR"],
        "2015": ["22TF", "23TR"],
        "2016": ["22TF", "23TR"],
        "2017": ["22TF", "23TR"],
        "2018": ["22TF", "23TR"],
        "2019": ["22TF", "23TR", "24KB"],
        "2020": ["22TF", "23TR", "24KB"],
        "2021": ["22TF", "23TR", "24KB"],
        "2022": ["22TF", "23TR", "24KB"],
        "2023": ["22TF", "23TR", "24KB"],
        "2024": ["22TF", "23TR", "24KB"],
        "2025": ["23TR", "24KB"],
        "2026": ["23TR", "24KB"]
      },
      lengthRange: [
        22,
        25
      ],
      weightRange: [
        9000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        99000,
        159000
      ],
      engine: "Ford Transit / cutaway gas (by year)",
      horsepower: 310,
      chassis: "Ford Transit / E-series",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Thor Gemini — Class B+ compact motorhome. Chassis varies by model year — verify door sticker.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Transit / cutaway gas (by year)",
          horsepower: 180,
          chassis: "Ford Transit / E-series",
          notes: "2005–2015 Class B — chassis varies by package"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Ford Transit / cutaway V6/V8 gas",
          horsepower: 310,
          chassis: "Ford Transit / E-series"
        }
      ]
    },
    Rize: {
      type: "Toy Hauler",
      floorplans: ["18M", "24F", "28B"],
      floorplansByYear: {
        "2018": ["18M", "24F"],
        "2019": ["18M", "24F"],
        "2020": ["18M", "24F", "28B"],
        "2021": ["18M", "24F", "28B"],
        "2022": ["18M", "24F", "28B"],
        "2023": ["18M", "24F", "28B"],
        "2024": ["18M", "24F", "28B"],
        "2025": ["18M", "24F", "28B"],
        "2026": ["18M", "24F", "28B"]
      },
      lengthRange: [
        18,
        28
      ],
      weightRange: [
        4000,
        8000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        32000,
        62000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2500,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Thor Rize — lightweight toy hauler. Garage size varies by floorplan — verify brochure/sticker."
    },
    "Rize Plus": {
      type: "Toy Hauler",
      floorplans: ["26B", "29F", "31B"],
      floorplansByYear: {
        "2020": ["26B", "29F"],
        "2021": ["26B", "29F"],
        "2022": ["26B", "29F"],
        "2023": ["26B", "29F", "31B"],
        "2024": ["26B", "29F", "31B"],
        "2025": ["26B", "29F", "31B"],
        "2026": ["26B", "29F", "31B"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        6000,
        10000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        42000,
        78000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3500,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2020,
      description: "Thor Rize Plus — larger toy hauler packages. Confirm garage depth/capacity for toys."
    }
  },
  Coachmen: {
    Encore: {
      type: "Class A Gas",
      floorplans: ["325SS", "330TS", "370FL", "370RB"],
      floorplansByYear: {
        "2012": ["325SS", "370FL"],
        "2013": ["325SS", "370FL"],
        "2014": ["325SS", "330TS", "370FL"],
        "2015": ["325SS", "330TS", "370FL", "370RB"],
        "2016": ["325SS", "330TS", "370FL", "370RB"],
        "2017": ["325SS", "330TS", "370FL", "370RB"],
        "2018": ["325SS", "330TS", "370FL", "370RB"],
        "2019": ["325SS", "330TS", "370FL", "370RB"],
        "2020": ["325SS", "330TS", "370FL", "370RB"],
        "2021": ["325SS", "330TS", "370FL", "370RB"],
        "2022": ["325SS", "330TS", "370FL", "370RB"],
        "2023": ["325SS", "330TS", "370FL", "370RB"],
        "2024": ["325SS", "330TS", "370FL", "370RB"],
        "2025": ["325SS", "330TS", "370FL"],
        "2026": ["325SS", "330TS", "370FL"]
      },
      lengthRange: [
        32,
        37
      ],
      weightRange: [
        24000,
        30000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        149900,
        229000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 82,
      grayWater: 44,
      blackWater: 42,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 81,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2010,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "Coachmen Encore — premium gas Class A on Ford F53. Triple-slide residential layouts."
    },
    Sportscoach: {
      type: "Class A Diesel",
      floorplans: ["364TS", "389QB", "403QBC", "407FW"],
      floorplansByYear: {
        "2012": ["364TS", "407FW"],
        "2013": ["364TS", "407FW"],
        "2014": ["364TS", "389QB", "407FW"],
        "2015": ["364TS", "389QB", "403QBC", "407FW"],
        "2016": ["364TS", "389QB", "403QBC", "407FW"],
        "2017": ["364TS", "389QB", "403QBC", "407FW"],
        "2018": ["364TS", "389QB", "403QBC", "407FW"],
        "2019": ["364TS", "389QB", "403QBC", "407FW"],
        "2020": ["364TS", "389QB", "403QBC", "407FW"],
        "2021": ["364TS", "389QB", "403QBC", "407FW"],
        "2022": ["364TS", "389QB", "403QBC", "407FW"],
        "2023": ["364TS", "389QB", "403QBC", "407FW"],
        "2024": ["364TS", "389QB", "403QBC", "407FW"],
        "2025": ["364TS", "389QB", "407FW"],
        "2026": ["364TS", "389QB", "407FW"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        38000,
        44000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        199900,
        329000
      ],
      engine: "Cummins ISB / B6.7 ~340HP",
      horsepower: 340,
      chassis: "Freightliner",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 85,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2010,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Cummins ISB / ISL mid-diesel (era)",
          horsepower: 340,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default"
        }
      ],
      description: "Coachmen Sportscoach — entry diesel pusher value on Freightliner."
    },
    Freelander: {
      type: "Class C",
      floorplans: [
        "21RS",
        "22XG",
        "26DS",
        "27QB",
        "28BH",
        "30BH",
        "31BH",
        "32BH",
        "32FS"
      ],
      floorplansByYear: {
        "2010": ["21RS", "26DS", "30BH", "32FS"],
        "2011": ["21RS", "26DS", "30BH", "32FS"],
        "2012": ["21RS", "26DS", "27QB", "30BH", "32FS"],
        "2013": ["21RS", "26DS", "27QB", "30BH", "32FS"],
        "2014": ["21RS", "26DS", "27QB", "30BH", "32FS"],
        "2015": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "32FS"],
        "2016": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "31BH", "32FS"],
        "2017": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "31BH", "32FS"],
        "2018": [
          "21RS",
          "22XG",
          "26DS",
          "27QB",
          "28BH",
          "30BH",
          "31BH",
          "32BH",
          "32FS"
        ],
        "2019": [
          "21RS",
          "22XG",
          "26DS",
          "27QB",
          "28BH",
          "30BH",
          "31BH",
          "32BH",
          "32FS"
        ],
        "2020": [
          "21RS",
          "22XG",
          "26DS",
          "27QB",
          "28BH",
          "30BH",
          "31BH",
          "32BH",
          "32FS"
        ],
        "2021": [
          "21RS",
          "22XG",
          "26DS",
          "27QB",
          "28BH",
          "30BH",
          "31BH",
          "32BH",
          "32FS"
        ],
        "2022": [
          "21RS",
          "22XG",
          "26DS",
          "27QB",
          "28BH",
          "30BH",
          "31BH",
          "32BH",
          "32FS"
        ],
        "2023": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "31BH", "32BH"],
        "2024": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "31BH", "32BH"],
        "2025": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH", "31BH"],
        "2026": ["21RS", "22XG", "26DS", "27QB", "28BH", "30BH"]
      },
      lengthRange: [
        21,
        32
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        69900,
        129000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 28,
      blackWater: 28,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 13,
      ceilingHeight: 79,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2005,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        },
        {
          from: 2005,
          to: 2005,
          engine: "Ford Triton V10 6.8L",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2000–2005 Class C gas — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "Coachmen Freelander — popular Ford cutaway Class C. Over-cab bunks; common 21RS/26DS/30BH lot units."
    },
    Mirada: {
      type: "Class A Gas",
      floorplans: ["29FW", "31FW", "35BH", "35OS"],
      floorplansByYear: {
        "2010": ["29FW", "31FW", "35BH"],
        "2011": ["29FW", "31FW", "35BH"],
        "2012": ["29FW", "31FW", "35BH", "35OS"],
        "2013": ["29FW", "31FW", "35BH", "35OS"],
        "2014": ["29FW", "31FW", "35BH", "35OS"],
        "2015": ["29FW", "31FW", "35BH", "35OS"],
        "2016": ["29FW", "31FW", "35BH", "35OS"],
        "2017": ["29FW", "31FW", "35BH", "35OS"],
        "2018": ["29FW", "31FW", "35BH", "35OS"],
        "2019": ["29FW", "31FW", "35BH", "35OS"],
        "2020": ["29FW", "31FW", "35BH", "35OS"],
        "2021": ["29FW", "31FW", "35BH", "35OS"],
        "2022": ["29FW", "31FW", "35BH", "35OS"],
        "2023": ["29FW", "31FW", "35BH"],
        "2024": ["29FW", "31FW", "35BH"],
        "2025": ["29FW", "31FW", "35BH"],
        "2026": ["29FW", "31FW", "35BH"]
      },
      lengthRange: [
        29,
        35
      ],
      weightRange: [
        20000,
        26000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        99900,
        169000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2007,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "Coachmen Mirada — mid-range gas Class A on Ford F53."
    },
    Leprechaun: {
      type: "Class C",
      floorplans: [
        "210RS",
        "220QB",
        "220XG",
        "240FS",
        "260DS",
        "260FS",
        "280BH",
        "298KB",
        "300BH",
        "311FS",
        "319MB"
      ],
      floorplansByYear: {
        "2010": ["210RS", "220QB", "240FS", "260FS", "280BH"],
        "2011": ["210RS", "220QB", "240FS", "260FS", "280BH"],
        "2012": ["210RS", "220QB", "240FS", "260FS", "280BH", "300BH"],
        "2013": ["210RS", "220QB", "240FS", "260FS", "280BH", "300BH"],
        "2014": ["210RS", "220QB", "240FS", "260FS", "280BH", "298KB", "300BH"],
        "2015": ["210RS", "220QB", "240FS", "260FS", "280BH", "298KB", "300BH", "311FS"],
        "2016": [
          "210RS",
          "220QB",
          "240FS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2017": [
          "210RS",
          "220QB",
          "240FS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2018": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2019": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2020": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2021": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2022": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2023": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "300BH",
          "311FS",
          "319MB"
        ],
        "2024": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "311FS",
          "319MB"
        ],
        "2025": [
          "210RS",
          "220QB",
          "220XG",
          "240FS",
          "260DS",
          "260FS",
          "280BH",
          "298KB",
          "319MB"
        ],
        "2026": ["210RS", "220QB", "220XG", "260DS", "260FS", "280BH", "319MB"]
      },
      lengthRange: [
        21,
        33
      ],
      weightRange: [
        10000,
        15500
      ],
      slideouts: 1,
      sleeps: 9,
      msrpRange: [
        64900,
        119000
      ],
      engine: "Ford 7.3L / Chevy 6.6L (by chassis)",
      horsepower: 350,
      chassis: "Ford E-450 / Chevy 4500",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 26,
      blackWater: 26,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 12,
      ceilingHeight: 79,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2000,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        },
        {
          from: 2000,
          to: 2005,
          engine: "Ford Triton V10 6.8L",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2000–2005 Class C gas — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "Coachmen Leprechaun — best-selling Class C family. Bunkhouses 280BH/300BH; popular 210RS/260FS/319MB. Ford or Chevy chassis by plan."
    },
    Prism: {
      type: "Class C",
      floorplans: ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
      floorplansByYear: {
        "2013": ["24CB", "24EX"],
        "2014": ["24CB", "24EX"],
        "2015": ["2150CB", "24CB", "24EX"],
        "2016": ["2150CB", "2200LE", "24CB", "24EX"],
        "2017": ["2150CB", "2200LE", "24CB", "24EX"],
        "2018": ["2150CB", "2200LE", "24CB", "24EX", "24FWS"],
        "2019": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2020": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2021": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2022": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2023": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2024": ["2150CB", "2200LE", "24CB", "24EX", "24FWS", "25FWS"],
        "2025": ["2150CB", "2200LE", "24CB", "24EX", "24FWS"],
        "2026": ["2150CB", "2200LE", "24CB", "24FWS"]
      },
      lengthRange: [
        22,
        26
      ],
      weightRange: [
        10500,
        14000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        119900,
        179000
      ],
      engine: "Mercedes-Benz 3.0L V6 / 2.0L I4 (by year)",
      horsepower: 211,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 22,
      generator: "Onan 2800W Diesel",
      awningLength: 10,
      ceilingHeight: 78,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2013,
      mpgHighwayEst: 16,
      powertrainByYear: [
        {
          from: 2013,
          to: 2015,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "2006–2015 era powertrain for Coachmen Prism"
        }
      ],
      description: "Coachmen Prism — Mercedes Sprinter Class C. Compact diesel efficiency; 24CB/24EX staples."
    },
    "Freedom Express": {
      type: "Travel Trailer",
      floorplans: [
        "192RBS",
        "20SE",
        "23SE",
        "246RKS",
        "257BHS",
        "259FKDS",
        "292BHDS",
        "320BHDS",
        "326BHDE",
        "326BHDS"
      ],
      floorplansByYear: {
        "2012": ["192RBS", "23SE", "246RKS", "257BHS"],
        "2013": ["192RBS", "23SE", "246RKS", "257BHS", "259FKDS"],
        "2014": ["192RBS", "23SE", "246RKS", "257BHS", "259FKDS", "292BHDS"],
        "2015": ["192RBS", "20SE", "23SE", "246RKS", "257BHS", "259FKDS", "292BHDS"],
        "2016": ["192RBS", "20SE", "23SE", "246RKS", "257BHS", "259FKDS", "292BHDS", "320BHDS"],
        "2017": ["192RBS", "20SE", "23SE", "246RKS", "257BHS", "259FKDS", "292BHDS", "320BHDS"],
        "2018": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDS"
        ],
        "2019": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDS"
        ],
        "2020": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2021": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2022": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2023": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2024": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "320BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2025": [
          "192RBS",
          "20SE",
          "23SE",
          "246RKS",
          "257BHS",
          "259FKDS",
          "292BHDS",
          "326BHDE",
          "326BHDS"
        ],
        "2026": ["192RBS", "23SE", "246RKS", "257BHS", "259FKDS", "292BHDS", "326BHDE"]
      },
      lengthRange: [
        20,
        36
      ],
      weightRange: [
        3800,
        7800
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        27900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Coachmen Freedom Express — ultra-lite / Select travel trailer family. Half-ton friendly bunkhouses (257BHS, 326BHDE). High dealer volume."
    },
    Catalina: {
      type: "Travel Trailer",
      floorplans: [
        "243RBS",
        "261BH",
        "263BHS",
        "263BHSCK",
        "263FKDS",
        "273DBHCK",
        "283EPIC",
        "283RKS",
        "283RNR",
        "293QBCK",
        "303RKDS"
      ],
      floorplansByYear: {
        "2012": ["243RBS", "261BH", "263BHS", "283RKS"],
        "2013": ["243RBS", "261BH", "263BHS", "283RKS"],
        "2014": ["243RBS", "261BH", "263BHS", "263FKDS", "283RKS"],
        "2015": ["243RBS", "261BH", "263BHS", "263FKDS", "283RKS", "293QBCK"],
        "2016": ["243RBS", "261BH", "263BHS", "263FKDS", "283RKS", "293QBCK"],
        "2017": ["243RBS", "261BH", "263BHS", "263FKDS", "283RKS", "293QBCK", "303RKDS"],
        "2018": ["243RBS", "261BH", "263BHS", "263FKDS", "283RKS", "293QBCK", "303RKDS"],
        "2019": ["243RBS", "261BH", "263BHS", "263BHSCK", "263FKDS", "283RKS", "293QBCK", "303RKDS"],
        "2020": [
          "243RBS",
          "261BH",
          "263BHS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283RKS",
          "293QBCK",
          "303RKDS"
        ],
        "2021": [
          "243RBS",
          "261BH",
          "263BHS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283RKS",
          "293QBCK",
          "303RKDS"
        ],
        "2022": [
          "243RBS",
          "261BH",
          "263BHS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283EPIC",
          "283RKS",
          "293QBCK",
          "303RKDS"
        ],
        "2023": [
          "243RBS",
          "261BH",
          "263BHS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283EPIC",
          "283RKS",
          "283RNR",
          "293QBCK",
          "303RKDS"
        ],
        "2024": [
          "243RBS",
          "261BH",
          "263BHS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283EPIC",
          "283RKS",
          "283RNR",
          "293QBCK",
          "303RKDS"
        ],
        "2025": [
          "243RBS",
          "261BH",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283EPIC",
          "283RKS",
          "283RNR",
          "293QBCK",
          "303RKDS"
        ],
        "2026": [
          "243RBS",
          "263BHSCK",
          "263FKDS",
          "273DBHCK",
          "283EPIC",
          "283RKS",
          "283RNR",
          "293QBCK",
          "303RKDS"
        ]
      },
      lengthRange: [
        26,
        36
      ],
      weightRange: [
        5500,
        8500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        28900,
        56000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 38,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Coachmen Catalina (Legacy Edition) — high-volume family TT. Popular 283RKS / 283EPIC / 263BHSCK. Half-ton capable on many plans."
    },
    Galleria: {
      type: "Class B",
      floorplans: ["24A", "24FL", "24Q", "24T"],
      floorplansByYear: {
        "2016": ["24A", "24FL"],
        "2017": ["24A", "24FL"],
        "2018": ["24A", "24FL"],
        "2019": ["24A", "24FL", "24Q"],
        "2020": ["24A", "24FL", "24Q"],
        "2021": ["24A", "24FL", "24Q", "24T"],
        "2022": ["24A", "24FL", "24Q", "24T"],
        "2023": ["24A", "24FL", "24Q", "24T"],
        "2024": ["24A", "24E", "24FL", "24Q", "24T"],
        "2025": ["24A", "24E", "24FL", "24Q", "24T"],
        "2026": ["24A", "24E", "24FL", "24Q", "24T"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10500,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        129900,
        189000
      ],
      engine: "Mercedes-Benz diesel",
      horsepower: 188,
      powertrainByYear: [
        { from: 2016, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes Sprinter" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter" },
      ],
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 20,
      blackWater: 20,
      generator: "None (solar + lithium option)",
      awningLength: 9,
      ceilingHeight: 74,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Coachmen Galleria — flagship Sprinter Class B van conversion."
    },
    Beyond: {
      type: "Class B",
      floorplans: ["22D", "22RB", "22C"],
      floorplansByYear: {
        "2018": ["22D", "22RB"],
        "2019": ["22D", "22RB"],
        "2020": ["22D", "22RB"],
        "2021": ["22D", "22RB", "22C"],
        "2022": ["22D", "22RB", "22C"],
        "2023": ["22D", "22RB", "22C"],
        "2024": ["22D", "22RB", "22C"],
        "2025": ["22D", "22RB"],
        "2026": ["22D", "22RB"]
      },
      lengthRange: [
        22,
        23
      ],
      weightRange: [
        9500,
        11000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        99900,
        149000
      ],
      engine: "Ford Transit 3.5L EcoBoost",
      horsepower: 310,
      powertrainByYear: [
        { from: 2018, to: 2026, engine: "Ford Transit 3.5L EcoBoost", horsepower: 310, chassis: "Ford Transit" },
      ],
      chassis: "Ford Transit",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 24,
      grayWater: 16,
      blackWater: 0,
      generator: "None (solar option)",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Coachmen Beyond — Ford Transit Class B value alternative to Sprinter vans."
    },
    Apex: {
      type: "Travel Trailer",
      floorplans: ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
      floorplansByYear: {
        "2012": ["213RDS", "245BHS", "249RBS"],
        "2013": ["213RDS", "245BHS", "249RBS"],
        "2014": ["213RDS", "245BHS", "249RBS", "251RBK"],
        "2015": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2016": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2017": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2018": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2019": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2020": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2021": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2022": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2023": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2024": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2025": ["213RDS", "245BHS", "249RBS", "251RBK", "288BHS"],
        "2026": ["213RDS", "245BHS", "249RBS", "251RBK"]
      },
      lengthRange: [
        21,
        30
      ],
      weightRange: [
        4000,
        6500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        22900,
        44000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Coachmen Apex — ultra-lightweight aluminum-framed travel trailer for half-ton towers."
    },
    Pursuit: {
      type: "Class A Gas",
      floorplans: ["29SS", "31BH", "33BH", "33XPS"],
      floorplansByYear: {
        "2010": ["29SS", "31BH", "33BH"],
        "2011": ["29SS", "31BH", "33BH"],
        "2012": ["29SS", "31BH", "33BH", "33XPS"],
        "2013": ["29SS", "31BH", "33BH", "33XPS"],
        "2014": ["29SS", "31BH", "33BH", "33XPS"],
        "2015": ["29SS", "31BH", "33BH", "33XPS"],
        "2016": ["29SS", "31BH", "33BH", "33XPS"],
        "2017": ["29SS", "31BH", "33BH", "33XPS"],
        "2018": ["29SS", "31BH", "33BH", "33XPS"],
        "2019": ["29SS", "31BH", "33BH", "33XPS"],
        "2020": ["29SS", "31BH", "33BH", "33XPS"],
        "2021": ["29SS", "31BH", "33BH", "33XPS"],
        "2022": ["29SS", "31BH", "33BH", "33XPS"],
        "2023": ["29SS", "31BH", "33BH"],
        "2024": ["29SS", "31BH", "33BH"],
        "2025": ["29SS", "31BH", "33BH"],
        "2026": ["29SS", "31BH", "33BH"]
      },
      lengthRange: [
        29,
        33
      ],
      weightRange: [
        20000,
        25000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        89900,
        144000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 70,
      grayWater: 38,
      blackWater: 38,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 2,
      yearStart: 2006,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "Coachmen Pursuit — entry gas Class A, family bunkhouse layouts."
    },
    Chaparral: {
      type: "Fifth Wheel",
      floorplans: ["336TSIK", "360IBL", "373MBRB", "370FL"],
      floorplansByYear: {
        "2010": ["336TSIK", "360IBL"],
        "2011": ["336TSIK", "360IBL"],
        "2012": ["336TSIK", "360IBL", "373MBRB"],
        "2013": ["336TSIK", "360IBL", "373MBRB"],
        "2014": ["336TSIK", "360IBL", "373MBRB"],
        "2015": ["336TSIK", "360IBL", "373MBRB"],
        "2016": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2017": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2018": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2019": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2020": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2021": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2022": ["336TSIK", "360IBL", "373MBRB", "370FL"],
        "2023": ["336TSIK", "360IBL", "373MBRB"],
        "2024": ["336TSIK", "360IBL", "373MBRB"],
        "2025": ["336TSIK", "360IBL", "373MBRB"],
        "2026": ["336TSIK", "360IBL", "373MBRB"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        54900,
        94900
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Coachmen Chaparral — popular fifth wheel with bunkhouse and rear living family floorplans."
    },
    Brookstone: {
      type: "Fifth Wheel",
      floorplans: ["390RL", "395RL", "398MB"],
      floorplansByYear: {
        "2012": ["390RL", "395RL"],
        "2013": ["390RL", "395RL"],
        "2014": ["390RL", "395RL", "398MB"],
        "2015": ["390RL", "395RL", "398MB"],
        "2016": ["390RL", "395RL", "398MB"],
        "2017": ["390RL", "395RL", "398MB"],
        "2018": ["390RL", "395RL", "398MB"],
        "2019": ["390RL", "395RL", "398MB"],
        "2020": ["390RL", "395RL", "398MB"],
        "2021": ["390RL", "395RL", "398MB"],
        "2022": ["390RL", "395RL", "398MB"],
        "2023": ["390RL", "395RL", "398MB"],
        "2024": ["390RL", "395RL", "398MB"],
        "2025": ["390RL", "395RL"],
        "2026": ["390RL", "395RL"]
      },
      lengthRange: [
        38,
        42
      ],
      weightRange: [
        12000,
        16000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        69900,
        119000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 90,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Coachmen Brookstone — higher-end fifth wheel for full-time and extended-stay owners."
    },
    Adrenaline: {
      type: "Toy Hauler",
      floorplans: ["23LT", "29SS", "33OT"],
      floorplansByYear: {
        "2014": ["23LT", "29SS"],
        "2015": ["23LT", "29SS", "33OT"],
        "2016": ["23LT", "29SS", "33OT"],
        "2017": ["23LT", "29SS", "33OT"],
        "2018": ["23LT", "29SS", "33OT"],
        "2019": ["23LT", "29SS", "33OT"],
        "2020": ["23LT", "29SS", "33OT"],
        "2021": ["23LT", "29SS", "33OT"],
        "2022": ["23LT", "29SS", "33OT"],
        "2023": ["23LT", "29SS", "33OT"],
        "2024": ["23LT", "29SS", "33OT"],
        "2025": ["23LT", "29SS", "33OT"],
        "2026": ["23LT", "29SS"]
      },
      lengthRange: [
        26,
        36
      ],
      weightRange: [
        6000,
        11000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        39900,
        74900
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 55,
      grayWater: 32,
      blackWater: 32,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2014,
      generator: "Generator prep / optional 4kW",
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 2500,
      rampWidthFt: 7.5,
      fuelStationGal: 20,
      generatorFuelGal: 20,
      garageFits: "1 UTV or dual bikes",
      description: "Coachmen Adrenaline — toy hauler with ramp patio and garage sofas."
    },
    "Freelander LE": {
      type: "Class C",
      floorplans: ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
      floorplansByYear: {
        "2015": ["21RS", "22XG", "26DS", "27QB"],
        "2016": ["21RS", "22XG", "24BH", "26DS", "27QB"],
        "2017": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2018": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2019": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2020": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2021": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2022": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2023": ["21RS", "22XG", "24BH", "26DS", "27QB", "28BH"],
        "2024": ["21RS", "22XG", "26DS", "27QB", "28BH"],
        "2025": ["21RS", "22XG", "26DS", "27QB"],
        "2026": ["21RS", "22XG", "26DS", "27QB"]
      },
      lengthRange: [
        21,
        28
      ],
      weightRange: [
        10000,
        13000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        84900,
        129000
      ],
      engine: "Ford 7.3L / 6.2L",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2015,
      powertrainByYear: [
                {
          from: 2015,
          to: 2015,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        }
      ],
      description: "Freelander LE — value Class C package with essential features."
    },
    Concord: {
      type: "Class C",
      floorplans: ["280DS", "290DS", "300DS", "310BH", "320BH"],
      floorplansByYear: {
        "2010": ["280DS", "300DS", "310BH"],
        "2011": ["280DS", "300DS", "310BH"],
        "2012": ["280DS", "290DS", "300DS", "310BH"],
        "2013": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2014": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2015": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2016": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2017": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2018": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2019": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2020": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2021": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2022": ["280DS", "290DS", "300DS", "310BH", "320BH"],
        "2023": ["280DS", "300DS", "310BH", "320BH"],
        "2024": ["280DS", "300DS", "310BH"],
        "2025": ["280DS", "300DS", "310BH"],
        "2026": ["280DS", "300DS"]
      },
      lengthRange: [
        28,
        33
      ],
      weightRange: [
        13000,
        15500
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        109900,
        164000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 48,
      grayWater: 32,
      blackWater: 32,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2010,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        }
      ],
      description: "Coachmen Concord — mid-size Class C with dual slides and bunk options."
    },
    "Leprechaun Premier": {
      type: "Class C",
      floorplans: ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
      floorplansByYear: {
        "2016": ["260FS", "280BH", "298KB", "311FS", "319MB"],
        "2017": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2018": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2019": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2020": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2021": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2022": ["260FS", "280BH", "298KB", "300BH", "311FS", "319MB"],
        "2023": ["260FS", "280BH", "298KB", "311FS", "319MB"],
        "2024": ["260FS", "280BH", "298KB", "319MB"],
        "2025": ["260FS", "280BH", "298KB", "319MB"],
        "2026": ["260FS", "280BH", "319MB"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        12500,
        15000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        114900,
        169000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      powertrainByYear: [
        { from: 2016, to: 2026, engine: "Ford 7.3L V8", horsepower: 350, chassis: "Ford E-450" },
      ],
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2016,
      description: "Leprechaun Premier — upgraded Leprechaun interiors and residential appointments."
    },
    "Sportscoach SRS Super C": {
      type: "Super C",
      floorplans: ["339DS", "350RB", "365RB", "376DB"],
      floorplansByYear: {
        "2018": ["339DS", "365RB"],
        "2019": ["339DS", "350RB", "365RB"],
        "2020": ["339DS", "350RB", "365RB", "376DB"],
        "2021": ["339DS", "350RB", "365RB", "376DB"],
        "2022": ["339DS", "350RB", "365RB", "376DB"],
        "2023": ["339DS", "350RB", "365RB", "376DB"],
        "2024": ["339DS", "350RB", "365RB", "376DB"],
        "2025": ["339DS", "350RB", "365RB"],
        "2026": ["339DS", "350RB", "365RB"]
      },
      lengthRange: [
        33,
        38
      ],
      weightRange: [
        24000,
        30000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        229900,
        329000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      powertrainByYear: [
        { from: 2018, to: 2026, engine: "Ford Power Stroke 6.7L Diesel", horsepower: 330, chassis: "Ford F-550" },
      ],
      chassis: "Ford F-550",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 6000W Diesel",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Coachmen Sportscoach Super C — diesel F-550 high tow ratings in the Sportscoach family."
    }
  },
  Winnebago: {
    Forza: {
      type: "Class A Diesel",
      floorplans: ["34T", "36G", "38W", "36H", "38R"],
      floorplansByYear: {
        "2016": ["34T", "36G"],
        "2017": ["34T", "36G", "38W"],
        "2018": ["34T", "36G", "38W"],
        "2019": ["34T", "36H", "38W"],
        "2020": ["34T", "36H", "38W"],
        "2021": ["34T", "36H", "38W"],
        "2022": ["34T", "36H", "38W"],
        "2023": ["34T", "36H", "38W"],
        "2024": ["34T", "36H", "38W", "38R"],
        "2025": ["34T", "36H", "38W"],
        "2026": ["34T", "36H", "38W"]
      },
      lengthRange: [
        34,
        39
      ],
      weightRange: [
        28000,
        34000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        299000,
        389000
      ],
      engine: "Cummins B6.7 340HP",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner XC-Series",
      transmission: "Allison 2500/3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 85,
      grayWater: 51,
      blackWater: 51,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2016,
      description: "Winnebago Forza is the current mid-diesel Class A — Freightliner XC with Cummins B6.7 340 hp.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2026,
          engine: "Cummins B6.7 (ISB) 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC-Series",
          transmission: "Allison automatic",
          notes: "Not ISL 8.9 — B6.7 mid-diesel pusher"
        }
      ]
    },
    Journey: {
      type: "Class A Diesel",
      floorplans: ["34G", "36M", "40R", "42E", "34H", "39Z"],
      floorplansByYear: {
        "2005": ["34G", "36M", "40R"],
        "2006": ["34G", "36M", "40R"],
        "2007": ["34G", "36M", "40R"],
        "2008": ["34G", "36M", "40R"],
        "2009": ["34G", "36M", "40R", "42E"],
        "2010": ["34G", "36M", "40R", "42E"],
        "2011": ["34G", "36M", "40R", "42E"],
        "2012": ["34G", "36M", "40R", "42E"],
        "2013": ["34G", "36M", "40R", "42E"],
        "2014": ["34G", "36M", "40R", "42E"],
        "2015": ["34G", "36M", "40R", "42E"],
        "2016": ["34G", "36M", "40R", "42E"],
        "2017": ["34G", "36M", "40R"],
        "2018": ["34G", "34H", "36M", "40R"],
        "2019": ["34G", "34H", "36M", "39Z", "40R"],
        "2020": ["34G", "34H", "36M", "39Z", "40R"],
        "2021": ["34G", "34H", "36M", "39Z"],
        "2022": ["34G", "34H", "36M"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        30000,
        38000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        349000
      ],
      engine: "Cummins B6.7 340HP",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner XCS / XC",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 1,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 46,
      blackWater: 46,
      fuelCapacityGal: 90,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2002,
      yearEnd: 2022,
      description: "Winnebago Journey diesel pusher — Freightliner with Cummins B6.7/ISB-class power (not ISL 8.9).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XCS / XC",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
        {
          from: 2010,
          to: 2014,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XCS / XC",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2015,
          to: 2022,
          engine: "Cummins B6.7 / ISB 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XCS",
          notes: "Corrected from outdated ISL label"
        }
      ]
    },
    Horizon: {
      type: "Class A Diesel",
      floorplans: ["40A", "42Q", "42G"],
      floorplansByYear: {
        "2018": ["40A", "42Q"],
        "2019": ["40A", "42Q", "42G"],
        "2020": ["40A", "42Q", "42G"],
        "2021": ["40A", "42Q", "42G"],
        "2022": ["40A", "42Q", "42G"],
        "2023": ["40A", "42Q"],
        "2024": ["40A", "42Q"],
        "2025": ["40A", "42Q"],
        "2026": ["40A", "42Q"]
      },
      lengthRange: [
        40,
        43
      ],
      weightRange: [
        38000,
        46000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        389000,
        529000
      ],
      engine: "Cummins L9 450HP",
      horsepower: 450,
      powertrainByYear: [
        { from: 2018, to: 2026, engine: "Cummins L9 450HP", horsepower: 450, chassis: "Freightliner / Maxum (by year)", transmission: "Allison 3000 MH" },
      ],
      torqueLbFt: 1250,
      chassis: "Freightliner / Maxum (by year)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 62,
      blackWater: 40,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Diesel QD",
      awningLength: 20,
      ceilingHeight: 84,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Winnebago Horizon — premium diesel Class A, L9-class power on Freightliner/Maxum platforms."
    },
    "Grand Tour": {
      type: "Class A Diesel",
      floorplans: ["42QDP", "45RL", "45QB"],
      floorplansByYear: {
        "2005": ["42QDP", "45RL"],
        "2006": ["42QDP", "45RL"],
        "2007": ["42QDP", "45RL"],
        "2008": ["42QDP", "45RL"],
        "2009": ["42QDP", "45RL"],
        "2010": ["42QDP", "45RL"],
        "2011": ["42QDP", "45RL"],
        "2012": ["42QDP", "45RL"],
        "2013": ["42QDP", "45RL"],
        "2014": ["42QDP", "45RL"],
        "2015": ["42QDP", "45RL"],
        "2016": ["42QDP", "45RL"],
        "2017": ["42QDP", "45RL", "45QB"],
        "2018": ["42QDP", "45RL", "45QB"],
        "2019": ["42QDP", "45RL"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        44000,
        50000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        379900,
        569000
      ],
      engine: "Cummins ISX / L9 (by year)",
      horsepower: 450,
      chassis: "Spartan / Freightliner (by year)",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2005,
      yearEnd: 2019,
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan / Freightliner (by year)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan / Freightliner (by year)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        
      ],
      description: "Winnebago Grand Tour — discontinued ultra-luxury diesel. Verify year-specific chassis/engine on sticker."
    },
    Via: {
      type: "Class A Diesel",
      floorplans: ["25P", "25T"],
      floorplansByYear: {
        "2013": ["25P", "25T"],
        "2014": ["25P", "25T"],
        "2015": ["25P", "25T"],
        "2016": ["25P", "25T"],
        "2017": ["25P", "25T"],
        "2018": ["25P", "25T"],
        "2019": ["25P", "25T"],
        "2020": ["25P", "25T"],
        "2021": ["25P", "25T"]
      },
      lengthRange: [
        25,
        26
      ],
      weightRange: [
        11000,
        13000
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        189000,
        249000
      ],
      engine: "Mercedes-Benz 3.0L turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter cowl",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 37,
      grayWater: 36,
      blackWater: 36,
      generator: "Optional",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2013,
      yearEnd: 2021,
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Mercedes-Benz Sprinter cowl",
          notes: "2010–2015 mid/high diesel Class A"
        },
        
      ],
      description: "Winnebago Via — compact Sprinter-based Class A diesel (~25 ft)."
    },
    Vista: {
      type: "Class A Gas",
      floorplans: ["26P", "27P", "31B", "35F", "29VE", "33W", "32M"],
      floorplansByYear: {
        "2010": ["26P", "27P", "31B", "35F"],
        "2011": ["26P", "27P", "31B", "35F"],
        "2012": ["26P", "27P", "31B", "35F"],
        "2013": ["26P", "27P", "31B", "35F"],
        "2014": ["26P", "27P", "31B", "35F"],
        "2015": ["26P", "27P", "31B", "35F"],
        "2016": ["26P", "27P", "31B", "35F"],
        "2017": ["26P", "27P", "29VE", "31B", "35F"],
        "2018": ["27P", "29VE", "31B", "33W", "35F"],
        "2019": ["27P", "29VE", "31B", "33W", "35F"],
        "2020": ["27P", "29VE", "31B", "33W", "35F"],
        "2021": ["27P", "29VE", "31B", "33W", "35F"],
        "2022": ["27P", "29VE", "31B", "33W", "35F"],
        "2023": ["27P", "29VE", "31B", "33W", "35F"],
        "2024": ["27P", "29VE", "31B", "32M", "35F"],
        "2025": ["27P", "29VE", "31B", "35F"],
        "2026": ["27P", "29VE", "31B", "35F"]
      },
      lengthRange: [
        27,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        159000,
        239000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford F53",
      transmission: "TorqShift automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 74,
      grayWater: 41,
      blackWater: 41,
      fuelCapacityGal: 80,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Winnebago Vista — mainstream gas Class A on Ford F53. Newer years 7.3L V8 (not Triton V10).",
      powertrainByYear: [
        {
          from: 2010,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53",
          notes: "Replaced V10 on F53 gas Class A"
        }
      ]
    },
    Sunstar: {
      type: "Class A Gas",
      floorplans: ["27N", "29VE", "30T", "35F", "31B"],
      floorplansByYear: {
        "2010": ["27N", "29VE", "30T", "35F"],
        "2011": ["27N", "29VE", "30T", "35F"],
        "2012": ["27N", "29VE", "30T", "35F"],
        "2013": ["27N", "29VE", "30T", "35F"],
        "2014": ["27N", "29VE", "30T", "35F"],
        "2015": ["27N", "29VE", "30T", "35F"],
        "2016": ["27N", "29VE", "30T", "35F"],
        "2017": ["27N", "29VE", "30T", "35F"],
        "2018": ["27N", "29VE", "30T", "31B", "35F"],
        "2019": ["27N", "29VE", "30T", "31B", "35F"],
        "2020": ["27N", "29VE", "30T", "31B", "35F"],
        "2021": ["27N", "29VE", "30T", "31B", "35F"],
        "2022": ["27N", "29VE", "30T", "31B", "35F"],
        "2023": ["27N", "29VE", "31B", "35F"],
        "2024": ["27N", "29VE", "31B", "35F"],
        "2025": ["27N", "29VE", "31B", "35F"],
        "2026": ["27N", "29VE", "31B", "35F"]
      },
      lengthRange: [
        27,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        154000,
        229000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 72,
      grayWater: 38,
      blackWater: 36,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Winnebago Sunstar — gas Class A companion to Vista (Itasca heritage). Ford F53 7.3L on recent years.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Intent: {
      type: "Class A Gas",
      floorplans: ["26M", "29L", "30R", "31P"],
      floorplansByYear: {
        "2019": ["26M", "29L"],
        "2020": ["26M", "29L", "30R"],
        "2021": ["26M", "29L", "30R", "31P"],
        "2022": ["26M", "29L", "30R", "31P"],
        "2023": ["26M", "29L", "30R", "31P"],
        "2024": ["26M", "29L", "30R", "31P"],
        "2025": ["26M", "29L", "31P"],
        "2026": ["26M", "29L", "31P"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        14000,
        18000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        139000,
        199000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      powertrainByYear: [
        { from: 2019, to: 2020, engine: "Ford Triton V10 6.8L", horsepower: 320, chassis: "Ford F53", transmission: "TorqShift 6-spd Auto" },
        { from: 2021, to: 2026, engine: "Ford 7.3L V8 Godzilla", horsepower: 350, chassis: "Ford F53", transmission: "TorqShift 6-spd Auto" },
      ],
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 41,
      blackWater: 41,
      generator: "Onan 4000–5500W Gas",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2019,
      description: "Winnebago Intent — entry/mid gas Class A, Ford F53 7.3L."
    },
    Adventurer: {
      type: "Class A Gas",
      floorplans: ["29V", "30T", "32H", "35F", "36Z"],
      floorplansByYear: {
        "2005": ["29V", "30T", "32H"],
        "2006": ["29V", "30T", "32H"],
        "2007": ["29V", "30T", "32H"],
        "2008": ["29V", "30T", "32H"],
        "2009": ["29V", "30T", "32H", "35F"],
        "2010": ["29V", "30T", "32H", "35F"],
        "2011": ["29V", "30T", "32H", "35F"],
        "2012": ["29V", "30T", "32H", "35F"],
        "2013": ["29V", "30T", "32H", "35F", "36Z"],
        "2014": ["29V", "30T", "32H", "35F", "36Z"],
        "2015": ["29V", "30T", "32H", "35F", "36Z"],
        "2016": ["29V", "30T", "32H", "35F", "36Z"],
        "2017": ["29V", "30T", "32H", "35F", "36Z"],
        "2018": ["29V", "30T", "32H", "35F", "36Z"],
        "2019": ["29V", "30T", "32H", "35F"],
        "2020": ["29V", "30T", "35F"],
        "2021": ["29V", "30T", "35F"]
      },
      lengthRange: [
        29,
        36
      ],
      weightRange: [
        18000,
        24000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        139900,
        219000
      ],
      engine: "Ford Triton V10 6.8L / 7.3L (by year)",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 38,
      blackWater: 38,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2021,
      description: "Winnebago Adventurer — long-running gas Class A. Pre-2020 often V10; later F53 gas moved toward 7.3L.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2021,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    "Itasca Sunstar": {
      type: "Class A Gas",
      floorplans: ["27N", "29VE", "30T", "35F"],
      floorplansByYear: {
        "2005": ["27N", "29VE", "30T"],
        "2006": ["27N", "29VE", "30T"],
        "2007": ["27N", "29VE", "30T"],
        "2008": ["27N", "29VE", "30T"],
        "2009": ["27N", "29VE", "30T", "35F"],
        "2010": ["27N", "29VE", "30T", "35F"],
        "2011": ["27N", "29VE", "30T", "35F"],
        "2012": ["27N", "29VE", "30T", "35F"],
        "2013": ["27N", "29VE", "30T", "35F"],
        "2014": ["27N", "29VE", "30T", "35F"],
        "2015": ["27N", "29VE", "30T", "35F"],
        "2016": ["27N", "29VE", "30T", "35F"],
        "2017": ["27N", "29VE", "30T", "35F"],
        "2018": ["27N", "29VE", "30T", "35F"],
        "2019": ["27N", "29VE", "30T", "35F"]
      },
      lengthRange: [
        27,
        35
      ],
      weightRange: [
        18000,
        24000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129900,
        199000
      ],
      engine: "Ford Triton V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 72,
      grayWater: 38,
      blackWater: 36,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2005,
      yearEnd: 2019,
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        }
      ],
      description: "Itasca Sunstar (legacy) — gas Class A; later continued as Winnebago Sunstar."
    },
    Revel: {
      type: "Class B",
      floorplans: ["44E"],
      floorplansByYear: {
        "2018": ["44E"],
        "2019": ["44E"],
        "2020": ["44E"],
        "2021": ["44E"],
        "2022": ["44E"],
        "2023": ["44E"],
        "2024": ["44E"],
        "2025": ["44E"],
        "2026": ["44E"]
      },
      lengthRange: [
        19,
        20
      ],
      weightRange: [
        9000,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        189000,
        239000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel",
      horsepower: 208,
      chassis: "Mercedes-Benz Sprinter 4x4",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 21,
      grayWater: 21,
      blackWater: 5,
      generator: "None (lithium + solar)",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1958,
      warrantyYears: 3,
      yearStart: 2018,
      description: "Winnebago Revel — 4x4 Sprinter adventure Class B; lithium/solar off-grid focus.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Sprinter 4x4"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Sprinter 4x4"
        }
      ]
    },
    Travato: {
      type: "Class B",
      floorplans: ["59G", "59K", "59KL"],
      floorplansByYear: {
        "2014": ["59G", "59K"],
        "2015": ["59G", "59K"],
        "2016": ["59G", "59K"],
        "2017": ["59G", "59K"],
        "2018": ["59G", "59K"],
        "2019": ["59G", "59K", "59KL"],
        "2020": ["59G", "59K", "59KL"],
        "2021": ["59G", "59K", "59KL"],
        "2022": ["59G", "59K", "59KL"],
        "2023": ["59G", "59K", "59KL"],
        "2024": ["59G", "59K", "59KL"],
        "2025": ["59G", "59K", "59KL"],
        "2026": ["59G", "59K", "59KL"]
      },
      lengthRange: [
        21,
        21
      ],
      weightRange: [
        8500,
        9500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        149000,
        189000
      ],
      engine: "RAM 3.6L V6 gas",
      horsepower: 276,
      chassis: "RAM ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 21,
      grayWater: 13,
      blackWater: 13,
      generator: "Optional / lithium packages",
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2014,
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "RAM 3.6L V6 gas",
          horsepower: 180,
          chassis: "RAM ProMaster",
          notes: "2005–2015 Class B — chassis varies by package"
        }
      ],
      description: "Winnebago Travato — ProMaster Class B (59G/59K packs)."
    },
    Solis: {
      type: "Class B",
      floorplans: ["59P", "59PX", "59PO"],
      floorplansByYear: {
        "2019": ["59P"],
        "2020": ["59P", "59PX"],
        "2021": ["59P", "59PX", "59PO"],
        "2022": ["59P", "59PX", "59PO"],
        "2023": ["59P", "59PX", "59PO"],
        "2024": ["59P", "59PX", "59PO"],
        "2025": ["59P", "59PX"],
        "2026": ["59P", "59PX"]
      },
      lengthRange: [
        19,
        21
      ],
      weightRange: [
        8000,
        9500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        129000,
        169000
      ],
      engine: "RAM 3.6L V6 gas",
      horsepower: 276,
      powertrainByYear: [
        { from: 2019, to: 2026, engine: "RAM 3.6L V6 gas", horsepower: 276, chassis: "RAM ProMaster" },
      ],
      chassis: "RAM ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 21,
      grayWater: 13,
      blackWater: 13,
      generator: "Optional",
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Winnebago Solis — compact ProMaster Class B; pop-top options on some trims."
    },
    Boldt: {
      type: "Class B",
      floorplans: ["70KL", "70BL"],
      floorplansByYear: {
        "2020": ["70KL"],
        "2021": ["70KL", "70BL"],
        "2022": ["70KL", "70BL"],
        "2023": ["70KL", "70BL"],
        "2024": ["70KL", "70BL"],
        "2025": ["70KL", "70BL"],
        "2026": ["70KL", "70BL"]
      },
      lengthRange: [
        22,
        23
      ],
      weightRange: [
        9000,
        10500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        179000,
        219000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel",
      horsepower: 208,
      powertrainByYear: [
        { from: 2020, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 208, chassis: "Mercedes-Benz Sprinter" },
      ],
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 21,
      grayWater: 21,
      blackWater: 13,
      generator: "Lithium-focused packages",
      awningLength: 12,
      ceilingHeight: 74,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Winnebago Boldt — premium Sprinter Class B."
    },
    Era: {
      type: "Class B",
      floorplans: ["70A", "70B"],
      floorplansByYear: {
        "2010": ["70A", "70B"],
        "2011": ["70A", "70B"],
        "2012": ["70A", "70B"],
        "2013": ["70A", "70B"],
        "2014": ["70A", "70B"],
        "2015": ["70A", "70B"],
        "2016": ["70A", "70B"],
        "2017": ["70A", "70B"],
        "2018": ["70A", "70B"],
        "2019": ["70A", "70B"],
        "2020": ["70A", "70B"],
        "2021": ["70A", "70B"],
        "2022": ["70A", "70B"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        9000,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        169000,
        209000
      ],
      engine: "Mercedes-Benz turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 27,
      grayWater: 24,
      blackWater: 13,
      generator: "Optional",
      awningLength: 12,
      ceilingHeight: 74,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2010,
      yearEnd: 2022,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel",
          horsepower: 180,
          chassis: "Mercedes-Benz Sprinter",
          notes: "2005–2015 Class B — chassis varies by package"
        }
      ],
      description: "Winnebago Era — earlier Sprinter Class B generation."
    },
    View: {
      type: "Class C",
      floorplans: ["24G", "24J", "24V", "24H", "24D", "24R", "24T"],
      floorplansByYear: {
        "2006": ["24G", "24J", "24V"],
        "2007": ["24G", "24J", "24V"],
        "2008": ["24G", "24J", "24V"],
        "2009": ["24G", "24J", "24V"],
        "2010": ["24G", "24J", "24V"],
        "2011": ["24G", "24J", "24V"],
        "2012": ["24G", "24J", "24V"],
        "2013": ["24G", "24J", "24V"],
        "2014": ["24G", "24J", "24V"],
        "2015": ["24G", "24J", "24V"],
        "2016": ["24G", "24J", "24V"],
        "2017": ["24G", "24J", "24V", "24H"],
        "2018": ["24D", "24G", "24J", "24V"],
        "2019": ["24D", "24G", "24J", "24V"],
        "2020": ["24D", "24G", "24J", "24V"],
        "2021": ["24D", "24G", "24J", "24V"],
        "2022": ["24D", "24J", "24V", "24G"],
        "2023": ["24D", "24J", "24V", "24G"],
        "2024": ["24D", "24J", "24V", "24G"],
        "2025": ["24D", "24J", "24V", "24R"],
        "2026": ["24D", "24J", "24V", "24R", "24T"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        179000,
        239000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel",
      horsepower: 208,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 26,
      blackWater: 22,
      generator: "Onan 2.5–3.6kW LP/Diesel options",
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2006,
      description: "Winnebago View — flagship Sprinter Class C. Newer 2.0 I4 ~208 hp; earlier 3.0 V6 diesel.",
      powertrainByYear: [
        {
          from: 2006,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2014,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Navion: {
      type: "Class C",
      floorplans: ["24G", "24J", "24V", "24H", "24D", "24P"],
      floorplansByYear: {
        "2006": ["24G", "24J", "24V"],
        "2007": ["24G", "24J", "24V"],
        "2008": ["24G", "24J", "24V"],
        "2009": ["24G", "24J", "24V"],
        "2010": ["24G", "24J", "24V"],
        "2011": ["24G", "24J", "24V"],
        "2012": ["24G", "24J", "24V"],
        "2013": ["24G", "24J", "24V"],
        "2014": ["24G", "24J", "24V"],
        "2015": ["24G", "24J", "24V"],
        "2016": ["24G", "24J", "24V"],
        "2017": ["24G", "24J", "24V", "24H"],
        "2018": ["24D", "24G", "24J", "24V"],
        "2019": ["24D", "24G", "24J", "24V", "24P"],
        "2020": ["24D", "24G", "24J", "24V"],
        "2021": ["24D", "24G", "24J", "24V"],
        "2022": ["24D", "24J", "24V", "24G"],
        "2023": ["24D", "24J", "24V", "24G"],
        "2024": ["24D", "24J", "24V", "24G"],
        "2025": ["24D", "24J", "24V"],
        "2026": ["24D", "24J", "24V"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        169000,
        229000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel",
      horsepower: 208,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 31,
      grayWater: 26,
      blackWater: 26,
      generator: "Optional Onan 2.5–3.6kW",
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2006,
      description: "Winnebago Navion — View twin. Same Sprinter diesel family by year.",
      powertrainByYear: [
        {
          from: 2006,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2014,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Porto: {
      type: "Class C",
      floorplans: ["24P", "24J", "24V"],
      floorplansByYear: {
        "2019": ["24P", "24J"],
        "2020": ["24P", "24J", "24V"],
        "2021": ["24P", "24J", "24V"],
        "2022": ["24P", "24J", "24V"],
        "2023": ["24P", "24J"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        144900,
        189000
      ],
      engine: "Mercedes-Benz turbodiesel",
      horsepower: 188,
      powertrainByYear: [
        { from: 2019, to: 2023, engine: "Mercedes-Benz turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter" },
      ],
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 24,
      blackWater: 24,
      generator: "Optional",
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2019,
      yearEnd: 2023,
      description: "Winnebago Porto — Sprinter Class C, European-inspired packages."
    },
    Vita: {
      type: "Class C",
      floorplans: ["24P", "24J", "24F"],
      floorplansByYear: {
        "2018": ["24P", "24J"],
        "2019": ["24P", "24F", "24J"],
        "2020": ["24P", "24F", "24J"],
        "2021": ["24P", "24J"],
        "2022": ["24P", "24J"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        9500,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        129900,
        169000
      ],
      engine: "Mercedes-Benz turbodiesel",
      horsepower: 188,
      powertrainByYear: [
        { from: 2018, to: 2022, engine: "Mercedes-Benz turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter" },
      ],
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 22,
      blackWater: 22,
      generator: "Optional",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2018,
      yearEnd: 2022,
      description: "Winnebago Vita — value Sprinter Class C."
    },
    EKKO: {
      type: "Class C",
      floorplans: ["22A", "23B"],
      floorplansByYear: {
        "2021": ["22A", "23B"],
        "2022": ["22A", "23B"],
        "2023": ["22A", "23B"],
        "2024": ["22A", "23B"],
        "2025": ["22A", "23B"],
        "2026": ["22A", "23B"]
      },
      lengthRange: [
        22,
        24
      ],
      weightRange: [
        9000,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        189000,
        249000
      ],
      engine: "Ford / Mercedes (by floorplan)",
      horsepower: 208,
      chassis: "Ford Transit AWD or Mercedes Sprinter AWD",
      fuelType: "Gas / Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 40,
      blackWater: 5,
      generator: "Lithium + solar focused",
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Winnebago EKKO — adventure Class C: 22A Ford Transit AWD, 23B Sprinter AWD.",
      powertrainByYear: [
        { from: 2021, to: 2026,
          engine: "22A: Ford 3.5L EcoBoost · 23B: Mercedes turbodiesel",
          horsepower: 310,
          chassis: "Transit AWD or Sprinter AWD",
          notes: "Floorplan determines chassis"
        }
      ]
    },
    Spirit: {
      type: "Class C",
      floorplans: ["22M", "25B", "26T", "31H", "31G", "27Q", "30D"],
      floorplansByYear: {
        "2005": ["22M", "25B", "26T"],
        "2006": ["22M", "25B", "26T"],
        "2007": ["22M", "25B", "26T"],
        "2008": ["22M", "25B", "26T"],
        "2009": ["22M", "25B", "26T", "31H"],
        "2010": ["22M", "25B", "26T", "31H"],
        "2011": ["22M", "25B", "26T", "31H"],
        "2012": ["22M", "25B", "26T", "31H"],
        "2013": ["22M", "25B", "26T", "31H", "31G"],
        "2014": ["22M", "25B", "26T", "31H", "31G"],
        "2015": ["22M", "25B", "26T", "31H", "31G"],
        "2016": ["22M", "25B", "26T", "31H", "31G"],
        "2017": ["22M", "25B", "26T", "27Q", "31H", "31G"],
        "2018": ["22M", "25B", "26T", "27Q", "30D", "31H"],
        "2019": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H"],
        "2020": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H"],
        "2021": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H"],
        "2022": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H"],
        "2023": ["22M", "25B", "26T", "27Q", "31G", "31H"],
        "2024": ["22M", "25B", "26T", "27Q", "31G", "31H"],
        "2025": ["22M", "25B", "26T", "31G", "31H"],
        "2026": ["22M", "25B", "26T", "31G", "31H"]
      },
      lengthRange: [
        22,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        99900,
        169000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Winnebago Spirit — Ford E-450 Class C. Recent years 7.3L ~350 hp.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2019,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    "Minnie Winnie": {
      type: "Class C",
      floorplans: ["22M", "25B", "26T", "31H", "31K", "31G", "27Q", "30D"],
      floorplansByYear: {
        "2005": ["22M", "25B", "26T"],
        "2006": ["22M", "25B", "26T"],
        "2007": ["22M", "25B", "26T"],
        "2008": ["22M", "25B", "26T"],
        "2009": ["22M", "25B", "26T", "31H"],
        "2010": ["22M", "25B", "26T", "31H"],
        "2011": ["22M", "25B", "26T", "31H"],
        "2012": ["22M", "25B", "26T", "31H"],
        "2013": ["22M", "25B", "26T", "31H", "31K", "31G"],
        "2014": ["22M", "25B", "26T", "31H", "31K", "31G"],
        "2015": ["22M", "25B", "26T", "31H", "31K", "31G"],
        "2016": ["22M", "25B", "26T", "31H", "31K", "31G"],
        "2017": ["22M", "25B", "26T", "27Q", "31H", "31K"],
        "2018": ["22M", "25B", "26T", "27Q", "30D", "31H", "31K"],
        "2019": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H", "31K"],
        "2020": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H", "31K"],
        "2021": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H", "31K"],
        "2022": ["22M", "25B", "26T", "27Q", "30D", "31G", "31H", "31K"],
        "2023": ["22M", "25B", "26T", "27Q", "31G", "31H", "31K"],
        "2024": ["22M", "25B", "26T", "27Q", "31G", "31H", "31K"],
        "2025": ["22M", "25B", "26T", "31G", "31H", "31K"],
        "2026": ["22M", "25B", "26T", "31G", "31H", "31K"]
      },
      lengthRange: [
        22,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        94900,
        164000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Minnie Winnie — high-volume Class C on Ford E-450; twin to Spirit.",
      powertrainByYear: [
        {
          from: 2000,
          to: 2019,
          engine: "Ford V10 / V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Outlook: {
      type: "Class C",
      floorplans: ["22C", "25J", "27D", "31C"],
      floorplansByYear: {
        "2014": ["22C", "25J", "27D"],
        "2015": ["22C", "25J", "27D"],
        "2016": ["22C", "25J", "27D"],
        "2017": ["22C", "25J", "27D", "31C"],
        "2018": ["22C", "25J", "27D", "31C"],
        "2019": ["22C", "25J", "27D", "31C"],
        "2020": ["22C", "25J", "27D", "31C"],
        "2021": ["22C", "25J", "27D", "31C"],
        "2022": ["22C", "25J", "31C"]
      },
      lengthRange: [
        22,
        31
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        99900,
        159000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2014,
      yearEnd: 2022,
      powertrainByYear: [
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        }
      ],
      description: "Winnebago Outlook — Ford cutaway Class C (limited production years)."
    },
    "Access Super C": {
      type: "Super C",
      floorplans: ["26RP", "28MT", "29MT", "31SR"],
      floorplansByYear: {
        "2021": ["26RP", "28MT", "29MT"],
        "2022": ["26RP", "28MT", "29MT", "31SR"],
        "2023": ["26RP", "28MT", "29MT", "31SR"],
        "2024": ["26RP", "28MT", "29MT", "31SR"],
        "2025": ["26RP", "28MT", "31SR"],
        "2026": ["26RP", "28MT", "31SR"]
      },
      lengthRange: [
        26,
        33
      ],
      weightRange: [
        20000,
        28000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        219000,
        319000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      powertrainByYear: [
        { from: 2021, to: 2026, engine: "Ford Power Stroke 6.7L Diesel", horsepower: 330, chassis: "Ford F-550 Super Duty", transmission: "TorqShift automatic" },
      ],
      torqueLbFt: 950,
      chassis: "Ford F-550 Super Duty",
      transmission: "TorqShift automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      fuelCapacityGal: 68,
      generator: "Onan 6000W",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Winnebago Access Super C — F-550 Power Stroke with Class C living."
    },
    "Micro Minnie": {
      type: "Travel Trailer",
      floorplans: ["1700BH", "2100BH", "2108DS", "1800BH", "2306BHS", "2500RL"],
      floorplansByYear: {
        "2014": ["1700BH", "2100BH", "2108DS"],
        "2015": ["1700BH", "2100BH", "2108DS"],
        "2016": ["1700BH", "2100BH", "2108DS"],
        "2017": ["1700BH", "1800BH", "2100BH", "2108DS"],
        "2018": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS"],
        "2019": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS"],
        "2020": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS", "2500RL"],
        "2021": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS", "2500RL"],
        "2022": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS", "2500RL"],
        "2023": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS", "2500RL"],
        "2024": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS", "2500RL"],
        "2025": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS"],
        "2026": ["1700BH", "1800BH", "2100BH", "2108DS", "2306BHS"]
      },
      lengthRange: [
        17,
        26
      ],
      weightRange: [
        3000,
        6500
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        24900,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      awningLength: 10,
      ceilingHeight: 76,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Winnebago Micro Minnie — lightweight travel trailers. Verify UVW/hitch by floorplan sticker."
    },
    Minnie: {
      type: "Travel Trailer",
      floorplans: ["2201MB", "2500FL", "2801BHS", "2809DL"],
      floorplansByYear: {
        "2010": ["2201MB", "2500FL"],
        "2011": ["2201MB", "2500FL"],
        "2012": ["2201MB", "2500FL"],
        "2013": ["2201MB", "2500FL"],
        "2014": ["2201MB", "2500FL"],
        "2015": ["2201MB", "2500FL"],
        "2016": ["2201MB", "2500FL"],
        "2017": ["2201MB", "2500FL", "2801BHS"],
        "2018": ["2201MB", "2500FL", "2801BHS", "2809DL"],
        "2019": ["2201MB", "2500FL", "2801BHS", "2809DL"],
        "2020": ["2201MB", "2500FL", "2801BHS", "2809DL"],
        "2021": ["2201MB", "2500FL", "2801BHS", "2809DL"],
        "2022": ["2201MB", "2500FL", "2801BHS", "2809DL"],
        "2023": ["2201MB", "2500FL", "2801BHS"],
        "2024": ["2201MB", "2500FL", "2801BHS"],
        "2025": ["2201MB", "2500FL"],
        "2026": ["2201MB", "2500FL"]
      },
      lengthRange: [
        22,
        32
      ],
      weightRange: [
        4500,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 35,
      blackWater: 35,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Winnebago Minnie — midsize travel trailer (not Micro)."
    }
  },
  "Forest River": {
    "Georgetown 5 Series": {
      type: "Class A Gas",
      floorplans: ["30X3", "31L5", "36B5", "36D5"],
      floorplansByYear: {
        "2014": ["30X3", "31L5", "36B5"],
        "2015": ["30X3", "31L5", "36B5"],
        "2016": ["30X3", "31L5", "36B5"],
        "2017": ["30X3", "31L5", "36B5"],
        "2018": ["30X3", "31L5", "36B5"],
        "2019": ["30X3", "31L5", "36B5", "36D5"],
        "2020": ["30X3", "31L5", "36B5", "36D5"],
        "2021": ["30X3", "31L5", "36B5", "36D5"],
        "2022": ["30X3", "31L5", "36B5", "36D5"],
        "2023": ["30X3", "31L5", "36B5", "36D5"],
        "2024": ["30X3", "31L5", "36B5", "36D5"],
        "2025": ["31L5", "36B5", "36D5"],
        "2026": ["31L5", "36B5", "36D5"]
      },
      lengthRange: [
        30,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        149000,
        239000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Forest River Georgetown 5 Series — gas Class A on Ford F53. Newer years 7.3L Godzilla.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    "Georgetown XL": {
      type: "Class A Gas",
      floorplans: ["377DS", "378TS", "369DS"],
      floorplansByYear: {
        "2012": ["377DS", "378TS"],
        "2013": ["377DS", "378TS"],
        "2014": ["377DS", "378TS"],
        "2015": ["377DS", "378TS"],
        "2016": ["377DS", "378TS"],
        "2017": ["377DS", "378TS"],
        "2018": ["377DS", "378TS"],
        "2019": ["377DS", "378TS", "369DS"],
        "2020": ["377DS", "378TS", "369DS"],
        "2021": ["377DS", "378TS", "369DS"],
        "2022": ["377DS", "378TS"],
        "2023": ["377DS", "378TS"],
        "2024": ["377DS", "378TS"],
        "2025": ["377DS", "378TS"],
        "2026": ["377DS", "378TS"]
      },
      lengthRange: [
        36,
        38
      ],
      weightRange: [
        18000,
        24000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        169000,
        269000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Forest River Georgetown XL — larger gas Class A floorplans on F53.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Georgetown: {
      type: "Class A Gas",
      floorplans: ["328DS", "364TS", "369DS"],
      floorplansByYear: {
        "2005": ["328DS", "364TS"],
        "2006": ["328DS", "364TS"],
        "2007": ["328DS", "364TS"],
        "2008": ["328DS", "364TS"],
        "2009": ["328DS", "364TS"],
        "2010": ["328DS", "364TS"],
        "2011": ["328DS", "364TS"],
        "2012": ["328DS", "364TS"],
        "2013": ["328DS", "364TS"],
        "2014": ["328DS", "364TS"],
        "2015": ["328DS", "364TS"],
        "2016": ["328DS", "364TS"],
        "2017": ["328DS", "364TS"],
        "2018": ["328DS", "364TS"],
        "2019": ["328DS", "364TS", "369DS"],
        "2020": ["328DS", "364TS", "369DS"],
        "2021": ["328DS", "364TS", "369DS"],
        "2022": ["328DS", "364TS"],
        "2023": ["328DS", "364TS"],
        "2024": ["328DS", "364TS"],
        "2025": ["328DS", "364TS"],
        "2026": ["328DS", "364TS"]
      },
      lengthRange: [
        32,
        37
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        139000,
        229000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Forest River Georgetown — core gas Class A line (also see 5 Series / XL).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    FR3: {
      type: "Class A Gas",
      floorplans: ["30DS", "31DS", "32DS", "33DS", "34DS", "35DS", "33Z", "35G"],
      floorplansByYear: {
        "2015": ["30DS", "32DS", "33DS", "34DS"],
        "2016": ["30DS", "32DS", "33DS", "34DS"],
        "2017": ["30DS", "32DS", "33DS", "34DS"],
        "2018": ["30DS", "32DS", "33DS", "34DS"],
        "2019": ["30DS", "32DS", "33DS", "34DS"],
        "2020": ["30DS", "32DS", "33DS", "34DS"],
        "2021": ["30DS", "32DS", "33DS", "34DS"],
        "2022": ["30DS", "32DS", "33DS", "34DS"],
        "2023": ["30DS", "32DS", "33DS", "34DS"],
        "2024": ["30DS", "32DS", "33DS", "34DS"],
        "2025": ["30DS", "31DS", "34DS", "35DS"],
        "2026": ["30DS", "31DS", "34DS", "35DS", "33Z", "35G"]
      },
      lengthRange: [30, 36],
      weightRange: [18000, 22000],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [159000, 249000],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 52,
      grayWater: 42,
      blackWater: 42,
      fuelCapacityGal: 80,
      generator: "6kW gas (Yamaha / Onan by year)",
      awningLength: 16,
      ceilingHeight: 84,
      gvwrLbs: 22000,
      exteriorHeightIn: 149,
      exteriorWidthIn: 101,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2015,
      description:
        "Forest River FR3 — entry/mid gas Class A on Ford F53. Modern coaches use the 7.3L Godzilla V8 (OEM brochure 335 HP / 468 lb-ft) with TorqShift 6-speed; pre-2020 builds typically Triton V10. Compact ~30–36 ft family floorplans (30DS, 31DS, 34DS, etc.); FR3 Plus trims (33Z, 35G) on select years. Not a diesel pusher.",
      powertrainByYear: [
        {
          from: 2015,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          fuelCapacityGal: 80,
          notes: "Pre-Godzilla FR3 — Triton V10 F53 gas Class A"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          fuelCapacityGal: 80,
          generator: "6kW gas",
          notes:
            "OEM FR3 brochure: Ford F53 · 7.3L V8 · 335 HP · 468 lb-ft · TorqShift 6-spd (not diesel)"
        }
      ]
    },
    Berkshire: {
      type: "Class A Diesel",
      floorplans: ["34QS", "38A", "39A", "40C"],
      floorplansByYear: {
        "2010": ["34QS", "38A", "39A"],
        "2011": ["34QS", "38A", "39A"],
        "2012": ["34QS", "38A", "39A"],
        "2013": ["34QS", "38A", "39A"],
        "2014": ["34QS", "38A", "39A"],
        "2015": ["34QS", "38A", "39A"],
        "2016": ["34QS", "38A", "39A"],
        "2017": ["34QS", "38A", "39A"],
        "2018": ["34QS", "38A", "39A"],
        "2019": ["34QS", "38A", "39A", "40C"],
        "2020": ["34QS", "38A", "39A", "40C"],
        "2021": ["34QS", "38A", "39A", "40C"],
        "2022": ["34QS", "38A", "40C"],
        "2023": ["34QS", "38A", "40C"],
        "2024": ["34QS", "38A", "40C"],
        "2025": ["38A", "40C"],
        "2026": ["38A", "40C"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        28000,
        38000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        399000
      ],
      engine: "Cummins ISB 6.7L 360HP / ISL 380-450HP (by trim)",
      horsepower: 360,
      torqueLbFt: 700,
      chassis: "Freightliner XC-Series",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 50,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Berkshire — mid-diesel Class A on Freightliner XC. B6.7/L9 class — not ISX 600 flagship.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISB / B6.7 340HP",
          horsepower: 340,
          chassis: "Freightliner XC"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins B6.7 / L9 340–450HP",
          horsepower: 340,
          chassis: "Freightliner XC-Series"
        },
        
      ]
    },
    Sunseeker: {
      type: "Class C",
      floorplans: ["2440DS","2500TS","2860DS","3010DS","3050S","3150S","2250S","2850S"],
      floorplansByYear: {
        "2005": ["2250S","2500TS","3010DS"],"2006": ["2250S","2500TS","3010DS"],
        "2007": ["2250S","2500TS","3010DS"],"2008": ["2250S","2500TS","3010DS"],
        "2009": ["2250S","2500TS","3010DS"],"2010": ["2250S","2500TS","3010DS"],
        "2011": ["2250S","2500TS","3010DS"],"2012": ["2250S","2500TS","3010DS"],
        "2013": ["2250S","2500TS","3010DS"],"2014": ["2250S","2500TS","3010DS"],
        "2015": ["2250S","2500TS","3010DS"],"2016": ["2250S","2500TS","3010DS"],
        "2017": ["2250S","2500TS","3010DS"],"2018": ["2250S","2500TS","2850S","3010DS"],
        "2019": ["2250S","2500TS","2850S","3010DS"],"2020": ["2250S","2500TS","2850S","3010DS"],
        "2021": ["2250S","2500TS","2850S","3010DS"],"2022": ["2250S","2500TS","2850S","3010DS"],
        "2023": ["2250S","2500TS","2850S","3010DS"],"2024": ["2250S","2500TS","2850S","3010DS"],
        "2025": ["2440DS","2500TS","2860DS","3010DS","3050S"],
        "2026": ["2440DS","2500TS","2860DS","3010DS","3050S","3150S"],
        "2027": ["2440DS","2500TS","2860DS","3010DS","3050S","3150S"]
      },
      lengthRange: [27, 33], weightRange: [12000, 14500], slideouts: 2, sleeps: 8, msrpRange: [99000, 175000],
      engine: "Ford 7.3L V8 gas 325HP (E-450)", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450",
      transmission: "6-speed TorqShift", fuelType: "Gas", recalls: 0, rating: 4.25, image: RV_CARD_IMAGE,
      towingCapacity: 7500, freshWater: 44, grayWater: 39, blackWater: 39, fuelCapacityGal: 55,
      generator: "Onan / Generac 4kW gas", awningLength: 16, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2005, gvwrLbs: 14500,
      description: "Forest River Sunseeker — full-feature Ford E-450 Class C (also sold as Classic). OEM 2026–27: 7.3 325/450, hitch 7,500, GVWR 14,500. Plans 2440DS, 2500TS, 2860DS, 3010DS, 3050S, 3150S.",
      powertrainByYear: [
        { from: 2005, to: 2015, engine: "Ford 6.8L V10 / 6.2L V8 (by year)", horsepower: 305, chassis: "Ford E-450 / E-350" },
        { from: 2016, to: 2019, engine: "Ford 6.2L V8", horsepower: 305, chassis: "Ford E-450" },
        { from: 2020, to: 2027, engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450", transmission: "6-speed TorqShift", towingCapacity: 7500, gvwrLbs: 14500, notes: "E-450 7.3 325/450 — not 350 invent" },
      ],
    },
    "Sunseeker LE": {
      type: "Class C",
      floorplans: ["1950LE","2150SLE","2250SLE","2350LE","2530S","2550DSLE","2850SLE","2950LE","3250DSLE"],
      floorplansByYear: {
        "2012": ["2250SLE","2500LE"],"2013": ["2250SLE","2500LE"],"2014": ["2250SLE","2500LE"],
        "2015": ["2250SLE","2500LE"],"2016": ["2250SLE","2500LE"],"2017": ["2250SLE","2500LE"],
        "2018": ["2250SLE","2500LE"],"2019": ["2250SLE","2500LE","2850LE"],
        "2020": ["2250SLE","2500LE","2850LE"],"2021": ["2250SLE","2500LE","2850LE"],
        "2022": ["2250SLE","2500LE"],"2023": ["2250SLE","2500LE"],"2024": ["2250SLE","2500LE"],
        "2025": ["1950LE","2150SLE","2250SLE","2350LE","2550DSLE"],
        "2026": ["1950LE","2150SLE","2250SLE","2350LE","2530S","2550DSLE","2850SLE","2950LE","3250DSLE"],
        "2027": ["1950LE","2150SLE","2250SLE","2350LE","2530S","2550DSLE","2850SLE","2950LE","3250DSLE"]
      },
      lengthRange: [20, 33], weightRange: [10500, 14500], slideouts: 1, sleeps: 6, msrpRange: [75000, 145000],
      engine: "Ford 7.3L V8 325HP or Chevy 6.6L V8 gas (by chassis)", horsepower: 325, torqueLbFt: 450,
      chassis: "Ford E-350 / E-450 or Chevy 3500", transmission: "6-speed automatic", fuelType: "Gas",
      recalls: 0, rating: 4.2, image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 44, grayWater: 32, blackWater: 32,
      fuelCapacityGal: 55, generator: "Onan 4.0kW gas", awningLength: 14, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2012, gvwrLbs: 12500,
      description: "Forest River Sunseeker LE — value Class C Ford or Chevy gas. Short LE (1950LE–2350LE) E-350/Chevy 3500 hitch 5k. Long LE (2550DSLE–3250DSLE) E-450 hitch 7,500 GVWR 14,500. Ford 7.3 is 325 HP not 350.",
      powertrainByYear: [
        { from: 2012, to: 2019, engine: "Ford 6.2L / 6.8L gas (by year)", horsepower: 305, chassis: "Ford E-350 / E-450" },
        { from: 2020, to: 2027, floorplans: ["1950LE","2150SLE","2250SLE","2350LE","2530S"], engine: "Ford 7.3L V8 325HP or Chevy 6.6L V8 gas", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-350 / Chevy 3500", towingCapacity: 5000 },
        { from: 2020, to: 2027, floorplans: ["2550DSLE","2850SLE","2950LE","3250DSLE"], engine: "Ford 7.3L V8 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450", towingCapacity: 7500, gvwrLbs: 14500 },
        { from: 2020, to: 2027, engine: "Ford 7.3L V8 325HP or Chevy 6.6L V8 gas", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-350 / E-450 or Chevy 3500" },
      ],
    },
    "Sunseeker Classic": {
      type: "Class C",
      floorplans: ["2440DS","2500TS","2860DS","3010DS","3050S","3150S"],
      floorplansByYear: {
        "2008": ["3010DS","3250DS"],"2009": ["3010DS","3250DS"],"2010": ["3010DS","3250DS"],
        "2011": ["3010DS","3250DS"],"2012": ["3010DS","3250DS"],"2013": ["3010DS","3250DS"],
        "2014": ["3010DS","3250DS"],"2015": ["3010DS","3250DS"],"2016": ["3010DS","3250DS"],
        "2017": ["3010DS","3250DS"],"2018": ["3010DS","3250DS"],"2019": ["3010DS","3250DS"],
        "2020": ["3010DS","3250DS"],"2021": ["3010DS","3250DS"],"2022": ["3010DS","3250DS"],
        "2023": ["3010DS","3250DS"],"2024": ["3010DS","3250DS"],
        "2025": ["2440DS","2860DS","3010DS","3050S"],
        "2026": ["2440DS","2500TS","2860DS","3010DS","3050S","3150S"],
        "2027": ["2440DS","2500TS","2860DS","3010DS","3050S","3150S"]
      },
      lengthRange: [27, 33], weightRange: [12000, 14500], slideouts: 2, sleeps: 8, msrpRange: [105000, 175000],
      engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450",
      transmission: "6-speed TorqShift", fuelType: "Gas", recalls: 0, rating: 4.25, image: RV_CARD_IMAGE,
      towingCapacity: 7500, freshWater: 44, grayWater: 39, blackWater: 39, fuelCapacityGal: 55,
      generator: "Onan / Generac 4kW gas", awningLength: 16, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2008, gvwrLbs: 14500,
      description: "Forest River Sunseeker Classic — dealer name for full-feature E-450 Sunseeker. Same 7.3 325/450, hitch 7,500. Plans include 2860DS, 3010DS, 3050S.",
      powertrainByYear: [
        { from: 2008, to: 2019, engine: "Ford 6.8L V10 / 6.2L V8 (by year)", horsepower: 305, chassis: "Ford E-450" },
        { from: 2020, to: 2027, engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450", towingCapacity: 7500, gvwrLbs: 14500 },
      ],
    },
    "Sunseeker 4X4": {
      type: "Class C", floorplans: ["23504X4"],
      floorplansByYear: { "2025": ["23504X4"], "2026": ["23504X4"], "2027": ["23504X4"] },
      lengthRange: [24, 25], weightRange: [13000, 14500], slideouts: 0, sleeps: 5, msrpRange: [130000, 185000],
      engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450 4WD (4-inch lift)",
      transmission: "6-speed TorqShift", fuelType: "Gas", recalls: 0, rating: 4.3, image: RV_CARD_IMAGE,
      towingCapacity: 7500, freshWater: 44, grayWater: 32, blackWater: 32, fuelCapacityGal: 55,
      generator: "Onan 4.0kW gas", awningLength: 14, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2025, gvwrLbs: 14500, overallLengthIn: 294,
      description: "Forest River Sunseeker 4X4 — E-450 4WD, 23504X4 ~24' 6\", 7.3 325/450, hitch 7,500.",
      powertrainByYear: [{ from: 2025, to: 2027, engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450 4WD", towingCapacity: 7500, gvwrLbs: 14500 }],
    },
    "Sunseeker MBS": {
      type: "Class C", floorplans: ["2400BDS","2400M","2400T"],
      floorplansByYear: { "2024": ["2400BDS","2400M","2400T"], "2025": ["2400BDS","2400M","2400T"], "2026": ["2400BDS","2400M","2400T"], "2027": ["2400BDS","2400M","2400T"] },
      lengthRange: [25, 26], weightRange: [9500, 11030], slideouts: 1, sleeps: 4, msrpRange: [165000, 230000],
      engine: "Mercedes-Benz 2.0L turbo diesel 208HP", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter",
      transmission: "9-speed automatic", fuelType: "Diesel", recalls: 0, rating: 4.35, image: RV_CARD_IMAGE,
      towingCapacity: 4200, freshWater: 35, grayWater: 32, blackWater: 32, fuelCapacityGal: 26,
      generator: "Optional / chassis-dependent", awningLength: 14, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2024, gvwrLbs: 11030,
      description: "Forest River Sunseeker MBS — Sprinter diesel 208/332, hitch 4,200. Plans 2400BDS, 2400M, 2400T.",
      powertrainByYear: [{ from: 2024, to: 2027, engine: "Mercedes-Benz 2.0L turbo diesel 208HP", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter", towingCapacity: 4200, gvwrLbs: 11030 }],
    },
    "Sunseeker TS": {
      type: "Class C", floorplans: ["TS2370","TS2380"],
      floorplansByYear: { "2025": ["TS2370","TS2380"], "2026": ["TS2370","TS2380"], "2027": ["TS2370","TS2380"] },
      lengthRange: [25, 27], weightRange: [9000, 10360], slideouts: 1, sleeps: 4, msrpRange: [145000, 195000],
      engine: "Ford 3.5L EcoBoost V6 310HP", horsepower: 310, torqueLbFt: 400, chassis: "Ford Transit",
      transmission: "10-speed automatic", fuelType: "Gas", recalls: 0, rating: 4.25, image: RV_CARD_IMAGE,
      towingCapacity: 4000, freshWater: 35, grayWater: 30, blackWater: 28, fuelCapacityGal: 25,
      generator: "Optional", awningLength: 14, ceilingHeight: 80, founded: 1996, warrantyYears: 1, yearStart: 2025, gvwrLbs: 10360,
      description: "Forest River Sunseeker TS — Transit gas, TS2370 / TS2380, GVWR 10,360, EcoBoost ~310/400.",
      powertrainByYear: [{ from: 2025, to: 2027, engine: "Ford 3.5L EcoBoost V6 310HP", horsepower: 310, torqueLbFt: 400, chassis: "Ford Transit", gvwrLbs: 10360 }],
    },
    "Sunseeker PM": {
      type: "Class C", floorplans: ["2030RP"],
      floorplansByYear: { "2025": ["2030RP"], "2026": ["2030RP"], "2027": ["2030RP"] },
      lengthRange: [23, 24], weightRange: [8000, 9350], slideouts: 0, sleeps: 3, msrpRange: [115000, 165000],
      engine: "Ram 3.6L V6 Pentastar gas", horsepower: 276, torqueLbFt: 250, chassis: "Ram ProMaster",
      transmission: "9-speed automatic", fuelType: "Gas", recalls: 0, rating: 4.15, image: RV_CARD_IMAGE,
      towingCapacity: 3500, freshWater: 30, grayWater: 28, blackWater: 16, fuelCapacityGal: 24,
      generator: "Optional", awningLength: 12, ceilingHeight: 78, founded: 1996, warrantyYears: 1, yearStart: 2025, gvwrLbs: 9350, overallLengthIn: 280,
      description: "Forest River Sunseeker PM — ProMaster 2030RP ~23' 4\", GVWR 9,350. Gas V6, not 7.3.",
      powertrainByYear: [{ from: 2025, to: 2027, engine: "Ram 3.6L V6 Pentastar gas", horsepower: 276, torqueLbFt: 250, chassis: "Ram ProMaster", gvwrLbs: 9350 }],
    },
    Forester: {
      type: "Class C",
      floorplans: ["2401W", "2501TS", "3011DS", "2861DS"],
      floorplansByYear: {
        "2005": ["2401W", "2501TS", "3011DS"],
        "2006": ["2401W", "2501TS", "3011DS"],
        "2007": ["2401W", "2501TS", "3011DS"],
        "2008": ["2401W", "2501TS", "3011DS"],
        "2009": ["2401W", "2501TS", "3011DS"],
        "2010": ["2401W", "2501TS", "3011DS"],
        "2011": ["2401W", "2501TS", "3011DS"],
        "2012": ["2401W", "2501TS", "3011DS"],
        "2013": ["2401W", "2501TS", "3011DS"],
        "2014": ["2401W", "2501TS", "3011DS"],
        "2015": ["2401W", "2501TS", "3011DS"],
        "2016": ["2401W", "2501TS", "3011DS"],
        "2017": ["2401W", "2501TS", "3011DS"],
        "2018": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2019": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2020": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2021": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2022": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2023": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2024": ["2401W", "2501TS", "2861DS", "3011DS"],
        "2025": ["2401W", "2501TS", "3011DS"],
        "2026": ["2401W", "2501TS", "3011DS"]
      },
      lengthRange: [
        22,
        33
      ],
      weightRange: [
        11000,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        79000,
        159000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Forest River Forester — volume Ford Class C (Sunseeker sibling brand).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    "Forester LE": {
      type: "Class C",
      floorplans: ["2251SLE", "2401LE", "2501LE"],
      floorplansByYear: {
        "2013": ["2251SLE", "2401LE"],
        "2014": ["2251SLE", "2401LE"],
        "2015": ["2251SLE", "2401LE"],
        "2016": ["2251SLE", "2401LE"],
        "2017": ["2251SLE", "2401LE"],
        "2018": ["2251SLE", "2401LE"],
        "2019": ["2251SLE", "2401LE", "2501LE"],
        "2020": ["2251SLE", "2401LE", "2501LE"],
        "2021": ["2251SLE", "2401LE", "2501LE"],
        "2022": ["2251SLE", "2401LE"],
        "2023": ["2251SLE", "2401LE"],
        "2024": ["2251SLE", "2401LE"],
        "2025": ["2251SLE", "2401LE"],
        "2026": ["2251SLE", "2401LE"]
      },
      lengthRange: [
        22,
        33
      ],
      weightRange: [
        11000,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        79000,
        159000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2013,
      description: "Forest River Forester LE — entry Class C packages.",
      powertrainByYear: [
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Solera: {
      type: "Class C",
      floorplans: ["24S", "24X", "24R"],
      floorplansByYear: {
        "2017": ["24S", "24X"],
        "2018": ["24S", "24X"],
        "2019": ["24S", "24X", "24R"],
        "2020": ["24S", "24X", "24R"],
        "2021": ["24S", "24X", "24R"],
        "2022": ["24S", "24X"],
        "2023": ["24S", "24X"],
        "2024": ["24S", "24X"],
        "2025": ["24S", "24X"],
        "2026": ["24S", "24X"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        119000,
        179000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2017,
      description: "Forest River Solera — Sprinter diesel Class C.",
      powertrainByYear: [
        {
          from: 2017,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Dynamax Isata (FR)": {
      type: "Class C",
      floorplans: ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
      floorplansByYear: {
        "2018": ["3 Series 24FW", "3 Series 24RA"],
        "2019": ["3 Series 24FW", "3 Series 24RA"],
        "2020": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2021": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2022": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2023": ["3 Series 24FW", "5 Series 30FW"],
        "2024": ["3 Series 24FW", "5 Series 30FW"],
        "2025": ["3 Series 24FW", "5 Series 30FW"],
        "2026": ["3 Series 24FW", "5 Series 30FW"]
      },
      lengthRange: [
        24,
        30
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        149000,
        229000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel (by series)",
      horsepower: 211,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Dynamax Isata (Forest River family) — premium Sprinter Class C.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Rockwood Signature": {
      type: "Fifth Wheel",
      floorplans: ["8289WS", "8311WS", "8329SS", "8335BSS"],
      floorplansByYear: {
        "2010": ["8289WS", "8311WS", "8329SS"],
        "2011": ["8289WS", "8311WS", "8329SS"],
        "2012": ["8289WS", "8311WS", "8329SS"],
        "2013": ["8289WS", "8311WS", "8329SS"],
        "2014": ["8289WS", "8311WS", "8329SS"],
        "2015": ["8289WS", "8311WS", "8329SS"],
        "2016": ["8289WS", "8311WS", "8329SS"],
        "2017": ["8289WS", "8311WS", "8329SS"],
        "2018": ["8289WS", "8311WS", "8329SS"],
        "2019": ["8289WS", "8311WS", "8329SS", "8335BSS"],
        "2020": ["8289WS", "8311WS", "8329SS", "8335BSS"],
        "2021": ["8289WS", "8311WS", "8329SS", "8335BSS"],
        "2022": ["8289WS", "8311WS", "8335BSS"],
        "2023": ["8289WS", "8311WS", "8335BSS"],
        "2024": ["8289WS", "8311WS", "8335BSS"],
        "2025": ["8289WS", "8311WS", "8335BSS"],
        "2026": ["8289WS", "8311WS", "8335BSS"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Rockwood Signature — mid/high fifth wheel. UVW/pin weight vary by floorplan."
    },
    Columbus: {
      type: "Fifth Wheel",
      floorplans: ["330RL", "377MBC", "383FB", "385BH"],
      floorplansByYear: {
        "2010": ["330RL", "377MBC", "383FB"],
        "2011": ["330RL", "377MBC", "383FB"],
        "2012": ["330RL", "377MBC", "383FB"],
        "2013": ["330RL", "377MBC", "383FB"],
        "2014": ["330RL", "377MBC", "383FB"],
        "2015": ["330RL", "377MBC", "383FB"],
        "2016": ["330RL", "377MBC", "383FB"],
        "2017": ["330RL", "377MBC", "383FB"],
        "2018": ["330RL", "377MBC", "383FB"],
        "2019": ["330RL", "377MBC", "383FB", "385BH"],
        "2020": ["330RL", "377MBC", "383FB", "385BH"],
        "2021": ["330RL", "377MBC", "383FB", "385BH"],
        "2022": ["330RL", "377MBC", "383FB"],
        "2023": ["330RL", "377MBC", "383FB"],
        "2024": ["330RL", "377MBC", "383FB"],
        "2025": ["330RL", "377MBC", "383FB"],
        "2026": ["330RL", "377MBC", "383FB"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Columbus — residential fifth wheel. Confirm hitch/pin and GVWR."
    },
    Cardinal: {
      type: "Fifth Wheel",
      floorplans: ["3450RL", "3825FL", "3950RL", "3456RL"],
      floorplansByYear: {
        "2010": ["3450RL", "3825FL", "3950RL"],
        "2011": ["3450RL", "3825FL", "3950RL"],
        "2012": ["3450RL", "3825FL", "3950RL"],
        "2013": ["3450RL", "3825FL", "3950RL"],
        "2014": ["3450RL", "3825FL", "3950RL"],
        "2015": ["3450RL", "3825FL", "3950RL"],
        "2016": ["3450RL", "3825FL", "3950RL"],
        "2017": ["3450RL", "3825FL", "3950RL"],
        "2018": ["3450RL", "3825FL", "3950RL"],
        "2019": ["3450RL", "3825FL", "3950RL", "3456RL"],
        "2020": ["3450RL", "3825FL", "3950RL", "3456RL"],
        "2021": ["3450RL", "3825FL", "3950RL", "3456RL"],
        "2022": ["3450RL", "3825FL", "3950RL"],
        "2023": ["3450RL", "3825FL", "3950RL"],
        "2024": ["3450RL", "3825FL", "3950RL"],
        "2025": ["3450RL", "3825FL", "3950RL"],
        "2026": ["3450RL", "3825FL", "3950RL"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Cardinal — luxury fifth wheel. Heavy pin weights common."
    },
    "Cedar Creek": {
      type: "Fifth Wheel",
      floorplans: ["34RL2", "36CK2", "38EL", "38FB2"],
      floorplansByYear: {
        "2010": ["34RL2", "36CK2", "38EL"],
        "2011": ["34RL2", "36CK2", "38EL"],
        "2012": ["34RL2", "36CK2", "38EL"],
        "2013": ["34RL2", "36CK2", "38EL"],
        "2014": ["34RL2", "36CK2", "38EL"],
        "2015": ["34RL2", "36CK2", "38EL"],
        "2016": ["34RL2", "36CK2", "38EL"],
        "2017": ["34RL2", "36CK2", "38EL"],
        "2018": ["34RL2", "36CK2", "38EL"],
        "2019": ["34RL2", "36CK2", "38EL", "38FB2"],
        "2020": ["34RL2", "36CK2", "38EL", "38FB2"],
        "2021": ["34RL2", "36CK2", "38EL", "38FB2"],
        "2022": ["34RL2", "36CK2", "38EL"],
        "2023": ["34RL2", "36CK2", "38EL"],
        "2024": ["34RL2", "36CK2", "38EL"],
        "2025": ["34RL2", "36CK2", "38EL"],
        "2026": ["34RL2", "36CK2", "38EL"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Cedar Creek — fifth wheel. Year/floorplan UVW varies widely."
    },
    Sabre: {
      type: "Fifth Wheel",
      floorplans: ["36BHQ", "38DBQ", "37FLH"],
      floorplansByYear: {
        "2010": ["36BHQ", "38DBQ"],
        "2011": ["36BHQ", "38DBQ"],
        "2012": ["36BHQ", "38DBQ"],
        "2013": ["36BHQ", "38DBQ"],
        "2014": ["36BHQ", "38DBQ"],
        "2015": ["36BHQ", "38DBQ"],
        "2016": ["36BHQ", "38DBQ"],
        "2017": ["36BHQ", "38DBQ"],
        "2018": ["36BHQ", "38DBQ"],
        "2019": ["36BHQ", "38DBQ", "37FLH"],
        "2020": ["36BHQ", "38DBQ", "37FLH"],
        "2021": ["36BHQ", "38DBQ", "37FLH"],
        "2022": ["36BHQ", "38DBQ"],
        "2023": ["36BHQ", "38DBQ"],
        "2024": ["36BHQ", "38DBQ"],
        "2025": ["36BHQ", "38DBQ"],
        "2026": ["36BHQ", "38DBQ"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Forest River Sabre — bunkhouse-capable fifth wheels."
    },
    "Cherokee Arctic Wolf": {
      type: "Fifth Wheel",
      floorplans: [
        "255RRT",
        "27SGS",
        "285OPT",
        "287BH",
        "289PANO",
        "3250SUITE",
        "331BH",
        "3550WST",
        "3650SUITE",
        "3660SUITE",
        "3750SUITE",
        "3800DECK",
        "387ML",
        "38DST",
        "38LEAH",
        "3950SUITE"
      ],
      floorplansByYear: {
        "2010": ["255RRT", "287BH", "3550WST"],
        "2011": ["255RRT", "287BH", "3550WST"],
        "2012": ["255RRT", "287BH", "3550WST"],
        "2013": ["255RRT", "287BH", "3550WST"],
        "2014": ["255RRT", "287BH", "3550WST"],
        "2015": ["255RRT", "287BH", "3550WST"],
        "2016": ["255RRT", "287BH", "3550WST"],
        "2017": ["255RRT", "287BH", "3550WST"],
        "2018": ["255RRT", "287BH", "3550WST", "3660SUITE"],
        "2019": ["255RRT", "287BH", "3550WST", "3660SUITE"],
        "2020": ["255RRT", "287BH", "3250SUITE", "3550WST", "3650SUITE", "3660SUITE"],
        "2021": ["255RRT", "287BH", "3250SUITE", "3550WST", "3650SUITE", "3660SUITE", "3750SUITE"],
        "2022": [
          "27SGS",
          "285OPT",
          "287BH",
          "3250SUITE",
          "331BH",
          "3550WST",
          "3650SUITE",
          "3750SUITE",
          "3950SUITE"
        ],
        "2023": [
          "27SGS",
          "285OPT",
          "287BH",
          "289PANO",
          "3250SUITE",
          "331BH",
          "3650SUITE",
          "3750SUITE",
          "3800DECK",
          "3950SUITE"
        ],
        "2024": [
          "27SGS",
          "285OPT",
          "287BH",
          "289PANO",
          "3250SUITE",
          "331BH",
          "3650SUITE",
          "3750SUITE",
          "3800DECK",
          "387ML",
          "38DST",
          "3950SUITE"
        ],
        "2025": [
          "27SGS",
          "285OPT",
          "287BH",
          "289PANO",
          "3250SUITE",
          "331BH",
          "3650SUITE",
          "3750SUITE",
          "3800DECK",
          "387ML",
          "38DST",
          "38LEAH",
          "3950SUITE"
        ],
        "2026": [
          "27SGS",
          "285OPT",
          "287BH",
          "289PANO",
          "3250SUITE",
          "331BH",
          "3650SUITE",
          "3750SUITE",
          "3800DECK",
          "387ML",
          "38DST",
          "38LEAH",
          "3950SUITE"
        ]
      },
      lengthRange: [
        30,
        44
      ],
      weightRange: [
        7800,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        45000,
        98000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 70,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Cherokee Arctic Wolf — popular mid fifth wheel (half-ton to mid-profile). 2026 OEM includes 285OPT, 289PANO, 331BH, 3950SUITE. Pin weight varies widely — door sticker rules."
    },
    Sandstorm: {
      type: "Toy Hauler",
      floorplans: ["241SLR", "282SLR", "286GSLR", "333SLR"],
      floorplansByYear: {
        "2011": ["241SLR", "282SLR", "286GSLR"],
        "2012": ["241SLR", "282SLR", "286GSLR"],
        "2013": ["241SLR", "282SLR", "286GSLR"],
        "2014": ["241SLR", "282SLR", "286GSLR"],
        "2015": ["241SLR", "282SLR", "286GSLR"],
        "2016": ["241SLR", "282SLR", "286GSLR"],
        "2017": ["241SLR", "282SLR", "286GSLR"],
        "2018": ["241SLR", "282SLR", "286GSLR"],
        "2019": ["241SLR", "282SLR", "286GSLR", "333SLR"],
        "2020": ["241SLR", "282SLR", "286GSLR", "333SLR"],
        "2021": ["241SLR", "282SLR", "286GSLR", "333SLR"],
        "2022": ["282SLR", "286GSLR", "333SLR"],
        "2023": ["282SLR", "286GSLR", "333SLR"],
        "2024": ["282SLR", "286GSLR", "333SLR"],
        "2025": ["282SLR", "286GSLR", "333SLR"],
        "2026": ["282SLR", "286GSLR", "333SLR"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 11,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 3000,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Forest River Sandstorm — toy hauler. Garage length/height critical."
    },
    "XLR Hyper Lite": {
      type: "Toy Hauler",
      floorplans: ["21HFS", "26HFS", "29HFS", "3016"],
      floorplansByYear: {
        "2011": ["21HFS", "26HFS", "29HFS"],
        "2012": ["21HFS", "26HFS", "29HFS"],
        "2013": ["21HFS", "26HFS", "29HFS"],
        "2014": ["21HFS", "26HFS", "29HFS"],
        "2015": ["21HFS", "26HFS", "29HFS"],
        "2016": ["21HFS", "26HFS", "29HFS"],
        "2017": ["21HFS", "26HFS", "29HFS"],
        "2018": ["21HFS", "26HFS", "29HFS"],
        "2019": ["21HFS", "26HFS", "29HFS", "3016"],
        "2020": ["21HFS", "26HFS", "29HFS", "3016"],
        "2021": ["21HFS", "26HFS", "29HFS", "3016"],
        "2022": ["26HFS", "29HFS", "3016"],
        "2023": ["26HFS", "29HFS", "3016"],
        "2024": ["26HFS", "29HFS", "3016"],
        "2025": ["26HFS", "29HFS", "3016"],
        "2026": ["26HFS", "29HFS", "3016"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 2500,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Forest River XLR Hyper Lite — lighter toy hauler. Check CCC and garage capacity."
    },
    "XLR Nitro": {
      type: "Toy Hauler",
      floorplans: ["25KW", "28KW", "35DK5", "41G14"],
      floorplansByYear: {
        "2011": ["25KW", "28KW", "35DK5"],
        "2012": ["25KW", "28KW", "35DK5"],
        "2013": ["25KW", "28KW", "35DK5"],
        "2014": ["25KW", "28KW", "35DK5"],
        "2015": ["25KW", "28KW", "35DK5"],
        "2016": ["25KW", "28KW", "35DK5"],
        "2017": ["25KW", "28KW", "35DK5"],
        "2018": ["25KW", "28KW", "35DK5"],
        "2019": ["25KW", "28KW", "35DK5", "41G14"],
        "2020": ["25KW", "28KW", "35DK5", "41G14"],
        "2021": ["25KW", "28KW", "35DK5", "41G14"],
        "2022": ["28KW", "35DK5", "41G14"],
        "2023": ["28KW", "35DK5", "41G14"],
        "2024": ["28KW", "35DK5", "41G14"],
        "2025": ["28KW", "35DK5", "41G14"],
        "2026": ["28KW", "35DK5", "41G14"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 12,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 4000,
      fuelStationGal: 30,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Forest River XLR Nitro — full-size toy hauler. Garage often 10–14+ ft by plan."
    },
    "XLR Thunderbolt": {
      type: "Toy Hauler",
      floorplans: ["340AMP", "380AMP", "415AMP"],
      floorplansByYear: {
        "2011": ["340AMP", "380AMP"],
        "2012": ["340AMP", "380AMP"],
        "2013": ["340AMP", "380AMP"],
        "2014": ["340AMP", "380AMP"],
        "2015": ["340AMP", "380AMP"],
        "2016": ["340AMP", "380AMP"],
        "2017": ["340AMP", "380AMP"],
        "2018": ["340AMP", "380AMP"],
        "2019": ["340AMP", "380AMP", "415AMP"],
        "2020": ["340AMP", "380AMP", "415AMP"],
        "2021": ["340AMP", "380AMP", "415AMP"],
        "2022": ["380AMP", "415AMP"],
        "2023": ["380AMP", "415AMP"],
        "2024": ["380AMP", "415AMP"],
        "2025": ["380AMP", "415AMP"],
        "2026": ["380AMP", "415AMP"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 13,
      garageWidthFt: 8.5,
      garageHeightIn: 86,
      garageCapacityLbs: 5000,
      fuelStationGal: 40,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Forest River XLR Thunderbolt — high-end toy hauler. Large garages."
    },
    "Cherokee Wolf Pack": {
      type: "Toy Hauler",
      floorplans: ["24PACK12", "27PACK10", "325PACK13", "365PACK16"],
      floorplansByYear: {
        "2011": ["24PACK12", "27PACK10", "325PACK13"],
        "2012": ["24PACK12", "27PACK10", "325PACK13"],
        "2013": ["24PACK12", "27PACK10", "325PACK13"],
        "2014": ["24PACK12", "27PACK10", "325PACK13"],
        "2015": ["24PACK12", "27PACK10", "325PACK13"],
        "2016": ["24PACK12", "27PACK10", "325PACK13"],
        "2017": ["24PACK12", "27PACK10", "325PACK13"],
        "2018": ["24PACK12", "27PACK10", "325PACK13"],
        "2019": ["24PACK12", "27PACK10", "325PACK13", "365PACK16"],
        "2020": ["24PACK12", "27PACK10", "325PACK13", "365PACK16"],
        "2021": ["24PACK12", "27PACK10", "325PACK13", "365PACK16"],
        "2022": ["27PACK10", "325PACK13", "365PACK16"],
        "2023": ["27PACK10", "325PACK13", "365PACK16"],
        "2024": ["27PACK10", "325PACK13", "365PACK16"],
        "2025": ["27PACK10", "325PACK13", "365PACK16"],
        "2026": ["27PACK10", "325PACK13", "365PACK16"]
      },
      lengthRange: [
        21,
        42
      ],
      weightRange: [
        4500,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        32000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 3500,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Forest River Cherokee Wolf Pack — popular toy hauler. PACK## in name hints garage length."
    },
    "Cherokee Grey Wolf": {
      type: "Travel Trailer",
      floorplans: [
        "19SM",
        "20RDSE",
        "21AB",
        "22CE",
        "22MKSE",
        "23DBH",
        "23MK",
        "23MS",
        "26BRB",
        "26DBH",
        "26DJSE",
        "26KF",
        "26LK",
        "26LP",
        "26SS",
        "27GH",
        "27LH",
        "29NM",
        "29QB",
        "29TE"
      ],
      floorplansByYear: {
        "2015": ["19SM", "22CE", "22MKSE", "23DBH", "23MK", "26DBH", "26SS", "29TE"],
        "2016": ["19SM", "22CE", "22MKSE", "23DBH", "23MK", "26DBH", "26SS", "29TE"],
        "2017": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26SS",
          "29QB",
          "29TE"
        ],
        "2018": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26SS",
          "29QB",
          "29TE"
        ],
        "2019": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26LK",
          "26SS",
          "29QB",
          "29TE"
        ],
        "2020": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26LK",
          "26SS",
          "29QB",
          "29TE"
        ],
        "2021": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26LK",
          "26SS",
          "27GH",
          "29QB",
          "29TE"
        ],
        "2022": [
          "19SM",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "26DBH",
          "26LK",
          "26SS",
          "27GH",
          "29QB",
          "29TE"
        ],
        "2023": [
          "19SM",
          "20RDSE",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "23MS",
          "26DBH",
          "26LK",
          "26SS",
          "27GH",
          "29QB",
          "29TE"
        ],
        "2024": [
          "19SM",
          "20RDSE",
          "21AB",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "23MS",
          "26BRB",
          "26DBH",
          "26DJSE",
          "26KF",
          "26LK",
          "26LP",
          "26SS",
          "27GH",
          "27LH",
          "29NM",
          "29QB",
          "29TE"
        ],
        "2025": [
          "19SM",
          "20RDSE",
          "21AB",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "23MS",
          "26BRB",
          "26DBH",
          "26DJSE",
          "26KF",
          "26LK",
          "26LP",
          "26SS",
          "27GH",
          "27LH",
          "29NM",
          "29QB",
          "29TE"
        ],
        "2026": [
          "19SM",
          "20RDSE",
          "21AB",
          "22CE",
          "22MKSE",
          "23DBH",
          "23MK",
          "23MS",
          "26BRB",
          "26DBH",
          "26DJSE",
          "26KF",
          "26LK",
          "26LP",
          "26SS",
          "27GH",
          "27LH",
          "29NM",
          "29QB",
          "29TE"
        ]
      },
      lengthRange: [
        24,
        38
      ],
      weightRange: [
        4500,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        24900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Cherokee Grey Wolf — Forest River high-volume family travel trailer. Half-ton friendly on most mid plans. OEM 2026 bank includes 19SM–29TE; live Grok fills exact UVW/hitch."
    },
    "Cherokee Wolf Pup": {
      type: "Travel Trailer",
      floorplans: ["16BHS", "16FQ", "17JG", "18TO", "18RJB", "18TOW", "16FQDLX"],
      floorplansByYear: {
        "2015": ["16BHS", "16FQ", "17JG"],
        "2016": ["16BHS", "16FQ", "17JG", "18RJB"],
        "2017": ["16BHS", "16FQ", "17JG", "18RJB", "18TO"],
        "2018": ["16BHS", "16FQ", "17JG", "18RJB", "18TO"],
        "2019": ["16BHS", "16FQ", "17JG", "18RJB", "18TO", "18TOW"],
        "2020": ["16BHS", "16FQ", "17JG", "18RJB", "18TO", "18TOW"],
        "2021": ["16BHS", "16FQ", "17JG", "18RJB", "18TO", "18TOW"],
        "2022": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW"],
        "2023": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW"],
        "2024": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW"],
        "2025": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW"],
        "2026": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW"]
      },
      lengthRange: [
        16,
        22
      ],
      weightRange: [
        2500,
        4200
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        18900,
        36000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 26,
      grayWater: 25,
      blackWater: 25,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2013,
      description: "Cherokee Wolf Pup — ultra-light single-axle / small double-axle Cherokee. SUV / half-ton entry camper. Confirm GVWR vs tow vehicle."
    },
    "Rockwood Mini Lite": {
      type: "Travel Trailer",
      floorplans: [
        "2104S",
        "2109S",
        "2204S",
        "2205S",
        "2506S",
        "2509S",
        "2511S",
        "2513S",
        "2516S"
      ],
      floorplansByYear: {
        "2015": ["2104S", "2109S", "2205S", "2506S", "2509S"],
        "2016": ["2104S", "2109S", "2205S", "2506S", "2509S", "2511S"],
        "2017": ["2104S", "2109S", "2205S", "2506S", "2509S", "2511S"],
        "2018": ["2104S", "2109S", "2204S", "2205S", "2506S", "2509S", "2511S"],
        "2019": ["2104S", "2109S", "2204S", "2205S", "2506S", "2509S", "2511S", "2513S"],
        "2020": ["2104S", "2109S", "2204S", "2205S", "2506S", "2509S", "2511S", "2513S"],
        "2021": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ],
        "2022": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ],
        "2023": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ],
        "2024": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ],
        "2025": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ],
        "2026": [
          "2104S",
          "2109S",
          "2204S",
          "2205S",
          "2506S",
          "2509S",
          "2511S",
          "2513S",
          "2516S"
        ]
      },
      lengthRange: [
        21,
        29
      ],
      weightRange: [
        4200,
        6200
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        32900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 43,
      grayWater: 30,
      blackWater: 30,
      awningLength: 15,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Rockwood Mini Lite — Forest River lightweight couples/family TT. Strong build reputation; half-ton friendly on most plans. Sister line to Flagstaff Micro Lite."
    },
    "Rockwood Ultra Lite": {
      type: "Travel Trailer",
      floorplans: ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
      floorplansByYear: {
        "2015": ["2606WS", "2608BS", "2612WS", "2706WS"],
        "2016": ["2606WS", "2608BS", "2612WS", "2706WS", "2897BS"],
        "2017": ["2606WS", "2608BS", "2612WS", "2706WS", "2897BS"],
        "2018": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS"],
        "2019": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2020": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2021": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2022": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2023": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2024": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2025": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"],
        "2026": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS"]
      },
      lengthRange: [
        28,
        34
      ],
      weightRange: [
        6000,
        8500
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        39900,
        68000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 38,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Rockwood Ultra Lite — larger Rockwood travel trailers (still lighter than full residential). Family bunks and rear living common."
    },
    "Flagstaff Micro Lite": {
      type: "Travel Trailer",
      floorplans: ["21FBRS", "21DS", "22FBS", "25BDS", "25BHS", "25FBTS", "25FKBS"],
      floorplansByYear: {
        "2015": ["21FBRS", "21DS", "22FBS", "25BHS"],
        "2016": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS"],
        "2017": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS"],
        "2018": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS"],
        "2019": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2020": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2021": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2022": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2023": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2024": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2025": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"],
        "2026": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS"]
      },
      lengthRange: [
        21,
        29
      ],
      weightRange: [
        4200,
        6500
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        33900,
        54000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 43,
      grayWater: 30,
      blackWater: 30,
      awningLength: 15,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Flagstaff Micro Lite — Forest River lightweight TT (Rockwood sister brand). Popular 22FBS / 25BHS family of plans."
    },
    "Salem Cruise Lite": {
      type: "Travel Trailer",
      floorplans: [
        "19DBXL",
        "21RBXL",
        "24DBXL",
        "25ICE",
        "263BHXL",
        "26BHXL",
        "26ICE",
        "273QBXL",
        "273QBXLX",
        "28VBXL",
        "29BHXL",
        "30QBXL"
      ],
      floorplansByYear: {
        "2015": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "28VBXL", "29BHXL"],
        "2016": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "28VBXL", "29BHXL", "30QBXL"],
        "2017": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "28VBXL", "29BHXL", "30QBXL"],
        "2018": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "273QBXL", "28VBXL", "29BHXL", "30QBXL"],
        "2019": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "273QBXL", "28VBXL", "29BHXL", "30QBXL"],
        "2020": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "273QBXL", "28VBXL", "29BHXL", "30QBXL"],
        "2021": ["19DBXL", "21RBXL", "24DBXL", "26BHXL", "273QBXL", "28VBXL", "29BHXL", "30QBXL"],
        "2022": [
          "19DBXL",
          "21RBXL",
          "24DBXL",
          "26BHXL",
          "273QBXL",
          "273QBXLX",
          "28VBXL",
          "29BHXL",
          "30QBXL"
        ],
        "2023": [
          "19DBXL",
          "21RBXL",
          "24DBXL",
          "25ICE",
          "263BHXL",
          "26BHXL",
          "26ICE",
          "273QBXL",
          "273QBXLX",
          "28VBXL",
          "29BHXL"
        ],
        "2024": [
          "19DBXL",
          "21RBXL",
          "24DBXL",
          "25ICE",
          "263BHXL",
          "26BHXL",
          "26ICE",
          "273QBXL",
          "273QBXLX",
          "28VBXL",
          "29BHXL"
        ],
        "2025": [
          "19DBXL",
          "21RBXL",
          "24DBXL",
          "25ICE",
          "263BHXL",
          "26BHXL",
          "26ICE",
          "273QBXL",
          "273QBXLX",
          "28VBXL",
          "29BHXL"
        ],
        "2026": [
          "24DBXL",
          "25ICE",
          "263BHXL",
          "26BHXL",
          "26ICE",
          "273QBXL",
          "273QBXLX",
          "28VBXL",
          "29BHXL"
        ]
      },
      lengthRange: [
        21,
        34
      ],
      weightRange: [
        3800,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        22900,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Salem Cruise Lite — Forest River volume value travel trailer. Regional plan banks; common bunkhouse codes 26BHXL / 273QBXL. Live Grok verifies brochure UVW."
    },
    "Salem Hemisphere": {
      type: "Travel Trailer",
      floorplans: ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
      floorplansByYear: {
        "2015": ["270FKBH", "271RL", "286RL", "310BHI"],
        "2016": ["270FKBH", "271RL", "286RL", "310BHI", "314BUD"],
        "2017": ["270FKBH", "271RL", "273RL", "286RL", "310BHI", "314BUD"],
        "2018": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD"],
        "2019": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2020": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2021": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2022": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2023": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2024": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2025": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB"],
        "2026": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD"]
      },
      lengthRange: [
        29,
        38
      ],
      weightRange: [
        6500,
        9500
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        39900,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 40,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Salem Hemisphere — step-up Salem travel trailer with more residential features than Cruise Lite."
    },
    Wildwood: {
      type: "Travel Trailer",
      floorplans: [
        "22RBS",
        "24RBS",
        "26DBUD",
        "27RE",
        "28VIEW",
        "29VBUD",
        "32BHDS",
        "32RET",
        "33TS",
        "36VBAL"
      ],
      floorplansByYear: {
        "2015": ["22RBS", "24RBS", "26DBUD", "27RE", "29VBUD", "32BHDS"],
        "2016": ["22RBS", "24RBS", "26DBUD", "27RE", "29VBUD", "32BHDS", "33TS"],
        "2017": ["22RBS", "24RBS", "26DBUD", "27RE", "29VBUD", "32BHDS", "33TS"],
        "2018": ["22RBS", "24RBS", "26DBUD", "27RE", "28VIEW", "29VBUD", "32BHDS", "33TS"],
        "2019": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS"
        ],
        "2020": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS"
        ],
        "2021": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS",
          "36VBAL"
        ],
        "2022": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS",
          "36VBAL"
        ],
        "2023": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS",
          "36VBAL"
        ],
        "2024": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS",
          "36VBAL"
        ],
        "2025": [
          "22RBS",
          "24RBS",
          "26DBUD",
          "27RE",
          "28VIEW",
          "29VBUD",
          "32BHDS",
          "32RET",
          "33TS",
          "36VBAL"
        ],
        "2026": ["26DBUD", "27RE", "28VIEW", "29VBUD", "32BHDS", "32RET", "33TS", "36VBAL"]
      },
      lengthRange: [
        24,
        38
      ],
      weightRange: [
        5000,
        9500
      ],
      slideouts: 2,
      sleeps: 10,
      msrpRange: [
        24900,
        58000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 15,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Wildwood — Forest River high-volume family travel trailer (bunkhouse specialists: 26DBUD, 33TS). Sister to Salem in many dealer lots."
    },
    "r-Pod": {
      type: "Travel Trailer",
      floorplans: ["171", "180", "190", "193", "202", "RP-171", "RP-190", "RP-202"],
      floorplansByYear: {
        "2015": ["171", "180", "190", "193"],
        "2016": ["171", "180", "190", "193", "202"],
        "2017": ["171", "180", "190", "193", "202"],
        "2018": ["171", "180", "190", "193", "202"],
        "2019": ["171", "180", "190", "193", "202"],
        "2020": ["171", "180", "190", "193", "202"],
        "2021": ["171", "180", "190", "193", "202"],
        "2022": ["171", "180", "190", "193", "202", "RP-171", "RP-190"],
        "2023": ["171", "180", "190", "193", "202", "RP-171", "RP-190", "RP-202"],
        "2024": ["171", "180", "190", "193", "202", "RP-171", "RP-190", "RP-202"],
        "2025": ["171", "180", "190", "193", "202", "RP-171", "RP-190", "RP-202"],
        "2026": ["171", "190", "193", "202", "RP-171", "RP-190", "RP-202"]
      },
      lengthRange: [
        16,
        25
      ],
      weightRange: [
        2400,
        4200
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        19900,
        38000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 30,
      grayWater: 30,
      blackWater: 30,
      awningLength: 10,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2009,
      description: "Forest River r-Pod — iconic teardrop-style lightweight travel trailer. SUV / half-ton friendly. Codes listed as 171/190/202 and RP- variants used on listings."
    }
  },
  Airstream: {
    Bambi: {
      type: "Travel Trailer",
      floorplans: ["16RB", "19CB", "20FB", "22FB"],
      floorplansByYear: {
        "2010": ["16RB", "19CB", "22FB"],
        "2011": ["16RB", "19CB", "22FB"],
        "2012": ["16RB", "19CB", "22FB"],
        "2013": ["16RB", "19CB", "22FB"],
        "2014": ["16RB", "19CB", "22FB"],
        "2015": ["16RB", "19CB", "22FB"],
        "2016": ["16RB", "19CB", "22FB"],
        "2017": ["16RB", "19CB", "22FB"],
        "2018": ["16RB", "19CB", "20FB", "22FB"],
        "2019": ["16RB", "19CB", "20FB", "22FB"],
        "2020": ["16RB", "19CB", "20FB", "22FB"],
        "2021": ["16RB", "19CB", "20FB", "22FB"],
        "2022": ["16RB", "19CB", "20FB", "22FB"],
        "2023": ["16RB", "19CB", "20FB", "22FB"],
        "2024": ["16RB", "19CB", "20FB", "22FB"],
        "2025": ["16RB", "20FB", "22FB"],
        "2026": ["16RB", "20FB", "22FB"]
      },
      lengthRange: [
        16,
        22
      ],
      weightRange: [
        2800,
        4500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        65000,
        95000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 23,
      grayWater: 18,
      blackWater: 18,
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 1961,
      description: "Airstream Bambi — compact single-axle icon (16RB / 20FB / 22FB). Light enough for many mid-size SUVs; hand-riveted aluminum shell. Live Grok fills exact UVW/hitch."
    },
    Basecamp: {
      type: "Travel Trailer",
      floorplans: ["16", "16X", "20", "20X", "20XE"],
      floorplansByYear: {
        "2016": ["16", "20"],
        "2017": ["16", "20"],
        "2018": ["16", "16X", "20", "20X"],
        "2019": ["16", "16X", "20", "20X"],
        "2020": ["16", "16X", "20", "20X"],
        "2021": ["16", "16X", "20", "20X"],
        "2022": ["16", "16X", "20", "20X", "20XE"],
        "2023": ["16", "16X", "20", "20X", "20XE"],
        "2024": ["16", "16X", "20", "20X", "20XE"],
        "2025": ["16", "16X", "20", "20X", "20XE"],
        "2026": ["16", "16X", "20", "20X", "20XE"]
      },
      lengthRange: [
        16,
        21
      ],
      weightRange: [
        2500,
        3800
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        45000,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 20,
      grayWater: 14,
      blackWater: 14,
      awningLength: 7,
      ceilingHeight: 72,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2016,
      description: "Airstream Basecamp — rugged adventure trailer (16 / 20 / X / XE). Off-grid packages common; not a traditional lounge layout."
    },
    Caravel: {
      type: "Travel Trailer",
      floorplans: ["16RB", "19CB", "20FB", "22FB"],
      floorplansByYear: {
        "2017": ["16RB", "19CB", "22FB"],
        "2018": ["16RB", "19CB", "20FB", "22FB"],
        "2019": ["16RB", "19CB", "20FB", "22FB"],
        "2020": ["16RB", "19CB", "20FB", "22FB"],
        "2021": ["16RB", "19CB", "20FB", "22FB"],
        "2022": ["16RB", "19CB", "20FB", "22FB"],
        "2023": ["16RB", "19CB", "20FB", "22FB"],
        "2024": ["16RB", "19CB", "20FB", "22FB"],
        "2025": ["16RB", "20FB", "22FB"],
        "2026": ["16RB", "20FB", "22FB"]
      },
      lengthRange: [
        16,
        22
      ],
      weightRange: [
        3000,
        4800
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        70000,
        98000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 23,
      grayWater: 18,
      blackWater: 18,
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2017,
      description: "Airstream Caravel — Bambi-size luxury trim with upgraded interior appointments."
    },
    "Flying Cloud": {
      type: "Travel Trailer",
      floorplans: [
        "23FB",
        "23FBT",
        "25FB",
        "25FBQ",
        "25RB",
        "27FB",
        "27FBQ",
        "30FB",
        "30FBQ"
      ],
      floorplansByYear: {
        "2010": ["23FB", "25FB", "25RB", "27FB", "30FB"],
        "2011": ["23FB", "25FB", "25RB", "27FB", "30FB"],
        "2012": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2013": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2014": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2015": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB"],
        "2016": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2017": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2018": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2019": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2020": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2021": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2022": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2023": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2024": [
          "23FB",
          "23FBT",
          "25FB",
          "25FBQ",
          "25RB",
          "27FB",
          "27FBQ",
          "30FB",
          "30FBQ"
        ],
        "2025": ["23FB", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2026": ["23FB", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB"]
      },
      lengthRange: [
        23,
        30
      ],
      weightRange: [
        5200,
        7800
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        90000,
        145000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 36,
      grayWater: 26,
      blackWater: 26,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      description: "Airstream Flying Cloud — highest-volume dual-axle Airstream. FB / FBQ / RB / FBT layouts; twin or queen. Most floorplans of any Airstream line."
    },
    International: {
      type: "Travel Trailer",
      floorplans: ["23FB", "25FB", "27FB", "28RB", "30RB"],
      floorplansByYear: {
        "2010": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2011": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2012": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2013": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2014": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2015": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2016": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2017": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2018": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2019": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2020": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2021": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2022": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2023": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2024": ["23FB", "25FB", "27FB", "28RB", "30RB"],
        "2025": ["23FB", "25FB", "27FB", "30RB"],
        "2026": ["23FB", "25FB", "27FB", "30RB"]
      },
      lengthRange: [
        23,
        30
      ],
      weightRange: [
        5400,
        7800
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        95000,
        150000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 36,
      grayWater: 26,
      blackWater: 26,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      description: "Airstream International — classic dual-axle line (often Serenity / Signature trim packages by year)."
    },
    Globetrotter: {
      type: "Travel Trailer",
      floorplans: ["23FB", "25FB", "27FB", "30RB"],
      floorplansByYear: {
        "2016": ["23FB", "25FB", "27FB"],
        "2017": ["23FB", "25FB", "27FB", "30RB"],
        "2018": ["23FB", "25FB", "27FB", "30RB"],
        "2019": ["23FB", "25FB", "27FB", "30RB"],
        "2020": ["23FB", "25FB", "27FB", "30RB"],
        "2021": ["23FB", "25FB", "27FB", "30RB"],
        "2022": ["23FB", "25FB", "27FB", "30RB"],
        "2023": ["23FB", "25FB", "27FB", "30RB"],
        "2024": ["23FB", "25FB", "27FB", "30RB"],
        "2025": ["23FB", "25FB", "27FB", "30RB"],
        "2026": ["23FB", "25FB", "27FB", "30RB"]
      },
      lengthRange: [
        23,
        30
      ],
      weightRange: [
        5500,
        8000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        110000,
        165000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 36,
      grayWater: 26,
      blackWater: 26,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2016,
      description: "Airstream Globetrotter — premium dual-axle with upgraded interior (often gray exterior)."
    },
    Classic: {
      type: "Travel Trailer",
      floorplans: ["30RB", "30RBT", "33FB", "33FBT"],
      floorplansByYear: {
        "2010": ["30RB", "30RBT", "33FB"],
        "2011": ["30RB", "30RBT", "33FB"],
        "2012": ["30RB", "30RBT", "33FB", "33FBT"],
        "2013": ["30RB", "30RBT", "33FB", "33FBT"],
        "2014": ["30RB", "30RBT", "33FB", "33FBT"],
        "2015": ["30RB", "30RBT", "33FB", "33FBT"],
        "2016": ["30RB", "30RBT", "33FB", "33FBT"],
        "2017": ["30RB", "30RBT", "33FB", "33FBT"],
        "2018": ["30RB", "30RBT", "33FB", "33FBT"],
        "2019": ["30RB", "30RBT", "33FB", "33FBT"],
        "2020": ["30RB", "30RBT", "33FB", "33FBT"],
        "2021": ["30RB", "30RBT", "33FB", "33FBT"],
        "2022": ["30RB", "30RBT", "33FB", "33FBT"],
        "2023": ["30RB", "30RBT", "33FB", "33FBT"],
        "2024": ["30RB", "30RBT", "33FB", "33FBT"],
        "2025": ["30RB", "30RBT", "33FB", "33FBT"],
        "2026": ["30RB", "33FB", "33FBT"]
      },
      lengthRange: [
        30,
        33
      ],
      weightRange: [
        7500,
        9000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        160000,
        230000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 18,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      description: "Airstream Classic — flagship travel trailer. Highest resale of any production trailer; 30 / 33 twin or queen."
    },
    "Trade Wind": {
      type: "Travel Trailer",
      floorplans: ["25FB", "25FBQ", "28RB"],
      floorplansByYear: {
        "2021": ["25FB", "25FBQ"],
        "2022": ["25FB", "25FBQ", "28RB"],
        "2023": ["25FB", "25FBQ", "28RB"],
        "2024": ["25FB", "25FBQ", "28RB"],
        "2025": ["25FB", "25FBQ", "28RB"],
        "2026": ["25FB", "25FBQ", "28RB"]
      },
      lengthRange: [
        25,
        28
      ],
      weightRange: [
        5800,
        7200
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        100000,
        145000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 36,
      grayWater: 26,
      blackWater: 26,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2021,
      description: "Airstream Trade Wind — special-edition dual-axle packaging (often Pottery Barn collab eras)."
    },
    Interstate: {
      type: "Class B",
      floorplans: ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "Tommy Bahama"],
      floorplansByYear: {
        "2010": ["24GL", "Grand Tour EXT"],
        "2011": ["24GL", "Grand Tour EXT"],
        "2012": ["24GL", "Grand Tour EXT"],
        "2013": ["24GL", "Grand Tour EXT"],
        "2014": ["24GL", "Grand Tour EXT"],
        "2015": ["19", "24GL", "Grand Tour EXT"],
        "2016": ["19", "24GL", "Grand Tour EXT", "Tommy Bahama"],
        "2017": ["19", "24GL", "Grand Tour EXT", "Tommy Bahama"],
        "2018": ["19", "24GL", "24GT", "Grand Tour EXT", "Tommy Bahama"],
        "2019": ["19", "24GL", "24GT", "Grand Tour EXT", "Tommy Bahama"],
        "2020": ["19", "24GL", "24GT", "24GT Twin", "Grand Tour EXT", "Tommy Bahama"],
        "2021": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "Tommy Bahama"],
        "2022": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "Tommy Bahama"],
        "2023": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "Tommy Bahama"],
        "2024": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "Tommy Bahama"],
        "2025": ["19", "24GL", "24GT", "24GT Twin", "24X", "Tommy Bahama"],
        "2026": ["19", "24GL", "24GT", "24GT Twin", "24X", "Tommy Bahama"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        9000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        200000,
        320000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      horsepower: 208,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 26,
      grayWater: 22,
      blackWater: 18,
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2005,
      mpgHighwayEst: 16,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        },
        {
          from: 2005,
          to: 2005,
          engine: "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
          horsepower: 154,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Early Sprinter era — ~154–188 HP by year"
        }
      ],
      description: "Airstream Interstate — flagship Class B on Mercedes Sprinter. 19 compact; 24GL / 24GT / EXT / Tommy Bahama editions. Verify payload with options."
    },
    Atlas: {
      type: "Class B+",
      floorplans: ["24CE", "24GT", "24TE", "Tommy Bahama"],
      floorplansByYear: {
        "2018": ["24CE", "24GT"],
        "2019": ["24CE", "24GT", "24TE"],
        "2020": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2021": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2022": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2023": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2024": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2025": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2026": ["24CE", "24GT", "24TE"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10500,
        12500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        180000,
        280000
      ],
      engine: "Mercedes-Benz 2.0L turbo 4-cyl diesel (Sprinter 4500)",
      horsepower: 208,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes-Benz Sprinter 4500" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter" },
      ],
      chassis: "Mercedes-Benz Sprinter 4500",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 24,
      blackWater: 24,
      generator: "None (solar + lithium common)",
      awningLength: 9,
      ceilingHeight: 75,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2018,
      mpgHighwayEst: 16,
      description: "Airstream Atlas — ultra-premium Class B (hotel-suite interior). Tommy Bahama collab on select years."
    },
    Rangeline: {
      type: "Class B",
      floorplans: ["18R", "18RB"],
      floorplansByYear: {
        "2022": ["18R", "18RB"],
        "2023": ["18R", "18RB"],
        "2024": ["18R", "18RB"],
        "2025": ["18R", "18RB"],
        "2026": ["18R", "18RB"]
      },
      lengthRange: [
        21,
        21
      ],
      weightRange: [
        7600,
        9350
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        150000,
        210000
      ],
      engine: "3.6L Pentastar V6",
      horsepower: 276,
      powertrainByYear: [
        { from: 2022, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "RAM ProMaster 3500" },
      ],
      chassis: "RAM ProMaster 3500",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 20,
      grayWater: 15,
      blackWater: 12,
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2022,
      description: "Airstream Rangeline — compact adventure Class B for two travelers."
    }
  },
  Keystone: {
    Montana: {
      type: "Fifth Wheel",
      floorplans: [
        "3100RL",
        "3120RL",
        "3231CK",
        "3402RL",
        "3500RD",
        "3532SP",
        "3582RL",
        "3625RE",
        "3700RL",
        "3710FL",
        "3720RL",
        "3721RL",
        "3761FL",
        "3764KB",
        "3790RD",
        "3791RD",
        "3800FL",
        "3811MS",
        "3855BR",
        "3857BR",
        "3900RK",
        "3901RK",
        "3950BR",
        "3953FB"
      ],
      floorplansByYear: {
        "2010": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD"],
        "2011": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD"],
        "2012": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD", "3811MS"],
        "2013": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD", "3811MS"],
        "2014": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD", "3811MS"],
        "2015": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD", "3811MS", "3855BR"],
        "2016": ["3402RL", "3582RL", "3625RE", "3710FL", "3720RL", "3790RD", "3811MS", "3855BR"],
        "2017": ["3120RL", "3231CK", "3700RL", "3721RL", "3761FL", "3791RD", "3811MS", "3855BR"],
        "2018": ["3120RL", "3231CK", "3700RL", "3721RL", "3761FL", "3791RD", "3811MS", "3855BR"],
        "2019": [
          "3120RL",
          "3231CK",
          "3700RL",
          "3721RL",
          "3761FL",
          "3791RD",
          "3811MS",
          "3855BR",
          "3901RK"
        ],
        "2020": [
          "3120RL",
          "3231CK",
          "3700RL",
          "3721RL",
          "3761FL",
          "3791RD",
          "3811MS",
          "3855BR",
          "3901RK"
        ],
        "2021": [
          "3120RL",
          "3231CK",
          "3700RL",
          "3721RL",
          "3761FL",
          "3791RD",
          "3811MS",
          "3855BR",
          "3901RK"
        ],
        "2022": ["3231CK", "3761FL", "3791RD", "3811MS", "3855BR", "3901RK", "3950BR", "3953FB"],
        "2023": ["3231CK", "3532SP", "3761FL", "3791RD", "3811MS", "3855BR", "3901RK", "3950BR"],
        "2024": ["3231CK", "3532SP", "3761FL", "3791RD", "3855BR", "3857BR", "3901RK", "3950BR"],
        "2025": [
          "3100RL",
          "3231CK",
          "3532SP",
          "3761FL",
          "3800FL",
          "3855BR",
          "3857BR",
          "3900RK",
          "3901RK"
        ],
        "2026": ["3100RL", "3231CK", "3500RD", "3532SP", "3800FL", "3857BR", "3900RK", "3901RK"],
        "2027": ["3100RL", "3500RD", "3800FL", "3900RK"]
      },
      lengthRange: [
        32,
        44
      ],
      weightRange: [
        12000,
        18000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        75000,
        165000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 1,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 66,
      grayWater: 78,
      blackWater: 46,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 1996,
      description: "Keystone Montana — America's best-selling luxury fifth wheel. Residential living, large floorplan bank. UVW/pin vary widely by plan — door sticker + live Grok verify exact brochure numbers."
    },
    "Montana High Country": {
      type: "Fifth Wheel",
      floorplans: [
        "290RL",
        "295RL",
        "311RD",
        "330RL",
        "335FL",
        "351BH",
        "370FL",
        "377FL",
        "381TB",
        "381TH",
        "391TB"
      ],
      floorplansByYear: {
        "2014": ["295RL", "335FL", "377FL"],
        "2015": ["295RL", "335FL", "377FL", "381TH"],
        "2016": ["295RL", "335FL", "351BH", "377FL", "381TH"],
        "2017": ["295RL", "311RD", "335FL", "351BH", "377FL", "381TH"],
        "2018": ["295RL", "311RD", "330RL", "335FL", "351BH", "377FL", "381TH"],
        "2019": ["295RL", "311RD", "330RL", "335FL", "351BH", "370FL", "377FL", "381TH"],
        "2020": ["295RL", "311RD", "330RL", "335FL", "351BH", "370FL", "377FL", "381TH"],
        "2021": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "377FL",
          "381TB"
        ],
        "2022": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "377FL",
          "381TB"
        ],
        "2023": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "377FL",
          "381TB"
        ],
        "2024": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "377FL",
          "381TB",
          "391TB"
        ],
        "2025": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "377FL",
          "381TB",
          "391TB"
        ],
        "2026": [
          "290RL",
          "295RL",
          "311RD",
          "330RL",
          "335FL",
          "351BH",
          "370FL",
          "381TB",
          "391TB"
        ],
        "2027": ["290RL", "295RL", "330RL", "351BH", "381TB", "391TB"]
      },
      lengthRange: [
        29,
        41
      ],
      weightRange: [
        9000,
        14500
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        69900,
        139000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 74,
      grayWater: 78,
      blackWater: 46,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 96,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Montana High Country — Keystone half-ton / lighter-luxury fifth wheel. Residential features at lower pin weights for capable 3/4-ton and some half-ton towers. Verify pin weight vs truck rating."
    },
    Cougar: {
      type: "Travel Trailer",
      floorplans: [
        "22RBS",
        "22RBQ",
        "24RKS",
        "25BHS",
        "25FKD",
        "26RBS",
        "26RBSWE",
        "27SAB",
        "29BHS",
        "30BHS",
        "30RLS",
        "32BHS",
        "33MLS",
        "34TSB"
      ],
      floorplansByYear: {
        "2010": ["22RBS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2011": ["22RBS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2012": ["22RBS", "24RKS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2013": ["22RBS", "24RKS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2014": ["22RBS", "24RKS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2015": ["22RBQ", "24RKS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2016": ["22RBQ", "24RKS", "26RBS", "29BHS", "30RLS", "32BHS"],
        "2017": ["22RBQ", "24RKS", "26RBS", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2018": ["22RBQ", "24RKS", "26RBS", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2019": ["22RBQ", "24RKS", "25BHS", "26RBS", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2020": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "26RBS",
          "27SAB",
          "29BHS",
          "30RLS",
          "32BHS",
          "33MLS"
        ],
        "2021": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "26RBS",
          "27SAB",
          "29BHS",
          "30RLS",
          "32BHS",
          "33MLS"
        ],
        "2022": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "26RBS",
          "26RBSWE",
          "27SAB",
          "29BHS",
          "30RLS",
          "32BHS",
          "33MLS"
        ],
        "2023": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "25FKD",
          "26RBS",
          "26RBSWE",
          "27SAB",
          "29BHS",
          "30BHS",
          "30RLS",
          "32BHS"
        ],
        "2024": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "25FKD",
          "26RBS",
          "26RBSWE",
          "27SAB",
          "29BHS",
          "30BHS",
          "30RLS",
          "32BHS",
          "34TSB"
        ],
        "2025": [
          "22RBQ",
          "24RKS",
          "25BHS",
          "25FKD",
          "26RBS",
          "26RBSWE",
          "27SAB",
          "29BHS",
          "30BHS",
          "30RLS",
          "32BHS",
          "34TSB"
        ],
        "2026": [
          "22RBQ",
          "25BHS",
          "25FKD",
          "26RBS",
          "26RBSWE",
          "27SAB",
          "29BHS",
          "30BHS",
          "30RLS",
          "32BHS"
        ],
        "2027": ["22RBQ", "25BHS", "25FKD", "26RBS", "27SAB", "29BHS", "30RLS", "32BHS"]
      },
      lengthRange: [
        22,
        35
      ],
      weightRange: [
        5500,
        10000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        34900,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 1999,
      description: "Keystone Cougar travel trailer — perennial value champion. Family bunks, rear living, and couples layouts. Live Grok fills plan-specific UVW/hitch."
    },
    "Cougar 5th Wheel": {
      type: "Fifth Wheel",
      floorplans: [
        "260MLE",
        "290RLS",
        "303RLS",
        "307RES",
        "30RLS",
        "316RLS",
        "320RDS",
        "32BHSWE",
        "345MBS",
        "34TSB",
        "350LLK",
        "355FBS",
        "360MBI",
        "364BHL",
        "368MBI"
      ],
      floorplansByYear: {
        "2010": ["30RLS", "32BHSWE", "34TSB"],
        "2011": ["30RLS", "32BHSWE", "34TSB"],
        "2012": ["30RLS", "32BHSWE", "34TSB", "345MBS"],
        "2013": ["30RLS", "32BHSWE", "34TSB", "345MBS"],
        "2014": ["30RLS", "32BHSWE", "34TSB", "345MBS", "368MBI"],
        "2015": ["30RLS", "32BHSWE", "34TSB", "345MBS", "368MBI"],
        "2016": ["30RLS", "32BHSWE", "345MBS", "368MBI"],
        "2017": ["30RLS", "32BHSWE", "345MBS", "360MBI", "368MBI"],
        "2018": ["30RLS", "316RLS", "345MBS", "360MBI", "368MBI"],
        "2019": ["290RLS", "316RLS", "320RDS", "345MBS", "360MBI", "368MBI"],
        "2020": ["290RLS", "303RLS", "316RLS", "320RDS", "345MBS", "360MBI", "368MBI"],
        "2021": ["290RLS", "303RLS", "307RES", "316RLS", "320RDS", "345MBS", "360MBI", "364BHL"],
        "2022": [
          "260MLE",
          "290RLS",
          "303RLS",
          "307RES",
          "316RLS",
          "320RDS",
          "350LLK",
          "360MBI",
          "364BHL"
        ],
        "2023": [
          "260MLE",
          "290RLS",
          "303RLS",
          "307RES",
          "316RLS",
          "320RDS",
          "350LLK",
          "355FBS",
          "360MBI",
          "364BHL"
        ],
        "2024": [
          "260MLE",
          "290RLS",
          "303RLS",
          "307RES",
          "316RLS",
          "320RDS",
          "350LLK",
          "355FBS",
          "360MBI",
          "364BHL"
        ],
        "2025": [
          "260MLE",
          "290RLS",
          "303RLS",
          "307RES",
          "316RLS",
          "320RDS",
          "350LLK",
          "355FBS",
          "360MBI",
          "364BHL"
        ],
        "2026": [
          "260MLE",
          "290RLS",
          "303RLS",
          "307RES",
          "316RLS",
          "320RDS",
          "350LLK",
          "355FBS",
          "360MBI",
          "364BHL"
        ],
        "2027": ["260MLE", "290RLS", "316RLS", "320RDS", "350LLK", "355FBS", "360MBI", "364BHL"]
      },
      lengthRange: [
        30,
        39
      ],
      weightRange: [
        9500,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        49900,
        95000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 76,
      blackWater: 38,
      awningLength: 16,
      ceilingHeight: 81,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2004,
      description: "Cougar mid-profile / premium fifth wheel — #1 selling FW nameplate. Full residential kitchen, strong dealer support. Match truck to pin weight carefully on longer bunkhouses."
    },
    "Cougar Half-Ton": {
      type: "Fifth Wheel",
      floorplans: [
        "22MLS",
        "22RBK",
        "23MLE",
        "24SAB",
        "24SABWE",
        "25RES",
        "26RES",
        "26RKE",
        "27SAB",
        "28RLI",
        "29BHS",
        "29MBD",
        "29RKS",
        "30REP",
        "30RLS",
        "32BHS"
      ],
      floorplansByYear: {
        "2012": ["22MLS", "24SAB", "27SAB", "29BHS", "30RLS"],
        "2013": ["22MLS", "24SAB", "27SAB", "29BHS", "30RLS"],
        "2014": ["22MLS", "24SAB", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2015": ["22MLS", "24SAB", "25RES", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2016": ["22MLS", "24SAB", "25RES", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2017": ["22MLS", "24SAB", "24SABWE", "25RES", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2018": ["22MLS", "24SAB", "24SABWE", "25RES", "27SAB", "29BHS", "30RLS", "32BHS"],
        "2019": ["22MLS", "22RBK", "24SAB", "25RES", "27SAB", "29BHS", "29RKS", "30RLS"],
        "2020": ["22MLS", "22RBK", "24SAB", "25RES", "27SAB", "29BHS", "29RKS", "30RLS"],
        "2021": ["22MLS", "23MLE", "24SAB", "25RES", "26RES", "27SAB", "29RKS", "30RLS"],
        "2022": ["22MLS", "23MLE", "24SAB", "25RES", "26RES", "27SAB", "29RKS", "30RLS"],
        "2023": ["23MLE", "26RES", "26RKE", "28RLI", "29MBD", "29RKS", "30REP"],
        "2024": ["23MLE", "26RES", "26RKE", "28RLI", "29MBD", "29RKS", "30REP"],
        "2025": ["23MLE", "26RES", "26RKE", "28RLI", "29MBD", "29RKS", "30REP"],
        "2026": ["23MLE", "26RES", "26RKE", "28RLI", "29MBD", "29RKS", "30REP"],
        "2027": ["23MLE", "26RES", "26RKE", "28RLI", "29MBD", "29RKS", "30REP"]
      },
      lengthRange: [
        27,
        35
      ],
      weightRange: [
        7500,
        10500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        39900,
        79000
      ],
      chassis: "N/A (towable · half-ton rated package)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      gvwrLbs: 9995,
      uvwLbs: 8200,
      exteriorHeightIn: 151,
      exteriorWidthIn: 96,
      description: "Cougar Half-Ton fifth wheel — purpose-built for half-ton pickups (many plans GVWR ≤ 9,995–11,500). Popular 23MLE (~28 ft, ~7,800–8,000 UVW). Always verify hitch weight vs truck payload."
    },
    Bullet: {
      type: "Travel Trailer",
      floorplans: [
        "1700BH",
        "1900RD",
        "221BHS",
        "243BHS",
        "250BHS",
        "253RDS",
        "260RBS",
        "260RBSWE",
        "287QBS",
        "290BHS",
        "308BHS",
        "330BHS",
        "330BKQ"
      ],
      floorplansByYear: {
        "2012": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS"],
        "2013": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS", "260RBS"],
        "2014": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS", "260RBS"],
        "2015": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS", "260RBS", "287QBS"],
        "2016": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS", "260RBS", "287QBS", "290BHS"],
        "2017": ["1700BH", "1900RD", "221BHS", "243BHS", "250BHS", "260RBS", "287QBS", "290BHS"],
        "2018": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "260RBS",
          "287QBS",
          "290BHS",
          "308BHS"
        ],
        "2019": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "260RBS",
          "287QBS",
          "290BHS",
          "308BHS"
        ],
        "2020": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "287QBS",
          "290BHS",
          "308BHS"
        ],
        "2021": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "287QBS",
          "290BHS",
          "308BHS"
        ],
        "2022": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "260RBSWE",
          "287QBS",
          "290BHS",
          "308BHS"
        ],
        "2023": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "260RBSWE",
          "287QBS",
          "290BHS",
          "308BHS",
          "330BHS"
        ],
        "2024": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "260RBSWE",
          "287QBS",
          "290BHS",
          "308BHS",
          "330BHS",
          "330BKQ"
        ],
        "2025": [
          "1700BH",
          "1900RD",
          "221BHS",
          "243BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "260RBSWE",
          "287QBS",
          "290BHS",
          "308BHS",
          "330BHS"
        ],
        "2026": [
          "1700BH",
          "1900RD",
          "221BHS",
          "250BHS",
          "253RDS",
          "260RBS",
          "260RBSWE",
          "287QBS",
          "290BHS",
          "308BHS",
          "330BHS"
        ],
        "2027": ["1700BH", "221BHS", "250BHS", "253RDS", "260RBS", "287QBS", "290BHS", "308BHS"]
      },
      lengthRange: [
        18,
        36
      ],
      weightRange: [
        3200,
        7800
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        22900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 43,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Keystone Bullet — lightweight comfort travel trailer (Crossfire single-axle through double-axle family bunks). Half-ton friendly on most short plans."
    },
    Passport: {
      type: "Travel Trailer",
      floorplans: [
        "189ML",
        "199ML",
        "219BH",
        "221BH",
        "239ML",
        "2400BH",
        "248BH",
        "2500RL",
        "253RD",
        "2700BH",
        "2700RL",
        "2920BH"
      ],
      floorplansByYear: {
        "2010": ["189ML", "219BH", "221BH", "248BH"],
        "2011": ["189ML", "219BH", "221BH", "248BH"],
        "2012": ["189ML", "199ML", "219BH", "221BH", "248BH"],
        "2013": ["189ML", "199ML", "219BH", "221BH", "248BH"],
        "2014": ["189ML", "199ML", "219BH", "221BH", "239ML", "248BH"],
        "2015": ["189ML", "199ML", "219BH", "221BH", "239ML", "248BH"],
        "2016": ["189ML", "199ML", "219BH", "221BH", "239ML", "248BH", "2700BH"],
        "2017": ["189ML", "199ML", "219BH", "221BH", "239ML", "2400BH", "248BH", "2700BH"],
        "2018": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "248BH",
          "2500RL",
          "2700BH"
        ],
        "2019": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "2700BH",
          "2700RL"
        ],
        "2020": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2021": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2022": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2023": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2024": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2025": [
          "189ML",
          "199ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL",
          "2920BH"
        ],
        "2026": [
          "189ML",
          "219BH",
          "221BH",
          "239ML",
          "2400BH",
          "2500RL",
          "253RD",
          "2700BH",
          "2700RL"
        ],
        "2027": ["189ML", "219BH", "221BH", "2400BH", "2500RL", "253RD", "2700BH", "2700RL"]
      },
      lengthRange: [
        19,
        33
      ],
      weightRange: [
        3800,
        7200
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        24900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Keystone Passport — light, affordable travel trailer (SL / GT trims). Towable by many half-tons and capable SUVs on shorter plans."
    },
    Springdale: {
      type: "Travel Trailer",
      floorplans: [
        "1700FQ",
        "1750RD",
        "1760BH",
        "1800BH",
        "1860SS",
        "2100RL",
        "2120RKS",
        "2300BH",
        "2340MLS",
        "241FK",
        "260BH",
        "260BHC",
        "262RKS",
        "2880BRS"
      ],
      floorplansByYear: {
        "2010": ["2300BH", "260BH", "260BHC"],
        "2011": ["2300BH", "260BH", "260BHC"],
        "2012": ["2300BH", "260BH", "260BHC", "262RKS"],
        "2013": ["2300BH", "260BH", "260BHC", "262RKS"],
        "2014": ["2100RL", "2300BH", "260BH", "260BHC", "262RKS"],
        "2015": ["2100RL", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2016": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2017": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2018": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2019": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2020": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2021": ["2100RL", "2120RKS", "2300BH", "260BH", "260BHC", "262RKS", "2880BRS"],
        "2022": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2120RKS",
          "2300BH",
          "260BH",
          "262RKS"
        ],
        "2023": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2120RKS",
          "2300BH",
          "2340MLS",
          "260BH",
          "262RKS",
          "2880BRS"
        ],
        "2024": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2120RKS",
          "2300BH",
          "2340MLS",
          "241FK",
          "260BH",
          "262RKS",
          "2880BRS"
        ],
        "2025": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2120RKS",
          "2300BH",
          "2340MLS",
          "241FK",
          "260BH",
          "260BHC",
          "262RKS",
          "2880BRS"
        ],
        "2026": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2120RKS",
          "2300BH",
          "241FK",
          "260BH",
          "262RKS"
        ],
        "2027": [
          "1700FQ",
          "1750RD",
          "1760BH",
          "1800BH",
          "1860SS",
          "2100RL",
          "2300BH",
          "260BH",
          "262RKS"
        ]
      },
      lengthRange: [
        18,
        34
      ],
      weightRange: [
        3000,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        18900,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Keystone Springdale — entry / value travel trailer (Mini single-axle, Classic, MAX). High retail volume; ideal first-time buyer and dealer lot staple."
    },
    Fuzion: {
      type: "Toy Hauler",
      floorplans: [
        "369",
        "373",
        "419",
        "421",
        "424",
        "425",
        "427",
        "428",
        "429",
        "430",
        "442"
      ],
      floorplansByYear: {
        "2012": ["369", "373", "419"],
        "2013": ["369", "373", "419", "424"],
        "2014": ["369", "373", "419", "424", "427"],
        "2015": ["369", "373", "419", "424", "427", "429"],
        "2016": ["369", "373", "419", "424", "427", "429"],
        "2017": ["373", "419", "424", "427", "429"],
        "2018": ["419", "424", "427", "429"],
        "2019": ["419", "424", "427", "429"],
        "2020": ["419", "424", "427", "429"],
        "2021": ["419", "421", "424", "427", "429"],
        "2022": ["419", "421", "424", "425", "427", "429"],
        "2023": ["419", "421", "424", "425", "427", "428", "429", "430"],
        "2024": ["421", "424", "425", "427", "428", "429", "430", "442"],
        "2025": ["421", "424", "425", "427", "428", "429", "442"],
        "2026": ["421", "425", "427", "428", "429", "442"],
        "2027": ["421", "425", "428", "429", "442"]
      },
      lengthRange: [
        38,
        47
      ],
      weightRange: [
        14000,
        18500
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        84900,
        165000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 13,
      garageWidthFt: 8.3,
      garageHeightIn: 86,
      garageCapacityLbs: 4000,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 full-size UTVs (plan-dependent)",
      description: "Keystone Fuzion — full-size fifth-wheel toy hauler. Large cargo garage, fuel station, generator packages. Garage depth varies by plan — verify toys fit before purchase."
    },
    Raptor: {
      type: "Toy Hauler",
      floorplans: ["352", "355", "413", "415", "421", "428", "429", "431"],
      floorplansByYear: {
        "2011": ["352", "355"],
        "2012": ["352", "355", "413"],
        "2013": ["352", "355", "413", "415"],
        "2014": ["352", "355", "413", "415", "421"],
        "2015": ["352", "355", "413", "415", "421"],
        "2016": ["352", "355", "413", "415", "421"],
        "2017": ["352", "355", "415", "421"],
        "2018": ["352", "355", "415", "421"],
        "2019": ["352", "355", "415", "421"],
        "2020": ["352", "355", "421", "429"],
        "2021": ["352", "355", "421", "429"],
        "2022": ["352", "355", "421", "428", "429"],
        "2023": ["352", "355", "421", "428", "429", "431"],
        "2024": ["352", "355", "421", "428", "429", "431"],
        "2025": ["352", "355", "421", "428", "429", "431"],
        "2026": ["352", "355", "421", "428", "429"],
        "2027": ["352", "421", "428", "429"]
      },
      lengthRange: [
        36,
        46
      ],
      weightRange: [
        13000,
        18000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        79900,
        155000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 90,
      grayWater: 45,
      blackWater: 45,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2011,
      generator: "Onan 5500W Gas (prep / optional)",
      garageLengthFt: 12,
      garageWidthFt: 8.2,
      garageHeightIn: 84,
      garageCapacityLbs: 3500,
      rampWidthFt: 8,
      fuelStationGal: 30,
      generatorFuelGal: 30,
      garageFits: "1–2 UTVs or dual quads (plan-dependent)",
      description: "Keystone Raptor — garage-forward toy hauler line (also Carbon / Impact variants in market). Ramp patio, fuel station, convertible garage sofas."
    },
    Alpine: {
      type: "Fifth Wheel",
      floorplans: ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK", "3900RK"],
      floorplansByYear: {
        "2010": ["3400RL", "3501RL", "3781FK"],
        "2011": ["3400RL", "3501RL", "3781FK"],
        "2012": ["3400RL", "3501RL", "3781FK", "3800FK"],
        "2013": ["3400RL", "3501RL", "3781FK", "3800FK"],
        "2014": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2015": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2016": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2017": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2018": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2019": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK", "3900RK"],
        "2020": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK", "3900RK"],
        "2021": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK", "3900RK"],
        "2022": ["3400RL", "3501RL", "3700FL", "3781FK", "3800FK"],
        "2023": ["3400RL", "3501RL", "3781FK", "3800FK"],
        "2024": ["3501RL", "3781FK", "3800FK"],
        "2025": ["3501RL", "3781FK", "3800FK"],
        "2026": ["3501RL", "3781FK", "3800FK"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        13000,
        17000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        74900,
        125000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 64,
      grayWater: 42,
      blackWater: 42,
      awningLength: 17,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Keystone Alpine — premium fifth wheel above Cougar; residential finishes and multi-slide layouts. Lineup thinned in later years as Montana absorbed share."
    },
    Arcadia: {
      type: "Fifth Wheel",
      floorplans: ["3400RL", "3660RL", "3770RL", "3800FL"],
      floorplansByYear: {
        "2018": ["3400RL", "3660RL", "3770RL"],
        "2019": ["3400RL", "3660RL", "3770RL"],
        "2020": ["3400RL", "3660RL", "3770RL", "3800FL"],
        "2021": ["3400RL", "3660RL", "3770RL", "3800FL"],
        "2022": ["3400RL", "3660RL", "3770RL", "3800FL"],
        "2023": ["3660RL", "3770RL", "3800FL"],
        "2024": ["3660RL", "3770RL", "3800FL"],
        "2025": ["3660RL", "3770RL"],
        "2026": ["3660RL", "3770RL"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        11000,
        15000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        74900,
        124000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 96,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2018,
      description: "Keystone Arcadia — mid-luxury fifth wheel with modern interiors and large residential kitchens."
    },
    Avalanche: {
      type: "Fifth Wheel",
      floorplans: ["300RL", "338GK", "360RB", "372BH", "378BH"],
      floorplansByYear: {
        "2010": ["300RL", "338GK", "360RB"],
        "2011": ["300RL", "338GK", "360RB", "372BH"],
        "2012": ["300RL", "338GK", "360RB", "372BH"],
        "2013": ["300RL", "338GK", "360RB", "372BH", "378BH"],
        "2014": ["300RL", "338GK", "360RB", "372BH", "378BH"],
        "2015": ["300RL", "338GK", "360RB", "372BH", "378BH"],
        "2016": ["338GK", "360RB", "372BH", "378BH"],
        "2017": ["338GK", "360RB", "372BH", "378BH"],
        "2018": ["338GK", "360RB", "372BH", "378BH"],
        "2019": ["338GK", "360RB", "378BH"],
        "2020": ["338GK", "360RB", "378BH"],
        "2021": ["338GK", "360RB", "378BH"],
        "2022": ["338GK", "360RB", "378BH"],
        "2023": ["338GK", "360RB", "378BH"],
        "2024": ["338GK", "360RB"],
        "2025": ["338GK", "360RB"]
      },
      lengthRange: [
        30,
        40
      ],
      weightRange: [
        10500,
        15000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        64900,
        115000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2025,
      description: "Keystone Avalanche — adventure-oriented fifth wheel; bunk and rear-living layouts popular with full-time families. Production tapered mid-2020s."
    },
    Laredo: {
      type: "Travel Trailer",
      floorplans: ["280BH", "285SRL", "293RK", "320BH", "330RL"],
      floorplansByYear: {
        "2010": ["280BH", "285SRL", "293RK", "330RL"],
        "2011": ["280BH", "285SRL", "293RK", "330RL"],
        "2012": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2013": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2014": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2015": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2016": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2017": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2018": ["280BH", "285SRL", "293RK", "320BH", "330RL"],
        "2019": ["280BH", "285SRL", "293RK", "330RL"],
        "2020": ["280BH", "285SRL", "293RK", "330RL"],
        "2021": ["280BH", "285SRL", "293RK"],
        "2022": ["280BH", "285SRL", "293RK"]
      },
      lengthRange: [
        28,
        34
      ],
      weightRange: [
        7000,
        10000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        34900,
        59000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 52,
      grayWater: 34,
      blackWater: 34,
      awningLength: 14,
      ceilingHeight: 79,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2022,
      description: "Keystone Laredo — mid-range travel trailer (step up from Passport). Largely absorbed into Cougar/Bullet by early 2020s; kept for used-market cascade."
    },
    Sprinter: {
      type: "Fifth Wheel",
      floorplans: ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
      floorplansByYear: {
        "2010": ["269FWRLS", "293FWRLS", "333FWRKS"],
        "2011": ["269FWRLS", "293FWRLS", "333FWRKS"],
        "2012": ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK"],
        "2013": ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2014": ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2015": ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2016": ["269FWRLS", "293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2017": ["293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2018": ["293FWRLS", "333FWRKS", "3530SIK", "3570FLS"],
        "2019": ["293FWRLS", "3530SIK", "3570FLS"],
        "2020": ["293FWRLS", "3530SIK", "3570FLS"],
        "2021": ["293FWRLS", "3530SIK", "3570FLS"],
        "2022": ["293FWRLS", "3530SIK", "3570FLS"],
        "2023": ["3530SIK", "3570FLS"],
        "2024": ["3530SIK", "3570FLS"]
      },
      lengthRange: [
        27,
        36
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        44900,
        79000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 56,
      grayWater: 36,
      blackWater: 36,
      awningLength: 15,
      ceilingHeight: 81,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2024,
      description: "Keystone Sprinter — value-tier fifth wheel; popular first FW for families upgrading from TT. Production tapered as Cougar Half-Ton grew."
    }
  },
  "Grand Design": {
    Solitude: {
      type: "Fifth Wheel",
      floorplans: ["310GK", "375RES", "377MBS", "380FL", "390RK"],
      floorplansByYear: {
        "2015": ["310GK", "375RES", "377MBS"],
        "2016": ["310GK", "375RES", "377MBS"],
        "2017": ["310GK", "375RES", "377MBS"],
        "2018": ["310GK", "375RES", "377MBS", "380FL"],
        "2019": ["310GK", "375RES", "377MBS", "380FL"],
        "2020": ["310GK", "375RES", "377MBS", "380FL", "390RK"],
        "2021": ["310GK", "375RES", "377MBS", "380FL", "390RK"],
        "2022": ["310GK", "375RES", "380FL", "390RK"],
        "2023": ["310GK", "375RES", "380FL", "390RK"],
        "2024": ["375RES", "380FL", "390RK"],
        "2025": ["375RES", "380FL", "390RK"],
        "2026": ["375RES", "380FL", "390RK"]
      },
      lengthRange: [
        31,
        42
      ],
      weightRange: [
        10000,
        16000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        75000,
        145000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 75,
      grayWater: 50,
      blackWater: 50,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Grand Design Solitude — luxury fifth wheel flagship. Heavy pin weights common; match truck carefully. Live Grok fills plan-specific UVW/hitch."
    },
    "Solitude S-Class": {
      type: "Fifth Wheel",
      floorplans: ["2930RL", "3740BH", "3800FL"],
      floorplansByYear: {
        "2019": ["2930RL", "3740BH"],
        "2020": ["2930RL", "3740BH"],
        "2021": ["2930RL", "3740BH", "3800FL"],
        "2022": ["2930RL", "3740BH", "3800FL"],
        "2023": ["2930RL", "3740BH", "3800FL"],
        "2024": ["2930RL", "3740BH"],
        "2025": ["2930RL", "3740BH"],
        "2026": ["2930RL", "3740BH"]
      },
      lengthRange: [
        29,
        40
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        65000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Grand Design Solitude S-Class — Solitude packaging with select floorplans / content levels."
    },
    Reflection: {
      type: "Fifth Wheel",
      floorplans: ["28BH", "303RLS", "337RLS", "320MKS", "367BHS"],
      floorplansByYear: {
        "2013": ["28BH", "303RLS", "337RLS"],
        "2014": ["28BH", "303RLS", "337RLS"],
        "2015": ["28BH", "303RLS", "337RLS"],
        "2016": ["28BH", "303RLS", "337RLS"],
        "2017": ["28BH", "303RLS", "337RLS"],
        "2018": ["28BH", "303RLS", "337RLS", "320MKS"],
        "2019": ["28BH", "303RLS", "337RLS", "320MKS"],
        "2020": ["28BH", "303RLS", "337RLS", "320MKS", "367BHS"],
        "2021": ["28BH", "303RLS", "337RLS", "320MKS", "367BHS"],
        "2022": ["303RLS", "337RLS", "320MKS", "367BHS"],
        "2023": ["303RLS", "337RLS", "320MKS", "367BHS"],
        "2024": ["303RLS", "337RLS", "367BHS"],
        "2025": ["303RLS", "337RLS", "367BHS"],
        "2026": ["303RLS", "337RLS", "367BHS"]
      },
      lengthRange: [
        28,
        38
      ],
      weightRange: [
        7500,
        12000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        45000,
        95000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2013,
      description: "Grand Design Reflection — mid/high fifth wheel volume line. Strong resale; verify half-ton vs 3/4-ton by UVW/pin."
    },
    "Reflection 150 Series": {
      type: "Fifth Wheel",
      floorplans: ["150 Series 220RK", "150 Series 260RD", "150 Series 295RL"],
      floorplansByYear: {
        "2015": ["150 Series 220RK", "150 Series 260RD"],
        "2016": ["150 Series 220RK", "150 Series 260RD"],
        "2017": ["150 Series 220RK", "150 Series 260RD"],
        "2018": ["150 Series 220RK", "150 Series 260RD"],
        "2019": ["150 Series 220RK", "150 Series 260RD", "150 Series 295RL"],
        "2020": ["150 Series 220RK", "150 Series 260RD", "150 Series 295RL"],
        "2021": ["150 Series 220RK", "150 Series 260RD", "150 Series 295RL"],
        "2022": ["150 Series 260RD", "150 Series 295RL"],
        "2023": ["150 Series 260RD", "150 Series 295RL"],
        "2024": ["150 Series 260RD", "150 Series 295RL"],
        "2025": ["150 Series 260RD", "150 Series 295RL"],
        "2026": ["150 Series 260RD", "150 Series 295RL"]
      },
      lengthRange: [
        22,
        32
      ],
      weightRange: [
        5500,
        9000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        38000,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Grand Design Reflection 150 Series — lighter Reflection fifth wheels aimed at half-ton tow vehicles (still verify sticker)."
    },
    Imagine: {
      type: "Travel Trailer",
      floorplans: ["2150RB", "2500RL", "2800BH", "2970RL", "3100RD"],
      floorplansByYear: {
        "2014": ["2150RB", "2500RL", "2800BH"],
        "2015": ["2150RB", "2500RL", "2800BH"],
        "2016": ["2150RB", "2500RL", "2800BH"],
        "2017": ["2150RB", "2500RL", "2800BH"],
        "2018": ["2150RB", "2500RL", "2800BH", "2970RL"],
        "2019": ["2150RB", "2500RL", "2800BH", "2970RL"],
        "2020": ["2150RB", "2500RL", "2800BH", "2970RL", "3100RD"],
        "2021": ["2150RB", "2500RL", "2800BH", "2970RL", "3100RD"],
        "2022": ["2500RL", "2800BH", "2970RL", "3100RD"],
        "2023": ["2500RL", "2800BH", "2970RL", "3100RD"],
        "2024": ["2500RL", "2800BH", "2970RL"],
        "2025": ["2500RL", "2800BH", "2970RL"],
        "2026": ["2500RL", "2800BH", "2970RL"]
      },
      lengthRange: [
        21,
        35
      ],
      weightRange: [
        4500,
        8500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        28000,
        58000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 52,
      grayWater: 39,
      blackWater: 39,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Grand Design Imagine — best-selling mid travel trailer. Easy tow for many SUVs/trucks; confirm hitch weight."
    },
    "Imagine XLS": {
      type: "Travel Trailer",
      floorplans: ["17MKE", "21BHE", "22RBE", "23LDE"],
      floorplansByYear: {
        "2015": ["17MKE", "21BHE", "22RBE"],
        "2016": ["17MKE", "21BHE", "22RBE"],
        "2017": ["17MKE", "21BHE", "22RBE"],
        "2018": ["17MKE", "21BHE", "22RBE"],
        "2019": ["17MKE", "21BHE", "22RBE", "23LDE"],
        "2020": ["17MKE", "21BHE", "22RBE", "23LDE"],
        "2021": ["17MKE", "21BHE", "22RBE", "23LDE"],
        "2022": ["17MKE", "21BHE", "22RBE"],
        "2023": ["17MKE", "21BHE", "22RBE"],
        "2024": ["17MKE", "21BHE", "22RBE"],
        "2025": ["17MKE", "21BHE", "22RBE"],
        "2026": ["17MKE", "21BHE", "22RBE"]
      },
      lengthRange: [
        17,
        25
      ],
      weightRange: [
        3500,
        6000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        24000,
        45000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Grand Design Imagine XLS — ultra-light Imagine packages for smaller tow vehicles."
    },
    Transcend: {
      type: "Travel Trailer",
      floorplans: ["207RB", "245RL", "265BH", "297QB"],
      floorplansByYear: {
        "2018": ["207RB", "245RL", "265BH"],
        "2019": ["207RB", "245RL", "265BH"],
        "2020": ["207RB", "245RL", "265BH", "297QB"],
        "2021": ["207RB", "245RL", "265BH", "297QB"],
        "2022": ["245RL", "265BH", "297QB"],
        "2023": ["245RL", "265BH", "297QB"],
        "2024": ["245RL", "265BH", "297QB"],
        "2025": ["245RL", "265BH"],
        "2026": ["245RL", "265BH"]
      },
      lengthRange: [
        20,
        32
      ],
      weightRange: [
        4000,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        25000,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Grand Design Transcend — value travel trailer line under Imagine/Solitude brand umbrella."
    },
    Momentum: {
      type: "Toy Hauler",
      floorplans: ["349M", "376TH", "395M", "397TH"],
      floorplansByYear: {
        "2014": ["349M", "376TH", "395M"],
        "2015": ["349M", "376TH", "395M"],
        "2016": ["349M", "376TH", "395M"],
        "2017": ["349M", "376TH", "395M"],
        "2018": ["349M", "376TH", "395M", "397TH"],
        "2019": ["349M", "376TH", "395M", "397TH"],
        "2020": ["349M", "376TH", "395M", "397TH"],
        "2021": ["349M", "376TH", "395M", "397TH"],
        "2022": ["376TH", "395M", "397TH"],
        "2023": ["376TH", "395M", "397TH"],
        "2024": ["395M", "397TH"],
        "2025": ["395M", "397TH"],
        "2026": ["395M", "397TH"]
      },
      lengthRange: [
        34,
        42
      ],
      weightRange: [
        10000,
        16000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        55000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      garageLengthFt: 13,
      garageWidthFt: 8.5,
      garageHeightIn: 86,
      garageCapacityLbs: 4500,
      fuelStationGal: 40,
      garageFits: "2 UTVs / large toys by plan",
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Grand Design Momentum — full-size toy hauler. Garage depth/height/CCC vary by plan — critical for UTVs."
    },
    "Momentum M-Class": {
      type: "Toy Hauler",
      floorplans: ["328M", "349M", "381M", "395M"],
      floorplansByYear: {
        "2015": ["328M", "349M", "381M"],
        "2016": ["328M", "349M", "381M"],
        "2017": ["328M", "349M", "381M"],
        "2018": ["328M", "349M", "381M"],
        "2019": ["328M", "349M", "381M", "395M"],
        "2020": ["328M", "349M", "381M", "395M"],
        "2021": ["328M", "349M", "381M", "395M"],
        "2022": ["349M", "381M", "395M"],
        "2023": ["349M", "381M", "395M"],
        "2024": ["349M", "381M", "395M"],
        "2025": ["349M", "395M"],
        "2026": ["349M", "395M"]
      },
      lengthRange: [
        32,
        40
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        48000,
        100000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      garageLengthFt: 11,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3500,
      fuelStationGal: 30,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Grand Design Momentum M-Class — mid toy hauler packages under Momentum."
    },
    "Momentum G-Class": {
      type: "Toy Hauler",
      floorplans: ["21G", "25G", "29G"],
      floorplansByYear: {
        "2018": ["21G", "25G", "29G"],
        "2019": ["21G", "25G", "29G"],
        "2020": ["21G", "25G", "29G"],
        "2021": ["21G", "25G", "29G"],
        "2022": ["21G", "25G", "29G"],
        "2023": ["21G", "25G", "29G"],
        "2024": ["25G", "29G"],
        "2025": ["25G", "29G"],
        "2026": ["25G", "29G"]
      },
      lengthRange: [
        21,
        32
      ],
      weightRange: [
        5000,
        9000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        35000,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 2500,
      garageFits: "Side-by-side / smaller toys",
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Grand Design Momentum G-Class — lighter / garage-focused toy hauler entry."
    },
    "Momentum MAV": {
      type: "Toy Hauler",
      floorplans: ["22MAV", "27MAV"],
      floorplansByYear: {
        "2022": ["22MAV", "27MAV"],
        "2023": ["22MAV", "27MAV"],
        "2024": ["22MAV", "27MAV"],
        "2025": ["22MAV", "27MAV"],
        "2026": ["22MAV", "27MAV"]
      },
      lengthRange: [
        22,
        28
      ],
      weightRange: [
        5500,
        9000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        42000,
        78000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      founded: 2012,
      warrantyYears: 2,
      yearStart: 2022,
      description: "Grand Design Momentum MAV — adventure / midsize toy hauler packaging (verify year availability)."
    },
    "Lineage Series E": {
      type: "Class C", floorplans: ["30DC"],
      floorplansByYear: { "2026": ["30DC"], "2027": ["30DC"] },
      lengthRange: [32, 33], weightRange: [12000, 14500], slideouts: 2, sleeps: 6, msrpRange: [189000, 249000],
      engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford Econoline E-450 DRW",
      transmission: "6-speed TorqShift", fuelType: "Gas", recalls: 0, rating: 4.45, image: RV_CARD_IMAGE,
      towingCapacity: 7500, freshWater: 50, grayWater: 40, blackWater: 35, fuelCapacityGal: 55,
      generator: "Onan / chassis-dependent", awningLength: 16, ceilingHeight: 82, founded: 2012, warrantyYears: 2, yearStart: 2026, gvwrLbs: 14500, overallLengthIn: 394,
      description: "Grand Design Lineage Series E — E-450 7.3 325/450, 30DC ~32' 10\", hitch 7,500, GVWR 14,500 / GCWR 22,000.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Ford 7.3L V8 gas 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford Econoline E-450 DRW", transmission: "6-speed TorqShift", towingCapacity: 7500, gvwrLbs: 14500 }],
    },
    "Lineage Series M": {
      type: "Class C", floorplans: ["25FW","25TK"],
      floorplansByYear: { "2025": ["25FW","25TK"], "2026": ["25FW","25TK"], "2027": ["25FW","25TK"] },
      lengthRange: [25, 26], weightRange: [10500, 12125], slideouts: 1, sleeps: 4, msrpRange: [210000, 260000],
      engine: "Mercedes-Benz 2.0L twin-turbo diesel 208HP", horsepower: 208, torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 4500 (MORryde Halo)", transmission: "9G-Tronic automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.5, image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 35, grayWater: 34, blackWater: 34, fuelCapacityGal: 24.5,
      generator: "Optional / chassis-dependent", awningLength: 14, ceilingHeight: 80, founded: 2012, warrantyYears: 2, yearStart: 2025, gvwrLbs: 12125, overallLengthIn: 308,
      description: "Grand Design Lineage Series M — Sprinter 4500 208/332, 25FW / 25TK, 25' 8\".",
      powertrainByYear: [{ from: 2025, to: 2027, engine: "Mercedes-Benz 2.0L twin-turbo diesel 208HP", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500 (MORryde Halo)", transmission: "9G-Tronic automatic", gvwrLbs: 12125 }],
    },
    "Lineage Series F": {
      type: "Super C", floorplans: ["31ZW","31ZW5"],
      floorplansByYear: { "2025": ["31ZW","31ZW5"], "2026": ["31ZW","31ZW5"], "2027": ["31ZW","31ZW5"] },
      lengthRange: [33, 34], weightRange: [18000, 22000], slideouts: 2, sleeps: 5, msrpRange: [280000, 360000],
      engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950,
      chassis: "Ford F-600 4x4 (31ZW) / F-550 4x4 (31ZW5)", transmission: "10-speed automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.55, image: RV_CARD_IMAGE, towingCapacity: 15000, freshWater: 79, grayWater: 66, blackWater: 45, fuelCapacityGal: 66.5,
      generator: "Onan 8.0 kW", awningLength: 13, ceilingHeight: 81, founded: 2012, warrantyYears: 2, yearStart: 2025, gvwrLbs: 22000, overallLengthIn: 405,
      description: "Grand Design Lineage Series F — Super C 4x4. 31ZW F-600 hitch 15k; 31ZW5 F-550 hitch 10k. Power Stroke 6.7 ~330/950, 33' 9\".",
      powertrainByYear: [
        { from: 2025, to: 2027, floorplans: ["31ZW"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F-600 Super Duty 4x4", towingCapacity: 15000, gvwrLbs: 22000 },
        { from: 2025, to: 2027, floorplans: ["31ZW5"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F-550 Super Duty 4x4", towingCapacity: 10000, gvwrLbs: 19500 },
        { from: 2025, to: 2027, engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford Super Duty 4x4 (F-600 / F-550)" },
      ],
    },
    "Lineage Series VT": {
      type: "Class B", floorplans: ["LVT1"],
      floorplansByYear: { "2026": ["LVT1"], "2027": ["LVT1"] },
      lengthRange: [20, 21], weightRange: [8500, 9950], slideouts: 0, sleeps: 2, msrpRange: [175000, 230000],
      engine: "Ford 3.5L EcoBoost V6 310HP", horsepower: 310, torqueLbFt: 400, chassis: "Ford Transit 350 AWD",
      transmission: "10-speed automatic", fuelType: "Gas", recalls: 0, rating: 4.4, image: RV_CARD_IMAGE,
      towingCapacity: 4000, freshWater: 34, grayWater: 23, blackWater: 0, fuelCapacityGal: 25,
      generator: "Optional / chassis-dependent", awningLength: 11, ceilingHeight: 76, founded: 2012, warrantyYears: 2, yearStart: 2026, gvwrLbs: 9950, overallLengthIn: 251,
      description: "Grand Design Lineage Series VT — Transit 350 AWD EcoBoost 310/400, LVT1 ~20' 11\".",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Ford 3.5L EcoBoost V6 310HP", horsepower: 310, torqueLbFt: 400, chassis: "Ford Transit 350 AWD", transmission: "10-speed automatic", gvwrLbs: 9950 }],
    }
  },
  Fleetwood: {
    Discovery: {
      type: "Class A Diesel",
      floorplans: ["36G", "38F", "38K", "40G", "38N", "36Q", "38W"],
      floorplansByYear: {
        "2005": ["36G", "38F", "38K"],
        "2006": ["36G", "38F", "38K"],
        "2007": ["36G", "38F", "38K"],
        "2008": ["36G", "38F", "38K"],
        "2009": ["36G", "38F", "38K", "40G"],
        "2010": ["36G", "38F", "38K", "40G"],
        "2011": ["36G", "38F", "38K", "40G"],
        "2012": ["36G", "38F", "38K", "40G"],
        "2013": ["36G", "38F", "38K", "40G"],
        "2014": ["36G", "38F", "38K", "40G"],
        "2015": ["36G", "38F", "38K", "40G"],
        "2016": ["36G", "38F", "38K", "40G"],
        "2017": ["36G", "38F", "38K", "40G"],
        "2018": ["36G", "38F", "38K", "38N", "40G"],
        "2019": ["36G", "38F", "38K", "38N", "40G"],
        "2020": ["36Q", "38K", "38N", "38W"],
        "2021": ["36Q", "38K", "38N", "38W"],
        "2022": ["36Q", "38K", "38N", "38W"],
        "2023": ["36Q", "38K", "38N", "38W"],
        "2024": ["36Q", "38K", "38N"],
        "2025": ["36Q", "38K", "38N"],
        "2026": ["36Q", "38K", "38N"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        30000,
        38000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        389000
      ],
      engine: "Cummins B6.7 (ISB) 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner XC-Series",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 105,
      grayWater: 75,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Fleetwood Discovery (regular) — Freightliner XC with Cummins B6.7 / ISB ~360 hp. NOT the 8.9 ISL and NOT Discovery LXE.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Cummins ISB 6.7 300–340HP (by year)",
          horsepower: 320,
          chassis: "Freightliner XC",
          notes: "Pre-ISB 360 common packaging"
        },
        {
          from: 2011,
          to: 2016,
          engine: "Cummins ISB 6.7 ~340–360HP",
          horsepower: 340,
          chassis: "Freightliner XC-Series",
          notes: "Discovery gas never used 8.9L ISL — diesel ISB family"
        },
        {
          from: 2017,
          to: 2026,
          engine: "Cummins B6.7 (ISB) 360HP",
          horsepower: 360,
          chassis: "Freightliner XC-Series",
          notes: "2022 Discovery 38K = B6.7 360HP Freightliner — NOT 8.9L ISL"
        }
      ]
    },
    "Discovery LXE": {
      type: "Class A Diesel",
      floorplans: ["40G", "40M", "44H", "44B"],
      floorplansByYear: {
        "2012": ["40G", "40M", "44H"],
        "2013": ["40G", "40M", "44H"],
        "2014": ["40G", "40M", "44H"],
        "2015": ["40G", "40M", "44H"],
        "2016": ["40G", "40M", "44H"],
        "2017": ["40G", "40M", "44H"],
        "2018": ["40G", "40M", "44H"],
        "2019": ["40G", "40M", "44H", "44B"],
        "2020": ["40G", "40M", "44H", "44B"],
        "2021": ["40G", "40M", "44H", "44B"],
        "2022": ["40G", "44H", "44B"],
        "2023": ["40G", "44H", "44B"],
        "2024": ["40G", "44H", "44B"],
        "2025": ["40G", "44H"],
        "2026": ["40G", "44H"]
      },
      lengthRange: [
        40,
        44
      ],
      weightRange: [
        38000,
        48000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        349000,
        529000
      ],
      engine: "Cummins L9 / ISX (by year/option)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner / Spartan (by option)",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Fleetwood Discovery LXE — high-line diesel above regular Discovery. Often L9 450; some Spartan/higher options by year.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner / Spartan (by option)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISL / L9 450HP",
          horsepower: 450,
          chassis: "Freightliner XC"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins L9 450HP (higher options by build)",
          horsepower: 450,
          chassis: "Freightliner / Spartan option"
        },
        
      ]
    },
    Bounder: {
      type: "Class A Gas",
      floorplans: ["33C", "35K", "36H", "36F"],
      floorplansByYear: {
        "2005": ["33C", "35K", "36H"],
        "2006": ["33C", "35K", "36H"],
        "2007": ["33C", "35K", "36H"],
        "2008": ["33C", "35K", "36H"],
        "2009": ["33C", "35K", "36H"],
        "2010": ["33C", "35K", "36H"],
        "2011": ["33C", "35K", "36H"],
        "2012": ["33C", "35K", "36H"],
        "2013": ["33C", "35K", "36H"],
        "2014": ["33C", "35K", "36H"],
        "2015": ["33C", "35K", "36H"],
        "2016": ["33C", "35K", "36H"],
        "2017": ["33C", "35K", "36H"],
        "2018": ["33C", "35K", "36H"],
        "2019": ["33C", "35K", "36H", "36F"],
        "2020": ["33C", "35K", "36H", "36F"],
        "2021": ["33C", "35K", "36H", "36F"],
        "2022": ["33C", "35K", "36H"],
        "2023": ["33C", "35K", "36H"],
        "2024": ["33C", "35K", "36H"],
        "2025": ["33C", "35K"],
        "2026": ["33C", "35K"]
      },
      lengthRange: [
        33,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        139000,
        229000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 1985,
      description: "Fleetwood Bounder — classic gas Class A nameplate. Recent F53 years use 7.3L Godzilla.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    "Bounder Classic": {
      type: "Class A Gas",
      floorplans: ["33C", "35K"],
      floorplansByYear: {
        "2010": ["33C", "35K"],
        "2011": ["33C", "35K"],
        "2012": ["33C", "35K"],
        "2013": ["33C", "35K"],
        "2014": ["33C", "35K"],
        "2015": ["33C", "35K"],
        "2016": ["33C", "35K"],
        "2017": ["33C", "35K"],
        "2018": ["33C", "35K"],
        "2019": ["33C", "35K"],
        "2020": ["33C", "35K"],
        "2021": ["33C", "35K"],
        "2022": ["33C", "35K"]
      },
      lengthRange: [
        33,
        35
      ],
      weightRange: [
        16000,
        21000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129000,
        199000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2022,
      description: "Fleetwood Bounder Classic — value gas Class A packages.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2022,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    "Pace Arrow": {
      type: "Class A Gas",
      floorplans: ["33D", "35R", "36U"],
      floorplansByYear: {
        "2005": ["33D", "35R", "36U"],
        "2006": ["33D", "35R", "36U"],
        "2007": ["33D", "35R", "36U"],
        "2008": ["33D", "35R", "36U"],
        "2009": ["33D", "35R", "36U"],
        "2010": ["33D", "35R", "36U"],
        "2011": ["33D", "35R", "36U"],
        "2012": ["33D", "35R", "36U"],
        "2013": ["33D", "35R", "36U"],
        "2014": ["33D", "35R", "36U"],
        "2015": ["33D", "35R", "36U"],
        "2016": ["33D", "35R", "36U"],
        "2017": ["33D", "35R", "36U"],
        "2018": ["33D", "35R", "36U"],
        "2019": ["33D", "35R", "36U"],
        "2020": ["33D", "35R", "36U"],
        "2021": ["33D", "35R", "36U"],
        "2022": ["33D", "35R"],
        "2023": ["33D", "35R"],
        "2024": ["33D", "35R"],
        "2025": ["33D", "35R"],
        "2026": ["33D", "35R"]
      },
      lengthRange: [
        33,
        36
      ],
      weightRange: [
        17000,
        23000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149000,
        239000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Fleetwood Pace Arrow — gas Class A (REV era). F53 7.3L on recent years.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Storm: {
      type: "Class A Gas",
      floorplans: ["28F", "32V", "36F"],
      floorplansByYear: {
        "2005": ["28F", "32V", "36F"],
        "2006": ["28F", "32V", "36F"],
        "2007": ["28F", "32V", "36F"],
        "2008": ["28F", "32V", "36F"],
        "2009": ["28F", "32V", "36F"],
        "2010": ["28F", "32V", "36F"],
        "2011": ["28F", "32V", "36F"],
        "2012": ["28F", "32V", "36F"],
        "2013": ["28F", "32V", "36F"],
        "2014": ["28F", "32V", "36F"],
        "2015": ["28F", "32V", "36F"],
        "2016": ["28F", "32V", "36F"],
        "2017": ["28F", "32V", "36F"],
        "2018": ["28F", "32V", "36F"],
        "2019": ["28F", "32V", "36F"],
        "2020": ["28F", "32V", "36F"],
        "2021": ["28F", "32V", "36F"],
        "2022": ["32V", "36F"],
        "2023": ["32V", "36F"],
        "2024": ["32V", "36F"],
        "2025": ["32V", "36F"],
        "2026": ["32V", "36F"]
      },
      lengthRange: [
        28,
        36
      ],
      weightRange: [
        15000,
        22000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129000,
        209000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Fleetwood Storm — gas Class A entry/mid line on F53.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Flair: {
      type: "Class A Gas",
      floorplans: ["28A", "30U", "32S"],
      floorplansByYear: {
        "2008": ["28A", "30U", "32S"],
        "2009": ["28A", "30U", "32S"],
        "2010": ["28A", "30U", "32S"],
        "2011": ["28A", "30U", "32S"],
        "2012": ["28A", "30U", "32S"],
        "2013": ["28A", "30U", "32S"],
        "2014": ["28A", "30U", "32S"],
        "2015": ["28A", "30U", "32S"],
        "2016": ["28A", "30U", "32S"],
        "2017": ["28A", "30U", "32S"],
        "2018": ["28A", "30U", "32S"],
        "2019": ["28A", "30U", "32S"],
        "2020": ["28A", "30U", "32S"],
        "2021": ["28A", "30U", "32S"],
        "2022": ["28A", "30U"],
        "2023": ["28A", "30U"],
        "2024": ["28A", "30U"],
        "2025": ["28A", "30U"],
        "2026": ["28A", "30U"]
      },
      lengthRange: [
        28,
        32
      ],
      weightRange: [
        14000,
        20000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        119000,
        189000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Fleetwood Flair — shorter gas Class A on F53.",
      powertrainByYear: [
        {
          from: 2008,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Jamboree: {
      type: "Class C",
      floorplans: ["25B", "29V", "31M", "31W"],
      floorplansByYear: {
        "2005": ["25B", "29V", "31M"],
        "2006": ["25B", "29V", "31M"],
        "2007": ["25B", "29V", "31M"],
        "2008": ["25B", "29V", "31M"],
        "2009": ["25B", "29V", "31M"],
        "2010": ["25B", "29V", "31M"],
        "2011": ["25B", "29V", "31M"],
        "2012": ["25B", "29V", "31M"],
        "2013": ["25B", "29V", "31M"],
        "2014": ["25B", "29V", "31M"],
        "2015": ["25B", "29V", "31M"],
        "2016": ["25B", "29V", "31M"],
        "2017": ["25B", "29V", "31M"],
        "2018": ["25B", "29V", "31M"],
        "2019": ["25B", "29V", "31M", "31W"],
        "2020": ["25B", "29V", "31M", "31W"],
        "2021": ["25B", "29V", "31M", "31W"],
        "2022": ["25B", "29V", "31M"],
        "2023": ["25B", "29V", "31M"],
        "2024": ["25B", "29V", "31M"],
        "2025": ["25B", "29V", "31M"],
        "2026": ["25B", "29V", "31M"]
      },
      lengthRange: [
        25,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        89000,
        149000
      ],
      engine: "Ford 7.3L V8 / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Fleetwood Jamboree — Ford cutaway Class C.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Tioga: {
      type: "Class C",
      floorplans: ["24K", "25G", "31M"],
      floorplansByYear: {
        "2005": ["24K", "25G", "31M"],
        "2006": ["24K", "25G", "31M"],
        "2007": ["24K", "25G", "31M"],
        "2008": ["24K", "25G", "31M"],
        "2009": ["24K", "25G", "31M"],
        "2010": ["24K", "25G", "31M"],
        "2011": ["24K", "25G", "31M"],
        "2012": ["24K", "25G", "31M"],
        "2013": ["24K", "25G", "31M"],
        "2014": ["24K", "25G", "31M"],
        "2015": ["24K", "25G", "31M"],
        "2016": ["24K", "25G", "31M"],
        "2017": ["24K", "25G", "31M"],
        "2018": ["24K", "25G", "31M"],
        "2019": ["24K", "25G", "31M"],
        "2020": ["24K", "25G", "31M"],
        "2021": ["24K", "25G", "31M"],
        "2022": ["24K", "25G", "31M"],
        "2023": ["24K", "25G", "31M"],
        "2024": ["24K", "25G", "31M"],
        "2025": ["24K", "25G", "31M"],
        "2026": ["24K", "25G", "31M"]
      },
      lengthRange: [
        24,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        89000,
        149000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Fleetwood Tioga — Ford Class C (Jamboree sibling branding).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    "Tioga Ranger": {
      type: "Class C",
      floorplans: ["25K", "31N"],
      floorplansByYear: {
        "2010": ["25K", "31N"],
        "2011": ["25K", "31N"],
        "2012": ["25K", "31N"],
        "2013": ["25K", "31N"],
        "2014": ["25K", "31N"],
        "2015": ["25K", "31N"],
        "2016": ["25K", "31N"],
        "2017": ["25K", "31N"],
        "2018": ["25K", "31N"],
        "2019": ["25K", "31N"],
        "2020": ["25K", "31N"],
        "2021": ["25K", "31N"],
        "2022": ["25K", "31N"],
        "2023": ["25K", "31N"],
        "2024": ["25K", "31N"]
      },
      lengthRange: [
        25,
        31
      ],
      weightRange: [
        11000,
        14000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        79000,
        129000
      ],
      engine: "Ford 6.2L / 7.3L",
      horsepower: 305,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2024,
      description: "Fleetwood Tioga Ranger — value Class C packages.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2024,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Pulse: {
      type: "Class C",
      floorplans: ["24A", "24D", "24L"],
      floorplansByYear: {
        "2014": ["24A", "24D"],
        "2015": ["24A", "24D"],
        "2016": ["24A", "24D"],
        "2017": ["24A", "24D"],
        "2018": ["24A", "24D"],
        "2019": ["24A", "24D", "24L"],
        "2020": ["24A", "24D", "24L"],
        "2021": ["24A", "24D", "24L"],
        "2022": ["24A", "24D"],
        "2023": ["24A", "24D"],
        "2024": ["24A", "24D"],
        "2025": ["24A", "24D"],
        "2026": ["24A", "24D"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        119000,
        179000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Fleetwood Pulse — Sprinter diesel Class C.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Xcursion: {
      type: "Class B",
      floorplans: ["19CB", "24CB"],
      floorplansByYear: {
        "2024": ["19CB", "24CB"],
        "2025": ["19CB", "24CB"],
        "2026": ["19CB", "24CB"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        8500,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        149000,
        209000
      ],
      engine: "Mercedes-Benz / RAM (by chassis year)",
      horsepower: 208,
      chassis: "Sprinter or ProMaster (by package)",
      fuelType: "Diesel / Gas",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2024,
      description: "Fleetwood Xcursion — newer Class B under Fleetwood Family of Brands (REV).",
      powertrainByYear: [
        {
          from: 2024,
          to: 2026,
          engine: "Sprinter turbodiesel or ProMaster gas",
          horsepower: 208,
          chassis: "Van chassis by package"
        }
      ]
    }
  },
  Jayco: {
    Precept: {
      type: "Class A Gas",
      floorplans: ["31UL", "35S", "36T", "34G", "36A"],
      floorplansByYear: {
        "2014": ["31UL", "35S", "36T"],
        "2015": ["31UL", "35S", "36T"],
        "2016": ["31UL", "35S", "36T"],
        "2017": ["31UL", "35S", "36T"],
        "2018": ["31UL", "34G", "35S", "36T"],
        "2019": ["31UL", "34G", "35S", "36T"],
        "2020": ["31UL", "34G", "36A", "36T"],
        "2021": ["31UL", "34G", "36A", "36T"],
        "2022": ["31UL", "34G", "36A", "36T"],
        "2023": ["31UL", "34G", "36A", "36T"],
        "2024": ["31UL", "34G", "36A"],
        "2025": ["31UL", "34G", "36A"],
        "2026": ["31UL", "34G", "36A"]
      },
      lengthRange: [
        31,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        149000,
        249000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Jayco Precept — gas Class A on Ford F53. Newer years 7.3L Godzilla (not V10 forever).",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Alante: {
      type: "Class A Gas",
      floorplans: ["26X", "29F", "31V"],
      floorplansByYear: {
        "2015": ["26X", "29F", "31V"],
        "2016": ["26X", "29F", "31V"],
        "2017": ["26X", "29F", "31V"],
        "2018": ["26X", "29F", "31V"],
        "2019": ["26X", "29F", "31V"],
        "2020": ["26X", "29F", "31V"],
        "2021": ["26X", "29F", "31V"],
        "2022": ["26X", "29F", "31V"],
        "2023": ["26X", "29F", "31V"],
        "2024": ["26X", "29F", "31V"],
        "2025": ["26X", "29F"],
        "2026": ["26X", "29F"]
      },
      lengthRange: [
        26,
        31
      ],
      weightRange: [
        14000,
        20000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129000,
        209000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Jayco Alante — entry/mid gas Class A on F53 (shorter than Precept).",
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Embark: {
      type: "Class A Diesel",
      floorplans: ["37K", "38N", "39T", "39Z"],
      floorplansByYear: {
        "2015": ["37K", "38N", "39T"],
        "2016": ["37K", "38N", "39T"],
        "2017": ["37K", "38N", "39T"],
        "2018": ["37K", "38N", "39T"],
        "2019": ["37K", "38N", "39T", "39Z"],
        "2020": ["37K", "38N", "39T", "39Z"],
        "2021": ["37K", "38N", "39T", "39Z"],
        "2022": ["37K", "38N", "39Z"],
        "2023": ["37K", "38N", "39Z"],
        "2024": ["37K", "38N", "39Z"],
        "2025": ["37K", "38N"],
        "2026": ["37K", "38N"]
      },
      lengthRange: [
        37,
        40
      ],
      weightRange: [
        30000,
        40000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        259000,
        399000
      ],
      engine: "Cummins B6.7 / L9 360–450HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner XC-Series",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Jayco Embark — mid-diesel Class A on Freightliner XC. B6.7/L9 class — not a 600 hp Spartan coach.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          chassis: "Freightliner XC"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins B6.7 / L9 360–450HP",
          horsepower: 360,
          chassis: "Freightliner XC-Series"
        },
        
      ]
    },
    "Seneca Super C": {
      type: "Super C",
      floorplans: ["37HJ", "37FS", "37TS"],
      floorplansByYear: {
        "2014": ["37HJ", "37FS"],
        "2015": ["37HJ", "37FS"],
        "2016": ["37HJ", "37FS"],
        "2017": ["37HJ", "37FS"],
        "2018": ["37HJ", "37FS"],
        "2019": ["37HJ", "37FS", "37TS"],
        "2020": ["37HJ", "37FS", "37TS"],
        "2021": ["37HJ", "37FS", "37TS"],
        "2022": ["37HJ", "37FS", "37TS"],
        "2023": ["37HJ", "37FS", "37TS"],
        "2024": ["37HJ", "37FS", "37TS"],
        "2025": ["37HJ", "37TS"],
        "2026": ["37HJ", "37TS"]
      },
      lengthRange: [
        37,
        38
      ],
      weightRange: [
        26000,
        34000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        249000,
        389000
      ],
      engine: "Ford Power Stroke 6.7L / Cummins Super C (by chassis year)",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Freightliner / Ford Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Jayco Seneca Super C — diesel Super C. Verify exact chassis/engine on build sheet.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Super C diesel (Ford 6.7 Power Stroke or Cummins by chassis)",
          horsepower: 330,
          chassis: "Super C platform"
        }
      ]
    },
    Greyhawk: {
      type: "Class C",
      floorplans: ["29MV", "30X", "31F", "31FS", "32S"],
      floorplansByYear: {
        "2008": ["29MV", "30X", "31F"],
        "2009": ["29MV", "30X", "31F"],
        "2010": ["29MV", "30X", "31F"],
        "2011": ["29MV", "30X", "31F"],
        "2012": ["29MV", "30X", "31F"],
        "2013": ["29MV", "30X", "31F"],
        "2014": ["29MV", "30X", "31F"],
        "2015": ["29MV", "30X", "31F"],
        "2016": ["29MV", "30X", "31F"],
        "2017": ["29MV", "30X", "31F"],
        "2018": ["29MV", "30X", "31F", "31FS"],
        "2019": ["29MV", "30X", "31F", "31FS"],
        "2020": ["29MV", "30X", "31F", "32S"],
        "2021": ["29MV", "30X", "31F", "32S"],
        "2022": ["29MV", "30X", "31F", "32S"],
        "2023": ["29MV", "30X", "31F", "32S"],
        "2024": ["29MV", "30X", "31F", "32S"],
        "2025": ["29MV", "30X", "31F"],
        "2026": ["29MV", "30X", "31F"]
      },
      lengthRange: [
        29,
        32
      ],
      weightRange: [
        12000,
        15000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        99000,
        169000
      ],
      engine: "Ford 7.3L V8 Godzilla / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2008,
      description: "Jayco Greyhawk — popular Ford Class C. Recent years 7.3L ~350 hp on E-450.",
      powertrainByYear: [
        {
          from: 2008,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10 (by year)",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Redhawk: {
      type: "Class C",
      floorplans: ["22J", "26XD", "29XK", "31F"],
      floorplansByYear: {
        "2010": ["22J", "26XD", "29XK"],
        "2011": ["22J", "26XD", "29XK"],
        "2012": ["22J", "26XD", "29XK"],
        "2013": ["22J", "26XD", "29XK"],
        "2014": ["22J", "26XD", "29XK"],
        "2015": ["22J", "26XD", "29XK"],
        "2016": ["22J", "26XD", "29XK"],
        "2017": ["22J", "26XD", "29XK"],
        "2018": ["22J", "26XD", "29XK"],
        "2019": ["22J", "26XD", "29XK", "31F"],
        "2020": ["22J", "26XD", "29XK", "31F"],
        "2021": ["22J", "26XD", "29XK", "31F"],
        "2022": ["22J", "26XD", "29XK"],
        "2023": ["22J", "26XD", "29XK"],
        "2024": ["22J", "26XD", "29XK"],
        "2025": ["22J", "26XD", "29XK"],
        "2026": ["22J", "26XD", "29XK"]
      },
      lengthRange: [
        22,
        31
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        89000,
        149000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Jayco Redhawk — value Ford Class C sibling to Greyhawk.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Melbourne: {
      type: "Class C",
      floorplans: ["24K", "24L", "24N"],
      floorplansByYear: {
        "2012": ["24K", "24L"],
        "2013": ["24K", "24L"],
        "2014": ["24K", "24L"],
        "2015": ["24K", "24L"],
        "2016": ["24K", "24L"],
        "2017": ["24K", "24L"],
        "2018": ["24K", "24L"],
        "2019": ["24K", "24L", "24N"],
        "2020": ["24K", "24L", "24N"],
        "2021": ["24K", "24L", "24N"],
        "2022": ["24K", "24L"],
        "2023": ["24K", "24L"],
        "2024": ["24K", "24L"],
        "2025": ["24K", "24L"],
        "2026": ["24K", "24L"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        129000,
        189000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Jayco Melbourne — Sprinter diesel Class C.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Melbourne Prestige": {
      type: "Class C",
      floorplans: ["24LP", "24KP"],
      floorplansByYear: {
        "2014": ["24LP", "24KP"],
        "2015": ["24LP", "24KP"],
        "2016": ["24LP", "24KP"],
        "2017": ["24LP", "24KP"],
        "2018": ["24LP", "24KP"],
        "2019": ["24LP", "24KP"],
        "2020": ["24LP", "24KP"],
        "2021": ["24LP", "24KP"],
        "2022": ["24LP", "24KP"],
        "2023": ["24LP", "24KP"],
        "2024": ["24LP", "24KP"],
        "2025": ["24LP"],
        "2026": ["24LP"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149000,
        219000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Jayco Melbourne Prestige — higher-content Sprinter Class C.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Jay Feather": {
      type: "Travel Trailer",
      floorplans: ["7", "X213", "X23B", "27BHB"],
      floorplansByYear: {
        "2005": ["7", "X213", "X23B"],
        "2006": ["7", "X213", "X23B"],
        "2007": ["7", "X213", "X23B"],
        "2008": ["7", "X213", "X23B"],
        "2009": ["7", "X213", "X23B"],
        "2010": ["7", "X213", "X23B"],
        "2011": ["7", "X213", "X23B"],
        "2012": ["7", "X213", "X23B"],
        "2013": ["7", "X213", "X23B"],
        "2014": ["7", "X213", "X23B"],
        "2015": ["7", "X213", "X23B"],
        "2016": ["7", "X213", "X23B"],
        "2017": ["7", "X213", "X23B"],
        "2018": ["7", "X213", "X23B"],
        "2019": ["7", "X213", "X23B", "27BHB"],
        "2020": ["7", "X213", "X23B", "27BHB"],
        "2021": ["7", "X213", "X23B", "27BHB"],
        "2022": ["X213", "X23B", "27BHB"],
        "2023": ["X213", "X23B", "27BHB"],
        "2024": ["X213", "X23B", "27BHB"],
        "2025": ["X213", "X23B", "27BHB"],
        "2026": ["X213", "X23B", "27BHB"]
      },
      lengthRange: [
        16,
        30
      ],
      weightRange: [
        3000,
        7000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        22000,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Jayco Jay Feather — lightweight travel trailer family. UVW/hitch vary by plan — door sticker rules."
    },
    Eagle: {
      type: "Fifth Wheel",
      floorplans: ["317RLOK", "330RSTS", "355MBQS", "321RSTS"],
      floorplansByYear: {
        "2005": ["317RLOK", "330RSTS", "355MBQS"],
        "2006": ["317RLOK", "330RSTS", "355MBQS"],
        "2007": ["317RLOK", "330RSTS", "355MBQS"],
        "2008": ["317RLOK", "330RSTS", "355MBQS"],
        "2009": ["317RLOK", "330RSTS", "355MBQS"],
        "2010": ["317RLOK", "330RSTS", "355MBQS"],
        "2011": ["317RLOK", "330RSTS", "355MBQS"],
        "2012": ["317RLOK", "330RSTS", "355MBQS"],
        "2013": ["317RLOK", "330RSTS", "355MBQS"],
        "2014": ["317RLOK", "330RSTS", "355MBQS"],
        "2015": ["317RLOK", "330RSTS", "355MBQS"],
        "2016": ["317RLOK", "330RSTS", "355MBQS"],
        "2017": ["317RLOK", "330RSTS", "355MBQS"],
        "2018": ["317RLOK", "330RSTS", "355MBQS"],
        "2019": ["317RLOK", "330RSTS", "355MBQS", "321RSTS"],
        "2020": ["317RLOK", "330RSTS", "355MBQS", "321RSTS"],
        "2021": ["317RLOK", "330RSTS", "355MBQS", "321RSTS"],
        "2022": ["317RLOK", "330RSTS", "355MBQS"],
        "2023": ["317RLOK", "330RSTS", "355MBQS"],
        "2024": ["317RLOK", "330RSTS", "355MBQS"],
        "2025": ["330RSTS", "355MBQS"],
        "2026": ["330RSTS", "355MBQS"]
      },
      lengthRange: [
        31,
        38
      ],
      weightRange: [
        8000,
        12000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        45000,
        85000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Jayco Eagle — mid/high fifth wheel. Confirm pin weight for truck match."
    },
    "Eagle HT": {
      type: "Fifth Wheel",
      floorplans: ["26.5BHS", "28.5RSTS", "29.5BHDS"],
      floorplansByYear: {
        "2012": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2013": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2014": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2015": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2016": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2017": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2018": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2019": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2020": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2021": ["26.5BHS", "28.5RSTS", "29.5BHDS"],
        "2022": ["26.5BHS", "28.5RSTS"],
        "2023": ["26.5BHS", "28.5RSTS"],
        "2024": ["26.5BHS", "28.5RSTS"],
        "2025": ["26.5BHS", "28.5RSTS"],
        "2026": ["26.5BHS", "28.5RSTS"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        6500,
        10000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        38000,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Jayco Eagle HT — half-ton friendly fifth wheel packaging (still verify actual pin/UVW)."
    },
    "North Point": {
      type: "Fifth Wheel",
      floorplans: ["377RLBH", "381DLQS", "387RDFS", "310RLTS"],
      floorplansByYear: {
        "2013": ["377RLBH", "381DLQS", "387RDFS"],
        "2014": ["377RLBH", "381DLQS", "387RDFS"],
        "2015": ["377RLBH", "381DLQS", "387RDFS"],
        "2016": ["377RLBH", "381DLQS", "387RDFS"],
        "2017": ["377RLBH", "381DLQS", "387RDFS"],
        "2018": ["377RLBH", "381DLQS", "387RDFS"],
        "2019": ["377RLBH", "381DLQS", "387RDFS", "310RLTS"],
        "2020": ["377RLBH", "381DLQS", "387RDFS", "310RLTS"],
        "2021": ["377RLBH", "381DLQS", "387RDFS", "310RLTS"],
        "2022": ["377RLBH", "381DLQS", "387RDFS"],
        "2023": ["377RLBH", "381DLQS", "387RDFS"],
        "2024": ["377RLBH", "381DLQS", "387RDFS"],
        "2025": ["377RLBH", "381DLQS"],
        "2026": ["377RLBH", "381DLQS"]
      },
      lengthRange: [
        31,
        42
      ],
      weightRange: [
        10000,
        15000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        65000,
        120000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2013,
      description: "Jayco North Point — luxury fifth wheel. Heavy units — match truck carefully."
    },
    Pinnacle: {
      type: "Fifth Wheel",
      floorplans: ["36FBTS", "38FLGS", "38FBRK"],
      floorplansByYear: {
        "2014": ["36FBTS", "38FLGS", "38FBRK"],
        "2015": ["36FBTS", "38FLGS", "38FBRK"],
        "2016": ["36FBTS", "38FLGS", "38FBRK"],
        "2017": ["36FBTS", "38FLGS", "38FBRK"],
        "2018": ["36FBTS", "38FLGS", "38FBRK"],
        "2019": ["36FBTS", "38FLGS", "38FBRK"],
        "2020": ["36FBTS", "38FLGS", "38FBRK"],
        "2021": ["36FBTS", "38FLGS", "38FBRK"],
        "2022": ["36FBTS", "38FLGS"],
        "2023": ["36FBTS", "38FLGS"],
        "2024": ["36FBTS", "38FLGS"],
        "2025": ["36FBTS", "38FLGS"],
        "2026": ["36FBTS", "38FLGS"]
      },
      lengthRange: [
        36,
        42
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        70000,
        130000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Jayco Pinnacle — top Jayco fifth wheel line."
    },
    Talon: {
      type: "Toy Hauler",
      floorplans: ["313T", "392T", "403T", "414T"],
      floorplansByYear: {
        "2012": ["313T", "392T", "403T"],
        "2013": ["313T", "392T", "403T"],
        "2014": ["313T", "392T", "403T"],
        "2015": ["313T", "392T", "403T"],
        "2016": ["313T", "392T", "403T"],
        "2017": ["313T", "392T", "403T"],
        "2018": ["313T", "392T", "403T"],
        "2019": ["313T", "392T", "403T", "414T"],
        "2020": ["313T", "392T", "403T", "414T"],
        "2021": ["313T", "392T", "403T", "414T"],
        "2022": ["392T", "403T", "414T"],
        "2023": ["392T", "403T", "414T"],
        "2024": ["392T", "403T", "414T"],
        "2025": ["403T", "414T"],
        "2026": ["403T", "414T"]
      },
      lengthRange: [
        31,
        42
      ],
      weightRange: [
        8000,
        14000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        45000,
        95000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3500,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Jayco Talon — toy hauler. Garage length/capacity critical — verify plan brochure."
    },
    Octane: {
      type: "Toy Hauler",
      floorplans: ["161", "222", "273"],
      floorplansByYear: {
        "2014": ["161", "222", "273"],
        "2015": ["161", "222", "273"],
        "2016": ["161", "222", "273"],
        "2017": ["161", "222", "273"],
        "2018": ["161", "222", "273"],
        "2019": ["161", "222", "273"],
        "2020": ["161", "222", "273"],
        "2021": ["161", "222", "273"],
        "2022": ["222", "273"],
        "2023": ["222", "273"],
        "2024": ["222", "273"],
        "2025": ["222", "273"],
        "2026": ["222", "273"]
      },
      lengthRange: [
        16,
        28
      ],
      weightRange: [
        3500,
        8000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        28000,
        58000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 10,
      garageWidthFt: 7.5,
      garageHeightIn: 78,
      garageCapacityLbs: 2500,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Jayco Octane — lighter toy hauler / sport trailer family."
    },
    Seismic: {
      type: "Toy Hauler",
      floorplans: ["3512", "4113", "4212"],
      floorplansByYear: {
        "2013": ["3512", "4113", "4212"],
        "2014": ["3512", "4113", "4212"],
        "2015": ["3512", "4113", "4212"],
        "2016": ["3512", "4113", "4212"],
        "2017": ["3512", "4113", "4212"],
        "2018": ["3512", "4113", "4212"],
        "2019": ["3512", "4113", "4212"],
        "2020": ["3512", "4113", "4212"],
        "2021": ["3512", "4113", "4212"],
        "2022": ["4113", "4212"],
        "2023": ["4113", "4212"],
        "2024": ["4113", "4212"],
        "2025": ["4113", "4212"],
        "2026": ["4113", "4212"]
      },
      lengthRange: [
        35,
        42
      ],
      weightRange: [
        10000,
        15000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        55000,
        110000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      garageLengthFt: 13,
      garageWidthFt: 8.5,
      garageHeightIn: 86,
      garageCapacityLbs: 4500,
      fuelStationGal: 30,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2013,
      description: "Jayco Seismic — full-size toy hauler. Large garages; match truck carefully."
    }
  },
  "American Coach": {
    "American Tradition": {
      type: "Class A Diesel",
      floorplans: ["42G", "42R", "45A", "42Q", "42V"],
      floorplansByYear: {
        "2005": ["42G", "42R", "45A"],
        "2006": ["42G", "42R", "45A"],
        "2007": ["42G", "42R", "45A"],
        "2008": ["42G", "42R", "45A"],
        "2009": ["42G", "42R", "45A"],
        "2010": ["42G", "42R", "45A"],
        "2011": ["42G", "42R", "45A"],
        "2012": ["42G", "42R", "45A"],
        "2013": ["42G", "42R", "45A"],
        "2014": ["42G", "42R", "45A"],
        "2015": ["42G", "42R", "45A"],
        "2016": ["42G", "42R", "45A"],
        "2017": ["42G", "42R", "45A"],
        "2018": ["42G", "42Q", "42V", "45A"],
        "2019": ["42G", "42Q", "42V", "45A"],
        "2020": ["42G", "42Q", "42V"],
        "2021": ["42G", "42Q", "42V"],
        "2022": ["42Q", "42V"],
        "2023": ["42Q", "42V"],
        "2024": ["42Q", "42V"],
        "2025": ["42Q", "42V"],
        "2026": ["42Q", "42V"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        42000,
        50000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        449000,
        699000
      ],
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner Liberty Bridge / modular",
      transmission: "Allison 3000",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 40,
      fuelCapacityGal: 150,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2000,
      description: "American Coach American Tradition — high-line diesel. 2021-era L9 450 / Liberty Bridge common; verify floorplan (42Q/42V etc.).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner Liberty Bridge / modular",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner Liberty Bridge / modular",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISL / L9 450HP",
          horsepower: 450,
          chassis: "Freightliner modular"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner Liberty Bridge",
          transmission: "Allison 3000"
        },
        
      ]
    },
    "American Eagle": {
      type: "Class A Diesel",
      floorplans: ["45B", "45J", "45N"],
      floorplansByYear: {
        "2005": ["45B", "45J", "45N"],
        "2006": ["45B", "45J", "45N"],
        "2007": ["45B", "45J", "45N"],
        "2008": ["45B", "45J", "45N"],
        "2009": ["45B", "45J", "45N"],
        "2010": ["45B", "45J", "45N"],
        "2011": ["45B", "45J", "45N"],
        "2012": ["45B", "45J", "45N"],
        "2013": ["45B", "45J", "45N"],
        "2014": ["45B", "45J", "45N"],
        "2015": ["45B", "45J", "45N"],
        "2016": ["45B", "45J", "45N"],
        "2017": ["45B", "45J", "45N"],
        "2018": ["45B", "45J", "45N"],
        "2019": ["45B", "45J", "45N"],
        "2020": ["45B", "45J", "45N"],
        "2021": ["45B", "45J", "45N"],
        "2022": ["45B", "45J"],
        "2023": ["45B", "45J"],
        "2024": ["45B", "45J"],
        "2025": ["45B", "45J"],
        "2026": ["45B", "45J"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        46000,
        56000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        499000,
        799000
      ],
      engine: "Cummins L9 / X15 (by option)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan / Freightliner high-line",
      transmission: "Allison 3000/4000",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2000,
      description: "American Coach American Eagle — luxury diesel above Tradition. Powertrain options can include higher Cummins ratings.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan / Freightliner high-line",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan / Freightliner high-line",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISX / L9 class",
          horsepower: 450,
          chassis: "Spartan / Freightliner"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 / X15 (by option)",
          horsepower: 450,
          chassis: "Spartan / Freightliner high-line"
        },
        
      ]
    },
    "American Dream": {
      type: "Class A Diesel",
      floorplans: ["42G", "45A", "45B"],
      floorplansByYear: {
        "2005": ["42G", "45A", "45B"],
        "2006": ["42G", "45A", "45B"],
        "2007": ["42G", "45A", "45B"],
        "2008": ["42G", "45A", "45B"],
        "2009": ["42G", "45A", "45B"],
        "2010": ["42G", "45A", "45B"],
        "2011": ["42G", "45A", "45B"],
        "2012": ["42G", "45A", "45B"],
        "2013": ["42G", "45A", "45B"],
        "2014": ["42G", "45A", "45B"],
        "2015": ["42G", "45A", "45B"],
        "2016": ["42G", "45A", "45B"],
        "2017": ["42G", "45A", "45B"],
        "2018": ["42G", "45A", "45B"],
        "2019": ["42G", "45A", "45B"],
        "2020": ["42G", "45A", "45B"],
        "2021": ["42G", "45A", "45B"],
        "2022": ["45A", "45B"],
        "2023": ["45A", "45B"],
        "2024": ["45A", "45B"],
        "2025": ["45A", "45B"],
        "2026": ["45A", "45B"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        48000,
        58000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        549000,
        899000
      ],
      engine: "Cummins L9 / X15 (by option)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan K3 (typical high-line)",
      transmission: "Allison 3000/4000",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2000,
      description: "American Coach American Dream — flagship diesel. Often Spartan + L9/X15; 605 HP is optional not universal.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Spartan K3 (typical high-line)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3 (typical high-line)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins L9 / ISX class",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 450 std / X15 605 opt",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        
      ]
    }
  },
  "Entegra Coach": {
    Cornerstone: {
      type: "Class A Diesel",
      floorplans: ["45A", "45B", "45W", "45Z", "45X"],
      floorplansByYear: {
        "2014": ["45B", "45W", "45Z"],
        "2015": ["45B", "45W", "45Z"],
        "2016": ["45B", "45W", "45Z"],
        "2017": ["45B", "45W", "45Z"],
        "2018": ["45B", "45W", "45Z"],
        "2019": ["45B", "45W", "45Z"],
        "2020": ["45B", "45W", "45Z"],
        "2021": ["45B", "45W", "45Z"],
        "2022": ["45B", "45W", "45Z"],
        "2023": ["45B", "45W", "45Z"],
        "2024": ["45A", "45B", "45W", "45Z"],
        "2025": ["45A", "45B", "45W", "45Z"],
        "2026": ["45A", "45B", "45W", "45Z"]
      },
      lengthRange: [
        45,
        45
      ],
      weightRange: [
        50000,
        58000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        699000,
        1150000
      ],
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      fuelCapacityGal: 150,
      generator: "Onan 10–12.5kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Entegra Cornerstone — flagship diesel on Spartan K3 + Cummins X15 605. Top of Entegra ladder (Jayco family).",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2018,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan K3"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3",
          transmission: "Allison 4000 MH"
        },
        
      ]
    },
    Anthem: {
      type: "Class A Diesel",
      floorplans: ["42DEQ", "44B", "44W", "44D"],
      floorplansByYear: {
        "2014": ["42DEQ", "44B", "44W"],
        "2015": ["42DEQ", "44B", "44W"],
        "2016": ["42DEQ", "44B", "44W"],
        "2017": ["42DEQ", "44B", "44W"],
        "2018": ["42DEQ", "44B", "44W"],
        "2019": ["42DEQ", "44B", "44W", "44D"],
        "2020": ["42DEQ", "44B", "44W", "44D"],
        "2021": ["42DEQ", "44B", "44W", "44D"],
        "2022": ["44B", "44W", "44D"],
        "2023": ["44B", "44W", "44D"],
        "2024": ["44B", "44W", "44D"],
        "2025": ["44B", "44W"],
        "2026": ["44B", "44W"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        42000,
        52000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        499000,
        849000
      ],
      engine: "Cummins L9 / X12 450–500HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan K3",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Entegra Anthem — high-line Spartan diesel under Cornerstone.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 / X12 450–500HP",
          horsepower: 450,
          chassis: "Spartan K3"
        },
        
      ]
    },
    Aspire: {
      type: "Class A Diesel",
      floorplans: ["38R", "42D", "44R"],
      floorplansByYear: {
        "2015": ["38R", "42D", "44R"],
        "2016": ["38R", "42D", "44R"],
        "2017": ["38R", "42D", "44R"],
        "2018": ["38R", "42D", "44R"],
        "2019": ["38R", "42D", "44R"],
        "2020": ["38R", "42D", "44R"],
        "2021": ["38R", "42D", "44R"],
        "2022": ["42D", "44R"],
        "2023": ["42D", "44R"],
        "2024": ["42D", "44R"],
        "2025": ["42D", "44R"],
        "2026": ["42D", "44R"]
      },
      lengthRange: [
        38,
        44
      ],
      weightRange: [
        38000,
        48000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        399000,
        649000
      ],
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan K3 / Freightliner (by year)",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Entegra Aspire — diesel Class A step below Anthem.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3 / Freightliner (by year)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Spartan / Freightliner"
        },
        
      ]
    },
    Reatta: {
      type: "Class A Diesel",
      floorplans: ["37K", "39BH", "39W"],
      floorplansByYear: {
        "2016": ["37K", "39BH"],
        "2017": ["37K", "39BH"],
        "2018": ["37K", "39BH", "39W"],
        "2019": ["37K", "39BH", "39W"],
        "2020": ["37K", "39BH", "39W"],
        "2021": ["37K", "39BH", "39W"],
        "2022": ["37K", "39BH"],
        "2023": ["37K", "39BH"],
        "2024": ["37K", "39BH"],
        "2025": ["37K", "39BH"],
        "2026": ["37K", "39BH"]
      },
      lengthRange: [
        37,
        39
      ],
      weightRange: [
        30000,
        38000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        289000,
        449000
      ],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Spartan K1",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 50,
      blackWater: 45,
      fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Entegra Reatta — mid-diesel on Spartan K1 with Cummins B6.7 360 hp / 800 lb-ft. NOT an ISL 8.9.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2026,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Spartan K1",
          transmission: "Allison 3000 MH",
          notes: "Inline-six B6.7 — not ISL 8.9"
        }
      ]
    },
    "Reatta XL": {
      type: "Class A Diesel",
      floorplans: ["37K", "39BH", "39W"],
      floorplansByYear: {
        "2018": ["37K", "39BH"],
        "2019": ["37K", "39BH"],
        "2020": ["37K", "39BH"],
        "2021": ["37K", "39BH", "39W"],
        "2022": ["37K", "39BH", "39W"],
        "2023": ["37K", "39BH", "39W"],
        "2024": ["37K", "39BH"],
        "2025": ["37K", "39BH"],
        "2026": ["37K", "39BH"]
      },
      lengthRange: [
        37,
        39
      ],
      weightRange: [
        30000,
        39000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        309000,
        479000
      ],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Spartan K1",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Entegra Reatta XL — higher-content Reatta on same B6.7 / Spartan K1 platform.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          chassis: "Spartan K1"
        }
      ]
    },
    Vision: {
      type: "Class A Gas",
      floorplans: ["27A", "29S", "31B", "36A"],
      floorplansByYear: {
        "2014": ["27A", "29S", "31B"],
        "2015": ["27A", "29S", "31B"],
        "2016": ["27A", "29S", "31B"],
        "2017": ["27A", "29S", "31B"],
        "2018": ["27A", "29S", "31B", "36A"],
        "2019": ["27A", "29S", "31B", "36A"],
        "2020": ["27A", "29S", "31B", "36A"],
        "2021": ["27A", "29S", "31B", "36A"],
        "2022": ["27A", "29S", "31B", "36A"],
        "2023": ["27A", "29S", "31B", "36A"],
        "2024": ["27A", "29S", "31B"],
        "2025": ["27A", "29S", "31B"],
        "2026": ["27A", "29S", "31B"]
      },
      lengthRange: [
        27,
        36
      ],
      weightRange: [
        15000,
        22000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        159000,
        269000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Entegra Vision — gas Class A on Ford F53. Used pricing must use gas comps, not diesel MSRP math. 27A is a real floorplan.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    "Vision XL": {
      type: "Class A Gas",
      floorplans: ["29S", "31B", "36A"],
      floorplansByYear: {
        "2019": ["29S", "31B", "36A"],
        "2020": ["29S", "31B", "36A"],
        "2021": ["29S", "31B", "36A"],
        "2022": ["29S", "31B", "36A"],
        "2023": ["29S", "31B", "36A"],
        "2024": ["29S", "31B", "36A"],
        "2025": ["29S", "31B"],
        "2026": ["29S", "31B"]
      },
      lengthRange: [
        29,
        36
      ],
      weightRange: [
        16000,
        23000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        169000,
        279000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Entegra Vision XL — upgraded Vision gas Class A packages.",
      powertrainByYear: [
        {
          from: 2019,
          to: 2019,
          engine: "Ford Triton V10 / 7.3L transition",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Accolade: {
      type: "Super C",
      floorplans: ["37L", "37M", "37K"],
      floorplansByYear: {
        "2015": ["37L", "37M"],
        "2016": ["37L", "37M"],
        "2017": ["37L", "37M"],
        "2018": ["37L", "37M"],
        "2019": ["37L", "37M", "37K"],
        "2020": ["37L", "37M", "37K"],
        "2021": ["37L", "37M", "37K"],
        "2022": ["37L", "37M"],
        "2023": ["37L", "37M"],
        "2024": ["37L", "37M"],
        "2025": ["37L", "37M"],
        "2026": ["37L", "37M"]
      },
      lengthRange: [
        37,
        38
      ],
      weightRange: [
        26000,
        34000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        259000,
        399000
      ],
      engine: "Cummins Super C diesel ~340HP",
      horsepower: 340,
      chassis: "Freightliner Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Entegra Accolade — Super C diesel.",
      powertrainByYear: [
                        {
          from: 2015,
          to: 2026,
          engine: "Cummins Super C diesel ~340HP",
          horsepower: 340,
          chassis: "Freightliner Super C"
        }
      ]
    },
    "Accolade XL": {
      type: "Super C",
      floorplans: ["37M", "37K"],
      floorplansByYear: {
        "2018": ["37M", "37K"],
        "2019": ["37M", "37K"],
        "2020": ["37M", "37K"],
        "2021": ["37M", "37K"],
        "2022": ["37M", "37K"],
        "2023": ["37M", "37K"],
        "2024": ["37M", "37K"],
        "2025": ["37M", "37K"],
        "2026": ["37M", "37K"]
      },
      lengthRange: [
        37,
        38
      ],
      weightRange: [
        27000,
        35000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        279000,
        429000
      ],
      engine: "Cummins Super C diesel",
      horsepower: 340,
      chassis: "Freightliner Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Entegra Accolade XL — upgraded Super C packages.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Cummins Super C diesel",
          horsepower: 340,
          chassis: "Freightliner Super C"
        }
      ]
    },
    Centurion: {
      type: "Super C", floorplans: ["39N","39K","45D"],
      floorplansByYear: { "2026": ["39N","39K","45D"], "2027": ["39N","39K","45D"] },
      lengthRange: [42, 46], weightRange: [38000, 52000], slideouts: 4, sleeps: 5, msrpRange: [620000, 820000],
      engine: "Detroit DD13 GEN 5 12.8L 525HP or DD16 15.6L 600HP (by floorplan)",
      horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia 116 Day Cab / Cascadia 126 (45D)",
      transmission: "12-speed overdrive automated manual", fuelType: "Diesel", recalls: 0, rating: 4.75, image: RV_CARD_IMAGE,
      towingCapacity: 20000, freshWater: 100, grayWater: 73, blackWater: 40, fuelCapacityGal: 120,
      generator: "Onan 8,000W diesel + auto-gen start", awningLength: 20, ceilingHeight: 84, founded: 2008, warrantyYears: 2, yearStart: 2026, gvwrLbs: 41000, overallLengthIn: 504,
      description: "Entegra Centurion — Cascadia Super C 2026–27. 39N/39K DD13 525/1850 hitch 20k; 45D DD16 600 hitch 30k.",
      powertrainByYear: [
        { from: 2026, to: 2027, floorplans: ["39N","39K"], engine: "Detroit DD13 GEN 5 12.8L 525HP", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia 116 Day Cab", transmission: "12-speed overdrive automated manual", towingCapacity: 20000, gvwrLbs: 41000 },
        { from: 2026, to: 2027, floorplans: ["45D"], engine: "Detroit DD16 15.6L 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126", transmission: "12-speed overdrive automated manual", towingCapacity: 30000 },
        { from: 2026, to: 2027, engine: "Detroit DD13 GEN 5 12.8L 525HP (39N/39K) or DD16 600HP (45D)", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia" },
      ],
    },
    Expanse: {
      type: "Class C",
      floorplans: ["21B", "21D"],
      floorplansByYear: {
        "2018": ["21B", "21D"],
        "2019": ["21B", "21D"],
        "2020": ["21B", "21D"],
        "2021": ["21B", "21D"],
        "2022": ["21B", "21D"],
        "2023": ["21B", "21D"],
        "2024": ["21B", "21D"],
        "2025": ["21B", "21D"],
        "2026": ["21B", "21D"]
      },
      lengthRange: [
        21,
        24
      ],
      weightRange: [
        9000,
        12000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        99000,
        169000
      ],
      engine: "Ford Transit gas",
      horsepower: 310,
      chassis: "Ford Transit",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Entegra Expanse — compact Class C / B+ style coach on Transit.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Ford Transit gas",
          horsepower: 310,
          chassis: "Ford Transit"
        }
      ]
    },
    Esteem: {
      type: "Class C",
      floorplans: ["26U", "29V", "31W"],
      floorplansByYear: {
        "2014": ["26U", "29V", "31W"],
        "2015": ["26U", "29V", "31W"],
        "2016": ["26U", "29V", "31W"],
        "2017": ["26U", "29V", "31W"],
        "2018": ["26U", "29V", "31W"],
        "2019": ["26U", "29V", "31W"],
        "2020": ["26U", "29V", "31W"],
        "2021": ["26U", "29V", "31W"],
        "2022": ["26U", "29V", "31W"],
        "2023": ["26U", "29V", "31W"],
        "2024": ["26U", "29V", "31W"],
        "2025": ["26U", "29V"],
        "2026": ["26U", "29V"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        99000,
        169000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Entegra Esteem — Ford cutaway Class C.",
      powertrainByYear: [
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Qwest: {
      type: "Class C",
      floorplans: ["24L", "24R"],
      floorplansByYear: {
        "2015": ["24L", "24R"],
        "2016": ["24L", "24R"],
        "2017": ["24L", "24R"],
        "2018": ["24L", "24R"],
        "2019": ["24L", "24R"],
        "2020": ["24L", "24R"],
        "2021": ["24L", "24R"],
        "2022": ["24L", "24R"],
        "2023": ["24L", "24R"],
        "2024": ["24L", "24R"],
        "2025": ["24L", "24R"],
        "2026": ["24L", "24R"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129000,
        199000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Entegra Qwest — Sprinter diesel Class C.",
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Mercedes-Benz Sprinter 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter diesel Class C era"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    }
  },
  "Monaco Coach": {
    Dynasty: {
      type: "Class A Diesel",
      floorplans: ["36P", "38P", "42P"],
      floorplansByYear: {
        "2005": ["36P", "38P", "42P"],
        "2006": ["36P", "38P", "42P"],
        "2007": ["36P", "38P", "42P"],
        "2008": ["36P", "38P", "42P"],
        "2009": ["36P", "38P", "42P"],
        "2010": ["36P", "38P", "42P"],
        "2011": ["36P", "38P", "42P"],
        "2012": ["36P", "38P", "42P"],
        "2013": ["36P", "38P", "42P"],
        "2014": ["36P", "38P", "42P"],
        "2015": ["36P", "38P", "42P"],
        "2016": ["36P", "38P", "42P"],
        "2017": ["36P", "38P", "42P"],
        "2018": ["36P", "38P", "42P"],
        "2019": ["36P", "38P", "42P"],
        "2020": ["36P", "38P", "42P"],
        "2021": ["36P", "38P", "42P"],
        "2022": ["38P", "42P"],
        "2023": ["38P", "42P"],
        "2024": ["38P", "42P"],
        "2025": ["38P", "42P"],
        "2026": ["38P", "42P"]
      },
      lengthRange: [
        36,
        42
      ],
      weightRange: [
        34000,
        46000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        299000,
        499000
      ],
      engine: "Cummins L9 / ISL / ISX (by year)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner / Spartan (by year)",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Monaco Dynasty — diesel Class A under REV Monaco Coach. Confirm chassis/engine on sticker; lineup thinner post-bankruptcy revival.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner / Spartan (by year)",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner / Spartan (by year)",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISL / L9 class",
          horsepower: 400,
          chassis: "Freightliner / Spartan"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 450HP class",
          horsepower: 450,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    Camelot: {
      type: "Class A Diesel",
      floorplans: ["36M", "40M"],
      floorplansByYear: {
        "2005": ["36M", "40M"],
        "2006": ["36M", "40M"],
        "2007": ["36M", "40M"],
        "2008": ["36M", "40M"],
        "2009": ["36M", "40M"],
        "2010": ["36M", "40M"],
        "2011": ["36M", "40M"],
        "2012": ["36M", "40M"],
        "2013": ["36M", "40M"],
        "2014": ["36M", "40M"],
        "2015": ["36M", "40M"],
        "2016": ["36M", "40M"],
        "2017": ["36M", "40M"],
        "2018": ["36M", "40M"],
        "2019": ["36M", "40M"],
        "2020": ["36M", "40M"],
        "2021": ["36M", "40M"],
        "2022": ["36M", "40M"],
        "2023": ["36M", "40M"],
        "2024": ["36M", "40M"],
        "2025": ["40M"],
        "2026": ["40M"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        30000,
        40000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        259000,
        399000
      ],
      engine: "Cummins B6.7 / L9 360–450HP",
      horsepower: 360,
      chassis: "Freightliner XC-Series",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Monaco Camelot — mid-diesel Class A (REV era).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC-Series",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins B6.7 / L9 class",
          horsepower: 360,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    Knight: {
      type: "Class A Diesel",
      floorplans: ["36P", "40P"],
      floorplansByYear: {
        "2008": ["36P", "40P"],
        "2009": ["36P", "40P"],
        "2010": ["36P", "40P"],
        "2011": ["36P", "40P"],
        "2012": ["36P", "40P"],
        "2013": ["36P", "40P"],
        "2014": ["36P", "40P"],
        "2015": ["36P", "40P"],
        "2016": ["36P", "40P"],
        "2017": ["36P", "40P"],
        "2018": ["36P", "40P"],
        "2019": ["36P", "40P"],
        "2020": ["36P", "40P"],
        "2021": ["36P", "40P"],
        "2022": ["36P", "40P"],
        "2023": ["36P", "40P"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        30000,
        40000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        249000,
        379000
      ],
      engine: "Cummins ISL / L9 class",
      horsepower: 380,
      chassis: "Freightliner XC",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2008,
      yearEnd: 2023,
      description: "Monaco Knight — diesel Class A (limited later years under REV).",
      powertrainByYear: [
        {
          from: 2008,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2023,
          engine: "Cummins ISL / L9 class",
          horsepower: 380,
          chassis: "Freightliner XC"
        },
        
      ]
    }
  },
  "Holiday Rambler": {
    Navigator: {
      type: "Class A Diesel",
      floorplans: ["38F", "38N", "38R", "38K"],
      floorplansByYear: {
        "2005": ["38F", "38N", "38R"],
        "2006": ["38F", "38N", "38R"],
        "2007": ["38F", "38N", "38R"],
        "2008": ["38F", "38N", "38R"],
        "2009": ["38F", "38N", "38R"],
        "2010": ["38F", "38N", "38R"],
        "2011": ["38F", "38N", "38R"],
        "2012": ["38F", "38N", "38R"],
        "2013": ["38F", "38N", "38R"],
        "2014": ["38F", "38N", "38R"],
        "2015": ["38F", "38N", "38R"],
        "2016": ["38F", "38N", "38R"],
        "2017": ["38F", "38N", "38R"],
        "2018": ["38F", "38N", "38R"],
        "2019": ["38F", "38N", "38R", "38K"],
        "2020": ["38F", "38N", "38R", "38K"],
        "2021": ["38F", "38N", "38R", "38K"],
        "2022": ["38N", "38R", "38K"],
        "2023": ["38N", "38R", "38K"],
        "2024": ["38N", "38R", "38K"],
        "2025": ["38N", "38K"],
        "2026": ["38N", "38K"]
      },
      lengthRange: [
        38,
        40
      ],
      weightRange: [
        32000,
        40000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        259000,
        399000
      ],
      engine: "Cummins B6.7 / L9 360–450HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner XC-Series",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Holiday Rambler Navigator — diesel Class A (REV). Mid-diesel XC platform, not ISX flagship.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XC-Series",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          chassis: "Freightliner XC"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins B6.7 / L9 360–450HP",
          horsepower: 360,
          chassis: "Freightliner XC-Series"
        },
        
      ]
    },
    Ambassador: {
      type: "Class A Diesel",
      floorplans: ["38F", "38R", "40B"],
      floorplansByYear: {
        "2005": ["38F", "38R", "40B"],
        "2006": ["38F", "38R", "40B"],
        "2007": ["38F", "38R", "40B"],
        "2008": ["38F", "38R", "40B"],
        "2009": ["38F", "38R", "40B"],
        "2010": ["38F", "38R", "40B"],
        "2011": ["38F", "38R", "40B"],
        "2012": ["38F", "38R", "40B"],
        "2013": ["38F", "38R", "40B"],
        "2014": ["38F", "38R", "40B"],
        "2015": ["38F", "38R", "40B"],
        "2016": ["38F", "38R", "40B"],
        "2017": ["38F", "38R", "40B"],
        "2018": ["38F", "38R", "40B"],
        "2019": ["38F", "38R", "40B"],
        "2020": ["38F", "38R", "40B"],
        "2021": ["38F", "38R", "40B"],
        "2022": ["38R", "40B"],
        "2023": ["38R", "40B"],
        "2024": ["38R", "40B"],
        "2025": ["40B"],
        "2026": ["40B"]
      },
      lengthRange: [
        38,
        40
      ],
      weightRange: [
        34000,
        42000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        279000,
        429000
      ],
      engine: "Cummins B6.7 / L9 / ISL (by year)",
      horsepower: 380,
      torqueLbFt: 1000,
      chassis: "Freightliner XCS / XC",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Holiday Rambler Ambassador — diesel Class A. Often ISL/L9 class on Freightliner — verify year build sheet.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISL / ISB diesel (era)",
          horsepower: 350,
          chassis: "Freightliner XCS / XC",
          notes: "2005–2009 diesel Class A — confirm build sheet (ISL/ISB/Cat by OEM)"
        },
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XCS / XC",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Cummins ISL 380HP class",
          horsepower: 380,
          chassis: "Freightliner XCS"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Cummins L9 / B6.7 class",
          horsepower: 380,
          chassis: "Freightliner XC"
        },
        
      ]
    },
    Armada: {
      type: "Class A Diesel",
      floorplans: ["36F", "38F", "40P"],
      floorplansByYear: {
        "2020": ["36F", "38F", "40P"],
        "2021": ["36F", "38F", "40P"],
        "2022": ["36F", "38F", "40P"],
        "2023": ["36F", "38F", "40P"],
        "2024": ["36F", "38F", "40P"],
        "2025": ["38F", "40P"],
        "2026": ["38F", "40P"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        30000,
        40000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        269000,
        419000
      ],
      engine: "Cummins B6.7 / L9 360–450HP",
      horsepower: 360,
      chassis: "Freightliner XC-Series",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2019,
      description: "Holiday Rambler Armada — newer diesel Class A under REV Holiday Rambler.",
      powertrainByYear: [
        {
          from: 2019,
          to: 2026,
          engine: "Cummins B6.7 / L9 360–450HP",
          horsepower: 360,
          chassis: "Freightliner XC"
        }
      ]
    },
    Vacationer: {
      type: "Class A Gas",
      floorplans: ["33C", "35K", "36F"],
      floorplansByYear: {
        "2005": ["33C", "35K", "36F"],
        "2006": ["33C", "35K", "36F"],
        "2007": ["33C", "35K", "36F"],
        "2008": ["33C", "35K", "36F"],
        "2009": ["33C", "35K", "36F"],
        "2010": ["33C", "35K", "36F"],
        "2011": ["33C", "35K", "36F"],
        "2012": ["33C", "35K", "36F"],
        "2013": ["33C", "35K", "36F"],
        "2014": ["33C", "35K", "36F"],
        "2015": ["33C", "35K", "36F"],
        "2016": ["33C", "35K", "36F"],
        "2017": ["33C", "35K", "36F"],
        "2018": ["33C", "35K", "36F"],
        "2019": ["33C", "35K", "36F"],
        "2020": ["33C", "35K", "36F"],
        "2021": ["33C", "35K", "36F"],
        "2022": ["33C", "35K", "36F"],
        "2023": ["33C", "35K", "36F"],
        "2024": ["33C", "35K", "36F"],
        "2025": ["33C", "35K"],
        "2026": ["33C", "35K"]
      },
      lengthRange: [
        33,
        36
      ],
      weightRange: [
        16000,
        22000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        139000,
        229000
      ],
      engine: "Ford 7.3L Godzilla / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2000,
      description: "Holiday Rambler Vacationer — gas Class A on Ford F53.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Invicta: {
      type: "Class A Gas",
      floorplans: ["32A", "34P", "36A"],
      floorplansByYear: {
        "2010": ["32A", "34P", "36A"],
        "2011": ["32A", "34P", "36A"],
        "2012": ["32A", "34P", "36A"],
        "2013": ["32A", "34P", "36A"],
        "2014": ["32A", "34P", "36A"],
        "2015": ["32A", "34P", "36A"],
        "2016": ["32A", "34P", "36A"],
        "2017": ["32A", "34P", "36A"],
        "2018": ["32A", "34P", "36A"],
        "2019": ["32A", "34P", "36A"],
        "2020": ["32A", "34P", "36A"],
        "2021": ["32A", "34P", "36A"],
        "2022": ["32A", "34P"],
        "2023": ["32A", "34P"],
        "2024": ["32A", "34P"],
        "2025": ["32A", "34P"],
        "2026": ["32A", "34P"]
      },
      lengthRange: [
        32,
        36
      ],
      weightRange: [
        15000,
        22000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        129000,
        209000
      ],
      engine: "Ford 7.3L / V10 (by year)",
      horsepower: 350,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Holiday Rambler Invicta — gas Class A on F53.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era (7.3L arrives ~2020)"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53"
        }
      ]
    },
    Augusta: {
      type: "Class C",
      floorplans: ["25M", "29M", "31M"],
      floorplansByYear: {
        "2010": ["25M", "29M", "31M"],
        "2011": ["25M", "29M", "31M"],
        "2012": ["25M", "29M", "31M"],
        "2013": ["25M", "29M", "31M"],
        "2014": ["25M", "29M", "31M"],
        "2015": ["25M", "29M", "31M"],
        "2016": ["25M", "29M", "31M"],
        "2017": ["25M", "29M", "31M"],
        "2018": ["25M", "29M", "31M"],
        "2019": ["25M", "29M", "31M"],
        "2020": ["25M", "29M", "31M"],
        "2021": ["25M", "29M", "31M"],
        "2022": ["25M", "29M", "31M"],
        "2023": ["25M", "29M", "31M"],
        "2024": ["25M", "29M", "31M"],
        "2025": ["25M", "29M", "31M"],
        "2026": ["25M", "29M", "31M"]
      },
      lengthRange: [
        25,
        32
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        89000,
        149000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Holiday Rambler Augusta — Ford Class C.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2/7.3 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Xpedition: {
      type: "Class B",
      floorplans: ["19CB", "24CB"],
      floorplansByYear: {
        "2024": ["19CB", "24CB"],
        "2025": ["19CB", "24CB"],
        "2026": ["19CB", "24CB"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        8500,
        11000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149000,
        209000
      ],
      engine: "Mercedes-Benz / RAM (by package)",
      horsepower: 208,
      chassis: "Sprinter or ProMaster",
      fuelType: "Diesel / Gas",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan Diesel / Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1953,
      warrantyYears: 1,
      yearStart: 2024,
      description: "Holiday Rambler Xpedition — Class B companion to Fleetwood Xcursion (REV).",
      powertrainByYear: [
        {
          from: 2024,
          to: 2026,
          engine: "Sprinter turbodiesel or ProMaster gas",
          horsepower: 208,
          chassis: "Van chassis"
        }
      ]
    }
  },
  Heartland: {
    Bighorn: {
      type: "Fifth Wheel",
      floorplans: ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
      floorplansByYear: {
        "2010": ["3375SS", "3900FL", "3985QB"],
        "2011": ["3375SS", "3900FL", "3985QB"],
        "2012": ["3375SS", "3700FL", "3900FL", "3985QB"],
        "2013": ["3375SS", "3700FL", "3900FL", "3985QB", "4001QB"],
        "2014": ["3375SS", "3575SS", "3700FL", "3900FL", "3985QB", "4001QB"],
        "2015": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3985QB", "4001QB"],
        "2016": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3985QB", "4001QB"],
        "2017": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2018": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2019": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2020": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2021": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2022": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB", "4001QB"],
        "2023": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB"],
        "2024": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB", "3985QB"],
        "2025": ["3270RS", "3375SS", "3575SS", "3700FL", "3900FL", "3950MB"],
        "2026": ["3270RS", "3375SS", "3700FL", "3900FL", "3950MB"]
      },
      lengthRange: [
        32,
        42
      ],
      weightRange: [
        12000,
        19000
      ],
      slideouts: 4,
      sleeps: 8,
      msrpRange: [
        79900,
        145000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 64,
      grayWater: 80,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2003,
      description: "Heartland Bighorn — flagship luxury fifth wheel. Heavy pin weights common; match truck carefully. Live Grok fills plan UVW."
    },
    Sundance: {
      type: "Fifth Wheel",
      floorplans: ["2600RE", "2800QB", "2910RL", "3100RL", "3260BH", "3200MK"],
      floorplansByYear: {
        "2010": ["2600RE", "2800QB", "3100RL"],
        "2011": ["2600RE", "2800QB", "3100RL"],
        "2012": ["2600RE", "2800QB", "2910RL", "3100RL"],
        "2013": ["2600RE", "2800QB", "2910RL", "3100RL"],
        "2014": ["2600RE", "2800QB", "2910RL", "3100RL", "3260BH"],
        "2015": ["2600RE", "2800QB", "2910RL", "3100RL", "3260BH"],
        "2016": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2017": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2018": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2019": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2020": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2021": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2022": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2023": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2024": ["2600RE", "2800QB", "2910RL", "3100RL", "3200MK", "3260BH"],
        "2025": ["2600RE", "2800QB", "2910RL", "3100RL", "3260BH"],
        "2026": ["2600RE", "2800QB", "2910RL", "3100RL"]
      },
      lengthRange: [
        28,
        36
      ],
      weightRange: [
        8000,
        13000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        44900,
        89000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 36,
      awningLength: 15,
      ceilingHeight: 82,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2003,
      description: "Heartland Sundance — mid-range fifth wheel (lighter than Bighorn). Popular family bunkhouses."
    },
    Landmark: {
      type: "Fifth Wheel",
      floorplans: ["365", "375", "392", "415", "LM365", "LM392"],
      floorplansByYear: {
        "2010": ["365", "375", "392"],
        "2011": ["365", "375", "392"],
        "2012": ["365", "375", "392", "415"],
        "2013": ["365", "375", "392", "415"],
        "2014": ["365", "375", "392", "415"],
        "2015": ["365", "375", "392", "415"],
        "2016": ["365", "375", "392", "415", "LM365"],
        "2017": ["365", "375", "392", "415", "LM365", "LM392"],
        "2018": ["365", "375", "392", "415", "LM365", "LM392"],
        "2019": ["365", "375", "392", "415", "LM365", "LM392"],
        "2020": ["365", "375", "392", "415", "LM365", "LM392"],
        "2021": ["365", "375", "392", "415", "LM365", "LM392"],
        "2022": ["365", "375", "392", "415", "LM365", "LM392"],
        "2023": ["365", "375", "392", "415"],
        "2024": ["365", "375", "392", "415"],
        "2025": ["365", "375", "392"],
        "2026": ["365", "375", "392"]
      },
      lengthRange: [
        36,
        43
      ],
      weightRange: [
        14000,
        19000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        89900,
        155000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 70,
      grayWater: 80,
      blackWater: 45,
      awningLength: 17,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Heartland Landmark — ultra-luxury fifth wheel above Bighorn for full-timers."
    },
    "Big Country": {
      type: "Fifth Wheel",
      floorplans: ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
      floorplansByYear: {
        "2010": ["3150RL", "3560SS", "3902FL"],
        "2011": ["3150RL", "3560SS", "3902FL"],
        "2012": ["3150RL", "3500RL", "3560SS", "3902FL"],
        "2013": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2014": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2015": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2016": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2017": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2018": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2019": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2020": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2021": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2022": ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL"],
        "2023": ["3150RL", "3500RL", "3560SS", "3902FL"],
        "2024": ["3150RL", "3500RL", "3560SS", "3902FL"],
        "2025": ["3150RL", "3500RL", "3560SS"],
        "2026": ["3150RL", "3500RL", "3560SS"]
      },
      lengthRange: [
        31,
        40
      ],
      weightRange: [
        10000,
        16000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        54900,
        109000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 70,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Heartland Big Country — residential fifth wheel value between Sundance and Bighorn."
    },
    Cyclone: {
      type: "Toy Hauler",
      floorplans: ["3012", "3612", "4005King", "4006", "4113", "4270King"],
      floorplansByYear: {
        "2010": ["3012", "3612", "4006"],
        "2011": ["3012", "3612", "4006"],
        "2012": ["3012", "3612", "4005King", "4006"],
        "2013": ["3012", "3612", "4005King", "4006", "4270King"],
        "2014": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2015": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2016": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2017": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2018": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2019": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2020": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2021": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2022": ["3012", "3612", "4005King", "4006", "4113", "4270King"],
        "2023": ["3012", "3612", "4005King", "4006", "4270King"],
        "2024": ["3012", "3612", "4005King", "4006", "4270King"],
        "2025": ["3012", "3612", "4005King", "4006"],
        "2026": ["3012", "3612", "4005King", "4006"]
      },
      lengthRange: [
        34,
        44
      ],
      weightRange: [
        12000,
        18000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        74900,
        139000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2007,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 12,
      garageWidthFt: 8.2,
      garageHeightIn: 84,
      garageCapacityLbs: 3500,
      rampWidthFt: 8,
      fuelStationGal: 30,
      garageFits: "1–2 UTVs by plan",
      description: "Heartland Cyclone — full-size fifth-wheel toy hauler. King garage plans popular; verify garage length."
    },
    Torque: {
      type: "Toy Hauler",
      floorplans: ["325", "350", "371", "413"],
      floorplansByYear: {
        "2011": ["325", "350"],
        "2012": ["325", "350", "371"],
        "2013": ["325", "350", "371"],
        "2014": ["325", "350", "371", "413"],
        "2015": ["325", "350", "371", "413"],
        "2016": ["325", "350", "371", "413"],
        "2017": ["325", "350", "371", "413"],
        "2018": ["325", "350", "371", "413"],
        "2019": ["325", "350", "371", "413"],
        "2020": ["325", "350", "371", "413"],
        "2021": ["325", "350", "371", "413"],
        "2022": ["325", "350", "371", "413"],
        "2023": ["325", "350", "371"],
        "2024": ["325", "350", "371"],
        "2025": ["325", "350", "371"],
        "2026": ["325", "350"]
      },
      lengthRange: [
        32,
        42
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        64900,
        119000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 90,
      grayWater: 45,
      blackWater: 45,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2011,
      generator: "Generator prep / optional",
      garageLengthFt: 11,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3000,
      rampWidthFt: 8,
      garageFits: "1 full-size UTV or dual quads",
      description: "Heartland Torque — mid toy hauler fifth wheel with ramp patio packages."
    },
    "Road Warrior": {
      type: "Toy Hauler",
      floorplans: ["396", "427", "427DB", "431"],
      floorplansByYear: {
        "2012": ["396", "427"],
        "2013": ["396", "427", "431"],
        "2014": ["396", "427", "427DB", "431"],
        "2015": ["396", "427", "427DB", "431"],
        "2016": ["396", "427", "427DB", "431"],
        "2017": ["396", "427", "427DB", "431"],
        "2018": ["396", "427", "427DB", "431"],
        "2019": ["396", "427", "427DB", "431"],
        "2020": ["396", "427", "427DB", "431"],
        "2021": ["396", "427", "427DB", "431"],
        "2022": ["396", "427", "427DB", "431"],
        "2023": ["396", "427", "427DB", "431"],
        "2024": ["396", "427", "427DB", "431"],
        "2025": ["396", "427", "431"],
        "2026": ["396", "427", "431"]
      },
      lengthRange: [
        38,
        44
      ],
      weightRange: [
        14000,
        19000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        84900,
        149000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2012,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 13,
      garageWidthFt: 8.3,
      garageHeightIn: 86,
      garageCapacityLbs: 4000,
      rampWidthFt: 8,
      fuelStationGal: 40,
      garageFits: "2 full-size UTVs (plan-dependent)",
      description: "Heartland Road Warrior — large garage toy hauler with outdoor kitchens and fuel stations."
    },
    Prowler: {
      type: "Travel Trailer",
      floorplans: ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
      floorplansByYear: {
        "2010": ["185LX", "250BH", "280TD"],
        "2011": ["185LX", "250BH", "280TD"],
        "2012": ["185LX", "212RBS", "250BH", "280TD"],
        "2013": ["185LX", "212RBS", "250BH", "280TD", "290BH"],
        "2014": ["185LX", "212RBS", "250BH", "280TD", "290BH"],
        "2015": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2016": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2017": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2018": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2019": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2020": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2021": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2022": ["185LX", "212RBS", "250BH", "280TD", "290BH", "320BH"],
        "2023": ["185LX", "212RBS", "250BH", "280TD", "290BH"],
        "2024": ["185LX", "212RBS", "250BH", "280TD", "290BH"],
        "2025": ["185LX", "212RBS", "250BH", "280TD"],
        "2026": ["185LX", "212RBS", "250BH", "280TD"]
      },
      lengthRange: [
        18,
        34
      ],
      weightRange: [
        3500,
        8000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        18900,
        42000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2003,
      description: "Heartland Prowler — value travel trailer / Lynx-style light plans for first-time buyers."
    },
    Gravity: {
      type: "Fifth Wheel",
      floorplans: ["3120", "3210", "3500", "3550"],
      floorplansByYear: {
        "2016": ["3120", "3210"],
        "2017": ["3120", "3210", "3500"],
        "2018": ["3120", "3210", "3500", "3550"],
        "2019": ["3120", "3210", "3500", "3550"],
        "2020": ["3120", "3210", "3500", "3550"],
        "2021": ["3120", "3210", "3500", "3550"],
        "2022": ["3120", "3210", "3500", "3550"],
        "2023": ["3120", "3210", "3500"],
        "2024": ["3120", "3210", "3500"],
        "2025": ["3120", "3210"],
        "2026": ["3120", "3210"]
      },
      lengthRange: [
        31,
        36
      ],
      weightRange: [
        9000,
        13000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        49900,
        89000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 36,
      awningLength: 15,
      ceilingHeight: 82,
      founded: 2003,
      warrantyYears: 1,
      yearStart: 2016,
      description: "Heartland Gravity — lighter half-ton-friendly fifth wheel packaging under the Heartland umbrella."
    }
  },
  Lance: {
    "Lance 2465": {
      type: "Travel Trailer",
      floorplans: ["2465"],
      floorplansByYear: {
        "2010": ["2465"],
        "2011": ["2465"],
        "2012": ["2465"],
        "2013": ["2465"],
        "2014": ["2465"],
        "2015": ["2465"],
        "2016": ["2465"],
        "2017": ["2465"],
        "2018": ["2465"],
        "2019": ["2465"],
        "2020": ["2465"],
        "2021": ["2465"],
        "2022": ["2465"],
        "2023": ["2465"],
        "2024": ["2465"],
        "2025": ["2465"],
        "2026": ["2465"]
      },
      lengthRange: [
        27,
        27
      ],
      weightRange: [
        5800,
        6200
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        54900,
        69000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 55,
      grayWater: 40,
      blackWater: 40,
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Lance's flagship travel trailer is legendary for its lightweight aluminum Azdel Onboard construction, massive holding tanks, and best-in-class water capacity that rivals many Class As."
    },
    "Lance 2375": {
      type: "Travel Trailer",
      floorplans: ["2375"],
      floorplansByYear: {
        "2008": ["2375"],
        "2009": ["2375"],
        "2010": ["2375"],
        "2011": ["2375"],
        "2012": ["2375"],
        "2013": ["2375"],
        "2014": ["2375"],
        "2015": ["2375"],
        "2016": ["2375"],
        "2017": ["2375"],
        "2018": ["2375"],
        "2019": ["2375"],
        "2020": ["2375"],
        "2021": ["2375"],
        "2022": ["2375"],
        "2023": ["2375"],
        "2024": ["2375"],
        "2025": ["2375"],
        "2026": ["2375"]
      },
      lengthRange: [
        26,
        26
      ],
      weightRange: [
        5200,
        5600
      ],
      slideouts: 1,
      sleeps: 5,
      msrpRange: [
        49900,
        64000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 55,
      grayWater: 40,
      blackWater: 40,
      awningLength: 13,
      ceilingHeight: 78,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2008,
      description: "The Lance 2375 brings the brand's signature large holding tanks and aluminum construction to a slightly shorter floorplan — still towable by most half-ton trucks."
    },
    "Lance 1172": {
      type: "Truck Camper",
      floorplans: ["1172"],
      floorplansByYear: {
        "2005": ["1172"],
        "2006": ["1172"],
        "2007": ["1172"],
        "2008": ["1172"],
        "2009": ["1172"],
        "2010": ["1172"],
        "2011": ["1172"],
        "2012": ["1172"],
        "2013": ["1172"],
        "2014": ["1172"],
        "2015": ["1172"],
        "2016": ["1172"],
        "2017": ["1172"],
        "2018": ["1172"],
        "2019": ["1172"],
        "2020": ["1172"],
        "2021": ["1172"],
        "2022": ["1172"],
        "2023": ["1172"],
        "2024": ["1172"],
        "2025": ["1172"],
        "2026": ["1172"]
      },
      lengthRange: [
        11,
        11
      ],
      weightRange: [
        3300,
        3500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        29900,
        37000
      ],
      chassis: "N/A",
      fuelType: "N/A (truck camper)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 38,
      grayWater: 30,
      blackWater: 30,
      awningLength: 8,
      ceilingHeight: 76,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2005,
      description: "The Lance 1172 is the brand's flagship truck camper — designed for long-bed trucks with a full slide-out, pass-through basement storage, and Lance's massive holding tanks."
    }
  },
  "Pleasure-Way": {
    Plateau: {
      type: "Class B",
      floorplans: ["FL", "RB", "TS", "TS Bench", "TS Twin", "TW", "XLFL", "XLRB"],
      floorplansByYear: {
        "2012": ["TS", "TS Bench", "TS Twin"],
        "2013": ["TS", "TS Bench", "TS Twin"],
        "2014": ["FL", "TS", "TS Bench", "TS Twin"],
        "2015": ["FL", "TS", "TS Bench", "TS Twin"],
        "2016": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2017": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2018": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2019": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2020": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2021": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2022": ["FL", "RB", "TS", "TS Bench", "TS Twin"],
        "2023": ["FL", "RB", "TS", "TS Twin", "TW"],
        "2024": ["FL", "RB", "TS", "TS Twin", "TW", "XLFL", "XLRB"],
        "2025": ["FL", "RB", "TS", "TS Twin", "TW", "XLFL", "XLRB"],
        "2026": ["FL", "RB", "TS", "TS Twin", "TW", "XLFL", "XLRB"]
      },
      lengthRange: [
        22,
        25
      ],
      weightRange: [
        9500,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        160000,
        260000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 22,
      generator: "Solar packages standard on many years",
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2005,
      mpgHighwayEst: 16,
      description: "Pleasure-Way Plateau — flagship Sprinter Class B (TS / FL / RB / TW / XL). Hand-built Canadian quality. Live Grok fills exact UVW.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2018,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel ~188HP",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Mercedes-Benz turbodiesel (I4/V6 by year)",
          horsepower: 188,
          chassis: "Mercedes Sprinter",
          notes: "Confirm engine code on door sticker"
        },
        {
          from: 2005,
          to: 2005,
          engine: "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
          horsepower: 154,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Early Sprinter era — ~154–188 HP by year"
        }
      ]
    },
    "Plateau TS": {
      type: "Class B",
      floorplans: ["TS", "TS Bench", "TS Twin"],
      floorplansByYear: {
        "2012": ["TS", "TS Bench", "TS Twin"],
        "2013": ["TS", "TS Bench", "TS Twin"],
        "2014": ["TS", "TS Bench", "TS Twin"],
        "2015": ["TS", "TS Bench", "TS Twin"],
        "2016": ["TS", "TS Bench", "TS Twin"],
        "2017": ["TS", "TS Bench", "TS Twin"],
        "2018": ["TS", "TS Bench", "TS Twin"],
        "2019": ["TS", "TS Bench", "TS Twin"],
        "2020": ["TS", "TS Bench", "TS Twin"],
        "2021": ["TS", "TS Bench", "TS Twin"],
        "2022": ["TS", "TS Bench", "TS Twin"],
        "2023": ["TS", "TS Twin"],
        "2024": ["TS", "TS Twin"],
        "2025": ["TS", "TS Twin"],
        "2026": ["TS", "TS Twin"]
      },
      lengthRange: [
        22,
        24
      ],
      weightRange: [
        10000,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        155000,
        230000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 22,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2005,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        },
        {
          from: 2005,
          to: 2005,
          engine: "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
          horsepower: 154,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Early Sprinter era — ~154–188 HP by year"
        }
      ],
      description: "Pleasure-Way Plateau TS — twin/sofa living signature layout under the Plateau family."
    },
    Ascent: {
      type: "Class B",
      floorplans: ["FL", "TS", "TW"],
      floorplansByYear: {
        "2018": ["TS"],
        "2019": ["TS", "FL"],
        "2020": ["TS", "FL"],
        "2021": ["TS", "FL"],
        "2022": ["TS", "FL"],
        "2023": ["TS", "FL", "TW"],
        "2024": ["TS", "FL", "TW"],
        "2025": ["TS", "FL", "TW"],
        "2026": ["TS", "FL", "TW"]
      },
      lengthRange: [
        19,
        23
      ],
      weightRange: [
        8500,
        11000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        150000,
        230000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      horsepower: 211,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes Sprinter" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter" },
      ],
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 26,
      grayWater: 20,
      blackWater: 18,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2018,
      description: "Pleasure-Way Ascent — compact Sprinter Class B (shorter / more agile than Plateau)."
    },
    Lexor: {
      type: "Class B",
      floorplans: ["TS", "FL", "RB"],
      floorplansByYear: {
        "2014": ["TS"],
        "2015": ["TS", "FL"],
        "2016": ["TS", "FL"],
        "2017": ["TS", "FL", "RB"],
        "2018": ["TS", "FL", "RB"],
        "2019": ["TS", "FL", "RB"],
        "2020": ["TS", "FL", "RB"],
        "2021": ["TS", "FL", "RB"],
        "2022": ["TS", "FL", "RB"],
        "2023": ["TS", "FL"],
        "2024": ["TS", "FL"],
        "2025": ["TS", "FL"],
        "2026": ["TS", "FL"]
      },
      lengthRange: [
        20,
        22
      ],
      weightRange: [
        8000,
        10500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        130000,
        210000
      ],
      engine: "Ram 3.6L V6 gas",
      horsepower: 280,
      chassis: "Ram ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 24,
      grayWater: 18,
      blackWater: 15,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2014,
      mpgHighwayEst: 15,
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ram / Dodge 3.6L V6 gas (or earlier 3.6/3.0 by year)",
          horsepower: 280,
          chassis: "Ram ProMaster / earlier van chassis",
          notes: "2006–2015 era powertrain for Pleasure-Way Lexor"
        }
      ],
      description: "Pleasure-Way Lexor — ProMaster Class B (gas) with Pleasure-Way craftsmanship at a lower price than Sprinter Plateau."
    },
    Ontour: {
      type: "Class B",
      floorplans: ["2.0", "2.2", "2.2 AWD", "2.2 RB"],
      floorplansByYear: {
        "2016": ["2.0"],
        "2017": ["2.0"],
        "2018": ["2.0", "2.2"],
        "2019": ["2.0", "2.2"],
        "2020": ["2.0", "2.2"],
        "2021": ["2.0", "2.2", "2.2 AWD"],
        "2022": ["2.0", "2.2", "2.2 AWD"],
        "2023": ["2.0", "2.2", "2.2 AWD", "2.2 RB"],
        "2024": ["2.0", "2.2", "2.2 AWD", "2.2 RB"],
        "2025": ["2.0", "2.2", "2.2 AWD", "2.2 RB"],
        "2026": ["2.0", "2.2", "2.2 AWD", "2.2 RB"]
      },
      lengthRange: [
        19,
        22
      ],
      weightRange: [
        7500,
        10000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        120000,
        220000
      ],
      engine: "Ford Transit EcoBoost / diesel (by year)",
      horsepower: 310,
      powertrainByYear: [
        { from: 2016, to: 2026, engine: "Ford Transit EcoBoost / diesel (by year)", horsepower: 310, chassis: "Ford Transit" },
      ],
      chassis: "Ford Transit",
      fuelType: "Gas / Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 20,
      grayWater: 14,
      blackWater: 0,
      generator: "Solar packages",
      awningLength: 7,
      ceilingHeight: 72,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2016,
      description: "Pleasure-Way Ontour — Ford Transit Class B (2.0 / 2.2 / AWD). Nimble couple van."
    },
    "Ontour 2.0": {
      type: "Class B",
      floorplans: ["2.0"],
      floorplansByYear: {
        "2016": ["2.0"],
        "2017": ["2.0"],
        "2018": ["2.0"],
        "2019": ["2.0"],
        "2020": ["2.0"],
        "2021": ["2.0"],
        "2022": ["2.0"],
        "2023": ["2.0"],
        "2024": ["2.0"],
        "2025": ["2.0"],
        "2026": ["2.0"]
      },
      lengthRange: [
        19,
        20
      ],
      weightRange: [
        7800,
        9000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        115000,
        195000
      ],
      engine: "Ford Transit 3.5L EcoBoost",
      horsepower: 310,
      powertrainByYear: [
        { from: 2016, to: 2026, engine: "Ford Transit 3.5L EcoBoost", horsepower: 310, chassis: "Ford Transit" },
      ],
      chassis: "Ford Transit",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 20,
      grayWater: 14,
      blackWater: 0,
      generator: "Solar",
      awningLength: 7,
      ceilingHeight: 72,
      founded: 1986,
      warrantyYears: 3,
      yearStart: 2016,
      description: "Pleasure-Way Ontour 2.0 — compact Transit Class B entry under the Ontour family."
    }
  },
  Roadtrek: {
    Zion: {
      type: "Class B",
      floorplans: ["Zion", "Slumber", "Sleeper", "SL"],
      floorplansByYear: {
        "2015": ["Zion", "Slumber"],
        "2016": ["Zion", "Slumber"],
        "2017": ["Zion", "Slumber", "Sleeper"],
        "2018": ["Zion", "Slumber", "Sleeper"],
        "2019": ["Zion", "Slumber", "Sleeper"],
        "2020": ["Zion", "Slumber", "Sleeper"],
        "2021": ["Zion", "Slumber", "Sleeper", "SL"],
        "2022": ["Zion", "Slumber", "Sleeper", "SL"],
        "2023": ["Zion", "Slumber", "Sleeper", "SL"],
        "2024": ["Zion", "Slumber", "Sleeper", "SL"],
        "2025": ["Zion", "Slumber", "SL"],
        "2026": ["Zion", "Slumber", "SL"]
      },
      lengthRange: [
        19,
        21
      ],
      weightRange: [
        7000,
        9000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        90000,
        145000
      ],
      engine: "Ram 3.6L V6 gas",
      horsepower: 280,
      chassis: "Ram ProMaster 3500",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 18,
      grayWater: 14,
      blackWater: 0,
      generator: "Solar packages common",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2015,
      mpgHighwayEst: 16,
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Ram / Dodge 3.6L V6 gas (or earlier 3.6/3.0 by year)",
          horsepower: 280,
          chassis: "Ram ProMaster / earlier van chassis",
          notes: "2006–2015 era powertrain for Roadtrek Zion"
        }
      ],
      description: "Roadtrek Zion — ProMaster Class B volume line. Slumber / Sleeper / SL packages. Compact couple van."
    },
    "Zion Slumber": {
      type: "Class B",
      floorplans: ["Slumber"],
      floorplansByYear: {
        "2015": ["Slumber"],
        "2016": ["Slumber"],
        "2017": ["Slumber"],
        "2018": ["Slumber"],
        "2019": ["Slumber"],
        "2020": ["Slumber"],
        "2021": ["Slumber"],
        "2022": ["Slumber"],
        "2023": ["Slumber"],
        "2024": ["Slumber"],
        "2025": ["Slumber"],
        "2026": ["Slumber"]
      },
      lengthRange: [
        19,
        20
      ],
      weightRange: [
        7200,
        8500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        85000,
        125000
      ],
      engine: "Ram 3.6L V6 gas",
      horsepower: 280,
      chassis: "Ram ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 16,
      grayWater: 12,
      blackWater: 0,
      generator: "Solar",
      awningLength: 6,
      ceilingHeight: 71,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2015,
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Ram / Dodge 3.6L V6 gas (or earlier 3.6/3.0 by year)",
          horsepower: 280,
          chassis: "Ram ProMaster / earlier van chassis",
          notes: "2006–2015 era powertrain for Roadtrek Zion Slumber"
        }
      ],
      description: "Roadtrek Zion Slumber — dedicated sleep-forward Zion package for couples."
    },
    Play: {
      type: "Class B",
      floorplans: ["Play", "Play+"],
      floorplansByYear: {
        "2018": ["Play"],
        "2019": ["Play"],
        "2020": ["Play"],
        "2021": ["Play", "Play+"],
        "2022": ["Play", "Play+"],
        "2023": ["Play", "Play+"],
        "2024": ["Play", "Play+"],
        "2025": ["Play", "Play+"],
        "2026": ["Play", "Play+"]
      },
      lengthRange: [
        19,
        21
      ],
      weightRange: [
        7500,
        9500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        95000,
        155000
      ],
      engine: "Ram 3.6L V6 gas",
      horsepower: 280,
      powertrainByYear: [
        { from: 2018, to: 2026, engine: "Ram 3.6L V6 gas", horsepower: 280, chassis: "Ram ProMaster" },
      ],
      chassis: "Ram ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 20,
      grayWater: 15,
      blackWater: 12,
      generator: "Solar + lithium packages",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Roadtrek Play / Play+ — lifestyle Class B on ProMaster with upgraded packages on Play+."
    },
    "SS Agile": {
      type: "Class B",
      floorplans: ["SS Agile", "Agile"],
      floorplansByYear: {
        "2020": ["SS Agile", "Agile"],
        "2021": ["SS Agile", "Agile"],
        "2022": ["SS Agile", "Agile"],
        "2023": ["SS Agile", "Agile"],
        "2024": ["SS Agile", "Agile"],
        "2025": ["SS Agile", "Agile"],
        "2026": ["SS Agile", "Agile"]
      },
      lengthRange: [
        19,
        21
      ],
      weightRange: [
        7500,
        9500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        100000,
        160000
      ],
      engine: "Ram 3.6L V6 gas",
      horsepower: 280,
      powertrainByYear: [
        { from: 2020, to: 2026, engine: "Ram 3.6L V6 gas", horsepower: 280, chassis: "Ram ProMaster" },
      ],
      chassis: "Ram ProMaster",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 20,
      grayWater: 15,
      blackWater: 12,
      generator: "Solar + lithium packages",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Roadtrek SS Agile — Sport Utility Class B packaging (agile urban/adventure use)."
    },
    Chase: {
      type: "Class B",
      floorplans: ["Chase", "Chase Plus"],
      floorplansByYear: {
        "2016": ["Chase"],
        "2017": ["Chase"],
        "2018": ["Chase", "Chase Plus"],
        "2019": ["Chase", "Chase Plus"],
        "2020": ["Chase", "Chase Plus"],
        "2021": ["Chase", "Chase Plus"],
        "2022": ["Chase", "Chase Plus"],
        "2023": ["Chase", "Chase Plus"],
        "2024": ["Chase", "Chase Plus"],
        "2025": ["Chase"],
        "2026": ["Chase"]
      },
      lengthRange: [
        19,
        22
      ],
      weightRange: [
        7000,
        9500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        85000,
        140000
      ],
      engine: "Ram 3.6L V6 / Mercedes diesel (by year)",
      horsepower: 188,
      powertrainByYear: [
        { from: 2016, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Ram ProMaster / Mercedes Sprinter" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Ram ProMaster / Mercedes Sprinter" },
      ],
      chassis: "Ram ProMaster / Mercedes Sprinter",
      fuelType: "Gas / Diesel",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 18,
      grayWater: 14,
      blackWater: 10,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Roadtrek Chase — compact Class B entry packaging (chassis varies by model year)."
    },
    "CS Adventurous": {
      type: "Class B",
      floorplans: ["CS", "Adventurous"],
      floorplansByYear: {
        "2010": ["CS"],
        "2011": ["CS"],
        "2012": ["CS"],
        "2013": ["CS"],
        "2014": ["CS", "Adventurous"],
        "2015": ["CS", "Adventurous"],
        "2016": ["CS", "Adventurous"],
        "2017": ["CS", "Adventurous"],
        "2018": ["CS", "Adventurous"],
        "2019": ["CS", "Adventurous"],
        "2020": ["CS", "Adventurous"],
        "2021": ["CS", "Adventurous"],
        "2022": ["CS", "Adventurous"],
        "2023": ["CS"],
        "2024": ["CS"],
        "2025": ["CS"],
        "2026": ["CS"]
      },
      lengthRange: [
        22,
        24
      ],
      weightRange: [
        9500,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        120000,
        185000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 4000,
      freshWater: 26,
      grayWater: 18,
      blackWater: 18,
      generator: "Solar + lithium common",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2008,
      mpgHighwayEst: 16,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        }
      ],
      description: "Roadtrek CS Adventurous — Sprinter Class B flagship of the CS family."
    },
    Popular: {
      type: "Class B",
      floorplans: ["190", "210", "Popular 190", "Popular 210"],
      floorplansByYear: {
        "2010": ["190", "210"],
        "2011": ["190", "210"],
        "2012": ["190", "210"],
        "2013": ["190", "210"],
        "2014": ["190", "210", "Popular 190", "Popular 210"],
        "2015": ["190", "210", "Popular 190", "Popular 210"],
        "2016": ["190", "210", "Popular 190", "Popular 210"],
        "2017": ["190", "210", "Popular 190", "Popular 210"],
        "2018": ["190", "210", "Popular 190", "Popular 210"],
        "2019": ["190", "210"],
        "2020": ["190", "210"],
        "2021": ["190", "210"],
        "2022": ["190", "210"],
        "2023": ["190", "210"],
        "2024": ["190", "210"],
        "2025": ["190", "210"],
        "2026": ["190", "210"]
      },
      lengthRange: [
        19,
        22
      ],
      weightRange: [
        7000,
        10000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        80000,
        140000
      ],
      engine: "Ram / Mercedes / Chevy (by era)",
      horsepower: 188,
      chassis: "ProMaster / Sprinter / Chevy (by era)",
      fuelType: "Gas / Diesel",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 2000,
      freshWater: 18,
      grayWater: 14,
      blackWater: 12,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 72,
      founded: 1974,
      warrantyYears: 2,
      yearStart: 2005,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Gas or diesel chassis by build (era)",
          horsepower: 300,
          notes: "Verify door sticker — dual fuel families in this era"
        },
        {
          from: 2005,
          to: 2005,
          engine: "Gas or diesel chassis by build (2000–2005)",
          horsepower: 300,
          notes: "2000–2005 era powertrain for Roadtrek Popular"
        }
      ],
      description: "Roadtrek Popular — long-running Class B nameplate; chassis changed across eras. Always verify door sticker."
    }
  },
  "Nexus RV": {
    Viper: {
      type: "Class C",
      floorplans: ["27V", "29V", "31M", "32DS", "34V"],
      floorplansByYear: {
        "2012": ["27V", "31M", "34V"],
        "2013": ["27V", "31M", "34V"],
        "2014": ["27V", "29V", "31M", "34V"],
        "2015": ["27V", "29V", "31M", "32DS", "34V"],
        "2016": ["27V", "29V", "31M", "32DS", "34V"],
        "2017": ["27V", "29V", "31M", "32DS", "34V"],
        "2018": ["27V", "29V", "31M", "32DS", "34V"],
        "2019": ["27V", "29V", "31M", "32DS", "34V"],
        "2020": ["27V", "29V", "31M", "32DS", "34V"],
        "2021": ["27V", "29V", "31M", "32DS", "34V"],
        "2022": ["27V", "29V", "31M", "32DS", "34V"],
        "2023": ["27V", "29V", "31M", "32DS"],
        "2024": ["27V", "29V", "31M", "32DS"],
        "2025": ["27V", "29V", "31M"],
        "2026": ["27V", "29V", "31M"]
      },
      lengthRange: [
        27,
        34
      ],
      weightRange: [
        14000,
        18000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        90000,
        160000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 55,
      grayWater: 34,
      blackWater: 34,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 2010,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Nexus Viper — value Class C with aluminum-welded framing.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2019,
          engine: "Ford 6.2L V8 / 6.8L V10 (by year)",
          horsepower: 300,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Phantom: {
      type: "Class C",
      floorplans: ["25P", "27P", "28P", "29P", "31P"],
      floorplansByYear: {
        "2012": ["25P", "28P", "31P"],
        "2013": ["25P", "28P", "31P"],
        "2014": ["25P", "27P", "28P", "31P"],
        "2015": ["25P", "27P", "28P", "29P", "31P"],
        "2016": ["25P", "27P", "28P", "29P", "31P"],
        "2017": ["25P", "27P", "28P", "29P", "31P"],
        "2018": ["25P", "27P", "28P", "29P", "31P"],
        "2019": ["25P", "27P", "28P", "29P", "31P"],
        "2020": ["25P", "27P", "28P", "29P", "31P"],
        "2021": ["25P", "27P", "28P", "29P", "31P"],
        "2022": ["25P", "27P", "28P", "29P", "31P"],
        "2023": ["25P", "27P", "28P", "29P"],
        "2024": ["25P", "27P", "28P", "29P"],
        "2025": ["25P", "27P", "28P"],
        "2026": ["25P", "27P", "28P"]
      },
      lengthRange: [
        25,
        31
      ],
      weightRange: [
        12000,
        16000
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        75000,
        130000
      ],
      engine: "Ford 7.3L / 6.2L (by year)",
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 13,
      ceilingHeight: 79,
      founded: 2010,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Nexus Phantom — compact value Class C (rental fleets + first-time buyers).",
      powertrainByYear: [
        {
          from: 2012,
          to: 2019,
          engine: "Ford 6.2L V8",
          horsepower: 300,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Ghost: {
      type: "Class C",
      floorplans: ["29DS", "30DS", "32DS", "33DS", "34DS"],
      floorplansByYear: {
        "2014": ["29DS", "32DS", "34DS"],
        "2015": ["29DS", "32DS", "34DS"],
        "2016": ["29DS", "30DS", "32DS", "34DS"],
        "2017": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2018": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2019": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2020": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2021": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2022": ["29DS", "30DS", "32DS", "33DS", "34DS"],
        "2023": ["29DS", "30DS", "32DS", "33DS"],
        "2024": ["29DS", "30DS", "32DS"],
        "2025": ["29DS", "30DS", "32DS"],
        "2026": ["29DS", "30DS", "32DS"]
      },
      lengthRange: [
        29,
        35
      ],
      weightRange: [
        14000,
        17000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        120000,
        185000
      ],
      engine: "Ford 7.3L V8 Godzilla",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 34,
      blackWater: 34,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 2010,
      warrantyYears: 2,
      yearStart: 2014,
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        }
      ],
      description: "Nexus Ghost — mid-size dual-slide Class C."
    },
    Triumph: {
      type: "Super C",
      floorplans: ["29T", "31T", "33T", "35T", "38T", "40T"],
      floorplansByYear: {
        "2014": ["29T", "33T", "35T"],
        "2015": ["29T", "33T", "35T"],
        "2016": ["29T", "31T", "33T", "35T", "38T"],
        "2017": ["29T", "31T", "33T", "35T", "38T"],
        "2018": ["29T", "31T", "33T", "35T", "38T", "40T"],
        "2019": ["29T", "31T", "33T", "35T", "38T", "40T"],
        "2020": ["29T", "31T", "33T", "35T", "38T", "40T"],
        "2021": ["29T", "31T", "33T", "35T", "38T", "40T"],
        "2022": ["29T", "31T", "33T", "35T", "38T", "40T"],
        "2023": ["29T", "31T", "33T", "35T", "38T"],
        "2024": ["29T", "31T", "33T", "35T", "38T"],
        "2025": ["29T", "31T", "33T", "35T"],
        "2026": ["29T", "31T", "33T", "35T"]
      },
      lengthRange: [
        29,
        40
      ],
      weightRange: [
        22000,
        32000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        170000,
        280000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      chassis: "Ford F-550",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Diesel QD",
      awningLength: 18,
      ceilingHeight: 83,
      founded: 2010,
      warrantyYears: 2,
      yearStart: 2014,
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super Duty (by build)",
          notes: "Pre-modern Power Stroke 330 packaging on many Super Cs"
        }
      ],
      description: "Nexus Triumph — Super C on Ford F-550 with high tow rating."
    },
    "Rebel Super C": {
      type: "Super C",
      floorplans: ["32T", "33T", "35T", "37T", "38T"],
      floorplansByYear: {
        "2016": ["32T", "35T", "38T"],
        "2017": ["32T", "35T", "38T"],
        "2018": ["32T", "33T", "35T", "38T"],
        "2019": ["32T", "33T", "35T", "37T", "38T"],
        "2020": ["32T", "33T", "35T", "37T", "38T"],
        "2021": ["32T", "33T", "35T", "37T", "38T"],
        "2022": ["32T", "33T", "35T", "37T", "38T"],
        "2023": ["32T", "33T", "35T", "37T"],
        "2024": ["32T", "33T", "35T", "37T"],
        "2025": ["32T", "33T", "35T"],
        "2026": ["32T", "33T", "35T"]
      },
      lengthRange: [
        32,
        39
      ],
      weightRange: [
        22000,
        30000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        200000,
        310000
      ],
      engine: "Ford Power Stroke 6.7L Diesel",
      horsepower: 330,
      powertrainByYear: [
        { from: 2016, to: 2026, engine: "Ford Power Stroke 6.7L Diesel", horsepower: 330, chassis: "Ford F-550" },
      ],
      chassis: "Ford F-550",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 70,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 5500–8000W Diesel",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2010,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Nexus Rebel Super C — higher-content Super C sibling to Triumph."
    }
  },
  Crossroads: {
    Cameo: {
      type: "Fifth Wheel",
      floorplans: ["2850BL", "3531RD", "3680MB"],
      floorplansByYear: {
        "2005": ["2850BL"],
        "2006": ["2850BL"],
        "2007": ["2850BL"],
        "2008": ["2850BL"],
        "2009": ["2850BL"],
        "2010": ["2850BL"],
        "2011": ["2850BL", "3531RD"],
        "2012": ["2850BL", "3531RD"],
        "2013": ["2850BL", "3531RD"],
        "2014": ["2850BL", "3531RD"],
        "2015": ["2850BL", "3531RD"],
        "2016": ["2850BL", "3531RD"],
        "2017": ["2850BL", "3531RD", "3680MB"],
        "2018": ["2850BL", "3531RD", "3680MB"],
        "2019": ["2850BL", "3531RD", "3680MB"],
        "2020": ["2850BL", "3531RD", "3680MB"],
        "2021": ["2850BL", "3531RD", "3680MB"],
        "2022": ["2850BL", "3531RD", "3680MB"],
        "2023": ["2850BL", "3531RD", "3680MB"],
        "2024": ["2850BL", "3531RD", "3680MB"],
        "2025": ["2850BL", "3531RD", "3680MB"],
        "2026": ["2850BL", "3531RD", "3680MB"]
      },
      lengthRange: [
        28,
        37
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        54900,
        84000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 58,
      grayWater: 38,
      blackWater: 38,
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1996,
      warrantyYears: 2,
      yearStart: 2005,
      description: "The Cameo is Crossroads's flagship fifth wheel — residential kitchen, triple slideouts, and a full-wall master suite that punches above its price class."
    },
    "Sunset Trail": {
      type: "Travel Trailer",
      floorplans: ["SS228RK", "SS260BH", "SS295QB"],
      floorplansByYear: {
        "2005": ["SS228RK"],
        "2006": ["SS228RK"],
        "2007": ["SS228RK"],
        "2008": ["SS228RK"],
        "2009": ["SS228RK"],
        "2010": ["SS228RK"],
        "2011": ["SS228RK", "SS260BH"],
        "2012": ["SS228RK", "SS260BH"],
        "2013": ["SS228RK", "SS260BH"],
        "2014": ["SS228RK", "SS260BH"],
        "2015": ["SS228RK", "SS260BH"],
        "2016": ["SS228RK", "SS260BH"],
        "2017": ["SS228RK", "SS260BH", "SS295QB"],
        "2018": ["SS228RK", "SS260BH", "SS295QB"],
        "2019": ["SS228RK", "SS260BH", "SS295QB"],
        "2020": ["SS228RK", "SS260BH", "SS295QB"],
        "2021": ["SS228RK", "SS260BH", "SS295QB"],
        "2022": ["SS228RK", "SS260BH", "SS295QB"],
        "2023": ["SS228RK", "SS260BH", "SS295QB"],
        "2024": ["SS228RK", "SS260BH", "SS295QB"],
        "2025": ["SS228RK", "SS260BH", "SS295QB"],
        "2026": ["SS228RK", "SS260BH", "SS295QB"]
      },
      lengthRange: [
        22,
        30
      ],
      weightRange: [
        5500,
        8000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        29900,
        49000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 48,
      grayWater: 30,
      blackWater: 30,
      awningLength: 12,
      ceilingHeight: 77,
      founded: 1996,
      warrantyYears: 2,
      yearStart: 2005,
      description: "The Sunset Trail is Crossroads's entry-level travel trailer — a family-friendly, well-appointed towable with multiple bunkhouse floorplans at a competitive price."
    },
    Redwood: {
      type: "Fifth Wheel",
      floorplans: ["3401RL", "3901RL", "4150RD"],
      floorplansByYear: {
        "2012": ["3401RL"],
        "2013": ["3401RL"],
        "2014": ["3401RL"],
        "2015": ["3401RL"],
        "2016": ["3401RL", "3901RL"],
        "2017": ["3401RL", "3901RL"],
        "2018": ["3401RL", "3901RL"],
        "2019": ["3401RL", "3901RL"],
        "2020": ["3401RL", "3901RL", "4150RD"],
        "2021": ["3401RL", "3901RL", "4150RD"],
        "2022": ["3401RL", "3901RL", "4150RD"],
        "2023": ["3401RL", "3901RL", "4150RD"],
        "2024": ["3401RL", "3901RL", "4150RD"],
        "2025": ["3401RL", "3901RL", "4150RD"],
        "2026": ["3401RL", "3901RL", "4150RD"]
      },
      lengthRange: [
        35,
        43
      ],
      weightRange: [
        12000,
        17000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        84900,
        144000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 96,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Redwood is Crossroads luxury fifth wheel with residential design and strong full-time credentials."
    },
    Volante: {
      type: "Fifth Wheel",
      floorplans: ["270RL", "310BH", "3201RL"],
      floorplansByYear: {
        "2014": ["270RL"],
        "2015": ["270RL"],
        "2016": ["270RL"],
        "2017": ["270RL", "310BH"],
        "2018": ["270RL", "310BH"],
        "2019": ["270RL", "310BH"],
        "2020": ["270RL", "310BH"],
        "2021": ["270RL", "310BH", "3201RL"],
        "2022": ["270RL", "310BH", "3201RL"],
        "2023": ["270RL", "310BH", "3201RL"],
        "2024": ["270RL", "310BH", "3201RL"],
        "2025": ["270RL", "310BH", "3201RL"],
        "2026": ["270RL", "310BH", "3201RL"]
      },
      lengthRange: [
        28,
        35
      ],
      weightRange: [
        7000,
        11000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        39900,
        69900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Volante is Crossroads light fifth wheel line for half-ton and mid-size trucks."
    },
    "Cruiser Aire": {
      type: "Fifth Wheel",
      floorplans: ["28RL", "30RL", "32EL"],
      floorplansByYear: {
        "2010": ["28RL"],
        "2011": ["28RL"],
        "2012": ["28RL"],
        "2013": ["28RL"],
        "2014": ["28RL", "30RL"],
        "2015": ["28RL", "30RL"],
        "2016": ["28RL", "30RL"],
        "2017": ["28RL", "30RL"],
        "2018": ["28RL", "30RL"],
        "2019": ["28RL", "30RL", "32EL"],
        "2020": ["28RL", "30RL", "32EL"],
        "2021": ["28RL", "30RL", "32EL"],
        "2022": ["28RL", "30RL", "32EL"],
        "2023": ["28RL", "30RL", "32EL"],
        "2024": ["28RL", "30RL", "32EL"],
        "2025": ["28RL", "30RL", "32EL"],
        "2026": ["28RL", "30RL", "32EL"]
      },
      lengthRange: [
        28,
        34
      ],
      weightRange: [
        7500,
        10500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        42900,
        72900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Cruiser Aire offers Crossroads mid-market fifth wheel living with efficient floorplans."
    },
    "Zinger TH": {
      type: "Toy Hauler",
      floorplans: ["298BH", "310BH", "330TH"],
      floorplansByYear: {
        "2013": ["298BH"],
        "2014": ["298BH"],
        "2015": ["298BH"],
        "2016": ["298BH"],
        "2017": ["298BH", "310BH"],
        "2018": ["298BH", "310BH"],
        "2019": ["298BH", "310BH"],
        "2020": ["298BH", "310BH"],
        "2021": ["298BH", "310BH", "330TH"],
        "2022": ["298BH", "310BH", "330TH"],
        "2023": ["298BH", "310BH", "330TH"],
        "2024": ["298BH", "310BH", "330TH"],
        "2025": ["298BH", "310BH", "330TH"],
        "2026": ["298BH", "310BH", "330TH"]
      },
      lengthRange: [
        30,
        36
      ],
      weightRange: [
        7000,
        10000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        39900,
        64900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 30,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1996,
      warrantyYears: 1,
      yearStart: 2013,
      generator: "Generator prep",
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 2200,
      rampWidthFt: 7.5,
      fuelStationGal: 20,
      generatorFuelGal: 0,
      garageFits: "Dirt bikes or compact UTV",
      description: "Zinger TH is Crossroads entry toy hauler with ramp door and garage sleeping for weekend recreation."
    }
  },
  Palomino: {
    Puma: {
      type: "Travel Trailer",
      floorplans: [
        "16BHQ",
        "25RKSS",
        "26FKDS",
        "28BHSS",
        "30RKQS",
        "32BHQS",
        "32FBIS",
        "337BH",
        "38RLB"
      ],
      floorplansByYear: {
        "2010": ["25RKSS", "28BHSS", "30RKQS", "32BHQS"],
        "2011": ["25RKSS", "28BHSS", "30RKQS", "32BHQS"],
        "2012": ["25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS"],
        "2013": ["25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS"],
        "2014": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS"],
        "2015": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS"],
        "2016": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS", "337BH"],
        "2017": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS", "337BH"],
        "2018": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS", "337BH"],
        "2019": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2020": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2021": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2022": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2023": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2024": [
          "16BHQ",
          "25RKSS",
          "26FKDS",
          "28BHSS",
          "30RKQS",
          "32BHQS",
          "32FBIS",
          "337BH",
          "38RLB"
        ],
        "2025": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "337BH", "38RLB"],
        "2026": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "337BH"]
      },
      lengthRange: [
        18,
        40
      ],
      weightRange: [
        3200,
        9000
      ],
      slideouts: 1,
      sleeps: 10,
      msrpRange: [
        21900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 43,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Palomino Puma — Forest River high-volume travel trailer (destination and towable). Common bunk codes 28BHSS / 32BHQS / 337BH."
    },
    SolAire: {
      type: "Travel Trailer",
      floorplans: ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
      floorplansByYear: {
        "2014": ["202RB", "243BHS", "258RBSS"],
        "2015": ["202RB", "243BHS", "258RBSS", "294DBHS"],
        "2016": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS"],
        "2017": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS"],
        "2018": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2019": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2020": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2021": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2022": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2023": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2024": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK"],
        "2025": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS"],
        "2026": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS"]
      },
      lengthRange: [
        22,
        35
      ],
      weightRange: [
        4500,
        7800
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        28900,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Palomino SolAire Ultra Lite — lighter Puma-family travel trailer for half-ton towers."
    },
    Columbus: {
      type: "Fifth Wheel",
      floorplans: ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
      floorplansByYear: {
        "2012": ["329DV", "383FB"],
        "2013": ["329DV", "383FB"],
        "2014": ["329DV", "370FL", "383FB"],
        "2015": ["329DV", "370FL", "380RL", "383FB"],
        "2016": ["329DV", "340RK", "370FL", "380RL", "383FB"],
        "2017": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH"],
        "2018": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2019": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2020": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2021": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2022": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2023": ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH"],
        "2024": ["329DV", "340RK", "380RL", "383FB", "383RLH", "388FKH"],
        "2025": ["329DV", "380RL", "383FB", "383RLH", "388FKH"],
        "2026": ["329DV", "380RL", "383FB", "383RLH", "388FKH"]
      },
      lengthRange: [
        33,
        42
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        64900,
        125000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 70,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Palomino Columbus — residential fifth wheel (Compass / Luxury packages). 380RL / 383FB staples."
    },
    "Columbus Compass": {
      type: "Fifth Wheel",
      floorplans: ["320RL", "329DV", "340RK", "383FB"],
      floorplansByYear: {
        "2012": ["329DV", "383FB"],
        "2013": ["329DV", "383FB"],
        "2014": ["320RL", "329DV", "383FB"],
        "2015": ["320RL", "329DV", "340RK", "383FB"],
        "2016": ["320RL", "329DV", "340RK", "383FB"],
        "2017": ["320RL", "329DV", "340RK", "383FB"],
        "2018": ["320RL", "329DV", "340RK", "383FB"],
        "2019": ["320RL", "329DV", "340RK", "383FB"],
        "2020": ["320RL", "329DV", "340RK", "383FB"],
        "2021": ["320RL", "329DV", "340RK", "383FB"],
        "2022": ["320RL", "329DV", "340RK", "383FB"],
        "2023": ["320RL", "329DV", "340RK", "383FB"],
        "2024": ["320RL", "329DV", "340RK", "383FB"],
        "2025": ["320RL", "329DV", "383FB"],
        "2026": ["320RL", "329DV", "383FB"]
      },
      lengthRange: [
        32,
        40
      ],
      weightRange: [
        10000,
        15000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        59900,
        109000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 36,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Palomino Columbus Compass — lighter Columbus packaging for more trucks."
    },
    "Real-Lite": {
      type: "Travel Trailer",
      floorplans: ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
      floorplansByYear: {
        "2010": ["160SS", "180", "208"],
        "2011": ["160SS", "180", "208"],
        "2012": ["160SS", "180", "208", "Mini Lite 180"],
        "2013": ["160SS", "180", "1810BH", "208", "Mini Lite 180"],
        "2014": ["160SS", "180", "1810BH", "208", "Mini Lite 180"],
        "2015": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2016": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2017": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2018": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2019": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2020": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2021": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2022": ["160SS", "180", "1810BH", "208", "Mini Lite 180", "SS-1607"],
        "2023": ["160SS", "180", "1810BH", "208", "Mini Lite 180"],
        "2024": ["160SS", "180", "1810BH", "208", "Mini Lite 180"],
        "2025": ["160SS", "180", "1810BH", "208"],
        "2026": ["160SS", "180", "1810BH", "208"]
      },
      lengthRange: [
        16,
        24
      ],
      weightRange: [
        2500,
        4500
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        16900,
        36000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 26,
      grayWater: 22,
      blackWater: 22,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2006,
      description: "Palomino Real-Lite — ultra-light mini TT / truck-camper-adjacent small trailers."
    },
    "Real-Lite FW": {
      type: "Fifth Wheel",
      floorplans: ["1850", "2120", "2450", "2600"],
      floorplansByYear: {
        "2012": ["1850", "2120"],
        "2013": ["1850", "2120", "2450"],
        "2014": ["1850", "2120", "2450"],
        "2015": ["1850", "2120", "2450", "2600"],
        "2016": ["1850", "2120", "2450", "2600"],
        "2017": ["1850", "2120", "2450", "2600"],
        "2018": ["1850", "2120", "2450", "2600"],
        "2019": ["1850", "2120", "2450", "2600"],
        "2020": ["1850", "2120", "2450", "2600"],
        "2021": ["1850", "2120", "2450", "2600"],
        "2022": ["1850", "2120", "2450", "2600"],
        "2023": ["1850", "2120", "2450"],
        "2024": ["1850", "2120", "2450"],
        "2025": ["1850", "2120"],
        "2026": ["1850", "2120"]
      },
      lengthRange: [
        20,
        28
      ],
      weightRange: [
        5500,
        9000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        29900,
        52000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Palomino Real-Lite FW — light fifth wheel for small trucks and first-time pin-hitch owners."
    },
    Sabre: {
      type: "Fifth Wheel",
      floorplans: ["36DBQ", "37FLL", "38MBH"],
      floorplansByYear: {
        "2011": ["36DBQ", "37FLL"],
        "2012": ["36DBQ", "37FLL", "38MBH"],
        "2013": ["36DBQ", "37FLL", "38MBH"],
        "2014": ["36DBQ", "37FLL", "38MBH"],
        "2015": ["36DBQ", "37FLL", "38MBH"],
        "2016": ["36DBQ", "37FLL", "38MBH"],
        "2017": ["36DBQ", "37FLL", "38MBH"],
        "2018": ["36DBQ", "37FLL", "38MBH"],
        "2019": ["36DBQ", "37FLL", "38MBH"],
        "2020": ["36DBQ", "37FLL", "38MBH"],
        "2021": ["36DBQ", "37FLL", "38MBH"],
        "2022": ["36DBQ", "37FLL", "38MBH"],
        "2023": ["36DBQ", "37FLL"],
        "2024": ["36DBQ", "37FLL"],
        "2025": ["36DBQ", "37FLL"],
        "2026": ["36DBQ", "37FLL"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        11000,
        15000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        54900,
        99000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2011,
      description: "Palomino Sabre — family bunk fifth wheel under the Palomino umbrella."
    },
    "Puma Unleashed": {
      type: "Toy Hauler",
      floorplans: ["383THS", "383TOC", "356THS"],
      floorplansByYear: {
        "2014": ["383THS"],
        "2015": ["383THS", "383TOC"],
        "2016": ["356THS", "383THS", "383TOC"],
        "2017": ["356THS", "383THS", "383TOC"],
        "2018": ["356THS", "383THS", "383TOC"],
        "2019": ["356THS", "383THS", "383TOC"],
        "2020": ["356THS", "383THS", "383TOC"],
        "2021": ["356THS", "383THS", "383TOC"],
        "2022": ["356THS", "383THS", "383TOC"],
        "2023": ["356THS", "383THS", "383TOC"],
        "2024": ["356THS", "383THS", "383TOC"],
        "2025": ["356THS", "383THS"],
        "2026": ["356THS", "383THS"]
      },
      lengthRange: [
        34,
        40
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        44900,
        89000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 2014,
      generator: "Generator prep",
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2500,
      rampWidthFt: 7.5,
      garageFits: "1 UTV or dual bikes",
      description: "Palomino Puma Unleashed — toy hauler TT/FW hybrid garage plans for weekend toys."
    }
  },
  Dutchmen: {
    Kodiak: {
      type: "Travel Trailer",
      floorplans: [
        "200BHSL",
        "201QBSL",
        "248BHSL",
        "261RBSL",
        "263BHSL",
        "283BHSL",
        "294BHSL",
        "296BHSL",
        "331BHSL",
        "332BHSL"
      ],
      floorplansByYear: {
        "2010": ["200BHSL", "248BHSL", "263BHSL", "294BHSL"],
        "2011": ["200BHSL", "248BHSL", "263BHSL", "294BHSL"],
        "2012": ["200BHSL", "248BHSL", "261RBSL", "263BHSL", "294BHSL"],
        "2013": ["200BHSL", "248BHSL", "261RBSL", "263BHSL", "283BHSL", "294BHSL"],
        "2014": ["200BHSL", "201QBSL", "248BHSL", "261RBSL", "263BHSL", "283BHSL", "294BHSL"],
        "2015": ["200BHSL", "201QBSL", "248BHSL", "261RBSL", "263BHSL", "283BHSL", "294BHSL", "331BHSL"],
        "2016": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL"
        ],
        "2017": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL"
        ],
        "2018": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL",
          "332BHSL"
        ],
        "2019": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL",
          "332BHSL"
        ],
        "2020": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL",
          "332BHSL"
        ],
        "2021": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL",
          "332BHSL"
        ],
        "2022": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL",
          "332BHSL"
        ],
        "2023": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL"
        ],
        "2024": [
          "200BHSL",
          "201QBSL",
          "248BHSL",
          "261RBSL",
          "263BHSL",
          "283BHSL",
          "294BHSL",
          "296BHSL",
          "331BHSL"
        ],
        "2025": ["200BHSL", "201QBSL", "248BHSL", "261RBSL", "263BHSL", "283BHSL", "294BHSL", "331BHSL"],
        "2026": ["200BHSL", "248BHSL", "261RBSL", "263BHSL", "283BHSL", "294BHSL", "331BHSL"]
      },
      lengthRange: [
        22,
        36
      ],
      weightRange: [
        4500,
        8500
      ],
      slideouts: 1,
      sleeps: 10,
      msrpRange: [
        24900,
        48000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 32,
      blackWater: 32,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2006,
      description: "Dutchmen Kodiak Ultimate / SE — volume half-ton travel trailer. Bunkhouse staples 263BHSL / 294BHSL / 331BHSL."
    },
    Coleman: {
      type: "Travel Trailer",
      floorplans: [
        "17B",
        "19BH",
        "22MHC",
        "2405BH",
        "2455RL",
        "2555BH",
        "263BH",
        "2855BH",
        "3005RL",
        "3225BH"
      ],
      floorplansByYear: {
        "2010": ["17B", "19BH", "2555BH", "2855BH"],
        "2011": ["17B", "19BH", "2555BH", "2855BH"],
        "2012": ["17B", "19BH", "2455RL", "2555BH", "2855BH"],
        "2013": ["17B", "19BH", "2455RL", "2555BH", "263BH", "2855BH"],
        "2014": ["17B", "19BH", "2405BH", "2455RL", "2555BH", "263BH", "2855BH"],
        "2015": ["17B", "19BH", "2405BH", "2455RL", "2555BH", "263BH", "2855BH", "3225BH"],
        "2016": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3225BH"
        ],
        "2017": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2018": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2019": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2020": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2021": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2022": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL",
          "3225BH"
        ],
        "2023": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL"
        ],
        "2024": [
          "17B",
          "19BH",
          "22MHC",
          "2405BH",
          "2455RL",
          "2555BH",
          "263BH",
          "2855BH",
          "3005RL"
        ],
        "2025": ["17B", "19BH", "22MHC", "2405BH", "2455RL", "2555BH", "263BH", "2855BH"],
        "2026": ["17B", "19BH", "22MHC", "2405BH", "2455RL", "2555BH", "263BH"]
      },
      lengthRange: [
        18,
        35
      ],
      weightRange: [
        3000,
        8500
      ],
      slideouts: 1,
      sleeps: 10,
      msrpRange: [
        18900,
        45000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2006,
      description: "Dutchmen Coleman Lantern / LT — Camping World volume brand. Entry bunkhouses and light plans (was also fifth-wheel packages in some years)."
    },
    "Aspen Trail": {
      type: "Travel Trailer",
      floorplans: ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
      floorplansByYear: {
        "2012": ["17BH", "25BH", "26BH"],
        "2013": ["17BH", "25BH", "26BH", "2810BHS"],
        "2014": ["17BH", "1950BH", "25BH", "26BH", "2810BHS"],
        "2015": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS"],
        "2016": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2017": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2018": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2019": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2020": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2021": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2022": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2023": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS", "3020BHS"],
        "2024": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS"],
        "2025": ["17BH", "1950BH", "25BH", "26BH", "2810BHS", "2850BHS"],
        "2026": ["17BH", "1950BH", "25BH", "26BH", "2810BHS"]
      },
      lengthRange: [
        18,
        34
      ],
      weightRange: [
        3500,
        7500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        21900,
        42000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.15,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Dutchmen Aspen Trail — light family travel trailer companion to Aspen Trail FW."
    },
    "Aspen Trail FW": {
      type: "Fifth Wheel",
      floorplans: ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
      floorplansByYear: {
        "2012": ["2860RL", "3010BH"],
        "2013": ["2860RL", "3010BH", "3250RLS"],
        "2014": ["2860RL", "2910BH", "3010BH", "3250RLS"],
        "2015": ["2860RL", "2910BH", "3010BH", "3250RLS"],
        "2016": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2017": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2018": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2019": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2020": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2021": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2022": ["2860RL", "2910BH", "3010BH", "3250RLS", "3330RLS"],
        "2023": ["2860RL", "2910BH", "3010BH", "3250RLS"],
        "2024": ["2860RL", "2910BH", "3010BH", "3250RLS"],
        "2025": ["2860RL", "2910BH", "3010BH"],
        "2026": ["2860RL", "2910BH", "3010BH"]
      },
      lengthRange: [
        28,
        35
      ],
      weightRange: [
        7500,
        12000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        39900,
        72000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 50,
      blackWater: 35,
      awningLength: 15,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Dutchmen Aspen Trail FW — light fifth wheel for half-ton / 3/4-ton towers."
    },
    Voltage: {
      type: "Toy Hauler",
      floorplans: ["3200", "3415", "3605", "3855", "3905", "4135"],
      floorplansByYear: {
        "2010": ["3415", "3605", "3855"],
        "2011": ["3415", "3605", "3855"],
        "2012": ["3415", "3605", "3855", "4135"],
        "2013": ["3415", "3605", "3855", "4135"],
        "2014": ["3200", "3415", "3605", "3855", "4135"],
        "2015": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2016": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2017": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2018": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2019": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2020": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2021": ["3200", "3415", "3605", "3855", "3905", "4135"],
        "2022": ["3200", "3415", "3605", "3855", "3905"],
        "2023": ["3200", "3415", "3605", "3855", "3905"],
        "2024": ["3200", "3415", "3605", "3855"],
        "2025": ["3200", "3415", "3605", "3855"],
        "2026": ["3200", "3415", "3605"]
      },
      lengthRange: [
        34,
        44
      ],
      weightRange: [
        12000,
        18000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        69900,
        135000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2010,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 12,
      garageWidthFt: 8.2,
      garageHeightIn: 84,
      garageCapacityLbs: 3500,
      rampWidthFt: 8,
      fuelStationGal: 30,
      garageFits: "1–2 UTVs by plan",
      description: "Dutchmen Voltage — full-size fifth-wheel toy hauler. Garage depth varies widely by plan."
    },
    "Voltage V-Series": {
      type: "Toy Hauler",
      floorplans: ["2705", "3200", "3605", "3905"],
      floorplansByYear: {
        "2014": ["3200", "3605"],
        "2015": ["2705", "3200", "3605"],
        "2016": ["2705", "3200", "3605", "3905"],
        "2017": ["2705", "3200", "3605", "3905"],
        "2018": ["2705", "3200", "3605", "3905"],
        "2019": ["2705", "3200", "3605", "3905"],
        "2020": ["2705", "3200", "3605", "3905"],
        "2021": ["2705", "3200", "3605", "3905"],
        "2022": ["2705", "3200", "3605", "3905"],
        "2023": ["2705", "3200", "3605"],
        "2024": ["2705", "3200", "3605"],
        "2025": ["2705", "3200", "3605"],
        "2026": ["2705", "3200"]
      },
      lengthRange: [
        28,
        40
      ],
      weightRange: [
        9000,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        54900,
        110000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 80,
      grayWater: 40,
      blackWater: 40,
      awningLength: 15,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2014,
      generator: "Generator prep",
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      rampWidthFt: 7.5,
      garageFits: "1 UTV or dual quads",
      description: "Dutchmen Voltage V-Series — lighter Voltage toy hauler packaging."
    },
    Yukon: {
      type: "Fifth Wheel",
      floorplans: ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
      floorplansByYear: {
        "2010": ["343RLB", "393RLB"],
        "2011": ["343RLB", "393RLB"],
        "2012": ["343RLB", "381MBL", "393RLB"],
        "2013": ["343RLB", "381MBL", "393RLB", "397RLB"],
        "2014": ["343RLB", "381MBL", "393RLB", "397RLB"],
        "2015": ["343RLB", "381MBL", "393RLB", "397RLB"],
        "2016": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2017": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2018": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2019": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2020": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2021": ["343RLB", "381MBL", "393RLB", "397RLB", "399ML"],
        "2022": ["343RLB", "381MBL", "393RLB", "397RLB"],
        "2023": ["343RLB", "381MBL", "393RLB", "397RLB"],
        "2024": ["343RLB", "381MBL", "393RLB"],
        "2025": ["343RLB", "381MBL", "393RLB"],
        "2026": ["343RLB", "381MBL"]
      },
      lengthRange: [
        34,
        41
      ],
      weightRange: [
        12000,
        18000
      ],
      slideouts: 4,
      sleeps: 8,
      msrpRange: [
        59900,
        109000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 70,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Dutchmen Yukon — residential fifth wheel with large living areas and family bunk layouts."
    },
    Astoria: {
      type: "Fifth Wheel",
      floorplans: ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
      floorplansByYear: {
        "2012": ["3213RLP", "3503RLD"],
        "2013": ["3213RLP", "3503RLD"],
        "2014": ["2913RL", "3213RLP", "3503RLD"],
        "2015": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2016": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2017": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2018": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2019": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2020": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2021": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2022": ["2913RL", "3213RLP", "3503RLD", "3553RLT"],
        "2023": ["2913RL", "3213RLP", "3503RLD"],
        "2024": ["2913RL", "3213RLP", "3503RLD"],
        "2025": ["2913RL", "3213RLP", "3503RLD"],
        "2026": ["2913RL", "3213RLP"]
      },
      lengthRange: [
        29,
        37
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        49900,
        89000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 60,
      blackWater: 36,
      awningLength: 15,
      ceilingHeight: 82,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2012,
      description: "Dutchmen Astoria — mid-luxury fifth wheel with rear living layouts."
    },
    Aerolite: {
      type: "Travel Trailer",
      floorplans: ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
      floorplansByYear: {
        "2010": ["1923RB", "2423BH", "2603QB"],
        "2011": ["1923RB", "2423BH", "2603QB"],
        "2012": ["1923RB", "2133RB", "2423BH", "2603QB"],
        "2013": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2014": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2015": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2016": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2017": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2018": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2019": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2020": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2021": ["1923RB", "2133RB", "2423BH", "2603QB", "2830QB"],
        "2022": ["1923RB", "2133RB", "2423BH", "2603QB"],
        "2023": ["1923RB", "2133RB", "2423BH", "2603QB"],
        "2024": ["1923RB", "2133RB", "2423BH"],
        "2025": ["1923RB", "2133RB", "2423BH"],
        "2026": ["1923RB", "2133RB"]
      },
      lengthRange: [
        19,
        30
      ],
      weightRange: [
        3500,
        6500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        19900,
        38000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 36,
      grayWater: 28,
      blackWater: 28,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2005,
      description: "Dutchmen Aerolite — ultra-light value travel trailer (production tapered mid-2020s)."
    },
    Infinity: {
      type: "Fifth Wheel",
      floorplans: ["3370RL", "3550FL", "3750FL", "3920MB"],
      floorplansByYear: {
        "2015": ["3370RL", "3550FL"],
        "2016": ["3370RL", "3550FL", "3750FL"],
        "2017": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2018": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2019": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2020": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2021": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2022": ["3370RL", "3550FL", "3750FL", "3920MB"],
        "2023": ["3370RL", "3550FL", "3750FL"],
        "2024": ["3370RL", "3550FL", "3750FL"],
        "2025": ["3370RL", "3550FL"],
        "2026": ["3370RL", "3550FL"]
      },
      lengthRange: [
        33,
        40
      ],
      weightRange: [
        11000,
        16000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        59900,
        105000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 70,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1991,
      warrantyYears: 1,
      yearStart: 2015,
      description: "Dutchmen Infinity — residential fifth wheel with large living areas and family bunk layouts."
    }
  },
  "Leisure Travel Vans": {
    Unity: {
      type: "Class B+",
      floorplans: ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB", "U24CB", "U24FX"],
      floorplansByYear: {
        "2012": ["24CB", "24MB", "24TB"],
        "2013": ["24CB", "24MB", "24TB"],
        "2014": ["24CB", "24MB", "24RL", "24TB"],
        "2015": ["24CB", "24FX", "24MB", "24RL", "24TB"],
        "2016": ["24CB", "24FX", "24MB", "24RL", "24TB"],
        "2017": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB"],
        "2018": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB"],
        "2019": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB"],
        "2020": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB"],
        "2021": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB", "U24CB", "U24FX"],
        "2022": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB", "U24CB", "U24FX"],
        "2023": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB", "U24CB", "U24FX"],
        "2024": ["24CB", "24FX", "24IB", "24MB", "24RL", "24TB", "U24CB", "U24FX"],
        "2025": ["24CB", "24FX", "24IB", "24RL", "24TB", "U24CB", "U24FX"],
        "2026": ["24CB", "24FX", "24IB", "24RL", "24TB", "U24CB", "U24FX"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        180000,
        260000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "Optional LP / solar + lithium common",
      awningLength: 10,
      ceilingHeight: 78,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 1993,
      mpgHighwayEst: 15,
      description: "LTV Unity — flagship Class B+ on Sprinter. Corner Bed (CB), FX Murphy, Island Bed (IB), Twin Bed (TB), Rear Lounge (RL). Canadian hand-built. Live Grok fills exact UVW/payload.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2018,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel ~188HP",
          horsepower: 188,
          chassis: "Mercedes Sprinter 3500"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Mercedes-Benz 3.0L V6 / 2.0L I4 turbodiesel (by year)",
          horsepower: 188,
          chassis: "Mercedes Sprinter 3500",
          notes: "Confirm door sticker for I4 vs V6 era"
        },
        {
          from: 2000,
          to: 2005,
          engine: "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
          horsepower: 154,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Early Sprinter era — ~154–188 HP by year"
        }
      ]
    },
    Wonder: {
      type: "Class B+",
      floorplans: ["24FTB", "24MB", "24RB", "24RTB", "W24FTB", "W24RTB"],
      floorplansByYear: {
        "2015": ["24MB", "24RB"],
        "2016": ["24FTB", "24MB", "24RB", "24RTB"],
        "2017": ["24FTB", "24MB", "24RB", "24RTB"],
        "2018": ["24FTB", "24MB", "24RB", "24RTB"],
        "2019": ["24FTB", "24MB", "24RB", "24RTB"],
        "2020": ["24FTB", "24MB", "24RB", "24RTB"],
        "2021": ["24FTB", "24MB", "24RB", "24RTB", "W24FTB", "W24RTB"],
        "2022": ["24FTB", "24MB", "24RB", "24RTB", "W24FTB", "W24RTB"],
        "2023": ["24FTB", "24MB", "24RB", "24RTB", "W24FTB", "W24RTB"],
        "2024": ["24FTB", "24MB", "24RB", "24RTB", "W24FTB", "W24RTB"],
        "2025": ["24FTB", "24RB", "24RTB", "W24FTB", "W24RTB"],
        "2026": ["24FTB", "24RB", "24RTB", "W24FTB", "W24RTB"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10500,
        14000
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        160000,
        240000
      ],
      engine: "Mercedes-Benz diesel / Ford Transit (select)",
      horsepower: 188,
      chassis: "Mercedes Sprinter / Ford Transit",
      fuelType: "Diesel / Gas (by chassis)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 28,
      blackWater: 28,
      generator: "Optional LP (often standard later years)",
      awningLength: 10,
      ceilingHeight: 78,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2015,
      mpgHighwayEst: 15,
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Gas or diesel chassis by build (era)",
          horsepower: 300,
          notes: "Verify door sticker — dual fuel families in this era"
        }
      ],
      description: "LTV Wonder — Class B+ companion to Unity. FTB front twin, RTB rear twin/garage-style. Some years Transit chassis options — verify VIN/door sticker."
    },
    "Wonder XL": {
      type: "Class B+",
      floorplans: ["26FBT", "26MB", "24RB", "26RB", "26RTB"],
      floorplansByYear: {
        "2018": ["26MB", "26RB", "26RTB"],
        "2019": ["26FBT", "26MB", "26RB", "26RTB"],
        "2020": ["26FBT", "26MB", "26RB", "26RTB"],
        "2021": ["26FBT", "26MB", "26RB", "26RTB"],
        "2022": ["26FBT", "26MB", "26RB", "26RTB"],
        "2023": ["26FBT", "26MB", "26RB", "26RTB"],
        "2024": ["26FBT", "26MB", "26RB", "26RTB"],
        "2025": ["26FBT", "26RB", "26RTB"],
        "2026": ["26FBT", "26RB", "26RTB"]
      },
      lengthRange: [
        25,
        27
      ],
      weightRange: [
        12000,
        15500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        190000,
        275000
      ],
      engine: "Mercedes-Benz diesel (Sprinter 170 EXT)",
      horsepower: 188,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes Sprinter 170 EXT" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter 170 EXT" },
      ],
      chassis: "Mercedes Sprinter 170 EXT",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 46,
      grayWater: 34,
      blackWater: 34,
      generator: "Solar + lithium / optional LP",
      awningLength: 12,
      ceilingHeight: 80,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2018,
      description: "LTV Wonder XL — extended-wheelbase Class B+ for more living space than standard Wonder."
    },
    Serenity: {
      type: "Class B",
      floorplans: ["24CB", "S24"],
      floorplansByYear: {
        "2012": ["24CB"],
        "2013": ["24CB"],
        "2014": ["24CB"],
        "2015": ["24CB"],
        "2016": ["24CB"],
        "2017": ["24CB", "S24"],
        "2018": ["24CB", "S24"],
        "2019": ["24CB", "S24"],
        "2020": ["24CB", "S24"],
        "2021": ["24CB", "S24"],
        "2022": ["24CB", "S24"],
        "2023": ["24CB"],
        "2024": ["24CB"],
        "2025": ["24CB"],
        "2026": ["24CB"]
      },
      lengthRange: [
        24,
        25
      ],
      weightRange: [
        10000,
        12000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        140000,
        200000
      ],
      engine: "Mercedes-Benz diesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 22,
      generator: "Solar packages common",
      awningLength: 9,
      ceilingHeight: 74,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2010,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        }
      ],
      description: "LTV Serenity — no-slide luxury Class B Sprinter conversion."
    },
    Free: {
      type: "Class B",
      floorplans: ["25TBS", "25RL"],
      floorplansByYear: {
        "2018": ["25TBS"],
        "2019": ["25TBS", "25RL"],
        "2020": ["25TBS", "25RL"],
        "2021": ["25TBS", "25RL"],
        "2022": ["25TBS", "25RL"],
        "2023": ["25TBS"],
        "2024": ["25TBS"],
        "2025": ["25TBS"],
        "2026": ["25TBS"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        9500,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        130000,
        185000
      ],
      engine: "Mercedes-Benz diesel / Ford Transit (by year)",
      horsepower: 188,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes Sprinter / Ford Transit" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter / Ford Transit" },
      ],
      chassis: "Mercedes Sprinter / Ford Transit",
      fuelType: "Diesel / Gas",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 28,
      grayWater: 20,
      blackWater: 18,
      generator: "Solar packages common",
      awningLength: 9,
      ceilingHeight: 74,
      founded: 1965,
      warrantyYears: 2,
      yearStart: 2018,
      description: "LTV Free — adventure-oriented Class B with flexible sleeping."
    }
  },
  "Renegade RV": {
    Valencia: {
      type: "Super C",
      floorplans: ["35MB", "38RW", "38RB"],
      floorplansByYear: {
        "2014": ["35MB", "38RW"],
        "2015": ["35MB", "38RW"],
        "2016": ["35MB", "38RW"],
        "2017": ["35MB", "38RW"],
        "2018": ["35MB", "38RW"],
        "2019": ["35MB", "38RW", "38RB"],
        "2020": ["35MB", "38RW", "38RB"],
        "2021": ["35MB", "38RW", "38RB"],
        "2022": ["35MB", "38RW", "38RB"],
        "2023": ["35MB", "38RW", "38RB"],
        "2024": ["35MB", "38RW", "38RB"],
        "2025": ["35MB", "38RW"],
        "2026": ["35MB", "38RW"]
      },
      lengthRange: [
        35,
        38
      ],
      weightRange: [
        26000,
        34000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        289000,
        459000
      ],
      engine: "Cummins ISB / B6.7 Super C diesel",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner Super C / M2-class",
      transmission: "Allison automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Renegade Valencia — Super C diesel (REV specialty). Strong tow vs Class A gas.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins ISB / B6.7 Super C diesel",
          horsepower: 340,
          chassis: "Freightliner Super C"
        }
      ]
    },
    Verona: {
      type: "Super C",
      floorplans: ["36VSB", "40VRB", "40VSB"],
      floorplansByYear: {
        "2012": ["36VSB", "40VRB"],
        "2013": ["36VSB", "40VRB"],
        "2014": ["36VSB", "40VRB"],
        "2015": ["36VSB", "40VRB"],
        "2016": ["36VSB", "40VRB"],
        "2017": ["36VSB", "40VRB"],
        "2018": ["36VSB", "40VRB"],
        "2019": ["36VSB", "40VRB", "40VSB"],
        "2020": ["36VSB", "40VRB", "40VSB"],
        "2021": ["36VSB", "40VRB", "40VSB"],
        "2022": ["36VSB", "40VRB"],
        "2023": ["36VSB", "40VRB"],
        "2024": ["36VSB", "40VRB"],
        "2025": ["36VSB", "40VRB"],
        "2026": ["36VSB", "40VRB"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        28000,
        36000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        319000,
        499000
      ],
      engine: "Cummins Super C diesel 340–360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Renegade Verona — full Super C diesel living.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins Super C diesel 340–360HP",
          horsepower: 360,
          chassis: "Freightliner Super C"
        }
      ]
    },
    "Verona LE": {
      type: "Super C",
      floorplans: ["36VSB", "40VRB"],
      floorplansByYear: {
        "2018": ["36VSB", "40VRB"],
        "2019": ["36VSB", "40VRB"],
        "2020": ["36VSB", "40VRB"],
        "2021": ["36VSB", "40VRB"],
        "2022": ["36VSB", "40VRB"],
        "2023": ["36VSB", "40VRB"],
        "2024": ["36VSB", "40VRB"],
        "2025": ["36VSB", "40VRB"],
        "2026": ["36VSB", "40VRB"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        27000,
        35000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        289000,
        459000
      ],
      engine: "Cummins Super C diesel",
      horsepower: 340,
      chassis: "Freightliner Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Renegade Verona LE — value Super C packages on same diesel platform.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Cummins Super C diesel",
          horsepower: 340,
          chassis: "Freightliner Super C"
        }
      ]
    },
    "Classic Super C": {
      type: "Super C",
      floorplans: ["38FSB", "40FSB", "40FSBXL"],
      floorplansByYear: {
        "2010": ["38FSB", "40FSB"],
        "2011": ["38FSB", "40FSB"],
        "2012": ["38FSB", "40FSB"],
        "2013": ["38FSB", "40FSB"],
        "2014": ["38FSB", "40FSB"],
        "2015": ["38FSB", "40FSB"],
        "2016": ["38FSB", "40FSB"],
        "2017": ["38FSB", "40FSB"],
        "2018": ["38FSB", "40FSB"],
        "2019": ["38FSB", "40FSB", "40FSBXL"],
        "2020": ["38FSB", "40FSB", "40FSBXL"],
        "2021": ["38FSB", "40FSB", "40FSBXL"],
        "2022": ["38FSB", "40FSB"],
        "2023": ["38FSB", "40FSB"],
        "2024": ["38FSB", "40FSB"],
        "2025": ["38FSB", "40FSB"],
        "2026": ["38FSB", "40FSB"]
      },
      lengthRange: [
        38,
        40
      ],
      weightRange: [
        30000,
        38000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        349000,
        549000
      ],
      engine: "Cummins Super C diesel",
      horsepower: 360,
      chassis: "Freightliner Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Renegade Classic Super C — premium Super C diesel packages.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2005–2015 Super C — verify chassis badge"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Cummins Super C diesel",
          horsepower: 360,
          chassis: "Freightliner Super C"
        }
      ]
    },
    Ikon: {
      type: "Super C",
      floorplans: ["28DSB", "32DSB"],
      floorplansByYear: {
        "2018": ["28DSB", "32DSB"],
        "2019": ["28DSB", "32DSB"],
        "2020": ["28DSB", "32DSB"],
        "2021": ["28DSB", "32DSB"],
        "2022": ["28DSB", "32DSB"],
        "2023": ["28DSB", "32DSB"],
        "2024": ["28DSB", "32DSB"],
        "2025": ["28DSB", "32DSB"],
        "2026": ["28DSB", "32DSB"]
      },
      lengthRange: [
        28,
        32
      ],
      weightRange: [
        22000,
        30000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        249000,
        399000
      ],
      engine: "Ford Power Stroke 6.7L / Super C diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-550 or Freightliner Super C (by year)",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Renegade Ikon — compact Super C. Confirm Ford vs Freightliner chassis on the unit.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Super C diesel (Ford 6.7 or Cummins by chassis)",
          horsepower: 330,
          chassis: "Super C platform"
        }
      ]
    },
    Villagio: {
      type: "Class A Diesel",
      floorplans: ["24FW", "24RB"],
      floorplansByYear: {
        "2014": ["24FW", "24RB"],
        "2015": ["24FW", "24RB"],
        "2016": ["24FW", "24RB"],
        "2017": ["24FW", "24RB"],
        "2018": ["24FW", "24RB"],
        "2019": ["24FW", "24RB"],
        "2020": ["24FW", "24RB"],
        "2021": ["24FW", "24RB"],
        "2022": ["24FW", "24RB"],
        "2023": ["24FW", "24RB"],
        "2024": ["24FW", "24RB"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        11000,
        14000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        179000,
        279000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes Sprinter cowl",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2014,
      yearEnd: 2024,
      description: "Renegade Villagio — compact Sprinter-based diesel coach.",
      powertrainByYear: [
                {
          from: 2010,
          to: 2015,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Mercedes Sprinter cowl",
          notes: "2010–2015 mid/high diesel Class A"
        },
        {
          from: 2016,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Sprinter cowl"
        },
        {
          from: 2022,
          to: 2024,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          chassis: "Sprinter cowl"
        },
        
      ]
    },
    Villager: {
      type: "Class C",
      floorplans: ["25QBG", "25QBS"],
      floorplansByYear: {
        "2012": ["25QBG", "25QBS"],
        "2013": ["25QBG", "25QBS"],
        "2014": ["25QBG", "25QBS"],
        "2015": ["25QBG", "25QBS"],
        "2016": ["25QBG", "25QBS"],
        "2017": ["25QBG", "25QBS"],
        "2018": ["25QBG", "25QBS"],
        "2019": ["25QBG", "25QBS"],
        "2020": ["25QBG", "25QBS"],
        "2021": ["25QBG", "25QBS"],
        "2022": ["25QBG", "25QBS"],
        "2023": ["25QBG", "25QBS"],
        "2024": ["25QBG", "25QBS"],
        "2025": ["25QBG", "25QBS"],
        "2026": ["25QBG", "25QBS"]
      },
      lengthRange: [
        25,
        28
      ],
      weightRange: [
        11000,
        14500
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        99000,
        179000
      ],
      engine: "Ford 7.3L V8",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Renegade Villager — Ford Class C packages.",
      powertrainByYear: [
        {
          from: 2011,
          to: 2015,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2011–2015 Ford Class C cutaway"
        },
        {
          from: 2016,
          to: 2019,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford E-450"
        }
      ]
    },
    Vienna: {
      type: "Super C",
      floorplans: ["25VRB", "28VRB"],
      floorplansByYear: {
        "2020": ["25VRB", "28VRB"],
        "2021": ["25VRB", "28VRB"],
        "2022": ["25VRB", "28VRB"],
        "2023": ["25VRB", "28VRB"],
        "2024": ["25VRB", "28VRB"],
        "2025": ["25VRB", "28VRB"],
        "2026": ["25VRB", "28VRB"]
      },
      lengthRange: [
        25,
        28
      ],
      weightRange: [
        20000,
        28000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        239000,
        379000
      ],
      engine: "Cummins / Ford Super C diesel",
      horsepower: 330,
      chassis: "Super C platform",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Renegade Vienna — smaller Super C packages (verify availability by year).",
      powertrainByYear: [
        {
          from: 2020,
          to: 2026,
          engine: "Super C diesel",
          horsepower: 330,
          chassis: "Super C platform"
        }
      ]
    }
  },
  Dynamax: {
    "Isata 3": {
      type: "Class C",
      floorplans: ["24FW", "24CB", "26DS", "24CB SD", "28SS"],
      floorplansByYear: {
        "2016": ["24FW", "24CB", "26DS"],
        "2017": ["24FW", "24CB", "26DS"],
        "2018": ["24FW", "24CB", "26DS"],
        "2019": ["24FW", "24CB", "24CB SD", "26DS"],
        "2020": ["24FW", "24CB", "24CB SD", "26DS"],
        "2021": ["24FW", "24CB", "24CB SD", "26DS"],
        "2022": ["24FW", "24CB", "24CB SD", "26DS", "28SS"],
        "2023": ["24FW", "24CB", "24CB SD", "26DS", "28SS"],
        "2024": ["24FW", "24CB", "24CB SD", "26DS", "28SS"],
        "2025": ["24FW", "24CB", "24CB SD", "26DS", "28SS"],
        "2026": ["24FW", "24CB", "24CB SD", "26DS", "28SS"]
      },
      lengthRange: [
        24,
        29
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        129900,
        189000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel",
      horsepower: 211,
      torqueLbFt: 400,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 35,
      grayWater: 25,
      blackWater: 25,
      generator: "None (solar option) / optional",
      awningLength: 11,
      ceilingHeight: 78,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2016,
      description: "Dynamax Isata 3 — premium Ford Transit Class C with full-body paint and residential interior. Lighter/driveable alternative to E-450 Class C and Sprinter competitors.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2019,
          engine: "Ford Transit 3.5L EcoBoost V6",
          horsepower: 310,
          chassis: "Ford Transit"
        },
        {
          from: 2020,
          to: 2026,
          engine: "Ford Transit 3.5L EcoBoost V6 ~310HP",
          horsepower: 310,
          torqueLbFt: 400,
          chassis: "Ford Transit"
        }
      ]
    },
    "Isata 4": {
      type: "Class C",
      floorplans: ["24FW", "26DS", "26RK", "28SS", "28DS"],
      floorplansByYear: {
        "2019": ["24FW", "26DS", "26RK"],
        "2020": ["24FW", "26DS", "26RK"],
        "2021": ["24FW", "26DS", "26RK"],
        "2022": ["24FW", "26DS", "26RK", "28SS"],
        "2023": ["24FW", "26DS", "26RK", "28SS"],
        "2024": ["24FW", "26DS", "26RK", "28SS"],
        "2025": ["24FW", "26DS", "28SS", "28DS"],
        "2026": ["24FW", "26DS", "28SS", "28DS"]
      },
      lengthRange: [
        24,
        28
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        169900,
        249000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 28,
      blackWater: 28,
      generator: "Onan 3600W / diesel option",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Dynamax Isata 4 — Sprinter diesel Class C between Isata 3 (Transit) and Isata 5. Premium Dynamax paint and interior.",
      powertrainByYear: [
        {
          from: 2019,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel ~208HP",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    "Isata 5": {
      type: "Class C",
      floorplans: ["24FW", "26CB", "26DS", "27BH", "28SS", "30FW"],
      floorplansByYear: {
        "2014": ["24FW", "26CB", "26DS"],
        "2015": ["24FW", "26CB", "26DS"],
        "2016": ["24FW", "26CB", "26DS"],
        "2017": ["24FW", "26CB", "26DS", "27BH"],
        "2018": ["24FW", "26CB", "26DS", "27BH"],
        "2019": ["24FW", "26CB", "26DS", "27BH"],
        "2020": ["26CB", "26DS", "27BH", "28SS"],
        "2021": ["26CB", "26DS", "27BH", "28SS"],
        "2022": ["26CB", "26DS", "27BH", "28SS"],
        "2023": ["26CB", "26DS", "27BH", "28SS", "30FW"],
        "2024": ["26CB", "26DS", "27BH", "28SS", "30FW"],
        "2025": ["26CB", "26DS", "27BH", "28SS", "30FW"],
        "2026": ["26CB", "26DS", "27BH", "28SS", "30FW"]
      },
      lengthRange: [
        24,
        30
      ],
      weightRange: [
        10000,
        13000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        149900,
        239000
      ],
      engine: "Mercedes-Benz Sprinter turbodiesel",
      horsepower: 188,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 35,
      grayWater: 25,
      blackWater: 25,
      generator: "Onan 2800–3600W Diesel",
      awningLength: 11,
      ceilingHeight: 78,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2014,
      description: "Dynamax Isata 5 — flagship Sprinter diesel Class C. Full-body paint, high interior finish, strong used demand vs generic Sprinter C coaches.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2022,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel ~208HP",
          horsepower: 208,
          chassis: "Mercedes Sprinter"
        }
      ]
    },
    Europa: {
      type: "Super C",
      floorplans: ["31SS", "31RB", "33E", "34SS"],
      floorplansByYear: {
        "2010": ["31SS", "31RB"],
        "2011": ["31SS", "31RB"],
        "2012": ["31SS", "31RB"],
        "2013": ["31SS", "31RB", "33E"],
        "2014": ["31SS", "31RB", "33E"],
        "2015": ["31SS", "31RB", "33E"],
        "2016": ["31SS", "31RB", "33E", "34SS"],
        "2017": ["31SS", "31RB", "33E", "34SS"],
        "2018": ["31SS", "31RB", "33E", "34SS"],
        "2019": ["31SS", "31RB", "33E", "34SS"],
        "2020": ["31SS", "31RB", "33E", "34SS"],
        "2021": ["31SS", "31RB", "33E", "34SS"],
        "2022": ["31SS", "31RB", "34SS"],
        "2023": ["31SS", "31RB", "34SS"],
        "2024": ["31SS", "31RB", "34SS"],
        "2025": ["31SS", "34SS", "33E"],
        "2026": ["31SS", "34SS", "33E"]
      },
      lengthRange: [
        31,
        34
      ],
      weightRange: [
        22000,
        30000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        199900,
        329000
      ],
      engine: "Ford 6.7L Power Stroke Diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-550 Super Duty",
      transmission: "TorqShift automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 75,
      grayWater: 42,
      blackWater: 42,
      fuelCapacityGal: 68,
      generator: "Onan 5.5–6kW Diesel QD",
      awningLength: 17,
      ceilingHeight: 83,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Dynamax Europa — mid Super C on Ford F-550 with full-body paint and residential Dynamax interior. ~15k lb tow rating typical for F-550 Super C class.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford 6.7L Power Stroke Diesel",
          horsepower: 300,
          chassis: "Ford F-550"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Ford 6.7L Power Stroke Diesel ~330HP",
          horsepower: 330,
          torqueLbFt: 950,
          chassis: "Ford F-550 Super Duty",
          transmission: "TorqShift automatic"
        }
      ]
    },
    Force: {
      type: "Super C",
      floorplans: ["36FK", "37RB", "36BHK", "38TSK", "40TS"],
      floorplansByYear: {
        "2012": ["36FK", "37RB"],
        "2013": ["36FK", "37RB"],
        "2014": ["36FK", "37RB"],
        "2015": ["36FK", "37RB", "36BHK"],
        "2016": ["36FK", "37RB", "36BHK"],
        "2017": ["36FK", "37RB", "36BHK"],
        "2018": ["36FK", "37RB", "36BHK", "38TSK"],
        "2019": ["36FK", "37RB", "36BHK", "38TSK"],
        "2020": ["36FK", "37RB", "36BHK", "38TSK"],
        "2021": ["36FK", "37RB", "38TSK", "40TS"],
        "2022": ["36FK", "37RB", "38TSK", "40TS"],
        "2023": ["36FK", "37RB", "38TSK", "40TS"],
        "2024": ["36FK", "38TSK", "37RB", "40TS"],
        "2025": ["36FK", "38TSK", "37RB", "40TS"],
        "2026": ["36FK", "38TSK", "37RB", "40TS"]
      },
      lengthRange: [
        36,
        40
      ],
      weightRange: [
        26000,
        36000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        249900,
        399000
      ],
      engine: "Ford 6.7L Power Stroke Diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-600 Super Duty",
      transmission: "TorqShift automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 22000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 68,
      generator: "Onan 8kW Diesel QD",
      awningLength: 19,
      ceilingHeight: 84,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Dynamax Force — flagship Super C on heavy Ford Super Duty (F-600 class). Strong tow ratings, multi-slide living, full-body paint. Between premium Super C and mid diesel Class A.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2016,
          engine: "Ford 6.7L Power Stroke Diesel",
          horsepower: 300,
          chassis: "Ford F-550/F-600 Super C"
        },
        {
          from: 2017,
          to: 2026,
          engine: "Ford 6.7L Power Stroke Diesel ~330HP",
          horsepower: 330,
          torqueLbFt: 950,
          chassis: "Ford F-600 Super Duty",
          transmission: "TorqShift automatic"
        }
      ]
    },
    DynaQuest: {
      type: "Super C",
      floorplans: ["XL 3400", "XL 3700", "XL 3800", "XL 3900"],
      floorplansByYear: {
        "2008": ["XL 3400", "XL 3700"],
        "2009": ["XL 3400", "XL 3700"],
        "2010": ["XL 3400", "XL 3700"],
        "2011": ["XL 3400", "XL 3700", "XL 3800"],
        "2012": ["XL 3400", "XL 3700", "XL 3800"],
        "2013": ["XL 3400", "XL 3700", "XL 3800"],
        "2014": ["XL 3400", "XL 3700", "XL 3800", "XL 3900"],
        "2015": ["XL 3400", "XL 3700", "XL 3800", "XL 3900"],
        "2016": ["XL 3400", "XL 3700", "XL 3800", "XL 3900"],
        "2017": ["XL 3700", "XL 3800", "XL 3900"],
        "2018": ["XL 3700", "XL 3800", "XL 3900"],
        "2019": ["XL 3700", "XL 3800", "XL 3900"],
        "2020": ["XL 3700", "XL 3800", "XL 3900"],
        "2021": ["XL 3700", "XL 3800", "XL 3900"],
        "2022": ["XL 3700", "XL 3800", "XL 3900"],
        "2023": ["XL 3700", "XL 3800", "XL 3900"],
        "2024": ["XL 3700", "XL 3800", "XL 3900"],
        "2025": ["XL 3700", "XL 3800", "XL 3900"],
        "2026": ["XL 3700", "XL 3800", "XL 3900"]
      },
      lengthRange: [
        34,
        39
      ],
      weightRange: [
        28000,
        36000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        299900,
        459000
      ],
      engine: "Ford 6.7L Power Stroke Diesel",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-600 / Super C platform",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 20000,
      freshWater: 90,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 68,
      generator: "Onan 8kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2008,
      description: "Dynamax DynaQuest — luxury Super C with high-end residential interiors and strong tow capacity. XL floorplan family (3400–3900).",
      powertrainByYear: [
        {
          from: 2008,
          to: 2015,
          engine: "Ford 6.7L Power Stroke / Super C diesel (era)",
          horsepower: 300,
          chassis: "Ford Super C platform"
        },
        {
          from: 2016,
          to: 2026,
          engine: "Ford 6.7L Power Stroke Diesel ~330HP",
          horsepower: 330,
          torqueLbFt: 950,
          chassis: "Ford F-600 Super C"
        }
      ]
    },
    DX3: {
      type: "Super C",
      floorplans: ["34KD", "37KD", "37TS"],
      floorplansByYear: {
        "2015": ["34KD", "37KD"],
        "2016": ["34KD", "37KD"],
        "2017": ["34KD", "37KD"],
        "2018": ["34KD", "37KD", "37TS"],
        "2019": ["34KD", "37KD", "37TS"],
        "2020": ["34KD", "37KD", "37TS"],
        "2021": ["34KD", "37KD", "37TS"],
        "2022": ["34KD", "37KD", "37TS"],
        "2023": ["34KD", "37KD", "37TS"],
        "2024": ["34KD", "37TS"],
        "2025": ["34KD", "37TS"],
        "2026": ["34KD", "37TS"]
      },
      lengthRange: [
        34,
        37
      ],
      weightRange: [
        24000,
        32000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        219900,
        349000
      ],
      engine: "Cummins L9 360HP",
      horsepower: 360,
      chassis: "Freightliner M2 106 Plus",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 5.5–8kW Diesel",
      awningLength: 16,
      ceilingHeight: 83,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Dynamax DX3 — Super C package in the Dynamax family (confirm year availability). Power Stroke diesel Super C living with Dynamax finish level.",
      powertrainByYear: [
        {
          from: 2015,
          to: 2026,
          engine: "Ford 6.7L Power Stroke Diesel",
          horsepower: 330,
          chassis: "Ford F-550 Super C"
        }
      ]
    },
    "Grand Sport": {
      type: "Super C",
      floorplans: ["3300", "3500", "3700"],
      floorplansByYear: {
        "2005": ["3300", "3500"],
        "2006": ["3300", "3500"],
        "2007": ["3300", "3500"],
        "2008": ["3300", "3500"],
        "2009": ["3300", "3500", "3700"],
        "2010": ["3300", "3500", "3700"],
        "2011": ["3300", "3500", "3700"],
        "2012": ["3300", "3500", "3700"],
        "2013": ["3500", "3700"],
        "2014": ["3500", "3700"],
        "2015": ["3500", "3700"],
        "2016": ["3500", "3700"]
      },
      lengthRange: [
        33,
        37
      ],
      weightRange: [
        22000,
        32000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        149900,
        279000
      ],
      engine: "Cummins / Ford Super C diesel (era)",
      horsepower: 300,
      chassis: "Freightliner / Ford Super C",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan Diesel QD",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1997,
      warrantyYears: 2,
      yearStart: 2005,
      yearEnd: 2016,
      description: "Dynamax Grand Sport — earlier Super C / coach line (classic–recent era). Succeeded/parallel to later Europa–Force–DynaQuest lineup. Verify build sheet for chassis/engine.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2016,
          engine: "Cummins or Ford Super C diesel (by chassis year)",
          horsepower: 300,
          chassis: "Super C platform",
          notes: "Confirm chassis badge — era Super C varies"
        }
      ]
    }
  },
  "Storyteller Overland": {
    MODE: {
      type: "Class B",
      floorplans: ["MODE", "Standard", "144", "170"],
      floorplansByYear: {
        "2018": ["MODE", "Standard"],
        "2019": ["MODE", "Standard"],
        "2020": ["MODE", "Standard", "144"],
        "2021": ["MODE", "Standard", "144", "170"],
        "2022": ["MODE", "Standard", "144", "170"],
        "2023": ["MODE", "Standard", "144", "170"],
        "2024": ["MODE", "Standard", "144", "170"],
        "2025": ["MODE", "Standard", "144", "170"],
        "2026": ["MODE", "Standard", "144", "170"]
      },
      lengthRange: [
        19,
        24
      ],
      weightRange: [
        8500,
        11000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        160000,
        230000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 0,
      generator: "Solar + lithium standard packages",
      awningLength: 0,
      ceilingHeight: 74,
      founded: 2016,
      warrantyYears: 2,
      yearStart: 2018,
      mpgHighwayEst: 16,
      description: "Storyteller MODE — adventure Class B on Sprinter with off-grid power focus. Cassette/composting black common (0 gal tank). Live Grok fills exact UVW.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2026,
          engine: "Mercedes-Benz turbodiesel (I4/V6 by year)",
          horsepower: 188,
          chassis: "Mercedes Sprinter 144 / 170"
        }
      ]
    },
    "Beast MODE": {
      type: "Class B",
      floorplans: ["Beast MODE", "Beast", "4x4"],
      floorplansByYear: {
        "2019": ["Beast MODE", "Beast"],
        "2020": ["Beast MODE", "Beast", "4x4"],
        "2021": ["Beast MODE", "Beast", "4x4"],
        "2022": ["Beast MODE", "Beast", "4x4"],
        "2023": ["Beast MODE", "Beast", "4x4"],
        "2024": ["Beast MODE", "Beast", "4x4"],
        "2025": ["Beast MODE", "Beast", "4x4"],
        "2026": ["Beast MODE", "Beast", "4x4"]
      },
      lengthRange: [
        19,
        23
      ],
      weightRange: [
        9000,
        11500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        180000,
        260000
      ],
      engine: "Mercedes-Benz turbodiesel AWD/4x4",
      horsepower: 211,
      powertrainByYear: [
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter AWD" },
      ],
      chassis: "Mercedes-Benz Sprinter AWD",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 22,
      blackWater: 0,
      generator: "High-capacity solar + lithium",
      awningLength: 0,
      ceilingHeight: 74,
      founded: 2016,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Storyteller Beast MODE — AWD/adventure-pack MODE sibling for off-pavement travel."
    },
    "Classic MODE": {
      type: "Class B",
      floorplans: ["Classic", "Classic MODE"],
      floorplansByYear: {
        "2021": ["Classic", "Classic MODE"],
        "2022": ["Classic", "Classic MODE"],
        "2023": ["Classic", "Classic MODE"],
        "2024": ["Classic", "Classic MODE"],
        "2025": ["Classic", "Classic MODE"],
        "2026": ["Classic", "Classic MODE"]
      },
      lengthRange: [
        19,
        22
      ],
      weightRange: [
        8500,
        10500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        155000,
        220000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      horsepower: 188,
      powertrainByYear: [
        { from: 2021, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter" },
      ],
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 20,
      blackWater: 0,
      generator: "Solar + lithium",
      awningLength: 0,
      ceilingHeight: 74,
      founded: 2016,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Storyteller Classic MODE — refined interior package on the MODE platform."
    }
  },
  "Coach House": {
    "Platinum II": {
      type: "Class B+",
      floorplans: ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
      floorplansByYear: {
        "2015": ["240DQ", "240SQ"],
        "2016": ["240DQ", "240SQ", "240DRT", "240SRT"],
        "2017": ["240DQ", "240SQ", "240DRT", "240SRT"],
        "2018": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ"],
        "2019": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2020": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2021": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2022": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2023": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2024": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2025": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"],
        "2026": ["240DQ", "240SQ", "240DRT", "240SRT", "241XL DQ", "241XL SQ", "241XL RQ"]
      },
      lengthRange: [
        24,
        26
      ],
      weightRange: [
        10000,
        12500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        180000,
        280000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel ~211HP",
      chassis: "Mercedes-Benz Sprinter 3500",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 35,
      grayWater: 28,
      blackWater: 25,
      generator: "Onan / LP optional + solar packages",
      awningLength: 12,
      ceilingHeight: 76,
      founded: 1985,
      warrantyYears: 2,
      yearStart: 2015,
      mpgHighwayEst: 18,
      description: "Coach House Platinum II — hand-built Florida Class B+ on Sprinter. XL = slideout. DQ/SQ/DRT/SRT layout codes.",
      powertrainByYear: [
        {
          from: 2015,
          to: 2018,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel ~188HP",
          horsepower: 188,
          chassis: "Mercedes Sprinter 3500"
        },
        {
          from: 2019,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel ~211HP",
          horsepower: 211,
          chassis: "Mercedes Sprinter 3500"
        }
      ]
    },
    Platinum: {
      type: "Class B+",
      floorplans: ["220TB", "221", "241", "241XL"],
      floorplansByYear: {
        "2012": ["220TB", "221"],
        "2013": ["220TB", "221"],
        "2014": ["220TB", "221", "241"],
        "2015": ["220TB", "221", "241"],
        "2016": ["220TB", "221", "241", "241XL"],
        "2017": ["220TB", "221", "241", "241XL"],
        "2018": ["220TB", "221", "241", "241XL"],
        "2019": ["220TB", "221", "241", "241XL"],
        "2020": ["220TB", "221", "241", "241XL"],
        "2021": ["220TB", "241", "241XL"],
        "2022": ["220TB", "241", "241XL"],
        "2023": ["220TB", "241", "241XL"],
        "2024": ["220TB", "241", "241XL"],
        "2025": ["220TB", "241", "241XL"],
        "2026": ["220TB", "241", "241XL"]
      },
      lengthRange: [
        22,
        25
      ],
      weightRange: [
        9500,
        12000
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        160000,
        250000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 32,
      grayWater: 26,
      blackWater: 22,
      generator: "Solar packages common",
      awningLength: 10,
      ceilingHeight: 76,
      founded: 1985,
      warrantyYears: 2,
      yearStart: 2010,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        }
      ],
      description: "Coach House Platinum — compact luxury Class B+ predecessor/companion to Platinum II."
    }
  },
  "Midwest Automotive Designs": {
    Passage: {
      type: "Class B",
      floorplans: ["FD2", "MD2", "MD3", "MD4", "MD2F"],
      floorplansByYear: {
        "2016": ["FD2", "MD2"],
        "2017": ["FD2", "MD2"],
        "2018": ["FD2", "MD2", "MD4"],
        "2019": ["FD2", "MD2", "MD3", "MD4"],
        "2020": ["FD2", "MD2", "MD3", "MD4"],
        "2021": ["FD2", "MD2", "MD3", "MD4"],
        "2022": ["FD2", "MD2", "MD3", "MD4"],
        "2023": ["FD2", "MD2", "MD3", "MD4", "MD2F"],
        "2024": ["FD2", "MD2", "MD3", "MD4", "MD2F"],
        "2025": ["FD2", "MD2", "MD3", "MD4", "MD2F"],
        "2026": ["FD2", "MD2", "MD3", "MD4", "MD2F"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        8500,
        11500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        170000,
        280000
      ],
      engine: "Mercedes-Benz turbodiesel / Ford Transit (MD2F)",
      chassis: "Mercedes Sprinter / Ford Transit",
      fuelType: "Diesel / Gas",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 20,
      blackWater: 0,
      generator: "Solar + lithium packages",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 2000,
      warrantyYears: 2,
      yearStart: 2016,
      mpgHighwayEst: 16,
      description: "Midwest Passage — luxury Class B (FD2 144-in / MD2–MD4 170 EXT). MD2F = Ford Transit gas variant.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2026,
          engine: "Mercedes turbodiesel (Sprinter) or Ford EcoBoost (MD2F)",
          horsepower: 188,
          chassis: "Sprinter 144/170 or Transit",
          notes: "Confirm chassis badge"
        }
      ]
    },
    Weekender: {
      type: "Class B",
      floorplans: ["Weekender", "144", "170"],
      floorplansByYear: {
        "2010": ["Weekender"],
        "2011": ["Weekender"],
        "2012": ["Weekender"],
        "2013": ["Weekender", "144"],
        "2014": ["Weekender", "144"],
        "2015": ["Weekender", "144", "170"],
        "2016": ["Weekender", "144", "170"],
        "2017": ["Weekender", "144", "170"],
        "2018": ["Weekender", "144", "170"],
        "2019": ["Weekender", "144", "170"],
        "2020": ["Weekender", "144", "170"],
        "2021": ["Weekender", "144", "170"],
        "2022": ["Weekender", "144", "170"],
        "2023": ["Weekender", "144", "170"],
        "2024": ["Weekender", "144", "170"],
        "2025": ["Weekender", "144", "170"],
        "2026": ["Weekender", "144", "170"]
      },
      lengthRange: [
        19,
        24
      ],
      weightRange: [
        8000,
        11000
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        140000,
        230000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      horsepower: 188,
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 25,
      grayWater: 18,
      blackWater: 0,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 2000,
      warrantyYears: 2,
      yearStart: 2000,
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        },
        {
          from: 2000,
          to: 2005,
          engine: "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
          horsepower: 154,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Early Sprinter era — ~154–188 HP by year"
        }
      ],
      description: "Midwest Weekender — original Midwest Sprinter conversion nameplate (Passage is modern descendant)."
    },
    "Passage Daycruiser": {
      type: "Class B",
      floorplans: ["Daycruiser", "DC"],
      floorplansByYear: {
        "2018": ["Daycruiser", "DC"],
        "2019": ["Daycruiser", "DC"],
        "2020": ["Daycruiser", "DC"],
        "2021": ["Daycruiser", "DC"],
        "2022": ["Daycruiser", "DC"],
        "2023": ["Daycruiser", "DC"],
        "2024": ["Daycruiser", "DC"],
        "2025": ["Daycruiser", "DC"],
        "2026": ["Daycruiser", "DC"]
      },
      lengthRange: [
        19,
        23
      ],
      weightRange: [
        8500,
        10500
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        160000,
        240000
      ],
      engine: "Mercedes-Benz turbodiesel (Sprinter)",
      horsepower: 188,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz turbodiesel (Sprinter)", horsepower: 188, chassis: "Mercedes Sprinter" },
        { from: 2019, to: 2026, engine: "Mercedes-Benz 2.0L I4 turbodiesel", horsepower: 188, chassis: "Mercedes Sprinter" },
      ],
      chassis: "Mercedes Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 20,
      grayWater: 15,
      blackWater: 0,
      generator: "Solar packages",
      awningLength: 8,
      ceilingHeight: 74,
      founded: 2000,
      warrantyYears: 2,
      yearStart: 2018,
      description: "Midwest Passage Daycruiser — lounge-forward Class B day/ overnight layout."
    }
  },
  "Outdoors RV": {
    "Timber Ridge": {
      type: "Travel Trailer",
      floorplans: ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
      floorplansByYear: {
        "2010": ["24RKS", "26RLS"],
        "2011": ["24RKS", "26RLS"],
        "2012": ["24RKS", "26RLS"],
        "2013": ["24RKS", "26RLS"],
        "2014": ["24RKS", "26RLS", "28BHS"],
        "2015": ["24RKS", "26RLS", "28BHS"],
        "2016": ["24RKS", "26RLS", "28BHS"],
        "2017": ["24RKS", "26RLS", "28BHS"],
        "2018": ["24RKS", "26RLS", "28BHS"],
        "2019": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2020": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2021": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2022": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2023": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2024": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2025": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"],
        "2026": ["24RKS", "26RLS", "28BHS", "28DBS", "21FBS"]
      },
      lengthRange: [
        21,
        29
      ],
      weightRange: [
        6000,
        8500
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        44900,
        74000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 55,
      grayWater: 38,
      blackWater: 38,
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 3,
      yearStart: 2010,
      description: "The Timber Ridge is Outdoors RV flagship four-season travel trailer — all-aluminum frame, heated and fully enclosed underbelly, and a 3-year structural warranty. Built in La Grande, Oregon for serious four-season Western camping at elevations and temperatures that destroy lesser trailers.",
      garageWidthFt: 8.2,
      garageHeightIn: 84,
      rampWidthFt: 8,
      fuelStationGal: 30,
      generator: "Onan 5500W Gas (prep / optional)",
      generatorFuelGal: 30
    },
    "Back Country": {
      type: "Travel Trailer",
      floorplans: ["20CBD", "21BD", "23CBS", "25DBS"],
      floorplansByYear: {
        "2010": ["20CBD"],
        "2011": ["20CBD"],
        "2012": ["20CBD"],
        "2013": ["20CBD"],
        "2014": ["20CBD", "21BD"],
        "2015": ["20CBD", "21BD"],
        "2016": ["20CBD", "21BD"],
        "2017": ["20CBD", "21BD"],
        "2018": ["20CBD", "21BD"],
        "2019": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2020": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2021": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2022": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2023": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2024": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2025": ["20CBD", "21BD", "23CBS", "25DBS"],
        "2026": ["20CBD", "21BD", "23CBS", "25DBS"]
      },
      lengthRange: [
        20,
        26
      ],
      weightRange: [
        4800,
        7000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        34900,
        59000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 46,
      grayWater: 30,
      blackWater: 30,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1997,
      warrantyYears: 3,
      yearStart: 2010,
      description: "The Back Country is Outdoors RV off-road-capable lightweight — aluminum frame, off-road tires, raised suspension, and a fully enclosed underbelly built for remote Western terrain. For boondockers who need a trailer that goes where they go without sacrificing four-season protection."
    },
    "Wind River": {
      type: "Travel Trailer",
      floorplans: ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
      floorplansByYear: {
        "2010": ["230RBS"],
        "2011": ["230RBS"],
        "2012": ["230RBS"],
        "2013": ["230RBS"],
        "2014": ["230RBS", "260RKSLE"],
        "2015": ["230RBS", "260RKSLE"],
        "2016": ["230RBS", "260RKSLE"],
        "2017": ["230RBS", "260RKSLE"],
        "2018": ["230RBS", "260RKSLE"],
        "2019": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2020": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2021": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2022": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2023": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2024": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2025": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"],
        "2026": ["230RBS", "260RKSLE", "280RKSLE", "250RDSLE"]
      },
      lengthRange: [
        23,
        29
      ],
      weightRange: [
        5800,
        8000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        39900,
        64000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 50,
      grayWater: 34,
      blackWater: 34,
      awningLength: 13,
      ceilingHeight: 79,
      founded: 1997,
      warrantyYears: 3,
      yearStart: 2010,
      description: "The Wind River is Outdoors RV premium travel trailer — upscale residential finishes, extra extreme-temperature insulation, and the same all-aluminum frame and heated underbelly as the Timber Ridge. One of the best-built trailers under $65k from a manufacturer serious about four-season quality."
    }
  },
  "Northwood Manufacturing": {
    "Arctic Fox": {
      type: "Travel Trailer",
      floorplans: ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
      floorplansByYear: {
        "2005": ["22G", "25Y"],
        "2006": ["22G", "25Y"],
        "2007": ["22G", "25Y"],
        "2008": ["22G", "25Y"],
        "2009": ["22G", "25Y"],
        "2010": ["22G", "25Y"],
        "2011": ["22G", "25Y", "27-5L", "29-5L"],
        "2012": ["22G", "25Y", "27-5L", "29-5L"],
        "2013": ["22G", "25Y", "27-5L", "29-5L"],
        "2014": ["22G", "25Y", "27-5L", "29-5L"],
        "2015": ["22G", "25Y", "27-5L", "29-5L"],
        "2016": ["22G", "25Y", "27-5L", "29-5L"],
        "2017": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2018": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2019": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2020": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2021": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2022": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2023": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2024": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2025": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"],
        "2026": ["22G", "25Y", "27-5L", "29-5L", "32-5L", "22FB"]
      },
      lengthRange: [
        22,
        33
      ],
      weightRange: [
        6500,
        10000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        44900,
        79000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 65,
      grayWater: 42,
      blackWater: 42,
      awningLength: 15,
      ceilingHeight: 80,
      founded: 1993,
      warrantyYears: 1,
      yearStart: 2005,
      description: "The Arctic Fox is Northwood gold-standard four-season trailer — vacuum-bonded aluminum walls, arctic-rated plumbing, heated and fully enclosed underbelly, engineered for -40F winters and 110F desert summers. Built in La Grande, Oregon with real four-season capability that most all-season trailers cannot match."
    },
    Nash: {
      type: "Travel Trailer",
      floorplans: ["17K", "22H", "23D", "25G", "24B"],
      floorplansByYear: {
        "2005": ["17K", "22H"],
        "2006": ["17K", "22H"],
        "2007": ["17K", "22H"],
        "2008": ["17K", "22H"],
        "2009": ["17K", "22H"],
        "2010": ["17K", "22H"],
        "2011": ["17K", "22H", "23D"],
        "2012": ["17K", "22H", "23D"],
        "2013": ["17K", "22H", "23D"],
        "2014": ["17K", "22H", "23D"],
        "2015": ["17K", "22H", "23D"],
        "2016": ["17K", "22H", "23D"],
        "2017": ["17K", "22H", "23D", "25G", "24B"],
        "2018": ["17K", "22H", "23D", "25G", "24B"],
        "2019": ["17K", "22H", "23D", "25G", "24B"],
        "2020": ["17K", "22H", "23D", "25G", "24B"],
        "2021": ["17K", "22H", "23D", "25G", "24B"],
        "2022": ["17K", "22H", "23D", "25G", "24B"],
        "2023": ["17K", "22H", "23D", "25G", "24B"],
        "2024": ["17K", "22H", "23D", "25G", "24B"],
        "2025": ["17K", "22H", "23D", "25G", "24B"],
        "2026": ["17K", "22H", "23D", "25G", "24B"]
      },
      lengthRange: [
        17,
        26
      ],
      weightRange: [
        3800,
        6500
      ],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [
        24900,
        44000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 28,
      blackWater: 28,
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1993,
      warrantyYears: 1,
      yearStart: 2005,
      description: "The Nash is Northwood entry-level four-season trailer — bringing Arctic Fox insulation standards and aluminum construction to the under-$35k segment. Towable by most half-ton trucks with genuine thermal protection that entry-level fiberglass competitors cannot offer at the same price."
    },
    "Wolf Creek": {
      type: "Truck Camper",
      floorplans: ["850", "890", "1050"],
      floorplansByYear: {
        "2005": ["850"],
        "2006": ["850"],
        "2007": ["850"],
        "2008": ["850"],
        "2009": ["850"],
        "2010": ["850"],
        "2011": ["850", "890"],
        "2012": ["850", "890"],
        "2013": ["850", "890"],
        "2014": ["850", "890"],
        "2015": ["850", "890"],
        "2016": ["850", "890"],
        "2017": ["850", "890", "1050"],
        "2018": ["850", "890", "1050"],
        "2019": ["850", "890", "1050"],
        "2020": ["850", "890", "1050"],
        "2021": ["850", "890", "1050"],
        "2022": ["850", "890", "1050"],
        "2023": ["850", "890", "1050"],
        "2024": ["850", "890", "1050"],
        "2025": ["850", "890", "1050"],
        "2026": ["850", "890", "1050"]
      },
      lengthRange: [
        8,
        11
      ],
      weightRange: [
        2200,
        3200
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        29900,
        49000
      ],
      chassis: "N/A",
      fuelType: "N/A (truck camper)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 32,
      grayWater: 22,
      blackWater: 22,
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1993,
      warrantyYears: 1,
      yearStart: 2005,
      description: "The Wolf Creek is Northwood premium truck camper — vacuum-bonded fiberglass construction, full wet bath, and Arctic Fox-grade insulation in a truck-mounted platform. The 850 fits short-bed trucks while the 1050 delivers full residential amenities for serious boondockers on long-haul backcountry adventures."
    }
  },
  "Oliver Travel Trailers": {
    "Legacy Elite": {
      type: "Travel Trailer",
      floorplans: ["Standard", "Bunk"],
      floorplansByYear: {
        "2008": ["Standard"],
        "2009": ["Standard"],
        "2010": ["Standard"],
        "2011": ["Standard"],
        "2012": ["Standard"],
        "2013": ["Standard", "Bunk"],
        "2014": ["Standard", "Bunk"],
        "2015": ["Standard", "Bunk"],
        "2016": ["Standard", "Bunk"],
        "2017": ["Standard", "Bunk"],
        "2018": ["Standard", "Bunk"],
        "2019": ["Standard", "Bunk"],
        "2020": ["Standard", "Bunk"],
        "2021": ["Standard", "Bunk"],
        "2022": ["Standard", "Bunk"],
        "2023": ["Standard", "Bunk"],
        "2024": ["Standard", "Bunk"],
        "2025": ["Standard", "Bunk"],
        "2026": ["Standard", "Bunk"]
      },
      lengthRange: [
        23,
        23
      ],
      weightRange: [
        5700,
        6200
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        69900,
        84000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      awningLength: 10,
      ceilingHeight: 78,
      founded: 2007,
      warrantyYears: 3,
      yearStart: 2008,
      description: "The Legacy Elite is Oliver's hand-laid fiberglass sandwich-construction travel trailer — built in Hohenwald, Tennessee with no wood in the structure, a 3-year warranty, and an owner satisfaction rate that is the envy of the entire industry. Extremely high resale value."
    },
    "Legacy Elite II": {
      type: "Travel Trailer",
      floorplans: ["Standard", "Twin Bed"],
      floorplansByYear: {
        "2012": ["Standard"],
        "2013": ["Standard"],
        "2014": ["Standard"],
        "2015": ["Standard"],
        "2016": ["Standard", "Twin Bed"],
        "2017": ["Standard", "Twin Bed"],
        "2018": ["Standard", "Twin Bed"],
        "2019": ["Standard", "Twin Bed"],
        "2020": ["Standard", "Twin Bed"],
        "2021": ["Standard", "Twin Bed"],
        "2022": ["Standard", "Twin Bed"],
        "2023": ["Standard", "Twin Bed"],
        "2024": ["Standard", "Twin Bed"],
        "2025": ["Standard", "Twin Bed"],
        "2026": ["Standard", "Twin Bed"]
      },
      lengthRange: [
        24,
        24
      ],
      weightRange: [
        6700,
        7200
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        82900,
        99000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 52,
      grayWater: 36,
      blackWater: 36,
      awningLength: 11,
      ceilingHeight: 80,
      founded: 2007,
      warrantyYears: 3,
      yearStart: 2012,
      description: "The Legacy Elite II is Oliver's larger flagship — a full-width rear bathroom, bigger holding tanks, and the same zero-wood fiberglass sandwich construction that makes Oliver trailers virtually impervious to delamination, leaks, and rot. Hands-down the highest owner satisfaction score in the travel trailer segment."
    }
  },
  Regency: {
    "Ultra Brougham": {
      type: "Class B",
      floorplans: ["25QB", "25HB", "28QB", "28RK"],
      floorplansByYear: {
        "2015": ["25QB"],
        "2016": ["25QB"],
        "2017": ["25QB"],
        "2018": ["25QB", "25HB"],
        "2019": ["25QB", "25HB"],
        "2020": ["25QB", "25HB"],
        "2021": ["25QB", "25HB"],
        "2022": ["25QB", "25HB", "28QB", "28RK"],
        "2023": ["25QB", "25HB", "28QB", "28RK"],
        "2024": ["25QB", "25HB", "28QB", "28RK"],
        "2025": ["25QB", "25HB", "28QB", "28RK"],
        "2026": ["25QB", "25HB", "28QB", "28RK"]
      },
      lengthRange: [
        25,
        29
      ],
      weightRange: [
        12500,
        15500
      ],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [
        229900,
        369000
      ],
      engine: "Mercedes-Benz 3.0L V6",
      horsepower: 188,
      chassis: "Mercedes Sprinter 170 EXT",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "None (lithium 400Ah + 600W solar)",
      awningLength: 12,
      ceilingHeight: 78,
      founded: 1967,
      warrantyYears: 3,
      yearStart: 2015,
      powertrainByYear: [
        {
          from: 2015,
          to: 2015,
          engine: "Mercedes-Benz turbodiesel (Sprinter)",
          horsepower: 188,
          chassis: "Mercedes-Benz Sprinter",
          notes: "Sprinter OM642 / era diesel ~188 HP class"
        }
      ],
      description: "The Regency Ultra Brougham is the most luxurious Class B conversion available — hand-built in limited production on the Sprinter 170 EXT with a full-width slideout, genuine hardwood cabinetry, heated Italian tile floors, and a residential wet bath. A 400Ah lithium bank and 600W solar run everything indefinitely off-grid. Waiting list typically 8-12 months."
    }
  },
  DRV: {
    "Mobile Suites": {
      type: "Fifth Wheel",
      floorplans: ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
      floorplansByYear: {
        "2008": ["36RSSB3"],
        "2009": ["36RSSB3"],
        "2010": ["36RSSB3"],
        "2011": ["36RSSB3"],
        "2012": ["36RSSB3"],
        "2013": ["36RSSB3", "38RSSB3"],
        "2014": ["36RSSB3", "38RSSB3"],
        "2015": ["36RSSB3", "38RSSB3"],
        "2016": ["36RSSB3", "38RSSB3"],
        "2017": ["36RSSB3", "38RSSB3"],
        "2018": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2019": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2020": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2021": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2022": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2023": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2024": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2025": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"],
        "2026": ["36RSSB3", "38RSSB3", "41RSSB4", "44RSSB4"]
      },
      lengthRange: [
        36,
        44
      ],
      weightRange: [
        18000,
        22000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        149900,
        249000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 80,
      grayWater: 56,
      blackWater: 56,
      awningLength: 20,
      ceilingHeight: 90,
      founded: 2002,
      warrantyYears: 2,
      yearStart: 2008,
      description: "The DRV Mobile Suites is the gold standard for luxury residential fifth wheels — a 9-ft ceiling height, hardwood cabinetry, king master suite, washer/dryer, and build quality that competes directly with entry-level Class A motorhomes."
    },
    Tradition: {
      type: "Fifth Wheel",
      floorplans: ["350RLS", "355LBSS", "390RLS"],
      floorplansByYear: {
        "2008": ["350RLS"],
        "2009": ["350RLS"],
        "2010": ["350RLS"],
        "2011": ["350RLS"],
        "2012": ["350RLS"],
        "2013": ["350RLS", "355LBSS"],
        "2014": ["350RLS", "355LBSS"],
        "2015": ["350RLS", "355LBSS"],
        "2016": ["350RLS", "355LBSS"],
        "2017": ["350RLS", "355LBSS"],
        "2018": ["350RLS", "355LBSS", "390RLS"],
        "2019": ["350RLS", "355LBSS", "390RLS"],
        "2020": ["350RLS", "355LBSS", "390RLS"],
        "2021": ["350RLS", "355LBSS", "390RLS"],
        "2022": ["350RLS", "355LBSS", "390RLS"],
        "2023": ["350RLS", "355LBSS", "390RLS"],
        "2024": ["350RLS", "355LBSS", "390RLS"],
        "2025": ["350RLS", "355LBSS", "390RLS"],
        "2026": ["350RLS", "355LBSS", "390RLS"]
      },
      lengthRange: [
        35,
        40
      ],
      weightRange: [
        16000,
        20000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        99900,
        149000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 70,
      grayWater: 48,
      blackWater: 48,
      awningLength: 18,
      ceilingHeight: 86,
      founded: 2002,
      warrantyYears: 2,
      yearStart: 2008,
      description: "The DRV Tradition is the entry to the DRV luxury lineup — 8.5-ft ceilings, triple slideouts, solid surface counters, and a residential master bath that makes every competing fifth wheel feel ordinary."
    },
    "Full House": {
      type: "Toy Hauler",
      floorplans: ["LX455", "LX450", "MX450"],
      floorplansByYear: {
        "2010": ["LX455"],
        "2011": ["LX455"],
        "2012": ["LX455"],
        "2013": ["LX455"],
        "2014": ["LX455", "LX450"],
        "2015": ["LX455", "LX450"],
        "2016": ["LX455", "LX450"],
        "2017": ["LX455", "LX450"],
        "2018": ["LX455", "LX450"],
        "2019": ["LX455", "LX450", "MX450"],
        "2020": ["LX455", "LX450", "MX450"],
        "2021": ["LX455", "LX450", "MX450"],
        "2022": ["LX455", "LX450", "MX450"],
        "2023": ["LX455", "LX450", "MX450"],
        "2024": ["LX455", "LX450", "MX450"],
        "2025": ["LX455", "LX450", "MX450"],
        "2026": ["LX455", "LX450", "MX450"]
      },
      lengthRange: [
        42,
        46
      ],
      weightRange: [
        18000,
        22000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        199900,
        299000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 102,
      founded: 2002,
      warrantyYears: 2,
      yearStart: 2010,
      generator: "Onan 5500–8000W Gas/Diesel package",
      garageLengthFt: 14,
      garageWidthFt: 8.4,
      garageHeightIn: 90,
      garageCapacityLbs: 5000,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 full-size UTVs + workshop",
      description: "DRV Full House is a luxury toy hauler fifth wheel — residential DRV quality with a true cargo garage for toys and living."
    },
    "Elite Suites": {
      type: "Fifth Wheel",
      floorplans: ["38RSSA", "40KSSB", "43RSSB"],
      floorplansByYear: {
        "2012": ["38RSSA"],
        "2013": ["38RSSA"],
        "2014": ["38RSSA"],
        "2015": ["38RSSA"],
        "2016": ["38RSSA", "40KSSB"],
        "2017": ["38RSSA", "40KSSB"],
        "2018": ["38RSSA", "40KSSB"],
        "2019": ["38RSSA", "40KSSB"],
        "2020": ["38RSSA", "40KSSB", "43RSSB"],
        "2021": ["38RSSA", "40KSSB", "43RSSB"],
        "2022": ["38RSSA", "40KSSB", "43RSSB"],
        "2023": ["38RSSA", "40KSSB", "43RSSB"],
        "2024": ["38RSSA", "40KSSB", "43RSSB"],
        "2025": ["38RSSA", "40KSSB", "43RSSB"],
        "2026": ["38RSSA", "40KSSB", "43RSSB"]
      },
      lengthRange: [
        38,
        44
      ],
      weightRange: [
        16000,
        21000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        169900,
        269000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 85,
      grayWater: 60,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 102,
      founded: 2002,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Elite Suites sits in the DRV luxury ladder with residential height, hardwood, and long-term full-time design."
    }
  },
  Brinkley: {
    "Model Z": {
      type: "Fifth Wheel",
      floorplans: ["2900", "3100", "3500", "3700"],
      floorplansByYear: {
        "2020": ["2900", "3100", "3500"],
        "2021": ["2900", "3100", "3500"],
        "2022": ["2900", "3100", "3500", "3700"],
        "2023": ["2900", "3100", "3500", "3700"],
        "2024": ["2900", "3100", "3500", "3700"],
        "2025": ["2900", "3100", "3500", "3700"],
        "2026": ["3100", "3500", "3700"]
      },
      lengthRange: [
        29,
        40
      ],
      weightRange: [
        9000,
        14000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        89000,
        159000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 75,
      grayWater: 50,
      blackWater: 50,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Brinkley Model Z — premium fifth wheel. High build quality, residential feel. UVW/pin weight vary widely by floorplan — door sticker rules. Live Grok verifies exact brochure numbers."
    },
    "Model Z Air": {
      type: "Fifth Wheel",
      floorplans: ["250", "280", "295", "310"],
      floorplansByYear: {
        "2022": ["250", "280", "295"],
        "2023": ["250", "280", "295"],
        "2024": ["250", "280", "295", "310"],
        "2025": ["250", "280", "295", "310"],
        "2026": ["250", "280", "295"]
      },
      lengthRange: [
        25,
        33
      ],
      weightRange: [
        7500,
        11000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        79000,
        139000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2022,
      description: "Brinkley Model Z Air — lighter / half-ton-friendly packaging under Model Z. Still verify actual pin weight vs truck rating."
    },
    "Model Z Expand": {
      type: "Fifth Wheel",
      floorplans: ["3100", "3500", "3700"],
      floorplansByYear: {
        "2023": ["3100", "3500"],
        "2024": ["3100", "3500"],
        "2025": ["3100", "3500", "3700"],
        "2026": ["3100", "3500", "3700"]
      },
      lengthRange: [
        31,
        40
      ],
      weightRange: [
        10000,
        15000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        99000,
        169000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Brinkley Model Z Expand — expanded floorplan packages on Model Z platform."
    },
    "Model G": {
      type: "Toy Hauler",
      floorplans: ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
      floorplansByYear: {
        "2023": ["3250", "3500", "3520", "3950", "3970", "4000"],
        "2024": ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
        "2025": ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
        "2026": ["3250", "3500", "3520", "3950", "3970", "4100", "4120"]
      },
      lengthRange: [
        38,
        46
      ],
      weightRange: [
        16900,
        23000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        175000,
        245000
      ],
      chassis: "N/A (towable · triple 7k axles)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      generator: "Generator prep / optional (shared fuel station)",
      awningLength: 18,
      ceilingHeight: 79.5,
      garageLengthFt: 14,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      fuelStationGal: 60,
      generatorFuelGal: 60,
      garageFits: "Full-size UTV(s) by plan — 6.5–17 ft garage/flex",
      gvwrLbs: 23000,
      uvwLbs: 18900,
      exteriorHeightIn: 160,
      exteriorWidthIn: 101,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Brinkley Model G — official OEM luxury fifth-wheel toy hauler. 2024 floorplans: 3250 (6.5 ft garage), 3500/3520 (11 ft), 3950 (14 ft), 3970 (11 ft + 2nd bath), 4000 (16 ft), 4100 (12.5 ft), 4120 (17 ft). Brochure: 101 in wide, 13 ft 4 in tall, triple 7k axles, 150 gal fresh, 30-60 gal fuel station."
    },
    "Model T": {
      type: "Toy Hauler",
      floorplans: ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
      floorplansByYear: {
        "2021": ["3500", "3950"],
        "2022": ["3500", "3950", "4000"],
        "2023": ["3250", "3500", "3520", "3950", "3970", "4000"],
        "2024": ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
        "2025": ["3250", "3500", "3520", "3950", "3970", "4000", "4100", "4120"],
        "2026": ["3250", "3500", "3520", "3950", "3970", "4100", "4120"]
      },
      lengthRange: [
        38,
        46
      ],
      weightRange: [
        16900,
        23000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        175000,
        245000
      ],
      chassis: "N/A (towable · triple 7k axles)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 150,
      grayWater: 156,
      blackWater: 85,
      generator: "Generator prep / optional (shared fuel station)",
      awningLength: 18,
      ceilingHeight: 79.5,
      garageLengthFt: 14,
      garageWidthFt: 8.5,
      garageHeightIn: 84,
      garageCapacityLbs: 3000,
      fuelStationGal: 60,
      generatorFuelGal: 60,
      garageFits: "Full-size UTV(s) by plan — 6.5–17 ft garage/flex",
      gvwrLbs: 23000,
      uvwLbs: 18900,
      exteriorHeightIn: 160,
      exteriorWidthIn: 101,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Brinkley Model T — premium fifth-wheel toy hauler (OEM markets this line as Model G). 2024 floorplans: 3250/3500/3520/3950/3970/4000/4100/4120. Wide-body 101 in, 13 ft 4 in height, triple 7k axles, 150 gal fresh, garage/flex 6.5-17 ft, 30-60 gal fuel station. Exact UVW/pin/garage by floorplan from OEM brochure table."
    },
    "Model T Air": {
      type: "Toy Hauler",
      floorplans: ["250", "280", "295"],
      floorplansByYear: {
        "2023": ["250", "280"],
        "2024": ["250", "280"],
        "2025": ["250", "280", "295"],
        "2026": ["250", "280", "295"]
      },
      lengthRange: [
        25,
        32
      ],
      weightRange: [
        7000,
        11000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        75000,
        135000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Optional / prep",
      awningLength: 16,
      ceilingHeight: 82,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      garageFits: "Side-by-side / smaller UTV by plan",
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Brinkley Model T Air — lighter toy hauler packaging. Garage capacity lower than full Model T — verify toys fit."
    }
  },
  "Genesis Supreme": {
    Vortex: {
      type: "Toy Hauler",
      floorplans: ["2815V", "3215V", "3415V", "4015V"],
      floorplansByYear: {
        "2012": ["2815V"],
        "2013": ["2815V"],
        "2014": ["2815V"],
        "2015": ["2815V"],
        "2016": ["2815V", "3215V"],
        "2017": ["2815V", "3215V"],
        "2018": ["2815V", "3215V"],
        "2019": ["2815V", "3215V"],
        "2020": ["2815V", "3215V", "3415V", "4015V"],
        "2021": ["2815V", "3215V", "3415V", "4015V"],
        "2022": ["2815V", "3215V", "3415V", "4015V"],
        "2023": ["2815V", "3215V", "3415V", "4015V"],
        "2024": ["2815V", "3215V", "3415V", "4015V"],
        "2025": ["2815V", "3215V", "3415V", "4015V"],
        "2026": ["2815V", "3215V", "3415V", "4015V"]
      },
      lengthRange: [
        28,
        41
      ],
      weightRange: [
        9000,
        15000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        54900,
        99000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan 5500W Gas (optional / prep)",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1997,
      warrantyYears: 1,
      yearStart: 2012,
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3200,
      rampWidthFt: 7.8,
      fuelStationGal: 30,
      generatorFuelGal: 30,
      garageFits: "1 full-size UTV or 2 sport quads",
      description: "Genesis Supreme Vortex is a West-Coast favorite toy hauler with a practical garage, fuel station, and value pricing for desert and mountain toy runners."
    },
    "G-Force": {
      type: "Toy Hauler",
      floorplans: ["2814", "3314", "3514", "4014"],
      floorplansByYear: {
        "2010": ["2814"],
        "2011": ["2814"],
        "2012": ["2814"],
        "2013": ["2814"],
        "2014": ["2814", "3314"],
        "2015": ["2814", "3314"],
        "2016": ["2814", "3314"],
        "2017": ["2814", "3314"],
        "2018": ["2814", "3314"],
        "2019": ["2814", "3314", "3514", "4014"],
        "2020": ["2814", "3314", "3514", "4014"],
        "2021": ["2814", "3314", "3514", "4014"],
        "2022": ["2814", "3314", "3514", "4014"],
        "2023": ["2814", "3314", "3514", "4014"],
        "2024": ["2814", "3314", "3514", "4014"],
        "2025": ["2814", "3314", "3514", "4014"],
        "2026": ["2814", "3314", "3514", "4014"]
      },
      lengthRange: [
        28,
        40
      ],
      weightRange: [
        8500,
        14000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        49900,
        89000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 90,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 4000–5500W Gas (optional)",
      awningLength: 15,
      ceilingHeight: 82,
      founded: 1997,
      warrantyYears: 1,
      yearStart: 2010,
      garageLengthFt: 11,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      rampWidthFt: 7.5,
      fuelStationGal: 25,
      generatorFuelGal: 25,
      garageFits: "1 UTV or dual dirt bikes",
      description: "G-Force is Genesis Supreme compact toy hauler line — shorter garages for half-ton and three-quarter-ton towers."
    },
    Prizm: {
      type: "Toy Hauler",
      floorplans: ["2414", "2715", "2915"],
      floorplansByYear: {
        "2015": ["2414"],
        "2016": ["2414"],
        "2017": ["2414"],
        "2018": ["2414", "2715"],
        "2019": ["2414", "2715"],
        "2020": ["2414", "2715"],
        "2021": ["2414", "2715"],
        "2022": ["2414", "2715", "2915"],
        "2023": ["2414", "2715", "2915"],
        "2024": ["2414", "2715", "2915"],
        "2025": ["2414", "2715", "2915"],
        "2026": ["2414", "2715", "2915"]
      },
      lengthRange: [
        24,
        30
      ],
      weightRange: [
        6500,
        9500
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        39900,
        64900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 35,
      blackWater: 35,
      generator: "Generator prep",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1997,
      warrantyYears: 1,
      yearStart: 2015,
      garageLengthFt: 9,
      garageWidthFt: 7.8,
      garageHeightIn: 78,
      garageCapacityLbs: 2000,
      rampWidthFt: 7.2,
      fuelStationGal: 20,
      generatorFuelGal: 20,
      garageFits: "2 dirt bikes or 1 compact UTV",
      description: "Prizm is the lightweight Genesis Supreme toy hauler — garage-focused for side-by-sides and dirt bikes."
    },
    Stealth: {
      type: "Toy Hauler",
      floorplans: ["19FS", "22FS", "28FS"],
      floorplansByYear: {
        "2016": ["19FS"],
        "2017": ["19FS"],
        "2018": ["19FS"],
        "2019": ["19FS", "22FS"],
        "2020": ["19FS", "22FS"],
        "2021": ["19FS", "22FS"],
        "2022": ["19FS", "22FS", "28FS"],
        "2023": ["19FS", "22FS", "28FS"],
        "2024": ["19FS", "22FS", "28FS"],
        "2025": ["19FS", "22FS", "28FS"],
        "2026": ["19FS", "22FS", "28FS"]
      },
      lengthRange: [
        20,
        30
      ],
      weightRange: [
        5000,
        8500
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        34900,
        59900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 30,
      grayWater: 20,
      blackWater: 20,
      awningLength: 16,
      ceilingHeight: 78,
      founded: 1997,
      warrantyYears: 1,
      yearStart: 2016,
      generator: "Portable / prep",
      garageLengthFt: 10,
      garageWidthFt: 7.5,
      garageHeightIn: 74,
      garageCapacityLbs: 2200,
      rampWidthFt: 7,
      fuelStationGal: 0,
      generatorFuelGal: 10,
      garageFits: "Dirt bikes / compact toys",
      description: "Stealth is Genesis Supreme compact toy hauler for dirt bikes and small SxS."
    },
    "Vortex Pro": {
      type: "Toy Hauler",
      floorplans: ["3615", "4015", "4215"],
      floorplansByYear: {
        "2018": ["3615"],
        "2019": ["3615"],
        "2020": ["3615", "4015"],
        "2021": ["3615", "4015"],
        "2022": ["3615", "4015"],
        "2023": ["3615", "4015", "4215"],
        "2024": ["3615", "4015", "4215"],
        "2025": ["3615", "4015", "4215"],
        "2026": ["3615", "4015", "4215"]
      },
      lengthRange: [
        36,
        44
      ],
      weightRange: [
        12000,
        16000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        69900,
        119000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1997,
      warrantyYears: 1,
      yearStart: 2018,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 14,
      garageWidthFt: 8.3,
      garageHeightIn: 86,
      garageCapacityLbs: 4200,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 full-size UTVs",
      description: "Vortex Pro is Genesis Supreme large garage fifth-wheel toy hauler for multi-UTV desert camps."
    }
  },
  ATC: {
    "Game Changer": {
      type: "Toy Hauler",
      floorplans: ["2015", "2816", "2819", "3019", "4019"],
      floorplansByYear: {
        "2014": ["2015", "2816"],
        "2015": ["2015", "2816"],
        "2016": ["2015", "2816"],
        "2017": ["2015", "2816", "2819"],
        "2018": ["2015", "2816", "2819"],
        "2019": ["2015", "2816", "2819"],
        "2020": ["2015", "2816", "2819"],
        "2021": ["2015", "2816", "2819", "3019", "4019"],
        "2022": ["2015", "2816", "2819", "3019", "4019"],
        "2023": ["2015", "2816", "2819", "3019", "4019"],
        "2024": ["2015", "2816", "2819", "3019", "4019"],
        "2025": ["2015", "2816", "2819", "3019", "4019"],
        "2026": ["2015", "2816", "2819", "3019", "4019"]
      },
      lengthRange: [
        20,
        41
      ],
      weightRange: [
        5000,
        12000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        44900,
        99000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 2500–5500W (package dependent)",
      awningLength: 14,
      ceilingHeight: 84,
      founded: 1999,
      warrantyYears: 3,
      yearStart: 2014,
      garageLengthFt: 16,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 5000,
      rampWidthFt: 7.5,
      fuelStationGal: 0,
      generatorFuelGal: 20,
      garageFits: "Long garage for multiple bikes / karts — aluminum body",
      description: "ATC Game Changer is an all-aluminum toy hauler with oversized garages and commercial-grade construction."
    },
    Quest: {
      type: "Toy Hauler",
      floorplans: ["14", "16", "20", "28"],
      floorplansByYear: {
        "2016": ["14"],
        "2017": ["14"],
        "2018": ["14"],
        "2019": ["14", "16"],
        "2020": ["14", "16"],
        "2021": ["14", "16"],
        "2022": ["14", "16", "20", "28"],
        "2023": ["14", "16", "20", "28"],
        "2024": ["14", "16", "20", "28"],
        "2025": ["14", "16", "20", "28"],
        "2026": ["14", "16", "20", "28"]
      },
      lengthRange: [
        16,
        28
      ],
      weightRange: [
        3500,
        7000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        29900,
        54900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 20,
      grayWater: 15,
      blackWater: 15,
      generator: "Portable / prep",
      awningLength: 10,
      ceilingHeight: 78,
      founded: 1999,
      warrantyYears: 3,
      yearStart: 2016,
      garageLengthFt: 12,
      garageWidthFt: 7,
      garageHeightIn: 72,
      garageCapacityLbs: 2500,
      rampWidthFt: 6.5,
      fuelStationGal: 0,
      generatorFuelGal: 10,
      garageFits: "Dirt bikes, e-bikes, compact toys",
      description: "ATC Quest is the compact aluminum toy hauler — easy to tow with maximum garage for the length."
    },
    TrailBoss: {
      type: "Toy Hauler",
      floorplans: ["28", "32", "36"],
      floorplansByYear: {
        "2012": ["28"],
        "2013": ["28"],
        "2014": ["28"],
        "2015": ["28"],
        "2016": ["28", "32"],
        "2017": ["28", "32"],
        "2018": ["28", "32"],
        "2019": ["28", "32"],
        "2020": ["28", "32", "36"],
        "2021": ["28", "32", "36"],
        "2022": ["28", "32", "36"],
        "2023": ["28", "32", "36"],
        "2024": ["28", "32", "36"],
        "2025": ["28", "32", "36"],
        "2026": ["28", "32", "36"]
      },
      lengthRange: [
        28,
        36
      ],
      weightRange: [
        7000,
        11000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        49900,
        79000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 40,
      grayWater: 28,
      blackWater: 28,
      generator: "Onan 4000W Gas (optional)",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1999,
      warrantyYears: 3,
      yearStart: 2012,
      garageLengthFt: 14,
      garageWidthFt: 7.5,
      garageHeightIn: 76,
      garageCapacityLbs: 4000,
      rampWidthFt: 7,
      fuelStationGal: 20,
      generatorFuelGal: 20,
      garageFits: "1 UTV + bikes or dual quads",
      description: "TrailBoss splits aluminum durability with a usable living suite and garage for real off-road weekends."
    },
    "Game Changer Pro": {
      type: "Toy Hauler",
      floorplans: ["2819", "3019", "3519", "4019"],
      floorplansByYear: {
        "2018": ["2819"],
        "2019": ["2819"],
        "2020": ["2819", "3019"],
        "2021": ["2819", "3019"],
        "2022": ["2819", "3019"],
        "2023": ["2819", "3019", "3519", "4019"],
        "2024": ["2819", "3019", "3519", "4019"],
        "2025": ["2819", "3019", "3519", "4019"],
        "2026": ["2819", "3019", "3519", "4019"]
      },
      lengthRange: [
        28,
        42
      ],
      weightRange: [
        7000,
        13000
      ],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [
        59900,
        119000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 45,
      grayWater: 30,
      blackWater: 30,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1999,
      warrantyYears: 3,
      yearStart: 2018,
      generator: "Onan 4000–5500W package",
      garageLengthFt: 18,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 5500,
      rampWidthFt: 7.5,
      fuelStationGal: 0,
      generatorFuelGal: 20,
      garageFits: "Multiple bikes / karts / long toys",
      description: "Game Changer Pro extends ATC aluminum garages with more living packages and longer cargo bays."
    },
    "Toy Hauler 8.5": {
      type: "Toy Hauler",
      floorplans: ["20", "24", "28", "32"],
      floorplansByYear: {
        "2015": ["20"],
        "2016": ["20"],
        "2017": ["20"],
        "2018": ["20", "24"],
        "2019": ["20", "24"],
        "2020": ["20", "24"],
        "2021": ["20", "24"],
        "2022": ["20", "24", "28", "32"],
        "2023": ["20", "24", "28", "32"],
        "2024": ["20", "24", "28", "32"],
        "2025": ["20", "24", "28", "32"],
        "2026": ["20", "24", "28", "32"]
      },
      lengthRange: [
        20,
        32
      ],
      weightRange: [
        4500,
        8000
      ],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [
        34900,
        64900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 30,
      grayWater: 20,
      blackWater: 20,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1999,
      warrantyYears: 3,
      yearStart: 2015,
      generator: "Portable / optional Onan",
      garageLengthFt: 14,
      garageWidthFt: 8,
      garageHeightIn: 76,
      garageCapacityLbs: 4000,
      rampWidthFt: 7.5,
      fuelStationGal: 0,
      generatorFuelGal: 15,
      garageFits: "UTV or multi-bike setups",
      description: "ATC 8.5-wide toy hauler series — maximum garage width for the length with aluminum durability."
    }
  },
  "KZ RV": {
    "Sportsmen Sportster": {
      type: "Toy Hauler",
      floorplans: ["301TH", "331TH", "301THR12", "351TH"],
      floorplansByYear: {
        "2010": ["301TH"],
        "2011": ["301TH"],
        "2012": ["301TH"],
        "2013": ["301TH"],
        "2014": ["301TH", "331TH"],
        "2015": ["301TH", "331TH"],
        "2016": ["301TH", "331TH"],
        "2017": ["301TH", "331TH"],
        "2018": ["301TH", "331TH"],
        "2019": ["301TH", "331TH", "301THR12", "351TH"],
        "2020": ["301TH", "331TH", "301THR12", "351TH"],
        "2021": ["301TH", "331TH", "301THR12", "351TH"],
        "2022": ["301TH", "331TH", "301THR12", "351TH"],
        "2023": ["301TH", "331TH", "301THR12", "351TH"],
        "2024": ["301TH", "331TH", "301THR12", "351TH"],
        "2025": ["301TH", "331TH", "301THR12", "351TH"],
        "2026": ["301TH", "331TH", "301THR12", "351TH"]
      },
      lengthRange: [
        30,
        36
      ],
      weightRange: [
        7000,
        10000
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        39900,
        64900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 32,
      blackWater: 32,
      generator: "Generator prep / optional 4kW",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2010,
      garageLengthFt: 10,
      garageWidthFt: 8,
      garageHeightIn: 78,
      garageCapacityLbs: 2500,
      rampWidthFt: 7.5,
      fuelStationGal: 20,
      generatorFuelGal: 20,
      garageFits: "1 mid-size UTV or dual dirt bikes",
      description: "Sportsmen Sportster is KZ value toy hauler — ramp door, garage sofas, and fuel station at a family price."
    },
    Sportster: {
      type: "Toy Hauler",
      floorplans: ["301THR12", "331THR13", "351TH13"],
      floorplansByYear: {
        "2008": ["301THR12"],
        "2009": ["301THR12"],
        "2010": ["301THR12"],
        "2011": ["301THR12"],
        "2012": ["301THR12"],
        "2013": ["301THR12", "331THR13"],
        "2014": ["301THR12", "331THR13"],
        "2015": ["301THR12", "331THR13"],
        "2016": ["301THR12", "331THR13"],
        "2017": ["301THR12", "331THR13"],
        "2018": ["301THR12", "331THR13", "351TH13"],
        "2019": ["301THR12", "331THR13", "351TH13"],
        "2020": ["301THR12", "331THR13", "351TH13"],
        "2021": ["301THR12", "331THR13", "351TH13"],
        "2022": ["301THR12", "331THR13", "351TH13"],
        "2023": ["301THR12", "331THR13", "351TH13"],
        "2024": ["301THR12", "331THR13", "351TH13"],
        "2025": ["301THR12", "331THR13", "351TH13"],
        "2026": ["301THR12", "331THR13", "351TH13"]
      },
      lengthRange: [
        31,
        36
      ],
      weightRange: [
        7500,
        10500
      ],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [
        42900,
        69900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 64,
      grayWater: 34,
      blackWater: 34,
      generator: "Onan 4000W Gas (optional)",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2008,
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      rampWidthFt: 7.8,
      fuelStationGal: 30,
      generatorFuelGal: 30,
      garageFits: "1 full-size UTV + gear",
      description: "KZ Sportster steps up garage length and fuel capacity for weekend UTV crews."
    },
    Durango: {
      type: "Fifth Wheel",
      floorplans: ["G333RLT", "G386FLF", "G348BH"],
      floorplansByYear: {
        "2010": ["G333RLT"],
        "2011": ["G333RLT"],
        "2012": ["G333RLT"],
        "2013": ["G333RLT"],
        "2014": ["G333RLT", "G386FLF"],
        "2015": ["G333RLT", "G386FLF"],
        "2016": ["G333RLT", "G386FLF"],
        "2017": ["G333RLT", "G386FLF"],
        "2018": ["G333RLT", "G386FLF"],
        "2019": ["G333RLT", "G386FLF", "G348BH"],
        "2020": ["G333RLT", "G386FLF", "G348BH"],
        "2021": ["G333RLT", "G386FLF", "G348BH"],
        "2022": ["G333RLT", "G386FLF", "G348BH"],
        "2023": ["G333RLT", "G386FLF", "G348BH"],
        "2024": ["G333RLT", "G386FLF", "G348BH"],
        "2025": ["G333RLT", "G386FLF", "G348BH"],
        "2026": ["G333RLT", "G386FLF", "G348BH"]
      },
      lengthRange: [
        34,
        41
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        54900,
        94900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 90,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2010,
      description: "Durango is KZ flagship fifth wheel with family and rear-living floorplans at a competitive price."
    },
    Venom: {
      type: "Toy Hauler",
      floorplans: ["3911TK", "4013TK", "4113TK"],
      floorplansByYear: {
        "2012": ["3911TK"],
        "2013": ["3911TK"],
        "2014": ["3911TK"],
        "2015": ["3911TK"],
        "2016": ["3911TK", "4013TK"],
        "2017": ["3911TK", "4013TK"],
        "2018": ["3911TK", "4013TK"],
        "2019": ["3911TK", "4013TK"],
        "2020": ["3911TK", "4013TK", "4113TK"],
        "2021": ["3911TK", "4013TK", "4113TK"],
        "2022": ["3911TK", "4013TK", "4113TK"],
        "2023": ["3911TK", "4013TK", "4113TK"],
        "2024": ["3911TK", "4013TK", "4113TK"],
        "2025": ["3911TK", "4013TK", "4113TK"],
        "2026": ["3911TK", "4013TK", "4113TK"]
      },
      lengthRange: [
        39,
        43
      ],
      weightRange: [
        14000,
        18000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        84900,
        139000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2012,
      generator: "Onan 5500W Gas (optional)",
      garageLengthFt: 13,
      garageWidthFt: 8.3,
      garageHeightIn: 86,
      garageCapacityLbs: 4000,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 full-size UTVs",
      description: "Venom is KZ full-size toy hauler fifth wheel with large garage and fuel station for multi-toy families."
    },
    "Sportster Destination": {
      type: "Toy Hauler",
      floorplans: ["353TH13", "351TH13", "301TH12"],
      floorplansByYear: {
        "2015": ["353TH13"],
        "2016": ["353TH13"],
        "2017": ["353TH13"],
        "2018": ["353TH13", "351TH13"],
        "2019": ["353TH13", "351TH13"],
        "2020": ["353TH13", "351TH13"],
        "2021": ["353TH13", "351TH13"],
        "2022": ["353TH13", "351TH13", "301TH12"],
        "2023": ["353TH13", "351TH13", "301TH12"],
        "2024": ["353TH13", "351TH13", "301TH12"],
        "2025": ["353TH13", "351TH13", "301TH12"],
        "2026": ["353TH13", "351TH13", "301TH12"]
      },
      lengthRange: [
        32,
        38
      ],
      weightRange: [
        9000,
        12000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        49900,
        79900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 70,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2015,
      generator: "Onan 4000W Gas (optional)",
      garageLengthFt: 12,
      garageWidthFt: 8,
      garageHeightIn: 82,
      garageCapacityLbs: 3000,
      rampWidthFt: 7.8,
      fuelStationGal: 30,
      generatorFuelGal: 30,
      garageFits: "1 UTV + bikes",
      description: "Sportster Destination steps up living amenities while keeping a true cargo garage and ramp door."
    },
    Connect: {
      type: "Fifth Wheel",
      floorplans: ["C261RB", "C303BH", "C312BH"],
      floorplansByYear: {
        "2014": ["C261RB"],
        "2015": ["C261RB"],
        "2016": ["C261RB"],
        "2017": ["C261RB", "C303BH"],
        "2018": ["C261RB", "C303BH"],
        "2019": ["C261RB", "C303BH"],
        "2020": ["C261RB", "C303BH"],
        "2021": ["C261RB", "C303BH", "C312BH"],
        "2022": ["C261RB", "C303BH", "C312BH"],
        "2023": ["C261RB", "C303BH", "C312BH"],
        "2024": ["C261RB", "C303BH", "C312BH"],
        "2025": ["C261RB", "C303BH", "C312BH"],
        "2026": ["C261RB", "C303BH", "C312BH"]
      },
      lengthRange: [
        28,
        34
      ],
      weightRange: [
        7000,
        10000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        34900,
        59900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1972,
      warrantyYears: 1,
      yearStart: 2014,
      description: "Connect is KZ light fifth wheel for first-time fifth-wheel buyers and half-ton towers."
    }
  },
  "Alliance RV": {
    Paradigm: {
      type: "Fifth Wheel",
      floorplans: [
        "295MK",
        "310RL",
        "312RK",
        "340RL",
        "370FB",
        "372RK",
        "385FL",
        "390MP",
        "395MK"
      ],
      floorplansByYear: {
        "2020": ["310RL", "340RL", "370FB", "395MK"],
        "2021": ["310RL", "340RL", "370FB", "395MK"],
        "2022": ["310RL", "312RK", "340RL", "370FB", "385FL", "395MK"],
        "2023": ["295MK", "310RL", "312RK", "340RL", "370FB", "372RK", "385FL", "395MK"],
        "2024": [
          "295MK",
          "310RL",
          "312RK",
          "340RL",
          "370FB",
          "372RK",
          "385FL",
          "390MP",
          "395MK"
        ],
        "2025": [
          "295MK",
          "310RL",
          "312RK",
          "340RL",
          "370FB",
          "372RK",
          "385FL",
          "390MP",
          "395MK"
        ],
        "2026": ["310RL", "312RK", "340RL", "370FB", "385FL", "395MK"]
      },
      lengthRange: [
        33,
        42
      ],
      weightRange: [
        12000,
        17000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        110000,
        185000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 98,
      grayWater: 98,
      blackWater: 49,
      awningLength: 18,
      ceilingHeight: 102,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Alliance Paradigm — flagship luxury fifth wheel (residential ceiling height). Popular 310RL / 340RL / 385FL / 395MK. Heavy pin weights — match truck carefully. Live Grok fills exact UVW."
    },
    Avenue: {
      type: "Fifth Wheel",
      floorplans: ["30RL", "32RLS", "33RLS", "36RLP", "37RLP", "42MLQ", "42MLO"],
      floorplansByYear: {
        "2020": ["32RLS", "36RLP", "37RLP"],
        "2021": ["32RLS", "36RLP", "37RLP"],
        "2022": ["30RL", "32RLS", "33RLS", "36RLP", "37RLP"],
        "2023": ["30RL", "32RLS", "33RLS", "36RLP", "37RLP", "42MLQ"],
        "2024": ["30RL", "32RLS", "33RLS", "36RLP", "37RLP", "42MLQ", "42MLO"],
        "2025": ["30RL", "32RLS", "33RLS", "36RLP", "37RLP", "42MLQ", "42MLO"],
        "2026": ["30RL", "32RLS", "33RLS", "36RLP", "37RLP", "42MLQ"]
      },
      lengthRange: [
        30,
        42
      ],
      weightRange: [
        10000,
        15500
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        90000,
        155000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 74,
      grayWater: 74,
      blackWater: 46,
      awningLength: 18,
      ceilingHeight: 102,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2020,
      description: "Alliance Avenue — mid-profile luxury fifth wheel (value vs Paradigm). 32RLS is a volume search unit; shorter than most Paradigm plans."
    },
    Valor: {
      type: "Toy Hauler",
      floorplans: ["36V11", "37V13", "40V13", "42V13", "4213", "4216"],
      floorplansByYear: {
        "2021": ["36V11", "37V13", "40V13"],
        "2022": ["36V11", "37V13", "40V13", "42V13"],
        "2023": ["36V11", "37V13", "40V13", "42V13"],
        "2024": ["36V11", "37V13", "40V13", "42V13"],
        "2025": ["36V11", "37V13", "40V13", "42V13", "4213", "4216"],
        "2026": ["36V11", "37V13", "40V13", "42V13", "4213", "4216"]
      },
      lengthRange: [
        37,
        46
      ],
      weightRange: [
        14000,
        18500
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        120000,
        195000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan 5500W Gas (optional package)",
      awningLength: 20,
      ceilingHeight: 102,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2021,
      garageLengthFt: 13,
      garageWidthFt: 8.4,
      garageHeightIn: 90,
      garageCapacityLbs: 4500,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 full-size UTVs + patio ramp mode (plan-dependent)",
      description: "Alliance Valor — premium fifth-wheel toy hauler. Residential living + serious garage (36V11 / 42V13). Verify garage length and fuel station options."
    },
    "Valor V-Series": {
      type: "Toy Hauler",
      floorplans: ["36V12", "37V11", "40V12"],
      floorplansByYear: {
        "2022": ["36V12", "37V11", "40V12"],
        "2023": ["36V12", "37V11", "40V12"],
        "2024": ["36V12", "37V11", "40V12"],
        "2025": ["36V12", "37V11", "40V12"],
        "2026": ["36V12", "37V11", "40V12"]
      },
      lengthRange: [
        36,
        42
      ],
      weightRange: [
        13000,
        17000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        110000,
        175000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      generator: "Onan 5500W Gas (optional)",
      awningLength: 16,
      ceilingHeight: 102,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2022,
      garageLengthFt: 12,
      garageWidthFt: 8.3,
      garageHeightIn: 88,
      garageCapacityLbs: 4000,
      rampWidthFt: 8,
      fuelStationGal: 40,
      generatorFuelGal: 40,
      garageFits: "2 UTVs",
      description: "Alliance Valor V-Series — alternate garage lengths and living layouts under the Valor family."
    },
    Delta: {
      type: "Fifth Wheel",
      floorplans: ["282RK", "294RL", "312BH", "322BH"],
      floorplansByYear: {
        "2022": ["282RK", "294RL", "312BH"],
        "2023": ["282RK", "294RL", "312BH", "322BH"],
        "2024": ["282RK", "294RL", "312BH", "322BH"],
        "2025": ["282RK", "294RL", "312BH", "322BH"],
        "2026": ["282RK", "294RL", "312BH"]
      },
      lengthRange: [
        28,
        34
      ],
      weightRange: [
        7500,
        11500
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        65000,
        110000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.65,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2022,
      description: "Alliance Delta — lighter half-ton / light 3/4-ton fifth wheel with Alliance build standards."
    },
    Benchmark: {
      type: "Travel Trailer",
      floorplans: ["29BH", "32RL", "34BH", "37FL"],
      floorplansByYear: {
        "2023": ["29BH", "32RL", "34BH"],
        "2024": ["29BH", "32RL", "34BH", "37FL"],
        "2025": ["29BH", "32RL", "34BH", "37FL"],
        "2026": ["29BH", "32RL", "34BH", "37FL"]
      },
      lengthRange: [
        29,
        38
      ],
      weightRange: [
        7000,
        11000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        55000,
        95000
      ],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 54,
      grayWater: 40,
      blackWater: 35,
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2019,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Alliance Benchmark — travel trailer line bringing Alliance construction into the TT segment."
    }
  },
  "Highland Ridge": {
    "Open Range": {
      type: "Toy Hauler",
      floorplans: ["337RLS", "376FBH", "391RDN"],
      floorplansByYear: {
        "2014": ["337RLS"],
        "2015": ["337RLS"],
        "2016": ["337RLS"],
        "2017": ["337RLS", "376FBH"],
        "2018": ["337RLS", "376FBH"],
        "2019": ["337RLS", "376FBH"],
        "2020": ["337RLS", "376FBH"],
        "2021": ["337RLS", "376FBH", "391RDN"],
        "2022": ["337RLS", "376FBH", "391RDN"],
        "2023": ["337RLS", "376FBH", "391RDN"],
        "2024": ["337RLS", "376FBH", "391RDN"],
        "2025": ["337RLS", "376FBH", "391RDN"],
        "2026": ["337RLS", "376FBH", "391RDN"]
      },
      lengthRange: [
        34,
        42
      ],
      weightRange: [
        11000,
        15000
      ],
      slideouts: 3,
      sleeps: 8,
      msrpRange: [
        69900,
        109000
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 85,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 5500W Gas (optional)",
      awningLength: 17,
      ceilingHeight: 84,
      founded: 2010,
      warrantyYears: 1,
      yearStart: 2014,
      garageLengthFt: 12,
      garageWidthFt: 8.2,
      garageHeightIn: 84,
      garageCapacityLbs: 3200,
      rampWidthFt: 8,
      fuelStationGal: 30,
      generatorFuelGal: 30,
      garageFits: "1–2 UTVs depending on floorplan",
      description: "Highland Ridge Open Range toy haulers pair a usable garage with residential living space — strong mid-market choice for desert and mountain recreation."
    },
    "Mesa Ridge": {
      type: "Toy Hauler",
      floorplans: ["310MHS", "338MHS", "376MHS"],
      floorplansByYear: {
        "2016": ["310MHS"],
        "2017": ["310MHS"],
        "2018": ["310MHS"],
        "2019": ["310MHS", "338MHS"],
        "2020": ["310MHS", "338MHS"],
        "2021": ["310MHS", "338MHS"],
        "2022": ["310MHS", "338MHS", "376MHS"],
        "2023": ["310MHS", "338MHS", "376MHS"],
        "2024": ["310MHS", "338MHS", "376MHS"],
        "2025": ["310MHS", "338MHS", "376MHS"],
        "2026": ["310MHS", "338MHS", "376MHS"]
      },
      lengthRange: [
        32,
        39
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [
        59900,
        94900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Generator prep / optional 4–5.5kW",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2010,
      warrantyYears: 1,
      yearStart: 2016,
      garageLengthFt: 11,
      garageWidthFt: 8,
      garageHeightIn: 80,
      garageCapacityLbs: 2800,
      rampWidthFt: 7.8,
      fuelStationGal: 25,
      generatorFuelGal: 25,
      garageFits: "1 full-size UTV or dual quads",
      description: "Mesa Ridge is Highland Ridge's lighter toy hauler line — garage-first weekends without stepping into 16k+ GVWR territory."
    },
    "Open Range 3X": {
      type: "Fifth Wheel",
      floorplans: ["307RLS", "337RLS", "376FBH"],
      floorplansByYear: {
        "2013": ["307RLS"],
        "2014": ["307RLS"],
        "2015": ["307RLS"],
        "2016": ["307RLS"],
        "2017": ["307RLS", "337RLS"],
        "2018": ["307RLS", "337RLS"],
        "2019": ["307RLS", "337RLS"],
        "2020": ["307RLS", "337RLS"],
        "2021": ["307RLS", "337RLS", "376FBH"],
        "2022": ["307RLS", "337RLS", "376FBH"],
        "2023": ["307RLS", "337RLS", "376FBH"],
        "2024": ["307RLS", "337RLS", "376FBH"],
        "2025": ["307RLS", "337RLS", "376FBH"],
        "2026": ["307RLS", "337RLS", "376FBH"]
      },
      lengthRange: [
        32,
        40
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        59900,
        99900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 90,
      founded: 2010,
      warrantyYears: 1,
      yearStart: 2013,
      description: "Open Range 3X is Highland Ridge residential fifth wheel companion to the toy hauler line."
    },
    Roamer: {
      type: "Fifth Wheel",
      floorplans: ["286RLS", "318RLS", "344RLS"],
      floorplansByYear: {
        "2015": ["286RLS"],
        "2016": ["286RLS"],
        "2017": ["286RLS"],
        "2018": ["286RLS", "318RLS"],
        "2019": ["286RLS", "318RLS"],
        "2020": ["286RLS", "318RLS"],
        "2021": ["286RLS", "318RLS"],
        "2022": ["286RLS", "318RLS", "344RLS"],
        "2023": ["286RLS", "318RLS", "344RLS"],
        "2024": ["286RLS", "318RLS", "344RLS"],
        "2025": ["286RLS", "318RLS", "344RLS"],
        "2026": ["286RLS", "318RLS", "344RLS"]
      },
      lengthRange: [
        29,
        36
      ],
      weightRange: [
        8000,
        12000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        44900,
        74900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      awningLength: 16,
      ceilingHeight: 82,
      founded: 2010,
      warrantyYears: 1,
      yearStart: 2015,
      description: "Roamer is Highland Ridge light fifth wheel for half-ton towers seeking more living space than a travel trailer."
    },
    "Light Range TH": {
      type: "Toy Hauler",
      floorplans: ["261TH", "281TH", "301TH"],
      floorplansByYear: {
        "2017": ["261TH"],
        "2018": ["261TH"],
        "2019": ["261TH"],
        "2020": ["261TH", "281TH"],
        "2021": ["261TH", "281TH"],
        "2022": ["261TH", "281TH", "301TH"],
        "2023": ["261TH", "281TH", "301TH"],
        "2024": ["261TH", "281TH", "301TH"],
        "2025": ["261TH", "281TH", "301TH"],
        "2026": ["261TH", "281TH", "301TH"]
      },
      lengthRange: [
        26,
        32
      ],
      weightRange: [
        6000,
        9000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        34900,
        54900
      ],
      chassis: "N/A",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 45,
      grayWater: 28,
      blackWater: 28,
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2010,
      warrantyYears: 1,
      yearStart: 2017,
      generator: "Generator prep",
      garageLengthFt: 9,
      garageWidthFt: 7.8,
      garageHeightIn: 76,
      garageCapacityLbs: 1800,
      rampWidthFt: 7,
      fuelStationGal: 20,
      generatorFuelGal: 0,
      garageFits: "Dirt bikes or compact SxS",
      description: "Light Range TH is Highland Ridge compact toy hauler for weekend UTV and dirt-bike trips."
    }
  },
  "Country Coach": {
    Inspire: {
      type: "Class A Diesel",
      floorplans: ["360", "380", "390", "45DL"],
      floorplansByYear: {
        "2000": ["360"],
        "2001": ["360"],
        "2002": ["360", "380"],
        "2003": ["360", "380"],
        "2004": ["360", "380"],
        "2005": ["360", "380", "390", "45DL"],
        "2006": ["360", "380", "390", "45DL"],
        "2007": ["360", "380", "390", "45DL"],
        "2008": ["360", "380", "390", "45DL"]
      },
      lengthRange: [
        36,
        45
      ],
      weightRange: [
        50000,
        58000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        350000,
        650000
      ],
      engine: "Cummins ISX 600HP",
      horsepower: 600,
      chassis: "Country Coach Custom",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 120,
      grayWater: 65,
      blackWater: 60,
      generator: "Onan 12500W Diesel QD",
      awningLength: 24,
      ceilingHeight: 86,
      founded: 1973,
      warrantyYears: 1,
      yearStart: 1998,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2008,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan / Freightliner (by model)",
          notes: "Flagship diesel era — ISX 600 class (pre-X15 naming)"
        }
      ],
      description: "The Country Coach Inspire is widely regarded as one of the finest diesel pushers ever built on American soil. Hand-assembled in Junction City, Oregon on a proprietary stainless-steel chassis, every Inspire was essentially custom-built for its owner. The bespoke hardwood cabinetry, hand-laid tile floors, and Cummins ISX powerplant created a coach that commands premium resale prices even today — 15 years after the company filed for bankruptcy."
    },
    Intrigue: {
      type: "Class A Diesel",
      floorplans: ["500", "510", "530", "540"],
      floorplansByYear: {
        "1998": ["500"],
        "1999": ["500"],
        "2000": ["500"],
        "2001": ["500", "510"],
        "2002": ["500", "510"],
        "2003": ["500", "510"],
        "2004": ["500", "510", "530", "540"],
        "2005": ["500", "510", "530", "540"],
        "2006": ["500", "510", "530", "540"],
        "2007": ["500", "510", "530", "540"],
        "2008": ["500", "510", "530", "540"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        52000,
        60000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        450000,
        800000
      ],
      engine: "Cummins X15 605HP",
      horsepower: 605,
      chassis: "Country Coach Custom Stainless",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 130,
      grayWater: 70,
      blackWater: 65,
      generator: "Onan 15000W Diesel QD",
      awningLength: 26,
      ceilingHeight: 88,
      founded: 1973,
      warrantyYears: 1,
      yearStart: 1999,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2008,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan / Freightliner (by model)",
          notes: "Flagship diesel era — ISX 600 class (pre-X15 naming)"
        }
      ],
      description: "The Country Coach Intrigue was the company flagship — a 45-foot tour de force built on an entirely proprietary stainless-steel frame with the Cummins X15 powerplant. Every Intrigue was essentially one-of-a-kind, configured to order with materials and layouts unavailable from any production manufacturer. Pre-owned Intrigues command $200,000–$400,000 on the secondary market despite being 15+ years old."
    },
    Allure: {
      type: "Class A Diesel",
      floorplans: ["42B", "45B", "42Q"],
      floorplansByYear: {
        "2000": ["42B"],
        "2001": ["42B"],
        "2002": ["42B", "45B"],
        "2003": ["42B", "45B"],
        "2004": ["42B", "45B"],
        "2005": ["42B", "45B", "42Q"],
        "2006": ["42B", "45B", "42Q"],
        "2007": ["42B", "45B", "42Q"],
        "2008": ["42B", "45B", "42Q"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        44000,
        52000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        249000,
        399000
      ],
      engine: "Cummins ISL 450HP",
      horsepower: 450,
      chassis: "Country Coach Custom",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 52,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1973,
      warrantyYears: 1,
      yearStart: 1997,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2008,
          engine: "Cummins ISL 400–450HP class",
          horsepower: 400,
          chassis: "Freightliner / Spartan (by option)",
          notes: "High-line diesel 2006–2015 — ISL class (not Ford gas)"
        }
      ],
      description: "The Country Coach Allure was the entry point to the Country Coach lineup — a more accessible price tag attached to the same Oregon craftsmanship and proprietary chassis philosophy. The Allure owner community remains extraordinarily active; rallies, technical forums, and expert independent techs ensure these coaches can be maintained indefinitely."
    }
  },
  "Beaver Coach": {
    Marquis: {
      type: "Class A Diesel",
      floorplans: ["40QB", "43WB", "45BQ"],
      floorplansByYear: {
        "1998": ["40QB"],
        "1999": ["40QB"],
        "2000": ["40QB"],
        "2001": ["40QB", "43WB"],
        "2002": ["40QB", "43WB"],
        "2003": ["40QB", "43WB"],
        "2004": ["40QB", "43WB"],
        "2005": ["40QB", "43WB", "45BQ"],
        "2006": ["40QB", "43WB", "45BQ"],
        "2007": ["40QB", "43WB", "45BQ"],
        "2008": ["40QB", "43WB", "45BQ"],
        "2009": ["40QB", "43WB", "45BQ"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        44000,
        52000
      ],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [
        299000,
        499000
      ],
      engine: "Cummins ISL 400HP",
      horsepower: 400,
      chassis: "Roadmaster IS",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1994,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Cummins ISL 400–450HP class",
          horsepower: 400,
          chassis: "Freightliner / Spartan (by option)",
          notes: "High-line diesel 2006–2015 — ISL class (not Ford gas)"
        }
      ],
      description: "The Beaver Marquis was Oregon-built at the highest level of production quality available outside of Country Coach and Monaco — hand-laid hardwood, custom upholstery programs, and the Roadmaster Intrepid Suspension chassis. Pre-owned Marquis coaches maintain strong values and a passionate owner community that continues to support them technically."
    },
    Patriot: {
      type: "Class A Diesel",
      floorplans: ["37QB", "38BG", "40RB"],
      floorplansByYear: {
        "1999": ["37QB"],
        "2000": ["37QB"],
        "2001": ["37QB"],
        "2002": ["37QB", "38BG"],
        "2003": ["37QB", "38BG"],
        "2004": ["37QB", "38BG"],
        "2005": ["37QB", "38BG", "40RB"],
        "2006": ["37QB", "38BG", "40RB"],
        "2007": ["37QB", "38BG", "40RB"],
        "2008": ["37QB", "38BG", "40RB"],
        "2009": ["37QB", "38BG", "40RB"]
      },
      lengthRange: [
        37,
        40
      ],
      weightRange: [
        40000,
        48000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        199000,
        329000
      ],
      engine: "Cummins ISL 380HP",
      horsepower: 380,
      chassis: "Roadmaster IS",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 48,
      blackWater: 48,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1993,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Cummins ISB / ISL mid-diesel (era)",
          horsepower: 340,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default"
        }
      ],
      description: "The Beaver Patriot was Beaver Coach most popular model — a mid-luxury diesel pusher that delivered Oregon hand-craftsmanship and the Roadmaster chassis ride at a more accessible price point than the Marquis. The Patriot Thunder edition (2003–2007) remains particularly coveted for its aggressive styling and upgraded Cummins ISX."
    }
  },
  "National RV": {
    "Sea Breeze": {
      type: "Class A Gas",
      floorplans: ["8311", "8340", "8378"],
      floorplansByYear: {
        "1998": ["8311"],
        "1999": ["8311"],
        "2000": ["8311"],
        "2001": ["8311", "8340"],
        "2002": ["8311", "8340"],
        "2003": ["8311", "8340", "8378"],
        "2004": ["8311", "8340", "8378"],
        "2005": ["8311", "8340", "8378"],
        "2006": ["8311", "8340", "8378"],
        "2007": ["8311", "8340", "8378"]
      },
      lengthRange: [
        31,
        38
      ],
      weightRange: [
        22000,
        28000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        79000,
        139000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 80,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 1998,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2007,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The National RV Sea Breeze was a well-regarded California-built gas Class A — popular in the Western market for its value, solid construction, and extensive floorplan variety. The 2003–2006 models are considered the most reliable. Parts availability is now limited but an active owner community fills most needs."
    },
    "Tropi-Cal": {
      type: "Class A Diesel",
      floorplans: ["40PB", "43RQ", "40RB"],
      floorplansByYear: {
        "1998": ["40PB"],
        "1999": ["40PB"],
        "2000": ["40PB"],
        "2001": ["40PB", "43RQ"],
        "2002": ["40PB", "43RQ"],
        "2003": ["40PB", "43RQ", "40RB"],
        "2004": ["40PB", "43RQ", "40RB"],
        "2005": ["40PB", "43RQ", "40RB"],
        "2006": ["40PB", "43RQ", "40RB"],
        "2007": ["40PB", "43RQ", "40RB"]
      },
      lengthRange: [
        40,
        43
      ],
      weightRange: [
        42000,
        50000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        179000,
        299000
      ],
      engine: "Cummins ISL 340HP",
      horsepower: 340,
      chassis: "Spartan K2",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 48,
      blackWater: 46,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1964,
      warrantyYears: 1,
      yearStart: 2001,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2007,
          engine: "Cummins ISB / ISL mid-diesel (era)",
          horsepower: 340,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default"
        }
      ],
      description: "The National RV Tropi-Cal was the company flagship diesel pusher — a Spartan-chassis coach with California-influenced styling and above-average interior appointments for its price tier. Well regarded by the full-timing community for livability and storage capacity."
    }
  },
  "Gulf Stream Coach": {
    Conquest: {
      type: "Class A Gas",
      floorplans: ["8317", "8325", "8361", "8369"],
      floorplansByYear: {
        "1998": ["8317"],
        "1999": ["8317"],
        "2000": ["8317"],
        "2001": ["8317"],
        "2002": ["8317", "8325"],
        "2003": ["8317", "8325"],
        "2004": ["8317", "8325"],
        "2005": ["8317", "8325"],
        "2006": ["8317", "8325", "8361", "8369"],
        "2007": ["8317", "8325", "8361", "8369"],
        "2008": ["8317", "8325", "8361", "8369"],
        "2009": ["8317", "8325", "8361", "8369"],
        "2010": ["8317", "8325", "8361", "8369"],
        "2011": ["8317", "8325", "8361", "8369"],
        "2012": ["8317", "8325", "8361", "8369"]
      },
      lengthRange: [
        31,
        37
      ],
      weightRange: [
        22000,
        27000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        85000,
        149000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1971,
      warrantyYears: 1,
      yearStart: 1998,
      yearEnd: 2012,
      powertrainByYear: [
                {
          from: 2000,
          to: 2012,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Gulf Stream Conquest was the Indiana builder most popular Class A gas coach through the 2000s — solid Ford F53 chassis, competitive pricing, and a wide floorplan range. The 2002–2006 models are considered the sweet spot for reliability before mid-decade cost-cutting. Strong parts availability through the Gulf Stream dealer network."
    },
    Crescendo: {
      type: "Class A Diesel",
      floorplans: ["8394", "8382", "8399"],
      floorplansByYear: {
        "2000": ["8394"],
        "2001": ["8394"],
        "2002": ["8394"],
        "2003": ["8394", "8382"],
        "2004": ["8394", "8382"],
        "2005": ["8394", "8382"],
        "2006": ["8394", "8382", "8399"],
        "2007": ["8394", "8382", "8399"],
        "2008": ["8394", "8382", "8399"],
        "2009": ["8394", "8382", "8399"],
        "2010": ["8394", "8382", "8399"]
      },
      lengthRange: [
        38,
        40
      ],
      weightRange: [
        40000,
        48000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        179000,
        299000
      ],
      engine: "Cummins ISL 340HP",
      horsepower: 340,
      chassis: "Spartan K2",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 88,
      grayWater: 46,
      blackWater: 44,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1971,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2010,
      powertrainByYear: [
                {
          from: 2000,
          to: 2010,
          engine: "Cummins ISB / ISL mid-diesel (era)",
          horsepower: 340,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default"
        }
      ],
      description: "The Gulf Stream Crescendo was the company flagship diesel pusher during the 2000s — Spartan chassis, Cummins ISL power, and Gulf Stream residential-style interior at a competitive price. Strong value proposition versus Fleetwood Discovery and Winnebago Journey in the same segment during the era."
    },
    "BT Cruiser": {
      type: "Class C",
      floorplans: ["5210", "5230", "5245", "5291", "5270", "5316"],
      floorplansByYear: {
        "2008": ["5210", "5230"],
        "2009": ["5210", "5230"],
        "2010": ["5210", "5230"],
        "2011": ["5210", "5230"],
        "2012": ["5210", "5230"],
        "2013": ["5210", "5230", "5245", "5291"],
        "2014": ["5210", "5230", "5245", "5291"],
        "2015": ["5210", "5230", "5245", "5291"],
        "2016": ["5210", "5230", "5245", "5291"],
        "2017": ["5210", "5230", "5245", "5291"],
        "2018": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2019": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2020": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2021": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2022": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2023": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2024": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2025": ["5210", "5230", "5245", "5291", "5270", "5316"],
        "2026": ["5210", "5230", "5245", "5291", "5270", "5316"]
      },
      lengthRange: [
        23,
        30
      ],
      weightRange: [
        10000,
        14000
      ],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [
        79900,
        129000
      ],
      engine: "Ford V8 6.2L",
      horsepower: 385,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1983,
      warrantyYears: 1,
      yearStart: 2008,
      powertrainByYear: [
        {
          from: 2008,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        }
      ],
      description: "Gulf Stream BT Cruiser is a popular value Class C with unique front-end styling and practical floorplans."
    },
    Yellowstone: {
      type: "Class C",
      floorplans: ["6316", "6320", "6330", "6341", "6350"],
      floorplansByYear: {
        "2012": ["6316", "6320"],
        "2013": ["6316", "6320"],
        "2014": ["6316", "6320"],
        "2015": ["6316", "6320"],
        "2016": ["6316", "6320", "6330"],
        "2017": ["6316", "6320", "6330"],
        "2018": ["6316", "6320", "6330"],
        "2019": ["6316", "6320", "6330"],
        "2020": ["6316", "6320", "6330", "6341", "6350"],
        "2021": ["6316", "6320", "6330", "6341", "6350"],
        "2022": ["6316", "6320", "6330", "6341", "6350"],
        "2023": ["6316", "6320", "6330", "6341", "6350"],
        "2024": ["6316", "6320", "6330", "6341", "6350"],
        "2025": ["6316", "6320", "6330", "6341", "6350"],
        "2026": ["6316", "6320", "6330", "6341", "6350"]
      },
      lengthRange: [
        30,
        34
      ],
      weightRange: [
        13500,
        16000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        99900,
        154000
      ],
      engine: "Ford V8 7.3L",
      horsepower: 350,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1983,
      warrantyYears: 1,
      yearStart: 2012,
      powertrainByYear: [
        {
          from: 2012,
          to: 2015,
          engine: "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)"
        }
      ],
      description: "Gulf Stream Yellowstone offers longer Class C living with dual slides for extended trips."
    }
  },
  "Damon Motor Coach": {
    Ultrasport: {
      type: "Class A Gas",
      floorplans: ["4351", "4371", "4391", "4373"],
      floorplansByYear: {
        "1999": ["4351"],
        "2000": ["4351"],
        "2001": ["4351"],
        "2002": ["4351", "4371"],
        "2003": ["4351", "4371"],
        "2004": ["4351", "4371"],
        "2005": ["4351", "4371", "4391", "4373"],
        "2006": ["4351", "4371", "4391", "4373"],
        "2007": ["4351", "4371", "4391", "4373"],
        "2008": ["4351", "4371", "4391", "4373"],
        "2009": ["4351", "4371", "4391", "4373"]
      },
      lengthRange: [
        33,
        39
      ],
      weightRange: [
        22000,
        27000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        89000,
        159000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 78,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 80,
      founded: 1969,
      warrantyYears: 1,
      yearStart: 1999,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Damon Ultrasport was the company entry-level gas Class A — reliable Ford F53 chassis, a no-nonsense interior, and Damon straightforward dealer service. The 2003–2007 Ultrasport models are considered the most refined; Thor parts compatibility after the 2001 acquisition improves ongoing serviceability."
    },
    Daybreak: {
      type: "Class A Gas",
      floorplans: ["3270", "3374", "3376"],
      floorplansByYear: {
        "1999": ["3270"],
        "2000": ["3270"],
        "2001": ["3270"],
        "2002": ["3270", "3374"],
        "2003": ["3270", "3374"],
        "2004": ["3270", "3374"],
        "2005": ["3270", "3374", "3376"],
        "2006": ["3270", "3374", "3376"],
        "2007": ["3270", "3374", "3376"],
        "2008": ["3270", "3374", "3376"],
        "2009": ["3270", "3374", "3376"]
      },
      lengthRange: [
        32,
        37
      ],
      weightRange: [
        20000,
        25000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        79000,
        135000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 70,
      grayWater: 36,
      blackWater: 36,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 16,
      ceilingHeight: 79,
      founded: 1969,
      warrantyYears: 1,
      yearStart: 1997,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Damon Daybreak was a well-priced entry-level gas Class A popular during the early 2000s RV boom. Straightforward construction, proven Ford F53 mechanics, and a family-friendly bunkhouse layout in several configurations. Thor acquisition means current Ford RV dealer network can support most common service needs."
    }
  },
  "Georgie Boy": {
    "Cruise Master": {
      type: "Class A Gas",
      floorplans: ["3625", "3640", "3850"],
      floorplansByYear: {
        "1997": ["3625"],
        "1998": ["3625"],
        "1999": ["3625"],
        "2000": ["3625", "3640"],
        "2001": ["3625", "3640"],
        "2002": ["3625", "3640"],
        "2003": ["3625", "3640", "3850"],
        "2004": ["3625", "3640", "3850"],
        "2005": ["3625", "3640", "3850"],
        "2006": ["3625", "3640", "3850"],
        "2007": ["3625", "3640", "3850"]
      },
      lengthRange: [
        34,
        38
      ],
      weightRange: [
        22000,
        27000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        79000,
        139000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 74,
      grayWater: 40,
      blackWater: 38,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1997,
      yearEnd: 2007,
      powertrainByYear: [
                {
          from: 2000,
          to: 2007,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Georgie Boy Cruise Master was the company flagship gas Class A during the late 1990s and early 2000s — popular with families for its spacious bunkhouse layouts and value pricing. Coachmen parts compatibility after the 2003 acquisition means service support remains accessible through the Coachmen dealer network."
    },
    Pursuit: {
      type: "Class A Gas",
      floorplans: ["3605", "3650"],
      floorplansByYear: {
        "1999": ["3605"],
        "2000": ["3605"],
        "2001": ["3605", "3650"],
        "2002": ["3605", "3650"],
        "2003": ["3605", "3650"],
        "2004": ["3605", "3650"],
        "2005": ["3605", "3650"],
        "2006": ["3605", "3650"],
        "2007": ["3605", "3650"]
      },
      lengthRange: [
        34,
        37
      ],
      weightRange: [
        20000,
        25000
      ],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [
        69000,
        119000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 68,
      grayWater: 36,
      blackWater: 36,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 15,
      ceilingHeight: 79,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1999,
      yearEnd: 2007,
      powertrainByYear: [
                {
          from: 2000,
          to: 2007,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Georgie Boy Pursuit was the entry-level Georgie Boy gas Class A — an affordable option during the early 2000s RV boom. Clean layout, manageable length, and Ford F53 reliability made it popular with first-time Class A buyers. Coachmen after-acquisition parts compatibility is a practical serviceability advantage."
    }
  },
  "Monaco Coach Classic": {
    Signature: {
      type: "Class A Diesel",
      floorplans: ["42SA", "45BM", "44BD"],
      floorplansByYear: {
        "1997": ["42SA"],
        "1998": ["42SA"],
        "1999": ["42SA"],
        "2000": ["42SA", "45BM"],
        "2001": ["42SA", "45BM"],
        "2002": ["42SA", "45BM"],
        "2003": ["42SA", "45BM"],
        "2004": ["42SA", "45BM", "44BD"],
        "2005": ["42SA", "45BM", "44BD"],
        "2006": ["42SA", "45BM", "44BD"],
        "2007": ["42SA", "45BM", "44BD"],
        "2008": ["42SA", "45BM", "44BD"],
        "2009": ["42SA", "45BM", "44BD"]
      },
      lengthRange: [
        42,
        45
      ],
      weightRange: [
        48000,
        56000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        449000,
        699000
      ],
      engine: "Cummins ISX 600HP",
      horsepower: 600,
      chassis: "Roadmaster IS Custom",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 110,
      grayWater: 60,
      blackWater: 56,
      generator: "Onan 12500W Diesel QD",
      awningLength: 24,
      ceilingHeight: 86,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1997,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan / Freightliner (by model)",
          notes: "Flagship diesel era — ISX 600 class (pre-X15 naming)"
        }
      ],
      description: "The Monaco Signature was the company ultra-premium flagship — above the Dynasty in every dimension. Built on Monaco proprietary Roadmaster IS Custom chassis with hand-selected hardwoods, marble countertops, and full-bath suites. Pre-owned Signatures from 2002–2007 remain among the most sought-after classic diesel pushers, commanding $150,000–$350,000 on the secondary market."
    },
    Windsor: {
      type: "Class A Diesel",
      floorplans: ["42PBQ", "44DBT"],
      floorplansByYear: {
        "1998": ["42PBQ"],
        "1999": ["42PBQ"],
        "2000": ["42PBQ"],
        "2001": ["42PBQ", "44DBT"],
        "2002": ["42PBQ", "44DBT"],
        "2003": ["42PBQ", "44DBT"],
        "2004": ["42PBQ", "44DBT"],
        "2005": ["42PBQ", "44DBT"],
        "2006": ["42PBQ", "44DBT"],
        "2007": ["42PBQ", "44DBT"],
        "2008": ["42PBQ", "44DBT"],
        "2009": ["42PBQ", "44DBT"]
      },
      lengthRange: [
        42,
        44
      ],
      weightRange: [
        46000,
        52000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        329000,
        499000
      ],
      engine: "Cummins ISL 400HP",
      horsepower: 400,
      chassis: "Roadmaster IS",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 52,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1998,
      yearEnd: 2009,
      powertrainByYear: [
                {
          from: 2000,
          to: 2009,
          engine: "Cummins ISL 400–450HP class",
          horsepower: 400,
          chassis: "Freightliner / Spartan (by option)",
          notes: "High-line diesel 2006–2015 — ISL class (not Ford gas)"
        }
      ],
      description: "The Monaco Windsor was a mid-luxury flagship — positioned between the Dynasty and Signature with the same legendary Roadmaster IS chassis ride quality but more accessible pricing. The Windsor 42PBQ with its outdoor patio layout was one of the first coaches to popularize the outdoor living concept that became standard on premium coaches a decade later."
    }
  },
  "Fleetwood Classic": {
    "American Heritage": {
      type: "Class A Diesel",
      floorplans: ["40Q", "42Q", "45B"],
      floorplansByYear: {
        "1996": ["40Q"],
        "1997": ["40Q"],
        "1998": ["40Q"],
        "1999": ["40Q", "42Q"],
        "2000": ["40Q", "42Q"],
        "2001": ["40Q", "42Q", "45B"],
        "2002": ["40Q", "42Q", "45B"],
        "2003": ["40Q", "42Q", "45B"],
        "2004": ["40Q", "42Q", "45B"],
        "2005": ["40Q", "42Q", "45B"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        44000,
        52000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        299000,
        499000
      ],
      engine: "Cummins ISL 380HP",
      horsepower: 380,
      chassis: "Spartan K2",
      fuelType: "Diesel",
      recalls: 1,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 95,
      grayWater: 50,
      blackWater: 48,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 1996,
      yearEnd: 2005,
      powertrainByYear: [
        {
          from: 2000,
          to: 2005,
          engine: "Cummins ISB / ISC mid-diesel (era)",
          horsepower: 300,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2000–2005 — Cummins diesel, not Ford 7.3 gas"
        }
      ],
      description: "The Fleetwood American Heritage was the company premium diesel tier above the Discovery during the late 1990s and early 2000s — hand-crafted interior millwork, upscale fabrics, and the Spartan K2 chassis. Discontinued in 2005 when Fleetwood consolidated its premium lineup. Parts support through the Fleetwood/REV Group dealer network remains strong."
    },
    Providence: {
      type: "Class A Diesel",
      floorplans: ["39D", "43A", "45A"],
      floorplansByYear: {
        "1998": ["39D"],
        "1999": ["39D"],
        "2000": ["39D", "43A"],
        "2001": ["39D", "43A"],
        "2002": ["39D", "43A", "45A"],
        "2003": ["39D", "43A", "45A"],
        "2004": ["39D", "43A", "45A"],
        "2005": ["39D", "43A", "45A"]
      },
      lengthRange: [
        39,
        45
      ],
      weightRange: [
        46000,
        54000
      ],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [
        349000,
        599000
      ],
      engine: "Cummins ISX 600HP",
      horsepower: 600,
      chassis: "Spartan K3",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 105,
      grayWater: 55,
      blackWater: 52,
      generator: "Onan 12500W Diesel QD",
      awningLength: 24,
      ceilingHeight: 85,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 1999,
      yearEnd: 2006,
      powertrainByYear: [
                {
          from: 2000,
          to: 2006,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Spartan K3",
          notes: "Fleetwood Providence flagship diesel — ISX 600 class (pre-X15 naming)"
        }
      ],
      description: "The Fleetwood Providence was the absolute top of the Fleetwood diesel lineup — their answer to Monaco Dynasty and American Coach Tradition. Spartan K3 chassis, five slideouts, and an interior quality that matched anything on the market. Discontinued when Fleetwood rebranded its luxury tier. Pre-owned Providences in good condition are highly regarded purchases."
    }
  },
  "Winnebago Classic": {
    Chieftain: {
      type: "Class A Gas",
      floorplans: ["30Y", "33V", "36G", "39V"],
      floorplansByYear: {
        "2000": ["30Y"],
        "2001": ["30Y"],
        "2002": ["30Y", "33V"],
        "2003": ["30Y", "33V"],
        "2004": ["30Y", "33V", "36G", "39V"],
        "2005": ["30Y", "33V", "36G", "39V"],
        "2006": ["30Y", "33V", "36G", "39V"]
      },
      lengthRange: [
        30,
        39
      ],
      weightRange: [
        22000,
        28000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        89000,
        169000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 38,
      blackWater: 38,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 1966,
      yearEnd: 2006,
      powertrainByYear: [
                {
          from: 2000,
          to: 2006,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)"
        }
      ],
      description: "The Winnebago Chieftain was one of the most recognizable names in American RV history — a workhorse Class A gas coach that defined attainable motorhome travel for millions of families from 1966 through 2006. The 2001–2006 final production models are considered the most refined and best-equipped Chieftains ever built. Parts availability through the Winnebago dealer network remains excellent."
    },
    "Ultimate Freedom": {
      type: "Class A Diesel",
      floorplans: ["40CD", "40QD", "43BD"],
      floorplansByYear: {
        "2000": ["40CD"],
        "2001": ["40CD"],
        "2002": ["40CD", "40QD"],
        "2003": ["40CD", "40QD"],
        "2004": ["40CD", "40QD", "43BD"],
        "2005": ["40CD", "40QD", "43BD"],
        "2006": ["40CD", "40QD", "43BD"]
      },
      lengthRange: [
        40,
        43
      ],
      weightRange: [
        42000,
        50000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        219000,
        349000
      ],
      engine: "Cummins ISL 340HP",
      horsepower: 340,
      chassis: "Freightliner XCS",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 46,
      blackWater: 46,
      generator: "Onan 8000W Diesel QD",
      awningLength: 20,
      ceilingHeight: 82,
      founded: 1958,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2007,
      powertrainByYear: [
                        {
          from: 2000,
          to: 2006,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC",
          notes: "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default"
        }
      ],
      description: "The Winnebago Ultimate Freedom was the company premium diesel pusher before the Journey and Grand Tour replaced it — built on the proven Freightliner XCS chassis with Winnebago signature interior quality and the reliability that the brand is known for. The 2002–2005 models are considered the sweet spot for quality and feature content."
    }
  },
  "Newmar Classic": {
    "London Aire": {
      type: "Class A Diesel",
      floorplans: ["4001", "4504", "4550"],
      floorplansByYear: {
        "1995": ["4001"],
        "1996": ["4001"],
        "1997": ["4001"],
        "1998": ["4001"],
        "1999": ["4001", "4504"],
        "2000": ["4001", "4504"],
        "2001": ["4001", "4504"],
        "2002": ["4001", "4504"],
        "2003": ["4001", "4504", "4550"],
        "2004": ["4001", "4504", "4550"],
        "2005": ["4001", "4504", "4550"],
        "2006": ["4001", "4504", "4550"],
        "2007": ["4001", "4504", "4550"],
        "2008": ["4001", "4504", "4550"]
      },
      lengthRange: [
        40,
        45
      ],
      weightRange: [
        46000,
        54000
      ],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [
        299000,
        499000
      ],
      engine: "Cummins ISX 600HP",
      horsepower: 600,
      chassis: "Spartan K3",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1991,
      yearEnd: 2008,
      powertrainByYear: [
                {
          from: 2000,
          to: 2008,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan / Freightliner (by model)",
          notes: "Flagship diesel era — ISX 600 class (pre-X15 naming)"
        }
      ],
      description: "The Newmar London Aire was the company flagship diesel pusher before the Mountain Aire took that role — a hand-crafted, ultra-premium coach on the Spartan K3 chassis that the enthusiast community still considers one of the finest production motorhomes ever built. Pre-owned 2000–2005 London Aires in good condition command $150,000–$275,000."
    },
    Scottsdale: {
      type: "Class A Gas",
      floorplans: ["3601", "3801", "3901"],
      floorplansByYear: {
        "1998": ["3601"],
        "1999": ["3601"],
        "2000": ["3601", "3801"],
        "2001": ["3601", "3801"],
        "2002": ["3601", "3801", "3901"],
        "2003": ["3601", "3801", "3901"],
        "2004": ["3601", "3801", "3901"],
        "2005": ["3601", "3801", "3901"]
      },
      lengthRange: [
        35,
        39
      ],
      weightRange: [
        22000,
        28000
      ],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [
        99000,
        169000
      ],
      engine: "Ford V10 6.8L",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 75,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 18,
      ceilingHeight: 80,
      founded: 1968,
      warrantyYears: 1,
      yearStart: 1997,
      yearEnd: 2005,
      powertrainByYear: [
        {
          from: 2000,
          to: 2005,
          engine: "Ford Triton V10 6.8L",
          horsepower: 310,
          chassis: "Ford F53",
          notes: "2000–2005 gas Class A — Triton V10 era"
        }
      ],
      description: "The Newmar Scottsdale was the company entry-level gas Class A during the early 2000s — bringing Newmar hand-crafted cabinetry and tight construction standards to the Ford F53 gas chassis at an accessible price. Discontinued 2005 when Newmar consolidated its gas lineup under the Kountry Star nameplate."
    }
  }
};


export const CLASSIC_BRANDS: string[] = [
  "Airstream",
  "Winnebago",
  "Fleetwood",
  "Holiday Rambler",
  "Newmar",
  "Tiffin",
  "National RV",
  "Monaco",
  "Beaver",
  "Country Coach",
];

export const MAKES = Object.keys(RV_DATA).sort();
export const YEARS = Array.from({ length: 26 }, (_, i) => String(2027 - i)); // 2027 → 2002

export interface MaintenanceItem {
  task: string;
  interval: string;
  category: string;
  priority: "Critical" | "Important" | "Routine";
}

export function getMaintenanceSchedule(rv: RVSpec): MaintenanceItem[] {
  const isDiesel = rv.fuelType === "Diesel";
  const isTowable =
    rv.fuelType.includes("towable") || rv.fuelType.includes("truck camper");
  const isClassB = rv.type === "Class B";

  const base: MaintenanceItem[] = [
    { task: "Roof Seal Inspection & Re-caulk", interval: "Every 12 months", category: "Exterior", priority: "Critical" },
    { task: "Slideout Mechanism Lubrication", interval: "Every 3 months", category: "RV Systems", priority: "Important" },
    { task: "Slideout Rubber Seal Treatment", interval: "Every 3 months", category: "Exterior", priority: "Important" },
    { task: "Fresh/Gray/Black Tank Flush & Treatment", interval: "Every 3 months", category: "RV Systems", priority: "Important" },
    { task: "Water Heater Anode Rod Replacement", interval: "Every 12 months", category: "RV Systems", priority: "Important" },
    { task: "LP Gas Leak Test", interval: "Every 12 months", category: "Safety", priority: "Critical" },
    { task: "Smoke & CO Detector Battery Test", interval: "Every 6 months", category: "Safety", priority: "Critical" },
    { task: "Fire Extinguisher Inspection", interval: "Every 12 months", category: "Safety", priority: "Critical" },
    { task: "Awning Fabric Inspection & Lubrication", interval: "Every 12 months", category: "Exterior", priority: "Routine" },
    { task: "Battery Water Level Check (flooded)", interval: "Every 3 months", category: "RV Systems", priority: "Important" },
    { task: "Interior Appliance Inspection", interval: "Every 12 months", category: "Interior", priority: "Routine" },
    { task: "Winterization / Dewinterization", interval: "Seasonal", category: "RV Systems", priority: "Important" },
    { task: "Exterior Wash & Wax / Polish", interval: "Every 6 months", category: "Exterior", priority: "Routine" },
    { task: "Refrigerator Coil Cleaning", interval: "Every 12 months", category: "Interior", priority: "Routine" },
    { task: "Furnace Vent & Burner Cleaning", interval: "Every 12 months", category: "RV Systems", priority: "Important" },
    { task: "AC Filter Cleaning", interval: "Every 3 months", category: "Interior", priority: "Important" },
    { task: "Slide Topper Inspection", interval: "Every 12 months", category: "Exterior", priority: "Routine" },
    { task: "Sewer Hose & Fitting Inspection", interval: "Every 12 months", category: "RV Systems", priority: "Important" },
  ];

  if (!isTowable) {
    if (isDiesel) {
      base.unshift(
        { task: "Engine Oil & Filter Change", interval: "Every 15,000 miles", category: "Engine", priority: "Critical" },
        { task: "Diesel Fuel Filter Replacement", interval: "Every 30,000 miles", category: "Engine", priority: "Critical" },
        { task: "DEF (AdBlue) Level Check", interval: "Every 5,000 miles", category: "Engine", priority: "Important" },
        { task: "Air Filter Inspection", interval: "Every 30,000 miles", category: "Engine", priority: "Important" },
        { task: "Coolant Flush", interval: "Every 100,000 miles or 5 years", category: "Engine", priority: "Important" },
        { task: "Transmission Service", interval: "Every 50,000 miles", category: "Chassis", priority: "Critical" },
        { task: "Turbocharger Inspection", interval: "Every 50,000 miles", category: "Engine", priority: "Important" },
        { task: "Serpentine Belt Inspection", interval: "Every 50,000 miles", category: "Engine", priority: "Critical" },
        { task: "Diesel Exhaust Fluid (DEF) System Inspection", interval: "Every 30,000 miles", category: "Engine", priority: "Important" },
      );
    } else {
      base.unshift(
        { task: "Engine Oil & Filter Change", interval: "Every 5,000 miles", category: "Engine", priority: "Critical" },
        { task: "Air Filter Replacement", interval: "Every 30,000 miles", category: "Engine", priority: "Important" },
        { task: "Spark Plug Replacement", interval: "Every 60,000 miles", category: "Engine", priority: "Important" },
        { task: "Coolant Flush", interval: "Every 50,000 miles or 5 years", category: "Engine", priority: "Important" },
        { task: "Transmission Service", interval: "Every 30,000 miles", category: "Chassis", priority: "Critical" },
        { task: "Serpentine Belt Replacement", interval: "Every 60,000 miles", category: "Engine", priority: "Critical" },
        { task: "Throttle Body Cleaning", interval: "Every 30,000 miles", category: "Engine", priority: "Routine" },
      );
    }
    base.push(
      { task: "Chassis Lubrication", interval: "Every 12 months or 15,000 miles", category: "Chassis", priority: "Important" },
      { task: "Brake Inspection", interval: "Every 12 months", category: "Chassis", priority: "Critical" },
      { task: "Brake Fluid Flush", interval: "Every 2 years", category: "Chassis", priority: "Important" },
      { task: "Tire Rotation & Pressure Check", interval: "Every 7,500 miles", category: "Chassis", priority: "Critical" },
      { task: "Tire Age Inspection (replace at 7 years)", interval: "Annually", category: "Chassis", priority: "Critical" },
      { task: "Generator Oil Change", interval: "Every 100-150 hours", category: "RV Systems", priority: "Critical" },
      { task: "Generator Load Test", interval: "Every 12 months", category: "RV Systems", priority: "Important" },
      { task: "Generator Air Filter Replacement", interval: "Every 200 hours", category: "RV Systems", priority: "Important" },
      { task: "Leveling System Hydraulic Fluid", interval: "Every 24 months", category: "Chassis", priority: "Important" },
      { task: "Air Suspension Inspection (diesel)", interval: "Every 12 months", category: "Chassis", priority: "Important" },
      { task: "Steering System Inspection", interval: "Every 12 months", category: "Chassis", priority: "Critical" },
      { task: "Differential Service", interval: "Every 50,000 miles", category: "Chassis", priority: "Important" },
    );
  } else {
    base.push(
      { task: "Tire Pressure Check & Rotation", interval: "Every 7,500 miles towed", category: "Chassis", priority: "Critical" },
      { task: "Tire Age Inspection (replace at 7 years)", interval: "Annually", category: "Chassis", priority: "Critical" },
      { task: "Wheel Bearing Inspection & Repack", interval: "Every 12,000 miles", category: "Chassis", priority: "Critical" },
      { task: "Brake Controller Calibration", interval: "Every 12 months", category: "Safety", priority: "Important" },
      { task: "Electric Brake Magnet Inspection", interval: "Every 12,000 miles", category: "Chassis", priority: "Critical" },
      { task: "Hitch Ball & Coupler Inspection", interval: "Before every trip", category: "Safety", priority: "Critical" },
      { task: "Safety Chain & Breakaway Cable", interval: "Before every trip", category: "Safety", priority: "Critical" },
      { task: "Landing Gear Lubrication", interval: "Every 6 months", category: "Chassis", priority: "Important" },
      { task: "Equalizer Hitch Inspection", interval: "Every 12 months", category: "Safety", priority: "Important" },
    );
  }

  if (isClassB) {
    base.push(
      { task: "Van Chassis Service (OEM schedule)", interval: "Per chassis manual", category: "Chassis", priority: "Critical" },
    );
  }

  return base;
}
