import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function jsonResult(data: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data ?? { ok: true }, null, 2) }],
  };
}

export function errorResult(err: unknown): CallToolResult {
  const message = err instanceof Error ? err.message : String(err);
  return { isError: true, content: [{ type: 'text', text: message }] };
}

export async function run(fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return jsonResult(await fn());
  } catch (err) {
    return errorResult(err);
  }
}

/**
 * Cognito sub of the acting user — mutations that record authorship
 * (creatorId/idUser/userId) need it since there is no JWT on stdio.
 */
export function requireUserId(): string {
  const id = process.env.MCP_USER_ID;
  if (!id) {
    throw new Error(
      'MCP_USER_ID não definido. Configure a variável de ambiente com o Cognito sub do usuário que assina as ações do MCP.',
    );
  }
  return id;
}
