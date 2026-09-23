import {
  ADMIN_LOGIN_REQUIRED_CODE,
  ADMIN_PASSWORD_UNSET_CODE,
  ADMIN_PASSWORD_UNSET_MESSAGE,
  DATABASE_UNAVAILABLE_CODE,
  DATABASE_UNAVAILABLE_MESSAGE,
} from "./adminSheet.ts";
import { isHardAdminPhone } from "./gate.ts";
import { phoneFromRequest } from "./httpGate.ts";

export {
  ADMIN_LOGIN_REQUIRED_CODE,
  ADMIN_PASSWORD_UNSET_CODE,
  ADMIN_PASSWORD_UNSET_MESSAGE,
  DATABASE_UNAVAILABLE_CODE,
  DATABASE_UNAVAILABLE_MESSAGE,
} from "./adminSheet.ts";

export function databaseUrlConfigured(
  raw: string | undefined = typeof process !== "undefined"
    ? process.env.DATABASE_URL
    : undefined,
): boolean {
  return Boolean(raw && String(raw).trim());
}

export type AdminAuthOk = { ok: true; via: "password" | "hard_admin" };
export type AdminAuthFail = {
  ok: false;
  status: 401 | 503;
  code: string;
  error: string;
  message: string;
  passwordConfigured: boolean;
};
export type AdminAuthResult = AdminAuthOk | AdminAuthFail;

export type AdminAuthDeps = {
  tokenValid: boolean;
  databaseUrl: boolean;
  passwordConfigured: boolean;
};

/**
 * Password JWT (optional env) or the hard-admin phone header.
 * Hard-admin writes go to Neon, so DATABASE_URL must be set for that path.
 * Random / beta-seed phones never pass.
 */
export function authorizeAccessAdmin(
  request: Request,
  deps: AdminAuthDeps,
): AdminAuthResult {
  if (deps.tokenValid) return { ok: true, via: "password" };

  const phone = phoneFromRequest(request);
  if (isHardAdminPhone(phone)) {
    if (!deps.databaseUrl) {
      return {
        ok: false,
        status: 503,
        code: DATABASE_UNAVAILABLE_CODE,
        error: "DATABASE_URL is not set.",
        message: DATABASE_UNAVAILABLE_MESSAGE,
        passwordConfigured: deps.passwordConfigured,
      };
    }
    return { ok: true, via: "hard_admin" };
  }

  if (!deps.passwordConfigured) {
    return {
      ok: false,
      status: 401,
      code: ADMIN_PASSWORD_UNSET_CODE,
      error: "WHITELIST_ADMIN_PASSWORD is not set.",
      message: ADMIN_PASSWORD_UNSET_MESSAGE,
      passwordConfigured: false,
    };
  }
  return {
    ok: false,
    status: 401,
    code: ADMIN_LOGIN_REQUIRED_CODE,
    error: "Admin login required.",
    message: "Admin login required.",
    passwordConfigured: true,
  };
}

export function adminMayClearPhoneMemory(auth: AdminAuthResult): boolean {
  return Boolean(auth.ok);
}

export function adminAuthFailureBody(auth: AdminAuthFail) {
  return {
    error: auth.error,
    code: auth.code,
    message: auth.message,
    passwordConfigured: auth.passwordConfigured,
  };
}
