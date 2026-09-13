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
    expect(
      screen.getByText("Direction without fake deadlines."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Make it tangible" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Native OBD-II diagnostics")).toBeInTheDocument();
    expect(screen.getByText("Beta hardening")).toBeInTheDocument();
    expect(screen.getByText("Interactive vehicle models")).toBeInTheDocument();
    expect(screen.getByText("Events worth driving to")).toBeInTheDocument();
    expect(screen.getByText("Motorcycles and bicycles")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "Roadmap" })
        .some((link) => link.getAttribute("href") === "/roadmap"),
    ).toBe(true);
    expect(
      screen.getByText("What is Capcar trying to solve?"),
    ).toBeInTheDocument();
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

  it("keeps mobile hero actions below the vehicle artwork", () => {
    render(<MarketingLanding />);

    const mobileActions = screen.getByTestId("mobile-hero-actions");
    expect(mobileActions).toHaveClass("sm:hidden");
    expect(
      mobileActions.querySelector('a[href="/register"]'),
    ).toHaveTextContent("Open your garage");
    expect(
      mobileActions.querySelector('a[href="#live-demo"]'),
    ).toHaveTextContent("Live demo");
  });

  it("labels horizontal showcases for keyboard users", () => {
    render(<MarketingLanding />);

    expect(
      screen.getByLabelText("Vehicle detail image carousel"),
    ).toHaveAttribute("tabindex", "0");
    expect(screen.getByLabelText("Community build carousel")).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#main-content");
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

  it("opens mobile navigation", () => {
    render(<MarketingLanding />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("dialog", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
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
