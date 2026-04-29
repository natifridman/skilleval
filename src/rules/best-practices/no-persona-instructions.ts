import type { Rule } from "../../engine/types.js";

const PERSONA_PATTERNS = [
  /^you are (a |an |the )/i,
  /^act as (a |an |the )/i,
  /^pretend (you are|to be) /i,
  /^imagine you (are|were) /i,
  /^role:\s/i,
  /^persona:\s/i,
  /^behave (like|as) (a |an |the )/i,
  /^assume the role of /i,
];

function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let fenceCount = 0;
  for (let i = 0; i < lineIndex; i++) {
    if (/^```/.test(lines[i].trim())) fenceCount++;
  }
  return fenceCount % 2 === 1;
}

export const noPersonaInstructions: Rule = {
  meta: {
    id: "best-practices/no-persona-instructions",
    type: "suggestion",
    defaultSeverity: "warning",
    fixable: false,
    description:
      "Skills should provide instructions, not persona/roleplay assignments",
    category: "best-practices",
    messages: {
      persona:
        "Persona instruction detected: '{{line}}' — skills should provide domain instructions, not identity assignments",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const lines = skill.body.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === "") continue;
      if (isInsideCodeBlock(lines, i)) continue;

      const stripped = trimmed.replace(/^[-*>]\s+/, "");

      for (const pattern of PERSONA_PATTERNS) {
        if (pattern.test(stripped)) {
          const preview = stripped.length > 80 ? stripped.slice(0, 77) + "..." : stripped;
          const isQuoted = trimmed.startsWith(">");
          context.report({
            messageId: "persona",
            data: { line: preview },
            location: { startLine: skill.bodyStartLine + i },
            severityOverride: isQuoted ? "info" : undefined,
          });
          break;
        }
      }
    }
  },
};
