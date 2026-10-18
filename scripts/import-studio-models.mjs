import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

// Sharp is already shipped by Next. Keep this an offline development-only step;
// the public viewer needs neither an image library nor a Meshopt/WASM decoder.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");

// These are independently attributed, commercially reusable models. Their
// individual licenses, rather than the source repository's code license, apply.
// Run `node scripts/import-studio-models.mjs --verify` for an offline audit.
// --refresh explicitly permits replacing a previously imported local asset.
const sourceCommit = "0a56de377f02f2574d781f6920fed08d6423ec2f";
const sourceRepository = "https://github.com/pedrosoandre/carros";
const baseUrl = `https://raw.githubusercontent.com/pedrosoandre/carros/${sourceCommit}/`;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(root, "public/models/cars");
const manifestPath = resolve(outputDirectory, "manifest.json");
const ids = [
  "audi-r8",
  "audi-tt",
  "bmw-m3-e30",
  "bmw-e36-m3",
  "bmw-320i",
  "volkswagen-beetle",
  "mercedes-benz-190",
  "mercedes-300sl",
  "mercedes-gclass",
  "porsche-911",
  "porsche-911-carrera",
  "mazda-rx-7-fc",
  "mazda-rx-7-fd",
  "toyota-supra-mk",
  "toyota-ae86",
  "nissan-gt-r",
  "nissan-s14",
  "nissan-proto",
  "ford-mustang",
  "honda-civic",
  "honda-nsx",
  "mini-cooper",
  "subaru-impreza",
  "datsun-280z",
  "lamborghini-countach-lp500s",
];
const supportedExtensions = new Set([
  "KHR_mesh_quantization",
  "KHR_materials_anisotropy",
  "KHR_materials_clearcoat",
  "KHR_materials_dispersion",
  "KHR_materials_emissive_strength",
  "KHR_materials_ior",
  "KHR_materials_iridescence",
  "KHR_materials_pbrSpecularGlossiness",
  "KHR_materials_sheen",
  "KHR_materials_specular",
  "KHR_materials_transmission",
  "KHR_materials_unlit",
  "KHR_materials_volume",
  "KHR_texture_transform",
  "EXT_mesh_gpu_instancing",
]);
const refresh = process.argv.includes("--refresh");
const verifyOnly = process.argv.includes("--verify");
const unknownArgs = process.argv
  .slice(2)
  .filter((arg) => !["--refresh", "--verify"].includes(arg));
if (unknownArgs.length)
  throw new Error(`Unknown arguments: ${unknownArgs.join(", ")}`);
if (refresh && verifyOnly)
  throw new Error("--refresh and --verify cannot be combined.");

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const optionalRead = (path) =>
  readFile(path).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
const fetchBytes = async (url) => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "CapCar/1.0 (https://capcar.dev; attributed 3D model library)",
        },
        signal: AbortSignal.timeout(90000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      const declaredLength = Number(
        response.headers.get("content-length") ?? 0,
      );
      if (declaredLength > 40000000)
        throw new Error(`Source asset is too large: ${url}`);
      const result = Buffer.from(await response.arrayBuffer());
      if (result.length > 40000000)
        throw new Error(`Source asset is too large: ${url}`);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < 2)
        await new Promise((done) => setTimeout(done, 750 * (attempt + 1)));
    }
  }
  throw lastError;
};

function parseGlb(bytes) {
  if (
    bytes.length < 28 ||
    bytes.readUInt32LE(0) !== 0x46546c67 ||
    bytes.readUInt32LE(4) !== 2
  )
    throw new Error("Expected a glTF 2.0 binary file.");
  if (bytes.readUInt32LE(8) !== bytes.length)
    throw new Error("GLB total length mismatch.");
  let json;
  let binary;
  let offset = 12;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length)
      throw new Error("Truncated GLB chunk header.");
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    if (length % 4 || offset + 8 + length > bytes.length)
      throw new Error("Invalid GLB chunk length.");
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) {
      if (json || offset !== 12)
        throw new Error("GLB must begin with one JSON chunk.");
      json = JSON.parse(chunk.toString("utf8"));
    } else if (type === 0x004e4942) {
      if (binary) throw new Error("GLB has multiple binary chunks.");
      binary = chunk;
    } else {
      throw new Error(`Unexpected GLB chunk type: ${type}`);
    }
    offset += 8 + length;
  }
  if (!json || !binary || json.asset?.version !== "2.0")
    throw new Error("Incomplete GLB 2.0 asset.");
  return { json, binary };
}

