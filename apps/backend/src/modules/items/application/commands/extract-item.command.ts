export class ExtractItemCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
  ) {}
}
