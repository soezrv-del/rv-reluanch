import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isVercelServerlessRuntime,
  pgliteRuntimeSupported,
} from "./dbRuntime.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Vercel / Lambda /var/task is not a PGLite runtime", () => {
  assert.equal(
    pgliteRuntimeSupported({ env: { VERCEL: "1" } }),
    false,
  );
  assert.equal(
    pgliteRuntimeSupported({ env: { VERCEL_ENV: "production" } }),
    false,
  );
  assert.equal(
    pgliteRuntimeSupported({
      env: { AWS_LAMBDA_FUNCTION_NAME: "ssr" },
    }),
    false,
  );
  assert.equal(
    pgliteRuntimeSupported({
      importMetaUrl: "file:///var/task/_ssr/router-BnaArXyi.mjs",
    }),
    false,
  );
  assert.equal(
    pgliteRuntimeSupported({
      importMetaUrl: "file:///workspace/.vercel/output/functions/ssr.func/index.mjs",
    }),
    false,
  );
  assert.equal(
    isVercelServerlessRuntime({ env: { VERCEL: "0" } }),
    false,
  );
  assert.equal(
    pgliteRuntimeSupported({
      env: {},
      importMetaUrl: "file:///workspace/src/lib/db.ts",
    }),
    true,
  );
});

test("db.ts never eager-boots PGLite on an unsupported Vercel runtime", () => {
  const db = read("db.ts");
  assert.match(db, /from "\.\/dbRuntime"/);
  assert.match(db, /pgliteRuntimeSupported/);
  const ensure = db.slice(
    db.indexOf("export function ensureDbReady"),
    db.indexOf("const globalBoot"),
  );
  assert.match(ensure, /if \(!pgliteRuntimeSupported\(\)\) return Promise\.resolve\(\)/);
  assert.ok(
    ensure.indexOf("if (!pgliteRuntimeSupported())") <
      ensure.indexOf("return getSql()"),
  );

  const boot = db.slice(db.indexOf("const globalBoot"));
  assert.match(boot, /pgliteRuntimeSupported\(\)/);
  assert.match(boot, /Do not rethrow/);
});
