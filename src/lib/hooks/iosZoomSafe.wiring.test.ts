import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (rel: string) =>
  readFileSync(new URL(rel, import.meta.url), "utf8");

test("iOS phone dock uses 2.75rem / env+0.75rem slack; Android keeps --dock-safe-bottom", () => {
  const css = read("../../styles.css");
  const hook = read("./nativeWebView.ts");

  assert.match(
    css,
    /padding-bottom:\s*max\(\s*2\.75rem,\s*calc\(\s*env\(safe-area-inset-bottom, 0px\) \+ 0\.75rem/,
  );
  assert.match(css, /html\.android-native \.bottom-tabs-nav \{[\s\S]*?--dock-safe-bottom/);
  assert.doesNotMatch(css, /padding-bottom:\s*max\(2\.125rem, env\(safe-area-inset-bottom/);

  assert.match(hook, /computeIosZoomSafeSlackPx/);
  assert.match(hook, /--zoom-safe-top/);
  assert.match(hook, /--zoom-safe-bottom/);
  assert.match(hook, /isIosPhoneClient/);
  assert.match(
    hook,
    /iOS\/web chrome padding is CSS-owned/,
  );
  assert.match(hook, /do not drive dock CSS with it/);
});

test("sapphire header, trips ⋯, and Grok thread chrome add safe-area + slack", () => {
  const css = read("../../styles.css");
  const header = read("../../components/shell/SapphireHeader.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");

  assert.match(
    css,
    /\.sapphire-header \{[\s\S]*?calc\(env\(safe-area-inset-top, 0px\) \+ 0\.5rem \+ var\(--zoom-safe-top/,
  );
  assert.match(css, /\.premium-menu-corner \{[\s\S]*?safe-area-inset-top/);
  assert.match(css, /\[data-grok-thread-chrome\] \{[\s\S]*?safe-area-inset-top/);
  assert.match(css, /--facts-cascade-dock-clear:[\s\S]*?0\.75rem/);
  assert.match(css, /scroll-padding-bottom:[\s\S]*?0\.75rem/);

  assert.match(header, /<PremiumMenuButton size="sm"/);
  assert.match(trips, /premium-menu-corner/);
  assert.match(
    trips,
    /5\.5rem\+env\(safe-area-inset-bottom,0px\)\+0\.75rem\+var\(--zoom-safe-bottom,0px\)/,
  );
  assert.match(grok, /data-grok-thread-chrome/);
  assert.doesNotMatch(css, /DialaBot/);
  assert.doesNotMatch(header, /DialaBot/);
});
