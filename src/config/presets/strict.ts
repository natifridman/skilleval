import type { RuleSeverityConfig } from "../types.js";
import { recommended } from "./recommended.js";

export const strict: Record<string, RuleSeverityConfig> = {
  ...recommended,
  "best-practices/description-has-trigger-words": "warning",
  "best-practices/progressive-disclosure": "warning",
  "best-practices/scripts-are-referenced": "warning",
  "best-practices/has-examples": "warning",
  "best-practices/gotchas-section": "warning",
  "best-practices/pinned-versions": "warning",
  "best-practices/scripts-have-help": "warning",
};
