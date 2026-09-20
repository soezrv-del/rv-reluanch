import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
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

test("Facts saved list: [Sold label | compare] → toggleCompare → RvCompare", () => {
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
  assert.match(fax, /border-green\/40 bg-green\/15 text-green[\s\S]*data-saved-compare=""/);
  assert.match(fax, />\s*Sold\s*</);
  assert.match(fax, /capCompareItems\(comparePick\)/);
  assert.match(compareUi, /data-lot-desk-compare/);
  assert.doesNotMatch(fax, /function SavedCompare/);
});

test("Compare backdrop is the Raidho R mark, not the campfire lifestyle still", () => {
  const compareUi = readFileSync(
    join(root, "../../components/rvfax/RvCompare.tsx"),
    "utf8",
  );
  const prestige = readFileSync(join(root, "../../assets/prestige.ts"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const mark = join(root, "../../../public/assets/brand/raidho-r-mark.png");

  assert.match(prestige, /RAIDHO_R_MARK/);
  assert.match(prestige, /\/assets\/brand\/raidho-r-mark\.png/);
  assert.ok(existsSync(mark), "raidho-r-mark.png is in public/assets/brand");

  assert.match(compareUi, /RAIDHO_R_MARK/);
  assert.match(compareUi, /CompareRaidhoBackdrop/);
  assert.match(compareUi, /data-compare-view/);
  assert.match(compareUi, /data-readable-cards/);
  assert.doesNotMatch(compareUi, /SuiteBackdrop/);
  assert.doesNotMatch(compareUi, /RV_CARD_MEDIA/);
  assert.doesNotMatch(compareUi, /class-a-diesel/);
  assert.doesNotMatch(compareUi, /lifestyle/);
  assert.doesNotMatch(compareUi, /DialaBot/);

  assert.match(css, /\[data-compare-view\]/);
  assert.match(css, /\.compare-raidho-mark/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /mix-blend-mode:\s*screen/);
});
