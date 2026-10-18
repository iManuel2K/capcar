import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.MOVIE_URL ?? "http://localhost:3104";
await mkdir("artifacts/movie-cars", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
});
try {
  const page = await context.newPage();
  const errors = [];
  const imageFailures = [];
  const earlyHeavyRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      /i\.ytimg\.com|images\.contentstack\.io/.test(response.url())
    )
      imageFailures.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (
      request.url().endsWith(".glb") ||
      request.url().includes("static.sketchfab.com")
    )
      earlyHeavyRequests.push(request.url());
  });
  await page.goto(`${base}/movie-cars`, { waitUntil: "networkidle" });
  const names = [
    "Brian’s R34 · 2 Fast 2 Furious",
    "DeLorean Time Machine · Back to the Future",
    "KITT · Knight Rider",
  ];
  const clips = ["NVH__HVdLhU", "zzHoWtI30NM", "KH24SrIMdgo"];
  const report = [];
  const gallery = page.getByRole("region", {
    name: "Movie and design reference collection",
  });
  // The accessible name is translated by the app; use the unique clip link if
  // a locale or copy update changes that label.
  const collection = (await gallery.count())
    ? gallery
    : page
        .locator("section")
        .filter({
          has: page.getByRole("link", { name: "Watch original scene" }),
        })
        .first();
  for (const [index, name] of names.entries()) {
    await page.getByRole("button", { name, exact: true }).click();
    const images = page.locator("img[data-screen-image]");
    await images.evaluateAll((items) =>
      Promise.all(items.map((image) => image.decode())),
    );
    if ((await images.count()) !== 4)
      throw new Error("Missingfilm/showpreview");
    const source = await page
      .getByRole("link", { name: "Watch original scene", exact: true })
      .getAttribute("href");
    if (source !== `https://www.youtube.com/watch?v=${clips[index]}`)
      throw new Error("Incorrectsceneattribution");
    if (await page.locator("iframe").count())
      throw new Error("Viewerloadedwithoutconsent");
    await collection.screenshot({
      path: `artifacts/movie-cars/${index + 1}-desktop.png`,
    });
    report.push({ car: name, originalClip: source, images: "decoded" });
  }
  if (earlyHeavyRequests.length)
    throw new Error("Heavy3Dresourcesloadedbeforeinteraction");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.activeElement?.blur();
  });
  await page.screenshot({
    path: "artifacts/movie-cars/mobile.png",
    fullPage: true,
  });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Mobilehorizontaloverflow");
  await page
    .getByRole("button", { name: "Explore 3D reference", exact: true })
    .click();
  await page.getByRole("heading", { name: "A closer look in 3D" }).waitFor();
  if (await page.locator("iframe").count())
    throw new Error("Modelstartedbeforeloadgesture");
  await page.getByRole("button", { name: names[0], exact: true }).click();
  if (await page.getByRole("heading", { name: "A closer look in 3D" }).count())
    throw new Error("Oldworkspacewasnotclosed");
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.activeElement?.blur();
  });
  await page.screenshot({
    path: "artifacts/movie-cars/page-desktop.png",
    fullPage: true,
  });
  await writeFile(
    "artifacts/movie-cars/report.json",
    JSON.stringify(
      {
        report,
        imageFailures,
        errors,
        mobile: "pass",
        initialHeavyRequests: earlyHeavyRequests.length,
      },
      null,
      2,
    ),
  );
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    "PASS:3screenpreviews,sourceattribution,mobile,consentandworkspacecleanup",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  const timeout = setTimeout(() => process.exit(process.exitCode ?? 0), 5000);
  timeout.unref();
  await context.close();
  await browser.close();
  clearTimeout(timeout);
}
