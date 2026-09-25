/**
 * Printed RV Country / Coast unit records used to fill empty catalog fields.
 * Not OEM brochure pins. 0 / missing fields omitted. Propane only when
 * the unit record printed lb or gal.
 */

export type LotCatalogSeedRow = {
  year: number;
  make: string;
  model: string;
  trim: string;
  title: string;
  stock_number: string;
  gvwr?: number;
  dry_weight?: number;
  hitch_weight?: number;
  payload?: number;
  vehicle_body_length?: number;
  vehicle_body_height?: number;
  vehicle_body_width?: number;
  max_sleeping_count?: number;
  number_of_slideouts?: number;
  total_fresh_water_tank_capacity?: number;
  total_gray_water_tank_capacity?: number;
  total_black_water_tank_capacity?: number;
  propane_lbs?: number;
  propane_gal?: number;
  source: "RV Country lot unit record";
};

export const LOT_CATALOG_SEED: LotCatalogSeedRow[] = [
  {
    year: 2026,
    make: "Grand Design",
    model: "Reflection",
    trim: "337RLS",
    title: "2026 Grand Design Reflection 337RLS",
    stock_number: "46553",
    gvwr: 13995,
    dry_weight: 11475,
    hitch_weight: 2475,
    payload: 3157,
    vehicle_body_length: 35.58,
    vehicle_body_height: 12.5,
    vehicle_body_width: 8,
    max_sleeping_count: 6,
    number_of_slideouts: 3,
    total_fresh_water_tank_capacity: 74,
    total_gray_water_tank_capacity: 87,
    total_black_water_tank_capacity: 47,
    propane_lbs: 60,
    propane_gal: 14.2,
    source: "RV Country lot unit record",
  },
  {
    year: 2027,
    make: "Keystone",
    model: "Hideout Mini",
    trim: "161BH",
    title: "2027 Keystone Hideout Mini 161BH",
    stock_number: "47913",
    dry_weight: 3085,
    hitch_weight: 340,
    vehicle_body_length: 20.5,
    max_sleeping_count: 5,
    number_of_slideouts: 0,
    total_fresh_water_tank_capacity: 21,
    total_gray_water_tank_capacity: 34,
    total_black_water_tank_capacity: 34,
    propane_lbs: 20,
    source: "RV Country lot unit record",
  },
  {
    year: 2027,
    make: "Keystone",
    model: "Hideout Mini",
    trim: "161BH",
    title: "2027 Keystone Hideout Mini 161BH",
    stock_number: "47912",
    dry_weight: 3085,
    hitch_weight: 340,
    vehicle_body_length: 20.5,
    max_sleeping_count: 5,
    number_of_slideouts: 0,
    total_fresh_water_tank_capacity: 21,
    total_gray_water_tank_capacity: 34,
    total_black_water_tank_capacity: 34,
    propane_lbs: 20,
    source: "RV Country lot unit record",
  },
  {
    year: 2027,
    make: "Keystone",
    model: "Hideout",
    trim: "212RKSWE",
    title: "2027 Keystone Hideout 212RKSWE",
    stock_number: "47911",
    dry_weight: 5520,
    hitch_weight: 650,
    vehicle_body_length: 25.5,
    max_sleeping_count: 3,
    number_of_slideouts: 0,
    total_fresh_water_tank_capacity: 82,
    total_gray_water_tank_capacity: 68,
    total_black_water_tank_capacity: 34,
    propane_lbs: 60,
    source: "RV Country lot unit record",
  },
];
