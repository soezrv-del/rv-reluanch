import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Ask Grok floating badge and overlay chrome are gone", () => {
  const overlayPath = join(root, "../../components/shell/AskGrokOverlay.tsx");
  const shell = read("../../components/shell/AppShell.tsx");

  assert.equal(existsSync(overlayPath), false, "AskGrokOverlay.tsx deleted");
  assert.doesNotMatch(shell, /AskGrokOverlay/);
  assert.doesNotMatch(shell, /data-ask-grok/);
});

test("LIVE! dock tab still opens the Grok page as today", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "LIVE!" \}/);

  const pageMount = shell.match(
    /id === "rvgrok" \? \([\s\S]*?<RvGrokApp[\s\S]*?\/>/,
  )?.[0];
  assert.ok(pageMount, "Grok tab still mounts RvGrokApp");
  assert.doesNotMatch(pageMount, /variant=/);
  assert.match(pageMount, /active=\{tab === "rvgrok" && !launchOpen\}/);
  assert.match(pageMount, /entryToken=\{grokEntryToken\}/);
  assert.match(pageMount, /seedPrompt=\{grokSeed\}/);
});

test("Removing overlay chrome does not rewrite dock, glass plate, or Facts/Tow", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const css = read("../../styles.css");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "LIVE!" \}/);
  assert.match(css, /backdrop-filter:\s*blur\(20px\) saturate\(180%\)/);
  assert.match(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(fax, /AskGrokOverlay|setPanelOpen/);
  assert.doesNotMatch(tow, /AskGrokOverlay|setPanelOpen/);
});
