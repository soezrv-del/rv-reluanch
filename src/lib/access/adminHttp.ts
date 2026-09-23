import {
  adminAuthFailureBody,
  authorizeAccessAdmin,
  databaseUrlConfigured,
} from "./adminAuth.ts";
import {
  adminPasswordConfigured,
  readAdminToken,
  verifyAdminToken,
} from "./adminSession.ts";

/** Shared gate for /api/access/admin and research-provider writes. */
export function denyAccessAdmin(request: Request): Response | null {
  const auth = authorizeAccessAdmin(request, {
    tokenValid: verifyAdminToken(readAdminToken(request)),
    databaseUrl: databaseUrlConfigured(),
    passwordConfigured: adminPasswordConfigured(),
  });
  if (auth.ok) return null;
  return Response.json(adminAuthFailureBody(auth), { status: auth.status });
}
