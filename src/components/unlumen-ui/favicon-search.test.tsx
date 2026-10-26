import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FaviconSearch, extractDomain, getFaviconUrl } from "./favicon-search";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";

// Verify input/loading behaviour independently of Motion's animation-frame scheduler.
vi.mock("motion/react", async (original) => ({
  ...(await original<typeof import("motion/react")>()),
  AnimatePresence: ({ children }: { children: import("react").ReactNode }) =>
    children,
  useReducedMotion: () => true,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it.each([
  ["https://www.ebay.de/itm/123?tracking=private#section", "ebay.de"],
  ["www.autodoc.de", "autodoc.de"],
  ["EBAY.COM", "ebay.com"],
  ["BMW E90 rear lamps", null],
  ["123.456", null],
  ["bmw.318i", null],
  ["https://localhost/item", null],
  ["https://10.0.0.1/item", null],
  ["https://garage.local", null],
  ["https://user:secret@ebay.de", null],
  ["ftp://ebay.de", null],
  ["user@example.com", null],
  ["https://-bad.com", null],
])("resolves only public website domains: %s", (input, expected) => {
  expect(extractDomain(input)).toBe(expected);
});

it("debounces favicon loading and falls back when the image fails", async () => {
  vi.useFakeTimers();
  const { container } = render(
    <FaviconSearch aria-label="Parts" clearLabel="Clear search" />,
  );
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "https://ebay.de/itm/123?private=value" },
  });
  expect(container.querySelector("img")).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(400));
  const image = container.querySelector("img")!;
  expect(image).toHaveAttribute("src", getFaviconUrl("ebay.de"));
  expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  fireEvent.error(image);
  expect(container.querySelector("img")).toBeNull();
});

it("preserves the named query and clears without submitting the parts form", () => {
  const { container } = render(
    <GlobalPartsSearch initialQuery="BMW E90 brakes" expanded />,
  );
  const input = screen.getByRole("searchbox");
  const form = container.querySelector("form")!;
  const submit = vi.fn();
  form.addEventListener("submit", submit);
  expect(new FormData(form).get("q")).toBe("BMW E90 brakes");
  expect(form).toHaveAttribute("action", "/connected-parts");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
  expect(submit).not.toHaveBeenCalled();
  expect(new FormData(form).get("q")).toBe("");
});
