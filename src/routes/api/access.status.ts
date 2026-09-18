import { createFileRoute } from "@tanstack/react-router";
import { normalizePhoneE164 } from "@/lib/access/phone";
import { isPhoneOnWhitelist } from "@/lib/access/store.server";

/**
 * GET /api/access/status?phone=
 * Returns whether this device phone is on the persistent whitelist.
 * Never lists other numbers.
 */
export const Route = createFileRoute("/api/access/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("phone") ?? "";
        const normalized = normalizePhoneE164(raw);
        if (!normalized) {
          return Response.json({
            allowed: false,
            normalized: null,
            needsPhone: true,
          });
        }
        const allowed = await isPhoneOnWhitelist(normalized);
        return Response.json({
          allowed,
          normalized,
          needsPhone: false,
        });
      },
    },
  },
});
