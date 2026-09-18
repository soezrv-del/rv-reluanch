import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const rvCal = readFileSync(join(root, "rvCal.ts"), "utf8");
const app = readFileSync(join(root, "../../components/rvcal/RvCalApp.tsx"), "utf8");

test("payment report HTML includes financed / payment / interest / term", () => {
  assert.match(rvCal, /export function buildPdfReportHtml/);
  assert.match(rvCal, /RvCal Payment Report/);
  assert.match(rvCal, /Amount Financed/);
  assert.match(rvCal, /Est\. Monthly/);
  assert.match(rvCal, /Total Interest/);
  assert.match(rvCal, /Total of Payments/);
  assert.match(rvCal, /formatMoney\(loan\.monthlyPayment, 2\)/);
  assert.match(rvCal, /formatMoney\(loan\.totalInterest, 2\)/);
  assert.match(rvCal, /formatMoney\(loan\.totalPaid, 2\)/);
  assert.match(rvCal, /\$\{termLabel\}/);
  assert.match(rvCal, /formatPct\(loan\.apr\)/);
});

test("payment report HTML escapes state and credit labels", () => {
  assert.match(rvCal, /function escapeReportText/);
  assert.match(rvCal, /escapeReportText\(stateLabel\)/);
  assert.match(rvCal, /escapeReportText\(credit\)/);
});

test("payment report opener uses srcdoc overlay, not popup write", () => {
  assert.match(rvCal, /export function openPaymentReport/);
  assert.match(rvCal, /export function closePaymentReport/);
  assert.match(rvCal, /iframe\.srcdoc = html/);
  assert.match(rvCal, /rvcal-payment-report-overlay/);
  assert.doesNotMatch(rvCal, /document\.write\(/);
  assert.doesNotMatch(rvCal, /window\.open\(/);
  assert.match(app, /openPaymentReport\(html\)/);
  assert.doesNotMatch(app, /window\.open\(/);
  assert.doesNotMatch(app, /document\.write\(/);
  assert.match(app, /text-\[11px\] font-medium text-white\/35/);
  assert.doesNotMatch(app, /FileText/);
});
