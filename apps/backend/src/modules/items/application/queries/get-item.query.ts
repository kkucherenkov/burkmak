export class GetItemQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
