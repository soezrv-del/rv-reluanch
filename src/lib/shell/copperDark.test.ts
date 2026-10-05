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

  // New look tokens/rules in copper-dark + dark dock/home must not introduce light-mode look changes.
  for (const [name, file] of [
    ["copper-dark.css", copper],
    ["dock dark block", dock.slice(Math.max(0, dock.indexOf("/* Dark dock")))],
    ["home dark block", truth.slice(Math.max(0, truth.indexOf("/* Dark home")))],
  ] as const) {
    const bare = file.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, raw] of bare.matchAll(/([^{};]+)\{/g)) {
      const sel = raw.trim();
      if (!sel || sel.startsWith("@")) continue;
      // Structural garage layout (unscoped) is allowed only in copper-dark.css outside dark blocks.
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
  assert.match(home, /data-home-verified|showroom-spot-verified/);
  assert.match(home, /showroom-hero-primary/);
  // Open coach sits under the placard, before the floor photo.
  const placard = home.indexOf("showroom-placard");
  const primary = home.indexOf("showroom-hero-primary");
  const floor = home.indexOf("showroom-floor");
  assert.ok(placard >= 0 && primary > placard && floor > primary);
});

test("detail glass spec card and garage stack are wired", () => {
  const detail = read("../../components/rvfax/RvDetail.tsx");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");
  assert.match(detail, /detail-spec-glass/);
  assert.match(detail, /label: "Length"/);
  assert.match(detail, /label: "Engine"/);
  assert.match(detail, /label: "Slides"/);
  assert.match(detail, /label: "Fuel"/);
  assert.match(fax, /data-garage-stack|garage-stack/);
  assert.match(fax, /garage-compare-pill/);
  assert.match(fax, /Your garage/);
  assert.match(fax, /data-copper-primary="compare"/);
});
