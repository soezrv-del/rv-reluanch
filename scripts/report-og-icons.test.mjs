import assert from "node:assert/strict";
import test from "node:test";
import { applyReportIcons, applyReportOpenGraph } from "../src/lib/rv/reportOgHtml.mjs";

const SHELL = `<html><head>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" href="/assets/brand/icon-rvfax.png">
<link rel="apple-touch-icon" href="/assets/brand/icon-rvfax.png">
<link rel="apple-touch-icon" href="/__grok/icon-180.png">
<link rel="stylesheet" href="/styles.css">
<title>Old</title>
</head><body>report</body></html>`;

test("report HTML replaces the old card icon with the sized chrome R", () => {
  const html = applyReportOpenGraph(SHELL, {
    title: "2026 Entegra Coach Cornerstone 45B",
    description: "RvFAX vehicle report",
    image: "https://rvmax.app/api/og/report?kind=facts",
    url: "https://rvmax.app/report/facts?year=2026",
    siteName: "RvFAX",
  });
  assert.match(html, /rel="icon" type="image\/png" sizes="32x32" href="\/assets\/brand\/rvfax-mark-32.png"/);
  assert.match(html, /rel="apple-touch-icon" sizes="180x180" href="\/assets\/brand\/rvfax-mark-180.png"/);
  assert.equal(html.includes("icon-rvfax.png"), false);
  assert.equal(html.includes("/favicon.svg"), false);
  assert.equal(html.includes("/__grok/icon-180.png"), false);
  assert.match(html, /rel="stylesheet"/);
  assert.match(html, /<title>2026 Entegra Coach Cornerstone 45B<\/title>/);
  assert.equal((html.match(/rel="apple-touch-icon"/g) ?? []).length, 1);
  assert.equal((html.match(/rel="icon"/g) ?? []).length, 1);
});

test("a report page still gets the sized icons when Open Graph meta is missing", () => {
  const html = applyReportIcons(SHELL);
  assert.match(html, /rvfax-mark-32.png/);
  assert.match(html, /rvfax-mark-180.png/);
  assert.equal(html.includes("icon-rvfax.png"), false);
});
