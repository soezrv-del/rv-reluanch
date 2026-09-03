import { createFileRoute } from "@tanstack/react-router";
import { researchPublicListingComps } from "@/lib/rv/researchPublicComps";
import type { PublicListingComps } from "@/lib/rv/publicListingComps";

/**
 * POST /api/rvfax/public-comps
 *
 * Free public listing research for the same coach across year ±2.
 * Used as the primary market-value ladder on Facts / Compare.
 * Does not call MarketCheck. Degrades honestly when XAI_API_KEY is missing.
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
  return `${input.year}|${input.make}|${input.model}|${input.floorplan || ""}`.toLowerCase();
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

        const key = cacheKey({ year, make, model, floorplan });
        const hit = cache.get(key);
        if (hit && Date.now() - hit.at < TTL_MS) {
          return Response.json({
            ok: true,
            data: hit.data,
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
