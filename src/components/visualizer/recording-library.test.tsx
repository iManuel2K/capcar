import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecordingLibrary } from "./recording-library";
import {
  recordingStore,
  saveRecording,
  type Recording,
} from "@/features/visualizer/recording-library";
vi.mock("@/features/visualizer/recording-library", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  recordingStore: vi.fn(),
  saveRecording: vi.fn(),
}));

const revoke = vi.fn();
function record(id = "one", vehicle = "BMW 318i"): Recording {
  return {
    id,
    vehicle,
    name: `${id}.mp3`,
    category: "exhaust",
    setup: "stock",
    rights: "owned",
    createdAt: "2026-10-08T00:00:00.000Z",
    file: new Blob(["fixture"], { type: "audio/mpeg" }),
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(recordingStore).mockResolvedValue([]);
  vi.mocked(saveRecording).mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = vi.fn(() => "blob:recording");
      static revokeObjectURL = revoke;
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function enableUpload() {
  await screen.findByText(/No recordings here yet/);
  fireEvent.change(screen.getByLabelText("Vehicle and recording context"), {
    target: { value: "BMW 318i · warm idle" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}
function upload(file: File) {
  fireEvent.change(screen.getByLabelText("Add to sound library"), {
    target: { files: [file] },
  });
}

describe("personal recording archive", () => {
  it("requires context and declared permission before local storage", async () => {
    render(<RecordingLibrary />);
    expect(screen.getByLabelText("Add to sound library")).toBeDisabled();
    await enableUpload();
    expect(screen.getByLabelText("Add to sound library")).toBeEnabled();
    upload(new File(["fixture"], "idle.m4a", { type: "audio/x-m4a" }));
    await screen.findByText(/Recording saved on this device/);
    expect(saveRecording).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicle: "BMW 318i · warm idle",
        name: "idle.m4a",
        rights: "owned",
      }),
    );
    expect(screen.getByText("idle.m4a")).toBeVisible();
    expect(screen.getByText(/not included in Garage sync/)).toBeVisible();
  });
  it("rejects misleading MIME types and empty files without saving", async () => {
    render(<RecordingLibrary />);
    await enableUpload();
    upload(new File(["<script>"], "fake.mp3", { type: "text/html" }));
    expect(
      await screen.findByText(/Choose MP3, WAV, Ogg or M4A between/),
    ).toBeVisible();
    upload(new File([], "empty.mp3", { type: "audio/mpeg" }));
    expect(saveRecording).not.toHaveBeenCalled();
  });
  it("recovers when storage becomes available after an initial failure", async () => {
    vi.mocked(recordingStore)
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValue([]);
    render(<RecordingLibrary />);
    const retry = await screen.findByRole("button", {
      name: "Retry local storage",
    });
    expect(screen.getByLabelText("Add to sound library")).toBeDisabled();
    fireEvent.click(retry);
    await enableUpload();
    expect(screen.getByLabelText("Add to sound library")).toBeEnabled();
  });
  it("prevents duplicate writes while saving", async () => {
    let finish!: () => void;
    vi.mocked(saveRecording).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    render(<RecordingLibrary />);
    await enableUpload();
    upload(new File(["fixture"], "one.mp3"));
    upload(new File(["fixture"], "two.mp3"));
    expect(saveRecording).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Add to sound library")).toBeDisabled();
    await act(async () => finish());
  });
  it("restores saved takes, filters them and releases object URLs", async () => {
    vi.mocked(recordingStore).mockResolvedValue([
      record(),
      record("two", "Volvo 850"),
    ]);
    const { unmount } = render(<RecordingLibrary />);
    await screen.findByText("one.mp3");
    expect(screen.getByText("two.mp3")).toBeVisible();
    const comparison = screen.getByRole("region", {
      name: "Compare saved recordings",
    });
    fireEvent.change(within(comparison).getByLabelText("Take A"), {
      target: { value: "one" },
    });
    expect(
      within(within(comparison).getByLabelText("Take B")).queryByRole(
        "option",
        { name: /BMW/ },
      ),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Volvo" },
    });
    expect(screen.getByText("two.mp3")).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "missing" },
    });
    expect(screen.getByText(/No saved recordings match/)).toBeVisible();
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:recording");
  });
  it("requires confirmation to remove a saved copy and keeps the card on failure", async () => {
    vi.mocked(recordingStore)
      .mockResolvedValueOnce([record()])
      .mockRejectedValueOnce(new Error("quota"));
    render(<RecordingLibrary />);
    await screen.findByText("one.mp3");
    fireEvent.click(screen.getByRole("button", { name: "Remove local copy" }));
    expect(recordingStore).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("one.mp3")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Remove local copy" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm removal" }));
    await screen.findByText(/Could not remove this recording/);
    expect(screen.getByText("one.mp3")).toBeVisible();
  });
});
