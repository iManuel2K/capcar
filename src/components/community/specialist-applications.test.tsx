import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SpecialistApplications } from "./specialist-applications";
vi.mock("@/features/auth/auth-config", () => ({
  getAuthStatus: () => ({ configured: false }),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const own = "00000000-0000-4000-8000-000000000001";
it("shows server failures without exposing internal response text", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(new Response("internal SQL detail", { status: 503 })),
  );
  render(<SpecialistApplications />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "could not be loaded",
  );
  expect(screen.queryByText(/internal SQL/)).not.toBeInTheDocument();
});
it("keeps pending applicants out of the review controls", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        userId: own,
        moderator: false,
        page: 0,
        hasMore: false,
        applications: [
          {
            id: own,
            user_id: own,
            business_name: "Independent Garage",
            city: "Berlin",
            website: "https://garage.example/",
            expertise: "BMW engine diagnostics and mechanical repairs",
            status: "pending",
            review_reason: null,
            created_at: "2026-09-13T10:00:00Z",
            updated_at: "2026-09-13T10:00:00Z",
          },
        ],
      }),
    ),
  );
  render(<SpecialistApplications />);
  expect(await screen.findByText("Independent Garage")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Record decision" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit for review" }),
  ).not.toBeInTheDocument();
});
it("loads older review pages using an explicit bounded request", async () => {
  const fetcher = vi.fn().mockImplementation(() =>
    Promise.resolve(
      Response.json({
        userId: own,
        moderator: true,
        page: 0,
        hasMore: true,
        applications: [],
      }),
    ),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<SpecialistApplications />);
  fireEvent.click(await screen.findByRole("button", { name: "Next" }));
  await waitFor(() =>
    expect(
      fetcher.mock.calls.some(([url]) => String(url).endsWith("page=1")),
    ).toBe(true),
  );
});
