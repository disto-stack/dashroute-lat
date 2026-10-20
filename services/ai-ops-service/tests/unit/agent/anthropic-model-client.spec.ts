import { AnthropicModelClient } from '../../../src/agent/anthropic-model-client.js';

const fakeSdk = (response: unknown) => {
  const create = vi.fn().mockResolvedValue(response);
  return { create, client: { messages: { create } } as never };
};
const base = {
  system: 'sys',
  tools: [{ name: 't', description: 'd', inputSchema: { type: 'object' } }],
};

describe('AnthropicModelClient', () => {
  it('maps the neutral conversation to Anthropic messages and tools', async () => {
    const { create, client } = fakeSdk({
      content: [{ type: 'text', text: 'hi' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });
    const signal = new AbortController().signal;
    const assistantBlocks = [{ type: 'tool_use', id: 'x', name: 't', input: {} }];

    await new AnthropicModelClient({ client, model: 'm' }).generate({
      ...base,
      signal,
      messages: [
        { role: 'user', text: 'go' },
        { role: 'assistant', providerContent: assistantBlocks },
        { role: 'tool', results: [{ callId: 'x', content: 'ok', isError: false }] },
      ],
    });

    const [body, opts] = create.mock.calls[0];
    expect(body).toMatchObject({
      model: 'm',
      system: 'sys',
      tools: [{ name: 't', description: 'd', input_schema: { type: 'object' } }],
      messages: [
        { role: 'user', content: 'go' },
        { role: 'assistant', content: assistantBlocks },
        {
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok', is_error: false }],
        },
      ],
    });
    expect(opts).toEqual({ signal });
  });

  it('extracts tool calls, text and usage, keeping the raw content for replay', async () => {
    const content = [
      { type: 'thinking', thinking: '' },
      { type: 'text', text: 'checking' },
      { type: 'tool_use', id: 'x', name: 'get_order', input: { orderId: 'o' } },
    ];
    const { client } = fakeSdk({
      content,
      stop_reason: 'tool_use',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const turn = await new AnthropicModelClient({ client }).generate({ ...base, messages: [] });

    expect(turn).toEqual({
      providerContent: content,
      text: 'checking',
      toolCalls: [{ id: 'x', name: 'get_order', input: { orderId: 'o' } }],
      stopReason: 'tool_use',
      usage: { inputTokens: 10, outputTokens: 5 },
    });
  });

  it.each([
    ['max_tokens', 'truncated'],
    ['refusal', 'refused'],
    ['end_turn', 'end'],
  ])('maps stop_reason %s to %s', async (stop_reason, expected) => {
    const { client } = fakeSdk({
      content: [],
      stop_reason,
      usage: { input_tokens: 1, output_tokens: 1 },
    });
    const turn = await new AnthropicModelClient({ client }).generate({ ...base, messages: [] });
    expect(turn.stopReason).toBe(expected);
  });
});
