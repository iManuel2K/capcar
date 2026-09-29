import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { ConnectedBuildPlanner } from "./connected-build-planner";
import {
  createBuildItem,
  createStarterBuild,
  readBuildState,
} from "@/features/builds/build-storage";

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

function setup() {
  const build = createStarterBuild(
    {
      vehicleId: "vehicle",
      name: "OEM street",
      goal: "OEM+ daily",
      description: "A documented street build with a clear direction.",
      budget: 2_000,
    },
    {
      title: "Maintenance baseline",
      estimatedCost: 300,
      stage: "foundation",
      priority: "now",
    },
    localStorage,
  );
  createBuildItem(
    {
      buildId: build.id,
      title: "Wheel package",
      estimatedCost: 1_000,
      stage: "appearance",
      priority: "next",
    },
    localStorage,
  );
  const items = readBuildState(localStorage).items;
  render(<ConnectedBuildPlanner build={build} items={items} />);
  return build;
}

describe("ConnectedBuildPlanner", () => {
  it("shows the complete budget model and edits the build brief", () => {
    const build = setup();
    expect(screen.getByText("Build Planner 2.0 · Available now")).toBeDefined();
    expect(screen.getAllByText("€1,300.00")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Build name"), {
      target: { value: "Fast road" },
    });
    fireEvent.change(screen.getByLabelText("Overall budget · EUR"), {
      target: { value: "4500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save build brief" }));

    expect(screen.getByRole("status").textContent).toContain("updated");
    expect(
      readBuildState(localStorage).builds.find(
        (entry) => entry.id === build.id,
      ),
    ).toMatchObject({ name: "Fast road", budget: 4_500 });
  });

  it("keeps phase controls keyboard-addressable and explains empty allocation", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Move Foundation earlier" }),
    ).toBeDisabled();
    expect(screen.getAllByText("Not set")).toHaveLength(4);
  });
});
