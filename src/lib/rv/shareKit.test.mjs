import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("kit header is RvFOX Powered by Grok — no SpaceX", () => {
  assert.match(src, /RvFOX · Powered by Grok/);
  assert.equal(src.includes("SpaceX"), false);
});

test("payment block includes the interest rate", () => {
  assert.match(src, /Rate \$\{formatPct\(payment\.apr\)\}/);
});

test("kit accepts an editable rating override", () => {
  assert.match(src, /rating\?: number/);
  assert.match(src, /coachSnapshot\(r, opts\.rating\)/);
});

test("STRENGTHS stay product-only; LIFESTYLE is never an empty header", () => {
  assert.match(src, /Finance talking points belong in PAYMENT/);
  assert.match(src, /lifestylePitch\(r\.data\.type\)/);
  assert.doesNotMatch(src, /Financed \$\{formatMoney/);
});

test("share kit strips Confirm brochure placeholders instead of printing them", () => {
  assert.match(src, /isSharePlaceholder/);
  assert.match(src, /brochureSummary/);
  assert.match(src, /effectiveShareInclude/);
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  assert.match(policy, /confirm brochure/i);
});

test("share kit requires per-price picks instead of dumping the market stack", () => {
  assert.match(src, /marketLines/);
  assert.match(src, /buildShareMarketSection/);
  assert.doesNotMatch(
    src,
    /Trade-in est\. \$\{formatMoney\(market\.tradeIn\)\} · Retail/,
  );
});

test("customer-facing MSRP is a single label — not low/high", () => {
  const policy = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardPolicy.ts"),
    "utf8",
  );
  const ui = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../../components/rvshare/RvShareApp.tsx",
    ),
    "utf8",
  );
  assert.match(policy, /shareLabel: "MSRP"/);
  assert.doesNotMatch(policy, /shareLabel: "MSRP (low|high)"/);
  assert.doesNotMatch(policy, /fieldLabel: "MSRP LOW"/);
  assert.doesNotMatch(policy, /id: "msrpLo"/);
  assert.match(policy, /SHARE_MSRP_LINE_ID = "msrpHi"/);
  assert.match(policy, /sharePaymentPricePills/);
  assert.match(policy, /rate updated/i);
  assert.doesNotMatch(ui, /MSRP LOW/);
  assert.doesNotMatch(ui, /MSRP HIGH/);
});

test("share kit rehydrates saved coaches from live catalog SoT", () => {
  assert.match(src, /hydrateShareCoachResult/);
  assert.match(src, /lookupCatalog/);
  assert.match(src, /lookup: ShareCatalogLookup = getSpec/);
  const hydrate = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCoachHydrate.ts"),
    "utf8",
  );
  assert.match(hydrate, /if \(!live\) return result/);
  assert.match(hydrate, /lookup: ShareCatalogLookup/);
});

test("share payload keeps a real card image file for Messages", () => {
  assert.match(src, /buildShareKitPayload/);
  assert.match(src, /captureShareCardFile/);
  assert.match(src, /shareDataAttempts/);
  assert.match(src, /peekCachedShareImage/);
  assert.match(src, /sharePowerLines/);
  assert.match(src, /orderShareImageFiles/);
  assert.doesNotMatch(
    src,
    /if \(!canShareData\(nav\.canShare, data\)\) continue/,
  );
  const card = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "shareCardImage.ts"),
    "utf8",
  );
  assert.match(card, /image\/png/);
  assert.match(card, /files\[\]/);
});

test("kit footer is a prepared-by signature", () => {
  assert.match(src, /REPORT_CONTACT_KICKER/);
  assert.match(src, /REPORT_CONTACT_NAME/);
  assert.match(src, /REPORT_CONTACT_PHONE/);
  const contact = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "reportContact.ts"),
    "utf8",
  );
  assert.match(contact, /David Hansen/);
  assert.match(contact, /702-266-5918/);
});
