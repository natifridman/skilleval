import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, basename, resolve } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import type { Root as MdastRoot } from "mdast";
import type { ParsedSkill, SkillFile } from "./types.js";
import { extractFrontmatter } from "./frontmatter.js";

const markdownParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"]);

function findSkillMd(dirPath: string): string | null {
  const preferred = join(dirPath, "SKILL.md");
  if (existsSync(preferred)) return preferred;

  const fallback = join(dirPath, "skill.md");
  if (existsSync(fallback)) return fallback;

  return null;
}

function walkDirectory(dirPath: string): SkillFile[] {
  const files: SkillFile[] = [];
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isFile()) {
      files.push({
        path: fullPath,
        relativePath: relative(dirPath, fullPath),
      });
    } else if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
      const subFiles = walkDirectory(fullPath);
      for (const sub of subFiles) {
        files.push({
          path: sub.path,
          relativePath: relative(dirPath, sub.path),
        });
      }
    }
  }

  return files;
}

export async function parseSkill(skillDirPath: string): Promise<ParsedSkill> {
  const dirPath = resolve(skillDirPath);
  const dirName = basename(dirPath);
  const parseErrors: string[] = [];

  const stat = statSync(dirPath, { throwIfNoEntry: false });
  if (!stat?.isDirectory()) {
    // Treat as a direct SKILL.md path
    const resolvedFile = resolve(skillDirPath);
    const parentDir = resolve(resolvedFile, "..");
    const parentName = basename(parentDir);

    if (!existsSync(resolvedFile)) {
      return emptySkill(parentDir, parentName, resolvedFile, [
        `Path does not exist: ${skillDirPath}`,
      ]);
    }

    return parseSkillFile(parentDir, parentName, resolvedFile);
  }

  const skillMdPath = findSkillMd(dirPath);
  if (!skillMdPath) {
    return emptySkill(dirPath, dirName, join(dirPath, "SKILL.md"), [
      "SKILL.md not found",
    ]);
  }

  return parseSkillFile(dirPath, dirName, skillMdPath);
}

async function parseSkillFile(
  dirPath: string,
  dirName: string,
  skillMdPath: string,
): Promise<ParsedSkill> {
  const parseErrors: string[] = [];
  let rawContent: string;

  try {
    rawContent = readFileSync(skillMdPath, "utf-8");
  } catch {
    return emptySkill(dirPath, dirName, skillMdPath, [
      `Failed to read ${skillMdPath}`,
    ]);
  }

  let frontmatterResult;
  try {
    frontmatterResult = extractFrontmatter(rawContent);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return emptySkill(dirPath, dirName, skillMdPath, [
      `Failed to parse frontmatter: ${msg}`,
    ], rawContent);
  }

  let mdast: MdastRoot;
  try {
    mdast = markdownParser.parse(frontmatterResult.content) as MdastRoot;
  } catch {
    mdast = { type: "root", children: [] };
    parseErrors.push("Failed to parse markdown body");
  }

  const files = walkDirectory(dirPath);

  return {
    dirPath,
    dirName,
    skillMdPath,
    rawContent,
    frontmatter: frontmatterResult.data,
    rawFrontmatter: frontmatterResult.rawFrontmatter,
    frontmatterStartLine: frontmatterResult.frontmatterStartLine,
    frontmatterEndLine: frontmatterResult.frontmatterEndLine,
    body: frontmatterResult.content,
    bodyStartLine: frontmatterResult.bodyStartLine,
    mdast,
    files,
    parseErrors,
  };
}

function emptySkill(
  dirPath: string,
  dirName: string,
  skillMdPath: string,
  parseErrors: string[],
  rawContent = "",
): ParsedSkill {
  return {
    dirPath,
    dirName,
    skillMdPath,
    rawContent,
    frontmatter: {},
    rawFrontmatter: "",
    frontmatterStartLine: 1,
    frontmatterEndLine: 1,
    body: "",
    bodyStartLine: 1,
    mdast: { type: "root", children: [] },
    files: [],
    parseErrors,
  };
}
