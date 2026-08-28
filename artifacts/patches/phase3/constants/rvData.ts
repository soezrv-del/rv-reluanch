/**
 * RV catalog facade — tiny on cold start.
 * Full model data loads via ensureCatalogLoaded() when RvFacts opens / search starts.
 */
export interface RVSpec {
  type: string;
  floorplans: string[];
  lengthRange: [number, number];
  weightRange: [number, number];
  slideouts: number;
  sleeps: number;
  msrpRange: [number, number];
  engine?: string;
  chassis?: string;
  fuelType: string;
  recalls: number;
  rating: number;
  image: string;
  towingCapacity?: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  generator?: string;
  awningLength?: number;
  ceilingHeight?: number;
  founded?: number;
  warrantyYears?: number;
  description?: string;
  yearStart?: number;
  yearEnd?: number;
}

/** Live catalog map — empty until ensureCatalogLoaded() resolves. */
export const RV_DATA: Record<string, Record<string, RVSpec>> = {};

/** Sorted make list — mutated in place after load so existing imports keep working. */
export const MAKES: string[] = [];

/** Static year list (2000–2027) — safe on cold start. */
export const YEARS = Array.from({ length: 28 }, (_, i) => String(2027 - i));

export const CLASSIC_BRANDS: string[] = [
  'Country Coach',
  'Beaver Coach',
  'National RV',
  'Gulf Stream Coach',
  'Damon Motor Coach',
  'Georgie Boy',
  'Monaco Coach Classic',
  'Fleetwood Classic',
  'Winnebago Classic',
  'Newmar Classic',
];

let loaded = false;
let loadPromise: Promise<void> | null = null;

export function isCatalogLoaded(): boolean {
  return loaded;
}

/** Rebuild MAKES from current RV_DATA keys (call after remote merge). */
export function rebuildMakes(): void {
  const next = Object.keys(RV_DATA).sort();
  MAKES.length = 0;
  MAKES.push(...next);
}

/**
 * Load the full catalog chunk once.
 * Safe to call from multiple screens — de-duped.
 */
export async function ensureCatalogLoaded(): Promise<void> {
  if (loaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const mod = await import('./rvDataFull');
    // Replace contents without swapping the exported object identity
    for (const k of Object.keys(RV_DATA)) {
      delete RV_DATA[k];
    }
    Object.assign(RV_DATA, mod.FULL_RV_DATA);
    rebuildMakes();
    loaded = true;
  })();

  try {
    await loadPromise;
  } finally {
    // keep loadPromise so concurrent waiters resolve the same work
  }
}

// ─── MAINTENANCE SCHEDULES ────────────────────────────────────────────────────

export interface MaintenanceItem {
  task: string;
  interval: string;
  category: 'Engine' | 'Chassis' | 'RV Systems' | 'Safety' | 'Exterior' | 'Interior';
  priority: 'Critical' | 'Important' | 'Routine';
}

export function getMaintenanceSchedule(rv: RVSpec): MaintenanceItem[] {
  const isDiesel = rv.fuelType === 'Diesel';
  const isTowable = rv.fuelType.includes('towable') || rv.fuelType.includes('truck camper');
  const isClassB = rv.type === 'Class B';

  const base: MaintenanceItem[] = [
    { task: 'Roof Sealant Inspection', interval: 'Every 90 days', category: 'Exterior', priority: 'Critical' },
    { task: 'Slide-out Seal Cleaning & Conditioning', interval: 'Every 6 months', category: 'Exterior', priority: 'Important' },
    { task: 'Water Heater Anode Rod', interval: 'Annually', category: 'RV Systems', priority: 'Important' },
    { task: 'Fresh Water System Sanitize', interval: 'Every 6 months', category: 'RV Systems', priority: 'Important' },
    { task: 'Black Tank Sensor Clean', interval: 'Every 3 months', category: 'RV Systems', priority: 'Routine' },
    { task: 'Smoke / CO Detector Test', interval: 'Monthly', category: 'Safety', priority: 'Critical' },
    { task: 'Fire Extinguisher Check', interval: 'Every 6 months', category: 'Safety', priority: 'Critical' },
  ];

  if (!isTowable) {
    base.push(
      { task: 'Engine Oil & Filter', interval: isDiesel ? 'Every 5,000–7,500 miles' : 'Every 3,000–5,000 miles', category: 'Engine', priority: 'Critical' },
      { task: 'Fuel Filter', interval: isDiesel ? 'Every 15,000 miles' : 'Every 30,000 miles', category: 'Engine', priority: 'Important' },
      { task: 'Transmission Service', interval: 'Every 30,000 miles', category: 'Chassis', priority: 'Important' },
      { task: 'Chassis Lube', interval: 'Every 5,000 miles', category: 'Chassis', priority: 'Important' },
    );
  } else {
    base.push(
      { task: 'Tire Pressure Check & Rotation', interval: 'Every 7,500 miles towed', category: 'Chassis', priority: 'Critical' },
      { task: 'Tire Age Inspection (replace at 7 years)', interval: 'Annually', category: 'Chassis', priority: 'Critical' },
      { task: 'Wheel Bearing Inspection & Repack', interval: 'Every 12,000 miles', category: 'Chassis', priority: 'Critical' },
      { task: 'Brake Controller Calibration', interval: 'Every 12 months', category: 'Safety', priority: 'Important' },
      { task: 'Hitch Ball & Coupler Inspection', interval: 'Before every trip', category: 'Safety', priority: 'Critical' },
    );
  }

  if (isClassB) {
    base.push(
      { task: 'Van Body Fastener Torque Check', interval: 'Annually', category: 'Chassis', priority: 'Important' },
    );
  }

  return base;
}

// Reviews stay on a separate chunk (Phase 2)
export { getMockReviews, type RVReview, type ReviewTemplate } from './rvReviews';
