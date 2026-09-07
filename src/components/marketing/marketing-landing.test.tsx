import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingLanding } from "@/components/marketing/marketing-landing";

describe("MarketingLanding", () => {
  it("states the product direction", () => {
    render(<MarketingLanding />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /build with clarity/i,
    );
    expect(screen.getByText("Buy the right part.")).toBeInTheDocument();
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

  it("switches between the current car and planned vision", () => {
    render(<MarketingLanding />);
    const current = screen.getByRole("button", { name: "current" });
    const vision = screen.getByRole("button", { name: "vision" });

    expect(current).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(vision);
    expect(vision).toHaveAttribute("aria-pressed", "true");
    expect(current).toHaveAttribute("aria-pressed", "false");
  });
});
