import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const baseUrl = process.env.DEPLOY_URL || "https://proofpay.pages.dev";
const outDir = path.resolve(process.cwd(), "../pitch/frames");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

async function shot(name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

// 1. Landing
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await wait(2000);
await shot("01-landing");

// 2. Create settlement page
await page.goto(`${baseUrl}/create`, { waitUntil: "networkidle" });
await wait(1500);
await shot("02-create");

// 3. Demo console - reset and create settlement
await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
await wait(1500);
await page.click('button:has-text("Connect Demo Wallet")').catch(() => {});
await wait(1000);
await page.click('button:has-text("Create Demo Settlement")');
await wait(1500);
await shot("03-demo-created");

// 4. Submit failed delivery
await page.click('button:has-text("Submit Failed Delivery")');
await wait(1500);
await shot("04-demo-failed-delivery");

// 5. Run failed review
await page.click('button:has-text("Run Failed Review")');
await wait(2000);
await shot("05-demo-failed-review");

// 6. Submit corrected delivery
await page.click('button:has-text("Submit Corrected Delivery")');
await wait(1500);
await shot("06-demo-corrected-delivery");

// 7. Run passing review
await page.click('button:has-text("Run Passing Review")');
await wait(2000);
await shot("07-demo-passing-review");

// 8. Approve and release
await page.click('button:has-text("Approve & Release")');
await wait(2000);
await shot("08-demo-released");

// 9. Verify passport
await page.click('button:has-text("Verify Passport")');
await wait(2000);
await shot("09-demo-passport");

// 10. Verify page
await page.goto(`${baseUrl}/verify`, { waitUntil: "networkidle" });
await wait(1500);
await page.click('button:has-text("View ResearchBot-01 Passport")');
await wait(2000);
await shot("10-verify-page");

await browser.close();
console.log("Screenshots captured in", outDir);
