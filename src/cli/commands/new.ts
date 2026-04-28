import { Command } from "commander";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";

const SKILL_TEMPLATE = (name: string) => `---
name: ${name}
description: Use this skill when [describe activation context].
---

# ${name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}

## Overview

[Describe what this skill does and when to use it.]

## Steps

1. [First step]
2. [Second step]
3. [Verify the result]

## Examples

\`\`\`bash
# Example command
\`\`\`

## Gotchas

- [Common pitfall to avoid]
`;

export const newCommand = new Command("new")
  .description("Scaffold a new skill directory")
  .argument("<name>", "Skill name (lowercase, hyphens)")
  .action((name: string) => {
    const dir = join(process.cwd(), name);

    if (existsSync(dir)) {
      console.log(pc.yellow(`  Directory '${name}' already exists`));
      return;
    }

    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, "scripts"), { recursive: true });
    mkdirSync(join(dir, "references"), { recursive: true });
    mkdirSync(join(dir, "assets"), { recursive: true });

    writeFileSync(join(dir, "SKILL.md"), SKILL_TEMPLATE(name), "utf-8");

    console.log(pc.green(`  Created skill '${name}'`));
    console.log(`  ${pc.dim(join(name, "SKILL.md"))}`);
    console.log(`  ${pc.dim(join(name, "scripts/"))}`);
    console.log(`  ${pc.dim(join(name, "references/"))}`);
    console.log(`  ${pc.dim(join(name, "assets/"))}`);
  });
