import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class FindRolesDto {
  @IsOptional()
  skip?: number | undefined;

  @IsOptional()
  take?: number | undefined;

  @IsOptional()
  cursor?: Prisma.RolesWhereUniqueInput | undefined;

  @IsOptional()
  where?: Prisma.RolesWhereInput | undefined;

  @IsOptional()
  orderBy?: Prisma.RolesOrderByWithRelationInput | undefined;

  @IsOptional()
  include?: any;
}
