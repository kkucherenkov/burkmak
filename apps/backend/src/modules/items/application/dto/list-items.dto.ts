import { IsBooleanString, IsIn, IsOptional, IsString } from 'class-validator';

export class ListItemsDto {
  @IsOptional()
  @IsIn(['unread', 'read', 'archived'])
  readState?: 'unread' | 'read' | 'archived';

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsBooleanString()
  favorite?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
