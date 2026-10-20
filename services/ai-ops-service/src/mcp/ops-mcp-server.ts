import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShape } from 'zod';
import type { OpsTool } from '../tools/ops-tool.js';

export function createOpsMcpServer(tools: OpsTool<any>[]): McpServer {
  const server = new McpServer({ name: 'dashroute-ai-ops', version: '0.0.1' });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema as ZodRawShape },
      async (args: Record<string, unknown>) => {
        try {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(await tool.handler(args)) }],
          };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: 'text' as const, text: (error as Error).message }],
          };
        }
      },
    );
  }
  return server;
}

export async function connectInMemoryClient(server: McpServer): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'ai-ops-agent', version: '0.0.1' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}
