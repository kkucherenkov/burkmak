export class SaveItemCommand {
  constructor(
    public readonly userId: string,
    public readonly url: string,
  ) {}
}
