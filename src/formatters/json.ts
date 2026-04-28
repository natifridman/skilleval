import type { LintResult } from "../engine/types.js";

interface JsonOutput {
  version: string;
  skills: Array<{
    path: string;
    diagnostics: Array<{
      ruleId: string;
      severity: string;
      message: string;
      category: string;
      location: {
        file: string;
        startLine?: number;
        startColumn?: number;
      };
      fixable: boolean;
    }>;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    fixableCount: number;
  }>;
}

export function formatJson(results: LintResult[]): string {
  const output: JsonOutput = {
    version: "0.1.0",
    skills: results.map((r) => ({
      path: r.skillPath,
      diagnostics: r.diagnostics.map((d) => ({
        ruleId: d.ruleId,
        severity: d.severity,
        message: d.message,
        category: d.category,
        location: {
          file: d.location.file,
          startLine: d.location.startLine,
          startColumn: d.location.startColumn,
        },
        fixable: d.fix !== undefined,
      })),
      errorCount: r.errorCount,
      warningCount: r.warningCount,
      infoCount: r.infoCount,
      fixableCount: r.fixableCount,
    })),
  };

  return JSON.stringify(output, null, 2) + "\n";
}
