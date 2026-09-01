import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)));

/** @param {string} name */
function src(name) {
  return readFileSync(join(root, name), "utf8");
}

/** @param {string} text */
function hasStaticRvDataImport(text) {
  return /^\s*import[\s\S]*?from\s+["']\.\/rvData["']/m.test(text);
}

test("catalog.ts does not statically import rvData", () => {
  const text = src("catalog.ts");
  assert.equal(hasStaticRvDataImport(text), false);
  assert.match(text, /ensureCatalogLoaded/);
  assert.match(text, /CATALOG_INDEX/);
});

test("suggest.ts does not statically import rvData", () => {
  assert.equal(hasStaticRvDataImport(src("suggest.ts")), false);
});

test("catalogLoad.ts only dynamic-imports rvData", () => {
  const text = src("catalogLoad.ts");
  assert.equal(hasStaticRvDataImport(text), false);
  assert.match(text, /import\("\.\/rvData"\)/);
});

test("AppShell and Facts do not import rvData", () => {
  const shell = readFileSync(
    join(root, "../../components/shell/AppShell.tsx"),
    "utf8",
  );
  const facts = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  assert.equal(shell.includes("rvData"), false);
  assert.equal(facts.includes("rvData"), false);
  assert.match(facts, /useCatalogReady/);
  assert.match(facts, /ensureCatalogLoaded/);
});
