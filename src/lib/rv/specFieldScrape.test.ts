import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSpecFieldHtml,
  scrapeEmptySpecFields,
  specFieldScrapeUrls,
} from "./specFieldScrape.ts";

test("scrape URL order is RVUSA → RV Guide → dealer → OEM PDF", () => {
  const urls = specFieldScrapeUrls({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series F",
    floorplan: "31ZW",
    rvType: "Super C",
  });
  assert.ok(urls.length >= 4);
  assert.match(urls[0] || "", /rvusa\.com/);
  const guide = urls.findIndex((u) => /rvguide\.com/.test(u));
  const dealer = urls.findIndex((u) => /rvtrader\.com/.test(u));
  const pdf = urls.findIndex((u) => /library\.rvusa\.com\/brochure\/.+\.pdf/.test(u));
  assert.ok(guide > 0);
  assert.ok(dealer > guide);
  assert.ok(pdf > dealer);
});

test("dry weight paints as UVW when UVW is absent", () => {
  const hit = parseSpecFieldHtml(
    `<html>Dry Weight: 18,186 Payload: 3,814 Fuel: 66.5 gal Fresh: 79 Gray: 66 Black: 45 GVWR: 22,000</html>`,
    "https://www.rvguide.com/specs/grand-design/class-c/2026/lineage-series-f/31zw.html",
  );
  assert.ok(hit);
  assert.equal(hit!.uvwLbs, 18186);
  assert.equal(hit!.uvwIsDryWeight, true);
  assert.equal(hit!.gvwrLbs, 22000);
  assert.equal(hit!.payloadLbs, 3814);
  assert.equal(hit!.freshWaterGal, 79);
  assert.equal(hit!.sourceHost, "rvguide");
});

test("labeled UVW wins over dry weight — do not invent", () => {
  const hit = parseSpecFieldHtml(
    `UVW: 20,000 Dry Weight: 18,186 GVWR: 22,000`,
    "https://www.rvusa.com/rv-guide/2026-grand-design-lineage-series-f-31zw-specs",
  );
  assert.equal(hit?.uvwLbs, 20000);
  assert.equal(hit?.uvwIsDryWeight, false);
});

test("scrape skips the network under NODE_TEST_CONTEXT unless fetch is injected", async () => {
  const hit = await scrapeEmptySpecFields({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series F",
    floorplan: "31ZW",
    missing: ["uvw"],
  });
  assert.equal(hit, null);

  const injected = await scrapeEmptySpecFields({
    year: "2026",
    make: "Grand Design",
    model: "Lineage Series F",
    floorplan: "31ZW",
    missing: ["uvw"],
    fetch: async (url) => ({
      ok: true,
      url,
      text: "Lineage Series F 31ZW specs. Dry Weight: 18,186 Payload: 3,814 GVWR: 22,000",
      contentType: "text/html",
    }),
  });
  assert.equal(injected?.uvwLbs, 18186);
  assert.equal(injected?.uvwIsDryWeight, true);
});
