import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function read(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

test("ensureAdminSeed stays admin-only; CSV lives in static seed + 0003", () => {
  const sql = read("migrations/0002_access_whitelist.sql");
  assert.match(sql, /7022665918/);
  assert.match(sql, /\+17022665918/);
  assert.match(sql, /David Hanson/);
  assert.match(sql, /is_admin/);
  assert.doesNotMatch(sql, /15412858791|5594861000|phone-whitelist-seed/);
  const store = read("src/lib/access/store.ts");
  assert.match(store, /Never seeds the CSV list/);
  assert.match(store, /ensureAdminSeed/);
  assert.match(store, /betaSeedAccessResult/);

  const seed = read("src/lib/access/betaWhitelist.ts");
  assert.match(seed, /5412858791/);
  assert.match(seed, /Mark 2/);
  assert.match(seed, /7022665915/);
  assert.match(seed, /David Hansen/);
  assert.doesNotMatch(seed, /7022665918/);

  const m3 = read("migrations/0003_access_beta_seed.sql");
  assert.match(m3, /5412858791/);
  assert.match(m3, /7022665915/);
  assert.match(m3, /on conflict \(phone_digits\) do update set/);
  assert.match(m3, /contact_name = excluded.contact_name/);
  assert.match(m3, /notes = excluded.notes/);
  assert.doesNotMatch(m3, /7022665918/);
});

test("request path is notify-only and cannot grant access", () => {
  const store = read("src/lib/access/store.ts");
  assert.match(store, /insert into access_requests/);
  assert.match(store, /Never inserts into access_whitelist/);
  assert.match(store, /granted: false/);
  const createBlock = store.slice(
    store.indexOf("export async function createAccessRequest"),
    store.indexOf("export async function listWhitelist"),
  );
  assert.doesNotMatch(createBlock, /insert into access_whitelist/);
  const api = read("src/routes/api/access.request.ts");
  assert.match(api, /granted: false/);
  assert.match(api, /Never inserts into access_whitelist/);
});

test("admin CRUD is password-gated and separate from VITE_AUTH_ENABLED", () => {
  const admin = read("src/routes/api/access.admin.ts");
  assert.match(admin, /WHITELIST_ADMIN_PASSWORD/);
  assert.match(admin, /verifyAdminPassword/);
  assert.match(admin, /action === "add"/);
  assert.match(admin, /action === "remove"/);
  const env = read(".grok/app-env.json");
  assert.match(env, /"VITE_AUTH_ENABLED": "false"/);
  assert.doesNotMatch(env, /"VITE_AUTH_ENABLED": "true"/);
});

test("NDA gate wraps the suite and does not grant functional access", () => {
  const index = read("src/routes/index.tsx");
  assert.match(index, /NdaGate/);
  assert.match(index, /<NdaGate>/);
  assert.match(index, /<AppShell \/>/);
  const ndaFirst = index.indexOf("<NdaGate>");
  const shell = index.indexOf("<AppShell");
  assert.ok(ndaFirst >= 0 && ndaFirst < shell);

  const gate = read("src/components/access/NdaGate.tsx");
  assert.match(gate, /hasAcceptedNda/);
  assert.match(gate, /acceptNda/);
  assert.match(gate, /NDA_TEXT/);
  assert.match(gate, /does not\s+unlock restricted tools/);
  assert.doesNotMatch(gate, /allowed:\s*true/);
  // Accept chrome must stay in the visible viewport (not clipped by
  // html/body overflow:hidden + min-h-dvh).
  assert.match(gate, /fixed inset-0/);
  assert.match(gate, /overflow-hidden/);
  assert.match(gate, /min-h-0 flex-1/);
  assert.match(gate, /data-nda-accept-bar/);
  assert.match(gate, /shrink-0/);
  assert.match(gate, /data-nda-checkbox/);
  assert.match(gate, /data-nda-accept/);
  assert.match(gate, /nda-accept-check/);
  assert.match(gate, /disabled=\{!checked\}/);
  assert.match(gate, /data-nda-agree-row/);
  assert.match(gate, /min-h-14/);
  assert.match(gate, /touch-manipulation/);
  assert.match(gate, /Accept & Continue/);
  assert.match(gate, /Tap the agreement row/);

  const css = read("src/styles.css");
  assert.match(css, /\[data-nda-gate\] \.nda-accept-check/);
  assert.match(css, /\[data-nda-gate\] \.nda-accept-glyph/);
  assert.match(css, /color-scheme:\s*light/);
  assert.match(css, /-webkit-appearance:\s*none/);
  assert.match(css, /nda-accept-bar/);
  assert.match(css, /safe-area-inset-bottom/);

  const ndaText = read("src/lib/access/ndaText.ts");
  assert.match(ndaText, /src\/lib\/access\/ndaText\.ts/);
  assert.match(ndaText, /NDA_TEXT/);
  assert.match(ndaText, /does not grant access to restricted tools/);
});

test("access check and request short-circuit hard admin before getSql", () => {
  const store = read("src/lib/access/store.ts");
  const checkBlock = store.slice(
    store.indexOf("export async function checkPhoneAccess"),
    store.indexOf("function toAccessRow"),
  );
  assert.match(checkBlock, /hardAdminAccessResult/);
  assert.match(checkBlock, /betaSeedAccessResult/);
  assert.ok(
    checkBlock.indexOf("hardAdminAccessResult") <
      checkBlock.indexOf("betaSeedAccessResult"),
  );
  assert.ok(
    checkBlock.indexOf("betaSeedAccessResult") <
      checkBlock.indexOf("ensureAdminSeed"),
  );
  assert.ok(
    checkBlock.indexOf("hardAdminAccessResult") <
      checkBlock.indexOf("ensureAdminSeed"),
  );
  assert.ok(
    checkBlock.indexOf("hardAdminAccessResult") <
      checkBlock.indexOf("findWhitelistByPhone"),
  );
  assert.ok(
    checkBlock.indexOf("betaSeedAccessResult") <
      checkBlock.indexOf("findWhitelistByPhone"),
  );

  const createBlock = store.slice(
    store.indexOf("export async function createAccessRequest"),
    store.indexOf("export async function listWhitelist"),
  );
  assert.match(createBlock, /hardAdminRequestResult/);
  assert.ok(
    createBlock.indexOf("hardAdminRequestResult") <
      createBlock.indexOf("ensureAdminSeed"),
  );
  assert.ok(
    createBlock.indexOf("hardAdminRequestResult") <
      createBlock.indexOf("getSql"),
  );

  const requestApi = read("src/routes/api/access.request.ts");
  assert.match(requestApi, /alreadyAdmin/);
  assert.match(requestApi, /Already admin/);
  assert.match(requestApi, /status: result.unavailable \? 503 : 400/);
});

test("http gate short-circuits hard admin and stays on rvgrok", () => {
  const gate = read("src/lib/access/httpGate.ts");
  assert.match(gate, /isHardAdminPhone/);
  assert.match(gate, /isBetaSeedPhone/);
  assert.match(gate, /from "\.\/gate\.ts"/);
  assert.match(gate, /if \(isHardAdminPhone\(phone\)\) return null/);
  assert.match(gate, /if \(isBetaSeedPhone\(phone\)\) return null/);
  assert.ok(
    gate.indexOf("isHardAdminPhone(phone)") < gate.indexOf("isBetaSeedPhone(phone)"),
  );
  assert.doesNotMatch(gate, /ACCESS_GATE_DISABLED/);
  const rvgrok = read("src/routes/api/rvgrok.ts");
  assert.match(rvgrok, /denyUnlessWhitelisted/);
});

test("founder KB stays Hansen; whitelist seed uses Hanson", () => {
  const origin = read("src/lib/rvgrok/originStory.ts");
  assert.match(origin, /David Hansen/);
  assert.doesNotMatch(origin, /David Hanson/);
  const constants = read("src/lib/access/constants.ts");
  assert.match(constants, /David Hanson/);
  assert.match(constants, /Founder KB \/ origin story stay "David Hansen"/);
});
