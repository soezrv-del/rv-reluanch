import { createFileRoute } from "@tanstack/react-router";
import {
  isAdminRequest,
  passwordsMatch,
  readAdminPassword,
  serializeAdminCookie,
  signAdminToken,
} from "@/lib/access/adminAuth.server";
import {
  addWhitelist,
  approveRequest,
  dismissRequest,
  listRequests,
  listWhitelist,
  removeWhitelist,
} from "@/lib/access/store.server";

type AdminBody = {
  action?: string;
  password?: string;
  phone?: string;
  name?: string;
  notes?: string;
  id?: string;
};

function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(data, { status, headers: extra });
}

async function requireAdmin(request: Request): Promise<Response | null> {
  if (await isAdminRequest(request)) return null;
  return json({ error: "Admin sign-in required.", code: "admin_auth" }, 401);
}

async function handleLogin(body: AdminBody): Promise<Response> {
  const expected = readAdminPassword();
  if (!expected) {
    return json(
      {
        error:
          "WHITELIST_ADMIN_PASSWORD (or ACCESS_ADMIN_PASSWORD) is not set on the server.",
        code: "admin_unconfigured",
      },
      503,
    );
  }
  const given = typeof body.password === "string" ? body.password : "";
  if (!given || !passwordsMatch(given, expected)) {
    return json({ error: "Wrong password.", code: "bad_password" }, 401);
  }
  const token = await signAdminToken(expected);
  return json(
    { ok: true },
    200,
    { "Set-Cookie": serializeAdminCookie(token) },
  );
}

async function handleList(): Promise<Response> {
  const [numbers, requests] = await Promise.all([
    listWhitelist(),
    listRequests("pending"),
  ]);
  return json({
    ok: true,
    numbers,
    requests,
    count: numbers.length,
  });
}

export const Route = createFileRoute("/api/access/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = await requireAdmin(request);
        if (denied) return denied;
        return handleList();
      },
      POST: async ({ request }) => {
        let body: AdminBody = {};
        try {
          body = (await request.json()) as AdminBody;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        const action = typeof body.action === "string" ? body.action : "";

        if (action === "login") return handleLogin(body);
        if (action === "logout") {
          return json(
            { ok: true },
            200,
            { "Set-Cookie": serializeAdminCookie("", true) },
          );
        }

        const denied = await requireAdmin(request);
        if (denied) return denied;

        try {
          if (action === "list") return handleList();
          if (action === "add") {
            const row = await addWhitelist({
              phone: typeof body.phone === "string" ? body.phone : "",
              contactName: typeof body.name === "string" ? body.name : "",
              notes: typeof body.notes === "string" ? body.notes : "",
            });
            return json({ ok: true, number: row });
          }
          if (action === "remove") {
            const ok = await removeWhitelist(
              typeof body.id === "string" ? body.id : "",
            );
            if (!ok) return json({ error: "Number not found." }, 404);
            return json({ ok: true });
          }
          if (action === "approve") {
            const row = await approveRequest(
              typeof body.id === "string" ? body.id : "",
            );
            if (!row) return json({ error: "Request not found." }, 404);
            return json({ ok: true, number: row });
          }
          if (action === "dismiss") {
            const ok = await dismissRequest(
              typeof body.id === "string" ? body.id : "",
            );
            if (!ok) return json({ error: "Request not found." }, 404);
            return json({ ok: true });
          }
          return json({ error: "Unknown action." }, 400);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Admin action failed.";
          return json({ error: message }, 400);
        }
      },
    },
  },
});
