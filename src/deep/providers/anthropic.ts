import type { LLMProvider } from "../provider.js";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? "claude-sonnet-4-6";
  }

  async analyze(systemPrompt: string, userContent: string) {
    let Anthropic: any;
    try {
      Anthropic = (await import("@anthropic-ai/sdk" as string)).default;
    } catch {
      throw new Error(
        "Install @anthropic-ai/sdk to use the Anthropic provider:\n  npm install @anthropic-ai/sdk",
      );
    }

    const client = new Anthropic({ apiKey: this.apiKey });

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: [{ type: "text" as const, text: systemPrompt, cache_control: { type: "ephemeral" as const } }],
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("");

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}
