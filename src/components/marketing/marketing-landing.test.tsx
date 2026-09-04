import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingLanding } from "@/components/marketing/marketing-landing";

describe("MarketingLanding", () => {
  it("states the product direction", () => {
    render(<MarketingLanding />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /your car/i,
    );
    expect(screen.getByText("Confidence before checkout.")).toBeInTheDocument();
  });

  it("provides direct routes into the garage", () => {
    render(<MarketingLanding />);
    const garageLinks = screen.getAllByRole("link", {
      name: /garage|start with your car|open capcar/i,
    });
    expect(
      garageLinks.some((link) => link.getAttribute("href") === "/garage"),
    ).toBe(true);
  });
});
