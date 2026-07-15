export class DeleteShelfCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
