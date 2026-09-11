import { describe, expect, it } from "vitest";
import { activeSpecialists } from "./specialists";

describe("specialist eligibility", () => {
  it("excludes suspended specialists and the requesting owner", () => {
    const roles = [
      {
        user_id: "active",
        role: "specialist",
        display_name: "Active workshop",
      },
      { user_id: "owner", role: "specialist", display_name: "Owner" },
      {
        user_id: "suspended",
        role: "specialist",
        display_name: "Suspended workshop",
      },
      {
        user_id: "suspended",
        role: "suspended",
        display_name: "Suspended workshop",
      },
      { user_id: "seller", role: "reviewed_seller", display_name: "Seller" },
    ];
    expect(
      activeSpecialists(roles, "owner").map((role) => role.user_id),
    ).toEqual(["active"]);
    expect(activeSpecialists(roles).map((role) => role.user_id)).toEqual([
      "active",
      "owner",
    ]);
  });
});
