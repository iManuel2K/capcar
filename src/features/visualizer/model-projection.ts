import type { Vector3 } from "@/features/visualizer/vehicle-model-schema";

export type OrbitCamera = {
  yaw: number;
  pitch: number;
  zoom: number;
};

export type ProjectedPoint = {
  x: number;
  y: number;
  depth: number;
};

export function rotateVector(
  [x, y, z]: Vector3,
  camera: Pick<OrbitCamera, "yaw" | "pitch">,
): Vector3 {
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  const yawX = x * cosYaw - z * sinYaw;
  const yawZ = x * sinYaw + z * cosYaw;
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  return [yawX, y * cosPitch - yawZ * sinPitch, y * sinPitch + yawZ * cosPitch];
}

export function projectVector(
  vector: Vector3,
  camera: OrbitCamera,
  viewport: { width: number; height: number },
  modelLength: number,
): ProjectedPoint {
  const [x, y, depth] = rotateVector(vector, camera);
  const cameraDistance = modelLength * 1.45;
  const perspective =
    cameraDistance / Math.max(modelLength * 0.35, cameraDistance - depth);
  const scale = (viewport.width / modelLength) * 0.76 * camera.zoom;
  return {
    x: viewport.width / 2 + x * scale * perspective,
    y: viewport.height / 2 - y * scale * perspective,
    depth,
  };
}
