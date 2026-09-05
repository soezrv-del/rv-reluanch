import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  customerFacingPitch,
  DEFAULT_SHARE_INCLUDE,
  DEFAULT_SHARE_MARKET_LINES,
  effectiveShareInclude,
  formatShareMarketText,
  hasOptionalShareSections,
  hasSelectedMarketLines,
  isSharePlaceholder,
  RATE_UPDATED_FLASH,
  RATE_UPDATED_FLASH_MS,
  SHARE_MARKET_LINE_DEFS,
  sharePaymentAfterTermDown,
  sharePaymentPricePills,
} from "./shareCardPolicy.ts";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("default include is all extras off", () => {
  assert.equal(hasOptionalShareSections(DEFAULT_SHARE_INCLUDE), false);
  for (const v of Object.values(DEFAULT_SHARE_INCLUDE)) {
    assert.equal(v, false);
  }
});

test("zero extras falls back to payment only — no market dump", () => {
  const next = effectiveShareInclude(DEFAULT_SHARE_INCLUDE);
  assert.equal(next.market, false);
  assert.equal(next.payment, true);
  assert.equal(next.rating, false);
  assert.equal(next.powertrain, false);
});

test("any extra on disables the payment fallback", () => {
  const next = effectiveShareInclude({
    ...DEFAULT_SHARE_INCLUDE,
    rating: true,
  });
  assert.equal(next.market, false);
  assert.equal(next.payment, false);
  assert.equal(next.rating, true);
});

const SAMPLE_MARKET = {
  tradeIn: 140000,
  retailLow: 180000,
  retailHigh: 220000,
  msrpLo: 250000,
  msrpHi: 280000,
};
const money = (n: number) => `$${n}`;

test("market lines default to none selected", () => {
  assert.equal(hasSelectedMarketLines(DEFAULT_SHARE_MARKET_LINES), false);
  for (const v of Object.values(DEFAULT_SHARE_MARKET_LINES)) {
    assert.equal(v, false);
  }
});

test("shared text includes only the chosen asking line", () => {
  const text = formatShareMarketText(
    SAMPLE_MARKET,
    { ...DEFAULT_SHARE_MARKET_LINES, retailHigh: true },
    money,
  );
  assert.match(text, /^MARKET\nAsking \$220000$/);
  assert.doesNotMatch(text, /Trade-in/);
  assert.doesNotMatch(text, /Retail low/);
  assert.doesNotMatch(text, /MSRP/);
});

test("shared text includes only trade-in when that line is picked", () => {
  const text = formatShareMarketText(
    SAMPLE_MARKET,
    { ...DEFAULT_SHARE_MARKET_LINES, tradeIn: true },
    money,
  );
  assert.match(text, /^MARKET\nTrade-in est\. \$140000$/);
  assert.doesNotMatch(text, /Asking/);
  assert.doesNotMatch(text, /Retail/);
});

test("no price picks produce empty market text — never the full stack", () => {
  const text = formatShareMarketText(
    SAMPLE_MARKET,
    DEFAULT_SHARE_MARKET_LINES,
    money,
  );
  assert.equal(text, "");
  assert.doesNotMatch(text, /Trade-in/);
  assert.doesNotMatch(text, /Asking/);
  assert.doesNotMatch(text, /MARKET/);
});

test("trade-in and asking together only when both are picked", () => {
  const text = formatShareMarketText(
    SAMPLE_MARKET,
    { ...DEFAULT_SHARE_MARKET_LINES, tradeIn: true, retailHigh: true },
    money,
  );
  assert.match(text, /Trade-in est\. \$140000/);
  assert.match(text, /Asking \$220000/);
  assert.doesNotMatch(text, /Retail low/);
  assert.doesNotMatch(text, /MSRP/);
});

test("kit always writes Summary and only writes rating when toggled", () => {
  assert.match(src, /effectiveShareInclude\(opts\.include\)/);
  assert.match(src, /lines\.push\("SUMMARY"\)/);
  assert.match(src, /if \(include\.rating && snap\.rating\)/);
  assert.doesNotMatch(src, /include\.specs/);
});

test("summary uses curated description and never invents specs", () => {
  const pitch = customerFacingPitch(
    "Newmar Essex — limited-production flagship diesel. Do not invent 2028 plans. yearEnd 2027.",
  );
  assert.match(pitch, /limited-production flagship diesel/);
  assert.doesNotMatch(pitch, /Do not invent/);
  assert.doesNotMatch(pitch, /yearEnd/);
});

test("legacy catalog notes are not used as brochure pitch", () => {
  const pitch = customerFacingPitch(
    "Legacy search alias for Allegro Bus floorplan 45 OPP — yearEnd 2026. Prefer Allegro Bus + 45OPP.",
  );
  assert.equal(pitch, "");
});

test("Confirm brochure clauses are stripped from pitch", () => {
  const pitch = customerFacingPitch(
    "Hand-built residential interiors. Confirm brochure for solar.",
  );
  assert.equal(pitch, "Hand-built residential interiors.");
});

