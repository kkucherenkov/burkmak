export class DeleteHighlightCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
