import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconicGallery } from "./iconic-gallery";

describe("realistic collection", () => {
  it("waits for consent before connecting and unloads the previous model", () => {
    const { container } = render(<IconicGallery />);
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Explore in 3D" }));
    expect(container.querySelector("iframe")?.src).toContain(
      "ff8fb2251dfa4bb9979e7022c5a6666c",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "1975 Porsche 911 Turbo" }),
    );
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Explore in 3D" }));
    expect(container.querySelector("iframe")?.src).toContain(
      "8568d9d14a994b9cae59499f0dbed21e",
    );
    fireEvent.click(screen.getByRole("button", { name: "Show preview" }));
    expect(container.querySelector("iframe")).toBeNull();
  });
});
