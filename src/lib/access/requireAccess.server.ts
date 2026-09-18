import { isPhoneOnWhitelist } from "./store.server.ts";
import { ACCESS_PHONE_HEADER, normalizePhoneE164 } from "./phone.ts";

export function readAccessPhone(request: Request): string | null {
  const header = request.headers.get(ACCESS_PHONE_HEADER);
  if (header) return normalizePhoneE164(header);
  try {
    return normalizePhoneE164(new URL(request.url).searchParams.get("phone"));
  } catch {
    return null;
  }
}

/** 403 when the caller is not on the persistent whitelist. */
export async function denyUnlessWhitelisted(
  request: Request,
): Promise<Response | null> {
  const phone = readAccessPhone(request);
  if (!phone) {
    return Response.json(
      {
        error: "Access required. Enter your phone in Premium.",
        code: "access_required",
      },
      { status: 403 },
    );
  }
  if (!(await isPhoneOnWhitelist(phone))) {
    return Response.json(
      {
        error: "This number is browse-only. Request access from Premium.",
        code: "not_whitelisted",
      },
      { status: 403 },
    );
  }
  return null;
}
