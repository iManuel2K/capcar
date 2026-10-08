import type { Camera } from "./sketchfab-api";

/** Sketchfab uses a Z-up world. Move the camera, never the reference geometry. */
export function moveReferenceCamera(
  camera: Camera,
  action: "left" | "right" | "in" | "out",
): Camera | null {
  if (![...camera.position, ...camera.target].every(Number.isFinite))
    return null;
  const delta = camera.position.map(
    (value, index) => value - camera.target[index],
  );
  const distance = Math.hypot(...delta);
  if (distance < 0.001 || distance > 1_000_000) return null;
  if (action === "in" || action === "out") {
    const factor = action === "in" ? 0.8 : 1.25;
    if (distance * factor < 0.01 || distance * factor > 1_000_000) return null;
    return {
      target: [...camera.target],
      position: delta.map(
        (value, index) => camera.target[index] + value * factor,
      ) as Camera["position"],
    };
  }
  const angle = ((action === "left" ? 1 : -1) * Math.PI) / 12;
  const [x, y, z] = delta;
  return {
    target: [...camera.target],
    position: [
      camera.target[0] + x * Math.cos(angle) - y * Math.sin(angle),
      camera.target[1] + x * Math.sin(angle) + y * Math.cos(angle),
      camera.target[2] + z,
    ],
  };
}
