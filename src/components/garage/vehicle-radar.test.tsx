import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VehicleRadar } from "./vehicle-radar";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import {
  readVehicles,
  updateVehicle,
  VEHICLE_STORAGE_KEY,
} from "@/features/vehicles/vehicle-storage";
import {
  collectLocalSnapshot,
  applyLocalSnapshot,
} from "@/features/sync/local-snapshot";
const vehicle: Vehicle = {
  id: "owner-bmw",
  make: "BMW",
  model: "318i",
  platform: "E90",
  bodyStyle: "Sedan",
  productionYear: 2011,
  engineCode: "N43",
  transmission: "Manual",
  mileage: 100000,
  nickname: "Daily",
  createdAt: "2026-10-19T10:00:00Z",
};
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify([vehicle]));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("vehicle character radar", () => {
  it("keeps the public example read-only and never displays a signed-in owner's ratings", () => {
    const demo = {
      ...vehicle,
      id: "demo-bmw-318i-e90",
      demoProject: true,
      profileRatings: {
        performance: 10,
        comfort: 10,
        speed: 10,
        handling: 10,
        efficiency: 10,
        customization: 10,
        practicality: 10,
      },
    };
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify([demo]));
    render(<VehicleRadar vehicle={demo} readOnly />);
    expect(screen.getByText("Illustrative sample scores")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Adjust ratings/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(
      expect.stringContaining("Performance 5/10"),
    );
  });

  it("does not invent owner scores and discards a cancelled preview", () => {
    render(<VehicleRadar vehicle={vehicle} />);
    expect(
      screen.getByText("Give your car a character of its own."),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Rate your car/ }));
    fireEvent.change(screen.getByRole("slider", { name: /^Performance/ }), {
      target: { value: "9" },
    });
    expect(screen.getByText("Unsaved preview")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(readVehicles(localStorage)[0].profileRatings).toBeUndefined();
  });
  it("saves bounded owner scores, preserves newer vehicle changes and includes ratings in account snapshots", () => {
    render(<VehicleRadar vehicle={vehicle} />);
    fireEvent.click(screen.getByRole("button", { name: /Rate your car/ }));
    fireEvent.change(screen.getByRole("slider", { name: /^Performance/ }), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /^Customization/ }), {
      target: { value: "10" },
    });
    updateVehicle(
      vehicle.id,
      { ...vehicle, mileage: 123456, nickname: "Latest name" },
      localStorage,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save ratings" }));
    expect(readVehicles(localStorage)[0]).toMatchObject({
      id: vehicle.id,
      mileage: 123456,
      nickname: "Latest name",
      profileRatings: { performance: 8, customization: 10 },
    });
    expect(screen.getByText("Your ratings")).toBeVisible();
    const snapshot = collectLocalSnapshot(localStorage);
    localStorage.clear();
    applyLocalSnapshot(snapshot, localStorage);
    expect(readVehicles(localStorage)[0].profileRatings?.performance).toBe(8);
  });
  it("labels showcase scores as examples and clears only the owner's ratings", () => {
    const demo = { ...vehicle, id: "demo-bmw-318i-e90", demoProject: true };
    localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify([demo, vehicle]));
    render(<VehicleRadar vehicle={demo} />);
    expect(screen.getByText("Illustrative sample scores")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Adjust ratings/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save ratings" }));
    expect(screen.getByText("Your ratings")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear my ratings" }));
    expect(screen.getByText("Illustrative sample scores")).toBeVisible();
    expect(readVehicles(localStorage)).toHaveLength(2);
    expect(
      readVehicles(localStorage).find((v) => v.id === demo.id)?.profileRatings,
    ).toBeUndefined();
  });
  it("keeps an unsaved draft when storage is full", () => {
    render(<VehicleRadar vehicle={vehicle} />);
    fireEvent.click(screen.getByRole("button", { name: /Rate your car/ }));
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("quota");
    });
    fireEvent.click(screen.getByRole("button", { name: "Save ratings" }));
    expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
    expect(screen.getAllByRole("slider")).toHaveLength(7);
    expect(readVehicles(localStorage)[0].profileRatings).toBeUndefined();
  });
});
