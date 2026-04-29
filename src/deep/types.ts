import type { Severity } from "../engine/types.js";

export interface DeepFinding {
  aspect: "security" | "coherence" | "alignment" | "completeness" | "tone" | "design-patterns";
  severity: Severity;
  finding: string;
  location?: string;
  recommendation: string;
}

export interface DeepAnalysisResult {
  findings: DeepFinding[];
  summary: string;
  flaggedAsMalicious: boolean;
  tokensUsed: { input: number; output: number };
}

export interface DiagnosticReview {
  ruleId: string;
  line: number;
  dismiss: boolean;
  reason: string;
}
