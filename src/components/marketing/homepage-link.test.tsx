import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const track = vi.hoisted(() => vi.fn());
vi.mock("@/features/analytics/client", () => ({ trackAnalytics: track }));
import { HomepageLink } from "./homepage-link";
afterEach(() => {
  cleanup();
  track.mockClear();
});
describe("homepage action measurement", () => {
  it("measures primary and use-case clicks without collecting visible content or URLs", () => {
    render(
      <>
        <HomepageLink href="/garage/new" placement="hero">
          Create your garage
        </HomepageLink>
        <HomepageLink href="/garage/new?goal=modify" useCase="modify">
          Start a build plan
        </HomepageLink>
      </>,
    );
    fireEvent.click(screen.getByText("Create your garage"));
    fireEvent.click(screen.getByText("Start a build plan"));
    expect(track.mock.calls).toEqual([
      ["homepage_primary_cta_clicked", { placement: "hero" }],
      ["homepage_use_case_clicked", { use_case: "modify" }],
    ]);
  });
  it("records opening the isolated example but not an explicitly cancelled navigation", () => {
    render(
      <>
        <HomepageLink href="#live-demo" demo>
          Example
        </HomepageLink>
        <HomepageLink
          href="/garage/new"
          placement="hero"
          onClick={(event) => event.preventDefault()}
        >
          Cancelled
        </HomepageLink>
      </>,
    );
    fireEvent.click(screen.getByText("Example"));
    fireEvent.click(screen.getByText("Cancelled"));
    expect(track.mock.calls).toEqual([
      ["homepage_demo_engaged", { demo_action: "open" }],
    ]);
  });
});
