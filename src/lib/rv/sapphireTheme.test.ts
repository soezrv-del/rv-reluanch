import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("theme tokens are sapphire / cobalt — not Tiimo lavender or dock-black", () => {
  const css = read("../../styles.css");

  assert.match(css, /--color-ink-black:\s*#061228/);
  assert.match(css, /--color-ink-surface:\s*#0c1c40/);
  assert.match(css, /--color-sapphire:\s*#1648c8/);
  assert.match(css, /--color-sapphire-deep:\s*#0a2a8a/);
  assert.match(css, /--color-sapphire-glow:\s*#3d6ee0/);
  assert.match(css, /--color-bg:\s*var\(--color-ink-black\)/);
  assert.match(css, /--color-accent:\s*var\(--color-sapphire\)/);
  assert.match(css, /--color-tiimo-lavender:\s*var\(--color-sapphire\)/);
  assert.match(css, /--dock-surface:\s*color-mix\(in srgb, var\(--color-sapphire\)/);

  assert.doesNotMatch(css, /--color-tiimo-bg:\s*#1c1b26/);
  assert.doesNotMatch(css, /--color-tiimo-surface:\s*#2a2836/);
  assert.doesNotMatch(css, /--color-tiimo-lavender:\s*#b5a8d0/);
  assert.doesNotMatch(css, /--color-bg:\s*#1c1b26/);
  assert.doesNotMatch(css, /--color-accent:\s*#8fc9b6/);
  assert.doesNotMatch(css, /background:\s*rgba\(15, 23, 42, 0\.55\)/);
  assert.doesNotMatch(css, /--dock-surface:\s*#000000/);
});

test("dock plate is sapphire-aligned glass with one sapphire highlight", () => {
  const css = read("../../styles.css");
  const tabs = read("../../components/shell/BottomTabs.tsx");

  assert.match(css, /\.bottom-tabs-dock \{[\s\S]*?background:\s*var\(--dock-surface\)/);
  assert.match(
    css,
    /border:\s*1px solid color-mix\(in srgb, var\(--color-sapphire\) 34%/,
  );
  assert.match(css, /border-top-color:\s*var\(--color-sapphire\)/);
  assert.match(tabs, /sapphire-glass dock/);
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
  assert.match(compare, /CompareRaidhoBackdrop/);
  assert.match(trips, /SuiteRaidhoBackdrop/);
  assert.doesNotMatch(trips, /TRUTH_MARK_BACKDROP/);
  assert.match(nda, /SuiteRaidhoBackdrop/);

  assert.match(css, /\.suite-raidho-mark,\s*\.compare-raidho-mark/);
  assert.match(css, /mix-blend-mode:\s*screen/);
  assert.match(css, /scale\(1\.9\)/);
  assert.doesNotMatch(css, /DialaBot/);
});
