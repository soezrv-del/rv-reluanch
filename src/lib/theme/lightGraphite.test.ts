import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function lightRules(css: string) {
  return css
    .split("}")
    .filter((rule) => rule.includes('html[data-theme="light"]'))
    .join("}");
}

test("light theme rules use graphite and link blue, not sapphire", () => {
  const css = read("src/styles.css");
  const light = lightRules(css);
  assert.match(css, /--light-action:\s*#171a20/);
  assert.match(css, /--light-action-hover:\s*#393c41/);
  assert.match(css, /--light-link:\s*#3e6ae1/);
  assert.doesNotMatch(light, /#1648c8/);
  assert.match(css, /html\[data-theme="dark"\][\s\S]*?#1648c8/);
  assert.doesNotMatch(css, /background(?:-color)?:\s*[^;{]*var\(--light-link\)/);
});

test("request access inputs are not hard-coded white", () => {
  const sheet = read("src/components/access/RequestAccessSheet.tsx");
  const admin = read("src/components/access/AdminWhitelistSheet.tsx");
  for (const src of [sheet, admin]) {
    const inputs = src.match(/<input[\s\S]*?\/>/g) ?? [];
    assert.ok(inputs.length > 0);
    for (const input of inputs) assert.doesNotMatch(input, /text-white/);
  }
});

test("the status-bar inset lives on one header rule", () => {
  const css = read("src/styles.css");
  const blocks = [...css.matchAll(/\.(?:showroom-header|sapphire-header) \{[^}]*\}/g)].map(
    (m) => m[0],
  );
  const withInset = blocks.filter((block) => /safe-area-inset-top|--safe-top/.test(block));
  assert.equal(withInset.length, 1);
  assert.match(withInset[0], /\.showroom-header/);
});
