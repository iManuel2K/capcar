import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpandableNavigation } from "./expandable-navigation";

const route = vi.hoisted(() => ({ pathname: "/roadbook" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));
const sections = [
  {
    label: "Your garage",
    description: "Plan your next job.",
    links: [
      { href: "/garage", label: "Open garage" },
      { href: "/connected-parts", label: "Find parts" },
    ],
  },
  {
    label: "Drives",
    description: "Find your next drive.",
    links: [
      { href: "/roadbook", label: "Roadbook" },
      { href: "/ai", label: "AI planner" },
    ],
  },
  {
    label: "Explore",
    description: "Tools for your build.",
    links: [{ href: "/studio", label: "Studio" }],
  },
];
beforeEach(() => {
  route.pathname = "/roadbook";
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("motion navigation interaction", () => {
  it("opens a labelled disclosure, switches sections and marks the current page", async () => {
    render(<ExpandableNavigation sections={sections} />);
    const garage = screen.getByRole("button", { name: "Your garage" });
    fireEvent.click(garage);
    const panel = screen.getByRole("region", { name: "Your garage" });
    expect(garage).toHaveAttribute("aria-controls", panel.id);
    expect(
      within(panel).getByRole("link", { name: "Open garage" }),
    ).toHaveAttribute("href", "/garage");
    fireEvent.click(screen.getByRole("button", { name: "Drives" }));
    expect(screen.getByRole("button", { name: "Drives" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Roadbook" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Your garage" })).toBeNull(),
    );
  });
  it("supports arrow, Home and End navigation and Escape restores trigger focus", async () => {
    render(<ExpandableNavigation sections={sections} />);
    const garage = screen.getByRole("button", { name: "Your garage" });
    const drives = screen.getByRole("button", { name: "Drives" });
    const explore = screen.getByRole("button", { name: "Explore" });
    fireEvent.click(garage);
    fireEvent.keyDown(garage, { key: "ArrowRight" });
    expect(drives).toHaveFocus();
    expect(drives).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(drives, { key: "End" });
    expect(explore).toHaveFocus();
    fireEvent.keyDown(explore, { key: "Home" });
    expect(garage).toHaveFocus();
    fireEvent.keyDown(garage, { key: "ArrowLeft" });
    expect(explore).toHaveFocus();
    fireEvent.keyDown(explore, { key: "Escape" });
    expect(explore).toHaveFocus();
    expect(explore).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });
  it("moves into links with vertical arrows and closes when a link is selected", async () => {
    render(<ExpandableNavigation sections={sections} />);
    const garage = screen.getByRole("button", { name: "Your garage" });
    fireEvent.keyDown(garage, { key: "ArrowDown" });
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Open garage" })).toHaveFocus(),
    );
    fireEvent.keyDown(garage, { key: "ArrowUp" });
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Find parts" })).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole("link", { name: "Find parts" }));
    expect(garage).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });
  it("closes on outside interaction and when focus leaves the navigation", async () => {
    render(
      <>
        <ExpandableNavigation sections={sections} />
        <button>Outside</button>
      </>,
    );
    const garage = screen.getByRole("button", { name: "Your garage" });
    fireEvent.click(garage);
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(garage).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(garage);
    act(() => garage.focus());
    act(() => screen.getByRole("button", { name: "Outside" }).focus());
    expect(garage).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });
  it("does not retain an open dropdown after a route change", () => {
    const { rerender } = render(<ExpandableNavigation sections={sections} />);
    fireEvent.click(screen.getByRole("button", { name: "Drives" }));
    route.pathname = "/studio";
    rerender(<ExpandableNavigation sections={sections} />);
    expect(screen.getByRole("button", { name: "Drives" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
