import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ShowcaseBuilds } from "./showcase-builds";

describe("showcase directions", () => {
  beforeEach(() => localStorage.clear());
  it("switches the concept and its proposed build sequence together", () => {
    render(<ShowcaseBuilds />);
    fireEvent.click(
      screen.getByRole("button", { name: /02 \/ Original concept/ }),
    );
    expect(screen.getByText("€600–1,500")).toBeVisible();
    expect(screen.getByRole("link", { name: /Touring tyres/ })).toHaveAttribute(
      "href",
      "/parts-search?q=Touring%20tyres",
    );
  });
  it("saves only the concept rather than personal vehicle records", () => {
    render(<ShowcaseBuilds />);
    fireEvent.click(screen.getByRole("button", { name: "Save direction" }));
    expect(
      JSON.parse(localStorage.getItem("capcar.visual-direction.v1")!),
    ).toEqual({
      model: "sedan-sports",
      paint: "petrol",
      stance: "sport",
      spoiler: true,
    });
  });
  it("handles a malformed saved direction without crashing", () => {
    localStorage.setItem("capcar.visual-direction.v1", "{}");
    render(<ShowcaseBuilds />);
    fireEvent.click(screen.getByRole("button", { name: "Restore direction" }));
    expect(screen.getByText(/Saved direction could not be read/)).toBeVisible();
  });
});
