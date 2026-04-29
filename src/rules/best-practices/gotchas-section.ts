import type { Rule } from "../../engine/types.js";
import { estimateTokens } from "../../utils/token-counter.js";

const GOTCHA_HEADINGS = /^#+\s*(gotchas?|caveats?|warnings?|pitfalls?|known\s+issues?|important\s+notes?|watch\s+out|troubleshooting|error\s+handling)/im;
const MIN_TOKENS_FOR_GOTCHAS = 1000;

export const gotchasSection: Rule = {
  meta: {
    id: "best-practices/gotchas-section",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Non-trivial skills should have a gotchas/caveats section",
    category: "best-practices",
    messages: {
      noGotchas:
        "No gotchas/caveats section found. For non-trivial skills, documenting common mistakes helps agents avoid errors",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const tokens = estimateTokens(skill.body);
    if (tokens < MIN_TOKENS_FOR_GOTCHAS) return;

    if (!GOTCHA_HEADINGS.test(skill.body)) {
      context.report({
        messageId: "noGotchas",
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
