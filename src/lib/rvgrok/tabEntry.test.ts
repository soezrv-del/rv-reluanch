import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearGrokSeedOnDockTap,
  grokSeedFromAskHandoff,
  planGrokTabEntry,
} from "./tabEntry.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("dock / empty entry always resets and never seeds", () => {
  assert.deepEqual(planGrokTabEntry(undefined), {
    resetVisibleChat: true,
    seed: null,
  });
  assert.deepEqual(planGrokTabEntry(null), {
    resetVisibleChat: true,
    seed: null,
  });
  assert.deepEqual(planGrokTabEntry(""), {
    resetVisibleChat: true,
    seed: null,
  });
  assert.deepEqual(planGrokTabEntry("   "), {
    resetVisibleChat: true,
    seed: null,
  });
  assert.equal(clearGrokSeedOnDockTap(), undefined);
});

test("Ask Grok seed is one-shot trimmed text after a reset", () => {
  const prompt =
    "  Tell me about the 2023 American Coach American Dream 45A  ";
  assert.deepEqual(planGrokTabEntry(prompt), {
    resetVisibleChat: true,
    seed: prompt.trim(),
  });
  assert.equal(grokSeedFromAskHandoff(prompt), prompt.trim());
  assert.equal(grokSeedFromAskHandoff(""), undefined);
  assert.equal(grokSeedFromAskHandoff("  "), undefined);
  assert.equal(grokSeedFromAskHandoff(undefined), undefined);
});

test("Grok pane consumes active + entryToken so a remounted-hidden chat resets", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(app, /planGrokTabEntry/);
  assert.match(app, /entryToken/);
  assert.match(app, /active(?!: _active)/);
  assert.doesNotMatch(app, /active: _active/);
  assert.match(app, /startNewChat\(\)/);
  assert.match(app, /messagesRef\.current = \[\]/);
  assert.match(app, /sessionIdRef\.current = null/);
  assert.match(app, /onSeedConsumed/);
  assert.match(app, /sendMessageRef\.current\(seed\)/);
});

test("shell: dock tap clears seed; only openGrok may set one", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /clearGrokSeedOnDockTap/);
  assert.match(shell, /grokSeedFromAskHandoff/);
  assert.match(shell, /grokEntryToken/);
  assert.match(
    shell,
    /if \(next === "rvgrok"\) \{[\s\S]*setGrokSeed\(clearGrokSeedOnDockTap\(\)\)/,
  );
  assert.match(shell, /setGrokSeed\(grokSeedFromAskHandoff\(prompt\)\)/);
  assert.match(shell, /entryToken=\{grokEntryToken\}/);
  assert.match(shell, /seedPrompt=\{grokSeed\}/);
  assert.match(shell, /active=\{tab === "rvgrok" && !launchOpen\}/);
});

test("Cal / Tow / Trips / More do not seed or open Grok chat", () => {
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  for (const src of [cal, tow, trips]) {
    assert.doesNotMatch(src, /setGrokSeed|openGrok|seedPrompt|onOpenGrok/);
    assert.doesNotMatch(src, /setTab\(\s*["']rvgrok["']/);
  }
  assert.doesNotMatch(more, /setGrokSeed|openGrok|seedPrompt|onOpenGrok/);
  assert.match(more, /onNavigate\?\.\("rvgrok"\)/);
});

test("Share kit Ask Grok is Facts-owned; fallback is a clean tab change", () => {
  const kit = read("../../components/rvshare/RvShareKit.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  assert.match(kit, /if \(onAskGrok\) \{\s*onAskGrok\(\);/);
  assert.match(kit, /nav\?\.setTab\("rvgrok"\)/);
  assert.doesNotMatch(kit, /openGrok\(/);
  assert.doesNotMatch(kit, /Tell me about the/);
  assert.match(fax, /onOpenGrok\?\.\(/);
  assert.match(fax, /onAskGrok=\{\(\) =>/);
});
