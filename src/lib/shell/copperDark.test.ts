import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("copper dark rules are dark-scoped; dock is Facts/Inventory/Ask/More with no Chat or plus", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const dock = read("../../components/shell/dock.css");
  const copper = read("../../components/shell/copper-dark.css");
  const home = read("../../components/shell/HomeScreen.tsx");
  const truth = read("../../components/shell/home-truth.css");

  assert.match(tabs, /short: "Facts"/);
  assert.match(tabs, /short: "Inventory"/);
  assert.match(tabs, /short: "Ask"/);
  assert.match(tabs, /short: "More"/);
  assert.doesNotMatch(tabs, /short: "Live Chat"|short: "Chat"/);
  assert.doesNotMatch(tabs, /Action Button|bottom-tab-action|bottom-tab-center|\bPlus\b/);
  assert.match(tabs, /\{ id: "rvgrok", label: "Ask", short: "Ask" \}/);
  assert.match(tabs, /copper-dark\.css/);
  assert.match(tabs, /is-ask/);

  assert.match(copper, /--copper:/);
  assert.match(copper, /--copper-lacquer:/);

  for (const file of [copper, dock, truth]) {
    const darkMarks = [...file.matchAll(/html\[data-theme="dark"\]/g)];
    assert.ok(darkMarks.length > 0, "has dark-scoped rules");
  }

  for (const [name, file] of [
    ["copper-dark.css", copper],
    ["dock dark block", dock.slice(Math.max(0, dock.indexOf("/* Dark dock")))],
    ["home dark block", truth.slice(Math.max(0, truth.indexOf("/* Dark home")))],
  ] as const) {
    const bare = file.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, raw] of bare.matchAll(/([^{};]+)\{/g)) {
      const sel = raw.trim();
      if (!sel || sel.startsWith("@")) continue;
      if (name === "copper-dark.css" && !sel.includes("data-theme")) {
        assert.match(
          sel,
          /^(html\[data-theme="dark"\]|\.garage-)/,
          `${name} unscoped: ${sel}`,
        );
        continue;
      }
      for (const part of sel.split(",")) {
        const p = part.trim();
        if (!p || p.startsWith("@")) continue;
        assert.match(p, /^html\[data-theme="dark"\]/, `${name} dark scope: ${p}`);
      }
    }
  }

  assert.match(home, /Open coach/);
  assert.match(home, /data-home-verified|showroom-verified-pill/);
  assert.match(home, /showroom-hero-primary/);
  // VERIFIED pill, not "VERIFIED AND TRUE" metal line on Home.
  assert.match(home, />\s*VERIFIED\s*</);
  assert.doesNotMatch(home, /MetalVerifiedTrue|Verified and True|VERIFIED AND TRUE/);
  const placard = home.indexOf("showroom-placard");
  const primary = home.indexOf("showroom-hero-primary");
  const floor = home.indexOf("showroom-floor");
  assert.ok(placard >= 0 && primary > placard && floor > primary);
});

test("Ask label sits inside the capsule; copper only when Ask is active", () => {
  const dock = read("../../components/shell/dock.css");
  const copper = read("../../components/shell/copper-dark.css");
  const dark = dock.slice(dock.indexOf("/* Dark dock"));

  // Hide sparkle / glyph; caption is the in-capsule label.
  assert.match(dark, /\.is-ask \.bottom-tab-glyph \{[^}]*display:\s*none/);
  assert.match(dark, /\.is-ask \.bottom-tab-caption/);
  // Quiet glass when inactive; copper only with .is-active / aria-current.
  assert.match(dark, /\.is-ask\.is-active/);
  assert.match(
    copper,
    /bottom-tab-btn\[data-bottom-tab="rvgrok"\]\.is-active/,
  );
  // Must not lacquer every Ask button unconditionally.
  assert.doesNotMatch(
    copper,
    /bottom-tab-btn\[data-bottom-tab="rvgrok"\]:not\(\[data-ask-outline\]\)\s*\{/,
  );
});

test("detail solid spec card; Compare is glass and hidden under 2 saved", () => {
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  const copper = read("../../components/shell/copper-dark.css");

  assert.match(detail, /detail-spec-glass/);
  assert.match(detail, /label: "Length"/);
  assert.match(detail, /label: "Engine"/);
  assert.match(detail, /label: "Slides"/);
  assert.match(detail, /label: "Fuel"/);
  assert.match(copper, /\.detail-spec-glass \{[^}]*background:\s*#1a1714/);
  assert.match(copper, /backdrop-filter:\s*none !important/);

  assert.match(fax, /data-garage-stack|garage-stack/);
  assert.match(fax, /garage-compare-pill/);
  assert.match(fax, /Your garage/);
  assert.match(fax, /savedRows\.length >= 2/);
  assert.doesNotMatch(fax, /data-copper-primary="compare"/);
  // Compare pill is glass (tokens), not assigned --copper-lacquer as its fill.
  assert.match(copper, /\.garage-compare-pill \{[^}]*glass-fill/);
  assert.doesNotMatch(
    copper,
    /\.garage-compare-pill \{[^}]*--copper-lacquer/,
  );
});

test("price and stock render in both themes; eyebrow does not replace them", () => {
  const home = read("../../components/shell/HomeScreen.tsx");
  const truth = read("../../components/shell/home-truth.css");
  const css = read("../../styles.css");

  assert.match(home, /showroom-spotyear/);
  assert.match(home, /showroom-spotprice/);
  assert.match(home, /showroom-spotstock/);
  assert.match(home, /Stock \{specs\.stock\}/);
  // Dark forces eyebrow + price + stock visible.
  assert.match(truth, /\.showroom-spotyear \{[^}]*display:\s*block !important/);
  assert.match(truth, /\.showroom-spotprice \{[^}]*display:\s*block !important/);
  assert.match(truth, /\.showroom-spotstock \{[^}]*display:\s*block !important/);
  // Light keeps price + stock.
  assert.match(css, /html\[data-theme="light"\] \.showroom-spotprice/);
  assert.match(css, /html\[data-theme="light"\] \.showroom-spotstock/);
});
