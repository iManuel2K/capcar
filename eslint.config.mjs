import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Installed agent skills include upstream examples, not application code.
    ".agents/**",
    // Generated QA artifacts can contain complete archived worktrees.
    "artifacts/**",
    ".netlify/**",
    "**/.capcar-backups/**",
    "**/capcar-backups/**",
    "**/installer-backups/**",
    "**/_backups/**",
    "**/.capcar-installer-backups/**",
    "**/backups/**",
    "**/backup/**",
    "**/backup-*/**",
  ]),
]);

export default eslintConfig;
