// Read-only public UI checks. No sign-in, owner data, AI calls or production writes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.EDITORIAL_QA_URL ?? "http://localhost:3126";
const out = "artifacts/editorial";
const report = { checks: [], errors: [] };
const browser = await chromium.launch({ channel: "msedge", headless: true });
await mkdir(out, { recursive: true });
try {
  for (const width of [320, 375, 414, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    await context.route(/https:\/\/[^/]*posthog\.com\//, (route) =>
      route.abort(),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    for (const route of [
      "/",
      "/platform",
      "/project-car-planner",
      "/car-maintenance-tracker",
      "/ai",
      "/studio",
      "/sound-studio",
      "/movie-cars",
      "/roadmap",
      "/en/journal",
      "/connected-parts",
    ]) {
      const response = await page.goto(base + route, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, route);
      await page.locator("main h1").waitFor();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `overflow ${route} ${width}`,
      );
      if (route === "/") {
        await page.waitForFunction(() =>
          Object.keys(document.querySelector('input[type="range"]') ?? {}).some(
            (k) => k.startsWith("__reactProps$"),
          ),
        );
        const slider = page.getByRole("slider");
        assert.equal(await slider.getAttribute("dir"), "ltr");
        await page
          .getByRole("button", { name: "Concept direction", exact: true })
          .click();
        assert.equal(await slider.inputValue(), "100");
        await page
          .getByRole("button", { name: "Starting point", exact: true })
          .click();
        assert.equal(await slider.inputValue(), "0");
        await page
          .getByRole("button", { name: "50 / 50", exact: true })
          .click();
        const cta = page.locator('[data-testid="hero-actions"] a').first();
        assert.equal(await cta.getAttribute("href"), "/garage/new");
        if (width === 375)
          assert(
            (await cta.boundingBox()).y < 812,
            "mobile primary CTA above fold",
          );
        for (const name of [
          "Maintain your car",
          "Plan your build",
          "Find your next drive",
        ]) {
          assert(
            await page.getByRole("heading", { name, exact: true }).isVisible(),
          );
        }
      }
      if (
        [375, 1440].includes(width) &&
        ["/", "/platform", "/studio", "/sound-studio", "/en/journal"].includes(
          route,
        )
      ) {
        await page.screenshot({
          path: `${out}/${route.replaceAll("/", "-") || "home"}-${width}.png`,
          fullPage: true,
        });
      }
      report.checks.push({ route, width });
    }
    await context.close();
  }
  for (const locale of ["en", "de", "el", "sq", "ja"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    for (const route of [
      "/",
      "/studio",
      "/sound-studio",
      "/project-car-planner",
    ]) {
      await page.goto(`${base}/${locale}${route === "/" ? "" : route}`, {
        waitUntil: "networkidle",
      });
      assert.equal(await page.locator("html").getAttribute("lang"), locale);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `locale overflow ${route} ${locale}`,
      );
      assert(await page.locator("main h1").innerText());
      report.checks.push({ route, locale, width: 375 });
    }
    await page.screenshot({ path: `${out}/${locale}-375.png`, fullPage: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(
  JSON.stringify({ checks: report.checks.length, errors: report.errors }),
);
