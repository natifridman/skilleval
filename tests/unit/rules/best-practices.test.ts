import { describe, it, expect } from "vitest";
import { runRule } from "../../helpers.js";
import { descriptionHasTriggerWords } from "../../../src/rules/best-practices/description-has-trigger-words.js";
import { hasExamples } from "../../../src/rules/best-practices/has-examples.js";
import { gotchasSection } from "../../../src/rules/best-practices/gotchas-section.js";
import { pinnedVersions } from "../../../src/rules/best-practices/pinned-versions.js";
import { noGenericNames } from "../../../src/rules/best-practices/no-generic-names.js";

describe("best-practices/description-has-trigger-words", () => {
  it("passes with trigger phrasing", async () => {
    const d = await runRule(descriptionHasTriggerWords, {
      frontmatter: { description: "Use this skill when deploying to production" },
      rawFrontmatter: "description: Use this skill when deploying to production",
    });
    expect(d).toHaveLength(0);
  });

  it("passes with 'use after' trigger phrasing", async () => {
    const d = await runRule(descriptionHasTriggerWords, {
      frontmatter: { description: "Score and rank backport candidates. Use after the agent completes semantic analysis." },
      rawFrontmatter: "description: Score and rank backport candidates. Use after the agent completes semantic analysis.",
    });
    expect(d).toHaveLength(0);
  });

  it("passes with 'use this skill whenever' phrasing", async () => {
    const d = await runRule(descriptionHasTriggerWords, {
      frontmatter: { description: "Use this skill whenever the user asks to review an ADR" },
      rawFrontmatter: "description: Use this skill whenever the user asks to review an ADR",
    });
    expect(d).toHaveLength(0);
  });

  it("reports missing trigger phrasing", async () => {
    const d = await runRule(descriptionHasTriggerWords, {
      frontmatter: { description: "Deploys to production environments" },
      rawFrontmatter: "description: Deploys to production environments",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("trigger");
  });
});

describe("best-practices/has-examples", () => {
  it("reports no code blocks (empty mdast)", async () => {
    const d = await runRule(hasExamples, { body: "Some content without code." });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("code blocks");
  });
});

describe("best-practices/gotchas-section", () => {
  it("skips short skills", async () => {
    const d = await runRule(gotchasSection, { body: "Short content." });
    expect(d).toHaveLength(0);
  });

  it("reports missing gotchas in long skill", async () => {
    const longBody = "word ".repeat(1200);
    const d = await runRule(gotchasSection, { body: longBody });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("gotchas");
  });

  it("passes when gotchas heading exists", async () => {
    const body = "word ".repeat(1200) + "\n## Gotchas\n\n- Watch out for X";
    const d = await runRule(gotchasSection, { body });
    expect(d).toHaveLength(0);
  });

  it("passes when troubleshooting heading exists", async () => {
    const body = "word ".repeat(1200) + "\n## Troubleshooting\n\n- If X fails, try Y";
    const d = await runRule(gotchasSection, { body });
    expect(d).toHaveLength(0);
  });

  it("passes when error handling heading exists", async () => {
    const body = "word ".repeat(1200) + "\n## Error Handling\n\n- If X fails, check Y";
    const d = await runRule(gotchasSection, { body });
    expect(d).toHaveLength(0);
  });
});

describe("best-practices/pinned-versions", () => {
  it("passes for clean content", async () => {
    const d = await runRule(pinnedVersions, {
      rawContent: "---\nname: test\n---\nnpm install lodash@4.17.21",
    });
    expect(d).toHaveLength(0);
  });

  it("detects unpinned npx", async () => {
    const d = await runRule(pinnedVersions, {
      rawContent: "---\nname: test\n---\nnpx eslint .",
    });
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].message).toContain("npx");
  });
});

describe("best-practices/no-generic-names", () => {
  it("passes for domain-specific names", async () => {
    const d = await runRule(noGenericNames, {
      frontmatter: { name: "pdf-processing" },
      rawFrontmatter: "name: pdf-processing",
    });
    expect(d).toHaveLength(0);
  });

  it("reports generic name 'utils'", async () => {
    const d = await runRule(noGenericNames, {
      frontmatter: { name: "utils" },
      rawFrontmatter: "name: utils",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("generic");
  });

  it("reports generic name 'helper'", async () => {
    const d = await runRule(noGenericNames, {
      frontmatter: { name: "helper" },
      rawFrontmatter: "name: helper",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("generic");
  });

  it("reports generic name 'tools'", async () => {
    const d = await runRule(noGenericNames, {
      frontmatter: { name: "tools" },
      rawFrontmatter: "name: tools",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("generic");
  });

  it("skips when name is missing", async () => {
    const d = await runRule(noGenericNames, {
      frontmatter: { description: "test" },
      rawFrontmatter: "description: test",
    });
    expect(d).toHaveLength(0);
  });
});
