import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/** @param {string} rel */
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

test("Premium legal links are same-origin privacy/support pages", () => {
  const more = read("src/components/more/MoreApp.tsx");
  assert.match(more, /href="\/privacy\.html"/);
  assert.match(more, /href="\/support\.html"/);
  assert.equal(more.includes("https://rvfox.app/privacy.html"), false);
  assert.equal(more.includes("https://rvfox.app/support.html"), false);
});

test("Send Feedback opens mailto contact", () => {
  const more = read("src/components/more/MoreApp.tsx");
  assert.match(more, /mailto:contact@rvfox\.app/);
  assert.equal(more.includes('setSheet("feedback")'), false);
});

test("no beta / evaluation chrome in Premium", () => {
  const more = read("src/components/more/MoreApp.tsx");
  assert.equal(more.includes("v2.0 Beta"), false);
  assert.equal(/unlocked for evaluation/i.test(more), false);
  assert.equal(/this TestFlight build/i.test(more), false);
  assert.match(more, /No in-app purchases — full suite included/);
});

test("share surfaces have no SpaceX trademark", () => {
  const files = [
    "src/lib/rv/shareKit.ts",
    "src/lib/rv/exportReport.ts",
    "src/components/rvshare/RvShareApp.tsx",
  ];
  for (const rel of files) {
    const src = read(rel);
    assert.equal(src.includes("SpaceX"), false, rel);
    assert.match(src, /Powered by Grok/);
  }
});

test("support page is live-product copy", () => {
  const support = read("public/support.html");
  assert.equal(/TestFlight/i.test(support), false);
  assert.equal(/review build/i.test(support), false);
  assert.match(support, /mailto:contact@rvfox\.app/);
  assert.match(support, /href="\/privacy\.html"/);
});

test("Capacitor allowNavigation includes rvfox.app", () => {
  const cap = read("capacitor.config.ts");
  assert.match(cap, /https:\/\/rvfox\.app/);
  assert.match(cap, /https:\/\/www\.rvfox\.app/);
});
