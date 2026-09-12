import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LanguageSelector } from "@/components/i18n/language-selector";

afterEach(cleanup);

describe("LanguageSelector", () => {
  it("opens a compact, accessible locale menu", () => {
    render(<LanguageSelector compact />);

    const trigger = screen.getByRole("button", { name: "Language: English" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Language" })).toBeVisible();
    expect(
      screen.getByRole("menuitemradio", { name: "English" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "Deutsch" }),
    ).toBeVisible();
    expect(
      screen.getByRole("menuitemradio", { name: "Ελληνικά" }),
    ).toBeVisible();
    expect(screen.getByRole("menuitemradio", { name: "Shqip" })).toBeVisible();
    expect(screen.getByRole("menuitemradio", { name: "日本語" })).toBeVisible();
  });

  it("closes with Escape", () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole("button", { name: "Language: English" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
