export class DeleteItemCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
