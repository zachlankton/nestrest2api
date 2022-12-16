import { PartialType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDefined } from 'class-validator';
import { CreateUsersDto } from './create-users.dto';

export class PartialCreateUsersDto extends PartialType(CreateUsersDto) {}

export class UpdateUsersDto {
  @IsDefined()
  where: Prisma.UsersWhereUniqueInput;

  @IsDefined()
  data: PartialCreateUsersDto;
}
