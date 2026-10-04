import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const css = read("src/styles/buttons.css");
const body = css.replace(/\/\*[\s\S]*?\*\//g, "");

function px(name: string): number {
  const m = body.match(new RegExp(`${name}:\\s*(\\d+)px`));
  assert.ok(m, `${name} is defined in px`);
  return Number(m[1]);
}

test("one button radius in the 8–12px range", () => {
  const r = px("--btn-radius");
  assert.ok(r >= 8 && r <= 12, `radius ${r}`);
});

test("three heights, default and large keep 44px+ tap targets", () => {
  assert.equal(px("--btn-h-lg"), 52);
  assert.equal(px("--btn-h"), 44);
  assert.ok(px("--btn-h-sm") < 44);
  assert.ok(px("--btn-icon") >= 44);
  assert.match(
    body,
    /@media \(pointer: coarse\), \(max-width: 767px\)\s*\{\s*:root\s*\{\s*--btn-h-sm:\s*var\(--btn-h\);/,
    "compact height rises to 44 on touch / narrow screens",
  );
});

test("padding scale is defined", () => {
  const sm = px("--btn-px-sm");
  const md = px("--btn-px");
  const lg = px("--btn-px-lg");
  assert.ok(sm < md && md < lg);
});

test("button family is shape and size only — no colors, fonts or layout", () => {
  const decls = body.match(/[a-z-]+(?=\s*:[^:;{}]+;)/g) ?? [];
  const allowed = new Set([
    "border-radius",
    "height",
    "min-height",
    "width",
    "min-width",
    "padding-block",
    "padding-inline",
  ]);
  const props = decls.filter((d) => !d.startsWith("--"));
  for (const p of props) assert.ok(allowed.has(p), `unexpected property ${p}`);
});

test("square text buttons (Trips Back / Profile) are in the family", () => {
  assert.match(body, /\[class\*="min-h-"\]/);
  assert.match(body, /border-radius:\s*var\(--btn-radius\)/);
});

test("map chrome and #637 Trips route-card controls are left alone", () => {
  for (const sel of ["[data-route-basemap] *", ".rv-trip-primary", ".rv-trip-chip"]) {
    assert.ok(body.includes(sel), `${sel} excluded`);
  }
});

test("root route loads buttons.css after styles.css", () => {
  const rootRoute = read("src/routes/__root.tsx");
  assert.match(rootRoute, /import buttonsCss from "\.\.\/styles\/buttons\.css\?url";/);
  const a = rootRoute.indexOf("href: appCss");
  const b = rootRoute.indexOf("href: buttonsCss");
  assert.ok(a > 0 && b > a, "buttons.css is linked after styles.css");
});

test("trip primary buttons use the card shadow, and dock tabs share the row", () => {
  const styles = read("src/styles.css");
  const dock = read("src/components/shell/dock.css");
  assert.match(styles, /\[data-trips-screen\] button\.w-full\[class\*="rounded"\]/);
  assert.match(styles, /box-shadow:\s*0 8px 18px rgba\(4, 12, 32, 0\.22\) !important/);
  assert.match(dock, /flex:\s*1 1 0 !important/);
  assert.match(dock, /height:\s*44px !important/);
  assert.doesNotMatch(dock, /padding-right:\s*calc\(50%/);
});
