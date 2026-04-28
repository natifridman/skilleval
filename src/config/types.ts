import type { Severity } from "../engine/types.js";

export type RuleSeverityConfig = Severity | "off" | [Severity | "off", ...unknown[]];

export interface SkillEvalConfig {
  extends?: string;
  rules?: Record<string, RuleSeverityConfig>;
  ignore?: string[];
  deep?: {
    provider?: "anthropic" | "vertex";
    model?: string;
  };
}

export interface ResolvedConfig {
  rules: Record<string, RuleSeverityConfig>;
  ignore: string[];
  deep?: {
    provider?: "anthropic" | "vertex";
    model?: string;
  };
}
