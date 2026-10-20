import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { ModelToolSpec } from './model-client.js';

export interface ToolHost {
  list(): Promise<ModelToolSpec[]>;
  call(name: string, args: unknown): Promise<{ content: string; isError: boolean }>;
}

export function mcpToolHost(client: Client): ToolHost {
  return {
    async list() {
      const { tools } = await client.listTools();
      return tools.map((t) => ({
        name: t.name,
        description: t.description ?? '',
        inputSchema: t.inputSchema as Record<string, unknown>,
      }));
    },
    async call(name, args) {
      const res = await client.callTool({ name, arguments: args as Record<string, unknown> });
      const content = (res.content as { type: string; text?: string }[])
        .map((c) => (c.type === 'text' ? c.text : ''))
        .join('');
      return { content, isError: res.isError === true };
    },
  };
}
