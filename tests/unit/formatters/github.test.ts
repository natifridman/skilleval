import { describe, it, expect } from "vitest";
import { formatGithub } from "../../../src/formatters/github.js";
import type { LintResult } from "../../../src/engine/types.js";

describe("GitHub formatter", () => {
  it("produces correct annotation format", () => {
    const result: LintResult = {
      skillPath: "/test/my-skill",
      diagnostics: [
        {
          ruleId: "security/no-curl-bash",
          severity: "error",
          message: "Pipe-to-shell detected",
          location: { file: "SKILL.md", startLine: 5, startColumn: 1 },
          category: "security",
        },
        {
          ruleId: "content/has-headings",
          severity: "info",
          message: "No headings",
          location: { file: "SKILL.md", startLine: 3, startColumn: 1 },
          category: "content",
        },
      ],
      errorCount: 1,
      warningCount: 0,
      infoCount: 1,
      fixableCount: 0,
    };

    const output = formatGithub([result]);
    expect(output).toContain("::error file=SKILL.md,line=5,col=1,title=security/no-curl-bash::Pipe-to-shell detected");
    expect(output).toContain("::notice file=SKILL.md,line=3,col=1,title=content/has-headings::No headings");
  });

  it("returns empty for no diagnostics", () => {
    const result: LintResult = {
      skillPath: "/test/clean",
      diagnostics: [],
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      fixableCount: 0,
    };

    expect(formatGithub([result])).toBe("");
  });
});
