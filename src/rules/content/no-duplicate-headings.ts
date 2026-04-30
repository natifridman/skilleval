import type { Rule } from "../../engine/types.js";

interface HeadingNode {
  type: "heading";
  depth: number;
  children: Array<{ type: string; value?: string }>;
  position?: { start: { line: number } };
}

function getHeadingText(node: HeadingNode): string {
  return node.children
    .filter((c) => c.type === "text" && c.value)
    .map((c) => c.value!)
    .join("")
    .trim();
}

export const noDuplicateHeadings: Rule = {
  meta: {
    id: "content/no-duplicate-headings",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "Heading text should be unique to avoid confusion",
    category: "content",
    messages: {
      duplicate:
        "Duplicate heading '{{heading}}' — headings should be unique for clear navigation",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || skill.body.trim() === "") return;

    const seen = new Map<string, number>();

    for (const node of skill.mdast.children) {
      if (node.type !== "heading") continue;
      const heading = node as unknown as HeadingNode;
      const text = getHeadingText(heading).toLowerCase();
      if (!text) continue;

      if (seen.has(text)) {
        const line = heading.position?.start?.line;
        context.report({
          messageId: "duplicate",
          data: { heading: getHeadingText(heading) },
          location: { startLine: line ? skill.bodyStartLine + line - 1 : undefined },
        });
      } else {
        seen.set(text, heading.position?.start?.line ?? 0);
      }
    }
  },
};
