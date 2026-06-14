import { IsIn, IsOptional, IsString } from 'class-validator';

const VALID_COLORS = ['yellow', 'green', 'blue', 'pink'] as const;

/**
 * At least one of `note` or `color` must be present.
 * express-openapi-validator enforces the OpenAPI `minProperties: 1` constraint at
 * the HTTP layer; class-validator handles field-level type/format checks.
 */
export class UpdateHighlightDto {
  @IsOptional()
  @IsString()
  note?: string | null;

  @IsOptional()
  @IsIn(VALID_COLORS)
  color?: string;
}
