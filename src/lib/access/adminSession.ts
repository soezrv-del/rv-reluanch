import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ACCESS_ADMIN_COOKIE,
  ACCESS_ADMIN_PASSWORD_ENV,
} from "./constants";

const TTL_MS = 12 * 60 * 60 * 1000;

function adminSecret(): string | null {
  const raw =
    typeof process !== "undefined"
      ? process.env[ACCESS_ADMIN_PASSWORD_ENV]
      : undefined;
  const v = raw?.trim();
  return v ? v : null;
}

export function adminPasswordConfigured(): boolean {
  return Boolean(adminSecret());
}

export function verifyAdminPassword(password: string): boolean {
  const expected = adminSecret();
  if (!expected) return false;
  const a = Buffer.from(String(password ?? ""), "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function issueAdminToken(): string {
  const secret = adminSecret();
  if (!secret) throw new Error("Admin password is not configured");
  const exp = Date.now() + TTL_MS;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(parts[2] ?? "", "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function readAdminToken(request: Request): string | null {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim() || null;
  }
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ACCESS_ADMIN_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(ACCESS_ADMIN_COOKIE.length + 1));
}

export function adminCookie(token: string, maxAgeSec = TTL_MS / 1000): string {
  return [
    `${ACCESS_ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeSec)}`,
  ].join("; ");
}

export function clearAdminCookie(): string {
  return `${ACCESS_ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
