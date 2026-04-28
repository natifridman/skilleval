import { Command } from "commander";
import { lint } from "../../engine/engine.js";
import { registerAllRules } from "../../rules/index.js";
import { loadConfig } from "../../config/index.js";
import { format, type FormatType } from "../../formatters/index.js";
import { parseSkill } from "../../parser/index.js";
import {
  resolveProvider,
  runDeepAnalysis,
  deepFindingsToDiagnostics,
} from "../../deep/index.js";
import type { LintResult } from "../../engine/types.js";
import { applyFixes } from "../../engine/fixer.js";
import pc from "picocolors";

export const checkCommand = new Command("check")
  .description("Lint and evaluate skill directories")
  .argument("<paths...>", "Paths to skill directories or SKILL.md files")
  .option("-f, --format <type>", "Output format: text, json, sarif, github", "text")
  .option("--fix", "Auto-fix fixable issues")
  .option("--deep", "Run LLM-powered deep analysis")
  .option("--deep-provider <name>", "LLM provider: anthropic, vertex")
  .option("--strict", "Treat warnings as errors")
  .option("--rule <id>", "Run only specific rules (repeatable)", collect, [])
  .option("--category <name>", "Run only rules in a category (repeatable)", collect, [])
  .option("-c, --config <path>", "Path to config file")
  .option("--no-config", "Ignore config files, use defaults")
  .option("-q, --quiet", "Suppress all output except errors")
  .action(async (paths: string[], options) => {
    registerAllRules();

    const config = options.config !== false
      ? await loadConfig(typeof options.config === "string" ? options.config : undefined)
      : await loadConfig();

    const results: LintResult[] = [];
    for (const path of paths) {
      const result = await lint(path, { rules: config.rules });

      if (options.deep) {
        try {
          const providerName = options.deepProvider ?? config.deep?.provider;
          const provider = resolveProvider(providerName, config.deep?.model);
          const skill = await parseSkill(path);
          const deepResult = await runDeepAnalysis(skill, provider);
          const deepDiags = deepFindingsToDiagnostics(
            deepResult.findings,
            skill.skillMdPath,
          );

          result.diagnostics.push(...deepDiags);
          result.errorCount += deepDiags.filter((d) => d.severity === "error").length;
          result.warningCount += deepDiags.filter((d) => d.severity === "warning").length;
          result.infoCount += deepDiags.filter((d) => d.severity === "info").length;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!options.quiet) {
            console.error(`\n  Deep analysis failed: ${msg}\n`);
          }
        }
      }

      results.push(result);
    }

    if (options.fix) {
      for (const result of results) {
        const fixResults = applyFixes(result.diagnostics);
        for (const fr of fixResults) {
          if (!options.quiet) {
            console.log(`  ${pc.green("Fixed")} ${fr.fixesApplied} issue(s) in ${fr.filePath}`);
          }
        }
      }
    }

    const output = format(results, options.format as FormatType);
    if (!options.quiet) {
      process.stdout.write(output);
    }

    const hasErrors = results.some((r) => r.errorCount > 0);
    const hasWarnings = results.some((r) => r.warningCount > 0);

    if (hasErrors) {
      process.exitCode = 1;
    } else if (options.strict && hasWarnings) {
      process.exitCode = 2;
    }
  });

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}
