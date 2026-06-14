export class UpdateHighlightCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly note: string | null | undefined,
    public readonly color: string | undefined,
  ) {}
}
