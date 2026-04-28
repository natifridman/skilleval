export interface LLMProvider {
  name: string;
  analyze(systemPrompt: string, userContent: string): Promise<{
    text: string;
    inputTokens: number;
    outputTokens: number;
  }>;
}
