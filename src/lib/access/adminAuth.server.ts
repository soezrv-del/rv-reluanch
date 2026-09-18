import { SignJWT, jwtVerify } from "jose";
import { passwordsMatch } from "./passwordMatch.ts";

export { passwordsMatch };

export const ACCESS_ADMIN_COOKIE = "rvfox_access_admin";
const COOKIE_MAX_AGE = 60 * 60 * 12;

export function readAdminPassword(): string | null {
  const a = process.env.WHITELIST_ADMIN_PASSWORD?.trim();
  if (a) return a;
  const b = process.env.ACCESS_ADMIN_PASSWORD?.trim();
  return b || null;
}

function secretKey(password: string): Uint8Array {
  return new TextEncoder().encode(`rvfox-access-admin:v1:${password}`);
}

function cookieSecure(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function serializeAdminCookie(token: string, clear = false): string {
  const parts = [
    `${ACCESS_ADMIN_COOKIE}=${clear ? "" : token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${COOKIE_MAX_AGE}`,
  ];
  if (cookieSecure()) parts.push("Secure");
  return parts.join("; ");
}

export async function signAdminToken(password: string): Promise<string> {
  return new SignJWT({ role: "access-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(secretKey(password));
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const password = readAdminPassword();
  if (!password || !token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(password));
    return payload.role === "access-admin";
  } catch {
    return false;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return null;
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const token = readCookie(request, ACCESS_ADMIN_COOKIE);
  if (!token) return false;
  return verifyAdminToken(token);
}
