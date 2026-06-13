export class AddItemTagCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly tag: string,
  ) {}
}
