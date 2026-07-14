export class UpdateItemCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly patch: {
      readState?: 'unread' | 'read' | 'archived';
      favorite?: boolean;
      kind?: 'article' | 'bookmark';
    },
  ) {}
}
