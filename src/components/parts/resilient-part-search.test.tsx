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
it("sends selected retailer filters and can clear them", async () => {
  request.mockResolvedValue(empty);
  render(<ResilientPartSearch />);
  fireEvent.change(screen.getByLabelText("Condition"), {
    target: { value: "used" },
  });
  fireEvent.change(screen.getByLabelText("Result order"), {
    target: { value: "priceAsc" },
  });
  fireEvent.change(screen.getByLabelText("Minimum price"), {
    target: { value: "50" },
  });
  fireEvent.change(screen.getByLabelText("Maximum price"), {
    target: { value: "250" },
  });
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "E90 headlights" },
  });
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(request.mock.calls[0][0]).toMatchObject({
    condition: "used",
    sort: "priceAsc",
    minPrice: 50,
    maxPrice: 250,
    page: 0,
  });
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByLabelText("Condition")).toHaveValue("all");
  expect(screen.getByLabelText("Result order")).toHaveValue("bestMatch");
  expect(screen.getByLabelText("Minimum price")).toHaveValue(null);
  expect(screen.getByLabelText("Maximum price")).toHaveValue(null);
});
it("explains an invalid price range without sending a request", async () => {
  request.mockResolvedValue(empty);
  render(<ResilientPartSearch />);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "E90 wheels" },
  });
  fireEvent.change(screen.getByLabelText("Minimum price"), {
    target: { value: "500" },
  });
  fireEvent.change(screen.getByLabelText("Maximum price"), {
    target: { value: "100" },
  });
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Minimum price cannot exceed maximum price",
  );
  expect(request).not.toHaveBeenCalled();
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
it("keeps a failed search actionable with a safe retailer continuation", async () => {
  request.mockRejectedValue(
    new (await import("@/features/retail/search-client")).SearchFailure(
      "eBay authorization could not be reached. Try again shortly.",
    ),
  );
  render(<ResilientPartSearch />);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "2011 e90 rear lights" },
  });
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "temporarily unavailable",
  );
  expect(
    screen.getByRole("link", { name: /Continue this search on eBay/ }),
  ).toHaveAttribute(
    "href",
    "https://www.ebay.de/sch/i.html?_nkw=2011+e90+rear+lights",
  );
});

it("retains a project query when opening live retailer search", async () => {
  request.mockResolvedValue(empty);
  render(<ResilientPartSearch initialQuery="  BMW E90 rear lights  " />);
  expect(screen.getByRole("searchbox")).toHaveValue("BMW E90 rear lights");
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(request.mock.calls[0][0].query).toBe("BMW E90 rear lights");
});
