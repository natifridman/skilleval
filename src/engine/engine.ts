import { parseSkill } from "../parser/index.js";
import { getAllRules } from "./rule-registry.js";
import type {
  Diagnostic,
  LintResult,
  ReportDescriptor,
  Rule,
  RuleContext,
  Severity,
} from "./types.js";
import type { ParsedSkill } from "../parser/types.js";

export interface EngineOptions {
  rules?: Record<string, Severity | "off" | [Severity | "off", ...unknown[]]>;
}

function interpolateMessage(
  template: string,
  data?: Record<string, string | number>,
): string {
  if (!data) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    data[key] !== undefined ? String(data[key]) : `{{${key}}}`,
  );
}

function resolveRuleSeverity(
  rule: Rule,
  config?: EngineOptions["rules"],
): Severity | "off" {
  if (!config) return rule.meta.defaultSeverity;
  const entry = config[rule.meta.id];
  if (entry === undefined) return rule.meta.defaultSeverity;
  if (typeof entry === "string") return entry;
  if (Array.isArray(entry)) return entry[0];
  return rule.meta.defaultSeverity;
}

function resolveRuleOptions(
  rule: Rule,
  config?: EngineOptions["rules"],
): unknown[] {
  if (!config) return [];
  const entry = config[rule.meta.id];
  if (Array.isArray(entry)) return entry.slice(1);
  return [];
}

export async function lint(
  skillPath: string,
  options: EngineOptions = {},
): Promise<LintResult> {
  const skill = await parseSkill(skillPath);
  const diagnostics: Diagnostic[] = [];
  const rules = getAllRules();

  for (const parseError of skill.parseErrors) {
    diagnostics.push({
      ruleId: "parser",
      severity: "error",
      message: parseError,
      location: { file: skill.skillMdPath },
      category: "structural",
    });
  }

  for (const rule of rules) {
    const severity = resolveRuleSeverity(rule, options.rules);
    if (severity === "off") continue;

    const ruleOptions = resolveRuleOptions(rule, options.rules);

    const context: RuleContext = {
      skill,
      severity,
      options: ruleOptions,
      report(descriptor: ReportDescriptor) {
        const template =
          rule.meta.messages[descriptor.messageId] ?? descriptor.messageId;
        const message = interpolateMessage(template, descriptor.data);

        diagnostics.push({
          ruleId: rule.meta.id,
          severity,
          message,
          location: {
            file: descriptor.location?.file ?? skill.skillMdPath,
            startLine: descriptor.location?.startLine,
            startColumn: descriptor.location?.startColumn,
            endLine: descriptor.location?.endLine,
            endColumn: descriptor.location?.endColumn,
          },
          fix: descriptor.fix,
          category: rule.meta.category,
        });
      },
    };

    await rule.create(context);
  }

  return {
    skillPath,
    diagnostics,
    errorCount: diagnostics.filter((d) => d.severity === "error").length,
    warningCount: diagnostics.filter((d) => d.severity === "warning").length,
    infoCount: diagnostics.filter((d) => d.severity === "info").length,
    fixableCount: diagnostics.filter((d) => d.fix !== undefined).length,
  };
}
