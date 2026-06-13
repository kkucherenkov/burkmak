/**
 * WHY this file exists:
 * A Query is a plain data object representing a read-side request. Keeping it
 * separate from the Command makes the read/write split explicit and allows
 * read models to diverge from write models without friction.
 */
export class GetTemplateQuery {
  constructor(public readonly id: string) {}
}
