import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingLanding } from "@/components/marketing/marketing-landing";

describe("MarketingLanding", () => {
  it("states the product direction", () => {
    render(<MarketingLanding />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /build the car.*you planned/i,
    );
    expect(screen.getByText("Buy the right part.")).toBeInTheDocument();
    expect(screen.getByText("€804 spent")).toBeInTheDocument();
    expect(screen.getByText("From Plan to Road. No Guesswork.")).toBeInTheDocument();
    expect(screen.getByText("Beta · Current")).toBeInTheDocument();
  });

  it("provides direct routes into the garage", () => {
    render(<MarketingLanding />);
    const garageLinks = screen.getAllByRole("link", {
      name: /start your garage|start free|start with your car/i,
    });
    expect(
      garageLinks.some((link) => link.getAttribute("href") === "/register"),
    ).toBe(true);
  });

  it("shows interactive fitment outcomes", () => {
    render(<MarketingLanding />);
    expect(screen.getByText("Direct Bolt-On")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /m-style rear wing/i }));
    expect(screen.getByText("Modification Required")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /f30 front brake kit/i }),
    );
    expect(screen.getByText("Incompatible")).toBeInTheDocument();
  });

  it("slides between the current car and planned vision", () => {
    render(<MarketingLanding />);
    const slider = screen.getByRole("slider", {
      name: /compare current car with vision/i,
    });

    expect(slider).toHaveAttribute("aria-valuenow", "52");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "54");
  });
});
