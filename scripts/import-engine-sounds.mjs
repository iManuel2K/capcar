import { createHash } from "node:crypto";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

// Import only unmodified, independently attributed Commons audio originals.
// Run from the repository root; downloaded assets are verified before publishing.
const root = process.cwd();
const headers = {
  "User-Agent":
    "CapCar/1.0 (https://capcar.dev; licensed engine recording library)",
};
const api = async (params) => {
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ action: "query", format: "json", ...params })}`,
    { headers, signal: AbortSignal.timeout(30000) },
  );
  if (!response.ok) throw new Error(`Commons API ${response.status}`);
  const result = await response.json();
  if (result.error) throw new Error(JSON.stringify(result.error));
  return result.query;
};
const plain = (value = "") =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const categories = [
  "Sounds of automobiles",
  "Sounds of racing automobiles",
  "Sounds of Porsche automobiles",
  "Sounds of Formula One cars",
];
const candidates = new Map();
for (const category of categories) {
  const result = await api({
    list: "categorymembers",
    cmtitle: `Category:${category}`,
    cmlimit: "500",
  });
  for (const item of result.categorymembers ?? [])
    if (item.ns === 6 && /\.(ogg|oga|opus|wav|mp3)$/i.test(item.title))
      candidates.set(item.title, category);
}
const existingHashes = new Set();
for (const name of await readdir(resolve(root, "public/sounds")))
  if (!name.startsWith("commons-") && /\.(ogg|oga|opus|wav)$/i.test(name))
    existingHashes.add(
      createHash("sha1")
        .update(await readFile(resolve(root, "public/sounds", name)))
        .digest("hex"),
    );
const existingCode = (
  await Promise.all(
    ["sound-catalog.ts", "community-sounds.ts", "licensed-sounds.ts"].map(
      (name) =>
        readFile(resolve(root, "src/features/visualizer", name), "utf8"),
    ),
  )
).join("\n");
const excluded =
  /ambient|traffic|street|horn|parking|suspension|En-us|MAC3|Autos auf|Cars passing|Parkhaus|Autostarten|Starting a car|Trophy Truck|Superleague|917 40th|Launching sound|Corolla.*Zero car|WWS Police|Avertisseur/i;
const output = JSON.parse(
  await readFile(
    resolve(root, "src/features/visualizer/expanded-sounds.json"),
    "utf8",
  ).catch(() => "[]"),
);
for (const item of output) existingHashes.add(item.sha1);
for (const [title, category] of candidates) {
  if (output.length >= 100) break;
  if (excluded.test(title)) continue;
  const file = title.slice(5);
  if (
    existingCode.includes(file) ||
    existingCode.includes(file.replaceAll(" ", "_"))
  )
    continue;
  const data = await api({
    prop: "imageinfo",
    titles: title,
    iiprop: "url|sha1|size|mime|extmetadata|commonmetadata",
  });
  const info = Object.values(data.pages)[0]?.imageinfo?.[0];
  if (
    !info ||
    !(info.mime?.startsWith("audio/") || info.mime === "application/ogg") ||
    info.size > 6000000
  )
    continue;
  const meta = info.extmetadata ?? {};
  const license = plain(meta.LicenseShortName?.value);
  const licenseUrl = meta.LicenseUrl?.value;
  const author = plain(meta.Artist?.value);
  if (
    !author ||
    !/^https:\/\//.test(licenseUrl ?? "") ||
    !/^(CC BY(?:-SA)? [234]\.0|CC0|Public domain)$/i.test(license)
  )
    continue;
  if (existingHashes.has(info.sha1)) continue;
  const id = `commons-${file
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  const ext = file.split(".").pop().toLowerCase();
  const audio = `${id}.${ext}`;
  let bytes = await readFile(resolve(root, "public/sounds", audio)).catch(
    () => null,
  );
  if (!bytes) {
    await new Promise((done) => setTimeout(done, 1100));
    const response = await fetch(info.url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      console.log(`Skipped HTTP ${response.status}: ${file}`);
      continue;
    }
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const sha1 = createHash("sha1").update(bytes).digest("hex");
  // imageinfo hashes use base 36; convert without floating-point loss.
  let expected = 0n;
  for (const char of info.sha1)
    expected = expected * 36n + BigInt(parseInt(char, 36));
  if (
    info.sha1.length !== 40 &&
    expected.toString(16).padStart(40, "0") !== sha1
  )
    throw new Error(`Integrity mismatch: ${file}`);
  if (info.sha1.length === 40 && info.sha1 !== sha1)
    throw new Error(`Integrity mismatch: ${file}`);
  if (existingHashes.has(sha1)) continue;
  await writeFile(resolve(root, "public/sounds", audio), bytes);
  existingHashes.add(sha1);
  const duration = Number(info.duration ?? 0);
  output.push({
    id,
    title: file.replace(/\.[^.]+$/, "").replaceAll("_", " "),
    cylinders: 0,
    duration: duration
      ? `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`
      : "Recording",
    file,
    audio,
    author,
    license,
    licenseUrl,
    sha1,
    category: /racing|Formula/.test(category) ? "motorsport" : "road",
    source: info.descriptionurl,
  });
  await writeFile(
    resolve(root, "src/features/visualizer/expanded-sounds.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(`${output.length + 50}/150 ${file}`);
  if (output.length === 100) break;
}
await writeFile(
  resolve(root, "src/features/visualizer/expanded-sounds.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`Imported ${output.length} unique licensed recordings.`);
