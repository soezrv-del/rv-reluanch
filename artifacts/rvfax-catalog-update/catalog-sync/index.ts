import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * RVFAX Catalog Daily Sync (v2 — active gap + new-model intelligence)
 * -------------------------------------------------------------------
 * Schedule once per day (recommended 06:00 UTC via pg_cron / Supabase scheduled functions
 * or external cron hitting this endpoint with the service-role Authorization header).
 *
 * Responsibilities:
 * 1. Discover new / updated models for CURRENT_YEAR and CURRENT_YEAR-1 across priority makes.
 * 2. Gap scan: for each priority make, identify core production models from 2010–present
 *    that are still missing from rv_catalog and add them with best-available specs.
 * 3. Enrich with basic type, length/weight/MSRP ranges, engine/chassis when motorized.
 * 4. Upsert into public.rv_catalog so every client (refreshCatalogFromServer) stays current.
 * 5. Write a summary row to catalog_sync_logs.
 *
 * Auth: service-role key only. Never expose to the client.
 */

const CURRENT_YEAR = new Date().getFullYear();
const GAP_YEAR_START = 2010;

const PRIORITY_MAKES = [
  'Newmar', 'Tiffin', 'Winnebago', 'Grand Design', 'Airstream',
  'Thor', 'Forest River', 'Jayco', 'Keystone', 'Entegra Coach',
  'Coachmen', 'Fleetwood', 'Holiday Rambler', 'Dynamax', 'Renegade RV',
  'Leisure Travel Vans', 'Roadtrek', 'Pleasure-Way', 'Lance', 'Palomino',
  'Alliance RV', 'Heartland', 'Dutchmen', 'Nexus RV', 'Outdoors RV',
];

const SYSTEM_PROMPT = `You are the RV Facts catalog intelligence agent for RVFAX.
Return ONLY valid JSON arrays. No markdown fences, no commentary, no trailing text.
When researching, prioritize official manufacturer sites, RVBusiness, RVNews, RVIA, and current major dealer inventory.
Be accurate. If a value is uncertain, set it to null and mention the uncertainty briefly in the description field.
Prefer distinct model names (line names) over individual floorplan codes.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const start = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    logs.push(line);
    console.log(msg);
  };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const xaiKey = Deno.env.get('XAI_API_KEY') ?? '';

    if (!xaiKey) {
      throw new Error('XAI_API_KEY is required for catalog enrichment');
    }

    // Ensure table (idempotent)
    await supabase.rpc('ensure_rv_catalog_table').catch(() => {
      log('ensure_rv_catalog_table RPC unavailable — assuming table already exists');
    });

    // ── 1. Existing catalog snapshot ──────────────────────────────────────
    const { data: existing, error: existErr } = await supabase
      .from('rv_catalog')
      .select('make, model, year_start, year_end, updated_at');
    if (existErr) log(`Existing catalog query warning: ${existErr.message}`);

    const existingKeys = new Set(
      (existing || []).map((r: any) => `${r.make}|${r.model}`.toLowerCase())
    );
    const existingByMake = new Map<string, string[]>();
    for (const r of existing || []) {
      const m = (r.make || '').toString();
      if (!existingByMake.has(m)) existingByMake.set(m, []);
      existingByMake.get(m)!.push(r.model);
    }
    log(`Loaded ${existingKeys.size} existing catalog entries across ${existingByMake.size} makes`);

    const discoveries: any[] = [];

    // ── 2. New-model discovery — current + prior model year ───────────────
    const targetYears = [CURRENT_YEAR, CURRENT_YEAR - 1];
    log(`Phase 1: scanning new/updated models for years ${targetYears.join(', ')}`);

    for (const make of PRIORITY_MAKES) {
      for (const year of targetYears) {
        const prompt = `List every distinct ${year} ${make} RV model line that is in active production or newly introduced for model year ${year}.
Cover Class A (gas & diesel), Class B, Class C, Super C, fifth-wheel, travel trailer, toy hauler, and truck camper where the brand produces them.
Return a JSON array of objects. Each object must have:
- model (string — the model / line name, e.g. "Dutch Star", "Reflection", "Thrive")
- type (one of: "Class A Diesel" | "Class A Gas" | "Class B" | "Class C" | "Super C" | "Fifth Wheel" | "Travel Trailer" | "Toy Hauler" | "Truck Camper")
- floorplans (string array of common floorplan codes if known, else [])
- lengthRange ([min, max] feet as numbers)
- weightRange ([min, max] lbs approximate UVW or GVWR)
- msrpRange ([low, high] USD approximate)
- engine (string or null)
- chassis (string or null)
- fuelType ("Diesel" | "Gas" | "N/A" or null)
- description (1-2 sentence summary)
- yearStart (${year})

