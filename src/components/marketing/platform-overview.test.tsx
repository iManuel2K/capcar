import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformOverview } from "./platform-overview";
import { platformCopy } from "@/features/marketing/platform-copy";
import { locales } from "@/i18n/config";
import sitemap from "@/app/sitemap";
import styles from "./platform.module.css";
afterEach(cleanup);
describe("platform exploration", () => {
  it("keeps platform heading styles out of the shared footer", () => {
    render(<PlatformOverview />);
    const main = screen.getByRole("main");
    expect(main).toHaveClass(styles.page);
    const footer = screen.getByRole("contentinfo");
    expect(footer.closest(`.${styles.page}`)).toBeNull();
    expect(within(footer).getAllByRole("heading", { level: 2 })).toHaveLength(
      3,
    );
    for (const heading of within(footer).getAllByRole("heading", {
      level: 2,
    })) {
      expect(heading).toHaveClass(
        "text-xs",
        "font-semibold",
        "tracking-widest",
      );
    }
  });
  it("connects tool selection to its preview and real destination", () => {
    render(<PlatformOverview />);
    expect(screen.getAllByRole("tab")).toHaveLength(6);
    fireEvent.click(screen.getByRole("tab", { name: "Plan your build" }));
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAccessibleName("Plan your build");
    for (const value of ["€300", "€30", "€28"])
      expect(within(panel).getByText(value)).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: "Explore: Plan your build" }),
    ).toHaveAttribute("href", "/garage/new?goal=modify");
    fireEvent.click(screen.getByRole("tab", { name: "Concept Studio" }));
    expect(
      within(screen.getByRole("tabpanel")).getByText("Preview"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "80% concept",
    );
  });
  it("supports keyboard navigation and hero choices", () => {
    render(<PlatformOverview />);
    const garage = screen.getByRole("tab", { name: "Your garage" });
    fireEvent.keyDown(garage, { key: "End" });
    expect(screen.getByRole("tab", { name: "Roadbook" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Roadbook");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Roadbook" }), {
      key: "ArrowRight",
    });
    expect(garage).toHaveFocus();
    fireEvent.click(screen.getByRole("link", { name: "Maintain your car" }));
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(
      "Maintain your car",
    );
  });
  it("labels unbuilt capabilities and never writes sample choices to an account", () => {
    localStorage.clear();
    render(<PlatformOverview />);
    const future = screen
      .getByRole("heading", { name: "A more connected garage" })
      .closest("article")!;
    expect(within(future).getByText("Planned")).toBeInTheDocument();
    expect(future).toHaveTextContent("Direct merchant checkout");
    expect(within(future).queryByRole("button")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Passport" }));
    expect(localStorage.length).toBe(0);
  });
  it.each(locales)(
    "has complete %s content and a discoverable route",
    (locale) => {
      const c = platformCopy[locale];
      expect(Object.keys(c).sort()).toEqual(
        Object.keys(platformCopy.en).sort(),
      );
      expect(Object.values(c).every((s) => s.trim().length > 0)).toBe(true);
      expect(
        sitemap().find(
          (e) =>
            e.url ===
            `https://capcar.dev${locale === "en" ? "" : `/${locale}`}/platform`,
        ),
      ).toBeTruthy();
      render(<PlatformOverview locale={locale} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        c.title,
      );
    },
  );
});
