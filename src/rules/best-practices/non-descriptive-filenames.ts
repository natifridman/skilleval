import type { Rule } from "../../engine/types.js";
import { basename } from "node:path";

const GENERIC_NAME = /^(doc|file|data|notes?|info|temp|tmp|stuff|untitled)\d*\.(md|txt|py|sh|js|ts|json|yaml|yml)$/i;
const ALLOWED_ROOT_FILES = new Set([
  "skill.md",
  "readme.md",
  "license",
  "license.md",
  "changelog.md",
  "package.json",
]);

export const nonDescriptiveFilenames: Rule = {
  meta: {
    id: "best-practices/non-descriptive-filenames",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description:
      "Skill files should have descriptive names, not generic ones like 'doc1.md'",
    category: "best-practices",
    messages: {
      generic:
        "File '{{name}}' has a generic name — use a descriptive name (e.g., 'form_validation_rules.md' instead of 'doc1.md')",
    },
  },
  create(context) {
    const { skill } = context;

    for (const file of skill.files) {
      const name = basename(file.relativePath);
      if (ALLOWED_ROOT_FILES.has(name.toLowerCase())) continue;
      if (GENERIC_NAME.test(name)) {
        context.report({
          messageId: "generic",
          data: { name },
          location: { file: file.path },
        });
      }
    }
  },
};
