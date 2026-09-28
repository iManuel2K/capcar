import { describe, expect, it } from "vitest";

import { structuredDataCandidates } from "./parsers";
import type { ScoutSource } from "./types";

const source: ScoutSource = {
  key: "test-circuit",
  kind: "event_page",
  scope: "europe",
  name: "Test Circuit",
  url: "https://example.com/events",
  countryCode: "DE",
};

describe("Roadbook Scout structured data", () => {
  it("extracts dated official events without inventing missing fields", async () => {
    const html = `
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": "Open Track Evening",
          "startDate": "2027-05-14T17:00:00+02:00",
          "endDate": "2027-05-14T21:00:00+02:00",
          "url": "/events/open-track",
          "location": {
            "@type": "Place",
            "name": "Test Circuit",
            "address": { "addressLocality": "Teststadt" }
          }
        }
      </script>`;

    const candidates = await structuredDataCandidates(html, source);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      kind: "event",
      title: "Open Track Evening",
      sourceUrl: "https://example.com/events/open-track",
      countryCode: "DE",
    });
    expect(candidates[0].payload).toMatchObject({
      startsAt: "2027-05-14T17:00:00+02:00",
      endsAt: "2027-05-14T21:00:00+02:00",
      venueName: "Test Circuit",
      address: "Teststadt",
    });
  });

  it("ignores undated event cards and malformed structured data", async () => {
    const html = `
      <script type="application/ld+json">{broken</script>
      <script type="application/ld+json">
        {"@type":"Event","name":"Maybe someday"}
      </script>`;

    await expect(structuredDataCandidates(html, source)).resolves.toEqual([]);
  });
});
