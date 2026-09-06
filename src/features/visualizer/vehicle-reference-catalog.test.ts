import { describe, expect, it } from "vitest";

import { vehicleReferenceFor } from "./vehicle-reference-catalog";

describe("vehicle reference catalogue", () => {
  it("matches the E90 reference without applying it to another chassis", () => {
    const reference = vehicleReferenceFor("e90");

    expect(reference?.creator).toBe("byegdesign");
    expect(reference?.modelUid).toBe("683639e5ce0c477b882ed6311656d29d");
    expect(reference?.embedUrl).toContain("ui_theme=dark");
    expect(reference?.embedUrl).toContain("ui_color=74A7FF");
    expect(reference?.embedUrl).toContain("transparent=0");
    expect(vehicleReferenceFor("F30")).toBeUndefined();
  });
});
