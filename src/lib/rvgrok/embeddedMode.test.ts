import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("RvGrokApp is page-only — no overlay embedded variant or leftover splash/nav props", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");

  assert.doesNotMatch(app, /RvGrokVariant/);
  assert.doesNotMatch(app, /variant\?:/);
  assert.doesNotMatch(app, /embedded/);
  assert.doesNotMatch(app, /onSplashPlayingChange/);
  assert.doesNotMatch(app, /onNavigate/);
  assert.doesNotMatch(app, /data-rvgrok-variant/);

  assert.match(app, /<SuiteBackdrop \/>/);
  assert.match(app, /<ScrollSuiteHeader tab="rvgrok"/);
  assert.match(app, /usePullToReset\(listRef, startNewChat\)/);
  assert.match(app, /<PullRefreshLayer/);

  assert.match(app, /<HistoryPanel/);
  assert.match(app, /<VoicePanel/);
  assert.match(app, /Ask RV Grok/);
  assert.match(app, /GROK_STARTERS/);
  assert.match(app, /planGrokTabEntry/);
  assert.match(app, /onSeedConsumed/);
});

test("Grok tab stays default page variant", () => {
  const shell = read("../../components/shell/AppShell.tsx");

  const pageMount = shell.match(
    /id === "rvgrok" \? \([\s\S]*?<RvGrokApp[\s\S]*?\/>/,
  )?.[0];
  assert.ok(pageMount, "Grok tab still mounts RvGrokApp");
  assert.doesNotMatch(pageMount, /variant=/);
  assert.doesNotMatch(pageMount, /onSplashPlayingChange/);
  assert.doesNotMatch(pageMount, /onNavigate=/);
  assert.match(pageMount, /active=\{tab === "rvgrok" && !launchOpen\}/);
  assert.match(pageMount, /entryToken=\{grokEntryToken\}/);
  assert.match(pageMount, /seedPrompt=\{grokSeed\}/);
});
