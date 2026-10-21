// Local-only browser verification. No real accounts, provider calls or user records.
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const port = Number(process.env.SMOOTH_QA_PORT ?? 3120);
const base = `http://localhost:${port}`;
const out = "artifacts/smooth-interactions";
const report = { checks: [], errors: [], media: [] };
let log = "";
const app = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "dev", "--port", String(port)],
  {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "",
      NEXT_PUBLIC_POSTHOG_HOST: "",
    },
  },
);
for (const stream of [app.stdout, app.stderr])
  stream.on("data", (chunk) => {
    log += chunk;
  });
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const car = {
  id: "qa-smooth-car",
  make: "BMW",
  model: "318i",
  platform: "E90",
  productionYear: 2011,
  engineCode: "UNKNOWN",
  mileage: 0,
  mileageKnown: false,
  bodyStyle: "Sedan",
  transmission: "Unknown",
  createdAt: "2026-10-20T00:00:00.000Z",
};
async function ready() {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error("Local app did not start");
}
async function checkOverflow(page, label) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow: ${label}`,
  );
}
async function context(locale = "en", width = 1440, reducedMotion = "reduce") {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion,
  });
  await ctx.addCookies([{ name: "capcar_locale", value: locale, url: base }]);
  // Never load an external player as a side effect of a UI test.
  await ctx.route(
    /https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//,
    (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<p>Isolated video-player browser fixture</p>",
      }),
  );
  const page = await ctx.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  return { ctx, page };
}
try {
  await ready();
  const labels = {
    en: "Your garage",
    de: "Deine Garage",
    el: "Το γκαράζ σου",
    sq: "Garazhi yt",
    ja: "あなたのガレージ",
  };
  for (const [locale, label] of Object.entries(labels)) {
    for (const width of [1440, 375]) {
      const { ctx, page } = await context(locale, width);
      await page.goto(`${base}${locale === "en" ? "/" : `/${locale}`}`, {
        waitUntil: "networkidle",
      });
      const header = page.locator("header").first();
      if (width === 1440) {
        const trigger = header.getByRole("button", {
          name: label,
          exact: true,
        });
        await trigger.click();
        const region = page.getByRole("region", { name: label, exact: true });
        await region.waitFor({ state: "visible" });
        const bounds = await region.boundingBox();
        assert(
          bounds && bounds.x >= 0 && bounds.x + bounds.width <= width,
          `Panel bounds: ${locale}`,
        );
        await page.screenshot({ path: `${out}/navbar-${locale}-${width}.png` });
        await page.keyboard.press("Escape");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        assert(
          await trigger.evaluate((node) => document.activeElement === node),
        );
      } else {
        const trigger = header.locator(
          'button[aria-controls="mobile-marketing-navigation"]',
        );
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await page.screenshot({ path: `${out}/navbar-${locale}-${width}.png` });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "detached" });
        assert(
          await trigger.evaluate((node) => document.activeElement === node),
        );
      }
      await checkOverflow(page, `${locale}-${width}`);
      report.checks.push(
        `Navigation keyboard, panel bounds and overflow: ${locale}/${width}`,
      );
      await ctx.close();
    }
    console.log(`Navigation verified: ${locale}`);
  }
  const { ctx, page } = await context();
  await page.goto(`${base}/movie-cars`, { waitUntil: "networkidle" });
  assert.equal(await page.locator('iframe[src*="youtube"]').count(), 0);
  const watch = page.getByRole("button", {
    name: "Watch original scene",
    exact: true,
  });
  await watch.click();
  const modal = page.getByRole("dialog");
  await modal.waitFor({ state: "visible" });
  assert.match(
    await modal.locator("iframe").getAttribute("src"),
    /^https:\/\/www.youtube-nocookie.com\/embed\//,
  );
  const close = modal.getByRole("button", { name: "Close video" });
  assert(await close.evaluate((node) => document.activeElement === node));
  await page.keyboard.press("Shift+Tab");
  assert(
    await modal.evaluate((node) => node.contains(document.activeElement)),
    "Native dialog traps focus",
  );
  await page.screenshot({ path: `${out}/video-desktop.png` });
  await page.keyboard.press("Escape");
  await modal.waitFor({ state: "detached" });
  assert.equal(await page.locator('iframe[src*="youtube"]').count(), 0);
  assert(await watch.evaluate((node) => document.activeElement === node));
  report.checks.push(
    "Video deferred until click; focus trap, Escape, focus restoration and iframe teardown",
  );
  await page.goto(`${base}/en/journal`, { waitUntil: "networkidle" });
  const articleUrl = await page
    .locator('a[href^="/en/journal/"]')
    .first()
    .getAttribute("href");
  assert(articleUrl);
  await page.goto(`${base}${articleUrl}`, { waitUntil: "networkidle" });
  const meter = page.getByRole("progressbar", { name: "Reading progress" });
  const initial = Number(await meter.getAttribute("aria-valuenow"));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForFunction(
    () =>
      Number(
        document
          .querySelector('[role="progressbar"]')
          ?.getAttribute("aria-valuenow"),
      ) > 0,
  );
  assert(Number(await meter.getAttribute("aria-valuenow")) > initial);
  await page.screenshot({ path: `${out}/article-progress.png` });
  report.checks.push("Article-relative progress changes on scroll");
  await page.goto(`${base}/sound-studio`, { waitUntil: "networkidle" });
  const playA = page.getByRole("button", { name: /^Play.*Recording A/ });
  await playA.click();
  await page.waitForFunction(() => {
    const player = document.querySelector('audio[aria-label="Recording A"]');
    return player && !player.paused;
  });
  assert.equal(
    await page
      .getByRole("button", { name: /^Pause.*Recording A/ })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: /^Play.*Recording B/ }).click();
  await page.waitForFunction(() => {
    const a = document.querySelector('audio[aria-label="Recording A"]'),
      b = document.querySelector('audio[aria-label="Recording B"]');
    return a?.paused && b && !b.paused;
  });
  await page.screenshot({ path: `${out}/sound-desktop.png` });
  report.checks.push(
    "Real local audio playback, pressed state and mutually exclusive A/B playback",
  );
  await ctx.close();
  for (const width of [320, 768, 1024]) {
    const { ctx, page } = await context("en", width);
    await ctx.addInitScript(
      (vehicle) =>
        localStorage.setItem("capcar.vehicles.v1", JSON.stringify([vehicle])),
      car,
    );
    await page.route("**/api/copilot/chat", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          answer: "Browser fixture: check the maintenance record first.",
          provider: "CapCar rules",
          source: "deterministic",
          evidence: ["Fixture vehicle"],
          warnings: ["Confirm specifications"],
          nextActions: [],
        }),
      }),
    );
    await page.goto(`${base}/garage/${car.id}/copilot`, {
      waitUntil: "networkidle",
    });
    const field = page.getByRole("textbox", { name: "Ask CapCar" });
    await field.fill("What should I maintain first?");
    await field.press("Enter");
    await page
      .getByText("Browser fixture: check the maintenance record first.", {
        exact: true,
      })
      .waitFor();
    await page.screenshot({ path: `${out}/conversation-${width}.png` });
    await checkOverflow(page, `copilot-${width}`);
    await page.goto(`${base}/sound-studio`, { waitUntil: "networkidle" });
    await checkOverflow(page, `sound-${width}`);
    await page.screenshot({ path: `${out}/sound-${width}.png` });
    await page.goto(`${base}/ai`, { waitUntil: "networkidle" });
    assert.equal(new URL(page.url()).pathname, "/login");
    assert.equal(new URL(page.url()).searchParams.get("next"), "/ai");
    await checkOverflow(page, `trip-${width}`);
    report.checks.push(
      `Conversation send, composer, sound layout and preserved trip login intent: ${width}px`,
    );
    await ctx.close();
  }
  const normal = await context("en", 1440, "no-preference");
  await normal.page.goto(base, { waitUntil: "networkidle" });
  await normal.page
    .getByRole("button", { name: "Explore", exact: true })
    .hover();
  await normal.page
    .getByRole("region", { name: "Explore", exact: true })
    .waitFor();
  await normal.page.screenshot({ path: `${out}/navbar-motion.png` });
  report.checks.push(
    "Pointer-hover expansion with motion enabled; other browser cases use reduced motion",
  );
  await normal.ctx.close();
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report));
} catch (error) {
  report.errors.push(error.stack ?? String(error));
  process.exitCode = 1;
  console.error(error);
} finally {
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  await writeFile(`${out}/app.log`, log);
  await Promise.race([
    browser.close(),
    new Promise((done) => setTimeout(done, 5000)),
  ]);
  if (process.platform === "win32")
    spawnSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
      windowsHide: true,
    });
  else app.kill("SIGTERM");
}
process.exit(process.exitCode ?? 0);
