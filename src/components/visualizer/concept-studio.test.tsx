import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConceptStudio } from "./concept-studio";

const renderer = vi.hoisted(() => ({
  load: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  dispose: vi.fn(),
  camera: vi.fn(),
}));
vi.mock("./concept-renderer", () => ({
  createConceptRenderer: () => renderer,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("concept studio", () => {
  it("does not load 3D until requested", () => {
    render(<ConceptStudio />);
    expect(renderer.load).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    ).toBeVisible();
  });
  it("loads on demand, offers camera alternatives and releases the viewer", async () => {
    render(<ConceptStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Model ready"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Side view" }));
    expect(renderer.camera).toHaveBeenCalledWith("side");
    fireEvent.click(screen.getByRole("button", { name: "Stop 3D" }));
    expect(renderer.dispose).toHaveBeenCalled();
  });
  it("limits the spoiler to mapped sedan assets and resets", () => {
    render(<ConceptStudio />);
    fireEvent.click(screen.getByRole("button", { name: /Desert getaway/ }));
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "clay" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reset configuration" }),
    );
    expect(screen.getByRole("checkbox")).toBeEnabled();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
  it("keeps controls accessible when loading fails", async () => {
    renderer.load.mockRejectedValueOnce(new Error("offline"));
    render(<ConceptStudio />);
    fireEvent.click(
      screen.getByRole("button", { name: "Load interactive 3D" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("3D is unavailable"),
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "cream" })).toBeEnabled();
  });
});
