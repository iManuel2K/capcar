import type { VehiclePassportPayload } from "./vehicle-passport";

export type PassportIntegrity = "verified" | "legacy";

export async function createPassportRecordHash(
  passport: VehiclePassportPayload,
) {
  const encoded = new TextEncoder().encode(stableStringify(passport));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassportRecordHash(
  passport: VehiclePassportPayload,
  storedHash: string | null,
): Promise<PassportIntegrity | "invalid"> {
  if (!storedHash) return "legacy";
  if (!/^[a-f0-9]{64}$/.test(storedHash)) return "invalid";
  return (await createPassportRecordHash(passport)) === storedHash
    ? "verified"
    : "invalid";
}

export function passportExpiry(days: 30 | 90 | 365 | null, now = new Date()) {
  return days === null
    ? null
    : new Date(now.getTime() + days * 24 * 60 * 60 * 1_000).toISOString();
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value))
    return `[${value
      .map((entry) => stableStringify(entry === undefined ? null : entry))
      .join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
