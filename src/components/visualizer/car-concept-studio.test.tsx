import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConceptStudio } from "./concept-studio";
const language = vi.hoisted(() => ({ current: "en" }));
vi.mock("next-intl", () => ({ useLocale: () => language.current }));
vi.mock("./interactive-car-model", () => ({
  studioButton: "button",
  InteractiveCarModel: ({ modelId }: { modelId: string }) => (
    <div data-testid="viewer">{modelId}</div>
  ),
}));
beforeEach(() => {
  localStorage.clear();
  language.current = "en";
});
afterEach(cleanup);
describe("25-car public concept studio", () => {
  it.each([
    ["de", "Autos suchen", "Ansicht speichern", "Ansicht wiederherstellen"],
    [
      "el",
      "Αναζήτηση αυτοκινήτων",
      "Αποθήκευση επιλογής",
      "Επαναφορά επιλογής",
    ],
    ["sq", "Kërko makina", "Ruaj pamjen", "Rikthe pamjen"],
    ["ja", "車を検索", "選択を保存", "選択を復元"],
  ])("translates working controls for %s", (locale, search, save, restore) => {
    language.current = locale;
    render(<ConceptStudio />);
    expect(screen.getByRole("searchbox", { name: search })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: save }));
    expect(localStorage.getItem("capcar.car-studio.v1")).toContain(
      "bmw-m3-e30",
    );
    expect(screen.getByRole("status").textContent).not.toContain(
      "Direction saved",
    );
    expect(screen.getByRole("button", { name: restore })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Save direction" })).toBeNull();
  });
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
