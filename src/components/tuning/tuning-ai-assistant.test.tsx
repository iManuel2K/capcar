import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TuningAiAssistant } from "./tuning-ai-assistant";
import { generateTuningPlan } from "@/features/tuning/tuning-roadmap";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
const vehicle = {
  id: "car",
  model: "318i",
  make: "BMW",
  engineCode: "N43",
  platform: "E90",
  productionYear: 2011,
  mileage: 140000,
} as Vehicle;
const plan = generateTuningPlan(vehicle, {
  goal: "power",
  experience: "beginner",
  usage: "daily",
  budget: 5000,
  reservePercent: 20,
});
plan.completedChecks = ["baseline:0"];
const reply = {
  provider: "Your Gemini",
  source: "external",
  answer: "A suggested next action.",
  evidence: [],
  warnings: ["Not verified"],
  nextActions: [],
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("tuning AI", () => {
  it("retains the original prompt when the provider rejects a request", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: "Your provider reached a quota limit." }),
            { status: 429 },
          ),
        ),
    );
    render(<TuningAiAssistant vehicle={vehicle} plan={plan} locale="en" />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "chip only" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Improve prompt with AI" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("quota limit"),
    );
    expect(screen.getByRole("textbox")).toHaveValue("chip only");
    expect(
      screen.queryByRole("button", { name: "Restore my wording" }),
    ).toBeNull();
  });
  it("improves a short prompt, allows review/undo and never automatically requests a plan", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...reply,
          answer:
            "Review chip-only tuning for my existing engine. Keep the original hardware.",
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    render(<TuningAiAssistant vehicle={vehicle} plan={plan} locale="en" />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "pwer chip only" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Improve prompt with AI" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("textbox")).toHaveValue(
        "Review chip-only tuning for my existing engine. Keep the original hardware.",
      ),
    );
    expect(fetch).toHaveBeenCalledOnce();
    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent.intent).toBe("tuning_prompt");
    expect(sent.message).toBe("pwer chip only");
    expect(sent.vehicle.engineCode).toBe("N43");
    expect(sent.tuningContext.reserveBudget).toBe(1000);
    expect(sent.tuningContext.stages[0].checks[0].done).toBe(true);
    expect(
      screen.queryByRole("heading", { name: /AI suggestions/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Restore my wording" }));
    expect(screen.getByRole("textbox")).toHaveValue("pwer chip only");
  });
  it("reviews a selected stage with known settings, without changing the saved roadmap", async () => {
    const original = JSON.stringify(plan);
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(reply)));
    vi.stubGlobal("fetch", fetch);
    render(<TuningAiAssistant vehicle={vehicle} plan={plan} locale="en" />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "3. Define a specialist-led power plan",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Ask AI about this plan" }),
    );
    await waitFor(() => expect(screen.getByText(reply.answer)).toBeVisible());
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.intent).toBe("tuning_review");
    expect(body.message).toContain("next three");
    expect(body.tuningContext.selectedStage).toBe("power");
    expect(body.tuningContext.budget).toBe(5000);
    expect(JSON.stringify(plan)).toBe(original);
  });
  it("shows the connection path instead of rules advice when no AI is connected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 409 })),
    );
    render(<TuningAiAssistant vehicle={vehicle} plan={plan} locale="en" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Ask AI about this plan" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("API key"),
    );
    expect(
      screen.getByRole("link", { name: "Connect or manage your AI" }),
    ).toHaveAttribute("href", "/account/connections");
    expect(screen.queryByText(reply.answer)).toBeNull();
  });
  it("prevents overlapping paid requests and aborts on vehicle/plan unmount", async () => {
    let signal: AbortSignal | undefined;
    const fetch = vi.fn().mockImplementation((_url, options) => {
      signal = options.signal;
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () =>
          reject(new Error("abort")),
        );
      });
    });
    vi.stubGlobal("fetch", fetch);
    const view = render(
      <TuningAiAssistant vehicle={vehicle} plan={plan} locale="en" />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Ask AI about this plan" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Improve prompt with AI" }),
    );
    expect(fetch).toHaveBeenCalledOnce();
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });
});
