import { describe, expect, it } from "vitest";
import { moveReferenceCamera } from "./reference-camera";
import type { Camera } from "./sketchfab-api";
const camera: Camera = { position: [10, 0, 5], target: [0, 0, 0] };
describe("accessible reference camera controls", () => {
  it("orbits around the existing target without changing distance", () => {
    const moved = moveReferenceCamera(camera, "left")!;
    expect(moved.target).toEqual(camera.target);
    expect(moved.position[2]).toBe(5);
    expect(Math.hypot(...moved.position)).toBeCloseTo(
      Math.hypot(...camera.position),
    );
    expect(moveReferenceCamera(moved, "right")!.position[0]).toBeCloseTo(10);
  });
  it("zooms along the look vector and keeps the target", () => {
    expect(moveReferenceCamera(camera, "in")).toEqual({
      position: [8, 0, 4],
      target: [0, 0, 0],
    });
    expect(moveReferenceCamera(camera, "out")).toEqual({
      position: [12.5, 0, 6.25],
      target: [0, 0, 0],
    });
  });
  it("rejects invalid or coincident camera values", () => {
    expect(
      moveReferenceCamera({ ...camera, position: [NaN, 0, 1] }, "left"),
    ).toBeNull();
    expect(
      moveReferenceCamera({ ...camera, position: [0, 0, 0] }, "in"),
    ).toBeNull();
  });
});
