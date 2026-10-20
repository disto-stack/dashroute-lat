import { getRecentDispatchFailuresTool } from '../../../src/tools/get-recent-dispatch-failures.tool.js';

describe('get_recent_dispatch_failures', () => {
  it('converts bigint counts from pg to numbers', async () => {
    const lastFailureAt = new Date('2026-10-17T10:00:00Z');
    const query = vi.fn().mockResolvedValue({
      rows: [{ orders_created: '12', dispatch_failures: '5', last_failure_at: lastFailureAt }],
    });

    const result = await getRecentDispatchFailuresTool({ query }).handler({ windowMinutes: 30 });

    expect(result).toEqual({
      windowMinutes: 30,
      ordersCreated: 12,
      dispatchFailures: 5,
      lastFailureAt,
    });
    expect(query).toHaveBeenCalledWith(expect.any(String), [30]);
  });
});
