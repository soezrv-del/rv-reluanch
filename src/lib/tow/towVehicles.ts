/** OEM-style tow ratings for RvTow (approx. when properly equipped). */

export type VehicleKind = "truck" | "suv";

export type TowTrim = {
  label: string;
  maxTow: number;
  payload: number;
  gcwr: number;
  hitch: string;
};

export type TowModel = {
  name: string;
  kind: VehicleKind;
  trims: TowTrim[];
};

export type TowMake = {
  name: string;
  models: TowModel[];
};

export type TowRating = TowTrim & { kind: VehicleKind };

export const TOW_MAKES: TowMake[] = [
  {
    "name": "Chevrolet",
    "models": [
      {
        "name": "Avalanche",
        "kind": "truck",
        "trims": [
          {
            "label": "LS — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2005–2006)",
            "maxTow": 8100,
            "payload": 1300,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2007–2013)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2007–2013)",
            "maxTow": 8300,
            "payload": 1350,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.0L V8 (2007–2013)",
            "maxTow": 8100,
            "payload": 1300,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2010–2013)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2010–2013)",
            "maxTow": 8100,
            "payload": 1350,
            "gcwr": 11450,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2010–2013)",
            "maxTow": 8000,
            "payload": 1300,
            "gcwr": 11300,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.0L V8 (2010–2013)",
            "maxTow": 8100,
            "payload": 1250,
            "gcwr": 11350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Colorado",
        "kind": "truck",
        "trims": [
          {
            "label": "WT — 2.7L Turbo",
            "maxTow": 3500,
            "payload": 1570,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LT — 2.7L Turbo",
            "maxTow": 7700,
            "payload": 1620,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 2.7L Turbo",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Trail Boss — 2.7L Turbo",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 2.7L Turbo",
            "maxTow": 6000,
            "payload": 1320,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.5L I4 (2018–2022)",
            "maxTow": 3500,
            "payload": 1420,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LT — 3.6L V6 (2018–2022)",
            "maxTow": 7000,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 3.6L V6 (2018–2022)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 3.6L V6 (2018–2022)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1420,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LT — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "WT — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 3.6L V6 (2017–2018)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7600,
            "payload": 1500,
            "gcwr": 12400,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 2.8L Duramax Diesel (2017–2018)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.8L I4 (2005–2006)",
            "maxTow": 1900,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "LS — 3.5L I5 (2005–2006)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Z71 — 3.5L I5 (2005–2006)",
            "maxTow": 4000,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "WT — 2.9L I4 (2007–2012)",
            "maxTow": 2200,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LT — 3.7L I5 (2007–2012)",
            "maxTow": 5500,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 3.7L I5 (2007–2012)",
            "maxTow": 5500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2009–2012)",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.9L I4 (2010–2012)",
            "maxTow": 4000,
            "payload": 1300,
            "gcwr": 7300,
            "hitch": "Class III"
          },
          {
            "label": "LT — 3.7L I5 (2010–2012)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2010–2012)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.5L I4 (2015–2018 redesign)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 6950,
            "hitch": "Class III"
          },
          {
            "label": "Diesel — 2.8L Duramax (2016–2018)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Silverado 1500",
        "kind": "truck",
        "trims": [
          {
            "label": "WT — 2.7L Turbo I4",
            "maxTow": 9500,
            "payload": 1980,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8",
            "maxTow": 11300,
            "payload": 2100,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "RST — 5.3L V8",
            "maxTow": 11400,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.2L V8 Max Trailering",
            "maxTow": 13200,
            "payload": 2250,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.0L Duramax Diesel",
            "maxTow": 13300,
            "payload": 2050,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "ZR2 — 6.2L V8 Off-Road",
            "maxTow": 8900,
            "payload": 1460,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — 4.3L V6 (2018–2019)",
            "maxTow": 7600,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Custom — 2.7L Turbo (2019–2021)",
            "maxTow": 9100,
            "payload": 1980,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2018–2021)",
            "maxTow": 11400,
            "payload": 2100,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LT Trail Boss — 5.3L V8 (2019–2021)",
            "maxTow": 9000,
            "payload": 1800,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "RST — 5.3L V8 (2019–2021)",
            "maxTow": 11400,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.2L V8 Max Trailering (2019–2021)",
            "maxTow": 13300,
            "payload": 2250,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2019–2021)",
            "maxTow": 12000,
            "payload": 2100,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.0L Duramax Diesel (2020–2021)",
            "maxTow": 13300,
            "payload": 2050,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2015–2018)",
            "maxTow": 7200,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Custom — 4.3L V6 (2016–2018)",
            "maxTow": 7200,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 4.3L V6 (2015–2018)",
            "maxTow": 7200,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2015–2018)",
            "maxTow": 11600,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LT Z71 — 5.3L V8 (2015–2018)",
            "maxTow": 9200,
            "payload": 1800,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2015–2018)",
            "maxTow": 11600,
            "payload": 2000,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.2L V8 Max Trailering (2015–2018)",
            "maxTow": 12500,
            "payload": 2100,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 5.3L V8 (2015–2018)",
            "maxTow": 11000,
            "payload": 1950,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2015–2018)",
            "maxTow": 12000,
            "payload": 2050,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2005–2006)",
            "maxTow": 4100,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "LS — 4.8L V8 (2005–2006)",
            "maxTow": 6400,
            "payload": 1750,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2005–2006)",
            "maxTow": 7800,
            "payload": 1850,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.0L V8 Max Trailering (2005–2006)",
            "maxTow": 10400,
            "payload": 1900,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2007–2013)",
            "maxTow": 4500,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "LS — 4.8L V8 (2007–2013)",
            "maxTow": 6700,
            "payload": 1800,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2007–2013)",
            "maxTow": 8500,
            "payload": 1900,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2007–2013)",
            "maxTow": 9000,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.0L / 6.2L V8 Max Trailering (2007–2013)",
            "maxTow": 10800,
            "payload": 1950,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2014)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2014)",
            "maxTow": 9200,
            "payload": 1950,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2014)",
            "maxTow": 9600,
            "payload": 1900,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2014)",
            "maxTow": 12000,
            "payload": 2000,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — 4.3L V6 (2010–2013)",
            "maxTow": 4800,
            "payload": 1500,
            "gcwr": 8300,
            "hitch": "Class III"
          },
          {
            "label": "Work Truck — 4.8L V8 (2010–2013)",
            "maxTow": 6700,
            "payload": 1600,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2010–2013)",
            "maxTow": 9800,
            "payload": 1800,
            "gcwr": 13600,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2010–2013)",
            "maxTow": 9800,
            "payload": 1750,
            "gcwr": 13550,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.2L V8 (2010–2013)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 (2010–2013)",
            "maxTow": 6100,
            "payload": 1500,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — 4.3L V6 (2014–2018)",
            "maxTow": 7200,
            "payload": 1750,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 4.3L V6 (2014–2018)",
            "maxTow": 7200,
            "payload": 1750,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1950,
            "gcwr": 15550,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1900,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 6.2L V8 (2014–2018)",
            "maxTow": 12000,
            "payload": 1850,
            "gcwr": 15850,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1850,
            "gcwr": 15450,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2014–2018)",
            "maxTow": 12000,
            "payload": 1800,
            "gcwr": 15800,
            "hitch": "Class IV"
          },
          {
            "label": "LT Double Cab — 5.3L V8 Max Trailering (2015–2018)",
            "maxTow": 12200,
            "payload": 2000,
            "gcwr": 16200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Silverado 2500HD",
        "kind": "truck",
        "trims": [
          {
            "label": "WT — 6.6L Gas V8",
            "maxTow": 14500,
            "payload": 3600,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "LT — 6.6L Gas V8",
            "maxTow": 14800,
            "payload": 3700,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "LT — 6.6L Duramax Diesel",
            "maxTow": 18500,
            "payload": 3979,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "LTZ — 6.6L Duramax Diesel",
            "maxTow": 20000,
            "payload": 3979,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "High Country — 6.6L Duramax Diesel",
            "maxTow": 20000,
            "payload": 3700,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "ZR2 — 6.6L Duramax Diesel",
            "maxTow": 13200,
            "payload": 2900,
            "gcwr": 25000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 6.0L Gas V8 (2018–2019)",
            "maxTow": 14500,
            "payload": 3500,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 18500,
            "payload": 3900,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "LTZ — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 20000,
            "payload": 3979,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "High Country — 6.6L Duramax (2020–2021)",
            "maxTow": 20000,
            "payload": 3700,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "WT — 6.0L Gas V8 (2015–2018)",
            "maxTow": 13000,
            "payload": 3300,
            "gcwr": 22000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.0L Gas V8 (2015–2018)",
            "maxTow": 13000,
            "payload": 3400,
            "gcwr": 22000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 18000,
            "payload": 3800,
            "gcwr": 27500,
            "hitch": "Class V"
          },
          {
            "label": "LTZ — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 19500,
            "payload": 3900,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "High Country — 6.6L Duramax (2015–2018)",
            "maxTow": 19500,
            "payload": 3700,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "WT — 6.0L Gas V8 (2005–2006)",
            "maxTow": 9800,
            "payload": 2800,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2005–2006)",
            "maxTow": 12000,
            "payload": 3000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "WT — 6.0L Gas V8 (2007–2010)",
            "maxTow": 10500,
            "payload": 2900,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2007–2010)",
            "maxTow": 13000,
            "payload": 3200,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ — 6.6L Duramax Diesel (2007–2010)",
            "maxTow": 15500,
            "payload": 3100,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "WT — 6.0L Gas V8 (2011–2014)",
            "maxTow": 13000,
            "payload": 3000,
            "gcwr": 19500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 16000,
            "payload": 3300,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "LTZ — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 18000,
            "payload": 3200,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck — 6.0L Gas V8 (2010)",
            "maxTow": 13000,
            "payload": 3200,
            "gcwr": 18200,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.0L Gas V8 (2010)",
            "maxTow": 13000,
            "payload": 3100,
            "gcwr": 18100,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.6L Duramax Diesel (2010)",
            "maxTow": 15700,
            "payload": 3400,
            "gcwr": 21100,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck — 6.0L Gas V8 (2011–2014 redesign)",
            "maxTow": 13000,
            "payload": 3400,
            "gcwr": 18400,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 6.0L Gas V8 (2011–2014)",
            "maxTow": 13000,
            "payload": 3300,
            "gcwr": 18300,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — 6.0L Gas V8 (2015–2018)",
            "maxTow": 14500,
            "payload": 3600,
            "gcwr": 20100,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Silverado 3500HD",
        "kind": "truck",
        "trims": [
          {
            "label": "WT SRW — 6.6L Gas V8",
            "maxTow": 16000,
            "payload": 4200,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "LT SRW — 6.6L Duramax Diesel",
            "maxTow": 20000,
            "payload": 4450,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW — 6.6L Duramax Diesel",
            "maxTow": 36000,
            "payload": 7440,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "High Country DRW — 6.6L Duramax Diesel gooseneck",
            "maxTow": 36000,
            "payload": 7200,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Chassis Cab DRW — 6.6L Duramax (5th-wheel ready)",
            "maxTow": 35300,
            "payload": 7000,
            "gcwr": 47000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2018–2019)",
            "maxTow": 15000,
            "payload": 4000,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "LT DRW — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 23100,
            "payload": 7000,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW — 6.6L Duramax gooseneck (2019–2021)",
            "maxTow": 35500,
            "payload": 7400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "High Country DRW — 6.6L Duramax (2020–2021)",
            "maxTow": 35500,
            "payload": 7200,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2015–2018)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "LT SRW — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 18000,
            "payload": 4500,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "LT DRW — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 23100,
            "payload": 6500,
            "gcwr": 38000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW — 6.6L Duramax gooseneck (2015–2018)",
            "maxTow": 23100,
            "payload": 6800,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "High Country DRW — 6.6L Duramax (2015–2018)",
            "maxTow": 23100,
            "payload": 6600,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2005–2006)",
            "maxTow": 11000,
            "payload": 3500,
            "gcwr": 18000,
            "hitch": "Class IV"
          },
          {
            "label": "LT DRW — 6.6L Duramax Diesel (2005–2006)",
            "maxTow": 15000,
            "payload": 4200,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2007–2010)",
            "maxTow": 12000,
            "payload": 3600,
            "gcwr": 19500,
            "hitch": "Class IV"
          },
          {
            "label": "LT DRW — 6.6L Duramax Diesel (2007–2010)",
            "maxTow": 17000,
            "payload": 4500,
            "gcwr": 27000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW gooseneck — 6.6L Duramax (2007–2010)",
            "maxTow": 20000,
            "payload": 4400,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2011–2014)",
            "maxTow": 14000,
            "payload": 3800,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "LT DRW — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 19000,
            "payload": 4800,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW gooseneck — 6.6L Duramax (2011–2014)",
            "maxTow": 23000,
            "payload": 4700,
            "gcwr": 33000,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck SRW — 6.0L Gas (2010–2014)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "LT DRW — 6.6L Duramax (2010–2014)",
            "maxTow": 20000,
            "payload": 5500,
            "gcwr": 27500,
            "hitch": "Class V"
          },
          {
            "label": "LTZ DRW — 6.6L Duramax gooseneck (2010–2014)",
            "maxTow": 21000,
            "payload": 6000,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck SRW — 6.0L Gas (2015–2018)",
            "maxTow": 14500,
            "payload": 4200,
            "gcwr": 20700,
            "hitch": "Class V"
          },
          {
            "label": "LT SRW — 6.6L Duramax (2015–2018)",
            "maxTow": 18000,
            "payload": 4500,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "LT DRW — 6.6L Duramax (2015–2018)",
            "maxTow": 23100,
            "payload": 6500,
            "gcwr": 31600,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Silverado EV",
        "kind": "truck",
        "trims": [
          {
            "label": "WT — Dual Motor AWD",
            "maxTow": 8000,
            "payload": 1300,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "RST — Dual Motor AWD",
            "maxTow": 10000,
            "payload": 1400,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "RST Max Range — Dual Motor",
            "maxTow": 10000,
            "payload": 1350,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Trail Boss — Dual Motor Off-Road",
            "maxTow": 8900,
            "payload": 1250,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — Extended Range (fleet)",
            "maxTow": 10000,
            "payload": 1500,
            "gcwr": 18000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Blazer",
        "kind": "suv",
        "trims": [
          {
            "label": "2LT — 2.0L Turbo",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 11200,
            "hitch": "Class III"
          },
          {
            "label": "3LT — 3.6L V6",
            "maxTow": 4500,
            "payload": 1250,
            "gcwr": 11250,
            "hitch": "Class III"
          },
          {
            "label": "RS — 3.6L V6",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 11200,
            "hitch": "Class III"
          },
          {
            "label": "LT — 2.5L I4 (2019–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "LT — 3.6L V6 (2019–2021)",
            "maxTow": 4500,
            "payload": 1600,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "RS — 3.6L V6 (2019–2021)",
            "maxTow": 4500,
            "payload": 1550,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Premier — 3.6L V6 (2019–2021)",
            "maxTow": 4500,
            "payload": 1550,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "L — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "LT — 2.5L / 3.6L (2019–2021)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 7800,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Blazer EV",
        "kind": "suv",
        "trims": [
          {
            "label": "LT — Dual Motor AWD",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "RS — Dual Motor AWD",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "SS — Dual Motor AWD",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Captiva Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 2.4L I4 (2012–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "LT — 3.0L V6 (2012–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LTZ — 3.0L V6 (2012–2014)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LS — 2.4L (2012–2015 fleet)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LT — 2.4L / 3.0L (2012–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "LTZ — 3.0L V6 (2012–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Equinox",
        "kind": "suv",
        "trims": [
          {
            "label": "LT — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "RS — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "L — 2.4L I4 (2015–2017)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LS — 2.4L I4 (2015–2017)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LT — 3.6L V6 (2015–2017)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Premier — 3.6L V6 (2015–2017)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "L — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LS — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LT — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LT — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Premier — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "LS — 3.4L V6 (2005–2009)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "LT — 3.4L V6 (2005–2009)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "LS — 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "LT — 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "LT — 3.0L / 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LTZ — 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LT — 2.0L Turbo (2018–2020)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Premier — 1.5L / 2.0L (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Diesel — 1.6L (2018–2019)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "LS — 2.4L (2010–2017)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LT — 2.4L (2010–2017)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LT — 3.0L V6 (2010–2012)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "LT — 3.6L V6 (2013–2017)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "LTZ — 2.4L / 3.6L (2010–2017)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Diesel — 2.0L (2018 last gen2/intro gen3 mix)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "L — 1.5L Turbo (2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LS — 1.5L Turbo (2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LT — 1.5L / 2.0L Turbo (2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Premier — 1.5L / 2.0L (2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Equinox EV",
        "kind": "suv",
        "trims": [
          {
            "label": "LT — FWD",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "RS — AWD",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "Activ — AWD",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Suburban",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 5.3L V8",
            "maxTow": 7900,
            "payload": 1720,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 Max Trailering",
            "maxTow": 8300,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.0L Duramax Diesel",
            "maxTow": 8000,
            "payload": 1580,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2015–2020)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2015–2020)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L V8 (2015–2020)",
            "maxTow": 8100,
            "payload": 1700,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2021)",
            "maxTow": 8300,
            "payload": 1850,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2021)",
            "maxTow": 8300,
            "payload": 1850,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2021)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1650,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L / 6.0L V8 (2005–2006)",
            "maxTow": 8100,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2007–2014)",
            "maxTow": 7100,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2007–2014)",
            "maxTow": 8100,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L / 6.0L V8 (2007–2014)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1700,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2018–2020)",
            "maxTow": 8000,
            "payload": 1600,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2021 redesign)",
            "maxTow": 8300,
            "payload": 1800,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "RST — 5.3L (2021)",
            "maxTow": 8100,
            "payload": 1700,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 5.3L (2021)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2021)",
            "maxTow": 8000,
            "payload": 1650,
            "gcwr": 11650,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L (2021)",
            "maxTow": 7800,
            "payload": 1600,
            "gcwr": 11400,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 11700,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L / 6.2L (2010–2014)",
            "maxTow": 8000,
            "payload": 1550,
            "gcwr": 11550,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2015–2018 redesign)",
            "maxTow": 8300,
            "payload": 1700,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2015–2018)",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2015–2018)",
            "maxTow": 8000,
            "payload": 1600,
            "gcwr": 11600,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Tahoe",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 5.3L V8",
            "maxTow": 7700,
            "payload": 1680,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 Max Trailering",
            "maxTow": 8400,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 6.2L V8",
            "maxTow": 8400,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.0L Duramax Diesel",
            "maxTow": 8200,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2015–2020)",
            "maxTow": 8600,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2015–2020)",
            "maxTow": 8600,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L V8 (2015–2020)",
            "maxTow": 8400,
            "payload": 1650,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 6.2L V8 (2018–2020)",
            "maxTow": 8400,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2021)",
            "maxTow": 8400,
            "payload": 1800,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2021)",
            "maxTow": 8400,
            "payload": 1800,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 5.3L V8 (2021)",
            "maxTow": 8200,
            "payload": 1700,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 6.2L V8 (2021)",
            "maxTow": 8400,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 4.8L V8 (2005–2006)",
            "maxTow": 6500,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Z71 — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 4.8L / 5.3L V8 (2007–2014)",
            "maxTow": 6200,
            "payload": 1600,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2007–2014)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L / 6.2L V8 (2007–2014)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 Hybrid (2008–2013)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2018–2020)",
            "maxTow": 8600,
            "payload": 1600,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2018–2020)",
            "maxTow": 8600,
            "payload": 1550,
            "gcwr": 12150,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2018–2020)",
            "maxTow": 8400,
            "payload": 1500,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2021 redesign)",
            "maxTow": 8400,
            "payload": 1700,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "RST — 5.3L / 6.2L (2021)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2021)",
            "maxTow": 8200,
            "payload": 1550,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Diesel — 3.0L Duramax (2021)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2010–2014)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 12050,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2010–2014)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 5.3L / 6.2L (2010–2014)",
            "maxTow": 8400,
            "payload": 1450,
            "gcwr": 11850,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 (2010–2013)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2015–2018 redesign)",
            "maxTow": 8600,
            "payload": 1600,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2015–2018)",
            "maxTow": 8600,
            "payload": 1550,
            "gcwr": 12150,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 5.3L / 6.2L (2015–2018)",
            "maxTow": 8400,
            "payload": 1500,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "RST — 5.3L / 6.2L (2018)",
            "maxTow": 8400,
            "payload": 1500,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 6.2L V8 (2015–2018)",
            "maxTow": 8400,
            "payload": 1450,
            "gcwr": 11850,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Trailblazer",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 1.2L Turbo",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 6450,
            "hitch": "Class II"
          },
          {
            "label": "LT — 1.3L Turbo",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "ACTIV — 1.3L Turbo",
            "maxTow": 1000,
            "payload": 980,
            "gcwr": 6480,
            "hitch": "Class II"
          },
          {
            "label": "RS — 1.3L Turbo",
            "maxTow": 1000,
            "payload": 970,
            "gcwr": 6470,
            "hitch": "Class II"
          },
          {
            "label": "LS — 1.2L Turbo (2021)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "LT — 1.3L Turbo (2021)",
            "maxTow": 1000,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "ACTIV — 1.3L Turbo (2021)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "RS — 1.3L Turbo (2021)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "L — 1.2L Turbo (2021 intro)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "LS — 1.2L / 1.3L (2021)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "TrailBlazer",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 4.2L I6 (2005–2009)",
            "maxTow": 6200,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 4.2L I6 (2005–2009)",
            "maxTow": 6400,
            "payload": 1150,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 5.3L V8 (2005–2009)",
            "maxTow": 6800,
            "payload": 1200,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SS — 6.0L V8 (2006–2009)",
            "maxTow": 6800,
            "payload": 1100,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 4.2L I6 (2005–2009 last gen)",
            "maxTow": 6200,
            "payload": 1200,
            "gcwr": 9400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Traverse",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1680,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "RS — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "LS — 3.6L V6 (2015–2017)",
            "maxTow": 5200,
            "payload": 1700,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2015–2017)",
            "maxTow": 5200,
            "payload": 1700,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 3.6L V6 (2015–2017)",
            "maxTow": 5200,
            "payload": 1650,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1800,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1800,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "RS — 3.6L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 3.6L V6 (2009–2012)",
            "maxTow": 5200,
            "payload": 1500,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2009–2012)",
            "maxTow": 5200,
            "payload": 1450,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 3.6L V6 (2009–2012)",
            "maxTow": 5200,
            "payload": 1400,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1550,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1500,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1450,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.6L V6 (2018–2021)",
            "maxTow": 1500,
            "payload": 1500,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "RS — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 3.6L V6 (2010–2017)",
            "maxTow": 5200,
            "payload": 1500,
            "gcwr": 8700,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2010–2017)",
            "maxTow": 5200,
            "payload": 1500,
            "gcwr": 8700,
            "hitch": "Class IV"
          },
          {
            "label": "LTZ — 3.6L V6 (2010–2017)",
            "maxTow": 5200,
            "payload": 1450,
            "gcwr": 8650,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.6L V6 (2018 redesign)",
            "maxTow": 1500,
            "payload": 1500,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "LS — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 8600,
            "hitch": "Class IV"
          },
          {
            "label": "LT — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 8550,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "High Country — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Trax",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 1.2L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "LT — 1.2L Turbo",
            "maxTow": 0,
            "payload": 920,
            "gcwr": 5420,
            "hitch": "—"
          },
          {
            "label": "ACTIV — 1.2L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "RS — 1.2L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "LS — 1.4L Turbo (2015–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LT — 1.4L Turbo (2015–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Premier — 1.4L Turbo (2017–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LS — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LT — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LS — 1.4L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "LT — 1.4L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Premier — 1.4L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "LS — 1.4L Turbo (2015–2018 intro)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "LT — 1.4L Turbo (2015–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "LTZ / Premier — 1.4L Turbo (2015–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      }
    ]
  },
  {
    "name": "GMC",
    "models": [
      {
        "name": "Canyon",
        "kind": "truck",
        "trims": [
          {
            "label": "Elevation — 2.7L Turbo",
            "maxTow": 7700,
            "payload": 1620,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 2.7L Turbo",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "AT4X — 2.7L Turbo",
            "maxTow": 6000,
            "payload": 1320,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 2.7L Turbo",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 2.5L I4 (2018–2020)",
            "maxTow": 3500,
            "payload": 1420,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.6L V6 (2018–2022)",
            "maxTow": 7000,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "All Terrain — 3.6L V6 (2018–2022)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2018–2022)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "All Terrain — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 2.8L Duramax Diesel (2018–2022)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1420,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "All Terrain — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2015–2018)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7700,
            "payload": 1540,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "All Terrain — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 2.8L Duramax Diesel (2016–2018)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.8L I4 (2005–2006)",
            "maxTow": 1900,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 3.5L I5 (2005–2006)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "WT — 2.9L I4 (2007–2012)",
            "maxTow": 2200,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 3.7L I5 (2007–2012)",
            "maxTow": 5500,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2009–2012)",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 2.9L I4 (2010–2012)",
            "maxTow": 4000,
            "payload": 1300,
            "gcwr": 7300,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.7L I5 (2010–2012)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2010–2012)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 2.5L I4 (2015–2018 redesign)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 6950,
            "hitch": "Class III"
          },
          {
            "label": "Diesel — 2.8L Duramax (2016–2018)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Hummer EV Pickup",
        "kind": "truck",
        "trims": [
          {
            "label": "2X — Dual Motor",
            "maxTow": 7500,
            "payload": 1300,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "3X — Tri Motor",
            "maxTow": 7500,
            "payload": 1300,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "3X Omega Edition — Tri Motor",
            "maxTow": 7500,
            "payload": 1250,
            "gcwr": 14000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Sierra 1500",
        "kind": "truck",
        "trims": [
          {
            "label": "Pro — 2.7L Turbo",
            "maxTow": 9500,
            "payload": 1980,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8",
            "maxTow": 11300,
            "payload": 2100,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Elevation — 5.3L V8",
            "maxTow": 11400,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.2L V8 Max Trailering",
            "maxTow": 13200,
            "payload": 2250,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 6.2L V8",
            "maxTow": 8900,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "AT4X — 6.2L V8 Off-Road",
            "maxTow": 8900,
            "payload": 1460,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.0L Duramax Diesel",
            "maxTow": 13300,
            "payload": 2050,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali Ultimate — 6.2L V8",
            "maxTow": 13300,
            "payload": 2100,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.3L V6 (2018)",
            "maxTow": 7600,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2018–2021)",
            "maxTow": 11400,
            "payload": 2100,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Elevation — 5.3L V8 (2019–2021)",
            "maxTow": 11400,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.2L V8 Max Trailering (2019–2021)",
            "maxTow": 13300,
            "payload": 2250,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 5.3L V8 (2019–2021)",
            "maxTow": 9100,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2018–2021)",
            "maxTow": 12000,
            "payload": 2100,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.0L Duramax Diesel (2020–2021)",
            "maxTow": 13300,
            "payload": 2050,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.3L V6 (2015–2018)",
            "maxTow": 7200,
            "payload": 1850,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2015–2018)",
            "maxTow": 11600,
            "payload": 2050,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2015–2018)",
            "maxTow": 11600,
            "payload": 2000,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.2L V8 Max Trailering (2015–2018)",
            "maxTow": 12500,
            "payload": 2100,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "All Terrain — 5.3L V8 (2015–2018)",
            "maxTow": 9200,
            "payload": 1800,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 5.3L V8 (2015–2018)",
            "maxTow": 11000,
            "payload": 1950,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2015–2018)",
            "maxTow": 12000,
            "payload": 2050,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2005–2006)",
            "maxTow": 4100,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 5.3L V8 (2005–2006)",
            "maxTow": 7800,
            "payload": 1850,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.0L V8 Max Trailering (2005–2006)",
            "maxTow": 10400,
            "payload": 1900,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "WT — 4.3L V6 (2007–2013)",
            "maxTow": 4500,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 5.3L V8 (2007–2013)",
            "maxTow": 8500,
            "payload": 1900,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2007–2013)",
            "maxTow": 9000,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2007–2013)",
            "maxTow": 10600,
            "payload": 1900,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2014)",
            "maxTow": 9200,
            "payload": 1950,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2014)",
            "maxTow": 9600,
            "payload": 1900,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2014)",
            "maxTow": 12000,
            "payload": 2000,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Work Truck — 4.3L V6 (2010–2013)",
            "maxTow": 4800,
            "payload": 1500,
            "gcwr": 8300,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 4.8L V8 (2010–2013)",
            "maxTow": 6700,
            "payload": 1600,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2010–2013)",
            "maxTow": 9800,
            "payload": 1800,
            "gcwr": 13600,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2010–2013)",
            "maxTow": 9800,
            "payload": 1750,
            "gcwr": 13550,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2010–2013)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 (2010–2013)",
            "maxTow": 6100,
            "payload": 1500,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.3L V6 (2014–2018 redesign)",
            "maxTow": 7200,
            "payload": 1750,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 4.3L V6 (2014–2018)",
            "maxTow": 7200,
            "payload": 1750,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1950,
            "gcwr": 15550,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1900,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.2L V8 (2014–2018)",
            "maxTow": 12000,
            "payload": 1850,
            "gcwr": 15850,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 5.3L V8 (2014–2018)",
            "maxTow": 11600,
            "payload": 1850,
            "gcwr": 15450,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2014–2018)",
            "maxTow": 12000,
            "payload": 1800,
            "gcwr": 15800,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Sierra 2500HD",
        "kind": "truck",
        "trims": [
          {
            "label": "Pro — 6.6L Gas V8",
            "maxTow": 14500,
            "payload": 3600,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel",
            "maxTow": 18500,
            "payload": 3979,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax Diesel",
            "maxTow": 20000,
            "payload": 3979,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "AT4 — 6.6L Duramax Diesel",
            "maxTow": 18500,
            "payload": 3500,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "AT4X — 6.6L Duramax Diesel",
            "maxTow": 13200,
            "payload": 2900,
            "gcwr": 25000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.6L Duramax Diesel",
            "maxTow": 20000,
            "payload": 3700,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Base — 6.0L Gas V8 (2018–2019)",
            "maxTow": 14500,
            "payload": 3500,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 18500,
            "payload": 3900,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 20000,
            "payload": 3979,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "AT4 — 6.6L Duramax Diesel (2020–2021)",
            "maxTow": 18500,
            "payload": 3500,
            "gcwr": 28500,
            "hitch": "Class V"
          },
          {
            "label": "Denali — 6.6L Duramax Diesel (2018–2021)",
            "maxTow": 20000,
            "payload": 3700,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Base — 6.0L Gas V8 (2015–2018)",
            "maxTow": 13000,
            "payload": 3300,
            "gcwr": 22000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 18000,
            "payload": 3800,
            "gcwr": 27500,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 19500,
            "payload": 3900,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "All Terrain — 6.6L Duramax (2015–2018)",
            "maxTow": 18000,
            "payload": 3600,
            "gcwr": 27500,
            "hitch": "Class V"
          },
          {
            "label": "Denali — 6.6L Duramax Diesel (2015–2018)",
            "maxTow": 19500,
            "payload": 3700,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "WT — 6.0L Gas V8 (2005–2006)",
            "maxTow": 9800,
            "payload": 2800,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel (2005–2006)",
            "maxTow": 12000,
            "payload": 3000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel (2007–2010)",
            "maxTow": 13000,
            "payload": 3200,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax Diesel (2007–2010)",
            "maxTow": 15500,
            "payload": 3100,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 16000,
            "payload": 3300,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 18000,
            "payload": 3200,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Denali — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 18000,
            "payload": 3100,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck — 6.0L Gas (2010)",
            "maxTow": 13000,
            "payload": 3200,
            "gcwr": 18200,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 6.6L Duramax (2010)",
            "maxTow": 15700,
            "payload": 3400,
            "gcwr": 21100,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck — 6.0L Gas (2011–2014)",
            "maxTow": 13000,
            "payload": 3400,
            "gcwr": 18400,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 6.0L Gas (2011–2014)",
            "maxTow": 13000,
            "payload": 3300,
            "gcwr": 18300,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 6.6L Duramax (2011–2014)",
            "maxTow": 16000,
            "payload": 3600,
            "gcwr": 21600,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax (2011–2014)",
            "maxTow": 16700,
            "payload": 3500,
            "gcwr": 22200,
            "hitch": "Class V"
          },
          {
            "label": "Denali — 6.6L Duramax (2011–2014)",
            "maxTow": 16700,
            "payload": 3400,
            "gcwr": 22100,
            "hitch": "Class V"
          },
          {
            "label": "Base — 6.0L Gas (2015–2018)",
            "maxTow": 14500,
            "payload": 3600,
            "gcwr": 20100,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.0L Gas (2015–2018)",
            "maxTow": 14500,
            "payload": 3550,
            "gcwr": 20050,
            "hitch": "Class V"
          },
          {
            "label": "SLE — 6.6L Duramax (2015–2018)",
            "maxTow": 18300,
            "payload": 3900,
            "gcwr": 24200,
            "hitch": "Class V"
          },
          {
            "label": "SLT — 6.6L Duramax (2015–2018)",
            "maxTow": 19500,
            "payload": 3850,
            "gcwr": 25350,
            "hitch": "Class V"
          },
          {
            "label": "Denali — 6.6L Duramax (2015–2018)",
            "maxTow": 19500,
            "payload": 3700,
            "gcwr": 25200,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Sierra 3500HD",
        "kind": "truck",
        "trims": [
          {
            "label": "Pro SRW — 6.6L Gas V8",
            "maxTow": 16000,
            "payload": 4200,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "SLE DRW — 6.6L Duramax Diesel",
            "maxTow": 36000,
            "payload": 7440,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW — 6.6L Duramax Diesel",
            "maxTow": 36000,
            "payload": 7400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Denali DRW — 6.6L Duramax gooseneck",
            "maxTow": 36000,
            "payload": 7200,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Base SRW — 6.0L Gas V8 (2018–2019)",
            "maxTow": 15000,
            "payload": 4000,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "SLE DRW — 6.6L Duramax (2018–2021)",
            "maxTow": 23100,
            "payload": 7000,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW — 6.6L Duramax gooseneck (2019–2021)",
            "maxTow": 35500,
            "payload": 7400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Denali DRW — 6.6L Duramax (2020–2021)",
            "maxTow": 35500,
            "payload": 7200,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Base SRW — 6.0L Gas V8 (2015–2018)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "SLE DRW — 6.6L Duramax (2015–2018)",
            "maxTow": 23100,
            "payload": 6500,
            "gcwr": 38000,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW — 6.6L Duramax gooseneck (2015–2018)",
            "maxTow": 23100,
            "payload": 6800,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "Denali DRW — 6.6L Duramax (2015–2018)",
            "maxTow": 23100,
            "payload": 6600,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "WT SRW — 6.0L Gas V8 (2005–2010)",
            "maxTow": 12000,
            "payload": 3600,
            "gcwr": 19500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE DRW — 6.6L Duramax Diesel (2005–2010)",
            "maxTow": 17000,
            "payload": 4500,
            "gcwr": 27000,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW gooseneck — 6.6L Duramax (2005–2010)",
            "maxTow": 20000,
            "payload": 4400,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "SLE DRW — 6.6L Duramax Diesel (2011–2014)",
            "maxTow": 19000,
            "payload": 4800,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW gooseneck — 6.6L Duramax (2011–2014)",
            "maxTow": 23000,
            "payload": 4700,
            "gcwr": 33000,
            "hitch": "Class V"
          },
          {
            "label": "Denali DRW gooseneck — 6.6L Duramax (2011–2014)",
            "maxTow": 23000,
            "payload": 4600,
            "gcwr": 33000,
            "hitch": "Class V"
          },
          {
            "label": "Work Truck SRW — 6.0L Gas (2010–2014)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "SLE DRW — 6.6L Duramax (2010–2014)",
            "maxTow": 20000,
            "payload": 5500,
            "gcwr": 27500,
            "hitch": "Class V"
          },
          {
            "label": "SLT DRW — 6.6L Duramax gooseneck (2010–2014)",
            "maxTow": 21000,
            "payload": 6000,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "Denali DRW — 6.6L Duramax (2011–2014)",
            "maxTow": 21000,
            "payload": 5800,
            "gcwr": 28800,
            "hitch": "Class V"
          },
          {
            "label": "Base SRW — 6.0L Gas (2015–2018)",
            "maxTow": 14500,
            "payload": 4200,
            "gcwr": 20700,
            "hitch": "Class V"
          },
          {
            "label": "SLE SRW — 6.6L Duramax (2015–2018)",
            "maxTow": 18000,
            "payload": 4500,
            "gcwr": 24500,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Sierra EV",
        "kind": "truck",
        "trims": [
          {
            "label": "Elevation — Dual Motor AWD",
            "maxTow": 8900,
            "payload": 1300,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — Dual Motor AWD",
            "maxTow": 10000,
            "payload": 1400,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali Ultimate — Dual Motor Max Range",
            "maxTow": 10000,
            "payload": 1350,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — Dual Motor Off-Road",
            "maxTow": 8900,
            "payload": 1250,
            "gcwr": 16500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Acadia",
        "kind": "suv",
        "trims": [
          {
            "label": "Elevation — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.6L V6 (2015–2016)",
            "maxTow": 5200,
            "payload": 1700,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 3.6L V6 (2015–2016)",
            "maxTow": 5200,
            "payload": 1700,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2015–2016)",
            "maxTow": 5200,
            "payload": 1650,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 2.5L I4 (2017–2021)",
            "maxTow": 1000,
            "payload": 1600,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 3.6L V6 (2017–2021)",
            "maxTow": 4000,
            "payload": 1750,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 3.6L V6 (2017–2021)",
            "maxTow": 4000,
            "payload": 1750,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "AT4 — 3.6L V6 (2019–2021)",
            "maxTow": 4000,
            "payload": 1700,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2017–2021)",
            "maxTow": 4000,
            "payload": 1700,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.6L V6 (2007–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 3.6L V6 (2007–2012)",
            "maxTow": 5200,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2011–2012)",
            "maxTow": 5200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1450,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1400,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2013–2015)",
            "maxTow": 5200,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 2.5L (2018–2019)",
            "maxTow": 1000,
            "payload": 1300,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 2.5L / 3.6L (2018–2021)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 7400,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 3.6L V6 (2018–2021)",
            "maxTow": 4000,
            "payload": 1350,
            "gcwr": 7350,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2018–2021)",
            "maxTow": 4000,
            "payload": 1300,
            "gcwr": 7300,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 3.6L V6 (2010–2016)",
            "maxTow": 5200,
            "payload": 1500,
            "gcwr": 8700,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 3.6L V6 (2010–2016)",
            "maxTow": 5200,
            "payload": 1450,
            "gcwr": 8650,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.6L V6 (2011–2016)",
            "maxTow": 5200,
            "payload": 1400,
            "gcwr": 8600,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 2.5L (2017–2018 redesign)",
            "maxTow": 1000,
            "payload": 1300,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 2.5L / 3.6L (2017–2018)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 7400,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 3.6L V6 (2017–2018)",
            "maxTow": 4000,
            "payload": 1350,
            "gcwr": 7350,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2017–2018)",
            "maxTow": 4000,
            "payload": 1300,
            "gcwr": 7300,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Envoy",
        "kind": "suv",
        "trims": [
          {
            "label": "SLE — 4.2L I6 (2005–2009)",
            "maxTow": 6200,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 4.2L I6 (2005–2009)",
            "maxTow": 6400,
            "payload": 1150,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 5.3L V8 (2005–2009)",
            "maxTow": 6800,
            "payload": 1200,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 4.2L I6 (2009–2009 last)",
            "maxTow": 5300,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 4.2L I6 (2009)",
            "maxTow": 5300,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 5.3L V8 (2009)",
            "maxTow": 6500,
            "payload": 1150,
            "gcwr": 9650,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Hummer EV SUV",
        "kind": "suv",
        "trims": [
          {
            "label": "3X — Ultium Dual Motor",
            "maxTow": 7500,
            "payload": 1300,
            "gcwr": 15800,
            "hitch": "Class IV"
          },
          {
            "label": "3X — Ultium Tri-Motor",
            "maxTow": 7500,
            "payload": 1250,
            "gcwr": 15750,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Terrain",
        "kind": "suv",
        "trims": [
          {
            "label": "SLE — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "AT4 — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 2.4L I4 (2015–2017)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 3.6L V6 (2015–2017)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2015–2017)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SLT — 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SLE — 3.0L / 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2013–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SL — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 1.5L / 2.0L (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Diesel — 1.6L (2018–2019)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SLE — 2.4L (2010–2017 intro)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 2.4L / 3.0L (2010–2017)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 3.6L V6 (2013–2017)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "SLE — 1.5L Turbo (2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 1.5L / 2.0L Turbo (2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Denali — 2.0L Turbo (2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Yukon",
        "kind": "suv",
        "trims": [
          {
            "label": "SLE — 5.3L V8",
            "maxTow": 7700,
            "payload": 1680,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 Max Trailering",
            "maxTow": 8400,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 6.2L V8",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8",
            "maxTow": 8400,
            "payload": 1580,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.0L Duramax Diesel",
            "maxTow": 8200,
            "payload": 1520,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2015–2020)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2015–2020)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2015–2020)",
            "maxTow": 8400,
            "payload": 1650,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2021)",
            "maxTow": 8400,
            "payload": 1800,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2021)",
            "maxTow": 8400,
            "payload": 1800,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 5.3L V8 (2021)",
            "maxTow": 8200,
            "payload": 1700,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2021)",
            "maxTow": 8400,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 4.8L / 5.3L V8 (2005–2006)",
            "maxTow": 7200,
            "payload": 1550,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.0L V8 (2005–2006)",
            "maxTow": 8200,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2007–2014)",
            "maxTow": 6500,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2007–2014)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2007–2014)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 Hybrid (2008–2013)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2018–2020)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2018–2020)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 12050,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2018–2020)",
            "maxTow": 8400,
            "payload": 1500,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2021 redesign)",
            "maxTow": 8400,
            "payload": 1700,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 5.3L / 6.2L (2021)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Diesel — 3.0L Duramax (2021)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2010–2014)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 12050,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2010–2014)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2010–2014)",
            "maxTow": 8400,
            "payload": 1450,
            "gcwr": 11850,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 (2010–2013)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2015–2018 redesign)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2015–2018)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 12050,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2015–2018)",
            "maxTow": 8400,
            "payload": 1500,
            "gcwr": 11900,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Yukon XL",
        "kind": "suv",
        "trims": [
          {
            "label": "SLE — 5.3L V8",
            "maxTow": 7900,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 Max Trailering",
            "maxTow": 8300,
            "payload": 1820,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 3.0L Duramax Diesel",
            "maxTow": 8000,
            "payload": 1580,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2015–2020)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2015–2020)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2015–2020)",
            "maxTow": 8100,
            "payload": 1700,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2021)",
            "maxTow": 8300,
            "payload": 1850,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2021)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2005–2006)",
            "maxTow": 7700,
            "payload": 1650,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.0L V8 (2005–2006)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.0L V8 (2005–2006)",
            "maxTow": 8200,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2007–2014)",
            "maxTow": 7100,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L / 6.2L V8 (2007–2014)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2007–2014)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1700,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2018–2020)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 11700,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2021)",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 12050,
            "hitch": "Class IV"
          },
          {
            "label": "AT4 — 5.3L (2021)",
            "maxTow": 8100,
            "payload": 1700,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 11700,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2010–2014)",
            "maxTow": 8000,
            "payload": 1550,
            "gcwr": 11550,
            "hitch": "Class IV"
          },
          {
            "label": "SLE — 5.3L V8 (2015–2018 redesign)",
            "maxTow": 8300,
            "payload": 1700,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.3L V8 (2015–2018)",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Denali — 6.2L V8 (2015–2018)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 11700,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Ford",
    "models": [
      {
        "name": "F-150",
        "kind": "truck",
        "trims": [
          {
            "label": "XL — 2.7L EcoBoost V6",
            "maxTow": 8200,
            "payload": 1785,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 2.7L EcoBoost V6",
            "maxTow": 8700,
            "payload": 1850,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.0L V8",
            "maxTow": 11300,
            "payload": 1985,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost V6",
            "maxTow": 13200,
            "payload": 2235,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost Max Tow",
            "maxTow": 13800,
            "payload": 2235,
            "gcwr": 18300,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost V6",
            "maxTow": 13300,
            "payload": 2100,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost V6",
            "maxTow": 13300,
            "payload": 2050,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "Tremor — 3.5L EcoBoost Off-Road",
            "maxTow": 11000,
            "payload": 1805,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor — 3.5L EcoBoost High Output",
            "maxTow": 8200,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor R — 5.2L Supercharged V8",
            "maxTow": 8700,
            "payload": 1400,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "PowerBoost Hybrid — 3.5L EcoBoost",
            "maxTow": 12700,
            "payload": 2120,
            "gcwr": 17200,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 3.3L V6 (2018–2020)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.7L EcoBoost V6 (2018–2021)",
            "maxTow": 9000,
            "payload": 1850,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.0L V8 (2018–2021)",
            "maxTow": 11300,
            "payload": 1985,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost V6 (2018–2021)",
            "maxTow": 13200,
            "payload": 2235,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost Max Tow (2018–2020)",
            "maxTow": 13200,
            "payload": 3230,
            "gcwr": 17800,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost (2018–2021)",
            "maxTow": 13000,
            "payload": 2100,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2018–2021)",
            "maxTow": 13000,
            "payload": 2100,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2018–2021)",
            "maxTow": 13000,
            "payload": 2050,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor — 3.5L EcoBoost HO (2018–2020 gen2)",
            "maxTow": 8000,
            "payload": 1200,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor — 3.5L EcoBoost HO (2021 gen3)",
            "maxTow": 8200,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "PowerBoost Hybrid — 3.5L EcoBoost (2021)",
            "maxTow": 12700,
            "payload": 2120,
            "gcwr": 17200,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 3.5L Ti-VCT V6 (2015–2017)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.7L EcoBoost V6 (2015–2018)",
            "maxTow": 8500,
            "payload": 1850,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost V6 (2015–2018)",
            "maxTow": 12200,
            "payload": 2100,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.0L V8 (2015–2018)",
            "maxTow": 11000,
            "payload": 1950,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 2.7L EcoBoost V6 (2015–2018)",
            "maxTow": 8500,
            "payload": 1800,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost Max Tow (2015–2018)",
            "maxTow": 12200,
            "payload": 3270,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost (2015–2018)",
            "maxTow": 12000,
            "payload": 2050,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2015–2018)",
            "maxTow": 12000,
            "payload": 2050,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2016–2018)",
            "maxTow": 12000,
            "payload": 2000,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor — 3.5L EcoBoost HO (2017–2018)",
            "maxTow": 8000,
            "payload": 1200,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 3.3L V6 (2018)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 4.2L V6 (2005–2008)",
            "maxTow": 4000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "XLT — 4.6L V8 (2005–2008)",
            "maxTow": 6700,
            "payload": 1700,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 5.4L V8 (2005–2008)",
            "maxTow": 9500,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "FX4 — 5.4L V8 (2005–2008)",
            "maxTow": 8000,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Harley-Davidson — 5.4L Supercharged (2005–2006)",
            "maxTow": 6300,
            "payload": 1600,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 4.6L V8 (2009–2010)",
            "maxTow": 5500,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.4L V8 (2009–2010)",
            "maxTow": 9200,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 5.4L V8 (2009–2010)",
            "maxTow": 11000,
            "payload": 1850,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SVT Raptor — 5.4L V8 (2010)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 3.7L V6 (2011–2014)",
            "maxTow": 5500,
            "payload": 1650,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.0L V8 (2011–2014)",
            "maxTow": 8500,
            "payload": 1850,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost V6 (2011–2014)",
            "maxTow": 11300,
            "payload": 1900,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost V6 (2011–2014)",
            "maxTow": 11300,
            "payload": 1850,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost V6 (2011–2014)",
            "maxTow": 11300,
            "payload": 1800,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "SVT Raptor — 6.2L V8 (2011–2014)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 4.6L V8 (2010–2014)",
            "maxTow": 6700,
            "payload": 1600,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 5.0L V8 (2011–2014)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "STX — 4.6L / 5.0L (2010–2014)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 11150,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.0L V8 (2010–2014)",
            "maxTow": 9200,
            "payload": 1750,
            "gcwr": 12950,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2011–2014)",
            "maxTow": 11300,
            "payload": 1850,
            "gcwr": 15150,
            "hitch": "Class IV"
          },
          {
            "label": "FX4 — 5.0L V8 (2010–2014)",
            "maxTow": 9200,
            "payload": 1650,
            "gcwr": 12850,
            "hitch": "Class IV"
          },
          {
            "label": "FX4 — 3.5L EcoBoost (2011–2014)",
            "maxTow": 11300,
            "payload": 1750,
            "gcwr": 15050,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 5.0L V8 (2010–2014)",
            "maxTow": 9200,
            "payload": 1700,
            "gcwr": 12900,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost (2011–2014)",
            "maxTow": 11300,
            "payload": 1800,
            "gcwr": 15100,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 5.0L / 3.5L EcoBoost (2010–2014)",
            "maxTow": 11300,
            "payload": 1750,
            "gcwr": 15050,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2010–2014)",
            "maxTow": 11300,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SVT Raptor — 6.2L V8 (2010–2014)",
            "maxTow": 8000,
            "payload": 1300,
            "gcwr": 11300,
            "hitch": "Class IV"
          },
          {
            "label": "Harley-Davidson — 6.2L V8 (2010–2012)",
            "maxTow": 8000,
            "payload": 1400,
            "gcwr": 11400,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.7L EcoBoost (2015–2018)",
            "maxTow": 8500,
            "payload": 1800,
            "gcwr": 12300,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 5.0L V8 (2015–2018)",
            "maxTow": 11000,
            "payload": 1850,
            "gcwr": 14850,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 3.5L EcoBoost (2015–2018)",
            "maxTow": 12200,
            "payload": 1950,
            "gcwr": 16150,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 2.7L EcoBoost (2015–2018)",
            "maxTow": 8500,
            "payload": 1850,
            "gcwr": 12350,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2015–2018)",
            "maxTow": 12200,
            "payload": 2000,
            "gcwr": 16200,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 2.7L EcoBoost (2015–2018)",
            "maxTow": 8500,
            "payload": 1800,
            "gcwr": 12300,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 5.0L V8 (2015–2018)",
            "maxTow": 11000,
            "payload": 1850,
            "gcwr": 14850,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 3.5L EcoBoost (2015–2018)",
            "maxTow": 12200,
            "payload": 1950,
            "gcwr": 16150,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "F-150 Lightning",
        "kind": "truck",
        "trims": [
          {
            "label": "Pro — Dual Motor Ext. Range",
            "maxTow": 7700,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — Dual Motor Standard Range",
            "maxTow": 7700,
            "payload": 2000,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — Dual Motor Ext. Range",
            "maxTow": 10000,
            "payload": 2235,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — Dual Motor Ext. Range",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — Dual Motor Ext. Range",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Flash — Dual Motor Ext. Range",
            "maxTow": 10000,
            "payload": 1900,
            "gcwr": 17500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "F-250 Super Duty",
        "kind": "truck",
        "trims": [
          {
            "label": "XL — 6.8L Gas V8",
            "maxTow": 14800,
            "payload": 3763,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "XLT — 7.3L Gas V8",
            "maxTow": 15000,
            "payload": 4000,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke Diesel",
            "maxTow": 20000,
            "payload": 4320,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch — 6.7L Power Stroke Diesel",
            "maxTow": 22000,
            "payload": 4200,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum — 6.7L Power Stroke Diesel",
            "maxTow": 22000,
            "payload": 4100,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "Tremor — 6.7L Power Stroke Off-Road",
            "maxTow": 18600,
            "payload": 3500,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "Limited — 6.7L Power Stroke Diesel",
            "maxTow": 22000,
            "payload": 4000,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2018–2022)",
            "maxTow": 15000,
            "payload": 3800,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "XLT — 6.2L Gas V8 (2018–2022)",
            "maxTow": 15000,
            "payload": 3900,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke Diesel (2018–2021)",
            "maxTow": 20000,
            "payload": 4200,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch — 6.7L Power Stroke (2018–2021)",
            "maxTow": 21000,
            "payload": 4100,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum — 6.7L Power Stroke (2018–2021)",
            "maxTow": 21000,
            "payload": 4000,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Limited — 6.7L Power Stroke (2018–2021)",
            "maxTow": 21000,
            "payload": 4000,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2015–2016)",
            "maxTow": 14000,
            "payload": 3500,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "XLT — 6.2L Gas V8 (2015–2016)",
            "maxTow": 14000,
            "payload": 3600,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke Diesel (2015–2016)",
            "maxTow": 14000,
            "payload": 3800,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2017–2018)",
            "maxTow": 15000,
            "payload": 3800,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "XLT — 6.2L Gas V8 (2017–2018)",
            "maxTow": 15000,
            "payload": 3900,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke Diesel (2017–2018)",
            "maxTow": 20000,
            "payload": 4200,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch — 6.7L Power Stroke (2017–2018)",
            "maxTow": 20000,
            "payload": 4100,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum — 6.7L Power Stroke (2017–2018)",
            "maxTow": 20000,
            "payload": 4000,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Limited — 6.7L Power Stroke (2017–2018)",
            "maxTow": 20000,
            "payload": 4000,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 5.4L Gas V8 (2005–2007)",
            "maxTow": 9900,
            "payload": 2600,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 6.0L Power Stroke Diesel (2005–2007)",
            "maxTow": 12500,
            "payload": 2800,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.0L Power Stroke Diesel (2005–2007)",
            "maxTow": 12500,
            "payload": 2700,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 5.4L Gas V8 (2008–2010)",
            "maxTow": 10500,
            "payload": 2700,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 6.4L Power Stroke Diesel (2008–2010)",
            "maxTow": 14000,
            "payload": 2900,
            "gcwr": 22500,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.4L Power Stroke Diesel (2008–2010)",
            "maxTow": 14000,
            "payload": 2800,
            "gcwr": 22500,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2011–2015)",
            "maxTow": 12500,
            "payload": 2800,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 14000,
            "payload": 3000,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 16000,
            "payload": 2900,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 16000,
            "payload": 2800,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum — 6.7L Power Stroke Diesel (2013–2015)",
            "maxTow": 16000,
            "payload": 2750,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 5.4L Gas V8 (2010)",
            "maxTow": 12500,
            "payload": 2800,
            "gcwr": 17300,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.4L Gas V8 (2010)",
            "maxTow": 12500,
            "payload": 2750,
            "gcwr": 17250,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 6.4L Power Stroke (2010 last)",
            "maxTow": 15000,
            "payload": 3000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2011–2016)",
            "maxTow": 14000,
            "payload": 3100,
            "gcwr": 19100,
            "hitch": "Class V"
          },
          {
            "label": "XLT — 6.2L Gas V8 (2011–2016)",
            "maxTow": 14000,
            "payload": 3050,
            "gcwr": 19050,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.2L Gas V8 (2011–2016)",
            "maxTow": 14000,
            "payload": 3000,
            "gcwr": 19000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke (2011–2016)",
            "maxTow": 16600,
            "payload": 3400,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch — 6.7L Power Stroke (2011–2016)",
            "maxTow": 16600,
            "payload": 3300,
            "gcwr": 21900,
            "hitch": "Class V"
          },
          {
            "label": "Platinum — 6.7L Power Stroke (2013–2016)",
            "maxTow": 16600,
            "payload": 3250,
            "gcwr": 21850,
            "hitch": "Class V"
          },
          {
            "label": "XL — 6.2L Gas V8 (2017–2018 redesign)",
            "maxTow": 15000,
            "payload": 3600,
            "gcwr": 20600,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.2L Gas V8 (2017–2018)",
            "maxTow": 15000,
            "payload": 3500,
            "gcwr": 20500,
            "hitch": "Class V"
          },
          {
            "label": "Lariat — 6.7L Power Stroke (2017–2018)",
            "maxTow": 20000,
            "payload": 4000,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Limited — 6.7L Power Stroke (2018)",
            "maxTow": 21000,
            "payload": 3800,
            "gcwr": 26800,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "F-350 Super Duty",
        "kind": "truck",
        "trims": [
          {
            "label": "XL SRW — 6.8L Gas V8",
            "maxTow": 16000,
            "payload": 4500,
            "gcwr": 25500,
            "hitch": "Class V"
          },
          {
            "label": "XLT SRW — 7.3L Gas V8",
            "maxTow": 18000,
            "payload": 4800,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat SRW — 6.7L Power Stroke Diesel",
            "maxTow": 21000,
            "payload": 5000,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke Diesel",
            "maxTow": 37000,
            "payload": 7640,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke",
            "maxTow": 37000,
            "payload": 7400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW — 6.7L Power Stroke gooseneck",
            "maxTow": 40000,
            "payload": 7640,
            "gcwr": 50000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Power Stroke",
            "maxTow": 40000,
            "payload": 7500,
            "gcwr": 50000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas V8 (2018–2022)",
            "maxTow": 16000,
            "payload": 4500,
            "gcwr": 25500,
            "hitch": "Class V"
          },
          {
            "label": "XLT SRW — 6.7L Power Stroke (2018–2021)",
            "maxTow": 21000,
            "payload": 5000,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke (2018–2021)",
            "maxTow": 35000,
            "payload": 7000,
            "gcwr": 45000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke (2018–2021)",
            "maxTow": 35000,
            "payload": 6900,
            "gcwr": 45000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW gooseneck — 6.7L (2018–2021)",
            "maxTow": 35000,
            "payload": 7000,
            "gcwr": 45000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas V8 (2015–2016)",
            "maxTow": 15000,
            "payload": 4200,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke (2015–2016)",
            "maxTow": 26500,
            "payload": 6000,
            "gcwr": 40000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas V8 (2017–2018)",
            "maxTow": 16000,
            "payload": 4500,
            "gcwr": 25500,
            "hitch": "Class V"
          },
          {
            "label": "XLT SRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 21000,
            "payload": 5000,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 32000,
            "payload": 6800,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 32000,
            "payload": 6700,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW gooseneck — 6.7L (2017–2018)",
            "maxTow": 32000,
            "payload": 6800,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 5.4L / 6.8L Gas (2005–2007)",
            "maxTow": 11500,
            "payload": 3200,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT DRW — 6.0L Power Stroke Diesel (2005–2007)",
            "maxTow": 15000,
            "payload": 4000,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.8L Gas V10 (2008–2010)",
            "maxTow": 12500,
            "payload": 3400,
            "gcwr": 20000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT DRW — 6.4L Power Stroke Diesel (2008–2010)",
            "maxTow": 17000,
            "payload": 4300,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW gooseneck — 6.4L Power Stroke (2008–2010)",
            "maxTow": 19000,
            "payload": 4200,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas V8 (2011–2015)",
            "maxTow": 14000,
            "payload": 3600,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "XLT DRW — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 18500,
            "payload": 4500,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW gooseneck — 6.7L Power Stroke (2011–2015)",
            "maxTow": 24500,
            "payload": 4400,
            "gcwr": 35000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke (2011–2015)",
            "maxTow": 24500,
            "payload": 4300,
            "gcwr": 35000,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW — 6.7L Power Stroke (2013–2015)",
            "maxTow": 24500,
            "payload": 4250,
            "gcwr": 35000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 5.4L Gas (2010)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.4L Power Stroke (2010)",
            "maxTow": 18000,
            "payload": 5000,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas (2011–2016)",
            "maxTow": 15000,
            "payload": 4200,
            "gcwr": 21200,
            "hitch": "Class V"
          },
          {
            "label": "XLT SRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 18000,
            "payload": 4500,
            "gcwr": 24500,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 24500,
            "payload": 6000,
            "gcwr": 32500,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 24500,
            "payload": 5800,
            "gcwr": 32300,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW — 6.7L Power Stroke (2013–2016)",
            "maxTow": 24500,
            "payload": 5700,
            "gcwr": 32200,
            "hitch": "Class V"
          },
          {
            "label": "XL SRW — 6.2L Gas (2017–2018 redesign)",
            "maxTow": 16000,
            "payload": 4500,
            "gcwr": 22500,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW — 6.7L Power Stroke gooseneck (2017–2018)",
            "maxTow": 34000,
            "payload": 7200,
            "gcwr": 43200,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Power Stroke (2018)",
            "maxTow": 34000,
            "payload": 7100,
            "gcwr": 43100,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "F-450 Super Duty",
        "kind": "truck",
        "trims": [
          {
            "label": "XL DRW — 6.7L Power Stroke Diesel",
            "maxTow": 35000,
            "payload": 6000,
            "gcwr": 46000,
            "hitch": "Class V"
          },
          {
            "label": "XLT DRW — 6.7L Power Stroke Diesel",
            "maxTow": 37000,
            "payload": 6200,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke gooseneck",
            "maxTow": 40000,
            "payload": 6500,
            "gcwr": 50000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Power Stroke max",
            "maxTow": 40000,
            "payload": 6400,
            "gcwr": 50000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke (2018–2021)",
            "maxTow": 30000,
            "payload": 5800,
            "gcwr": 42000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke gooseneck (2018–2021)",
            "maxTow": 35000,
            "payload": 6200,
            "gcwr": 46000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Power Stroke (2019–2021)",
            "maxTow": 37000,
            "payload": 6400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke (2015–2016)",
            "maxTow": 24500,
            "payload": 5500,
            "gcwr": 38000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 30000,
            "payload": 5800,
            "gcwr": 42000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW gooseneck — 6.7L (2017–2018)",
            "maxTow": 35000,
            "payload": 6200,
            "gcwr": 46000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 35000,
            "payload": 6400,
            "gcwr": 46000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.0L Power Stroke Diesel (2005–2007)",
            "maxTow": 17000,
            "payload": 4500,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.4L Power Stroke Diesel (2008–2010)",
            "maxTow": 21000,
            "payload": 4800,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 24500,
            "payload": 5000,
            "gcwr": 36000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke Diesel (2011–2015)",
            "maxTow": 24500,
            "payload": 4900,
            "gcwr": 36000,
            "hitch": "Class V"
          },
          {
            "label": "King Ranch DRW — 6.7L Power Stroke (2011–2015)",
            "maxTow": 24500,
            "payload": 4800,
            "gcwr": 36000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.4L Power Stroke (2010)",
            "maxTow": 24500,
            "payload": 5500,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 24500,
            "payload": 5800,
            "gcwr": 32300,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 24500,
            "payload": 5600,
            "gcwr": 32100,
            "hitch": "Class V"
          },
          {
            "label": "XL DRW — 6.7L Power Stroke (2017–2018 redesign)",
            "maxTow": 30000,
            "payload": 6000,
            "gcwr": 38000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat DRW — 6.7L Power Stroke gooseneck (2017–2018)",
            "maxTow": 35000,
            "payload": 6500,
            "gcwr": 43500,
            "hitch": "Class V"
          },
          {
            "label": "Platinum DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 35000,
            "payload": 6400,
            "gcwr": 43400,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "F-550 Super Duty",
        "kind": "truck",
        "trims": [
          {
            "label": "XL Chassis Cab DRW — 6.7L Power Stroke",
            "maxTow": 32500,
            "payload": 10000,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "XLT Chassis Cab DRW — 6.7L Power Stroke",
            "maxTow": 34000,
            "payload": 10500,
            "gcwr": 45000,
            "hitch": "Class V"
          },
          {
            "label": "Lariat Chassis Cab DRW — 6.7L Power Stroke",
            "maxTow": 35000,
            "payload": 11000,
            "gcwr": 46000,
            "hitch": "Class V"
          },
          {
            "label": "XL Chassis Cab DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 26000,
            "payload": 9000,
            "gcwr": 37000,
            "hitch": "Class V"
          },
          {
            "label": "XLT Chassis Cab DRW — 6.7L Power Stroke (2011–2016)",
            "maxTow": 28000,
            "payload": 9500,
            "gcwr": 39500,
            "hitch": "Class V"
          },
          {
            "label": "XL Chassis Cab DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 30000,
            "payload": 10000,
            "gcwr": 42000,
            "hitch": "Class V"
          },
          {
            "label": "XLT Chassis Cab DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 32000,
            "payload": 10500,
            "gcwr": 44500,
            "hitch": "Class V"
          },
          {
            "label": "Lariat Chassis Cab DRW — 6.7L Power Stroke (2017–2018)",
            "maxTow": 32000,
            "payload": 10500,
            "gcwr": 44500,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Maverick",
        "kind": "truck",
        "trims": [
          {
            "label": "XL — 2.0L EcoBoost",
            "maxTow": 4000,
            "payload": 1500,
            "gcwr": 6140,
            "hitch": "Class III"
          },
          {
            "label": "XLT — 2.0L EcoBoost",
            "maxTow": 4000,
            "payload": 1500,
            "gcwr": 6140,
            "hitch": "Class III"
          },
          {
            "label": "Lariat — 2.0L EcoBoost",
            "maxTow": 4000,
            "payload": 1500,
            "gcwr": 6140,
            "hitch": "Class III"
          },
          {
            "label": "XL Hybrid — 2.5L Atkinson",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 5320,
            "hitch": "Class III"
          },
          {
            "label": "XLT Hybrid — 2.5L Atkinson",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 5320,
            "hitch": "Class III"
          },
          {
            "label": "Lobo — 2.0L EcoBoost Sport",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Ranger",
        "kind": "truck",
        "trims": [
          {
            "label": "XL — 2.3L EcoBoost",
            "maxTow": 7500,
            "payload": 1710,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 2.3L EcoBoost",
            "maxTow": 7500,
            "payload": 1805,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 2.3L EcoBoost",
            "maxTow": 7500,
            "payload": 1710,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Raptor — 3.0L EcoBoost V6",
            "maxTow": 5510,
            "payload": 1410,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.3L EcoBoost (2019–2021)",
            "maxTow": 7500,
            "payload": 1710,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 2.3L EcoBoost (2019–2021)",
            "maxTow": 7500,
            "payload": 1805,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Lariat — 2.3L EcoBoost (2019–2021)",
            "maxTow": 7500,
            "payload": 1710,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Tremor — 2.3L EcoBoost (2021)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.3L I4 (2005–2011)",
            "maxTow": 2260,
            "payload": 1260,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "XLT — 3.0L V6 (2005–2008)",
            "maxTow": 3140,
            "payload": 1350,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "XLT — 4.0L V6 (2005–2011)",
            "maxTow": 5940,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "FX4 Off-Road — 4.0L V6 (2005–2009)",
            "maxTow": 3440,
            "payload": 1300,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 4.0L V6 (2009–2011)",
            "maxTow": 5940,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "XL — 2.3L I4 (2010–2011 last US)",
            "maxTow": 2260,
            "payload": 1200,
            "gcwr": 5460,
            "hitch": "Class II"
          },
          {
            "label": "XLT — 4.0L V6 (2010–2011)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 4.0L V6 (2010–2011)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          },
          {
            "label": "FX4 Off-Road — 4.0L V6 (2010–2011)",
            "maxTow": 5600,
            "payload": 1300,
            "gcwr": 8900,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Bronco",
        "kind": "suv",
        "trims": [
          {
            "label": "Big Bend — 2.3L EcoBoost",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Outer Banks — 2.3L EcoBoost",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Wildtrak — 2.7L EcoBoost",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Raptor — 3.0L EcoBoost",
            "maxTow": 4500,
            "payload": 1000,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Big Bend — 2.3L EcoBoost (2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Black Diamond — 2.3L EcoBoost (2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Outer Banks — 2.3L EcoBoost (2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Badlands — 2.7L EcoBoost V6 (2021)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Wildtrak — 2.7L EcoBoost V6 (2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.3L EcoBoost (2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Black Diamond — 2.3L (2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Outer Banks — 2.3L (2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Badlands — 2.7L EcoBoost (2021)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Wildtrak — 2.7L EcoBoost (2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "First Edition — 2.7L (2021)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Bronco Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 1.5L EcoBoost",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Badlands — 2.0L EcoBoost",
            "maxTow": 2200,
            "payload": 950,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Big Bend — 1.5L EcoBoost (2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Outer Banks — 1.5L EcoBoost (2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Badlands — 2.0L EcoBoost (2021)",
            "maxTow": 2200,
            "payload": 1150,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Base — 1.5L EcoBoost (2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "EcoSport",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.0L EcoBoost (2018–2021)",
            "maxTow": 1400,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.0L EcoBoost (2018–2021)",
            "maxTow": 1400,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SES — 2.0L I4 AWD (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L I4 AWD (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.0L / 2.0L (2018–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SES — 2.0L AWD (2018–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L AWD (2018–2021)",
            "maxTow": 2000,
            "payload": 900,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "S — 1.0L EcoBoost (2018 US intro)",
            "maxTow": 1400,
            "payload": 900,
            "gcwr": 4400,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.0L / 2.0L (2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SES — 2.0L AWD (2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L AWD (2018)",
            "maxTow": 2000,
            "payload": 900,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Edge",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.0L EcoBoost",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "ST — 2.7L EcoBoost",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L EcoBoost (2015–2021)",
            "maxTow": 1500,
            "payload": 1500,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L EcoBoost (2015–2021)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2015–2021)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.7L EcoBoost V6 (2015–2018)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "ST — 2.7L EcoBoost V6 (2019–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2007–2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2007–2010)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2007–2010)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.7L V6 (2009–2010)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L / 2.0L EcoBoost (2011–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L / 2.0L EcoBoost (2011–2014)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L / 2.0L EcoBoost (2011–2014)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.7L V6 (2011–2014)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L EcoBoost (2015)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SEL — 2.0L / 3.5L (2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L / 3.5L (2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.7L EcoBoost V6 (2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L EcoBoost (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L EcoBoost (2018–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "ST — 2.7L EcoBoost (2019–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "ST-Line — 2.0L (2020–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.7L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L EcoBoost (2015–2018 redesign)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L / 3.5L (2015–2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L / 3.5L (2015–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.7L EcoBoost (2015–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Escape",
        "kind": "suv",
        "trims": [
          {
            "label": "Active — 1.5L EcoBoost",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "ST-Line — 2.0L EcoBoost",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "S — 2.5L I4 (2015–2019)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.5L EcoBoost (2017–2019)",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2015–2019)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 1.5L EcoBoost (2020–2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L EcoBoost (2020–2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2020–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "XLS — 2.3L I4 (2005–2007)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "XLT — 3.0L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.3L I4 Hybrid (2005–2007)",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "Class I"
          },
          {
            "label": "XLS — 2.5L I4 (2008–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "XLT — 3.0L V6 (2008–2012)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.0L V6 (2008–2012)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.5L I4 Hybrid (2008–2012)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "S — 2.5L I4 (2013–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "SE — 1.6L / 2.0L EcoBoost (2013–2015)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2013–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "S — 2.5L (2018–2019)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.5L EcoBoost (2018–2019)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L / 2.0L (2018–2019)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2018–2019)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "S — 1.5L EcoBoost (2020–2021 redesign)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L / 2.0L (2020–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "XLS — 2.5L (2010–2012)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "XLT — 2.5L / 3.0L (2010–2012)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.0L V6 (2010–2012)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid (2010–2012)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 4050,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L (2013–2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.6L / 2.0L EcoBoost (2013–2018)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.5L (2013–2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4650,
            "hitch": "Class II"
          },
          {
            "label": "Titanium — 1.6L / 2.0L EcoBoost (2013–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 2.0L EcoBoost (2017–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Escape Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "SE Hybrid",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "SEL Hybrid",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "Platinum Hybrid",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "SE Hybrid (2020–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL Hybrid (2020–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Titanium Hybrid (2020–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SE PHEV (2020–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Expedition",
        "kind": "suv",
        "trims": [
          {
            "label": "XLT — 3.5L EcoBoost",
            "maxTow": 6000,
            "payload": 1700,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost Max Tow",
            "maxTow": 9300,
            "payload": 1900,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost",
            "maxTow": 9000,
            "payload": 1750,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9200,
            "payload": 1700,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9200,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9300,
            "payload": 1900,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9300,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9300,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9300,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.4L V8 (2005–2006)",
            "maxTow": 8900,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Eddie Bauer — 5.4L V8 (2005–2006)",
            "maxTow": 8900,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.4L V8 (2005–2006)",
            "maxTow": 8900,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.4L V8 (2007–2014)",
            "maxTow": 8900,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Eddie Bauer / King Ranch — 5.4L V8 (2007–2014)",
            "maxTow": 9200,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.4L V8 (2007–2014)",
            "maxTow": 9200,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "EL XLT — 5.4L V8 (2007–2014)",
            "maxTow": 8900,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "EL Limited — 5.4L V8 (2007–2014)",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9200,
            "payload": 1700,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9200,
            "payload": 1650,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9200,
            "payload": 1600,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9200,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 5.4L V8 (2010–2014)",
            "maxTow": 9200,
            "payload": 1600,
            "gcwr": 12800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.4L V8 (2010–2014)",
            "maxTow": 9200,
            "payload": 1550,
            "gcwr": 12750,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 5.4L V8 (2010–2014)",
            "maxTow": 9000,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "EL XLT — 5.4L V8 (2010–2014)",
            "maxTow": 8900,
            "payload": 1700,
            "gcwr": 12600,
            "hitch": "Class IV"
          },
          {
            "label": "EL Limited — 5.4L V8 (2010–2014)",
            "maxTow": 8900,
            "payload": 1650,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2018 redesign)",
            "maxTow": 9300,
            "payload": 1700,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2018)",
            "maxTow": 9300,
            "payload": 1650,
            "gcwr": 12950,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2018)",
            "maxTow": 9200,
            "payload": 1600,
            "gcwr": 12800,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Expedition MAX",
        "kind": "suv",
        "trims": [
          {
            "label": "XLT — 3.5L EcoBoost",
            "maxTow": 6300,
            "payload": 1750,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost Max Tow",
            "maxTow": 9000,
            "payload": 1850,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "EL XLT — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1750,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9000,
            "payload": 1950,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9000,
            "payload": 1900,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9000,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "EL XLT — 5.4L V8 (2007–2014)",
            "maxTow": 8900,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "EL Limited — 5.4L V8 (2007–2014)",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "EL King Ranch — 5.4L V8 (2008–2014)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "MAX XLT — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9300,
            "payload": 1750,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "MAX Limited — 3.5L EcoBoost V6 (2015)",
            "maxTow": 9300,
            "payload": 1700,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "King Ranch — 3.5L EcoBoost (2018–2021)",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 12700,
            "hitch": "Class IV"
          },
          {
            "label": "EL XLT — 5.4L V8 (2010–2014)",
            "maxTow": 8900,
            "payload": 1700,
            "gcwr": 12600,
            "hitch": "Class IV"
          },
          {
            "label": "EL Limited — 5.4L V8 (2010–2014)",
            "maxTow": 8900,
            "payload": 1650,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "EL King Ranch — 5.4L V8 (2010–2014)",
            "maxTow": 8700,
            "payload": 1600,
            "gcwr": 12300,
            "hitch": "Class IV"
          },
          {
            "label": "EL Limited — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 12700,
            "hitch": "Class IV"
          },
          {
            "label": "MAX XLT — 3.5L EcoBoost (2018 redesign)",
            "maxTow": 9000,
            "payload": 1800,
            "gcwr": 12800,
            "hitch": "Class IV"
          },
          {
            "label": "MAX Limited — 3.5L EcoBoost (2018)",
            "maxTow": 9000,
            "payload": 1750,
            "gcwr": 12750,
            "hitch": "Class IV"
          },
          {
            "label": "MAX Platinum — 3.5L EcoBoost (2018)",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 12700,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Expedition Timberline",
        "kind": "suv",
        "trims": [
          {
            "label": "Timberline — 3.5L EcoBoost",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 17600,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Explorer",
        "kind": "suv",
        "trims": [
          {
            "label": "XLT — 2.3L EcoBoost",
            "maxTow": 5300,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.3L EcoBoost",
            "maxTow": 5300,
            "payload": 1550,
            "gcwr": 10500,
            "hitch": "Class III"
          },
          {
            "label": "ST — 3.0L EcoBoost",
            "maxTow": 5600,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — 3.0L EcoBoost",
            "maxTow": 5600,
            "payload": 1480,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "XLT — 3.5L V6 (2015–2019)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2015–2019)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L EcoBoost (2015–2019)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2015–2019)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 2.3L EcoBoost (2020–2021)",
            "maxTow": 5300,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 2.3L EcoBoost (2020–2021)",
            "maxTow": 5300,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.0L EcoBoost V6 (2020–2021)",
            "maxTow": 5600,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.0L EcoBoost (2020–2021)",
            "maxTow": 5600,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 4.0L V6 (2005–2010)",
            "maxTow": 5300,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Eddie Bauer — 4.0L / 4.6L V8 (2005–2010)",
            "maxTow": 7100,
            "payload": 1350,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.6L V8 (2005–2010)",
            "maxTow": 7300,
            "payload": 1300,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport Trac — 4.0L V6 (2007–2010)",
            "maxTow": 5300,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport Trac Limited — 4.6L V8 (2007–2010)",
            "maxTow": 6800,
            "payload": 1350,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2011–2015)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "XLT — 3.5L V6 (2011–2015)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2011–2015)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L EcoBoost V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost V6 (2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2018–2019 last gen5)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L EcoBoost (2018–2019)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2018–2019)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.3L EcoBoost (2020–2021 redesign)",
            "maxTow": 5300,
            "payload": 1500,
            "gcwr": 8800,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.0L EcoBoost (2020–2021)",
            "maxTow": 5600,
            "payload": 1400,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Timberline — 2.3L EcoBoost (2021)",
            "maxTow": 5300,
            "payload": 1450,
            "gcwr": 8750,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 4.0L V6 (2010 last gen4)",
            "maxTow": 5375,
            "payload": 1400,
            "gcwr": 8775,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.6L V8 (2010)",
            "maxTow": 7115,
            "payload": 1400,
            "gcwr": 10515,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2011–2018 redesign)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "XLT — 3.5L V6 (2011–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2011–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L EcoBoost (2013–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L EcoBoost (2016–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.3L EcoBoost (2016–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Explorer Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "Limited Hybrid",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "Platinum Hybrid",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 11850,
            "hitch": "Class III"
          },
          {
            "label": "King Ranch Hybrid",
            "maxTow": 5000,
            "payload": 1320,
            "gcwr": 11820,
            "hitch": "Class III"
          },
          {
            "label": "Limited Hybrid (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Hybrid (2020–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Flex",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 3.5L V6 (2015–2019)",
            "maxTow": 4500,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2015–2019)",
            "maxTow": 4500,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2015–2019)",
            "maxTow": 4500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L EcoBoost V6 (2015–2019)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2009–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2009–2012)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L EcoBoost V6 (2009–2012)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L EcoBoost V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2018–2019)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2018–2019)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2018–2019)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Limited EcoBoost — 3.5L TT (2018–2019)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2010–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.5L V6 (2010–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2018)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Limited EcoBoost — 3.5L TT (2010–2018)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "Titanium — 3.5L V6 (2011–2012)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Freestyle",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 3.0L V6 (2005–2007)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 3.0L V6 (2005–2007)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.0L V6 (2005–2007)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 3.0L V6 (2005–2007 last)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Mustang Mach-E",
        "kind": "suv",
        "trims": [
          {
            "label": "Select — RWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Premium — eAWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "GT — Dual Motor eAWD",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "Select RWD (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "California Route 1 (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "Premium AWD (2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "GT (2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5000,
            "hitch": "N/A"
          }
        ]
      }
    ]
  },
  {
    "name": "Ram",
    "models": [
      {
        "name": "1500",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman — 3.6L V6",
            "maxTow": 7700,
            "payload": 1720,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn — 5.7L HEMI V8",
            "maxTow": 11550,
            "payload": 1900,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI V8",
            "maxTow": 11650,
            "payload": 1850,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Rebel — 5.7L HEMI V8",
            "maxTow": 10210,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI eTorque",
            "maxTow": 12550,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited Longhorn — 5.7L HEMI",
            "maxTow": 12550,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Tungsten — 3.0L Hurricane Twin-Turbo I6",
            "maxTow": 11650,
            "payload": 1900,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "RHO — 3.0L Hurricane High Output",
            "maxTow": 8350,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "TRX — 6.2L Supercharged Hellcat V8",
            "maxTow": 8100,
            "payload": 1310,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L V6 eTorque (2019–2021)",
            "maxTow": 7700,
            "payload": 1720,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn — 5.7L HEMI V8 (2019–2021)",
            "maxTow": 12670,
            "payload": 1900,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI eTorque (2019–2021)",
            "maxTow": 12550,
            "payload": 1850,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Rebel — 5.7L HEMI V8 (2019–2021)",
            "maxTow": 10210,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI eTorque (2019–2021)",
            "maxTow": 12550,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Longhorn — 5.7L HEMI (2019–2021)",
            "maxTow": 12550,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "TRX — 6.2L Supercharged Hellcat (2021)",
            "maxTow": 8100,
            "payload": 1310,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Special Service — 5.7L HEMI (2019–2021)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L V6 (2015–2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 3.6L V6 (2015–2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 3.6L V6 (2015–2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 10550,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn / Lone Star — 5.7L HEMI (2015–2018)",
            "maxTow": 10550,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 10350,
            "payload": 1700,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie Longhorn — 5.7L HEMI (2015–2018)",
            "maxTow": 10350,
            "payload": 1700,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 10350,
            "payload": 1680,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "Rebel — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Night — 5.7L HEMI V8 (2016–2018)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.7L V6 (2005–2008)",
            "maxTow": 3650,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SXT — 4.7L V8 (2005–2008)",
            "maxTow": 6550,
            "payload": 1650,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI V8 (2005–2008)",
            "maxTow": 9050,
            "payload": 1800,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI V8 (2005–2008)",
            "maxTow": 9050,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.7L V6 (2009–2011)",
            "maxTow": 3800,
            "payload": 1500,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 4.7L V8 (2009–2011)",
            "maxTow": 7500,
            "payload": 1700,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 5.7L HEMI V8 (2009–2011)",
            "maxTow": 9100,
            "payload": 1750,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI V8 (2009–2011)",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 4500,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Express — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 4500,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Big Horn — 5.7L HEMI V8 (2012–2015)",
            "maxTow": 10250,
            "payload": 1850,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI V8 (2012–2015)",
            "maxTow": 10250,
            "payload": 1800,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie Longhorn — 5.7L HEMI V8 (2012–2015)",
            "maxTow": 10250,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 5.7L HEMI V8 (2012–2015)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.7L V6 (2010–2012)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 7400,
            "hitch": "Class III"
          },
          {
            "label": "ST — 4.7L V8 (2010–2013)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 5.7L HEMI (2010–2013)",
            "maxTow": 10000,
            "payload": 1650,
            "gcwr": 13650,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.7L / 4.7L (2010–2012)",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 4.7L V8 (2010–2013)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI (2010–2018)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 5.7L HEMI (2010–2018)",
            "maxTow": 10000,
            "payload": 1600,
            "gcwr": 13600,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 5.7L HEMI (2010–2018)",
            "maxTow": 10500,
            "payload": 1650,
            "gcwr": 14150,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie Longhorn — 5.7L HEMI (2011–2018)",
            "maxTow": 10500,
            "payload": 1600,
            "gcwr": 14100,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L V6 (2013–2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 9950,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 5.7L HEMI (2013–2018)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 3.6L V6 (2014–2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 9950,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn / Lone Star — 5.7L HEMI (2010–2018)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Rebel — 5.7L HEMI (2015–2018)",
            "maxTow": 10200,
            "payload": 1500,
            "gcwr": 13700,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI (2015–2018)",
            "maxTow": 10500,
            "payload": 1600,
            "gcwr": 14100,
            "hitch": "Class IV"
          },
          {
            "label": "EcoDiesel — 3.0L V6 Diesel (2014–2018)",
            "maxTow": 9200,
            "payload": 1650,
            "gcwr": 12850,
            "hitch": "Class IV"
          },
          {
            "label": "Night Edition — 5.7L HEMI (2016–2018)",
            "maxTow": 10500,
            "payload": 1600,
            "gcwr": 14100,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "1500 Classic",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman — 3.6L V6 (2019–2021)",
            "maxTow": 6850,
            "payload": 1600,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 3.6L V6 (2019–2021)",
            "maxTow": 6850,
            "payload": 1600,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Warlock — 5.7L HEMI V8 (2019–2021)",
            "maxTow": 10280,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 5.7L HEMI V8 (2019–2021)",
            "maxTow": 10500,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI V8 (2019–2021)",
            "maxTow": 10500,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L V6 (2015–2018 body)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 5.7L HEMI V8 (2015–2018 body)",
            "maxTow": 10550,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI V8 (2015–2018 body)",
            "maxTow": 10550,
            "payload": 1750,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Warlock — 5.7L HEMI V8 (2016–2018)",
            "maxTow": 10280,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.7L V6 (2009–2011)",
            "maxTow": 3800,
            "payload": 1500,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 5.7L HEMI V8 (2009–2012)",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L / 5.7L (2013–2015)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 3.6L V6 (DS body through 2018)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 9950,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 3.6L V6 (2014–2018 DS)",
            "maxTow": 6400,
            "payload": 1550,
            "gcwr": 9950,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI (2014–2018 DS)",
            "maxTow": 10500,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Warlock — 5.7L HEMI (2016–2018)",
            "maxTow": 10200,
            "payload": 1550,
            "gcwr": 13750,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "1500 REV",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman — Dual Motor EV",
            "maxTow": 7700,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn — Dual Motor EV",
            "maxTow": 10000,
            "payload": 2000,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — Dual Motor EV Ext. Range",
            "maxTow": 10000,
            "payload": 1900,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — Dual Motor EV Range-Extender",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "2500",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman — 6.4L HEMI V8",
            "maxTow": 14510,
            "payload": 3010,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn — 6.4L HEMI V8",
            "maxTow": 14940,
            "payload": 3190,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel",
            "maxTow": 19780,
            "payload": 3010,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 6.4L HEMI V8",
            "maxTow": 10170,
            "payload": 1840,
            "gcwr": 20000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 6.7L Cummins Diesel",
            "maxTow": 19780,
            "payload": 2900,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Rebel — 6.4L HEMI V8",
            "maxTow": 14000,
            "payload": 2600,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman — 6.4L HEMI V8 (2018–2021)",
            "maxTow": 14510,
            "payload": 3010,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn — 6.4L HEMI V8 (2018–2021)",
            "maxTow": 14940,
            "payload": 3190,
            "gcwr": 24000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel (2018–2021)",
            "maxTow": 19780,
            "payload": 3010,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 6.4L HEMI V8 (2018–2021)",
            "maxTow": 10170,
            "payload": 1840,
            "gcwr": 20000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 6.7L Cummins Diesel (2018–2021)",
            "maxTow": 19780,
            "payload": 2900,
            "gcwr": 30000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman — 5.7L HEMI V8 (2015–2018)",
            "maxTow": 12000,
            "payload": 2800,
            "gcwr": 21000,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 6.4L HEMI V8 (2015–2018)",
            "maxTow": 14000,
            "payload": 3000,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn — 6.4L HEMI V8 (2015–2018)",
            "maxTow": 14500,
            "payload": 3100,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel (2015–2018)",
            "maxTow": 17550,
            "payload": 2900,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 6.4L HEMI V8 (2015–2018)",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 19500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 6.7L Cummins Diesel (2015–2018)",
            "maxTow": 17550,
            "payload": 2800,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "Longhorn — 6.7L Cummins Diesel (2015–2018)",
            "maxTow": 17550,
            "payload": 2800,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "ST — 5.7L HEMI V8 (2005–2009)",
            "maxTow": 10000,
            "payload": 2500,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.9L / 6.7L Cummins Diesel (2005–2009)",
            "maxTow": 13500,
            "payload": 2800,
            "gcwr": 21000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel (2007–2009)",
            "maxTow": 14000,
            "payload": 2700,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "ST — 5.7L HEMI V8 (2010–2012)",
            "maxTow": 11000,
            "payload": 2600,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 6.7L Cummins Diesel (2010–2012)",
            "maxTow": 15000,
            "payload": 2900,
            "gcwr": 23000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel (2010–2012)",
            "maxTow": 15500,
            "payload": 2800,
            "gcwr": 23500,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman — 5.7L HEMI V8 (2013–2015)",
            "maxTow": 12000,
            "payload": 2700,
            "gcwr": 18000,
            "hitch": "Class IV"
          },
          {
            "label": "Big Horn — 6.7L Cummins Diesel (2013–2015)",
            "maxTow": 16000,
            "payload": 3000,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins Diesel (2013–2015)",
            "maxTow": 17000,
            "payload": 2900,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 6.4L HEMI V8 (2014–2015)",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 5.7L HEMI (2010–2012)",
            "maxTow": 12000,
            "payload": 2500,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 5.7L HEMI (2010–2012)",
            "maxTow": 12000,
            "payload": 2450,
            "gcwr": 16450,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 6.7L Cummins (2010–2012)",
            "maxTow": 16000,
            "payload": 2800,
            "gcwr": 20800,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 5.7L HEMI (2010–2013)",
            "maxTow": 10000,
            "payload": 1800,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 5.7L HEMI (2013–2018 redesign)",
            "maxTow": 13000,
            "payload": 2700,
            "gcwr": 17700,
            "hitch": "Class IV"
          },
          {
            "label": "Tradesman — 6.4L HEMI (2014–2018)",
            "maxTow": 14800,
            "payload": 3000,
            "gcwr": 19800,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn — 6.4L HEMI (2014–2018)",
            "maxTow": 14800,
            "payload": 2950,
            "gcwr": 19750,
            "hitch": "Class V"
          },
          {
            "label": "Laramie — 6.7L Cummins (2013–2018)",
            "maxTow": 17500,
            "payload": 3100,
            "gcwr": 22600,
            "hitch": "Class V"
          },
          {
            "label": "Power Wagon — 6.4L HEMI (2014–2018)",
            "maxTow": 10000,
            "payload": 1900,
            "gcwr": 13900,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 6.7L Cummins (2015–2018)",
            "maxTow": 17500,
            "payload": 3000,
            "gcwr": 22500,
            "hitch": "Class V"
          },
          {
            "label": "Longhorn — 6.7L Cummins (2013–2018)",
            "maxTow": 17500,
            "payload": 3000,
            "gcwr": 22500,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "3500",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman SRW — 6.4L HEMI V8",
            "maxTow": 16070,
            "payload": 4010,
            "gcwr": 25500,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn SRW — 6.7L Cummins Diesel",
            "maxTow": 23000,
            "payload": 4500,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW — 6.7L Cummins HO Diesel",
            "maxTow": 37090,
            "payload": 7680,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Cummins HO gooseneck",
            "maxTow": 37090,
            "payload": 7500,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Limited Longhorn DRW — 6.7L Cummins HO",
            "maxTow": 37090,
            "payload": 7400,
            "gcwr": 48000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman SRW — 6.4L HEMI V8 (2018–2021)",
            "maxTow": 16070,
            "payload": 4010,
            "gcwr": 25500,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn SRW — 6.7L Cummins (2018–2021)",
            "maxTow": 23000,
            "payload": 4500,
            "gcwr": 32000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW — 6.7L Cummins HO (2018–2021)",
            "maxTow": 35610,
            "payload": 7680,
            "gcwr": 47000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Cummins HO gooseneck (2018–2021)",
            "maxTow": 35610,
            "payload": 7500,
            "gcwr": 47000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman SRW — 6.4L HEMI V8 (2015–2018)",
            "maxTow": 15500,
            "payload": 3900,
            "gcwr": 25000,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn SRW — 6.7L Cummins (2015–2018)",
            "maxTow": 22000,
            "payload": 4300,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW — 6.7L Cummins HO (2015–2018)",
            "maxTow": 31100,
            "payload": 7000,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "Limited DRW — 6.7L Cummins HO gooseneck (2015–2018)",
            "maxTow": 31100,
            "payload": 6900,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "Longhorn DRW — 6.7L Cummins HO (2015–2018)",
            "maxTow": 31100,
            "payload": 6800,
            "gcwr": 43000,
            "hitch": "Class V"
          },
          {
            "label": "ST SRW — 5.7L HEMI V8 (2005–2009)",
            "maxTow": 11500,
            "payload": 3200,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "SLT DRW — 6.7L Cummins Diesel (2007–2009)",
            "maxTow": 16000,
            "payload": 4000,
            "gcwr": 26000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW gooseneck — 6.7L Cummins (2007–2009)",
            "maxTow": 18500,
            "payload": 3900,
            "gcwr": 29000,
            "hitch": "Class V"
          },
          {
            "label": "ST SRW — 5.7L HEMI V8 (2010–2012)",
            "maxTow": 12500,
            "payload": 3400,
            "gcwr": 20000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT DRW — 6.7L Cummins Diesel (2010–2012)",
            "maxTow": 17500,
            "payload": 4200,
            "gcwr": 28000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW gooseneck — 6.7L Cummins (2010–2012)",
            "maxTow": 22000,
            "payload": 4100,
            "gcwr": 33000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman SRW — 5.7L / 6.4L HEMI (2013–2015)",
            "maxTow": 14000,
            "payload": 3600,
            "gcwr": 22000,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn DRW — 6.7L Cummins Diesel (2013–2015)",
            "maxTow": 20000,
            "payload": 4500,
            "gcwr": 31000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW gooseneck — 6.7L Cummins (2013–2015)",
            "maxTow": 30000,
            "payload": 4400,
            "gcwr": 39000,
            "hitch": "Class V"
          },
          {
            "label": "ST SRW — 5.7L HEMI (2010–2012)",
            "maxTow": 14000,
            "payload": 4000,
            "gcwr": 20000,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW — 6.7L Cummins (2010–2012)",
            "maxTow": 22000,
            "payload": 5500,
            "gcwr": 29500,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman SRW — 6.4L HEMI (2013–2018)",
            "maxTow": 15500,
            "payload": 4200,
            "gcwr": 21700,
            "hitch": "Class V"
          },
          {
            "label": "Big Horn SRW — 6.7L Cummins (2013–2018)",
            "maxTow": 20000,
            "payload": 4500,
            "gcwr": 26500,
            "hitch": "Class V"
          },
          {
            "label": "Laramie DRW — 6.7L Cummins HO (2013–2018)",
            "maxTow": 30000,
            "payload": 6500,
            "gcwr": 38500,
            "hitch": "Class V"
          },
          {
            "label": "Longhorn DRW — 6.7L Cummins HO (2013–2018)",
            "maxTow": 30000,
            "payload": 6800,
            "gcwr": 38800,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "4500 Chassis Cab",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman DRW — 6.7L Cummins Diesel",
            "maxTow": 22500,
            "payload": 9000,
            "gcwr": 32500,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins HO",
            "maxTow": 25000,
            "payload": 9500,
            "gcwr": 35000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins (2011–2018)",
            "maxTow": 20000,
            "payload": 8500,
            "gcwr": 30500,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins HO (2013–2018)",
            "maxTow": 22500,
            "payload": 9000,
            "gcwr": 33500,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "5500 Chassis Cab",
        "kind": "truck",
        "trims": [
          {
            "label": "Tradesman DRW — 6.7L Cummins Diesel",
            "maxTow": 25000,
            "payload": 10000,
            "gcwr": 35000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins HO",
            "maxTow": 30000,
            "payload": 11000,
            "gcwr": 39000,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins (2011–2018)",
            "maxTow": 22000,
            "payload": 9500,
            "gcwr": 33500,
            "hitch": "Class V"
          },
          {
            "label": "Tradesman DRW — 6.7L Cummins HO (2013–2018)",
            "maxTow": 25000,
            "payload": 10000,
            "gcwr": 37000,
            "hitch": "Class V"
          }
        ]
      },
      {
        "name": "Dakota",
        "kind": "truck",
        "trims": [
          {
            "label": "ST — 3.7L V6 (2010–2011 last)",
            "maxTow": 3100,
            "payload": 1300,
            "gcwr": 6400,
            "hitch": "Class II"
          },
          {
            "label": "SXT — 3.7L V6 (2010–2011)",
            "maxTow": 3100,
            "payload": 1300,
            "gcwr": 6400,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 4.7L V8 (2010–2011)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 10650,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 4.7L V8 (2010–2011)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "TRX4 Off-Road — 4.7L V8 (2010–2011)",
            "maxTow": 6800,
            "payload": 1350,
            "gcwr": 10150,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Toyota",
    "models": [
      {
        "name": "Tacoma",
        "kind": "truck",
        "trims": [
          {
            "label": "SR — 2.4L Turbo I4",
            "maxTow": 3500,
            "payload": 1445,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 2.4L Turbo I4",
            "maxTow": 6500,
            "payload": 1545,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 2.4L Turbo I4",
            "maxTow": 6500,
            "payload": 1495,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 2.4L Turbo I4",
            "maxTow": 6400,
            "payload": 1445,
            "gcwr": 11400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 2.4L Turbo I4",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Trailhunter — 2.4L Hybrid i-FORCE MAX",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 2.4L Hybrid i-FORCE MAX",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SR — 2.7L I4 (2018–2021)",
            "maxTow": 3500,
            "payload": 1445,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 3.5L V6 (2018–2021)",
            "maxTow": 6800,
            "payload": 1545,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 3.5L V6 (2018–2021)",
            "maxTow": 6400,
            "payload": 1445,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 3.5L V6 (2018–2021)",
            "maxTow": 6400,
            "payload": 1445,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2018–2021)",
            "maxTow": 6400,
            "payload": 1400,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 3.5L V6 (2018–2021)",
            "maxTow": 6400,
            "payload": 1320,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Nightshade — 3.5L V6 (2021)",
            "maxTow": 6400,
            "payload": 1400,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.7L I4 (2015)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "PreRunner — 4.0L V6 (2015)",
            "maxTow": 6500,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 4.0L V6 (2015)",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2015)",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SR — 2.7L I4 (2016–2018)",
            "maxTow": 3500,
            "payload": 1445,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 3.5L V6 (2016–2018)",
            "maxTow": 6800,
            "payload": 1545,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 3.5L V6 (2016–2018)",
            "maxTow": 6400,
            "payload": 1445,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 3.5L V6 (2016–2018)",
            "maxTow": 6400,
            "payload": 1445,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2016–2018)",
            "maxTow": 6400,
            "payload": 1400,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 3.5L V6 (2017–2018)",
            "maxTow": 6400,
            "payload": 1320,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.7L I4 (2005–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "PreRunner — 4.0L V6 (2005–2015)",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2005–2015)",
            "maxTow": 6500,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 4.0L V6 (2005–2015)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "X-Runner — 4.0L V6 (2005–2009)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Double Cab Long Bed — 4.0L V6 (2009–2015)",
            "maxTow": 6500,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.7L I4 (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "PreRunner — 2.7L I4 (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "PreRunner — 4.0L V6 (2010–2015)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 9900,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2010–2015)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 9900,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 4.0L V6 (2010–2015)",
            "maxTow": 6500,
            "payload": 1350,
            "gcwr": 9850,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2010–2015)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "X-Runner — 4.0L V6 (2010–2013)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SR — 2.7L I4 (2016–2018 redesign)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 2.7L I4 (2016–2018)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 6950,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Tundra",
        "kind": "truck",
        "trims": [
          {
            "label": "SR — 3.4L Twin-Turbo V6",
            "maxTow": 8300,
            "payload": 1830,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 3.4L Twin-Turbo V6",
            "maxTow": 11300,
            "payload": 1940,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.4L Twin-Turbo V6",
            "maxTow": 11300,
            "payload": 1840,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.4L Twin-Turbo V6",
            "maxTow": 11180,
            "payload": 1760,
            "gcwr": 15800,
            "hitch": "Class IV"
          },
          {
            "label": "1794 Edition — 3.4L Twin-Turbo V6",
            "maxTow": 11180,
            "payload": 1760,
            "gcwr": 15800,
            "hitch": "Class IV"
          },
          {
            "label": "Capstone — 3.4L Hybrid i-FORCE MAX",
            "maxTow": 10370,
            "payload": 1605,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 3.4L Hybrid i-FORCE MAX",
            "maxTow": 11045,
            "payload": 1605,
            "gcwr": 15800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited Hybrid — 3.4L i-FORCE MAX",
            "maxTow": 11265,
            "payload": 1835,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "SR — 4.6L V8 (2018–2019)",
            "maxTow": 6400,
            "payload": 1560,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2018–2021)",
            "maxTow": 10200,
            "payload": 1730,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2018–2021)",
            "maxTow": 9800,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2018–2021)",
            "maxTow": 9800,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "1794 Edition — 5.7L V8 (2018–2021)",
            "maxTow": 9800,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 5.7L V8 (2018–2021)",
            "maxTow": 8800,
            "payload": 1420,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 5.7L V8 (2018–2021)",
            "maxTow": 9800,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 5.7L V8 (2018–2021)",
            "maxTow": 9800,
            "payload": 1550,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "SR — 4.6L V8 (2015–2018)",
            "maxTow": 6400,
            "payload": 1560,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.6L V8 (2015–2018)",
            "maxTow": 6800,
            "payload": 1600,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2015–2018)",
            "maxTow": 10200,
            "payload": 1730,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2015–2018)",
            "maxTow": 8900,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2015–2018)",
            "maxTow": 8900,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "1794 Edition — 5.7L V8 (2015–2018)",
            "maxTow": 8900,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 5.7L V8 (2015–2018)",
            "maxTow": 8300,
            "payload": 1420,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "TSS Off-Road — 5.7L V8 (2015–2018)",
            "maxTow": 8900,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2005–2006)",
            "maxTow": 4800,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 4.7L V8 (2005–2006)",
            "maxTow": 7100,
            "payload": 1700,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.7L V8 (2005–2006)",
            "maxTow": 7100,
            "payload": 1650,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2007–2013)",
            "maxTow": 5100,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.7L / 5.7L V8 (2007–2013)",
            "maxTow": 9000,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2007–2013)",
            "maxTow": 10500,
            "payload": 1750,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2008–2013)",
            "maxTow": 10000,
            "payload": 1700,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2014–2015)",
            "maxTow": 5200,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2014–2015)",
            "maxTow": 9500,
            "payload": 1850,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2014–2015)",
            "maxTow": 10200,
            "payload": 1800,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2014–2015)",
            "maxTow": 10000,
            "payload": 1750,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "1794 Edition — 5.7L V8 (2014–2015)",
            "maxTow": 10000,
            "payload": 1750,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 5.7L V8 (2015)",
            "maxTow": 9800,
            "payload": 1600,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Tundra Grade — 4.0L V6 (2010–2013)",
            "maxTow": 4800,
            "payload": 1500,
            "gcwr": 8300,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 4.6L V8 (2010–2018)",
            "maxTow": 6800,
            "payload": 1600,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2010–2018)",
            "maxTow": 10100,
            "payload": 1750,
            "gcwr": 13850,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2010–2018)",
            "maxTow": 10100,
            "payload": 1700,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2010–2018)",
            "maxTow": 9900,
            "payload": 1650,
            "gcwr": 13550,
            "hitch": "Class IV"
          },
          {
            "label": "1794 Edition — 5.7L V8 (2014–2018)",
            "maxTow": 9900,
            "payload": 1650,
            "gcwr": 13550,
            "hitch": "Class IV"
          },
          {
            "label": "SR — 4.6L V8 (2014–2018)",
            "maxTow": 6800,
            "payload": 1600,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 Double Cab — 5.7L V8 Max Tow (2010–2018)",
            "maxTow": 10400,
            "payload": 1800,
            "gcwr": 14200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "4Runner",
        "kind": "suv",
        "trims": [
          {
            "label": "SR5 — 2.4L Turbo",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "TRD Off-Road — 2.4L Turbo",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "TRD Pro — 2.4L Turbo Hybrid",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 10800,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — 2.4L Turbo Hybrid",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "SR5 — 4.0L V6 (2015–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2015–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 4.0L V6 (2015–2021)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.0L V6 (2015–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Nightshade — 4.0L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2005–2009)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 4.0L / 4.7L V8 (2005–2009)",
            "maxTow": 7000,
            "payload": 1350,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.0L / 4.7L V8 (2005–2009)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2010–2015)",
            "maxTow": 4700,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Trail — 4.0L V6 (2010–2015)",
            "maxTow": 4700,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 4.0L V6 (2010–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 4.0L V6 (2015)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 Premium — 4.0L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road Premium (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 4.0L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.0L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Venture — 4.0L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.0L V6 (2010–2018)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "Trail — 4.0L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.0L V6 (2010–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road — 4.0L V6 (2015–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 4.0L V6 (2015–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 Premium — 4.0L V6 (2011–2018)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "4Runner Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "SR5 i-FORCE MAX — Hybrid",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Off-Road i-FORCE MAX — Hybrid",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 14450,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro i-FORCE MAX — Hybrid",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 14400,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum i-FORCE MAX — Hybrid",
            "maxTow": 6000,
            "payload": 1420,
            "gcwr": 14420,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "bZ4X",
        "kind": "suv",
        "trims": [
          {
            "label": "XLE — FWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Limited — AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "C-HR",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — 2.0L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "XLE — 2.0L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Limited — 2.0L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LE — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "XLE — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Limited — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "XLE — 2.0L (2018 intro)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "XLE Premium — 2.0L (2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Corolla Cross",
        "kind": "suv",
        "trims": [
          {
            "label": "L — 2.0L",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LE — 2.0L",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.0L",
            "maxTow": 1500,
            "payload": 960,
            "gcwr": 6960,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid SE — Hybrid",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 6950,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid XSE — Hybrid",
            "maxTow": 1500,
            "payload": 940,
            "gcwr": 6940,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Crown Signia",
        "kind": "suv",
        "trims": [
          {
            "label": "XLE — Hybrid",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 9400,
            "hitch": "Class III"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 2700,
            "payload": 1150,
            "gcwr": 9350,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "FJ Cruiser",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 4.0L V6 (2015)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.0L V6 (2007–2009)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.0L V6 (2010–2014)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Trail Teams Special Edition — 4.0L V6 (2010–2014)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.0L V6 (2010–2014 last)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "Trail Teams Special Edition (2010–2014)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Grand Highlander",
        "kind": "suv",
        "trims": [
          {
            "label": "XLE — 2.4L Turbo",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.4L Hybrid",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — Hybrid MAX",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Grand Highlander Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "XLE — Hybrid",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 10500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 10450,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — Hybrid",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class III"
          },
          {
            "label": "Nightshade — Hybrid",
            "maxTow": 3500,
            "payload": 1420,
            "gcwr": 10420,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Highlander",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — 2.4L Turbo",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9800,
            "hitch": "Class III"
          },
          {
            "label": "XLE — Hybrid",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — Hybrid",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LE — 3.5L V6 (2015–2019)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "XLE — 3.5L V6 (2015–2019)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2015–2019)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 3.5L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "XLE — 3.5L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.4L I4 (2005–2007)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.3L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid Limited — 3.3L V6 Hybrid (2006–2007)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.7L I4 (2008–2013)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Sport / SE — 3.5L V6 (2008–2013)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2008–2013)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid Limited — 3.3L / 3.5L Hybrid (2008–2013)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LE — 2.7L I4 (2014–2015)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "XLE — 3.5L V6 (2014–2015)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2014–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "XLE — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.5L V6 (2018–2019)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.5L V6 (2020–2021 redesign)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "XSE — 3.5L V6 (2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 2.7L / 3.5L (2010–2013)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "SE — 3.5L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid (2010–2013)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "LE — 2.7L / 3.5L (2014–2018 redesign)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 4900,
            "hitch": "Class II"
          },
          {
            "label": "LE Plus — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "XLE — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid LE / XLE / Limited (2014–2018)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 6850,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Highlander Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — Hybrid",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class III"
          },
          {
            "label": "XLE — Hybrid",
            "maxTow": 3500,
            "payload": 1380,
            "gcwr": 10380,
            "hitch": "Class III"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 10350,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — Hybrid",
            "maxTow": 3500,
            "payload": 1320,
            "gcwr": 10320,
            "hitch": "Class III"
          },
          {
            "label": "LE Hybrid (2015–2019)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "XLE Hybrid (2015–2019)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LE Hybrid (2020–2021)",
            "maxTow": 3500,
            "payload": 1700,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "XLE Hybrid (2020–2021)",
            "maxTow": 3500,
            "payload": 1700,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited Hybrid (2020–2021)",
            "maxTow": 3500,
            "payload": 1650,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.3L V6 Hybrid (2006–2007)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.3L / 3.5L Hybrid (2008–2013)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L Hybrid (2008–2013)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "XLE — 3.5L Hybrid (2014–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L Hybrid (2014–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "LE Hybrid (2018–2019)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "XLE Hybrid (2018–2019)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 6850,
            "hitch": "Class III"
          },
          {
            "label": "Limited Hybrid (2018–2019)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Platinum Hybrid (2020–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid (2010–2013)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "LE Hybrid (2014–2018)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "XLE Hybrid (2014–2018)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 6850,
            "hitch": "Class III"
          },
          {
            "label": "Limited Hybrid (2014–2018)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Land Cruiser",
        "kind": "suv",
        "trims": [
          {
            "label": "1958 — 2.4L Turbo Hybrid",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class III"
          },
          {
            "label": "Land Cruiser — 2.4L Turbo Hybrid",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 11500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 5.7L V8 (2015–2021)",
            "maxTow": 8100,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Heritage Edition — 5.7L V8 (2020–2021)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.7L V8 (2005–2007)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.7L V8 (2008–2015)",
            "maxTow": 8200,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.7L V8 (2018–2021)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.7L V8 (2010–2015)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.7L V8 (2016–2018 refresh)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 11600,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Land Cruiser First Edition",
        "kind": "suv",
        "trims": [
          {
            "label": "First Edition — i-FORCE MAX Hybrid",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 14450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "RAV4",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — 2.5L",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "XLE — Hybrid",
            "maxTow": 1750,
            "payload": 1150,
            "gcwr": 5800,
            "hitch": "Class II"
          },
          {
            "label": "Adventure — 2.5L",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "TRD Off-Road — 2.5L",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "LE — 2.5L I4 (2015–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.5L I4 (2015–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L I4 (2015–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "LE — 2.5L I4 (2019–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.5L I4 (2019–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Adventure — 2.5L I4 (2019–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "TRD Off-Road — 2.5L I4 (2020–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.5L I4 (2019–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.4L I4 (2005)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "L — 2.4L I4 (2006–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Limited — 3.5L V6 (2006–2012)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.5L V6 (2006–2012)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LE — 2.5L I4 (2013–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "XLE — 2.5L I4 (2013–2015)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Limited — 2.5L I4 (2013–2015)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "LE — 2.5L (2018 last gen4)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.5L (2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "LE — 2.5L (2019–2021 gen5)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "XLE Premium — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Adventure — 2.5L (2019–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "TRD Off-Road — 2.5L (2020–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.5L (2010–2012)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L (2010–2012)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2010–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "LE — 2.5L (2013–2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "XLE — 2.5L (2013–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2013–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.5L (2015–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid LE / XLE / Limited (2016–2018)",
            "maxTow": 1750,
            "payload": 1100,
            "gcwr": 4850,
            "hitch": "Class II"
          },
          {
            "label": "Adventure — 2.5L (2018 gen5 start)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "RAV4 GR Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "GR Sport — Hybrid",
            "maxTow": 1750,
            "payload": 1000,
            "gcwr": 7250,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "RAV4 Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — Hybrid",
            "maxTow": 1750,
            "payload": 1100,
            "gcwr": 7350,
            "hitch": "Class II"
          },
          {
            "label": "XLE — Hybrid",
            "maxTow": 1750,
            "payload": 1080,
            "gcwr": 7330,
            "hitch": "Class II"
          },
          {
            "label": "SE — Hybrid",
            "maxTow": 1750,
            "payload": 1050,
            "gcwr": 7300,
            "hitch": "Class II"
          },
          {
            "label": "XSE — Hybrid",
            "maxTow": 1750,
            "payload": 1020,
            "gcwr": 7270,
            "hitch": "Class II"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 1750,
            "payload": 1000,
            "gcwr": 7250,
            "hitch": "Class II"
          },
          {
            "label": "Woodland — Hybrid",
            "maxTow": 1750,
            "payload": 1050,
            "gcwr": 7300,
            "hitch": "Class II"
          },
          {
            "label": "LE Hybrid (2019–2021)",
            "maxTow": 1750,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "XLE Hybrid (2019–2021)",
            "maxTow": 1750,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "XSE Hybrid (2019–2021)",
            "maxTow": 1750,
            "payload": 1300,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited Hybrid (2019–2021)",
            "maxTow": 1750,
            "payload": 1300,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "LE Hybrid (2016–2018)",
            "maxTow": 1750,
            "payload": 1100,
            "gcwr": 4850,
            "hitch": "Class II"
          },
          {
            "label": "XLE Hybrid (2016–2018)",
            "maxTow": 1750,
            "payload": 1100,
            "gcwr": 4850,
            "hitch": "Class II"
          },
          {
            "label": "Limited Hybrid (2016–2018)",
            "maxTow": 1750,
            "payload": 1050,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SE Hybrid (2017–2018)",
            "maxTow": 1750,
            "payload": 1050,
            "gcwr": 4800,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "RAV4 Prime",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — PHEV",
            "maxTow": 2500,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class III"
          },
          {
            "label": "XSE — PHEV",
            "maxTow": 2500,
            "payload": 1050,
            "gcwr": 9050,
            "hitch": "Class III"
          },
          {
            "label": "SE Prime (2021)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "XSE Prime (2021)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Sequoia",
        "kind": "suv",
        "trims": [
          {
            "label": "SR5 — 3.4L Twin-Turbo Hybrid",
            "maxTow": 9000,
            "payload": 1700,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.4L Hybrid",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.4L Hybrid",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 3.4L Hybrid",
            "maxTow": 9000,
            "payload": 1450,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Capstone — 3.4L Hybrid",
            "maxTow": 9000,
            "payload": 1500,
            "gcwr": 15200,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2015–2021)",
            "maxTow": 7400,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2015–2021)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2015–2021)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro — 5.7L V8 (2020–2021)",
            "maxTow": 7100,
            "payload": 1350,
            "gcwr": 12800,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.7L V8 (2005–2007)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 4.7L V8 (2005–2007)",
            "maxTow": 6500,
            "payload": 1350,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.7L / 5.7L V8 (2008–2015)",
            "maxTow": 7400,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2008–2015)",
            "maxTow": 7400,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2008–2015)",
            "maxTow": 7100,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 5.7L V8 (2018–2021)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2018–2021)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2018–2021)",
            "maxTow": 7100,
            "payload": 1300,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 5.7L V8 (2018–2021)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "SR5 — 4.6L / 5.7L V8 (2010–2018)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L V8 (2010–2018)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.7L V8 (2010–2018)",
            "maxTow": 7100,
            "payload": 1300,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Sport — 5.7L V8 (2018)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Sequoia Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "SR5 i-FORCE MAX — Hybrid",
            "maxTow": 9520,
            "payload": 1700,
            "gcwr": 18220,
            "hitch": "Class IV"
          },
          {
            "label": "Limited i-FORCE MAX — Hybrid",
            "maxTow": 9090,
            "payload": 1650,
            "gcwr": 17740,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum i-FORCE MAX — Hybrid",
            "maxTow": 9020,
            "payload": 1600,
            "gcwr": 17620,
            "hitch": "Class IV"
          },
          {
            "label": "TRD Pro i-FORCE MAX — Hybrid",
            "maxTow": 8975,
            "payload": 1550,
            "gcwr": 17525,
            "hitch": "Class IV"
          },
          {
            "label": "Capstone i-FORCE MAX — Hybrid",
            "maxTow": 8965,
            "payload": 1500,
            "gcwr": 17465,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Venza",
        "kind": "suv",
        "trims": [
          {
            "label": "LE — Hybrid",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "XLE — Hybrid",
            "maxTow": 0,
            "payload": 1080,
            "gcwr": 5580,
            "hitch": "—"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          },
          {
            "label": "Nightshade — Hybrid",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          },
          {
            "label": "LE Hybrid (2021)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "XLE Hybrid (2021)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Limited Hybrid (2021)",
            "maxTow": 2500,
            "payload": 1350,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.7L I4 (2009–2015)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "V6 — 3.5L V6 (2009–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited V6 — 3.5L V6 (2009–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LE Hybrid (2021 return)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Base — 2.7L / 3.5L (2010–2015 last gen1)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "LE — 2.7L / 3.5L (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "XLE — 3.5L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Nissan",
    "models": [
      {
        "name": "Frontier",
        "kind": "truck",
        "trims": [
          {
            "label": "S — 3.8L V6",
            "maxTow": 6460,
            "payload": 1460,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.8L V6",
            "maxTow": 6720,
            "payload": 1610,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-X — 3.8L V6",
            "maxTow": 6460,
            "payload": 1460,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 3.8L V6",
            "maxTow": 6290,
            "payload": 1410,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "S King Cab — 2.5L I4 (2018–2019)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "S — 4.0L V6 (2018–2021)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.0L V6 (2018–2021)",
            "maxTow": 6710,
            "payload": 1460,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2018–2021)",
            "maxTow": 6330,
            "payload": 1160,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "Desert Runner — 4.0L V6 (2018–2021)",
            "maxTow": 6330,
            "payload": 1160,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "S King Cab — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "SV King Cab — 2.5L I4 (2015–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "S — 4.0L V6 (2015–2018)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.0L V6 (2015–2018)",
            "maxTow": 6710,
            "payload": 1460,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2015–2018)",
            "maxTow": 6330,
            "payload": 1160,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "Desert Runner — 4.0L V6 (2015–2018)",
            "maxTow": 6330,
            "payload": 1160,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 4.0L V6 (2015–2018)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "XE — 2.5L I4 (2005–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 4.0L V6 (2005–2015)",
            "maxTow": 6300,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 4.0L V6 (2005–2015)",
            "maxTow": 6500,
            "payload": 1250,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2009–2015)",
            "maxTow": 6300,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.0L V6 (2011–2015)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Desert Runner — 4.0L V6 (2011–2015)",
            "maxTow": 6300,
            "payload": 1250,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "S King Cab — 2.5L I4 (2010–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "S — 4.0L V6 (2010–2018)",
            "maxTow": 6300,
            "payload": 1350,
            "gcwr": 9650,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.0L V6 (2010–2018)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 9900,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2010–2018)",
            "maxTow": 6330,
            "payload": 1300,
            "gcwr": 9630,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 4.0L V6 (2010–2018)",
            "maxTow": 6300,
            "payload": 1300,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Desert Runner — 4.0L V6 (2011–2018)",
            "maxTow": 6300,
            "payload": 1300,
            "gcwr": 9600,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Titan",
        "kind": "truck",
        "trims": [
          {
            "label": "S — 5.6L V8",
            "maxTow": 9230,
            "payload": 1640,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8",
            "maxTow": 9370,
            "payload": 1640,
            "gcwr": 14700,
            "hitch": "Class IV"
          },
          {
            "label": "Pro-4X — 5.6L V8",
            "maxTow": 9210,
            "payload": 1610,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8",
            "maxTow": 9210,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2018–2021)",
            "maxTow": 9230,
            "payload": 1640,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2018–2021)",
            "maxTow": 9370,
            "payload": 1640,
            "gcwr": 14700,
            "hitch": "Class IV"
          },
          {
            "label": "Pro-4X — 5.6L V8 (2018–2021)",
            "maxTow": 9210,
            "payload": 1610,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2018–2021)",
            "maxTow": 9210,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8 (2018–2021)",
            "maxTow": 9210,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2016–2018)",
            "maxTow": 9230,
            "payload": 1640,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2016–2018)",
            "maxTow": 9370,
            "payload": 1640,
            "gcwr": 14700,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.6L V8 (2016–2018)",
            "maxTow": 9210,
            "payload": 1610,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2016–2018)",
            "maxTow": 9210,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8 (2016–2018)",
            "maxTow": 9210,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2010–2015 1st gen)",
            "maxTow": 9500,
            "payload": 1600,
            "gcwr": 13100,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2010–2015)",
            "maxTow": 9500,
            "payload": 1600,
            "gcwr": 13100,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.6L V8 (2010–2015)",
            "maxTow": 9400,
            "payload": 1550,
            "gcwr": 12950,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2010–2015)",
            "maxTow": 9400,
            "payload": 1550,
            "gcwr": 12950,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2016–2018 redesign)",
            "maxTow": 9730,
            "payload": 1650,
            "gcwr": 13380,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8 (2017–2018)",
            "maxTow": 9270,
            "payload": 1550,
            "gcwr": 12820,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Titan (1st Gen)",
        "kind": "truck",
        "trims": [
          {
            "label": "S King Cab — 5.6L V8 (2015)",
            "maxTow": 7400,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SV Crew Cab — 5.6L V8 (2015)",
            "maxTow": 9500,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.6L V8 (2015)",
            "maxTow": 9300,
            "payload": 1550,
            "gcwr": 14300,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2015)",
            "maxTow": 9300,
            "payload": 1550,
            "gcwr": 14300,
            "hitch": "Class IV"
          },
          {
            "label": "XE — 5.6L V8 (2005–2007)",
            "maxTow": 9500,
            "payload": 1800,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 5.6L V8 (2005–2010)",
            "maxTow": 9500,
            "payload": 1750,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 5.6L V8 (2005–2010)",
            "maxTow": 9400,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.6L V8 (2008–2015)",
            "maxTow": 9200,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2011–2015)",
            "maxTow": 9400,
            "payload": 1750,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2011–2015)",
            "maxTow": 9400,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2011–2015)",
            "maxTow": 9300,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8 (2011–2015)",
            "maxTow": 9300,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "XE / S — 5.6L V8 (2010–2015)",
            "maxTow": 9500,
            "payload": 1600,
            "gcwr": 13100,
            "hitch": "Class IV"
          },
          {
            "label": "SE / SV — 5.6L V8 (2010–2015)",
            "maxTow": 9500,
            "payload": 1600,
            "gcwr": 13100,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.6L V8 (2010–2015)",
            "maxTow": 9400,
            "payload": 1550,
            "gcwr": 12950,
            "hitch": "Class IV"
          },
          {
            "label": "LE / SL — 5.6L V8 (2010–2015)",
            "maxTow": 9400,
            "payload": 1550,
            "gcwr": 12950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Titan XD",
        "kind": "truck",
        "trims": [
          {
            "label": "S — 5.6L V8",
            "maxTow": 11040,
            "payload": 2240,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8",
            "maxTow": 11040,
            "payload": 2240,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Pro-4X — 5.6L V8",
            "maxTow": 10780,
            "payload": 2100,
            "gcwr": 16800,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8",
            "maxTow": 10780,
            "payload": 2100,
            "gcwr": 16800,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2018–2021)",
            "maxTow": 11040,
            "payload": 2240,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.0L Cummins Diesel (2018–2019)",
            "maxTow": 12310,
            "payload": 2000,
            "gcwr": 19000,
            "hitch": "Class IV"
          },
          {
            "label": "Pro-4X — 5.0L Cummins Diesel (2018–2019)",
            "maxTow": 11970,
            "payload": 1900,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.6L V8 (2020–2021)",
            "maxTow": 10780,
            "payload": 2100,
            "gcwr": 16800,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.0L Cummins Diesel (2016–2018)",
            "maxTow": 12310,
            "payload": 2000,
            "gcwr": 19000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.0L Cummins Diesel (2016–2018)",
            "maxTow": 12310,
            "payload": 2000,
            "gcwr": 19000,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 5.0L Cummins Diesel (2016–2018)",
            "maxTow": 11970,
            "payload": 1900,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.0L Cummins Diesel (2016–2018)",
            "maxTow": 11970,
            "payload": 1900,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum Reserve — 5.0L Cummins (2016–2018)",
            "maxTow": 11970,
            "payload": 1900,
            "gcwr": 18500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 5.6L V8 (2017–2018)",
            "maxTow": 11040,
            "payload": 2240,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2017–2018)",
            "maxTow": 11040,
            "payload": 2240,
            "gcwr": 17000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Ariya",
        "kind": "suv",
        "trims": [
          {
            "label": "Engage — FWD",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Evolve+ — e-4ORCE AWD",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "Platinum+ — e-4ORCE AWD",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 6950,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Armada",
        "kind": "suv",
        "trims": [
          {
            "label": "SV — 5.6L V8",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2017–2021)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2017–2021)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8 (2017–2021)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2015–2016)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 5.6L V8 (2005–2015)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 5.6L V8 (2005–2010)",
            "maxTow": 9100,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2011–2015)",
            "maxTow": 9000,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8 (2011–2015)",
            "maxTow": 9000,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2018–2021)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2018–2021)",
            "maxTow": 8500,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8 (2018–2021)",
            "maxTow": 8500,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "Midnight Edition (2020–2021)",
            "maxTow": 8500,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 5.6L V8 (2010–2015)",
            "maxTow": 9100,
            "payload": 1500,
            "gcwr": 12600,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2010–2015)",
            "maxTow": 9100,
            "payload": 1450,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8 (2010–2015)",
            "maxTow": 9000,
            "payload": 1400,
            "gcwr": 12400,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 5.6L V8 (2017–2018 redesign)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 5.6L V8 (2017–2018)",
            "maxTow": 8500,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 5.6L V8 (2017–2018)",
            "maxTow": 8500,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Juke",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.6L Turbo (2015–2017)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L Turbo (2015–2017)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "NISMO — 1.6L Turbo (2015–2017)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "S — 1.6L Turbo (2011–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L Turbo (2011–2015)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SL — 1.6L Turbo (2011–2015)",
            "maxTow": 0,
            "payload": 800,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "NISMO — 1.6L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 800,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "S — 1.6L Turbo (2011–2017)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L Turbo (2011–2017)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "SL — 1.6L Turbo (2011–2017)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "NISMO — 1.6L Turbo (2011–2017)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3850,
            "hitch": "N/A"
          },
          {
            "label": "NISMO RS (2014–2017)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3850,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Kicks",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.6L",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 5350,
            "hitch": "—"
          },
          {
            "label": "SV — 1.6L",
            "maxTow": 0,
            "payload": 840,
            "gcwr": 5340,
            "hitch": "—"
          },
          {
            "label": "SR — 1.6L",
            "maxTow": 0,
            "payload": 830,
            "gcwr": 5330,
            "hitch": "—"
          },
          {
            "label": "S — 1.6L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "SR — 1.6L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "S — 1.6L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SR — 1.6L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "S — 1.6L (2018 intro)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "SV — 1.6L (2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "SR — 1.6L (2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Murano",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 3.5L V6",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "SV — 3.5L V6",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 3.5L V6",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.0L Turbo (2025+)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "S — 3.5L V6 (2015–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SV — 3.5L V6 (2015–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SL — 3.5L V6 (2015–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 3.5L V6 (2015–2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "S — 3.5L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SL — 3.5L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.5L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "S — 3.5L V6 (2009–2014)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SL — 3.5L V6 (2009–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LE — 3.5L V6 (2009–2014)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "CrossCabriolet — 3.5L V6 (2011–2014)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "S — 3.5L V6 (2015)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SV — 3.5L V6 (2015)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SL — 3.5L V6 (2015)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Platinum — 3.5L V6 (2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "S — 3.5L V6 (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SV — 3.5L V6 (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SL — 3.5L V6 (2018–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 3.5L V6 (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "S — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SV — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SL — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "LE — 3.5L V6 (2010–2014)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "CrossCabriolet (2011–2014)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "S — 3.5L V6 (2015–2018 redesign)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SV — 3.5L V6 (2015–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SL — 3.5L V6 (2015–2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4650,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 3.5L V6 (2015–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Pathfinder",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 3.5L V6",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "SV — 3.5L V6",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Rock Creek — 3.5L V6",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — 3.5L V6",
            "maxTow": 6000,
            "payload": 1380,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "S — 3.5L V6 (2015–2020)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.5L V6 (2015–2020)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 3.5L V6 (2015–2020)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2015–2020)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1650,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1650,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "XE — 4.0L V6 (2005–2012)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 4.0L V6 (2005–2012)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 4.0L V6 (2005–2012)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SE Off-Road — 4.0L V6 (2005–2012)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.5L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.5L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 3.5L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 2.5L Hybrid (2014–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "S — 3.5L V6 (2018–2020)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.5L V6 (2018–2020)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 3.5L V6 (2018–2020)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2018–2020)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.5L V6 (2021 redesign)",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 9450,
            "hitch": "Class IV"
          },
          {
            "label": "Rock Creek — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 9450,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.0L V6 (2010–2012 last body-on-frame)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 4.0L V6 (2010–2012)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "LE — 4.0L V6 (2010–2012)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.5L V6 (2013–2018 crossover redesign)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 3.5L V6 (2013–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "SL — 3.5L V6 (2013–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 3.5L V6 (2013–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid (2014–2017)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Pathfinder Rock Creek",
        "kind": "suv",
        "trims": [
          {
            "label": "Rock Creek — 3.5L V6",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 14400,
            "hitch": "Class IV"
          },
          {
            "label": "Rock Creek — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 9450,
            "hitch": "Class IV"
          },
          {
            "label": "Rock Creek 4WD — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 9450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Rogue",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "SV — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1020,
            "gcwr": 7020,
            "hitch": "Class II"
          },
          {
            "label": "SL — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "Rock Creek — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L I4 (2015–2020)",
            "maxTow": 1000,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L I4 (2015–2020)",
            "maxTow": 1000,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L I4 (2015–2020)",
            "maxTow": 1000,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L I4 (2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L I4 (2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L I4 (2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 2.5L I4 (2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L I4 (2008–2013)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SL — 2.5L I4 (2008–2013)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "S — 2.5L I4 (2014–2015)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SV — 2.5L I4 (2014–2015)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SL — 2.5L I4 (2014–2015)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "S — 2.5L (2018–2020)",
            "maxTow": 1100,
            "payload": 1100,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L (2018–2020)",
            "maxTow": 1100,
            "payload": 1100,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L (2018–2020)",
            "maxTow": 1100,
            "payload": 1050,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L (2021 redesign)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L (2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L (2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Platinum — 2.5L (2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L (2010–2013)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4100,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L (2010–2013)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4100,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L (2010–2013)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 4050,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L (2014–2018 redesign)",
            "maxTow": 1100,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.5L (2014–2018)",
            "maxTow": 1100,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.5L (2014–2018)",
            "maxTow": 1100,
            "payload": 1050,
            "gcwr": 4150,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid (2017–2018)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 4050,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Rogue Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 2.0L I4 (2017–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SV — 2.0L I4 (2017–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SL — 2.0L I4 (2017–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "S — 2.0L (2018–2021)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.0L (2018–2021)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.0L (2018–2021)",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0L (2017–2018 intro)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "SV — 2.0L (2017–2018)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "SL — 2.0L (2017–2018)",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 4000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Xterra",
        "kind": "suv",
        "trims": [
          {
            "label": "XE — 4.0L V6 (2005–2015)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 4.0L V6 (2005–2010)",
            "maxTow": 5000,
            "payload": 1050,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Off-Road — 4.0L V6 (2005–2015)",
            "maxTow": 5000,
            "payload": 1000,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2009–2015)",
            "maxTow": 5000,
            "payload": 1000,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.0L V6 (2011–2015)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.0L V6 (2011–2015)",
            "maxTow": 5000,
            "payload": 1050,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "X — 4.0L V6 (2010–2015 last)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.0L V6 (2010–2015)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "PRO-4X — 4.0L V6 (2010–2015)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Honda",
    "models": [
      {
        "name": "Ridgeline",
        "kind": "truck",
        "trims": [
          {
            "label": "Sport — 3.5L V6 AWD",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL — 3.5L V6 AWD",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "TrailSport — 3.5L V6 AWD",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "Black Edition — 3.5L V6 AWD",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RT — 3.5L V6 AWD (2018–2019)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L V6 AWD (2018–2021)",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL — 3.5L V6 AWD (2018–2021)",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL-E — 3.5L V6 AWD (2018–2021)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "Black Edition — 3.5L V6 AWD (2018–2021)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RT — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTS — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL-T — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RTL-E — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "Black Edition — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1499,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L V6 AWD (2018)",
            "maxTow": 5000,
            "payload": 1584,
            "gcwr": 8201,
            "hitch": "Class IV"
          },
          {
            "label": "RT — 3.5L V6 (2006–2014)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "RTS — 3.5L V6 (2006–2014)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "RTL — 3.5L V6 (2006–2014)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "RTL w/ Navigation — 3.5L V6 (2006–2014)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L V6 (2006–2008)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.5L V6 (2007)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "RT — 3.5L V6 (2010–2014 1st gen)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "RTS — 3.5L V6 (2010–2014)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "RTL — 3.5L V6 (2010–2014)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "RTL w/ Navigation (2010–2014)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L V6 (2012–2014)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "RT — 3.5L V6 AWD (2017–2018 redesign)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.5L V6 AWD (2017–2018)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "CR-V",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — Hybrid",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L I4 (2015–2016)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L I4 (2015–2016)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "LX — 1.5L Turbo (2017–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "EX — 1.5L Turbo (2017–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — 1.5L Turbo (2017–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 1.5L Turbo (2017–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L I4 (2005–2006)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "EX — 2.4L I4 (2005–2006)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "LX — 2.4L I4 (2007–2011)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "EX — 2.4L I4 (2007–2011)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "EX-L — 2.4L I4 (2007–2011)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "LX — 2.4L I4 (2012–2014)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "EX — 2.4L I4 (2012–2014)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "EX-L — 2.4L I4 (2012–2014)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "LX — 2.4L I4 (2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "EX — 2.4L I4 (2015)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Touring — 2.4L I4 (2015)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "LX — 2.4L (2018–2019)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "EX — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "LX — 1.5L Turbo (2020–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2010–2011)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2010–2011)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — 2.4L (2010–2011)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2012–2014 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2012–2014)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — 2.4L (2012–2014)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2015–2016)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX / EX-L / Touring — 2.4L (2015–2016)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2017–2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX — 1.5L Turbo (2017–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "EX-L — 1.5L Turbo (2017–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 1.5L Turbo (2017–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "CR-V Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport Hybrid",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class II"
          },
          {
            "label": "Sport-L Hybrid",
            "maxTow": 1000,
            "payload": 1080,
            "gcwr": 6580,
            "hitch": "Class II"
          },
          {
            "label": "Sport Touring Hybrid",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class II"
          },
          {
            "label": "EX Hybrid (2020–2021)",
            "maxTow": 1000,
            "payload": 1400,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "EX-L Hybrid (2020–2021)",
            "maxTow": 1000,
            "payload": 1400,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Touring Hybrid (2020–2021)",
            "maxTow": 1000,
            "payload": 1350,
            "gcwr": 4800,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Element",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.4L I4 (2005–2008)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "EX — 2.4L I4 (2005–2011)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SC — 2.4L I4 (2007–2010)",
            "maxTow": 1500,
            "payload": 900,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "LX — 2.4L (2010–2011 last)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2010–2011)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SC — 2.4L (2010–2011)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "HR-V",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.0L",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "Sport — 2.0L",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "EX-L — 2.0L",
            "maxTow": 0,
            "payload": 930,
            "gcwr": 5430,
            "hitch": "—"
          },
          {
            "label": "LX — 1.8L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 1.8L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX — 1.8L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX-L — 1.8L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LX — 1.8L (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 1.8L (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "EX — 1.8L (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "EX-L — 1.8L (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "LX — 1.8L (2016–2018 intro)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX — 1.8L (2016–2018)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX-L — 1.8L (2016–2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Passport",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.5L V6",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8200,
            "hitch": "Class III"
          },
          {
            "label": "TrailSport — 3.5L V6",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 9800,
            "hitch": "Class III"
          },
          {
            "label": "Elite — 3.5L V6",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 9800,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.5L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "EX-L — 3.5L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Touring — 3.5L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Elite — 3.5L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.2L V6 (2002 last gen — historical)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 7700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Pilot",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.5L V6",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "EX-L — 3.5L V6",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "TrailSport — 3.5L V6",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Elite — 3.5L V6",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.5L V6 (2016–2021)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2016–2021)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "EX-L — 3.5L V6 (2016–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Touring — 3.5L V6 (2016–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Elite — 3.5L V6 (2016–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LX — 3.5L V6 (2005–2008)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2005–2008)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "EX-L — 3.5L V6 (2005–2008)",
            "maxTow": 4500,
            "payload": 1250,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.5L V6 (2009–2015)",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "EX — 3.5L V6 (2009–2015)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "EX-L — 3.5L V6 (2009–2015)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.5L V6 (2009–2015)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.5L V6 (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "EX-L — 3.5L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Touring — 3.5L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Elite — 3.5L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Black Edition — 3.5L V6 (2019–2021)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "LX — 3.5L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2010–2015)",
            "maxTow": 4500,
            "payload": 1450,
            "gcwr": 7950,
            "hitch": "Class III"
          },
          {
            "label": "EX-L — 3.5L V6 (2010–2015)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.5L V6 (2010–2015)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.5L V6 (2016–2018 redesign)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "EX-L — 3.5L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Touring — 3.5L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Elite — 3.5L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Pilot Trailsport",
        "kind": "suv",
        "trims": [
          {
            "label": "Trailsport — 3.5L V6",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Prologue",
        "kind": "suv",
        "trims": [
          {
            "label": "EX — FWD",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "Touring — AWD",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "Elite — AWD",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          }
        ]
      }
    ]
  },
  {
    "name": "Jeep",
    "models": [
      {
        "name": "Gladiator",
        "kind": "truck",
        "trims": [
          {
            "label": "Sport — 3.6L V6",
            "maxTow": 4000,
            "payload": 1160,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Willys — 3.6L V6",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 3.6L V6",
            "maxTow": 6000,
            "payload": 1160,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Rubicon — 3.6L V6",
            "maxTow": 7000,
            "payload": 1200,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Mojave — 3.6L V6",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Rubicon X — 3.6L V6",
            "maxTow": 7000,
            "payload": 1150,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "High Altitude — 3.6L V6",
            "maxTow": 6000,
            "payload": 1160,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1160,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport S — 3.6L V6 (2020–2021)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 3.6L V6 (2020–2021)",
            "maxTow": 6000,
            "payload": 1160,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Rubicon — 3.6L V6 (2020–2021)",
            "maxTow": 7000,
            "payload": 1200,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Mojave — 3.6L V6 (2021)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "High Altitude — 3.6L V6 (2021)",
            "maxTow": 6000,
            "payload": 1160,
            "gcwr": 10000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Cherokee",
        "kind": "suv",
        "trims": [
          {
            "label": "Latitude — 2.4L",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.2L V6",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 11200,
            "hitch": "Class III"
          },
          {
            "label": "Trailhawk — 3.2L V6",
            "maxTow": 4500,
            "payload": 1150,
            "gcwr": 11150,
            "hitch": "Class III"
          },
          {
            "label": "Latitude — 3.2L V6 (2015–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.2L V6 (2015–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Trailhawk — 3.2L V6 (2015–2018)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Latitude — 2.0L Turbo (2019–2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.0L Turbo (2019–2021)",
            "maxTow": 4000,
            "payload": 1250,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.4L Tigershark I4 (2014–2015)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L / 3.2L (2014–2015)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.2L V6 (2014–2015)",
            "maxTow": 4500,
            "payload": 1150,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Trailhawk — 3.2L V6 (2014–2015)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Latitude — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Latitude Plus — 2.4L / 3.2L (2018–2021)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.2L V6 (2018–2021)",
            "maxTow": 4500,
            "payload": 1150,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Trailhawk — 3.2L V6 (2018–2021)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 3.2L V6 (2018–2021)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "High Altitude — 3.2L (2019–2021)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.4L (2014–2018 return)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L / 3.2L (2014–2018)",
            "maxTow": 4500,
            "payload": 1200,
            "gcwr": 7700,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.2L V6 (2014–2018)",
            "maxTow": 4500,
            "payload": 1150,
            "gcwr": 7650,
            "hitch": "Class III"
          },
          {
            "label": "Trailhawk — 3.2L V6 (2014–2018)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 3.2L V6 (2016–2018)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Commander",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.7L V6 (2006–2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 4.7L V8 (2006–2010)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 5.7L HEMI V8 (2006–2010)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.7L V6 (2010 last)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI (2010)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 5.7L HEMI (2010)",
            "maxTow": 7200,
            "payload": 1200,
            "gcwr": 10400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Compass",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 980,
            "gcwr": 7480,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 7450,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 970,
            "gcwr": 7470,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L I4 (2017–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2017–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L I4 (2017–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.4L I4 (2015–2016)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L I4 (2007–2010)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2007–2010)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "High Altitude — 2.4L (2020–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L (2010–2016)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2010–2016)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2010–2016)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.4L (2017–2018 redesign)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2017–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2017–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L (2017–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Grand Cherokee",
        "kind": "suv",
        "trims": [
          {
            "label": "Laredo — 3.6L V6",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.0L 4xe Hybrid",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 10800,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 3.6L V6",
            "maxTow": 6200,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Summit Reserve — 5.7L HEMI",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI V8 (2015–2021)",
            "maxTow": 7200,
            "payload": 1550,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1550,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SRT — 6.4L V8 (2015–2021)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Trackhawk — 6.2L Supercharged (2018–2021)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.7L V6 (2005–2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 4.7L V8 (2005–2010)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 5.7L HEMI V8 (2005–2010)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "SRT8 — 6.1L HEMI V8 (2006–2010)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Laredo — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 6200,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 5.7L HEMI V8 (2011–2015)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI V8 (2014–2015)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SRT — 6.4L HEMI V8 (2012–2015)",
            "maxTow": 7200,
            "payload": 1200,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "EcoDiesel — 3.0L V6 Diesel (2014–2015)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.6L V6 (2018–2021)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2018–2021)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "Trailhawk — 3.6L V6 (2018–2021)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 3.6L / 5.7L (2018–2021)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI (2018–2021)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SRT — 6.4L V8 (2018–2021)",
            "maxTow": 7200,
            "payload": 1200,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.6L V6 (2021 WL gen)",
            "maxTow": 6200,
            "payload": 1450,
            "gcwr": 9650,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2021 WL)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.7L V6 (2010 last WK)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI (2010)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 5.7L HEMI (2010)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "SRT8 — 6.1L V8 (2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Laredo — 3.6L V6 (2011–2018 redesign WK2)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2011–2018)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI (2011–2018)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 3.6L / 5.7L (2011–2018)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI (2014–2018)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Trailhawk — 3.6L V6 (2017–2018)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "SRT8 — 6.4L V8 (2012–2018)",
            "maxTow": 7200,
            "payload": 1200,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "Trackhawk — 6.2L Supercharged (2018)",
            "maxTow": 7200,
            "payload": 1150,
            "gcwr": 10350,
            "hitch": "Class IV"
          },
          {
            "label": "EcoDiesel — 3.0L V6 (2014–2018)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 10800,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Grand Cherokee 4xe",
        "kind": "suv",
        "trims": [
          {
            "label": "4xe — 2.0L Turbo PHEV",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 14300,
            "hitch": "Class IV"
          },
          {
            "label": "Trailhawk 4xe — 2.0L Turbo PHEV",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 14250,
            "hitch": "Class IV"
          },
          {
            "label": "Summit Reserve 4xe — 2.0L Turbo PHEV",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 14200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Grand Cherokee L",
        "kind": "suv",
        "trims": [
          {
            "label": "Laredo — 3.6L V6",
            "maxTow": 6200,
            "payload": 1450,
            "gcwr": 11200,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.6L V6",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 11200,
            "hitch": "Class III"
          },
          {
            "label": "Overland — 5.7L HEMI",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.6L V6 (2021)",
            "maxTow": 6200,
            "payload": 1700,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2021)",
            "maxTow": 6200,
            "payload": 1650,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 3.6L V6 (2021)",
            "maxTow": 6200,
            "payload": 1650,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI V8 (2021)",
            "maxTow": 7200,
            "payload": 1600,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "Laredo — 3.6L V6 (2021 intro)",
            "maxTow": 6200,
            "payload": 1500,
            "gcwr": 9700,
            "hitch": "Class IV"
          },
          {
            "label": "Altitude — 3.6L V6 (2021)",
            "maxTow": 6200,
            "payload": 1500,
            "gcwr": 9700,
            "hitch": "Class IV"
          },
          {
            "label": "Overland — 3.6L / 5.7L (2021)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "Summit — 5.7L HEMI (2021)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Grand Wagoneer",
        "kind": "suv",
        "trims": [
          {
            "label": "Grand Wagoneer — 3.0L Hurricane",
            "maxTow": 9900,
            "payload": 1450,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Series II Obsidian — 3.0L Hurricane",
            "maxTow": 9900,
            "payload": 1400,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Series III — 3.0L Hurricane",
            "maxTow": 9900,
            "payload": 1350,
            "gcwr": 16200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Grand Wagoneer L",
        "kind": "suv",
        "trims": [
          {
            "label": "Series II — 3.0L Hurricane I6",
            "maxTow": 9900,
            "payload": 1550,
            "gcwr": 18450,
            "hitch": "Class IV"
          },
          {
            "label": "Series III Obsidian — 3.0L Hurricane I6",
            "maxTow": 9900,
            "payload": 1500,
            "gcwr": 18400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Liberty",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.7L V6 (2005–2007)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.7L V6 (2005–2007)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Renegade — 3.7L V6 (2005–2006)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.7L V6 (2008–2012)",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.7L V6 (2008–2012)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Jet — 3.7L V6 (2011–2012)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.7L V6 (2010–2012 last)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.7L V6 (2010–2012)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8100,
            "hitch": "Class IV"
          },
          {
            "label": "Renegade — 3.7L V6 (2010–2012)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8100,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Patriot",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 2.0L I4 (2015–2017)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L I4 (2015–2017)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2015–2017)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L I4 (2007–2010)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2007–2010)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.4L (2010–2017 last)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2010–2017)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2010–2017)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "75th Anniversary (2016)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Renegade",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 1.3L Turbo",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 7450,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 1.3L Turbo",
            "maxTow": 2000,
            "payload": 940,
            "gcwr": 7440,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 1.3L Turbo",
            "maxTow": 2000,
            "payload": 920,
            "gcwr": 7420,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Altitude — 1.3L Turbo (2020–2021)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 1.4L Turbo / 2.4L (2015–2018 intro)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Latitude — 2.4L (2015–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2015–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Trailhawk — 2.4L (2015–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Wagoneer",
        "kind": "suv",
        "trims": [
          {
            "label": "Wagoneer — 3.0L Hurricane Twin-Turbo",
            "maxTow": 10000,
            "payload": 1500,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Series II — 3.0L Hurricane",
            "maxTow": 10000,
            "payload": 1450,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Series III — 3.0L Hurricane",
            "maxTow": 10000,
            "payload": 1400,
            "gcwr": 16500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Wagoneer L",
        "kind": "suv",
        "trims": [
          {
            "label": "Series II — 3.0L Hurricane I6",
            "maxTow": 10000,
            "payload": 1600,
            "gcwr": 18600,
            "hitch": "Class IV"
          },
          {
            "label": "Series III — 3.0L Hurricane I6",
            "maxTow": 10000,
            "payload": 1550,
            "gcwr": 18550,
            "hitch": "Class IV"
          },
          {
            "label": "Carbide — 3.0L Hurricane I6",
            "maxTow": 10000,
            "payload": 1500,
            "gcwr": 18500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Wagoneer S",
        "kind": "suv",
        "trims": [
          {
            "label": "Launch Edition — Dual Motor EV",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Limited — Dual Motor EV",
            "maxTow": 3500,
            "payload": 1080,
            "gcwr": 10080,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Wrangler",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.6L V6",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon — 3.6L V6",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "4xe — 2.0L Plug-in Hybrid",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6 (2015–2017 JK)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.6L V6 (2015–2017 JK)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 3.6L V6 (2015–2017 JK)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6 (2018–2021 JL)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.6L V6 (2018–2021 JL)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon — 3.6L V6 (2018–2021 JL)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "SE Soft Top — 2.4L / 3.8L (2005–2006)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4500,
            "hitch": "Class I"
          },
          {
            "label": "X — 4.0L I6 (2005–2006)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 4.0L I6 (2005–2006)",
            "maxTow": 2000,
            "payload": 900,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Unlimited Rubicon — 4.0L I6 (2005–2006)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "X — 3.8L V6 (2007–2011)",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "Sahara — 3.8L V6 (2007–2011)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 3.8L V6 (2007–2011)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Unlimited Sahara — 3.8L V6 (2007–2011)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Unlimited Sport — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Sahara — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Rubicon — 3.6L Pentastar V6 (2012–2015)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Sport S — 3.6L V6 (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.6L V6 (2018–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon — 3.6L V6 (2018–2021)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Sahara — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon — 2.0L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Sport — 3.6L (2018–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Rubicon — 3.6L (2018–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "High Altitude — 3.6L (2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Willys — 3.6L (2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 3.8L V6 (2010–2011 JK)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.8L V6 (2010–2011)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 3.8L V6 (2010–2011)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 3.6L V6 (2012–2018 JK)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Sahara — 3.6L V6 (2012–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon — 3.6L V6 (2012–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Unlimited Sport — 3.6L (2012–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Sahara — 3.6L (2012–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          },
          {
            "label": "Unlimited Rubicon — 3.6L (2012–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          },
          {
            "label": "Willys Wheeler (2014–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Rubicon Recon (2017–2018)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Wrangler 4xe",
        "kind": "suv",
        "trims": [
          {
            "label": "Sahara 4xe — 2.0L Turbo PHEV",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon 4xe — 2.0L Turbo PHEV",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "Sahara 4xe (2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Rubicon 4xe (2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Sahara 4xe (2021 intro)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "High Altitude 4xe (2021)",
            "maxTow": 3500,
            "payload": 950,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Buick",
    "models": [
      {
        "name": "Enclave",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class III"
          },
          {
            "label": "Essence — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1480,
            "gcwr": 11980,
            "hitch": "Class III"
          },
          {
            "label": "Avenir — 2.5L Turbo",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class III"
          },
          {
            "label": "Leather — 3.6L V6 (2015–2017)",
            "maxTow": 4500,
            "payload": 1600,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2015–2017)",
            "maxTow": 4500,
            "payload": 1550,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Essence — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1750,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Avenir — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "CX — 3.6L V6 (2008–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "CXL — 3.6L V6 (2008–2012)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "CXL — 3.6L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Leather — 3.6L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Preferred — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "CX — 3.6L V6 (2010–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "CXL — 3.6L V6 (2010–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "CXL Convenience (2010–2012)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Convenience — 3.6L V6 (2013–2017)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Leather — 3.6L V6 (2013–2017)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2013–2017)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Preferred — 3.6L V6 (2018 redesign)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Essence — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Avenir — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Encore",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 1.4L Turbo (2015–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Sport Touring — 1.4L Turbo (2015–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Essence — 1.4L Turbo (2015–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Base — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Convenience — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Leather — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Premium — 1.4L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Preferred — 1.4L Turbo (2018–2021)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Sport Touring — 1.4L Turbo (2018–2021)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 1.4L Turbo (2018–2021)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Base — 1.4L Turbo (2013–2018 intro)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "Convenience — 1.4L Turbo (2013–2018)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "Leather — 1.4L Turbo (2013–2018)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 1.4L Turbo (2013–2018)",
            "maxTow": 1000,
            "payload": 850,
            "gcwr": 4000,
            "hitch": "Class II"
          },
          {
            "label": "Sport Touring — 1.4L Turbo (2016–2018)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Encore GX",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 1.2L Turbo",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 6450,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 1.3L Turbo",
            "maxTow": 1000,
            "payload": 980,
            "gcwr": 6480,
            "hitch": "Class II"
          },
          {
            "label": "Avenir — 1.3L Turbo",
            "maxTow": 1000,
            "payload": 960,
            "gcwr": 6460,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 1.2L Turbo (2020–2021)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Select — 1.3L Turbo (2020–2021)",
            "maxTow": 1000,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 1.3L Turbo (2020–2021)",
            "maxTow": 1000,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 1.3L Turbo AWD (2020–2021)",
            "maxTow": 1000,
            "payload": 900,
            "gcwr": 4200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Envision",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "Avenir — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 2.5L I4 (2016–2020)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 2.0L Turbo (2016–2020)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 2.0L Turbo (2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Avenir — 2.0L Turbo (2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 2.5L (2018–2020)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 2.0L Turbo (2018–2020)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Premium II — 2.0L Turbo (2018–2020)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 2.0L Turbo (2021 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 2.0L Turbo (2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Preferred — 2.5L (2016–2018 intro)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Essence — 2.0L Turbo (2016–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Premium I — 2.0L Turbo (2016–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "Premium II — 2.0L Turbo (2016–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Envista",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 1.2L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "Sport Touring — 1.2L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "Avenir — 1.2L Turbo",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Rainier",
        "kind": "suv",
        "trims": [
          {
            "label": "CXL — 4.2L I6 (2005–2007)",
            "maxTow": 6200,
            "payload": 1150,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "CXL — 5.3L V8 (2005–2007)",
            "maxTow": 6800,
            "payload": 1200,
            "gcwr": 11500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Rendezvous",
        "kind": "suv",
        "trims": [
          {
            "label": "CX — 3.4L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "CXL — 3.4L / 3.6L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Ultra — 3.6L V6 (2005–2006)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Cadillac",
    "models": [
      {
        "name": "Escalade",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 6.2L V8",
            "maxTow": 7900,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8",
            "maxTow": 8200,
            "payload": 1550,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 6.2L V8",
            "maxTow": 8200,
            "payload": 1500,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 3.0L Duramax Diesel",
            "maxTow": 8000,
            "payload": 1480,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2015–2020)",
            "maxTow": 8300,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2015–2020)",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015–2020)",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2021)",
            "maxTow": 8000,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2021)",
            "maxTow": 8000,
            "payload": 1650,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.0L V8 (2005–2006)",
            "maxTow": 7800,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2007–2014)",
            "maxTow": 8300,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2008–2014)",
            "maxTow": 8100,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 Hybrid (2009–2013)",
            "maxTow": 5800,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2015)",
            "maxTow": 8300,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 6.2L V8 (2015)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015)",
            "maxTow": 8100,
            "payload": 1450,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1500,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2018–2020)",
            "maxTow": 8300,
            "payload": 1450,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2018–2020)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2021 redesign)",
            "maxTow": 8200,
            "payload": 1600,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2021)",
            "maxTow": 8200,
            "payload": 1550,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 6.2L V8 (2021)",
            "maxTow": 8000,
            "payload": 1500,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Diesel — 3.0L Duramax (2021)",
            "maxTow": 8200,
            "payload": 1500,
            "gcwr": 11700,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2010–2014)",
            "maxTow": 8300,
            "payload": 1450,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2010–2014)",
            "maxTow": 8300,
            "payload": 1450,
            "gcwr": 11750,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 6.2L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1350,
            "gcwr": 11450,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 6.0L V8 (2010–2013)",
            "maxTow": 5600,
            "payload": 1300,
            "gcwr": 8900,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2015–2018 redesign)",
            "maxTow": 8300,
            "payload": 1500,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2015–2018)",
            "maxTow": 8300,
            "payload": 1500,
            "gcwr": 11800,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2015–2018)",
            "maxTow": 8100,
            "payload": 1450,
            "gcwr": 11550,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015–2018)",
            "maxTow": 8100,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Escalade ESV",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 6.2L V8",
            "maxTow": 7900,
            "payload": 1650,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Sport Platinum — 6.2L V8",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2015–2020)",
            "maxTow": 8100,
            "payload": 1650,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015–2020)",
            "maxTow": 7900,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2021)",
            "maxTow": 7900,
            "payload": 1750,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2021)",
            "maxTow": 7900,
            "payload": 1700,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.0L V8 (2005–2006)",
            "maxTow": 7600,
            "payload": 1500,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2007–2014)",
            "maxTow": 8000,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2008–2014)",
            "maxTow": 7800,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2015)",
            "maxTow": 8100,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 6.2L V8 (2015)",
            "maxTow": 8000,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015)",
            "maxTow": 7900,
            "payload": 1500,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2018–2020)",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 11650,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2018–2020)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2018–2020)",
            "maxTow": 7900,
            "payload": 1450,
            "gcwr": 11350,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2021)",
            "maxTow": 8000,
            "payload": 1600,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 11650,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2010–2014)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 6.2L V8 (2010–2014)",
            "maxTow": 7900,
            "payload": 1450,
            "gcwr": 11350,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2010–2014)",
            "maxTow": 7900,
            "payload": 1400,
            "gcwr": 11300,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2015–2018 redesign)",
            "maxTow": 8100,
            "payload": 1550,
            "gcwr": 11650,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 6.2L V8 (2015–2018)",
            "maxTow": 8100,
            "payload": 1500,
            "gcwr": 11600,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — 6.2L V8 (2015–2018)",
            "maxTow": 7900,
            "payload": 1450,
            "gcwr": 11350,
            "hitch": "Class IV"
          },
          {
            "label": "Platinum — 6.2L V8 (2015–2018)",
            "maxTow": 7900,
            "payload": 1400,
            "gcwr": 11300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Escalade EXT",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 6.0L V8 (2005–2006)",
            "maxTow": 7600,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2007–2013)",
            "maxTow": 7600,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 6.2L V8 (2010–2013 last)",
            "maxTow": 7600,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 6.2L V8 (2010–2013)",
            "maxTow": 7600,
            "payload": 1350,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Escalade IQ",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — Dual Motor EV",
            "maxTow": 8000,
            "payload": 1500,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Luxury — Dual Motor EV",
            "maxTow": 8000,
            "payload": 1450,
            "gcwr": 16450,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — Dual Motor EV",
            "maxTow": 8000,
            "payload": 1400,
            "gcwr": 16400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Lyriq",
        "kind": "suv",
        "trims": [
          {
            "label": "Tech — RWD",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "Luxury — RWD",
            "maxTow": 0,
            "payload": 1080,
            "gcwr": 5580,
            "hitch": "—"
          },
          {
            "label": "Sport — AWD",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Optiq",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — RWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Sport — AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "SRX",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 3.6L V6 (2015–2016)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Performance — 3.6L V6 (2015–2016)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2015–2016)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "V6 — 3.6L V6 (2005–2009)",
            "maxTow": 4250,
            "payload": 1200,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "V8 — 4.6L V8 (2005–2009)",
            "maxTow": 4250,
            "payload": 1250,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.0L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Performance — 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.0L V6 (2010–2011)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.0L V6 (2010–2011)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Performance — 2.8L Turbo (2010–2011)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.6L V6 (2012–2016 last)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2012–2016)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Performance — 3.6L V6 (2012–2016)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L V6 (2012–2016)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Vistiq",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — Dual Motor EV",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 11800,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — Dual Motor EV",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 11750,
            "hitch": "Class III"
          },
          {
            "label": "Sport — Dual Motor EV",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 11700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XT4",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1080,
            "gcwr": 10080,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 2.0L Turbo (2019–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 2.0L Turbo (2019–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.0L Turbo (2019–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XT5",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1180,
            "gcwr": 10180,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 10150,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2017–2019)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 3.6L V6 (2017–2019)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 2.0L Turbo (2020–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.0L Turbo (2020–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2018–2019)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 3.6L V6 (2018–2019)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 2.0L Turbo (2020–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6 (2020–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.6L V6 (2017–2018 intro)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2017–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 3.6L V6 (2017–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Platinum — 3.6L V6 (2017–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XT6",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxury — 2.0L Turbo",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6",
            "maxTow": 4000,
            "payload": 1350,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1600,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Premium Luxury — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1600,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1550,
            "gcwr": 8500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XT6 Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 3.6L V6",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 10900,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1200,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Sport AWD — 3.6L V6 (2020–2021)",
            "maxTow": 4000,
            "payload": 1200,
            "gcwr": 7200,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Lincoln",
    "models": [
      {
        "name": "Aviator",
        "kind": "suv",
        "trims": [
          {
            "label": "Premier — 3.0L Twin-Turbo",
            "maxTow": 5600,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 3.0L Twin-Turbo",
            "maxTow": 5600,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring Hybrid",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10500,
            "hitch": "Class III"
          },
          {
            "label": "Standard — 3.0L EcoBoost V6 (2020–2021)",
            "maxTow": 5600,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.0L EcoBoost (2020–2021)",
            "maxTow": 5600,
            "payload": 1550,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 4.6L V8 (2005)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Ultimate — 4.6L V8 (2005)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Standard — 3.0L Twin-Turbo (2020–2021)",
            "maxTow": 5600,
            "payload": 1400,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.0L Twin-Turbo (2020–2021)",
            "maxTow": 5600,
            "payload": 1350,
            "gcwr": 8950,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label — 3.0L (2020–2021)",
            "maxTow": 5600,
            "payload": 1300,
            "gcwr": 8900,
            "hitch": "Class IV"
          },
          {
            "label": "Grand Touring PHEV (2020–2021)",
            "maxTow": 5600,
            "payload": 1250,
            "gcwr": 8850,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Aviator Grand Touring",
        "kind": "suv",
        "trims": [
          {
            "label": "Grand Touring — PHEV",
            "maxTow": 5600,
            "payload": 1300,
            "gcwr": 13900,
            "hitch": "Class IV"
          },
          {
            "label": "Grand Touring PHEV (2020–2021)",
            "maxTow": 5600,
            "payload": 1250,
            "gcwr": 8850,
            "hitch": "Class IV"
          },
          {
            "label": "Grand Touring PHEV AWD (2020–2021)",
            "maxTow": 5600,
            "payload": 1250,
            "gcwr": 8850,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Corsair",
        "kind": "suv",
        "trims": [
          {
            "label": "Premier — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 9600,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1080,
            "gcwr": 9580,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — PHEV",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Standard — 2.0L EcoBoost (2020–2021)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Reserve — 2.3L EcoBoost (2020–2021)",
            "maxTow": 3000,
            "payload": 1250,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Standard — 2.0L (2020–2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Reserve — 2.0L / 2.3L (2020–2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring PHEV (2021)",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 6200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "MKC",
        "kind": "suv",
        "trims": [
          {
            "label": "Premiere — 2.0L EcoBoost (2015–2019)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Select — 2.0L EcoBoost (2015–2019)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Reserve — 2.3L EcoBoost (2015–2019)",
            "maxTow": 3000,
            "payload": 1250,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Premiere — 2.0L (2018–2019)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Select — 2.0L (2018–2019)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Reserve — 2.3L (2018–2019)",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Black Label — 2.3L (2018–2019)",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Premiere — 2.0L (2015–2018 intro)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "Select — 2.0L (2015–2018)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "Reserve — 2.3L (2015–2018)",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 6050,
            "hitch": "Class II"
          },
          {
            "label": "Black Label — 2.3L (2015–2018)",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "MKT",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.7L V6 (2010–2012)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "EcoBoost — 3.5L EcoBoost V6 (2010–2015)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L V6 (2013–2015)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Premiere — 3.7L (2018–2019 last)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2018–2019)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Livery — 3.7L (2018–2019)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L (2010–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "EcoBoost — 3.5L TT (2010–2018)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          },
          {
            "label": "Livery — 3.7L (2010–2018)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2013–2018)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "MKX",
        "kind": "suv",
        "trims": [
          {
            "label": "Premiere — 3.7L V6 (2015–2018)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Select — 3.7L V6 (2015–2018)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.7L EcoBoost V6 (2015–2018)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2007–2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L V6 (2011–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Premiere — 3.7L (2018 last)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Select — 3.7L (2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.7L EcoBoost (2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Black Label — 2.7L (2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L / 3.7L (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.7L EcoBoost / 3.7L (2016–2018 redesign)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.7L EcoBoost (2016–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "Black Label — 2.7L (2016–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Nautilus",
        "kind": "suv",
        "trims": [
          {
            "label": "Premier — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1180,
            "gcwr": 10180,
            "hitch": "Class III"
          },
          {
            "label": "Black Label — 2.0L Turbo Hybrid",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 10150,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.0L EcoBoost (2019–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.7L EcoBoost V6 (2019–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "Standard — 2.0L (2019–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Reserve — 2.0L / 2.7L (2019–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Black Label — 2.7L (2019–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Navigator",
        "kind": "suv",
        "trims": [
          {
            "label": "Premier — 3.5L EcoBoost",
            "maxTow": 6200,
            "payload": 1650,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.5L EcoBoost Max Tow",
            "maxTow": 8700,
            "payload": 1750,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label — 3.5L EcoBoost",
            "maxTow": 8700,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Select — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2015–2017)",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Standard — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8700,
            "payload": 1800,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8700,
            "payload": 1750,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8700,
            "payload": 1700,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.4L V8 (2005–2006)",
            "maxTow": 8600,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Ultimate — 5.4L V8 (2005–2006)",
            "maxTow": 8600,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.4L V8 (2007–2014)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "L — 5.4L V8 (2007–2014)",
            "maxTow": 9000,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L EcoBoost V6 (2015)",
            "maxTow": 8700,
            "payload": 1600,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.5L EcoBoost V6 (2015)",
            "maxTow": 8700,
            "payload": 1650,
            "gcwr": 15500,
            "hitch": "Class IV"
          },
          {
            "label": "L Reserve — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 12150,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.4L V8 (2010–2014)",
            "maxTow": 9000,
            "payload": 1550,
            "gcwr": 12550,
            "hitch": "Class IV"
          },
          {
            "label": "L — 5.4L V8 (2010–2014)",
            "maxTow": 8700,
            "payload": 1650,
            "gcwr": 12350,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L EcoBoost (2015–2017)",
            "maxTow": 8700,
            "payload": 1600,
            "gcwr": 12300,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.5L EcoBoost (2015–2017)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "Select — 3.5L EcoBoost (2018 redesign)",
            "maxTow": 8700,
            "payload": 1600,
            "gcwr": 12300,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2018)",
            "maxTow": 8700,
            "payload": 1550,
            "gcwr": 12250,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label — 3.5L EcoBoost (2018)",
            "maxTow": 8700,
            "payload": 1500,
            "gcwr": 12200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Navigator L",
        "kind": "suv",
        "trims": [
          {
            "label": "Reserve — 3.5L EcoBoost Max Tow",
            "maxTow": 8300,
            "payload": 1750,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label — 3.5L EcoBoost",
            "maxTow": 8300,
            "payload": 1650,
            "gcwr": 14800,
            "hitch": "Class IV"
          },
          {
            "label": "Select — 3.5L EcoBoost (2015–2017)",
            "maxTow": 8700,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8500,
            "payload": 1850,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve L — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 12150,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label L — 3.5L EcoBoost (2018–2021)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 12100,
            "hitch": "Class IV"
          },
          {
            "label": "L — 5.4L V8 (2010–2014)",
            "maxTow": 8700,
            "payload": 1650,
            "gcwr": 12350,
            "hitch": "Class IV"
          },
          {
            "label": "L — 3.5L EcoBoost (2015–2017)",
            "maxTow": 8500,
            "payload": 1700,
            "gcwr": 12200,
            "hitch": "Class IV"
          },
          {
            "label": "Reserve L — 3.5L EcoBoost (2018 redesign)",
            "maxTow": 8500,
            "payload": 1650,
            "gcwr": 12150,
            "hitch": "Class IV"
          },
          {
            "label": "Black Label L — 3.5L EcoBoost (2018)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 12100,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Dodge",
    "models": [
      {
        "name": "Durango",
        "kind": "suv",
        "trims": [
          {
            "label": "SXT — 3.6L V6",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 14600,
            "hitch": "Class IV"
          },
          {
            "label": "GT — 3.6L V6",
            "maxTow": 6200,
            "payload": 1380,
            "gcwr": 14580,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 5.7L V8",
            "maxTow": 7400,
            "payload": 1450,
            "gcwr": 15850,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 5.7L V8",
            "maxTow": 8700,
            "payload": 1500,
            "gcwr": 17200,
            "hitch": "Class IV"
          },
          {
            "label": "SRT Hellcat — 6.2L Supercharged",
            "maxTow": 8700,
            "payload": 1400,
            "gcwr": 17100,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "GT — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 3.6L V6 (2015–2021)",
            "maxTow": 6200,
            "payload": 1550,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 5.7L HEMI V8 (2015–2021)",
            "maxTow": 7400,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SRT — 6.4L V8 (2018–2021)",
            "maxTow": 8700,
            "payload": 1400,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "SRT Hellcat — 6.2L Supercharged (2021)",
            "maxTow": 8700,
            "payload": 1350,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "ST — 3.7L V6 (2005–2009)",
            "maxTow": 3850,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SLT — 4.7L V8 (2005–2009)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI V8 (2005–2009)",
            "maxTow": 8950,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 5.7L HEMI Hybrid (2009)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 6200,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Crew — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 5.7L HEMI V8 (2011–2015)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 5.7L HEMI V8 (2011–2015)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L / 5.7L (2011–2015)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.6L V6 (2018–2021)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "GT — 3.6L V6 (2018–2021)",
            "maxTow": 6200,
            "payload": 1350,
            "gcwr": 9550,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 3.6L V6 (2018–2021)",
            "maxTow": 6200,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 5.7L HEMI (2018–2021)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 5.7L HEMI (2018–2021)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "SRT 392 — 6.4L V8 (2018–2021)",
            "maxTow": 8700,
            "payload": 1250,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Express — 3.6L V6 (2011–2013 return)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Crew — 3.6L V6 (2011–2013)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Citadel — 5.7L HEMI (2011–2018)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 5.7L HEMI (2011–2018)",
            "maxTow": 7400,
            "payload": 1400,
            "gcwr": 10800,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.6L V6 (2014–2018)",
            "maxTow": 6200,
            "payload": 1400,
            "gcwr": 9600,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.6L V6 (2014–2018)",
            "maxTow": 6200,
            "payload": 1350,
            "gcwr": 9550,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.7L HEMI (2014–2018)",
            "maxTow": 7400,
            "payload": 1350,
            "gcwr": 10750,
            "hitch": "Class IV"
          },
          {
            "label": "GT — 3.6L V6 (2017–2018)",
            "maxTow": 6200,
            "payload": 1350,
            "gcwr": 9550,
            "hitch": "Class IV"
          },
          {
            "label": "SRT — 6.4L V8 (2018)",
            "maxTow": 8700,
            "payload": 1250,
            "gcwr": 11950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Hornet",
        "kind": "suv",
        "trims": [
          {
            "label": "GT — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "R/T — 1.3L Turbo Hybrid",
            "maxTow": 2000,
            "payload": 980,
            "gcwr": 7480,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Journey",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.4L I4 (2015–2020)",
            "maxTow": 1000,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SXT — 3.6L V6 (2015–2020)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Crossroad — 3.6L V6 (2015–2020)",
            "maxTow": 2500,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "GT — 3.6L V6 (2015–2020)",
            "maxTow": 2500,
            "payload": 1350,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L I4 (2009–2010)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SXT — 3.5L V6 (2009–2010)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "R/T — 3.5L V6 (2009–2010)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.4L I4 (2011–2015)",
            "maxTow": 1000,
            "payload": 1150,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "SXT — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 2500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Crew — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "R/T — 3.6L Pentastar V6 (2011–2015)",
            "maxTow": 2500,
            "payload": 1150,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Crossroad — 3.6L Pentastar V6 (2015)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L (2018–2020)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "Crossroad — 3.6L V6 (2018–2020)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "GT — 3.6L V6 (2018–2020)",
            "maxTow": 2500,
            "payload": 1150,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "SE Value — 2.4L (2020 last)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L (2010–2018)",
            "maxTow": 1000,
            "payload": 1100,
            "gcwr": 4100,
            "hitch": "Class II"
          },
          {
            "label": "Mainstreet — 2.4L / 3.5L (2010–2011)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "Crew — 3.5L V6 (2010–2011)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "SXT — 3.6L V6 (2011–2018)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "Crew — 3.6L V6 (2012–2014)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.6L V6 (2011–2016)",
            "maxTow": 2500,
            "payload": 1150,
            "gcwr": 5650,
            "hitch": "Class II"
          },
          {
            "label": "Crossroad — 3.6L V6 (2015–2018)",
            "maxTow": 2500,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "Class II"
          },
          {
            "label": "GT — 3.6L V6 (2015–2018)",
            "maxTow": 2500,
            "payload": 1150,
            "gcwr": 5650,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Nitro",
        "kind": "suv",
        "trims": [
          {
            "label": "SXT — 3.7L V6 (2007–2011)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "SLT — 4.0L V6 (2007–2011)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "R/T — 4.0L V6 (2007–2011)",
            "maxTow": 5000,
            "payload": 1050,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "Detonator — 4.0L V6 (2010–2011)",
            "maxTow": 5000,
            "payload": 1050,
            "gcwr": 9000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.7L V6 (2010–2011 last)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8100,
            "hitch": "Class IV"
          },
          {
            "label": "SXT — 3.7L / 4.0L (2010–2011)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8100,
            "hitch": "Class IV"
          },
          {
            "label": "Shock — 4.0L V6 (2010–2011)",
            "maxTow": 5000,
            "payload": 1050,
            "gcwr": 8050,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Dakota",
        "kind": "truck",
        "trims": [
          {
            "label": "ST — 3.7L V6 (2010–2011)",
            "maxTow": 3100,
            "payload": 1300,
            "gcwr": 6400,
            "hitch": "Class II"
          },
          {
            "label": "SXT — 3.7L V6 (2010–2011)",
            "maxTow": 3100,
            "payload": 1300,
            "gcwr": 6400,
            "hitch": "Class II"
          },
          {
            "label": "SLT — 4.7L V8 (2010–2011)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 10650,
            "hitch": "Class IV"
          },
          {
            "label": "Laramie — 4.7L V8 (2010–2011)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Hyundai",
    "models": [
      {
        "name": "Ioniq 5",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — RWD",
            "maxTow": 2300,
            "payload": 1000,
            "gcwr": 8800,
            "hitch": "Class III"
          },
          {
            "label": "SEL — AWD",
            "maxTow": 2300,
            "payload": 980,
            "gcwr": 8780,
            "hitch": "Class III"
          },
          {
            "label": "Limited — AWD",
            "maxTow": 2300,
            "payload": 960,
            "gcwr": 8760,
            "hitch": "Class III"
          },
          {
            "label": "N — Dual Motor",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Ioniq 9",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — RWD",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "SEL — AWD",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 11850,
            "hitch": "Class III"
          },
          {
            "label": "Limited — AWD",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 11800,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — AWD",
            "maxTow": 5000,
            "payload": 1280,
            "gcwr": 11780,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Kona",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.0L",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "SEL — 1.6L Turbo",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "N Line — 1.6L Turbo",
            "maxTow": 0,
            "payload": 920,
            "gcwr": 5420,
            "hitch": "—"
          },
          {
            "label": "Limited — 1.6L Turbo",
            "maxTow": 0,
            "payload": 930,
            "gcwr": 5430,
            "hitch": "—"
          },
          {
            "label": "SE — 2.0L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 2.0L I4 (2018–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Limited — 1.6L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SE — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Ultimate — 1.6L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SE — 2.0L (2018 intro)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 2.0L (2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "Limited — 1.6L Turbo (2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "Ultimate — 1.6L Turbo (2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Kona Electric",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — Electric",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "SEL — Electric",
            "maxTow": 0,
            "payload": 890,
            "gcwr": 5390,
            "hitch": "—"
          },
          {
            "label": "Limited — Electric",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          },
          {
            "label": "SEL Electric (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Limited Electric (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Ultimate Electric (2019–2021)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Palisade",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 3.8L V6",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.8L V6",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — 3.8L V6",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SEL — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Calligraphy — 3.8L V6 (2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Palisade Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "SEL — Hybrid",
            "maxTow": 4000,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 4000,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — Hybrid",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 10900,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Santa Fe",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.5L",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 2.5L Turbo",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — Hybrid",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Sport 2.0T (2015–2018)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "GLS — 3.3L V6 (2015–2018)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SEL — 2.4L I4 (2019–2020)",
            "maxTow": 2000,
            "payload": 1450,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0L Turbo (2019–2020)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 2.5L I4 (2021)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L Turbo (2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — 2.5L Turbo (2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "GLS — 2.7L V6 (2005–2006)",
            "maxTow": 2800,
            "payload": 1100,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 3.5L V6 (2005–2006)",
            "maxTow": 2800,
            "payload": 1050,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "GLS — 2.7L V6 (2007–2009)",
            "maxTow": 2800,
            "payload": 1150,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.3L V6 (2007–2009)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "GLS — 2.4L I4 (2010–2012)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 3.5L V6 (2010–2012)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2012)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport 2.0T — 2.0L Turbo (2013–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Sport 2.4 — 2.4L I4 (2013–2015)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.3L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "GLS — 3.3L V6 (2013–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 2.4L (2018)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L / 2.0T (2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.0T (2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.4L (2019–2020 redesign)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L (2019–2020)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0T (2019–2020)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 5250,
            "hitch": "Class II"
          },
          {
            "label": "Calligraphy — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "GLS — 2.4L / 3.5L (2010–2012)",
            "maxTow": 2800,
            "payload": 1300,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "GLS — 3.3L V6 (2013–2018 redesign 3-row)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 3.3L V6 (2013–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Limited Ultimate — 3.3L (2015–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "SE Ultimate — 3.3L (2017–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Santa Fe Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "SEL — Hybrid",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class II"
          },
          {
            "label": "XRT — Hybrid",
            "maxTow": 2000,
            "payload": 1380,
            "gcwr": 7880,
            "hitch": "Class II"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class II"
          },
          {
            "label": "Calligraphy — Hybrid",
            "maxTow": 2000,
            "payload": 1320,
            "gcwr": 7820,
            "hitch": "Class II"
          },
          {
            "label": "SEL Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1550,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Limited Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Blue Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Santa Fe Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "2.4 — 2.4L I4 (2013–2015)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "2.0T — 2.0L Turbo (2013–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Ultimate — 2.0L Turbo (2013–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "2.4L (2018 last year)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "2.0T (2018 last year)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Ultimate 2.0T (2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "2.4L (2013–2018)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "2.0T (2013–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Ultimate 2.0T (2015–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Santa Fe XRT",
        "kind": "suv",
        "trims": [
          {
            "label": "XRT — 2.5L Turbo",
            "maxTow": 4500,
            "payload": 1450,
            "gcwr": 11450,
            "hitch": "Class III"
          },
          {
            "label": "Calligraphy — 2.5L Turbo",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 11400,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Tucson",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.5L",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SEL — Hybrid",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L I4 (2016–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L I4 (2016–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 1.6L Turbo (2016–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Ultimate — 1.6L Turbo (2019–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "GL — 2.0L I4 (2005–2009)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "GLS — 2.7L V6 (2005–2009)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.7L V6 (2005–2009)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "GLS — 2.0L / 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Limited — 2.4L I4 (2010–2015)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "SE — 2.0L (2018–2020)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L / 2.4L (2018–2020)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 1.6L Turbo / 2.4L (2018–2020)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.5L (2021 redesign)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "N Line — 2.5L Turbo (2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "GL — 2.0L (2010–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "GLS — 2.4L (2010–2015)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.4L (2010–2015)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L (2016–2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Eco — 1.6L Turbo (2016–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Sport / Limited — 1.6T (2016–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "Value / SEL — 2.0L (2016–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Tucson Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "Blue — Hybrid",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class II"
          },
          {
            "label": "SEL — Hybrid",
            "maxTow": 2000,
            "payload": 1080,
            "gcwr": 7580,
            "hitch": "Class II"
          },
          {
            "label": "Limited — Hybrid",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Venue",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 1.6L",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 5350,
            "hitch": "—"
          },
          {
            "label": "SEL — 1.6L",
            "maxTow": 0,
            "payload": 840,
            "gcwr": 5340,
            "hitch": "—"
          },
          {
            "label": "Limited — 1.6L",
            "maxTow": 0,
            "payload": 830,
            "gcwr": 5330,
            "hitch": "—"
          },
          {
            "label": "SE — 1.6L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 1.6L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3800,
            "hitch": "N/A"
          },
          {
            "label": "SE — 1.6L (2020–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 1.6L (2020–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Denim — 1.6L (2020–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Veracruz",
        "kind": "suv",
        "trims": [
          {
            "label": "GLS — 3.8L V6 (2007–2012)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.8L V6 (2007–2012)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "GLS — 3.8L V6 (2010–2012 last)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.8L V6 (2010–2012)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 6850,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Kia",
    "models": [
      {
        "name": "Borrego",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 3.8L V6 (2009–2011)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.8L V6 (2009–2011)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 4.6L V8 (2009–2011)",
            "maxTow": 7500,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "LX — 3.8L V6 (2010–2011 last)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.8L V6 (2010–2011)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 4.6L V8 (2010–2011)",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "EV6",
        "kind": "suv",
        "trims": [
          {
            "label": "Light — RWD",
            "maxTow": 2300,
            "payload": 1000,
            "gcwr": 8800,
            "hitch": "Class III"
          },
          {
            "label": "Wind — AWD",
            "maxTow": 2300,
            "payload": 980,
            "gcwr": 8780,
            "hitch": "Class III"
          },
          {
            "label": "GT-Line — AWD",
            "maxTow": 2300,
            "payload": 960,
            "gcwr": 8760,
            "hitch": "Class III"
          },
          {
            "label": "GT — Dual Motor",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EV9",
        "kind": "suv",
        "trims": [
          {
            "label": "Light — RWD",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "Wind — AWD",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 11850,
            "hitch": "Class III"
          },
          {
            "label": "Land — AWD",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 11800,
            "hitch": "Class III"
          },
          {
            "label": "GT-Line — AWD",
            "maxTow": 5000,
            "payload": 1280,
            "gcwr": 11780,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Niro",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — Hybrid",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "EX — Hybrid",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "SX Touring — Hybrid",
            "maxTow": 0,
            "payload": 920,
            "gcwr": 5420,
            "hitch": "—"
          },
          {
            "label": "LX Hybrid (2017–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX Hybrid (2017–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Touring Hybrid (2017–2021)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "FE Hybrid (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "LX Hybrid (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "EX Hybrid (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Touring Hybrid (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "EX PHEV (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "FE Hybrid (2017–2018 intro)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "LX Hybrid (2017–2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "EX Hybrid (2017–2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "Touring Hybrid (2017–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "EX PHEV (2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Niro EV",
        "kind": "suv",
        "trims": [
          {
            "label": "Wind — Electric",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "Wave — Electric",
            "maxTow": 0,
            "payload": 890,
            "gcwr": 5390,
            "hitch": "—"
          },
          {
            "label": "EX EV (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "EX Premium EV (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Seltos",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.0L",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "S — 2.0L",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "EX — 1.6L Turbo",
            "maxTow": 0,
            "payload": 930,
            "gcwr": 5430,
            "hitch": "—"
          },
          {
            "label": "X-Line — 1.6L Turbo",
            "maxTow": 0,
            "payload": 920,
            "gcwr": 5420,
            "hitch": "—"
          },
          {
            "label": "SX — 1.6L Turbo",
            "maxTow": 0,
            "payload": 910,
            "gcwr": 5410,
            "hitch": "—"
          },
          {
            "label": "LX — 2.0L I4 (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "S — 2.0L I4 (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "EX — 2.0L I4 (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "SX — 1.6L Turbo (2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "LX — 2.0L (2021 intro)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "S — 2.0L (2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "EX — 2.0L (2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SX Turbo — 1.6T (2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Sorento",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.5L",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.5L Turbo",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "X-Line — Hybrid",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L I4 (2016–2020)",
            "maxTow": 2000,
            "payload": 1450,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "EX — 3.3L V6 (2016–2020)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "SX — 3.3L V6 (2016–2020)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "LX — 2.5L I4 (2021)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.5L Turbo (2021)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SX — 2.5L Turbo (2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.5L V6 (2005–2009)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.5L V6 (2005–2009)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LX — 2.4L I4 (2011–2015)",
            "maxTow": 1650,
            "payload": 1250,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "EX — 3.5L / 3.3L V6 (2011–2015)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SX — 3.3L V6 (2011–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.3L V6 (2014–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "L — 2.4L (2018–2020)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L / 3.3L (2018–2020)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.3L V6 (2018–2020)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "SX — 3.3L V6 (2018–2020)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "LX — 2.5L (2021 redesign)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.5L (2021)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "SX Prestige — 2.5T (2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "LX — 2.4L / 3.5L (2010 last gen2)",
            "maxTow": 2800,
            "payload": 1300,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "EX — 3.5L V6 (2010)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "LX — 2.4L (2011–2015 redesign)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L / 3.5L (2011–2015)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 6850,
            "hitch": "Class III"
          },
          {
            "label": "SX — 3.5L V6 (2011–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "L — 2.4L (2016–2018 redesign)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L / 3.3L (2016–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.3L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "SX — 3.3L V6 (2016–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "SX Limited — 3.3L (2016–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Sorento Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "S — Hybrid",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 7900,
            "hitch": "Class II"
          },
          {
            "label": "EX — Hybrid",
            "maxTow": 2000,
            "payload": 1380,
            "gcwr": 7880,
            "hitch": "Class II"
          },
          {
            "label": "SX — Hybrid",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 7850,
            "hitch": "Class II"
          },
          {
            "label": "SX Prestige — Hybrid",
            "maxTow": 2000,
            "payload": 1320,
            "gcwr": 7820,
            "hitch": "Class II"
          },
          {
            "label": "S Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1550,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "EX Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1550,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SX Hybrid (2021)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 6500,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Sorento PHEV",
        "kind": "suv",
        "trims": [
          {
            "label": "SX Prestige — PHEV",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 7800,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Soul",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.0L",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "S — 2.0L",
            "maxTow": 0,
            "payload": 890,
            "gcwr": 5390,
            "hitch": "—"
          },
          {
            "label": "GT-Line — 2.0L",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          },
          {
            "label": "EX — 2.0L",
            "maxTow": 0,
            "payload": 885,
            "gcwr": 5385,
            "hitch": "—"
          },
          {
            "label": "LX — 2.0L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "GT-Line — 1.6L Turbo (2020–2021)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "X-Line — 2.0L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "LX — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "S — 2.0L (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "GT-Line — 1.6L Turbo (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "X-Line — 2.0L (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Base — 1.6L / 2.0L (2010–2013)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Plus / ! — 2.0L (2010–2013)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Base — 1.6L / 2.0L (2014–2018 redesign)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Plus — 2.0L (2014–2018)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "! — 1.6L Turbo (2014–2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          },
          {
            "label": "EV (2015–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Sportage",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 2.5L",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "X-Pro — 2.5L",
            "maxTow": 2500,
            "payload": 1150,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SX — 2.0L Turbo (2015–2021)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.0L I4 (2005–2010)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.7L V6 (2005–2010)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L I4 (2011–2015)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SX — 2.0L Turbo (2011–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SX Turbo — 2.0T (2018–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.4L (2020–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.0L / 2.4L (2010)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2010)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2011–2016 redesign)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2011–2016)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "SX — 2.0T (2011–2016)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5050,
            "hitch": "Class II"
          },
          {
            "label": "LX — 2.4L (2017–2018 redesign)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "EX — 2.4L (2017–2018)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "SX Turbo — 2.0T (2017–2018)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5050,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Sportage Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — Hybrid",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class II"
          },
          {
            "label": "EX — Hybrid",
            "maxTow": 2000,
            "payload": 1080,
            "gcwr": 7580,
            "hitch": "Class II"
          },
          {
            "label": "X-Line — Hybrid",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          },
          {
            "label": "SX Prestige — Hybrid",
            "maxTow": 2000,
            "payload": 1020,
            "gcwr": 7520,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Telluride",
        "kind": "suv",
        "trims": [
          {
            "label": "LX — 3.8L V6",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "EX — 3.8L V6",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SX Prestige — 3.8L V6",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "X-Pro — 3.8L V6",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "LX — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "EX — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SX — 3.8L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Telluride X-Pro",
        "kind": "suv",
        "trims": [
          {
            "label": "X-Pro — 3.8L V6",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 12050,
            "hitch": "Class III"
          },
          {
            "label": "X-Pro SX Prestige — 3.8L V6",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Subaru",
    "models": [
      {
        "name": "Ascent",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.4L Turbo",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 2.4L Turbo",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 2.4L Turbo",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.4L Turbo (2019–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Premium — 2.4L Turbo (2019–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 2.4L Turbo (2019–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Touring — 2.4L Turbo (2019–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Onyx Edition (2020–2021)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Crosstrek",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.0L / 2.5L",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.5L",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L",
            "maxTow": 1500,
            "payload": 970,
            "gcwr": 6970,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L",
            "maxTow": 1500,
            "payload": 960,
            "gcwr": 6960,
            "hitch": "Class II"
          },
          {
            "label": "Wilderness — 2.5L",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "2.0i Premium (2015–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "2.0i Limited (2015–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "2.0i Sport (2019–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid (2019–2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "Base — 2.0L (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.0L (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0L (2018–2021)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L (2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.0L (2013–2017 as XV Crosstrek)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.0L (2013–2017)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0L (2013–2017)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "Hybrid (2014–2016)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Base — 2.0L (2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.0L (2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.0L (2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Forester",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.5L",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Wilderness — 2.5L",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "2.5i Premium (2015–2018)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Limited (2015–2018)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Touring (2015–2018)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2019–2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "2.5X — 2.5L H4 (2005–2008)",
            "maxTow": 2400,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5XT — 2.5L Turbo (2005–2008)",
            "maxTow": 2400,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5X — 2.5L H4 (2009–2013)",
            "maxTow": 2400,
            "payload": 1100,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "2.5XT — 2.5L Turbo (2009–2013)",
            "maxTow": 2400,
            "payload": 1050,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "2.5i — 2.5L H4 (2014–2015)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "2.0XT — 2.0L Turbo (2014–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Base — 2.5L (2018 last gen4)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.5L (2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.5L (2019–2021 gen5)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4750,
            "hitch": "Class II"
          },
          {
            "label": "2.5X (2010–2013)",
            "maxTow": 2400,
            "payload": 1200,
            "gcwr": 5600,
            "hitch": "Class II"
          },
          {
            "label": "2.5X Premium (2010–2013)",
            "maxTow": 2400,
            "payload": 1200,
            "gcwr": 5600,
            "hitch": "Class II"
          },
          {
            "label": "2.5X Touring (2010–2013)",
            "maxTow": 2400,
            "payload": 1150,
            "gcwr": 5550,
            "hitch": "Class II"
          },
          {
            "label": "2.5XT (2010–2013)",
            "maxTow": 2400,
            "payload": 1150,
            "gcwr": 5550,
            "hitch": "Class II"
          },
          {
            "label": "2.5i (2014–2018 redesign)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4750,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Premium (2014–2018)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4750,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Limited (2014–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Touring (2014–2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4650,
            "hitch": "Class II"
          },
          {
            "label": "2.0XT Premium / Touring (2014–2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4650,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Forester Wilderness",
        "kind": "suv",
        "trims": [
          {
            "label": "Wilderness — 2.5L",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 9600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Outback",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.5L",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Wilderness — 2.4L Turbo",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Touring XT — 2.4L Turbo",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "2.5i Premium (2015–2019)",
            "maxTow": 2700,
            "payload": 1400,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Limited (2015–2019)",
            "maxTow": 2700,
            "payload": 1350,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "3.6R Limited (2015–2019)",
            "maxTow": 3000,
            "payload": 1400,
            "gcwr": 6800,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.5L (2020–2021)",
            "maxTow": 2700,
            "payload": 1500,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L (2020–2021)",
            "maxTow": 2700,
            "payload": 1450,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2020–2021)",
            "maxTow": 2700,
            "payload": 1450,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Onyx Edition XT — 2.4L Turbo (2020–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "2.5i — 2.5L H4 (2005–2009)",
            "maxTow": 2700,
            "payload": 1100,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "3.0R — 3.0L H6 (2005–2009)",
            "maxTow": 3000,
            "payload": 1150,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "XT — 2.5L Turbo (2005–2009)",
            "maxTow": 2700,
            "payload": 1050,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "2.5i — 2.5L H4 (2010–2014)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "3.6R — 3.6L H6 (2010–2014)",
            "maxTow": 3000,
            "payload": 1250,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "2.5i — 2.5L H4 (2015)",
            "maxTow": 2700,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "3.6R — 3.6L H6 (2015)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.5L (2018–2019)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Premium — 2.5L (2018–2019)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 2.5L / 3.6R (2018–2019)",
            "maxTow": 2700,
            "payload": 1250,
            "gcwr": 5950,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 3.6R (2018–2019)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 5900,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.5L (2020–2021 redesign)",
            "maxTow": 2700,
            "payload": 1350,
            "gcwr": 6050,
            "hitch": "Class II"
          },
          {
            "label": "Touring XT — 2.4L Turbo (2020–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Onyx Edition XT (2020–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "2.5i (2010–2014)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Premium (2010–2014)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Limited (2010–2014)",
            "maxTow": 2700,
            "payload": 1250,
            "gcwr": 5950,
            "hitch": "Class II"
          },
          {
            "label": "3.6R (2010–2014)",
            "maxTow": 3000,
            "payload": 1250,
            "gcwr": 6250,
            "hitch": "Class II"
          },
          {
            "label": "3.6R Limited (2010–2014)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "2.5i (2015–2018 redesign)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Premium (2015–2018)",
            "maxTow": 2700,
            "payload": 1300,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "2.5i Limited (2015–2018)",
            "maxTow": 2700,
            "payload": 1250,
            "gcwr": 5950,
            "hitch": "Class II"
          },
          {
            "label": "3.6R Limited (2015–2018)",
            "maxTow": 3000,
            "payload": 1250,
            "gcwr": 6250,
            "hitch": "Class II"
          },
          {
            "label": "3.6R Touring (2015–2018)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Outback Wilderness",
        "kind": "suv",
        "trims": [
          {
            "label": "Wilderness — 2.4L Turbo",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Solterra",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — Dual Motor AWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Limited — Dual Motor AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Touring — Dual Motor AWD",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Tribeca",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.0L H6 (2006–2007)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.0L H6 (2006–2007)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.6L H6 (2008–2014)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.6L H6 (2008–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.6L (2010–2014 last)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.6L (2010–2014)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.6L (2010–2014)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Mazda",
    "models": [
      {
        "name": "CX-3",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 2.0L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Touring — 2.0L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Grand Touring — 2.0L I4 (2016–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Touring — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Grand Touring — 2.0L (2018–2021)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 2.0L (2016–2018 intro)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "Touring — 2.0L (2016–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "Grand Touring — 2.0L (2016–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "CX-30",
        "kind": "suv",
        "trims": [
          {
            "label": "2.5 S — 2.5L",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "2.5 S Select — 2.5L",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "2.5 Turbo — 2.5L Turbo",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          },
          {
            "label": "Select — 2.5L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "Preferred — 2.5L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "Premium — 2.5L I4 (2020–2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "Turbo — 2.5L Turbo (2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "Base — 2.5L (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Select — 2.5L (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Preferred — 2.5L (2020–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Premium — 2.5L (2020–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Turbo (2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "CX-5",
        "kind": "suv",
        "trims": [
          {
            "label": "2.5 S — 2.5L",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class II"
          },
          {
            "label": "2.5 S Preferred — 2.5L",
            "maxTow": 2000,
            "payload": 1080,
            "gcwr": 7580,
            "hitch": "Class II"
          },
          {
            "label": "2.5 Turbo — 2.5L Turbo",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          },
          {
            "label": "Carbon Turbo — 2.5L Turbo",
            "maxTow": 2000,
            "payload": 1020,
            "gcwr": 7520,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1300,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.5L I4 (2015–2021)",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Signature — 2.5L Turbo (2019–2021)",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.5L I4 (2013–2015)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L I4 (2013–2015)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.5L I4 (2013–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.5L (2018–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Carbon Edition (2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.0L / 2.5L (2013–2016 intro)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2013–2016)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.5L (2013–2016)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5050,
            "hitch": "Class II"
          },
          {
            "label": "Sport — 2.5L (2017–2018 redesign)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.5L (2017–2018)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.5L (2017–2018)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5050,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "CX-50",
        "kind": "suv",
        "trims": [
          {
            "label": "Select — 2.5L",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Meridian — 2.5L Turbo",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 7500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "CX-7",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 2.3L Turbo (2007–2009)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Touring — 2.3L Turbo (2007–2009)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Grand Touring — 2.3L Turbo (2007–2009)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "i Sport — 2.5L I4 (2010–2012)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "s Touring — 2.3L Turbo (2010–2012)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "s Grand Touring — 2.3L Turbo (2010–2012)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "i SV — 2.5L (2010–2012 last)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "CX-70",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 3.3L Turbo",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Turbo S Premium",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "CX-70 PHEV",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred Plus PHEV",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus PHEV",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 10150,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "CX-9",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — 2.5T",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 2.5T",
            "maxTow": 3500,
            "payload": 1280,
            "gcwr": 10280,
            "hitch": "Class III"
          },
          {
            "label": "Carbon Edition — 2.5T",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 10250,
            "hitch": "Class III"
          },
          {
            "label": "Signature — 2.5T",
            "maxTow": 3500,
            "payload": 1220,
            "gcwr": 10220,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.5L Turbo (2016–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 2.5L Turbo (2016–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — 2.5L Turbo (2016–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Signature — 2.5L Turbo (2016–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.5L / 3.7L V6 (2007–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.5L / 3.7L V6 (2007–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — 3.5L / 3.7L V6 (2007–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.5L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 2.5L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — 2.5L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Signature — 2.5L Turbo (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Carbon Edition (2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 3.7L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.7L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — 3.7L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Sport — 2.5L Turbo (2016–2018 redesign)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 2.5L Turbo (2016–2018)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Grand Touring — 2.5L Turbo (2016–2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "Signature — 2.5L Turbo (2016–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "CX-90",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred — 3.3L Turbo",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 3.3L Turbo",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Turbo S — 3.3L",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "PHEV Premium",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "CX-90 PHEV",
        "kind": "suv",
        "trims": [
          {
            "label": "Preferred Plus PHEV",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus PHEV",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 10250,
            "hitch": "Class III"
          },
          {
            "label": "Turbo S Premium Plus PHEV",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Tribute",
        "kind": "suv",
        "trims": [
          {
            "label": "i — 2.3L I4 (2005–2006)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "s — 3.0L V6 (2005–2006)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "i — 2.5L I4 (2008–2011)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "s — 3.0L V6 (2008–2011)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.5L Hybrid (2008–2010)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "i Sport — 2.5L (2010–2011 last)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "s Touring — 3.0L V6 (2010–2011)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid (2010–2011)",
            "maxTow": 1000,
            "payload": 1050,
            "gcwr": 4050,
            "hitch": "Class II"
          }
        ]
      }
    ]
  },
  {
    "name": "Volkswagen",
    "models": [
      {
        "name": "Atlas",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.0L Turbo",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 2.0L Turbo",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "SEL Premium R-Line — 2.0L Turbo",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "S — 2.0L Turbo (2018–2021)",
            "maxTow": 2000,
            "payload": 1600,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1700,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SEL — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SEL Premium — 3.6L V6 (2018–2021)",
            "maxTow": 5000,
            "payload": 1650,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 2.0T / 3.6L (2018–2021)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T / 3.6L (2018–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 8550,
            "hitch": "Class IV"
          },
          {
            "label": "Cross Sport SE (2020–2021)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 2.0T / 3.6L (2018 intro)",
            "maxTow": 2000,
            "payload": 1500,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T / 3.6L (2018)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 8550,
            "hitch": "Class IV"
          },
          {
            "label": "SEL — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 8500,
            "hitch": "Class IV"
          },
          {
            "label": "SEL Premium — 3.6L V6 (2018)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Atlas Cross Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.0L Turbo",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 9800,
            "hitch": "Class III"
          },
          {
            "label": "SEL R-Line — 2.0L Turbo",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 9800,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L Turbo (2020–2021)",
            "maxTow": 2000,
            "payload": 1550,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 3.6L V6 (2020–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 2.0T / 3.6L (2020–2021)",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 8450,
            "hitch": "Class IV"
          },
          {
            "label": "SEL R-Line — 3.6L (2020–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "SEL Premium R-Line (2020–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Atlas Cross Sport Peak Edition",
        "kind": "suv",
        "trims": [
          {
            "label": "Peak Edition — 2.0T",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Golf Alltrack",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.8L Turbo (2017–2019)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.8L Turbo (2017–2019)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.8L Turbo (2017–2019)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "S — 1.8T (2018–2019 last)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.8T (2018–2019)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.8T (2018–2019)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "S — 1.8T (2017–2018 intro)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.8T (2017–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.8T (2017–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "ID. Buzz",
        "kind": "suv",
        "trims": [
          {
            "label": "Pro S — RWD",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "Pro S Plus — AWD",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "ID.4",
        "kind": "suv",
        "trims": [
          {
            "label": "Standard — RWD",
            "maxTow": 2200,
            "payload": 1000,
            "gcwr": 8700,
            "hitch": "Class III"
          },
          {
            "label": "Pro — RWD",
            "maxTow": 2700,
            "payload": 1050,
            "gcwr": 9250,
            "hitch": "Class III"
          },
          {
            "label": "Pro S — AWD",
            "maxTow": 2700,
            "payload": 1000,
            "gcwr": 9200,
            "hitch": "Class III"
          },
          {
            "label": "AWD Pro S Plus",
            "maxTow": 2700,
            "payload": 980,
            "gcwr": 9180,
            "hitch": "Class III"
          },
          {
            "label": "Pro RWD (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Pro S RWD (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "1st Edition AWD (2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Pro (2021 intro)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Pro S (2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "1st Edition (2021)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Routan",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 3.8L / 4.0L V6 (2009–2012)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 4.0L V6 (2009–2012)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 4.0L V6 (2009–2012)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.6L Pentastar V6 (2012–2014)",
            "maxTow": 3600,
            "payload": 1450,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "SEL — 3.6L Pentastar V6 (2012–2014)",
            "maxTow": 3600,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "S — 3.8L / 4.0L (2010–2012)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "SE — 4.0L (2010–2012)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 4.0L (2010–2012)",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 5350,
            "hitch": "Class II"
          },
          {
            "label": "SE — 3.6L V6 (2011–2014 last)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 5400,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 3.6L V6 (2011–2014)",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 5350,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Taos",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 1.5T",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "SE — 1.5T",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "SEL — 1.5T",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          },
          {
            "label": "S — 1.5L Turbo (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "SE — 1.5L Turbo (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 1.5L Turbo (2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "S — 1.5T (2021 intro)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SE — 1.5T (2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 1.5T (2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Tiguan",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 2.0T",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "SEL R-Line — 2.0T",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0L Turbo (2015–2017)",
            "maxTow": 2200,
            "payload": 1200,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L Turbo (2015–2017)",
            "maxTow": 2200,
            "payload": 1200,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1350,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0L Turbo (2009–2011)",
            "maxTow": 2200,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L Turbo (2009–2011)",
            "maxTow": 2200,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L Turbo (2009–2011)",
            "maxTow": 2200,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0L Turbo (2012–2015)",
            "maxTow": 2200,
            "payload": 1150,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L Turbo (2012–2015)",
            "maxTow": 2200,
            "payload": 1100,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0L Turbo (2012–2015)",
            "maxTow": 2200,
            "payload": 1050,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0T (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0T (2018–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL Premium — 2.0T (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE R-Line Black (2020–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0T (2010–2017)",
            "maxTow": 2200,
            "payload": 1100,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T (2010–2017)",
            "maxTow": 2200,
            "payload": 1100,
            "gcwr": 5300,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0T (2010–2017)",
            "maxTow": 2200,
            "payload": 1050,
            "gcwr": 5250,
            "hitch": "Class II"
          },
          {
            "label": "S — 2.0T (2018 redesign)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0T (2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.0T (2018)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4650,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Touareg",
        "kind": "suv",
        "trims": [
          {
            "label": "V6 Sport — 3.6L V6 (2015–2017)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "V6 Executive (2015–2017)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "V6 — 3.2L V6 (2005–2007)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "V8 — 4.2L V8 (2005–2007)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "V10 TDI — 5.0L Diesel (2005–2006)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "VR6 — 3.6L V6 (2008–2010)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "V6 TDI — 3.0L Diesel (2009–2010)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 3.6L V6 (2011–2015)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "TDI — 3.0L Diesel (2011–2015)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Executive — 3.6L V6 (2011–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "VR6 — 3.6L (2010–2017)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "TDI Clean Diesel (2010–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid (2011–2015)",
            "maxTow": 7716,
            "payload": 1300,
            "gcwr": 11016,
            "hitch": "Class IV"
          },
          {
            "label": "Executive / Sport (2010–2017)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 11066,
            "hitch": "Class IV"
          },
          {
            "label": "Wolfsburg Edition (2017)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 11066,
            "hitch": "Class IV"
          },
          {
            "label": "V6 Executive (2010–2017)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 11066,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "BMW",
    "models": [
      {
        "name": "iX",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive50 — Dual Motor",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          },
          {
            "label": "M60 — Dual Motor",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 5650,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "iX1",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive30 — Dual Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "X1",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive28i — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class II"
          },
          {
            "label": "M35i xDrive — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          },
          {
            "label": "xDrive28i (2016–2021)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "M35i (2020–2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "sDrive28i — 2.0L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "xDrive28i — 2.0L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "xDrive35i — 3.0L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "sDrive28i (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "xDrive28i (2018–2021)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "xDrive25i (2018–2019)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "sDrive28i (2013–2015 US intro)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "xDrive28i (2013–2015)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "xDrive35i (2013–2015)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "sDrive28i (2016–2018 redesign)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "xDrive28i (2016–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "X2",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive28i — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          },
          {
            "label": "M35i xDrive — 2.0L Turbo",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "sDrive28i (2018–2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "xDrive28i (2018–2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "M35i (2019–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "sDrive28i (2018 intro)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "xDrive28i (2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "M35i (2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "X3",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive30i",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "M40i",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "xDrive28i (2015–2017)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "xDrive35i (2015–2017)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "xDrive30i (2018–2021)",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "M40i (2018–2021)",
            "maxTow": 4400,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "2.5i / 3.0i — I6 (2005–2010)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "xDrive28i — 2.0L Turbo / 3.0L (2011–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "xDrive35i — 3.0L Turbo (2011–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "sDrive30i (2018–2021)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "xDrive30e PHEV (2020–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "xDrive30i (2010 last E83)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "xDrive28i (2011–2017 F25)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "xDrive35i (2011–2017)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "xDrive28d Diesel (2015–2017)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "xDrive30i (2018 redesign G01)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "M40i (2018)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "X3 M",
        "kind": "suv",
        "trims": [
          {
            "label": "X3 M — Twin-Turbo I6",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "X3 M Competition",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          },
          {
            "label": "X3 M (2020–2021)",
            "maxTow": 4400,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "X3 M Competition (2020–2021)",
            "maxTow": 4400,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "X4",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive30i — 2.0L Turbo",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 11100,
            "hitch": "Class III"
          },
          {
            "label": "M40i — 3.0L Turbo",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 11050,
            "hitch": "Class III"
          },
          {
            "label": "M Competition",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "xDrive28i (2015–2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 7000,
            "hitch": "Class III"
          },
          {
            "label": "M40i (2016–2021)",
            "maxTow": 4400,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "xDrive30i (2019–2021)",
            "maxTow": 4400,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "xDrive30i (2018–2021)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "M40i (2018–2021)",
            "maxTow": 4400,
            "payload": 1050,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "X4 M (2020–2021)",
            "maxTow": 4400,
            "payload": 1000,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "xDrive28i (2015–2018 intro)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "xDrive35i (2015–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          },
          {
            "label": "M40i (2016–2018)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "X5",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive40i",
            "maxTow": 7201,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50e PHEV",
            "maxTow": 5952,
            "payload": 1300,
            "gcwr": 11500,
            "hitch": "Class III"
          },
          {
            "label": "M60i",
            "maxTow": 7201,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2015–2018)",
            "maxTow": 6000,
            "payload": 1500,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2015–2018)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40i (2019–2021)",
            "maxTow": 7200,
            "payload": 1600,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2019–2021)",
            "maxTow": 7200,
            "payload": 1550,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "M50i (2020–2021)",
            "maxTow": 7200,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "3.0i — 3.0L I6 (2005–2006)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "4.4i / 4.8i — V8 (2005–2006)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive30i — 3.0L I6 (2007–2010)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive48i — 4.8L V8 (2007–2010)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35d — 3.0L Diesel (2009–2013)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i — 3.0L Turbo (2011–2015)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i — 4.4L TwinTurbo V8 (2011–2015)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "M — 4.4L TwinTurbo V8 (2010–2013)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2018 last gen3)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2018)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 9250,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40i (2019–2021 gen4)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2019–2020)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive45e PHEV (2020–2021)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 5900,
            "hitch": "Class II"
          },
          {
            "label": "sDrive40i (2019–2021)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive30i (2010 last E70)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2011–2013)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive48i (2010–2010)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 9250,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2011–2013)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 9250,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35d Diesel (2010–2013)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "M (2010–2013 E70)",
            "maxTow": 6000,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          },
          {
            "label": "sDrive35i (2014–2018 F15)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2014–2018)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2014–2018)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 9250,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40e PHEV (2016–2018)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 5900,
            "hitch": "Class II"
          },
          {
            "label": "xDrive35d Diesel (2014–2018)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 9300,
            "hitch": "Class IV"
          },
          {
            "label": "M (2015–2018 F85)",
            "maxTow": 6000,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "X5 Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive50e — PHEV",
            "maxTow": 5952,
            "payload": 1400,
            "gcwr": 14352,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive45e (2020–2021)",
            "maxTow": 7200,
            "payload": 1550,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40e (2018)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 5900,
            "hitch": "Class II"
          },
          {
            "label": "xDrive40e (2016–2018)",
            "maxTow": 2700,
            "payload": 1200,
            "gcwr": 5900,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "X5 M",
        "kind": "suv",
        "trims": [
          {
            "label": "X5 M — Twin-Turbo V8",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 5800,
            "hitch": "—"
          },
          {
            "label": "X5 M Competition",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 5750,
            "hitch": "—"
          },
          {
            "label": "X5 M (2015–2018)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M (2020–2021)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M (2018 last F85)",
            "maxTow": 6000,
            "payload": 1100,
            "gcwr": 9200,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M (2020–2021 F95)",
            "maxTow": 7200,
            "payload": 1100,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M Competition (2020–2021)",
            "maxTow": 7200,
            "payload": 1050,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M (2010–2013 E70)",
            "maxTow": 6000,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          },
          {
            "label": "X5 M (2015–2018 F85)",
            "maxTow": 6000,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "X6",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive40i — 3.0L Turbo",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 15600,
            "hitch": "Class IV"
          },
          {
            "label": "M60i — Twin-Turbo V8",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 15550,
            "hitch": "Class IV"
          },
          {
            "label": "M Competition",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 5800,
            "hitch": "—"
          },
          {
            "label": "xDrive35i (2015–2019)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40i (2020–2021)",
            "maxTow": 7200,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "M50i (2020–2021)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i — 3.0L Turbo (2008–2014)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i — 4.4L TwinTurbo V8 (2008–2014)",
            "maxTow": 6000,
            "payload": 1250,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "M — 4.4L TwinTurbo V8 (2010–2014)",
            "maxTow": 6000,
            "payload": 1150,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i — 3.0L Turbo (2015)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i — 4.4L TwinTurbo V8 (2015)",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2018)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 9200,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40i (2019–2021)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "X6 M Competition (2020–2021)",
            "maxTow": 7200,
            "payload": 1100,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2010–2014 E71)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 9200,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2010–2014)",
            "maxTow": 6000,
            "payload": 1150,
            "gcwr": 9150,
            "hitch": "Class IV"
          },
          {
            "label": "M (2010–2014)",
            "maxTow": 6000,
            "payload": 1050,
            "gcwr": 9050,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive35i (2015–2018 F16)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 9200,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2015–2018)",
            "maxTow": 6000,
            "payload": 1150,
            "gcwr": 9150,
            "hitch": "Class IV"
          },
          {
            "label": "M (2015–2018)",
            "maxTow": 6000,
            "payload": 1050,
            "gcwr": 9050,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "X7",
        "kind": "suv",
        "trims": [
          {
            "label": "xDrive40i",
            "maxTow": 7500,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "M60i",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive40i (2019–2021)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2019–2021)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "M50i (2020–2021)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "xDrive50i (2019–2020)",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "X7 M60i",
        "kind": "suv",
        "trims": [
          {
            "label": "M60i — Twin-Turbo V8",
            "maxTow": 7500,
            "payload": 1500,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "M50i (2020–2021) — prior badge",
            "maxTow": 7500,
            "payload": 1400,
            "gcwr": 10900,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "XM",
        "kind": "suv",
        "trims": [
          {
            "label": "XM — PHEV",
            "maxTow": 5952,
            "payload": 1400,
            "gcwr": 14352,
            "hitch": "Class IV"
          },
          {
            "label": "XM Label Red — PHEV",
            "maxTow": 5952,
            "payload": 1350,
            "gcwr": 14302,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Mercedes-Benz",
    "models": [
      {
        "name": "EQB",
        "kind": "suv",
        "trims": [
          {
            "label": "EQB 250+ — FWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "EQB 300 4MATIC",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "EQB 350 4MATIC",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EQE SUV",
        "kind": "suv",
        "trims": [
          {
            "label": "EQE 350+ — RWD",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          },
          {
            "label": "EQE 350 4MATIC",
            "maxTow": 0,
            "payload": 1180,
            "gcwr": 5680,
            "hitch": "—"
          },
          {
            "label": "EQE 500 4MATIC",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 5650,
            "hitch": "—"
          },
          {
            "label": "AMG EQE",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EQS SUV",
        "kind": "suv",
        "trims": [
          {
            "label": "EQS 450+ — RWD",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 5800,
            "hitch": "—"
          },
          {
            "label": "EQS 450 4MATIC",
            "maxTow": 0,
            "payload": 1280,
            "gcwr": 5780,
            "hitch": "—"
          },
          {
            "label": "EQS 580 4MATIC",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 5750,
            "hitch": "—"
          },
          {
            "label": "Maybach EQS 680",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "G-Class",
        "kind": "suv",
        "trims": [
          {
            "label": "G 550",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "G 63 AMG",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "G 550 (2015–2021)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "G 63 AMG (2015–2021)",
            "maxTow": 7000,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "G500 / G550 — V8 (2005–2015)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "G55 AMG — 5.5L Supercharged V8 (2005–2011)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "G63 AMG — 5.5L TwinTurbo V8 (2013–2015)",
            "maxTow": 7000,
            "payload": 1250,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "G 550 (2018 last W463a)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "AMG G 63 (2018)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "G 550 (2019–2021 W463b redesign)",
            "maxTow": 7000,
            "payload": 1450,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "AMG G 63 (2019–2021)",
            "maxTow": 7000,
            "payload": 1350,
            "gcwr": 10350,
            "hitch": "Class IV"
          },
          {
            "label": "G 550 (2010–2018)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "G 55 AMG (2010–2012)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "G 63 AMG (2013–2018)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "G 65 AMG (2016–2018)",
            "maxTow": 7000,
            "payload": 1250,
            "gcwr": 10250,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "G-Class AMG",
        "kind": "suv",
        "trims": [
          {
            "label": "AMG G 63 — Twin-Turbo V8",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 15400,
            "hitch": "Class IV"
          },
          {
            "label": "AMG G 63 (2018–2021)",
            "maxTow": 7000,
            "payload": 1350,
            "gcwr": 10350,
            "hitch": "Class IV"
          },
          {
            "label": "AMG G 63 (2018)",
            "maxTow": 7000,
            "payload": 1300,
            "gcwr": 10300,
            "hitch": "Class IV"
          },
          {
            "label": "AMG G 63 (2019–2021 redesign)",
            "maxTow": 7000,
            "payload": 1350,
            "gcwr": 10350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "GL-Class",
        "kind": "suv",
        "trims": [
          {
            "label": "GL450 — 4.7L V8 (2007–2012)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "GL550 — 5.5L V8 (2008–2012)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "GL350 BlueTEC — 3.0L Diesel (2010–2012)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "GL450 — 4.7L TwinTurbo V8 (2013–2015)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "GL550 — 4.7L TwinTurbo V8 (2013–2015)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "GL63 AMG — 5.5L TwinTurbo V8 (2013–2015)",
            "maxTow": 7500,
            "payload": 1500,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "GL350 BlueTEC — 3.0L Diesel (2013–2015)",
            "maxTow": 7500,
            "payload": 1700,
            "gcwr": 15000,
            "hitch": "Class IV"
          },
          {
            "label": "GL 450 (2010–2012)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GL 550 (2010–2012)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "GL 350 Bluetec (2010–2012)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GL 450 (2013–2016 redesign)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GL 550 (2013–2016)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "GL 63 AMG (2013–2016)",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "GLA",
        "kind": "suv",
        "trims": [
          {
            "label": "GLA 250 — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLA 35 — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "GLA 250 (2015–2020)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "GLA 45 AMG (2015–2019)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 4200,
            "hitch": "N/A"
          },
          {
            "label": "GLA 250 (2021)",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "GLA 250 (2018–2020 gen1)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLA 45 (2018–2019)",
            "maxTow": 3500,
            "payload": 950,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "GLA 250 (2021 gen2)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLA 35 (2021)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "GLA 250 (2015–2018 intro)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLA 45 (2015–2018)",
            "maxTow": 3500,
            "payload": 950,
            "gcwr": 6500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "GLB",
        "kind": "suv",
        "trims": [
          {
            "label": "GLB 250 — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLB 35 — 2.0L Turbo",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 10150,
            "hitch": "Class III"
          },
          {
            "label": "GLB 250 (2020–2021)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "GLB 35 AMG (2020–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "AMG GLB 35 (2020–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "GLC",
        "kind": "suv",
        "trims": [
          {
            "label": "GLC 300 — 2.0L Turbo",
            "maxTow": 5300,
            "payload": 1300,
            "gcwr": 13600,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLC 43 — 2.0L Turbo Hybrid",
            "maxTow": 5300,
            "payload": 1250,
            "gcwr": 13550,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLC 63 S E Performance",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          },
          {
            "label": "GLC 300 (2016–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "GLC 43 AMG (2017–2021)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "GLC 63 AMG (2018–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "GLC 300 (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "GLC 350e PHEV (2018–2019)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLC 43 (2018–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLC 63 (2018–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "GLC 300 Coupe (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "GLC 300 (2016–2018 rename)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "AMG GLC 43 (2017–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "GLC 300 Coupe (2017–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "GLE",
        "kind": "suv",
        "trims": [
          {
            "label": "GLE 350",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 450",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 53",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "ML 350 (2015)",
            "maxTow": 7200,
            "payload": 1600,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 (2016–2021)",
            "maxTow": 7200,
            "payload": 1650,
            "gcwr": 12800,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 450 (2019–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 580 (2020–2021)",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 63 AMG (2016–2021)",
            "maxTow": 7200,
            "payload": 1500,
            "gcwr": 12800,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 (2018–2019 last gen2)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 400 (2018–2019)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 43 (2018–2019)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 (2020–2021 redesign)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 450 (2020–2021)",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 11150,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 53 (2020–2021)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 63 S (2021)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 Coupe (2020–2021)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 (2016–2018 rename)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 400 (2016–2018)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 43 (2016–2018)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLE 63 (2016–2018)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 350 Coupe (2016–2018)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "GLE 550e PHEV (2016–2018)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4300,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "GLK-Class",
        "kind": "suv",
        "trims": [
          {
            "label": "GLK350 — 3.5L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "GLK250 BlueTEC — 2.1L Diesel (2013–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "GLK 350 (2010–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "GLK 250 Bluetec (2013–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "GLS",
        "kind": "suv",
        "trims": [
          {
            "label": "GLS 450",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 580",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Maybach GLS 600",
            "maxTow": 7500,
            "payload": 1400,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "GL 450 (2015–2016)",
            "maxTow": 7500,
            "payload": 1650,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 450 (2017–2021)",
            "maxTow": 7500,
            "payload": 1700,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 580 (2020–2021)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 63 AMG (2017–2021)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 13200,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 450 (2018–2019)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 550 (2018–2019)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLS 63 (2018–2019)",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 450 (2020–2021 redesign)",
            "maxTow": 7700,
            "payload": 1650,
            "gcwr": 11350,
            "hitch": "Class IV"
          },
          {
            "label": "Maybach GLS 600 (2021)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 450 (2017–2018 rename)",
            "maxTow": 7500,
            "payload": 1600,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "GLS 550 (2017–2018)",
            "maxTow": 7500,
            "payload": 1550,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "AMG GLS 63 (2017–2018)",
            "maxTow": 7500,
            "payload": 1450,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "GLS Maybach",
        "kind": "suv",
        "trims": [
          {
            "label": "Maybach GLS 600 — Twin-Turbo V8",
            "maxTow": 7500,
            "payload": 1500,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "Maybach GLS 600 (2021)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "Maybach GLS 600 4MATIC (2021)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "M-Class",
        "kind": "suv",
        "trims": [
          {
            "label": "ML350 — 3.7L V6 (2005–2011)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "ML500 / ML550 — V8 (2005–2011)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "ML63 AMG — 6.2L V8 (2007–2011)",
            "maxTow": 7200,
            "payload": 1300,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "ML350 BlueTEC — 3.0L Diesel (2010–2011)",
            "maxTow": 7200,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "ML350 — 3.5L V6 (2012–2015)",
            "maxTow": 6600,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "ML550 — 4.7L TwinTurbo V8 (2012–2015)",
            "maxTow": 7200,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "ML63 AMG — 5.5L TwinTurbo V8 (2012–2015)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "ML350 BlueTEC — 3.0L Diesel (2012–2015)",
            "maxTow": 7200,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "ML 350 (2010–2011)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "ML 550 (2010–2011)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "ML 63 AMG (2010–2011)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "ML 350 (2012–2015 redesign)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "ML 550 (2012–2015)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          },
          {
            "label": "ML 63 AMG (2012–2015)",
            "maxTow": 7200,
            "payload": 1250,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "ML 250 Bluetec (2012–2015)",
            "maxTow": 7200,
            "payload": 1400,
            "gcwr": 10600,
            "hitch": "Class IV"
          },
          {
            "label": "ML 400 (2015)",
            "maxTow": 7200,
            "payload": 1350,
            "gcwr": 10550,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R-Class",
        "kind": "suv",
        "trims": [
          {
            "label": "R350 — 3.5L V6 (2006–2012)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "R500 / R550 — V8 (2006–2009)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "R350 BlueTEC — 3.0L Diesel (2009–2012)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "R 350 (2010–2012 last US)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          },
          {
            "label": "R 350 Bluetec (2010–2012)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 6900,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Audi",
    "models": [
      {
        "name": "e-tron",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium (2019–2021)",
            "maxTow": 0,
            "payload": 1400,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "Prestige (2019–2021)",
            "maxTow": 0,
            "payload": 1400,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "Sportback (2020–2021)",
            "maxTow": 0,
            "payload": 1350,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "Premium — Dual Motor (2019–2021)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 7400,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus (2019–2021)",
            "maxTow": 4000,
            "payload": 1400,
            "gcwr": 7400,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Q3",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 2.0T",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Premium Plus — 2.0T",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "Prestige — 2.0T",
            "maxTow": 1500,
            "payload": 960,
            "gcwr": 6960,
            "hitch": "Class II"
          },
          {
            "label": "2.0T Premium (2015–2018)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4300,
            "hitch": "N/A"
          },
          {
            "label": "45 TFSI (2019–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4400,
            "hitch": "N/A"
          },
          {
            "label": "2.0T Premium (2018 last gen1)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "2.0T Premium (2019–2021 gen2)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Premium Plus (2019–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Prestige (2019–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Premium (2015–2018 US intro)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "2.0T Premium Plus (2015–2018)",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "2.0T Prestige (2015–2018)",
            "maxTow": 2000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Q4 e-tron",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — RWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Premium Plus — AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Prestige — AWD",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Q5",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 2.0T",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 11100,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus — 2.0T",
            "maxTow": 4400,
            "payload": 1180,
            "gcwr": 11080,
            "hitch": "Class III"
          },
          {
            "label": "Prestige — 2.0T",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 11050,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 — 3.0T",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Premium (2015–2017)",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Premium (2018–2021)",
            "maxTow": 4400,
            "payload": 1450,
            "gcwr": 8700,
            "hitch": "Class III"
          },
          {
            "label": "45 TFSI (2018–2021)",
            "maxTow": 4400,
            "payload": 1450,
            "gcwr": 8700,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 (2015–2021)",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 8700,
            "hitch": "Class III"
          },
          {
            "label": "55 TFSI e Hybrid (2020–2021)",
            "maxTow": 2000,
            "payload": 1450,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "2.0T — 2.0L Turbo (2009–2012)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "3.2 — 3.2L V6 (2009–2012)",
            "maxTow": 4400,
            "payload": 1250,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "2.0T — 2.0L Turbo (2013–2015)",
            "maxTow": 4400,
            "payload": 1250,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "3.0T — 3.0L Supercharged V6 (2013–2015)",
            "maxTow": 4400,
            "payload": 1300,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "TDI — 3.0L Diesel (2014–2015)",
            "maxTow": 4400,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 — 3.0L Supercharged V6 (2014–2015)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Premium Plus (2018–2021)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Prestige (2018–2021)",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 3.0T (2018–2021)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "45 TFSI (2021)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "55 TFSI e PHEV (2020–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "2.0T Premium (2010–2017)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "3.2 FSI Premium (2010–2012)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "3.0T Supercharged (2013–2017)",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 7550,
            "hitch": "Class III"
          },
          {
            "label": "TDI Clean Diesel (2014–2015)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid (2012–2013)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4100,
            "hitch": "N/A"
          },
          {
            "label": "2.0T Premium (2018 redesign)",
            "maxTow": 4400,
            "payload": 1200,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "2.0T Prestige (2018)",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 7550,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 3.0T (2014–2017)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 3.0T (2018 redesign)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Q5 Sportback",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 2.0T",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 11050,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus — 2.0T",
            "maxTow": 4400,
            "payload": 1120,
            "gcwr": 11020,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 Sportback — 3.0T",
            "maxTow": 4400,
            "payload": 1080,
            "gcwr": 10980,
            "hitch": "Class III"
          },
          {
            "label": "45 TFSI Premium (2021 intro)",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "45 TFSI Premium Plus (2021)",
            "maxTow": 4400,
            "payload": 1150,
            "gcwr": 7600,
            "hitch": "Class III"
          },
          {
            "label": "SQ5 Sportback (2021)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Q6 e-tron",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — RWD",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "Premium Plus — AWD",
            "maxTow": 0,
            "payload": 1080,
            "gcwr": 5580,
            "hitch": "—"
          },
          {
            "label": "Prestige — AWD",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          },
          {
            "label": "SQ6 e-tron — Dual Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Q7",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 2.0T",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 11300,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus — 3.0T",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 16150,
            "hitch": "Class IV"
          },
          {
            "label": "Prestige — 3.0T",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "SQ7 — 4.0T",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 16050,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Premium (2017–2021)",
            "maxTow": 7700,
            "payload": 1650,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "55 TFSI (2020–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SQ7 (2020–2021)",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "3.6 — 3.6L V6 (2007–2010)",
            "maxTow": 6600,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "4.2 — 4.2L V8 (2007–2010)",
            "maxTow": 6600,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "3.0 TDI — 3.0L Diesel (2009–2015)",
            "maxTow": 6600,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T — 3.0L Supercharged V6 (2011–2015)",
            "maxTow": 6600,
            "payload": 1500,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "2.0T Premium (2018–2019)",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "3.0T Premium (2018–2021)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Prestige (2018–2021)",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 11150,
            "hitch": "Class IV"
          },
          {
            "label": "60 TFSI e PHEV (2020–2021)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "3.6 FSI Premium (2010–2015)",
            "maxTow": 6600,
            "payload": 1500,
            "gcwr": 10100,
            "hitch": "Class IV"
          },
          {
            "label": "4.2 FSI Prestige (2010–2012)",
            "maxTow": 6600,
            "payload": 1450,
            "gcwr": 10050,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Supercharged (2011–2015)",
            "maxTow": 6600,
            "payload": 1450,
            "gcwr": 10050,
            "hitch": "Class IV"
          },
          {
            "label": "TDI Clean Diesel (2010–2015)",
            "maxTow": 6600,
            "payload": 1500,
            "gcwr": 10100,
            "hitch": "Class IV"
          },
          {
            "label": "2.0T Premium (2017–2018 redesign)",
            "maxTow": 4400,
            "payload": 1400,
            "gcwr": 7800,
            "hitch": "Class III"
          },
          {
            "label": "3.0T Premium (2017–2018)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Prestige (2017–2018)",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 11150,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Q8",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 3.0T",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Plus — 3.0T",
            "maxTow": 7700,
            "payload": 1380,
            "gcwr": 16080,
            "hitch": "Class IV"
          },
          {
            "label": "Prestige — 3.0T",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 16050,
            "hitch": "Class IV"
          },
          {
            "label": "SQ8 — 4.0T",
            "maxTow": 7700,
            "payload": 1300,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "RS Q8 — 4.0T",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 5750,
            "hitch": "—"
          },
          {
            "label": "55 TFSI Premium (2019–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SQ8 (2020–2021)",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Premium (2019–2021)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "3.0T Prestige (2019–2021)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "RS Q8 (2020–2021)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Q8 e-tron",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — Dual Motor",
            "maxTow": 4000,
            "payload": 1200,
            "gcwr": 10700,
            "hitch": "Class III"
          },
          {
            "label": "Premium Plus — Dual Motor",
            "maxTow": 4000,
            "payload": 1180,
            "gcwr": 10680,
            "hitch": "Class III"
          },
          {
            "label": "Prestige — Dual Motor",
            "maxTow": 4000,
            "payload": 1150,
            "gcwr": 10650,
            "hitch": "Class III"
          },
          {
            "label": "SQ8 e-tron — Tri-Motor",
            "maxTow": 4000,
            "payload": 1100,
            "gcwr": 10600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "SQ7",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium Plus — 4.0T",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "Prestige — 4.0T",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 16050,
            "hitch": "Class IV"
          },
          {
            "label": "4.0T (2019–2021)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "4.0T Prestige (2020–2021)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 11050,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "SQ8",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium Plus — 4.0T",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 16050,
            "hitch": "Class IV"
          },
          {
            "label": "Prestige — 4.0T",
            "maxTow": 7700,
            "payload": 1300,
            "gcwr": 16000,
            "hitch": "Class IV"
          },
          {
            "label": "4.0T (2020–2021)",
            "maxTow": 7700,
            "payload": 1300,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "4.0T Prestige (2020–2021)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Volvo",
    "models": [
      {
        "name": "EC40",
        "kind": "suv",
        "trims": [
          {
            "label": "Core — Single Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Plus — Dual Motor",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Ultra — Dual Motor",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EX30",
        "kind": "suv",
        "trims": [
          {
            "label": "Core — Single Motor",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "Plus — Single Motor",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          },
          {
            "label": "Ultra — Dual Motor",
            "maxTow": 0,
            "payload": 860,
            "gcwr": 5360,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EX40",
        "kind": "suv",
        "trims": [
          {
            "label": "Core — Single Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Plus — Dual Motor",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Ultra — Dual Motor",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "EX90",
        "kind": "suv",
        "trims": [
          {
            "label": "Twin Motor — Dual Motor EV",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "Twin Motor Performance — Dual Motor EV",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 11850,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XC40",
        "kind": "suv",
        "trims": [
          {
            "label": "B5 Core — Mild Hybrid",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "B5 Plus — Mild Hybrid",
            "maxTow": 3500,
            "payload": 1080,
            "gcwr": 10080,
            "hitch": "Class III"
          },
          {
            "label": "Ultimate — Mild Hybrid",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "T5 Momentum (2019–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "T5 Inscription (2019–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Recharge PHEV (2020–2021)",
            "maxTow": 2000,
            "payload": 1250,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "T4 Momentum (2019–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T5 R-Design (2019–2021)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XC60",
        "kind": "suv",
        "trims": [
          {
            "label": "B5 Core — Mild Hybrid",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "B5 Plus — Mild Hybrid",
            "maxTow": 3500,
            "payload": 1180,
            "gcwr": 10180,
            "hitch": "Class III"
          },
          {
            "label": "T8 Ultra — PHEV",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "T5 (2015–2017)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "T6 (2015–2017)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "T5 Momentum (2018–2021)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "T6 Inscription (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "T8 Hybrid (2018–2021)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "3.2 — 3.2L I6 (2010–2015)",
            "maxTow": 3300,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "T6 — 3.0L Turbo (2010–2015)",
            "maxTow": 3300,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "T5 — 2.0L / 2.5L Turbo (2014–2015)",
            "maxTow": 3300,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "T6 Momentum (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T6 R-Design (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T8 Twin Engine PHEV (2018–2021)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T5 Inscription (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "3.2 (2010–2016)",
            "maxTow": 3300,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "T6 (2010–2016)",
            "maxTow": 3300,
            "payload": 1150,
            "gcwr": 6450,
            "hitch": "Class II"
          },
          {
            "label": "T6 R-Design (2010–2016)",
            "maxTow": 3300,
            "payload": 1100,
            "gcwr": 6400,
            "hitch": "Class II"
          },
          {
            "label": "T5 Momentum (2017–2018 redesign)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T6 Momentum (2017–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "T6 R-Design (2017–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "T8 Twin Engine PHEV (2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "XC70",
        "kind": "suv",
        "trims": [
          {
            "label": "2.5T — 2.5L Turbo (2005–2007)",
            "maxTow": 3300,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "3.2 — 3.2L I6 (2008–2015)",
            "maxTow": 3300,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "T6 — 3.0L Turbo (2008–2015)",
            "maxTow": 3300,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "3.2 (2010–2016 last)",
            "maxTow": 3300,
            "payload": 1300,
            "gcwr": 6600,
            "hitch": "Class II"
          },
          {
            "label": "T6 (2010–2016)",
            "maxTow": 3300,
            "payload": 1250,
            "gcwr": 6550,
            "hitch": "Class II"
          },
          {
            "label": "T6 R-Design (2010–2016)",
            "maxTow": 3300,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "XC90",
        "kind": "suv",
        "trims": [
          {
            "label": "B5 Core — Mild Hybrid",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "B6 Plus — Mild Hybrid",
            "maxTow": 5000,
            "payload": 1380,
            "gcwr": 11880,
            "hitch": "Class III"
          },
          {
            "label": "T8 Ultra — PHEV",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 11800,
            "hitch": "Class III"
          },
          {
            "label": "Recharge Ultimate — PHEV",
            "maxTow": 5000,
            "payload": 1280,
            "gcwr": 11780,
            "hitch": "Class III"
          },
          {
            "label": "T6 (2015–2021)",
            "maxTow": 5000,
            "payload": 1600,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "T8 Hybrid (2016–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Inscription (2015–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "R-Design (2015–2021)",
            "maxTow": 5000,
            "payload": 1550,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "2.5T — 2.5L Turbo (2005–2011)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "T6 — 2.9L TwinTurbo (2005–2006)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "V8 — 4.4L V8 (2005–2011)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "3.2 — 3.2L I6 (2007–2014)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "T6 — 3.0L Turbo (2010–2014)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "T5 — 2.0L Turbo (2015 gen2)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "T6 — 2.0L TwinCharged (2015 gen2)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "T5 Momentum (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "T6 Momentum (2018–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "T6 Inscription (2018–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "T8 Twin Engine PHEV (2018–2021)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "T6 R-Design (2018–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Excellence (2018–2019)",
            "maxTow": 5000,
            "payload": 1250,
            "gcwr": 8250,
            "hitch": "Class IV"
          },
          {
            "label": "3.2 (2010–2014 last gen1)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "V8 (2010–2011)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "3.2 R-Design (2010–2014)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "T6 Momentum (2016–2018 redesign)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "T6 Inscription (2016–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "T8 Twin Engine PHEV (2016–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "T5 Momentum (2016–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "First Edition (2016)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "XC90 Ultra",
        "kind": "suv",
        "trims": [
          {
            "label": "Ultra B6 — Mild Hybrid",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 11850,
            "hitch": "Class III"
          },
          {
            "label": "Ultra T8 — PHEV",
            "maxTow": 5000,
            "payload": 1280,
            "gcwr": 11780,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Land Rover",
    "models": [
      {
        "name": "Defender 110",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 3.0L I6",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "X-Dynamic — 3.0L I6",
            "maxTow": 8201,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "V8",
            "maxTow": 8201,
            "payload": 1300,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "S — 2.0L Turbo (2020–2021)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.0L I6 (2020–2021)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "X — 3.0L I6 (2020–2021)",
            "maxTow": 8201,
            "payload": 1550,
            "gcwr": 14200,
            "hitch": "Class IV"
          },
          {
            "label": "S (2020–2021)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 11701,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2020–2021)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 11701,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2020–2021)",
            "maxTow": 8201,
            "payload": 1450,
            "gcwr": 11651,
            "hitch": "Class IV"
          },
          {
            "label": "X (2020–2021)",
            "maxTow": 8201,
            "payload": 1400,
            "gcwr": 11601,
            "hitch": "Class IV"
          },
          {
            "label": "X-Dynamic (2021)",
            "maxTow": 8201,
            "payload": 1400,
            "gcwr": 11601,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Defender 130",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 3.0L I6",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "X — 3.0L I6",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Defender 90",
        "kind": "suv",
        "trims": [
          {
            "label": "S P300 — 2.0L Turbo",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 16116,
            "hitch": "Class IV"
          },
          {
            "label": "X-Dynamic SE P400 — 3.0L I6",
            "maxTow": 8201,
            "payload": 1450,
            "gcwr": 16651,
            "hitch": "Class IV"
          },
          {
            "label": "V8 — 5.0L Supercharged",
            "maxTow": 8201,
            "payload": 1400,
            "gcwr": 16601,
            "hitch": "Class IV"
          },
          {
            "label": "OCTA — Twin-Turbo V8",
            "maxTow": 8201,
            "payload": 1380,
            "gcwr": 16581,
            "hitch": "Class IV"
          },
          {
            "label": "S — 2.0L Turbo (2021)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "X (2021)",
            "maxTow": 8201,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "S (2021 intro US)",
            "maxTow": 8201,
            "payload": 1400,
            "gcwr": 11601,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2021)",
            "maxTow": 8201,
            "payload": 1400,
            "gcwr": 11601,
            "hitch": "Class IV"
          },
          {
            "label": "X-Dynamic (2021)",
            "maxTow": 8201,
            "payload": 1350,
            "gcwr": 11551,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Discovery",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 2.0L Turbo",
            "maxTow": 8200,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Dynamic HSE — 3.0L I6",
            "maxTow": 8200,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LR4 — 3.0L V6 (2015–2016)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.0L V6 (2017–2021)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L V6 (2017–2021)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2018–2021)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 11801,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2018–2021)",
            "maxTow": 8201,
            "payload": 1550,
            "gcwr": 11751,
            "hitch": "Class IV"
          },
          {
            "label": "HSE Luxury (2018–2021)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 11701,
            "hitch": "Class IV"
          },
          {
            "label": "R-Dynamic S (2021)",
            "maxTow": 8201,
            "payload": 1550,
            "gcwr": 11751,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2017–2018 redesign)",
            "maxTow": 8201,
            "payload": 1600,
            "gcwr": 11801,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2017–2018)",
            "maxTow": 8201,
            "payload": 1550,
            "gcwr": 11751,
            "hitch": "Class IV"
          },
          {
            "label": "HSE Luxury (2017–2018)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 11701,
            "hitch": "Class IV"
          },
          {
            "label": "First Edition (2017)",
            "maxTow": 8201,
            "payload": 1500,
            "gcwr": 11701,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Discovery Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "S P250 — 2.0L Turbo",
            "maxTow": 4409,
            "payload": 1200,
            "gcwr": 11109,
            "hitch": "Class III"
          },
          {
            "label": "SE P250 — 2.0L Turbo",
            "maxTow": 4409,
            "payload": 1180,
            "gcwr": 11089,
            "hitch": "Class III"
          },
          {
            "label": "R-Dynamic S P250 — 2.0L Turbo",
            "maxTow": 4409,
            "payload": 1150,
            "gcwr": 11059,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L Turbo (2015–2021)",
            "maxTow": 4409,
            "payload": 1300,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "HSE — 2.0L Turbo (2015–2021)",
            "maxTow": 4409,
            "payload": 1300,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE (2018–2021)",
            "maxTow": 4409,
            "payload": 1200,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "HSE (2018–2021)",
            "maxTow": 4409,
            "payload": 1150,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "R-Dynamic S (2020–2021)",
            "maxTow": 4409,
            "payload": 1150,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "SE (2015–2018 intro)",
            "maxTow": 4409,
            "payload": 1200,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "HSE (2015–2018)",
            "maxTow": 4409,
            "payload": 1150,
            "gcwr": 7559,
            "hitch": "Class III"
          },
          {
            "label": "HSE Luxury (2015–2018)",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 7509,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Freelander",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 2.5L V6 (2005)",
            "maxTow": 2500,
            "payload": 1000,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "HSE — 2.5L V6 (2005)",
            "maxTow": 2500,
            "payload": 950,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "SE (2005–2005 last US)",
            "maxTow": 2500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "HSE (2005)",
            "maxTow": 2500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "LR2",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.2L I6 (2008–2012)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "HSE — 3.2L I6 (2008–2012)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 2.0L Turbo (2013–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "HSE — 2.0L Turbo (2013–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base (2010–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "HSE (2010–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "HSE LUX (2013–2015)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "LR3",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 4.0L / 4.4L V8 (2005–2009)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 4.4L V8 (2005–2009)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2009 last)",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 11200,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2009)",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 11150,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "LR4",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 5.0L V8 (2010–2013)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 5.0L V8 (2010–2013)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.0L Supercharged V6 (2014–2015)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L Supercharged V6 (2014–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base (2010–2016)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2010–2016)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "HSE LUX (2013–2016)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Range Rover",
        "kind": "suv",
        "trims": [
          {
            "label": "SE — 3.0L I6 MHEV",
            "maxTow": 8200,
            "payload": 1400,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography — 4.4L V8",
            "maxTow": 8200,
            "payload": 1300,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "SV — 4.4L V8",
            "maxTow": 7716,
            "payload": 1200,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L V6 (2015–2021)",
            "maxTow": 7716,
            "payload": 1650,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography 5.0L V8 (2015–2021)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "SVAutobiography (2015–2021)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 4.4L V8 (2005–2009)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 4.2L SC V8 (2006–2009)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 5.0L V8 (2010–2012)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 5.0L SC V8 (2010–2012)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L Supercharged V6 (2013–2015)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 5.0L SC V8 (2013–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography — 5.0L SC V8 (2013–2015)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Vogue / Base (2018–2021)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 11316,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2018–2021)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 11266,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography (2018–2021)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "SVAutobiography (2018–2021)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2010–2012 last gen3)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 11316,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged (2010–2012)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 11266,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography (2010–2012)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2013–2018 redesign)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 11316,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged (2013–2018)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 11266,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography (2013–2018)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "SVAutobiography (2015–2018)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Range Rover Evoque",
        "kind": "suv",
        "trims": [
          {
            "label": "S P250 — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 10568,
            "hitch": "Class III"
          },
          {
            "label": "Dynamic SE P250 — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1080,
            "gcwr": 10548,
            "hitch": "Class III"
          },
          {
            "label": "Autobiography P250 — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 10518,
            "hitch": "Class III"
          },
          {
            "label": "SE — 2.0L Turbo (2015–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "HSE — 2.0L Turbo (2015–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "R-Dynamic S (2020–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Pure — 2.0L Turbo (2012–2015)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Prestige — 2.0L Turbo (2012–2015)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Dynamic — 2.0L Turbo (2012–2015)",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE (2018–2019 gen1)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "HSE (2018–2019)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "S (2020–2021 gen2)",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 7168,
            "hitch": "Class III"
          },
          {
            "label": "SE (2020–2021)",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 7168,
            "hitch": "Class III"
          },
          {
            "label": "HSE (2020–2021)",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 7168,
            "hitch": "Class III"
          },
          {
            "label": "R-Dynamic (2020–2021)",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 7168,
            "hitch": "Class III"
          },
          {
            "label": "Pure (2012–2018 intro)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "Prestige (2012–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          },
          {
            "label": "Dynamic (2012–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          },
          {
            "label": "Autobiography (2015–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          },
          {
            "label": "Convertible (2016–2018)",
            "maxTow": 3300,
            "payload": 1000,
            "gcwr": 6300,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Range Rover Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "SE P400 — Mild Hybrid",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 16316,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography P440e — PHEV",
            "maxTow": 6614,
            "payload": 1500,
            "gcwr": 15114,
            "hitch": "Class IV"
          },
          {
            "label": "First Edition P530 — Twin-Turbo V8",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 16266,
            "hitch": "Class IV"
          },
          {
            "label": "SV Edition Two — Twin-Turbo V8",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 16216,
            "hitch": "Class IV"
          },
          {
            "label": "SE — 3.0L V6 (2015–2021)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L V6 (2015–2021)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged 5.0L V8 (2015–2021)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "SVR (2015–2021)",
            "maxTow": 6613,
            "payload": 1450,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 4.4L V8 (2006–2009)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 4.2L SC V8 (2006–2009)",
            "maxTow": 7716,
            "payload": 1300,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 5.0L V8 (2010–2013)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 5.0L SC V8 (2010–2013)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L Supercharged V6 (2014–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged — 5.0L SC V8 (2014–2015)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography — 5.0L SC V8 (2014–2015)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2018–2021)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2018–2021)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "HST (2019–2021)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography (2018–2021)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "SVR (2018–2021)",
            "maxTow": 6614,
            "payload": 1300,
            "gcwr": 9914,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2010–2013)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2010–2013)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged (2010–2013)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2014–2018 redesign)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 11216,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2014–2018)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 11166,
            "hitch": "Class IV"
          },
          {
            "label": "Supercharged (2014–2018)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography (2014–2018)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "SVR (2015–2018)",
            "maxTow": 6614,
            "payload": 1300,
            "gcwr": 9914,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Range Rover Sport SV",
        "kind": "suv",
        "trims": [
          {
            "label": "SV — Twin-Turbo V8",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 16216,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Range Rover Velar",
        "kind": "suv",
        "trims": [
          {
            "label": "S P250 — 2.0L Turbo",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 13491,
            "hitch": "Class IV"
          },
          {
            "label": "Dynamic SE P340 — 3.0L I6",
            "maxTow": 5291,
            "payload": 1180,
            "gcwr": 13471,
            "hitch": "Class IV"
          },
          {
            "label": "Autobiography P400 — 3.0L I6",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 13441,
            "hitch": "Class IV"
          },
          {
            "label": "S — 2.0L Turbo (2018–2021)",
            "maxTow": 5291,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "R-Dynamic S (2018–2021)",
            "maxTow": 5291,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "HSE — 3.0L V6 (2018–2021)",
            "maxTow": 5291,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "S (2018–2021)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2018–2021)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "HSE (2018–2021)",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "R-Dynamic (2018–2021)",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "SVAutobiography (2019–2021)",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "S (2018 intro)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "SE (2018)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "R-Dynamic (2018)",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 8441,
            "hitch": "Class IV"
          },
          {
            "label": "First Edition (2018)",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 8391,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Porsche",
    "models": [
      {
        "name": "Cayenne",
        "kind": "suv",
        "trims": [
          {
            "label": "Cayenne — 3.0L Turbo V6",
            "maxTow": 7700,
            "payload": 1500,
            "gcwr": 16200,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S — Twin-Turbo V6",
            "maxTow": 7700,
            "payload": 1480,
            "gcwr": 16180,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne E-Hybrid",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne GTS",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 16150,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo GT",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 5800,
            "hitch": "—"
          },
          {
            "label": "Cayenne — 3.6L V6 (2015–2017)",
            "maxTow": 7716,
            "payload": 1600,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S (2015–2017)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne — 3.0L V6 (2018–2021)",
            "maxTow": 7700,
            "payload": 1650,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S (2018–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne E-Hybrid (2018–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo (2018–2021)",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.2L V6 (2005–2006)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.5L V8 (2005–2006)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Turbo — 4.5L TwinTurbo V8 (2005–2006)",
            "maxTow": 7716,
            "payload": 1300,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.6L V6 (2008–2010)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.8L V8 (2008–2010)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Turbo — 4.8L TwinTurbo V8 (2008–2010)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "GTS — 4.8L V8 (2008–2010)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Diesel — 3.0L Diesel (2009–2010)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.6L V6 (2011–2015)",
            "maxTow": 7716,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 4.8L / 3.6L TwinTurbo (2011–2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Turbo — 4.8L TwinTurbo V8 (2011–2015)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "GTS — 4.8L / 3.6L (2013–2015)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Diesel — 3.0L Diesel (2013–2015)",
            "maxTow": 7716,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "S E-Hybrid — 3.0L Hybrid (2015)",
            "maxTow": 7716,
            "payload": 1450,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne (2018–2021)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo S E-Hybrid (2020–2021)",
            "maxTow": 7700,
            "payload": 1200,
            "gcwr": 10900,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne GTS (2021)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne (2010–2018)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S (2010–2018)",
            "maxTow": 7716,
            "payload": 1350,
            "gcwr": 11066,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne GTS (2010–2018)",
            "maxTow": 7716,
            "payload": 1300,
            "gcwr": 11016,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo (2010–2018)",
            "maxTow": 7716,
            "payload": 1250,
            "gcwr": 10966,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo S (2010–2018)",
            "maxTow": 7716,
            "payload": 1200,
            "gcwr": 10916,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Diesel (2013–2016)",
            "maxTow": 7716,
            "payload": 1400,
            "gcwr": 11116,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S E-Hybrid (2015–2018)",
            "maxTow": 7716,
            "payload": 1300,
            "gcwr": 11016,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne (2018 redesign gen3)",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 11100,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S (2018 gen3)",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 11050,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo (2018 gen3)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 10950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Cayenne Coupe",
        "kind": "suv",
        "trims": [
          {
            "label": "Cayenne Coupe — 3.0L Turbo V6",
            "maxTow": 7700,
            "payload": 1450,
            "gcwr": 16150,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S Coupe",
            "maxTow": 7700,
            "payload": 1420,
            "gcwr": 16120,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo GT Coupe",
            "maxTow": 0,
            "payload": 1280,
            "gcwr": 5780,
            "hitch": "—"
          },
          {
            "label": "Cayenne Coupe (2020–2021)",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Coupe S (2020–2021)",
            "maxTow": 7700,
            "payload": 1550,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne S Coupe (2020–2021)",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 10950,
            "hitch": "Class IV"
          },
          {
            "label": "Cayenne Turbo Coupe (2020–2021)",
            "maxTow": 7700,
            "payload": 1200,
            "gcwr": 10900,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Cayenne Turbo E-Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "Turbo E-Hybrid",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "Turbo GT",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 5800,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Macan",
        "kind": "suv",
        "trims": [
          {
            "label": "Macan — 2.0L Turbo",
            "maxTow": 4409,
            "payload": 1200,
            "gcwr": 11109,
            "hitch": "Class III"
          },
          {
            "label": "Macan S — 2.9L Twin-Turbo",
            "maxTow": 4409,
            "payload": 1180,
            "gcwr": 11089,
            "hitch": "Class III"
          },
          {
            "label": "Macan GTS",
            "maxTow": 4409,
            "payload": 1150,
            "gcwr": 11059,
            "hitch": "Class III"
          },
          {
            "label": "Macan — 2.0L Turbo (2015–2021)",
            "maxTow": 4409,
            "payload": 1400,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Macan S (2015–2021)",
            "maxTow": 4409,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Macan GTS (2015–2021)",
            "maxTow": 4409,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Macan Turbo (2015–2021)",
            "maxTow": 4409,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Macan (2018–2021)",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "Macan S (2018–2021)",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "Macan GTS (2018–2021)",
            "maxTow": 4409,
            "payload": 1050,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "Macan Turbo (2018–2021)",
            "maxTow": 4409,
            "payload": 1000,
            "gcwr": 7609,
            "hitch": "Class III"
          },
          {
            "label": "Macan (2015–2018 intro)",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 7509,
            "hitch": "Class III"
          },
          {
            "label": "Macan S (2015–2018)",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 7509,
            "hitch": "Class III"
          },
          {
            "label": "Macan GTS (2017–2018)",
            "maxTow": 4409,
            "payload": 1050,
            "gcwr": 7459,
            "hitch": "Class III"
          },
          {
            "label": "Macan Turbo (2015–2018)",
            "maxTow": 4409,
            "payload": 1000,
            "gcwr": 7409,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Macan Electric",
        "kind": "suv",
        "trims": [
          {
            "label": "Macan 4 — Dual Motor",
            "maxTow": 4409,
            "payload": 1100,
            "gcwr": 11009,
            "hitch": "Class III"
          },
          {
            "label": "Macan Turbo — Dual Motor",
            "maxTow": 4409,
            "payload": 1050,
            "gcwr": 10959,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Lexus",
    "models": [
      {
        "name": "GX",
        "kind": "suv",
        "trims": [
          {
            "label": "GX 550 Premium",
            "maxTow": 8000,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "GX 550 Overtrail",
            "maxTow": 8000,
            "payload": 1400,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "GX 550 Luxury",
            "maxTow": 8000,
            "payload": 1380,
            "gcwr": 13800,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 — 4.6L V8 (2015–2021)",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Premium (2015–2021)",
            "maxTow": 6500,
            "payload": 1450,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Luxury (2015–2021)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "470 — 4.7L V8 (2005–2009)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 11500,
            "hitch": "Class IV"
          },
          {
            "label": "460 — 4.6L V8 (2010–2015)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 (2018–2021)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Premium (2018–2021)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Luxury (2018–2021)",
            "maxTow": 6500,
            "payload": 1250,
            "gcwr": 9750,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 (2010–2018)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Premium (2010–2018)",
            "maxTow": 6500,
            "payload": 1300,
            "gcwr": 9800,
            "hitch": "Class IV"
          },
          {
            "label": "GX 460 Luxury (2014–2018)",
            "maxTow": 6500,
            "payload": 1250,
            "gcwr": 9750,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "GX 550",
        "kind": "suv",
        "trims": [
          {
            "label": "Premium — 3.4L Twin-Turbo V6",
            "maxTow": 8000,
            "payload": 1500,
            "gcwr": 16500,
            "hitch": "Class IV"
          },
          {
            "label": "Premium+ — 3.4L Twin-Turbo V6",
            "maxTow": 8000,
            "payload": 1480,
            "gcwr": 16480,
            "hitch": "Class IV"
          },
          {
            "label": "Overtrail — 3.4L Twin-Turbo V6",
            "maxTow": 8000,
            "payload": 1450,
            "gcwr": 16450,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 3.4L Twin-Turbo V6",
            "maxTow": 8000,
            "payload": 1420,
            "gcwr": 16420,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury+ — 3.4L Twin-Turbo V6",
            "maxTow": 8000,
            "payload": 1400,
            "gcwr": 16400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "LX",
        "kind": "suv",
        "trims": [
          {
            "label": "LX 600 Premium",
            "maxTow": 8000,
            "payload": 1500,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LX 600 F Sport",
            "maxTow": 8000,
            "payload": 1450,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "LX 600 Ultra Luxury",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 — 5.7L V8 (2015–2021)",
            "maxTow": 7000,
            "payload": 1500,
            "gcwr": 12500,
            "hitch": "Class IV"
          },
          {
            "label": "470 — 4.7L V8 (2005–2007)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "570 — 5.7L V8 (2008–2015)",
            "maxTow": 7000,
            "payload": 1450,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 (2018–2021)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 Three-Row (2018–2021)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 Two-Row (2021)",
            "maxTow": 7000,
            "payload": 1450,
            "gcwr": 10450,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 (2010–2015)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 (2016–2018 refresh)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          },
          {
            "label": "LX 570 Three-Row (2016–2018)",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "NX",
        "kind": "suv",
        "trims": [
          {
            "label": "250 — 2.5L",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 7600,
            "hitch": "Class II"
          },
          {
            "label": "350 — 2.4L Turbo",
            "maxTow": 2000,
            "payload": 1080,
            "gcwr": 7580,
            "hitch": "Class II"
          },
          {
            "label": "350h — Hybrid",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 7550,
            "hitch": "Class II"
          },
          {
            "label": "450h+ — PHEV",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "NX 200t — 2.0L Turbo (2015–2017)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "NX 300h Hybrid (2015–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "NX 300 — 2.0L Turbo (2018–2021)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "NX 300 (2018–2021)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "NX 300h Hybrid (2018–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "NX 300 F Sport (2018–2021)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "NX 200t (2015–2017 intro)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "NX 300h Hybrid (2015–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "NX 300 (2018 rename)",
            "maxTow": 2000,
            "payload": 1100,
            "gcwr": 5100,
            "hitch": "Class II"
          },
          {
            "label": "NX 300 F Sport (2015–2018)",
            "maxTow": 2000,
            "payload": 1050,
            "gcwr": 5050,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "RX",
        "kind": "suv",
        "trims": [
          {
            "label": "RX 350",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "RX 500h",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 — 3.5L V6 (2015–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h Hybrid (2015–2021)",
            "maxTow": 3500,
            "payload": 1500,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "RX 350L — 3.5L V6 (2018–2021)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "RX 450hL Hybrid (2018–2021)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "330 — 3.3L V6 (2005–2006)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "400h Hybrid — 3.3L Hybrid (2006–2008)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "350 — 3.5L V6 (2007–2009)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "350 — 3.5L V6 (2010–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "450h Hybrid — 3.5L Hybrid (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "F Sport — 3.5L V6 (2013–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 350L (2018–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 F Sport (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 (2010–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h Hybrid (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 F Sport (2013–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 (2016–2018 redesign)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 350L (2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h (2016–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "RX 350 F Sport (2016–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "RX Hybrid",
        "kind": "suv",
        "trims": [
          {
            "label": "350h — Hybrid",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 10200,
            "hitch": "Class III"
          },
          {
            "label": "450h+ — PHEV",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 10150,
            "hitch": "Class III"
          },
          {
            "label": "500h — Hybrid",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "400h — 3.3L Hybrid (2006–2008)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "450h — 3.5L Hybrid (2010–2015)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h F Sport (2018–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 450hL (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h (2010–2015)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h (2016–2018)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6650,
            "hitch": "Class III"
          },
          {
            "label": "RX 450h F Sport (2016–2018)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 6600,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "RZ",
        "kind": "suv",
        "trims": [
          {
            "label": "300e — FWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "450e — AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "TX",
        "kind": "suv",
        "trims": [
          {
            "label": "TX 350",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "TX 500h Hybrid",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 10000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "UX",
        "kind": "suv",
        "trims": [
          {
            "label": "250h — Hybrid",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "300h — Hybrid",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "UX 200 — 2.0L I4 (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "UX 250h Hybrid (2019–2021)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "UX 200 (2019–2021)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      }
    ]
  },
  {
    "name": "Acura",
    "models": [
      {
        "name": "ADX",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 1.5L Turbo",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "A-Spec — 1.5L Turbo",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "Advance — 1.5L Turbo",
            "maxTow": 0,
            "payload": 930,
            "gcwr": 5430,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "MDX",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.5L V6",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 10400,
            "hitch": "Class III"
          },
          {
            "label": "Technology — 3.5L V6",
            "maxTow": 5000,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class III"
          },
          {
            "label": "A-Spec — 3.5L V6",
            "maxTow": 5000,
            "payload": 1420,
            "gcwr": 11920,
            "hitch": "Class III"
          },
          {
            "label": "Advance — 3.5L V6",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class III"
          },
          {
            "label": "Type S — 3.0L Turbo V6",
            "maxTow": 5000,
            "payload": 1380,
            "gcwr": 11880,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2015–2020)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Technology — 3.5L V6 (2015–2020)",
            "maxTow": 3500,
            "payload": 1600,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Advance — 3.5L V6 (2015–2020)",
            "maxTow": 3500,
            "payload": 1550,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2021)",
            "maxTow": 3500,
            "payload": 1700,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "A-Spec — 3.5L V6 (2021)",
            "maxTow": 3500,
            "payload": 1650,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Advance — 3.5L V6 (2021)",
            "maxTow": 3500,
            "payload": 1650,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2005–2006)",
            "maxTow": 4500,
            "payload": 1300,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Touring — 3.5L V6 (2005–2006)",
            "maxTow": 4500,
            "payload": 1250,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L V6 (2007–2013)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Technology — 3.7L V6 (2007–2013)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Advance — 3.7L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2014–2015)",
            "maxTow": 3500,
            "payload": 1450,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Technology — 3.5L V6 (2014–2015)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Advance — 3.5L V6 (2014–2015)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 SH-AWD (2018–2020)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "Technology — 3.5L V6 SH-AWD (2018–2020)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "Advance — 3.5L V6 SH-AWD (2018–2020)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "A-Spec — 3.5L V6 SH-AWD (2019–2020)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2021 gen3)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "Technology — 3.5L V6 (2021)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8200,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.7L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          },
          {
            "label": "Technology — 3.7L V6 (2010–2013)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 SH-AWD (2014–2018 redesign)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          },
          {
            "label": "Technology — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1150,
            "gcwr": 8150,
            "hitch": "Class IV"
          },
          {
            "label": "Advance — 3.5L V6 (2014–2018)",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 8100,
            "hitch": "Class IV"
          },
          {
            "label": "Sport Hybrid SH-AWD (2017–2018)",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 6550,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "MDX Type S",
        "kind": "suv",
        "trims": [
          {
            "label": "Type S — 3.0L Turbo V6",
            "maxTow": 5000,
            "payload": 1380,
            "gcwr": 11880,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "RDX",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 7200,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1180,
            "gcwr": 7180,
            "hitch": "Class II"
          },
          {
            "label": "A-Spec — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 7150,
            "hitch": "Class II"
          },
          {
            "label": "Advance — 2.0L Turbo",
            "maxTow": 1500,
            "payload": 1120,
            "gcwr": 7120,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.5L V6 (2015–2018)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 3.5L V6 (2015–2018)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5500,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.0L Turbo (2019–2021)",
            "maxTow": 1500,
            "payload": 1450,
            "gcwr": 5800,
            "hitch": "Class II"
          },
          {
            "label": "A-Spec — 2.0L Turbo (2019–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5800,
            "hitch": "Class II"
          },
          {
            "label": "Advance — 2.0L Turbo (2019–2021)",
            "maxTow": 1500,
            "payload": 1400,
            "gcwr": 5800,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.3L Turbo (2007–2012)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Technology — 2.3L Turbo (2007–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Base — 3.5L V6 (2013–2015)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Technology — 3.5L V6 (2013–2015)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Base — 3.5L V6 (2018 last gen2)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 3.5L V6 (2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.0L Turbo SH-AWD (2019–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 2.0L Turbo (2019–2021)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.3L Turbo (2010–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 2.3L Turbo (2010–2012)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.5L V6 (2013–2018 redesign)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Technology — 3.5L V6 (2013–2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Advance — 3.5L V6 (2016–2018)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "ZDX",
        "kind": "suv",
        "trims": [
          {
            "label": "A-Spec — Dual Motor EV",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Type S — Dual Motor EV",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L V6 (2010–2013)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Technology — 3.7L V6 (2010–2013)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Advance — 3.7L V6 (2010–2013)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "Base — 3.7L V6 (2010–2013 last)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 4550,
            "hitch": "Class II"
          }
        ]
      }
    ]
  },
  {
    "name": "Infiniti",
    "models": [
      {
        "name": "FX35",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.5L V6 (2005–2008)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2009–2012)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2010–2012)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 3.5L V6 (2010–2012)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "FX45",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 4.5L V8 (2005–2008)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "FX50",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 5.0L V8 (2009–2013)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 5.0L V8 (2010–2013)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "JX35",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.5L V6 (2013)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2013 only, became QX60)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "QX30",
        "kind": "suv",
        "trims": [
          {
            "label": "Pure — 2.0L Turbo (2017–2019)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Luxe — 2.0L Turbo (2017–2019)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Pure — 2.0L Turbo (2018–2019)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Luxe — 2.0L Turbo (2018–2019)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 2.0L Turbo (2018–2019)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Pure — 2.0L Turbo (2017–2018 intro)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "Luxe — 2.0L Turbo (2017–2018)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 3900,
            "hitch": "N/A"
          },
          {
            "label": "Sport — 2.0L Turbo (2017–2018)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3850,
            "hitch": "N/A"
          },
          {
            "label": "Sport AWD (2017–2018)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 3850,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "QX50",
        "kind": "suv",
        "trims": [
          {
            "label": "Pure — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 9600,
            "hitch": "Class III"
          },
          {
            "label": "Luxe — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1080,
            "gcwr": 9580,
            "hitch": "Class III"
          },
          {
            "label": "Sensory — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 9550,
            "hitch": "Class III"
          },
          {
            "label": "Autograph — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1020,
            "gcwr": 9520,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.7L V6 (2015–2017)",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Luxe — 2.0L Turbo (2019–2021)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Essential — 2.0L Turbo (2019–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Sensory — 2.0L Turbo (2019–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4500,
            "hitch": "N/A"
          },
          {
            "label": "Pure — 2.0L VC-Turbo (2019–2021)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Luxe — 2.0L VC-Turbo (2019–2021)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Essential — 2.0L (2019–2021)",
            "maxTow": 3000,
            "payload": 1150,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Sensory — 2.0L (2019–2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Autograph — 2.0L (2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.7L V6 (ex-EX35 2010–2013 as EX)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Journey — 3.7L V6 (2014–2017 as QX50)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.0L VC-Turbo (2018 redesign)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Essential — 2.0L VC-Turbo (2018)",
            "maxTow": 3000,
            "payload": 1150,
            "gcwr": 6150,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "QX55",
        "kind": "suv",
        "trims": [
          {
            "label": "Luxe — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 9600,
            "hitch": "Class III"
          },
          {
            "label": "Essential — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1080,
            "gcwr": 9580,
            "hitch": "Class III"
          },
          {
            "label": "Sensory — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 9550,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "QX56",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 5.6L V8 (2005–2010)",
            "maxTow": 8900,
            "payload": 1500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2011–2013)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2010)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2011–2013 redesign)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "QX60",
        "kind": "suv",
        "trims": [
          {
            "label": "Pure — 2.0L Turbo",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 14400,
            "hitch": "Class IV"
          },
          {
            "label": "Luxe — 2.0L Turbo",
            "maxTow": 6000,
            "payload": 1380,
            "gcwr": 14380,
            "hitch": "Class IV"
          },
          {
            "label": "Sensory — 2.0L Turbo",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 14350,
            "hitch": "Class IV"
          },
          {
            "label": "Autograph — 2.0L Turbo",
            "maxTow": 6000,
            "payload": 1320,
            "gcwr": 14320,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2015–2020)",
            "maxTow": 5000,
            "payload": 1500,
            "gcwr": 9500,
            "hitch": "Class IV"
          },
          {
            "label": "Luxe — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1600,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Sensory — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1550,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Autograph — 3.5L V6 (2021)",
            "maxTow": 6000,
            "payload": 1550,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2014–2015)",
            "maxTow": 3500,
            "payload": 1350,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.5L Hybrid (2014–2015)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 8500,
            "hitch": "Class III"
          },
          {
            "label": "Base — 3.5L V6 (2018–2020)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Luxe — 3.5L V6 (2018–2020)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "Pure — 3.5L V6 (2021 redesign)",
            "maxTow": 6000,
            "payload": 1450,
            "gcwr": 9450,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.5L V6 (2013–2018 as JX/QX60)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Hybrid — 2.5L (2014–2017)",
            "maxTow": 3500,
            "payload": 1300,
            "gcwr": 6800,
            "hitch": "Class III"
          },
          {
            "label": "Premium / Technology (2013–2018)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "QX70",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.7L V6 (2015–2019)",
            "maxTow": 2000,
            "payload": 1400,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "S — 5.0L V8 (2015–2019)",
            "maxTow": 2000,
            "payload": 1350,
            "gcwr": 6000,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.7L V6 (2014–2015)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 6500,
            "hitch": "Class II"
          },
          {
            "label": "Base — 5.0L V8 (2014–2015)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.7L V6 (2018 last)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 5.0L V8 (2018 last)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.7L V6 (ex-FX 2010–2013 as FX35/37)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "FX50 — 5.0L V8 (2010–2013)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.7L V6 (2014–2017 as QX70)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "Limited — 5.0L V8 (2014–2017)",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 5150,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "QX80",
        "kind": "suv",
        "trims": [
          {
            "label": "Pure — 3.5L Twin-Turbo V6",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 17100,
            "hitch": "Class IV"
          },
          {
            "label": "Luxe — 3.5L Twin-Turbo V6",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 17050,
            "hitch": "Class IV"
          },
          {
            "label": "Sensory — 3.5L Twin-Turbo V6",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 17000,
            "hitch": "Class IV"
          },
          {
            "label": "Autograph — 3.5L Twin-Turbo V6",
            "maxTow": 8500,
            "payload": 1480,
            "gcwr": 16980,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2015–2021)",
            "maxTow": 8500,
            "payload": 1600,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Sensory — 5.6L V8 (2015–2021)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.6L V8 (2015–2021)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2014–2015)",
            "maxTow": 8500,
            "payload": 1550,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "Luxe — 5.6L V8 (2018–2021)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Premium Select — 5.6L V8 (2019–2021)",
            "maxTow": 8500,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class IV"
          },
          {
            "label": "Sensory — 5.6L V8 (2021)",
            "maxTow": 8500,
            "payload": 1400,
            "gcwr": 11900,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 5.6L V8 (2014–2018 rename)",
            "maxTow": 8500,
            "payload": 1500,
            "gcwr": 12000,
            "hitch": "Class IV"
          },
          {
            "label": "Limited — 5.6L V8 (2015–2018)",
            "maxTow": 8500,
            "payload": 1450,
            "gcwr": 11950,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Mitsubishi",
    "models": [
      {
        "name": "Eclipse Cross",
        "kind": "suv",
        "trims": [
          {
            "label": "ES — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "LE — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 960,
            "gcwr": 6960,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L Turbo",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 6950,
            "hitch": "Class II"
          },
          {
            "label": "ES — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 4800,
            "hitch": "Class II"
          },
          {
            "label": "LE — 1.5L Turbo (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "ES — 1.5L Turbo (2018 intro)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "LE — 1.5L Turbo (2018)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 1.5L Turbo (2018)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 1.5L Turbo (2018)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Endeavor",
        "kind": "suv",
        "trims": [
          {
            "label": "LS — 3.8L V6 (2005–2011)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.8L V6 (2005–2011)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Limited — 3.8L V6 (2005–2011)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "LS — 3.8L V6 (2010–2011 last)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "SE — 3.8L V6 (2010–2011)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Outlander",
        "kind": "suv",
        "trims": [
          {
            "label": "ES — 2.5L",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 7700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.5L",
            "maxTow": 2000,
            "payload": 1180,
            "gcwr": 7680,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.5L",
            "maxTow": 2000,
            "payload": 1150,
            "gcwr": 7650,
            "hitch": "Class II"
          },
          {
            "label": "GT — 2.5L",
            "maxTow": 2000,
            "payload": 1120,
            "gcwr": 7620,
            "hitch": "Class II"
          },
          {
            "label": "ES — 2.4L I4 (2015–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L I4 (2015–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L I4 (2015–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "GT — 3.0L V6 (2015–2020)",
            "maxTow": 3500,
            "payload": 1400,
            "gcwr": 7200,
            "hitch": "Class III"
          },
          {
            "label": "LS — 2.4L I4 (2007–2013)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "SE — 3.0L V6 (2007–2013)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "XLS — 3.0L V6 (2007–2013)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "GT — 3.0L V6 (2007–2013)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "ES — 2.4L I4 (2014–2015)",
            "maxTow": 1500,
            "payload": 1150,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "SE — 2.4L I4 (2014–2015)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 6000,
            "hitch": "Class I"
          },
          {
            "label": "GT — 3.0L V6 (2014–2015)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "ES — 2.4L (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L (2018–2021)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L / 3.0L (2018–2021)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "GT — 3.0L V6 (2018–2021)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "ES — 2.4L (2010–2013)",
            "maxTow": 2000,
            "payload": 1200,
            "gcwr": 5200,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L / 3.0L (2010–2013)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "GT — 3.0L V6 (2010–2013)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "ES — 2.4L (2014–2018 redesign)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.4L (2014–2018)",
            "maxTow": 1500,
            "payload": 1200,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L / 3.0L (2014–2018)",
            "maxTow": 3500,
            "payload": 1250,
            "gcwr": 6750,
            "hitch": "Class III"
          },
          {
            "label": "GT — 3.0L V6 (2014–2018)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Outlander PHEV",
        "kind": "suv",
        "trims": [
          {
            "label": "ES — PHEV",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 7100,
            "hitch": "Class II"
          },
          {
            "label": "SE — PHEV",
            "maxTow": 1500,
            "payload": 1080,
            "gcwr": 7080,
            "hitch": "Class II"
          },
          {
            "label": "SEL — PHEV",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 7050,
            "hitch": "Class II"
          },
          {
            "label": "SEL PHEV (2018–2021)",
            "maxTow": 1500,
            "payload": 1300,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "GT PHEV (2018–2021)",
            "maxTow": 1500,
            "payload": 1250,
            "gcwr": 5000,
            "hitch": "Class II"
          },
          {
            "label": "GT PHEV (2018 US intro)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          },
          {
            "label": "SEL PHEV (2018)",
            "maxTow": 1500,
            "payload": 1100,
            "gcwr": 4600,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Outlander Sport",
        "kind": "suv",
        "trims": [
          {
            "label": "ES — 2.0L",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L",
            "maxTow": 1500,
            "payload": 980,
            "gcwr": 6980,
            "hitch": "Class II"
          },
          {
            "label": "LE — 2.0L",
            "maxTow": 1500,
            "payload": 960,
            "gcwr": 6960,
            "hitch": "Class II"
          },
          {
            "label": "ES — 2.0L I4 (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SE — 2.0L I4 (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SEL — 2.4L I4 (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "ES — 2.0L I4 (2011–2015)",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "SE — 2.0L / 2.4L I4 (2011–2015)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "GT — 2.4L I4 (2013–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "ES — 2.0L / 2.4L (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L / 2.4L (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "SEL — 2.4L (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "ES — 2.0L (2011–2018 intro)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "SE — 2.0L / 2.4L (2011–2018)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "GT — 2.4L (2015–2018)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          }
        ]
      }
    ]
  },
  {
    "name": "MINI",
    "models": [
      {
        "name": "Countryman",
        "kind": "suv",
        "trims": [
          {
            "label": "Classic — 2.0L Turbo",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "Signature — 2.0L Turbo",
            "maxTow": 0,
            "payload": 940,
            "gcwr": 5440,
            "hitch": "—"
          },
          {
            "label": "JCW — 2.0L Turbo",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "SE ALL4 — Electric",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          },
          {
            "label": "Cooper (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper S (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper ALL4 (2015–2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "JCW (2015–2021)",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper — 1.6L I4 (2011–2015)",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper S — 1.6L Turbo (2011–2015)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper S ALL4 — 1.6L Turbo (2011–2015)",
            "maxTow": 0,
            "payload": 850,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "John Cooper Works — 1.6L Turbo (2013–2015)",
            "maxTow": 0,
            "payload": 800,
            "gcwr": 4000,
            "hitch": "N/A"
          },
          {
            "label": "Cooper ALL4 (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Cooper S ALL4 (2018–2021)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "John Cooper Works (2018–2021)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 4700,
            "hitch": "Class II"
          },
          {
            "label": "Cooper SE PHEV (2018–2021)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3200,
            "hitch": "N/A"
          },
          {
            "label": "Cooper (2011–2016 intro)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Cooper S (2011–2016)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Cooper S ALL4 (2011–2016)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "John Cooper Works (2013–2016)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Cooper ALL4 (2017–2018 redesign)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Cooper S ALL4 (2017–2018)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "John Cooper Works (2017–2018)",
            "maxTow": 1500,
            "payload": 950,
            "gcwr": 4500,
            "hitch": "Class II"
          },
          {
            "label": "Cooper SE PHEV (2018)",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 3950,
            "hitch": "N/A"
          }
        ]
      }
    ]
  },
  {
    "name": "Alfa Romeo",
    "models": [
      {
        "name": "Stelvio",
        "kind": "suv",
        "trims": [
          {
            "label": "Sprint — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 9600,
            "hitch": "Class III"
          },
          {
            "label": "Ti — 2.0L Turbo",
            "maxTow": 3000,
            "payload": 1080,
            "gcwr": 9580,
            "hitch": "Class III"
          },
          {
            "label": "Quadrifoglio — 2.9L Twin-Turbo",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "Sprint — 2.0L Turbo (2018–2021)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Ti — 2.0L Turbo (2018–2021)",
            "maxTow": 3000,
            "payload": 1300,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Quadrifoglio — 2.9L V6 (2018–2021)",
            "maxTow": 3000,
            "payload": 1200,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Sprint — 2.0L Turbo AWD (2018–2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Ti — 2.0L Turbo AWD (2018–2021)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6200,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.0L Turbo (2018 intro)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "Ti — 2.0L Turbo (2018)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 6100,
            "hitch": "Class II"
          },
          {
            "label": "Quadrifoglio — 2.9L V6 (2018)",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 6000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "Tonale",
        "kind": "suv",
        "trims": [
          {
            "label": "Sprint — 1.3L Turbo Hybrid",
            "maxTow": 2000,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Ti — 1.3L Turbo Hybrid",
            "maxTow": 2000,
            "payload": 980,
            "gcwr": 7480,
            "hitch": "Class II"
          },
          {
            "label": "Veloce — 1.3L Turbo Hybrid",
            "maxTow": 2000,
            "payload": 960,
            "gcwr": 7460,
            "hitch": "Class II"
          },
          {
            "label": "PHEV — 1.3L Turbo PHEV",
            "maxTow": 2000,
            "payload": 940,
            "gcwr": 7440,
            "hitch": "Class II"
          }
        ]
      }
    ]
  },
  {
    "name": "Jaguar",
    "models": [
      {
        "name": "E-Pace",
        "kind": "suv",
        "trims": [
          {
            "label": "P250 S — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 10518,
            "hitch": "Class III"
          },
          {
            "label": "P250 R-Dynamic S — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1020,
            "gcwr": 10488,
            "hitch": "Class III"
          },
          {
            "label": "P250 S (2018–2021)",
            "maxTow": 3968,
            "payload": 1250,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "P250 SE (2018–2021)",
            "maxTow": 3968,
            "payload": 1250,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "P300 R-Dynamic (2018–2021)",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 7168,
            "hitch": "Class III"
          },
          {
            "label": "P250 S (2018 intro)",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 7068,
            "hitch": "Class III"
          },
          {
            "label": "P250 SE (2018)",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 7068,
            "hitch": "Class III"
          },
          {
            "label": "P300 R-Dynamic (2018)",
            "maxTow": 3968,
            "payload": 1050,
            "gcwr": 7018,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "F-Pace",
        "kind": "suv",
        "trims": [
          {
            "label": "P250 S — 2.0L Turbo",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 13491,
            "hitch": "Class IV"
          },
          {
            "label": "P340 R-Dynamic S — 3.0L I6",
            "maxTow": 5291,
            "payload": 1180,
            "gcwr": 13471,
            "hitch": "Class IV"
          },
          {
            "label": "SVR — Supercharged V8",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 13391,
            "hitch": "Class IV"
          },
          {
            "label": "Prestige — 2.0L Turbo (2017–2021)",
            "maxTow": 5291,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "R-Sport (2017–2021)",
            "maxTow": 5291,
            "payload": 1400,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.0L V6 (2017–2021)",
            "maxTow": 5291,
            "payload": 1350,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "SVR (2019–2021)",
            "maxTow": 5291,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "20d / 25t (2018–2019)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "P250 S (2018–2021)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "P340 S (2018–2021)",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "P400 R-Dynamic (2021)",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "SVR (2018–2021)",
            "maxTow": 5291,
            "payload": 1050,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "20d / 25t (2017–2018 intro)",
            "maxTow": 5291,
            "payload": 1200,
            "gcwr": 8491,
            "hitch": "Class IV"
          },
          {
            "label": "35t Prestige (2017–2018)",
            "maxTow": 5291,
            "payload": 1150,
            "gcwr": 8441,
            "hitch": "Class IV"
          },
          {
            "label": "S (2017–2018)",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 8391,
            "hitch": "Class IV"
          },
          {
            "label": "First Edition (2017)",
            "maxTow": 5291,
            "payload": 1100,
            "gcwr": 8391,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "I-Pace",
        "kind": "suv",
        "trims": [
          {
            "label": "S — Dual Motor EV",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "HSE — Dual Motor EV",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "S EV (2019–2021)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "SE EV (2019–2021)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "HSE EV (2019–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4800,
            "hitch": "N/A"
          }
        ]
      }
    ]
  },
  {
    "name": "Maserati",
    "models": [
      {
        "name": "Grecale",
        "kind": "suv",
        "trims": [
          {
            "label": "GT — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1100,
            "gcwr": 10568,
            "hitch": "Class III"
          },
          {
            "label": "Modena — 2.0L Turbo",
            "maxTow": 3968,
            "payload": 1080,
            "gcwr": 10548,
            "hitch": "Class III"
          },
          {
            "label": "Trofeo — Twin-Turbo V6",
            "maxTow": 3968,
            "payload": 1000,
            "gcwr": 10468,
            "hitch": "Class III"
          },
          {
            "label": "Folgore — Dual Motor EV",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Levante",
        "kind": "suv",
        "trims": [
          {
            "label": "GT — Twin-Turbo V6",
            "maxTow": 5952,
            "payload": 1400,
            "gcwr": 14352,
            "hitch": "Class IV"
          },
          {
            "label": "Modena — Twin-Turbo V6",
            "maxTow": 5952,
            "payload": 1380,
            "gcwr": 14332,
            "hitch": "Class IV"
          },
          {
            "label": "Trofeo — Twin-Turbo V8",
            "maxTow": 5952,
            "payload": 1300,
            "gcwr": 14252,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.0L V6 (2017–2021)",
            "maxTow": 5952,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.0L V6 (2017–2021)",
            "maxTow": 5952,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "GTS — 3.8L V8 (2019–2021)",
            "maxTow": 5952,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.0L Twin-Turbo (2018–2021)",
            "maxTow": 5952,
            "payload": 1200,
            "gcwr": 9152,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.0L Twin-Turbo (2018–2021)",
            "maxTow": 5952,
            "payload": 1150,
            "gcwr": 9152,
            "hitch": "Class IV"
          },
          {
            "label": "GTS — 3.8L Twin-Turbo (2019–2021)",
            "maxTow": 5952,
            "payload": 1100,
            "gcwr": 9152,
            "hitch": "Class IV"
          },
          {
            "label": "Trofeo — 3.8L Twin-Turbo (2019–2021)",
            "maxTow": 5952,
            "payload": 1050,
            "gcwr": 9152,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.0L Twin-Turbo (2017–2018 intro)",
            "maxTow": 5952,
            "payload": 1200,
            "gcwr": 9152,
            "hitch": "Class IV"
          },
          {
            "label": "S — 3.0L Twin-Turbo (2017–2018)",
            "maxTow": 5952,
            "payload": 1150,
            "gcwr": 9102,
            "hitch": "Class IV"
          },
          {
            "label": "GranLusso / GranSport (2017–2018)",
            "maxTow": 5952,
            "payload": 1150,
            "gcwr": 9102,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Genesis",
    "models": [
      {
        "name": "Electrified GV70",
        "kind": "suv",
        "trims": [
          {
            "label": "Standard — Dual Motor",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 5600,
            "hitch": "—"
          },
          {
            "label": "Advanced — Dual Motor",
            "maxTow": 0,
            "payload": 1050,
            "gcwr": 5550,
            "hitch": "—"
          },
          {
            "label": "Performance — Dual Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "Electrified GV80",
        "kind": "suv",
        "trims": [
          {
            "label": "Standard — Dual Motor",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          },
          {
            "label": "Advanced — Dual Motor",
            "maxTow": 0,
            "payload": 1150,
            "gcwr": 5650,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "GV60",
        "kind": "suv",
        "trims": [
          {
            "label": "Standard — RWD",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Advanced — AWD",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Performance — AWD",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "GV70",
        "kind": "suv",
        "trims": [
          {
            "label": "2.5T",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "3.5T Sport",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "GV80",
        "kind": "suv",
        "trims": [
          {
            "label": "2.5T",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "3.5T",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 11000,
            "hitch": "Class III"
          },
          {
            "label": "2.5T (2021)",
            "maxTow": 6000,
            "payload": 1600,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "3.5T (2021)",
            "maxTow": 6000,
            "payload": 1550,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "3.5T Prestige (2021)",
            "maxTow": 6000,
            "payload": 1550,
            "gcwr": 11000,
            "hitch": "Class IV"
          },
          {
            "label": "2.5T AWD (2021 intro)",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 9400,
            "hitch": "Class IV"
          },
          {
            "label": "3.5T AWD (2021)",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 9350,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "GV80 Coupe",
        "kind": "suv",
        "trims": [
          {
            "label": "3.5T — Twin-Turbo V6",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 14400,
            "hitch": "Class IV"
          },
          {
            "label": "3.5T e-Supercharger — Electrified",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 14350,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Rivian",
    "models": [
      {
        "name": "R1T",
        "kind": "truck",
        "trims": [
          {
            "label": "Dual Motor Standard — AWD",
            "maxTow": 7700,
            "payload": 1760,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Dual Motor Large — AWD",
            "maxTow": 7700,
            "payload": 1760,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Dual Motor Max — AWD",
            "maxTow": 7700,
            "payload": 1760,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Tri Motor — AWD Performance",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "Quad Motor — AWD Max Performance",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13500,
            "hitch": "Class IV"
          },
          {
            "label": "R1T Adventure Dual Motor",
            "maxTow": 7700,
            "payload": 1760,
            "gcwr": 13500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R1S",
        "kind": "suv",
        "trims": [
          {
            "label": "Dual-Motor AWD",
            "maxTow": 7700,
            "payload": 1760,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Tri-Motor AWD",
            "maxTow": 7700,
            "payload": 1700,
            "gcwr": 14000,
            "hitch": "Class IV"
          },
          {
            "label": "Quad-Motor AWD",
            "maxTow": 7700,
            "payload": 1600,
            "gcwr": 13800,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R1S Dual Motor",
        "kind": "suv",
        "trims": [
          {
            "label": "Dual Motor AWD",
            "maxTow": 7700,
            "payload": 1400,
            "gcwr": 16100,
            "hitch": "Class IV"
          },
          {
            "label": "Dual Motor Max Pack",
            "maxTow": 7700,
            "payload": 1350,
            "gcwr": 16050,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R1S Quad-Motor",
        "kind": "suv",
        "trims": [
          {
            "label": "Quad-Motor AWD",
            "maxTow": 7700,
            "payload": 1250,
            "gcwr": 15950,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R1S Tri-Motor",
        "kind": "suv",
        "trims": [
          {
            "label": "Tri-Motor AWD",
            "maxTow": 7700,
            "payload": 1300,
            "gcwr": 16000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "R2",
        "kind": "suv",
        "trims": [
          {
            "label": "Dual Motor AWD",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Tri-Motor AWD",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Tesla",
    "models": [
      {
        "name": "Cybertruck",
        "kind": "truck",
        "trims": [
          {
            "label": "Rear-Wheel Drive — Single Motor",
            "maxTow": 7500,
            "payload": 2500,
            "gcwr": 14500,
            "hitch": "Class IV"
          },
          {
            "label": "All-Wheel Drive — Dual Motor",
            "maxTow": 11000,
            "payload": 2500,
            "gcwr": 17500,
            "hitch": "Class IV"
          },
          {
            "label": "Cyberbeast — Tri Motor",
            "maxTow": 11000,
            "payload": 2500,
            "gcwr": 17500,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Model X",
        "kind": "suv",
        "trims": [
          {
            "label": "Model X AWD",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "Model X Plaid",
            "maxTow": 5000,
            "payload": 1100,
            "gcwr": 10000,
            "hitch": "Class III"
          },
          {
            "label": "75D (2016–2019)",
            "maxTow": 0,
            "payload": 1400,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "100D (2017–2019)",
            "maxTow": 0,
            "payload": 1400,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "P100D (2016–2019)",
            "maxTow": 0,
            "payload": 1350,
            "gcwr": 5000,
            "hitch": "N/A"
          },
          {
            "label": "Long Range (2019–2021)",
            "maxTow": 0,
            "payload": 1450,
            "gcwr": 5200,
            "hitch": "N/A"
          },
          {
            "label": "Plaid (2021)",
            "maxTow": 0,
            "payload": 1400,
            "gcwr": 5200,
            "hitch": "N/A"
          },
          {
            "label": "75D (2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "100D (2018–2019)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "P100D (2018–2019)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "Performance (2019–2021)",
            "maxTow": 5000,
            "payload": 1350,
            "gcwr": 8350,
            "hitch": "Class IV"
          },
          {
            "label": "90D (2016–2017 intro)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "100D (2017–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "P90D (2016–2017)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "P100D (2017–2018)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          },
          {
            "label": "75D (2016–2018)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Model X Long Range",
        "kind": "suv",
        "trims": [
          {
            "label": "Long Range — Dual Motor",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 11800,
            "hitch": "Class III"
          },
          {
            "label": "Long Range (2019–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          },
          {
            "label": "Long Range Plus (2020–2021)",
            "maxTow": 5000,
            "payload": 1400,
            "gcwr": 8400,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Model X Plaid",
        "kind": "suv",
        "trims": [
          {
            "label": "Plaid — Tri-Motor",
            "maxTow": 5000,
            "payload": 1200,
            "gcwr": 11700,
            "hitch": "Class III"
          },
          {
            "label": "Plaid (2021)",
            "maxTow": 5000,
            "payload": 1300,
            "gcwr": 8300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Model Y",
        "kind": "suv",
        "trims": [
          {
            "label": "Long Range AWD",
            "maxTow": 3500,
            "payload": 1000,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Performance",
            "maxTow": 3500,
            "payload": 950,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Long Range AWD (2020–2021)",
            "maxTow": 0,
            "payload": 1300,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "Performance (2020–2021)",
            "maxTow": 0,
            "payload": 1250,
            "gcwr": 4800,
            "hitch": "N/A"
          },
          {
            "label": "Standard Range (2021)",
            "maxTow": 0,
            "payload": 1100,
            "gcwr": 3200,
            "hitch": "N/A"
          }
        ]
      },
      {
        "name": "Model Y Performance",
        "kind": "suv",
        "trims": [
          {
            "label": "Performance — Dual Motor",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "Performance (2020–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Performance AWD (2020–2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Performance (2021)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 6700,
            "hitch": "Class III"
          }
        ]
      }
    ]
  },
  {
    "name": "Scout",
    "models": [
      {
        "name": "Terra",
        "kind": "truck",
        "trims": [
          {
            "label": "Base — Dual Motor EV (est.)",
            "maxTow": 7000,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "Range-Extender — Dual Motor (est.)",
            "maxTow": 7000,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Traveler",
        "kind": "suv",
        "trims": [
          {
            "label": "Electric — Dual Motor",
            "maxTow": 7000,
            "payload": 1400,
            "gcwr": 15400,
            "hitch": "Class IV"
          },
          {
            "label": "Range Extender — Hybrid",
            "maxTow": 7000,
            "payload": 1450,
            "gcwr": 15450,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Fisker",
    "models": [
      {
        "name": "Ocean",
        "kind": "suv",
        "trims": [
          {
            "label": "Sport — Single Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Ultra — Dual Motor",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          },
          {
            "label": "Extreme — Dual Motor",
            "maxTow": 0,
            "payload": 960,
            "gcwr": 5460,
            "hitch": "—"
          },
          {
            "label": "One — Dual Motor",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          }
        ]
      }
    ]
  },
  {
    "name": "Lucid",
    "models": [
      {
        "name": "Gravity",
        "kind": "suv",
        "trims": [
          {
            "label": "Touring — Dual Motor",
            "maxTow": 6000,
            "payload": 1400,
            "gcwr": 14400,
            "hitch": "Class IV"
          },
          {
            "label": "Grand Touring — Dual Motor",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 14350,
            "hitch": "Class IV"
          },
          {
            "label": "Dream Edition — Dual Motor",
            "maxTow": 6000,
            "payload": 1300,
            "gcwr": 14300,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "Gravity Grand Touring",
        "kind": "suv",
        "trims": [
          {
            "label": "Grand Touring — Dual Motor",
            "maxTow": 6000,
            "payload": 1350,
            "gcwr": 14350,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Polestar",
    "models": [
      {
        "name": "Polestar 3",
        "kind": "suv",
        "trims": [
          {
            "label": "Long Range Dual Motor",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 10100,
            "hitch": "Class III"
          },
          {
            "label": "Performance Pack",
            "maxTow": 3500,
            "payload": 1050,
            "gcwr": 10050,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Polestar 4",
        "kind": "suv",
        "trims": [
          {
            "label": "Long Range Single Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Long Range Dual Motor",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          }
        ]
      }
    ]
  },
  {
    "name": "VinFast",
    "models": [
      {
        "name": "VF 6",
        "kind": "suv",
        "trims": [
          {
            "label": "Eco — Single Motor",
            "maxTow": 0,
            "payload": 900,
            "gcwr": 5400,
            "hitch": "—"
          },
          {
            "label": "Plus — Single Motor",
            "maxTow": 0,
            "payload": 880,
            "gcwr": 5380,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "VF 7",
        "kind": "suv",
        "trims": [
          {
            "label": "Eco — Single Motor",
            "maxTow": 0,
            "payload": 950,
            "gcwr": 5450,
            "hitch": "—"
          },
          {
            "label": "Plus — Dual Motor",
            "maxTow": 0,
            "payload": 920,
            "gcwr": 5420,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "VF 8",
        "kind": "suv",
        "trims": [
          {
            "label": "Eco — Dual Motor",
            "maxTow": 0,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "—"
          },
          {
            "label": "Plus — Dual Motor",
            "maxTow": 0,
            "payload": 980,
            "gcwr": 5480,
            "hitch": "—"
          }
        ]
      },
      {
        "name": "VF 9",
        "kind": "suv",
        "trims": [
          {
            "label": "Eco — Dual Motor",
            "maxTow": 0,
            "payload": 1200,
            "gcwr": 5700,
            "hitch": "—"
          },
          {
            "label": "Plus — Dual Motor",
            "maxTow": 0,
            "payload": 1180,
            "gcwr": 5680,
            "hitch": "—"
          }
        ]
      }
    ]
  },
  {
    "name": "Hummer",
    "models": [
      {
        "name": "H3T",
        "kind": "truck",
        "trims": [
          {
            "label": "Base — 3.7L I5 (2009–2010)",
            "maxTow": 4400,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Alpha — 5.3L V8 (2009–2010)",
            "maxTow": 5900,
            "payload": 1150,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "Base — 3.7L I5 (2010 last)",
            "maxTow": 5900,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          },
          {
            "label": "Alpha — 5.3L V8 (2010 last)",
            "maxTow": 5900,
            "payload": 1050,
            "gcwr": 9100,
            "hitch": "Class IV"
          },
          {
            "label": "Adventure — 3.7L I5 (2010)",
            "maxTow": 5900,
            "payload": 1100,
            "gcwr": 9100,
            "hitch": "Class IV"
          },
          {
            "label": "Luxury — 5.3L V8 (2010)",
            "maxTow": 5900,
            "payload": 1050,
            "gcwr": 9100,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "H2",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 6.0L / 6.2L V8 (2005–2009)",
            "maxTow": 6700,
            "payload": 1600,
            "gcwr": 13000,
            "hitch": "Class IV"
          },
          {
            "label": "SUT — 6.0L / 6.2L V8 (2005–2009)",
            "maxTow": 6700,
            "payload": 1550,
            "gcwr": 13000,
            "hitch": "Class IV"
          }
        ]
      },
      {
        "name": "H3",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 3.5L / 3.7L I5 (2006–2010)",
            "maxTow": 4500,
            "payload": 1150,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Adventure — 3.7L I5 (2006–2010)",
            "maxTow": 4500,
            "payload": 1100,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.7L I5 (2006–2010)",
            "maxTow": 4500,
            "payload": 1050,
            "gcwr": 9000,
            "hitch": "Class III"
          },
          {
            "label": "Alpha — 5.3L V8 (2008–2010)",
            "maxTow": 6000,
            "payload": 1200,
            "gcwr": 10500,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Isuzu",
    "models": [
      {
        "name": "Ascender",
        "kind": "suv",
        "trims": [
          {
            "label": "S — 4.2L I6 (2005–2008)",
            "maxTow": 6200,
            "payload": 1150,
            "gcwr": 10500,
            "hitch": "Class IV"
          },
          {
            "label": "LS — 5.3L V8 (2005–2006)",
            "maxTow": 6800,
            "payload": 1200,
            "gcwr": 11500,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Saturn",
    "models": [
      {
        "name": "Outlook",
        "kind": "suv",
        "trims": [
          {
            "label": "XE — 3.6L V6 (2007–2010)",
            "maxTow": 4500,
            "payload": 1400,
            "gcwr": 9500,
            "hitch": "Class III"
          },
          {
            "label": "XR — 3.6L V6 (2007–2010)",
            "maxTow": 4500,
            "payload": 1350,
            "gcwr": 9500,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Vue",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.2L / 2.4L I4 (2005–2007)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          },
          {
            "label": "Red Line — 3.5L V6 (2005–2007)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "XE — 2.4L I4 (2008–2010)",
            "maxTow": 1500,
            "payload": 1050,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "XR — 3.6L V6 (2008–2010)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.4L Hybrid (2007–2009)",
            "maxTow": 1000,
            "payload": 1000,
            "gcwr": 5000,
            "hitch": "Class I"
          }
        ]
      }
    ]
  },
  {
    "name": "Suzuki",
    "models": [
      {
        "name": "Grand Vitara",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.7L V6 (2005)",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Base — 2.4L / 3.2L (2006–2013)",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 7000,
            "hitch": "Class II"
          },
          {
            "label": "Luxury — 3.2L V6 (2009–2013)",
            "maxTow": 3000,
            "payload": 1000,
            "gcwr": 7000,
            "hitch": "Class II"
          }
        ]
      },
      {
        "name": "XL-7",
        "kind": "suv",
        "trims": [
          {
            "label": "Base — 2.7L V6 (2005–2006)",
            "maxTow": 3000,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Luxury — 2.7L V6 (2005–2006)",
            "maxTow": 3000,
            "payload": 1050,
            "gcwr": 7500,
            "hitch": "Class II"
          },
          {
            "label": "Base — 3.6L V6 (2007–2009)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 8000,
            "hitch": "Class III"
          },
          {
            "label": "Luxury — 3.6L V6 (2007–2009)",
            "maxTow": 3500,
            "payload": 1150,
            "gcwr": 8000,
            "hitch": "Class III"
          }
        ]
      },
      {
        "name": "Equator",
        "kind": "truck",
        "trims": [
          {
            "label": "Base — 2.5L I4 (2010–2012)",
            "maxTow": 3500,
            "payload": 1200,
            "gcwr": 6700,
            "hitch": "Class III"
          },
          {
            "label": "Premium — 4.0L V6 (2010–2012)",
            "maxTow": 6500,
            "payload": 1400,
            "gcwr": 9900,
            "hitch": "Class IV"
          },
          {
            "label": "Sport — 4.0L V6 (2010–2012)",
            "maxTow": 6500,
            "payload": 1350,
            "gcwr": 9850,
            "hitch": "Class IV"
          },
          {
            "label": "RMZ-4 Off-Road — 4.0L V6 (2010–2012)",
            "maxTow": 6300,
            "payload": 1300,
            "gcwr": 9600,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  },
  {
    "name": "Mercury",
    "models": [
      {
        "name": "Mariner",
        "kind": "suv",
        "trims": [
          {
            "label": "Convenience — 2.3L / 2.5L I4 (2005–2010)",
            "maxTow": 1500,
            "payload": 1000,
            "gcwr": 5500,
            "hitch": "Class I"
          },
          {
            "label": "Premier — 3.0L V6 (2005–2010)",
            "maxTow": 3500,
            "payload": 1100,
            "gcwr": 7500,
            "hitch": "Class III"
          },
          {
            "label": "Hybrid — 2.3L / 2.5L Hybrid (2006–2010)",
            "maxTow": 1000,
            "payload": 950,
            "gcwr": 5000,
            "hitch": "Class I"
          }
        ]
      },
      {
        "name": "Mountaineer",
        "kind": "suv",
        "trims": [
          {
            "label": "Convenience — 4.0L V6 (2005–2010)",
            "maxTow": 5300,
            "payload": 1300,
            "gcwr": 10000,
            "hitch": "Class IV"
          },
          {
            "label": "Premier — 4.6L V8 (2005–2010)",
            "maxTow": 7100,
            "payload": 1350,
            "gcwr": 12000,
            "hitch": "Class IV"
          }
        ]
      }
    ]
  }
];

export const TOW_MAKE_NAMES = TOW_MAKES.map((m) => m.name);

export function getMake(name: string): TowMake | undefined {
  return TOW_MAKES.find((m) => m.name === name);
}

export function getModels(
  make: string,
  kind: VehicleKind | "all" = "all",
): TowModel[] {
  const m = getMake(make);
  if (!m) return [];
  if (kind === "all") return m.models;
  return m.models.filter((x) => x.kind === kind);
}

export function getModel(make: string, model: string): TowModel | undefined {
  return getMake(make)?.models.find((x) => x.name === model);
}

export function getTrims(make: string, model: string): TowTrim[] {
  return getModel(make, model)?.trims ?? [];
}

export function getRating(
  make: string,
  model: string,
  trimLabel: string,
): TowRating {
  const mod = getModel(make, model);
  const trim = mod?.trims.find((x) => x.label === trimLabel) ?? mod?.trims[0];
  if (!trim || !mod) {
    return {
      label: "Unknown",
      maxTow: 5000,
      payload: 1200,
      gcwr: 9000,
      hitch: "Class III",
      kind: "truck",
    };
  }
  return { ...trim, kind: mod.kind };
}

export function makesForKind(kind: VehicleKind | "all"): string[] {
  if (kind === "all") return TOW_MAKE_NAMES;
  return TOW_MAKES.filter((m) => m.models.some((x) => x.kind === kind)).map(
    (m) => m.name,
  );
}
