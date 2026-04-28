import type { Rule } from "../../engine/types.js";

export const bodyNotEmpty: Rule = {
  meta: {
    id: "content/body-not-empty",
    type: "suggestion",
    defaultSeverity: "warning",
    fixable: false,
    description: "Markdown body after frontmatter must not be empty",
    category: "content",
    messages: {
      empty: "SKILL.md body is empty — a skill with only metadata and no instructions is incomplete",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;
    if (!skill.rawFrontmatter) return;

    if (skill.body.trim() === "") {
      context.report({
        messageId: "empty",
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
