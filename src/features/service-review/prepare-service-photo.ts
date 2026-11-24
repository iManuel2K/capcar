import {
  SERVICE_REVIEW_MAX_IMAGE_EDGE,
  SERVICE_REVIEW_MAX_PHOTO_BASE64,
} from "./service-review-schema";

export type ServicePhotoErrorCode =
  "invalidImage" | "imageTooLarge" | "imageFailed";
export class ServicePhotoError extends Error {
  constructor(readonly code: ServicePhotoErrorCode) {
    super(code);
  }
}

const fileTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Prepare a fresh JPEG in the browser. The original file/metadata is not sent. */
export async function prepareServicePhoto(file: File): Promise<string> {
  if (!fileTypes.has(file.type) || file.size === 0)
    throw new ServicePhotoError("invalidImage");
  if (file.size > 15 * 1024 * 1024)
    throw new ServicePhotoError("imageTooLarge");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 64_000_000
    )
      throw new ServicePhotoError("imageTooLarge");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new ServicePhotoError("imageFailed");

    for (const [edge, quality] of [
      [SERVICE_REVIEW_MAX_IMAGE_EDGE, 0.88],
      [1728, 0.84],
      [1440, 0.76],
    ]) {
      const scale = Math.min(
        1,
        edge / Math.max(image.naturalWidth, image.naturalHeight),
      );
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const prefix = "data:image/jpeg;base64,";
      const encoded = canvas.toDataURL("image/jpeg", quality);
      if (!encoded.startsWith(prefix))
        throw new ServicePhotoError("imageFailed");
      const data = encoded.slice(prefix.length);
      if (data.length <= SERVICE_REVIEW_MAX_PHOTO_BASE64) return data;
    }
    throw new ServicePhotoError("imageTooLarge");
  } catch (error) {
    if (error instanceof ServicePhotoError) throw error;
    throw new ServicePhotoError("imageFailed");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
