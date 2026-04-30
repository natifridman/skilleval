import { readFileSync, writeFileSync } from "node:fs";
import type { Diagnostic } from "./types.js";

export interface FixResult {
  filePath: string;
  fixesApplied: number;
  diagnosticsFixed: string[];
}

export function applyFixes(diagnostics: Diagnostic[]): FixResult[] {
  const fixable = diagnostics.filter((d) => d.fix);
  const byFile = new Map<string, Diagnostic[]>();

  for (const d of fixable) {
    const file = d.location.file;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file)!.push(d);
  }

  const results: FixResult[] = [];

  for (const [filePath, diags] of byFile) {
    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    let modified = content;
    const applied: string[] = [];

    // Sort by line number descending so replacements don't shift subsequent line indices
    const sorted = [...diags].sort(
      (a, b) => (b.location.startLine ?? 0) - (a.location.startLine ?? 0),
    );

    for (const d of sorted) {
      if (!d.fix?.replacement || !d.location.startLine) continue;

      const lines = modified.split("\n");
      const lineIdx = d.location.startLine - 1;
      if (lineIdx >= lines.length) continue;

      if (d.ruleId === "frontmatter/name-format") {
        if (lines[lineIdx].startsWith("name:")) {
          lines[lineIdx] = `name: ${d.fix.replacement}`;
          modified = lines.join("\n");
          applied.push(d.ruleId);
        }
      } else if (d.ruleId === "content/no-backslash-paths") {
        lines[lineIdx] = d.fix.replacement;
        modified = lines.join("\n");
        applied.push(d.ruleId);
      } else if (d.ruleId === "frontmatter/frontmatter-present") {
        // Prepend frontmatter at the top of the file
        modified = d.fix.replacement + modified;
        applied.push(d.ruleId);
      }
    }

    if (applied.length > 0) {
      writeFileSync(filePath, modified, "utf-8");
      results.push({
        filePath,
        fixesApplied: applied.length,
        diagnosticsFixed: applied,
      });
    }
  }

  return results;
}
