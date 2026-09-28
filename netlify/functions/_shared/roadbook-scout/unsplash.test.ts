import { afterEach, describe, expect, it, vi } from "vitest";

import { searchUnsplashTarget } from "./unsplash";

afterEach(() => vi.restoreAllMocks());

describe("Roadbook Scout Unsplash integration", () => {
  it("keeps returned CDN URLs and attribution metadata", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: "photo-1",
              width: 3000,
              height: 2000,
              color: "#123456",
              description: null,
              alt_description: "A mountain road at sunrise",
              urls: {
                raw: "https://images.unsplash.com/raw",
                full: "https://images.unsplash.com/full",
                regular: "https://images.unsplash.com/regular",
                small: "https://images.unsplash.com/small",
              },
              links: {
                html: "https://unsplash.com/photos/photo-1",
                download_location:
                  "https://api.unsplash.com/photos/photo-1/download",
              },
              user: {
                name: "Test Photographer",
                links: { html: "https://unsplash.com/@photographer" },
              },
              location: { name: "Alps", country: "Austria" },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await searchUnsplashTarget(
      {
        key: "at-alps",
        countryCode: "AT",
        region: "Austrian Alps",
        latitude: 47,
        longitude: 12,
        query: "Austrian Alps road car",
      },
      "server-key",
      2,
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toContain("page=2");
    expect(result?.payload).toMatchObject({
      provider: "unsplash",
      photoId: "photo-1",
      context: "representative",
      image: { url: "https://images.unsplash.com/regular" },
      photographer: { name: "Test Photographer" },
      downloadLocation: "https://api.unsplash.com/photos/photo-1/download",
    });
    expect(result?.sourceUrl).toContain("utm_source=capcar");
  });
});
