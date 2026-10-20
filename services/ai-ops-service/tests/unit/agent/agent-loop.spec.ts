import { runDiagnosisAgent } from '../../../src/agent/agent-loop.js';
import type { ModelClient, ModelRequest, ModelTurn } from '../../../src/agent/model-client.js';
import type { ToolHost } from '../../../src/agent/tool-host.js';

const usage = { inputTokens: 100, outputTokens: 50 };
const toolTurn = (...calls: { id: string; name: string; input?: unknown }[]): ModelTurn => ({
  providerContent: calls,
  text: '',
  toolCalls: calls.map((c) => ({ ...c, input: c.input ?? {} })),
  stopReason: 'tool_use',
  usage,
});
const endTurn = (): ModelTurn => ({
  providerContent: [],
  text: 'done',
  toolCalls: [],
  stopReason: 'end',
  usage,
});
const validDiagnosis = {
  category: 'COURIERS_LOCKED',
  summary: 'The only nearby courier was locked.',
  evidence: ['c1 locked for 18s'],
  confidence: 'medium',
};

const scripted = (turns: ModelTurn[]) => {
  const requests: ModelRequest[] = [];
  const model: ModelClient = {
    generate: vi.fn(async (req) => {
      // Snapshot: the loop keeps mutating the same messages array.
      requests.push({ ...req, messages: [...req.messages] });
      const next = turns.shift();
      if (!next) throw new Error('script exhausted');
      return next;
    }),
  };
  return { model, requests };
};

const tools = (call?: ToolHost['call']): ToolHost => ({
  list: async () => [{ name: 'get_order', description: 'd', inputSchema: { type: 'object' } }],
  call: call ?? vi.fn(async () => ({ content: '{"found":true}', isError: false })),
});

