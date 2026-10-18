import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const base = process.env.STUDIO_URL ?? "http://localhost:3101";
const output = resolve("artifacts/studio");
await mkdir(output, { recursive: true });
await mkdir("public/models/cars/previews", { recursive: true });
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
});
try {
  const page = await context.newPage();
  const errors = [];
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("404"))
      consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const modelRequests = [];
  page.on("request", (request) => {
    if (/\/models\/cars\/[^/]+\.glb/.test(request.url()))
      modelRequests.push(request.url());
  });
  await page.goto(`${base}/studio`, { waitUntil: "networkidle" });
  if (modelRequests.length)
    throw new Error("A 3D model downloaded without user interaction");
  const choices = await page
    .getByLabel("Car model collection", { exact: true })
    .getByRole("button")
    .allTextContents();
  if (choices.length !== 25)
    throw new Error(`Expected25cars, got${choices.length}`);
  const report = [];
  for (let index = 0; index < choices.length; index++) {
    await page
      .getByLabel("Car model collection", { exact: true })
      .getByRole("button")
      .nth(index)
      .click();
    const viewer = page.locator("section[data-model-id]");
    const id = await viewer.getAttribute("data-model-id");
    await viewer.getByRole("button", { name: "Load interactive 3D" }).click();
    await viewer
      .locator("[role=status]")
      .first()
      .filter({ hasText: "Model ready" })
      .waitFor({ timeout: 60000 });
    if ((await page.locator("canvas").count()) !== 1)
      throw new Error(`Leakedcanvasfor${id}`);
    const canvas = viewer.locator("canvas");
    const badge = viewer.getByText("Drag to rotate · 360°", { exact: true });
    await badge.evaluate((element) => {
      element.style.visibility = "hidden";
    });
    const png = await canvas.screenshot();
    const preview = await sharp(png)
      .resize({ width: 960 })
      .webp({ quality: 85 })
      .toBuffer();
    await writeFile(`public/models/cars/previews/${id}.webp`, preview);
    await writeFile(`${output}/${id}.png`, png);
    await badge.evaluate((element) => {
      element.style.visibility = "";
    });
    await viewer.getByRole("button", { name: "Front view" }).click();
    await canvas.screenshot({ path: `${output}/${id}-front.png` });
    await viewer.getByRole("button", { name: "Side view" }).click();
    await viewer.getByRole("button", { name: "Zoom in" }).click();
    await viewer.getByRole("button", { name: "Zoom out" }).click();
    report.push({ id, render: "ready", previewBytes: preview.length });
    console.log(`${index + 1}/25 ${id}: rendered`);
    await viewer.getByRole("button", { name: "Stop 3D" }).click();
    if (await page.locator("canvas").count())
      throw new Error(`Canvasnotreleasedfor${id}`);
  }
  await page
    .getByLabel("Car model collection", { exact: true })
    .getByRole("button")
    .filter({ hasText: "M3 · E30" })
    .click();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.activeElement?.blur();
  });
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw new Error("Mobilehorizontaloverflow");
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      {
        models: report,
        errors,
        consoleErrors,
        modelRequests: modelRequests.length,
        overflow,
      },
      null,
      2,
    ),
  );
  if (errors.length) throw new Error(errors.join("\n"));
  if (consoleErrors.length) throw new Error(consoleErrors.join("\n"));
  const thumbs = [];
  for (let index = 0; index < report.length; index++) {
    const png = await sharp(await readFile(`${output}/${report[index].id}.png`))
      .resize(288, 180, { fit: "contain", background: "#e2e4da" })
      .png()
      .toBuffer();
    thumbs.push({
      input: png,
      left: (index % 5) * 288,
      top: Math.floor(index / 5) * 180,
    });
  }
  await sharp({
    create: { width: 1440, height: 900, channels: 3, background: "#e2e4da" },
  })
    .composite(thumbs)
    .png()
    .toFile(`${output}/contact-sheet.png`);
  console.log(
    "PASS:25renderedmodels,nounrequesteddownloads,nohorizontaloverflow,nopageerrors",
  );
} catch (error) {
  process.exitCode = 1;
  console.error(error);
  throw error;
} finally {
  const shutdown = setTimeout(() => process.exit(process.exitCode ?? 0), 5000);
  shutdown.unref();
  await context.close();
  await browser.close();
  clearTimeout(shutdown);
}
