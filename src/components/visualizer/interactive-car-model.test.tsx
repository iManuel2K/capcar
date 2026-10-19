import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCarModelRenderer } from "./car-model-renderer";
import { InteractiveCarModel } from "./interactive-car-model";

const runtime = vi.hoisted(() => ({
  load: vi.fn().mockResolvedValue(undefined),
  paint: vi.fn(),
  dispose: vi.fn(),
  camera: vi.fn(),
  zoom: vi.fn(),
  snapshot: vi.fn(),
  rotation: vi.fn(),
}));
vi.mock("./car-model-renderer", () => ({
  createCarModelRenderer: vi.fn(() => runtime),
}));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // Image optimization is tested by the browser check, not the DOM harness.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("shared free car viewer", () => {
  it("keeps a whole-car preview on floating-viewer failure without badges over the car", async () => {
    runtime.load.mockRejectedValueOnce(new Error("GPU unavailable"));
    const { container } = render(
      <InteractiveCarModel
        modelId="bmw-m3-e30"
        autoStart
        autoRotate
        presentation="floating"
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("3D is unavailable"),
    );
    expect(screen.getByRole("img", { name: /3D model preview/ })).toBeVisible();
    expect(screen.queryByText("Free 3D model")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-presentation="floating"]'),
    ).toBeInTheDocument();
    expect(createCarModelRenderer).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      { transparent: true },
    );
    expect(screen.getByRole("link", { name: "Original model" })).toBeVisible();
  });
  it("does not initialize or fetch 3D until explicitly loaded", () => {
    render(<InteractiveCarModel modelId="bmw-m3-e30" />);
    expect(runtime.load).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: /3D model preview/ })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    ).toBeEnabled();
  });
  it("supports camera and zoom buttons, paint without reloading, and disposal", async () => {
    const view = render(<InteractiveCarModel modelId="bmw-e36-m3" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Model ready"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Side view" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(runtime.camera).toHaveBeenCalledWith("side");
    expect(runtime.zoom).toHaveBeenCalledWith("in");
    view.rerender(<InteractiveCarModel modelId="bmw-e36-m3" paint="#a92029" />);
    expect(runtime.paint).toHaveBeenLastCalledWith("#a92029");
    expect(runtime.load).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Stop 3D" }));
    expect(runtime.dispose).toHaveBeenCalledTimes(1);
  });
  it("disposes when changing models and waits for consent on the next car", async () => {
    const view = render(<InteractiveCarModel modelId="bmw-m3-e30" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    );
    await waitFor(() => expect(runtime.load).toHaveBeenCalledTimes(1));
    view.rerender(<InteractiveCarModel modelId="nissan-gt-r" />);
    expect(runtime.dispose).toHaveBeenCalledTimes(1);
    expect(runtime.load).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    ).toBeEnabled();
  });
  it("recovers after a failed download and retains creator credits", async () => {
    runtime.load.mockRejectedValueOnce(new Error("offline"));
    render(<InteractiveCarModel modelId="audi-r8" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("3D is unavailable"),
    );
    expect(screen.getByRole("button", { name: "Front view" })).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Original model" }),
    ).toHaveAttribute("href", expect.stringContaining("sketchfab.com"));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Model ready"),
    );
  });
  it("starts rotating after an explicit garage launch and stops when a fixed camera is chosen", async () => {
    render(<InteractiveCarModel modelId="bmw-m3-e30" autoStart autoRotate />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Model ready"),
    );
    await waitFor(() =>
      expect(runtime.rotation).toHaveBeenLastCalledWith(true),
    );
    fireEvent.click(screen.getByRole("button", { name: "Pause rotation" }));
    expect(runtime.rotation).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByRole("button", { name: "Auto rotate" }));
    expect(runtime.rotation).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Front view" }));
    expect(runtime.rotation).toHaveBeenLastCalledWith(false);
    expect(runtime.camera).toHaveBeenLastCalledWith("front");
  });
  it("rejects unknown model IDs before creating any renderer", () => {
    render(<InteractiveCarModel modelId="../../private" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "not in the free library",
    );
    expect(runtime.load).not.toHaveBeenCalled();
  });
});
