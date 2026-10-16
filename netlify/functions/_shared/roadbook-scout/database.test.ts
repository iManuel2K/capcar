import { describe, expect, it } from "vitest";

import { europeanPhotoTargets } from "./source-catalog";
import { roadbookScoutPlaceTargets } from "./database";

describe("roadbookScoutPlaceTargets", () => {
  it("turns every curated photo target into a unique map anchor", () => {
    const places = roadbookScoutPlaceTargets();

    expect(places).toHaveLength(europeanPhotoTargets.length);
    expect(new Set(places.map((place) => place.source_key)).size).toBe(
      places.length,
    );
    expect(places).toContainEqual({
      source_key: "de-black-forest",
      region: "Black Forest",
      country_code: "DE",
      latitude: 48.191,
      longitude: 8.195,
    });
  });

  it("only exposes reviewed target metadata, never search-result imagery", () => {
    expect(
      roadbookScoutPlaceTargets().every(
        (place) =>
          Number.isFinite(place.latitude) &&
          Number.isFinite(place.longitude) &&
          Object.keys(place).length === 5,
      ),
    ).toBe(true);
  });
});
