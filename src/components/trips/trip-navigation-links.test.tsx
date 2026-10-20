import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TripNavigationLinks } from "@/components/trips/trip-navigation-links";
import type { TripRoute } from "@/features/trips/trip-route";
vi.mock("next-intl", () => ({ useLocale: () => "en" }));
describe("trip navigation controls", () => {
  it("shows Apple waypoints and every numbered single-leg handoff", () => {
    const route = {
      stops: Array.from({ length: 5 }, (_, index) => ({
        name: "Stop " + index,
        latitude: 50 + index / 100,
        longitude: 8 + index / 100,
      })),
    } as TripRoute;
    render(<TripNavigationLinks route={route} />);
    const apple = screen.getByRole("link", { name: "Apple Maps" });
    expect(
      new URL(apple.getAttribute("href")!).searchParams.getAll("waypoint"),
    ).toHaveLength(3);
    const waze = screen.getAllByRole("link", { name: /^Waze:/, hidden: true });
    expect(waze).toHaveLength(4);
    expect(new URL(waze[0].getAttribute("href")!).searchParams.get("ll")).toBe(
      "50.010000,8.010000",
    );
    expect(screen.getByText(/Follow the numbered legs/)).toBeInTheDocument();
  });
});
