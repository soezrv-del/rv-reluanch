/**
 * Hard brochure corrections for known catalog / Live Grok mistakes.
 * These ALWAYS win over static rvData defaults AND over Live Grok powertrain
 * fields (engine / HP / torque / chassis / transmission). Expand as we verify.
 */

export type PowertrainCorrection = {
  /** Match year range inclusive */
  yearMin: number;
  yearEnd: number;
  makeIncludes: string;
  modelIncludes: string;
  /** Optional floorplan substring */
  floorplanIncludes?: string;
  engine: string;
  horsepower: number;
  torqueLbFt?: number;
  chassis?: string;
  transmission?: string;
  fuelType?: "Diesel" | "Gas" | "Propane";
  note?: string;
};

/**
 * Verified / brochure-backed patches. Prefer official MY brochures.
 * Display + cache layers pin these over Live Grok so sibling-model steals
 * (e.g. Allegro Bus ISL on a RED, gas F53 Allegro Open Road on a RED) never stick.
 */
export const POWERTRAIN_CORRECTIONS: PowertrainCorrection[] = [
  {
    yearMin: 2018,
    yearEnd: 2027,
    makeIncludes: "jayco",
    modelIncludes: "seneca",
    engine: "Cummins ISB 6.7L 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner S2RV Plus",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Jayco Seneca Super C OEM: ISB 6.7 360/800 · S2RV Plus · Allison 3000 MH · 100 gal · hitch 12k — not Power Stroke F-550 default",
  },
  {
    yearMin: 2018,
    yearEnd: 2026,
    makeIncludes: "entegra",
    modelIncludes: "accolade",
    engine: "Cummins ISB 6.7L 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner S2RV Plus",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Entegra Accolade / Accolade XL is the Seneca sibling: same S2RV Plus · ISB 6.7 360/800 · Allison 3000 MH · 100 gal · hitch 12k",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "entegra",
    modelIncludes: "centurion",
    floorplanIncludes: "39N",
    engine: "Detroit DD13 GEN 5 12.8L 525HP",
    horsepower: 525,
    torqueLbFt: 1850,
    chassis: "Freightliner Cascadia 116 Day Cab",
    transmission: "12-speed overdrive automated manual",
    fuelType: "Diesel",
    note: "Centurion 39N — Cascadia 116 · DD13 525/1850 · hitch 20k. Not Accolade ISB.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "entegra",
    modelIncludes: "centurion",
    floorplanIncludes: "39K",
    engine: "Detroit DD13 GEN 5 12.8L 525HP",
    horsepower: 525,
    torqueLbFt: 1850,
    chassis: "Freightliner Cascadia 116 Day Cab",
    transmission: "12-speed overdrive automated manual",
    fuelType: "Diesel",
    note: "Centurion 39K — Cascadia 116 · DD13 525/1850 · hitch 20k. Not Accolade ISB.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "entegra",
    modelIncludes: "centurion",
    floorplanIncludes: "45D",
    engine: "Detroit DD16 15.6L 600HP",
    horsepower: 600,
    torqueLbFt: 1850,
    chassis: "Freightliner Cascadia 126",
    transmission: "12-speed overdrive automated manual",
    fuelType: "Diesel",
    note: "Centurion 45D — Cascadia 126 · DD16 600/1850 · hitch 30k.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "entegra",
    modelIncludes: "centurion",
    engine: "Detroit DD13 GEN 5 12.8L 525HP",
    horsepower: 525,
    torqueLbFt: 1850,
    chassis: "Freightliner Cascadia 116 Day Cab",
    transmission: "12-speed overdrive automated manual",
    fuelType: "Diesel",
    note: "Centurion default 39-class DD13 525 — pick 45D for DD16 600",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "grand star",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner S2RV",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Grand Star Super C — S2RV B 360/800 hitch 12k. Not Cascadia.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "northern star",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner Custom Chassis",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Northern Star diesel pusher 360/800 — not Super C.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "summit aire",
    engine: "Detroit DD16 600HP",
    horsepower: 600,
    torqueLbFt: 1850,
    chassis: "Freightliner Cascadia 126 tandem axle",
    fuelType: "Diesel",
    note: "Summit Aire flagship Super C DD16 600 / 30k hitch",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "freedom aire",
    engine: "Mercedes-Benz 2.0L turbo diesel 208HP",
    horsepower: 208,
    torqueLbFt: 332,
    chassis: "Mercedes-Benz Sprinter 4500",
    fuelType: "Diesel",
    note: "Freedom Aire Sprinter 208/332 — not a pusher",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "super star",
    floorplanIncludes: "4140",
    engine: "Cummins 450HP (Freightliner M2-112)",
    horsepower: 450,
    torqueLbFt: 1250,
    chassis: "Freightliner M2-112",
    fuelType: "Diesel",
    note: "Super Star 41 ft M2-112 450",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "newmar",
    modelIncludes: "super star",
    engine: "Cummins 360HP (Freightliner M2-106)",
    horsepower: 360,
    torqueLbFt: 1150,
    chassis: "Freightliner M2-106",
    fuelType: "Diesel",
    note: "Super Star 37–40 default M2-106 360",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "grand design",
    modelIncludes: "lineage series e",
    engine: "Ford 7.3L V8 gas 325HP",
    horsepower: 325,
    torqueLbFt: 450,
    chassis: "Ford Econoline E-450 DRW",
    transmission: "6-speed TorqShift",
    fuelType: "Gas",
    note: "Lineage Series E — E-450 7.3 gas 325/450 · hitch 7,500. Not Sprinter.",
  },
  {
    yearMin: 2025,
    yearEnd: 2027,
    makeIncludes: "grand design",
    modelIncludes: "lineage series m",
    engine: "Mercedes-Benz 2.0L twin-turbo diesel 208HP",
    horsepower: 208,
    torqueLbFt: 332,
    chassis: "Mercedes-Benz Sprinter 4500",
    transmission: "9G-Tronic automatic",
    fuelType: "Diesel",
    note: "Lineage Series M — Sprinter 4500 208/332. Not E-450 gas.",
  },
  {
    yearMin: 2025,
    yearEnd: 2027,
    makeIncludes: "grand design",
    modelIncludes: "lineage series f",
    engine: "Ford 6.7L Power Stroke 330HP",
    horsepower: 330,
    torqueLbFt: 950,
    chassis: "Ford Super Duty 4x4",
    transmission: "10-speed automatic",
    fuelType: "Diesel",
    note: "Lineage Series F — Power Stroke 6.7 Super C 4x4. 31ZW F-600 15k hitch.",
  },
  {
    yearMin: 2026,
    yearEnd: 2027,
    makeIncludes: "grand design",
    modelIncludes: "lineage series vt",
    engine: "Ford 3.5L EcoBoost V6 310HP",
    horsepower: 310,
    torqueLbFt: 400,
    chassis: "Ford Transit 350 AWD",
    transmission: "10-speed automatic",
    fuelType: "Gas",
    note: "Lineage Series VT LVT1 — Transit AWD EcoBoost 310/400.",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "jayco",
    modelIncludes: "precept",
    engine: "Ford 7.3L V8 Godzilla 335HP",
    horsepower: 335,
    torqueLbFt: 468,
    chassis: "Ford F53",
    transmission: "TorqShift 6-speed automatic",
    fuelType: "Gas",
    note: "Precept is gas F53 335/468 — not diesel X15",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "jayco",
    modelIncludes: "alante",
    engine: "Ford 7.3L V8 Godzilla 335HP",
    horsepower: 335,
    torqueLbFt: 468,
    chassis: "Ford F53",
    transmission: "TorqShift 6-speed automatic",
    fuelType: "Gas",
    note: "Alante gas F53 — not diesel",
  },

  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "thor",
    modelIncludes: "vegas",
    engine: "Ford 7.3L V8 (Godzilla) 325HP",
    horsepower: 325,
    torqueLbFt: 450,
    chassis: "Ford E-Series cutaway (Class A body)",
    transmission: "TorqShift automatic",
    fuelType: "Gas",
    note: "Vegas compact RUV — cutaway chassis NOT F53; Thor OEM 325/450, 55 gal, hitch 8k",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "thor",
    modelIncludes: "axis",
    engine: "Ford 7.3L V8 (Godzilla) 325HP",
    horsepower: 325,
    torqueLbFt: 450,
    chassis: "Ford E-Series cutaway (Class A body)",
    transmission: "TorqShift automatic",
    fuelType: "Gas",
    note: "Axis sister to Vegas — same cutaway 7.3L package, not F53 ACE/Windsport",
  },
  {
    yearMin: 2014,
    yearEnd: 2019,
    makeIncludes: "thor",
    modelIncludes: "vegas",
    engine: "Ford Triton V10 6.8L",
    horsepower: 305,
    torqueLbFt: 420,
    chassis: "Ford E-350 / E-450 cutaway",
    fuelType: "Gas",
    note: "Early Vegas V10 cutaway",
  },
  {
    yearMin: 2014,
    yearEnd: 2019,
    makeIncludes: "thor",
    modelIncludes: "axis",
    engine: "Ford Triton V10 6.8L",
    horsepower: 305,
    torqueLbFt: 420,
    chassis: "Ford E-350 / E-450 cutaway",
    fuelType: "Gas",
    note: "Early Axis V10 cutaway",
  },

  // Fleetwood Discovery (regular, not LXE) — Cummins ISB / B6.7 class, not 8.9 ISL
  {
    yearMin: 2018,
    yearEnd: 2024,
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    engine: "Cummins B6.7 (ISB)",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XC-Series",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Regular Discovery — not LXE / not ISL 8.9",
  },
  {
    yearMin: 2018,
    yearEnd: 2024,
    makeIncludes: "fleetwood",
    modelIncludes: "discovery lxe",
    engine: "Cummins L9",
    horsepower: 450,
    torqueLbFt: 1250,
    chassis: "Freightliner / Spartan (by option)",
    fuelType: "Diesel",
    note: "Discovery LXE high-line",
  },
  // Entegra Reatta — mid diesel B6.7, not Aspire/Anthem L9
  {
    yearMin: 2018,
    yearEnd: 2026,
    makeIncludes: "entegra",
    modelIncludes: "reatta",
    engine: "Cummins B6.7 turbo diesel",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Spartan K1 raised-rail",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Reatta diesel — not Aspire/Anthem L9",
  },
  // Entegra Vision — gas F53 Godzilla only
  {
    yearMin: 2019,
    yearEnd: 2026,
    makeIncludes: "entegra",
    modelIncludes: "vision",
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 350,
    torqueLbFt: 468,
    chassis: "Ford F-53",
    transmission: "TorqShift 6-speed automatic",
    fuelType: "Gas",
    note: "Vision gas F-53 only — never diesel",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "bay star",
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 350,
    torqueLbFt: 468,
    chassis: "Ford F53",
    transmission: "TorqShift 6-speed automatic",
    fuelType: "Gas",
    note: "Bay Star gas F-53 Godzilla — never diesel L9 450; not Kountry Star",
  },
  // Forest River FR3 — gas F53 only (OEM brochure 335 HP / 468 lb-ft Godzilla)
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "forest river",
    modelIncludes: "fr3",
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 335,
    torqueLbFt: 468,
    chassis: "Ford F53",
    transmission: "TorqShift 6-speed automatic",
    fuelType: "Gas",
    note: "FR3 gas Class A — Ford 7.3 Godzilla 335/468 on F53; not diesel",
  },
  {
    yearMin: 2015,
    yearEnd: 2019,
    makeIncludes: "forest river",
    modelIncludes: "fr3",
    engine: "Ford Triton V10 6.8L",
    horsepower: 320,
    chassis: "Ford F53",
    transmission: "TorqShift automatic",
    fuelType: "Gas",
    note: "FR3 pre-Godzilla Triton V10 era",
  },
  // Newmar Kountry Star — diesel pusher (NOT gas F53 / Godzilla; NOT Dutch Star L9 450)
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "kountry star",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Kountry Star diesel pusher — Cummins B6.7 360/800 on Freightliner XCR (OEM). Not Bay Star 7.3 gas, not Dutch Star L9 450",
  },
  {
    yearMin: 2012,
    yearEnd: 2019,
    makeIncludes: "newmar",
    modelIncludes: "kountry star",
    engine: "Cummins ISB / B6.7 diesel",
    horsepower: 340,
    torqueLbFt: 700,
    chassis: "Freightliner XC / XCR",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Kountry Star mid-diesel — not Ford F53 gas, not L9 450",
  },
  // Thor Palazzo / Hurricane mid bands (common mixups)
  {
    yearMin: 2018,
    yearEnd: 2026,
    makeIncludes: "thor",
    modelIncludes: "palazzo",
    engine: "Cummins B6.7 (ISB) 340HP",
    horsepower: 340,
    torqueLbFt: 700,
    chassis: "Freightliner XC-S",
    transmission: "Allison 2100 / 2500 MH",
    fuelType: "Diesel",
    note: "Palazzo mid-diesel — not ISL 8.9",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "winnebago",
    modelIncludes: "forza",
    engine: "Cummins B6.7 (ISB) 340HP",
    horsepower: 340,
    torqueLbFt: 700,
    chassis: "Freightliner XC",
    fuelType: "Diesel",
    note: "Forza mid-diesel — not ISL 8.9",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "winnebago",
    modelIncludes: "journey",
    engine: "Cummins B6.7 / ISB 340HP",
    horsepower: 340,
    torqueLbFt: 700,
    chassis: "Freightliner XC",
    fuelType: "Diesel",
    note: "Journey diesel — B6.7 class not ISL",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "winnebago",
    modelIncludes: "adventurer",
    engine: "Ford 6.8L V10 / 7.3L Godzilla (by year)",
    horsepower: 320,
    chassis: "Ford F53",
    fuelType: "Gas",
    note: "Post-V10 F53 gas Class A",
  },
  // Tiffin Allegro RED (legacy nameplate) — diesel mid-coach, NEVER Ford V10 and NEVER ISL 8.9 bus class
  {
    yearMin: 2010,
    yearEnd: 2013,
    makeIncludes: "tiffin",
    modelIncludes: "allegro red",
    engine: "Cummins ISB 6.7L 340HP",
    horsepower: 340,
    torqueLbFt: 700,
    chassis: "Freightliner XC raised-rail",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Allegro RED diesel pusher — not Ford F53 V10 gas",
  },
  {
    yearMin: 2014,
    yearEnd: 2017,
    makeIncludes: "tiffin",
    modelIncludes: "allegro red",
    engine: "Cummins ISB / B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XC / XCR raised-rail",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "2014–2017 Allegro RED mid-diesel — not ISL 8.9 / not L9 flagship",
  },
  {
    yearMin: 2014,
    yearEnd: 2017,
    makeIncludes: "tiffin",
    modelIncludes: "allegro red 340",
    engine: "Cummins ISB / B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XC / XCR raised-rail",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "RED 340 2014–2017 — mid-diesel only",
  },
  {
    yearMin: 2018,
    yearEnd: 2026,
    makeIncludes: "tiffin",
    modelIncludes: "allegro red 340",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XC-Series",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "RED 340 mid-diesel — not L9/ISL bus class",
  },
  {
    yearMin: 2019,
    yearEnd: 2026,
    makeIncludes: "tiffin",
    modelIncludes: "allegro bus",
    engine: "Cummins L9 450HP (X12 optional)",
    horsepower: 450,
    torqueLbFt: 1250,
    chassis: "Tiffin PowerGlide",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    floorplanIncludes: "37bh",
    engine: "Cummins L9 380HP",
    horsepower: 380,
    torqueLbFt: 1150,
    chassis: "Freightliner / Tiffin PowerGlide (by option)",
    transmission: "Allison 3000 MH 6-speed",
    fuelType: "Diesel",
    note:
      "37BH Phaeton OEM: L9 380 / 1,150 only — 450 was NOT offered on 37BH.",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    floorplanIncludes: "44oh",
    engine: "Cummins L9 380HP (450 optional on tag axle)",
    horsepower: 380,
    torqueLbFt: 1150,
    chassis: "Freightliner / Tiffin PowerGlide (by option)",
    transmission: "Allison 3000 MH 6-speed",
    fuelType: "Diesel",
    note: "44OH — 380 standard; 450 may be available. Confirm build.",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    engine: "Cummins L9 380HP",
    horsepower: 380,
    torqueLbFt: 1150,
    chassis: "Freightliner / Tiffin PowerGlide (by option)",
    transmission: "Allison 3000 MH 6-speed",
    fuelType: "Diesel",
    note:
      "Phaeton brochure default L9 380/1150. 450 only on select floorplans (not 37BH).",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4037",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 40-ft class — OEM L9 400/1250 (not B6.7 360)",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4041",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 40-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4369",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 43-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4310",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 43-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "3436",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR / Spartan K2",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 34-ft class — OEM B6.7 360/800 (not L9)",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "3717",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR / Spartan K2",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 37-ft class — OEM B6.7 360/800",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "3407",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR / Spartan K2",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 34-ft class — OEM B6.7 360/800",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "3412",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR / Spartan K2",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 34-ft class — OEM B6.7 360/800",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "3709",
    engine: "Cummins B6.7 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCR / Spartan K2",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 37-ft class — OEM B6.7 360/800",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4068",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 40-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4326",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 43-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4328",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 43-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2020,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "ventana",
    floorplanIncludes: "4334",
    engine: "Cummins L9 400HP",
    horsepower: 400,
    torqueLbFt: 1250,
    chassis: "Freightliner XCR Tag / Spartan K2 Tag",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana 43-ft class — OEM L9 400/1250",
  },
  {
    yearMin: 2012,
    yearEnd: 2019,
    makeIncludes: "newmar",
    modelIncludes: "ventana le",
    engine: "Cummins ISB 6.7L 340HP",
    horsepower: 340,
    torqueLbFt: 800,
    chassis: "Freightliner XCR",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana LE default — ISB 340/800, not L9 400 and not Ford 7.3",
  },
  {
    yearMin: 2012,
    yearEnd: 2019,
    makeIncludes: "newmar",
    modelIncludes: "ventana le",
    floorplanIncludes: "4037",
    engine: "Cummins ISB 6.7L 360HP",
    horsepower: 360,
    torqueLbFt: 1000,
    chassis: "Freightliner XCR",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana LE 40-ft — ISB 360",
  },
  {
    yearMin: 2012,
    yearEnd: 2019,
    makeIncludes: "newmar",
    modelIncludes: "ventana le",
    floorplanIncludes: "4002",
    engine: "Cummins ISB 6.7L 360HP",
    horsepower: 360,
    torqueLbFt: 1000,
    chassis: "Freightliner XCR",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Ventana LE 40-ft — ISB 360",
  },
  // NO model-wide Ventana pin that forces 360 on every plan
  {
    yearMin: 2022,
    yearEnd: 2026,
    makeIncludes: "newmar",
    modelIncludes: "new aire",
    engine: "Cummins L9 450HP",
    horsepower: 450,
    torqueLbFt: 1250,
    chassis: "Freightliner / Spartan K2 (by option)",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Recent New Aire — L9 ~450/1250 (not B6.7 360)",
  },
  {
    yearMin: 2014,
    yearEnd: 2018,
    makeIncludes: "newmar",
    modelIncludes: "new aire",
    engine: "Cummins B6.7 / ISB 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XCS",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Early New Aire — B6.7/ISB 360/800",
  },
  // Fleetwood Bounder / Southwind gas V10 era
  {
    yearMin: 2005,
    yearEnd: 2015,
    makeIncludes: "fleetwood",
    modelIncludes: "bounder",
    engine: "Ford Triton V10 6.8L",
    horsepower: 320,
    chassis: "Ford F53",
    fuelType: "Gas",
    note: "2005–2015 Bounder — V10 era (not 7.3 Godzilla)",
  },
  {
    yearMin: 2005,
    yearEnd: 2015,
    makeIncludes: "fleetwood",
    modelIncludes: "southwind",
    engine: "Ford Triton V10 6.8L",
    horsepower: 320,
    chassis: "Ford F53",
    fuelType: "Gas",
    note: "2005–2015 gas Class A — Triton V10",
  },
  {
    yearMin: 2005,
    yearEnd: 2015,
    makeIncludes: "tiffin",
    modelIncludes: "allegro bus",
    engine: "Cummins ISL / ISB diesel (era)",
    horsepower: 380,
    chassis: "Freightliner / PowerGlide (by year)",
    fuelType: "Diesel",
    note: "2005–2015 Allegro Bus — confirm ISL rating on build sheet",
  },
  {
    yearMin: 2005,
    yearEnd: 2015,
    makeIncludes: "tiffin",
    modelIncludes: "phaeton",
    engine: "Cummins ISL / ISB diesel (era)",
    horsepower: 380,
    chassis: "Freightliner / PowerGlide (by year)",
    fuelType: "Diesel",
  },
  {
    yearMin: 2005,
    yearEnd: 2015,
    makeIncludes: "tiffin",
    modelIncludes: "allegro open road",
    engine: "Ford 6.8L V10 / E-450 (era)",
    horsepower: 305,
    chassis: "Ford F53 / E-450",
    fuelType: "Gas",
  },
  {
    yearMin: 2016,
    yearEnd: 2026,
    makeIncludes: "dynamax",
    modelIncludes: "isata 3",
    engine: "Mercedes-Benz 2.0L I4 turbodiesel",
    horsepower: 211,
    chassis: "Mercedes-Benz Sprinter",
    fuelType: "Diesel",
    note: "Isata 3 — Sprinter diesel (team catalog corrected)",
  },
  // Discovery modern pin (duplicate-safe longer window)
  {
    yearMin: 2015,
    yearEnd: 2026,
    makeIncludes: "fleetwood",
    modelIncludes: "discovery",
    engine: "Cummins B6.7 (ISB) 360HP",
    horsepower: 360,
    torqueLbFt: 800,
    chassis: "Freightliner XC-Series",
    transmission: "Allison 3000 MH",
    fuelType: "Diesel",
    note: "Regular Discovery — not LXE / not ISL 8.9",
  },
  {
    yearMin: 2013,
    yearEnd: 2021,
    makeIncludes: "winnebago",
    modelIncludes: "via",
    engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
    horsepower: 188,
    torqueLbFt: 325,
    chassis: "Mercedes-Benz Sprinter 3500 cowl",
    transmission: "5-speed automatic",
    fuelType: "Diesel",
    note: "Via 25P/25T — Sprinter OM642 188/325. Never Cummins ISL/ISB pusher.",
  },
  {
    yearMin: 2014,
    yearEnd: 2021,
    makeIncludes: "renegade",
    modelIncludes: "villagio",
    engine: "Mercedes-Benz OM642 3.0L V6 turbodiesel",
    horsepower: 188,
    torqueLbFt: 325,
    chassis: "Mercedes-Benz Sprinter 3500 cowl",
    fuelType: "Diesel",
    note: "Villagio Sprinter cowl OM642 — not a Cummins pusher.",
  },
];

