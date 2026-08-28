import { chromium } from "playwright";
import { mkdirSync } from "fs";
mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200);
// dismiss any access modal
const dismiss = page.getByRole("button", { name: /Dismiss|Verify later|Skip/i });
if (await dismiss.count()) {
  await dismiss.first().click({ force: true });
  await page.waitForTimeout(400);
}
const facts = page.getByText("RvFACTS", { exact: true }).first();
if (await facts.count()) await facts.click({ force: true });
await page.waitForTimeout(600);
// dismiss again if it reopened
if (await page.getByRole("button", { name: /Dismiss|Verify later/i }).count()) {
  await page.getByRole("button", { name: /Dismiss|Verify later/i }).first().click({ force: true });
  await page.waitForTimeout(300);
}

async function pick(label) {
  const typeBtn = page.getByRole("button", { name: /Type \/ list/i });
  if (await typeBtn.count()) {
    try { await typeBtn.first().click({ timeout: 1200, force: true }); } catch {}
  }
  await page.waitForTimeout(200);
  const input = page.locator("input").first();
  if (await input.count()) {
    await input.fill(label);
    await page.waitForTimeout(200);
  }
  const row = page.locator("button, [role=button], li, div").filter({ hasText: new RegExp(`^${label}$`) }).last();
  if (await row.count()) {
    await row.click({ force: true });
    return true;
  }
  await page.getByText(label, { exact: false }).last().click({ force: true });
  return true;
}

await pick("2026");
await page.waitForTimeout(350);
await pick("Entegra Coach");
await page.waitForTimeout(350);
await pick("Accolade");
await page.waitForTimeout(350);
await pick("37M");
await page.waitForTimeout(2200);
await page.screenshot({ path: "/workspace/screenshots/seneca-accolade-report.png", fullPage: true });
const body = await page.locator("body").innerText();
console.log("HAS_360", /360/.test(body));
console.log("HAS_ISB", /ISB|6\.7/.test(body));
console.log("HAS_340_HP", /340\s*HP|340HP/.test(body));
console.log("HAS_S2RV", /S2RV/.test(body));
console.log("HAS_ALLISON", /Allison/.test(body));
console.log("HAS_ONAN", /Onan/.test(body));
console.log("SNIP", body.replace(/\s+/g, " ").slice(0, 1200));
await browser.close();
