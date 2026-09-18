import { createFileRoute } from "@tanstack/react-router";
import {
  adminCookie,
  adminPasswordConfigured,
  clearAdminCookie,
  issueAdminToken,
  readAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
} from "@/lib/access/adminSession";
import {
  addWhitelistEntry,
  listAccessRequests,
  listWhitelist,
  removeWhitelistEntry,
} from "@/lib/access/store";

type Body = {
  action?: string;
  password?: string;
  phone?: string;
  name?: string;
  notes?: string;
  isAdmin?: boolean;
  id?: string;
};

function unauthorized() {
  return Response.json({ error: "Admin login required." }, { status: 401 });
}

function requireAdmin(request: Request) {
  return verifyAdminToken(readAdminToken(request));
}

export const Route = createFileRoute("/api/access/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!requireAdmin(request)) return unauthorized();
        const [entries, requests] = await Promise.all([
          listWhitelist(),
          listAccessRequests(),
        ]);
        return Response.json({ entries, requests });
      },
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const action = String(body.action ?? "");

        if (action === "login") {
          if (!adminPasswordConfigured()) {
            return Response.json(
              { error: "WHITELIST_ADMIN_PASSWORD is not set." },
              { status: 503 },
            );
          }
          if (!verifyAdminPassword(String(body.password ?? ""))) {
            return Response.json(
              { error: "Wrong admin password." },
              { status: 401 },
            );
          }
          const token = issueAdminToken();
          return Response.json(
            { ok: true, token },
            { headers: { "Set-Cookie": adminCookie(token) } },
          );
        }

        if (action === "logout") {
          return Response.json(
            { ok: true },
            { headers: { "Set-Cookie": clearAdminCookie() } },
          );
        }

        if (!requireAdmin(request)) return unauthorized();

        if (action === "add") {
          const result = await addWhitelistEntry({
            phone: String(body.phone ?? ""),
            name: String(body.name ?? ""),
            notes: String(body.notes ?? ""),
            isAdmin: Boolean(body.isAdmin),
          });
          if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true, entry: result.entry });
        }

        if (action === "remove") {
          const result = await removeWhitelistEntry(String(body.id ?? ""));
          if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true });
        }

        return Response.json({ error: "Unknown action." }, { status: 400 });
      },
    },
  },
});