test("isSharePlaceholder catches typical confirm tags", () => {
  assert.equal(isSharePlaceholder("Confirm brochure"), true);
  assert.equal(isSharePlaceholder("Confirm brochure (van chassis tire)"), true);
  assert.equal(isSharePlaceholder("30,000 BTU (typ. — confirm brochure)"), true);
  assert.equal(isSharePlaceholder("Cummins X15 605"), false);
});

test("kit filters placeholder lines from the shared card", () => {
  assert.match(src, /lines\.filter\(\(line\) => !isSharePlaceholder\(line\)\)/);
  assert.match(src, /if \(isSharePlaceholder\(row\.value\)\) continue/);
});

test("kit writes only picked market lines — no trade+retail dump", () => {
  assert.match(src, /buildShareMarketSection\(market, marketLines, formatMoney\)/);
  assert.doesNotMatch(
    src,
    /Trade-in est\. \$\{formatMoney\(market\.tradeIn\)\} · Retail/,
  );
});

test("shared and selected MSRP lines say MSRP — not low/high", () => {
  const lo = SHARE_MARKET_LINE_DEFS.find((d) => d.id === "msrpLo");
  const hi = SHARE_MARKET_LINE_DEFS.find((d) => d.id === "msrpHi");
  assert.equal(lo?.shareLabel, "MSRP");
  assert.equal(hi?.shareLabel, "MSRP");
  assert.equal(hi?.fieldLabel, "MSRP");
  assert.doesNotMatch(lo!.shareLabel, /low|high/i);
  assert.doesNotMatch(hi!.shareLabel, /low|high/i);
  const text = formatShareMarketText(
    SAMPLE_MARKET,
    { ...DEFAULT_SHARE_MARKET_LINES, msrpHi: true },
    money,
  );
  assert.match(text, /^MARKET\nMSRP \$280000$/);
  assert.doesNotMatch(text, /MSRP high|MSRP low/);
});

test("calculator pills use one MSRP from the high/asking figure", () => {
  const pills = sharePaymentPricePills(SAMPLE_MARKET, money);
  const msrp = pills.filter((p) => /^MSRP\b/.test(p.label));
  assert.equal(msrp.length, 1);
  assert.equal(msrp[0]?.value, SAMPLE_MARKET.msrpHi);
  assert.doesNotMatch(msrp[0]!.label, /low|high/i);
  assert.equal(
    pills.some((p) => p.value === SAMPLE_MARKET.msrpLo && /^MSRP\b/.test(p.label)),
    false,
  );
});

const scheduleApr = (termMonths: number) => (termMonths <= 180 ? 7.99 : 8.49);

test("auto rate flash only when term/down actually changes the schedule APR", () => {
  const base = { price: 220000, downPct: 10, termMonths: 180, apr: 7.99 };
  const sameDown = sharePaymentAfterTermDown(base, { downPct: 20 }, scheduleApr);
  assert.equal(sameDown.next.downPct, 20);
  assert.equal(sameDown.next.apr, 7.99);
  assert.equal(sameDown.autoRateChanged, false);

  const bump = sharePaymentAfterTermDown(base, { termMonths: 240 }, scheduleApr);
  assert.equal(bump.next.apr, 8.49);
  assert.equal(bump.next.termMonths, 240);
  assert.equal(bump.autoRateChanged, true);

  const sameTerm = sharePaymentAfterTermDown(
    base,
    { termMonths: 180 },
    scheduleApr,
  );
  assert.equal(sameTerm.autoRateChanged, false);

  const customThenDown = sharePaymentAfterTermDown(
    { ...base, apr: 6.5 },
    { downPct: 15 },
    scheduleApr,
  );
  assert.equal(customThenDown.next.apr, 7.99);
  assert.equal(customThenDown.autoRateChanged, true);

  assert.equal(RATE_UPDATED_FLASH_MS, 1000);
  assert.equal(RATE_UPDATED_FLASH, "rate updated");
});

test("payment calculator field order is price → down → term → rate → est", () => {
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareApp.tsx",
    ),
    "utf8",
  );
  const pay = ui.slice(ui.indexOf('title="PAYMENT"'));
  const price = pay.indexOf('label="PRICE"');
  const down = pay.indexOf("DOWN");
  const term = pay.indexOf("TERM (YEARS)");
  const rate = pay.indexOf('label="INTEREST RATE"');
  const est = pay.indexOf("EST. / MO");
  assert.ok(price >= 0 && down >= 0 && term >= 0 && rate >= 0 && est >= 0);
  assert.ok(price < down);
  assert.ok(down < term);
  assert.ok(term < rate);
  assert.ok(rate < est);
  assert.match(pay, /Rate never above down\/term/);
  assert.match(pay, /RATE_UPDATED_FLASH/);
  assert.match(ui, /sharePaymentPricePills/);
  assert.doesNotMatch(
    pay.slice(down, rate),
    /grid grid-cols-2/,
  );
});
