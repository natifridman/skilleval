import { describe, it, expect, vi } from "vitest";
import { triageDiagnostics } from "../../../src/deep/analyzer.js";
import { createTestSkill } from "../../helpers.js";
import type { Diagnostic } from "../../../src/engine/types.js";
import type { LLMProvider } from "../../../src/deep/provider.js";

function createMockProvider(response: string): LLMProvider {
  return {
    name: "mock",
    analyze: vi.fn().mockResolvedValue({
      text: response,
      inputTokens: 100,
      outputTokens: 50,
    }),
  };
}

function createDiag(overrides: Partial<Diagnostic> = {}): Diagnostic {
  return {
    ruleId: "security/no-prompt-injection",
    severity: "error",
    message: "Potential prompt injection detected",
    location: { file: "SKILL.md", startLine: 10 },
    category: "security",
    ...overrides,
  };
}

describe("triageDiagnostics", () => {
  it("returns dismiss decisions from LLM", async () => {
    const provider = createMockProvider(JSON.stringify({
      reviews: [
        {
          ruleId: "security/no-prompt-injection",
          line: 10,
          dismiss: true,
          reason: "Pattern is mentioned as an example in documentation",
        },
      ],
    }));

    const skill = createTestSkill({
      rawContent: "---\nname: test\n---\n# Test",
    });
    const diagnostics = [createDiag()];

    const reviews = await triageDiagnostics(skill, diagnostics, provider);
    expect(reviews).toHaveLength(1);
    expect(reviews[0].dismiss).toBe(true);
    expect(reviews[0].reason).toContain("example");
  });

  it("skips non-security diagnostics", async () => {
    const provider = createMockProvider("{}");

    const skill = createTestSkill();
    const diagnostics = [
      createDiag({ category: "frontmatter", ruleId: "frontmatter/no-extra-fields" }),
    ];

    const reviews = await triageDiagnostics(skill, diagnostics, provider);
    expect(reviews).toHaveLength(0);
    expect(provider.analyze).not.toHaveBeenCalled();
  });

  it("returns empty array on unparseable LLM response", async () => {
    const provider = createMockProvider("not valid json");

    const skill = createTestSkill();
    const diagnostics = [createDiag()];

    const reviews = await triageDiagnostics(skill, diagnostics, provider);
    expect(reviews).toHaveLength(0);
  });

  it("handles LLM returning dismiss: false", async () => {
    const provider = createMockProvider(JSON.stringify({
      reviews: [
        {
          ruleId: "security/no-prompt-injection",
          line: 10,
          dismiss: false,
          reason: "This is a real injection attempt",
        },
      ],
    }));

    const skill = createTestSkill();
    const diagnostics = [createDiag()];

    const reviews = await triageDiagnostics(skill, diagnostics, provider);
    expect(reviews).toHaveLength(1);
    expect(reviews[0].dismiss).toBe(false);
  });
});
