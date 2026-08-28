import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8080/";
const shot = process.argv[3] || "/workspace/screenshots/rvcal-roller.png";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);

// Enter suite if launchpad
const enter = page.getByRole("button", { name: /enter suite/i });
if (await enter.count()) {
  await enter.first().click();
  await page.waitForTimeout(600);
}

// Click Cal tab
const calTab = page.locator('[data-tab="rvcal"], button:has-text("Cal"), [aria-label*="Cal"]').first();
// Bottom tabs often use text RvCal or Cal
const byText = page.getByText(/^Cal$|^RvCal$/).first();
if (await page.locator('[data-tab="rvcal"]').count()) {
  await page.locator('[data-tab="rvcal"]').first().click();
} else if (await byText.count()) {
  await byText.click();
} else {
  // try bottom nav images / buttons
  const tabs = page.locator("nav button, [role='tab'], footer button");
  const n = await tabs.count();
  console.log("tab count", n);
  for (let i = 0; i < n; i++) {
    const t = await tabs.nth(i).innerText().catch(() => "");
    const al = await tabs.nth(i).getAttribute("aria-label");
    console.log(i, JSON.stringify(t), al);
  }
  // second tab is often cal
  if (n >= 2) await tabs.nth(1).click();
}
await page.waitForTimeout(1200);

// Look for Price roller or Manual button
const body = await page.locator("body").innerText();
console.log("--- body snippet ---");
console.log(body.slice(0, 1500));

const hasPlus1k = body.includes("+ $1k") || body.includes("+$1k") || body.includes("+ $1");
const hasMinus1k = body.includes("− $1k") || body.includes("- $1k") || body.includes("– $1k");
const hasManual = /Manual/i.test(body);
const hasRollerLabel = /Swipe to set|Slow ·|purchase price/i.test(body);
const hasTaxInputVisibleNearPrice = false;

console.log({ hasPlus1k, hasMinus1k, hasManual, hasRollerLabel, errors });

// Scroll to purchase price section
const purchase = page.getByText(/purchase price/i).first();
if (await purchase.count()) {
  await purchase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

await page.screenshot({ path: shot, fullPage: true });
console.log("shot", shot);

// Toggle Manual and check text input appears
const manualBtn = page.getByRole("button", { name: /^Manual$/i }).first();
if (await manualBtn.count()) {
  await manualBtn.click();
  await page.waitForTimeout(400);
  const manualShot = shot.replace(".png", "-manual.png");
  await page.screenshot({ path: manualShot, fullPage: false });
  const hasInput = await page.locator('input[aria-label="Purchase price"]').count();
  console.log("manual input count", hasInput);
  // switch back
  const rollerBtn = page.getByRole("button", { name: /^Roller$/i }).first();
  if (await rollerBtn.count()) await rollerBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: shot.replace(".png", "-roller.png"), fullPage: false });
}

if (errors.length) {
  console.error("BROWSER_ERRORS", errors);
  process.exitCode = 1;
} else if (hasPlus1k || hasMinus1k) {
  console.error("STEP_TABS_STILL_PRESENT");
  process.exitCode = 2;
} else {
  console.log("QA_OK");
}

await browser.close();
