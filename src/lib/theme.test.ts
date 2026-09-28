import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("light theme is a white Tesla canvas and a tight Raidho crop", () => {
  const css = read("../styles.css");
  const brand = read("../components/shell/SuiteBrand.tsx");
  const more = read("../components/more/MoreApp.tsx");
  const rootDoc = read("../routes/__root.tsx");
  const theme = read("./theme.ts");
  const mark = join(root, "../../public/assets/brand/raidho-r-mark-light.png");

  assert.ok(existsSync(mark), "light mark");
  assert.match(theme, /localStorage\.setItem\("rvfox-theme", next\)/);
  assert.match(theme, /document\.documentElement\.dataset\.theme = next/);
  assert.match(rootDoc, /THEME_BOOT_SCRIPT/);
  assert.match(theme, /rvfox-theme/);
  assert.match(more, /setTheme\(next\)/);
  assert.match(more, /title="Appearance"/);
  assert.match(more, /data-tools-menu/);
  assert.match(css, /\[data-tools-menu\] \.text-sky-200/);
  assert.match(css, /\[data-tools-menu\] \.glass-prestige/);
  assert.match(brand, /raidho-shell-mark\.png/);
  assert.match(brand, /raidho-r-mark-light\.png/);
  assert.match(brand, /theme === "light" \? RAIDHO_SHELL_MARK_LIGHT : RAIDHO_SHELL_MARK/);
  assert.match(brand, /useSyncExternalStore\(subscribeTheme, readTheme, serverTheme\)/);
  assert.match(brand, /data-mark-light=\{RAIDHO_SHELL_MARK_LIGHT\}/);
  assert.match(theme, /querySelectorAll<HTMLImageElement>\("\[data-mark-light\]"\)/);
  assert.doesNotMatch(brand, /data-suite-mark/);
  assert.doesNotMatch(brand, /width=\{19\}|height=\{32\}|filter:|transform:|mix-blend|invert\(/);
  assert.match(css, /\.showroom-mark \{[^}]*filter:\s*none/);
  assert.match(css, /\.showroom-mark \{[^}]*transform:\s*none/);
  assert.doesNotMatch(css, /\.showroom-mark \{[^}]*(invert|brightness|saturate|hue-rotate|drop-shadow|sepia|contrast)\(/);
  assert.doesNotMatch(css, /\.showroom-mark\[data-suite-mark/);
  assert.match(css, /html\[data-theme="light"\]/);
  assert.match(css, /--color-fg:\s*#171a20/);
  assert.match(css, /--color-muted:\s*#5c5e62/);
  assert.match(css, /--color-border:\s*#eeeeee/);
  assert.match(css, /--color-sapphire:\s*#1648c8/);
  assert.match(css, /--dock-surface:\s*#ffffff/);
  assert.match(css, /#3e6ae1/);
  assert.match(css, /html\[data-theme="light"\] \.sapphire-header-inner/);
  assert.match(
    css,
    /html\[data-theme="light"\] \.glass-prestige[\s\S]*?rgba\(240, 215, 140, 0\.14\)[\s\S]*?blur\(28px\) saturate\(1\.7\)[\s\S]*?var\(--color-gold-border\)/,
  );
  assert.match(css, /html:not\(\[data-theme="light"\]\) \.app-shell \.text-white\\\/35/);
  assert.match(theme, /dataset\.theme === "light"/);
  assert.match(css, /\[data-camera-well\]/);
  assert.match(css, /\.bottom-tab-einstein/);
  assert.match(css, /\.lot-well/);
  assert.doesNotMatch(css, /html\[data-theme="light"\][^{]*filter:\s*invert/);
});
