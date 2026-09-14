import { describe, expect, it } from "vitest";
import {
  documentExtension,
  documentName,
  documentPrefix,
} from "./vehicle-documents";
describe("private vehicle evidence", () => {
  it("separates owners and vehicles without path traversal", () => {
    expect(documentPrefix("owner", "vehicle")).toBe("owner/vehicle");
    for (const value of ["../other", "a/b", "", "%2f", "a\\b"])
      expect(() => documentPrefix("owner", value)).toThrow();
  });
  it("checks content headers rather than trusting the extension", () => {
    expect(
      documentExtension(
        "application/pdf",
        new Uint8Array([37, 80, 68, 70, 45]),
      ),
    ).toBe("pdf");
    expect(() =>
      documentExtension("image/png", new Uint8Array([37, 80, 68, 70, 45])),
    ).toThrow();
    expect(() =>
      documentExtension("text/html", new Uint8Array([60, 104, 116, 109, 108])),
    ).toThrow();
  });
  it("uses a unique safe storage name", () => {
    const a = documentName("../Receipt #1.pdf", "pdf");
    expect(a).not.toContain("/");
    expect(a.endsWith(".pdf")).toBe(true);
    expect(documentName("../Receipt #1.pdf", "pdf")).not.toBe(a);
  });
});
