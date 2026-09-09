import { describe, expect, it } from "vitest";

import { isMissingPassportResponse } from "./capcar-smoke-contract.mjs";

const unavailableBody = `
  <meta name="robots" content="noindex, nofollow" />
  <p>Passport unavailable</p>
  <h1>This link is no longer public.</h1>
`;

describe("missing Passport smoke contract", () => {
  it("accepts a direct HTTP 404", () => {
    expect(
      isMissingPassportResponse({ status: 404, body: "", robotsHeader: null }),
    ).toBe(true);
  });

  it("accepts the protected streamed not-found document", () => {
    expect(
      isMissingPassportResponse({
        status: 200,
        body: unavailableBody,
        robotsHeader: null,
      }),
    ).toBe(true);
  });

  it("accepts noindex supplied as a response header", () => {
    expect(
      isMissingPassportResponse({
        status: 200,
        body: unavailableBody.replace(/<meta[^>]+>/, ""),
        robotsHeader: "noindex, nofollow",
      }),
    ).toBe(true);
  });

  it("rejects a normal 200 page even when the route is noindex", () => {
    expect(
      isMissingPassportResponse({
        status: 200,
        body: '<meta name="robots" content="noindex" /><h1>Vehicle Passport</h1>',
        robotsHeader: null,
      }),
    ).toBe(false);
  });

  it("rejects an unavailable-looking page without crawler protection", () => {
    expect(
      isMissingPassportResponse({
        status: 200,
        body: unavailableBody.replace(/<meta[^>]+>/, ""),
        robotsHeader: null,
      }),
    ).toBe(false);
  });
});
