#!/usr/bin/env node

import { isMissingPassportResponse } from "./capcar-smoke-contract.mjs";

const baseUrl = (
  process.argv.find((argument) => argument.startsWith("http")) ??
  process.env.CAPCAR_SMOKE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");
const productionMode = process.argv.includes("--production");

let failures = 0;

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail) {
  failures += 1;
  console.error(`FAIL ${label}: ${detail}`);
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: options.redirect ?? "follow",
    headers: { "User-Agent": "Capcar release smoke test" },
  });
}

async function expectPage(path) {
  try {
    const response = await request(path);
    const body = await response.text();
    if (!response.ok) return fail(path, `HTTP ${response.status}`);
    if (!body.toLowerCase().includes("capcar")) {
      return fail(path, "response does not contain the Capcar shell");
    }
    pass(path);
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "request failed");
  }
}

console.log(`Capcar smoke test: ${baseUrl}`);

for (const path of [
  "/",
  "/roadmap",
  "/privacy",
  "/terms",
  "/imprint",
  "/parts-search?q=E90",
  "/sound-studio",
  "/marketplace",
  "/connected-parts",
  "/verified-work",
]) {
  await expectPage(path);
}

try {
  const response = await request("/");
  const policy = response.headers.get("content-security-policy");
  if (policy?.includes("frame-ancestors 'none'")) pass("security headers");
  else fail("security headers", "Content-Security-Policy is missing");
} catch (error) {
  fail(
    "security headers",
    error instanceof Error ? error.message : "request failed",
  );
}

try {
  const response = await request("/health");
  const body = await response.json();
  if (response.ok && body.status === "ok" && body.service === "capcar-web") {
    pass("/health");
  } else {
    fail("/health", `unexpected response (${response.status})`);
  }
} catch (error) {
  fail("/health", error instanceof Error ? error.message : "invalid JSON");
}

try {
  const response = await request("/api/readiness");
  const body = await response.json();
  const serialized = JSON.stringify(body);
  if (/client.secret|service.role|private.key/i.test(serialized)) {
    fail("deployment readiness", "response exposes a secret-shaped field");
  } else if (response.ok && body.ready === true && body.state === "ready") {
    pass("deployment readiness");
  } else {
    const blocked = Array.isArray(body.checks)
      ? body.checks
          .filter((check) => !check.ready)
          .map((check) => check.label)
          .join(", ")
      : "unknown checks";
    fail(
      "deployment readiness",
      `HTTP ${response.status}; blocked: ${blocked}`,
    );
  }
} catch (error) {
  fail(
    "deployment readiness",
    error instanceof Error ? error.message : "invalid JSON",
  );
}

for (const [path, contentType] of [
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "xml"],
  ["/manifest.webmanifest", "json"],
]) {
  try {
    const response = await request(path);
    const actualType = response.headers.get("content-type") ?? "";
    if (response.ok && actualType.includes(contentType)) pass(path);
    else fail(path, `HTTP ${response.status}; content-type ${actualType}`);
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "request failed");
  }
}

try {
  const response = await request("/api/providers/status");
  const body = await response.text();
  if (/service.role|api.key|secret/i.test(body)) {
    fail("provider status", "response may expose sensitive configuration");
  } else if (response.ok) {
    pass("provider status");
  } else {
    fail("provider status", `HTTP ${response.status}`);
  }
} catch (error) {
  fail(
    "provider status",
    error instanceof Error ? error.message : "request failed",
  );
}

try {
  const response = await request(
    "/passport/00000000-0000-4000-8000-000000000000",
  );
  const body = await response.text();
  if (
    isMissingPassportResponse({
      status: response.status,
      body,
      robotsHeader: response.headers.get("x-robots-tag"),
    })
  ) {
    pass("missing public Passport");
  } else
    fail(
      "missing public Passport",
      `expected a protected not-found response, received HTTP ${response.status}`,
    );
} catch (error) {
  fail(
    "missing public Passport",
    error instanceof Error ? error.message : "request failed",
  );
}

if (productionMode) {
  try {
    const response = await request("/garage", { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    if (
      [302, 303, 307, 308].includes(response.status) &&
      location.includes("/login")
    ) {
      pass("protected garage redirect");
    } else {
      fail(
        "protected garage redirect",
        `expected a login redirect, received ${response.status} ${location}`,
      );
    }
  } catch (error) {
    fail(
      "protected garage redirect",
      error instanceof Error ? error.message : "request failed",
    );
  }
}

if (failures > 0) {
  console.error(`Smoke test failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log("All Capcar smoke checks passed.");
