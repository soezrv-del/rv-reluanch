import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Share kit is inline at the bottom of the Facts report", () => {
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const kit = read("../../components/rvshare/RvShareKit.tsx");
  const kitAt = detail.indexOf("<RvShareKit");
  const disclaimerAt = detail.indexOf('<SuiteDisclaimer className="pb-6"');
  assert.ok(kitAt >= 0, "RvDetail mounts RvShareKit");
  assert.ok(disclaimerAt > kitAt, "Share sits above the report disclaimer");
  assert.match(detail, /import \{ RvShareKit \}/);
  assert.match(detail, /shareFocusToken/);
  assert.match(detail, /querySelector\("\[data-share-kit\]"\)/);
  assert.match(kit, /data-share-kit/);
  assert.match(kit, /const sendKit/);
  assert.match(kit, /captureShareCardFile\(\s*shareCardRef\.current/);
  assert.match(kit, /hydrateShareCoachResult\(result\)/);
  assert.match(kit, /data-share-video-toggle/);
  assert.match(kit, /IntersectionObserver/);
  assert.doesNotMatch(kit, /MISSING_KEY_MESSAGE/);
  assert.doesNotMatch(kit, /SAVED UNITS/);
  assert.doesNotMatch(kit, /Try a sample kit/);
});

test("Share launch / More deep-link to Facts — no dock tab, no standalone pane", () => {
  const shell = read("../../components/shell/AppShell.tsx");
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const launch = read("../../components/shell/Launchpad.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const shareApp = read("../../components/rvshare/RvShareApp.tsx");
  const css = read("../../styles.css");

  assert.match(tabs, /\| "rvshare"/);
  assert.doesNotMatch(tabs, /id: "rvshare"/);
  assert.match(tabs, /grid-cols-5/);
  assert.match(tabs, /bottom-tabs-dock/);
  assert.match(tabs, /rounded-\[16px\]/);
  assert.doesNotMatch(tabs, /bottom-tabs-frost/);
  assert.doesNotMatch(tabs, /bottom-tab-indicator/);
  const dockIds = [...tabs.matchAll(/id: "(rvfax|rvcal|rvtow|rvtrips|rvgrok)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(dockIds, ["rvfax", "rvcal", "rvgrok", "rvtow", "rvtrips"]);
  assert.match(
    constants,
    /TAB_ORDER = \[\s*"rvfax",\s*"rvcal",\s*"rvgrok",\s*"rvtow",\s*"rvtrips",\s*\]/,
  );
  assert.doesNotMatch(constants, /TAB_ORDER = \[[^\]]*rvshare/);
  assert.doesNotMatch(launch, /id: "rvshare"/);
  assert.match(more, /onNavigate\?\.\("rvshare"\)/);
  assert.match(shell, /openFactsShare/);
  assert.match(shell, /if \(next === "rvshare"\)/);
  assert.match(shell, /nextTab === "rvshare"/);
  assert.doesNotMatch(shell, /<RvShareApp/);
  assert.match(fax, /factsShareToken/);
  assert.match(fax, /shareFocusToken=\{shareFocusToken\}/);
  assert.match(shareApp, /openFactsShare/);
  assert.match(shareApp, /Opening the coach report to Share/);
  assert.match(css, /--dock-label-size:\s*1rem/);
  assert.match(css, /\.bottom-tabs-dock \{/);
  assert.match(css, /backdrop-filter:\s*blur\(20px\) saturate\(180%\)/);
  assert.match(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.match(css, /border:\s*1px solid rgba\(255, 255, 255, 0\.12\)/);
  assert.match(css, /border-radius:\s*16px/);
  assert.match(css, /box-shadow:\s*0 8px 32px rgba\(0, 0, 0, 0\.37\)/);
  assert.match(css, /font-weight:\s*600/);
  assert.match(css, /letter-spacing:\s*0\.5px/);
  assert.match(css, /color:\s*rgba\(255, 255, 255, 0\.85\)/);
  assert.match(css, /border-top:\s*2px solid transparent/);
  assert.match(css, /border-top-color:\s*var\(--color-sapphire\)/);
  assert.doesNotMatch(tabs, /bottom-tab-etch-halo/);
  assert.doesNotMatch(tabs, /bottom-tab-etch-core/);
  assert.doesNotMatch(tabs, /bottom-tab-etch-bevel/);
  assert.doesNotMatch(tabs, /bottom-tab-etch-face/);
  assert.doesNotMatch(css, /\.bottom-tab-etch-core/);
  assert.doesNotMatch(css, /\.bottom-tab-etch-face/);
  assert.doesNotMatch(css, /--dock-etch-under-hue/);
  assert.doesNotMatch(css, /\.bottom-tab-indicator-sapphire/);
  assert.doesNotMatch(css, /border-radius:\s*1\.45rem/);
  assert.match(tabs, /bottom-tab-label-sold/);
  assert.match(tabs, /bottom-tab-label-sold-owed/);
  assert.doesNotMatch(css, /--color-dock-etch:/);
  assert.doesNotMatch(css, /Milky frosted body/);
  assert.doesNotMatch(css, /rgba\(176, 202, 232, 0\.28\)/);
  assert.doesNotMatch(css, /0 0 16px rgba\(110, 190, 255, 0\.45\)/);
  assert.doesNotMatch(css, /0 0 20px rgba\(120, 200, 255, 0\.52\)/);
  assert.doesNotMatch(css, /drop-shadow\(0 0 5px rgba\(140, 210, 255/);
  assert.doesNotMatch(css, /drop-shadow\(0 0 7px rgba\(160, 220, 255/);
});
