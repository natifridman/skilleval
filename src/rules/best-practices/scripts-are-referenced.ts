import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Rule } from "../../engine/types.js";

const NON_SCRIPT_FILES = new Set([
  "requirements.txt",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "pyproject.toml",
  "setup.cfg",
  "Makefile",
  "Dockerfile",
  ".gitignore",
]);

const NON_SCRIPT_EXTENSIONS = new Set([
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".cfg",
  ".ini",
  ".csv",
  ".md",
]);

function isDataFile(filename: string): boolean {
  if (NON_SCRIPT_FILES.has(filename)) return true;
  const ext = filename.slice(filename.lastIndexOf("."));
  return NON_SCRIPT_EXTENSIONS.has(ext);
}

export const scriptsAreReferenced: Rule = {
  meta: {
    id: "best-practices/scripts-are-referenced",
    type: "suggestion",
    defaultSeverity: "warning",
    fixable: false,
    description: "Scripts in scripts/ should be referenced in the SKILL.md body",
    category: "best-practices",
    messages: {
      unreferenced:
        "Script '{{script}}' in scripts/ is not referenced in SKILL.md body — agents won't discover it",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    const scriptsDir = join(skill.dirPath, "scripts");
    if (!existsSync(scriptsDir)) return;

    let scripts: string[];
    try {
      scripts = readdirSync(scriptsDir).filter((f) => !f.startsWith("."));
    } catch {
      return;
    }

    for (const script of scripts) {
      if (isDataFile(script)) continue;

      const refPath = `scripts/${script}`;
      if (!skill.body.includes(script) && !skill.body.includes(refPath)) {
        context.report({
          messageId: "unreferenced",
          data: { script },
        });
      }
    }
  },
};
