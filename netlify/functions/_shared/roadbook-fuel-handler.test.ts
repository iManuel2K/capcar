import { afterEach, describe, expect, it, vi } from "vitest";

import roadbookFuel from "../roadbook-fuel";

describe("Roadbook fuel endpoint", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TANKERKOENIG_API_KEY;
  });

  it("falls back to OpenStreetMap when Tankerkönig rejects a configured key", async () => {
    process.env.TANKERKOENIG_API_KEY = "rejected-key";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({ ok: false, message: "invalid api key" }),
      )
      .mockResolvedValueOnce(
        Response.json({
          elements: [
            {
              type: "node",
              id: 123,
              lat: 50.11,
              lon: 10.41,
              tags: { amenity: "fuel", name: "Fallback Station" },
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await roadbookFuel(
      new Request(
        "https://capcar.dev/api/roadbook/fuel?lat=50.1&lng=10.4&radius=25&type=all",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      provider: "OpenStreetMap",
      pricing: "directory",
      stations: [expect.objectContaining({ name: "Fallback Station" })],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
