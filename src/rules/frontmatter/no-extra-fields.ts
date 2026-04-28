import type { Rule } from "../../engine/types.js";
import { findFieldLine } from "../../parser/frontmatter.js";

const ALLOWED_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "allowed-tools",
  "metadata",
]);

export const noExtraFields: Rule = {
  meta: {
    id: "frontmatter/no-extra-fields",
    type: "problem",
    defaultSeverity: "error",
    fixable: false,
    description: "Only the 6 spec-defined fields are allowed in frontmatter",
    category: "frontmatter",
    messages: {
      unexpected:
        "Unexpected frontmatter field '{{field}}'. Allowed: name, description, license, compatibility, allowed-tools, metadata",
    },
  },
  create(context) {
    const { skill } = context;
    if (!skill.rawFrontmatter) return;

    for (const key of Object.keys(skill.frontmatter)) {
      if (!ALLOWED_FIELDS.has(key)) {
        const line = findFieldLine(
          skill.rawFrontmatter,
          key,
          skill.frontmatterStartLine,
        );
        context.report({
          messageId: "unexpected",
          data: { field: key },
          location: { startLine: line },
        });
      }
    }
  },
};
