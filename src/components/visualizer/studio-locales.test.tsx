import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../messages/public/en.json";
import de from "../../../messages/public/de.json";
import el from "../../../messages/public/el.json";
import sq from "../../../messages/public/sq.json";
import ja from "../../../messages/public/ja.json";
import { ConceptStudio } from "./concept-studio";

vi.unmock("next-intl");
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("Studio in all five languages", () => {
  it.each(Object.entries({ en, de, el, sq, ja }))(
    "keeps selection, filtering and saved directions working in %s",
    (locale, messages) => {
      const c = messages.CarStudio;
      render(
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="UTC"
          onError={(error) => {
            throw error;
          }}
        >
          <ConceptStudio />
        </NextIntlClientProvider>,
      );
      expect(screen.getByRole("button", { name: c.load })).toBeEnabled();
      expect(
        screen.getByText(c.modelNotes["bmw-m3-e30"], { exact: false }),
      ).toBeVisible();
      const collection = screen.getByLabelText(c.collectionLabel);
      fireEvent.change(screen.getByRole("searchbox", { name: c.search }), {
        target: { value: "Skyline" },
      });
      expect(within(collection).getAllByRole("button")).toHaveLength(1);
      fireEvent.click(within(collection).getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: c.save }));
      expect(screen.getByText(c.saved)).toBeVisible();
      expect(JSON.parse(localStorage.getItem("capcar.car-studio.v1")!)).toEqual(
        {
          modelId: "nissan-gt-r",
          paint: null,
        },
      );
      fireEvent.change(screen.getByRole("combobox", { name: c.choose }), {
        target: { value: "audi-r8" },
      });
      fireEvent.click(screen.getByRole("button", { name: c.restore }));
      expect(screen.getByText(c.restored)).toBeVisible();
      expect(screen.getByRole("combobox", { name: c.choose })).toHaveValue(
        "nissan-gt-r",
      );
    },
  );
});
