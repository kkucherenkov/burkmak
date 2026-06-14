export class CreateHighlightCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly quote: string,
    public readonly prefix: string,
    public readonly suffix: string,
    public readonly note: string | undefined,
    public readonly color: string | undefined,
  ) {}
}
