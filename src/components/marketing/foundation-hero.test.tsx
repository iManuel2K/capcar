import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoundationHero } from "@/components/marketing/foundation-hero";

describe("FoundationHero", () => {
  it("communicates Capcar's core product promise", () => {
    render(<FoundationHero />);

    expect(
      screen.getByRole("heading", { name: "Build the car in your head." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Capcar")).toBeInTheDocument();
    expect(screen.getByText("Stealth Rear")).toBeInTheDocument();
  });
});
