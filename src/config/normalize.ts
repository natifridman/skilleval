import type { SkillEvalConfig, ResolvedConfig, RuleSeverityConfig } from "./types.js";
import { defaultConfig } from "./defaults.js";
import { recommended } from "./presets/recommended.js";
import { strict } from "./presets/strict.js";
import { security } from "./presets/security.js";

const PRESETS: Record<string, Record<string, RuleSeverityConfig>> = {
  recommended,
  strict,
  security,
};

export function normalizeConfig(raw: SkillEvalConfig): ResolvedConfig {
  let baseRules: Record<string, RuleSeverityConfig> = { ...defaultConfig.rules };

  if (raw.extends) {
    const preset = PRESETS[raw.extends];
    if (!preset) {
      throw new Error(
        `Unknown preset "${raw.extends}". Available: ${Object.keys(PRESETS).join(", ")}`,
      );
    }
    baseRules = { ...preset };
  }

  if (raw.rules) {
    for (const [ruleId, severity] of Object.entries(raw.rules)) {
      baseRules[ruleId] = severity;
    }
  }

  return {
    rules: baseRules,
    ignore: raw.ignore ?? defaultConfig.ignore,
    deep: raw.deep,
  };
}
