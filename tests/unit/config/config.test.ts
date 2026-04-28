import { describe, it, expect } from "vitest";
import { normalizeConfig } from "../../../src/config/normalize.js";

describe("config normalization", () => {
  it("uses recommended preset by default", () => {
    const config = normalizeConfig({});
    expect(config.rules["frontmatter/name-required"]).toBe("error");
    expect(config.rules["best-practices/has-examples"]).toBe("info");
  });

  it("applies strict preset", () => {
    const config = normalizeConfig({ extends: "strict" });
    expect(config.rules["best-practices/has-examples"]).toBe("warning");
  });

  it("applies security preset", () => {
    const config = normalizeConfig({ extends: "security" });
    expect(config.rules["security/no-prompt-injection"]).toBe("error");
    expect(config.rules["frontmatter/name-format"]).toBe("off");
  });

  it("overrides preset rules", () => {
    const config = normalizeConfig({
      extends: "recommended",
      rules: {
        "content/no-html-in-body": "off",
        "security/no-remote-fetch": "error",
      },
    });
    expect(config.rules["content/no-html-in-body"]).toBe("off");
    expect(config.rules["security/no-remote-fetch"]).toBe("error");
  });

  it("throws on unknown preset", () => {
    expect(() => normalizeConfig({ extends: "nonexistent" })).toThrow("Unknown preset");
  });

  it("uses default ignore patterns", () => {
    const config = normalizeConfig({});
    expect(config.ignore).toContain("node_modules");
  });

  it("accepts custom ignore patterns", () => {
    const config = normalizeConfig({ ignore: ["build", "tmp"] });
    expect(config.ignore).toEqual(["build", "tmp"]);
  });
});
