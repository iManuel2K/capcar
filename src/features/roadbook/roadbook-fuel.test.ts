import { describe, expect, it } from "vitest";

import { roadbookFuelAvailable } from "./roadbook-fuel";

describe("Roadbook fuel coverage", () => {
  it("recognizes supported German map centers", () => {
    expect(roadbookFuelAvailable({ latitude: 50.1, longitude: 8.6 })).toBe(
      true,
    );
  });

  it("does not call the Germany-only provider outside its coverage", () => {
    expect(roadbookFuelAvailable({ latitude: 48.85, longitude: 2.35 })).toBe(
      false,
    );
  });
});
