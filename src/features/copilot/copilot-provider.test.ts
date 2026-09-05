import { describe, expect, it } from "vitest";

import {
  askCopilot,
  getCopilotStatus,
} from "@/features/copilot/copilot-provider";

const request = {
  message: "Can I add more power?",
  vehicle: {
    id: "v1",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    engineCode: "N43",
    mileage: 142000,
  },
  buildItems: [],
};

describe("copilot provider", () => {
  it("uses a safe deterministic provider without credentials", async () => {
    expect(getCopilotStatus({}).mode).toBe("deterministic");
    const response = await askCopilot(request, {});
    expect(response.source).toBe("deterministic");
    expect(response.answer).toContain("maintenance");
    expect(response.warnings.join(" ")).toContain("No torque value");
  });

  it("fails closed when external mode has no credentials", async () => {
    await expect(
      askCopilot(request, { CAPCAR_COPILOT_MODE: "external" }),
    ).rejects.toThrow("not fully configured");
  });
});
