import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIConversation, AIInput, AIResponse } from "./ai-conversation";
import { MotionLoader } from "./motion-loader";
import { MusicToggle, PlaybackSignal } from "./music-toggle";
import { VideoModal, videoEmbedUrl } from "./video-modal";
import { readingPercentage, ScrollProgress } from "./scroll-progress";
import { ExpandableNavigation } from "../marketing/expandable-navigation";
import { interactionCopy } from "@/features/ui/interaction-copy";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
let resize: () => void;
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("CapCar smooth interactions", () => {
  it("keeps new control copy complete in every supported language", () => {
    for (const locale of Object.values(interactionCopy)) {
      expect(Object.keys(locale).sort()).toEqual(
        Object.keys(interactionCopy.en).sort(),
      );
      expect(
        Object.values(locale).every((text) => text.trim().length > 0),
      ).toBe(true);
    }
  });
  it("announces a labelled loader but hides an inline glyph from assistive technology", () => {
    const { rerender, container } = render(
      <MotionLoader label="Saving changes" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Saving changes");
    rerender(<MotionLoader />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
  it("uses real playback state for the toggle and waveform", () => {
    const onToggle = vi.fn();
    const { rerender, container } = render(
      <>
        <MusicToggle
          playing={false}
          onToggle={onToggle}
          label="Play recording A"
        />
        <PlaybackSignal playing={false} />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Play recording A" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(
      <>
        <MusicToggle playing onToggle={onToggle} label="Pause recording A" />
        <PlaybackSignal playing />
      </>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll('[data-playing="true"]')).toHaveLength(2);
  });
  it("sends Enter, preserves Shift+Enter and IME composition, and supports real cancellation", () => {
    const send = vi.fn(),
      stop = vi.fn();
    const { rerender } = render(
      <AIInput
        value="Plan suspension work"
        onValueChange={() => {}}
        onSubmit={send}
      />,
    );
    const field = screen.getByRole("textbox", { name: "Ask CapCar" });
    fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
    fireEvent.keyDown(field, { key: "Enter", isComposing: true });
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: "Enter" });
    expect(send).toHaveBeenCalledOnce();
    rerender(
      <AIInput
        value="Plan suspension work"
        onValueChange={() => {}}
        onSubmit={send}
        busy
        onStop={stop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(stop).toHaveBeenCalledOnce();
    fireEvent.keyDown(field, { key: "Enter" });
    expect(send).toHaveBeenCalledOnce();
  });
  it("does not render untrusted response text as HTML or simulate streaming", () => {
    const { container } = render(
      <AIResponse text={"<script>alert(1)</script> Full response."} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container).toHaveTextContent(
      "<script>alert(1)</script> Full response.",
    );
  });
  it("does not pull readers back down after they scroll up", () => {
    const { rerender } = render(
      <AIConversation contentKey={1}>
        <p>First reply</p>
      </AIConversation>,
    );
    const log = screen.getByRole("log");
    Object.defineProperties(log, {
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 300, configurable: true },
    });
    log.scrollTop = 100;
    fireEvent.scroll(log);
    expect(
      screen.getByRole("button", { name: "Jump to latest" }),
    ).toBeVisible();
    rerender(
      <AIConversation contentKey={2}>
        <p>Second reply</p>
      </AIConversation>,
    );
    act(() => resize());
    expect(log.scrollTop).toBe(100);
    const scrollTo = vi.fn();
    log.scrollTo = scrollTo;
    fireEvent.click(screen.getByRole("button", { name: "Jump to latest" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "instant" });
  });
  it("validates video embeds and strips tracking/autoplay parameters", () => {
    expect(
      videoEmbedUrl("https://www.youtube.com/watch?v=NVH__HVdLhU&autoplay=1"),
    ).toBe("https://www.youtube-nocookie.com/embed/NVH__HVdLhU?autoplay=0");
    expect(videoEmbedUrl("https://player.vimeo.com/video/12345")).toBe(
      "https://player.vimeo.com/video/12345?autoplay=0&dnt=1",
    );
    for (const url of [
      "javascript:alert(1)",
      "https://youtube.com.evil.com/watch?v=NVH__HVdLhU",
      "http://youtube.com/watch?v=NVH__HVdLhU",
      "https://youtube.com/watch?v=bad",
    ])
      expect(videoEmbedUrl(url)).toBeNull();
  });
  it("loads external video only after opening, then removes it and restores focus on close", () => {
    const { container } = render(
      <VideoModal
        title="Original movie scene"
        src="https://www.youtube.com/watch?v=NVH__HVdLhU"
      />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    const trigger = screen.getByRole("button", { name: "Watch video" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Original movie scene",
    );
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/NVH__HVdLhU?autoplay=0",
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { bubbles: true, cancelable: true }),
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
  it("keeps native video controls and captions and provides an error fallback", () => {
    const { container } = render(
      <VideoModal
        title="CapCar walkthrough"
        src="/walkthrough/test.mp4"
        kind="file"
        tracks={[{ src: "/captions.vtt", language: "de", label: "Deutsch" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Watch video" }));
    const video = container.querySelector("video")!;
    expect(video.controls).toBe(true);
    expect(video.autoplay).toBe(false);
    expect(video.querySelector("track")).toHaveAttribute("srclang", "de");
    fireEvent.error(video);
    expect(screen.getByRole("status")).toHaveTextContent("could not be played");
    expect(
      screen.getByRole("link", { name: /Open original video/ }),
    ).toHaveAttribute("href", "/walkthrough/test.mp4");
  });
  it("calculates article progress without counting the page footer", () => {
    expect(readingPercentage(200, 2200, 1000)).toBe(0);
    expect(readingPercentage(-500, 1500, 1000)).toBe(50);
    expect(readingPercentage(-1000, 1000, 1000)).toBe(100);
    expect(readingPercentage(0, 500, 1000)).toBe(100);
    render(
      <>
        <ScrollProgress />
        <article>Article text</article>
      </>,
    );
    expect(screen.getByRole("progressbar")).toHaveAccessibleName(
      "Reading progress",
    );
  });
  it("expands navigation on click and closes on Escape with trigger focus", async () => {
    render(
      <ExpandableNavigation
        sections={[
          {
            label: "Explore",
            description: "CapCar tools",
            links: [{ href: "/sound-studio", label: "Sound Studio" }],
          },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Explore" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Explore" })).toBeVisible(),
    );
    expect(screen.getByRole("link", { name: "Sound Studio" })).toHaveAttribute(
      "href",
      "/sound-studio",
    );
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
