import { createFileRoute } from "@tanstack/react-router";
import {
  fetchJdPowerPublicEstimate,
  isJdPowerBlendEligible,
  type JdPowerPublicEstimate,
} from "@/lib/rv/jdPowerPublic";
import { researchPublicListingComps } from "@/lib/rv/researchPublicComps";
import {
  COMPS_PARSER_VERSION,
  reReduceCachedComps,
  type PublicListingComps,
} from "@/lib/rv/publicListingComps";

/**
 * POST /api/rvfax/public-comps
 *
 * On-demand Market value: public sold listings (year ±2) plus a
 * Palazzo-first free public J.D. Power parse. Facts opens send
 * `fresh: true` so this is not a nightly/stale band. JD is always
 * fetched live. Cache HIT re-parses `data.notes` with the current
 * extractor so a parser deploy takes effect on warm instances.
 * Does not call MarketCheck. JD GAP is honest.
 */

const cache = new Map<
  string,
  { at: number; data: PublicListingComps }
>();
const TTL_MS = 6 * 60 * 60 * 1000;

function cacheKey(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
}) {
  return `${COMPS_PARSER_VERSION}|${input.year}|${input.make}|${input.model}|${input.floorplan || ""}`.toLowerCase();
}

export const Route = createFileRoute("/api/rvfax/public-comps")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          year?: string | number;
          make?: string;
          model?: string;
          floorplan?: string;
          fresh?: boolean;
        } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const year = String(body.year ?? "").trim();
        const make = String(body.make ?? "").trim();
        const model = String(body.model ?? "").trim();
        const floorplan = String(body.floorplan ?? "").trim() || undefined;
        if (!year || !make || !model) {
          return Response.json(
            { error: "year, make, and model are required" },
            { status: 400 },
          );
        }

        const fresh = Boolean(body.fresh);
        const key = cacheKey({ year, make, model, floorplan });
        const hit = cache.get(key);

        const compsPromise = (async () => {
          // On-demand Facts opens send fresh — do not serve a nightly/stale band.
          // Warm HIT still re-parses notes so a parser deploy is not TTL-blocked.
          if (!fresh && hit && Date.now() - hit.at < TTL_MS) {
            const reduced = reReduceCachedComps(hit.data);
            if (!reduced) {
              cache.delete(key);
              return {
                ok: false as const,
                data: null as PublicListingComps | null,
                cached: true,
                model: undefined as string | undefined,
                reason: "no usable public sold or asking prices in the year window",
              };
            }
            cache.set(key, { at: hit.at, data: reduced });
            return {
              ok: true as const,
              data: reduced,
              cached: true,
              model: undefined as string | undefined,
            };
          }

          const result = await researchPublicListingComps({
            year,
            make,
            model,
            floorplan,
          });
          if (result.ok && result.data) {
            cache.set(key, { at: Date.now(), data: result.data });
            return {
              ok: true as const,
              data: result.data,
              cached: false,
              model: result.model,
            };
          }
          return {
            ok: false as const,
            data: result.data,
            cached: false,
            model: undefined as string | undefined,
            reason: result.ok ? undefined : result.reason,
          };
        })();

        const jdPromise = isJdPowerBlendEligible(make, model)
          ? fetchJdPowerPublicEstimate({ year, make, model, floorplan })
          : Promise.resolve({
              ok: false as const,
              reason: "J.D. Power public blend is Palazzo-first",
              data: null as JdPowerPublicEstimate | null,
            });

        try {
          const [compsResult, jdResult] = await Promise.all([
            compsPromise,
            jdPromise,
          ]);

          return Response.json({
            ok: Boolean(compsResult.ok && compsResult.data) || jdResult.ok,
            data: compsResult.data ?? null,
            jdPower: jdResult.ok ? jdResult.data : null,
            jdPowerError: jdResult.ok ? null : jdResult.reason,
            error:
              compsResult.ok && compsResult.data
                ? undefined
                : "reason" in compsResult
                  ? compsResult.reason
                  : undefined,
            meta: {
              cached: Boolean(compsResult.cached),
              fresh,
              model: compsResult.model,
              source: "public_listings",
              jdPower: jdResult.ok ? "jd_power_public" : "gap",
            },
          });
        } catch (e) {
          return Response.json(
            {
              ok: false,
              data: null,
              jdPower: null,
              error:
                e instanceof Error
                  ? e.message
                  : "Public listing research failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
