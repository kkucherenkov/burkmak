import { IsString, Length } from 'class-validator';

export class RenameShelfDto {
  @IsString()
  @Length(1, 80)
  name!: string;
}
