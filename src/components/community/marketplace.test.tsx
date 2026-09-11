import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Marketplace } from "./marketplace";

vi.mock("@/features/community/use-community", () => ({
  useCommunity: () => ({
    data: {
      userId: "buyer",
      roles: [],
      messages: [],
      reports: [],
      stamps: [],
      listings: ["selected", "other"].map((id) => ({
        id,
        seller_id: "seller",
        title: `${id} rear lights`,
        description: "Used lights with mounting tabs intact",
        city: "Frankfurt",
        price_cents: 10000,
        condition: "used",
        status: "published",
        created_at: "2026-09-10T00:00:00Z",
      })),
    },
    error: "",
    busy: false,
    refresh: vi.fn(),
    mutate: vi.fn(),
  }),
}));
afterEach(cleanup);
describe("marketplace continuation", () => {
  it("keeps the requested listing after sign-in and lets the buyer return to browsing", () => {
    render(<Marketplace initialListingId="selected" />);
    expect(
      screen.getByRole("heading", { name: "selected rear lights" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "other rear lights" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Browse all listings" }),
    );
    expect(
      screen.getByRole("heading", { name: "other rear lights" }),
    ).toBeInTheDocument();
  });
  it("explains an unavailable selected listing without inventing availability", () => {
    render(<Marketplace initialListingId="removed" />);
    expect(
      screen.getByText(/That listing is no longer available/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "selected rear lights" }),
    ).toBeNull();
  });
});
