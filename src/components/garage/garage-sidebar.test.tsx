import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GarageShell } from "./garage-shell";

const route = vi.hoisted(() => ({ pathname: "/garage/bmw" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({
    vehicles: [
      {
        id: "bmw",
        productionYear: 2011,
        make: "BMW",
        model: "318i",
        platform: "E90",
        engineCode: "N43",
      },
    ],
  }),
}));
vi.mock("@/features/notifications/use-notifications", () => ({
  useNotifications: () => [],
}));
vi.mock("@/components/builds/price-watch-monitor", () => ({
  PriceWatchMonitor: () => null,
}));
vi.mock("@/components/parts/global-parts-search", () => ({
  GlobalPartsSearch: () => null,
}));
vi.mock("@/components/i18n/language-selector", () => ({
  LanguageSelector: () => null,
}));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));
afterEach(() => {
  cleanup();
  route.pathname = "/garage/bmw";
});
const shell = () =>
  render(
    <GarageShell>
      <h1>Vehicle content</h1>
    </GarageShell>,
  );

describe("selected vehicle sidebar", () => {
  it("keeps links scoped to the selected car and matches nested routes", () => {
    route.pathname = "/garage/bmw/builds/project";
    const view = shell();
    const nav = screen.getByRole("navigation", {
      name: "Active vehicle navigation",
    });
    expect(within(nav).getByRole("link", { name: "Builds" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Overview" }),
    ).not.toHaveAttribute("aria-current");
    route.pathname = "/garage/ford/parts";
    view.rerender(<GarageShell>Vehicle content</GarageShell>);
    expect(screen.getByRole("link", { name: /^Parts$/ })).toHaveAttribute(
      "href",
      "/garage/ford/parts",
    );
    expect(screen.getByRole("link", { name: /^Parts$/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
  it("opens tools for a deep-linked tool and makes collapsed links inert", () => {
    route.pathname = "/garage/bmw/guides/a-guide";
    shell();
    const toggle = screen.getByRole("button", { name: "More vehicle tools" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Guides" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById(toggle.getAttribute("aria-controls")!),
    ).toHaveAttribute("inert");
  });
  it("resizes with buttons and keyboard, clamps bounds and preserves width across routes", () => {
    const view = shell();
    const handle = screen.getByRole("separator", { name: "Sidebar width" });
    fireEvent.click(screen.getByRole("button", { name: "Wider sidebar" }));
    expect(handle).toHaveAttribute("aria-valuenow", "296");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle).toHaveAttribute("aria-valuenow", "360");
    expect(
      screen.getByRole("button", { name: "Wider sidebar" }),
    ).toBeDisabled();
    fireEvent.keyDown(handle, { key: "Home" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(handle).toHaveAttribute("aria-valuenow", "240");
    route.pathname = "/garage/bmw/parts";
    view.rerender(<GarageShell>Vehicle content</GarageShell>);
    expect(handle).toHaveAttribute("aria-valuenow", "240");
    expect(view.container.firstElementChild).toHaveStyle({
      "--garage-sidebar-width": "240px",
    });
  });
  it("does not show vehicle tools or resize controls before choosing a car", () => {
    route.pathname = "/garage";
    shell();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Active vehicle navigation" }),
    ).not.toBeInTheDocument();
  });
  it("keeps the mobile drawer dismissal and focus return", () => {
    shell();
    const trigger = screen.getByRole("button", {
      name: "Open garage navigation",
    });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: "Mobile garage navigation",
    });
    expect(
      within(dialog).getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("href", "/garage/bmw");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close garage navigation" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
