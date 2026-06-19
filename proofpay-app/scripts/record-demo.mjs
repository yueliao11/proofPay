import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const outDir = path.resolve(process.cwd(), "../pitch");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const videoPath = path.join(outDir, "proofpay-demo.mp4");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(text) {
  const btn = page.locator("button", { hasText: text }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

async function goto(url) {
  await page.goto(url);
  await wait(1500);
}

try {
  // Landing
  await goto("http://localhost:3001/");
  await wait(2000);

  // Create settlement
  await page.click("text=Create Settlement");
  await wait(1500);
  await page.click("text=Create & Lock Payment");
  await wait(2000);

  // Demo console
  await goto("http://localhost:3001/demo");
  await clickByText("Create Demo Settlement");
  await wait(2000);

  await clickByText("Submit Failed Delivery");
  await wait(2000);

  await clickByText("Run Failed Review");
  await wait(2500);

  await clickByText("Submit Corrected Delivery");
  await wait(2000);

  await clickByText("Run Passing Review");
  await wait(2500);

  await clickByText("Approve & Release");
  await wait(2500);

  await clickByText("Verify Passport");
  await wait(3000);

  // Passport verify page
  await goto("http://localhost:3001/verify");
  await wait(1500);
  await page.click("text=View ResearchBot-01 Passport");
  await wait(3000);

  await context.close();
  await browser.close();

  // Find the generated webm and convert to mp4
  const files = fs.readdirSync(outDir);
  const webm = files.find((f) => f.endsWith(".webm"));
  if (webm) {
    const webmPath = path.join(outDir, webm);
    execSync(`ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 23 -movflags +faststart -pix_fmt yuv420p "${videoPath}"`);
    fs.unlinkSync(webmPath);
    console.log("Demo video saved to:", videoPath);
  } else {
    console.log("No webm found, video may be in:", outDir);
  }
} catch (err) {
  console.error(err);
  await context.close();
  await browser.close();
  process.exit(1);
}
