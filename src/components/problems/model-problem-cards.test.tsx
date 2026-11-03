import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { vehicleSchema } from "@/features/vehicles/vehicle-schema";
import { additionalGarageCars } from "@/features/vehicles/additional-garage-cars";
import { ModelProblemCards } from "./model-problem-cards";
import { modelProblemCopy } from "@/features/problems/model-problem-copy";
import { locales } from "@/i18n/config";
function car(id = "audi-a1-8x", year = 2014) {
  return vehicleSchema.parse({
    ...additionalGarageCars.find((car) => car.id === id),
    productionYear: year,
    engineCode: "UNKNOWN",
    bodyStyle: "Unknown",
    transmission: "Unknown",
    mileage: 0,
    createdAt: "2026-11-03T12:00:00.000Z",
  });
}
afterEach(cleanup);
describe("readable model problem cards", () => {
  it("shows each symptom, first check and help boundary immediately in every language", () => {
    for (const locale of locales) {
      const c = modelProblemCopy[locale];
      const view = render(
        <ModelProblemCards vehicle={car()} locale={locale} />,
      );
      expect(
        screen.getByRole("heading", { name: c.topics.oil.title }),
      ).toBeVisible();
      expect(screen.getByText(c.topics.oil.notice)).toBeVisible();
      expect(screen.getByText(c.topics.oil.check)).toBeVisible();
      expect(screen.getByText(c.topics.oil.help)).toBeVisible();
      expect(screen.getByText(c.candidate)).toBeVisible();
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        expect.stringContaining("audi-a1-182"),
      );
      expect(view.container.querySelector("details")).toBeNull();
      view.unmount();
    }
  });
  it("shows year limits and a truthful empty state when no year-specific note applies", () => {
    const view = render(
      <ModelProblemCards vehicle={car("audi-q5-8r", 2012)} locale="en" />,
    );
    expect(screen.getByText(/Source registration years: 2012/)).toBeVisible();
    expect(screen.getByText(modelProblemCopy.en.yearHint)).toBeVisible();
    view.rerender(
      <ModelProblemCards vehicle={car("audi-q5-8r", 2014)} locale="en" />,
    );
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByText(modelProblemCopy.en.noPattern)).toBeVisible();
  });
  it("does not render a different car's problem report", () => {
    const view = render(
      <ModelProblemCards vehicle={{ ...car(), platform: "8Y" }} locale="en" />,
    );
    expect(view.container).toBeEmptyDOMElement();
  });
});
