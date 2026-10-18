import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConceptStudio } from "./concept-studio";
vi.mock("./interactive-car-model", () => ({
  studioButton: "button",
  InteractiveCarModel: ({ modelId }: { modelId: string }) => (
    <div data-testid="viewer">{modelId}</div>
  ),
}));
beforeEach(() => localStorage.clear());
afterEach(cleanup);
describe("25-car public concept studio", () => {
  it("exposes every car free and filters without changing the selection", () => {
    render(<ConceptStudio />);
    const collection = screen.getByLabelText("Car model collection");
    expect(within(collection).getAllByRole("button")).toHaveLength(25);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search cars" }), {
      target: { value: "Skyline" },
    });
    expect(within(collection).getAllByRole("button")).toHaveLength(1);
    fireEvent.click(within(collection).getByRole("button"));
    expect(screen.getByTestId("viewer")).toHaveTextContent("nissan-gt-r");
    expect(
      screen.getByRole("link", { name: /Use in your garage/ }),
    ).toHaveAttribute("href", "/garage");
  });
  it("restores a valid saved car and rejects untrusted storage", () => {
    render(<ConceptStudio />);
    localStorage.setItem(
      "capcar.car-studio.v1",
      JSON.stringify({ modelId: "audi-r8", paint: null }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Restore direction" }));
    expect(screen.getByTestId("viewer")).toHaveTextContent("audi-r8");
    localStorage.setItem(
      "capcar.car-studio.v1",
      JSON.stringify({
        modelId: "https://untrusted.test/model.glb",
        paint: "javascript:alert(1)",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Restore direction" }));
    expect(screen.getByTestId("viewer")).toHaveTextContent("audi-r8");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No valid saved direction",
    );
  });
  it("offers clear recovery from empty search results", () => {
    render(<ConceptStudio />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "not a real car" },
    });
    expect(screen.getByText("No cars match those filters.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(
      within(screen.getByLabelText("Car model collection")).getAllByRole(
        "button",
      ),
    ).toHaveLength(25);
  });
});
