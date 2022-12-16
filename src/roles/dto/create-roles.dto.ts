import { IsDefined, IsString, Allow } from 'class-validator';
import { PrismaNested } from './prisma-nested.dto';

export class CreateRolesDto {
  @IsDefined()
  @IsString()
  role: string;

  @Allow()
  permissions?: PrismaNested;

  @Allow()
  users?: PrismaNested;
}
