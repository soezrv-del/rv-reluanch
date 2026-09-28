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
  const css = read("../../styles.css");

  assert.equal(existsSync(overlayPath), false, "AskGrokOverlay.tsx deleted");
  assert.doesNotMatch(shell, /AskGrokOverlay/);
  assert.doesNotMatch(shell, /data-ask-grok/);
  assert.doesNotMatch(shell, /askGrokOpen|overlaySeed|setAskGrokOpen/);
  assert.doesNotMatch(css, /ask-grok/);
  assert.doesNotMatch(css, /--z-ask-grok/);
  assert.doesNotMatch(css, /--shadow-ask-grok/);
});

test("Grok dock tab still opens the Grok page as today", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "Grok" \}/);

  const pageMount = shell.match(
    /id === "rvgrok" \? \([\s\S]*?<RvGrokApp[\s\S]*?\/>/,
  )?.[0];
  assert.ok(pageMount, "Grok tab still mounts RvGrokApp");
  assert.doesNotMatch(pageMount, /variant=/);
  assert.match(pageMount, /active=\{tab === "rvgrok" && !launchOpen\}/);
  assert.match(pageMount, /entryToken=\{grokEntryToken\}/);
  assert.match(pageMount, /seedPrompt=\{grokSeed\}/);
});

test("Facts Ask Grok seeds the Grok tab; dock tap stays a clean page", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const tabs = read("../../components/shell/BottomTabs.tsx");

  assert.match(shell, /setGrokSeed\(grokSeedFromAskHandoff\(prompt\)\)/);
  assert.match(shell, /setTab\("rvgrok"\)/);
  assert.doesNotMatch(shell, /setAskGrokOpen|overlaySeed|AskGrokOverlay/);

  const openGrok = shell.match(
    /const openGrok = \(prompt\?: string\) => \{[\s\S]*?\n  \};/,
  )?.[0];
  assert.ok(openGrok, "openGrok present");
  assert.match(openGrok, /setGrokSeed\(grokSeedFromAskHandoff\(prompt\)\)/);
  assert.match(openGrok, /setTab\("rvgrok"\)/);
  assert.match(openGrok, /markVisited\("rvgrok"\)/);

  const pageMount = shell.match(
    /id === "rvgrok" \? \([\s\S]*?<RvGrokApp[\s\S]*?\/>/,
  )?.[0];
  assert.ok(pageMount, "Grok tab still mounts RvGrokApp");
  assert.doesNotMatch(pageMount, /variant=/);
  assert.match(pageMount, /active=\{tab === "rvgrok" && !launchOpen\}/);
  assert.match(pageMount, /entryToken=\{grokEntryToken\}/);
  assert.match(pageMount, /seedPrompt=\{grokSeed\}/);

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "Grok" \}/);
  assert.doesNotMatch(tabs, /short: "LIVE!"/);
});

test("old bottom dock is not mounted and keyboard does not gate the shell", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.doesNotMatch(shell, /<BottomTabs/);
  assert.doesNotMatch(shell, /data-bottom-dock/);
  assert.doesNotMatch(shell, /hideDock/);
  assert.doesNotMatch(shell, /askGrokOpen/);
  assert.match(shell, /blurSuiteFocus/);
  assert.match(shell, /enabled: swipeArmed,/);
});

test("the dock is six gold line icons and does not use the Einstein photo", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const bubble = read("../../components/rvgrok/MessageBubble.tsx");
  const css = read("../../styles.css");

  const grokSrc = bubble.match(/src="(\/assets\/brand\/icon-rvgrok\.png)"/)?.[1];
  assert.equal(grokSrc, "/assets/brand/icon-rvgrok.png");
  assert.match(tabs, /id: "rvgrok"/);
  assert.match(tabs, /data-dock-icons="gold"/);
  assert.match(tabs, /bottom-tab-grok/);
  assert.match(tabs, /bottom-tab-glyph/);
  assert.match(
    tabs,
    /short: "Facts"[\s\S]*short: "Cal"[\s\S]*short: "Grok"[\s\S]*short: "Tow"[\s\S]*short: "RV GPS"[\s\S]*short: "Lot"/,
  );
  assert.doesNotMatch(tabs, /icon-rvgrok|bottom-tab-einstein|Einstein|<img\b/);
  assert.match(tabs, /aria-label=\{label\}/);
  assert.match(tabs, /title=\{label\}/);
  assert.match(css, /\.bottom-tab-glyph \{[^}]*color:\s*var\(--color-gold\)/);
  assert.match(css, /\.bottom-tab-grok \{[^}]*#1648c8/);
  assert.match(css, /--dock-icon-size:\s*3\.25rem/);
});

test("Removing overlay chrome does not rewrite dock plate or Facts/Tow internals", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const css = read("../../styles.css");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "Grok" \}/);
  assert.match(css, /--dock-surface:\s*#000000/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?background:\s*var\(--dock-surface\)/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?backdrop-filter:\s*none/);
  assert.doesNotMatch(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(css, /--dock-surface:\s*color-mix\(in srgb, var\(--color-sapphire\)/);
  assert.doesNotMatch(fax, /AskGrokOverlay|setPanelOpen/);
  assert.doesNotMatch(tow, /AskGrokOverlay|setPanelOpen/);
});
