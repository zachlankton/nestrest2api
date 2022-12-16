import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class FindPermissionsDto {
  @IsOptional()
  skip?: number | undefined;

  @IsOptional()
  take?: number | undefined;

  @IsOptional()
  cursor?: Prisma.PermissionsWhereUniqueInput | undefined;

  @IsOptional()
  where?: Prisma.PermissionsWhereInput | undefined;

  @IsOptional()
  orderBy?: Prisma.PermissionsOrderByWithRelationInput | undefined;

  @IsOptional()
  include?: any;
}
