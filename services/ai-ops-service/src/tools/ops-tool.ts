import type { ZodRawShape, z } from 'zod';

export interface OpsTool<S extends ZodRawShape = ZodRawShape> {
  name: string;
  description: string;
  inputSchema: S;
  handler: (args: z.objectOutputType<S, z.ZodTypeAny>) => Promise<unknown>;
}

export interface SqlQueryable {
  query<R = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: R[] }>;
}

export const defineTool = <S extends ZodRawShape>(tool: OpsTool<S>): OpsTool<S> => tool;
