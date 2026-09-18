import { createFileRoute } from "@tanstack/react-router";
import { researchPublicListingComps } from "@/lib/rv/researchPublicComps";
import {
  COMPS_PARSER_VERSION,
  reReduceCachedComps,
  type PublicListingComps,
} from "@/lib/rv/publicListingComps";

/**
 * POST /api/rvfax/public-comps
 *
 * Free public listing research for the same coach across year ±2.
 * Used as the primary market-value ladder on Facts / Compare.
 * Does not call MarketCheck. Degrades honestly when XAI_API_KEY is missing.
 *
 * Cache HIT re-parses `data.notes` with the current extractor so a parser
 * deploy (e.g. #282 sold-demote) takes effect on warm instances. Key is
 * versioned so pre-parser entries miss entirely.
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
        // On-demand Facts opens send fresh — do not serve a nightly/stale band.
        // Warm HIT still re-parses notes so a parser deploy is not TTL-blocked.
        if (!fresh && hit && Date.now() - hit.at < TTL_MS) {
          const reduced = reReduceCachedComps(hit.data);
          if (!reduced) {
            cache.delete(key);
            return Response.json({
              ok: false,
              data: null,
              error: "no usable public sold or asking prices in the year window",
              meta: { cached: true, source: "public_listings" },
            });
          }
          cache.set(key, { at: hit.at, data: reduced });
          return Response.json({
            ok: true,
            data: reduced,
            meta: { cached: true, source: "public_listings" },
          });
        }

        try {
          const result = await researchPublicListingComps({
            year,
            make,
            model,
            floorplan,
          });
          if (!result.ok || !result.data) {
            return Response.json({
              ok: false,
              data: null,
              error: result.reason,
              meta: { source: "public_listings" },
            });
          }
          cache.set(key, { at: Date.now(), data: result.data });
          return Response.json({
            ok: true,
            data: result.data,
            meta: {
              cached: false,
              model: result.model,
              source: "public_listings",
            },
          });
        } catch (e) {
          return Response.json(
            {
              ok: false,
              data: null,
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
