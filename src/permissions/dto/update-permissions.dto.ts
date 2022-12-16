import { PartialType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDefined } from 'class-validator';
import { CreatePermissionsDto } from './create-permissions.dto';

export class PartialCreatePermissionsDto extends PartialType(
  CreatePermissionsDto,
) {}

export class UpdatePermissionsDto {
  @IsDefined()
  where: Prisma.PermissionsWhereUniqueInput;

  @IsDefined()
  data: PartialCreatePermissionsDto;
}
