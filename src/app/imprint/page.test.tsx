import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ImprintPage from "@/app/imprint/page";

describe("ImprintPage", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_LEGAL_OPERATOR;
    delete process.env.NEXT_PUBLIC_LEGAL_ADDRESS;
    delete process.env.NEXT_PUBLIC_PRIVACY_CONTACT;
  });

  it("presents configured operator details in an accessible document", async () => {
    process.env.NEXT_PUBLIC_LEGAL_OPERATOR = "Imanuel Harizi";
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS = "Example address";
    process.env.NEXT_PUBLIC_PRIVACY_CONTACT = "privacy@example.test";

    render(await ImprintPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Imprint." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Imprint contents" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Service provider" }),
    ).toHaveAttribute("href", "#service-provider");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact",
    );
    expect(screen.getByRole("main")).toHaveTextContent("Imanuel Harizi");
    expect(
      screen.getByRole("link", { name: "privacy@example.test" }),
    ).toHaveAttribute("href", "mailto:privacy@example.test");
  });
});
