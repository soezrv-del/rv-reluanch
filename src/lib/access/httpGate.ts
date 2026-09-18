import { ACCESS_PHONE_HEADER } from "./constants.ts";
import { isHardAdminPhone } from "./gate.ts";

export type PhoneAccessLookup = (raw: string) => Promise<{
  ok: boolean;
  allowed?: boolean;
}>;

export function browseOnlyResponse(): Response {
  return Response.json(
    {
      error: "access_required",
      browseOnly: true,
      message:
        "This part of RvFOX is limited to the approved list. Send your number to request access — it does not unlock the app.",
    },
    { status: 403 },
  );
}

export function phoneFromRequest(request: Request): string {
  return (
    request.headers.get(ACCESS_PHONE_HEADER) ||
    request.headers.get("x-rvfox-phone") ||
    ""
  ).trim();
}

async function lookupPhoneAccess(raw: string) {
  const { checkPhoneAccess } = await import("./store");
  return checkPhoneAccess(raw);
}

/** Functional APIs only. Missing / unknown phone → 403. Never auto-approves. */
export async function denyUnlessWhitelisted(
  request: Request,
  checkAccess: PhoneAccessLookup = lookupPhoneAccess,
): Promise<Response | null> {
  const phone = phoneFromRequest(request);
  if (!phone) return browseOnlyResponse();
  // Hard admin is offline-allow so Neon/PGLite being unset cannot 500 the gate.
  if (isHardAdminPhone(phone)) return null;
  try {
    const result = await checkAccess(phone);
    if (!result.ok || !result.allowed) return browseOnlyResponse();
    return null;
  } catch {
    return browseOnlyResponse();
  }
}
