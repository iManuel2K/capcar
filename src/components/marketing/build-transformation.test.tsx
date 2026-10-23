import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentProps } from "react";
import { BuildTransformation } from "./build-transformation";

vi.mock("next/image", () => ({
  default: ({ src, alt, onLoad, onError }: ComponentProps<"img">) =>
    createElement("img", { src, alt, onLoad, onError }),
}));

let nextFrame: FrameRequestCallback | undefined;
let reduced = false;
beforeEach(() => {
  reduced = false;
  nextFrame = undefined;
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn(() => {
      nextFrame = undefined;
    }),
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const tick = (time: number) =>
  act(() => {
    const callback = nextFrame;
    nextFrame = undefined;
    callback?.(time);
  });
const loadImages = () =>
  document.querySelectorAll("img").forEach((image) => fireEvent.load(image));

describe("the hero's single automatic reveal", () => {
  it("waits for both images, sweeps left to right, finishes and never loops", () => {
    render(<BuildTransformation autoPlay compact eager />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("0");
    fireEvent.load(document.querySelectorAll("img")[0]);
    expect(nextFrame).toBeUndefined();
    fireEvent.load(document.querySelectorAll("img")[1]);
    tick(100);
    tick(1880);
    expect(Number((slider as HTMLInputElement).value)).toBeCloseTo(50, 0);
    tick(3480);
    expect(slider).toHaveValue("100");
    expect(nextFrame).toBeUndefined();
    expect(
      screen.getByRole("button", { name: "Animation stopped" }),
    ).toBeDisabled();
  });
  it.each(["pointer", "focus", "pause"])(
    "yields control immediately on %s and never overrides a manual value",
    (action) => {
      render(<BuildTransformation autoPlay compact eager />);
      loadImages();
      tick(100);
      tick(1000);
      const slider = screen.getByRole("slider");
      if (action === "pointer") fireEvent.pointerDown(slider);
      if (action === "focus") fireEvent.focus(slider);
      if (action === "pause")
        fireEvent.click(
          screen.getByRole("button", { name: "Pause animation" }),
        );
      expect(nextFrame).toBeUndefined();
      fireEvent.change(slider, { target: { value: "73" } });
      tick(5000);
      expect(slider).toHaveValue("73");
      fireEvent.click(screen.getByRole("button", { name: "Starting point" }));
      expect(slider).toHaveValue("0");
      fireEvent.click(
        screen.getByRole("button", { name: "Concept direction" }),
      );
      expect(slider).toHaveValue("100");
    },
  );
  it("respects reduced motion while leaving all manual controls available", () => {
    reduced = true;
    render(<BuildTransformation autoPlay compact eager />);
    loadImages();
    expect(nextFrame).toBeUndefined();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "65" } });
    expect(screen.getByRole("slider")).toHaveValue("65");
  });
  it("cancels an in-progress reveal when unmounted", () => {
    const view = render(<BuildTransformation autoPlay compact eager />);
    loadImages();
    tick(100);
    view.unmount();
    expect(nextFrame).toBeUndefined();
  });
});
