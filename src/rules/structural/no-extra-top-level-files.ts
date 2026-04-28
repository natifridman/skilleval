import { readdirSync } from "node:fs";
import type { Rule } from "../../engine/types.js";

const EXPECTED_FILES = new Set([
  "skill.md",
  "license",
  "license.md",
  "license.txt",
  "readme.md",
  "readme",
  "changelog.md",
  "changelog",
]);

export const noExtraTopLevelFiles: Rule = {
  meta: {
    id: "structural/no-extra-top-level-files",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Warn on unexpected files at the skill root level",
    category: "structural",
    messages: {
      unexpected: "Unexpected file '{{file}}' at skill root",
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
      if (
        entry.isFile() &&
        !entry.name.startsWith(".") &&
        !EXPECTED_FILES.has(entry.name.toLowerCase())
      ) {
        context.report({
          messageId: "unexpected",
          data: { file: entry.name },
        });
      }
    }
  },
};
