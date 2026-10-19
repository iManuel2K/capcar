import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import {
  draftKey,
  emptyOnboardingDraft,
} from "@/features/onboarding/onboarding";
const mocks = vi.hoisted(() => ({
  account: { configured: true, userId: "" },
  track: vi.fn(),
}));
vi.mock("@/components/account/garage-account-boundary", () => ({
  useGarageAccount: () => mocks.account,
}));
vi.mock("@/features/analytics/client", () => ({ trackAnalytics: mocks.track }));
vi.mock("next-intl", () => ({ useLocale: () => "en" }));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span data-image={src}>{alt}</span>
  ),
}));
import { GarageOnboarding } from "./garage-onboarding";
beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  mocks.account = { configured: true, userId: "" };
  mocks.track.mockClear();
});
describe("garage onboarding UI", () => {
  it("seeds a homepage goal only for a fresh draft and preserves an interrupted choice", () => {
    const view = render(<GarageOnboarding initialGoal="modify" />);
    expect(JSON.parse(localStorage.getItem(draftKey(null))!).goal).toBe(
      "modify",
    );
    view.unmount();
    render(<GarageOnboarding initialGoal="maintain" />);
    expect(JSON.parse(localStorage.getItem(draftKey(null))!).goal).toBe(
      "modify",
    );
  });
  it("shows an example before asking for personal information without adding sample vehicles", () => {
    render(<GarageOnboarding />);
    fireEvent.click(
      screen.getByRole("button", { name: "Explore example garage" }),
    );
    expect(
      screen.getByRole("region", { name: "Example garage" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("capcar.vehicles.v1")).toBeNull();
    expect(
      screen.getByRole("link", { name: /Explore the interactive example/ }),
    ).toHaveAttribute("href", "/#live-demo");
  });
  it("restores an explicit guest authentication handoff even under React Strict Mode", () => {
    const draft = {
      ...emptyOnboardingDraft(),
      step: "save",
      make: "BMW",
      model: "318i",
      productionYear: "2011",
      goal: "maintain",
      title: "PRIVATE PERSONAL TASK",
    };
    localStorage.setItem(draftKey(null), JSON.stringify(draft));
    localStorage.setItem("capcar.onboarding-auth-handoff", draft.id);
    mocks.account.userId = "new-user";
    render(
      <StrictMode>
        <GarageOnboarding resumeId={draft.id} />
      </StrictMode>,
    );
    expect(
      screen.getByRole("heading", { name: "Your direction is ready." }),
    ).toBeInTheDocument();
    expect(screen.getByText("PRIVATE PERSONAL TASK")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save my garage" }));
    expect(
      screen.getByRole("heading", { name: "Saved to your private garage." }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("capcar.vehicles.v1")!),
    ).toHaveLength(1);
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain(
      "PRIVATE PERSONAL TASK",
    );
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("318i");
    expect(mocks.track).toHaveBeenCalledWith(
      "onboarding_activated",
      expect.objectContaining({ goal: "maintain", action_type: "maintenance" }),
    );
  });
  it("never imports a different signed-in account's private draft", () => {
    localStorage.setItem(
      draftKey("other-user"),
      JSON.stringify({
        ...emptyOnboardingDraft(),
        make: "PRIVATE-MAKE",
        step: "save",
      }),
    );
    mocks.account.userId = "this-user";
    render(<GarageOnboarding />);
    expect(
      screen.getByRole("heading", { name: "Start with your car." }),
    ).toBeInTheDocument();
    expect(screen.queryByText("PRIVATE-MAKE")).not.toBeInTheDocument();
  });
  it("preserves a guest draft through an interrupt and provides a safe sign-in return URL", () => {
    const draft = {
      ...emptyOnboardingDraft(),
      step: "save",
      make: "Ford",
      model: "Fiesta",
      productionYear: "2010",
      goal: "drives",
      title: "Sunday drive",
    };
    localStorage.setItem(draftKey(null), JSON.stringify(draft));
    render(<GarageOnboarding />);
    expect(
      screen.getByRole("link", { name: "Already have an account? Sign in" }),
    ).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(`/garage/new?resume=${draft.id}`)}`,
    );
    fireEvent(window, new Event("pagehide"));
    expect(mocks.track).toHaveBeenCalledWith(
      "onboarding_interrupted",
      expect.objectContaining({ step: "save" }),
    );
    expect(localStorage.getItem(draftKey(null))).toContain("Sunday drive");
  });
});
