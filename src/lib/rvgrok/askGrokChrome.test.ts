import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Ask Grok chrome mounts overlay-only and hides on the Grok route", () => {
  const overlay = read("../../components/shell/AskGrokOverlay.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");

  assert.match(overlay, /data-ask-grok-badge/);
  assert.match(overlay, /data-ask-grok-panel/);
  assert.match(overlay, /data-ask-grok-close/);
  assert.match(overlay, /data-ask-grok-mount/);
  assert.match(overlay, /const onGrokRoute = tab === "rvgrok"/);
  assert.match(overlay, /showBadge = !onGrokRoute && !launchOpen/);
  assert.match(overlay, /Ask Grok/);
  assert.match(shell, /<AskGrokOverlay tab=\{tab\} launchOpen=\{launchOpen\} \/>/);
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
  assert.match(overlay, /<RvGrokApp[\s\S]*active=\{panelOpen\}/);
  assert.match(overlay, /seedPrompt=\{seedPrompt\}/);
  assert.match(overlay, /onSeedConsumed=\{onSeedConsumed\}/);
  assert.doesNotMatch(overlay, /streamChat|GrokRealtimeSession|sendMessage/);
  assert.doesNotMatch(overlay, /setTab\(|onNavigate/);
});

test("Ask Grok overlay does not rewrite dock, glass plate, or Facts/Tow", () => {
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
