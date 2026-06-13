import { IsString, Length } from 'class-validator';

export class AddTagDto {
  @IsString()
  @Length(1, 40)
  tag!: string;
}
