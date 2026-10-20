import Anthropic from '@anthropic-ai/sdk';
import type {
  ConversationMessage,
  ModelClient,
  ModelRequest,
  ModelTurn,
  StopReason,
} from './model-client.js';

const STOP_REASONS: Record<string, StopReason> = {
  tool_use: 'tool_use',
  max_tokens: 'truncated',
  refusal: 'refused',
};

export interface AnthropicModelClientOptions {
  client?: Pick<Anthropic, 'messages'>;
  model?: string;
  maxTokens?: number;
}

export class AnthropicModelClient implements ModelClient {
  private readonly client: Pick<Anthropic, 'messages'>;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(options: AnthropicModelClientOptions = {}) {
    this.client = options.client ?? new Anthropic();
    this.model = options.model ?? process.env.AI_OPS_MODEL ?? 'claude-opus-5-5';
    this.maxTokens = options.maxTokens ?? 16000;
  }

  async generate(request: ModelRequest): Promise<ModelTurn> {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        system: request.system,
        tools: request.tools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
        })),
        messages: request.messages.map(toAnthropicMessage),
      },
      { signal: request.signal },
    );

    return {
      providerContent: response.content,
      text: response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join(''),
      toolCalls: response.content.flatMap((b) =>
        b.type === 'tool_use' ? [{ id: b.id, name: b.name, input: b.input }] : [],
      ),
      stopReason: STOP_REASONS[response.stop_reason ?? ''] ?? 'end',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}

function toAnthropicMessage(message: ConversationMessage): Anthropic.MessageParam {
  switch (message.role) {
    case 'user':
      return { role: 'user', content: message.text };
    case 'assistant':
      return {
        role: 'assistant',
        content: message.providerContent as Anthropic.ContentBlockParam[],
      };
    case 'tool':
      return {
        role: 'user',
        content: message.results.map((r) => ({
          type: 'tool_result' as const,
          tool_use_id: r.callId,
          content: r.content,
          is_error: r.isError,
        })),
      };
  }
}
