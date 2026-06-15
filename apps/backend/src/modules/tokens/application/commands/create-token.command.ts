export class CreateTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}
