import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class FindUsersDto {
  @IsOptional()
  skip?: number | undefined;

  @IsOptional()
  take?: number | undefined;

  @IsOptional()
  cursor?: Prisma.UsersWhereUniqueInput | undefined;

  @IsOptional()
  where?: Prisma.UsersWhereInput | undefined;

  @IsOptional()
  orderBy?: Prisma.UsersOrderByWithRelationInput | undefined;

  @IsOptional()
  include?: any;
}
