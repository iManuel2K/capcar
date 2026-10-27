import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  roadbookGalleryCopy,
  roadbookStylePreviews,
} from "@/features/marketing/roadbook-gallery-copy";
import {
  ROADBOOK_MAP_STYLES,
  readRoadbookMapStyle,
} from "@/features/roadbook/roadbook-map-style";
import { roadbookMapModes } from "@/features/roadbook/roadbook-schema";
import { RoadbookStyleGallery } from "./roadbook-style-gallery";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    onLoad,
    onError,
  }: {
    alt: string;
    src: string;
    onLoad: () => void;
    onError: () => void;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} onLoad={onLoad} onError={onError} />
  ),
}));
afterEach(cleanup);

describe("homepage Roadbook style gallery", () => {
  it("covers the real nine styles and mounts only the first preview initially", () => {
    expect(roadbookStylePreviews.map((style) => style.id)).toEqual(
      roadbookMapModes,
    );
    render(<RoadbookStyleGallery copy={roadbookGalleryCopy.en} />);
    for (const style of roadbookStylePreviews) {
      expect(style.name).toBe(ROADBOOK_MAP_STYLES[style.id].name);
      expect(screen.getByRole("button", { name: style.name })).toBeVisible();
    }
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Open this style" }),
    ).toHaveAttribute("href", "/roadbook?style=konstanz");
  });

  it("supports tap and keyboard navigation without losing focus", () => {
    render(<RoadbookStyleGallery copy={roadbookGalleryCopy.en} />);
    const kyoto = screen.getByRole("button", { name: "Kyoto" });
    fireEvent.click(kyoto);
    expect(kyoto).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Konstanz" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.getByRole("link", { name: "Open this style" }),
    ).toHaveAttribute("href", "/roadbook?style=kyoto");
    fireEvent.keyDown(kyoto, { key: "End" });
    expect(screen.getByRole("button", { name: "Tokyo" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Tokyo" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "Konstanz" })).toHaveFocus();
  });

  it("provides loading, error, retry and ready states without disabling Roadbook", () => {
    render(<RoadbookStyleGallery copy={roadbookGalleryCopy.en} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading map preview");
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "This preview could not load",
    );
    expect(screen.getByRole("link", { name: "Open this style" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retry preview" }));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("retry=1"),
    );
    fireEvent.load(screen.getByRole("img"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each(Object.entries(roadbookGalleryCopy))(
    "provides complete copy in %s",
    (_locale, copy) => {
      expect(copy.captions).toHaveLength(9);
      render(<RoadbookStyleGallery copy={copy} />);
      expect(screen.getByRole("heading", { name: copy.title })).toBeVisible();
      expect(screen.getByRole("link", { name: copy.open })).toHaveAttribute(
        "href",
        "/roadbook?style=konstanz",
      );
      expect(screen.getByRole("img")).toHaveAccessibleName(
        copy.imageAlt.replace("{style}", "Konstanz"),
      );
    },
  );

  it("uses only validated style intent and preserves saved preferences", () => {
    const storage = { getItem: () => "wien" };
    expect(readRoadbookMapStyle(storage, "kyoto")).toBe("kyoto");
    expect(readRoadbookMapStyle(storage, "https://untrusted.test")).toBe(
      "wien",
    );
    expect(readRoadbookMapStyle(undefined, ["tokyo"])).toBe("tokyo");
    expect(
      readRoadbookMapStyle(
        {
          getItem: () => {
            throw new Error("blocked");
          },
        },
        "konstanz",
      ),
    ).toBe("konstanz");
  });
});
