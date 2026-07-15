export class CreateShelfCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}
