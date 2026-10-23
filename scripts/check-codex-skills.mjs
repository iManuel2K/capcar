#!/usr/bin/env node
// No dependencies, model calls, authentication, or application writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile, lstat, readlink, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const binIndex = args.indexOf('--codex-bin');
const codexBin = binIndex === -1 ? 'codex' : args[binIndex + 1];
assert(codexBin, '--codex-bin requires a path to the Codex executable');

async function listSkills(cwds) {
  const child = spawn(codexBin, ['app-server'], {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const pending = new Map();
  let nextId = 0;
  let stderr = '';
  const lines = createInterface({ input: child.stdout });
  child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000); });
  const fail = (error) => {
    for (const waiter of pending.values()) waiter.reject(error);
    pending.clear();
  };
  child.on('error', fail);
  child.on('exit', (code) => fail(new Error(`Codex app-server exited (${code}): ${stderr}`)));
  child.stdin.on('error', fail);
  lines.on('line', (line) => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
  });
  const timer = setTimeout(() => {
    fail(new Error('Codex discovery timed out after 30 seconds'));
    child.kill();
  }, 30_000);
  try {
    await request('initialize', {
      clientInfo: { name: 'capcar-skill-check', version: '1.0.0' },
    });
    child.stdin.write(`${JSON.stringify({ method: 'initialized' })}\n`);
    return await request('skills/list', { cwds, forceReload: true });
  } finally {
    clearTimeout(timer);
    lines.close();
    child.stdin.end();
    child.kill();
  }
}

try {
  const manifest = JSON.parse(await readFile(path.join(root, '.agents/skill-sources.json'), 'utf8'));
  assert.equal(manifest.version, 1);
  const expected = new Map();
  let fileCount = 0;
  for (const source of manifest.sources) {
    assert.match(source.commit, /^[a-f0-9]{40}$/);
    for (const file of source.files) {
      const absolute = path.resolve(root, file.path);
      assert(absolute.startsWith(path.join(root, '.agents/vendor/')), `Unexpected vendor path: ${file.path}`);
      const hash = createHash('sha256').update(await readFile(absolute)).digest('hex');
      assert.equal(hash, file.sha256, `Changed upstream file: ${file.path}`);
      if (file.executable) {
        assert((await lstat(absolute)).mode & 0o111, `Lost executable mode: ${file.path}`);
      }
      fileCount++;
    }
    for (const skill of source.skills) {
      assert(!expected.has(skill.codexName), `Duplicate installed skill: ${skill.codexName}`);
      const absolute = path.join(root, skill.path);
      assert((await lstat(absolute)).isSymbolicLink(), `Expected project symlink: ${skill.path}`);
      assert.equal(await readlink(absolute), skill.symlink);
      const target = await realpath(absolute);
      assert(target.startsWith(path.join(root, '.agents/vendor/')), `Skill escapes project vendor directory: ${skill.path}`);
      const skillFile = path.join(target, 'SKILL.md');
      const content = await readFile(skillFile, 'utf8');
      assert(content.startsWith('---\n'), `Missing skill frontmatter: ${skill.path}`);
      assert.match(content, new RegExp(`^name: ${skill.name}\\s*$`, 'm'));
      expected.set(skill.codexName, skillFile);
    }
    console.log(`PASS ${source.id}: ${source.skills.length} skills (${source.commit.slice(0, 12)})`);
  }
  // Include pre-existing project skills when checking for ambiguous names.
  const names = new Set();
  for (const entry of await readdir(path.join(root, '.agents/skills'), { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const content = await readFile(path.join(root, '.agents/skills', entry.name, 'SKILL.md'), 'utf8');
    const name = content.match(/^name:\s*([^\n]+)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
    assert(name, `Missing name: ${entry.name}`);
    assert(!names.has(name), `Duplicate project skill name: ${name}`);
    names.add(name);
  }
  console.log(`PASS ${fileCount} upstream file hashes, executable modes, relative symlinks, and ${names.size} unique project names`);

  if (args.includes('--codex')) {
    // The root must also be visible when Codex starts in a nested app directory.
    const cwds = [root, path.join(root, 'src')];
    const result = await listSkills(cwds);
    for (const cwd of cwds) {
      const entry = result.data.find((item) => item.cwd === cwd);
      assert(entry, `No Codex discovery result for ${cwd}`);
      const projectErrors = entry.errors.filter((error) => error.path.startsWith(root + path.sep));
      assert.equal(projectErrors.length, 0, `Codex skill parse errors: ${JSON.stringify(projectErrors)}`);
      for (const [name, skillFile] of expected) {
        const candidates = entry.skills.filter((skill) => skill.name === name);
        const matches = [];
        for (const skill of candidates) {
          if (await realpath(skill.path) === skillFile) matches.push(skill);
        }
        assert.equal(matches.length, 1, `Codex must discover exactly one project copy of ${name}`);
        assert.equal(matches[0].scope, 'repo', `Wrong Codex scope: ${name}`);
        assert.equal(matches[0].enabled, true, `Disabled in local Codex config: ${name}`);
        assert(matches[0].description.length > 0, `Missing Codex description: ${name}`);
        if (candidates.length > 1) console.warn(`NOTE ${name} also exists outside this project; remove duplicate global/plugin installs if unwanted.`);
      }
      console.log(`PASS Codex skills/list: ${expected.size}/${expected.size} enabled repo skills from ${path.relative(root, cwd) || 'repository root'}`);
    }
  } else {
    console.log('To verify actual Codex discovery too: node scripts/check-codex-skills.mjs --codex');
  }
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}
