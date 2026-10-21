// Isolated browser QA: no real sign-in, owner records, purchases or AI-provider calls.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = "http://localhost:3122";
const out = resolve("artifacts/public-polish");
const report = { checks: [], errors: [], model: "not checked" };
const app = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "dev", "--port", "3122"],
  {
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_local_fixture",
      NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
    },
  },
);
let browser;
async function overflow(page, label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow: ${label}`,
  );
}
async function hydrated(page) {
  await page.waitForFunction(() => {
    const target =
      document.querySelector("main button") ??
      document.querySelector("header button");
    return (
      target &&
      Object.keys(target).some((key) => key.startsWith("__reactProps$"))
    );
  });
}
try {
  await mkdir(out, { recursive: true });
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  browser = await chromium.launch({ channel: "msedge", headless: true });
  for (const width of [375, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 375 ? 812 : 1000 },
      reducedMotion: "reduce",
      ...(width === 375 ? { isMobile: true, hasTouch: true } : {}),
    });
    let tracking = 0;
    await context.route(/https:\/\/[^/]*posthog\.com\//, (route) => {
      tracking++;
      return route.abort();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto(base, { waitUntil: "domcontentloaded" });
    const notice = page.getByRole("region", {
      name: "Optional usage analytics",
    });
    await notice.waitFor();
    await page.waitForFunction(() => {
      const button = document.querySelector(
        'section[aria-label="Optional usage analytics"] button',
      );
      return (
        button &&
        Object.keys(button).some((key) => key.startsWith("__reactProps$"))
      );
    });
    if (width === 375) {
      assert.equal(
        await notice.evaluate((el) => getComputedStyle(el).position),
        "relative",
      );
      assert(
        await page.evaluate(() => {
          const prompt = document
            .querySelector('section[aria-label="Optional usage analytics"]')
            .getBoundingClientRect();
          const cta = document
            .querySelector('[data-testid="hero-actions"] a')
            .getBoundingClientRect();
          return prompt.bottom <= cta.top;
        }),
      );
      await page.screenshot({ path: `${out}/consent-375.png` });
    }
    await page
      .getByRole("button", { name: "Decline analytics", exact: true })
      .click();
    await notice.waitFor({ state: "hidden" });
    for (const route of [
      "/",
      "/platform",
      "/studio",
      "/sound-studio",
      "/movie-cars",
      "/roadbook",
      "/roadmap",
      "/en/journal",
    ]) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await hydrated(page);
      await page.waitForTimeout(400);
      await overflow(page, `${route} ${width}`);
      if (width === 375 || width === 1440) {
        const name =
          route === "/" ? "home" : route.replaceAll("/", "-").slice(1);
        await page.screenshot({ path: `${out}/${name}-${width}.png` });
      }
      if (route === "/") {
        const cta = page.locator('[data-testid="hero-actions"] a').first();
        assert.equal(await cta.getAttribute("href"), "/garage/new");
        if (width === 375) assert((await cta.boundingBox()).y < 812);
        await page
          .getByRole("button", { name: "Concept direction", exact: true })
          .click();
        assert.equal(await page.getByRole("slider").inputValue(), "100");
        assert.equal(await page.getByRole("slider").getAttribute("dir"), "ltr");
        await page
          .getByRole("button", { name: "Starting point", exact: true })
          .click();
        assert.equal(await page.getByRole("slider").inputValue(), "0");
        if (width === 1440) {
          await page
            .locator('[data-testid="hero-actions"]')
            .getByRole("link", { name: /Explore an example garage/ })
            .click();
          const demo = page.locator("#live-demo");
          await demo.getByRole("tab", { name: "Parts comparison" }).click();
          await demo
            .getByRole("button", { name: "Add to the example plan" })
            .click();
          await demo.getByRole("tab", { name: "Vehicle Passport" }).click();
          await demo
            .getByRole("button", { name: "Record completed work" })
            .click();
          await demo
            .getByText("Recorded · Actual spending: €28", { exact: true })
            .waitFor();
          await page.screenshot({ path: `${out}/completed-example-1440.png` });
          await demo.getByRole("button", { name: "Undo completion" }).click();
          await demo
            .getByRole("button", { name: "Record completed work" })
            .waitFor();
          report.checks.push(
            "Example planning, actual cost, completion and undo",
          );
        }
      }
      if (route === "/sound-studio") {
        const play = page.getByRole("button", {
          name: "Play recording: Recording A",
          exact: true,
        });
        await play.waitFor();
        if (width === 375)
          assert(
            (await play.boundingBox()).y < 812,
            "First audio control is below the mobile fold",
          );
        assert.equal(
          await page.getByText("Reference A", { exact: true }).count(),
          1,
        );
        if (width === 1440) {
          await play.click();
          await page.waitForFunction(
            () =>
              !document.querySelector('audio[aria-label="Recording A"]').paused,
            null,
            { timeout: 15000 },
          );
          await page
            .getByRole("button", { name: "Listen to B", exact: true })
            .click();
          await page.waitForFunction(
            () =>
              document.querySelector('audio[aria-label="Recording A"]')
                .paused &&
              !document.querySelector('audio[aria-label="Recording B"]').paused,
          );
          report.checks.push(
            "Real local audio playback and exclusive A/B switching",
          );
        }
      }
      if (route === "/studio" && width === 1440) {
        assert.equal(await page.locator("canvas").count(), 0);
        await page
          .getByRole("button", { name: "Load interactive 3D", exact: true })
          .click();
        await page.waitForFunction(
          () =>
            ["ready", "error"].includes(
              document.querySelector("[data-model-state]")?.dataset.modelState,
            ),
          null,
          { timeout: 45000 },
        );
        report.model = await page
          .locator("[data-model-state]")
          .getAttribute("data-model-state");
        if (report.model === "ready") {
          await page
            .getByRole("button", { name: "Side view", exact: true })
            .click();
          await page
            .getByRole("button", { name: "Zoom in", exact: true })
            .click();
          await page.screenshot({ path: `${out}/studio-3d-1440.png` });
          await page
            .getByRole("button", { name: "Stop 3D", exact: true })
            .click();
          assert.equal(await page.locator("canvas").count(), 0);
        } else {
          await page.getByRole("img", { name: /3D model preview/ }).waitFor();
          await page
            .getByRole("button", { name: "Retry", exact: true })
            .waitFor();
        }
      }
      if (route === "/roadmap") {
        const details = page.locator("#tangible details");
        await details.locator("summary").click();
        await page.getByText(/Browse 150 credited recordings/).waitFor();
        assert.equal(
          await page
            .locator("#tangible")
            .getByText("AI scenic weekend planning", { exact: true })
            .count(),
          1,
        );
        assert.equal(
          await page
            .locator("#beyond")
            .getByText("AI scenic weekend planning", { exact: true })
            .count(),
          0,
        );
      }
      if (route === "/roadbook") {
        const picker = page.locator(".roadbook-style-picker:visible").first();
        await picker.locator("summary").click();
        assert.equal(await picker.getByRole("radio").count(), 9);
        await picker.getByRole("radio", { name: "Tokyo", exact: true }).click();
        assert.equal(
          await picker
            .getByRole("radio", { name: "Tokyo", exact: true })
            .getAttribute("aria-checked"),
          "true",
        );
        await picker
          .getByRole("radio", { name: "Tokyo", exact: true })
          .press("Home");
        assert.equal(
          await picker
            .getByRole("radio", { name: "Konstanz", exact: true })
            .getAttribute("aria-checked"),
          "true",
        );
      }
      report.checks.push(`${route}: ${width}px, no horizontal overflow`);
    }
    assert.equal(tracking, 0, "Analytics sent after decline");
    await context.close();
    console.log(`PASS responsive pages and interactions: ${width}px`);
  }
  for (const [locale, search, save] of [
    ["en", "Search cars", "Save direction"],
    ["de", "Autos suchen", "Ansicht speichern"],
    ["el", "Αναζήτηση αυτοκινήτων", "Αποθήκευση επιλογής"],
    ["sq", "Kërko makina", "Ruaj pamjen"],
    ["ja", "車を検索", "選択を保存"],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() =>
      localStorage.setItem("capcar.analytics-consent.v1", "denied"),
    );
    const page = await context.newPage();
    await page.goto(`${base}/${locale}/studio`, {
      waitUntil: "domcontentloaded",
    });
    await hydrated(page);
    await page
      .getByRole("searchbox", { name: search, exact: true })
      .fill("Skyline");
    assert.equal(await page.locator("aside button[aria-pressed]").count(), 1);
    await page.getByRole("button", { name: save, exact: true }).click();
    assert(
      await page.evaluate(() =>
        localStorage.getItem("capcar.car-studio.v1")?.includes("bmw-m3-e30"),
      ),
    );
    await overflow(page, locale);
    report.checks.push(`Studio search and saving translated: ${locale}`);
    await context.close();
  }
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.errors.push(String(error));
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  if (browser)
    await Promise.race([
      browser.close(),
      new Promise((done) => setTimeout(done, 5000)),
    ]);
  if (app.pid)
    spawnSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
}
process.exit(process.exitCode ?? 0);
