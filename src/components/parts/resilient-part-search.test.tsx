import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("@/features/retail/search-client", async (original) => ({
  ...(await original<typeof import("@/features/retail/search-client")>()),
  requestRetail: request,
}));
import { ResilientPartSearch } from "./resilient-part-search";
const empty = {
  source: "ebay",
  checkedAt: "2026-09-10T12:00:00Z",
  hasMore: false,
  warning: "Check fitment",
  items: [],
};
beforeEach(() => {
  vi.useFakeTimers();
  request.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("debounces a typing burst and shows a useful empty state", async () => {
  request.mockResolvedValue(empty);
  render(<ResilientPartSearch />);
  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "E9" } });
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(request).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "E90" } });
  fireEvent.change(input, { target: { value: "E90 brakes" } });
  expect(screen.getByRole("button", { name: "Searching…" })).toBeDisabled();
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0].query).toBe("E90 brakes");
  expect(screen.getByText(/No listings for this search/)).toBeInTheDocument();
});
it("aborts superseded searches and ignores late results", async () => {
  let finish: (value: unknown) => void = () => undefined;
  request
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue(empty);
  render(<ResilientPartSearch />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "old" } });
  await act(() => vi.advanceTimersByTimeAsync(500));
  const signal = request.mock.calls[0][1] as AbortSignal;
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "new" } });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    finish({ ...empty, warning: "Stale old result" });
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(screen.queryByText("Stale old result")).not.toBeInTheDocument();
});
it("times out a stalled request and enables an explicit retry", async () => {
  request.mockImplementation(
    (_input, signal: AbortSignal) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        ),
      ),
  );
  render(<ResilientPartSearch />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "E90" } });
  await act(() => vi.advanceTimersByTimeAsync(25_500));
  expect(screen.getByRole("alert")).toHaveTextContent("took too long");
  expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
});
