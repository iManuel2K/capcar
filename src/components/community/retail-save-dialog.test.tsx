import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { RetailItem } from "@/features/retail/retail-contracts";
import { readVehicles } from "@/features/vehicles/vehicle-storage";
import { readWishlist } from "@/features/wishlist/wishlist-storage";
import { RetailSaveDialog } from "./retail-save-dialog";

const offer: RetailItem = {
  id: "example-part",
  title: "BMW E90 rear light",
  price: 45,
  currency: "EUR",
  shipping: 5,
  country: "DE",
  condition: "used",
  url: "https://www.ebay.de/itm/123",
  affiliate: false,
  provider: "ebay",
  retailer: "eBay",
};

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it("keeps the offer while adding a vehicle and saves it to that vehicle's wishlist", () => {
  render(
    <RetailSaveDialog
      item={offer}
      checkedAt="2026-11-12T12:00:00Z"
      onClose={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Add a vehicle" }));
  expect(screen.getByText(offer.title)).toBeVisible();
  fireEvent.change(screen.getByRole("textbox", { name: "Make" }), {
    target: { value: "BMW" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Model" }), {
    target: { value: "318i" },
  });
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Production year" }),
    {
      target: { value: "2011" },
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Add to garage" }));

  const vehicles = readVehicles(localStorage);
  expect(vehicles).toHaveLength(1);
  const [vehicle] = vehicles;
  expect(vehicle).toMatchObject({
    make: "BMW",
    model: "318i",
    productionYear: 2011,
  });
  expect(screen.getByRole("combobox", { name: "Vehicle" })).toHaveValue(
    vehicle.id,
  );
  expect(screen.getByText(offer.title)).toBeVisible();
  expect(screen.getByText("Fitment unverified")).toBeVisible();
  expect(readWishlist(localStorage)).toEqual([]);

  fireEvent.click(screen.getByRole("button", { name: "Save to wishlist" }));
  expect(screen.getByRole("heading", { name: "Listing saved" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Open wishlist" })).toHaveAttribute(
    "href",
    `/garage/${vehicle.id}/wishlist`,
  );
  expect(readWishlist(localStorage)).toMatchObject([
    { vehicleId: vehicle.id, title: offer.title, url: offer.url },
  ]);
});
