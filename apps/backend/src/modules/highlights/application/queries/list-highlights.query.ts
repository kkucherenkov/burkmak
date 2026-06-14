export class ListHighlightsQuery {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
  ) {}
}
