import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("compare.ts: resolvePrimaryMarket + Low hide High + Catalog estimate", () => {
  const text = src("compare.ts");
  assert.match(text, /resolvePrimaryMarket/);
  assert.match(text, /hideRetailHighForDesk/);
  assert.match(text, /CATALOG_ESTIMATE_LABEL/);
  assert.match(text, /function compareHonestSourceLabel/);
  assert.match(text, /function compareDeskHideRetailHigh/);
  assert.match(text, /function compareDeskMarketValue/);
  assert.match(text, /BARE_BOOK_TITLE/);
  assert.match(text, /jd\\s\*power/);
  assert.match(text, /c\.hideRetailHigh \? "—" : formatMoney\(c\.market\.retailHigh\)/);
  assert.match(text, /COMPARE_MARKET_ROW_IDS/);
  assert.match(text, /COMPARE_KEY_FACT_ROW_IDS/);
  assert.match(text, /"marketValue"/);
  assert.match(text, /"uvw"/);
  assert.match(text, /function capCompareItems/);
  assert.match(text, /COMPARE_MAX = 3/);
  assert.match(text, /function suggestComparePeers/);
  assert.doesNotMatch(text, /from\s+["'][^"']*marketcheck[^"']*["']/);
});

test("Lot Desk compare UI: Market + key Facts + one-tap Facts entry", () => {
  const compareUi = readFileSync(
    join(root, "../../components/rvfax/RvCompare.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );

  assert.match(compareUi, /data-lot-desk-compare/);
  assert.match(compareUi, /data-compare-section=\{section\}/);
  assert.match(compareUi, /"Market"/);
  assert.match(compareUi, /"Key Facts"/);
  assert.match(compareUi, /hideRetailHigh/);
  assert.match(compareUi, /CATALOG_ESTIMATE_LABEL/);
  assert.match(compareUi, /columns\.every\(\(c\) => c\.hideRetailHigh\)/);
  assert.doesNotMatch(compareUi, /title="J\.D\. Power"/);
  assert.doesNotMatch(compareUi, />JD Power</);

  assert.match(detail, /data-facts-compare/);
  assert.match(detail, /onStartCompare/);
  assert.match(detail, /Compare with another unit/);

  assert.match(fax, /startCompareFromFacts/);
  assert.match(fax, /suggestComparePeers/);
  assert.match(fax, /data-compare-peer-picker/);
  assert.match(fax, /onStartCompare=\{\(\) => startCompareFromFacts\(detail\)\}/);
  assert.match(fax, /capCompareItems\(comparePick\)/);
  assert.match(fax, /setCompareOpen\(false\);\s*openFactsUnit\(r,\s*r\.floorplan\)/);
});

test("Facts saved list: [green Sold | compare] → toggleCompare → RvCompare", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const compareUi = readFileSync(
    join(root, "../../components/rvfax/RvCompare.tsx"),
    "utf8",
  );

  assert.match(fax, /data-saved-sold-compare/);
  assert.match(fax, /data-saved-compare=""/);
  assert.match(fax, /toggleSavedCompare/);
  assert.match(fax, /toggleCompare\(r\)/);
  assert.match(fax, /setCompareOpen\(true\)/);
  assert.match(fax, /comparePick\.length \+ 1 >= 2/);
  assert.match(fax, /comparePick\.length >= 3/);
  assert.match(fax, /border-green\/50 bg-green[\s\S]*data-saved-compare=""/);
  assert.match(fax, /capCompareItems\(comparePick\)/);
  assert.match(compareUi, /data-lot-desk-compare/);
  assert.doesNotMatch(fax, /function SavedCompare/);
  assert.doesNotMatch(fax, />\s*Sold\s*</);
});
