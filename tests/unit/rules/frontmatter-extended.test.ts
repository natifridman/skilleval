import { describe, it, expect } from "vitest";
import { runRule } from "../../helpers.js";
import { nameFormat } from "../../../src/rules/frontmatter/name-format.js";
import { nameMatchesDirectory } from "../../../src/rules/frontmatter/name-matches-directory.js";
import { descriptionLength } from "../../../src/rules/frontmatter/description-length.js";
import { descriptionQuality } from "../../../src/rules/frontmatter/description-quality.js";
import { compatibilityLength } from "../../../src/rules/frontmatter/compatibility-length.js";
import { metadataTypes } from "../../../src/rules/frontmatter/metadata-types.js";
import { allowedToolsFormat } from "../../../src/rules/frontmatter/allowed-tools-format.js";
import { nameNoReservedWords } from "../../../src/rules/frontmatter/name-no-reserved-words.js";

describe("frontmatter/name-format", () => {
  it("passes for valid lowercase name", async () => {
    const d = await runRule(nameFormat, {
      frontmatter: { name: "my-skill" },
      rawFrontmatter: "name: my-skill",
    });
    expect(d).toHaveLength(0);
  });

  it("reports uppercase name", async () => {
    const d = await runRule(nameFormat, {
      frontmatter: { name: "My-Skill" },
      rawFrontmatter: "name: My-Skill",
    });
    expect(d.some((x) => x.message.includes("lowercase"))).toBe(true);
  });

  it("reports name > 64 chars", async () => {
    const longName = "a".repeat(65);
    const d = await runRule(nameFormat, {
      frontmatter: { name: longName },
      rawFrontmatter: `name: ${longName}`,
    });
    expect(d.some((x) => x.message.includes("exceeds"))).toBe(true);
  });

  it("reports leading hyphen", async () => {
    const d = await runRule(nameFormat, {
      frontmatter: { name: "-bad-name" },
      rawFrontmatter: "name: -bad-name",
    });
    expect(d.some((x) => x.message.includes("start with a hyphen"))).toBe(true);
  });

  it("reports consecutive hyphens", async () => {
    const d = await runRule(nameFormat, {
      frontmatter: { name: "bad--name" },
      rawFrontmatter: "name: bad--name",
    });
    expect(d.some((x) => x.message.includes("consecutive"))).toBe(true);
  });

  it("reports invalid characters", async () => {
    const d = await runRule(nameFormat, {
      frontmatter: { name: "bad_name!" },
      rawFrontmatter: "name: bad_name!",
    });
    expect(d.some((x) => x.message.includes("invalid characters"))).toBe(true);
  });
});

describe("frontmatter/name-matches-directory", () => {
  it("passes when name matches directory", async () => {
    const d = await runRule(nameMatchesDirectory, {
      dirName: "my-skill",
      frontmatter: { name: "my-skill" },
      rawFrontmatter: "name: my-skill",
    });
    expect(d).toHaveLength(0);
  });

  it("reports mismatch", async () => {
    const d = await runRule(nameMatchesDirectory, {
      dirName: "actual-dir",
      frontmatter: { name: "wrong-name" },
      rawFrontmatter: "name: wrong-name",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("does not match");
  });
});

describe("frontmatter/description-length", () => {
  it("passes for normal length", async () => {
    const d = await runRule(descriptionLength, {
      frontmatter: { description: "A valid description" },
      rawFrontmatter: "description: A valid description",
    });
    expect(d).toHaveLength(0);
  });

  it("reports > 1024 chars", async () => {
    const longDesc = "x".repeat(1025);
    const d = await runRule(descriptionLength, {
      frontmatter: { description: longDesc },
      rawFrontmatter: `description: ${longDesc}`,
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("1025");
  });
});

describe("frontmatter/description-quality", () => {
  it("passes for substantive description", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "Use when deploying to staging environments with Docker" },
      rawFrontmatter: "description: Use when deploying to staging environments with Docker",
    });
    expect(d).toHaveLength(0);
  });

  it("reports short description", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "A skill" },
      rawFrontmatter: "description: A skill",
    });
    expect(d.some((x) => x.message.includes("characters"))).toBe(true);
  });

  it("reports generic pattern", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "Helps with things and stuff in the codebase" },
      rawFrontmatter: "description: Helps with things and stuff in the codebase",
    });
    expect(d.some((x) => x.message.includes("generic"))).toBe(true);
  });

  it("reports 'just' pattern", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "Just does some things with files in the repo" },
      rawFrontmatter: "description: Just does some things with files in the repo",
    });
    expect(d.some((x) => x.message.includes("generic"))).toBe(true);
  });

  it("reports 'handles' pattern", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "Handles documents and other resources" },
      rawFrontmatter: "description: Handles documents and other resources",
    });
    expect(d.some((x) => x.message.includes("generic"))).toBe(true);
  });

  it("reports 'manages' pattern", async () => {
    const d = await runRule(descriptionQuality, {
      frontmatter: { description: "Manages files in the project directory" },
      rawFrontmatter: "description: Manages files in the project directory",
    });
    expect(d.some((x) => x.message.includes("generic"))).toBe(true);
  });
});

