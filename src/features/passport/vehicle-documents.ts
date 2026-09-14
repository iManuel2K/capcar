export const DOCUMENT_BUCKET = "vehicle-documents";
export const DOCUMENT_LIMIT = 10 * 1024 * 1024;
export function documentPrefix(userId: string, vehicleId: string) {
  if (
    !/^[a-zA-Z0-9_-]{1,100}$/.test(userId) ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(vehicleId)
  )
    throw new Error("Invalid vehicle document location.");
  return `${userId}/${vehicleId}`;
}
export function documentExtension(type: string, bytes: Uint8Array) {
  const starts = (signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);
  if (type === "application/pdf" && starts([37, 80, 68, 70, 45])) return "pdf";
  if (type === "image/jpeg" && starts([255, 216, 255])) return "jpg";
  if (type === "image/png" && starts([137, 80, 78, 71, 13, 10, 26, 10]))
    return "png";
  if (
    type === "image/webp" &&
    starts([82, 73, 70, 70]) &&
    bytes[8] === 87 &&
    bytes[9] === 69 &&
    bytes[10] === 66 &&
    bytes[11] === 80
  )
    return "webp";
  throw new Error("Choose a genuine PDF, JPG, PNG or WebP file.");
}
export function documentName(original: string, extension: string) {
  const stem =
    original
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 70) || "document";
  return `${crypto.randomUUID()}--${stem}.${extension}`;
}
