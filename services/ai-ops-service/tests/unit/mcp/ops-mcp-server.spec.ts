import { z } from 'zod';
import { connectInMemoryClient, createOpsMcpServer } from '../../../src/mcp/ops-mcp-server.js';
import { defineTool } from '../../../src/tools/ops-tool.js';

const echo = defineTool({
  name: 'echo',
  description: 'Echoes n',
  inputSchema: { n: z.number() },
  handler: async ({ n }) => ({ n }),
});
const boom = defineTool({
  name: 'boom',
  description: 'Always fails',
  inputSchema: {},
  handler: async () => {
    throw new Error('db down');
  },
});

describe('ops MCP server', () => {
  it('lists the registered tools and returns handler results as JSON text', async () => {
    const client = await connectInMemoryClient(createOpsMcpServer([echo, boom]));

    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['boom', 'echo']);

    const res = await client.callTool({ name: 'echo', arguments: { n: 7 } });
    expect(res.content).toEqual([{ type: 'text', text: '{"n":7}' }]);
  });

  it('turns handler errors into isError results without leaking a stack', async () => {
    const client = await connectInMemoryClient(createOpsMcpServer([boom]));
    const res = await client.callTool({ name: 'boom', arguments: {} });
    expect(res).toMatchObject({ isError: true, content: [{ type: 'text', text: 'db down' }] });
  });

  it('rejects arguments that fail the tool schema', async () => {
    const client = await connectInMemoryClient(createOpsMcpServer([echo]));
    const res = await client.callTool({ name: 'echo', arguments: { n: 'x' } }).catch((e) => e);
    expect(res instanceof Error || (res as { isError?: boolean }).isError).toBeTruthy();
  });
});
