import { z } from "zod";

export const passportPhotoSchema = z
  .string()
  .max(350000)
  .regex(/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/);

/** Decode and re-encode pixels locally: no original EXIF or GPS metadata is copied. */
export async function preparePassportPhoto(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !file.size ||
    file.size > 10 * 1024 * 1024
  ) {
    throw new Error("Choose a JPEG, PNG or WebP photo up to 10 MB.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This photo could not be decoded. Export it as JPEG and try again.",
    );
  }
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width * bitmap.height > 50000000
    )
      throw new Error("Choose a photo below 50 megapixels.");
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Photo processing is unavailable in this browser.");
    context.fillStyle = "#f2efe5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.68, 0.5, 0.35]) {
      const result = passportPhotoSchema.safeParse(
        canvas.toDataURL("image/jpeg", quality),
      );
      if (result.success) return result.data;
    }
    throw new Error(
      "This image is still too large after compression. Choose a smaller photo.",
    );
  } finally {
    bitmap.close();
  }
}
