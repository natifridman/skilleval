import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Rule } from "../../engine/types.js";
import { estimateTokens } from "../../utils/token-counter.js";

const THRESHOLD_TOKENS = 3000;

export const progressiveDisclosure: Rule = {
  meta: {
    id: "best-practices/progressive-disclosure",
    type: "suggestion",
    defaultSeverity: "warning",
    fixable: false,
    description: "Large body content should be split into references/ for progressive disclosure",
    category: "best-practices",
    messages: {
      shouldSplit:
        "Body is ~{{tokens}} tokens but references/ is empty or missing. Move detailed content to references/ for progressive disclosure",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const tokens = estimateTokens(skill.body);
    if (tokens <= THRESHOLD_TOKENS) return;

    const refsDir = join(skill.dirPath, "references");
    let hasRefs = false;
    if (existsSync(refsDir)) {
      try {
        const entries = readdirSync(refsDir);
        hasRefs = entries.length > 0;
      } catch { /* ignore */ }
    }

    if (!hasRefs) {
      context.report({
        messageId: "shouldSplit",
        data: { tokens: String(tokens) },
        location: { startLine: skill.bodyStartLine },
      });
    }
  },
};
