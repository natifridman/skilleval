import { readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import type { Rule } from "../../engine/types.js";

const KNOWN_DIRS = new Set(["scripts", "references", "assets", "evals"]);

export const directoryStructure: Rule = {
  meta: {
    id: "structural/directory-structure",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Warn on non-standard top-level directories",
    category: "structural",
    messages: {
      unknownDir:
        "Non-standard directory '{{dir}}'. Standard directories: scripts/, references/, assets/, evals/",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    let entries;
    try {
      entries = readdirSync(skill.dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".") && !KNOWN_DIRS.has(entry.name)) {
        context.report({
          messageId: "unknownDir",
          data: { dir: entry.name },
        });
      }
    }
  },
};
