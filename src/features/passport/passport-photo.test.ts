import { afterEach, describe, expect, it, vi } from "vitest";
import { passportPhotoSchema, preparePassportPhoto } from "./passport-photo";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Passport photo preparation", () => {
  it("rejects scripts, external URLs and oversized embedded images", async () => {
    expect(
      passportPhotoSchema.safeParse("data:image/svg+xml,<svg/>").success,
    ).toBe(false);
    expect(
      passportPhotoSchema.safeParse("https://tracking.example/photo.jpg")
        .success,
    ).toBe(false);
    expect(
      passportPhotoSchema.safeParse(
        "data:image/jpeg;base64,/9j/" + "A".repeat(350000),
      ).success,
    ).toBe(false);
    await expect(
      preparePassportPhoto(
        new File(["<svg/>"], "image.svg", { type: "image/svg+xml" }),
      ),
    ).rejects.toThrow("JPEG, PNG or WebP");
  });
  it("re-encodes decoded pixels within the size bound and releases the bitmap", async () => {
    const close = vi.fn(),
      drawImage = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 2400, height: 1600, close }),
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,/9j/AAAA",
    );
    const result = await preparePassportPhoto(
      new File(["fixture"], "car.png", { type: "image/png" }),
    );
    expect(result).toBe("data:image/jpeg;base64,/9j/AAAA");
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 800);
    expect(close).toHaveBeenCalledOnce();
  });
});
