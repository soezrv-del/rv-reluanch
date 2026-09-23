/**
 * Neon-persisted admin override for the RV Grok browse/research provider.
 *
 * Chat personality + Live Voice Realtime stay on xAI Grok. This row only
 * flips Gemini Google Search grounding vs xAI web_search.
 *
 * Fail-soft: a missing table / DB blip must not take research down —
 * callers treat null as "no override" and keep today's env/auto path.
 */

import { getSql } from "@/lib/db";
import {
  parseForcedResearchProvider,
  parseResearchProviderPref,
  type ForcedResearchProvider,
  type ResearchProvider,
} from "./geminiResearch.ts";

export const RESEARCH_PROVIDER_SETTING_KEY = "research_provider";
export const RESEARCH_PROVIDER_OVERRIDE_CACHE_TTL_MS = 2_000;

type Cache = { value: ForcedResearchProvider | null; at: number };

let cache: Cache | null = null;

export function clearResearchProviderOverrideCache(): void {
  cache = null;
}

export function peekResearchProviderOverrideCache(): Cache | null {
  return cache;
}

export async function getResearchProviderOverride(): Promise<ForcedResearchProvider | null> {
  if (cache && Date.now() - cache.at < RESEARCH_PROVIDER_OVERRIDE_CACHE_TTL_MS) {
    return cache.value;
  }
  try {
    const sql = await getSql();
    const rows = await sql<{ value: string }>`
      select value
      from rvgrok_ops_settings
      where key = ${RESEARCH_PROVIDER_SETTING_KEY}
      limit 1
    `;
    const value = parseForcedResearchProvider(rows[0]?.value);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return cache?.value ?? null;
  }
}

export async function setResearchProviderOverride(
  raw: string,
): Promise<
  | { ok: true; override: ForcedResearchProvider | null }
  | { ok: false; error: string; unavailable?: boolean }
> {
  const pref = parseResearchProviderPref(raw);
  if (!pref) {
    return {
      ok: false,
      error: "Provider must be gemini, xai, or auto.",
    };
  }
  try {
    const sql = await getSql();
    if (pref === "auto") {
      await sql`
        delete from rvgrok_ops_settings
        where key = ${RESEARCH_PROVIDER_SETTING_KEY}
      `;
      cache = { value: null, at: Date.now() };
      return { ok: true, override: null };
    }
    await sql`
      insert into rvgrok_ops_settings (key, value, updated_at)
      values (${RESEARCH_PROVIDER_SETTING_KEY}, ${pref}, now())
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
    cache = { value: pref, at: Date.now() };
    return { ok: true, override: pref };
  } catch {
    clearResearchProviderOverrideCache();
    return {
      ok: false,
      error: "Could not save the research provider. Try again shortly.",
      unavailable: true,
    };
  }
}
