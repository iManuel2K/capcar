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
  "Vary",
  "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url",
);
if (!headers.has("Content-Security-Policy")) {
  throw new Error("The edge homepage must retain the site security policy.");
}

const output = new URL(
  "../netlify/edge-functions/homepage-document.mjs",
  import.meta.url,
);
await mkdir(new URL(".", output), { recursive: true });
await writeFile(
  output,
  `// Generated from the current Next.js build.
const html = ${JSON.stringify(html)};
const headers = ${JSON.stringify(Object.fromEntries(headers))};

export const config = { path: "/" };

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

console.log("Prepared the prerendered homepage for Netlify edge delivery.");
