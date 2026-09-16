import { createFileRoute } from "@tanstack/react-router";
import type { McListingCard, McSearchResult } from "@/lib/marketcheck/types";
import {
  MC_ROWS_SEARCH_MAX,
  clampRadius,
  clampRows,
  createTtlCache,
  isZip5,
  parseZip5,
  sanitizeMcId,
} from "@/lib/marketcheck/guards";
import { mapListing, mcNum } from "@/lib/marketcheck/map";
import {
  MC_BASE,
  badRequest,
  fetchMarketcheckJson,
  getMarketcheckKey,
  missingKeyResponse,
  withPrivateCache,
} from "@/lib/marketcheck/server";
import {
  formatYearRange,
  medianListingPrice,
  resolveSearchYears,
} from "@/lib/marketcheck/yearRange";

/**
 * GET /api/marketcheck/search
 *   ?year=2022&make=Fleetwood&model=Discovery&zip=98374&radius=100&rows=8
 *   ?year_range=2020-2024&make=Fleetwood&model=Discovery&zip=98374
 *   ?year_min=2020&year_max=2024&make=Fleetwood&model=Discovery&zip=98374
 *   ?dealer_id=…&year=2022&make=Fleetwood&model=Discovery&zip=98374
 *   ?dealer_id=…&year_range=2020-2024&zip=98374   (all units at one lot)
 *
 * Proxies MarketCheck `/v2/search/rv/active`. API key stays server-side.
 * Free-tier: radius ≤ 100 mi. Listing details are a separate shortlist-only route.
 */

const cache = createTtlCache<McSearchResult>(12 * 60 * 60 * 1000);

function medianPrices(listings: McListingCard[]): number | null {
  return medianListingPrice(listings.map((l) => l.price));
}

export const Route = createFileRoute("/api/marketcheck/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const years = resolveSearchYears({
          year: url.searchParams.get("year"),
          yearRange: url.searchParams.get("year_range"),
          yearMin: url.searchParams.get("year_min"),
          yearMax: url.searchParams.get("year_max"),
        });
        const make = url.searchParams.get("make")?.trim() || "";
        const model = url.searchParams.get("model")?.trim() || "";
        const zip = parseZip5(url.searchParams.get("zip"));
        const dealerId = sanitizeMcId(url.searchParams.get("dealer_id"));
        const radius = clampRadius(url.searchParams.get("radius"));
        const rows = clampRows(url.searchParams.get("rows"), MC_ROWS_SEARCH_MAX);

        if (!years.ok) {
          return badRequest(years.error);
        }
        // Existing 100-mile path still requires make + model + ZIP.
        // Dealer-lot inventory may omit make/model (all units at that lot).
        if (!dealerId && (!make || !model)) {
          return badRequest("make and model are required");
        }
        if (!isZip5(zip)) {
          return badRequest("Enter a valid 5-digit ZIP for local inventory");
        }

        const apiKey = getMarketcheckKey();
        if (!apiKey) return missingKeyResponse();

        const yearKey = years.useRange
          ? `r:${formatYearRange(years.range)}`
          : `y:${years.year ?? formatYearRange(years.range)}`;
        const cacheKey = `${yearKey}|${make.toLowerCase()}|${model.toLowerCase()}|${zip}|${radius}|${rows}|d:${dealerId}`;
        const hit = cache.get(cacheKey);
        if (hit) {
          return Response.json({ ...hit, cached: true });
        }

        const mc = new URL(`${MC_BASE}/v2/search/rv/active`);
        mc.searchParams.set("api_key", apiKey);
        if (years.useRange) {
          mc.searchParams.set("year_range", formatYearRange(years.range));
        } else if (years.year) {
          mc.searchParams.set("year", years.year);
        }
        if (make) mc.searchParams.set("make", make);
        if (model) mc.searchParams.set("model", model);
        mc.searchParams.set("zip", zip);
        mc.searchParams.set("radius", String(radius));
        mc.searchParams.set("rows", String(rows));
        mc.searchParams.set("start", "0");
        if (dealerId) mc.searchParams.set("dealer_id", dealerId);

        const fetched = await fetchMarketcheckJson(mc);
        if (!fetched.ok) return fetched.response;

        const rawList = Array.isArray(fetched.json.listings)
          ? fetched.json.listings
          : [];
        const listings = rawList
          .filter(
            (x): x is Record<string, unknown> => !!x && typeof x === "object",
          )
          .map(mapListing);

        const body: McSearchResult = {
          ok: true,
          numFound: mcNum(fetched.json.num_found) ?? listings.length,
          listings,
          radius,
          zip,
          query: {
            year: years.year,
            make,
            model,
            yearRange: years.range,
            dealerId: dealerId || null,
          },
          cached: false,
          medianPrice: medianPrices(listings),
        };

        cache.set(cacheKey, body);
        return withPrivateCache(body, 300);
      },
    },
  },
});
