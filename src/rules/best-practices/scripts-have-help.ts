import { existsSync, readdirSync, readFileSync } from "node:fs";
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

const HELP_INDICATORS = [
  /--help/,
  /argparse/,
  /ArgumentParser/,
  /click\.command/,
  /typer\./,
  /usage:/i,
  /getopts/,
  /getopt/,
];

export const scriptsHaveHelp: Rule = {
  meta: {
    id: "best-practices/scripts-have-help",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Scripts should support --help for agentic discoverability",
    category: "best-practices",
    messages: {
      noHelp:
        "Script '{{script}}' does not appear to support --help — agents benefit from self-documenting scripts",
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

      const filePath = join(scriptsDir, script);
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        continue;
      }

      const hasHelp = HELP_INDICATORS.some((p) => p.test(content));
      if (!hasHelp) {
        context.report({
          messageId: "noHelp",
          data: { script },
        });
      }
    }
  },
};
