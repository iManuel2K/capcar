import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopilotWorkspace } from "./copilot-workspace";

vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({
    vehicles: [
      {
        id: "test-car",
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        engineCode: "N43",
        mileage: 0,
      },
    ],
  }),
}));
vi.mock("@/features/builds/use-builds", () => ({
  useBuildState: () => ({ builds: [], items: [] }),
}));
const reply = {
  answer: "Review the recorded maintenance before planning upgrades.",
  source: "deterministic",
  provider: "CapCar rules",
  evidence: ["Saved vehicle"],
  warnings: ["Confirm specifications"],
  nextActions: [
    { label: "Open maintenance", href: "/garage/test-car/maintenance" },
  ],
};
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Copilot conversation integration", () => {
  it("keeps previous answers, prevents parallel requests and preserves a draft typed during a response", async () => {
    let finish: (value: unknown) => void = () => {};
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    render(<CopilotWorkspace vehicleId="test-car" />);
    const field = screen.getByRole("textbox", { name: "Ask CapCar" });
    fireEvent.change(field, {
      target: { value: "What should I check first?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(
      screen.getByRole("button", { name: "Stop generating" }),
    ).toBeEnabled();
    fireEvent.change(field, { target: { value: "My next question" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(fetch).toHaveBeenCalledOnce();
    finish({ ok: true, json: async () => reply });
    await waitFor(() => expect(screen.getByText(reply.answer)).toBeVisible());
    expect(field).toHaveValue("My next question");
    expect(
      screen.getByRole("link", { name: "Open maintenance" }),
    ).toHaveAttribute("href", "/garage/test-car/maintenance");
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...reply, answer: "A second real response." }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(screen.getByText("A second real response.")).toBeVisible(),
    );
    expect(screen.getByText(reply.answer)).toBeVisible();
    expect(field).toHaveValue("");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).not.toHaveProperty("vin");
  });
  it("aborts the real request without erasing the question or showing a failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            options.signal?.addEventListener("abort", () =>
              reject(new DOMException("Cancelled", "AbortError")),
            );
          }),
      ),
    );
    render(<CopilotWorkspace vehicleId="test-car" />);
    const field = screen.getByRole("textbox");
    fireEvent.change(field, { target: { value: "Keep this question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Send message" }),
      ).toBeEnabled(),
    );
    expect(field).toHaveValue("Keep this question");
    expect(screen.queryByText("Cancelled")).toBeNull();
  });
});
