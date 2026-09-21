import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("RvGrokApp defaults to page variant and gates suite chrome for embedded", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");

  assert.match(app, /export type RvGrokVariant = "page" \| "embedded"/);
  assert.match(app, /variant = "page"/);
  assert.match(app, /variant\?: RvGrokVariant/);
  assert.match(app, /const embedded = variant === "embedded"/);
  assert.match(app, /data-rvgrok-variant=\{variant\}/);

  assert.match(app, /!embedded && <SuiteRaidhoBackdrop bleed \/>/);
  assert.match(
    app,
    /!embedded && \(\s*<ScrollSuiteHeader tab="rvgrok"/,
  );
  assert.match(
    app,
    /usePullToReset\(listRef, startNewChat, \{ enabled: !embedded \}\)/,
  );
  assert.match(
    app,
    /embedded \? \(\s*startersOrThread\s*\) : \(\s*<PullRefreshLayer/,
  );

  // One header: overlay title/close. Embedded hides History/Agent/Voice.
  assert.match(app, /!embedded && !isLanding/);
  assert.match(app, /<HistoryPanel/);
  assert.match(app, /<VoicePanel/);
  assert.match(app, /Ask RV Grok/);
  assert.match(app, /GROK_STARTERS/);
  assert.match(app, /planGrokTabEntry/);
  assert.match(app, /onSeedConsumed/);
  assert.match(app, /Live Voice/);
});

test("Grok tab stays default page variant", () => {
  const shell = read("../../components/shell/AppShell.tsx");

  const pageMount = shell.match(
    /id === "rvgrok" \? \([\s\S]*?<RvGrokApp[\s\S]*?\/>/,
  )?.[0];
  assert.ok(pageMount, "Grok tab still mounts RvGrokApp");
  assert.doesNotMatch(pageMount, /variant=/);
  assert.match(pageMount, /active=\{tab === "rvgrok" && !launchOpen\}/);
  assert.match(pageMount, /entryToken=\{grokEntryToken\}/);
  assert.match(pageMount, /seedPrompt=\{grokSeed\}/);
});

test("GROK_STARTERS densify on short viewports with ≥44px tap targets", () => {
  const landing = read("../../components/rvgrok/GrokLanding.tsx");
  const css = read("../../styles.css");

  assert.match(landing, /className="grok-starters /);
  assert.match(landing, /className="grok-starter /);
  assert.match(landing, /min-h-11/);
  assert.match(css, /@media \(max-height: 740px\)/);
  assert.match(css, /\.grok-starter \{/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /\.grok-starters-list \{/);
});
