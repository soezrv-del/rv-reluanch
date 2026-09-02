// ─── SHARED RV DATABASE ───────────────────────────────────────────────────────
// Full live catalog. Do not statically import this module on launchpad / cold
// start — Facts, search, and compare load it via ensureCatalogLoaded().

export {
  CLASSIC_BRANDS,
  RV_CARD_IMAGE,
  YEARS,
  getMaintenanceSchedule,
} from "./rvTypes";
export type {
  MaintenanceItem,
  PowertrainYearBand,
  RVSpec,
} from "./rvTypes";

import { RV_CARD_IMAGE, type RVSpec } from "./rvTypes";

export const RV_DATA: Record<string, Record<string, RVSpec>> = {
  Newmar: {
    Essex: {
      type: "Class A Diesel",
      floorplans: ["4551", "4544", "4534", "4519", "4561", "4553", "4580", "4521", "4533", "4543", "4545", "4550", "4559", "4569", "4576", "4578", "4579", "4583", "4595", "4598", "4513", "4584", "4531", "4536", "4537", "4501", "4503", "4507", "4518", "4565", "4568", "4599"],
      floorplansByYear: {
        "2012": ["4551", "4544", "4534"],
        "2013": ["4551", "4544", "4534"],
        "2014": ["4551", "4544", "4534"],
        // Brochure 2015_Essex: 4501 | 4503 | 4553 | 4568 | 4599 — Freightliner SL / Spartan K3 ISX 600
        "2015": ["4501", "4503", "4553", "4568", "4599"],
        // Brochure 2016_Essex: 4503 | 4507 | 4518 | 4519 | 4553 | 4565 | 4598 — Freightliner SL / Spartan K3 ISX 600
        "2016": ["4503", "4507", "4518", "4519", "4553", "4565", "4598"],
        // Brochure 2017_Essex: 4513 | 4519 | 4533 | 4553 | 4584 | 4598 — Freightliner SL / Spartan K3 ISX 600
        "2017": ["4513", "4519", "4533", "4553", "4584", "4598"],
        // Brochure 2018_Essex: 4531 | 4533 | 4534 | 4536 | 4537 | 4553 | 4598 — X15 605
        "2018": ["4531", "4533", "4534", "4536", "4537", "4553", "4598"],
        // Brochure 2019_Essex: 4533 | 4534 | 4543 | 4550 | 4551 | 4576 | 4579 | 4598 — Freightliner SL / Spartan K3 605
        "2019": ["4533", "4534", "4543", "4550", "4551", "4576", "4579", "4598"],
        // Brochure 2020_Essex: 4533 | 4543 | 4551 | 4559 | 4569 | 4579 — Spartan K3 Tag 605
        "2020": ["4533", "4543", "4551", "4559", "4569", "4579"],
        // Brochure 2021_Essex: 4533 | 4543 | 4551 | 4569 | 4578 | 4583 — Spartan K3 Tag 605
        "2021": ["4533", "4543", "4551", "4569", "4578", "4583"],
        // Brochure 2022_Essex: 4533 | 4551 | 4569 | 4578 — Spartan K3 Tag 605
        "2022": ["4533", "4551", "4569", "4578"],
        // Brochure 2023_Essex: 4521 | 4551 | 4569 | 4578 | 4595 — X15 605 / 1,950
        "2023": ["4521", "4551", "4569", "4578", "4595"],
        // Brochure 2024-essex: 4521 | 4551 | 4569 | 4595
        "2024": ["4521", "4551", "4569", "4595"],
        // Brochure 2025-essex: 4521 | 4551 | 4569 | 4595 — X15 605 / 1,950
        "2025": ["4521", "4551", "4569", "4595"],
        // Brochure 2026-essex: 4521 | 4551 | 4569 | 4595
        "2026": ["4521", "4551", "4569", "4595"],
        // Brochure MY27EX: 4545 | 4551 | 4569 | 4595
        "2027": ["4545", "4551", "4569", "4595"]
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
      chassis: "Freightliner SL Tag / Spartan K3 (by option)",
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
      acUnits: "3 × 15,000 BTU heat pump",
      awningLength: 24,
      ceilingHeight: 86,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2012,
      description: "Newmar Essex — limited-production flagship diesel. Recent OEM: Cummins X15 605 / 1,950 on Freightliner SL Tag or Spartan K3 (brochure option). Hand-built residential interiors.",
      powertrainByYear: [
        {
          from: 2012,
          to: 2017,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          notes: "OEM 2015–2017 Essex: Freightliner SL or Spartan K3 tag, ISX 600. Do not copy MY18+ X15 605 onto 2015–2017."
        },
        {
          from: 2018,
          to: 2027,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY18 Essex: X15 605 (not ISX 600). MY19 Freightliner SL or Spartan K3; MY20–23 chassis tables Spartan K3 Tag; later years Freightliner SL or Spartan K3 — confirm build sheet."
        }
      ]
    },
    "King Aire": {
      type: "Class A Diesel",
      floorplans: ["45AHQ", "45IQH", "4531", "45RBQ", "4553", "42AQHP", "45AQHP", "45KQ", "4521", "4533", "4534", "4540", "4545", "4546", "4549", "4550", "4558", "4559", "4569", "4578", "4596", "4598", "4513", "4519", "4584", "4536", "4537", "4501", "4503", "4507", "4518", "4565", "4568", "4599"],
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
        // Brochure 2015_King_Aire: 4501 | 4503 | 4553 | 4568 | 4599 — Spartan K3 ISX 600
        "2015": ["4501", "4503", "4553", "4568", "4599"],
        // Brochure 2016_King_Aire: 4503 | 4507 | 4518 | 4519 | 4553 | 4565 | 4598 — Spartan K3 ISX 600
        "2016": ["4503", "4507", "4518", "4519", "4553", "4565", "4598"],
        // Brochure 2017_King_Aire: 4513 | 4519 | 4533 | 4553 | 4584 | 4598 — Spartan K3 ISX 600
        "2017": ["4513", "4519", "4533", "4553", "4584", "4598"],
        // Brochure 2018_King_Aire: 4531 | 4533 | 4534 | 4536 | 4537 | 4553 | 4598 — Spartan K3 Tag X15 605
        "2018": ["4531", "4533", "4534", "4536", "4537", "4553", "4598"],
        // Brochure 2019_King_Aire: 4531 | 4533 | 4534 | 4546 | 4549 | 4550 | 4553 | 4598 — Spartan K3 Tag 605
        "2019": ["4531", "4533", "4534", "4546", "4549", "4550", "4553", "4598"],
        // Brochure 2020_King_Aire: 4531 | 4533 | 4549 | 4553 | 4559 | 4569 — Spartan K3 Tag 605
        "2020": ["4531", "4533", "4549", "4553", "4559", "4569"],
        // Brochure 2021_King_Aire: 4531 | 4533 | 4553 — Spartan K3 Tag 605
        "2021": ["4531", "4533", "4553"],
        // Brochure 2022_King_Aire: 4531 | 4533 | 4578 — Spartan K3 Tag 605
        "2022": ["4531", "4533", "4578"],
        // Brochure 2023_King_Aire / 2024-king-aire: 4521 | 4531 | 4558 | 4596
        "2023": ["4521", "4531", "4558", "4596"],
        "2024": ["4521", "4531", "4558", "4596"],
        // Brochure 2025-king-aire: 4521 | 4531 | 4558 | 4596
        "2025": ["4521", "4531", "4558", "4596"],
        // Brochure 2026_king-aire: 4521 | 4531 | 4540 | 4596
        "2026": ["4521", "4531", "4540", "4596"],
        // Brochure MY27KG: 4531 | 4545 | 4596 — Spartan K3, X15 605/1950
        "2027": ["4531", "4545", "4596"]
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
      generator: "Onan 12.5kW Quiet Diesel",
      acUnits: "3 × 15,000 BTU heat pump",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Newmar King Aire — ultra-luxury diesel under Essex. OEM MY25–27: Spartan K3 Tag + Cummins X15 605 / 1,950; Onan 12.5 kW; 3×15k heat-pump A/C.",
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
          to: 2014,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2014 mid/high diesel Class A — 2013–2014 slice locks OEM plans"
        },
        {
          from: 2015,
          to: 2017,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Spartan K3",
          notes: "OEM 2015–2017 King Aire: Spartan K3 tag ISX 600. Do not copy MY18+ X15 605 onto 2015–2017."
        },
        {
          from: 2018,
          to: 2027,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY18 King Aire: Spartan K3 Tag X15 605 (not ISX 600). Do not copy MY21+ plans onto 2018–2020."
        },
        
      ]
    },
    "Mountain Aire": {
      type: "Class A Diesel",
      floorplans: ["4536", "4553", "4304", "4526", "4118", "4546", "4574", "4536PBD", "4528", "4544", "3823", "3825", "4002", "4018", "4102", "4521", "4533", "4534", "4535", "4543", "4550", "4551", "4569", "4576", "4579", "4583", "4586", "4589", "4591", "4595", "4513", "4519", "4525", "4584", "4531", "4537", "4047", "4501", "4503", "4518", "4565", "4568", "4598", "4599"],
      floorplansByYear: {
        "2008": ["4536", "4553", "4304"],
        "2009": ["4536", "4553", "4304"],
        "2010": ["4536", "4553", "4304"],
        "2011": ["4536", "4553", "4304"],
        "2012": ["4536", "4553", "4304"],
        "2013": ["4536", "4553", "4304"],
        "2014": ["4536", "4553", "4304"],
        // Brochure 2015_Mountain_Aire: 4501 | 4503 | 4553 | 4568 | 4599 — ISX 500
        "2015": ["4501", "4503", "4553", "4568", "4599"],
        // Brochure 2016_Mountain_Aire: 4503 | 4518 | 4519 | 4553 | 4565 | 4598 — Freightliner SL / Spartan K2 tag, ISX 500
        "2016": ["4503", "4518", "4519", "4553", "4565", "4598"],
        // Brochure 2017_Mountain_Aire: 4513 | 4519 | 4525 | 4533 | 4553 | 4584 — ISX 500
        "2017": ["4513", "4519", "4525", "4533", "4553", "4584"],
        // Brochure 2018_Mountain_Aire: 4047 | 4531 | 4533 | 4534 | 4535 | 4536 | 4537 | 4553 — Cummins 500
        "2018": ["4047", "4531", "4533", "4534", "4535", "4536", "4537", "4553"],
        // Brochure 2019_Mountain_Aire: 4018 | 4533 | 4534 | 4535 | 4543 | 4550 | 4551 | 4576 | 4579 — X12 500
        "2019": ["4018", "4533", "4534", "4535", "4543", "4550", "4551", "4576", "4579"],
        // Brochure 2020_Mountain_Aire: 4002 | 4018 | 4533 | 4535 | 4543 | 4551 | 4569 | 4579 — X12 500
        "2020": ["4002", "4018", "4533", "4535", "4543", "4551", "4569", "4579"],
        // Brochure 2021_Mountain_Aire: 4102 | 4118 | 4533 | 4535 | 4543 | 4551 | 4583 — X12 500 / 1,695
        "2021": ["4102", "4118", "4533", "4535", "4543", "4551", "4583"],
        // Brochure 2022_Mountain_Aire: 4118 | 4533 | 4535 | 4543 | 4551 | 4589 — X12 500 / 1,695
        "2022": ["4118", "4533", "4535", "4543", "4551", "4589"],
        // Brochure 2023_Mountain_Aire: 4118 | 4521 | 4535 | 4551 | 4586 | 4591 — X12 500 / 1,695
        "2023": ["4118", "4521", "4535", "4551", "4586", "4591"],
        // Brochure 2024-mountain-aire: 3823 | 3825 | 4118 | 4551 | 4591 — X12 525 / 1,695
        "2024": ["3823", "3825", "4118", "4551", "4591"],
        // Brochure 2025-mountain-aire: 3823 | 3825 | 4118 | 4551 | 4595 — X12 525 / 1,695
        "2025": ["3823", "3825", "4118", "4551", "4595"],
        // Brochure 2026-mountain-aire: 3823 | 3825 | 4118 | 4551
        "2026": ["3823", "3825", "4118", "4551"],
        // Brochure MY27MA: 3823 | 3825 | 4118 | 4551
        "2027": ["3823", "3825", "4118", "4551"]
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
      engine: "Cummins X12 525HP (recent) / L9 450 (earlier years)",
      horsepower: 525,
      torqueLbFt: 1695,
      chassis: "Spartan K3 Tag (recent)",
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
      description: "Newmar Mountain Aire — high-line diesel between Dutch Star and King Aire. OEM MY25–27: Spartan K3 Tag + Cummins X12 525 / 1,695 (not L9 450).",
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
          to: 2014,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3 / Freightliner (by year)",
          notes: "2010–2014 mid/high diesel Class A — 2013–2014 slice locks OEM plans"
        },
        {
          from: 2015,
          to: 2016,
          engine: "Cummins ISX 500HP",
          horsepower: 500,
          chassis: "Freightliner SL Tag / Spartan K2 Tag (by option)",
          notes: "OEM 2015–2016 Mountain Aire: ISX 500 — not L9 450, not the later 525. MY16 Freightliner SL or Spartan K2 tag."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISX 500HP",
          horsepower: 500,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          notes: "OEM 2017_Mountain_Aire: Freightliner SL or Spartan K3 Passive Steer tag, ISX 500 — not L9 450, not the later 525."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins diesel 500HP",
          horsepower: 500,
          chassis: "Freightliner Tag / Spartan K3 Tag (by option)",
          notes: "OEM 2018_Mountain_Aire: 500 HP on Freightliner or Spartan K3 tag. Brochure does not name ISX vs X12 — not L9 450, not the later 525."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins X12 500HP",
          horsepower: 500,
          torqueLbFt: 1695,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          transmission: "Allison 4000 MH",
          notes: "OEM MY19–20 Mountain Aire: X12 500 / 1,695 — not L9 450, not the later 525. Freightliner SL or Spartan K3 (40' Spartan on MY19)."
        },
        {
          from: 2021,
          to: 2023,
          engine: "Cummins X12 500HP",
          horsepower: 500,
          torqueLbFt: 1695,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          notes: "OEM MY21–23 Mountain Aire: Spartan K3 Tag 500 / 1,695 — not L9 450, not the later 525 rating."
        },
        {
          from: 2024,
          to: 2024,
          engine: "Cummins X12 525HP",
          horsepower: 525,
          torqueLbFt: 1695,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM 2024-mountain-aire: X12 525 / 1,695. 10 kW Onan on 38'; 12.5 kW on 41–45'."
        },
        {
          from: 2025,
          to: 2027,
          floorplans: ["3823", "3825", "38"],
          engine: "Cummins X12 525HP",
          horsepower: 525,
          torqueLbFt: 1695,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          generator: "Onan 10kW Quiet Diesel",
          acUnits: "2 × 15,000 BTU heat pump",
          notes: "OEM MY25–27 MA 38': X12 525 / 1,695; 10 kW Onan; two 15k HP A/C"
        },
        {
          from: 2025,
          to: 2027,
          floorplans: ["4118", "4551", "41", "45"],
          engine: "Cummins X12 525HP",
          horsepower: 525,
          torqueLbFt: 1695,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY25–27 MA 41–45': X12 525 / 1,695; 12.5 kW Onan; three 15k HP A/C"
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins X12 525HP",
          horsepower: 525,
          torqueLbFt: 1695,
          chassis: "Spartan K3 Tag",
          transmission: "Allison 4000 MH",
          notes: "OEM MY25–27 Mountain Aire DigiBrochure: X12 525 / 1,695 on Spartan K3 Tag. 10 kW Onan + 2×15k on 38'; 12.5 kW + 3×15k on 41–45'."
        },
        
      ]
    },
    "Dutch Star": {
      type: "Class A Diesel",
      floorplans: ["4002", "4018", "4054", "4081", "4369", "4311", "4052", "3709", "3717", "3736", "3817", "4020", "4326", "4543", "3737", "4009", "4047", "4058", "4231", "4381", "4553", "3836", "4071", "4310", "4325", "4328", "4340", "4345", "4354", "4362", "4363", "4370", "3724", "4041", "3718", "4327", "3726", "3745", "4312", "4313", "4360", "4366", "4372", "4375"],
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
        // Brochure 2015_Dutch_Star: 3736 | 3745 | 4002 | 4018 | 4311 | 4312 | 4313 | 4360 | 4366 | 4369 | 4372 | 4375 | 4381 — ISL 450
        "2015": ["3736", "3745", "4002", "4018", "4311", "4312", "4313", "4360", "4366", "4369", "4372", "4375", "4381"],
        // Brochure 2016_Dutch_Star: 3726 | 3736 | 4002 | 4018 | 4041 | 4311 | 4312 | 4313 | 4369 | 4381 — ISL 450
        "2016": ["3726", "3736", "4002", "4018", "4041", "4311", "4312", "4313", "4369", "4381"],
        // Brochure 2017_Dutch_Star: 3724 | 3736 | 4002 | 4018 | 4041 | 4054 | 4310 | 4311 | 4369 | 4381 — ISL 450
        "2017": ["3724", "3736", "4002", "4018", "4041", "4054", "4310", "4311", "4369", "4381"],
        // Brochure 2018_Dutch_Star: 3718 | 3736 | 4002 | 4018 | 4052 | 4310 | 4311 | 4326 | 4327 | 4362 | 4369 — L 450
        "2018": ["3718", "3736", "4002", "4018", "4052", "4310", "4311", "4326", "4327", "4362", "4369"],
        // Brochure 2019_Dutch_Star: 3717 | 3736 | 4002 | 4018 | 4054 | 4310 | 4311 | 4326 | 4328 | 4362 | 4363 | 4369 — 450
        "2019": ["3717", "3736", "4002", "4018", "4054", "4310", "4311", "4326", "4328", "4362", "4363", "4369"],
        // Brochure 2020_Dutch_Star: 3709 | 3717 | 3736 | 4020 | 4054 | 4081 | 4310 | 4311 | 4326 | 4328 | 4362 | 4363 | 4369 — 450
        "2020": ["3709", "3717", "3736", "4020", "4054", "4081", "4310", "4311", "4326", "4328", "4362", "4363", "4369"],
        // Brochure 2021_Dutch_Star: 3709 | 3717 | 3736 | 4020 | 4081 | 4310 | 4311 | 4326 | 4328 | 4354 | 4362 | 4363 | 4369
        "2021": ["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4354", "4362", "4363", "4369"],
        // Brochure 2022_Dutch_Star: 3709 | 3717 | 3736 | 4020 | 4081 | 4310 | 4311 | 4326 | 4328 | 4363 | 4369
        "2022": ["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4363", "4369"],
        // Brochure 2023_Dutch_Star: 3709 | 3717 | 3736 | 4071 | 4081 | 4310 | 4311 | 4325 | 4326 | 4328 | 4369 | 4370
        "2023": ["3709", "3717", "3736", "4071", "4081", "4310", "4311", "4325", "4326", "4328", "4369", "4370"],
        // Brochure 2024-dutch-star: 3817 | 3836 | 4071 | 4081 | 4310 | 4311 | 4325 | 4326 | 4369 | 4370
        "2024": ["3817", "3836", "4071", "4081", "4310", "4311", "4325", "4326", "4369", "4370"],
        // Brochure 2025-dutch-star chassis table: 3836 | 4071 | 4081 | 4311 | 4325 | 4340 | 4369 | 4370
        "2025": ["3836", "4071", "4081", "4311", "4325", "4340", "4369", "4370"],
        // Brochure 2026-dutch-star: same eight plans
        "2026": ["3836", "4071", "4081", "4311", "4325", "4340", "4369", "4370"],
        // Brochure MY27DS: 3836 | 4081 | 4311 | 4325 | 4340 | 4345 | 4369 — L9 450 / 1,250
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
      description: "Newmar Dutch Star — volume high-line diesel. OEM MY25–27: Cummins L9 450 / 1,250. Freightliner XCR (38') or Freightliner/Spartan K2 tag (40'+). Generator 8 kW on 38–40' / 10 kW on 43'.",
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
          to: 2014,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Freightliner XC-Series (Spartan optional some years)",
          notes: "2010–2014 mid/high diesel Class A — 2013–2014 slice locks OEM plans"
        },
        {
          from: 2015,
          to: 2016,
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          chassis: "Freightliner XCR (37') / Freightliner XCR tag (40'+)",
          notes: "OEM 2015–2016 Dutch Star: ISL 450. Freightliner XCR on 37'; tag on 40'+."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          chassis: "Freightliner (37') / Freightliner or Spartan tag (40'+)",
          notes: "OEM 2017_Dutch_Star: ISL 450. Freightliner on 37'; Freightliner/Spartan tag on 40'+."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins L 450HP",
          horsepower: 450,
          chassis: "Freightliner XCR (37') / Freightliner or Spartan tag (40'+)",
          notes: "OEM 2018_Dutch_Star: Cummins L 450. Freightliner XCR on 37'; Freightliner/Spartan tag on 40'+."
        },
        {
          from: 2025,
          to: 2027,
          floorplans: ["3836", "38"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner XCR",
          transmission: "Allison 3000 MH",
          generator: "Onan 8kW Diesel QD",
          acUnits: "2 × 15,000 BTU heat pump",
          notes: "OEM MY25–27 DS 38': L9 450 / 1,250; 8 kW Onan; two 15k HP A/C"
        },
        {
          from: 2025,
          to: 2027,
          floorplans: ["4081", "40"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner or Spartan K2 tag",
          transmission: "Allison 3000 MH",
          generator: "Onan 8kW Diesel QD",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY25–27 DS 40': L9 450 / 1,250; 8 kW Onan; three 15k HP A/C"
        },
        {
          from: 2025,
          to: 2027,
          floorplans: ["4311", "4325", "4340", "4345", "4369", "43"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner or Spartan K2 tag",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Diesel QD",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY25–27 DS 43': L9 450 / 1,250; 10 kW Onan; three 15k HP A/C"
        },
        {
          from: 2019,
          to: 2027,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner XCR (38') / Freightliner or Spartan K2 tag (40'+)",
          transmission: "Allison 3000 MH",
          notes: "OEM MY19–27 Dutch Star: 450 HP. Freightliner on 37'; Freightliner/Spartan K2 tag on 40'+. Do not copy MY21+ plans onto 2019–2020.",
        },
        
      ]
    },
    "New Aire": {
      type: "Class A Diesel",
      floorplans: ["3543", "3545", "3831", "3836", "3843", "3943", "3338", "3341", "3343", "3345", "3541", "3543MKP", "3638", "3539", "3547", "3549"],
      floorplansByYear: {
        "2014": ["3543", "3545", "3831"],
        // No 2015–2016 OEM New Aire brochure (modern lineage starts ~2018). Do not invent keys.
        // No 2017 OEM New Aire brochure — omit key (modern intro is MY18).
        // Brochure 2018_New_Aire: 3341 | 3343 — Freightliner XCS Cummins 360 only
        "2018": ["3341", "3343"],
        // Brochure 2019_New_Aire: 3341 | 3343 | 3345 — Freightliner XCS B6.7 360 only (no 35')
        "2019": ["3341", "3343", "3345"],
        // Brochure 2020_New_Aire: 3341 | 3343 | 3345 (360) / 3541 | 3543 | 3545 (450)
        "2020": ["3341", "3343", "3345", "3541", "3543", "3545"],
        // Brochure 2021_New_Aire: 3341 | 3343 (360) / 3541 | 3543 | 3545 (450)
        "2021": ["3341", "3343", "3541", "3543", "3545"],
        // Brochure 2022_New_Aire: 3541 | 3543 | 3545 — L9 450 (no 33')
        "2022": ["3541", "3543", "3545"],
        // Brochure 2023_New_Aire: 3543 | 3545 | 3547 | 3549 — L9 450 / 1,250
        "2023": ["3543", "3545", "3547", "3549"],
        // Brochure 2024-new-aire: 3539 | 3543 | 3547 | 3549
        "2024": ["3539", "3543", "3547", "3549"],
        // Brochure 2025-new-aire: 3539 | 3543 | 3547 | 3549 — L9 450 / 1,250
        "2025": ["3539", "3543", "3547", "3549"],
        // Brochure 2026-new-aire / MY27NA: 3543 | 3545 | 3547
        "2026": ["3543", "3545", "3547"],
        "2027": ["3543", "3545", "3547"]
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
          to: 2014,
          engine: "Cummins B6.7 / ISB 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCS (side radiator era)",
          transmission: "Allison 3000 MH",
          notes: "Pre-modern New Aire 2014 key left for the 2013–2014 slice. No OEM MY15–MY17 brochure.",
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins B6.7 / ISB 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCS",
          transmission: "Allison 3000 MH",
          notes: "OEM 2018_New_Aire: 3341/3343 Freightliner XCS 360 only — no 35'. Do not copy MY19+ 33' trio or MY20 35' onto 2018.",
        },
        {
          from: 2019,
          to: 2019,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCS",
          transmission: "Allison 3000 MH",
          notes: "OEM 2019_New_Aire: 33' Freightliner XCS 360 only — no 35'. Do not copy MY20–21 33'/35' split onto 2019.",
        },
        {
          from: 2020,
          to: 2020,
          floorplans: ["3341", "3343", "3345", "33"],
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH",
          notes: "OEM 2020_New_Aire 33': Freightliner 360 — not L9 450",
        },
        {
          from: 2020,
          to: 2020,
          floorplans: ["3541", "3543", "3545", "35"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH",
          notes: "OEM 2020_New_Aire 35': 450 HP — not B6.7 360",
        },
        {
          from: 2020,
          to: 2020,
          engine: "Cummins B6.7 360HP (33') or L9 450HP (35')",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH",
          notes: "OEM 2020_New_Aire year-first: 33' 360 / 35' 450",
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["3341", "3343", "33"],
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH",
          notes: "OEM 2021_New_Aire 33': Freightliner 360 — not L9 450",
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["3541", "3543", "3545", "35"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner / Spartan (by option)",
          transmission: "Allison 3000 MH",
          notes: "OEM 2021_New_Aire 35': 450 HP on Freightliner or Spartan — not B6.7 360",
        },
        {
          from: 2021,
          to: 2021,
          engine: "Cummins B6.7 360HP (33') or L9 450HP (35')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner / Spartan (by option)",
          transmission: "Allison 3000 MH",
          notes: "OEM 2021_New_Aire year-first: 33' 360 / 35' 450",
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
            "OEM MY22–27 New Aire: L9 450 / 1,250 on Freightliner or Spartan — not B6.7 360. MY22 plans 3541/3543/3545 only.",
        },
      ],
    },
    Ventana: {
      type: "Class A Diesel",
      floorplans: ["3407", "3412", "3426", "3436", "3709", "3717", "3512", "3809", "3817", "4002", "4037", "4041", "4054", "4068", "4310", "4311", "4326", "4328", "4329", "4334", "4340", "4345", "4348", "4354", "4362", "4369", "3437", "3710", "3711", "3716", "3507", "3724", "4322", "3715", "4046", "4049", "4308", "3427", "3635", "3636", "3725", "4003", "4315", "4316", "4360", "4375", "4381"],
      floorplansByYear: {
        "2006": ["3436","3717","4037"],"2007": ["3436","3717","4037"],"2008": ["3436","3717","4037"],
        "2009": ["3436","3717","4037"],"2010": ["3436","3717","4037"],"2011": ["3436","3717","4037"],
        "2012": ["3436","3717","4037"],"2013": ["3436","3717","4037"],"2014": ["3436","3717","4037"],
        // Brochure 2015_Ventana: 3436 | 3437 | 3635 | 3636 (ISB 360) / 4002 | 4003 | 4037 | 4311 | 4315 | 4360 | 4369 | 4375 | 4381 (ISL 400)
        "2015": ["3436","3437","3635","3636","4002","4003","4037","4311","4315","4360","4369","4375","4381"],
        // Brochure 2016_Ventana: 3427 | 3436 | 3709 | 3725 (ISB 360) / 4002 | 4037 | 4041 | 4311 | 4316 | 4322 | 4369 | 4381 (ISL 400)
        "2016": ["3427","3436","3709","3725","4002","4037","4041","4311","4316","4322","4369","4381"],
        // Brochure 2017_Ventana: 3412 | 3436 | 3709 | 3724 (ISB 360) / 4002 | 4037 | 4041 | 4310 | 4311 | 4322 | 4369 (ISL 400)
        "2017": ["3412","3436","3709","3724","4002","4037","4041","4310","4311","4322","4369"],
        // Brochure 2018_Ventana: 3407 | 3412 | 3436 | 3709 | 3715 (B 360) / 4002 | 4037 | 4046 | 4049 | 4308 | 4310 | 4311 | 4326 | 4369 (L 400)
        "2018": ["3407","3412","3436","3709","3715","4002","4037","4046","4049","4308","4310","4311","4326","4369"],
        // Brochure 2019_Ventana: 3407 | 3412 | 3426 | 3709 | 3717 (ISB 360) / 4002 | 4037 | 4054 | 4310 | 4311 | 4326 | 4348 | 4369 (ISL 400)
        "2019": ["3407","3412","3426","3709","3717","4002","4037","4054","4310","4311","4326","4348","4369"],
        // Brochure 2020_Ventana: 3407 | 3412 | 3426 | 3709 | 3717 (360) / 4002 | 4037 | 4054 | 4311 | 4326 | 4348 | 4362 | 4369 (400) — no 4310
        "2020": ["3407","3412","3426","3709","3717","4002","4037","4054","4311","4326","4348","4362","4369"],
        // Brochure 2021_Ventana: 3407 | 3412 | 3426 | 3709 | 3717 (360) / 4002 | 4037 | 4311 | 4326 | 4329 | 4354 | 4362 | 4369 (400)
        "2021": ["3407","3412","3426","3709","3717","4002","4037","4311","4326","4329","4354","4362","4369"],
        // Brochure 2022_Ventana: 3407 | 3412 | 3426 | 3709 | 3717 (360) / 4002 | 4037 | 4310 | 4326 | 4334 | 4369 (400)
        "2022": ["3407","3412","3426","3709","3717","4002","4037","4310","4326","4334","4369"],
        // Brochure 2023_Ventana: 3407 | 3412 | 3709 | 3717 (B6.7 360) / 4037 | 4068 | 4310 | 4326 | 4328 | 4334 | 4369 (L9 400)
        "2023": ["3407","3412","3709","3717","4037","4068","4310","4326","4328","4334","4369"],
        // Brochure 2024-ventana: 3507 | 3512 | 3809 | 3817 (L 380) / 4037 | 4068 | 4310 | 4326 | 4328 | 4369 (L 400)
        "2024": ["3507","3512","3809","3817","4037","4068","4310","4326","4328","4369"],
        // Brochure 2025-ventana: 3507 | 3512 | 3809 | 4037 | 4068 | 4328 | 4340 | 4369 — L 380/400
        "2025": ["3507","3512","3809","4037","4068","4328","4340","4369"],
        // Brochure 2026-ventana: 3512 | 3809 | 4037 | 4340 | 4369
        "2026": ["3512","3809","4037","4340","4369"],
        // Brochure MY27VT: 3512 | 3809 | 4037 | 4340 | 4345 | 4369 — B6.7 380–400
        "2027": ["3512","3809","4037","4340","4345","4369"]
      },
      lengthRange: [34, 44], weightRange: [30000, 45600], slideouts: 3, sleeps: 6,
      msrpRange: [279000, 489000],
      engine: "Cummins L 380–400HP (MY25–26) / B6.7 380–400HP (MY27)",
      horsepower: 380, torqueLbFt: 1150,
      chassis: "Freightliner XCR / Spartan K2 (by option)",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.5,
      image: RV_CARD_IMAGE, towingCapacity: 10000, freshWater: 90, grayWater: 50, blackWater: 45,
      fuelCapacityGal: 100, generator: "Onan 8kW Diesel QD", awningLength: 18, ceilingHeight: 84,
      founded: 1968, warrantyYears: 2, yearStart: 2006,
      description: "Newmar Ventana — OEM MY25–26: Cummins L 380 (35–38) / 400 tag (40–43). MY27 brochure: Cummins B6.7 380–400 / 1,150–1,250. 4331 is not a real code.",
      powertrainByYear: [
        { from: 2006, to: 2009, engine: "Cummins ISL / ISB diesel (era)", horsepower: 350, torqueLbFt: 1000, chassis: "Freightliner XC-Series", transmission: "Allison 3000 MH" },
        { from: 2010, to: 2014, engine: "Cummins ISB / ISL diesel (era)", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XC-Series", transmission: "Allison 3000 MH" },
        { from: 2015, to: 2015, floorplans: ["3436","3437","3635","3636","34","36"], engine: "Cummins ISB 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2015_Ventana 34–36': ISB 360 — not ISL 400, not LE 340" },
        { from: 2015, to: 2015, floorplans: ["4002","4003","4037","4311","4315","4360","4369","4375","4381","40","43"], engine: "Cummins ISL 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag", transmission: "Allison 3000 MH", notes: "OEM 2015_Ventana 40–43': ISL 400 — not ISB 360" },
        { from: 2015, to: 2015, engine: "Cummins ISB 360HP (34–36') or ISL 400HP (40–43')", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2016, to: 2016, floorplans: ["3427","3436","3709","3725","34","37"], engine: "Cummins ISB 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2016_Ventana 34–37': ISB 360 — not ISL 400, not LE 340" },
        { from: 2016, to: 2016, floorplans: ["4002","4037","4041","4311","4316","4322","4369","4381","40","43"], engine: "Cummins ISL 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag", transmission: "Allison 3000 MH", notes: "OEM 2016_Ventana 40–43': ISL 400 — not ISB 360" },
        { from: 2016, to: 2016, engine: "Cummins ISB 360HP (34–37') or ISL 400HP (40–43')", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2017, to: 2017, floorplans: ["3412","3436","3709","3724","34","37"], engine: "Cummins ISB 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2017_Ventana 34–37': ISB 360 — not ISL 400" },
        { from: 2017, to: 2017, floorplans: ["4002","4037","4041","4310","4311","4322","4369","40","43"], engine: "Cummins ISL 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag", transmission: "Allison 3000 MH", notes: "OEM 2017_Ventana 40–43': ISL 400 — not ISB 360" },
        { from: 2017, to: 2017, engine: "Cummins ISB 360HP (34–37') or ISL 400HP (40–43')", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2018, to: 2018, floorplans: ["3407","3412","3436","3709","3715","34","37"], engine: "Cummins B 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2018_Ventana 34–37': Cummins B 360 — not L 400" },
        { from: 2018, to: 2018, floorplans: ["4002","4037","4046","4049","4308","4310","4311","4326","4369","40","43"], engine: "Cummins L 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag", transmission: "Allison 3000 MH", notes: "OEM 2018_Ventana 40–43': Cummins L 400 — not B 360" },
        { from: 2018, to: 2018, engine: "Cummins B 360HP (34–37') or L 400HP (40–43')", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2019, to: 2019, floorplans: ["3407","3412","3426","3709","3717","34","37"], engine: "Cummins ISB 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2019_Ventana 34–37': ISB 360 — not ISL 400" },
        { from: 2019, to: 2019, floorplans: ["4002","4037","4054","4310","4311","4326","4348","4369","40","43"], engine: "Cummins ISL 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag / Spartan K2 Tag", transmission: "Allison 3000 MH", notes: "OEM 2019_Ventana 40–43': ISL 400 — not ISB 360" },
        { from: 2019, to: 2019, engine: "Cummins ISB 360HP (34–37') or ISL 400HP (40–43')", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR / Spartan K2", transmission: "Allison 3000 MH" },
        { from: 2020, to: 2023, floorplans: ["3407","3412","3426","3436","3709","3717","34","35","36","37"], engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR / Spartan K2", transmission: "Allison 3000 MH", notes: "34–37 B6.7 360/800 (MY20–23 OEM chassis table)" },
        { from: 2020, to: 2023, floorplans: ["4002","4037","4041","4054","4068","4310","4311","4326","4328","4329","4334","4348","4354","4362","4369","40","41","42","43"], engine: "Cummins L9 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner XCR Tag / Spartan K2 Tag", transmission: "Allison 3000 MH", fuelCapacityGal: 100, towingCapacity: 15000, notes: "40–43 L9 400/1250 including 4369 (MY20–23 OEM). 4310 is not a 2020 plan." },
        { from: 2020, to: 2023, engine: "Cummins B6.7 360HP or L9 400HP (by floorplan length)", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR / Spartan K2", transmission: "Allison 3000 MH" },
        { from: 2024, to: 2026, floorplans: ["3507","3512","3809","3817","35","38"], engine: "Cummins L 380HP", horsepower: 380, torqueLbFt: 1150, chassis: "Freightliner / Spartan (by option)", transmission: "Allison 3000 MH", notes: "OEM MY24–26 Ventana: L 380 / 1,150 on 35–38' — not B6.7 360" },
        { from: 2024, to: 2026, floorplans: ["4037","4068","4310","4326","4328","4340","4369","40","43"], engine: "Cummins L 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner Tag / Spartan Tag (by option)", transmission: "Allison 3000 MH", notes: "OEM MY24–26 Ventana: L 400 / 1,250 on 40–43'" },
        { from: 2024, to: 2026, engine: "Cummins L 380HP or 400HP (by length)", horsepower: 380, torqueLbFt: 1150, chassis: "Freightliner / Spartan (by option)", transmission: "Allison 3000 MH" },
        { from: 2027, to: 2027, floorplans: ["3512","3809","35","38"], engine: "Cummins B6.7 380HP", horsepower: 380, torqueLbFt: 1150, chassis: "Freightliner / Spartan (by option)", transmission: "Allison 3000 MH", notes: "OEM MY27VT: B6.7 380 / 1,150 on 35–38'" },
        { from: 2027, to: 2027, floorplans: ["4037","4340","4345","4369","40","43"], engine: "Cummins B6.7 400HP", horsepower: 400, torqueLbFt: 1250, chassis: "Freightliner Tag / Spartan Tag (by option)", transmission: "Allison 3000 MH", notes: "OEM MY27VT: B6.7 400 / 1,250 on 40–43'" },
        { from: 2027, to: 2027, engine: "Cummins B6.7 380–400HP (by length)", horsepower: 380, torqueLbFt: 1150, chassis: "Freightliner / Spartan (by option)", transmission: "Allison 3000 MH" },
      ],
    },
    "Ventana LE": {
      type: "Class A Diesel",
      floorplans: ["3412","3426","3436","3709","3717","3850","4002","4037","4045","4048","3724","4042","4044","3413","3713","3427","3437","3635","3636","3725","3802","3812","3849","4040"],
      floorplansByYear: {
        "2012": ["3436","3709","3850"],"2013": ["3436","3709","3850","4037"],
        "2014": ["3436","3709","3850","4037"],
        // Brochure 2015_Ventana combined LE table: 3436 | 3437 | 3635 | 3636 | 3802 | 3812 | 3849 | 3850 — ISB 340 only (no 40')
        "2015": ["3436","3437","3635","3636","3802","3812","3849","3850"],
        // Brochure 2016_Ventana_LE: 3427 | 3436 | 3709 | 3725 (340) / 4002 | 4037 | 4040 | 4044 (360)
        "2016": ["3427","3436","3709","3725","4002","4037","4040","4044"],
        // Brochure 2017_Ventana_LE: 3412 | 3436 | 3709 | 3724 (340) / 4002 | 4037 | 4042 | 4044 (360)
        "2017": ["3412","3436","3709","3724","4002","4037","4042","4044"],
        // Brochure 2018_Ventana_LE: 3412 | 3413 | 3436 | 3709 | 3713 (340) / 4002 | 4037 | 4042 | 4048 (360)
        "2018": ["3412","3413","3436","3709","3713","4002","4037","4042","4048"],
        // Brochure 2019_Ventana_LE final year: 3412 | 3426 (340) / 3709 | 3717 | 4002 | 4037 | 4045 | 4048 (360)
        "2019": ["3412","3426","3709","3717","4002","4037","4045","4048"]
      },
      lengthRange: [34, 40], weightRange: [26000, 34000], slideouts: 3, sleeps: 6,
      msrpRange: [189000, 289000],
      engine: "Cummins ISB 6.7L 340–360HP (by length)",
      horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR (no tag on most LE)",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.35,
      image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 80, grayWater: 50, blackWater: 40,
      fuelCapacityGal: 90, generator: "Onan 8kW Diesel QD", awningLength: 16, ceilingHeight: 84,
      founded: 1968, warrantyYears: 2, yearStart: 2012, yearEnd: 2019,
      description: "Newmar Ventana LE (2012–2019). OEM MY19 final year: ISB 340 on 34' / 360 on 37–40'. Freightliner XCR. Not L9 400. No 2020 brochure.",
      powertrainByYear: [
        { from: 2012, to: 2018, floorplans: ["3412","3413","3427","3436","3437","3635","3636","3709","3713","3724","3725","3802","3812","3849","3850","34","35","36","37","38"], engine: "Cummins ISB 6.7L 340HP", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000, notes: "OEM MY15 LE all 340; MY16–18 34–37' ISB 340 — not 360" },
        { from: 2012, to: 2018, floorplans: ["4002","4037","4040","4042","4044","4048","40"], engine: "Cummins ISB 6.7L 360HP", horsepower: 360, torqueLbFt: 1000, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000, notes: "OEM MY16–18 Ventana LE 40': ISB 360 — not 340. MY15 LE has no 40'." },
        { from: 2012, to: 2018, engine: "Cummins ISB 6.7L 340–360HP (by length)", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH" },
        { from: 2019, to: 2019, floorplans: ["3412","3426","34"], engine: "Cummins ISB 6.7L 340HP", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000, notes: "OEM 2019_Ventana_LE 34': ISB 340 — not 360" },
        { from: 2019, to: 2019, floorplans: ["3709","3717","4002","4037","4045","4048","37","40"], engine: "Cummins ISB 6.7L 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", towingCapacity: 5000, notes: "OEM 2019_Ventana_LE 37–40': ISB 360 — not 340" },
        { from: 2019, to: 2019, engine: "Cummins ISB 6.7L 340HP (34') or 360HP (37–40')", horsepower: 340, torqueLbFt: 800, chassis: "Freightliner XCR", transmission: "Allison 3000 MH", notes: "OEM 2019_Ventana_LE: up to 360 HP. Line ends MY2019." },
      ],
    },
    "Northern Star": {
      type: "Class A Diesel", floorplans: ["3418","3709","4011","4037"],
      // Brochure 2025–27 NS: 3418 | 3709 | 4011 | 4037 — replaced Kountry Star
      floorplansByYear: {
        "2025": ["3418","3709","4011","4037"],
        "2026": ["3418","3709","4011","4037"],
        "2027": ["3418","3709","4011","4037"]
      },
      lengthRange: [34, 40], weightRange: [28000, 36000], slideouts: 3, sleeps: 6, msrpRange: [399000, 489000],
      engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner Custom Chassis",
      transmission: "Allison 3000 MH", fuelType: "Diesel", recalls: 0, rating: 4.45, image: RV_CARD_IMAGE,
      towingCapacity: 10000, freshWater: 80, grayWater: 50, blackWater: 40, fuelCapacityGal: 90,
      generator: "Onan 8kW Diesel QD", awningLength: 16, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2025,
      description: "Newmar Northern Star — 2025+ entry diesel pusher (succeeds Kountry Star). OEM: Freightliner + Cummins B6.7 360 / 800.",
      powertrainByYear: [{ from: 2025, to: 2027, engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner Custom Chassis", transmission: "Allison 3000 MH", notes: "OEM MY25–27 NS DigiBrochure: B6.7 360 / 800" }],
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
      type: "Super C", floorplans: ["3727","3729","3731","3746","4040","4051","4058","4059","4061","4065","4140","4159","4161"],
      floorplansByYear: {
        // Brochure 2020_Super_Star: 3746 | 4051 | 4058 | 4061 — M2-106 Cummins 350
        "2020": ["3746","4051","4058","4061"],
        // Brochure 2021_Super_Star: 3746 | 4051 | 4058 | 4061 — M2-106 Cummins L 350
        "2021": ["3746","4051","4058","4061"],
        // Brochure 2022_Super_Star: 3727 | 4059 | 4061 | 4065 — M2-106 Cummins L 360 / 1,150
        "2022": ["3727","4059","4061","4065"],
        // Brochure 2023_Super_Star: 3727 | 3729 | 4059 | 4061 | 4065 — M2-106 360
        "2023": ["3727","3729","4059","4061","4065"],
        // Brochure 2024-super-star: 3727 | 3729 | 3731 | 4059 | 4061 | 4065 — M2-106 360
        "2024": ["3727","3729","3731","4059","4061","4065"],
        // Brochure 2025-super-star: 3729 | 3731 | 4059 | 4061 | 4065 — M2-106 360
        "2025": ["3729","3731","4059","4061","4065"],
        // Brochure 2026-super-star: 3731 | 4040 | 4059 | 4061 (360) / 4140 | 4159 | 4161 (450)
        "2026": ["3731","4040","4059","4061","4140","4159","4161"],
        // Brochure MY27SS: 3731 | 4040 | 4059 (360) / 4140 | 4159 (450)
        "2027": ["3731","4040","4059","4140","4159"]
      },
      lengthRange: [37, 41], weightRange: [30000, 38000], slideouts: 3, sleeps: 8, msrpRange: [499000, 620000],
      engine: "Cummins L 360HP (M2-106) or 450HP (M2-112)", horsepower: 360, torqueLbFt: 1150,
      chassis: "Freightliner M2-106 / M2-112 (by length)", transmission: "Allison automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.55, image: RV_CARD_IMAGE, towingCapacity: 20000, freshWater: 80, grayWater: 55, blackWater: 45,
      fuelCapacityGal: 100,       generator: "Onan 8,000W diesel", awningLength: 18, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2020,
      description: "Newmar Super Star — Freightliner M2 Super C. MY20–21: M2-106 Cummins 350. MY22–25: M2-106 Cummins L 360 / 1,150. MY26+ adds 41 ft M2-112 Cummins L 450. No 2019 OEM brochure.",
      powertrainByYear: [
        { from: 2020, to: 2021, engine: "Cummins L 350HP (Freightliner M2-106)", horsepower: 350, chassis: "Freightliner M2-106", towingCapacity: 20000, notes: "OEM MY20–21 Super Star: M2-106 Cummins 350 — not the later 360 rating. Plans 3746/4051/4058/4061." },
        { from: 2022, to: 2025, engine: "Cummins L 360HP (Freightliner M2-106)", horsepower: 360, torqueLbFt: 1150, chassis: "Freightliner M2-106", towingCapacity: 20000, notes: "OEM MY22–25 Super Star: M2-106 Cummins L 360 / 1,150. MY22 plans 3727/4059/4061/4065." },
        { from: 2026, to: 2027, floorplans: ["3731","4040","4059","4061","37","40"], engine: "Cummins L 360HP (Freightliner M2-106)", horsepower: 360, torqueLbFt: 1150, chassis: "Freightliner M2-106", towingCapacity: 20000 },
        { from: 2026, to: 2027, floorplans: ["4140","4159","4161","41"], engine: "Cummins L 450HP (Freightliner M2-112)", horsepower: 450, torqueLbFt: 1250, chassis: "Freightliner M2-112", towingCapacity: 20000 },
        { from: 2026, to: 2027, engine: "Cummins L 360HP (M2-106) or 450HP (M2-112)", horsepower: 360, torqueLbFt: 1150, chassis: "Freightliner M2" },
      ],
    },
    "Supreme Aire": {
      type: "Super C", floorplans: ["3827","4129","4141","4341","4505","4540","4051","4061","4065","4504","4509","4530","4573","4575","4577","4590"],
      floorplansByYear: {
        // Brochure 2020_Supreme_Aire: 4573 | 4575 | 4577 — M2-112 DD13 505
        "2020": ["4573","4575","4577"],
        // Brochure 2021_Supreme_Aire: 4051 | 4061 | 4573 | 4575 | 4577 — M2-112 DD13 505
        "2021": ["4051","4061","4573","4575","4577"],
        // Brochure 2022_Supreme_Aire: 4051 | 4061 | 4573 | 4575 | 4590 — M2-112 DD13 505 / 1,850
        "2022": ["4051","4061","4573","4575","4590"],
        // Brochure 2023_Supreme_Aire: 4051 | 4061 | 4065 | 4509 | 4530 | 4575 — M2-112 DD13 505
        "2023": ["4051","4061","4065","4509","4530","4575"],
        // Brochure 2024-supreme-aire: 4051 | 4504 | 4509 | 4530 — M2-112 DD13 525
        "2024": ["4051","4504","4509","4530"],
        // Brochure 2025-supreme-aire: 4051 | 4504 | 4509 | 4530 — M2-112 DD13 525
        "2025": ["4051","4504","4509","4530"],
        // Brochure 2026_supreme-aire: 3827 | 4129 (525 Cascadia 116) / 4341 | 4505 | 4540 (600 Cascadia 126)
        "2026": ["3827","4129","4341","4505","4540"],
        // Brochure MY27SA: 3827 | 4129 | 4141 (525) / 4341 | 4505 | 4540 (600)
        "2027": ["3827","4129","4141","4341","4505","4540"]
      },
      lengthRange: [38, 45], weightRange: [36000, 52000], slideouts: 4, sleeps: 6, msrpRange: [660000, 890000],
      engine: "Detroit DD13 525HP or DD16 600HP (by year/length)", horsepower: 525, torqueLbFt: 1850,
      chassis: "Freightliner M2-112 (2025) / Cascadia (2026+)", transmission: "12-speed automated manual", fuelType: "Diesel",
      recalls: 0, rating: 4.7, image: RV_CARD_IMAGE, towingCapacity: 20000, freshWater: 100, grayWater: 70, blackWater: 40,
      fuelCapacityGal: 120,       generator: "Onan diesel", awningLength: 20, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2020,
      description: "Newmar Supreme Aire — Super C. MY20–23: M2-112 DD13 505. MY24–25: M2-112 DD13 525. MY26–27: Cascadia 116 DD13 525 (38–41') or Cascadia 126 DD16 600 (43–45'). No 2019 OEM brochure.",
      powertrainByYear: [
        { from: 2020, to: 2023, engine: "Detroit DD13 505HP", horsepower: 505, torqueLbFt: 1850, chassis: "Freightliner M2-112", towingCapacity: 20000, notes: "OEM MY20–23 Supreme Aire: M2-112 DD13 505 / 1,850 — not the later 525 rating. MY20 plans 4573/4575/4577." },
        { from: 2024, to: 2025, engine: "Detroit DD13 525HP", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner M2-112", towingCapacity: 20000, notes: "OEM MY24–25 Supreme Aire: M2-112 DD13 525 / 1,850" },
        { from: 2026, to: 2027, floorplans: ["3827","4129","4141","38","41"], engine: "Detroit DD13 525HP", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia 116 single axle", towingCapacity: 20000 },
        { from: 2026, to: 2027, floorplans: ["4341","4505","4540","43","45"], engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126 tandem axle", towingCapacity: 30000 },
        { from: 2026, to: 2027, engine: "Detroit DD13 525HP or DD16 600HP (by length)", horsepower: 525, torqueLbFt: 1850, chassis: "Freightliner Cascadia" },
      ],
    },
    "Summit Aire": {
      type: "Super C", floorplans: ["4505","4540"],
      // Brochure 2026/MY27SM: 4505 | 4540 — Cascadia 126 DD16 600 / 1,850
      floorplansByYear: { "2026": ["4505","4540"], "2027": ["4505","4540"] },
      lengthRange: [45, 45], weightRange: [45000, 54000], slideouts: 4, sleeps: 5, msrpRange: [850000, 1100000],
      engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126 tandem axle",
      transmission: "12-speed automated manual", fuelType: "Diesel", recalls: 0, rating: 4.75, image: RV_CARD_IMAGE,
      towingCapacity: 30000, freshWater: 100, grayWater: 70, blackWater: 40, fuelCapacityGal: 120,
      generator: "Onan diesel", awningLength: 20, ceilingHeight: 84, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Summit Aire — flagship Super C, Cascadia 126, DD16 600/1850, hitch 30k.",
      powertrainByYear: [{ from: 2026, to: 2027, engine: "Detroit DD16 600HP", horsepower: 600, torqueLbFt: 1850, chassis: "Freightliner Cascadia 126 tandem axle", towingCapacity: 30000 }],
    },
    "Freedom Aire": {
      type: "Class C", floorplans: ["2515","2512"],
      // Brochure 2026-freedom-aire: 2515, 208 HP. MY27FA adds 2512 and rates 211 HP.
      floorplansByYear: { "2026": ["2515"], "2027": ["2515","2512"] },
      lengthRange: [25, 25], weightRange: [11000, 12500], slideouts: 1, sleeps: 4, msrpRange: [289000, 360000],
      engine: "Mercedes-Benz 2.0L turbo diesel 211HP (MY27) / 208HP (MY26)", horsepower: 211, torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 4500", transmission: "9-speed automatic", fuelType: "Diesel",
      recalls: 0, rating: 4.4, image: RV_CARD_IMAGE, towingCapacity: 5000, freshWater: 31, grayWater: 28, blackWater: 16,
      fuelCapacityGal: 24, generator: "RVMP 4.0 kW LP", acUnits: "1 × 15,000 BTU heat pump", awningLength: 14, ceilingHeight: 80, founded: 1968, warrantyYears: 2, yearStart: 2026,
      description: "Newmar Freedom Aire — Sprinter 4500 compact Class C. MY26: 2515, 208/332. MY27: 2515 + 2512, 211/332. RVMP 4.0 kW LP generator.",
      powertrainByYear: [
        { from: 2026, to: 2026, engine: "Mercedes-Benz 2.0L turbo diesel 208HP", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500", generator: "RVMP 4.0 kW LP", acUnits: "1 × 15,000 BTU heat pump", notes: "OEM 2026-freedom-aire: Sprinter 4500, 208 / 332, plan 2515" },
        { from: 2027, to: 2027, engine: "Mercedes-Benz 2.0L turbo diesel 211HP", horsepower: 211, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500", generator: "RVMP 4.0 kW LP", acUnits: "1 × 15,000 BTU heat pump", notes: "OEM MY27FA: Sprinter 4500, 211 / 332, plans 2515 + 2512 twin-to-king" },
      ],
    },
    "Canyon Star": {
      type: "Class A Diesel",
      floorplans: ["3710", "3927", "3947", "3713", "3921", "3512", "3513", "3608", "3626", "3627", "3646", "3716", "3719", "3722", "3723", "3747", "3911", "3920", "3924", "3929", "3737", "3957", "3902", "3914", "3923", "3925", "3953", "3901", "3918", "3926", "3928", "3424", "3610", "3612", "3650", "3712", "3755", "3903", "3913", "3919", "3922", "3941", "3944"],
      floorplansByYear: {
        "2010": ["3710", "3927"],
        "2011": ["3710", "3927"],
        "2012": ["3710", "3927"],
        "2013": ["3710", "3927"],
        "2014": ["3710", "3927"],
        // RVUSA NEW_2015_CanyonStar_Brochure_1.pdf (no OEM archive PDF): F-53 Triton V10 362 GAS. No 3947.
        "2015": ["3424", "3610", "3612", "3650", "3911", "3913", "3914", "3919", "3920", "3921", "3941", "3953"],
        // Brochure 2016_Canyon_Star: Gas Motor Coach — F-53 Triton V10 362. No 3947.
        "2016": ["3710", "3712", "3755", "3903", "3911", "3914", "3921", "3922", "3944", "3953"],
        // Brochure 2017_Canyon_Star: Gas Motor Coach — F-53 26,000 lb, 320 HP. No 3947.
        "2017": ["3513", "3710", "3902", "3911", "3914", "3921", "3923", "3925", "3953"],
        // Brochure 2018_Canyon_Star: Gas Motor Coach — F-53 26,000 lb, 320 HP. No 3947.
        "2018": ["3513", "3710", "3716", "3901", "3911", "3918", "3921", "3923", "3924", "3926", "3928", "3953"],
        // Brochure 2019_Canyon_Star: Gas Motor Coach — F-53 26,000 lb, 320 HP. No 3947.
        "2019": ["3513", "3608", "3627", "3646", "3710", "3719", "3722", "3723", "3911", "3924", "3927"],
        // Brochure 2020_Canyon_Star: Gas Motor Coach — F-53 26,000 lb, 320 HP. No 3947.
        "2020": ["3513", "3627", "3710", "3719", "3722", "3747", "3911", "3927", "3929"],
        // Brochure 2021_Canyon_Star: 3513 | 3710 | 3719 | 3722 | 3747 | 3911 | 3927 | 3929 — FED B6.7 340 / 700
        "2021": ["3513", "3710", "3719", "3722", "3747", "3911", "3927", "3929"],
        // Brochure 2022_Canyon_Star: 3513 | 3710 | 3722 | 3927 | 3929 — FED B6.7 340 / 700
        "2022": ["3513", "3710", "3722", "3927", "3929"],
        // Brochure 2023_Canyon_Star: 3737 | 3947 | 3957 — FED B6.7 340 / 700
        "2023": ["3737", "3947", "3957"],
        // Brochure 2024-canyon-star: 3947 | 3957
        "2024": ["3947", "3957"],
        // Brochure 2025–27 CS: 3947 only — Freightliner FED toy hauler, B6.7 340 / 700
        "2025": ["3947"],
        "2026": ["3947"],
        "2027": ["3947"]
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
      engine: "Cummins B6.7 340HP (recent FED)",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner front-engine diesel",
      transmission: "Allison",
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
      description: "Newmar Canyon Star — front-engine diesel Class A toy hauler (not Super C). OEM MY25–27: Freightliner FED + Cummins B6.7 340 / 700, floorplan 3947.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2014,
          engine: "Cummins / Ford Super C diesel (era)",
          horsepower: 300,
          chassis: "Freightliner / Ford Super C",
          notes: "2010–2014 Super C placeholder — 2013–2014 slice locks OEM. Do not copy onto 2015–2016 gas F-53."
        },
        {
          from: 2015,
          to: 2016,
          engine: "Ford Triton V10 6.8L 362HP",
          horsepower: 362,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          generator: "Onan 5.5kW Gas",
          notes: "OEM/RVUSA MY15–16 Canyon Star: Gas Motor Coach — F-53 Triton V10 362. Not Super C diesel, not FED 340. No 3947."
        },
        {
          from: 2017,
          to: 2020,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          generator: "Onan 5.5kW Gas",
          notes: "OEM MY17–20 Canyon Star: Gas Motor Coach — F-53 26,000 lb, 320 HP Triton V10. Not FED B6.7 340 diesel (that arrives MY21). Not Super C."
        },
        {
          from: 2021,
          to: 2024,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner Custom Chassis front-engine diesel",
          transmission: "Allison",
          notes: "OEM MY21–24 Canyon Star: FED B6.7 340 / 700. MY21 3513/3710/3719/3722/3747/3911/3927/3929; MY22 3513/3710/3722/3927/3929. Not Super C. 3947 is not a 2021–2022 plan."
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner Custom Chassis front-engine diesel",
          transmission: "Allison",
          notes: "OEM MY25–27 Canyon Star DigiBrochure: FED B6.7 340 / 700, 3947 toy hauler"
        }
      ]
    },
    "London Aire": {
      type: "Class A Diesel",
      floorplans: ["4551", "4533", "4534", "4561", "4519", "4527", "4553", "4521", "4535", "4540", "4543", "4545", "4550", "4559", "4569", "4576", "4579", "4583", "4586", "4589", "4595", "4513", "4525", "4584", "4531", "4536", "4537", "4501", "4503", "4518", "4565", "4568", "4598", "4599"],
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
        // Brochure 2015_London_Aire: 4501 | 4503 | 4553 | 4568 | 4599 — Freightliner SL / Spartan K3 ISX 600
        "2015": ["4501", "4503", "4553", "4568", "4599"],
        // Brochure 2016_London_Aire: 4503 | 4518 | 4519 | 4553 | 4565 | 4598 — ISX 600 (no 4507)
        "2016": ["4503", "4518", "4519", "4553", "4565", "4598"],
        // Brochure 2017_London_Aire: 4513 | 4519 | 4525 | 4533 | 4553 | 4584 — Freightliner SL / Spartan K3 ISX 600
        "2017": ["4513", "4519", "4525", "4533", "4553", "4584"],
        // Brochure 2018_London_Aire: 4531 | 4533 | 4534 | 4535 | 4536 | 4537 | 4553 — X15 605
        "2018": ["4531", "4533", "4534", "4535", "4536", "4537", "4553"],
        // Brochure 2019_London_Aire: 4533 | 4534 | 4535 | 4543 | 4550 | 4551 | 4576 | 4579 — Freightliner SL / Spartan K3 605
        "2019": ["4533", "4534", "4535", "4543", "4550", "4551", "4576", "4579"],
        // Brochure 2020_London_Aire: 4533 | 4535 | 4543 | 4551 | 4559 | 4569 | 4579 — Freightliner SL / Spartan K3 605
        "2020": ["4533", "4535", "4543", "4551", "4559", "4569", "4579"],
        // Brochure 2021_London_Aire: 4533 | 4535 | 4543 | 4551 | 4579 | 4583 — Spartan K3 Tag 605
        "2021": ["4533", "4535", "4543", "4551", "4579", "4583"],
        // Brochure 2022_London_Aire: 4533 | 4535 | 4551 | 4579 | 4589 — Spartan K3 Tag 605
        "2022": ["4533", "4535", "4551", "4579", "4589"],
        // Brochure 2023_London_Aire: 4521 | 4535 | 4551 | 4569 | 4579 | 4586 — X15 605 / 1,950
        "2023": ["4521", "4535", "4551", "4569", "4579", "4586"],
        // Brochure 2024-london-aire: 4521 | 4535 | 4551 | 4569 | 4579
        "2024": ["4521", "4535", "4551", "4569", "4579"],
        // Brochure 2025-london-aire: 4535 | 4551 | 4569 | 4595 — X15 605 / 1,950 (line is ACTIVE)
        "2025": ["4535", "4551", "4569", "4595"],
        // Brochure 2026-london-aire: 4540 | 4551 | 4569 | 4595
        "2026": ["4540", "4551", "4569", "4595"],
        // Brochure MY27LA: 4540 | 4545 | 4551 | 4569 | 4595
        "2027": ["4540", "4545", "4551", "4569", "4595"]
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
      engine: "Cummins X15 605HP (recent) / ISX 600 (earlier)",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Freightliner SL Tag / Spartan K3 (by option)",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 105,
      grayWater: 55,
      blackWater: 50,
      generator: "Onan 12.5kW Quiet Diesel",
      acUnits: "3 × 15,000 BTU heat pump",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Newmar London Aire — active luxury diesel (OEM MY19–27 brochures). Recent: Cummins X15 605 / 1,950 on Freightliner SL or Spartan K3 Tag.",
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
          to: 2014,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Spartan K3",
          notes: "2010–2014 mid/high diesel Class A — 2013–2014 slice locks OEM plans"
        },
        {
          from: 2015,
          to: 2017,
          engine: "Cummins ISX 600HP",
          horsepower: 600,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          notes: "OEM 2015–2017 London Aire: Freightliner SL or Spartan K3 tag, ISX 600. Chassis table is 600 on every plan. Do not copy MY18+ X15 605 onto 2015–2017."
        },
        {
          from: 2018,
          to: 2027,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Freightliner SL Tag / Spartan K3 (by option)",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          notes: "OEM MY18 London Aire: X15 605 (not ISX 600). Do not yearEnd this line. 12.5 kW Onan, 3×15k HP A/C."
        },
        
      ]
    },
    "Kountry Star": {
      type: "Class A Diesel",
      floorplans: ["3712", "3910", "4005", "3709PK", "3221", "3412", "3418", "3426", "3709", "3717", "4002", "4011", "4037", "4045", "4054", "4067", "4068", "4070", "3405"],
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
        // No 2015–2016 OEM Kountry Star brochure (archive last pre-gap PDF is 2011). Do not invent keys or yearEnd 2016 — modern reintro MY20, yearEnd 2024.
        // No 2017–2019 OEM Kountry Star brochure — omit keys (modern reintro MY20).
        // No 2019 OEM Kountry Star brochure and no strong RVUSA MY19 proof — omit key (reintroduced MY20).
        // Brochure 2020_Kountry_Star: 3412 | 3426 | 3709 | 3717 | 4002 | 4037 | 4045 | 4054 — XCR B6.7 360
        "2020": ["3412", "3426", "3709", "3717", "4002", "4037", "4045", "4054"],
        // Brochure 2021_Kountry_Star: 3412 | 3426 | 3709 | 3717 | 4002 | 4011 | 4037 | 4045 | 4067 — XCR ISB 360
        "2021": ["3412", "3426", "3709", "3717", "4002", "4011", "4037", "4045", "4067"],
        // Brochure 2022_Kountry_Star: 3412 | 3426 | 3709 | 3717 | 4002 | 4011 | 4037 | 4045 — XCR ISB 360
        "2022": ["3412", "3426", "3709", "3717", "4002", "4011", "4037", "4045"],
        // Brochure 2023_Kountry_Star: 3412 | 3426 | 3709 | 3717 | 4011 | 4037 | 4068 | 4070
        "2023": ["3412", "3426", "3709", "3717", "4011", "4037", "4068", "4070"],
        // RVUSA / dealer 2024-kountry-star brochure (OEM archive omitted MY24 PDF): 3418 | 3426 | 3709 | 3717 | 4011 | 4037 | 4068 | 4070
        "2024": ["3418", "3426", "3709", "3717", "4011", "4037", "4068", "4070"]
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
      yearEnd: 2024,
      description:
        "Newmar Kountry Star — entry diesel pusher Class A (not gas). Last OEM year 2024; succeeded by Northern Star from 2025. Modern coaches: Freightliner XCR + Cummins B6.7 360 / 800. Bay Star is Newmar’s gas F-53 line.",
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
          to: 2014,
          engine: "Cummins ISB / B6.7 diesel ~300–360HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC / XCR",
          transmission: "Allison 3000 MH",
          notes: "Mid-diesel pusher era — not L9 450, not Ford F53 gas. No OEM MY15–MY19 brochure (reintroduced MY20)."
        },
        {
          from: 2020,
          to: 2024,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCR",
          transmission: "Allison 3000 MH",
          notes:
            "OEM: Freightliner XCR + Cummins B6.7 360 / 800 — not 7.3 Godzilla (Bay Star) and not L9 450. Line ends MY2024; Northern Star from 2025."
        }
      ]
    },
    "Bay Star": {
      type: "Class A Gas",
      floorplans: ["3124", "3401", "3626", "3629", "3005", "3014", "3020", "3116", "3226", "3312", "3408", "3414", "3416", "3419", "3616", "3628", "3811", "3505", "3016", "3114", "3225", "3423", "3609", "3618", "3639", "3640", "3826", "3009", "3113", "3208", "3306", "3333", "3403", "3516", "3518", "3406", "3532", "2903", "3004", "3103", "3215", "3227", "3308", "3402", "3404"],
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
        // Brochure 2015_Bay_Star table: 2903 | 3103 | 3124 | 3215 | 3308 | 3401 | 3402 — F53 V10 362 GAS
        "2015": ["2903", "3103", "3124", "3215", "3308", "3401", "3402"],
        // Brochure 2016 Bay Star table: 3004 | 3124 | 3227 | 3401 | 3402 | 3403 | 3404 | 3518 — F53 V10 362 GAS
        "2016": ["3004", "3124", "3227", "3401", "3402", "3403", "3404", "3518"],
        // Brochure 2017 Bay Star table: 3009 | 3113 | 3124 | 3208 | 3306 | 3333 | 3401 | 3403 | 3516 | 3518 — F53 V10 320 GAS
        "2017": ["3009", "3113", "3124", "3208", "3306", "3333", "3401", "3403", "3516", "3518"],
        // Brochure 2018 Bay Star table: 3009 | 3113 | 3124 | 3333 | 3401 | 3403 | 3406 | 3414 | 3518 | 3532 — F53 V10 320 GAS
        "2018": ["3009", "3113", "3124", "3333", "3401", "3403", "3406", "3414", "3518", "3532"],
        // Brochure 2019 Bay Star table: 3014 | 3124 | 3226 | 3401 | 3408 | 3414 | 3419 | 3609 | 3626 | 3628 — F53 V10 320 GAS (no 3811)
        "2019": ["3014", "3124", "3226", "3401", "3408", "3414", "3419", "3609", "3626", "3628"],
        // Brochure 2020 Bay Star table: 3005 | 3014 | 3124 | 3226 | 3312 | 3401 | 3408 | 3414 | 3609 | 3616 | 3626 — F53 V10 320 GAS (no 3811)
        "2020": ["3005", "3014", "3124", "3226", "3312", "3401", "3408", "3414", "3609", "3616", "3626"],
        // Brochure 2021_Bay_Star: 3005 | 3014 | 3124 | 3226 | 3312 | 3401 | 3408 | 3414 | 3609 | 3616 | 3626 | 3811 — F53 7.3 350/468 GAS
        "2021": ["3005", "3014", "3124", "3226", "3312", "3401", "3408", "3414", "3609", "3616", "3626", "3811"],
        // Brochure 2022_Bay_Star: 3005 | 3014 | 3124 | 3226 | 3401 | 3408 | 3416 | 3609 | 3616 | 3626 | 3811 — F53 7.3 350/468 GAS
        "2022": ["3005", "3014", "3124", "3226", "3401", "3408", "3416", "3609", "3616", "3626", "3811"],
        // Brochure 2023_Bay_Star: 3014 | 3020 | 3124 | 3225 | 3401 | 3408 | 3609 | 3616 | 3626 | 3629 | 3811 — F53 7.3 350/468 GAS
        "2023": ["3014", "3020", "3124", "3225", "3401", "3408", "3609", "3616", "3626", "3629", "3811"],
        // Brochure 2024-bay-star: 3014 | 3116 | 3225 | 3423 | 3618 | 3626 | 3629 | 3811 — F53 7.3 335/468 GAS
        "2024": ["3014", "3116", "3225", "3423", "3618", "3626", "3629", "3811"],
        // Brochure 2025-bay-star: 3014 | 3016 | 3225 | 3423 | 3618 | 3626 | 3629 | 3811 | 3826 — F53 7.3 335/468 GAS
        "2025": ["3014", "3016", "3225", "3423", "3618", "3626", "3629", "3811", "3826"],
        // Brochure 2026-bay-star: 3114 | 3225 | 3609 | 3626 | 3629 | 3811 | 3826
        "2026": ["3114", "3225", "3609", "3626", "3629", "3811", "3826"],
        // Brochure MY27BS: 3114 | 3225 | 3609 | 3626 | 3639 | 3640 | 3811
        "2027": ["3114", "3225", "3609", "3626", "3639", "3640", "3811"]
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
      engine: "Ford 7.3L V8 Godzilla 335HP (recent) / Triton V10 (earlier)",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
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
      description: "Newmar Bay Star — mainstream gas Class A on Ford F-53. OEM MY25–27: 7.3L V8 335 / 468. Never a diesel pusher.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2014,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era. 2013–2014 slice locks OEM HP."
        },
        {
          from: 2015,
          to: 2016,
          engine: "Ford Triton V10 6.8L 362HP",
          horsepower: 362,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          notes: "OEM MY15–16 Bay Star: F53 Triton V10 362 — gas, not the MY17–20 320 rating and not diesel."
        },
        {
          from: 2017,
          to: 2020,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          notes: "OEM MY17–20 Bay Star: F53 Triton V10 320 — gas, not 7.3 Godzilla (MY21+) and not diesel."
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY21–23 Bay Star chassis table: F53 7.3 350 / 468 — gas, not diesel pusher. Not the later 335 rating."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 7.3L V8 Godzilla 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24–27 Bay Star DigiBrochure: F53 7.3 335 / 468 — gas, not L9 diesel"
        }
      ]
    },
    "Bay Star Sport": {
      type: "Class A Gas",
      floorplans: ["2702", "2903", "3014", "3307", "2902", "2720", "2813", "2905", "2912", "2920", "3008", "3016", "3112", "3225", "3226", "3315", "3316", "2812", "3013", "3208", "3210", "3306", "3113", "3312", "2705", "2707", "3004", "3022", "3220", "3227", "3309", "3404"],
      floorplansByYear: {
        "2010": ["2702", "2903", "3014"],
        "2011": ["2702", "2903", "3014"],
        "2012": ["2702", "2903", "3014"],
        "2013": ["2702", "2903", "3014"],
        "2014": ["2702", "2903", "3014"],
        // Brochure 2015 Bay Star Sport table: 2702 | 2707 | 2903 | 3022 | 3220 | 3306 | 3309 — F53 V10 362 GAS
        "2015": ["2702", "2707", "2903", "3022", "3220", "3306", "3309"],
        // Brochure 2016 Bay Star Sport table: 2702 | 2705 | 2903 | 3004 | 3227 | 3306 | 3404 — F53 V10 362 GAS
        "2016": ["2702", "2705", "2903", "3004", "3227", "3306", "3404"],
        // Brochure 2017 Bay Star Sport table: 2702 | 2812 | 2903 | 3013 | 3208 | 3210 | 3306 — F53 V10 320 GAS
        "2017": ["2702", "2812", "2903", "3013", "3208", "3210", "3306"],
        // Brochure 2018 Bay Star Sport table: 2702 | 2812 | 2903 | 3113 | 3307 | 3312 — F53 V10 320 GAS
        "2018": ["2702", "2812", "2903", "3113", "3307", "3312"],
        // Brochure 2019 Bay Star Sport table: 2702 | 2813 | 3008 | 3014 | 3226 | 3307 — F53 V10 320 GAS
        "2019": ["2702", "2813", "3008", "3014", "3226", "3307"],
        // Brochure 2020 Bay Star Sport table: 2702 | 2813 | 2905 | 3008 | 3014 | 3112 | 3226 | 3315 — F53 V10 320 GAS
        "2020": ["2702", "2813", "2905", "3008", "3014", "3112", "3226", "3315"],
        // Brochure 2021 Bay Star Sport table: 2702 | 2813 | 2905 | 3008 | 3014 | 3112 | 3226 | 3315 — F53 7.3 350/468 GAS
        "2021": ["2702", "2813", "2905", "3008", "3014", "3112", "3226", "3315"],
        // Brochure 2022_Bay_Star_Sport: 2702 | 2813 | 2905 | 3014 | 3226 | 3315 | 3316 — F53 7.3 350/468 GAS
        "2022": ["2702", "2813", "2905", "3014", "3226", "3315", "3316"],
        // Brochure 2023_Bay_Star_Sport: 2720 | 2813 | 2920 | 3014 | 3225 — F53 7.3 350/468 GAS
        "2023": ["2720", "2813", "2920", "3014", "3225"],
        // Brochure 2024-bay-star-sport: 2720 | 2813 | 2912 | 2920 | 3014 | 3225 — F53 7.3 335/468 GAS
        "2024": ["2720", "2813", "2912", "2920", "3014", "3225"],
        // Brochure 2025-bay-star-sport: 2813 | 3014 | 3016 | 3225 — F53 7.3 335/468 GAS
        "2025": ["2813", "3014", "3016", "3225"],
        // Brochure 2026 / MY27BT: 2813 | 3014 | 3225
        "2026": ["2813", "3014", "3225"],
        "2027": ["2813", "3014", "3225"]
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
      engine: "Ford 7.3L V8 Godzilla 335HP (recent) / Triton V10 (earlier)",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
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
      description: "Newmar Bay Star Sport — shorter gas Class A on Ford F-53. OEM MY25–27: 7.3L V8 335 / 468. Never a diesel pusher.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2014,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-Godzilla gas Class A — Triton V10 era. 2013–2014 slice locks OEM HP."
        },
        {
          from: 2015,
          to: 2016,
          engine: "Ford Triton V10 6.8L 362HP",
          horsepower: 362,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          notes: "OEM MY15–16 Bay Star Sport: F53 Triton V10 362 — gas, not the MY17–20 320 rating and not diesel."
        },
        {
          from: 2017,
          to: 2020,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          chassis: "Ford F53",
          transmission: "TorqShift automatic",
          notes: "OEM MY17–20 Bay Star Sport: F53 Triton V10 320 — gas, not 7.3 Godzilla (MY21+) and not diesel."
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY21–23 Bay Star Sport chassis table: F53 7.3 350 / 468 — gas. Not the later 335 rating."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 7.3L V8 Godzilla 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24–27 Bay Star Sport DigiBrochure: F53 7.3 335 / 468 — gas"
        }
      ]
    }
  },
  Tiffin: {
    Zephyr: {
      type: "Class A Diesel",
      floorplans: ["45NZ", "45FZ", "45PZ", "45QZ", "45AZ", "45MZ", "45OZ", "45DZ", "45TZ", "45LZ", "45QBZ", "45QEZ"],
      floorplansByYear: {
        "2005": ["45NZ", "45FZ"],
        "2006": ["45NZ", "45FZ"],
        "2007": ["45NZ", "45FZ"],
        "2008": ["45NZ", "45FZ"],
        "2009": ["45NZ", "45FZ"],
        // Brochure 2010_Zephyr: 45 QBZ | 45 QEZ — Spartan K2 · Cummins ISM 10.8 500 / 1,550. Not 45 NZ / 45 FZ / 45 LZ.
        "2010": ["45QBZ", "45QEZ"],
        // Brochure 2011_Zephyr: 45 QBZ only — Spartan K2 · Cummins ISM 10.8 500 / 1,550. 45 QEZ dropped.
        "2011": ["45QBZ"],
        // No MY12 Zephyr brochure on the current Tiffin resources index (or RVUSA OEM spec archive) — omit key. Do not copy 2011 or 2013.
        // Brochure 2013_Zephyr / 2014_Zephyr: 45 LZ | 45 TZ — Spartan K2 · Cummins ISX 11.9 500 / 1,645. Not 45 NZ / 45 FZ.
        "2013": ["45LZ", "45TZ"],
        "2014": ["45LZ", "45TZ"],
        // Brochure 2015_Zephyr: 45 DZ | 45 TZ — Spartan K2 · Cummins ISX 11.9 500 / 1,645. Not 45 NZ / 45 FZ.
        "2015": ["45DZ", "45TZ"],
        // No MY16 Zephyr brochure on the current Tiffin resources index — omit key. Do not copy 2015 or 2017.
        // Brochure 2017_Zephyr: 45 OZ only — Freightliner Cummins ISL 600 / 1950. Do not copy 45NZ/45FZ/45PZ.
        "2017": ["45OZ"],
        // No MY18 Zephyr brochure on the current Tiffin resources index (or craft archive) — omit key.
        // Brochure 2019_Zephyr: 45 MZ | 45 PZ — Cummins ISX 605 / 1950 on PowerGlide
        "2019": ["45MZ", "45PZ"],
        // Brochure 2020_Zephyr: 45 PZ — Cummins ISX / X15 605 / 1950 on PowerGlide
        "2020": ["45PZ"],
        // No MY21 Zephyr brochure on the current Tiffin resources index — do not copy MY20 or MY22.
        // OEM MY22 Zephyr: 45 PZ only. X15 605 / 1,950 · PowerGlide · Allison 4000 · Onan 12.5 kW
        "2022": ["45PZ"],
        // OEM MY23 / MY24 Zephyr: 45 FZ only (45 PZ is NO LONGER AVAILABLE in MY23 brochure)
        "2023": ["45FZ"],
        "2024": ["45FZ"],
        // OEM MY25-Zephyr / MY26-Zephyr / MY27 Zephyr: 45 FZ | 45 PZ — do not copy 45NZ onto 2025+
        "2025": ["45FZ", "45PZ"],
        "2026": ["45FZ", "45PZ"],
        "2027": ["45FZ", "45PZ"]
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
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Tiffin PowerGlide SL",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 20000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      fuelCapacityGal: 150,
      generator: "Onan 12.5kW Quiet Diesel",
      acUnits: "3 × 15,000 BTU heat pump",
      awningLength: 18,
      ceilingHeight: 83,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Tiffin Zephyr — flagship diesel. OEM MY25–27: PowerGlide SL, Cummins X15 605 / 1,950, Allison 4000 MH, Onan 12.5 kW. Plans 45 FZ / 45 PZ only — do not copy older 45NZ onto recent years.",
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
          to: 2011,
          engine: "Cummins ISM 10.8 500HP",
          horsepower: 500,
          torqueLbFt: 1550,
          chassis: "Spartan K2",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM 2010_Zephyr / 2011_Zephyr: Spartan K2 · ISM 10.8 500 / 1,550 · Allison 4000 MH · Onan 12.5 kW. Not ISX 11.9 (MY13+) and not ISL 600. No MY12 brochure."
        },
        {
          from: 2013,
          to: 2014,
          engine: "Cummins ISX 11.9 500HP",
          horsepower: 500,
          torqueLbFt: 1645,
          chassis: "Spartan K2",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM 2013_Zephyr / 2014_Zephyr: Spartan K2 · ISX 11.9 500 / 1,645 · Allison 4000 MH · Onan 12.5 kW · 45 LZ / 45 TZ. Not ISL 600 and not X15 605."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Cummins ISX 11.9 500HP",
          horsepower: 500,
          torqueLbFt: 1645,
          chassis: "Spartan K2",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM 2015_Zephyr: Spartan K2 · ISX 11.9 500 / 1,645 · Allison 4000 MH · Onan 12.5 kW · 45 DZ / 45 TZ. Not ISL 600 (MY17) and not X15 605. No MY16 brochure."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISL 600HP",
          horsepower: 600,
          torqueLbFt: 1950,
          chassis: "Freightliner",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM 2017_Zephyr: Freightliner · Cummins ISL 600 / 1,950 · Allison 4000 MH · Onan 12.5 kW · 45 OZ only. Brochure wording is ISL 600 (not ISX). No MY18 brochure — do not copy onto 2018."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Cummins ISX / X15 600HP class",
          horsepower: 600,
          chassis: "Tiffin PowerGlide",
          notes: "OEM 2019_Zephyr walk-back already locked 45 MZ / 45 PZ. Confirm ISX vs X15 on build sheet."
        },
        {
          from: 2020,
          to: 2021,
          engine: "Cummins X12 / X15 500–605HP",
          horsepower: 500,
          chassis: "Tiffin PowerGlide",
          notes: "Pre-MY22 Zephyr — confirm X12 vs X15 on build sheet. No MY21 brochure on the current OEM index. Do not stamp MY22 X15 605 onto 2020–2021."
        },
        {
          from: 2022,
          to: 2022,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM MY22 Zephyr: X15 605 / 1,950 · PowerGlide · Allison 4000 · Onan 12.5 kW · 45 PZ only. No MY21 brochure on the current OEM index."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          notes: "OEM MY23 / MY24 Zephyr: X15 605 / 1,950 · PowerGlide · Allison 4000 · Onan 12.5 kW · 45 FZ only. Do not stamp PowerGlide SL (MY25+) onto 2023–2024."
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Tiffin PowerGlide SL",
          transmission: "Allison 4000 MH",
          generator: "Onan 12.5kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          fuelCapacityGal: 150,
          freshWater: 100,
          grayWater: 100,
          blackWater: 55,
          towingCapacity: 20000,
          notes: "OEM MY25–27 Zephyr specs: X15 605 / 1,950 · PowerGlide SL · Allison 4000 · Onan 12.5 kW"
        }
      ]
    },
    "Allegro Bus": {
      type: "Class A Diesel",
      floorplans: ["37AP", "40AP", "45LP", "45OPP", "45CP", "37TS", "40IP", "45BQ", "35CP", "45FP", "45BTP", "36AP", "45BP", "45MP", "40SP", "45OP", "45UP", "40QBP", "43QGP", "36QSP", "40QXP", "43QBP", "43QRP"],
      floorplansByYear: {
        "2005": ["37AP", "40AP", "45LP"],
        "2006": ["37AP", "40AP", "45LP"],
        "2007": ["37AP", "40AP", "45LP"],
        "2008": ["37AP", "40AP", "45LP"],
        "2009": ["37AP", "40AP", "45LP", "45OPP"],
        // Brochure 2010_Allegro-Bus: 36 QSP | 40 QXP | 43 QBP | 43 QGP | 43 QRP — ISL 425 · PowerGlide or Spartan/Freightliner. No 37 AP / 40 AP / 45 LP / 45 OPP.
        "2010": ["36QSP", "40QXP", "43QBP", "43QGP", "43QRP"],
        // Archived OEM 2011_Allegro-Bus spec sheet: 36 QSP | 40 QXP | 43 QBP | 43 QGP | 43 QRP — ISL 450 / 1,250. Current Tiffin 2011 PDF is lifestyle-only.
        "2011": ["36QSP", "40QXP", "43QBP", "43QGP", "43QRP"],
        // Brochure 2012_Allegro-Bus: 36 QSP | 40 QBP | 40 QXP | 43 QGP | 43 QRP — ISL 450 / 1,250. 43 QBP dropped; 40 QBP new. No 45 OPP.
        "2012": ["36QSP", "40QBP", "40QXP", "43QGP", "43QRP"],
        // No MY13 Allegro Bus brochure on the current Tiffin resources index (2012 and 2014 exist; owner manual is not a brochure) — omit key.
        // Brochure 2014_Allegro-Bus: 37 AP | 40 QBP | 43 QGP | 45 LP — PowerGlide ISL 450 / 1250. No 40 AP / 45 OPP.
        "2014": ["37AP", "40QBP", "43QGP", "45LP"],
        // Brochure 2015_Allegro-Bus: 37 AP | 40 SP | 45 LP — ISL 450 / 1250 PowerGlide. No 40 AP / 45 OPP / 45 OP.
        "2015": ["37AP", "40SP", "45LP"],
        // Brochure 2016_Allegro-Bus: 37 AP | 40 AP | 40 SP | 45 LP | 45 OP | 45 UP — ISL 450 / 1250 std; Freightliner ISL 600 / 1950 opt on 45 OP / 45 UP only.
        "2016": ["37AP", "40AP", "40SP", "45LP", "45OP", "45UP"],
        // Brochure 2017_Allegro-Bus: 37 AP | 40 AP | 40 SP | 45 OP | 45 OPP — ISL 450 / 1250; ISX15 600 opt (not on 45' Freightliner)
        "2017": ["37AP", "40AP", "40SP", "45OP", "45OPP"],
        // Brochure 2018_Allegro-Bus: 37 AP | 40 AP | 40 SP | 45 OP | 45 OPP | 45 MP — ISL9 450 / 1250; X15 605 opt
        "2018": ["37AP", "40AP", "40SP", "45OP", "45OPP", "45MP"],
        // Brochure 2019_Allegro-Bus: 37 AP | 40 AP | 40 IP | 45 OPP | 45 MP — Cummins ISL9 450 / 1250
        "2019": ["37AP", "40AP", "40IP", "45OPP", "45MP"],
        // Brochure 2020_Allegro-Bus: 37 AP | 40 AP | 40 IP | 45 OPP | 45 MP — ISL9 450 / 1250
        "2020": ["37AP", "40AP", "40IP", "45OPP", "45MP"],
        // OEM MY21 Bus: 35 CP | 37 AP | 40 AP | 40 IP | 45 OPP — L9 450; X15 605 opt on 45 OPP
        "2021": ["35CP", "37AP", "40AP", "40IP", "45OPP"],
        // OEM MY22 Bus: 35 CP | 37 AP | 40 AP | 40 IP | 45 OPP | 45 FP — L9 450; X15 605 opt on 45'
        "2022": ["35CP", "37AP", "40AP", "40IP", "45OPP", "45FP"],
        // OEM MY23 / MY24 Bus: 35 CP | 40 IP | 45 FP | 45 OPP (37 AP / 40 AP no longer available)
        "2023": ["35CP", "40IP", "45FP", "45OPP"],
        "2024": ["35CP", "40IP", "45FP", "45OPP"],
        // OEM MY25-BUS specs: 35 CP | 40 IP | 45 FP | 45 OPP | 45 BTP — not 36 AP / not 45 BP
        "2025": ["35CP", "40IP", "45FP", "45OPP", "45BTP"],
        // OEM MY26 / MY27 Allegro Bus: 36 AP | 40 IP | 45 OPP | 45 BP (45 BP is new — do not copy onto 2025)
        "2026": ["36AP", "40IP", "45OPP", "45BP"],
        "2027": ["36AP", "40IP", "45OPP", "45BP"]
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
      engine: "Cummins L9 450HP (X15 605 opt on 45' MY26–27)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Tiffin PowerGlide XC",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 96,
      grayWater: 91,
      blackWater: 53,
      fuelCapacityGal: 150,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 83,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description: "Tiffin Allegro Bus — PowerGlide high-line diesel. 45 OPP is a floorplan of Allegro Bus, not a separate brand. OEM MY25: 35 CP / 40 IP / 45 FP / 45 OPP / 45 BTP, L9 450. OEM MY26–27: 36 AP / 40 IP / 45 OPP / 45 BP; L9 450 / 1,250 std; X15 605 / 1,950 opt on 45' (PowerGlide SL).",
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
          to: 2010,
          engine: "Cummins ISL 425HP",
          horsepower: 425,
          chassis: "Tiffin PowerGlide / Spartan / Freightliner (by option)",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0kW / 10.0kW Quiet Diesel",
          notes: "OEM 2010_Allegro-Bus: Cummins ISL 425 · PowerGlide or Spartan/Freightliner · Allison 3000 MH. Brochure does not print torque — do not invent 1,250. Not 450 (MY11+)."
        },
        {
          from: 2011,
          to: 2012,
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide / Freightliner (by option)",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0kW / 10.0kW Quiet Diesel",
          notes: "OEM 2011_Allegro-Bus spec / 2012_Allegro-Bus: ISL 450 / 1,250 · PowerGlide or Freightliner · Allison 3000 MH. No Freightliner 600 option. No 45 OPP. No MY13 Bus brochure."
        },
        {
          from: 2014,
          to: 2014,
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Quiet Diesel",
          notes: "OEM 2014_Allegro-Bus: PowerGlide · ISL 450 / 1,250 · Allison 3000 MH · Onan 10 kW. No Freightliner 600 option. 37 AP / 40 QBP / 43 QGP / 45 LP."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Quiet Diesel",
          notes: "OEM 2015_Allegro-Bus: PowerGlide · ISL 450 / 1,250 · Allison 3000 MH · Onan 10 kW. No Freightliner 600 option on this brochure."
        },
        {
          from: 2016,
          to: 2016,
          floorplans: ["45OP", "45 OP", "45UP", "45 UP"],
          engine: "Cummins ISL 450HP std / ISL 600HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide (Freightliner if ISL 600)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Quiet Diesel",
          notes: "OEM 2016_Allegro-Bus 45 OP / 45 UP: PowerGlide ISL 450 / 1,250 std; Freightliner ISL 600 / 1,950 optional."
        },
        {
          from: 2016,
          to: 2016,
          floorplans: ["37AP", "37 AP", "40AP", "40 AP", "40SP", "40 SP", "45LP", "45 LP"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Quiet Diesel",
          notes: "OEM 2016_Allegro-Bus 37 AP / 40 AP / 40 SP / 45 LP: PowerGlide ISL 450 / 1,250 only. Freightliner ISL 600 not available."
        },
        {
          from: 2016,
          to: 2016,
          engine: "Cummins ISL 450HP (ISL 600 opt on 45 OP / 45 UP)",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10.0kW Quiet Diesel",
          notes: "OEM 2016_Allegro-Bus default: ISL 450 std; Freightliner ISL 600 only on 45 OP / 45 UP. Do not stamp MY17 ISX15."
        },
        {
          from: 2017,
          to: 2017,
          floorplans: ["45OP", "45 OP", "45OPP", "45 OPP"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM 2017_Allegro-Bus 45 OP / 45 OPP: ISL 450 / 1,250 on PowerGlide. Freightliner ISX15 600 not available on these plans."
        },
        {
          from: 2017,
          to: 2017,
          floorplans: ["37AP", "37 AP", "40AP", "40 AP", "40SP", "40 SP"],
          engine: "Cummins ISL 450HP std / ISX15 600HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide (Freightliner if ISX15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM 2017_Allegro-Bus 37 AP / 40 AP / 40 SP: ISL 450 / 1,250 std; Freightliner ISX15 600 / 1,950 optional."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISL 450HP (ISX15 600 opt on 37–40')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM 2017_Allegro-Bus default: ISL 450 std; ISX15 600 only as Freightliner option on 37–40' (not 45 OP / 45 OPP)."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins ISL9 450HP std / X15 605HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide / Freightliner (if X15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM 2018_Allegro-Bus: ISL9 450 / 1,250 std; PowerGlide/Freightliner X15 605 / 1,950 optional. Do not stamp L9-only onto 2018."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "MY19–20 Bus default L9 450. 2021–2022 walk-back locks X15 opt on 45' from OEM brochure."
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["35CP", "35 CP", "37AP", "37 AP", "40AP", "40 AP", "40IP", "40 IP"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY21 Bus 35 CP / 37 AP / 40 AP / 40 IP — L9 450 / 1,250 only (no X15)."
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["45OPP", "45 OPP"],
          engine: "Cummins L9 450HP std / X15 605HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP (Allison 4000 if X15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY21 45 OPP: L9 450 / 1,250 std; X15 605 / 1,950 opt."
        },
        {
          from: 2021,
          to: 2021,
          engine: "Cummins L9 450HP (X15 605 opt on 45')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY21 Bus default: L9 450 std; X15 605 only on 45 OPP."
        },
        {
          from: 2022,
          to: 2022,
          floorplans: ["35CP", "35 CP", "37AP", "37 AP", "40AP", "40 AP", "40IP", "40 IP"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY22 Bus 35 CP / 37 AP / 40 AP / 40 IP — L9 450 / 1,250 only (no X15)."
        },
        {
          from: 2022,
          to: 2022,
          floorplans: ["45OPP", "45 OPP", "45FP", "45 FP"],
          engine: "Cummins L9 450HP std / X15 605HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP (Allison 4000 if X15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY22 45 OPP / 45 FP: L9 450 / 1,250 std; X15 605 / 1,950 opt."
        },
        {
          from: 2022,
          to: 2022,
          engine: "Cummins L9 450HP (X15 605 opt on 45')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSP",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY22 Bus default: L9 450 std; X15 605 only on 45 OPP / 45 FP."
        },
        {
          from: 2023,
          to: 2024,
          floorplans: ["35CP", "35 CP", "40IP", "40 IP"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY23 / MY24 Bus 35 CP / 40 IP — L9 450 / 1,250 only (no X15)."
        },
        {
          from: 2023,
          to: 2024,
          floorplans: ["45FP", "45 FP", "45OPP", "45 OPP"],
          engine: "Cummins L9 450HP std / X15 605HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC (Allison 4000 / tag if X15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY23 / MY24 45 FP / 45 OPP: L9 450 / 1,250 std; X15 605 / 1,950 opt."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins L9 450HP (X15 605 opt on 45')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY23 / MY24 Bus default: L9 450 std; X15 605 only on 45 FP / 45 OPP."
        },
        {
          from: 2025,
          to: 2025,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY25-BUS: L9 450 / 1,250 on all listed plans. X15 option is MY26–27 45' only — do not copy onto 2025."
        },
        {
          from: 2026,
          to: 2027,
          floorplans: ["36AP", "36 AP", "40IP", "40 IP"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY26–27 Bus 36 AP / 40 IP — L9 450 / 1,250 only (no X15)."
        },
        {
          from: 2026,
          to: 2027,
          floorplans: ["45OPP", "45 OPP", "45BP", "45 BP"],
          engine: "Cummins L9 450HP std / X15 605HP opt",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC (SL if X15)",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel",
          notes: "OEM MY26–27 45' Bus: L9 450 / 1,250 std; X15 605 / 1,950 opt moves chassis to PowerGlide SL."
        },
        {
          from: 2026,
          to: 2027,
          engine: "Cummins L9 450HP (X15 605 opt on 45')",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH",
          generator: "Onan 10kW Quiet Diesel"
        }
      ]
    },
    "Allegro Bus 45OPP": {
      type: "Class A Diesel",
      floorplans: ["45OPP"],
      floorplansByYear: {
        // 45 OPP is not on OEM 2010–2012 Allegro Bus brochures (36/40/43 Q-series). Omit keys.
        // No MY13 Bus brochure. OEM 2014_Allegro-Bus is 37 AP / 40 QBP / 43 QGP / 45 LP — 45 OPP not listed. Omit 2013–2014.
        // 45 OPP is not on the OEM 2015_Allegro-Bus (37 AP / 40 SP / 45 LP) or 2016_Allegro-Bus (45 OP / 45 UP) brochures — omit keys.
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
      yearStart: 2017,
      yearEnd: 2026,
      description: "Legacy search alias for Allegro Bus floorplan 45 OPP — yearStart 2017 (not on OEM 2010–2016 Bus brochures) · yearEnd 2026. Prefer Allegro Bus + 45OPP. Kept so older saved units still cascade.",
      powertrainByYear: [
        {
          from: 2017,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Tiffin PowerGlide"
        },
        
      ]
    },
    "Allegro 45OPP": {
      type: "Class A Diesel",
      floorplans: ["45OPP"],
      floorplansByYear: {
        "2009": ["45OPP"],
        // 45 OPP is not on OEM 2010–2012 Allegro Bus brochures (36/40/43 Q-series). Omit keys — do not copy 2009 forward.
        // No MY13 Bus brochure. OEM 2014_Allegro-Bus is 37 AP / 40 QBP / 43 QGP / 45 LP — 45 OPP not listed. Omit 2013–2014.
        // 45 OPP is not on the OEM 2015_Allegro-Bus (37 AP / 40 SP / 45 LP) or 2016_Allegro-Bus (45 OP / 45 UP) brochures — omit keys.
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
      lengthRange: [45, 45],
      weightRange: [46000, 56000],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [389900, 720000],
      engine: "Cummins L9 450HP (X12 optional)",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Tiffin PowerGlide",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 55,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 10kW Quiet Diesel",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2009,
      yearEnd: 2026,
      description: "Legacy search alias for Allegro Bus 45 OPP (8/28 ezrv name). yearEnd 2026 — use Allegro Bus + 45OPP for MY27. Same PowerGlide L9 platform; not a separate make.",
      powertrainByYear: [
        {
          from: 2009,
          to: 2009,
          engine: "Cummins ISL / ISB 300–450HP (era)",
          horsepower: 380,
          chassis: "Tiffin PowerGlide",
          notes: "2009 alias leftover — 45 OPP is not on OEM 2010–2012 / 2014–2016 Bus brochures. Do not copy onto 2010–2012."
        },
        {
          from: 2017,
          to: 2026,
          engine: "Cummins L9 450HP (X12 optional)",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 3000 MH"
        }
      ]
    },
    Phaeton: {
      type: "Class A Diesel",
      floorplans: [
        "36GH",
        "36SH",
        "35CH",
        "37BH",
        "40AH",
        "40IH",
        "40QBH",
        "40QKH",
        "40QTH",
        "36QSH",
        "42LH",
        "42QBH",
        "42QRH",
        "44OH",
        "45OH",
      ],
      floorplansByYear: {
        "2005": ["36GH", "40AH", "40IH"],
        "2006": ["36GH", "40AH", "40IH"],
        "2007": ["36GH", "40AH", "40IH"],
        "2008": ["36GH", "40AH", "40IH"],
        "2009": ["36GH", "40AH", "40IH", "44OH"],
        // Brochure 2010_Phaeton: 36 QSH | 40 QTH | 42 QRH | 42 QBH — Freightliner ISC 360 / 1,050 std; Spartan ISC 360 opt on 42'. No 36 GH / 40 AH / 40 IH / 44 OH.
        "2010": ["36QSH", "40QTH", "42QRH", "42QBH"],
        // Archived OEM 2011_Phaeton spec: 36 QSH | 40 QBH | 40 QKH | 40 QTH | 42 QBH — FL/Spartan ISC 380 / 1,050. 42 QRH dropped.
        "2011": ["36QSH", "40QBH", "40QKH", "40QTH", "42QBH"],
        // Brochure 2012_Phaeton: 36 QSH | 40 QBH | 40 QKH | 40 QTH | 42 QBH — FL ISC 380 / 1,050 on 36–40'; 42 QBH = ISL 400 / 1,250 (Spartan ISC 400 / 1,200 opt).
        "2012": ["36QSH", "40QBH", "40QKH", "40QTH", "42QBH"],
        // Brochure 2013_Phaeton: 36 GH | 36 QSH | 40 QBH | 40 QKH | 40 QTH | 42 LH | 42 QBH — FL ISC 380 / 1050 on 36–40'; FL ISL 400 / 1250 on 42'. No 40 AH / 40 IH / 44 OH.
        "2013": ["36GH", "36QSH", "40QBH", "40QKH", "40QTH", "42LH", "42QBH"],
        // Brochure 2014_Phaeton: 36 GH | 40 QBH | 40 QKH | 40 QTH | 42 LH — FL ISL 380 / 1050 on 36–40'; FL ISL 450 / 1250 on 42 LH. No 36 QSH / 42 QBH.
        "2014": ["36GH", "40QBH", "40QKH", "40QTH", "42LH"],
        // Brochure 2015_Phaeton: 36 GH | 40 AH | 40 QBH | 40 QKH | 42 LH — Freightliner ISL 380 / 1050 except 42' ISL 450 / 1250. No 40 IH / 44 OH / 37 BH.
        "2015": ["36GH", "40AH", "40QBH", "40QKH", "42LH"],
        // Brochure 2016_Phaeton: 36 GH | 40 AH | 40 QBH | 40 QKH | 42 LH | 44 OH — FL ISL 380 / 1050 on 36–40'; FL ISL 450 on 42 LH; FL 450 std / PowerGlide 450 opt on 44 OH.
        "2016": ["36GH", "40AH", "40QBH", "40QKH", "42LH", "44OH"],
        // Brochure 2017_Phaeton: 36 GH | 40 AH | 40 QBH | 40 QKH | 44 OH — ISL 380 / 1050 Freightliner; ISL 450 / 1250 PowerGlide. No 37 BH / 40 IH.
        "2017": ["36GH", "40AH", "40QBH", "40QKH", "44OH"],
        // Brochure 2018_Phaeton: 36 GH | 37 BH | 40 AH | 40 IH | 40 QBH | 40 QKH | 44 OH — ISL 380 / 1050; ISL 450 / 1250 PowerGlide
        "2018": ["36GH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        // Brochure 2019_Phaeton: 37 BH | 40 AH | 40 IH | 40 QBH | 40 QKH | 44 OH — L9 380 / 1150 default
        "2019": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        // Brochure 2020_Phaeton: 37 BH | 40 AH | 40 IH | 40 QBH | 40 QKH | 44 OH — L9 380 / 1150 default
        "2020": ["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        // OEM MY21 / MY22 Phaeton: 36 SH | 37 BH | 40 AH | 40 IH | 40 QBH | 40 QKH | 44 OH (45 OH not in brochure)
        "2021": ["36SH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        "2022": ["36SH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"],
        // OEM MY23 Phaeton: 36 SH | 37 BH | 40 IH | 44 OH (40 AH / 40 QBH / 40 QKH no longer available)
        "2023": ["36SH", "37BH", "40IH", "44OH"],
        // OEM MY24 Phaeton: 35 CH | 37 BH | 40 IH | 44 OH — L9 450 standard on all plans
        "2024": ["35CH", "37BH", "40IH", "44OH"],
        // OEM MY25-Phaeton / MY26 / MY27: 35 CH | 37 BH | 40 IH | 44 OH — do not copy 40AH / 40QBH / 40QKH onto 2025+
        "2025": ["35CH", "37BH", "40IH", "44OH"],
        "2026": ["35CH", "37BH", "40IH", "44OH"],
        "2027": ["35CH", "37BH", "40IH", "44OH"]
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
      // OEM MY25–27: L9 450 / 1,250 now standard on ALL plans including 37BH. Pre-2025 stays 380-default.
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Tiffin PowerGlide XC",
      transmission: "Allison 3000 MH 6-speed",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 100,
      blackWater: 55,
      fuelCapacityGal: 100,
      generator: "Onan 10.0 kW Quiet Diesel",
      acUnits: "3 × 15,000 BTU heat pump",
      awningLength: 18,
      ceilingHeight: 83,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2000,
      description:
        "Tiffin Phaeton — Class A diesel. OEM MY25–27: PowerGlide XC, Cummins L9 450 / 1,250 now standard on all plans (including 37 BH), Onan 10 kW. OEM MY24 brochure: L9 450 also standard on all plans including 37 BH (XSH chassis). OEM MY23: 36 SH / 37 BH / 40 IH / 44 OH; L9 380 std on 36 SH / 37 BH / 40 IH, 450 std on 44 OH (450 opt on 40 IH). Year-first — do not stamp 450 onto 2023 37BH.",
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
          to: 2010,
          engine: "Cummins ISC 360HP",
          horsepower: 360,
          torqueLbFt: 1050,
          chassis: "Freightliner (Spartan opt on 42')",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0kW Quiet Diesel",
          notes: "OEM 2010_Phaeton: Freightliner ISC 360 / 1,050 std; Spartan ISC 360 / 1,050 optional on 42 QRH / 42 QBH. Not ISC 380 (MY11+) and not L9.",
        },
        {
          from: 2011,
          to: 2011,
          engine: "Cummins ISC 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner / Spartan / PowerGlide (by option)",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0kW Quiet Diesel",
          notes: "OEM 2011_Phaeton spec: Freightliner or Spartan ISC 380 / 1,050. PowerGlide listed on 40 QKH. Not ISL 400 and not L9.",
        },
        {
          from: 2012,
          to: 2012,
          floorplans: ["42QBH", "42 QBH"],
          engine: "Cummins ISL 400HP",
          horsepower: 400,
          torqueLbFt: 1250,
          chassis: "Freightliner (Spartan ISC 400 opt)",
          transmission: "Allison 3000 MH 6-speed",
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2012_Phaeton 42 QBH: Freightliner ISL 400 / 1,250 std; Spartan ISC 400 / 1,200 optional. 36–40' are ISC 380 / 1,050.",
        },
        {
          from: 2012,
          to: 2012,
          engine: "Cummins ISC 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner / PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2012_Phaeton 36 QSH / 40 QBH / 40 QKH / 40 QTH: Freightliner ISC 380 / 1,050. 42 QBH is ISL 400. Not L9.",
        },
        {
          from: 2013,
          to: 2013,
          floorplans: ["42LH", "42 LH", "42QBH", "42 QBH"],
          engine: "Cummins ISL 400HP",
          horsepower: 400,
          torqueLbFt: 1250,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2013_Phaeton 42 LH / 42 QBH: Freightliner ISL 400 / 1,250. 36–40' are ISC 380 / 1,050. Not ISL 450.",
        },
        {
          from: 2013,
          to: 2013,
          engine: "Cummins ISC 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2013_Phaeton 36 GH / 36 QSH / 40 QBH / 40 QKH / 40 QTH: Freightliner ISC 380 / 1,050. 42' is ISL 400. Not L9 and not ISL 380.",
        },
        {
          from: 2014,
          to: 2014,
          floorplans: ["42LH", "42 LH"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2014_Phaeton 42 LH: Freightliner ISL 450 / 1,250. Other 2014 plans are ISL 380 / 1,050.",
        },
        {
          from: 2014,
          to: 2014,
          engine: "Cummins ISL 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2014_Phaeton 36 GH / 40 QBH / 40 QKH / 40 QTH: Freightliner ISL 380 / 1,050. 42 LH is 450. Not L9. Not ISC 380 (that is MY13).",
        },
        {
          from: 2015,
          to: 2015,
          floorplans: ["42LH", "42 LH"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2015_Phaeton 42 LH: Freightliner ISL 450 / 1,250. All other 2015 plans are ISL 380 / 1,050.",
        },
        {
          from: 2015,
          to: 2015,
          engine: "Cummins ISL 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2015_Phaeton 36 GH / 40 AH / 40 QBH / 40 QKH: Freightliner ISL 380 / 1,050. 42' is 450. Not L9. No PowerGlide option on this brochure.",
        },
        {
          from: 2016,
          to: 2016,
          floorplans: ["42LH", "42 LH"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2016_Phaeton 42 LH: Freightliner ISL 450 / 1,250 only (380 and PowerGlide not listed on this plan).",
        },
        {
          from: 2016,
          to: 2016,
          floorplans: ["44OH", "44 OH"],
          engine: "Cummins ISL 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2016_Phaeton 44 OH: Freightliner ISL 450 / 1,250 std; PowerGlide ISL 450 / 1,250 optional. 380 not listed on this plan.",
        },
        {
          from: 2016,
          to: 2016,
          engine: "Cummins ISL 380HP",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan diesel (slide-out)",
          notes: "OEM 2016_Phaeton 36 GH / 40 AH / 40 QBH / 40 QKH: Freightliner ISL 380 / 1,050 only. 42 LH / 44 OH are 450. Not L9 380/1150.",
        },
        // Floorplan-specific L9 bands (must appear before model-wide for same years)
        {
          from: 2017,
          to: 2018,
          engine: "Cummins ISL 380HP std / ISL 450HP opt",
          horsepower: 380,
          torqueLbFt: 1050,
          chassis: "Freightliner / Tiffin PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes:
            "OEM 2017–2018_Phaeton: Freightliner ISL 380 / 1,050 std; PowerGlide ISL 450 / 1,250 optional. Not L9 380/1150 (that band starts MY19). MY17 has no 37 BH.",
        },
        {
          from: 2019,
          to: 2023,
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
            "37BH MY19–23 — OEM 380/1150. MY24 brochure made 450 standard on all plans including 37 BH. Do not stamp this L9 band onto MY17–18 ISL.",
        },
        {
          from: 2019,
          to: 2020,
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
            "44OH tag axle MY19–20 — 380 standard; 450/1250 may be available. Confirm build sheet. MY21–22 brochure locks 450 standard.",
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["36SH", "36 SH", "37BH", "37 BH", "40AH", "40 AH", "40QBH", "40 QBH", "40QKH", "40 QKH"],
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCM",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY21 Phaeton 36 SH / 37 BH / 40 AH / 40 QBH / 40 QKH: L9 380 / 1,150 only (450 not offered).",
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["40IH", "40 IH"],
          engine: "Cummins L9 380HP std / L9 450HP opt",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "PowerGlide XSH / Freightliner XCR (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY21 Phaeton 40 IH: PowerGlide XSH L9 380 / 1,150 std; L9 450 / 1,250 optional (FL XCR or PG).",
        },
        {
          from: 2021,
          to: 2021,
          floorplans: ["44OH", "44 OH"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XSH",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY21 Phaeton 44 OH: PowerGlide XSH L9 450 / 1,250 standard (380 not listed).",
        },
        {
          from: 2022,
          to: 2022,
          floorplans: ["36SH", "36 SH", "37BH", "37 BH", "40AH", "40 AH", "40QBH", "40 QBH", "40QKH", "40 QKH"],
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCM",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY22 Phaeton 36 SH / 37 BH / 40 AH / 40 QBH / 40 QKH: L9 380 / 1,150 only (450 not offered).",
        },
        {
          from: 2022,
          to: 2022,
          floorplans: ["40IH", "40 IH"],
          engine: "Cummins L9 380HP std / L9 450HP opt",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCR / PowerGlide XSH (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY22 Phaeton 40 IH: Freightliner XCR L9 380 / 1,150 std; L9 450 / 1,250 optional (FL or PG).",
        },
        {
          from: 2022,
          to: 2022,
          floorplans: ["44OH", "44 OH"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner XCR / PowerGlide XSH (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY22 Phaeton 44 OH: Freightliner XCR L9 450 / 1,250 standard; PowerGlide XSH 450 optional (380 not listed).",
        },
        {
          from: 2023,
          to: 2023,
          floorplans: ["36SH", "36 SH", "37BH", "37 BH"],
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCM",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY23 Phaeton 36 SH / 37 BH: L9 380 / 1,150 only (450 not offered).",
        },
        {
          from: 2023,
          to: 2023,
          floorplans: ["40IH", "40 IH"],
          engine: "Cummins L9 380HP std / L9 450HP opt",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCR / PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY23 Phaeton 40 IH: L9 380 / 1,150 std; L9 450 / 1,250 optional.",
        },
        {
          from: 2023,
          to: 2023,
          floorplans: ["44OH", "44 OH"],
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Freightliner XCR / PowerGlide (by option)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW diesel (slide-out)",
          notes: "OEM MY23 Phaeton 44 OH: L9 450 / 1,250 standard (380 not listed).",
        },
        {
          from: 2019,
          to: 2023,
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
            "MY19–23 default L9 380/1150. 450 only where brochure offered it (MY23: 40 IH opt / 44 OH std) — never invent 450 for 37BH before MY24.",
        },
        {
          from: 2024,
          to: 2024,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "PowerGlide XSH / Freightliner XCR (by plan)",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW Quiet Diesel",
          freshWater: 100,
          grayWater: 100,
          blackWater: 55,
          ceilingHeight: 83,
          notes:
            "OEM MY24 Phaeton: L9 450 / 1,250 standard on all floorplans including 37 BH. 35 CH / 37 BH PowerGlide XSH std; 40 IH / 44 OH Freightliner XCR.",
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Tiffin PowerGlide XC",
          transmission: "Allison 3000 MH 6-speed",
          fuelCapacityGal: 100,
          towingCapacity: 10000,
          generator: "Onan 10.0 kW Quiet Diesel",
          acUnits: "3 × 15,000 BTU heat pump",
          freshWater: 100,
          grayWater: 100,
          blackWater: 55,
          ceilingHeight: 83,
          notes:
            "OEM MY25–27 Phaeton specs: L9 450 / 1,250 now standard on all floorplans including 37 BH. Do not copy this band onto 2024 and older.",
        },
      ],
    },
    "Allegro Red 340": {
      type: "Class A Diesel",
      floorplans: ["33AA", "37BA", "33AL", "37PA", "38KA", "38LL", "36QSA", "38QBA", "38QRA", "36AR", "38RA"],
      floorplansByYear: {
        // No MY13 / MY14 RED 340 brochure — single Allegro RED line (not a 340/360 split). Omit keys.
        // No MY17 / MY18 RED 340 brochure — line not split yet (single Allegro RED). Omit keys.
        // Brochure 2019_RED-340-Flyer: 33 AA single model — Cummins B6.7 340 / 700 on Freightliner XC
        "2019": ["33AA"],
        // Brochure 2020_RED-340: 33 AL — B6.7 340 / 700 on PowerGlide
        "2020": ["33AL"],
        // OEM MY21 / MY22 RED 340: 33 AL | 38 LL — B6.7 340 / 700. Not 33 AA / 37 BA / 38 KA (those are RED 360).
        "2021": ["33AL", "38LL"],
        "2022": ["33AL", "38LL"],
        // OEM MY23 RED 340: 33 AL | 38 LL (B6.7 340 / 700 · XCS). Not 33 AA / 37 BA / 38 KA.
        "2023": ["33AL", "38LL"]
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
      yearStart: 2019,
      yearEnd: 2023,
      description: "Tiffin Allegro Red 340 — mid-diesel on Freightliner XC. OEM MY23: 33 AL / 38 LL, Cummins B6.7 340 / 700, XCS, Allison 2500 MH, Onan 8 kW. yearEnd 2023 — OEM MY24+ is the unified Allegro RED nameplate (L9 380). No MY13–MY18 RED 340 brochure (single Allegro RED).",
      powertrainByYear: [
        {
          from: 2019,
          to: 2020,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC-Series",
          transmission: "Allison 3000 MH",
          notes: "OEM 2019 RED 340 flyer / 2020 RED 340: B6.7 340 / 700. Not the 360 HP Allegro RED line. MY21–23 brochure is B6.7 340 / 700."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XCS Straight Rail",
          transmission: "Allison 2500 MH",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM MY21 / MY22 RED 340: B6.7 340 / 700 · Freightliner XCS · Allison 2500 MH · Onan 8 kW. Not the 360 / L9 RED 360."
        },
        {
          from: 2023,
          to: 2023,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XCS Straight Rail",
          transmission: "Allison 2500 MH",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM MY23 RED 340: B6.7 340 / 700 · XCS · Allison 2500 MH · Onan 8 kW. Line ends MY23."
        }
      ]
    },
    "Allegro Red 360": {
      type: "Class A Diesel",
      floorplans: ["33AA", "36UA", "37BA", "38KA", "38BR", "38FR", "45BR", "37PA", "38QBA", "38QRA"],
      floorplansByYear: {
        // Brochure 2018_Allegro-RED (still a single RED line; OEM index files it under RED 360): 33 AA | 37 BA | 37 PA | 38 QBA | 38 QRA — ISB 6.7 360 / 800. Not 36 UA (Open Road gas).
        "2018": ["33AA", "37BA", "37PA", "38QBA", "38QRA"],
        // Brochure 2019_Allegro-RED (360): 33 AA | 37 BA | 37 PA — Cummins B6.7 360 / 800 on Freightliner XC
        "2019": ["33AA", "37BA", "37PA"],
        // Brochure 2020_Allegro-RED-360: 33 AA | 37 BA | 37 PA | 38 KA — B6.7 360 / 800 on Freightliner XC
        "2020": ["33AA", "37BA", "37PA", "38KA"],
        // OEM MY21 / MY22 RED 360: 33 AA | 37 BA | 37 PA | 38 KA — B6.7 360 / 800. Not L9. 36 UA not in brochure.
        "2021": ["33AA", "37BA", "37PA", "38KA"],
        "2022": ["33AA", "37BA", "37PA", "38KA"],
        // OEM MY23 RED 360: 33 AA | 37 BA | 38 KA (37 PA no longer available; 36 UA not in MY23 brochure)
        "2023": ["33AA", "37BA", "38KA"]
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
      yearEnd: 2023,
      description: "Tiffin Allegro Red 360 — stepped-up Red vs 340. OEM MY23: 33 AA / 37 BA / 38 KA on Freightliner XCM, Cummins B6.7 360 / 800, Allison 3000 MH, Onan 8 kW (not L9). yearEnd 2023 — OEM MY24+ is the unified Allegro RED nameplate (L9 380).",
      powertrainByYear: [
        {
          from: 2018,
          to: 2020,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XC raised-rail",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM 2018_Allegro-RED / 2019–2020 RED 360: ISB 6.7 360 / 800 on Freightliner XC. Not L9. MY18 brochure is still titled Allegro RED (not yet a 340/360 split)."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCM Modular Rail",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM MY21 / MY22 RED 360: B6.7 360 / 800 · XCM · Allison 3000 MH · Onan 8 kW. Not L9."
        },
        {
          from: 2023,
          to: 2023,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCM Modular Rail",
          transmission: "Allison 3000 MH",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM MY23 RED 360: B6.7 360 / 800 · XCM · Allison 3000 MH · Onan 8 kW. Not L9."
        }
      ]
    },
    "Allegro Red": {
      type: "Class A Diesel",
      floorplans: ["33AA", "37BA", "38QBA", "33AL", "38KA", "37PA", "38QRA", "36QSA", "34QFA"],
      floorplansByYear: {
        "2005": ["33AA", "37BA", "38QBA"],
        "2006": ["33AA", "37BA", "38QBA"],
        "2007": ["33AA", "37BA", "38QBA"],
        "2008": ["33AA", "37BA", "38QBA"],
        "2009": ["33AA", "37BA", "38QBA"],
        // Brochure 2010_RED: 34 QFA | 36 QSA | 38 QBA — ISB 6.7 340 / 660 · Allison 2500 · Freightliner. Not 33 AA / 37 BA.
        "2010": ["34QFA", "36QSA", "38QBA"],
        // Archived OEM 2011_RED spec: 34 QFA | 36 QSA | 38 QBA — ISB 6.7 340 / 660 · Allison 2500.
        "2011": ["34QFA", "36QSA", "38QBA"],
        // Brochure 2012_RED: 34 QFA | 36 QSA | 38 QBA | 38 QRA — ISB 6.7 340 / 660 · Allison 2500. 38 QRA new.
        "2012": ["34QFA", "36QSA", "38QBA", "38QRA"],
        // Brochure 2013_RED: 34 QFA | 36 QSA | 38 QBA | 38 QRA — ISB 6.7 340 / 660 · Allison 2500. Not 33 AA / 37 BA.
        "2013": ["34QFA", "36QSA", "38QBA", "38QRA"],
        // Brochure 2014_RED: 33 AA | 34 QFA | 36 QSA | 38 QBA | 38 QRA — ISB 6.7 340 / 660 · Allison 2500. Not 37 BA / 33 AL.
        "2014": ["33AA", "34QFA", "36QSA", "38QBA", "38QRA"],
        // Brochure 2015_RED: 33 AA | 36 QSA | 37 PA | 38 QBA | 38 QRA — ISB 6.7 340 / 660 · Allison 2500. Not 37 BA / 33 AL.
        "2015": ["33AA", "36QSA", "37PA", "38QBA", "38QRA"],
        // Brochure 2016_RED: 33 AA | 37 PA | 38 QBA | 38 QRA — ISB 6.7 340 / 660 Allison 2500 or 360 / 800 Allison 3000.
        "2016": ["33AA", "37PA", "38QBA", "38QRA"],
        // Brochure 2017_RED: 33 AA | 37 PA | 38 QBA | 38 QRA — ISB 6.7 360 / 800. Not 33 AL / 37 BA.
        "2017": ["33AA", "37PA", "38QBA", "38QRA"],
        // Brochure 2018_Allegro-RED: 33 AA | 37 BA | 37 PA | 38 QBA | 38 QRA — still a single RED line (360 HP). Also indexed as Red 360.
        "2018": ["33AA", "37BA", "37PA", "38QBA", "38QRA"],
        // OEM MY24 RED Full Product Update: 33 AA | 37 BA | 38 KA — L9 380 / XCM. MY19–23 live on Allegro Red 340 / 360.
        "2024": ["33AA", "37BA", "38KA"],
        // OEM MY25–27 Allegro RED: 33 AA | 37 BA | 38 KA.
        "2025": ["33AA", "37BA", "38KA"],
        "2026": ["33AA", "37BA", "38KA"],
        "2027": ["33AA", "37BA", "38KA"]
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
      engine: "Cummins L9 380HP",
      horsepower: 380,
      chassis: "Freightliner XCM / XCR raised-rail",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 90,
      grayWater: 70,
      blackWater: 50,
      generator: "Onan 8.0 kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2005,
      description: "Tiffin Allegro RED — diesel Class A pusher (not the gas Allegro Open Road). Legacy through MY18: single Allegro RED (MY13–15 ISB 340 / 660 Allison 2500; MY16 340 or 360 option; MY17–18 ISB 360 / 800 on Freightliner XC). MY19–23: use Allegro Red 340 / 360. OEM MY24–27: 33 AA / 37 BA / 38 KA on Freightliner XCM/XCR, Cummins L9 380 / 1,150, Onan 8 kW. B6.7 360 is no longer available on MY24+.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Cummins ISB 6.7L 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Freightliner XC raised-rail",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "Pre-2010 Allegro RED diesel pusher — not Ford F53 gas. 2010–2012 walk-back locks 340 / 660 · Allison 2500 from OEM brochure."
        },
        {
          from: 2010,
          to: 2012,
          engine: "Cummins ISB 6.7 340HP",
          horsepower: 340,
          torqueLbFt: 660,
          chassis: "Freightliner",
          transmission: "Allison 2500 MH",
          fuelCapacityGal: 100,
          generator: "Onan 6.0 kW Quiet Diesel",
          notes: "OEM 2010_RED / 2011_RED spec / 2012_RED: ISB 6.7 340 / 660 · Freightliner raised-rail · Allison 2500 MH · Onan 6.0 kW (8.0 opt). Single RED line — not 360 / 800, not L9, not Allison 3000."
        },
        {
          from: 2013,
          to: 2013,
          engine: "Cummins ISB 6.7 340HP",
          horsepower: 340,
          torqueLbFt: 660,
          chassis: "Freightliner",
          transmission: "Allison 2500 MH",
          fuelCapacityGal: 100,
          generator: "Onan 6.0 kW Quiet Diesel",
          notes: "OEM 2013_RED: ISB 6.7 340 / 660 · Freightliner · Allison 2500 MH · Onan 6.0 kW (8.0 opt). Single RED line — not 360 / 800, not L9."
        },
        {
          from: 2014,
          to: 2014,
          engine: "Cummins ISB 6.7 340HP",
          horsepower: 340,
          torqueLbFt: 660,
          chassis: "Freightliner",
          transmission: "Allison 2500 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM 2014_RED: ISB 6.7 340 / 660 · Freightliner · Allison 2500 MH · Onan 8.0 kW. Single RED line — not 360 / 800, not L9. Do not stamp 360 onto 2014."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Cummins ISB 6.7 340HP",
          horsepower: 340,
          torqueLbFt: 660,
          chassis: "Freightliner",
          transmission: "Allison 2500 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM 2015_RED: ISB 6.7 340 / 660 · Freightliner · Allison 2500 MH · Onan 8 kW. Single RED line — not 360 / 800, not L9."
        },
        {
          from: 2016,
          to: 2016,
          engine: "Cummins ISB 6.7 340HP / 360HP (chassis option)",
          horsepower: 340,
          torqueLbFt: 660,
          chassis: "Freightliner",
          transmission: "Allison 2500 MH / 3000 MH (by option)",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM 2016_RED: ISB 6.7 340 / 660 · Allison 2500 or ISB 6.7 360 / 800 · Allison 3000. Freightliner. Option-band — do not stamp 360-only."
        },
        {
          from: 2017,
          to: 2018,
          engine: "Cummins ISB / B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XC / XCR raised-rail",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "OEM 2017_RED / 2018_Allegro-RED: ISB 6.7 360 / 800 · Freightliner XC · Allison 3000 MH · Onan 8 kW. Single RED line — not a 340/360 split, not L9."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Freightliner XCM / XCR raised-rail",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          generator: "Onan 8.0 kW Quiet Diesel",
          towingCapacity: 10000,
          freshWater: 90,
          grayWater: 70,
          blackWater: 50,
          notes: "OEM MY24–27 Allegro RED: L9 380 / 1,150 · XCM or XCR · Onan 8 kW. MY24 brochure: B6.7 360 no longer available."
        }
      ],
      torqueLbFt: 800,
      transmission: "Allison 3000 MH",
      fuelCapacityGal: 100
    },
    "Allegro Breeze": {
      type: "Class A Diesel",
      floorplans: ["28BR", "31BR", "32BR", "33BR"],
      floorplansByYear: {
        "2008": ["28BR", "31BR", "32BR"],
        "2009": ["28BR", "31BR", "32BR"],
        // No MY10 Breeze brochure on the current Tiffin resources index — omit key. Line intro in the 2011 brochure is 28 BR.
        // Brochure 2011_Allegro-Breeze / archived OEM spec: 28 BR only — PowerGlide · MaxxForce 7 215 / 560 · Allison 1000 MH. Not 31 BR / 32 BR.
        "2011": ["28BR"],
        // Brochure 2012_Allegro-Breeze: 28 BR | 32 BR — PowerGlide · MaxxForce 7 215 / 560 · Allison 1000 MH. Not 31 BR. Not Cummins.
        "2012": ["28BR", "32BR"],
        // Brochure 2013_Allegro-Breeze / 2014_Allegro-Breeze: 28 BR | 32 BR — Navistar MaxxForce 7 240 / 620 on PowerGlide. Not 31 BR. Not Cummins.
        "2013": ["28BR", "32BR"],
        "2014": ["28BR", "32BR"],
        // Brochure 2015_Allegro-Breeze: 28 BR | 32 BR — Navistar MaxxForce 7 240 / 620 on PowerGlide. Not 31 BR. Not Cummins.
        "2015": ["28BR", "32BR"],
        // Brochure 2016_Allegro-Breeze: 32 BR only — Cummins ISV5.0 V8 275 / 560 on PowerGlide. Not 28 BR / 31 BR.
        "2016": ["32BR"],
        // Brochure 2017_Allegro-Breeze: 31 BR | 32 BR — Cummins ISV5.0 V8 275 / 560 on PowerGlide. Not 28 BR.
        "2017": ["31BR", "32BR"],
        // No MY18 Breeze brochure on the current Tiffin resources index (or craft archive) — omit key.
        // Brochure 2019_Allegro-Breeze: 31 BR | 33 BR — Cummins ISB / B6.7 340 / 700 on Freightliner XC
        "2019": ["31BR", "33BR"],
        // Brochure 2020_Allegro-Breeze: 31 BR | 33 BR — B6.7 340 / 700 on Freightliner XC
        "2020": ["31BR", "33BR"],
        // OEM MY21 / MY22 Breeze: 31 BR | 33 BR — B6.7 340 / 700 · PowerGlide · Allison 2500 · Onan 6 kW
        "2021": ["31BR", "33BR"],
        "2022": ["31BR", "33BR"],
        // OEM MY23 / MY24 Breeze: 33 BR only (31 BR no longer available in MY23 brochure). 2025 still empty (no MY25 brochure walk in this slice).
        "2023": ["33BR"],
        "2024": ["33BR"],
        // OEM MY26 Allegro Breeze specs: 33 BR only. Not on 2027 year page.
        "2026": ["33BR"]
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
      yearEnd: 2026,
      description: "Tiffin Allegro Breeze — compact diesel Class A. OEM MY21–22: 31 BR / 33 BR (PowerGlide, B6.7 340 / 700, Allison 2500 MH, Onan 6 kW). OEM MY23–24 / MY26: 33 BR. Not listed on the 2027 year page — yearEnd 2026. 2025 floorplans still unsourced.",
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
          from: 2011,
          to: 2012,
          engine: "Navistar MaxxForce 7 215HP",
          horsepower: 215,
          torqueLbFt: 560,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 1000 MH 6-speed",
          generator: "Onan 6.0kW Quiet Diesel",
          notes: "OEM 2011_Allegro-Breeze spec / 2012_Allegro-Breeze: PowerGlide · MaxxForce 7 215 / 560 · Allison 1000 MH · Onan 6.0 kW. Not 240 / 620 (MY13+) and not Cummins. No MY10 brochure."
        },
        {
          from: 2013,
          to: 2014,
          engine: "Navistar MaxxForce 7 240HP",
          horsepower: 240,
          torqueLbFt: 620,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 6-speed automatic",
          generator: "Onan 6.0kW Quiet Diesel",
          notes: "OEM 2013_Allegro-Breeze / 2014_Allegro-Breeze: PowerGlide · MaxxForce 7 240 / 620 · Allison 6-speed · Onan 6.0 kW. Not Cummins ISV 275 and not B6.7 340."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Navistar MaxxForce 7 240HP",
          horsepower: 240,
          torqueLbFt: 620,
          chassis: "Tiffin PowerGlide",
          notes: "OEM 2015_Allegro-Breeze: PowerGlide · MaxxForce 7 240 / 620 · Onan 6.0 kW. Not Cummins ISV 275 (MY16+) and not B6.7 340."
        },
        {
          from: 2016,
          to: 2016,
          engine: "Cummins ISV5.0 V8 275HP",
          horsepower: 275,
          torqueLbFt: 560,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 6-speed automatic",
          notes: "OEM 2016_Allegro-Breeze: PowerGlide · ISV5.0 275 / 560 · Allison 6-speed · 32 BR only. Not MaxxForce 240 and not B6.7 340."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISV5.0 V8 275HP",
          horsepower: 275,
          torqueLbFt: 560,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 6-speed automatic",
          notes: "OEM 2017_Allegro-Breeze: PowerGlide · ISV5.0 275 / 560 · Allison 6-speed. Not B6.7 340 (that arrives later). No MY18 brochure."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins ISB / B6.7 340HP",
          horsepower: 340,
          chassis: "Freightliner XC",
          notes: "OEM 2019–2020_Allegro-Breeze: B6.7 340 / 700. Do not copy onto 2017 ISV 275."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 2500 MH",
          generator: "Onan 6.0kW Quiet Diesel",
          notes: "OEM MY21 / MY22 Breeze 31 BR / 33 BR: B6.7 340 / 700 · PowerGlide · Allison 2500 MH · Onan 6 kW"
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 2500 MH",
          generator: "Onan 6.0kW Quiet Diesel",
          notes: "OEM MY23 / MY24 Breeze 33 BR: B6.7 340 / 700 · PowerGlide · Allison 2500 MH · Onan 6 kW"
        },
        {
          from: 2026,
          to: 2026,
          engine: "Cummins B6.7 340HP",
          horsepower: 340,
          torqueLbFt: 700,
          chassis: "Tiffin PowerGlide",
          transmission: "Allison 2500 MH",
          notes: "OEM MY26 Breeze 33 BR: B6.7 340 / 700 · PowerGlide · Allison 2500 MH"
        }
      ]
    },
    "Open Road": {
      type: "Class A Gas",
      floorplans: ["32SA", "34PA", "36LA", "34PR", "29NA", "32FA", "36UA", "31MA", "31SA", "35QBA", "32CA", "34TGA", "30GA", "30DA", "32BA"],
      floorplansByYear: {
        // Brochure 2010_Allegro (Open Road): 30 DA | 32 BA | 34 TGA | 35 QBA — Ford 6.8 V10 362 / 457 · Workhorse 8.1 340 / 455 · FRED Cummins 300 / 620 (not 30 DA). Not 32 SA / 34 PA / 36 LA.
        "2010": ["30DA", "32BA", "34TGA", "35QBA"],
        // Archived OEM 2011_Allegro spec: 30 GA | 32 BA | 34 TGA | 35 QBA — Ford 6.8 V10 362 / 457 · Workhorse 8.1 340 / 455. 30 DA renamed 30 GA.
        "2011": ["30GA", "32BA", "34TGA", "35QBA"],
        // Brochure 2012_Allegro (Open Road): 30 GA | 32 CA | 34 TGA | 35 QBA — Ford 6.8 V10 362 / 457 only. 32 BA dropped; 32 CA new. No Workhorse on this brochure.
        "2012": ["30GA", "32CA", "34TGA", "35QBA"],
        // Brochure 2013_Allegro / 2014_Allegro (Open Road): 30 GA | 31 SA | 32 CA | 34 TGA | 35 QBA | 36 LA — Ford 6.8 V10 362 / 457. Not 32 SA / 34 PA.
        "2013": ["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"],
        "2014": ["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"],
        // Brochure 2015_Allegro (Open Road): 31 SA | 32 CA | 32 SA | 34 TGA | 35 QBA | 36 LA — Ford 6.8 V10 362 / 457. Not 34 PA / 34 PR.
        "2015": ["31SA", "32CA", "32SA", "34TGA", "35QBA", "36LA"],
        // Brochure 2016_Allegro (Open Road): 31 SA | 32 SA | 34 PA | 34 TGA | 35 QBA | 36 LA — Ford 6.8 V10 320 / 460. Not 34 PR / 36 UA.
        "2016": ["31SA", "32SA", "34PA", "34TGA", "35QBA", "36LA"],
        // Brochure 2017_Allegro (Open Road): 31 MA | 31 SA | 32 SA | 34 PA | 35 QBA | 36 LA | 36 UA — Ford 6.8 V10 320 / 460. Not 34 PR.
        "2017": ["31MA", "31SA", "32SA", "34PA", "35QBA", "36LA", "36UA"],
        // Brochure 2018_Allegro (Open Road): 31 MA | 32 SA | 34 PA | 36 LA | 36 UA — Ford 6.8 V10 320 / 460. 31 SA / 35 QBA dropped.
        "2018": ["31MA", "32SA", "34PA", "36LA", "36UA"],
        // Brochure 2019_Open-Road: 32 SA | 34 PA | 36 LA (floor plan diagrams shown) — Ford 7.3 Godzilla gas era begins ~2020
        "2019": ["32SA", "34PA", "36LA"],
        // Brochure 2020_Open-Road: 32 SA | 34 PA | 36 LA | 36 UA — Ford F-53 7.3 V8 350 / 468
        "2020": ["32SA", "34PA", "36LA", "36UA"],
        // OEM MY21 Open Road: 32 SA | 34 PA | 36 LA | 36 UA — Ford 7.3 350 / 468. 32 FA / 34 PR not in brochure.
        "2021": ["32SA", "34PA", "36LA", "36UA"],
        // OEM MY22 Open Road: 32 FA | 32 SA | 34 PA | 36 LA | 36 UA — Ford 7.3 350 / 468
        "2022": ["32FA", "32SA", "34PA", "36LA", "36UA"],
        // OEM MY23 / MY24 Open Road: 32 FA | 32 SA | 34 PA | 36 LA | 36 UA — Ford 7.3 350 / 468
        "2023": ["32FA", "32SA", "34PA", "36LA", "36UA"],
        "2024": ["32FA", "32SA", "34PA", "36LA", "36UA"],
        // OEM MY25 Open Road specs: 32 FA | 32 SA | 34 PA | 36 LA | 36 UA — 29 NA not listed
        "2025": ["32FA", "32SA", "34PA", "36LA", "36UA"],
        // OEM MY26 Open Road: 29 NA | 32 SA | 34 PA | 36 LA
        "2026": ["29NA", "32SA", "34PA", "36LA"],
        // OEM MY27 Open Road: 29 NA | 34 PA only
        "2027": ["29NA", "34PA"]
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
      engine: "Ford 7.3L V8 350HP",
      horsepower: 350,
      torqueLbFt: 468,
      chassis: "Ford F-53 Super Duty",
      transmission: "TorqShift 6-speed",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 4000,
      freshWater: 70,
      grayWater: 66,
      blackWater: 50,
      fuelCapacityGal: 80,
      generator: "Onan 5.5kW Quiet Gas",
      awningLength: 18,
      ceilingHeight: 84,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2010,
      description: "Tiffin Open Road Allegro — gas Class A on Ford F-53 (not diesel Bus / RED / Bay). OEM MY23–27: Ford 7.3 350 HP / 468 lb-ft (do not stamp later 335 onto these years). MY23–25: 32 FA / 32 SA / 34 PA / 36 LA / 36 UA. MY26: 29 NA / 32 SA / 34 PA / 36 LA. MY27: 29 NA / 34 PA.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2010,
          engine: "Ford 6.8L V10 362HP / Workhorse 8.1 340HP / FRED Cummins 300HP (by chassis)",
          horsepower: 0,
          chassis: "Ford / Workhorse / Freightliner FRED (by option)",
          transmission: "TorqShift 5-speed (Ford) / Allison 1000 MH (Workhorse / FRED)",
          generator: "Onan 5.5kW Quiet Gas (7.0 gas opt; 6.0 diesel on FRED)",
          notes: "OEM 2010_Allegro: Ford 6.8 V10 362 / 457 std gas · Workhorse 8.1 340 / 455 · FRED Cummins 300 / 620 (not on 30 DA). Option-band — do not stamp 362-only. Gas line — FRED is a diesel chassis option, not Bus / RED."
        },
        {
          from: 2011,
          to: 2011,
          engine: "Ford 6.8L V10 362HP / Workhorse 8.1 340HP (by chassis)",
          horsepower: 0,
          chassis: "Ford / Workhorse (by option)",
          transmission: "TorqShift 5-speed (Ford) / Allison 1000 MH (Workhorse)",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW listed)",
          notes: "OEM 2011_Allegro spec: Ford 6.8 V10 362 / 457 or Workhorse 8.1 340 / 455. Option-band — do not stamp 362-only. No FRED on this spec sheet. Gas — not diesel Bus / RED."
        },
        {
          from: 2012,
          to: 2012,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford F-53",
          transmission: "TorqShift 5-speed",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW listed)",
          notes: "OEM 2012_Allegro: Ford 6.8 V10 362 / 457 · TorqShift 5-speed. No Workhorse on this brochure. Gas — not diesel Bus / RED. Not the later 7.3 Godzilla."
        },
        {
          from: 2013,
          to: 2014,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford 22K (24K on 34'+)",
          transmission: "TorqShift 5-speed",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW listed)",
          notes: "OEM 2013_Allegro / 2014_Allegro (Open Road): Ford 6.8 V10 362 / 457 · TorqShift 5-speed. 22K chassis; 24K on 34'+. Gas — not diesel Bus / RED. Not the later 7.3 Godzilla."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford 22K (24K on 34'+)",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW listed)",
          notes: "OEM 2015_Allegro (Open Road): Ford 6.8 V10 362 / 457. 22K chassis; 24K on 34'+. Gas — not diesel Bus / RED. Not the later 7.3 Godzilla."
        },
        {
          from: 2016,
          to: 2016,
          engine: "Ford 6.8L V10 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford",
          transmission: "TorqShift 5-speed",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW on 36 LA)",
          notes: "OEM 2016_Allegro (Open Road): Ford 6.8 V10 320 / 460 · TorqShift 5-speed. 5.5 kW Onan except 36 LA (7.0 kW). Gas — not diesel."
        },
        {
          from: 2017,
          to: 2018,
          engine: "Ford 6.8L V10 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F-53",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW on 36')",
          notes: "OEM 2017 / 2018 Allegro (Open Road): F-53 6.8 V10 320 / 460. 5.5 kW Onan std except 36 LA / 36 UA (7.0 kW). Gas — not diesel Bus / RED. Not the later 7.3 Godzilla."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "OEM 2019_Open-Road walk-back already locked plans. 7.3 Godzilla arrives ~2020."
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 7.3L V8 Godzilla",
          horsepower: 350,
          chassis: "Ford F53",
          notes: "7.3 gas era — confirm exact HP on door sticker for 2020. MY21–22 brochure locks 350 / 468."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F-53",
          transmission: "TorqShift 6-speed",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW std on 36')",
          notes: "OEM MY21 / MY22 Open Road: Ford 7.3 350 / 468 · TorqShift 6-speed. 5.5 kW Onan Quiet Gas std on 32–34'; 7.0 kW std on 36 LA / 36 UA. Gas — not diesel Bus / RED / Bay."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F-53 Super Duty",
          transmission: "TorqShift 6-speed",
          generator: "Onan 5.5kW Quiet Gas (7.0 kW std on 36')",
          notes: "OEM MY23 / MY24 Open Road: F-53 7.3 350 / 468. 5.5 kW Onan Quiet Gas std on 32–34'; 7.0 kW std on 36 LA / 36 UA."
        },
        {
          from: 2025,
          to: 2027,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F-53 Super Duty",
          transmission: "TorqShift 6-speed",
          generator: "Onan 5.5kW Quiet Gas",
          fuelCapacityGal: 80,
          notes: "OEM MY25–27 Open Road specs: F-53 7.3 350 / 468. Do not stamp 335 onto these years."
        }
      ]
    },
    Wayfarer: {
      type: "Class C",
      floorplans: ["24BW", "24FW", "24QW", "25QW", "24TW", "25RW", "25JW", "25TW", "25LW", "25SW", "25RLW", "25PW", "24QB", "25XLW", "25XRW", "25XPW"],
      floorplansByYear: {
        // No MY15 / MY16 Wayfarer brochure on the current Tiffin resources index. Family RVing / OEM 2017 literature introduce the line as 24 QW. Omit 2016 — do not invent 24 BW / 25 RW.
        // Archived OEM 2017 Wayfarer literature (RVUSA library of Tiffin brochure): 24 QW. Current Tiffin index has no MY17 PDF — do not copy 24 BW / 25 RW / 25 JW.
        "2017": ["24QW"],
        // Brochure 2018_Wayfarer: 24 BW | 24 QW | 24 TW — Mercedes 3.0 6-cyl 188 / 325, 5-speed Tip Shift. Not 25 RW / 25 JW / 25 TW.
        "2018": ["24BW", "24QW", "24TW"],
        // Brochure 2019_Wayfarer: 24 BW | 24 FW | 25 QW | 24 TW | 25 RW — Mercedes 3.0 V6 188 HP turbodiesel on Sprinter
        "2019": ["24BW", "24FW", "25QW", "24TW", "25RW"],
        // Brochure 2020_Wayfarer: 24 FW | 24 TW | 25 QW | 25 RW — Mercedes 3.0 V6 188 HP turbodiesel on Sprinter
        "2020": ["24FW", "24TW", "25QW", "25RW"],
        // OEM MY21 / MY22 Wayfarer: 25 TW | 25 RW | 25 LW | 25 SW — 3.0 V6 188 / 325. 25 JW / 25 PW not in brochure.
        "2021": ["25TW", "25RW", "25LW", "25SW"],
        "2022": ["25TW", "25RW", "25LW", "25SW"],
        // OEM MY23 Wayfarer: 25 JW | 25 TW | 25 LW | 25 RW (25 SW no longer available)
        "2023": ["25JW", "25TW", "25LW", "25RW"],
        // OEM MY24 Wayfarer: 25 JW | 25 LW | 25 RLW | 25 RW
        "2024": ["25JW", "25LW", "25RLW", "25RW"],
        // OEM MY25 Wayfarer specs: 25 XLW | 25 XRW
        "2025": ["25XLW", "25XRW"],
        // OEM MY26 Wayfarer: 25 XRW | 25 XLW | 25 XPW | 25 RW
        "2026": ["25XRW", "25XLW", "25XPW", "25RW"],
        // OEM MY27 Wayfarer: 25 RW | 25 PW | 25 XLW
        "2027": ["25RW", "25PW", "25XLW"]
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
      engine: "Mercedes-Benz 2.0L I4 208HP turbodiesel",
      horsepower: 208,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz 4500XD",
      transmission: "Mercedes-Benz 9G-Tronic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 32,
      grayWater: 32,
      blackWater: 28,
      generator: "RVMP Flex Power 4 kW LP",
      awningLength: 18,
      ceilingHeight: 86,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2017,
      description: "Tiffin Wayfarer — Sprinter diesel Class C. OEM intro is MY17 (24 QW). OEM MY27: 25 RW / 25 PW / 25 XLW on Mercedes-Benz 4500XD, 2.0 I4 208 HP / 332, RVMP Flex Power LP gen. MY25: 25 XLW / 25 XRW (3500XD). MY26: 25 XRW / 25 XLW / 25 XPW / 25 RW.",
      powertrainByYear: [
        {
          from: 2017,
          to: 2017,
          engine: "Mercedes-Benz 3.0L 6-Cylinder turbodiesel (5-speed Tip Shift)",
          chassis: "Mercedes-Benz Sprinter",
          notes: "Archived OEM 2017 Wayfarer brochure: Sprinter 3.0 6-cyl turbo diesel, 5-speed Tip Shift. Brochure does not print HP — do not invent 188 or stamp the later 2.0L 208."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Mercedes-Benz 3.0L 6-Cylinder 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter",
          transmission: "5-speed Automatic Tip Shift",
          generator: "Onan 3.2kW Quiet Diesel",
          notes: "OEM 2018_Wayfarer: Sprinter · 3.0 6-cyl 188 / 325 · 5-speed Tip Shift · Onan 3.2 kW. Not 7G-Tronic / not 2.0L 208."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter",
          notes: "OEM 2019–2020_Wayfarer walk-back already locked plans. 3.0 V6 188 era."
        },
        {
          from: 2021,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter",
          transmission: "Mercedes-Benz 7G-Tronic",
          generator: "3.2 kW diesel generator",
          notes: "OEM MY21 Wayfarer: Sprinter · 3.0 V6 188 / 325 · 7G-Tronic · 3.2 kW diesel generator. Not the later 2.0L 208."
        },
        {
          from: 2022,
          to: 2022,
          engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500XD Dual Rear Wheel",
          transmission: "Mercedes-Benz 7G-Tronic",
          generator: "3.2 kW diesel generator",
          notes: "OEM MY22 Wayfarer: 3500XD · 3.0 V6 188 / 325 · 7G-Tronic · 3.2 kW diesel generator. Not the later 2.0L 208."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500XD Dual Rear Wheel",
          transmission: "Mercedes-Benz 7G-Tronic",
          generator: "Onan 3.2kW Quiet Diesel",
          notes: "OEM MY23 / MY24 Wayfarer: 3500XD · 3.0 V6 188 / 325 · 7G-Tronic · Onan 3.2 kW. Not the later 2.0L 208."
        },
        {
          from: 2025,
          to: 2026,
          engine: "Mercedes-Benz 2.0L I4 208HP turbodiesel",
          horsepower: 208,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 3500XD / 4500XD",
          transmission: "Mercedes-Benz 9G-Tronic",
          generator: "RVMP Flex Power 4 kW LP",
          notes: "OEM MY25: 3500XD 208 / 332. MY26 page: 3500XD or 4500XD."
        },
        {
          from: 2027,
          to: 2027,
          engine: "Mercedes-Benz 2.0L I4 208HP turbodiesel",
          horsepower: 208,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 4500XD",
          transmission: "Mercedes-Benz 9G-Tronic",
          generator: "RVMP Flex Power 4 kW LP (dual fuel)",
          notes: "OEM MY27 Wayfarer: 4500XD · 208 / 332 · RVMP Flex Power LP"
        }
      ]
    },
    "Wayfarer 25": {
      type: "Class C",
      floorplans: ["25JW", "25RW", "25TW", "25LW", "25SW", "25RLW", "25PW", "25MB"],
      floorplansByYear: {
        // No 25-series plans on the OEM 2018_Wayfarer brochure (24 BW / 24 QW / 24 TW only) — omit MY18 key.
        "2019": ["25JW", "25RW", "25TW", "25PW"],
        "2020": ["25JW", "25RW", "25TW", "25PW"],
        // Alias tracks OEM Wayfarer MY21–22: 25 TW | 25 RW | 25 LW | 25 SW
        "2021": ["25TW", "25RW", "25LW", "25SW"],
        "2022": ["25TW", "25RW", "25LW", "25SW"],
        "2023": ["25JW", "25TW", "25LW", "25RW"],
        "2024": ["25JW", "25LW", "25RLW", "25RW"]
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
      yearStart: 2019,
      yearEnd: 2024,
      description: "Legacy Wayfarer 25 series alias — yearEnd 2024. Use Wayfarer + 25 RW / 25 PW / 25 XLW for MY25+. OEM 2018 Wayfarer brochure has no 25-series plans.",
      powertrainByYear: [
        {
          from: 2019,
          to: 2024,
          engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter 3500XD",
          notes: "Wayfarer 25 alias through MY24 — 3.0 V6 188 / 325. Prefer Wayfarer key for MY25+."
        }
      ]
    },
    Cahaba: {
      type: "Class B",
      floorplans: ["19 SC"],
      floorplansByYear: {
        // RVGuide 2023 Cahaba 19 SC. No 2024 Cahaba on RVGuide 2024 / RVUSA / current OEM brochure index.
        "2023": ["19 SC"]
      },
      lengthRange: [
        19,
        20
      ],
      weightRange: [
        9000,
        9050
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        169000,
        229000
      ],
      engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
      horsepower: 188,
      torqueLbFt: 325,
      chassis: "Mercedes-Benz Sprinter 2500",
      transmission: "Mercedes-Benz 7-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 13.5,
      blackWater: 13.5,
      fuelCapacityGal: 24.5,
      generator: "confirm brochure — Sprinter Class B (no coach diesel genset sourced)",
      awningLength: 18,
      ceilingHeight: 75,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2023,
      yearEnd: 2023,
      description: "Tiffin Cahaba — Sprinter Class B adventure van. RVGuide 2023: 19 SC only, Mercedes 3.0 V6 188 / 325, Sprinter 2500. 21 SC was not sourced. No 2024 Cahaba on RVGuide 2024 (GH1 that year) or the current OEM brochure index — yearEnd 2023. Do not invent 2024–2026 plans.",
      powertrainByYear: [
        {
          from: 2023,
          to: 2023,
          engine: "Mercedes-Benz 3.0L V6 188HP turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter 2500",
          transmission: "Mercedes-Benz 7-speed automatic",
          fuelCapacityGal: 24.5,
          towingCapacity: 5000,
          freshWater: 28,
          grayWater: 13.5,
          blackWater: 13.5,
          notes: "RVGuide 2023 Cahaba 19 SC: 3.0 V6 188 HP · Sprinter 2500 · 7-speed. 2023 OEM brochure not on current Tiffin resources page. Do not stamp 2.0L 208."
        }
      ]
    },
    "Allegro Bay": {
      type: "Super C",
      floorplans: ["38AB", "38BB", "38CB", "34DB", "38EB"],
      floorplansByYear: {
        // OEM MY22 Allegro Bay Super C: 38 AB | 38 BB — S2RV, B6.7 360 / 800. 38 CB is MY23+ (do not copy forward/back).
        "2022": ["38AB", "38BB"],
        // OEM MY23 / MY24 Allegro Bay Super C: 38 AB | 38 BB | 38 CB — S2RV, B6.7 360 / 800
        "2023": ["38AB", "38BB", "38CB"],
        "2024": ["38AB", "38BB", "38CB"],
        // OEM MY25-Allegro-Bay specs: 38 AB | 38 BB | 38 CB
        "2025": ["38AB", "38BB", "38CB"],
        // OEM MY26 Allegro Bay: 38 AB | 38 BB | 34 DB (34 DB new — do not copy onto 2025)
        "2026": ["38AB", "38BB", "34DB"],
        // OEM MY27 Allegro Bay: 34 DB | 38 AB | 38 BB | 38 EB (38 EB new)
        "2027": ["34DB", "38AB", "38BB", "38EB"]
      },
      lengthRange: [35, 40],
      weightRange: [28000, 36000],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [289000, 429000],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner S2RV",
      transmission: "Allison 3000 MH / 2909 MH (by year)",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 150,
      grayWater: 70,
      blackWater: 45,
      fuelCapacityGal: 100,
      generator: "Onan 8kW Quiet Diesel",
      awningLength: 18,
      ceilingHeight: 82,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2022,
      description: "Tiffin Allegro Bay Super C diesel on Freightliner S2RV — not the legacy Allegro Bay Class A gas. OEM MY22: 38 AB / 38 BB, B6.7 360 / 800, Allison 3000 MH, Onan 8 kW. OEM MY23–25: 38 AB / 38 BB / 38 CB. MY26 adds 34 DB. MY27 adds 38 EB; transmission listed Allison 2909 MH 9-speed. yearStart 2022.",
      powertrainByYear: [
        {
          from: 2022,
          to: 2026,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          generator: "Onan 8kW Quiet Diesel",
          notes: "OEM MY22–26 Allegro Bay Super C: B6.7 360 / 800 · S2RV · Allison 3000 MH · Onan QD 8 kW"
        },
        {
          from: 2027,
          to: 2027,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 2909 MH 9-speed",
          generator: "Onan 8kW Quiet Diesel",
          notes: "OEM MY27 Allegro Bay: B6.7 360 / 800 · S2RV · Allison 2909 MH 9-speed"
        }
      ]
    },
    "Open Trail": {
      type: "Class C",
      floorplans: ["25AO", "25CO"],
      floorplansByYear: {
        // OEM 2027 Open Trail page: 25 AO | 25 CO. 2026 year page lists the line; floorplans not copied backward.
        "2027": ["25AO", "25CO"]
      },
      lengthRange: [25, 26],
      weightRange: [9000, 12000],
      slideouts: 0,
      sleeps: 3,
      msrpRange: [189000, 259000],
      engine: "Mercedes-Benz 2.0L I4 208HP turbodiesel",
      horsepower: 208,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz 3500XD AWD",
      transmission: "Mercedes-Benz 9G-Tronic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 48,
      grayWater: 32,
      blackWater: 28,
      generator: "RVMP Flex Power 4 kW LP",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 1972,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Tiffin Open Trail — off-road Sprinter Class C. OEM MY27 page: 25 AO / 25 CO on Mercedes-Benz 3500XD AWD, 2.0 I4 208 HP / 332, RVMP Flex Power 4 kW LP. 2026 brochure exists; plans not copied onto 2026 without a floorplan list.",
      powertrainByYear: [
        {
          from: 2027,
          to: 2027,
          engine: "Mercedes-Benz 2.0L I4 208HP turbodiesel",
          horsepower: 208,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 3500XD AWD",
          transmission: "Mercedes-Benz 9G-Tronic",
          generator: "RVMP Flex Power 4 kW LP",
          notes: "OEM MY27 Open Trail: 3500XD AWD · 208 / 332 · RVMP Flex Power 4 kW"
        }
      ]
    },
    Allegro: {
      type: "Class A Gas",
      floorplans: ["32SA", "34PA", "36LA", "34PR", "32FA", "36UA", "31MA", "31SA", "35QBA", "32CA", "34TGA", "30GA", "30DA", "32BA"],
      floorplansByYear: {
        "2005": ["32SA", "34PA", "36LA"],
        "2006": ["32SA", "34PA", "36LA"],
        "2007": ["32SA", "34PA", "36LA"],
        "2008": ["32SA", "34PA", "36LA"],
        "2009": ["32SA", "34PA", "36LA"],
        // Alias tracks OEM 2010 Allegro (Open Road) brochure
        "2010": ["30DA", "32BA", "34TGA", "35QBA"],
        // Alias tracks OEM 2011 Allegro spec sheet
        "2011": ["30GA", "32BA", "34TGA", "35QBA"],
        // Alias tracks OEM 2012 Allegro (Open Road) brochure
        "2012": ["30GA", "32CA", "34TGA", "35QBA"],
        // Alias tracks OEM 2013 / 2014 Allegro (Open Road) brochure
        "2013": ["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"],
        "2014": ["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"],
        // Alias tracks OEM 2015 Allegro (Open Road) brochure
        "2015": ["31SA", "32CA", "32SA", "34TGA", "35QBA", "36LA"],
        // Alias tracks OEM 2016 Allegro (Open Road) brochure
        "2016": ["31SA", "32SA", "34PA", "34TGA", "35QBA", "36LA"],
        // Alias tracks OEM 2017 Allegro (Open Road) brochure
        "2017": ["31MA", "31SA", "32SA", "34PA", "35QBA", "36LA", "36UA"],
        // Alias tracks OEM 2018 Allegro (Open Road) brochure
        "2018": ["31MA", "32SA", "34PA", "36LA", "36UA"],
        "2019": ["32SA", "34PA", "36LA"],
        "2020": ["32SA", "34PA", "36LA"],
        // Alias tracks OEM Open Road MY21: 32 SA | 34 PA | 36 LA | 36 UA
        "2021": ["32SA", "34PA", "36LA", "36UA"],
        // Alias tracks OEM Open Road MY22: 32 FA | 32 SA | 34 PA | 36 LA | 36 UA
        "2022": ["32FA", "32SA", "34PA", "36LA", "36UA"]
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
      description: "Tiffin Allegro gas Class A family name — yearEnd 2022. Current gas line is Open Road Allegro (Ford F-53 7.3). Do not merge this key with Allegro Bus / Allegro RED / Allegro Bay.",
      powertrainByYear: [
        {
          from: 2005,
          to: 2009,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Pre-2010 Allegro gas — 2010–2012 walk-back locks from OEM brochure. Do not stamp onto 2010+."
        },
        {
          from: 2010,
          to: 2010,
          engine: "Ford 6.8L V10 362HP / Workhorse 8.1 340HP / FRED Cummins 300HP (by chassis)",
          horsepower: 0,
          chassis: "Ford / Workhorse / Freightliner FRED (by option)",
          transmission: "TorqShift 5-speed (Ford) / Allison 1000 MH (Workhorse / FRED)",
          notes: "OEM 2010_Allegro: Ford 362 / Workhorse 340 / FRED Cummins 300 (not 30 DA). Option-band. Alias of Open Road."
        },
        {
          from: 2011,
          to: 2011,
          engine: "Ford 6.8L V10 362HP / Workhorse 8.1 340HP (by chassis)",
          horsepower: 0,
          chassis: "Ford / Workhorse (by option)",
          transmission: "TorqShift 5-speed (Ford) / Allison 1000 MH (Workhorse)",
          notes: "OEM 2011_Allegro spec: Ford 362 or Workhorse 340. Option-band. Alias of Open Road."
        },
        {
          from: 2012,
          to: 2012,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford F-53",
          transmission: "TorqShift 5-speed",
          notes: "OEM 2012_Allegro: Ford 6.8 V10 362 / 457. Alias of Open Road. Gas — not diesel."
        },
        {
          from: 2013,
          to: 2014,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford 22K (24K on 34'+)",
          transmission: "TorqShift 5-speed",
          notes: "OEM 2013 / 2014 Allegro brochure: Ford 6.8 V10 362 / 457 · TorqShift 5-speed. Alias of Open Road."
        },
        {
          from: 2015,
          to: 2015,
          engine: "Ford 6.8L V10 362HP",
          horsepower: 362,
          torqueLbFt: 457,
          chassis: "Ford 22K (24K on 34'+)",
          notes: "OEM 2015 Allegro brochure: Ford 6.8 V10 362 / 457 gas. Alias of Open Road."
        },
        {
          from: 2016,
          to: 2016,
          engine: "Ford 6.8L V10 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford",
          transmission: "TorqShift 5-speed",
          notes: "OEM 2016 Allegro brochure: Ford 6.8 V10 320 / 460 · TorqShift 5-speed. Alias of Open Road."
        },
        {
          from: 2017,
          to: 2018,
          engine: "Ford 6.8L V10 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F-53",
          notes: "OEM 2017 / 2018 Allegro brochure: F-53 6.8 V10 320 / 460 gas. Alias of Open Road."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53"
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 7.3L V8",
          horsepower: 350,
          chassis: "Ford F53"
        },
        {
          from: 2021,
          to: 2022,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F-53",
          transmission: "TorqShift 6-speed",
          notes: "OEM MY21 / MY22 Open Road Allegro gas: Ford 7.3 350 / 468. yearEnd 2022 — current gas line is Open Road."
        }
      ]
    }
  },
  Thor: {
    Tuscany: {
      type: "Class A Diesel",
      floorplans: ["40IX", "42RQ", "45AT", "45NX", "40B", "40MX", "45BX", "45CA"],
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
        "2026": ["40IX", "42RQ", "40B", "40MX", "45BX", "45CA"]
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
      floorplans: ["33.2", "33.3", "33.5", "33.6", "36.1", "36.3", "37.4", "39.4", "44.1"],
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
        "2026": ["33.5", "33.6", "36.3", "37.4", "39.4", "44.1"]
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
      floorplans: ["3401", "3601", "3901", "4000", "3801", "4200", "4500"],
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
        "2026": ["3901", "4000", "3801", "4200", "4500"]
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
      floorplans: ["27.1", "29.2", "30.1", "32.1", "29.3", "30.2", "32.3", "33.1", "27.2", "29.4", "30.4", "31.5"],
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
        "2026": ["27.1", "29.3", "30.2", "32.3", "27.2", "29.4", "30.4", "31.5"]
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
    Sereno: {
      type: "Class A Diesel",
      floorplans: ["31G", "34G", "36G", "38G", "40G"],
      lengthRange: [31, 40],
      weightRange: [26000, 32000],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [119900, 189000],
      engine: "Navistar MaxxForce 7 ~300HP (front-engine diesel)",
      horsepower: 300,
      chassis: "Thor FED (front-engine diesel)",
      fuelType: "Diesel",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 80,
      grayWater: 42,
      blackWater: 42,
      generator: "Onan 5500W Diesel QD",
      awningLength: 18,
      ceilingHeight: 81,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2016,
      description:
        "Thor Sereno — front-engine diesel Class A (2010–2016). Navistar MaxxForce 7 ~300 HP on Thor FED chassis. Lower entry / car-like drive vs rear pusher; not Palazzo/Tuscany.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2016,
          engine: "Navistar MaxxForce 7 ~300HP",
          horsepower: 300,
          chassis: "Thor FED (front-engine diesel)",
          notes: "Front-engine diesel — not Cummins pusher",
        },
      ],
    },
    Hurricane: {
      type: "Class A Gas",
      floorplans: ["29M", "31S", "32A", "34F", "35M", "35MX"],
      lengthRange: [29, 36],
      weightRange: [22000, 28000],
      slideouts: 2,
      sleeps: 7,
      msrpRange: [99900, 169000],
      engine: "Ford 7.3L Godzilla / 6.8L V10 (by year)",
      horsepower: 320,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 1,
      rating: 4.2,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 76,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan 5500W Gas MicroQuiet",
      awningLength: 17,
      ceilingHeight: 80,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2020,
      description:
        "Thor Hurricane — gas Class A on Ford F53 (2000–2020). Family dual-slide layouts; V10 then 7.3 Godzilla. Discontinued after 2020 as Thor consolidated around ACE / Windsport / Challenger.",
      powertrainByYear: [
        {
          from: 2000,
          to: 2019,
          engine: "Ford Triton V10 6.8L",
          horsepower: 305,
          chassis: "Ford F53",
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 7.3L Godzilla V8",
          horsepower: 350,
          chassis: "Ford F53",
        },
      ],
    },
    "Four Winds Majestic": {
      type: "Class C",
      floorplans: ["23A", "23MU", "28A", "28MU"],
      lengthRange: [23, 29],
      weightRange: [11000, 15500],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [64900, 99000],
      engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
      horsepower: 305,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.1,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 30,
      blackWater: 30,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 13,
      ceilingHeight: 79,
      founded: 1980,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2014,
      description:
        "Thor Four Winds Majestic — budget Class C on Ford E-450 (through ~2014). Over-cab bunk layouts; later folded into Four Winds / Chateau.",
      powertrainByYear: [
        {
          from: 2000,
          to: 2014,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
        },
      ],
    },
    Mandalay: {
      type: "Class A Diesel",
      floorplans: ["40A", "40B", "40C", "44B", "44E"],
      lengthRange: [40, 45],
      weightRange: [44000, 52000],
      slideouts: 4,
      sleeps: 4,
      msrpRange: [349900, 549000],
      engine: "Cummins ISL 380HP / ISX 500HP (by trim)",
      horsepower: 380,
      chassis: "Spartan K2",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 54,
      blackWater: 50,
      generator: "Onan 10000W Diesel QD",
      awningLength: 22,
      ceilingHeight: 84,
      founded: 2001,
      warrantyYears: 1,
      yearStart: 2001,
      yearEnd: 2008,
      description:
        "Mandalay — Thor-owned luxury diesel pusher from Coburg, Oregon (2001–2008). Spartan K2 + Cummins ISL/ISX. Above Tuscany; brand ended in 2008.",
      powertrainByYear: [
        {
          from: 2001,
          to: 2008,
          engine: "Cummins ISL ~380HP / ISX ~500HP (by trim)",
          horsepower: 380,
          chassis: "Spartan K2",
          notes: "Confirm ISL vs ISX on VIN / engine door tag",
        },
      ],
    },
    Windsport: {
      type: "Class A Gas",
      floorplans: ["27R", "29M", "31S", "34J", "35M", "27BE", "29VX", "31Z", "34P"],
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
        "2026": ["29M", "34J", "35M", "27BE", "29VX", "31Z", "34P"]
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
      floorplans: ["35KT", "37FH", "37TB", "35MQ", "37FP", "37GT", "37KT", "37YT"],
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
        "2026": ["35KT", "37FH", "35MQ", "37FP", "37GT", "37KT", "37YT"]
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
      floorplans: ["SV34", "SV38", "SV40", "BH35", "FB34", "RB34", "XG32"],
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
        "2026": ["SV38", "SV40", "BH35", "FB34", "RB34", "XG32"]
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
      floorplans: ["XG32", "XG36", "XG40", "XG34"],
      floorplansByYear: {
        "2020": ["XG32", "XG36"],
        "2021": ["XG32", "XG36"],
        "2022": ["XG32", "XG36", "XG40"],
        "2023": ["XG32", "XG36", "XG40"],
        "2024": ["XG32", "XG36", "XG40"],
        "2025": ["XG32", "XG36"],
        "2026": ["XG32", "XG36", "XG34"]
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
      floorplans: ["37SS", "37HJ", "38DB", "37HB", "37MB", "37RB", "37RD", "40SKT", "45MBX"],
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
        "2026": ["37SS", "37HJ", "37HB", "37MB", "37RB", "37RD", "40SKT", "45MBX"]
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
      floorplans: ["19Z", "21Z", "22E", "23U", "24F", "25M", "25V", "25Z", "27A", "28A", "28Z", "30D", "31E", "31W", "32A", "22B", "22C", "24H", "29G"],
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
        "2026": ["19Z", "21Z", "22E", "24F", "25V", "25Z", "27A", "28A", "30D", "31E", "31W", "22B", "22C", "24H", "29G"]
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
      floorplans: ["19Z", "21Z", "22E", "23U", "24F", "25M", "25V", "25Z", "27A", "28A", "28Z", "30D", "31E", "31W", "32A", "22B", "22F", "26BC", "28BD", "30G", "32E", "33SF", "34F", "35SF"],
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
        "2026": ["19Z", "21Z", "22E", "24F", "25V", "25Z", "27A", "28A", "30D", "31W", "22B", "22F", "26BC", "28BD", "30G", "32E", "33SF", "34F", "35SF"]
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
      floorplans: ["KW29", "WS31", "LF31", "KM24", "PD31", "RC25", "BC31", "FW29", "KW28", "RD28", "SD27", "SV30", "WS29"],
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
        "2026": ["KW29", "WS31", "PD31", "BC31", "FW29", "KW28", "RD28", "SD27", "SV30", "WS29"]
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
      floorplans: ["24SR", "25G", "25M", "24RW", "24SK", "24SS"],
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
        "2026": ["24SR", "25G", "24RW", "24SK", "24SS"]
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
      floorplans: ["25VT", "28VT", "30VT", "30GT", "33GT"],
      floorplansByYear: {
        "2018": ["25VT", "28VT"],
        "2019": ["25VT", "28VT"],
        "2020": ["25VT", "28VT", "30VT"],
        "2021": ["25VT", "28VT", "30VT"],
        "2022": ["25VT", "28VT", "30VT"],
        "2023": ["25VT", "28VT"],
        "2024": ["25VT", "28VT"],
        "2025": ["25VT", "28VT"],
        "2026": ["25VT", "28VT", "30GT", "33GT"]
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
      floorplans: ["29H", "38MB", "38KB", "29J"],
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
        "2026": ["29H", "38MB", "29J"]
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
      floorplans: ["19P", "24G", "33C", "19BT", "19L", "19MBL"],
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
        "2026": ["19P", "24G", "19BT", "19L", "19MBL"]
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
      floorplans: ["22TF", "23TR", "24KB", "23BP", "23TW"],
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
        "2026": ["23TR", "24KB", "23BP", "23TW"]
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
      floorplans: ["18M", "24F", "28B", "18G"],
      floorplansByYear: {
        "2018": ["18M", "24F"],
        "2019": ["18M", "24F"],
        "2020": ["18M", "24F", "28B"],
        "2021": ["18M", "24F", "28B"],
        "2022": ["18M", "24F", "28B"],
        "2023": ["18M", "24F", "28B"],
        "2024": ["18M", "24F", "28B"],
        "2025": ["18M", "24F", "28B"],
        "2026": ["18M", "24F", "28B", "18G"]
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
      floorplans: ["26B", "29F", "31B", "18M Plus", "21BT Plus"],
      floorplansByYear: {
        "2020": ["26B", "29F"],
        "2021": ["26B", "29F"],
        "2022": ["26B", "29F"],
        "2023": ["26B", "29F", "31B"],
        "2024": ["26B", "29F", "31B"],
        "2025": ["26B", "29F", "31B"],
        "2026": ["26B", "29F", "31B", "18M Plus", "21BT Plus"]
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
      floorplans: ["34T", "36G", "38W", "36H", "38R", "38F"],
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
        "2026": ["34T", "36H", "38W", "38F"]
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
      floorplans: ["40A", "42Q", "42G", "34J", "34ML", "40ML", "45A"],
      floorplansByYear: {
        "2018": ["40A", "42Q"],
        "2019": ["40A", "42Q", "42G"],
        "2020": ["40A", "42Q", "42G"],
        "2021": ["40A", "42Q", "42G"],
        "2022": ["40A", "42Q", "42G"],
        "2023": ["40A", "42Q"],
        "2024": ["40A", "42Q"],
        "2025": ["40A", "42Q"],
        "2026": ["40A", "42Q", "34J", "34ML", "40ML", "45A"]
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
      floorplans: ["25P", "25T", "25Q"],
      floorplansByYear: {
        "2013": ["25P", "25T"],
        "2014": ["25P", "25T"],
        "2015": ["25P", "25T"],
        "2016": ["25P", "25T"],
        "2017": ["25P", "25T"],
        "2018": ["25P", "25T"],
        "2019": ["25P", "25T"],
        "2020": ["25P", "25T"],
        "2021": ["25P", "25T", "25Q"]
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
      engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
      horsepower: 188,
      torqueLbFt: 325,
      chassis: "Mercedes-Benz Sprinter 3500 cowl",
      transmission: "5-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 37,
      grayWater: 36,
      blackWater: 36,
      fuelCapacityGal: 26,
      generator: "Optional",
      awningLength: 14,
      ceilingHeight: 77,
      founded: 1958,
      warrantyYears: 2,
      yearStart: 2013,
      yearEnd: 2021,
      powertrainByYear: [
        {
          from: 2013,
          to: 2018,
          engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter 3500 cowl",
          transmission: "5-speed automatic",
          towingCapacity: 5000,
          fuelCapacityGal: 26,
          gvwrLbs: 11030,
          exteriorWidthIn: 90.5,
          exteriorHeightIn: 132,
          notes: "Via 25P/25T — Sprinter 3500 cowl · OM642 188 hp / 325 lb-ft · 5-spd. Compact Class A, not a Cummins diesel pusher.",
        },
        {
          from: 2019,
          to: 2021,
          engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter 3500 cowl",
          transmission: "7G-Tronic automatic",
          towingCapacity: 5000,
          fuelCapacityGal: 24.5,
          gvwrLbs: 11030,
          exteriorWidthIn: 90.5,
          exteriorHeightIn: 132,
          notes: "Late Via — still Sprinter 3500 OM642 188/325. Never Cummins ISL/ISB.",
        },
      ],
      description: "Winnebago Via — compact Sprinter-cowl Class A diesel (~25–27 ft). OM642 3.0 V6 188 hp, not a Freightliner/Cummins pusher."
    },
    Vista: {
      type: "Class A Gas",
      floorplans: ["26P", "27P", "31B", "35F", "29VE", "33W", "32M", "28M", "30T", "31BE", "34PA"],
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
        "2026": ["27P", "29VE", "31B", "35F", "28M", "30T", "31BE", "34PA"]
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
      floorplans: ["27N", "29VE", "30T", "35F", "31B", "27PE", "31BE", "36BH"],
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
        "2026": ["27N", "29VE", "31B", "35F", "27PE", "31BE", "36BH"]
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
      floorplans: ["26M", "29L", "30R", "31P", "26P", "30QE"],
      floorplansByYear: {
        "2019": ["26M", "29L"],
        "2020": ["26M", "29L", "30R"],
        "2021": ["26M", "29L", "30R", "31P"],
        "2022": ["26M", "29L", "30R", "31P"],
        "2023": ["26M", "29L", "30R", "31P"],
        "2024": ["26M", "29L", "30R", "31P"],
        "2025": ["26M", "29L", "31P"],
        "2026": ["26M", "29L", "31P", "26P", "30QE"]
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
      floorplans: ["29V", "30T", "32H", "35F", "36Z", "44B"],
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
        "2021": ["29V", "30T", "35F", "44B"]
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
      floorplans: ["59G", "59K", "59KL", "59GL", "59P"],
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
        "2026": ["59G", "59K", "59KL", "59GL", "59P"]
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
      floorplans: ["70KL", "70BL", "24KB"],
      floorplansByYear: {
        "2020": ["70KL"],
        "2021": ["70KL", "70BL"],
        "2022": ["70KL", "70BL"],
        "2023": ["70KL", "70BL"],
        "2024": ["70KL", "70BL"],
        "2025": ["70KL", "70BL"],
        "2026": ["70KL", "70BL", "24KB"]
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
      floorplans: ["70A", "70B", "170M", "170X", "70M"],
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
        "2022": ["70A", "70B", "170M", "170X", "70M"]
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
      floorplans: ["24G", "24J", "24V", "24H", "24D", "24P", "24T"],
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
        "2026": ["24D", "24J", "24V", "24T"]
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
      floorplans: ["24P", "24J", "24V", "25P", "25PE"],
      floorplansByYear: {
        "2019": ["24P", "24J"],
        "2020": ["24P", "24J", "24V"],
        "2021": ["24P", "24J", "24V"],
        "2022": ["24P", "24J", "24V"],
        "2023": ["24P", "24J", "25P", "25PE"]
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
      floorplans: ["24P", "24J", "24F", "24G"],
      floorplansByYear: {
        "2018": ["24P", "24J"],
        "2019": ["24P", "24F", "24J"],
        "2020": ["24P", "24F", "24J"],
        "2021": ["24P", "24J"],
        "2022": ["24P", "24J", "24G"]
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
      floorplans: ["22A", "23B", "24H"],
      floorplansByYear: {
        "2021": ["22A", "23B"],
        "2022": ["22A", "23B"],
        "2023": ["22A", "23B"],
        "2024": ["22A", "23B"],
        "2025": ["22A", "23B"],
        "2026": ["22A", "23B", "24H"]
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
      floorplans: ["22M", "25B", "26T", "31H", "31G", "27Q", "30D", "24A", "24M", "26A", "29M", "31C"],
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
        "2026": ["22M", "25B", "26T", "31G", "31H", "24A", "24M", "26A", "29M", "31C"]
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
      floorplans: ["22M", "25B", "26T", "31H", "31K", "31G", "27Q", "30D", "25R", "25RWB", "26F", "27F", "33C"],
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
        "2026": ["22M", "25B", "26T", "31G", "31H", "31K", "25R", "25RWB", "26F", "27F", "33C"]
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
      floorplans: ["22C", "25J", "27D", "31C", "25H", "27N"],
      floorplansByYear: {
        "2014": ["22C", "25J", "27D"],
        "2015": ["22C", "25J", "27D"],
        "2016": ["22C", "25J", "27D"],
        "2017": ["22C", "25J", "27D", "31C"],
        "2018": ["22C", "25J", "27D", "31C"],
        "2019": ["22C", "25J", "27D", "31C"],
        "2020": ["22C", "25J", "27D", "31C"],
        "2021": ["22C", "25J", "27D", "31C"],
        "2022": ["22C", "25J", "31C", "25H", "27N"]
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
      floorplans: ["26RP", "28MT", "29MT", "31SR", "31J", "31P"],
      floorplansByYear: {
        "2021": ["26RP", "28MT", "29MT"],
        "2022": ["26RP", "28MT", "29MT", "31SR"],
        "2023": ["26RP", "28MT", "29MT", "31SR"],
        "2024": ["26RP", "28MT", "29MT", "31SR"],
        "2025": ["26RP", "28MT", "31SR"],
        "2026": ["26RP", "28MT", "31SR", "31J", "31P"]
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
      floorplans: ["2201MB", "2500FL", "2801BHS", "2809DL", "2201DS", "2455BHS", "2516BH"],
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
        "2026": ["2201MB", "2500FL", "2201DS", "2455BHS", "2516BH"]
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
      floorplans: ["30X3", "31L5", "36B5", "36D5", "31MBS5", "34H5", "34RS5", "36FK5"],
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
        "2026": ["31L5", "36B5", "36D5", "31MBS5", "34H5", "34RS5", "36FK5"]
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
      floorplans: ["377DS", "378TS", "369DS", "380RBS", "390RHD"],
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
        "2026": ["377DS", "378TS", "380RBS", "390RHD"]
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
      floorplans: ["328DS", "364TS", "369DS", "28Z", "31K1", "31L3", "36B5", "36G5", "36H5"],
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
        "2026": ["328DS", "364TS", "28Z", "31K1", "31L3", "36B5", "36G5", "36H5"]
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
      floorplans: ["30DS", "31DS", "32DS", "33DS", "34DS", "35DS", "33Z", "35G", "28DS", "29DS", "36DS", "36FBD", "37DS", "38DS"],
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
        "2026": ["30DS", "31DS", "34DS", "35DS", "33Z", "35G", "28DS", "29DS", "36DS", "36FBD", "37DS", "38DS"]
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
      floorplans: ["34QS", "38A", "39A", "40C", "38B", "40QBH", "45BH"],
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
        "2026": ["38A", "40C", "38B", "40QBH", "45BH"]
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
      floorplans: ["2440DS", "2500TS", "2860DS", "3010DS", "3050S", "3150S", "2250S", "2850S", "2250LE", "2290SB", "3350DQ"],
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
        "2026": ["2440DS", "2500TS", "2860DS", "3010DS", "3050S", "3150S", "2250LE", "2290SB", "3350DQ"],
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
      floorplans: ["1950LE", "2150SLE", "2250SLE", "2350LE", "2530S", "2550DSLE", "2850SLE", "2950LE", "3250DSLE", "2300SLE", "2800SLE"],
      floorplansByYear: {
        "2012": ["2250SLE","2500LE"],"2013": ["2250SLE","2500LE"],"2014": ["2250SLE","2500LE"],
        "2015": ["2250SLE","2500LE"],"2016": ["2250SLE","2500LE"],"2017": ["2250SLE","2500LE"],
        "2018": ["2250SLE","2500LE"],"2019": ["2250SLE","2500LE","2850LE"],
        "2020": ["2250SLE","2500LE","2850LE"],"2021": ["2250SLE","2500LE","2850LE"],
        "2022": ["2250SLE","2500LE"],"2023": ["2250SLE","2500LE"],"2024": ["2250SLE","2500LE"],
        "2025": ["1950LE","2150SLE","2250SLE","2350LE","2550DSLE"],
        "2026": ["1950LE", "2150SLE", "2250SLE", "2350LE", "2530S", "2550DSLE", "2850SLE", "2950LE", "3250DSLE", "2300SLE", "2800SLE"],
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
      floorplans: ["2440DS", "2500TS", "2860DS", "3010DS", "3050S", "3150S", "2340DS"],
      floorplansByYear: {
        "2008": ["3010DS","3250DS"],"2009": ["3010DS","3250DS"],"2010": ["3010DS","3250DS"],
        "2011": ["3010DS","3250DS"],"2012": ["3010DS","3250DS"],"2013": ["3010DS","3250DS"],
        "2014": ["3010DS","3250DS"],"2015": ["3010DS","3250DS"],"2016": ["3010DS","3250DS"],
        "2017": ["3010DS","3250DS"],"2018": ["3010DS","3250DS"],"2019": ["3010DS","3250DS"],
        "2020": ["3010DS","3250DS"],"2021": ["3010DS","3250DS"],"2022": ["3010DS","3250DS"],
        "2023": ["3010DS","3250DS"],"2024": ["3010DS","3250DS"],
        "2025": ["2440DS","2860DS","3010DS","3050S"],
        "2026": ["2440DS", "2500TS", "2860DS", "3010DS", "3050S", "3150S", "2340DS"],
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
      floorplans: ["2401W", "2501TS", "3011DS", "2861DS", "2251SLE", "2441DS", "2891SL", "2931DS", "3041DS", "3051SF"],
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
        "2026": ["2401W", "2501TS", "3011DS", "2251SLE", "2441DS", "2891SL", "2931DS", "3041DS", "3051SF"]
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
      floorplans: ["2251SLE", "2401LE", "2501LE", "2251LE", "2361DS", "2441DS", "2881DSL"],
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
        "2026": ["2251SLE", "2401LE", "2251LE", "2361DS", "2441DS", "2881DSL"]
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
      floorplans: ["24S", "24X", "24R", "24T"],
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
        "2026": ["24S", "24X", "24T"]
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
      floorplans: ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW", "24FWS", "26DS", "27BS"],
      floorplansByYear: {
        "2018": ["3 Series 24FW", "3 Series 24RA"],
        "2019": ["3 Series 24FW", "3 Series 24RA"],
        "2020": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2021": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2022": ["3 Series 24FW", "3 Series 24RA", "5 Series 30FW"],
        "2023": ["3 Series 24FW", "5 Series 30FW"],
        "2024": ["3 Series 24FW", "5 Series 30FW"],
        "2025": ["3 Series 24FW", "5 Series 30FW"],
        "2026": ["3 Series 24FW", "5 Series 30FW", "24FWS", "26DS", "27BS"]
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
      floorplans: ["8289WS", "8311WS", "8329SS", "8335BSS", "8280WS", "8290BS", "8299BS", "8311BH", "8324BS", "8337WS"],
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
        "2026": ["8289WS", "8311WS", "8335BSS", "8280WS", "8290BS", "8299BS", "8311BH", "8324BS", "8337WS"]
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
      floorplans: ["330RL", "377MBC", "383FB", "385BH", "286RK", "329DV", "340RLC", "376MB"],
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
        "2026": ["330RL", "377MBC", "383FB", "286RK", "329DV", "340RLC", "376MB"]
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
      floorplans: ["3450RL", "3825FL", "3950RL", "3456RL", "3250BKX", "3350BHX", "370BHLE", "380BHLE", "3850BKX", "4050BKX"],
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
        "2026": ["3450RL", "3825FL", "3950RL", "3250BKX", "3350BHX", "370BHLE", "380BHLE", "3850BKX", "4050BKX"]
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
      floorplans: ["34RL2", "36CK2", "38EL", "38FB2", "286RL", "293RLBS", "313BLOK", "345IKZ", "360RL", "38DBQ"],
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
        "2026": ["34RL2", "36CK2", "38EL", "286RL", "293RLBS", "313BLOK", "345IKZ", "360RL", "38DBQ"]
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
      floorplans: ["36BHQ", "38DBQ", "37FLH", "32BHT", "33BKS", "38FLH", "40FLP"],
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
        "2026": ["36BHQ", "38DBQ", "32BHT", "33BKS", "38FLH", "40FLP"]
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
      floorplans: ["255RRT", "27SGS", "285OPT", "287BH", "289PANO", "3250SUITE", "331BH", "3550WST", "3650SUITE", "3660SUITE", "3750SUITE", "3800DECK", "387ML", "38DST", "38LEAH", "3950SUITE", "250BH", "265DBH", "272SGB", "305ML6", "321BH", "323BH8", "331MK8", "340BH8", "350BH8", "380BH8"],
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
        "2026": ["27SGS", "285OPT", "287BH", "289PANO", "3250SUITE", "331BH", "3650SUITE", "3750SUITE", "3800DECK", "387ML", "38DST", "38LEAH", "3950SUITE", "250BH", "265DBH", "272SGB", "305ML6", "321BH", "323BH8", "331MK8", "340BH8", "350BH8", "380BH8"]
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
      floorplans: ["241SLR", "282SLR", "286GSLR", "333SLR", "253SLT", "282TSL", "284CKSL", "300TQC", "316BHSL"],
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
        "2026": ["282SLR", "286GSLR", "333SLR", "253SLT", "282TSL", "284CKSL", "300TQC", "316BHSL"]
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
      floorplans: ["21HFS", "26HFS", "29HFS", "3016", "25HFS", "29HHFS"],
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
        "2026": ["26HFS", "29HFS", "3016", "25HFS", "29HHFS"]
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
      floorplans: ["25KW", "28KW", "35DK5", "41G14", "351", "361", "371", "381", "403", "404"],
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
        "2026": ["28KW", "35DK5", "41G14", "351", "361", "371", "381", "403", "404"]
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
      floorplans: ["340AMP", "380AMP", "415AMP", "300X12", "335AMP12", "370AMP13", "405AMP13"],
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
        "2026": ["380AMP", "415AMP", "300X12", "335AMP12", "370AMP13", "405AMP13"]
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
      floorplans: ["24PACK12", "27PACK10", "325PACK13", "365PACK16", "23PACK15", "29PACK10", "35PACK10"],
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
        "2026": ["27PACK10", "325PACK13", "365PACK16", "23PACK15", "29PACK10", "35PACK10"]
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
      floorplans: ["19SM", "20RDSE", "21AB", "22CE", "22MKSE", "23DBH", "23MK", "23MS", "26BRB", "26DBH", "26DJSE", "26KF", "26LK", "26LP", "26SS", "27GH", "27LH", "29NM", "29QB", "29TE", "17EV", "18RR", "22RR", "24JS", "24RRL", "27DBH", "27RR", "29BH", "30BHOK"],
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
        "2026": ["19SM", "20RDSE", "21AB", "22CE", "22MKSE", "23DBH", "23MK", "23MS", "26BRB", "26DBH", "26DJSE", "26KF", "26LK", "26LP", "26SS", "27GH", "27LH", "29NM", "29QB", "29TE", "17EV", "18RR", "22RR", "24JS", "24RRL", "27DBH", "27RR", "29BH", "30BHOK"]
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
      floorplans: ["16BHS", "16FQ", "17JG", "18TO", "18RJB", "18TOW", "16FQDLX", "14ABRK", "20RJBSE", "22RBL", "24BSSK"],
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
        "2026": ["16BHS", "16FQ", "16FQDLX", "17JG", "18RJB", "18TO", "18TOW", "14ABRK", "20RJBSE", "22RBL", "24BSSK"]
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
      floorplans: ["2104S", "2109S", "2204S", "2205S", "2506S", "2509S", "2511S", "2513S", "2516S", "1905", "2512", "2514", "2715", "2718BS"],
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
        "2026": ["2104S", "2109S", "2204S", "2205S", "2506S", "2509S", "2511S", "2513S", "2516S", "1905", "2512", "2514", "2715", "2718BS"]
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
      floorplans: ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS", "1905", "2440BH", "2608BD", "2770BS", "2882S"],
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
        "2026": ["2606WS", "2608BS", "2612WS", "2706WS", "2720IK", "2897BS", "2912BS", "1905", "2440BH", "2608BD", "2770BS", "2882S"]
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
      floorplans: ["21FBRS", "21DS", "22FBS", "25BDS", "25BHS", "25FBTS", "25FKBS", "21DSLE", "22FBR", "23LB", "25BRDS", "25FBS"],
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
        "2026": ["21FBRS", "21DS", "22FBS", "25BHS", "25BDS", "25FKBS", "25FBTS", "21DSLE", "22FBR", "23LB", "25BRDS", "25FBS"]
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
      floorplans: ["19DBXL", "21RBXL", "24DBXL", "25ICE", "263BHXL", "26BHXL", "26ICE", "273QBXL", "273QBXLX", "28VBXL", "29BHXL", "30QBXL", "171RBXL", "177RB", "204RDXL", "240VIEW", "24RLXL", "261BHXL", "280RLS", "292BHXL"],
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
        "2026": ["24DBXL", "25ICE", "263BHXL", "26BHXL", "26ICE", "273QBXL", "273QBXLX", "28VBXL", "29BHXL", "171RBXL", "177RB", "204RDXL", "240VIEW", "24RLXL", "261BHXL", "280RLS", "292BHXL"]
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
      floorplans: ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "356QB", "265BH", "276RK", "290QB", "300BH", "310BHLE", "356QBU"],
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
        "2026": ["270FKBH", "271RL", "273RL", "286RL", "308RL", "310BHI", "314BUD", "265BH", "276RK", "290QB", "300BH", "310BHLE", "356QBU"]
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
      floorplans: ["22RBS", "24RBS", "26DBUD", "27RE", "28VIEW", "29VBUD", "32BHDS", "32RET", "33TS", "36VBAL", "28DBUD", "33BHDS", "34BHDS", "36BHBS", "38BHDS"],
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
        "2026": ["26DBUD", "27RE", "28VIEW", "29VBUD", "32BHDS", "32RET", "33TS", "36VBAL", "28DBUD", "33BHDS", "34BHDS", "36BHBS", "38BHDS"]
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
      floorplans: ["171", "180", "190", "193", "202", "RP-171", "RP-190", "RP-202", "170", "176", "178", "179", "181", "192", "196"],
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
        "2026": ["171", "190", "193", "202", "RP-171", "RP-190", "RP-202", "170", "176", "178", "179", "181", "192", "196"]
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
        "2025": ["16", "16X", "20", "20X"],
        "2026": ["16", "16X", "20", "20X"],
        "2027": ["16", "16X", "20", "20X"]
      },
      lengthRange: [16, 21],
      weightRange: [2500, 3800],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [69900, 88000],
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
      description: "Airstream Basecamp — rugged adventure trailer. 16 / 20 with X off-road package (lift, A/T tires, rock guards). REI Co-op special retired after 2025. Xe electric-first is its own model from 2026."
    },
    "Basecamp Xe": {
      type: "Travel Trailer",
      floorplans: ["20XE"],
      floorplansByYear: {
        "2022": ["20XE"],
        "2023": ["20XE"],
        "2024": ["20XE"],
        "2025": ["20XE"],
        "2026": ["20XE"],
        "2027": ["20XE"]
      },
      lengthRange: [20, 21],
      weightRange: [3200, 4000],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [88900, 98000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.6,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 20,
      grayWater: 14,
      blackWater: 14,
      awningLength: 7,
      ceilingHeight: 72,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2022,
      description: "Airstream Basecamp Xe — electric-first adventure trailer (20XE). Lithium + solar first; LP still available. Built for off-grid and campground use."
    },
    "World Traveler": {
      type: "Travel Trailer",
      floorplans: ["17RB", "22RB"],
      floorplansByYear: {
        "2026": ["17RB", "22RB"],
        "2027": ["17RB", "22RB"]
      },
      lengthRange: [17, 22],
      weightRange: [3150, 4500],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [64400, 78000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 20,
      grayWater: 16,
      blackWater: 16,
      awningLength: 10,
      ceilingHeight: 74,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2026,
      overallLengthIn: 266,
      exteriorWidthIn: 90,
      gvwrLbs: 4500,
      description: "Airstream World Traveler — 2026 lightweight single-axle (17RB / 22RB). 7'6\" body, V-twin rear bed on 22RB, full mid-bath. Entry Airstream for smaller tow vehicles."
    },
    Bambi: {
      type: "Travel Trailer",
      floorplans: ["16RB", "19CB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
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
        "2025": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
        "2026": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
        "2027": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"]
      },
      lengthRange: [16, 22],
      weightRange: [2800, 4500],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [72000, 110000],
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
      description: "Airstream Bambi — compact single-axle (16RB / 20FB / 22FB). 19CB through 2024. Dublin Slate décor available on current years (Dark Walnut cabinetry). Hand-riveted aluminum shell."
    },
    Caravel: {
      type: "Travel Trailer",
      floorplans: ["16RB", "19CB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
      floorplansByYear: {
        "2017": ["16RB", "19CB", "22FB"],
        "2018": ["16RB", "19CB", "20FB", "22FB"],
        "2019": ["16RB", "19CB", "20FB", "22FB"],
        "2020": ["16RB", "19CB", "20FB", "22FB"],
        "2021": ["16RB", "19CB", "20FB", "22FB"],
        "2022": ["16RB", "19CB", "20FB", "22FB"],
        "2023": ["16RB", "19CB", "20FB", "22FB"],
        "2024": ["16RB", "19CB", "20FB", "22FB"],
        "2025": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
        "2026": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"],
        "2027": ["16RB", "20FB", "22FB", "16RB Dublin Slate", "20FB Dublin Slate", "22FB Dublin Slate"]
      },
      lengthRange: [16, 22],
      weightRange: [3000, 4800],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [78000, 118000],
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
      description: "Airstream Caravel — Bambi-size luxury trim (upgraded interior, higher spec). Same 16RB / 20FB / 22FB layouts. Dublin Slate décor on current years."
    },
    Nest: {
      type: "Travel Trailer",
      floorplans: ["16U", "16FB"],
      floorplansByYear: {
        "2018": ["16U", "16FB"],
        "2019": ["16U", "16FB"],
        "2020": ["16U", "16FB"]
      },
      lengthRange: [16, 17],
      weightRange: [2800, 3600],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [45000, 62000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 20,
      grayWater: 15,
      blackWater: 9,
      awningLength: 8,
      ceilingHeight: 74,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2018,
      yearEnd: 2020,
      description: "Airstream Nest — fiberglass nest-egg trailer (2018–2020 only). Not aluminum. 16U / 16FB. Discontinued."
    },
    "Flying Cloud": {
      type: "Travel Trailer",
      floorplans: [
        "23FB", "23FBT", "23FB Twin", "23FB Dublin Slate",
        "25FB", "25FBQ", "25FB Twin", "25RB", "25FB Dublin Slate",
        "27FB", "27FBQ", "27FB Twin", "27FB Dublin Slate",
        "28RB", "28RB Twin",
        "30FB", "30FBQ", "30FB Bunk", "30FB Office"
      ],
      floorplansByYear: {
        "2010": ["23FB", "25FB", "25RB", "27FB", "30FB"],
        "2011": ["23FB", "25FB", "25RB", "27FB", "30FB"],
        "2012": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2013": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2014": ["23FB", "23FBT", "25FB", "25RB", "27FB", "30FB"],
        "2015": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB"],
        "2016": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2017": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2018": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2019": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2020": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2021": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2022": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2023": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ"],
        "2024": ["23FB", "23FBT", "25FB", "25FBQ", "25RB", "27FB", "27FBQ", "30FB", "30FBQ", "30FB Office"],
        "2025": ["23FB", "23FB Twin", "25FB", "25FB Twin", "25RB", "27FB", "27FB Twin", "30FB", "30FB Bunk", "23FB Dublin Slate", "25FB Dublin Slate", "27FB Dublin Slate"],
        "2026": ["23FB", "23FB Twin", "25FB", "25FB Twin", "27FB", "27FB Twin", "28RB", "30FB Bunk", "23FB Dublin Slate", "25FB Dublin Slate", "27FB Dublin Slate"],
        "2027": ["23FB", "23FB Twin", "25FB", "25FB Twin", "27FB", "27FB Twin", "28RB", "30FB Bunk", "23FB Dublin Slate", "25FB Dublin Slate", "27FB Dublin Slate"]
      },
      lengthRange: [23, 30],
      weightRange: [5000, 7800],
      slideouts: 0,
      sleeps: 8,
      msrpRange: [115900, 147400],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      description: "Airstream Flying Cloud — highest-volume dual-axle. Current: 23FB / 25FB / 27FB / 28RB / 30FB Bunk (Twin layouts and Dublin Slate décor). 30FB Office retired after 2025. Midnight Flamingo décor retired mid-2026."
    },
    "Trade Wind": {
      type: "Travel Trailer",
      floorplans: ["23FB", "25FB", "25FBQ", "25FB Twin", "28RB", "25FB Dublin Slate", "27FB"],
      floorplansByYear: {
        "2021": ["25FB", "25FBQ"],
        "2022": ["25FB", "25FBQ", "28RB"],
        "2023": ["25FB", "25FBQ", "28RB"],
        "2024": ["25FB", "25FBQ", "28RB"],
        "2025": ["23FB", "25FB", "25FB Twin", "28RB", "25FB Dublin Slate"],
        "2026": ["23FB", "25FB", "25FB Twin", "28RB", "25FB Dublin Slate"],
        "2027": ["23FB", "25FB", "25FB Twin", "28RB", "25FB Dublin Slate"]
      },
      lengthRange: [23, 28],
      weightRange: [5800, 7200],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [120000, 155000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2021,
      gvwrLbs: 6500,
      description: "Airstream Trade Wind — dual-axle with coastal/resort interior. Pottery Barn collab retired after 2025. 23FB / 25FB / 25FB Twin / 28RB. 23FB GVWR 6,500 lb from 2026. Dublin Slate décor on current 25FB."
    },
    International: {
      type: "Travel Trailer",
      floorplans: ["23FB", "25FB", "27FB", "28RB", "30RB", "23FB Coastal Cove", "25FB Coastal Cove", "27FB Coastal Cove", "28RB Coastal Cove", "30RB Coastal Cove"],
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
        "2025": ["23FB", "25FB", "27FB", "30RB", "23FB Coastal Cove", "25FB Coastal Cove", "27FB Coastal Cove", "30RB Coastal Cove"],
        "2026": ["23FB", "25FB", "27FB", "28RB", "30RB", "23FB Coastal Cove", "25FB Coastal Cove", "27FB Coastal Cove", "28RB Coastal Cove", "30RB Coastal Cove"],
        "2027": ["23FB", "25FB", "27FB", "28RB", "30RB", "23FB Coastal Cove", "25FB Coastal Cove", "27FB Coastal Cove", "28RB Coastal Cove", "30RB Coastal Cove"]
      },
      lengthRange: [23, 31],
      weightRange: [5400, 7800],
      slideouts: 0,
      sleeps: 5,
      msrpRange: [128900, 157400],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      description: "Airstream International — classic dual-axle. Current 23FB / 25FB / 27FB / 28RB / 30RB. Signature décor is Coastal Cove with Aqua Ultraleather (not Dublin Slate)."
    },
    Globetrotter: {
      type: "Travel Trailer",
      floorplans: [
        "23FB", "25FB", "27FB", "30RB",
        "25FB Dublin Slate", "25FB Copenhagen Cream", "25FB London Grey", "25FB Barcelona Blue",
        "27FB Dublin Slate", "27FB Copenhagen Cream", "27FB London Grey", "27FB Barcelona Blue",
        "30RB Dublin Slate", "30RB Copenhagen Cream"
      ],
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
        "2025": ["25FB", "27FB", "30RB", "25FB Dublin Slate", "25FB Copenhagen Cream", "25FB London Grey", "25FB Barcelona Blue", "27FB Dublin Slate", "27FB Copenhagen Cream", "30RB Dublin Slate"],
        "2026": ["25FB", "27FB", "30RB", "25FB Dublin Slate", "25FB Copenhagen Cream", "25FB London Grey", "25FB Barcelona Blue", "27FB Dublin Slate", "27FB Copenhagen Cream", "27FB London Grey", "27FB Barcelona Blue", "30RB Dublin Slate", "30RB Copenhagen Cream"],
        "2027": ["25FB", "27FB", "30RB", "25FB Dublin Slate", "25FB Copenhagen Cream", "25FB London Grey", "25FB Barcelona Blue", "27FB Dublin Slate", "27FB Copenhagen Cream", "27FB London Grey", "27FB Barcelona Blue", "30RB Dublin Slate", "30RB Copenhagen Cream"]
      },
      lengthRange: [23, 30],
      weightRange: [5500, 8000],
      slideouts: 0,
      sleeps: 6,
      msrpRange: [145000, 185000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.85,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2016,
      description: "Airstream Globetrotter — premium dual-axle, European-inspired interior. Layouts 25FB / 27FB / 30RB. Décor trims: Dublin Slate (Dark Walnut), Copenhagen Cream (Natural Elm), London Grey, Barcelona Blue."
    },
    Classic: {
      type: "Travel Trailer",
      floorplans: ["28RB", "30RB", "30RBT", "30RB Twin", "33FB", "33FBT", "33FB Twin"],
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
        "2025": ["28RB", "30RB", "30RB Twin", "33FB", "33FB Twin"],
        "2026": ["28RB", "30RB", "30RB Twin", "33FB", "33FB Twin"],
        "2027": ["28RB", "30RB", "30RB Twin", "33FB", "33FB Twin"]
      },
      lengthRange: [28, 33],
      weightRange: [7500, 9000],
      slideouts: 0,
      sleeps: 5,
      msrpRange: [175000, 245000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 53,
      grayWater: 34,
      blackWater: 39,
      awningLength: 18,
      ceilingHeight: 79,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2000,
      gvwrLbs: 10000,
      description: "Airstream Classic — flagship travel trailer. 28RB / 30RB / 30RB Twin / 33FB / 33FB Twin. Highest resale of any production trailer. Dual-motor sofa on 28RB/30RB from 2026."
    },
    "Stetson 6666": {
      type: "Travel Trailer",
      floorplans: ["27FB", "Stetson", "6666"],
      floorplansByYear: {
        "2025": ["27FB", "Stetson"],
        "2026": ["27FB", "Stetson", "6666"],
        "2027": ["27FB", "Stetson", "6666"]
      },
      lengthRange: [27, 28],
      weightRange: [6200, 7600],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [176900, 195000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2025,
      description: "Airstream Stetson+6666 Special Edition — Western collab with Stetson and Four Sixes Ranch. Limited 27-class dual-axle with ranch-inspired leather, felt, and hardware. Not a standard Flying Cloud trim."
    },
    "Frank Lloyd Wright Usonian": {
      type: "Travel Trailer",
      floorplans: ["28RB", "Usonian"],
      floorplansByYear: {
        "2026": ["28RB", "Usonian"],
        "2027": ["28RB", "Usonian"]
      },
      lengthRange: [28, 28],
      weightRange: [6800, 8000],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [189900, 210000],
      chassis: "N/A (towable)",
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.75,
      image: RV_CARD_IMAGE,
      towingCapacity: 0,
      freshWater: 39,
      grayWater: 37,
      blackWater: 39,
      awningLength: 14,
      ceilingHeight: 78,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2026,
      description: "Airstream Frank Lloyd Wright Usonian Limited Edition — ~200 units over two years. 28-foot dual-axle with organic architecture, convertible living, and Wright-inspired millwork. Not a standard International trim."
    },
    Interstate: {
      type: "Class B",
      floorplans: ["19", "19GT", "19GTX", "19X", "19X LE Outland", "24GL", "24GLX", "24GT", "24GT Twin", "24GTX", "24X", "Grand Tour EXT", "19GT Tommy Bahama", "24GL Tommy Bahama", "24GT Tommy Bahama", "Tommy Bahama"],
      floorplansByYear: {
        "2010": ["24GL", "Grand Tour EXT"],
        "2011": ["24GL", "Grand Tour EXT"],
        "2012": ["24GL", "Grand Tour EXT"],
        "2013": ["24GL", "Grand Tour EXT"],
        "2014": ["24GL", "Grand Tour EXT"],
        "2015": ["19", "24GL", "Grand Tour EXT"],
        "2016": ["19", "24GL", "Grand Tour EXT", "24GL Tommy Bahama"],
        "2017": ["19", "24GL", "Grand Tour EXT", "24GL Tommy Bahama"],
        "2018": ["19", "24GL", "24GT", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2019": ["19", "24GL", "24GT", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2020": ["19", "24GL", "24GT", "24GT Twin", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2021": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2022": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2023": ["19", "24GL", "24GT", "24GT Twin", "24X", "Grand Tour EXT", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2024": ["19", "19GT", "24GL", "24GT", "24GT Twin", "24X", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2025": ["19GT", "19GTX", "19X", "24GL", "24GLX", "24GT", "24GTX", "19GT Tommy Bahama", "24GL Tommy Bahama", "24GT Tommy Bahama"],
        "2026": ["19GT", "19GTX", "19X", "19X LE Outland", "24GL", "24GLX", "24GT", "24GTX", "19GT Tommy Bahama", "24GL Tommy Bahama", "24GT Tommy Bahama", "Tommy Bahama"],
        "2027": ["19GT", "19GTX", "19X", "19X LE Outland", "24GL", "24GLX", "24GT", "24GTX", "19GT Tommy Bahama", "24GL Tommy Bahama", "24GT Tommy Bahama"]
      },
      lengthRange: [19, 25],
      weightRange: [9000, 12000],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [240900, 293900],
      engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel (Sprinter)",
      horsepower: 208,
      torqueLbFt: 332,
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
        { from: 2005, to: 2009, engine: "Mercedes-Benz turbodiesel (Sprinter T1N / early NCV3)", horsepower: 154, chassis: "Mercedes-Benz Sprinter", notes: "Early Interstate — ~154–188 HP by year" },
        { from: 2010, to: 2018, engine: "Mercedes-Benz 3.0L V6 turbodiesel (OM642)", horsepower: 188, torqueLbFt: 325, chassis: "Mercedes-Benz Sprinter", notes: "NCV3 Sprinter era" },
        { from: 2019, to: 2023, engine: "Mercedes-Benz 3.0L I6 turbodiesel (OM642 / VS30)", horsepower: 188, torqueLbFt: 325, chassis: "Mercedes-Benz Sprinter 2500/3500", notes: "VS30 Sprinter" },
        { from: 2024, to: 2027, engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter", notes: "Advanced Power System standard on GT/GL from 2026. X = adventure; XE/GTX = adventure + luxury" }
      ],
      description: "Airstream Interstate — Mercedes Sprinter Class B. Current: 19GT / 19GTX / 19X / 19X LE Outland; 24GL (Grand Lounge) / 24GLX / 24GT (Grand Tour) / 24GTX. Tommy Bahama resort editions on 19GT, 24GL, 24GT."
    },
    "Tommy Bahama": {
      type: "Class B",
      floorplans: ["19GT", "24GL", "24GT", "Atlas 25MS"],
      floorplansByYear: {
        "2016": ["24GL"],
        "2017": ["24GL"],
        "2018": ["24GL", "24GT"],
        "2019": ["24GL", "24GT"],
        "2020": ["24GL", "24GT"],
        "2021": ["24GL", "24GT"],
        "2022": ["24GL", "24GT"],
        "2023": ["24GL", "24GT"],
        "2024": ["19GT", "24GL", "24GT"],
        "2025": ["19GT", "24GL", "24GT", "Atlas 25MS"],
        "2026": ["19GT", "24GL", "24GT", "Atlas 25MS"],
        "2027": ["19GT", "24GL", "24GT", "Atlas 25MS"]
      },
      lengthRange: [19, 25],
      weightRange: [9000, 12500],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [255000, 360000],
      engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel (Sprinter)",
      horsepower: 208,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 26,
      grayWater: 22,
      blackWater: 18,
      awningLength: 10,
      ceilingHeight: 75,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2016,
      mpgHighwayEst: 16,
      powertrainByYear: [
        { from: 2016, to: 2018, engine: "Mercedes-Benz 3.0L V6 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter" },
        { from: 2019, to: 2023, engine: "Mercedes-Benz 3.0L I6 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter" },
        { from: 2024, to: 2027, engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500 (Atlas) / Sprinter (Interstate)", notes: "Resort interior: woven textiles, warm wood, rattan, island-inspired fabrics. Not a layout — a trim on Interstate 19GT/24GL/24GT and Atlas 25MS." }
      ],
      description: "Airstream Tommy Bahama Resort Edition — collab trim on Interstate 19GT / 24GL / 24GT and Atlas 25MS. Island interior, not a unique chassis. Pick the layout that matches the coach (19 vs 24 vs Atlas 25)."
    },
    Atlas: {
      type: "Class B+",
      floorplans: ["24CE", "24GT", "24TE", "25MS", "25RT", "25MS Tommy Bahama", "Tommy Bahama"],
      floorplansByYear: {
        "2018": ["24CE", "24GT"],
        "2019": ["24CE", "24GT", "24TE"],
        "2020": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2021": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2022": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2023": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2024": ["24CE", "24GT", "24TE", "Tommy Bahama"],
        "2025": ["25MS", "25RT", "25MS Tommy Bahama"],
        "2026": ["25MS", "25RT", "25MS Tommy Bahama"],
        "2027": ["25MS", "25RT", "25MS Tommy Bahama"]
      },
      lengthRange: [24, 25],
      weightRange: [10500, 12500],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [289900, 360000],
      engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel (Sprinter 4500)",
      horsepower: 208,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 4500",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.8,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 30,
      grayWater: 24,
      blackWater: 24,
      generator: "None (lithium + solar / Advanced Power System)",
      awningLength: 9,
      ceilingHeight: 75,
      founded: 1931,
      warrantyYears: 3,
      yearStart: 2018,
      mpgHighwayEst: 16,
      powertrainByYear: [
        { from: 2018, to: 2018, engine: "Mercedes-Benz 3.0L V6 turbodiesel", horsepower: 188, chassis: "Mercedes-Benz Sprinter 4500" },
        { from: 2019, to: 2024, engine: "Mercedes-Benz 3.0L I6 turbodiesel", horsepower: 188, torqueLbFt: 325, chassis: "Mercedes-Benz Sprinter 4500" },
        { from: 2025, to: 2027, engine: "Mercedes-Benz 2.0L twin-turbo I4 diesel", horsepower: 208, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 4500", notes: "25MS = Master Suite flagship; 25RT = rear garage / pass-through. Tommy Bahama on 25MS." }
      ],
      description: "Airstream Atlas — ultra-premium Sprinter 4500 touring coach. Current: 25MS (Master Suite) and 25RT (rear garage). Earlier 24CE / 24GT / 24TE. Tommy Bahama resort trim on 25MS."
    },
    Rangeline: {
      type: "Class B",
      floorplans: ["18R", "18RB", "21PL", "21PS"],
      floorplansByYear: {
        "2022": ["18R", "18RB"],
        "2023": ["18R", "18RB"],
        "2024": ["18R", "18RB", "21PL", "21PS"],
        "2025": ["21PL", "21PS"],
        "2026": ["21PL", "21PS"],
        "2027": ["21PL", "21PS"]
      },
      lengthRange: [21, 22],
      weightRange: [7600, 9350],
      slideouts: 0,
      sleeps: 4,
      msrpRange: [161400, 173400],
      engine: "RAM 3.6L Pentastar V6",
      horsepower: 276,
      torqueLbFt: 250,
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
      mpgHighwayEst: 14,
      powertrainByYear: [
        { from: 2022, to: 2027, engine: "RAM 3.6L Pentastar V6", horsepower: 276, torqueLbFt: 250, chassis: "RAM ProMaster 3500", notes: "Gas ProMaster — not a Mercedes diesel. 21PL = Premier Loft (sleeps 4); 21PS = Premier Studio." }
      ],
      description: "Airstream Rangeline — RAM ProMaster 3500 Class B (gas 3.6L Pentastar 276 HP). Current 21PL loft and 21PS studio. Earlier 18R / 18RB. Adventure van, not a Sprinter."
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
      floorplans: ["310GK", "375RES", "377MBS", "380FL", "390RK", "378MBS", "382WB"],
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
        "2026": ["375RES", "380FL", "390RK", "378MBS", "382WB"]
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
      floorplans: ["2930RL", "3740BH", "3800FL", "3350RL"],
      floorplansByYear: {
        "2019": ["2930RL", "3740BH"],
        "2020": ["2930RL", "3740BH"],
        "2021": ["2930RL", "3740BH", "3800FL"],
        "2022": ["2930RL", "3740BH", "3800FL"],
        "2023": ["2930RL", "3740BH", "3800FL"],
        "2024": ["2930RL", "3740BH"],
        "2025": ["2930RL", "3740BH"],
        "2026": ["2930RL", "3740BH", "3350RL"]
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
      floorplans: ["28BH", "303RLS", "337RLS", "320MKS", "367BHS", "311BH", "315RLTS"],
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
        "2026": ["303RLS", "337RLS", "367BHS", "311BH", "315RLTS"]
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
      floorplans: ["150 Series 220RK", "150 Series 260RD", "150 Series 295RL", "260RD", "278BH", "290BH", "295RL", "320MKS"],
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
        "2026": ["150 Series 260RD", "150 Series 295RL", "260RD", "278BH", "290BH", "295RL", "320MKS"]
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
      floorplans: ["2150RB", "2500RL", "2800BH", "2970RL", "3100RD", "2670MK", "3000RD"],
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
        "2026": ["2500RL", "2800BH", "2970RL", "2670MK", "3000RD"]
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
      floorplans: ["17MKE", "21BHE", "22RBE", "23LDE", "22MLE", "25DBE", "25RKE"],
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
        "2026": ["17MKE", "21BHE", "22RBE", "22MLE", "25DBE", "25RKE"]
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
      floorplans: ["207RB", "245RL", "265BH", "297QB", "27BHB", "28MKS"],
      floorplansByYear: {
        "2018": ["207RB", "245RL", "265BH"],
        "2019": ["207RB", "245RL", "265BH"],
        "2020": ["207RB", "245RL", "265BH", "297QB"],
        "2021": ["207RB", "245RL", "265BH", "297QB"],
        "2022": ["245RL", "265BH", "297QB"],
        "2023": ["245RL", "265BH", "297QB"],
        "2024": ["245RL", "265BH", "297QB"],
        "2025": ["245RL", "265BH"],
        "2026": ["245RL", "265BH", "27BHB", "28MKS"]
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
      floorplans: ["349M", "376TH", "395M", "397TH", "349G", "381MS"],
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
        "2026": ["395M", "397TH", "349G", "381MS"]
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
      floorplans: ["328M", "349M", "381M", "395M", "21M", "25M", "28M", "31M"],
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
        "2026": ["349M", "395M", "21M", "25M", "28M", "31M"]
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
      floorplans: ["21G", "25G", "29G", "24G", "28G", "30G"],
      floorplansByYear: {
        "2018": ["21G", "25G", "29G"],
        "2019": ["21G", "25G", "29G"],
        "2020": ["21G", "25G", "29G"],
        "2021": ["21G", "25G", "29G"],
        "2022": ["21G", "25G", "29G"],
        "2023": ["21G", "25G", "29G"],
        "2024": ["25G", "29G"],
        "2025": ["25G", "29G"],
        "2026": ["25G", "29G", "24G", "28G", "30G"]
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
      floorplans: ["22MAV", "27MAV", "25MAV"],
      floorplansByYear: {
        "2022": ["22MAV", "27MAV"],
        "2023": ["22MAV", "27MAV"],
        "2024": ["22MAV", "27MAV"],
        "2025": ["22MAV", "27MAV"],
        "2026": ["22MAV", "27MAV", "25MAV"]
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
      floorplans: ["36G", "37R", "38F", "38K", "39F", "39G", "40G", "38N", "36Q", "38W", "44H"],
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
        // Brochure 2017 Discovery/LXE + 2018 DISDISLXE18B1: 37R | 38K | 39F | 39G — no 36G / 38F / 40G
        "2017": ["37R", "38K", "39F", "39G"],
        // Brochure DISDISLXE18B1: 37R | 38K | 39F | 39G — ISB 6.7 360 / 800, Onan 8.0 kW QD
        "2018": ["37R", "38K", "39F", "39G"],
        // Brochure 2019_Fleetwood_Discovery: 38F | 38K | 38N | 38W — no 36G / 40G / 36Q
        "2019": ["38F", "38K", "38N", "38W"],
        // Brochure 2020-Fleetwood-Discovery: 38F | 38K | 38N | 38W — 36Q arrives MY21
        "2020": ["38F", "38K", "38N", "38W"],
        // Brochure 2021-Fleetwood-Discovery: 36Q | 38F | 38K | 38N | 38W
        "2021": ["36Q", "38F", "38K", "38N", "38W"],
        // Brochure 2022-Fleetwood-Discovery / DISCOVERY22: 36Q | 38K | 38N | 38W — 38F dropped
        "2022": ["36Q", "38K", "38N", "38W"],
        // OEM 2023 Discovery: 36Q | 38K | 38N | 38W (fleetwoodrv.com/models/discovery)
        "2023": ["36Q", "38K", "38N", "38W"],
        // Brochure DISCOVERY24F1 / camperreport: MY24 streamlined to 38N | 38W only
        "2024": ["38N", "38W"],
        // OEM MY25–26 Discovery: 38N | 38W (fleetwoodrv.com/models/2025-discovery, 2026-discovery)
        "2025": ["38N", "38W"],
        "2026": ["38N", "38W"]
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
      description: "Fleetwood Discovery (regular) — Freightliner XC with Cummins B6.7 / ISB ~360 hp. NOT the 8.9 ISL and NOT Discovery LXE. MY17–18 OEM: 37R / 38K / 39F / 39G (ISB 360 / 800, Onan 8.0 kW QD).",
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
          to: 2018,
          engine: "Cummins ISB 6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner XCM Series",
          transmission: "Allison 3000 MH 6-Speed",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "MY17/MY18 Discovery brochures: ISB 6.7 360 / 800, Freightliner XCM, Allison 3000. Plans 37R | 38K | 39F | 39G. Onan 8.0 kW QD. NOT LXE / NOT ISL9."
        },
        {
          from: 2019,
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
      floorplans: ["36HQ", "38K", "39F", "40D", "40E", "40G", "40M", "40X", "44H", "44B", "44S"],
      floorplansByYear: {
        "2012": ["40G", "40M", "44H"],
        "2013": ["40G", "40M", "44H"],
        "2014": ["40G", "40M", "44H"],
        "2015": ["40G", "40M", "44H"],
        "2016": ["40G", "40M", "44H"],
        // RVUSA 2017 Discovery LXE: 40D | 40E | 40G | 40X — no 40M / 44H this year
        "2017": ["40D", "40E", "40G", "40X"],
        // Brochure DISDISLXE18B1 LXE: 38K | 39F | 40D | 40E | 40G | 40X | 44H — no 40M
        "2018": ["38K", "39F", "40D", "40E", "40G", "40X", "44H"],
        // Brochure 2019_Fleetwood_Discovery LXE: 40D | 40G | 40M | 44B | 44H
        "2019": ["40D", "40G", "40M", "44B", "44H"],
        // Brochure 2020-Fleetwood-Discovery-LXE: 40D | 40G | 40M | 44B | 44H
        "2020": ["40D", "40G", "40M", "44B", "44H"],
        // OEM MY21 LXE (DiscoveryLXE_FleetwoodRV_MY21 / RVUSA 2021 LXE): 36HQ | 40D | 40G | 40M | 44B | 44H | 44S
        "2021": ["36HQ", "40D", "40G", "40M", "44B", "44H", "44S"],
        // OEM MY22 LXE page + salessheet_FW_MY22_DISCOVERY-LXE: 36HQ | 40G | 40M | 44B | 44S — 40D / 44H dropped
        "2022": ["36HQ", "40G", "40M", "44B", "44S"],
        // OEM 2023 LXE: 36HQ | 40G | 40M | 44B | 44S (fleetwoodrv.com/models/2023-discovery-lxe)
        "2023": ["36HQ", "40G", "40M", "44B", "44S"],
        // Brochure LXE24F1: 40G | 40M | 44B | 44S — 36HQ dropped, no 44H
        "2024": ["40G", "40M", "44B", "44S"],
        "2025": ["40G", "44H"],
        // OEM MY26 Discovery LXE: 40G | 40M | 44B | 44S (DiscoveryLXE_SalesSheets_MY26)
        "2026": ["40G", "40M", "44B", "44S"]
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
      description: "Fleetwood Discovery LXE — high-line diesel above regular Discovery. MY17: 40D / 40E / 40G / 40X (ISL9 380). MY18: 38K / 39F (ISB 360) / 40D / 40E / 40G / 40X (ISL9 380) / 44H (ISL9 450). MY19–20: 40D / 40G / 40M / 44B / 44H. MY21 adds 36HQ / 44S; MY22 drops 40D / 44H. Not a single invented HP.",
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
          to: 2016,
          engine: "Cummins ISL / L9 450HP",
          horsepower: 450,
          chassis: "Freightliner XC"
        },
        {
          from: 2017,
          to: 2018,
          engine: "Cummins ISB 6.7 360HP (38K/39F MY18) / ISL9 380HP (40-ft) / ISL9 450HP (44H MY18)",
          horsepower: 0,
          chassis: "Freightliner Custom Chassis XCM",
          transmission: "Allison 3000 MH 6-Speed",
          generator: "Onan 8.0 kW Quiet Diesel",
          notes: "MY17 RVUSA LXE: 40D/40E/40G/40X = ISL9 380 / 1,150. MY18 DISDISLXE18B1: 38K/39F = ISB 360 / 800; 40D/40E/40G/40X = ISL9 380 / 1,150; 44H = ISL9 450 / 1,250. No 40M."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins ISL 9L 380HP (40D/40G/40M) / 450HP (44B/44H)",
          horsepower: 0,
          chassis: "Freightliner Custom Chassis XCM",
          transmission: "Allison 3000 MH 6-Speed",
          generator: "Onan 8 kW Quiet Diesel",
          notes: "MY19/MY20 LXE brochures: 40D/40G/40M = ISL 9L 380 / 1,150; 44B/44H = ISL 9L 450 / 1,250. Plans 40D | 40G | 40M | 44B | 44H."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins L9 380HP / 450HP (by floorplan)",
          horsepower: 0,
          chassis: "Freightliner Custom Chassis XCM",
          transmission: "Allison 3000 MH 6-Speed",
          notes: "MY21 LXE brochure: 36HQ/40D/40G/40M = L9 380 / 1,150; 44B/44H/44S = L9 450 / 1,250. MY22 same split on remaining plans."
        },
        {
          from: 2023,
          to: 2026,
          engine: "Cummins L9 380HP / 450HP (by floorplan)",
          horsepower: 0,
          chassis: "Freightliner Custom Chassis XCM",
          notes: "MY26 LXE sheet: 40G/40M = L9 380 / 1,150; 44B/44S = L9 450 / 1,250 — confirm plan"
        }
      ]
    },
    Frontier: {
      type: "Class A Diesel",
      floorplans: ["34GT", "36SS", "33TL", "37S", "38RT"],
      floorplansByYear: {
        // OEM debut MY22 (2022-Fleetwood-Frontier / fleetwoodrv.com): 34GT | 36SS — all-new for 2022
        "2022": ["34GT", "36SS"],
        // OEM 2023–25: 34GT | 36SS (fleetwoodrv.com/models/frontier, 2024-frontier)
        "2023": ["34GT", "36SS"],
        "2024": ["34GT", "36SS"],
        "2025": ["34GT", "36SS"],
        "2026": ["33TL", "37S", "38RT"]
      },
      lengthRange: [33, 39],
      weightRange: [28000, 36000],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [380000, 450000],
      engine: "Cummins diesel 340HP",
      horsepower: 340,
      torqueLbFt: 700,
      chassis: "Freightliner Custom Chassis XCR",
      transmission: "Allison (confirm series)",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      generator: "Onan diesel (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2022,
      description: "Fleetwood Frontier — diesel Class A. OEM debut MY22–25: 34GT / 36SS; MY26: 33TL / 37S / 38RT. 340 HP / 700 lb-ft, Freightliner XCR, 10,000-lb hitch. No 2021 Frontier page.",
      powertrainByYear: [
        { from: 2022, to: 2026, engine: "Cummins diesel 340HP", horsepower: 340, torqueLbFt: 700, chassis: "Freightliner Custom Chassis XCR", towingCapacity: 10000, notes: "2022-Fleetwood-Frontier: Cummins 6.7 340/700, Allison 2500, raised-rail. No GTX in MY22." }
      ]
    },
    "Frontier GTX": {
      type: "Class A Diesel",
      floorplans: ["37RT", "39TA"],
      floorplansByYear: {
        // Debut MY23 (37RT / 39TA); GTX24F1 + OEM 2024/2025 pages same two plans
        "2023": ["37RT", "39TA"],
        "2024": ["37RT", "39TA"],
        "2025": ["37RT", "39TA"]
      },
      lengthRange: [37, 39],
      weightRange: [30000, 38000],
      slideouts: 3,
      sleeps: 6,
      msrpRange: [420000, 480000],
      engine: "Cummins B6.7 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner Custom Chassis XCR",
      transmission: "Allison 3000 MH 6-speed",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      generator: "Onan diesel (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2023,
      yearEnd: 2025,
      description: "Fleetwood Frontier GTX — OEM MY23–25 (37RT / 39TA). Cummins 6.7 360/800, Allison 3000 MH, Freightliner XCR. No MY26/27 GTX page.",
      powertrainByYear: [
        { from: 2023, to: 2025, engine: "Cummins B6.7 360HP", horsepower: 360, torqueLbFt: 800, chassis: "Freightliner Custom Chassis XCR", transmission: "Allison 3000 MH 6-speed" }
      ]
    },
    Palisade: {
      type: "Class A Diesel",
      floorplans: ["40H", "45CS", "45DS", "45FS"],
      floorplansByYear: {
        "2025": ["45CS", "45DS", "45FS"],
        "2026": ["40H", "45CS", "45DS", "45FS"]
      },
      lengthRange: [40, 45],
      weightRange: [40000, 50000],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [620000, 750000],
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Freightliner Custom Chassis XCM",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      generator: "Onan diesel (confirm kW)",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2025,
      description: "Fleetwood Palisade — flagship diesel. MY25 45CS/45DS/45FS; MY26 adds 40H. OEM: 450 HP / 1,250 lb-ft, Freightliner XCM, 15,000-lb hitch.",
      powertrainByYear: [
        { from: 2025, to: 2026, engine: "Cummins L9 450HP", horsepower: 450, torqueLbFt: 1250, chassis: "Freightliner Custom Chassis XCM", towingCapacity: 15000 }
      ]
    },
    Bounder: {
      type: "Class A Gas",
      floorplans: ["33C", "34T", "35GL", "35K", "35P", "36H", "36F", "36FP"],
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
        // RVUSA 2017 Bounder spec pages: 33C | 34T | 35K | 35P | 36H — Triton V10 320/460
        "2017": ["33C", "34T", "35K", "35P", "36H"],
        // Brochure BOUNDER18B1: 33C | 35K | 35P | 36H — 34T dropped
        "2018": ["33C", "35K", "35P", "36H"],
        // Brochure 2019 Bounder (Empire RV / fleetwoodrv.com 2019-bounder-brochure): 33C | 35K | 35P | 36F | 36FP — no 36H
        "2019": ["33C", "35K", "35P", "36F", "36FP"],
        // Brochure 2020-Fleetwood-Bounder: 33C | 35K | 35P | 36F | 36FP — no 36H
        "2020": ["33C", "35K", "35P", "36F", "36FP"],
        // Brochure 2021-Fleetwood-Bounder / Bounder_FleetwoodRV_MY21: 33C | 35K | 35P | 36F — no 36H
        "2021": ["33C", "35K", "35P", "36F"],
        // Brochure 2022-Fleetwood-Bounder / OEM 2022 Bounder page: 33C | 35GL NEW | 35K | 36F — 35P dropped
        "2022": ["33C", "35GL", "35K", "36F"],
        // BOUNDER23F1 / BOUNDER24F1: 33C | 35GL | 35K | 36F — no 36H
        "2023": ["33C", "35GL", "35K", "36F"],
        "2024": ["33C", "35GL", "35K", "36F"],
        // OEM MY25–26 Bounder: 33C | 35GL | 35K | 36F — no 33P (Bounder_SalesSheets_MY26)
        "2025": ["33C", "35GL", "35K", "36F"],
        "2026": ["33C", "35GL", "35K", "36F"]
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
      engine: "Ford 7.3L V8 335HP / Triton V10 (by year)",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 1985,
      description: "Fleetwood Bounder — classic gas Class A. MY17: 33C / 34T / 35K / 35P / 36H; MY18: 33C / 35K / 35P / 36H on Triton V10 320/460 (not 7.3). MY19–20: 33C / 35K / 35P / 36F / 36FP. MY21: 33C / 35K / 35P / 36F; MY22 adds 35GL and drops 35P. Ford 7.3 is 350/468 in MY21–23 and 335/468 from MY24.",
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
          to: 2016,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "2015–2016 walk-back is the next slice — do not invent MY16 plans or gen kW"
        },
        {
          from: 2017,
          to: 2018,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "BOUNDER18B1 / RVUSA 2017 Bounder: 6.8L Triton V10 320 HP @ 3,900 / 460 lb-ft @ 3,000. Not 7.3. Gen kW is option-band on MY17 (7.0 kW LX pkg) — do not invent a single kW."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          generator: "Onan 5.5 kW gas",
          notes: "Bounder MY19/MY20 brochures: 6.8L Triton V10 320 HP @ 3,900 / 460 lb-ft @ 3,000. Onan 5.5 kW. Not the later 7.3 Godzilla."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          generator: "Onan 5.5 kW gas",
          notes: "Bounder MY21/MY22 brochures: 7.3 350 HP @ 3,900 / 468 lb-ft @ 3,000. Onan 5.5 kW gas."
        },
        {
          from: 2023,
          to: 2023,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          generator: "Onan 5.5 kW gas",
          notes: "BOUNDER23F1 / OEM 2023 Bounder page: 350 HP / 468 lb-ft — not the later 335 recert"
        },
        {
          from: 2024,
          to: 2026,
          engine: "Ford 7.3L V8 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          generator: "Onan 5.5 kW gas",
          notes: "BOUNDER24F1: 335 HP / 468 lb-ft F53 — not E-450 325/450"
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
        // Last OEM Bounder Classic brochure is MY2015 (2015_bdr_b). RVUSA lists 2015 only — no 2021–2022 Classic.
        "2015": ["33C", "35K"]
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
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2015,
      description: "Fleetwood Bounder Classic — value gas Class A. Last OEM brochure is MY2015 (shared Bounder/Classic 2015_bdr_b). No 2021–2022 Classic page — yearEnd 2015, not 2022.",
      powertrainByYear: [
        {
          from: 2010,
          to: 2015,
          engine: "Ford Triton V10 6.8L ~305–362HP",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "Last OEM Classic year 2015 — Triton V10. No 7.3 / no 2021–2022 Classic."
        }
      ]
    },
    Southwind: {
      type: "Class A Gas",
      floorplans: ["32VS", "34A", "34C", "35K", "36L", "36P", "36GL", "37F", "37FP", "37H"],
      floorplansByYear: {
        // Brochure SW17F1: 32VS | 34A | 36L — Triton V10 320/460
        "2017": ["32VS", "34A", "36L"],
        // Brochure SW18B1: 34C | 35K | 36P | 37H — 32VS / 34A / 36L dropped
        "2018": ["34C", "35K", "36P", "37H"],
        // Brochure 2019 Southwind (fleetwoodrv.com 1555358752): 34C | 35K | 36P | 37F | 37FP
        "2019": ["34C", "35K", "36P", "37F", "37FP"],
        // Brochure 2020-Fleetwood-Southwind: 34C | 35K | 36P | 37F | 37FP
        "2020": ["34C", "35K", "36P", "37F", "37FP"],
        // Brochure 2021-Fleetwood-Southwind: 34C | 35K | 36P | 37F
        "2021": ["34C", "35K", "36P", "37F"],
        // OEM MY22 Southwind brochure: 34C | 35K | 36GL NEW | 37F — 36P dropped
        "2022": ["34C", "35K", "36GL", "37F"],
        "2023": ["34C", "35K", "36GL", "37F"]
      },
      lengthRange: [34, 39],
      weightRange: [16000, 22000],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [180000, 260000],
      engine: "Ford 7.3L V8 350HP",
      horsepower: 350,
      torqueLbFt: 468,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2017,
      yearEnd: 2023,
      description: "Fleetwood Southwind — MY17: 32VS / 34A / 36L; MY18: 34C / 35K / 36P / 37H on Triton V10 320/460. MY19–20: 34C / 35K / 36P / 37F / 37FP. MY21: 34C / 35K / 36P / 37F; MY22–23: 34C / 35K / 36GL / 37F. Ford 7.3 is 350/468 in MY21–23. No 2024 page. Years before 2017 not expanded in this pass.",
      powertrainByYear: [
        { from: 2017, to: 2018, engine: "Ford Triton V10 6.8L 320HP", horsepower: 320, torqueLbFt: 460, chassis: "Ford F53", notes: "SW17F1 / SW18B1 / RVUSA 2017 Southwind: 6.8L Triton V10 320/460. Not 7.3. Do not invent a single gen kW." },
        { from: 2019, to: 2020, engine: "Ford Triton V10 6.8L 320HP", horsepower: 320, torqueLbFt: 460, chassis: "Ford F53", generator: "Onan 5.5 kW gas", notes: "Southwind MY19/MY20 brochures: 6.8L Triton V10 320/460. Onan 5.5 kW std (7.0 kW opt). Not 7.3." },
        { from: 2021, to: 2023, engine: "Ford 7.3L V8 350HP", horsepower: 350, torqueLbFt: 468, chassis: "Ford F53", generator: "Onan 5.5 kW gas", notes: "Southwind MY21 brochure: 7.3 350/468, Onan 5.5 kW std (7.0 kW opt). MY22 brochure same 350/468. Sibling MY23 F53 7.3 350/468." }
      ]
    },
    "Pace Arrow": {
      type: "Class A Gas",
      floorplans: ["33D", "35R", "35E", "35M", "35QS", "35RB", "35S", "36U", "35BP"],
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
        // Brochure PAPALXE17B1: diesel 33D | 35E | 35M | 36U — not F53 gas, not 35R
        "2017": ["33D", "35E", "35M", "36U"],
        // Brochure 2018 Pace Arrow + PAPALXE17B1 carryover: diesel 33D | 35E | 35M | 36U
        "2018": ["33D", "35E", "35M", "36U"],
        // Brochure 2019 Pace Arrow (interactcp 20190424): diesel 33D | 35E | 35QS | 36U — not F53 gas, not 35R
        "2019": ["33D", "35E", "35QS", "36U"],
        // Brochure 2020-Fleetwood-Pace-Arrow: diesel 33D | 35QS | 35RB | 35S | 36U — 35E dropped
        "2020": ["33D", "35QS", "35RB", "35S", "36U"],
        // Brochure 2021-Fleetwood-Pace-Arrow: diesel 33D | 35QS | 35RB | 35S | 36U — not F53 gas, not 35R
        "2021": ["33D", "35QS", "35RB", "35S", "36U"],
        // OEM 2022 Pace Arrow page / PACE ARROW MY22: diesel 33D | 36U only
        "2022": ["33D", "36U"],
        // OEM 2023 Pace Arrow (last listed MY): 33D | 35BP | 36U
        "2023": ["33D", "35BP", "36U"]
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
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2023,
      description: "Fleetwood Pace Arrow — F53 gas through MY16 catalog years (2015–2016 walk-back next). MY17–23 are diesel on Freightliner XCS (not F53): MY17–18 33D / 35E / 35M / 36U; MY19 33D / 35E / 35QS / 36U; MY20–21 33D / 35QS / 35RB / 35S / 36U; MY22 33D / 36U; MY23 33D / 35BP / 36U. ISB 300 (33D) / 340 (other plans). No 2024 page.",
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
          to: 2016,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2015–2016 walk-back is the next slice — do not invent MY16 fuel/plans"
        },
        {
          from: 2017,
          to: 2018,
          engine: "Cummins ISB 6.7 300HP (33D) / 340HP (35E/35M/36U)",
          horsepower: 0,
          chassis: "Freightliner XCS",
          generator: "Onan 6.0 kW Quiet Diesel",
          towingCapacity: 10000,
          notes: "PAPALXE17B1 / 2018 Pace Arrow brochure: diesel, not F53 gas. 33D = 300/660 Allison 2100; 35E/35M/36U = 340/700 Allison 2500. Onan 6.0 kW QD."
        },
        {
          from: 2019,
          to: 2022,
          engine: "Cummins ISB 6.7 300HP (33D) / 340HP (other plans)",
          horsepower: 0,
          chassis: "Freightliner XCS",
          generator: "Onan 6.0 kW Quiet Diesel",
          towingCapacity: 10000,
          notes: "MY19 Pace Arrow brochure: diesel 33D = 300/660 Allison 2100; 35E/35QS/36U = 340/700 Allison 2500. MY20 adds 35RB/35S, drops 35E. MY21 keeps five diesel plans; MY22 33D / 36U. Not F53 gas."
        },
        {
          from: 2023,
          to: 2023,
          engine: "Cummins ISB 6.7 300HP (33D) / 340HP (35BP, 36U)",
          horsepower: 0,
          chassis: "Freightliner XCS",
          transmission: "Allison 2100 MH 6-speed",
          generator: "Onan diesel (confirm kW)",
          towingCapacity: 10000,
          notes: "PACEARROW23F1 — Class A diesel final year. 33D = 300 HP / 660 lb-ft; 35BP/36U = 340 HP / 700 lb-ft. Not F53 gas."
        }
      ]
    },
    Storm: {
      type: "Class A Gas",
      floorplans: ["28F", "32V", "36F", "32A", "34S", "36D"],
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
        // Brochure ST17B1: 32A | 34S | 36D | 36F — Triton V10 320. No 28F / 32V.
        "2017": ["32A", "34S", "36D", "36F"],
        // Brochure 2018 Storm + ST17B1 carryover: 32A | 34S | 36D | 36F. Final Storm MY.
        "2018": ["32A", "34S", "36D", "36F"]
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
      yearEnd: 2018,
      description: "Fleetwood Storm — gas Class A on F53. MY17–18 OEM: 32A / 34S / 36D / 36F on Triton V10 320/460. Last catalog year 2018 (not a current Fleetwood line).",
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
          to: 2016,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2015–2016 walk-back is the next slice — do not invent MY16 Storm plans"
        },
        {
          from: 2017,
          to: 2018,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "ST17B1 / 2018 Storm brochure: 6.8L Triton V10 320 HP. Plans 32A | 34S | 36D | 36F. Do not invent a single gen kW."
        }
      ]
    },
    Flair: {
      type: "Class A Gas",
      floorplans: ["26D", "28A", "29M", "30P", "30U", "31A", "31E", "32S", "32N", "33B6", "34J", "35R"],
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
        // Brochure FLR17F1: 26D | 30P | 31A | 31E — no 28A / 30U / 32S (those are later / LXE)
        "2017": ["26D", "30P", "31A", "31E"],
        // Brochure FLRFLRLXE18B1 Flair (not LXE): 30P | 31A | 31E — 26D dropped
        "2018": ["30P", "31A", "31E"],
        // Brochure 2019_Fleetwood_Flair: 28A | 29M | 32S | 34J | 35R — no 30U
        "2019": ["28A", "29M", "32S", "34J", "35R"],
        // Brochure 2020-Fleetwood-Flair: 28A | 29M | 32S | 34J | 35R — no 30U
        "2020": ["28A", "29M", "32S", "34J", "35R"],
        // Brochure 2021-Fleetwood-Flair: 28A | 29M | 32S | 34J | 35R — no 30U
        "2021": ["28A", "29M", "32S", "34J", "35R"],
        // OEM MY22 Flair brochure: 28A | 29M | 32S | 34J | 35R (five plans). 34J/35R move to Flex in MY23.
        "2022": ["28A", "29M", "32S", "34J", "35R"],
        // OEM 2023 Flair + FLAIR24F1: 28A | 29M | 32N | 33B6 — no 30U
        "2023": ["28A", "29M", "32N", "33B6"],
        "2024": ["28A", "29M", "32N", "33B6"],
        // OEM MY25 Flair: 28A | 29M | 32N | 33B6 — MY26 swaps 32N → 32S
        "2025": ["28A", "29M", "32N", "33B6"],
        "2026": ["28A", "29M", "32S", "33B6"]
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
      engine: "Ford 7.3L V8 / Triton V10 (by year)",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 50,
      grayWater: 37,
      blackWater: 37,
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2008,
      description: "Fleetwood Flair — shorter gas Class A on F53. MY17: 26D / 30P / 31A / 31E; MY18: 30P / 31A / 31E on Triton V10 320/460 (Flair LXE 30U/31B/31W is a separate OEM trim, not added). MY19–22: 28A / 29M / 32S / 34J / 35R (no 30U). MY19–20 are Triton V10 320/460; MY21–23 Ford 7.3 is 350/468; MY24+ 335/468 (FLAIR24F1). MY23–25: 28A / 29M / 32N / 33B6.",
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
          to: 2016,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "2015–2016 walk-back is the next slice — do not invent MY16 Flair plans"
        },
        {
          from: 2017,
          to: 2018,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "FLR17F1 / FLRFLRLXE18B1: 6.8L Triton V10 320 HP @ 3,900 / 460 lb-ft. Onan 4.0 kW std / 5.5 kW opt — do not invent a single kW. Not 7.3."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Ford Triton V10 6.8L 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          notes: "Flair MY19/MY20 brochures: 6.8L Triton V10 320 HP @ 3,900 / 460 lb-ft. Gen kW varies by plan (4.0 / 5.5) — do not invent a single kW. Not 7.3."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "Flair MY21/MY22 brochures: 7.3 350 HP @ 3,900 / 468 lb-ft. Gen kW varies by plan — do not invent a single kW."
        },
        {
          from: 2023,
          to: 2023,
          engine: "Ford 7.3L V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "Sibling MY23 F53 7.3 OEM rating 350/468 (Flex23F1 / Fortis 2023 page)"
        },
        {
          from: 2024,
          to: 2026,
          engine: "Ford 7.3L V8 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "FLAIR24F1: 335 HP / 468 lb-ft"
        }
      ]
    },
    Fortis: {
      type: "Class A Gas",
      floorplans: ["32RW", "33HB", "34MB", "36DB", "36T", "36Y"],
      floorplansByYear: {
        // Brochure 2020_Fleetwood_Fortis / RVUSA 2020 Fortis: 33HB | 34MB only (32RW / 36DB arrive MY21)
        "2020": ["33HB", "34MB"],
        // Brochure 2021-Fleetwood-Fortis + 2022-Fleetwood-Fortis: 32RW | 33HB | 34MB | 36DB — no 36Y yet
        "2021": ["32RW", "33HB", "34MB", "36DB"],
        "2022": ["32RW", "33HB", "34MB", "36DB"],
        // 2023 OEM page has five slots; RVUSA 2023 lists 32RW / 33HB / 34MB / 36DB / 36Y
        "2023": ["32RW", "33HB", "34MB", "36DB", "36Y"],
        // FORTIS24F1: 32RW | 33HB | 34MB | 36Y — no 36T, no 36DB
        "2024": ["32RW", "33HB", "34MB", "36Y"],
        // FORTIS25F1 (MY25): same four — 36T arrives MY26 (FORTIS26)
        "2025": ["32RW", "33HB", "34MB", "36Y"],
        "2026": ["32RW", "33HB", "34MB", "36T", "36Y"],
        "2027": ["32RW", "33HB", "34MB", "36T", "36Y"]
      },
      lengthRange: [34, 39],
      weightRange: [18000, 26000],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [220000, 280000],
      engine: "Ford 7.3L V8 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "Ford 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 100,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 80,
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2020,
      gvwrLbs: 26000,
      description: "Fleetwood Fortis — F53 gas Class A. OEM debut MY20: 33HB / 34MB on Triton V10 320/460 (no 32RW / 36DB yet). MY21–22: 32RW / 33HB / 34MB / 36DB; MY23 adds 36Y; MY24–25 drop 36DB; MY26–27 add 36T. Ford 7.3 is 350/468 in MY21–23 and 335/468 from MY24.",
      powertrainByYear: [
        { from: 2020, to: 2020, engine: "Ford Triton V10 6.8L 320HP", horsepower: 320, torqueLbFt: 460, chassis: "Ford F53", transmission: "Ford 6-speed automatic", towingCapacity: 8000, generator: "Onan 5.5 kW Quiet gas", notes: "Fortis MY20 brochure: 6.8L Triton V10 320/460, Onan 5.5 kW Quiet. Plans 33HB / 34MB only. Not 7.3." },
        { from: 2021, to: 2023, engine: "Ford 7.3L V8 350HP", horsepower: 350, torqueLbFt: 468, chassis: "Ford F53", transmission: "Ford 6-speed automatic", towingCapacity: 8000, generator: "Onan 5.5 kW Quiet gas", notes: "Fortis MY21 brochure: 7.3 350/468, Onan 5.5 kW Quiet. MY22 floorplan sheets same 350/468." },
        { from: 2024, to: 2027, engine: "Ford 7.3L V8 335HP", horsepower: 335, torqueLbFt: 468, chassis: "Ford F53", transmission: "Ford 6-speed automatic", towingCapacity: 8000, freshWater: 100, grayWater: 50, blackWater: 50, notes: "FORTIS24F1 / MY26 sheet: 335 HP / 468 lb-ft" }
      ]
    },
    Flex: {
      type: "Class A Gas",
      floorplans: ["32S", "34J", "35R"],
      floorplansByYear: {
        // FLEX23F1 + FLEX24F1 + OEM 2025: 32S | 34J | 35R
        "2023": ["32S", "34J", "35R"],
        "2024": ["32S", "34J", "35R"],
        "2025": ["32S", "34J", "35R"]
      },
      lengthRange: [32, 36],
      weightRange: [16000, 22000],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [190000, 240000],
      engine: "Ford 7.3L V8 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 8000,
      freshWater: 80,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan gas (confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2023,
      yearEnd: 2025,
      description: "Fleetwood Flex — OEM MY23–25 (32S / 34J / 35R). Ford 7.3 is 350/468 in MY23 (FLEX23F1) and 335/468 from MY24 (FLEX24F1). No MY26/27 Flex page.",
      powertrainByYear: [
        { from: 2023, to: 2023, engine: "Ford 7.3L V8 350HP", horsepower: 350, torqueLbFt: 468, chassis: "Ford F53", notes: "FLEX23F1: 350 HP @ 3,900 / 468 lb-ft @ 3,000" },
        { from: 2024, to: 2025, engine: "Ford 7.3L V8 335HP", horsepower: 335, torqueLbFt: 468, chassis: "Ford F53", notes: "FLEX24F1: 335 HP / 468 lb-ft" }
      ]
    },
    Jamboree: {
      type: "Class C",
      floorplans: ["25B", "29V", "31M"],
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
        "2016": ["25B", "29V", "31M"]
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
      engine: "Ford Triton V10 6.8L",
      horsepower: 305,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 4000W Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2016,
      gvwrLbs: 14500,
      description: "Fleetwood Jamboree — discontinued Ford cutaway Class C (last catalog year 2016). Current Fleetwood Class C is Altitude (gas) / Insight (diesel).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2016,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Final Jamboree years — Triton / 6.2 cutaway, not Godzilla"
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
        "2016": ["24K", "25G", "31M"]
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
      engine: "Ford Triton V10 6.8L",
      horsepower: 305,
      chassis: "Ford E-450",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.25,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 45,
      blackWater: 45,
      generator: "Onan 4000W Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2000,
      yearEnd: 2016,
      gvwrLbs: 14500,
      description: "Fleetwood Tioga — discontinued Ford cutaway Class C (last catalog year 2016). Current Fleetwood Class C is Altitude (gas) / Insight (diesel).",
      powertrainByYear: [
        {
          from: 2005,
          to: 2010,
          engine: "Ford V10 / 6.8L or 6.0L (by year)",
          horsepower: 305,
          chassis: "Ford E-450 / E-350",
          notes: "Pre-6.2 Ford cutaway Class C"
        },
        {
          from: 2011,
          to: 2016,
          engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "Final Tioga years — Triton / 6.2 cutaway, not Godzilla"
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
        "2016": ["25K", "31N"]
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
      engine: "Ford 6.8L V10 / 6.2L V8 (by year)",
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
      generator: "Onan 4000W Gas",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2010,
      yearEnd: 2016,
      description: "Fleetwood Tioga Ranger — value Class C. No OEM lineup after the Tioga family ended (~2016); later years omitted rather than guessed.",
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
          to: 2016,
          engine: "Ford 6.2L V8 / 6.8L V10 (by year)",
          horsepower: 305,
          chassis: "Ford E-450"
        }
      ]
    },
    Pulse: {
      type: "Class C",
      floorplans: ["24A", "24B", "24C", "24D", "24L"],
      floorplansByYear: {
        "2014": ["24A", "24D"],
        "2015": ["24A", "24D"],
        "2016": ["24A", "24D"],
        // No 2017 Pulse OEM brochure; RVUSA Pulse index skips 2017 (2010 → 2018)
        // Brochure PULSE18B1 floorplan page: 24A | 24B | 24C | 24D. RVUSA 2018 lists 24A / 24B / 24D.
        "2018": ["24A", "24B", "24C", "24D"],
        // RV Guide 2019 Pulse + RVUSA 2019 Pulse (2 plans): 24A | 24B — do not invent 24D / 24L
        "2019": ["24A", "24B"]
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
      generator: "Onan diesel (typ. Sprinter — confirm kW)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2014,
      yearEnd: 2019,
      description: "Fleetwood Pulse — discontinued Sprinter diesel Class C. No 2017 OEM page (RVUSA skips 2017). MY18 brochure: 24A / 24B / 24C / 24D on Sprinter 3.0 188/260. Last catalog year 2019 (24A / 24B per RV Guide / RVUSA). No 2020 Pulse page.",
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
          to: 2016,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter"
        },
        {
          from: 2018,
          to: 2019,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel 188HP",
          horsepower: 188,
          torqueLbFt: 260,
          chassis: "Mercedes-Benz Sprinter",
          transmission: "Mercedes-Benz 5-Speed Automatic",
          notes: "PULSE18B1: 3.0L 188 HP @ 3,800 / 260 lb-ft. Plans MY18 24A/24B/24C/24D; MY19 24A/24B. No 2017 OEM page."
        }
      ]
    },
    Altitude: {
      type: "Class C",
      floorplans: ["27U", "29F", "29H", "31W"],
      floorplansByYear: {
        // MY25 OEM (Altitude25F1): 27U | 29F | 31W — no 29H
        "2025": ["27U", "29F", "31W"],
        // MY26–27 OEM: 27U | 29F | 29H | 31W (29H added MY26)
        "2026": ["27U", "29F", "29H", "31W"],
        "2027": ["27U", "29F", "29H", "31W"]
      },
      lengthRange: [29, 33],
      weightRange: [12000, 14500],
      slideouts: 1,
      sleeps: 6,
      msrpRange: [145000, 185000],
      engine: "Ford 7.3L V8 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-450",
      transmission: "Electronic 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 7500,
      freshWater: 50,
      grayWater: 36,
      blackWater: 36,
      fuelCapacityGal: 55,
      generator: "Onan 4000W Quiet gas",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2025,
      gvwrLbs: 14500,
      overallLengthIn: 354,
      description: "Fleetwood Altitude — Ford E-450 Class C gas. Brochure 7.3L 325 HP / 450 lb-ft (not F53 335/468). MY25 27U/29F/31W; 29H added MY26. Tires LT225/75R16E, 1×15k A/C, 50A, Onan 4000W Quiet std.",
      powertrainByYear: [
        {
          from: 2025,
          to: 2027,
          engine: "Ford 7.3L V8 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-450",
          transmission: "Electronic 6-speed automatic",
          towingCapacity: 7500,
          gvwrLbs: 14500,
          fuelCapacityGal: 55,
          freshWater: 50,
          generator: "Onan 4000W Quiet gas",
          notes: "E-450 cutaway — 325/450, not bus F53 335/468"
        }
      ]
    },
    Insight: {
      type: "Class C",
      floorplans: ["25M", "25Q", "25T"],
      floorplansByYear: {
        "2025": ["25M", "25Q", "25T"],
        "2026": ["25M", "25Q", "25T"]
      },
      lengthRange: [25, 26],
      weightRange: [9000, 11030],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [200000, 250000],
      engine: "Mercedes-Benz 2.0L 4-cyl turbo diesel 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 3500XD",
      transmission: "9-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 4200,
      fuelCapacityGal: 24.5,
      generator: "3.6 kW LP w/ auto start",
      awningLength: 14,
      ceilingHeight: 80,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2025,
      gvwrLbs: 11030,
      overallLengthIn: 306,
      description: "Fleetwood Insight — Sprinter 3500XD Class C diesel. OEM MY25–26: 25M / 25Q / 25T. Brochure: 211 HP / 332 lb-ft, 9-speed, LT215/85SR16, 13,500 BTU A/C w/ heat pump, 3.6 kW LP gen, 30A. Gen Delete option MY26.",
      powertrainByYear: [
        {
          from: 2025,
          to: 2026,
          engine: "Mercedes-Benz 2.0L 4-cyl turbo diesel 211HP",
          horsepower: 211,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz Sprinter 3500XD",
          transmission: "9-speed automatic",
          towingCapacity: 4200,
          generator: "3.6 kW LP w/ auto start",
          notes: "Insight sales sheet MY26 — do not use E-450 325/450 or F53 tires"
        }
      ]
    },
    "Altitude FS550": {
      type: "Super C",
      floorplans: ["30SB", "30WM", "32AW"],
      floorplansByYear: {
        "2026": ["30SB", "30WM", "32AW"],
        "2027": ["30SB", "30WM", "32AW"]
      },
      lengthRange: [30, 33],
      weightRange: [16000, 19500],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [210000, 260000],
      engine: "Ford 7.3L V8 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F-550 (4x2 or 4x4)",
      transmission: "Ford 10-speed / confirm brochure",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      generator: "Onan gas (confirm kW; 5.5 kW with dual A/C option)",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2026,
      description: "Fleetwood Altitude FS550 — Super C gas on Ford F-550. MY26–27 OEM: 30SB / 30WM / 32AW. 7.3 335 HP / 468 lb-ft. Separate from E-450 Altitude Class C.",
      powertrainByYear: [
        {
          from: 2026,
          to: 2027,
          engine: "Ford 7.3L V8 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F-550 (4x2 or 4x4)",
          notes: "Super C F-550 — not E-450 Altitude 325/450"
        }
      ]
    },
    "Altitude FS600D": {
      type: "Super C",
      floorplans: ["36CS", "36FW"],
      floorplansByYear: {
        "2026": ["36CS", "36FW"],
        "2027": ["36CS", "36FW"]
      },
      lengthRange: [36, 37],
      weightRange: [18000, 22000],
      slideouts: 2,
      sleeps: 6,
      msrpRange: [290000, 360000],
      engine: "Ford 6.7L Power Stroke 330HP",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F-600 4x4",
      transmission: "10-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 15000,
      generator: "Onan 6.0 kW + 2000W inverter",
      awningLength: 16,
      ceilingHeight: 82,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2026,
      description: "Fleetwood Altitude FS600D — Super C diesel. MY26–27 OEM: 36CS / 36FW on Ford F-600 4x4, 6.7L Power Stroke 330 HP / 950 lb-ft, 10-speed. Dual 15k A/C std.",
      powertrainByYear: [
        {
          from: 2026,
          to: 2027,
          engine: "Ford 6.7L Power Stroke 330HP",
          horsepower: 330,
          torqueLbFt: 950,
          chassis: "Ford F-600 4x4",
          transmission: "10-speed automatic",
          generator: "Onan 6.0 kW + 2000W inverter",
          notes: "Diesel Super C — not E-450 Altitude and not FS550 gas"
        }
      ]
    },
    Xcursion: {
      type: "Class B",
      floorplans: ["AL2", "SL2", "SL2E", "SL4E"],
      floorplansByYear: {
        // OEM / RVUSA 2024 only: AL2 | SL2 | SL2E | SL4E — 19CB/24CB were invented
        "2024": ["AL2", "SL2", "SL2E", "SL4E"]
      },
      lengthRange: [
        19,
        25
      ],
      weightRange: [
        8500,
        11030
      ],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [
        149000,
        209000
      ],
      engine: "Mercedes-Benz 2.0L I4 turbodiesel 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 2500 / 3500",
      transmission: "9-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 19,
      grayWater: 22,
      blackWater: 14,
      fuelCapacityGal: 24.5,
      generator: "Optional (confirm brochure)",
      awningLength: 14,
      ceilingHeight: 74,
      founded: 1950,
      warrantyYears: 1,
      yearStart: 2024,
      yearEnd: 2024,
      description: "Fleetwood Xcursion — 2024-only Sprinter Class B (AL2 / SL2 / SL2E / SL4E). Brochure: 211 HP / 332 lb-ft, 9-speed, 30A. 2025 leftover-inventory rebate was still MY24 — no 2025 OEM page.",
      powertrainByYear: [
        {
          from: 2024,
          to: 2024,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel 211HP",
          horsepower: 211,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz Sprinter 2500 / 3500",
          transmission: "9-speed automatic",
          generator: "Optional (confirm brochure)",
          notes: "2024 Xcursion brochure — Sprinter diesel, not a gas ProMaster and not invented 19CB/24CB"
        }
      ]
    }
  },
  Jayco: {
    Precept: {
      type: "Class A Gas",
      floorplans: ["31UL", "35S", "36T", "34G", "36A", "29V"],
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
        "2026": ["31UL", "34G", "36A", "29V"]
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
      floorplans: ["26X", "29F", "31V", "27A", "28H"],
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
        "2026": ["26X", "29F", "27A", "28H"]
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
      floorplans: ["37K", "38N", "39T", "39Z", "39F", "39Y"],
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
        "2026": ["37K", "38N", "39F", "39Y"]
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
    Seneca: {
      type: "Super C",
      floorplans: ["37K", "37L", "37M", "37FS", "37HJ", "37TS", "37RB"],
      floorplansByYear: {
        "2014": ["37FS", "37HJ"],
        "2015": ["37FS", "37HJ"],
        "2016": ["37FS", "37HJ"],
        "2017": ["37FS", "37HJ", "37TS"],
        "2018": ["37FS", "37HJ", "37TS"],
        "2019": ["37FS", "37HJ", "37K", "37RB", "37TS"],
        "2020": ["37HJ", "37K", "37L", "37M", "37RB", "37TS"],
        "2021": ["37HJ", "37K", "37L", "37M", "37RB", "37TS"],
        "2022": ["37K", "37L", "37M"],
        "2023": ["37K", "37L", "37M"],
        "2024": ["37K", "37L", "37M"],
        "2025": ["37K", "37L", "37M"],
        "2026": ["37K", "37L", "37M"],
        "2027": ["37K", "37L", "37M"],
      },
      lengthRange: [39, 40],
      weightRange: [26000, 31000],
      slideouts: 3,
      sleeps: 9,
      msrpRange: [249000, 399000],
      engine: "Cummins ISB 6.7L 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner S2RV Plus",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 72,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 8.0 kW Quiet Diesel",
      awningLength: 20,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      yearEnd: 2027,
      description:
        "Jayco Seneca Super C — Freightliner S2RV Plus, Cummins ISB 6.7 360/800. Current layouts 37K (bath-and-a-half, sleeps 6), 37L (bunks, sleeps 9), 37M (opposing slides, sleeps 8). All ~39' 4\". Sister to Entegra Accolade.",
      powertrainByYear: [
        {
          from: 2014,
          to: 2017,
          engine: "Cummins ISB 6.7L diesel",
          horsepower: 300,
          torqueLbFt: 660,
          chassis: "Freightliner M2 Super C",
          notes: "Early Seneca Super C — Cummins ISB, not Ford Power Stroke.",
        },
        {
          from: 2018,
          to: 2027,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV Plus",
          transmission: "Allison 3000 MH",
          towingCapacity: 12000,
          fuelCapacityGal: 100,
          gvwrLbs: 31000,
          exteriorWidthIn: 101,
          exteriorHeightIn: 160,
          notes:
            "Jayco OEM: S2RV Plus · ISB 6.7 360 hp / 800 lb-ft · Allison 3000 MH · 100 gal · 12k hitch. Not a diesel pusher L9.",
        },
      ],
    },
    "Seneca Super C": {
      type: "Super C",
      floorplans: ["37K", "37L", "37M", "37FS", "37HJ", "37TS", "37RB"],
      floorplansByYear: {
        "2014": ["37FS", "37HJ"],
        "2015": ["37FS", "37HJ"],
        "2016": ["37FS", "37HJ"],
        "2017": ["37FS", "37HJ", "37TS"],
        "2018": ["37FS", "37HJ", "37TS"],
        "2019": ["37FS", "37HJ", "37K", "37RB", "37TS"],
        "2020": ["37HJ", "37K", "37L", "37M", "37RB", "37TS"],
        "2021": ["37HJ", "37K", "37L", "37M", "37RB", "37TS"],
        "2022": ["37K", "37L", "37M"],
        "2023": ["37K", "37L", "37M"],
        "2024": ["37K", "37L", "37M"],
        "2025": ["37K", "37L", "37M"],
        "2026": ["37K", "37L", "37M"],
        "2027": ["37K", "37L", "37M"],
      },
      lengthRange: [39, 40],
      weightRange: [26000, 31000],
      slideouts: 3,
      sleeps: 9,
      msrpRange: [249000, 399000],
      engine: "Cummins ISB 6.7L 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner S2RV Plus",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 72,
      grayWater: 50,
      blackWater: 50,
      fuelCapacityGal: 100,
      generator: "Onan 8.0 kW Quiet Diesel",
      awningLength: 20,
      ceilingHeight: 84,
      founded: 1968,
      warrantyYears: 2,
      yearStart: 2014,
      yearEnd: 2027,
      description:
        "Jayco Seneca Super C — same as Seneca. Current 37K / 37L / 37M.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2027,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV Plus",
          transmission: "Allison 3000 MH",
          towingCapacity: 12000,
          fuelCapacityGal: 100,
          gvwrLbs: 31000,
        },
      ],
    },
    Greyhawk: {
      type: "Class C",
      floorplans: ["29MV", "30X", "31F", "31FS", "32S", "26Y", "27U", "31MV"],
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
        "2026": ["29MV", "30X", "31F", "26Y", "27U", "31MV"]
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
      floorplans: ["22J", "26XD", "29XK", "31F", "24B", "26M", "31XL"],
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
        "2026": ["22J", "26XD", "29XK", "24B", "26M", "31XL"]
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
      floorplans: ["24K", "24L", "24N", "24R"],
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
        "2026": ["24K", "24L", "24R"]
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
      floorplans: ["24LP", "24KP", "20LT", "24L"],
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
        "2026": ["24LP", "20LT", "24L"]
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
      floorplans: ["7", "X213", "X23B", "27BHB", "20BH", "22BH", "24BH", "25BH"],
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
        "2026": ["X213", "X23B", "27BHB", "20BH", "22BH", "24BH", "25BH"]
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
      floorplans: ["26.5BHS", "28.5RSTS", "29.5BHDS", "265BHS", "273RK", "280RSOK"],
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
        "2026": ["26.5BHS", "28.5RSTS", "265BHS", "273RK", "280RSOK"]
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
      floorplans: ["377RLBH", "381DLQS", "387RDFS", "310RLTS", "315RLTS", "337RLTS", "382FLRB"],
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
        "2026": ["377RLBH", "381DLQS", "315RLTS", "337RLTS", "382FLRB"]
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
      floorplans: ["36FBTS", "38FLGS", "38FBRK", "36KPTS", "38FLSA", "38FLTS"],
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
        "2026": ["36FBTS", "38FLGS", "36KPTS", "38FLSA", "38FLTS"]
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
      floorplans: ["313T", "392T", "403T", "414T", "21QB", "26FB", "27BH", "28QB"],
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
        "2026": ["403T", "414T", "21QB", "26FB", "27BH", "28QB"]
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
      floorplans: ["161", "222", "273", "231RK", "310BHL"],
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
        "2026": ["222", "273", "231RK", "310BHL"]
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
      floorplans: ["3512", "4113", "4212", "355", "390"],
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
        "2026": ["4113", "4212", "355", "390"]
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
      floorplans: ["42G", "42R", "45A", "42Q", "42V", "42B", "42X", "45T"],
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
        "2026": ["42Q", "42V", "42B", "42X", "45T"]
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
      floorplans: ["45B", "45J", "45N", "42X", "45A", "45T"],
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
        "2026": ["45B", "45J", "42X", "45A", "45T"]
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
      floorplans: ["42G", "45A", "45B", "42C", "44Q"],
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
        "2026": ["45A", "45B", "42C", "44Q"]
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
      engine: "Cummins L9 450 std / X15 605 opt",
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
          chassis: "Spartan K3",
          notes: "L9 450 standard / X15 605 optional — HP and torque are option-band, not a locked 450 / 1,250. Confirm door sticker."
        },
        
      ]
    }
  },
  "Entegra Coach": {
    "Cornerstone": {
      type: "Class A Diesel",
      floorplans: ["45A", "45B", "45D", "45F", "45J", "45K", "45R", "45V", "45W", "45X", "45Y", "45Z"],
      floorplansByYear: {
        "2014": ["45B", "45W", "45Z"],
        "2015": ["45B", "45W", "45Z"],
        "2016": ["45B", "45W", "45Z"],
        // OEM MY17 Cornerstone year page + 2017 lineup brochure: 45A | 45B | 45J | 45K | 45W · ISX 600/1950 · K3
        "2017": ["45A", "45B", "45J", "45K", "45W"],
        // OEM MY18 Cornerstone year page + JENT 5591-01: 45A | 45B | 45F | 45W | 45X | 45Y · ISX 605/1950 · K3
        "2018": ["45A", "45B", "45F", "45W", "45X", "45Y"],
        // OEM MY19 Cornerstone year page: 45A | 45B | 45F | 45W | 45X | 45Y · X15 605/1950 · K3
        "2019": ["45A", "45B", "45F", "45W", "45X", "45Y"],
        // OEM MY20 Cornerstone year page: 45A | 45B | 45F | 45W | 45X | 45Y — no 45Z
        "2020": ["45A", "45B", "45F", "45W", "45X", "45Y"],
        // OEM MY21 Cornerstone year page: 45B | 45F | 45R | 45W | 45X | 45Y | 45Z · X15 605/1950 · K3
        "2021": ["45B", "45F", "45R", "45W", "45X", "45Y", "45Z"],
        // OEM MY22 Cornerstone year page + luxury-diesel brochure: 45B | 45D | 45F | 45R | 45W | 45Z
        "2022": ["45B", "45D", "45F", "45R", "45W", "45Z"],
        // OEM MY23 Cornerstone year page + brochure: 45B | 45D | 45R | 45W | 45Z
        "2023": ["45B", "45D", "45R", "45W", "45Z"],
        // OEM MY24 Cornerstone year page + brochure: 45B | 45D | 45R | 45W | 45Z — no 45A
        "2024": ["45B", "45D", "45R", "45W", "45Z"],
        // OEM MY25 Cornerstone brochure: 45B | 45D | 45R | 45W | 45Z — no 45A / 45V
        "2025": ["45B", "45D", "45R", "45W", "45Z"],
        // OEM 2026 Cornerstone year page: 45B | 45D | 45R | 45V | 45Z. Line ends MY2026 (Thor/Jayco → Tiffin).
        "2026": ["45B", "45D", "45R", "45V", "45Z"]
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
      towingCapacity: 20000,
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
      yearEnd: 2026,
      description: "Entegra Cornerstone — flagship diesel on Spartan K3 + Cummins X15 605 / 1,950, Allison 4000 MH, hitch 20k. SL chassis is an option — do not lock one chassis as only. Year-end 2026: no 2027 OEM diesel Class A page.",
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
          to: 2016,
          engine: "Cummins ISX 600HP class",
          horsepower: 600,
          chassis: "Spartan K3",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. Do not stamp 2017 ISX 600 or 2018 ISX 605 backward."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISX 15L 600HP",
          horsepower: 600,
          torqueLbFt: 1950,
          chassis: "Spartan K3 Raised Rail",
          transmission: "Allison 4000 MH 6-speed",
          towingCapacity: 20000,
          notes: "OEM MY17 Cornerstone year page (Wayback 2017-06-06) + 2017 Entegra Coach lineup brochure: ISX 600 / 1,950 · Spartan K3 · Allison 4000 MH · hitch 20k. Options print Cummins 15 liter ISX turbocharged 600HP 1,950 lb. ft."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins ISX 15L 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3 Raised Rail",
          transmission: "Allison 4000 MH 6-speed",
          towingCapacity: 20000,
          notes: "OEM MY18 Cornerstone year page (Wayback 2018-03-20) + JENT 5591-01 MY2018 Entegra Coach Brochure: ISX 605 / 1,950 · Spartan K3 · Allison 4000 MH · hitch 20k. Not the later X15 name."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3",
          transmission: "Allison 4000 MH",
          towingCapacity: 20000,
          notes: "OEM MY19–20 Cornerstone year page: X15 605 / 1,950 · Spartan K3 · Allison 4000 MH · hitch 20k"
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3",
          transmission: "Allison 4000 MH",
          towingCapacity: 20000,
          notes: "OEM MY21–22 Cornerstone year page / brochure: X15 605 / 1,950 · Spartan K3 · Allison 4000 MH · hitch 20k"
        },
        {
          from: 2023,
          to: 2026,
          engine: "Cummins X15 605HP",
          horsepower: 605,
          torqueLbFt: 1950,
          chassis: "Spartan K3",
          transmission: "Allison 4000 MH"
        },
        
      ]
    },
    "Anthem": {
      type: "Class A Diesel",
      floorplans: ["37K", "42DEQ", "42RBQ", "44A", "44B", "44D", "44DLQ", "44F", "44R", "44V", "44W", "44Z"],
      floorplansByYear: {
        "2014": ["42DEQ", "44B", "44W"],
        "2015": ["42DEQ", "44B", "44W"],
        "2016": ["42DEQ", "44B", "44W"],
        // OEM MY17 Anthem year page + 2017 lineup brochure: 42DEQ | 42RBQ | 44A | 44B | 44DLQ · ISL 450/1250 · K2
        "2017": ["42DEQ", "42RBQ", "44A", "44B", "44DLQ"],
        // OEM MY18 Anthem year page: 42DEQ | 42RBQ | 44A | 44B | 44F | 44W · ISL 450/1250 · K2 (year page includes 44W)
        "2018": ["42DEQ", "42RBQ", "44A", "44B", "44F", "44W"],
        // OEM MY19 Anthem year page: 42DEQ | 44A | 44B | 44F | 44W · L9 450/1250 · K2
        "2019": ["42DEQ", "44A", "44B", "44F", "44W"],
        // OEM MY20 Anthem year page: 42DEQ | 44A | 44B | 44F | 44W — no 44D
        "2020": ["42DEQ", "44A", "44B", "44F", "44W"],
        // OEM MY21 Anthem year page: 42DEQ | 44B | 44F | 44R | 44W | 44Z — no 44D
        "2021": ["42DEQ", "44B", "44F", "44R", "44W", "44Z"],
        // OEM MY22 Anthem year page + luxury-diesel brochure: 44B | 44D | 44F | 44R | 44W | 44Z
        "2022": ["44B", "44D", "44F", "44R", "44W", "44Z"],
        // OEM MY23 Anthem year page + brochure: 44B | 44D | 44R | 44W | 44Z — no 37K
        "2023": ["44B", "44D", "44R", "44W", "44Z"],
        // OEM MY24 Anthem year page + brochure: 37K | 44B | 44D | 44R | 44W | 44Z
        "2024": ["37K", "44B", "44D", "44R", "44W", "44Z"],
        // OEM MY25 Anthem brochure: 37K | 44B | 44D | 44R | 44W | 44Z
        "2025": ["37K", "44B", "44D", "44R", "44W", "44Z"],
        // OEM 2026 Anthem year page: 37K | 44B | 44D | 44R | 44V | 44Z
        "2026": ["37K", "44B", "44D", "44R", "44V", "44Z"]
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
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torqueLbFt: 1250,
      chassis: "Spartan K2",
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
      yearEnd: 2026,
      description: "Entegra Anthem — Spartan K2 diesel under Cornerstone. OEM MY25–26: L9 450 / 1,250 locked (not an L9/X12 band), Allison 3000 MH, hitch 15k (10k on 37K). Year-end 2026.",
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
          to: 2016,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Spartan K3",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. Do not stamp 2017–2018 ISL 450 backward as L9."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISL 8.9L 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2 Mountain Master",
          transmission: "Allison 3000 MH 6-speed",
          towingCapacity: 15000,
          notes: "OEM MY17 Anthem year page (Wayback 2017-06-06) + 2017 Entegra Coach lineup brochure: ISL 450 / 1,250 · Spartan K2 Mountain Master · hitch 15k. Not L9."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins ISL 8.9L 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH 6-speed",
          towingCapacity: 15000,
          notes: "OEM MY18 Anthem year page (Wayback 2018-03-20) + JENT 5591-01: ISL 450 / 1,250 · Spartan K2 · hitch 15k. Year page includes 44W (April 2018 brochure spec table omitted it). Not L9."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          towingCapacity: 15000,
          notes: "OEM MY19–20 Anthem year page: L9 450 / 1,250 · Spartan K2 · hitch 15k. Not an L9/X12 band."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          towingCapacity: 15000,
          notes: "OEM MY21–22 Anthem year page / brochure: L9 450 / 1,250 · Spartan K2 · hitch 15k. Not an L9/X12 band."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          notes: "OEM MY23–24 Anthem: L9 450 / 1,250 · Spartan K2 · hitch 15k. Do not copy MY25 10k-on-37K backward."
        },
        {
          from: 2025,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          notes: "OEM MY25–26 Anthem: L9 450 / 1,250 locked — hitch 15k (10k on 37K)"
        },
        
      ]
    },
    "Aspire": {
      type: "Class A Diesel",
      floorplans: ["38M", "38R", "40P", "42D", "42DEQ", "42RBQ", "44B", "44D", "44F", "44R", "44U", "44V", "44W", "44Z"],
      floorplansByYear: {
        "2015": ["38R", "42D", "44R"],
        "2016": ["38R", "42D", "44R"],
        // OEM MY17 Aspire year page: 38M | 40P | 42DEQ | 42RBQ | 44B | 44R | 44U | 44W · ISL 450/1250 · hitch 15k flat
        "2017": ["38M", "40P", "42DEQ", "42RBQ", "44B", "44R", "44U", "44W"],
        // OEM MY18 Aspire year page: same eight · ISL 450/1250 · hitch 15k (10k on 38M and 40P)
        "2018": ["38M", "40P", "42DEQ", "42RBQ", "44B", "44R", "44U", "44W"],
        // OEM MY19 Aspire year page: 38M | 40P | 42DEQ | 44B | 44R | 44W · L9 450/1250 · K2
        "2019": ["38M", "40P", "42DEQ", "44B", "44R", "44W"],
        // OEM MY20 Aspire year page: 38M | 40P | 42DEQ | 44B | 44F | 44R | 44W
        "2020": ["38M", "40P", "42DEQ", "44B", "44F", "44R", "44W"],
        // OEM MY21 Aspire year page: 38M | 40P | 42DEQ | 44B | 44F | 44R | 44W | 44Z · L9 450/1250 · K2
        "2021": ["38M", "40P", "42DEQ", "44B", "44F", "44R", "44W", "44Z"],
        // OEM MY22 Aspire year page: 40P | 44B | 44D | 44F | 44R | 44W | 44Z — 38M / 42DEQ dropped
        "2022": ["40P", "44B", "44D", "44F", "44R", "44W", "44Z"],
        // OEM MY23 Aspire brochure: 40P | 44B | 44D | 44R | 44W | 44Z
        "2023": ["40P", "44B", "44D", "44R", "44W", "44Z"],
        // OEM MY24 Aspire brochure: 40P | 44B | 44D | 44R | 44W | 44Z
        "2024": ["40P", "44B", "44D", "44R", "44W", "44Z"],
        // OEM MY25 Aspire brochure: 40P | 44B | 44D | 44R | 44W | 44Z
        "2025": ["40P", "44B", "44D", "44R", "44W", "44Z"],
        // OEM 2026 Aspire year page: 44B | 44D | 44R | 44V | 44Z — no 40P / 44W
        "2026": ["44B", "44D", "44R", "44V", "44Z"]
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
      chassis: "Spartan K2",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.7,
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
      yearStart: 2015,
      yearEnd: 2026,
      description: "Entegra Aspire — Spartan K2 diesel under Anthem. OEM MY25–26: L9 450 / 1,250, hitch 15k (10k on 40P). Year-end 2026.",
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
          to: 2016,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          chassis: "Spartan / Freightliner",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. Do not stamp 2017–2018 ISL 450 or the 2018 38M/40P 10k hitch backward."
        },
        {
          from: 2017,
          to: 2017,
          engine: "Cummins ISL 8.9L 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH 6-speed",
          towingCapacity: 15000,
          notes: "OEM MY17 Aspire year page (Wayback 2017-06-06) + 2017 lineup brochure: ISL 450 / 1,250 · Spartan K2 · hitch 15k on every plan. Do not copy the 2018 38M/40P 10k split backward. Not L9."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Cummins ISL 8.9L 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH 6-speed",
          towingCapacity: 15000,
          notes: "OEM MY18 Aspire year page (Wayback 2018-03-20) + JENT 5591-01: ISL 450 / 1,250 · Spartan K2 · hitch 15k (10k on 38M and 40P). Not L9."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          towingCapacity: 15000,
          notes: "OEM MY19–20 Aspire year page: L9 450 / 1,250 · Spartan K2 · hitch 15k (10k on 38M and 40P)"
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          towingCapacity: 15000,
          notes: "OEM MY21–22 Aspire year page / brochure: L9 450 / 1,250 · Spartan K2 · hitch 15k (10k on 38M and 40P)"
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          notes: "OEM MY23–24 Aspire: L9 450 / 1,250 · Spartan K2 · hitch 15k (10k on 40P)"
        },
        {
          from: 2025,
          to: 2026,
          engine: "Cummins L9 450HP",
          horsepower: 450,
          torqueLbFt: 1250,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          notes: "OEM MY25–26 Aspire: L9 450 / 1,250 — hitch 15k (10k on 40P)"
        },
        
      ]
    },
    "Reatta": {
      type: "Class A Diesel",
      floorplans: ["37K", "37MB", "39BH", "39T2"],
      floorplansByYear: {
        "2016": ["37K", "39BH"],
        // No OEM MY17 / MY18 Reatta year page — Spartan/Entegra PR (Jul 2018) unveiled all-new 2019 Reatta. Omit 2017–2018.
        // OEM MY19 Reatta year page: 37MB | 39BH | 39T2 · B6.7 360/800 · K1
        "2019": ["37MB", "39BH", "39T2"],
        // OEM MY20 Reatta year page: 37K | 39BH | 39T2 — 37MB is Dealer Stock Only
        "2020": ["37K", "39BH", "39T2"],
        // OEM MY21 Reatta year page: 37K | 39BH | 39T2 — no 39W / 37MB
        "2021": ["37K", "39BH", "39T2"],
        // OEM MY22 Reatta year page: 37K | 39BH | 39T2
        "2022": ["37K", "39BH", "39T2"],
        // OEM MY23 Reatta brochure: 37K | 39BH | 39T2
        "2023": ["37K", "39BH", "39T2"],
        // OEM MY24 Reatta brochure: 37K | 39BH | 39T2 (axle line prints 37K / 39BH / 39T2)
        "2024": ["37K", "39BH", "39T2"],
        // OEM MY25 Reatta brochure: 37K | 39BH | 39T2. No 2026 OEM page / brochure.
        "2025": ["37K", "39BH", "39T2"]
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
      yearEnd: 2025,
      description: "Entegra Reatta — mid-diesel on Spartan K1 with Cummins B6.7 360 / 800, Allison 3000 MH, hitch 10k. NOT Reatta XL (L9) and not an ISL 8.9. Year-end 2025: no 2026 OEM page.",
      powertrainByYear: [
        {
          from: 2016,
          to: 2016,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Spartan K1",
          transmission: "Allison 3000 MH",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. No OEM MY17–18 Reatta year page — do not invent 2017–2018. Not Reatta XL L9."
        },
        {
          from: 2019,
          to: 2020,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Spartan K1",
          transmission: "Allison 3000 MH",
          towingCapacity: 10000,
          notes: "OEM MY19–20 Reatta year page: B6.7 360 / 800 · Spartan K1 · hitch 10k. MY19 37MB / 39BH / 39T2; MY20 drops 37MB (DSO). Not Reatta XL L9 / K2."
        },
        {
          from: 2021,
          to: 2025,
          engine: "Cummins B6.7 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Spartan K1",
          transmission: "Allison 3000 MH",
          notes: "OEM MY21–25 Reatta: B6.7 360 / 800 · Spartan K1 · hitch 10k. MY21–22: 37K / 39BH / 39T2. Not Reatta XL L9 / K2."
        }
      ]
    },
    "Reatta XL": {
      type: "Class A Diesel",
      floorplans: ["37K", "39BH", "39T2", "39W", "40Q2", "40Q3"],
      floorplansByYear: {
        // No OEM MY17–19 Reatta XL year page (all-new for 2020) — omit earlier years
        // OEM MY20 Reatta XL year page: 37K | 39BH | 39T2 | 40Q2 · L9 380/1150 · K2
        "2020": ["37K", "39BH", "39T2", "40Q2"],
        // OEM MY21 Reatta XL year page: 37K | 39BH | 39T2 | 40Q2 · L9 380/1150 · K2
        "2021": ["37K", "39BH", "39T2", "40Q2"],
        // OEM MY22 Reatta XL year page: 37K | 39BH | 39T2 | 40Q3 (40Q2 dropped)
        "2022": ["37K", "39BH", "39T2", "40Q3"],
        // OEM MY23 Reatta XL brochure: 37K | 39BH | 39T2 | 40Q2
        "2023": ["37K", "39BH", "39T2", "40Q2"],
        // OEM MY24 Reatta XL brochure: 37K | 39BH | 39T2 | 40Q2 | 40Q3
        "2024": ["37K", "39BH", "39T2", "40Q2", "40Q3"],
        // OEM MY25 Reatta XL brochure: 37K | 39BH | 39T2 | 40Q3. No 2026 OEM page.
        "2025": ["37K", "39BH", "39T2", "40Q3"]
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
      engine: "Cummins L9 380HP",
      horsepower: 380,
      torqueLbFt: 1150,
      chassis: "Spartan K2",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 10000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2020,
      yearEnd: 2025,
      description: "Entegra Reatta XL — OEM MY20–25: Cummins L9 380 / 1,150 on Spartan K2 (not the Reatta B6.7 / K1). All-new for 2020 — no 2017–2019 OEM year page. MY20–21 40Q2; MY22 40Q3. Year-end 2025: no 2026 OEM page.",
      powertrainByYear: [
        {
          from: 2020,
          to: 2025,
          engine: "Cummins L9 380HP",
          horsepower: 380,
          torqueLbFt: 1150,
          chassis: "Spartan K2",
          transmission: "Allison 3000 MH",
          notes: "OEM MY20–25 Reatta XL: L9 380 / 1,150 · Spartan K2 · hitch 10k. MY20–21 40Q2; MY22+ 40Q3. Not Reatta B6.7 / K1."
        }
      ]
    },
    "Vision": {
      type: "Class A Gas",
      floorplans: ["26X", "27A", "29F", "29S", "31B", "31R", "31V"],
      floorplansByYear: {
        "2014": ["27A", "29S", "31B"],
        "2015": ["27A", "29S", "31B"],
        "2016": ["27A", "29S", "31B"],
        // No OEM MY17 / MY18 Vision year page (2017–2018 lineup is diesel Class A + 2018 Class C). Omit 2017–2018.
        // OEM MY19 Vision year page: 26X | 29F | 29S | 31R | 31V · F53 6.8 Triton 320/460 — no 27A
        "2019": ["26X", "29F", "29S", "31R", "31V"],
        // OEM MY20 Vision year page: 26X | 27A | 29F | 29S | 31V — 31R not listed
        "2020": ["26X", "27A", "29F", "29S", "31V"],
        // OEM MY21 Vision year page: 26X | 27A | 29F | 29S | 31V · F53 7.3 350/468
        "2021": ["26X", "27A", "29F", "29S", "31V"],
        // OEM MY22 Vision year page: 27A | 29F | 29S — 26X and 31V are Dealer Stock Only
        "2022": ["27A", "29F", "29S"],
        // OEM MY23 Vision brochure: 27A | 29F | 29S
        "2023": ["27A", "29F", "29S"],
        // OEM MY24 Vision brochure: 27A | 29F | 29S
        "2024": ["27A", "29F", "29S"],
        // OEM MY25–27 Vision: 27A | 29F | 29S — not XL 31UL/34/36
        "2025": ["27A", "29F", "29S"],
        "2026": ["27A", "29F", "29S"],
        "2027": ["27A", "29F", "29S"]
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
      engine: "Ford 7.3L V8 Godzilla 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
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
      description: "Entegra Vision — gas Class A on Ford F53. OEM MY25–27: 27A / 29F / 29S, 7.3L 335 / 468, TorqShift 6. Used pricing must use gas comps, not diesel MSRP math. Not Vision XL / Vision SE.",
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
          to: 2016,
          engine: "Ford Triton V10 6.8L",
          horsepower: 320,
          chassis: "Ford F53",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. No OEM MY17–18 Vision year page — do not invent 2017–2018."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Ford 6.8L Triton V10 320HP",
          horsepower: 320,
          torqueLbFt: 460,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          towingCapacity: 5000,
          notes: "OEM MY19 Vision year page: F53 6.8 Triton 320 / 460 · TorqShift 6 · hitch 5k"
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 6.8L Triton V10 320HP or 7.3L V8 350HP (by chassis)",
          horsepower: 0,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY20 Vision year page prints 2019 chassis 6.8 320 / 460 and 2020 chassis 7.3 350 / 468 — option band"
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "OEM MY21–23 Vision: F53 7.3 350 / 468 · TorqShift 6 · hitch 5k. Do not copy MY24 335 backward."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 7.3L V8 Godzilla 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24–27 Vision: F53 7.3 335 / 468"
        }
      ]
    },
    "Vision XL": {
      type: "Class A Gas",
      floorplans: ["29S", "31B", "31UL", "34B", "34G", "36A", "36C"],
      floorplansByYear: {
        // No OEM MY19 Vision XL year page (all-new for 2020) — omit 2019
        // OEM MY20 Vision XL year page: 34B | 34G | 36A — option-band 6.8 320 / 7.3 350
        "2020": ["34B", "34G", "36A"],
        // OEM MY21 Vision XL year page: 34B | 34G | 36A · F53 7.3 350/468
        "2021": ["34B", "34G", "36A"],
        // OEM MY22 Vision XL year page: 34B | 34G | 36A | 36C — no 31UL
        "2022": ["34B", "34G", "36A", "36C"],
        // OEM MY23 Vision XL brochure: 34B | 34G | 36A | 36C — no 31UL
        "2023": ["34B", "34G", "36A", "36C"],
        // OEM MY24 Vision XL brochure: 31UL | 34B | 34G | 36A | 36C
        "2024": ["31UL", "34B", "34G", "36A", "36C"],
        // OEM MY25–27 Vision XL: 31UL | 34B | 34G | 36A | 36C
        "2025": ["31UL", "34B", "34G", "36A", "36C"],
        "2026": ["31UL", "34B", "34G", "36A", "36C"],
        "2027": ["31UL", "34B", "34G", "36A", "36C"]
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
      engine: "Ford 7.3L V8 Godzilla 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
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
      yearStart: 2020,
      description: "Entegra Vision XL — gas Class A on Ford F53. All-new for 2020 (no 2019 OEM year page). OEM MY20: 34B / 34G / 36A, option-band 6.8 320 / 7.3 350. OEM MY25–27: 31UL / 34B / 34G / 36A / 36C, 7.3L 335 / 468. Not bare Vision / Vision SE.",
      powertrainByYear: [
        {
          from: 2020,
          to: 2020,
          engine: "Ford 6.8L Triton V10 320HP or 7.3L V8 350HP (by chassis)",
          horsepower: 0,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY20 Vision XL year page prints 2019 chassis 6.8 320 / 460 and 2020 chassis 7.3 350 / 468 — option band"
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford F53",
          notes: "OEM MY21–23 Vision XL: F53 7.3 350 / 468 · TorqShift 6. Do not copy MY24 335 backward."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 7.3L V8 Godzilla 335HP",
          horsepower: 335,
          torqueLbFt: 468,
          chassis: "Ford F53",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24–27 Vision XL: F53 7.3 335 / 468"
        }
      ]
    },
    "Accolade": {
      type: "Super C",
      floorplans: ["37HJ", "37K", "37L", "37M", "37RB", "37TS"],
      floorplansByYear: {
        "2015": ["37L", "37M"],
        "2016": ["37L", "37M"],
        // No OEM MY17 / MY18 Accolade year page (2017–2018 lineup is diesel Class A + 2018 Class C). Omit 2017–2018.
        // No OEM MY19 Accolade year page / brochure — omit 2019
        // OEM MY20 Accolade year page: 37HJ | 37K | 37L | 37RB | 37TS · ISB 360/800 · S2RV
        "2020": ["37HJ", "37K", "37L", "37RB", "37TS"],
        // OEM MY21 Accolade year page: 37K | 37L | 37M | 37RB | 37TS — 37HJ is Dealer Stock Only
        "2021": ["37K", "37L", "37M", "37RB", "37TS"],
        // OEM MY22 Accolade year page: 37K | 37L | 37M — 37TS is Dealer Stock Only
        "2022": ["37K", "37L", "37M"],
        // OEM MY23 Accolade brochure: 37K | 37L | 37M · S2RV · ISB 360/800
        "2023": ["37K", "37L", "37M"],
        // OEM MY24 Accolade year page: 37K | 37L | 37M · S2RV · ISB 360 (RVUSA 2024-Accolade.pdf is the XL file)
        "2024": ["37K", "37L", "37M"],
        // OEM MY25–27 Accolade: 37K | 37L | 37M — S2RV Plus · ISB 6.7 360/800 (Jayco Seneca sibling)
        "2025": ["37K", "37L", "37M"],
        "2026": ["37K", "37L", "37M"],
        "2027": ["37K", "37L", "37M"],
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
      engine: "Cummins ISB 6.7L 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner S2RV Plus",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      fuelCapacityGal: 100,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2015,
      description: "Entegra Accolade — Super C on Freightliner S2RV Plus. OEM MY25–27: 37K / 37L / 37M, Cummins ISB 6.7 360 / 800, Allison 3000 MH, 100 gal, hitch 12k. Jayco Seneca sibling. Not Accolade XT (Power Stroke F550/F600).",
      powertrainByYear: [
        {
          from: 2015,
          to: 2016,
          engine: "Cummins Super C diesel ~340HP",
          horsepower: 340,
          chassis: "Freightliner Super C",
          notes: "2015–2016 placeholder until the 2015–2016 Entegra walk-back. No OEM MY17–19 Accolade year page — do not invent. Not Accolade XT."
        },
        {
          from: 2020,
          to: 2020,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY20 Accolade year page: ISB 360/800 · S2RV (not Plus) · hitch 12k. 37HJ / 37K / 37L / 37RB / 37TS. Not Accolade XT."
        },
        {
          from: 2021,
          to: 2022,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY21–22 Accolade: ISB 360/800 · S2RV (not Plus) · hitch 12k. MY21 37RB/37TS; MY22 drops both (37TS DSO). Not Accolade XT."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY23–24 Accolade: ISB 360/800 · S2RV (not Plus) · Allison 3000 MH · hitch 12k"
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV Plus",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY25–27 Accolade / XL: ISB 360/800 · S2RV Plus · Allison 3000 MH · hitch 12k"
        }
      ]
    },
    "Accolade XL": {
      type: "Super C",
      floorplans: ["37K", "37L", "37M"],
      floorplansByYear: {
        // No OEM MY17–20 Accolade XL year page — omit 2017–2020
        // OEM MY21 Accolade XL year page: 37K | 37L | 37M · S2RV · ISB 360/800
        "2021": ["37K", "37L", "37M"],
        // OEM MY22 Accolade XL year page: 37K | 37L | 37M
        "2022": ["37K", "37L", "37M"],
        // OEM MY23 Accolade XL brochure: 37K | 37L | 37M
        "2023": ["37K", "37L", "37M"],
        // OEM MY24 Accolade XL brochure: 37K | 37L | 37M
        "2024": ["37K", "37L", "37M"],
        "2025": ["37M", "37K"],
        // OEM MY26–27 Accolade XL: 37K | 37L | 37M (do not copy 37L onto MY25)
        "2026": ["37K", "37L", "37M"],
        "2027": ["37K", "37L", "37M"]
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
      engine: "Cummins ISB 6.7L 360HP",
      horsepower: 360,
      torqueLbFt: 800,
      chassis: "Freightliner S2RV Plus",
      transmission: "Allison 3000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.55,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      fuelCapacityGal: 100,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Entegra Accolade XL — same S2RV Plus · ISB 6.7 360/800 · Allison 3000 MH as Accolade. First OEM year page 2021. OEM MY26–27: 37K / 37L / 37M. Not Accolade XT.",
      powertrainByYear: [
        {
          from: 2021,
          to: 2022,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY21–22 Accolade XL: ISB 360/800 · S2RV (not Plus) · hitch 12k. Not Accolade XT."
        },
        {
          from: 2023,
          to: 2024,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM MY23–24 Accolade XL: ISB 360/800 · S2RV · hitch 12k"
        },
        {
          from: 2025,
          to: 2027,
          engine: "Cummins ISB 6.7L 360HP",
          horsepower: 360,
          torqueLbFt: 800,
          chassis: "Freightliner S2RV Plus",
          transmission: "Allison 3000 MH",
          fuelCapacityGal: 100,
          towingCapacity: 12000,
          notes: "OEM Accolade XL: same ISB 360/800 pin as Accolade"
        }
      ]
    },
    "Centurion": {
      type: "Super C",
      floorplans: ["39N", "39K", "45D"],
      floorplansByYear: {
        "2026": ["39N", "39K", "45D"],
        "2027": ["39N", "39K", "45D"],
      },
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
    "Expanse": {
      type: "Class B",
      floorplans: ["21B", "21L", "21T"],
      floorplansByYear: {
        // OEM MY23 Expanse brochure: 21B Class B Transit — HP not printed
        "2023": ["21B"],
        // OEM MY24 Expanse brochure: 21B · EcoBoost 310/400
        "2024": ["21B"],
        // OEM MY26 Expanse brochure: 21B | 21T. Do not copy 21L backward.
        "2026": ["21B", "21T"],
        // OEM 2027 Expanse year page listed floorplans: 21L | 21T (prose still mentions 21B — not copied onto the year key)
        "2027": ["21L", "21T"],
      },
      lengthRange: [22, 22],
      weightRange: [9000, 11000],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [149000, 199000],
      engine: "Ford 3.5L EcoBoost V6 310HP",
      horsepower: 310,
      torqueLbFt: 400,
      chassis: "Ford Transit AWD 350HD",
      transmission: "10-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 20,
      blackWater: 16,
      fuelCapacityGal: 25,
      generator: "2,800W gas with auto-gen start (available)",
      awningLength: 12,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Entegra Expanse — Class B on Ford Transit AWD 350HD. OEM MY23: 21B, EcoBoost V6 (HP not printed). MY24: 21B, 310 / 400. MY26: 21B / 21T; MY27: 21L / 21T. No sourced MY25 brochure — omit 2025. Not a Super C.",
      powertrainByYear: [
        {
          from: 2023,
          to: 2023,
          engine: "Ford 3.5L EcoBoost V6 (Transit AWD 350HD)",
          horsepower: 0,
          chassis: "Ford Transit AWD 350HD",
          transmission: "10-speed automatic",
          notes: "OEM MY23 Expanse: Transit AWD 350HD · EcoBoost V6 — HP not printed on brochure"
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 3.5L EcoBoost V6 310HP",
          horsepower: 310,
          torqueLbFt: 400,
          chassis: "Ford Transit AWD 350HD",
          transmission: "10-speed automatic",
          fuelCapacityGal: 25,
          notes: "OEM MY24 / MY26–27 Expanse: Transit AWD 350HD · EcoBoost 310/400 · gas — not Power Stroke Super C"
        },
      ],
    },
    "Odyssey": {
      type: "Class C",
      floorplans: ["22J", "24B", "25R", "26D", "26M", "27G", "27U", "29K", "29V", "30Z", "31F", "31L"],
      floorplansByYear: {
        // OEM MY18 Odyssey year page + official 2018 Odyssey Flyer: 22J | 26D | 29V | 31L · E-450 6.8 305/420. 31L is current (not DSO).
        "2018": ["22J", "26D", "29V", "31L"],
        // OEM MY19 Odyssey year page: 22J | 24B | 25R | 26D | 29K | 29V | 30Z | 31F — 31L is Dealer Stock Only · E-450 6.8 305/420
        "2019": ["22J", "24B", "25R", "26D", "29K", "29V", "30Z", "31F"],
        // OEM MY20 Odyssey year page: 24B | 25R | 26D | 29K | 29V | 30Z | 31F — option-band 6.8 305 / 7.3 350
        "2020": ["24B", "25R", "26D", "29K", "29V", "30Z", "31F"],
        // OEM MY21 Odyssey year page: 24B | 25R | 26D | 26M | 27U | 29K | 29V | 30Z | 31F · E-450 7.3 350/468
        "2021": ["24B", "25R", "26D", "26M", "27U", "29K", "29V", "30Z", "31F"],
        // OEM MY22 Odyssey year page: 24B | 25R | 26M | 27U | 29V | 30Z | 31F — 26D and 29K are Dealer Stock Only
        "2022": ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
        // OEM MY23 Odyssey brochure: 24B | 25R | 26M | 27U | 29V | 30Z | 31F
        "2023": ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
        // OEM MY24 Odyssey brochure: 24B | 25R | 26M | 27U | 29V | 30Z | 31F
        "2024": ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
        // OEM MY25–26 Odyssey brochure: 24B | 25R | 26M | 27U | 29V | 30Z | 31F (no 27G)
        "2025": ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
        "2026": ["24B", "25R", "26M", "27U", "29V", "30Z", "31F"],
        // OEM 2027 Odyssey year page adds 27G
        "2027": ["24B", "25R", "26M", "27G", "27U", "29V", "30Z", "31F"],
      },
      lengthRange: [24, 28],
      weightRange: [12000, 16000],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [89900, 139000],
      engine: "Ford 7.3L V8 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-450",
      transmission: "TorqShift 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 44,
      grayWater: 28,
      blackWater: 28,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 12,
      ceilingHeight: 79,
      founded: 2008,
      warrantyYears: 3,
      yearStart: 2018,
      description:
        "Entegra Odyssey — Ford E-450 Class C. OEM MY25–26: 24B / 25R / 26M / 27U / 29V / 30Z / 31F; MY27 adds 27G. Current OEM: 7.3L 325 / 450 (not F53 350/468). Not Odyssey SE / Odyssey Esteem Edition.",
      powertrainByYear: [
        {
          from: 2018,
          to: 2018,
          engine: "Ford 6.8L Triton V10 305HP",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          towingCapacity: 7500,
          notes: "OEM MY18 Odyssey year page + 2018 Entegra Coach Odyssey Flyer: E-450 6.8 Triton 305 / 420 · TorqShift 6 · hitch 7.5k. 22J / 26D / 29V / 31L. No 2017 Odyssey OEM page."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Ford 6.8L Triton V10 305HP",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          towingCapacity: 7500,
          notes: "OEM MY19 Odyssey year page: E-450 6.8 Triton 305 / 420 · hitch 7.5k"
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 6.8L Triton V10 305HP or 7.3L V8 350HP (by chassis)",
          horsepower: 0,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY20 Odyssey year page prints 2019 chassis 6.8 305 / 420 and 2021 chassis 7.3 350 / 468 — option band"
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L Godzilla V8 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford E-450",
          notes: "OEM MY21–23 Odyssey: E-450 7.3 350 / 468 · hitch 7.5k. Do not copy MY24 325 backward."
        },
        {
          from: 2024,
          to: 2027,
          engine: "Ford 7.3L V8 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24–27 Odyssey: E-450 7.3 325 / 450"
        },
      ],
    },
    "Esteem": {
      type: "Class C",
      floorplans: ["26D", "26U", "27U", "29V", "30X", "31F", "31L", "31W"],
      floorplansByYear: {
        "2014": ["26U", "29V", "31W"],
        "2015": ["26U", "29V", "31W"],
        "2016": ["26U", "29V", "31W"],
        // No OEM MY17 Esteem year page — omit 2017
        // OEM MY18 Esteem year page + 2018 lineup blog: 29V | 30X | 31L · E-450 6.8 305/420. 31L is current (not DSO).
        "2018": ["29V", "30X", "31L"],
        // OEM MY19 Esteem year page: 26D | 29V | 30X | 31F — 31L is Dealer Stock Only · E-450 6.8 305/420
        "2019": ["26D", "29V", "30X", "31F"],
        // OEM MY20 Esteem year page: 27U | 29V | 30X | 31F — 26D is Dealer Stock Only
        "2020": ["27U", "29V", "30X", "31F"],
        // OEM MY21 Esteem year page: 27U | 29V | 30X | 31F · E-450 7.3 350/468
        "2021": ["27U", "29V", "30X", "31F"],
        // OEM MY22 Esteem year page: 27U | 29V | 31F — 30X is Dealer Stock Only
        "2022": ["27U", "29V", "31F"],
        // OEM MY23 Esteem brochure: 27U | 29V | 31F
        "2023": ["27U", "29V", "31F"],
        // OEM MY24 Esteem brochure: 27U | 29V | 31F
        "2024": ["27U", "29V", "31F"],
        // No sourced MY25 Esteem brochure (RVUSA "2025 Esteem" PDF is Emblem). Do not invent 2025 / do not copy 2026 back.
        // OEM MY26 Esteem brochure: 27U | 29V | 31F. 2027 product is Odyssey Esteem Edition.
        "2026": ["27U", "29V", "31F"]
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
      engine: "Ford 7.3L V8 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-450",
      transmission: "TorqShift 6-speed automatic",
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
      yearEnd: 2026,
      description: "Entegra Esteem — Ford E-450 Class C. OEM MY23: 27U / 29V / 31F, brochure 7.3 350 / 468. MY24: same plans, 325 / 450. No sourced MY25 Esteem brochure. OEM MY26: 27U / 29V / 31F, 325 / 450. Year-end 2026: 2027 product is Odyssey Esteem Edition. Not Esteem XL Super C.",
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
          to: 2016,
          engine: "Ford 6.2L / V10",
          horsepower: 305,
          chassis: "Ford E-450",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. No OEM MY17 Esteem year page — do not invent 2017."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Ford 6.8L Triton V10 305HP",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          towingCapacity: 7500,
          notes: "OEM MY18 Esteem year page + 2018 Entegra lineup blog: E-450 6.8 Triton 305 / 420 · TorqShift 6 · hitch 7.5k. 29V / 30X / 31L."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Ford 6.8L Triton V10 305HP",
          horsepower: 305,
          torqueLbFt: 420,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          towingCapacity: 7500,
          notes: "OEM MY19 Esteem year page: E-450 6.8 Triton 305 / 420 · hitch 7.5k"
        },
        {
          from: 2020,
          to: 2020,
          engine: "Ford 6.8L Triton V10 305HP or 7.3L V8 350HP (by chassis)",
          horsepower: 0,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY20 Esteem year page prints 2019 chassis 6.8 305 / 420 and 2021 chassis 7.3 350 / 468 — option band"
        },
        {
          from: 2021,
          to: 2023,
          engine: "Ford 7.3L V8 Godzilla 350HP",
          horsepower: 350,
          torqueLbFt: 468,
          chassis: "Ford E-450",
          notes: "OEM MY21–23 Esteem: E-450 7.3 350 / 468. Do not copy MY24 325 backward."
        },
        {
          from: 2024,
          to: 2024,
          engine: "Ford 7.3L V8 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY24 Esteem: E-450 7.3 325 / 450"
        },
        {
          from: 2026,
          to: 2026,
          engine: "Ford 7.3L V8 325HP",
          horsepower: 325,
          torqueLbFt: 450,
          chassis: "Ford E-450",
          transmission: "TorqShift 6-speed automatic",
          notes: "OEM MY26 Esteem: E-450 7.3 325 / 450"
        }
      ]
    },
    "Qwest": {
      type: "Class C",
      floorplans: ["24A", "24K", "24L", "24N", "24R", "24T", "25L", "25M", "25R"],
      floorplansByYear: {
        "2015": ["24L", "24R"],
        "2016": ["24L", "24R"],
        // No OEM MY17 Qwest year page — omit 2017
        // OEM MY18 Qwest year page + 2018 Qwest Flyer: 24K | 24L · Mercedes 3500 V6 188/325 · 5-speed
        "2018": ["24K", "24L"],
        // OEM MY19 Qwest year page: 24A | 24K | 24L · Mercedes 3500 V6 188/325 · 5-speed
        "2019": ["24A", "24K", "24L"],
        // OEM MY20 Qwest year page: 24A | 24K | 24L | 24R | 24T · V6 188/325 · 7-speed
        "2020": ["24A", "24K", "24L", "24R", "24T"],
        // OEM MY21 Qwest year page: 24L | 24R | 24T — 24K is Dealer Stock Only · V6 188/325
        "2021": ["24L", "24R", "24T"],
        // OEM MY22 Qwest year page / brochure: 24L | 24N | 24R | 24T · V6 188/325 (not 2.0 208)
        "2022": ["24L", "24N", "24R", "24T"],
        // OEM MY23 Qwest brochure: 24L | 24N | 24R | 24T
        "2023": ["24L", "24N", "24R", "24T"],
        // OEM MY24 Qwest brochure: 24L | 24N | 24R | 24T
        "2024": ["24L", "24N", "24R", "24T"],
        // OEM MY25 Qwest PDF: 24L | 24R on Mercedes 3500 · 2.0 211/332
        "2025": ["24L", "24R"],
        // OEM MY26–27 Qwest: 25L | 25M | 25R on Mercedes 4500 · 2.0 211/332
        "2026": ["25L", "25M", "25R"],
        "2027": ["25L", "25M", "25R"]
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
      engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz 4500",
      transmission: "9-speed automatic",
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
      description: "Entegra Qwest — Sprinter diesel Class C. OEM MY23: 24L / 24N / 24R / 24T on Mercedes 3500 V6 188 / 325. MY24: same plans, 2.0 211 / 332. MY25: 24L / 24R on Mercedes 3500 211 / 332. MY26–27: 25L / 25M / 25R on Mercedes 4500 211 / 332. Not Qwest SE.",
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
          to: 2016,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          chassis: "Mercedes Sprinter",
          notes: "2016 placeholder until the 2015–2016 Entegra walk-back. No OEM MY17 Qwest year page — do not invent 2017."
        },
        {
          from: 2018,
          to: 2018,
          engine: "Mercedes-Benz 3.0L V6 Turbo 188HP",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500",
          transmission: "5-speed automatic",
          towingCapacity: 5000,
          notes: "OEM MY18 Qwest year page + 2018 Entegra Coach Qwest Flyer: Mercedes 3500 · V6 Turbo 188 / 325 · 5-speed · hitch 5k. 24K / 24L."
        },
        {
          from: 2019,
          to: 2019,
          engine: "Mercedes-Benz 3.0L V6 Turbo 188HP",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500",
          transmission: "5-speed automatic",
          towingCapacity: 5000,
          notes: "OEM MY19 Qwest year page: Mercedes 3500 · V6 Turbo 188 / 325 · 5-speed · hitch 5k"
        },
        {
          from: 2020,
          to: 2020,
          engine: "Mercedes-Benz 3.0L V6 Turbo 188HP",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500",
          transmission: "7-speed automatic",
          towingCapacity: 5000,
          notes: "OEM MY20 Qwest year page: Mercedes 3500 · V6 Turbo 188 / 325 · 7-speed · hitch 5k"
        },
        {
          from: 2021,
          to: 2023,
          engine: "Mercedes-Benz 3.0L V6 Turbo 188HP",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz 3500",
          transmission: "7-speed automatic",
          notes: "OEM MY21–23 Qwest: Mercedes 3500 · V6 Turbo 188 / 325. MY22 brochure still prints 188 — not 2.0 208/211. Do not copy MY24 2.0 211 backward."
        },
        {
          from: 2024,
          to: 2024,
          engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
          horsepower: 211,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 3500",
          transmission: "9-speed automatic",
          notes: "OEM MY24 Qwest: Mercedes 3500 · 2.0 211/332 · 9-speed"
        },
        {
          from: 2025,
          to: 2025,
          engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
          horsepower: 211,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 3500",
          transmission: "9-speed automatic",
          notes: "OEM MY25 Qwest: Mercedes 3500 · 2.0 211/332"
        },
        {
          from: 2026,
          to: 2027,
          engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
          horsepower: 211,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz 4500",
          transmission: "9-speed automatic",
          notes: "OEM MY26–27 Qwest: Mercedes 4500 · 2.0 211/332"
        }
      ]
    },
    "Cornerstone Reserve": {
      type: "Class A Diesel",
      floorplans: ["45D"],
      floorplansByYear: {
        // OEM 2026 Cornerstone Reserve year page: 45D only · limited run · X15 605
        "2026": ["45D"],
      },
      lengthRange: [45, 45],
      weightRange: [50000, 58000],
      slideouts: 4,
      sleeps: 6,
      msrpRange: [799000, 1250000],
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.9,
      image: RV_CARD_IMAGE,
      towingCapacity: 20000,
      freshWater: 100,
      grayWater: 60,
      blackWater: 50,
      fuelCapacityGal: 175,
      generator: "Onan 10–12.5kW Diesel QD",
      awningLength: 16,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      yearEnd: 2026,
      description: "Entegra Cornerstone Reserve — 2026 limited-run 45D on Spartan K3 + X15 605 / 1,950, Allison 4000 MH, hitch 20k. Year-end 2026 with Cornerstone.",
      powertrainByYear: [
        { from: 2026, to: 2026, engine: "Cummins X15 605HP", horsepower: 605, torqueLbFt: 1950, chassis: "Spartan K3", transmission: "Allison 4000 MH", towingCapacity: 20000, notes: "OEM 2026 Cornerstone Reserve 45D" },
      ],
    },
    "Emblem": {
      type: "Class A Gas",
      floorplans: ["36B", "36H", "36T", "36U"],
      floorplansByYear: {
        // OEM MY19 Emblem year page: 36H | 36T | 36U · F53 6.8 Triton 320/460 — no 36B
        "2019": ["36H", "36T", "36U"],
        // OEM MY20 Emblem year page: 36H | 36T | 36U — option-band 6.8 320 / 7.3 350 — no 36B
        "2020": ["36H", "36T", "36U"],
        // OEM MY21 Emblem year page / gas Class A brochure: 36H | 36T | 36U · F53 7.3 350/468 — no 36B
        "2021": ["36H", "36T", "36U"],
        // OEM MY22 Emblem year page: 36H | 36T | 36U · F53 7.3 350/468 — no 36B
        "2022": ["36H", "36T", "36U"],
        // OEM MY23 Emblem brochure: 36H | 36T | 36U · F53 7.3 350/468 — no 36B
        "2023": ["36H", "36T", "36U"],
        // OEM MY24 Emblem brochure: 36H | 36T | 36U · F53 7.3 335/468 — no 36B
        "2024": ["36H", "36T", "36U"],
        // OEM MY25–27 Emblem: 36B | 36H | 36U · F53 7.3 335/468 (RVUSA "2025 Esteem" PDF is this brochure)
        "2025": ["36B", "36H", "36U"],
        "2026": ["36B", "36H", "36U"],
        "2027": ["36B", "36H", "36U"],
      },
      lengthRange: [38, 39],
      weightRange: [18000, 24000],
      slideouts: 2,
      sleeps: 8,
      msrpRange: [199000, 289000],
      engine: "Ford 7.3L V8 Godzilla 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2019,
      description: "Entegra Emblem — gas Class A on Ford F53. Introduced MY19: 36H / 36T / 36U, 6.8L Triton 320 / 460. MY20: same plans, option-band 6.8 320 / 7.3 350. OEM MY21–23: 7.3L 350 / 468. MY24: 335 / 468. MY25–27: 36B / 36H / 36U, 335 / 468. Do not copy 36B onto MY19–24.",
      powertrainByYear: [
        { from: 2019, to: 2019, engine: "Ford 6.8L Triton V10 320HP", horsepower: 320, torqueLbFt: 460, chassis: "Ford F53", transmission: "TorqShift 6-speed automatic", towingCapacity: 5000, notes: "OEM MY19 Emblem year page: F53 6.8 Triton 320 / 460" },
        { from: 2020, to: 2020, engine: "Ford 6.8L Triton V10 320HP or 7.3L V8 350HP (by chassis)", horsepower: 0, chassis: "Ford F53", transmission: "TorqShift 6-speed automatic", notes: "OEM MY20 Emblem year page prints 2019 chassis 6.8 320 / 460 and 2020 chassis 7.3 350 / 468 — option band" },
        { from: 2021, to: 2023, engine: "Ford 7.3L V8 Godzilla 350HP", horsepower: 350, torqueLbFt: 468, chassis: "Ford F53", transmission: "TorqShift 6-speed automatic", towingCapacity: 5000, notes: "OEM MY21–23 Emblem: F53 7.3 350 / 468" },
        { from: 2024, to: 2027, engine: "Ford 7.3L V8 Godzilla 335HP", horsepower: 335, torqueLbFt: 468, chassis: "Ford F53", transmission: "TorqShift 6-speed automatic", towingCapacity: 5000, notes: "OEM MY24–27 Emblem: F53 7.3 335 / 468" },
      ],
    },
    "Vision SE": {
      type: "Class A Gas",
      floorplans: ["27ASE"],
      floorplansByYear: {
        // OEM MY26–27 Vision SE: 27ASE only · F53 7.3 335/468
        "2026": ["27ASE"],
        "2027": ["27ASE"],
      },
      lengthRange: [30, 30],
      weightRange: [15000, 18000],
      slideouts: 1,
      sleeps: 5,
      msrpRange: [149000, 229000],
      engine: "Ford 7.3L V8 Godzilla 335HP",
      horsepower: 335,
      torqueLbFt: 468,
      chassis: "Ford F53",
      transmission: "TorqShift 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 50,
      grayWater: 36,
      blackWater: 36,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Vision SE — single 27ASE gas Class A on Ford F53, 7.3L 335 / 468, TorqShift 6. Not bare Vision / Vision XL.",
      powertrainByYear: [
        { from: 2026, to: 2027, engine: "Ford 7.3L V8 Godzilla 335HP", horsepower: 335, torqueLbFt: 468, chassis: "Ford F53", transmission: "TorqShift 6-speed automatic", notes: "OEM MY26–27 Vision SE 27ASE" },
      ],
    },
    "Accolade XT": {
      type: "Super C",
      floorplans: ["29T", "32U", "35L"],
      floorplansByYear: {
        // OEM MY23 Accolade XT brochure: 32U | 35L — no 29T
        "2023": ["32U", "35L"],
        // OEM MY24 Accolade XT brochure: 29T | 32U | 35L
        "2024": ["29T", "32U", "35L"],
        // OEM MY26–27 Accolade XT: 29T | 32U | 35L · Power Stroke 330/950 · F550 4x4 (29T) / F600 4x4 (32U, 35L)
        "2026": ["29T", "32U", "35L"],
        "2027": ["29T", "32U", "35L"],
      },
      lengthRange: [30, 37],
      weightRange: [19000, 22000],
      slideouts: 1,
      sleeps: 5,
      msrpRange: [249000, 379000],
      engine: "Ford 6.7L Power Stroke 330HP",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F550 4x4 / F600 4x4 (by floorplan)",
      transmission: "10-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.5,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2023,
      description: "Entegra Accolade XT — Super C on Ford 4x4. OEM MY23: 32U / 35L, Power Stroke 330 / 825, hitch 10k. MY24 / MY26–27: 29T / 32U / 35L, 330 / 950, hitch 12k. 29T F550 4x4; 32U / 35L F600 4x4. No sourced MY25 brochure — omit 2025. Not Accolade / Accolade XL ISB.",
      powertrainByYear: [
        { from: 2023, to: 2023, floorplans: ["32U"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 825, chassis: "Ford F550 4x4", transmission: "10-speed automatic", towingCapacity: 10000, notes: "OEM MY23 Accolade XT 32U: F550 4x4 · 330 / 825 · hitch 10k" },
        { from: 2023, to: 2023, floorplans: ["35L"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 825, chassis: "Ford F600 4x4", transmission: "10-speed automatic", towingCapacity: 10000, notes: "OEM MY23 Accolade XT 35L: F600 4x4 · 330 / 825 · hitch 10k" },
        { from: 2023, to: 2023, engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 825, chassis: "Ford F550 4x4 / F600 4x4 (by floorplan)", transmission: "10-speed automatic", towingCapacity: 10000, notes: "OEM MY23 Accolade XT: 330 / 825 · hitch 10k — do not copy MY24 950 / 12k backward" },
        { from: 2024, to: 2027, floorplans: ["29T"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F550 4x4", transmission: "10-speed automatic", towingCapacity: 12000 },
        { from: 2024, to: 2027, floorplans: ["32U", "35L"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F600 4x4", transmission: "10-speed automatic", towingCapacity: 12000 },
        { from: 2024, to: 2027, engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F550 4x4 / F600 4x4 (by floorplan)", transmission: "10-speed automatic" },
      ],
    },
    "Esteem XL": {
      type: "Super C",
      floorplans: ["30M", "32U", "33F"],
      floorplansByYear: {
        // OEM MY26–27 Esteem XL: 30M | 32U | 33F · Power Stroke 330/950 · F550 4x4 (30M, 32U) / F600 4x4 (33F)
        "2026": ["30M", "32U", "33F"],
        "2027": ["30M", "32U", "33F"],
      },
      lengthRange: [33, 35],
      weightRange: [19000, 22000],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [229000, 349000],
      engine: "Ford 6.7L Power Stroke 330HP",
      horsepower: 330,
      torqueLbFt: 950,
      chassis: "Ford F550 4x4 / F600 4x4 (by floorplan)",
      transmission: "10-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 12000,
      freshWater: 60,
      grayWater: 40,
      blackWater: 40,
      generator: "Onan / Generac",
      awningLength: 16,
      ceilingHeight: 84,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Esteem XL — Super C on Ford 4x4. OEM MY26–27: 30M / 32U / 33F, Power Stroke 6.7 330 / 950, 10-speed, hitch 12k. F550 4x4 on 30M/32U; F600 4x4 on 33F. Not Class C Esteem.",
      powertrainByYear: [
        { from: 2026, to: 2027, floorplans: ["30M", "32U"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F550 4x4", transmission: "10-speed automatic", towingCapacity: 12000 },
        { from: 2026, to: 2027, floorplans: ["33F"], engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F600 4x4", transmission: "10-speed automatic", towingCapacity: 12000 },
        { from: 2026, to: 2027, engine: "Ford 6.7L Power Stroke 330HP", horsepower: 330, torqueLbFt: 950, chassis: "Ford F550 4x4 / F600 4x4 (by floorplan)", transmission: "10-speed automatic" },
      ],
    },
    "Odyssey Esteem Edition": {
      type: "Class C",
      floorplans: ["24B", "25R", "26M", "27G", "27U", "29V", "30Z", "31F"],
      floorplansByYear: {
        // OEM 2027 Odyssey Esteem Edition year page: same Odyssey 2027 plans including 27G
        "2027": ["24B", "25R", "26M", "27G", "27U", "29V", "30Z", "31F"],
      },
      lengthRange: [27, 33],
      weightRange: [12000, 14500],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [119000, 179000],
      engine: "Ford 7.3L V8 325HP",
      horsepower: 325,
      torqueLbFt: 450,
      chassis: "Ford E-450",
      transmission: "TorqShift 6-speed automatic",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 7500,
      freshWater: 44,
      grayWater: 28,
      blackWater: 28,
      fuelCapacityGal: 55,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 12,
      ceilingHeight: 79,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2027,
      description: "Entegra Odyssey Esteem Edition — 2027 trim of Odyssey on Ford E-450, 7.3L 325 / 450. Same MY27 Odyssey floorplans (24B–31F including 27G). Not Class C Esteem / Esteem XL.",
      powertrainByYear: [
        { from: 2027, to: 2027, engine: "Ford 7.3L V8 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-450", transmission: "TorqShift 6-speed automatic", towingCapacity: 7500, notes: "OEM 2027 Odyssey Esteem Edition: E-450 7.3 325 / 450" },
      ],
    },
    "Odyssey SE": {
      type: "Class C",
      floorplans: ["20LF", "20SF", "22A", "22AF", "22C", "22CF", "22E", "22EF", "22T", "22TF", "27N", "27NF", "29KF", "31FF"],
      floorplansByYear: {
        // OEM MY24 Odyssey SE brochure: 22A | 22AF | 22C | 22CF | 27N | 27NF — Ford 325/450 and Chevy 401/464
        "2024": ["22A", "22AF", "22C", "22CF", "27N", "27NF"],
        // OEM MY26 Odyssey SE brochure: 22A | 22AF | 22C | 22CF | 22E | 22EF | 22T | 22TF | 29KF | 31FF (no 20LF / 20SF)
        "2026": ["22A", "22AF", "22C", "22CF", "22E", "22EF", "22T", "22TF", "29KF", "31FF"],
        // OEM 2027 Odyssey SE year page adds 20LF | 20SF
        "2027": ["20LF", "20SF", "22A", "22AF", "22C", "22CF", "22E", "22EF", "22T", "22TF", "29KF", "31FF"],
      },
      lengthRange: [22, 33],
      weightRange: [11000, 14500],
      slideouts: 1,
      sleeps: 7,
      msrpRange: [89000, 149000],
      engine: "Ford 7.3L 325HP or Chevy 6.6L Vortec 401HP (by chassis)",
      horsepower: 0,
      chassis: "Ford E-350 / E-450 or Chevy (by floorplan)",
      transmission: "TorqShift 6-speed / Hydra-Matic 6-speed (by chassis)",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 40,
      grayWater: 28,
      blackWater: 28,
      generator: "Onan 4000W Gas MicroQuiet",
      awningLength: 12,
      ceilingHeight: 84,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2024,
      description: "Entegra Odyssey SE — Class C across Ford E-450 and Chevy chassis. OEM MY24: 22A / 22AF / 22C / 22CF / 27N / 27NF, Ford 7.3 325 / 450 and Chevy 6.6 Vortec 401 / 464 (option-band). MY26 brochure: 22-series + 29KF / 31FF (Ford only). MY27 adds 20LF / 20SF and reprints Chevy. No sourced MY23 / MY25 brochure — omit those years. Not bare Odyssey.",
      powertrainByYear: [
        { from: 2024, to: 2024, engine: "Ford 7.3L 325HP or Chevy 6.6L Vortec 401HP (by chassis)", horsepower: 0, chassis: "Ford E-450 or Chevy (by floorplan)", notes: "OEM MY24 Odyssey SE prints both Ford 325/450 and Chevy 401/464 — option band" },
        { from: 2026, to: 2026, engine: "Ford 7.3L V8 325HP", horsepower: 325, torqueLbFt: 450, chassis: "Ford E-350 / E-450 (by floorplan)", transmission: "TorqShift 6-speed automatic", notes: "OEM MY26 Odyssey SE: Ford 7.3 325 / 450 — do not invent Chevy HP for 2026" },
        { from: 2027, to: 2027, engine: "Ford 7.3L 325HP or Chevy 6.6L Vortec 401HP (by chassis)", horsepower: 0, chassis: "Ford E-350 / E-450 or Chevy (by floorplan)", notes: "OEM 2027 Odyssey SE prints both Ford 325/450 and Chevy 401/464 — option band" },
      ],
    },
    "Qwest SE": {
      type: "Class C",
      floorplans: ["24L", "24R"],
      floorplansByYear: {
        // OEM MY26–27 Qwest SE: 24L | 24R on Mercedes 3500 · 2.0 211/332 (24R-USA / 24R-Canada are market labels)
        "2026": ["24L", "24R"],
        "2027": ["24L", "24R"],
      },
      lengthRange: [25, 25],
      weightRange: [10000, 11000],
      slideouts: 1,
      sleeps: 4,
      msrpRange: [139000, 189000],
      engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz 3500",
      transmission: "9-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 24,
      blackWater: 24,
      fuelCapacityGal: 26.4,
      generator: "Onan / Generac",
      awningLength: 12,
      ceilingHeight: 83,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Qwest SE — Mercedes 3500 Class C. OEM MY26–27: 24L / 24R, 2.0 twin-turbo 211 / 332, 9-speed. Not the 25-series Qwest on Mercedes 4500.",
      powertrainByYear: [
        { from: 2026, to: 2027, engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP", horsepower: 211, torqueLbFt: 332, chassis: "Mercedes-Benz 3500", transmission: "9-speed automatic", notes: "OEM MY26–27 Qwest SE: Mercedes 3500 · 211/332" },
      ],
    },
    "Condor": {
      type: "Class C",
      floorplans: ["22T", "23S"],
      floorplansByYear: {
        // OEM MY26–27 Condor: 22T Transit 350HD AWD · 23S Mercedes 3500 AWD
        "2026": ["22T", "23S"],
        "2027": ["22T", "23S"],
      },
      lengthRange: [23, 25],
      weightRange: [9000, 11000],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [149000, 219000],
      engine: "Ford 3.5L EcoBoost 310HP (22T) or Mercedes 2.0 211HP (23S)",
      horsepower: 0,
      chassis: "Ford Transit 350HD AWD / Mercedes-Benz 3500 AWD",
      fuelType: "Gas / Diesel (by plan)",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 28,
      grayWater: 20,
      blackWater: 16,
      generator: "confirm brochure — compact Class C van cutaway",
      awningLength: 12,
      ceilingHeight: 80,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Condor — compact Class C. 22T Ford Transit 350HD AWD; 23S Mercedes 3500 AWD 2.0 211 / 332. MY26 22T brochure did not print HP (leave 0); MY27 OEM prints EcoBoost 310 / 400 on 22T. Gas ≠ diesel.",
      powertrainByYear: [
        { from: 2026, to: 2026, floorplans: ["22T"], engine: "Ford 3.5L EcoBoost V6 (Transit 350HD AWD)", horsepower: 0, chassis: "Ford Transit 350HD AWD", transmission: "10-speed automatic", notes: "OEM MY26 Condor 22T: Transit 350HD AWD — HP not printed on brochure" },
        { from: 2027, to: 2027, floorplans: ["22T"], engine: "Ford 3.5L EcoBoost V6 310HP", horsepower: 310, torqueLbFt: 400, chassis: "Ford Transit 350HD AWD", transmission: "10-speed automatic", notes: "OEM 2027 Condor 22T: EcoBoost 310 / 400" },
        { from: 2026, to: 2027, floorplans: ["23S"], engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP", horsepower: 211, torqueLbFt: 332, chassis: "Mercedes-Benz 3500 AWD", transmission: "9-speed automatic", notes: "OEM MY26–27 Condor 23S" },
        { from: 2026, to: 2027, engine: "Ford 3.5L EcoBoost (22T) or Mercedes 2.0 211HP (23S)", horsepower: 0, chassis: "Ford Transit 350HD AWD / Mercedes-Benz 3500 AWD" },
      ],
    },
    "Launch": {
      type: "Class B",
      floorplans: ["19A", "19Y", "19AG", "19YG"],
      floorplansByYear: {
        // OEM MY22 Launch year page / brochure: 19Y only · Sprinter 2500 4x4 3.0 V6 188/325
        "2022": ["19Y"],
        // OEM MY23 Launch brochure: 19Y only · Sprinter 2500 4x4 3.0 V6 188/325
        "2023": ["19Y"],
        // OEM MY24 Launch brochure: 19Y only · Sprinter 2500 AWD 2.0 211/332
        "2024": ["19Y"],
        // OEM MY26–27 Launch: 19A | 19Y | 19AG | 19YG · Sprinter 2500 AWD 2.0 211/332
        "2026": ["19A", "19Y", "19AG", "19YG"],
        "2027": ["19A", "19Y", "19AG", "19YG"],
      },
      lengthRange: [20, 20],
      weightRange: [8500, 9500],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [139000, 189000],
      engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 2500 AWD",
      transmission: "9-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.4,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 20,
      grayWater: 16,
      blackWater: 12,
      fuelCapacityGal: 24.5,
      generator: "confirm brochure — Sprinter Class B",
      awningLength: 10,
      ceilingHeight: 75,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2022,
      description: "Entegra Launch — Class B on Sprinter 2500. OEM MY22–23: 19Y, 3.0 V6 188 / 325, 4x4. MY24: 19Y, 2.0 211 / 332, AWD, 9-speed. MY26–27: 19A / 19Y / 19AG / 19YG. No sourced MY21 / MY25 brochure — omit those years. Do not copy 19A/19AG/19YG onto MY22–24.",
      powertrainByYear: [
        { from: 2022, to: 2023, engine: "Mercedes-Benz 3.0L V6 188HP", horsepower: 188, torqueLbFt: 325, chassis: "Mercedes-Benz Sprinter 2500 4x4", transmission: "7-speed automatic", notes: "OEM MY22–23 Launch 19Y: Sprinter 2500 4x4 · 3.0 V6 188 / 325" },
        { from: 2024, to: 2027, engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP", horsepower: 211, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 2500 AWD", transmission: "9-speed automatic", notes: "OEM MY24 / MY26–27 Launch: Sprinter 2500 AWD 211 / 332" },
      ],
    },
    "Ethos": {
      type: "Class B",
      floorplans: ["20A", "20D", "20E", "20T"],
      floorplansByYear: {
        // OEM MY21 Ethos year page / flyer: 20A | 20T · ProMaster 3500 3.6 V6 — HP not printed
        "2021": ["20A", "20T"],
        // OEM MY22 Ethos year page: 20A | 20T — do not add Ethos Li 20AL/20TL as a catalog line
        "2022": ["20A", "20T"],
        // OEM MY23 Ethos brochure: 20A | 20D | 20T — HP not printed
        "2023": ["20A", "20D", "20T"],
        // OEM MY24 Ethos brochure: 20A | 20D | 20T · 3.6 276/250
        "2024": ["20A", "20D", "20T"],
        // OEM MY26 Ethos brochure: 20A | 20E | 20T
        "2026": ["20A", "20E", "20T"],
        // OEM 2027 Ethos year page: 20E | 20T only — do not copy 20A forward
        "2027": ["20E", "20T"],
      },
      lengthRange: [21, 21],
      weightRange: [8500, 9500],
      slideouts: 0,
      sleeps: 3,
      msrpRange: [119000, 169000],
      engine: "RAM 3.6L V6 276HP",
      horsepower: 276,
      torqueLbFt: 250,
      chassis: "RAM ProMaster 3500",
      transmission: "9-speed automatic 948TE",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.35,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 20,
      grayWater: 16,
      blackWater: 12,
      fuelCapacityGal: 24,
      generator: "confirm brochure — ProMaster Class B gas",
      awningLength: 10,
      ceilingHeight: 75,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2021,
      description: "Entegra Ethos — Class B on RAM ProMaster 3500. OEM MY21–22: 20A / 20T, 3.6 V6 (HP not printed). MY23: 20A / 20D / 20T, HP not printed. MY24: same plans, 276 / 250. MY26: 20A / 20E / 20T; MY27: 20E / 20T. No sourced MY25 brochure — omit 2025. Do not copy 20E onto MY21–24. Ethos Li (20AL/20TL) is a separate OEM trim, not added here.",
      powertrainByYear: [
        { from: 2021, to: 2023, engine: "RAM 3.6L V6 (ProMaster 3500)", horsepower: 0, chassis: "RAM ProMaster 3500", transmission: "9-speed automatic 948TE", notes: "OEM MY21–23 Ethos: ProMaster 3500 3.6 V6 — HP not printed on brochure / flyer" },
        { from: 2024, to: 2027, engine: "RAM 3.6L V6 276HP", horsepower: 276, torqueLbFt: 250, chassis: "RAM ProMaster 3500", transmission: "9-speed automatic 948TE", notes: "OEM MY24 / MY26–27 Ethos: ProMaster 3500 gas 276/250" },
      ],
    },
    "Insignia": {
      type: "Class B",
      floorplans: ["24B"],
      floorplansByYear: {
        // OEM MY26–27 Insignia: 24B · Sprinter 3500 XD AWD 2.0 211/332
        "2026": ["24B"],
        "2027": ["24B"],
      },
      lengthRange: [24, 25],
      weightRange: [10000, 11000],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [179000, 229000],
      engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP",
      horsepower: 211,
      torqueLbFt: 332,
      chassis: "Mercedes-Benz Sprinter 3500 XD AWD",
      transmission: "9-speed automatic",
      fuelType: "Diesel",
      recalls: 0,
      rating: 4.45,
      image: RV_CARD_IMAGE,
      towingCapacity: 5000,
      freshWater: 24,
      grayWater: 20,
      blackWater: 16,
      fuelCapacityGal: 24.5,
      generator: "confirm brochure — Sprinter Class B",
      awningLength: 12,
      ceilingHeight: 75,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Insignia — Class B on Sprinter 3500 XD AWD. OEM MY26–27: 24B only, 2.0 211 / 332, 9-speed.",
      powertrainByYear: [
        { from: 2026, to: 2027, engine: "Mercedes-Benz 2.0L I4 Twin Turbo 211HP", horsepower: 211, torqueLbFt: 332, chassis: "Mercedes-Benz Sprinter 3500 XD AWD", transmission: "9-speed automatic", notes: "OEM MY26–27 Insignia 24B" },
      ],
    },
    "Arc": {
      type: "Class B",
      floorplans: ["18C"],
      floorplansByYear: {
        // OEM MY26–27 Arc: 18C · RAM ProMaster 1500 3.6 276/250 gas
        "2026": ["18C"],
        "2027": ["18C"],
      },
      lengthRange: [18, 18],
      weightRange: [7000, 8500],
      slideouts: 0,
      sleeps: 2,
      msrpRange: [99000, 139000],
      engine: "RAM 3.6L V6 276HP",
      horsepower: 276,
      torqueLbFt: 250,
      chassis: "RAM ProMaster 1500",
      transmission: "9-speed automatic 948TE",
      fuelType: "Gas",
      recalls: 0,
      rating: 4.3,
      image: RV_CARD_IMAGE,
      towingCapacity: 3500,
      freshWater: 16,
      grayWater: 12,
      blackWater: 10,
      fuelCapacityGal: 24,
      generator: "confirm brochure — compact ProMaster Class B gas",
      awningLength: 8,
      ceilingHeight: 75,
      founded: 2008,
      warrantyYears: 2,
      yearStart: 2026,
      description: "Entegra Arc — compact Class B on RAM ProMaster 1500, 3.6L 276 / 250 gas. OEM MY26–27: 18C only.",
      powertrainByYear: [
        { from: 2026, to: 2027, engine: "RAM 3.6L V6 276HP", horsepower: 276, torqueLbFt: 250, chassis: "RAM ProMaster 1500", transmission: "9-speed automatic 948TE", notes: "OEM MY26–27 Arc 18C" },
      ],
    },
  },
  "Monaco Coach": {
    Dynasty: {
      type: "Class A Diesel",
      floorplans: ["36P", "38P", "42P", "44BT", "44SE", "44TQ"],
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
        "2026": ["38P", "42P", "44BT", "44SE", "44TQ"]
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
      floorplans: ["36M", "40M", "40PRDQ", "42PDQ"],
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
        "2026": ["40M", "40PRDQ", "42PDQ"]
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
      floorplans: ["36P", "40P", "40DFT", "40PDQ", "44DFT"],
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
        "2023": ["36P", "40P", "40DFT", "40PDQ", "44DFT"]
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
      floorplans: ["38F", "38N", "38R", "38K", "40M", "43M", "45A"],
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
        "2026": ["38N", "38K", "40M", "43M", "45A"]
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
      floorplans: ["38F", "38R", "40B", "36M", "40P", "40R"],
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
        "2026": ["40B", "36M", "40P", "40R"]
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
      floorplans: ["36F", "38F", "40P", "44E", "45EL", "45F"],
      floorplansByYear: {
        "2020": ["36F", "38F", "40P"],
        "2021": ["36F", "38F", "40P"],
        "2022": ["36F", "38F", "40P"],
        "2023": ["36F", "38F", "40P"],
        "2024": ["36F", "38F", "40P"],
        "2025": ["38F", "40P"],
        "2026": ["38F", "40P", "44E", "45EL", "45F"]
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
      floorplans: ["33C", "35K", "36F", "32A", "35P"],
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
        "2026": ["33C", "35K", "32A", "35P"]
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
      floorplans: ["32A", "34P", "36A", "34RB", "36TX", "36U"],
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
        "2026": ["32A", "34P", "34RB", "36TX", "36U"]
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
      floorplans: ["25M", "29M", "31M", "26ME", "32DBH"],
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
        "2026": ["25M", "29M", "31M", "26ME", "32DBH"]
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
      floorplans: ["19CB", "24CB", "28A", "28B"],
      floorplansByYear: {
        "2024": ["19CB", "24CB"],
        "2025": ["19CB", "24CB"],
        "2026": ["19CB", "24CB", "28A", "28B"]
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
      floorplans: ["365", "375", "392", "415", "LM365", "LM392", "Atlanta", "Bar Harbor", "Billings", "Grand Canyon", "Nashville", "Savannah"],
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
        "2026": ["365", "375", "392", "Atlanta", "Bar Harbor", "Billings", "Grand Canyon", "Nashville", "Savannah"]
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
      floorplans: ["3150RL", "3500RL", "3560SS", "3702FL", "3902FL", "3000RD", "3155RLB", "3800BU", "4004SS"],
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
        "2026": ["3150RL", "3500RL", "3560SS", "3000RD", "3155RLB", "3800BU", "4004SS"]
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
      floorplans: ["325", "350", "371", "413", "323", "361", "T32", "T36"],
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
        "2026": ["325", "350", "323", "361", "T32", "T36"]
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
      floorplans: ["396", "427", "427DB", "431", "360", "390", "413"],
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
        "2026": ["396", "427", "431", "360", "390", "413"]
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
      floorplans: ["3120", "3210", "3500", "3550", "3580", "3760", "3800MB", "4150"],
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
        "2026": ["3120", "3210", "3580", "3760", "3800MB", "4150"]
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
      floorplans: ["FL", "RB", "TS", "TS Bench", "TS Twin", "TW", "XLFL", "XLRB", "FLTB", "FLTS", "XL", "XLBS", "XLTS"],
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
        "2026": ["FL", "RB", "TS", "TS Twin", "TW", "XLFL", "XLRB", "FLTB", "FLTS", "XL", "XLBS", "XLTS"]
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
      floorplans: ["FL", "TS", "TW", "FFB"],
      floorplansByYear: {
        "2018": ["TS"],
        "2019": ["TS", "FL"],
        "2020": ["TS", "FL"],
        "2021": ["TS", "FL"],
        "2022": ["TS", "FL"],
        "2023": ["TS", "FL", "TW"],
        "2024": ["TS", "FL", "TW"],
        "2025": ["TS", "FL", "TW"],
        "2026": ["TS", "FL", "TW", "FFB"]
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
      floorplans: ["TS", "FL", "RB", "TT"],
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
        "2026": ["TS", "FL", "TT"]
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
      floorplans: ["2.0", "2.2", "2.2 AWD", "2.2 RB", "4.0", "FTHB"],
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
        "2026": ["2.0", "2.2", "2.2 AWD", "2.2 RB", "4.0", "FTHB"]
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
      floorplans: ["Zion", "Slumber", "Sleeper", "SL", "170", "190P", "D"],
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
        "2026": ["Zion", "Slumber", "SL", "170", "190P", "D"]
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
      floorplans: ["Play", "Play+", "136"],
      floorplansByYear: {
        "2018": ["Play"],
        "2019": ["Play"],
        "2020": ["Play"],
        "2021": ["Play", "Play+"],
        "2022": ["Play", "Play+"],
        "2023": ["Play", "Play+"],
        "2024": ["Play", "Play+"],
        "2025": ["Play", "Play+"],
        "2026": ["Play", "Play+", "136"]
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
      floorplans: ["SS Agile", "Agile", "170"],
      floorplansByYear: {
        "2020": ["SS Agile", "Agile"],
        "2021": ["SS Agile", "Agile"],
        "2022": ["SS Agile", "Agile"],
        "2023": ["SS Agile", "Agile"],
        "2024": ["SS Agile", "Agile"],
        "2025": ["SS Agile", "Agile"],
        "2026": ["SS Agile", "Agile", "170"]
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
      floorplans: ["Chase", "Chase Plus", "170"],
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
        "2026": ["Chase", "170"]
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
      floorplans: ["190", "210", "Popular 190", "Popular 210", "170D", "170P"],
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
        "2026": ["190", "210", "170D", "170P"]
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
      floorplans: ["29DS", "30DS", "32DS", "33DS", "34DS", "31G", "35G", "36G", "37G", "38G"],
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
        "2026": ["29DS", "30DS", "32DS", "31G", "35G", "36G", "37G", "38G"]
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
      floorplans: ["32T", "33T", "35T", "37T", "38T", "32R", "35R", "36SR"],
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
        "2026": ["32T", "33T", "35T", "32R", "35R", "36SR"]
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
      floorplans: ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "32FBIS", "337BH", "38RLB", "22RBC", "253FBS", "29RBFQ", "31BHSS"],
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
        "2026": ["16BHQ", "25RKSS", "26FKDS", "28BHSS", "30RKQS", "32BHQS", "337BH", "22RBC", "253FBS", "29RBFQ", "31BHSS"]
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
      floorplans: ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "317BHSK", "267BHS", "282BH", "282BHSK"],
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
        "2026": ["202RB", "243BHS", "258RBSS", "294DBHS", "304RKDS", "267BHS", "282BH", "282BHSK"]
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
      floorplans: ["329DV", "340RK", "370FL", "380RL", "383FB", "383RLH", "388FKH", "340RLC", "378MB"],
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
        "2026": ["329DV", "380RL", "383FB", "383RLH", "388FKH", "340RLC", "378MB"]
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
      floorplans: ["1850", "2120", "2450", "2600", "26LRSS", "29QBI", "29RKSS"],
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
        "2026": ["1850", "2120", "26LRSS", "29QBI", "29RKSS"]
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
      floorplans: ["36DBQ", "37FLL", "38MBH", "36BHQ", "37FLH", "38RLB"],
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
        "2026": ["36DBQ", "37FLL", "36BHQ", "37FLH", "38RLB"]
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
      floorplans: ["383THS", "383TOC", "356THS", "357QBC", "373QBC", "388RBC"],
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
        "2026": ["356THS", "383THS", "357QBC", "373QBC", "388RBC"]
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
      floorplans: ["2705", "3200", "3605", "3905", "3814", "4015", "4114"],
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
        "2026": ["2705", "3200", "3814", "4015", "4114"]
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
      floorplans: ["3370RL", "3550FL", "3750FL", "3920MB", "3660RL", "3769FL", "3770MB", "3867FL"],
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
        "2026": ["3370RL", "3550FL", "3660RL", "3769FL", "3770MB", "3867FL"]
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
      floorplans: ["35MB", "38RW", "38RB", "38RBB", "40RBB", "45RB", "45RBB"],
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
        "2026": ["35MB", "38RW", "38RBB", "40RBB", "45RB", "45RBB"]
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
      floorplans: ["36VSB", "40VRB", "40VSB", "35RBB", "36RBB", "38RBB"],
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
        "2026": ["36VSB", "40VRB", "35RBB", "36RBB", "38RBB"]
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
      floorplans: ["36VSB", "40VRB", "37RB", "38RB"],
      floorplansByYear: {
        "2018": ["36VSB", "40VRB"],
        "2019": ["36VSB", "40VRB"],
        "2020": ["36VSB", "40VRB"],
        "2021": ["36VSB", "40VRB"],
        "2022": ["36VSB", "40VRB"],
        "2023": ["36VSB", "40VRB"],
        "2024": ["36VSB", "40VRB"],
        "2025": ["36VSB", "40VRB"],
        "2026": ["36VSB", "40VRB", "37RB", "38RB"]
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
      floorplans: ["38FSB", "40FSB", "40FSBXL", "34RBB", "38RBB", "45RBB"],
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
        "2026": ["38FSB", "40FSB", "34RBB", "38RBB", "45RBB"]
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
      floorplans: ["28DSB", "32DSB", "34RB", "38RB"],
      floorplansByYear: {
        "2018": ["28DSB", "32DSB"],
        "2019": ["28DSB", "32DSB"],
        "2020": ["28DSB", "32DSB"],
        "2021": ["28DSB", "32DSB"],
        "2022": ["28DSB", "32DSB"],
        "2023": ["28DSB", "32DSB"],
        "2024": ["28DSB", "32DSB"],
        "2025": ["28DSB", "32DSB"],
        "2026": ["28DSB", "32DSB", "34RB", "38RB"]
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
          from: 2014,
          to: 2018,
          engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter 3500 cowl",
          transmission: "5-speed automatic",
          notes: "Villagio — Sprinter cowl OM642. Not a Cummins pusher.",
        },
        {
          from: 2019,
          to: 2021,
          engine: "Mercedes-Benz 3.0L V6 turbodiesel",
          horsepower: 188,
          torqueLbFt: 325,
          chassis: "Mercedes-Benz Sprinter cowl",
        },
        {
          from: 2022,
          to: 2024,
          engine: "Mercedes-Benz 2.0L I4 turbodiesel",
          horsepower: 208,
          torqueLbFt: 332,
          chassis: "Mercedes-Benz Sprinter cowl",
        },
      ]
    },
    Villager: {
      type: "Class C",
      floorplans: ["25QBG", "25QBS", "25RE", "25RLE"],
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
        "2026": ["25QBG", "25QBS", "25RE", "25RLE"]
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
      floorplans: ["25VRB", "28VRB", "34RB", "37RB"],
      floorplansByYear: {
        "2020": ["25VRB", "28VRB"],
        "2021": ["25VRB", "28VRB"],
        "2022": ["25VRB", "28VRB"],
        "2023": ["25VRB", "28VRB"],
        "2024": ["25VRB", "28VRB"],
        "2025": ["25VRB", "28VRB"],
        "2026": ["25VRB", "28VRB", "34RB", "37RB"]
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
      floorplans: ["MODE", "Standard", "144", "170", "B-MODE", "C-MODE", "CLOUD-MODE", "FLY-MODE"],
      floorplansByYear: {
        "2018": ["MODE", "Standard"],
        "2019": ["MODE", "Standard"],
        "2020": ["MODE", "Standard", "144"],
        "2021": ["MODE", "Standard", "144", "170"],
        "2022": ["MODE", "Standard", "144", "170"],
        "2023": ["MODE", "Standard", "144", "170"],
        "2024": ["MODE", "Standard", "144", "170"],
        "2025": ["MODE", "Standard", "144", "170"],
        "2026": ["MODE", "Standard", "144", "170", "B-MODE", "C-MODE", "CLOUD-MODE", "FLY-MODE"]
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
      floorplans: ["Beast MODE", "Beast", "4x4", "4x4 B-MODE", "4x4 FLY"],
      floorplansByYear: {
        "2019": ["Beast MODE", "Beast"],
        "2020": ["Beast MODE", "Beast", "4x4"],
        "2021": ["Beast MODE", "Beast", "4x4"],
        "2022": ["Beast MODE", "Beast", "4x4"],
        "2023": ["Beast MODE", "Beast", "4x4"],
        "2024": ["Beast MODE", "Beast", "4x4"],
        "2025": ["Beast MODE", "Beast", "4x4"],
        "2026": ["Beast MODE", "Beast", "4x4", "4x4 B-MODE", "4x4 FLY"]
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
      floorplans: ["Classic", "Classic MODE", "Classic B", "Classic FLY"],
      floorplansByYear: {
        "2021": ["Classic", "Classic MODE"],
        "2022": ["Classic", "Classic MODE"],
        "2023": ["Classic", "Classic MODE"],
        "2024": ["Classic", "Classic MODE"],
        "2025": ["Classic", "Classic MODE"],
        "2026": ["Classic", "Classic MODE", "Classic B", "Classic FLY"]
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
      floorplans: ["Weekender", "144", "170", "24FW", "24RB", "24TB"],
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
        "2026": ["Weekender", "144", "170", "24FW", "24RB", "24TB"]
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
      floorplans: ["2815V", "3215V", "3415V", "4015V", "2815TDC", "3016TDC", "3116TDC", "3417TDC"],
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
        "2026": ["2815V", "3215V", "3415V", "4015V", "2815TDC", "3016TDC", "3116TDC", "3417TDC"]
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
      floorplans: ["2814", "3314", "3514", "4014", "23TDC", "27TDC", "30TDC", "34TDC"],
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
        "2026": ["2814", "3314", "3514", "4014", "23TDC", "27TDC", "30TDC", "34TDC"]
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
      floorplans: ["2414", "2715", "2915", "2311TDC", "2512TDC", "2713TDC"],
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
        "2026": ["2414", "2715", "2915", "2311TDC", "2512TDC", "2713TDC"]
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
      floorplans: ["19FS", "22FS", "28FS", "2412CK", "2514CK", "2816CK"],
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
        "2026": ["19FS", "22FS", "28FS", "2412CK", "2514CK", "2816CK"]
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
      floorplans: ["3615", "4015", "4215", "3012TDC", "3215TDC", "3416TDC"],
      floorplansByYear: {
        "2018": ["3615"],
        "2019": ["3615"],
        "2020": ["3615", "4015"],
        "2021": ["3615", "4015"],
        "2022": ["3615", "4015"],
        "2023": ["3615", "4015", "4215"],
        "2024": ["3615", "4015", "4215"],
        "2025": ["3615", "4015", "4215"],
        "2026": ["3615", "4015", "4215", "3012TDC", "3215TDC", "3416TDC"]
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
      floorplans: ["301TH", "331TH", "301THR12", "351TH", "290TH11K", "321TH12K", "362TH12K", "402TH13K"],
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
        "2026": ["301TH", "331TH", "301THR12", "351TH", "290TH11K", "321TH12K", "362TH12K", "402TH13K"]
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
      floorplans: ["301THR12", "331THR13", "351TH13", "241TE10K", "261TH10K", "280TH12K", "341TH12K"],
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
        "2026": ["301THR12", "331THR13", "351TH13", "241TE10K", "261TH10K", "280TH12K", "341TH12K"]
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
      floorplans: ["G333RLT", "G386FLF", "G348BH", "1500", "3012", "3203RW", "3350BHF", "3602PMIB"],
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
        "2026": ["G333RLT", "G386FLF", "G348BH", "1500", "3012", "3203RW", "3350BHF", "3602PMIB"]
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
      floorplans: ["3911TK", "4013TK", "4113TK", "4019", "4215", "4313"],
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
        "2026": ["3911TK", "4013TK", "4113TK", "4019", "4215", "4313"]
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
      floorplans: ["353TH13", "351TH13", "301TH12", "364TH", "394TH", "424TH"],
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
        "2026": ["353TH13", "351TH13", "301TH12", "364TH", "394TH", "424TH"]
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
      floorplans: ["C261RB", "C303BH", "C312BH", "261RB", "285RK", "311MB"],
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
        "2026": ["C261RB", "C303BH", "C312BH", "261RB", "285RK", "311MB"]
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
      floorplans: ["337RLS", "376FBH", "391RDN", "310BHS", "382FLH", "383FLH"],
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
        "2026": ["337RLS", "376FBH", "391RDN", "310BHS", "382FLH", "383FLH"]
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
      floorplans: ["310MHS", "338MHS", "376MHS", "256RLS", "296BH", "306RLS"],
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
        "2026": ["310MHS", "338MHS", "376MHS", "256RLS", "296BH", "306RLS"]
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
      floorplans: ["307RLS", "337RLS", "376FBH", "3X274BHS", "3X311BHS", "3X343RLS"],
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
        "2026": ["307RLS", "337RLS", "376FBH", "3X274BHS", "3X311BHS", "3X343RLS"]
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
      floorplans: ["286RLS", "318RLS", "344RLS", "360RLS", "377MBH", "397MBH"],
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
        "2026": ["286RLS", "318RLS", "344RLS", "360RLS", "377MBH", "397MBH"]
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
      floorplans: ["261TH", "281TH", "301TH", "22LR10", "25LR12", "28LR10"],
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
        "2026": ["261TH", "281TH", "301TH", "22LR10", "25LR12", "28LR10"]
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
      floorplans: ["5210", "5230", "5245", "5291", "5270", "5316", "5293DL", "5296WS"],
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
        "2026": ["5210", "5230", "5245", "5291", "5270", "5316", "5293DL", "5296WS"]
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
      floorplans: ["6316", "6320", "6330", "6341", "6350", "24RBS", "26RBK", "30TFL", "32TFL"],
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
        "2026": ["6316", "6320", "6330", "6341", "6350", "24RBS", "26RBK", "30TFL", "32TFL"]
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


export const MAKES = Object.keys(RV_DATA).sort();
