import { createFileRoute } from "@tanstack/react-router";
import {
  runSpecFieldFallback,
  SPEC_ENGINE_OWNED_FIELDS,
  type SpecFieldFill,
  type SpecFieldKey,
} from "@/lib/rv/specFieldFallback";

/**
 * POST /api/rvfax/spec-fallback
 *
 * Field-only scrape for empty catalog cells. Catalog stays SoT.
 * Field-only scrape. No whole-coach rewrite.
 */

export const Route = createFileRoute("/api/rvfax/spec-fallback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          year?: string;
          make?: string;
          model?: string;
          floorplan?: string;
          empty?: SpecFieldKey[];
          rvClass?: string;
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

        const empty = (Array.isArray(body.empty) ? body.empty : []).filter(
          (k): k is SpecFieldKey =>
            SPEC_ENGINE_OWNED_FIELDS.includes(k as SpecFieldKey),
        );
        if (!empty.length) {
          return Response.json({ ok: true, fills: [] as SpecFieldFill[] });
        }

        const fills = await runSpecFieldFallback({
          identity: { year, make, model, floorplan },
          empty,
          rvClass: body.rvClass,
        });
        return Response.json({ ok: true, fills });
      },
    },
  },
});
