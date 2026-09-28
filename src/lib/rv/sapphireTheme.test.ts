import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("blue is the default scheme; a stored white choice stays light", () => {
  const theme = read("../theme.ts");
  const root = read("../../routes/__root.tsx");
  const more = read("../../components/more/MoreApp.tsx");

  assert.match(theme, /=== "white" \? "white" : "blue"/);
  assert.match(theme, /return "blue"/);
  assert.match(theme, /blue: "#061228"/);
  assert.match(theme, /white: "#f2f2f2"/);
  assert.match(root, /var t="blue"/);
  assert.match(root, /stored==="white"\|\|stored==="blue"/);
  assert.match(root, /t==="white"\?"#f2f2f2":"#061228"/);
  assert.match(root, /content: "#061228"/);
  assert.match(more, /useState<ColorScheme>\("blue"\)/);
  assert.match(more, /chooseScheme\(scheme === "white" \? "blue" : "white"\)/);
});

test("theme tokens are sapphire / cobalt — not Tiimo lavender", () => {
  const css = read("../../styles.css");

  assert.match(css, /--color-ink-black:\s*#061228/);
  assert.match(css, /--color-ink-surface:\s*#0c1c40/);
  assert.match(css, /--color-sapphire:\s*#1648c8/);
  assert.match(css, /--color-sapphire-deep:\s*#0a2a8a/);
  assert.match(css, /--color-sapphire-glow:\s*#3d6ee0/);
  assert.match(css, /--color-bg:\s*#f2f2f2/);
  assert.match(css, /html\[data-theme="blue"\][\s\S]*--color-bg:\s*#061228/);
  assert.match(css, /html\[data-theme="blue"\][\s\S]*--color-fg:\s*#f4f7fb/);
  assert.match(css, /html\[data-theme="blue"\][\s\S]*--color-showroom:\s*#05070b/);
  assert.match(css, /html\[data-theme="blue"\][\s\S]*--color-showroom-ink:\s*#eef2f8/);
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
  const mark = join(root, "../../../public/assets/brand/raidho-r-mark-v2.png");

  assert.match(prestige, /\/assets\/brand\/raidho-r-mark-v2\.png/);
  assert.ok(existsSync(mark), "raidho-r-mark-v2.png is in public/assets/brand");

  assert.match(suite, /export function SuiteRaidhoBackdrop/);
  assert.match(suite, /data-showroom-plain/);
  assert.doesNotMatch(suite, /RAIDHO_R_MARK/);
  assert.doesNotMatch(suite, /suite-raidho-bleed/);
  assert.match(compare, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.match(trips, /<SuiteRaidhoBackdrop bleed \/>/);
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
  assert.match(header, /tesla-page-head/);
  assert.match(header, /suite-verified/);
  assert.match(header, /VERIFIED AND TRUE/);
  assert.doesNotMatch(header, /tesla-facts-word/);
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
  assert.match(dock, /grid-cols-6/);
  assert.doesNotMatch(dock, /grid-cols-5/);
  assert.match(shell, /show\("rvsold"\) && isPro/);
  assert.match(css, /\[data-sold-book\] \.suite-raidho-field/);
  assert.match(css, /\[data-premium-screen\] \.suite-raidho-field/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("Grok tab uses Facts Raidho bleed — gold stays on frost, not a photo field", () => {
  const app = read("../../components/rvgrok/RvGrokApp.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const css = read("../../styles.css");
  assert.match(app, /<SuiteRaidhoBackdrop bleed className="grok-raidho-field" \/>/);
  assert.match(app, /data-raidho-only=""/);
  assert.doesNotMatch(app, /ScrollSuiteHeader/);
  assert.doesNotMatch(app, /SuiteBackdrop/);
  assert.match(constants, /rvgrok:\s*"gold"/);
  assert.match(app, /data-page-accent=\{embedded \? undefined : "gold"\}/);
  assert.match(css, /\[data-rvgrok-wingman\] \.suite-raidho-field,/);
  assert.match(css, /\.grok-frost \{[\s\S]*?blur\(28px\)/);
  assert.doesNotMatch(css, /\[data-rvgrok-wingman\] \.suite-raidho-bleed,/);
  assert.doesNotMatch(css, /DialaBot/);
});

test("RV GPS shares Grok black + gold trim tokens", () => {
  const constants = read("../../components/shell/shellConstants.ts");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
  const css = read("../../styles.css");
  assert.match(constants, /rvtrips:\s*"gold"/);
  assert.match(trips, /data-page-accent="gold"/);
  assert.match(trips, /data-raidho-only=""/);
  assert.match(trips, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.match(trips, /<PremiumMenuButton/);
  assert.match(css, /\[data-trips-screen\] \.suite-raidho-field \{[\s\S]*?display:\s*none/);
  assert.match(css, /\[data-trips-screen\] \.glass-prestige[\s\S]*?--color-gold-border/);
  assert.doesNotMatch(trips, /DialaBot/);
});

test("Facts, Tow, Cal, Sold, Premium, Grok, GPS, and coach detail are full-bleed Raidho — no leftover photo layer", () => {
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const tow = read("../../components/rvtow/RvTowApp.tsx");
  const cal = read("../../components/rvcal/RvCalApp.tsx");
  const sold = read("../../components/rvfax/SoldBookApp.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const grok = read("../../components/rvgrok/RvGrokApp.tsx");
  const trips = read("../../components/rvtrips/RvTripsApp.tsx");
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
  assert.match(grok, /<SuiteRaidhoBackdrop bleed className="grok-raidho-field" \/>/);
  assert.match(trips, /<SuiteRaidhoBackdrop bleed \/>/);
  assert.doesNotMatch(trips, /RVTRIPS_AMERICA_BACKDROP|SHARED_PRESTIGE_BACKDROP/);
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
  assert.match(
    css,
    /Grok card frost[\s\S]*?-webkit-backdrop-filter:\s*blur\(28px\) saturate\(1\.7\);\s*backdrop-filter:\s*blur\(28px\) saturate\(1\.7\)/,
  );
  assert.match(
    css,
    /Grok card frost[\s\S]*?rgba\(240,\s*215,\s*140,\s*0\.14\)[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.08\)[\s\S]*?rgba\(10,\s*8,\s*6,\s*0\.18\)/,
  );
  assert.doesNotMatch(
    css,
    /\[data-readable-cards\]\[data-tow-landing\][\s\S]*?background:\s*#0a101c/,
  );
  assert.doesNotMatch(css, /DialaBot/);
});
