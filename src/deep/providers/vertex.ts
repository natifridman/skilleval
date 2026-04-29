import type { LLMProvider } from "../provider.js";

export class VertexProvider implements LLMProvider {
  name = "vertex";
  private project: string;
  private location: string;
  private model: string;

  constructor(project: string, location: string, model?: string) {
    this.project = project;
    this.location = location;
    this.model = model ?? "claude-sonnet-4-6";
  }

  async analyze(systemPrompt: string, userContent: string) {
    let AnthropicVertex: any;
    try {
      AnthropicVertex = (await import("@anthropic-ai/vertex-sdk" as string)).AnthropicVertex;
    } catch {
      throw new Error(
        "Install @anthropic-ai/vertex-sdk to use the Vertex AI provider:\n  npm install @anthropic-ai/vertex-sdk",
      );
    }

    const client = new AnthropicVertex({
      projectId: this.project,
      region: this.location,
    });

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
