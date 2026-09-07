import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  isProject318Vehicle,
  VehiclePhotoGallery,
} from "@/components/garage/vehicle-photo-gallery";

describe("VehiclePhotoGallery", () => {
  it("switches between current vehicle angles", () => {
    render(<VehiclePhotoGallery label="2011 BMW 318i" />);
    expect(
      screen.getByRole("button", { name: "Show side profile" }),
    ).toHaveAttribute("aria-pressed", "true");
    const rearButton = screen.getByRole("button", {
      name: "Show rear at night",
    });
    fireEvent.click(rearButton);
    expect(rearButton).toHaveAttribute("aria-pressed", "true");
  });

  it("only applies the real gallery to the matching E90 profile", () => {
    expect(
      isProject318Vehicle({ make: "BMW", model: "318i", platform: "E90" }),
    ).toBe(true);
    expect(
      isProject318Vehicle({ make: "BMW", model: "330i", platform: "E90" }),
    ).toBe(false);
  });
});
