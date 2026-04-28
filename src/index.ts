export { parseSkill } from "./parser/index.js";
export type { ParsedSkill, FrontmatterData, SkillFile } from "./parser/types.js";

export { lint } from "./engine/engine.js";
export type { EngineOptions } from "./engine/engine.js";
export {
  registerRule,
  getAllRules,
  getRulesByCategory,
} from "./engine/rule-registry.js";
export type {
  Rule,
  RuleMeta,
  RuleContext,
  Diagnostic,
  Severity,
  RuleCategory,
  LintResult,
} from "./engine/types.js";

export { registerAllRules } from "./rules/index.js";
