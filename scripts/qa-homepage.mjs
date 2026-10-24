// Rendered homepage QA against a local build. No production writes or accounts.
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.HOMEPAGE_QA_URL ?? "http://localhost:3116";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.HOMEPAGE_QA_BROWSER_CHANNEL
    ? { channel: process.env.HOMEPAGE_QA_BROWSER_CHANNEL }
    : {}),
});
const report = { checks: [], errors: [], layouts: [], resources: [] };
let failed = false;
await mkdir("artifacts/homepage", { recursive: true });
try {
  for (const [locale, width, height] of [
    ["en", 1440, 1000],
    ["en", 390, 844],
    ["en", 320, 568],
    ["en", 768, 1100],
    ["en", 1024, 1100],
    ["de", 390, 844],
    ["el", 390, 844],
    ["sq", 390, 844],
    ["ja", 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
      isMobile: width <= 390,
      hasTouch: width <= 390,
      locale: "en-GB",
    });
    await context.addCookies([
      { name: "capcar_locale", value: locale, url: base },
    ]);
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto(`${base}${locale === "en" ? "/" : `/${locale}`}`, {
      waitUntil: "networkidle",
    });
    const h1 = page.getByRole("heading", { level: 1 });
    assert.equal(await h1.count(), 1);
    const actions = page.getByTestId("hero-actions");
    const primary = actions.locator('a[href="/garage/new"]');
    const rect = await primary.boundingBox();
    assert.ok(
      rect && rect.height >= 48,
      `${locale}/${width}: primary CTA has a touch-sized target`,
    );
    if (height >= 844) {
      assert.ok(
        rect.y + rect.height <= height,
        `${locale}/${width}: primary CTA above fold`,
      );
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `${locale}/${width}: no horizontal overflow`,
    );
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
    assert.ok(
      await page.locator('meta[name="description"]').getAttribute("content"),
    );
    assert.equal(
      await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .some((e) =>
            /posthog|sketchfab|\.mp3|\.glb|tile\.openstreetmap/.test(e.name),
          ),
      ),
      false,
      "No unsolicited analytics, models, audio or map tiles on initial load",
    );
    if (width === 1440)
      report.resources = await page.evaluate(() =>
        performance.getEntriesByType("resource").map((e) => ({
          name: e.name.replace(location.origin, ""),
          bytes: e.transferSize,
        })),
      );
    await page.screenshot({
      path: `artifacts/homepage/${locale}-${width}-hero.png`,
    });
    report.layouts.push({
      locale,
      width,
      height,
      heading: await h1.innerText(),
      primaryBottom: Math.round(rect.y + rect.height),
    });
    if (locale === "en" && width === 1440) {
      const before = await page.evaluate(() =>
        Object.fromEntries(
          Object.entries(localStorage).filter(([key]) =>
            /^capcar\.(vehicles|builds|expenses|history|passport|onboarding)\./.test(
              key,
            ),
          ),
        ),
      );
      await actions.locator('a[href="#live-demo"]').click();
      await page
        .getByRole("tab", { name: "Parts comparison", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Add to the example plan", exact: true })
        .click();
      await page
        .getByRole("tab", { name: "Vehicle Passport", exact: true })
        .click();
      await page
        .getByText("Replace the cabin filter · €30", { exact: true })
        .waitFor();
      assert.equal(await page.getByText("€270", { exact: true }).count(), 1);
      assert.deepEqual(
        await page.evaluate(() =>
          Object.fromEntries(
            Object.entries(localStorage).filter(([key]) =>
              /^capcar\.(vehicles|builds|expenses|history|passport|onboarding)\./.test(
                key,
              ),
            ),
          ),
        ),
        before,
        "Demo never writes real garage data",
      );
      await page.screenshot({ path: "artifacts/homepage/desktop-demo.png" });
      await page
        .getByRole("button", { name: "Reset example", exact: true })
        .click();
      await page.getByRole("tab", { name: "Build plan", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("tab", { name: "Parts comparison", exact: true })
          .getAttribute("aria-selected"),
        "true",
      );
      const links = await page
        .locator("main a[href]")
        .evaluateAll((nodes) => [
          ...new Set(nodes.map((node) => node.getAttribute("href"))),
        ]);
      for (const href of links) {
        if (href.startsWith("#")) {
          assert.ok(await page.locator(href).count(), `Anchor ${href} exists`);
          continue;
        }
        if (!href.startsWith("/")) continue;
        const response = await context.request.get(`${base}${href}`);
        assert.ok(
          response.status() < 400,
          `Working link ${href}: ${response.status()}`,
        );
      }
      report.checks.push(
        "Demo local-only budget changes, keyboard tabs, reset, all homepage links and anchors",
      );
    }
    if (locale === "en" && width === 390) {
      await page.locator("#platform").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: "artifacts/homepage/mobile-maintenance.png",
      });
      await page.locator("#projects").scrollIntoViewIfNeeded();
      await page.screenshot({ path: "artifacts/homepage/mobile-story.png" });
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await page.getByRole("dialog").waitFor();
      for (let index = 0; index < 12; index++) {
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .getByRole("dialog")
            .evaluate((dialog) => dialog.contains(document.activeElement)),
          true,
          "Focus stays inside mobile navigation",
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
      report.checks.push(
        "Mobile navigation opens, traps focus and dismisses with Escape",
      );
    }
    // Stable server markup keeps downstream anchors from moving during mounting.
    assert.ok(await page.locator("#live-demo [role=tabpanel]").count());
    const order = await page
      .locator("#live-demo")
      .evaluate(
        (demo) =>
          !!(
            demo.compareDocumentPosition(document.getElementById("platform")) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
      );
    assert.equal(order, true, "Demo precedes the long-form use cases");
    if (width < 1280) {
      await page
        .locator('button[aria-controls="mobile-marketing-navigation"]')
        .click();
      const actionRect = await page
        .locator('dialog a[href="/garage/new"]')
        .boundingBox();
      assert.ok(
        actionRect && actionRect.y + actionRect.height < Math.min(height, 300),
        `${locale}/${width}: drawer CTA visible without scrolling`,
      );
      await page.keyboard.press("Escape");
    }
    if (width >= 1280) {
      await page.locator('header a[href$="#projects"]').click();
    } else {
      await page
        .locator('button[aria-controls="mobile-marketing-navigation"]')
        .click();
      await page.locator('dialog a[href$="#projects"]').click();
    }
    await page.waitForFunction(
      () => {
        const top = document
          .getElementById("projects")
          .getBoundingClientRect().top;
        return top >= 80 && top <= 112;
      },
      undefined,
      { timeout: 8000 },
    );
    report.checks.push(
      `${locale}/${width}: stable project anchor and early demo`,
    );
    await page.locator("#live-demo").scrollIntoViewIfNeeded();
    await page.getByRole("tab").first().waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `${locale}/${width}: loaded example has no viewport overflow`,
    );
    await context.close();
  }
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(base);
  assert.match(
    await page.getByRole("heading", { level: 1 }).innerText(),
    /See the build/,
  );
  assert.ok(
    await page
      .getByTestId("hero-actions")
      .locator('a[href="/garage/new"]')
      .isVisible(),
  );
  report.checks.push(
    "Hero, use cases and useful links render without JavaScript",
  );
  await context.close();
  assert.deepEqual(report.errors, []);
  report.checks.push(
    "Five languages, desktop and narrow mobile layouts, reduced motion, canonical metadata and deferred heavy assets",
  );
} catch (error) {
  failed = true;
  report.errors.push(error.stack ?? String(error));
} finally {
  await writeFile(
    "artifacts/homepage/report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        ...report,
        resources: `${report.resources.length} initial resources recorded`,
      },
      null,
      2,
    ),
  );
  await Promise.race([
    browser.close(),
    new Promise((done) => setTimeout(done, 5000)),
  ]);
  process.exit(failed ? 1 : 0);
}
