import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CreateBuildForm } from "@/components/builds/create-build-form";
import { saveJournalChecklist } from "@/features/journal/checklists";
import { JournalChecklist, JournalWorkspace } from "./journal-checklist";
import {
  readJournalChecklists,
  readJournalDraft,
} from "@/features/journal/checklists";
import { locales } from "@/i18n/config";
import { checklistUI } from "@/features/journal/checklist-ui";
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  vehicles: [
    { id: "car-1", make: "BMW", model: "318i", productionYear: 2011 },
    { id: "car-2", make: "VW", model: "Golf", productionYear: 2018 },
  ],
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({ vehicles: mocks.vehicles }),
}));
beforeEach(() => {
  localStorage.clear();
  mocks.push.mockClear();
});
afterEach(cleanup);

it("keeps the inline draft and routes to the exact Journal action without downloads", () => {
  const { container } = render(
    <JournalChecklist slug="build-plan-first-job" locale="en" />,
  );
  fireEvent.change(screen.getByLabelText("Your job or plan"), {
    target: { value: "My first job" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "One job and its purpose are defined",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Continue with my vehicle/ }),
  );
  expect(readJournalDraft("build-plan-first-job", localStorage)?.title).toBe(
    "My first job",
  );
  expect(mocks.push).toHaveBeenCalledWith(
    "/garage/journal?article=build-plan-first-job&locale=en",
  );
  expect(container.querySelector("a[download]")).toBeNull();
});
it("requires a vehicle choice and saves editable progress only to that vehicle", () => {
  render(<JournalWorkspace locale="en" articleSlug="build-plan-first-job" />);
  expect(
    screen.queryByRole("button", { name: /Save checklist to vehicle/ }),
  ).not.toBeInTheDocument();
  fireEvent.change(
    screen.getByLabelText("Choose the vehicle for this checklist"),
    { target: { value: "car-2" } },
  );
  fireEvent.change(screen.getByLabelText("Your job or plan"), {
    target: { value: "Golf weekend" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /Save checklist to vehicle/ }),
  );
  expect(readJournalChecklists(localStorage)[0]).toMatchObject({
    vehicleId: "car-2",
    title: "Golf weekend",
  });
  expect(
    screen.getByRole("link", { name: /Open build planner/ }),
  ).toHaveAttribute(
    "href",
    "/garage/car-2/builds/new?journal=build-plan-first-job",
  );
  expect(screen.getByRole("status")).toHaveTextContent("Checklist saved");
});
it.each(locales)("renders complete %s checklist controls", (locale) => {
  render(<JournalChecklist slug="guide-to-vehicle-history" locale={locale} />);
  expect(
    screen.getByRole("heading", { name: checklistUI[locale].title }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("checkbox")).toHaveLength(5);
});

it("prefills the actual build form from the saved vehicle checklist without creating a build automatically", () => {
  saveJournalChecklist(
    {
      articleSlug: "build-plan-first-job",
      vehicleId: "car-2",
      title: "Golf weekend",
      notes: "Check exact parts before ordering",
      checked: [],
    },
    localStorage,
    ["car-2"],
  );
  render(
    <CreateBuildForm vehicleId="car-2" journalSlug="build-plan-first-job" />,
  );
  expect(screen.getAllByDisplayValue("Golf weekend")).toHaveLength(2);
  expect(
    screen.getByDisplayValue("Check exact parts before ordering"),
  ).toBeInTheDocument();
  expect(localStorage.getItem("capcar.builds.v1")).toBeNull();
});
