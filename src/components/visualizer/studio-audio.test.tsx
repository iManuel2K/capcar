import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioAudio } from "./studio-audio";

beforeEach(() =>
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {}),
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("studio audio", () => {
  it("starts quietly without autoplay or eager downloading", () => {
    const { container } = render(<StudioAudio src="/one.mp3" label="One" />);
    const audio = container.querySelector("audio")!;
    expect(audio.volume).toBe(0.25);
    expect(audio.autoplay).toBe(false);
    expect(audio.preload).toBe("none");
  });
  it("pauses every other CapCar player, but not unrelated media", () => {
    const { container } = render(
      <>
        <StudioAudio src="/one.mp3" label="One" />
        <StudioAudio src="/two.mp3" label="Two" />
        <audio aria-label="Unrelated" />
      </>,
    );
    const players = container.querySelectorAll("audio");
    const first = vi.fn();
    const second = vi.fn();
    const other = vi.fn();
    [first, second, other].forEach((pause, index) =>
      Object.defineProperty(players[index], "pause", { value: pause }),
    );
    fireEvent.play(players[1]);
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(other).not.toHaveBeenCalled();
  });
  it("falls back to the original, then offers retry and resets for a new source", () => {
    const { container, rerender } = render(
      <StudioAudio src="/one.mp3" fallback="/one.ogg" label="One" />,
    );
    fireEvent.error(container.querySelector("audio")!);
    expect(container.querySelector("audio")).toHaveAttribute("src", "/one.ogg");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.error(container.querySelector("audio")!);
    expect(screen.getByRole("alert")).toHaveTextContent("cannot play");
    fireEvent.click(screen.getByRole("button", { name: "Retry recording" }));
    expect(container.querySelector("audio")).toHaveAttribute("src", "/one.mp3");
    fireEvent.error(container.querySelector("audio")!);
    rerender(<StudioAudio src="/two.mp3" fallback="/two.ogg" label="Two" />);
    expect(container.querySelector("audio")).toHaveAttribute("src", "/two.mp3");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("does not reset a user-adjusted volume on a parent render", () => {
    const { container, rerender, unmount } = render(
      <StudioAudio src="/one.mp3" label="One" />,
    );
    const audio = container.querySelector("audio")!;
    audio.volume = 0.1;
    rerender(<StudioAudio src="/one.mp3" label="New label" />);
    expect(audio.volume).toBe(0.1);
    const stop = vi.spyOn(audio, "pause");
    unmount();
    expect(stop).toHaveBeenCalled();
  });
});
