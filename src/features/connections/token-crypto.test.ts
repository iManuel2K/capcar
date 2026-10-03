import { describe, expect, it } from "vitest";

import {
  decryptConnectionToken,
  encryptConnectionToken,
} from "@/features/connections/token-crypto";

describe("connection token encryption", () => {
  it("round trips without storing plaintext", () => {
    const secret = "connection-secret-which-is-long-enough";
    const encrypted = encryptConnectionToken("private-token", secret);

    expect(encrypted).not.toContain("private-token");
    expect(decryptConnectionToken(encrypted, secret)).toBe("private-token");
  });

  it("rejects a different encryption key", () => {
    const encrypted = encryptConnectionToken(
      "private-token",
      "connection-secret-which-is-long-enough",
    );
    expect(() =>
      decryptConnectionToken(
        encrypted,
        "different-secret-which-is-also-long-enough",
      ),
    ).toThrow("could not be decrypted");
  });
});
