export async function stableFingerprint(...parts: string[]) {
  const input = parts.map((part) => part.trim().toLowerCase()).join("\u001f");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
