const environment = process.env;
const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_LEGAL_OPERATOR",
  "NEXT_PUBLIC_LEGAL_ADDRESS",
  "NEXT_PUBLIC_PRIVACY_CONTACT",
];

const failures = [];
const missing = required.filter((key) => !environment[key]?.trim());
if (missing.length) failures.push(`Missing: ${missing.join(", ")}`);

const production =
  environment.NEXT_PUBLIC_DEPLOYMENT_ENV === "production" ||
  environment.CONTEXT === "production" ||
  environment.VERCEL_ENV === "production";
if (!production) {
  failures.push(
    "Production context is not selected. Set NEXT_PUBLIC_DEPLOYMENT_ENV=production on the live deployment.",
  );
}

for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
  const value = environment[key]?.trim();
  if (value && !isHttpsUrl(value)) failures.push(`${key} must use HTTPS.`);
}

const publicSecrets = Object.keys(environment).filter(
  (key) =>
    key.startsWith("NEXT_PUBLIC_") &&
    /(secret|service.?role|private.?key|cert.?id)/i.test(key) &&
    environment[key]?.trim(),
);
if (publicSecrets.length) {
  failures.push(
    `Server secrets must not use NEXT_PUBLIC_: ${publicSecrets.join(", ")}`,
  );
}

const ebayMode = environment.CAPCAR_EBAY_MODE?.trim().toLowerCase() || "demo";
if (!new Set(["demo", "live"]).has(ebayMode)) {
  failures.push("CAPCAR_EBAY_MODE must be demo or live.");
}
if (
  ebayMode === "live" &&
  (!environment.CAPCAR_EBAY_CLIENT_ID?.trim() ||
    !environment.CAPCAR_EBAY_CLIENT_SECRET?.trim())
) {
  failures.push(
    "Live eBay search requires CAPCAR_EBAY_CLIENT_ID and CAPCAR_EBAY_CLIENT_SECRET.",
  );
}
if (
  environment.CAPCAR_EBAY_CAMPAIGN_ID?.trim() &&
  !/^\d+$/.test(environment.CAPCAR_EBAY_CAMPAIGN_ID.trim())
) {
  failures.push("CAPCAR_EBAY_CAMPAIGN_ID must be numeric when configured.");
}

if (failures.length) {
  for (const failure of failures) console.error(`BLOCKED ${failure}`);
  console.error(`CapCar launch blocked with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(
  `CapCar production environment preflight passed (${ebayMode} eBay mode).`,
);

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
