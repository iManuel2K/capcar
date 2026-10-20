import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GarageSyncNotice } from "./garage-sync-notice";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("garage sync feedback", () => {
  it("removes success after three seconds and shows the next save result again", () => {
    vi.useFakeTimers();
    const retry = vi.fn();
    const { rerender } = render(
      <GarageSyncNotice key="synced" state="synced" error="" onRetry={retry} />,
    );
    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByRole("status")).toHaveTextContent("Garage synced");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    rerender(
      <GarageSyncNotice key="saving" state="saving" error="" onRetry={retry} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Saving changes");
    rerender(
      <GarageSyncNotice key="synced" state="synced" error="" onRetry={retry} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Garage synced");
  });
  it.each(["error", "offline", "unsaved"] as const)(
    "keeps %s feedback visible",
    (state) => {
      vi.useFakeTimers();
      const retry = vi.fn();
      render(
        <GarageSyncNotice
          state={state}
          error={state === "error" ? "Try again" : ""}
          onRetry={retry}
        />,
      );
      act(() => vi.advanceTimersByTime(10000));
      expect(screen.getByRole("status")).toBeInTheDocument();
      if (state !== "offline") {
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(retry).toHaveBeenCalledOnce();
      }
    },
  );
});
