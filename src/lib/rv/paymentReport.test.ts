import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPdfReportHtml,
  computeLoan,
  formatMoney,
  openPaymentReport,
} from "./rvCal.ts";

const root = dirname(fileURLToPath(import.meta.url));

function sampleLoan() {
  return computeLoan({
    price: 180_000,
    downPayment: 36_000,
    apr: 7.99,
    termMonths: 180,
    taxRate: 5.6,
    tradeValue: 0,
    tradePayoff: 0,
    registrationFees: 425,
    applyTradeInTaxCredit: true,
  });
}

test("payment report HTML includes financed / payment / interest / term", () => {
  const loan = sampleLoan();
  const html = buildPdfReportHtml({
    price: 180_000,
    loan,
    downPct: 20,
    stateLabel: "AZ · 5.60%",
    credit: "800–850",
  });

  assert.match(html, /RvCal Payment Report/);
  assert.match(html, /Amount Financed/);
  assert.match(html, /Est\. Monthly/);
  assert.match(html, /Total Interest/);
  assert.match(html, /Total of Payments/);
  assert.match(html, /180 months/);
  assert.match(html, /7\.99% APR/);
  assert.match(html, /20% down/);
  assert.match(html, /AZ · 5\.60%/);
  assert.ok(html.includes(formatMoney(loan.amountFinanced)));
  assert.ok(html.includes(formatMoney(loan.monthlyPayment, 2)));
  assert.ok(html.includes(formatMoney(loan.totalInterest, 2)));
  assert.ok(loan.amountFinanced > 0);
  assert.ok(loan.totalInterest > 0);
});

test("payment report HTML escapes untrusted labels", () => {
  const html = buildPdfReportHtml({
    price: 1,
    loan: sampleLoan(),
    downPct: 0,
    stateLabel: `<img src=x onerror=alert(1)>`,
    credit: `</p><script>alert(1)</script>`,
  });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x/);
  assert.match(html, /&lt;\/p&gt;&lt;script&gt;/);
});

test("openPaymentReport is a no-op without a document (SSR / node)", () => {
  assert.equal(typeof document, "undefined");
  assert.equal(openPaymentReport("<html></html>"), false);
});

test("payment report opener uses srcdoc overlay, not popup write", () => {
  const src = readFileSync(join(root, "rvCal.ts"), "utf8");
  assert.match(src, /export function openPaymentReport/);
  assert.match(src, /iframe\.srcdoc = html/);
  assert.match(src, /rvcal-payment-report-overlay/);
  assert.doesNotMatch(src, /document\.write/);
  assert.doesNotMatch(src, /window\.open\(/);
});
