import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MarketingLanding } from "./marketing-landing";
import { MarketingHeader } from "./marketing-header";
import { SkipToContent } from "@/components/ui/skip-to-content";

beforeEach(() => window.history.replaceState(null, "", "/"));
afterEach(cleanup);

describe("the connected homepage example", () => {
  const renderPage = () =>
    render(
      <>
        <SkipToContent />
        <MarketingHeader />
        <MarketingLanding />
      </>,
    );

  it("makes the product and its capability limits clear", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Build the car you imagine.",
    );
    expect(
      screen.getByText(/Interactive example · Illustrative data/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verified builder")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
    const actions = screen.getByTestId("hero-actions");
    expect(
      within(actions).getByRole("link", { name: /Start a build/ }),
    ).toHaveAttribute("href", "/register");
    expect(
      within(actions).getByRole("link", { name: "Explore a project" }),
    ).toHaveAttribute("href", "#live-demo");
  });

  it("connects the chosen part, estimated budget and planned passport record", () => {
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: /Compare example offers/ }),
    );
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getAllByText("Fitment not confirmed")).toHaveLength(2);
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    expect(within(panel).getByRole("status")).toHaveTextContent(
      "Nothing purchased",
    );
    expect(
      screen.getByRole("button", { name: "Add to the example plan" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: "Vehicle Passport" }));
    expect(
      screen.getByText("Planned part · Not installed"),
    ).toBeInTheDocument();
    expect(screen.getByText("Rear lighting · €225")).toBeInTheDocument();
    expect(screen.getByText("€1,295")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove from the example" }),
    );
    expect(screen.queryByText("Rear lighting · €225")).not.toBeInTheDocument();
    expect(screen.getByText("€1,520")).toBeInTheDocument();
  });

  it("does not present an incomplete price as a final budget balance", () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: "Parts comparison" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Select this example" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Vehicle Passport" }));
    expect(screen.getByText("€195 + ?")).toBeInTheDocument();
    expect(screen.queryByText("€1,325")).not.toBeInTheDocument();
    expect(screen.getByText("Shipping: Not provided")).toBeInTheDocument();
  });

  it("supports keyboard tabs and replaces one modification instead of duplicating it", () => {
    renderPage();
    const plan = screen.getByRole("tab", { name: "Build plan" });
    fireEvent.keyDown(plan, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Parts comparison" })).toHaveFocus();
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select this example" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Vehicle Passport" }));
    expect(screen.getAllByText("Planned part · Not installed")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Reset example" }));
    expect(screen.getByRole("tab", { name: "Build plan" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("€0")).toBeInTheDocument();
  });

  it("opens a direct view from a section link", () => {
    window.history.replaceState(null, "", "#demo-history");
    renderPage();
    expect(
      screen.getByRole("tab", { name: "Vehicle Passport" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("A record worth keeping.")).toBeInTheDocument();
  });

  it("uses a native comparison range and a working mobile menu", () => {
    renderPage();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(slider).toHaveAttribute("aria-valuetext", "75% concept");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Mobile navigation" });
    expect(
      within(drawer).getByRole("link", { name: "Find parts" }),
    ).toHaveAttribute("href", "/parts-search");
    fireEvent.click(
      within(drawer).getByRole("button", { name: "Close navigation" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
