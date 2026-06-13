export class RemoveItemTagCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly tagSlug: string,
  ) {}
}
