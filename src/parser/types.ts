import type { Root as MdastRoot } from "mdast";

export interface FrontmatterData {
  name?: string;
  description?: string;
  license?: string;
  compatibility?: string;
  "allowed-tools"?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SkillFile {
  path: string;
  relativePath: string;
}

export interface ParsedSkill {
  dirPath: string;
  dirName: string;
  skillMdPath: string;
  rawContent: string;
  frontmatter: FrontmatterData;
  rawFrontmatter: string;
  frontmatterStartLine: number;
  frontmatterEndLine: number;
  body: string;
  bodyStartLine: number;
  mdast: MdastRoot;
  files: SkillFile[];
  parseErrors: string[];
}
