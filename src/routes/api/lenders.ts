import { createFileRoute } from "@tanstack/react-router";
import { parseCreditBand } from "@/lib/rv/lendersCatalog";
import { resolveLendersResponse } from "@/lib/rv/rateApiLenders";

/**
 * GET /api/lenders
 *
 * Query: amount, termMonths (or term), credit, zip
 *
 * RATEAPI_MODE=live | simulate | off (unset → simulate).
 * live: RateAPI when RATEAPI_API_KEY is set and ZIP maps to a state;
 *       otherwise curated. Cached 24h by state+term.
 * simulate: curated catalog, source "simulate" — never calls RateAPI.
 * off: curated only, source "curated".
 * `source` is "rateapi" | "simulate" | "curated"; never invents live rates.
 */

export const Route = createFileRoute("/api/lenders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const amountRaw = url.searchParams.get("amount");
        const termRaw =
          url.searchParams.get("termMonths") ?? url.searchParams.get("term");
        const credit = parseCreditBand(url.searchParams.get("credit"));
        const zip = url.searchParams.get("zip");

        const amount = amountRaw != null ? Number(amountRaw) : undefined;
        const termMonths = termRaw != null ? Number(termRaw) : undefined;

        if (amountRaw != null && !Number.isFinite(amount)) {
          return Response.json(
            { error: "amount must be a number" },
            { status: 400 },
          );
        }
        if (termRaw != null && !Number.isFinite(termMonths)) {
          return Response.json(
            { error: "termMonths must be a number" },
            { status: 400 },
          );
        }

        const body = await resolveLendersResponse({
          amount,
          termMonths,
          credit,
          zip: zip ?? undefined,
        });

        return Response.json(body, {
          headers: {
            "Cache-Control":
              body.source === "rateapi"
                ? "public, max-age=3600, stale-while-revalidate=86400"
                : "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
