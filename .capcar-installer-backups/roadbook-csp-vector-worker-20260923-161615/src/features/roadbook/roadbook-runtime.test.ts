import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { roadbookVenueListSchema } from "./roadbook-schema";
import { supportsRoadbookWebGL } from "./roadbook-vector-style";

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

  it("checks WebGL2 without intentionally losing the context", () => {
    const getExtension = vi.fn();
    const getContext = vi.fn(() => ({ getExtension }));
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({ getContext })),
    });
    expect(supportsRoadbookWebGL()).toBe(true);
    expect(getContext).toHaveBeenCalledWith("webgl2", {
      failIfMajorPerformanceCaveat: false,
    });
    expect(getExtension).not.toHaveBeenCalled();
  });

  it("keeps the raster fallback when WebGL2 is unavailable", () => {
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({ getContext: () => null })),
    });
    expect(supportsRoadbookWebGL()).toBe(false);
  });
});
