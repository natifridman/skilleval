import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import { lint } from "../../src/engine/engine.js";
import { registerAllRules } from "../../src/rules/index.js";
import { clearRules } from "../../src/engine/rule-registry.js";

const FIXTURES = join(import.meta.dirname, "../fixtures");

describe("integration: full lint pipeline", () => {
  beforeEach(() => {
    clearRules();
    registerAllRules();
  });

  it("valid minimal skill has no errors", async () => {
    const result = await lint(join(FIXTURES, "valid/minimal-skill"));
    expect(result.errorCount).toBe(0);
  });

  it("valid full skill has no errors", async () => {
    const result = await lint(join(FIXTURES, "valid/full-skill"));
    expect(result.errorCount).toBe(0);
  });

  it("detects prompt injection", async () => {
    const result = await lint(join(FIXTURES, "security/prompt-injection"));
    const securityErrors = result.diagnostics.filter(
      (d) => d.category === "security" && d.severity === "error",
    );
    expect(securityErrors.length).toBeGreaterThan(0);
    expect(result.errorCount).toBeGreaterThan(0);
  });

  it("detects credential theft", async () => {
    const result = await lint(join(FIXTURES, "security/credential-theft"));
    const credErrors = result.diagnostics.filter(
      (d) => d.ruleId === "security/no-credential-access",
    );
    expect(credErrors.length).toBeGreaterThan(0);
  });

  it("detects curl|bash patterns", async () => {
    const result = await lint(join(FIXTURES, "security/curl-bash"));
    const curlErrors = result.diagnostics.filter(
      (d) => d.ruleId === "security/no-curl-bash",
    );
    expect(curlErrors.length).toBeGreaterThan(0);
  });

  it("detects name mismatch", async () => {
    const result = await lint(join(FIXTURES, "invalid/name-mismatch"));
    const mismatch = result.diagnostics.filter(
      (d) => d.ruleId === "frontmatter/name-matches-directory",
    );
    expect(mismatch).toHaveLength(1);
  });

  it("detects missing description + extra fields", async () => {
    const result = await lint(join(FIXTURES, "invalid/bad-frontmatter"));
    expect(result.diagnostics.some((d) => d.ruleId === "frontmatter/description-required")).toBe(true);
    expect(result.diagnostics.some((d) => d.ruleId === "frontmatter/no-extra-fields")).toBe(true);
  });

  it("detects empty body", async () => {
    const result = await lint(join(FIXTURES, "invalid/empty-body"));
    expect(result.diagnostics.some((d) => d.ruleId === "content/body-not-empty")).toBe(true);
  });
});
