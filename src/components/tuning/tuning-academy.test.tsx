import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TuningAcademy } from "./tuning-academy";
import { generateTuningPlan } from "@/features/tuning/tuning-roadmap";
import {
  readTuningPlans,
  saveTuningPlan,
} from "@/features/tuning/tuning-storage";

const vehicle = {
  id: "test-car",
  make: "BMW",
  model: "318i",
  platform: "E90",
  engineCode: "N43",
  productionYear: 2011,
};
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({
    vehicles: [
      {
        id: "test-car",
        make: "BMW",
        model: "318i",
        platform: "E90",
        engineCode: "N43",
        productionYear: 2011,
      },
      {
        id: "second-car",
        make: "BMW",
        model: "320i",
        platform: "E90",
        engineCode: "N43",
        productionYear: 2011,
      },
    ],
  }),
}));
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("tuning planner journey", () => {
  it("offers ten goals, validates budget, previews before saving and restores settings and progress", () => {
    const { unmount } = render(<TuningAcademy vehicleId="test-car" />);
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(14);
    fireEvent.click(screen.getByRole("button", { name: "Comfort & cabin" }));
    fireEvent.click(screen.getByRole("button", { name: "Weekend drives" }));
    const budget = screen.getByRole("spinbutton");
    fireEvent.change(budget, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a whole-euro budget",
    );
    expect(budget).toHaveFocus();
    fireEvent.change(budget, { target: { value: "7301" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    expect(readTuningPlans(localStorage)).toEqual([]);
    expect(
      within(screen.getByRole("region", { name: "Preview roadmap" }))
        .getAllByRole("checkbox")
        .every((box) => box.hasAttribute("disabled")),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save this roadmap" }));
    const checks = within(
      screen.getByRole("region", { name: "Preview roadmap" }),
    ).getAllByRole("checkbox");
    expect(checks[0]).toBeEnabled();
    expect(checks[3]).toBeDisabled();
    fireEvent.click(checks[0]);
    expect(readTuningPlans(localStorage)[0].completedChecks).toEqual([
      "baseline:0",
    ]);
    unmount();
    render(<TuningAcademy vehicleId="test-car" />);
    expect(
      screen.getByRole("button", { name: "Comfort & cabin" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Weekend drives" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("spinbutton")).toHaveValue(7301);
    expect(
      within(
        screen.getByRole("region", { name: "Preview roadmap" }),
      ).getAllByRole("checkbox")[0],
    ).toBeChecked();
  });
  it("keeps an existing plan until a replacement is explicitly saved", () => {
    saveTuningPlan(
      generateTuningPlan(vehicle, {
        goal: "handling",
        experience: "intermediate",
        budget: 6500,
      }),
      localStorage,
    );
    render(<TuningAcademy vehicleId="test-car" />);
    fireEvent.click(screen.getByRole("button", { name: "Braking" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    expect(screen.getByText(/Saving replaces this car/)).toBeInTheDocument();
    expect(readTuningPlans(localStorage)[0].goal).toBe("handling");
    fireEvent.click(screen.getByRole("button", { name: "Back to saved plan" }));
    expect(
      screen.getByRole("heading", { name: "Handling" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Handling" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("keeps a preview available when persistence fails", () => {
    render(<TuningAcademy vehicleId="test-car" />);
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    fireEvent.click(screen.getByRole("button", { name: "Save this roadmap" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
    expect(screen.getByText("Unsaved preview")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save this roadmap" }),
    ).toBeEnabled();
  });
  it("provides a manual AI brief when clipboard access fails, without sending a request", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<TuningAcademy vehicleId="test-car" />);
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy brief for GPT, Gemini or Copilot",
      }),
    );
    await waitFor(() =>
      expect(
        (
          screen.getByRole("textbox", {
            name: "Copy brief for GPT, Gemini or Copilot",
          }) as HTMLTextAreaElement
        ).value,
      ).toContain("2011 BMW 318i"),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not carry a preview or settings into a different car", () => {
    const { rerender } = render(<TuningAcademy vehicleId="test-car" />);
    fireEvent.click(screen.getByRole("button", { name: "Braking" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview roadmap" }));
    rerender(<TuningAcademy vehicleId="second-car" />);
    expect(screen.queryByText("Unsaved preview")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "OEM+ refinement" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
