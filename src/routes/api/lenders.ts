import { createFileRoute } from "@tanstack/react-router";
import {
  buildLendersResponse,
  parseCreditBand,
} from "@/lib/rv/lendersCatalog";

/**
 * GET /api/lenders
 *
 * Curated RV / personal-loan lender estimates for RvCal.
 * Query: amount, termMonths (or term), credit, zip
 *
 * Not a live rate feed — catalog maintained in lendersCatalog.ts.
 * Ready to swap for a partner API later without changing the client contract.
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

        const body = buildLendersResponse({
          amount,
          termMonths,
          credit,
          zip: zip ?? undefined,
        });

        return Response.json(body, {
          headers: {
            // Catalog can be CDN-cached briefly; bump when rates change often
            "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
