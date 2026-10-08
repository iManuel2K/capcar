import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CuratedSounds } from "./curated-sounds";

beforeEach(() =>
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {}),
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("curated listening desk", () => {
  it("selects licensed real recordings without autoplay and exposes attribution", () => {
    const { container } = render(<CuratedSounds />);
    fireEvent.click(screen.getByRole("button", { name: /Nissan Fuga/ }));
    expect(screen.getByRole("heading", { name: /Nissan Fuga/ })).toBeVisible();
    expect(container.querySelector("audio")).toHaveAttribute(
      "src",
      "/sounds/nissan-vq35hr.mp3",
    );
    expect(container.querySelector("audio")).not.toHaveAttribute("autoplay");
    expect(
      screen.getByRole("link", { name: /Open original source/, hidden: true }),
    ).toHaveAttribute("href", expect.stringContaining("NISSAN_VQ35HR"));
  });
  it("combines text and cylinder filters, shows an empty state and resets", () => {
    render(<CuratedSounds />);
    fireEvent.click(screen.getByRole("button", { name: "5 cylinders" }));
    expect(screen.getByRole("heading", { name: /Volvo/ })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Honda F20C/ }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "not-a-car" },
    });
    expect(screen.getByRole("status")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("button", { name: "All engines" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("prevents comparing the same curated recording against itself", () => {
    render(<CuratedSounds />);
    const selects = screen.getAllByRole("combobox", { hidden: true });
    expect(
      within(selects[0]).queryByRole("option", { name: /Volvo/, hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      within(selects[1]).queryByRole("option", { name: /Honda/, hidden: true }),
    ).not.toBeInTheDocument();
    fireEvent.change(selects[0], { target: { value: "triumph-i6" } });
    expect(
      within(selects[1]).queryByRole("option", {
        name: /Triumph/,
        hidden: true,
      }),
    ).not.toBeInTheDocument();
  });
  it("pauses only the comparison players when their panel closes", () => {
    const { container } = render(<CuratedSounds />);
    const panel = container.querySelectorAll("details")[1];
    const players = Array.from(panel.querySelectorAll("audio"));
    const spies = players.map((audio) => {
      const pause = vi.fn();
      Object.defineProperty(audio, "pause", { value: pause, configurable: true });
      return pause;
    });
    const main = vi.fn();
    Object.defineProperty(container.querySelector("audio")!, "pause", {
      value: main,
      configurable: true,
    });
    panel.open = false;
    fireEvent(panel, new Event("toggle"));
    for (const pause of spies) expect(pause).toHaveBeenCalledOnce();
    expect(main).not.toHaveBeenCalled();
  });
});
