export class SaveItemCommand {
  constructor(
    public readonly userId: string,
    public readonly url: string,
    public readonly tags: readonly string[] = [],
    public readonly kind: 'article' | 'bookmark' = 'article',
  ) {}
}
