import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoadmapPage } from "@/components/marketing/roadmap-page";

describe("RoadmapPage", () => {
  it("explains the current and future product direction", () => {
    render(<RoadmapPage />);

    expect(
      screen.getByRole("heading", { name: "Where Capcar is going." }),
    ).toBeInTheDocument();
    expect(screen.getByText("The foundation")).toBeInTheDocument();
    expect(screen.getByText("Make it tangible")).toBeInTheDocument();
    expect(screen.getByText("Beyond the car")).toBeInTheDocument();
    expect(screen.getByText("Interactive vehicle models")).toBeInTheDocument();
    expect(screen.getByText("Motorcycles and bicycles")).toBeInTheDocument();
  });
});
