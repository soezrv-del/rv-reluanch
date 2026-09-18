import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(root, "../../components/rvcal/RvCalApp.tsx"), "utf8");
const header = readFileSync(join(root, "../../components/shell/SapphireHeader.tsx"), "utf8");
const constants = readFileSync(join(root, "../../components/shell/shellConstants.ts"), "utf8");

test("rvCAL keeps one screen-bottom disclaimer and no per-card fine print", () => {
  const disclaimers = src.match(/<SuiteDisclaimer[\s\S]*?<\/SuiteDisclaimer>/g) ?? [];
  assert.equal(disclaimers.length, 1, "exactly one SuiteDisclaimer on Cal");
  assert.match(disclaimers[0] ?? "", /calScreenDisclaimer\(lendersMeta\)/);
  assert.doesNotMatch(src, /lendersSourceLine\(/);
  assert.doesNotMatch(src, /SIMULATE_BADGE_LABEL/);
  assert.doesNotMatch(src, /creditHint\(/);
  assert.doesNotMatch(src, /quote\?\.rateNote/);
  assert.doesNotMatch(src, /ineligibilityReason/);
  assert.doesNotMatch(src, /Show this list/);
  assert.doesNotMatch(src, /Type a monthly payment to reverse-solve/);
  assert.doesNotMatch(src, /Trade equity always lowers/);
  assert.doesNotMatch(src, /Estimates to start the conversation/);
  assert.doesNotMatch(src, /Your broker edge/);
  assert.doesNotMatch(src, /Exclusive/);
  assert.doesNotMatch(src, />\s*Preview\s*</);
  assert.doesNotMatch(src, /Market avg/);
  assert.doesNotMatch(src, /5-digit US/);
  assert.doesNotMatch(src, /auto from ZIP/);
  assert.doesNotMatch(src, /CUSTOMER ZIP CODE/);
  assert.doesNotMatch(src, /LOCATION & TAX/);
  assert.doesNotMatch(src, /VEHICLE DETAILS/);
  assert.doesNotMatch(src, /QUICK LOAN/);
  assert.doesNotMatch(src, /EST\. MONTHLY/);
  assert.match(src, /function calScreenDisclaimer/);
  assert.match(src, /not a loan offer or prequalification/);
  assert.match(src, /Preview \/ demo rates, not live RateAPI/);
  assert.match(src, /not live offers or a loan commitment/);
});

test("rvCAL compare always sorts via sortLendersForCompare, including catalog fallback", () => {
  assert.match(src, /sortLendersForCompare/);
  assert.match(src, /sortLendersForCompare\(apiLenders/);
  assert.match(src, /setApiLenders\(sortLendersForCompare/);
  assert.match(
    src,
    /sortLendersForCompare\(apiLenders\?\.length \? apiLenders : LENDERS_CATALOG/,
  );
});

test("rvCAL payment report opens in-app — not window.open / document.write", () => {
  assert.match(src, /openPaymentReport\(/);
  assert.match(src, /closePaymentReport/);
  assert.doesNotMatch(src, /window\.open\(/);
  assert.doesNotMatch(src, /document\.write\(/);
  assert.match(src, /Payment report/);
});

test("rvCAL header drops the ZIP/lender subtitle and keeps the verified mark", () => {
  const calCopy = constants.match(/rvcal:\s*\{[\s\S]*?\n  \},/);
  assert.ok(calCopy?.[0], "Cal PAGE_COPY block");
  assert.match(calCopy[0], /title:\s*"RvCAL"/);
  assert.match(calCopy[0], /line:\s*""/);
  assert.doesNotMatch(calCopy[0], /ZIP-based calculator with lender comparisons/);
  assert.doesNotMatch(constants, /ZIP-based calculator/);
  assert.doesNotMatch(constants, /lender comparisons/);
  assert.match(header, /\{copy\.line \? \(/);
  assert.match(header, /<MetalVerifiedTrue/);
});
