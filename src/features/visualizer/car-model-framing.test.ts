import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { carCameraDistance } from "./car-model-framing";

describe("whole-car camera framing", () => {
  it("keeps every corner visible through a full rotation on portrait and wide viewports", () => {
    for (const aspect of [0.55, 1, 16 / 9, 2.5]) {
      for (const size of [
        [2, 1.5, 4.8],
        [2.2, 2.6, 4.8],
      ]) {
        const [width, height, length] = size;
        for (const elevation of [0.12, 0.33, 1.2]) {
          const radius = Math.hypot(width, length) / 2;
          const distance = carCameraDistance({
            aspect,
            radius,
            halfHeight: height / 2,
            elevation,
          });
          const camera = new THREE.PerspectiveCamera(36, aspect, 0.05, 100);
          camera.position.set(
            distance * Math.cos(elevation),
            distance * Math.sin(elevation),
            0,
          );
          camera.lookAt(0, 0, 0);
          camera.updateMatrixWorld(true);
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
            for (const x of [-width / 2, width / 2])
              for (const y of [-height / 2, height / 2])
                for (const z of [-length / 2, length / 2]) {
                  const p = new THREE.Vector3(x, y, z)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
                    .project(camera);
                  expect(Math.abs(p.x)).toBeLessThan(1);
                  expect(Math.abs(p.y)).toBeLessThan(1);
                }
          }
        }
      }
    }
  });
});
