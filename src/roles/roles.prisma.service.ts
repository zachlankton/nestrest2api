import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { Roles } from './entities/roles.entity';
import { CreateRolesDto } from './dto/create-roles.dto';
import { PartialCreateRolesDto } from './dto/update-roles.dto';

@Injectable()
export class RolesServicePrisma {
  constructor(private prisma: PrismaService) {}

  async getSingleRoles(
    userWhereUniqueInput: Prisma.RolesWhereUniqueInput,
    include?: any,
  ): Promise<Roles | null> {
    return this.prisma.roles.findUnique({
      where: userWhereUniqueInput,
      include,
    });
  }

  async findRoles(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RolesWhereUniqueInput;
    where?: Prisma.RolesWhereInput;
    orderBy?: Prisma.RolesOrderByWithRelationInput;
    include?: any;
  }): Promise<Roles[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.roles.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async createRoles(data: CreateRolesDto): Promise<Roles> {
    return this.prisma.roles.create({
      data,
    });
  }

  async updateRoles(params: {
    where: Prisma.RolesWhereUniqueInput;
    data: PartialCreateRolesDto;
  }): Promise<Roles> {
    const { where, data } = params;
    return this.prisma.roles.update({
      data,
      where,
    });
  }

  async deleteRoles(where: Prisma.RolesWhereUniqueInput): Promise<Roles> {
    return this.prisma.roles.delete({
      where,
    });
  }
}
