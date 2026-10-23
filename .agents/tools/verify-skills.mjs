import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const lock = JSON.parse(await readFile(path.join(root, ".agents/skills-sources.lock.json"), "utf8"));
const expected = lock.sources.flatMap((source) => source.skills);

async function verifyFiles() {
  let count = 0;
  for (const source of lock.sources) {
    assert.match(source.commit, /^[a-f0-9]{40}$/);
    for (const file of source.files) {
      const target = path.resolve(root, file.path);
      assert.ok(target.startsWith(`${root}${path.sep}`), `Path outside repository: ${file.path}`);
      const bytes = await readFile(target);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256, `Changed upstream file: ${file.path}`);
      if (file.mode === "100755" && process.platform !== "win32") {
        assert.ok((await stat(target)).mode & 0o111, `Missing executable bit: ${file.path}`);
      }
      count++;
    }
  }
  const names = new Set();
  const projectSkills = [];
  for (const entry of await readdir(path.join(root, ".agents/skills"), { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const skillPath = `.agents/skills/${entry.name}/SKILL.md`;
    let text;
    try { text = await readFile(path.join(root, skillPath), "utf8"); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    const name = text.match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();
    assert.ok(name, `Missing skill name: ${skillPath}`);
    assert.ok(!names.has(name), `Duplicate project skill name: ${name}`);
    names.add(name);
    projectSkills.push({ name, path: skillPath });
  }
  for (const skill of expected) assert.ok(names.has(skill.name), `Missing skill: ${skill.name}`);
  console.log(`PASS: ${expected.length} pinned skills, ${count} upstream files; ${projectSkills.length} project skills with unique names.`);
  return projectSkills;
}

async function verifyCodex(projectSkills) {
  // The app-server skills/list API uses Codex's real loader, without a model turn.
  const child = spawn(process.env.CODEX_BIN || "codex", ["app-server", "--listen", "stdio://"], {
    cwd: root,
    stdio: ["pipe", "pipe", "pipe"],
  });
  const lines = createInterface({ input: child.stdout });
  const pending = new Map();
  let nextId = 0;
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-4000); });
  const fail = (error) => {
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  };
  child.on("error", fail);
  child.on("exit", (code) => fail(new Error(`Codex exited (${code}). ${stderr}`)));
  child.stdin.on("error", fail);
  lines.on("line", (line) => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
  });
  const timeout = setTimeout(() => {
    fail(new Error("Codex skills/list timed out after 30 seconds."));
    child.kill();
  }, 30_000);
  try {
    const initialization = await request("initialize", {
      clientInfo: { name: "capcar-skills-check", version: "1.0.0" },
    });
    child.stdin.write(`${JSON.stringify({ method: "initialized" })}\n`);
    const result = await request("skills/list", { cwds: [root], forceReload: true });
    const entry = result.data.find((item) => path.resolve(item.cwd) === path.resolve(root));
    assert.ok(entry, "Codex did not return this repository's skill inventory.");
    const projectErrors = entry.errors.filter((error) => path.resolve(error.path).startsWith(path.join(root, ".agents") + path.sep));
    assert.deepEqual(projectErrors, [], "Codex reported invalid project skills.");
    for (const skill of expected) {
      const found = entry.skills.find((item) => item.name === skill.name && path.resolve(item.path) === path.join(root, skill.path));
      assert.ok(found, `Codex did not discover ${skill.name} at its project path. Same-name results: ${JSON.stringify(entry.skills.filter((item) => item.name === skill.name).map((item) => ({ path: item.path, scope: item.scope })))}`);
      assert.equal(found.enabled, true, `Codex has disabled ${skill.name}.`);
      assert.equal(found.scope.toLowerCase(), "repo", `Wrong scope for ${skill.name}.`);
    }
    console.log(`PASS: Codex discovered and enabled all ${expected.length} pinned additions at REPO scope.`);
    const otherSkills = projectSkills.filter((skill) => !expected.some((addition) => addition.name === skill.name));
    const missing = otherSkills.filter((skill) => !entry.skills.some((item) => item.name === skill.name && path.resolve(item.path) === path.join(root, skill.path)));
    console.log(`Existing project skills discovered: ${otherSkills.length - missing.length}/${otherSkills.length}.`);
    if (missing.length) console.warn(`Existing skills absent from Codex's inventory (not changed by this installation): ${missing.map((skill) => skill.name).join(", ")}.`);
    console.log(`Codex app-server: ${initialization.userAgent || "initialized"}`);
    if (entry.errors.length) console.warn(`${entry.errors.length} unrelated user/system skill error(s) were excluded from the project check.`);
  } finally {
    clearTimeout(timeout);
    lines.close();
    child.stdin.end();
    child.kill();
    child.stdout.destroy();
    child.stderr.destroy();
    child.unref();
  }
}

try {
  const args = process.argv.slice(2);
  assert.ok(args.every((arg) => arg === "--codex"), "Usage: node .agents/tools/verify-skills.mjs [--codex]");
  const projectSkills = await verifyFiles();
  if (args.includes("--codex")) await verifyCodex(projectSkills);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
