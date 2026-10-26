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
    const fetch = vi.fn().mockResolvedValue({
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
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Where are you starting?"), {
      target: { value: "Rüsselsheim, Germany" },
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
  it("keeps text and places together, with optional settings", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Test draft" }),
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
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Where are you starting?")).not.toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Ask CapCar" }), {
      target: { value: "Quiet photo stops" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Choose places" }));
    const fields = screen.getAllByPlaceholderText(
      "City, landmark or exact place",
    );
    fireEvent.change(fields[0], { target: { value: "Pristina" } });
    fireEvent.change(fields[1], { target: { value: "Peje" } });
    fireEvent.click(screen.getByRole("button", { name: "Use these places" }));
    expect(screen.getByRole("textbox", { name: "Ask CapCar" })).toHaveValue(
      "Quiet photo stops",
    );
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(fetch.mock.calls.some(([url]) => url === "/api/ai/trips")).toBe(
        true,
      ),
    );
    const call = fetch.mock.calls.find(([url]) => url === "/api/ai/trips");
    expect(JSON.parse(call![1].body)).toMatchObject({
      inputMode: "places",
      region: "Pristina, Peje",
      prompt: expect.stringContaining("Quiet photo stops"),
    });
  });
  it("uses departure, vehicle and duration already written in the prompt", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Test draft" }),
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
    fireEvent.change(screen.getByRole("textbox", { name: "Ask CapCar" }), {
      target: {
        value:
          "we are starting from pristina. 5 people driving a 7 seater across Kosovo. We would love to visit capital + 3 other scenic places. 2 day vacation.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(fetch.mock.calls.some(([url]) => url === "/api/ai/trips")).toBe(
        true,
      ),
    );
    const call = fetch.mock.calls.find(([url]) => url === "/api/ai/trips");
    expect(JSON.parse(call![1].body)).toMatchObject({
      origin: "pristina",
      duration: 2,
      vehicle: "7 seater",
    });
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
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
  it("asks for the missing start without spending AI credits and applies short-prompt day hints", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false });
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
    fireEvent.change(screen.getByRole("textbox", { name: "Ask CapCar" }), {
      target: { value: "Sunday drive with friends" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(
      screen.getByText(
        "Add your starting town so CapCar can keep the trip practical.",
      ),
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.getByLabelText("Where are you starting?")).toHaveFocus(),
    );
    expect(fetch.mock.calls.some(([url]) => url === "/api/ai/trips")).toBe(
      false,
    );

    expect(
      screen.getByLabelText("Hours available per day, including stops"),
    ).toHaveValue(6);
  });
});
