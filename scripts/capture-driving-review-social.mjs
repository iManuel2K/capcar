// Local-only promotional captures; no real accounts, footage or provider calls.
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const out = "artifacts/driving-review/social-source";
await mkdir(out, { recursive: true });
let completed = false;
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const vehicle = {
    id: "social-demo",
    make: "BMW",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    bodyStyle: "Sedan",
    engineCode: "N43B20",
    transmission: "Manual",
    mileage: 148200,
    createdAt: "2026-11-08T12:00:00.000Z",
  };
  await context.addInitScript((vehicle) => {
    localStorage.setItem("capcar.vehicles.v1", JSON.stringify([vehicle]));
    localStorage.setItem("capcar.analytics-consent.v1", "denied");
  }, vehicle);
  const page = await context.newPage();
  await page.route("**/api/connections/ai", (r) =>
    r.fulfill({
      json: { configured: true, connected: true, provider: "gemini" },
    }),
  );
  await page.route("**/api/ai/driving-review", (r) =>
    r.fulfill({
      json: {
        provider: "gemini",
        review: {
          summary:
            "Example reflection. This is illustrative content, not a real AI assessment.",
          limitations: [
            "The full scene and events between frames are not visible.",
          ],
          tips: [
            {
              frame: 1,
              observation: "Example: a junction is visible ahead.",
              suggestion: "Think back: when did you first notice the junction?",
              confidence: "low",
              focus: "awareness",
            },
          ],
        },
      },
    }),
  );
  await page.goto("http://localhost:3127/garage/social-demo/driving-review");
  await page
    .getByRole("heading", { name: "Learn from your last drive." })
    .waitFor();
  await page.waitForTimeout(800);
  await page
    .locator("section[aria-labelledby=clip-title]")
    .screenshot({ path: `${out}/upload.png` });
  await page
    .locator("input[type=file]")
    .setInputFiles("artifacts/driving-review/test-clip.mp4");
  await page.getByRole("heading", { name: "4 frames selected" }).waitFor();
  await page.getByRole("checkbox", { name: /I have permission/ }).check();
  await page
    .getByRole("button", { name: "Review selected frames", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your reflection", exact: true })
    .waitFor();
  await page.waitForTimeout(400);
  await page.getByRole("switch").check();
  await page
    .getByRole("button", { name: /Remember this coaching topic/ })
    .click();
  await page
    .locator("section[aria-labelledby=reflection-title] article")
    .screenshot({ path: `${out}/tip.png` });
  await page
    .locator("aside[aria-labelledby=learning-title]")
    .screenshot({ path: `${out}/learning.png` });
  await page.goto("http://localhost:3127/driving-review");
  await page
    .getByRole("heading", { name: "Learn from your last drive." })
    .waitFor();
  await page.waitForTimeout(500);
  await page.locator("main").screenshot({ path: `${out}/public.png` });
  console.log(
    "Captured actual interface for preview assets; all example content synthetic.",
  );
  completed = true;
} finally {
  const timeout = setTimeout(() => process.exit(completed ? 0 : 1), 5000);
  await browser.close();
  clearTimeout(timeout);
}
