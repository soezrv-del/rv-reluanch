import { createFileRoute } from "@tanstack/react-router";
import {
  MC_ROWS_DEALERS_MAX,
  clampRadius,
  clampRows,
  createTtlCache,
  isZip5,
  parseZip5,
} from "@/lib/marketcheck/guards";
import { mapDealer } from "@/lib/marketcheck/map";
import {
  MC_BASE,
  badRequest,
  fetchMarketcheckJson,
  getMarketcheckKey,
  missingKeyResponse,
  withPrivateCache,
} from "@/lib/marketcheck/server";
import type { McDealersResult } from "@/lib/marketcheck/types";

/**
 * GET /api/marketcheck/dealers?zip=98374&radius=100&rows=8
 *
 * Proxies MarketCheck `/v2/dealers/rv` (lot map).
 * Same free-tier radius clamp as active search (≤100 mi).
 * Inventory for a picked dealer uses existing `/api/marketcheck/search?dealer_id=`.
 * API key stays server-side.
 */

const cache = createTtlCache<McDealersResult>(12 * 60 * 60 * 1000);

export const Route = createFileRoute("/api/marketcheck/dealers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const zip = parseZip5(url.searchParams.get("zip"));
        const radius = clampRadius(url.searchParams.get("radius"));
        const rows = clampRows(
          url.searchParams.get("rows"),
          MC_ROWS_DEALERS_MAX,
        );

        if (!isZip5(zip)) {
          return badRequest("Enter a valid 5-digit ZIP for nearby dealers");
        }

        const apiKey = getMarketcheckKey();
        if (!apiKey) return missingKeyResponse();

        const cacheKey = `${zip}|${radius}|${rows}`;
        const hit = cache.get(cacheKey);
        if (hit) {
          return Response.json({ ...hit, cached: true });
        }

        const mc = new URL(`${MC_BASE}/v2/dealers/rv`);
        mc.searchParams.set("api_key", apiKey);
        mc.searchParams.set("zip", zip);
        mc.searchParams.set("radius", String(radius));
        mc.searchParams.set("rows", String(rows));
        mc.searchParams.set("start", "0");
        mc.searchParams.set("sort_by", "dist");
        mc.searchParams.set("sort_order", "asc");

        const fetched = await fetchMarketcheckJson(mc);
        if (!fetched.ok) return fetched.response;

        const rawList = Array.isArray(fetched.json.dealers)
          ? fetched.json.dealers
          : [];
        const dealers = rawList
          .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
          .map(mapDealer)
          .filter((d) => d.id);

        const num =
          typeof fetched.json.num_found === "number"
            ? fetched.json.num_found
            : dealers.length;

        const body: McDealersResult = {
          ok: true,
          numFound: num,
          dealers,
          radius,
          zip,
          cached: false,
        };
        cache.set(cacheKey, body);
        return withPrivateCache(body, 300);
      },
    },
  },
});
