import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TripPlanner } from "./trip-planner";

vi.mock("@/components/trips/trip-route-map-loader", () => ({
  TripRouteMapLoader: () => null,
}));
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({ vehicles: [] }),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Trip planner composer", () => {
  it("submits the shared input to the existing provider endpoint and preserves a failed draft", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Test provider unavailable" }),
      });
    vi.stubGlobal("fetch", fetch);
    render(
      <TripPlanner
        initialAiConnection={{
          configured: true,
          connected: true,
          provider: "gemini",
        }}
      />,
    );
    const field = screen.getByRole("textbox", { name: "Ask CapCar" });
    fireEvent.change(field, {
      target: { value: "Plan a quiet Black Forest weekend" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(screen.getByText("Test provider unavailable")).toBeVisible(),
    );
    const request = fetch.mock.calls.find(([url]) => url === "/api/ai/trips");
    expect(request).toBeDefined();
    expect(JSON.parse(request![1].body)).toMatchObject({
      prompt: "Plan a quiet Black Forest weekend",
      inputMode: "prompt",
    });
    expect(field).toHaveValue("Plan a quiet Black Forest weekend");
  });
  it("requires the existing connected service rather than showing a working send control", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(
      <TripPlanner
        initialAiConnection={{ configured: true, connected: false }}
      />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });
});
