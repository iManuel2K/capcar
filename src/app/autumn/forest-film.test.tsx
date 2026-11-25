// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ForestFilm } from "./forest-film";

it("makes the hero playable from the initial HTML", () => {
  const html = renderToStaticMarkup(
    <ForestFilm source="/desktop.mp4" mobileSource="/mobile.mp4" />,
  );
  const video = html.match(/<video[^>]*>/)?.[0];
  expect(video).toMatch(/autoplay=""/i);
  expect(video).toMatch(/muted=""/);
  expect(video).toMatch(/playsinline=""/i);
  expect(video).toMatch(/preload="auto"/);
  expect(video).toMatch(/loop=""/);
  expect(html).toContain(
    'src="/desktop.mp4" type="video/mp4" media="(prefers-reduced-motion: no-preference) and (min-width: 768px)"',
  );
  expect(html).toContain(
    'src="/mobile.mp4" type="video/mp4" media="(prefers-reduced-motion: no-preference)"',
  );
});
