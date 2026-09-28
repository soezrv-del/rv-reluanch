import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("light theme is a flat Tesla canvas and dark chrome is unchanged", () => {
  const css = read("../styles.css");
  const brand = read("../components/shell/SuiteBrand.tsx");
  const header = read("../components/shell/SapphireHeader.tsx");
  const more = read("../components/more/MoreApp.tsx");
  const rootDoc = read("../routes/__root.tsx");
  const theme = read("./theme.ts");
  const mark = join(root, "../../public/assets/brand/raidho-r-mark-light.png");
  const jpg = join(root, "../../public/assets/brand/raidho-r-mark-light.jpg");
  const lightAt = css.indexOf('html[data-theme="light"]');
  assert.ok(lightAt > 0, "light block");
  const light = css.slice(lightAt);

  assert.ok(existsSync(mark), "transparent light mark");
  assert.ok(statSync(mark).size < 40_000, "light mark is a small web asset");
  assert.equal(existsSync(jpg), false, "gray-plate jpg removed");
  assert.match(theme, /localStorage\.setItem\("rvfox-theme", next\)/);
  assert.match(theme, /document\.documentElement\.dataset\.theme = next/);
  assert.match(rootDoc, /THEME_BOOT_SCRIPT/);
  assert.match(more, /setTheme\(next\)/);
  assert.match(more, /data-tools-menu/);
  assert.match(brand, /raidho-shell-mark\.png/);
  assert.match(brand, /raidho-r-mark-light\.png/);
  assert.doesNotMatch(brand, /raidho-r-mark-light\.jpg/);
  assert.match(brand, /theme === "light" \? RAIDHO_SHELL_MARK_LIGHT : RAIDHO_SHELL_MARK/);
  assert.match(brand, /data-mark-light=\{RAIDHO_SHELL_MARK_LIGHT\}/);
  assert.match(theme, /querySelectorAll<HTMLImageElement>\("\[data-mark-light\]"\)/);
  assert.match(css, /\.showroom-mark \{[^}]*filter:\s*none/);
  assert.match(css, /\.showroom-mark \{[^}]*transform:\s*none/);
  assert.doesNotMatch(css, /\.showroom-mark \{[^}]*(invert|brightness|saturate|hue-rotate|drop-shadow|sepia|contrast)\(/);
  assert.match(header, /suite-title-flat/);
  assert.match(light, /--color-bg:\s*#f2f2f2/);
  assert.match(light, /--color-fg:\s*#0b1730/);
  assert.match(light, /--color-muted:\s*#5c5e62/);
  assert.match(light, /height:\s*28px/);
  assert.match(light, /font-weight:\s*700 !important/);
  assert.match(light, /\.suite-title-accent[\s\S]*?#1648c8/);
  assert.match(light, /background:\s*#1648c8 !important/);
  assert.doesNotMatch(light, /Figtree/);
  assert.doesNotMatch(light, /rgba\(10,\s*8,\s*6/);
  assert.doesNotMatch(light, /\[class\*=text-gold\]/);
  assert.doesNotMatch(light, /\.lot-mark-art/);
  assert.doesNotMatch(light, /raidho-r-mark-light\.jpg/);
  assert.match(css, /\.suite-title-flat \{\s*display:\s*none/);
  assert.match(css, /\.showroom-hero-actions \{\s*display:\s*none/);
});
