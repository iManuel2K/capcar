import { createRequire } from "node:module";
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = process.env.PLAYWRIGHT_MODULE
  ? require(process.env.PLAYWRIGHT_MODULE)
  : require("playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const directory = resolve("artifacts/sound-studio");
await mkdir(directory, { recursive: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto("http://localhost:3100/sound-studio", {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: "Hear your next move." }).waitFor();
  const initial = await page.locator("audio").evaluateAll((elements) =>
    elements.map((audio) => ({
      src: audio.getAttribute("src"),
      preload: audio.preload,
      readyState: audio.readyState,
      paused: audio.paused,
    })),
  );
  if (initial.some((item) => item.preload !== "none" || !item.paused))
    throw new Error("Audio loaded eagerly or autoplayed");
  await page.screenshot({
    path: resolve(directory, "desktop.png"),
    fullPage: true,
  });
  await page.getByRole("searchbox").fill("Maserati");
  await page
    .getByRole("button", { name: /Maserati GranTurismo S.*Road/ })
    .click();
  await page.getByRole("button", { name: "Compare as B", exact: true }).click();
  await page.getByRole("button", { name: "Listen to B", exact: true }).click();
  await page.waitForFunction(
    () =>
      !document.querySelector('audio[aria-label="Recording B"]').paused &&
      document.querySelector('audio[aria-label="Recording B"]').currentTime > 0,
  );
  await page.getByRole("button", { name: "Listen to A", exact: true }).click();
  await page.waitForFunction(
    () =>
      !document.querySelector('audio[aria-label="Recording A"]').paused &&
      document.querySelector('audio[aria-label="Recording B"]').paused,
  );
  await page.getByRole("button", { name: "Pause both" }).click();
  await page
    .getByLabel("Stock recording", { exact: true })
    .setInputFiles(resolve("public/sounds/honda-f20c.mp3"));
  if (
    !(
      await page.getByLabel("Recording A", { exact: true }).getAttribute("src")
    ).startsWith("blob:")
  )
    throw new Error("Local comparison did not use a private object URL");
  await page.getByRole("button", { name: "Share comparison" }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  if (
    !link.includes("a=personal") ||
    !link.includes("b=maserati-granturismo-s-exhaust") ||
    link.includes("blob:")
  )
    throw new Error("Share-link privacy regression");
  await page.goto(link, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Listen to A" }).waitFor();
  if (!(await page.getByRole("button", { name: "Listen to A" }).isDisabled()))
    throw new Error(
      "Private side was incorrectly replaced in shared comparison",
    );
  await page.goto("http://localhost:3100/sound-studio", {
    waitUntil: "networkidle",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Mobile horizontal overflow");
  await page.screenshot({
    path: resolve(directory, "mobile.png"),
    fullPage: true,
  });
  await page.locator("#listen").scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(directory, "mobile-library.png") });
  // Decode every shipped MP3 in the browser, not only its filename or header.
  const names = (await readdir("public/sounds")).filter((name) =>
    name.endsWith(".mp3"),
  );
  const decoded = await page.evaluate(async (names) => {
    const audio = new AudioContext();
    const failures = [];
    for (const name of names) {
      try {
        const response = await fetch(`/sounds/${name}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const decoded = await audio.decodeAudioData(
          await response.arrayBuffer(),
        );
        if (!decoded.duration) throw new Error("Empty");
      } catch (error) {
        failures.push(`${name}: ${error.message}`);
      }
    }
    await audio.close();
    return { count: names.length, failures };
  }, names);
  console.log(
    JSON.stringify(
      { initial, decoded, errors, shareLink: link, screenshots: directory },
      null,
      2,
    ),
  );
  if (errors.length || decoded.failures.length)
    throw new Error("Browser verification failed");
} catch (error) {
  process.exitCode = 1;
  throw error;
} finally {
  // Some Windows browser builds leave their debugging pipe open on shutdown.
  const shutdown = setTimeout(() => process.exit(process.exitCode ?? 0), 5000);
  shutdown.unref();
  await context.close();
  await browser.close();
  clearTimeout(shutdown);
}
