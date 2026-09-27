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

  it("checks WebGL2 without allocating a competing canvas context", () => {
    const createElement = vi.fn();
    vi.stubGlobal("WebGL2RenderingContext", class WebGL2RenderingContext {});
    vi.spyOn(document, "createElement").mockImplementation(createElement);
    expect(supportsRoadbookWebGL()).toBe(true);
    expect(createElement).not.toHaveBeenCalled();
  });

  it("keeps the raster fallback when WebGL2 is unavailable", () => {
    vi.stubGlobal("WebGL2RenderingContext", undefined);
    expect(supportsRoadbookWebGL()).toBe(false);
  });
});
