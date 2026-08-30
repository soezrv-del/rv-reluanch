//#region node_modules/.nitro/vite/services/ssr/assets/rvCal-CgEdg_DQ.js
function clampNumber(n, min = 0, max = Number.MAX_SAFE_INTEGER) {
	if (!Number.isFinite(n)) return min;
	return Math.min(max, Math.max(min, n));
}
function monthlyPayment(principal, aprPercent, termMonths) {
	const P = clampNumber(principal);
	const n = Math.max(1, Math.round(termMonths));
	if (P <= 0) return 0;
	const r = clampNumber(aprPercent) / 100 / 12;
	if (r === 0) return P / n;
	const pow = Math.pow(1 + r, n);
	return P * r * pow / (pow - 1);
}
function computeLoan(input) {
	const price = clampNumber(input.price);
	const tradeValue = clampNumber(input.tradeValue ?? 0);
	const tradePayoff = clampNumber(input.tradePayoff ?? 0);
	const registrationFees = clampNumber(input.registrationFees ?? 0);
	const fees = clampNumber(input.fees ?? 0);
	const down = clampNumber(input.downPayment, 0, price * 2);
	const taxRate = clampNumber(input.taxRate, 0, 25);
	const termMonths = Math.max(1, Math.round(input.termMonths));
	const apr = clampNumber(input.apr, 0, 40);
	const equity = tradeValue - tradePayoff;
	const negativeEquity = equity < 0 ? Math.abs(equity) : 0;
	const tradeCredit = input.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const taxableAmount = Math.max(0, price - tradeCredit);
	const taxAmount = Math.round(taxableAmount * taxRate / 100);
	const gross = price + taxAmount + registrationFees + fees - equity;
	const amountFinanced = Math.max(0, gross - down);
	const payment = monthlyPayment(amountFinanced, apr, termMonths);
	const totalPaid = payment * termMonths;
	return {
		taxableAmount,
		taxAmount,
		registrationFees,
		fees,
		tradeValue,
		tradePayoff,
		equity,
		negativeEquity,
		amountFinanced,
		monthlyPayment: payment,
		totalPaid,
		totalInterest: Math.max(0, totalPaid - amountFinanced),
		downPayment: down,
		price,
		termMonths,
		apr,
		paymentToIncome: (monthlyIncome) => {
			const inc = clampNumber(monthlyIncome);
			if (inc <= 0 || payment <= 0) return null;
			return payment / inc * 100;
		}
	};
}
/**
* Invert monthly payment → principal (amount financed).
*/
function principalFromPayment(monthly, aprPercent, termMonths) {
	const M = clampNumber(monthly);
	const n = Math.max(1, Math.round(termMonths));
	if (M <= 0) return 0;
	const r = clampNumber(aprPercent) / 100 / 12;
	if (r === 0) return M * n;
	const pow = Math.pow(1 + r, n);
	return M * (pow - 1) / (r * pow);
}
/**
* Reverse solve: desired monthly payment → purchase price, given
* down %, APR, term, tax, trade, fees (same stack as computeLoan).
*/
function priceForTargetPayment(targetMonthly, downPct, opts) {
	const target = clampNumber(targetMonthly);
	if (target <= 0) return 0;
	const AF = principalFromPayment(target, opts.apr, opts.termMonths);
	const t = clampNumber(opts.taxRate, 0, 25) / 100;
	const d = clampNumber(downPct, 0, 100) / 100;
	const tradeValue = clampNumber(opts.tradeValue ?? 0);
	const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
	const registrationFees = clampNumber(opts.registrationFees ?? 0);
	const fees = clampNumber(opts.fees ?? 0);
	const equity = tradeValue - tradePayoff;
	const tradeCredit = opts.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const denom = 1 + t - d;
	if (denom <= .01) return 0;
	const price = (AF + tradeCredit * t - registrationFees - fees + equity) / denom;
	if (!Number.isFinite(price) || price < 0) return 0;
	return Math.round(Math.min(5e6, Math.max(0, price)));
}
/**
* Reverse solve: desired amount financed → purchase price, given
* down %, tax, trade, fees (same stack as computeLoan).
*/
function priceForTargetAmountFinanced(targetAmountFinanced, downPct, opts) {
	const AF = clampNumber(targetAmountFinanced);
	if (AF <= 0) return 0;
	const t = clampNumber(opts.taxRate, 0, 25) / 100;
	const d = clampNumber(downPct, 0, 100) / 100;
	const tradeValue = clampNumber(opts.tradeValue ?? 0);
	const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
	const registrationFees = clampNumber(opts.registrationFees ?? 0);
	const fees = clampNumber(opts.fees ?? 0);
	const equity = tradeValue - tradePayoff;
	const tradeCredit = opts.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const denom = 1 + t - d;
	if (denom <= .01) return 0;
	const price = (AF + tradeCredit * t - registrationFees - fees + equity) / denom;
	if (!Number.isFinite(price) || price < 0) return 0;
	return Math.round(Math.min(5e6, Math.max(0, price)));
}
function aprForCredit(band, termMonths) {
	let apr = {
		fair: 12.99,
		good: 10.49,
		"very-good": 8.49,
		excellent: 6.99
	}[band];
	if (termMonths > 180) apr += .5;
	else if (termMonths > 120) apr += .25;
	else if (termMonths <= 84) apr -= .15;
	return Math.round(apr * 100) / 100;
}
function creditLabel(band) {
	switch (band) {
		case "fair": return "600–650";
		case "good": return "650–700";
		case "very-good": return "700–750";
		case "excellent": return "800–850";
	}
}
function creditHint(band) {
	switch (band) {
		case "fair": return "600–650 · Highest rates · many RV lenders limited; large coaches often need more down or a co-buyer";
		case "good": return "650–700 · Higher rates · mid-size loans possible; 15–20%+ down helps big tickets";
		case "very-good": return "700–750 · Competitive rates · most specialty RV lenders will work the deal";
		case "excellent": return "800–850 · Best rates · strongest approval odds on six-figure motorhomes";
	}
}
/** Score ranges for the credit roll picker (FICO-style RV financing bands) */
var CREDIT_BANDS = [
	{
		id: "fair",
		range: "600–650",
		label: "600–650"
	},
	{
		id: "good",
		range: "650–700",
		label: "650–700"
	},
	{
		id: "very-good",
		range: "700–750",
		label: "700–750"
	},
	{
		id: "excellent",
		range: "800–850",
		label: "800–850"
	}
];
var TERM_PRESETS = [
	{
		label: "7 yr",
		months: 84,
		years: 7
	},
	{
		label: "10 yr",
		months: 120,
		years: 10
	},
	{
		label: "12 yr",
		months: 144,
		years: 12
	},
	{
		label: "15 yr",
		months: 180,
		years: 15
	},
	{
		label: "20 yr",
		months: 240,
		years: 20
	}
];
/** Down payment % — 0 first, then 10 / 15 / 20 / 30 */
var DOWN_PRESETS = [
	0,
	10,
	15,
	20,
	30
];
/** APR roll steps for the drum picker (manual override) */
var APR_PRESETS = (() => {
	const out = [];
	for (let a = 5; a <= 13.01; a += .25) out.push(Math.round(a * 100) / 100);
	return out;
})();
function lenderApr(lender, band) {
	const t = band === "excellent" ? 0 : band === "very-good" ? .28 : band === "good" ? .55 : .85;
	return Math.round((lender.aprLow + (lender.aprHigh - lender.aprLow) * t) * 100) / 100;
}
function lenderMonthly(lender, amountFinanced, termMonths, band) {
	if (amountFinanced < lender.minLoan) return null;
	const term = Math.min(lender.termMax, Math.max(lender.termMin, termMonths));
	return monthlyPayment(amountFinanced, lenderApr(lender, band), term);
}
function formatMoney(n, digits = 0) {
	if (!Number.isFinite(n)) return "—";
	return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
function formatPct(n, digits = 2) {
	if (!Number.isFinite(n)) return "—";
	return `${n.toFixed(digits)}%`;
}
function defaultAprForTerm(termMonths) {
	if (termMonths <= 60) return 6.99;
	if (termMonths <= 120) return 7.49;
	if (termMonths <= 180) return 7.99;
	return 8.49;
}
function buildPdfReportHtml(opts) {
	const { price, loan, downPct, stateLabel, credit } = opts;
	const eqParts = [
		formatMoney(price, 0),
		`+ ${formatMoney(loan.taxAmount, 0)} tax`,
		`+ ${formatMoney(loan.registrationFees, 0)} fees`
	];
	if (loan.negativeEquity > 0) eqParts.push(`+ ${formatMoney(loan.negativeEquity, 0)} neg. equity`);
	if (loan.equity > 0) eqParts.push(`− ${formatMoney(loan.equity, 0)} trade equity`);
	eqParts.push(`− ${formatMoney(loan.downPayment, 0)} down`);
	const equation = `${eqParts.join(" ")} = ${formatMoney(loan.amountFinanced, 0)} financed`;
	return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>RvCal Report</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;padding:32px;max-width:720px;margin:0 auto}
    h1{color:#c9a227} .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333}
    .muted{color:#aaa;font-size:13px} .big{font-size:42px;font-weight:700}
    .eq{margin-top:16px;padding:12px;border:1px solid #444;border-radius:10px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;color:#ddd}
    .warn{color:#f5a623}
  </style></head><body>
  <h1>RvCal Payment Report</h1>
  <p class="muted">${stateLabel} · Credit: ${credit} · Generated ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
  <p class="big">${formatMoney(loan.monthlyPayment)}<span class="muted"> /mo</span></p>
  <p class="muted">${loan.termMonths} months · ${formatPct(loan.apr)} APR · ${downPct}% down</p>
  <div class="row"><span>Vehicle Price</span><span>${formatMoney(price)}</span></div>
  <div class="row"><span>Sales Tax</span><span>${formatMoney(loan.taxAmount)}</span></div>
  <div class="row"><span>Registration</span><span>${formatMoney(loan.registrationFees)}</span></div>
  <div class="row"><span>Negative Equity</span><span class="${loan.negativeEquity > 0 ? "warn" : ""}">${formatMoney(loan.negativeEquity)}</span></div>
  <div class="row"><span>Trade Equity Applied</span><span>${loan.equity > 0 ? "−" + formatMoney(loan.equity) : formatMoney(0)}</span></div>
  <div class="row"><span>Down Payment</span><span>−${formatMoney(loan.downPayment)}</span></div>
  <div class="row"><span><strong>Amount Financed</strong></span><span><strong>${formatMoney(loan.amountFinanced)}</strong></span></div>
  <div class="row"><span><strong>Est. Monthly</strong></span><span><strong>${formatMoney(loan.monthlyPayment)}</strong></span></div>
  <div class="eq">${equation}</div>
  ${loan.negativeEquity > 0 ? `<p class="muted" style="margin-top:12px">Negative equity: trade payoff exceeds trade value. That balance is rolled into the amount financed.</p>` : ""}
  <p class="muted" style="margin-top:24px">Estimates only — not a credit offer. Confirm rates and fees with a dealer or lender.</p>
  </body></html>`;
}
//#endregion
export { aprForCredit as a, creditHint as c, formatMoney as d, formatPct as f, priceForTargetPayment as g, priceForTargetAmountFinanced as h, TERM_PRESETS as i, creditLabel as l, lenderMonthly as m, CREDIT_BANDS as n, buildPdfReportHtml as o, lenderApr as p, DOWN_PRESETS as r, computeLoan as s, APR_PRESETS as t, defaultAprForTerm as u };
