import { Command } from "commander";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";

const DEFAULT_CONFIG = `{
  "extends": "recommended",
  "rules": {},
  "ignore": ["node_modules", ".git", "dist"]
}
`;

export const initCommand = new Command("init")
  .description("Create a .skillevalrc.json config file")
  .action(() => {
    const configPath = join(process.cwd(), ".skillevalrc.json");

    if (existsSync(configPath)) {
      console.log(pc.yellow("  .skillevalrc.json already exists"));
      return;
    }

    writeFileSync(configPath, DEFAULT_CONFIG, "utf-8");
    console.log(pc.green("  Created .skillevalrc.json"));
  });
