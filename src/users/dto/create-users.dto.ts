import { IsDefined, IsEmail, IsString, Allow } from 'class-validator';
import { PrismaNestedLimited } from './prisma-nested.dto';

export class CreateUsersDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  phash: string | null;

  @Allow()
  roles?: PrismaNestedLimited;

  @Allow()
  permissions?: PrismaNestedLimited;
}
