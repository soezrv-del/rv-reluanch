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

test("cold open has no splash tiles, chooser, or launch-tool gate", () => {
  const src = readFileSync(
    join(root, "src/components/shell/Launchpad.tsx"),
    "utf8",
  );
  const shell = readFileSync(
    join(root, "src/components/shell/AppShell.tsx"),
    "utf8",
  );
  assert.doesNotMatch(src, /data-launch-tool/);
  assert.doesNotMatch(src, /pickTool/);
  assert.doesNotMatch(src, /onToolPointerUp/);
  assert.doesNotMatch(src, /export function Launchpad/);
  assert.doesNotMatch(shell, /<Launchpad/);
  assert.match(src, /export function MetalVerifiedTrue/);
});
