import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class RenameShelfDto {
  // Trim before validating — see CreateShelfDto for why and for the
  // `{ value: unknown }` param typing (avoids an any-typed return).
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  name!: string;
}
