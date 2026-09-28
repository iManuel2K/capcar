import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { roadbookVenueListSchema } from "./roadbook-schema";
import { parseRoadbookVectorProvider } from "./roadbook-vector-style";

afterEach(() => vi.unstubAllGlobals());

describe("Roadbook browser compatibility", () => {
  it("parses venue data without testing unsafe eval under a strict CSP", () => {
    expect(z.config().jitless).toBe(true);
    const unsafeFunction = vi.fn(() => {
      throw new Error("CSP blocked eval");
    });
    vi.stubGlobal("Function", unsafeFunction);
    expect(roadbookVenueListSchema.safeParse([]).success).toBe(true);
    expect(unsafeFunction).not.toHaveBeenCalled();
  });

  it("accepts the versioned OpenFreeMap vector provider", () => {
    expect(
      parseRoadbookVectorProvider({
        tiles: [
          "https://tiles.openfreemap.org/planet/20260913/{z}/{x}/{y}.pbf",
        ],
        vector_layers: [{ id: "water" }, { id: "transportation" }],
      }),
    ).toEqual({
      tileUrl: "https://tiles.openfreemap.org/planet/20260913/{z}/{x}/{y}.pbf",
      layerIds: ["water", "transportation"],
    });
  });

  it("rejects untrusted or incomplete vector providers", () => {
    expect(
      parseRoadbookVectorProvider({
        tiles: ["https://example.com/{z}/{x}/{y}.pbf"],
        vector_layers: [{ id: "water" }],
      }),
    ).toBeNull();
    expect(
      parseRoadbookVectorProvider({
        tiles: ["https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf"],
        vector_layers: [],
      }),
    ).toBeNull();
  });
});
