import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsIn(['unread', 'read', 'archived'])
  readState?: 'unread' | 'read' | 'archived';

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsIn(['article', 'bookmark'])
  kind?: 'article' | 'bookmark';
}
