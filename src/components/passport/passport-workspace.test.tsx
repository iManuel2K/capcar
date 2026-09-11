import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PassportWorkspace } from "./passport-workspace";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";
import { savePassportProfile } from "@/features/passport/vehicle-passport";
import { downloadTextFile } from "@/features/export/download";

vi.mock("@/features/export/download", () => ({ downloadTextFile: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => {
    throw new Error("Offline test");
  },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Passport privacy and resilience", () => {
  it("exports only the selected vehicle and requires consent for insurance and photos", async () => {
    localStorage.clear();
    const input = {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      bodyStyle: "Sedan" as const,
      engineCode: "N43",
      transmission: "Manual" as const,
      mileage: 100000,
    };
    saveVehicle(input, localStorage, { id: "selected" });
    saveVehicle({ ...input, model: "Other private vehicle" }, localStorage, {
      id: "private-other",
    });
    savePassportProfile(
      {
        vehicleId: "selected",
        publishOwnerDetails: false,
        includeFullVin: false,
        insurancePolicyNumber: "PRIVATE-POLICY",
        photoDataUrl: "data:image/jpeg;base64,/9j/AAAA",
      },
      localStorage,
    );
    render(<PassportWorkspace vehicleId="selected" />);
    fireEvent.click(screen.getByRole("button", { name: "JSON" }));
    const exported = vi.mocked(downloadTextFile).mock.calls[0][1];
    expect(exported).not.toContain("garageSnapshot");
    expect(exported).not.toContain("private-other");
    expect(exported).not.toContain("PRIVATE-POLICY");
    expect(exported).not.toContain("data:image");
    expect(JSON.parse(exported).passport.vehicle.id).toBe("selected");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Offline test"),
    );
    expect(
      screen.getByRole("button", { name: "Refresh shared links" }),
    ).toBeEnabled();
  });
});
