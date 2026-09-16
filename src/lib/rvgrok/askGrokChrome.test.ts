import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Ask Grok chrome mounts overlay-only and hides on the Grok route", () => {
  const overlayPath = join(root, "../../components/shell/AskGrokOverlay.tsx");
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");

  assert.equal(existsSync(overlayPath), true, "AskGrokOverlay.tsx restored");
  assert.match(overlay, /data-ask-grok-badge/);
  assert.match(overlay, /data-ask-grok-panel/);
  assert.match(overlay, /data-ask-grok-close/);
  assert.match(overlay, /data-ask-grok-mount/);
  assert.match(overlay, /const onGrokRoute = tab === "rvgrok"/);
  assert.match(overlay, /showBadge = !onGrokRoute && !launchOpen/);
  assert.match(overlay, /Ask Grok/);
  assert.match(overlay, /aria-expanded=\{open\}/);
  assert.match(shell, /<AskGrokOverlay/);
  assert.match(shell, /tab=\{tab\}/);
  assert.match(shell, /launchOpen=\{launchOpen\}/);
  assert.match(css, /\.ask-grok-badge \{/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /--z-ask-grok-badge:\s*90/);
  assert.match(css, /--z-ask-grok-panel:\s*70/);
  assert.match(css, /z-index:\s*var\(--z-ask-grok-badge\)/);
  assert.match(css, /z-index:\s*var\(--z-ask-grok-panel\)/);
});

test("GROK MOUNT POINT is RvGrokApp — chrome does not fork chat", () => {
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");
  assert.match(overlay, /@\/components\/rvgrok\/RvGrokApp/);
  assert.match(overlay, /<RvGrokApp[\s\S]*variant="embedded"/);
  assert.match(overlay, /<RvGrokApp[\s\S]*active=\{open\}/);
  assert.match(overlay, /seedPrompt=\{seedPrompt\}/);
  assert.match(overlay, /onSeedConsumed=\{onSeedConsumed\}/);
  assert.doesNotMatch(overlay, /streamChat|GrokRealtimeSession|sendMessage/);
  assert.doesNotMatch(overlay, /setTab\(|onNavigate/);
});

test("overlay a11y: focus trap, restore badge, no hidden/display:none mid-transition", () => {
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");
  const css = read("../../styles.css");

  assert.match(overlay, /aria-expanded=\{open\}/);
  assert.match(overlay, /aria-hidden=\{!open\}/);
  assert.match(overlay, /aria-modal="true"/);
  assert.match(overlay, /e\.key === "Escape"/);
  assert.match(overlay, /e\.key !== "Tab"/);
  assert.match(overlay, /badgeRef\.current/);
  assert.match(overlay, /target\.focus\(\)/);
  assert.doesNotMatch(overlay, / hidden=\{/);
  assert.doesNotMatch(overlay, /[^a-]hidden=\{!open\}/);
  assert.doesNotMatch(css, /\.ask-grok-layer\[hidden\]/);
  assert.match(css, /\.ask-grok-layer \{/);
  assert.match(css, /visibility:\s*hidden/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /\.ask-grok-layer\.is-open \{/);
  assert.match(css, /never toggle hidden/);
});

test("Facts Ask Grok seeds the overlay; dock Grok tab stays a clean page", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");
  const tabs = read("../../components/shell/BottomTabs.tsx");

  assert.match(shell, /setOverlaySeed\(grokSeedFromAskHandoff\(prompt\)\)/);
  assert.match(shell, /setAskGrokOpen\(true\)/);
  assert.match(shell, /seedPrompt=\{overlaySeed\}/);
  assert.match(overlay, /seedPrompt=\{seedPrompt\}/);

  const openGrok = shell.match(
    /const openGrok = \(prompt\?: string\) => \{[\s\S]*?\n  \};/,
  )?.[0];
  assert.ok(openGrok, "openGrok present");
  assert.doesNotMatch(openGrok, /setTab\(/);
  assert.doesNotMatch(openGrok, /setGrokSeed\(/);

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

test("dock is hidden while the overlay is open — not keyed on kb.open", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  assert.match(shell, /hideDock = launchOpen \|\| askGrokOpen/);
  assert.doesNotMatch(shell, /hideDock = launchOpen \|\| kb\.open/);
  assert.match(shell, /blurSuiteFocus/);
  assert.match(shell, /enabled: swipeArmed && !askGrokOpen/);
});

test("Ask Grok overlay does not rewrite dock glass or Facts/Tow internals", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const css = read("../../styles.css");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");

  assert.match(tabs, /\{ id: "rvgrok", label: "RvGROK", short: "Grok" \}/);
  assert.match(css, /backdrop-filter:\s*blur\(20px\) saturate\(180%\)/);
  assert.match(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(overlay, /onOpenGrok|openTowWithCoach|setGrokSeed/);
  assert.doesNotMatch(fax, /AskGrokOverlay|setPanelOpen/);
  assert.doesNotMatch(tow, /AskGrokOverlay|setPanelOpen/);
});
