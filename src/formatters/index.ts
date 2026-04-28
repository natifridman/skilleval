import type { LintResult } from "../engine/types.js";
import { formatText } from "./text.js";
import { formatJson } from "./json.js";
import { formatSarif } from "./sarif.js";
import { formatGithub } from "./github.js";

export type FormatType = "text" | "json" | "sarif" | "github";

export function format(results: LintResult[], type: FormatType): string {
  switch (type) {
    case "text":
      return formatText(results);
    case "json":
      return formatJson(results);
    case "sarif":
      return formatSarif(results);
    case "github":
      return formatGithub(results);
  }
}
