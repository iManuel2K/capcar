import { describe, expect, it } from "vitest";
import { createTripStopMarker } from "@/features/trips/trip-stop-marker";

describe("trip stop markers", () => {
  it("renders untrusted stop names as literal text without changing the marker", () => {
    const payload =
      '<img src=x onerror="alert(document.cookie)"><svg onload=alert(1)>';
    const marker = createTripStopMarker(2, payload);
    expect(marker.className).toBe("trip-route-marker");
    expect(marker.querySelector("span")?.textContent).toBe("3");
    expect(marker.querySelector("strong")?.textContent).toBe(payload);
    expect(marker.querySelector("img, svg, script")).toBeNull();
    expect(marker.children).toHaveLength(2);
  });
});
