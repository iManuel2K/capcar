import { describe, expect, it } from "vitest";

import { problemsForVehicle } from "./problem-catalog";

describe("known problem matching", () => {
  it("does not attach legacy BMW records to a different make or generation year", () => {
    expect(
      problemsForVehicle({
        make: "Ford",
        productionYear: 2011,
        platform: "E90",
        engineCode: "UNKNOWN",
      }),
    ).toEqual([]);
    expect(
      problemsForVehicle({
        make: "BMW",
        productionYear: 2020,
        platform: "E90",
        engineCode: "UNKNOWN",
      }),
    ).toEqual([]);
  });
  it("matches platform evidence without inventing engine applicability", () => {
    const problems = problemsForVehicle({
      platform: "e90",
      engineCode: "UNKNOWN",
    });
    expect(problems.map((problem) => problem.id)).toContain(
      "e9x-springs-dampers",
    );
    expect(problems.map((problem) => problem.id)).not.toContain(
      "e9x-n52-n54-camshaft-valve",
    );
  });

  it("adds a bulletin only when the engine code matches", () => {
    const problems = problemsForVehicle({
      platform: "E90",
      engineCode: "N52B25",
    });
    expect(problems.map((problem) => problem.id)).toContain(
      "e9x-n52-n54-camshaft-valve",
    );
  });
});