function range(buffer, byteOffset, byteLength, context) {
  if (
    !Number.isInteger(byteOffset) ||
    !Number.isInteger(byteLength) ||
    byteOffset < 0 ||
    byteLength < 0 ||
    byteOffset + byteLength > (buffer?.length ?? 0)
  )
    throw new Error(`Invalid byte range: ${context}`);
  return buffer.subarray(byteOffset, byteOffset + byteLength);
}

function imageTextureRoles(json) {
  const roles = new Map();
  const visit = (value, path = "") => {
    if (!value || typeof value !== "object") return;
    if (Number.isInteger(value.index) && /Texture$/.test(path)) {
      const image = json.textures?.[value.index]?.source;
      if (image !== undefined) {
        const uses = roles.get(image) ?? [];
        uses.push(path);
        roles.set(image, uses);
      }
    }
    for (const [key, child] of Object.entries(value))
      visit(child, path ? `${path}.${key}` : key);
  };
  for (const material of json.materials ?? []) visit(material);
  return roles;
}

async function optimizeEmbeddedTextures(json, viewPayloads) {
  const roles = imageTextureRoles(json);
  const optimized = [];
  for (const [index, image] of (json.images ?? []).entries()) {
    if (image.bufferView === undefined) continue;
    const original = viewPayloads[image.bufferView];
    const metadata = await sharp(original).metadata();
    const uses = roles.get(index) ?? [];
    const colorOnly =
      uses.length > 0 &&
      uses.every((role) =>
        /(?:baseColorTexture|emissiveTexture|diffuseTexture)$/.test(role),
      );
    // Never JPEG-compress normals, metallic/roughness, occlusion or other data
    // maps. Only oversized data maps get a lower-resolution, lossless PNG.
    const maximum = !colorOnly && original.length > 262144 ? 512 : 1024;
    let pipeline = sharp(original).resize({
      width: maximum,
      height: maximum,
      fit: "inside",
      withoutEnlargement: true,
    });
    const jpeg = colorOnly && !metadata.hasAlpha;
    pipeline = jpeg
      ? pipeline.jpeg({
          quality: 82,
          mozjpeg: true,
          chromaSubsampling: "4:4:4",
        })
      : pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    const result = await pipeline.toBuffer({ resolveWithObject: true });
    if (result.data.length >= original.length) continue;
    const previousMime = image.mimeType;
    image.mimeType = jpeg ? "image/jpeg" : "image/png";
    viewPayloads[image.bufferView] = result.data;
    optimized.push({
      image: index,
      roles: uses,
      originalBytes: original.length,
      finalBytes: result.data.length,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      width: result.info.width,
      height: result.info.height,
      originalMimeType: previousMime,
      mimeType: image.mimeType,
    });
  }
  return optimized;
}

