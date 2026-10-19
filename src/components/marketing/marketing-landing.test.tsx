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
import { ProductDashboardPreview } from "./product-dashboard-preview";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { BuildTransformation } from "./build-transformation";

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

  const renderInteractiveDemo = () => render(<ProductDashboardPreview />);

  it("makes the product and its capability limits clear", async () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Your car. Every idea, job and journey in one place.",
    );
    expect(
      await screen.findByText(/Interactive example · Illustrative data/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verified builder")).not.toBeInTheDocument();
    expect(
      screen.getAllByText(
        "Explore without an account. Create one when you’re ready to save your own car.",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Maintain your car" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plan your build" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Find your next drive" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Plan a maintenance task/ }),
    ).toHaveAttribute("href", "/garage/new?goal=maintain");
    expect(
      screen.getByRole("link", { name: /Start a build plan/ }),
    ).toHaveAttribute("href", "/garage/new?goal=modify");
    expect(
      screen.getByText(
        /AI trip planning requires an account and a connected AI service/,
      ),
    ).toBeInTheDocument();
    expect(document.querySelector("video")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
    const actions = screen.getByTestId("hero-actions");
    expect(
      within(actions).getByRole("link", { name: /Create your garage/ }),
    ).toHaveAttribute("href", "/garage/new");
    expect(
      within(actions).getByRole("link", { name: /Explore an example garage/ }),
    ).toHaveAttribute("href", "#live-demo");
    expect(
      screen
        .getAllByRole("link", { name: /Create your garage/ })
        .every((link) => link.getAttribute("href") === "/garage/new"),
    ).toBe(true);
  });

  it("connects the chosen part, estimated budget and planned passport record", () => {
    renderInteractiveDemo();
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
    expect(screen.getByText("Digital vehicle passport")).toBeInTheDocument();
    expect(screen.getAllByText("2011 BMW 318i").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Planned part · Not installed"),
    ).toBeInTheDocument();
    expect(screen.getByText("Rear lighting · €225")).toBeInTheDocument();
    expect(screen.getByText("€47")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove from the example" }),
    );
    expect(screen.queryByText("Rear lighting · €225")).not.toBeInTheDocument();
    expect(screen.getByText("€272")).toBeInTheDocument();
  });

  it("does not present an incomplete price as a final budget balance", () => {
    renderInteractiveDemo();
    fireEvent.click(screen.getByRole("tab", { name: "Parts comparison" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Select this example" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Vehicle Passport" }));
    expect(screen.getByText("€195 + ?")).toBeInTheDocument();
    expect(screen.queryByText("€77")).not.toBeInTheDocument();
    expect(screen.getByText("Shipping: Not provided")).toBeInTheDocument();
  });

  it("supports keyboard tabs and replaces one modification instead of duplicating it", () => {
    renderInteractiveDemo();
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
    renderInteractiveDemo();
    expect(
      screen.getByRole("tab", { name: "Vehicle Passport" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Digital vehicle passport")).toBeInTheDocument();
  });

  it("uses a native comparison range and a working mobile menu", () => {
    renderPage();
    render(<BuildTransformation />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(slider).toHaveAttribute("aria-valuetext", "75% concept");
    expect(slider).toHaveAttribute("dir", "ltr");
    const comparison = slider.closest("figure");
    expect(
      comparison?.querySelector('div[aria-hidden="true"][style*="clip-path"]'),
    ).toHaveStyle({ clipPath: "inset(0 25% 0 0)" });
    expect(
      comparison?.querySelector('span[aria-hidden="true"][style*="left"]'),
    ).toHaveStyle({ left: "75%" });
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Mobile navigation" });
    expect(
      within(drawer).getByRole("link", { name: "Find parts" }),
    ).toHaveAttribute("href", "/parts-search");
    const explore = within(drawer).getByText("Explore", {
      selector: "summary",
    });
    expect(explore.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(explore);
    expect(explore.closest("details")).toHaveAttribute("open");
    expect(
      within(drawer).getByRole("link", { name: "Roadbook" }),
    ).toHaveAttribute("href", "/roadbook");
    fireEvent.click(
      within(drawer).getByRole("button", { name: "Close navigation" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
