import {
  diagnosisSchema,
  SUBMIT_DIAGNOSIS_TOOL,
  submitDiagnosisSpec,
  type Diagnosis,
} from './diagnosis.schema.js';
import type { ConversationMessage, ModelClient, ToolResult } from './model-client.js';
import { NUDGE_PROMPT, SYSTEM_PROMPT, userPrompt } from './prompts.js';
import type { ToolHost } from './tool-host.js';

export interface AgentLimits {
  maxTurns: number;
  maxTotalTokens: number;
  timeoutMs: number;
}

export const DEFAULT_LIMITS: AgentLimits = {
  maxTurns: 8,
  maxTotalTokens: 60_000,
  timeoutMs: 90_000,
};

export interface RunStats {
  turns: number;
  toolCalls: string[];
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export type FailureReason =
  | 'max_turns'
  | 'token_budget'
  | 'timeout'
  | 'no_diagnosis'
  | 'refused'
  | 'truncated'
  | 'model_error';

export type AgentResult =
  | { status: 'completed'; diagnosis: Diagnosis; stats: RunStats }
  | { status: 'failed'; reason: FailureReason; detail?: string; stats: RunStats };

export interface RunDiagnosisParams {
  model: ModelClient;
  tools: ToolHost;
  orderId: string;
  limits?: AgentLimits;
}

export async function runDiagnosisAgent({
  model,
  tools,
  orderId,
  limits = DEFAULT_LIMITS,
}: RunDiagnosisParams): Promise<AgentResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), limits.timeoutMs);
  const stats = { turns: 0, toolCalls: [] as string[], inputTokens: 0, outputTokens: 0 };
  const fail = (reason: FailureReason, detail?: string): AgentResult => ({
    status: 'failed',
    reason,
    detail,
    stats: { ...stats, durationMs: Date.now() - startedAt },
  });

  try {
    const specs = [...(await tools.list()), submitDiagnosisSpec];
    const messages: ConversationMessage[] = [{ role: 'user', text: userPrompt(orderId) }];
    let nudged = false;

    while (stats.turns < limits.maxTurns) {
      if (controller.signal.aborted) return fail('timeout');
      stats.turns++;

      let turn;
      try {
        turn = await model.generate({
          system: SYSTEM_PROMPT,
          tools: specs,
          messages,
          signal: controller.signal,
        });
      } catch (error) {
        return fail(
          controller.signal.aborted ? 'timeout' : 'model_error',
          (error as Error).message,
        );
      }
      stats.inputTokens += turn.usage.inputTokens;
      stats.outputTokens += turn.usage.outputTokens;

      if (turn.stopReason === 'refused') return fail('refused');
      if (turn.stopReason === 'truncated') return fail('truncated');

      messages.push({ role: 'assistant', providerContent: turn.providerContent });

      if (turn.toolCalls.length === 0) {
        if (nudged) return fail('no_diagnosis');
        nudged = true;
        messages.push({ role: 'user', text: NUDGE_PROMPT });
        continue;
      }

      const results: ToolResult[] = [];
      for (const call of turn.toolCalls) {
        if (call.name === SUBMIT_DIAGNOSIS_TOOL) {
          const parsed = diagnosisSchema.safeParse(call.input);
          if (parsed.success) {
            return {
              status: 'completed',
              diagnosis: parsed.data,
              stats: { ...stats, durationMs: Date.now() - startedAt },
            };
          }
          results.push({
            callId: call.id,
            content: `Invalid diagnosis: ${parsed.error.message}`,
            isError: true,
          });
          continue;
        }
        stats.toolCalls.push(call.name);
        try {
          const out = await tools.call(call.name, call.input);
          results.push({ callId: call.id, ...out });
        } catch (error) {
          results.push({ callId: call.id, content: (error as Error).message, isError: true });
        }
      }
      messages.push({ role: 'tool', results });

      if (stats.inputTokens + stats.outputTokens >= limits.maxTotalTokens)
        return fail('token_budget');
    }
    return fail('max_turns');
  } catch (error) {
    return fail('model_error', (error as Error).message);
  } finally {
    clearTimeout(timer);
  }
}
