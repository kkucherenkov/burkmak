import { IsIn, IsOptional, IsString } from 'class-validator';

const VALID_COLORS = ['yellow', 'green', 'blue', 'pink'] as const;

export class CreateHighlightDto {
  @IsString()
  quote!: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsString()
  suffix?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsIn(VALID_COLORS)
  color?: string;
}
