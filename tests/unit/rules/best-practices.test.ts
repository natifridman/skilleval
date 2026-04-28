import { describe, it, expect } from "vitest";
import { runRule } from "../../helpers.js";
import { descriptionHasTriggerWords } from "../../../src/rules/best-practices/description-has-trigger-words.js";
import { hasExamples } from "../../../src/rules/best-practices/has-examples.js";
import { gotchasSection } from "../../../src/rules/best-practices/gotchas-section.js";
import { pinnedVersions } from "../../../src/rules/best-practices/pinned-versions.js";

describe("best-practices/description-has-trigger-words", () => {
  it("passes with trigger phrasing", async () => {
    const d = await runRule(descriptionHasTriggerWords, {
      frontmatter: { description: "Use this skill when deploying to production" },
      rawFrontmatter: "description: Use this skill when deploying to production",
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
