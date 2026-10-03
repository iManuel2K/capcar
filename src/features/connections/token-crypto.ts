import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const VERSION = "v1";

function keyFromSecret(secret: string) {
  if (secret.length < 32)
    throw new Error(
      "Connection encryption key must contain at least 32 characters.",
    );
  return createHash("sha256").update(secret).digest();
}

export function encryptConnectionToken(token: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv, tag, ciphertext]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(".");
}

export function decryptConnectionToken(payload: string, secret: string) {
  const [version, ivValue, tagValue, ciphertextValue, ...rest] =
    payload.split(".");
  if (
    version !== VERSION ||
    !ivValue ||
    !tagValue ||
    !ciphertextValue ||
    rest.length
  )
    throw new Error("Stored connection token is invalid.");
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      keyFromSecret(secret),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    throw new Error("Stored connection token could not be decrypted.", {
      cause: error,
    });
  }
}
