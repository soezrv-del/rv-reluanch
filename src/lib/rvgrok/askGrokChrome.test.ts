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

test("dock is not keyed on overlay open or kb.open", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /hideDock = launchOpen/);
  assert.doesNotMatch(shell, /askGrokOpen/);
  assert.doesNotMatch(shell, /hideDock = launchOpen \|\| kb\.open/);
  assert.match(shell, /blurSuiteFocus/);
  assert.match(shell, /enabled: swipeArmed,/);
});

test("Grok dock tab uses the same Einstein asset as RvGrok; other tabs are icon-free", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const bubble = read("../../components/rvgrok/MessageBubble.tsx");
  const css = read("../../styles.css");

  const grokSrc = bubble.match(/src="(\/assets\/brand\/icon-rvgrok\.png)"/)?.[1];
  assert.equal(grokSrc, "/assets/brand/icon-rvgrok.png");
  assert.match(tabs, /id === "rvgrok"/);
  assert.match(tabs, /src="\/assets\/brand\/icon-rvgrok\.png"/);
  assert.equal(
    (tabs.match(/<img\b/g) || []).length,
    1,
    "dock renders one img — Grok/Live Einstein only",
  );
  assert.doesNotMatch(
    tabs,
    /icon-rvfax|icon-rvcal|icon-rvtow|icon-rvtrips|icon-rvshare|icon-premium/,
  );
  assert.match(
    tabs,
    /isLive \? \([\s\S]*bottom-tab-einstein[\s\S]*\) : \([\s\S]*<DockLabel/,
  );
  assert.doesNotMatch(tabs, /bottom-tab-live flex-col/);
  const liveBranch = tabs.match(/isLive \? \([\s\S]*?\) : \(/)?.[0];
  assert.ok(liveBranch, "Live tab is a dedicated Einstein branch");
  assert.doesNotMatch(liveBranch, /DockLabel/);
  assert.doesNotMatch(liveBranch, />Grok</);
  assert.doesNotMatch(liveBranch, /text=\{short\}/);
  assert.match(tabs, /aria-label=\{isSold \? soldLabel : label\}/);
  assert.match(tabs, /title=\{isSold \? soldLabel : label\}/);
  assert.match(css, /\.bottom-tab-einstein/);
  assert.match(css, /--dock-icon-size:\s*3\.25rem/);
  assert.match(css, /width:\s*var\(--dock-icon-size\)/);
  const einsteinBlocks = [...css.matchAll(/\.bottom-tab-einstein \{[^}]+\}/g)].map(
    (m) => m[0],
  );
  assert.ok(einsteinBlocks.length >= 1, "Einstein size rules present");
  for (const block of einsteinBlocks) {
    assert.doesNotMatch(block, /width:\s*1\.\d+rem/);
    assert.doesNotMatch(block, /height:\s*1\.\d+rem/);
    assert.match(block, /width:\s*(var\(--dock-icon-size\)|2\.75rem)/);
  }
});

test("Removing overlay chrome does not rewrite dock plate or Facts/Tow internals", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const css = read("../../styles.css");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "Grok" \}/);
  assert.match(css, /--dock-surface:\s*#000000/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?background:\s*var\(--dock-surface\)/);
  assert.doesNotMatch(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(css, /background:\s*rgba\(5, 5, 8, 0\.55\)/);
  assert.doesNotMatch(fax, /AskGrokOverlay|setPanelOpen/);
  assert.doesNotMatch(tow, /AskGrokOverlay|setPanelOpen/);
});
