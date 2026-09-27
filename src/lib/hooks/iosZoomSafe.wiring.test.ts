import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (rel: string) =>
  readFileSync(new URL(rel, import.meta.url), "utf8");

test("iOS top chrome adds safe-area + slack; bottom dock floor stays 2.125rem", () => {
  const css = read("../../styles.css");
  const hook = read("./nativeWebView.ts");

  assert.match(css, /padding-bottom:\s*max\(2\.125rem, env\(safe-area-inset-bottom/);
  assert.doesNotMatch(
    css,
    /padding-bottom:\s*max\(\s*2\.75rem/,
    "bottom dock pad must stay unchanged",
  );
  assert.match(css, /html\.android-native \.bottom-tabs-nav \{[\s\S]*?--dock-safe-bottom/);

  assert.match(hook, /computeIosZoomSafeSlackPx/);
  assert.match(hook, /--zoom-safe-top/);
  assert.match(hook, /isIosPhoneClient/);
});

test("page heroes sit under the logo; the showroom header owns the top inset", () => {
  const css = read("../../styles.css");
  const header = read("../../components/shell/SapphireHeader.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const landing = read("../../components/rvgrok/GrokLanding.tsx");

  const sapphire = [...css.matchAll(/\.sapphire-header \{[^}]+\}/g)].map((m) => m[0]);
  assert.ok(sapphire.length >= 1, "sapphire header padding rules");
  for (const block of sapphire) {
    assert.doesNotMatch(block, /safe-area-inset-top/);
    assert.doesNotMatch(block, /3\.25rem/);
  }
  assert.match(css, /\.sapphire-header \{[^}]*padding-top:\s*0\.75rem/);
  assert.doesNotMatch(css, /\.premium-menu-corner \{[^}]*safe-area-inset-top/);
  assert.match(css, /\.premium-menu-corner \{[^}]*top:\s*0;/);
  assert.doesNotMatch(css, /\[data-grok-thread-chrome\] \{[^}]*safe-area-inset-top/);
  assert.match(css, /\[data-grok-thread-chrome\] \{[^}]*padding-top:\s*0\.75rem/);

  assert.match(header, /<PremiumMenuButton size="sm"/);
  assert.match(trips, /premium-menu-corner/);
  assert.match(trips, /data-trips-header/);
  assert.match(grok, /data-grok-thread-chrome/);
  assert.match(landing, /data-grok-top-chrome/);
  assert.match(css, /\[data-rvgrok-landing\] \[data-grok-top-chrome\]/);
  assert.doesNotMatch(css, /DialaBot/);
  assert.doesNotMatch(header, /DialaBot/);
});

test("showroom header clears the status bar; parents do not add the inset again", () => {
  const css = read("../../styles.css");
  const brand = read("../../components/shell/SuiteBrand.tsx");
  const shell = read("../../components/shell/AppShell.tsx");

  assert.match(brand, /className="showroom-header"/);
  assert.match(brand, /data-suite-header/);
  assert.match(shell, /<SuiteBrand /);
  assert.match(
    css,
    /\.showroom-header \{[\s\S]*?padding:\s*calc\(env\(safe-area-inset-top, 0px\) \+ 0\.55rem \+ var\(--zoom-safe-top, 0px\)\)/,
  );
  assert.doesNotMatch(
    css,
    /\.app-shell \{[^}]*padding-top:[^;]*safe-area-inset-top/,
  );
  assert.doesNotMatch(
    css,
    /\.showroom-app \{[^}]*padding-top:[^;]*safe-area-inset-top/,
  );
});
