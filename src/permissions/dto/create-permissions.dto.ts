import { IsDefined, IsString, Allow } from 'class-validator';
import { PrismaNested } from './prisma-nested.dto';

export class CreatePermissionsDto {
  @IsDefined()
  @IsString()
  permission: string;

  @Allow()
  roles?: PrismaNested;

  @Allow()
  users?: PrismaNested;
}
