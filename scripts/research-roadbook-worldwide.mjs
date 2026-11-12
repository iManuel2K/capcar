// Research only: fetch public metadata, never write to the database.
// Wikidata structured facts are CC0; operator pages are checked, not copied.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { isIP } from "node:net";

const root = "artifacts/roadbook-worldwide";
const selection = JSON.parse(
  await readFile("scripts/roadbook-worldwide-selection.json", "utf8"),
);
const candidates = JSON.parse(
  await readFile(`${root}/wikidata-candidates.json`, "utf8"),
).results.bindings;
const rows = [];
const only = process.argv.slice(2);
if (only.length) {
  try {
    rows.push(
      ...JSON.parse(
        await readFile(`${root}/operator-research.json`, "utf8"),
      ).filter((row) => !only.includes(row.id)),
    );
  } catch {
    /* First research pass. */
  }
}
function safeUrl(value) {
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    isIP(url.hostname) ||
    url.hostname === "localhost" ||
    !url.hostname.includes(".")
  )
    throw Error("Not a public website");
  url.protocol = "https:";
  return url.href;
}
function text(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
async function inspect(id) {
  const options = candidates.filter((candidate) =>
    candidate.place.value.endsWith(`/${id}`),
  );
  options.sort(
    (a, b) =>
      Number(b.website.value.includes("/en")) -
      Number(a.website.value.includes("/en")),
  );
  const record = options[0];
  if (!record) return { id, status: "missing-coordinate-source" };
  const override = selection.overrides[id] ?? {};
  const name = override.name ?? record.placeLabel.value;
  const match = record.coordinate.value.match(/^Point\(([-\d.]+) ([-\d.]+)\)$/);
  if (!match) return { id, name, status: "invalid-coordinates" };
  const result = {
    id,
    name,
    country: record.countryCode.value,
    latitude: Number(match[2]),
    longitude: Number(match[1]),
    coordinateSource: `https://www.wikidata.org/wiki/${id}`,
    coordinateLicense: "CC0-1.0",
    category: selection.dragVenues.includes(id)
      ? "drag_acceleration"
      : selection.driftVenues.includes(id)
        ? "drift_circuit"
        : "track_day",
    checkedOn: selection.reviewedOn,
  };
  try {
    result.operatorUrl = safeUrl(override.website ?? record.website.value);
    let url = result.operatorUrl;
    let response;
    for (let redirects = 0; redirects < 6; redirects++) {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
        headers: {
          "User-Agent":
            "CapCar-Roadbook/1.0 (+https://capcar.dev; public destination research)",
          Accept: "text/html",
        },
      });
      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.get("location")
      ) {
        url = safeUrl(new URL(response.headers.get("location"), url).href);
        await response.body?.cancel();
      } else break;
    }
    result.httpStatus = response.status;
    result.resolvedUrl = url;
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("text/html")
    )
      return { ...result, status: "needs-review" };
    const html = await response.text();
    const title = text(
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    ).slice(0, 180);
    result.siteTitle = title;
    const description =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i,
      )?.[1] ?? "";
    const pageText = normalize(
      text(`${title} ${description} ${html.slice(0, 500000)}`),
    );
    const tokens = normalize(name)
      .split(/[^a-z0-9]+/)
      .filter(
        (token) =>
          token.length > 3 &&
          ![
            "circuit",
            "raceway",
            "racing",
            "track",
            "international",
            "motorsport",
            "motorsports",
            "motor",
            "autodromo",
            "park",
            "course",
            "sports",
            "speedway",
            "resort",
            "world",
          ].includes(token),
      );
    result.matchedTerms = tokens.filter((token) => pageText.includes(token));
    const badPage =
      /domain (is )?(for sale|parked)|buy this domain|just a moment|access denied|403 forbidden|404 not found|sedoparking|site suspended|account suspended|1xbet|casino|betting|gambling|ompong188|game online/i.test(
        title,
      );
    result.status =
      !badPage && result.matchedTerms.length > 0
        ? "operator-page-matched"
        : "needs-review";
  } catch (error) {
    result.status = "needs-review";
    result.error = error.name;
  }
  return result;
}

await mkdir(root, { recursive: true });
const pending = [...new Set(selection.ids)].filter(
  (id) =>
    !selection.excludedExamples[id] && (!only.length || only.includes(id)),
);
let done = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (pending.length) {
      const row = await inspect(pending.shift());
      rows.push(row);
      if (++done % 10 === 0) {
        await writeFile(
          `${root}/operator-research.json`,
          JSON.stringify(rows, null, 2),
        );
        console.log(
          `${done}/${selection.ids.length} checked; ${rows.filter((r) => r.status === "operator-page-matched").length} matched operator pages`,
        );
      }
    }
  }),
);
rows.sort(
  (a, b) => a.country.localeCompare(b.country) || a.name?.localeCompare(b.name),
);
await writeFile(
  `${root}/operator-research.json`,
  JSON.stringify(rows, null, 2),
);
console.log(
  JSON.stringify({
    checked: rows.length,
    matched: rows.filter((row) => row.status === "operator-page-matched")
      .length,
    countries: [
      ...new Set(
        rows
          .filter((row) => row.status === "operator-page-matched")
          .map((row) => row.country),
      ),
    ].length,
  }),
);
