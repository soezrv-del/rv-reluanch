import { createFileRoute } from "@tanstack/react-router";
import { createAccessRequest } from "@/lib/access/store.server";

/**
 * POST /api/access/request
 * Body: { name, phone, note? }
 * Stores a pending request David can approve from Access admin.
 */
export const Route = createFileRoute("/api/access/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { name?: string; phone?: string; note?: string } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        try {
          const result = await createAccessRequest({
            name: typeof body.name === "string" ? body.name : "",
            phone: typeof body.phone === "string" ? body.phone : "",
            note: typeof body.note === "string" ? body.note : "",
          });
          return Response.json({
            ok: true,
            alreadyAllowed: result.alreadyAllowed,
            normalized: result.normalized,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Could not send request.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
