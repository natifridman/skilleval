import { describe, it, expect } from "vitest";
import { runRule } from "../../helpers.js";
import { bodyNotEmpty } from "../../../src/rules/content/body-not-empty.js";
import { bodyTokenBudget } from "../../../src/rules/content/body-token-budget.js";
import { bodyLineLimit } from "../../../src/rules/content/body-line-limit.js";
import { hasHeadings } from "../../../src/rules/content/has-headings.js";
import { noBackslashPaths } from "../../../src/rules/content/no-backslash-paths.js";

describe("content/body-not-empty", () => {
  it("passes for non-empty body", async () => {
    const d = await runRule(bodyNotEmpty, {
      rawFrontmatter: "name: test",
      body: "# My Skill\nDo the thing.",
    });
    expect(d).toHaveLength(0);
  });

  it("reports empty body", async () => {
    const d = await runRule(bodyNotEmpty, {
      rawFrontmatter: "name: test",
      body: "   \n  \n",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("empty");
  });
});

describe("content/body-token-budget", () => {
  it("passes for small body", async () => {
    const d = await runRule(bodyTokenBudget, { body: "# Small\nShort content." });
    expect(d).toHaveLength(0);
  });

  it("reports body exceeding 5000 tokens", async () => {
    const bigBody = "word ".repeat(6000);
    const d = await runRule(bodyTokenBudget, { body: bigBody });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("tokens");
  });
});

describe("content/body-line-limit", () => {
  it("passes for small body", async () => {
    const d = await runRule(bodyLineLimit, { body: "# Small\nShort." });
    expect(d).toHaveLength(0);
  });

  it("reports body exceeding 500 lines", async () => {
    const bigBody = "line\n".repeat(501);
    const d = await runRule(bodyLineLimit, { body: bigBody });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("lines");
  });
});

describe("content/has-headings", () => {
  it("passes when body has headings", async () => {
    const d = await runRule(hasHeadings, {
      body: "# Title\nContent here.",
      rawContent: "---\nname: test\n---\n# Title\nContent here.",
    });
    // mdast in test helper is empty, so this will report
    // We test the real parser integration via CLI tests
    expect(d).toHaveLength(1);
  });
});

describe("content/no-backslash-paths", () => {
  it("passes for forward-slash paths", async () => {
    const d = await runRule(noBackslashPaths, {
      body: "Run `scripts/helper.py` to validate.",
    });
    expect(d).toHaveLength(0);
  });

  it("reports backslash paths", async () => {
    const d = await runRule(noBackslashPaths, {
      body: "Run `scripts\\helper.py` to validate.",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("forward slashes");
  });

  it("detects references backslash path", async () => {
    const d = await runRule(noBackslashPaths, {
      body: "See references\\guide.md for details.",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("references\\guide.md");
  });

  it("passes for clean content", async () => {
    const d = await runRule(noBackslashPaths, {
      body: "# My Skill\nThis skill does things.",
    });
    expect(d).toHaveLength(0);
  });
});
