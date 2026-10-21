import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  connection: vi.fn(),
  admin: vi.fn(),
}));
vi.mock("@/lib/supabase/current-user", () => ({ currentUser: mocks.user }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/features/connections/ai-connection", () => ({
  getAiConnection: mocks.connection,
}));
vi.mock("@/components/trips/trip-planner", () => ({
  TripPlanner: () => <div>Private trip planner</div>,
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  usePathname: () => "/ai",
}));

import AIPlannerPage from "./page";
import { AIPlannerPreview } from "@/components/marketing/ai-planner-preview";
import { aiPreviewCopy } from "@/features/marketing/ai-preview-copy";
import { locales } from "@/i18n/config";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue(null);
});
afterEach(cleanup);

describe("public AI discovery and private planning", () => {
  it("shows a useful example without reading private AI connection data", async () => {
    render(await AIPlannerPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      aiPreviewCopy.en.title,
    );
    expect(screen.getByText(aiPreviewCopy.en.prompt)).toBeVisible();
    expect(screen.getByText(aiPreviewCopy.en.note)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Plan my first drive/ }),
    ).toHaveAttribute("href", "/register?next=%2Fai");
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.connection).not.toHaveBeenCalled();
    expect(screen.queryByText("Private trip planner")).not.toBeInTheDocument();
  });

  it("preserves the journal destination through sign-in", async () => {
    render(
      await AIPlannerPage({
        searchParams: Promise.resolve({
          journal: "ruesselsheim-rheingau-tagesausflug",
          vehicle: "my-car",
        }),
      }),
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?next=%2Fai%3Fjournal%3Druesselsheim-rheingau-tagesausflug%26vehicle%3Dmy-car",
    );
  });

  it("keeps connected owners in the working trip planner", async () => {
    mocks.user.mockResolvedValue({ id: "owner" });
    mocks.connection.mockResolvedValue({ provider: "gemini" });
    render(await AIPlannerPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Private trip planner")).toBeVisible();
    expect(mocks.connection).toHaveBeenCalledWith(
      mocks.admin.mock.results[0].value,
      "owner",
    );
  });

  it("keeps provider setup for signed-in owners who have not connected AI", async () => {
    mocks.user.mockResolvedValue({ id: "owner" });
    mocks.connection.mockResolvedValue(null);
    await expect(
      AIPlannerPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("redirect:/account/connections?next=%2Fai");
  });

  it.each(locales)("renders a complete %s preview", (locale) => {
    expect(Object.keys(aiPreviewCopy[locale]).sort()).toEqual(
      Object.keys(aiPreviewCopy.en).sort(),
    );
    render(<AIPlannerPreview locale={locale} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      aiPreviewCopy[locale].title,
    );
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(7);
  });
});
