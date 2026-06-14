export class GetArticleQuery {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
  ) {}
}
