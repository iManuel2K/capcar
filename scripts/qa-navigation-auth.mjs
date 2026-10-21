// Local browser fixtures only: never signs in to or changes a real account.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = "http://localhost:3121";
const app = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "dev", "--port", "3121"],
  {
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "",
    },
  },
);
let browser;
try {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const user = {
    id: "00000000-0000-0000-0000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-10-01T00:00:00Z",
  };
  const session = {
    access_token: "local-browser-fixture",
    refresh_token: "local-browser-fixture",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  };
  const labels = {
    en: "Open garage",
    de: "Garage öffnen",
    el: "Άνοιγμα γκαράζ",
    sq: "Hap garazhin",
    ja: "ガレージを開く",
  };
  for (const [locale, label] of Object.entries(labels)) {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addCookies([
        { name: "capcar_locale", value: locale, url: base },
        {
          name: "sb-example-auth-token",
          value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
          url: base,
        },
      ]);
      await context.route("https://example.supabase.co/**", (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(user),
        }),
      );
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}${locale === "en" ? "/" : `/${locale}`}`);
      await page
        .locator("header")
        .getByRole("link", { name: label, exact: true, includeHidden: true })
        .waitFor({ state: "attached" });
      if (width < 1280)
        await page
          .locator('button[aria-controls="mobile-marketing-navigation"]')
          .click();
      const scope =
        width < 1280 ? page.locator("dialog") : page.locator("header");
      const cta = scope.getByRole("link", { name: label, exact: true });
      await cta.waitFor({ state: "visible" });
      assert.equal(await cta.getAttribute("href"), "/garage");
      assert.equal(await scope.locator('a[href="/login"]').count(), 0);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${locale} ${width}px: restored session hides Sign in; ${label} links to /garage`,
      );
      await context.close();
    }
  }
  const page = await browser.newPage();
  await page.goto(base);
  await page
    .locator("header")
    .getByRole("link", { name: "Sign in", exact: true })
    .waitFor({ state: "attached" });
  assert.equal(
    await page
      .locator("header")
      .getByRole("link", { name: "Create your garage", exact: true })
      .getAttribute("href"),
    "/garage/new",
  );
  console.log("PASS signed-out visitor keeps Sign in and Create your garage");
} catch (error) {
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
