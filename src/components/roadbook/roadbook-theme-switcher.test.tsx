import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

import { RoadbookThemeSwitcher } from "./roadbook-theme-switcher";

afterEach(cleanup);

const labels: Record<RoadbookMapMode, string> = {
  konstanz: "Konstanz",
  reykjavik: "Reykjavík",
  lissabon: "Lissabon",
  wien: "Wien",
  zurich: "Zürich",
  venedig: "Venedig",
  kyoto: "Kyoto",
  marrakesch: "Marrakesch",
  tokyo: "Tokyo",
};

function StatefulSwitcher() {
  const [mode, setMode] = useState<RoadbookMapMode>("konstanz");
  return (
    <RoadbookThemeSwitcher
      mode={mode}
      onChange={setMode}
      label="Map style"
      labels={labels}
      headline="Nine Roadbook styles."
      description="Choose how your roads should feel."
      compatibility={false}
      compatibilityLabel="Compatibility map"
    />
  );
}

describe("RoadbookThemeSwitcher", () => {
  it("renders nine real style choices with visual swatches", () => {
    render(<StatefulSwitcher />);
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    expect(document.querySelectorAll(".roadbook-style-chip__swatch")).toHaveLength(9);
  });

  it("changes the selected style with roving keyboard navigation", () => {
    render(<StatefulSwitcher />);
    const konstanz = screen.getByRole("radio", { name: "Konstanz" });
    fireEvent.keyDown(konstanz, { key: "ArrowRight" });
    const reykjavik = screen.getByRole("radio", { name: "Reykjavík" });
    expect(reykjavik).toHaveAttribute("aria-checked", "true");
    expect(reykjavik).toHaveFocus();
    fireEvent.keyDown(reykjavik, { key: "End" });
    expect(screen.getByRole("radio", { name: "Tokyo" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("announces compatibility mode only when it is active", () => {
    const onChange = vi.fn();
    render(
      <RoadbookThemeSwitcher
        mode="tokyo"
        onChange={onChange}
        label="Map style"
        labels={labels}
        headline="Nine Roadbook styles."
        description="Choose how your roads should feel."
        compatibility
        compatibilityLabel="Original OpenStreetMap tiles"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Original OpenStreetMap tiles",
    );
  });
});
