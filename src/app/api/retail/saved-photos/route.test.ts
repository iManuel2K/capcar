import { expect, it, vi } from "vitest";
import { POST } from "./route";
import { getEbayListingPhoto } from "@/features/retail/ebay-provider";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";

vi.mock("@/features/retail/ebay-provider", () => ({
  getEbayListingPhoto: vi.fn(),
}));
vi.mock("@/lib/api/public-retail-guard", () => ({
  guardPublicRetail: vi.fn(),
}));

it("looks up each saved listing once and returns only available photos", async () => {
  const available = { itemId: "v1|123456789012|0", market: "DE" };
  const missing = { itemId: "v1|987654321098|0", market: "DE" };
  const imageUrl = "https://i.ebayimg.com/images/g/example/s-l500.jpg";
  vi.mocked(guardPublicRetail).mockResolvedValue(null);
  vi.mocked(getEbayListingPhoto)
    .mockResolvedValueOnce(imageUrl)
    .mockResolvedValueOnce(undefined);

  const origin = "https://capcar.dev";
  const response = await POST(
    new Request(origin + "/api/retail/saved-photos", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify([available, available, missing]),
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([{ ...available, imageUrl }]);
  expect(guardPublicRetail).toHaveBeenCalledTimes(2);
  expect(getEbayListingPhoto).toHaveBeenCalledTimes(2);
});
