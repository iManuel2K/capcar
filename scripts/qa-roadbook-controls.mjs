// Public map only. No sign-in, private records or database mutations.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.ROADBOOK_PREVIEW_URL ?? "http://localhost:3127";
const out = "artifacts/roadbook-controls";
const report = { checks: [], errors: [] };
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  await mkdir(out, { recursive: true });
  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 740 : 1000 },
      reducedMotion: width === 1440 ? "no-preference" : "reduce",
      ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto(`${base}/roadbook`, { waitUntil: "domcontentloaded" });
    const picker = page.locator(".roadbook-style-picker");
    await picker.waitFor();
    await page
      .locator("[data-roadbook-place-count]")
      .getByText(/\d+ places in the catalog/)
      .waitFor({ timeout: 30000 });
    await page
      .locator(".roadbook-map-shell.is-vector-ready")
      .waitFor({ timeout: 60000 });
    assert.equal(await page.getByRole("radiogroup").count(), 1);
    assert.equal(await picker.getByRole("radio").count(), 9);
    assert.equal(await picker.locator("details, select, summary").count(), 0);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `root overflow ${width}`,
    );
    const first = picker.getByRole("radio", { name: "Konstanz", exact: true });
    await first.focus();
    const scrollY = await page.evaluate(() => window.scrollY);
    await first.press("End");
    const tokyo = picker.getByRole("radio", { name: "Tokyo", exact: true });
    assert.equal(await tokyo.getAttribute("aria-checked"), "true");
    assert(
      Math.abs((await page.evaluate(() => window.scrollY)) - scrollY) < 2,
      "Arrow selection must not move the page",
    );
    await page
      .locator('.roadbook-map-shell[data-roadbook-style="tokyo"]')
      .waitFor();
    await tokyo.press("Home");
    await first.click();
    assert.equal(await first.getAttribute("aria-checked"), "true");
    const touchSize = await first.boundingBox();
    assert(touchSize.height >= 44 && touchSize.width >= 44);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement?.blur());
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });
    const mapContainer = page.locator(".roadbook-map-shell").locator("..");
    await mapContainer.screenshot({ path: `${out}/map-${width}.png` });
    if (width === 375) {
      const zoom = page.locator(".leaflet-control-zoom");
      const pickerBox = await picker.boundingBox();
      const zoomBox = await zoom.boundingBox();
      assert(
        zoomBox.y + zoomBox.height <= pickerBox.y ||
          zoomBox.x + zoomBox.width <= pickerBox.x,
        "Style choices must not cover zoom",
      );
      await page
        .getByRole("button", { name: "Scenic routes", exact: true })
        .click();
      await page.waitForFunction(() => {
        const value =
          document.querySelector("[data-roadbook-place-count]")?.textContent ??
          "";
        return (
          value.includes("125 places in the catalog") &&
          /\d+ places in this area/.test(value) &&
          !value.includes("121 places in this area")
        );
      });
      await page
        .getByRole("button", { name: "Fuel stations", exact: true })
        .click();
      const fuelTypes = page.getByLabel("Fuel type", { exact: true });
      await fuelTypes.waitFor();
      const fuelBox = await fuelTypes.boundingBox();
      const fuelPickerBox = await picker.boundingBox();
      assert(
        fuelPickerBox.y + fuelPickerBox.height <= fuelBox.y,
        "Style choices must stay above fuel filters",
      );
      await mapContainer.screenshot({ path: `${out}/fuel-${width}.png` });
    }
    report.checks.push({
      width,
      count: await page.locator("[data-roadbook-place-count]").innerText(),
      touchSize,
    });
    await context.close();
  }
  for (const locale of ["de", "el", "sq", "ja"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto(`${base}/${locale}/roadbook`, {
      waitUntil: "domcontentloaded",
    });
    const picker = page.locator(".roadbook-style-picker");
    await picker.waitFor();
    assert.equal(await picker.getByRole("radio").count(), 9);
    const last = picker.getByRole("radio").last();
    await last.tap();
    assert.equal(await last.getAttribute("aria-checked"), "true");
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await picker.screenshot({ path: `${out}/${locale}-picker.png` });
    report.checks.push({ locale });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
} catch (error) {
  report.failure = String(error);
  process.exitCode = 1;
} finally {
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  await Promise.race([
    browser.close(),
    new Promise((done) => setTimeout(done, 5000)),
  ]);
}
console.log(JSON.stringify(report));
process.exit(process.exitCode ?? 0);
