import { getOrderTool } from '../../../src/tools/get-order.tool.js';

describe('get_order', () => {
  it('returns the order when found', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'ord_1', status: 'CANCELLED' }] });
    const result = await getOrderTool({ query }).handler({ orderId: 'ord_1' });
    expect(result).toEqual({ found: true, order: { id: 'ord_1', status: 'CANCELLED' } });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM orders'), ['ord_1']);
  });

  it('reports found: false instead of throwing when missing', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    expect(await getOrderTool({ query }).handler({ orderId: 'nope' })).toEqual({ found: false });
  });
});
