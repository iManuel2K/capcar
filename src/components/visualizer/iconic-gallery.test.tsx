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
vi.mock("./interactive-car-model", () => ({
  InteractiveCarModel: ({ modelId }: { modelId: string }) => (
    <div data-testid="local-car-model">{modelId}</div>
  ),
}));

function expectClip(url: string) {
  fireEvent.click(screen.getByRole("button", { name: /Watch original scene/ }));
  expect(
    screen.getByRole("link", { name: /Open original video/ }),
  ).toHaveAttribute("href", url);
  fireEvent.click(screen.getByRole("button", { name: "Close video" }));
}

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

async function open(carName = "DeLorean Time Machine · Back to the Future") {
  if (!screen.queryByRole("button", { name: "Explore in 3D" })) {
    fireEvent.click(screen.getByRole("button", { name: carName }));
    fireEvent.click(
      screen.getByRole("button", { name: "Explore 3D reference" }),
    );
  }
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
      "2f25b904e25e49319c238f8f5914c584",
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
      "https://sketchfab.com/3d-models/2f25b904e25e49319c238f8f5914c584",
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
      screen.getByRole("button", { name: "KITT · Knight Rider" }),
    );
    expect(api.stop).toHaveBeenCalled();
    expect(container.querySelector("iframe")).toBeNull();
    await open("KITT · Knight Rider");
    expect(init).toHaveBeenLastCalledWith(
      "5730bd878f6a4b0b8cc6d8c10307bc5b",
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
        "capcar.reference.v1.2f25b904e25e49319c238f8f5914c584",
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
      screen.getByRole("button", { name: "KITT · Knight Rider" }),
    );
    act(() => oldReady());
    expect(screen.queryByLabelText("Surface")).not.toBeInTheDocument();
  });
  it("handles missing surfaces and malformed saved data", async () => {
    vi.mocked(api.getMaterialList).mockImplementation((callback) =>
      callback(null, []),
    );
    localStorage.setItem(
      "capcar.reference.v1.2f25b904e25e49319c238f8f5914c584",
      '{"camera":"broken"}',
    );
    render(<IconicGallery />);
    await ready();
    expect(screen.getByLabelText("Surface")).toBeDisabled();
    expect(screen.getByLabelText("Tint")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Restore saved view" }));
    expect(screen.getByText(/No saved/)).toBeVisible();
  });
  it("uses actual film/show clip imagery and keeps the artist references separate", () => {
    render(<IconicGallery />);
    for (const image of screen.getAllByRole("img"))
      expect(image.getAttribute("src")).toMatch(
        /^https:\/\/(?:i\.ytimg\.com\/vi\/|images\.contentstack\.io\/)/,
      );
    expectClip("https://www.youtube.com/watch?v=NVH__HVdLhU");
    expect(screen.getByText(/Film \/ TV imagery ©/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Original imagery/ }),
    ).toHaveAttribute(
      "href",
      "https://www.universalpicturesathome.com/movies/2-fast-2-furious",
    );
    expect(screen.queryByTestId("local-car-model")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Explore 3D reference" }),
    );
    expect(screen.getByTestId("local-car-model")).toHaveTextContent(
      "nissan-gt-r",
    );
    expect(
      screen.getByText(
        /Brian’s silver-and-blue movie graphics are not included/,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Plan your own build/ }),
    ).toHaveAttribute("href", "/garage/new");
  });
  it("updates the original source and closes the workspace when choosing another screen car", () => {
    render(<IconicGallery />);
    fireEvent.click(
      screen.getByRole("button", { name: "Explore 3D reference" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "KITT · Knight Rider" }),
    );
    expect(screen.queryByTestId("local-car-model")).not.toBeInTheDocument();
    expectClip("https://www.youtube.com/watch?v=KH24SrIMdgo");
    expect(loadSketchfab).not.toHaveBeenCalled();
  });
  it("falls back to a lower-resolution frame of the same show, never a generic car", () => {
    const { container } = render(<IconicGallery />);
    fireEvent.click(
      screen.getByRole("button", { name: "KITT · Knight Rider" }),
    );
    const hero = container.querySelector('img[src*="maxresdefault"]')!;
    fireEvent.error(hero);
    expect(hero).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/KH24SrIMdgo/hqdefault.jpg",
    );
    fireEvent.error(hero);
    expect(container.querySelector('img[src*="/showcase/"]')).toBeNull();
    expectClip("https://www.youtube.com/watch?v=KH24SrIMdgo");
  });
});
