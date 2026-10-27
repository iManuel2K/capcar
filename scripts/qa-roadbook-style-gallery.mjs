// Public-only browser checks: no owner data, sign-in or production writes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.ROADBOOK_PREVIEW_URL ?? "http://localhost:3127";
const out = "artifacts/roadbook-style-gallery";
const report = { checks: [], errors: [] };
const browser = await chromium.launch({ channel: "msedge", headless: true });
async function readyImage(page) {
  await page.waitForFunction(() => {
    const image = document.querySelector(
      '#roadbook-styles [data-open="true"] img',
    );
    return image?.complete && image.naturalWidth > 0;
  });
}
try {
  await mkdir(out, { recursive: true });
  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    const page = await context.newPage();
    let liveMapRequests = 0;
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("request", (request) => {
      if (request.url().includes("tiles.openfreemap.org")) liveMapRequests++;
    });
    await page.goto(base, { waitUntil: "networkidle" });
    const gallery = page.locator("#roadbook-styles");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      Object.keys(document.querySelector("#roadbook-styles button")).some(
        (key) => key.startsWith("__reactProps$"),
      ),
    );
    await readyImage(page);
    assert.equal(
      await gallery.locator("img").count(),
      1,
      "No eager nine-image mounting",
    );
    assert.equal(
      liveMapRequests,
      0,
      "Homepage must not load the live map runtime",
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `overflow ${width}`,
    );
    const kyoto = gallery.getByRole("button", { name: "Kyoto", exact: true });
    if (width < 768) await kyoto.tap();
    else await kyoto.hover();
    await readyImage(page);
    assert.equal(await kyoto.getAttribute("aria-expanded"), "true");
    if (width >= 768) {
      await kyoto.focus();
      await kyoto.press("End");
      assert.equal(
        await gallery
          .getByRole("button", { name: "Tokyo", exact: true })
          .getAttribute("aria-expanded"),
        "true",
      );
      await kyoto.hover();
      assert.equal(
        await gallery
          .getByRole("button", { name: "Tokyo", exact: true })
          .getAttribute("aria-expanded"),
        "true",
        "Hover must not steal keyboard focus",
      );
    }
    await gallery
      .getByRole("button", { name: "Konstanz", exact: true })
      .click();
    await readyImage(page);
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });
    if ([375, 1440].includes(width))
      await gallery.screenshot({ path: `${out}/gallery-${width}.png` });
    if (width === 1440) {
      for (const name of [
        "Reykjavík",
        "Lissabon",
        "Wien",
        "Zürich",
        "Venedig",
        "Kyoto",
        "Marrakesch",
        "Tokyo",
      ]) {
        await gallery.getByRole("button", { name, exact: true }).click();
        await readyImage(page);
      }
      await gallery.screenshot({ path: `${out}/tokyo-1440.png` });
      await gallery
        .getByRole("link", { name: "Open this style", exact: true })
        .click();
      await page.waitForURL(/roadbook\?style=tokyo/);
      await page
        .locator('.roadbook-map-shell[data-roadbook-style="tokyo"]')
        .waitFor();
    }
    report.checks.push({
      width,
      interaction: width < 768 ? "touch" : "hover/keyboard",
      liveMapRequestsOnHomepage: 0,
    });
    await context.close();
  }
  for (const locale of ["en", "de", "el", "sq", "ja"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
      isMobile: true,
      hasTouch: true,
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    const gallery = page.locator("#roadbook-styles");
    await gallery.scrollIntoViewIfNeeded();
    await readyImage(page);
    await gallery.getByRole("button", { name: "Tokyo", exact: true }).tap();
    await readyImage(page);
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert.equal(
      await gallery
        .getByRole("button", { name: "Tokyo", exact: true })
        .getAttribute("aria-expanded"),
      "true",
    );
    assert(
      await gallery
        .locator('article[data-open="true"] a')
        .getAttribute("href")
        .then((href) => href.endsWith("/roadbook?style=tokyo")),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `locale overflow ${locale}`,
    );
    await gallery.screenshot({ path: `${out}/${locale}-375.png` });
    report.checks.push({ locale, width: 375 });
    await context.close();
  }
  const motionContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  const motionPage = await motionContext.newPage();
  motionPage.on("pageerror", (error) => report.errors.push(error.message));
  await motionPage.goto(base, { waitUntil: "networkidle" });
  const motionGallery = motionPage.locator("#roadbook-styles");
  await motionGallery.scrollIntoViewIfNeeded();
  await readyImage(motionPage);
  const motionKyoto = motionGallery.getByRole("button", {
    name: "Kyoto",
    exact: true,
  });
  await motionKyoto.hover();
  await motionPage.waitForTimeout(1000);
  await readyImage(motionPage);
  assert.equal(await motionKyoto.getAttribute("aria-expanded"), "true");
  const pictureWidth = await motionGallery
    .locator('article[data-open="true"] img')
    .evaluate((image) => image.getBoundingClientRect().width);
  assert(pictureWidth > 1000, "Desktop map preview must fill the row");
  await motionPage.mouse.move(0, 0);
  await motionPage.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await motionGallery.screenshot({ path: `${out}/motion-1440.png` });
  report.checks.push({
    width: 1440,
    interaction: "spring hover",
    pictureWidth,
  });
  await motionContext.close();
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
