/**
 * RV Facts Catalog Sync Client
 * -----------------------------
 * Pulls the latest models discovered by the daily catalog-sync Edge Function
 * and merges them into the in-memory RV_DATA view for the current session.
 *
 * Call once on app launch / RvFax tab focus (throttled) so users always see
 * newly discovered 2010–present models without waiting for an app store release.
 *
 * Usage:
 *   import { refreshCatalogFromServer, getLastCatalogRefresh } from '@/services/catalogSync';
 *   await refreshCatalogFromServer();
 */

import { getSharedSupabaseClient } from '@/template/core/client';
import { RV_DATA } from '@/constants/rvData';
import type { RVSpec } from '@/constants/rvData';

export interface CatalogRow {
  make: string;
  model: string;
  year_start?: number | null;
  year_end?: number | null;
  type?: string;
  floorplans?: string[];
  length_range?: number[] | null;
  weight_range?: number[] | null;
  msrp_range?: number[] | null;
  engine?: string | null;
  chassis?: string | null;
  fuel_type?: string | null;
  description?: string | null;
  updated_at?: string;
  source?: string;
}

let lastRefresh: string | null = null;
let inFlight: Promise<{ added: number; updated: number; lastRefresh: string | null }> | null = null;

/** Throttled refresh — safe to call from useEffect / focus listeners. */
export async function refreshCatalogFromServer(): Promise<{
  added: number;
  updated: number;
  lastRefresh: string | null;
}> {
  // De-dupe concurrent calls
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const client = getSharedSupabaseClient();
      const { data, error } = await client
        .from('rv_catalog')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(800);

      if (error) {
        console.warn('[catalogSync] Failed to load remote catalog:', error.message);
        return { added: 0, updated: 0, lastRefresh };
      }

      let added = 0;
      let updated = 0;

      for (const row of (data as CatalogRow[]) || []) {
        if (!row.make || !row.model) continue;

        if (!RV_DATA[row.make]) {
          RV_DATA[row.make] = {};
        }

        const existing = RV_DATA[row.make][row.model];
        const lengthRange = (row.length_range && row.length_range.length === 2)
          ? (row.length_range as [number, number])
          : existing?.lengthRange || [0, 0];
        const weightRange = (row.weight_range && row.weight_range.length === 2)
          ? (row.weight_range as [number, number])
          : existing?.weightRange || [0, 0];
        const msrpRange = (row.msrp_range && row.msrp_range.length === 2)
          ? (row.msrp_range as [number, number])
          : existing?.msrpRange || [0, 0];

        const spec: RVSpec = {
          type: row.type || existing?.type || 'Unknown',
          floorplans: row.floorplans || existing?.floorplans || [],
          lengthRange,
          weightRange,
          slideouts: existing?.slideouts ?? 0,
          sleeps: existing?.sleeps ?? 4,
          msrpRange,
          engine: row.engine || existing?.engine,
          chassis: row.chassis || existing?.chassis,
          fuelType: row.fuel_type || existing?.fuelType || 'Unknown',
          recalls: existing?.recalls ?? 0,
          rating: existing?.rating ?? 4.0,
          image: existing?.image || 'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=800&q=80',
          description: row.description || existing?.description,
          yearStart: row.year_start ?? existing?.yearStart,
          yearEnd: row.year_end ?? existing?.yearEnd,
        };

        if (!existing) {
          RV_DATA[row.make][row.model] = spec;
          added++;
        } else {
          // Merge only fields that improve or fill gaps
          Object.assign(RV_DATA[row.make][row.model], {
            ...(row.type && { type: row.type }),
            ...(row.description && { description: row.description }),
            ...(row.year_start != null && { yearStart: row.year_start }),
            ...(row.year_end != null && { yearEnd: row.year_end }),
            ...(row.msrp_range && row.msrp_range.length === 2 && { msrpRange }),
            ...(row.length_range && row.length_range.length === 2 && { lengthRange }),
            ...(row.weight_range && row.weight_range.length === 2 && { weightRange }),
            ...(row.engine && { engine: row.engine }),
            ...(row.chassis && { chassis: row.chassis }),
            ...(row.fuel_type && { fuelType: row.fuel_type }),
          });
          updated++;
        }
      }

      lastRefresh = new Date().toISOString();
      console.log(`[catalogSync] Merged remote catalog — added ${added}, updated ${updated}`);
      return { added, updated, lastRefresh };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function getLastCatalogRefresh() {
  return lastRefresh;
}
