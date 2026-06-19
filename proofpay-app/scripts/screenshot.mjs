import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
await page.goto("http://localhost:3001/");
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: "/Volumes/extdisk/project/sui/proofPay/pitch/screenshot.png", fullPage: false });
await browser.close();
console.log("screenshot saved");
