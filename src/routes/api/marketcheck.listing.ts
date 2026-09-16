import { createFileRoute } from "@tanstack/react-router";
import { createTtlCache, sanitizeMcId } from "@/lib/marketcheck/guards";
import { mapListingDetail } from "@/lib/marketcheck/map";
import {
  MC_BASE,
  badRequest,
  fetchMarketcheckJson,
  getMarketcheckKey,
  missingKeyResponse,
  withPrivateCache,
} from "@/lib/marketcheck/server";
import type { McListingResult } from "@/lib/marketcheck/types";

/**
 * GET /api/marketcheck/listing?id={listing_id}
 *
 * Proxies MarketCheck `/v2/listing/rv/{listing_id}`.
 * Shortlist-only: Facts must call this when the user opens a card — never
 * N+1 on every search hit. API key stays server-side.
 */

const cache = createTtlCache<McListingResult>(12 * 60 * 60 * 1000);

export const Route = createFileRoute("/api/marketcheck/listing")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = sanitizeMcId(url.searchParams.get("id"));
        if (!id) {
          return badRequest("listing id is required");
        }

        const apiKey = getMarketcheckKey();
        if (!apiKey) return missingKeyResponse();

        const hit = cache.get(id);
        if (hit) {
          return Response.json({ ...hit, cached: true });
        }

        const mc = new URL(
          `${MC_BASE}/v2/listing/rv/${encodeURIComponent(id)}`,
        );
        mc.searchParams.set("api_key", apiKey);

        const fetched = await fetchMarketcheckJson(mc);
        if (!fetched.ok) return fetched.response;

        const raw = fetched.json;
        if (!raw || typeof raw !== "object") {
          return badRequest("empty listing");
        }

        const body: McListingResult = {
          ok: true,
          listing: mapListingDetail(raw),
          cached: false,
        };
        cache.set(id, body);
        return withPrivateCache(body, 300);
      },
    },
  },
});
