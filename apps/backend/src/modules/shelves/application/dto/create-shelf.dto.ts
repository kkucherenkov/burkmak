import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateShelfDto {
  // Trim before validating: `@Length(1, 80)` alone lets " " through as a
  // whitespace-only name, and "a" vs "a " would collide only in intent, not in
  // stored bytes — `@@unique([userId, name])` would happily create both.
  // Typed as `unknown` (not TransformFnParams's `any`) so the ternary's
  // return type stays `unknown` rather than collapsing to `any`.
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  name!: string;
}
