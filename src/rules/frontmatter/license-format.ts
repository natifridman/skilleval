import type { Rule } from "../../engine/types.js";
import { findFieldLine } from "../../parser/frontmatter.js";

// Common SPDX license identifiers
const SPDX_IDENTIFIERS = new Set([
  "MIT", "Apache-2.0", "GPL-2.0-only", "GPL-2.0-or-later",
  "GPL-3.0-only", "GPL-3.0-or-later", "BSD-2-Clause", "BSD-3-Clause",
  "ISC", "MPL-2.0", "LGPL-2.1-only", "LGPL-2.1-or-later",
  "LGPL-3.0-only", "LGPL-3.0-or-later", "AGPL-3.0-only", "AGPL-3.0-or-later",
  "Unlicense", "0BSD", "CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0",
  "Artistic-2.0", "BSL-1.0", "Zlib", "PSF-2.0", "WTFPL",
]);

// Patterns that reference a license file (acceptable alternatives to SPDX)
const LICENSE_FILE_RE = /\b(license|licence)(\.txt|\.md)?\b/i;

export const licenseFormat: Rule = {
  meta: {
    id: "frontmatter/license-format",
    type: "suggestion",
    defaultSeverity: "info",
    fixable: false,
    description: "License field should use an SPDX identifier or reference a license file",
    category: "frontmatter",
    messages: {
      unknownLicense:
        "License '{{license}}' is not a recognized SPDX identifier. Consider using a standard SPDX ID (e.g., MIT, Apache-2.0) or referencing a LICENSE file",
    },
  },
  create(context) {
    const { skill } = context;
    if (skill.parseErrors.length > 0) return;

    const license = skill.frontmatter.license;
    if (typeof license !== "string" || license.trim() === "") return;

    const trimmed = license.trim();

    // Accept known SPDX identifiers
    if (SPDX_IDENTIFIERS.has(trimmed)) return;

    // Accept references to a license file
    if (LICENSE_FILE_RE.test(trimmed)) return;

    const line = findFieldLine(
      skill.rawFrontmatter, "license", skill.frontmatterStartLine, skill.frontmatterFieldLines,
    );

    context.report({
      messageId: "unknownLicense",
      data: { license: trimmed },
      location: { startLine: line },
    });
  },
};
