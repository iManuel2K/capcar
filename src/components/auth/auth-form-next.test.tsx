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
  signInWithPassword: vi.fn(async () => ({
    data: { session: null },
    error: new Error("Invalid login credentials"),
  })),
  getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth }) }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("shows the five approved photos without losing entered credentials when browsing", () => {
  render(<AuthForm mode="login" configured={false} />);
  expect(
    screen.getByRole("link", { name: "Nejc Soklič / Unsplash" }),
  ).toHaveAttribute("href", "https://unsplash.com/photos/JUiftQpriyo");
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "owner@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
    target: { value: "example-password" },
  });
  for (const photographer of [
    "Abhinand Venugopal",
    "Frankie Cordoba",
    "Pedro Oliveira",
    "Sawyer Griffin",
    "Nejc Soklič",
  ]) {
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(
      screen.getByRole("link", { name: `${photographer} / Unsplash` }),
    ).toBeVisible();
    expect(screen.getByLabelText("Email")).toHaveValue("owner@example.com");
    expect(screen.getByLabelText("Password", { exact: true })).toHaveValue(
      "example-password",
    );
  }
  fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
  expect(
    screen.getByRole("link", { name: "Sawyer Griffin / Unsplash" }),
  ).toBeVisible();
});

it("submits the new sign-in form through existing auth and retains navigation and password controls", async () => {
  const next = "/garage/journal?locale=de";
  render(<AuthForm mode="login" configured nextPath={next} />);
  expect(
    screen.getByRole("link", { name: "Create an account" }),
  ).toHaveAttribute("href", `/register?next=${encodeURIComponent(next)}`);
  expect(
    screen.getByRole("link", { name: "Forgot password?" }),
  ).toHaveAttribute("href", "/forgot-password");
  const passwordInput = screen.getByLabelText("Password", { exact: true });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "owner@example.com" },
  });
  fireEvent.change(passwordInput, { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(passwordInput).toHaveAttribute("type", "text");
  fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
  expect(passwordInput).toHaveAttribute("type", "password");
  fireEvent.submit(
    screen.getByRole("button", { name: "Sign in" }).closest("form")!,
  );
  await waitFor(() =>
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "example-password",
    }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid login credentials",
  );
  expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
});

it("shows unavailable sign-in feedback without calling auth when unconfigured", async () => {
  render(<AuthForm mode="login" configured={false} />);
  fireEvent.submit(
    screen.getByRole("button", { name: "Sign in" }).closest("form")!,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Sign-in is temporarily unavailable.",
  );
  expect(auth.signInWithPassword).not.toHaveBeenCalled();
});
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
