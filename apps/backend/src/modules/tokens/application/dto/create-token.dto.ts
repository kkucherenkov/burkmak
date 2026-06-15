import { IsString, Length } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @Length(1, 100)
  name!: string;
}
