import type { LintResult, Severity } from "../engine/types.js";

const SEVERITY_COMMAND: Record<Severity, string> = {
  error: "error",
  warning: "warning",
  info: "notice",
};

export function formatGithub(results: LintResult[]): string {
  const lines: string[] = [];

  for (const result of results) {
    for (const diag of result.diagnostics) {
      const cmd = SEVERITY_COMMAND[diag.severity];
      const file = diag.location.file;
      const line = diag.location.startLine ?? 1;
      const col = diag.location.startColumn ?? 1;
      const title = diag.ruleId;

      lines.push(`::${cmd} file=${file},line=${line},col=${col},title=${title}::${diag.message}`);
    }
  }

  return lines.join("\n") + (lines.length > 0 ? "\n" : "");
}
