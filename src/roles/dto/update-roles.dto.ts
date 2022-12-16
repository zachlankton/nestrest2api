import { PartialType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDefined } from 'class-validator';
import { CreateRolesDto } from './create-roles.dto';

export class PartialCreateRolesDto extends PartialType(CreateRolesDto) {}

export class UpdateRolesDto {
  @IsDefined()
  where: Prisma.RolesWhereUniqueInput;

  @IsDefined()
  data: PartialCreateRolesDto;
}
