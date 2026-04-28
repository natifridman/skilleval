import { describe, it, expect } from "vitest";
import { runRule } from "../../helpers.js";
import { skillMdExists } from "../../../src/rules/structural/skill-md-exists.js";

describe("structural/skill-md-exists", () => {
  it("passes when SKILL.md exists (no parse errors)", async () => {
    const diagnostics = await runRule(skillMdExists, {
      parseErrors: [],
    });
    expect(diagnostics).toHaveLength(0);
  });

  it("reports when SKILL.md is not found", async () => {
    const diagnostics = await runRule(skillMdExists, {
      parseErrors: ["SKILL.md not found"],
      dirPath: "/test/my-skill",
    });
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("SKILL.md not found");
  });
});
