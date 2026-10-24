#!/usr/bin/env python3
"""Validate this suite's installed manifests; no network or third-party packages."""
import argparse
import json
import re
from collections import Counter
from pathlib import Path


def verify(root, results=None):
    errors = []
    skills = root / '.agents/skills'
    suite = skills / 'capcar-seo-suite'
    registry = json.loads((suite / 'references/roles.json').read_text())['roles']
    if [r['id'] for r in registry] != list(range(1, 101)):
        errors.append('Registry must contain ordered unique IDs 1-100')
    paths = [root / r['path'] for r in registry] + [suite / 'SKILL.md']
    names = []
    for path in paths:
        if not path.is_file():
            errors.append(f'Missing {path.relative_to(root)}')
            continue
        raw = path.read_text()
        if not raw.startswith('---\n') or '\n---\n' not in raw[4:]:
            errors.append(f'Invalid frontmatter: {path}')
            continue
        metadata = {}
        for line in raw.split('\n---\n', 1)[0].splitlines()[1:]:
            try:
                key, value = line.split(':', 1)
                metadata[key] = json.loads(value.strip())
            except (ValueError, json.JSONDecodeError):
                errors.append(f'Invalid suite metadata: {path}: {line}')
        name = metadata.get('name', '')
        if not re.fullmatch(r'[a-z0-9-]{1,64}', name):
            errors.append(f'Invalid name: {name}')
        if name != path.parent.name:
            errors.append(f'Name/directory mismatch: {path}')
        if not isinstance(metadata.get('description'), str) or not metadata['description']:
            errors.append(f'Missing description: {path}')
        names.append(name)
        for target in re.findall(r'\]\(([^)]+)\)', raw):
            if '://' not in target and not (path.parent / target).resolve().is_file():
                errors.append(f'Broken local reference: {path}: {target}')
        if path.parent != suite:
            policy = path.parent / 'agents/openai.yaml'
            if not policy.is_file() or policy.read_text() != 'policy:\n  allow_implicit_invocation: false\n':
                errors.append(f'Expected explicit-only role policy: {path}')
    if len(names) != 101 or len(set(names)) != 101:
        errors.append('Expected 101 unique suite names (100 roles + coordinator)')
    # Look for name collisions in all pre-existing project skills as well.
    existing = {}
    for path in skills.glob('*/SKILL.md'):
        match = re.search(r'^name:\s*["\']?([^\n"\']+)', path.read_text(), re.M)
        if match:
            name = match.group(1).strip()
            if name in existing and name in names:
                errors.append(f'Duplicate project skill name: {name}')
            existing[name] = str(path)
    summary = {'role_count': len(registry), 'suite_manifest_count': len(paths),
               'project_manifest_count': len(list(skills.glob('*/SKILL.md'))),
               'name_collisions': len(names) - len(set(names)),
               'runtime_discovery': 'not tested; verify in the actual Codex session'}
    if results:
        rows = json.loads(results.read_text())['results']
        if sorted(r['id'] for r in rows) != list(range(1, 101)):
            errors.append('Results must cover every role exactly once')
        for row in rows:
            if row.get('status') not in ('done', 'partial', 'blocked', 'not_applicable'):
                errors.append(f'Invalid status for role {row.get("id")}')
            for key in ('evidence', 'result', 'next_action', 'missing_inputs'):
                if key not in row:
                    errors.append(f'Missing {key} in role {row.get("id")}')
            if row.get('status') == 'blocked' and not row.get('missing_inputs'):
                errors.append(f'Blocked role lacks input gate: {row["id"]}')
        summary['result_counts'] = dict(Counter(r['status'] for r in rows))
    summary['errors'] = errors
    print(json.dumps(summary, indent=2))
    return not errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--results', type=Path, help='Optional suite results JSON')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[4]
    raise SystemExit(0 if verify(repo, args.results) else 1)
