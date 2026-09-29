import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Lot stock is the last dock tab and not RV Grok", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const shell = read("../../components/shell/AppShell.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  const page = read("../../lib/lot/ownLotPage.ts");
  const route = read("../../routes/lot.tsx");

  assert.match(tabs, /\| "rvlot"/);
  assert.match(tabs, /id: "rvlot", label: "Lot", short: "Lot"/);
  assert.match(tabs, /useCenterSelectedTab/);
  assert.match(
    tabs,
    /Exclude<AppTab, "more" \| "rvshare" \| "rvsold">/,
  );

  assert.match(
    constants,
    /TAB_ORDER = \[\s*"rvfax",\s*"rvlot",\s*"rvgrok",\s*"rvtow",\s*"rvcal",\s*"rvtrips",\s*\]/,
  );
  assert.match(constants, /title: "LOT"/);

  assert.doesNotMatch(more, /title="Lot stock"/);
  assert.doesNotMatch(more, /onNavigate\?\.\("rvlot"\)/);
  assert.match(more, /Open it from the Lot tab/);

  assert.match(shell, /LotStockApp/);
  assert.match(shell, /initialTab = "rvgrok"/);
  assert.match(shell, /id === "rvlot"/);
  assert.match(shell, /<LotStockApp onAsk=\{openGrok\} \/>/);

  assert.match(route, /createFileRoute\("\/lot"\)/);
  assert.match(route, /initialTab="rvlot"/);
  assert.match(route, /NdaGate/);

  assert.match(lot, /data-lot-detail/);
  assert.match(lot, /<SuitePage/);
  assert.match(lot, /Ask about this coach/);
  assert.match(lot, /lotOpenSections/);
  assert.doesNotMatch(lot, /lotLookupRows|lot-detail-source|>Live</);
  assert.doesNotMatch(lot, /grid grid-cols-2 gap-x-3/);
  assert.match(lot, /tab="rvlot"/);
  assert.match(lot, /raidhoOnly/);
  assert.match(lot, /lot-stock-screen/);
  assert.match(lot, /glass-prestige/);
  assert.match(lot, /RAIDHO_R_MARK/);
  assert.doesNotMatch(lot, /CoveredCoach/);
  assert.match(lot, /data-lot-stock/);
  assert.match(lot, /data-lot-search/);
  assert.match(lot, /data-lot-chips/);
  assert.match(lot, /data-lot-condition=\{label\}/);
  assert.match(lot, /\["New", "Used"\]/);
  assert.match(lot, /data-lot-featured/);
  assert.match(lot, /data-lot-unit/);
  assert.match(lot, /data-lot-cal/);
  assert.match(lot, /openCalWithPrice/);
  assert.match(lot, /data-lot-listing/);
  assert.match(lot, /More info/);
  assert.match(lot, /data-lot-facts/);
  assert.match(lot, /RV facts/);
  assert.match(lot, /setTab\("rvfax"\)/);
  assert.match(lot, /lotListingHref/);
  assert.match(lot, /data-lot-meta/);
  assert.match(lot, /showroomUnitLabel/);
  assert.match(lot, /data-lot-count/);
  assert.match(lot, /FEATURED REPORT/);
  assert.doesNotMatch(lot, /data-lot-pill|lot-pill-value|lot-well-id/);
  assert.match(lot, /formatLotUpdated/);
  assert.doesNotMatch(lot, /label="VIN"/);
  assert.doesNotMatch(lot, /label="Stock"|label="Location"|label="Condition"/);
  assert.doesNotMatch(lot, /label="Year"|label="Make"|label="Model"|label="Trim"|label="Price"/);
  assert.doesNotMatch(lot, /pillLotTypeLabel|#\$\{stock\}|Source Page|>Website</);
  assert.doesNotMatch(page, /pillLotTypeLabel|url: "Listing"/);
  assert.match(lot, /data-lot-scene/);
  assert.match(lot, /data-lot-photo/);
  assert.doesNotMatch(lot, /LOT_CAMP_SCENE|camp-scene|family camping/i);
  assert.doesNotMatch(lot, /LotTypeMark/);
  assert.doesNotMatch(lot, /lot-research/);
  assert.match(lot, /On the lot/);
  assert.match(lot, /filterLotBrowse/);
  assert.match(lot, /lotTypeChips/);
  assert.doesNotMatch(lot, /rvData|from "@\/lib\/rv\/catalog"/);
  assert.doesNotMatch(lot, /ownLotInventory/);
  assert.doesNotMatch(lot, /DialaBot|dialabot/i);
  assert.doesNotMatch(lot, /onOpenGrok|setGrokSeed/);
  assert.doesNotMatch(lot, /RvFAX/);
  assert.doesNotMatch(lot, /brochure catalog bleed|catalog photo/i);

  const header = read("../../components/shell/SapphireHeader.tsx");
  assert.match(header, /"rvlot"/);
  const suite = read("../../components/shell/SuitePage.tsx");
  assert.match(suite, /SuiteRaidhoBackdrop/);
  assert.match(suite, /raidhoOnly/);

  const css = read("../../styles.css");
  assert.match(css, /\.lot-stock-screen\[data-readable-cards\]/);
  assert.match(css, /backdrop-filter:\s*blur\(28px\)/);
  assert.match(css, /\.suite-raidho-bleed/);
  assert.doesNotMatch(css, /\.lot-research\s*\{/);
  assert.doesNotMatch(css, /camp-scene/);

  assert.match(page, /\/inventory\/own-lot-latest\.json/);
  assert.match(page, /lotSearch/);
  assert.doesNotMatch(page, /LOT_CAMP_SCENE|camp-scene/);
  assert.doesNotMatch(page, /ownLotInventory|from "\.\.\/rvgrok\/ownLotInventory/);
  assert.doesNotMatch(page, /rvData|from "@\/lib\/rv\/catalog"/);
  assert.doesNotMatch(page, /node:fs|createRequire|formatOwnLotBlock/);

  const search = read("./lotSearch.ts");
  assert.match(search, /FLOORPLAN_LIKE_TOKEN_RE/);
  assert.match(search, /stock_number or VIN/);
  assert.doesNotMatch(search, /DialaBot|dialabot|node:fs|createRequire/);
  assert.doesNotMatch(search, /ownLotInventory|rvData|from "@\/lib\/rv\/catalog"/);
});

test("a lot unit with no photo shows the Raidho mark and a real photo stays", () => {
  const lot = read("../../components/lot/LotStockApp.tsx");
  const cover = read("../../components/shell/CoveredCoach.tsx");
  const arrivals = read("../../components/lot/LotArrivals.tsx");
  const homeScreen = read("../../components/shell/HomeScreen.tsx");
  const css = read("../../styles.css");

  assert.match(lot, /const photoUrl = lotUnitPhoto\(unit\)/);
  assert.match(lot, /failedSrc !== photoUrl \? photoUrl : null/);
  assert.match(lot, /data-lot-photo="unit"/);
  assert.match(lot, /onError=\{\(\) => setFailedSrc\(photo\)\}/);
  assert.match(lot, /data-lot-photo="raidho"/);
  assert.match(lot, /src=\{RAIDHO_R_MARK\}/);
  assert.match(lot, /className="lot-mark-art"/);
  assert.doesNotMatch(lot, /CoveredCoach|coverVariant/);
  assert.doesNotMatch(lot, /unit\.photo\s*=/);
  assert.match(css, /\.lot-mark-art[\s\S]*height:\s*45%/);
  assert.match(css, /\.lot-mark-art[\s\S]*object-fit:\s*contain/);
  assert.match(css, /\.lot-mark-art[\s\S]*opacity:\s*0\.36/);
  assert.match(arrivals, /<CoveredCoach variant=\{coverVariant\(unit\)\} \/>/);
  assert.doesNotMatch(homeScreen, /CoveredCoach|showroom-arrival/);
  assert.match(cover, /className="h-20 w-full"/);
  assert.doesNotMatch(cover, /preserveAspectRatio|className\?:/);
});

test("RV Grok prompts and DialaBot stay out of this page", () => {
  const prompts = read("../rvgrok/prompts.ts");
  const lot = read("../../components/lot/LotStockApp.tsx");
  const page = read("./ownLotPage.ts");
  const search = read("./lotSearch.ts");
  assert.doesNotMatch(prompts, /OWN-LOT INVENTORY/);
  assert.doesNotMatch(lot, /SYSTEM_PROMPT|OWN-LOT INVENTORY block/);
  assert.doesNotMatch(page, /formatOwnLotBlock/);
  assert.doesNotMatch(lot, /DialaBot/);
  assert.doesNotMatch(page, /DialaBot/);
  assert.doesNotMatch(search, /DialaBot/);
});
