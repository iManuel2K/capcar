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
  it("focuses a linked error summary and clears only the field being corrected", () => {
    render(<GarageOnboarding />);
    fireEvent.submit(
      screen.getByRole("button", { name: "Continue" }).closest("form")!,
    );
    expect(
      screen.getByRole("alert", { name: "Check these details" }),
    ).toHaveFocus();
    const make = document.getElementById("setup-make")!;
    expect(make).toHaveAttribute("aria-invalid", "true");
    expect(make).toHaveAttribute("aria-describedby", "setup-make-error");
    fireEvent.click(
      screen.getByRole("link", {
        name: "Enter a make with at least 2 characters.",
      }),
    );
    expect(make).toHaveFocus();
    fireEvent.change(make, { target: { value: "BMW" } });
    expect(make).toHaveAttribute("aria-invalid", "false");
    expect(document.getElementById("setup-model")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(localStorage.getItem("capcar.vehicles.v1")).toBeNull();
  });
  it("opens a hidden optional field from its error link and keeps the entered car", () => {
    const draft = {
      ...emptyOnboardingDraft(),
      make: "BMW",
      model: "318i",
      productionYear: "2011",
      engineCode: "X",
    };
    localStorage.setItem(draftKey(null), JSON.stringify(draft));
    render(<GarageOnboarding />);
    fireEvent.submit(
      screen.getByRole("button", { name: "Continue" }).closest("form")!,
    );
    fireEvent.click(
      screen.getByRole("link", {
        name: "Use at least 2 characters for the engine code, or leave it blank.",
      }),
    );
    const engine = document.getElementById("setup-engineCode")!;
    expect(engine.closest("details")).toHaveAttribute("open");
    expect(engine).toHaveFocus();
    fireEvent.change(engine, { target: { value: "N43" } });
    fireEvent.submit(
      screen.getByRole("button", { name: "Continue" }).closest("form")!,
    );
    expect(
      screen.getByRole("heading", { name: "What brings you here?" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(draftKey(null))!).model).toBe(
      "318i",
    );
  });
  it("explains an empty car search and rejects a negative action estimate inline", () => {
    render(<GarageOnboarding />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzzz-no-match" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "No cars match your search",
    );
    cleanup();
    localStorage.setItem(
      draftKey(null),
      JSON.stringify({
        ...emptyOnboardingDraft(),
        step: "action",
        goal: "modify",
        make: "BMW",
        model: "318i",
        productionYear: "2011",
        title: "Suspension plan",
        estimate: "-4",
      }),
    );
    render(<GarageOnboarding />);
    fireEvent.submit(
      screen.getByRole("button", { name: "Continue" }).closest("form")!,
    );
    expect(
      screen.getByRole("alert", { name: "Check these details" }),
    ).toHaveFocus();
    expect(document.getElementById("setup-estimate")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(document.getElementById("setup-title")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
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
