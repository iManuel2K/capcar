import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CuratedSounds } from "./curated-sounds";
beforeEach(() => {
  window.history.replaceState(null, "", "/sound-studio");
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Sound Studio listening desk", () => {
  it("keeps 150 recordings searchable with paginated results and on-demand playback", () => {
    const { container } = render(<CuratedSounds />);
    expect(screen.getByText("150 recordings")).toBeVisible();
    expect(container.querySelectorAll("audio")).toHaveLength(3);
    for (const audio of container.querySelectorAll("audio")) {
      expect(audio.preload).toBe("none");
      expect(audio.autoplay).toBe(false);
    }
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Nissan Fuga" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Nissan Fuga.*Road/ }));
    expect(
      within(screen.getByRole("complementary", { name: "Preview" })).getByRole(
        "heading",
        { name: /Nissan Fuga/ },
      ),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Compare as B" }));
    expect(screen.getByLabelText("Recording B")).toHaveAttribute(
      "src",
      "/sounds/nissan-vq35hr.mp3",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Added to B");
  });
  it("combines make and cylinder filters without losing the comparison", () => {
    render(<CuratedSounds />);
    fireEvent.change(screen.getByLabelText("Make"), {
      target: { value: "Volvo" },
    });
    fireEvent.change(screen.getByLabelText("Cylinders"), {
      target: { value: "5" },
    });
    expect(screen.getByText(/2 recordings ·/)).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "no-car" },
    });
    expect(
      screen.getByText("No recordings match those filters."),
    ).toBeVisible();
    expect(screen.getByLabelText("Recording A")).toHaveAttribute(
      "src",
      "/sounds/honda-f20c.mp3",
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByLabelText("Make")).toHaveValue("");
  });
  it("prevents duplicate A/B library selections", () => {
    render(<CuratedSounds />);
    fireEvent.click(screen.getByRole("button", { name: "Compare as B" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Choose a different recording",
    );
    expect(screen.getByLabelText("Recording B")).toHaveAttribute(
      "src",
      "/sounds/volvo-850-t5.mp3",
    );
  });
  it("compares personal stock with library audio and releases object URLs", () => {
    const create = vi.fn().mockReturnValue("blob:stock");
    const revoke = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: create,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revoke,
    });
    const { unmount } = render(<CuratedSounds />);
    fireEvent.change(screen.getByLabelText("Stock recording"), {
      target: { files: [new File(["bad"], "bad.txt", { type: "text/plain" })] },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Choose MP3");
    fireEvent.change(screen.getByLabelText("Stock recording"), {
      target: {
        files: [new File(["sound"], "my-stock.mp3", { type: "audio/mpeg" })],
      },
    });
    expect(screen.getByLabelText("Recording A")).toHaveAttribute(
      "src",
      "blob:stock",
    );
    expect(screen.getByLabelText("Recording B")).toHaveAttribute(
      "src",
      "/sounds/volvo-850-t5.mp3",
    );
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:stock");
  });
  it("restores shared choices without substituting for a private recording", async () => {
    window.history.replaceState(
      null,
      "",
      "/sound-studio?a=personal&b=nissan-vq35hr",
    );
    render(<CuratedSounds />);
    await waitFor(() =>
      expect(screen.queryByLabelText("Recording A")).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Recording B")).toHaveAttribute(
      "src",
      "/sounds/nissan-vq35hr.mp3",
    );
    expect(screen.getByRole("button", { name: "Listen to A" })).toBeDisabled();
  });
  it("switches exclusive playback at the chosen start time", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    render(<CuratedSounds />);
    const b = screen.getByLabelText("Recording B") as HTMLAudioElement;
    Object.defineProperty(b, "readyState", { value: 1 });
    Object.defineProperty(b, "duration", { value: 30 });
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Listen to B" }));
    await waitFor(() => expect(b.currentTime).toBe(4));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
