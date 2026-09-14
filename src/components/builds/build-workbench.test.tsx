import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuildWorkbench } from "./build-workbench";
import {
  createStarterBuild,
  readBuildState,
} from "@/features/builds/build-storage";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";
import { readCostState } from "@/features/costs/cost-storage";

vi.mock("@/components/passport/vehicle-documents", () => ({
  VehicleDocuments: ({ onSelect }: { onSelect: (name: string) => void }) => (
    <button onClick={() => onSelect("123--receipt.pdf")}>
      Select private document
    </button>
  ),
}));
beforeEach(() => {
  cleanup();
  localStorage.clear();
});
function setup() {
  const vehicle = saveVehicle(
    {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      engineCode: "N43B20",
      bodyStyle: "Sedan",
      transmission: "Manual",
      mileage: 100000,
    },
    localStorage,
  );
  const build = createStarterBuild(
    {
      vehicleId: vehicle.id,
      name: "OEM street",
      goal: "OEM+ daily",
      description: "An owner-recorded daily build.",
      budget: 2000,
    },
    {
      title: "Rear lamps",
      estimatedCost: 300,
      stage: "appearance",
      priority: "now",
    },
    localStorage,
  );
  render(<BuildWorkbench vehicle={vehicle} buildId={build.id} />);
  return { vehicle, build };
}
const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
describe("build workbench interaction", () => {
  it("records a real purchase and shows it in costs once", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Purchase & install" }));
    fill("Order date", "2026-09-01");
    fill("Actual amount paid · EUR incl. shipping / taxes", "250.50");
    fireEvent.click(
      screen.getByRole("button", { name: "Save actual purchase / progress" }),
    );
    expect(screen.getByRole("status").textContent).toContain("Saved");
    expect(readCostState(localStorage).entries[0].amount).toBe(250.5);
    fireEvent.click(
      screen.getByRole("button", { name: "Save actual purchase / progress" }),
    );
    expect(readCostState(localStorage).entries).toHaveLength(1);
  });
  it("preserves entered dates after an invalid sequence", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Purchase & install" }));
    fill("Order date", "2026-09-03");
    fill("Actual amount paid · EUR incl. shipping / taxes", "210");
    fill("Actual delivery date · optional", "2026-09-01");
    fireEvent.click(
      screen.getByRole("button", { name: "Save actual purchase / progress" }),
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Delivery cannot precede",
    );
    expect(
      (
        screen.getByLabelText(
          "Actual delivery date · optional",
        ) as HTMLInputElement
      ).value,
    ).toBe("2026-09-01");
    expect(readCostState(localStorage).entries).toHaveLength(0);
  });
  it("links an existing private document without an additional upload or public URL", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Evidence" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Select private document" }),
    );
    expect(
      readBuildState(localStorage).items[0].workbench?.evidence[0].documentName,
    ).toBe("123--receipt.pdf");
    expect(screen.getByRole("button", { name: "Unlink" })).toBeDefined();
  });
});
