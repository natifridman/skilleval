import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "../../../src/github/parse-url.js";

describe("parseGitHubUrl", () => {
  it("parses basic https URL", () => {
    const result = parseGitHubUrl("https://github.com/owner/repo");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: undefined,
      subpath: undefined,
    });
  });

  it("parses https URL with branch", () => {
    const result = parseGitHubUrl("https://github.com/owner/repo/tree/main");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: "main",
      subpath: undefined,
    });
  });

  it("parses https URL with branch and subpath", () => {
    const result = parseGitHubUrl(
      "https://github.com/owner/repo/tree/main/skills/my-skill",
    );
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: "main",
      subpath: "skills/my-skill",
    });
  });

  it("parses https URL with .git suffix", () => {
    const result = parseGitHubUrl("https://github.com/owner/repo.git");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: undefined,
      subpath: undefined,
    });
  });

  it("parses http URL", () => {
    const result = parseGitHubUrl("http://github.com/owner/repo");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: undefined,
      subpath: undefined,
    });
  });

  it("parses shorthand format", () => {
    const result = parseGitHubUrl("github:owner/repo");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      subpath: undefined,
    });
  });

  it("parses shorthand with subpath", () => {
    const result = parseGitHubUrl("github:owner/repo/skills/my-skill");
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      subpath: "skills/my-skill",
    });
  });

  it("returns null for local paths", () => {
    expect(parseGitHubUrl("./my-skill")).toBeNull();
    expect(parseGitHubUrl("/absolute/path/to/skill")).toBeNull();
    expect(parseGitHubUrl("relative/path")).toBeNull();
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseGitHubUrl("https://gitlab.com/owner/repo")).toBeNull();
    expect(parseGitHubUrl("https://bitbucket.org/owner/repo")).toBeNull();
  });

  it("handles refs with slashes (feature branches)", () => {
    const result = parseGitHubUrl(
      "https://github.com/owner/repo/tree/feat/new-thing",
    );
    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
      ref: "feat",
      subpath: "new-thing",
    });
  });
});