If none found for that year/make, return [].`;

        try {
          const res = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${xaiKey}`,
            },
            body: JSON.stringify({
              model: 'grok-3',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
              ],
              temperature: 0.15,
              max_tokens: 2800,
            }),
          });

          if (!res.ok) {
            log(`xAI error for ${make} ${year}: ${res.status}`);
            continue;
          }
          const json = await res.json();
          const raw = json.choices?.[0]?.message?.content ?? '[]';
          const match = raw.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.model && item.type) {
                  discoveries.push({
                    make,
                    model: String(item.model).trim(),
                    year_start: item.yearStart ?? year,
                    year_end: null,
                    type: item.type,
                    floorplans: item.floorplans ?? [],
                    length_range: item.lengthRange ?? null,
                    weight_range: item.weightRange ?? null,
                    msrp_range: item.msrpRange ?? null,
                    engine: item.engine ?? null,
                    chassis: item.chassis ?? null,
                    fuel_type: item.fuelType ?? null,
                    description: item.description ?? null,
                    source: 'xai-new-year-scan',
                    raw: item,
                  });
                }
              }
              log(`  ${make} ${year}: ${parsed.length} candidates`);
            }
          }
        } catch (e: any) {
          log(`Discovery failed for ${make} ${year}: ${e.message}`);
        }

        // polite rate limit
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    // ── 3. Gap fill for 2010–present ───────────────────────────────────────
    // For each priority make, ask Grok which important production models from
    // 2010 onward are still missing from our known list, then add them.
    log(`Phase 2: gap scan 2010–${CURRENT_YEAR} for missing core models`);

    for (const make of PRIORITY_MAKES) {
      const known = existingByMake.get(make) || [];
      // also include anything we just discovered this run
      const newlyFound = discoveries.filter((d) => d.make === make).map((d) => d.model);
      const knownList = [...new Set([...known, ...newlyFound])].slice(0, 40).join(', ') || '(none yet)';

      const prompt = `You are filling gaps in an RV catalog for ${make}.
Known models we already have: ${knownList}.

List important ${make} model lines that were in regular production at any time between ${GAP_YEAR_START} and ${CURRENT_YEAR} and are still missing from the known list above.
Focus on distinct product lines (not every floorplan). Prioritize models that appeared in multiple model years or are commonly searched by buyers.
Return a JSON array (max 12 items) of objects with the same shape:
- model, type, floorplans, lengthRange, weightRange, msrpRange, engine, chassis, fuelType, description, yearStart (first production year if known), yearEnd (last year if discontinued, else null)

If the known list already covers the important lines, return [].`;

      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${xaiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-3',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 2200,
          }),
        });

        if (!res.ok) {
          log(`xAI gap-scan error for ${make}: ${res.status}`);
          continue;
        }
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content ?? '[]';
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            let added = 0;
            for (const item of parsed) {
              if (!item.model || !item.type) continue;
              const key = `${make}|${item.model}`.toLowerCase();
              if (existingKeys.has(key)) continue;
              if (discoveries.some((d) => d.make === make && d.model.toLowerCase() === String(item.model).toLowerCase())) continue;

              discoveries.push({
                make,
                model: String(item.model).trim(),
                year_start: item.yearStart ?? GAP_YEAR_START,
                year_end: item.yearEnd ?? null,
                type: item.type,
                floorplans: item.floorplans ?? [],
                length_range: item.lengthRange ?? null,
                weight_range: item.weightRange ?? null,
                msrp_range: item.msrpRange ?? null,
                engine: item.engine ?? null,
                chassis: item.chassis ?? null,
                fuel_type: item.fuelType ?? null,
                description: item.description ?? null,
                source: 'xai-gap-2010-present',
                raw: item,
              });
              added++;
            }
            log(`  ${make} gap fill: ${added} new models`);
          }
        }
      } catch (e: any) {
        log(`Gap scan failed for ${make}: ${e.message}`);
      }

      await new Promise((r) => setTimeout(r, 700));
    }

    // ── 4. Upsert everything discovered ───────────────────────────────────
    let inserted = 0;
    let updated = 0;
    const seenThisRun = new Set<string>();

    for (const d of discoveries) {
      const key = `${d.make}|${d.model}`.toLowerCase();
      if (seenThisRun.has(key)) continue;
      seenThisRun.add(key);

      const isNew = !existingKeys.has(key);

      const row = {
        make: d.make,
        model: d.model,
        year_start: d.year_start,
        year_end: d.year_end,
        type: d.type,
        floorplans: d.floorplans,
        length_range: d.length_range,
        weight_range: d.weight_range,
        msrp_range: d.msrp_range,
        engine: d.engine,
        chassis: d.chassis,
        fuel_type: d.fuel_type,
        description: d.description,
        source: d.source,
        data: d.raw,
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('rv_catalog')
        .upsert(row, { onConflict: 'make,model' });

      if (error) {
        log(`Upsert error ${d.make} ${d.model}: ${error.message}`);
      } else {
        if (isNew) inserted++;
        else updated++;
      }
    }

    // ── 5. Summary + log ──────────────────────────────────────────────────
    const durationMs = Date.now() - start;
    const summary = {
      ok: true,
      version: 2,
      years_scanned: targetYears,
      gap_range: `${GAP_YEAR_START}–${CURRENT_YEAR}`,
      makes_scanned: PRIORITY_MAKES.length,
      discoveries: discoveries.length,
      unique_upserted: seenThisRun.size,
      inserted,
      updated,
      duration_ms: durationMs,
      logs: logs.slice(-50),
    };

    await supabase.from('catalog_sync_logs').insert({
      ran_at: new Date().toISOString(),
      summary,
    }).catch(() => log('catalog_sync_logs table not present — summary not persisted'));

    log(`Done. inserted=${inserted} updated=${updated} duration=${durationMs}ms`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message, logs }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
