import { IsString, Length } from 'class-validator';

export class CreateShelfDto {
  @IsString()
  @Length(1, 80)
  name!: string;
}
