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
        let result: Awaited<ReturnType<typeof checkPhoneAccess>>;
        try {
          result = await checkPhoneAccess(String(body.phone ?? ""));
        } catch {
          return Response.json(
            {
              error:
                "Access list is temporarily unavailable. Try again shortly.",
            },
            { status: 503 },
          );
        }
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
