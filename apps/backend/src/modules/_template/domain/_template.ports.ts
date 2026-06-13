/**
 * WHY this file exists:
 * Domain code must not depend on infrastructure (Prisma, Redis, HTTP clients).
 * Instead it depends on these port interfaces. Infrastructure adapters in
 * `../infra/` implement them and are registered by token in the NestJS module.
 *
 * Naming convention:
 *   - Token:  `TEMPLATE_REPO = Symbol('TEMPLATE_REPO')`
 *   - Port:   `ITemplateRepo` (interface)
 *   - Adapter: `TemplateRepo` class in `infra/template.repo.ts`
 *   - DI binding: `{ provide: TEMPLATE_REPO, useClass: TemplateRepo }`
 *
 * Handlers inject via `@Inject(TEMPLATE_REPO) private readonly repo: ITemplateRepo`.
 * Tests swap in a vi.fn() mock — no Prisma needed in unit tests.
 */

/** Injection token — use a Symbol so it is unique across the process. */
export const TEMPLATE_REPO = Symbol('TEMPLATE_REPO');

/** Minimal read model returned by list and detail queries. */
export interface TemplateSummary {
  id: string;
  name: string;
  createdAt: string;
}

/** Extended read model for the single-item detail query. */
export interface TemplateDetail extends TemplateSummary {
  description?: string;
}

/** Port interface — the only contract the domain and application layers see. */
export interface ITemplateRepo {
  /** Return null when no row matches `id`. */
  findById(id: string): Promise<TemplateDetail | null>;
  /** Cursor-paginated list. Always shape the SELECT to the use case. */
  findMany(opts: {
    cursor?: string;
    limit: number;
  }): Promise<{ items: TemplateSummary[]; nextCursor: string | null }>;
  /**
   * Persist a new resource and return its ID.
   * Commands call this and return only the ID — the caller issues a separate
   * GetTemplateQuery if the full read model is needed for the HTTP response.
   */
  create(data: { name: string; description?: string }): Promise<string>;
}
