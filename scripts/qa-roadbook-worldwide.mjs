// Read-only checks with the public key, not a privileged database connection.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const venues = JSON.parse(
  await readFile("data/roadbook/worldwide-2026-11-02.json", "utf8"),
);
assert(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "Configure the public Supabase URL and publishable key",
);
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { count, error } = await client
  .from("roadbook_venues")
  .select("id", { count: "exact", head: true })
  .eq("published", true);
assert.ifError(error);
assert(
  count >= venues.length + 125,
  "The expanded catalog and original places must remain public",
);
const regions = [
  "Africa",
  "Asia",
  "Europe",
  "Middle East",
  "North America",
  "South America",
  "Oceania",
];
const checks = [];
for (const region of regions) {
  const venue = venues.find(
    (row) => row.requirements.catalogImport.region === region,
  );
  const { data, error: queryError } = await client.rpc(
    "roadbook_venues_nearby",
    {
      p_lat: venue.latitude,
      p_lng: venue.longitude,
      p_radius_m: 5000,
      p_categories: [venue.category],
    },
  );
  assert.ifError(queryError);
  const place = data.find((row) => row.slug === venue.slug);
  assert(place, `Public map query must return ${venue.name}`);
  assert.equal(place.country_code, venue.country_code);
  assert.equal(place.source_url, venue.source_url);
  assert.equal(place.verification_status, "official_source");
  assert.equal(place.verified_at, null);
  assert.equal(place.route_geojson, null);
  checks.push({ region, place: place.name, country: place.country_code });
}
console.log(
  JSON.stringify({
    anonymousPublishedCount: count,
    regionalMapQueries: checks,
  }),
);
