import { describe, expect, it } from "vitest";

import { buildCapCarStructuredData } from "./structured-data";

describe("CapCar structured data", () => {
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
