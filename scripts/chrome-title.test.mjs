import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("document title and share card are public RvFOX, not Mark Class", () => {
  const head = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
  const site = JSON.parse(
    readFileSync(join(root, "src/lib/og/site.json"), "utf8"),
  );
  assert.match(head, /RvFOX · Know before you buy\./);
  assert.doesNotMatch(head, /Mark Class/);
  assert.doesNotMatch(head, /Grok Builder/);
  assert.equal(site.title, "RvFOX · Know before you buy.");
  assert.doesNotMatch(site.title, /Mark Class/);
});

test("splash feature tiles call pickTool on click and expose data-launch-tool", () => {
  const src = readFileSync(
    join(root, "src/components/shell/Launchpad.tsx"),
    "utf8",
  );
  assert.match(src, /data-launch-tool=\{item\.id\}/);
  assert.match(src, /onClick=\{\(\) => pickTool\(item\.id\)\}/);
  assert.match(src, /onPointerUp=\{\(e\) => onToolPointerUp\(item\.id, e\)\}/);
  for (const id of [
    "rvfax",
    "rvcal",
    "rvtow",
    "rvtrips",
    "rvshare",
    "rvgrok",
    "more",
  ]) {
    assert.match(src, new RegExp(`id: "${id}"`));
  }
});
