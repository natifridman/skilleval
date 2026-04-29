import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchRemoteSkills } from "../../../src/github/fetch-skills.js";
import type { GitHubRef } from "../../../src/github/parse-url.js";

vi.mock("../../../src/github/client.js", () => ({
  createGitHubClient: vi.fn(),
}));

import { createGitHubClient } from "../../../src/github/client.js";

const mockedCreateClient = vi.mocked(createGitHubClient);

describe("fetchRemoteSkills", () => {
  let tempDirs: string[] = [];

  function mockTarball(files: Record<string, string>) {
    mockedCreateClient.mockReturnValue({
      getTree: vi.fn(),
      downloadTarball: vi.fn().mockImplementation(
        async (_owner: string, _repo: string, _ref: string, destDir: string) => {
          for (const [filePath, content] of Object.entries(files)) {
            const fullPath = join(destDir, filePath);
            mkdirSync(join(fullPath, ".."), { recursive: true });
            writeFileSync(fullPath, content, "utf-8");
          }
        },
      ),
    });
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    tempDirs = [];
  });

  afterEach(() => {
    for (const p of tempDirs) {
      rmSync(p, { recursive: true, force: true });
    }
  });

  it("discovers a single skill at repo root", async () => {
    mockTarball({
      "SKILL.md": "---\nname: test\n---\n# Test",
      "scripts/run.sh": "#!/bin/bash\necho hello",
    });

    const ref: GitHubRef = { owner: "org", repo: "skills" };
    const result = await fetchRemoteSkills(ref);
    tempDirs.push(result.tempDir);

    expect(result.skills).toHaveLength(1);
    expect(existsSync(result.skills[0].localPath)).toBe(true);
  });

  it("discovers multiple skills in subdirectories", async () => {
    mockTarball({
      "skills/a/SKILL.md": "---\nname: a\n---\n# A",
      "skills/b/SKILL.md": "---\nname: b\n---\n# B",
      "README.md": "# Repo",
    });

    const ref: GitHubRef = { owner: "org", repo: "skills" };
    const result = await fetchRemoteSkills(ref);
    tempDirs.push(result.tempDir);

    expect(result.skills).toHaveLength(2);
    expect(result.skills.map((s) => s.remotePath).sort()).toEqual([
      "skills/a",
      "skills/b",
    ]);
  });

  it("filters by subpath", async () => {
    mockTarball({
      "skills/a/SKILL.md": "---\nname: a\n---\n# A",
      "skills/b/SKILL.md": "---\nname: b\n---\n# B",
    });

    const ref: GitHubRef = {
      owner: "org",
      repo: "skills",
      subpath: "skills/a",
    };
    const result = await fetchRemoteSkills(ref);
    tempDirs.push(result.tempDir);

    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].remotePath).toBe("skills/a");
  });

  it("returns tempDir for cleanup", async () => {
    mockTarball({
      "SKILL.md": "---\nname: test\n---\n# Test",
    });

    const ref: GitHubRef = { owner: "org", repo: "skills" };
    const result = await fetchRemoteSkills(ref);
    tempDirs.push(result.tempDir);

    expect(result.tempDir).toBeTruthy();
    expect(existsSync(result.tempDir)).toBe(true);
  });

  it("throws when no SKILL.md found", async () => {
    mockTarball({
      "README.md": "# Just a readme",
    });

    const ref: GitHubRef = { owner: "org", repo: "empty" };
    await expect(fetchRemoteSkills(ref)).rejects.toThrow(
      "No SKILL.md files found",
    );
  });

  it("throws when subpath has no SKILL.md", async () => {
    mockTarball({
      "skills/a/SKILL.md": "---\nname: a\n---\n# A",
    });

    const ref: GitHubRef = {
      owner: "org",
      repo: "skills",
      subpath: "skills/nonexistent",
    };
    await expect(fetchRemoteSkills(ref)).rejects.toThrow(
      'No SKILL.md found under "skills/nonexistent"',
    );
  });
});
