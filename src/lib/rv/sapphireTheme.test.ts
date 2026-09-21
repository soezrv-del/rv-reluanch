import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("theme tokens are sapphire / cobalt — not Tiimo lavender", () => {
  const css = read("../../styles.css");

  assert.match(css, /--color-ink-black:\s*#061228/);
  assert.match(css, /--color-ink-surface:\s*#0c1c40/);
  assert.match(css, /--color-sapphire:\s*#1648c8/);
  assert.match(css, /--color-sapphire-deep:\s*#0a2a8a/);
  assert.match(css, /--color-sapphire-glow:\s*#3d6ee0/);
  assert.match(css, /--color-bg:\s*var\(--color-ink-black\)/);
  assert.match(css, /--color-accent:\s*var\(--color-sapphire\)/);
  assert.match(css, /--color-tiimo-lavender:\s*var\(--color-sapphire\)/);
  assert.match(css, /--dock-surface:\s*#000000/);

  assert.doesNotMatch(css, /--color-tiimo-bg:\s*#1c1b26/);
  assert.doesNotMatch(css, /--color-tiimo-surface:\s*#2a2836/);
  assert.doesNotMatch(css, /--color-tiimo-lavender:\s*#b5a8d0/);
  assert.doesNotMatch(css, /--color-bg:\s*#1c1b26/);
  assert.doesNotMatch(css, /--color-accent:\s*#8fc9b6/);
  assert.doesNotMatch(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(css, /--dock-surface:\s*color-mix\(in srgb, var\(--color-sapphire\)/);
});

test("dock plate matches Raidho mark ground so the tab square disappears", () => {
  const css = read("../../styles.css");
  const tabs = read("../../components/shell/BottomTabs.tsx");

  assert.match(css, /--dock-surface:\s*#000000/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?background:\s*var\(--dock-surface\)/);
  assert.match(css, /border:\s*1px solid var\(--dock-surface\)/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?backdrop-filter:\s*none/);
  assert.match(css, /border-top-color:\s*var\(--color-sapphire\)/);
  assert.match(tabs, /Raidho mark ground/);
  assert.doesNotMatch(css, /\.bottom-tab-indicator-sapphire/);
  assert.doesNotMatch(css, /0 0 16px rgba\(110, 190, 255, 0\.45\)/);
});

test("Raidho sapphire mark sits behind suite, compare, GPS, and NDA", () => {
  const prestige = read("../../assets/prestige.ts");
  const suite = read("../../components/shell/SuitePage.tsx");
  const compare = read("../../components/rvfax/RvCompare.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const nda = read("../../components/access/NdaGate.tsx");
  const css = read("../../styles.css");
  const mark = join(root, "../../../public/assets/brand/raidho-r-mark.png");

  assert.match(prestige, /\/assets\/brand\/raidho-r-mark\.png/);
  assert.ok(existsSync(mark), "raidho-r-mark.png is in public/assets/brand");

  assert.match(suite, /export function SuiteRaidhoBackdrop/);
  assert.match(suite, /suite-raidho-mark/);
  assert.match(suite, /RAIDHO_R_MARK/);
  assert.match(compare, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.match(trips, /SuiteRaidhoBackdrop/);
  assert.doesNotMatch(trips, /TRUTH_MARK_BACKDROP/);
  assert.match(nda, /SuiteRaidhoBackdrop/);

  assert.match(css, /\.suite-raidho-mark,\s*\.compare-raidho-mark/);
  assert.match(css, /mix-blend-mode:\s*screen/);
  assert.match(css, /scale\(1\.9\)/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("Sold and Premium share sapphire accent + Raidho suite chrome — no dock Sold", () => {
  const constants = read("../../components/shell/shellConstants.ts");
  const header = read("../../components/shell/SapphireHeader.tsx");
  const suite = read("../../components/shell/SuitePage.tsx");
  const sold = read("../../components/rvfax/SoldBookApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const dock = read("../../components/shell/BottomTabs.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const css = read("../../styles.css");

  assert.match(constants, /rvsold:\s*"sapphire"/);
  assert.match(constants, /more:\s*"sapphire"/);
  assert.doesNotMatch(constants, /rvsold:\s*"gold"/);
  assert.doesNotMatch(constants, /more:\s*"gold"/);
  assert.match(header, /"rvsold"/);
  assert.match(header, /"more"/);
  assert.match(suite, /data-sold-book=\{tab === "rvsold"/);
  assert.match(suite, /data-premium-screen=\{tab === "more"/);
  assert.match(sold, /SuitePage/);
  assert.match(sold, /tab="rvsold"/);
  assert.match(sold, /raidhoOnly/);
  assert.match(more, /SuitePage/);
  assert.match(more, /tab="more"/);
  assert.match(more, /raidhoOnly/);
  assert.match(more, /onNavigate\?\.\("rvsold"\)/);
  assert.doesNotMatch(dock, /id: "rvsold"/);
  assert.doesNotMatch(dock, /grid-cols-6/);
  assert.match(dock, /grid-cols-5/);
  assert.match(shell, /show\("rvsold"\) && isPro/);
  assert.match(css, /\[data-sold-book\] \.suite-raidho-field/);
  assert.match(css, /\[data-premium-screen\] \.suite-raidho-field/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("Grok tab uses Raidho as a background field, not a front brand plate", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const css = read("../../styles.css");
  assert.match(app, /<SuiteRaidhoBackdrop className="grok-raidho-field" \/>/);
  assert.doesNotMatch(app, /SuiteRaidhoBackdrop bleed/);
  assert.doesNotMatch(app, /ScrollSuiteHeader/);
  assert.doesNotMatch(app, /SuiteBackdrop/);
  assert.match(css, /\[data-rvgrok-wingman\] \.suite-raidho-mark/);
  assert.match(css, /\.grok-frost \{[\s\S]*?blur\(28px\)/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("Facts, Tow, Cal, Sold, Premium, and coach detail are full-bleed Raidho — no leftover photo layer", () => {
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const sold = read("../../components/rvfax/SoldBookApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const suite = read("../../components/shell/SuitePage.tsx");
  const css = read("../../styles.css");

  assert.match(fax, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.doesNotMatch(fax, /FACTS_LANDING_BACKDROP/);
  assert.doesNotMatch(fax, /SuiteBackdrop/);
  assert.match(detail, /data-coach-detail=""/);
  assert.match(detail, /data-raidho-only=""/);
  assert.match(detail, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.match(detail, /data-coach-overview=""/);
  assert.doesNotMatch(detail, /bg-\[#070b14\]/);
  assert.doesNotMatch(detail, /SuiteBackdrop/);
  assert.doesNotMatch(detail, /SHARED_PRESTIGE_BACKDROP/);
  assert.doesNotMatch(detail, /resolveCardImage/);
  assert.doesNotMatch(detail, /aspect-\[16\/9\]/);
  assert.doesNotMatch(detail, /typeMedia/);
  assert.match(tow, /raidhoOnly/);
  assert.doesNotMatch(tow, /TOW_LANDING_BACKDROP/);
  assert.match(cal, /raidhoOnly/);
  assert.match(sold, /raidhoOnly/);
  assert.match(more, /raidhoOnly/);
  assert.match(suite, /raidhoOnly = true/);
  assert.match(suite, /raidhoOnly \? \([\s\S]*SuiteRaidhoBackdrop bleed/);
  assert.match(css, /\.suite-raidho-bleed \{[\s\S]*?object-fit:\s*cover/);
  assert.match(css, /\.suite-raidho-bleed \{[\s\S]*?mix-blend-mode:\s*normal/);
  assert.match(css, /\[data-coach-detail\] \.page-backdrop-bright/);
  assert.match(css, /\[data-cal-screen\] \.page-backdrop-bright/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("Facts RV Search, RV Cal, RV Tow, and coach detail share thick sapphire frost — not solid black", () => {
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const suite = read("../../components/shell/SuitePage.tsx");
  const css = read("../../styles.css");

  assert.match(fax, /data-rv-search-card=""/);
  assert.match(suite, /data-cal-screen=\{tab === "rvcal"/);
  assert.match(cal, /SuitePage/);
  assert.match(tow, /landing="tow"/);
  assert.match(css, /\[data-readable-cards\] \[data-rv-search-card\]\.glass-prestige/);
  assert.match(css, /\[data-readable-cards\]\[data-cal-screen\] \.glass-prestige/);
  assert.match(css, /\[data-readable-cards\]\[data-tow-landing\] \.glass-prestige/);
  assert.match(css, /\[data-readable-cards\]\[data-coach-detail\] \.glass-prestige/);
  assert.match(css, /backdrop-filter:\s*blur\(28px\) saturate\(1\.7\)/);
  assert.doesNotMatch(
    css,
    /\[data-readable-cards\]\[data-tow-landing\][\s\S]*?background:\s*#0a101c/,
  );
  assert.doesNotMatch(css, /DialaBot/);
});
