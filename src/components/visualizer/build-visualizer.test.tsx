import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BuildVisualizer } from "./build-visualizer";
import { carModels } from "@/features/visualizer/car-model-catalog";
import { readBuildVisuals } from "@/features/visualizer/build-visual-storage";

const fixture = vi.hoisted(() => ({
  vehicle: {
    id: "vehicle-1",
    make: "BMW",
    model: "M3",
    platform: "E30",
    productionYear: 1990,
    bodyStyle: "Coupe",
  },
  build: { id: "build-1", vehicleId: "vehicle-1", name: "My project" },
}));

vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({ vehicles: [fixture.vehicle] }),
}));
vi.mock("@/features/builds/use-builds", () => ({
  useBuildState: () => ({ builds: [fixture.build], items: [] }),
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function Model({
      modelId,
      paint,
    }: {
      modelId: string;
      paint?: string | null;
    }) {
      return (
        <div
          data-testid="interactive-model"
          data-model-id={modelId}
          data-paint={paint}
        >
          Interactive model
        </div>
      );
    },
}));
vi.mock("@/components/visualizer/vehicle-model-stage", () => ({
  VehicleModelStage: () => <div>Stylized vehicle</div>,
}));
vi.mock("@/components/visualizer/interior-stage", () => ({
  InteriorStage: () => <div>Interior concept</div>,
}));
vi.mock("@/components/visualizer/reference-configurator", () => ({
  ReferenceConfigurator: () => <div>External reference</div>,
}));
vi.mock("@/components/visualizer/sketchfab-interior-stage", () => ({
  SketchfabInteriorStage: () => <div>External interior</div>,
}));
vi.mock("@/components/visualizer/exhaust-sound-studio", () => ({
  ExhaustSoundStudio: () => null,
}));

beforeEach(() => {
  window.localStorage.clear();
  Object.assign(fixture.vehicle, {
    make: "BMW",
    model: "M3",
    platform: "E30",
    productionYear: 1990,
    bodyStyle: "Coupe",
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("garage free model library", () => {
  it("opens a supported vehicle generation in its interactive model view", () => {
    render(<BuildVisualizer vehicleId="vehicle-1" buildId="build-1" />);
    expect(
      screen.getByRole("button", { name: "3D model", pressed: true }),
    ).toBeVisible();
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-model-id",
      "bmw-m3-e30",
    );
    expect(
      screen.getByText(/Matched to your vehicle generation/),
    ).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "Free model library" }).children,
    ).toHaveLength(carModels.length + 1);
  });

  it("keeps unsupported cars on their photo and saves only an explicitly chosen reference", () => {
    Object.assign(fixture.vehicle, {
      make: "Renault",
      model: "Clio",
      platform: "X98",
      productionYear: 2015,
      bodyStyle: "Hatchback",
    });
    const view = render(
      <BuildVisualizer vehicleId="vehicle-1" buildId="build-1" />,
    );
    expect(
      screen.getByRole("button", { name: "photo", pressed: true }),
    ).toBeVisible();
    expect(screen.queryByTestId("interactive-model")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Browse 25 free models" }),
    );
    expect(
      screen.getByText(
        /Your exact vehicle generation is not in the free model library/,
      ),
    ).toBeVisible();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Free model library" }),
      { target: { value: "nissan-gt-r" } },
    );
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-model-id",
      "nissan-gt-r",
    );
    expect(
      screen.getByText(
        /A reference you selected, not a model of your own vehicle/,
      ),
    ).toBeVisible();
    expect(readBuildVisuals(window.localStorage)[0].studioModelId).toBe(
      "nissan-gt-r",
    );
    view.unmount();
    render(<BuildVisualizer vehicleId="vehicle-1" buildId="build-1" />);
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-model-id",
      "nissan-gt-r",
    );
  });

  it("saves paint through the existing build storage and can return to the vehicle match", () => {
    const paintableModel = carModels.find(
      (model) => model.paintMaterials.length > 0,
    )!;
    render(<BuildVisualizer vehicleId="vehicle-1" buildId="build-1" />);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Free model library" }),
      { target: { value: paintableModel.id } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Estoril blue" }));
    expect(readBuildVisuals(window.localStorage)[0]).toMatchObject({
      studioModelId: paintableModel.id,
      paint: "estoril-blue",
    });
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-paint",
      "#2870c6",
    );
    fireEvent.click(screen.getByRole("button", { name: "Original model" }));
    expect(screen.getByTestId("interactive-model")).not.toHaveAttribute(
      "data-paint",
    );
    expect(readBuildVisuals(window.localStorage)[0].paint).toBe("estoril-blue");
    fireEvent.change(
      screen.getByRole("combobox", { name: "Free model library" }),
      { target: { value: "" } },
    );
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-model-id",
      "bmw-m3-e30",
    );
    expect(
      readBuildVisuals(window.localStorage)[0].studioModelId,
    ).toBeUndefined();
  });

  it("reports a failed save without switching to an unsaved model", () => {
    render(<BuildVisualizer vehicleId="vehicle-1" buildId="build-1" />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    fireEvent.change(
      screen.getByRole("combobox", { name: "Free model library" }),
      { target: { value: "audi-r8" } },
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your visual changes could not be saved",
    );
    expect(screen.getByTestId("interactive-model")).toHaveAttribute(
      "data-model-id",
      "bmw-m3-e30",
    );
  });
});
