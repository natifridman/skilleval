import type { Rule } from "../../engine/types.js";

export const noHtmlInBody: Rule = {
  meta: {
    id: "content/no-html-in-body",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Body should not contain raw HTML tags",
    category: "content",
    messages: {
      htmlFound: "Body contains raw HTML — HTML may not render in agent contexts",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const hasHtml = skill.mdast.children.some((node) => node.type === "html");

    if (hasHtml) {
      context.report({
        messageId: "htmlFound",
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
