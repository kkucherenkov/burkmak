export class RemoveShelfItemCommand {
  constructor(
    public readonly userId: string,
    public readonly shelfId: string,
    public readonly itemId: string,
  ) {}
}
