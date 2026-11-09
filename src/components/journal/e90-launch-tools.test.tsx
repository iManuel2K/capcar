import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { E90LaunchTools } from "./e90-launch-tools";

afterEach(cleanup);

it("totals German decimal inputs and withholds the estimate on invalid amounts", () => {
  render(<E90LaunchTools locale="de" />);
  fireEvent.change(screen.getByLabelText("Teile (€)"), {
    target: { value: "89,90" },
  });
  const shipping = screen.getByLabelText("Versand (€)");
  fireEvent.change(shipping, { target: { value: "10,10" } });
  expect(screen.getByText("100,00 €")).toBeInTheDocument();

  fireEvent.change(shipping, { target: { value: "-1" } });
  expect(shipping).toHaveAttribute("aria-invalid", "true");
  expect(screen.queryByText("100,00 €")).not.toBeInTheDocument();
});