/** Patterns that prove a Live Grok narrative stole a flagship/sibling powertrain. */
const FLAGSHIP_ENGINE_RE =
  /\b(isl\s*8\.?9|isl\b|l9\s*450|x15|x12\s*500|1[,.]?250\s*lb|1250\s*lb|450\s*hp)\b/i;
const GAS_V10_RE =
  /\b(triton|v10|6\.8l\s*v10|ford\s*f-?53|torqshift|godzilla)\b/i;
const MID_DIESEL_RE = /\b(isb|b6\.7|b6\.7|340\s*hp|360\s*hp)\b/i;

export function findPowertrainCorrection(
  year: string | number,
  make: string,
  model: string,
  floorplan?: string,
): PowertrainCorrection | null {
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return null;
  const mk = make.toLowerCase();
  const md = model.toLowerCase().replace(/\s+/g, " ").trim();
  const fp = (floorplan || "").toLowerCase();

  // Prefer floorplan-specific pins, then longer modelIncludes
  const hits = POWERTRAIN_CORRECTIONS.filter((c) => {
    if (y < c.yearMin || y > c.yearEnd) return false;
    if (!mk.includes(c.makeIncludes.toLowerCase())) return false;
    if (!md.includes(c.modelIncludes.toLowerCase())) return false;
    if (c.floorplanIncludes) {
      const cfp = c.floorplanIncludes.toLowerCase().replace(/[\s\-_/]/g, "");
      const nfp = fp.replace(/[\s\-_/]/g, "");
      if (!nfp || (!nfp.includes(cfp) && !cfp.includes(nfp))) return false;
    }
    // Avoid matching "discovery" rule on "discovery lxe" when a more specific exists
    if (c.modelIncludes === "discovery" && md.includes("discovery lxe")) {
      return false;
    }
    // Bare "ventana" must not stamp L9 400 onto Ventana LE
    if (c.modelIncludes === "ventana" && md.includes("ventana le")) {
      return false;
    }
    // Avoid matching bare "allegro red" on "allegro red 340/360"
    if (
      c.modelIncludes === "allegro red" &&
      (md.includes("allegro red 340") ||
        md.includes("allegro red 360") ||
        md.includes("allegro red340") ||
        md.includes("allegro red360"))
    ) {
      return false;
    }
    // Avoid matching bare "reatta" on "reatta xl" if needed later
    if (c.modelIncludes === "reatta" && md.includes("reatta xl")) {
      return false;
    }
    // Vision diesel trim is a different product
    if (
      c.modelIncludes === "vision" &&
      (md.includes("vision xl") || md.includes("diesel"))
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const af = a.floorplanIncludes ? 1 : 0;
    const bf = b.floorplanIncludes ? 1 : 0;
    if (bf !== af) return bf - af;
    return b.modelIncludes.length - a.modelIncludes.length;
  });

  return hits[0] ?? null;
}

/** True when Live Grok engine text conflicts with a brochure pin. */
export function powertrainConflictsWithPin(
  pin: PowertrainCorrection,
  engine: string | null | undefined,
  horsepower?: number | null,
): boolean {
  if (!engine) return false;
  const live = engine.toLowerCase();
  const pinned = pin.engine.toLowerCase();
  const pinIsMid =
    MID_DIESEL_RE.test(pinned) && !/isl|l9|x15|x12/.test(pinned);
  const liveIsFlagship =
    FLAGSHIP_ENGINE_RE.test(live) ||
    (horsepower != null &&
      pin.horsepower <= 380 &&
      horsepower >= 450);
  if (pinIsMid && liveIsFlagship) return true;
  if (
    /cummins|diesel|isb|b6/.test(pinned) &&
    GAS_V10_RE.test(live) &&
    !/cummins|isb|b6|l9|isl/.test(live)
  ) {
    return true;
  }
  if (
    pin.fuelType === "Gas" &&
    /cummins|diesel|isb|l9|isl/.test(live)
  ) {
    return true;
  }
  return false;
}

/**
 * Rewrite overview / feature chips that still name the wrong powertrain.
 * Keeps market/lifestyle language; strips sibling-engine claims.
 */
export function sanitizeNarrativeForPin(
  pin: PowertrainCorrection,
  text: string | null | undefined,
): string | null {
  if (!text) return text ?? null;
  let t = text;
  const eng = pin.engine;
  const hp = pin.horsepower;
  const tq = pin.torqueLbFt;

  // Replace common wrong powertrains with the pin label
  t = t.replace(
    /Cummins\s+ISL(?:\s*8\.?9L?)?(?:\s+\d+\s*HP)?(?:\s*\/\s*[\d,]+\s*lb-?ft)?/gi,
    eng,
  );
  t = t.replace(
    /Cummins\s+L9(?:\s+\d+\s*HP)?(?:\s*\/\s*[\d,]+\s*lb-?ft)?/gi,
    eng,
  );
  t = t.replace(
    /Ford\s+Triton\s+V10(?:\s*6\.8L)?(?:\s*\([^)]*\))?/gi,
    eng,
  );
  t = t.replace(/Ford\s+F-?53(?:\s+chassis)?/gi, pin.chassis || "chassis");
  t = t.replace(/\b450\s*HP\b/gi, `${hp} HP`);
  t = t.replace(/\b1[,.]?250\s*lb-?ft\b/gi, tq ? `${tq.toLocaleString()} lb-ft` : `${hp} HP class`);
  t = t.replace(/\b320\s*HP\b/gi, `${hp} HP`);
  t = t.replace(/\b832\s*lb-?ft\b/gi, tq ? `${tq.toLocaleString()} lb-ft` : "");

  // Drop "early gas Red / gas F53" myths when pin is diesel RED
  if (pin.fuelType === "Diesel" || /cummins|isb|b6/i.test(pin.engine)) {
    t = t.replace(/\bearly\s+years?\s+gas\s+F-?53[^.]*\./gi, "");
    t = t.replace(/\bearly\s+gas\s+Red\b/gi, "diesel Allegro RED");
    t = t.replace(/\bgas\s+F-?53[^.]*\./gi, "");
    t = t.replace(/\b\(gas years\)/gi, "");
  }

  return t.replace(/\s{2,}/g, " ").trim() || null;
}

export function sanitizeFeaturesForPin(
  pin: PowertrainCorrection,
  features: string[] | null | undefined,
): string[] {
  if (!features?.length) return [];
  return features
    .map((f) => sanitizeNarrativeForPin(pin, f) || "")
    .filter(Boolean)
    .filter((f) => {
      // Drop chips that still scream wrong flagship after sanitize
      if (powertrainConflictsWithPin(pin, f)) return false;
      return true;
    })
    .slice(0, 8);
}