async function decodeAndCompact(bytes) {
  const { json, binary } = parseGlb(bytes);
  const sourceBuffers = (json.buffers ?? []).map((buffer, index) => {
    if (buffer.uri) {
      const match =
        /^data:application\/(?:octet-stream|gltf-buffer);base64,([A-Za-z0-9+/=]+)$/.exec(
          buffer.uri,
        );
      if (!match) throw new Error("External or unsupported source buffer URI.");
      return Buffer.from(match[1], "base64");
    }
    return index === 0 ? binary : null; // Meshopt's omitted fallback buffer has no payload.
  });
  const viewPayloads = [];
  let decodedViews = 0;
  await MeshoptDecoder.ready;
  for (const [index, view] of (json.bufferViews ?? []).entries()) {
    const compressed = view.extensions?.EXT_meshopt_compression;
    let payload;
    if (compressed) {
      if (
        !Number.isSafeInteger(compressed.count) ||
        compressed.count <= 0 ||
        !Number.isSafeInteger(compressed.byteStride) ||
        compressed.byteStride <= 0
      )
        throw new Error(`Invalid compressed view layout: ${index}`);
      const decodedLength = compressed.count * compressed.byteStride;
      if (
        !Number.isSafeInteger(decodedLength) ||
        decodedLength !== view.byteLength ||
        decodedLength > 50000000
      )
        throw new Error(`Unexpected decoded view size: ${index}`);
      const source = range(
        sourceBuffers[compressed.buffer],
        compressed.byteOffset ?? 0,
        compressed.byteLength,
        `compressed view ${index}`,
      );
      payload = Buffer.alloc(decodedLength);
      MeshoptDecoder.decodeGltfBuffer(
        payload,
        compressed.count,
        compressed.byteStride,
        source,
        compressed.mode,
        compressed.filter ?? "NONE",
      );
      delete view.extensions.EXT_meshopt_compression;
      if (!Object.keys(view.extensions).length) delete view.extensions;
      decodedViews += 1;
    } else {
      payload = range(
        sourceBuffers[view.buffer],
        view.byteOffset ?? 0,
        view.byteLength,
        `view ${index}`,
      );
    }
    viewPayloads.push(payload);
  }
  for (const key of ["extensionsUsed", "extensionsRequired"]) {
    if (!json[key]) continue;
    json[key] = json[key].filter(
      (extension) => extension !== "EXT_meshopt_compression",
    );
    if (!json[key].length) delete json[key];
  }
  const optimizedTextures = await optimizeEmbeddedTextures(json, viewPayloads);
  const parts = [];
  let totalLength = 0;
  for (const [index, view] of (json.bufferViews ?? []).entries()) {
    const payload = viewPayloads[index];
    const padding = (4 - (totalLength % 4)) % 4;
    if (padding) parts.push(Buffer.alloc(padding));
    totalLength += padding;
    view.buffer = 0;
    view.byteOffset = totalLength;
    view.byteLength = payload.length;
    parts.push(payload);
    totalLength += payload.length;
  }
  json.buffers = [{ byteLength: totalLength }];
  const jsonBytes = Buffer.from(JSON.stringify(json));
  const paddedJson = Buffer.alloc(Math.ceil(jsonBytes.length / 4) * 4, 0x20);
  jsonBytes.copy(paddedJson);
  const paddedBinary = Buffer.concat(parts, Math.ceil(totalLength / 4) * 4);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + paddedBinary.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(paddedBinary.length, 0);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return {
    bytes: Buffer.concat([
      header,
      jsonHeader,
      paddedJson,
      binaryHeader,
      paddedBinary,
    ]),
    decodedViews,
    optimizedTextures,
  };
}

function validate(bytes) {
  const { json, binary } = parseGlb(bytes);
  if (
    json.buffers?.length !== 1 ||
    json.buffers[0].uri ||
    json.buffers[0].byteLength > binary.length
  )
    throw new Error("Final asset must contain one embedded binary buffer.");
  for (const [index, view] of (json.bufferViews ?? []).entries()) {
    if (view.buffer !== 0 || view.extensions?.EXT_meshopt_compression)
      throw new Error(`Unresolved buffer view ${index}`);
    range(binary, view.byteOffset ?? 0, view.byteLength, `final view ${index}`);
  }
  for (const [index, image] of (json.images ?? []).entries()) {
    if (image.uri && !image.uri.startsWith("data:"))
      throw new Error(`External texture URI ${index}`);
    if (image.bufferView !== undefined && !json.bufferViews?.[image.bufferView])
      throw new Error(`Invalid image bufferView ${index}`);
    if (image.bufferView === undefined && !image.uri)
      throw new Error(`Image ${index} has no payload.`);
  }
  if (!json.meshes?.length || !json.scenes?.length)
    throw new Error("Asset has no meshes or scene.");
  for (const mesh of json.meshes) {
    if (!mesh.primitives?.length) throw new Error("Mesh has no primitives.");
    for (const primitive of mesh.primitives) {
      if (!json.accessors?.[primitive.attributes?.POSITION])
        throw new Error("Mesh has no POSITION accessor.");
      if (
        primitive.indices !== undefined &&
        !json.accessors?.[primitive.indices]
      )
        throw new Error("Invalid index accessor.");
      if (
        primitive.material !== undefined &&
        !json.materials?.[primitive.material]
      )
        throw new Error("Invalid material reference.");
    }
  }
  const required = json.extensionsRequired ?? [];
  const unsupported = required.filter(
    (extension) => !supportedExtensions.has(extension),
  );
  if (unsupported.length)
    throw new Error(
      `Unsupported required extensions: ${unsupported.join(", ")}`,
    );
  return {
    meshes: json.meshes.length,
    materials: (json.materials ?? []).map((material) => material.name ?? ""),
    textures: json.images?.length ?? 0,
    extensionsUsed: json.extensionsUsed ?? [],
    extensionsRequired: required,
    optionalUnknownExtensions: (json.extensionsUsed ?? []).filter(
      (extension) => !supportedExtensions.has(extension),
    ),
  };
}

const existingManifestBytes = await optionalRead(manifestPath);
const existingManifest = existingManifestBytes
  ? JSON.parse(existingManifestBytes)
  : null;
