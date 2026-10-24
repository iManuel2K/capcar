import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { MarketingHeader } from "./marketing-header";

const auth = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  callback: undefined as
    undefined | ((event: AuthChangeEvent, session: Session | null) => void),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { onAuthStateChange: auth.subscribe } }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("./expandable-navigation", () => ({
  ExpandableNavigation: () => null,
}));
vi.mock("@/components/i18n/language-selector", () => ({
  LanguageSelector: () => null,
}));
vi.mock("@/components/parts/global-parts-search", () => ({
  GlobalPartsSearch: () => null,
}));

const session = { user: { id: "test-user" } } as Session;
function emit(event: AuthChangeEvent, value: Session | null) {
  act(() => auth.callback?.(event, value));
}
function openMobile() {
  fireEvent.click(
    document.querySelector<HTMLButtonElement>(
      'button[aria-controls="mobile-marketing-navigation"]',
    )!,
  );
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  auth.callback = undefined;
  auth.subscribe.mockReset();
  auth.unsubscribe.mockReset();
  auth.subscribe.mockImplementation((callback) => {
    auth.callback = callback;
    return { data: { subscription: { unsubscribe: auth.unsubscribe } } };
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("Navbar sign-in visibility", () => {
  it("does not flash Sign in while restoring a signed-in session", () => {
    render(<MarketingHeader />);
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Open garage" })).toBeNull();
    emit("INITIAL_SESSION", session);
    expect(screen.getByRole("link", { name: "Open garage" })).toHaveAttribute(
      "href",
      "/garage",
    );
    openMobile();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Create your garage" }),
    ).toBeNull();
    for (const link of screen.getAllByRole("link", { name: "Open garage" })) {
      expect(link).toHaveAttribute("href", "/garage");
    }
    expect(screen.getAllByRole("link", { name: "Open garage" })).toHaveLength(
      2,
    );
    expect(auth.subscribe).toHaveBeenCalledOnce();
  });
  it("updates both desktop and open mobile navigation on sign-in, refresh and sign-out", () => {
    render(<MarketingHeader />);
    emit("INITIAL_SESSION", null);
    openMobile();
    expect(screen.getAllByRole("link", { name: "Sign in" })).toHaveLength(2);
    for (const link of screen.getAllByRole("link", {
      name: "Create your garage",
    })) {
      expect(link).toHaveAttribute("href", "/garage/new");
    }
    emit("SIGNED_IN", session);
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Open garage" })).toHaveLength(
      2,
    );
    emit("TOKEN_REFRESHED", session);
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Open garage" })).toHaveLength(
      2,
    );
    emit("SIGNED_OUT", null);
    expect(screen.getAllByRole("link", { name: "Sign in" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Open garage" })).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "Create your garage" }),
    ).toHaveLength(2);
  });
  it("keeps the signed-out links in local mode without creating an auth subscription", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    render(<MarketingHeader />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    openMobile();
    expect(screen.getAllByRole("link", { name: "Sign in" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Open garage" })).toBeNull();
    expect(auth.subscribe).not.toHaveBeenCalled();
  });
  it("puts the garage action before navigation and returns focus after selection", () => {
    render(<MarketingHeader />);
    emit("INITIAL_SESSION", null);
    const opener = screen.getByRole("button", { name: "Open navigation" });
    opener.focus();
    openMobile();
    const dialog = screen.getByRole("dialog");
    const primary = within(dialog).getByRole("link", {
      name: "Create your garage",
    });
    const navigation = within(dialog).getByRole("navigation");
    expect(
      primary.compareDocumentPosition(navigation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(primary);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
  it("unsubscribes when the navbar unmounts", () => {
    const { unmount } = render(<MarketingHeader />);
    unmount();
    expect(auth.unsubscribe).toHaveBeenCalledOnce();
  });
});
