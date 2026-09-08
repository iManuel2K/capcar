import { describe, expect, it } from "vitest";

import { getLegalConfiguration } from "@/features/legal/legal-config";

describe("legal configuration", () => {
  it("requires operator, address and privacy contact", () => {
    expect(getLegalConfiguration({}).complete).toBe(false);
    expect(
      getLegalConfiguration({
        NEXT_PUBLIC_LEGAL_OPERATOR: "Capcar Beta",
        NEXT_PUBLIC_LEGAL_ADDRESS: "Example address",
        NEXT_PUBLIC_PRIVACY_CONTACT: "privacy@example.test",
      }).complete,
    ).toBe(true);
  });
});
