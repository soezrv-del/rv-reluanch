import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Lot stock is a suite page, not a dock tab and not RV Grok", () => {
  const tabs = read("../../components/shell/BottomTabs.tsx");
  const constants = read("../../components/shell/shellConstants.ts");
  const shell = read("../../components/shell/AppShell.tsx");
  const more = read("../../components/more/MoreApp.tsx");
  const lot = read("../../components/lot/LotStockApp.tsx");
  const page = read("../../lib/lot/ownLotPage.ts");
  const route = read("../../routes/lot.tsx");

  assert.match(tabs, /\| "rvlot"/);
  assert.doesNotMatch(tabs, /id: "rvlot"/);
  assert.match(
    tabs,
    /Exclude<AppTab, "more" \| "rvshare" \| "rvsold" \| "rvlot">/,
  );

  assert.match(
    constants,
    /TAB_ORDER = \[\s*"rvfax",\s*"rvcal",\s*"rvgrok",\s*"rvtow",\s*"rvtrips",\s*\]/,
  );
  assert.doesNotMatch(constants, /TAB_ORDER = \[[^\]]*rvlot/);
  assert.match(constants, /title: "LOT"/);

  assert.match(more, /title="Lot stock"/);
  assert.match(more, /onNavigate\?\.\("rvlot"\)/);
  assert.match(more, /RV Country in-stock/);

  assert.match(shell, /LotStockApp/);
  assert.match(shell, /initialTab = "rvfax"/);
  assert.match(shell, /tab === "rvlot"/);
  assert.match(shell, /<LotStockApp \/>/);

  assert.match(route, /createFileRoute\("\/lot"\)/);
  assert.match(route, /initialTab="rvlot"/);
  assert.match(route, /NdaGate/);

  assert.match(lot, /<SuitePage/);
  assert.match(lot, /tab="rvlot"/);
  assert.match(lot, /raidhoOnly/);
  assert.match(lot, /lot-stock-screen/);
  assert.match(lot, /glass-prestige/);
  assert.match(lot, /RAIDHO_R_MARK/);
  assert.match(lot, /data-lot-stock/);
  assert.match(lot, /data-lot-search/);
  assert.match(lot, /data-lot-chips/);
  assert.match(lot, /data-lot-featured/);
  assert.match(lot, /FEATURED REPORT/);
  assert.match(lot, /data-lot-pill/);
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
  assert.doesNotMatch(lot, /GVWR|Length|Slides|Sleeps|RvFAX/);
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
  assert.doesNotMatch(page, /LOT_CAMP_SCENE|camp-scene/);
  assert.doesNotMatch(page, /ownLotInventory|from "\.\.\/rvgrok\/ownLotInventory/);
  assert.doesNotMatch(page, /rvData|from "@\/lib\/rv\/catalog"/);
  assert.doesNotMatch(page, /node:fs|createRequire|formatOwnLotBlock/);
});

test("RV Grok prompts and DialaBot stay out of this page", () => {
  const prompts = read("../rvgrok/prompts.ts");
  const lot = read("../../components/lot/LotStockApp.tsx");
  const page = read("./ownLotPage.ts");
  assert.match(prompts, /OWN-LOT INVENTORY/);
  assert.doesNotMatch(lot, /SYSTEM_PROMPT|OWN-LOT INVENTORY block/);
  assert.doesNotMatch(page, /formatOwnLotBlock/);
  assert.doesNotMatch(lot, /DialaBot/);
  assert.doesNotMatch(page, /DialaBot/);
});
