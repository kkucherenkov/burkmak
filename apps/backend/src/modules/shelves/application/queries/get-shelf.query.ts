export class GetShelfQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
