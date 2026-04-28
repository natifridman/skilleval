import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Rule } from "../../engine/types.js";
import type { Link, Image } from "mdast";

export const fileReferencesValid: Rule = {
  meta: {
    id: "structural/file-references-valid",
    type: "problem",
    defaultSeverity: "warning",
    fixable: false,
    description: "All local file paths referenced in the body must exist",
    category: "structural",
    messages: {
      broken: "Referenced file '{{path}}' does not exist",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0 || !skill.mdast) return;

    const localPaths = new Set<string>();

    function walk(node: unknown): void {
      const n = node as { type: string; url?: string; children?: unknown[] };
      if ((n.type === "link" || n.type === "image") && typeof n.url === "string") {
        const url = n.url;
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("#") && !url.startsWith("mailto:")) {
          localPaths.add(url);
        }
      }
      if (Array.isArray(n.children)) {
        for (const child of n.children) {
          walk(child);
        }
      }
    }

    walk(skill.mdast);

    for (const refPath of localPaths) {
      const resolved = resolve(skill.dirPath, refPath);
      if (!existsSync(resolved)) {
        context.report({
          messageId: "broken",
          data: { path: refPath },
        });
      }
    }
  },
};
