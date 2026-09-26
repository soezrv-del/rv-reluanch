import { createFileRoute } from "@tanstack/react-router";
import { coachWeightClass, WEB_WEIGHT_FIELDS, type WebWeightField } from "@/lib/rv/webWeightFill";
import { resolveWebWeightSearch } from "@/lib/rv/webWeightSearch.server";

/**
 * POST /api/rvfax/web-weight
 *
 * Facts weight step after lot overrides and catalog pins. Searches only
 * the empty fields the client sends. No key → `{ skipped: "no-key" }` and
 * the sheet stays GAP. Keys stay on the server.
 */

export const Route = createFileRoute("/api/rvfax/web-weight")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          year?: string;
          make?: string;
          model?: string;
          floorplan?: string;
          coachType?: string;
          rvType?: string;
          fields?: string[];
          gvwrLbs?: number | null;
        } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const year = String(body.year ?? "").trim();
        const make = String(body.make ?? "").trim();
        const model = String(body.model ?? "").trim();
        const floorplan = String(body.floorplan ?? "").trim();
        if (!year || !make || !model || !floorplan) {
          return Response.json(
            { error: "year, make, model, and floorplan are required" },
            { status: 400 },
          );
        }

        const fields = (Array.isArray(body.fields) ? body.fields : []).filter(
          (field): field is WebWeightField =>
            WEB_WEIGHT_FIELDS.includes(field as WebWeightField),
        );
        const gvwrLbs =
          typeof body.gvwrLbs === "number" && Number.isFinite(body.gvwrLbs) && body.gvwrLbs > 0
            ? Math.round(body.gvwrLbs)
            : null;
        const coachType = coachWeightClass(body.coachType || body.rvType || "");

        const result = await resolveWebWeightSearch({
          year,
          make,
          model,
          floorplan,
          coachType,
          fields,
          gvwrLbs,
        });
        return Response.json(result);
      },
    },
  },
});
