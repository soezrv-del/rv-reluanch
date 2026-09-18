import { createFileRoute } from "@tanstack/react-router";
import { checkPhoneAccess } from "@/lib/access/store";

type Body = { phone?: string };

export const Route = createFileRoute("/api/access/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const result = await checkPhoneAccess(String(body.phone ?? ""));
        if (!result.ok) {
          return Response.json({ error: result.error }, { status: 400 });
        }
        return Response.json({
          allowed: result.allowed,
          isAdmin: result.isAdmin,
          name: result.name,
          phoneDigits: result.phoneDigits,
          phoneE164: result.phoneE164,
        });
      },
    },
  },
});
