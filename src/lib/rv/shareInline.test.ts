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
  assert.match(tabs, /bottom-tabs-frost/);
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
  assert.match(css, /\.bottom-tabs-frost/);
  assert.match(tabs, /bottom-tab-etch-halo/);
  assert.match(tabs, /bottom-tab-etch-core/);
  assert.match(tabs, /bottom-tab-etch-bevel/);
  assert.match(tabs, /bottom-tab-etch-face/);
  assert.match(css, /\.bottom-tab-etch-core/);
  assert.match(css, /\.bottom-tab-etch-face/);
  assert.match(css, /\.bottom-tab-etch-core[\s\S]*background-clip:\s*text/);
  assert.match(css, /\.bottom-tab-etch-face[\s\S]*#ffffff/);
  assert.match(css, /drop-shadow\(0 -0\.55px 0 #ffffff\)/);
  assert.match(css, /0 0 16px rgba\(110, 190, 255, 0\.45\)/);
  assert.match(css, /\.bottom-tab-label\.is-etched-active \.bottom-tab-etch-core/);
  assert.match(tabs, /bottom-tab-label-sold/);
  assert.match(tabs, /bottom-tab-label-sold-owed/);
  assert.doesNotMatch(css, /--color-dock-etch:/);
  assert.doesNotMatch(css, /Milky frosted body/);
  assert.doesNotMatch(css, /rgba\(176, 202, 232, 0\.28\)/);
  assert.doesNotMatch(css, /\.bottom-tab-etch-face[\s\S]{0,180}-webkit-text-stroke/);
});
