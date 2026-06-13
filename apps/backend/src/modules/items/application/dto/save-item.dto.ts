import { IsUrl } from 'class-validator';

export class SaveItemDto {
  @IsUrl({ require_protocol: true })
  url!: string;
}
