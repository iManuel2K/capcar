// Isolated E2E harness. Auth and snapshots use a disposable local Supabase API
// double, never real accounts or production data. Run with GARAGE_QA_START=1.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const port = Number(process.env.GARAGE_QA_PORT ?? 3110);
const authPort = 54329;
const base = `http://localhost:${port}`;
const snapshots = new Map();
const users = new Map();
const requests = [];
function user(email) {
  if (!users.has(email))
    users.set(email, {
      id: `00000000-0000-4000-8000-${String(users.size + 1).padStart(12, "0")}`,
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
    });
  return users.get(email);
}
function session(owner) {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: owner.id, aud: "authenticated", exp: expires, iat: expires - 3600, role: "authenticated", email: owner.email })).toString("base64url")}.local-test-only`;
  return {
    access_token: jwt,
    refresh_token: "local-refresh",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expires,
    user: owner,
  };
}
function authUser(request) {
  try {
    const payload = JSON.parse(
      Buffer.from(
        (request.headers.authorization ?? "").split(".")[1],
        "base64url",
      ),
    );
    return [...users.values()].find((entry) => entry.id === payload.sub);
  } catch {
    return undefined;
  }
}
const api = createServer(async (request, response) => {
  const origin = request.headers.origin ?? base;
  response.setHeader("access-control-allow-origin", origin);
  response.setHeader("access-control-allow-headers", "*");
  response.setHeader(
    "access-control-allow-methods",
    "GET,POST,OPTIONS,DELETE,PATCH",
  );
  response.setHeader("content-type", "application/json");
  if (request.method === "OPTIONS") {
    response.end();
    return;
  }
  let body = "";
  for await (const chunk of request) body += chunk;
  const url = new URL(request.url, `http://127.0.0.1:${authPort}`);
  requests.push({ path: url.pathname, method: request.method });
  if (url.pathname === "/auth/v1/signup" || url.pathname === "/auth/v1/token") {
    const input = JSON.parse(body || "{}");
    const owner = user(input.email);
    response.end(
      JSON.stringify(
        url.pathname.endsWith("signup") && input.email.startsWith("confirm@")
          ? { user: owner }
          : session(owner),
      ),
    );
    return;
  }
  const owner = authUser(request);
  if (url.pathname === "/auth/v1/user") {
    if (!owner) response.statusCode = 401;
    response.end(
      JSON.stringify(owner ?? { message: "No session", code: "bad_jwt" }),
    );
    return;
  }
  if (url.pathname === "/rest/v1/garage_snapshots") {
    if (!owner) {
      response.statusCode = 401;
      response.end("{}");
      return;
    }
    if (request.method === "POST") {
      const input = JSON.parse(body);
      assert.equal(input.user_id, owner.id);
      snapshots.set(owner.id, input);
      response.statusCode = 201;
      response.end();
      return;
    }
    const row = snapshots.get(owner.id);
    response.end(JSON.stringify(row ? [row] : []));
    return;
  }
  if (url.pathname === "/auth/v1/logout") {
    response.end("{}");
    return;
  }
  response.end("[]");
});
await new Promise((done) => api.listen(authPort, "127.0.0.1", done));
let app;
let log = "";
if (process.env.GARAGE_QA_START === "1") {
  app = spawn(
    process.execPath,
    [resolve("node_modules/next/dist/bin/next"), "dev", "--port", String(port)],
    {
      windowsHide: true,
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${authPort}`,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-test-publishable-key",
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "",
        NEXT_PUBLIC_POSTHOG_HOST: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  app.stdout.on("data", (chunk) => {
    log += chunk;
  });
  app.stderr.on("data", (chunk) => {
    log += chunk;
  });
}
await mkdir("artifacts/garage-journey", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = {
  auth: "Disposable local API double; not live email delivery or production RLS",
  checks: [],
  errors: [],
};
let failed = false;
async function context(mobile = false, locale = "en") {
  const ctx = await browser.newContext({
    viewport: mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1080 },
    locale: "en-GB",
    bypassCSP: true,
  });
  await ctx.addCookies([{ name: "capcar_locale", value: locale, url: base }]);
  const page = await ctx.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  return { ctx, page };
}
async function ready() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(`${base}/garage/new`);
      if (response.ok) return;
    } catch {
      /* Starting. */
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error("App did not start\n" + log.slice(-3000));
}
async function selectCar(page, goal, manual = false) {
  await page.goto(`${base}/garage/new`);
  await page
    .getByRole("heading", { name: "Start with your car.", exact: true })
    .waitFor();
  if (manual) {
    await page.getByLabel("Make", { exact: true }).fill("Other");
    await page.getByLabel("Model", { exact: true }).fill("Custom");
  } else await page.getByRole("button", { name: /BMW 318i/ }).click();
  await page.getByLabel("Production year", { exact: true }).fill("2011");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: new RegExp(
        goal === "maintain"
          ? "Maintain my car"
          : goal === "modify"
            ? "Modify my car"
            : "Plan drives",
      ),
    })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel(
      goal === "maintain"
        ? "Maintenance task"
        : goal === "modify"
          ? "Planned modification"
          : "Drive idea",
      { exact: true },
    )
    .fill(goal === "drives" ? "A quiet Sunday road" : "My first useful task");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function authenticate(page, email, register = true) {
  if (register)
    await page
      .getByRole("link", { name: "Create account and save", exact: true })
      .click();
  else await page.goto(`${base}/login?next=${encodeURIComponent("/garage")}`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("local-test-password-123");
  if (register) {
    await page.getByLabel("Name", { exact: true }).fill("Local test owner");
    await page
      .getByLabel("Confirm password", { exact: true })
      .fill("local-test-password-123");
    const boxes = page.locator('form input[type="checkbox"]');
    for (const checkbox of await boxes.all()) await checkbox.check();
  }
  await page
    .getByRole("button", {
      name: register ? "Create account" : "Sign in",
      exact: true,
    })
    .click();
  await page.waitForURL(register ? /\/garage\/new/ : /\/garage$/);
}
async function noOverflow(page) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal viewport overflow",
  );
}
try {
  await ready();
  for (const goal of ["maintain", "modify", "drives"]) {
    console.log("Testing", goal);
    const { ctx, page } = await context(goal === "maintain");
    await selectCar(page, goal, goal === "modify");
    if (goal === "maintain") {
      await page.reload();
      await page
        .getByRole("heading", { name: "Your direction is ready.", exact: true })
        .waitFor();
      await page.screenshot({
        path: "artifacts/garage-journey/mobile-review.png",
        fullPage: true,
      });
    }
    await authenticate(page, `${goal}@local.test`);
    await page
      .getByRole("button", { name: "Save my garage", exact: true })
      .click();
    await page
      .getByRole("heading", {
        name: "Saved to your private garage.",
        exact: true,
      })
      .waitFor();
    const state = await page.evaluate(() => ({
      vehicles: JSON.parse(localStorage.getItem("capcar.vehicles.v1") ?? "[]"),
      builds: JSON.parse(
        localStorage.getItem("capcar.builds.v1") ?? '{"builds":[],"items":[]}',
      ),
      onboarding: JSON.parse(
        localStorage.getItem("capcar.onboarding.v1") ?? "[]",
      ),
    }));
    assert.equal(state.vehicles.length, 1);
    assert.equal(state.vehicles[0].garageGoal, goal);
    assert.ok(state.onboarding[0].activatedAt);
    assert.equal(state.builds.items.length, goal === "drives" ? 0 : 1);
    await page
      .getByRole("link", { name: "Open my garage", exact: true })
      .click();
    if (goal === "maintain") {
      await page
        .getByRole("button", { name: "Complete task", exact: true })
        .click();
      await page
        .getByLabel("Actual total cost (EUR, optional)", { exact: true })
        .fill("125.50");
      await page
        .getByLabel("Private note (optional)", { exact: true })
        .fill("PRIVATE-NOTE-NEVER-SHARE");
      // A generated tiny fixture exercises real bitmap decode and EXIF-free JPEG
      // re-encoding without uploading any actual owner's photo.
      const png = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 40;
        canvas.height = 30;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#d6aa92";
        ctx.fillRect(0, 0, 40, 30);
        return canvas.toDataURL("image/png").split(",")[1];
      });
      for (const label of ["Before photo", "After photo"])
        await page.getByLabel(label, { exact: true }).setInputFiles({
          name: "local-fixture.png",
          mimeType: "image/png",
          buffer: Buffer.from(png, "base64"),
        });
      await page
        .getByRole("button", { name: "Save completion", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Edit completion", exact: true })
        .waitFor();
      await noOverflow(page);
      await page.screenshot({
        path: "artifacts/garage-journey/mobile-story.png",
        fullPage: true,
      });
      const count = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("capcar.builds.v1")).items.filter(
            (item) => item.status === "installed",
          ).length,
      );
      assert.equal(count, 1);
      await page
        .getByRole("button", { name: "Create progress card", exact: true })
        .click();
      await page
        .getByRole("link", { name: "Download card", exact: true })
        .waitFor();
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("link", { name: "Download card", exact: true }).click(),
      ]);
      await download.saveAs("artifacts/garage-journey/progress-card.png");
      await page
        .getByRole("button", { name: "Reopen / undo completion", exact: true })
        .click();
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("capcar.builds.v1")).items.filter(
              (item) => item.status === "installed",
            ).length,
        ),
        0,
      );
      await page
        .getByRole("button", { name: "Complete task", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Save completion", exact: true })
        .click();
      await page
        .getByRole("link", { name: "View vehicle timeline", exact: true })
        .click();
      await page
        .getByText("PRIVATE-NOTE-NEVER-SHARE", { exact: true })
        .waitFor();
      assert.equal(
        await page.getByAltText("Before photo", { exact: true }).count(),
        1,
      );
      await noOverflow(page);
      report.checks.push(
        "completion, correction, reopening, re-completion, before/after photos, timeline and PNG export on 390px mobile",
      );
    }
    await page.waitForTimeout(1200);
    report.checks.push(
      `new account: ${goal}, interrupted draft preserved through real auth UI and snapshot sync`,
    );
    await ctx.close();
  }
  const { ctx, page } = await context();
  await authenticate(page, "maintain@local.test", false);
  await page
    .getByRole("heading", { name: "Maintain my car", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("capcar.vehicles.v1")).length,
    ),
    1,
  );
  await page.goto(`${base}/garage/new`);
  await page
    .getByRole("button", { name: "Explore example garage", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Example garage · Project 318", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("capcar.vehicles.v1")).length,
    ),
    1,
  );
  await page
    .getByRole("button", { name: "Back to my setup", exact: true })
    .click();
  const vehicleId = await page.evaluate(
    () => JSON.parse(localStorage.getItem("capcar.vehicles.v1"))[0].id,
  );
  await page
    .getByLabel(/Use a car already in my garage/)
    .selectOption(vehicleId);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await page
    .getByRole("button", { name: "Save my garage", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("capcar.vehicles.v1")).length,
    ),
    1,
  );
  report.checks.push(
    "existing account restores cloud vehicle, can reuse it, skip optional steps and explore example without adding sample data",
  );
  await ctx.clearCookies();
  await authenticate(page, "separate@local.test", false);
  await page
    .getByRole("heading", { name: "Start with the car you know.", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("capcar.vehicles.v1") ?? "[]").length,
    ),
    0,
  );
  report.checks.push(
    "switching to another account does not import the previous account's vehicles",
  );
  await ctx.close();
  const confirmation = await context(true);
  await selectCar(confirmation.page, "modify");
  await confirmation.page
    .getByRole("link", { name: "Create account and save", exact: true })
    .click();
  await confirmation.page.waitForURL(/\/register\?/);
  const returnPath = new URL(confirmation.page.url()).searchParams.get("next");
  assert.match(returnPath, /resume=/);
  await confirmation.page
    .getByLabel("Email", { exact: true })
    .fill("confirm@local.test");
  await confirmation.page
    .getByLabel("Name", { exact: true })
    .fill("Confirmation test");
  await confirmation.page
    .getByLabel("Password", { exact: true })
    .fill("local-test-password-123");
  await confirmation.page
    .getByLabel("Confirm password", { exact: true })
    .fill("local-test-password-123");
  for (const checkbox of await confirmation.page
    .locator('form input[type="checkbox"]')
    .all())
    await checkbox.check();
  await confirmation.page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await confirmation.page
    .getByText("Account created. Check your email to confirm it.", {
      exact: true,
    })
    .waitFor();
  const newTab = await confirmation.ctx.newPage();
  await newTab.goto(`${base}/login?next=${encodeURIComponent(returnPath)}`);
  await newTab.getByLabel("Email", { exact: true }).fill("confirm@local.test");
  await newTab
    .getByLabel("Password", { exact: true })
    .fill("local-test-password-123");
  await newTab.getByRole("button", { name: "Sign in", exact: true }).click();
  await newTab
    .getByRole("button", { name: "Save my garage", exact: true })
    .waitFor();
  await newTab.getByText("My first useful task", { exact: true }).waitFor();
  await newTab
    .getByRole("button", { name: "Save my garage", exact: true })
    .click();
  await newTab
    .getByRole("heading", {
      name: "Saved to your private garage.",
      exact: true,
    })
    .waitFor();
  report.checks.push(
    "a confirmation-style pause and sign-in in another tab restores the exact private draft",
  );
  await confirmation.ctx.close();
  for (const [locale, heading] of [
    ["de", "Starte mit deinem Auto."],
    ["el", "Ξεκίνα με το αυτοκίνητό σου."],
    ["sq", "Fillo me makinën tënde."],
    ["ja", "愛車から始めよう。"],
  ]) {
    const { ctx, page } = await context(true, locale);
    await page.goto(`${base}/garage/new`);
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    await noOverflow(page);
    await ctx.close();
  }
  report.checks.push(
    "all five languages render, mobile has no horizontal overflow",
  );
  assert.deepEqual(report.errors, []);
  report.snapshotAccounts = snapshots.size;
  report.apiRequests = requests.length;
  await writeFile(
    "artifacts/garage-journey/report.json",
    JSON.stringify(report, null, 2),
  );
  console.log("PASS", JSON.stringify(report));
} catch (error) {
  failed = true;
  console.error(error);
  await writeFile(
    "artifacts/garage-journey/failure.json",
    JSON.stringify({ error: String(error), report }, null, 2),
  );
  throw error;
} finally {
  const closing = browser.close();
  api.closeAllConnections();
  api.close();
  if (app) {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    else app.kill();
  }
  await writeFile("artifacts/garage-journey/app.log", log);
  await Promise.race([closing, new Promise((done) => setTimeout(done, 5000))]);
  // Some Windows browser-driver versions retain an IPC handle after close.
  // This standalone harness has already closed its API, app and browser above.
  if (process.env.GARAGE_QA_START === "1") process.exit(failed ? 1 : 0);
}
