import type { Rule } from "../../engine/types.js";

export const skillMdExists: Rule = {
  meta: {
    id: "structural/skill-md-exists",
    type: "problem",
    defaultSeverity: "error",
    fixable: false,
    description: "SKILL.md file must exist in the skill directory",
    category: "structural",
    messages: {
      missing: "SKILL.md not found in {{dirPath}}",
    },
  },
  create(context) {
    if (context.skill.parseErrors.some((e) => e.includes("SKILL.md not found"))) {
      context.report({
        messageId: "missing",
        data: { dirPath: context.skill.dirPath },
      });
    }
  },
};
