export class DeleteTagCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
