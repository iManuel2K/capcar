const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Capcar launch blocked. Missing: ${missing.join(", ")}`);
  process.exitCode = 1;
} else if (!process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")) {
  console.error("Capcar launch blocked. NEXT_PUBLIC_SITE_URL must use HTTPS.");
  process.exitCode = 1;
} else {
  console.log("Capcar production environment preflight passed.");
}
