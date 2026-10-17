import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";
const auth = vi.hoisted(() => ({
  signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
  getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth }) }));
afterEach(cleanup);
it("keeps the Journal destination in account-switch links and the email confirmation callback", async () => {
  const next = "/garage/journal?article=build-plan-first-job&locale=de";
  window.history.replaceState(
    {},
    "",
    `/register?next=${encodeURIComponent(next)}`,
  );
  render(<AuthForm mode="register" configured nextPath={next} />);
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    `/login?next=${encodeURIComponent(next)}`,
  );
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Example Owner" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "example@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
    target: { value: "example-password" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "example-password" },
  });
  for (const input of screen.getAllByRole("checkbox")) fireEvent.click(input);
  const form = screen
    .getByRole("button", { name: "Create account" })
    .closest("form")!;
  fireEvent.submit(form);
  await waitFor(() => expect(auth.signUp).toHaveBeenCalled());
  const options = auth.signUp.mock.calls[0] as unknown as [
    { options: { emailRedirectTo: string } },
  ];
  expect(
    new URL(options[0].options.emailRedirectTo).searchParams.get("next"),
  ).toBe(next);
});