describe("frontmatter/compatibility-length", () => {
  it("passes for normal length", async () => {
    const d = await runRule(compatibilityLength, {
      frontmatter: { compatibility: "Requires Node.js 20+" },
      rawFrontmatter: "compatibility: Requires Node.js 20+",
    });
    expect(d).toHaveLength(0);
  });

  it("reports > 500 chars", async () => {
    const longCompat = "x".repeat(501);
    const d = await runRule(compatibilityLength, {
      frontmatter: { compatibility: longCompat },
      rawFrontmatter: `compatibility: ${longCompat}`,
    });
    expect(d).toHaveLength(1);
  });
});

describe("frontmatter/metadata-types", () => {
  it("passes for string values", async () => {
    const d = await runRule(metadataTypes, {
      frontmatter: { metadata: { author: "test", version: "1.0" } },
      rawFrontmatter: "metadata:\n  author: test\n  version: '1.0'",
    });
    expect(d).toHaveLength(0);
  });

  it("reports non-string values", async () => {
    const d = await runRule(metadataTypes, {
      frontmatter: { metadata: { count: 5, nested: { a: 1 } } as any },
      rawFrontmatter: "metadata:\n  count: 5\n  nested:\n    a: 1",
    });
    expect(d.length).toBeGreaterThanOrEqual(1);
  });

  it("reports array metadata", async () => {
    const d = await runRule(metadataTypes, {
      frontmatter: { metadata: ["a", "b"] as any },
      rawFrontmatter: "metadata:\n  - a\n  - b",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("array");
  });
});

describe("frontmatter/allowed-tools-format", () => {
  it("passes for string value", async () => {
    const d = await runRule(allowedToolsFormat, {
      frontmatter: { "allowed-tools": "Read Bash(git *)" },
      rawFrontmatter: "allowed-tools: Read Bash(git *)",
    });
    expect(d).toHaveLength(0);
  });

  it("reports non-string value", async () => {
    const d = await runRule(allowedToolsFormat, {
      frontmatter: { "allowed-tools": ["Read", "Bash"] as any },
      rawFrontmatter: "allowed-tools:\n  - Read\n  - Bash",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("array");
  });
});

describe("frontmatter/name-no-reserved-words", () => {
  it("passes for normal names", async () => {
    const d = await runRule(nameNoReservedWords, {
      frontmatter: { name: "pdf-processing" },
      rawFrontmatter: "name: pdf-processing",
    });
    expect(d).toHaveLength(0);
  });

  it("reports name containing 'claude'", async () => {
    const d = await runRule(nameNoReservedWords, {
      frontmatter: { name: "claude-helper" },
      rawFrontmatter: "name: claude-helper",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("claude");
  });

  it("reports name containing 'anthropic'", async () => {
    const d = await runRule(nameNoReservedWords, {
      frontmatter: { name: "anthropic-tools" },
      rawFrontmatter: "name: anthropic-tools",
    });
    expect(d).toHaveLength(1);
    expect(d[0].message).toContain("anthropic");
  });

  it("reports name with reserved word as substring", async () => {
    const d = await runRule(nameNoReservedWords, {
      frontmatter: { name: "my-claude-skill" },
      rawFrontmatter: "name: my-claude-skill",
    });
    expect(d).toHaveLength(1);
  });

  it("skips when name is missing", async () => {
    const d = await runRule(nameNoReservedWords, {
      frontmatter: { description: "test" },
      rawFrontmatter: "description: test",
    });
    expect(d).toHaveLength(0);
  });
});
