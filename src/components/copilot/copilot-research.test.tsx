import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CopilotResearchSources } from "./copilot-research";
const response = {
  provider: "Your Gemini",
  source: "external" as const,
  answer: "Claim",
  warnings: [],
  evidence: [],
  nextActions: [],
};
afterEach(cleanup);
describe("research presentation", () => {
  it("shows clickable provider sources without claiming verification", () => {
    render(
      <CopilotResearchSources
        response={{
          ...response,
          sources: [
            { title: "Technical data", url: "https://example.com/spec" },
          ],
        }}
        locale="en"
      />,
    );
    expect(
      screen.getByRole("link", { name: "Technical data" }),
    ).toHaveAttribute("href", "https://example.com/spec");
    expect(screen.getByText("Sources returned by your provider")).toBeVisible();
  });
  it("isolates Google's suggestion HTML from the app without script or same-origin permission", () => {
    render(
      <CopilotResearchSources
        response={{
          ...response,
          searchSuggestions: "<div>Search suggestions</div>",
        }}
        locale="en"
      />,
    );
    const frame = screen.getByTitle("Google Search suggestions");
    expect(frame).toHaveAttribute("srcdoc", "<div>Search suggestions</div>");
    expect(frame.getAttribute("sandbox")).not.toContain("allow-scripts");
    expect(frame.getAttribute("sandbox")).not.toContain("allow-same-origin");
  });
  it("does not show a sources section for an unsourced answer", () => {
    render(<CopilotResearchSources response={response} locale="en" />);
    expect(screen.queryByText("Sources returned by your provider")).toBeNull();
  });
});
