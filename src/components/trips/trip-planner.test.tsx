import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  planScenicTrip,
  tripPlannerRequestSchema,
} from "@/features/trips/trip-planner";
import { TripPlanner } from "./trip-planner";

vi.mock("@/components/trips/trip-route-map-loader", () => ({
  TripRouteMapLoader: () => null,
}));
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({ vehicles: [] }),
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});
describe("Trip planner composer", () => {
  it("automatically resumes the signed-in owner's saved job with its original ID and route brief", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    const { planScenicTrip, tripPlannerRequestSchema } =
      await import("@/features/trips/trip-planner");
    const input = tripPlannerRequestSchema.parse({
      vehicle: "BMW 318i",
      region: "Black Forest",
      startDate: "2026-10-30",
      duration: 2,
      pace: "scenic",
      interests: ["nature"],
      prompt: "A quiet weekend",
      inputMode: "places",
    });
    const plan = await planScenicTrip(input, undefined, {});
    const id = "11111111-1111-4111-8111-111111111111";
    localStorage.setItem(
      "capcar:trip-job:owner",
      JSON.stringify({ id, input, createdAt: Date.now() }),
    );
    const fetch = vi.fn(async (url: string) =>
      url === "/api/ai/trips"
        ? Response.json(plan)
        : Response.json({ error: "Map unavailable" }, { status: 503 }),
    );
    vi.stubGlobal("fetch", fetch);
    render(
      <TripPlanner
        ownerId="owner"
        initialAiConnection={{
          configured: true,
          connected: true,
          provider: "gemini",
        }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: plan.title })).toBeVisible(),
    );
    const calls = fetch.mock.calls as unknown as Array<[string, RequestInit]>;
    const generation = calls.filter(([url]) => url === "/api/ai/trips");
    expect(generation).toHaveLength(1);
    expect(generation[0][1].headers).toMatchObject({ "idempotency-key": id });
    expect(JSON.parse(generation[0][1].body as string)).toEqual(input);
    const route = calls.find(([url]) => url === "/api/ai/trips/route-map");
    expect(JSON.parse(route![1].body as string).startDate).toBe(
      input.startDate,
    );
  });
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
    expect(request![1].headers.accept).toBe("application/x-ndjson");
    expect(request![1].headers.prefer).toBe("respond-async");
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
  it("submits the screenshot wording with Frankfurt as departure, without asking again", async () => {
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
    fireEvent.change(screen.getByRole("textbox", { name: "Ask CapCar" }), {
      target: {
        value:
          "i am in frankfurt. i have a 7 seater and i will drive to pristina. 2 days in Kosovo. i want to visit capital and 3 other beautiful scenic spots.",
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
      origin: "frankfurt",
      duration: 2,
      vehicle: "7 seater",
      prompt: expect.stringContaining("drive to pristina"),
    });
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.queryByText(
        "Add your starting town so CapCar can keep the trip practical.",
      ),
    ).not.toBeInTheDocument();
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
  it("retries only road calculation after a generated itinerary, without paying for another AI plan", async () => {
    const plan = await planScenicTrip(
      tripPlannerRequestSchema.parse({
        vehicle: "BMW 318i",
        region: "Black Forest",
        startDate: "2026-10-30",
        duration: 1,
        pace: "scenic",
        interests: [],
      }),
      undefined,
      {},
    );
    const fetch = vi.fn(async (url: string) => {
      if (url === "/api/ai/trips") return Response.json(plan);
      if (url === "/api/ai/trips/route-map")
        return Response.json({ error: "Routing unavailable" }, { status: 503 });
      return Response.json({}, { status: 401 });
    });
    vi.stubGlobal("fetch", fetch);
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
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
      target: { value: "Starting from Frankfurt. Scenic day trip." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    const retry = await screen.findByRole("button", {
      name: "Retry route calculation",
    });
    fireEvent.click(retry);
    await waitFor(() =>
      expect(
        fetch.mock.calls.filter(([url]) => url === "/api/ai/trips/route-map"),
      ).toHaveLength(2),
    );
    expect(
      fetch.mock.calls.filter(([url]) => url === "/api/ai/trips"),
    ).toHaveLength(1);
    expect(await screen.findByText("Routing unavailable")).toBeVisible();
    expect(screen.getByText(plan.title)).toBeVisible();
  });
});
