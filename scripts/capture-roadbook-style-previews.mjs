// Capture the app's actual vector basemaps, not tinted raster substitutes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.ROADBOOK_PREVIEW_URL ?? "http://localhost:3127";
const modes = [
  "konstanz",
  "reykjavik",
  "lissabon",
  "wien",
  "zurich",
  "venedig",
  "kyoto",
  "marrakesch",
  "tokyo",
];
const output = "public/previews/roadbook-styles";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = [];
try {
  await mkdir(output, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() =>
    localStorage.setItem("capcar.analytics-consent.v1", "denied"),
  );
  await context.route(/https:\/\/[^/]*supabase\.co\//, (route) =>
    route.abort(),
  );
  const page = await context.newPage();
  for (const mode of modes) {
    await page.goto(`${base}/roadbook?style=${mode}`, {
      waitUntil: "domcontentloaded",
    });
    const map = page.locator(
      `.roadbook-map-shell[data-roadbook-style="${mode}"].is-vector-ready`,
    );
    await map.waitFor({ timeout: 60000 });
    await page.addStyleTag({
      content:
        ".roadbook-map-shell ~ *, nextjs-portal { visibility: hidden !important; } .leaflet-control-zoom, .roadbook-leaflet-map::after { display: none !important; }",
    });
    await map.evaluate((el) => {
      el.parentElement.style.height = "600px";
      el.parentElement.style.width = "1200px";
      el.parentElement.style.minHeight = "0";
      window.dispatchEvent(new Event("resize"));
    });
    await map.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    assert.equal(Math.round((await map.boundingBox()).width), 1200);
    assert.equal(Math.round((await map.boundingBox()).height), 600);
    assert(
      (await map.locator("canvas.leaflet-tile").count()) > 0,
      "Real vector canvas tiles must be present",
    );
    await map.screenshot({
      path: `${output}/${mode}.jpg`,
      type: "jpeg",
      quality: 78,
    });
    report.push({
      mode,
      source: "CapCar Roadbook vector renderer",
      viewport: [1200, 600],
      center: [50.1, 10.4],
      zoom: 4,
      attribution: "OpenStreetMap / OpenFreeMap / OpenMapTiles",
    });
    console.log(`Captured ${mode}`);
  }
  await writeFile(
    `${output}/provenance.json`,
    JSON.stringify(
      { captured: new Date().toISOString(), previews: report },
      null,
      2,
    ),
  );
} finally {
  await Promise.race([
    browser.close(),
    new Promise((done) => setTimeout(done, 5000)),
  ]);
}
process.exit(0);
