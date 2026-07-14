import { IsArray, IsIn, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class SaveItemDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['article', 'bookmark'])
  kind?: 'article' | 'bookmark';
}
