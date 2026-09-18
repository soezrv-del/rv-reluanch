import { ACCESS_PHONE_HEADER } from "./constants";
import { checkPhoneAccess } from "./store";

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

/** Functional APIs only. Missing / unknown phone → 403. Never auto-approves. */
export async function denyUnlessWhitelisted(
  request: Request,
): Promise<Response | null> {
  const phone = phoneFromRequest(request);
  if (!phone) return browseOnlyResponse();
  const result = await checkPhoneAccess(phone);
  if (!result.ok || !result.allowed) return browseOnlyResponse();
  return null;
}
