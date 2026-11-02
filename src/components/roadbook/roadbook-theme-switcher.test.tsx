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
      compatibility={false}
      compatibilityLabel="Compatibility map"
    />
  );
}

describe("RoadbookThemeSwitcher", () => {
  it("exposes nine labeled icon choices without opening a dropdown", () => {
    render(<StatefulSwitcher />);
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    expect(document.querySelector("details, summary, select")).toBeNull();
    for (const choice of screen.getAllByRole("radio")) {
      expect(choice.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
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
    fireEvent.keyDown(screen.getByRole("radio", { name: "Tokyo" }), {
      key: "ArrowRight",
    });
    expect(konstanz).toHaveAttribute("aria-checked", "true");
    expect(konstanz).toHaveFocus();
  });

  it("selects directly by click and keeps one choice in the tab sequence", () => {
    render(<StatefulSwitcher />);
    const kyoto = screen.getByRole("radio", { name: "Kyoto" });
    fireEvent.click(kyoto);
    expect(kyoto).toHaveAttribute("aria-checked", "true");
    expect(kyoto).toHaveAttribute("tabindex", "0");
    expect(
      screen.getAllByRole("radio").filter((button) => button.tabIndex === 0),
    ).toEqual([kyoto]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("announces compatibility mode only when it is active", () => {
    const onChange = vi.fn();
    render(
      <RoadbookThemeSwitcher
        mode="tokyo"
        onChange={onChange}
        label="Map style"
        labels={labels}
        compatibility
        compatibilityLabel="Original OpenStreetMap tiles"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Original OpenStreetMap tiles",
    );
  });
});
