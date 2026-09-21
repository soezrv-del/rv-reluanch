import assert from "node:assert/strict";
import test from "node:test";
import { mock } from "node:test";
import { ACCESS_PHONE_HEADER, HARD_ADMIN } from "./constants.ts";
import { denyUnlessWhitelisted } from "./httpGate.ts";

function requestWithPhone(phone?: string): Request {
  const headers = new Headers();
  if (phone != null) headers.set(ACCESS_PHONE_HEADER, phone);
  return new Request("https://www.rvmax.app/api/rvgrok", {
    method: "POST",
    headers,
  });
}

async function readBrowseOnly(res: Response | null) {
  assert.ok(res, "expected a 403 response");
  assert.equal(res.status, 403);
  const body = (await res.json()) as { browseOnly?: boolean; error?: string };
  assert.equal(body.browseOnly, true);
  assert.equal(body.error, "access_required");
}

test("hard-admin phone bypasses without calling store", async () => {
  const checkAccess = mock.fn(async () => {
    throw new Error("store should not be called for hard admin");
  });
  for (const raw of [
    "702-266-5918",
    "+17022665918",
    "7022665918",
    HARD_ADMIN.e164,
  ]) {
    const denied = await denyUnlessWhitelisted(
      requestWithPhone(raw),
      checkAccess,
    );
    assert.equal(denied, null, raw);
  }
  assert.equal(checkAccess.mock.callCount(), 0);
});

test("missing phone is still 403 browseOnly", async () => {
  const checkAccess = mock.fn(async () => {
    throw new Error("store should not be called without a phone");
  });
  await readBrowseOnly(await denyUnlessWhitelisted(requestWithPhone(), checkAccess));
  await readBrowseOnly(
    await denyUnlessWhitelisted(requestWithPhone(""), checkAccess),
  );
  assert.equal(checkAccess.mock.callCount(), 0);
});

test("random phone is denied when store says no", async () => {
  const checkAccess = mock.fn(async () => ({
    ok: true as const,
    allowed: false,
    isAdmin: false,
    name: "",
    phoneDigits: "5551234567",
    phoneE164: "+15551234567",
  }));
  await readBrowseOnly(
    await denyUnlessWhitelisted(requestWithPhone("555-123-4567"), checkAccess),
  );
  assert.equal(checkAccess.mock.callCount(), 1);
  assert.equal(checkAccess.mock.calls[0]?.arguments[0], "555-123-4567");
});

test("beta seed phone bypasses without calling store", async () => {
  const checkAccess = mock.fn(async () => {
    throw new Error("store should not be called for a seeded tester");
  });
  for (const raw of ["5412858791", "+15412858791", "541-285-8791", "7022665915"]) {
    const denied = await denyUnlessWhitelisted(
      requestWithPhone(raw),
      checkAccess,
    );
    assert.equal(denied, null, raw);
  }
  assert.equal(checkAccess.mock.callCount(), 0);
});

test("store failure for a non-admin phone is 403 browseOnly", async () => {
  const checkAccess = mock.fn(async () => {
    throw new Error("PGLite is unavailable in this runtime. Set DATABASE_URL for Neon.");
  });
  await readBrowseOnly(
    await denyUnlessWhitelisted(requestWithPhone("555-000-1111"), checkAccess),
  );
  assert.equal(checkAccess.mock.callCount(), 1);
});
