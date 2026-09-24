import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseSpecFieldsFromHtml,
  runSpecFieldFallback,
  specClassSlug,
  specFallbackUrls,
  specFillsFromConfirmedNotes,
  slugSpecToken,
  type SpecFieldFill,
} from "./specFieldFallback.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const LINEAGE_31ZW = {
  year: "2026",
  make: "Grand Design",
  model: "Lineage Series F",
  floorplan: "31ZW",
};

/** Captured shape of the 2026 RV Guide Lineage Series F 31ZW spec page. */
export const RVGUIDE_2026_LINEAGE_31ZW_FIXTURE = `
  <h1>2026 Grand Design Lineage Series F 31ZW</h1>
  <section>
    <h2>Technical specifications</h2>
    <p>Dry Weight (lbs/kg) 18186 / 8249.2</p>
    <p>Payload Capacity (lbs/kgs) 3814 / 1730</p>
    <p>GVWR (lbs) 22000</p>
    <p>Fuel Capacity (gal/l) 66.5 / 251.7</p>
    <p>Total Fresh Water Tank Capacity (gal/l) 79 / 299</p>
    <p>Total Gray Water Tank Capacity (gal/l) 66 / 249.8</p>
    <p>Total Black Water Tank Capacity (gal/l) 45 / 170.3</p>
  </section>
`;

const RVGUIDE_31ZW_URL =
  "https://www.rvguide.com/specs/grand-design/class-c/2026/lineage-series-f/31zw.html";

test("slug + Super C class map to RV Guide class-c", () => {
  assert.equal(slugSpecToken("Lineage Series F"), "lineage-series-f");
  assert.equal(specClassSlug("Super C"), "class-c");
  assert.equal(specClassSlug("Class A Diesel"), "class-a");
});

test("2026 Lineage 31ZW candidates include same-year RV Guide, not 2025 RVUSA", () => {
  const urls = specFallbackUrls(LINEAGE_31ZW, "Super C");
  assert.ok(urls.some((u) => u.source === "rvusa"));
  assert.ok(urls.some((u) => u.source === "rvguide" && u.url === RVGUIDE_31ZW_URL));
  assert.ok(urls.some((u) => u.source === "dealer"));
  assert.ok(urls.some((u) => u.source === "oem-brochure"));
  assert.ok(
    !urls.some((u) => /2025-grand-design-lineage-31zw/i.test(u.url)),
    "2025 RVUSA is not a 2026 candidate",
  );
});

test("RV Guide fixture parses dry weight 18186 as UVW + tanks + fuel", () => {
  const fills = parseSpecFieldsFromHtml(RVGUIDE_2026_LINEAGE_31ZW_FIXTURE, {
    source: "rvguide",
    url: RVGUIDE_31ZW_URL,
  });
  const byField = Object.fromEntries(fills.map((f) => [f.field, f])) as Record<
    string,
    SpecFieldFill
  >;
  assert.equal(byField.uvw?.value, 18186);
  assert.equal(byField.uvw?.asDryWeight, true);
  assert.equal(byField.uvw?.source, "rvguide");
  assert.equal(byField.uvw?.sourceUrl, RVGUIDE_31ZW_URL);
  assert.equal(byField.gvwr?.value, 22000);
  assert.equal(byField.ccc?.value, 3814);
  assert.equal(byField.fuelCapacity?.value, 66.5);
  assert.equal(byField.freshWater?.value, 79);
  assert.equal(byField.grayWater?.value, 66);
  assert.equal(byField.blackWater?.value, 45);
  assert.doesNotMatch(JSON.stringify(fills), /8249/);
});

test("printed UVW wins over dry weight; EST / missing stay empty", () => {
  const uvwWins = parseSpecFieldsFromHtml(
    "UVW 19,200 lbs. Dry Weight 18,186 lbs.",
    { source: "rvusa", url: "https://www.rvusa.com/example" },
  );
  assert.equal(uvwWins.find((f) => f.field === "uvw")?.value, 19200);
  assert.equal(uvwWins.find((f) => f.field === "uvw")?.asDryWeight, undefined);

  assert.deepEqual(
    parseSpecFieldsFromHtml("Nice coach. No numbers.", {
      source: "dealer",
      url: "https://www.rvtrader.com/x",
    }),
    [],
  );
});

test("empty-field chain fills UVW from RV Guide after RVUSA miss", async () => {
  const fills = await runSpecFieldFallback({
    identity: LINEAGE_31ZW,
    empty: ["uvw"],
    rvClass: "Super C",
    fetchPage: async (url) => {
      if (/rvusa\.com/i.test(url)) {
        return { ok: true, text: "<html>inventory cards, no weights</html>", url };
      }
      if (/rvguide\.com/i.test(url)) {
        return {
          ok: true,
          text: RVGUIDE_2026_LINEAGE_31ZW_FIXTURE,
          url: RVGUIDE_31ZW_URL,
        };
      }
      return { ok: false, text: "", url };
    },
  });
  assert.equal(fills.length, 1);
  assert.equal(fills[0]?.field, "uvw");
  assert.equal(fills[0]?.value, 18186);
  assert.equal(fills[0]?.asDryWeight, true);
  assert.equal(fills[0]?.source, "rvguide");
});

test("chain does not scrape fields the catalog already has", async () => {
  const fills = await runSpecFieldFallback({
    identity: LINEAGE_31ZW,
    empty: [],
    rvClass: "Super C",
    fetchPage: async () => {
      throw new Error("must not fetch when empty is []");
    },
  });
  assert.deepEqual(fills, []);
});

test("unconfirmed or empty notes do not invent a GVWR", () => {
  assert.deepEqual(
    specFillsFromConfirmedNotes(
      "CONFIRMED: no.\nGVWR is still a gap.",
      ["gvwr"],
      "https://example.com/miss",
    ),
    [],
  );
  assert.deepEqual(
    specFillsFromConfirmedNotes("GVWR 54,000 lbs", ["gvwr"], "https://example.com/x"),
    [],
  );
});

test("confirmed notes fill only the requested GVWR gap", () => {
  const fills = specFillsFromConfirmedNotes(
    "CONFIRMED: yes.\nGVWR 54,000 lb.\nUVW 42,000 lb.",
    ["gvwr"],
    "https://www.entegra.com/cornerstone",
  );
  assert.equal(fills.length, 1);
  assert.equal(fills[0]?.field, "gvwr");
  assert.equal(fills[0]?.value, 54000);
});

test("fallback module stays field-only — no Gemini, no DialaBot, no pin table", () => {
  const text = src("specFieldFallback.ts");
  assert.match(text, /Field-only spec fallback/);
  assert.match(text, /RVUSA/);
  assert.match(text, /RV Guide/);
  assert.match(text, /Dealer listings/);
  assert.match(text, /OEM brochure PDF/);
  assert.doesNotMatch(text, /[Gg]emini/);
  assert.doesNotMatch(text, /[Dd]ialaBot/);
  assert.doesNotMatch(text, /OEM_UVW_PINS/);
  assert.doesNotMatch(text, /18186/);
});
