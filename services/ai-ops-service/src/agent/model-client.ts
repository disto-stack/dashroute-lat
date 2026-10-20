export interface ModelToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResult {
  callId: string;
  content: string;
  isError: boolean;
}

export type ConversationMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; providerContent: unknown }
  | { role: 'tool'; results: ToolResult[] };

export type StopReason = 'tool_use' | 'end' | 'truncated' | 'refused';

export interface ModelTurn {
  providerContent: unknown;
  text: string;
  toolCalls: ToolCall[];
  stopReason: StopReason;
  usage: { inputTokens: number; outputTokens: number };
}

export interface ModelRequest {
  system: string;
  tools: ModelToolSpec[];
  messages: ConversationMessage[];
  signal?: AbortSignal;
}

export interface ModelClient {
  generate(request: ModelRequest): Promise<ModelTurn>;
}
