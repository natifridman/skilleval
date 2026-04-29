import type { LLMProvider } from "./provider.js";
import type { DeepAnalysisResult, DeepFinding, DiagnosticReview } from "./types.js";
import type { ParsedSkill } from "../parser/types.js";
import type { Diagnostic } from "../engine/types.js";
import { SYSTEM_PROMPT, TRIAGE_SYSTEM_PROMPT, buildUserPrompt, buildTriagePrompt } from "./prompts.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { VertexProvider } from "./providers/vertex.js";

const ASPECT_TO_CATEGORY: Record<DeepFinding["aspect"], Diagnostic["category"]> = {
  security: "security",
  coherence: "content",
  alignment: "content",
  completeness: "content",
  tone: "security",
};

export function resolveProvider(
  providerName?: string,
  model?: string,
): LLMProvider {
  if (providerName === "anthropic" || (!providerName && process.env.ANTHROPIC_API_KEY)) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for Anthropic provider.\n" +
        "Set it with: export ANTHROPIC_API_KEY=sk-ant-...",
      );
    }
    return new AnthropicProvider(key, model);
  }

  if (providerName === "vertex" || (!providerName && process.env.GOOGLE_CLOUD_PROJECT)) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-east5";
    if (!project) {
      throw new Error(
        "GOOGLE_CLOUD_PROJECT environment variable is required for Vertex AI provider.\n" +
        "Set it with: export GOOGLE_CLOUD_PROJECT=my-project",
      );
    }
    return new VertexProvider(project, location, model);
  }

  throw new Error(
    "No LLM provider configured for deep analysis.\n\n" +
    "Set one of:\n" +
    "  ANTHROPIC_API_KEY=sk-ant-...    (Anthropic API)\n" +
    "  GOOGLE_CLOUD_PROJECT=my-proj    (Vertex AI)\n\n" +
    "Or specify explicitly: --deep-provider anthropic|vertex",
  );
}

export async function runDeepAnalysis(
  skill: ParsedSkill,
  provider: LLMProvider,
): Promise<DeepAnalysisResult> {
  const fileList = skill.files.map((f) => f.relativePath);
  const userPrompt = buildUserPrompt(skill.rawContent, fileList);

  const response = await provider.analyze(SYSTEM_PROMPT, userPrompt);

  let parsed: { findings: DeepFinding[]; summary: string; flaggedAsMalicious: boolean };
  try {
    const cleaned = response.text.replace(/^```json\s*\n?/, "").replace(/\n?```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      findings: [{
        aspect: "coherence",
        severity: "warning",
        finding: "Deep analysis returned unparseable response",
        recommendation: "Retry the analysis",
      }],
      summary: "Analysis response could not be parsed as JSON.",
      flaggedAsMalicious: false,
      tokensUsed: { input: response.inputTokens, output: response.outputTokens },
    };
  }

  return {
    findings: parsed.findings ?? [],
    summary: parsed.summary ?? "",
    flaggedAsMalicious: parsed.flaggedAsMalicious ?? false,
    tokensUsed: { input: response.inputTokens, output: response.outputTokens },
  };
}

export async function triageDiagnostics(
  skill: ParsedSkill,
  diagnostics: Diagnostic[],
  provider: LLMProvider,
): Promise<DiagnosticReview[]> {
  const triageable = diagnostics.filter(
    (d) => d.category === "security" && d.location.startLine !== undefined,
  );
  if (triageable.length === 0) return [];

  const prompt = buildTriagePrompt(
    skill.rawContent,
    triageable.map((d) => ({
      ruleId: d.ruleId,
      line: d.location.startLine,
      message: d.message,
    })),
  );

  const response = await provider.analyze(TRIAGE_SYSTEM_PROMPT, prompt);

  try {
    const cleaned = response.text.replace(/^```json\s*\n?/, "").replace(/\n?```\s*$/, "");
    const parsed = JSON.parse(cleaned) as { reviews: DiagnosticReview[] };
    return parsed.reviews ?? [];
  } catch {
    return [];
  }
}

export function deepFindingsToDiagnostics(
  findings: DeepFinding[],
  skillMdPath: string,
): Diagnostic[] {
  return findings.map((f) => ({
    ruleId: `deep/${f.aspect}`,
    severity: f.severity,
    message: `${f.finding}${f.recommendation ? ` — ${f.recommendation}` : ""}`,
    location: { file: skillMdPath },
    category: ASPECT_TO_CATEGORY[f.aspect],
  }));
}
