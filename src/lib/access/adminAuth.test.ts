import assert from "node:assert/strict";
import test from "node:test";
import { ACCESS_PHONE_HEADER, HARD_ADMIN } from "./constants.ts";
import {
  authorizeAccessAdmin,
  databaseUrlConfigured,
} from "./adminAuth.ts";
import {
  ADMIN_LOGIN_REQUIRED_CODE,
  ADMIN_PASSWORD_UNSET_CODE,
  ADMIN_PASSWORD_UNSET_MESSAGE,
  DATABASE_UNAVAILABLE_CODE,
  DATABASE_UNAVAILABLE_MESSAGE,
  adminSheetBlockedMessage,
  adminSheetView,
} from "./adminSheet.ts";

function req(phone?: string, auth?: string): Request {
  const headers = new Headers();
  if (phone != null) headers.set(ACCESS_PHONE_HEADER, phone);
  if (auth) headers.set("Authorization", auth);
  return new Request("https://www.rvmax.app/api/access/admin", { headers });
}

test("DATABASE_URL empty or whitespace is unset", () => {
  assert.equal(databaseUrlConfigured(undefined), false);
  assert.equal(databaseUrlConfigured(""), false);
  assert.equal(databaseUrlConfigured("   "), false);
  assert.equal(databaseUrlConfigured("postgres://neon"), true);
});

test("hard-admin header can list/add when DATABASE_URL is set", () => {
  for (const raw of [
    "702-266-5918",
    "7022665918",
    "+17022665918",
    HARD_ADMIN.e164,
  ]) {
    const auth = authorizeAccessAdmin(req(raw), {
      tokenValid: false,
      databaseUrl: true,
      passwordConfigured: false,
    });
    assert.equal(auth.ok, true, raw);
    if (auth.ok) assert.equal(auth.via, "hard_admin", raw);
  }
});

test("hard-admin header without DATABASE_URL is 503, not a password form", () => {
  const auth = authorizeAccessAdmin(req(HARD_ADMIN.digits), {
    tokenValid: false,
    databaseUrl: false,
    passwordConfigured: false,
  });
  assert.equal(auth.ok, false);
  if (!auth.ok) {
    assert.equal(auth.status, 503);
    assert.equal(auth.code, DATABASE_UNAVAILABLE_CODE);
    assert.equal(auth.message, DATABASE_UNAVAILABLE_MESSAGE);
  }
});

test("non-admin phone cannot list or add — including beta seed", () => {
  for (const raw of ["555-000-1111", "702-266-5915", "541-285-8791", ""]) {
    const auth = authorizeAccessAdmin(req(raw || undefined), {
      tokenValid: false,
      databaseUrl: true,
      passwordConfigured: false,
    });
    assert.equal(auth.ok, false, raw || "(missing)");
    if (!auth.ok) {
      assert.equal(auth.status, 401);
      assert.notEqual(auth.code, "hard_admin");
    }
  }
});

test("unset password without hard-admin is friendly 401, not a useful login", () => {
  const auth = authorizeAccessAdmin(req(), {
    tokenValid: false,
    databaseUrl: true,
    passwordConfigured: false,
  });
  assert.equal(auth.ok, false);
  if (!auth.ok) {
    assert.equal(auth.status, 401);
    assert.equal(auth.code, ADMIN_PASSWORD_UNSET_CODE);
    assert.match(auth.error, /WHITELIST_ADMIN_PASSWORD/);
    assert.equal(auth.message, ADMIN_PASSWORD_UNSET_MESSAGE);
    assert.equal(auth.passwordConfigured, false);
  }
});

test("password JWT still authorizes when env is set", () => {
  const auth = authorizeAccessAdmin(req("555-000-1111"), {
    tokenValid: true,
    databaseUrl: true,
    passwordConfigured: true,
  });
  assert.equal(auth.ok, true);
  if (auth.ok) assert.equal(auth.via, "password");
});

test("password configured but no token and no hard-admin → login form", () => {
  const auth = authorizeAccessAdmin(req(), {
    tokenValid: false,
    databaseUrl: true,
    passwordConfigured: true,
  });
  assert.equal(auth.ok, false);
  if (!auth.ok) {
    assert.equal(auth.status, 401);
    assert.equal(auth.code, ADMIN_LOGIN_REQUIRED_CODE);
    assert.equal(auth.passwordConfigured, true);
  }
});

test("unset password → blocked dismissible UI, never a stuck form", () => {
  assert.equal(
    adminSheetView({
      canOpen: true,
      authed: false,
      loading: false,
      code: "load_failed",
    }),
    "blocked",
  );
  assert.equal(
    adminSheetView({
      canOpen: true,
      authed: false,
      loading: false,
      code: ADMIN_PASSWORD_UNSET_CODE,
    }),
    "blocked",
  );
  assert.equal(
    adminSheetBlockedMessage(ADMIN_PASSWORD_UNSET_CODE),
    ADMIN_PASSWORD_UNSET_MESSAGE,
  );
  assert.equal(
    adminSheetView({
      canOpen: true,
      authed: false,
      loading: false,
      code: DATABASE_UNAVAILABLE_CODE,
    }),
    "blocked",
  );
  assert.notEqual(
    adminSheetView({
      canOpen: true,
      authed: false,
      loading: false,
      code: ADMIN_PASSWORD_UNSET_CODE,
    }),
    "password",
  );
});

test("hard-admin authed shows the list; Close is independent of view", () => {
  assert.equal(
    adminSheetView({
      canOpen: true,
      authed: true,
      loading: false,
      code: ADMIN_PASSWORD_UNSET_CODE,
    }),
    "list",
  );
  assert.equal(
    adminSheetView({
      canOpen: true,
      authed: false,
      loading: true,
    }),
    "loading",
  );
  assert.equal(
    adminSheetView({
      canOpen: false,
      authed: false,
      loading: false,
    }),
    "blocked",
  );
});
