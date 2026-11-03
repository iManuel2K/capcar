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
  it("routes AI connection questions before repair guidance", async () => {
    const response = await askCopilot(
      { ...request, message: "how to connect to AI" },
      {},
    );
    expect(response.answer).toContain("API key");
    expect(response.nextActions[0].href).toBe("/account/connections");
  });
  it("advances a chip-only follow-up using previous user context", async () => {
    const response = await askCopilot(
      {
        ...request,
        message: "i did. now what?",
        history: [
          {
            question:
              "I want more power with just a chip upgrade, no mechanical changes",
            answer: "Check maintenance first",
          },
        ],
      },
      {},
    );
    expect(response.answer).toContain("baseline checks are done");
    expect(response.answer).toContain("without mechanical changes");
    expect(response.answer).toContain("N43");
  });
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
