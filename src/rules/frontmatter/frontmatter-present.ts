import type { Rule } from "../../engine/types.js";

export const frontmatterPresent: Rule = {
  meta: {
    id: "frontmatter/frontmatter-present",
    type: "problem",
    defaultSeverity: "error",
    fixable: true,
    description: "SKILL.md must begin with YAML frontmatter",
    category: "frontmatter",
    messages: {
      missing: "SKILL.md has no YAML frontmatter (must begin with ---)",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    if (!skill.rawContent.trimStart().startsWith("---")) {
      context.report({
        messageId: "missing",
        location: { startLine: 1, startColumn: 1 },
        fix: {
          description: "Add empty YAML frontmatter",
          replacement: `---\nname: ${skill.dirName}\ndescription: \n---\n`,
        },
      });
    }
  },
};
