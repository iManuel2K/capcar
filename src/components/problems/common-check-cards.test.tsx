import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";
import {
  readBuildState,
  BUILD_STORAGE_KEY,
} from "@/features/builds/build-storage";
import { commonCheckCopy } from "@/features/problems/common-check-copy";
import { CommonCheckPlanLink } from "./common-check-plan-link";
import { CommonCheckCards } from "./common-check-cards";

const account = vi.hoisted(() => ({ configured: false, userId: "" }));
vi.mock("@/components/account/garage-account-boundary", () => ({
  ACTIVE_GARAGE_USER_KEY: "capcar.active-garage-user.v1",
  useGarageAccount: () => account,
}));
const tracked = vi.hoisted(() => vi.fn());
vi.mock("@/features/analytics/client", () => ({ trackAnalytics: tracked }));
function car() {
  return saveVehicle(
    {
      make: "Opel",
      model: "Astra",
      platform: "ASTRA J",
      productionYear: 2014,
      engineCode: "UNKNOWN",
      bodyStyle: "Unknown",
      transmission: "Unknown",
      mileage: 0,
    },
    localStorage,
  );
}
beforeEach(() => {
  localStorage.clear();
  account.configured = false;
  account.userId = "";
  tracked.mockClear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("common check cards", () => {
  it("shows the steps immediately, saves, reopens after remount and keeps the saved plan across languages", () => {
    const vehicle = car();
    const page = render(<CommonCheckCards vehicle={vehicle} locale="en" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
    const c = commonCheckCopy.en;
    fireEvent.click(
      screen.getByRole("button", {
        name: `${c.save}: ${c.checks.tyres.title}`,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(c.saved);
    const link = screen.getByRole("link", { name: c.openPlan });
    expect(link.getAttribute("href")).toContain(
      encodeURIComponent(`common-checks:${vehicle.id}`),
    );
    page.unmount();
    render(<CommonCheckCards vehicle={vehicle} locale="de" />);
    expect(
      screen.getByRole("link", { name: commonCheckCopy.de.openPlan }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: `${commonCheckCopy.de.save}: ${commonCheckCopy.de.checks.tyres.title}`,
      }),
    ).not.toBeInTheDocument();
    expect(readBuildState(localStorage).items).toHaveLength(1);
    expect(tracked).toHaveBeenCalledExactlyOnceWith("build_item_added", {
      source: "common-problems",
      kind: "maintenance",
    });
  });
  it("links a saved task back to its visible steps and never links another vehicle’s task", () => {
    const vehicle = car();
    const view = render(
      <CommonCheckPlanLink
        vehicle={vehicle}
        itemId={`common-check:${vehicle.id}:tyres`}
        locale="en"
      />,
    );
    expect(
      screen.getByRole("link", { name: commonCheckCopy.en.openCheck }),
    ).toHaveAttribute(
      "href",
      `/garage/${vehicle.id}/known-problems#check-tyres`,
    );
    view.rerender(
      <CommonCheckPlanLink
        vehicle={vehicle}
        itemId="common-check:someone-else:tyres"
        locale="en"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("reports storage failure with a retry button and never reports a successful save", () => {
    const vehicle = car();
    render(<CommonCheckCards vehicle={vehicle} locale="en" />);
    const fail = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    const button = screen.getByRole("button", {
      name: /Save check to plan: Wipers/,
    });
    fireEvent.click(button);
    expect(screen.getByRole("alert")).toHaveTextContent(
      commonCheckCopy.en.saveError,
    );
    expect(
      screen.queryByRole("link", { name: commonCheckCopy.en.openPlan }),
    ).not.toBeInTheDocument();
    expect(tracked).not.toHaveBeenCalled();
    fail.mockRestore();
    fireEvent.click(button);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(readBuildState(localStorage).items).toHaveLength(1);
  });
  it("blocks saving through a stale account context", () => {
    const vehicle = car();
    account.configured = true;
    account.userId = "previous-owner";
    localStorage.setItem("capcar.active-garage-user.v1", "current-owner");
    render(<CommonCheckCards vehicle={vehicle} locale="en" />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByRole("alert")).toBeVisible();
    expect(localStorage.getItem(BUILD_STORAGE_KEY)).toBeNull();
    expect(tracked).not.toHaveBeenCalled();
  });
});
