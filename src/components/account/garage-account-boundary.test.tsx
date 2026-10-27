import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GarageAccountBoundary,
  ACTIVE_GARAGE_USER_KEY,
} from "./garage-account-boundary";
import { createClient } from "@/lib/supabase/client";
import {
  VEHICLE_STORAGE_KEY,
  VEHICLE_STORAGE_EVENT,
} from "@/features/vehicles/vehicle-storage";
import { readSyncMetadata } from "@/features/sync/sync-metadata";

vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
const router = { replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/garage",
}));
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("garage cloud save races", () => {
  it("keeps mid-upload edits unsynced and serializes the next save", async () => {
    let finish!: (value: { error: null }) => void;
    const upsert = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue({ error: null });
    const chain = {
      select: () => chain,
      eq: () => chain,
      maybeSingle: async () => ({ data: null, error: null }),
      upsert,
    };
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
      from: () => chain,
    } as unknown as ReturnType<typeof createClient>);
    localStorage.setItem(ACTIVE_GARAGE_USER_KEY, "owner");
    render(
      <GarageAccountBoundary configured>
        <span>Private garage</span>
      </GarageAccountBoundary>,
    );
    await screen.findByText("Private garage");
    const syncedAt = readSyncMetadata(localStorage)?.lastSyncedAt;
    act(() => {
      localStorage.setItem(VEHICLE_STORAGE_KEY, "first snapshot");
      window.dispatchEvent(new Event(VEHICLE_STORAGE_EVENT));
      window.dispatchEvent(new Event("online"));
    });
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    act(() => {
      localStorage.setItem(VEHICLE_STORAGE_KEY, "newer snapshot");
      window.dispatchEvent(new Event(VEHICLE_STORAGE_EVENT));
    });
    await act(async () => {
      finish({ error: null });
    });
    expect(readSyncMetadata(localStorage)?.lastSyncedAt).toBe(syncedAt);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Changes waiting to sync",
    );
    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(2));
    expect(upsert.mock.calls[1][0].payload.data[VEHICLE_STORAGE_KEY]).toBe(
      "newer snapshot",
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Garage synced"),
    );
  });
});
