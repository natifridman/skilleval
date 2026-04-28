import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Rule } from "../../engine/types.js";

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
