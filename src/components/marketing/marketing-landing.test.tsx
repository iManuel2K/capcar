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
      "Keep your car's plans and history together.",
    );
    expect(
      await screen.findByText(/Interactive example · Illustrative data/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verified builder")).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Explore freely. Create an account to save your car.")
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Maintain your car" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Plan a maintenance task/ }),
    ).toHaveAttribute("href", "/car-maintenance-tracker");
    expect(
      screen.getByRole("heading", { name: "Plan your build" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start a build plan/ }),
    ).toHaveAttribute("href", "/project-car-planner");
    expect(
      screen.getByRole("heading", { name: "Find your next drive" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /AI trip planning requires an account and a connected AI service/,
      ),
    ).toBeVisible();
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

  it("shows all three editorial use cases without requiring tab interaction", () => {
    renderPage();
    expect(
      screen.queryByRole("tab", { name: "Maintain your car" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Plan a maintenance task/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Start a build plan/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Find your next drive" }),
    ).toBeVisible();
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
    expect(
      screen.getByText("Replace the cabin filter · €30"),
    ).toBeInTheDocument();
    expect(screen.getByText("€270")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove from the example" }),
    );
    expect(
      screen.queryByText("Replace the cabin filter · €30"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("€300").length).toBeGreaterThan(0);
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
    expect(screen.getByText("€28 + ?")).toBeInTheDocument();
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
    expect(screen.getAllByText("€0")).toHaveLength(2);
  });

  it("records and reopens the example job without duplicate costs or saved owner records", () => {
    renderInteractiveDemo();
    fireEvent.click(screen.getByRole("tab", { name: "Parts comparison" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Add to the example plan" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Vehicle Passport" }));
    const amount = (label: string) =>
      screen.getByText(label, { selector: "dt" }).nextElementSibling
        ?.textContent;
    expect(amount("Spent")).toBe("€0");
    expect(amount("Planned")).toBe("€30");
    fireEvent.click(
      screen.getByRole("button", { name: "Record completed work" }),
    );
    expect(amount("Spent")).toBe("€28");
    expect(amount("Planned")).toBe("€0");
    expect(amount("Unallocated")).toBe("€272");
    expect(
      screen.queryByText("Planned part · Not installed"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Recorded · Actual spending: €28")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Undo completion" }));
    expect(amount("Spent")).toBe("€0");
    expect(amount("Planned")).toBe("€30");
    fireEvent.click(
      screen.getByRole("button", { name: "Record completed work" }),
    );
    expect(amount("Spent")).toBe("€28");
    expect(screen.getAllByText("Recorded · Actual spending: €28")).toHaveLength(
      1,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset example" }));
    expect(amount("Spent")).toBe("€0");
    expect(amount("Planned")).toBe("€0");
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
    const slider = screen.getByRole("slider");
    fireEvent.click(screen.getByRole("button", { name: "Concept direction" }));
    expect(slider).toHaveValue("100");
    fireEvent.click(screen.getByRole("button", { name: "Starting point" }));
    expect(slider).toHaveValue("0");
    fireEvent.click(screen.getByRole("button", { name: "50 / 50" }));
    expect(slider).toHaveValue("50");
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
    ).toHaveAttribute("href", "/connected-parts");
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
