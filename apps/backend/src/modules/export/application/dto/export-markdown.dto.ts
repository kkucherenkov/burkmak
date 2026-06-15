import { IsBooleanString, IsIn, IsISO8601, IsOptional } from 'class-validator';

export class ExportMarkdownDto {
  @IsOptional()
  @IsIn(['unread', 'read', 'archived'])
  readState?: 'unread' | 'read' | 'archived';

  /** ISO 8601 datetime string — items saved since this point. */
  @IsOptional()
  @IsISO8601()
  since?: string;

  /** If "true", include items with zero highlights. Default: false. */
  @IsOptional()
  @IsBooleanString()
  includeEmpty?: string;
}
