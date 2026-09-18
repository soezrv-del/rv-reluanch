import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("access gate is wired — not Better Auth, not pro tier", () => {
  const env = src("../../../.grok/app-env.json");
  assert.match(env, /"VITE_AUTH_ENABLED": "false"/);
  assert.match(env, /"database": true/);
  assert.doesNotMatch(src("../../components/more/MoreApp.tsx"), /VITE_AUTH_ENABLED/);

  const more = src("../../components/more/MoreApp.tsx");
  assert.match(more, /Access admin/);
  assert.match(more, /openAdmin/);
  assert.match(more, /Your phone/);

  const shell = src("../../components/shell/AppShell.tsx");
  assert.match(shell, /AccessProvider/);
  assert.match(shell, /requestFunctional/);

  const fax = src("../../components/rvfax/RvFaxApp.tsx");
  assert.match(fax, /access\.guard/);
  assert.match(fax, /toggleSave/);
  assert.match(fax, /beginSell/);

  const grok = src("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(grok, /access\.allowed/);
  assert.match(grok, /requestFunctional/);

  const status = src("../../routes/api/access.status.ts");
  assert.match(status, /createFileRoute\("\/api\/access\/status"\)/);
  const admin = src("../../routes/api/access.admin.ts");
  assert.match(admin, /WHITELIST_ADMIN_PASSWORD/);
  assert.match(admin, /ACCESS_ADMIN_PASSWORD/);
  assert.doesNotMatch(admin, /authMiddleware/);

  const grokApi = src("../../routes/api/rvgrok.ts");
  assert.match(grokApi, /denyUnlessWhitelisted/);
  assert.doesNotMatch(src("../../../.grok/app-env.json"), /STRIPE|stripe/);
});
