import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteOwnVehicleDocuments } from "./delete-vehicle-documents";
describe("document deletion before account removal", () => {
  it("removes owner files via Storage and re-lists until empty", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ name: "car", id: null }], error: null })
      .mockResolvedValueOnce({
        data: [{ name: "receipt.pdf", id: "file" }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [], error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        getUser: async () => ({ data: { user: { id: "owner" } }, error: null }),
      },
      storage: { from: () => ({ list, remove }) },
    } as unknown as SupabaseClient;
    await deleteOwnVehicleDocuments(client);
    expect(remove).toHaveBeenCalledWith(["owner/car/receipt.pdf"]);
    expect(list).toHaveBeenCalledTimes(3);
  });
  it("propagates permission errors instead of claiming removal", async () => {
    const client = {
      auth: {
        getUser: async () => ({ data: { user: { id: "owner" } }, error: null }),
      },
      storage: {
        from: () => ({
          list: async () => ({ data: null, error: { message: "Forbidden" } }),
        }),
      },
    } as unknown as SupabaseClient;
    await expect(deleteOwnVehicleDocuments(client)).rejects.toThrow(
      "could not be listed",
    );
  });
});
