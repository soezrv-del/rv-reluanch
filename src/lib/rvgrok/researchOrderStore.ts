/**
 * Neon-persisted admin override for RV Grok research order.
 *
 * Same rvgrok_ops_settings row store as the research-provider toggle.
 * Missing row / DB blip → search-first (today's Production path).
 * Never a visitor header or localStorage.
 */

import { getSql } from "@/lib/db";
import {
  parseResearchOrder,
  resolveResearchOrder,
  type ResearchOrder,
} from "./researchOrder.ts";

export const RESEARCH_ORDER_SETTING_KEY = "research_order";
export const RESEARCH_ORDER_OVERRIDE_CACHE_TTL_MS = 2_000;

type Cache = { value: ResearchOrder | null; at: number };

let cache: Cache | null = null;

export function clearResearchOrderOverrideCache(): void {
  cache = null;
}

export function peekResearchOrderOverrideCache(): Cache | null {
  return cache;
}

export async function getResearchOrderOverride(): Promise<ResearchOrder | null> {
  if (cache && Date.now() - cache.at < RESEARCH_ORDER_OVERRIDE_CACHE_TTL_MS) {
    return cache.value;
  }
  try {
    const sql = await getSql();
    const rows = await sql<{ value: string }>`
      select value
      from rvgrok_ops_settings
      where key = ${RESEARCH_ORDER_SETTING_KEY}
      limit 1
    `;
    const value = parseResearchOrder(rows[0]?.value);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return cache?.value ?? null;
  }
}

export async function setResearchOrderOverride(
  raw: string,
): Promise<
  | { ok: true; override: ResearchOrder }
  | { ok: false; error: string; unavailable?: boolean }
> {
  const order = parseResearchOrder(raw);
  if (!order) {
    return {
      ok: false,
      error: "Research order must be search-first or catalog-first.",
    };
  }
  try {
    const sql = await getSql();
    await sql`
      insert into rvgrok_ops_settings (key, value, updated_at)
      values (${RESEARCH_ORDER_SETTING_KEY}, ${order}, now())
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
    cache = { value: order, at: Date.now() };
    return { ok: true, override: order };
  } catch {
    clearResearchOrderOverrideCache();
    return {
      ok: false,
      error: "Could not save the research order. Try again shortly.",
      unavailable: true,
    };
  }
}

/** Effective mode for the research path. Fail-soft → search-first. */
export async function readEffectiveResearchOrder(): Promise<ResearchOrder> {
  try {
    return resolveResearchOrder(await getResearchOrderOverride());
  } catch {
    return "search-first";
  }
}
