import type { Rule } from "../../engine/types.js";

function hasCodeNode(node: { type: string; children?: any[] }): boolean {
  if (node.type === "code") return true;
  if (node.children) return node.children.some(hasCodeNode);
  return false;
}

export const hasExamples: Rule = {
  meta: {
    id: "best-practices/has-examples",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Body should contain code blocks or examples",
    category: "best-practices",
    messages: {
      noExamples:
        "No code blocks or examples found — skills with concrete examples outperform those without",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const hasCodeBlock = hasCodeNode(skill.mdast) || /^```/m.test(skill.body);
    if (!hasCodeBlock) {
      context.report({
        messageId: "noExamples",
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
