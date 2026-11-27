import { mkdir, readFile, writeFile } from "node:fs/promises";

const appBuild = new URL("../.next/", import.meta.url);
const readBuild = (file) => readFile(new URL(file, appBuild), "utf8");
const [html, prerender, routes] = await Promise.all([
  readBuild("server/app/index.html"),
  readBuild("prerender-manifest.json").then(JSON.parse),
  readBuild("routes-manifest.json").then(JSON.parse),
]);

if (prerender.routes["/"]?.initialRevalidateSeconds !== false) {
  throw new Error("The edge homepage requires a fully static Next.js route.");
}

const headers = new Headers({ "Content-Type": "text/html; charset=utf-8" });
for (const rule of routes.headers) {
  if (
    rule.has?.length ||
    rule.missing?.length ||
    !new RegExp(rule.regex).test("/")
  ) {
    continue;
  }
  for (const { key, value } of rule.headers) headers.set(key, value);
}
headers.set("Cache-Control", "public, max-age=0, must-revalidate");
headers.set(
  "Netlify-CDN-Cache-Control",
  "public, s-maxage=604800, stale-while-revalidate=86400",
);
headers.set(
  "Netlify-Vary",
  "query=_rsc, cookie=__prerender_bypass|__next_preview_data",
);
headers.set("Server-Timing", "capcar-home-edge");
headers.set(
  "Vary",
  "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url",
);
if (!headers.has("Content-Security-Policy")) {
  throw new Error("The edge homepage must retain the site security policy.");
}

const output = new URL(
  "../netlify/edge-functions/homepage-document.js",
  import.meta.url,
);
await mkdir(new URL(".", output), { recursive: true });
await writeFile(
  output,
  `// Generated from the current Next.js build.
const html = ${JSON.stringify(html)};
const headers = ${JSON.stringify(Object.fromEntries(headers))};

export const config = { path: "/", cache: "manual", onError: "bypass" };

export default function homepageDocument(request) {
  const { method, headers: incoming } = request;
  const url = new URL(request.url);
  if (
    url.pathname !== "/" ||
    (method !== "GET" && method !== "HEAD") ||
    !incoming.get("accept")?.includes("text/html") ||
    incoming.has("rsc") ||
    incoming.has("next-router-prefetch") ||
    incoming.has("next-router-segment-prefetch") ||
    url.searchParams.has("_rsc") ||
    /(?:^|;\\s*)(?:__prerender_bypass|__next_preview_data)=/.test(incoming.get("cookie") ?? "")
  ) return;

  return new Response(method === "HEAD" ? null : html, { headers });
}
`,
);

// The browser opens these MP4s with an open-ended range request. Serve that
// request from the edge and let the static CDN handle subsequent seeks.
const heroFiles = ["road-drive-1080p.mp4", "road-drive.mp4"];
await Promise.all(
  heroFiles.map(async (file) => {
    const assetPath = `/autumn/${file}`;
    const video = await readFile(
      new URL(`../public${assetPath}`, import.meta.url),
    );
    const edgeFile = new URL(`./hero-${file.replace(".mp4", "")}.js`, output);
    await writeFile(
      edgeFile,
      `// Generated from the original hero MP4.
import { Buffer } from "node:buffer";

const base64 = ${JSON.stringify(video.toString("base64"))};
export const config = { path: ${JSON.stringify(assetPath)} };

export default function heroMedia(request) {
  const { method, headers } = request;
  if (
    method !== "GET" ||
    headers.get("range") !== "bytes=0-" ||
    headers.has("if-range") ||
    headers.has("if-none-match") ||
    headers.has("if-modified-since")
  ) return;

  const data = Buffer.from(base64, "base64");
  return new Response(data, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Length": "${video.length}",
      "Content-Range": "bytes 0-${video.length - 1}/${video.length}",
      "Content-Type": "video/mp4",
      "Server-Timing": "capcar-hero-edge",
    },
  });
}
`,
    );
  }),
);

console.log(
  "Prepared the prerendered homepage and original hero footage for Netlify edge delivery.",
);
