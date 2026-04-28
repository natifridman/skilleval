import type { Rule } from "./types.js";

const rules = new Map<string, Rule>();

export function registerRule(rule: Rule): void {
  if (rules.has(rule.meta.id)) {
    throw new Error(`Rule "${rule.meta.id}" is already registered`);
  }
  rules.set(rule.meta.id, rule);
}

export function getRule(id: string): Rule | undefined {
  return rules.get(id);
}

export function getAllRules(): Rule[] {
  return Array.from(rules.values());
}

export function getRulesByCategory(category: string): Rule[] {
  return getAllRules().filter((r) => r.meta.category === category);
}

export function clearRules(): void {
  rules.clear();
}
