import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DrivingReviewWorkspace } from "./driving-review-workspace";
import { DRIVING_REVIEW_KEY } from "@/features/driving-review/storage";
const mocks = vi.hoisted(() => ({ sample: vi.fn() }));
vi.mock("@/components/account/garage-account-boundary", () => ({
  ACTIVE_GARAGE_USER_KEY: "capcar.active-garage-user.v1",
  useGarageAccount: () => ({ configured: true, userId: "owner-a" }),
}));
vi.mock("@/features/vehicles/use-vehicles", () => ({
  useVehicles: () => ({
    vehicles: [
      { id: "car-a", make: "BMW", model: "318i", productionYear: 2011 },
    ],
  }),
}));
vi.mock("@/features/driving-review/frames", async (original) => ({
  ...(await original<object>()),
  sampleDrivingClip: mocks.sample,
}));
const review = {
  summary: "Private reflection for owner A",
  limitations: ["Only sparse frames are available."],
  tips: [],
};
const saved = {
  vehicleId: "car-a",
  learning: false,
  preferences: [],
  reviews: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      createdAt: "2026-11-08T12:00:00.000Z",
      provider: "gemini",
      frameTimes: [1, 3],
      review,
    },
  ],
};
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("capcar.active-garage-user.v1", "owner-a");
  mocks.sample.mockResolvedValue({
    duration: 4,
    frames: [
      { time: 1, image: "data:image/jpeg;base64,YWJjZA==" },
      { time: 3, image: "data:image/jpeg;base64,YWJjZA==" },
    ],
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ connected: true, provider: "gemini" }),
      ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});
describe("driving review account boundaries", () => {
  it("hides private history immediately when another account becomes active", async () => {
    localStorage.setItem(DRIVING_REVIEW_KEY, JSON.stringify([saved]));
    render(<DrivingReviewWorkspace vehicleId="car-a" />);
    expect(
      await screen.findByText("Private reflection for owner A"),
    ).toBeInTheDocument();
    localStorage.setItem("capcar.active-garage-user.v1", "owner-b");
    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "capcar.active-garage-user.v1",
        newValue: "owner-b",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign in again");
    expect(
      screen.queryByText("Private reflection for owner A"),
    ).not.toBeInTheDocument();
  });
  it("keeps submission disabled without consent and carries the current owner", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation((url) =>
        Promise.resolve(
          Response.json(
            url === "/api/connections/ai"
              ? { connected: true, provider: "gemini" }
              : { review, provider: "gemini" },
          ),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    render(<DrivingReviewWorkspace vehicleId="car-a" />);
    await screen.findByText("Review with Gemini");
    fireEvent.change(
      screen.getByLabelText("Choose driving footage", { selector: "input" }),
      {
        target: {
          files: [new File(["test"], "clip.mp4", { type: "video/mp4" })],
        },
      },
    );
    const submit = await screen.findByRole("button", {
      name: "Review selected frames",
    });
    expect(submit).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /I have permission/ }),
    );
    fireEvent.click(submit);
    await screen.findByText("Private reflection for owner A");
    const call = fetcher.mock.calls.find(
      (args) => args[0] === "/api/ai/driving-review",
    );
    expect(call?.[1].headers["x-capcar-owner"]).toBe("owner-a");
    expect(JSON.parse(call?.[1].body).preferences).toEqual([]);
    expect(localStorage.getItem(DRIVING_REVIEW_KEY)).toBeNull();
  });
  it("aborts in-flight analysis when the page unmounts", async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url, options) => {
        if (url === "/api/connections/ai")
          return Promise.resolve(
            Response.json({ connected: true, provider: "gemini" }),
          );
        signal = options.signal;
        return new Promise(() => {});
      }),
    );
    const view = render(<DrivingReviewWorkspace vehicleId="car-a" />);
    await screen.findByText("Review with Gemini");
    fireEvent.change(
      screen.getByLabelText("Choose driving footage", { selector: "input" }),
      {
        target: {
          files: [new File(["test"], "clip.mp4", { type: "video/mp4" })],
        },
      },
    );
    await screen.findByRole("button", {
      name: "Review selected frames",
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /I have permission/ }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Review selected frames",
      }),
    );
    await waitFor(() => expect(signal).toBeDefined());
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });
});
