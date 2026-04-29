export interface GitHubRef {
  owner: string;
  repo: string;
  ref?: string;
  subpath?: string;
}

const GITHUB_HTTPS_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+)(\/.*)?)?$/;

const GITHUB_SHORTHAND_RE = /^github:([^/]+)\/([^/]+?)(?:\.git)?(\/.*)?$/;

export function parseGitHubUrl(input: string): GitHubRef | null {
  const httpsMatch = input.match(GITHUB_HTTPS_RE);
  if (httpsMatch) {
    const [, owner, repo, ref, subpath] = httpsMatch;
    return {
      owner,
      repo,
      ref: ref || undefined,
      subpath: subpath ? subpath.replace(/^\//, "") : undefined,
    };
  }

  const shortMatch = input.match(GITHUB_SHORTHAND_RE);
  if (shortMatch) {
    const [, owner, repo, subpath] = shortMatch;
    return {
      owner,
      repo,
      subpath: subpath ? subpath.replace(/^\//, "") : undefined,
    };
  }

  return null;
}
