import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { GarageShowroom, showroomPhoto } from "./garage-showroom";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-image={src} aria-label={alt} />
  ),
}));
vi.mock("./vehicle-art", () => ({
  VehicleArt: ({ label }: { label: string }) => <div>{label} photo</div>,
}));
vi.mock("./vehicle-overview-summary", () => ({
  VehicleOverviewSummary: ({ vehicle }: { vehicle: Vehicle }) => (
    <div>{vehicle.nickname} overview</div>
  ),
}));
vi.mock("./garage-goal-panel", () => ({
  GarageGoalPanel: ({ vehicle }: { vehicle: Vehicle }) => (
    <div>{vehicle.nickname} goal</div>
  ),
}));
vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ modelId }: { modelId: string }) => <div>3D reference {modelId}</div>,
}));
const bmw: Vehicle = {
  id: "bmw",
  make: "BMW",
  model: "318i",
  platform: "E90",
  bodyStyle: "Sedan",
  productionYear: 2011,
  engineCode: "N43",
  transmission: "Manual",
  mileage: 100000,
  nickname: "Daily",
  garageGoal: "modify",
  createdAt: "2026-10-19T10:00:00Z",
};
const ford: Vehicle = {
  ...bmw,
  id: "ford",
  make: "Ford",
  model: "F-150",
  platform: "P702",
  bodyStyle: "Pickup",
  productionYear: 2021,
  nickname: "Truck",
  garageGoal: "maintain",
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("interactive garage showroom", () => {
  it("uses cutouts only for the known example photos and preserves owner uploads", () => {
    expect(
      showroomPhoto({ ...bmw, imageUrl: "/capcar-bmw-current-side.webp" }),
    ).toBe("/garage/cutouts/bmw-318i.webp");
    expect(
      showroomPhoto({
        ...bmw,
        photoDataUrl: "data:image/webp;base64,private",
        imageUrl: "/capcar-bmw-current-side.webp",
      }),
    ).toBe("data:image/webp;base64,private");
  });
  it("cycles only after play and stops when selecting a car or editing ratings", () => {
    vi.useFakeTimers();
    render(<GarageShowroom vehicles={[bmw, ford]} />);
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play showroom" }));
    act(() => {
      vi.advanceTimersByTime(6500);
    });
    expect(screen.getByText("Truck overview")).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "Rate your car" }));
    expect(
      screen.getByRole("button", { name: "Play showroom" }),
    ).toHaveAttribute("aria-pressed", "false");
    act(() => {
      vi.advanceTimersByTime(13000);
    });
    expect(screen.getByText("Truck overview")).toBeInTheDocument();
  });
  it("opens a matching model directly without substituting another trim", () => {
    render(
      <GarageShowroom
        vehicles={[
          {
            ...bmw,
            model: "M3",
            platform: "E30",
            bodyStyle: "Coupe",
            productionYear: 1990,
          },
        ]}
      />,
    );
    expect(screen.getByText("3D reference bmw-m3-e30")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Rotate in 3D" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("keeps public examples separate from account actions and workshop data", () => {
    render(<GarageShowroom vehicles={[bmw, ford]} readOnly />);
    expect(
      screen.queryByRole("link", { name: "Open this garage" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Daily overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Daily goal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next vehicle" }));
    expect(
      screen.getByRole("button", { name: "2021 Ford F-150" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("updates the summary, goal and every destination when choosing a different car", () => {
    render(<GarageShowroom vehicles={[bmw, ford]} />);
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2021 Ford F-150" }));
    expect(screen.getByText("Truck overview")).toBeInTheDocument();
    expect(screen.getByText("Truck goal")).toBeVisible();
    expect(screen.queryByText("Daily overview")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open this garage" }),
    ).toHaveAttribute("href", "/garage/ford");
    expect(
      screen.getByRole("link", { name: "Plan an upgrade" }),
    ).toHaveAttribute("href", "/garage/ford/builds");
    expect(screen.getByRole("link", { name: "Maintenance" })).toHaveAttribute(
      "href",
      "/garage/ford/maintenance",
    );
    expect(
      screen.getByRole("button", { name: "2021 Ford F-150" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("supports wraparound arrows and keyboard selection with focus", () => {
    render(<GarageShowroom vehicles={[bmw, ford]} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous vehicle" }));
    const truck = screen.getByRole("button", {
      name: "2021 Ford F-150",
    });
    expect(truck).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(truck, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "2011 BMW 318i" })).toHaveFocus();
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
  });
  it("never silently substitutes a different 3D car and resets a manual reference on vehicle change", () => {
    render(<GarageShowroom vehicles={[bmw, ford]} />);
    fireEvent.click(screen.getByRole("button", { name: "Rotate in 3D" }));
    expect(
      screen.getByText(/matching 3D reference is not available/),
    ).toBeVisible();
    expect(screen.queryByText(/3D reference bmw-320i/)).not.toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Choose a 3D reference" }),
      { target: { value: "bmw-320i" } },
    );
    expect(screen.getByText("3D reference bmw-320i")).toBeVisible();
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next vehicle" }));
    expect(screen.queryByText("3D reference bmw-320i")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Photo" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("retains a valid selection when its vehicle disappears and disables navigation for a single car", () => {
    const view = render(<GarageShowroom vehicles={[bmw, ford]} />);
    fireEvent.click(screen.getByRole("button", { name: "Next vehicle" }));
    view.rerender(<GarageShowroom vehicles={[bmw]} />);
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next vehicle" })).toBeDisabled();
  });
  it("changes cars on a horizontal swipe while leaving a vertical scroll alone", () => {
    const { container } = render(<GarageShowroom vehicles={[bmw, ford]} />);
    const region = container.querySelector('[class*="photo"]')!;
    fireEvent.touchStart(region, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(region, {
      changedTouches: [{ clientX: 190, clientY: 300 }],
    });
    expect(screen.getByText("Daily overview")).toBeInTheDocument();
    fireEvent.touchStart(region, { touches: [{ clientX: 240, clientY: 100 }] });
    fireEvent.touchEnd(region, {
      changedTouches: [{ clientX: 80, clientY: 110 }],
    });
    expect(screen.getByText("Truck overview")).toBeInTheDocument();
  });
});
