import { describe, expect, it } from "vitest";

import { buildCapCarStructuredData } from "./structured-data";

describe("CapCar structured data", () => {
  it("publishes one stable domain identity across all localized homepages", () => {
    for (const locale of ["en", "de", "el", "sq", "ja"] as const) {
      const graph = buildCapCarStructuredData("Digital garage", locale)[
        "@graph"
      ];
      const sites = graph.filter((node) => node["@type"] === "WebSite");
      expect(sites).toHaveLength(1);
      expect(sites[0]).toMatchObject({
        "@id": "https://capcar.dev/#website",
        name: "CapCar — Digital Garage",
        alternateName: ["CapCar", "capcar.dev"],
        url: "https://capcar.dev/",
        publisher: { "@id": "https://capcar.dev/#organization" },
      });
    }
  });
  it("describes the free web application without fabricated reviews", () => {
    const data = buildCapCarStructuredData(
      "Plan and document a project car.",
      "en",
    );
    const serialized = JSON.stringify(data);

    expect(serialized).toContain('"@type":"SoftwareApplication"');
    expect(serialized).toContain('"price":"0"');
    expect(serialized).toContain('"url":"https://capcar.dev/en"');
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain('"review"');
  });
});
