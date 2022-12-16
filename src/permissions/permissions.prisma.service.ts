import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { Permissions } from './entities/permissions.entity';
import { CreatePermissionsDto } from './dto/create-permissions.dto';
import { PartialCreatePermissionsDto } from './dto/update-permissions.dto';

@Injectable()
export class PermissionsServicePrisma {
  constructor(private prisma: PrismaService) {}

  async getSinglePermissions(
    userWhereUniqueInput: Prisma.PermissionsWhereUniqueInput,
    include?: any,
  ): Promise<Permissions | null> {
    return this.prisma.permissions.findUnique({
      where: userWhereUniqueInput,
      include,
    });
  }

  async findPermissions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PermissionsWhereUniqueInput;
    where?: Prisma.PermissionsWhereInput;
    orderBy?: Prisma.PermissionsOrderByWithRelationInput;
    include?: any;
  }): Promise<Permissions[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.permissions.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async createPermissions(data: CreatePermissionsDto): Promise<Permissions> {
    return this.prisma.permissions.create({
      data,
    });
  }

  async updatePermissions(params: {
    where: Prisma.PermissionsWhereUniqueInput;
    data: PartialCreatePermissionsDto;
  }): Promise<Permissions> {
    const { where, data } = params;
    return this.prisma.permissions.update({
      data,
      where,
    });
  }

  async deletePermissions(
    where: Prisma.PermissionsWhereUniqueInput,
  ): Promise<Permissions> {
    return this.prisma.permissions.delete({
      where,
    });
  }
}
