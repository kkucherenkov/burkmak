/**
 * Dev-only runtime shape check for API responses.
 *
 * We don't ship a full schema validator (zod / valibot) on the hot path — the
 * typed client from `@app/specs` is already the source of truth and
 * `express-openapi-validator` enforces the contract on the server. This
 * helper is a *development aid*: if the backend ever drifts from the spec
 * (e.g. a renamed field, a missing `nextCursor`), the affected page logs a
 * visible warning so the developer notices before it reaches a user.
 *
 * Usage:
 *
 *   const page = await api.listProviders(...);
 *   assertShape('listProviders', ['items', 'nextCursor'], page);
 *
 * In production the function is a no-op.
 */
export function assertShape(
  endpoint: string,
  expectedKeys: readonly string[],
  actual: unknown,
  requestId?: string,
): void {
  if (import.meta.env.PROD) return;

  if (actual === null || typeof actual !== 'object') {
    console.warn(
      `[api:${endpoint}] expected object response, got ${actual === null ? 'null' : typeof actual}`,
      requestId ? { requestId } : {},
    );
    return;
  }

  const record = actual as Record<string, unknown>;
  const missing = expectedKeys.filter((k) => !(k in record));
  if (missing.length > 0) {
    console.warn(
      `[api:${endpoint}] response is missing expected keys: ${missing.join(', ')}`,
      requestId ? { requestId } : {},
    );
  }
}
