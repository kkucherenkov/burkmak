/**
 * WHY this file exists:
 * A Command is a plain data object — no methods, no dependencies. It is the
 * input contract between the controller and the command handler. Keep it flat;
 * complex validation belongs in the DTO (class-validator) before dispatch.
 */
export class CreateTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
  ) {}
}
