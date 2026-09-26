/**
 * Entegra Coach lot-record fills from the RV Country scrape dated
 * 2026-09-25 (public/inventory/own-lot-latest.json).
 *
 * Anthem, Odyssey, and Odyssey SE only. One row per year + model +
 * floorplan. Not an OEM brochure pin. Unflagged numbers fill holes
 * (empty cells, floorplan-digit lengths, and the series lengthRange
 * fallback). overridesCatalog is only for a lot value that beats a
 * non-OEM catalog number (series seed / sleeps / slides / tank default /
 * range / estimate). precedence is factoryFirst: a flagged lot value
 * loses to an OEM pin, OEM floorplan row, or brochure value, and still
 * beats a series seed or the series lengthRange fallback. When the lot
 * disagrees with OEM or a dated manufacturer value for that coach, the
 * lot number stays in sourceNote as a cross-check.
 */

import type { LotCatalogSeedRow } from "./lotCatalogSeed.ts";

export type EntegraLotSeedRow = LotCatalogSeedRow & {
  sourceNote: string;
};

export const ENTEGRA_LOT_SEED: EntegraLotSeedRow[] = [
  {
    year: 2025,
    make: "Entegra Coach",
    model: "Anthem",
    trim: "37K",
    title: "2025 Entegra Coach Anthem 37K",
    stock_number: "44497",
    vehicle_body_length: 38.17,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Length (ft) · id 36556 / stock 44497 · Fills hole: Length 38.17 ft replaces series lengthRange fallback 43' 6\" (rvData Anthem lengthRange [42, 45] midpoint; no OEM length row). Cross-check only (OEM wins): lot GVWR 41,000 lb does not replace OEM pin 44,000 lb (OEM_GVWR_PINS, Entegra Anthem 37K, model years 2024–2025, dated RVUSA Anthem brochures).",
  },
  {
    year: 2017,
    make: "Entegra Coach",
    model: "Anthem",
    trim: "44DLQ",
    title: "2017 Entegra Coach Anthem 44DLQ",
    stock_number: "UPB9838",
    max_sleeping_count: 8,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Sleeps · id 196779 / stock UPB9838 · Overrides catalog: Sleeps 8 replaces 6 (rvData series seed)",
  },
  // Odyssey — bare E-450. Not Odyssey SE.
  {
    year: 2026,
    make: "Entegra Coach",
    model: "Odyssey",
    trim: "29V",
    title: "2026 Entegra Coach Odyssey 29V",
    stock_number: "46573",
    vehicle_body_length: 32.5,
    total_fresh_water_tank_capacity: 47,
    total_gray_water_tank_capacity: 41,
    total_black_water_tank_capacity: 32,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Length (ft), Fresh (gal), Gray (gal), Black (gal) · id 99347 / stock 46573 · Fills hole: Length 32.5 ft replaces floorplan-digit estimate 29' 10\". Fills hole: Fresh 47 gal, Gray 41 gal, Black 32 gal (no OEM tank pin; MY25–27 tanks are GAP in rvData). Cross-check (agrees, not stored): lot GVWR 14,500 lb matches OEM pin 14,500 lb (OEM_GVWR_PINS, Entegra Odyssey 29V, model years 2025–2026). GAP (not stored): slides 0 is the scrape of raw Number of Slideouts \"None\", not a printed zero. Sleeps was empty.",
  },
  {
    year: 2027,
    make: "Entegra Coach",
    model: "Odyssey",
    trim: "24B",
    title: "2027 Entegra Coach Odyssey 24B",
    stock_number: "47594 / 47595 / 47596 / 47597",
    gvwr: 14500,
    vehicle_body_length: 26.67,
    max_sleeping_count: 6,
    total_fresh_water_tank_capacity: 42.5,
    total_gray_water_tank_capacity: 40,
    total_black_water_tank_capacity: 31,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · GVWR, Length (ft), Fresh (gal), Gray (gal), Black (gal), Sleeps · id 179022 / stock 47594; id 179024 / stock 47595; id 179023 / stock 47596; id 179025 / stock 47597 · Fills hole: GVWR 14,500 lb (no OEM pin for 2027; OEM_GVWR_PINS covers Odyssey 24B for 2025–2026 only). Fills hole: Length 26.67 ft replaces floorplan-digit estimate 24' 10\". Fills hole: Fresh 42.5 gal, Gray 40 gal, Black 31 gal (no OEM tank pin for 2027). Overrides catalog: Sleeps 6 replaces 8 (rvData series seed). Slides 1 agrees with the series seed and is not stored.",
  },
  {
    year: 2027,
    make: "Entegra Coach",
    model: "Odyssey",
    trim: "30Z",
    title: "2027 Entegra Coach Odyssey 30Z",
    stock_number: "47588 / 47589 / 47590",
    gvwr: 14500,
    vehicle_body_length: 32.5,
    max_sleeping_count: 7,
    number_of_slideouts: 2,
    total_fresh_water_tank_capacity: 43.5,
    total_gray_water_tank_capacity: 41,
    total_black_water_tank_capacity: 31,
    propane_lbs: 41,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
      number_of_slideouts: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · GVWR, Length (ft), Fresh (gal), Gray (gal), Black (gal), Propane (lb), Sleeps, Slides · id 179013 / stock 47588; id 179016 / stock 47589; id 179018 / stock 47590 · Fills hole: GVWR 14,500 lb (no OEM pin for 2027; OEM_GVWR_PINS covers Odyssey 30Z for 2025–2026 only). Fills hole: Length 32.5 ft replaces floorplan-digit estimate 30' 0\". Fills hole: Fresh 43.5 gal, Gray 41 gal, Black 31 gal (no OEM tank pin for 2027). Fills hole: Propane 41 lb (no OEM propane). Overrides catalog: Sleeps 7 replaces 8 (rvData series seed); Slides 2 replaces 1 (rvData series seed).",
  },
  // Odyssey SE — not bare Odyssey. 2027 22CF dated GVWR and tanks stay OEM.
  {
    year: 2025,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "22CF",
    title: "2025 Entegra Coach Odyssey SE 22CF",
    stock_number: "UPS9877",
    gvwr: 12500,
    vehicle_body_length: 24.67,
    max_sleeping_count: 6,
    total_fresh_water_tank_capacity: 43.5,
    total_gray_water_tank_capacity: 40,
    total_black_water_tank_capacity: 31,
    propane_lbs: 41,
    propane_gal: 12.2,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
      total_fresh_water_tank_capacity: true,
      total_gray_water_tank_capacity: true,
      total_black_water_tank_capacity: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · GVWR, Length (ft), Fresh (gal), Gray (gal), Black (gal), Propane (lb), Propane (gal), Sleeps · id 206899 / stock UPS9877 · Fills hole: GVWR 12,500 lb (no OEM pin; the dated 12,500 band is 2027 22CF only). Fills hole: Length 24.67 ft replaces floorplan-digit estimate 22' 10\". Fills hole: Propane 41 lb / 12.2 gal (no OEM propane). Overrides catalog: Fresh 43.5 gal replaces 40 gal (rvData series seed); Gray 40 gal replaces 28 gal (rvData series seed); Black 31 gal replaces 28 gal (rvData series seed); Sleeps 6 replaces 7 (rvData series seed). Slides 1 agrees with the series seed and is not stored.",
  },
  {
    year: 2026,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "22A",
    title: "2026 Entegra Coach Odyssey SE 22A",
    stock_number: "46393",
    total_fresh_water_tank_capacity: 43.5,
    total_gray_water_tank_capacity: 40,
    total_black_water_tank_capacity: 32,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      total_fresh_water_tank_capacity: true,
      total_gray_water_tank_capacity: true,
      total_black_water_tank_capacity: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Fresh (gal), Gray (gal), Black (gal) · id 95965 / stock 46393 · Overrides catalog: Fresh 43.5 gal replaces 40 gal (rvData series seed); Gray 40 gal replaces 28 gal (rvData series seed); Black 32 gal replaces 28 gal (rvData series seed). GAP (not stored): GVWR 14,200 lb and length 25.33 ft disagree with the aliased 22AF row (12,500 lb, 24.75 ft). The lot matcher treats 22A and 22AF as one token, same rule as 27A / 27ASE, so a disagreeing number is not stored. Slides 0 is the scrape of raw Number of Slideouts \"None\", not a printed zero. Sleeps was empty.",
  },
  {
    year: 2026,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "22AF",
    title: "2026 Entegra Coach Odyssey SE 22AF",
    stock_number: "46225",
    total_fresh_water_tank_capacity: 43.5,
    total_gray_water_tank_capacity: 40,
    total_black_water_tank_capacity: 32,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      total_fresh_water_tank_capacity: true,
      total_gray_water_tank_capacity: true,
      total_black_water_tank_capacity: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Fresh (gal), Gray (gal), Black (gal) · id 92975 / stock 46225 · Overrides catalog: Fresh 43.5 gal replaces 40 gal (rvData series seed); Gray 40 gal replaces 28 gal (rvData series seed); Black 32 gal replaces 28 gal (rvData series seed). GAP (not stored): GVWR 12,500 lb and length 24.75 ft disagree with the aliased 22A row (14,200 lb, 25.33 ft), so neither coach keeps them. Sleeps 6 and propane 41 lb / 12.2 gal are printed only on 22AF; storing them would also fill 22A, which left those fields empty. Slides 1 agrees with the series seed.",
  },
  {
    year: 2027,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "20LF",
    title: "2027 Entegra Coach Odyssey SE 20LF",
    stock_number: "47585 / 47586 / 47587",
    gvwr: 12500,
    vehicle_body_length: 21.92,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · GVWR, Length (ft) · id 179006 / stock 47585; id 179017 / stock 47586; id 179014 / stock 47587 · Fills hole: GVWR 12,500 lb (no OEM pin; the dated 12,500 band is 22CF only and does not match 20LF). Fills hole: Length 21.92 ft replaces floorplan-digit estimate 22' 0\" (20 clamped up to the series lengthRange low). GAP (not stored): slides 0 is the scrape of raw Number of Slideouts \"None\", not a printed zero. Sleeps was empty. Structured tanks were empty (raw second column was not copied).",
  },
  {
    year: 2027,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "22C",
    title: "2027 Entegra Coach Odyssey SE 22C",
    stock_number: "47664",
    max_sleeping_count: 6,
    propane_lbs: 41,
    propane_gal: 12.2,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Propane (lb), Propane (gal), Sleeps · id 195619 / stock 47664 · Fills hole: Propane 41 lb / 12.2 gal (no OEM propane). Overrides catalog: Sleeps 6 replaces 7 (rvData series seed). Cross-check only (dated manufacturer value wins): lot GVWR 14,200 lb does not replace 12,500 lb (rvData 2027 Odyssey SE 22CF powertrain band, which brochureSpecs also paints on 22C). Tanks 43.5/40/31 match that same band and are not stored. GAP (not stored): length 25.33 ft disagrees with the aliased 22CF length 24.67 ft, so neither is stored. Dry weight 20,000 lb is at or above GVWR and a round placeholder. Hitch weight 5,000 lb is a round placeholder.",
  },
  {
    year: 2027,
    make: "Entegra Coach",
    model: "Odyssey SE",
    trim: "22CF",
    title: "2027 Entegra Coach Odyssey SE 22CF",
    stock_number: "47619 / 47620 / 47648",
    max_sleeping_count: 6,
    propane_lbs: 41,
    propane_gal: 12.2,
    source: "RV Country lot unit record",
    precedence: "factoryFirst",
    overridesCatalog: {
      max_sleeping_count: true,
    },
    sourceNote:
      "public/inventory/own-lot-latest.json · scraped 2026-09-25 · Propane (lb), Propane (gal), Sleeps · id 184423 / stock 47619; id 184424 / stock 47620; id 194426 / stock 47648 · Fills hole: Propane 41 lb / 12.2 gal (no OEM propane). Overrides catalog: Sleeps 6 replaces 7 (rvData series seed). Cross-check (agrees, not stored): GVWR 12,500 lb and tanks 43.5/40/31 match the dated 2027 Odyssey SE 22CF powertrain band. Slides 1 agrees with the series seed and is not stored. GAP (not stored): length 24.67 ft disagrees with the aliased 22C length 25.33 ft. UVW/dry 10,152 lb is not stored because that alias would also paint 22C, whose own dry weight is the invalid 20,000 lb. Hitch weight 5,000 lb is a round placeholder.",
  },
];