if (verifyOnly) {
  if (
    !existingManifest ||
    existingManifest.sourceCommit !== sourceCommit ||
    existingManifest.models?.length !== ids.length
  )
    throw new Error("Missing or outdated model import manifest.");
  for (const id of ids) {
    const entry = existingManifest.models.find((model) => model.id === id);
    if (!entry || entry.file !== `${id}.glb`)
      throw new Error(`Missing manifest entry: ${id}`);
    const bytes = await readFile(resolve(outputDirectory, entry.file));
    if (bytes.length !== entry.finalBytes || hash(bytes) !== entry.finalSha256)
      throw new Error(`Integrity mismatch: ${id}`);
    validate(bytes);
    console.log(`Verified ${id} (${(bytes.length / 1048576).toFixed(2)} MiB)`);
  }
  console.log(
    `Verified all ${ids.length} self-contained, browser-ready car assets.`,
  );
  process.exit(0);
}

const catalog = JSON.parse(
  (await fetchBytes(`${baseUrl}cars.json`)).toString("utf8"),
);
const models = [];
await mkdir(outputDirectory, { recursive: true });
for (const id of ids) {
  const source = catalog.cars.find((car) => car.id === id);
  if (
    !source ||
    source.file !== `${id}.glb` ||
    !["CC Attribution", "CC Attribution-ShareAlike"].includes(
      source.credit?.license,
    )
  )
    throw new Error(`Missing or unsupported source metadata: ${id}`);
  const sourceUrl = `${baseUrl}assets/${source.file}`;
  const raw = await fetchBytes(sourceUrl);
  if (raw.length !== source.bytes)
    throw new Error(`Source size mismatch: ${id}`);
  const rawSha256 = hash(raw);
  const oldEntry = existingManifest?.models?.find((model) => model.id === id);
  if (
    existingManifest?.sourceCommit === sourceCommit &&
    oldEntry &&
    oldEntry.rawSha256 !== rawSha256
  )
    throw new Error(`Pinned upstream source unexpectedly changed: ${id}`);
  const decoded = await decodeAndCompact(raw);
  const details = validate(decoded.bytes);
  const finalSha256 = hash(decoded.bytes);
  const path = resolve(outputDirectory, source.file);
  const existing = await optionalRead(path);
  if (existing && hash(existing) !== finalSha256 && !refresh)
    throw new Error(
      `Refusing to replace a different local model: ${id}. Review it first; use --refresh to permit replacement.`,
    );
  if (!existing || hash(existing) !== finalSha256)
    await writeFile(path, decoded.bytes);
  const requestedMaterials = source.paint?.materials ?? [];
  const missingPaintMaterials = requestedMaterials.filter(
    (name) => !details.materials.includes(name),
  );
  models.push({
    id,
    file: source.file,
    sourceUrl,
    sourceCommit,
    rawBytes: raw.length,
    rawSha256,
    finalBytes: decoded.bytes.length,
    finalSha256,
    decodedBufferViews: decoded.decodedViews,
    optimizedTextures: decoded.optimizedTextures,
    credit: source.credit,
    paint: source.paint,
    missingPaintMaterials,
    ...details,
  });
  console.log(
    `${models.length}/${ids.length} ${id}: ${(raw.length / 1048576).toFixed(2)} → ${(decoded.bytes.length / 1048576).toFixed(2)} MiB; ${decoded.decodedViews} decoded views${missingPaintMaterials.length ? `; missing paint: ${missingPaintMaterials.join(", ")}` : ""}`,
  );
}
const manifest = {
  version: 1,
  sourceRepository,
  sourceCommit,
  transformation:
    "Meshopt decoded offline; geometry, material definitions and original asset metadata retained. Embedded opaque color/emissive textures optimized to JPEG quality 82 (maximum 1024px); alpha and material-data maps remain PNG. Material-data textures larger than 256KiB resized to maximum 512px. Smaller original encodings retained. BufferViews compacted into one self-contained GLB.",
  textureOptimizer: {
    library: "sharp",
    versions: sharp.versions,
    opaqueColorJpegQuality: 82,
    colorMaximumPixels: 1024,
    largeDataTextureThresholdBytes: 262144,
    largeDataMaximumPixels: 512,
    normalAndMaterialDataEncoding: "lossless PNG",
    alphaEncoding: "PNG",
  },
  models,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Imported ${models.length} car assets (${(models.reduce((sum, model) => sum + model.finalBytes, 0) / 1048576).toFixed(2)} MiB total).`,
);
