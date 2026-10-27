import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

const route = vi.hoisted(() => ({ pathname: "/login" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("./marketing-header", () => ({
  MarketingHeader: () => <nav aria-label="Public navigation" />,
}));
afterEach(cleanup);

it("uses the dedicated login layout without public navigation", () => {
  route.pathname = "/login";
  render(<SiteHeader />);
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

it("keeps public navigation on other public pages", () => {
  route.pathname = "/platform";
  render(<SiteHeader />);
  expect(
    screen.getByRole("navigation", { name: "Public navigation" }),
  ).toBeVisible();
});
