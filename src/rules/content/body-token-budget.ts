import type { Rule } from "../../engine/types.js";
import { estimateTokens } from "../../utils/token-counter.js";

const MAX_TOKENS = 5000;

export const bodyTokenBudget: Rule = {
  meta: {
    id: "content/body-token-budget",
    type: "suggestion",
    defaultSeverity: "warning",
    fixable: false,
    description: "Body should be under 5000 tokens for efficient progressive disclosure",
    category: "content",
    messages: {
      overBudget:
        "Body is approximately {{tokens}} tokens (recommended: <5000). Consider moving detail to references/",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const tokens = estimateTokens(skill.body);
    if (tokens > MAX_TOKENS) {
      context.report({
        messageId: "overBudget",
        data: { tokens: String(tokens) },
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
