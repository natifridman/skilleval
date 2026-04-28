import type { Rule } from "../../engine/types.js";

export const referencesDepth: Rule = {
  meta: {
    id: "content/references-depth",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "References should be one level deep from SKILL.md",
    category: "content",
    messages: {
      deepRef:
        "File '{{path}}' is nested more than one directory deep — keep references shallow for discoverability",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    for (const file of skill.files) {
      const parts = file.relativePath.split("/");
      if (parts.length > 3) {
        context.report({
          messageId: "deepRef",
          data: { path: file.relativePath },
        });
      }
    }
  },
};
