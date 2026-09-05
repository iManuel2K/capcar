import { describe, expect, it } from "vitest";

import {
  projectVector,
  rotateVector,
} from "@/features/visualizer/model-projection";

describe("3D model projection", () => {
  it("rotates a front vector to the side around the vertical axis", () => {
    const [x, , z] = rotateVector([0, 0, 100], {
      yaw: Math.PI / 2,
      pitch: 0,
    });
    expect(Math.round(x)).toBe(-100);
    expect(Math.round(z)).toBe(0);
  });

  it("projects the model origin to the viewport centre", () => {
    const point = projectVector(
      [0, 0, 0],
      { yaw: 0, pitch: 0, zoom: 1 },
      { width: 800, height: 500 },
      4600,
    );
    expect(point.x).toBe(400);
    expect(point.y).toBe(250);
  });
});
