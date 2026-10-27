import { afterEach, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { signInPhotos } from "@/components/auth/sign-in-photos";

const random = vi.hoisted(() => ({ index: 0 }));
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  const randomInt = () => random.index;
  return { ...actual, default: { ...actual, randomInt }, randomInt };
});

vi.mock("@/features/auth/auth-config", () => ({
  getAuthStatus: () => ({ configured: false }),
}));
afterEach(() => vi.restoreAllMocks());

it.each([0, 1, 2, 3, 4])(
  "can choose approved photo %i for a request",
  async (index) => {
    random.index = index;
    const page = await LoginPage({
      searchParams: Promise.resolve({ next: "/garage/journal" }),
    });
    expect(page.props.photo).toEqual(signInPhotos[index]);
    expect(page.props.nextPath).toBe("/garage/journal");
  },
);
