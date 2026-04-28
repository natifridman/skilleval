export { lint } from "./engine.js";
export type { EngineOptions } from "./engine.js";
export {
  registerRule,
  getRule,
  getAllRules,
  getRulesByCategory,
} from "./rule-registry.js";
export type {
  Rule,
  RuleMeta,
  RuleContext,
  ReportDescriptor,
  Diagnostic,
  DiagnosticLocation,
  DiagnosticFix,
  Severity,
  RuleCategory,
  LintResult,
} from "./types.js";
