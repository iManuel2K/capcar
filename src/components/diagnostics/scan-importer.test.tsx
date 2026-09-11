import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScanImporter } from "./scan-importer";
const originalShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);

beforeEach(() => {
  localStorage.clear();
  // JSDOM lacks the browser's native dialog methods; model opening/closing only.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  for (const [name, descriptor] of [
    ["showModal", originalShow],
    ["close", originalClose],
  ] as const) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

describe("native scan review", () => {
  it("previews pasted codes without saving and lets the owner return to the review", () => {
    const { container } = render(
      <ScanImporter vehicleId="car-a" mileage={123000} />,
    );
    container.querySelector("details")!.open = true;
    fireEvent.change(screen.getByLabelText("Scan text"), {
      target: { value: "ELM327 report: P0301, P0171, P0301" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Inspect scan" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("2 codes found");
    expect(localStorage.length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Review 2 detected codes" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Import 2 codes" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 fault records added",
    );
    expect(localStorage.length).toBeGreaterThan(0);
  });
  it("ignores a slower upload when a newer paste was inspected", async () => {
    let complete!: (text: string) => void;
    const text = new Promise<string>((resolve) => {
      complete = resolve;
    });
    const file = new File(["scan"], "scan.txt", { type: "text/plain" });
    Object.defineProperty(file, "text", { value: () => text });
    const { container } = render(
      <ScanImporter vehicleId="car-a" mileage={123000} />,
    );
    fireEvent.change(screen.getByLabelText("Upload diagnostic scan"), {
      target: { files: [file] },
    });
    container.querySelector("details")!.open = true;
    fireEvent.change(screen.getByLabelText("Scan text"), {
      target: { value: "P0420" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Inspect scan" }));
    await act(async () => {
      complete("P0301");
      await text;
    });
    expect(screen.getByRole("dialog")).toHaveTextContent("P0420");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("P0301");
  });
  it("discards an open review when switching vehicles", () => {
    const { container, rerender } = render(
      <ScanImporter vehicleId="car-a" mileage={1} />,
    );
    container.querySelector("details")!.open = true;
    fireEvent.change(screen.getByLabelText("Scan text"), {
      target: { value: "P0420" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Inspect scan" }));
    rerender(<ScanImporter vehicleId="car-b" mileage={2} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
