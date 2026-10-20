import { z } from 'zod';
import { mcpToolHost } from '../../../src/agent/tool-host.js';
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
  description: 'fails',
  inputSchema: {},
  handler: async () => {
    throw new Error('db down');
  },
});

describe('mcpToolHost', () => {
  it('lists tools with JSON Schema and calls them through MCP', async () => {
    const host = mcpToolHost(await connectInMemoryClient(createOpsMcpServer([echo, boom])));

    const specs = await host.list();
    expect(specs.find((s) => s.name === 'echo')).toMatchObject({
      description: 'Echoes n',
      inputSchema: { type: 'object', properties: { n: { type: 'number' } } },
    });
    expect(await host.call('echo', { n: 3 })).toEqual({ content: '{"n":3}', isError: false });
    expect(await host.call('boom', {})).toEqual({ content: 'db down', isError: true });
  });
});
