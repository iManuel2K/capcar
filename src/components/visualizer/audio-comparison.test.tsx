import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioComparison } from "./audio-comparison";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("local audio comparison", () => {
  it("rejects non-audio uploads", () => {
    render(<AudioComparison />);
    fireEvent.change(screen.getByLabelText("Stock recording"), {
      target: {
        files: [new File(["not sound"], "bad.txt", { type: "text/plain" })],
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Choose MP3");
  });
  it("releases local object URLs and pauses the opposite track", () => {
    const create = vi
      .fn()
      .mockReturnValueOnce("blob:stock")
      .mockReturnValueOnce("blob:modified");
    const revoke = vi.fn();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = create;
        static revokeObjectURL = revoke;
      },
    );
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    const { container, unmount } = render(<AudioComparison />);
    for (const label of ["Stock recording", "Modified recording"])
      fireEvent.change(screen.getByLabelText(label), {
        target: {
          files: [new File(["fixture"], "audio.mp3", { type: "audio/mpeg" })],
        },
      });
    const audio = container.querySelectorAll("audio");
    expect(audio).toHaveLength(2);
    expect(audio[0].volume).toBe(0.25);
    fireEvent.play(audio[1]);
    expect(pause).toHaveBeenCalled();
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:stock");
    expect(revoke).toHaveBeenCalledWith("blob:modified");
  });
});
