import { createFileRoute } from "@tanstack/react-router";
import { createAccessRequest } from "@/lib/access/store";

type Body = { name?: string; phone?: string };

/**
 * Notify-only. Never inserts into access_whitelist.
 * Self-service cannot grant access.
 */
export const Route = createFileRoute("/api/access/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const result = await createAccessRequest({
          name: String(body.name ?? ""),
          phone: String(body.phone ?? ""),
        });
        if (!result.ok) {
          return Response.json({ error: result.error }, { status: 400 });
        }
        return Response.json({
          requested: true,
          granted: false,
          message:
            "Request sent. Access stays locked until it is added on the admin list.",
        });
      },
    },
  },
});
