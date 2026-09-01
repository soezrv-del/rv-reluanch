/** Card image is resolved at render from type art — keep catalog JS image-free. */
export const RV_CARD_IMAGE = "";

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
  /** Brochure A/C string when OEM-pinned (e.g. "3 × 15,000 BTU heat pump"). */
  acUnits?: string;
  gvwrLbs?: number;
  exteriorHeightIn?: number;
  exteriorWidthIn?: number;
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
  /** Brochure A/C string when OEM-pinned. */
  acUnits?: string;
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

/**
 * Wizard / cascade slice — enough to filter year → type → make → model → floorplan
 * without parsing the full live catalog module.
 */
export type CatalogIndexSpec = Pick<
  RVSpec,
  "type" | "fuelType" | "yearStart" | "yearEnd"
> & {
  floorplans?: string[];
  floorplansByYear?: Record<string, string[]>;
  /** OEM lineup years (thin index). Same role as floorplansByYear keys. */
  years?: number[];
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
