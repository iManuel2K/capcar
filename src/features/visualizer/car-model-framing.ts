/** Fit a rotating cylinder around the entire car, including the near corners. */
export function carCameraDistance({
  aspect,
  fov = 36,
  radius,
  halfHeight,
  elevation = 0.33,
}: {
  aspect: number;
  fov?: number;
  radius: number;
  halfHeight: number;
  elevation?: number;
}) {
  const vertical = (fov * Math.PI) / 360;
  const horizontal = Math.atan(Math.tan(vertical) * Math.max(aspect, 0.1));
  const height =
    halfHeight * Math.cos(elevation) + radius * Math.abs(Math.sin(elevation));
  // Add the cylinder's depth before fitting; perspective brings the front corners closer.
  const depth =
    radius * Math.cos(elevation) + halfHeight * Math.abs(Math.sin(elevation));
  return (
    Math.max(radius / Math.tan(horizontal), height / Math.tan(vertical)) * 1.1 +
    depth
  );
}
