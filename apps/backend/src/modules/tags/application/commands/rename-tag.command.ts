export class RenameTagCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly name: string,
  ) {}
}
