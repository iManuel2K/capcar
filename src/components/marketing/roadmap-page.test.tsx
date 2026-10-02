import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoadmapPage } from "@/components/marketing/roadmap-page";

describe("RoadmapPage", () => {
  it("explains the current and future product direction", () => {
    render(<RoadmapPage />);

    expect(
      screen.getByRole("heading", { name: "Where CapCar is going." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The foundation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beta hardening" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Make it tangible" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beyond the car" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Interactive vehicle models")).toBeInTheDocument();
    expect(screen.getByText("Community marketplace")).toBeInTheDocument();
    expect(screen.getByText("Direct merchant checkout")).toBeInTheDocument();
    expect(screen.getByText("Motorcycles and bicycles")).toBeInTheDocument();
    expect(screen.getByText("AI scenic weekend planning")).toBeInTheDocument();
    expect(screen.getByText("Calendar and mail sync")).toBeInTheDocument();
    expect(screen.getAllByText("31").length).toBeGreaterThan(0);
  });
});
