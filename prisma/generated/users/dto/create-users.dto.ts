import { IsDefined, IsEmail, IsString, Allow } from 'class-validator';
import { PrismaNested } from './prisma-nested.dto';

export class CreateUsersDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  phash: string | null;

  @Allow()
  createdBy: string;

  @Allow()
  updatedBy: string;

  @Allow()
  createdAt: Date;

  @Allow()
  updatedAt: Date;

  @Allow()
  roles?: PrismaNested;

  @Allow()
  permissions?: PrismaNested;
}
