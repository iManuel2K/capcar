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
headers.set("Server-Timing", "capcar-home-static");
headers.set("Vary", "RSC");
if (!headers.has("Content-Security-Policy")) {
  throw new Error("The static homepage must retain the site security policy.");
}

const documentPath = "/__capcar-home.html";
const publicDir = new URL("../public/", import.meta.url);
await writeFile(new URL(documentPath.slice(1), publicDir), html);
const staticHeaders = [...headers].map(([key, value]) => `  ${key}: ${value}`);
await writeFile(
  new URL("_headers", publicDir),
  ["/", ...staticHeaders, documentPath, ...staticHeaders, ""].join("\n"),
);

const output = new URL(
  "../netlify/edge-functions/homepage-navigation.js",
  import.meta.url,
);
await mkdir(new URL(".", output), { recursive: true });
await writeFile(
  output,
  `// Only Next client navigation uses the framework handler for the homepage.
export const config = { path: "/", header: { rsc: "1" } };

export default function homepageNavigation(request) {
  const url = new URL(request.url);
  url.pathname = "/__capcar-next-home";
  return url;
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