describe('runDiagnosisAgent', () => {
  it('runs tools then completes when submit_diagnosis validates', async () => {
    const { model, requests } = scripted([
      toolTurn({ id: 't1', name: 'get_order', input: { orderId: 'ord_1' } }),
      toolTurn({ id: 't2', name: 'submit_diagnosis', input: validDiagnosis }),
    ]);
    const host = tools();

    const result = await runDiagnosisAgent({ model, tools: host, orderId: 'ord_1' });

    expect(result).toMatchObject({
      status: 'completed',
      diagnosis: validDiagnosis,
      stats: { turns: 2, toolCalls: ['get_order'], inputTokens: 200, outputTokens: 100 },
    });
    expect(host.call).toHaveBeenCalledWith('get_order', { orderId: 'ord_1' });
    // submit_diagnosis is offered to the model alongside the host tools
    expect(requests[0].tools.map((t) => t.name)).toEqual(['get_order', 'submit_diagnosis']);
    // second request carries the tool result back
    expect(requests[1].messages.at(-1)).toEqual({
      role: 'tool',
      results: [{ callId: 't1', content: '{"found":true}', isError: false }],
    });
  });

  it('returns all parallel tool results in a single tool message', async () => {
    const { model, requests } = scripted([
      toolTurn({ id: 'a', name: 'get_order' }, { id: 'b', name: 'get_order' }),
      toolTurn({ id: 'c', name: 'submit_diagnosis', input: validDiagnosis }),
    ]);
    await runDiagnosisAgent({ model, tools: tools(), orderId: 'ord_1' });
    const last = requests[1].messages.at(-1);
    expect(last).toMatchObject({ role: 'tool' });
    expect((last as { results: unknown[] }).results).toHaveLength(2);
  });

  it('feeds schema errors back so the model can retry', async () => {
    const { model, requests } = scripted([
      toolTurn({ id: 's1', name: 'submit_diagnosis', input: { category: 'NOPE' } }),
      toolTurn({ id: 's2', name: 'submit_diagnosis', input: validDiagnosis }),
    ]);
    const result = await runDiagnosisAgent({ model, tools: tools(), orderId: 'ord_1' });
    expect(result.status).toBe('completed');
    const fed = requests[1].messages.at(-1) as { results: { isError: boolean; content: string }[] };
    expect(fed.results[0]).toMatchObject({ callId: 's1', isError: true });
    expect(fed.results[0].content).toContain('Invalid diagnosis');
  });

  it('reports tool exceptions to the model instead of crashing', async () => {
    const { model, requests } = scripted([
      toolTurn({ id: 't1', name: 'get_order' }),
      toolTurn({ id: 't2', name: 'submit_diagnosis', input: validDiagnosis }),
    ]);
    const host = tools(async () => {
      throw new Error('pool closed');
    });
    expect((await runDiagnosisAgent({ model, tools: host, orderId: 'o' })).status).toBe(
      'completed',
    );
    const fed = requests[1].messages.at(-1) as { results: unknown[] };
    expect(fed.results[0]).toEqual({ callId: 't1', content: 'pool closed', isError: true });
  });

  it('nudges once when the model stops without submitting, then fails', async () => {
    const { model, requests } = scripted([endTurn(), endTurn()]);
    const result = await runDiagnosisAgent({ model, tools: tools(), orderId: 'o' });
    expect(result).toMatchObject({ status: 'failed', reason: 'no_diagnosis' });
    expect(requests[1].messages.at(-1)).toMatchObject({ role: 'user' });
  });

  it('accepts a diagnosis submitted right after the nudge', async () => {
    const { model } = scripted([
      endTurn(),
      toolTurn({ id: 's', name: 'submit_diagnosis', input: validDiagnosis }),
    ]);
    expect((await runDiagnosisAgent({ model, tools: tools(), orderId: 'o' })).status).toBe(
      'completed',
    );
  });

  it('stops at maxTurns', async () => {
    const { model } = scripted(
      Array.from({ length: 5 }, (_, i) => toolTurn({ id: `t${i}`, name: 'get_order' })),
    );
    const result = await runDiagnosisAgent({
      model,
      tools: tools(),
      orderId: 'o',
      limits: { maxTurns: 3, maxTotalTokens: 1_000_000, timeoutMs: 5000 },
    });
    expect(result).toMatchObject({ status: 'failed', reason: 'max_turns', stats: { turns: 3 } });
  });

  it('stops when the token budget is spent', async () => {
    const { model } = scripted(
      Array.from({ length: 5 }, (_, i) => toolTurn({ id: `t${i}`, name: 'get_order' })),
    );
    const result = await runDiagnosisAgent({
      model,
      tools: tools(),
      orderId: 'o',
      limits: { maxTurns: 10, maxTotalTokens: 300, timeoutMs: 5000 },
    });
    expect(result).toMatchObject({ status: 'failed', reason: 'token_budget', stats: { turns: 2 } });
  });

  it('aborts a hung model call on timeout', async () => {
    const model: ModelClient = {
      generate: ({ signal }) =>
        new Promise((_, reject) =>
          signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    };
    const result = await runDiagnosisAgent({
      model,
      tools: tools(),
      orderId: 'o',
      limits: { maxTurns: 3, maxTotalTokens: 1000, timeoutMs: 20 },
    });
    expect(result).toMatchObject({ status: 'failed', reason: 'timeout' });
  });

  it.each([
    ['refused', 'refused'],
    ['truncated', 'truncated'],
  ] as const)('maps a %s turn to a failed result', async (stopReason, reason) => {
    const { model } = scripted([{ ...endTurn(), stopReason }]);
    expect(await runDiagnosisAgent({ model, tools: tools(), orderId: 'o' })).toMatchObject({
      status: 'failed',
      reason,
    });
  });

  it('reports model errors without throwing', async () => {
    const model: ModelClient = {
      generate: async () => {
        throw new Error('529 overloaded');
      },
    };
    expect(await runDiagnosisAgent({ model, tools: tools(), orderId: 'o' })).toMatchObject({
      status: 'failed',
      reason: 'model_error',
      detail: '529 overloaded',
    });
  });
});
