import type { Rule } from "../../engine/types.js";

export const hasHeadings: Rule = {
  meta: {
    id: "content/has-headings",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Body should contain at least one heading for structure",
    category: "content",
    messages: {
      noHeadings: "Body has no headings — structured content helps agents navigate the skill",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const hasHeading = skill.mdast.children.some(
      (node) => node.type === "heading",
    );

    if (!hasHeading) {
      context.report({
        messageId: "noHeadings",
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
