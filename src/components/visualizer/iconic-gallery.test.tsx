import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IconicGallery } from "./iconic-gallery";
import {
  loadSketchfab,
  type ViewerApi,
} from "@/features/visualizer/sketchfab-api";
vi.mock("@/features/visualizer/sketchfab-api", () => ({
  loadSketchfab: vi.fn(),
}));

let init: ReturnType<typeof vi.fn>;
let events: Record<string, () => void>;
let api: ViewerApi;
beforeEach(() => {
  localStorage.clear();
  events = {};
  api = {
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn((name, callback) => {
      events[name] = callback;
    }),
    getCameraLookAt: vi.fn((callback) =>
      callback(null, { position: [4, 4, 2], target: [0, 0, 0] }),
    ),
    setCameraLookAt: vi.fn((_p, _t, _d, callback) => callback?.(null)),
    getMaterialList: vi.fn((callback) =>
      callback(null, [
        {
          id: 1,
          name: "Body",
          channels: {
            AlbedoPBR: {
              color: [1, 1, 1],
              texture: { uid: "original-livery" },
            },
          },
        },
      ]),
    ),
    setMaterial: vi.fn((_material, callback) => callback(null)),
  };
  init = vi.fn((_id, options) => options.success(api));
  vi.mocked(loadSketchfab).mockResolvedValue(
    class {
      init = init;
    } as never,
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function open() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Explore in 3D" }));
  });
}
async function ready() {
  await open();
  act(() => events.viewerready());
}

describe("iconic reference collection", () => {
  it("waits for consent and never treats an iframe load as model readiness", async () => {
    vi.useFakeTimers();
    const { container } = render(<IconicGallery />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(loadSketchfab).not.toHaveBeenCalled();
    await open();
    expect(init).toHaveBeenCalledWith(
      "c424e4f18c9742d296920f069d139b45",
      expect.any(Object),
    );
    fireEvent.load(container.querySelector("iframe")!);
    expect(screen.queryByLabelText("Surface")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("timed out");
    expect(
      screen.getByRole("link", { name: /Open original source/ }),
    ).toHaveAttribute(
      "href",
      "https://sketchfab.com/3d-models/c424e4f18c9742d296920f069d139b45",
    );
    await open();
    act(() => events.viewerready());
    act(() => vi.advanceTimersByTime(20_000));
    expect(container.querySelector("iframe")).not.toBeNull();
    expect(screen.getByLabelText("Surface")).toBeEnabled();
  });
  it("allows a slow model to finish without counting SDK loading against it", async () => {
    vi.useFakeTimers();
    let resolveSdk!: (value: Awaited<ReturnType<typeof loadSketchfab>>) => void;
    vi.mocked(loadSketchfab).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSdk = resolve;
      }),
    );
    const { container } = render(<IconicGallery />);
    await open();
    act(() => vi.advanceTimersByTime(10_000));
    await act(async () => {
      resolveSdk(
        class {
          init = init;
        } as never,
      );
    });
    act(() => vi.advanceTimersByTime(55_000));
    expect(container.querySelector("iframe")).not.toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    act(() => events.viewerready());
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByLabelText("Surface")).toBeEnabled();
  });
  it("unloads the previous model on selection and supports closing", async () => {
    const { container } = render(<IconicGallery />);
    await ready();
    fireEvent.click(
      screen.getByRole("button", { name: "1975 Porsche 911 Turbo" }),
    );
    expect(api.stop).toHaveBeenCalled();
    expect(container.querySelector("iframe")).toBeNull();
    await open();
    expect(init).toHaveBeenLastCalledWith(
      "8568d9d14a994b9cae59499f0dbed21e",
      expect.any(Object),
    );
    fireEvent.click(screen.getByRole("button", { name: "Show preview" }));
    expect(container.querySelector("iframe")).toBeNull();
  });
  it("retains textures while tinting, saves and restores a validated configuration", async () => {
    render(<IconicGallery />);
    await ready();
    fireEvent.change(screen.getByLabelText("Tint"), {
      target: { value: "#92644d" },
    });
    expect(api.setMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: {
          AlbedoPBR: expect.objectContaining({
            texture: { uid: "original-livery" },
          }),
        },
      }),
      expect.any(Function),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save configuration" }));
    const saved = JSON.parse(
      localStorage.getItem(
        "capcar.reference.v1.c424e4f18c9742d296920f069d139b45",
      )!,
    );
    expect(saved.paints).toEqual({ "1": "#92644d" });
    fireEvent.click(screen.getByRole("button", { name: "Reset model" }));
    expect(screen.getByLabelText("Tint")).toHaveValue("#ffffff");
    fireEvent.click(screen.getByRole("button", { name: "Restore saved view" }));
    expect(screen.getByLabelText("Tint")).toHaveValue("#92644d");
    expect(api.setCameraLookAt).toHaveBeenCalledWith(
      [4, 4, 2],
      [0, 0, 0],
      0.6,
      expect.any(Function),
    );
  });
  it("recovers from script failures without losing the local preview", async () => {
    vi.mocked(loadSketchfab).mockRejectedValueOnce(new Error("blocked"));
    const { container } = render(<IconicGallery />);
    await open();
    expect(screen.getByRole("alert")).toBeVisible();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: "Explore in 3D" })).toBeEnabled();
  });
  it("does not update the new model from a late callback", async () => {
    render(<IconicGallery />);
    await open();
    const oldReady = events.viewerready;
    fireEvent.click(
      screen.getByRole("button", { name: "Nissan Skyline R34 GT-R" }),
    );
    act(() => oldReady());
    expect(screen.queryByLabelText("Surface")).not.toBeInTheDocument();
  });
  it("handles missing surfaces and malformed saved data", async () => {
    vi.mocked(api.getMaterialList).mockImplementation((callback) =>
      callback(null, []),
    );
    localStorage.setItem(
      "capcar.reference.v1.c424e4f18c9742d296920f069d139b45",
      '{"camera":"broken"}',
    );
    render(<IconicGallery />);
    await ready();
    expect(screen.getByLabelText("Surface")).toBeDisabled();
    expect(screen.getByLabelText("Tint")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Restore saved view" }));
    expect(screen.getByText(/No saved/)).toBeVisible();
  });
  it("clearly separates fan-made film references from design references", () => {
    render(<IconicGallery />);
    expect(
      screen.getByText(/one fan-made movie-car reference and two/),
    ).toBeVisible();
    expect(screen.getByText(/not a verified screen-used car/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Plan your own build/ }),
    ).toHaveAttribute("href", "/garage/new");
  });
});
