# CapCar agent skills

Ponytail, Addy Osmani Agent Skills, Impeccable and Matt Pocock's published skills
are installed in `.agents/skills/`. The 59 additions from PR #79 share this
directory with CapCar's 61 existing skill folders.

See [the Codex setup guide](../docs/codex-skills.md) for verified official sources,
pinned commits, macOS/VS Code setup, invocation examples and runtime requirements.

From the repository root:

```sh
node .agents/tools/verify-skills.mjs
node .agents/tools/verify-skills.mjs --codex
```

The second command needs a terminal Codex executable. Set `CODEX_BIN` to its
absolute path if it is not on PATH. It checks discovery from the repository root
and `src/` without starting a model turn. Existing skills are matched by their
project paths, including skills Codex displays with a plugin namespace.

This checkout uses one installation, one inventory
(`skills-sources.lock.json`) and one verifier (`tools/verify-skills.mjs`).
PR #80 was reconciled with the already merged PR #79; it does not install a
second vendor tree, symlink layer or alternate lockfile. Application code is
unchanged.
