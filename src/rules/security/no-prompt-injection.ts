import type { Rule } from "../../engine/types.js";

const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+)?previous\s+instructions/i, label: "ignore previous instructions" },
  { pattern: /ignore\s+(all\s+)?prior\s+instructions/i, label: "ignore prior instructions" },
  { pattern: /disregard\s+(all\s+)?previous/i, label: "disregard previous" },
  { pattern: /forget\s+(all\s+)?previous/i, label: "forget previous" },
  { pattern: /you\s+are\s+now\s+a/i, label: "identity override (you are now)" },
  { pattern: /from\s+now\s+on,?\s+you\s+are/i, label: "identity override (from now on)" },
  { pattern: /^system:/im, label: "system message impersonation" },
  { pattern: /\[system\]/i, label: "system message impersonation" },
  { pattern: /<\|?system\|?>/i, label: "system tag impersonation" },
  { pattern: /\[INST\]/i, label: "instruction tag injection" },
  { pattern: /do\s+not\s+follow\s+(any\s+)?(other|previous)\s+(rules|instructions)/i, label: "instruction override" },
  { pattern: /override\s+(all\s+)?(safety|security|restrictions)/i, label: "safety override" },
];

export const noPromptInjection: Rule = {
  meta: {
    id: "security/no-prompt-injection",
    type: "security",
    defaultSeverity: "error",
    fixable: false,
    description: "Detects prompt injection patterns in skill content",
    category: "security",
    messages: {
      injectionDetected:
        "Potential prompt injection detected: '{{label}}' at line {{line}}",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    const lines = skill.rawContent.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, label } of INJECTION_PATTERNS) {
        if (pattern.test(lines[i])) {
          context.report({
            messageId: "injectionDetected",
            data: { label, line: String(i + 1) },
            location: { startLine: i + 1 },
          });
          break;
        }
      }
    }
  },
};
