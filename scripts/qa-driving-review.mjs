import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.CAPCAR_QA_URL ?? "http://localhost:3127";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Local-only fixtures");
const out = "artifacts/driving-review";
const vehicle = {
  id: "driving-qa-car",
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
const exampleReview = {
  summary: "Example review — this is demonstration data, not an AI assessment.",
  limitations: ["Sparse frames cannot show what happened between images."],
  tips: [
    {
      frame: 1,
      observation: "Example: a junction is visible ahead.",
      suggestion: "Think back: when did you first notice the junction?",
      confidence: "low",
      focus: "awareness",
    },
    {
      frame: 2,
      observation: "Example: the view is partly obstructed.",
      suggestion:
        "Consider whether you allowed yourself enough time to observe the road.",
      confidence: "low",
      focus: "planning",
    },
  ],
};
const report = { checks: [], errors: [] };
const browser = await chromium.launch({ channel: "msedge", headless: true });
let completed = false;
try {
  await mkdir(out, { recursive: true });
  for (const width of [375, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript((vehicle) => {
      if (!localStorage.getItem("capcar.vehicles.v1"))
        localStorage.setItem("capcar.vehicles.v1", JSON.stringify([vehicle]));
      localStorage.setItem("capcar.analytics-consent.v1", "denied");
    }, vehicle);
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    let requestBody;
    let fail = false;
    await page.route("**/api/connections/ai", (r) =>
      r.fulfill({
        json: { configured: true, connected: true, provider: "gemini" },
      }),
    );
    await page.route("**/api/ai/driving-review", async (r) => {
      requestBody = r.request().postDataJSON();
      await r.fulfill(
        fail
          ? { status: 502, json: { code: "invalid_result" } }
          : { json: { review: exampleReview, provider: "gemini" } },
      );
    });
    await page.goto(`${base}/garage/${vehicle.id}/driving-review`);
    await page
      .getByRole("heading", { name: "Learn from your last drive." })
      .waitFor();
    assert.equal(await page.getByRole("switch").isChecked(), false);
    await page.screenshot({
      path: `${out}/workspace-${width}.png`,
      fullPage: true,
    });
    await page
      .locator("input[type=file]")
      .setInputFiles(`${out}/test-clip.mp4`);
    await page
      .getByRole("heading", { name: "4 frames selected" })
      .waitFor({ timeout: 30000 });
    assert.equal(
      await page
        .getByRole("button", { name: "Review selected frames", exact: true })
        .isEnabled(),
      false,
    );
    await page
      .getByRole("checkbox", { name: "Include frame 4", exact: true })
      .uncheck();
    await page.getByRole("checkbox", { name: /I have permission/ }).check();
    await page
      .getByRole("button", { name: "Review selected frames", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Driving review report", exact: true })
      .waitFor();
    assert.equal(requestBody.frames.length, 3);
    assert.deepEqual(requestBody.preferences, []);
    assert.ok(!JSON.stringify(requestBody).includes(vehicle.id));
    assert.equal(
      await page.evaluate(() =>
        localStorage.getItem("capcar.driving-reviews.v1"),
      ),
      null,
    );
    await page
      .getByRole("button", { name: "Dismiss tip", exact: true })
      .last()
      .click();
    await page.getByRole("switch").check();
    await page
      .getByRole("button", { name: /Remember this coaching topic/ })
      .click();
    await page
      .getByRole("button", { name: "Save reflection to this car", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Saved to your private garage",
        exact: true,
      })
      .waitFor();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("capcar.driving-reviews.v1")),
    );
    assert.equal(stored[0].reviews.length, 1);
    assert.equal(stored[0].reviews[0].review.tips.length, 1);
    assert.deepEqual(stored[0].preferences, ["awareness"]);
    assert.ok(!JSON.stringify(stored).includes("data:image"));
    await page.screenshot({
      path: `${out}/reflection-${width}.png`,
      fullPage: true,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `horizontal overflow ${width}`);
    await page
      .getByRole("button", { name: "Review selected frames", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Driving review report", exact: true })
      .waitFor();
    assert.deepEqual(requestBody.preferences, ["awareness"]);
    await page.getByRole("switch").uncheck();
    await page
      .getByRole("button", { name: "Review selected frames", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Driving review report", exact: true })
      .waitFor();
    assert.deepEqual(requestBody.preferences, []);
    await page
      .getByRole("button", { name: "Reset learning", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm", exact: true })
      .click();
    const reset = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("capcar.driving-reviews.v1")),
    );
    assert.deepEqual(reset[0].preferences, []);
    assert.equal(reset[0].reviews.length, 1);
    await page.reload();
    await page
      .getByRole("heading", { name: "Saved reflections", exact: true })
      .waitFor();
    assert.equal(
      await page.getByRole("checkbox", { name: /Include frame/ }).count(),
      0,
    );
    await page
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "Gemini" }) })
      .locator("summary")
      .click();
    await page
      .getByRole("button", { name: "Delete reflection", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm", exact: true })
      .click();
    assert.equal(
      await page
        .getByText("Your first saved reflection will appear here.")
        .count(),
      1,
    );
    await page
      .locator("input[type=file]")
      .setInputFiles(`${out}/long-clip.mp4`);
    await page
      .getByRole("alert")
      .filter({ hasText: "between 1 and 60 seconds" })
      .waitFor();
    await page
      .locator("input[type=file]")
      .setInputFiles(`${out}/test-clip.mp4`);
    await page.getByRole("heading", { name: "4 frames selected" }).waitFor();
    fail = true;
    await page.getByRole("checkbox", { name: /I have permission/ }).check();
    await page
      .getByRole("button", { name: "Review selected frames", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "could not be validated" })
      .waitFor();
    report.checks.push({
      width,
      flow: "clip → remove frame → consent → review → dismiss → learning → save → personalized request → disable → reset → reload → delete; long clip and provider error",
      passed: true,
    });
    await context.close();
  }
  for (const locale of ["en", "de", "el", "sq", "ja"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    await context.addCookies([
      { name: "capcar_locale", value: locale, url: base },
    ]);
    const page = await context.newPage();
    const response = await page.goto(
      `${base}/${locale === "en" ? "" : locale + "/"}driving-review`,
    );
    assert.equal(response.status(), 200);
    const copy = JSON.parse(
      await readFile(`messages/driving-review/${locale}.json`, "utf8"),
    ).DrivingReview;
    await page
      .getByRole("heading", { name: copy.title, exact: true })
      .waitFor();
    await page.waitForTimeout(500);
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `${out}/public-${locale}.png`,
      fullPage: true,
    });
    await context.addInitScript((vehicle) => {
      localStorage.setItem("capcar.vehicles.v1", JSON.stringify([vehicle]));
    }, vehicle);
    await page.route("**/api/connections/ai", (r) =>
      r.fulfill({ json: { connected: false } }),
    );
    const garageResponse = await page.goto(
      `${base}/garage/${vehicle.id}/driving-review`,
    );
    assert.equal(garageResponse.status(), 200);
    await page
      .getByRole("heading", { name: copy.title, exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    report.checks.push({ locale, publicPage: true, garagePage: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(`${out}/qa-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  completed = true;
} finally {
  const timeout = setTimeout(() => process.exit(completed ? 0 : 1), 5000);
  await browser.close();
  clearTimeout(timeout);
}
