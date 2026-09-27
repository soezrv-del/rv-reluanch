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

test("Ask box opens the Grok page; Grok is not a dock tab", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");

  assert.doesNotMatch(tabs, /id: "rvgrok"/);
  assert.match(tabs, /label: "Facts"/);
  assert.match(tabs, /label: "Cal"/);
  assert.match(tabs, /label: "Tow"/);
  assert.match(tabs, /label: "Lot"/);

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

  assert.doesNotMatch(tabs, /id: "rvgrok"/);
  assert.doesNotMatch(tabs, /short: "LIVE!"/);
  assert.match(tabs, /label: "Facts"/);
});

test("dock is not keyed on overlay open or kb.open", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /hideDock = launchOpen/);
  assert.doesNotMatch(shell, /askGrokOpen/);
  assert.doesNotMatch(shell, /hideDock = launchOpen \|\| kb\.open/);
  assert.match(shell, /blurSuiteFocus/);
  assert.doesNotMatch(shell, /useSwipeTabs/);
});

test("Dock is Facts Cal Tow Lot, icon-free, with no Grok square", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const bubble = read("../../components/rvgrok/MessageBubble.tsx");

  const grokSrc = bubble.match(/src="(\/assets\/brand\/icon-rvgrok\.png)"/)?.[1];
  assert.equal(grokSrc, "/assets/brand/icon-rvgrok.png");
  assert.equal((tabs.match(/<img\b/g) || []).length, 0, "dock renders no images");
  assert.doesNotMatch(tabs, /id: "rvgrok"|id: "rvtrips"|short: "Grok"/);
  assert.doesNotMatch(
    tabs,
    /icon-rvfax|icon-rvcal|icon-rvtow|icon-rvtrips|icon-rvshare|icon-premium|bottom-tab-einstein/,
  );
  assert.match(tabs, /aria-label=\{label\}/);
  assert.doesNotMatch(tabs, />Grok</);
  assert.doesNotMatch(tabs, /isSold/);
  const dockIds = [...tabs.matchAll(/id: "(rvfax|rvcal|rvtow|rvlot)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(dockIds, ["rvfax", "rvcal", "rvtow", "rvlot"]);
});

test("Removing overlay chrome does not rewrite dock plate or Facts/Tow internals", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const css = read("../../styles.css");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");

  assert.doesNotMatch(tabs, /id: "rvgrok"/);
  assert.match(tabs, /label: "Facts"/);
  assert.match(css, /--dock-surface:\s*#000000/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?background:\s*var\(--dock-surface\)/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?backdrop-filter:\s*none/);
  assert.doesNotMatch(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(css, /--dock-surface:\s*color-mix\(in srgb, var\(--color-sapphire\)/);
  assert.doesNotMatch(fax, /AskGrokOverlay|setPanelOpen/);
  assert.doesNotMatch(tow, /AskGrokOverlay|setPanelOpen/);
});
