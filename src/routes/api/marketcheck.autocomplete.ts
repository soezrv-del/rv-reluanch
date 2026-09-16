import { createFileRoute } from "@tanstack/react-router";
import {
  AUTOCOMPLETE_CACHE_TTL_MS,
  autocompleteCacheKey,
  createTtlCache,
  normalizeAutocompleteInput,
  parseAutocompleteField,
  shouldFetchAutocomplete,
} from "@/lib/marketcheck/guards";
import { mapAutocompleteTerms } from "@/lib/marketcheck/map";
import {
  MC_BASE,
  badRequest,
  fetchMarketcheckJson,
  getMarketcheckKey,
  missingKeyResponse,
  withPrivateCache,
} from "@/lib/marketcheck/server";
import type { McAutocompleteResult } from "@/lib/marketcheck/types";

/**
 * GET /api/marketcheck/autocomplete?field=make|model|city&input=Fo&make=Forest%20River
 *
 * Proxies MarketCheck `/v2/search/rv/auto-complete`.
 * Cheap UX — cache + min 2 chars so keystrokes do not burn the 500/mo quota.
 * API key stays server-side.
 */

const cache = createTtlCache<McAutocompleteResult>(AUTOCOMPLETE_CACHE_TTL_MS);

export const Route = createFileRoute("/api/marketcheck/autocomplete")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const field = parseAutocompleteField(url.searchParams.get("field"));
        const input = normalizeAutocompleteInput(url.searchParams.get("input"));
        const make = normalizeAutocompleteInput(url.searchParams.get("make"));

        if (!field) {
          return badRequest("field must be make, model, or city");
        }
        if (!shouldFetchAutocomplete(input)) {
          return badRequest("input must be at least 2 characters");
        }

        const apiKey = getMarketcheckKey();
        if (!apiKey) return missingKeyResponse();

        const cacheKey = autocompleteCacheKey({ field, input, make });
        const hit = cache.get(cacheKey);
        if (hit) {
          return Response.json({ ...hit, cached: true });
        }

        const mc = new URL(`${MC_BASE}/v2/search/rv/auto-complete`);
        mc.searchParams.set("api_key", apiKey);
        mc.searchParams.set("field", field);
        mc.searchParams.set("input", input);
        if (field === "model" && make) mc.searchParams.set("make", make);
        mc.searchParams.set("term_counts", "true");

        const fetched = await fetchMarketcheckJson(mc);
        if (!fetched.ok) return fetched.response;

        const body: McAutocompleteResult = {
          ok: true,
          field,
          input,
          terms: mapAutocompleteTerms(fetched.json.terms ?? fetched.json),
          cached: false,
        };
        cache.set(cacheKey, body);
        return withPrivateCache(body, 300);
      },
    },
  },
});
