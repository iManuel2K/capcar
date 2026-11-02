// Turn reviewed public research into a small, versioned data-only import.
// This script never connects to or changes a database.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const batch = "worldwide-2026-11-02";
const selection = JSON.parse(
  await readFile("scripts/roadbook-worldwide-selection.json", "utf8"),
);
const research = JSON.parse(
  await readFile("artifacts/roadbook-worldwide/operator-research.json", "utf8"),
);
const selected = new Set(selection.ids);
const names = new Intl.DisplayNames(["en"], { type: "region" });
const regionFor = (country) => {
  if (["US", "CA", "MX", "GT"].includes(country)) return "North America";
  if (["AR", "BR", "VE"].includes(country)) return "South America";
  if (["ZA", "SN"].includes(country)) return "Africa";
  if (["AU", "NZ"].includes(country)) return "Oceania";
  if (["AE", "BH", "QA", "KW"].includes(country)) return "Middle East";
  if (["IN", "ID", "JP", "CN", "TW", "KR", "MY", "TH", "PH"].includes(country))
    return "Asia";
  return "Europe";
};
const venues = research
  .filter(
    (row) =>
      selected.has(row.id) &&
      !selection.excludedExamples[row.id] &&
      row.status === "operator-page-matched",
  )
  .map((row) => {
    const source = new URL(row.resolvedUrl);
    assert.equal(source.protocol, "https:");
    assert(
      !/1xbet|casino|betting|gambling|ompong188|game online|domain for sale/i.test(
        row.siteTitle ?? "",
      ),
      `Rejected source: ${row.id}`,
    );
    const category = selection.dragVenues.includes(row.id)
      ? "drag_acceleration"
      : selection.driftVenues.includes(row.id)
        ? "drift_circuit"
        : selection.provingGrounds.includes(row.id)
          ? "proving_ground"
          : "track_day";
    const kind =
      category === "drag_acceleration"
        ? "drag-racing venue"
        : category === "drift_circuit"
          ? "drift-circuit venue"
          : category === "proving_ground"
            ? "automotive proving ground"
            : "motorsport circuit";
    return {
      wikidataId: row.id,
      name: row.name,
      slug: `world-${row.id.toLowerCase()}`,
      category,
      description: `${row.name} is a ${kind} in ${names.of(row.country)}. This pin identifies the venue, not a driving route. Use the operator's current calendar to check sessions, events and visitor access; public track-day availability and drop-in driving are not confirmed.`,
      access_status: "closed_venue",
      latitude: row.latitude,
      longitude: row.longitude,
      country_code: row.country,
      city: "",
      source_label: "Official venue website",
      source_url: source.href,
      verification_status: "official_source",
      verified_at: null,
      requirements: {
        catalogImport: {
          batch,
          wikidataId: row.id,
          region: regionFor(row.country),
          operatorCheckedOn: selection.reviewedOn,
          coordinateSource: row.coordinateSource,
          coordinateLicense: "CC0-1.0",
          operatorPageTitle: row.siteTitle ?? "",
        },
        disclaimer:
          "Venue reference point. Confirm the operator's booking, visitor, vehicle and safety requirements before travelling. A map listing does not grant track access.",
      },
    };
  })
  .sort(
    (a, b) =>
      a.country_code.localeCompare(b.country_code) ||
      a.name.localeCompare(b.name),
  );

assert(venues.length >= 100 && venues.length <= 150);
assert.equal(new Set(venues.map((row) => row.wikidataId)).size, venues.length);
for (const venue of venues) {
  assert(/^[A-Z]{2}$/.test(venue.country_code));
  assert(Number.isFinite(venue.latitude) && Math.abs(venue.latitude) <= 90);
  assert(Number.isFinite(venue.longitude) && Math.abs(venue.longitude) <= 180);
}
const payload = JSON.stringify(venues, null, 2);
assert(!payload.includes("$roadbook_places$"));
const sql = `-- Public venue metadata only. No schema, account, visit or existing venue changes.
-- Coordinates: Wikidata CC0; source URLs: individually reviewed operator pages.
-- Generated from data/roadbook/${batch}.json; see docs/roadbook-worldwide.md.
begin;

with incoming as (
  select * from jsonb_to_recordset($roadbook_places$
${payload}
$roadbook_places$::jsonb) as venue(
    "wikidataId" text, name text, slug text, category text, description text,
    access_status text, latitude double precision, longitude double precision,
    country_code text, city text, source_label text, source_url text,
    verification_status text, verified_at timestamptz, requirements jsonb
  )
)
insert into public.roadbook_venues (
  name, slug, category, description, access_status, location, country_code,
  city, source_label, source_url, verification_status, verified_at, requirements, published
)
select i.name, i.slug, i.category, i.description, i.access_status,
  extensions.st_setsrid(extensions.st_makepoint(i.longitude, i.latitude), 4326)::extensions.geography,
  i.country_code, i.city, i.source_label, i.source_url, i.verification_status,
  i.verified_at, i.requirements, true
from incoming i
where not exists (
  select 1 from public.roadbook_venues existing
  where existing.slug = i.slug
    or existing.requirements #>> '{catalogImport,wikidataId}' = i."wikidataId"
    or (
      existing.country_code = i.country_code
      and existing.category in ('track_day','proving_ground','drag_acceleration','drift_circuit')
      and extensions.st_dwithin(existing.location,
        extensions.st_setsrid(extensions.st_makepoint(i.longitude, i.latitude),4326)::extensions.geography, 750)
    )
)
on conflict (slug) do nothing;

do $guard$
begin
  if (select count(*) from public.roadbook_venues
      where requirements #>> '{catalogImport,batch}' = '${batch}') <> ${venues.length} then
    raise exception 'Worldwide catalog count differs from reviewed batch; no changes committed';
  end if;
end;
$guard$;

commit;
`;
if (process.argv.includes("--write")) {
  await mkdir("data/roadbook", { recursive: true });
  await writeFile(`data/roadbook/${batch}.json`, payload + "\n");
  await writeFile(
    "supabase/migrations/20261102215121_roadbook_worldwide_destinations.sql",
    sql,
  );
}
console.log(
  JSON.stringify({
    venues: venues.length,
    countries: new Set(venues.map((row) => row.country_code)).size,
    regions: venues.reduce((result, row) => {
      const region = row.requirements.catalogImport.region;
      result[region] = (result[region] ?? 0) + 1;
      return result;
    }, {}),
    bytes: Buffer.byteLength(payload),
  }),
);
