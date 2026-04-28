import pc from "picocolors";
import { relative } from "node:path";
import type { LintResult, Diagnostic, Severity } from "../engine/types.js";

const SEVERITY_LABEL: Record<Severity, string> = {
  error: pc.red("error"),
  warning: pc.yellow("warning"),
  info: pc.blue("info"),
};

const SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

function formatLocation(d: Diagnostic): string {
  if (d.location.startLine) {
    const col = d.location.startColumn ?? 1;
    return pc.dim(`${d.location.startLine}:${col}`);
  }
  return pc.dim("  -");
}

function formatDiagnostic(d: Diagnostic): string {
  const loc = formatLocation(d).padEnd(18);
  const sev = SEVERITY_LABEL[d.severity].padEnd(20);
  const ruleId = pc.dim(d.ruleId);
  return `  ${loc}  ${sev}  ${d.message}  ${ruleId}`;
}

export function formatText(results: LintResult[]): string {
  const lines: string[] = [];

  lines.push("");

  for (const result of results) {
    const displayPath = relative(process.cwd(), result.skillPath);
    lines.push(pc.underline(displayPath));
    lines.push("");

    if (result.diagnostics.length === 0) {
      lines.push(`  ${pc.green("No issues found")}`);
    } else {
      const sorted = [...result.diagnostics].sort(
        (a, b) =>
          SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
          (a.location.startLine ?? 0) - (b.location.startLine ?? 0),
      );

      for (const d of sorted) {
        lines.push(formatDiagnostic(d));
      }
    }

    lines.push("");

    const parts: string[] = [];
    if (result.errorCount > 0) {
      parts.push(pc.red(`${result.errorCount} error${result.errorCount > 1 ? "s" : ""}`));
    }
    if (result.warningCount > 0) {
      parts.push(pc.yellow(`${result.warningCount} warning${result.warningCount > 1 ? "s" : ""}`));
    }
    if (result.infoCount > 0) {
      parts.push(pc.blue(`${result.infoCount} info`));
    }

    if (parts.length > 0) {
      let summary = `  ${result.diagnostics.length} problem${result.diagnostics.length > 1 ? "s" : ""} (${parts.join(", ")})`;
      if (result.fixableCount > 0) {
        summary += pc.dim(`  ${result.fixableCount} fixable with --fix`);
      }
      lines.push(summary);
    }

    lines.push("");
  }

  return lines.join("\n");
}
