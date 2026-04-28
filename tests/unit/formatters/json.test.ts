import { describe, it, expect } from "vitest";
import { formatJson } from "../../../src/formatters/json.js";
import type { LintResult } from "../../../src/engine/types.js";

describe("JSON formatter", () => {
  it("produces valid JSON", () => {
    const result: LintResult = {
      skillPath: "/test/my-skill",
      diagnostics: [
        {
          ruleId: "frontmatter/name-required",
          severity: "error",
          message: "missing name",
          location: { file: "SKILL.md", startLine: 1 },
          category: "frontmatter",
        },
      ],
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
      fixableCount: 0,
    };

    const output = formatJson([result]);
    const parsed = JSON.parse(output);
    expect(parsed.version).toBe("0.1.0");
    expect(parsed.skills).toHaveLength(1);
    expect(parsed.skills[0].errorCount).toBe(1);
    expect(parsed.skills[0].diagnostics).toHaveLength(1);
    expect(parsed.skills[0]).not.toHaveProperty("score");
  });
});
