// Isolated local-only garage fixtures. No real accounts, VINs or database writes.
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const port = Number(process.env.PROBLEM_QA_PORT ?? 3118);
const base = `http://localhost:${port}`;
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
await mkdir("artifacts/known-problems", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { checks: [], errors: [], live: [] };
let failed = false;
const car = {
  id: "qa-private-vehicle",
  make: "Mazda",
  model: "3",
  platform: "BM",
  productionYear: 2015,
  engineCode: "UNKNOWN",
  mileage: 0,
  mileageKnown: false,
  bodyStyle: "Hatchback",
  transmission: "Unknown",
  createdAt: "2026-10-20T00:00:00.000Z",
};
const fixture = {
  profile: "mazda3-bm",
  year: 2015,
  status: "available",
  source: "NHTSA",
  market: "US",
  fetchedAt: "2026-10-01T00:00:00.000Z",
  matchedModels: ["MAZDA3"],
  records: [
    {
      campaign: "16V684000",
      component: "FUEL SYSTEM",
      summary:
        "Browser-test fixture: official source wording appears here without AI rewriting.",
      consequence: "Browser-test fixture: source safety consequence.",
      remedy: "Browser-test fixture: source manufacturer remedy.",
      reportedAt: "22/09/2016",
      sourceUrl:
        "https://api.nhtsa.gov/recalls/recallsByCampaignNumber?campaignNumber=16V684000",
      parkIt: true,
      parkOutside: true,
    },
  ],
};
async function ready() {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(`${base}/garage/new`)).ok) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error("Local QA app did not start");
}
async function open(locale, width, vehicle = car, status = 200) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
  });
  await ctx.addCookies([{ name: "capcar_locale", value: locale, url: base }]);
  await ctx.addInitScript(
    (vehicle) =>
      localStorage.setItem("capcar.vehicles.v1", JSON.stringify([vehicle])),
    vehicle,
  );
  const page = await ctx.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  const queries = [];
  await page.route("**/api/problems?**", async (route) => {
    queries.push(route.request().url());
    assert.ok(!route.request().url().includes(vehicle.id));
    const params = new URL(route.request().url()).searchParams;
    const result =
      vehicle.model === "Z Proto"
        ? {
            ...fixture,
            profile: "nissan-proto",
            year: 2020,
            status: "unsupported",
            reason: "concept",
            fetchedAt: null,
            records: [],
            matchedModels: [],
          }
        : { ...fixture, year: Number(params.get("year")) };
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        status === 200 ? result : { error: "Source unavailable" },
      ),
    });
  });
  await page.goto(`${base}/garage/${vehicle.id}/known-problems`);
  await page.locator("#official-problem-title").waitFor();
  return { ctx, page, queries };
}
try {
  await ready();
  // Actual official requests: one model/year, then repeat to verify the
  // persistent source timestamp is reused. Not a bulk scan or a VIN lookup.
  const firstStart = Date.now();
  const liveResponse = await fetch(
    `${base}/api/problems?profile=mazda3-bm&year=2015`,
  );
  assert.equal(
    liveResponse.status,
    200,
    "Official source should return a valid response",
  );
  const live = await liveResponse.json();
  assert.equal(live.source, "NHTSA");
  assert.equal(live.status, "available");
  assert.ok(live.records.length > 0);
  const firstMs = Date.now() - firstStart;
  const warmStart = Date.now();
  const cached = await (
    await fetch(`${base}/api/problems?profile=mazda3-bm&year=2015`)
  ).json();
  assert.equal(cached.fetchedAt, live.fetchedAt);
  report.live.push({
    profile: live.profile,
    records: live.records.length,
    fetchedAt: live.fetchedAt,
    firstMs,
    warmMs: Date.now() - warmStart,
  });
  assert.equal(
    (
      await fetch(
        `${base}/api/problems?profile=mazda3-bm&year=2015&vin=NEVER-ACCEPT`,
      )
    ).status,
    400,
  );
  const proto = await (
    await fetch(`${base}/api/problems?profile=nissan-proto&year=2020`)
  ).json();
  assert.equal(proto.status, "unsupported");
  assert.equal(proto.fetchedAt, null);
  report.checks.push(
    "Live NHTSA Mazda3 response, stable cached retrieval timestamp, private-input rejection and truthful prototype policy",
  );
  for (const [locale, width] of [
    ["en", 1440],
    ["en", 390],
    ["en", 320],
    ["de", 390],
    ["el", 390],
    ["sq", 390],
    ["ja", 390],
  ]) {
    const { ctx, page, queries } = await open(locale, width);
    await page
      .getByRole("heading", { name: "FUEL SYSTEM", exact: true })
      .waitFor();
    const section = page.locator(
      'section[aria-labelledby="official-problem-title"]',
    );
    await section.scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `${locale}/${width}: no overflow`,
    );
    const details = section.locator("details").first();
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await details.getAttribute("open"), "");
    assert.ok(
      queries.every((query) => !/vin=|vehicleId=|qa-private/.test(query)),
    );
    if (locale === "en") {
      assert.equal(
        await page
          .getByRole("link", { name: /Open official campaign record/ })
          .getAttribute("href"),
        fixture.records[0].sourceUrl,
      );
      assert.ok(
        await page
          .getByText(/Cached results are older than six hours/)
          .isVisible(),
      );
      await page.screenshot({
        path: `artifacts/known-problems/${locale}-${width}.png`,
      });
    }
    await ctx.close();
  }
  const outage = await open("en", 390, car, 503);
  await outage.page
    .getByText(/The official source is temporarily unavailable/)
    .waitFor();
  await outage.page
    .getByText("Recurring battery trouble needs a measured diagnosis", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await outage.page.getByText(/No records were returned/).count(),
    0,
  );
  await outage.ctx.close();
  const concept = await open("en", 390, {
    ...car,
    make: "Nissan",
    model: "Z Proto",
    platform: "ZPROTO",
    productionYear: 2020,
  });
  await concept.page.getByText(/This choice is a concept\/prototype/).waitFor();
  assert.equal(await concept.page.getByText(/Source retrieved:/).count(), 0);
  await concept.page.screenshot({
    path: "artifacts/known-problems/prototype.png",
  });
  await concept.ctx.close();
  report.checks.push(
    "Desktop, 390px/320px mobile, five-language labels, keyboard details, source links, stale warnings, reviewed fallback during outage and no invented prototype faults",
  );
  assert.deepEqual(report.errors, []);
} catch (error) {
  failed = true;
  report.errors.push(error.stack ?? String(error));
} finally {
  await writeFile(
    "artifacts/known-problems/report.json",
    JSON.stringify(report, null, 2),
  );
  await writeFile("artifacts/known-problems/app.log", log);
  console.log(JSON.stringify(report, null, 2));
  const closing = browser.close();
  spawnSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
    windowsHide: true,
    stdio: "ignore",
  });
  await Promise.race([closing, new Promise((done) => setTimeout(done, 5000))]);
  process.exit(failed ? 1 : 0);
}
