import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { createGitHubClient } from "../../../src/github/client.js";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
  spawn: vi.fn(),
}));

const mockedExecFileSync = vi.mocked(execFileSync);

describe("createGitHubClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses gh auth token when available", () => {
    mockedExecFileSync.mockReturnValue("gho_test_token\n" as any);

    const client = createGitHubClient();
    expect(client).toBeDefined();
    expect(client.getTree).toBeTypeOf("function");
    expect(client.downloadTarball).toBeTypeOf("function");
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      "gh",
      ["auth", "token"],
      expect.any(Object),
    );
  });

  it("falls back to GITHUB_TOKEN when gh is not available", () => {
    mockedExecFileSync.mockImplementation(() => {
      throw new Error("command not found");
    });

    process.env.GITHUB_TOKEN = "test-token";
    const client = createGitHubClient();
    expect(client).toBeDefined();
  });

  it("creates client without token for public repos", () => {
    mockedExecFileSync.mockImplementation(() => {
      throw new Error("command not found");
    });

    delete process.env.GITHUB_TOKEN;
    const client = createGitHubClient();
    expect(client).toBeDefined();
  });
});
